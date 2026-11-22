// Calles y vehículos al fresco (fase 9): arrieros con mulas (herradura), chivas (empedrado) y camiones (carretera),
// horneados una vez en una hoja con cada eje y sentido. También el icono de la herramienta "Calle".
import { FR, mulberry, shade, mix, lienzo, pintar, cajaIso, urlDe, RES_HOJA } from './fresco.js';
import { hornearGente } from './gente.js';
import { P } from './iso.js';
import { ESTILO_CALLE } from './terreno.js';

// Caja de un vehículo orientada por su eje ('c' o 'r'), en el punto (r, c) del mundo.
function caja(g, r, c, eje, largo, ancho, alto, z0, cols, rng) {
  const B = eje === 'c' ? cajaIso(largo, ancho, alto) : cajaIso(ancho, largo, alto), o = P(r, c), up = p => [p[0] + o[0], p[1] + o[1] - z0];
  pintar(g, B.izq.map(up), cols[0], rng, { n: 1, bw: .4 }); pintar(g, B.der.map(up), cols[1], rng, { n: 1, bw: .4 }); pintar(g, B.techo.map(up), cols[2], rng, { n: 1, bw: .4 });
  return { B, up };
}
function rueda(g, p) { g.fillStyle = FR.carbon; g.beginPath(); g.ellipse(p[0], p[1] - 1, 1.6, 1.3, 0, 0, Math.PI * 2); g.fill(); }
const L = (p, s, f) => [p[0] + (s[0] - p[0]) * f, p[1] + (s[1] - p[1]) * f];
function ruedas(g, B, up, fs) { for (const f of fs) { rueda(g, up(L(B.izq[0], B.izq[1], f))); rueda(g, up(L(B.der[0], B.der[1], f))); } }

// Mula con enjalma y dos bultos de café (de la prueba colonial). paso 0..3: patas en diagonal al andar.
function mula(g, paso) {
  const grad = (y0, y1, c, s) => { const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, mix(c, '#FFFFFF', .2)); gr.addColorStop(.6, c); gr.addColorStop(1, s); return gr; };
  const cuerpo = (pts, c, s) => { g.beginPath(); g.moveTo(...pts[0]); for (let k = 1; k < pts.length; k += 2) { if (pts[k + 1]) g.quadraticCurveTo(...pts[k], ...pts[k + 1]); else g.lineTo(...pts[k]); } g.closePath(); const ys = pts.map(p => p[1]); g.fillStyle = grad(Math.min(...ys), Math.max(...ys), c, s); g.fill(); g.strokeStyle = 'rgba(70,45,30,.55)'; g.lineWidth = .5; g.stroke(); };
  const pata = (x, w, col, dx) => { g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, -8); g.quadraticCurveTo(x + dx * .3, -4, x + dx, -1); g.stroke(); g.strokeStyle = '#1E1A18'; g.beginPath(); g.moveTo(x + dx, -.8); g.lineTo(x + dx, 0); g.stroke(); };
  const s = Math.sin(paso / 4 * Math.PI * 2) * 2;
  g.save(); g.globalAlpha = .25; g.fillStyle = '#2A2A1E'; g.beginPath(); g.ellipse(1, 0, 12, 3.4, 0, 0, 7); g.fill(); g.restore();
  pata(-6, 1.8, '#5A3A26', -s); pata(6, 1.8, '#5A3A26', s);
  cuerpo([[-9, -14], [-1, -16], [6, -14.5], [9, -13], [9, -9.5], [8.5, -7], [2, -7], [-4, -7], [-9, -8], [-10.5, -11], [-9, -14]], '#7A5236', '#4E3322');
  pata(-4, 1.8, '#6A452E', s); pata(8, 1.8, '#6A452E', -s);
  cuerpo([[8, -13], [10, -18], [12.5, -21], [15, -20], [16.2, -17.5], [15.5, -16], [13, -16.5], [11, -13], [8, -13]], '#7A5236', '#4E3322');
  g.fillStyle = '#4E3322'; g.beginPath(); g.ellipse(12.2, -22.6, .9, 2.6, -.3, 0, 7); g.fill(); g.beginPath(); g.ellipse(13.6, -22.4, .9, 2.4, .2, 0, 7); g.fill();
  g.fillStyle = '#1E1A18'; g.beginPath(); g.arc(13.6, -19, .5, 0, 7); g.fill();
  for (const [x, col] of [[-4, '#C9B48A'], [3, '#BFA87C']]) { cuerpo([[x - 4, -19], [x, -21], [x + 4, -19], [x + 4.5, -15], [x + 4, -11], [x, -10], [x - 4, -11], [x - 4.5, -15], [x - 4, -19]], col, mix(col, '#000000', .3)); g.strokeStyle = '#8A6A40'; g.lineWidth = .5; g.beginPath(); g.moveTo(x - 4, -15); g.lineTo(x + 4, -15); g.stroke(); }
  g.strokeStyle = '#3A2A1E'; g.lineWidth = .8; g.beginPath(); g.moveTo(-9.5, -12); g.quadraticCurveTo(-12, -9 + s * .3, -11, -5); g.stroke();
}

// Buey de la yunta (paso 4 de Anno): cuerpo pesado, giba de cebú, cuernos cortos y el yugo sobre la nuca.
function buey(g, paso, col, sombra) {
  const s = Math.sin(paso / 4 * Math.PI * 2) * 1.6, osc = mix(col, '#000000', .32);
  const pata = (x, dx, c) => { g.strokeStyle = c; g.lineWidth = 2.2; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, -8); g.lineTo(x + dx, -1); g.stroke(); g.strokeStyle = '#1E1A18'; g.lineWidth = 2; g.beginPath(); g.moveTo(x + dx, -1.4); g.lineTo(x + dx, -.2); g.stroke(); };
  if (sombra) { g.save(); g.globalAlpha = .25; g.fillStyle = '#2A2A1E'; g.beginPath(); g.ellipse(1, 0, 13, 3.4, 0, 0, 7); g.fill(); g.restore(); }
  pata(-6, -s, osc); pata(6, s, osc);
  const gr = g.createLinearGradient(0, -17, 0, -7); gr.addColorStop(0, mix(col, '#FFFFFF', .25)); gr.addColorStop(.6, col); gr.addColorStop(1, osc);
  g.fillStyle = gr; g.strokeStyle = 'rgba(40,28,18,.6)'; g.lineWidth = .5;
  g.beginPath(); g.moveTo(-10, -13); g.quadraticCurveTo(-9, -16.5, -3, -16); g.quadraticCurveTo(1, -19.5, 4, -16.5); g.quadraticCurveTo(9, -16, 10, -13); g.lineTo(10, -9); g.quadraticCurveTo(4, -6.5, -3, -7); g.quadraticCurveTo(-10, -7, -10.5, -10); g.closePath(); g.fill(); g.stroke(); // cuerpo con giba
  pata(-4, s, col); pata(8, -s, col);
  g.fillStyle = col; g.beginPath(); g.moveTo(9, -15); g.quadraticCurveTo(12, -16, 14.5, -14); g.lineTo(15.2, -11); g.quadraticCurveTo(13, -10, 11, -11); g.closePath(); g.fill(); g.stroke(); // cabeza
  g.strokeStyle = '#E8E0CC'; g.lineWidth = .9; g.beginPath(); g.moveTo(12, -15.4); g.quadraticCurveTo(12.6, -18, 14, -18.4); g.stroke(); // cuerno
  g.fillStyle = '#1E1A18'; g.beginPath(); g.arc(13.6, -13.6, .45, 0, 7); g.fill();
  g.strokeStyle = '#5A3A22'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(8, -17.2); g.lineTo(11, -16.6); g.stroke(); // yugo
  g.strokeStyle = '#3A2A1E'; g.lineWidth = .7; g.beginPath(); g.moveTo(-10.2, -12); g.quadraticCurveTo(-12, -9, -11.2, -6); g.stroke(); // cola
}
// Carreta de bueyes: la yunta adelante y la carreta de dos ruedas con su carga (bultos y atados de caña).
function carretaBueyes(g, paso) {
  g.save(); g.translate(12, -1.5); g.scale(.62, .62); buey(g, (paso + 2) % 4, '#8A6040', false); g.restore(); // el de atrás
  g.save(); g.translate(13, 0); g.scale(.62, .62); buey(g, paso, '#E6DCC8', true); g.restore();
  g.strokeStyle = '#5A3A22'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(-2, -7); g.lineTo(17, -10.6); g.stroke(); // vara hasta el yugo
  g.save(); g.globalAlpha = .25; g.fillStyle = '#2A2A1E'; g.beginPath(); g.ellipse(-7, 0, 9, 2.6, 0, 0, 7); g.fill(); g.restore();
  const tabla = (pts, c) => { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fillStyle = c; g.fill(); g.strokeStyle = 'rgba(40,28,18,.7)'; g.lineWidth = .5; g.stroke(); };
  tabla([[-15, -11], [-1, -11], [-1, -6.5], [-15, -6.5]], '#8A6A44'); // costado de la carreta
  g.strokeStyle = '#6A4C30'; g.lineWidth = .4; for (const y of [-9.5, -8]) { g.beginPath(); g.moveTo(-15, y); g.lineTo(-1, y); g.stroke(); }
  for (const [x, c] of [[-12, '#C9B48A'], [-8, '#BFA87C'], [-4.5, '#C9B48A']]) { g.fillStyle = c; g.beginPath(); g.ellipse(x, -12.6, 2.4, 2, 0, 0, 7); g.fill(); g.strokeStyle = mix(c, '#000000', .3); g.lineWidth = .4; g.stroke(); } // bultos
  g.strokeStyle = '#8FA24E'; g.lineWidth = .8; for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(-14 + k * .6, -14.5 - k * .3); g.lineTo(-2 + k * .4, -15.5 - k * .3); g.stroke(); } // atado de caña encima
  const rr = 4.6, cx = -8, cy = -5; // rueda grande de madera con radios
  g.fillStyle = '#5A3A22'; g.beginPath(); g.arc(cx, cy, rr, 0, 7); g.fill(); g.fillStyle = '#8A6A44'; g.beginPath(); g.arc(cx, cy, rr - 1, 0, 7); g.fill();
  g.strokeStyle = '#5A3A22'; g.lineWidth = .7; const a0 = paso * Math.PI / 8;
  for (let k = 0; k < 6; k++) { const a = a0 + k * Math.PI / 3; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * (rr - 1), cy + Math.sin(a) * (rr - 1)); g.stroke(); }
  g.fillStyle = '#3A2A1E'; g.beginPath(); g.arc(cx, cy, .9, 0, 7); g.fill();
}

// Dibuja un vehículo en el origen. eje 'c' o 'r'; dir +1 o −1; paso 0..3 (patas de la mula y del arriero).
function vehiculo(g, era, eje, dir, paso, vi) {
  const rng = mulberry(7), adelante = (eje === 'c' ? [0, .14] : [.14, 0]).map(x => x * dir);
  if (era === 'herradura') {
    // Renovación colonial: mula de arriero dibujada (con sus patas al paso) y el arriero detrás, arreándola.
    const derecha = (eje === 'c') === (dir > 0), atras = P(eje === 'r' ? -.14 * dir : 0, eje === 'c' ? -.14 * dir : 0);
    const G = hornearGente(), m = G.marcos[`campesino_${vi}_${(eje === 'c' ? dir > 0 : dir > 0) ? 1 : 0}_${paso}`], E2 = G.escala;
    const arriero = () => { if (m) { g.save(); g.translate(atras[0], atras[1]); if (!derecha) g.scale(-1, 1); g.drawImage(G.canvas, m.x, m.y, m.w, m.h, -m.ax / E2 * .7, -m.ay / E2 * .7, m.w / E2 * .7, m.h / E2 * .7); g.restore(); } };
    const delante = dir > 0; // de frente al jugador: el arriero queda detrás de la mula
    if (delante) arriero();
    g.save(); if (!derecha) g.scale(-1, 1); g.scale(.6, .6); mula(g, paso); g.restore();
    if (!delante) arriero();
  } else if (era === 'carreta') {
    const derecha = (eje === 'c') === (dir > 0);
    g.save(); if (!derecha) g.scale(-1, 1); g.scale(.95, .95); g.translate(-2, 0); carretaBueyes(g, paso); g.restore();
  } else if (era === 'empedrado') {
    // Chiva: bus de madera pintado de colores, con carga en el techo.
    const { B, up } = caja(g, 0, 0, eje, .36, .16, 9, 2, [FR.ocre, shade(FR.ocre, -.15), FR.rojo], rng);
    for (const [cara, sh] of [[B.izq, 0], [B.der, -.15]]) {
      for (const [v0, v1, col] of [[.15, .32, FR.rojo], [.32, .48, FR.azul], [.48, .6, FR.verde]]) pintar(g, [L(cara[0], cara[3], v0), L(cara[1], cara[2], v0), L(cara[1], cara[2], v1), L(cara[0], cara[3], v1)].map(up), shade(col, sh), rng, { n: 0, borde: false });
      for (let k = 0; k < 4; k++) { const u0 = .1 + k * .21; pintar(g, [L(L(cara[0], cara[1], u0), L(cara[3], cara[2], u0), .66), L(L(cara[0], cara[1], u0 + .14), L(cara[3], cara[2], u0 + .14), .66), L(L(cara[0], cara[1], u0 + .14), L(cara[3], cara[2], u0 + .14), .92), L(L(cara[0], cara[1], u0), L(cara[3], cara[2], u0), .92)].map(up), '#3A3532', rng, { n: 0, bw: .3 }); }
    }
    caja(g, 0, 0, eje, .22, .1, 2.5, 11, [FR.cal, shade(FR.cal, -.15), FR.ocreClaro], rng);
    ruedas(g, B, up, [.15, .85]);
  } else {
    // Camión: platón con carga y cabina azul adelante.
    const { B, up } = caja(g, -adelante[0] * .5, -adelante[1] * .5, eje, .26, .15, 6, 2, ['#8A7A5A', '#6E6048', '#9C8C6A'], rng);
    caja(g, -adelante[0] * .5, -adelante[1] * .5, eje, .22, .12, 4, 8, [FR.ocreClaro, shade(FR.ocreClaro, -.15), FR.ocre], rng);
    caja(g, adelante[0] * .9, adelante[1] * .9, eje, .1, .15, 8, 2, [FR.azul, shade(FR.azul, -.2), shade(FR.azul, .2)], rng);
    ruedas(g, B, up, [.2, .8]);
  }
}

// Hoja de vehículos: claves `${era}_${eje}_${+|-}_${paso}` (los carros tienen solo el paso 0).
let HOJA = null;
export function hornearVehiculos() {
  if (HOJA) return HOJA;
  const E = RES_HOJA, w = 44, h = 34, ax = 22, ay = 24, claves = [];
  // Cada arriero conserva su ropa (vi) en los cuatro pasos; antes cambiaba de color en cada paso.
  for (const era of ['herradura', 'carreta', 'empedrado', 'carretera']) for (const eje of ['c', 'r']) for (const dir of [1, -1]) for (let p = 0; p < (era === 'herradura' || era === 'carreta' ? 4 : 1); p++) for (let vi = 0; vi < (era === 'herradura' ? 3 : 1); vi++) claves.push([era, eje, dir, p, vi]);
  const cols = 8, cv = lienzo(cols * w * E, Math.ceil(claves.length / cols) * h * E), g = cv.getContext('2d'), marcos = {};
  claves.forEach(([era, eje, dir, p, vi], n) => {
    const x = (n % cols) * w * E, y = Math.floor(n / cols) * h * E;
    marcos[`${era}_${eje}_${dir > 0 ? '+' : '-'}_${p}_${vi}`] = { x, y, w: w * E, h: h * E, ax: ax * E, ay: ay * E };
    g.save(); g.translate(x + ax * E, y + ay * E); g.scale(E, E); vehiculo(g, era, eje, dir, p, vi); g.restore();
  });
  return (HOJA = { canvas: cv, marcos, escala: E });
}

// Icono de la herramienta: un rombo de tierra con un cruce de calles del estilo de la época (y una X para quitar).
const ICONOS = {};
export function iconoCalle(era, quitar) {
  const k = era + (quitar ? '-x' : '');
  if (ICONOS[k]) return ICONOS[k];
  const c = lienzo(96, 80), g = c.getContext('2d'), R = mulberry(5), E = ESTILO_CALLE[era] || ESTILO_CALLE.herradura;
  pintar(g, [[48, 22], [86, 41], [48, 60], [10, 41]], mix(FR.tierraVerde, FR.ocreClaro, .35), R, { n: 2, bw: .6 });
  g.lineCap = 'round';
  for (const [w, col, al] of [[E.ancho * 1.3 + 3, E.borde, .5], [E.ancho * 1.3, E.color, 1]]) { g.globalAlpha = al; g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(29, 31.5); g.lineTo(67, 50.5); g.moveTo(67, 31.5); g.lineTo(29, 50.5); g.stroke(); }
  g.globalAlpha = 1;
  if (era === 'carretera') { g.strokeStyle = FR.ocre; g.lineWidth = 1; g.setLineDash([4, 4]); g.beginPath(); g.moveTo(29, 31.5); g.lineTo(67, 50.5); g.stroke(); g.setLineDash([]); }
  if (quitar) { g.strokeStyle = FR.rojo; g.lineWidth = 6; g.beginPath(); g.moveTo(34, 26); g.lineTo(62, 56); g.moveTo(62, 26); g.lineTo(34, 56); g.stroke(); }
  return (ICONOS[k] = urlDe(c));
}
