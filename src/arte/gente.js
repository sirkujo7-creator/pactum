// Pobladores del Tolima (renovación colonial, 6 de octubre). Pedido de Juan: silueta limpia y animación suave.
// Estilo plano como los retratos (Reigns): color liso con una sola sombra de borde nítido a la derecha (la luz viene
// de la izquierda), sin contornos ni degradados, y cara mínima. Ropa del campo tolimense: sombrero aguadeño y ruana
// del campesino, falda larga y pañolón de la campesina, delantal de cuero del artesano, levita y sombrero de la élite;
// ropa moderna (jean, camiseta, gorra) en las épocas del ladrillo y el concreto. Doce cuadros al caminar (antes
// ocho): cada cuadro es el mismo dibujo en otro momento del paso, con los mismos colores, para que no salte.
import { shade, lienzo, contorno, RES_HOJA } from './fresco.js';
import { sombraSuave } from './plano.js';

export const TIPOS_GENTE = {
  campesino: [['#8E3B2A', '#D9B54A'], ['#3F5E7A', '#C9A24A'], ['#5B4636', '#B84A3A']],
  campesina: [['#B23A2E'], ['#2F6E8E'], ['#C08A2A']],
  artesano: [['#5C7C9A'], ['#7A5C8A'], ['#4E7A5A']],
  elite: [['#2E3440'], ['#4A3B2E'], ['#3A4A40']],
  nino: [['#E0A030'], ['#3E8E7E'], ['#D0604A']]
};
const PIEL = ['#C98E62', '#E0B08A', '#A8734C'];

// Figura plana: color liso y la sombra de la derecha con borde nítido (sin contorno).
function forma(g, pts, col, curva = true) {
  g.beginPath(); g.moveTo(...pts[0]);
  if (curva) { for (let k = 1; k < pts.length; k++) { const p = pts[k], q = pts[(k + 1) % pts.length]; g.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2); } }
  else pts.slice(1).forEach(p => g.lineTo(...p));
  g.closePath(); g.fillStyle = col; g.fill();
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]), x0 = Math.min(...xs), x1 = Math.max(...xs);
  g.save(); g.clip(); g.fillStyle = shade(col, -.2); g.fillRect(x0 + (x1 - x0) * .62, Math.min(...ys) - 1, x1 - x0, Math.max(...ys) - Math.min(...ys) + 2); g.restore();
}
// Miembro (pierna o brazo) con codo o rodilla: de a a b pasando por m; grueso w; liso, sin contorno.
function miembro(g, a, m, b, w, col) {
  g.lineCap = 'round'; g.lineJoin = 'round';
  g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(...a); g.quadraticCurveTo(...m, ...b); g.stroke();
}
const elipse = (g, x, y, rx, ry, col, rot = 0) => { g.fillStyle = col; g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, 7); g.fill(); };

// Momento del paso de cada cuadro (de 0 a 1). Los cuadros 0 a 3 son los cuatro tiempos de antes (0, ¼, ½ y ¾), así
// las escenas que los usan siguen igual; del 4 al 11 son los tiempos intermedios.
const FASE = [0, 3, 6, 9, 1, 2, 4, 5, 7, 8, 10, 11].map(k => k / 12);
// Orden de los doce cuadros al caminar.
export const PASOS12 = [0, 4, 5, 1, 6, 7, 2, 8, 9, 3, 10, 11];
// Dibuja una figura con los pies en (0, 0). frente: true de frente, false de espaldas. paso: 0 a 11. mod: ropa moderna.
export function figura(g, tipo, vi, frente, paso, mod = false) {
  const V = TIPOS_GENTE[tipo][vi], piel = PIEL[vi % 3];
  const ph = FASE[paso] * Math.PI * 2, sw = Math.sin(ph), alza = Math.abs(sw) * .35;
  const nino = tipo === 'nino', E = nino ? .72 : 1, dir = frente ? 1 : -1;
  // Sombra suave en el suelo, del mismo sol que la de árboles y animales.
  sombraSuave(g, 3.8 * E, 0, 3.8 * E, .28);
  g.save(); g.scale(E, E); g.translate(0, -alza);
  const falda = tipo === 'campesina' && !mod;
  const pantalon = mod ? (tipo === 'elite' ? '#3A3A44' : '#3F5872') : { campesino: '#EFE8D8', campesina: '#EFE8D8', artesano: '#5A4A3C', elite: '#2E2E34', nino: '#4A5A70' }[tipo];
  const zapato = tipo === 'elite' || mod ? '#2A2420' : '#C9B48A'; // alpargatas de fique en el campo
  // Piernas: la que avanza se levanta y dobla la rodilla.
  const pie = s => { const lev = Math.max(0, s) * 1.5; return { x: s * .55, y: -lev, rod: [s * .9 + .2, -6 - lev * .6] }; };
  const P1 = pie(sw), P2 = pie(-sw);
  const caderas = [[-1, -11.2, P1], [1, -11.2, P2]];
  // La pierna de atrás primero.
  const orden = sw >= 0 ? [1, 0] : [0, 1];
  for (const i of orden) {
    const [hx, hy, Pp] = caderas[i], x = hx + Pp.x;
    if (!falda) miembro(g, [hx, hy], [hx + Pp.rod[0] * .5, Pp.rod[1]], [x, Pp.y - .8], 1.75, i === orden[0] ? shade(pantalon, -.18) : pantalon); // la de atrás, en sombra
    elipse(g, x + .5 * dir, Pp.y - .4, 1.25, .65, zapato);
  }
  // Torso: camisa, blusa, chaleco o camiseta.
  const camisa = mod ? (tipo === 'elite' ? '#ECE8E0' : V[0]) : { campesino: '#F4EFE4', campesina: '#F6F1E6', artesano: '#E8DCC4', elite: V[0], nino: V[0] }[tipo];
  const torso = [[-2.6, -20.6], [0, -21.2], [2.6, -20.6], [2.4, -15.5], [2.2, -11], [0, -10.6], [-2.2, -11], [-2.4, -15.5]];
  forma(g, torso, camisa);
  if (falda) {
    const v = sw * .5;
    forma(g, [[-2.3, -13.2], [2.3, -13.2], [3.6 + v * .3, -6], [4.2 + v, -1.2], [0, -.6], [-4.2 + v, -1.2], [-3.6 + v * .3, -6]], V[0]);
    g.save(); g.globalAlpha = .45; g.strokeStyle = shade(V[0], -.35); g.lineWidth = .4; for (const x of [-1.8, 0, 1.8]) { g.beginPath(); g.moveTo(x * .6, -12.5); g.quadraticCurveTo(x + v * .5, -6, x * 1.25 + v, -1.3); g.stroke(); } g.restore();
    g.save(); g.globalAlpha = .9; g.strokeStyle = shade(V[0], .35); g.lineWidth = .5; g.beginPath(); g.moveTo(-4 + v, -2.2); g.quadraticCurveTo(0, -1.6, 4 + v, -2.2); g.stroke(); g.restore(); // vuelo de la falda
  }
  // Prendas encima.
  if (tipo === 'campesino' && !mod) {
    // Ruana de lana en dos colores, con franjas al ruedo.
    forma(g, [[-2.9, -21], [0, -21.6], [2.9, -21], [4.4, -15.6], [4.6, -14], [0, -12.4], [-4.6, -14], [-4.4, -15.6]], V[0]);
    g.save(); g.strokeStyle = V[1]; g.lineWidth = .5; g.globalAlpha = .9; for (const y of [-14.3, -15.2]) { g.beginPath(); g.moveTo(-4.3, y); g.quadraticCurveTo(0, y + 1.6, 4.3, y); g.stroke(); } g.restore();
  }
  if (tipo === 'campesina' && !mod) forma(g, [[-2.9, -20.8], [0, -21.4], [2.9, -20.8], [3.2, -18.4], [0, -17.4], [-3.2, -18.4]], V[0] === '#B23A2E' ? '#E7C76B' : '#B23A2E'); // pañolón sobre los hombros
  if (tipo === 'artesano' && !mod && frente) forma(g, [[-1.9, -19], [1.9, -19], [2.3, -10.4], [-2.3, -10.4]], '#8A6A48', false); // delantal de cuero
  if (tipo === 'artesano' && !mod) { forma(g, [[-2.6, -20.6], [-1.2, -21], [-1, -12], [-2.3, -11.4]], V[0], false); forma(g, [[2.6, -20.6], [1.2, -21], [1, -12], [2.3, -11.4]], V[0], false); } // chaleco
  if (tipo === 'elite' && !mod) {
    // Levita con faldones; camisa blanca y corbatín.
    forma(g, [[-2.8, -20.8], [-.8, -21], [-.6, -12], [-1.6, -6.8], [-3, -7.2], [-2.6, -14]], V[0], false);
    forma(g, [[2.8, -20.8], [.8, -21], [.6, -12], [1.6, -6.8], [3, -7.2], [2.6, -14]], V[0], false);
    if (frente) { elipse(g, 0, -19.6, .7, 1.4, '#F4F1E8'); elipse(g, 0, -20.4, .9, .35, '#7A1E1E'); }
  }
  if (mod && tipo === 'elite' && frente) { forma(g, [[-.7, -20.6], [.7, -20.6], [.3, -15], [-.3, -15]], '#6E2A2A', false); }
  // Brazos: van al contrario de las piernas; la mano en color piel.
  const manga = tipo === 'campesino' && !mod ? V[0] : tipo === 'elite' && !mod ? V[0] : camisa;
  const brazo = (s, lado) => { const a = [lado * 2.6, -19.8], h = [lado * 3 + s * .8, -12.8 + Math.abs(s) * .3], m = [lado * 3.2 + s * .3, -16.4]; miembro(g, a, m, h, 1.4, manga); elipse(g, h[0], h[1] + .45, .75, .8, piel); };
  brazo(-sw, -1); brazo(sw, 1);
  if (tipo === 'elite' && !mod) { g.strokeStyle = '#4A3424'; g.lineWidth = .55; g.beginPath(); g.moveTo(3 + sw * .8, -12.2); g.lineTo(3.8 + sw * .4, -.3); g.stroke(); elipse(g, 3 + sw * .8, -12.6, .45, .4, '#C9A24A'); } // bastón
  if (tipo === 'campesino' && !mod) { g.strokeStyle = '#5A3A24'; g.lineWidth = .8; g.lineCap = 'round'; g.beginPath(); g.moveTo(-2.6, -12.2); g.quadraticCurveTo(-3.4, -10, -3.2, -8.2); g.stroke(); } // machete en su funda de cuero, al cinto
  // Cuello y cabeza en tres cuartos: la cara mira un poco a la derecha.
  elipse(g, 0, -21.4, .65, .9, shade(piel, -.1));
  g.fillStyle = piel; g.beginPath(); g.ellipse(0, -23.6, 1.9, 2.2, 0, 0, 7); g.fill();
  g.save(); g.clip(); g.fillStyle = shade(piel, -.16); g.fillRect(.7, -26, 2, 5); g.restore(); // sombra nítida de la cara
  const pelo = vi === 2 ? '#4A2E1E' : '#231C17';
  if (frente) {
    g.fillStyle = pelo; g.beginPath(); g.ellipse(-.2, -24.7, 2, 1.3, 0, Math.PI, Math.PI * 2); g.fill();
    if (tipo === 'campesina' || (tipo === 'nino' && vi === 1)) { g.beginPath(); g.ellipse(-1.8, -23.4, .6, 1.5, 0, 0, 7); g.fill(); }
    g.fillStyle = '#2A1E18'; g.beginPath(); g.arc(.15, -23.5, .26, 0, 7); g.arc(1.25, -23.5, .24, 0, 7); g.fill(); // ojos, nada más (cara mínima)
  } else {
    g.fillStyle = pelo; g.beginPath(); g.ellipse(0, -23.8, 2, 2.15, 0, 0, 7); g.fill();
    if (tipo === 'campesina') { g.beginPath(); g.ellipse(0, -21.3, .7, 1.8, 0, 0, 7); g.fill(); } // trenza
  }
  // Sombreros y tocados.
  if (tipo === 'campesino' && !mod) {
    // Sombrero aguadeño: ala ancha blanca y cinta negra.
    forma(g, [[-4.3, -25.6], [0, -26.6], [4.3, -25.6], [0, -24.5]], '#F4EFE2');
    forma(g, [[-1.9, -25.7], [-1.7, -28.1], [0, -28.6], [1.7, -28.1], [1.9, -25.7]], '#F4EFE2');
    g.fillStyle = '#231F1C'; g.fillRect(-1.85, -26.6, 3.7, .7);
  }
  if (tipo === 'campesina' && !mod) forma(g, [[-2.2, -24.3], [-1.6, -26.2], [0, -26.5], [1.6, -26.2], [2.2, -24.3], [0, -24.8]], V[0] === '#B23A2E' ? '#E7C76B' : '#B23A2E'); // pañoleta
  if (tipo === 'artesano' && !mod) { forma(g, [[-2.1, -24.8], [-1.6, -26.6], [0, -27], [1.6, -26.6], [2.1, -24.8]], '#3F4A55'); g.fillStyle = '#2E363E'; g.fillRect(frente ? 0 : -3.2, -25.1, 3.2, .6); } // gorra de paño
  if (tipo === 'elite' && !mod) { forma(g, [[-3.2, -25.5], [0, -26.1], [3.2, -25.5], [0, -24.9]], '#1F2226'); forma(g, [[-1.8, -25.6], [-1.7, -29.3], [1.7, -29.3], [1.8, -25.6]], '#1F2226', false); g.fillStyle = '#6E2A2A'; g.fillRect(-1.75, -26.6, 3.5, .6); } // sombrero de copa
  if (mod && (tipo === 'campesino' || tipo === 'artesano')) { const c = tipo === 'campesino' ? '#9C2F25' : '#2F5D8A'; forma(g, [[-2.1, -24.9], [-1.8, -26.5], [0, -26.8], [1.8, -26.5], [2.1, -24.9]], c); if (frente) { g.fillStyle = shade(c, -.2); g.fillRect(-.2, -25.2, 3.4, .6); } } // gorra
  if (nino && vi === 1 && !mod) forma(g, [[-2.2, -24.6], [0, -26.6], [2.2, -24.6]], '#E0A030'); // sombrerito
  g.restore();
}

// Hoja con todas las figuras, con las mismas claves que la anterior: `${tipo}${M?}_${variante}_${frente}_${paso}`.
let HOJA = null;
export function hornearGente() {
  if (HOJA) return HOJA;
  const E = Math.min(RES_HOJA, 3), w = 18, h = 34, W = w * E, H = h * E, marcos = {}, claves = [];
  for (const mod of ['', 'M']) for (const tipo in TIPOS_GENTE) for (let vi = 0; vi < 3; vi++) for (const fr of [1, 0]) for (let f = 0; f < 12; f++) claves.push([`${tipo}${mod}_${vi}_${fr}_${f}`, tipo, vi, fr, f, !!mod]);
  // Hoja de 2048 de ancho y hasta 2048 de alto (lados potencia de dos): la luz va en el hueco de la última fila.
  const cols = Math.floor(2048 / W), filas = Math.ceil((claves.length + 1) / cols), cv = lienzo(cols * W, filas * H), g = cv.getContext('2d');
  claves.forEach(([k, tipo, vi, fr, f, mod], n) => {
    const x = (n % cols) * W, y = Math.floor(n / cols) * H;
    marcos[k] = { x, y, w: W, h: H, ax: w / 2 * E, ay: (h - 3) * E };
    g.save(); g.translate(x + w / 2 * E, y + (h - 3) * E); g.scale(E, E); figura(g, tipo, vi, !!fr, f, mod); g.restore();
  });
  const n = claves.length, x0 = (n % cols) * W, y = Math.floor(n / cols) * H, gr = g.createRadialGradient(x0 + 24, y + 24, 0, x0 + 24, y + 24, 24);
  gr.addColorStop(0, 'rgba(255,226,150,1)'); gr.addColorStop(.25, 'rgba(255,216,138,.8)'); gr.addColorStop(1, 'rgba(255,216,138,0)');
  g.fillStyle = gr; g.fillRect(x0, y, 48, 48);
  marcos.luz = { x: x0, y, w: 48, h: 48, ax: 24, ay: 24 };
  return (HOJA = { canvas: cv, marcos, escala: E });
}
export { contorno };

