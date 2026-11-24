// Lugares de entretenimiento (pedido de Juan): chichería, gallera, kiosco de retreta, circo, cine, billar, feria,
// balneario, centro comercial, discoteca, ecoparque y parque temático. Cada uno solo se construye en su época de la
// historia (`epocas` [desde, hasta] en edificios.json, índices de historia.json) y trae algo bueno y algo malo
// (`efectos`, con las mismas claves que las leyes: ánimo, conflicto, legitimidad, comercio, ambiente…). Dos iguales
// suman; desde el tercero ya no suman más (la gente no va a tres galleras). El circo se va solo (`dura`).
import { C } from './contenido.js';
import { climaActivo } from './clima.js';
import { epocaHistorica } from './reglas.js';
import { liberarGrande } from './grandes.js';

export function indiceEpoca(S) { const id = epocaHistorica(S); return C.HIST ? Math.max(0, C.HIST.epocas.findIndex(e => e.id === id)) : 0; }
// ¿Por qué no se puede construir este lugar ahora? ('' si sí se puede)
export function motivoEpoca(S, k) {
  const b = C.B[k]; if (!b || !b.ep) return '';
  if (!climaActivo(S) || !C.HIST) return 'No disponible.';
  const e = indiceEpoca(S), E = C.HIST.epocas;
  if (e < b.ep[0]) return `${b.n}: llega en la época «${E[b.ep[0]].nombre}».`;
  if (b.ep[1] !== undefined && e > b.ep[1]) return `${b.n}: ya pasó su época (hasta «${E[b.ep[1]].nombre}»).`;
  return '';
}
export const deSuEpoca = (S, k) => !motivoEpoca(S, k);
// Suma de los efectos de los lugares de entretenimiento abiertos (para efectoLeyes).
export function efectoOcio(S, k, sub) {
  if (!climaActivo(S)) return 0;
  const n = {}; for (const x of S.map) if (x.b && !x.ob && C.B[x.b] && C.B[x.b].ef) n[x.b] = (n[x.b] || 0) + 1;
  let v = 0;
  for (const [b, m] of Object.entries(n)) { const e = C.B[b].ef[k]; if (e === undefined) continue; const val = sub ? (e[sub] || 0) : e; if (typeof val === 'number') v += val * Math.min(2, m); }
  return v;
}
// Cierre del año: el circo levanta la carpa cuando se cumple su tiempo.
export function ocioDelAnio(S) {
  if (!climaActivo(S)) return [];
  const news = [];
  S.map.forEach((x, i) => { const b = x.b && C.B[x.b]; if (b && b.dura && !x.ob && x.ya !== undefined && S.year - x.ya >= b.dura) { liberarGrande(S, i); x.b = null; delete x.ya; delete x.u; news.push(`${b.e} ${b.n}: levantó la carpa y siguió su camino a otro pueblo.`); } });
  return news;
}
