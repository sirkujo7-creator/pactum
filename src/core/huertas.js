// Huertas y pozos junto a las casas (pedido de Juan: «si existen, que sea por algo»; «las huertas y los pozos deben
// sumar»). Las huertas dan un poco de comida y los pozos un poco de agua mientras no haya acueducto. Se ubican en
// casillas libres pegadas a las casas, siempre en el mismo orden, para que el mapa (Mobiliario.js) los dibuje
// exactamente donde la lógica los cuenta. Solo en el modo de acuarela (la equivalencia con la v9 no cambia).
import { climaActivo } from './clima.js';
import { lado } from './mundo.js';
import { centroPueblo } from './cobertura.js';

export const HUERTA_COMIDA = 2, POZO_AGUA = 10, MAX_HUERTAS = 5, MAX_POZOS = 3;
const libre = x => !x.b && x.t !== 'rio' && x.t !== 'bosque' && !(x.q > 0);
let CACHE = { k: null, v: null };
// { huertas: [{ i, casa }], pozos: [{ i, casa }] } en casillas libres; cada casilla se usa una sola vez.
export function huertasYPozos(S) {
  if (!climaActivo(S) || S.stage < 0) return { huertas: [], pozos: [] };
  const k = S.map.map(x => (x.b || '') + (x.ob ? 'o' : '')).join(',');
  if (CACHE.k === k && CACHE.S === S) return CACHE.v;
  const N = lado(S), c = centroPueblo(S), rc = i => [Math.floor(i / N), i % N];
  const [r0, c0] = c >= 0 ? rc(c) : [N / 2, N / 2];
  const casas = S.map.map((x, i) => x.b === 'casa' && !x.ob ? i : -1).filter(i => i >= 0).sort((a, b) => { const [ra, ca] = rc(a), [rb, cb] = rc(b); return Math.hypot(ra - r0, ca - c0) - Math.hypot(rb - r0, cb - c0) || a - b; });
  const usadas = new Set(), out = { huertas: [], pozos: [] }, acueducto = S.map.some(x => x.b === 'acueducto' && !x.ob);
  const maxPozos = acueducto ? 0 : Math.min(MAX_POZOS, Math.ceil(casas.length / 4)), maxHuertas = Math.min(MAX_HUERTAS, Math.floor(casas.length / 2));
  for (const casa of casas) {
    const [r, cc] = rc(casa);
    const j = [[1, 0], [0, 1], [-1, 0], [0, -1]].map(([dr, dc]) => [r + dr, cc + dc]).filter(([a, b]) => a >= 0 && b >= 0 && a < N && b < N).map(([a, b]) => a * N + b).find(j => libre(S.map[j]) && !usadas.has(j) && j !== c);
    if (j === undefined) continue;
    if (out.pozos.length < maxPozos && (casa % 4 === 0 || out.pozos.length === 0)) { usadas.add(j); out.pozos.push({ i: j, casa }); continue; }
    if (out.huertas.length < maxHuertas && casa % 2 === 0) { usadas.add(j); out.huertas.push({ i: j, casa }); }
  }
  CACHE = { k, S, v: out }; return out;
}
export function comidaHuertas(S) { return huertasYPozos(S).huertas.length * HUERTA_COMIDA; }
export function aguaPozos(S) { return huertasYPozos(S).pozos.length * POZO_AGUA; }
