// Edificios públicos coloniales (renovación colonial, paso 5; antes templos griegos). Pedido de Juan: diferenciar
// al máximo. Cada obra tiene una silueta propia que se reconoce de lejos:
//   escuela: casa larga con corredor y espadaña con campana; hospital: dos pisos con galería de arcos y capilla;
//   taller: ramada abierta con banco de trabajo y horno de ladrillo con chimenea; recaudo: casa fuerte de piedra
//   con rejas y balanza; biblioteca: casa de la cultura con linterna en el techo; teatro: fachada alta con tres
//   arcos y pretil; policía: casa con garita y farol; cuartel: muralla con almenas y torreón; banco: esquina con
//   cúpula; universidad: claustro con torre del reloj; acueducto: arcos de piedra con su canal; molino: casa de
//   piedra con rueda hidráulica; puerto: bodega, muelle de madera y champán. La sede del gobierno cambia con el
//   régimen: cabildo de portales (república), palacio con torreones (monarquía), casona con escudo (aristocracia),
//   fortaleza (tiranía), casa de comercio de ladrillo (oligarquía) y tribuna popular (demagogia).
import { P, K, mezcla, poli, rellena, grad, caras, muros, hiladas, hueco, ventana, puerta, balcon, dosAguas, cuatroAguas, sombraCasa, materas, bancoMadera } from './casas.js';

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
  const z = F.z0 + F.H, o = .03, cr = (F.f + F.t) / 2, cc = (F.a + F.b) / 2, A = P(cr, cc, z + alto);
  rellena(g, [P(F.f + o, F.a - o, z), P(F.f + o, F.b + o, z), A], grad(g, 0, A[1], 0, P(F.f, F.a, z)[1], [[0, K.tejaLuz], [1, teja]]));
  rellena(g, [P(F.f + o, F.b + o, z), P(F.t - o, F.b + o, z), A], K.tejaSombra);
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

// ---------- Obras ----------
function escuela(g) {
  const F = caras(.82, .44, 15, -.08);
  sombraCasa(g, F); muros(g, F, K.cal, '#3E6B4A');
  puerta(g, F, 'izq', .5, .14, 10, '#3E6B4A');
  for (const u of [.18, .32, .68, .82]) ventana(g, F, 'izq', u, 4, .08, 6, '#3E6B4A');
  ventana(g, F, 'der', .5, 4, .16, 6, '#3E6B4A');
  dosAguas(g, F, 10, { sale: .2 });
  g.strokeStyle = K.maderaOsc; g.lineWidth = 1.2; for (const u of [.03, .35, .65, .97]) { const c = F.a + (F.b - F.a) * u, p = P(F.f + .18, c, 0), q = P(F.f + .18, c, 13.2); g.beginPath(); g.moveTo(...p); g.lineTo(...q); g.stroke(); }
  // Espadaña con la campana sobre el hastial del costado.
  const e = P((F.f + F.t) / 2, F.b, 15 + 9); rellena(g, [[e[0] - 3.5, e[1] + 4], [e[0] + 3.5, e[1] + 4], [e[0] + 3.5, e[1] - 6], [e[0], e[1] - 10], [e[0] - 3.5, e[1] - 6]], K.cal);
  g.fillStyle = '#3A2A1E'; g.beginPath(); g.ellipse(e[0], e[1] - 3, 1.8, 2.6, 0, 0, 7); g.fill(); g.fillStyle = '#C9A24A'; g.beginPath(); g.moveTo(e[0] - 1.3, e[1] - 1.4); g.quadraticCurveTo(e[0], e[1] - 5.2, e[0] + 1.3, e[1] - 1.4); g.fill();
  const b = P(F.f + .32, F.a + .06); bandera(g, b[0], b[1], 22, TRICOLOR);
  // Pizarra y pupitre en el corredor.
  const pz = P(F.f + .06, F.a + .62, 5); rellena(g, [[pz[0] - 3, pz[1]], [pz[0] + 3, pz[1] + 1.5], [pz[0] + 3, pz[1] - 2.5], [pz[0] - 3, pz[1] - 4]], '#2E4A3A', K.contorno, .3);
}
function hospital(g) {
  const F = caras(.86, .42, 24, -.06);
  sombraCasa(g, F); muros(g, F, '#F2ECE0', '#2F5D8A');
  arcada(g, F, 'izq', 6, 0, 8.5, .04, .96, '#5A4A3C');
  for (let k = 0; k < 6; k++) ventana(g, F, 'izq', .04 + (k + .5) * .92 / 6, 14, .06, 6, '#2F5D8A');
  arcada(g, F, 'der', 2, 0, 8.5, .1, .9, '#4A3A2C'); ventana(g, F, 'der', .5, 14, .14, 6, '#2F5D8A');
  dosAguas(g, F, 11);
  // Capilla al centro: hastial con cruz y la cruz roja del hospital.
  const a = F.en('izq', .4, 24), b = F.en('izq', .6, 24), m = F.en('izq', .5, 34);
  rellena(g, [a, b, [b[0], b[1] - 3], m, [a[0], a[1] - 3]], K.cal); cruz(g, m[0], m[1], .8);
  const c = F.en('izq', .5, 27.5); g.fillStyle = '#B9442F'; g.fillRect(c[0] - .6, c[1] - 2, 1.2, 4); g.fillRect(c[0] - 2, c[1] - .6, 4, 1.2);
}
function taller(g) {
  // Horno de ladrillo con chimenea (atrás) y ramada de madera abierta con el banco de trabajo.
  const Hn = caras(.3, .3, 9, -.22, .2);
  rellena(g, Hn.izq, '#B5654A'); rellena(g, Hn.der, '#97503A'); hiladas(g, Hn);
  const cx = P(-.22, .2, 9); cupula(g, cx[0], cx[1] + 2, 9.5, 6, '#A85A40', false);
  rellena(g, [[9, -3], [13.5, -1], [13.5, -34], [9, -36]], '#9E5A44'); rellena(g, [[8.5, -36], [14, -33.4], [14, -35.4], [8.5, -38]], '#5A3A2C'); // chimenea: el humo sale de su boca
  hueco(g, Hn, 'izq', .3, .7, 0, 5, '#3A1E14', true); g.fillStyle = 'rgba(240,140,50,.8)'; const fu = Hn.en('izq', .5, 1.6); g.beginPath(); g.ellipse(fu[0], fu[1], 1.6, 1, 0, 0, 7); g.fill();
  const R = caras(.6, .44, 12, .12, -.1);
  // Ramada: solo postes y techo; debajo, el banco, la rueda de alfarero y la leña.
  const piso = [P(R.f, R.a), P(R.f, R.b), P(R.t, R.b), P(R.t, R.a)]; rellena(g, piso, '#BFA87C', null);
  for (const [r, c] of [[R.t, R.a], [R.t, R.b]]) { const p = P(r, c), q = P(r, c, 12); g.strokeStyle = K.maderaOsc; g.lineWidth = 1.2; g.beginPath(); g.moveTo(...p); g.lineTo(...q); g.stroke(); }
  const bn = P(.12, -.1, 0); rellena(g, [[bn[0] - 7, bn[1] - 3], [bn[0] + 6, bn[1] + 3.5], [bn[0] + 6, bn[1] + 1.5], [bn[0] - 7, bn[1] - 5]], K.maderaLuz, K.contorno, .3);
  g.strokeStyle = K.maderaOsc; g.lineWidth = .7; for (const [dx, dy] of [[-6, -3], [5, 3]]) { g.beginPath(); g.moveTo(bn[0] + dx, bn[1] + dy - 1.5); g.lineTo(bn[0] + dx, bn[1] + dy + 2); g.stroke(); }
  for (const [dx, c] of [[-3, '#B5683A'], [0, '#C98A50'], [3, '#A55A30']]) { g.fillStyle = c; g.beginPath(); g.ellipse(bn[0] + dx, bn[1] - 5 + dx * .45, 1.3, 1.8, 0, 0, 7); g.fill(); } // vasijas
  const lena = P(R.f - .04, R.b + .06); for (let k = 0; k < 4; k++) { g.strokeStyle = k % 2 ? '#7A5536' : '#5E4129'; g.lineWidth = 1.3; g.beginPath(); g.moveTo(lena[0] - 4, lena[1] - k * 1.2); g.lineTo(lena[0] + 3, lena[1] - k * 1.2 + 2); g.stroke(); }
  for (const [r, c] of [[R.f, R.a], [R.f, R.b]]) { const p = P(r, c), q = P(r, c, 12); g.strokeStyle = K.maderaOsc; g.lineWidth = 1.3; g.beginPath(); g.moveTo(...p); g.lineTo(...q); g.stroke(); }
  const T = caras(.6, .44, 0, .12, -.1, 12); dosAguas(g, T, 7, { hastial: '#8A5A36' });
}
function recaudo(g) {
  const F = caras(.5, .5, 18, -.04);
  sombraCasa(g, F); muros(g, F, PIEDRA, null); sillares(g, F);
  puerta(g, F, 'izq', .5, .2, 11, '#4A2D1A', true);
  g.fillStyle = '#2E2420'; for (const z of [3, 6, 9]) { const a = F.en('izq', .41, z), b = F.en('izq', .59, z); g.fillRect(Math.min(a[0], b[0]), Math.min(a[1], b[1]) - .3, Math.abs(b[0] - a[0]), .6 + Math.abs(b[1] - a[1])); } // herrajes
  for (const u of [.17, .83]) ventana(g, F, 'izq', u, 7, .1, 6, '#3A3A3A', { postigos: false });
  ventana(g, F, 'der', .5, 7, .14, 6, '#3A3A3A', { postigos: false });
  cuatroAguas(g, F, 9);
  escudo(g, ...F.en('izq', .5, 15.2), .9);
  // Balanza de la Real Hacienda colgada de su soporte y cofres con sacos.
  const p = F.en('izq', .82, 13); g.strokeStyle = '#2E2A28'; g.lineWidth = .6; g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(p[0] + 5, p[1] + 2.5); g.moveTo(p[0] + 3.5, p[1] + 1.8); g.lineTo(p[0] + 3.5, p[1] + 4); g.moveTo(p[0] + 1.5, p[1] + 4); g.lineTo(p[0] + 5.5, p[1] + 4); g.stroke();
  g.fillStyle = '#C9A24A'; for (const dx of [1.5, 5.5]) { g.beginPath(); g.ellipse(p[0] + dx, p[1] + 5, 1.2, .5, 0, 0, 7); g.fill(); }
  const s = P(F.f + .14, F.a + .08); sacos(g, s[0], s[1]);
  const c = P(F.f + .14, F.b - .06); rellena(g, [[c[0] - 4, c[1] - 1], [c[0] + 3, c[1] + 2.5], [c[0] + 3, c[1] - 1.5], [c[0] - 4, c[1] - 5]], '#6E4529', K.contorno, .3); rellena(g, [[c[0] - 4, c[1] - 5], [c[0] + 3, c[1] - 1.5], [c[0] + 5, c[1] - 2.5], [c[0] - 2, c[1] - 6]], '#8A5A36', K.contorno, .3);
}
function biblioteca(g) {
  const F = caras(.62, .56, 24, -.04);
  sombraCasa(g, F); muros(g, F, '#EDE3CC', '#8E2F22');
  hueco(g, F, 'izq', .4, .6, 0, 11, '#5A3A26', true);
  for (const u of [.15, .85]) hueco(g, F, 'izq', u - .06, u + .06, 3, 10, '#3A2A1E', true);
  for (const u of [.15, .5, .85]) hueco(g, F, 'izq', u - .06, u + .06, 14, 20, '#3A2A1E', true);
  for (const u of [.3, .7]) { hueco(g, F, 'der', u - .07, u + .07, 3, 10, '#3A2A1E', true); hueco(g, F, 'der', u - .07, u + .07, 14, 20, '#3A2A1E', true); }
  balcon(g, F, .38, .62, 13.5, .1, '#2E2A28');
  cuatroAguas(g, F, 10);
  // Linterna octogonal con su cupulita en lo alto del techo.
  const c = P(-.04, 0, 34); rellena(g, [[c[0] - 4, c[1] + 4], [c[0] + 4, c[1] + 4], [c[0] + 4, c[1] - 2], [c[0] - 4, c[1] - 2]], K.cal); for (const dx of [-2, 0, 2]) { g.fillStyle = '#3A2A1E'; g.fillRect(c[0] + dx - .5, c[1] - 1, 1, 3.4); }
  cupula(g, c[0], c[1] - 2, 4.6, 5, '#B9552F');
  // Libro abierto pintado sobre la puerta.
  const l = F.en('izq', .5, 12.6); g.fillStyle = '#F7F1E3'; g.beginPath(); g.moveTo(l[0] - 3, l[1]); g.quadraticCurveTo(l[0] - 1.5, l[1] - 1.6, l[0], l[1] - .6); g.quadraticCurveTo(l[0] + 1.5, l[1] - 1.6, l[0] + 3, l[1]); g.lineTo(l[0] + 3, l[1] + 1.2); g.lineTo(l[0] - 3, l[1] + 1.2); g.fill(); g.strokeStyle = '#8E2F22'; g.lineWidth = .4; g.stroke();
}
function teatro(g) {
  const F = caras(.74, .7, 26, -.04);
  sombraCasa(g, F);
  // Sala detrás (techo a dos aguas) y fachada alta con pretil.
  const S = caras(.6, .5, 24, -.12); dosAguas(g, S, 10, { hastial: '#D9B878' });
  muros(g, F, OCRE, '#8E6A3A');
  arcada(g, F, 'izq', 3, 0, 11, .08, .92, '#5A3A26');
  for (let k = 0; k < 3; k++) { const u = .08 + (k + .5) * .84 / 3; hueco(g, F, 'izq', u - .07, u + .07, 15, 22, '#3A2A1E', true); }
  balcon(g, F, .08, .92, 14.5, .08, '#2E2A28');
  arcada(g, F, 'der', 3, 4, 8, .1, .9, '#5A3A26');
  // Pretil con balaustres y remate al centro con una lira.
  const a = F.en('izq', 0, 26), b = F.en('izq', 1, 26), d = F.en('der', 1, 26);
  rellena(g, [a, b, [b[0], b[1] - 3], [a[0], a[1] - 3]], mezcla(OCRE, '#FFFFFF', .2)); rellena(g, [b, d, [d[0], d[1] - 3], [b[0], b[1] - 3]], mezcla(OCRE, '#000000', .12));
  g.strokeStyle = 'rgba(90,60,30,.5)'; g.lineWidth = .4; for (let k = 1; k < 14; k++) { const p = F.en('izq', k / 14, 26.4); g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(p[0], p[1] - 2.2); g.stroke(); }
  const m = F.en('izq', .5, 29); rellena(g, [[m[0] - 7, m[1] + 4], [m[0] + 7, m[1] + 4], [m[0] + 5, m[1] - 2], [m[0], m[1] - 5], [m[0] - 5, m[1] - 2]], mezcla(OCRE, '#FFFFFF', .2));
  g.strokeStyle = '#8E6A3A'; g.lineWidth = .6; g.beginPath(); g.moveTo(m[0] - 1.6, m[1] + 2); g.quadraticCurveTo(m[0] - 2.4, m[1] - 2, m[0], m[1] - 1.6); g.quadraticCurveTo(m[0] + 2.4, m[1] - 2, m[0] + 1.6, m[1] + 2); g.closePath(); g.stroke(); // lira
  for (const u of [0, 1]) { const p = F.en('izq', u, 0); farol(g, p[0] + (u ? -3 : 3), p[1] + 5, 11); }
}
function policia(g) {
  const F = caras(.6, .44, 15, -.08);
  sombraCasa(g, F); muros(g, F, K.cal, '#4E5A34');
  puerta(g, F, 'izq', .4, .15, 10, '#2F5D8A'); ventana(g, F, 'izq', .78, 4, .1, 6, '#2F5D8A'); ventana(g, F, 'der', .5, 4, .16, 6, '#2F5D8A');
  dosAguas(g, F, 9);
  letrero(g, F, .4, 11.5, '#2F5D8A', 'POLICÍA');
  // Garita del centinela en la esquina del frente.
  const G = caras(.13, .13, 12, F.f + .14, F.a - .02); muros(g, G, '#E8E2D2', '#4E5A34'); hueco(g, G, 'izq', .2, .8, 0, 8, '#3A2A1E'); piramide(g, G, 5, '#4E5A34');
  const f = P(F.f + .12, F.b + .04); farol(g, f[0], f[1], 13);
}
function cuartel(g) {
  const F = caras(.9, .56, 15, -.04, .02);
  sombraCasa(g, F); muros(g, F, '#D8C49B', null); sillares(g, F);
  hueco(g, F, 'izq', .58, .76, 0, 11, '#3A2A1E', true); hueco(g, F, 'izq', .59, .67, 0, 10, '#6E4529'); hueco(g, F, 'izq', .67, .75, 0, 10, '#6E4529');
  for (const u of [.12, .24, .36, .88]) hueco(g, F, 'izq', u - .012, u + .012, 6, 11, '#2E2420'); // troneras
  for (const u of [.3, .7]) hueco(g, F, 'der', u - .02, u + .02, 6, 11, '#2E2420');
  azotea(g, F, '#C2AE86'); almenas(g, F, '#D8C49B', 9);
  // Torreón en la esquina con su garita y la bandera.
  const T = caras(.22, .22, 26, F.f - .08, F.a + .08); muros(g, T, '#CDB88E', null); sillares(g, T); hueco(g, T, 'izq', .35, .65, 17, 21, '#2E2420', true); azotea(g, T, '#B8A47C'); almenas(g, T, '#CDB88E', 3);
  const b = P(F.f - .08, F.a + .08, 28.6); bandera(g, b[0], b[1], 14, TRICOLOR);
  // Cañón al frente.
  const c = P(F.f + .16, F.a + .36); g.fillStyle = '#3A3A3A'; g.beginPath(); g.ellipse(c[0] - 2, c[1] - 3, 5, 1.6, -.45, 0, 7); g.fill(); g.strokeStyle = K.maderaOsc; g.lineWidth = .9; g.beginPath(); g.ellipse(c[0] + 1, c[1] - 1.6, 1.8, 2, 0, 0, 7); g.stroke();
}
function bancoEdificio(g) {
  const F = caras(.66, .62, 24, -.02);
  sombraCasa(g, F); muros(g, F, '#E6DCC6', '#6E6658'); sillares(g, F);
  for (const u of [.18, .42]) hueco(g, F, 'izq', u - .06, u + .06, 3, 11, '#3A3A3A', true);
  for (const u of [.18, .42]) hueco(g, F, 'izq', u - .05, u + .05, 14, 20, '#3A3A3A', true);
  for (const u of [.3, .7]) { hueco(g, F, 'der', u - .06, u + .06, 3, 11, '#3A3A3A', true); hueco(g, F, 'der', u - .05, u + .05, 14, 20, '#3A3A3A', true); }
  // Esquina del frente: entrada con dos columnas y cúpula encima (la silueta del banco).
  const e0 = F.en('izq', .72, 0), e1 = F.en('izq', .98, 0); hueco(g, F, 'izq', .74, .96, 0, 13, '#2E2A28', true);
  for (const u of [.72, .98]) { const p = F.en('izq', u, 0); rellena(g, [[p[0] - 1.3, p[1]], [p[0] + 1.3, p[1]], [p[0] + 1.1, p[1] - 14], [p[0] - 1.1, p[1] - 14]], '#F4EEE2', K.contorno, .35); }
  void e0; void e1;
  azotea(g, F, '#CFC5AE');
  const z = F.z0 + F.H; rellena(g, [P(F.f, F.a, z), P(F.f, F.b, z), P(F.f, F.b, z + 2.4), P(F.f, F.a, z + 2.4)], '#F0E8D6'); rellena(g, [P(F.f, F.b, z), P(F.t, F.b, z), P(F.t, F.b, z + 2.4), P(F.f, F.b, z + 2.4)], '#CFC5AE');
  const c = F.en('izq', .85, 26); cupula(g, c[0], c[1], 9, 13, '#5E7F6E');
  const l = F.en('izq', .3, 22.5); g.save(); g.fillStyle = '#8A6A2A'; g.font = 'bold 3px serif'; g.textAlign = 'center'; g.fillText('BANCO', l[0], l[1] + .5); g.restore();
}
function universidad(g) {
  const F = caras(.92, .7, 24, -.04);
  sombraCasa(g, F); muros(g, F, '#F2ECE0', '#8E2F22');
  arcada(g, F, 'izq', 7, 0, 8.5, .03, .97, '#5A4A3C'); balcon(g, F, .03, .97, 12.5, .1);
  for (let k = 0; k < 7; k++) ventana(g, F, 'izq', .03 + (k + .5) * .94 / 7, 14, .05, 6, '#8E2F22');
  arcada(g, F, 'der', 4, 0, 8.5, .05, .95, '#5A4A3C'); for (let k = 0; k < 4; k++) ventana(g, F, 'der', .05 + (k + .5) * .9 / 4, 14, .08, 6, '#8E2F22');
  dosAguas(g, F, 12);
  // Torre del reloj al centro, con su cúpula: la silueta del claustro.
  const T = caras(.2, .2, 18, F.f - .12, 0, 24); muros(g, T, '#F2ECE0', null); reloj(g, ...T.en('izq', .5, 11), 3); hueco(g, T, 'der', .3, .7, 8, 14, '#3A2A1E', true);
  const c = P(F.f - .12, 0, 42); cupula(g, c[0], c[1] + 2, 6.6, 10, '#B9552F');
  const b = P(F.f + .28, F.b - .04); bandera(g, b[0], b[1], 20, TRICOLOR);
}
function acueducto(g) {
  // Arcos de piedra a lo largo de la casilla con el canal de agua encima y una pila al final.
  const F = caras(.94, .16, 15, .05, 0);
  g.save(); g.globalAlpha = .2; g.fillStyle = '#3A2A1C'; poli(g, [P(F.f, F.a), P(F.f + .14, F.a + .2), P(F.f + .14, F.b + .2), P(F.t + .14, F.b + .2), P(F.t, F.b)]); g.fill(); g.restore();
  muros(g, F, PIEDRA, null); sillares(g, F);
  arcada(g, F, 'izq', 4, 0, 10, .02, .98, 'rgba(110,140,90,.55)');
  const z = 15; rellena(g, [P(F.f, F.a, z), P(F.f, F.b, z), P(F.t, F.b, z), P(F.t, F.a, z)], PIEDRA_OSC);
  rellena(g, [P(F.f - .03, F.a, z + .2), P(F.f - .03, F.b, z + .2), P(F.t + .03, F.b, z + .2), P(F.t + .03, F.a, z + .2)], '#6FA6BC', null);
  g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = .4; for (let k = 1; k < 6; k++) { const a = P(.05, F.a + k * .16, z + .3), b = P(.05, F.a + k * .16 + .06, z + .3); g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); }
  // Pila con su chorro, al pie del extremo derecho.
  const p = P(.36, .4); g.fillStyle = PIEDRA_OSC; g.beginPath(); g.ellipse(p[0], p[1], 8, 3.4, 0, 0, 7); g.fill(); g.fillStyle = PIEDRA; g.beginPath(); g.ellipse(p[0], p[1] - 2, 8, 3.4, 0, 0, 7); g.fill();
  g.fillStyle = '#7FB3C4'; g.beginPath(); g.ellipse(p[0], p[1] - 2.2, 6.4, 2.5, 0, 0, 7); g.fill();
  const q = P(F.f, F.b, 14); g.strokeStyle = 'rgba(200,230,240,.9)'; g.lineWidth = .9; g.beginPath(); g.moveTo(q[0], q[1]); g.quadraticCurveTo(q[0] + 2, q[1] + 6, p[0] + 2, p[1] - 3); g.stroke();
}
function molino(g) {
  const F = caras(.5, .46, 16, -.06, .1);
  sombraCasa(g, F); muros(g, F, PIEDRA, null); sillares(g, F);
  puerta(g, F, 'izq', .62, .2, 10, MADERA); ventana(g, F, 'der', .5, 7, .14, 5, MADERA);
  dosAguas(g, F, 9);
  // Canal de madera que trae el agua desde atrás y la rueda en el costado izquierdo (el del río).
  const a = P(F.t - .1, F.a - .12, 17), b = P(F.f - .14, F.a - .12, 17); g.strokeStyle = MADERA; g.lineWidth = 2.6; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); g.strokeStyle = '#7FB3C4'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke();
  const c = P(F.f - .12, F.a - .14, 9); rueda(g, c[0], c[1], 10);
  const s = P(F.f + .16, F.b - .04); sacos(g, s[0], s[1]);
}
function puerto(g) {
  // Bodega de bahareque con techo de zinc, muelle de madera hacia el río (a la izquierda) y un champán amarrado.
  const F = caras(.5, .42, 14, -.16, .16);
  sombraCasa(g, F); muros(g, F, K.cal, '#6E4529');
  hueco(g, F, 'izq', .3, .7, 0, 10, '#3A2A1E'); ventana(g, F, 'der', .5, 5, .14, 5, '#6E4529');
  dosAguas(g, F, 7, { teja: '#9AA0A2', luz: '#B4BABC', osc: '#7A8082', linea: '#6A7072' });
  const m0 = P(.18, -.5), m1 = P(.36, .05);
  g.strokeStyle = K.maderaOsc; g.lineWidth = 1; for (const [r, c] of [[.12, -.48], [.3, -.48], [.12, -.2], [.3, -.2]]) { const p = P(r, c, -2), q = P(r, c, 2.2); g.beginPath(); g.moveTo(...p); g.lineTo(...q); g.stroke(); }
  rellena(g, [P(.1, -.5, 2.2), P(.1, .05, 2.2), P(.32, .05, 2.2), P(.32, -.5, 2.2)], '#9B7650');
  g.strokeStyle = 'rgba(60,40,25,.5)'; g.lineWidth = .35; for (let k = 1; k < 9; k++) { const c = -.5 + k * .06, a = P(.1, c, 2.3), b = P(.32, c, 2.3); g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); }
  void m0; void m1;
  const c = P(.42, -.42); canoa(g, c[0], c[1]);
  const s = P(.2, -.1, 2.2); sacos(g, s[0], s[1]);
}

// ---------- Sede del gobierno según el régimen ----------
function cabildo(g) { // república: casa consistorial de portales
  const F = caras(.92, .5, 26, -.04);
  sombraCasa(g, F); muros(g, F, K.cal, '#8E2F22');
  arcada(g, F, 'izq', 5, 0, 9.5, .04, .96, '#4A3A2C');
  for (let k = 0; k < 5; k++) ventana(g, F, 'izq', .04 + (k + .5) * .92 / 5, 15, .07, 7, '#2F5D8A');
  balcon(g, F, .04, .96, 14, .14);
  arcada(g, F, 'der', 2, 0, 9.5, .1, .9); ventana(g, F, 'der', .5, 15, .14, 7, '#2F5D8A');
  dosAguas(g, F, 12);
  // Remate con reloj al centro, escudo y bandera.
  const a = F.en('izq', .4, 26), b = F.en('izq', .6, 26), m = F.en('izq', .5, 36);
  rellena(g, [a, b, [b[0], b[1] - 4], m, [a[0], a[1] - 4]], K.cal); reloj(g, m[0], m[1] + 4.6, 2.6);
  escudo(g, ...F.en('izq', .5, 22.5), .8);
  const f = P(F.t + .1, F.b - .1, 38); bandera(g, f[0], f[1], 16, TRICOLOR);
}
function palacio(g) { // monarquía: palacio con dos torreones y portada de piedra coronada
  const F = caras(.84, .56, 26, -.04);
  sombraCasa(g, F); muros(g, F, '#EFE6D2', '#5A3A6A');
  const pa = F.en('izq', .38, 0), pb = F.en('izq', .62, 0); rellena(g, [pa, pb, F.en('izq', .62, 22), F.en('izq', .5, 25), F.en('izq', .38, 22)], PIEDRA); hueco(g, F, 'izq', .43, .57, 0, 12, '#5A3A26', true);
  balcon(g, F, .4, .6, 14, .1, '#C9A24A');
  for (const u of [.24, .76]) { ventana(g, F, 'izq', u, 5, .07, 7, '#5A3A6A'); ventana(g, F, 'izq', u, 15, .07, 7, '#5A3A6A'); }
  ventana(g, F, 'der', .5, 5, .14, 7, '#5A3A6A'); ventana(g, F, 'der', .5, 15, .14, 7, '#5A3A6A');
  cuatroAguas(g, F, 10);
  for (const c of [F.a + .09, F.b - .09]) { const T = caras(.18, .18, 34, F.f - .08, c); muros(g, T, '#E6DCC6', '#5A3A6A'); ventana(g, T, 'izq', .5, 22, .3, 6, '#5A3A6A', { postigos: false }); piramide(g, T, 12); }
  const corona = F.en('izq', .5, 26.5); g.fillStyle = '#C9A24A'; g.beginPath(); g.moveTo(corona[0] - 3.5, corona[1]); g.lineTo(corona[0] - 3.5, corona[1] - 3); g.lineTo(corona[0] - 1.7, corona[1] - 1.6); g.lineTo(corona[0], corona[1] - 4); g.lineTo(corona[0] + 1.7, corona[1] - 1.6); g.lineTo(corona[0] + 3.5, corona[1] - 3); g.lineTo(corona[0] + 3.5, corona[1]); g.closePath(); g.fill();
  const f = P(F.f - .08, F.b - .09, 46); bandera(g, f[0], f[1], 12, ['#5A3A6A', '#C9A24A']);
}
function casona(g) { // aristocracia: casona señorial en L con portón y escudo de armas
  const F = caras(.62, .46, 25, -.1, -.12), W = caras(.3, .62, 15, -.02, .34);
  sombraCasa(g, F); sombraCasa(g, W);
  muros(g, W, K.cal, '#3E6B4A'); for (const u of [.3, .7]) ventana(g, W, 'der', u, 4, .12, 6, '#3E6B4A'); ventana(g, W, 'izq', .5, 4, .3, 6, '#3E6B4A'); dosAguas(g, { ...W, a: W.a, b: W.b }, 8);
  muros(g, F, '#F4EEE2', '#3E6B4A');
  rellena(g, [F.en('izq', .36, 0), F.en('izq', .64, 0), F.en('izq', .64, 13), F.en('izq', .36, 13)], PIEDRA); hueco(g, F, 'izq', .4, .6, 0, 11, '#4A2D1A', true);
  for (const u of [.15, .85]) ventana(g, F, 'izq', u, 4, .08, 6, '#3E6B4A');
  for (const u of [.2, .5, .8]) ventana(g, F, 'izq', u, 15, .08, 6.5, '#3E6B4A');
  balcon(g, F, .06, .94, 14, .14); ventana(g, F, 'der', .5, 15, .2, 6.5, '#3E6B4A'); ventana(g, F, 'der', .5, 4, .2, 6, '#3E6B4A');
  dosAguas(g, F, 11);
  escudo(g, ...F.en('izq', .5, 16.4), 1.15);
  materas(g, [P(F.f + .1, F.a + .06), P(F.f + .1, F.a + .2)]);
  bancoMadera(g, ...P(.38, .28));
}
function fortaleza(g) { // tiranía: fortaleza oscura con almenas y torre del homenaje
  const F = caras(.8, .6, 18, -.02);
  sombraCasa(g, F); muros(g, F, '#8E877C', null); sillares(g, F);
  hueco(g, F, 'izq', .4, .6, 0, 12, '#1E1A18', true); g.strokeStyle = '#4A4440'; g.lineWidth = .6; for (let k = 1; k < 5; k++) { const a = F.en('izq', .4 + k * .04, 0), b = F.en('izq', .4 + k * .04, 12); g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); } // rastrillo
  for (const u of [.15, .85]) hueco(g, F, 'izq', u - .012, u + .012, 7, 13, '#1E1A18');
  azotea(g, F, '#7A746A'); almenas(g, F, '#8E877C', 8, 3);
  const T = caras(.26, .26, 40, -.1, -.12); muros(g, T, '#7E776C', null); sillares(g, T); hueco(g, T, 'izq', .4, .6, 30, 34, '#1E1A18'); azotea(g, T, '#6A645A'); almenas(g, T, '#7E776C', 3, 3);
  const f = P(-.1, -.12, 43); bandera(g, f[0], f[1], 14, ['#1E1A18', '#9C2F25']);
  for (const u of [.1, .9]) { const p = F.en('izq', u, 0); farol(g, p[0], p[1] + 3, 9); }
}
function comercio(g) { // oligarquía: casa de comercio de ladrillo con frontón curvo dorado
  const F = caras(.78, .52, 27, -.04);
  sombraCasa(g, F); muros(g, F, K.ladrillo, '#5A4A3C', { ladrillo: true });
  for (let k = 0; k < 4; k++) { const u = .1 + k * .8 / 3; hueco(g, F, 'izq', u - .07, u + .07, 0, 10, k === 1 || k === 2 ? '#2E2A28' : '#7FA6BC', true); }
  for (let k = 0; k < 4; k++) ventana(g, F, 'izq', .1 + k * .8 / 3, 15, .08, 7, '#2E2A28', { marco: '#F4EEE2', postigos: false });
  balcon(g, F, .3, .7, 14, .1, '#C9A24A');
  ventana(g, F, 'der', .3, 4, .12, 6, '#2E2A28', { marco: '#F4EEE2', postigos: false }); ventana(g, F, 'der', .7, 15, .12, 7, '#2E2A28', { marco: '#F4EEE2', postigos: false });
  azotea(g, F, '#8E5A44');
  const a = F.en('izq', 0, 27), b = F.en('izq', 1, 27); rellena(g, [a, b, [b[0], b[1] - 2.4], [a[0], a[1] - 2.4]], '#E6D6B0');
  const m = F.en('izq', .5, 29); g.fillStyle = '#E6D6B0'; g.beginPath(); g.moveTo(m[0] - 8, m[1] + 2.4); g.quadraticCurveTo(m[0], m[1] - 9, m[0] + 8, m[1] + 2.4); g.fill(); g.strokeStyle = '#C9A24A'; g.lineWidth = .8; g.stroke();
  g.fillStyle = '#C9A24A'; g.beginPath(); g.arc(m[0], m[1] - 1.8, 1.6, 0, 7); g.fill();
  const s = P(F.f + .14, F.b - .1); sacos(g, s[0], s[1]);
  const ch = P(F.t + .1, F.a + .12, 27); rellena(g, [[ch[0] - 1.6, ch[1]], [ch[0] + 1.6, ch[1]], [ch[0] + 1.6, ch[1] - 7], [ch[0] - 1.6, ch[1] - 7]], K.ladrilloOsc);
}
function tribuna(g) { // demagogia: tribuna popular con balcón grande, carteles, banderines y megáfono
  const F = caras(.8, .48, 22, -.08);
  sombraCasa(g, F); muros(g, F, '#F2DFA8', '#B9442F');
  hueco(g, F, 'izq', .4, .6, 0, 10, '#3A2A1E', true);
  for (const u of [.15, .85]) ventana(g, F, 'izq', u, 4, .08, 6, '#B9442F');
  // Murales de colores en la fachada.
  for (const [u, c] of [[.12, '#2F6E8E'], [.24, '#E7B23C'], [.76, '#3E6B4A'], [.88, '#B9442F']]) rellena(g, [F.en('izq', u - .05, 13), F.en('izq', u + .05, 13), F.en('izq', u + .05, 20), F.en('izq', u - .05, 20)], c, K.contorno, .3);
  dosAguas(g, F, 9, { teja: '#C0602A' });
  // Tribuna saliente con baranda y el megáfono.
  const z = 12, a = F.a + (F.b - F.a) * .32, b = F.a + (F.b - F.a) * .68, f = F.f, s = .2;
  rellena(g, [P(f, a, z), P(f, b, z), P(f + s, b, z), P(f + s, a, z)], '#8A5A36'); rellena(g, [P(f + s, a, z), P(f + s, b, z), P(f + s, b, z - 7), P(f + s, a, z - 7)], '#B9442F');
  rellena(g, [P(f + s, a, z - 1.5), P(f + s, b, z - 1.5), P(f + s, b, z - 4.5), P(f + s, a, z - 4.5)], '#E7C76B', null);
  g.strokeStyle = K.maderaOsc; g.lineWidth = .9; for (const c of [a, b]) { const p = P(f + s, c, 0), q = P(f + s, c, z); g.beginPath(); g.moveTo(...p); g.lineTo(...q); g.stroke(); }
  const mg = P(f + s * .5, b - .02, z + 9); g.strokeStyle = '#2E2A28'; g.lineWidth = .7; g.beginPath(); g.moveTo(mg[0], mg[1] + 9); g.lineTo(mg[0], mg[1]); g.stroke(); g.fillStyle = '#9AA0A2'; g.beginPath(); g.moveTo(mg[0], mg[1]); g.lineTo(mg[0] + 5, mg[1] - 2.5); g.lineTo(mg[0] + 5, mg[1] + 2.5); g.closePath(); g.fill();
  // Banderines de una esquina a la otra del techo.
  const A = P(F.f, F.a, 22), B = P(F.t, F.b, 22); g.strokeStyle = '#6B4F3A'; g.lineWidth = .4; g.beginPath(); g.moveTo(A[0], A[1] - 8); g.quadraticCurveTo((A[0] + B[0]) / 2, (A[1] + B[1]) / 2 - 2, B[0], B[1] - 8); g.stroke();
  const cols = ['#C0602A', '#E7C76B', '#2D6E5E', '#C4513B', '#2F5D8A'];
  for (let k = 1; k < 10; k++) { const t = k / 10, x = A[0] + (B[0] - A[0]) * t, y = A[1] + (B[1] - A[1]) * t - 8 + Math.sin(t * Math.PI) * 6; g.fillStyle = cols[k % 5]; g.beginPath(); g.moveTo(x - 1.4, y); g.lineTo(x + 1.4, y); g.lineTo(x, y + 2.8); g.fill(); }
}

// [clave, ancho, alto, anclaX, anclaY, pintura]: reemplazan a las obras griegas con las mismas claves.
export function recetasPublicos() {
  return [
    ['escuela', 92, 84, 46, 56, escuela],
    ['hospital', 92, 84, 46, 58, hospital],
    ['taller', 84, 82, 42, 60, taller],
    ['recaudo', 80, 72, 40, 52, recaudo],
    ['biblioteca', 84, 90, 42, 66, biblioteca],
    ['teatro', 92, 90, 46, 64, teatro],
    ['policia', 84, 72, 42, 52, policia],
    ['cuartel', 100, 86, 50, 58, cuartel],
    ['banco', 88, 90, 44, 62, bancoEdificio],
    ['universidad', 104, 104, 52, 72, universidad],
    ['acueducto', 92, 64, 46, 40, acueducto],
    ['molino', 84, 70, 42, 50, molino],
    ['puerto', 92, 70, 46, 46, puerto],
    ['sede-republica', 100, 100, 50, 66, cabildo],
    ['sede-monarquia', 100, 110, 50, 74, palacio],
    ['sede-aristocracia', 100, 90, 50, 60, casona],
    ['sede-tirania', 100, 100, 50, 72, fortaleza],
    ['sede-oligarquia', 96, 92, 48, 62, comercio],
    ['sede-demagogia', 96, 88, 48, 58, tribuna]
  ];
}
