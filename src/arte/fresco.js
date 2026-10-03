// Pinceles del fresco pompeyano (fase 8, cambio visual): un solo estilo para el mapa, las obras, la gente y la
// interfaz. Colores planos de pigmento (rojo pompeyano, ocres, tierra verde, azul egipcio, blanco de cal), manchas
// suaves de muro, contorno siena y textura de yeso. Todo se pinta una vez y se hornea como textura.
import { mulberry, clamp, shade, mix, lienzo, poly } from './acuarela.js';
export { mulberry, clamp, shade, mix, lienzo, poly };

// Paleta de pigmentos.
export const FR = {
  yeso: '#EFE5CF', yesoOsc: '#E2D3B4', cal: '#F7F1E3', rojo: '#9C2F25', bermellon: '#B9442F', ocre: '#D4A24C',
  ocreClaro: '#E6C27A', ocreRojo: '#B5683A', siena: '#5B3423', sienaClara: '#8A5A3C', tierraVerde: '#869E6C',
  verde: '#6E8A57', verdeOsc: '#4E6A47', azul: '#3E7E9C', agua: '#7AAAB6', carbon: '#2E2723', violeta: '#6B3F5C',
  teja: '#B0563A', piel: ['#D9A27A', '#C08458', '#9A6744']
};

// Contorno siena, un poco tembloroso, como el trazo del pintor sobre el muro.
export function contorno(g, pts, rng, al = .75, w = .6, cerrar = true) {
  g.save(); g.globalAlpha = al; g.strokeStyle = FR.siena; g.lineWidth = w; g.lineJoin = 'round'; g.lineCap = 'round';
  g.beginPath();
  pts.forEach((p, i) => { const x = p[0] + (rng() - .5) * w * .5, y = p[1] + (rng() - .5) * w * .5; i ? g.lineTo(x, y) : g.moveTo(x, y); });
  if (cerrar) g.closePath();
  g.stroke(); g.restore();
}

// Manchas suaves del muro dentro de una figura (el pigmento nunca queda del todo parejo).
export function manchas(g, pts, col, rng, n = 6, al = .12) {
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const r = Math.max(2, Math.min(x1 - x0, y1 - y0) * .45);
  g.save(); poly(g, pts); g.clip();
  for (let k = 0; k < n; k++) {
    g.globalAlpha = al * (.5 + rng());
    g.fillStyle = k % 2 ? shade(col, .12) : shade(col, -.1);
    g.beginPath(); g.ellipse(x0 + rng() * (x1 - x0), y0 + rng() * (y1 - y0), r * (.5 + rng()), r * (.3 + rng() * .5), rng() * 3, 0, Math.PI * 2); g.fill();
  }
  g.restore(); g.globalAlpha = 1;
}

// Pinta una figura plana: color, manchas y (si se pide) contorno.
export function pintar(g, pts, col, rng, op = {}) {
  g.fillStyle = col; poly(g, pts); g.fill();
  if (op.manchas !== false) manchas(g, pts, col, rng, op.n || 5, op.al || .12);
  if (op.borde !== false) contorno(g, pts, rng, op.bal || .7, op.bw || .6);
}

// Óvalo pintado (copas de árbol, cabezas, piedras).
export function ovalo(g, x, y, rx, ry, col, rng, op = {}) {
  const pts = [];
  for (let k = 0; k < 18; k++) { const a = k / 18 * Math.PI * 2, j = 1 + (rng() - .5) * (op.j ?? .08); pts.push([x + Math.cos(a) * rx * j, y + Math.sin(a) * ry * j]); }
  pintar(g, pts, col, rng, op);
  return pts;
}

// Toques de luz (los puntos claros que usaban los pintores de Pompeya en las hojas).
export function toques(g, x, y, rx, ry, col, rng, n = 6, al = .8) {
  g.save(); g.fillStyle = col;
  for (let k = 0; k < n; k++) { g.globalAlpha = al * (.6 + rng() * .4); const a = rng() * Math.PI * 2, d = Math.sqrt(rng()); g.beginPath(); g.ellipse(x + Math.cos(a) * rx * d, y + Math.sin(a) * ry * d, .7 + rng() * .5, .5 + rng() * .4, rng() * 3, 0, Math.PI * 2); g.fill(); }
  g.restore();
}

// Textura de yeso: manchas grandes muy suaves y poros finos (se multiplica encima de lo pintado).
let YESO = null;
export function yeso() {
  if (YESO) return YESO;
  const N = 220, c = lienzo(N, N), g = c.getContext('2d'), r = mulberry(77);
  g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, N, N);
  for (let k = 0; k < 60; k++) { g.globalAlpha = .035; g.fillStyle = r() < .5 ? '#9C8A6A' : '#FFFFFF'; g.beginPath(); g.ellipse(r() * N, r() * N, 10 + r() * 40, 8 + r() * 30, r() * 3, 0, Math.PI * 2); g.fill(); }
  const im = g.getImageData(0, 0, N, N);
  for (let k = 0; k < im.data.length; k += 4) { const v = (r() - .5) * 22; im.data[k] += v; im.data[k + 1] += v; im.data[k + 2] += v * .9; }
  g.putImageData(im, 0, 0);
  g.globalAlpha = .12; g.strokeStyle = '#7A6648'; g.lineWidth = .5;
  for (let k = 0; k < 5; k++) { let x = r() * N, y = r() * N; g.beginPath(); g.moveTo(x, y); for (let s = 0; s < 6; s++) { x += (r() - .5) * 18; y += (r() - .3) * 14; g.lineTo(x, y); } g.stroke(); }
  g.globalAlpha = 1;
  return (YESO = c);
}
// Pasa la textura de yeso sobre lo ya pintado en una caja.
export function texturaYeso(g, x, y, w, h, al = .55) {
  g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = al; g.fillStyle = g.createPattern(yeso(), 'repeat'); g.fillRect(x, y, w, h); g.restore();
}

// Greca (meandro griego) en una franja horizontal.
export function greca(g, x, y, w, h, col) {
  const u = h / 4;
  g.save(); g.strokeStyle = col; g.lineWidth = Math.max(1, u * .9); g.lineCap = 'square'; g.lineJoin = 'miter';
  g.beginPath();
  for (let px = x; px < x + w - 4 * u; px += 4 * u) {
    g.moveTo(px, y + h); g.lineTo(px, y); g.lineTo(px + 3 * u, y); g.lineTo(px + 3 * u, y + 2 * u); g.lineTo(px + u, y + 2 * u); g.lineTo(px + u, y + u * 1.1);
    g.moveTo(px, y + h); g.lineTo(px + 4 * u, y + h);
  }
  g.stroke(); g.restore();
}

// Caja isométrica (obras): ancho a lo largo de las columnas, fondo a lo largo de las filas, alto en píxeles.
// Devuelve los puntos útiles. Origen: esquina delantera en el suelo.
export function cajaIso(w, d, h, TW = 64, TH = 32) {
  const Q = (r, c, z) => [(c - r) * TW / 2, (c + r) * TH / 2 - z];
  // centrada en (0,0) del rombo de su base
  const r0 = -d / 2, r1 = d / 2, c0 = -w / 2, c1 = w / 2;
  return {
    Q, r0, r1, c0, c1,
    izq: [Q(r1, c0, 0), Q(r1, c1, 0), Q(r1, c1, h), Q(r1, c0, h)],      // cara que mira hacia el frente-izquierda
    der: [Q(r0, c1, 0), Q(r1, c1, 0), Q(r1, c1, h), Q(r0, c1, h)],      // cara frente-derecha
    techo: [Q(r0, c0, h), Q(r0, c1, h), Q(r1, c1, h), Q(r1, c0, h)],
    base: [Q(r0, c0, 0), Q(r0, c1, 0), Q(r1, c1, 0), Q(r1, c0, 0)]
  };
}
// Punto dentro de una cara (u a lo ancho, v a lo alto, de 0 a 1).
export function enCara(cara, u, v) {
  const [a, b, c2, d] = cara, lerp = (p, q, t) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
  const abajo = lerp(a, b, u), arriba = lerp(d, c2, u);
  return lerp(abajo, arriba, v);
}
// Rectángulo dentro de una cara (puertas, ventanas, frisos).
export function rectCara(cara, u0, u1, v0, v1) { return [enCara(cara, u0, v0), enCara(cara, u1, v0), enCara(cara, u1, v1), enCara(cara, u0, v1)]; }

// Sombra suave en el suelo.
export function sombraSuelo(g, rx, ry, dx = 3, al = .22) { g.save(); g.globalAlpha = al; g.fillStyle = '#3A2A1C'; g.beginPath(); g.ellipse(dx, 1, rx, ry, 0, 0, Math.PI * 2); g.fill(); g.restore(); }


