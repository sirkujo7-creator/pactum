// Pobladores de la prueba de estilo: proporciones tipo juguete y silueta por clase.
// Campesino con aguadeño y ruana, campesina con pañoleta y falda, artesano con delantal y gorra,
// élite con sombrero de copa y bastón, niños. Tres variantes de color y cuatro posturas al caminar.
import { shade, lienzo } from './acuarela.js';

export const TIPOS = {
  campesino: [['#8C3B2E', '#D9B54A'], ['#3F5E7A', '#C9A24A'], ['#5B4636', '#B84A3A']],
  campesina: [['#B23A2E'], ['#2F6E8E'], ['#C08A2A']],
  artesano: [['#5C7C9A'], ['#7A5C8A'], ['#4E7A5A']],
  elite: [['#2E3440'], ['#4A3B2E'], ['#34404A']],
  nino: [['#E0A030'], ['#3E8E7E'], ['#D0604A']]
};
const SKIN = ['#C98E62', '#E0B08A', '#B07A52'];
function limb(g, x1, y1, x2, y2, w, col) { g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); }
function outline(g, al) { g.globalAlpha = al || .55; g.strokeStyle = '#2A2420'; g.lineWidth = .55; g.stroke(); g.globalAlpha = 1; }

function persona(g, type, vi, front, frame) {
  const V = TIPOS[type][vi], skin = SKIN[vi % 3], ph = frame / 4 * Math.PI * 2, sw = Math.sin(ph), bob = Math.abs(Math.sin(ph)) * .7;
  const kid = type === 'nino', S = kid ? .74 : 1;
  g.save(); g.globalAlpha = .24; g.fillStyle = '#1E241A'; g.beginPath(); g.ellipse(0, 0, 5.2 * S, 1.9 * S, 0, 0, Math.PI * 2); g.fill(); g.restore();
  g.save(); g.scale(S, S); g.translate(0, -bob);
  const skirt = type === 'campesina';
  const pants = { campesino: '#E6DDC6', campesina: '#6B4A33', artesano: '#4A4038', elite: '#3A3F4A', nino: '#3E4A5E' }[type];
  const lx = -1.5 + sw * 1.6, rx = 1.5 - sw * 1.6, hipY = skirt ? -4 : -8;
  limb(g, -1.3, hipY, lx, -.6, 2.3, pants); limb(g, 1.3, hipY, rx, -.6, 2.3, pants);
  g.fillStyle = type === 'elite' ? '#1C1C1E' : type === 'campesino' ? '#E8DCC0' : '#3A2E26';
  [lx, rx].forEach(x => { g.beginPath(); g.ellipse(x + .4, -.3, 1.5, .8, 0, 0, Math.PI * 2); g.fill(); });
  const body = { campesino: '#F1EBDD', campesina: '#F6F1E6', artesano: V[0], elite: V[0], nino: V[0] }[type];
  g.fillStyle = body; g.beginPath(); g.moveTo(-3.4, -15); g.quadraticCurveTo(-3.9, -11, -3, -7.2); g.lineTo(3, -7.2); g.quadraticCurveTo(3.9, -11, 3.4, -15); g.quadraticCurveTo(0, -16.2, -3.4, -15); g.fill(); outline(g, .4);
  if (skirt) {
    g.fillStyle = V[0]; g.beginPath(); g.moveTo(-3.1, -8.6); g.lineTo(3.1, -8.6); g.lineTo(4.4, -2.2); g.quadraticCurveTo(0, -1.2, -4.4, -2.2); g.closePath(); g.fill(); outline(g, .4);
    g.globalAlpha = .5; g.strokeStyle = shade(V[0], .35); g.lineWidth = .6; g.beginPath(); g.moveTo(-4, -3.4); g.quadraticCurveTo(0, -2.6, 4, -3.4); g.stroke(); g.globalAlpha = 1;
  }
  if (type === 'artesano' && front) { g.fillStyle = '#8A6A48'; g.beginPath(); g.moveTo(-2.4, -13.4); g.lineTo(2.4, -13.4); g.lineTo(2.8, -5.4); g.lineTo(-2.8, -5.4); g.closePath(); g.fill(); outline(g, .35); }
  if (type === 'elite' && front) { g.fillStyle = '#F4F1E8'; g.beginPath(); g.moveTo(-1.3, -15); g.lineTo(1.3, -15); g.lineTo(0, -11.4); g.closePath(); g.fill(); g.fillStyle = '#8C1C1C'; g.fillRect(-.45, -14.4, .9, 2.6); }
  const arm = type === 'campesino' ? V[0] : body;
  limb(g, -3.2, -14.2, -3.9 + sw * 1.4, -9.4, 1.9, arm); limb(g, 3.2, -14.2, 3.9 - sw * 1.4, -9.4, 1.9, arm);
  g.fillStyle = skin; g.beginPath(); g.arc(-3.9 + sw * 1.4, -9.1, .95, 0, Math.PI * 2); g.arc(3.9 - sw * 1.4, -9.1, .95, 0, Math.PI * 2); g.fill();
  if (type === 'elite') { g.strokeStyle = '#4A3A2C'; g.lineWidth = .7; g.beginPath(); g.moveTo(3.9 - sw * 1.4, -9); g.lineTo(5.2 - sw * .6, 0); g.stroke(); }
  if (type === 'campesino') {
    g.fillStyle = V[0]; g.beginPath(); g.moveTo(-3.6, -15.2); g.quadraticCurveTo(0, -16.4, 3.6, -15.2); g.lineTo(5.4, -9.2); g.quadraticCurveTo(0, -7.6, -5.4, -9.2); g.closePath(); g.fill(); outline(g, .45);
    g.strokeStyle = V[1]; g.lineWidth = .7; g.globalAlpha = .9; g.beginPath(); g.moveTo(-5, -10); g.quadraticCurveTo(0, -8.5, 5, -10); g.stroke(); g.beginPath(); g.moveTo(-4.4, -11.6); g.quadraticCurveTo(0, -10.2, 4.4, -11.6); g.stroke(); g.globalAlpha = 1;
  }
  g.fillStyle = skin; g.beginPath(); g.arc(0, -18.8, 3.7, 0, Math.PI * 2); g.fill(); outline(g, .35);
  const hair = vi === 2 ? '#5A3A24' : '#2A2018';
  if (!front) { g.fillStyle = hair; g.beginPath(); g.arc(0, -19, 3.7, Math.PI * .9, Math.PI * 2.1); g.fill(); if (type === 'campesina') g.fillRect(-.7, -17, 1.4, 4); }
  else {
    g.fillStyle = hair; g.beginPath(); g.arc(0, -19.4, 3.7, Math.PI * 1.05, Math.PI * 1.95); g.fill();
    g.fillStyle = '#2A2018'; g.beginPath(); g.arc(-1.35, -18.5, .48, 0, Math.PI * 2); g.arc(1.35, -18.5, .48, 0, Math.PI * 2); g.fill();
    g.globalAlpha = .25; g.fillStyle = '#D0604A'; g.beginPath(); g.arc(-2.2, -17.4, .8, 0, Math.PI * 2); g.arc(2.2, -17.4, .8, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1;
  }
  if (type === 'campesino') { g.fillStyle = '#F4EFE2'; g.beginPath(); g.ellipse(0, -21.4, 6.6, 1.9, 0, 0, Math.PI * 2); g.fill(); outline(g, .4); g.beginPath(); g.moveTo(-3.2, -21.6); g.quadraticCurveTo(-3.3, -25.6, 0, -25.8); g.quadraticCurveTo(3.3, -25.6, 3.2, -21.6); g.closePath(); g.fill(); outline(g, .35); g.fillStyle = '#231F1C'; g.fillRect(-3.2, -22.9, 6.4, 1); }
  if (type === 'campesina') { g.fillStyle = V[0] === '#B23A2E' ? '#E7C76B' : '#B23A2E'; g.beginPath(); g.arc(0, -19.6, 3.9, Math.PI * 1.02, Math.PI * 1.98); g.lineTo(3.7, -18.4); g.lineTo(-3.7, -18.4); g.closePath(); g.fill(); outline(g, .3); }
  if (type === 'artesano') { g.fillStyle = '#3F4A55'; g.beginPath(); g.arc(0, -20.2, 3.7, Math.PI, Math.PI * 2); g.fill(); g.fillRect(front ? -.5 : -3.8, -20.6, front ? 4.8 : 1, 1.2); outline(g, .3); }
  if (type === 'elite') { g.fillStyle = '#1F2226'; g.beginPath(); g.ellipse(0, -21.6, 4.9, 1.3, 0, 0, Math.PI * 2); g.fill(); g.fillRect(-2.9, -28.4, 5.8, 6.8); g.fillStyle = '#6E2A2A'; g.fillRect(-2.9, -23.4, 5.8, 1); }
  if (type === 'nino' && vi === 1) { g.fillStyle = '#E0A030'; g.beginPath(); g.arc(0, -20.4, 3.8, Math.PI, Math.PI * 2); g.fill(); }
  g.restore();
}

// Hoja con todas las figuras: clave `${tipo}_${variante}_${frente}_${paso}`.
let HOJA = null;
export function hornearPersonas() {
  if (HOJA) return HOJA;
  const E = 4, w = 18, h = 32, W = w * E, H = h * E, marcos = {}, claves = [];
  for (const tipo in TIPOS) for (let vi = 0; vi < 3; vi++) for (const fr of [1, 0]) for (let f = 0; f < 4; f++) claves.push([`${tipo}_${vi}_${fr}_${f}`, tipo, vi, fr, f]);
  const cols = 24, cv = lienzo(cols * W, Math.ceil(claves.length / cols) * H + H), g = cv.getContext('2d');
  claves.forEach(([k, tipo, vi, fr, f], n) => {
    const x = (n % cols) * W, y = Math.floor(n / cols) * H;
    marcos[k] = { x, y, w: W, h: H, ax: w / 2 * E, ay: (h - 3) * E };
    g.save(); g.translate(x + w / 2 * E, y + (h - 3) * E); g.scale(E, E); persona(g, tipo, vi, !!fr, f); g.restore();
  });
  // Luz de ventana para la noche.
  const y = Math.ceil(claves.length / cols) * H, gr = g.createRadialGradient(24, y + 24, 0, 24, y + 24, 24);
  gr.addColorStop(0, 'rgba(255,226,150,1)'); gr.addColorStop(.25, 'rgba(255,216,138,.8)'); gr.addColorStop(1, 'rgba(255,216,138,0)');
  g.fillStyle = gr; g.fillRect(0, y, 48, 48);
  marcos.luz = { x: 0, y, w: 48, h: 48, ax: 24, ay: 24 };
  return (HOJA = { canvas: cv, marcos, escala: E });
}
