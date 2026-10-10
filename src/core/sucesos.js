// Sucesos sin decisión (fase 4): robos, atentados, incendios, brotes y abusos policiales llegan solos, según los
// indicadores (inseguridad, legitimidad, mantenimiento, hospitales, corrupción). Como mucho uno por año; no son
// crisis mayores. La inseguridad baja con empleo, igualdad, legitimidad y policía cerca. Solo en el terreno en acuarela.
import { C } from './contenido.js';
import { azar, clamp } from './azar.js';
import { counts } from './reglas.js';
import { climaActivo } from './clima.js';
import { society } from './sociedad.js';
import { cobertura } from './cobertura.js';
import { mantenimiento } from './desgaste.js';
import { movilizados } from './movimientos.js';
import { seguridad } from './ejercito.js';
import { efectoFig, reaccionar } from './figuras.js';
import { applyFx } from './dilemas.js';
import { efectoBarrios } from './barrios.js';
import { efectoTec } from './tecnologia.js';
import { epocaHistorica, hasLaw } from './reglas.js';
import { registrarMuertes, quemar, huellasActivas } from './huellas.js';
import { dejarMarca } from './marcas.js';

const K = () => C.SUCESOS;
export function sucesosActivos(S) { return climaActivo(S) && !!C.SUCESOS && S.stage >= K().desde.etapa; }

// Causas de la inseguridad: [texto, puntos].
export function partesInseguridad(S) {
  const I = K().inseguridad, so = society(S), c = counts(S), cob = cobertura(S), P = Math.max(1, so.P || S.pop);
  const pobres = Math.max(0, 45 - Math.min(S.sat.c, S.sat.a));
  return [['Punto de partida', I.base], ['Desempleo', so.un / P * I.desempleo], ['Desigualdad', Math.max(0, 50 - S.eq) * I.desigualdad],
    ['Poca legitimidad', Math.max(0, 50 - S.tr) * I.legitimidad], ['Pobreza (clases descontentas)', pobres * I.pobreza],
    ['Corrupción', Math.max(0, S.corr - 40) * I.corrupcion], ['Movimientos movilizados', movilizados(S).length * I.movilizados],
    ['Policía cerca de las casas', -cob.policia * I.policia * (c.policia > 0 ? 1 : 0)], ['Escuelas cerca de las casas', -cob.escuela * I.escuela * (c.escuela > 0 ? 1 : 0)],
    ['Parques', -Math.min(I.parqueMaximo, c.parque * I.parque)], ['Relación con la policía', efectoFig(S, 'inseguridad')], ['Ejército que da orden', seguridad(S) ? -I.ejercito : 0], ['Grupo armado en las veredas', S.conf && S.conf.grupo ? 6 : 0], ['Violencia en los barrios', efectoBarrios(S, 'inseguridad')], ['Rumores y desinformación (tecnología)', efectoTec(S, 'insegur')], ['Días de partido en el estadio', C.CULTURA ? c.estadio * C.CULTURA.estadioInseguridad : 0]];
}
export function inseguridad(S) { return sucesosActivos(S) ? clamp(partesInseguridad(S).reduce((s, x) => s + x[1], 0), 0, 100) : 0; }

// Probabilidad de cada suceso este año (0 si no se cumplen sus condiciones).
export function riesgos(S) {
  const Q = K().sucesos, ins = inseguridad(S), c = counts(S), cob = cobertura(S), r = {};
  const a = Q.atentado; r.atentado = ins >= a.minInseguridad && S.tr <= a.maxLegitimidad ? a.prob * (ins - a.minInseguridad + 10) / 50 : 0;
  const b = Q.robo; r.robo = ins >= b.minInseguridad && (c.mercado + c.banco + c.recaudo + c.taller) > 0 ? b.prob * ins / 100 : 0;
  const f = Q.incendio; r.incendio = f.prob + (S.clima.fenomeno === 'nino' ? f.probNino : 0) + (mantenimiento(S) < 60 ? f.probSinMantenimiento : 0);
  const e = Q.brote; r.brote = cob.hospital < e.maxHospital ? (e.prob * (1 - cob.hospital) + (S.env < 45 ? e.probAmbiente : 0)) * (1 - Math.min(.5, .15 * c.acueducto)) : 0; // fase 4: el acueducto reduce los brotes
  const p = Q.abuso; r.abuso = c.policia > 0 && S.corr >= p.minCorrupcion ? p.prob : 0;
  return r;
}

// Violencia que no se puede evitar del todo (pedido de Juan: partidas menos planas). Su probabilidad depende de la época y
// baja con policía, legitimidad, cuartel y leyes de paz, pero nunca por debajo del piso.
export function probViolencia(S) {
  const V = K().violencia, ep = epocaHistorica(S); if (!V || !ep) return 0;
  const c = counts(S), cob = cobertura(S), M = V.mitiga;
  let mit = (c.policia > 0 ? cob.policia * M.policia : 0) + (S.tr / 100) * M.legitimidad + (c.cuartel > 0 ? M.cuartel : 0);
  for (const [l, v] of Object.entries(M.leyes)) if (hasLaw(S, l)) mit += v;
  return (V.base[ep] || 0) * Math.max(V.piso, 1 - mit);
}
function violenciaDelAnio(S) {
  const V = K().violencia, ep = epocaHistorica(S); if (!V || !ep) return null;
  if (S.year - (S.violenciaUlt ?? -99) < V.aniosEntre || !(azar() < probViolencia(S))) return null;
  const L = Object.entries(K().sucesos).filter(([, q]) => q.violencia && q.epocas.includes(ep) && (!q.obras || S.map.some(x => q.obras.includes(x.b) && !x.ob)));
  if (!L.length) return null;
  let a = azar() * L.reduce((t, [, q]) => t + q.peso, 0), id = L[0][0];
  for (const [k, q] of L) { a -= q.peso; if (a < 0) { id = k; break; } }
  const q = K().sucesos[id], ev = { id, anio: S.year, nuevo: true, ins: Math.round(inseguridad(S)), texto: q.texto, fx: applyFx(S, q.fx) };
  if (q.obras) { // hecho en un edificio: se ve en el mapa («Ver dónde fue»)
    const cand = S.map.map((x, i) => i).filter(i => q.obras.includes(S.map[i].b) && !S.map[i].ob), i = cand[Math.floor(azar() * cand.length)], x = S.map[i];
    ev.obra = i; ev.texto = q.texto.replace('{obra}', C.B[x.b].a);
    if (q.dano) { x.u = Math.min(100, (x.u || 0) + q.dano); x.sin = S.year; }
  }
  S.suceso = ev; S.violenciaUlt = S.year; huellaSuceso(S, q, ev);
  if (q.muertes) registrarMuertes(S, q.muertes, 'violencia'); // los muertos piden sepultura y se ven en el cementerio
  S.log.unshift({ y: S.year, t: `${q.titulo}. ${ev.texto}` });
  return [`${q.icono} ${q.titulo}: ${ev.texto}`];
}
// Lo que el suceso deja en el mapa: hollín en la obra quemada y una marca (cruz del camino, retén, pancartas).
function huellaSuceso(S, q, ev) {
  if (q.quema && ev.obra !== undefined) quemar(S, [ev.obra]);
  if (q.epidemia && huellasActivas(S)) S.epiVis = S.year; // los enfermos se ven ir al hospital
  if (q.marca) { const i = dejarMarca(S, q.marca, `Año ${S.year}: ${q.titulo.toLowerCase()}.`); if (i >= 0) ev.marca = i; }
}
// Cierre del año: como mucho un suceso (se prueba del más grave al más leve). Devuelve las noticias.
export function sucesosDelAnio(S) {
  if (!sucesosActivos(S) || S.year < K().desde.anio) return [];
  const vio = violenciaDelAnio(S); if (vio) return vio;
  const R = riesgos(S), Q = K().sucesos;
  const ult = S.sucesosUlt || (S.sucesosUlt = {});
  for (const id of ['atentado', 'abuso', 'brote', 'incendio', 'robo']) {
    if (S.year - (ult[id] ?? -99) < (Q[id].aniosEntre || K().aniosEntreIguales)) continue; // no se repite seguido
    if (!(azar() < R[id])) continue;
    const q = Q[id], ev = { id, anio: S.year, nuevo: true, ins: Math.round(inseguridad(S)) };
    let texto = q.texto;
    if (q.obras) {
      const cand = S.map.map((x, i) => i).filter(i => q.obras.includes(S.map[i].b) && !S.map[i].ob);
      if (!cand.length) continue;
      const i = cand[Math.floor(azar() * cand.length)], x = S.map[i];
      ev.obra = i; texto = texto.replace('{obra}', C.B[x.b].a);
      if (q.dano) { x.u = Math.min(100, (x.u || 0) + q.dano); x.sin = S.year; }
    }
    const fx = { ...q.fx };
    if (q.oroFraccion) { const o = Math.round(clamp(S.gold * q.oroFraccion, q.oroMinimo, q.oroMaximo)); fx.t = (fx.t || 0) - o; texto = texto.replace('{oro}', o); }
    ev.fx = applyFx(S, fx);
    if (q.movimiento && S.mov && S.mov[q.movimiento]) S.mov[q.movimiento].f = clamp(S.mov[q.movimiento].f + q.fuerzaMovimiento, 0, 100);
    ev.texto = texto; S.suceso = ev; ult[id] = S.year; huellaSuceso(S, q, ev);
    if (id === 'abuso') reaccionar(S, 'abuso');
    return [`${q.icono} ${q.titulo}: ${texto}`];
  }
  return [];
}
