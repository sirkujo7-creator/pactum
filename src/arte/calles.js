// Calles y vehículos al fresco (fase 9): arrieros con mulas (herradura), chivas (empedrado) y camiones (carretera),
// horneados una vez en una hoja con cada eje y sentido. También el icono de la herramienta "Calle".
import { FR, mulberry, shade, mix, lienzo, pintar, cajaIso, urlDe, RES_HOJA } from './fresco.js';
import { hornearGente } from './gente.js';
import { P } from './iso.js';
import { ESTILO_CALLE } from './terreno.js';

// Caja de un vehículo orientada por su eje ('c' o 'r'), en el punto (r, c) del mundo.
function caja(g, r, c, eje, largo, ancho, alto, z0, cols, rng) {
  const B = eje === 'c' ? cajaIso(largo, ancho, alto) : cajaIso(ancho, largo, alto), o = P(r, c), up = p => [p[0] + o[0], p[1] + o[1] - z0];
  pintar(g, B.izq.map(up), cols[0], rng, { n: 1, bw: .4 }); pintar(g, B.der.map(up), cols[1], rng, { n: 1, bw: .4 }); pintar(g, B.techo.map(up), cols[2], rng, { n: 1, bw: .4 });
  return { B, up };
}
function rueda(g, p) { g.fillStyle = FR.carbon; g.beginPath(); g.ellipse(p[0], p[1] - 1, 1.6, 1.3, 0, 0, Math.PI * 2); g.fill(); }
const L = (p, s, f) => [p[0] + (s[0] - p[0]) * f, p[1] + (s[1] - p[1]) * f];
function ruedas(g, B, up, fs) { for (const f of fs) { rueda(g, up(L(B.izq[0], B.izq[1], f))); rueda(g, up(L(B.der[0], B.der[1], f))); } }

// Dibuja un vehículo en el origen. eje 'c' o 'r'; dir +1 o −1; paso 0..3 (patas de la mula y del arriero).
function vehiculo(g, era, eje, dir, paso, vi) {
  const rng = mulberry(7), adelante = (eje === 'c' ? [0, .14] : [.14, 0]).map(x => x * dir);
  if (era === 'herradura') {
    const cuero = ['#7A5536', '#5E4129', '#8A6544'];
    caja(g, 0, 0, eje, .2, .07, 5, 2.5, cuero, rng);
    caja(g, adelante[0], adelante[1], eje, .06, .05, 3, 6, cuero, rng);
    for (const s of [-1, 1]) caja(g, eje === 'c' ? s * .055 : 0, eje === 'r' ? s * .055 : 0, eje, .1, .04, 4, 4, [FR.cal, shade(FR.cal, -.15), FR.ocreClaro], rng);
    g.save(); g.strokeStyle = '#4A3424'; g.lineWidth = .8; const pa = Math.sin(paso / 4 * Math.PI * 2) * 1.2;
    for (const dx of [-3, 3]) { g.beginPath(); g.moveTo(dx, -2.5); g.lineTo(dx + pa * (dx > 0 ? 1 : -1), 0); g.stroke(); }
    g.restore();
    const G = hornearGente(), m = G.marcos[`campesino_${vi}_1_${paso}`], E2 = G.escala, q = P(eje === 'c' ? .12 : 0, eje === 'r' ? .12 : 0);
    if (m) g.drawImage(G.canvas, m.x, m.y, m.w, m.h, q[0] - m.ax / E2 * .7, q[1] - m.ay / E2 * .7, m.w / E2 * .7, m.h / E2 * .7);
  } else if (era === 'empedrado') {
    // Chiva: bus de madera pintado de colores, con carga en el techo.
    const { B, up } = caja(g, 0, 0, eje, .36, .16, 9, 2, [FR.ocre, shade(FR.ocre, -.15), FR.rojo], rng);
    for (const [cara, sh] of [[B.izq, 0], [B.der, -.15]]) {
      for (const [v0, v1, col] of [[.15, .32, FR.rojo], [.32, .48, FR.azul], [.48, .6, FR.verde]]) pintar(g, [L(cara[0], cara[3], v0), L(cara[1], cara[2], v0), L(cara[1], cara[2], v1), L(cara[0], cara[3], v1)].map(up), shade(col, sh), rng, { n: 0, borde: false });
      for (let k = 0; k < 4; k++) { const u0 = .1 + k * .21; pintar(g, [L(L(cara[0], cara[1], u0), L(cara[3], cara[2], u0), .66), L(L(cara[0], cara[1], u0 + .14), L(cara[3], cara[2], u0 + .14), .66), L(L(cara[0], cara[1], u0 + .14), L(cara[3], cara[2], u0 + .14), .92), L(L(cara[0], cara[1], u0), L(cara[3], cara[2], u0), .92)].map(up), '#3A3532', rng, { n: 0, bw: .3 }); }
    }
    caja(g, 0, 0, eje, .22, .1, 2.5, 11, [FR.cal, shade(FR.cal, -.15), FR.ocreClaro], rng);
    ruedas(g, B, up, [.15, .85]);
  } else {
    // Camión: platón con carga y cabina azul adelante.
    const { B, up } = caja(g, -adelante[0] * .5, -adelante[1] * .5, eje, .26, .15, 6, 2, ['#8A7A5A', '#6E6048', '#9C8C6A'], rng);
    caja(g, -adelante[0] * .5, -adelante[1] * .5, eje, .22, .12, 4, 8, [FR.ocreClaro, shade(FR.ocreClaro, -.15), FR.ocre], rng);
    caja(g, adelante[0] * .9, adelante[1] * .9, eje, .1, .15, 8, 2, [FR.azul, shade(FR.azul, -.2), shade(FR.azul, .2)], rng);
    ruedas(g, B, up, [.2, .8]);
  }
}

// Hoja de vehículos: claves `${era}_${eje}_${+|-}_${paso}` (los carros tienen solo el paso 0).
let HOJA = null;
export function hornearVehiculos() {
  if (HOJA) return HOJA;
  const E = RES_HOJA, w = 44, h = 34, ax = 22, ay = 24, claves = [];
  for (const era of ['herradura', 'empedrado', 'carretera']) for (const eje of ['c', 'r']) for (const dir of [1, -1]) for (let p = 0; p < (era === 'herradura' ? 4 : 1); p++) claves.push([era, eje, dir, p]);
  const cols = 8, cv = lienzo(cols * w * E, Math.ceil(claves.length / cols) * h * E), g = cv.getContext('2d'), marcos = {};
  claves.forEach(([era, eje, dir, p], n) => {
    const x = (n % cols) * w * E, y = Math.floor(n / cols) * h * E;
    marcos[`${era}_${eje}_${dir > 0 ? '+' : '-'}_${p}`] = { x, y, w: w * E, h: h * E, ax: ax * E, ay: ay * E };
    g.save(); g.translate(x + ax * E, y + ay * E); g.scale(E, E); vehiculo(g, era, eje, dir, p, n % 3); g.restore();
  });
  return (HOJA = { canvas: cv, marcos, escala: E });
}

// Icono de la herramienta: un rombo de tierra con un cruce de calles del estilo de la época (y una X para quitar).
const ICONOS = {};
export function iconoCalle(era, quitar) {
  const k = era + (quitar ? '-x' : '');
  if (ICONOS[k]) return ICONOS[k];
  const c = lienzo(96, 80), g = c.getContext('2d'), R = mulberry(5), E = ESTILO_CALLE[era] || ESTILO_CALLE.herradura;
  pintar(g, [[48, 22], [86, 41], [48, 60], [10, 41]], mix(FR.tierraVerde, FR.ocreClaro, .35), R, { n: 2, bw: .6 });
  g.lineCap = 'round';
  for (const [w, col, al] of [[E.ancho * 1.3 + 3, E.borde, .5], [E.ancho * 1.3, E.color, 1]]) { g.globalAlpha = al; g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(29, 31.5); g.lineTo(67, 50.5); g.moveTo(67, 31.5); g.lineTo(29, 50.5); g.stroke(); }
  g.globalAlpha = 1;
  if (era === 'carretera') { g.strokeStyle = FR.ocre; g.lineWidth = 1; g.setLineDash([4, 4]); g.beginPath(); g.moveTo(29, 31.5); g.lineTo(67, 50.5); g.stroke(); g.setLineDash([]); }
  if (quitar) { g.strokeStyle = FR.rojo; g.lineWidth = 6; g.beginPath(); g.moveTo(34, 26); g.lineTo(62, 56); g.moveTo(62, 26); g.lineTo(34, 56); g.stroke(); }
  return (ICONOS[k] = urlDe(c));
}
