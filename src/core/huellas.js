// El mapa cuenta la historia (pedido de Juan, 5 de octubre). Paso 0: la plaza de fundación. Es la primera obra de
// las partidas que se fundan a elección: marca el centro del pueblo y el casco urbano, un radio a su alrededor que
// crece con cada etapa. Las obras urbanas van dentro del casco; fincas, minas y obras del río pueden ir más lejos.
// Las partidas guardadas antes (sin plaza) siguen sin casco.
import { C } from './contenido.js';
import { lado } from './mundo.js';
import { azar } from './azar.js';
import { climaActivo } from './clima.js';

const K = () => C.HUELLAS && C.HUELLAS.fundacion;
const plazaPendiente = S => !!(S.fundando && S.fundando.plaza);
export function plazaFundacion(S) { return S.map.findIndex(x => x.b === 'fundacion'); }
// Radio del casco urbano en la etapa actual (null si la partida no tiene casco).
export function radioCasco(S) {
  if (!S.casco || !K()) return null;
  const r = K().radios[Math.min(S.stage, K().radios.length - 1)];
  return r >= 99 ? null : r;
}
export function enCasco(S, i) {
  const r = radioCasco(S), c = S.centro;
  if (r === null || c === undefined) return true;
  const N = lado(S);
  return Math.hypot(Math.floor(i / N) - Math.floor(c / N), i % N - c % N) <= r + .01;
}
// Motivo por el que la plaza o el casco impiden construir k en i ('' si nada). Lo usa whyNot.
export function motivoFundacion(S, k, i) {
  const F = K();
  if (!F || !huellasActivas(S)) return k === 'fundacion' || k === 'cementerio' ? 'No disponible.' : '';
  if (k === 'cementerio') { const d = distanciaPlaza(S, i), M = C.HUELLAS.cementerio; if (d !== null && d < M.distancia) return M.textos.cerca.replace('{d}', M.distancia); }
  if (k === 'fundacion') return plazaPendiente(S) ? '' : F.textos.solo;
  if (plazaPendiente(S)) return F.textos.primero;
  if (!F.libres.includes(k) && !enCasco(S, i)) return F.textos.fuera.replace('{r}', radioCasco(S));
  return '';
}
// ¿Se muestra la plaza en el panel de construir? Solo mientras falta.
export function ofrecerPlaza(S) { return plazaPendiente(S); }

export function huellasActivas(S) { return climaActivo(S) && !!C.HUELLAS; }
// Distancia de la casilla i a la plaza (o al centro del pueblo); null si aún no hay centro.
export function distanciaPlaza(S, i) {
  const N = lado(S), p = plazaFundacion(S), c = p >= 0 ? p : S.centro !== undefined ? S.centro : S.map.findIndex(x => x.b === 'casa');
  return c < 0 ? null : Math.hypot(Math.floor(i / N) - Math.floor(c / N), i % N - c % N);
}

// ---------- Paso 1: muertes, cementerio, luto y ruinas ----------
// Las muertes trágicas (desastres, epidemias, hambre, guerra) se cuentan en S.muertos y piden sepultura.
export function registrarMuertes(S, n, causa) {
  if (!huellasActivas(S) || !(n > 0)) return;
  S.muertos = (S.muertos || 0) + n;
  if (n >= C.HUELLAS.luto.minimo) S.luto = { anio: S.year, n: (S.luto && S.luto.anio === S.year ? S.luto.n : 0) + n, causa };
  if (causa === 'epidemia') S.epiVis = S.year;
}
const cementerios = S => S.map.map((x, i) => x.b === 'cementerio' && !x.ob ? i : -1).filter(i => i >= 0);
export function capacidadCementerios(S) { return cementerios(S).length * C.HUELLAS.cementerio.capacidad; }
// Muertos sin sepultura digna (0 si hay cementerio con cupo, o si aún son muy pocos).
export function sinSepultura(S) {
  if (!huellasActivas(S)) return 0;
  const m = S.muertos || 0;
  return m < C.HUELLAS.cementerio.desdeMuertos ? 0 : Math.max(0, m - capacidadCementerios(S));
}
export function animoSepultura(S) { return sinSepultura(S) > 0 ? C.HUELLAS.cementerio.animo : 0; }
export function factorEpidemia(S) { return sinSepultura(S) > 0 ? C.HUELLAS.cementerio.epidemia : 1; }
// Tumbas de cada cementerio (se llenan en orden).
export function tumbasDe(S, i) {
  const L = cementerios(S), k = L.indexOf(i), cap = C.HUELLAS.cementerio.capacidad;
  return k < 0 ? 0 : Math.max(0, Math.min(cap, (S.muertos || 0) - k * cap));
}
export function avisoSepultura(S) {
  const n = sinSepultura(S), M = C.HUELLAS && C.HUELLAS.cementerio;
  if (!n) return '';
  return cementerios(S).length ? M.textos.lleno.replace('{n}', S.muertos).replace('{c}', capacidadCementerios(S)) : M.textos.falta.replace('{n}', n);
}
// ¿Hay luto o epidemia a la vista este año?
export function lutoVisible(S) { return huellasActivas(S) && !!S.luto && S.year - S.luto.anio < C.HUELLAS.luto.anios; }
export function epidemiaVisible(S) { return huellasActivas(S) && S.epiVis !== undefined && S.year - S.epiVis < C.HUELLAS.epidemia.anios; }

// Ruinas: tras un desastre, algunas de las obras dañadas se derrumban (x.ru). No rinden hasta reconstruirlas.
export function dejarRuinas(S, tipo, dañadas) {
  if (!huellasActivas(S) || !dañadas.length) return 0;
  const p = C.HUELLAS.ruinas.prob[tipo] || 0;
  let n = 0;
  for (const i of dañadas) { const x = S.map[i]; if (x.b && x.b !== 'fundacion' && azar() < p) { x.u = 100; x.ru = S.year; n++; } }
  return n;
}
export function noticiaRuinas(n) { return n ? C.HUELLAS.ruinas.textos.noticia.replace('{n}', n) : null; }
