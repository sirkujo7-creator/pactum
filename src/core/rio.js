// El río que cambia de curso (fase 6): en un año de La Niña o de lahar, si las orillas están peladas o erosionadas,
// el río puede abrir un cauce nuevo. Las casillas que el agua ocupa pierden lo construido; donde corría queda una
// madrevieja (humedal). Se previene con bosque de galería y sin construir en la ronda. El cambio se guarda como un
// desvío del cauce (S.rio.desvios) que el terreno en acuarela vuelve a aplicar. Solo en el terreno en acuarela.
import { C } from './contenido.js';
import { azar, clamp } from './azar.js';
import { climaActivo } from './clima.js';
import { terrenoDe } from './mundo.js';
import { LOGICO, lado } from './mundo.js';
import { cap } from './reglas.js';
import { recordar } from './memoria.js';

const K = () => C.RIO;
export function rioActivo(S) { return climaActivo(S) && !!C.RIO; }
export function desvios(S) { return (S.rio && S.rio.desvios) || []; }

const vecinos4 = (N, i) => { const r = Math.floor(i / N), c = i % N; return [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([a, b]) => [r + a, c + b]).filter(([R, Cc]) => R >= 0 && Cc >= 0 && R < N && Cc < N).map(([R, Cc]) => R * N + Cc); };
// Orillas: casillas de tierra junto al río.
export function orillas(S) {
  const N = lado(S);
  return S.map.map((x, i) => i).filter(i => S.map[i].t !== 'rio' && vecinos4(N, i).some(j => S.map[j].t === 'rio'));
}
// Partes del riesgo: cuánta orilla conserva su vegetación (bosque, o sin obras ni tala), cuánta está erosionada
// o talada, y cuántas obras hay en la ronda.
const natural = x => x.t === 'bosque' || (!x.b && !x.tl && !(x.er > 0));
export function estadoOrillas(S) {
  const o = orillas(S), n = o.length || 1;
  const protegida = o.filter(i => natural(S.map[i])).length / n;
  const pelada = o.filter(i => S.map[i].t !== 'bosque' && (S.map[i].er > 0 || S.map[i].tl)).length / n;
  return { protegida, pelada, obras: o.filter(i => S.map[i].b).length };
}
// Probabilidad de que el río cambie de curso si llega la crecida (La Niña) o un lahar.
export function probCambio(S, lahar) {
  if (!rioActivo(S)) return 0;
  const R = K(), E = estadoOrillas(S), r = S.rio || {};
  if (S.stage < R.desde.etapa || S.year < R.desde.anio || S.year - (r.ult || -99) < R.enfriar || desvios(S).length >= R.maximoDesvios) return 0;
  return clamp((lahar ? R.probLahar : R.prob) * (1 - R.protege * E.protegida) * (1 + R.porErosion * E.pelada), 0, .9);
}

const esAgua = (T, i) => T.tiles[i].b === 'agua';
// Busca un tramo para el desvío: prefiere la orilla pelada (sin bosque) y evita la montaña.
function elegirDesvio(S) {
  const N = lado(S), R = K(), dv = desvios(S), T0 = terrenoDe(S, dv);
  const cand = [];
  for (let k = 0; k < 10; k++) {
    const s = -.7 + 1.4 * azar(), a = (azar() < .5 ? -1 : 1) * R.amplitud, d = { s: Math.round(s * 1000) / 1000, a, w: R.ancho / N };
    const T1 = terrenoDe(S, [...dv, d]);
    const nuevas = [], secas = [];
    for (let i = 0; i < N * N; i++) { const a0 = esAgua(T0, i), a1 = esAgua(T1, i); if (a1 && !a0) nuevas.push(i); else if (a0 && !a1) secas.push(i); }
    if (nuevas.length < 2 || !secas.length || nuevas.some(i => S.map[i].t === 'montana')) continue;
    // Peso: las orillas con obras o taladas ceden más; la vegetación de galería las sostiene.
    const peso = nuevas.reduce((t, i) => t + (S.map[i].t === 'bosque' ? .15 : natural(S.map[i]) ? .5 : 1.6), 0) / nuevas.length;
    cand.push({ d, nuevas, secas, T1, peso });
  }
  if (!cand.length) return null;
  let x = azar() * cand.reduce((t, c) => t + c.peso, 0);
  for (const c of cand) { if ((x -= c.peso) <= 0) return c; }
  return cand[cand.length - 1];
}

// Aplica el cambio de curso al mapa lógico. Devuelve el evento.
export function cambiarCurso(S, causa) {
  const D = elegirDesvio(S);
  if (!D) return null;
  const R = K(), perdidas = [];
  for (const i of D.nuevas) {
    const x = S.map[i];
    if (x.b) perdidas.push(C.B[x.b].n);
    x.t = 'rio'; x.b = null; x.h = 0;
    for (const k of ['ob', 'mt', 'u', 'ya', 'mk', 'tl', 'er', 'q', 'nb', 'dr', 'sin']) delete x[k];
  }
  for (const i of D.secas) {
    const x = S.map[i], t = D.T1.tiles[i];
    x.t = LOGICO[t.b] || 'llano'; x.h = t.h > 4.4 ? 2 : t.h > 2 ? 1 : 0;
    if (x.t === 'llano') x.mk = { t: 'madrevieja', y: S.year, d: `Año ${S.year}: aquí corría el río.` };
  }
  S.rio = { ...(S.rio || {}), desvios: [...desvios(S), D.d], ult: S.year };
  if (S.pop > cap(S)) S.pop = cap(S);
  S.env = clamp(S.env + R.humedalAmbiente, 0, 100);
  if (perdidas.length) S.tr = clamp(S.tr - R.legitimidadPorObra * Math.min(4, perdidas.length), 0, 100);
  recordar(S, perdidas.length ? 'abandono' : 'ambiente');
  S.rioEv = { anio: S.year, causa, perdidas, nuevas: D.nuevas.length, foco: D.nuevas[Math.floor(D.nuevas.length / 2)], nuevo: true };
  return S.rioEv;
}

// Lo que se llevó el río, agrupado: «casas (2), cultivo».
export function listaPerdidas(L) {
  const n = {}; for (const k of L) n[k] = (n[k] || 0) + 1;
  return Object.entries(n).map(([k, v]) => k.toLowerCase() + (v > 1 ? ` (${v})` : '')).join(', ');
}

// Cierre del año: la crecida de La Niña o el lahar pueden mover el río.
export function rioDelAnio(S) {
  if (!rioActivo(S)) return [];
  const nina = S.clima.fenomeno === 'nina', lahar = S.lahar === S.year;
  if (!nina && !lahar) return [];
  if (azar() >= probCambio(S, lahar && !nina)) return [];
  const e = cambiarCurso(S, nina ? 'nina' : 'lahar');
  if (!e) return [];
  const T = K().textos;
  return [`${T.titulo}.${e.perdidas.length ? ` Se llevó: ${listaPerdidas(e.perdidas)}.` : ''}`];
}
