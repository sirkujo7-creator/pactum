// Árboles y plantas al fresco (fase 8): menos, más pequeños y estilizados, como los jardines pintados de Pompeya.
// Copas redondeadas en tierra verde con la panza más oscura y toques de luz claros. Especies del Tolima: árbol de
// copa, samán, palma de cera, guadua, cafeto, plátano, arbusto y frailejón.
import { FR, mulberry, shade, mix, lienzo, pintar, ovalo, toques, sombraSuelo, contorno, RES_HOJA } from './fresco.js';

function tronco(g, x0, y0, x1, y1, w, rng, col = FR.sienaClara) {
  g.save(); g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo((x0 + x1) / 2 + (rng() - .5), (y0 + y1) / 2, x1, y1); g.stroke();
  g.globalAlpha = .5; g.strokeStyle = FR.siena; g.lineWidth = w * .35; g.beginPath(); g.moveTo(x0 + w * .3, y0); g.lineTo(x1 + w * .3, y1); g.stroke(); g.restore();
}
// Copa: tres óvalos, el de abajo más oscuro, el de arriba con toques de luz.
function copa(g, x, y, rx, ry, col, rng) {
  ovalo(g, x, y + ry * .25, rx, ry * .8, shade(col, -.18), rng, { n: 3, bw: .55 });
  ovalo(g, x - rx * .1, y - ry * .1, rx * .9, ry * .78, col, rng, { n: 3, borde: false });
  ovalo(g, x - rx * .25, y - ry * .35, rx * .55, ry * .45, shade(col, .12), rng, { n: 2, borde: false });
  toques(g, x - rx * .2, y - ry * .2, rx * .7, ry * .6, mix(col, FR.cal, .65), rng, 7, .75);
}

// [clave, ancho, alto, anclaX, anclaY, pintura]. seco: 0 lluvias a 1 sequía (las hojas se doran).
export function recetasFlora(seco = 0) {
  const hoja = c => mix(c, '#B39B57', seco * .45);
  return [
    ['arbol', 30, 36, 15, 32, (g, r) => { sombraSuelo(g, 8, 2.4, 3); tronco(g, 0, 0, 0, -9, 1.6, r); copa(g, 0, -15, 7.5, 7, hoja(FR.verde), r); }],
    ['saman', 46, 30, 23, 26, (g, r) => { sombraSuelo(g, 15, 3, 4); tronco(g, 0, 0, 0, -7, 1.8, r); tronco(g, 0, -5, -6, -9, 1.1, r); tronco(g, 0, -5, 6, -9, 1.1, r); ovalo(g, 0, -12, 14, 4.2, shade(hoja(FR.tierraVerde), -.15), r, { n: 3, bw: .55 }); ovalo(g, -1, -13.4, 12, 3.4, hoja(FR.tierraVerde), r, { n: 3, borde: false }); toques(g, -2, -13.5, 10, 2.4, mix(FR.tierraVerde, FR.cal, .6), r, 9, .7); }],
    // Fase 14: cardón (cactus columnar) del sur seco del Tolima.
    ['cardon', 20, 30, 10, 28, (g, r) => { sombraSuelo(g, 5, 1.6, 2); const v = '#7E9A5A', o = shade(v, -.2); for (const [x, y, w, h] of [[0, 0, 2.6, 22], [-4.5, -7, 2, 8], [4.5, -9, 2, 9]]) { g.fillStyle = o; g.fillRect(x - w, y - h + w, w * 2, h - w); g.beginPath(); g.ellipse(x, y - h + w, w, w, 0, Math.PI, 0); g.fill(); g.fillStyle = v; g.fillRect(x - w * .6, y - h + w + .5, w * 1.2, h - w - 1); } g.fillStyle = o; g.fillRect(-4.5, -7.5, 4.5, 1.6); g.fillRect(0, -9.5, 4.5, 1.6); }],
    ['arbusto', 18, 14, 9, 11, (g, r) => { sombraSuelo(g, 5, 1.6, 2); ovalo(g, 0, -3.5, 4.8, 3.4, hoja(FR.tierraVerde), r, { n: 2, bw: .5 }); toques(g, -1, -4.5, 3, 2, mix(FR.tierraVerde, FR.cal, .6), r, 4, .7); }],
    ['arbolNiebla', 28, 44, 14, 40, (g, r) => { sombraSuelo(g, 7, 2.2, 3); tronco(g, 0, 0, 0, -12, 1.5, r); copa(g, 0, -15, 6, 4.5, hoja(FR.verdeOsc), r); copa(g, .5, -23, 5, 4, hoja(shade(FR.verdeOsc, .08)), r); copa(g, 0, -30, 3.6, 3.4, hoja(shade(FR.verdeOsc, .16)), r); }],
    ['palma', 24, 60, 12, 56, (g, r) => {
      sombraSuelo(g, 4, 1.6, 4); g.save(); g.strokeStyle = FR.cal; g.lineWidth = 1.7; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(1, -22, 0, -44); g.stroke();
      contorno(g, [[-.85, 0], [-.85 + .5, -44]], r, .5, .4, false); g.restore();
      g.save(); g.strokeStyle = hoja(FR.verde); g.lineWidth = 1.4; g.lineCap = 'round';
      for (let k = 0; k < 7; k++) { const a = -Math.PI / 2 + (k - 3) * .5; g.beginPath(); g.moveTo(0, -44); g.quadraticCurveTo(Math.cos(a) * 5, -44 + Math.sin(a) * 5 - 2, Math.cos(a) * 9, -44 + Math.sin(a) * 9 + 3.5); g.stroke(); }
      g.restore();
    }],
    ['guadua', 26, 38, 13, 34, (g, r) => {
      sombraSuelo(g, 7, 2, 3); g.save(); g.lineCap = 'round';
      for (let k = 0; k < 6; k++) { const dx = (k - 2.5) * 1.5, h = 22 + r() * 8, b = (k - 2.5) * 2.4; g.strokeStyle = k % 2 ? hoja(FR.verde) : hoja(FR.tierraVerde); g.lineWidth = 1.1; g.beginPath(); g.moveTo(dx, 0); g.quadraticCurveTo(dx, -h * .6, dx + b, -h); g.stroke(); }
      g.restore(); toques(g, 0, -22, 9, 6, hoja(shade(FR.tierraVerde, .2)), r, 10, .85);
    }],
    ['cafeto', 16, 16, 8, 13, (g, r) => { sombraSuelo(g, 4, 1.4, 2); ovalo(g, 0, -5, 4, 4.4, hoja(FR.verdeOsc), r, { n: 2, bw: .5 }); toques(g, 0, -5, 3, 3.2, FR.bermellon, r, 5, .9); }],
    ['platano', 22, 24, 11, 20, (g, r) => { sombraSuelo(g, 5, 1.6, 2); tronco(g, 0, 0, 0, -8, 1.4, r, FR.tierraVerde); g.save(); for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + (k - 2) * .7; g.translate(0, 0); g.save(); g.translate(0, -8); g.rotate(a + Math.PI / 2); ovalo(g, 0, -5, 1.8, 5.2, hoja(FR.tierraVerde), r, { n: 1, bw: .4, j: .02 }); g.restore(); } g.restore(); }],
    ['frailejon', 16, 22, 8, 19, (g, r) => { sombraSuelo(g, 4, 1.4, 2); pintar(g, [[-1.4, 0], [1.4, 0], [1.2, -8], [-1.2, -8]], FR.sienaClara, r, { n: 1, bw: .45 }); for (let k = 0; k < 9; k++) { const a = k / 9 * Math.PI * 2; g.save(); g.translate(0, -9.5); g.rotate(a); ovalo(g, 0, -3, 1.1, 3.2, k % 2 ? '#C9CBA6' : '#B3BC92', r, { n: 0, bw: .3, j: .02 }); g.restore(); } }]
  ];
}

// Hornea las plantas en una hoja (atlas), con las mismas claves de la naturaleza anterior donde existen.
const HOJAS = {};
export function hornearFlora(seco = 0) {
  const clave = Math.round(seco * 10) / 10;
  if (HOJAS[clave]) return HOJAS[clave];
  seco = clave;
  const E = RES_HOJA, L = recetasFlora(seco), pad = 2;
  let x = 0, y = 0, fila = 0; const W = 1024 * 2, marcos = {};
  const pos = L.map(([k, w, h]) => { if (x + w * E > W) { x = 0; y += fila + pad; fila = 0; } const p = { x, y }; x += w * E + pad; fila = Math.max(fila, h * E); return p; });
  const cv = lienzo(W, y + fila + pad), g = cv.getContext('2d');
  L.forEach(([k, w, h, ax, ay, f], i) => {
    const p = pos[i], rng = mulberry(i * 97 + 13);
    marcos[k] = { x: p.x, y: p.y, w: w * E, h: h * E, ax: ax * E, ay: ay * E };
    g.save(); g.translate(p.x + ax * E, p.y + ay * E); g.scale(E, E); f(g, rng); g.restore();
  });
  return (HOJAS[clave] = { canvas: cv, marcos, escala: E });
}
