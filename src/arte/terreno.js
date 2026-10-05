// Pintura del terreno en acuarela (tomada de la prueba de estilo aprobada), por sectores.
// Cada sector es un lienzo con un bloque de casillas; si algo cambia, solo se repinta su sector.
import { mulberry, clamp, shade, mix, poly, wash, blob, grano, lienzo } from './acuarela.js';
import { P, TW, TH, EL, alturaEn } from './iso.js';
import { yeso, FR } from './fresco.js';
import { C } from '../core/contenido.js';

export const LADO_SECTOR = 8;
const BASE = -2.2; // profundidad de los costados del diorama
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = t => t * t * (3 - 2 * t);

// Fase 8: colores de pigmento del fresco (tierra verde, ocres, azul egipcio, blanco de cal).
const GROUND = { agua: '#7AAAB6', galeria: '#8AA26C', arrozal: '#A9B97E', seco: '#D2B77E', potrero: '#B5B97C', ladera: '#93A56E', niebla: '#6A8360', paramo: '#C2B27A', roca: '#9C9184', nieve: '#F4EEE2' };
const DRYC = '#D4B27A';

function groundColor(t, dry, sub = 0) {
  let c = GROUND[t.b];
  if (t.b === 'agua') return mix('#D2C092', DRYC, dry * .3);
  if (['galeria', 'arrozal', 'potrero', 'ladera', 'niebla'].includes(t.b)) c = mix(c, DRYC, dry * (t.b === 'niebla' ? .25 : .45));
  if (t.b === 'seco') c = mix(c, '#D9B56C', dry * .4);
  if (t.b !== 'nieve' && t.b !== 'roca' && t.h - sub > 8.4) c = mix(c, '#F4EEE2', clamp((t.h - sub - 8.4) / 1.4, 0, .7));
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
  const low = mix(mix('#D6BC84', '#B5B97C', smooth(clamp((m - .35) / .3, 0, 1))), '#8AA26C', smooth(clamp((m - .75) / .25, 0, 1)));
  const lowD = mix(low, '#D6B57A', dry * .45);
  let col = band(h, [2, 4.4, 6.1, 7.6, 9], [lowD, mix('#93A56E', DRYC, dry * .4), mix('#6A8360', DRYC, dry * .15), '#C2B27A', '#9C9184', '#F4EEE2']);
  if (slope > 1.6 && h > 2) col = mix(col, '#9C9184', clamp((slope - 1.6) / 1.2, 0, .8));
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
  const wc = dry > .5 ? '#7E9EA2' : '#5F95AE'; // azul egipcio
  st(54, '#DCC79A', .6); st(42, '#5B3423', .25); st(40, shade(wc, -.1), .97); st(30, wc, .92); st(14, '#9CC2C8', .55);
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
  const dry = opciones.dry || 0, esc = opciones.escala || 1.5, N = T.N, sub = opciones.subida || 0; // fase 10: los pisos térmicos suben
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
    let col = groundColor(t, dry, sub);
    col = shade(col, (T.vary(t.c / 4, t.r / 4) - .5) * .1);
    const L2 = light(t);
    col = L2 >= 1 ? shade(col, (L2 - 1) * .8) : shade(col, (L2 - 1) * .9);
    const vary = (T.vary(t.c / 4, t.r / 4) - .5) * .1, far0 = 1 - (t.r + t.c) / (2 * N), SD = t.h > 4.4 ? 5 : 3; // fase 8: más fino en la montaña (sin mosaico en el nevado)
    for (let a = 0; a < SD; a++) for (let b = 0; b < SD; b++) {
      const r0 = t.r + a / SD, c0 = t.c + b / SD, r1 = r0 + 1 / SD, c1 = c0 + 1 / SD;
      const z00 = T.hf(r0, c0), z01 = T.hf(r0, c1), z11 = T.hf(r1, c1), z10 = T.hf(r1, c0);
      const sx = (z01 + z11 - z00 - z10) / 2 * SD, sy = (z10 + z11 - z00 - z01) / 2 * SD, Lq = clamp(1 + .2 * sx - .17 * sy, .62, 1.3);
      let cc = shade(colorAt(T, r0 + .5 / SD, c0 + .5 / SD, (z00 + z01 + z11 + z10) / 4 - sub, Math.hypot(sx, sy), dry), vary);
      cc = Lq >= 1 ? shade(cc, (Lq - 1) * .8) : shade(cc, (Lq - 1) * .9);
      cc = mix(cc, '#E6E2D6', far0 * .2);
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

  const recortar = () => { g.beginPath(); zona.forEach(z => { z.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); }); g.clip(); };

  // Obras en el suelo: explanadas, cultivos, cafetales, parques, minas, caminos y puentes.
  if (opciones.mapa) {
    g.save(); recortar();
    pintarSuelo(g, T, opciones.mapa, k, dry);
    pintarObras(g, T, opciones.mapa, k, dry, !!opciones.calles, opciones.anio);
    if (opciones.calles) pintarCalles(g, T, opciones.calles, k);
    g.restore();
  }

  // Grano del papel, solo sobre lo pintado y alineado con el mundo para que no se noten las uniones.
  g.save();
  recortar();
  g.globalCompositeOperation = 'multiply'; g.globalAlpha = .32;
  g.fillStyle = g.createPattern(yeso(), 'repeat'); // fase 8: textura de muro del fresco
  g.fillRect(k.x, k.y, k.w, k.h);
  g.restore();
  return { canvas: cv, x: k.x, y: k.y, w: k.w, h: k.h, escala: esc };
}

// Cielo, cordillera lejana y nevado, detrás del diorama.
export function pintarFondo(T, escala = 1, glaciar = 1) { // fase 10: el casquete del Nevado se encoge con el glaciar
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
  far([[X(0), OY + 90], [X(0), OY - 20], [X(.1), OY - 60], [X(.22), OY - 34], [X(.35), OY - 95], [X(.47), OY - 50], [X(.6), OY - 82], [X(.75), OY - 44], [X(.9), OY - 76], [X(1), OY - 46], [X(1), OY + 90]], 'rgba(150,166,152,.85)', .8);
  const nx = X(.36), nt = OY - 190;
  far([[nx - 280, OY + 60], [nx - 70, nt + 36], [nx - 22, nt + 7], [nx + 12, nt], [nx + 70, nt + 26], [nx + 300, OY + 60]], 'rgba(160,156,176,.9)', .85);
  const cap0 = [[nx - 92, nt + 50], [nx - 70, nt + 36], [nx - 22, nt + 7], [nx + 12, nt], [nx + 70, nt + 26], [nx + 98, nt + 47], [nx + 52, nt + 40], [nx + 16, nt + 54], [nx - 24, nt + 42], [nx - 54, nt + 56]];
  const kg = clamp(.25 + .75 * glaciar, .25, 1), cap = cap0.map(([x, y]) => [nx + 5 + (x - nx - 5) * kg, nt + (y - nt) * kg]); // la nieve se retira hacia la cumbre
  wash(g, cap, '#F7F1E3', R, .95, 0); g.globalAlpha = .5; g.strokeStyle = '#5B3423'; g.lineWidth = 1; poly(g, cap); g.stroke(); g.globalAlpha = 1; // nevado con contorno siena
  return { canvas: cv, x: izq, y: arriba, w: W, h: H, escala };
}

// ---------- Obras pintadas en el suelo ----------
const DE_PIE = new Set(['casa', 'mercado', 'escuela', 'hospital', 'taller', 'agora', 'banco', 'universidad', 'acueducto', 'molino', 'puerto', 'parque', 'fundacion', 'cementerio']);
const conCamino = b => !!b && b !== 'mina';

// Caminos entre obras vecinas y puentes cuando las separa una casilla de río (como en la versión 9).
export function caminos(T, mapa) {
  const N = T.N, segs = [], puentes = [];
  for (let i = 0; i < N * N; i++) {
    if (!conCamino(mapa[i].b)) continue;
    const r = Math.floor(i / N), c = i % N;
    for (const [dr, dc] of [[0, 1], [1, 0]]) {
      const r1 = r + dr, c1 = c + dc;
      if (r1 >= N || c1 >= N) continue;
      const j = r1 * N + c1;
      if (conCamino(mapa[j].b)) segs.push([i, j]);
      else if (mapa[j].t === 'rio') {
        const r2 = r1 + dr, c2 = c1 + dc;
        if (r2 < N && c2 < N && conCamino(mapa[r2 * N + c2].b)) { segs.push([i, r2 * N + c2]); puentes.push([i, j, r2 * N + c2, dr]); }
      }
    }
  }
  return { segs, puentes };
}

function pintarObras(g, T, mapa, k, dry, conCalles, anio) {
  const N = T.N, cerca = t => t.r >= k.r0 - 2 && t.r < k.r1 + 2 && t.c >= k.c0 - 2 && t.c < k.c1 + 2;
  const lista = T.tiles.filter(t => mapa[t.r * N + t.c].b && cerca(t)).sort((a, b) => (a.r + a.c) - (b.r + b.c));
  const { segs, puentes } = conCalles ? { segs: [], puentes: [] } : caminos(T, mapa); // fase 9: con calles, el jugador traza los caminos
  const centro = i => { const t = T.tiles[i]; return { r: t.r + .5, c: t.c + .5, h: mapa[i].b && DE_PIE.has(mapa[i].b) ? t.h : T.hf(t.r + .5, t.c + .5) }; };
  // Campos y minas (siguen el terreno).
  for (const t of lista) {
    const b = mapa[t.r * N + t.c].b, rng = mulberry(t.r * 313 + t.c * 71 + T.seed);
    const q = [P(t.r, t.c, t.h00), P(t.r, t.c + 1, t.h01), P(t.r + 1, t.c + 1, t.h11), P(t.r + 1, t.c, t.h10)];
    const x = mapa[t.r * N + t.c];
    if (b === 'cultivo' && x.cv && C.CULTIVOS) {
      // Fase 10: la finca se pinta según su cultivo; mientras no da cosecha, con matas pequeñas.
      const D = C.CULTIVOS.cultivos[x.cv], joven = anio !== undefined && x.cvDesde !== undefined && D && anio < x.cvDesde + D.madura;
      if (x.cv === 'arroz') pintarArroz(g, T, t, q, rng, dry);
      else if (x.cv === 'pancoger') pintarHuerta(g, T, t, q, rng, dry);
      else if (x.cv === 'cafe') pintarCafe(g, T, t, rng, dry, joven);
      else pintarHuerto(g, T, t, q, rng, dry, x.cv, joven);
    }
    else if (b === 'cultivo') (t.h < 2.2 && t.d < 6 ? pintarArroz : pintarHuerta)(g, T, t, q, rng, dry);
    else if (b === 'cafetal') pintarCafe(g, T, t, rng, dry);
    else if (b === 'mina') { const c = P(t.r + .55, t.c + .5, t.h); blob(g, c[0] + 4, c[1] + 3, 22, 8, '#8E857A', rng, .75); blob(g, c[0] - 6, c[1] + 1, 12, 5, '#6E6358', rng, .6); }
  }
  // Caminos de tierra.
  for (const [a, b] of segs) {
    const A = centro(a), B = centro(b), rng = mulberry(a * 31 + b);
    g.lineCap = 'round';
    for (let pass = 0; pass < 2; pass++) {
      g.globalAlpha = pass ? .35 : .62; g.strokeStyle = pass ? '#9C8058' : '#CDB488'; g.lineWidth = pass ? 1.4 : 4.6; g.beginPath();
      for (let s = 0; s <= 10; s++) {
        const f = s / 10, r = lerp(A.r, B.r, f), c = lerp(A.c, B.c, f), h = s === 0 ? A.h : s === 10 ? B.h : Math.max(T.hf(r, c), lerp(A.h, B.h, f) - .3);
        const p = P(r + (s % 10 ? (rng() - .5) * .04 : 0), c, h); s ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]);
      }
      g.stroke();
    }
  }
  g.globalAlpha = 1;
  // Puentes de madera sobre el río.
  for (const [a, j, b, dr] of puentes) {
    const A = centro(a), B = centro(b), t = T.tiles[j], h = Math.max(A.h, B.h, t.h) - .1, rng = mulberry(j * 17);
    const L = dr ? [[t.r - .1, t.c + .36], [t.r - .1, t.c + .64], [t.r + 1.1, t.c + .64], [t.r + 1.1, t.c + .36]] : [[t.r + .36, t.c - .1], [t.r + .64, t.c - .1], [t.r + .64, t.c + 1.1], [t.r + .36, t.c + 1.1]];
    const pts = L.map(([r, c]) => P(r, c, h));
    wash(g, pts, '#9B7650', rng, .97, .2);
    g.strokeStyle = '#5E4330'; g.lineWidth = .7; g.globalAlpha = .7;
    for (let s = 1; s < 8; s++) { const f = s / 8, p = [lerp(pts[0][0], pts[3][0], f), lerp(pts[0][1], pts[3][1], f)], q = [lerp(pts[1][0], pts[2][0], f), lerp(pts[1][1], pts[2][1], f)]; g.beginPath(); g.moveTo(...p); g.lineTo(...q); g.stroke(); }
    g.lineWidth = 1.1; g.beginPath(); g.moveTo(pts[0][0], pts[0][1] - 4); g.lineTo(pts[3][0], pts[3][1] - 4); g.moveTo(pts[1][0], pts[1][1] - 4); g.lineTo(pts[2][0], pts[2][1] - 4); g.stroke();
    g.globalAlpha = 1;
  }
  // Explanadas niveladas para los edificios (evitan que floten en las laderas).
  for (const t of lista) {
    const b = mapa[t.r * N + t.c].b;
    if (!DE_PIE.has(b)) continue;
    const rng = mulberry(t.r * 911 + t.c * 37 + T.seed), m = .07, h = t.h;
    const esq = [[t.r + m, t.c + m], [t.r + m, t.c + 1 - m], [t.r + 1 - m, t.c + 1 - m], [t.r + 1 - m, t.c + m]];
    const [A, B, C, D] = esq, tierra = ([r, c]) => T.hf(r, c);
    const lado = (p, q, col) => { const hp = tierra(p), hq = tierra(q); if (hp >= h && hq >= h) return; wash(g, [P(p[0], p[1], h), P(q[0], q[1], h), P(q[0], q[1], Math.min(hq, h)), P(p[0], p[1], Math.min(hp, h))], col, rng, .95, .2); };
    lado(D, C, '#A88B62'); lado(C, B, '#8C7250');
    const top = esq.map(([r, c]) => P(r, c, h));
    wash(g, top, b === 'parque' ? mix('#9CC57D', DRYC, dry * .5) : b === 'fundacion' ? '#DCCDA8' : b === 'cementerio' ? '#C2C29A' : '#CDBB93', rng, .95, .6);
    if (b === 'parque') { const c = P(t.r + .5, t.c + .5, h); g.globalAlpha = .7; g.fillStyle = '#E7DDC4'; g.beginPath(); g.ellipse(c[0], c[1], 17, 7, 0, 0, 7); g.fill(); g.globalAlpha = 1; }
    else { g.globalAlpha = .18; g.strokeStyle = '#8C7250'; g.lineWidth = .6; for (let s = 0; s < 5; s++) { const c = P(t.r + .2 + rng() * .6, t.c + .2 + rng() * .6, h); g.beginPath(); g.moveTo(c[0] - 3, c[1]); g.lineTo(c[0] + 3, c[1] + .5); g.stroke(); } g.globalAlpha = 1; }
  }
}

// ---------- Calles en damero (fase 9) ----------
// dib: { era, tramos: [[a, b, agua]], esquinas: [[e, v1, v2]] }, con esquinas e = r * (N + 1) + c.
// Pedido de Juan (5 de octubre): caminos planos, sin borde dibujado, que se funden con el suelo como tierra gastada.
export const ESTILO_CALLE = {
  herradura: { ancho: 4.5, borde: '#8C7656', color: '#B9A27C', centro: '#C9B48E' },
  empedrado: { ancho: 6.5, borde: '#8E8576', color: '#B4AA98', centro: '#C2B9A7' },
  carretera: { ancho: 8.5, borde: '#6E685F', color: '#68625B', centro: '#716B63' }
};
function pintarCalles(g, T, dib, k) {
  const N = T.N, M = N + 1, E = ESTILO_CALLE[dib.era] || ESTILO_CALLE.herradura;
  const rc = e => [Math.floor(e / M), e % M], dentro = e => { const [r, c] = rc(e); return r >= k.r0 - 1 && r <= k.r1 + 1 && c >= k.c0 - 1 && c <= k.c1 + 1; };
  const tramos = dib.tramos.filter(([a, b]) => dentro(a) || dentro(b));
  if (!tramos.length) return;
  // Puntos del tramo siguiendo el relieve (los puentes van rectos, a la altura de las orillas).
  const pts = (a, b, agua) => {
    const [r1, c1] = rc(a), [r2, c2] = rc(b), L = [];
    if (agua) return [P(r1, c1, T.hv(r1, c1)), P(r2, c2, T.hv(r2, c2))];
    for (let s2 = 0; s2 <= 4; s2++) { const f = s2 / 4, r = lerp(r1, r2, f), c = lerp(c1, c2, f); L.push(P(r, c, T.hf(Math.min(N, r), Math.min(N, c)))); }
    return L;
  };
  const geo = tramos.map(([a, b, agua]) => ({ a, b, agua, L: pts(a, b, agua) }));
  const linea = L => { g.beginPath(); L.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke(); };
  const capa = (ancho, col, al, dash) => { g.save(); g.globalAlpha = al; g.strokeStyle = col; g.lineWidth = ancho; g.lineCap = 'round'; g.lineJoin = 'round'; if (dash) g.setLineDash(dash); for (const t of geo) linea(t.L); g.restore(); };
  // Orilla difusa (sin línea de contorno), cuerpo semitransparente y un centro más gastado: no parece en relieve.
  capa(E.ancho + 3, E.borde, .14); capa(E.ancho + 1, E.color, .45); capa(E.ancho * .55, E.centro, .5);
  const enLinea = (L, t) => { const n = L.length - 1, x = Math.min(n - 1e-6, t * n), i = Math.floor(x), f = x - i; return [lerp(L[i][0], L[i + 1][0], f), lerp(L[i][1], L[i + 1][1], f)]; };
  if (dib.era === 'empedrado') { g.save(); g.fillStyle = shade(E.color, -.25); g.globalAlpha = .55; for (const t of geo) { const R = mulberry(t.a * 31 + t.b); for (let j = 0; j < 16; j++) { const p = enLinea(t.L, R()); g.beginPath(); g.ellipse(p[0] + (R() - .5) * 4, p[1] + (R() - .5) * 2.4, 1, .65, 0, 0, 7); g.fill(); } } g.restore(); }
  if (dib.era === 'carretera') capa(.7, '#D9C9A0', .6, [4, 5]);
  if (dib.era === 'herradura') { g.save(); g.fillStyle = '#7A6447'; g.globalAlpha = .18; for (const t of geo) for (let j = 1; j < 6; j++) { const p = enLinea(t.L, j / 6); g.beginPath(); g.arc(p[0], p[1], .6, 0, 7); g.fill(); } g.restore(); }
  // Puentes: tramos sobre el agua y esquinas por donde pasa el río.
  const puente = (p, q) => {
    g.save(); g.lineCap = 'butt';
    g.strokeStyle = FR.siena; g.globalAlpha = .55; g.lineWidth = E.ancho + 6; g.beginPath(); g.moveTo(...p); g.lineTo(...q); g.stroke();
    g.globalAlpha = 1; g.strokeStyle = dib.era === 'herradura' ? FR.sienaClara : FR.cal; g.lineWidth = E.ancho + 4; g.beginPath(); g.moveTo(...p); g.lineTo(...q); g.stroke();
    g.strokeStyle = E.color; g.lineWidth = E.ancho - .5; g.beginPath(); g.moveTo(...p); g.lineTo(...q); g.stroke(); g.restore();
  };
  const alargar = (p, q, f) => { const m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]; return [[m[0] + (p[0] - m[0]) * f, m[1] + (p[1] - m[1]) * f], [m[0] + (q[0] - m[0]) * f, m[1] + (q[1] - m[1]) * f]]; };
  for (const t of geo) if (t.agua) puente(...alargar(t.L[0], t.L[1], 1.1));
  for (const [e, v1, v2] of dib.esquinas || []) {
    if (!dentro(e)) continue;
    const [r, c] = rc(e), h = T.hv(r, c), mitad = v => { const [R, Cc] = rc(v); return P((r + R) / 2, (c + Cc) / 2, Math.max(h, T.hf(Math.min(N, (r + R) / 2), Math.min(N, (c + Cc) / 2)))); };
    puente(mitad(v1), mitad(v2));
  }
}

// Suelo vivo (fase 1): bosque que volvió, cenizas de un incendio, laderas erosionadas y derrumbes.
function pintarSuelo(g, T, mapa, k, dry) {
  const N = T.N;
  for (const t of T.tiles) {
    if (t.r < k.r0 - 1 || t.r >= k.r1 + 1 || t.c < k.c0 - 1 || t.c >= k.c1 + 1) continue;
    const x = mapa[t.r * N + t.c];
    if (!x || !(x.q > 0 || x.er > 0 || x.dr > 0 || (x.t === 'bosque' && t.b !== 'niebla'))) continue;
    const rng = mulberry(t.r * 577 + t.c * 29 + T.seed);
    const punto = (u, v) => P(t.r + v, t.c + u, T.hf(t.r + v, t.c + u));
    // Manchas suaves e irregulares (acuarela), en lugar de rellenar el rombo entero.
    const manchas = (col, n, al, tam = 1) => { for (let j = 0; j < n; j++) { const p = punto(.18 + rng() * .64, .18 + rng() * .64), rx = (8 + rng() * 7) * tam; blob(g, p[0], p[1], rx, rx * .5, col, rng, al); } };
    if (x.dr > 0) {
      // Derrumbe: lengua de tierra removida que baja por la ladera, con piedras sueltas.
      const L = Math.hypot(t.sx, t.sy) || 1, bv = t.sy / L, bu = t.sx / L; // dirección cuesta arriba
      // De arriba hacia abajo: la cicatriz oscura en lo alto y la tierra que se abre al caer.
      for (let j = 0; j <= 7; j++) {
        const f = j / 7, u = .5 + bu * (.4 - f * .75), v = .5 + bv * (.4 - f * .75), p = punto(clamp(u, .05, .95), clamp(v, .05, .95)), rx = 5 + f * 11;
        blob(g, p[0], p[1], rx, rx * .5, j < 2 ? '#7A5436' : mix('#A5774C', '#B8946A', dry * .5), rng, .55);
      }
      for (let j = 0; j < 8; j++) { const f = .5 + rng() * .5, p = punto(clamp(.5 - bu * (f * .5 - .1) + (rng() - .5) * .4, .05, .95), clamp(.5 - bv * (f * .5 - .1) + (rng() - .5) * .4, .05, .95)); blob(g, p[0], p[1], 1.4 + rng() * 1.8, .9 + rng() * .8, rng() < .5 ? '#9A938A' : '#7F776C', rng, .9); }
      continue;
    }
    if (x.t === 'bosque') { manchas(mix('#5A8650', DRYC, dry * .3), 7, .3, 1.2); continue; }
    if (x.q > 0) {
      // Cenizas: suelo oscuro que se aclara con los años.
      const f = Math.min(1, .35 + x.q / 5);
      manchas('#554A40', 8, .38 * f); manchas('#3E352E', 4, .3 * f, .6);
      g.globalAlpha = .4 * f; g.fillStyle = '#8C8680';
      for (let j = 0; j < 6; j++) { const p = punto(.1 + rng() * .8, .1 + rng() * .8); g.beginPath(); g.ellipse(p[0], p[1], 1.4 + rng() * 1.6, .6, 0, 0, 7); g.fill(); }
      g.globalAlpha = 1;
    }
    if (x.er > 0) {
      // Erosión: tierra desnuda y cárcavas que bajan por la pendiente.
      manchas(mix('#B88A5C', '#C9A57A', dry * .4), 3 + x.er * 2, .12 + .08 * x.er);
      const L = Math.hypot(t.sx, t.sy) || 1, du = -t.sx / L, dv = -t.sy / L;
      g.strokeStyle = '#80583A'; g.lineCap = 'round';
      for (let j = 0; j < x.er * 3; j++) {
        let u = .15 + rng() * .7, v = .15 + rng() * .7;
        g.globalAlpha = .3 + .12 * x.er; g.lineWidth = .6 + rng() * .5; g.beginPath();
        for (let s = 0; s <= 5; s++) {
          const p = punto(clamp(u, .02, .98), clamp(v, .02, .98)); s ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]);
          u += du * .07 + (rng() - .5) * .05; v += dv * .07 + (rng() - .5) * .05;
        }
        g.stroke();
      }
      g.globalAlpha = 1;
    }
  }
}

function pintarCafe(g, T, t, rng, dry, joven) {
  const col = mix('#2E5E36', '#6E7A3A', dry * .4);
  wash(g, [P(t.r + .05, t.c + .05, t.h00), P(t.r + .05, t.c + .95, t.h01), P(t.r + .95, t.c + .95, t.h11), P(t.r + .95, t.c + .05, t.h10)], mix('#8E7A52', '#A89A6A', dry), rng, .45, .6);
  for (let a = 0; a < 4; a++) for (let b = 0; b < 6; b++) {
    const u = .14 + b * .145, v = .18 + a * .21 + Math.sin(b * .9 + a) * .03, r = t.r + v, c = t.c + u, p = P(r, c, T.hf(r, c));
    g.globalAlpha = .18; g.fillStyle = '#22301E'; g.beginPath(); g.ellipse(p[0] + 2, p[1] + .5, 3.2, 1.2, 0, 0, 7); g.fill(); g.globalAlpha = 1;
    if (joven) { blob(g, p[0], p[1] - 1.2, 1.4, 1.2, col, rng, .9); continue; }
    blob(g, p[0], p[1] - 2.4, 3, 2.6, col, rng, .95);
    if (rng() < .45 && dry < .6) { g.fillStyle = '#B8322A'; g.beginPath(); g.arc(p[0] + (rng() - .5) * 3, p[1] - 2.8, .75, 0, 7); g.fill(); }
  }
}
function pintarArroz(g, T, t, q, rng, dry) {
  const wet = dry < .5;
  wash(g, q, wet ? '#A3B98A' : '#C9BC80', rng, .5, 0); // fase 8: arrozal en tierra verde, sin el azul que hacía cuadrícula
  g.globalAlpha = .4; g.strokeStyle = wet ? '#7E9A62' : '#A89A55'; g.lineWidth = .8;
  for (let k = 1; k < 7; k++) { const f = k / 7, a = [lerp(q[0][0], q[3][0], f), lerp(q[0][1], q[3][1], f)], b = [lerp(q[1][0], q[2][0], f), lerp(q[1][1], q[2][1], f)]; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); }
  g.globalAlpha = 1;
  if (wet) { g.globalAlpha = .3; g.fillStyle = '#E9F0E6'; g.beginPath(); g.ellipse((q[0][0] + q[2][0]) / 2 - 6, (q[0][1] + q[2][1]) / 2 - 2, 6, 1.2, -.4, 0, 7); g.fill(); g.globalAlpha = 1; }
  g.globalAlpha = .18; g.strokeStyle = '#8B7A55'; g.lineWidth = .8; poly(g, q); g.stroke(); g.globalAlpha = 1;
}
// Fase 10: fincas de plátano, cacao, aguacate, algodón y ganadería (matas pequeñas si aún no producen).
function pintarHuerto(g, T, t, q, rng, dry, cv, joven) {
  const pt = (u, v) => { const r = t.r + v, c = t.c + u; return P(r, c, T.hf(r, c)); };
  if (cv === 'ganaderia') {
    wash(g, q, mix('#A9B66E', DRYC, dry * .6), rng, .55, .6);
    g.globalAlpha = .7; g.strokeStyle = '#6B4A30'; g.lineWidth = .8;
    const borde = [pt(.06, .06), pt(.94, .06), pt(.94, .94), pt(.06, .94)];
    g.beginPath(); borde.forEach((p, k) => k ? g.lineTo(p[0], p[1] - 2) : g.moveTo(p[0], p[1] - 2)); g.closePath(); g.stroke();
    for (const p of borde) { g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(p[0], p[1] - 3); g.stroke(); }
    g.globalAlpha = 1;
    for (const [u, v] of [[.35, .4], [.65, .62], [.45, .75]]) { const p = pt(u, v); blob(g, p[0], p[1] - 2.6, 4, 2.2, '#F2EEE4', rng, .97); blob(g, p[0] - 1, p[1] - 2.9, 1.6, 1, '#2E2723', rng, .9); blob(g, p[0] + 4, p[1] - 3.4, 1.6, 1.3, '#F2EEE4', rng, .97); }
    return;
  }
  const suelo = cv === 'algodon' ? mix('#B99A6A', '#C9B07A', dry) : mix('#8E7A52', '#A89A6A', dry);
  wash(g, q, suelo, rng, .5, .6);
  const filas = cv === 'algodon' ? 5 : 3, cols = cv === 'algodon' ? 6 : 4, s = joven ? .45 : 1;
  for (let a = 0; a < filas; a++) for (let b = 0; b < cols; b++) {
    const u = .14 + b * (.72 / (cols - 1)), v = .16 + a * (.68 / (filas - 1)), p = pt(u, v);
    g.globalAlpha = .18; g.fillStyle = '#22301E'; g.beginPath(); g.ellipse(p[0] + 2, p[1] + .5, 3.4 * s, 1.2 * s, 0, 0, 7); g.fill(); g.globalAlpha = 1;
    if (cv === 'algodon') { blob(g, p[0], p[1] - 1.6, 2.2 * s, 1.6 * s, mix('#5E8A46', '#B8A65A', dry * .7), rng, .9); if (!joven) for (let k = 0; k < 3; k++) { g.fillStyle = '#F6F2EA'; g.beginPath(); g.arc(p[0] + (rng() - .5) * 3.4, p[1] - 2.2 - rng() * 1.5, .9, 0, 7); g.fill(); } continue; }
    if (cv === 'platano') { g.save(); g.translate(p[0], p[1] - 3 * s); for (let k = 0; k < 5; k++) { g.save(); g.rotate(-Math.PI / 2 + (k - 2) * .6); g.fillStyle = mix('#6FA04A', '#B3A65A', dry * .5); g.beginPath(); g.ellipse(0, -3 * s, 1.1 * s, 3.4 * s, 0, 0, 7); g.fill(); g.restore(); } g.restore(); continue; }
    const col = cv === 'cacao' ? mix('#3E6A3A', '#7A7A40', dry * .4) : mix('#2F5432', '#6E7A3A', dry * .4);
    blob(g, p[0], p[1] - 3.2 * s, (cv === 'aguacate' ? 3.6 : 3.1) * s, (cv === 'aguacate' ? 3.4 : 2.8) * s, col, rng, .95);
    if (!joven && cv === 'cacao') for (let k = 0; k < 2; k++) { g.fillStyle = k ? '#C9822E' : '#9C2F25'; g.beginPath(); g.ellipse(p[0] + (k ? 1.6 : -1.4), p[1] - 1.4, .7, 1.1, 0, 0, 7); g.fill(); }
    if (!joven && cv === 'aguacate') { g.fillStyle = '#4E6E2A'; g.beginPath(); g.ellipse(p[0] + 1.2, p[1] - 2, .7, .9, 0, 0, 7); g.fill(); }
  }
  g.globalAlpha = .4; g.strokeStyle = '#8B7A55'; g.lineWidth = .8; poly(g, q); g.stroke(); g.globalAlpha = 1;
}
// Huerta de maíz, fríjol y yuca en surcos, para los cultivos lejos de la llanura.
function pintarHuerta(g, T, t, q, rng, dry) {
  wash(g, q, mix('#B99A6A', '#C9B07A', dry), rng, .75, .6);
  const col = mix('#4F8A43', '#C9A94A', dry * .8);
  for (let a = 0; a < 5; a++) {
    const v = .12 + a * .19;
    g.globalAlpha = .45; g.strokeStyle = '#8C6F48'; g.lineWidth = 1; g.beginPath();
    for (let b = 0; b <= 6; b++) { const r = t.r + v, c = t.c + .06 + b * .147, p = P(r, c, T.hf(r, c)); b ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); }
    g.stroke(); g.globalAlpha = 1;
    for (let b = 0; b < 6; b++) { const r = t.r + v, c = t.c + .12 + b * .15, p = P(r, c, T.hf(r, c)); blob(g, p[0], p[1] - 2, 2.6, 2.2, col, rng, .85); if (rng() < .2) { g.fillStyle = '#E0B040'; g.beginPath(); g.arc(p[0] + 1, p[1] - 3, .7, 0, 7); g.fill(); } }
  }
  g.globalAlpha = .5; g.strokeStyle = '#8B7A55'; g.lineWidth = .9; poly(g, q); g.stroke(); g.globalAlpha = 1;
}

// Sectores que hay que repintar cuando cambia la casilla i (incluye vecinos por caminos y puentes).
export function sectoresAfectados(T, i) {
  const N = T.N, r = Math.floor(i / N), c = i % N, S = new Set();
  for (let dr = -2; dr <= 2; dr++) for (let dc = -2; dc <= 2; dc++) {
    const R = r + dr, C = c + dc;
    if (R >= 0 && C >= 0 && R < N && C < N) S.add(`${Math.floor(R / LADO_SECTOR)}-${Math.floor(C / LADO_SECTOR)}`);
  }
  return [...S].map(x => x.split('-').map(Number));
}
