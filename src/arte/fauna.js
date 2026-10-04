// Animales, piedras y troncos al fresco (fase 9, revisión final): el mismo pincel de la gente y las plantas
// (color plano de pigmento, manchas de muro y contorno siena). Mismas claves y anclas que la naturaleza anterior.
import { FR, ovalo, pintar, contorno, sombraSuelo, mix, shade } from './fresco.js';

const pata = (g, x0, y0, x1, y1, col = FR.siena, w = .8) => { g.save(); g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); g.restore(); };
const op = { n: 1, bw: .45, bal: .75 };

// Vaca blanca orejinegra (criolla del Tolima), de pie o pastando con la cabeza baja.
function vaca(g, r, pasta) {
  sombraSuelo(g, 7, 2, 2);
  for (const x of [-4, -1.6, 2, 4.2]) pata(g, x, -3.4, x + (x < 0 ? -.2 : .2), 0, shade(FR.cal, -.35), .9);
  ovalo(g, 0, -6, 6.2, 3.3, FR.cal, r, op);
  ovalo(g, -2.2, -6.6, 2, 1.5, FR.carbon, r, { n: 0, bw: .3, borde: false });
  const cx = pasta ? 6.4 : 6.2, cy = pasta ? -3.2 : -7.6;
  ovalo(g, cx, cy, 2.2, 1.8, FR.cal, r, op);
  ovalo(g, cx - 1, cy - 1.3, .9, .6, FR.carbon, r, { n: 0, borde: false });
  pata(g, -6, -6.5, -7.2, -3.5, FR.siena, .6);
}
function gallina(g, r, roja) {
  sombraSuelo(g, 3, 1, 1);
  pata(g, -.6, -1, -.6, 0, FR.ocre, .5); pata(g, .8, -1, .8, 0, FR.ocre, .5);
  const col = roja ? FR.ocreRojo : FR.cal;
  ovalo(g, 0, -3, 2.6, 2, col, r, op);
  const cx = roja ? 2.8 : 2.2, cy = roja ? -2.2 : -4.8;
  ovalo(g, cx, cy, 1.25, 1.2, col, r, op);
  g.fillStyle = FR.rojo; g.fillRect(cx - .2, cy - 1.8, 1, .9);
  g.fillStyle = FR.ocre; g.fillRect(cx + 1, cy - .1, 1, .55);
}
function perro(g, r, f) {
  sombraSuelo(g, 5, 1.6, 1);
  const s = f ? 1.2 : -1.2, col = FR.sienaClara;
  for (const [x, d] of [[-3, s], [-1.5, -s], [2, -s], [3.4, s]]) pata(g, x, -3, x + d * .6, 0, shade(col, -.2), 1);
  ovalo(g, 0, -4.5, 4.6, 2.2, col, r, op);
  ovalo(g, 4.8, -6.4, 1.9, 1.6, col, r, op);
  ovalo(g, 4.1, -7.7, .9, 1.3, FR.siena, r, { n: 0, borde: false });
  g.save(); g.strokeStyle = col; g.lineWidth = 1.1; g.lineCap = 'round'; g.beginPath(); g.moveTo(-4.3, -5); g.quadraticCurveTo(-6.5, -7.5 + f, -6.8, -8.5 + f); g.stroke(); g.restore();
}
function garza(g, r) {
  pata(g, -1, 0, -1, -5, FR.ocre, .6); pata(g, 1, 0, 1, -5, FR.ocre, .6);
  ovalo(g, 0, -7.5, 2.4, 3, FR.cal, r, op);
  g.save(); g.strokeStyle = FR.cal; g.lineWidth = 1.3; g.lineCap = 'round'; g.beginPath(); g.moveTo(1, -10); g.quadraticCurveTo(3, -12, 2, -14); g.stroke(); g.restore();
  contorno(g, [[1.6, -10], [3.2, -12], [2.4, -14]], r, .5, .4, false);
  g.fillStyle = FR.ocre; g.fillRect(2, -14.5, 2.6, .8);
}
function garzaVuela(g, r) {
  pintar(g, [[-1, 0], [-5, -5], [-9, -3], [-5, -1], [-1, 1]], FR.cal, r, op);
  pintar(g, [[1, 0], [5, -5], [9, -3], [5, -1], [1, 1]], FR.cal, r, op);
  ovalo(g, 0, 0, 3.2, 1.5, FR.cal, r, op);
  g.fillStyle = FR.ocre; g.fillRect(3, -.5, 2.6, .7);
}
function loro(g, r, f) {
  pintar(g, f ? [[-1.5, 0], [1, -4], [1.8, 0]] : [[-1.5, 0], [1, 3.5], [1.8, 0]], shade(FR.verde, -.15), r, { n: 0, bw: .35 });
  ovalo(g, 0, 0, 3.2, 1.6, FR.verde, r, op);
  ovalo(g, 3, -.3, 1.1, 1.1, FR.ocre, r, { n: 0, bw: .35 });
  g.fillStyle = FR.rojo; g.fillRect(-4.8, -.4, 2, .9);
}
function pajaro(g, f) {
  g.save(); g.strokeStyle = FR.siena; g.lineWidth = 1; g.lineCap = 'round'; g.beginPath();
  if (f) { g.moveTo(-5, 1); g.quadraticCurveTo(-2.5, -1.5, 0, 0); g.quadraticCurveTo(2.5, -1.5, 5, 1); } else { g.moveTo(-5, -2.5); g.quadraticCurveTo(-2.5, 1, 0, 0); g.quadraticCurveTo(2.5, 1, 5, -2.5); }
  g.stroke(); g.restore();
}
function piedra(g, r) {
  sombraSuelo(g, 8, 2.5, 3);
  const gris = mix('#A69C8E', FR.yeso, .2);
  pintar(g, [[-9, 0], [-6, -7], [2, -9], [8, -4], [9, 0]], gris, r, { n: 2, bw: .5 });
  pintar(g, [[2, -9], [8, -4], [9, 0], [3, 0]], shade(gris, -.15), r, { n: 1, bw: .4, borde: false });
}
function tocon(g, r) {
  sombraSuelo(g, 6, 2, 2, .25);
  pintar(g, [[-2.4, 0], [-1.8, -11], [-.6, -13], [.4, -10.5], [1.6, -12], [2.4, 0]], '#4A3E36', r, { n: 1, bw: .5 });
  pata(g, 1, -7, 4.5, -10, '#3A302A', 1);
  g.save(); g.globalAlpha = .5; g.fillStyle = '#7E7268'; g.fillRect(-1.6, -9, .8, 7); g.restore();
}

// [clave, ancho, alto, anclaX, anclaY, pintura]: las mismas medidas que antes, para no mover nada en el mapa.
export function recetasFauna() {
  return [
    ['piedra', 28, 18, 14, 14, piedra],
    ['vaca', 26, 20, 13, 16, (g, r) => vaca(g, r, false)],
    ['vacaPasta', 26, 20, 13, 16, (g, r) => vaca(g, r, true)],
    ['gallina0', 10, 10, 5, 8, (g, r) => gallina(g, r, false)],
    ['gallina1', 10, 10, 5, 8, (g, r) => gallina(g, r, true)],
    ...[0, 1].map(f => ['perro' + f, 18, 14, 9, 11, (g, r) => perro(g, r, f)]),
    ...[0, 1].map(f => ['pajaro' + f, 12, 8, 6, 4, g => pajaro(g, f)]),
    ...[0, 1].map(f => ['loro' + f, 14, 10, 7, 5, (g, r) => loro(g, r, f)]),
    ['garzaVuela', 20, 12, 10, 6, garzaVuela],
    ['tocon', 18, 22, 9, 18, tocon],
    ['garza', 14, 20, 7, 17, garza]
  ];
}
