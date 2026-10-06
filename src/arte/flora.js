// Árboles y plantas del Tolima (renovación colonial, 6 de octubre; antes al fresco): árbol de copa, samán, palma
// de cera, guadua, cafeto, plátano, arbusto, frailejón, cardón y árbol del bosque de niebla.
import { mulberry, shade, mix, lienzo, sombraSuelo, RES_HOJA } from './fresco.js';

// ---------- Renovación colonial (6 de octubre): árboles de la prueba aprobada pruebas/colonial.html ----------
// Copas hechas de muchas hojas redondas con luz de arriba (degradado), troncos curvos con brillo y sombra en el suelo.
const HOJA = ['#4E7A3A', '#5E8B42', '#6F9C4C', '#3F6631'], HOJA_LUZ = '#9BBE68';
function copaC(g, R, cx, cy, rx, ry, n, cols, seco) {
  const sec = c => mix(c, '#B39B57', seco * .45), luz = sec(HOJA_LUZ);
  for (let k = 0; k < n; k++) {
    const x = cx + (R() - .5) * rx * 1.5, y = cy + (R() - .5) * ry * 1.1, r = (.35 + R() * .3) * rx, c = sec(cols[k % cols.length]);
    const gr = g.createRadialGradient(x - r * .35, y - r * .4, r * .1, x, y, r);
    gr.addColorStop(0, luz); gr.addColorStop(.45, c); gr.addColorStop(1, mix(c, '#1E2E18', .35));
    g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, r, r * ry / rx, 0, 0, 7); g.fill();
  }
  g.fillStyle = 'rgba(214,232,160,.5)'; for (let k = 0; k < n * 2; k++) { const x = cx + (R() - .5) * rx * 1.5, y = cy - ry * .3 + (R() - .5) * ry * .8; g.beginPath(); g.ellipse(x, y, .9, .55, R(), 0, 7); g.fill(); }
}
function troncoC(g, x0, y0, x1, y1, w0, w1, col = '#6B4A33') {
  g.fillStyle = col; g.beginPath(); g.moveTo(x0 - w0, y0); g.quadraticCurveTo((x0 + x1) / 2 - w0 * .6, (y0 + y1) / 2, x1 - w1, y1); g.lineTo(x1 + w1, y1); g.quadraticCurveTo((x0 + x1) / 2 + w0 * .6, (y0 + y1) / 2, x0 + w0, y0); g.closePath(); g.fill();
  g.fillStyle = 'rgba(255,255,255,.12)'; g.beginPath(); g.moveTo(x0 - w0 * .6, y0); g.lineTo(x1 - w1 * .6, y1); g.lineTo(x1 - w1 * .1, y1); g.lineTo(x0 - w0 * .1, y0); g.fill();
}
const sombraC = (g, rx, ry = rx * .35) => { g.save(); g.globalAlpha = .22; g.fillStyle = '#2A3A1E'; g.beginPath(); g.ellipse(rx * .35, 1, rx, ry, 0, 0, 7); g.fill(); g.restore(); };

// [clave, ancho, alto, anclaX, anclaY, pintura]. seco: 0 lluvias a 1 sequía (las hojas se doran).
// Los marcos son un poco más grandes que el dibujo, para que ninguna hoja quede cortada.
export function recetasFlora(seco = 0) {
  const hoja = c => mix(c, '#B39B57', seco * .45);
  return [
    ['arbol', 34, 40, 17, 35, (g, r) => { sombraC(g, 9, 3); troncoC(g, 0, 0, 0, -11, 1.5, 1); troncoC(g, 0, -8, -4, -13, .7, .4); copaC(g, r, 0, -18, 10, 7, 9, HOJA, seco); }],
    ['saman', 52, 34, 26, 30, (g, r) => { g.scale(.72, .72); sombraC(g, 22, 7); troncoC(g, 0, 0, -1, -14, 2.6, 1.6); troncoC(g, -1, -12, -9, -19, 1.2, .7); troncoC(g, -1, -12, 8, -20, 1.2, .7); copaC(g, r, 0, -24, 24, 8, 14, HOJA, seco); }],
    // Fase 14: cardón (cactus columnar) del sur seco del Tolima.
    ['cardon', 20, 30, 10, 28, (g, r) => { sombraSuelo(g, 5, 1.6, 2); const v = '#7E9A5A', o = shade(v, -.2); for (const [x, y, w, h] of [[0, 0, 2.6, 22], [-4.5, -7, 2, 8], [4.5, -9, 2, 9]]) { g.fillStyle = o; g.fillRect(x - w, y - h + w, w * 2, h - w); g.beginPath(); g.ellipse(x, y - h + w, w, w, 0, Math.PI, 0); g.fill(); g.fillStyle = v; g.fillRect(x - w * .6, y - h + w + .5, w * 1.2, h - w - 1); } g.fillStyle = o; g.fillRect(-4.5, -7.5, 4.5, 1.6); g.fillRect(0, -9.5, 4.5, 1.6); }],
    ['arbusto', 20, 16, 10, 12, (g, r) => { sombraC(g, 6, 2); copaC(g, r, 0, -4, 6, 3.6, 6, ['#6F8A48', '#5E7A3E', '#7E9A52'], seco); }],
    ['arbolNiebla', 30, 46, 15, 42, (g, r) => { sombraC(g, 8, 2.6); troncoC(g, 0, 0, 0, -14, 1.4, .9, '#5A4A3A'); const F = ['#3F6631', '#355A2C', '#4A7038']; copaC(g, r, 0, -16, 8, 4.5, 6, F, seco * .5); copaC(g, r, .5, -24, 6.6, 4, 5, F, seco * .5); copaC(g, r, 0, -31, 4.6, 3.4, 4, F, seco * .5); }],
    ['palma', 30, 64, 15, 60, (g, r) => {
      g.scale(.85, .85); sombraC(g, 6, 2.4); g.strokeStyle = '#D6CEC0'; g.lineWidth = 1.8; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(1.5, -25, 0, -52); g.stroke();
      g.strokeStyle = '#B8AE9C'; g.lineWidth = .4; for (let k = 4; k < 50; k += 4) { g.beginPath(); g.moveTo(-1, -k); g.lineTo(1, -k); g.stroke(); }
      for (let k = 0; k < 9; k++) { const a = -Math.PI / 2 + (k - 4) * .38; g.strokeStyle = hoja(HOJA[k % 4]); g.lineWidth = 1.4; g.beginPath(); g.moveTo(0, -52); g.quadraticCurveTo(Math.cos(a) * 9, -52 + Math.sin(a) * 9 - 2, Math.cos(a) * 13, -50 + Math.sin(a) * 11 + 6); g.stroke(); g.lineWidth = .5; for (let j = 0; j < 6; j++) { const t = .3 + j * .12, x = Math.cos(a) * 13 * t, y = -52 + (Math.sin(a) * 11 + 6) * t; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 1.4, y + 2.3); g.stroke(); } }
    }],
    // Guadua: macolla de tallos delgados que se abren y se doblan en la punta, con ramitas de hojas finas colgando.
    ['guadua', 34, 46, 17, 42, (g, r) => {
      sombraC(g, 9, 3); g.lineCap = 'round';
      const tallos = [];
      for (let k = 0; k < 7; k++) { const x0 = (k - 3) * .9 + (r() - .5) * .6, ab = (k - 3) * 3 + (r() - .5) * 2.5, h = 30 + r() * 10; tallos.push([x0, ab, h]); }
      const en = ([x0, ab, h], t) => [x0 + ab * t * t + Math.sign(ab || 1) * 2.4 * Math.max(0, t - .75) * 4 * (t - .75), -h * t + (t > .8 ? (t - .8) * h * .35 : 0)];
      for (const [k, T] of tallos.entries()) {
        g.strokeStyle = hoja(k % 2 ? '#8FAE4A' : '#A0B858'); g.lineWidth = 1; g.beginPath();
        for (let j = 0; j <= 12; j++) { const q = en(T, j / 12); j ? g.lineTo(...q) : g.moveTo(...q); } g.stroke();
        g.strokeStyle = 'rgba(80,100,40,.55)'; g.lineWidth = .35; for (let j = 1; j < 7; j++) { const q = en(T, j / 8); g.beginPath(); g.moveTo(q[0] - .6, q[1]); g.lineTo(q[0] + .6, q[1]); g.stroke(); }
      }
      for (const [k, T] of tallos.entries()) for (let j = 0; j < 11; j++) {
        const t = .45 + j * .05, q = en(T, t), lado = j % 2 ? 1 : -1;
        g.save(); g.translate(q[0], q[1]); g.rotate(lado * (.9 + r() * .5)); g.fillStyle = hoja(HOJA[(k + j) % 4]);
        g.beginPath(); g.ellipse(0, 2.4, .55, 2.6, 0, 0, 7); g.fill(); g.restore();
      }
    }],
    ['cafeto', 16, 16, 8, 13, (g, r) => { sombraC(g, 4, 1.6); copaC(g, r, 0, -4.5, 4.6, 3.6, 5, ['#2F5A32', '#3A6A3A', '#2A4E2C'], seco * .6); g.fillStyle = '#B03A2E'; for (let k = 0; k < 5; k++) { g.beginPath(); g.arc((r() - .5) * 6, -4.5 + (r() - .5) * 4, .6, 0, 7); g.fill(); } }],
    ['platano', 30, 28, 15, 24, (g, r) => {
      g.scale(.8, .8); sombraC(g, 10, 3.5); troncoC(g, 0, 0, 0, -14, 2, 1.6, '#8A9A5A');
      for (let k = 0; k < 6; k++) { const a = -Math.PI / 2 + (k - 2.5) * .55, L = 13 + r() * 4, x = Math.cos(a) * L, y = -14 + Math.sin(a) * L * .7 + 5;
        g.fillStyle = hoja(HOJA[k % 4]); g.beginPath(); g.moveTo(0, -14); g.quadraticCurveTo(x * .5 - 3, y - 6, x, y); g.quadraticCurveTo(x * .5 + 3, y - 1, 0, -13); g.fill();
        g.strokeStyle = 'rgba(230,240,190,.6)'; g.lineWidth = .4; g.beginPath(); g.moveTo(0, -14); g.quadraticCurveTo(x * .5, y - 3.5, x, y); g.stroke(); }
      g.fillStyle = '#6E4A6A'; g.beginPath(); g.ellipse(2, -10, 1.6, 3, .3, 0, 7); g.fill();
    }],
    ['frailejon', 16, 22, 8, 19, (g, r) => { sombraC(g, 4, 1.4); troncoC(g, 0, 0, 0, -8, 1.4, 1.1, '#8A7A5E'); for (let k = 0; k < 11; k++) { const a = k / 11 * Math.PI * 2; g.save(); g.translate(0, -9.5); g.rotate(a); const gr = g.createLinearGradient(0, 0, 0, -6); gr.addColorStop(0, '#9EA884'); gr.addColorStop(1, k % 2 ? '#D3D6B4' : '#C2CBA2'); g.fillStyle = gr; g.beginPath(); g.ellipse(0, -3, 1.1, 3.3, 0, 0, 7); g.fill(); g.restore(); } }]
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
