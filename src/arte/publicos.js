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
import { P, K, MAT, mezcla, poli, rellena, grad, caras, muros, hiladas, hueco, ventana, puerta, balcon, tejas, dosAguas, cuatroAguas, terraza, sombraCasa, materas, bancoMadera, cajaPx, cilindro as cilindroV, hojaP, sombraPie } from './casas.js';
import { mulberry } from './fresco.js';
import { CAPTURA, capturarQuad } from './casas.js';

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
  g.fillStyle = '#C9A24A'; g.beginPath(); g.arc(x, y - h - .5, .55, 0, 7); g.fill(); // remate del asta
  if (CAPTURA.banderas) { const T = g.getTransform(); CAPTURA.banderas.push({ x: T.a * x + T.c * (y - h) + T.e, y: T.b * x + T.d * (y - h) + T.f, esc: Math.hypot(T.a, T.b), ancho, cols }); if (CAPTURA.sinTela) return; } // la tela ondea aparte (animación)
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
// Farol de hierro: basa, poste con anillos, brazo con volutas y linterna de cuatro vidrios con su caperuza. El vidrio
// se anota para encenderse de noche (ObrasVivas).
function farol(g, x, y, h = 10) {
  sombraPie(g, x, y, 1.6, .6, .3);
  cajaPx(g, x, y, .03, .03, 1.4, '#2E3A34', { izq: '#3E4A44', borde: null });
  const gr = g.createLinearGradient(x - .6, 0, x + .6, 0); gr.addColorStop(0, '#4E5A54'); gr.addColorStop(1, '#1E2622'); g.fillStyle = gr; g.fillRect(x - .45, y - h, .9, h - 1.2);
  g.fillStyle = '#2E3A34'; for (const z of [3, h * .55]) g.fillRect(x - .7, y - z, 1.4, .6); // anillos
  g.strokeStyle = '#2E3A34'; g.lineWidth = .4; g.beginPath(); g.moveTo(x, y - h + 1.6); g.quadraticCurveTo(x + 1.4, y - h + 1.2, x + .9, y - h + .4); g.stroke(); g.beginPath(); g.moveTo(x, y - h + 1.6); g.quadraticCurveTo(x - 1.4, y - h + 1.2, x - .9, y - h + .4); g.stroke(); // volutas
  const vid = [[x - 1.3, y - h], [x + 1.3, y - h], [x + 1.6, y - h - 3.2], [x - 1.6, y - h - 3.2]];
  capturarQuad(g, vid);
  const lg = g.createLinearGradient(0, y - h - 3.2, 0, y - h); lg.addColorStop(0, '#FBEFC0'); lg.addColorStop(1, '#E8C87A'); rellena(g, vid, lg, '#1E2622', .4);
  g.strokeStyle = '#1E2622'; g.lineWidth = .3; g.beginPath(); g.moveTo(x, y - h); g.lineTo(x, y - h - 3.2); g.stroke(); // montante
  g.fillStyle = '#1E2622'; g.beginPath(); g.moveTo(x - 2, y - h - 3.2); g.lineTo(x + 2, y - h - 3.2); g.lineTo(x, y - h - 4.8); g.closePath(); g.fill(); g.beginPath(); g.arc(x, y - h - 5.1, .4, 0, 7); g.fill(); // caperuza
}
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
// Árbol de plaza o de patio (samán, mango): tronco que se abre en la raíz y se bifurca, con tres tonos; copa
// armada con racimos de hojas en punta, oscuros por dentro y abajo a la derecha, con luz arriba a la izquierda
// (antes eran cuatro bolas lisas).
function arbolito(g, x, y, s = 1, col = '#5E8B42') {
  const R = mulberry(Math.round(x * 7 + y * 13 + s * 100));
  sombraPie(g, x + 3 * s, y, 9 * s, 2.8 * s, .22);
  const tr = g.createLinearGradient(x - 1.4 * s, 0, x + 1.4 * s, 0); tr.addColorStop(0, '#8A6A4A'); tr.addColorStop(.5, '#6B4A33'); tr.addColorStop(1, '#4A3222');
  g.fillStyle = tr; g.beginPath(); g.moveTo(x - 2 * s, y); g.quadraticCurveTo(x - 1 * s, y - 1.5 * s, x - .9 * s, y - 7 * s); g.lineTo(x - 2.6 * s, y - 11 * s); g.lineTo(x - 1.8 * s, y - 11.4 * s); g.lineTo(x, y - 8.4 * s); g.lineTo(x + 1.6 * s, y - 11.6 * s); g.lineTo(x + 2.4 * s, y - 11.2 * s); g.lineTo(x + .9 * s, y - 7 * s); g.quadraticCurveTo(x + 1 * s, y - 1.5 * s, x + 2.2 * s, y); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(30,20,12,.35)'; g.lineWidth = .3; g.beginPath(); g.moveTo(x + .3 * s, y - .5); g.lineTo(x + .4 * s, y - 7 * s); g.stroke();
  const osc = mezcla(col, '#1A2A14', .32), luz = mezcla(col, '#E8F0B0', .4);
  const racimos = [[-4.2, -13.5, 5], [4, -14, 5], [0, -18.5, 5.6], [-1.5, -12.5, 4.4], [2.5, -17, 4.2], [-3.4, -17.4, 4]];
  for (const [dx, dy, r] of racimos) { g.fillStyle = osc; g.beginPath(); g.ellipse(x + (dx + .6) * s, y + (dy + .6) * s, r * .85 * s, r * .7 * s, 0, 0, 7); g.fill(); }
  for (const [dx, dy, r] of racimos) {
    const cx = x + dx * s, cy = y + dy * s, n = 14;
    for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2 + R() * .4, d = r * (.35 + R() * .5) * s, hx = cx + Math.cos(a) * d, hy = cy + Math.sin(a) * d * .8, arriba = Math.cos(a - 3.9) * .5 + .5; hojaP(g, hx, hy, a + (R() - .5) * .5, (2 + R() * 1.4) * s, .75 * s, mezcla(osc, col, .35 + arriba * .65), false); }
    for (let k = 0; k < 4; k++) { const a = -2.4 + R() * 1.2, hx = cx + Math.cos(a) * r * .45 * s, hy = cy + Math.sin(a) * r * .4 * s; hojaP(g, hx, hy, a, 1.8 * s, .6 * s, luz, false); }
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
// Vidrio con su marco, montantes, el interior oscuro abajo, el cielo reflejado arriba y un brillo en diagonal
// (pulido de la tanda A: antes era un solo color plano). La cara de la derecha va en sombra.
function vidrio(g, F, cara, u0, u1, z0, z1, op = {}) {
  const q = [F.en(cara, u0, z0), F.en(cara, u1, z0), F.en(cara, u1, z1), F.en(cara, u0, z1)], sombra = cara === 'der';
  capturarQuad(g, q);
  const gr = g.createLinearGradient(0, q[0][1], 0, q[3][1]);
  gr.addColorStop(0, sombra ? '#3E5A6E' : '#4E6E84'); gr.addColorStop(.55, sombra ? '#5E84A0' : '#7FA8C2'); gr.addColorStop(1, sombra ? '#86A8BE' : '#B8D4E2');
  rellena(g, q, gr, op.marco || '#E8ECEC', .7);
  g.save(); poli(g, q); g.clip();
  g.globalAlpha = sombra ? .12 : .22; g.fillStyle = '#FFFFFF'; const a = F.en(cara, u0 + (u1 - u0) * .15, z0), b = F.en(cara, u0 + (u1 - u0) * .35, z0), c = F.en(cara, u0 + (u1 - u0) * .55, z1), d = F.en(cara, u0 + (u1 - u0) * .35, z1); poli(g, [a, b, c, d]); g.fill(); // brillo en diagonal
  g.globalAlpha = .6; g.strokeStyle = op.marco || '#E8ECEC'; g.lineWidth = .4;
  const n = op.montantes ?? Math.max(1, Math.round((u1 - u0) / .09)); for (let k = 1; k < n; k++) { const u = u0 + (u1 - u0) * k / n, m0 = F.en(cara, u, z0), m1 = F.en(cara, u, z1); g.beginPath(); g.moveTo(...m0); g.lineTo(...m1); g.stroke(); }
  if (z1 - z0 > 4) { const m0 = F.en(cara, u0, z0 + (z1 - z0) * .66), m1 = F.en(cara, u1, z0 + (z1 - z0) * .66); g.beginPath(); g.moveTo(...m0); g.lineTo(...m1); g.stroke(); }
  g.restore();
  { const dz = Math.min(1, (z1 - z0) * .18); g.fillStyle = 'rgba(20,24,30,.4)'; poli(g, [q[3], q[2], F.en(cara, u1, z1 - dz), F.en(cara, u0, z1 - dz)]); g.fill(); g.fillStyle = 'rgba(20,24,30,.25)'; poli(g, [F.en(cara, u1 - .015, z0), q[1], q[2], F.en(cara, u1 - .015, z1)]); g.fill(); } // el vidrio va hundido: sombra del dintel y del marco
  rellena(g, [F.en(cara, u0 - .01, z0 - .5), F.en(cara, u1 + .01, z0 - .5), F.en(cara, u1 + .01, z0), F.en(cara, u0 - .01, z0)], sombra ? '#BDB8AC' : '#ECE8DE', null); // alféizar
  g.fillStyle = 'rgba(40,30,20,.14)'; poli(g, [F.en(cara, u0, z0 - .5), F.en(cara, u1, z0 - .5), F.en(cara, u1, z0 - 1.8), F.en(cara, u0, z0 - 1.8)]); g.fill(); // sombra del alféizar
}
// Sombra bajo el alero o el pretil sobre las dos caras, y la mugre que sube del suelo (los años en el muro).
function aleroYdesgaste(g, F, alto = 2.4) {
  for (const cara of ['izq', 'der']) {
    const a = F.en(cara, 0, F.H), b = F.en(cara, 1, F.H), gr = g.createLinearGradient(0, a[1], 0, a[1] + alto * 1.2);
    gr.addColorStop(0, 'rgba(40,30,20,.32)'); gr.addColorStop(1, 'rgba(40,30,20,0)');
    rellena(g, [a, b, F.en(cara, 1, F.H - alto), F.en(cara, 0, F.H - alto)], gr, null);
    const c = F.en(cara, 0, 0), d = F.en(cara, 1, 0), gr2 = g.createLinearGradient(0, c[1], 0, c[1] - 3);
    gr2.addColorStop(0, 'rgba(70,55,35,.28)'); gr2.addColorStop(1, 'rgba(70,55,35,0)');
    rellena(g, [c, d, F.en(cara, 1, 3), F.en(cara, 0, 3)], gr2, null);
  }
}
function franjasVidrio(g, F, pisos) { for (let p = 0; p < pisos; p++) { const z = 3 + p * 9.5; for (const cara of ['izq', 'der']) vidrio(g, F, cara, .06, .94, z, z + 5.5); } }
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
function policia(g, e, h) {
  const E = h === 2 ? epoca(2, { zocalo2: '#4E5A34', techo2: 'zinc' }) : epoca(e, { muro: '#F4F1E8', zocalo: '#4E5A34', techo: 'zincVerde', techo0: 'paja', techo2: 'zincVerde', muro2: '#F4F1E8', zocalo2: '#4E5A34', muro3: '#EFF1EA', zocalo3: '#4E5A34' });
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
    g.strokeStyle = '#6E7378'; g.lineWidth = 3; g.beginPath(); g.moveTo(...P(F.t - .3, F.a - .3, 22)); g.lineTo(...P(F.f - .02, F.a - .2, 3)); g.stroke(); // la tubería de presión, detrás de la casa
    muros(g, F, '#D6D2CA', '#8A8478'); franjasVidrio(g, F, 1); azotea(g, F, '#BDB8AE');
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
  const cols = e === 0 ? [['#C9A86A', '#B08A50'], ['#BFA06A', '#A88850'], ['#C9A86A', '#B08A50']] : e === 3 ? [['#2F7EC0', '#F4F4F0'], ['#E7B23C', '#2F7EC0'], ['#3E9A5A', '#F4F4F0']] : TOLDOS[e >= 2 ? 1 : 0]; // desde la modernización, plástico rayado
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
// Cruz de piedra a escala humana (unas dos veces la altura de una persona): gradas, fuste y brazos con volumen,
// con luz a la izquierda y sombra a la derecha, y un poco de musgo en la grada de abajo.
function cruzDePiedra(g, x, y, k = 1) {
  g.save(); g.translate(x, y); g.scale(k, k);
  sombraPie(g, 0, 0, 7, 2.2, .22);
  [[.12, 1.6], [.09, 1.6], [.06, 1.6]].forEach(([l, h], i) => cajaPx(g, 0, 0, l * 2, l * 2, h, '#CFC5AE', { z0: i * 1.6, izq: '#DCD2BC', top: '#E6DCC4' }));
  g.fillStyle = 'rgba(90,110,60,.35)'; g.beginPath(); g.ellipse(-2.4, .4, 2, .6, 0, 0, 7); g.fill(); // musgo
  cajaPx(g, 0, 0, .05, .05, 17, '#D8CEB6', { z0: 4.8, izq: '#E8DFC8', top: '#EEE6D2' }); // fuste
  cajaPx(g, 0, 0, .2, .05, 2.6, '#D8CEB6', { z0: 16.4, izq: '#E8DFC8', top: '#EEE6D2' }); // brazos
  g.restore();
}
// Pila de piedra con su chorro (la de los pueblos del Tolima), con su pie en (x, y).
// Pila de piedra de plaza: taza ancha con su borde grueso, agua con brillo y reflejo, columna central con anillo,
// tacita arriba y chorros que caen con sus salpicaduras.
function pilaPlaza(g, x, y, R, alto = 12) {
  sombraPie(g, x, y + .6, R * 1.05, R * .5, .2);
  cilindroV(g, x, y, R, 3, PIEDRA, { tapa: PIEDRA_CL });
  const ag = g.createLinearGradient(x - R, y - 4, x + R, y - 2); ag.addColorStop(0, '#9CC8D4'); ag.addColorStop(.6, '#6FA2B6'); ag.addColorStop(1, '#4E7E92');
  g.fillStyle = ag; g.beginPath(); g.ellipse(x, y - 3.05, R * .8, R * .36, 0, 0, 7); g.fill(); // agua
  g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = .35; for (const f of [.45, .65]) { g.beginPath(); g.ellipse(x, y - 3.05, R * f, R * f * .45, 0, Math.PI * 1.1, Math.PI * 1.7); g.stroke(); } // ondas
  cilindroV(g, x, y - 3, 1.2, alto - 4, PIEDRA_CL, { arriba: 1, aros: 1 });
  cilindroV(g, x, y - alto + 1, R * .35, 1.2, PIEDRA, { arriba: R * .42, tapa: '#8FBCCB' }); // tacita
  g.strokeStyle = 'rgba(215,238,246,.9)'; g.lineWidth = .6; g.lineCap = 'round';
  for (const dx of [-1, 1]) for (const dz of [0, .6]) { g.beginPath(); g.moveTo(x + dx * R * .38, y - alto - .2); g.quadraticCurveTo(x + dx * R * .55, y - alto + 2 + dz, x + dx * R * .62, y - 3.4); g.stroke(); } // chorros
  g.fillStyle = 'rgba(240,250,255,.8)'; for (const dx of [-1, 1]) { g.beginPath(); g.ellipse(x + dx * R * .62, y - 3.3, .9, .3, 0, 0, 7); g.fill(); } // salpicaduras
}
// Monumento de la plaza de la polis (pedido de Juan: le gusta la idea, no el busto): estatua de bronce de cuerpo
// entero sobre un pedestal de piedra, como las de las plazas de Bolívar: un prócer de pie, con levita y capa, la mano
// izquierda en el puño de la espada y la derecha señalando al frente. Bronce verdoso con luz a la izquierda.
function monumentoProcer(g, x, y) {
  sombraPie(g, x, y, 13, 4.6, .2);
  // Jardín y reja baja de hierro alrededor del pedestal.
  const A = P(.24, -.24), base = (r, c) => [x + (c - r) * 32, y + (c + r) * 16];
  g.fillStyle = '#6E9A4E'; g.beginPath(); [[-.22, -.22], [-.22, .22], [.22, .22], [.22, -.22]].forEach(([r, c], k) => { const q = base(r, c); k ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); }); g.closePath(); g.fill();
  const R = mulberry(77); for (let k = 0; k < 26; k++) { const r = (R() - .5) * .4, c = (R() - .5) * .4, q = base(r, c); if (Math.abs(r) < .12 && Math.abs(c) < .12) continue; hojaP(g, q[0], q[1], -Math.PI / 2 + (R() - .5), 1.6 + R(), .55, R() < .5 ? '#4E7A3A' : '#7FAA56', false); if (R() < .35) { g.fillStyle = ['#D8433A', '#F4EFE4', '#E7B23C'][k % 3]; g.beginPath(); g.arc(q[0], q[1] - 1.6, .5, 0, 7); g.fill(); } }
  void A;
  const reja = (r0, c0, r1, c1) => { const a = base(r0, c0), b = base(r1, c1), n = 7; g.strokeStyle = '#1E2622'; g.lineWidth = .35; for (let k = 0; k <= n; k++) { const f = k / n, px = a[0] + (b[0] - a[0]) * f, py = a[1] + (b[1] - a[1]) * f; g.beginPath(); g.moveTo(px, py); g.lineTo(px, py - 2.4); g.stroke(); g.fillStyle = '#1E2622'; g.beginPath(); g.moveTo(px - .3, py - 2.4); g.lineTo(px + .3, py - 2.4); g.lineTo(px, py - 3.1); g.fill(); } g.lineWidth = .4; for (const z of [.8, 2.2]) { g.beginPath(); g.moveTo(a[0], a[1] - z); g.lineTo(b[0], b[1] - z); g.stroke(); } };
  reja(-.24, -.24, -.24, .24); reja(-.24, -.24, .24, -.24); // lados de atrás
  // Pedestal: dos gradas, dado con placa de bronce y cornisa.
  cajaPx(g, x, y, .3, .3, 1.6, '#BFB59E', { izq: '#D0C6AE', top: '#DCD2BC' });
  cajaPx(g, x, y, .24, .24, 1.6, '#C9BFA8', { z0: 1.6, izq: '#D8CEB6', top: '#E2D8C2' });
  const D = cajaPx(g, x, y, .17, .17, 11, '#D2C8B0', { z0: 3.2, izq: '#E2D8C2', top: '#E8DFCA' });
  const ins = (q, u, v) => [q[0][0] + (q[1][0] - q[0][0]) * u, q[0][1] + (q[1][1] - q[0][1]) * u - 11 * v];
  rellena(g, [ins(D.izq, .22, .3), ins(D.izq, .78, .3), ins(D.izq, .78, .62), ins(D.izq, .22, .62)], '#6E5A2E', 'rgba(40,30,15,.6)', .3); // placa
  g.strokeStyle = '#C9A24A'; g.lineWidth = .3; for (const v of [.4, .47, .54]) { g.beginPath(); g.moveTo(...ins(D.izq, .3, v)); g.lineTo(...ins(D.izq, .7, v)); g.stroke(); } // letras de la placa
  g.fillStyle = 'rgba(60,90,70,.25)'; g.beginPath(); g.moveTo(...ins(D.izq, .4, .3)); g.lineTo(...ins(D.izq, .5, .3)); g.lineTo(...ins(D.izq, .48, .05)); g.lineTo(...ins(D.izq, .42, .08)); g.fill(); // chorreón verde del bronce
  cajaPx(g, x, y, .21, .21, 1.4, '#C9BFA8', { z0: 14.2, izq: '#D8CEB6', top: '#E6DCC6' }); // cornisa
  // Estatua (los pies sobre la cornisa).
  g.save(); g.translate(x, y - 15.6);
  const br = '#5E806E', bl = '#9CC0A8', bo = '#344A3E', bh = '#C6E0CC';
  const grad2 = (x0, x1) => { const gr = g.createLinearGradient(x0, 0, x1, 0); gr.addColorStop(0, bl); gr.addColorStop(.45, br); gr.addColorStop(1, bo); return gr; };
  g.fillStyle = mezcla(bo, '#000000', .1); g.beginPath(); g.ellipse(0, 0, 3.4, 1.3, 0, 0, 7); g.fill(); // plinto de bronce
  // Capa detrás, cayendo hacia la derecha.
  g.fillStyle = bo; g.beginPath(); g.moveTo(-1.8, -13.2); g.quadraticCurveTo(3.5, -11, 4.2, -2.2); g.lineTo(2.2, -1.2); g.quadraticCurveTo(1.6, -7, .6, -12); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(20,30,25,.5)'; g.lineWidth = .3; for (const k of [0, 1]) { g.beginPath(); g.moveTo(.8 + k, -11.6); g.quadraticCurveTo(2.6 + k * .6, -7, 3 + k * .5, -2); g.stroke(); }
  // Piernas y botas.
  g.fillStyle = grad2(-1.6, 1.6); g.beginPath(); g.moveTo(-1.5, -6.2); g.lineTo(-1.6, -.3); g.lineTo(-.4, -.3); g.lineTo(-.2, -6.2); g.closePath(); g.fill(); g.beginPath(); g.moveTo(.2, -6.2); g.lineTo(.5, -.2); g.lineTo(1.7, -.2); g.lineTo(1.3, -6.2); g.closePath(); g.fill();
  g.fillStyle = bo; g.beginPath(); g.ellipse(-1, -.3, 1, .45, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(1.15, -.25, 1, .45, 0, 0, 7); g.fill();
  // Levita hasta las rodillas.
  g.fillStyle = grad2(-2.6, 2.6); g.beginPath(); g.moveTo(-1.9, -12.4); g.lineTo(1.9, -12.4); g.lineTo(2.5, -5.4); g.lineTo(.4, -5.8); g.lineTo(0, -8); g.lineTo(-.4, -5.8); g.lineTo(-2.5, -5.4); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(20,30,25,.45)'; g.lineWidth = .25; g.beginPath(); g.moveTo(0, -12.2); g.lineTo(0, -8); g.stroke(); g.fillStyle = bh; for (const z of [-11.4, -10.2, -9]) { g.beginPath(); g.arc(-.45, z, .18, 0, 7); g.fill(); } // botones
  g.fillStyle = bo; g.fillRect(-2, -9.4, 4, .6); // fajín
  // Espada al costado izquierdo, con la mano en el puño.
  g.strokeStyle = bo; g.lineWidth = .45; g.beginPath(); g.moveTo(-2.3, -8.6); g.lineTo(-3.4, -2.2); g.stroke(); g.strokeStyle = bh; g.lineWidth = .2; g.beginPath(); g.moveTo(-2.25, -8.4); g.lineTo(-3.25, -2.4); g.stroke();
  g.fillStyle = grad2(-3.2, -1); g.beginPath(); g.moveTo(-1.9, -12.2); g.quadraticCurveTo(-3, -11, -2.8, -9); g.lineTo(-2, -8.6); g.quadraticCurveTo(-2.1, -10.6, -1.4, -11.4); g.closePath(); g.fill(); // brazo izquierdo
  g.fillStyle = bl; g.beginPath(); g.ellipse(-2.4, -8.6, .55, .5, 0, 0, 7); g.fill(); // mano en el puño
  // Brazo derecho extendido, señalando al frente.
  g.fillStyle = grad2(1, 5); g.beginPath(); g.moveTo(1.6, -12.4); g.quadraticCurveTo(3.4, -12.8, 5.4, -14.4); g.lineTo(5.8, -13.6); g.quadraticCurveTo(3.8, -11.8, 1.8, -10.8); g.closePath(); g.fill();
  g.fillStyle = br; g.beginPath(); g.ellipse(5.9, -14.3, .55, .45, -.6, 0, 7); g.fill(); g.strokeStyle = br; g.lineWidth = .3; g.beginPath(); g.moveTo(6.2, -14.5); g.lineTo(7, -15); g.stroke(); // mano y dedo
  // Cuello, cabeza con patillas y cabello, cuello alto del uniforme.
  g.fillStyle = bo; g.beginPath(); g.moveTo(-1.2, -12.4); g.lineTo(1.2, -12.4); g.lineTo(.9, -13.4); g.lineTo(-.9, -13.4); g.closePath(); g.fill();
  const cab = g.createRadialGradient(-.6, -15.2, .3, 0, -14.6, 2.2); cab.addColorStop(0, bh); cab.addColorStop(.5, br); cab.addColorStop(1, bo);
  g.fillStyle = cab; g.beginPath(); g.ellipse(0, -14.7, 1.35, 1.65, 0, 0, 7); g.fill();
  g.fillStyle = bo; g.beginPath(); g.ellipse(.1, -15.8, 1.4, .8, 0, Math.PI * .95, Math.PI * 2.05); g.fill(); g.fillRect(.9, -15.2, .45, 1.4); // cabello y patilla
  // Luz del bronce en el borde izquierdo de la figura.
  g.strokeStyle = 'rgba(210,235,215,.55)'; g.lineWidth = .3; g.beginPath(); g.moveTo(-1.9, -12.2); g.lineTo(-2.45, -5.6); g.stroke(); g.beginPath(); g.moveTo(-1.5, -6); g.lineTo(-1.6, -.6); g.stroke();
  g.restore();
  reja(-.24, .24, .24, .24); reja(.24, -.24, .24, .24); // lados de adelante
}
// Busto de bronce sobre un pedestal alto (como los de las plazas de verdad), con su pie en (x, y).
function estatua(g, x, y) {
  g.save(); g.translate(x, y); g.scale(.68, .68); // a escala humana (antes era más alta que las casas)
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
function maceta(g, x, y) { materas(g, [[x, y]]); } // las materas nuevas de las casas (antes cuatro círculos)
// n: 0 plaza de fundación (tierra y cruz), 1 plaza mayor (empedrada), 2 plaza cívica (pila y faroles), 3 plaza de la polis (estatua).
function plazaN(g, n) {
  const s = [.56, .6, .62, .64][n];
  // Paso 2 de la fase visual: el piso (tierra, empedrado o damero) se pinta en el suelo (asiento.js); aquí va lo que
  // se levanta. Redibujada a escala humana (pedido de Juan: «la plaza se ve horrible»): cruz y busto más bajos,
  // árboles de verdad, canteros con seto y flores, faroles de hierro, bancas y bandera con su basa.
  const z = 0, Q = (r, c) => P(r, c, z);
  const cantero = (r, c, flores) => { // jardinera baja con borde de ladrillo, seto y flores
    const p = Q(r, c); cajaPx(g, p[0], p[1], .16, .1, 1.2, '#B5654A', { izq: '#C4724F', top: '#5E8B42' });
    const R = mulberry(Math.round(r * 97 + c * 31 + 500));
    for (let k = 0; k < 9; k++) { const u = (k + .5) / 9 - .5, hx = p[0] + u * 4.6 - .2, hy = p[1] - 1.6 + u * 1.6; hojaP(g, hx, hy, -Math.PI / 2 + (R() - .5) * 1.4, 1.8 + R(), .6, R() < .5 ? '#4E7A3A' : '#6F9C4C', false); }
    if (flores) for (let k = 0; k < 5; k++) { const u = (k + .5) / 5 - .5; g.fillStyle = ['#D8433A', '#F4EFE4', '#E7B23C', '#C2407A'][k % 4]; g.beginPath(); g.arc(p[0] + u * 4.4, p[1] - 2.6 + u * 1.4 - R() * .6, .55, 0, 7); g.fill(); }
  };
  if (n === 0) {
    // Plaza de fundación: tierra, cruz de madera sobre un montón de piedras, el samán y la talanquera de amarrar.
    { const q = Q(-.05, s - .14); arbolito(g, q[0], q[1], 1.25, '#4E7A3A'); }
    const C = Q(0, 0);
    for (const [dx, dy] of [[-2.4, .2], [2, .6], [0, 1.2], [-1, -.6], [1.4, -.4]]) { g.fillStyle = '#8E8676'; g.beginPath(); g.ellipse(C[0] + dx, C[1] + dy, 1.5, .9, 0, 0, 7); g.fill(); g.fillStyle = '#B4AC9C'; g.beginPath(); g.ellipse(C[0] + dx - .4, C[1] + dy - .4, .7, .4, 0, 0, 7); g.fill(); }
    cajaPx(g, C[0], C[1], .03, .03, 16, K.madera, { z0: .8, izq: K.maderaLuz }); cajaPx(g, C[0], C[1], .16, .03, 2, K.madera, { z0: 11.6, izq: K.maderaLuz }); // cruz de madera
    const t0 = Q(s - .14, -.3), t1 = Q(s - .14, .2); for (const t of [t0, t1]) cajaPx(g, t[0], t[1], .02, .02, 5, K.maderaOsc, { izq: K.madera }); g.strokeStyle = K.madera; g.lineWidth = 1; g.beginPath(); g.moveTo(t0[0], t0[1] - 4.2); g.lineTo(t1[0], t1[1] - 4.2); g.stroke(); // talanquera
    const f = Q(-.05, -s + .12); cajaPx(g, f[0], f[1], .05, .05, 1.2, '#A39A88', { izq: '#B4AC9C' }); bandera(g, f[0], f[1] - 1.2, 22, TRICOLOR);
    return;
  }
  // Árboles en las esquinas de atrás, canteros en las otras, faroles desde la plaza cívica.
  // Por lados de la pantalla: atrás Q(-s,-s), derecha Q(-s,s), adelante Q(s,s), izquierda Q(s,-s). Nada justo
  // detrás ni delante del monumento del centro; lo de atrás se pinta primero.
  const f = Q(-s + .1, .12); cajaPx(g, f[0], f[1], .05, .05, 1.4, '#A39A88', { izq: '#B4AC9C' }); bandera(g, f[0], f[1] - 1.4, n >= 2 ? 26 : 22, TRICOLOR); // orilla de atrás a la derecha
  if (n >= 2) { const q = Q(-.12, -s + .1); farol(g, q[0], q[1], 12); } // orilla de atrás a la izquierda
  { const q = Q(-s + .14, s - .14); arbolito(g, q[0], q[1], 1.05, '#4E7A3A'); } // esquina derecha
  cantero(.1, -s + .14, true);
  const C = Q(0, 0);
  if (n === 1) cruzDePiedra(g, C[0], C[1], 1);
  else if (n === 2) pilaPlaza(g, C[0], C[1], 8.5, 13);
  else monumentoProcer(g, C[0], C[1]);
  { const q = Q(s - .14, -s + .14); arbolito(g, q[0], q[1], .95, '#5E8B42'); } // esquina izquierda
  { const q = Q(s - .12, -.2); bancoMadera(g, q[0], q[1]); }
  if (n >= 2) { const q = Q(-.2, s - .12); bancoMadera(g, q[0], q[1]); const fr = Q(.14, s - .1); farol(g, fr[0], fr[1], 12); } // orilla de adelante a la derecha
  cantero(s - .14, s - .2, n >= 2);
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

// ---------- Vida del mercado: vendedores, compradores, una mula con costales, gallinas y banderines ----------
function personaM(g, x, y, ropa, sombrero, piel = '#C98E62', canasta = false, delantal = null) {
  g.save(); g.globalAlpha = .2; g.fillStyle = '#26301E'; g.beginPath(); g.ellipse(x + 1.5, y + .5, 3, 1.1, 0, 0, 7); g.fill(); g.restore();
  g.fillStyle = mezcla(ropa, '#000000', .25); g.fillRect(x - 1.5, y - 3, 1.3, 3); g.fillRect(x + .2, y - 3, 1.3, 3); // piernas
  g.fillStyle = ropa; g.beginPath(); g.moveTo(x - 2.2, y - 3); g.lineTo(x - 1.8, y - 8.4); g.lineTo(x + 1.8, y - 8.4); g.lineTo(x + 2.2, y - 3); g.closePath(); g.fill();
  if (delantal) { g.fillStyle = delantal; g.fillRect(x - 1.6, y - 6.6, 3.2, 3.6); }
  g.fillStyle = piel; g.beginPath(); g.arc(x, y - 9.8, 1.5, 0, 7); g.fill();
  if (sombrero) { g.fillStyle = sombrero; g.beginPath(); g.ellipse(x, y - 11, 3, 1, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(x, y - 11.7, 1.5, 1, 0, Math.PI, 0); g.fill(); }
  else { g.fillStyle = '#2A1E16'; g.beginPath(); g.ellipse(x, y - 10.7, 1.6, .9, 0, Math.PI, 0); g.fill(); }
  if (canasta) { g.fillStyle = '#B58A4E'; g.beginPath(); g.ellipse(x + 3, y - 4.2, 1.8, 1.2, 0, 0, 7); g.fill(); g.fillStyle = '#C0392B'; g.beginPath(); g.arc(x + 2.4, y - 5, .7, 0, 7); g.arc(x + 3.6, y - 5, .7, 0, 7); g.fill(); }
}
function mulaCarga(g, x, y) {
  g.save(); g.globalAlpha = .2; g.fillStyle = '#26301E'; g.beginPath(); g.ellipse(x + 2, y + 1, 8, 2.2, 0, 0, 7); g.fill(); g.restore();
  g.fillStyle = '#8A5A3A'; g.beginPath(); g.ellipse(x, y - 6, 6.2, 3, -.08, 0, 7); g.fill();
  g.fillRect(x - 5, y - 4.6, 1.2, 4.6); g.fillRect(x - 2, y - 4.4, 1.2, 4.4); g.fillRect(x + 2, y - 4.4, 1.2, 4.4); g.fillRect(x + 4.4, y - 4.6, 1.2, 4.6);
  g.beginPath(); g.moveTo(x + 5, y - 7.5); g.lineTo(x + 8.6, y - 10.6); g.lineTo(x + 9.8, y - 9); g.lineTo(x + 6, y - 5); g.closePath(); g.fill(); g.beginPath(); g.moveTo(x + 8.6, y - 10.6); g.lineTo(x + 8.2, y - 13.2); g.lineTo(x + 9.4, y - 11); g.fill(); // cabeza y oreja
  for (const [dx, col] of [[-2.4, '#C9B48A'], [1.8, '#BFA87C']]) { g.fillStyle = col; g.beginPath(); g.ellipse(x + dx, y - 10, 3.2, 2.6, .1, 0, 7); g.fill(); g.strokeStyle = 'rgba(90,60,35,.5)'; g.lineWidth = .35; g.stroke(); }
}
function gallinas(g, x, y) { for (const [dx, dy, c] of [[0, 0, '#F4ECDB'], [3.6, 1.2, '#B9654A']]) { g.fillStyle = c; g.beginPath(); g.ellipse(x + dx, y + dy - 1.8, 1.9, 1.3, 0, 0, 7); g.fill(); g.beginPath(); g.arc(x + dx + 1.5, y + dy - 3.4, .8, 0, 7); g.fill(); g.fillStyle = '#C0392B'; g.fillRect(x + dx + 1.4, y + dy - 4.4, .6, .8); } }
function frutas(g, x, y, col, n = 5) { for (let k = 0; k < n; k++) { g.fillStyle = k % 2 ? mezcla(col, '#FFFFFF', .2) : col; g.beginPath(); g.arc(x + (k % 3) * 1.8 - 1.8 + (k > 2 ? .9 : 0), y - (k > 2 ? 1.8 : 0), 1, 0, 7); g.fill(); } }
function banderinesM(g, a, b) {
  g.strokeStyle = '#6B4F3A'; g.lineWidth = .4; g.beginPath(); g.moveTo(...a); g.quadraticCurveTo((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 5, ...b); g.stroke();
  const cols = ['#C0602A', '#E7C76B', '#2D6E5E', '#C4513B', '#F4ECDB'];
  for (let k = 1; k < 10; k++) { const f = k / 10, x = a[0] + (b[0] - a[0]) * f, y = a[1] + (b[1] - a[1]) * f + Math.sin(f * Math.PI) * 4.8; g.fillStyle = cols[k % 5]; g.beginPath(); g.moveTo(x - 1.4, y); g.lineTo(x + 1.4, y); g.lineTo(x, y + 2.8); g.fill(); }
}
function vidaMercado(g, e, cubierto) {
  const ropas = [['#2F5D8A', '#C9A86A'], ['#B9442F', '#F4ECDB'], ['#3E6B4A', '#2E2A28'], ['#C08A2A', '#6E4529'], ['#6A4A86', '#F4ECDB']];
  const pers = (r, c, k, canasta, delantal) => { const q = P(r, c), [ro, so] = ropas[k % 5]; personaM(g, q[0], q[1], e >= 3 ? ['#3A6EA5', '#C0392B', '#2E7D4F'][k % 3] : ro, e >= 2 && k % 2 ? null : so, ['#C98E62', '#A8704A', '#D8A07A', '#8A5A3A'][k % 4], canasta, delantal); };
  if (!cubierto) {
    const a = P(-.4, -.44, 20), b = P(-.4, .44, 20); for (const q of [a, b]) { const base = [q[0], q[1] + 20]; g.strokeStyle = K.maderaOsc; g.lineWidth = 1.2; g.beginPath(); g.moveTo(...base); g.lineTo(...q); g.stroke(); }
    banderinesM(g, a, b);
    mulaCarga(g, ...P(-.3, -.4));
    pers(-.28, -.2, 0, false, '#F4ECDB'); pers(-.28, .22, 1, false, '#F4ECDB'); pers(.02, .02, 2, false, '#F4ECDB'); // vendedores detrás de sus puestos
    pers(.3, .12, 3, true); pers(.06, -.34, 4, true); pers(.34, .36, 1, false);
    const f = P(.3, -.18); frutas(g, f[0], f[1], '#E2832B'); gallinas(g, ...P(.4, .0));
  } else if (e <= 1) {
    pers(-.28, -.18, 0, false, '#F4ECDB'); pers(-.28, .2, 1, false, '#F4ECDB'); pers(.3, -.2, 3, true); pers(.36, .2, 4, true);
    mulaCarga(g, ...P(.4, -.4)); gallinas(g, ...P(.42, .0));
  } else {
    pers(.44, -.26, 3, true); pers(.46, .1, 4, false); pers(.42, .36, 0, true); gallinas(g, ...P(.5, -.04));
    const f = P(.48, .22); frutas(g, f[0], f[1], '#C0392B');
  }
}

// ---------- Vida de banco, biblioteca y cuartel: guardias, lectores, biblioburro, camión blindado, formación ----------
function soldadoM(g, x, y, fusil = true, lanza = false) {
  personaM(g, x, y, '#4E5A34', '#3A3A2A', '#C98E62');
  g.strokeStyle = '#2E2A28'; g.lineWidth = .7; if (fusil) { g.beginPath(); g.moveTo(x + 2.2, y - 1.6); g.lineTo(x + 2.2, y - 11.4); g.stroke(); }
  if (lanza) { g.strokeStyle = K.maderaOsc; g.beginPath(); g.moveTo(x + 2.4, y); g.lineTo(x + 2.4, y - 15); g.stroke(); g.fillStyle = '#9AA0A4'; g.beginPath(); g.moveTo(x + 2.4, y - 15); g.lineTo(x + 3.4, y - 17.6); g.lineTo(x + 1.4, y - 17.6); g.fill(); }
}
function bancoVida(g, e) {
  if (e === 0) {
    const m = P(.36, .34, 0), t = P(.36, .34, 24); g.strokeStyle = K.maderaOsc; g.lineWidth = 1.2; g.beginPath(); g.moveTo(...m); g.lineTo(...t); g.stroke(); // cartel colgante con la moneda
    rellena(g, [[t[0], t[1]], [t[0] + 12, t[1] + 3], [t[0] + 12, t[1] + 12], [t[0], t[1] + 9]], '#4A3A2C', K.contorno, .4); g.fillStyle = '#E7C76B'; g.beginPath(); g.ellipse(t[0] + 6, t[1] + 7.2, 3.1, 3.4, 0, 0, 7); g.fill(); g.fillStyle = '#8A6A2A'; g.font = 'bold 4px serif'; g.textAlign = 'center'; g.fillText('$', t[0] + 6, t[1] + 8.6);
    const c = P(.38, -.2, 0); caja(g, .1, .07, 3.6, .38, -.2, 0, '#6E4529'); g.fillStyle = '#C9A24A'; const q = P(.38, -.2, 3.6); g.fillRect(q[0] - 3, q[1] - 1.8, 6, 1); void c; // cofre
    soldadoM(g, ...P(.42, .0));
  } else if (e === 3) {
    carro(g, ...P(.42, .24), '#9AA0A4', '#2E3A44'); // camión blindado
    const B = caras(.1, .08, 8, .32, -.3); muros(g, B, '#2E3A44', null); rellena(g, [B.en('izq', .15, 4), B.en('izq', .85, 4), B.en('izq', .85, 7), B.en('izq', .15, 7)], '#8FD0A0', K.contorno, .3); // cajero
    personaM(g, ...P(.44, -.3), '#2F5D8A', null, '#A8704A');
  } else {
    soldadoM(g, ...P(.46, -.24)); soldadoM(g, ...P(.46, .26));
    if (e === 2) carro(g, ...P(.5, .0), '#2E2A28', '#C9A24A');
    else { const a = P(.46, .0); caja(g, .14, .09, 4, .46, .0, 0, '#6E4529'); g.fillStyle = '#C9A24A'; const q = P(.46, .0, 4); g.fillRect(q[0] - 3, q[1] - 1.8, 6, 1); void a; }
  }
}
function libros(g, x, y, ancho = 7, filas = 2) {
  const cols = ['#B9442F', '#2F5D8A', '#E7C76B', '#3E6B4A', '#6A4A86'];
  for (let f = 0; f < filas; f++) for (let k = 0; k < ancho; k++) { g.fillStyle = cols[(k + f * 2) % 5]; g.fillRect(x + k * 1.2, y - f * 3 - 3, 1.1, 2.8 + (k % 2) * .5); }
}
function bibliotecaVida(g, e) {
  // Mesa de lectura y lectores al frente.
  caja(g, .18, .1, 3, .46, -.04, 0, K.madera);
  const mq = P(.46, -.04, 3); g.fillStyle = '#F4EEE2'; g.fillRect(mq[0] - 3, mq[1] - 1.6, 3, 1.4); g.fillRect(mq[0] + .4, mq[1] - 1, 3, 1.4); g.strokeStyle = '#3A2A1E'; g.lineWidth = .3; g.strokeRect(mq[0] - 3, mq[1] - 1.6, 3, 1.4);
  personaM(g, ...P(.5, -.22), '#B9442F', null, '#A8704A'); personaM(g, ...P(.46, .12), '#2F5D8A', '#C9A86A', '#C98E62');
  // Biblioburro (épocas de tierra y tapia) o bibliobús (ladrillo y concreto).
  if (e <= 1) { const x = P(.44, .34); mulaCarga(g, x[0], x[1]); libros(g, x[0] - 4, x[1] - 9, 7, 2); }
  else { const x = P(.46, .34); carro(g, x[0], x[1], '#E7C76B', '#2F5D8A'); libros(g, x[0] - 3, x[1] - 6, 5, 1); }
}
function cuartelVida(g, e) {
  if (e === 0) { // campamento: lanceros y una fogata
    soldadoM(g, ...P(.36, -.16), false, true); soldadoM(g, ...P(.38, .1), false, true);
    const f = P(.34, .34); g.fillStyle = '#4A3A2C'; for (const [dx, dy] of [[-2, 0], [2, .6], [0, -1.4]]) { g.beginPath(); g.ellipse(f[0] + dx, f[1] + dy, 2, .6, .3, 0, 7); g.fill(); }
    g.fillStyle = '#E8A93A'; g.beginPath(); g.moveTo(f[0], f[1] - 7); g.quadraticCurveTo(f[0] + 3, f[1] - 3, f[0], f[1] - 1); g.quadraticCurveTo(f[0] - 3, f[1] - 3, f[0], f[1] - 7); g.fill(); g.fillStyle = '#F6E3A0'; g.beginPath(); g.ellipse(f[0], f[1] - 3, 1, 1.8, 0, 0, 7); g.fill();
    return;
  }
  // Formación de cinco soldados con su oficial al frente.
  for (let k = 0; k < 5; k++) soldadoM(g, ...P(.46, -.34 + k * .15));
  personaM(g, ...P(.56, .0), '#2F3E24', '#2E2A28', '#C98E62'); g.strokeStyle = '#C9C9C9'; g.lineWidth = .6; { const o = P(.56, .0); g.beginPath(); g.moveTo(o[0] + 2, o[1] - 3); g.lineTo(o[0] + 6, o[1] - 8); g.stroke(); } // oficial con sable
  if (e <= 2) for (const c of [-.46, .46]) { const q = P(.2, c, 0); g.strokeStyle = '#2E2A28'; g.lineWidth = 2; g.lineCap = 'round'; g.beginPath(); g.moveTo(q[0] - 5, q[1] - 2); g.lineTo(q[0] + 4, q[1] - 5.4); g.stroke(); g.fillStyle = '#3A2A1C'; g.beginPath(); g.arc(q[0] - 2, q[1] + .6, 2.2, 0, 7); g.fill(); } // cañones
  else { // helipuerto con helicóptero
    const h = P(.12, .5, 0); g.fillStyle = '#6E7378'; g.beginPath(); g.ellipse(h[0], h[1], 11, 5.4, 0, 0, 7); g.fill(); g.strokeStyle = '#F4F1E8'; g.lineWidth = .8; g.beginPath(); g.ellipse(h[0], h[1], 8.4, 4, 0, 0, 7); g.stroke(); g.fillStyle = '#F4F1E8'; g.font = 'bold 6px sans-serif'; g.textAlign = 'center'; g.fillText('H', h[0], h[1] + 2.2);
    g.fillStyle = '#4E5A34'; g.beginPath(); g.ellipse(h[0], h[1] - 7, 5.4, 2.8, 0, 0, 7); g.fill(); g.strokeStyle = '#4E5A34'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(h[0] - 4, h[1] - 6); g.lineTo(h[0] - 13, h[1] - 8); g.stroke(); g.strokeStyle = '#2E2A28'; g.lineWidth = .6; g.beginPath(); g.moveTo(h[0] - 10, h[1] - 12.4); g.lineTo(h[0] + 10, h[1] - 12.4); g.moveTo(h[0], h[1] - 9.8); g.lineTo(h[0], h[1] - 12.4); g.stroke();
  }
}


// ---------- Huellas de las decisiones y del conflicto (pedido de Juan, 13 de octubre: el mismo detalle de las obras) ----------
function sombraSuelo(g, x, y, rx, ry, al = .22) { g.save(); g.globalAlpha = al; g.fillStyle = '#26301E'; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 7); g.fill(); g.restore(); }
// Saco de fique o de arena, tendido a lo largo (rot), con su costura y su sombra.
function costal(g, x, y, col = '#C9B48A', rot = .45, l = 3.4, a = 1.9) {
  g.save(); g.translate(x, y); g.rotate(rot);
  const gr = g.createLinearGradient(0, -a, 0, a); gr.addColorStop(0, mezcla(col, '#FFFFFF', .22)); gr.addColorStop(.6, col); gr.addColorStop(1, mezcla(col, '#000000', .28));
  g.fillStyle = gr; g.beginPath(); g.moveTo(-l, -a * .6); g.quadraticCurveTo(-l - .5, 0, -l, a * .6); g.quadraticCurveTo(0, a * 1.15, l, a * .6); g.quadraticCurveTo(l + .5, 0, l, -a * .6); g.quadraticCurveTo(0, -a * 1.15, -l, -a * .6); g.fill();
  g.strokeStyle = 'rgba(80,58,34,.55)'; g.lineWidth = .3; g.stroke();
  g.beginPath(); g.moveTo(-l * .25, -a * .8); g.lineTo(-l * .2, a * .8); g.moveTo(l * .55, -a * .7); g.lineTo(l * .6, a * .7); g.stroke();
  g.restore();
}
// Poste de madera con la punta clara (cerca de alambre).
function poste(g, x, y, h = 7, col = K.maderaOsc) { g.strokeStyle = col; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - h); g.stroke(); g.fillStyle = mezcla(col, '#FFFFFF', .3); g.fillRect(x - .5, y - h - .3, 1, .6); }
function alambre(g, pts, alto) { g.save(); g.strokeStyle = 'rgba(70,70,70,.7)'; g.lineWidth = .3; for (const z of alto) { g.beginPath(); pts.forEach(([x, y], k) => k ? g.lineTo(x, y - z) : g.moveTo(x, y - z)); g.stroke(); } g.restore(); }
// Cilindro (tanque, barril): base en (x, y), radio rx, alto h.
function cilindro(g, x, y, rx, h, col, tapa = null) {
  const ry = rx * .5, gr = g.createLinearGradient(x - rx, 0, x + rx, 0);
  gr.addColorStop(0, mezcla(col, '#FFFFFF', .15)); gr.addColorStop(.35, col); gr.addColorStop(1, mezcla(col, '#000000', .3));
  g.fillStyle = gr; g.beginPath(); g.moveTo(x - rx, y - h); g.lineTo(x - rx, y); g.ellipse(x, y, rx, ry, 0, Math.PI, 0, true); g.lineTo(x + rx, y - h); g.closePath(); g.fill();
  g.strokeStyle = K.contorno; g.lineWidth = .45; g.stroke();
  g.fillStyle = mezcla(col, '#FFFFFF', .25); g.beginPath(); g.ellipse(x, y - h, rx, ry, 0, 0, 7); g.fill(); g.stroke();
  if (tapa) { g.fillStyle = tapa; g.beginPath(); g.ellipse(x, y - h + .3, rx * .84, ry * .8, 0, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.ellipse(x - rx * .3, y - h, rx * .3, ry * .22, 0, 0, 7); g.fill(); }
}
function vela(g, x, y, h = 3.4) {
  g.fillStyle = '#F4EEDC'; g.fillRect(x - .55, y - h, 1.1, h); g.fillStyle = 'rgba(120,100,80,.25)'; g.fillRect(x + .1, y - h, .45, h);
  const gr = g.createRadialGradient(x, y - h - 1.2, 0, x, y - h - 1.2, 3.4); gr.addColorStop(0, 'rgba(255,236,170,1)'); gr.addColorStop(.35, 'rgba(255,200,100,.55)'); gr.addColorStop(1, 'rgba(255,190,90,0)');
  g.fillStyle = gr; g.fillRect(x - 3.4, y - h - 4.6, 6.8, 6.8); g.fillStyle = '#FFF4D0'; g.beginPath(); g.ellipse(x, y - h - 1, .45, .9, 0, 0, 7); g.fill();
}
function flores(g, x, y, cols = ['#F4F1E6', '#C0392B', '#E7C76B']) {
  for (let k = 0; k < 6; k++) { const dx = (k - 2.5) * 1.1, h = 2.2 + (k % 3) * .7; g.strokeStyle = '#4E7A3A'; g.lineWidth = .35; g.beginPath(); g.moveTo(x + dx * .5, y); g.lineTo(x + dx, y - h); g.stroke(); g.fillStyle = cols[k % cols.length]; g.beginPath(); g.arc(x + dx, y - h, .75, 0, 7); g.fill(); }
}
function dique(g, e) {
  const F = caras(.9, .14, e >= 3 ? 9 : 7, -.16);
  sombraCasa(g, F);
  if (e >= 3) { muros(g, F, '#C8C4BA', null); g.save(); g.strokeStyle = 'rgba(80,80,80,.35)'; g.lineWidth = .35; for (let u = .1; u < 1; u += .2) { const a = F.en('izq', u, 0), b = F.en('izq', u, F.H); g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); } g.restore(); for (let u = .15; u < 1; u += .2) { const c = F.en('izq', u, 1.6); g.fillStyle = '#4A4A48'; g.beginPath(); g.ellipse(c[0], c[1], .7, .45, 0, 0, 7); g.fill(); } }
  else { muros(g, F, PIEDRA, null); sillares(g, F); }
  rellena(g, [P(F.f, F.a - .02, F.H + .1), P(F.f, F.b + .02, F.H + .1), P(F.t, F.b + .02, F.H + .1), P(F.t, F.a - .02, F.H + .1)], e >= 3 ? '#DAD6CC' : '#B7AE9C'); // remate
  // Sacos de arena en dos hiladas al pie, del lado del pueblo.
  for (let k = 0; k < 9; k++) { const q = P(.02, -.4 + k * .1); costal(g, q[0], q[1] - 1.4, k % 2 ? '#C9B48A' : '#BFA87C', .46); }
  for (let k = 0; k < 8; k++) { const q = P(.02, -.35 + k * .1, 2.6); costal(g, q[0], q[1] - 1.4, k % 2 ? '#D2BE95' : '#C4AE82', .46); }
  for (const c of [-.42, .44]) poste(g, ...P(.08, c), 6);
}
function reservorio(g, e) {
  const anillo = (s, z) => [P(-s, -s, z), P(-s, s, z), P(s, s, z), P(s, -s, z)];
  rellena(g, anillo(.42, 0), '#8E7452', null);
  rellena(g, anillo(.38, 1.2), grad(g, 0, P(-.38, -.38)[1], 0, P(.38, .38)[1], [[0, '#A9875C'], [1, '#C4A574']]), 'rgba(70,50,30,.4)', .4); // terraplén
  rellena(g, anillo(.31, .2), grad(g, 0, P(-.31, -.31)[1], 0, P(.31, .31)[1], [[0, '#3E6E84'], [.6, '#5E93A8'], [1, '#7FB2C2']]), 'rgba(40,60,70,.45)', .4); // agua
  g.save(); g.strokeStyle = 'rgba(255,255,255,.45)'; g.lineWidth = .4; for (const [r, c, l] of [[-.1, -.12, .14], [.06, .04, .1], [.14, -.08, .08]]) { g.beginPath(); g.moveTo(...P(r, c, .2)); g.lineTo(...P(r, c + l, .2)); g.stroke(); } g.restore();
  // Caseta de la bomba con techo de zinc y el tubo que baja al agua.
  const C = caras(.14, .12, 6, .3, .34); muros(g, C, '#E8E0CE', '#6E7A84'); hueco(g, C, 'izq', .3, .7, 0, 4.4, '#3A2A1E'); dosAguas(g, C, 3, MAT.zinc);
  g.strokeStyle = '#5E6670'; g.lineWidth = 1; g.beginPath(); g.moveTo(...P(.26, .27, 1)); g.lineTo(...P(.16, .16, .3)); g.stroke();
  const cerca = [P(.44, -.44), P(.44, .2)]; for (let k = 0; k <= 5; k++) { const t = k / 5; poste(g, cerca[0][0] + (cerca[1][0] - cerca[0][0]) * t, cerca[0][1] + (cerca[1][1] - cerca[0][1]) * t, 5); }
  alambre(g, cerca, [2.2, 4]);
}
function tanques(g, e) {
  sombraSuelo(g, 4, 3, 26, 8);
  rellena(g, [P(-.4, -.4), P(-.4, .42), P(.4, .42), P(.4, -.4)], '#B7AE98', 'rgba(70,60,40,.3)', .4); // placa de cemento
  const a = P(-.12, -.18), b = P(.16, .14);
  cilindro(g, a[0], a[1], 11, 9, e >= 3 ? '#C9CCC8' : '#BDB6A6', '#6E7E52'); cilindro(g, b[0], b[1], 9, 7, e >= 3 ? '#C9CCC8' : '#BDB6A6', '#7E8C5E');
  g.strokeStyle = '#6E737A'; g.lineWidth = .5; for (const [x, y, h] of [[a[0] + 9, a[1], 9], [b[0] + 7.5, b[1], 7]]) { g.beginPath(); g.moveTo(x, y + 1); g.lineTo(x, y - h - 1); g.moveTo(x + 1.6, y + 1.4); g.lineTo(x + 1.6, y - h - .6); g.stroke(); for (let z = 1; z < h; z += 1.6) { g.beginPath(); g.moveTo(x, y - z); g.lineTo(x + 1.6, y - z + .4); g.stroke(); } } // escalerillas
  g.strokeStyle = '#5E6670'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(a[0] + 6, a[1] + 3); g.quadraticCurveTo(a[0] + 14, a[1] + 8, b[0] - 6, b[1] + 2); g.moveTo(b[0] + 6, b[1] + 3); g.lineTo(...P(.42, .3)); g.stroke(); // tubos al río
  const L = caras(.12, .1, 5, .3, -.3); muros(g, L, '#E8E0CE', '#6E7A84'); dosAguas(g, L, 2.4, MAT.zincOxido);
}
function granero(g, e) {
  const F = caras(.36, .3, 9, -.02, 0, 4.6);
  sombraCasa(g, { ...F, z0: 0 });
  for (const [r, c] of [[F.f, F.a], [F.f, F.b], [F.t, F.b], [F.f - .15, F.a]]) { const p = P(r, c); g.fillStyle = '#9A9284'; g.beginPath(); g.ellipse(p[0], p[1], 2, .9, 0, 0, 7); g.fill(); g.strokeStyle = K.maderaOsc; g.lineWidth = 1.4; g.beginPath(); g.moveTo(p[0], p[1] - .4); g.lineTo(p[0], p[1] - 4.8); g.stroke(); } // pilotes sobre piedras (contra la humedad y los ratones)
  rellena(g, [P(F.f + .03, F.a - .03, 4.6), P(F.f + .03, F.b + .03, 4.6), P(F.f + .03, F.b + .03, 3.8), P(F.f + .03, F.a - .03, 3.8)], K.maderaOsc, null);
  muros(g, F, '#9A6A42', null);
  g.save(); g.strokeStyle = 'rgba(60,35,20,.55)'; g.lineWidth = .35; for (const cara of ['izq', 'der']) for (let z = 1.5; z < 9; z += 1.5) { const a = F.en(cara, 0, z), b = F.en(cara, 1, z); g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); } g.restore(); // tablas
  hueco(g, F, 'izq', .38, .62, .6, 6.4, '#3A2618');
  dosAguas(g, F, 5, e === 0 ? MAT.paja : MAT.zincOxido);
  const l0 = P(F.f + .16, F.a + .45), l1 = F.en('izq', .5, .6); g.strokeStyle = K.madera; g.lineWidth = .6; g.beginPath(); g.moveTo(l0[0] - 1.4, l0[1]); g.lineTo(l1[0] - 1.4, l1[1]); g.moveTo(l0[0] + 1.4, l0[1]); g.lineTo(l1[0] + 1.4, l1[1]); g.stroke(); for (let k = 1; k < 5; k++) { const t = k / 5; g.beginPath(); g.moveTo(l0[0] - 1.4 + (l1[0] - l0[0]) * t, l0[1] + (l1[1] - l0[1]) * t); g.lineTo(l0[0] + 1.4 + (l1[0] - l0[0]) * t, l0[1] + (l1[1] - l0[1]) * t); g.stroke(); } // escalera
  for (let k = 0; k < 3; k++) { const q = P(.3 + (k % 2) * .06, .22 + k * .07); costal(g, q[0], q[1] - 1.5, k % 2 ? '#C9B48A' : '#D6C49A', -.4, 2.6, 1.8); }
  gallinas(g, ...P(.36, -.18));
}
function cooperativa(g, e) {
  const E = epoca(e, { muro: '#F1E9D6', zocalo: '#3E6B4A', carp: '#3E6B4A', techo: 'teja' });
  const F = caras(.58, .38, e === 3 ? 13 : 11, -.06);
  sombraCasa(g, F); murosDe(g, F, E);
  puerta(g, F, 'izq', .28, .16, 8.5, E.carp, e < 2); puerta(g, F, 'izq', .62, .16, 8.5, E.carp, e < 2); ventana(g, F, 'der', .5, 4, .18, 4.6, E.carp, E.vent);
  techoDe(g, F, 8, E, false, { sale: e < 3 ? .1 : 0 });
  letreroAncho(g, F, .12, .86, F.H - 1.2, '#3E6B4A', 'COOPERATIVA');
  for (const c of [F.a + .02, F.a + .3, F.b - .02]) { const p = P(F.f + .12, c), q = P(F.f + .12, c, 9.4); g.strokeStyle = K.madera; g.lineWidth = .9; g.beginPath(); g.moveTo(...p); g.lineTo(...q); g.stroke(); } // horcones del corredor
  // Café en sacos al frente, la báscula y una mula que llega cargada.
  for (let k = 0; k < 6; k++) { const q = P(F.f + .2 + (k > 2 ? .07 : 0), F.a + .5 + (k % 3) * .08, k > 2 ? 2.6 : 0); costal(g, q[0], q[1] - 1.5, '#D2BE95', -.42, 3, 2); g.fillStyle = 'rgba(90,40,25,.6)'; g.fillRect(q[0] - .8, q[1] - 2, 1.6, .5); }
  const b = P(F.f + .2, F.a + .2); g.fillStyle = '#5E6670'; g.fillRect(b[0] - 2, b[1] - 1, 4, 1); g.fillRect(b[0] - .3, b[1] - 6, .6, 5); g.fillStyle = '#C9A24A'; g.beginPath(); g.arc(b[0], b[1] - 6.8, 1.4, 0, 7); g.fill();
  mulaCarga(g, ...P(F.f + .32, F.a - .02));
  const pz = P(F.f + .3, F.b - .1); personaM(g, pz[0], pz[1], '#F4EFE4', '#F4EFE2', '#A8704A');
}
function escuelita(g, e) {
  const E = epoca(e, { muro: '#F4EEE2', zocalo: '#2F5D8A', carp: '#2F5D8A', techo: 'tejaVieja', techo2: 'zinc', muro2: '#F2EBDC', zocalo2: '#2F5D8A' });
  const F = caras(.52, .34, 10, -.08);
  sombraCasa(g, F); murosDe(g, F, E);
  puerta(g, F, 'izq', .22, .14, 8, E.carp, false); fila(g, F, 'izq', 2, 3.5, .12, 4.4, E, .4, .95); ventana(g, F, 'der', .5, 3.5, .16, 4.4, E.carp, E.vent);
  techoDe(g, F, 7, E, false, { sale: e < 3 ? .12 : 0 });
  for (const c of [F.a + .02, F.a + .26, F.b - .2, F.b - .02]) { const p = P(F.f + .14, c), q = P(F.f + .14, c, 8.6); g.strokeStyle = K.madera; g.lineWidth = .8; g.beginPath(); g.moveTo(...p); g.lineTo(...q); g.stroke(); }
  letrero(g, F, .5, 8.6, '#2F5D8A', 'ESCUELA');
  // Campana en su horcón, la bandera, la rayuela y los niños.
  const cp = P(F.f + .24, F.a - .06); g.strokeStyle = K.maderaOsc; g.lineWidth = 1; g.beginPath(); g.moveTo(cp[0] - 2, cp[1]); g.lineTo(cp[0] - 2, cp[1] - 11); g.moveTo(cp[0] + 2, cp[1]); g.lineTo(cp[0] + 2, cp[1] - 11); g.moveTo(cp[0] - 2.6, cp[1] - 11); g.lineTo(cp[0] + 2.6, cp[1] - 11); g.stroke(); g.fillStyle = '#C9A24A'; g.beginPath(); g.moveTo(cp[0] - 1.4, cp[1] - 7.6); g.quadraticCurveTo(cp[0], cp[1] - 11.6, cp[0] + 1.4, cp[1] - 7.6); g.fill();
  const bd = P(F.t - .02, F.a - .12); bandera(g, bd[0], bd[1], 22, TRICOLOR);
  rayuela(g, F.f + .22, F.a + .4);
  for (const [r, c, col] of [[F.f + .3, F.a + .32, '#B23A2E'], [F.f + .34, F.a + .56, '#2F6E8E'], [F.f + .26, F.b - .1, '#E0A030']]) { const q = P(r, c); g.save(); g.translate(q[0], q[1]); g.scale(.7, .7); personaM(g, 0, 0, col, null, '#C98E62'); g.restore(); }
}
function parcela(g, e) {
  // Surcos con matas jóvenes.
  const surco = (k) => [P(-.05 + k * .07, -.46), P(-.05 + k * .07, .04)];
  rellena(g, [P(-.1, -.48), P(-.1, .06), P(.42, .06), P(.42, -.48)], '#8C6E4A', null);
  for (let k = 0; k < 7; k++) { const [a, b] = surco(k); g.strokeStyle = 'rgba(90,64,40,.7)'; g.lineWidth = 1; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); for (let j = 0; j < 7; j++) { const t = (j + .5) / 7, x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t; g.fillStyle = j % 2 ? '#6E9A44' : '#5E8B3A'; g.beginPath(); g.ellipse(x, y - 1, 1.2, .9, 0, 0, 7); g.fill(); g.fillStyle = '#8CB85A'; g.beginPath(); g.arc(x - .3, y - 1.4, .45, 0, 7); g.fill(); } }
  // Cerca de alambre y la casita del retorno, con ropa tendida.
  const cerca = [P(.46, -.5), P(.46, .1), P(-.12, .1)];
  for (const [p, q] of [[cerca[0], cerca[1]], [cerca[1], cerca[2]]]) for (let k = 0; k <= 4; k++) { const t = k / 4; poste(g, p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, 5); }
  alambre(g, cerca, [2, 3.8]);
  const F = caras(.24, .22, 8, -.24, .3); sombraCasa(g, F); murosDe(g, F, epoca(e === 3 ? 2 : e, { muro: '#EDE4D2', zocalo: '#8A6A48', muro2: '#E8DCC4' })); puerta(g, F, 'izq', .4, .26, 6.4, '#6E4529', false); ventana(g, F, 'der', .5, 3.4, .22, 3, '#3E6B4A'); dosAguas(g, F, 4.4, MAT.zincOxido);
  const az = P(.2, -.2); g.strokeStyle = K.madera; g.lineWidth = .7; g.beginPath(); g.moveTo(az[0], az[1]); g.lineTo(az[0] + 4, az[1] - 9); g.stroke(); // azadón clavado
  const pz = P(.1, .12); personaM(g, pz[0], pz[1], '#F4EFE4', '#F4EFE2', '#A8704A');
}
function reten(g, e) {
  sombraSuelo(g, 2, 3, 24, 6);
  // Cambuche de plástico negro detrás: cuatro varas y la lona a una sola agua.
  const cv = [[-.42, -.42], [-.42, -.12], [-.22, -.12], [-.22, -.42]], alto = [7.5, 7.5, 5.5, 5.5];
  cv.forEach(([r, c], k) => { const a = P(r, c), b = P(r, c, alto[k]); g.strokeStyle = K.maderaOsc; g.lineWidth = .8; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); });
  rellena(g, cv.map(([r, c], k) => P(r, c, alto[k])), '#2E3032', 'rgba(0,0,0,.4)', .3); g.save(); g.globalAlpha = .25; g.strokeStyle = '#8A9096'; g.lineWidth = .4; g.beginPath(); g.moveTo(...P(-.38, -.4, 7.2)); g.lineTo(...P(-.26, -.16, 5.8)); g.stroke(); g.restore();
  const cama = P(-.32, -.27); costal(g, cama[0], cama[1] - 1, '#4A5A3A', .45, 3.6, 1.4);
  // Trinchera de costales en media luna.
  for (let k = 0; k < 9; k++) { const an = -1.2 + k * .3, q = P(-.12 + Math.sin(an) * .2, -.18 + Math.cos(an) * .26); costal(g, q[0], q[1] - 1.5, k % 2 ? '#8E8462' : '#A0966E', -.2 + an * .5, 3, 1.9); }
  for (let k = 0; k < 7; k++) { const an = -.9 + k * .3, q = P(-.12 + Math.sin(an) * .2, -.18 + Math.cos(an) * .26, 2.8); costal(g, q[0], q[1] - 1.5, k % 2 ? '#9C9270' : '#857B5A', -.2 + an * .5, 3, 1.9); }
  // Barrera de rayas sobre dos horquetas.
  const a = P(.2, -.3, 4.6), b = P(.2, .3, 4.6);
  for (const q of [P(.2, -.3), P(.2, .3)]) { g.strokeStyle = K.maderaOsc; g.lineWidth = 1.1; g.beginPath(); g.moveTo(...q); g.lineTo(q[0], q[1] - 5.4); g.stroke(); }
  for (let k = 0; k < 8; k++) { const t0 = k / 8, t1 = (k + 1) / 8; g.strokeStyle = k % 2 ? '#F4F1E6' : '#B9302A'; g.lineWidth = 1.4; g.lineCap = 'butt'; g.beginPath(); g.moveTo(a[0] + (b[0] - a[0]) * t0, a[1] + (b[1] - a[1]) * t0); g.lineTo(a[0] + (b[0] - a[0]) * t1, a[1] + (b[1] - a[1]) * t1); g.stroke(); }
  // Letrero de ALTO, un barril y el plástico negro del cambuche.
  const s = P(.32, .36); g.strokeStyle = '#4A3A2C'; g.lineWidth = .7; g.beginPath(); g.moveTo(...s); g.lineTo(s[0], s[1] - 9); g.stroke();
  g.fillStyle = '#B9302A'; g.beginPath(); for (let k = 0; k < 8; k++) { const an = k / 8 * Math.PI * 2 + Math.PI / 8; g.lineTo(s[0] + Math.cos(an) * 3, s[1] - 11 + Math.sin(an) * 3); } g.closePath(); g.fill(); g.strokeStyle = '#F4F1E6'; g.lineWidth = .3; g.stroke();
  g.fillStyle = '#F7F1E3'; g.font = 'bold 1.9px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('ALTO', s[0], s[1] - 10.9);
  const br = P(-.3, .28); cilindro(g, br[0], br[1], 2.6, 5.4, '#3E5A6E', '#2A2A2A');

}
function campamento(g, e) {
  sombraSuelo(g, 2, 3, 26, 8, .18);
  // Dos cambuches de plástico negro sobre varas, una hamaca, el fogón y el morral.
  for (const [r, c, col] of [[-.18, -.2, '#2A2C2E'], [.12, .22, '#3A4A36']]) {
    const a = P(r - .12, c - .16, 0), b = P(r - .12, c + .16, 0), m1 = P(r, c - .16, 7), m2 = P(r, c + .16, 7), a2 = P(r + .12, c - .16, 0), b2 = P(r + .12, c + .16, 0);
    rellena(g, [a, b, m2, m1], mezcla(col, '#000000', .25), 'rgba(0,0,0,.35)', .3); rellena(g, [a2, b2, m2, m1], col, 'rgba(0,0,0,.35)', .3);
    g.strokeStyle = K.maderaOsc; g.lineWidth = .7; g.beginPath(); g.moveTo(m1[0], m1[1]); g.lineTo(m1[0], m1[1] + 7.5); g.moveTo(m2[0], m2[1]); g.lineTo(m2[0], m2[1] + 7.5); g.stroke();
  }
  for (const c of [-.36, -.04]) { const a = P(.26, c), b = P(.26, c, 6); g.strokeStyle = K.maderaOsc; g.lineWidth = 1; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); }
  const h0 = P(.26, -.34, 4.6), h1 = P(.26, -.06, 4.6); g.strokeStyle = '#8E2F22'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(...h0); g.quadraticCurveTo((h0[0] + h1[0]) / 2, (h0[1] + h1[1]) / 2 + 3, ...h1); g.stroke(); // hamaca
  const f = P(.3, .1); for (let k = 0; k < 5; k++) { g.fillStyle = '#8A8478'; g.beginPath(); g.ellipse(f[0] + Math.cos(k * 1.26) * 2.4, f[1] + Math.sin(k * 1.26) * 1.2, .9, .6, 0, 0, 7); g.fill(); }
  g.fillStyle = '#3A2A1E'; g.beginPath(); g.ellipse(f[0], f[1], 1.6, .8, 0, 0, 7); g.fill(); const gr = g.createRadialGradient(f[0], f[1] - 1, 0, f[0], f[1] - 1, 3); gr.addColorStop(0, 'rgba(255,190,90,.9)'); gr.addColorStop(1, 'rgba(255,150,60,0)'); g.fillStyle = gr; g.fillRect(f[0] - 3, f[1] - 4, 6, 6);
  const m = P(.02, .02); g.fillStyle = '#4A4A36'; g.beginPath(); g.ellipse(m[0], m[1] - 1.8, 2, 2.2, 0, 0, 7); g.fill(); g.fillStyle = '#3A3A2A'; g.fillRect(m[0] - 1.6, m[1] - 2.6, 3.2, .7);
}
function cruzCamino(g) {
  sombraSuelo(g, 3, 1.5, 8, 2.4);
  for (let k = 0; k < 7; k++) { g.fillStyle = ['#9C9384', '#B4AB9A', '#857C6E'][k % 3]; g.beginPath(); g.ellipse(-4 + (k % 4) * 2.6, -1 - Math.floor(k / 4) * 1.6, 1.6, 1.1, 0, 0, 7); g.fill(); } // montón de piedras
  const gr = g.createLinearGradient(-1.2, 0, 1.2, 0); gr.addColorStop(0, '#7A5A3E'); gr.addColorStop(1, '#4A3220');
  g.fillStyle = gr; g.fillRect(-1.1, -27, 2.2, 25); g.fillRect(-7, -21, 14, 2.1);
  g.strokeStyle = 'rgba(40,25,15,.45)'; g.lineWidth = .3; for (const x of [-.5, .4]) { g.beginPath(); g.moveTo(x, -26); g.lineTo(x + .1, -3); g.stroke(); } g.beginPath(); g.moveTo(-6.5, -20.2); g.lineTo(6.5, -20.4); g.stroke(); // vetas
  g.fillStyle = '#F4EEDC'; g.fillRect(-2.6, -18.4, 5.2, 3.2); g.fillStyle = 'rgba(60,40,30,.55)'; for (let k = 0; k < 3; k++) g.fillRect(-2, -17.6 + k * .9, k === 2 ? 2.4 : 4, .4); // la tablita con el nombre
  const lata = [4.6, -.6]; g.fillStyle = '#9AA0A4'; g.fillRect(lata[0] - 1.3, lata[1] - 2.6, 2.6, 2.6); flores(g, lata[0], lata[1] - 2.6);
  vela(g, -5, -.2, 3); vela(g, -3.2, .6, 2.4);
}
function sabana(g) {
  sombraSuelo(g, 2, 1.5, 15, 3.4, .2);
  // Cuerpo cubierto con una sábana blanca, de cabeza a pies a lo largo; asoman las botas.
  const pts = [[-14, .4], [-12.6, -2.6], [-10.6, -4.6], [-8.2, -4], [-6, -4.8], [0, -5.4], [5, -4.6], [9, -3.6], [12.4, -2.2], [13.6, .4], [9, 2.2], [0, 3], [-8, 2.6]];
  g.beginPath(); g.moveTo(...pts[0]); for (let k = 1; k < pts.length; k++) { const p = pts[k], q = pts[(k + 1) % pts.length]; g.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2); } g.closePath();
  const gr = g.createLinearGradient(0, -5.4, 0, 3); gr.addColorStop(0, '#FBF8F0'); gr.addColorStop(.55, '#ECE6D8'); gr.addColorStop(1, '#C9C1B0'); g.fillStyle = gr; g.fill(); g.strokeStyle = 'rgba(110,100,85,.5)'; g.lineWidth = .35; g.stroke();
  g.save(); g.clip(); g.strokeStyle = 'rgba(150,140,120,.45)'; g.lineWidth = .45; for (const [x0, x1] of [[-9, -7], [-3, -1.5], [2.5, 4], [7, 8.5]]) { g.beginPath(); g.moveTo(x0, -4.6); g.quadraticCurveTo((x0 + x1) / 2 - .6, -1, x1, 2.6); g.stroke(); } g.restore(); // pliegues
  for (const [x, y] of [[13.4, -1.6], [13.9, .3]]) { g.fillStyle = '#3A2E24'; g.beginPath(); g.ellipse(x, y, 1.3, .8, -.3, 0, 7); g.fill(); g.fillStyle = '#5A4632'; g.beginPath(); g.ellipse(x + .4, y - .3, .5, .3, 0, 0, 7); g.fill(); }
  vela(g, -16.6, -1.4, 3); vela(g, -16, 1.6, 2.4); flores(g, -11, 4.2, ['#F4F1E6', '#E7C76B', '#F4F1E6']);
}
function impactos(g) {
  for (const [x, y, s] of [[-7, -4, 1], [-2, -6, .8], [3, -2, 1.1], [6, -6, .7], [-4, 2, .9], [1, 3, .8], [8, 1, .7], [-9, 0, .6]]) {
    g.fillStyle = 'rgba(196,184,164,.95)'; g.beginPath(); for (let k = 0; k < 7; k++) { const an = k / 7 * Math.PI * 2, rr = (1.5 + (k % 2) * .6) * s; g.lineTo(x + Math.cos(an) * rr, y + Math.sin(an) * rr * .9); } g.closePath(); g.fill(); // la cal saltada, de borde irregular
    g.fillStyle = 'rgba(120,96,70,.6)'; g.beginPath(); g.arc(x + .2, y + .2, .95 * s, 0, 7); g.fill();
    g.fillStyle = '#231C17'; g.beginPath(); g.arc(x, y, .55 * s, 0, 7); g.fill();
    g.strokeStyle = 'rgba(60,45,35,.5)'; g.lineWidth = .2; g.beginPath(); g.moveTo(x + .6 * s, y - .3 * s); g.lineTo(x + 2.2 * s, y - 1.2 * s); g.moveTo(x - .5 * s, y + .5 * s); g.lineTo(x - 1.8 * s, y + 1.6 * s); g.stroke(); // grietas finas
  }
}
function mesaPaz(g) {
  sombraSuelo(g, 3, 3, 20, 6);
  // Toldo blanco sobre cuatro varas, la mesa con mantel, dos bancas enfrentadas y las banderas blancas.
  const T = [P(-.24, -.3, 15), P(-.24, .3, 15), P(.24, .3, 15), P(.24, -.3, 15)];
  const vara = (r, c) => { const a = P(r, c), b = P(r, c, 15); g.strokeStyle = K.maderaOsc; g.lineWidth = .8; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); };
  vara(-.24, -.3); vara(-.24, .3); // las de atrás, antes que la mesa
  const M = caras(.36, .18, 1.2, 0, 0, 5); muros(g, { ...M }, '#F7F3EA', null); rellena(g, [P(M.f, M.a, 6.2), P(M.f, M.b, 6.2), P(M.t, M.b, 6.2), P(M.t, M.a, 6.2)], '#FBF8F2');
  for (const [r, c] of [[M.f - .02, M.a + .03], [M.f - .02, M.b - .03], [M.t + .02, M.b - .03]]) { const a = P(r, c), b = P(r, c, 5); g.strokeStyle = K.madera; g.lineWidth = .8; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); }
  for (const [x, y] of [P(-.02, -.06, 6.2), P(.02, .08, 6.2)]) { g.fillStyle = '#F4EEE0'; g.save(); g.translate(x, y); g.rotate(.45); g.fillRect(-1.6, -1, 3.2, 2); g.fillStyle = 'rgba(60,40,30,.5)'; for (let k = 0; k < 3; k++) g.fillRect(-1.2, -.6 + k * .5, 2.4, .2); g.restore(); }
  const j = P(0, .14, 6.2); g.fillStyle = '#B5603A'; g.beginPath(); g.ellipse(j[0], j[1] - 1.4, 1, 1.5, 0, 0, 7); g.fill(); // jarra de agua
  for (const r of [-.2, .2]) { const B = caras(.3, .06, 3, r, 0); muros(g, B, K.madera, null); rellena(g, [P(B.f, B.a, 3), P(B.f, B.b, 3), P(B.t, B.b, 3), P(B.t, B.a, 3)], K.maderaLuz); }
  vara(.24, .3); vara(.24, -.3); // las de adelante
  rellena(g, T, 'rgba(250,247,240,.7)', 'rgba(120,110,95,.5)', .35); g.save(); g.strokeStyle = 'rgba(150,140,120,.35)'; g.lineWidth = .4; for (let k = 1; k < 4; k++) { const t = k / 4, a = [T[0][0] + (T[1][0] - T[0][0]) * t, T[0][1] + (T[1][1] - T[0][1]) * t], b = [T[3][0] + (T[2][0] - T[3][0]) * t, T[3][1] + (T[2][1] - T[3][1]) * t]; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); } g.restore();
  for (const c of [-.42, .42]) { const q = P(.1, c); bandera(g, q[0], q[1], 22, ['#F7F4EC'], 10); }
}


// Segunda tanda de huellas con detalle: represa, obra grande, fábrica automatizada, planta eléctrica, imprenta,
// asentamiento, olla comunitaria y mural.
function poste2(g, x, y, h, cruceta = true) { g.strokeStyle = '#5A4632'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - h); g.stroke(); if (cruceta) { g.lineWidth = .7; g.beginPath(); g.moveTo(x - 3, y - h + 1.4); g.lineTo(x + 3, y - h + 1.4); g.stroke(); g.fillStyle = '#E8E4DA'; for (const d of [-2.4, 0, 2.4]) { g.beginPath(); g.arc(x + d, y - h + .8, .45, 0, 7); g.fill(); } } }
function cables(g, a, b, comba = 3) { g.save(); g.strokeStyle = 'rgba(40,40,40,.65)'; g.lineWidth = .3; for (const d of [-2.4, 0, 2.4]) { g.beginPath(); g.moveTo(a[0] + d, a[1]); g.quadraticCurveTo((a[0] + b[0]) / 2 + d, (a[1] + b[1]) / 2 + comba, b[0] + d, b[1]); g.stroke(); } g.restore(); }
function represa(g, e) {
  // El embalse detrás, el muro de concreto en curva, el vertedero con agua blanca y la casa de máquinas.
  const emb = [P(-.5, -.75), P(-.5, .55), P(-.12, .7), P(-.08, -.7)];
  rellena(g, emb, grad(g, 0, emb[0][1], 0, emb[2][1], [[0, '#4F86A0'], [1, '#7FB0C2']]), 'rgba(40,60,70,.35)', .4);
  g.save(); g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = .4; for (const [r, c] of [[-.4, -.4], [-.3, .1], [-.22, -.2]]) { g.beginPath(); g.moveTo(...P(r, c)); g.lineTo(...P(r, c + .14)); g.stroke(); } g.restore();
  const n = 10, top = [], bot = [];
  for (let k = 0; k <= n; k++) { const t = k / n, c = -.72 + t * 1.42, r = -.06 + Math.sin(t * Math.PI) * .1; top.push(P(r, c, 16)); bot.push(P(r + .06, c, 0)); }
  rellena(g, [...top, ...bot.slice().reverse()], grad(g, 0, top[5][1], 0, bot[5][1], [[0, '#D9D6CC'], [1, '#A9A69C']]), K.contorno, .5);
  g.save(); g.strokeStyle = 'rgba(90,90,85,.35)'; g.lineWidth = .35; for (let k = 1; k < n; k++) { g.beginPath(); g.moveTo(...top[k]); g.lineTo(...bot[k]); g.stroke(); } g.restore();
  rellena(g, top.map(([x, y]) => [x, y]).concat(top.slice().reverse().map(([x, y]) => [x + 1.6, y - .9])), '#ECE9E0', null); // corona
  // Vertedero: cortina de agua que cae y espuma al pie.
  const v0 = top[4], v1 = top[6], b0 = bot[4], b1 = bot[6];
  rellena(g, [v0, v1, b1, b0], grad(g, 0, v0[1], 0, b0[1], [[0, 'rgba(170,210,225,.95)'], [1, 'rgba(240,250,252,.95)']]), null);
  g.save(); g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = .4; for (let k = 0; k < 6; k++) { const t = (k + .5) / 6, x0 = v0[0] + (v1[0] - v0[0]) * t, y0 = v0[1] + (v1[1] - v0[1]) * t, y1 = b0[1] + (b1[1] - b0[1]) * t; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0 + .4, y1); g.stroke(); } g.restore();
  for (let k = 0; k < 7; k++) { const q = [b0[0] + (b1[0] - b0[0]) * (k / 6), b0[1] + (b1[1] - b0[1]) * (k / 6) + 1.4]; g.fillStyle = 'rgba(255,255,255,.85)'; g.beginPath(); g.ellipse(q[0], q[1], 2, 1, 0, 0, 7); g.fill(); }
  const M = caras(.2, .16, 8, .26, .44); sombraCasa(g, M); muros(g, M, '#E4DED2', '#6E7A84'); fila(g, M, 'izq', 2, 3, .2, 3, { carp: '#5E6670', vent: { vidrio: '#7FA6BC', postigos: false } }); terraza(g, M, '#E4DED2');
  const t0 = P(.3, -.5); torreta(g, t0[0], t0[1], 20);
}
function torreta(g, x, y, h) { g.strokeStyle = '#7A7E84'; g.lineWidth = .6; g.beginPath(); g.moveTo(x - 3, y); g.lineTo(x - .8, y - h); g.lineTo(x + .8, y - h); g.lineTo(x + 3, y); g.stroke(); for (let z = 3; z < h; z += 3.2) { const w = 3 - 2.2 * z / h, w2 = 3 - 2.2 * (z + 3.2) / h; g.beginPath(); g.moveTo(x - w, y - z); g.lineTo(x + w2, y - z - 3.2); g.moveTo(x + w, y - z); g.lineTo(x - w2, y - z - 3.2); g.stroke(); } g.beginPath(); g.moveTo(x - 4, y - h + 2); g.lineTo(x + 4, y - h + 2); g.stroke(); }
function megaobra(g, e) {
  // Obra grande en construcción: hueco excavado, estructura de concreto con columnas y placas, grúa torre y polisombra.
  rellena(g, [P(-.42, -.42), P(-.42, .42), P(.42, .42), P(.42, -.42)], '#B59A72', null);
  rellena(g, [P(-.3, -.3, -2), P(-.3, .3, -2), P(.3, .3, -2), P(.3, -.3, -2)], '#8E7452', 'rgba(70,50,30,.4)', .4);
  for (let p = 0; p < 4; p++) {
    const z = p * 8, F = caras(.5, .4, .9, -.04, 0, z + 7);
    for (const [r, c] of [[F.f, F.a], [F.f, F.b], [F.t, F.b], [F.f, (F.a + F.b) / 2], [(F.f + F.t) / 2, F.b]]) { if (p === 3 && c === F.b && r === F.t) continue; const a = P(r, c, z), b = P(r, c, z + 7); g.strokeStyle = '#B8B4AA'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); }
    if (p < 3) { muros(g, F, '#CFCBC2', null); rellena(g, [P(F.f, F.a, z + 7.9), P(F.f, F.b, z + 7.9), P(F.t, F.b, z + 7.9), P(F.t, F.a, z + 7.9)], '#DAD6CE'); }
  }
  for (const [r, c] of [[.2, -.24], [.2, .24]]) { const a = P(r, c, 32), b = P(r, c, 37); g.strokeStyle = '#6E737A'; g.lineWidth = .7; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); } // hierros de espera
  const gr0 = P(-.36, .44); torreta(g, gr0[0], gr0[1], 52); g.strokeStyle = '#E2B13C'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(gr0[0] - 28, gr0[1] - 50); g.lineTo(gr0[0] + 8, gr0[1] - 50); g.stroke(); g.strokeStyle = '#4A4A4A'; g.lineWidth = .3; g.beginPath(); g.moveTo(gr0[0] - 20, gr0[1] - 50); g.lineTo(gr0[0] - 20, gr0[1] - 34); g.stroke(); g.fillStyle = '#7A7E84'; g.fillRect(gr0[0] - 21.5, gr0[1] - 34, 3, 2.4); g.fillStyle = '#5E6670'; g.fillRect(gr0[0] + 5, gr0[1] - 52.5, 4, 3); // grúa con su contrapeso
  const pz = P(.36, -.3); for (let k = 0; k < 3; k++) { g.fillStyle = ['#A8A498', '#C9B48A', '#B5654A'][k]; g.beginPath(); g.ellipse(pz[0] + k * 5, pz[1] + k * 1.5, 3.4, 1.8, 0, 0, 7); g.fill(); } // montones de material
  const cer = [P(.46, -.46), P(.46, .46)]; rellena(g, [cer[0], cer[1], [cer[1][0], cer[1][1] - 4], [cer[0][0], cer[0][1] - 4]], 'rgba(46,90,60,.85)', 'rgba(0,0,0,.3)', .3); // polisombra
}
function automatizacion(g, e) {
  const F = caras(.72, .5, 12, -.04);
  sombraCasa(g, F); muros(g, F, '#C9CED2', '#5E6670');
  for (const cara of ['izq', 'der']) rellena(g, [F.en(cara, .05, 4), F.en(cara, .95, 4), F.en(cara, .95, 9), F.en(cara, .05, 9)], cara === 'izq' ? '#86AEC4' : '#6E94AA', K.contorno, .3);
  hueco(g, F, 'izq', .62, .86, 0, 7.5, '#4A4E54');
  g.save(); g.strokeStyle = 'rgba(70,74,80,.6)'; g.lineWidth = .35; for (let z = .8; z < 7.5; z += .9) { const a = F.en('izq', .62, z), b = F.en('izq', .86, z); g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); } g.restore(); // persiana del muelle
  // Techo en diente de sierra con lucernarios y paneles solares.
  const H = F.H; for (let k = 0; k < 4; k++) { const c0 = F.a + (F.b - F.a) * k / 4, c1 = F.a + (F.b - F.a) * (k + 1) / 4;
    rellena(g, [P(F.f, c0, H), P(F.t, c0, H), P(F.t, c0, H + 6), P(F.f, c0, H + 6)], '#9FC0D0', K.contorno, .3);
    rellena(g, [P(F.f, c0, H + 6), P(F.t, c0, H + 6), P(F.t, c1, H), P(F.f, c1, H)], k % 2 ? '#8E969C' : '#9AA2A8', K.contorno, .3); }
  for (let k = 0; k < 3; k++) { const c = F.a + .06 + k * .2, A = [P(F.t + .1, c, H + 3), P(F.t + .1, c + .14, H + 1.6), P(F.t + .22, c + .14, H + 1.6), P(F.t + .22, c, H + 3)]; rellena(g, A, '#2E4A6E', 'rgba(200,210,220,.6)', .3); }
  const s = P(F.f + .14, F.a + .2); g.fillStyle = '#5E6670'; g.fillRect(s[0] - 9, s[1] - 2.6, 18, 1.6); g.fillStyle = '#C9A24A'; for (let k = 0; k < 3; k++) g.fillRect(s[0] - 7 + k * 5, s[1] - 5.2, 3.4, 2.6); // banda con cajas
  const cam = P(F.f + .26, F.b - .1); carro(g, cam[0], cam[1], '#E8ECE4', '#2F5D8A');
}
function electricidad(g, e) {
  const F = caras(.42, .32, 13, -.06, -.12);
  sombraCasa(g, F); muros(g, F, e >= 3 ? '#D8D4CA' : K.ladrillo, '#5A3A2A', { ladrillo: e < 3 }); fila(g, F, 'izq', 3, 4, .09, 6, { carp: '#2E2A28', vent: { marco: '#F4EEE2' } }); techoDe(g, F, 6, epoca(Math.max(1, e), { techo: 'zinc', techo2: 'zinc' }));
  if (e < 3) { const c = F.en('der', .7, F.H + 2); g.fillStyle = '#9E5A44'; g.fillRect(c[0] - 2, c[1] - 20, 4, 20); g.fillStyle = '#5A3A2C'; g.fillRect(c[0] - 2.4, c[1] - 21, 4.8, 1.6); }
  letreroAncho(g, F, .15, .85, F.H - 1, '#2F5D8A', 'PLANTA ELÉCTRICA');
  // Patio de transformadores con aisladores y la línea que sale.
  const T = caras(.3, .2, .6, .26, .26); rellena(g, [P(T.f, T.a), P(T.f, T.b), P(T.t, T.b), P(T.t, T.a)], '#A9A398', null);
  for (const [r, c] of [[.22, .16], [.22, .3], [.32, .23]]) { const q = P(r, c); cilindro(g, q[0], q[1], 1.8, 5, '#6E767E', '#5E666E'); for (const d of [-1, 1]) { g.fillStyle = '#B9442F'; g.fillRect(q[0] + d - .3, q[1] - 7.4, .6, 2.2); } }
  const p1 = P(.42, .46), p2 = P(.1, .48); poste2(g, p1[0], p1[1], 16); cables(g, [p1[0], p1[1] - 15.2], [p1[0] + 18, p1[1] - 22], 2);
  alambre(g, [P(.44, .1), P(.44, .44)], [2, 4]);
}
function imprenta(g, e) {
  const E = epoca(e, { muro: '#F1E9D6', zocalo: '#2E2A28', carp: '#2E2A28', techo: 'tejaVieja' });
  const F = caras(.46, .32, 11, -.06);
  sombraCasa(g, F); murosDe(g, F, E);
  puerta(g, F, 'izq', .3, .18, 8.4, E.carp, e < 2); ventana(g, F, 'izq', .72, 4, .16, 5, E.carp, E.vent); ventana(g, F, 'der', .5, 4, .18, 5, E.carp, E.vent);
  techoDe(g, F, 7, E);
  letreroAncho(g, F, .12, .88, F.H - 1.2, '#7A1E1E', e >= 2 ? 'EL PREGONERO' : 'IMPRENTA');
  // Pliegos que se secan colgados de una cuerda y paquetes de periódicos al frente.
  const a = P(F.f + .16, F.a - .04, 8), b = P(F.f + .16, F.b, 8); g.strokeStyle = 'rgba(60,40,30,.6)'; g.lineWidth = .3; g.beginPath(); g.moveTo(...a); g.quadraticCurveTo((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 2, ...b); g.stroke();
  for (let k = 1; k < 6; k++) { const t = k / 6, x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t + Math.sin(t * Math.PI) * 1.6; g.fillStyle = '#F7F2E6'; g.fillRect(x - 1.4, y, 2.8, 3.6); g.fillStyle = 'rgba(40,30,25,.55)'; for (let j = 0; j < 3; j++) g.fillRect(x - 1, y + .7 + j * .9, 2, .3); }
  for (let k = 0; k < 3; k++) { const q = P(F.f + .24, F.b - .1 - k * .05, k === 2 ? 2 : 0); g.fillStyle = '#EDE6D4'; g.fillRect(q[0] - 2.6, q[1] - 2, 5.2, 2); g.strokeStyle = '#8A6A40'; g.lineWidth = .3; g.strokeRect(q[0] - 2.6, q[1] - 2, 5.2, 2); g.beginPath(); g.moveTo(q[0], q[1] - 2); g.lineTo(q[0], q[1]); g.stroke(); }
  const pz = P(F.f + .3, F.a + .2); personaM(g, pz[0], pz[1], '#E8DCC4', null, '#C98E62', false, '#5A4A3C');
}
function rancho(g, r, c, w, d, h, muro, techo, R) {
  const F = caras(w, d, h, r, c); sombraCasa(g, F); muros(g, F, muro, null);
  g.save(); g.strokeStyle = 'rgba(60,40,25,.45)'; g.lineWidth = .3; for (const cara of ['izq', 'der']) for (let u = .2; u < 1; u += .2) { const a = F.en(cara, u, 0), b = F.en(cara, u, h); g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); } g.restore(); // tablas
  hueco(g, F, 'izq', .35, .62, 0, h * .78, '#2A2018');
  const H = h, o = .04; rellena(g, [P(F.f + o, F.a - o, H + 1.2), P(F.f + o, F.b + o, H + .4), P(F.t - o, F.b + o, H + 2.6), P(F.t - o, F.a - o, H + 3.4)], techo, K.contorno, .4); // techo de zinc a una agua
  g.save(); g.strokeStyle = 'rgba(40,40,40,.3)'; g.lineWidth = .3; for (let k = 1; k < 6; k++) { const t = k / 6; g.beginPath(); g.moveTo(...P(F.f + o, F.a + (F.b - F.a) * t, H + 1.2 - .8 * t)); g.lineTo(...P(F.t - o, F.a + (F.b - F.a) * t, H + 3.4 - .8 * t)); g.stroke(); } g.restore();
  g.fillStyle = 'rgba(120,120,120,.8)'; const p = P(F.t, F.a + .03, H + 3.4); g.beginPath(); g.arc(p[0] + 2, p[1] + 1, .7, 0, 7); g.fill(); // piedra sobre el zinc
}
function asentamiento(g, e) {
  rancho(g, -.18, -.2, .26, .22, 7, '#8C6A48', '#9AA4A8');
  rancho(g, -.16, .2, .22, .2, 6.4, '#C9B48A', '#9C6A48');
  rancho(g, .2, -.02, .24, .2, 6.8, '#7A8C9A', '#A8443A');
  const a = P(.18, .28, 5), b = P(.36, .44, 4.6); g.strokeStyle = 'rgba(60,40,30,.6)'; g.lineWidth = .3; g.beginPath(); g.moveTo(...a); g.quadraticCurveTo((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 2, ...b); g.stroke();
  for (let k = 1; k < 5; k++) { const t = k / 5, x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t + Math.sin(t * Math.PI) * 1.6; g.fillStyle = ['#B23A2E', '#2F6E8E', '#E7C76B', '#F4F1E6'][k % 4]; g.fillRect(x - 1, y, 2, 2.8); }
  const t = P(.4, -.32); cilindro(g, t[0], t[1], 2.6, 4.2, '#2E4A6E', '#3A5A7E'); // tanque plástico
  const pz = P(.34, .06); g.save(); g.translate(pz[0], pz[1]); g.scale(.75, .75); personaM(g, 0, 0, '#D0604A', null, '#A8704A'); g.restore();
}
function olla(g, e) {
  sombraSuelo(g, 2, 3, 20, 6);
  // Toldo, la olla grande sobre tres piedras con leña, la gente con sus platos y una mesa con canastos.
  for (const [r, c] of [[-.26, -.28], [-.26, .28], [.2, .28], [.2, -.28]]) { const a = P(r, c), b = P(r, c, 13); g.strokeStyle = K.maderaOsc; g.lineWidth = .8; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); }
  const T = [P(-.26, -.28, 13), P(-.26, .28, 13), P(.2, .28, 12), P(.2, -.28, 12)]; rellena(g, T, 'rgba(46,111,142,.85)', 'rgba(0,0,0,.3)', .3);
  const f = P(0, 0); for (let k = 0; k < 3; k++) { g.fillStyle = '#8A8478'; g.beginPath(); g.ellipse(f[0] + Math.cos(k * 2.1) * 4, f[1] + Math.sin(k * 2.1) * 2, 1.6, 1.1, 0, 0, 7); g.fill(); }
  const gr = g.createRadialGradient(f[0], f[1], 0, f[0], f[1], 4); gr.addColorStop(0, 'rgba(255,170,70,.95)'); gr.addColorStop(1, 'rgba(255,120,40,0)'); g.fillStyle = gr; g.fillRect(f[0] - 4, f[1] - 3, 8, 6);
  cilindro(g, f[0], f[1] - 1.6, 5, 5, '#3A3634', '#C9A24A');
  g.save(); g.globalAlpha = .45; g.fillStyle = '#E8E4DC'; for (let k = 0; k < 3; k++) { g.beginPath(); g.ellipse(f[0] - 1 + k * 1.5, f[1] - 10 - k * 2.4, 2 + k, 1.4 + k * .4, 0, 0, 7); g.fill(); } g.restore(); // vapor
  const cu = P(-.02, .06, 8); g.strokeStyle = K.madera; g.lineWidth = .6; g.beginPath(); g.moveTo(cu[0], cu[1]); g.lineTo(cu[0] + 5, cu[1] - 6); g.stroke(); // cucharón
  for (const [r, c, col, s] of [[.26, -.14, '#B23A2E', '#F4EFE2'], [.3, .12, '#2F6E8E', null], [-.06, .34, '#C08A2A', '#F4EFE2'], [.18, .36, '#3E6B4A', null]]) { const q = P(r, c); personaM(g, q[0], q[1], col, s, '#A8704A'); g.fillStyle = '#F4F1E6'; g.beginPath(); g.ellipse(q[0] + 2.4, q[1] - 5.4, 1.4, .6, 0, 0, 7); g.fill(); }
}
function mural(g, e) {
  const F = caras(.66, .1, 12, -.1);
  sombraCasa(g, F); muros(g, F, '#F2EDE2', '#8A6A48');
  // El mural: cielo, montañas, el río, un sol y figuras de la gente del pueblo.
  const q = (u, z) => F.en('izq', u, z), zona = [q(.04, 2), q(.96, 2), q(.96, 11), q(.04, 11)];
  g.save(); poli(g, zona); g.clip();
  rellena(g, zona, grad(g, 0, zona[3][1], 0, zona[0][1], [[0, '#7FB6D0'], [1, '#F2D9A0']]), null);
  rellena(g, [q(.04, 5), q(.22, 9.4), q(.4, 6), q(.58, 10), q(.78, 6.4), q(.96, 8.6), q(.96, 2), q(.04, 2)], '#5E8B42', null);
  rellena(g, [q(.04, 3.4), q(.5, 4.4), q(.96, 3), q(.96, 2), q(.04, 2)], '#4F86A6', null);
  const sol = q(.8, 9.4); g.fillStyle = '#E7B23C'; g.beginPath(); g.arc(sol[0], sol[1], 1.8, 0, 7); g.fill();
  for (let k = 0; k < 5; k++) { const p = q(.12 + k * .17, 3.2); g.fillStyle = ['#B23A2E', '#F4F1E6', '#2F5D8A', '#E0A030', '#6A4A86'][k]; g.fillRect(p[0] - .8, p[1] - 4, 1.6, 3); g.fillStyle = '#A8704A'; g.beginPath(); g.arc(p[0], p[1] - 4.8, .8, 0, 7); g.fill(); }
  g.restore();
  rellena(g, [q(0, 12), q(1, 12), [q(1, 12)[0] + 1.6, q(1, 12)[1] - .9], [q(0, 12)[0] + 1.6, q(0, 12)[1] - .9]], '#C9C0AE', null);
  // La escalera y quien pinta, con sus tarros.
  const es = P(.06, .2); g.strokeStyle = K.madera; g.lineWidth = .6; g.beginPath(); g.moveTo(es[0] - 1.6, es[1]); g.lineTo(es[0] - .6, es[1] - 11); g.moveTo(es[0] + 1.6, es[1]); g.lineTo(es[0] + .6, es[1] - 11); g.stroke(); for (let k = 1; k < 6; k++) { g.beginPath(); g.moveTo(es[0] - 1.6 + k * .2, es[1] - k * 1.9); g.lineTo(es[0] + 1.6 - k * .2, es[1] - k * 1.9); g.stroke(); }
  const pz = P(.1, -.1); personaM(g, pz[0], pz[1], '#E8DCC4', null, '#C98E62', false, '#B23A2E');
  for (const [dx, col] of [[3, '#C0392B'], [5, '#2F5D8A'], [7, '#E7B23C']]) cilindro(g, pz[0] + dx, pz[1] + 1, .9, 1.6, '#9AA0A4', col);
}


// Muro de las fotos (memoria, tanda 3): mientras trabaja la Comisión de la Verdad, en la plaza un tablero de madera
// con las fotos de los desaparecidos, una cinta con «¿DÓNDE ESTÁN?», velas y flores al pie.
function muroFotos(g) {
  sombraSuelo(g, 3, 2, 18, 4);
  const F = caras(.62, .06, 13, 0, 0, 0);
  for (const c of [F.a + .03, F.b - .03]) { const a = P(F.f, c), b = P(F.f, c, 15); g.strokeStyle = K.maderaOsc; g.lineWidth = 1.2; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); }
  rellena(g, [F.en('izq', 0, 2), F.en('izq', 1, 2), F.en('izq', 1, 13), F.en('izq', 0, 13)], '#8A6A48', K.contorno, .4);
  rellena(g, [F.en('izq', .02, 2.6), F.en('izq', .98, 2.6), F.en('izq', .98, 12.4), F.en('izq', .02, 12.4)], '#A8865E', null);
  for (let fila = 0; fila < 3; fila++) for (let k = 0; k < 7; k++) {
    const u = .07 + k * .13 + (fila % 2) * .03, z = 3.4 + fila * 2.9, q = [F.en('izq', u, z), F.en('izq', u + .085, z), F.en('izq', u + .085, z + 2.4), F.en('izq', u, z + 2.4)];
    rellena(g, q, '#F2EDE0', 'rgba(60,45,30,.4)', .2);
    const c = F.en('izq', u + .042, z + 1.5); g.fillStyle = ['#6E6252', '#7E705E', '#5E5446'][(k + fila) % 3]; g.beginPath(); g.ellipse(c[0], c[1], .7, .8, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(c[0], c[1] + 1.1, 1.1, .5, 0, 0, 7); g.fill();
  }
  rellena(g, [F.en('izq', .1, 13.4), F.en('izq', .9, 13.4), F.en('izq', .9, 15.6), F.en('izq', .1, 15.6)], '#F4F1E6', 'rgba(60,45,30,.35)', .25);
  { const a = F.en('izq', .1, 14.5), b = F.en('izq', .9, 14.5); g.save(); g.translate((a[0] + b[0]) / 2, (a[1] + b[1]) / 2); g.transform(1, (b[1] - a[1]) / (b[0] - a[0]), 0, 1, 0, 0); g.fillStyle = '#8E2F22'; g.font = 'bold 1.9px serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('¿DÓNDE ESTÁN?', 0, 0); g.restore(); }
  for (let k = 0; k < 5; k++) { const q = P(F.f + .08, F.a + .08 + k * .12); vela(g, q[0], q[1], 2 + (k % 2)); }
  const fl = P(F.f + .1, F.b - .1); flores(g, fl[0], fl[1], ['#F4F1E6', '#E7C76B', '#C0392B']);
}


// ---------- Seis épocas de la historia (fase visual, tanda A; pedido de Juan: «que cada edificio se vea como lo que
// es en cada época, lo más cercano posible»). h: 0 fundación, 1 café, 2 La Violencia, 3 modernización, 4 conflicto
// y paz, 5 era digital. Las tres primeras usan los dibujos de bahareque, tapia y ladrillo; la modernización y el
// conflicto tienen dibujo propio; la era digital usa el de concreto con lo nuevo (paneles solares, cámaras).
const ETERNIT = { tipo: 'lamina', teja: '#C9C7BF', luz: '#DEDCD4', osc: '#9C9A92', linea: '#86847C' }; // teja ondulada de asbesto-cemento
// Paneles solares inclinados sobre una azotea.
function solares(g, F, filas = 2) {
  const z = F.z0 + F.H + .6, c0 = F.a + .08, c1 = F.b - .08, n = Math.max(2, Math.round((c1 - c0) / .16));
  for (let k = 0; k < filas; k++) {
    const r = F.t + .1 + k * .14;
    for (let j = 0; j < n; j++) {
      const a = c0 + (c1 - c0) * j / n + .006, b = c0 + (c1 - c0) * (j + 1) / n - .006;
      const q = [P(r + .08, a, z), P(r + .08, b, z), P(r, b, z + 2.6), P(r, a, z + 2.6)];
      rellena(g, q, '#2C4A6E', 'rgba(30,40,55,.8)', .3);
      g.strokeStyle = 'rgba(140,180,215,.55)'; g.lineWidth = .25; g.beginPath(); const m1 = P(r + .04, a, z + 1.3), m2 = P(r + .04, b, z + 1.3); g.moveTo(...m1); g.lineTo(...m2); g.stroke();
      g.fillStyle = 'rgba(220,235,250,.35)'; const l = P(r + .02, a + .01, z + 2.2); g.fillRect(l[0], l[1], 1.6, .5);
    }
  }
}
// Tapia baja de concreto al frente con un mural de colores (escuelas y colegios de los años 80 y 90).
function tapiaMural(g, r, c0, c1, h = 4.5, puerta = .5) {
  const tramo = (a, b) => {
    const q = [P(r, a, 0), P(r, b, 0), P(r, b, h), P(r, a, h)]; rellena(g, q, '#ECE6D8', K.contorno, .4);
    rellena(g, [P(r, a, h), P(r, b, h), P(r - .03, b, h + .5), P(r - .03, a, h + .5)], '#D6CEBE', null);
    // mural: cielo, montaña, sol, una casa y gente de la mano
    const L = (u, z) => P(r, a + (b - a) * u, z);
    rellena(g, [L(0, .4), L(1, .4), L(1, h - .4), L(0, h - .4)], '#8EC3D6', null);
    rellena(g, [L(0, .4), L(.35, h - 1.2), L(.6, 1.8), L(.85, h - .9), L(1, 1.4), L(1, .4)], '#5E9A48', null);
    const sol = L(.75, h - 1.2); g.fillStyle = '#F2C531'; g.beginPath(); g.arc(sol[0], sol[1], .9, 0, 7); g.fill();
    for (let k = 0; k < 4; k++) { const p = L(.12 + k * .2, .5); g.fillStyle = ['#C0392B', '#2F5D8A', '#E7B23C', '#6A4A86'][k]; g.fillRect(p[0] - .4, p[1] - 2, .8, 1.6); g.fillStyle = '#8A5A3A'; g.beginPath(); g.arc(p[0], p[1] - 2.4, .45, 0, 7); g.fill(); }
  };
  const m = c0 + (c1 - c0) * puerta; tramo(c0, m - .07); tramo(m + .07, c1);
  g.strokeStyle = '#4A4E52'; g.lineWidth = .5; for (let k = 0; k <= 5; k++) { const c = m - .07 + .14 * k / 5, a = P(r, c, 0), b = P(r, c, h + 1); g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); } // reja de la entrada
}
// Rejas en una ventana (barras verticales y una horizontal).
function rejas(g, F, cara, u, z, ancho, alto) {
  g.strokeStyle = '#2E2A28'; g.lineWidth = .4;
  for (let k = 0; k <= 4; k++) { const a = F.en(cara, u - ancho / 2 + ancho * k / 4, z), b = F.en(cara, u - ancho / 2 + ancho * k / 4, z + alto); g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); }
  const a = F.en(cara, u - ancho / 2, z + alto / 2), b = F.en(cara, u + ancho / 2, z + alto / 2); g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke();
}
// Estructura de concreto a la vista (columnas y vigas) sobre muros de ladrillo: la construcción de los 70 a los 90.
function aporticado(g, F, pisos, cols = [0, .34, .67, 1]) {
  const gris = '#D9D4C8', gris2 = '#B9B3A6';
  for (const cara of ['izq', 'der']) {
    for (const u of cols) rellena(g, [F.en(cara, Math.max(0, u - .025), 0), F.en(cara, Math.min(1, u + .025), 0), F.en(cara, Math.min(1, u + .025), F.H), F.en(cara, Math.max(0, u - .025), F.H)], cara === 'izq' ? gris : gris2, null);
    for (let p = 1; p <= pisos; p++) { const z = F.H * p / pisos; rellena(g, [F.en(cara, 0, z - 1.4), F.en(cara, 1, z - 1.4), F.en(cara, 1, z), F.en(cara, 0, z)], cara === 'izq' ? gris : gris2, null); }
  }
}
// Cámara de seguridad en un poste o en una esquina.
function camara(g, x, y) { g.fillStyle = '#2E3238'; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 2.4, y + 1); g.lineTo(x + 2.4, y + 2.2); g.lineTo(x, y + 1.4); g.closePath(); g.fill(); g.fillStyle = '#C0392B'; g.fillRect(x + .3, y + .6, .5, .5); }
// Trinchera de sacos de arena con su malla anticilindros detrás (estaciones de policía en el conflicto).
function trinchera(g, r, c0, c1, malla = true) {
  const n = Math.round((c1 - c0) / .07);
  for (let fila = 0; fila < 3; fila++) for (let k = 0; k < n - fila; k++) { const q = P(r, c0 + (k + fila * .5 + .5) * (c1 - c0) / n, fila * 1.6); costal(g, q[0], q[1], k % 2 ? '#B8A27A' : '#A8926A', .46, 2.2, 1.2); }
  if (malla) { g.strokeStyle = 'rgba(80,86,90,.75)'; g.lineWidth = .3; const a = (c, z) => P(r - .14, c, z); for (let k = 0; k <= 12; k++) { const c = c0 + (c1 - c0) * k / 12; g.beginPath(); g.moveTo(...a(c, 0)); g.lineTo(...a(c, 20)); g.stroke(); } for (let z = 0; z <= 20; z += 2.5) { g.beginPath(); g.moveTo(...a(c0, z)); g.lineTo(...a(c1, z)); g.stroke(); } for (const c of [c0, c1]) { g.strokeStyle = '#4A4E52'; g.lineWidth = .8; g.beginPath(); g.moveTo(...a(c, 0)); g.lineTo(...a(c, 21)); g.stroke(); g.strokeStyle = 'rgba(80,86,90,.75)'; g.lineWidth = .3; } }
}

// Escuela de la modernización (años 60 y 70, Alianza para el Progreso): bloque largo de un piso, muros blancos con
// franja de color, ventanales de marco metálico en fila, corredor con columnas de concreto y teja de asbesto.
function escuelaBloque(g) {
  const F = caras(.94, .42, 12, -.06);
  sombraCasa(g, F); cancha(g, F.f + .12, F.a + .12);
  arbolito(g, ...P(F.t + .05, F.a - .06), 1, '#4E7A3A');
  muros(g, F, '#F4F1E8', '#2F6E8E'); aleroYdesgaste(g, F);
  for (const cara of ['izq', 'der']) rellena(g, [F.en(cara, 0, 0), F.en(cara, 1, 0), F.en(cara, 1, 4.2), F.en(cara, 0, 4.2)], cara === 'izq' ? '#3E7FA0' : '#2E6480', null);
  for (let k = 0; k < 5; k++) { const u = .1 + k * .2; if (k === 2) { puerta(g, F, 'izq', u, .1, 8.5, '#2F6E8E', false); continue; } vidrio(g, F, 'izq', u - .075, u + .075, 4.6, 9.6); g.strokeStyle = '#E8ECEE'; g.lineWidth = .35; for (let j = 1; j < 4; j++) { const a = F.en('izq', u - .075 + .15 * j / 4, 4.6), b = F.en('izq', u - .075 + .15 * j / 4, 9.6); g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); } }
  vidrio(g, F, 'der', .3, .7, 4.6, 9.6);
  const zf = dosAguas(g, F, 5, { ...ETERNIT, sale: .16, hastial: '#E6E2D8' });
  g.strokeStyle = '#D9D4C8'; g.lineWidth = 1.1; for (const u of [.02, .26, .5, .74, .98]) { const c = F.a + (F.b - F.a) * u, a = P(F.f + .16, c, 0), b = P(F.f + .16, c, zf); g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); }
  letrero(g, F, .5, 10.6, '#2F6E8E', 'ESCUELA');
  const b = P(F.f + .3, F.a + .04); bandera(g, b[0], b[1], 22, TRICOLOR);
}
// Colegio del conflicto y la paz (años 80 a 2000): dos pisos de ladrillo con columnas y vigas de concreto, ventanas
// con rejas, tapia con mural y reja de entrada, teja de zinc.
function colegioLadrillo(g) {
  const F = caras(.9, .44, 22, -.08);
  sombraCasa(g, F); cancha(g, F.f + .2, F.a + .5);
  muros(g, F, K.ladrillo, null, { ladrillo: true }); aleroYdesgaste(g, F); aporticado(g, F, 2);
  for (const z of [3, 14]) for (const u of [.17, .5, .83]) { vidrio(g, F, 'izq', u - .1, u + .1, z, z + 5.5); rejas(g, F, 'izq', u, z, .2, 5.5); }
  vidrio(g, F, 'der', .3, .7, 3, 8.5); rejas(g, F, 'der', .5, 3, .4, 5.5); vidrio(g, F, 'der', .3, .7, 14, 19.5);
  dosAguas(g, F, 6, { ...MAT.zinc, hastial: '#C9C3B6' });
  letrero(g, F, .5, 11.2, '#3E6B4A', 'COLEGIO');
  tapiaMural(g, F.f + .3, F.a - .02, F.b + .02, 4.5, .62);
  const b = P(F.f + .26, F.a - .04); bandera(g, b[0], b[1], 26, TRICOLOR);
}

// Centro de salud de la modernización (años 60 y 70): bloque blanco de un piso con franja azul, marquesina de
// concreto sobre la entrada, cruz roja y una ambulancia de la época.
function centroSalud(g) {
  const F = caras(.9, .5, 13, -.06);
  sombraCasa(g, F); jardin(g, F);
  muros(g, F, '#F7F5EF', '#2F5D8A'); aleroYdesgaste(g, F);
  for (const cara of ['izq', 'der']) rellena(g, [F.en(cara, 0, 9.4), F.en(cara, 1, 9.4), F.en(cara, 1, 10.6), F.en(cara, 0, 10.6)], cara === 'izq' ? '#2F6E9E' : '#245A82', null);
  for (const u of [.12, .28, .72, .88]) vidrio(g, F, 'izq', u - .065, u + .065, 3.6, 8.4);
  for (const u of [.25, .5, .75]) vidrio(g, F, 'der', u - .08, u + .08, 3.6, 8.4);
  hueco(g, F, 'izq', .42, .58, 0, 8, '#4E7FA0');
  terraza(g, F, '#F2F0EA');
  // marquesina sobre la entrada
  const a = F.a + (F.b - F.a) * .36, b = F.a + (F.b - F.a) * .64, z = 9;
  rellena(g, [P(F.f, a, z), P(F.f, b, z), P(F.f + .16, b, z), P(F.f + .16, a, z)], '#E4E0D6'); rellena(g, [P(F.f + .16, a, z), P(F.f + .16, b, z), P(F.f + .16, b, z - 1), P(F.f + .16, a, z - 1)], '#C9C4B8');
  g.strokeStyle = '#D9D4C8'; g.lineWidth = 1; for (const c of [a + .02, b - .02]) { g.beginPath(); g.moveTo(...P(F.f + .14, c, 0)); g.lineTo(...P(F.f + .14, c, z - 1)); g.stroke(); }
  const c = F.en('izq', .5, 11.5); rellena(g, [[c[0] - 3, c[1] - 3], [c[0] + 3, c[1] - 3], [c[0] + 3, c[1] + 3], [c[0] - 3, c[1] + 3]], '#F4F1E8', K.contorno, .3); g.fillStyle = '#C0392B'; g.fillRect(c[0] - .8, c[1] - 2.4, 1.6, 4.8); g.fillRect(c[0] - 2.4, c[1] - .8, 4.8, 1.6);
  const p = P(F.f + .3, F.b - .1); carro(g, p[0], p[1], '#F4F1E8', '#C0392B');
}

// Casa de la cultura de los años 60 y 70: volumen de concreto con quiebrasoles verticales y un libro en relieve.
function casaCultura(g) {
  const F = caras(.66, .56, 20, -.04);
  sombraCasa(g, F); arbolito(g, ...P(F.f + .16, F.b + .04), .85, '#5E8B42'); bancoMadera(g, ...P(F.f + .2, F.a + .2));
  muros(g, F, '#E8E2D4', '#7A6A58'); aleroYdesgaste(g, F);
  for (const cara of ['izq', 'der']) { vidrio(g, F, cara, .04, .96, 4, 17); for (let k = 0; k <= 10; k++) { const u = .04 + .92 * k / 10; rellena(g, [F.en(cara, u - .012, 4), F.en(cara, u + .012, 4), F.en(cara, u + .012, 17), F.en(cara, u - .012, 17)], cara === 'izq' ? '#F2EEE4' : '#CFC9BC', null); } }
  hueco(g, F, 'izq', .4, .6, 0, 7, '#3A3A3A');
  terraza(g, F, '#E8E2D4');
  const l = F.en('izq', .5, 18.6); g.fillStyle = '#B9442F'; g.fillRect(l[0] - 6, l[1] - 1.4, 12, 2.6); g.save(); g.fillStyle = '#F7F1E3'; g.font = 'bold 2px sans-serif'; g.textAlign = 'center'; g.fillText('CASA DE LA CULTURA', l[0], l[1] + .6); g.restore();
}
// Biblioteca pública de los años 80 y 90: ladrillo y concreto, dos pisos con ventanales y un mural de lectura.
function bibliotecaPublica(g) {
  const F = caras(.66, .56, 22, -.04);
  sombraCasa(g, F); arbolito(g, ...P(F.f + .16, F.b + .04), .85, '#5E8B42');
  muros(g, F, K.ladrillo, null, { ladrillo: true }); aleroYdesgaste(g, F); aporticado(g, F, 2, [0, .5, 1]);
  for (const z of [3, 13.5]) { vidrio(g, F, 'izq', .06, .44, z, z + 6); if (z === 13.5) vidrio(g, F, 'izq', .56, .94, z, z + 6); vidrio(g, F, 'der', .1, .9, z, z + 6); }
  rellena(g, [F.en('izq', .56, 1), F.en('izq', .94, 1), F.en('izq', .94, 9.5), F.en('izq', .56, 9.5)], '#E7C76B', K.contorno, .3); // mural de un libro abierto
  const m = F.en('izq', .75, 5.2); g.fillStyle = '#F7F1E3'; g.beginPath(); g.moveTo(m[0] - 3.4, m[1] + 1); g.lineTo(m[0], m[1] + 2.2); g.lineTo(m[0] + 3.4, m[1] + 1); g.lineTo(m[0] + 3.4, m[1] - 2.6); g.lineTo(m[0], m[1] - 1.4); g.lineTo(m[0] - 3.4, m[1] - 2.6); g.closePath(); g.fill();
  hueco(g, F, 'izq', .2, .32, 0, 3, '#3A3A3A');
  dosAguas(g, F, 6, { ...MAT.zinc, hastial: '#C9C3B6' });
  letrero(g, F, .25, 11.4, '#2F5D8A', 'BIBLIOTECA');
}
// Universidad de la modernización (años 60 y 70): bloque de cinco pisos de ladrillo con franjas de ventanas, una
// plazoleta con escalinata y el bloque bajo de la biblioteca.
function universidadBloques(g, mural = false) {
  const B = caras(.42, .32, 14, .18, -.28); sombraCasa(g, B); muros(g, B, '#E8E2D4', null); vidrio(g, B, 'izq', .1, .9, 4, 10); vidrio(g, B, 'der', .1, .9, 4, 10); terraza(g, B, '#E8E2D4');
  const F = caras(.62, .5, 44, -.14, .16);
  sombraCasa(g, F); muros(g, F, K.ladrillo, null, { ladrillo: true }); aleroYdesgaste(g, F);
  for (let p = 0; p < 5; p++) for (const cara of ['izq', 'der']) vidrio(g, F, cara, .06, .94, 3 + p * 8.4, 8.2 + p * 8.4);
  for (let p = 0; p <= 5; p++) for (const cara of ['izq', 'der']) rellena(g, [F.en(cara, 0, p * 8.4), F.en(cara, 1, p * 8.4), F.en(cara, 1, p * 8.4 + 1.2), F.en(cara, 0, p * 8.4 + 1.2)], cara === 'izq' ? '#E2DCCE' : '#C2BCAE', null);
  terraza(g, F, '#E2DCCE');
  for (let k = 0; k < 3; k++) rellena(g, [P(.36 + k * .04, -.2, k * .8), P(.36 + k * .04, .2, k * .8), P(.36 + k * .04, .2, k * .8 + .8), P(.36 + k * .04, -.2, k * .8 + .8)], '#D8D2C4', K.contorno, .3); // escalinata
  if (mural) { // los años del conflicto: el muro pintado por los estudiantes y una pancarta colgada del bloque
    const L = (u, z) => F.en('izq', u, z);
    rellena(g, [L(.04, 1.2), L(.96, 1.2), L(.96, 15.6), L(.04, 15.6)], '#E8D49A', K.contorno, .3);
    rellena(g, [L(.04, 1.2), L(.4, 1.2), L(.28, 15.6), L(.04, 15.6)], '#B9442F', null);
    rellena(g, [L(.55, 1.2), L(.96, 1.2), L(.96, 9), L(.7, 15.6), L(.6, 15.6)], '#2F6E8E', null);
    const sol = L(.5, 9.5); g.fillStyle = '#F2C531'; g.beginPath(); g.arc(sol[0], sol[1], 3, 0, 7); g.fill(); // la cara de un sol, mural estudiantil
    const a = L(.15, 34), b = L(.85, 34); rellena(g, [a, b, [b[0], b[1] + 6], [a[0], a[1] + 6]], '#F4F1E8', K.contorno, .3);
    g.save(); g.fillStyle = '#B9442F'; g.font = 'bold 2.6px sans-serif'; g.textAlign = 'center'; g.fillText('EDUCACIÓN PÚBLICA', (a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 3.8); g.restore();
  }
  const bd = P(.4, .42); bandera(g, bd[0], bd[1], 22, TRICOLOR);
  const t = P(.4, -.42); bandera(g, t[0], t[1], 18, ['#F4F1E8', '#3E6B4A']); // la bandera de la universidad
}

// Estación de policía de la modernización: casa de bloque de dos pisos con franja verde y la patrulla.
function estacionBloque(g) {
  const F = caras(.62, .46, 18, -.08);
  sombraCasa(g, F); muros(g, F, '#EFF1EA', '#4E5A34'); aleroYdesgaste(g, F);
  for (const cara of ['izq', 'der']) rellena(g, [F.en(cara, 0, 8), F.en(cara, 1, 8), F.en(cara, 1, 9.6), F.en(cara, 0, 9.6)], '#4E5A34', null);
  puerta(g, F, 'izq', .4, .15, 7.6, '#4E5A34', false); for (const u of [.15, .75]) vidrio(g, F, 'izq', u - .07, u + .07, 3, 7); for (const u of [.15, .45, .75]) vidrio(g, F, 'izq', u - .07, u + .07, 11.4, 16); vidrio(g, F, 'der', .3, .7, 11.4, 16);
  terraza(g, F, '#EFF1EA'); letrero(g, F, .4, 10, '#2F5D8A', 'POLICÍA');
  const p = P(F.f + .26, F.a + .5); carro(g, p[0], p[1], '#E8ECE4', '#4E5A34');
}
// Estación de policía en los años del conflicto: el mismo edificio con trinchera de sacos, malla anticilindros,
// garita de concreto y ventanas tapiadas.
function estacionFortificada(g) {
  const F = caras(.62, .46, 18, -.12);
  sombraCasa(g, F); muros(g, F, '#E8EAE2', '#4E5A34'); aleroYdesgaste(g, F);
  for (const cara of ['izq', 'der']) rellena(g, [F.en(cara, 0, 8), F.en(cara, 1, 8), F.en(cara, 1, 9.6), F.en(cara, 0, 9.6)], '#4E5A34', null);
  for (const u of [.15, .75]) { hueco(g, F, 'izq', u - .07, u + .07, 3, 7, '#9A9488'); g.strokeStyle = 'rgba(60,55,45,.45)'; g.lineWidth = .3; for (let z = 4; z < 7; z += 1) { const a = F.en('izq', u - .07, z), b = F.en('izq', u + .07, z); g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); } } // ventanas tapiadas con bloque
  for (const u of [.15, .45, .75]) { hueco(g, F, 'izq', u - .07, u + .07, 11.4, 16, '#3A3A3A'); rejas(g, F, 'izq', u, 11.4, .14, 4.6); }
  puerta(g, F, 'izq', .45, .12, 7.6, '#3A3E36', false);
  terraza(g, F, '#E8EAE2'); letrero(g, F, .45, 10, '#2F5D8A', 'POLICÍA');
  g.save(); g.strokeStyle = '#3A3A3A'; g.lineWidth = .4; for (const [u, z] of [[.3, 5], [.62, 13], [.88, 6], [.22, 15]]) { const c = F.en('izq', u, z); g.beginPath(); g.arc(c[0], c[1], .5, 0, 7); g.stroke(); } g.restore(); // marcas de bala en la fachada
  trinchera(g, F.f + .3, F.a - .02, F.b + .02);
  const G = caras(.14, .14, 9, F.f + .22, F.b + .1); muros(g, G, '#B9B4A8', null); hueco(g, G, 'izq', .15, .85, 5, 7, '#2E2A28'); azotea(g, G, '#A8A398'); // garita de concreto
}
// CAI de la era digital: caseta de vidrio y concreto con cámaras, moto y patrulla eléctrica.
function caiDigital(g) {
  const F = caras(.5, .4, 13, -.06);
  sombraCasa(g, F); muros(g, F, '#EEF0EC', '#4E5A34'); aleroYdesgaste(g, F);
  for (const cara of ['izq', 'der']) vidrio(g, F, cara, .05, .95, 2, 10);
  rellena(g, [F.en('izq', 0, 10.5), F.en('izq', 1, 10.5), F.en('izq', 1, 12.4), F.en('izq', 0, 12.4)], '#3E8A4A', null);
  g.save(); g.fillStyle = '#F4F1E8'; g.font = 'bold 2.2px sans-serif'; g.textAlign = 'center'; const t = F.en('izq', .5, 11); g.fillText('CAI', t[0], t[1]); g.restore();
  terraza(g, F, '#E8EAE6'); solares(g, F, 1);
  const p0 = P(F.f + .02, F.a - .02, 12); camara(g, p0[0] - 2, p0[1]); const p1 = P(F.f + .02, F.b + .02, 12); camara(g, p1[0], p1[1]);
  const c = P(F.f + .3, F.a + .32); carro(g, c[0], c[1], '#F4F6F2', '#3E8A4A');
  const m = P(F.f + .24, F.b - .06); g.fillStyle = '#2E3238'; g.beginPath(); g.ellipse(m[0] - 2, m[1] - 1, 1.3, 1.3, 0, 0, 7); g.ellipse(m[0] + 2.4, m[1] + .4, 1.3, 1.3, 0, 0, 7); g.fill(); rellena(g, [[m[0] - 2, m[1] - 2], [m[0] + 2.4, m[1] - .6], [m[0] + 1.6, m[1] - 3.4], [m[0] - 1, m[1] - 4]], '#F4F6F2', K.contorno, .3); // moto
  const b = P(F.f + .2, F.a - .06); bandera(g, b[0], b[1], 20, TRICOLOR);
}

// Base militar de la modernización: barracas largas de teja de asbesto, torre de vigilancia, cerca y un camión.
function basaBarracas(g, helipuerto = false, radar = false) {
  const F = caras(.9, .56, 4, -.04, .02);
  for (const [r, c] of [[-.22, -.16], [.04, -.16]]) { const B = caras(.5, .18, 8, r, c); sombraCasa(g, B); muros(g, B, radar ? '#C8C6BC' : '#B9B48A', '#5A5A3A'); for (let k = 0; k < 4; k++) hueco(g, B, 'izq', .1 + k * .22, .2 + k * .22, 2.4, 5, '#3A3A3A'); dosAguas(g, B, 3.5, radar ? MAT.zinc : ETERNIT); }
  // cerca con alambre
  g.strokeStyle = '#5A5A5A'; g.lineWidth = .35; for (const [p, q] of [[[F.f, F.a], [F.f, F.b]], [[F.f, F.b], [F.t, F.b]]]) { for (let k = 0; k <= 14; k++) { const t = k / 14, r = p[0] + (q[0] - p[0]) * t, c = p[1] + (q[1] - p[1]) * t; poste(g, ...P(r, c), 6, '#6E6E6E'); } alambre(g, [P(...p), P(...q)], [2, 4, 5.6]); }
  const t = P(F.t + .14, F.b - .14); g.strokeStyle = '#6E6E6E'; g.lineWidth = .9; for (const dx of [-3, 3]) { g.beginPath(); g.moveTo(t[0] + dx, t[1]); g.lineTo(t[0] + dx * .5, t[1] - 26); g.stroke(); } rellena(g, [[t[0] - 4, t[1] - 26], [t[0] + 4, t[1] - 26], [t[0] + 4, t[1] - 31], [t[0] - 4, t[1] - 31]], '#8A8E92'); rellena(g, [[t[0] - 5, t[1] - 31], [t[0] + 5, t[1] - 31], [t[0], t[1] - 34]], '#5E6670');
  if (radar) { const a = P(F.t + .1, F.a + .2); g.strokeStyle = '#8A8E92'; g.lineWidth = 1; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(a[0], a[1] - 22); g.stroke(); g.fillStyle = '#E8ECEE'; g.beginPath(); g.ellipse(a[0], a[1] - 22, 4.4, 2, -.3, 0, 7); g.fill(); g.strokeStyle = K.contorno; g.lineWidth = .4; g.stroke(); antena(g, a[0] + 8, a[1] + 2, 20); }
  if (helipuerto) { trinchera(g, F.f - .04, F.a + .1, F.a + .4, false); }
  const c = P(F.f - .02, F.b - .16); carro(g, c[0], c[1], '#5E6A44', '#4E5A34');
  const b = P(F.f - .06, F.a + .06); bandera(g, b[0], b[1], 26, TRICOLOR);
}

// ---------- Tanda B: la economía en las seis épocas ----------
// Volqueta o camión de estacas (mismo trazo que carro, más alto y con carga).
function camion(g, x, y, cab = '#B9442F', carga = '#9E8A66', estacas = true) {
  g.save(); g.globalAlpha = .22; g.fillStyle = '#2A2A1E'; g.beginPath(); g.ellipse(x + 2, y + 1, 11, 3, 0, 0, 7); g.fill(); g.restore();
  rellena(g, [[x - 10, y - 3], [x + 2, y + 3], [x + 2, y - 4], [x - 10, y - 10]], mezcla(carga, '#000000', .2)); rellena(g, [[x - 10, y - 10], [x + 2, y - 4], [x + 5, y - 5.6], [x - 7, y - 11.6]], carga);
  if (estacas) { g.strokeStyle = '#6E4529'; g.lineWidth = .5; for (let k = 0; k <= 4; k++) { const t = k / 4; g.beginPath(); g.moveTo(x - 10 + 12 * t, y - 3 + 6 * t); g.lineTo(x - 10 + 12 * t, y - 10 + 6 * t); g.stroke(); } }
  rellena(g, [[x + 2, y + 3], [x + 7, y + 5.5], [x + 7, y - 2], [x + 2, y - 4.5]], cab); rellena(g, [[x + 2, y - 4.5], [x + 7, y - 2], [x + 9, y - 3], [x + 4, y - 5.6]], mezcla(cab, '#FFFFFF', .2));
  rellena(g, [[x + 3, y - 3.4], [x + 6.4, y - 1.6], [x + 6.4, y - 3.6], [x + 3, y - 5]], '#7FA6BC');
  g.fillStyle = '#1E1A18'; for (const [dx, dy] of [[-7, -1.2], [-2, 1.4], [5, 4.4]]) { g.beginPath(); g.ellipse(x + dx, y + dy, 1.5, 1.5, 0, 0, 7); g.fill(); }
}
function vagoneta(g, x, y, carga = '#8E8478') { rellena(g, [[x - 3.4, y - 1], [x + 3.4, y + 1.8], [x + 3.8, y - 2], [x - 3, y - 4.8]], '#5E5A54'); g.fillStyle = carga; g.beginPath(); g.ellipse(x + .2, y - 3.6, 3.4, 1.6, .38, 0, 7); g.fill(); g.fillStyle = '#2E2A28'; g.beginPath(); g.arc(x - 2, y + .4, .9, 0, 7); g.arc(x + 2.2, y + 2, .9, 0, 7); g.fill(); }
function rieles(g, a, b) { g.strokeStyle = '#5A4A3A'; g.lineWidth = .7; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.moveTo(a[0] + 2.4, a[1] - 1); g.lineTo(b[0] + 2.4, b[1] - 1); g.stroke(); g.strokeStyle = '#7A5A3A'; g.lineWidth = .6; for (let k = 0; k <= 8; k++) { const t = k / 8, x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t; g.beginPath(); g.moveTo(x - .6, y + .6); g.lineTo(x + 3, y - 1.4); g.stroke(); } }
// Boca de socavón en la ladera: monte de roca, marco de madera o de concreto y el hueco oscuro.
function socavon(g, x, y, marco = '#7A5A3A', concreto = false) {
  const R = mulberry(17);
  g.fillStyle = '#7A6E60'; g.beginPath(); g.moveTo(x - 20, y + 6); g.quadraticCurveTo(x - 18, y - 12, x - 4, y - 17); g.quadraticCurveTo(x + 10, y - 19, x + 18, y - 6); g.lineTo(x + 20, y + 6); g.closePath(); g.fill();
  g.fillStyle = '#9A8E7E'; g.beginPath(); g.moveTo(x - 18, y + 2); g.quadraticCurveTo(x - 16, y - 11, x - 4, y - 15.5); g.quadraticCurveTo(x - 1, y - 9, x - 8, y + 2); g.closePath(); g.fill(); // la cara iluminada del monte
  g.fillStyle = '#6E8A42'; for (let k = 0; k < 9; k++) { const px = x - 16 + R() * 32, py = y - 14 + R() * 6; g.beginPath(); g.moveTo(px - 1.4, py + 1); g.lineTo(px, py - 1.6); g.lineTo(px + 1.4, py + 1); g.closePath(); g.fill(); }
  g.fillStyle = '#1C1612'; g.beginPath(); g.moveTo(x - 5.5, y + 4); g.lineTo(x - 5.5, y - 5); g.quadraticCurveTo(x, y - 9, x + 5.5, y - 5); g.lineTo(x + 5.5, y + 4); g.closePath(); g.fill();
  if (concreto) { rellena(g, [[x - 7.5, y + 4], [x - 5.5, y + 4], [x - 5.5, y - 6], [x - 7.5, y - 7]], '#B8B2A6', null); rellena(g, [[x + 5.5, y + 4], [x + 7.5, y + 4], [x + 7.5, y - 7], [x + 5.5, y - 6]], '#9C968A', null); g.strokeStyle = '#B8B2A6'; g.lineWidth = 2; g.beginPath(); g.moveTo(x - 7, y - 6.5); g.quadraticCurveTo(x, y - 11.5, x + 7, y - 6.5); g.stroke(); }
  else { g.strokeStyle = marco; g.lineWidth = 1.8; g.beginPath(); g.moveTo(x - 6.5, y + 4); g.lineTo(x - 6.5, y - 7); g.lineTo(x + 6.5, y - 7); g.lineTo(x + 6.5, y + 4); g.stroke(); g.lineWidth = .9; g.beginPath(); g.moveTo(x - 6.5, y - 4); g.lineTo(x - 3, y - 7); g.moveTo(x + 6.5, y - 4); g.lineTo(x + 3, y - 7); g.stroke(); }
}
// La mina en las seis épocas: socavón de barequeros con batea (fundación), socavón con rieles y vagoneta (café),
// castillete de madera y tolva (La Violencia), castillete de hierro, tolva y volqueta (modernización), mina con
// campamento, cerca y guardia (conflicto) y mina con banda transportadora y luces (era digital).
function mina6(g, e, h) {
  socavon(g, -6, 6, h >= 2 ? '#5E4A36' : '#7A5A3A', h >= 4);
  for (let k = 0; k < 6; k++) { const px = 14 + (k % 3) * 3.4, py = 10 - k * 1.1; g.fillStyle = k % 2 ? '#8E8478' : '#A39C92'; g.beginPath(); g.ellipse(px, py, 2.6, 1.6, 0, 0, 7); g.fill(); } // la escombrera
  if (h === 0) { // barequeras con batea en la quebrada
    rellena(g, [[-32, 16], [-14, 22], [-10, 19], [-28, 13]], '#7FA6B4', null);
    personaM(g, -22, 18, '#C9A86A', '#D9C48E', '#A8704A'); g.fillStyle = '#6E4529'; g.beginPath(); g.ellipse(-19, 16.4, 3.2, 1.1, 0, 0, 7); g.fill();
    personaM(g, 8, 12, '#E8E0CC', '#D9C48E', '#C98E62');
    return;
  }
  rieles(g, [-6, 9], [16, 20]); vagoneta(g, 4, 15, h === 5 ? '#6E6A62' : '#8E8478');
  if (h === 1) { personaM(g, 12, 16, '#E8E0CC', '#D9C48E', '#A8704A'); mulaCarga(g, 26, 22); return; }
  const tx = 14, ty = 2; // castillete sobre el pozo
  g.strokeStyle = h === 2 ? '#5E4A36' : '#5E6670'; g.lineWidth = h === 2 ? 1.4 : 1;
  for (const dx of [-5, 5]) { g.beginPath(); g.moveTo(tx + dx, ty); g.lineTo(tx + dx * .3, ty - 24); g.stroke(); }
  g.lineWidth = .6; for (let k = 1; k < 4; k++) { const z = k * 6; g.beginPath(); g.moveTo(tx - 5 + k * 1.2, ty - z); g.lineTo(tx + 5 - k * 1.2, ty - z); g.stroke(); }
  g.fillStyle = '#2E2A28'; g.beginPath(); g.arc(tx, ty - 25, 2.4, 0, 7); g.fill(); g.strokeStyle = '#C9C2B4'; g.lineWidth = .4; g.beginPath(); g.arc(tx, ty - 25, 1.6, 0, 7); g.stroke();
  const T = caras(.16, .14, 8, .02, .34, 0); muros(g, T, h === 2 ? '#8A6A4A' : '#9AA0A4', null); rellena(g, [T.en('izq', .1, 8), T.en('izq', .9, 8), [T.en('izq', .5, 3)[0], T.en('izq', .5, 3)[1]]], h === 2 ? '#6E5238' : '#7E868C'); // tolva
  if (h >= 3) { const c = P(.42, .5); camion(g, c[0], c[1], h === 5 ? '#E7B23C' : '#B9442F', '#8E8478', false); }
  if (h === 4) { const C = caras(.22, .16, 7, -.34, .4); muros(g, C, '#C8C6BC', null); dosAguas(g, C, 3, MAT.zinc); g.strokeStyle = '#5A5A5A'; g.lineWidth = .35; for (let k = 0; k <= 10; k++) { const q = P(.56, -.5 + k * .1); poste(g, q[0], q[1], 5, '#6E6E6E'); } alambre(g, [P(.56, -.5), P(.56, .5)], [2, 3.6, 4.8]); soldadoM(g, ...P(.5, -.3)); }
  if (h === 5) { // banda transportadora con su estructura y reflectores
    const a1 = P(.0, .1, 2), b1 = P(-.3, .5, 18); g.strokeStyle = '#7E868C'; g.lineWidth = 3; g.beginPath(); g.moveTo(...a1); g.lineTo(...b1); g.stroke(); g.strokeStyle = '#3A3A3A'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(...a1); g.lineTo(...b1); g.stroke();
    for (let k = 1; k < 4; k++) { const t = k / 4, x = a1[0] + (b1[0] - a1[0]) * t, y = a1[1] + (b1[1] - a1[1]) * t; g.strokeStyle = '#9AA0A4'; g.lineWidth = .6; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 18 * t); g.stroke(); }
    farol(g, -26, 10, 16); personaM(g, 4, 18, '#E7B23C', '#F4F1E8', '#C98E62');
  }
}

// Taller y fábricas: ramada con horno (fundación y café), taller de ladrillo con teja (La Violencia), fábrica de techo
// en dientes de sierra (modernización), bodega industrial de bloque y zinc (conflicto) y nave blanca con paneles
// solares (era digital). La chimenea alta y la nave de las fábricas con máquinas se añaden aparte.
function taller6(g, e, h) {
  if (h <= 1) return taller(g, h);
  const F = caras(.62, .5, h === 2 ? 13 : 15, .06, -.04);
  sombraCasa(g, F);
  const muro = h === 2 ? K.ladrillo : h === 3 ? '#B5654A' : h === 4 ? '#C8C4B8' : '#F2F2EE';
  muros(g, F, muro, h === 5 ? '#3E8A4A' : '#5A4A3C', { ladrillo: h <= 3 }); aleroYdesgaste(g, F);
  if (h === 2) { hueco(g, F, 'izq', .35, .65, 0, 9, '#3A2A1E', true); for (const u of [.15, .85]) ventana(g, F, 'izq', u, 4, .1, 5, '#2E2A28', { marco: '#F4EEE2' }); ventana(g, F, 'der', .5, 4, .2, 5, '#2E2A28', { marco: '#F4EEE2' }); dosAguas(g, F, 7, MAT.tejaParda); }
  else if (h === 3) { // dientes de sierra con su vidrio hacia la luz
    hueco(g, F, 'izq', .3, .7, 0, 10, '#4A4A4A'); for (const u of [.12, .88]) vidrio(g, F, 'izq', u - .08, u + .08, 4, 10);
    const n = 4; for (let k = 0; k < n; k++) { const c0 = F.a + (F.b - F.a) * k / n, c1 = F.a + (F.b - F.a) * (k + 1) / n, z = F.H; rellena(g, [P(F.f, c0, z), P(F.t, c0, z), P(F.t, c0, z + 6), P(F.f, c0, z + 6)], '#86AEC4', K.contorno, .3); rellena(g, [P(F.f, c0, z + 6), P(F.t, c0, z + 6), P(F.t, c1, z), P(F.f, c1, z)], k % 2 ? '#9AA4A8' : '#AEB6BA', K.contorno, .3); }
  } else if (h === 4) { hueco(g, F, 'izq', .25, .75, 0, 11, '#5E6670'); g.strokeStyle = 'rgba(40,40,40,.4)'; g.lineWidth = .35; for (let z = 1; z < 11; z += 1.2) { const a = F.en('izq', .25, z), b = F.en('izq', .75, z); g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); } vidrio(g, F, 'der', .2, .8, 9, 13); dosAguas(g, F, 4, { ...MAT.zinc, hastial: '#B8B4A8' }); const c = P(F.f + .24, F.b - .12); camion(g, c[0], c[1], '#2F5D8A', '#B8A27A'); }
  else { hueco(g, F, 'izq', .3, .7, 0, 11, '#7E868C'); vidrio(g, F, 'izq', .05, .25, 4, 12); vidrio(g, F, 'der', .1, .9, 8, 13); terraza(g, F, '#F2F2EE'); solares(g, F, 2); const c = P(F.f + .24, F.b - .12); carro(g, c[0], c[1], '#F4F6F2', '#3E8A4A'); }
}

// Energía: rueda hidráulica (fundación y café), planta hidroeléctrica municipal de ladrillo con su tubería de presión
// (La Violencia), casa de máquinas moderna (modernización), subestación con transformadores y torre de alta tensión
// (conflicto) y granja solar con su inversor (era digital).
function molino6(g, e, h) {
  if (h <= 1) return molino(g, h);
  if (h === 3) return molino(g, 3);
  if (h === 2) {
    const F = caras(.5, .44, 15, -.06, .1);
    const a = P(F.t - .3, F.a - .3, 26), b = P(F.f - .02, F.a - .22, 2); g.strokeStyle = '#4A4E52'; g.lineWidth = 3.4; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); g.strokeStyle = '#7E868C'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(a[0] - 1, a[1]); g.lineTo(b[0] - 1, b[1]); g.stroke();
    for (const t of [.25, .5, .75]) { const x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t; rellena(g, [[x - 2, y + 2], [x + 2, y + 2], [x + 2, y - 1], [x - 2, y - 1]], '#B8B2A6', K.contorno, .3); }
    sombraCasa(g, F); muros(g, F, K.ladrillo, '#5A3A2A', { ladrillo: true }); aleroYdesgaste(g, F);
    for (const u of [.25, .75]) ventana(g, F, 'izq', u, 4, .12, 7, '#2E2A28', { marco: '#F4EEE2' }); ventana(g, F, 'der', .5, 4, .16, 7, '#2E2A28', { marco: '#F4EEE2' });
    dosAguas(g, F, 7, MAT.zinc); letrero(g, F, .5, 12.2, '#2F5D8A', 'PLANTA');
    const p1 = P(F.f + .2, F.b + .06); poste(g, p1[0], p1[1], 18, '#6E4529'); g.strokeStyle = '#3A3A3A'; g.lineWidth = .3; g.beginPath(); g.moveTo(p1[0], p1[1] - 17); g.quadraticCurveTo(p1[0] + 14, p1[1] - 10, p1[0] + 30, p1[1] - 14); g.stroke();
    return;
  }
  if (h === 4) { // subestación: transformadores tras la malla y torre de alta tensión
    const C = caras(.28, .2, 9, -.2, -.22); sombraCasa(g, C); muros(g, C, '#C8C6BC', '#7E868C'); aleroYdesgaste(g, C); hueco(g, C, 'izq', .35, .65, 0, 6.5, '#5E6670'); terraza(g, C, '#C8C6BC');
    for (const [r, c] of [[.0, .1], [.12, .26], [-.12, .3]]) { const q = P(r, c); cilindro(g, q[0], q[1], 3, 6, '#8E9498'); g.strokeStyle = '#5E6670'; g.lineWidth = .4; for (const dx of [-1.6, 0, 1.6]) { g.beginPath(); g.moveTo(q[0] + dx, q[1] - 6); g.lineTo(q[0] + dx, q[1] - 10); g.stroke(); } }
    g.strokeStyle = 'rgba(80,86,90,.75)'; g.lineWidth = .3; for (let k = 0; k <= 12; k++) { const q = P(.32, -.4 + k * .07); g.beginPath(); g.moveTo(q[0], q[1]); g.lineTo(q[0], q[1] - 7); g.stroke(); } alambre(g, [P(.32, -.4), P(.32, .44)], [0, 3.5, 7]);
    const t = P(-.3, .42); g.strokeStyle = '#7E868C'; g.lineWidth = .7; for (const dx of [-4, 4]) { g.beginPath(); g.moveTo(t[0] + dx, t[1]); g.lineTo(t[0] + dx * .2, t[1] - 32); g.stroke(); } for (let k = 1; k < 6; k++) { const z = k * 6, w = 4 - k * .65; g.beginPath(); g.moveTo(t[0] - w, t[1] - z); g.lineTo(t[0] + w, t[1] - z + 6); g.moveTo(t[0] + w, t[1] - z); g.lineTo(t[0] - w, t[1] - z + 6); g.stroke(); }
    g.lineWidth = 1; g.beginPath(); g.moveTo(t[0] - 7, t[1] - 26); g.lineTo(t[0] + 7, t[1] - 26); g.moveTo(t[0] - 5, t[1] - 30); g.lineTo(t[0] + 5, t[1] - 30); g.stroke();
    g.strokeStyle = '#3A3A3A'; g.lineWidth = .3; g.beginPath(); g.moveTo(t[0] - 7, t[1] - 26); g.quadraticCurveTo(t[0] - 20, t[1] - 16, t[0] - 34, t[1] - 22); g.moveTo(t[0] + 7, t[1] - 26); g.quadraticCurveTo(t[0] + 16, t[1] - 14, t[0] + 30, t[1] - 18); g.stroke();
    return;
  }
  // era digital: hileras de paneles solares sobre el suelo, inversor y una turbina de viento pequeña
  for (let fila = 0; fila < 3; fila++) for (let k = 0; k < 4; k++) { const r = -.36 + fila * .22, c = -.42 + k * .2, q = [P(r + .06, c, 1), P(r + .06, c + .17, 1), P(r - .02, c + .17, 5), P(r - .02, c, 5)]; g.strokeStyle = '#6E7378'; g.lineWidth = .6; g.beginPath(); g.moveTo(...P(r + .03, c + .08, 0)); g.lineTo(...P(r + .03, c + .08, 3)); g.stroke(); rellena(g, q, '#2C4A6E', 'rgba(30,40,55,.8)', .3); g.fillStyle = 'rgba(200,225,245,.35)'; g.fillRect(q[3][0] + 1, q[3][1] + .4, 3, .6); }
  const I = caras(.14, .12, 6, .36, .38); muros(g, I, '#E8EAE6', '#3E8A4A'); terraza(g, I, '#E8EAE6');
  const w = P(.36, -.4); g.strokeStyle = '#E8ECEE'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(w[0], w[1]); g.lineTo(w[0], w[1] - 30); g.stroke(); g.lineWidth = .9; for (const a of [-1.57, .52, 2.62]) { g.beginPath(); g.moveTo(w[0], w[1] - 30); g.lineTo(w[0] + Math.cos(a) * 11, w[1] - 30 + Math.sin(a) * 11); g.stroke(); }
}

// Mercado: toldos de lona (antes) o de plástico rayado (desde la modernización); plaza cubierta: ramada, galería de
// ladrillo, plaza de mercado de concreto con bóvedas (modernización), galpón de zinc (conflicto) y supermercado con
// su parqueadero (era digital).
function mercado2_6(g, e, h, vacio) {
  if (h <= 1) return mercadoCubierto(g, h, vacio);
  if (h === 2) return mercadoCubierto(g, 2, vacio);
  if (h === 4) return mercadoCubierto(g, 3, vacio);
  if (h === 3) {
    const F = caras(.92, .66, 13); sombraCasa(g, F); muros(g, F, '#E6E0D2', '#7A6A58'); aleroYdesgaste(g, F);
    arcada(g, F, 'izq', 5, 0, 8, .04, .96, '#3A3430'); arcada(g, F, 'der', 3, 0, 8, .06, .94, '#2E2824');
    for (let k = 0; k < 5; k++) { const p = F.en('izq', .04 + (k + .5) * .184, 1.4); canasto(g, p[0], p[1], k, vacio); }
    azotea(g, F, '#D2CCBE');
    const n = 3; for (let k = 0; k < n; k++) { const c0 = F.a + (F.b - F.a) * k / n, c1 = F.a + (F.b - F.a) * (k + 1) / n, cm = (c0 + c1) / 2; g.fillStyle = k % 2 ? '#CFC9BC' : '#DCD6C8'; g.beginPath(); g.moveTo(...P(F.f, c0, F.H)); g.quadraticCurveTo(...P(F.f, cm, F.H + 9), ...P(F.f, c1, F.H)); g.lineTo(...P(F.t, c1, F.H)); g.quadraticCurveTo(...P(F.t, cm, F.H + 9), ...P(F.t, c0, F.H)); g.closePath(); g.fill(); g.strokeStyle = K.contorno; g.lineWidth = .4; g.stroke(); } // bóvedas de concreto
    letreroAncho(g, F, .26, .74, 10.4, '#2F5D8A', 'PLAZA DE MERCADO');
    if (!vacio) vidaMercado(g, 2, true); return;
  }
  // era digital: supermercado
  const F = caras(.8, .56, 12, -.06); sombraCasa(g, F); muros(g, F, '#F2F2EE', '#C0392B'); aleroYdesgaste(g, F);
  vidrio(g, F, 'izq', .08, .92, 1, 9, { montantes: 7 }); vidrio(g, F, 'der', .1, .5, 3, 9);
  rellena(g, [F.en('izq', 0, 10), F.en('izq', 1, 10), F.en('izq', 1, 12), F.en('izq', 0, 12)], '#C0392B', null);
  g.save(); g.fillStyle = '#F4F1E8'; g.font = 'bold 2.2px sans-serif'; g.textAlign = 'center'; const t = F.en('izq', .5, 10.5); g.fillText('SUPERMERCADO', t[0], t[1]); g.restore();
  terraza(g, F, '#E8E8E2'); solares(g, F, 1);
  for (let k = 0; k < 4; k++) { const q = P(.36, -.4 + k * .16); g.strokeStyle = 'rgba(250,245,230,.85)'; g.lineWidth = .5; g.beginPath(); g.moveTo(q[0] - 4, q[1] - 2); g.lineTo(q[0] + 4, q[1] + 2); g.stroke(); }
  carro(g, ...P(.44, -.3), '#2F5D8A', '#E7C76B'); carro(g, ...P(.44, .14), '#F4F1E8', '#2E2A28');
  personaM(g, ...P(.3, .38), '#C0392B', null, '#A8704A', true);
}

// Banco: casa de cambio (fundación), banco clásico (café), Banco de la República con cúpula (La Violencia), Caja
// Agraria con su aviso verde (modernización), banco de ladrillo y vidrio con cajero automático y guarda (conflicto) y
// torre de vidrio (era digital).
function cajaAgraria(g) {
  const F = caras(.74, .56, 18, -.06); sombraCasa(g, F); muros(g, F, '#E8E4D8', '#3E6B4A'); aleroYdesgaste(g, F);
  for (const z of [3, 11]) { vidrio(g, F, 'izq', .06, .46, z, z + 5); if (z === 11) vidrio(g, F, 'izq', .54, .94, z, z + 5); vidrio(g, F, 'der', .1, .9, z, z + 5); }
  hueco(g, F, 'izq', .58, .9, 0, 8, '#4A4E52');
  terraza(g, F, '#E0DCD0');
  rellena(g, [F.en('izq', .04, 18.4), F.en('izq', .96, 18.4), F.en('izq', .96, 22), F.en('izq', .04, 22)], '#2E7D4F', K.contorno, .3);
  g.save(); g.fillStyle = '#F4F1E8'; g.font = 'bold 2.4px sans-serif'; g.textAlign = 'center'; const t = F.en('izq', .5, 19.6); g.fillText('CAJA AGRARIA', t[0], t[1]); g.restore();
  personaM(g, ...P(.4, -.2), '#C9A86A', '#D9C48E', '#A8704A'); mulaCarga(g, ...P(.44, .28));
}
function bancoConflicto(g) {
  const F = caras(.66, .56, 26, -.04); sombraCasa(g, F); muros(g, F, K.ladrillo, null, { ladrillo: true }); aporticado(g, F, 3, [0, .5, 1]); aleroYdesgaste(g, F);
  for (let p = 0; p < 3; p++) { vidrio(g, F, 'izq', .06, .44, 2.6 + p * 8.4, 7 + p * 8.4); vidrio(g, F, 'izq', .56, .94, 2.6 + p * 8.4, 7 + p * 8.4); vidrio(g, F, 'der', .1, .9, 2.6 + p * 8.4, 7 + p * 8.4); }
  terraza(g, F, '#D9D4C8');
  rellena(g, [F.en('izq', .1, 8.2), F.en('izq', .4, 8.2), F.en('izq', .4, 10.4), F.en('izq', .1, 10.4)], '#C9A24A', K.contorno, .3);
  g.save(); g.fillStyle = '#3A2A1E'; g.font = 'bold 1.8px sans-serif'; g.textAlign = 'center'; const t = F.en('izq', .25, 9); g.fillText('BANCO', t[0], t[1]); g.restore();
  const B = caras(.1, .08, 8, .34, -.3); muros(g, B, '#2E3A44', null); rellena(g, [B.en('izq', .15, 4), B.en('izq', .85, 4), B.en('izq', .85, 7), B.en('izq', .15, 7)], '#8FD0A0', K.contorno, .3); // cajero
  soldadoM(g, ...P(.4, .2)); camara(g, ...P(F.f, F.a, 24));
}
function banco6(g, e, h) {
  if (h === 3) return cajaAgraria(g);
  if (h === 4) return bancoConflicto(g);
  const ee = [0, 1, 2, 3, 3, 3][h];
  if (ee === 1 || ee === 2) { g.save(); g.scale(1.18, 1.18); bancoClasico(g, ee); bancoVida(g, ee); g.restore(); } else { bancoEdificio(g, ee); bancoVida(g, ee); }
}

// Puerto: embarcadero de guadua y champán, bodega de tapia, muelle del vapor, muelle de concreto con grúa, muelle de
// lanchas con contenedores (conflicto) y la misma con grúa, contenedores y paneles (era digital).
function contenedor(g, r, c, col, z = 0) { caja(g, .26, .1, 5, r, c, z, col); g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = .3; for (let k = 1; k < 8; k++) { const a = P(r + .05, c - .13 + k * .033, z), b = P(r + .05, c - .13 + k * .033, z + 5); g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); } }
function puerto6(g, e, h) {
  const ee = [0, 1, 2, 3, 3, 3][h];
  puerto(g, ee);
  if (h >= 4) { contenedor(g, -.32, -.34, '#B9442F'); contenedor(g, -.32, -.34, '#2F6E8E', 5); contenedor(g, -.2, -.42, '#E7B23C'); const c = P(.44, -.1); lancha(g, c[0], c[1]); }
  if (h === 5) { solares(g, caras(.5, .42, 14, -.16, .16), 1); camara(g, ...P(-.37, .37, 14)); }
}

// Aserradero: sierra a mano (fundación, café), aserrío de motor (La Violencia), galpón de zinc (modernización), con
// camión maderero y pila de bloques (conflicto) y con estibas, montacargas y paneles (era digital).
function aserradero6(g, e, h) {
  aserradero(g, [0, 1, 2, 3, 3, 3][h]);
  if (h >= 4) { const c = P(.44, .3); camion(g, c[0], c[1], h === 5 ? '#3E8A4A' : '#8E2F22', '#8A5A36'); for (let k = 0; k < 3; k++) rollizo(g, c[0] - 9 + k * .6, c[1] - 11 - k * 2, 12, 2.2, k % 2 ? '#7A5536' : '#8A5A36'); }
  if (h === 5) { for (let k = 0; k < 3; k++) caja(g, .14, .14, 1.4, -.34 + k * .002, .38, k * 1.4, '#C9A86A'); const m = P(-.2, .3); rellena(g, [[m[0] - 3, m[1]], [m[0] + 3, m[1] + 1.6], [m[0] + 3, m[1] - 4], [m[0] - 3, m[1] - 5.6]], '#E7B23C', K.contorno, .3); g.strokeStyle = '#3A3A3A'; g.lineWidth = .8; g.beginPath(); g.moveTo(m[0] - 3.4, m[1] - 8); g.lineTo(m[0] - 3.4, m[1] + 1); g.stroke(); } // estibas y montacargas
}

// Estudio de suelos: caseta del agrimensor (fundación a La Violencia), torre de perforación de madera
// (modernización), torre de perforación metálica con su camioneta (conflicto) y estación con antena, panel y dron
// (era digital).
function estudio6(g, e, h) {
  if (h <= 2) return estudio(g, h);
  const F = caras(.32, .3, 8, -.16, -.14); sombraCasa(g, F); muros(g, F, h === 5 ? '#EEF0EC' : '#D6D2CA', '#7E868C'); aleroYdesgaste(g, F); vidrio(g, F, 'der', .2, .8, 3, 6); hueco(g, F, 'izq', .45, .75, 0, 6, '#5E6670');
  if (h === 5) { terraza(g, F, '#E8EAE6'); solares(g, F, 1); } else dosAguas(g, F, 4, MAT.zinc);
  const t = P(.14, .26); g.strokeStyle = h === 3 ? '#6E4529' : '#7E868C'; g.lineWidth = h === 3 ? 1.1 : .8;
  for (const dx of [-4, 4]) { g.beginPath(); g.moveTo(t[0] + dx, t[1]); g.lineTo(t[0], t[1] - 26); g.stroke(); }
  g.lineWidth = .5; for (let k = 1; k < 5; k++) { const z = k * 5, w = 4 * (1 - z / 26); g.beginPath(); g.moveTo(t[0] - w, t[1] - z); g.lineTo(t[0] + w, t[1] - z); g.stroke(); }
  g.strokeStyle = '#3A3A3A'; g.lineWidth = .9; g.beginPath(); g.moveTo(t[0], t[1] - 24); g.lineTo(t[0], t[1] + 1); g.stroke();
  for (let k = 0; k < 4; k++) { const q = P(.36, -.06 + k * .06); g.fillStyle = ['#8A6A48', '#A0805A', '#6E5238', '#B8946A'][k]; g.fillRect(q[0] - 3, q[1] - 1.2, 6, 1.2); } // muestras de suelo por capas
  if (h === 4) { const c = P(.42, -.3); carro(g, c[0], c[1], '#F4F1E8', '#2F5D8A'); }
  if (h === 5) { antena(g, ...P(F.t + .06, F.a + .06, 8), 16); const d = P(.0, .0, 30); g.fillStyle = '#2E3238'; g.fillRect(d[0] - 2, d[1] - .6, 4, 1.2); g.strokeStyle = '#2E3238'; g.lineWidth = .4; for (const dx of [-3, 3]) { g.beginPath(); g.moveTo(d[0], d[1]); g.lineTo(d[0] + dx, d[1] - 1); g.stroke(); g.beginPath(); g.ellipse(d[0] + dx, d[1] - 1.2, 1.6, .4, 0, 0, 7); g.stroke(); } } // dron
}
// Recaudo: casa del recaudador (fundación), de tapia (café), de ladrillo (La Violencia), tesorería de bloque con la
// fila de contribuyentes (modernización), oficina de concreto (conflicto) y con paneles solares (era digital).
function recaudo6(g, e, h) {
  if (h === 3) {
    const F = caras(.6, .46, 16, -.06); sombraCasa(g, F); muros(g, F, '#E8E2D4', '#2F5D8A'); aleroYdesgaste(g, F);
    for (const u of [.2, .5, .8]) vidrio(g, F, 'izq', u - .1, u + .1, 9.6, 14); for (const u of [.2, .8]) vidrio(g, F, 'izq', u - .1, u + .1, 2.6, 7); hueco(g, F, 'izq', .42, .58, 0, 7, '#4A4E52'); vidrio(g, F, 'der', .1, .9, 3, 7);
    terraza(g, F, '#E0DCD0'); letreroAncho(g, F, .2, .8, 7.8, '#2F5D8A', 'TESORERÍA');
    for (let k = 0; k < 4; k++) personaM(g, ...P(.3 + k * .07, -.04 + k * .05), ['#2F5D8A', '#C9A86A', '#B9442F', '#3E6B4A'][k], k % 2 ? null : '#D9C48E', ['#C98E62', '#A8704A'][k % 2]); // la fila
    return;
  }
  recaudo(g, [0, 1, 2, 3, 3, 3][h]);
  if (h === 5) solares(g, caras(.5, .44, 26, -.04), 1);
}

// ---------- Tanda C: cementerio, cancha y acueducto en las seis épocas ----------
// Cementerio: cruces de madera sobre la tierra (fundación), tapia de cal con portada y capilla (café), bóvedas de
// ladrillo en la tapia (La Violencia, cuando se llenó), mausoleos de familia (modernización), muro de nichos con flores
// y una cruz blanca por los desaparecidos (conflicto) y cementerio parque con lápidas en el pasto (era digital).
function lapida(g, x, y, col = '#D8D2C4', s = 1) { rellena(g, [[x - 1.6 * s, y], [x + 1.6 * s, y + .8 * s], [x + 1.6 * s, y - 3.2 * s], [x, y - 4.4 * s], [x - 1.6 * s, y - 4]], col, K.contorno, .3); g.fillStyle = mezcla(col, '#000000', .2); g.fillRect(x - .6 * s, y - 3 * s, 1.2 * s, .3); }
function cruzMadera(g, x, y, s = 1, col = '#5E4A36') { g.strokeStyle = col; g.lineWidth = .8 * s; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - 6 * s); g.moveTo(x - 2 * s, y - 4.4 * s); g.lineTo(x + 2 * s, y - 4.4 * s); g.stroke(); g.fillStyle = 'rgba(80,60,40,.5)'; g.beginPath(); g.ellipse(x + .3, y + .2, 2.2 * s, .7 * s, 0, 0, 7); g.fill(); }
function tapiaBaja(g, pts, h, col) { for (let k = 0; k < pts.length - 1; k++) { const [a, b] = [pts[k], pts[k + 1]], frente = a[0] === b[0]; rellena(g, [P(...a), P(...b), P(...b, h), P(...a, h)], frente ? col : mezcla(col, '#000000', .15), K.contorno, .4); rellena(g, [P(...a, h), P(...b, h), P(b[0] - .03, b[1] - .03, h + .6), P(a[0] - .03, a[1] - .03, h + .6)], mezcla(col, '#FFFFFF', .15), null); } }
function boveda(g, r, c0, c1, h, filas, col) {
  rellena(g, [P(r, c0), P(r, c1), P(r, c1, h), P(r, c0, h)], col, K.contorno, .4);
  const n = Math.round((c1 - c0) / .07);
  for (let f = 0; f < filas; f++) for (let k = 0; k < n; k++) { const a = c0 + (c1 - c0) * (k + .12) / n, b = c0 + (c1 - c0) * (k + .88) / n, z0 = .6 + f * (h - .6) / filas, z1 = z0 + (h - .6) / filas - .6; rellena(g, [P(r, a, z0), P(r, b, z0), P(r, b, z1), P(r, a, z1)], (k + f) % 3 ? '#EDE8DC' : '#E2DCCE', 'rgba(70,55,40,.35)', .25); if ((k * 3 + f) % 5 === 0) { const q = P(r, (a + b) / 2, z0 + .4); flores(g, q[0], q[1] + 1, ['#C0392B', '#F4F1E6', '#E7B23C']); } }
}
function cementerio6(g, e, h) {
  if (h === 0) { for (const [r, c] of [[-.3, -.3], [-.3, .05], [-.05, -.2], [-.05, .2], [.2, -.05], [.2, .3], [.0, -.42]]) cruzMadera(g, ...P(r, c), 1.1); const q = P(.3, -.3); cruzMadera(g, q[0], q[1], 1.8, '#4A3A2A'); return; }
  const col = h >= 4 ? '#E8E4DA' : '#EDE6D6', L = .44;
  tapiaBaja(g, [[-L, L], [-L, -L], [L, -L]], 5, col); // tapias de atrás
  if (h >= 2) boveda(g, -L + .04, -L + .06, L - .06, 5, h >= 4 ? 3 : 2, col); // bóvedas en la tapia del fondo
  if (h === 1) { const C = caras(.2, .16, 8, -.24, .26); muros(g, C, K.cal, '#8A6A48'); hueco(g, C, 'izq', .3, .7, 0, 6, '#4A3A2E', true); dosAguas(g, C, 5, MAT.tejaVieja); cruz(g, ...C.en('izq', .5, 13), .7); }
  const tumbas = h === 5 ? [] : [[-.2, -.24], [-.2, .02], [.04, -.3], [.04, -.04], [.2, .18], [-.04, .22]];
  for (const [r, c] of tumbas) { if (h === 1) cruzMadera(g, ...P(r, c), .9, '#6E5A46'); else lapida(g, ...P(r, c), h >= 4 ? '#C9C5BC' : '#D8D2C4'); }
  if (h === 3 || h === 4) { const M = caras(.16, .14, 9, .14, -.3); muros(g, M, '#E4DED0', null); hueco(g, M, 'izq', .3, .7, 0, 6, '#5E5A54', true); azotea(g, M, '#D2CCBE'); const t = M.en('izq', .5, 9); rellena(g, [[t[0] - 3.4, t[1]], [t[0] + 3.4, t[1]], [t[0], t[1] - 4]], '#D2CCBE', K.contorno, .3); cruz(g, t[0], t[1] - 3.6, .6, '#8A8478'); } // mausoleo de familia
  if (h === 4) { const q = P(.24, -.32); g.strokeStyle = '#F4F1E8'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(q[0], q[1]); g.lineTo(q[0], q[1] - 12); g.moveTo(q[0] - 3.4, q[1] - 8.6); g.lineTo(q[0] + 3.4, q[1] - 8.6); g.stroke(); vela(g, q[0] - 3, q[1] + 1); vela(g, q[0] + 3, q[1] + 2); } // la cruz blanca de los desaparecidos
  if (h === 5) { for (let f = 0; f < 3; f++) for (let k = 0; k < 4; k++) { const q = P(-.22 + f * .16, -.3 + k * .17); rellena(g, [[q[0] - 2.2, q[1]], [q[0], q[1] + 1.1], [q[0] + 2.2, q[1]], [q[0], q[1] - 1.1]], '#CFC9BC', K.contorno, .25); if ((f + k) % 3 === 0) flores(g, q[0], q[1] - .4); } } // lápidas en el pasto
  tapiaBaja(g, [[L, -L], [L, -.08]], 5, col); tapiaBaja(g, [[L, .08], [L, L], [-L, L]], 5, col); // el frente con la portada
  const p = P(L, 0); rellena(g, [[p[0] - 5, p[1] + 2.4], [p[0] + 5, p[1] - 2.4], [p[0] + 5, p[1] - 12], [p[0], p[1] - 15], [p[0] - 5, p[1] - 9.6]], col, K.contorno, .4);
  g.fillStyle = '#4A3A2E'; g.beginPath(); g.moveTo(p[0] - 3, p[1] + 1.4); g.lineTo(p[0] + 3, p[1] - 1.4); g.lineTo(p[0] + 3, p[1] - 7); g.quadraticCurveTo(p[0], p[1] - 10, p[0] - 3, p[1] - 5.6); g.closePath(); g.fill();
  cruz(g, p[0], p[1] - 14.6, .7, '#7A6A58');
}

// Cancha: de tejo con sus bocines y mechas (fundación y café: el deporte de los campesinos), de fútbol en tierra con
// arcos de madera (La Violencia), de microfútbol en cemento con su aro (modernización), polideportivo con malla y
// luces (conflicto) y cancha sintética con cubierta y graderías (era digital).
function cancha6(g, e, h) {
  if (h >= 4 && h !== 5) return canchaN(g);
  const z = 0;
  if (h <= 1) { // cancha de tejo
    rellena(g, [P(-.12, -.46, z), P(-.12, .46, z), P(.12, .46, z), P(.12, -.46, z)], '#C2A878', null);
    for (const c of [-.38, .38]) { const B = caras(.16, .16, 2.4, 0, c); muros(g, B, '#8A6A48', null); rellena(g, [P(B.f, B.a, 2.4), P(B.f, B.b, 2.4), P(B.t, B.b, 2.4), P(B.t, B.a, 2.4)], '#9E8058', null); const m = P(0, c, 2.4); g.strokeStyle = '#4A3A2A'; g.lineWidth = .5; g.beginPath(); g.ellipse(m[0], m[1], 2.6, 1.3, 0, 0, 7); g.stroke(); for (const [dx, dy, col] of [[-2.2, -.2, '#F4F1E8'], [2.2, .2, '#C0392B'], [0, -1.3, '#F4F1E8'], [0, 1.3, '#C0392B']]) { g.fillStyle = col; g.beginPath(); g.moveTo(m[0] + dx - .8, m[1] + dy); g.lineTo(m[0] + dx + .8, m[1] + dy); g.lineTo(m[0] + dx, m[1] + dy - 1.4); g.closePath(); g.fill(); } } // bocín con sus mechas
    personaM(g, ...P(.08, .2), '#E8E0CC', '#D9C48E', '#A8704A'); personaM(g, ...P(.2, .3), '#8E3B2E', '#D9C48E', '#C98E62'); personaM(g, ...P(.24, -.2), '#3E6B4A', '#D9C48E', '#8A5A3A');
    caja(g, .1, .14, 2, .3, -.36, 0, '#B9442F'); // la caja de las botellas
    const b = P(-.26, .0); bancoMadera(g, b[0], b[1]);
    return;
  }
  if (h === 2) { // fútbol en tierra
    rellena(g, [P(-.4, -.46, z), P(-.4, .46, z), P(.4, .46, z), P(.4, -.46, z)], '#B9A27C', null);
    g.save(); g.strokeStyle = 'rgba(250,245,230,.7)'; g.lineWidth = .5; g.beginPath(); g.moveTo(...P(0, -.46, z)); g.lineTo(...P(0, .46, z)); g.stroke(); g.restore();
    for (const c of [-.42, .42]) { const a = P(-.12, c, z), b = P(.12, c, z); g.strokeStyle = '#6E4529'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(a[0], a[1] - 8); g.lineTo(b[0], b[1] - 8); g.lineTo(b[0], b[1]); g.stroke(); }
    for (const [r, c, col] of [[-.1, -.1, '#F4F1E8'], [.1, .14, '#B9442F'], [-.2, .24, '#F4F1E8'], [.2, -.2, '#B9442F']]) personaM(g, ...P(r, c), col, null, '#A8704A');
    return;
  }
  if (h === 3) { // microfútbol en cemento
    rellena(g, [P(-.36, -.42, z), P(-.36, .42, z), P(.36, .42, z), P(.36, -.42, z)], '#BDB8AC', null);
    g.save(); g.strokeStyle = 'rgba(250,245,230,.85)'; g.lineWidth = .5; g.beginPath(); g.moveTo(...P(-.3, -.38, z)); g.lineTo(...P(-.3, .38, z)); g.lineTo(...P(.3, .38, z)); g.lineTo(...P(.3, -.38, z)); g.closePath(); g.moveTo(...P(0, -.38, z)); g.lineTo(...P(0, .38, z)); g.stroke(); g.restore();
    for (const c of [-.38, .38]) { const a = P(-.08, c, z), b = P(.08, c, z); g.strokeStyle = '#E8ECEC'; g.lineWidth = 1; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(a[0], a[1] - 6); g.lineTo(b[0], b[1] - 6); g.lineTo(b[0], b[1]); g.stroke(); }
    const t = P(-.36, .0); g.strokeStyle = '#6E7378'; g.lineWidth = 1; g.beginPath(); g.moveTo(t[0], t[1]); g.lineTo(t[0], t[1] - 16); g.stroke(); rellena(g, [[t[0] - 3, t[1] - 20], [t[0] + 3, t[1] - 18], [t[0] + 3, t[1] - 14], [t[0] - 3, t[1] - 16]], '#F4F1E8', K.contorno, .3); g.strokeStyle = '#E2832B'; g.lineWidth = .6; g.beginPath(); g.ellipse(t[0] + 1.6, t[1] - 14, 1.8, .7, 0, 0, 7); g.stroke(); // aro de baloncesto
    for (const [r, c, col] of [[-.1, -.12, '#2F5D8A'], [.12, .12, '#E7B23C'], [.0, .26, '#2F5D8A']]) personaM(g, ...P(r, c), col, null, '#C98E62');
    return;
  }
  // era digital: sintética con cubierta en arco y graderías
  canchaN(g);
  for (let k = 0; k < 3; k++) caja(g, .08, .9, 1.4, -.5 - k * .06, 0, k * 1.4, '#B8B2A6'); // graderías
  g.strokeStyle = 'rgba(110,116,120,.9)'; g.lineWidth = 1; for (const c of [-.5, 0, .5]) for (const r of [-.46, .46]) { const a = P(r, c); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(a[0], a[1] - 18); g.stroke(); }
  g.fillStyle = 'rgba(200,210,215,.55)'; g.beginPath(); const A = P(-.46, -.5, 18), B = P(-.46, .5, 18), C = P(.46, .5, 18), D = P(.46, -.5, 18); g.moveTo(...A); g.quadraticCurveTo((A[0] + D[0]) / 2, (A[1] + D[1]) / 2 - 8, ...D); g.lineTo(...C); g.quadraticCurveTo((B[0] + C[0]) / 2, (B[1] + C[1]) / 2 - 8, ...B); g.closePath(); g.fill(); g.strokeStyle = '#8A9094'; g.lineWidth = .5; g.stroke(); // cubierta en arco, translúcida
}

// Acueducto: canal de guadua (fundación, café), arcos de ladrillo (La Violencia), tanque elevado (modernización),
// planta de tratamiento con sus tanques de decantación (conflicto) y la misma con paneles y medidor (era digital).
function acueducto6(g, e, h) {
  if (h <= 3) return acueducto(g, [0, 1, 2, 3][h]);
  for (const [r, c, R] of [[-.18, -.24, 9], [.12, -.2, 8]]) { const q = P(r, c); cilindro(g, q[0], q[1], R, 4, '#C8C4B8', '#6E9EAE'); }
  const C = caras(.26, .2, 9, -.06, .3); sombraCasa(g, C); muros(g, C, '#E8E4DA', '#2F6E8E'); aleroYdesgaste(g, C); vidrio(g, C, 'izq', .15, .85, 3, 7); terraza(g, C, '#E0DCD0');
  g.strokeStyle = '#2F6E8E'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(...P(-.1, -.12, 2)); g.lineTo(...P(-.1, .18, 2)); g.stroke();
  const q = P(.36, -.36); cilindro(g, q[0], q[1], 3.4, 14, '#9AA4A8'); // tanque de agua tratada
  if (h === 5) solares(g, C, 1);
  letrero(g, C, .5, 7.6, '#2F6E8E', 'AGUA');
}

// Envoltorios: cada obra de servicio según la época de la historia.
function escuela6(g, e, h) { if (h === 3) return escuelaBloque(g); if (h === 4) return colegioLadrillo(g); escuela(g, Math.min(h, 3)); if (h === 5) solares(g, caras(.82, .44, 32, -.08)); }
// Hospital regional de los años 80 y 90: tres pisos de ladrillo con estructura de concreto, franjas de ventanas,
// la cruz grande, ambulancia y la planta eléctrica de emergencia.
function hospitalRegional(g) {
  const F = caras(.86, .44, 30, -.06);
  sombraCasa(g, F); jardin(g, F);
  muros(g, F, K.ladrillo, null, { ladrillo: true }); aporticado(g, F, 3, [0, .25, .5, .75, 1]);
  for (let p = 0; p < 3; p++) for (const cara of ['izq', 'der']) for (let k = 0; k < (cara === 'izq' ? 4 : 2); k++) { const n = cara === 'izq' ? 4 : 2, u0 = k / n + .04, u1 = (k + 1) / n - .04; hueco(g, F, cara, u0, u1, 2.6 + p * 10, 7.2 + p * 10, cara === 'izq' ? '#7FA6BC' : '#6E94AA'); }
  hueco(g, F, 'izq', .4, .6, 0, 6, '#4E7FA0');
  terraza(g, F, '#D9D4C8');
  const c = F.en('izq', .5, 29); rellena(g, [[c[0] - 3.4, c[1] - 1], [c[0] + 3.4, c[1] - 1], [c[0] + 3.4, c[1] + 5], [c[0] - 3.4, c[1] + 5]], '#F4F1E8', K.contorno, .3); g.fillStyle = '#C0392B'; g.fillRect(c[0] - .9, c[1] - .4, 1.8, 4.8); g.fillRect(c[0] - 2.6, c[1] + 1.2, 5.2, 1.6);
  const p = P(F.f + .26, F.b - .12); carro(g, p[0], p[1], '#F4F1E8', '#C0392B');
  const q = P(F.t + .04, F.b + .12); cilindro(g, q[0], q[1], 3, 5, '#6E7A52'); // planta eléctrica
}
function hospital6(g, e, h) {
  if (h === 3) return centroSalud(g);
  if (h === 4) return hospitalRegional(g);
  const ee = h >= 4 ? 3 : h; hospital(g, ee); hospitalExtra(g, ee);
  if (h === 5) solares(g, caras(.86, .42, 32, -.06), 1);
}
function biblioteca6(g, e, h) {
  if (h === 3) { casaCultura(g); bibliotecaVida(g, 2); return; }
  if (h === 4) { bibliotecaPublica(g); bibliotecaExtra(g, 3); bibliotecaVida(g, 2); return; }
  const ee = Math.min(h, 3); biblioteca(g, ee); bibliotecaExtra(g, ee); bibliotecaVida(g, ee);
}
// Universidad de mediados del siglo XX (la del Tolima se fundó en 1945): edificio blanco de tres pisos con
// pilastras, azotea, torre central con reloj y escalinata, la arquitectura moderna de esos años.
function universidadDeco(g) {
  const F = caras(.92, .5, 26, -.06);
  sombraCasa(g, F); muros(g, F, '#EEE8DA', '#7A6A58');
  for (const cara of ['izq', 'der']) for (let k = 0; k <= (cara === 'izq' ? 8 : 4); k++) { const n = cara === 'izq' ? 8 : 4, u = k / n; rellena(g, [F.en(cara, Math.max(0, u - .012), 0), F.en(cara, Math.min(1, u + .012), 0), F.en(cara, Math.min(1, u + .012), 26), F.en(cara, Math.max(0, u - .012), 26)], cara === 'izq' ? '#F8F4EA' : '#D2CCBE', null); }
  for (let p = 0; p < 3; p++) { for (let k = 0; k < 8; k++) if (!(p === 0 && (k === 3 || k === 4))) hueco(g, F, 'izq', k / 8 + .03, (k + 1) / 8 - .03, 2.6 + p * 8, 7 + p * 8, '#6E94AA'); for (let k = 0; k < 4; k++) hueco(g, F, 'der', k / 4 + .04, (k + 1) / 4 - .04, 2.6 + p * 8, 7 + p * 8, '#5E84A0'); }
  azotea(g, F, '#DED8CA');
  const T = caras(.2, .16, 14, F.f - .06, 0, 26); muros(g, T, '#F4F0E6', null); reloj(g, ...T.en('izq', .5, 8), 3); azotea(g, T, '#DED8CA');
  hueco(g, F, 'izq', .4, .6, 0, 8, '#4A3A2C', true);
  for (let k = 0; k < 3; k++) rellena(g, [P(F.f + .04 + k * .04, -.16, k * .8), P(F.f + .04 + k * .04, .16, k * .8), P(F.f + .04 + k * .04, .16, k * .8 + .8), P(F.f + .04 + k * .04, -.16, k * .8 + .8)], '#D8D2C4', K.contorno, .3);
  const b = P(F.f - .06, 0, 40); bandera(g, b[0], b[1], 14, TRICOLOR);
  arbolito(g, ...P(F.f + .2, F.a + .06), .9, '#4E7A3A'); arbolito(g, ...P(F.f + .2, F.b - .06), .9, '#5E8B42');
}
function universidad6(g, e, h) {
  if (h === 2) return universidadDeco(g); if (h === 3 || h === 4) return universidadBloques(g, h === 4); universidad(g, Math.min(h, 3)); if (h === 5) solares(g, caras(.92, .7, 30, -.04), 2); }
function policia6(g, e, h) { if (h === 3) return estacionBloque(g); if (h === 4) return estacionFortificada(g); if (h === 5) return caiDigital(g); policia(g, h, h); }
function cuartel6(g, e, h) {
  if (h === 3) { basaBarracas(g, false, false); for (let k = 0; k < 5; k++) soldadoM(g, ...P(.46, -.34 + k * .15)); personaM(g, ...P(.56, .0), '#2F3E24', '#2E2A28', '#C98E62'); const q = P(.2, .46, 0); g.strokeStyle = '#2E2A28'; g.lineWidth = 2; g.lineCap = 'round'; g.beginPath(); g.moveTo(q[0] - 5, q[1] - 2); g.lineTo(q[0] + 4, q[1] - 5.4); g.stroke(); return; } // base con su formación
  if (h >= 4) { basaBarracas(g, h === 4, h === 5); cuartelVida(g, 3); return; } // helipuerto (y radar en la era digital)
  cuartel(g, h); cuartelExtra(g, h); cuartelVida(g, h);
}

// ---------- Maravillas, memoria e infraestructura redibujadas (pedido de Juan: «sigue con los dibujos») ----------
// Techo plano sin tanque ni antena (para los edificios patrimoniales y la torre de control), con su remate.
function techoPlano(g, F, col) {
  const H = F.z0 + F.H, o = .015; rellena(g, [P(F.f + o, F.a - o, H), P(F.f + o, F.b + o, H), P(F.t - o, F.b + o, H), P(F.t - o, F.a - o, H)], col, K.contorno, .3);
  rellena(g, [P(F.f + o, F.a - o, H), P(F.f + o, F.b + o, H), P(F.f + o, F.b + o, H - .8), P(F.f + o, F.a - o, H - .8)], mezcla(col, '#FFFFFF', .2), null);
}
// Jardín Botánico Mutis: invernadero de hierro y vidrio con bóveda, palmas adentro, eras de flores, sendero de
// gravilla, una pila pequeña y el letrero.
function jardinBotanico(g) {
  const R = mulberry(77);
  sombraPie(g, 4, 2, 34, 12, .2);
  // Eras de flores y sendero.
  for (const [r, c, col] of [[.32, -.3, '#D8433A'], [.32, .3, '#E7B23C'], [-.3, -.36, '#C2407A'], [.1, .42, '#F4EFE4']]) { const q = P(r, c); cajaPx(g, q[0], q[1], .22, .14, 1, '#7A5A3A', { top: '#5E8B42', borde: null }); for (let k = 0; k < 8; k++) { const u = (k + .5) / 8 - .5; g.fillStyle = col; g.beginPath(); g.arc(q[0] + u * 6, q[1] - 1.4 + u * 3 + (R() - .5), .55, 0, 7); g.fill(); } }
  { const a = P(.46, 0), b = P(.06, 0); g.strokeStyle = 'rgba(214,200,170,.9)'; g.lineWidth = 3; g.lineCap = 'round'; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); }
  // Invernadero: zócalo de ladrillo, armazón de hierro con vidrios y bóveda de cañón a lo largo de c.
  const F = caras(.56, .34, 9, -.08, 0, 2.4);
  const Z = caras(.58, .36, 2.4, -.08, 0, 0); muros(g, Z, K.ladrillo, null, { ladrillo: true });
  rellena(g, F.izq, 'rgba(190,225,230,.55)', 'rgba(40,50,50,.7)', .4); rellena(g, F.der, 'rgba(150,190,200,.55)', 'rgba(40,50,50,.7)', .4);
  // Palmas adentro, vistas a través del vidrio.
  for (const [u, h] of [[.25, 12], [.62, 15]]) { const b = F.en('izq', u, 0), t = [b[0] - 2, b[1] - h]; g.strokeStyle = '#8A7A5A'; g.lineWidth = .9; g.beginPath(); g.moveTo(b[0] - 2, b[1] - 1); g.lineTo(...t); g.stroke(); for (let k = 0; k < 7; k++) hojaP(g, t[0], t[1], -Math.PI / 2 + (k - 3) * .5, 4.6, 1, k % 2 ? '#4E7A3A' : '#6F9C4C'); }
  g.strokeStyle = '#2E3A34'; g.lineWidth = .45;
  for (let k = 0; k <= 8; k++) { const a = F.en('izq', k / 8, 0), b = F.en('izq', k / 8, 9); g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); }
  for (let k = 0; k <= 4; k++) { const a = F.en('der', k / 4, 0), b = F.en('der', k / 4, 9); g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); }
  for (const z of [3, 6]) { g.beginPath(); g.moveTo(...F.en('izq', 0, z)); g.lineTo(...F.en('izq', 1, z)); g.lineTo(...F.en('der', 1, z)); g.stroke(); }
  // Bóveda: arcos de hierro a lo largo y vidrios curvos.
  const H = F.z0 + F.H, arco = (c, u) => { const r = F.f + (F.t - F.f) * u; return P(r, c, H + Math.sin(u * Math.PI) * 6); };
  const lomo = []; for (let k = 0; k <= 12; k++) lomo.push(arco(F.b, k / 12));
  g.beginPath(); g.moveTo(...P(F.f, F.a, H)); for (let k = 0; k <= 12; k++) g.lineTo(...arco(F.a, k / 12)); for (let k = 12; k >= 0; k--) g.lineTo(...arco(F.b, k / 12)); g.closePath(); g.fillStyle = 'rgba(205,232,236,.65)'; g.fill(); g.stroke();
  g.beginPath(); lomo.forEach((q, k) => k ? g.lineTo(...q) : g.moveTo(...q)); g.closePath(); g.fillStyle = 'rgba(170,205,215,.6)'; g.fill(); g.stroke();
  for (let k = 1; k < 8; k++) { const c = F.a + (F.b - F.a) * k / 8; g.beginPath(); for (let q = 0; q <= 12; q++) { const pt = arco(c, q / 12); q ? g.lineTo(...pt) : g.moveTo(...pt); } g.stroke(); }
  g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = .6; g.beginPath(); g.moveTo(...arco(F.a + .05, .3)); g.lineTo(...arco(F.b - .1, .3)); g.stroke(); // reflejo
  puerta(g, F, 'izq', .5, .1, 6.5, '#2E3A34', true);
  { const q = P(.34, -.04); cilindroV(g, q[0], q[1], 2.6, 1.6, '#B4AC9C', { tapa: '#6E9FB4' }); } // pila
  { const a = P(.5, -.36), lt = [a[0], a[1]]; cajaPx(g, lt[0], lt[1], .02, .02, 5, K.maderaOsc, { borde: null }); rellena(g, [[lt[0] - 6, lt[1] - 8.6], [lt[0] + 6, lt[1] - 5.6], [lt[0] + 6, lt[1] - 3], [lt[0] - 6, lt[1] - 6]], '#3E6B4A', K.contorno, .3); g.save(); g.translate(lt[0], lt[1] - 5.8); g.transform(1, .25, 0, 1, 0, 0); g.fillStyle = '#F4F1E8'; g.font = 'bold 1.7px Georgia, serif'; g.textAlign = 'center'; g.fillText('JARDÍN BOTÁNICO', 0, -.3); g.fillText('JOSÉ C. MUTIS', 0, 1.7); g.restore(); }
  arbolito(g, ...P(-.38, .4), 1.1, '#4E7A3A');
}
// Conservatorio del Tolima: edificio republicano de dos pisos con pórtico de columnas, frontón con la lira, ventanas
// de arco, balaustrada en la azotea, escalinata y faroles.
function conservatorio(g) {
  const F = caras(.74, .5, 22, -.04); sombraCasa(g, F); muros(g, F, '#EDE0C4', '#B9A27A'); aleroYdesgaste(g, F);
  for (let k = 0; k < 5; k++) { const u = .1 + k * .2; if (k !== 2) ventana(g, F, 'izq', u, 3.4, .09, 6.5, '#3E6B4A', { marco: '#F4EEE2' }); ventana(g, F, 'izq', u, 13, .09, 6, '#3E6B4A', { marco: '#F4EEE2' }); }
  for (const u of [.3, .7]) { ventana(g, F, 'der', u, 3.4, .14, 6.5, '#3E6B4A', { marco: '#F4EEE2' }); ventana(g, F, 'der', u, 13, .14, 6, '#3E6B4A', { marco: '#F4EEE2' }); }
  rellena(g, [F.en('izq', 0, 10.6), F.en('izq', 1, 10.6), F.en('izq', 1, 11.6), F.en('izq', 0, 11.6)], '#F4EEE2', K.contorno, .25); // cornisa del primer piso
  techoPlano(g, F, '#E4D6B8');
  for (let k = 0; k <= 14; k++) { const a = F.en('izq', k / 14, 22), b = F.en('izq', k / 14, 24.2); g.strokeStyle = '#F4EEE2'; g.lineWidth = .7; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); } // balaustrada
  // Pórtico: cuatro columnas, entablamento y frontón con la lira.
  const fr = F.f + .1, a = -.14, b = .14;
  for (const c of [-.13, -.045, .045, .13]) { const p = P(fr, c); cilindroV(g, p[0], p[1], 1.1, 15, '#F4EEE2', { tapa: '#E4D6B8' }); cajaPx(g, p[0], p[1], .04, .04, 1, '#D8CCB0', { borde: null }); }
  rellena(g, [P(fr, a, 15), P(fr, b, 15), P(fr, b, 17.4), P(fr, a, 17.4)], '#F4EEE2', K.contorno, .3);
  rellena(g, [P(fr, a, 17.4), P(fr, b, 17.4), P(fr, 0, 22.6)], '#E9DCC0', K.contorno, .3);
  { const m = P(fr, 0, 19.2); g.strokeStyle = '#B8964A'; g.lineWidth = .5; g.beginPath(); g.moveTo(m[0] - 1.2, m[1] + 1.2); g.quadraticCurveTo(m[0] - 1.6, m[1] - 1.6, m[0], m[1] - 1.8); g.quadraticCurveTo(m[0] + 1.6, m[1] - 1.6, m[0] + 1.2, m[1] + 1.2); g.stroke(); for (const dx of [-.5, 0, .5]) { g.beginPath(); g.moveTo(m[0] + dx, m[1] + 1); g.lineTo(m[0] + dx, m[1] - 1.4); g.stroke(); } } // la lira
  puerta(g, F, 'izq', .5, .1, 9, '#5A3A22', true);
  for (let k = 0; k < 3; k++) { const p = P(fr + .05 + k * .03, 0, 0); cajaPx(g, p[0], p[1] + k * .3, .3, .03, .7, '#CFC6B4', { top: '#DDD6C8', borde: 'rgba(60,50,40,.3)' }); } // escalinata
  for (const c of [-.24, .24]) farol(g, ...P(F.f + .12, c), 11);
  { const t = F.en('izq', .5, 20.6); g.save(); g.fillStyle = '#7A5A30'; g.font = 'bold 1.6px Georgia, serif'; g.textAlign = 'center'; g.fillText('CONSERVATORIO DEL TOLIMA', t[0], t[1]); g.restore(); }
}
// Túnel de La Línea: la montaña de roca con monte encima, el portal de concreto con su visera, luces adentro, la
// carretera que entra, el letrero y un camión que sale.
function tunel(g) {
  const R = mulberry(31);
  sombraPie(g, 0, 2, 40, 10, .18);
  // Montaña en facetas, con luz a la izquierda.
  const cima = [[-44, 2], [-32, -18], [-18, -30], [-2, -34], [14, -28], [30, -16], [44, 2]];
  rellena(g, cima, '#8A8070', null);
  rellena(g, [[-44, 2], [-32, -18], [-18, -30], [-2, -34], [-6, -8], [-20, 2]], '#A89E8C', null);
  rellena(g, [[14, -28], [30, -16], [44, 2], [20, 2], [10, -10]], '#6E665A', null);
  for (let k = 0; k < 40; k++) { const x = -38 + R() * 76, y = -30 + R() * 22; if (y > -34 + Math.abs(x) * .5 + 4) for (let q = 0; q < 3; q++) hojaP(g, x + q, y, -Math.PI / 2 + (q - 1) * .5, 2.6 + R() * 2, .9, R() < .5 ? '#4E7A3A' : '#6F9C4C', false); } // monte encima
  // Carretera que entra.
  rellena(g, [[-10, 2], [10, 2], [5, -6], [-5, -6]], '#4A4E52', null); g.strokeStyle = '#E8D27A'; g.lineWidth = .5; g.setLineDash([1.6, 1.4]); g.beginPath(); g.moveTo(0, 2); g.lineTo(0, -6); g.stroke(); g.setLineDash([]);
  // Portal: marco de concreto en arco con visera.
  rellena(g, [[-11, -4], [11, -4], [11, -18], [-11, -18]], '#C8C4BA', K.contorno, .4);
  g.fillStyle = '#1E1C1A'; g.beginPath(); g.moveTo(-7.4, -4); g.lineTo(-7.4, -10); g.quadraticCurveTo(0, -18.6, 7.4, -10); g.lineTo(7.4, -4); g.closePath(); g.fill();
  for (let k = 0; k < 4; k++) { const x = -3 + k * 2, y = -11 + Math.abs(k - 1.5) * .6; g.fillStyle = '#F2D98A'; g.beginPath(); g.arc(x, y, .5, 0, 7); g.fill(); g.fillStyle = 'rgba(255,230,160,.25)'; g.beginPath(); g.arc(x, y, 1.2, 0, 7); g.fill(); } // luces de adentro
  rellena(g, [[-12.4, -18], [12.4, -18], [12.4, -20], [-12.4, -20]], '#DAD6CC', K.contorno, .3); // visera
  g.save(); g.fillStyle = '#3A3A3E'; g.font = 'bold 1.7px sans-serif'; g.textAlign = 'center'; g.fillText('TÚNEL DE LA LÍNEA', 0, -15.4); g.restore();
  // Letrero verde de carretera y un camión que sale.
  cajaPx(g, -16, 1, .02, .02, 7, '#8A8E92', { borde: null }); rellena(g, [[-21, -11], [-11, -9], [-11, -5.6], [-21, -7.6]], '#2E7D4F', K.contorno, .3);
  g.save(); g.translate(-16, -8); g.transform(1, .2, 0, 1, 0, 0); g.fillStyle = '#F4F1E8'; g.font = 'bold 1.5px sans-serif'; g.textAlign = 'center'; g.fillText('ARMENIA', 0, 0); g.restore();
}
// Parque Natural de Los Nevados: el nevado con su glaciar al fondo, la laguna, frailejones, la cabaña de los
// guardaparques y el letrero de madera.
function parqueNevados(g) {
  const R = mulberry(53);
  sombraPie(g, 0, 2, 38, 10, .16);
  rellena(g, [[-40, 0], [-22, -22], [-8, -34], [4, -36], [18, -26], [40, 0]], '#7E7468', null); // el volcán
  rellena(g, [[-40, 0], [-22, -22], [-8, -34], [4, -36], [-2, -10], [-18, 0]], '#9A9084', null);
  rellena(g, [[-14, -27], [-8, -34], [4, -36], [12, -30], [6, -27], [0, -29], [-6, -25]], '#F4F6F8', 'rgba(150,170,190,.6)'); // glaciar
  rellena(g, [[4, -36], [12, -30], [6, -27], [2, -31]], '#C8D4DE', null);
  { g.fillStyle = '#4E7FA0'; g.beginPath(); g.ellipse(-12, -2, 11, 3.4, 0, 0, 7); g.fill(); g.fillStyle = 'rgba(200,225,240,.5)'; g.beginPath(); g.ellipse(-14, -2.6, 5, 1, 0, 0, 7); g.fill(); } // laguna
  for (let k = 0; k < 14; k++) { // frailejones: tronco peludo y roseta de hojas plateadas
    const x = -32 + R() * 64, y = -1 + R() * 6; if (Math.abs(x + 12) < 11 && y < 2) continue;
    const h = 3 + R() * 3; g.fillStyle = '#6E5A3E'; g.fillRect(x - .6, y - h, 1.2, h); for (let q = 0; q < 9; q++) hojaP(g, x, y - h, -Math.PI / 2 + (q - 4) * .38, 2.2, .7, q % 2 ? '#A8B48A' : '#C4CCA4', false);
  }
  // Cabaña de los guardaparques.
  const F = caras(.18, .14, 6, .26, .3); sombraCasa(g, F); muros(g, F, '#8A5A36', null); puerta(g, F, 'izq', .5, .3, 4.4, '#4A2E1C', false); dosAguas(g, F, 3.4, { teja: '#5E646C', luz: '#747A82', osc: '#454A52', tipo: 'lamina' });
  { const a = P(.4, -.3); cajaPx(g, a[0], a[1], .02, .02, 4.4, K.maderaOsc, { borde: null }); cajaPx(g, a[0] + 3, a[1] + 1.5, .02, .02, 4.4, K.maderaOsc, { borde: null }); rellena(g, [[a[0] - 1, a[1] - 7.6], [a[0] + 4.4, a[1] - 5], [a[0] + 4.4, a[1] - 2.6], [a[0] - 1, a[1] - 5.2]], '#8A5A36', K.contorno, .3); g.save(); g.translate(a[0] + 1.7, a[1] - 4.6); g.transform(1, .48, 0, 1, 0, 0); g.fillStyle = '#F4E8C8'; g.font = 'bold 1.1px Georgia, serif'; g.textAlign = 'center'; g.fillText('LOS NEVADOS', 0, 0); g.restore(); }
}
// Monumento a las víctimas: obelisco de piedra en su pedestal de gradas, placa de bronce con los nombres, flores,
// velas y una corona.
function monumentoVictimas(g) {
  sombraPie(g, 2, 1, 9, 3, .24);
  for (const [lc, h, z] of [[.3, 1.2, 0], [.22, 1.2, 1.2], [.16, 3.6, 2.4]]) { const t = cajaPx(g, 0, 0, lc, lc, h, '#B4AC9C', { z0: z, izq: '#C8C0B0', top: '#D4CCBC' }); void t; }
  { const a = P(.08, -.05, 2.9), b = P(.08, .05, 2.9); rellena(g, [a, b, [b[0], b[1] - 2.4], [a[0], a[1] - 2.4]], '#A07A3A', 'rgba(60,40,20,.6)', .3); g.strokeStyle = 'rgba(255,230,160,.6)'; g.lineWidth = .2; for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(a[0] + .4, a[1] - .7 - k * .6); g.lineTo(b[0] - .4, b[1] - .7 - k * .6); g.stroke(); } } // placa con los nombres
  // Obelisco de cuatro caras que se adelgaza, con punta.
  const base = 6, alto = 34, w0 = 2.6, w1 = 1.4;
  rellena(g, [[-w0, -base], [0, -base + w0 * .5], [0, -alto + w1 * .5], [-w1, -alto]], '#D8D0C0', 'rgba(60,50,40,.4)', .3);
  rellena(g, [[0, -base + w0 * .5], [w0, -base], [w1, -alto], [0, -alto + w1 * .5]], '#ABA394', 'rgba(60,50,40,.4)', .3);
  rellena(g, [[-w1, -alto], [0, -alto + w1 * .5], [w1, -alto], [0, -alto - 3]], '#E4DCCC', 'rgba(60,50,40,.4)', .3);
  g.strokeStyle = 'rgba(80,70,60,.35)'; g.lineWidth = .25; for (let k = 1; k < 9; k++) { const y = -base - k * 3.2, w = w0 + (w1 - w0) * (k * 3.2) / (alto - base); g.beginPath(); g.moveTo(-w, y); g.lineTo(0, y + w * .5); g.lineTo(w, y); g.stroke(); } // hiladas
  // Corona de flores, velas y flores sueltas al pie.
  { const p = P(.2, .1); g.strokeStyle = '#3E6B3A'; g.lineWidth = 1.2; g.beginPath(); g.ellipse(p[0], p[1] - 3, 2.2, 2.4, 0, 0, 7); g.stroke(); for (let k = 0; k < 8; k++) { const t = k / 8 * Math.PI * 2; g.fillStyle = k % 2 ? '#F4EFE4' : '#D8433A'; g.beginPath(); g.arc(p[0] + Math.cos(t) * 2.2, p[1] - 3 + Math.sin(t) * 2.4, .55, 0, 7); g.fill(); } }
  for (const [r, c] of [[.22, -.12], [.26, -.02], [.2, .22]]) { const p = P(r, c); cilindroV(g, p[0], p[1], .5, 2.2, '#F4EFE4', { tapa: '#E8E0CC' }); g.fillStyle = '#FFB040'; g.beginPath(); g.ellipse(p[0], p[1] - 3, .35, .7, 0, 0, 7); g.fill(); } // velas
}
// Mojón del tratado: piedra labrada en la raya con la placa del tratado y las banderas de las dos partes.
function mojonTratado(g) {
  sombraPie(g, 1, 1, 6, 2, .24);
  cajaPx(g, 0, 0, .14, .14, 1, '#A39A88', { izq: '#B4AC9C', top: '#C2BAAA' });
  const M = cajaPx(g, 0, 0, .08, .08, 8, '#C8C0B0', { z0: 1, izq: '#D8D0C0', top: '#E0D8C8' });
  rellena(g, [[M.izq[0][0] + .5, M.izq[0][1] - 4], [M.izq[1][0] - .5, M.izq[1][1] - 4], [M.izq[1][0] - .5, M.izq[1][1] - 7], [M.izq[0][0] + .5, M.izq[0][1] - 7]], '#A07A3A', 'rgba(60,40,20,.6)', .3);
  bandera(g, ...P(.1, -.24), 15, TRICOLOR, 6); bandera(g, ...P(-.06, .22), 15, ['#F4F1E8', '#3E6B4A'], 6);
}
// Estación del ferrocarril: edificio de dos pisos con alero sobre el andén, el reloj, el letrero, bancas, bultos y
// los rieles con sus durmientes.
function estacionTren(g) {
  { const a = P(.46, -.5), b = P(.46, .5); g.strokeStyle = '#6E5236'; g.lineWidth = 1.4; for (let k = 0; k <= 12; k++) { const p = P(.46, -.5 + k / 12, 0); g.beginPath(); g.moveTo(p[0] - 2.4, p[1] - 1.2); g.lineTo(p[0] + 2.4, p[1] + 1.2); g.stroke(); } for (const d of [-.05, .05]) { const p = P(.46 + d, -.5), q = P(.46 + d, .5); g.strokeStyle = '#6A6E74'; g.lineWidth = .6; g.beginPath(); g.moveTo(...p); g.lineTo(...q); g.stroke(); } void a; void b; } // rieles
  { const a = P(.3, -.42), b = P(.3, .42), c = P(.38, .42), d = P(.38, -.42); rellena(g, [a, b, c, d], '#B4AC9C', 'rgba(60,50,40,.4)', .3); } // andén
  const F = caras(.6, .3, 16, -.06); sombraCasa(g, F); muros(g, F, '#EAD9A8', '#8E2F22');
  for (const u of [.15, .35, .65, .85]) { ventana(g, F, 'izq', u, 3, .08, 6, '#8E2F22'); ventana(g, F, 'izq', u, 10.4, .08, 4.4, '#8E2F22'); }
  puerta(g, F, 'izq', .5, .1, 7.6, '#5A3A22', true);
  dosAguas(g, F, 6, { sale: .12 });
  for (const c of [-.25, 0, .25]) { const p = P(F.f + .14, c); cajaPx(g, p[0], p[1], .015, .015, 8, K.madera, { borde: null }); } // pies del alero
  // El reloj y el letrero van en el costado (cara der), que el alero no tapa.
  { const t = F.en('der', .5, 12); g.fillStyle = '#F4F1E8'; g.beginPath(); g.arc(t[0], t[1] - 1.4, 1.6, 0, 7); g.fill(); g.strokeStyle = '#3A2A1E'; g.lineWidth = .3; g.stroke(); g.beginPath(); g.moveTo(t[0], t[1] - 1.4); g.lineTo(t[0], t[1] - 2.6); g.moveTo(t[0], t[1] - 1.4); g.lineTo(t[0] + .8, t[1] - 1.2); g.stroke(); } // reloj
  { const q = [F.en('der', .12, 6.4), F.en('der', .88, 6.4), F.en('der', .88, 9), F.en('der', .12, 9)]; rellena(g, q, '#3E6B4A', K.contorno, .3); g.save(); const m = [(q[0][0] + q[2][0]) / 2, (q[0][1] + q[2][1]) / 2]; g.translate(m[0], m[1]); g.transform(1, (q[1][1] - q[0][1]) / (q[1][0] - q[0][0]), 0, 1, 0, 0); g.fillStyle = '#F4F1E8'; g.font = 'bold 1.6px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('ESTACIÓN', 0, 0); g.restore(); }
  bancoMadera(g, ...P(.32, -.22)); { const p = P(.34, .28); for (const [dx, col] of [[0, '#C9B48A'], [2.2, '#BFA87C']]) { g.fillStyle = col; g.beginPath(); g.ellipse(p[0] + dx, p[1] - 1.6, 1.7, 1.4, 0, 0, 7); g.fill(); } } // bultos esperando el tren
}
// Aeropuerto: pista de asfalto con sus marcas, la torre de control con su cabina de vidrio, el hangar de lámina y la
// manga de viento.
function aeropuerto(g) {
  const a = P(.3, -.5), b = P(.3, .5), c = P(.02, .5), d = P(.02, -.5); rellena(g, [a, b, c, d], '#4A4E52', null);
  g.strokeStyle = '#F4F1E8'; g.lineWidth = .7; g.setLineDash([3, 2.4]); g.beginPath(); g.moveTo(...P(.16, -.46)); g.lineTo(...P(.16, .46)); g.stroke(); g.setLineDash([]);
  for (let k = 0; k < 4; k++) { const p = P(.06 + k * .065, -.44), q = P(.06 + k * .065, -.36); g.strokeStyle = '#F4F1E8'; g.lineWidth = .9; g.beginPath(); g.moveTo(...p); g.lineTo(...q); g.stroke(); } // cebra de la cabecera
  // Hangar de lámina en arco.
  const H = caras(.32, .22, 6, -.28, -.2); sombraCasa(g, H); muros(g, H, '#B8BCC0', null); hueco(g, H, 'izq', .15, .85, 0, 5, '#3A3E42');
  { const top = H.z0 + H.H; g.beginPath(); g.moveTo(...P(H.f, H.a, top)); for (let k = 0; k <= 10; k++) { const r = H.f + (H.t - H.f) * k / 10; g.lineTo(...P(r, H.a, top + Math.sin(k / 10 * Math.PI) * 4)); } g.lineTo(...P(H.t, H.b, top)); for (let k = 10; k >= 0; k--) { const r = H.f + (H.t - H.f) * k / 10; g.lineTo(...P(r, H.b, top + Math.sin(k / 10 * Math.PI) * 4)); } g.closePath(); g.fillStyle = '#C8CCD0'; g.fill(); g.strokeStyle = 'rgba(60,64,70,.6)'; g.lineWidth = .3; g.stroke(); }
  // Torre de control.
  const T = caras(.08, .08, 16, -.3, .3); sombraCasa(g, T); muros(g, T, '#E8E4D8', null);
  const V = caras(.12, .12, 3.6, -.3, .3, 16); rellena(g, V.izq, 'rgba(150,200,220,.85)', 'rgba(30,40,50,.6)', .3); rellena(g, V.der, 'rgba(110,160,190,.85)', 'rgba(30,40,50,.6)', .3); capturarQuad(g, V.izq);
  techoPlano(g, V, '#D8D4C8'); { const c = P(-.3, .3, V.z0 + V.H); g.strokeStyle = '#6A6E74'; g.lineWidth = .4; g.beginPath(); g.moveTo(c[0], c[1]); g.lineTo(c[0], c[1] - 5); g.stroke(); g.fillStyle = '#C8283A'; g.beginPath(); g.arc(c[0], c[1] - 5, .5, 0, 7); g.fill(); } // antena con su luz roja
  // Manga de viento.
  { const p = P(-.02, .44); cajaPx(g, p[0], p[1], .01, .01, 8, '#8A8E92', { borde: null }); for (let k = 0; k < 4; k++) { g.fillStyle = k % 2 ? '#F4F1E8' : '#E86A2A'; g.beginPath(); g.moveTo(p[0] + k * 1.4, p[1] - 8 + k * .15); g.lineTo(p[0] + (k + 1) * 1.4, p[1] - 7.8 + (k + 1) * .2); g.lineTo(p[0] + (k + 1) * 1.4, p[1] - 6.8 + (k + 1) * .1); g.lineTo(p[0] + k * 1.4, p[1] - 6.4); g.closePath(); g.fill(); } }
}

export function recetasPublicos(e = 1, h = [0, 1, 2, 5][e]) {
  const L = [
    ['escuela', 96, 96, 48, 68, escuela6],
    ['hospital', 104, 112, 52, 82, hospital6],
    ['taller', 84, 82, 42, 60, taller6],
    ['recaudo', 84, 84, 42, 62, recaudo6],
    ['biblioteca', 120, 116, 60, 84, biblioteca6],
    ['teatro', 138, 122, 69, 92, teatroN],
    ['cancha', 108, 90, 54, 60, cancha6], ['cementerio', 96, 66, 48, 40, cementerio6],
    ['policia', 88, 92, 44, 70, policia6],
    ['cuartel', 136, 124, 68, 92, cuartel6],
    ['banco', 124, 140, 62, 108, banco6],
    ['universidad', 108, 120, 54, 88, universidad6],
    ['acueducto', 92, 72, 46, 48, acueducto6],
    ['plaza0', 100, 80, 50, 56, g => plazaN(g, 0)], ['plaza1', 100, 82, 50, 58, g => plazaN(g, 1)], ['plaza2', 100, 84, 50, 60, g => plazaN(g, 2)], ['plaza3', 100, 90, 50, 66, g => plazaN(g, 3)],
    ['estadio', 148, 124, 74, 94, estadioN],
    ['m_museo', 104, 104, 52, 76, g => museoN(g)],
    ['m_mv_jardin', 100, 96, 50, 64, jardinBotanico], ['m_mv_conservatorio', 100, 110, 50, 78, conservatorio], ['m_mv_tunel', 100, 70, 50, 52, tunel], ['m_mv_parque', 100, 76, 50, 58, parqueNevados],
    ['m_monumento', 40, 70, 20, 56, monumentoVictimas], ['m_tratado', 40, 50, 20, 38, mojonTratado], ['m_ferrocarril', 96, 82, 48, 56, estacionTren], ['m_aeropuerto', 100, 72, 50, 44, aeropuerto],
    ['m_dique', 76, 52, 38, 34, dique], ['m_reservorio', 72, 52, 36, 30, reservorio], ['m_tanques', 70, 56, 35, 36, tanques],
    ['m_granero', 64, 70, 32, 50, granero], ['m_cooperativa', 84, 86, 42, 60, cooperativa], ['m_escuelita', 80, 88, 40, 62, escuelita],
    ['m_parcela', 72, 60, 36, 38, parcela], ['m_reten', 64, 56, 32, 38, reten], ['m_campamento', 64, 50, 32, 34, campamento],
    ['m_cruz', 40, 54, 20, 44, g => cruzCamino(g)], ['muroFotos', 56, 50, 28, 34, g => muroFotos(g)],
    ['m_represa', 100, 70, 50, 46, represa], ['m_megaobra', 84, 104, 42, 70, megaobra], ['m_automatizacion', 84, 70, 42, 48, automatizacion],
    ['m_electricidad', 76, 76, 38, 52, electricidad], ['m_imprenta', 72, 66, 36, 46, imprenta], ['m_asentamiento', 72, 56, 36, 38, asentamiento],
    ['m_olla', 60, 52, 30, 36, olla], ['m_mural', 70, 56, 35, 38, mural], ['sabana', 44, 24, 22, 13, g => sabana(g)], ['impactos', 26, 20, 13, 10, g => impactos(g)], ['mesaPaz', 60, 60, 30, 40, g => mesaPaz(g)],
    ['molino', 96, 92, 48, 66, molino6],
    ['aserradero', 96, 86, 48, 60, aserradero6],
    ['cantera', 104, 96, 52, 68, canteraN],
    ['estudio', 84, 90, 42, 62, estudio6],
    ['puerto', 96, 80, 48, 56, puerto6], ['mina', 96, 78, 48, 56, mina6],
    ['sede-republica', 104, 104, 52, 72, cabildo],
    ['sede-monarquia', 104, 112, 52, 78, palacio],
    ['sede-aristocracia', 104, 100, 52, 72, casona],
    ['sede-tirania', 100, 104, 50, 76, fortaleza],
    ['sede-oligarquia', 100, 100, 50, 70, comercio],
    ['sede-demagogia', 100, 96, 50, 66, tribuna],
    ['mercado0', 104, 100, 52, 74, (g, e, h) => { mercadoToldos(g, [0, 1, 2, 3, 3, 3][h], false); vidaMercado(g, [0, 1, 2, 3, 3, 3][h], false); }], ['mercado0v', 90, 76, 45, 52, (g, e, h) => mercadoToldos(g, [0, 1, 2, 3, 3, 3][h], true)],
    ['mercado2', 112, 110, 56, 76, (g, e, h) => { mercado2_6(g, e, h, false); if (h !== 3 && h !== 5) vidaMercado(g, [0, 1, 2, 3, 3, 3][h], true); }], ['mercado2v', 100, 96, 50, 68, (g, e, h) => mercado2_6(g, e, h, true)]
  ].map(([k, w, alto, ax, ay, f]) => [k, w, alto, ax, ay, g => f(g, e, h)]);
  // La iglesia: capilla de bahareque, iglesia colonial con espadaña, templo de dos torres y templo restaurado.
  return [...L, ...[0, 1, 2, 3].map(k => ['iglesia' + k, 110, 130, 55, 96, g => iglesiaEpoca(g, k)])];
}

// Para la portada: la iglesia y el cabildo pintados fuera del mapa.
export { iglesiaEpoca, cabildo };
