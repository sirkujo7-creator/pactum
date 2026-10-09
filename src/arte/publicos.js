// Edificios públicos coloniales (renovación colonial, paso 5; antes templos griegos). Pedido de Juan: diferenciar
// al máximo. Cada obra tiene una silueta propia que se reconoce de lejos:
//   escuela: casa larga con corredor y espadaña con campana; hospital: dos pisos con galería de arcos y capilla;
//   taller: ramada abierta con banco de trabajo y horno de ladrillo con chimenea; recaudo: casa fuerte de piedra
//   con rejas y balanza; biblioteca: casa de la cultura con linterna en el techo; teatro: fachada alta con tres
//   arcos y pretil; policía: casa con garita y farol; cuartel: muralla con almenas y torreón; banco: esquina con
//   cúpula; universidad: claustro con torre del reloj; acueducto: arcos de piedra con su canal; molino: casa de
//   piedra con rueda hidráulica; puerto: bodega, muelle de madera y champán; mercado: toldos o plaza cubierta. La sede del gobierno cambia con el
//   régimen: cabildo de portales (república), palacio con torreones (monarquía), casona con escudo (aristocracia),
//   fortaleza (tiranía), casa de comercio de ladrillo (oligarquía) y tribuna popular (demagogia).
import { P, K, MAT, mezcla, poli, rellena, grad, caras, muros, hiladas, hueco, ventana, puerta, balcon, tejas, dosAguas, cuatroAguas, terraza, sombraCasa, materas, bancoMadera } from './casas.js';

const PIEDRA = '#C9C0AE', PIEDRA_OSC = '#A39A88', OCRE = '#E2C17E', MADERA = K.madera;

// ---------- Pinceles ----------
// Sillares de piedra: hiladas e juntas alternadas, más gruesas que el ladrillo.
function sillares(g, F) {
  g.save(); g.strokeStyle = 'rgba(80,70,55,.35)'; g.lineWidth = .4;
  for (const cara of ['izq', 'der']) {
    for (let z = 3.5; z < F.H; z += 3.5) { const a = F.en(cara, 0, z), b = F.en(cara, 1, z); g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); }
    for (let z = 0, k = 0; z < F.H; z += 3.5, k++) for (let u = (k % 2) * .09; u < 1; u += .18) { const a = F.en(cara, u, z), b = F.en(cara, u, Math.min(F.H, z + 3.5)); g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); }
  }
  g.restore();
}
// Arcos (portales o galería): n vanos de u0 a u1, desde z hasta z + h.
function arcada(g, F, cara, n, z, h, u0 = .05, u1 = .95, col = '#4A3A2C') {
  const paso = (u1 - u0) / n;
  for (let k = 0; k < n; k++) hueco(g, F, cara, u0 + k * paso + paso * .14, u0 + (k + 1) * paso - paso * .14, z, z + h, col, true);
}
// Almenas sobre los bordes de arriba de la fachada y el costado.
function almenas(g, F, col, n = 7, alto = 2.6) {
  const z = F.z0 + F.H;
  for (const [p, q] of [[[F.f, F.a], [F.f, F.b]], [[F.f, F.b], [F.t, F.b]]]) {
    for (let k = 0; k < n; k++) {
      const u0 = k / n, u1 = u0 + .5 / n, A = [p[0] + (q[0] - p[0]) * u0, p[1] + (q[1] - p[1]) * u0], B = [p[0] + (q[0] - p[0]) * u1, p[1] + (q[1] - p[1]) * u1];
      rellena(g, [P(...A, z), P(...B, z), P(...B, z + alto), P(...A, z + alto)], p[0] === q[0] ? col : mezcla(col, '#000000', .15), K.contorno, .35);
    }
  }
}
// Techo plano (azotea) detrás del pretil.
function azotea(g, F, col) { const z = F.z0 + F.H; rellena(g, [P(F.f, F.a, z), P(F.f, F.b, z), P(F.t, F.b, z), P(F.t, F.a, z)], col); }
// Pirámide de teja (torres y garitas).
function piramide(g, F, alto, teja = K.teja) {
  const luz = teja === K.teja ? K.tejaLuz : mezcla(teja, '#FFFFFF', .18), osc = teja === K.teja ? K.tejaSombra : mezcla(teja, '#000000', .25);
  const z = F.z0 + F.H, o = .03, cr = (F.f + F.t) / 2, cc = (F.a + F.b) / 2, A = P(cr, cc, z + alto);
  rellena(g, [P(F.f + o, F.a - o, z), P(F.f + o, F.b + o, z), A], grad(g, 0, A[1], 0, P(F.f, F.a, z)[1], [[0, luz], [1, teja]]));
  rellena(g, [P(F.f + o, F.b + o, z), P(F.t - o, F.b + o, z), A], osc);
}
// Cúpula con linterna (biblioteca, banco, universidad).
function cupula(g, x, y, rx, alto, col, linterna = true) {
  g.fillStyle = mezcla(col, '#000000', .2); g.beginPath(); g.ellipse(x, y, rx, rx * .45, 0, 0, Math.PI); g.fill();
  g.beginPath(); g.moveTo(x - rx, y); g.bezierCurveTo(x - rx, y - alto * .9, x - rx * .25, y - alto, x, y - alto); g.bezierCurveTo(x + rx * .25, y - alto, x + rx, y - alto * .9, x + rx, y); g.closePath();
  const gr = g.createLinearGradient(x - rx, 0, x + rx, 0); gr.addColorStop(0, mezcla(col, '#FFFFFF', .25)); gr.addColorStop(.5, col); gr.addColorStop(1, mezcla(col, '#000000', .3));
  g.fillStyle = gr; g.fill(); g.strokeStyle = K.contorno; g.lineWidth = .5; g.stroke();
  g.strokeStyle = 'rgba(60,40,30,.35)'; g.lineWidth = .4; for (const f of [-.5, 0, .5]) { g.beginPath(); g.moveTo(x + f * rx, y); g.quadraticCurveTo(x + f * rx * .6, y - alto * .8, x, y - alto); g.stroke(); }
  if (linterna) { rellena(g, [[x - 1.6, y - alto], [x + 1.6, y - alto], [x + 1.6, y - alto - 3.5], [x - 1.6, y - alto - 3.5]], K.cal, K.contorno, .35); g.fillStyle = col; g.beginPath(); g.moveTo(x - 2, y - alto - 3.5); g.lineTo(x, y - alto - 6); g.lineTo(x + 2, y - alto - 3.5); g.fill(); }
}
function reloj(g, x, y, r) {
  g.fillStyle = '#F7F1E3'; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.strokeStyle = '#3A2A1E'; g.lineWidth = .5; g.stroke();
  g.lineWidth = .45; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - r * .7); g.moveTo(x, y); g.lineTo(x + r * .5, y + r * .1); g.stroke();
}
function bandera(g, x, y, h, cols, ancho = 9) {
  g.strokeStyle = K.maderaOsc; g.lineWidth = .8; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - h); g.stroke();
  const alto = 6, fr = cols.length === 3 && cols[0] === '#E8C23A' ? [.5, .25, .25] : cols.map(() => 1 / cols.length);
  let y0 = y - h;
  cols.forEach((c, k) => { const hh = alto * fr[k]; g.fillStyle = c; g.beginPath(); g.moveTo(x, y0); g.quadraticCurveTo(x + ancho / 2, y0 - 1, x + ancho, y0 + .6); g.lineTo(x + ancho, y0 + .6 + hh); g.quadraticCurveTo(x + ancho / 2, y0 + hh - 1, x, y0 + hh); g.fill(); y0 += hh; });
}
const TRICOLOR = ['#E8C23A', '#2F5D8A', '#B9442F'];
function escudo(g, x, y, s = 1, col = '#C9A24A') {
  g.fillStyle = col; g.beginPath(); g.moveTo(x - 2.4 * s, y - 2.6 * s); g.lineTo(x + 2.4 * s, y - 2.6 * s); g.lineTo(x + 2.4 * s, y); g.quadraticCurveTo(x + 2.2 * s, y + 2.4 * s, x, y + 3.2 * s); g.quadraticCurveTo(x - 2.2 * s, y + 2.4 * s, x - 2.4 * s, y); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(70,45,20,.7)'; g.lineWidth = .4; g.stroke(); g.fillStyle = 'rgba(120,40,30,.8)'; g.fillRect(x - .5 * s, y - 2 * s, s, 4 * s);
}
function cruz(g, x, y, s = 1, col = K.maderaOsc) { g.strokeStyle = col; g.lineWidth = .9 * s; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - 6 * s); g.moveTo(x - 2.2 * s, y - 4.2 * s); g.lineTo(x + 2.2 * s, y - 4.2 * s); g.stroke(); }
// Espadaña: muro de remate con su campana, sobre la fachada (cara izq) en u, desde la altura z.
function espadana(g, F, u, z, alto = 12) {
  const a = F.en('izq', u - .09, z), b = F.en('izq', u + .09, z), m = F.en('izq', u, z + alto);
  rellena(g, [a, b, [b[0], b[1] - alto * .7], m, [a[0], a[1] - alto * .7]], K.cal);
  const c = F.en('izq', u, z + alto * .42); g.fillStyle = '#3A2A1E'; g.beginPath(); g.ellipse(c[0], c[1], 2, 2.8, 0, 0, 7); g.fill();
  g.fillStyle = '#C9A24A'; g.beginPath(); g.moveTo(c[0] - 1.4, c[1] + 1.8); g.quadraticCurveTo(c[0], c[1] - 2.4, c[0] + 1.4, c[1] + 1.8); g.fill();
  cruz(g, m[0], m[1] - .5, .7);
}
// Letrero colgado sobre una puerta (cara izq).
function letrero(g, F, u, z, col, texto) {
  const a = F.en('izq', u - .1, z), b = F.en('izq', u + .1, z);
  rellena(g, [a, b, [b[0], b[1] - 3.4], [a[0], a[1] - 3.4]], col, K.contorno, .35);
  if (texto) { g.save(); g.fillStyle = '#F7F1E3'; g.font = 'bold 2.4px serif'; g.textAlign = 'center'; g.fillText(texto, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - .9); g.restore(); }
}
function farol(g, x, y, h = 10) { g.strokeStyle = '#2E2A28'; g.lineWidth = .7; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - h); g.stroke(); rellena(g, [[x - 1.3, y - h], [x + 1.3, y - h], [x + 1, y - h - 3], [x - 1, y - h - 3]], '#F2D27A', 'rgba(40,30,20,.7)', .35); }
// Rueda hidráulica en un plano vertical a lo largo de r (de canto hacia el río).
function rueda(g, cx, cy, R) {
  const u = [-R * .82, R * .41], v = [0, -R], pt = a => [cx + u[0] * Math.cos(a) + v[0] * Math.sin(a), cy + u[1] * Math.cos(a) + v[1] * Math.sin(a)];
  g.strokeStyle = K.maderaOsc; g.lineWidth = 1.2; g.beginPath(); for (let k = 0; k <= 24; k++) { const p = pt(k / 24 * Math.PI * 2); k ? g.lineTo(...p) : g.moveTo(...p); } g.stroke();
  g.lineWidth = .6; for (let k = 0; k < 8; k++) { const p = pt(k / 8 * Math.PI * 2); g.beginPath(); g.moveTo(cx, cy); g.lineTo(...p); g.stroke(); }
  g.strokeStyle = MADERA; g.lineWidth = 1.4; for (let k = 0; k < 12; k++) { const p = pt(k / 12 * Math.PI * 2), q = pt(k / 12 * Math.PI * 2 + .12); g.beginPath(); g.moveTo(...p); g.lineTo(...q); g.stroke(); }
  g.fillStyle = 'rgba(160,200,215,.65)'; for (let k = 0; k < 4; k++) { const p = pt(-1.2 - k * .25); g.beginPath(); g.ellipse(p[0] + 1, p[1] + 1.5, .7, 1.4, 0, 0, 7); g.fill(); }
}
function sacos(g, x, y) { for (const [dx, dy, c] of [[0, 0, '#C9B48A'], [4, 1.5, '#BFA87C'], [2, -2.8, '#D2BE95']]) { g.fillStyle = c; g.beginPath(); g.ellipse(x + dx, y + dy, 2.4, 1.8, .2, 0, 7); g.fill(); g.strokeStyle = 'rgba(90,60,35,.5)'; g.lineWidth = .3; g.stroke(); } }
function canoa(g, x, y) {
  rellena(g, [[x - 14, y - 7], [x + 10, y + 5], [x + 12, y + 3.5], [x - 10, y - 9.5]], '#6E4529');
  rellena(g, [[x - 10, y - 9.5], [x + 12, y + 3.5], [x + 11, y + 1.8], [x - 11, y - 10.6]], '#8A5A36');
  // Toldo de palma del champán.
  rellena(g, [[x - 6, y - 6], [x + 4, y - 1], [x + 4, y - 6], [x - 6, y - 11]], '#B79A5A'); rellena(g, [[x - 6, y - 11], [x + 4, y - 6], [x + 2, y - 8.5], [x - 8, y - 13]], '#D2B470');
  g.strokeStyle = '#3A2A1E'; g.lineWidth = .7; g.beginPath(); g.moveTo(x + 9, y + 1); g.lineTo(x + 16, y - 10); g.stroke(); // pértiga del boga
}

// Patios y jardines (identidad de cada obra).
function arbolito(g, x, y, s = 1, col = '#5E8B42') {
  g.save(); g.globalAlpha = .2; g.fillStyle = '#2A3A1E'; g.beginPath(); g.ellipse(x + 3 * s, y + 1, 8 * s, 2.6 * s, 0, 0, 7); g.fill(); g.restore();
  g.strokeStyle = '#6B4A33'; g.lineWidth = 1.6 * s; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - 9 * s); g.stroke();
  for (const [dx, dy, r] of [[-3.5, -12, 4.6], [3.5, -12.5, 4.4], [0, -16, 5], [0, -11, 4.2]]) {
    const gr = g.createRadialGradient(x + dx * s - 1.5, y + dy * s - 1.8, .5, x + dx * s, y + dy * s, r * s); gr.addColorStop(0, '#9BBE68'); gr.addColorStop(.5, col); gr.addColorStop(1, mezcla(col, '#1E2E18', .35));
    g.fillStyle = gr; g.beginPath(); g.ellipse(x + dx * s, y + dy * s, r * s, r * .8 * s, 0, 0, 7); g.fill();
  }
}
function rayuela(g, r, c) {
  g.save(); g.strokeStyle = 'rgba(250,245,230,.85)'; g.lineWidth = .5;
  for (let k = 0; k < 5; k++) { const q = [P(r, c + k * .05), P(r, c + (k + 1) * .05), P(r + .06, c + (k + 1) * .05), P(r + .06, c + k * .05)]; poli(g, q); g.stroke(); }
  g.restore();
}
function jardin(g, F) {
  rellena(g, [P(F.f + .04, F.a), P(F.f + .04, F.b), P(F.f + .14, F.b), P(F.f + .14, F.a)], '#8FAE6A', null);
  for (let k = 0; k < 7; k++) { const p = P(F.f + .09, F.a + .06 + k * (F.b - F.a - .12) / 6); g.fillStyle = k % 2 ? '#4E7A3A' : '#5E8B42'; g.beginPath(); g.ellipse(p[0], p[1] - 1.6, 2.2, 1.6, 0, 0, 7); g.fill(); g.fillStyle = ['#D8433A', '#F4EFE4', '#E7B23C'][k % 3]; g.beginPath(); g.arc(p[0] - .5, p[1] - 2.6, .55, 0, 7); g.fill(); }
}

// ---------- Las obras cambian con las épocas (pedido de Juan, 6 de octubre) ----------
// e: 0 bahareque y paja, 1 tapia y teja (la colonial), 2 ladrillo (la república), 3 concreto (lo moderno).
// Cada obra cambia sus materiales con la época y, además, algo propio: la escuela rural se vuelve colegio, el
// embarcadero de guadua se vuelve muelle de vapor y luego de lanchas, la empalizada se vuelve cuartel de piedra.
function epoca(e, op = {}) {
  if (e === 0) return { e, muro: op.muro0 || '#EDE4D2', zocalo: op.zocalo0 === undefined ? '#8A6A48' : op.zocalo0, techo: MAT[op.techo0 || 'paja'], vent: {}, carp: '#6E4529' };
  if (e === 2) return { e, muro: op.muro2 || K.ladrillo, zocalo: op.zocalo2 === undefined ? '#5A3A2A' : op.zocalo2, ladrillo: !op.muro2, techo: MAT[op.techo2 || 'tejaParda'], vent: { marco: '#F4EEE2' }, carp: op.carp || '#2E2A28' };
  if (e === 3) return { e, muro: op.muro3 || '#E4DED2', zocalo: op.zocalo3 === undefined ? '#8A8478' : op.zocalo3, plano: true, techo: null, vent: { vidrio: '#7FA6BC', marco: '#F4F1E8', postigos: false }, carp: '#5E6670' };
  return { e, muro: op.muro, zocalo: op.zocalo, techo: MAT[op.techo || 'teja'], vent: {}, carp: op.carp || '#3E6B4A' };
}
// Techo según la época: azotea plana con pretil, tanque y antena en el concreto; si no, dos o cuatro aguas.
function techoDe(g, F, rh, E, cuatro = false, extra = {}) {
  if (E.plano) return terraza(g, F, E.muro);
  return cuatro ? cuatroAguas(g, F, rh, { ...E.techo, ...extra }) : dosAguas(g, F, rh, { ...E.techo, ...extra });
}
function murosDe(g, F, E) { muros(g, F, E.muro, E.zocalo, { ladrillo: E.ladrillo }); if (E.e === 0) bahareque(g, F); }
// Bahareque: la cal caída deja ver la caña y el barro en algunos sitios.
function bahareque(g, F) {
  for (const [cara, u, z] of [['izq', .12, .55], ['der', .7, .35], ['izq', .86, .3]]) {
    const c = F.en(cara, u, F.H * z); g.fillStyle = '#B49A72'; g.beginPath(); g.ellipse(c[0], c[1], 2.2, 1.4, 0, 0, 7); g.fill();
    g.strokeStyle = 'rgba(110,80,50,.6)'; g.lineWidth = .3; for (let j = -1; j <= 1; j++) { g.beginPath(); g.moveTo(c[0] - 2, c[1] + j * .6); g.lineTo(c[0] + 2, c[1] + j * .6); g.stroke(); }
  }
}
// Ventanas por piso a lo largo de una cara.
function fila(g, F, cara, n, z, ancho, alto, E, u0 = .08, u1 = .92) { for (let k = 0; k < n; k++) ventana(g, F, cara, u0 + (k + .5) * (u1 - u0) / n, z, ancho, alto, E.carp, E.vent); }
function franjasVidrio(g, F, pisos) { for (let p = 0; p < pisos; p++) { const z = 3 + p * 9.5; for (const cara of ['izq', 'der']) rellena(g, [F.en(cara, .06, z), F.en(cara, .94, z), F.en(cara, .94, z + 5.5), F.en(cara, .06, z + 5.5)], cara === 'izq' ? '#86AEC4' : '#6E94AA', K.contorno, .3); } }
function carro(g, x, y, col = '#F4F1E8', franja = '#B9442F') {
  g.save(); g.globalAlpha = .22; g.fillStyle = '#2A2A1E'; g.beginPath(); g.ellipse(x + 1, y + .5, 8, 2.4, 0, 0, 7); g.fill(); g.restore();
  rellena(g, [[x - 7, y - 1], [x + 5, y + 2.5], [x + 5, y - 2], [x - 7, y - 5.5]], col); rellena(g, [[x - 7, y - 5.5], [x + 5, y - 2], [x + 7.5, y - 3.2], [x - 4.5, y - 6.8]], mezcla(col, '#000000', .1));
  rellena(g, [[x - 5, y - 5.6], [x + 1, y - 3.8], [x + 2, y - 7], [x - 3.6, y - 8.6]], '#7FA6BC');
  g.fillStyle = franja; g.fillRect(x - 7, y - 3.4, 12, 1);
  g.fillStyle = '#1E1A18'; for (const dx of [-4.5, 3]) { g.beginPath(); g.ellipse(x + dx, y + (dx + 7) * .3 - .6, 1.4, 1.4, 0, 0, 7); g.fill(); }
}
function cancha(g, r, c) { const q = [P(r, c), P(r, c + .36), P(r + .2, c + .36), P(r + .2, c)]; rellena(g, q, '#B9A27C', null); g.save(); g.strokeStyle = 'rgba(250,245,230,.85)'; g.lineWidth = .45; poli(g, q); g.stroke(); g.beginPath(); g.moveTo(...P(r, c + .18)); g.lineTo(...P(r + .2, c + .18)); g.stroke(); g.restore(); }
function antena(g, x, y, h = 16) { g.strokeStyle = '#6E6E6E'; g.lineWidth = .6; g.beginPath(); g.moveTo(x - 2, y); g.lineTo(x, y - h); g.lineTo(x + 2, y); g.moveTo(x - 1.2, y - h * .45); g.lineTo(x + 1.2, y - h * .45); g.stroke(); g.fillStyle = '#B9442F'; g.beginPath(); g.arc(x, y - h, .8, 0, 7); g.fill(); }

// ---------- Obras ----------
function escuela(g, e) {
  const E = epoca(e, { muro: '#F3E2A0', zocalo: '#3E6B4A', techo: 'zincRojo', muro3: '#F0D98A', zocalo3: '#3E6B4A' });
  const H = [13, 15, 24, 32][e], F = caras(.82, .44, H, -.08);
  sombraCasa(g, F);
  if (e === 3) cancha(g, F.f + .1, F.a + .1); else rayuela(g, F.f + .2, F.a + .55);
  arbolito(g, ...P(F.t + .05, F.a - .06), 1, '#4E7A3A'); // el mango de la escuela
  murosDe(g, F, E);
  if (e === 3) franjasVidrio(g, F, 3); else { puerta(g, F, 'izq', .5, .14, 10, E.carp, e < 2); fila(g, F, 'izq', 4, 4, .08, 6, E, .1, .9); ventana(g, F, 'der', .5, 4, .16, 6, E.carp, E.vent); if (e === 2) { fila(g, F, 'izq', 5, 14, .07, 6.5, E); ventana(g, F, 'der', .5, 14, .16, 6.5, E.carp, E.vent); balcon(g, F, .1, .9, 13.5, .1, '#2E2A28'); } }
  if (e === 3) puerta(g, F, 'izq', .5, .16, 8, '#3E6B4A', false);
  techoDe(g, F, 10, E, false, e < 2 ? { sale: .2 } : {});
  if (e < 2) { g.strokeStyle = K.maderaOsc; g.lineWidth = 1.2; for (const u of [.03, .35, .65, .97]) { const c = F.a + (F.b - F.a) * u, p = P(F.f + .18, c, 0), q = P(F.f + .18, c, H - 1.8); g.beginPath(); g.moveTo(...p); g.lineTo(...q); g.stroke(); } }
  if (e === 0) { const p = P(F.f + .3, F.b + .06); g.strokeStyle = K.maderaOsc; g.lineWidth = 1; g.beginPath(); g.moveTo(p[0] - 3, p[1]); g.lineTo(p[0] - 3, p[1] - 12); g.lineTo(p[0] + 3, p[1] - 12); g.lineTo(p[0] + 3, p[1]); g.stroke(); g.fillStyle = '#C9A24A'; g.beginPath(); g.moveTo(p[0] - 1.6, p[1] - 8); g.quadraticCurveTo(p[0], p[1] - 12.4, p[0] + 1.6, p[1] - 8); g.fill(); } // campana colgada de una horqueta
  else if (e < 3) { const ep = P((F.f + F.t) / 2, F.b, H + 9); rellena(g, [[ep[0] - 3.5, ep[1] + 4], [ep[0] + 3.5, ep[1] + 4], [ep[0] + 3.5, ep[1] - 6], [ep[0], ep[1] - 10], [ep[0] - 3.5, ep[1] - 6]], e === 2 ? K.ladrillo : K.cal); g.fillStyle = '#3A2A1E'; g.beginPath(); g.ellipse(ep[0], ep[1] - 3, 1.8, 2.6, 0, 0, 7); g.fill(); g.fillStyle = '#C9A24A'; g.beginPath(); g.moveTo(ep[0] - 1.3, ep[1] - 1.4); g.quadraticCurveTo(ep[0], ep[1] - 5.2, ep[0] + 1.3, ep[1] - 1.4); g.fill(); }
  if (e >= 2) letrero(g, F, .5, e === 3 ? 9 : 11, '#3E6B4A', e === 3 ? 'COLEGIO' : 'ESCUELA');
  const b = P(F.f + .32, F.a + .06); bandera(g, b[0], b[1], 22, TRICOLOR);
  if (e < 2) { const pz = P(F.f + .06, F.a + .62, 5); rellena(g, [[pz[0] - 3, pz[1]], [pz[0] + 3, pz[1] + 1.5], [pz[0] + 3, pz[1] - 2.5], [pz[0] - 3, pz[1] - 4]], '#2E4A3A', K.contorno, .3); }
}
function hospital(g, e) {
  const E = epoca(e, { muro: '#F7F4EC', zocalo: '#2F5D8A', techo: 'pizarra', techo0: 'tejaVieja', techo2: 'pizarra', muro3: '#F4F2EC', zocalo3: '#2F5D8A' });
  const H = [14, 24, 24, 32][e], F = caras(.86, .42, H, -.06);
  sombraCasa(g, F); jardin(g, F);
  murosDe(g, F, E);
  if (e === 0) { puerta(g, F, 'izq', .5, .14, 10, '#2F5D8A'); fila(g, F, 'izq', 4, 4, .07, 6, E, .08, .92); ventana(g, F, 'der', .5, 4, .16, 6, E.carp, E.vent); }
  else if (e === 3) { franjasVidrio(g, F, 3); puerta(g, F, 'izq', .5, .18, 8, '#4E7FA0', false); }
  else { arcada(g, F, 'izq', 6, 0, 8.5, .04, .96, e === 2 ? '#3A2A22' : '#5A4A3C'); fila(g, F, 'izq', 6, 14, .06, 6, { ...E, carp: '#2F5D8A' }, .04, .96); arcada(g, F, 'der', 2, 0, 8.5, .1, .9, '#4A3A2C'); ventana(g, F, 'der', .5, 14, .14, 6, '#2F5D8A', E.vent); }
  techoDe(g, F, e === 0 ? 9 : 11, E);
  if (e === 1 || e === 2) { const a = F.en('izq', .4, H), b = F.en('izq', .6, H), m = F.en('izq', .5, H + 10); rellena(g, [a, b, [b[0], b[1] - 3], m, [a[0], a[1] - 3]], e === 2 ? K.ladrillo : K.cal); cruz(g, m[0], m[1], .8); } // capilla
  const c = F.en('izq', .5, e === 0 ? 12.4 : e === 3 ? 10 : 27.5); g.fillStyle = '#B9442F'; g.fillRect(c[0] - .6, c[1] - 2, 1.2, 4); g.fillRect(c[0] - 2, c[1] - .6, 4, 1.2);
  if (e === 3) { const h = P((F.f + F.t) / 2, (F.a + F.b) / 2 - .12, H + 2); g.strokeStyle = '#F4F1E8'; g.lineWidth = .8; g.beginPath(); g.ellipse(h[0], h[1], 6, 3, 0, 0, 7); g.stroke(); g.save(); g.fillStyle = '#F4F1E8'; g.font = 'bold 4px sans-serif'; g.textAlign = 'center'; g.fillText('H', h[0], h[1] + 1.4); g.restore(); const p = P(F.f + .24, F.b - .1); carro(g, p[0], p[1]); } // helipuerto y ambulancia
}
function taller(g, e) {
  // Horno de ladrillo con chimenea (atrás) y ramada abierta con el banco de trabajo; la ramada cambia de techo.
  const Hn = caras(.3, .3, 9, -.22, .2);
  rellena(g, Hn.izq, '#B5654A'); rellena(g, Hn.der, '#97503A'); hiladas(g, Hn);
  const cx = P(-.22, .2, 9); cupula(g, cx[0], cx[1] + 2, 9.5, 6, '#A85A40', false);
  rellena(g, [[9, -3], [13.5, -1], [13.5, -34], [9, -36]], '#9E5A44'); rellena(g, [[8.5, -36], [14, -33.4], [14, -35.4], [8.5, -38]], '#5A3A2C'); // chimenea: el humo sale de su boca
  hueco(g, Hn, 'izq', .3, .7, 0, 5, '#3A1E14', true); g.fillStyle = 'rgba(240,140,50,.8)'; const fu = Hn.en('izq', .5, 1.6); g.beginPath(); g.ellipse(fu[0], fu[1], 1.6, 1, 0, 0, 7); g.fill();
  const R = caras(.6, .44, 12, .12, -.1), poste = e >= 2 ? '#4A4A4A' : K.maderaOsc;
  rellena(g, [P(R.f, R.a), P(R.f, R.b), P(R.t, R.b), P(R.t, R.a)], e === 3 ? '#B8B2A6' : '#BFA87C', null);
  for (const [r, c] of [[R.t, R.a], [R.t, R.b]]) { const p = P(r, c), q = P(r, c, 12); g.strokeStyle = poste; g.lineWidth = 1.2; g.beginPath(); g.moveTo(...p); g.lineTo(...q); g.stroke(); }
  const bn = P(.12, -.1, 0); rellena(g, [[bn[0] - 7, bn[1] - 3], [bn[0] + 6, bn[1] + 3.5], [bn[0] + 6, bn[1] + 1.5], [bn[0] - 7, bn[1] - 5]], e >= 2 ? '#8A8E92' : K.maderaLuz, K.contorno, .3);
  g.strokeStyle = poste; g.lineWidth = .7; for (const [dx, dy] of [[-6, -3], [5, 3]]) { g.beginPath(); g.moveTo(bn[0] + dx, bn[1] + dy - 1.5); g.lineTo(bn[0] + dx, bn[1] + dy + 2); g.stroke(); }
  for (const [dx, c] of [[-3, '#B5683A'], [0, '#C98A50'], [3, '#A55A30']]) { g.fillStyle = c; g.beginPath(); g.ellipse(bn[0] + dx, bn[1] - 5 + dx * .45, 1.3, 1.8, 0, 0, 7); g.fill(); }
  const lena = P(R.f - .04, R.b + .06); for (let k = 0; k < 4; k++) { g.strokeStyle = k % 2 ? '#7A5536' : '#5E4129'; g.lineWidth = 1.3; g.beginPath(); g.moveTo(lena[0] - 4, lena[1] - k * 1.2); g.lineTo(lena[0] + 3, lena[1] - k * 1.2 + 2); g.stroke(); }
  for (const [r, c] of [[R.f, R.a], [R.f, R.b]]) { const p = P(r, c), q = P(r, c, 12); g.strokeStyle = poste; g.lineWidth = 1.3; g.beginPath(); g.moveTo(...p); g.lineTo(...q); g.stroke(); }
  const T = caras(.6, .44, 0, .12, -.1, 12); dosAguas(g, T, 7, { hastial: e >= 2 ? '#8A8E92' : '#8A5A36', ...MAT[['paja', 'zincOxido', 'zinc', 'zinc'][e]] });
}
function recaudo(g, e) {
  const E = epoca(e, { muro: PIEDRA, zocalo: null, techo: 'tejaVieja', techo0: 'tejaVieja', muro3: '#DCE0E2' });
  const F = caras(.5, .5, e === 3 ? 26 : 18, -.04);
  sombraCasa(g, F); murosDe(g, F, E); if (e === 1) sillares(g, F);
  if (e === 3) { franjasVidrio(g, F, 2); puerta(g, F, 'izq', .5, .2, 8, '#4E7FA0', false); letrero(g, F, .5, 21.5, '#2F5D8A', 'IMPUESTOS'); }
  else {
    puerta(g, F, 'izq', .5, .2, 11, '#4A2D1A', true);
    g.fillStyle = '#2E2420'; for (const z of [3, 6, 9]) { const a = F.en('izq', .41, z), b = F.en('izq', .59, z); g.fillRect(Math.min(a[0], b[0]), Math.min(a[1], b[1]) - .3, Math.abs(b[0] - a[0]), .6 + Math.abs(b[1] - a[1])); }
    for (const u of [.17, .83]) ventana(g, F, 'izq', u, 7, .1, 6, '#3A3A3A', { ...E.vent, postigos: false });
    ventana(g, F, 'der', .5, 7, .14, 6, '#3A3A3A', { ...E.vent, postigos: false });
  }
  techoDe(g, F, 9, E, true);
  if (e === 1) escudo(g, ...F.en('izq', .5, 15.2), .9);
  if (e === 2) letrero(g, F, .5, 14.4, '#5A3A2A', 'RENTAS');
  if (e < 3) {
    const p = F.en('izq', .82, 13); g.strokeStyle = '#2E2A28'; g.lineWidth = .6; g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(p[0] + 5, p[1] + 2.5); g.moveTo(p[0] + 3.5, p[1] + 1.8); g.lineTo(p[0] + 3.5, p[1] + 4); g.moveTo(p[0] + 1.5, p[1] + 4); g.lineTo(p[0] + 5.5, p[1] + 4); g.stroke();
    g.fillStyle = '#C9A24A'; for (const dx of [1.5, 5.5]) { g.beginPath(); g.ellipse(p[0] + dx, p[1] + 5, 1.2, .5, 0, 0, 7); g.fill(); }
    const s = P(F.f + .14, F.a + .08); sacos(g, s[0], s[1]);
    const c = P(F.f + .14, F.b - .06); rellena(g, [[c[0] - 4, c[1] - 1], [c[0] + 3, c[1] + 2.5], [c[0] + 3, c[1] - 1.5], [c[0] - 4, c[1] - 5]], '#6E4529', K.contorno, .3); rellena(g, [[c[0] - 4, c[1] - 5], [c[0] + 3, c[1] - 1.5], [c[0] + 5, c[1] - 2.5], [c[0] - 2, c[1] - 6]], '#8A5A36', K.contorno, .3);
  }
}
function biblioteca(g, e) {
  const E = epoca(e, { muro: '#E6BFB0', zocalo: '#7A2A2A', techo: 'vidriada', techo0: 'tejaVieja', techo2: 'vidriada', muro3: '#EAD2C8' });
  const H = e === 0 ? 15 : e === 3 ? 30 : 24, F = caras(.62, .56, H, -.04);
  sombraCasa(g, F); arbolito(g, ...P(F.f + .16, F.b + .04), .85, '#5E8B42'); bancoMadera(g, ...P(F.f + .2, F.a + .2));
  murosDe(g, F, E);
  if (e === 3) { franjasVidrio(g, F, 3); puerta(g, F, 'izq', .5, .2, 8, '#4E7FA0', false); }
  else {
    hueco(g, F, 'izq', .4, .6, 0, 11, '#5A3A26', true);
    for (const u of [.15, .85]) hueco(g, F, 'izq', u - .06, u + .06, 3, 10, '#3A2A1E', true);
    if (H > 18) { for (const u of [.15, .5, .85]) hueco(g, F, 'izq', u - .06, u + .06, 14, 20, '#3A2A1E', true); balcon(g, F, .38, .62, 13.5, .1, '#2E2A28'); }
    for (const u of [.3, .7]) { hueco(g, F, 'der', u - .07, u + .07, 3, 10, '#3A2A1E', true); if (H > 18) hueco(g, F, 'der', u - .07, u + .07, 14, 20, '#3A2A1E', true); }
  }
  techoDe(g, F, 10, E, true);
  if (e >= 1) { const c = P(-.04, 0, H + 10 * (E.plano ? .3 : 1)); rellena(g, [[c[0] - 4, c[1] + 4], [c[0] + 4, c[1] + 4], [c[0] + 4, c[1] - 2], [c[0] - 4, c[1] - 2]], E.plano ? '#9DBCCC' : K.cal); for (const dx of [-2, 0, 2]) { g.fillStyle = '#3A2A1E'; g.fillRect(c[0] + dx - .5, c[1] - 1, 1, 3.4); } cupula(g, c[0], c[1] - 2, 4.6, 5, E.plano ? '#5E7F6E' : '#B9552F'); } // linterna (de vidrio en lo moderno)
  const l = F.en('izq', .5, e === 3 ? 9.5 : 12.6); g.fillStyle = '#F7F1E3'; g.beginPath(); g.moveTo(l[0] - 3, l[1]); g.quadraticCurveTo(l[0] - 1.5, l[1] - 1.6, l[0], l[1] - .6); g.quadraticCurveTo(l[0] + 1.5, l[1] - 1.6, l[0] + 3, l[1]); g.lineTo(l[0] + 3, l[1] + 1.2); g.lineTo(l[0] - 3, l[1] + 1.2); g.fill(); g.strokeStyle = '#8E2F22'; g.lineWidth = .4; g.stroke();
}
function teatro(g, e) {
  const muro = [OCRE, OCRE, '#E9C98C', '#E8E2D6'][e];
  const F = caras(.74, .7, e === 0 ? 18 : 26, -.04), Ht = F.H;
  sombraCasa(g, F);
  const S = caras(.6, .5, Ht - 2, -.12); dosAguas(g, S, 10, { hastial: '#D9B878', ...MAT[['paja', 'teja', 'zinc', 'zinc'][e]] });
  muros(g, F, muro, e === 3 ? '#5E6670' : '#8E6A3A');
  arcada(g, F, 'izq', 3, 0, 11, .08, .92, e === 3 ? '#3A3A44' : '#5A3A26');
  if (Ht > 20) { for (let k = 0; k < 3; k++) { const u = .08 + (k + .5) * .84 / 3; hueco(g, F, 'izq', u - .07, u + .07, 15, 22, '#3A2A1E', true); } balcon(g, F, .08, .92, 14.5, .08, '#2E2A28'); }
  arcada(g, F, 'der', 3, 4, 8, .1, .9, '#5A3A26');
  const a = F.en('izq', 0, Ht), b = F.en('izq', 1, Ht), d = F.en('der', 1, Ht);
  rellena(g, [a, b, [b[0], b[1] - 3], [a[0], a[1] - 3]], mezcla(muro, '#FFFFFF', .2)); rellena(g, [b, d, [d[0], d[1] - 3], [b[0], b[1] - 3]], mezcla(muro, '#000000', .12));
  g.strokeStyle = 'rgba(90,60,30,.5)'; g.lineWidth = .4; for (let k = 1; k < 14; k++) { const p = F.en('izq', k / 14, Ht + .4); g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(p[0], p[1] - 2.2); g.stroke(); }
  const m = F.en('izq', .5, Ht + 3); rellena(g, [[m[0] - 7, m[1] + 4], [m[0] + 7, m[1] + 4], [m[0] + 5, m[1] - 2], [m[0], m[1] - 5], [m[0] - 5, m[1] - 2]], mezcla(muro, '#FFFFFF', .2));
  g.strokeStyle = '#8E6A3A'; g.lineWidth = .6; g.beginPath(); g.moveTo(m[0] - 1.6, m[1] + 2); g.quadraticCurveTo(m[0] - 2.4, m[1] - 2, m[0], m[1] - 1.6); g.quadraticCurveTo(m[0] + 2.4, m[1] - 2, m[0] + 1.6, m[1] + 2); g.closePath(); g.stroke(); // lira
  if (e >= 2) { // marquesina con su letrero (luminoso en lo moderno) y carteles
    const z = 12; rellena(g, [F.en('izq', .2, z), F.en('izq', .8, z), [F.en('izq', .8, z)[0] - 3, F.en('izq', .8, z)[1] + 4], [F.en('izq', .2, z)[0] - 3, F.en('izq', .2, z)[1] + 4]], e === 3 ? '#2E2A28' : '#5A3A26');
    const t = F.en('izq', .5, z + 2.4); rellena(g, [[t[0] - 9, t[1] + 2.6], [t[0] + 9, t[1] + 7], [t[0] + 9, t[1] + 3], [t[0] - 9, t[1] - 1.4]], e === 3 ? '#F2D27A' : '#E7C76B', K.contorno, .3);
    for (const u of [.3, .7]) { const p = F.en('der', u, 4); rellena(g, [[p[0] - 2, p[1]], [p[0] + 2, p[1] - 2], [p[0] + 2, p[1] - 8], [p[0] - 2, p[1] - 6]], u < .5 ? '#B9442F' : '#2F6E8E', K.contorno, .3); }
  }
  for (const u of [0, 1]) { const p = F.en('izq', u, 0); farol(g, p[0] + (u ? -3 : 3), p[1] + 5, 11); }
}
function policia(g, e) {
  const E = epoca(e, { muro: '#F4F1E8', zocalo: '#4E5A34', techo: 'zincVerde', techo0: 'paja', techo2: 'zincVerde', muro2: '#F4F1E8', zocalo2: '#4E5A34', muro3: '#EFF1EA', zocalo3: '#4E5A34' });
  const F = caras(.6, .44, e === 3 ? 24 : 15, -.08);
  sombraCasa(g, F); murosDe(g, F, E);
  for (const cara of ['izq', 'der']) rellena(g, [F.en(cara, 0, 8), F.en(cara, 1, 8), F.en(cara, 1, 9.4), F.en(cara, 0, 9.4)], '#4E5A34', null); // franja verde
  puerta(g, F, 'izq', .4, .15, 10, e === 3 ? '#4E5A34' : '#2F5D8A', e < 2); ventana(g, F, 'izq', .78, 4, .1, 6, '#2F5D8A', E.vent); ventana(g, F, 'der', .5, 4, .16, 6, '#2F5D8A', E.vent);
  if (e === 3) { fila(g, F, 'izq', 3, 14, .1, 6, E); ventana(g, F, 'der', .5, 14, .16, 6, '#2F5D8A', E.vent); }
  techoDe(g, F, 9, E);
  letrero(g, F, .4, 11.5, '#2F5D8A', 'POLICÍA');
  const G = caras(.13, .13, 12, F.f + .14, F.a - .02);
  if (e === 0) { g.strokeStyle = '#8FAE4A'; g.lineWidth = 1.2; for (const [r, c] of [[G.f, G.a], [G.f, G.b], [G.t, G.b]]) { const p = P(r, c), q = P(r, c, 10); g.beginPath(); g.moveTo(...p); g.lineTo(...q); g.stroke(); } piramide(g, { ...G, H: 10 }, 5, MAT.paja.teja); } // garita de guadua y paja
  else { muros(g, G, '#E8E2D2', '#4E5A34'); hueco(g, G, 'izq', .2, .8, 0, 8, '#3A2A1E'); piramide(g, G, 5, '#4E5A34'); }
  const f = P(F.f + .12, F.b + .04); farol(g, f[0], f[1], 13);
  if (e === 3) { const p = P(F.f + .26, F.a + .4); carro(g, p[0], p[1], '#E8ECE4', '#4E5A34'); antena(g, ...P(F.t + .1, F.b - .1, F.H + 2), 18); } // patrulla y antena de radio
}
function cuartel(g, e) {
  if (e === 0) { // empalizada de guadua con la casa de mando de paja
    const F = caras(.9, .56, 11, -.04, .02);
    const M = caras(.36, .3, 11, -.12, -.1); muros(g, M, '#EDE4D2', '#8A6A48'); bahareque(g, M); hueco(g, M, 'izq', .4, .6, 0, 8, '#3A2A1E'); dosAguas(g, M, 8, MAT.paja);
    for (const [p, q] of [[[F.f, F.a], [F.f, F.b]], [[F.f, F.b], [F.t, F.b]]]) for (let k = 0; k <= 22; k++) { const t = k / 22, r = p[0] + (q[0] - p[0]) * t, c = p[1] + (q[1] - p[1]) * t; if (p[0] === q[0] && t > .58 && t < .74) continue; const a = P(r, c), b = P(r, c, 10 + (k % 2) * 1.2); g.strokeStyle = k % 2 ? '#8FAE4A' : '#7E9A3E'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); }
    const b = P(F.f - .08, F.a + .08, 0); bandera(g, b[0], b[1], 22, TRICOLOR); return;
  }
  const muro = ['', '#D8C49B', K.ladrillo, '#B8B4AA'][e];
  const F = caras(.9, .56, e === 3 ? 13 : 15, -.04, .02);
  sombraCasa(g, F); muros(g, F, muro, null, { ladrillo: e === 2 }); if (e === 1) sillares(g, F);
  hueco(g, F, 'izq', .58, .76, 0, 11, '#3A2A1E', e < 3); hueco(g, F, 'izq', .59, .67, 0, 10, e === 3 ? '#5E6670' : '#6E4529'); hueco(g, F, 'izq', .67, .75, 0, 10, e === 3 ? '#5E6670' : '#6E4529');
  for (const u of [.12, .24, .36, .88]) hueco(g, F, 'izq', u - .012, u + .012, 6, 11, '#2E2420');
  for (const u of [.3, .7]) hueco(g, F, 'der', u - .02, u + .02, 6, 11, '#2E2420');
  azotea(g, F, mezcla(muro, '#000000', .12));
  if (e < 3) almenas(g, F, muro, 9);
  else { g.strokeStyle = '#5A5A5A'; g.lineWidth = .4; for (const [p, q] of [[F.en('izq', 0, 13.5), F.en('izq', 1, 13.5)], [F.en('der', 0, 13.5), F.en('der', 1, 13.5)]]) { g.beginPath(); for (let k = 0; k <= 30; k++) { const t = k / 30; g.lineTo(p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t - (k % 2) * 1.2); } g.stroke(); } } // alambre de púas
  if (e < 3) { const T = caras(.22, .22, 26, F.f - .08, F.a + .08); muros(g, T, mezcla(muro, '#000000', .05), null, { ladrillo: e === 2 }); if (e === 1) sillares(g, T); hueco(g, T, 'izq', .35, .65, 17, 21, '#2E2420', true); azotea(g, T, mezcla(muro, '#000000', .15)); almenas(g, T, muro, 3); }
  else { const t = P(F.f - .08, F.a + .08); g.strokeStyle = '#6E6E6E'; g.lineWidth = .9; for (const dx of [-3, 3]) { g.beginPath(); g.moveTo(t[0] + dx, t[1]); g.lineTo(t[0] + dx * .5, t[1] - 26); g.stroke(); } rellena(g, [[t[0] - 4, t[1] - 26], [t[0] + 4, t[1] - 26], [t[0] + 4, t[1] - 31], [t[0] - 4, t[1] - 31]], '#8A8E92'); rellena(g, [[t[0] - 5, t[1] - 31], [t[0] + 5, t[1] - 31], [t[0], t[1] - 34]], '#5E6670'); } // torre de vigilancia
  const b = P(F.f - .08, F.a + .08, e === 3 ? 34 : 28.6); bandera(g, b[0], b[1], 14, TRICOLOR);
  const c = P(F.f + .16, F.a + .36);
  if (e === 3) carro(g, c[0] + 4, c[1], '#6E7A52', '#4E5A34'); // jeep
  else { g.fillStyle = '#3A3A3A'; g.beginPath(); g.ellipse(c[0] - 2, c[1] - 3, 5, 1.6, -.45, 0, 7); g.fill(); g.strokeStyle = K.maderaOsc; g.lineWidth = .9; g.beginPath(); g.ellipse(c[0] + 1, c[1] - 1.6, 1.8, 2, 0, 0, 7); g.stroke(); }
}
function bancoEdificio(g, e) {
  if (e === 3) { // torre de vidrio
    const F = caras(.5, .5, 52, -.04);
    sombraCasa(g, F); muros(g, F, '#C9CDD0', null);
    for (let p = 0; p < 5; p++) for (const cara of ['izq', 'der']) rellena(g, [F.en(cara, .05, 3 + p * 10), F.en(cara, .95, 3 + p * 10), F.en(cara, .95, 10 + p * 10), F.en(cara, .05, 10 + p * 10)], cara === 'izq' ? '#7FA6BC' : '#5E86A0', K.contorno, .25);
    azotea(g, F, '#A8ADB0'); antena(g, ...P(F.t + .1, F.b - .1, 52), 12);
    const l = F.en('izq', .5, 1); rellena(g, [[l[0] - 5, l[1] - 2], [l[0] + 5, l[1] + 3], [l[0] + 5, l[1] - 2], [l[0] - 5, l[1] - 7]], '#2E3A44');
    letrero(g, F, .5, 11.5, '#C9A24A', 'BANCO'); return;
  }
  const muro = ['#EDE4D2', '#F4EEE2', '#E6DCC6'][e];
  const F = caras(.66, .62, e === 0 ? 15 : 24, -.02);
  sombraCasa(g, F); muros(g, F, muro, e === 2 ? '#6E6658' : '#5A3A2A'); if (e === 2) sillares(g, F); if (e === 0) bahareque(g, F);
  for (const u of [.18, .42]) hueco(g, F, 'izq', u - .06, u + .06, 3, 11, '#3A3A3A', true);
  if (F.H > 18) for (const u of [.18, .42]) hueco(g, F, 'izq', u - .05, u + .05, 14, 20, '#3A3A3A', true);
  for (const u of [.3, .7]) { hueco(g, F, 'der', u - .06, u + .06, 3, 11, '#3A3A3A', true); if (F.H > 18) hueco(g, F, 'der', u - .05, u + .05, 14, 20, '#3A3A3A', true); }
  hueco(g, F, 'izq', .74, .96, 0, 11, '#2E2A28', true);
  if (e === 2) {
    for (const u of [.72, .98]) { const p = F.en('izq', u, 0); rellena(g, [[p[0] - 1.3, p[1]], [p[0] + 1.3, p[1]], [p[0] + 1.1, p[1] - 14], [p[0] - 1.1, p[1] - 14]], '#F4EEE2', K.contorno, .35); }
    azotea(g, F, '#CFC5AE');
    const z = F.z0 + F.H; rellena(g, [P(F.f, F.a, z), P(F.f, F.b, z), P(F.f, F.b, z + 2.4), P(F.f, F.a, z + 2.4)], '#F0E8D6'); rellena(g, [P(F.f, F.b, z), P(F.t, F.b, z), P(F.t, F.b, z + 2.4), P(F.f, F.b, z + 2.4)], '#CFC5AE');
    const c = F.en('izq', .85, 26); cupula(g, c[0], c[1], 9, 13, '#5E7F6E');
  } else { cuatroAguas(g, F, 9, e === 0 ? MAT.tejaVieja : MAT.teja); const p = F.en('izq', .85, 13); rellena(g, [[p[0] - 3, p[1]], [p[0] + 3, p[1] + 1.5], [p[0] + 3, p[1] - 3.5], [p[0] - 3, p[1] - 5]], '#3A3A3A', K.contorno, .3); } // casa de cambio con su caja fuerte pintada
  const l = F.en('izq', .3, F.H - 1.5); g.save(); g.fillStyle = '#8A6A2A'; g.font = 'bold 3px serif'; g.textAlign = 'center'; g.fillText(e === 2 ? 'BANCO' : 'CAMBIO', l[0], l[1] + .5); g.restore();
}
function universidad(g, e) {
  const E = epoca(e, { muro: K.cal, zocalo: '#8E2F22', techo: 'teja', techo0: 'tejaVieja', muro3: '#E8E4DA', zocalo3: '#8E2F22' });
  const F = caras(.92, .7, e === 3 ? 30 : 24, -.04);
  sombraCasa(g, F); murosDe(g, F, E);
  if (e === 3) franjasVidrio(g, F, 3);
  else { arcada(g, F, 'izq', 7, 0, 8.5, .03, .97, '#5A4A3C'); balcon(g, F, .03, .97, 12.5, .1); fila(g, F, 'izq', 7, 14, .05, 6, { ...E, carp: e === 2 ? '#F4EEE2' : '#8E2F22' }, .03, .97); arcada(g, F, 'der', 4, 0, 8.5, .05, .95, '#5A4A3C'); fila(g, F, 'der', 4, 14, .08, 6, { ...E, carp: '#8E2F22' }, .05, .95); }
  techoDe(g, F, 12, E);
  const T = caras(.2, .2, 18, F.f - .12, 0, F.H); muros(g, T, e === 2 ? '#F2ECE0' : e === 3 ? '#F4F1E8' : K.cal, null);
  if (e === 0) { hueco(g, T, 'izq', .25, .75, 6, 14, '#2E2420', true); const m = T.en('izq', .5, 10); g.fillStyle = '#C9A24A'; g.beginPath(); g.moveTo(m[0] - 1.5, m[1] + 2); g.quadraticCurveTo(m[0], m[1] - 2.4, m[0] + 1.5, m[1] + 2); g.fill(); piramide(g, T, 8, MAT.tejaVieja.teja); } // colegio mayor: campanario
  else { reloj(g, ...T.en('izq', .5, 11), 3); hueco(g, T, 'der', .3, .7, 8, 14, '#3A2A1E', true); const c = P(F.f - .12, 0, F.H + 18); cupula(g, c[0], c[1] + 2, 6.6, 10, e === 3 ? '#5E7F6E' : '#B9552F'); }
  const b = P(F.f + .28, F.b - .04); bandera(g, b[0], b[1], 20, TRICOLOR);
}
function acueducto(g, e) {
  if (e === 0) { // canal de guadua sobre un caballete de palos cruzados, que vierte en una pila de piedra
    const z = 11, a = (t, h = 0) => P(.05, -.47 + .94 * t, h);
    g.lineCap = 'round'; g.strokeStyle = K.maderaOsc;
    for (let k = 0; k < 5; k++) { const t0 = k / 5, t1 = (k + 1) / 5; g.lineWidth = .9; g.beginPath(); g.moveTo(...a(t0, 1)); g.lineTo(...a(t1, z - 3)); g.moveTo(...a(t1, 1)); g.lineTo(...a(t0, z - 3)); g.stroke(); }
    for (let k = 0; k <= 5; k++) { const t = k / 5; g.lineWidth = 1.7; g.beginPath(); g.moveTo(...a(t, 0)); g.lineTo(...a(t, z - 1.5)); g.stroke(); }
    g.lineWidth = 1.2; g.beginPath(); g.moveTo(...a(0, 4.5)); g.lineTo(...a(1, 4.5)); g.stroke();
    caja(g, .98, .13, 2.8, .05, 0, z - 1.6, '#8FAE4A');
    rellena(g, [P(.05 + .035, -.47, z + 1.25), P(.05 + .035, .47, z + 1.25), P(.05 - .035, .47, z + 1.25), P(.05 - .035, -.47, z + 1.25)], '#7FB3C4', null);
    g.strokeStyle = 'rgba(255,255,255,.65)'; g.lineWidth = .4; for (let k = 0; k < 5; k++) { g.beginPath(); g.moveTo(...a(.08 + k * .2, z + 1.35)); g.lineTo(...a(.15 + k * .2, z + 1.35)); g.stroke(); }
  } else if (e === 3) { // tanque elevado de concreto con su tubería
    const T = caras(.3, .3, 10, -.1, -.1, 22); g.strokeStyle = '#8A8E92'; g.lineWidth = 1.6; for (const [r, c] of [[T.f, T.a], [T.f, T.b], [T.t, T.b]]) { const p = P(r, c), q = P(r, c, 22); g.beginPath(); g.moveTo(...p); g.lineTo(...q); g.stroke(); }
    muros(g, T, '#D6D2CA', null); azotea(g, T, '#BDB8AE'); letrero(g, T, .5, 4, '#2F5D8A', 'AGUA');
    g.strokeStyle = '#6E7378'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(...P(-.1, .05, 22)); g.lineTo(...P(-.1, .05, 1)); g.lineTo(...P(.3, .4, 1)); g.stroke();
  } else {
    const F = caras(.94, .16, 15, .05, 0), muro = e === 2 ? K.ladrillo : PIEDRA;
    g.save(); g.globalAlpha = .2; g.fillStyle = '#3A2A1C'; poli(g, [P(F.f, F.a), P(F.f + .14, F.a + .2), P(F.f + .14, F.b + .2), P(F.t + .14, F.b + .2), P(F.t, F.b)]); g.fill(); g.restore();
    muros(g, F, muro, null, { ladrillo: e === 2 }); if (e === 1) sillares(g, F);
    arcada(g, F, 'izq', 4, 0, 10, .02, .98, 'rgba(110,140,90,.55)');
    const z = 15; rellena(g, [P(F.f, F.a, z), P(F.f, F.b, z), P(F.t, F.b, z), P(F.t, F.a, z)], mezcla(muro, '#000000', .2));
    rellena(g, [P(F.f - .03, F.a, z + .2), P(F.f - .03, F.b, z + .2), P(F.t + .03, F.b, z + .2), P(F.t + .03, F.a, z + .2)], '#6FA6BC', null);
    g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = .4; for (let k = 1; k < 6; k++) { const a = P(.05, F.a + k * .16, z + .3), b = P(.05, F.a + k * .16 + .06, z + .3); g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); }
  }
  // Pila con su chorro, al pie del extremo derecho (en lo moderno, un grifo público).
  const p = P(.36, .4); g.fillStyle = PIEDRA_OSC; g.beginPath(); g.ellipse(p[0], p[1], 8, 3.4, 0, 0, 7); g.fill(); g.fillStyle = e === 3 ? '#D6D2CA' : PIEDRA; g.beginPath(); g.ellipse(p[0], p[1] - 2, 8, 3.4, 0, 0, 7); g.fill();
  g.fillStyle = '#7FB3C4'; g.beginPath(); g.ellipse(p[0], p[1] - 2.2, 6.4, 2.5, 0, 0, 7); g.fill();
  const q = e === 0 ? P(.05, .47, 11) : e === 3 ? P(.3, .4, 6) : P(.13, .47, 14); g.strokeStyle = 'rgba(200,230,240,.9)'; g.lineWidth = .9; g.beginPath(); g.moveTo(q[0], q[1]); g.quadraticCurveTo(q[0] + 2, q[1] + 6, p[0] + 2, p[1] - 3); g.stroke();
}
function molino(g, e) {
  const F = caras(.5, .46, 16, -.06, .1);
  sombraCasa(g, F);
  if (e === 3) { // pequeña central hidroeléctrica: casa de máquinas, tubería de presión y transformador
    muros(g, F, '#D6D2CA', '#8A8478'); franjasVidrio(g, F, 1); azotea(g, F, '#BDB8AE');
    g.strokeStyle = '#6E7378'; g.lineWidth = 3; g.beginPath(); g.moveTo(...P(F.t - .2, F.a - .1, 22)); g.lineTo(...P(F.f - .1, F.a - .1, 4)); g.stroke();
    const tr = P(F.f + .16, F.b - .06); rellena(g, [[tr[0] - 3, tr[1]], [tr[0] + 3, tr[1] + 1.5], [tr[0] + 3, tr[1] - 6], [tr[0] - 3, tr[1] - 7.5]], '#8A8E92'); g.strokeStyle = '#3A3A3A'; g.lineWidth = .5; g.beginPath(); g.moveTo(tr[0], tr[1] - 7); g.lineTo(tr[0], tr[1] - 14); g.moveTo(tr[0] - 3, tr[1] - 13); g.lineTo(tr[0] + 3, tr[1] - 13); g.stroke();
    return;
  }
  muros(g, F, e === 2 ? K.ladrillo : PIEDRA, null, { ladrillo: e === 2 }); if (e < 2) sillares(g, F);
  puerta(g, F, 'izq', .62, .2, 10, MADERA); ventana(g, F, 'der', .5, 7, .14, 5, MADERA, e === 2 ? { marco: '#F4EEE2' } : {});
  dosAguas(g, F, 9, MAT[['paja', 'tejaVieja', 'zinc'][e]]);
  const a = P(F.t - .1, F.a - .12, 17), b = P(F.f - .14, F.a - .12, 17); g.strokeStyle = e === 2 ? '#5E6670' : MADERA; g.lineWidth = 2.6; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); g.strokeStyle = '#7FB3C4'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke();
  const c = P(F.f - .12, F.a - .14, 9); rueda(g, c[0], c[1], 10);
  const s = P(F.f + .16, F.b - .04); sacos(g, s[0], s[1]);
}
function vapor(g, x, y) { // vapor de rueda del Magdalena
  rellena(g, [[x - 18, y - 9], [x + 12, y + 6], [x + 14, y + 4], [x - 15, y - 11]], '#F4F1E8');
  rellena(g, [[x - 15, y - 11], [x + 14, y + 4], [x + 14, y - 1], [x - 15, y - 16]], '#E6E0D2'); rellena(g, [[x - 15, y - 16], [x + 14, y - 1], [x + 16, y - 2], [x - 13, y - 17]], '#B9442F');
  for (let k = 0; k < 5; k++) { const p = [x - 12 + k * 5.5, y - 13 + k * 2.6]; g.fillStyle = '#3A2A1E'; g.fillRect(p[0], p[1], 1.6, 2.2); }
  rellena(g, [[x - 2, y - 15], [x + 1, y - 13.6], [x + 1, y - 26], [x - 2, y - 27.4]], '#2E2A28');
  g.strokeStyle = K.maderaOsc; g.lineWidth = .8; g.beginPath(); g.ellipse(x - 16, y - 7, 2.4, 4.8, -.4, 0, 7); g.stroke();
}
function lancha(g, x, y) { rellena(g, [[x - 10, y - 5], [x + 6, y + 3], [x + 9, y + 1], [x - 7, y - 7]], '#F4F1E8'); rellena(g, [[x - 4, y - 5], [x + 3, y - 1.5], [x + 3, y - 4.5], [x - 4, y - 8]], '#2F5D8A'); g.fillStyle = '#3A3A3A'; g.fillRect(x - 11, y - 6, 2, 3); }
function puerto(g, e) {
  // Embarcadero de guadua, bodega con muelle y champán, muelle de vapor y muelle de concreto con lanchas.
  const F = caras(.5, .42, e === 0 ? 10 : 14, -.16, .16);
  sombraCasa(g, F);
  if (e === 0) { const R = F; for (const [r, c] of [[R.t, R.a], [R.t, R.b], [R.f, R.a], [R.f, R.b]]) { const p = P(r, c), q = P(r, c, 10); g.strokeStyle = '#8FAE4A'; g.lineWidth = 1.3; g.beginPath(); g.moveTo(...p); g.lineTo(...q); g.stroke(); } sacos(g, ...P(-.16, .16)); dosAguas(g, F, 6, { ...MAT.paja, hastial: 'rgba(0,0,0,0)' }); }
  else {
    muros(g, F, e === 2 ? K.ladrillo : e === 3 ? '#D6D2CA' : K.cal, e === 3 ? '#8A8478' : '#6E4529', { ladrillo: e === 2 });
    hueco(g, F, 'izq', .3, .7, 0, 10, e === 3 ? '#5E6670' : '#3A2A1E'); ventana(g, F, 'der', .5, 5, .14, 5, '#6E4529', e >= 2 ? { marco: '#F4EEE2' } : {});
    if (e === 3) azotea(g, F, '#BDB8AE'); else dosAguas(g, F, 7, MAT.zinc);
  }
  const piso = e === 3 ? '#B8B4AA' : e === 0 ? '#9FB25A' : '#9B7650';
  g.strokeStyle = e === 3 ? '#8A8478' : K.maderaOsc; g.lineWidth = 1; for (const [r, c] of [[.12, -.48], [.3, -.48], [.12, -.2], [.3, -.2]]) { const p = P(r, c, -2), q = P(r, c, 2.2); g.beginPath(); g.moveTo(...p); g.lineTo(...q); g.stroke(); }
  rellena(g, [P(.1, -.5, 2.2), P(.1, .05, 2.2), P(.32, .05, 2.2), P(.32, -.5, 2.2)], piso);
  if (e < 3) { g.strokeStyle = 'rgba(60,40,25,.5)'; g.lineWidth = .35; for (let k = 1; k < 9; k++) { const c = -.5 + k * .06, a = P(.1, c, 2.3), b = P(.32, c, 2.3); g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); } }
  const c = P(.42, -.42); if (e === 2) vapor(g, c[0], c[1]); else if (e === 3) lancha(g, c[0], c[1]); else canoa(g, c[0], c[1]);
  if (e === 3) { const gr = P(.2, -.42, 2.2); g.strokeStyle = '#E7B23C'; g.lineWidth = 1; g.beginPath(); g.moveTo(gr[0], gr[1]); g.lineTo(gr[0], gr[1] - 20); g.lineTo(gr[0] + 12, gr[1] - 20); g.stroke(); g.strokeStyle = '#3A3A3A'; g.lineWidth = .4; g.beginPath(); g.moveTo(gr[0] + 11, gr[1] - 20); g.lineTo(gr[0] + 11, gr[1] - 10); g.stroke(); } // grúa
  const s = P(.2, -.1, 2.2); sacos(g, s[0], s[1]);
}

// ---------- Sede del gobierno según el régimen (y la época) ----------
// En el bahareque, todas son una casa de un piso con su señal; en el concreto, edificios de varios pisos con vidrio.
function sedeModerna(g, muro, zocalo, op = {}) {
  const F = caras(.84, .56, 34, -.04);
  sombraCasa(g, F); muros(g, F, muro, zocalo); franjasVidrio(g, F, 3);
  puerta(g, F, 'izq', .5, .2, 8, '#4E7FA0', false); terraza(g, F, muro);
  return F;
}
function sedeBahareque(g, techo, carp) {
  const F = caras(.74, .46, 15, -.06);
  sombraCasa(g, F); muros(g, F, '#EDE4D2', '#8A6A48'); bahareque(g, F);
  puerta(g, F, 'izq', .5, .16, 10, carp); fila(g, F, 'izq', 4, 4, .07, 6, { carp, vent: {} }, .1, .9); ventana(g, F, 'der', .5, 4, .16, 6, carp, {});
  dosAguas(g, F, 9, MAT[techo]);
  return F;
}
function cabildo(g, e) { // república: casa consistorial de portales
  if (e === 0) { const F = sedeBahareque(g, 'paja', '#2F5D8A'); const f = P(F.f + .2, F.b - .1); bandera(g, f[0], f[1], 22, TRICOLOR); return; }
  if (e === 3) { const F = sedeModerna(g, '#F2ECE0', '#8E2F22'); letrero(g, F, .5, 9.5, '#8E2F22', 'ALCALDÍA'); escudo(g, ...F.en('izq', .5, 31), .9); const f = P(F.t + .1, F.b - .1, 36); bandera(g, f[0], f[1], 16, TRICOLOR); return; }
  const F = caras(.92, .5, 26, -.04), muro = e === 2 ? '#F4EEE2' : K.cal;
  sombraCasa(g, F); muros(g, F, muro, '#8E2F22');
  arcada(g, F, 'izq', 5, 0, 9.5, .04, .96, '#4A3A2C');
  for (let k = 0; k < 5; k++) ventana(g, F, 'izq', .04 + (k + .5) * .92 / 5, 15, .07, 7, '#2F5D8A', e === 2 ? { marco: '#E6D6B0' } : {});
  balcon(g, F, .04, .96, 14, .14, e === 2 ? '#2E2A28' : undefined);
  arcada(g, F, 'der', 2, 0, 9.5, .1, .9); ventana(g, F, 'der', .5, 15, .14, 7, '#2F5D8A');
  dosAguas(g, F, 12, e === 2 ? MAT.tejaParda : {});
  const a = F.en('izq', .4, 26), b = F.en('izq', .6, 26), m = F.en('izq', .5, 36);
  rellena(g, [a, b, [b[0], b[1] - 4], m, [a[0], a[1] - 4]], muro); reloj(g, m[0], m[1] + 4.6, 2.6);
  escudo(g, ...F.en('izq', .5, 22.5), .8);
  const f = P(F.t + .1, F.b - .1, 38); bandera(g, f[0], f[1], 16, TRICOLOR);
}
function palacio(g, e) { // monarquía: palacio con dos torreones y portada de piedra coronada
  const corona = p => { g.fillStyle = '#C9A24A'; g.beginPath(); g.moveTo(p[0] - 3.5, p[1]); g.lineTo(p[0] - 3.5, p[1] - 3); g.lineTo(p[0] - 1.7, p[1] - 1.6); g.lineTo(p[0], p[1] - 4); g.lineTo(p[0] + 1.7, p[1] - 1.6); g.lineTo(p[0] + 3.5, p[1] - 3); g.lineTo(p[0] + 3.5, p[1]); g.closePath(); g.fill(); };
  if (e === 0) { const F = sedeBahareque(g, 'tejaVieja', '#5A3A6A'); corona(F.en('izq', .5, 12.5)); const f = P(F.f + .2, F.b - .1); bandera(g, f[0], f[1], 22, ['#5A3A6A', '#C9A24A']); return; }
  if (e === 3) { const F = sedeModerna(g, '#ECE4F0', '#5A3A6A'); corona(F.en('izq', .5, 31)); const f = P(F.t + .1, F.b - .1, 36); bandera(g, f[0], f[1], 16, ['#5A3A6A', '#C9A24A']); return; }
  const F = caras(.84, .56, 26, -.04), muro = e === 2 ? '#E6DCC6' : '#EFE6D2';
  sombraCasa(g, F); muros(g, F, muro, '#5A3A6A'); if (e === 2) sillares(g, F);
  const pa = F.en('izq', .38, 0), pb = F.en('izq', .62, 0); rellena(g, [pa, pb, F.en('izq', .62, 22), F.en('izq', .5, 25), F.en('izq', .38, 22)], PIEDRA); hueco(g, F, 'izq', .43, .57, 0, 12, '#5A3A26', true);
  balcon(g, F, .4, .6, 14, .1, '#C9A24A');
  for (const u of [.24, .76]) { ventana(g, F, 'izq', u, 5, .07, 7, '#5A3A6A'); ventana(g, F, 'izq', u, 15, .07, 7, '#5A3A6A'); }
  ventana(g, F, 'der', .5, 5, .14, 7, '#5A3A6A'); ventana(g, F, 'der', .5, 15, .14, 7, '#5A3A6A');
  cuatroAguas(g, F, 10, MAT.pizarra);
  for (const c of [F.a + .09, F.b - .09]) { const T = caras(.18, .18, 34, F.f - .08, c); muros(g, T, mezcla(muro, '#000000', .05), '#5A3A6A'); ventana(g, T, 'izq', .5, 22, .3, 6, '#5A3A6A', { postigos: false }); if (e === 2) { const q = P(F.f - .08, c, 34); cupula(g, q[0], q[1] + 1, 5, 9, '#5E646C'); } else piramide(g, T, 12, MAT.pizarra.teja); }
  corona(F.en('izq', .5, 26.5));
  const f = P(F.f - .08, F.b - .09, 46); bandera(g, f[0], f[1], 12, ['#5A3A6A', '#C9A24A']);
}
function casona(g, e) { // aristocracia: casona señorial en L con portón y escudo de armas
  if (e === 0) { const F = sedeBahareque(g, 'tejaVieja', '#3E6B4A'); escudo(g, ...F.en('izq', .5, 12.5), .8); materas(g, [P(F.f + .1, F.a + .06)]); return; }
  if (e === 3) { const F = sedeModerna(g, '#CFDDE4', '#3E6B4A'); escudo(g, ...F.en('izq', .5, 31), 1); materas(g, [P(F.f + .1, F.a + .06), P(F.f + .1, F.a + .2)]); return; }
  const F = caras(.62, .46, 25, -.1, -.12), W = caras(.3, .62, 15, -.02, .34), muro = e === 2 ? '#C9B8D6' : '#BFD3DC';
  sombraCasa(g, F); sombraCasa(g, W);
  muros(g, W, K.cal, '#3E6B4A'); for (const u of [.3, .7]) ventana(g, W, 'der', u, 4, .12, 6, '#3E6B4A'); ventana(g, W, 'izq', .5, 4, .3, 6, '#3E6B4A'); dosAguas(g, W, 8, e === 2 ? MAT.tejaParda : {});
  muros(g, F, muro, '#3E6B4A');
  rellena(g, [F.en('izq', .36, 0), F.en('izq', .64, 0), F.en('izq', .64, 13), F.en('izq', .36, 13)], PIEDRA); hueco(g, F, 'izq', .4, .6, 0, 11, '#4A2D1A', true);
  for (const u of [.15, .85]) ventana(g, F, 'izq', u, 4, .08, 6, '#3E6B4A');
  for (const u of [.2, .5, .8]) ventana(g, F, 'izq', u, 15, .08, 6.5, '#3E6B4A', e === 2 ? { marco: '#F4EEE2' } : {});
  balcon(g, F, .06, .94, 14, .14, e === 2 ? '#2E2A28' : undefined); ventana(g, F, 'der', .5, 15, .2, 6.5, '#3E6B4A'); ventana(g, F, 'der', .5, 4, .2, 6, '#3E6B4A');
  dosAguas(g, F, 11, e === 2 ? MAT.tejaParda : {});
  escudo(g, ...F.en('izq', .5, 16.4), 1.15);
  materas(g, [P(F.f + .1, F.a + .06), P(F.f + .1, F.a + .2)]);
  bancoMadera(g, ...P(.38, .28));
}
function fortaleza(g, e) { // tiranía: fortaleza oscura con almenas y torre del homenaje
  if (e === 0) { // palenque: empalizada alta y casa fuerte
    const F = caras(.8, .6, 13, -.02);
    const M = caras(.34, .3, 13, -.14, -.12); muros(g, M, '#8E877C', null); hueco(g, M, 'izq', .4, .6, 0, 8, '#1E1A18'); dosAguas(g, M, 8, MAT.tejaVieja);
    for (const [p, q] of [[[F.f, F.a], [F.f, F.b]], [[F.f, F.b], [F.t, F.b]]]) for (let k = 0; k <= 22; k++) { const t = k / 22, r = p[0] + (q[0] - p[0]) * t, c = p[1] + (q[1] - p[1]) * t; if (p[0] === q[0] && t > .4 && t < .6) continue; const a = P(r, c), b = P(r, c, 13 + (k % 2) * 1.6); g.strokeStyle = k % 2 ? '#5E4129' : '#4A3220'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); }
    const f = P(-.14, -.12, 21); bandera(g, f[0], f[1], 14, ['#1E1A18', '#9C2F25']); return;
  }
  const muro = ['', '#8E877C', '#7A5A4A', '#7E7E7A'][e];
  const F = caras(.8, .6, 18, -.02);
  sombraCasa(g, F); muros(g, F, muro, null, { ladrillo: e === 2 }); if (e !== 2) sillares(g, F);
  hueco(g, F, 'izq', .4, .6, 0, 12, '#1E1A18', e < 3); g.strokeStyle = '#4A4440'; g.lineWidth = .6; for (let k = 1; k < 5; k++) { const a = F.en('izq', .4 + k * .04, 0), b = F.en('izq', .4 + k * .04, 12); g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); }
  for (const u of [.15, .85]) hueco(g, F, 'izq', u - .012, u + .012, 7, 13, '#1E1A18');
  azotea(g, F, mezcla(muro, '#000000', .14)); if (e < 3) almenas(g, F, muro, 8, 3);
  const T = caras(.26, .26, 40, -.1, -.12); muros(g, T, mezcla(muro, '#000000', .1), null, { ladrillo: e === 2 }); if (e !== 2) sillares(g, T); hueco(g, T, 'izq', .4, .6, 30, 34, e === 3 ? '#86AEC4' : '#1E1A18'); azotea(g, T, mezcla(muro, '#000000', .2)); if (e < 3) almenas(g, T, mezcla(muro, '#000000', .1), 3, 3); else antena(g, ...P(-.1, -.12, 40), 14);
  const f = P(-.1, -.12, 43); bandera(g, f[0], f[1], 14, ['#1E1A18', '#9C2F25']);
  for (const u of [.1, .9]) { const p = F.en('izq', u, 0); farol(g, p[0], p[1] + 3, 9); }
}
function comercio(g, e) { // oligarquía: casa de comercio de ladrillo con frontón curvo dorado
  if (e === 0) { const F = sedeBahareque(g, 'tejaVieja', '#5A4A3C'); const s = P(F.f + .14, F.b - .1); sacos(g, s[0], s[1]); letrero(g, F, .5, 11.5, '#C9A24A', 'COMERCIO'); return; }
  if (e === 3) { const F = sedeModerna(g, '#E6DCC6', '#5A4A3C'); letrero(g, F, .5, 9.5, '#C9A24A', 'CÁMARA'); const s = P(F.f + .14, F.b - .1); sacos(g, s[0], s[1]); return; }
  const F = caras(.78, .52, 27, -.04), muro = e === 1 ? '#EFE3C8' : K.ladrillo;
  sombraCasa(g, F); muros(g, F, muro, '#5A4A3C', { ladrillo: e === 2 });
  for (let k = 0; k < 4; k++) { const u = .1 + k * .8 / 3; hueco(g, F, 'izq', u - .07, u + .07, 0, 10, k === 1 || k === 2 ? '#2E2A28' : '#7FA6BC', true); }
  for (let k = 0; k < 4; k++) ventana(g, F, 'izq', .1 + k * .8 / 3, 15, .08, 7, '#2E2A28', { marco: '#F4EEE2', postigos: false });
  balcon(g, F, .3, .7, 14, .1, '#C9A24A');
  ventana(g, F, 'der', .3, 4, .12, 6, '#2E2A28', { marco: '#F4EEE2', postigos: false }); ventana(g, F, 'der', .7, 15, .12, 7, '#2E2A28', { marco: '#F4EEE2', postigos: false });
  azotea(g, F, mezcla(muro, '#000000', .2));
  const a = F.en('izq', 0, 27), b = F.en('izq', 1, 27); rellena(g, [a, b, [b[0], b[1] - 2.4], [a[0], a[1] - 2.4]], '#E6D6B0');
  const m = F.en('izq', .5, 29); g.fillStyle = '#E6D6B0'; g.beginPath(); g.moveTo(m[0] - 8, m[1] + 2.4); g.quadraticCurveTo(m[0], m[1] - 9, m[0] + 8, m[1] + 2.4); g.fill(); g.strokeStyle = '#C9A24A'; g.lineWidth = .8; g.stroke();
  g.fillStyle = '#C9A24A'; g.beginPath(); g.arc(m[0], m[1] - 1.8, 1.6, 0, 7); g.fill();
  const s = P(F.f + .14, F.b - .1); sacos(g, s[0], s[1]);
  const ch = P(F.t + .1, F.a + .12, 27); rellena(g, [[ch[0] - 1.6, ch[1]], [ch[0] + 1.6, ch[1]], [ch[0] + 1.6, ch[1] - 7], [ch[0] - 1.6, ch[1] - 7]], K.ladrilloOsc);
}
function tribuna(g, e) { // demagogia: tribuna popular con balcón grande, carteles, banderines y megáfono
  const muro = ['#EDE4D2', '#F2DFA8', '#F2C9A0', '#F2E08A'][e];
  const F = caras(.8, .48, e === 0 ? 15 : e === 3 ? 28 : 22, -.08);
  sombraCasa(g, F); muros(g, F, muro, '#B9442F', { ladrillo: false }); if (e === 0) bahareque(g, F);
  hueco(g, F, 'izq', .4, .6, 0, 10, '#3A2A1E', e < 3);
  for (const u of [.15, .85]) ventana(g, F, 'izq', u, 4, .08, 6, '#B9442F', e === 3 ? { vidrio: '#7FA6BC', postigos: false } : {});
  for (const [u, c] of [[.12, '#2F6E8E'], [.24, '#E7B23C'], [.76, '#3E6B4A'], [.88, '#B9442F']]) rellena(g, [F.en('izq', u - .05, 13 * F.H / 22), F.en('izq', u + .05, 13 * F.H / 22), F.en('izq', u + .05, 20 * F.H / 22), F.en('izq', u - .05, 20 * F.H / 22)], c, K.contorno, .3);
  if (e === 3) terraza(g, F, muro); else dosAguas(g, F, 9, e === 0 ? MAT.paja : { teja: '#C0602A' });
  const z = 12, a = F.a + (F.b - F.a) * .32, b = F.a + (F.b - F.a) * .68, f = F.f, s = .2;
  rellena(g, [P(f, a, z), P(f, b, z), P(f + s, b, z), P(f + s, a, z)], '#8A5A36'); rellena(g, [P(f + s, a, z), P(f + s, b, z), P(f + s, b, z - 7), P(f + s, a, z - 7)], '#B9442F');
  rellena(g, [P(f + s, a, z - 1.5), P(f + s, b, z - 1.5), P(f + s, b, z - 4.5), P(f + s, a, z - 4.5)], '#E7C76B', null);
  g.strokeStyle = K.maderaOsc; g.lineWidth = .9; for (const c of [a, b]) { const p = P(f + s, c, 0), q = P(f + s, c, z); g.beginPath(); g.moveTo(...p); g.lineTo(...q); g.stroke(); }
  const mg = P(f + s * .5, b - .02, z + 9); g.strokeStyle = '#2E2A28'; g.lineWidth = .7; g.beginPath(); g.moveTo(mg[0], mg[1] + 9); g.lineTo(mg[0], mg[1]); g.stroke(); g.fillStyle = '#9AA0A2'; g.beginPath(); g.moveTo(mg[0], mg[1]); g.lineTo(mg[0] + 5, mg[1] - 2.5); g.lineTo(mg[0] + 5, mg[1] + 2.5); g.closePath(); g.fill();
  const A = P(F.f, F.a, F.H), B = P(F.t, F.b, F.H); g.strokeStyle = '#6B4F3A'; g.lineWidth = .4; g.beginPath(); g.moveTo(A[0], A[1] - 8); g.quadraticCurveTo((A[0] + B[0]) / 2, (A[1] + B[1]) / 2 - 2, B[0], B[1] - 8); g.stroke();
  const cols = ['#C0602A', '#E7C76B', '#2D6E5E', '#C4513B', '#2F5D8A'];
  for (let k = 1; k < 10; k++) { const t = k / 10, x = A[0] + (B[0] - A[0]) * t, y = A[1] + (B[1] - A[1]) * t - 8 + Math.sin(t * Math.PI) * 6; g.fillStyle = cols[k % 5]; g.beginPath(); g.moveTo(x - 1.4, y); g.lineTo(x + 1.4, y); g.lineTo(x, y + 2.8); g.fill(); }
}

// ---------- La iglesia parroquial (el edificio más detallado), una por época ----------
// Techo de dos aguas con la cumbrera a lo largo de r: el hastial queda en la fachada (cara izq).
function dosAguasR(g, F, rh, op = {}) {
  const o = .06, a = F.a - o, b = F.b + o, f = F.f + o, t = F.t - o, mc = (F.a + F.b) / 2, H = F.z0 + F.H;
  const teja = op.teja || K.teja, luz = op.luz || K.tejaLuz, osc = op.osc || K.tejaSombra;
  rellena(g, [P(f, a, H), P(f, mc, H + rh), P(t, mc, H + rh), P(t, a, H)], osc);
  const der = [P(f, b, H), P(t, b, H), P(t, mc, H + rh), P(f, mc, H + rh)];
  rellena(g, der, grad(g, der[0][0], 0, der[3][0], 0, [[0, osc], [1, teja]]));
  tejas(g, (u, v) => P(f + (t - f) * u, b + (mc - b) * v, H + rh * v), Math.round((f - t) * 10));
  g.strokeStyle = mezcla(osc, '#000000', .2); g.lineWidth = 1; g.beginPath(); g.moveTo(...P(f, mc, H + rh)); g.lineTo(...P(t, mc, H + rh)); g.stroke();
  rellena(g, [P(F.f, F.a, H), P(F.f, F.b, H), P(F.f, mc, H + rh * .95)], op.hastial || K.cal);
  return P(F.f, mc, H + rh * .95);
}
function contrafuertes(g, F, n, col) {
  for (let k = 0; k < n; k++) {
    const u = (k + .5) / n, r = F.f + (F.t - F.f) * u, B = caras(.05, .05, F.H * .75, r, F.b + .025);
    rellena(g, B.izq, col); rellena(g, B.der, mezcla(col, '#000000', .15));
    rellena(g, [P(B.f, B.a, B.H), P(B.f, B.b, B.H), P(B.t, B.b, B.H), P(B.t, B.a, B.H)], mezcla(col, '#000000', .25), null);
  }
}
// Torre campanario: cuerpo, campanario con arcos y campanas, y remate (cupulín o pirámide).
function torre(g, r0, c0, lado, alto, col, op = {}) {
  const T = caras(lado, lado, alto, r0, c0);
  muros(g, T, col, null);
  for (const z of [alto * .35, alto * .6]) { hueco(g, T, 'izq', .38, .62, z, z + 3, '#3A2A1E', true); }
  const C = caras(lado * .92, lado * .92, 9, r0, c0, alto);
  muros(g, C, col, null);
  for (const cara of ['izq', 'der']) { hueco(g, C, cara, .2, .8, 1, 7, '#2E2420', true); const m = C.en(cara, .5, 3.4); g.fillStyle = '#C9A24A'; g.beginPath(); g.moveTo(m[0] - 1.5, m[1] + 1.6); g.quadraticCurveTo(m[0], m[1] - 2.4, m[0] + 1.5, m[1] + 1.6); g.fill(); }
  const z = alto + 9; rellena(g, [P(C.f, C.a, z), P(C.f, C.b, z), P(C.f, C.b, z + 1.4), P(C.f, C.a, z + 1.4)], mezcla(col, '#FFFFFF', .2)); rellena(g, [P(C.f, C.b, z), P(C.t, C.b, z), P(C.t, C.b, z + 1.4), P(C.f, C.b, z + 1.4)], mezcla(col, '#000000', .15));
  const top = P(r0, c0, z + 1.4);
  if (op.piramide) { const F2 = caras(lado * .95, lado * .95, 0, r0, c0, z + 1.4); piramide(g, F2, 9, op.teja || K.teja); cruz(g, top[0], top[1] - 9, .6); }
  else { cupula(g, top[0], top[1] + 1, lado * 24, 7, op.cupula || '#B9552F'); cruz(g, top[0], top[1] - 13.5, .6); }
}
function cruzAtrial(g, x, y, col = PIEDRA) {
  rellena(g, [[x - 3, y], [x + 3, y + 1.5], [x + 3, y - .5], [x - 3, y - 2]], mezcla(col, '#000000', .1), K.contorno, .3);
  rellena(g, [[x - .8, y - 1.5], [x + .8, y - 1.1], [x + .8, y - 13], [x - .8, y - 13.4]], col, K.contorno, .35);
  rellena(g, [[x - 3.2, y - 10.6], [x + 3.2, y - 9.6], [x + 3.2, y - 8.4], [x - 3.2, y - 9.4]], col, K.contorno, .35);
}
function iglesiaEpoca(g, era) {
  const capilla = era === 0, torres = era >= 2;
  const F = capilla ? caras(.4, .7, 13, -.08) : caras(.48, era === 1 ? .84 : .9, era === 1 ? 20 : 24, -.06);
  const muro = era === 3 ? '#EFDFAE' : K.cal, adorno = era === 3 ? '#F7F1E3' : era === 2 ? '#D9B878' : PIEDRA;
  sombraCasa(g, F); g.save(); g.globalAlpha = .18; g.fillStyle = '#3A2A1C'; poli(g, [P(F.f, F.b), P(F.f + .1, F.b + .5), P(F.t + .1, F.b + .5), P(F.t, F.b)]); g.fill(); g.restore();
  // Atrio: piso de piedra frente a la fachada.
  rellena(g, [P(F.f, F.a - .1), P(F.f, F.b + .1), P(F.f + .14, F.b + .1), P(F.f + .14, F.a - .1)], capilla ? '#CDBB93' : '#C9C0AE', null);
  muros(g, F, muro, capilla ? '#B07A2A' : era === 3 ? '#B07A2A' : PIEDRA_OSC);
  if (!capilla) contrafuertes(g, F, era === 1 ? 3 : 4, muro);
  // Ventanas altas del costado de la nave.
  for (let k = 0; k < (capilla ? 2 : 4); k++) { const u = (k + .5) / (capilla ? 2 : 4); hueco(g, F, 'der', u - .05, u + .05, F.H * .45, F.H * .8, '#3A2A1E', true); }
  if (!capilla) { // sacristía al costado
    const Sx = caras(.2, .26, 11, F.t + .2, F.b + .12); muros(g, Sx, muro, PIEDRA_OSC); ventana(g, Sx, 'der', .5, 4, .2, 4, '#3E6B4A'); cuatroAguas(g, Sx, 5);
  }
  const cima = dosAguasR(g, F, capilla ? 9 : era === 1 ? 13 : 15, { hastial: muro });
  // Fachada: portada, puerta, óculo o rosetón.
  const fa = (u, z) => F.en('izq', u, z);
  if (!capilla) {
    rellena(g, [fa(.28, 0), fa(.72, 0), fa(.72, F.H * .72), fa(.5, F.H * .82), fa(.28, F.H * .72)], adorno);
    for (const u of [.3, .7]) rellena(g, [fa(u - .03, 0), fa(u + .03, 0), fa(u + .03, F.H * .62), fa(u - .03, F.H * .62)], mezcla(adorno, '#FFFFFF', .25), K.contorno, .3); // pilastras
  }
  puerta(g, F, 'izq', .5, capilla ? .26 : .3, capilla ? 9 : 12, K.madera, true);
  if (!capilla) { const o = fa(.5, F.H * .62); g.fillStyle = '#3A2A1E'; g.beginPath(); g.ellipse(o[0], o[1], 2.6, 2.6, 0, 0, 7); g.fill(); g.strokeStyle = adorno; g.lineWidth = .8; g.stroke(); g.strokeStyle = 'rgba(200,170,90,.8)'; g.lineWidth = .35; for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; g.beginPath(); g.moveTo(o[0], o[1]); g.lineTo(o[0] + Math.cos(a) * 2.4, o[1] + Math.sin(a) * 2.4); g.stroke(); } }
  else { const o = fa(.5, 10.5); g.fillStyle = '#3A2A1E'; g.beginPath(); g.arc(o[0], o[1], 1.3, 0, 7); g.fill(); }
  if (era === 3) { const r = fa(.5, F.H + 5); reloj(g, r[0], r[1], 2.6); }
  // Remate: espadaña (capilla y colonial) o cúpula del crucero y dos torres (templo).
  if (!torres) {
    const n = capilla ? 1 : 3, w = capilla ? 4.5 : 9, alto = capilla ? 10 : 16, x = cima[0], y = cima[1] + 2;
    rellena(g, [[x - w, y], [x + w, y], [x + w, y - alto * .65], [x, y - alto], [x - w, y - alto * .65]], muro);
    const pos = capilla ? [[0, -5]] : [[-4.4, -5], [4.4, -5], [0, -11]];
    for (const [dx, dy] of pos.slice(0, n)) { g.fillStyle = '#3A2A1E'; g.beginPath(); g.ellipse(x + dx, y + dy, 2.1, 2.9, 0, 0, 7); g.fill(); g.fillStyle = '#C9A24A'; g.beginPath(); g.moveTo(x + dx - 1.5, y + dy + 1.9); g.quadraticCurveTo(x + dx, y + dy - 2.6, x + dx + 1.5, y + dy + 1.9); g.fill(); }
    cruz(g, x, y - alto - .5, .8);
  } else {
    const d = P(F.t + (F.f - F.t) * .3, (F.a + F.b) / 2, F.H + 15);
    rellena(g, [[d[0] - 9, d[1] + 2], [d[0] + 9, d[1] + 2], [d[0] + 9, d[1] - 5], [d[0] - 9, d[1] - 5]], muro); // tambor
    for (const dx of [-6, -2, 2, 6]) hueco(g, { en: (c, u, z) => [d[0] + dx + (u - .5) * 2.4, d[1] - z] }, 'izq', 0, 1, -1, 3.4, '#3A2A1E', true);
    cupula(g, d[0], d[1] - 5, 9.6, 12, era === 3 ? '#B07A2A' : '#B9552F'); cruz(g, d[0], d[1] - 23, .8);
    // Frontón entre las torres.
    const x = cima[0], y = cima[1]; rellena(g, [[x - 10, y + 6], [x + 10, y + 6], [x, y - 4]], adorno);
    torre(g, F.f - .08, F.a - .05, .15, F.H + 8, muro, { cupula: era === 3 ? '#B07A2A' : '#B9552F' });
    torre(g, F.f - .08, F.b + .05, .15, F.H + 8, muro, { cupula: era === 3 ? '#B07A2A' : '#B9552F' });
  }
  // Atrio: cruz atrial, bancas, faroles y vida.
  const ca = P(F.f + .32, F.a - .02); cruzAtrial(g, ca[0], ca[1], capilla ? K.madera : PIEDRA);
  if (capilla) { const v = P(F.f + .2, F.b + .14); bancoMadera(g, v[0], v[1]); materas(g, [P(F.f + .08, F.b + .04)]); }
  else {
    const b0 = P(F.f + .1, F.a - .1, 0), b1 = P(F.f + .1, F.b + .1, 0); g.strokeStyle = mezcla(PIEDRA, '#000000', .25); g.lineWidth = 2.2; g.beginPath(); g.moveTo(b0[0], b0[1] - 1); g.lineTo(...P(F.f + .1, F.a + .12, 1)); g.moveTo(...P(F.f + .1, F.b - .12, 1)); g.lineTo(b1[0], b1[1] - 1); g.stroke(); // barda del atrio
    for (const c of [F.a - .08, F.b + .08]) { const p = P(F.f + .22, c); farol(g, p[0], p[1], 12); }
    if (era >= 2) { bancoMadera(g, ...P(F.f + .36, F.b + .02)); materas(g, [P(F.f + .04, F.a - .06), P(F.f + .04, F.b + .06)]); }
    if (era === 3) { for (const c of [F.a + .1, F.b - .1]) { const p = P(F.f + .15, c); g.fillStyle = 'rgba(255,226,150,.35)'; g.beginPath(); g.ellipse(p[0], p[1] - 14, 5, 12, 0, 0, 7); g.fill(); } const pl = fa(.82, 5); rellena(g, [[pl[0] - 2, pl[1]], [pl[0] + 2, pl[1] + 1], [pl[0] + 2, pl[1] - 2], [pl[0] - 2, pl[1] - 3]], '#C9A24A', K.contorno, .3); } // reflectores y placa de patrimonio
  }
}

// [clave, ancho, alto, anclaX, anclaY, pintura] de la época e (0 a 3). Las medidas no cambian con la época (caben
// las cuatro versiones), así el mapa solo repinta la hoja al cambiar de época. La iglesia tiene sus cuatro a la vez.

// ---------- Mercado (pedido de Juan, 6 de octubre: era el único que seguía al fresco) ----------
// mercado0: plaza de toldos (Aldea y Pueblo): puestos de madera con toldo a rayas, canastos y bultos, sobre tierra,
// empedrado, ladrillo o cemento según la época. mercado2: plaza cubierta (desde Ciudad): ramada de paja o de teja
// sobre horcones, galería de ladrillo con arcos y mercado de cemento con cortinas metálicas. vacio: comida cara,
// mesas sin nada y cajas vacías.
const FRUTAS = ['#E0A030', '#7FA04A', '#C44A3A', '#E8C23A', '#D9822E', '#6E9A4A'];
function canasto(g, x, y, k, vacio) {
  if (vacio) { rellena(g, [[x - 2.2, y], [x + 2.2, y + 1], [x + 2.2, y - 1.4], [x - 2.2, y - 2.4]], '#9C7A52', K.contorno, .3); return; }
  g.fillStyle = '#A8814E'; g.beginPath(); g.ellipse(x, y - 1, 2.6, 1.2, 0, 0, Math.PI); g.fill(); g.fillRect(x - 2.6, y - 1.8, 5.2, .9);
  for (let j = 0; j < 4; j++) { g.fillStyle = FRUTAS[(k + j) % FRUTAS.length]; g.beginPath(); g.arc(x - 1.6 + j * 1.05, y - 2.1 - (j % 2) * .5, .85, 0, 7); g.fill(); }
}
function mesa(g, r, c, w, d, vacio, k) {
  const M = caras(w, d, 3.6, r, c), z = 3.6;
  rellena(g, M.izq, K.madera); rellena(g, M.der, K.maderaOsc); rellena(g, [P(M.f, M.a, z), P(M.f, M.b, z), P(M.t, M.b, z), P(M.t, M.a, z)], K.maderaLuz);
  const n = Math.max(2, Math.round(w * 9));
  for (let j = 0; j < n; j++) { const p = P((M.f + M.t) / 2, M.a + (j + .5) * (M.b - M.a) / n, z); canasto(g, p[0], p[1] + .8, k + j, vacio); }
  return M;
}
// Letrero ancho sobre la fachada, con el nombre bien legible.
function letreroAncho(g, F, u0, u1, z, col, texto) {
  const a = F.en('izq', u0, z), b = F.en('izq', u1, z), h = 3.8;
  rellena(g, [a, b, [b[0], b[1] - h], [a[0], a[1] - h]], col, K.contorno, .35);
  g.save(); g.translate((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - h / 2); g.transform(1, (b[1] - a[1]) / (b[0] - a[0]), 0, 1, 0, 0);
  g.fillStyle = '#F7F1E3'; g.font = 'bold 10px serif'; const L = Math.abs(b[0] - a[0]) * .86, t = Math.min(2.8, 10 * L / g.measureText(texto).width); g.font = `bold ${t}px serif`; // el texto cabe siempre en el letrero
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(texto, 0, .2); g.restore();
}
function horcon(g, r, c, h, col) { const p = P(r, c), q = P(r, c, h); g.strokeStyle = col; g.lineWidth = 1.1; g.lineCap = 'butt'; g.beginPath(); g.moveTo(...p); g.lineTo(...q); g.stroke(); }
// Puesto con toldo a rayas, inclinado hacia el frente.
function puesto(g, r, c, cols, vacio, e, k) {
  const w = .3, d = .2, a = c - w / 2, b = c + w / 2, f = r + d / 2, t = r - d / 2, Hp = 9, poste = e >= 2 ? '#5E5E5E' : K.maderaOsc;
  horcon(g, t, a, Hp + 1.8, poste); horcon(g, t, b, Hp + 1.8, poste);
  mesa(g, r, c, w, d, vacio, k);
  horcon(g, f, a, Hp, poste); horcon(g, f, b, Hp, poste);
  const n = 5, o = .04;
  for (let j = 0; j < n; j++) {
    const c0 = a - o + (b - a + 2 * o) * j / n, c1 = a - o + (b - a + 2 * o) * (j + 1) / n;
    rellena(g, [P(f + .05, c0, Hp), P(f + .05, c1, Hp), P(t - .02, c1, Hp + 1.8), P(t - .02, c0, Hp + 1.8)], j % 2 ? cols[1] : cols[0], null);
    const p = P(f + .05, c0, Hp), q = P(f + .05, c1, Hp); g.fillStyle = j % 2 ? cols[1] : cols[0]; g.beginPath(); g.moveTo(...p); g.lineTo(...q); g.lineTo((p[0] + q[0]) / 2, (p[1] + q[1]) / 2 + 1.6); g.fill(); // flecos
  }
  g.save(); g.strokeStyle = K.contorno; g.lineWidth = .4; poli(g, [P(f + .05, a - o, Hp), P(f + .05, b + o, Hp), P(t - .02, b + o, Hp + 1.8), P(t - .02, a - o, Hp + 1.8)]); g.stroke(); g.restore();
}
function pisoPlaza(g, F, e) {
  const q = [P(F.f, F.a), P(F.f, F.b), P(F.t, F.b), P(F.t, F.a)];
  rellena(g, q, ['#C9B48A', '#C2B9A7', '#B87A5E', '#C8C4BA'][e], null);
  g.save(); poli(g, q); g.clip(); g.strokeStyle = ['rgba(120,95,60,.25)', 'rgba(90,80,65,.35)', 'rgba(120,60,40,.4)', 'rgba(110,105,95,.35)'][e]; g.lineWidth = .4;
  if (e > 0) for (let u = 0; u <= 1; u += e === 1 ? .1 : .14) { g.beginPath(); g.moveTo(...P(F.f, F.a + (F.b - F.a) * u)); g.lineTo(...P(F.t, F.a + (F.b - F.a) * u)); g.stroke(); g.beginPath(); g.moveTo(...P(F.t + (F.f - F.t) * u, F.a)); g.lineTo(...P(F.t + (F.f - F.t) * u, F.b)); g.stroke(); }
  g.restore();
}
const TOLDOS = [[['#C4513B', '#F4ECDB'], ['#2D6E5E', '#F4ECDB'], ['#C08A2A', '#F4ECDB']], [['#B9442F', '#F4ECDB'], ['#3E6B4A', '#F2E2A0'], ['#2F5D8A', '#F4ECDB']]];
function mercadoToldos(g, e, vacio) {
  const F = caras(.9, .72, 0);
  pisoPlaza(g, F, e);
  const cols = e === 0 ? [['#C9A86A', '#B08A50'], ['#BFA06A', '#A88850'], ['#C9A86A', '#B08A50']] : TOLDOS[e >= 2 ? 1 : 0];
  sacos(g, ...P(-.28, .3)); // bultos de café y de maíz al fondo
  for (const [r, c, k] of [[-.18, -.2, 0], [-.18, .22, 1], [.17, .02, 2]].sort((x, y) => (x[0] + x[1]) - (y[0] + y[1]))) puesto(g, r, c, cols[k], vacio, e, k * 3);
  const p = P(.3, -.32); canasto(g, p[0], p[1], 4, vacio); canasto(g, p[0] + 5, p[1] + 2.5, 1, vacio);
  if (!vacio) { const q = P(.32, .36); g.fillStyle = '#7FA04A'; for (let j = 0; j < 4; j++) { g.beginPath(); g.ellipse(q[0] + j * 1.2 - 2, q[1] - 1.4 - (j % 2), .7, 1.9, .4, 0, 7); g.fill(); } } // racimo de plátano
  if (e >= 2) farol(g, ...P(.34, -.04), 12);
}
function mercadoCubierto(g, e, vacio) {
  if (e <= 1) { // ramada sobre horcones: abierta por los lados, con mesas debajo
    const F = caras(.92, .68, 14), poste = K.maderaOsc;
    sombraCasa(g, F); pisoPlaza(g, F, e);
    for (const u of [0, .5, 1]) horcon(g, F.t, F.a + (F.b - F.a) * u, 14, poste);
    horcon(g, 0, F.a, 14, poste); horcon(g, -.02, F.b, 14, poste);
    mesa(g, -.14, -.18, .3, .16, vacio, 0); mesa(g, -.14, .2, .3, .16, vacio, 3); mesa(g, .16, 0, .42, .16, vacio, 1);
    for (const u of [0, .5, 1]) horcon(g, F.f, F.a + (F.b - F.a) * u, 14, poste);
    cuatroAguas(g, F, 7, MAT[e === 0 ? 'paja' : 'tejaVieja']);
    if (!vacio) { const q = F.en('izq', .25, 12); g.fillStyle = '#7FA04A'; for (let j = 0; j < 4; j++) { g.beginPath(); g.ellipse(q[0] + j * 1.2 - 2, q[1] + 3 - (j % 2), .7, 1.9, .4, 0, 7); g.fill(); } } // plátano colgado del alero
    return;
  }
  const F = caras(.92, .68, 15);
  sombraCasa(g, F);
  if (e === 2) { // galería de ladrillo con arcos abiertos, como las plazas de mercado de comienzos del siglo XX
    muros(g, F, K.ladrillo, '#5A3A2A', { ladrillo: true });
    arcada(g, F, 'izq', 5, 0, 7, .04, .96, '#3A2A20'); arcada(g, F, 'der', 3, 0, 7, .06, .94, '#2E2018');
    for (let k = 0; k < 5; k++) { const p = F.en('izq', .04 + (k + .5) * .184, 1.4); canasto(g, p[0], p[1], k, vacio); }
    letreroAncho(g, F, .26, .74, 9.6, '#3E6B4A', 'MERCADO');
    cuatroAguas(g, F, 8, MAT.tejaParda);
    const m = P((F.f + F.t) / 2, (F.a + F.b) / 2, F.H + 8); rellena(g, [[m[0] - 4, m[1] + 1], [m[0] + 4, m[1] + 1], [m[0] + 4, m[1] - 3], [m[0] - 4, m[1] - 3]], K.cal); dosAguas(g, caras(.24, .12, 0, (F.f + F.t) / 2, (F.a + F.b) / 2, F.H + 11), 3, MAT.tejaParda); // linterna de ventilación
    return;
  }
  // Cemento: cortinas metálicas a medio subir, puestos adentro, techo de zinc y toldos en la acera.
  muros(g, F, '#E4DED2', '#8A8478');
  for (let k = 0; k < 4; k++) {
    const u0 = .06 + k * .225, u1 = u0 + .18;
    hueco(g, F, 'izq', u0, u1, 0, 8, '#3A3430');
    const p = F.en('izq', (u0 + u1) / 2, 1.2); canasto(g, p[0], p[1], k, vacio);
    rellena(g, [F.en('izq', u0, 4.6), F.en('izq', u1, 4.6), F.en('izq', u1, 8), F.en('izq', u0, 8)], '#9AA0A4', K.contorno, .3);
    g.strokeStyle = 'rgba(60,64,68,.5)'; g.lineWidth = .3; for (let z = 5.2; z < 8; z += .7) { g.beginPath(); g.moveTo(...F.en('izq', u0, z)); g.lineTo(...F.en('izq', u1, z)); g.stroke(); }
  }
  hueco(g, F, 'der', .3, .7, 0, 8, '#3A3430');
  letreroAncho(g, F, .3, .7, 9.4, '#B9442F', 'MERCADO');
  dosAguas(g, F, 6, MAT.zinc);
  for (const [u, cols] of [[.18, TOLDOS[1][0]], [.82, TOLDOS[1][2]]]) { const a = F.en('izq', u - .1, 8.4), b = F.en('izq', u + .1, 8.4), a2 = P(F.f + .14, F.a + (F.b - F.a) * (u - .1), 6.6), b2 = P(F.f + .14, F.a + (F.b - F.a) * (u + .1), 6.6); rellena(g, [a, b, b2, a2], cols[0], K.contorno, .3); }
}

// ---------- Obras de materiales (fase 17) ----------
// Caja plana con luz arriba a la izquierda: cara izquierda clara, derecha en sombra y tapa luminosa.
function caja(g, w, d, h, r, c, z0, col) {
  const B = caras(w, d, h, r, c, z0);
  rellena(g, B.izq, col); rellena(g, B.der, mezcla(col, '#000000', .22));
  const z = z0 + h; rellena(g, [P(B.f, B.a, z), P(B.f, B.b, z), P(B.t, B.b, z), P(B.t, B.a, z)], mezcla(col, '#FFFFFF', .2));
  return B;
}
// Un rollizo tumbado: cuerpo y su corte circular al frente.
function rollizo(g, x, y, largo, rad, col = '#8A5A36') {
  g.fillStyle = mezcla(col, '#000000', .25); g.beginPath(); g.ellipse(x + largo, y + largo * .5, rad, rad * .8, 0, 0, 7); g.fill();
  g.strokeStyle = col; g.lineWidth = rad * 1.9; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y); g.lineTo(x + largo, y + largo * .5); g.stroke();
  g.fillStyle = '#E2C28A'; g.beginPath(); g.ellipse(x, y, rad * .8, rad, 0, 0, 7); g.fill(); g.strokeStyle = '#8A5A36'; g.lineWidth = .35; g.beginPath(); g.ellipse(x, y, rad * .45, rad * .55, 0, 0, 7); g.stroke();
}
function aserradero(g, e) {
  // Ramada abierta con el banco de aserrar y un tronco a medio cortar; rollizos y tablas apilados al frente.
  const R = caras(.64, .48, 12, .06, -.02), poste = e >= 2 ? '#4A4A4A' : K.maderaOsc;
  sombraCasa(g, R);
  rellena(g, [P(R.f, R.a), P(R.f, R.b), P(R.t, R.b), P(R.t, R.a)], e === 3 ? '#B8B2A6' : '#C9AE7C', null);
  for (const [r, c] of [[R.t, R.a], [R.t, R.b]]) { const p = P(r, c), q = P(r, c, 12); g.strokeStyle = poste; g.lineWidth = 1.3; g.beginPath(); g.moveTo(...p); g.lineTo(...q); g.stroke(); }
  caja(g, .42, .13, 3.4, .08, -.1, 0, K.maderaLuz);
  const bn = P(.08, -.1, 3.4); rollizo(g, bn[0] - 9, bn[1] - 4.8, 14, 2.4);
  g.strokeStyle = '#6E7378'; g.lineWidth = .7; g.beginPath(); g.moveTo(bn[0] - 1, bn[1] - 11); g.lineTo(bn[0] + 3, bn[1] - 1.5); g.stroke(); g.fillStyle = '#6E7378'; g.fillRect(bn[0] - 3.5, bn[1] - 11.6, 5, 1.2);
  for (const [r, c] of [[R.f, R.a], [R.f, R.b]]) { const p = P(r, c), q = P(r, c, 12); g.strokeStyle = poste; g.lineWidth = 1.4; g.beginPath(); g.moveTo(...p); g.lineTo(...q); g.stroke(); }
  const T = caras(.64, .48, 0, .06, -.02, 12); dosAguas(g, T, 7, { hastial: '#8A5A36', ...MAT[['paja', 'tejaVieja', 'zinc', 'zinc'][e]] });
  const pila = P(R.f + .1, R.b + .1); for (let k = 0; k < 3; k++) rollizo(g, pila[0] - 7 + k * 1.6, pila[1] - k * 2.6 - 2, 13, 2.4, k % 2 ? '#7A5536' : '#8A5A36');
  caja(g, .16, .34, 2.6, R.f + .02, R.a - .16, 0, '#D9B77E'); caja(g, .16, .3, 2.2, R.f + .02, R.a - .16, 2.6, '#E2C28A');
}
function estudio(g, e) {
  // Caseta de campo con su teodolito sobre un trípode, una bandera de mira y un mapa extendido en una mesa.
  const F = caras(.38, .36, 9, -.12, -.1);
  sombraCasa(g, F);
  muros(g, F, e === 2 ? K.ladrillo : e === 3 ? '#D6D2CA' : K.cal, null, { ladrillo: e === 2 });
  puerta(g, F, 'izq', .6, .22, 7, MADERA); ventana(g, F, 'der', .5, 5, .16, 4, MADERA, e >= 2 ? { marco: '#F4EEE2' } : {});
  dosAguas(g, F, 5.5, MAT[['paja', 'tejaVieja', 'zinc', 'zinc'][e]]);
  const t = P(.3, .24); g.strokeStyle = K.maderaOsc; g.lineWidth = .8;
  for (const dx of [-5, 0, 5]) { g.beginPath(); g.moveTo(t[0], t[1] - 9); g.lineTo(t[0] + dx, t[1] + 1.5 + Math.abs(dx) * .3); g.stroke(); }
  rellena(g, [[t[0] - 2.4, t[1] - 9], [t[0] + 2.4, t[1] - 9], [t[0] + 2.4, t[1] - 13], [t[0] - 2.4, t[1] - 13]], '#3A4650', K.contorno, .3); g.fillStyle = '#C9A44A'; g.fillRect(t[0] + 2.4, t[1] - 12, 3.2, 1.2);
  const b = P(.34, .5); g.strokeStyle = '#6A4A2E'; g.lineWidth = .9; g.beginPath(); g.moveTo(b[0], b[1]); g.lineTo(b[0], b[1] - 18); g.stroke(); rellena(g, [[b[0], b[1] - 18], [b[0] + 6, b[1] - 16], [b[0], b[1] - 13]], '#B9442F', K.contorno, .3);
}

// ---------- Plaza por niveles, estadio, cantera y museo (renovados; pedido de Juan, 9 de octubre) ----------
const PIEDRA_CL = '#DCD2BC', PIEDRA_BASE = '#CBBFA6';
// Un cuadrado plano de lado 2s (sobre el suelo) a la altura z, con su color.
function suelo(g, s, z, col, r0 = 0, c0 = 0) { rellena(g, [P(r0 - s, c0 - s, z), P(r0 - s, c0 + s, z), P(r0 + s, c0 + s, z), P(r0 + s, c0 - s, z)], col, null); }
// Líneas de empedrado o de damero sobre la losa: paso en casillas.
function empedrado(g, s, z, paso, col = 'rgba(90,76,56,.38)', w = .35) {
  g.save(); g.strokeStyle = col; g.lineWidth = w;
  for (let k = -s + paso; k < s - .001; k += paso) { g.beginPath(); g.moveTo(...P(-s, k, z)); g.lineTo(...P(s, k, z)); g.moveTo(...P(k, -s, z)); g.lineTo(...P(k, s, z)); g.stroke(); }
  g.restore();
}
function damero(g, s, z, n, c1, c2) {
  const d = 2 * s / n;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const r = -s + i * d, c = -s + j * d; rellena(g, [P(r, c, z), P(r, c + d, z), P(r + d, c + d, z), P(r + d, c, z)], (i + j) % 2 ? c1 : c2, null); }
}
// Cruz de piedra sobre sus gradas, con su pie en (x, y).
function cruzDePiedra(g, x, y, k = 1) {
  g.save(); g.translate(x, y); g.scale(k, k);
  for (const [s, z0] of [[.15, 0], [.11, 2.6], [.07, 5.2]]) caja(g, 2 * s, 2 * s, 2.6, 0, 0, z0, '#D8CCB0');
  rellena(g, [[-2.2, -8], [0, -7], [0, -40], [-2.2, -41]], '#E6DCC4', null); rellena(g, [[0, -7], [2.2, -8], [2.2, -41], [0, -40]], '#C9BE9F', null);
  rellena(g, [[-9, -31], [0, -29.5], [0, -34.2], [-9, -35.7]], '#E6DCC4', null); rellena(g, [[0, -29.5], [9, -31], [9, -35.7], [0, -34.2]], '#C9BE9F', null);
  g.strokeStyle = K.contorno; g.lineWidth = .5; g.strokeRect(-2.2, -41, 4.4, 33); g.restore();
}
// Pila de piedra con su chorro (la de los pueblos del Tolima), con su pie en (x, y).
function pilaPlaza(g, x, y, R, alto = 12) {
  g.fillStyle = PIEDRA_OSC; g.beginPath(); g.ellipse(x, y, R, R * .5, 0, 0, 7); g.fill();
  g.fillStyle = PIEDRA; g.beginPath(); g.ellipse(x, y - 3, R, R * .5, 0, 0, 7); g.fill();
  g.fillStyle = '#7FB3C4'; g.beginPath(); g.ellipse(x, y - 3.4, R * .82, R * .41, 0, 0, 7); g.fill();
  g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = .4; g.beginPath(); g.ellipse(x - 1, y - 3.4, R * .55, R * .27, 0, 0, 7); g.stroke();
  rellena(g, [[x - 1.6, y - 3], [x + 1.6, y - 3], [x + 1.2, y - alto], [x - 1.2, y - alto]], PIEDRA_CL);
  g.fillStyle = PIEDRA; g.beginPath(); g.ellipse(x, y - alto, R * .4, R * .2, 0, 0, 7); g.fill(); g.fillStyle = '#7FB3C4'; g.beginPath(); g.ellipse(x, y - alto - .4, R * .3, R * .15, 0, 0, 7); g.fill();
  g.strokeStyle = 'rgba(210,235,245,.9)'; g.lineWidth = .8; g.lineCap = 'round';
  for (const dx of [-3.4, 0, 3.4]) { g.beginPath(); g.moveTo(x, y - alto - .6); g.quadraticCurveTo(x + dx * .8, y - alto - 6, x + dx * 1.4, y - 3.8); g.stroke(); }
}
// Busto de bronce sobre un pedestal alto (como los de las plazas de verdad), con su pie en (x, y).
function estatua(g, x, y) {
  g.save(); g.translate(x, y);
  caja(g, .34, .34, 3, 0, 0, 0, '#CFC5AE'); caja(g, .26, .26, 3, 0, 0, 3, '#DCD2BC'); caja(g, .2, .2, 14, 0, 0, 6, '#E6DCC4'); caja(g, .28, .28, 2.4, 0, 0, 20, '#CFC5AE');
  rellena(g, [[-3.2, -13], [3.2, -11], [3.2, -8], [-3.2, -10]], '#8A7A5A', K.contorno, .3); g.fillStyle = '#E7C76B'; g.fillRect(-1.6, -11.2, 3.2, .8); // placa
  const z = -22.4, br = '#6C8E7C', bl = '#8FB09B', bo = '#4A6657';
  const hombros = g.createLinearGradient(-8, 0, 8, 0); hombros.addColorStop(0, bl); hombros.addColorStop(.55, br); hombros.addColorStop(1, bo);
  g.fillStyle = hombros; g.strokeStyle = 'rgba(30,45,38,.6)'; g.lineWidth = .4;
  g.beginPath(); g.moveTo(-6.4, z); g.quadraticCurveTo(-7.2, z - 4.2, -3.4, z - 6.2); g.lineTo(3.4, z - 6.2); g.quadraticCurveTo(7.2, z - 4.2, 6.4, z); g.closePath(); g.fill(); g.stroke(); // hombros y pecho
  g.fillStyle = hombros; g.fillRect(-1.5, z - 8.4, 3, 2.4); // cuello
  const cab = g.createRadialGradient(-1.2, z - 12, .6, 0, z - 11.4, 4.2); cab.addColorStop(0, '#A8C7B2'); cab.addColorStop(.6, br); cab.addColorStop(1, bo);
  g.fillStyle = cab; g.beginPath(); g.ellipse(0, z - 11.2, 3.1, 3.8, 0, 0, 7); g.fill(); g.stroke();
  g.fillStyle = bo; g.beginPath(); g.ellipse(0, z - 13.4, 3.2, 1.9, 0, Math.PI, 0); g.fill(); // cabello
  g.strokeStyle = 'rgba(20,35,28,.55)'; g.lineWidth = .4; g.beginPath(); g.moveTo(-1.4, z - 11.4); g.lineTo(-.4, z - 11.4); g.moveTo(.8, z - 11.4); g.lineTo(1.8, z - 11.4); g.moveTo(.2, z - 11); g.lineTo(-.3, z - 9.6); g.stroke(); // ojos y nariz apenas
  g.strokeStyle = bo; g.lineWidth = .5; g.beginPath(); g.moveTo(-3.4, z - 3); g.quadraticCurveTo(0, z - 1.2, 3.4, z - 3); g.stroke(); // solapa
  g.restore();
}
function maceta(g, x, y, col, col2) { g.fillStyle = '#B5654A'; g.fillRect(x - 2.2, y - 3, 4.4, 3); for (const [dx, dy, c] of [[-2, -4.6, col], [0, -5.6, col2], [2, -4.4, col], [-.4, -4, col2]]) { g.fillStyle = c; g.beginPath(); g.arc(x + dx, y + dy, 1.5, 0, 7); g.fill(); } }
// n: 0 plaza de fundación (tierra y cruz), 1 plaza mayor (empedrada), 2 plaza cívica (pila y faroles), 3 plaza de la polis (estatua).
function plazaN(g, n) {
  const s = [.56, .6, .62, .64][n];
  g.save(); g.globalAlpha = .18; g.fillStyle = '#26301E'; poli(g, [P(-s, -s), P(-s, s), P(s + .06, s + .08), P(s + .08, -s + .02)]); g.fill(); g.restore();
  const cuerpo = caja(g, 2 * s, 2 * s, n === 0 ? 1.4 : 2, 0, 0, 0, n === 0 ? '#BFA97E' : n === 1 ? '#B5A98C' : '#BFB6A0');
  const z = n === 0 ? 1.4 : 2;
  if (n === 0) {
    suelo(g, s - .04, z, '#D2BE95'); g.fillStyle = 'rgba(120,96,60,.35)';
    for (let k = 0; k < 16; k++) { const q = P(-s + .1 + (k * .37 % 1) * (2 * s - .2), -s + .1 + (k * .61 % 1) * (2 * s - .2), z); g.beginPath(); g.ellipse(q[0], q[1], 1.6, .8, 0, 0, 7); g.fill(); }
  } else if (n === 1) { suelo(g, s - .035, z, PIEDRA_BASE); empedrado(g, s - .035, z, .12); }
  else if (n === 2) { suelo(g, s - .035, z, '#D8CEB8'); empedrado(g, s - .035, z, .16, 'rgba(90,76,56,.3)'); suelo(g, .2, z + .05, '#CDC2A8', 0, 0); empedrado(g, .2, z + .05, .1, 'rgba(90,76,56,.3)'); }
  else { damero(g, s - .035, z, 8, '#E4DCC8', '#C6BCA4'); rellena(g, [P(-.2, -.2, z + .1), P(-.2, .2, z + .1), P(.2, .2, z + .1), P(.2, -.2, z + .1)], '#B8AE96', null); }
  // Setos y canteros en las esquinas (más cuidados cuanto más grande la plaza).
  const esq = [[-s + .09, -s + .09], [-s + .09, s - .09], [s - .09, -s + .09], [s - .09, s - .09]];
  // Árboles de sombra en las esquinas de los lados (el mango de la plaza) y faroles en las plazas cívicas.
  { const q = P(-s + .12, s - .12, z); arbolito(g, q[0], q[1], n === 0 ? 1.2 : 1.05, '#4E7A3A'); }
  if (n >= 1) { const q = P(s - .12, s - .12, z); arbolito(g, q[0], q[1], .9, '#6F9C4C'); }
  if (n >= 2) for (const [r, c] of [[-s + .07, -.3], [-.3, -s + .07]]) { const q = P(r, c, z); farol(g, q[0], q[1], 12); }
  // Centro.
  const C = P(0, 0, z);
  if (n === 0) { cruzDePiedra(g, C[0], C[1], 1); for (const [r, c] of [[-.34, -.2], [-.34, .26], [.3, -.34], [.3, .3]]) { const q = P(r, c, z); g.strokeStyle = K.maderaOsc; g.lineWidth = 1.1; g.beginPath(); g.moveTo(q[0], q[1]); g.lineTo(q[0], q[1] - 9); g.stroke(); } }
  else if (n === 1) { cruzDePiedra(g, C[0], C[1], 1.05); }
  else if (n === 2) { pilaPlaza(g, C[0], C[1], 10.5, 15); }
  else { pilaPlaza(g, C[0], C[1] + 3, 13, 3); estatua(g, C[0], C[1] - 1); }
  // Adelante: bancas, canteros, bandera.
  if (n >= 1) { const q = P(s - .12, -.18, z); bancoMadera(g, q[0], q[1]); }
  if (n >= 2) { const q = P(s - .12, .26, z); bancoMadera(g, q[0], q[1]); const f = P(s - .1, -s + .1, z); bandera(g, f[0], f[1], 26, TRICOLOR); }
  if (n >= 3) { for (const [r, c] of [[-.38, -.22], [.34, .4], [.38, -.34]]) { const m = P(r, c, z); maceta(g, m[0], m[1], '#D8433A', '#F4EFE4'); } }
  if (n === 1) { for (const [r, c] of [[.34, .36], [.36, -.36]]) { const m = P(r, c, z); maceta(g, m[0], m[1], '#E7B23C', '#D8433A'); } }
  if (n <= 1) { const f = P(s - .1, -s + .1, z); bandera(g, f[0], f[1], 22, TRICOLOR); }
}

// Estadio de cuatro épocas: graderías en dos lados, la cancha de pasto y el borde de entrada.
function estadioN(g, e) {
  const sf = .34, dep = .38, so = sf + dep, d = dep / 4;
  const fondo = ['#BCA67A', '#C7B995', '#BDB8AC', '#C9C6BE'][e];
  g.save(); g.globalAlpha = .2; g.fillStyle = '#26301E'; poli(g, [P(-so, -so), P(-so, so), P(so + .06, so + .08), P(so + .08, -so + .02)]); g.fill(); g.restore();
  caja(g, 2 * so, 2 * so, 1.2, 0, 0, 0, fondo);
  const zc = 1.2;
  suelo(g, sf, zc, e === 0 ? '#B7A06C' : '#7FA35C');
  g.save(); g.strokeStyle = 'rgba(250,245,230,.85)'; g.lineWidth = .5;
  g.beginPath(); g.moveTo(...P(-sf, -sf, zc)); g.lineTo(...P(-sf, sf, zc)); g.lineTo(...P(sf, sf, zc)); g.lineTo(...P(sf, -sf, zc)); g.closePath(); g.stroke();
  g.beginPath(); g.moveTo(...P(0, -sf, zc)); g.lineTo(...P(0, sf, zc)); g.stroke(); const cc = P(0, 0, zc); g.beginPath(); g.ellipse(cc[0], cc[1], 5.5, 2.8, 0, 0, 7); g.stroke();
  for (const c of [-sf, sf]) { const a = P(-.07, c, zc), b = P(.07, c, zc); g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); }
  g.restore();
  const cols = e === 0 ? ['#9A6A3E', '#B08050'] : e === 1 ? ['#C9BDA3', '#B5A98C'] : e === 2 ? ['#B9B6AE', '#A8A59D'] : ['#C9C6BE', '#B3B0A8'];
  const asientos = ['#C0392B', '#E7C76B', '#2D5D72', '#F4F1E6'];
  const rng = k => ((k * 9301 + 49297) % 233280) / 233280;
  const gente = (r, c, z, k) => { if (e === 0 && k % 2) return; const q = P(r, c, z); g.fillStyle = asientos[(k * 7 + (e * 3)) % 4]; g.globalAlpha = .9; g.beginPath(); g.arc(q[0], q[1] - 1.1, .85, 0, 7); g.fill(); g.globalAlpha = 1; };
  // Graderío del lado del fondo derecho (c = -so… a = izquierda) y del fondo izquierdo: de afuera hacia adentro.
  for (let k = 3; k >= 0; k--) { // lado de la columna menor (izquierdo atrás)
    const c = -sf - d * (k + .5), h = 2.6 * (k + 1);
    caja(g, d, 2 * so - .02, h, 0, c, zc - 1.2, cols[k % 2]);
    for (let j = 0; j < 7; j++) gente(-so + .08 + j * (2 * so - .16) / 6, c + d * .1, zc - 1.2 + h, j + k * 3);
  }
  for (let k = 3; k >= 0; k--) { // lado de la fila menor (derecho atrás)
    const r = -sf - d * (k + .5), h = 2.6 * (k + 1);
    caja(g, 2 * so - .02, d, h, r, 0, zc - 1.2, cols[(k + 1) % 2]);
    for (let j = 0; j < 7; j++) gente(r + d * .1, -so + .08 + j * (2 * so - .16) / 6, zc - 1.2 + h, j + k * 5);
  }
  // Techo en voladizo sobre los dos graderíos (concreto y moderno).
  if (e >= 2) {
    const zt = 17;
    for (const [pts, col] of [[[[-so, -so], [-so, so], [-sf, so], [-sf, -so]], e === 3 ? '#F4F1E8' : '#C9C6BE'], [[[-so, -so], [-sf, -so], [-sf, -sf - .0], [-so, -sf]], e === 3 ? '#E6E2D8' : '#B3B0A8']]) { void pts; void col; }
    rellena(g, [P(-so, -so, zt), P(-so, so, zt), P(-sf + .02, so, zt - 1.5), P(-sf + .02, -so, zt - 1.5)], e === 3 ? '#F4F1E8' : '#C9C6BE', K.contorno, .4);
    rellena(g, [P(-so, -so, zt), P(-sf + .02, -so, zt - 1.5), P(-sf + .02, -sf, zt - 1.5), P(-so, -sf, zt)], e === 3 ? '#E6E2D8' : '#B3B0A8', K.contorno, .4);
    for (const [r, c] of [[-so + .04, -so + .06], [-so + .04, so - .06], [-sf, -so + .06]]) { const a = P(r, c, 0), b = P(r, c, zt - .6); g.strokeStyle = e === 3 ? '#8A8E92' : '#7A766C'; g.lineWidth = 1.3; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); }
  }
  // Frente bajo: valla de palos (tierra), muro con arcos (piedra y ladrillo) o barandas (concreto).
  const alto = e === 0 ? 3.2 : 4.4;
  if (e === 0) {
    g.strokeStyle = K.maderaOsc; g.lineWidth = 1; for (let k = 0; k <= 9; k++) { const t = -so + k * 2 * so / 9; for (const [a, b] of [[P(so, t, zc), P(so, t, zc + alto)], [P(t, so, zc), P(t, so, zc + alto)]]) { g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); } }
    g.strokeStyle = '#C9B48A'; g.lineWidth = .6; for (const z of [1.5, 3]) { g.beginPath(); g.moveTo(...P(so, -so, zc + z)); g.lineTo(...P(so, so, zc + z)); g.lineTo(...P(-so, so, zc + z)); g.stroke(); }
  } else {
    const col = e === 1 ? '#D8CAAA' : e === 2 ? K.ladrillo : '#E4E0D6';
    const FR = caras(2 * so, .05, alto, so, 0, zc - 1.2 + 1.2), FD = caras(.05, 2 * so, alto, 0, so, zc);
    rellena(g, FR.izq, col); rellena(g, FR.der, mezcla(col, '#000000', .2));
    rellena(g, FD.izq, mezcla(col, '#000000', .1)); rellena(g, FD.der, mezcla(col, '#000000', .22));
    if (e === 1 || e === 2) { arcada(g, { ...FR, en: FR.en }, 'izq', 6, 0, alto - 1, .06, .94, '#5A4A3C'); }
    else { g.strokeStyle = '#8A8E92'; g.lineWidth = .5; for (let k = 0; k <= 12; k++) { const u = k / 12; g.beginPath(); g.moveTo(...FR.en('izq', u, 0)); g.lineTo(...FR.en('izq', u, alto)); g.stroke(); } }
    const pt = P(so - .02, .02, zc); rellena(g, [[pt[0] - 6, pt[1] + 1], [pt[0] + 6, pt[1] + 1], [pt[0] + 6, pt[1] - 7], [pt[0] - 6, pt[1] - 7]], '#4A3A2C', K.contorno, .4);
  }
  // Mástiles de luz, banderines y bandera.
  if (e >= 2) for (const [r, c] of [[so - .03, so - .03], [so - .03, -so + .03], [-so + .03, so - .03]]) { const a = P(r, c, 0), b = P(r, c, 24); g.strokeStyle = '#6B6258'; g.lineWidth = 1.1; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); rellena(g, [[b[0] - 5, b[1] - 1], [b[0] + 5, b[1] - 1], [b[0] + 5, b[1] - 4], [b[0] - 5, b[1] - 4]], '#F6E3A0', K.contorno, .3); }
  if (e <= 1) { const a = P(so, -so, zc + alto), b = P(so, so, zc + alto), c = P(-so, so, zc + alto); for (const [p, q] of [[a, b], [b, c]]) { g.strokeStyle = '#6B4F3A'; g.lineWidth = .4; g.beginPath(); g.moveTo(...p); g.quadraticCurveTo((p[0] + q[0]) / 2, (p[1] + q[1]) / 2 + 3, ...q); g.stroke(); for (let k = 1; k < 8; k++) { const t = k / 8, x = p[0] + (q[0] - p[0]) * t, y = p[1] + (q[1] - p[1]) * t + Math.sin(t * Math.PI) * 3; g.fillStyle = ['#C0602A', '#E7C76B', '#2D6E5E', '#C4513B'][k % 4]; g.beginPath(); g.moveTo(x - 1.2, y); g.lineTo(x + 1.2, y); g.lineTo(x, y + 2.4); g.fill(); } } }
  const bb = P(so - .04, so - .04, zc); bandera(g, bb[0], bb[1], e >= 2 ? 24 : 16, TRICOLOR);
  void rng;
}

// Cantera de cuatro épocas: un frente de roca en terrazas, sillares cortados y la máquina de cada época.
function canteraN(g, e) {
  const roca = e === 3 ? '#9AA0A4' : '#A39A88', rocaOsc = mezcla(roca, '#000000', .1), cuerpo = '#D9D0BC';
  g.save(); g.globalAlpha = .2; g.fillStyle = '#26301E'; poli(g, [P(-.5, -.5), P(-.5, .5), P(.56, .58), P(.58, -.46)]); g.fill(); g.restore();
  suelo(g, .5, 0, '#C9B68E'); g.fillStyle = 'rgba(110,90,60,.3)'; for (let k = 0; k < 14; k++) { const q = P(-.4 + (k * .37 % 1) * .8, -.4 + (k * .61 % 1) * .8, 0); g.beginPath(); g.ellipse(q[0], q[1], 2.2, 1, 0, 0, 7); g.fill(); }
  // Una hoya excavada: dos muros de roca escalonados al fondo y el piso de trabajo al frente.
  const cajas = [];
  // Muro del fondo derecho (r negativo): una pared alta y un escalón en dos tramos.
  cajas.push({ w: .98, d: .17, h: 25, r: -.41, c: 0 }, { w: .48, d: .15, h: 15, r: -.24, c: -.25 }, { w: .48, d: .15, h: 11, r: -.24, c: .25 });
  // Muro del fondo izquierdo (c negativo).
  cajas.push({ w: .17, d: .8, h: 25, r: .09, c: -.41 }, { w: .15, d: .4, h: 14, r: -.02, c: -.24 }, { w: .15, d: .4, h: 10, r: .38, c: -.24 });
  cajas.sort((x, y) => (x.r + x.c) - (y.r + y.c));
  for (const { w, d, h, r, c } of cajas) {
    const B = caja(g, w, d, h, r, c, 0, roca);
    g.save(); g.strokeStyle = 'rgba(60,54,44,.4)'; g.lineWidth = .5;
    for (let z = 3.2; z < h; z += 3.8) for (const cara of ['izq', 'der']) { g.beginPath(); g.moveTo(...B.en(cara, 0, z)); g.lineTo(...B.en(cara, 1, z + (z % 2 ? .8 : -.6))); g.stroke(); }
    g.restore();
    // Peñascos sobre el borde de arriba.
    const q = P(r, c, h); g.fillStyle = rocaOsc; g.beginPath(); g.ellipse(q[0] + 2, q[1] - 1, 4.4, 1.9, 0, 0, 7); g.fill(); g.fillStyle = mezcla(roca, '#FFFFFF', .22); g.beginPath(); g.ellipse(q[0] - 3, q[1] - 2, 3, 1.4, 0, 0, 7); g.fill();
    if (h > 20) { g.fillStyle = '#9FA86A'; g.beginPath(); g.ellipse(q[0], q[1] - 3, 5, 1.8, 0, 0, 7); g.fill(); }
  }
  // Rampa de tierra que baja por el frente izquierdo al piso de la hoya.
  rellena(g, [P(.14, -.5, 7), P(.34, -.5, 7), P(.34, -.1, 0), P(.14, -.1, 0)], '#B9A57C', null);
  g.strokeStyle = 'rgba(80,60,40,.4)'; g.lineWidth = .4; for (let k = 1; k < 5; k++) { const t = k / 5; g.beginPath(); g.moveTo(...P(.14, -.5 + .4 * t, 7 - 7 * t)); g.lineTo(...P(.34, -.5 + .4 * t, 7 - 7 * t)); g.stroke(); }
  // Sillares ya cortados al frente.
  const pila = [[.32, -.3, 0], [.32, -.18, 0], [.26, -.3, 4.6], [.4, -.26, 0]];
  for (const [r, c, z] of pila) caja(g, .12, .1, 4.6, r, c, z, cuerpo);
  const a = P(.1, .3); const carretilla = () => { rellena(g, [[a[0] - 5, a[1] - 3], [a[0] + 3, a[1] + 1], [a[0] + 3, a[1] - 3], [a[0] - 5, a[1] - 7]], '#6E4529', K.contorno, .3); g.fillStyle = '#D9D0BC'; g.fillRect(a[0] - 3.4, a[1] - 7.4, 5, 3); g.fillStyle = '#2E2A28'; g.beginPath(); g.arc(a[0] + 4, a[1] + 1.4, 1.6, 0, 7); g.fill(); };
  if (e <= 1) {
    // Grúa de palo con polea y cuerda sobre un sillar colgado.
    const base = P(.24, .06, 0), tope = P(.24, .06, 30); g.strokeStyle = K.maderaOsc; g.lineWidth = 1.6; g.lineCap = 'round'; g.beginPath(); g.moveTo(...base); g.lineTo(...tope); g.stroke();
    g.lineWidth = 1.2; g.beginPath(); g.moveTo(tope[0], tope[1]); g.lineTo(tope[0] - 15, tope[1] + 4); g.moveTo(base[0] - 5, base[1] + 3); g.lineTo(tope[0], tope[1] + 12); g.stroke();
    g.strokeStyle = '#4A4036'; g.lineWidth = .5; g.beginPath(); g.moveTo(tope[0] - 14, tope[1] + 4.2); g.lineTo(tope[0] - 14, tope[1] + 16); g.stroke(); caja(g, .12, .1, 4, .24, -.18, 0, cuerpo); carretilla();
  } else if (e === 2) {
    // Vía de rieles y vagoneta con piedra.
    g.strokeStyle = '#5A5148'; g.lineWidth = .8; for (const o of [-.02, .06]) { g.beginPath(); g.moveTo(...P(.2 + o, -.4, 0)); g.lineTo(...P(.2 + o, .42, 0)); g.stroke(); }
    g.strokeStyle = K.maderaOsc; g.lineWidth = .6; for (let k = 0; k < 9; k++) { const c = -.38 + k * .1; g.beginPath(); g.moveTo(...P(.17, c, 0)); g.lineTo(...P(.27, c, 0)); g.stroke(); }
    const v = P(.24, .22, 0); rellena(g, [[v[0] - 6, v[1] - 2], [v[0] + 5, v[1] + 3], [v[0] + 5, v[1] - 3], [v[0] - 6, v[1] - 8]], '#5E646C', K.contorno, .3); rellena(g, [[v[0] - 6, v[1] - 8], [v[0] + 5, v[1] - 3], [v[0] + 7, v[1] - 4.4], [v[0] - 4, v[1] - 9.8]], '#8A9096', K.contorno, .3);
    for (const [dx, dy] of [[-2, -10.4], [1, -9], [3, -7.2]]) { g.fillStyle = '#B9B09C'; g.beginPath(); g.ellipse(v[0] + dx, v[1] + dy, 2, 1.4, 0, 0, 7); g.fill(); }
  } else {
    // Excavadora amarilla y volqueta.
    const x = P(.28, .1); g.fillStyle = '#2E2A28'; g.beginPath(); g.ellipse(x[0], x[1] + 1, 9, 3, 0, 0, 7); g.fill();
    rellena(g, [[x[0] - 7, x[1] - 1], [x[0] + 5, x[1] + 3.5], [x[0] + 5, x[1] - 3], [x[0] - 7, x[1] - 7.5]], '#E0A92A', K.contorno, .3);
    rellena(g, [[x[0] - 5, x[1] - 8], [x[0] + 1, x[1] - 5.6], [x[0] + 1, x[1] - 11], [x[0] - 5, x[1] - 13.4]], '#E7B83A', K.contorno, .3);
    g.strokeStyle = '#E0A92A'; g.lineWidth = 1.6; g.lineCap = 'round'; g.beginPath(); g.moveTo(x[0] - 5, x[1] - 11); g.lineTo(x[0] - 12, x[1] - 17); g.lineTo(x[0] - 15, x[1] - 11); g.stroke();
    rellena(g, [[x[0] - 17, x[1] - 11], [x[0] - 13, x[1] - 9], [x[0] - 13, x[1] - 12.5], [x[0] - 17, x[1] - 14]], '#6E6E6E', K.contorno, .3);
    const t = P(.16, -.26); carro(g, t[0], t[1], '#E0A92A', '#2E2A28');
  }
  // Polvo suspendido sobre el frente.
  g.save(); g.globalAlpha = .18; g.fillStyle = '#E6DCC0'; for (const [dx, dy, rx] of [[-14, -26, 9], [-4, -32, 7], [10, -22, 8]]) { g.beginPath(); g.ellipse(dx, dy, rx, rx * .5, 0, 0, 7); g.fill(); } g.restore();

}


// ---------- Teatro al aire libre, museo con muro de nichos, cancha, y retoques de banco, hospital, biblioteca y cuartel ----------
// Anillo de gradas semicircular alrededor de (r0, c0): peldaños de afuera hacia adentro que suben hacia el espectador.
function gradasArco(g, r0, c0, rIn, rOut, n, z0, paso, col, colFrente, gente) {
  const pt = (a, rad, z) => P(r0 + rad * Math.sin(a), c0 + rad * Math.cos(a), z), A = 24;
  for (let k = 0; k < n; k++) {
    const r1 = rIn + (rOut - rIn) * k / n, r2 = rIn + (rOut - rIn) * (k + 1) / n, z = z0 + paso * (k + 1);
    const top = []; for (let i = 0; i <= A; i++) top.push(pt(Math.PI * i / A, r2, z)); for (let i = A; i >= 0; i--) top.push(pt(Math.PI * i / A, r1, z));
    rellena(g, top, mezcla(col, '#FFFFFF', .12 * (k % 2)), K.contorno, .25);
    const fr = []; for (let i = 0; i <= A; i++) fr.push(pt(Math.PI * i / A, r2, z)); for (let i = A; i >= 0; i--) fr.push(pt(Math.PI * i / A, r2, z - paso));
    rellena(g, fr, colFrente, null);
    if (gente) for (let i = 1; i < 9; i++) { const a = Math.PI * i / 9, q = pt(a, (r1 + r2) / 2, z); g.fillStyle = ['#C0392B', '#E7C76B', '#2D5D72', '#F4F1E6', '#6E8F4A'][(i * 3 + k) % 5]; g.globalAlpha = .9; g.beginPath(); g.arc(q[0], q[1] - 1, .8, 0, 7); g.fill(); g.globalAlpha = 1; }
  }
}
function teatroN(g, e) {
  g.save(); g.scale(1.22, 1.22);
  teatroDib(g, e);
  g.restore();
}
function teatroDib(g, e) {
  const piedra = ['#B09A72', '#D8C9A4', '#C9825E', '#DAD6CC'][e], oscuro = mezcla(piedra, '#000000', .25);
  g.save(); g.globalAlpha = .18; g.fillStyle = '#26301E'; poli(g, [P(-.5, -.5), P(-.5, .5), P(.58, .6), P(.6, -.48)]); g.fill(); g.restore();
  suelo(g, .52, 0, e === 0 ? '#C9B68E' : '#CFC4AA');
  // Gradas en media luna frente al escenario.
  gradasArco(g, -.12, 0, .17, .6, 5, 0, 1.6, e === 0 ? '#9A7A4A' : piedra, oscuro, e >= 1);
  // Escenario al fondo.
  caja(g, .74, .3, 4, -.34, 0, 0, e === 0 ? '#8A5A36' : mezcla(piedra, '#000000', .1));
  const base = caras(.74, .3, 4, -.34, 0, 0);
  if (e === 0) { // tablado con telón de tela y banderines
    for (const c of [-.34, .34]) { const p = P(-.44, c, 4), q = P(-.44, c, 24); g.strokeStyle = K.maderaOsc; g.lineWidth = 1.4; g.beginPath(); g.moveTo(...p); g.lineTo(...q); g.stroke(); }
    const a = P(-.44, -.34, 22), b = P(-.44, .34, 22); rellena(g, [a, b, [b[0], b[1] + 14], [a[0], a[1] + 14]], '#B9442F', K.contorno, .4);
    g.strokeStyle = 'rgba(255,230,180,.5)'; g.lineWidth = .5; for (let k = 1; k < 8; k++) { const t = k / 8, x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 14); g.stroke(); }
    g.strokeStyle = '#6B4F3A'; g.lineWidth = .4; const p1 = P(-.44, -.34, 24), p2 = P(.1, -.4, 20); g.beginPath(); g.moveTo(...p1); g.quadraticCurveTo((p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2 + 4, ...p2); g.stroke();
  } else {
    // Concha acústica: muro trasero con un gran arco y nervaduras.
    const W = caja(g, .78, .1, 22, -.44, 0, 0, piedra);
    const interior = ['', '#6E4F34', '#7A3A28', '#EDEBE4'][e], arco = (u0, u1, z0, z1, col) => hueco(g, W, 'izq', u0, u1, z0, z1, col, true);
    arco(.1, .9, 4, 14, mezcla(oscuro, '#000000', .35));
    for (let k = 0; k < 4; k++) arco(.14 + k * .05, .86 - k * .05, 4, 13.5 - k * 2, mezcla(interior, '#FFFFFF', k * .12));
    g.strokeStyle = 'rgba(40,30,20,.55)'; g.lineWidth = .4; for (const u of [.3, .5, .7]) { g.beginPath(); g.moveTo(...W.en('izq', u, 4)); g.quadraticCurveTo(...W.en('izq', u, 13.5), ...W.en('izq', .5, 17)); g.stroke(); }
    // Remate con la bandera y un frontón bajo.
    const m = W.en('izq', .5, 22); rellena(g, [W.en('izq', .06, 22), W.en('izq', .94, 22), [m[0] + 18, m[1] - 3], [m[0] - 18, m[1] - 3]], mezcla(piedra, '#FFFFFF', .2), K.contorno, .4);
    if (e === 3) { g.strokeStyle = '#6E6E6E'; g.lineWidth = .8; const l = P(-.34, 0, 22); g.beginPath(); g.moveTo(l[0] - 14, l[1] + 12); g.lineTo(l[0] + 14, l[1] + 12); g.stroke(); for (const dx of [-12, -4, 4, 12]) { g.fillStyle = '#F6E3A0'; g.beginPath(); g.arc(l[0] + dx, l[1] + 12.6, 1, 0, 7); g.fill(); } }
  }
  // Escalones del escenario, faroles, bandera.
  caja(g, .3, .06, 1.6, -.17, 0, 0, mezcla(piedra, '#000000', .06));
  for (const c of [-.46, .46]) { const q = P(.26, c, 0); farol(g, q[0], q[1], 11); }
  const bd = P(-.46, .38, 4); bandera(g, bd[0], bd[1], e === 0 ? 14 : 22, TRICOLOR);
  const ar = P(.44, -.46, 0); arbolito(g, ar[0], ar[1], .9, '#5E8B42');
}

// Museo de la memoria: casona con patio, estanque y un muro de nichos con velas encendidas.
function museoN(g) {
  g.save(); g.globalAlpha = .2; g.fillStyle = '#26301E'; poli(g, [P(-.5, -.5), P(-.5, .5), P(.54, .58), P(.56, -.46)]); g.fill(); g.restore();
  suelo(g, .5, 0, '#CDBF9E'); empedrado(g, .5, 0, .125, 'rgba(90,76,56,.25)');
  // Casona del fondo: corredor largo y techo de teja.
  const F = caras(.66, .26, 12, -.26, -.14);
  sombraCasa(g, F); muros(g, F, '#EFE0B8', '#6E4A3A');
  arcada(g, F, 'izq', 5, 0, 8.4, .04, .96, '#4A3A2C');
  for (const u of [.2, .5, .8]) ventana(g, F, 'izq', u, 10, .08, 1.8, '#6E4A3A', { vidrio: '#3A2A1E', postigos: false });
  dosAguas(g, F, 7, MAT.tejaVieja);
  letrero(g, F, .5, 11, '#3E3A34', null);
  // Muro de los nichos, a la derecha: cuadrícula de nichos con una vela en cada uno.
  const W = caras(.1, .78, 17, .02, .44);
  muros(g, W, '#5A5248', '#3A342C');
  for (let fila = 0; fila < 4; fila++) for (let col = 0; col < 9; col++) {
    const u = .07 + col * .1, z = 3 + fila * 3.4; hueco(g, W, 'der', u, u + .06, z, z + 2.2, '#2A2420');
    const q = W.en('der', u + .03, z + .7); g.fillStyle = '#F6D27A'; g.globalAlpha = .55 + ((col * 5 + fila * 3) % 4) * .1; g.beginPath(); g.ellipse(q[0], q[1], .55, .95, 0, 0, 7); g.fill(); g.globalAlpha = 1;
  }
  rellena(g, [P(W.f, W.a, 17), P(W.f, W.b, 17), P(W.t, W.b, 17), P(W.t, W.a, 17)], '#7A7266', null);
  // Estanque de reflejo y el árbol de la memoria.
  const q0 = P(.14, -.1, 1); rellena(g, [P(.08, -.34, 1), P(.08, .12, 1), P(.3, .12, 1), P(.3, -.34, 1)], '#7FB3C4', K.contorno, .4); caja(g, .52, .26, 1, .19, -.11, 0, '#BFB4A0'); rellena(g, [P(.08, -.34, 1.1), P(.08, .12, 1.1), P(.3, .12, 1.1), P(.3, -.34, 1.1)], '#7FB3C4', null);
  g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = .4; for (const k of [.12, .22, .3]) { g.beginPath(); g.moveTo(...P(.14, -.3 + k, 1.2)); g.lineTo(...P(.14, -.2 + k, 1.2)); g.stroke(); } void q0;
  const t = P(.34, -.36, 0); arbolito(g, t[0], t[1], 1.25, '#5E8B42'); g.fillStyle = '#E7C76B'; for (const [dx, dy] of [[-7, -17], [4, -21], [8, -15], [-2, -13]]) { g.beginPath(); g.ellipse(t[0] + dx, t[1] + dy, .7, 1.6, 0, 0, 7); g.fill(); } // cintas amarillas
  const bd = P(.46, .42, 0); bandera(g, bd[0], bd[1], 24, TRICOLOR);
}

// Cancha de microfútbol con malla, arcos con red, reflectores y una banca.
function canchaN(g) {
  g.save(); g.globalAlpha = .18; g.fillStyle = '#26301E'; poli(g, [P(-.5, -.5), P(-.5, .5), P(.56, .58), P(.58, -.46)]); g.fill(); g.restore();
  caja(g, 1, .8, 1.2, 0, 0, 0, '#B9B2A2');
  const z = 1.2;
  rellena(g, [P(-.4, -.46, z), P(-.4, .46, z), P(.4, .46, z), P(.4, -.46, z)], '#4F8A6A', null);
  rellena(g, [P(-.3, -.36, z), P(-.3, .36, z), P(.3, .36, z), P(.3, -.36, z)], '#6FA6BC', null);
  g.save(); g.strokeStyle = 'rgba(250,245,230,.9)'; g.lineWidth = .55;
  g.beginPath(); g.moveTo(...P(-.3, -.36, z)); g.lineTo(...P(-.3, .36, z)); g.lineTo(...P(.3, .36, z)); g.lineTo(...P(.3, -.36, z)); g.closePath(); g.stroke();
  g.beginPath(); g.moveTo(...P(0, -.36, z)); g.lineTo(...P(0, .36, z)); g.stroke(); const c0 = P(0, 0, z); g.beginPath(); g.ellipse(c0[0], c0[1], 6, 3, 0, 0, 7); g.stroke();
  for (const c of [-.36, .36]) { g.beginPath(); g.moveTo(...P(-.1, c, z)); g.lineTo(...P(.1, c, z)); g.stroke(); }
  g.restore();
  // Arcos con red.
  for (const c of [-.36, .36]) {
    const a = P(-.1, c, z), b = P(.1, c, z); g.strokeStyle = '#F4F1E8'; g.lineWidth = 1.1; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(a[0], a[1] - 9); g.lineTo(b[0], b[1] - 9); g.lineTo(b[0], b[1]); g.stroke();
    g.strokeStyle = 'rgba(240,240,235,.45)'; g.lineWidth = .3; for (let k = 1; k < 6; k++) { const t = k / 6, x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - 9); g.stroke(); }
  }
  // Malla perimetral: postes y alambre en los dos lados del frente.
  g.strokeStyle = '#6E7378'; g.lineWidth = .8;
  for (let k = 0; k <= 8; k++) { const c = -.5 + k * .125; for (const [p, q] of [[P(.45, c, 0), P(.45, c, 8)]]) { g.beginPath(); g.moveTo(...p); g.lineTo(...q); g.stroke(); } }
  for (let k = 0; k <= 6; k++) { const r = -.4 + k * .135; g.beginPath(); g.moveTo(...P(r, .52, 0)); g.lineTo(...P(r, .52, 8)); g.stroke(); }
  g.strokeStyle = 'rgba(150,158,165,.55)'; g.lineWidth = .35;
  for (let k = 0; k <= 4; k++) { const h = k * 2; g.beginPath(); g.moveTo(...P(.45, -.5, h)); g.lineTo(...P(.45, .5, h)); g.stroke(); g.beginPath(); g.moveTo(...P(-.4, .52, h)); g.lineTo(...P(.45, .52, h)); g.stroke(); }
  for (const [r, c] of [[-.36, -.46], [.36, -.46]]) { const a = P(r, c, 0), b = P(r, c, 22); g.strokeStyle = '#6B6258'; g.lineWidth = 1; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); rellena(g, [[b[0] - 4, b[1] - 1], [b[0] + 4, b[1] - 1], [b[0] + 4, b[1] - 3.6], [b[0] - 4, b[1] - 3.6]], '#F6E3A0', K.contorno, .3); }
  const bn = P(.52, -.1, 0); bancoMadera(g, bn[0], bn[1]);
  const bd = P(.5, .5, 0); bandera(g, bd[0], bd[1], 16, TRICOLOR);
}

// Banco con pórtico de columnas y frontón (época 1 y 2): la fachada se reconoce de lejos.
function bancoClasico(g, e) {
  const piedra = e === 1 ? '#EDE4D2' : '#E6DCC6', F = caras(.8, .58, 19, -.06, 0);
  sombraCasa(g, F); muros(g, F, piedra, e === 2 ? '#6E6658' : '#5A3A2A');
  if (e === 2) sillares(g, F);
  for (const u of [.12, .88]) { hueco(g, F, 'izq', u - .07, u + .07, 4, 12, '#3A3A3A', true); hueco(g, F, 'izq', u - .06, u + .06, 14, 17.4, '#3A3A3A', true); }
  for (const u of [.3, .7]) { hueco(g, F, 'der', u - .07, u + .07, 4, 12, '#3A3A3A', true); hueco(g, F, 'der', u - .06, u + .06, 14, 17.4, '#3A3A3A', true); }
  azotea(g, F, '#CFC5AE');
  // Pórtico: gradas, cuatro columnas, friso con su letrero y frontón con la moneda.
  const f = F.f + .09; caja(g, .5, .16, 1.6, F.f + .06, 0, 0, '#D8CEB8'); caja(g, .46, .12, 1.4, F.f + .05, 0, 1.6, '#D8CEB8');
  hueco(g, F, 'izq', .4, .6, 3, 13, '#2E2A28', true); // la puerta fuerte
  g.fillStyle = '#C9A24A'; const pm = F.en('izq', .5, 8); g.beginPath(); g.arc(pm[0], pm[1], 1.3, 0, 7); g.fill();
  for (const c of [-.2, -.07, .07, .2]) caja(g, .045, .045, 14, f, c, 3, '#F4EEE2');
  caja(g, .5, .1, 2.2, f, 0, 17, '#F4EEE2'); const l = P(f + .06, 0, 18); g.save(); g.fillStyle = '#8A6A2A'; g.font = 'bold 2.6px serif'; g.textAlign = 'center'; g.fillText('BANCO', l[0], l[1] + .6); g.restore();
  const A = P(f + .06, -.27, 19.2), B = P(f + .06, .27, 19.2), M = P(f + .06, 0, 27);
  rellena(g, [A, B, M], '#F4EEE2'); g.strokeStyle = K.contorno; g.lineWidth = .5; g.beginPath(); g.moveTo(...A); g.lineTo(...M); g.lineTo(...B); g.closePath(); g.stroke();
  const mc = P(f + .06, 0, 21.4); g.fillStyle = '#C9A24A'; g.beginPath(); g.arc(mc[0], mc[1], 2.2, 0, 7); g.fill(); g.strokeStyle = '#8A6A2A'; g.lineWidth = .4; g.stroke(); g.fillStyle = '#8A6A2A'; g.font = 'bold 3px serif'; g.textAlign = 'center'; g.fillText('$', mc[0], mc[1] + 1);
  if (e === 2) { const c = F.en('izq', .82, 19); cupula(g, c[0], c[1] - 2, 7.5, 11, '#5E7F6E'); }
  const fa = P(f + .1, -.34, 0); farol(g, fa[0], fa[1], 10); const fb = P(f + .1, .34, 0); farol(g, fb[0], fb[1], 10);
}
// Torre de la cruz roja y ambulancia: el hospital se reconoce por su cruz grande.
function hospitalExtra(g, e) {
  if (e === 0) { const p = P(.3, .3, 0); g.strokeStyle = K.maderaOsc; g.lineWidth = 1; g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(p[0], p[1] - 22); g.stroke(); rellena(g, [[p[0], p[1] - 22], [p[0] + 11, p[1] - 20], [p[0] + 11, p[1] - 12], [p[0], p[1] - 14]], '#F4F1E8', K.contorno, .4); g.fillStyle = '#B9442F'; g.fillRect(p[0] + 4.6, p[1] - 19.2, 1.8, 5.6); g.fillRect(p[0] + 2.8, p[1] - 17.2, 5.4, 1.8); return; }
  if (e === 3) return;
  const T = caras(.22, .22, 28, .3, -.02, 0), muro = e === 2 ? K.ladrillo : K.cal;
  sombraCasa(g, T); muros(g, T, muro, e === 2 ? '#5A3A2A' : '#2F5D8A'); if (e === 2) hiladas(g, T);
  const cz = T.en('izq', .5, 17); rellena(g, [[cz[0] - 3.6, cz[1] - 1.2], [cz[0] + 3.6, cz[1] - 1.2], [cz[0] + 3.6, cz[1] + 4], [cz[0] - 3.6, cz[1] + 4]], '#F4F1E8', K.contorno, .3);
  g.fillStyle = '#C0392B'; g.fillRect(cz[0] - 3.2, cz[1] + .2, 6.4, 2.2); g.fillRect(cz[0] - 1.1, cz[1] - 1.2, 2.2, 5.2); // la cruz grande
  hueco(g, T, 'izq', .3, .7, 0, 9, '#2F5D8A', true); hueco(g, T, 'izq', .35, .65, 21, 25, '#3A2A1E', true);
  piramide(g, T, 9, e === 2 ? MAT.pizarra.teja : K.teja);
  if (e === 2) { const a = P(.38, -.34); carro(g, a[0], a[1], '#F4F1E8', '#C0392B'); }
  else { const a = P(.44, -.3); g.fillStyle = '#6E4529'; g.beginPath(); g.ellipse(a[0], a[1] - 3, 3.2, 1.6, 0, 0, 7); g.fill(); g.strokeStyle = K.maderaOsc; g.lineWidth = .8; g.beginPath(); g.moveTo(a[0] - 6, a[1] - 5); g.lineTo(a[0] + 6, a[1] + 1); g.stroke(); } // camilla de lona
}
// Pórtico de la biblioteca: columnas, frontón con el libro abierto y los libros apilados.
function bibliotecaExtra(g, e) {
  const f = .3;
  if (e === 3) { const l = P(.4, .3, 0); for (let k = 0; k < 4; k++) rellena(g, [[l[0] - 6, l[1] - k * 2.2], [l[0] + 5, l[1] + 2.4 - k * 2.2], [l[0] + 5, l[1] + .4 - k * 2.2], [l[0] - 6, l[1] - 2 - k * 2.2]], ['#B9442F', '#2F5D8A', '#E7C76B', '#3E6B4A'][k], K.contorno, .3); return; }
  const col = e === 2 ? '#F4EEE2' : '#F4EEE2';
  caja(g, .38, .1, 1.8, f + .04, 0, 0, '#D8CEB8');
  for (const c of [-.13, .13]) caja(g, .045, .045, 12, f + .03, c, 1.8, col);
  caja(g, .36, .08, 1.8, f + .03, 0, 13.8, col);
  const A = P(f + .07, -.2, 15.6), B = P(f + .07, .2, 15.6), M = P(f + .07, 0, 21.6);
  rellena(g, [A, B, M], col); g.strokeStyle = K.contorno; g.lineWidth = .5; g.beginPath(); g.moveTo(...A); g.lineTo(...M); g.lineTo(...B); g.closePath(); g.stroke();
  const o = P(f + .07, 0, 17.4); rellena(g, [[o[0] - 5, o[1] + 1.2], [o[0], o[1] + 2.6], [o[0], o[1] - 2.4], [o[0] - 5, o[1] - 3.8]], '#FFFFFF', '#3A2A1E', .35); rellena(g, [[o[0], o[1] + 2.6], [o[0] + 5, o[1] + 1.2], [o[0] + 5, o[1] - 3.8], [o[0], o[1] - 2.4]], '#F2EAD6', '#3A2A1E', .35);
  g.strokeStyle = 'rgba(60,40,30,.45)'; g.lineWidth = .3; for (const dy of [-1.4, 0, 1.4]) { g.beginPath(); g.moveTo(o[0] - 4, o[1] + dy - 1); g.lineTo(o[0] - 1, o[1] + dy + .2); g.moveTo(o[0] + 1, o[1] + dy + .2); g.lineTo(o[0] + 4, o[1] + dy - 1); g.stroke(); }
  const l = P(.4, -.3, 0); for (let k = 0; k < 4; k++) rellena(g, [[l[0] - 5, l[1] - k * 2], [l[0] + 5, l[1] + 2.2 - k * 2], [l[0] + 5, l[1] + .3 - k * 2], [l[0] - 5, l[1] - 1.9 - k * 2]], ['#B9442F', '#2F5D8A', '#E7C76B', '#3E6B4A'][(k + e) % 4], K.contorno, .3);
}
// Cuartel: segunda torre, garita rayada con su centinela, costales y un asta alta.
function cuartelExtra(g, e) {
  if (e === 0) return;
  const muro = ['', '#D8C49B', K.ladrillo, '#B8B4AA'][e];
  if (e < 3) {
    const T = caras(.22, .22, 26, .2, .4, 0); muros(g, T, mezcla(muro, '#000000', .05), null, { ladrillo: e === 2 }); if (e === 1) sillares(g, T);
    hueco(g, T, 'izq', .35, .65, 17, 21, '#2E2420'); almenas(g, T, muro, 3, 2.2);
  }
  const G = caras(.13, .13, 10, .34, .12, 0); muros(g, G, '#F4EEE2', null);
  for (const [i, col] of [[0, '#E8C23A'], [1, '#2F5D8A'], [2, '#B9442F']]) { const z = 1.2 + i * 2.6; rellena(g, [G.en('izq', 0, z), G.en('izq', 1, z), G.en('izq', 1, z + 1.7), G.en('izq', 0, z + 1.7)], col, null); }
  piramide(g, G, 5, '#5E7A52');
  const s = P(.46, .2, 0); g.fillStyle = '#4E5A34'; g.fillRect(s[0] - 1.3, s[1] - 7, 2.6, 5.4); g.fillStyle = '#C98E62'; g.beginPath(); g.arc(s[0], s[1] - 8.2, 1.3, 0, 7); g.fill(); g.fillStyle = '#3A3A2A'; g.fillRect(s[0] - 1.6, s[1] - 10, 3.2, 1.2); g.strokeStyle = '#2E2A28'; g.lineWidth = .7; g.beginPath(); g.moveTo(s[0] + 2, s[1] - 2); g.lineTo(s[0] + 2, s[1] - 10); g.stroke(); // soldado con fusil
  const sc = P(.38, -.18, 0); for (let k = 0; k < 3; k++) { g.fillStyle = k % 2 ? '#B8A27A' : '#C9B48A'; g.beginPath(); g.ellipse(sc[0] + k * 4, sc[1] + k * 2 - 1, 2.8, 1.8, .15, 0, 7); g.fill(); g.strokeStyle = 'rgba(90,60,35,.5)'; g.lineWidth = .3; g.stroke(); }
}

export function recetasPublicos(e = 1) {
  const L = [
    ['escuela', 96, 96, 48, 68, escuela],
    ['hospital', 104, 112, 52, 82, (g, e) => { hospital(g, e); hospitalExtra(g, e); }],
    ['taller', 84, 82, 42, 60, taller],
    ['recaudo', 84, 84, 42, 62, recaudo],
    ['biblioteca', 96, 108, 48, 80, (g, e) => { biblioteca(g, e); bibliotecaExtra(g, e); }],
    ['teatro', 138, 122, 69, 92, teatroN],
    ['cancha', 108, 74, 54, 44, g => canchaN(g)],
    ['policia', 88, 92, 44, 70, policia],
    ['cuartel', 112, 112, 56, 82, (g, e) => { cuartel(g, e); cuartelExtra(g, e); }],
    ['banco', 124, 140, 62, 108, (g, e) => { if (e === 1 || e === 2) { g.save(); g.scale(1.18, 1.18); bancoClasico(g, e); g.restore(); } else bancoEdificio(g, e); }],
    ['universidad', 108, 120, 54, 88, universidad],
    ['acueducto', 92, 72, 46, 48, acueducto],
    ['plaza0', 100, 80, 50, 56, g => plazaN(g, 0)], ['plaza1', 100, 82, 50, 58, g => plazaN(g, 1)], ['plaza2', 100, 84, 50, 60, g => plazaN(g, 2)], ['plaza3', 100, 90, 50, 66, g => plazaN(g, 3)],
    ['estadio', 148, 124, 74, 94, estadioN],
    ['m_museo', 104, 104, 52, 76, g => museoN(g)],
    ['molino', 88, 74, 44, 54, molino],
    ['aserradero', 92, 78, 46, 54, aserradero],
    ['cantera', 104, 96, 52, 68, canteraN],
    ['estudio', 84, 84, 42, 56, estudio],
    ['puerto', 96, 76, 48, 52, puerto],
    ['sede-republica', 104, 104, 52, 72, cabildo],
    ['sede-monarquia', 104, 112, 52, 78, palacio],
    ['sede-aristocracia', 104, 100, 52, 72, casona],
    ['sede-tirania', 100, 104, 50, 76, fortaleza],
    ['sede-oligarquia', 100, 100, 50, 70, comercio],
    ['sede-demagogia', 100, 96, 50, 66, tribuna],
    ['mercado0', 90, 76, 45, 52, g => mercadoToldos(g, e, false)], ['mercado0v', 90, 76, 45, 52, g => mercadoToldos(g, e, true)],
    ['mercado2', 100, 96, 50, 68, g => mercadoCubierto(g, e, false)], ['mercado2v', 100, 96, 50, 68, g => mercadoCubierto(g, e, true)]
  ].map(([k, w, h, ax, ay, f]) => [k, w, h, ax, ay, g => f(g, e)]);
  // La iglesia: capilla de bahareque, iglesia colonial con espadaña, templo de dos torres y templo restaurado.
  return [...L, ...[0, 1, 2, 3].map(k => ['iglesia' + k, 110, 130, 55, 96, g => iglesiaEpoca(g, k)])];
}

// Para la portada: la iglesia y el cabildo pintados fuera del mapa.
export { iglesiaEpoca, cabildo };
