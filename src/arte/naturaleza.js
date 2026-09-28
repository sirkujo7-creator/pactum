// Naturaleza en acuarela: árboles, guadua, frailejones, animales. Se hornea una vez en una hoja
// (atlas) y el mapa solo coloca copias. Dibujos tomados de la prueba de estilo aprobada.
import { mulberry, shade, mix, wash, blob, lienzo } from './acuarela.js';

const ESCALA = 4; // resolución del horneado (alta, para que se vea nítido de cerca)

function sombra(g, rx, ry, dx) { g.globalAlpha = .2; g.fillStyle = '#26301E'; g.beginPath(); g.ellipse(dx || 4, 2, rx, ry, 0, 0, 7); g.fill(); g.globalAlpha = 1; }

// [clave, ancho, alto, anclaX, anclaY, pintura]
function recetas(dry) {
  const leaf = c => mix(c, '#A8954E', dry * .45);
  return [
    ['arbol', 44, 52, 22, 46, (g, r) => { sombra(g, 13, 4, 5); g.strokeStyle = '#6B4F3A'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -12); g.stroke(); blob(g, -5, -18, 9, 8, leaf('#4F7F46'), r); blob(g, 6, -20, 9, 8, leaf('#5E8F4E'), r); blob(g, 0, -27, 10, 9, leaf('#6FA05A'), r); blob(g, -3, -30, 4, 3, '#A9C98A', r, .5); }],
    ['saman', 64, 40, 32, 34, (g, r) => { sombra(g, 22, 5, 6); g.strokeStyle = '#6B5140'; g.lineWidth = 2.4; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(-2, -6, 1, -11); g.moveTo(0, -7); g.lineTo(-7, -12); g.moveTo(1, -9); g.lineTo(8, -13); g.stroke(); blob(g, -9, -15, 11, 5, leaf('#7C8C46'), r); blob(g, 9, -15, 12, 5, leaf('#8A9A4E'), r); blob(g, 0, -19, 15, 5.5, leaf('#9CAA5A'), r); blob(g, -6, -21, 5, 2, '#C9C98A', r, .5); }],
    ['arbusto', 24, 18, 12, 14, (g, r) => { sombra(g, 7, 2.5, 3); blob(g, -3, -4, 5, 4, leaf('#8A9A56'), r); blob(g, 3, -5, 5, 4, leaf('#9CA862'), r); }],
    ['arbolNiebla', 40, 64, 20, 58, (g, r) => { sombra(g, 11, 4, 5); g.strokeStyle = '#5A4636'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -16); g.stroke(); blob(g, 0, -18, 9, 7, '#355E45', r); blob(g, -2, -28, 8, 7, '#3F6B4E', r); blob(g, 1, -38, 7, 7, '#4A7A58', r); blob(g, 0, -46, 5, 5, '#5B8B66', r); for (let k = 0; k < 7; k++) { g.fillStyle = '#A9C79A'; g.globalAlpha = .7; g.beginPath(); g.arc((r() - .5) * 12, -16 - r() * 30, 1, 0, 7); g.fill(); } g.globalAlpha = 1; }],
    ['palma', 36, 86, 18, 80, (g, r) => {
      sombra(g, 6, 2.5, 6); g.strokeStyle = '#CFC7B4'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(1.5, -30, 0, -60); g.stroke(); g.strokeStyle = '#A69E8C'; g.lineWidth = .6; for (let k = 0; k < 12; k++) { g.beginPath(); g.moveTo(-1, -4 - k * 4.5); g.lineTo(1, -4 - k * 4.5); g.stroke(); }
      g.strokeStyle = leaf('#4E7F46'); g.lineWidth = 1.6; for (let k = 0; k < 9; k++) { const a = -Math.PI / 2 + (k - 4) * .42; g.beginPath(); g.moveTo(0, -60); g.quadraticCurveTo(Math.cos(a) * 8, -60 + Math.sin(a) * 8 - 3, Math.cos(a) * 13, -60 + Math.sin(a) * 13 + 5); g.stroke(); }
    }],
    ['guadua', 40, 52, 20, 46, (g, r) => { sombra(g, 10, 3, 4); for (let k = 0; k < 9; k++) { const dx = (k - 4) * 1.7, h = 28 + r() * 12, bend = (k - 4) * 2.8; g.strokeStyle = k % 2 ? leaf('#7DA85A') : leaf('#93B86A'); g.lineWidth = 1.3; g.beginPath(); g.moveTo(dx, 0); g.quadraticCurveTo(dx, -h * .6, dx + bend, -h); g.stroke(); } for (let k = 0; k < 10; k++) blob(g, (r() - .5) * 22, -24 - r() * 14, 2.6, 1.6, leaf('#8FB866'), r, .7); }],
    ['platano', 32, 34, 16, 30, (g, r) => { sombra(g, 8, 2.5, 3); g.strokeStyle = '#8A9A5A'; g.lineWidth = 1.8; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -12); g.stroke(); g.fillStyle = leaf('#6FA04A'); g.globalAlpha = .9; for (let k = 0; k < 6; k++) { const a = -Math.PI / 2 + (k - 2.5) * .62; g.save(); g.translate(0, -12); g.rotate(a + Math.PI / 2); g.beginPath(); g.ellipse(0, -7, 2.4, 7.5, 0, 0, 7); g.fill(); g.restore(); } g.globalAlpha = 1; }],
    ['frailejon', 22, 30, 11, 26, (g, r) => { sombra(g, 5, 2, 2); g.fillStyle = '#7B6E58'; g.fillRect(-2, -11, 4, 11); g.fillStyle = '#9A8D72'; g.fillRect(-2, -11, 1.5, 11); for (let k = 0; k < 11; k++) { const a = k / 11 * Math.PI * 2; g.save(); g.translate(0, -13); g.rotate(a); g.fillStyle = k % 2 ? '#C4CCA8' : '#AEB98E'; g.beginPath(); g.ellipse(0, -4, 1.6, 4.6, 0, 0, 7); g.fill(); g.restore(); } blob(g, 0, -13, 2.2, 1.6, '#E3E6CF', r, .9); }],
    ['piedra', 28, 18, 14, 14, (g, r) => { sombra(g, 8, 2.5, 3); wash(g, [[-9, 0], [-6, -7], [2, -9], [8, -4], [9, 0]], '#A39C92', r, .97, .4); wash(g, [[2, -9], [8, -4], [9, 0], [3, 0]], '#857E74', r, .97, .3); }],
    ['vaca', 26, 20, 13, 16, (g, r) => { sombra(g, 7, 2, 2); g.fillStyle = '#F1EDE4'; g.beginPath(); g.ellipse(0, -6, 6, 3.4, 0, 0, 7); g.fill(); g.fillStyle = '#3B3530'; g.beginPath(); g.ellipse(-2, -6.5, 2.2, 1.6, 0, 0, 7); g.fill(); g.fillStyle = '#F1EDE4'; g.beginPath(); g.ellipse(6, -7.5, 2.4, 2, 0, 0, 7); g.fill(); g.strokeStyle = '#5B524A'; g.lineWidth = 1; [-4, -1, 2, 4].forEach(x => { g.beginPath(); g.moveTo(x, -3.5); g.lineTo(x, 0); g.stroke(); }); }],
    // Animales con vida (fase 1): pastan, picotean, caminan y vuelan.
    ['vacaPasta', 26, 20, 13, 16, (g, r) => { sombra(g, 7, 2, 2); g.fillStyle = '#F1EDE4'; g.beginPath(); g.ellipse(0, -6, 6, 3.4, 0, 0, 7); g.fill(); g.fillStyle = '#3B3530'; g.beginPath(); g.ellipse(-2, -6.5, 2.2, 1.6, 0, 0, 7); g.fill(); g.fillStyle = '#F1EDE4'; g.beginPath(); g.ellipse(6.5, -3.2, 2.2, 1.8, .4, 0, 7); g.fill(); g.strokeStyle = '#5B524A'; g.lineWidth = 1; [-4, -1, 2, 4].forEach(x => { g.beginPath(); g.moveTo(x, -3.5); g.lineTo(x, 0); g.stroke(); }); }],
    ['gallina0', 10, 10, 5, 8, g => { g.globalAlpha = .2; g.fillStyle = '#26301E'; g.beginPath(); g.ellipse(1, 0, 3, 1, 0, 0, 7); g.fill(); g.globalAlpha = 1; g.fillStyle = '#F4EFE6'; g.beginPath(); g.ellipse(0, -3, 2.6, 2, 0, 0, 7); g.fill(); g.beginPath(); g.arc(2.2, -4.8, 1.3, 0, 7); g.fill(); g.fillStyle = '#C8302A'; g.fillRect(2, -6.6, 1, 1); g.fillStyle = '#E0A030'; g.fillRect(3.3, -4.9, 1.1, .6); g.strokeStyle = '#D09A40'; g.lineWidth = .5; g.beginPath(); g.moveTo(-.6, -1); g.lineTo(-.6, 0); g.moveTo(.8, -1); g.lineTo(.8, 0); g.stroke(); }],
    ['gallina1', 10, 10, 5, 8, g => { g.globalAlpha = .2; g.fillStyle = '#26301E'; g.beginPath(); g.ellipse(1, 0, 3, 1, 0, 0, 7); g.fill(); g.globalAlpha = 1; g.fillStyle = '#A0522D'; g.beginPath(); g.ellipse(0, -3, 2.6, 2, 0, 0, 7); g.fill(); g.beginPath(); g.arc(2.8, -2.2, 1.2, 0, 7); g.fill(); g.fillStyle = '#C8302A'; g.fillRect(2.6, -3.8, 1, .9); g.fillStyle = '#E0A030'; g.fillRect(3.8, -2.2, 1, .5); g.strokeStyle = '#D09A40'; g.lineWidth = .5; g.beginPath(); g.moveTo(-.6, -1); g.lineTo(-.6, 0); g.moveTo(.8, -1); g.lineTo(.8, 0); g.stroke(); }],
    ...[0, 1].map(f => ['perro' + f, 18, 14, 9, 11, g => { sombra(g, 5, 1.6, 1); g.fillStyle = '#8A6A48'; g.beginPath(); g.ellipse(0, -4.5, 4.5, 2.2, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(4.8, -6.4, 1.8, 1.6, 0, 0, 7); g.fill(); g.fillStyle = '#5E4632'; g.beginPath(); g.ellipse(4.2, -7.6, .9, 1.3, -.4, 0, 7); g.fill(); g.strokeStyle = '#8A6A48'; g.lineWidth = 1.1; g.lineCap = 'round'; const s = f ? 1.2 : -1.2; [[-3, s], [-1.5, -s], [2, -s], [3.4, s]].forEach(([x, d]) => { g.beginPath(); g.moveTo(x, -3); g.lineTo(x + d * .6, 0); g.stroke(); }); g.beginPath(); g.moveTo(-4.3, -5); g.quadraticCurveTo(-6.5, -7.5 + f, -6.8, -8.5 + f); g.stroke(); }]),
    ...[0, 1].map(f => ['pajaro' + f, 12, 8, 6, 4, g => { g.strokeStyle = '#3A3530'; g.lineWidth = 1; g.lineCap = 'round'; g.beginPath(); if (f) { g.moveTo(-5, 1); g.quadraticCurveTo(-2.5, -1.5, 0, 0); g.quadraticCurveTo(2.5, -1.5, 5, 1); } else { g.moveTo(-5, -2.5); g.quadraticCurveTo(-2.5, 1, 0, 0); g.quadraticCurveTo(2.5, 1, 5, -2.5); } g.stroke(); }]),
    ...[0, 1].map(f => ['loro' + f, 14, 10, 7, 5, g => { g.fillStyle = '#3E9A4A'; g.beginPath(); g.ellipse(0, 0, 3.2, 1.6, 0, 0, 7); g.fill(); g.fillStyle = '#E0A030'; g.beginPath(); g.arc(3, -.3, 1.1, 0, 7); g.fill(); g.fillStyle = '#C8302A'; g.fillRect(-4.8, -.4, 2, .9); g.fillStyle = '#2E7A3A'; g.beginPath(); if (f) { g.moveTo(-1.5, 0); g.lineTo(1, -4); g.lineTo(1.8, 0); } else { g.moveTo(-1.5, 0); g.lineTo(1, 3.5); g.lineTo(1.8, 0); } g.fill(); }]),
    ['garzaVuela', 20, 12, 10, 6, g => { g.fillStyle = '#FBFBF8'; g.beginPath(); g.ellipse(0, 0, 3.2, 1.5, 0, 0, 7); g.fill(); g.beginPath(); g.moveTo(-1, 0); g.quadraticCurveTo(-5, -5, -9, -3); g.quadraticCurveTo(-5, -1, -1, 1); g.fill(); g.beginPath(); g.moveTo(1, 0); g.quadraticCurveTo(5, -5, 9, -3); g.quadraticCurveTo(5, -1, 1, 1); g.fill(); g.fillStyle = '#E0B040'; g.fillRect(3, -.5, 2.5, .7); }],
    // Suelo vivo (fase 1): troncos quemados que deja un incendio.
    ['tocon', 18, 22, 9, 18, (g, r) => { g.globalAlpha = .25; g.fillStyle = '#26221E'; g.beginPath(); g.ellipse(2, 1, 6, 2, 0, 0, 7); g.fill(); g.globalAlpha = 1; g.fillStyle = '#3A302A'; g.beginPath(); g.moveTo(-2.4, 0); g.lineTo(-1.8, -11); g.lineTo(-.6, -13); g.lineTo(.4, -10.5); g.lineTo(1.6, -12); g.lineTo(2.4, 0); g.closePath(); g.fill(); g.strokeStyle = '#2A2420'; g.lineWidth = 1; g.beginPath(); g.moveTo(1, -7); g.lineTo(4.5, -10); g.stroke(); g.fillStyle = '#6A5E54'; g.globalAlpha = .6; g.fillRect(-1.6, -9, .8, 7); g.globalAlpha = 1; }],
    ['garza', 14, 20, 7, 17, (g, r) => { g.strokeStyle = '#E8D8A0'; g.lineWidth = .7; g.beginPath(); g.moveTo(-1, 0); g.lineTo(-1, -5); g.moveTo(1, 0); g.lineTo(1, -5); g.stroke(); g.fillStyle = '#FBFBF8'; g.beginPath(); g.ellipse(0, -7.5, 2.4, 3, .2, 0, 7); g.fill(); g.strokeStyle = '#FBFBF8'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(1, -10); g.quadraticCurveTo(3, -12, 2, -14); g.stroke(); g.fillStyle = '#E0B040'; g.fillRect(2, -14.5, 2.5, .8); }]
  ];
}

// Hornea todas las figuras en una sola hoja. Devuelve { canvas, marcos: {clave: {x, y, w, h, ax, ay}}, escala }.
const HOJAS = {};
export function hornearNaturaleza(dry = 0) {
  const clave = Math.round(dry * 10) / 10;
  if (HOJAS[clave]) return HOJAS[clave];
  dry = clave;
  const lista = recetas(dry), sep = 4, anchoHoja = 2048;
  const marcos = {};
  let x = sep, y = sep, fila = 0;
  for (const [k, w, h, ax, ay] of lista) {
    const W = Math.ceil(w * ESCALA), H = Math.ceil(h * ESCALA);
    if (x + W > anchoHoja) { x = sep; y += fila + sep; fila = 0; }
    marcos[k] = { x, y, w: W, h: H, ax: ax * ESCALA, ay: ay * ESCALA };
    x += W + sep; fila = Math.max(fila, H);
  }
  const cv = lienzo(anchoHoja, y + fila + sep), g = cv.getContext('2d');
  for (const [k, , , , , pintar] of lista) {
    const m = marcos[k];
    g.save(); g.translate(m.x + m.ax, m.y + m.ay); g.scale(ESCALA, ESCALA);
    pintar(g, mulberry(k.length * 97 + k.charCodeAt(0) * 13 + (k.charCodeAt(k.length - 1) || 0)));
    g.restore();
  }
  return (HOJAS[clave] = { canvas: cv, marcos, escala: ESCALA });
}

// Qué crece en cada casilla según su entorno. Solo en casillas libres; el bosque lógico
// (bosque de niebla) es denso, y si se tala queda sin árboles.
export function colocarNaturaleza(T, mapa) {
  const objs = [];
  for (const t of T.tiles) {
    const i = t.r * T.N + t.c, m = mapa[i];
    if (m.b) continue;
    if (t.b === 'niebla' && m.t !== 'bosque') continue;
    const R = mulberry(T.seed * 7 + i * 131 + 9), p = R();
    const add = (k, n, sc = 1) => { for (let j = 0; j < n; j++) objs.push({ k, i, r: t.r + .15 + R() * .7, c: t.c + .15 + R() * .7, s: sc * (.85 + R() * .3) }); };
    switch (t.b) {
      case 'galeria': add('arbol', p < .7 ? 2 : 1); if (p < .35) add('guadua', 1); break;
      case 'seco': if (p < .45) add('saman', 1); else if (p < .6) add('arbusto', 2); break;
      case 'potrero': if (p < .12) add('arbol', 1); else if (p < .3) add('vaca', 1); break;
      case 'arrozal': if (p < .15) add('garza', 1); break;
      case 'ladera': if (p < .25) add('platano', 1); else if (p < .42) add('guadua', 1); else if (p < .5) add('palma', 1); else if (p < .65) add('arbol', 1, .9); break;
      case 'niebla': add('arbolNiebla', p < .6 ? 3 : 2); if (p < .18) add('palma', 1, 1.1); break;
      case 'paramo': if (p < .75) add('frailejon', p < .4 ? 3 : 2); if (p > .9) add('piedra', 1); break;
      case 'roca': if (p < .35) add('piedra', 1); break;
    }
  }
  return objs;
}

// Bosque que vuelve a crecer (fase 1) en casillas que no eran bosque de niebla: árboles de su piso térmico.
export function arbolesDeBosque(T, i) {
  const t = T.tiles[i], R = mulberry(T.seed * 11 + i * 173 + 5), alto = t.h > 4.4, objs = [];
  const add = (k, sc = 1) => objs.push({ k, i, r: t.r + .15 + R() * .7, c: t.c + .15 + R() * .7, s: sc * (.85 + R() * .3) });
  for (let j = 0, n = R() < .6 ? 3 : 2; j < n; j++) add(alto ? 'arbolNiebla' : 'arbol', alto ? 1 : .95);
  if (!alto && R() < .4) add('guadua');
  return objs;
}
// Troncos quemados de una casilla tras un incendio.
export function toconesDe(T, i) {
  const t = T.tiles[i], R = mulberry(T.seed * 5 + i * 97 + 3), objs = [];
  for (let j = 0, n = 2 + Math.floor(R() * 3); j < n; j++) objs.push({ k: 'tocon', i, r: t.r + .15 + R() * .7, c: t.c + .15 + R() * .7, s: .8 + R() * .4 });
  return objs;
}
