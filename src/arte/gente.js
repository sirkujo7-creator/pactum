// Pobladores del Tolima (renovación colonial, 6 de octubre). Pedido de Juan: silueta limpia y animación suave.
// Estilo plano como los retratos (Reigns): color liso con una sola sombra de borde nítido a la derecha (la luz viene
// de la izquierda), sin contornos ni degradados, y cara mínima. Ropa del campo tolimense: sombrero aguadeño y ruana
// del campesino, falda larga y pañolón de la campesina, delantal de cuero del artesano, levita y sombrero de la élite;
// ropa moderna (jean, camiseta, gorra) en las épocas del ladrillo y el concreto. Doce cuadros al caminar (antes
// ocho): cada cuadro es el mismo dibujo en otro momento del paso, con los mismos colores, para que no salte.
import { shade, lienzo, contorno, RES_HOJA, ES_CELULAR } from './fresco.js';
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
export function figura(g, tipo, vi, frente, paso, mod = false, acc = null) {
  const pz = acc ? poseAccion(acc.k, acc.n, acc.N) : null; // acción de oficio: sembrar, picar, vender…
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
  g.save(); if (pz) { g.translate(0, -(pz.lift || 0)); g.translate(0, -11); g.rotate(pz.lean || 0); g.translate(0, 11); } // el cuerpo se inclina desde la cadera
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
  if (pz) brazosAccion(g, pz, manga, piel); else { brazo(-sw, -1); brazo(sw, 1); }
  if (tipo === 'elite' && !mod && !pz) { g.strokeStyle = '#4A3424'; g.lineWidth = .55; g.beginPath(); g.moveTo(3 + sw * .8, -12.2); g.lineTo(3.8 + sw * .4, -.3); g.stroke(); elipse(g, 3 + sw * .8, -12.6, .45, .4, '#C9A24A'); } // bastón
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
  g.restore(); // inclinación
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

// ---------- Acciones de oficio (pedido de Juan, 9 de octubre: más animación y detalle en cada habitante) ----------
// Cada acción es un ciclo de cuadros con la herramienta dibujada en la mano. Se hornean aparte (hoja «acciones»), solo
// con la ropa de la época actual, y de frente (la figura se voltea de lado a lado con el espejo).
export const ACCIONES = {
  campesino: { sembrar: 8, cosechar: 6, cargar: 8, vender: 6, picar: 6, saludar: 6, conversar: 8, rezar: 4 },
  campesina: { cosechar: 6, cargar: 8, vender: 6, barrer: 6, saludar: 6, conversar: 8, rezar: 4 },
  artesano: { martillar: 6, picar: 6, aserrar: 6, cargar: 8, vender: 6, saludar: 6, conversar: 8, rezar: 4 },
  elite: { leer: 4, saludar: 6, conversar: 8, rezar: 4 },
  nino: { saltar: 6, saludar: 6, leer: 4, conversar: 8 }
};
const T2 = Math.PI * 2;
// Postura de cada acción en el momento n de N: inclinación del cuerpo, posición de las manos y la herramienta.
function poseAccion(k, n, N) {
  const t = n / N, s = Math.sin(t * T2), c = Math.cos(t * T2), u = (1 - c) / 2, u2 = (1 - Math.cos(t * T2 + 1.3)) / 2;
  switch (k) {
    case 'sembrar': return { lean: .08 + u * .5, L: [1.2 + u * 3, -24.4 + u * 15], R: [3 + u * 3.4, -23.2 + u * 14], prop: { k: 'azadon', off: [(1 - u) * -4.5 + u * 4.2, (1 - u) * -9.5 + u * 11.6] } };
    case 'cosechar': return { lean: -.04, L: [-2.6, -27 + u * 15], R: [2.8, -26 + u2 * 14], prop: { k: 'canasto' } };
    case 'cargar': return { lean: .1, L: [-1.2, -26.4], R: [2.6, -25.2], prop: { k: 'saco' } };
    case 'vender': return { lean: 0, L: [-4.2 + s * .5, -15.8 + c * .9], R: [4.6 + c * .6, -17.6 + s * 1.6], prop: { k: 'fruta' } };
    case 'martillar': { const v = u * u; return { lean: .12 + v * .15, L: [-.5, -13.6], R: [3 + v * 2.6, -26.5 + v * 14.5], prop: { k: 'martillo', off: [3.6 - v * 1.4, -1.8 + v * 7] } }; }
    case 'picar': return { lean: .15 + u * .35, L: [.4 + u * 3, -27 + u * 15], R: [2.8 + u * 3.2, -26 + u * 14.4], prop: { k: 'pico', off: [(1 - u) * -5 + u * 5.6, (1 - u) * -8 + u * 9.5] } };
    case 'aserrar': return { lean: .1, L: [1.6 + s * 2.3, -14.6], R: [3 + s * 2.3, -15.8], prop: { k: 'sierra' } };
    case 'barrer': return { lean: .1, L: [1 + s * 2.2, -13.6], R: [2.6 + s * 2.2, -16.4], prop: { k: 'escoba' } };
    case 'rezar': return { lean: .12 + s * .015, L: [-.7, -17.2], R: [.7, -17.6], prop: null };
    case 'leer': return { lean: .04, L: [-2.2, -15.8], R: [2.2, -15.6], prop: { k: 'libro', pag: n % 2 } };
    case 'saludar': return { lean: 0, L: [-3.4, -12.6], R: [5 + s * 1.3, -26.2 + c * .8], prop: null };
    case 'conversar': return { lean: 0, L: [-4.6 + s * 2.2, -15.8 - u * 3], R: [4.4 + c * 1.5, -16.4 + s * 1.8], prop: null };
    case 'saltar': { const a = Math.abs(s); return { lean: 0, lift: a * 3.2, L: [-4.4, -26 + a * 1.2], R: [4.4, -26 + a * 1.2], prop: null }; }
  }
  return { lean: 0, L: [-3, -12.8], R: [3, -12.8], prop: null };
}
const MADERA = '#6B4A2B', ACERO = '#7A7F86';
function linea(g, a, b, w, col) { g.lineCap = 'round'; g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); }
// Herramientas y cosas en la mano. R es la mano de adelante.
const PROPS = {
  azadon(g, pz) { const R = pz.R, e = [R[0] + pz.prop.off[0], R[1] + pz.prop.off[1]]; linea(g, [R[0] - .6, R[1] - .6], e, 1, MADERA); const d = [e[0] - R[0], e[1] - R[1]], l = Math.hypot(...d) || 1, nx = -d[1] / l, ny = d[0] / l; forma(g, [[e[0] + nx * 2.3, e[1] + ny * 2.3], [e[0] - nx * 2.3, e[1] - ny * 2.3], [e[0] - nx * 2 + d[0] / l * 1.8, e[1] - ny * 2 + d[1] / l * 1.8], [e[0] + nx * 2 + d[0] / l * 1.8, e[1] + ny * 2 + d[1] / l * 1.8]], ACERO, false); },
  pico(g, pz) { const R = pz.R, e = [R[0] + pz.prop.off[0], R[1] + pz.prop.off[1]]; linea(g, [R[0] - .6, R[1] - .6], e, 1.1, MADERA); const d = [e[0] - R[0], e[1] - R[1]], l = Math.hypot(...d) || 1, nx = -d[1] / l, ny = d[0] / l; linea(g, [e[0] + nx * 3.6, e[1] + ny * 3.6], [e[0] - nx * 3.6, e[1] - ny * 3.6], 1.3, '#6E737A'); linea(g, [e[0] + nx * 3.6, e[1] + ny * 3.6], [e[0] + nx * 3.6 + d[0] / l * 1.4, e[1] + ny * 3.6 + d[1] / l * 1.4], 1.1, '#5A5F66'); },
  martillo(g, pz) { const R = pz.R, e = [R[0] + pz.prop.off[0], R[1] + pz.prop.off[1]]; linea(g, [R[0] - .5, R[1] - .4], e, 1, MADERA); const d = [e[0] - R[0], e[1] - R[1]], l = Math.hypot(...d) || 1, nx = -d[1] / l, ny = d[0] / l; forma(g, [[e[0] + nx * 1.7 - d[0] / l, e[1] + ny * 1.7 - d[1] / l], [e[0] - nx * 1.7 - d[0] / l, e[1] - ny * 1.7 - d[1] / l], [e[0] - nx * 1.7 + d[0] / l * 1.2, e[1] - ny * 1.7 + d[1] / l * 1.2], [e[0] + nx * 1.7 + d[0] / l * 1.2, e[1] + ny * 1.7 + d[1] / l * 1.2]], '#55595E', false); },
  sierra(g, pz) { const R = pz.R; forma(g, [[R[0] + 1, R[1] - .6], [R[0] + 11, R[1] + 1.2], [R[0] + 11, R[1] + 3], [R[0] + 1, R[1] + 1.2]], '#C4C9CF', false); g.fillStyle = '#6E737A'; for (let k = 0; k < 7; k++) g.fillRect(R[0] + 1.6 + k * 1.4, R[1] + 1.4 + k * .17, .6, .8); elipse(g, R[0], R[1] + .2, 1.1, 1.3, MADERA); },
  escoba(g, pz) { const R = pz.R, base = [R[0] + 4.4, -.8]; linea(g, [R[0] - .6, R[1] - 7], base, .9, MADERA); forma(g, [[base[0] - 1.1, base[1] - 4.4], [base[0] + 1.1, base[1] - 4.4], [base[0] + 3.2, base[1] + .6], [base[0] - 3.2, base[1] + .6]], '#C9A44A', false); },
  libro(g, pz) { const m = [(pz.L[0] + pz.R[0]) / 2, (pz.L[1] + pz.R[1]) / 2 - 1.2], a = pz.prop.pag; forma(g, [[m[0] - 4.2, m[1] - 2.6], [m[0], m[1] - 2 + a * .4], [m[0], m[1] + 2.6], [m[0] - 4.2, m[1] + 2]], '#F6F0E0', false); forma(g, [[m[0], m[1] - 2 + a * .4], [m[0] + 4.2, m[1] - 2.6], [m[0] + 4.2, m[1] + 2], [m[0], m[1] + 2.6]], '#E9DFC6', false); g.strokeStyle = 'rgba(60,40,30,.5)'; g.lineWidth = .25; for (const dy of [-1, .2, 1.4]) { g.beginPath(); g.moveTo(m[0] - 3.4, m[1] + dy - .4); g.lineTo(m[0] - .6, m[1] + dy); g.moveTo(m[0] + .6, m[1] + dy); g.lineTo(m[0] + 3.4, m[1] + dy - .4); g.stroke(); } },
  fruta(g, pz) { elipse(g, pz.R[0] + .3, pz.R[1] - 1.4, 1.2, 1.2, '#D9622B'); elipse(g, pz.R[0] + 1.1, pz.R[1] - 2.4, .6, .35, '#4E7A3A'); },
  canasto(g) { elipse(g, -4.6, -9.6, 2.6, 1.7, '#B58A4E'); g.fillStyle = '#B58A4E'; g.beginPath(); g.moveTo(-7.2, -9.6); g.lineTo(-6.2, -6.4); g.lineTo(-3, -6.4); g.lineTo(-2, -9.6); g.fill(); for (const [x, y] of [[-5.6, -10.6], [-4.4, -11], [-3.2, -10.5], [-5, -9.9]]) elipse(g, x, y, .7, .7, '#B32B2B'); },
  saco(g) { g.save(); g.translate(.6, -27.4); g.rotate(-.35); g.fillStyle = '#C9B48A'; g.beginPath(); g.ellipse(0, 0, 4.6, 2.9, 0, 0, 7); g.fill(); g.fillStyle = 'rgba(80,55,30,.25)'; g.beginPath(); g.ellipse(1.6, .6, 3, 1.8, 0, 0, 7); g.fill(); g.strokeStyle = '#8A6A3A'; g.lineWidth = .4; g.beginPath(); g.moveTo(-4, -.2); g.lineTo(-5.4, -.6); g.stroke(); g.restore(); }
};
function brazosAccion(g, pz, manga, piel) {
  const brazo = (lado, h) => { const a = [lado * 2.6, -19.8], m = [(a[0] + h[0]) / 2 + lado * .9, (a[1] + h[1]) / 2 + .8]; miembro(g, a, m, h, 1.4, manga); };
  brazo(-1, pz.L);
  if (pz.prop && pz.prop.k === 'canasto') PROPS.canasto(g, pz);
  brazo(1, pz.R);
  if (pz.prop && PROPS[pz.prop.k] && pz.prop.k !== 'canasto') PROPS[pz.prop.k](g, pz);
  for (const h of [pz.L, pz.R]) elipse(g, h[0], h[1] + .4, .78, .82, piel);
}

// Hoja de acciones: se hornea con la ropa de la época (mod) y se vuelve a pintar sobre el mismo lienzo si cambia.
let HOJA_A = null;
export function hornearAcciones(mod) {
  const E = ES_CELULAR ? 2 : 3, w = 22, h = 34, W = w * E, H = h * E, claves = []; // en celular, a menor resolución (cuida la memoria)
  for (const tipo in ACCIONES) for (let vi = 0; vi < 3; vi++) for (const [acc, N] of Object.entries(ACCIONES[tipo])) for (let n = 0; n < N; n++) claves.push([`${tipo}_${vi}_${acc}_${n}`, tipo, vi, acc, n, N]);
  if (!HOJA_A) {
    const cols = Math.floor(2048 / W), filas = Math.ceil(claves.length / cols), marcos = {};
    claves.forEach(([k], i) => { marcos[k] = { x: (i % cols) * W, y: Math.floor(i / cols) * H, w: W, h: H, ax: w / 2 * E, ay: (h - 3) * E }; });
    let alto = 256; while (alto < filas * H) alto *= 2;
    HOJA_A = { canvas: lienzo(2048, alto), marcos, escala: E, mod: null };
  } else if (HOJA_A.mod === mod) return HOJA_A;
  const g = HOJA_A.canvas.getContext('2d'); g.clearRect(0, 0, HOJA_A.canvas.width, HOJA_A.canvas.height);
  for (const [k, tipo, vi, acc, n, N] of claves) { const m = HOJA_A.marcos[k]; g.save(); g.beginPath(); g.rect(m.x, m.y, m.w, m.h); g.clip(); g.translate(m.x + m.ax, m.y + m.ay); g.scale(E, E); figura(g, tipo, vi, true, acc === 'cargar' ? PASOS12[Math.floor(n * 12 / N)] : 0, !!mod, { k: acc, n, N }); g.restore(); }
  HOJA_A.mod = mod; return HOJA_A;
}
export { contorno };

