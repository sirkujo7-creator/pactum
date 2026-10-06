// El mapa cuenta la historia (pedido de Juan, 5 de octubre). Paso 0: la plaza de fundación. Es la primera obra de
// las partidas que se fundan a elección: marca el centro del pueblo y el casco urbano, un radio a su alrededor que
// crece con cada etapa. Las obras urbanas van dentro del casco; fincas, minas y obras del río pueden ir más lejos.
// Las partidas guardadas antes (sin plaza) siguen sin casco.
import { C } from './contenido.js';
import { lado } from './mundo.js';
import { azar } from './azar.js';
import { climaActivo } from './clima.js';
import { epocaHistorica } from './reglas.js';
import { marcarTala } from './suelo.js';

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
  if (!F || !huellasActivas(S)) return k === 'fundacion' || k === 'cementerio' || k === 'iglesia' ? 'No disponible.' : '';
  if (k === 'iglesia') { const M = C.HUELLAS.iglesia, d = distanciaPlaza(S, i); if (S.map.some(x => x.b === 'iglesia')) return M.textos.unica; if (plazaFundacion(S) >= 0 && (d === null || d > M.distanciaPlaza)) return M.textos.lejos; }
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
export function factorEpidemia(S) {
  if (!huellasActivas(S)) return 1;
  const A = C.BARRIOS && C.BARRIOS.asentamiento; // paso 2: los ranchos sin agua ni alcantarillado también propagan la enfermedad
  return (sinSepultura(S) > 0 ? C.HUELLAS.cementerio.epidemia : 1) * (1 + (A && A.epidemia || 0) * totalRanchos(S));
}
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

// ---------- Paso 2: el barrio de invasión y los colonos ----------
// Ranchos de un asentamiento informal (la casilla donde nació y las que se le sumaron).
export function ranchos(a) { return [a.i, ...(a.t || [])]; }
export function totalRanchos(S) { return (S.asent || []).reduce((s, a) => s + 1 + (a.t ? a.t.length : 0), 0); }
// Evasión extra: en los ranchos nadie paga impuestos (se suma a la de la cobertura del recaudo).
export function evasionInformal(S) {
  const A = C.BARRIOS && C.BARRIOS.asentamiento;
  return huellasActivas(S) && A && A.evasion ? Math.min(.2, A.evasion * totalRanchos(S)) : 0;
}
// Colonos: ranchos en los baldíos del borde (marcas colono, arriendo o sorteo). Viven de su propia comida.
const MODOS = ['colono', 'arriendo', 'sorteo'];
export function esColono(x) { return !!(x.mk && MODOS.includes(x.mk.t)); }
export function colonosEnMapa(S) { let n = 0; for (const x of S.map) if (x.mk && MODOS.includes(x.mk.t)) n++; return n; }
export function capacidadColonos(S) { return S.colUlt === undefined ? 0 : colonosEnMapa(S) * C.HUELLAS.colonos.capacidad; }
export function comidaColonos(S) { return S.colUlt === undefined ? 0 : colonosEnMapa(S) * C.HUELLAS.colonos.comida; }
// Un baldío: casilla libre de llano o bosque, lejos de la plaza; se prefieren las laderas y los bordes.
function baldio(S, k) {
  const N = lado(S), K2 = C.HUELLAS.colonos, L = [];
  S.map.forEach((x, i) => {
    if (x.b || x.mk || x.oc || (x.t !== 'llano' && x.t !== 'bosque')) return;
    const d = distanciaPlaza(S, i);
    if (d === null || d < K2.distancia) return;
    const r = Math.floor(i / N), c = i % N, borde = Math.min(r, c, N - 1 - r, N - 1 - c);
    L.push([i, -Math.abs(d - 9) * .5 - (borde < 2 ? 2 : 0) + Math.min(2, x.h || 0) * .6 + ((i * 7 + S.year * 3 + k) % 5) * .4]); // la frontera agrícola: ni pegados ni en la esquina
  });
  L.sort((a, b) => b[1] - a[1]);
  return L.length ? L[0][0] : -1;
}
function ponerColono(S, modo, k) {
  const i = baldio(S, k);
  if (i < 0) return -1;
  const x = S.map[i], K2 = C.HUELLAS.colonos;
  if (x.t === 'bosque') { x.t = 'llano'; S.env = Math.max(0, Math.min(100, S.env + K2.ambiente)); marcarTala(S, i); } // tumban monte
  x.mk = { t: modo, y: S.year, d: `Año ${S.year}: ${K2.modos[modo].texto}` };
  if (S.colUlt === undefined) S.colUlt = -99;
  return i;
}
// Desde un dilema (las tierras baldías): llegan varias familias a la vez.
export function llegarColonos(S, modo, n = 3) {
  if (!huellasActivas(S) || !C.HUELLAS.colonos || !MODOS.includes(modo)) return [];
  const L = [];
  for (let k = 0; k < n; k++) { const i = ponerColono(S, modo, k); if (i >= 0) L.push(i); }
  if (L.length) S.colUlt = S.year;
  return L;
}
// Cierre del año: en las primeras épocas, de vez en cuando llegan colonos por su cuenta.
export function colonosDelAnio(S) {
  if (!huellasActivas(S) || !C.HUELLAS.colonos) return [];
  const K2 = C.HUELLAS.colonos, ep = epocaHistorica(S);
  if (!ep || !K2.epocas.includes(ep) || S.fundando || S.year - (S.colUlt ?? -99) < K2.cada || colonosEnMapa(S) >= K2.maximo) return [];
  if (azar() >= K2.prob) return [];
  if (ponerColono(S, 'colono', 0) < 0) return [];
  S.colUlt = S.year;
  return [K2.textos.llega];
}

// ---------- Paso 3: leyes que se ven ----------
// Las leyes vigentes dejan su señal junto a las obras que tocan (huellas.json, leyes). El resguardo indígena es una
// maloca en una casilla lejana que aparece con la ley y se va si se deroga.
export function leyesVisibles(S, obra) {
  if (!huellasActivas(S) || !C.HUELLAS.leyes || !S.laws) return [];
  return Object.entries(C.HUELLAS.leyes).filter(([id, v]) => S.laws[id] !== undefined && v.en.includes(obra)).map(([id]) => id);
}
export function sincronizarLeyes(S) {
  if (!huellasActivas(S) || !C.HUELLAS.leyes) return;
  const i = S.map.findIndex(x => x.mk && x.mk.t === 'resguardo'), ley = S.laws && S.laws.indigenas !== undefined;
  if (ley && i < 0) { const j = baldio(S, 1); if (j >= 0) { const x = S.map[j]; S.map[j].mk = { t: 'resguardo', y: S.year, d: `Año ${S.year}: se reconoce el resguardo indígena.` }; } }
  if (!ley && i >= 0) delete S.map[i].mk;
}

// ---------- Paso 4: guerra y conflicto ----------
// Obras quemadas (x.qm): hollín en los muros hasta repararlas o hasta que pasen unos años.
export function quemar(S, lista) { if (!huellasActivas(S)) return; for (const i of lista) if (S.map[i].b) S.map[i].qm = S.year; }
export function quemadaVisible(S, x) { return huellasActivas(S) && x.qm !== undefined && S.year - x.qm < C.HUELLAS.guerra.quemadas; }
// Trincheras: zanjas entre el pueblo y el borde del vecino durante la guerra (marcas que duran unos años).
export function cavarTrincheras(S, casillasDelBorde) {
  if (!huellasActivas(S) || !C.HUELLAS.guerra || !casillasDelBorde.length) return [];
  const G = C.HUELLAS.guerra, N = lado(S), hechas = S.map.filter(x => x.mk && x.mk.t === 'trinchera').length;
  if (hechas >= G.maxTrincheras) return [];
  const b = casillasDelBorde[0], c = S.centro !== undefined ? S.centro : S.map.findIndex(x => x.b === 'casa');
  if (c < 0) return [];
  const obras = S.map.map((x, i) => x.b ? i : -1).filter(i => i >= 0);
  const dB = i => Math.hypot(Math.floor(i / N) - Math.floor(b / N), i % N - b % N);
  const dObra = i => Math.min(...obras.map(j => Math.max(Math.abs(Math.floor(i / N) - Math.floor(j / N)), Math.abs(i % N - j % N))));
  const L = S.map.map((x, i) => i).filter(i => { const x = S.map[i]; return !x.b && !x.mk && !x.oc && x.t === 'llano'; })
    .map(i => [i, dObra(i)]).filter(([, d]) => d >= 1 && d <= 3).sort((a, z) => dB(a[0]) - dB(z[0])).slice(0, Math.min(G.trincheras, G.maxTrincheras - hechas));
  for (const [i] of L) S.map[i].mk = { t: 'trinchera', y: S.year, d: `Año ${S.year}: trinchera de la guerra.` };
  return L.length ? [G.textos.trinchera] : [];
}
