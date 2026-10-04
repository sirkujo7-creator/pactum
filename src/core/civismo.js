// Árbol de civismo (fase 12, paso 1): las leyes se ordenan en tres ramas (derechos, economía y territorio), seis en
// cada una. Las nueve de siempre siguen igual; las diez nuevas (src/data/civismo.json) se desbloquean con puntos de
// civismo y algunas piden su época de la historia o una ley anterior. Promulgarlas sigue pidiendo cupo y oro.
// Sus efectos se suman en las cuentas de cada indicador con efectoLeyes(). Solo en el terreno en acuarela.
import { C } from './contenido.js';
import { clamp } from './azar.js';
import { climaActivo } from './clima.js';
import { counts, hasLaw, epocaHistorica } from './reglas.js';

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
  const v = P.base + P.escuela * c.escuela + P.biblioteca * c.biblioteca + P.agora * c.agora + P.universidad * c.universidad
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
  if (!civismoActivo(S) || !S.laws) return 0;
  const [k, sub] = clave.split('.');
  let v = 0;
  for (const l of C.LEYES_NUEVAS) {
    if (!hasLaw(S, l.id)) continue;
    const e = l.efectos[k];
    if (e === undefined) continue;
    v += sub ? (e[sub] || 0) : e;
  }
  return v;
}
// Costo anual de las leyes nuevas (por habitante y fijo), antes de multiplicar por S.price.
export function costoLeyesNuevas(S) { return efectoLeyes(S, 'costoHab') * S.pop + efectoLeyes(S, 'costoFijo'); }

// Cierre del año: suma los puntos de civismo.
export function civismoDelAnio(S) {
  if (!civismoActivo(S)) return [];
  const E = estado(S);
  E.p = clamp(Math.round((E.p + civismoAnual(S)) * 10) / 10, 0, 999);
  return [];
}
