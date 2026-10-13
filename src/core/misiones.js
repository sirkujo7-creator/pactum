// Hitos con misión (pedido de Juan, 13 de octubre): los hitos locales piden antes una obra que les dé sentido (la
// parroquia pide la iglesia, la Federación pide cafetales, la pandemia encuentra o no un hospital…). Unos años antes
// la misión aparece en Pendientes; si se cumple, la escena de cine ocurre en esa obra y luego viene la decisión; si
// no, el hito llega igual pero con su consecuencia (el obispo funda la parroquia en el pueblo vecino). Solo en acuarela.
import { C, EFECTOS } from './contenido.js';
import { climaActivo } from './clima.js';
import { counts } from './reglas.js';
import { energy } from './sociedad.js';
import { applyFx } from './dilemas.js';

// ¿Está cumplida la misión? Devuelve también la casilla donde ocurrirá la escena (la obra pedida).
export function estadoMision(S, m) {
  const c = counts(S);
  if (m.obra) { const L = S.map.map((x, i) => x.b === m.obra && !x.ob ? i : -1).filter(i => i >= 0); return { ok: L.length >= (m.n || 1), obra: L[0] }; }
  if (m.cafe) { const L = S.map.map((x, i) => (x.b === 'cultivo' || x.b === 'cafetal') && !x.ob && (x.cv || (x.b === 'cafetal' ? 'cafe' : '')) === 'cafe' ? i : -1).filter(i => i >= 0); return { ok: L.length >= m.cafe, obra: L[0] }; }
  if (m.energia) return { ok: energy(S, c) >= m.energia, obra: S.map.findIndex(x => x.b === 'molino' && !x.ob) };
  return { ok: true };
}
// Misiones que se avecinan (para Pendientes): hitos aún no vistos cuya fecha está a menos de «aviso» años.
export function misionesProximas(S) {
  if (!climaActivo(S)) return [];
  const vistos = S.hitosVistos || [];
  return C.EV.filter(e => e.hito && e.hito.mision && !vistos.includes(e.id) && S.year >= e.hito.anio - e.hito.mision.aviso && S.year < e.hito.anio + 3)
    .map(e => ({ id: e.id, titulo: e.title, anio: e.hito.anio, texto: e.hito.mision.texto.replace('{anio}', e.hito.anio), ...estadoMision(S, e.hito.mision) }));
}
// Al llegar el hito: si la misión no se cumplió, se aplica su consecuencia. Devuelve { ok, obra, fallo, fx }.
export function resolverMision(S, hito) {
  const m = hito && hito.mision; if (!m || !climaActivo(S)) return null;
  const st = estadoMision(S, m);
  if (st.ok) return { ok: true, obra: st.obra >= 0 ? st.obra : undefined };
  const fx = applyFx(S, Object.fromEntries(Object.entries(m.castigo || {}).map(([k, v]) => [EFECTOS[k], v])));
  S.log.unshift({ y: S.year, t: m.fallo });
  return { ok: false, fallo: m.fallo, fx };
}
