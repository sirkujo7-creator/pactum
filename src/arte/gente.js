// Pobladores al fresco (fase 8): proporciones de figura clásica (cabeza pequeña, cuerpo esbelto), ropa en dos tonos
// con pliegues, contorno siena y sin caras de caricatura. Conservan su identidad del Tolima: aguadeño y ruana del
// campesino, pañoleta de la campesina, gorro del artesano y manto de la élite. Cuatro pasos al caminar, de frente y
// de espaldas, tres variantes de color y ropa moderna para las épocas del ladrillo y el concreto.
import { FR, mulberry, shade, lienzo, pintar, contorno, ovalo } from './fresco.js';

export const TIPOS_GENTE = {
  campesino: [[FR.bermellon, FR.ocre], [FR.azul, FR.ocreClaro], [FR.sienaClara, FR.rojo]],
  campesina: [[FR.rojo], [FR.azul], [FR.ocre]],
  artesano: [[FR.ocreRojo], [FR.verde], [FR.azul]],
  elite: [[FR.violeta], [FR.rojo], [FR.verdeOsc]],
  nino: [[FR.ocre], [FR.tierraVerde], [FR.bermellon]]
};

function pierna(g, x0, y0, x1, y1, w, col) { g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); }
// Pliegues: líneas finas oscuras y una clara, como en los paños de los frescos.
function pliegues(g, xs, y0, y1, col) {
  g.save(); g.lineCap = 'round';
  xs.forEach((x, i) => { g.globalAlpha = .45; g.strokeStyle = shade(col, -.35); g.lineWidth = .45; g.beginPath(); g.moveTo(x, y0); g.quadraticCurveTo(x + (i % 2 ? .4 : -.4), (y0 + y1) / 2, x + (i % 2 ? .2 : -.3), y1); g.stroke(); });
  g.globalAlpha = .5; g.strokeStyle = shade(col, .35); g.lineWidth = .5; g.beginPath(); g.moveTo(xs[0] - .8, y0 + .5); g.lineTo(xs[0] - 1, y1 - .5); g.stroke();
  g.restore();
}

// Dibuja una figura con los pies en (0, 0). frente: true de frente, false de espaldas. paso: 0 a 3. mod: ropa moderna.
export function figura(g, tipo, vi, frente, paso, mod = false) {
  const rng = mulberry(tipo.length * 31 + vi * 7 + paso * 3 + (frente ? 1 : 0)), V = TIPOS_GENTE[tipo][vi], piel = FR.piel[vi % 3];
  const ph = paso / 4 * Math.PI * 2, sw = Math.sin(ph), alza = Math.abs(Math.sin(ph)) * .5;
  const nino = tipo === 'nino', E = nino ? .74 : 1;
  // Sombra en el suelo.
  g.save(); g.globalAlpha = .22; g.fillStyle = '#3A2A1C'; g.beginPath(); g.ellipse(.8, 0, 4.2 * E, 1.4 * E, 0, 0, Math.PI * 2); g.fill(); g.restore();
  g.save(); g.scale(E, E); g.translate(0, -alza);
  const vestido = (tipo === 'campesina') && !mod;
  const ropaPierna = mod ? '#3F5872' : { campesino: FR.cal, campesina: FR.cal, artesano: shade(FR.siena, .25), elite: shade(V[0], -.3), nino: FR.cal }[tipo];
  // Piernas (solo se ven bajo la túnica).
  const li = -1.1 + sw * 1.5, ld = 1.1 - sw * 1.5;
  if (!vestido) { pierna(g, -.9, -10, li, -.5, 1.6, ropaPierna); pierna(g, .9, -10, ld, -.5, 1.6, ropaPierna); }
  g.fillStyle = tipo === 'elite' ? FR.carbon : FR.sienaClara;
  [li, ld].forEach(x => { g.beginPath(); g.ellipse(x + .3, -.3, 1.2, .6, 0, 0, Math.PI * 2); g.fill(); });
  // Túnica o vestido.
  const cuerpo = mod ? (tipo === 'elite' ? '#3A3A44' : V[0]) : { campesino: FR.cal, campesina: V[0], artesano: V[0], elite: FR.cal, nino: V[0] }[tipo];
  const ruedo = vestido ? -1.6 : (tipo === 'elite' && !mod ? -4 : -9.8), anch = vestido ? 3.9 : 3.1, vaiven = sw * .6;
  const tunica = [[-2.5, -20.6], [2.5, -20.6], [anch + vaiven * .3, ruedo], [0, ruedo + .5], [-anch + vaiven * .3, ruedo]];
  pintar(g, tunica, cuerpo, rng, { n: 3, al: .14, bw: .5 });
  pliegues(g, [-1, .3, 1.4], -18, ruedo - .3, cuerpo);
  // Ruana del campesino (de dos colores, con franjas), delantal del artesano, manto de la élite.
  if (tipo === 'campesino' && !mod) {
    const ruana = [[-2.8, -21], [2.8, -21], [4.4, -14.2], [0, -12.6], [-4.4, -14.2]];
    pintar(g, ruana, V[0], rng, { n: 3, bw: .5 });
    g.save(); g.globalAlpha = .9; g.strokeStyle = V[1]; g.lineWidth = .55; g.beginPath(); g.moveTo(-4, -14.6); g.lineTo(0, -13.1); g.lineTo(4, -14.6); g.stroke(); g.restore();
  }
  if (tipo === 'artesano' && frente && !mod) pintar(g, [[-1.8, -18.4], [1.8, -18.4], [2.2, -10.6], [-2.2, -10.6]], FR.ocreClaro, rng, { n: 2, bw: .45 });
  if (tipo === 'elite' && !mod) {
    // Manto terciado sobre el hombro, a la manera del himation.
    const manto = frente ? [[-2.6, -20.8], [.6, -20.8], [3.4, -9], [2.2, -4.2], [-3.4, -5], [-3, -13]] : [[-.6, -20.8], [2.6, -20.8], [3.2, -12], [3.4, -5], [-2.2, -4.2], [-3.4, -9]];
    pintar(g, manto, V[0], rng, { n: 3, bw: .55 });
    pliegues(g, frente ? [-1.4, 0, 1.4] : [1.4, 0, -1.4], -17, -6, V[0]);
  }
  if (mod && tipo === 'elite' && frente) { g.fillStyle = FR.cal; g.beginPath(); g.moveTo(-.8, -20.6); g.lineTo(.8, -20.6); g.lineTo(0, -17.6); g.fill(); }
  // Brazos con su manga y la mano.
  const manga = tipo === 'campesino' && !mod ? V[0] : tipo === 'elite' && !mod ? FR.cal : cuerpo;
  const bi = [-3.1 + sw * 1.2, -12.6], bd = [3.1 - sw * 1.2, -12.6];
  pierna(g, -2.5, -19.8, bi[0], bi[1], 1.45, manga); pierna(g, 2.5, -19.8, bd[0], bd[1], 1.45, manga);
  g.fillStyle = piel; g.beginPath(); g.arc(bi[0], bi[1] + .4, .75, 0, Math.PI * 2); g.arc(bd[0], bd[1] + .4, .75, 0, Math.PI * 2); g.fill();
  if (tipo === 'elite' && !mod) { g.save(); g.strokeStyle = FR.siena; g.lineWidth = .55; g.beginPath(); g.moveTo(bd[0], bd[1] + .3); g.lineTo(bd[0] + 1.2, -.2); g.stroke(); g.restore(); }
  // Cuello y cabeza (sin caras de caricatura: la luz viene de arriba a la izquierda).
  g.fillStyle = piel; g.fillRect(-.6, -22, 1.2, 1.6);
  ovalo(g, 0, -23.6, 1.95, 2.25, piel, rng, { n: 2, al: .1, bw: .45, bal: .6, j: .03 });
  g.save(); g.globalAlpha = .22; g.fillStyle = FR.siena; g.beginPath(); g.ellipse(.9, -23.3, 1, 1.9, 0, 0, Math.PI * 2); g.fill(); g.restore();
  const pelo = vi === 2 ? '#4A2E1E' : FR.carbon;
  g.fillStyle = pelo;
  if (frente) { g.beginPath(); g.ellipse(0, -24.6, 2.05, 1.35, 0, Math.PI, Math.PI * 2); g.fill(); }
  else { g.beginPath(); g.ellipse(0, -23.8, 2.05, 2.1, 0, 0, Math.PI * 2); g.fill(); if (tipo === 'campesina' || tipo === 'elite') { g.beginPath(); g.ellipse(0, -21.8, 1, 1.2, 0, 0, Math.PI * 2); g.fill(); } }
  // Sombreros y tocados.
  if (tipo === 'campesino' && !mod) {
    ovalo(g, 0, -25.7, 4.1, 1.05, FR.cal, rng, { n: 2, bw: .45, j: .02 });
    pintar(g, [[-1.9, -25.9], [1.9, -25.9], [1.6, -28.2], [-1.6, -28.2]], FR.cal, rng, { n: 1, bw: .45 });
    g.fillStyle = FR.carbon; g.fillRect(-1.9, -26.9, 3.8, .75);
  }
  if (tipo === 'campesina' && !mod) pintar(g, [[-2.2, -24.2], [-1.6, -26], [1.6, -26], [2.2, -24.2], [2.3, -22.8], [-2.3, -22.8]], V[0] === FR.rojo ? FR.ocre : FR.rojo, rng, { n: 1, bw: .45 });
  if (tipo === 'artesano' && !mod) pintar(g, [[-2, -25], [2, -25], [.3, -28.6]], shade(FR.siena, .15), rng, { n: 1, bw: .45 }); // gorro de fieltro (el pilos de los artesanos griegos)
  if (mod && (tipo === 'campesino' || tipo === 'artesano')) { pintar(g, [[-2.1, -25], [2.1, -25], [1.8, -26.6], [-1.8, -26.6]], tipo === 'campesino' ? FR.rojo : FR.azul, rng, { n: 1, bw: .4 }); if (frente) { g.fillStyle = shade(tipo === 'campesino' ? FR.rojo : FR.azul, -.2); g.fillRect(-.4, -25.2, 3.2, .7); } }
  if (tipo === 'elite' && !mod) { g.save(); g.strokeStyle = FR.verde; g.lineWidth = .7; g.globalAlpha = .9; g.beginPath(); g.arc(0, -24.4, 2.15, Math.PI * 1.05, Math.PI * 1.95); g.stroke(); g.restore(); } // corona de laurel
  g.restore();
}

// Hoja con todas las figuras, con las mismas claves que la anterior: `${tipo}${M?}_${variante}_${frente}_${paso}`.
let HOJA = null;
export function hornearGente() {
  if (HOJA) return HOJA;
  const E = 4, w = 18, h = 34, W = w * E, H = h * E, marcos = {}, claves = [];
  for (const mod of ['', 'M']) for (const tipo in TIPOS_GENTE) for (let vi = 0; vi < 3; vi++) for (const fr of [1, 0]) for (let f = 0; f < 4; f++) claves.push([`${tipo}${mod}_${vi}_${fr}_${f}`, tipo, vi, fr, f, !!mod]);
  const cols = 24, cv = lienzo(cols * W, Math.ceil(claves.length / cols) * H + H), g = cv.getContext('2d');
  claves.forEach(([k, tipo, vi, fr, f, mod], n) => {
    const x = (n % cols) * W, y = Math.floor(n / cols) * H;
    marcos[k] = { x, y, w: W, h: H, ax: w / 2 * E, ay: (h - 3) * E };
    g.save(); g.translate(x + w / 2 * E, y + (h - 3) * E); g.scale(E, E); figura(g, tipo, vi, !!fr, f, mod); g.restore();
  });
  const y = Math.ceil(claves.length / cols) * H, gr = g.createRadialGradient(24, y + 24, 0, 24, y + 24, 24);
  gr.addColorStop(0, 'rgba(255,226,150,1)'); gr.addColorStop(.25, 'rgba(255,216,138,.8)'); gr.addColorStop(1, 'rgba(255,216,138,0)');
  g.fillStyle = gr; g.fillRect(0, y, 48, 48);
  marcos.luz = { x: 0, y, w: 48, h: 48, ax: 24, ay: 24 };
  return (HOJA = { canvas: cv, marcos, escala: E });
}
export { contorno };
