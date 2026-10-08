// Mejorar edificios por nivel (pedido de Juan, estilo Age of Empires): una obra terminada sube de nivel con oro y
// materiales y rinde más (más cupos en las casas, más renta en fincas, mercados, bancos, puertos, minas y talleres).
import { C } from './contenido.js';
import { materialesActivos, costoMat } from './materiales.js';

export const mejorasActivas = S => materialesActivos(S) && !!C.MEJ;
export const nivelMejora = x => (x && x.mj) || 0;
export const datosMejora = k => C.MEJ.tipos[k];
export const sePuedeMejorar = k => !!(C.MEJ && C.MEJ.tipos[k]);
// Multiplicador de renta de una obra mejorada (0 si no hay mejora).
export function mejoraRenta(x) { const T = C.MEJ && x && x.b && C.MEJ.tipos[x.b]; return T && T.renta ? T.renta * nivelMejora(x) : 0; }
// Cupos extra de vivienda de todas las casas mejoradas.
export function cuposMejora(S) { if (!C.MEJ || !S.mat) return 0; return S.map.reduce((n, x) => n + (x.b === 'casa' && !x.ob ? (C.MEJ.tipos.casa.cupos || 0) * nivelMejora(x) : 0), 0); }
export function costoMejora(S, i, costoOro) {
  const x = S.map[i], n = nivelMejora(x) + 1, M = C.MEJ, mat = {};
  for (const [m, v] of Object.entries(costoMat(S, x.b))) if (m !== 'alimento') mat[m] = Math.max(1, Math.ceil(v * M.factorMateriales * n));
  return { oro: Math.round(costoOro * M.factorOro * n), mat };
}
export function motivoMejoraObra(S, i, costoOro) {
  const x = S.map[i];
  if (!mejorasActivas(S) || !x.b || x.ob || !sePuedeMejorar(x.b)) return 'No se puede mejorar.';
  if (nivelMejora(x) >= C.MEJ.maximo) return C.MEJ.textos.maximo;
  const c = costoMejora(S, i, costoOro), f = [];
  if (S.gold < c.oro) f.push(`${c.oro - Math.floor(S.gold)} de oro`);
  for (const [m, n] of Object.entries(c.mat)) if ((S.mat[m] || 0) < n) f.push(`${n - Math.floor(S.mat[m] || 0)} de ${m}`);
  return f.length ? C.MEJ.textos.faltan.replace('{lista}', f.join(', ')) : '';
}
export function mejorarObra(S, i, costoOro) {
  if (motivoMejoraObra(S, i, costoOro)) return false;
  const c = costoMejora(S, i, costoOro), x = S.map[i];
  S.gold -= c.oro; for (const [m, n] of Object.entries(c.mat)) S.mat[m] -= n;
  x.mj = nivelMejora(x) + 1;
  return true;
}
