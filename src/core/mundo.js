// Mapa lógico del territorio: tipo de terreno (llano, bosque, montaña, río), altura (0 a 2) y edificio.
// Generador de la versión 9. El terreno continuo en acuarela (paso 3) se pintará encima de estos datos.
import { mulberry, clamp } from './azar.js';
import { genTerreno } from './terreno.js';

export const LADO_V9 = 20;
export const LADO_INICIAL = 32;

export function lado(S) { return S.n || LADO_V9; }
export function idx(S, r, c) { return r * lado(S) + c; }
export function neigh(S, i) {
  const N = lado(S), r = Math.floor(i / N), c = i % N, o = [];
  [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dr, dc]) => {
    const R = r + dr, C2 = c + dc;
    if (R >= 0 && R < N && C2 >= 0 && C2 < N) o.push(R * N + C2);
  });
  return o;
}
export function nearRiver(S, i) { return neigh(S, i).some(j => S.map[j].t === 'rio'); }
export function countT(S, t) { return S.map.filter(x => x.t === t).length; }

export function genMap(seed, N = LADO_V9) {
  const idx = (r, c) => r * N + c;
  const R = mulberry(seed), rn = n => Math.floor(R() * n);
  const m = Array.from({ length: N * N }, () => ({ t: 'llano', b: null }));
  // Río principal que baja serpenteando y, a veces, un afluente.
  let col = Math.floor(N * .3) + rn(Math.floor(N * .35));
  for (let r = 0; r < N; r++) {
    m[idx(r, col)].t = 'rio';
    if (R() < .35) { const nc = clamp(col + (R() < .5 ? -1 : 1), 2, N - 4); m[idx(r, nc)].t = 'rio'; col = nc; }
  }
  if (R() < .6) {
    let row = Math.floor(N * .55) + rn(Math.floor(N * .3)), c = 0;
    while (c < col) {
      m[idx(row, c)].t = 'rio';
      if (R() < .3 && row > 2 && row < N - 2) { row += R() < .5 ? -1 : 1; m[idx(row, c)].t = 'rio'; }
      c++;
    }
  }
  // Montañas en una esquina.
  const size = (2.5 + R() * 2) * N / 12;
  for (let r = 0; r < Math.ceil(N * .5); r++) for (let c = Math.floor(N * .45); c < N; c++) {
    if (m[idx(r, c)].t === 'llano' && r + (N - 1 - c) < size + R() * 2.5) m[idx(r, c)].t = 'montana';
  }
  // Laguna.
  const lakes = R() < .5 ? 1 : 0;
  for (let k = 0; k < lakes; k++) {
    const lr = Math.floor(N * .5) + rn(Math.floor(N * .3)), lc = rn(Math.floor(N * .2)) + 1;
    [[0, 0], [0, 1], [1, 0], [1, 1]].forEach(([a, b]) => { if (R() < .85) m[idx(lr + a, lc + b)].t = 'rio'; });
  }
  // Bosques.
  const forests = Math.round((4 + rn(3)) * N * N / 144);
  for (let k = 0; k < forests; k++) {
    const cr = rn(N), cc = rn(N);
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      const r2 = cr + dr, c2 = cc + dc;
      if (r2 >= 0 && r2 < N && c2 >= 0 && c2 < N && m[idx(r2, c2)].t === 'llano' && R() < .65) m[idx(r2, c2)].t = 'bosque';
    }
  }
  // Relieve: ruido suave, laderas cerca de las montañas, río en el fondo del valle.
  const nz = Array.from({ length: N * N }, () => R());
  for (let pass = 0; pass < 3; pass++) for (let i = 0; i < N * N; i++) {
    const r = Math.floor(i / N), c = i % N; let t = nz[i], n = 1;
    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([a, b]) => { const r2 = r + a, c2 = c + b; if (r2 >= 0 && r2 < N && c2 >= 0 && c2 < N) { t += nz[r2 * N + c2]; n++; } });
    nz[i] = t / n;
  }
  const dentro = (r2, c2) => r2 >= 0 && r2 < N && c2 >= 0 && c2 < N;
  for (let i = 0; i < N * N; i++) {
    const x = m[i], r = Math.floor(i / N), c = i % N;
    const nearM = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]].some(([a, b]) => dentro(r + a, c + b) && m[(r + a) * N + c + b].t === 'montana');
    x.h = x.t === 'rio' ? 0 : x.t === 'montana' ? 2 : (nz[i] > .58 ? 2 : nz[i] > .47 ? 1 : 0);
    if (nearM && x.t !== 'rio') x.h = Math.max(x.h, 1);
  }
  for (let i = 0; i < N * N; i++) {
    if (m[i].t === 'rio') continue;
    const r = Math.floor(i / N), c = i % N;
    if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => dentro(r + a, c + b) && m[(r + a) * N + c + b].t === 'rio')) m[i].h = Math.min(m[i].h, 1);
  }
  // Orientación: montañas a la derecha, a la izquierda o al fondo (nunca tapando el frente).
  const o = rn(3), out = Array.from({ length: N * N });
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    const [r2, c2] = o === 0 ? [r, c] : o === 1 ? [c, r] : [r, N - 1 - c];
    out[idx(r2, c2)] = m[idx(r, c)];
  }
  return out;
}

// Mapa lógico a partir del terreno continuo en acuarela.
// Río → río; páramo, roca y nevado → montaña (minas); bosque de niebla → bosque;
// el resto (valle, arrozales, potreros, laderas) → llano. La altura lógica 1 es ladera (café) y 2 es alta montaña.
export const LOGICO = { agua: 'rio', nieve: 'montana', roca: 'montana', paramo: 'montana', niebla: 'bosque' };
export function genMundo(seed, N = LADO_INICIAL) {
  const T = genTerreno(seed, N);
  return T.tiles.map(t => ({ t: LOGICO[t.b] || 'llano', b: null, h: t.b === 'agua' ? 0 : t.h > 4.4 ? 2 : t.h > 2 ? 1 : 0 }));
}
