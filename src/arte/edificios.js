// Edificios en acuarela, con el lenguaje de la prueba de estilo (bahareque, casona, taller)
// y las obras de la versión 9 redibujadas. Se hornean una vez en una hoja; el mapa solo pone copias.
import { mulberry, shade, mix, wash, blob, poly, lienzo } from './acuarela.js';
import { TW, TH } from './iso.js';

const ESCALA = 4; // resolución del horneado (alta, para que se vea nítido de cerca)
const lerp = (a, b, t) => a + (b - a) * t;

// ---------- Pinceles de construcción ----------
function V2(u, v, z) { return [(u - v) * TW / 2, (u + v) * TH / 2 - (z || 0)]; }
function borde(g, pts, col, al, w) { g.globalAlpha = al; g.strokeStyle = col; g.lineWidth = w || .8; g.lineJoin = 'round'; poly(g, pts); g.stroke(); g.globalAlpha = 1; }
// Caja isométrica: ancho w (a lo largo de las columnas), fondo d, desde la altura z0 con alto h.
function iso(g, w, d, z0, h, cl, cr, ct, rng, ou = 0, ov = 0) {
  const A = V2(ou - w / 2, ov - d / 2), B = V2(ou + w / 2, ov - d / 2), C = V2(ou + w / 2, ov + d / 2), D = V2(ou - w / 2, ov + d / 2), up = (p, z) => [p[0], p[1] - z];
  wash(g, [up(D, z0), up(C, z0), up(C, z0 + h), up(D, z0 + h)], cl, rng, .97, .5);
  wash(g, [up(C, z0), up(B, z0), up(B, z0 + h), up(C, z0 + h)], cr, rng, .97, .5);
  if (ct) wash(g, [up(A, z0 + h), up(B, z0 + h), up(C, z0 + h), up(D, z0 + h)], ct, rng, .97, .5);
  borde(g, [up(D, z0), up(C, z0), up(C, z0 + h), up(D, z0 + h)], shade(cl, -.45), .25, .6);
  borde(g, [up(C, z0), up(B, z0), up(B, z0 + h), up(C, z0 + h)], shade(cr, -.45), .25, .6);
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
function cono(g, p, r, h, col, rng) { wash(g, [[p[0] - r, p[1]], [p[0], p[1] - h], [p[0] + r, p[1]]], col, rng, .95, .3); wash(g, [[p[0], p[1] - h], [p[0] + r, p[1]], [p[0], p[1] + r * .35]], shade(col, -.2), rng, .95, .3); }
function bandera(g, x, y, h, col) {
  g.strokeStyle = '#5A4A3A'; g.lineWidth = .9; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - h); g.stroke();
  g.fillStyle = col; g.globalAlpha = .95; g.beginPath(); g.moveTo(x, y - h); g.quadraticCurveTo(x + 5, y - h - 1.5, x + 9, y - h + 1); g.lineTo(x + 9, y - h + 6); g.quadraticCurveTo(x + 5, y - h + 4, x, y - h + 5); g.fill(); g.globalAlpha = 1;
}
function banderines(g, a, b, rng) {
  g.strokeStyle = '#6B4F3A'; g.lineWidth = .5; g.beginPath(); g.moveTo(...a); g.quadraticCurveTo((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 5, ...b); g.stroke();
  const cols = ['#C0602A', '#E7C76B', '#2D6E5E', '#C4513B', '#F4ECDB'];
  for (let k = 1; k < 8; k++) { const f = k / 8, x = lerp(a[0], b[0], f), y = lerp(a[1], b[1], f) + Math.sin(f * Math.PI) * 4.5; g.fillStyle = cols[k % 5]; g.beginPath(); g.moveTo(x - 1.6, y); g.lineTo(x + 1.6, y); g.lineTo(x, y + 3.2); g.fill(); }
}
function columnas(g, b, n, z, h, col) { for (let k = 0; k < n; k++) wash(g, caraI(b, .06 + k * (.88 / (n - 1)) - .025, .05, z, h), col, mulberry(k * 7 + 1), .97, .15); }
function ventanas(g, b, lado, n, z, h, col, rng, a = .1, w = .12) {
  for (let k = 0; k < n; k++) { const s = a + k * ((1 - 2 * a) / Math.max(1, n - 1)) - w / 2; wash(g, (lado === 'I' ? caraI : caraD)(b, n === 1 ? .5 - w / 2 : s, w, z, h), col, rng, .95, .2); }
}
function monedas(g, x, y) { for (let k = 0; k < 4; k++) { g.fillStyle = k % 2 ? '#E2B24F' : '#C9962E'; g.beginPath(); g.ellipse(x, y - k * 2.2, 4.5, 1.8, 0, 0, 7); g.fill(); } }

// ---------- Recetas: [clave, ancho, alto, anclaX, anclaY, pintura] ----------
const ZOC = ['#2F6E8E', '#B23A2E', '#3E7D4F', '#C08A2A'];
function recetas() {
  const L = [];
  // Casas de bahareque (Aldea y Pueblo), con zócalo de color.
  ZOC.forEach((z, v) => L.push(['casa0-' + v, 70, 64, 35, 50, (g, r) => {
    sombra(g, 20, 6, 8); const b = iso(g, .5, .4, 0, 15, '#F1EADB', '#DCD2BE', null, r);
    wash(g, caraI(b, 0, 1, 0, 3.2), z, r, .95, .3); wash(g, caraD(b, 0, 1, 0, 3.2), shade(z, -.15), r, .95, .3);
    wash(g, caraI(b, .38, .17, 0, 9), '#6B4A33', r, .97, .2); wash(g, caraI(b, .08, .2, 5, 5), shade(z, .15), r, .95, .2); wash(g, caraI(b, .7, .2, 5, 5), shade(z, .15), r, .95, .2); wash(g, caraD(b, .35, .3, 5, 5), shade(z, -.05), r, .95, .2);
    techo(g, b, 4, 11, '#B5563A', '#DCD2BE', r); blob(g, -18, -2, 2.4, 2, '#C44A3A', r, .9); blob(g, -15, -1, 2, 1.6, '#5E8F4E', r, .9);
  }]));
  // Casas de dos pisos con balcón (desde Ciudad).
  ZOC.forEach((z, v) => L.push(['casa2-' + v, 76, 80, 38, 60, (g, r) => {
    sombra(g, 22, 6, 8); const b = iso(g, .54, .44, 0, 25, '#F4EEE2', '#DDD3C0', null, r);
    wash(g, caraI(b, 0, 1, 0, 3.4), z, r, .95, .3); wash(g, caraD(b, 0, 1, 0, 3.4), shade(z, -.15), r, .95, .3);
    wash(g, caraI(b, .4, .16, 0, 9.5), '#6B4A33', r, .97, .2);
    ventanas(g, b, 'I', 3, 14, 6, shade(z, .1), r, .16, .14); ventanas(g, b, 'D', 2, 14, 6, shade(z, -.05), r, .25, .18);
    wash(g, caraI(b, .02, .96, 12, 1.3), '#6B4A33', r, .97, .2);
    for (let k = 0; k < 8; k++) borde(g, caraI(b, .04 + k * .125, .01, 12, 3.6), '#6B4A33', .9, .6);
    for (let k = 0; k < 3; k++) blob(g, ...caraI(b, .14 + k * .32, .05, 13.5, 1)[3], 1.6, 1.2, '#C44A3A', r, .9);
    techo(g, b, 4.5, 12, '#A94B32', '#DDD3C0', r);
  }]));
  // Fase 5: casas de ladrillo (época del ladrillo) y de concreto con terraza y tanque (época del concreto).
  ZOC.forEach((z, v) => L.push(['casa3-' + v, 76, 82, 38, 62, (g, r) => {
    sombra(g, 22, 6, 8); const b = iso(g, .54, .44, 0, 26, '#B8664A', '#9A5440', null, r);
    for (let k = 0; k < 5; k++) { g.globalAlpha = .25; g.strokeStyle = '#7A3E2E'; g.lineWidth = .5; const L1 = caraI(b, 0, 1, 3 + k * 4.6, 0); g.beginPath(); g.moveTo(...L1[0]); g.lineTo(...L1[1]); g.stroke(); g.globalAlpha = 1; }
    wash(g, caraI(b, .4, .16, 0, 9.5), '#5A4632', r, .97, .2);
    ventanas(g, b, 'I', 3, 15, 6, '#F4F1E6', r, .16, .14); ventanas(g, b, 'D', 2, 15, 6, '#EDE8DC', r, .25, .18);
    wash(g, caraI(b, .1, .8, 13, 1.2), z, r, .95, .2);
    techo(g, b, 3.5, 9, '#8E3B2E', '#9A5440', r);
  }]));
  ZOC.forEach((z, v) => L.push(['casa4-' + v, 76, 92, 38, 72, (g, r) => {
    sombra(g, 22, 6, 8); const b = iso(g, .56, .46, 0, 34, '#E4E1DA', '#C9C5BC', '#D6D2CA', r);
    ventanas(g, b, 'I', 3, 8, 6, '#6E8FA6', r, .14, .13); ventanas(g, b, 'I', 3, 22, 6, '#6E8FA6', r, .14, .13); ventanas(g, b, 'D', 2, 8, 6, '#5E7F96', r, .22, .18); ventanas(g, b, 'D', 2, 22, 6, '#5E7F96', r, .22, .18);
    wash(g, caraI(b, .4, .18, 0, 7.5), z, r, .97, .2); wash(g, caraI(b, 0, 1, 16, 1.4), z, r, .95, .2);
    const t = b.up(V2(.12, -.1), 34); wash(g, [[t[0] - 4, t[1]], [t[0] + 4, t[1]], [t[0] + 4, t[1] - 6], [t[0] - 4, t[1] - 6]], '#3A4A5A', r, .97, .2); g.fillStyle = '#4E6070'; g.beginPath(); g.ellipse(t[0], t[1] - 6, 4, 1.5, 0, 0, 7); g.fill();
    const an = b.up(V2(-.18, .05), 34); g.strokeStyle = '#4A4A4A'; g.lineWidth = .6; g.beginPath(); g.moveTo(an[0], an[1]); g.lineTo(an[0], an[1] - 9); g.moveTo(an[0] - 3, an[1] - 7); g.lineTo(an[0] + 3, an[1] - 7); g.stroke();
  }]));
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
  L.push(['escuela', 84, 88, 42, 58, (g, r) => {
    sombra(g, 26, 7, 8); const b = iso(g, .74, .48, 0, 16, '#E7C76B', '#CBAA50', null, r);
    wash(g, caraI(b, 0, 1, 0, 3), '#8B6B3A', r, .95, .3); wash(g, caraD(b, 0, 1, 0, 3), '#6E5530', r, .95, .3);
    ventanas(g, b, 'I', 4, 6, 6, '#6E93A8', r, .1, .11); wash(g, caraD(b, .38, .24, 0, 10), '#6B4A33', r, .97, .2);
    techo(g, b, 4, 10, '#A94B32', '#CBAA50', r);
    const t = iso(g, .15, .15, 0, 31, '#F0E7D3', '#D7C8AC', null, r, -.02, -.02);
    wash(g, caraI(t, .25, .5, 24, 4), '#4A3A2C', r, .95, .2); blob(g, ...caraI(t, .45, .1, 24.5, 1)[3], 1.3, 1.3, '#C9A13E', r, .95);
    techo(g, t, 1.5, 7, '#A94B32', '#D7C8AC', r);
  }]);
  L.push(['hospital', 84, 72, 42, 52, (g, r) => {
    sombra(g, 26, 7, 8); const b = iso(g, .72, .58, 0, 20, '#F4F3EE', '#D9D8D0', '#E6E5DD', r);
    ventanas(g, b, 'I', 4, 11, 5, '#8FB3C4', r, .1, .1); ventanas(g, b, 'I', 3, 2, 5, '#8FB3C4', r, .15, .1);
    wash(g, caraD(b, .6, .22, 0, 9), '#5E6E78', r, .97, .2);
    const m = caraD(b, .2, .3, 9, 9), cx = (m[0][0] + m[2][0]) / 2, cy = (m[0][1] + m[2][1]) / 2;
    g.fillStyle = '#C0392B'; g.globalAlpha = .92; g.fillRect(cx - 1.4, cy - 4.5, 2.8, 9); g.beginPath(); g.moveTo(cx - 4.5, cy - 1.2); g.lineTo(cx + 4.5, cy - 3.2); g.lineTo(cx + 4.5, cy - .4); g.lineTo(cx - 4.5, cy + 1.6); g.fill(); g.globalAlpha = 1;
    wash(g, [b.up(b.A, 20), b.up(b.B, 20), b.up(b.C, 20), b.up(b.D, 20)].map((p, i) => [p[0], p[1] - (i ? 0 : 0)]), '#E0DED5', r, .5, .3);
  }]);
  L.push(['taller', 76, 78, 38, 58, (g, r) => {
    sombra(g, 22, 6, 8); iso(g, .1, .1, 0, 34, '#A8664C', '#8B4F3A', '#5A3A2C', r, .2, -.18);
    const b = iso(g, .54, .44, 0, 14, '#B06C50', '#8E5440', null, r, -.04, .06);
    wash(g, caraI(b, .3, .3, 0, 10), '#3E2E25', r, .97, .2); ventanas(g, b, 'D', 2, 5, 5, '#E0B070', r, .25, .16);
    techo(g, b, 3, 8, '#5E4A40', '#8E5440', r);
    const s = V2(.35, .42); for (let k = 0; k < 3; k++) wash(g, [[s[0] - 3 + k * 2, s[1]], [s[0] + 1 + k * 2, s[1]], [s[0] + 1 + k * 2, s[1] - 4], [s[0] - 3 + k * 2, s[1] - 4]], '#9C7447', r, .95, .2);
  }]);
  // Oficina de recaudo (fase 2): casita encalada con puerta verde, letrero con moneda y mesa del recaudador.
  L.push(['recaudo', 70, 66, 35, 50, (g, r) => {
    sombra(g, 20, 6, 8); const b = iso(g, .5, .42, 0, 15, '#F3EEE3', '#DAD2C2', null, r);
    wash(g, caraI(b, 0, 1, 0, 3), '#5E7F6A', r, .95, .3); wash(g, caraD(b, 0, 1, 0, 3), '#4C6B58', r, .95, .3);
    wash(g, caraI(b, .56, .2, 0, 9), '#3F6B52', r, .97, .2); ventanas(g, b, 'I', 1, 5, 5, '#7FA3B4', r, .22, .2); wash(g, caraI(b, .12, .22, 5, 5), '#7FA3B4', r, .95, .2);
    techo(g, b, 4, 10, '#9E4A32', '#DAD2C2', r);
    const s = caraI(b, .2, .5, 11, 3.2); wash(g, s, '#6B4A33', r, .97, .2);
    const c = [(s[0][0] + s[2][0]) / 2, (s[0][1] + s[2][1]) / 2]; g.fillStyle = '#E2B24F'; g.beginPath(); g.ellipse(c[0], c[1], 1.6, 1.2, 0, 0, 7); g.fill();
    const m = V2(.34, .34); wash(g, [[m[0] - 4, m[1]], [m[0] + 4, m[1]], [m[0] + 4, m[1] - 4], [m[0] - 4, m[1] - 4]], '#8A6A44', r, .95, .2); monedas(g, m[0], m[1] - 5);
  }]);
  // Huellas de las decisiones (fase 4): figuras pequeñas que quedan unos años en el espacio público.
  const persona = (g, x, y, ropa, gorro) => { g.fillStyle = ropa; g.fillRect(x - 1.2, y - 7, 2.4, 5); g.fillStyle = '#C98E62'; g.beginPath(); g.arc(x, y - 8.2, 1.3, 0, 7); g.fill(); if (gorro) { g.fillStyle = gorro; g.fillRect(x - 1.6, y - 10, 3.2, 1.3); } };
  L.push(['m_mural', 56, 44, 28, 34, (g, r) => {
    sombra(g, 18, 4, 4); const b = iso(g, .62, .1, 0, 13, '#E8DFCC', '#CFC4AE', '#D8CDB6', r);
    const cols = ['#C0602A', '#2D6E5E', '#E7C76B', '#C4513B', '#5E8FB0', '#7A4E8A'];
    for (let k = 0; k < 6; k++) wash(g, caraI(b, .04 + k * .155, .15, 2 + (k % 2) * 3, 6 + (k % 3) * 2), cols[k], r, .9, .3);
    const s = caraI(b, .3, .4, 4, 4); blob(g, (s[0][0] + s[2][0]) / 2, (s[0][1] + s[2][1]) / 2, 3, 2.4, '#F4EFE2', r, .9);
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
  L.push(['m_acta', 44, 46, 22, 36, (g, r) => {
    sombra(g, 14, 4, 3); const p = V2(0, 0);
    blob(g, p[0], p[1] - 9, 11, 10, '#B9B1A2', r, .97); blob(g, p[0] - 2, p[1] - 12, 7, 5, '#CEC6B6', r, .8);
    g.strokeStyle = '#6B6258'; g.lineWidth = .7; for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(p[0] - 6, p[1] - 14 + k * 2.6); g.lineTo(p[0] + 6, p[1] - 14 + k * 2.6); g.stroke(); }
    blob(g, p[0] + 8, p[1] - 1, 3, 2.5, '#5E8A4D', r, .9);
  }]);
  // Cultura y deporte (fase 5): cancha, biblioteca, teatro y estadio.
  L.push(['cancha', 92, 56, 46, 32, (g, r) => {
    const b = iso(g, .92, .7, 0, 1.5, '#7FA35C', '#6A8C4A', '#8CB466', r);
    g.strokeStyle = '#F4F1E6'; g.lineWidth = .8; const L1 = [V2(-.4, -.3, 1.5), V2(.4, -.3, 1.5), V2(.4, .3, 1.5), V2(-.4, .3, 1.5)];
    g.beginPath(); g.moveTo(...L1[0]); for (const q of L1.slice(1)) g.lineTo(...q); g.closePath(); g.stroke();
    const m1 = V2(0, -.3, 1.5), m2 = V2(0, .3, 1.5); g.beginPath(); g.moveTo(...m1); g.lineTo(...m2); g.stroke(); const cc = V2(0, 0, 1.5); g.beginPath(); g.ellipse(cc[0], cc[1], 6, 3, 0, 0, 7); g.stroke();
    for (const u of [-.4, .4]) { const q = V2(u, 0, 1.5); g.strokeStyle = '#E8E4DA'; g.lineWidth = .9; g.beginPath(); g.moveTo(q[0] - 3, q[1] + 1.5); g.lineTo(q[0] - 3, q[1] - 6); g.lineTo(q[0] + 3, q[1] - 7.5); g.lineTo(q[0] + 3, q[1]); g.stroke(); }
    for (const [u, v, col] of [[-.15, -.1, '#C0392B'], [.12, .08, '#2D5D72'], [.22, -.15, '#C0392B']]) { const q = V2(u, v, 1.5); g.fillStyle = col; g.fillRect(q[0] - 1, q[1] - 5, 2, 3.4); g.fillStyle = '#C98E62'; g.beginPath(); g.arc(q[0], q[1] - 6, 1.1, 0, 7); g.fill(); }
    const pel = V2(.02, -.02, 1.5); g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(pel[0], pel[1] - 1, .9, 0, 7); g.fill();
  }]);
  L.push(['biblioteca', 76, 72, 38, 54, (g, r) => {
    sombra(g, 24, 6, 8); const b = iso(g, .6, .46, 0, 16, '#E9E1CF', '#CDC3AD', null, r);
    for (let k = 0; k < 3; k++) wash(g, caraI(b, .12 + k * .28, .16, 3, 9), '#6E8FA6', r, .95, .2);
    wash(g, caraD(b, .35, .3, 0, 9), '#5A4632', r, .97, .2); techo(g, b, 3, 7, '#7A4E3A', '#CDC3AD', r);
    const s = caraI(b, .2, .6, 13, 2.6); wash(g, s, '#2D5D72', r, .97, .2);
    const q = V2(.38, .32); for (let k = 0; k < 3; k++) wash(g, [[q[0] - 3 + k * 2.2, q[1]], [q[0] - 1.4 + k * 2.2, q[1]], [q[0] - 1.4 + k * 2.2, q[1] - 5], [q[0] - 3 + k * 2.2, q[1] - 5]], ['#C0602A', '#2D6E5E', '#E7C76B'][k], r, .95, .2);
  }]);
  L.push(['teatro', 88, 84, 44, 62, (g, r) => {
    sombra(g, 28, 7, 8); const b = iso(g, .7, .56, 0, 20, '#D9B98A', '#BE9C6C', null, r);
    columnas(g, b, 4, 2, 15, '#F4EFE2'); wash(g, caraI(b, 0, 1, 18, 4), '#C9A473', r, .97, .2);
    const t = b.up(V2(-.05, 0), 20); wash(g, [[t[0] - 22, t[1] + 6], [t[0] + 22, t[1] + 6], [t[0], t[1] - 10]], '#8E3B2E', r, .95, .3);
    const m = V2(-.12, .32); blob(g, m[0], m[1] - 12, 3, 3, '#F4EFE2', r, .95); blob(g, m[0] + 6, m[1] - 12, 3, 3, '#E7C76B', r, .95);
    const p2 = b.up(V2(.25, -.2), 20); bandera(g, p2[0], p2[1], 12, '#8E3B2E');
  }]);
  L.push(['estadio', 112, 84, 56, 58, (g, r) => {
    sombra(g, 36, 8, 8);
    const b = iso(g, .96, .8, 0, 12, '#CFC8B6', '#B3AB97', null, r);
    const c0 = V2(0, 0, 12); g.fillStyle = '#7FA35C'; g.beginPath(); g.ellipse(c0[0], c0[1], 26, 13, 0, 0, 7); g.fill();
    g.strokeStyle = '#F4F1E6'; g.lineWidth = .7; g.beginPath(); g.ellipse(c0[0], c0[1], 10, 5, 0, 0, 7); g.stroke();
    for (let k = 0; k < 14; k++) { const a = k / 14 * Math.PI * 2; g.fillStyle = ['#C0392B', '#E7C76B', '#2D5D72', '#F4F1E6'][k % 4]; g.beginPath(); g.arc(c0[0] + Math.cos(a) * 31, c0[1] + Math.sin(a) * 15.5, 1.3, 0, 7); g.fill(); }
    for (const u of [-.46, .46]) { const q = V2(u, -.38, 12); g.fillStyle = '#6B6258'; g.fillRect(q[0] - .6, q[1] - 22, 1.2, 22); g.fillStyle = '#F6E3A0'; g.fillRect(q[0] - 3, q[1] - 24, 6, 2.6); }
  }]);
  // Estación de policía (fase 4): casa blanca con zócalo verde oliva, puerta y letrero azules, farol y un agente en la puerta.
  L.push(['policia', 74, 70, 37, 52, (g, r) => {
    sombra(g, 22, 6, 8); const b = iso(g, .56, .44, 0, 15, '#F1EEE6', '#D6D1C4', null, r);
    wash(g, caraI(b, 0, 1, 0, 4), '#5B6B3E', r, .95, .3); wash(g, caraD(b, 0, 1, 0, 4), '#4A5933', r, .95, .3);
    wash(g, caraI(b, .58, .18, 0, 9), '#2D4F66', r, .97, .2); ventanas(g, b, 'I', 1, 5, 5, '#7FA3B4', r, .2, .2); ventanas(g, b, 'D', 2, 5, 5, '#7FA3B4', r, .25, .16);
    techo(g, b, 3, 8, '#4E5A62', '#D6D1C4', r);
    const s = caraI(b, .14, .5, 11, 3.4); wash(g, s, '#24425A', r, .97, .2);
    const c = [(s[0][0] + s[2][0]) / 2, (s[0][1] + s[2][1]) / 2]; g.fillStyle = '#F2D36B'; g.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, d = k % 2 ? .7 : 1.7; g.lineTo(c[0] + Math.cos(a) * d, c[1] + Math.sin(a) * d); } g.fill();
    const f = V2(.42, .22); g.strokeStyle = '#3A3A3A'; g.lineWidth = .6; g.beginPath(); g.moveTo(f[0], f[1]); g.lineTo(f[0], f[1] - 13); g.stroke(); g.fillStyle = '#F6E3A0'; g.beginPath(); g.arc(f[0], f[1] - 13.5, 1.4, 0, 7); g.fill();
    const q = V2(.4, .36); g.fillStyle = '#4A5A3A'; g.fillRect(q[0] - 1.2, q[1] - 7, 2.4, 5); g.fillStyle = '#E0B08A'; g.beginPath(); g.arc(q[0], q[1] - 8.2, 1.3, 0, 7); g.fill(); g.fillStyle = '#2E3A28'; g.fillRect(q[0] - 1.6, q[1] - 10, 3.2, 1.3);
  }]);
  // Cuartel (fase 3): patio con muro de tapia, garita, edificio de mando y bandera; dos centinelas.
  L.push(['cuartel', 92, 84, 46, 58, (g, r) => {
    sombra(g, 28, 7, 8);
    const m = iso(g, .9, .8, 0, 5, '#C9B08A', '#A88F68', '#B9A07A', r);
    const b = iso(g, .5, .36, 0, 17, '#D8CDB4', '#B7AA8E', null, r, .12, -.14);
    ventanas(g, b, 'I', 3, 7, 5, '#5E6E78', r, .15, .13); wash(g, caraD(b, .35, .3, 0, 9), '#4E4234', r, .97, .2);
    techo(g, b, 3, 7, '#6E5A46', '#B7AA8E', r);
    const t = iso(g, .14, .14, 0, 27, '#CDBF9F', '#AE9F80', '#C2B391', r, -.32, .26); wash(g, caraI(t, .2, .6, 21, 3), '#3E3428', r, .95, .2);
    const p = b.up(V2(.36, -.3), 17); bandera(g, p[0], p[1], 16, '#2D5D72');
    for (const [u, v] of [[.38, .42], [.18, .48]]) { const q = V2(u, v); g.fillStyle = '#3F4A36'; g.fillRect(q[0] - 1.2, q[1] - 7, 2.4, 5); g.fillStyle = '#E0B08A'; g.beginPath(); g.arc(q[0], q[1] - 8.2, 1.3, 0, 7); g.fill(); g.fillStyle = '#2E3A28'; g.fillRect(q[0] - 1.5, q[1] - 10, 3, 1.2); g.strokeStyle = '#4A3A2C'; g.lineWidth = .5; g.beginPath(); g.moveTo(q[0] + 1.6, q[1] - 2); g.lineTo(q[0] + 1.6, q[1] - 10.5); g.stroke(); }
  }]);
  L.push(['banco', 80, 76, 40, 54, (g, r) => {
    sombra(g, 24, 7, 8); const base = iso(g, .7, .62, 0, 3, '#CFC8B6', '#B3AB97', '#DDD6C5', r);
    const b = iso(g, .62, .54, 3, 17, '#E6E0D2', '#C9C1AE', '#DAD3C2', r);
    columnas(g, b, 5, 3, 13, '#F6F3EA'); wash(g, caraI(b, 0, 1, 16, 4), '#D2CAB6', r, .97, .2); wash(g, caraD(b, 0, 1, 16, 4), '#B8AF9A', r, .97, .2);
    wash(g, caraD(b, .35, .3, 3, 8), '#5E4A3A', r, .97, .2);
    const tp = b.up(V2(0, 0), 20); blob(g, tp[0], tp[1] - 3, 8, 6, '#D9A93E', r, .92); blob(g, tp[0] - 2.5, tp[1] - 5.5, 2.5, 2, '#F4D67A', r, .8); blob(g, tp[0], tp[1] - 10, 1.4, 1.4, '#8C6A1E', r, .95);
  }]);
  L.push(['universidad', 96, 96, 48, 64, (g, r) => {
    sombra(g, 30, 8, 8); const b = iso(g, .86, .6, 0, 17, '#C98160', '#A8623F', null, r);
    for (let k = 0; k < 4; k++) wash(g, caraI(b, .07 + k * .24, .1, 5, 7), '#F0E7D3', r, .95, .2);
    ventanas(g, b, 'D', 2, 6, 6, '#F0E7D3', r, .2, .16); techo(g, b, 4, 8, '#6D4A39', '#A8623F', r);
    const t = iso(g, .24, .24, 0, 31, '#F0E7D3', '#D7C8AC', '#E4D8C0', r);
    columnas(g, t, 3, 19, 10, '#FFFFFF'); wash(g, caraI(t, .3, .4, 5, 9), '#6B4A33', r, .97, .2);
    const tp = t.up(V2(0, 0), 31); blob(g, tp[0], tp[1] - 4, 7, 6, '#5F8C8A', r, .92); blob(g, tp[0], tp[1] - 10.5, 1.3, 1.3, '#C9A13E', r, .95);
  }]);
  L.push(['acueducto', 84, 60, 42, 38, (g, r) => {
    sombra(g, 26, 6, 6);
    const A = V2(-.46, -.05), Bq = V2(.46, -.05), h = 14;
    for (let k = 0; k < 4; k++) { const p = [lerp(A[0], Bq[0], k / 3), lerp(A[1], Bq[1], k / 3)]; wash(g, [[p[0] - 2.4, p[1]], [p[0] + 2.4, p[1]], [p[0] + 2.4, p[1] - h], [p[0] - 2.4, p[1] - h]], '#CFC3AA', r, .97, .3); }
    g.strokeStyle = '#A89B80'; g.globalAlpha = .85; g.lineWidth = 1.2;
    for (let k = 0; k < 3; k++) { const f = k / 3 + 1 / 6, p = [lerp(A[0], Bq[0], f), lerp(A[1], Bq[1], f)]; g.beginPath(); g.arc(p[0], p[1] - h + 7.5, 7, Math.PI * 1.05, Math.PI * 1.95); g.stroke(); }
    g.globalAlpha = 1;
    wash(g, [[A[0], A[1] - h], [Bq[0], Bq[1] - h], [Bq[0], Bq[1] - h - 4], [A[0], A[1] - h - 4]], '#D8CDB6', r, .97, .3);
    wash(g, [[A[0], A[1] - h - 4], [Bq[0], Bq[1] - h - 4], [Bq[0], Bq[1] - h - 5.6], [A[0], A[1] - h - 5.6]], '#7FB3CF', r, .95, .2);
    iso(g, .22, .22, 0, 9, '#D8CDB6', '#BDB09A', '#7FB3CF', r, .3, .3);
  }]);
  L.push(['molino', 76, 64, 38, 46, (g, r) => {
    sombra(g, 22, 6, 8); const b = iso(g, .44, .42, 0, 15, '#A9825A', '#8B6844', null, r, .1, -.05);
    wash(g, caraI(b, .55, .2, 0, 8), '#3E2E25', r, .97, .2); techo(g, b, 3, 8, '#6B4A35', '#8B6844', r);
    const w = V2(-.26, .2), R = 10;
    g.strokeStyle = '#5E4330'; g.lineWidth = 1.8; g.globalAlpha = .95; g.beginPath(); g.ellipse(w[0], w[1] - 8, R * .55, R, 0, 0, 7); g.stroke();
    g.lineWidth = 1; for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; g.beginPath(); g.moveTo(w[0], w[1] - 8); g.lineTo(w[0] + Math.cos(a) * R * .55, w[1] - 8 + Math.sin(a) * R); g.stroke(); }
    g.globalAlpha = 1; blob(g, w[0], w[1] + 2, 4, 2, '#CFE5F0', r, .7);
  }]);
  L.push(['puerto', 84, 64, 42, 44, (g, r) => {
    sombra(g, 24, 6, 8);
    const d = [V2(-.58, .02), V2(-.06, .02), V2(-.06, .34), V2(-.58, .34)].map(p => [p[0], p[1] - 2]);
    wash(g, d, '#9B7650', r, .97, .2); g.strokeStyle = '#5E4330'; g.lineWidth = .6; g.globalAlpha = .6;
    for (let k = 1; k < 6; k++) { const f = k / 6; g.beginPath(); g.moveTo(lerp(d[0][0], d[1][0], f), lerp(d[0][1], d[1][1], f)); g.lineTo(lerp(d[3][0], d[2][0], f), lerp(d[3][1], d[2][1], f)); g.stroke(); }
    g.globalAlpha = 1;
    const b = iso(g, .48, .4, 0, 13, '#C9A874', '#A8864F', null, r, .16, -.16); wash(g, caraI(b, .3, .35, 0, 9), '#4E3A2A', r, .97, .2); techo(g, b, 3, 7, '#7A5536', '#A8864F', r);
    iso(g, .1, .1, 0, 4, '#8C6A1E', '#6E5217', '#A87F2A', r, -.22, .2);
    const bt = V2(-.66, .52);
    wash(g, [[bt[0] - 11, bt[1] - 2], [bt[0] + 9, bt[1] - 4], [bt[0] + 6, bt[1] + 1], [bt[0] - 8, bt[1] + 3]], '#6B4A35', r, .95, .2);
    g.strokeStyle = '#4A3A2C'; g.lineWidth = 1; g.beginPath(); g.moveTo(bt[0] - 1, bt[1] - 2); g.lineTo(bt[0] - 1, bt[1] - 19); g.stroke();
    wash(g, [[bt[0] - 1, bt[1] - 19], [bt[0] + 9, bt[1] - 6], [bt[0] - 1, bt[1] - 5]], '#F2ECDD', r, .95, .2);
    monedas(g, ...V2(.38, .38));
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
  L.push(['fuente', 44, 34, 22, 24, (g, r) => {
    sombra(g, 12, 3.5, 3); g.fillStyle = '#D8CCB2'; g.beginPath(); g.ellipse(0, -2, 12, 5, 0, 0, 7); g.fill(); g.fillStyle = '#BFB296'; g.fillRect(-12, -2, 24, 3); g.beginPath(); g.ellipse(0, 1, 12, 5, 0, 0, Math.PI); g.fill();
    g.fillStyle = '#86BDD2'; g.beginPath(); g.ellipse(0, -2.5, 9.5, 3.6, 0, 0, 7); g.fill(); g.fillStyle = '#D8CCB2'; g.fillRect(-1.5, -12, 3, 10); g.fillStyle = '#B9E0EC'; g.beginPath(); g.ellipse(0, -12, 3, 1.4, 0, 0, 7); g.fill();
  }]);
  // ---------- Sedes de gobierno, una por régimen ----------
  L.push(['sede-republica', 90, 96, 45, 62, (g, r) => {
    sombra(g, 28, 8, 8); iso(g, .86, .78, 0, 4, '#DCD5C6', '#BDB5A3', '#E9E3D6', r);
    const b = iso(g, .74, .62, 4, 20, '#EDE7DA', '#CFC7B5', null, r);
    columnas(g, b, 6, 4, 18, '#FAF8F2'); wash(g, caraD(b, .35, .3, 4, 11), '#5E4A3A', r, .97, .2);
    techo(g, b, 4, 11, '#D9D1BF', '#C9C0AC', r);
    const tp = b.up(V2(.1, -.1), 32); bandera(g, tp[0], tp[1], 13, '#2D5D72');
  }]);
  L.push(['sede-monarquia', 96, 110, 48, 72, (g, r) => {
    sombra(g, 30, 8, 8); const b = iso(g, .66, .48, 0, 18, '#EDE4D0', '#D2C4A6', null, r, 0, .05);
    ventanas(g, b, 'I', 4, 7, 7, '#6E93A8', r, .12, .1); wash(g, caraD(b, .38, .24, 0, 11), '#5A3E2A', r, .97, .2);
    techo(g, b, 4, 9, '#6A4A8A', '#D2C4A6', r);
    for (const [u, v] of [[-.36, -.28], [.36, -.28], [-.36, .34], [.36, .34]]) {
      const t = iso(g, .17, .17, 0, 30, '#E6DCC5', '#C9BA9A', null, r, u, v);
      cono(g, t.up(V2(u, v), 30), 7, 15, '#5B3A7A', r);
    }
    const p = V2(.36, .34); bandera(g, p[0], p[1] - 45, 12, '#D9A93E');
  }]);
  L.push(['sede-aristocracia', 100, 90, 50, 58, (g, r) => {
    sombra(g, 32, 8, 8); iso(g, .92, .72, 0, 3, '#CFC8B6', '#B3AB97', '#DDD6C5', r);
    const b = iso(g, .84, .6, 3, 16, '#E4DECF', '#C4BCA8', null, r);
    columnas(g, b, 7, 3, 14, '#F4F0E6'); wash(g, caraD(b, .38, .24, 3, 10), '#4E3E30', r, .97, .2);
    techo(g, b, 4, 9, '#2F5B45', '#C4BCA8', r);
    const tp = b.up(V2(0, 0), 29); blob(g, tp[0], tp[1], 6, 5, '#A07A3E', r, .92); bandera(g, tp[0], tp[1] - 4, 10, '#2F5B45');
  }]);
  L.push(['sede-tirania', 90, 90, 45, 58, (g, r) => {
    sombra(g, 28, 8, 8); const b = iso(g, .76, .62, 0, 23, '#A7A5A0', '#85837E', '#9A9893', r);
    for (let k = 0; k < 5; k++) wash(g, caraI(b, .06 + k * .19, .08, 11, 4), '#3E3E42', r, .95, .2);
    wash(g, caraI(b, .4, .2, 3, 17), '#9E2B25', r, .95, .2); wash(g, caraD(b, .35, .3, 6, 13), '#9E2B25', r, .95, .2);
    const tp = b.up(V2(.25, -.2), 23); bandera(g, tp[0], tp[1], 16, '#9E2B25');
    const st = V2(-.08, .62); iso(g, .12, .12, 0, 6, '#8E8C88', '#6F6D69', '#A09E99', r, -.08, .62);
    g.fillStyle = '#5A5854'; g.fillRect(st[0] - 1.5, st[1] - 13, 3, 6); blob(g, st[0], st[1] - 14.5, 2.2, 2.2, '#5A5854', r, .95);
  }]);
  L.push(['sede-oligarquia', 90, 88, 45, 56, (g, r) => {
    sombra(g, 28, 8, 8); const b = iso(g, .72, .62, 0, 19, '#E6DFCF', '#C9BFA9', '#DAD2BF', r);
    columnas(g, b, 5, 0, 17, '#F6F2E8'); wash(g, caraI(b, 0, 1, 17, 2.2), '#C9962E', r, .97, .2); wash(g, caraD(b, 0, 1, 17, 2.2), '#A87A20', r, .97, .2);
    wash(g, caraD(b, .35, .3, 0, 10), '#5E4A3A', r, .97, .2);
    const tp = b.up(V2(0, 0), 19); blob(g, tp[0], tp[1] - 5, 10, 8, '#D9A93E', r, .95); blob(g, tp[0] - 3, tp[1] - 8, 3, 2.5, '#F4D67A', r, .8); blob(g, tp[0], tp[1] - 14, 1.8, 1.8, '#8C6A1E', r, .95);
    monedas(g, ...V2(.34, .58));
  }]);
  L.push(['sede-demagogia', 88, 84, 44, 56, (g, r) => {
    sombra(g, 26, 7, 8); const b = iso(g, .66, .52, 0, 21, '#EFB98A', '#D69A68', null, r);
    for (let k = 0; k < 4; k++) wash(g, caraI(b, .1 + k * .22, .14, 0, 9), k % 2 ? '#E7C76B' : '#C0602A', r, .95, .2);
    wash(g, caraI(b, .25, .5, 10, 2.2), '#6B4F3A', r, .97, .2); wash(g, caraI(b, .3, .12, 12, 7), '#3E2E25', r, .97, .2); wash(g, caraI(b, .58, .12, 12, 7), '#3E2E25', r, .97, .2);
    techo(g, b, 4, 9, '#B4553A', '#D69A68', r);
    banderines(g, [b.D[0] - 2, b.D[1] - 19], [b.C[0], b.C[1] - 19], r); banderines(g, [b.C[0], b.C[1] - 19], [b.B[0] + 2, b.B[1] - 19], r);
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
  L.push(['humo', 16, 16, 8, 8, g => { const gr = g.createRadialGradient(0, 0, 0, 0, 0, 7); gr.addColorStop(0, 'rgba(142,138,134,.9)'); gr.addColorStop(1, 'rgba(142,138,134,0)'); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 7, 0, 7); g.fill(); }]);
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
    case 'parque': return [{ k: 'fuente' }, { k: 'arbol', du: -.3, dv: -.1, s: .95, n: true }, { k: 'arbol', du: .25, dv: -.3, s: .85, n: true }, { k: 'arbol', du: .05, dv: .32, s: .8, n: true }];
    case 'cafetal': return [{ k: 'platano', du: -.3, dv: -.3, s: .95, n: true }, { k: 'platano', du: .32, dv: .1, s: .85, n: true }];
    case 'cultivo': return [{ k: 'platano', du: .3, dv: -.3, s: .85, n: true }];
    case 'taller': return [{ k: 'taller', humo: [11, -36] }];
    case 'mina': return [{ k: 'mina', du: .05, dv: .05, humo: [-1, -6], polvo: true }];
    default: return [{ k }];
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
  return c.toDataURL();
}
