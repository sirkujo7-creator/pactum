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
// Materiales de techo (renovación colonial, identidad de cada edificio): teja de barro en varios tonos, zinc (gris,
// rojo, verde u oxidado), pizarra, teja vidriada y paja. Cada uno con su color, su luz, su sombra y sus líneas.
const MAT = {
  teja: {}, tejaVieja: { teja: '#A04A2E', luz: '#B85A38', osc: '#7A3220' }, tejaNueva: { teja: '#C8683A', luz: '#DA7E4A', osc: '#9A4A26' }, tejaParda: { teja: '#9E5A3C', luz: '#B46C48', osc: '#74402A' },
  zinc: { tipo: 'lamina', teja: '#9AA4A8', luz: '#B8C0C2', osc: '#78828A', linea: '#5E686E' }, zincRojo: { tipo: 'lamina', teja: '#A8443A', luz: '#BE5A4C', osc: '#7E2E26', linea: '#6A2620' },
  zincVerde: { tipo: 'lamina', teja: '#5E7A52', luz: '#76925E', osc: '#44583C', linea: '#344630' }, zincOxido: { tipo: 'lamina', teja: '#9C6A48', luz: '#B07E58', osc: '#744C32', linea: '#5E3A24' },
  pizarra: { tipo: 'lamina', teja: '#5E646C', luz: '#747A82', osc: '#454A52', linea: '#2E3238' }, vidriada: { teja: '#3E7A5A', luz: '#58946E', osc: '#2C5A42', linea: '#204432' },
  paja: { tipo: 'paja', teja: '#C2A15E', luz: '#D6B874', osc: '#94763E', linea: '#7E6232' }
};
const ZOCALO = ['#2F5D8A', '#3E6B4A', '#8E2F22', '#B07A2A'], CARPINTERIA = ['#3E6B4A', '#8E2F22', '#2F5D8A', '#6E4529'];

// Captura al hornear (fase visual, animación): las ventanas y los vidrios de cada dibujo se anotan (en píxeles del
// lienzo) para pintar después la capa de luces de la noche, y las banderas, para que su tela ondee aparte.
export const CAPTURA = { quads: null, banderas: null, sinTela: false };
export function capturarQuad(g, pts) { if (!CAPTURA.quads) return; const T = g.getTransform(); CAPTURA.quads.push(pts.map(([x, y]) => [T.a * x + T.c * y + T.e, T.b * x + T.d * y + T.f])); }
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
  textura(g, F, col, op);
  if (zocalo) {
    const zh = Math.min(5, F.H * .2);
    rellena(g, [F.en('izq', 0, 0), F.en('izq', 1, 0), F.en('izq', 1, zh), F.en('izq', 0, zh)], zocalo, null);
    rellena(g, [F.en('der', 0, 0), F.en('der', 1, 0), F.en('der', 1, zh), F.en('der', 0, zh)], mezcla(zocalo, '#000000', .25), null);
    g.strokeStyle = 'rgba(255,240,215,.5)'; g.lineWidth = .45; g.beginPath(); g.moveTo(...F.en('izq', 0, zh)); g.lineTo(...F.en('izq', 1, zh)); g.stroke(); // bocel del zócalo
    g.strokeStyle = 'rgba(30,18,10,.3)'; g.beginPath(); g.moveTo(...F.en('der', 0, zh)); g.lineTo(...F.en('der', 1, zh)); g.stroke();
  }
  esquina(g, F);
}
// Textura del muro: la cal no es lisa (manchas de pañete, encalado viejo y repisado), más oscuro junto al suelo
// (salpique de la lluvia y oclusión) y un poco más claro arriba, donde da el sol.
function textura(g, F, col, op = {}) {
  const R = mulberry(Math.round(F.H * 37 + (F.b - F.a) * 911 + (F.f - F.t) * 577));
  for (const cara of ['izq', 'der']) {
    g.save(); poli(g, F[cara]); g.clip();
    const n = Math.round(14 + (F.b - F.a) * 20);
    for (let k = 0; k < n; k++) {
      const p = F.en(cara, R(), R() * F.H), rx = 1.5 + R() * 4, ry = .8 + R() * 2.2;
      g.fillStyle = R() < .55 ? `rgba(120,96,64,${.025 + R() * .035})` : `rgba(255,252,240,${.04 + R() * .05})`;
      g.beginPath(); g.ellipse(p[0], p[1], rx, ry, (R() - .5) * .6, 0, 7); g.fill();
    }
    if (!op.ladrillo) { g.strokeStyle = 'rgba(110,86,60,.12)'; g.lineWidth = .3; for (let k = 0; k < 4; k++) { const u = R(), z = R() * F.H, a = F.en(cara, u, z); g.beginPath(); g.moveTo(...a); g.lineTo(a[0] + (R() - .5) * 2, a[1] + 1.5 + R() * 2.5); g.lineTo(a[0] + (R() - .5) * 3, a[1] + 3 + R() * 3); g.stroke(); } } // grietas finas
    const b0 = F.en(cara, 0, 0), b1 = F.en(cara, 0, Math.min(F.H, 7)), gr = g.createLinearGradient(0, b0[1], 0, b1[1]);
    gr.addColorStop(0, 'rgba(60,42,24,.32)'); gr.addColorStop(1, 'rgba(60,42,24,0)'); g.fillStyle = gr; poli(g, F[cara]); g.fill();
    g.restore();
  }
  void col;
}
// Arista de la esquina: canto con luz en la fachada y filo oscuro en el costado; la casa deja de ser una caja plana.
function esquina(g, F) {
  const a = F.en('izq', 1, 0), b = F.en('izq', 1, F.H);
  g.strokeStyle = 'rgba(255,250,235,.55)'; g.lineWidth = .8; g.beginPath(); g.moveTo(a[0] - .5, a[1]); g.lineTo(b[0] - .5, b[1]); g.stroke();
  g.strokeStyle = 'rgba(40,24,12,.3)'; g.lineWidth = .6; g.beginPath(); g.moveTo(a[0] + .45, a[1]); g.lineTo(b[0] + .45, b[1]); g.stroke();
  const gr = g.createLinearGradient(a[0], 0, a[0] + 6, 0); gr.addColorStop(0, 'rgba(30,18,10,.12)'); gr.addColorStop(1, 'rgba(30,18,10,0)');
  g.save(); poli(g, F.der); g.clip(); g.fillStyle = gr; poli(g, F.der); g.fill(); g.restore();
}
// Hiladas de ladrillo: líneas horizontales y llagas alternadas.
// Ladrillo: cada pieza con su tono (unos más quemados, otros más claros), juntas de mortero claras y la sombra
// bajo cada hilada, para que el muro tenga grano y no sea un color plano con rayas.
function hiladas(g, F) {
  const R = mulberry(Math.round(F.H * 53 + (F.b - F.a) * 701));
  g.save();
  for (const cara of ['izq', 'der']) {
    g.save(); poli(g, F[cara]); g.clip();
    const paso = cara === 'izq' ? .12 : .16;
    for (let z = 0, k = 0; z < F.H; z += 2, k++) for (let u = -(k % 2) * paso / 2; u < 1; u += paso) {
      const t = R(); if (t > .45) continue;
      g.fillStyle = t < .2 ? `rgba(80,30,15,${.08 + R() * .12})` : `rgba(240,170,130,${.06 + R() * .1})`;
      poli(g, [F.en(cara, Math.max(0, u), z), F.en(cara, Math.min(1, u + paso), z), F.en(cara, Math.min(1, u + paso), z + 2), F.en(cara, Math.max(0, u), z + 2)]); g.fill();
    }
    g.lineWidth = .35;
    for (let z = 2; z < F.H; z += 2) { const a = F.en(cara, 0, z), b = F.en(cara, 1, z); g.strokeStyle = 'rgba(232,214,190,.45)'; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); g.strokeStyle = 'rgba(70,30,15,.25)'; g.beginPath(); g.moveTo(a[0], a[1] + .4); g.lineTo(b[0], b[1] + .4); g.stroke(); }
    g.strokeStyle = 'rgba(232,214,190,.35)';
    for (let z = 0, k = 0; z < F.H; z += 2, k++) for (let u = (k % 2) * paso / 2; u < 1; u += paso) { const a = F.en(cara, u, z), b = F.en(cara, u, z + 2); g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); }
    g.restore();
  }
  g.restore();
}
function hueco(g, F, cara, u0, u1, z0, z1, col, arco = false) {
  const pts = [F.en(cara, u0, z0), F.en(cara, u1, z0), F.en(cara, u1, z1), F.en(cara, u0, z1)];
  if (arco) { const m = F.en(cara, (u0 + u1) / 2, z1 + (z1 - z0) * .28); g.beginPath(); g.moveTo(...pts[0]); g.lineTo(...pts[1]); g.lineTo(...pts[2]); g.quadraticCurveTo(m[0], m[1], ...pts[3]); g.closePath(); g.fillStyle = col; g.fill(); g.strokeStyle = K.contorno; g.lineWidth = .5; g.stroke(); return; }
  rellena(g, pts, col, K.contorno, .5);
}
function ventana(g, F, cara, u, z, ancho, alto, color, op = {}) {
  capturarQuad(g, [F.en(cara, u - ancho / 2, z), F.en(cara, u + ancho / 2, z), F.en(cara, u + ancho / 2, z + alto), F.en(cara, u - ancho / 2, z + alto)]);
  if (op.marco) hueco(g, F, cara, u - ancho / 2 - .02, u + ancho / 2 + .02, z - .8, z + alto + .8, op.marco);
  hueco(g, F, cara, u - ancho / 2, u + ancho / 2, z, z + alto, op.vidrio || '#3A2A1E');
  hondura(g, F, cara, u - ancho / 2, u + ancho / 2, z, z + alto);
  if (op.postigos !== false) { hueco(g, F, cara, u - ancho / 2 - ancho * .45, u - ancho / 2, z, z + alto, color); hueco(g, F, cara, u + ancho / 2, u + ancho / 2 + ancho * .45, z, z + alto, color); }
  g.strokeStyle = op.vidrio ? 'rgba(255,255,255,.55)' : 'rgba(30,20,15,.7)'; g.lineWidth = .4;
  for (let k = 1; k < (op.vidrio ? 2 : 4); k++) { const a = F.en(cara, u - ancho / 2 + ancho * k / (op.vidrio ? 2 : 4), z), b = F.en(cara, u - ancho / 2 + ancho * k / (op.vidrio ? 2 : 4), z + alto); g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); }
}
// Hondura de un vano: el muro es grueso, así que arriba (dintel) y del lado contrario al sol el vano hace sombra
// adentro, y abajo sale un alféizar con luz.
function hondura(g, F, cara, u0, u1, z0, z1, alfeizar = true) {
  const e = .022, dz = Math.min(1.4, (z1 - z0) * .2);
  g.fillStyle = 'rgba(20,12,6,.45)'; poli(g, [F.en(cara, u0, z1), F.en(cara, u1, z1), F.en(cara, u1, z1 - dz), F.en(cara, u0, z1 - dz)]); g.fill();
  const lado = cara === 'izq' ? [u1 - e, u1] : [u1 - e, u1];
  g.fillStyle = 'rgba(20,12,6,.32)'; poli(g, [F.en(cara, lado[0], z0), F.en(cara, lado[1], z0), F.en(cara, lado[1], z1), F.en(cara, lado[0], z1)]); g.fill();
  if (alfeizar) {
    rellena(g, [F.en(cara, u0 - e, z0), F.en(cara, u1 + e, z0), F.en(cara, u1 + e, z0 - .8), F.en(cara, u0 - e, z0 - .8)], cara === 'izq' ? '#F2EADB' : '#CFC3AE', 'rgba(60,40,25,.35)', .3);
    g.fillStyle = 'rgba(40,24,12,.18)'; poli(g, [F.en(cara, u0, z0 - .8), F.en(cara, u1, z0 - .8), F.en(cara, u1, z0 - 2.6), F.en(cara, u0, z0 - 2.6)]); g.fill();
  }
}
function puerta(g, F, cara, u, ancho, alto, color, arco = true) {
  hueco(g, F, cara, u - ancho / 2, u + ancho / 2, 0, alto, color, arco);
  hondura(g, F, cara, u - ancho / 2, u + ancho / 2, 0, alto, false);
  { const a = F.en(cara, u - ancho / 2 - .03, 0), b = F.en(cara, u + ancho / 2 + .03, 0); rellena(g, [a, b, [b[0], b[1] + 1.2], [a[0], a[1] + 1.2]], '#9A9284', 'rgba(50,40,30,.4)', .3); } // umbral de piedra
  g.strokeStyle = 'rgba(30,18,10,.35)'; g.lineWidth = .35; for (const f of [.25, .75]) { const p = F.en(cara, u - ancho / 2 + ancho * f - ancho * .12, alto * .2), q = F.en(cara, u - ancho / 2 + ancho * f + ancho * .12, alto * .2), r = F.en(cara, u - ancho / 2 + ancho * f + ancho * .12, alto * .55), t = F.en(cara, u - ancho / 2 + ancho * f - ancho * .12, alto * .55); poli(g, [p, q, r, t]); g.stroke(); } // tableros de la puerta
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
// Tejas con relieve (pedido de Juan: «las casas parecen de juguete»): teja de barro en canales, cada canal con
// su luz a la izquierda y su sombra a la derecha (el sol arriba a la izquierda), el labio redondo de cada hilada que
// hace sombra sobre la de abajo, las bocas oscuras de las tejas en el alero, un tono distinto en cada teja y algo de
// musgo y hollín. La lámina de zinc va acanalada y la paja en mechones. Se pinta con capas transparentes encima del
// color del techo, así sirve para cualquier tono.
function tejas(g, en, n, linea = K.tejaLinea, tipo = 'teja') {
  const R = mulberry(Math.round(n * 131 + en(.37, .61)[0] * 7 + en(.37, .61)[1] * 13));
  const largo = Math.hypot(en(.5, 1)[0] - en(.5, 0)[0], en(.5, 1)[1] - en(.5, 0)[1]);
  const quad = (u0, u1, v0, v1) => { g.beginPath(); g.moveTo(...en(u0, v0)); g.lineTo(...en(u1, v0)); g.lineTo(...en(u1, v1)); g.lineTo(...en(u0, v1)); g.closePath(); };
  g.save();
  if (tipo === 'lamina') { // zinc o pizarra lisa: canales finos y traslapos
    const c = Math.max(8, Math.round(n * 2.6));
    for (let k = 0; k < c; k++) { const u0 = k / c, u1 = (k + .45) / c; g.fillStyle = 'rgba(255,255,255,.16)'; quad(u0, u1, 0, 1); g.fill(); g.fillStyle = 'rgba(0,0,0,.14)'; quad(u1, (k + .8) / c, 0, 1); g.fill(); }
    g.strokeStyle = linea; g.globalAlpha = .45; g.lineWidth = .4;
    for (let v = .34; v < 1; v += .33) { g.beginPath(); g.moveTo(...en(0, v)); g.lineTo(...en(1, v)); g.stroke(); }
    g.globalAlpha = 1; for (let k = 0; k < 3; k++) { const u = R(), v = R() * .8; g.fillStyle = 'rgba(120,70,40,.18)'; quad(u, Math.min(1, u + .08), v, v + .2); g.fill(); } // óxido
    g.restore(); return;
  }
  if (tipo === 'paja') { // mechones de paja que caen hacia el alero
    const filas = Math.max(4, Math.round(largo / 3));
    g.lineCap = 'round';
    for (let j = 0; j < filas; j++) for (let k = 0; k < n * 4; k++) {
      const u = (k + R()) / (n * 4), v = (j + R() * .4) / filas, a = en(u, v + .9 / filas), b = en(u + (R() - .5) * .02, v);
      g.strokeStyle = R() < .5 ? 'rgba(255,240,190,.32)' : 'rgba(80,55,20,.3)'; g.lineWidth = .5 + R() * .4; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke();
    }
    g.fillStyle = 'rgba(60,40,15,.25)'; quad(0, 1, 0, .06); g.fill();
    g.restore(); return;
  }
  const cols = Math.max(5, Math.round(n * 1.5)), filas = Math.max(3, Math.round(largo / 5.2));
  for (let j = 0; j < filas; j++) {
    const v0 = j / filas, v1 = (j + 1) / filas;
    for (let k = 0; k < cols; k++) {
      const u0 = k / cols, u1 = (k + 1) / cols, w = u1 - u0;
      const t = R(); g.fillStyle = t < .3 ? `rgba(70,25,10,${.06 + R() * .1})` : t < .55 ? `rgba(255,220,180,${.05 + R() * .08})` : 'rgba(0,0,0,0)'; quad(u0, u1, v0, v1); g.fill(); // cada teja con su tono
      g.fillStyle = 'rgba(255,228,196,.3)'; quad(u0 + w * .12, u0 + w * .42, v0, v1); g.fill(); // lomo con luz
      g.fillStyle = 'rgba(60,18,8,.3)'; quad(u0 + w * .66, u1, v0, v1); g.fill();          // costado en sombra
      g.fillStyle = 'rgba(40,12,4,.35)'; quad(u1 - w * .06, u1 + w * .04, v0, v1); g.fill(); // junta entre canales
      if (R() < .05) { g.fillStyle = 'rgba(80,96,50,.35)'; quad(u0, u1, v0, v0 + (v1 - v0) * .6); g.fill(); } // musgo
    }
    // Labio redondo de la hilada de arriba: sombra que cae sobre esta y borde con luz.
    if (j > 0) for (let k = 0; k < cols; k++) {
      const u0 = k / cols, u1 = (k + 1) / cols, um = (u0 + u1) / 2, dv = v1 - v0;
      const A = en(u0, v0), B = en(u1, v0), M = en(um, v0 - dv * .26), S1 = en(u1, v0 - dv * .16), S0 = en(u0, v0 - dv * .16);
      g.fillStyle = 'rgba(50,15,6,.34)'; g.beginPath(); g.moveTo(...S0); g.quadraticCurveTo(...en(um, v0 - dv * .4), ...S1); g.lineTo(...B); g.quadraticCurveTo(...M, ...A); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(255,214,170,.42)'; g.lineWidth = .35; g.beginPath(); g.moveTo(...A); g.quadraticCurveTo(...M, ...B); g.stroke();
    }
  }
  // Bocas de las tejas en el alero.
  for (let k = 0; k < cols; k++) { const u0 = k / cols, u1 = (k + 1) / cols, A = en(u0 + .1 / cols, 0), B = en(u1 - .1 / cols, 0), M = en((u0 + u1) / 2, -.5 / filas); g.fillStyle = 'rgba(40,12,5,.6)'; g.beginPath(); g.moveTo(...A); g.quadraticCurveTo(...M, ...B); g.closePath(); g.fill(); }
  g.restore();
}
// Techo de teja a dos aguas, cumbrera a lo largo de c. sale: cuánto avanza el alero del frente (corredor).
// Sombra del alero sobre el muro (franja oscura que se desvanece hacia abajo): da el volumen del techo volado.
function sombraAlero(g, F, cara, alto = 5) {
  const H = F.H, a = F.en(cara, 0, H), b = F.en(cara, 1, H), c = F.en(cara, 1, H - alto), d = F.en(cara, 0, H - alto);
  const gr = g.createLinearGradient(0, a[1], 0, d[1]); gr.addColorStop(0, 'rgba(40,24,12,.42)'); gr.addColorStop(.45, 'rgba(40,24,12,.16)'); gr.addColorStop(1, 'rgba(40,24,12,0)');
  g.fillStyle = gr; poli(g, [a, b, c, d]); g.fill();
}
// Canecillos: puntas de las vigas de madera bajo el alero, como en las casas coloniales.
function canecillos(g, r, a, b, z, n) {
  g.lineCap = 'butt';
  for (let k = 0; k <= n; k++) { const c = a + (b - a) * (k + .5) / (n + 1), p = P(r, c, z), q = P(r - .07, c, z + .6); g.strokeStyle = K.maderaOsc; g.lineWidth = 1.1; g.beginPath(); g.moveTo(...p); g.lineTo(...q); g.stroke(); g.strokeStyle = 'rgba(255,220,170,.35)'; g.lineWidth = .35; g.beginPath(); g.moveTo(p[0] - .4, p[1]); g.lineTo(q[0] - .4, q[1]); g.stroke(); }
}
// Techo de teja a dos aguas, cumbrera a lo largo de c. sale: cuánto avanza el alero del frente (corredor).
function dosAguas(g, F, rh, op = {}) {
  const o = .08, sale = op.sale || 0, a = F.a - o, b = F.b + o, f = F.f + o + sale, t = F.t - o, m = (F.f + F.t) / 2, H = F.z0 + F.H;
  const teja = op.teja || K.teja, luz = op.luz || K.tejaLuz, osc = op.osc || K.tejaSombra, tipo = op.tipo || 'teja';
  if (!op.sinAlero) sombraAlero(g, F, 'izq', sale ? 9 : 5);
  rellena(g, [P(F.f, F.b, H), P(F.t, F.b, H), P(m, F.b, H + rh * .92)], op.hastial || K.calSombra);
  { const gr = g.createLinearGradient(...P(m, F.b, H + rh), ...P(F.f, F.b, H)); gr.addColorStop(0, 'rgba(40,24,12,.3)'); gr.addColorStop(.35, 'rgba(40,24,12,0)'); g.fillStyle = gr; poli(g, [P(F.f, F.b, H), P(F.t, F.b, H), P(m, F.b, H + rh * .92)]); g.fill(); } // sombra del vuelo en el hastial
  rellena(g, [P(m, a, H + rh), P(m, b, H + rh), P(t, b, H), P(t, a, H)], osc);
  const zf = H - (sale ? rh * sale / (F.f - m + o) : 0), faldon = [P(f, a, zf), P(f, b, zf), P(m, b, H + rh), P(m, a, H + rh)];
  if (!op.sinAlero && tipo !== 'paja') canecillos(g, f - .02, a + .02, b - .02, zf - 1.6, Math.round((b - a) * 11));
  rellena(g, faldon, grad(g, 0, faldon[0][1], 0, faldon[3][1], [[0, teja], [1, luz]]));
  tejas(g, (u, v) => P(f + (m - f) * v, a + (b - a) * u, zf + (H + rh - zf) * v), Math.round((b - a) * 9), op.linea, tipo);
  // Grosor del alero (canto del techo) y tapa del borde en el hastial.
  rellena(g, [P(f, a, zf), P(f, b, zf), P(f, b, zf - 1.3), P(f, a, zf - 1.3)], mezcla(osc, '#000000', .25), null);
  g.strokeStyle = mezcla(osc, '#000000', .3); g.lineWidth = 1.2; g.lineCap = 'round'; g.beginPath(); g.moveTo(...P(f, b, zf - .6)); g.lineTo(...P(m, b, H + rh - .4)); g.stroke();
  g.strokeStyle = 'rgba(255,220,180,.35)'; g.lineWidth = .4; g.beginPath(); g.moveTo(...P(f, a, zf)); g.lineTo(...P(f, b, zf)); g.stroke();
  // Cumbrera: tejas puestas al revés, en fila, con su luz.
  rellena(g, [P(m + .02, a, H + rh + .8), P(m + .02, b, H + rh + .8), P(m - .02, b, H + rh - .4), P(m - .02, a, H + rh - .4)], osc, null);
  if (tipo === 'teja') { const nn = Math.round((b - a) * 14); for (let k = 0; k < nn; k++) { const c = a + (b - a) * (k + .5) / nn, q = P(m + .01, c, H + rh + .5); g.fillStyle = mezcla(teja, '#000000', .15); g.beginPath(); g.ellipse(q[0], q[1], 1.5, 1, -.46, 0, 7); g.fill(); g.fillStyle = 'rgba(255,220,180,.4)'; g.beginPath(); g.ellipse(q[0] - .4, q[1] - .35, .8, .4, -.46, 0, 7); g.fill(); } }
  return zf;
}
// Techo de cuatro aguas (casa esquinera): cumbrera corta en el centro.
// Techo de cuatro aguas (casa esquinera): cumbrera corta en el centro.
function cuatroAguas(g, F, rh, op = {}) {
  const o = .08, a = F.a - o, b = F.b + o, f = F.f + o, t = F.t - o, m = (F.f + F.t) / 2, H = F.z0 + F.H, k = (b - a) * .28;
  const teja = op.teja || K.teja, luz = op.luz || K.tejaLuz, osc = op.osc || K.tejaSombra, tipo = op.tipo || 'teja';
  if (!op.sinAlero) { sombraAlero(g, F, 'izq', 5); sombraAlero(g, F, 'der', 5); }
  const A = P(m, a + k, H + rh), B = P(m, b - k, H + rh);
  rellena(g, [P(t, a, H), P(t, b, H), B, A], osc);
  if (!op.sinAlero && tipo !== 'paja') canecillos(g, f - .02, a + .02, b - .02, H - 1.6, Math.round((b - a) * 11));
  const frente = [P(f, a, H), P(f, b, H), B, A];
  rellena(g, frente, grad(g, 0, frente[0][1], 0, A[1], [[0, teja], [1, luz]]));
  g.save(); poli(g, frente); g.clip();
  tejas(g, (u, v) => { const c0 = a + (a + k - a) * v, c1 = b + (b - k - b) * v; return P(f + (m - f) * v, c0 + (c1 - c0) * u, H + rh * v); }, Math.round((b - a) * 9), op.linea, tipo);
  g.restore();
  const lado = [P(f, b, H), P(t, b, H), B];
  rellena(g, lado, grad(g, lado[0][0], 0, lado[1][0], 0, [[0, osc], [1, teja]]));
  g.save(); poli(g, lado); g.clip();
  tejas(g, (u, v) => { const r0 = f + (t - f) * u; return P(r0 + (m - r0) * v, b + (b - k - b) * v, H + rh * v); }, Math.round((f - t) * 9), op.linea, tipo);
  g.fillStyle = 'rgba(30,12,6,.18)'; poli(g, lado); g.fill(); // el faldón del costado, más en sombra
  g.restore();
  rellena(g, [P(f, a, H), P(f, b, H), P(f, b, H - 1.3), P(f, a, H - 1.3)], mezcla(osc, '#000000', .25), null);
  rellena(g, [P(f, b, H), P(t, b, H), P(t, b, H - 1.3), P(f, b, H - 1.3)], mezcla(osc, '#000000', .4), null);
  g.strokeStyle = mezcla(osc, '#000000', .2); g.lineWidth = 1.4; g.lineCap = 'round'; g.beginPath(); g.moveTo(...P(f, b, H)); g.lineTo(...B); g.lineTo(...A); g.lineTo(...P(f, a, H)); g.stroke(); // limas y cumbrera
  g.strokeStyle = 'rgba(255,220,180,.35)'; g.lineWidth = .4; g.beginPath(); g.moveTo(...P(f, b, H)); g.lineTo(...B); g.stroke();
}
// Terraza plana de concreto con pretil y tanque de agua.
// Azotea de concreto: pretil con grosor (se ve su cara de adentro en sombra y su remate con luz), placa con
// manchas de humedad y de impermeabilizante, un sifón y la oclusión junto al pretil.
function terraza(g, F, col) {
  const H = F.z0 + F.H, a = F.a, b = F.b, f = F.f, t = F.t, e = .04, ph = 2.6;
  sombraAlero(g, F, 'izq', 2.2); sombraAlero(g, F, 'der', 2.2);
  const piso = [P(f, a, H), P(f, b, H), P(t, b, H), P(t, a, H)];
  rellena(g, piso, mezcla(col, '#000000', .12));
  g.save(); poli(g, piso); g.clip();
  const R = mulberry(Math.round((b - a) * 977 + H * 31));
  for (let k = 0; k < 9; k++) { const p = P(t + (f - t) * R(), a + (b - a) * R(), H); g.fillStyle = R() < .5 ? 'rgba(60,50,40,.12)' : 'rgba(150,60,40,.1)'; g.beginPath(); g.ellipse(p[0], p[1], 3 + R() * 5, 1.5 + R() * 2.5, 0, 0, 7); g.fill(); }
  g.fillStyle = 'rgba(30,24,18,.28)'; poli(g, [P(t + e, a + e, H), P(t + e, b - e, H), P(t + e + .08, b - e, H), P(t + e + .08, a + e, H)]); g.fill(); // sombra del pretil del fondo
  poli(g, [P(t + e, a + e, H), P(f - e, a + e, H), P(f - e, a + e + .08, H), P(t + e, a + e + .08, H)]); g.fill();
  const d = P((f + t) / 2, (a + b) / 2, H); g.fillStyle = '#3A3430'; g.beginPath(); g.ellipse(d[0], d[1], 1, .5, 0, 0, 7); g.fill(); // sifón
  g.restore();
  // Caras de adentro del pretil (fondo e izquierda) en sombra, y caras de afuera (frente y derecha).
  rellena(g, [P(t + e, a + e, H), P(t + e, b - e, H), P(t + e, b - e, H + ph), P(t + e, a + e, H + ph)], mezcla(col, '#000000', .2), null);
  rellena(g, [P(f - e, a + e, H), P(t + e, a + e, H), P(t + e, a + e, H + ph), P(f - e, a + e, H + ph)], mezcla(col, '#000000', .28), null);
  rellena(g, [P(f, a, H), P(f, b, H), P(f, b, H + ph), P(f, a, H + ph)], mezcla(col, '#FFFFFF', .12));
  rellena(g, [P(f, b, H), P(t, b, H), P(t, b, H + ph), P(f, b, H + ph)], mezcla(col, '#000000', .14));
  // Remate (la tapa del pretil), con luz arriba y un filo de sombra debajo.
  const r = H + ph;
  rellena(g, [P(f + .02, a - .02, r), P(f + .02, b + .02, r), P(t - .02, b + .02, r), P(t - .02, a - .02, r), P(t + e, a + e, r), P(f - e, a + e, r), P(f - e, b - e, r), P(t + e, b - e, r), P(t + e, a + e, r)], mezcla(col, '#FFFFFF', .35), 'rgba(60,50,40,.35)', .3);
  g.strokeStyle = 'rgba(40,30,20,.35)'; g.lineWidth = .5; g.beginPath(); g.moveTo(...P(f + .02, a - .02, r - .5)); g.lineTo(...P(f + .02, b + .02, r - .5)); g.lineTo(...P(t - .02, b + .02, r - .5)); g.stroke();
  // Chorreones de lluvia que bajan del remate por la fachada.
  for (const cara of ['izq', 'der']) { g.save(); poli(g, F[cara]); g.clip(); for (let k = 0; k < 5; k++) { const u = .05 + R() * .9, p = F.en(cara, u, F.H), L = 3 + R() * F.H * .3, gr = g.createLinearGradient(0, p[1], 0, p[1] + L); gr.addColorStop(0, 'rgba(70,64,56,.22)'); gr.addColorStop(1, 'rgba(70,64,56,0)'); g.fillStyle = gr; g.fillRect(p[0] - .5 - R() * .5, p[1], 1 + R(), L); } g.restore(); }
  const q = P(t + .14, b - .16, r); rellena(g, [[q[0] - 4, q[1]], [q[0] + 4, q[1]], [q[0] + 4, q[1] - 6], [q[0] - 4, q[1] - 6]], '#3A4A5A'); g.fillStyle = '#4E6070'; g.beginPath(); g.ellipse(q[0], q[1] - 6, 4, 1.5, 0, 0, 7); g.fill();
  g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(q[0] - 3.4, q[1] - 5.5, 1.2, 5);
  const an = P(t + .14, a + .14, r); antenaTV(g, an[0], an[1]);
}
// Carro particular estacionado (desde los años del conflicto, en las casas de ladrillo y de concreto).
function carroCasa(g, x, y, col) {
  g.save(); g.globalAlpha = .22; g.fillStyle = '#2A2A1E'; g.beginPath(); g.ellipse(x + 1, y + .5, 8, 2.4, 0, 0, 7); g.fill(); g.restore();
  rellena(g, [[x - 7, y - 1], [x + 5, y + 2.5], [x + 5, y - 2], [x - 7, y - 5.5]], col); rellena(g, [[x - 7, y - 5.5], [x + 5, y - 2], [x + 7.5, y - 3.2], [x - 4.5, y - 6.8]], mezcla(col, '#000000', .1));
  rellena(g, [[x - 5, y - 5.6], [x + 1, y - 3.8], [x + 2, y - 7], [x - 3.6, y - 8.6]], '#7FA6BC');
  g.fillStyle = '#1E1A18'; for (const dx of [-4.5, 3]) { g.beginPath(); g.ellipse(x + dx, y + (dx + 7) * .3 - .6, 1.4, 1.4, 0, 0, 7); g.fill(); }
}
// Antena de televisión (espina de pescado, a lo largo del techo; antes era una cruz y parecía una iglesia).
function antenaTV(g, x, y, alto = 8) {
  g.strokeStyle = '#4A4A4A'; g.lineWidth = .55; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - alto); g.stroke();
  const bx = 4, by = 2; g.beginPath(); g.moveTo(x - bx, y - alto + by); g.lineTo(x + bx, y - alto - by); g.stroke();
  g.lineWidth = .4; for (let k = 0; k < 5; k++) { const f = k / 4 - .5, cx = x + f * 2 * bx, cy = y - alto - f * 2 * by, l = 2.4 - k * .35; g.beginPath(); g.moveTo(cx - l * .9, cy - l * .45); g.lineTo(cx + l * .9, cy + l * .45); g.stroke(); }
}
// Lo que marca cada época de la historia en una casa (fase visual, tanda D): la antena de televisión desde la
// modernización, rejas y tanque plástico de agua en el conflicto, y antena parabólica, panel solar y moto en la era
// digital. Las casas ya cambian de material con la época de dibujo y con su nivel de vida.
function detallesEpoca(g, F, era, v, hist) {
  if (hist < 3) return;
  const techo = F.z0 + F.H;
  if (era < 3 && v !== 1) { const q = P((F.f + F.t) / 2, F.b - .1, techo + 9); antenaTV(g, q[0], q[1] + 2, 7); }
  if (hist >= 4 && era >= 1) {
    for (const u of [.2, .8]) { g.strokeStyle = '#2E2A28'; g.lineWidth = .35; for (let k = 0; k <= 3; k++) { const a = F.en('izq', u - .05 + .1 * k / 3, 4), b = F.en('izq', u - .05 + .1 * k / 3, 10); g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); } } // rejas en las ventanas de abajo
    if (era >= 2 && v % 2 === 0) { const q = P(F.t + .12, F.a + .14, techo + (era === 3 ? 2 : 4)); g.fillStyle = '#2A2A2A'; g.beginPath(); g.moveTo(q[0] - 3, q[1]); g.lineTo(q[0] - 3, q[1] - 5); g.ellipse(q[0], q[1] - 5, 3, 1.2, 0, Math.PI, 0); g.lineTo(q[0] + 3, q[1]); g.ellipse(q[0], q[1], 3, 1.2, 0, 0, Math.PI); g.fill(); g.fillStyle = '#4A4A4A'; g.beginPath(); g.ellipse(q[0], q[1] - 5, 3, 1.2, 0, 0, 7); g.fill(); } // tanque plástico negro
  }
  if (hist >= 5) {
    const d = F.en('der', .2, F.H - 3); g.fillStyle = '#E8ECEE'; g.beginPath(); g.ellipse(d[0] + 2.4, d[1], 2.2, 2.6, -.4, 0, 7); g.fill(); g.strokeStyle = '#8A9094'; g.lineWidth = .4; g.stroke(); g.beginPath(); g.moveTo(d[0] + 2.4, d[1]); g.lineTo(d[0] + 4.4, d[1] - 1.2); g.stroke(); // antena parabólica
    if (era === 3 && v % 2 === 1) { const a = F.a + .06, b = F.a + (F.b - F.a) * .55, r = F.t + .1, z = techo + 2.2; rellena(g, [P(r + .1, a, z), P(r + .1, b, z), P(r, b, z + 2.4), P(r, a, z + 2.4)], '#2C4A6E', 'rgba(30,40,55,.8)', .3); } // panel solar
    if (v === 0) { const m = P(F.f + .16, F.b - .04); g.fillStyle = '#2E3238'; g.beginPath(); g.ellipse(m[0] - 2, m[1] - 1, 1.2, 1.2, 0, 0, 7); g.ellipse(m[0] + 2.2, m[1] + .5, 1.2, 1.2, 0, 0, 7); g.fill(); rellena(g, [[m[0] - 2, m[1] - 2], [m[0] + 2.2, m[1] - .6], [m[0] + 1.4, m[1] - 3.2], [m[0] - 1, m[1] - 3.8]], '#B9442F', K.contorno, .3); } // moto
  }
}
// Sombra de la obra en el suelo: cae abajo a la derecha (el sol de todo el mapa) con el borde difuso. Se dibuja con
// el desenfoque del lienzo: la forma va lejos, fuera del cuadro, y aquí solo cae su sombra borrosa.
function sombraCasa(g, F) {
  const m = g.getTransform(), e = Math.hypot(m.a, m.b) || 1, lejos = 4000;
  g.save(); g.shadowColor = 'rgba(40,32,20,.3)'; g.shadowBlur = 4.5 * e; g.shadowOffsetX = lejos * m.a; g.shadowOffsetY = lejos * m.b;
  g.translate(-lejos, 0); g.fillStyle = '#000';
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

// Leña arrumada contra el costado de la casa, bajo el alero (las casas del campo cocinaban con fogón de leña):
// troncos cortados con la cara clara del corte y la corteza oscura, sobre dos palos para que no se mojen.
function lena(g, F, R) {
  const u0 = .55, u1 = .92, filas = 3;
  g.save();
  for (let f = 0; f < filas; f++) {
    const n = 5 - f;
    for (let k = 0; k < n; k++) {
      const u = u0 + (u1 - u0) * (k + .5 + f * .5) / 5.5, p = F.en('der', u, 1 + f * 1.7), q = [p[0] + 1.6, p[1] + .8];
      g.fillStyle = '#4A3220'; g.beginPath(); g.ellipse(q[0] - .9, q[1] - .4, 1, .95, 0, 0, 7); g.fill(); // largo del tronco hacia el muro
      g.fillStyle = R() < .5 ? '#D8B884' : '#C9A470'; g.beginPath(); g.ellipse(q[0], q[1], .95, .9, 0, 0, 7); g.fill(); // cara del corte
      g.strokeStyle = 'rgba(90,60,30,.6)'; g.lineWidth = .25; g.beginPath(); g.arc(q[0], q[1], .45, 0, 7); g.stroke(); g.strokeStyle = '#3E2A1A'; g.lineWidth = .3; g.beginPath(); g.ellipse(q[0], q[1], .95, .9, 0, 0, 7); g.stroke();
    }
  }
  g.restore();
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
function casa(g, era, v, hum, hist = [0, 1, 2, 5][era]) {
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
  const teja = era === 2 ? { teja: '#A24A2E', luz: '#B85A38', osc: '#7A3220', hastial: K.ladrilloOsc } : { ...MAT[['teja', 'tejaVieja', 'tejaNueva', 'tejaParda'][v]], hastial: era === 3 ? muro : K.calSombra }; // cada variante con su tono de teja
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
  detallesEpoca(g, F, era, v, hist);
  if (era < 2 && (v === 0 || v === 2)) lena(g, F, R);
  // Capa 4: elementos vivos, al frente de la casa.
  if (v === 0) { const y0 = F.f + (era === 0 ? .17 : .1); materas(g, [P(y0, F.a + .1), P(y0, F.a + .22), P(y0, F.b - .1)]); if (era === 0) banco(g, ...P(y0 - .04, F.a + .45)); }
  if (v === 1) ropaTendida(g, P(F.f + .08, F.b + .1), P(F.t + .12, F.b + .2), R);
  if (v === 2) { const p = P(F.f + .22, F.a + .12); hist >= 4 && era >= 2 ? carroCasa(g, p[0] + 4, p[1] + 2, ['#B9442F', '#2F5D8A', '#E8E4DA'][hist % 3]) : era === 3 ? carreta(g, p[0] + 6, p[1] + 2) : caballo(g, p[0], p[1]); }
  if (v === 3) {
    // Tapia del solar (bahareque o ladrillo) con su portón y la carreta al frente.
    const tc = era === 2 ? K.ladrillo : era === 3 ? K.concreto[v] : K.cal, Tz = caras(.34, .5, 6, -.1, .31);
    rellena(g, Tz.izq, tc); rellena(g, Tz.der, mezcla(tc, '#000000', .14));
    g.strokeStyle = era === 3 ? mezcla(tc, '#000000', .3) : K.tejaSombra; g.lineWidth = 1.4; g.lineCap = 'round'; g.beginPath(); g.moveTo(...P(Tz.f, Tz.a, 6.3)); g.lineTo(...P(Tz.f, Tz.b, 6.3)); g.lineTo(...P(Tz.t, Tz.b, 6.3)); g.stroke();
    hueco(g, Tz, 'izq', .3, .7, 0, 5, ca);
    const p = P(F.f + .26, F.a + .06); if (hist < 4 || era < 2) carreta(g, p[0], p[1]);
  }
}

// ---------- El rancho (nivel de vida más bajo; idea de Anno) ----------
// moderno false: bahareque crudo sin cal y techo de paja, con fogón de leña afuera (épocas antiguas).
// moderno true: tablas y techo de zinc oxidado con piedras encima, caneca de agua y un plástico de remiendo.
function rancho(g, moderno, v) {
  const R = mulberry(71 + v * 13 + (moderno ? 500 : 0));
  const forma = [{ w: .52, d: .38, r0: -.04 }, { w: .44, d: .44, r0: -.06 }, { w: .62, d: .34, r0: -.02 }, { w: .46, d: .38, r0: -.08, c0: -.08 }][v];
  const H = moderno ? 12 : 11, F = caras(forma.w, forma.d, H, forma.r0, forma.c0 || 0);
  sombraCasa(g, F);
  const muro = moderno ? ['#8E7A62', '#7E6A54', '#9A8468', '#86745E'][v] : '#A88A62';
  muros(g, F, muro, null);
  // Textura: cañas del bahareque con restos de cal, o tablas verticales mal ajustadas.
  g.save(); g.lineWidth = .4;
  for (const cara of ['izq', 'der']) {
    const n = cara === 'izq' ? 12 : 8;
    for (let k = 1; k < n; k++) {
      const u = k / n + (R() - .5) * .02, a = F.en(cara, u, 0), b = F.en(cara, u, H);
      g.strokeStyle = moderno ? 'rgba(50,36,24,.5)' : 'rgba(90,64,40,.35)'; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke();
    }
    if (!moderno) for (let k = 0; k < 2; k++) { const u = .1 + R() * .7, z = 3 + R() * 5, p = F.en(cara, u, z); g.fillStyle = 'rgba(226,214,190,.38)'; g.beginPath(); g.ellipse(p[0], p[1], 1.4 + R(), .8 + R() * .5, 0, 0, 7); g.fill(); } // la poca cal que queda
  }
  g.restore();
  if (moderno && v !== 1) { const a = F.en('der', .15, 1), b = F.en('der', .75, 1), c = F.en('der', .75, H - 2), d = F.en('der', .15, H - 2); rellena(g, [a, b, c, d], 'rgba(62,110,154,.82)', 'rgba(30,60,90,.6)', .4); } // plástico de remiendo
  // Puerta: hueco oscuro con cortina de tela (antes) o lámina (después) y una ventanita.
  hueco(g, F, 'izq', .42, .62, 0, 8.5, '#2E2218');
  if (!moderno) rellena(g, [F.en('izq', .43, 3), F.en('izq', .55, 3), F.en('izq', .55, 8.2), F.en('izq', .43, 8.2)], ['#B5523A', '#3E6B8A', '#8A6A2E', '#5E7A3A'][v], null);
  hueco(g, F, 'izq', .14, .26, 4.5, 7.5, '#2E2218');
  // Techo.
  const tm = moderno ? { ...MAT[v % 2 ? 'zincOxido' : 'zinc'], hastial: muro } : { ...MAT.paja, hastial: '#9A7E58' };
  if (v === 1) cuatroAguas(g, F, moderno ? 5 : 9, tm); else dosAguas(g, F, moderno ? 5 : 9, tm);
  if (moderno) { // piedras sobre el zinc para que el viento no se lo lleve
    for (let k = 0; k < 3; k++) { const p = P((F.f + F.t) / 2 + .06, F.a + .1 + k * (F.b - F.a - .2) / 2, H + 3.6); g.fillStyle = '#8C857A'; g.beginPath(); g.ellipse(p[0], p[1], 1.8, 1.2, 0, 0, 7); g.fill(); g.strokeStyle = K.contorno; g.lineWidth = .3; g.stroke(); }
  }
  // Al frente: fogón de leña con olla (antes) o caneca azul de agua (después).
  const q = P(F.f + .2, F.b - .02);
  if (!moderno) {
    g.fillStyle = '#6E665C'; for (const dx of [-2.4, 0, 2.4]) { g.beginPath(); g.ellipse(q[0] + dx, q[1], 1.3, .9, 0, 0, 7); g.fill(); }
    g.fillStyle = '#2E2A26'; g.beginPath(); g.ellipse(q[0], q[1] - 2.2, 2.6, 2, 0, 0, 7); g.fill();
    g.fillStyle = '#E28A3A'; g.beginPath(); g.ellipse(q[0], q[1] - .2, 1.4, .6, 0, 0, 7); g.fill();
    if (v === 2) { g.strokeStyle = '#6E4529'; g.lineWidth = 1; for (let k = 0; k < 4; k++) { const p = P(F.f + .16, F.a + .06 + k * .025); g.beginPath(); g.moveTo(p[0] - 3, p[1] - k * .9); g.lineTo(p[0] + 3, p[1] - 1 - k * .9); g.stroke(); } } // leña
  } else {
    rellena(g, [[q[0] - 2.6, q[1]], [q[0] + 2.6, q[1]], [q[0] + 2.6, q[1] - 6], [q[0] - 2.6, q[1] - 6]], '#2F6FA8', 'rgba(20,40,70,.6)', .4);
    g.fillStyle = '#3E82BE'; g.beginPath(); g.ellipse(q[0], q[1] - 6, 2.6, 1, 0, 0, 7); g.fill();
    if (v === 2 || v === 3) ropaTendida(g, P(F.f + .1, F.a - .05), P(F.t + .05, F.a - .12), R);
  }
  if (v === 3) { // cerca de guadua (o de alambre) alrededor del solar
    g.strokeStyle = moderno ? '#7A7468' : '#9A8A4E'; g.lineWidth = .8;
    for (let k = 0; k < 5; k++) { const p = P(F.f + .26, F.b + .04 - k * .09); g.beginPath(); g.moveTo(...p); g.lineTo(p[0], p[1] - 5); g.stroke(); }
    const a = P(F.f + .26, F.b + .04, 3.5), b = P(F.f + .26, F.b - .32, 3.5); g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke();
  }
}

// Recetas para la hoja de edificios: claves casa0- (bahareque), casa2- (tapia y balcón), casa3- (ladrillo) y
// casa4- (concreto), con su variante 0 a 3 y la versión húmeda (h). Mismas anclas: el centro de la casilla.
export function recetasCasas(hist) {
  const L = [];
  [[0, 'casa0-', 70, 52], [1, 'casa2-', 84, 64], [2, 'casa3-', 84, 64], [3, 'casa4-', 96, 74]].forEach(([era, k, alto, ay]) => {
    for (let v = 0; v < 4; v++) for (const hum of [false, true]) L.push([k + v + (hum ? 'h' : ''), 88, alto, 44, ay, g => casa(g, era, v, hum, hist === undefined ? [0, 1, 2, 5][era] : hist)]);
  });
  for (const [m, k] of [[false, 'rancho0-'], [true, 'rancho1-']]) for (let v = 0; v < 4; v++) L.push([k + v, 88, 56, 44, 44, g => rancho(g, m, v)]); // nivel de vida más bajo
  return L;
}

// Pinceles compartidos con los edificios públicos (src/arte/publicos.js).
export { capturarQuad as capturarVentana };
export { casa as casaColonial, P, K, MAT, mezcla, poli, rellena, grad, caras, muros, hiladas, hueco, ventana, puerta, balcon, tejas, dosAguas, cuatroAguas, terraza, sombraCasa, materas, caballo, carreta, banco as bancoMadera };
