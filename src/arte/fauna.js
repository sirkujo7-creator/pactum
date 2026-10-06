// Animales del Tolima (renovación colonial, 6 de octubre; antes al fresco), tomados de la prueba aprobada
// pruebas/colonial.html: siluetas con curvas, luz de arriba, contorno suave y sombra en el suelo. Pedido de Juan:
// animaciones suaves, sin movimientos raros. Por eso cada animal tiene sus cuadros (patas que se alternan al andar,
// la vaca que baja la cabeza, la gallina que picotea, el perro sentado, la garza que aletea) pintados con el mismo
// pincel y los mismos colores: entre un cuadro y otro solo cambia la postura, nunca el color.
import { mix } from './fresco.js';

const CONTORNO = 'rgba(70,45,30,.55)';
function grad(g, y0, y1, stops) { const gr = g.createLinearGradient(0, y0, 0, y1); stops.forEach(([p, c]) => gr.addColorStop(p, c)); return gr; }
// Silueta cerrada con curvas (los puntos pares son de control), con luz de arriba y la panza en sombra.
function cuerpo(g, pts, col, sombra) {
  g.beginPath(); g.moveTo(...pts[0]);
  for (let k = 1; k < pts.length; k += 2) { if (pts[k + 1]) g.quadraticCurveTo(...pts[k], ...pts[k + 1]); else g.lineTo(...pts[k]); }
  g.closePath();
  const ys = pts.map(p => p[1]); g.fillStyle = grad(g, Math.min(...ys), Math.max(...ys), [[0, mix(col, '#FFFFFF', .2)], [.6, col], [1, sombra]]); g.fill();
  g.strokeStyle = CONTORNO; g.lineWidth = .5; g.stroke();
}
// Pata doblada en la rodilla; dx mueve el casco adelante o atrás (la zancada).
function pata(g, x, y0, y1, w, col, casco = '#2A2420', dx = 0) {
  g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round';
  g.beginPath(); g.moveTo(x, y0); g.quadraticCurveTo(x + dx * .3, (y0 + y1) / 2, x + dx, y1 - 1); g.stroke();
  g.strokeStyle = casco; g.lineWidth = w * .95; g.beginPath(); g.moveTo(x + dx, y1 - .8); g.lineTo(x + dx, y1); g.stroke();
}
const sombra = (g, rx) => { g.save(); g.globalAlpha = .25; g.fillStyle = '#2A2A1E'; g.beginPath(); g.ellipse(1, 0, rx, rx * .28, 0, 0, 7); g.fill(); g.restore(); };
// Zancada de un cuadrúpedo: f de 0 a 3 (null quieto). Las patas en diagonal van juntas, como al caminar.
const zancada = (f, amp) => { if (f === null) return [0, 0]; const s = Math.sin(f / 4 * Math.PI * 2) * amp; return [s, -s]; };
// Pinta escalado y con los pies en (0, 0).
const a_escala = (k, fn) => (g, ...x) => { g.save(); g.scale(k, k); fn(g, ...x); g.restore(); };

// Vaca blanca orejinegra, la criolla del Tolima. pasta: cabeza abajo comiendo pasto.
function vaca(g, f, pasta) {
  const [a, b] = zancada(f, 2.2);
  sombra(g, 13);
  pata(g, -7, -11, 0, 2.1, '#BDB4A4', '#4A403A', b); pata(g, 6, -11, 0, 2.1, '#BDB4A4', '#4A403A', a);
  cuerpo(g, [[-10, -19], [-2, -22], [6, -19.5], [10, -18], [10.5, -14], [10, -10], [3, -9.6], [-4, -10], [-10, -10.6], [-11.5, -15], [-10, -19]], '#F2EEE6', '#CFC6B6');
  // Manchas negras de la orejinegra en el lomo (pocas: es casi toda blanca).
  g.fillStyle = 'rgba(40,34,30,.85)'; g.beginPath(); g.ellipse(-3, -17.5, 2.6, 1.6, .2, 0, 7); g.fill();
  pata(g, -5, -11, 0, 2.3, '#E8E2D6', '#4A403A', a); pata(g, 8, -11, 0, 2.3, '#E8E2D6', '#4A403A', b);
  g.save();
  if (pasta) { g.translate(9.5, -16); g.rotate(.85); g.translate(-9.5, 16); g.translate(0, 1.2); }
  cuerpo(g, [[9.5, -19.5], [12.5, -21.5], [15, -19.5], [16.8, -17], [16.6, -14.5], [14.5, -13.6], [12.5, -15], [10, -16], [9.5, -19.5]], '#F2EEE6', '#D2CABB');
  g.fillStyle = '#6A5A54'; g.beginPath(); g.ellipse(15.8, -14.8, 1.6, 1.2, .3, 0, 7); g.fill();
  g.fillStyle = '#1E1A18'; g.beginPath(); g.ellipse(11, -20.6, 2.2, 1, -.5, 0, 7); g.fill(); g.beginPath(); g.ellipse(14.2, -21.2, 1.6, .8, .4, 0, 7); g.fill();
  g.strokeStyle = '#D9CDB0'; g.lineWidth = .7; g.beginPath(); g.moveTo(12, -21.5); g.quadraticCurveTo(11.5, -23.5, 10.5, -24); g.moveTo(13.6, -21.6); g.quadraticCurveTo(14.5, -23.5, 15.6, -23.8); g.stroke();
  g.fillStyle = '#1E1A18'; g.beginPath(); g.arc(14.2, -18.2, .6, 0, 7); g.fill();
  g.restore();
  // Cola con su borla (se mece un poco con el paso).
  const cola = f === null ? 0 : Math.sin(f / 4 * Math.PI * 2) * .8;
  g.strokeStyle = '#B8AE9C'; g.lineWidth = .8; g.beginPath(); g.moveTo(-11, -17.5); g.quadraticCurveTo(-13.5, -14, -12.5 + cola, -9); g.stroke();
  g.fillStyle = '#3A302A'; g.beginPath(); g.ellipse(-12.6 + cola, -8.5, .8, 1.5, 0, 0, 7); g.fill();
}
function gallina(g, roja, pica) {
  sombra(g, 4);
  g.strokeStyle = '#C9A24A'; g.lineWidth = .7; g.beginPath(); g.moveTo(-.6, -3); g.lineTo(-.8, 0); g.moveTo(.8, -3); g.lineTo(1, 0); g.stroke();
  const col = roja ? '#A8502E' : '#F2EEE6', s = roja ? '#6E2E1A' : '#C8BFAF';
  cuerpo(g, [[-4.5, -8.5], [-2, -5], [1, -3], [4, -3.4], [5, -6], [5.2, -8.5], [3, -9], [0, -7], [-4.5, -8.5]], col, s);
  g.fillStyle = roja ? '#2A2A2A' : '#3E3A36'; g.beginPath(); g.moveTo(-4.5, -8.5); g.quadraticCurveTo(-6.5, -12, -4.6, -13); g.quadraticCurveTo(-3.6, -10, -2.5, -7); g.fill();
  // Cabeza: arriba mirando, o abajo picoteando el suelo.
  g.save(); if (pica) { g.translate(4.4, -8.4); g.rotate(1.1); g.translate(-4.4, 8.4); }
  cuerpo(g, [[3.4, -8.8], [4.4, -11.4], [6.2, -11], [6.6, -9], [5.2, -7.6], [3.4, -8.8]], col, s);
  g.fillStyle = '#C8352A'; g.beginPath(); g.ellipse(5, -12, 1.3, .8, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(6.3, -8.4, .5, .9, 0, 0, 7); g.fill();
  g.fillStyle = '#D9A93A'; g.beginPath(); g.moveTo(6.5, -10); g.lineTo(8, -9.6); g.lineTo(6.5, -9.2); g.fill();
  g.fillStyle = '#1E1A18'; g.beginPath(); g.arc(5.4, -10, .35, 0, 7); g.fill();
  g.restore();
}
// Perro criollo: f 0..3 trotando, o sentado.
function perro(g, f, sentado) {
  sombra(g, 7);
  if (sentado) {
    pata(g, -3.5, -4, 0, 1.6, '#8A6A48', '#3A2A1E', 2.5);
    cuerpo(g, [[-6, -6], [-3, -11], [2, -12.5], [4.5, -11], [5, -8], [3.4, -4.5], [-1, -3.5], [-5, -3.6], [-6.5, -4.5], [-6, -6]], '#B08455', '#7A5636');
    pata(g, 2.6, -8, 0, 1.3, '#9A744C', '#3A2A1E', .3); pata(g, 4, -8, 0, 1.3, '#9A744C', '#3A2A1E', .4);
    cuerpo(g, [[3, -12], [4.5, -15.5], [7, -16], [9, -14.5], [8.6, -13], [6.4, -12.5], [4.6, -10.9], [3, -12]], '#B08455', '#7A5636');
    g.fillStyle = '#5A3E28'; g.beginPath(); g.ellipse(5, -15.9, 1.2, 2, -.6, 0, 7); g.fill();
    g.fillStyle = '#1E1A18'; g.beginPath(); g.arc(8.9, -13.9, .5, 0, 7); g.fill(); g.beginPath(); g.arc(6.8, -14.7, .35, 0, 7); g.fill();
    g.strokeStyle = '#9A744C'; g.lineWidth = 1.1; g.lineCap = 'round'; g.beginPath(); g.moveTo(-6, -4.5); g.quadraticCurveTo(-8.5, -3.5, -9, -1.5); g.stroke();
    return;
  }
  const [a, b] = zancada(f, 1.8), alza = f === null ? 0 : Math.abs(Math.sin(f / 4 * Math.PI * 2)) * .4;
  pata(g, -4, -5, 0, 1.3, '#8A6A48', '#3A2A1E', b); pata(g, 4, -5, 0, 1.3, '#8A6A48', '#3A2A1E', a);
  g.save(); g.translate(0, -alza);
  cuerpo(g, [[-6, -9], [-1, -10.5], [4, -9.8], [6, -9], [6, -6.5], [3, -5], [-2, -5], [-6, -5.6], [-7, -7.4], [-6, -9]], '#B08455', '#7A5636');
  g.restore();
  pata(g, -2.5, -5, 0, 1.3, '#9A744C', '#3A2A1E', a); pata(g, 5.2, -5, 0, 1.3, '#9A744C', '#3A2A1E', b);
  g.save(); g.translate(0, -alza);
  cuerpo(g, [[5, -9.5], [6.5, -13], [9, -13.5], [11, -12], [10.6, -10.5], [8.4, -10], [6.6, -8.4], [5, -9.5]], '#B08455', '#7A5636');
  g.fillStyle = '#5A3E28'; g.beginPath(); g.ellipse(7, -13.4, 1.2, 2, -.6, 0, 7); g.fill();
  g.fillStyle = '#1E1A18'; g.beginPath(); g.arc(10.9, -11.4, .5, 0, 7); g.fill(); g.beginPath(); g.arc(8.8, -12.2, .35, 0, 7); g.fill();
  const cola = f === null ? 0 : Math.sin(f / 4 * Math.PI * 2) * 1.2;
  g.strokeStyle = '#9A744C'; g.lineWidth = 1.1; g.lineCap = 'round'; g.beginPath(); g.moveTo(-6.4, -8.5); g.quadraticCurveTo(-9, -11 + cola, -8.4 + cola * .5, -13.5); g.stroke();
  g.restore();
}
// Garza blanca: quieta, caminando (f 0 o 1) o volando (alas arriba o abajo).
function garza(g, f) {
  sombra(g, 4);
  const p = f === null ? 0 : (f ? 1.4 : -1.4);
  g.strokeStyle = '#2A2420'; g.lineWidth = .6; g.beginPath(); g.moveTo(-.6, -8); g.lineTo(-1 + p, 0); g.moveTo(.8, -8); g.lineTo(1.4 - p, 0); g.stroke();
  cuerpo(g, [[-5, -13], [-1, -14.5], [3, -12.5], [3.6, -10], [1, -8], [-3, -8.4], [-6.5, -10], [-5, -13]], '#FBF8F2', '#D6CFC2');
  g.strokeStyle = '#F4F0E8'; g.lineWidth = 1.5; g.lineCap = 'round'; g.beginPath(); g.moveTo(2.5, -12.5); g.bezierCurveTo(6, -14, 2, -18, 4.5, -21); g.stroke();
  g.strokeStyle = CONTORNO; g.lineWidth = .4; g.beginPath(); g.moveTo(3.3, -12.6); g.bezierCurveTo(6.6, -14.2, 2.8, -18, 5.3, -21); g.stroke();
  g.fillStyle = '#FBF8F2'; g.beginPath(); g.ellipse(5, -21.3, 1.5, 1.1, 0, 0, 7); g.fill();
  g.fillStyle = '#E3B23C'; g.beginPath(); g.moveTo(6.2, -21.6); g.lineTo(10, -21); g.lineTo(6.2, -20.6); g.fill();
  g.fillStyle = '#1E1A18'; g.beginPath(); g.arc(5.3, -21.6, .3, 0, 7); g.fill();
}
function garzaVuela(g, arriba) {
  const y = arriba ? -7 : 4;
  for (const s of [-1, 1]) cuerpo(g, [[s * 1, -1], [s * 6, y - 1], [s * 11, y], [s * 6, y + 2], [s * 1, 1]], '#FBF8F2', '#D6CFC2');
  cuerpo(g, [[-6, 0], [0, -2.4], [5, -1], [5.5, 1], [0, 2], [-6, 0]], '#FBF8F2', '#D6CFC2');
  g.strokeStyle = '#F4F0E8'; g.lineWidth = 1.2; g.lineCap = 'round'; g.beginPath(); g.moveTo(4.5, -.6); g.quadraticCurveTo(6.5, -1.5, 7.5, -.6); g.stroke();
  g.fillStyle = '#E3B23C'; g.beginPath(); g.moveTo(7.5, -1); g.lineTo(10.5, -.6); g.lineTo(7.5, -.1); g.fill();
  g.strokeStyle = '#2A2420'; g.lineWidth = .5; g.beginPath(); g.moveTo(-6, .2); g.lineTo(-10, .8); g.stroke();
}
// Loro (perico) verde de las palmas, aleteando.
function loro(g, arriba) {
  for (const s of [-1, 1]) cuerpo(g, [[s * .5, -.5], [s * 3.5, arriba ? -4.5 : 3], [s * 6, arriba ? -3.5 : 4], [s * 3.5, arriba ? -1.5 : 1.5], [s * .5, .8]], '#4F9A42', '#2E6A2A');
  cuerpo(g, [[-4.5, 0], [-1, -2], [2.5, -1.6], [3.4, 0], [1, 1.6], [-4.5, .6], [-4.5, 0]], '#5DAE4C', '#367A30');
  g.fillStyle = '#E3B23C'; g.beginPath(); g.arc(3, -1, 1, 0, 7); g.fill();
  g.fillStyle = '#C8352A'; g.fillRect(-6.2, -.3, 2, .8);
  g.fillStyle = '#1E1A18'; g.beginPath(); g.arc(3.2, -1.2, .3, 0, 7); g.fill();
}
function pajaro(g, arriba) {
  g.save(); g.strokeStyle = '#4A3424'; g.lineWidth = 1; g.lineCap = 'round'; g.beginPath();
  if (arriba) { g.moveTo(-5, 1); g.quadraticCurveTo(-2.5, -1.5, 0, 0); g.quadraticCurveTo(2.5, -1.5, 5, 1); } else { g.moveTo(-5, -2.5); g.quadraticCurveTo(-2.5, 1, 0, 0); g.quadraticCurveTo(2.5, 1, 5, -2.5); }
  g.stroke(); g.restore();
}
// Piedra con luz de arriba y musgo; tocón quemado tras un incendio.
function piedra(g) {
  sombra(g, 9);
  cuerpo(g, [[-9, 0], [-8, -5], [-5, -7], [0, -9.5], [4, -8], [8, -4.5], [9, 0], [0, .8], [-9, 0]], '#B3A999', '#7E7468');
  g.fillStyle = 'rgba(255,255,255,.3)'; g.beginPath(); g.ellipse(-2, -7, 3.5, 1.2, -.3, 0, 7); g.fill();
  g.fillStyle = 'rgba(110,140,70,.55)'; g.beginPath(); g.ellipse(4, -1.2, 3, 1, 0, 0, 7); g.fill();
}
function tocon(g) {
  sombra(g, 6);
  cuerpo(g, [[-2.4, 0], [-2.2, -6], [-1.8, -11], [-1.2, -12.5], [-.6, -13], [0, -11], [.4, -10.5], [1, -11.5], [1.6, -12], [2, -6], [2.4, 0], [0, .6], [-2.4, 0]], '#4A3E36', '#2E2620');
  g.strokeStyle = '#3A302A'; g.lineWidth = 1; g.lineCap = 'round'; g.beginPath(); g.moveTo(1, -7); g.lineTo(4.5, -10); g.stroke();
  g.save(); g.globalAlpha = .45; g.fillStyle = '#7E7268'; g.fillRect(-1.6, -9, .8, 7); g.restore();
}

// [clave, ancho, alto, anclaX, anclaY, pintura], con las mismas anclas de antes para no mover nada en el mapa.
// Cuadros nuevos: vacaA0..3 (caminando), perro0..3 (trotando) y perroS (sentado), gallina0p y gallina1p
// (picoteando), garzaA0..1 (caminando) y garzaVuela1 (alas abajo).
export function recetasFauna() {
  const V = .6, PE = .72, GA = .5, GZ = .68;
  return [
    ['piedra', 28, 18, 14, 14, a_escala(.85, piedra)],
    ['vaca', 26, 20, 13, 16, a_escala(V, g => vaca(g, null, false))],
    ['vacaPasta', 26, 20, 13, 16, a_escala(V, g => vaca(g, null, true))],
    ...[0, 1, 2, 3].map(f => ['vacaA' + f, 26, 20, 13, 16, a_escala(V, g => vaca(g, f, false))]),
    ['gallina0', 10, 10, 5, 8, a_escala(GA, g => gallina(g, false, false))],
    ['gallina1', 10, 10, 5, 8, a_escala(GA, g => gallina(g, true, false))],
    ['gallina0p', 10, 10, 5, 8, a_escala(GA, g => gallina(g, false, true))],
    ['gallina1p', 10, 10, 5, 8, a_escala(GA, g => gallina(g, true, true))],
    ...[0, 1, 2, 3].map(f => ['perro' + f, 18, 14, 9, 11, a_escala(PE, g => perro(g, f, false))]),
    ['perroS', 18, 14, 9, 11, a_escala(PE, g => perro(g, null, true))],
    ...[0, 1].map(f => ['pajaro' + f, 12, 8, 6, 4, g => pajaro(g, f)]),
    ...[0, 1].map(f => ['loro' + f, 14, 10, 7, 5, a_escala(.9, g => loro(g, f))]),
    ['garzaVuela', 24, 14, 12, 7, a_escala(.85, g => garzaVuela(g, true))],
    ['garzaVuela1', 24, 14, 12, 7, a_escala(.85, g => garzaVuela(g, false))],
    ['tocon', 18, 22, 9, 18, tocon],
    ['garza', 16, 20, 8, 17, a_escala(GZ, g => garza(g, null))],
    ...[0, 1].map(f => ['garzaA' + f, 16, 20, 8, 17, a_escala(GZ, g => garza(g, f))])
  ];
}
