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
  rellena(g, [P(m, b, H + rh), P(t, b, H), P(t, b, H - 1.3), P(m, b, H + rh - 1.3)], mezcla(osc, '#000000', .3), null); // canto de la vertiente de atrás (antes se veía como un palito suelto)
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
function terraza(g, F, col, op = {}) {
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
  if (op.limpio) return; // cada edificio moderno pone lo suyo en el techo (antes todos llevaban tanque y antena)
  const q = P(t + .14, b - .16, r); cilindro(g, q[0], q[1], 3.8, 6, '#34485C', { arriba: 3.5, aros: 2, tapa: '#4A6074' }); g.fillStyle = '#26323E'; g.beginPath(); g.ellipse(q[0], q[1] - 6.2, 1.3, .55, 0, 0, 7); g.fill(); // tanque de agua con tapa
  const an = P(t + .14, a + .14, r); antenaTV(g, an[0], an[1]);
}
// Carro particular estacionado (desde los años del conflicto, en las casas de ladrillo y de concreto).
// Carro particular estacionado (a lo largo de c): carrocería, cabina con vidrios que reflejan el cielo, farolas,
// bómper, placa amarilla y llantas con rin.
function carroCasa(g, x, y, col) {
  sombraPie(g, x + 1, y + .5, 10, 3, .28);
  // Cuatro llantas: las dos del lado de atrás se asoman por debajo (más oscuras, antes de la carrocería) y las dos
  // de este lado van delante, en el sitio de sus guardabarros.
  for (const [dx, dy] of [[-.86, -4.73], [5.66, -1.47]]) ruedaIso(g, x + dx, y + dy, 1.9, { llanta: '#141210', rin: '#5E6266' });
  const C = cajaPx(g, x, y, .34, .15, 3.4, col, { z0: 1.1 });
  const cab = cajaPx(g, x - 1, y - .5, .18, .14, 3, mezcla(col, '#FFFFFF', .05), { z0: 4.5 });
  for (const [dx, dy] of [[-5.66, -2.33], [.86, .93]]) { g.fillStyle = mezcla(col, '#000000', .45); g.beginPath(); g.ellipse(x + dx, y + dy - .4, 2.3, 2.5, 0, Math.PI, 0); g.fill(); ruedaIso(g, x + dx, y + dy, 1.9, { llanta: '#1E1A18' }); } // guardabarros y llantas de este lado
  const ins = (a, b, f) => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
  const vid = (q, c1) => { const gr = g.createLinearGradient(0, Math.min(...q.map(p => p[1])), 0, Math.max(...q.map(p => p[1]))); gr.addColorStop(0, '#CFE2EC'); gr.addColorStop(1, c1); rellena(g, q, gr, 'rgba(30,40,50,.5)', .25); };
  const iq = cab.izq, dr = cab.der;
  for (const [f0, f1] of [[.08, .47], [.53, .92]]) vid([ins(iq[0], iq[1], f0), ins(iq[0], iq[1], f1), ins(iq[3], iq[2], f1), ins(iq[3], iq[2], f0)].map((p, k) => [p[0], p[1] + (k < 2 ? -.5 : .5)]), '#5E84A0');
  vid([ins(dr[0], dr[1], .12), ins(dr[0], dr[1], .88), ins(dr[3], dr[2], .88), ins(dr[3], dr[2], .12)].map((p, k) => [p[0], p[1] + (k < 2 ? -.4 : .5)]), '#3E5A6E');
  const fr = C.der; g.fillStyle = '#F6EAA8'; for (const f of [.2, .8]) { const q = ins(fr[3], fr[2], f); g.beginPath(); g.ellipse(q[0], q[1] + 1.1, .7, .5, 0, 0, 7); g.fill(); } // farolas
  g.strokeStyle = '#8A8E92'; g.lineWidth = .6; g.beginPath(); g.moveTo(...ins(fr[0], fr[1], .02)); g.lineTo(...ins(fr[0], fr[1], .98)); g.stroke(); // bómper
  const pl = ins(fr[0], fr[1], .5); g.fillStyle = '#E8C23A'; g.fillRect(pl[0] - .9, pl[1] - 1.6, 1.8, .9); // placa
  g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = .3; g.beginPath(); g.moveTo(...C.izq[3]); g.lineTo(...C.izq[2]); g.stroke();
}
// Moto de lado (a lo largo de c): llantas con rin, tanque de color, sillín negro, manubrio con espejo y exosto.
function moto(g, x, y, col = '#B9442F') {
  sombraPie(g, x + .5, y + .3, 5, 1.6, .28);
  ruedaIso(g, x - 3, y - 1, 1.6, { llanta: '#1E1A18', rin: '#8E9296' }); ruedaIso(g, x + 3, y + 2, 1.6, { llanta: '#1E1A18', rin: '#8E9296' });
  g.fillStyle = '#3A3E42'; g.beginPath(); g.moveTo(x - 1.6, y - 2.4); g.lineTo(x + 1.4, y - .9); g.lineTo(x + .9, y + .2); g.lineTo(x - 1.8, y - 1.2); g.closePath(); g.fill(); // motor
  g.fillStyle = mezcla(col, '#000000', .25); g.beginPath(); g.moveTo(x - 3.2, y - 3.8); g.lineTo(x - .4, y - 2.5); g.lineTo(x - .6, y - 1.6); g.lineTo(x - 3.4, y - 2.8); g.closePath(); g.fill(); // tapa lateral
  g.strokeStyle = '#3A3E42'; g.lineWidth = .6; g.beginPath(); g.moveTo(x - 3, y - 2.8); g.lineTo(x + .5, y - 1.5); g.lineTo(x + 3, y + .2); g.stroke(); // chasís
  g.strokeStyle = '#B8BCC0'; g.lineWidth = .6; g.beginPath(); g.moveTo(x - 1.8, y - 1); g.lineTo(x - 4.2, y - 2); g.stroke(); // exosto
  g.fillStyle = col; g.beginPath(); g.moveTo(x - .8, y - 4.6); g.quadraticCurveTo(x + 1.4, y - 5.8, x + 2.4, y - 3.4); g.lineTo(x + .2, y - 2.3); g.lineTo(x - .9, y - 3); g.closePath(); g.fill(); g.fillStyle = 'rgba(255,255,255,.4)'; g.beginPath(); g.ellipse(x + .6, y - 4.4, .7, .3, .4, 0, 7); g.fill(); // tanque
  g.fillStyle = '#1E1A18'; g.beginPath(); g.moveTo(x - 3.4, y - 4.4); g.quadraticCurveTo(x - 1.6, y - 5, x - .3, y - 4.3); g.lineTo(x - .6, y - 3.6); g.lineTo(x - 3.2, y - 3.8); g.closePath(); g.fill(); // sillín
  g.strokeStyle = '#2A2E32'; g.lineWidth = .5; g.beginPath(); g.moveTo(x + 2, y - 3.2); g.lineTo(x + 2.6, y - 5.6); g.moveTo(x + 1.8, y - 5.9); g.lineTo(x + 3.6, y - 5.2); g.stroke(); g.fillStyle = '#B8BCC0'; g.beginPath(); g.arc(x + 1.7, y - 6.6, .35, 0, 7); g.fill(); // manubrio y espejo
  g.fillStyle = '#F6EAA8'; g.beginPath(); g.ellipse(x + 3.1, y - 4.2, .45, .4, 0, 0, 7); g.fill(); // farola
}
// Antena parabólica en ménsula contra el muro: plato con brillo, borde y el brazo del receptor.
function parabolica(g, x, y) {
  g.strokeStyle = '#6E7276'; g.lineWidth = .5; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 1.6, y + .6); g.stroke();
  g.save(); g.translate(x + 2.8, y - .2); g.rotate(-.35);
  const gr = g.createRadialGradient(-.6, -.8, .2, 0, 0, 2.8); gr.addColorStop(0, '#FFFFFF'); gr.addColorStop(.6, '#D8DCDE'); gr.addColorStop(1, '#9EA4A8');
  g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, 1.6, 2.8, 0, 0, 7); g.fill(); g.strokeStyle = '#7E8488'; g.lineWidth = .3; g.stroke();
  g.strokeStyle = '#5E6266'; g.lineWidth = .35; g.beginPath(); g.moveTo(0, 1.6); g.lineTo(2.6, .2); g.stroke(); g.fillStyle = '#3A3E42'; g.fillRect(2.4, -.2, .9, .8); // brazo y receptor
  g.restore();
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
    if (era >= 2 && v % 2 === 0) { const q = P(F.t + .12, F.a + .14, techo + (era === 3 ? 2.6 : 4)); cilindro(g, q[0], q[1], 2.8, 5.2, '#2E2E30', { arriba: 2.6, aros: 3, tapa: '#3E3E42' }); g.fillStyle = '#1A1A1C'; g.beginPath(); g.ellipse(q[0], q[1] - 5.4, 1, .45, 0, 0, 7); g.fill(); } // tanque plástico negro con aros
  }
  if (hist >= 5) {
    const d = F.en('der', .2, F.H - 3); parabolica(g, d[0], d[1]); // antena parabólica
    if (era === 3 && v % 2 === 1) { const a = F.a + .06, b = F.a + (F.b - F.a) * .55, r = F.t + .1, z = techo + 2.2; rellena(g, [P(r + .1, a, z), P(r + .1, b, z), P(r, b, z + 2.4), P(r, a, z + 2.4)], '#2C4A6E', 'rgba(30,40,55,.8)', .3); } // panel solar
    if (v === 0) { const m = P(F.f + .2, F.b + .02); g.save(); g.translate(m[0], m[1]); g.scale(1.45, 1.45); moto(g, 0, 0); g.restore(); } // moto
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
// Corredor de la casa campesina: piso de ladrillo un poco alzado, con su canto; pilares de madera sobre basas de
// piedra, zapatas y la viga que recibe el alero.
function corredor(g, F, sale, rh) {
  const o = .08, m = (F.f + F.t) / 2, H = F.z0 + F.H, zf = H - rh * sale / (F.f - m + o), r1 = F.f + sale, a = F.a - .02, b = F.b + .02, zp = 1.2;
  rellena(g, [P(F.f, a, zp), P(r1, a, zp), P(r1, b, zp), P(F.f, b, zp)], '#B5654A', 'rgba(60,30,20,.4)', .3); // piso
  g.save(); poli(g, [P(F.f, a, zp), P(r1, a, zp), P(r1, b, zp), P(F.f, b, zp)]); g.clip(); g.strokeStyle = 'rgba(80,35,20,.35)'; g.lineWidth = .3;
  for (let k = 1; k < 10; k++) { const c = a + (b - a) * k / 10; g.beginPath(); g.moveTo(...P(F.f, c, zp)); g.lineTo(...P(r1, c, zp)); g.stroke(); }
  for (let k = 1; k < 3; k++) { const r = F.f + sale * k / 3; g.beginPath(); g.moveTo(...P(r, a, zp)); g.lineTo(...P(r, b, zp)); g.stroke(); }
  g.fillStyle = 'rgba(30,18,10,.22)'; poli(g, [P(F.f, a, zp), P(F.f + sale * .55, a, zp), P(F.f + sale * .55, b, zp), P(F.f, b, zp)]); g.fill(); // sombra del alero sobre el piso
  g.restore();
  rellena(g, [P(r1, a, 0), P(r1, b, 0), P(r1, b, zp), P(r1, a, zp)], '#9E5640', 'rgba(60,30,20,.4)', .3); // canto del piso
  rellena(g, [P(r1, b, 0), P(F.f, b, 0), P(F.f, b, zp), P(r1, b, zp)], '#7E4432', 'rgba(60,30,20,.4)', .3);
  const rp = r1 - .035;
  g.strokeStyle = K.maderaOsc; g.lineWidth = 1.1; g.beginPath(); g.moveTo(...P(rp, a + .02, zf - .9)); g.lineTo(...P(rp, b - .02, zf - .9)); g.stroke(); // viga
  for (const u of [.03, .36, .66, .97]) {
    const c = F.a + (F.b - F.a) * u, p = P(rp, c, 0);
    cajaPx(g, p[0], p[1], .045, .045, 2.2, '#9A9284', { z0: zp, izq: '#B4AC9C', top: '#C4BCAC' }); // basa de piedra
    cajaPx(g, p[0], p[1], .026, .026, zf - zp - 3.4, K.madera, { z0: zp + 2.2, izq: K.maderaLuz, borde: 'rgba(40,22,12,.5)' }); // pilar
    cajaPx(g, p[0], p[1], .08, .03, .9, K.maderaOsc, { z0: zf - 1.6, izq: K.madera }); // zapata
  }
}
// Tapia del solar: muro con su textura y zócalo, grosor arriba, caballete de teja (o remate de concreto) y portón
// de tablas con sus travesaños y su aldaba.
function tapia(g, Tz, tc, era, zocalo, ca) {
  muros(g, Tz, tc, zocalo, { ladrillo: era === 2 });
  const H = Tz.H, e = .035, A = P(Tz.f, Tz.a, H), B = P(Tz.f, Tz.b, H), C = P(Tz.t, Tz.b, H);
  if (era === 3) {
    rellena(g, [A, B, P(Tz.f - e, Tz.b - e, H), P(Tz.f - e, Tz.a, H)], mezcla(tc, '#FFFFFF', .25), null);
    rellena(g, [B, C, P(Tz.t, Tz.b - e, H), P(Tz.f - e, Tz.b - e, H)], mezcla(tc, '#FFFFFF', .12), null);
  } else {
    const teja = K.teja, osc = K.tejaSombra;
    for (const [p0, p1, d] of [[A, B, 0], [B, C, 1]]) {
      const n = Math.max(4, Math.round(Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) / 2.2));
      rellena(g, [[p0[0], p0[1] + .6], [p1[0], p1[1] + .6], [p1[0], p1[1] - 1.2], [p0[0], p0[1] - 1.2]], d ? osc : teja, 'rgba(60,25,12,.5)', .3);
      for (let k = 0; k < n; k++) { const f = (k + .5) / n, x = p0[0] + (p1[0] - p0[0]) * f, y = p0[1] + (p1[1] - p0[1]) * f; g.fillStyle = d ? mezcla(osc, '#000000', .15) : K.tejaLuz; g.beginPath(); g.ellipse(x, y - .4, 1.1, .8, 0, 0, 7); g.fill(); g.fillStyle = 'rgba(40,12,5,.45)'; g.beginPath(); g.ellipse(x + .2, y + .5, .8, .35, 0, 0, 7); g.fill(); }
    }
  }
  hueco(g, Tz, 'izq', .3, .7, 0, 5, ca); hondura(g, Tz, 'izq', .3, .7, 0, 5, false);
  g.strokeStyle = 'rgba(30,18,10,.45)'; g.lineWidth = .3; for (let k = 1; k < 5; k++) { const u = .3 + .4 * k / 5; g.beginPath(); g.moveTo(...Tz.en('izq', u, .2)); g.lineTo(...Tz.en('izq', u, 4.8)); g.stroke(); } // tablas
  g.strokeStyle = mezcla(ca, '#000000', .35); g.lineWidth = .7; for (const z of [1.2, 3.8]) { g.beginPath(); g.moveTo(...Tz.en('izq', .31, z)); g.lineTo(...Tz.en('izq', .69, z)); g.stroke(); } // travesaños
  const al = Tz.en('izq', .53, 2.6); g.fillStyle = '#3A3430'; g.beginPath(); g.arc(al[0], al[1], .4, 0, 7); g.fill(); // aldaba
}
// Cerca de guadua con dos travesaños (o de postes y alambre de púas en las épocas nuevas).
function cerca(g, a, b, moderno) {
  const n = 5, pt = f => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
  for (let k = 0; k < n; k++) { const [x, y] = pt(k / (n - 1)); sombraPie(g, x, y, .8, .3, .3); g.strokeStyle = moderno ? '#6E6458' : '#9A8A4E'; g.lineWidth = .9; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - 5.4); g.stroke(); g.strokeStyle = moderno ? 'rgba(255,255,255,.15)' : '#C2B26E'; g.lineWidth = .3; g.beginPath(); g.moveTo(x - .25, y - .2); g.lineTo(x - .25, y - 5.2); g.stroke(); if (!moderno) { g.fillStyle = '#7A6A38'; g.beginPath(); g.ellipse(x, y - 5.4, .45, .25, 0, 0, 7); g.fill(); } }
  for (const z of moderno ? [1.6, 3, 4.4] : [1.8, 4]) {
    const [x0, y0] = pt(0), [x1, y1] = pt(1);
    if (moderno) { g.strokeStyle = 'rgba(90,90,90,.8)'; g.lineWidth = .25; g.beginPath(); g.moveTo(x0, y0 - z); g.lineTo(x1, y1 - z); g.stroke(); for (let f = .1; f < 1; f += .16) { const [x, y] = pt(f); g.beginPath(); g.moveTo(x - .3, y - z - .3); g.lineTo(x + .3, y - z + .3); g.stroke(); } }
    else { g.strokeStyle = '#8A7A40'; g.lineWidth = .8; g.beginPath(); g.moveTo(x0, y0 - z); g.lineTo(x1, y1 - z); g.stroke(); g.strokeStyle = '#C2B26E'; g.lineWidth = .25; g.beginPath(); g.moveTo(x0, y0 - z - .3); g.lineTo(x1, y1 - z - .3); g.stroke(); }
  }
}
// ---------- Elementos vivos ----------
// ---------- Detalles alrededor de la casa (pedido de Juan: «la base es perfecta, los detalles son terribles»;
// decidió redibujarlos con más detalle en vez de quitarlos). Todo con la misma luz: sol arriba a la izquierda, la
// cara que mira hacia el frente izquierdo con luz y la de la derecha en sombra.
// Caja isométrica en píxeles: (x, y) es el centro de la base en el suelo; lc y lr, el largo en casillas a lo largo
// de c y de r; h, la altura en píxeles; z0, a qué altura empieza.
function cajaPx(g, x, y, lc, lr, h, col, op = {}) {
  const z0 = op.z0 || 0, pt = (sc, sr, z) => [x + sc * 16 * lc - sr * 16 * lr, y + sc * 8 * lc + sr * 8 * lr - z0 - z];
  const izq = [pt(-1, 1, 0), pt(1, 1, 0), pt(1, 1, h), pt(-1, 1, h)], der = [pt(1, 1, 0), pt(1, -1, 0), pt(1, -1, h), pt(1, 1, h)], top = [pt(-1, 1, h), pt(1, 1, h), pt(1, -1, h), pt(-1, -1, h)];
  const b = op.borde === undefined ? 'rgba(50,32,20,.55)' : op.borde;
  rellena(g, izq, op.izq || col, b, .3); rellena(g, der, op.der || mezcla(col, '#000000', .25), b, .3); rellena(g, top, op.top || mezcla(col, '#FFFFFF', .18), b, .3);
  return { izq, der, top, pt };
}
// Rueda de pie en el plano de la dirección c (vista de lado en el isométrico): una elipse inclinada, con llanta,
// rayos y cubo; o, con op.llanta, una llanta de caucho con su rin.
function ruedaIso(g, cx, cy, r, op = {}) {
  const ux = .894 * (op.dir === -1 ? -1 : 1), uy = .447, n = 24;
  const camino = rr => { g.beginPath(); for (let k = 0; k <= n; k++) { const t = k / n * Math.PI * 2, x = cx + rr * Math.cos(t) * ux, y = cy + rr * Math.cos(t) * uy - rr * Math.sin(t); k ? g.lineTo(x, y) : g.moveTo(x, y); } g.closePath(); };
  if (op.llanta) { camino(r); g.fillStyle = op.llanta; g.fill(); camino(r * .6); g.fillStyle = op.rin || '#9A9EA2'; g.fill(); camino(r * .22); g.fillStyle = '#4A4E52'; g.fill(); return; }
  camino(r); g.strokeStyle = op.col || K.maderaOsc; g.lineWidth = op.grueso || 1; g.stroke();
  camino(r * .86); g.strokeStyle = 'rgba(255,220,170,.35)'; g.lineWidth = .3; g.stroke();
  g.strokeStyle = op.col || K.maderaOsc; g.lineWidth = .4;
  const n2 = op.rayos || 8; for (let k = 0; k < n2; k++) { const t = k / n2 * Math.PI * 2; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + r * Math.cos(t) * ux, cy + r * Math.cos(t) * uy - r * Math.sin(t)); g.stroke(); }
  g.fillStyle = op.col || K.maderaOsc; g.beginPath(); g.ellipse(cx, cy, r * .2, r * .22, 0, 0, 7); g.fill();
}
function sombraPie(g, x, y, rx, ry, al = .22) { g.save(); g.globalAlpha = al; g.fillStyle = '#2A2418'; g.beginPath(); g.ellipse(x + rx * .25, y + ry * .2, rx, ry, 0, 0, 7); g.fill(); g.restore(); }
// Cilindro de pie (tanques, canecas, materas): cuerpo con luz a la izquierda y sombra a la derecha, tapa elíptica.
function cilindro(g, x, y, r, h, col, op = {}) {
  const ry = r * .45, r2 = op.arriba || r, ry2 = r2 * .45;
  const gr = g.createLinearGradient(x - Math.max(r, r2), 0, x + Math.max(r, r2), 0); gr.addColorStop(0, mezcla(col, '#FFFFFF', .12)); gr.addColorStop(.35, mezcla(col, '#FFFFFF', .28)); gr.addColorStop(.75, col); gr.addColorStop(1, mezcla(col, '#000000', .35));
  g.beginPath(); g.moveTo(x - r, y); g.ellipse(x, y, r, ry, 0, Math.PI, 0, true); g.lineTo(x + r2, y - h); g.ellipse(x, y - h, r2, ry2, 0, 0, Math.PI, true); g.closePath(); g.fillStyle = gr; g.fill(); g.strokeStyle = 'rgba(30,24,18,.5)'; g.lineWidth = .3; g.stroke();
  if (op.aros) { g.strokeStyle = 'rgba(0,0,0,.28)'; g.lineWidth = .35; for (let k = 1; k <= op.aros; k++) { const f = k / (op.aros + 1), rr = r + (r2 - r) * f; g.beginPath(); g.ellipse(x, y - h * f, rr, rr * .45, 0, 0, Math.PI); g.stroke(); } }
  g.beginPath(); g.ellipse(x, y - h, r2, ry2, 0, 0, 7); g.fillStyle = op.tapa || mezcla(col, '#FFFFFF', .2); g.fill(); g.strokeStyle = 'rgba(30,24,18,.5)'; g.stroke();
}
// Hoja en punta (para matas, plátano y materas), con su mitad en sombra y su vena.
function hojaP(g, x, y, ang, L, A, col, vena = true) {
  g.save(); g.translate(x, y); g.rotate(ang);
  g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(L * .45, -A, L, 0); g.quadraticCurveTo(L * .45, A, 0, 0); g.fillStyle = col; g.fill();
  g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(L * .45, A, L, 0); g.closePath(); g.fillStyle = 'rgba(20,40,10,.22)'; g.fill();
  if (vena) { g.strokeStyle = 'rgba(230,240,190,.45)'; g.lineWidth = .25; g.beginPath(); g.moveTo(0, 0); g.lineTo(L * .95, 0); g.stroke(); }
  g.restore();
}
// Fogón de leña al aire libre: tres piedras con luz y sombra, brasas, leños cruzados, olla de barro tiznada con
// asas y un hilo de humo.
function fogon(g, x, y) {
  sombraPie(g, x, y, 4, 1.4, .25);
  for (const [dx, dy] of [[-2.4, 0], [2.2, .3], [0, 1.4]]) { g.fillStyle = '#6E665C'; g.beginPath(); g.ellipse(x + dx, y + dy - .4, 1.4, 1, 0, 0, 7); g.fill(); g.fillStyle = '#9A9284'; g.beginPath(); g.ellipse(x + dx - .4, y + dy - .8, .7, .45, 0, 0, 7); g.fill(); }
  g.strokeStyle = '#5A3A22'; g.lineWidth = .9; g.lineCap = 'round'; g.beginPath(); g.moveTo(x - 3.6, y + 1.6); g.lineTo(x + .6, y - .2); g.moveTo(x + 3.6, y + 1.8); g.lineTo(x - .4, y - .1); g.stroke(); // leños
  g.fillStyle = '#E8762E'; g.beginPath(); g.ellipse(x, y, 1.6, .6, 0, 0, 7); g.fill(); g.fillStyle = '#FFC24A'; g.beginPath(); g.ellipse(x - .2, y - .1, .8, .3, 0, 0, 7); g.fill(); // brasas
  cilindro(g, x, y - 1.2, 1.9, 2.4, '#3A2E26', { arriba: 2.3, tapa: '#2A2220' }); // olla tiznada
  g.strokeStyle = '#2A2220'; g.lineWidth = .4; for (const s2 of [-1, 1]) { g.beginPath(); g.arc(x + s2 * 2.5, y - 3, .5, 0, 7); g.stroke(); } // asas
  g.strokeStyle = 'rgba(220,215,205,.4)'; g.lineWidth = .7; g.beginPath(); g.moveTo(x, y - 4); g.bezierCurveTo(x - 1.5, y - 6.5, x + 1.5, y - 8, x - .5, y - 11); g.stroke(); // humo
}
// Chimenea del fogón sobre el techo: caja de cal con hollín y su caperuza de teja.
function chimenea(g, x, y) {
  const C = cajaPx(g, x, y, .05, .05, 6, K.cal, { izq: '#EDE6D6', der: '#C8BEAA', top: '#2A2420' });
  g.fillStyle = 'rgba(40,30,20,.35)'; g.beginPath(); g.moveTo(...C.izq[3]); g.lineTo(...C.izq[2]); g.lineTo(C.izq[2][0], C.izq[2][1] + 2.2); g.lineTo(C.izq[3][0], C.izq[3][1] + 1.4); g.fill(); // hollín
  cajaPx(g, x, y, .075, .075, .9, K.tejaSombra, { z0: 6.4, izq: K.teja, top: K.tejaLuz });
  g.strokeStyle = 'rgba(220,215,205,.35)'; g.lineWidth = .8; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y - 7.6); g.bezierCurveTo(x - 1.4, y - 10, x + 1.6, y - 11.5, x - .2, y - 14); g.stroke(); // humo
}
// Materas de barro: maceta que se angosta hacia abajo, con borde, tierra, hojas en punta y flores de cinco pétalos.
function materas(g, pts) {
  pts.forEach(([x, y], i) => {
    const R = mulberry(i * 37 + Math.round(x * 3) + Math.round(y * 7));
    sombraPie(g, x, y, 2.6, 1, .25);
    cilindro(g, x, y, 1.35, 3, '#B4593A', { arriba: 1.9 });
    g.beginPath(); g.ellipse(x, y - 3, 2.15, .95, 0, 0, 7); g.fillStyle = '#C46A48'; g.fill(); g.beginPath(); g.ellipse(x, y - 3.05, 1.7, .7, 0, 0, 7); g.fillStyle = '#4A3424'; g.fill(); // borde y tierra
    const verdes = ['#3F6E34', '#4E7A3A', '#5E8B42', '#6F9C4C'];
    for (let k = 0; k < 9; k++) { const a = -Math.PI / 2 + (k - 4) * .36 + (R() - .5) * .2; hojaP(g, x + (R() - .5), y - 3.2, a, 2.6 + R() * 1.6, .75, verdes[k % 4]); }
    const cols = [['#D8433A', '#F2A0A0'], ['#E7B23C', '#FFE08A'], ['#C2407A', '#F0A0C8']][i % 3];
    for (let k = 0; k < 3; k++) { const fx = x + (k - 1) * 1.3 + (R() - .5) * .6, fy = y - 5.6 - R() * 1.3; for (let q = 0; q < 5; q++) { const a = q / 5 * Math.PI * 2; g.fillStyle = cols[0]; g.beginPath(); g.ellipse(fx + Math.cos(a) * .45, fy + Math.sin(a) * .35, .38, .3, a, 0, 7); g.fill(); } g.fillStyle = cols[1]; g.beginPath(); g.arc(fx - .1, fy - .1, .22, 0, 7); g.fill(); g.fillStyle = '#F2D36A'; g.beginPath(); g.arc(fx, fy, .18, 0, 7); g.fill(); }
  });
}
// Banca de madera a lo largo de c: patas, asiento de tablas con su canto, espaldar y sus parales.
function banco(g, x, y) {
  sombraPie(g, x, y, 5, 1.6, .2);
  const en = (sc, sr) => [x + sc * 16 * .15 - sr * 16 * .045, y + sc * 8 * .15 + sr * 8 * .045];
  for (const sc of [-.8, .8]) for (const sr of [-.7, .7]) { const p = en(sc, sr); cajaPx(g, p[0], p[1], .012, .012, 2.6, K.maderaOsc, { borde: null }); }
  const a = cajaPx(g, x, y, .3, .09, .8, K.madera, { z0: 2.6, top: K.maderaLuz });
  g.strokeStyle = 'rgba(60,35,20,.45)'; g.lineWidth = .25; g.beginPath(); g.moveTo(...a.pt(-1, 0, .8)); g.lineTo(...a.pt(1, 0, .8)); g.stroke(); // junta de las tablas
  for (const sc of [-.85, .85]) { const p = en(sc, -.9); cajaPx(g, p[0], p[1], .01, .01, 3, K.maderaOsc, { z0: 3.4, borde: null }); }
  const e = en(0, -.9); cajaPx(g, e[0], e[1], .3, .012, 1.6, K.madera, { z0: 4.6, izq: K.maderaLuz }); // espaldar
}
// Ropa tendida: dos postes de guadua clavados (con su sombra y sus nudos), cuerda floja y prendas que cuelgan de
// verdad: camisa con mangas, pantalón, sábana con pliegues y un pañuelo, cada una con luz, sombra y sus ganchos.
function ropaTendida(g, a, b, R) {
  for (const p of [a, b]) { sombraPie(g, p[0], p[1], 1.6, .6, .3); g.strokeStyle = '#9A8A4E'; g.lineWidth = 1; g.lineCap = 'round'; g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(p[0], p[1] - 11.5); g.stroke(); g.strokeStyle = 'rgba(60,50,20,.5)'; g.lineWidth = .3; for (let z = 2; z < 11; z += 3) { g.beginPath(); g.moveTo(p[0] - .5, p[1] - z); g.lineTo(p[0] + .5, p[1] - z); g.stroke(); } }
  const cuerda = f => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f - 10.5 + Math.sin(f * Math.PI) * 2.2];
  g.strokeStyle = 'rgba(70,60,45,.8)'; g.lineWidth = .3; g.beginPath(); for (let k = 0; k <= 12; k++) { const [x, y] = cuerda(k / 12); k ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
  const pend = (b[1] - a[1]) / ((b[0] - a[0]) || 1);
  const prenda = (f, tipo, col) => {
    const [x, y] = cuerda(f), osc = mezcla(col, '#000000', .22), luz = mezcla(col, '#FFFFFF', .2);
    const Q = (dx, dy) => [x + dx, y + dy + dx * pend];
    if (tipo === 'camisa') {
      rellena(g, [Q(-1.6, 0), Q(-2.8, .6), Q(-2.4, 2.2), Q(-1.5, 1.6), Q(-1.4, 4.8), Q(1.4, 4.8), Q(1.5, 1.6), Q(2.4, 2.2), Q(2.8, .6), Q(1.6, 0)], col, 'rgba(40,30,20,.45)', .25);
      rellena(g, [Q(.3, .2), Q(1.6, 0), Q(2.8, .6), Q(2.4, 2.2), Q(1.5, 1.6), Q(1.4, 4.8), Q(.3, 4.8)], osc, null);
      g.strokeStyle = luz; g.lineWidth = .3; g.beginPath(); g.moveTo(...Q(0, .4)); g.lineTo(...Q(0, 4.6)); g.stroke();
    } else if (tipo === 'pantalon') {
      rellena(g, [Q(-1.5, 0), Q(1.5, 0), Q(1.7, 5.6), Q(.5, 5.6), Q(0, 1.8), Q(-.5, 5.6), Q(-1.7, 5.6)], col, 'rgba(40,30,20,.45)', .25);
      rellena(g, [Q(.2, 0), Q(1.5, 0), Q(1.7, 5.6), Q(.5, 5.6), Q(.1, 1.8)], osc, null);
    } else if (tipo === 'sabana') {
      const w = 3.4, h = 6;
      rellena(g, [Q(-w, 0), Q(w, 0), Q(w + .3, h), Q(-w - .2, h + .3)], col, 'rgba(40,30,20,.4)', .25);
      for (let k = -2; k <= 2; k++) { const dx = k * 1.3; g.fillStyle = k % 2 ? 'rgba(0,0,0,.09)' : 'rgba(255,255,255,.25)'; g.beginPath(); g.moveTo(...Q(dx - .3, .3)); g.lineTo(...Q(dx + .3, .3)); g.lineTo(...Q(dx + .5, h)); g.lineTo(...Q(dx - .5, h)); g.closePath(); g.fill(); } // pliegues
    } else rellena(g, [Q(-1.1, 0), Q(1.1, 0), Q(0, 2.4)], col, 'rgba(40,30,20,.45)', .25);
    g.fillStyle = '#6E5A3A'; for (const dx of [-1, 1]) { const q = Q(dx * 1.1, 0); g.fillRect(q[0] - .2, q[1] - .7, .4, 1); } // ganchos
  };
  const tipos = ['camisa', 'sabana', 'pantalon', 'panuelo'], cols = ['#F4EFE4', '#2F5D8A', '#B23A2E', '#E7C76B', '#3E6B4A'];
  const orden = [0, 1, 2, 3].sort(() => R() - .5);
  orden.forEach((k, i) => prenda((i + .65) / 4.4, tipos[k], tipos[k] === 'sabana' ? '#ECE6D6' : cols[Math.floor(R() * 5)]));
}
// Caballo criollo ensillado junto al poste de amarrar: cuerpo con volumen (luz en el lomo, sombra en la barriga),
// cuatro patas con corvejón y casco, cuello arqueado, cabeza con oreja, ojo y ollar, crin y cola en mechones, silla
// con pellón y estribo, y la rienda corta al poste (antes una cuerda larga suelta).
function caballo(g, x, y) {
  g.save();
  const px = x - 7; sombraPie(g, px, y, 1.4, .6, .3); g.fillStyle = K.maderaOsc; g.fillRect(px - .7, y - 9, 1.4, 9); g.fillStyle = K.madera; g.fillRect(px - .7, y - 9, .5, 9); g.strokeStyle = '#2A2420'; g.lineWidth = .4; g.beginPath(); g.ellipse(px + .9, y - 7.5, .6, .8, 0, 0, 7); g.stroke(); // poste con argolla
  g.translate(x + 2, y); g.scale(-.56, .56); // mira hacia el poste
  const col = '#8A5430', luz = '#B07A4E', osc = '#5A341C', casco = '#2A221C';
  g.globalAlpha = .26; g.fillStyle = '#2A2418'; g.beginPath(); g.ellipse(2, 1, 15, 3.6, 0, 0, 7); g.fill(); g.globalAlpha = 1;
  const pata = (x0, y0, dx1, c, w = 2.3) => { g.strokeStyle = c; g.lineCap = 'round'; g.lineWidth = w; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(x0 + dx1, -5, x0 + dx1 * .4, -1.4); g.stroke(); g.fillStyle = casco; g.beginPath(); g.ellipse(x0 + dx1 * .4 + .3, -.6, 1.3, .9, 0, 0, 7); g.fill(); };
  pata(-8, -10, 1.2, osc); pata(7, -10, -1, osc); // patas del otro lado, en sombra
  g.beginPath(); g.moveTo(-11, -17); g.bezierCurveTo(-6, -20.5, 4, -20, 9, -17.5); g.bezierCurveTo(11.5, -15, 11, -11, 9, -9.5); g.bezierCurveTo(3, -7.8, -4, -7.8, -9, -9.5); g.bezierCurveTo(-12.5, -11, -13, -15, -11, -17); g.closePath();
  const gc = g.createLinearGradient(0, -20, 0, -8); gc.addColorStop(0, luz); gc.addColorStop(.45, col); gc.addColorStop(1, osc); g.fillStyle = gc; g.fill(); g.strokeStyle = 'rgba(40,22,12,.6)'; g.lineWidth = .5; g.stroke();
  g.fillStyle = 'rgba(255,230,200,.18)'; g.beginPath(); g.ellipse(-6, -14.5, 3.5, 2.4, -.2, 0, 7); g.fill(); // anca con brillo
  pata(-6, -10, -1.5, col, 2.6); pata(9, -10, 1, col, 2.6);
  g.beginPath(); g.moveTo(6, -17.5); g.bezierCurveTo(8, -23, 11, -26.5, 14, -27.5); g.lineTo(18.5, -23.5); g.bezierCurveTo(19.5, -22, 18.6, -20.6, 17.2, -21); g.lineTo(14, -22.5); g.bezierCurveTo(12.5, -19, 11.5, -15, 10, -12); g.closePath();
  const gn = g.createLinearGradient(8, -27, 14, -14); gn.addColorStop(0, luz); gn.addColorStop(1, col); g.fillStyle = gn; g.fill(); g.strokeStyle = 'rgba(40,22,12,.6)'; g.stroke();
  g.fillStyle = osc; g.beginPath(); g.moveTo(13.2, -27.6); g.lineTo(13.8, -30); g.lineTo(14.8, -27.6); g.fill(); // oreja
  g.fillStyle = '#1E1612'; g.beginPath(); g.arc(15.2, -25.4, .5, 0, 7); g.fill(); g.beginPath(); g.arc(18.2, -22, .35, 0, 7); g.fill(); // ojo y ollar
  g.strokeStyle = '#2A1A10'; g.lineCap = 'round'; for (let k = 0; k < 6; k++) { g.lineWidth = 1.1 - k * .1; g.beginPath(); g.moveTo(13 - k * 1.1, -27 + k * 1.6); g.quadraticCurveTo(11 - k * 1.1, -26 + k * 1.6, 10.6 - k * 1.2, -23.4 + k * 1.6); g.stroke(); } // crin
  for (let k = 0; k < 4; k++) { g.lineWidth = 1.2 - k * .2; g.beginPath(); g.moveTo(-11.5, -16 + k * .4); g.bezierCurveTo(-14.5, -13, -13.5 - k * .5, -8, -12.5 - k * .6, -4.5); g.stroke(); } // cola
  g.fillStyle = '#B23A2E'; g.beginPath(); g.moveTo(-4.6, -18.6); g.lineTo(3.6, -18.8); g.lineTo(4.2, -13.2); g.lineTo(-5, -13); g.closePath(); g.fill(); g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(-4.6, -16.4, 8.6, .6); // pellón con franja
  g.fillStyle = '#3A2418'; g.beginPath(); g.moveTo(-3.6, -19.4); g.quadraticCurveTo(0, -21.4, 3, -19.6); g.lineTo(2.6, -18.2); g.lineTo(-3.2, -18); g.closePath(); g.fill(); g.fillStyle = '#5A3A26'; g.beginPath(); g.ellipse(2.8, -20.2, .9, .7, 0, 0, 7); g.fill(); // silla
  g.strokeStyle = '#2A1A10'; g.lineWidth = .4; g.beginPath(); g.moveTo(0, -18.2); g.lineTo(0, -12); g.stroke(); g.fillStyle = '#6E6A64'; g.fillRect(-.8, -12.2, 1.6, .8); // estribo
  g.strokeStyle = '#3A2A1E'; g.lineWidth = .45; g.beginPath(); g.moveTo(18, -22.4); g.quadraticCurveTo(20, -18, 23.5, -13.5); g.stroke(); // rienda corta al poste
  g.restore();
}
// Carreta de madera de dos ruedas: cajón de tablas con su canto y travesaños, ruedas de rayos con llanta de hierro,
// varas que descansan en el suelo sobre un taco, y bultos de café cosidos.
function carreta(g, x, y) {
  sombraPie(g, x + 2, y, 11, 3.2, .24);
  ruedaIso(g, x - 3.5, y - 3.8, 3.8, { rayos: 10 });
  const cx = x + 1, cy = y - 1, B = cajaPx(g, cx, cy, .36, .16, 3.6, '#9A6E42', { z0: 4.2, izq: '#A87A4C', top: '#5E4026' });
  g.strokeStyle = 'rgba(50,30,15,.55)'; g.lineWidth = .3; for (const f of [.33, .66]) { g.beginPath(); g.moveTo(...B.pt(-1, 1, 3.6 * f)); g.lineTo(...B.pt(1, 1, 3.6 * f)); g.stroke(); } // tablas
  g.fillStyle = '#5E4026'; for (const sc of [-.95, 0, .95]) { const a = B.pt(sc, 1, 0), b = B.pt(sc, 1, 3.6); g.fillRect(a[0] - .35, b[1], .7, a[1] - b[1]); } // travesaños
  const saco = (sx, sy) => { const gr = g.createLinearGradient(sx - 2.6, 0, sx + 2.6, 0); gr.addColorStop(0, '#D8C49A'); gr.addColorStop(1, '#A8926A'); g.fillStyle = gr; g.beginPath(); g.ellipse(sx, sy, 2.7, 1.7, .45, 0, 7); g.fill(); g.strokeStyle = 'rgba(80,60,30,.6)'; g.lineWidth = .3; g.stroke(); g.beginPath(); g.moveTo(sx - 1.6, sy - .6); g.lineTo(sx + 1.6, sy + 1); g.stroke(); };
  saco(cx - 3.2, cy - 8.8); saco(cx + 1.4, cy - 7.4); saco(cx - .8, cy - 10.6);
  ruedaIso(g, x + 4.2, y - .4, 3.8, { rayos: 10 });
  g.strokeStyle = K.madera; g.lineWidth = .9; g.lineCap = 'round'; for (const d of [-1.2, 1.2]) { g.beginPath(); g.moveTo(cx + 5 + d, cy - 4 + d * .5); g.lineTo(cx + 14 + d, cy + .2 + d * .5); g.stroke(); } // varas
  cajaPx(g, cx + 13.5, cy + 1, .03, .05, 1.2, '#7A6A5A', { borde: null }); // taco
}
// Mata de plátano del solar: seudotallo con vainas, hojas grandes con nervadura y rasgadas por el viento, un
// racimo verde y la bellota morada colgando.
function platanoSolar(g, x, y) {
  sombraPie(g, x + 2, y, 6, 2, .2);
  const R = mulberry(Math.round(x * 13 + y * 7) + 1000);
  for (const [dx, h, w] of [[-1.6, 7, 1.4], [0, 11, 1.8]]) { const gr = g.createLinearGradient(x + dx - w, 0, x + dx + w, 0); gr.addColorStop(0, '#A6B46A'); gr.addColorStop(.6, '#7E9048'); gr.addColorStop(1, '#5E6E34'); g.fillStyle = gr; g.beginPath(); g.moveTo(x + dx - w, y); g.lineTo(x + dx - w * .7, y - h); g.lineTo(x + dx + w * .7, y - h); g.lineTo(x + dx + w, y); g.closePath(); g.fill(); g.strokeStyle = 'rgba(70,50,30,.35)'; g.lineWidth = .3; g.beginPath(); g.moveTo(x + dx, y); g.lineTo(x + dx + .2, y - h); g.stroke(); }
  const hoja = (a, L, col) => {
    const x0 = x, y0 = y - 11, tx = x0 + Math.cos(a) * L, ty = y0 + Math.sin(a) * L * .55 + L * .25, mx = (x0 + tx) / 2, my = (y0 + ty) / 2 - L * .18;
    g.fillStyle = col; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(mx - 2.2, my - 2, tx, ty); g.quadraticCurveTo(mx + 2, my + 2.2, x0, y0 + .6); g.fill();
    g.strokeStyle = 'rgba(30,50,20,.3)'; g.lineWidth = .3; for (let k = 1; k < 7; k++) { const f = k / 7, qx = x0 + (tx - x0) * f, qy = y0 + (ty - y0) * f - Math.sin(f * Math.PI) * L * .18; g.beginPath(); g.moveTo(qx, qy); g.lineTo(qx + 1.2, qy + 1.6); g.stroke(); } // nervaduras y rasgaduras
    g.strokeStyle = '#C8D088'; g.lineWidth = .35; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(mx, my, tx, ty); g.stroke(); // nervio central
  };
  [[-2.7, 9, '#4E7A3A'], [-.4, 10, '#5E8B42'], [-1.6, 8, '#6F9C4C'], [-3.4, 7, '#3F6631'], [.5, 8, '#6F9C4C'], [-2.1, 6, '#86AE5A']].forEach(([a, L, c]) => hoja(a + (R() - .5) * .2, L, c));
  g.fillStyle = '#6E8E3A'; for (let k = 0; k < 6; k++) { g.beginPath(); g.ellipse(x + 2 + (k % 2) * .9, y - 9 + k * .8, 1, .45, .5, 0, 7); g.fill(); } // racimo
  g.fillStyle = '#6E2A4A'; g.beginPath(); g.ellipse(x + 2.6, y - 3.2, .9, 1.5, .2, 0, 7); g.fill(); g.strokeStyle = '#6E8E3A'; g.lineWidth = .3; g.beginPath(); g.moveTo(x + 2.4, y - 4.6); g.lineTo(x + 2.4, y - 6.2); g.stroke(); // bellota
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
    const sale = v === 0 && era === 0 ? .22 : 0, rh = pisos === 1 ? 10 : 11;
    if (sale) corredor(g, F, sale, rh); // piso, pilares y viga bajo el alero, antes del techo para que el alero los tape
    dosAguas(g, F, rh, { ...teja, sale });
  }
  if (era < 2 && v !== 1 && R() < .7) { const p = P(F.t + .1, F.a + .18, F.z0 + F.H + 6.5); chimenea(g, p[0], p[1]); } // chimenea del fogón
  detallesEpoca(g, F, era, v, hist);
  if (era < 2 && (v === 0 || v === 2)) lena(g, F, R);
  // Capa 4: elementos vivos, al frente de la casa.
  if (v === 0) { const y0 = F.f + (era === 0 ? .17 : .1); materas(g, hist >= 5 ? [P(y0, F.a + .1), P(y0, F.a + .22)] : [P(y0, F.a + .1), P(y0, F.a + .22), P(y0, F.b - .1)]); if (era === 0) banco(g, ...P(y0 - .04, F.a + .45)); }
  if (v === 1) ropaTendida(g, P(F.f + .08, F.b + .1), P(F.t + .12, F.b + .2), R);
  if (v === 2) { const p = P(F.f + .22, F.a + .12); hist >= 4 && era >= 2 ? carroCasa(g, p[0] + 4, p[1] + 2, ['#B9442F', '#2F5D8A', '#E8E4DA'][hist % 3]) : era === 3 ? carreta(g, p[0] + 6, p[1] + 2) : caballo(g, p[0], p[1]); }
  if (v === 3) {
    // Tapia del solar (bahareque o ladrillo) con su portón y la carreta al frente.
    const tc = era === 2 ? K.ladrillo : era === 3 ? K.concreto[v] : K.cal, Tz = caras(.34, .5, 6, -.1, .31);
    tapia(g, Tz, tc, era, era < 2 ? zo : null, ca);
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
  const q = P(F.f + .12, F.b - .06);
  if (!moderno) {
    fogon(g, q[0], q[1]);
    if (v === 2) lena(g, F, R); // leña arrumada contra el rancho
  } else {
    sombraPie(g, q[0], q[1], 3, 1.2, .28); cilindro(g, q[0], q[1], 2.5, 6.4, '#2F6FA8', { aros: 2, tapa: '#3E82BE' }); g.fillStyle = '#24588A'; g.beginPath(); g.ellipse(q[0], q[1] - 6.4, 1.6, .7, 0, 0, 7); g.fill(); // caneca azul
    if (v === 2 || v === 3) ropaTendida(g, P(F.f + .1, F.a - .05), P(F.t + .05, F.a - .12), R);
  }
  if (v === 3) cerca(g, P(F.f + .26, F.b + .04), P(F.f + .26, F.b - .32), moderno); // cerca de guadua (o de alambre) del solar

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
export { casa as casaColonial, P, K, MAT, mezcla, poli, rellena, grad, caras, muros, hiladas, hueco, ventana, puerta, balcon, tejas, dosAguas, cuatroAguas, terraza, sombraCasa, materas, caballo, carreta, banco as bancoMadera, cajaPx, cilindro, hojaP, sombraPie, ruedaIso, moto };
