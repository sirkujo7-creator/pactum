// Casas coloniales (renovación colonial, 6 de octubre), tomadas de la prueba aprobada pruebas/colonial.html.
// Pedido de Juan: diferenciar al máximo. Cuatro variantes con silueta propia, cada una con su elemento vivo:
//   0. casa de corredor: alero largo sobre pilares de madera, con materas de flores y un banco;
//   1. casa esquinera: techo de cuatro aguas y puerta en la esquina, con ropa tendida al lado;
//   2. casa de zaguán: larga, con portón de arco, y un caballo ensillado amarrado a su poste;
//   3. casa con solar: tapia baja con su portón, plátanos asomando y una carreta de madera.
// Y cuatro épocas de fachada: bahareque (un piso, cal sobre caña y barro), tapia con balcón (dos pisos), ladrillo
// y concreto (terraza plana con tanque). Cada casa se hornea también "húmeda" (sufijo h): manchas de humedad que
// suben desde el zócalo, chorreones bajo el alero y la cal caída que deja ver el bahareque o el ladrillo; el mapa
// la usa cuando la obra está gastada. Dibujo por capas: sombra, estructura, techo, elementos vivos al frente.
import { mulberry } from './fresco.js';

const TW = 64, TH = 32;
const P = (r, c, z = 0) => [(c - r) * TW / 2, (c + r) * TH / 2 - z];
const K = {
  cal: '#F4EEE2', calSombra: '#D9CFBD', calOscura: '#BFB3A0',
  teja: '#B9552F', tejaLuz: '#CF6A3F', tejaSombra: '#8C3B22', tejaLinea: '#7A3220',
  madera: '#6E4529', maderaLuz: '#8A5A36', maderaOsc: '#4A2D1A',
  ladrillo: '#B5654A', ladrilloOsc: '#97503A', concreto: ['#E8DCC4', '#D6E0D8', '#EAD3C6', '#DCD8E6'],
  contorno: 'rgba(70,45,30,.55)'
};
// Por variante: zócalo y carpintería (puertas, ventanas, balcones), como en los pueblos del Tolima.
const ZOCALO = ['#2F5D8A', '#3E6B4A', '#8E2F22', '#B07A2A'], CARPINTERIA = ['#3E6B4A', '#8E2F22', '#2F5D8A', '#6E4529'];

const mezcla = (a, b, t) => { const h = s => [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16)); const A = h(a), B = h(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
function poli(g, pts) { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); }
function rellena(g, pts, col, borde = K.contorno, w = .6) { poli(g, pts); g.fillStyle = col; g.fill(); if (borde) { g.strokeStyle = borde; g.lineWidth = w; g.lineJoin = 'round'; g.stroke(); } }
function grad(g, x0, y0, x1, y1, stops) { const gr = g.createLinearGradient(x0, y0, x1, y1); stops.forEach(([p, c]) => gr.addColorStop(p, c)); return gr; }

// Caja: footprint w (a lo largo de c) × d (a lo largo de r), alto H; centrada en (0, 0) o en (r0, c0).
function caras(w, d, H, r0 = 0, c0 = 0, z0 = 0) {
  const a = c0 - w / 2, b = c0 + w / 2, f = r0 + d / 2, t = r0 - d / 2;
  return {
    a, b, f, t, H, z0,
    izq: [P(f, a, z0), P(f, b, z0), P(f, b, z0 + H), P(f, a, z0 + H)],
    der: [P(f, b, z0), P(t, b, z0), P(t, b, z0 + H), P(f, b, z0 + H)],
    en: (cara, u, z) => cara === 'izq' ? P(f, a + (b - a) * u, z0 + z) : P(f + (t - f) * u, b, z0 + z)
  };
}
// Muros con luz de la tarde (fachada clara, costado en sombra) y zócalo de color.
function muros(g, F, col, zocalo, op = {}) {
  const [p0, , , p3] = F.izq, [q0, , , q3] = F.der;
  rellena(g, F.izq, grad(g, 0, p0[1], 0, p3[1], [[0, mezcla(col, '#000000', .1)], [.25, col], [1, col]]));
  rellena(g, F.der, grad(g, 0, q0[1], 0, q3[1], [[0, mezcla(col, '#000000', .24)], [.3, mezcla(col, '#000000', .14)], [1, mezcla(col, '#000000', .14)]]));
  if (op.ladrillo) hiladas(g, F);
  if (zocalo) {
    const zh = Math.min(5, F.H * .2);
    rellena(g, [F.en('izq', 0, 0), F.en('izq', 1, 0), F.en('izq', 1, zh), F.en('izq', 0, zh)], zocalo, null);
    rellena(g, [F.en('der', 0, 0), F.en('der', 1, 0), F.en('der', 1, zh), F.en('der', 0, zh)], mezcla(zocalo, '#000000', .25), null);
  }
}
// Hiladas de ladrillo: líneas horizontales y llagas alternadas.
function hiladas(g, F) {
  g.save(); g.strokeStyle = 'rgba(90,40,25,.35)'; g.lineWidth = .35;
  for (const cara of ['izq', 'der']) {
    for (let z = 2; z < F.H; z += 2) { const a = F.en(cara, 0, z), b = F.en(cara, 1, z); g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); }
    for (let z = 0, k = 0; z < F.H; z += 2, k++) for (let u = (k % 2) * .06; u < 1; u += .12) { const a = F.en(cara, u, z), b = F.en(cara, u, z + 2); g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); }
  }
  g.restore();
}
function hueco(g, F, cara, u0, u1, z0, z1, col, arco = false) {
  const pts = [F.en(cara, u0, z0), F.en(cara, u1, z0), F.en(cara, u1, z1), F.en(cara, u0, z1)];
  if (arco) { const m = F.en(cara, (u0 + u1) / 2, z1 + (z1 - z0) * .28); g.beginPath(); g.moveTo(...pts[0]); g.lineTo(...pts[1]); g.lineTo(...pts[2]); g.quadraticCurveTo(m[0], m[1], ...pts[3]); g.closePath(); g.fillStyle = col; g.fill(); g.strokeStyle = K.contorno; g.lineWidth = .5; g.stroke(); return; }
  rellena(g, pts, col, K.contorno, .5);
}
function ventana(g, F, cara, u, z, ancho, alto, color, op = {}) {
  if (op.marco) hueco(g, F, cara, u - ancho / 2 - .02, u + ancho / 2 + .02, z - .8, z + alto + .8, op.marco);
  hueco(g, F, cara, u - ancho / 2, u + ancho / 2, z, z + alto, op.vidrio || '#3A2A1E');
  if (op.postigos !== false) { hueco(g, F, cara, u - ancho / 2 - ancho * .45, u - ancho / 2, z, z + alto, color); hueco(g, F, cara, u + ancho / 2, u + ancho / 2 + ancho * .45, z, z + alto, color); }
  g.strokeStyle = op.vidrio ? 'rgba(255,255,255,.55)' : 'rgba(30,20,15,.7)'; g.lineWidth = .4;
  for (let k = 1; k < (op.vidrio ? 2 : 4); k++) { const a = F.en(cara, u - ancho / 2 + ancho * k / (op.vidrio ? 2 : 4), z), b = F.en(cara, u - ancho / 2 + ancho * k / (op.vidrio ? 2 : 4), z + alto); g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); }
}
function puerta(g, F, cara, u, ancho, alto, color, arco = true) {
  hueco(g, F, cara, u - ancho / 2, u + ancho / 2, 0, alto, color, arco);
  const a = F.en(cara, u, 0), b = F.en(cara, u, alto); g.strokeStyle = 'rgba(30,20,15,.5)'; g.lineWidth = .4; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke();
  g.fillStyle = '#C9A24A'; const m = F.en(cara, u + ancho * .3, alto * .45); g.beginPath(); g.arc(m[0], m[1], .45, 0, 7); g.fill();
}
// Balcón de madera volado en la fachada (de u0 a u1, a la altura z).
function balcon(g, F, u0, u1, z, sal, col) {
  const f = F.f, a = F.a + (F.b - F.a) * u0, b = F.a + (F.b - F.a) * u1, z0 = F.z0 + z;
  rellena(g, [P(f, a, z0), P(f, b, z0), P(f + sal, b, z0), P(f + sal, a, z0)], K.maderaOsc);
  rellena(g, [P(f + sal, a, z0), P(f + sal, b, z0), P(f + sal, b, z0 - 1.2), P(f + sal, a, z0 - 1.2)], K.madera);
  g.strokeStyle = col || K.maderaLuz; g.lineWidth = .55;
  const n = Math.max(4, Math.round((b - a) * 22));
  for (let k = 0; k <= n; k++) { const c = a + (b - a) * k / n, p = P(f + sal, c, z0), q = P(f + sal, c, z0 + 5); g.beginPath(); g.moveTo(...p); g.lineTo(...q); g.stroke(); }
  g.strokeStyle = K.maderaOsc; g.lineWidth = 1; g.beginPath(); g.moveTo(...P(f + sal, a, z0 + 5)); g.lineTo(...P(f + sal, b, z0 + 5)); g.stroke();
  g.lineWidth = .7; for (let k = 0; k <= 3; k++) { const c = a + (b - a) * k / 3; g.beginPath(); g.moveTo(...P(f, c, z0 - 2)); g.lineTo(...P(f + sal, c, z0 - 1.2)); g.stroke(); }
}
function tejas(g, en, n, linea = K.tejaLinea) {
  g.save(); g.strokeStyle = linea; g.globalAlpha = .55; g.lineWidth = .45;
  for (let k = 1; k < n; k++) { const u = k / n; g.beginPath(); g.moveTo(...en(u, 0)); g.lineTo(...en(u, 1)); g.stroke(); }
  g.globalAlpha = .3;
  for (let j = 1; j < 5; j++) { const v = j / 5; g.beginPath(); for (let k = 0; k <= n; k++) { const p = en(k / n, v); k ? g.lineTo(p[0], p[1] + (k % 2 ? .5 : 0)) : g.moveTo(...p); } g.stroke(); }
  g.restore();
}
// Techo de teja a dos aguas, cumbrera a lo largo de c. sale: cuánto avanza el alero del frente (corredor).
function dosAguas(g, F, rh, op = {}) {
  const o = .08, sale = op.sale || 0, a = F.a - o, b = F.b + o, f = F.f + o + sale, t = F.t - o, m = (F.f + F.t) / 2, H = F.z0 + F.H;
  const teja = op.teja || K.teja, luz = op.luz || K.tejaLuz, osc = op.osc || K.tejaSombra;
  rellena(g, [P(F.f, F.b, H), P(F.t, F.b, H), P(m, F.b, H + rh * .92)], op.hastial || K.calSombra);
  rellena(g, [P(m, a, H + rh), P(m, b, H + rh), P(t, b, H), P(t, a, H)], osc);
  const zf = H - (sale ? rh * sale / (F.f - m + o) : 0), faldon = [P(f, a, zf), P(f, b, zf), P(m, b, H + rh), P(m, a, H + rh)];
  rellena(g, faldon, grad(g, 0, faldon[0][1], 0, faldon[3][1], [[0, teja], [1, luz]]));
  tejas(g, (u, v) => P(f + (m - f) * v, a + (b - a) * u, zf + (H + rh - zf) * v), Math.round((b - a) * 9), op.linea);
  rellena(g, [P(m + .02, a, H + rh + .8), P(m + .02, b, H + rh + .8), P(m - .02, b, H + rh - .4), P(m - .02, a, H + rh - .4)], osc, null);
  return zf;
}
// Techo de cuatro aguas (casa esquinera): cumbrera corta en el centro.
function cuatroAguas(g, F, rh, op = {}) {
  const o = .08, a = F.a - o, b = F.b + o, f = F.f + o, t = F.t - o, m = (F.f + F.t) / 2, H = F.z0 + F.H, k = (b - a) * .28;
  const teja = op.teja || K.teja, luz = op.luz || K.tejaLuz, osc = op.osc || K.tejaSombra;
  const A = P(m, a + k, H + rh), B = P(m, b - k, H + rh);
  rellena(g, [P(t, a, H), P(t, b, H), B, A], osc);
  const frente = [P(f, a, H), P(f, b, H), B, A];
  rellena(g, frente, grad(g, 0, frente[0][1], 0, A[1], [[0, teja], [1, luz]]));
  tejas(g, (u, v) => { const c0 = a + (a + k - a) * v, c1 = b + (b - k - b) * v; return P(f + (m - f) * v, c0 + (c1 - c0) * u, H + rh * v); }, Math.round((b - a) * 9));
  const lado = [P(f, b, H), P(t, b, H), B];
  rellena(g, lado, grad(g, lado[0][0], 0, lado[1][0], 0, [[0, osc], [1, teja]]));
  tejas(g, (u, v) => { const r0 = f + (t - f) * u; return P(r0 + (m - r0) * v, b + (b - k - b) * v, H + rh * v); }, Math.round((f - t) * 9));
  g.strokeStyle = osc; g.lineWidth = 1; g.beginPath(); g.moveTo(...A); g.lineTo(...B); g.stroke();
}
// Terraza plana de concreto con pretil y tanque de agua.
function terraza(g, F, col) {
  const H = F.z0 + F.H, a = F.a, b = F.b, f = F.f, t = F.t;
  rellena(g, [P(f, a, H), P(f, b, H), P(t, b, H), P(t, a, H)], mezcla(col, '#000000', .06));
  rellena(g, [P(f, a, H), P(f, b, H), P(f, b, H + 2), P(f, a, H + 2)], mezcla(col, '#FFFFFF', .2));
  rellena(g, [P(f, b, H), P(t, b, H), P(t, b, H + 2), P(f, b, H + 2)], mezcla(col, '#000000', .1));
  const q = P(t + .14, b - .16, H + 2); rellena(g, [[q[0] - 4, q[1]], [q[0] + 4, q[1]], [q[0] + 4, q[1] - 6], [q[0] - 4, q[1] - 6]], '#3A4A5A'); g.fillStyle = '#4E6070'; g.beginPath(); g.ellipse(q[0], q[1] - 6, 4, 1.5, 0, 0, 7); g.fill();
  const an = P(t + .14, a + .14, H + 2); g.strokeStyle = '#4A4A4A'; g.lineWidth = .6; g.beginPath(); g.moveTo(an[0], an[1]); g.lineTo(an[0], an[1] - 9); g.moveTo(an[0] - 3, an[1] - 7); g.lineTo(an[0] + 3, an[1] - 7); g.stroke();
}
function sombraCasa(g, F) {
  g.save(); g.globalAlpha = .22; g.fillStyle = '#3A2A1C';
  poli(g, [P(F.f, F.a), P(F.f + .22, F.a + .4), P(F.f + .22, F.b + .4), P(F.t + .3, F.b + .4), P(F.t, F.b)]); g.fill(); g.restore();
}
// Humedad: manchas oscuras que suben del suelo, chorreones bajo el alero y cal caída (deja ver el bahareque).
function humedad(g, F, R, base) {
  for (const cara of ['izq', 'der']) {
    g.save(); poli(g, F[cara]); g.clip();
    const p0 = F.en(cara, 0, 0), p1 = F.en(cara, 1, 0), alto = F.H;
    for (let k = 0; k < 7; k++) {
      const u = R(), p = F.en(cara, u, 0), rr = 3 + R() * 4, h = alto * (.18 + R() * .25);
      const gr = g.createLinearGradient(0, p[1], 0, p[1] - h); gr.addColorStop(0, 'rgba(70,72,50,.5)'); gr.addColorStop(1, 'rgba(70,72,50,0)');
      g.fillStyle = gr; g.beginPath(); g.ellipse(p[0], p[1] - h / 2, rr, h / 2 + 1, 0, 0, 7); g.fill();
    }
    g.strokeStyle = 'rgba(80,70,50,.28)'; g.lineWidth = 1.1; g.lineCap = 'round';
    for (let k = 0; k < 5; k++) { const u = .05 + R() * .9, a = F.en(cara, u, alto), L = alto * (.2 + R() * .35); g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo(a[0] + (R() - .5) * 1.5, a[1] + L / 2, a[0] + (R() - .5), a[1] + L); g.stroke(); }
    for (let k = 0; k < 2; k++) {
      const u = .1 + R() * .75, z = alto * (.3 + R() * .45), c = F.en(cara, u, z);
      g.fillStyle = base; g.beginPath(); g.ellipse(c[0], c[1], 2.4 + R() * 1.6, 1.4 + R(), R() * .6, 0, 7); g.fill();
      g.strokeStyle = 'rgba(70,45,30,.45)'; g.lineWidth = .3; g.stroke();
      g.strokeStyle = 'rgba(90,60,35,.5)'; g.lineWidth = .3; for (let j = -2; j <= 2; j++) { g.beginPath(); g.moveTo(c[0] - 2.4, c[1] + j * .55); g.lineTo(c[0] + 2.4, c[1] + j * .55); g.stroke(); }
    }
    g.restore();
  }
  void base;
}

// ---------- Elementos vivos ----------
function materas(g, pts) {
  for (const [x, y] of pts) {
    rellena(g, [[x - 1.6, y], [x + 1.6, y], [x + 2, y - 2.6], [x - 2, y - 2.6]], '#B4593A', 'rgba(70,40,25,.5)', .3);
    for (let k = 0; k < 5; k++) { g.fillStyle = k % 2 ? '#4E7A3A' : '#5E8B42'; g.beginPath(); g.ellipse(x + (k - 2) * .8, y - 3.4 - (k % 2), 1.1, .8, 0, 0, 7); g.fill(); }
    for (let k = 0; k < 3; k++) { g.fillStyle = ['#D8433A', '#E7B23C', '#C2407A'][k]; g.beginPath(); g.arc(x + (k - 1) * 1.1, y - 4.4, .55, 0, 7); g.fill(); }
  }
}
function banco(g, x, y) { rellena(g, [[x - 4, y - 2.4], [x + 4, y - .4], [x + 4, y - 1.2], [x - 4, y - 3.2]], K.madera, K.contorno, .3); g.strokeStyle = K.maderaOsc; g.lineWidth = .6; for (const dx of [-3.4, 3.4]) { g.beginPath(); g.moveTo(x + dx, y - 2.2 + dx * .25); g.lineTo(x + dx, y + dx * .25); g.stroke(); } }
function ropaTendida(g, a, b, R) {
  g.strokeStyle = K.maderaOsc; g.lineWidth = .8; for (const p of [a, b]) { g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(p[0], p[1] - 11); g.stroke(); }
  g.strokeStyle = 'rgba(60,50,40,.7)'; g.lineWidth = .3; g.beginPath(); g.moveTo(a[0], a[1] - 10.5); g.quadraticCurveTo((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - 8.5, b[0], b[1] - 10.5); g.stroke();
  const cols = ['#F4EFE4', '#B23A2E', '#2F6E8E', '#E7C76B', '#F4EFE4'];
  for (let k = 0; k < 4; k++) {
    const f = (k + .7) / 5, x = a[0] + (b[0] - a[0]) * f, y = a[1] + (b[1] - a[1]) * f - 10.3 + Math.sin(f * Math.PI) * 2, w = 1.6 + R() * .8, h = 2.6 + R() * 1.6;
    rellena(g, [[x - w, y], [x + w, y + (b[1] - a[1]) / (b[0] - a[0]) * w * 2], [x + w, y + h + (b[1] - a[1]) / (b[0] - a[0]) * w * 2], [x - w, y + h]], cols[k], 'rgba(70,45,30,.4)', .25);
  }
}
function caballo(g, x, y) {
  // Poste de amarrar y caballo ensillado, de lado, mirando a la izquierda.
  g.strokeStyle = K.maderaOsc; g.lineWidth = 1.1; g.beginPath(); g.moveTo(x - 9, y); g.lineTo(x - 9, y - 8); g.stroke();
  g.save(); g.translate(x, y); g.scale(-.55, .55);
  const col = '#7A4A2A', osc = '#4E2E1A';
  g.globalAlpha = .25; g.fillStyle = '#2A2A1E'; g.beginPath(); g.ellipse(1, 0, 12, 3.4, 0, 0, 7); g.fill(); g.globalAlpha = 1;
  const pata = (px, c) => { g.strokeStyle = c; g.lineWidth = 1.8; g.lineCap = 'round'; g.beginPath(); g.moveTo(px, -9); g.lineTo(px, -1); g.stroke(); g.strokeStyle = '#1E1A18'; g.beginPath(); g.moveTo(px, -.8); g.lineTo(px, 0); g.stroke(); };
  pata(-6, osc); pata(7, osc);
  g.beginPath(); g.moveTo(-10, -16); g.quadraticCurveTo(-1, -18.5, 8, -16); g.quadraticCurveTo(10.5, -13, 9, -9); g.quadraticCurveTo(0, -8, -9, -9); g.quadraticCurveTo(-11.5, -12.5, -10, -16); g.closePath();
  g.fillStyle = grad(g, 0, -18, 0, -8, [[0, '#9A6440'], [.6, col], [1, osc]]); g.fill(); g.strokeStyle = K.contorno; g.lineWidth = .5; g.stroke();
  pata(-4, col); pata(9, col);
  g.beginPath(); g.moveTo(7, -15); g.quadraticCurveTo(10, -22, 13, -24); g.quadraticCurveTo(16.5, -23, 17, -19.5); g.quadraticCurveTo(14, -20, 11.5, -14); g.closePath(); g.fillStyle = col; g.fill(); g.stroke();
  g.strokeStyle = '#2A1A10'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(8, -17); g.quadraticCurveTo(10, -22, 12.5, -24.4); g.stroke(); // crin
  g.strokeStyle = '#2A1A10'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(-10, -15); g.quadraticCurveTo(-13, -11, -12, -6); g.stroke(); // cola
  g.fillStyle = '#3A2418'; g.beginPath(); g.ellipse(0, -17.2, 4.5, 2.2, 0, 0, 7); g.fill(); // silla
  g.fillStyle = '#B23A2E'; g.fillRect(-4, -16.2, 8, 3); // pellón
  g.fillStyle = '#1E1A18'; g.beginPath(); g.arc(14.6, -21.8, .5, 0, 7); g.fill();
  g.strokeStyle = '#3A2A1E'; g.lineWidth = .5; g.beginPath(); g.moveTo(16.5, -20); g.quadraticCurveTo(22, -14, 33, -14.5); g.stroke(); // rienda al poste
  g.restore();
}
function carreta(g, x, y) {
  const rueda = (cx, cy) => { g.strokeStyle = K.maderaOsc; g.lineWidth = .9; g.beginPath(); g.ellipse(cx, cy, 3.2, 3.6, 0, 0, 7); g.stroke(); g.lineWidth = .4; for (let k = 0; k < 4; k++) { const a = k / 4 * Math.PI; g.beginPath(); g.moveTo(cx - Math.cos(a) * 3.1, cy - Math.sin(a) * 3.5); g.lineTo(cx + Math.cos(a) * 3.1, cy + Math.sin(a) * 3.5); g.stroke(); } };
  g.globalAlpha = .22; g.fillStyle = '#2A2A1E'; g.beginPath(); g.ellipse(x + 1, y + .5, 10, 3, 0, 0, 7); g.fill(); g.globalAlpha = 1;
  rueda(x - 4, y - 3.4);
  rellena(g, [[x - 8, y - 6], [x + 5, y - 2.6], [x + 5, y - 6.6], [x - 8, y - 10]], K.maderaLuz);
  rellena(g, [[x - 8, y - 10], [x + 5, y - 6.6], [x + 8, y - 8], [x - 5, y - 11.4]], '#A27A4E');
  for (let k = 0; k < 3; k++) { g.fillStyle = k % 2 ? '#C9B48A' : '#BFA87C'; g.beginPath(); g.ellipse(x - 4 + k * 4, y - 10.3 + k, 2.4, 1.6, .2, 0, 7); g.fill(); }
  rueda(x + 3, y - 1.6);
  g.strokeStyle = K.madera; g.lineWidth = .9; g.beginPath(); g.moveTo(x + 5, y - 4); g.lineTo(x + 13, y - 1.5); g.stroke(); // vara
}
function platanoSolar(g, x, y) {
  g.strokeStyle = '#8A9A5A'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - 10); g.stroke();
  for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + (k - 2) * .6, L = 8, ex = x + Math.cos(a) * L, ey = y - 10 + Math.sin(a) * L * .7 + 4; g.fillStyle = ['#4E7A3A', '#5E8B42', '#6F9C4C', '#3F6631', '#5E8B42'][k]; g.beginPath(); g.moveTo(x, y - 10); g.quadraticCurveTo((x + ex) / 2 - 2, (y - 10 + ey) / 2 - 3, ex, ey); g.quadraticCurveTo((x + ex) / 2 + 2, (y - 10 + ey) / 2, x, y - 9); g.fill(); }
}

// ---------- La casa ----------
// era: 0 bahareque (un piso), 1 tapia con balcón (dos pisos), 2 ladrillo, 3 concreto. v: 0 a 3. hum: húmeda.
function casa(g, era, v, hum) {
  const R = mulberry(31 + v * 17 + era * 101), zo = ZOCALO[v], ca = CARPINTERIA[v];
  const pisos = era === 0 ? 1 : era === 3 ? (v === 1 ? 3 : 2) : 2, H = pisos === 1 ? 15 : pisos === 2 ? 25 : 34;
  const forma = [{ w: .66, d: .44, r0: -.08 }, { w: .56, d: .56, r0: -.04 }, { w: .8, d: .42, r0: -.06 }, { w: .48, d: .46, r0: -.14, c0: -.12 }][v];
  const F = caras(forma.w, forma.d, H, forma.r0, forma.c0 || 0);
  const muro = era === 2 ? K.ladrillo : era === 3 ? K.concreto[v] : K.cal, base = era === 2 ? '#B5654A' : '#A68A62';
  // Capa 1: sombra en el suelo y lo que queda detrás de la casa.
  sombraCasa(g, F);
  if (v === 3) { // solar con tapia: el plátano asoma detrás
    platanoSolar(g, ...P(F.t + .02, F.b + .2)); platanoSolar(g, ...P(F.f - .15, F.b + .32));
  }
  // Capa 2: estructura.
  muros(g, F, muro, era === 3 ? null : zo, { ladrillo: era === 2 });
  if (hum) humedad(g, F, R, era === 2 ? K.ladrilloOsc : base);
  const vid = era === 3 ? { vidrio: '#7FA6BC', marco: '#F4F1E8', postigos: false } : era === 2 ? { marco: '#F4EEE2' } : {};
  // Puertas y ventanas según la variante (y una por piso).
  const pu = [.5, .14, .5, .5][v];
  if (v === 2 && era < 3) { hueco(g, F, 'izq', .4, .6, 0, 12, '#3A2A1E', true); hueco(g, F, 'izq', .41, .5, 0, 11.6, ca, false); hueco(g, F, 'izq', .5, .59, 0, 11.6, ca, false); } // zaguán
  else if (v === 2) hueco(g, F, 'izq', .36, .64, 0, 9, '#6E7378'); // garaje
  else puerta(g, F, 'izq', pu, v === 1 ? .2 : .16, 10, ca, era < 2);
  const vz = [[.2, .8], [.55, .85], [.15, .33, .67, .85], [.2, .8]][v];
  for (const u of vz) if (Math.abs(u - pu) > .12 && !(v === 2 && u > .3 && u < .7)) ventana(g, F, 'izq', u, 4, .1, 6, ca, vid);
  ventana(g, F, 'der', .5, 4, .16, 6, ca, vid);
  for (let p = 1; p < pisos; p++) {
    const z = 4 + p * 10;
    for (const u of (v === 2 ? [.15, .38, .62, .85] : [.25, .75])) ventana(g, F, 'izq', u, z, .1, 6.5, ca, vid);
    ventana(g, F, 'der', .5, z, .16, 6.5, ca, vid);
  }
  if (era === 1) balcon(g, F, v === 1 ? .05 : .1, v === 1 ? .95 : .9, 14.5, .14);
  if (era === 2 && v !== 1) balcon(g, F, .3, .7, 14.5, .1, '#2E2A28');
  if (era === 3) { const a = F.en('izq', 0, 12.5), b = F.en('izq', 1, 12.5); g.strokeStyle = mezcla(muro, '#000000', .25); g.lineWidth = 1.2; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); }
  // Capa 3: techo.
  const teja = era === 2 ? { teja: '#A24A2E', luz: '#B85A38', osc: '#7A3220', hastial: K.ladrilloOsc } : { hastial: era === 3 ? muro : K.calSombra };
  if (era === 3) terraza(g, F, muro);
  else if (v === 1) cuatroAguas(g, F, pisos === 1 ? 10 : 11, teja);
  else {
    const sale = v === 0 && era === 0 ? .22 : 0;
    dosAguas(g, F, pisos === 1 ? 10 : 11, { ...teja, sale });
    if (sale) { // corredor: piso de ladrillo y pilares de madera bajo el alero
      g.strokeStyle = K.maderaOsc; g.lineWidth = 1.3;
      for (const u of [.04, .37, .67, .96]) { const c = F.a + (F.b - F.a) * u, p = P(F.f + sale - .02, c, 0), q = P(F.f + sale - .02, c, H - 1.5); g.beginPath(); g.moveTo(...p); g.lineTo(...q); g.stroke(); }
    }
  }
  if (era < 2 && v !== 1 && R() < .7) { const p = P(F.t + .1, F.a + .18, F.z0 + F.H + 8); g.fillStyle = K.calSombra; g.fillRect(p[0] - 1.6, p[1] - 5, 3.2, 5); g.fillStyle = K.tejaSombra; g.fillRect(p[0] - 2.2, p[1] - 6, 4.4, 1.4); } // chimenea del fogón
  // Capa 4: elementos vivos, al frente de la casa.
  if (v === 0) { const y0 = F.f + (era === 0 ? .17 : .1); materas(g, [P(y0, F.a + .1), P(y0, F.a + .22), P(y0, F.b - .1)]); if (era === 0) banco(g, ...P(y0 - .04, F.a + .45)); }
  if (v === 1) ropaTendida(g, P(F.f + .08, F.b + .1), P(F.t + .12, F.b + .2), R);
  if (v === 2) { const p = P(F.f + .22, F.a + .12); era === 3 ? carreta(g, p[0] + 6, p[1] + 2) : caballo(g, p[0], p[1]); }
  if (v === 3) {
    // Tapia del solar (bahareque o ladrillo) con su portón y la carreta al frente.
    const tc = era === 2 ? K.ladrillo : era === 3 ? K.concreto[v] : K.cal, Tz = caras(.34, .5, 6, -.1, .31);
    rellena(g, Tz.izq, tc); rellena(g, Tz.der, mezcla(tc, '#000000', .14));
    g.strokeStyle = era === 3 ? mezcla(tc, '#000000', .3) : K.tejaSombra; g.lineWidth = 1.4; g.lineCap = 'round'; g.beginPath(); g.moveTo(...P(Tz.f, Tz.a, 6.3)); g.lineTo(...P(Tz.f, Tz.b, 6.3)); g.lineTo(...P(Tz.t, Tz.b, 6.3)); g.stroke();
    hueco(g, Tz, 'izq', .3, .7, 0, 5, ca);
    const p = P(F.f + .26, F.a + .06); carreta(g, p[0], p[1]);
  }
}

// Recetas para la hoja de edificios: claves casa0- (bahareque), casa2- (tapia y balcón), casa3- (ladrillo) y
// casa4- (concreto), con su variante 0 a 3 y la versión húmeda (h). Mismas anclas: el centro de la casilla.
export function recetasCasas() {
  const L = [];
  [[0, 'casa0-', 70, 52], [1, 'casa2-', 84, 64], [2, 'casa3-', 84, 64], [3, 'casa4-', 96, 74]].forEach(([era, k, alto, ay]) => {
    for (let v = 0; v < 4; v++) for (const hum of [false, true]) L.push([k + v + (hum ? 'h' : ''), 88, alto, 44, ay, g => casa(g, era, v, hum)]);
  });
  return L;
}
