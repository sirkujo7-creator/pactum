// Pintura del terreno en acuarela (tomada de la prueba de estilo aprobada), por sectores.
// Cada sector es un lienzo con un bloque de casillas; si algo cambia, solo se repinta su sector.
import { mulberry, clamp, shade, mix, poly, wash, blob, grano, lienzo } from './acuarela.js';
import { P, TW, TH, EL, alturaEn } from './iso.js';

export const LADO_SECTOR = 8;
const BASE = -2.2; // profundidad de los costados del diorama
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = t => t * t * (3 - 2 * t);

const GROUND = { agua: '#7DB0C6', galeria: '#86AE66', arrozal: '#A9CB84', seco: '#D1BE82', potrero: '#B8C67E', ladera: '#9DBA6C', niebla: '#6E9567', paramo: '#BDB47A', roca: '#9A938A', nieve: '#F3F2EC' };
const DRYC = '#D5B878';

function groundColor(t, dry) {
  let c = GROUND[t.b];
  if (t.b === 'agua') return mix('#C8BA8E', DRYC, dry * .3);
  if (['galeria', 'arrozal', 'potrero', 'ladera', 'niebla'].includes(t.b)) c = mix(c, DRYC, dry * (t.b === 'niebla' ? .25 : .45));
  if (t.b === 'seco') c = mix(c, '#D9B56C', dry * .4);
  if (t.b !== 'nieve' && t.b !== 'roca' && t.h > 8.4) c = mix(c, '#F3F2EC', clamp((t.h - 8.4) / 1.4, 0, .7));
  return c;
}
// Mezcla suave entre bandas de altura.
function band(h, edges, cols) {
  for (let i = 0; i < edges.length; i++) {
    const e = edges[i];
    if (h < e - .35) return cols[i];
    if (h < e + .35) return mix(cols[i], cols[i + 1], smooth((h - (e - .35)) / .7));
  }
  return cols[cols.length - 1];
}
function colorAt(T, r, c, h, slope, dry) {
  const m = T.moistAt(r, c);
  const low = mix(mix('#D3BF83', '#B9C67E', smooth(clamp((m - .35) / .3, 0, 1))), '#8DB36B', smooth(clamp((m - .75) / .25, 0, 1)));
  const lowD = mix(low, '#D6B878', dry * .45);
  let col = band(h, [2, 4.4, 6.1, 7.6, 9], [lowD, mix('#9DBA6C', DRYC, dry * .4), mix('#6E9567', DRYC, dry * .15), '#BDB47A', '#9A938A', '#F1F1EC']);
  if (slope > 1.6 && h > 2) col = mix(col, '#9A938A', clamp((slope - 1.6) / 1.2, 0, .8));
  return col;
}
const light = t => clamp(1 + .2 * t.sx - .17 * t.sy, .62, 1.3);

// Trazo del río en coordenadas del mundo (se usa para pintarlo y para su brillo animado).
export function caminoRio(T) {
  const pts = [], N = T.N;
  for (let k = -80; k <= 80; k++) {
    const s = k / 80 * 1.1, mid = T.riverMid(s), r = (mid - s * N) / 2, c = (mid + s * N) / 2;
    if (r < -1 || c < -1 || r > N + 1 || c > N + 1) continue;
    pts.push({ r, c, p: P(r, c, Math.max(0, alturaEn(T, r, c)) - .15) });
  }
  return pts;
}

function pintarRio(g, T, qx, dry) {
  if (!T._rio) T._rio = caminoRio(T).map(x => x.p);
  const pts = T._rio;
  g.save(); poly(g, qx); g.clip();
  const st = (w, col, al) => {
    g.globalAlpha = al; g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke();
  };
  const wc = dry > .5 ? '#86A7A8' : '#6FA8C2';
  st(54, '#D2C497', .55); st(40, shade(wc, -.08), .95); st(30, wc, .9); st(14, shade(wc, .22), .55);
  g.restore(); g.globalAlpha = 1;
}

// Caja del sector en coordenadas del mundo.
export function cajaSector(T, sr, sc) {
  const N = T.N, L = LADO_SECTOR, r0 = sr * L, c0 = sc * L, r1 = Math.min(N, r0 + L), c1 = Math.min(N, c0 + L);
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  const ver = (r, c, h) => { const p = P(r, c, h); x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); };
  for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) ver(r, c, T.hv(r, c));
  if (r1 === N) for (let c = c0; c <= c1; c++) ver(N, c, BASE);
  if (c1 === N) for (let r = r0; r <= r1; r++) ver(r, N, BASE);
  const m = 6; // margen para los bordes irregulares de la acuarela
  return { r0, c0, r1, c1, x: Math.floor(x0 - m), y: Math.floor(y0 - m), w: Math.ceil(x1 - x0 + 2 * m), h: Math.ceil(y1 - y0 + 2 * m) };
}

// Pinta un sector. opciones: { dry (0 lluvias a 1 sequía), escala (resolución) }.
export function pintarSector(T, sr, sc, opciones = {}, lienzoPrevio = null) {
  const dry = opciones.dry || 0, esc = opciones.escala || 1.5, N = T.N;
  const k = cajaSector(T, sr, sc);
  const cv = lienzoPrevio && lienzoPrevio.width === Math.ceil(k.w * esc) ? lienzoPrevio : lienzo(k.w * esc, k.h * esc);
  const g = cv.getContext('2d');
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height);
  g.setTransform(esc, 0, 0, esc, -k.x * esc, -k.y * esc);
  const rngB = mulberry(T.seed * 3 + sr * 31 + sc);
  const zona = [];

  // Costados del diorama (tierra con estratos), solo en los sectores del borde delantero.
  const costado = (a, b, col) => { wash(g, [a[0], b[0], b[1], a[1]], col, rngB, .97, 0); zona.push([a[0], b[0], b[1], a[1]]); };
  if (k.r1 === N) for (let c = k.c0; c < k.c1; c++) costado([P(N, c, T.hv(N, c)), P(N, c, BASE)], [P(N, c + 1, T.hv(N, c + 1)), P(N, c + 1, BASE)], '#9E805C');
  if (k.c1 === N) for (let r = k.r0; r < k.r1; r++) costado([P(r, N, T.hv(r, N)), P(r, N, BASE)], [P(r + 1, N, T.hv(r + 1, N)), P(r + 1, N, BASE)], '#7D6347');
  [[.35, '#B69770'], [.7, '#6C543C']].forEach(([f, col]) => {
    g.globalAlpha = .4; g.strokeStyle = col; g.lineWidth = 1.3; g.beginPath();
    if (k.r1 === N) for (let c = k.c0; c <= k.c1; c++) { const p = P(N, c, T.hv(N, c) * (1 - f) + BASE * f); c === k.c0 ? g.moveTo(...p) : g.lineTo(...p); }
    if (k.c1 === N) for (let r = k.r1; r >= k.r0; r--) { const p = P(r, N, T.hv(r, N) * (1 - f) + BASE * f); (r === k.r1 && k.r1 !== N) ? g.moveTo(...p) : g.lineTo(...p); }
    g.stroke();
  });
  g.globalAlpha = 1;

  // Casillas del sector, de atrás hacia adelante, con subdivisiones para que la luz sea continua.
  const tiles = [];
  for (let r = k.r0; r < k.r1; r++) for (let c = k.c0; c < k.c1; c++) tiles.push(T.tiles[r * N + c]);
  tiles.sort((a, b) => (a.r + a.c) - (b.r + b.c));
  for (const t of tiles) {
    const rng = mulberry(t.r * 977 + t.c * 131 + T.seed);
    const q = [P(t.r, t.c, t.h00), P(t.r, t.c + 1, t.h01), P(t.r + 1, t.c + 1, t.h11), P(t.r + 1, t.c, t.h10)];
    const qc = [(q[0][0] + q[2][0]) / 2, (q[0][1] + q[2][1]) / 2];
    const qx = q.map(p => [qc[0] + (p[0] - qc[0]) * 1.035, qc[1] + (p[1] - qc[1]) * 1.035]);
    zona.push(qx);
    let col = groundColor(t, dry);
    col = shade(col, (T.vary(t.c / 4, t.r / 4) - .5) * .1);
    const L2 = light(t);
    col = L2 >= 1 ? shade(col, (L2 - 1) * .8) : shade(col, (L2 - 1) * .9);
    const vary = (T.vary(t.c / 4, t.r / 4) - .5) * .1, far0 = 1 - (t.r + t.c) / (2 * N), SD = 3;
    for (let a = 0; a < SD; a++) for (let b = 0; b < SD; b++) {
      const r0 = t.r + a / SD, c0 = t.c + b / SD, r1 = r0 + 1 / SD, c1 = c0 + 1 / SD;
      const z00 = T.hf(r0, c0), z01 = T.hf(r0, c1), z11 = T.hf(r1, c1), z10 = T.hf(r1, c0);
      const sx = (z01 + z11 - z00 - z10) / 2 * SD, sy = (z10 + z11 - z00 - z01) / 2 * SD, Lq = clamp(1 + .2 * sx - .17 * sy, .62, 1.3);
      let cc = shade(colorAt(T, r0 + .5 / SD, c0 + .5 / SD, (z00 + z01 + z11 + z10) / 4, Math.hypot(sx, sy), dry), vary);
      cc = Lq >= 1 ? shade(cc, (Lq - 1) * .8) : shade(cc, (Lq - 1) * .9);
      cc = mix(cc, '#DCE5E6', far0 * .22);
      const sq = [P(r0, c0, z00), P(r0, c1, z01), P(r1, c1, z11), P(r1, c0, z10)], s2 = [(sq[0][0] + sq[2][0]) / 2, (sq[0][1] + sq[2][1]) / 2];
      g.fillStyle = cc; poly(g, sq.map(p => [s2[0] + (p[0] - s2[0]) * 1.06, s2[1] + (p[1] - s2[1]) * 1.06])); g.fill();
    }
    if (t.b === 'agua') pintarRio(g, T, qx, dry);
    // Pinceladas según el entorno.
    const cx = qc[0], cy = qc[1];
    g.globalAlpha = .28; g.strokeStyle = shade(col, -.25); g.lineWidth = .7;
    if (['potrero', 'seco', 'paramo', 'ladera', 'galeria'].includes(t.b)) for (let j = 0; j < 4; j++) { const x = cx + (rng() - .5) * 38, y = cy + (rng() - .5) * 14; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 1.2, y - 3); g.stroke(); }
    if (t.b === 'roca') { g.globalAlpha = .35; for (let j = 0; j < 3; j++) { const x = cx + (rng() - .5) * 30, y = cy + (rng() - .5) * 10; g.beginPath(); g.moveTo(x - 6, y); g.lineTo(x, y - 2); g.lineTo(x + 7, y + 1); g.stroke(); } }
    g.globalAlpha = 1;
    if (t.b === 'paramo' && rng() < .08) blob(g, cx, cy + 1, 7, 3, '#8FB6C4', rng, .85); // lagunas de páramo
  }

  // Curvas de nivel suaves: ayudan a leer la altura.
  g.lineWidth = .7; g.strokeStyle = '#5E4B33';
  for (const t of tiles) {
    if (t.b === 'agua') continue;
    const hs = [t.h00, t.h01, t.h11, t.h10], ps = [[t.r, t.c], [t.r, t.c + 1], [t.r + 1, t.c + 1], [t.r + 1, t.c]];
    for (let L0 = 1; L0 < 7; L0++) {
      const pts = [];
      for (let e = 0; e < 4; e++) {
        const a = hs[e], b = hs[(e + 1) % 4];
        if ((a - L0) * (b - L0) < 0) { const f = (L0 - a) / (b - a), pa = ps[e], pb = ps[(e + 1) % 4]; pts.push(P(lerp(pa[0], pb[0], f), lerp(pa[1], pb[1], f), L0)); }
      }
      if (pts.length === 2) { g.globalAlpha = .13; g.beginPath(); g.moveTo(...pts[0]); g.lineTo(...pts[1]); g.stroke(); }
    }
  }
  g.globalAlpha = 1;

  // Grano del papel, solo sobre lo pintado y alineado con el mundo para que no se noten las uniones.
  g.save();
  g.beginPath(); zona.forEach(z => { z.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); });
  g.clip();
  g.globalCompositeOperation = 'multiply'; g.globalAlpha = .2;
  g.fillStyle = g.createPattern(grano(), 'repeat');
  g.fillRect(k.x, k.y, k.w, k.h);
  g.restore();
  return { canvas: cv, x: k.x, y: k.y, w: k.w, h: k.h, escala: esc };
}

// Cielo, cordillera lejana y nevado, detrás del diorama.
export function pintarFondo(T, escala = 1) {
  const N = T.N, izq = P(N, 0)[0] - 300, der = P(0, N)[0] + 300, arriba = P(0, 0, 12)[1] - 260, abajo = P(0, 0)[1] + N * TH * .35;
  const W = der - izq, H = abajo - arriba;
  const cv = lienzo(W * escala, H * escala), g = cv.getContext('2d'), R = mulberry(T.seed * 3 + 1);
  g.setTransform(escala, 0, 0, escala, -izq * escala, -arriba * escala);
  const OY = P(0, 0, 0)[1] - 20;
  const far = (pts, col, al) => {
    const q = g.createLinearGradient(0, OY - 200, 0, OY + 120);
    q.addColorStop(0, col); q.addColorStop(1, 'rgba(236,234,226,0)');
    g.globalAlpha = al; g.fillStyle = q; poly(g, pts); g.fill(); g.globalAlpha = 1;
  };
  const X = f => izq + W * f;
  far([[X(0), OY + 90], [X(0), OY - 20], [X(.1), OY - 60], [X(.22), OY - 34], [X(.35), OY - 95], [X(.47), OY - 50], [X(.6), OY - 82], [X(.75), OY - 44], [X(.9), OY - 76], [X(1), OY - 46], [X(1), OY + 90]], 'rgba(140,166,170,.8)', .8);
  const nx = X(.36), nt = OY - 190;
  far([[nx - 280, OY + 60], [nx - 70, nt + 36], [nx - 22, nt + 7], [nx + 12, nt], [nx + 70, nt + 26], [nx + 300, OY + 60]], 'rgba(150,170,186,.9)', .85);
  wash(g, [[nx - 92, nt + 50], [nx - 70, nt + 36], [nx - 22, nt + 7], [nx + 12, nt], [nx + 70, nt + 26], [nx + 98, nt + 47], [nx + 52, nt + 40], [nx + 16, nt + 54], [nx - 24, nt + 42], [nx - 54, nt + 56]], '#FBFBF8', R, .92, 1);
  return { canvas: cv, x: izq, y: arriba, w: W, h: H, escala };
}
