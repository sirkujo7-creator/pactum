// Calles en damero (fase 9): van por los bordes de las casillas, de esquina a esquina, como el trazado colonial.
// Se toca una esquina de inicio y otra de destino; la ruta más barata se traza sola (esquiva la montaña y pone
// puente donde cruza el río). Las obras junto a una calle rinden más, los servicios llegan más lejos y las casas
// evaden menos. Las calles cambian con la época: camino de herradura, calle empedrada y carretera.
// Se guardan como bordes "a|b" entre esquinas (índice r * (N + 1) + c). Solo en el terreno en acuarela.
import { C } from './contenido.js';
import { climaActivo } from './clima.js';
import { epocaHistorica } from './reglas.js';
import { lado } from './mundo.js';

const K = () => C.CALLES;
export function callesActivas(S) { return climaActivo(S) && !!C.CALLES; }
export function eraCalle(S) { const P = K(), e = epocaHistorica(S); return (e && P.eraPorEpoca[e]) || P.eraPorEtapa[S.stage] || 'herradura'; }
export function claveBorde(a, b) { return a < b ? a + '|' + b : b + '|' + a; }
export const esquina = (N, r, c) => r * (N + 1) + c;
export const rcEsquina = (N, i) => [Math.floor(i / (N + 1)), i % (N + 1)];
export function listaCalles(S) { return (S && S.calles) || []; }

// Datos derivados (conjunto de bordes, casillas conectadas); se recalculan cuando cambia la lista.
const CACHE = new WeakMap();
function datos(S) {
  const L = listaCalles(S);
  let d = CACHE.get(L);
  if (d && d.N === lado(S)) return d;
  const N = lado(S), M = N + 1, set = new Set(L), con = new Uint8Array(N * N);
  let salida = false;
  for (const k of L) {
    const [a, b] = k.split('|').map(Number);
    for (const t of casillasDeBorde(N, a, b)) con[t] = 1;
    for (const e of [a, b]) { const r = Math.floor(e / M), c = e % M; if (r === 0 || c === 0 || r === N || c === N) salida = true; }
  }
  d = { N, set, con, salida };
  CACHE.set(L, d);
  return d;
}
// Casillas (índices) a los dos lados de un borde.
function casillasDeBorde(N, a, b) {
  const [r1, c1] = rcEsquina(N, a), [r2, c2] = rcEsquina(N, b), out = [];
  const pon = (r, c) => { if (r >= 0 && c >= 0 && r < N && c < N) out.push(r * N + c); };
  if (r1 === r2) { const c = Math.min(c1, c2); pon(r1 - 1, c); pon(r1, c); }
  else { const r = Math.min(r1, r2); pon(r, c1 - 1); pon(r, c1); }
  return out;
}
export function hayCalle(S, a, b) { return datos(S).set.has(claveBorde(a, b)); }
export function conectada(S, i) { return callesActivas(S) && listaCalles(S).length > 0 && datos(S).con[i] === 1; }
export function salidaAlBorde(S) { return callesActivas(S) && datos(S).salida; }

// ---------- Terreno de los bordes ----------
const tipo = (S, i) => S.map[i].t;
export function bordeAgua(S, a, b) { const L = casillasDeBorde(lado(S), a, b); return L.length > 0 && L.every(i => tipo(S, i) === 'rio'); }
export function bordeBloqueado(S, a, b) { const L = casillasDeBorde(lado(S), a, b); return L.every(i => tipo(S, i) === 'montana'); }
// El río pasa por una esquina cuando dos casillas de río se tocan en diagonal allí.
export function esquinaAgua(S, e) {
  const N = lado(S), [r, c] = rcEsquina(N, e), rio = (R, Cc) => R >= 0 && Cc >= 0 && R < N && Cc < N && tipo(S, R * N + Cc) === 'rio';
  return (rio(r - 1, c - 1) && rio(r, c) && !rio(r - 1, c) && !rio(r, c - 1)) || (rio(r - 1, c) && rio(r, c - 1) && !rio(r - 1, c - 1) && !rio(r, c));
}
function vecinasEsquina(N, e) {
  const [r, c] = rcEsquina(N, e), L = [];
  for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const R = r + dr, Cc = c + dc; if (R >= 0 && Cc >= 0 && R <= N && Cc <= N) L.push(esquina(N, R, Cc)); }
  return L;
}

// Ruta más barata por los bordes (Dijkstra con montículo). Cruzar agua cuesta (puente); reutilizar una calle es casi
// gratis; cada giro cuesta un poco, para que las calles salgan rectas.
export function trazarCalle(S, a, b) {
  const N = lado(S), T = (N + 1) * (N + 1), dist = new Float64Array(T).fill(Infinity), prev = new Int32Array(T).fill(-1), d = datos(S);
  const heap = [[0, a]], push = x => { heap.push(x); let i = heap.length - 1; while (i) { const p = (i - 1) >> 1; if (heap[p][0] <= heap[i][0]) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p; } };
  const pop = () => { const top = heap[0], u = heap.pop(); if (heap.length) { heap[0] = u; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === i) break; [heap[m], heap[i]] = [heap[i], heap[m]]; i = m; } } return top; };
  dist[a] = 0;
  while (heap.length) {
    const [du, u] = pop();
    if (du > dist[u]) continue;
    if (u === b) break;
    for (const v of vecinasEsquina(N, u)) {
      if (bordeBloqueado(S, u, v)) continue;
      const ya = d.set.has(claveBorde(u, v)) ? .2 : 1, agua = bordeAgua(S, u, v) || esquinaAgua(S, v) ? 3 : 0;
      const giro = prev[u] >= 0 && v - u !== u - prev[u] ? .3 : 0; // prefiere tramos rectos (damero), no escalones
      const nd = du + ya * (1 + agua) + giro;
      if (nd < dist[v]) { dist[v] = nd; prev[v] = u; push([nd, v]); }
    }
  }
  if (!isFinite(dist[b]) || a === b) return null;
  const L = [b]; while (L[0] !== a) L.unshift(prev[L[0]]);
  return L;
}
// Costo de una ruta: solo los tramos nuevos y los puentes nuevos.
export function costoCalle(S, ruta) {
  const P = K(), E = P.eras[eraCalle(S)], d = datos(S), nuevo = k => !d.set.has(claveBorde(ruta[k - 1], ruta[k]));
  let tramos = 0, puentes = 0, bosque = 0;
  for (let k = 1; k < ruta.length; k++) {
    if (!nuevo(k)) continue;
    tramos++;
    if (casillasDeBorde(lado(S), ruta[k - 1], ruta[k]).some(i => S.map[i].t === 'bosque')) bosque++;
    if (bordeAgua(S, ruta[k - 1], ruta[k])) puentes++;
    else if (k < ruta.length - 1 && esquinaAgua(S, ruta[k])) puentes++;
  }
  return { tramos, puentes, bosque, ambiente: Math.round(bosque * P.talaAmbiente * 10) / 10, oro: Math.round((tramos * E.costo + puentes * P.puente) * S.price), era: E.nombre };
}
export function construirCalle(S, ruta) {
  if (!callesActivas(S) || !ruta || ruta.length < 2) return { ok: false };
  const k = costoCalle(S, ruta);
  if (!k.tramos) return { ok: false, motivo: 'ya' };
  if (S.gold < k.oro) return { ok: false, motivo: K().textos.sinOro };
  S.gold -= k.oro;
  if (k.ambiente) S.env = Math.max(0, S.env - k.ambiente); // abrir camino entre el bosque tala árboles
  const set = new Set(listaCalles(S));
  for (let j = 1; j < ruta.length; j++) set.add(claveBorde(ruta[j - 1], ruta[j]));
  S.calles = [...set]; // lista nueva: así se renueva la caché
  return { ok: true, ...k };
}
// Quita las calles que llegan a una esquina (no se devuelve el oro). Devuelve los bordes quitados.
export function quitarCalles(S, e) {
  const fuera = listaCalles(S).filter(k => k.split('|').map(Number).includes(e));
  if (fuera.length) S.calles = listaCalles(S).filter(k => !fuera.includes(k));
  return fuera;
}

// ---------- Efectos ----------
// Las obras de comercio junto a una calle venden más.
export function factorCalle(S, i) { return conectada(S, i) && K().conComercio.includes(S.map[i].b) ? 1 + K().comercio : 1; }
// Los servicios junto a una calle llegan más lejos.
export function radioCalle(S, i) { return conectada(S, i) ? K().radioExtra : 0; }
// Parte de las casas con una calle al frente (baja la evasión).
export function casasConectadas(S) {
  if (!callesActivas(S) || !listaCalles(S).length) return 0;
  let n = 0, si = 0;
  S.map.forEach((x, i) => { if (x.b === 'casa' && !x.ob) { n++; if (datos(S).con[i]) si++; } });
  return n ? si / n : 0;
}
export function menosEvasion(S) { return 1 - K().menosEvasion * casasConectadas(S); }
export function comercioSalida(S) { return salidaAlBorde(S) ? K().salida.comercio : 0; }
export function mantenimientoCalles(S) {
  if (!callesActivas(S) || !listaCalles(S).length) return 0;
  return Math.round(listaCalles(S).length * K().eras[eraCalle(S)].mantenimiento * S.price);
}

// Cierre del año: la época cambia el tipo de calle y la primera salida al borde se anuncia.
export function callesDelAnio(S) {
  if (!callesActivas(S)) return [];
  iniciarCalles(S);
  const T = K().textos, news = [], era = eraCalle(S);
  if (S.eraCalle && S.eraCalle !== era && listaCalles(S).length) news.push(T.mejora.replace('{era}', K().eras[era].plural));
  S.eraCalle = era;
  if (salidaAlBorde(S) && !S.salidaCalle) { S.salidaCalle = 1; news.push(T.salida); }
  return news;
}

// Al abrir una partida en acuarela sin calles: una plaza de cuatro tramos alrededor del centro (gratis), para que
// el pueblo no quede sin caminos. Las partidas viejas la reciben al abrirse.
export function iniciarCalles(S, centro) {
  if (!callesActivas(S) || S.calles) return false;
  S.calles = [];
  const N = lado(S), i = centro !== undefined ? centro : S.centro !== undefined ? S.centro : S.map.findIndex(x => x.b === 'casa');
  if (i < 0) return true;
  const r = Math.floor(i / N), c = i % N, e = (R, Cc) => esquina(N, R, Cc);
  const L = [[e(r, c), e(r, c + 1)], [e(r, c + 1), e(r + 1, c + 1)], [e(r + 1, c + 1), e(r + 1, c)], [e(r + 1, c), e(r, c)]];
  S.calles = L.filter(([a, b]) => !bordeBloqueado(S, a, b) && !bordeAgua(S, a, b)).map(([a, b]) => claveBorde(a, b));
  return true;
}
// Lo que hay que pintar: tramos (con su marca de agua) y esquinas con puente.
export function dibujoCalles(S) {
  if (!callesActivas(S)) return null;
  const tramos = listaCalles(S).map(k => { const [a, b] = k.split('|').map(Number); return [a, b, bordeAgua(S, a, b)]; });
  const enEsq = {};
  for (const [a, b] of tramos) { (enEsq[a] = enEsq[a] || []).push(b); (enEsq[b] = enEsq[b] || []).push(a); }
  const esquinas = Object.entries(enEsq).filter(([e, V]) => V.length >= 2 && esquinaAgua(S, +e)).map(([e, V]) => [+e, V[0], V[1]]);
  return { era: eraCalle(S), tramos, esquinas };
}
// Vecinos de una esquina por la red de calles (para los vehículos).
export function vecinosPorCalle(S, e) {
  const out = [];
  for (const k of listaCalles(S)) { const [a, b] = k.split('|').map(Number); if (a === e) out.push(b); else if (b === e) out.push(a); }
  return out;
}
