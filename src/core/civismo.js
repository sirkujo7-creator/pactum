// Árbol de civismo (fase 12, paso 1): las leyes se ordenan en tres ramas (derechos, economía y territorio), seis en
// cada una. Las nueve de siempre siguen igual; las diez nuevas (src/data/civismo.json) se desbloquean con puntos de
// civismo y algunas piden su época de la historia o una ley anterior. Promulgarlas sigue pidiendo cupo y oro.
// Sus efectos se suman en las cuentas de cada indicador con efectoLeyes(). Solo en el terreno en acuarela.
import { C } from './contenido.js';
import { clamp } from './azar.js';
import { climaActivo } from './clima.js';
import { counts, hasLaw, epocaHistorica } from './reglas.js';
import { dejarMarca } from './marcas.js';

const K = () => C.CIV;
export function civismoActivo(S) { return climaActivo(S) && !!C.CIV; }
// Todas las leyes que existen en esta partida (en la versión 9, solo las nueve de siempre).
export function todasLasLeyes(S) { return civismoActivo(S) ? [...C.LAWS, ...C.LEYES_NUEVAS] : C.LAWS; }
export function datosLey(id) { return C.LAWS.find(l => l.id === id) || (C.LEYES_NUEVAS || []).find(l => l.id === id); }
export function ramaDe(id) { const n = (C.LEYES_NUEVAS || []).find(l => l.id === id); return n ? n.rama : K().viejas[id] && K().viejas[id].rama; }
export function prosContras(id) { const n = (C.LEYES_NUEVAS || []).find(l => l.id === id); return n ? { pro: n.pro, contra: n.contra } : K().viejas[id] || {}; }
function estado(S) { if (!S.civ) S.civ = { p: 0, abiertas: {}, usadas: {} }; return S.civ; }
export function estadoCivismo(S) { return estado(S); }

// ---------- Puntos de civismo ----------
export function civismoAnual(S) {
  const P = K().puntos, c = counts(S);
  const v = efectoLeyes(S, 'civismo') + P.base + P.escuela * c.escuela + P.biblioteca * c.biblioteca + P.agora * c.agora + P.universidad * c.universidad
    + (hasLaw(S, 'prensa') ? P.prensa : 0) + (S.tr >= P.legitimidad.desde ? P.legitimidad.suma : 0);
  return Math.round(v * 10) / 10;
}

// ---------- Desbloquear una idea ----------
const idxEpoca = id => C.HIST ? C.HIST.epocas.findIndex(e => e.id === id) : -1;
// Lo que falta para poder desbloquear (o promulgar) una ley nueva, sin contar los puntos; '' si nada.
export function faltaRequisito(S, l) {
  const T = K().textos;
  if (l.st > S.stage) return T.desdeEtapa.replace('{etapa}', C.STAGES[l.st].n);
  if (l.epoca && C.HIST) {
    const a = epocaHistorica(S);
    if (idxEpoca(a) < idxEpoca(l.epoca)) return T.desdeEpoca.replace('{epoca}', C.HIST.epocas[idxEpoca(l.epoca)].nombre);
  }
  const usadas = estado(S).usadas, faltan = (l.requiere || []).filter(r => !usadas[r] && !hasLaw(S, r));
  if (faltan.length) return T.requiere.replace('{leyes}', faltan.map(r => datosLey(r).n.toLowerCase()).join(' y '));
  return '';
}
export function abierta(S, id) { const l = datosLey(id); return !l || !l.nueva || !!estado(S).abiertas[id]; }
export function puedeAbrir(S, id) {
  const l = datosLey(id);
  if (!civismoActivo(S) || !l || !l.nueva) return 'No hay nada que desbloquear.';
  if (abierta(S, id)) return 'Ya está desbloqueada.';
  const f = faltaRequisito(S, l); if (f) return f;
  const E = estado(S); if (E.p < l.civismo) return K().textos.faltanPuntos.replace('{n}', Math.ceil(l.civismo - E.p));
  return null;
}
export function abrirLey(S, id) {
  if (puedeAbrir(S, id)) return false;
  const E = estado(S), l = datosLey(id);
  E.p = Math.round((E.p - l.civismo) * 10) / 10; E.abiertas[id] = S.year;
  S.log.unshift({ y: S.year, t: K().textos.abierta.replace('{ley}', l.n) });
  return true;
}
// Leyes contrarias (prensa y censura): no pueden estar vigentes a la vez.
export function opuestaDe(id) { const p = K().opuestas.find(x => x.includes(id)); return p ? p.find(x => x !== id) : null; }
// Motivo por el que una ley nueva (o una contraria) no se puede promulgar; '' si nada. La usa lawBlock.
export function bloqueoCivismo(S, l) {
  if (!civismoActivo(S)) return '';
  const o = opuestaDe(l.id);
  if (o && hasLaw(S, o)) return K().textos.opuesta.replace('{ley}', datosLey(o).n);
  if (!l.nueva) return '';
  if (!abierta(S, l.id)) return K().textos.desbloquear.replace('{costo}', l.civismo) + '.';
  return faltaRequisito(S, l);
}
export function marcarUsada(S, id) { if (civismoActivo(S)) estado(S).usadas[id] = S.year; }

// ---------- Efectos de las leyes nuevas ----------
// Suma un efecto (p. ej. 'legitimidad', 'animo.c', 'grupos.terratenientes', 'consulta.prob') de las leyes vigentes.
export function efectoLeyes(S, clave) {
  if (!civismoActivo(S)) return 0;
  const [k, sub] = clave.split('.');
  let v = 0;
  const suma = efectos => { const e = efectos[k]; if (e !== undefined) v += sub ? (e[sub] || 0) : e; };
  for (const l of C.LEYES_NUEVAS) if (hasLaw(S, l.id)) suma(l.efectos);
  for (const r of rasgosElegidos(S)) suma(r.efectos); // paso 2: los rasgos del pueblo usan las mismas claves
  return v;
}
// Costo anual de las leyes nuevas (por habitante y fijo), antes de multiplicar por S.price.
export function costoLeyesNuevas(S) { return efectoLeyes(S, 'costoHab') * S.pop + efectoLeyes(S, 'costoFijo'); }

// Cierre del año: suma los puntos de civismo.
export function civismoDelAnio(S) {
  if (!civismoActivo(S)) return [];
  rasgosDelAnio(S);
  const E = estado(S);
  E.p = clamp(Math.round((E.p + civismoAnual(S)) * 10) / 10, 0, 999);
  return [];
}

// ---------- Paso 2: el rasgo cultural de cada época ----------
// Al empezar cada época de la historia se elige uno de tres rasgos (src/data/rasgos.json); se acumulan en S.rasgos
// ({ época: rasgo }) y sus efectos se suman con efectoLeyes().
export function rasgosActivos(S) { return civismoActivo(S) && !!C.RASGOS && !!epocaHistorica(S); }
export function opcionesRasgo(epoca) { return (C.RASGOS.epocas[epoca] || []); }
export function datosRasgo(id) { for (const L of Object.values(C.RASGOS.epocas)) { const r = L.find(x => x.id === id); if (r) return r; } return null; }
export function rasgosElegidos(S) {
  if (!S.rasgos || !C.RASGOS) return [];
  return Object.entries(S.rasgos).map(([ep, id]) => ({ epoca: ep, ...datosRasgo(id) })).filter(r => r.efectos);
}
export function rasgoPendiente(S) { const e = rasgosActivos(S) ? epocaHistorica(S) : null; return e && opcionesRasgo(e).length && !(S.rasgos && S.rasgos[e]) ? e : null; }
export function elegirRasgo(S, id) {
  const e = rasgoPendiente(S);
  if (!e || !opcionesRasgo(e).some(r => r.id === id)) return false;
  (S.rasgos = S.rasgos || {})[e] = id; S.rasgoEv = null;
  dejarMarca(S, 'estandarte', C.RASGOS.textos.marca.replace('{anio}', S.year).replace('{rasgo}', datosRasgo(id).nombre)); // paso 3: el estandarte en el mapa
  S.log.unshift({ y: S.year, t: C.RASGOS.textos.elegido.replace('{rasgo}', datosRasgo(id).nombre.toLowerCase()) });
  return true;
}
export function rasgosDelAnio(S) {
  const e = rasgoPendiente(S);
  if (e && !(S.rasgoEv && S.rasgoEv.epoca === e)) S.rasgoEv = { epoca: e, nuevo: true };
  return [];
}

// ---------- Paso 3: la cultura del pueblo ----------
// La fiesta del pueblo es la del rasgo más reciente que tenga fiesta propia (si no, la de siempre).
export function fiestaDelPueblo(S) {
  const L = rasgosElegidos(S).filter(r => r.fiesta), F = C.CULTURA && C.CULTURA.fiesta;
  const f = L.length ? L[L.length - 1].fiesta : null;
  return f ? { ...F, nombre: f.nombre, texto: f.texto, bono: F.bono + (f.bono || 0) } : F;
}
