// Edificios: bahareque, casona, taller y las obras de la versión 9. Se hornean una vez en una hoja; el mapa solo pone
// copias. Fase 8: pintados al fresco (color plano de pigmento, manchas de muro y contorno siena); los edificios
// públicos son neoclásicos, con podio, columnas, friso, frontón y un emblema que dice qué es cada uno.
import { mulberry, shade, mix, poly, lienzo } from './acuarela.js';
import { FR, pintar, ovalo, urlDe, RES_HOJA } from './fresco.js';
import { recetasCasas } from './casas.js';
import { recetasPublicos } from './publicos.js';

// Pinceles del fresco con la misma firma de los de acuarela (así todas las obras cambian de estilo a la vez).
function wash(g, pts, col, rng, al = .9) { g.save(); g.globalAlpha = Math.min(1, al + .05); pintar(g, pts, col, rng, { n: 2, al: .1, bw: .45, bal: .6 }); g.restore(); }
function blob(g, x, y, rx, ry, col, rng, al = .9) { g.save(); g.globalAlpha = al; ovalo(g, x, y, rx, ry, col, rng, { n: 1, bw: .35, bal: .45 }); g.restore(); }
import { TW, TH } from './iso.js';

const ESCALA = RES_HOJA; // resolución del horneado (fase 8: 3 en celulares, 4 en computador)
const lerp = (a, b, t) => a + (b - a) * t;

// ---------- Pinceles de construcción ----------
function V2(u, v, z) { return [(u - v) * TW / 2, (u + v) * TH / 2 - (z || 0)]; }
// Caja isométrica: ancho w (a lo largo de las columnas), fondo d, desde la altura z0 con alto h.
function iso(g, w, d, z0, h, cl, cr, ct, rng, ou = 0, ov = 0) {
  const A = V2(ou - w / 2, ov - d / 2), B = V2(ou + w / 2, ov - d / 2), C = V2(ou + w / 2, ov + d / 2), D = V2(ou - w / 2, ov + d / 2), up = (p, z) => [p[0], p[1] - z];
  wash(g, [up(D, z0), up(C, z0), up(C, z0 + h), up(D, z0 + h)], cl, rng, .97, .5);
  wash(g, [up(C, z0), up(B, z0), up(B, z0 + h), up(C, z0 + h)], cr, rng, .97, .5);
  if (ct) wash(g, [up(A, z0 + h), up(B, z0 + h), up(C, z0 + h), up(D, z0 + h)], ct, rng, .97, .5);
  return { A, B, C, D, z: z0 + h, up };
}
// Techo a dos aguas sobre una caja.
function techo(g, b, over, rh, col, wall, rng) {
  const o = over, z = b.z, A = [b.A[0], b.A[1] - o * .2], Bq = [b.B[0] + o, b.B[1]], C = [b.C[0], b.C[1] + o * .6], D = [b.D[0] - o, b.D[1]];
  const up = p => [p[0], p[1] - z], m1 = [(A[0] + D[0]) / 2, (A[1] + D[1]) / 2 - z - rh], m2 = [(Bq[0] + C[0]) / 2, (Bq[1] + C[1]) / 2 - z - rh];
  wash(g, [up(A), up(Bq), m2, m1], shade(col, -.22), rng, .98, .4);
  wash(g, [[b.C[0], b.C[1] - z], [b.B[0], b.B[1] - z], [(b.B[0] + b.C[0]) / 2, (b.B[1] + b.C[1]) / 2 - z - rh + 1]], wall, rng, .98, .3);
  wash(g, [up(D), up(C), m2, m1], col, rng, .98, .4);
  g.globalAlpha = .35; g.strokeStyle = shade(col, -.35); g.lineWidth = .5;
  for (let k = 1; k < 7; k++) { const f = k / 7, p = [up(D)[0] + (up(C)[0] - up(D)[0]) * f, lerp(up(D)[1], up(C)[1], f)], q = [lerp(m1[0], m2[0], f), lerp(m1[1], m2[1], f)]; g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); g.stroke(); }
  g.globalAlpha = .22; g.fillStyle = '#2A2018'; poly(g, [[b.D[0], b.D[1] - z], [b.C[0], b.C[1] - z], [b.C[0], b.C[1] - z + 3], [b.D[0], b.D[1] - z + 3]]); g.fill(); g.globalAlpha = 1;
}
// Tramos de las caras visibles: izquierda (D→C) y derecha (C→B). s: inicio 0..1, w: ancho, z: altura, h: alto.
function caraI(b, s, w, z, h) { const p = [lerp(b.D[0], b.C[0], s), lerp(b.D[1], b.C[1], s)], q = [lerp(b.D[0], b.C[0], s + w), lerp(b.D[1], b.C[1], s + w)]; return [[p[0], p[1] - z], [q[0], q[1] - z], [q[0], q[1] - z - h], [p[0], p[1] - z - h]]; }
function caraD(b, s, w, z, h) { const p = [lerp(b.C[0], b.B[0], s), lerp(b.C[1], b.B[1], s)], q = [lerp(b.C[0], b.B[0], s + w), lerp(b.C[1], b.B[1], s + w)]; return [[p[0], p[1] - z], [q[0], q[1] - z], [q[0], q[1] - z - h], [p[0], p[1] - z - h]]; }
function sombra(g, rx, ry, dx) { g.globalAlpha = .2; g.fillStyle = '#26301E'; g.beginPath(); g.ellipse(dx || 4, 2, rx, ry, 0, 0, 7); g.fill(); g.globalAlpha = 1; }
function bandera(g, x, y, h, col) {
  g.strokeStyle = '#5A4A3A'; g.lineWidth = .9; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - h); g.stroke();
  g.fillStyle = col; g.globalAlpha = .95; g.beginPath(); g.moveTo(x, y - h); g.quadraticCurveTo(x + 5, y - h - 1.5, x + 9, y - h + 1); g.lineTo(x + 9, y - h + 6); g.quadraticCurveTo(x + 5, y - h + 4, x, y - h + 5); g.fill(); g.globalAlpha = 1;
}
function banderines(g, a, b, rng) {
  g.strokeStyle = '#6B4F3A'; g.lineWidth = .5; g.beginPath(); g.moveTo(...a); g.quadraticCurveTo((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 5, ...b); g.stroke();
  const cols = ['#C0602A', '#E7C76B', '#2D6E5E', '#C4513B', '#F4ECDB'];
  for (let k = 1; k < 8; k++) { const f = k / 8, x = lerp(a[0], b[0], f), y = lerp(a[1], b[1], f) + Math.sin(f * Math.PI) * 4.5; g.fillStyle = cols[k % 5]; g.beginPath(); g.moveTo(x - 1.6, y); g.lineTo(x + 1.6, y); g.lineTo(x, y + 3.2); g.fill(); }
}
function monedas(g, x, y) { for (let k = 0; k < 4; k++) { g.fillStyle = k % 2 ? '#E2B24F' : '#C9962E'; g.beginPath(); g.ellipse(x, y - k * 2.2, 4.5, 1.8, 0, 0, 7); g.fill(); } }

// ---------- Recetas: [clave, ancho, alto, anclaX, anclaY, pintura] ----------
function recetas() {
  const L = [];
  // Renovación colonial: casas de src/arte/casas.js (cuatro variantes distintas, cuatro épocas y la versión húmeda).
  L.push(...recetasCasas());
  // Mercado de toldos (Aldea y Pueblo) y galería de mercado (desde Ciudad).
  // Fase 2: con la comida cara los puestos quedan vacíos (variante 'v', sin frutas y con cajas vacías).
  for (const vacio of [false, true]) L.push([vacio ? 'mercado0v' : 'mercado0', 78, 58, 39, 40, (g, r) => {
    sombra(g, 24, 6, 6);
    const puesto = (ou, ov, col) => {
      const b = iso(g, .24, .2, 0, 7, '#9C7447', '#7E5C37', '#B58B58', r, ou, ov);
      for (let k = 0; k < 4; k++) wash(g, caraI(b, k * .25, .25, 7, 4), k % 2 ? '#F4ECDB' : col, r, .97, .2);
      for (let k = 0; k < 3; k++) wash(g, caraD(b, k * .33, .33, 7, 4), k % 2 ? '#F4ECDB' : col, r, .97, .2);
      const c = V2(ou, ov + .14);
      if (vacio) { g.strokeStyle = '#7E5C37'; g.lineWidth = .6; g.strokeRect(c[0] - 3, c[1] - 2.5, 3.2, 2.2); }
      else { blob(g, c[0] - 3, c[1] - 1, 1.6, 1.2, '#E0A030', r, .9); blob(g, c[0], c[1] - .5, 1.6, 1.2, '#7FA04A', r, .9); blob(g, c[0] + 3, c[1] - 1, 1.5, 1.1, '#C44A3A', r, .9); }
    };
    puesto(-.2, -.18, '#C4513B'); puesto(.22, -.12, '#2D6E5E'); puesto(-.02, .2, '#C08A2A');
    const s = V2(.3, .3); wash(g, [[s[0] - 3, s[1]], [s[0] + 3, s[1]], [s[0] + 3, s[1] - 4], [s[0] - 3, s[1] - 4]], vacio ? '#8E7A5E' : '#B09060', r, .95, .2);
  }]);
  for (const vacio of [false, true]) L.push([vacio ? 'mercado2v' : 'mercado2', 90, 64, 45, 44, (g, r) => {
    sombra(g, 28, 7, 8); const b = iso(g, .8, .66, 0, 13, '#E9DBBB', '#CDBB96', null, r);
    for (let k = 0; k < 5; k++) { const p = caraI(b, .06 + k * .19, .13, 0, 9); wash(g, p, '#5E4632', r, .97, .15); if (!vacio) blob(g, (p[0][0] + p[1][0]) / 2, (p[0][1] + p[1][1]) / 2 - 3, 2, 1.3, k % 2 ? '#E0A030' : '#7FA04A', r, .9); }
    for (let k = 0; k < 3; k++) wash(g, caraD(b, .12 + k * .3, .16, 0, 9), '#4E3A2A', r, .97, .15);
    for (let k = 0; k < 6; k++) wash(g, caraI(b, k / 6, 1 / 6, 10, 3), k % 2 ? '#F4ECDB' : '#2D6E5E', r, .97, .2);
    techo(g, b, 4, 9, '#B4553A', '#CDBB96', r);
  }]);
  // Huellas de las decisiones (fase 4): figuras pequeñas que quedan unos años en el espacio público.
  const persona = (g, x, y, ropa, gorro) => { g.fillStyle = ropa; g.fillRect(x - 1.2, y - 7, 2.4, 5); g.fillStyle = '#C98E62'; g.beginPath(); g.arc(x, y - 8.2, 1.3, 0, 7); g.fill(); if (gorro) { g.fillStyle = gorro; g.fillRect(x - 1.6, y - 10, 3.2, 1.3); } };
  L.push(['m_mural', 56, 44, 28, 34, (g, r) => {
    sombra(g, 18, 4, 4); const b = iso(g, .62, .1, 0, 13, '#E8DFCC', '#CFC4AE', '#D8CDB6', r);
    const cols = ['#C0602A', '#2D6E5E', '#E7C76B', '#C4513B', '#5E8FB0', '#7A4E8A'];
    for (let k = 0; k < 6; k++) wash(g, caraI(b, .04 + k * .155, .15, 2 + (k % 2) * 3, 6 + (k % 3) * 2), cols[k], r, .9, .3);
    const s = caraI(b, .3, .4, 4, 4); blob(g, (s[0][0] + s[2][0]) / 2, (s[0][1] + s[2][1]) / 2, 3, 2.4, '#F4EFE2', r, .9);
  }]);
  // Fase 12: estandarte del pueblo: pedestal de piedra, asta y bandera roja con borde ocre.
  L.push(['m_estandarte', 40, 64, 20, 54, (g, r) => {
    sombra(g, 12, 3.5, 2); const b = iso(g, .3, .3, 0, 6, '#E3D9C4', '#C9BDA4', '#D6CBB3', r);
    g.strokeStyle = '#5B3423'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(0, -6); g.lineTo(0, -48); g.stroke();
    g.fillStyle = '#D4A24C'; g.beginPath(); g.arc(0, -49, 1.6, 0, 7); g.fill();
    pintar(g, [[0.5, -46], [15, -44], [13, -38], [15, -32], [0.5, -33]], '#9C2F25', r, { n: 1, bw: .4, bal: .6 });
    g.strokeStyle = '#D4A24C'; g.lineWidth = .8; g.beginPath(); g.moveTo(1.5, -44.5); g.lineTo(13.5, -43); g.stroke();
    g.fillStyle = '#F7F1E3'; g.beginPath(); g.arc(7, -39.3, 2.4, 0, 7); g.fill();
  }]);
  L.push(['m_reten', 56, 46, 28, 36, (g, r) => {
    sombra(g, 20, 5, 4);
    for (const [u, v] of [[-.3, .1], [.05, .25], [.32, -.05]]) { const q = V2(u, v); for (let k = 0; k < 3; k++) wash(g, [[q[0] - 6, q[1] - k * 2.2], [q[0] + 6, q[1] - k * 2.2], [q[0] + 6, q[1] - k * 2.2 - 2], [q[0] - 6, q[1] - k * 2.2 - 2]], '#B7A27A', r, .95, .2); }
    const v = V2(-.05, -.25); for (let k = 0; k < 5; k++) { g.fillStyle = k % 2 ? '#F4F1E6' : '#C0392B'; g.fillRect(v[0] - 10 + k * 4, v[1] - 9, 4, 2.4); } g.fillStyle = '#4A3A2C'; g.fillRect(v[0] - 10, v[1] - 6.6, 1, 6.6); g.fillRect(v[0] + 9, v[1] - 6.6, 1, 6.6);
    const q = V2(.25, .2); persona(g, q[0], q[1], '#3F4A36', '#2E3A28');
  }]);
  L.push(['m_valla', 50, 56, 25, 46, (g, r) => {
    sombra(g, 12, 3, 2); const p = V2(0, 0); g.fillStyle = '#5A4632'; g.fillRect(p[0] - 9, p[1] - 22, 1.6, 22); g.fillRect(p[0] + 8, p[1] - 22, 1.6, 22);
    wash(g, [[p[0] - 14, p[1] - 21], [p[0] + 15, p[1] - 23], [p[0] + 15, p[1] - 38], [p[0] - 14, p[1] - 36]], '#F2E6C4', r, .97, .3);
    wash(g, [[p[0] - 12, p[1] - 25], [p[0] + 3, p[1] - 26], [p[0] + 3, p[1] - 34], [p[0] - 12, p[1] - 33]], '#C9962E', r, .95, .2); monedas(g, p[0] + 9, p[1] - 27);
  }]);
  L.push(['m_placa', 40, 44, 20, 36, (g, r) => {
    sombra(g, 10, 3, 2); const b = iso(g, .3, .3, 0, 4, '#A9A39A', '#8E887F', '#BEB8AE', r);
    const o = iso(g, .1, .1, 4, 16, '#C9C3B8', '#AAA49A', '#D6D0C6', r); const t = o.up(V2(0, 0), 20); blob(g, t[0], t[1] - 1, 2.2, 1.6, '#D9A93E', r, .9);
    wash(g, caraI(b, .2, .6, 1, 2.4), '#6B6258', r, .95, .2);
  }]);
  L.push(['m_olla', 52, 44, 26, 34, (g, r) => {
    sombra(g, 16, 4, 4); const p = V2(0, 0);
    wash(g, [[p[0] - 14, p[1] - 12], [p[0] + 14, p[1] - 12], [p[0] + 9, p[1] - 22], [p[0] - 9, p[1] - 22]], '#E7C76B', r, .95, .3);
    g.fillStyle = '#5A4632'; g.fillRect(p[0] - 12, p[1] - 12, 1.2, 12); g.fillRect(p[0] + 11, p[1] - 12, 1.2, 12);
    blob(g, p[0] - 2, p[1] - 3, 5, 3, '#3A3532', r, .95); g.fillStyle = '#C0602A'; g.beginPath(); g.arc(p[0] - 2, p[1] + .5, 2, 0, 7); g.fill();
    persona(g, p[0] + 6, p[1] + 2, '#B4553A', '#F4F1E6'); persona(g, p[0] - 9, p[1] + 3, '#5A6F7E');
  }]);
  L.push(['m_pancarta', 56, 46, 28, 36, (g, r) => {
    sombra(g, 18, 4, 4); const p = V2(0, 0);
    for (const [dx, col] of [[-12, '#F4F1E6'], [0, '#E7C76B'], [12, '#F4F1E6']]) { g.fillStyle = '#5A4632'; g.fillRect(p[0] + dx, p[1] - 22, 1, 20); wash(g, [[p[0] + dx - 5, p[1] - 22], [p[0] + dx + 6, p[1] - 22], [p[0] + dx + 6, p[1] - 15], [p[0] + dx - 5, p[1] - 15]], col, r, .95, .2); g.fillStyle = '#B03A2E'; g.fillRect(p[0] + dx - 3, p[1] - 19.5, 7, 1.2); g.fillRect(p[0] + dx - 3, p[1] - 17.5, 5, 1); }
    persona(g, p[0] - 6, p[1] + 1, '#5A6F7E'); persona(g, p[0] + 6, p[1] + 2, '#B4553A');
  }]);
  L.push(['m_vivero', 54, 40, 27, 30, (g, r) => {
    sombra(g, 18, 4, 4); const b = iso(g, .62, .42, 0, 2, '#7A5A3A', '#6A4C30', '#8C6A44', r);
    for (let k = 0; k < 9; k++) { const q = b.up(V2(-.22 + (k % 3) * .22, -.14 + Math.floor(k / 3) * .14), 2); blob(g, q[0], q[1] - 2, 2.2, 2.6, k % 2 ? '#5E8A4D' : '#7FA35C', r, .95); }
    const q = V2(.3, .25); persona(g, q[0], q[1], '#2D6E5E', '#E7C76B');
  }]);
  L.push(['m_campamento', 60, 46, 30, 36, (g, r) => {
    sombra(g, 20, 5, 4);
    for (const [u, v, col] of [[-.25, -.05, '#4E5A3A'], [.18, .12, '#5E6A44']]) { const q = V2(u, v); wash(g, [[q[0] - 9, q[1]], [q[0] + 9, q[1]], [q[0], q[1] - 12]], col, r, .97, .3); wash(g, [[q[0] - 2, q[1]], [q[0] + 2, q[1]], [q[0], q[1] - 5]], '#2A2A22', r, .95, .2); }
    const f = V2(.32, -.25); blob(g, f[0], f[1], 3, 1.6, '#3A3532', r, .9); g.fillStyle = '#C0602A'; g.beginPath(); g.arc(f[0], f[1] - 1, 1.2, 0, 7); g.fill();
    const q = V2(-.02, .3); persona(g, q[0], q[1], '#3E4A30', '#2A2A22');
  }]);
  L.push(['m_tratado', 44, 50, 22, 40, (g, r) => {
    sombra(g, 10, 3, 2); const p = V2(0, 0); g.fillStyle = '#6B4F3A'; g.fillRect(p[0] - .8, p[1] - 26, 1.8, 26);
    wash(g, [[p[0], p[1] - 24], [p[0] + 14, p[1] - 24], [p[0] + 18, p[1] - 21], [p[0] + 14, p[1] - 18], [p[0], p[1] - 18]], '#D9B98A', r, .97, .2);
    wash(g, [[p[0], p[1] - 16], [p[0] - 14, p[1] - 16], [p[0] - 18, p[1] - 13], [p[0] - 14, p[1] - 10], [p[0], p[1] - 10]], '#C9A473', r, .97, .2);
    g.fillStyle = '#5A4632'; g.fillRect(p[0] + 3, p[1] - 21.6, 9, 1); g.fillRect(p[0] - 12, p[1] - 13.6, 9, 1);
  }]);
  L.push(['m_asentamiento', 62, 46, 31, 36, (g, r) => {
    sombra(g, 22, 5, 4);
    for (const [u, v, pared, techo2] of [[-.28, -.08, '#9C7A55', '#8E9AA0'], [.12, -.18, '#7E6A52', '#A8B0B4'], [.02, .2, '#A88A62', '#7E8A90']]) {
      const q = V2(u, v); wash(g, [[q[0] - 6, q[1]], [q[0] + 6, q[1]], [q[0] + 6, q[1] - 7], [q[0] - 6, q[1] - 7]], pared, r, .95, .3);
      wash(g, [[q[0] - 7.5, q[1] - 6.5], [q[0] + 7.5, q[1] - 7.5], [q[0] + 6, q[1] - 10], [q[0] - 6, q[1] - 9]], techo2, r, .95, .2);
      g.fillStyle = '#3A2E24'; g.fillRect(q[0] - 1.2, q[1] - 4.5, 2.4, 4.5);
    }
    const t = V2(.36, .05); g.strokeStyle = '#6B4F3A'; g.lineWidth = .5; g.beginPath(); g.moveTo(t[0] - 8, t[1] - 6); g.lineTo(t[0] + 6, t[1] - 8); g.stroke();
    for (let k = 0; k < 3; k++) { g.fillStyle = ['#C0602A', '#5E8FB0', '#E7C76B'][k]; g.fillRect(t[0] - 6 + k * 4.5, t[1] - 6.8 - k * .5, 2.6, 3); }
  }]);
  // Huellas, paso 2: ranchos de colonos en los baldíos (propios, arrendatarios o en parcela sorteada).
  const rancho = (g, r, modo) => {
    sombra(g, 24, 6, 4);
    for (let a = 0; a < 3; a++) for (let b = 0; b < 4; b++) { const q = V2(-.32 + a * .1, .05 + b * .09); g.strokeStyle = b % 2 ? '#6E8A3A' : '#83A048'; g.lineWidth = 1; g.beginPath(); g.moveTo(q[0], q[1]); g.lineTo(q[0] + .6, q[1] - 7); g.stroke(); blob(g, q[0] + .8, q[1] - 7, 1.4, .8, '#D8B84A', r, .9); } // maíz
    const q = V2(.12, -.12);
    wash(g, [[q[0] - 9, q[1] + 1], [q[0] + 1, q[1] + 5], [q[0] + 1, q[1] - 5], [q[0] - 9, q[1] - 9]], '#C9A577', r, .97);  // bahareque
    wash(g, [[q[0] + 1, q[1] + 5], [q[0] + 10, q[1]], [q[0] + 10, q[1] - 10], [q[0] + 1, q[1] - 5]], '#B08E62', r, .97);
    wash(g, [[q[0] - 11, q[1] - 8], [q[0] + 1, q[1] - 3], [q[0] + 12, q[1] - 9], [q[0] + 2, q[1] - 19]], '#D9BE72', r, .98); // techo de paja
    g.globalAlpha = .4; g.strokeStyle = '#8A6A30'; g.lineWidth = .5; for (let k = 0; k < 6; k++) { g.beginPath(); g.moveTo(q[0] - 9 + k * 3.5, q[1] - 7 + k * .9); g.lineTo(q[0] + 2, q[1] - 18); g.stroke(); } g.globalAlpha = 1;
    g.fillStyle = '#3A2E24'; g.fillRect(q[0] + 4, q[1] - 5, 2.6, 5.5);
    // Cerca: guadua (colonos), alambre (arriendo) o mojones blancos (sorteo).
    const E = [V2(-.42, -.42), V2(.42, -.42), V2(.42, .42), V2(-.42, .42)];
    if (modo === 'sorteo') for (const p of E) { g.fillStyle = '#F2ECDD'; g.fillRect(p[0] - 1.2, p[1] - 5, 2.4, 5); g.globalAlpha = .5; g.strokeStyle = FR.siena; g.lineWidth = .4; g.strokeRect(p[0] - 1.2, p[1] - 5, 2.4, 5); g.globalAlpha = 1; }
    else {
      const col = modo === 'arriendo' ? '#6E6A64' : '#9C8A4E';
      for (const [p, q2] of [[E[3], E[2]], [E[2], E[1]]]) for (let k = 0; k <= 4; k++) { const x = p[0] + (q2[0] - p[0]) * k / 4, y = p[1] + (q2[1] - p[1]) * k / 4; g.strokeStyle = col; g.lineWidth = modo === 'arriendo' ? .9 : 1.4; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - 5); g.stroke(); }
      g.strokeStyle = col; g.lineWidth = modo === 'arriendo' ? .4 : .9; for (const h of modo === 'arriendo' ? [2, 3.5, 4.8] : [2.5, 4.2]) { g.beginPath(); g.moveTo(E[3][0], E[3][1] - h); g.lineTo(E[2][0], E[2][1] - h); g.lineTo(E[1][0], E[1][1] - h); g.stroke(); }
      if (modo === 'arriendo') { const p = V2(.42, .1); g.strokeStyle = '#5A4430'; g.lineWidth = .8; g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(p[0], p[1] - 11); g.stroke(); wash(g, [[p[0] - 6, p[1] - 15], [p[0] + 6, p[1] - 13], [p[0] + 6, p[1] - 9], [p[0] - 6, p[1] - 11]], FR.cal, r, .98); g.fillStyle = FR.rojo; g.fillRect(p[0] - 4, p[1] - 12.6, 8, 1); }
    }
  };
  L.push(['m_colono', 64, 52, 32, 34, (g, r) => rancho(g, r, 'colono')]);
  L.push(['m_arriendo', 64, 52, 32, 34, (g, r) => rancho(g, r, 'arriendo')]);
  L.push(['m_sorteo', 64, 52, 32, 34, (g, r) => rancho(g, r, 'sorteo')]);
  // Huellas, paso 3: la señal de cada ley vigente, pequeña, junto a las obras que toca.
  const posteLey = (g, h = 14) => { g.strokeStyle = '#5A4430'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -h); g.stroke(); };
  const tabla = (g, r, x, y, w, h, col) => { wash(g, [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], col, r, .98); g.globalAlpha = .5; g.strokeStyle = FR.siena; g.lineWidth = .5; g.strokeRect(x, y, w, h); g.globalAlpha = 1; };
  const LEY = {
    educacion: (g, r) => { g.strokeStyle = '#6B4F3A'; g.lineWidth = 1; g.beginPath(); g.moveTo(-5, 0); g.lineTo(-2, -15); g.moveTo(5, 0); g.lineTo(2, -15); g.stroke(); tabla(g, r, -7, -15, 14, 9, '#2F4A3A'); g.strokeStyle = '#E8E2D0'; g.lineWidth = .5; g.beginPath(); g.moveTo(-5, -12); g.lineTo(3, -12); g.moveTo(-5, -9.5); g.lineTo(1, -9.5); g.stroke(); for (let k = 0; k < 3; k++) { g.fillStyle = [FR.rojo, FR.azul, FR.ocre][k]; g.fillRect(6, -1.6 - k * 1.6, 6, 1.5); } },
    subsidio: (g, r) => { for (const [x, y] of [[-5, 0], [3, 1], [-1, -4]]) { blob(g, x, y - 3, 4, 4, '#D8C9A0', r, .97); g.fillStyle = FR.rojo; g.beginPath(); g.arc(x, y - 3, 1.2, 0, 7); g.fill(); } },
    jornada: (g, r) => { posteLey(g, 16); g.fillStyle = '#F4EEDF'; g.beginPath(); g.arc(0, -19, 5, 0, 7); g.fill(); g.strokeStyle = FR.siena; g.lineWidth = .8; g.stroke(); g.beginPath(); g.moveTo(0, -19); g.lineTo(0, -22.5); g.moveTo(0, -19); g.lineTo(2.6, -19); g.stroke(); },
    ambiente: (g, r) => { posteLey(g, 12); tabla(g, r, -6, -18, 12, 7, '#4F8A43'); blob(g, 0, -14.5, 2.2, 1.6, '#C9E0A8', r, .95); g.fillStyle = '#5A4430'; g.fillRect(8, -6, 1, 6); blob(g, 8.5, -8, 3, 3, '#5E9A4A', r, .95); },
    arancel: (g, r) => { for (const x of [-9, 9]) { g.fillStyle = '#5A4430'; g.fillRect(x - .8, -8, 1.6, 8); } for (let k = 0; k < 6; k++) { g.fillStyle = k % 2 ? FR.cal : FR.rojo; g.fillRect(-9 + k * 3, -7, 3, 2); } },
    prensa: (g, r) => { wash(g, [[-7, 0], [7, 0], [7, -11], [-7, -11]], '#B08E62', r, .98); wash(g, [[-9, -11], [9, -11], [7, -15], [-7, -15]], FR.rojo, r, .98); for (let k = 0; k < 3; k++) tabla(g, r, -6 + k * 4.2, -9, 3.4, 5, '#F4EEDF'); },
    censura: (g, r) => { posteLey(g, 10); tabla(g, r, -7, -17, 14, 9, '#E8E2D0'); g.fillStyle = '#2A2420'; for (let k = 0; k < 3; k++) g.fillRect(-5, -15 + k * 2.5, 10, 1.4); g.strokeStyle = FR.rojo; g.lineWidth = 1.4; g.beginPath(); g.moveTo(-7, -17); g.lineTo(7, -8); g.moveTo(7, -17); g.lineTo(-7, -8); g.stroke(); },
    bancoCentral: (g, r) => { iso(g, .1, .1, 0, 12, '#DCD0B4', '#C2B596', '#EDE4CC', r); g.fillStyle = '#D9A93A'; g.beginPath(); g.ellipse(0, -15, 4, 3.4, 0, 0, 7); g.fill(); g.strokeStyle = '#8A6A20'; g.lineWidth = .6; g.stroke(); },
    sismo: (g, r) => { posteLey(g, 9); g.fillStyle = '#E8C23A'; g.beginPath(); g.moveTo(0, -18); g.lineTo(6, -8); g.lineTo(-6, -8); g.closePath(); g.fill(); g.strokeStyle = '#2A2420'; g.lineWidth = .8; g.beginPath(); g.moveTo(-3, -10.5); g.lineTo(-1, -13); g.lineTo(1, -10.5); g.lineTo(3, -13); g.stroke(); },
    laico: (g, r) => { posteLey(g, 10); tabla(g, r, -8, -17, 16, 8, FR.azul); g.fillStyle = FR.cal; g.fillRect(-5, -14.5, 6, 4); g.strokeStyle = FR.cal; g.lineWidth = .7; g.beginPath(); g.moveTo(3, -10); g.lineTo(6, -15); g.stroke(); },
    sufragio: (g, r) => { iso(g, .16, .12, 0, 6, '#8A6A48', '#6E5238', '#A8865E', r); iso(g, .12, .1, 6, 5, '#B08E62', '#8E7050', '#C9A577', r); g.fillStyle = '#2A2420'; g.fillRect(-2, -11.6, 4, .9); for (let k = 0; k < 3; k++) { g.fillStyle = ['#E8C23A', FR.azul, FR.rojo][k]; g.fillRect(-9, -18 + k * 1.6, 5, 1.6); } g.strokeStyle = '#5A4430'; g.lineWidth = .6; g.beginPath(); g.moveTo(-9, -18); g.lineTo(-9, -6); g.stroke(); },
    tutela: (g, r) => { iso(g, .2, .12, 0, 5, '#8A6A48', '#6E5238', '#A8865E', r); g.strokeStyle = '#D9A93A'; g.lineWidth = .9; g.beginPath(); g.moveTo(0, -6); g.lineTo(0, -14); g.moveTo(-5, -12.5); g.lineTo(5, -12.5); g.stroke(); for (const x of [-5, 5]) { g.beginPath(); g.ellipse(x, -10.5, 2.2, .9, 0, 0, 7); g.stroke(); } },
    progresivo: (g, r) => { posteLey(g, 10); tabla(g, r, -8, -18, 16, 10, '#E8E2D0'); for (let k = 0; k < 4; k++) { g.fillStyle = FR.ocre; g.fillRect(-6 + k * 3.4, -10 - (k + 1) * 1.6, 2.6, (k + 1) * 1.6); } },
    seguridadSocial: (g, r) => { g.fillStyle = '#6E5238'; g.fillRect(-8, -5, 16, 1.6); g.fillRect(-8, -8.5, 16, 1.2); for (const x of [-7, 7]) g.fillRect(x - .6, -5, 1.2, 5); g.strokeStyle = '#5A4430'; g.lineWidth = .9; g.beginPath(); g.moveTo(9, 0); g.lineTo(9, -9); g.quadraticCurveTo(9, -11, 11, -10.5); g.stroke(); },
    reformaAgraria: (g, r) => { g.strokeStyle = FR.cal; g.lineWidth = .5; g.beginPath(); g.moveTo(-16, -2); g.lineTo(16, 2); g.stroke(); for (const x of [-16, -5, 5, 16]) { g.fillStyle = '#F2ECDD'; g.fillRect(x - 1, -5 + x * .12, 2, 5); } },
    consulta: (g, r) => { posteLey(g, 10); tabla(g, r, -9, -18, 9, 9, '#4F8A43'); tabla(g, r, 0, -18, 9, 9, FR.rojo); g.fillStyle = FR.cal; g.font = 'bold 5px sans-serif'; g.fillText('SÍ', -7.4, -11.5); g.fillText('NO', 1.2, -11.5); },
    descentralizacion: (g, r) => { posteLey(g, 10); tabla(g, r, -7, -17, 14, 8, '#5E8A4A'); g.fillStyle = FR.cal; g.beginPath(); g.moveTo(-3, -11); g.lineTo(0, -14.5); g.lineTo(3, -11); g.lineTo(3, -10); g.lineTo(-3, -10); g.fill(); },
    paz: (g, r) => { iso(g, .16, .16, 0, 8, '#DCD0B4', '#C2B596', '#EDE4CC', r); g.fillStyle = '#FBF8F0'; g.beginPath(); g.ellipse(0, -14, 5, 2.6, -.3, 0, 7); g.fill(); g.beginPath(); g.moveTo(-1, -15); g.quadraticCurveTo(-6, -22, -9, -19); g.quadraticCurveTo(-5, -17, -2, -14); g.fill(); g.beginPath(); g.ellipse(4.5, -16, 1.8, 1.6, 0, 0, 7); g.fill(); g.strokeStyle = '#9A9080'; g.lineWidth = .4; g.stroke(); g.strokeStyle = '#5E9A4A'; g.lineWidth = .8; g.beginPath(); g.moveTo(6, -15.5); g.lineTo(9, -14.5); g.stroke(); }
  };
  for (const [id, f] of Object.entries(LEY)) L.push(['ley_' + id, 40, 34, 20, 28, (g, r) => { sombra(g, 8, 2.5, 2); f(g, r); }]);
  L.push(['m_resguardo', 64, 52, 32, 34, (g, r) => {
    sombra(g, 24, 7, 4);
    const q = V2(0, -.05);
    wash(g, [[q[0] - 14, q[1]], [q[0] + 14, q[1]], [q[0] + 14, q[1] - 6], [q[0] - 14, q[1] - 6]], '#B08E62', r, .97);
    wash(g, [[q[0] - 17, q[1] - 5], [q[0], q[1] - 30], [q[0] + 17, q[1] - 5]], '#C9A85E', r, .98); // techo cónico de palma
    g.globalAlpha = .4; g.strokeStyle = '#7A5A28'; g.lineWidth = .5; for (let k = -3; k <= 3; k++) { g.beginPath(); g.moveTo(q[0], q[1] - 30); g.lineTo(q[0] + k * 5, q[1] - 5); g.stroke(); } g.globalAlpha = 1;
    g.fillStyle = '#3A2E24'; g.fillRect(q[0] - 2, q[1] - 5, 4, 5);
    for (let k = 0; k < 4; k++) { const p = V2(-.35 + k * .08, .3 - k * .04); g.strokeStyle = '#6E8A3A'; g.lineWidth = 1; g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(p[0], p[1] - 6); g.stroke(); blob(g, p[0], p[1] - 7, 2, 1.4, '#4F8A43', r, .9); }
  }]);
  // Huellas, paso 4: trinchera con sacos de arena y alambre; hollín de una obra quemada.
  L.push(['m_trinchera', 64, 40, 32, 24, (g, r) => {
    const A = V2(-.42, .2), B = V2(-.1, -.12), Cc = V2(.15, .1), D = V2(.42, -.2);
    g.lineCap = 'round'; g.lineJoin = 'round';
    for (const [w, col] of [[9, '#A08A6A'], [5, '#4E3E30']]) { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(...A); g.lineTo(...B); g.lineTo(...Cc); g.lineTo(...D); g.stroke(); }
    for (let k = 0; k < 9; k++) { const t = k / 8, p = t < .33 ? [A[0] + (B[0] - A[0]) * t * 3, A[1] + (B[1] - A[1]) * t * 3] : t < .66 ? [B[0] + (Cc[0] - B[0]) * (t - .33) * 3, B[1] + (Cc[1] - B[1]) * (t - .33) * 3] : [Cc[0] + (D[0] - Cc[0]) * (t - .66) * 3, Cc[1] + (D[1] - Cc[1]) * (t - .66) * 3]; blob(g, p[0], p[1] - 4, 2.6, 1.6, k % 2 ? '#C9B98E' : '#B5A47A', r, .97); }
    g.strokeStyle = '#5A5450'; g.lineWidth = .5; for (const x of [-20, -8, 4, 16]) { g.beginPath(); g.moveTo(x, 9); g.lineTo(x, 3); g.stroke(); } g.beginPath(); g.moveTo(-20, 5); for (let x = -20; x <= 16; x += 3) g.lineTo(x, 5 + (x % 2 ? 1 : -1)); g.stroke();
  }]);
  L.push(['hollin', 30, 24, 15, 20, (g, r) => { for (let k = 0; k < 6; k++) blob(g, -8 + k * 3.2, -6 - (k % 3) * 3, 3.5, 4.5, '#2A2420', r, .45); }]);
  // Fase 6: madrevieja, el humedal que deja el río cuando cambia de curso.
  L.push(['m_madrevieja', 64, 40, 32, 26, (g, r) => {
    const c = V2(0, 0);
    wash(g, [[c[0] - 26, c[1] + 1], [c[0] - 12, c[1] - 9], [c[0] + 8, c[1] - 10], [c[0] + 26, c[1] - 2], [c[0] + 14, c[1] + 9], [c[0] - 10, c[1] + 10]], '#C9BE8C', r, .55, .4);
    wash(g, [[c[0] - 22, c[1] + 2], [c[0] - 14, c[1] - 5], [c[0] - 2, c[1] - 6], [c[0] + 4, c[1] - 2], [c[0] - 8, c[1] - 1], [c[0] - 14, c[1] + 4]], '#7FB2C4', r, .9, .3);
    wash(g, [[c[0] + 2, c[1] + 3], [c[0] + 12, c[1] - 4], [c[0] + 22, c[1] - 1], [c[0] + 14, c[1] + 6], [c[0] + 4, c[1] + 7]], '#8DBBC9', r, .88, .3);
    g.strokeStyle = '#5E7A3A'; g.lineWidth = .8;
    for (let k = 0; k < 9; k++) { const x = c[0] - 20 + k * 5 + (r() - .5) * 2, y = c[1] + (k % 2 ? 5 : -6); g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - .5) * 2, y - 5 - r() * 3); g.stroke(); }
    g.fillStyle = '#F4F1E6'; blob(g, c[0] + 6, c[1] - 6, 1.8, 2.6, '#F4F1E6', r, .95); g.fillRect(c[0] + 6.4, c[1] - 11, .9, 4); g.fillStyle = '#3A3532'; g.fillRect(c[0] + 5.6, c[1] - 3.6, .5, 3); g.fillRect(c[0] + 6.8, c[1] - 3.6, .5, 3);
  }]);
  // Fase 6: inventos adoptados.
  const poste = (g, x, y, h) => { g.fillStyle = '#6B4F3A'; g.fillRect(x - .7, y - h, 1.4, h); g.fillRect(x - 4, y - h + 2, 8, 1); };
  L.push(['m_imprenta', 56, 50, 28, 38, (g, r) => {
    sombra(g, 16, 5, 4); const b = iso(g, .44, .34, 0, 12, '#E6DCC6', '#CBBFA6', null, r);
    wash(g, caraI(b, .25, .5, 3, 6), '#4A4038', r, .97, .2); techo(g, b, 3, 7, '#6E5A46', '#CBBFA6', r);
    const s2 = caraI(b, .15, .7, 10, 2.4); wash(g, s2, '#F4F1E6', r, .97, .2); g.fillStyle = '#2A2A2A'; g.fillRect((s2[0][0] + s2[2][0]) / 2 - 4, (s2[0][1] + s2[2][1]) / 2 - .4, 8, .8);
    const q = V2(.34, .3); for (let k = 0; k < 3; k++) wash(g, [[q[0] - 3, q[1] - k * 1.4], [q[0] + 3, q[1] - k * 1.4], [q[0] + 3, q[1] - k * 1.4 - 1.2], [q[0] - 3, q[1] - k * 1.4 - 1.2]], '#F4F1E6', r, .95, .2);
  }]);
  L.push(['m_telegrafo', 64, 50, 32, 40, (g, r) => {
    sombra(g, 18, 3, 2); const ps = [V2(-.4, .1), V2(0, -.05), V2(.4, -.2)];
    ps.forEach(q => poste(g, q[0], q[1], 24)); g.strokeStyle = '#3A3A3A'; g.lineWidth = .5;
    for (const dy of [-22, -21]) { g.beginPath(); g.moveTo(ps[0][0], ps[0][1] + dy); for (const q of ps.slice(1)) g.quadraticCurveTo((q[0] + ps[0][0]) / 2, q[1] + dy + 3, q[0], q[1] + dy); g.stroke(); }
  }]);
  L.push(['m_electricidad', 64, 62, 32, 48, (g, r) => {
    sombra(g, 20, 5, 4); const b = iso(g, .46, .36, 0, 14, '#C9C5BC', '#ADA89E', '#BDB8AE', r);
    const ch = b.up(V2(.1, -.08), 14); wash(g, [[ch[0] - 2.5, ch[1]], [ch[0] + 2.5, ch[1]], [ch[0] + 2, ch[1] - 18], [ch[0] - 2, ch[1] - 18]], '#B5563A', r, .97, .2);
    poste(g, V2(-.42, .3)[0], V2(-.42, .3)[1], 22); g.fillStyle = '#F2D36B'; const L1 = V2(-.42, .3); g.beginPath(); g.arc(L1[0] + 3, L1[1] - 21, 1.6, 0, 7); g.fill();
    wash(g, caraI(b, .3, .4, 3, 6), '#E7C76B', r, .95, .2);
  }]);
  L.push(['m_radio', 44, 70, 22, 60, (g, r) => {
    sombra(g, 10, 3, 2); const p0 = V2(0, 0); g.strokeStyle = '#B03A2E'; g.lineWidth = .9;
    g.beginPath(); g.moveTo(p0[0] - 6, p0[1]); g.lineTo(p0[0], p0[1] - 52); g.lineTo(p0[0] + 6, p0[1]); g.stroke();
    for (let k = 1; k < 6; k++) { const y = p0[1] - k * 9, w = 6 * (1 - k * 9 / 52); g.strokeStyle = k % 2 ? '#F4F1E6' : '#B03A2E'; g.beginPath(); g.moveTo(p0[0] - w, y); g.lineTo(p0[0] + w, y - 4); g.stroke(); }
    g.fillStyle = '#E04A3A'; g.beginPath(); g.arc(p0[0], p0[1] - 53, 1.6, 0, 7); g.fill();
  }]);
  L.push(['m_internet', 44, 66, 22, 56, (g, r) => {
    sombra(g, 10, 3, 2); const p0 = V2(0, 0); g.fillStyle = '#8A8F96'; g.fillRect(p0[0] - 1, p0[1] - 46, 2, 46);
    for (const [dy, s] of [[-40, 1], [-30, -1]]) { wash(g, [[p0[0] + s * 1, p0[1] + dy], [p0[0] + s * 7, p0[1] + dy - 2], [p0[0] + s * 7, p0[1] + dy - 9], [p0[0] + s * 1, p0[1] + dy - 7]], '#E4E1DA', r, .97, .2); }
    g.strokeStyle = '#5E8FB0'; g.lineWidth = .7; for (let k = 1; k <= 3; k++) { g.beginPath(); g.arc(p0[0], p0[1] - 48, k * 3, Math.PI * 1.2, Math.PI * 1.8); g.stroke(); }
  }]);
  L.push(['m_automatizacion', 72, 62, 36, 46, (g, r) => {
    sombra(g, 24, 6, 6); const b = iso(g, .62, .5, 0, 16, '#B9C1C8', '#9AA3AC', null, r);
    for (let k = 0; k < 3; k++) { const t = caraI(b, .1 + k * .3, .2, 16, 6); wash(g, [t[0], t[1], [t[1][0] - 2, t[1][1] - 6]], '#7E8790', r, .95, .2); }
    const c0 = caraI(b, .35, .3, 4, 8), cx = (c0[0][0] + c0[2][0]) / 2, cy = (c0[0][1] + c0[2][1]) / 2;
    g.strokeStyle = '#E7C76B'; g.lineWidth = 1.2; g.beginPath(); g.arc(cx, cy, 3, 0, 7); g.stroke(); for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; g.beginPath(); g.moveTo(cx + Math.cos(a) * 3, cy + Math.sin(a) * 3); g.lineTo(cx + Math.cos(a) * 4.6, cy + Math.sin(a) * 4.6); g.stroke(); }
  }]);
  // Fase 6: megaproyectos (obra, represa, ferrocarril, aeropuerto).
  L.push(['m_megaobra', 80, 76, 40, 58, (g, r) => {
    sombra(g, 26, 6, 6); const b = iso(g, .8, .6, 0, 4, '#B9A27E', '#9C8664', '#C9B38E', r);
    const p0 = V2(-.2, -.1, 4); g.strokeStyle = '#E2B24F'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(p0[0], p0[1]); g.lineTo(p0[0], p0[1] - 40); g.lineTo(p0[0] + 26, p0[1] - 40); g.stroke();
    for (let k = 0; k < 8; k++) { g.beginPath(); g.moveTo(p0[0] - 1.5, p0[1] - k * 5); g.lineTo(p0[0] + 1.5, p0[1] - k * 5 - 5); g.stroke(); }
    g.strokeStyle = '#4A4A4A'; g.lineWidth = .5; g.beginPath(); g.moveTo(p0[0] + 22, p0[1] - 40); g.lineTo(p0[0] + 22, p0[1] - 22); g.stroke(); wash(g, [[p0[0] + 19, p0[1] - 22], [p0[0] + 25, p0[1] - 22], [p0[0] + 25, p0[1] - 18], [p0[0] + 19, p0[1] - 18]], '#8E8A80', r, .95, .2);
    const q = V2(.2, .15, 4); wash(g, [[q[0] - 9, q[1]], [q[0] + 9, q[1]], [q[0] + 9, q[1] - 10], [q[0] - 9, q[1] - 10]], '#C9C3B8', r, .95, .3);
  }]);
  L.push(['m_represa', 96, 66, 48, 44, (g, r) => {
    sombra(g, 30, 6, 4); const lago = V2(-.15, -.2); g.fillStyle = '#5FA0C8'; g.globalAlpha = .85; g.beginPath(); g.ellipse(lago[0], lago[1], 34, 12, 0, 0, 7); g.fill(); g.globalAlpha = 1;
    const b = iso(g, .9, .14, 0, 14, '#D2CCC0', '#B5AFA2', '#E0DACD', r, 0, .25);
    for (let k = 0; k < 3; k++) { const c0 = caraI(b, .25 + k * .25, .08, 0, 12); wash(g, c0, '#8FB8D4', r, .9, .2); }
    g.strokeStyle = '#6B6258'; g.lineWidth = .6; const t1 = V2(.42, .1); g.beginPath(); g.moveTo(t1[0], t1[1] - 14); g.lineTo(t1[0], t1[1] - 26); g.stroke(); g.beginPath(); g.moveTo(t1[0] - 4, t1[1] - 24); g.lineTo(t1[0] + 4, t1[1] - 24); g.stroke();
  }]);
  L.push(['m_ferrocarril', 92, 62, 46, 44, (g, r) => {
    sombra(g, 30, 5, 4); g.strokeStyle = '#5A4632'; g.lineWidth = 1; const a1 = V2(-.6, .35), a2 = V2(.6, -.1);
    for (const d of [-2, 2]) { g.beginPath(); g.moveTo(a1[0], a1[1] + d); g.lineTo(a2[0], a2[1] + d); g.stroke(); }
    for (let k = 0; k <= 10; k++) { const x = a1[0] + (a2[0] - a1[0]) * k / 10, y = a1[1] + (a2[1] - a1[1]) * k / 10; g.fillStyle = '#7A5C3A'; g.fillRect(x - 1, y - 3, 2, 6); }
    const b = iso(g, .36, .26, 0, 13, '#E7C76B', '#C9A44A', null, r, -.15, -.2); techo(g, b, 3, 7, '#8E3B2E', '#C9A44A', r); wash(g, caraI(b, .35, .3, 0, 7), '#5A4632', r, .97, .2);
    const t = V2(.3, .02); wash(g, [[t[0] - 9, t[1]], [t[0] + 7, t[1] - 4], [t[0] + 7, t[1] - 12], [t[0] - 9, t[1] - 8]], '#2E3A28', r, .97, .2); g.fillStyle = '#C0392B'; g.fillRect(t[0] - 9, t[1] - 4, 16, 1.6);
    const ch = [t[0] + 4, t[1] - 12]; g.fillStyle = '#2A2A2A'; g.fillRect(ch[0] - 1, ch[1] - 5, 2.4, 5);
  }]);
  L.push(['m_aeropuerto', 100, 64, 50, 42, (g, r) => {
    sombra(g, 34, 6, 4); const a1 = V2(-.6, .2), a2 = V2(.55, -.35);
    g.fillStyle = '#6E6A64'; g.beginPath(); g.moveTo(a1[0] - 4, a1[1] + 3); g.lineTo(a2[0] - 4, a2[1] + 3); g.lineTo(a2[0] + 4, a2[1] - 3); g.lineTo(a1[0] + 4, a1[1] - 3); g.closePath(); g.fill();
    g.strokeStyle = '#F4F1E6'; g.lineWidth = .8; g.setLineDash([3, 3]); g.beginPath(); g.moveTo(a1[0], a1[1]); g.lineTo(a2[0], a2[1]); g.stroke(); g.setLineDash([]);
    const tw = V2(.3, .3); g.fillStyle = '#E4E1DA'; g.fillRect(tw[0] - 2, tw[1] - 22, 4, 22); wash(g, [[tw[0] - 5, tw[1] - 22], [tw[0] + 5, tw[1] - 22], [tw[0] + 4, tw[1] - 28], [tw[0] - 4, tw[1] - 28]], '#6E8FA6', r, .97, .2);
    const av = V2(-.2, -.05); g.fillStyle = '#F4F1E6'; g.beginPath(); g.ellipse(av[0], av[1] - 3, 7, 1.6, -.4, 0, 7); g.fill(); g.beginPath(); g.moveTo(av[0] - 2, av[1] - 3); g.lineTo(av[0] + 2, av[1] - 9); g.lineTo(av[0] + 4, av[1] - 3); g.fill();
  }]);
  L.push(['m_acta', 44, 46, 22, 36, (g, r) => {
    sombra(g, 14, 4, 3); const p = V2(0, 0);
    blob(g, p[0], p[1] - 9, 11, 10, '#B9B1A2', r, .97); blob(g, p[0] - 2, p[1] - 12, 7, 5, '#CEC6B6', r, .8);
    g.strokeStyle = '#6B6258'; g.lineWidth = .7; for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(p[0] - 6, p[1] - 14 + k * 2.6); g.lineTo(p[0] + 6, p[1] - 14 + k * 2.6); g.stroke(); }
    blob(g, p[0] + 8, p[1] - 1, 3, 2.5, '#5E8A4D', r, .9);
  }]);
  // Cultura y deporte (fase 5): cancha y estadio (la biblioteca y el teatro están en publicos.js).
  L.push(['cancha', 92, 56, 46, 32, (g, r) => {
    const b = iso(g, .92, .7, 0, 1.5, '#7FA35C', '#6A8C4A', '#8CB466', r);
    g.strokeStyle = '#F4F1E6'; g.lineWidth = .8; const L1 = [V2(-.4, -.3, 1.5), V2(.4, -.3, 1.5), V2(.4, .3, 1.5), V2(-.4, .3, 1.5)];
    g.beginPath(); g.moveTo(...L1[0]); for (const q of L1.slice(1)) g.lineTo(...q); g.closePath(); g.stroke();
    const m1 = V2(0, -.3, 1.5), m2 = V2(0, .3, 1.5); g.beginPath(); g.moveTo(...m1); g.lineTo(...m2); g.stroke(); const cc = V2(0, 0, 1.5); g.beginPath(); g.ellipse(cc[0], cc[1], 6, 3, 0, 0, 7); g.stroke();
    for (const u of [-.4, .4]) { const q = V2(u, 0, 1.5); g.strokeStyle = '#E8E4DA'; g.lineWidth = .9; g.beginPath(); g.moveTo(q[0] - 3, q[1] + 1.5); g.lineTo(q[0] - 3, q[1] - 6); g.lineTo(q[0] + 3, q[1] - 7.5); g.lineTo(q[0] + 3, q[1]); g.stroke(); }
    for (const [u, v, col] of [[-.15, -.1, '#C0392B'], [.12, .08, '#2D5D72'], [.22, -.15, '#C0392B']]) { const q = V2(u, v, 1.5); g.fillStyle = col; g.fillRect(q[0] - 1, q[1] - 5, 2, 3.4); g.fillStyle = '#C98E62'; g.beginPath(); g.arc(q[0], q[1] - 6, 1.1, 0, 7); g.fill(); }
    const pel = V2(.02, -.02, 1.5); g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(pel[0], pel[1] - 1, .9, 0, 7); g.fill();
  }]);
  L.push(['estadio', 112, 84, 56, 58, (g, r) => {
    sombra(g, 36, 8, 8);
    const b = iso(g, .96, .8, 0, 12, '#CFC8B6', '#B3AB97', null, r);
    const c0 = V2(0, 0, 12); g.fillStyle = '#7FA35C'; g.beginPath(); g.ellipse(c0[0], c0[1], 26, 13, 0, 0, 7); g.fill();
    g.strokeStyle = '#F4F1E6'; g.lineWidth = .7; g.beginPath(); g.ellipse(c0[0], c0[1], 10, 5, 0, 0, 7); g.stroke();
    for (let k = 0; k < 14; k++) { const a = k / 14 * Math.PI * 2; g.fillStyle = ['#C0392B', '#E7C76B', '#2D5D72', '#F4F1E6'][k % 4]; g.beginPath(); g.arc(c0[0] + Math.cos(a) * 31, c0[1] + Math.sin(a) * 15.5, 1.3, 0, 7); g.fill(); }
    for (const u of [-.46, .46]) { const q = V2(u, -.38, 12); g.fillStyle = '#6B6258'; g.fillRect(q[0] - .6, q[1] - 22, 1.2, 22); g.fillStyle = '#F6E3A0'; g.fillRect(q[0] - 3, q[1] - 24, 6, 2.6); }
  }]);
  L.push(['mina', 64, 50, 32, 36, (g, r) => {
    sombra(g, 16, 5, 4);
    wash(g, [[-12, 4], [-9, -9], [0, -13], [9, -9], [12, 4]], '#6E6358', r, .95, .4);
    g.fillStyle = '#231C17'; g.globalAlpha = .92; g.beginPath(); g.ellipse(-1, 2, 6.5, 8, 0, Math.PI, 0); g.lineTo(5.5, 4); g.lineTo(-7.5, 4); g.fill(); g.globalAlpha = 1;
    g.strokeStyle = '#7A5A3A'; g.lineWidth = 2; g.beginPath(); g.moveTo(-9, 5); g.lineTo(-9, -8); g.lineTo(7, -8); g.lineTo(7, 5); g.stroke();
    iso(g, .16, .11, 1.5, 4, '#6B6B6B', '#555555', '#7A7A7A', r, .34, .3);
    for (let k = 0; k < 4; k++) blob(g, 14 + k * 2.5, 6 - k * 1.2, 2.6, 1.8, k % 2 ? '#8E8478' : '#A39C92', r, .9);
    g.strokeStyle = '#5A4A3A'; g.lineWidth = .8; g.beginPath(); g.moveTo(-2, 5); g.lineTo(16, 14); g.moveTo(2, 4); g.lineTo(20, 13); g.stroke();
  }]);
  // Huellas, paso 0: la cruz de fundación, de piedra, sobre tres gradas.
  L.push(['cruzFundacion', 44, 64, 22, 52, (g, r) => {
    sombra(g, 14, 5, 4);
    iso(g, .3, .3, 0, 3, '#C9BB9C', '#AE9F80', '#DCD0B4', r);
    iso(g, .22, .22, 3, 3, '#C9BB9C', '#AE9F80', '#DCD0B4', r);
    iso(g, .14, .14, 6, 3, '#C9BB9C', '#AE9F80', '#DCD0B4', r);
    wash(g, [[-2.2, -9], [2.2, -9], [2.2, -44], [-2.2, -44]], '#D8CCB0', r, .98);
    wash(g, [[-9, -33], [9, -33], [9, -37.5], [-9, -37.5]], '#D8CCB0', r, .98);
    g.globalAlpha = .55; g.strokeStyle = FR.siena; g.lineWidth = .7; g.strokeRect(-2.2, -44, 4.4, 35); g.strokeRect(-9, -37.5, 18, 4.5); g.globalAlpha = 1;
    for (const [x, c] of [[-6, FR.rojo], [5, FR.ocre]]) blob(g, x, -1, 2, 1.3, c, r, .85); // flores al pie
  }]);
  // Huellas, paso 1: cementerio con tapia blanca, tumbas, ciprés, ruinas, velas de luto y bandera amarilla.
  L.push(['cementerio', 72, 50, 36, 30, (g, r) => {
    sombra(g, 30, 9, 4);
    const T = '#EDE6D6', TL = '#D6CDB8', TR = '#C4BAA3';
    iso(g, .86, .07, 0, 6, TL, TR, T, r, 0, -.4);   // tapia del fondo
    iso(g, .07, .86, 0, 6, TL, TR, T, r, -.4, 0);   // tapia izquierda (fondo)
    iso(g, .07, .3, 0, 6, TL, TR, T, r, .4, -.27);  // tapia derecha, a los lados de la portada
    iso(g, .07, .3, 0, 6, TL, TR, T, r, .4, .27);
    iso(g, .3, .07, 0, 6, TL, TR, T, r, -.27, .4);  // tapia del frente
    iso(g, .3, .07, 0, 6, TL, TR, T, r, .27, .4);
    const p = V2(.4, 0); // portada con arco
    wash(g, [[p[0] - 5, p[1] + 2], [p[0] + 1, p[1] - 1], [p[0] + 1, p[1] - 13], [p[0] - 5, p[1] - 10]], T, r, .98);
    g.fillStyle = '#4A3A2E'; g.globalAlpha = .8; g.beginPath(); g.moveTo(p[0] - 3.6, p[1] + .8); g.lineTo(p[0] - .4, p[1] - .8); g.lineTo(p[0] - .4, p[1] - 6.5); g.quadraticCurveTo(p[0] - 2, p[1] - 9, p[0] - 3.6, p[1] - 5); g.fill(); g.globalAlpha = 1;
    g.strokeStyle = '#7A6A58'; g.lineWidth = .8; g.beginPath(); g.moveTo(p[0] - 2, p[1] - 12); g.lineTo(p[0] - 2, p[1] - 17); g.moveTo(p[0] - 3.5, p[1] - 15.5); g.lineTo(p[0] - .5, p[1] - 15.5); g.stroke();
  }]);
  L.push(['tumba', 10, 14, 5, 12, (g, r) => {
    blob(g, 0, 0, 4, 1.8, '#9C8C6E', r, .8);
    g.fillStyle = '#F2ECDD'; g.fillRect(-.8, -10, 1.6, 10); g.fillRect(-3, -7.5, 6, 1.5);
    g.globalAlpha = .5; g.strokeStyle = FR.siena; g.lineWidth = .4; g.strokeRect(-.8, -10, 1.6, 10); g.globalAlpha = 1;
  }]);
  L.push(['cipres', 16, 40, 8, 38, (g, r) => {
    sombra(g, 5, 2, 2); g.fillStyle = '#5A4430'; g.fillRect(-.8, -4, 1.6, 4);
    for (let k = 0; k < 5; k++) blob(g, Math.sin(k) * .6, -8 - k * 5.5, 4.2 - k * .55, 5, k % 2 ? '#2E4A33' : '#3A5A3C', r, .95);
  }]);
  L.push(['ruina', 64, 46, 32, 30, (g, r) => {
    sombra(g, 26, 8, 4);
    for (let k = 0; k < 9; k++) blob(g, -16 + k * 4 + Math.sin(k * 3) * 2, 6 - (k % 3) * 2, 5 + k % 3, 2.5, ['#A39079', '#8E7B66', '#B7A58C'][k % 3], r, .95);
    wash(g, [[-14, 2], [-2, 8], [-2, -6], [-6, -12], [-9, -5], [-14, -9]], '#E4D9C2', r, .97); // muro quebrado
    wash(g, [[-2, 8], [10, 2], [10, -4], [5, -1], [2, -8], [-2, -6]], '#CBBFA6', r, .97);
    g.globalAlpha = .7; g.strokeStyle = '#4A3A2E'; g.lineWidth = .8; g.beginPath(); g.moveTo(-8, -3); g.lineTo(-6, 1); g.lineTo(-8, 4); g.stroke(); g.globalAlpha = 1;
    for (let k = 0; k < 7; k++) blob(g, 4 + (k % 4) * 4 - 6, 6 + Math.floor(k / 4) * 3, 2.6, 1.3, k % 2 ? '#B5452E' : '#9E3A26', r, .95); // tejas caídas
    g.strokeStyle = '#5A4430'; g.lineWidth = 1.6; g.lineCap = 'round'; g.beginPath(); g.moveTo(-12, -2); g.lineTo(8, -9); g.moveTo(-4, 6); g.lineTo(12, -3); g.stroke(); // vigas
  }]);
  L.push(['velas', 30, 20, 15, 14, (g, r) => {
    for (const [x, y, c] of [[-8, 2, FR.rojo], [7, 3, FR.ocre], [-1, 4, '#F2ECDD'], [10, -1, FR.rojo]]) blob(g, x, y, 2.4, 1.4, c, r, .9);
    for (const [x, y, h] of [[-5, 0, 7], [-1, 1, 9], [3, 0, 6], [6, 2, 8], [-3, 3, 5]]) {
      g.fillStyle = '#F4EEDF'; g.fillRect(x - .8, y - h, 1.6, h);
      const gr = g.createRadialGradient(x, y - h - 1.5, 0, x, y - h - 1.5, 3); gr.addColorStop(0, 'rgba(255,214,120,1)'); gr.addColorStop(1, 'rgba(255,190,90,0)'); g.fillStyle = gr; g.fillRect(x - 3, y - h - 4.5, 6, 6);
    }
  }]);
  L.push(['bandera-amarilla', 16, 26, 3, 24, g => bandera(g, 0, 0, 20, '#E8C23A')]);
  L.push(['fuente', 44, 34, 22, 24, (g, r) => {
    sombra(g, 12, 3.5, 3); g.fillStyle = '#D8CCB2'; g.beginPath(); g.ellipse(0, -2, 12, 5, 0, 0, 7); g.fill(); g.fillStyle = '#BFB296'; g.fillRect(-12, -2, 24, 3); g.beginPath(); g.ellipse(0, 1, 12, 5, 0, 0, Math.PI); g.fill();
    g.fillStyle = '#86BDD2'; g.beginPath(); g.ellipse(0, -2.5, 9.5, 3.6, 0, 0, 7); g.fill(); g.fillStyle = '#D8CCB2'; g.fillRect(-1.5, -12, 3, 10); g.fillStyle = '#B9E0EC'; g.beginPath(); g.ellipse(0, -12, 3, 1.4, 0, 0, 7); g.fill();
  }]);
  // ---------- Detalles del régimen en algunas casas ----------
  for (const [reg, col] of [['monarquia', '#5B3A7A'], ['aristocracia', '#2F5B45'], ['republica', '#2D5D72'], ['oligarquia', '#6B5420']]) L.push(['bandera-' + reg, 16, 22, 3, 20, g => bandera(g, 0, 0, 16, col)]);
  L.push(['bandera-tirania', 14, 16, 7, 14, g => { g.fillStyle = '#9E2B25'; g.globalAlpha = .9; g.fillRect(-3.5, -12, 7, 8); g.fillStyle = '#EFE3C2'; g.fillRect(-2, -11, 4, 2); g.globalAlpha = 1; }]);
  L.push(['bandera-demagogia', 40, 20, 20, 12, (g, r) => banderines(g, [-17, -2], [17, 1], r)]);
  // Humo para chimeneas.
  // Vida de los edificios (fase 1): grietas en los muros y maleza al pie de las obras descuidadas.
  L.push(['grieta', 14, 18, 7, 9, g => { g.strokeStyle = '#4A3A2E'; g.lineCap = 'round'; g.lineJoin = 'round'; g.globalAlpha = .75; g.lineWidth = .9; g.beginPath(); g.moveTo(-1, -8); g.lineTo(1, -4); g.lineTo(-1.5, -1); g.lineTo(1.5, 3); g.lineTo(0, 7); g.moveTo(1, -4); g.lineTo(4, -2.5); g.moveTo(-1.5, -1); g.lineTo(-4.5, 1); g.moveTo(1.5, 3); g.lineTo(4, 5); g.stroke(); g.globalAlpha = .3; g.lineWidth = 2; g.strokeStyle = '#8A7560'; g.beginPath(); g.moveTo(-1, -8); g.lineTo(1, -4); g.lineTo(-1.5, -1); g.lineTo(1.5, 3); g.stroke(); g.globalAlpha = 1; }]);
  L.push(['maleza', 20, 14, 10, 11, g => { const cols = ['#7E8F4A', '#93A052', '#6E7E40', '#A8A060']; for (let k = 0; k < 11; k++) { const x = (k - 5) * 1.6 + Math.sin(k * 2.3) * .8, h = 5 + (k * 37 % 6); g.strokeStyle = cols[k % 4]; g.lineWidth = 1; g.beginPath(); g.moveTo(x, 0); g.quadraticCurveTo(x + Math.sin(k) * 1.5, -h * .6, x + Math.sin(k * 1.7) * 2.5, -h); g.stroke(); } g.globalAlpha = .6; g.fillStyle = '#B8A45A'; for (let k = 0; k < 3; k++) { g.beginPath(); g.arc(-4 + k * 4, -6 - k % 2 * 2, .8, 0, 7); g.fill(); } g.globalAlpha = 1; }]);
  // Obras por etapas (fase 2): cimientos con estacas, andamio de guadua y material apilado.
  L.push(['cimientos', 68, 36, 34, 19, (g, r) => {
    iso(g, .82, .82, 0, 3, '#A8A094', '#8E877D', '#C2B9A8', r);
    g.strokeStyle = '#6B5140'; g.lineWidth = 1.2; g.lineCap = 'round';
    for (const [u, v] of [[-.41, -.41], [.41, -.41], [.41, .41], [-.41, .41]]) { const p = V2(u, v, 3); g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(p[0], p[1] - 7); g.stroke(); }
    g.globalAlpha = .6; g.strokeStyle = '#E8DCC0'; g.lineWidth = .5; g.beginPath(); const s = [[-.41, -.41], [.41, -.41], [.41, .41], [-.41, .41], [-.41, -.41]].map(([u, v]) => V2(u, v, 9)); s.forEach((p, k) => k ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke(); g.globalAlpha = 1;
    g.globalAlpha = .35; g.strokeStyle = '#6E665C'; g.lineWidth = .6; for (let k = -2; k <= 2; k++) { const a = V2(-.35, k * .15, 3), b = V2(.35, k * .15, 3); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); } g.globalAlpha = 1;
  }]);
  L.push(['andamio', 60, 64, 30, 56, g => {
    g.lineCap = 'round';
    const poste = (x, y0, y1) => { g.strokeStyle = '#8A6A44'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y1); g.stroke(); g.strokeStyle = '#B99A6A'; g.lineWidth = .5; g.beginPath(); g.moveTo(x - .4, y0); g.lineTo(x - .4, y1); g.stroke(); };
    [-26, -12, 0, 13, 26].forEach((x, k) => poste(x, k === 2 ? 2 : 6 - Math.abs(x) * .45, -48));
    for (const y of [-10, -24, -38]) {
      g.strokeStyle = '#9B7650'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(-26, y - 6 + 12 * .45 * 1); g.lineTo(0, y + 6); g.lineTo(26, y - 6 + 12 * .45 * 1); g.stroke();
      g.strokeStyle = '#5E4330'; g.lineWidth = .5; g.beginPath(); g.moveTo(-26, y - .5 + 5.4 - 6); g.lineTo(0, y + 5.5); g.lineTo(26, y - .6); g.stroke();
    }
    g.strokeStyle = '#7A5C3A'; g.lineWidth = .8; g.globalAlpha = .8; g.beginPath(); g.moveTo(-26, -8); g.lineTo(-12, -30); g.moveTo(13, -8); g.lineTo(26, -30); g.moveTo(-12, -22); g.lineTo(0, -44); g.stroke(); g.globalAlpha = 1;
  }]);
  L.push(['material', 26, 18, 13, 13, (g, r) => {
    g.globalAlpha = .22; g.fillStyle = '#26301E'; g.beginPath(); g.ellipse(2, 1, 11, 3, 0, 0, 7); g.fill(); g.globalAlpha = 1;
    for (let k = 0; k < 3; k++) for (let j = 0; j < 3 - k; j++) { g.fillStyle = (j + k) % 2 ? '#B5654A' : '#A9573F'; g.fillRect(-9 + j * 5 + k * 2.5, -2 - k * 2.6, 4.6, 2.4); }
    g.strokeStyle = '#8A6A44'; g.lineWidth = 1.6; g.lineCap = 'round'; for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(3 + k * 1.2, -1 - k * 1.8); g.lineTo(11 + k * 1.2, -3 - k * 1.8); g.stroke(); }
  }]);
  // Fase 11: la carga de cada fábrica junto a su puerta, para ver en el mapa qué produce.
  const op = { n: 1, bw: .4, bal: .6 };
  const saco = (g, r, x, y, col) => { ovalo(g, x, y - 3, 3.4, 3.6, col, r, op); g.fillStyle = shade(col, -.3); g.fillRect(x - 1.2, y - 7.4, 2.4, 1.2); };
  const caja = (g, r, x, y, w, h, col) => { pintar(g, [[x - w, y], [x + w, y], [x + w, y - h], [x - w, y - h]], col, r, op); g.fillStyle = shade(col, -.35); g.fillRect(x - w, y - h * .55, w * 2, .7); };
  L.push(['carga-trilladora', 26, 18, 13, 15, (g, r) => { sombra(g, 10, 2.5, 1); saco(g, r, -5, 0, '#A88A5E'); saco(g, r, 2, 0, '#9C7E54'); saco(g, r, -1.5, -5, '#B3966A'); g.fillStyle = FR.siena; g.font = 'bold 4px serif'; g.fillText('C', -2.6, -6.6); }]);
  L.push(['carga-molino', 26, 18, 13, 15, (g, r) => { sombra(g, 10, 2.5, 1); saco(g, r, -5, 0, '#EDE6D6'); saco(g, r, 2, 0, '#E2DACA'); saco(g, r, -1.5, -5, '#F4EEE2'); }]);
  L.push(['carga-chocolate', 26, 18, 13, 15, (g, r) => { sombra(g, 10, 2.5, 1); caja(g, r, -4, 0, 4, 5, '#8A5A3C'); caja(g, r, 4, 0, 4, 5, '#7A4A2E'); caja(g, r, 0, -5, 4, 4.5, '#946446'); }]);
  L.push(['carga-textiles', 26, 18, 13, 15, (g, r) => { sombra(g, 10, 2.5, 1); [[-5, 0, FR.rojo], [1, 0, FR.ocre], [7, 0, FR.azul], [-2, -4.5, FR.cal], [4, -4.5, FR.tierraVerde]].forEach(([x, y, col]) => { ovalo(g, x, y - 2.2, 3, 2.3, col, r, op); ovalo(g, x - 2.4, y - 2.2, .9, 2, shade(col, -.25), r, { n: 0, borde: false }); }); }]);
  L.push(['carga-fundicion', 26, 18, 13, 15, (g, r) => { sombra(g, 10, 2.5, 1); for (let k = 0; k < 3; k++) for (let j = 0; j < 3 - k; j++) caja(g, r, -6 + j * 5 + k * 2.5, -k * 2.4, 2.4, 2.3, k === 2 ? '#C6683E' : '#7D7A76'); }]);
  L.push(['carga-artesanias', 26, 18, 13, 15, (g, r) => { sombra(g, 10, 2.5, 1); ovalo(g, -5, -3, 3.4, 3.2, FR.ocreRojo, r, op); ovalo(g, -5, -6, 1.8, .8, shade(FR.ocreRojo, -.3), r, { n: 0, borde: false }); pintar(g, [[0, 0], [7, 0], [8, -5], [-1, -5]], '#C9A86A', r, op); ovalo(g, 3.5, -8, 3.4, 1.4, '#E6CF96', r, op); }]);
  L.push(['chimenea', 16, 56, 8, 52, (g, r) => { sombra(g, 6, 2, 1); pintar(g, [[-4, 0], [4, 0], [3, -48], [-3, -48]], '#9E5A44', r, op); g.fillStyle = '#6E3B2C'; for (let y = -44; y < -2; y += 7) g.fillRect(-3.5, y, 7, .7); pintar(g, [[-4.2, -48], [4.2, -48], [4.2, -51], [-4.2, -51]], '#5A3A2C', r, op); }]);
  L.push(['nave', 40, 30, 20, 24, (g, r) => { sombra(g, 16, 4, 2); pintar(g, [[-16, 0], [16, 0], [16, -14], [-16, -14]], '#A7ADB0', r, op); pintar(g, [[-16, -14], [16, -14], [12, -20], [-12, -20]], '#7F878C', r, op); g.fillStyle = '#4F86A6'; for (let x = -13; x < 14; x += 6) g.fillRect(x, -11, 4, 4); g.fillStyle = '#2E3A40'; g.fillRect(-3, -6, 6, 6); }]);
  L.push(['humo', 16, 16, 8, 8, g => { const gr = g.createRadialGradient(0, 0, 0, 0, 0, 7); gr.addColorStop(0, 'rgba(142,138,134,.9)'); gr.addColorStop(1, 'rgba(142,138,134,0)'); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 7, 0, 7); g.fill(); }]);
  // Renovación colonial, paso 5: los edificios públicos coloniales (src/arte/publicos.js) reemplazan a los griegos.
  for (const r of recetasPublicos()) { const k = L.findIndex(x => x[0] === r[0]); if (k >= 0) L[k] = r; else L.push(r); }
  return L;
}

// Hornea todo en una sola hoja. Devuelve { canvas, marcos, escala }.
let HOJA = null;
export function hornearEdificios() {
  if (HOJA) return HOJA;
  const lista = recetas(), sep = 4, anchoHoja = 2048, marcos = {};
  let x = sep, y = sep, fila = 0;
  for (const [k, w, h, ax, ay] of lista) {
    const W = Math.ceil(w * ESCALA), H = Math.ceil(h * ESCALA);
    if (x + W > anchoHoja) { x = sep; y += fila + sep; fila = 0; }
    marcos[k] = { x, y, w: W, h: H, ax: ax * ESCALA, ay: ay * ESCALA };
    x += W + sep; fila = Math.max(fila, H);
  }
  const cv = lienzo(anchoHoja, y + fila + sep), g = cv.getContext('2d');
  for (const [k, , , , , pintar] of lista) {
    const m = marcos[k];
    g.save(); g.translate(m.x + m.ax, m.y + m.ay); g.scale(ESCALA, ESCALA);
    pintar(g, mulberry(k.length * 97 + k.charCodeAt(0) * 13 + (k.charCodeAt(k.length - 1) || 0)));
    g.restore();
  }
  return (HOJA = { canvas: cv, marcos, escala: ESCALA });
}

// Qué figuras lleva cada obra en una casilla: [{ k (figura), du, dv (desplazamiento en la casilla), s (escala), humo }].
// Cultivos, cafetales, parques y minas se pintan además en el suelo (ver terreno.js).
// era (fase 5): 0 bahareque, 1 tapia y balcón, 2 ladrillo, 3 concreto. Sin era, sigue la regla de la etapa.
export function figurasDeObra(k, i, etapa, reg, era) {
  const v = (i * 7 + 3) % 4;
  switch (k) {
    case 'casa': {
      const e = era === undefined ? (etapa >= 2 ? 1 : 0) : era;
      const f = [{ k: ['casa0-', 'casa2-', 'casa3-', 'casa4-'][e] + v }];
      if ((i * 7) % 5 === 0) f.push(reg === 'tirania' ? { k: 'bandera-tirania', du: -.18, dv: .3 } : reg === 'demagogia' ? { k: 'bandera-demagogia', du: 0, dv: .36 } : { k: 'bandera-' + reg, du: .22, dv: -.18, z: etapa >= 2 ? 30 : 22 });
      return f;
    }
    case 'mercado': return [{ k: etapa >= 2 ? 'mercado2' : 'mercado0' }];
    case 'agora': return [{ k: 'sede-' + reg }];
    // Fase 8: parque ordenado: la fuente al centro, dos árboles a los lados y setos.
    case 'fundacion': return [{ k: 'cruzFundacion', du: .06, dv: .06 }, { k: 'arbol', du: -.3, dv: -.28, s: 1.1, n: true }];
    case 'cementerio': return [{ k: 'cementerio' }, { k: 'cipres', du: -.3, dv: -.32 }, { k: 'cipres', du: -.36, dv: .05, s: .85 }];
    case 'parque': return [{ k: 'fuente' }, { k: 'arbol', du: -.3, dv: -.3, s: .9, n: true }, { k: 'arbol', du: .3, dv: .3, s: .9, n: true }, { k: 'arbusto', du: .3, dv: -.3, s: .9, n: true }, { k: 'arbusto', du: -.3, dv: .3, s: .9, n: true }];
    case 'cafetal': return [{ k: 'platano', du: -.3, dv: -.3, s: .95, n: true }, { k: 'platano', du: .32, dv: .1, s: .85, n: true }];
    case 'cultivo': return [{ k: 'platano', du: .3, dv: -.3, s: .85, n: true }];
    case 'finca': return []; // fase 10: arroz, aguacate, algodón y ganadería sin sombrío
    case 'taller': return [{ k: 'taller', humo: [11, -36] }];
    case 'mina': return [{ k: 'mina', du: .05, dv: .05, humo: [-1, -6], polvo: true }];
    default:
      if (k.startsWith('taller-')) { // fase 11: producto y nivel (con máquinas: chimenea alta; automatizada: nave de metal)
        const [, pr, nv] = k.split('-'), f = [{ k: 'taller', humo: +nv ? null : [11, -36] }]; // un solo humo por casilla
        if (+nv >= 1) f.push({ k: 'chimenea', du: -.32, dv: .02, humo: +nv === 1 ? [0, -50] : null });
        if (+nv >= 2) f.push({ k: 'nave', du: .02, dv: -.34 });
        if (pr !== 'artesanias') f.push({ k: 'carga-' + pr, du: .28, dv: .3 });
        return f;
      }
      return [{ k }];
  }
}

// Pequeño icono (imagen) de una obra para el panel de construir.
export function iconoObra(k, etapa, reg) {
  const H = hornearEdificios(), f = figurasDeObra(k, 0, etapa, reg).find(x => !x.n);
  const m = f && H.marcos[f.k], c = lienzo(96, 80), g = c.getContext('2d'), R = mulberry(k.length * 31);
  const cx = 48, cy = 56, s = m ? Math.min(1, 70 / (m.w / H.escala), 64 / (m.h / H.escala)) : 1;
  wash(g, [[cx, cy - 16 * s * 1.2], [cx + 32 * s * 1.2, cy], [cx, cy + 16 * s * 1.2], [cx - 32 * s * 1.2, cy]], k === 'mina' ? '#A39C8E' : k === 'cafetal' ? '#7E9A5A' : k === 'cultivo' ? '#B9C67E' : '#C6D293', R, .8, 1);
  if (k === 'cultivo' || k === 'cafetal') for (let a = 0; a < 4; a++) for (let b = 0; b < 4; b++) blob(g, cx + (a - b) * 7 * s, cy + (a + b - 3) * 3.5 * s, 3 * s, 2.2 * s, k === 'cafetal' ? '#2F5E36' : '#4F8A43', R, .9);
  if (m) g.drawImage(H.canvas, m.x, m.y, m.w, m.h, cx - m.ax / H.escala * s, cy - m.ay / H.escala * s, m.w / H.escala * s, m.h / H.escala * s);
  return urlDe(c);
}
