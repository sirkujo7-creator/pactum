// El subsuelo (fase 17, paso 4): cada zona de montaña guarda un mineral principal y, a veces, uno secundario.
// Un estudio de suelos los revela y deja elegir qué extraer; sin estudio la mina explota lo que haya, a ciegas.
import { C } from './contenido.js';
import { lado } from './mundo.js';
import { materialesActivos } from './materiales.js';

export const subsueloActivo = S => materialesActivos(S) && !!C.MIN;
export const datosMineral = m => C.MIN.minerales[m];
export const listaMinerales = () => Object.keys(C.MIN.minerales);
// Hay un estudio de suelos terminado.
export const estudioHecho = S => subsueloActivo(S) && S.map.some(x => x.b === 'estudio' && !x.ob);
const hash = (a, b, c, d) => { let h = (a * 374761393 + b * 668265263 + c * 2147483647 + d * 1274126177) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
function elegir(pesos, u, sin) {
  const L = Object.entries(pesos).filter(([k]) => k !== sin), total = L.reduce((t, [, w]) => t + w, 0);
  let a = u * total; for (const [k, w] of L) { a -= w; if (a < 0) return k; }
  return L[L.length - 1][0];
}
// Los minerales de la zona (de 3×3 casillas) a la que pertenece la casilla i.
export function zonaMineral(S, i) {
  const N = lado(S), zr = Math.floor(Math.floor(i / N) / 3), zc = Math.floor((i % N) / 3), seed = S.seed || 0;
  const pesos = C.MIN.pesos[S.terr] || C.MIN.pesos.defecto;
  const principal = elegir(pesos, hash(seed, zr, zc, 1), null);
  return { principal, secundario: hash(seed, zr, zc, 3) < .5 ? elegir(pesos, hash(seed, zr, zc, 2), principal) : null };
}
export const mineralDe = (S, i) => { const x = S.map[i], z = zonaMineral(S, i); return x.mn && (x.mn === z.principal || x.mn === z.secundario) ? x.mn : z.principal; };
// Qué se puede extraer aquí: con estudio, el principal y el secundario; sin él, solo el principal.
export function opcionesMineral(S, i) { const z = zonaMineral(S, i); return estudioHecho(S) && z.secundario ? [z.principal, z.secundario] : [z.principal]; }
export function elegirMineral(S, i, m) { if (!opcionesMineral(S, i).includes(m) || S.map[i].b !== 'mina') return false; S.map[i].mn = m; return true; }
export const eficienciaMina = S => estudioHecho(S) ? 1 : C.MIN.sinEstudio;
// Lo que da hoy la mina de la casilla i: multiplicador del oro y lo que produce al año.
export function minaDe(S, i) {
  if (!subsueloActivo(S)) return { renta: 1, produce: C.MAT ? C.MAT.produccion.mina || {} : {} };
  const D = datosMineral(mineralDe(S, i)), e = eficienciaMina(S);
  return { renta: D.renta * e, produce: Object.fromEntries(Object.entries(D.produce).map(([k, v]) => [k, v * e])) };
}
