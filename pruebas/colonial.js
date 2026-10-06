// Prueba de estilo colonial (pedido de Juan, 6 de octubre). No toca el juego: muestra cómo se verían el suelo, los
// árboles, los animales y un pueblo colonial (casas de cal y teja, iglesia, cabildo con portales y plaza) pintados de
// nuevo, con lo de antes al lado para comparar. Todo se dibuja en lienzos, sin imágenes externas.
import { hornearNaturaleza } from '../src/arte/naturaleza.js';
import { hornearEdificios } from '../src/arte/edificios.js';
import { mulberry } from '../src/arte/acuarela.js';

const DPR = Math.min(2.5, window.devicePixelRatio || 1);
const TW = 64, TH = 32;
// Proyección isométrica: r y c en casillas, z en píxeles hacia arriba.
const P = (r, c, z = 0) => [(c - r) * TW / 2, (c + r) * TH / 2 - z];

// ---------- Paleta colonial ----------
const K = {
  cal: '#F4EEE2', calSombra: '#D9CFBD', calOscura: '#BFB3A0',
  teja: '#B9552F', tejaLuz: '#CF6A3F', tejaSombra: '#8C3B22', tejaLinea: '#7A3220',
  madera: '#6E4529', maderaLuz: '#8A5A36', maderaOsc: '#4A2D1A',
  zocalos: ['#2F5D8A', '#3E6B4A', '#8E2F22', '#B07A2A', '#2F6F6A'],
  puertas: ['#3E6B4A', '#2F5D8A', '#6E4529', '#8E2F22'],
  piedra: '#B8AE9C', piedraOsc: '#8E8475',
  pasto: ['#86A65A', '#7B9B52', '#93B064', '#6F8E4A', '#A3B86E'],
  tierra: '#D8C49B', tierraOsc: '#BFA87C',
  hoja: ['#4E7A3A', '#5E8B42', '#6F9C4C', '#3F6631'], hojaLuz: '#9BBE68',
  contorno: 'rgba(70,45,30,.55)'
};

// ---------- Utilidades de pintura ----------
function lienzo(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function poli(g, pts) { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); }
function rellena(g, pts, col, borde = K.contorno, w = .6) { poli(g, pts); g.fillStyle = col; g.fill(); if (borde) { g.strokeStyle = borde; g.lineWidth = w; g.lineJoin = 'round'; g.stroke(); } }
function grad(g, x0, y0, x1, y1, stops) { const gr = g.createLinearGradient(x0, y0, x1, y1); stops.forEach(([p, c]) => gr.addColorStop(p, c)); return gr; }
const mezcla = (a, b, t) => { const h = s => [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16)); const A = h(a), B = h(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
const off = ([x, y], dx, dy) => [x + dx, y + dy];

// ---------- Edificios coloniales ----------
// Caja: footprint w (a lo largo de c) × d (a lo largo de r), alto H; centro en (0,0). Devuelve las caras visibles.
function caras(w, d, H) {
  const a = -w / 2, b = w / 2, f = d / 2, t = -d / 2;
  return {
    izq: [P(f, a), P(f, b), P(f, b, H), P(f, a, H)],   // fachada del frente (iluminada)
    der: [P(f, b), P(t, b), P(t, b, H), P(f, b, H)],   // costado (en sombra)
    en: (cara, u, z) => cara === 'izq' ? P(f, a + (b - a) * u, z) : P(f + (t - f) * u, b, z)
  };
}
function muros(g, w, d, H, zocalo) {
  const F = caras(w, d, H);
  // Muro de cal con luz de la tarde: la fachada clara, el costado en sombra; el pie un poco más oscuro.
  const [p0, , , p3] = F.izq;
  rellena(g, F.izq, grad(g, 0, p0[1], 0, p3[1], [[0, K.calSombra], [.25, K.cal], [1, K.cal]]));
  const [q0, , , q3] = F.der;
  rellena(g, F.der, grad(g, 0, q0[1], 0, q3[1], [[0, K.calOscura], [.3, K.calSombra], [1, K.calSombra]]));
  // Zócalo de color (la franja pintada al pie del muro, típica de los pueblos del Tolima y de toda la Colonia).
  const zh = Math.min(5, H * .22);
  rellena(g, [F.en('izq', 0, 0), F.en('izq', 1, 0), F.en('izq', 1, zh), F.en('izq', 0, zh)], zocalo, null);
  rellena(g, [F.en('der', 0, 0), F.en('der', 1, 0), F.en('der', 1, zh), F.en('der', 0, zh)], mezcla(zocalo, '#000000', .25), null);
  return F;
}
// Hueco (puerta o ventana) en una cara, de u0 a u1 y de z0 a z1.
function hueco(g, F, cara, u0, u1, z0, z1, col, arco = false) {
  const pts = [F.en(cara, u0, z0), F.en(cara, u1, z0), F.en(cara, u1, z1), F.en(cara, u0, z1)];
  if (arco) { const m = F.en(cara, (u0 + u1) / 2, z1 + (z1 - z0) * .28); g.beginPath(); g.moveTo(...pts[0]); g.lineTo(...pts[1]); g.lineTo(...pts[2]); g.quadraticCurveTo(m[0], m[1], ...pts[3]); g.closePath(); g.fillStyle = col; g.fill(); g.strokeStyle = K.contorno; g.lineWidth = .5; g.stroke(); return; }
  rellena(g, pts, col, K.contorno, .5);
}
function ventana(g, F, cara, u, z, ancho = .14, alto = 7, color = '#3E6B4A') {
  hueco(g, F, cara, u - ancho / 2, u + ancho / 2, z, z + alto, '#3A2A1E');
  // Postigos de madera pintada, abiertos a los lados.
  hueco(g, F, cara, u - ancho / 2 - ancho * .45, u - ancho / 2, z, z + alto, color);
  hueco(g, F, cara, u + ancho / 2, u + ancho / 2 + ancho * .45, z, z + alto, color);
  // Reja.
  g.strokeStyle = 'rgba(30,20,15,.7)'; g.lineWidth = .4; for (let k = 1; k < 4; k++) { const a = F.en(cara, u - ancho / 2 + ancho * k / 4, z), b = F.en(cara, u - ancho / 2 + ancho * k / 4, z + alto); g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); }
}
function puerta(g, F, cara, u, ancho = .16, alto = 11, color = '#6E4529', arco = true) {
  hueco(g, F, cara, u - ancho / 2, u + ancho / 2, 0, alto, color, arco);
  const a = F.en(cara, u, 0), b = F.en(cara, u, alto); g.strokeStyle = 'rgba(30,20,15,.5)'; g.lineWidth = .4; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke();
}
// Balcón de madera volado en la fachada, a la altura z, de u0 a u1.
function balcon(g, w, d, u0, u1, z, sal = .14) {
  const f = d / 2, a = -w / 2 + w * u0, b = -w / 2 + w * u1;
  rellena(g, [P(f, a, z), P(f, b, z), P(f + sal, b, z), P(f + sal, a, z)], K.maderaOsc);
  rellena(g, [P(f + sal, a, z), P(f + sal, b, z), P(f + sal, b, z - 1.2), P(f + sal, a, z - 1.2)], K.madera);
  g.strokeStyle = K.maderaLuz; g.lineWidth = .55;
  const n = Math.max(4, Math.round((b - a) * 22));
  for (let k = 0; k <= n; k++) { const c = a + (b - a) * k / n, p = P(f + sal, c, z), q = P(f + sal, c, z + 5); g.beginPath(); g.moveTo(...p); g.lineTo(...q); g.stroke(); }
  g.strokeStyle = K.maderaOsc; g.lineWidth = 1; g.beginPath(); g.moveTo(...P(f + sal, a, z + 5)); g.lineTo(...P(f + sal, b, z + 5)); g.stroke();
  // Aleros del balcón: canes de madera bajo el piso.
  g.strokeStyle = K.maderaOsc; g.lineWidth = .7; for (let k = 0; k <= 3; k++) { const c = a + (b - a) * k / 3; g.beginPath(); g.moveTo(...P(f, c, z - 2)); g.lineTo(...P(f + sal, c, z - 1.2)); g.stroke(); }
}
// Tejado de barro a dos aguas con la cumbrera a lo largo de c (eje 'c') o de r (eje 'r').
function tejado(g, w, d, H, rh, eje = 'c', o = .1) {
  const a = -w / 2 - o, b = w / 2 + o, f = d / 2 + o, t = -d / 2 - o;
  if (eje === 'c') {
    const faldon = [P(f, a, H), P(f, b, H), P(0, b, H + rh), P(0, a, H + rh)];
    // Hastial (triángulo) del costado, en cal.
    rellena(g, [P(d / 2, w / 2, H), P(-d / 2, w / 2, H), P(0, w / 2, H + rh * .92)], K.calSombra);
    // Faldón trasero asomando sobre la cumbrera.
    rellena(g, [P(0, a, H + rh), P(0, b, H + rh), P(t, b, H), P(t, a, H)], K.tejaSombra);
    rellena(g, faldon, grad(g, 0, faldon[0][1], 0, faldon[3][1], [[0, K.teja], [1, K.tejaLuz]]));
    tejas(g, (u, v) => P(f + (0 - f) * v, a + (b - a) * u, H + rh * v), (b - a) * 9);
    rellena(g, [P(.02, a, H + rh + .8), P(.02, b, H + rh + .8), P(-.02, b, H + rh - .4), P(-.02, a, H + rh - .4)], K.tejaSombra, null);
  } else {
    const faldon = [P(f, b, H), P(t, b, H), P(t, 0, H + rh), P(f, 0, H + rh)];
    rellena(g, [P(d / 2, -w / 2, H), P(d / 2, w / 2, H), P(d / 2, 0, H + rh * .92)], K.cal);
    rellena(g, [P(f, a, H), P(f, 0, H + rh), P(t, 0, H + rh), P(t, a, H)], K.tejaSombra);
    rellena(g, faldon, grad(g, faldon[0][0], 0, faldon[3][0], 0, [[0, K.tejaSombra], [1, K.teja]]));
    tejas(g, (u, v) => P(f + (t - f) * u, b + (0 - b) * v, H + rh * v), (f - t) * 9);
  }
}
// Hileras de teja: líneas a lo largo de la pendiente y ondas suaves de través.
function tejas(g, en, n) {
  g.save(); g.strokeStyle = K.tejaLinea; g.globalAlpha = .55; g.lineWidth = .45;
  for (let k = 1; k < n; k++) { const u = k / n; g.beginPath(); g.moveTo(...en(u, 0)); g.lineTo(...en(u, 1)); g.stroke(); }
  g.globalAlpha = .3;
  for (let j = 1; j < 5; j++) { const v = j / 5; g.beginPath(); for (let k = 0; k <= n; k++) { const p = en(k / n, v); k ? g.lineTo(p[0], p[1] + (k % 2 ? .5 : 0)) : g.moveTo(...p); } g.stroke(); }
  g.restore();
}
function sombraEdificio(g, w, d) {
  g.save(); g.globalAlpha = .22; g.fillStyle = '#3A2A1C';
  poli(g, [P(d / 2, -w / 2), P(d / 2 + .25, -w / 2 + .45), P(d / 2 + .25, w / 2 + .45), P(-d / 2 + .3, w / 2 + .45), P(-d / 2, w / 2)]); g.fill(); g.restore();
}

// Casa colonial de cal y teja, de uno o dos pisos.
function casa(g, v) {
  const R = mulberry(31 + v * 17), dos = v % 3 === 1, w = .78, d = .62, H = dos ? 26 : 15, zo = K.zocalos[v % K.zocalos.length], pu = K.puertas[(v + 1) % K.puertas.length];
  sombraEdificio(g, w, d);
  const F = muros(g, w, d, H, zo);
  puerta(g, F, 'izq', dos ? .3 : .38, .16, 10, pu);
  ventana(g, F, 'izq', dos ? .72 : .74, 4, .13, 6, pu);
  if (dos) { ventana(g, F, 'izq', .3, 15.5, .12, 6.5, pu); ventana(g, F, 'izq', .72, 15.5, .12, 6.5, pu); balcon(g, w, d, .12, .9, 14.5); }
  ventana(g, F, 'der', .5, dos ? 15 : 4, .16, 6, pu);
  tejado(g, w, d, H, dos ? 11 : 10, 'c');
  if (R() < .6) { const p = P(-.05, .22, H + 9); g.fillStyle = K.calSombra; g.fillRect(p[0] - 1.6, p[1] - 6, 3.2, 6); g.fillStyle = K.tejaSombra; g.fillRect(p[0] - 2.2, p[1] - 7, 4.4, 1.4); } // chimenea del fogón
}
// Iglesia colonial: nave larga, fachada con espadaña de campanas y portón.
function iglesia(g) {
  const w = .95, d = 1.7, H = 30, rh = 16;
  sombraEdificio(g, w, d);
  const F = muros(g, w, d, H, '#B8AE9C');
  tejado(g, w, d, H, rh, 'r');
  // Fachada: hastial y espadaña.
  const f = d / 2, z = H + rh * .55;
  const esp = [P(f, -.2, z), P(f, .2, z), P(f, .2, z + 18), P(f, 0, z + 25), P(f, -.2, z + 18)];
  rellena(g, esp, K.cal);
  for (const [u, zz] of [[-.1, z + 9], [.1, z + 9], [0, z + 17]]) { const c0 = P(f, u - .045, zz), c1 = P(f, u + .045, zz + 5); g.fillStyle = '#3A2A1E'; g.beginPath(); g.ellipse((c0[0] + c1[0]) / 2, (c0[1] + c1[1]) / 2 + 1, 2.4, 3.3, 0, 0, 7); g.fill(); g.fillStyle = '#C9A24A'; g.beginPath(); g.arc((c0[0] + c1[0]) / 2, (c0[1] + c1[1]) / 2 + 2.6, 1.5, 0, 7); g.fill(); }
  const cr = P(f, 0, z + 27); g.strokeStyle = K.maderaOsc; g.lineWidth = 1; g.beginPath(); g.moveTo(cr[0], cr[1]); g.lineTo(cr[0], cr[1] - 6); g.moveTo(cr[0] - 2.2, cr[1] - 4.2); g.lineTo(cr[0] + 2.2, cr[1] - 4.2); g.stroke();
  puerta(g, F, 'izq', .5, .26, 17, K.madera);
  hueco(g, F, 'izq', .5 - .07, .5 + .07, 21, 26, '#3A2A1E', true); // rosetón sencillo
  for (const u of [.2, .5, .8]) ventana(g, F, 'der', u, 12, .08, 9, K.madera);
  // Pilastras de la fachada.
  for (const u of [.04, .96]) rellena(g, [F.en('izq', u - .03, 0), F.en('izq', u + .03, 0), F.en('izq', u + .03, H), F.en('izq', u - .03, H)], K.calSombra, null);
}
// Cabildo (alcaldía) con portales: arcada en el primer piso y balcón corrido en el segundo.
function cabildo(g) {
  const w = 1.5, d = .7, H = 28;
  sombraEdificio(g, w, d);
  const F = muros(g, w, d, H, '#8E2F22');
  const n = 5;
  for (let k = 0; k < n; k++) { const u0 = .06 + k * .88 / n, u1 = u0 + .88 / n - .04; hueco(g, F, 'izq', u0, u1, 0, 9, '#4A3A2C', true); }
  for (let k = 0; k < n; k++) ventana(g, F, 'izq', .06 + (k + .5) * .88 / n, 16, .08, 7, '#2F5D8A');
  balcon(g, w, d, .04, .96, 15);
  ventana(g, F, 'der', .5, 16, .14, 7, '#2F5D8A');
  tejado(g, w, d, H, 12, 'c');
  // Escudo sobre el portal central.
  const e = F.en('izq', .5, 25); g.fillStyle = '#C9A24A'; g.beginPath(); g.arc(e[0], e[1], 2.2, 0, 7); g.fill();
  // Bandera.
  const m = P(-.1, .6, H + 10); g.strokeStyle = K.maderaOsc; g.lineWidth = .8; g.beginPath(); g.moveTo(m[0], m[1]); g.lineTo(m[0], m[1] - 16); g.stroke();
  for (const [col, k] of [['#E8C23A', 0], ['#2F5D8A', 1], ['#B9442F', 2]]) { g.fillStyle = col; g.fillRect(m[0], m[1] - 16 + k * 2, 9, 2); }
}
// Pila de la plaza con su agua.
function pila(g) {
  g.save(); g.globalAlpha = .2; g.fillStyle = '#3A2A1C'; g.beginPath(); g.ellipse(2, 3, 16, 6, 0, 0, 7); g.fill(); g.restore();
  g.fillStyle = K.piedraOsc; g.beginPath(); g.ellipse(0, 0, 15, 6.5, 0, 0, 7); g.fill();
  g.fillStyle = K.piedra; g.beginPath(); g.ellipse(0, -3, 15, 6.5, 0, 0, 7); g.fill(); g.fillRect(-15, -3, 30, 3);
  g.fillStyle = '#7FB3C4'; g.beginPath(); g.ellipse(0, -3.2, 12, 4.8, 0, 0, 7); g.fill();
  g.fillStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.ellipse(-3, -4.2, 5, 1.2, 0, 0, 7); g.fill();
  g.fillStyle = K.piedra; g.fillRect(-1.6, -14, 3.2, 11); g.beginPath(); g.ellipse(0, -14, 4.5, 1.8, 0, 0, 7); g.fill();
  g.strokeStyle = 'rgba(200,230,240,.9)'; g.lineWidth = .8; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(0, -15); g.quadraticCurveTo(s * 5, -18, s * 7, -5); g.stroke(); }
}

// ---------- Árboles ----------
function copa(g, R, cx, cy, rx, ry, n, cols = K.hoja) {
  for (let k = 0; k < n; k++) {
    const x = cx + (R() - .5) * rx * 1.5, y = cy + (R() - .5) * ry * 1.1, r = (.35 + R() * .3) * rx;
    const gr = g.createRadialGradient(x - r * .35, y - r * .4, r * .1, x, y, r);
    gr.addColorStop(0, K.hojaLuz); gr.addColorStop(.45, cols[k % cols.length]); gr.addColorStop(1, mezcla(cols[k % cols.length], '#1E2E18', .35));
    g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, r, r * ry / rx, 0, 0, 7); g.fill();
  }
  // Brillos de hojas sueltas.
  g.fillStyle = 'rgba(214,232,160,.55)'; for (let k = 0; k < n * 3; k++) { const x = cx + (R() - .5) * rx * 1.6, y = cy - ry * .3 + (R() - .5) * ry * .8; g.beginPath(); g.ellipse(x, y, 1.1, .7, R(), 0, 7); g.fill(); }
}
function tronco(g, x0, y0, x1, y1, w0, w1, col = '#6B4A33') {
  g.fillStyle = col; g.beginPath(); g.moveTo(x0 - w0, y0); g.quadraticCurveTo((x0 + x1) / 2 - w0 * .6, (y0 + y1) / 2, x1 - w1, y1); g.lineTo(x1 + w1, y1); g.quadraticCurveTo((x0 + x1) / 2 + w0 * .6, (y0 + y1) / 2, x0 + w0, y0); g.closePath(); g.fill();
  g.fillStyle = 'rgba(255,255,255,.12)'; g.beginPath(); g.moveTo(x0 - w0 * .6, y0); g.lineTo(x1 - w1 * .6, y1); g.lineTo(x1 - w1 * .1, y1); g.lineTo(x0 - w0 * .1, y0); g.fill();
}
const sombraArbol = (g, rx, ry = rx * .35) => { g.save(); g.globalAlpha = .22; g.fillStyle = '#2A3A1E'; g.beginPath(); g.ellipse(rx * .35, 1, rx, ry, 0, 0, 7); g.fill(); g.restore(); };
function saman(g, R) { sombraArbol(g, 22, 7); tronco(g, 0, 0, -1, -14, 2.6, 1.6); tronco(g, -1, -12, -9, -19, 1.2, .7); tronco(g, -1, -12, 8, -20, 1.2, .7); copa(g, R, 0, -24, 24, 8, 14); }
function ceiba(g, R) { sombraArbol(g, 26, 8); tronco(g, 0, 0, 0, -20, 4.2, 2.4, '#9A9184'); tronco(g, 0, -16, -10, -24, 1.6, .8, '#9A9184'); tronco(g, 0, -16, 11, -25, 1.6, .8, '#9A9184'); for (const s of [-1, 1]) { g.fillStyle = '#857C70'; g.beginPath(); g.moveTo(s * 8, 0); g.quadraticCurveTo(s * 2.5, -3, s * 1.8, -10); g.lineTo(0, 0); g.fill(); } copa(g, R, 0, -31, 28, 10, 18); }
function palma(g, R) {
  sombraArbol(g, 8, 3); g.strokeStyle = '#D6CEC0'; g.lineWidth = 1.8; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(1.5, -25, 0, -52); g.stroke();
  g.strokeStyle = '#B8AE9C'; g.lineWidth = .4; for (let k = 4; k < 50; k += 4) { g.beginPath(); g.moveTo(-1, -k); g.lineTo(1, -k); g.stroke(); }
  for (let k = 0; k < 9; k++) { const a = -Math.PI / 2 + (k - 4) * .38; g.strokeStyle = K.hoja[k % 4]; g.lineWidth = 1.4; g.beginPath(); g.moveTo(0, -52); g.quadraticCurveTo(Math.cos(a) * 9, -52 + Math.sin(a) * 9 - 2, Math.cos(a) * 15, -50 + Math.sin(a) * 12 + 6); g.stroke(); g.lineWidth = .5; for (let j = 0; j < 6; j++) { const t = .3 + j * .12, x = Math.cos(a) * 15 * t, y = -52 + (Math.sin(a) * 12 + 6) * t; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 1.5, y + 2.5); g.stroke(); } }
}
function guadua(g, R) {
  sombraArbol(g, 12, 4);
  for (let k = 0; k < 9; k++) {
    const x0 = (k - 4) * 1.4, lean = (k - 4) * 2.2 + (R() - .5) * 3, h = 34 + R() * 12;
    g.strokeStyle = k % 2 ? '#7E9A3E' : '#8FAE4A'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x0, 0); g.quadraticCurveTo(x0 + lean * .3, -h * .5, x0 + lean, -h); g.stroke();
    g.strokeStyle = '#5E7A2E'; g.lineWidth = .5; for (let j = 6; j < h; j += 6) { const t = j / h, x = x0 + lean * t * t * .9 + lean * .1 * t, y = -j; g.beginPath(); g.moveTo(x - 1, y); g.lineTo(x + 1, y); g.stroke(); }
    g.fillStyle = K.hoja[k % 4]; for (let j = 0; j < 5; j++) { const t = .55 + j * .1, x = x0 + lean * t, y = -h * t; g.beginPath(); g.ellipse(x + (j % 2 ? 3 : -3), y, 3.6, 1, (j % 2 ? .5 : -.5), 0, 7); g.fill(); }
  }
}
function platano(g, R) {
  sombraArbol(g, 10, 3.5); tronco(g, 0, 0, 0, -14, 2, 1.6, '#8A9A5A');
  for (let k = 0; k < 6; k++) { const a = -Math.PI / 2 + (k - 2.5) * .55, L = 13 + R() * 4, x = Math.cos(a) * L, y = -14 + Math.sin(a) * L * .7 + 5;
    g.fillStyle = K.hoja[k % 4]; g.beginPath(); g.moveTo(0, -14); g.quadraticCurveTo(x * .5 - 3, y - 6, x, y); g.quadraticCurveTo(x * .5 + 3, y - 1, 0, -13); g.fill();
    g.strokeStyle = 'rgba(230,240,190,.6)'; g.lineWidth = .4; g.beginPath(); g.moveTo(0, -14); g.quadraticCurveTo(x * .5, y - 3.5, x, y); g.stroke(); }
  g.fillStyle = '#6E4A6A'; g.beginPath(); g.ellipse(2, -10, 1.6, 3, .3, 0, 7); g.fill();
}
function cafeto(g, R) { sombraArbol(g, 5, 2); copa(g, R, 0, -5, 6, 4.5, 5, ['#2F5A32', '#3A6A3A', '#2A4E2C']); g.fillStyle = '#B03A2E'; for (let k = 0; k < 6; k++) { g.beginPath(); g.arc((R() - .5) * 8, -5 + (R() - .5) * 5, .7, 0, 7); g.fill(); } }

// ---------- Animales ----------
function cuerpo(g, pts, col, sombra) { // silueta con curvas y luz de arriba
  g.beginPath(); g.moveTo(...pts[0]); for (let k = 1; k < pts.length; k += 2) { if (pts[k + 1]) g.quadraticCurveTo(...pts[k], ...pts[k + 1]); else g.lineTo(...pts[k]); } g.closePath();
  const ys = pts.map(p => p[1]); g.fillStyle = grad(g, 0, Math.min(...ys), 0, Math.max(...ys), [[0, mezcla(col, '#FFFFFF', .2)], [.6, col], [1, sombra]]); g.fill();
  g.strokeStyle = K.contorno; g.lineWidth = .5; g.stroke();
}
function pata(g, x, y0, y1, w, col, casco = '#2A2420', dx = 0) { g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y0); g.quadraticCurveTo(x + dx * .3, (y0 + y1) / 2, x + dx, y1 - 1); g.stroke(); g.strokeStyle = casco; g.lineWidth = w * .95; g.beginPath(); g.moveTo(x + dx, y1 - .8); g.lineTo(x + dx, y1); g.stroke(); }
const sombraAnimal = (g, rx) => { g.save(); g.globalAlpha = .25; g.fillStyle = '#2A2A1E'; g.beginPath(); g.ellipse(1, 0, rx, rx * .28, 0, 0, 7); g.fill(); g.restore(); };
// Vaca blanca orejinegra, la criolla del Tolima.
function vaca(g) {
  sombraAnimal(g, 13);
  // Patas de atrás (más oscuras: quedan en sombra).
  pata(g, -7, -11, 0, 2.1, '#BDB4A4', '#4A403A', -.6); pata(g, 6, -11, 0, 2.1, '#BDB4A4', '#4A403A', .4);
  cuerpo(g, [[-10, -19], [-2, -22], [6, -19.5], [10, -18], [10.5, -14], [10, -10], [3, -9.6], [-4, -10], [-10, -10.6], [-11.5, -15], [-10, -19]], '#F2EEE6', '#CFC6B6');
  pata(g, -5, -11, 0, 2.3, '#E8E2D6', '#4A403A', .5); pata(g, 8, -11, 0, 2.3, '#E8E2D6', '#4A403A', -.3);
  // Cabeza con las orejas negras, hocico y cuernos cortos.
  cuerpo(g, [[9.5, -19.5], [12.5, -21.5], [15, -19.5], [16.8, -17], [16.6, -14.5], [14.5, -13.6], [12.5, -15], [10, -16], [9.5, -19.5]], '#F2EEE6', '#D2CABB');
  g.fillStyle = '#6A5A54'; g.beginPath(); g.ellipse(15.8, -14.8, 1.6, 1.2, .3, 0, 7); g.fill();
  g.fillStyle = '#1E1A18'; g.beginPath(); g.ellipse(11, -20.6, 2.2, 1, -.5, 0, 7); g.fill(); g.beginPath(); g.ellipse(14.2, -21.2, 1.6, .8, .4, 0, 7); g.fill();
  g.strokeStyle = '#D9CDB0'; g.lineWidth = .7; g.beginPath(); g.moveTo(12, -21.5); g.quadraticCurveTo(11.5, -23.5, 10.5, -24); g.moveTo(13.6, -21.6); g.quadraticCurveTo(14.5, -23.5, 15.6, -23.8); g.stroke();
  g.fillStyle = '#1E1A18'; g.beginPath(); g.arc(14.2, -18.2, .6, 0, 7); g.fill();
  // Cola con su borla.
  g.strokeStyle = '#B8AE9C'; g.lineWidth = .8; g.beginPath(); g.moveTo(-11, -17.5); g.quadraticCurveTo(-13.5, -14, -12.5, -9); g.stroke(); g.fillStyle = '#3A302A'; g.beginPath(); g.ellipse(-12.6, -8.5, .8, 1.5, 0, 0, 7); g.fill();
}
// Mula de arriero con su carga de café.
function mula(g) {
  sombraAnimal(g, 12);
  pata(g, -6, -8, 0, 1.8, '#5A3A26', '#1E1A18', -.5); pata(g, 6, -8, 0, 1.8, '#5A3A26', '#1E1A18', .4);
  cuerpo(g, [[-9, -14], [-1, -16], [6, -14.5], [9, -13], [9, -9.5], [8.5, -7], [2, -7], [-4, -7], [-9, -8], [-10.5, -11], [-9, -14]], '#7A5236', '#4E3322');
  pata(g, -4, -8, 0, 1.8, '#6A452E', '#1E1A18', .4); pata(g, 8, -8, 0, 1.8, '#6A452E', '#1E1A18', -.3);
  cuerpo(g, [[8, -13], [10, -18], [12.5, -21], [15, -20], [16.2, -17.5], [15.5, -16], [13, -16.5], [11, -13], [8, -13]], '#7A5236', '#4E3322');
  g.fillStyle = '#4E3322'; g.beginPath(); g.ellipse(12.2, -22.6, .9, 2.6, -.3, 0, 7); g.fill(); g.beginPath(); g.ellipse(13.6, -22.4, .9, 2.4, .2, 0, 7); g.fill();
  g.fillStyle = '#1E1A18'; g.beginPath(); g.arc(13.6, -19, .5, 0, 7); g.fill();
  // Enjalma y bultos de café.
  for (const [x, col] of [[-4, '#C9B48A'], [3, '#BFA87C']]) { cuerpo(g, [[x - 4, -19], [x, -21], [x + 4, -19], [x + 4.5, -15], [x + 4, -11], [x, -10], [x - 4, -11], [x - 4.5, -15], [x - 4, -19]], col, mezcla(col, '#000000', .3)); g.strokeStyle = '#8A6A40'; g.lineWidth = .5; g.beginPath(); g.moveTo(x - 4, -15); g.lineTo(x + 4, -15); g.stroke(); }
  g.strokeStyle = '#3A2A1E'; g.lineWidth = .8; g.beginPath(); g.moveTo(-9.5, -12); g.quadraticCurveTo(-12, -9, -11, -5); g.stroke();
}
function gallina(g, roja) {
  sombraAnimal(g, 4);
  g.strokeStyle = '#C9A24A'; g.lineWidth = .7; g.beginPath(); g.moveTo(-.6, -3); g.lineTo(-.8, 0); g.moveTo(.8, -3); g.lineTo(1, 0); g.stroke();
  const col = roja ? '#A8502E' : '#F2EEE6', s = roja ? '#6E2E1A' : '#C8BFAF';
  cuerpo(g, [[-4.5, -8.5], [-2, -5], [1, -3], [4, -3.4], [5, -6], [5.2, -8.5], [3, -9], [0, -7], [-4.5, -8.5]], col, s);
  g.fillStyle = roja ? '#2A2A2A' : '#3E3A36'; g.beginPath(); g.moveTo(-4.5, -8.5); g.quadraticCurveTo(-6.5, -12, -4.6, -13); g.quadraticCurveTo(-3.6, -10, -2.5, -7); g.fill();
  cuerpo(g, [[3.4, -8.8], [4.4, -11.4], [6.2, -11], [6.6, -9], [5.2, -7.6], [3.4, -8.8]], col, s);
  g.fillStyle = '#C8352A'; g.beginPath(); g.ellipse(5, -12, 1.3, .8, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(6.3, -8.4, .5, .9, 0, 0, 7); g.fill();
  g.fillStyle = '#D9A93A'; g.beginPath(); g.moveTo(6.5, -10); g.lineTo(8, -9.6); g.lineTo(6.5, -9.2); g.fill();
  g.fillStyle = '#1E1A18'; g.beginPath(); g.arc(5.4, -10, .35, 0, 7); g.fill();
}
function perro(g) {
  sombraAnimal(g, 7);
  pata(g, -4, -5, 0, 1.3, '#8A6A48', '#3A2A1E', -.4); pata(g, 4, -5, 0, 1.3, '#8A6A48', '#3A2A1E', .3);
  cuerpo(g, [[-6, -9], [-1, -10.5], [4, -9.8], [6, -9], [6, -6.5], [3, -5], [-2, -5], [-6, -5.6], [-7, -7.4], [-6, -9]], '#B08455', '#7A5636');
  pata(g, -2.5, -5, 0, 1.3, '#9A744C', '#3A2A1E', .4); pata(g, 5.2, -5, 0, 1.3, '#9A744C', '#3A2A1E', -.2);
  cuerpo(g, [[5, -9.5], [6.5, -13], [9, -13.5], [11, -12], [10.6, -10.5], [8.4, -10], [6.6, -8.4], [5, -9.5]], '#B08455', '#7A5636');
  g.fillStyle = '#5A3E28'; g.beginPath(); g.ellipse(7, -13.4, 1.2, 2, -.6, 0, 7); g.fill();
  g.fillStyle = '#1E1A18'; g.beginPath(); g.arc(10.9, -11.4, .5, 0, 7); g.fill(); g.beginPath(); g.arc(8.8, -12.2, .35, 0, 7); g.fill();
  g.strokeStyle = '#9A744C'; g.lineWidth = 1.1; g.lineCap = 'round'; g.beginPath(); g.moveTo(-6.4, -8.5); g.quadraticCurveTo(-9, -11, -8.4, -13.5); g.stroke();
}
function garza(g) {
  sombraAnimal(g, 4);
  g.strokeStyle = '#2A2420'; g.lineWidth = .6; g.beginPath(); g.moveTo(-.6, -8); g.lineTo(-1, 0); g.moveTo(.8, -8); g.lineTo(1.4, 0); g.stroke();
  cuerpo(g, [[-5, -13], [-1, -14.5], [3, -12.5], [3.6, -10], [1, -8], [-3, -8.4], [-6.5, -10], [-5, -13]], '#FBF8F2', '#D6CFC2');
  g.strokeStyle = '#F4F0E8'; g.lineWidth = 1.5; g.lineCap = 'round'; g.beginPath(); g.moveTo(2.5, -12.5); g.bezierCurveTo(6, -14, 2, -18, 4.5, -21); g.stroke();
  g.strokeStyle = K.contorno; g.lineWidth = .4; g.beginPath(); g.moveTo(3.3, -12.6); g.bezierCurveTo(6.6, -14.2, 2.8, -18, 5.3, -21); g.stroke();
  g.fillStyle = '#FBF8F2'; g.beginPath(); g.ellipse(5, -21.3, 1.5, 1.1, 0, 0, 7); g.fill();
  g.fillStyle = '#E3B23C'; g.beginPath(); g.moveTo(6.2, -21.6); g.lineTo(10, -21); g.lineTo(6.2, -20.6); g.fill();
  g.fillStyle = '#1E1A18'; g.beginPath(); g.arc(5.3, -21.6, .3, 0, 7); g.fill();
}

// ---------- Suelo ----------
// Pasto con textura de pinceladas finas (no manchas), tierra apisonada en la plaza y calles empedradas.
function suelo(g, N, usos, R) {
  // Base de pasto continua, con manchas grandes y suaves de luz y sombra (sin cuadrícula).
  const borde = [P(0, 0), P(0, N), P(N, N), P(N, 0)];
  g.save(); poli(g, borde); g.fillStyle = '#88A65C'; g.fill(); g.clip();
  for (let k = 0; k < N * N * .8; k++) {
    const [x, y] = P(R() * N, R() * N), rr = 30 + R() * 60, col = R() < .5 ? '#9DB86A' : '#6F904A';
    const gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(136,166,92,0)');
    g.globalAlpha = .35; g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, rr, rr * .5, 0, 0, 7); g.fill();
  }
  g.globalAlpha = 1; g.restore();
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    const u = usos[r * N + c], q = [P(r, c), P(r, c + 1), P(r + 1, c + 1), P(r + 1, c)];
    if (u === 'pasto') continue;
    const base = u === 'plaza' ? K.tierra : u === 'calle' ? '#CFC6B4' : u === 'cafe' ? '#7E8C50' : '#A2B86E';
    poli(g, q); g.fillStyle = base; g.fill(); g.strokeStyle = base; g.lineWidth = .8; g.stroke();
  }
  // Pinceladas de pasto: miles de trazos cortos en tonos cercanos, que dan textura sin ensuciar.
  const [x0, y0] = P(0, 0), [x1] = P(0, N), [, y1] = P(N, N), [xl] = P(N, 0);
  for (let k = 0; k < N * N * 90; k++) {
    const r = R() * N, c = R() * N, u = usos[Math.floor(r) * N + Math.floor(c)];
    if (u === 'plaza' || u === 'calle') continue;
    const [x, y] = P(r, c), L = 1.5 + R() * 2.5;
    g.strokeStyle = K.pasto[Math.floor(R() * K.pasto.length)]; g.globalAlpha = .55; g.lineWidth = .7;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + (R() - .5) * 1.4, y - L); g.stroke();
  }
  g.globalAlpha = 1;
  // Plaza: tierra con piedritas; calles: empedrado de canto rodado.
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    const u = usos[r * N + c];
    if (u === 'plaza') for (let k = 0; k < 40; k++) { const [x, y] = P(r + R(), c + R()); g.fillStyle = R() < .5 ? K.tierraOsc : '#E6D6B0'; g.beginPath(); g.ellipse(x, y, .8 + R(), .5 + R() * .4, 0, 0, 7); g.fill(); }
    if (u === 'calle') for (let k = 0; k < 110; k++) { const [x, y] = P(r + .03 + R() * .94, c + .03 + R() * .94); g.fillStyle = mezcla('#D8D0C0', K.piedra, R()); g.beginPath(); g.ellipse(x, y, 1.1 + R() * .5, .6 + R() * .25, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(120,110,95,.3)'; g.lineWidth = .25; g.stroke(); }
    if (u === 'cafe') for (let a = .15; a < 1; a += .23) for (let b = .1; b < 1; b += .14) { const [x, y] = P(r + a, c + b); g.fillStyle = '#5E6E3A'; g.beginPath(); g.ellipse(x, y + 1, 2.2, .9, 0, 0, 7); g.fill(); }
  }
}

// ---------- La aldea ----------
function aldea(cv) {
  const N = 9, usos = Array(N * N).fill('pasto');
  const pon = (r, c, u) => { usos[r * N + c] = u; };
  for (const [r, c] of [[4, 4], [4, 5], [5, 4], [5, 5]]) pon(r, c, 'plaza');
  for (let k = 0; k < N; k++) { pon(3, k, 'calle'); pon(k, 3, 'calle'); pon(6, k, 'calle'); pon(k, 6, 'calle'); }
  for (const [r, c] of [[7, 0], [7, 1], [8, 0], [8, 1], [8, 2]]) pon(r, c, 'cafe');
  for (const [r, c] of [[0, 7], [0, 8], [1, 7], [1, 8], [2, 8]]) pon(r, c, 'potrero');
  const w = cv.clientWidth, h = Math.round(w * .66); cv.style.height = h + 'px'; cv.width = w * DPR; cv.height = h * DPR;
  const g = cv.getContext('2d'), esc = Math.min(w / (N * TW) * 1.02, h / (N * TH + 120));
  g.scale(DPR, DPR); g.fillStyle = '#EEE6D4'; g.fillRect(0, 0, w, h);
  g.translate(w / 2, h * .16); g.scale(esc, esc);
  const R = mulberry(7);
  suelo(g, N, usos, R);
  // Objetos con su posición (r, c) para dibujarlos de atrás hacia adelante.
  const L = [];
  const obj = (r, c, f) => L.push({ r, c, f });
  obj(2, 4.5, g2 => iglesia(g2));
  obj(4.5, 7.4, g2 => cabildo(g2));
  obj(5, 5, g2 => pila(g2));
  obj(4.2, 4.1, g2 => ceiba(g2, mulberry(3)));
  let v = 0;
  for (const [r, c] of [[2, 1.5], [2, 7], [4.5, 1.5], [5.5, 2.4], [7.5, 4.5], [7.5, 5.6], [7.6, 7.5], [1.2, 5.4], [0.8, 2.1]]) { const vv = v++; obj(r, c, g2 => casa(g2, vv)); }
  for (const [r, c] of [[7.3, .4], [7.6, 1.6], [8.4, .7], [8.5, 2.1], [7.9, 2.6]]) obj(r, c, g2 => cafeto(g2, mulberry(r * 10 + c)));
  obj(8.4, 3.6, g2 => platano(g2, mulberry(11))); obj(0.6, 0.6, g2 => guadua(g2, mulberry(12))); obj(1.6, 0.4, g2 => saman(g2, mulberry(13)));
  obj(5.6, 8.6, g2 => palma(g2, mulberry(14))); obj(6.8, 8.6, g2 => palma(g2, mulberry(15))); obj(2.6, 8.6, g2 => saman(g2, mulberry(16)));
  obj(0.5, 7.6, g2 => vaca(g2)); obj(1.5, 8.3, g2 => { g2.scale(-1, 1); vaca(g2); });
  obj(6, 1, g2 => mula(g2)); obj(6, 1.8, g2 => mula(g2));
  obj(5.2, 3.6, g2 => gallina(g2, true)); obj(5.5, 3.8, g2 => gallina(g2, false)); obj(4.6, 6.4, g2 => perro(g2));
  obj(8.6, 5.6, g2 => garza(g2));
  L.sort((a, b) => (a.r + a.c) - (b.r + b.c));
  for (const o of L) { g.save(); const [x, y] = P(o.r, o.c); g.translate(x, y); o.f(g); g.restore(); }
}

// ---------- Antes y ahora ----------
function tarjetaComparar(cont, titulo, antes, ahora, escAntes = 3.2, escAhora = 3.2) {
  const d = document.createElement('div'); d.className = 'par';
  d.innerHTML = `<h3>${titulo}</h3><div class="lado"><figure><canvas></canvas><figcaption>Antes</figcaption></figure><figure><canvas></canvas><figcaption>Ahora</figcaption></figure></div>`;
  cont.append(d);
  const [ca, cb] = d.querySelectorAll('canvas');
  for (const [cv, f, e] of [[ca, antes, escAntes], [cb, ahora, escAhora]]) {
    const w = 170, h = 150; cv.width = w * DPR; cv.height = h * DPR; cv.style.width = w + 'px'; cv.style.height = h + 'px';
    const g = cv.getContext('2d'); g.scale(DPR, DPR); g.fillStyle = '#E9E0CB'; g.fillRect(0, 0, w, h);
    g.save(); g.translate(w / 2, h - 22); g.scale(e, e); f(g); g.restore();
  }
}
function deHoja(H, k) { return g => { const m = H.marcos[k]; if (!m) return; g.drawImage(H.canvas, m.x, m.y, m.w, m.h, -m.ax / H.escala, -m.ay / H.escala, m.w / H.escala, m.h / H.escala); }; }

function iniciar() {
  aldea(document.getElementById('aldea'));
  const NAT = hornearNaturaleza(0), ED = hornearEdificios(), cont = document.getElementById('pares');
  tarjetaComparar(cont, 'Vaca', deHoja(NAT, 'vaca'), vaca, 4, 3.2);
  tarjetaComparar(cont, 'Gallina', deHoja(NAT, 'gallina1'), g => gallina(g, true), 5, 4.5);
  tarjetaComparar(cont, 'Perro', deHoja(NAT, 'perro0'), perro, 5, 4.2);
  tarjetaComparar(cont, 'Garza', deHoja(NAT, 'garza'), garza, 4, 3.6);
  tarjetaComparar(cont, 'Samán', deHoja(NAT, 'saman'), g => saman(g, mulberry(2)), 2.2, 2);
  tarjetaComparar(cont, 'Palma de cera', deHoja(NAT, 'palma'), g => palma(g, mulberry(3)), 1.8, 1.7);
  tarjetaComparar(cont, 'Guadua', deHoja(NAT, 'guadua'), g => guadua(g, mulberry(5)), 2, 2);
  tarjetaComparar(cont, 'Casa', deHoja(ED, 'casa0-1'), g => casa(g, 3), 1.6, 1.55);
  tarjetaComparar(cont, 'Casa de dos pisos', deHoja(ED, 'casa2-1'), g => casa(g, 4), 1.6, 1.4);
  tarjetaComparar(cont, 'Ceiba de la plaza', deHoja(NAT, 'arbol'), g => ceiba(g, mulberry(3)), 2.6, 1.9);
}
if (document.fonts && document.fonts.ready) document.fonts.ready.then(iniciar); else iniciar();
addEventListener('resize', () => { clearTimeout(window._t); window._t = setTimeout(() => aldea(document.getElementById('aldea')), 200); });
