// Explicaciones (claridad): por qué sube o baja cada indicador y el ánimo de cada clase.
// Repite las mismas cuentas de anio.js y sociedad.js, separadas por causa. Solo informa: no cambia el juego.
import { C } from './contenido.js';
import { counts, RM, hasLaw } from './reglas.js';
import { society, satTargets, partesAmbiente, calcHap } from './sociedad.js';
import { finance } from './hacienda.js';

const suma = L => L.reduce((s, x) => s + x[1], 0);
const limpio = L => L.filter(x => Math.abs(x[1]) >= .5).map(([t, v]) => [t, Math.round(v * 10) / 10]).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));

// Ánimo de una clase ('c', 'a' o 'e'): valor actual, meta y causas.
export function desgloseClase(S, k) {
  const T = satTargets(S, counts(S), !!S.hungry), partes = T.partes()[k], meta = Math.max(0, Math.min(100, T[k]));
  return { actual: S.sat[k], meta, partes: limpio(partes) };
}

// Indicador ('hap', 'eq', 'tr', 'env', 'corr'): valor actual, meta (o cambio por año) y causas.
export function desgloseIndicador(S, k) {
  const c = counts(S), L = x => hasLaw(S, x), ip = S.infl * 100;
  if (k === 'hap') {
    const so = society(S), P = Math.max(1, S.pop);
    const partes = [['Ánimo de los campesinos', so.camp * S.sat.c / P], ['Ánimo de artesanos y desempleados', (so.art + so.un) * S.sat.a / P], ['Ánimo de la élite', so.el * S.sat.e / P], ['Desempleo', -so.un / P * 15]];
    return { actual: S.hap, meta: calcHap(S, so), partes: limpio(partes), clases: true };
  }
  if (k === 'env') { const p = partesAmbiente(S, c); return { actual: S.env, meta: Math.max(0, Math.min(100, suma(p))), partes: limpio(p) }; }
  if (k === 'eq') {
    const F = finance(S), so = F.so, tot = (F.post.c + F.post.a + F.post.e + F.post.u) || 1, es = F.post.e / tot, ps = so.el / Math.max(1, so.P), sc = satTargets(S, c, false).sc;
    const p = [['Punto de partida', 85], ['Riqueza de la élite frente a su tamaño', -(es - ps) * 120], ['Escuelas', sc * 10], ['Universidades', c.universidad * 5], ['Régimen de gobierno', RM(S, 'eq')], ['Educación pública', L('educacion') ? 8 : 0], ['Censura', L('censura') ? -3 : 0]];
    return { actual: S.eq, meta: Math.max(0, Math.min(100, suma(p))), partes: limpio(p) };
  }
  if (k === 'tr') {
    const p = [['Punto de partida', 50], ['Régimen de gobierno', RM(S, 'tr')], ['Bienestar del pueblo', (S.hap - 50) * .4], ['Sede de gobierno (ágora)', c.agora * 10], ['Tesoro en rojo', S.gold < 0 ? -10 : 0],
      ['Inflación', -Math.max(0, ip - 3) * .8], ['Censura', L('censura') ? 6 : 0], ['Libertad de prensa', L('prensa') ? -3 : 0]];
    return { actual: S.tr, meta: Math.max(0, Math.min(100, suma(p))), partes: limpio(p), extra: 'Además: protestas (−5), promesas, emergencias, elecciones y dilemas la mueven de golpe.' };
  }
  if (k === 'corr') {
    const minSat = Math.min(S.sat.c, S.sat.a, S.sat.e);
    const p = [['Tendencia del régimen', RM(S, 'drift')], ['Censura', L('censura') ? 1.5 : 0], ['Libertad de prensa', L('prensa') ? -1.5 : 0], ['Alguna clase muy descontenta', minSat < 25 ? 3 : 0], ['Buen gobierno (todos contentos y legitimidad alta)', minSat > 50 && S.tr > 55 ? -2 : 0]];
    return { actual: S.corr, cambio: suma(p), partes: p.filter(x => x[1]).map(([t, v]) => [t, v]), extra: 'Además: sobornos y algunos dilemas lo mueven de golpe.' };
  }
  return null;
}
export function textoIndicador(k) { return C.IND[k]; }
