// Pintura del terreno en acuarela (tomada de la prueba de estilo aprobada), por sectores.
// Cada sector es un lienzo con un bloque de casillas; si algo cambia, solo se repinta su sector.
import { mulberry, clamp, shade, mix, saturar, poly, wash, blob, grano, lienzo } from './acuarela.js';
import { P, TW, TH, EL, alturaEn } from './iso.js';
import { yeso, FR } from './fresco.js';
import { C } from '../core/contenido.js';
import { pintarAguas, lodoOrilla } from './aguas.js';
import { asentarObras, sombrasObras } from './asiento.js';

export const LADO_SECTOR = 8;
const BASE = -2.2; // profundidad de los costados del diorama
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = t => t * t * (3 - 2 * t);

// Fase 8: colores de pigmento del fresco (tierra verde, ocres, azul egipcio, blanco de cal).
const GROUND = { agua: '#7AAAB6', galeria: '#8AA26C', arrozal: '#A9B97E', seco: '#D2B77E', potrero: '#B5B97C', ladera: '#93A56E', niebla: '#6A8360', paramo: '#C2B27A', roca: '#9C9184', nieve: '#F4EEE2' };
const DRYC = '#D4B27A';

// Fase 14: cada territorio tiñe un poco sus colores (pigmentos más ocres en el sur seco, más fríos en la montaña).
let PAL = null;
const suave = x => x * x * (3 - 2 * x);
const teñir = c => PAL ? mix(c, PAL.color, PAL.fuerza) : c;
function groundColor(t, dry, sub = 0) { return teñir(groundColor0(t, dry, sub)); }
function groundColor0(t, dry, sub = 0) {
  let c = GROUND[t.b];
  if (t.b === 'agua') return mix('#D2C092', DRYC, dry * .3);
  if (['galeria', 'arrozal', 'potrero', 'ladera', 'niebla'].includes(t.b)) c = mix(c, DRYC, dry * (t.b === 'niebla' ? .25 : .45));
  if (t.b === 'seco') c = mix(c, '#D9B56C', dry * .4);
  if (t.b !== 'nieve' && t.b !== 'roca' && t.h - sub > 8.4) c = mix(c, '#F4EEE2', clamp((t.h - sub - 8.4) / 1.4, 0, .7));
  return c;
}
// Mezcla suave entre bandas de altura.
function band(h, edges, cols) {
  for (let i = 0; i < edges.length; i++) {
    const e = edges[i];
    if (h < e - .35) return cols[i];
    if (h < e + .35) return mix(cols[i], cols[i + 1], smooth((h - (e - .35)) / .7));
  }
  return cols[cols.length - 1];
}
function colorAt(T, r, c, h, slope, dry) {
  const m = T.moistAt(r, c);
  const low = mix(mix('#D6BC84', '#B5B97C', smooth(clamp((m - .35) / .3, 0, 1))), '#8AA26C', smooth(clamp((m - .75) / .25, 0, 1)));
  const lowD = mix(low, '#D6B57A', dry * .45);
  let col = band(h, [2, 4.4, 6.1, 7.6, 9], [lowD, mix('#93A56E', DRYC, dry * .4), mix('#6A8360', DRYC, dry * .15), '#C2B27A', '#9C9184', '#F4EEE2']);
  if (slope > 1.6 && h > 2) col = mix(col, '#9C9184', clamp((slope - 1.6) / 1.2, 0, .8));
  return teñir(col);
}
const light = t => clamp(1 + .2 * t.sx - .17 * t.sy, .62, 1.3);

// Trazo del río en coordenadas del mundo (se usa para pintarlo y para su brillo animado).
export function caminoRio(T) {
  const pts = [], N = T.N;
  for (let k = -80; k <= 80; k++) {
    const s = k / 80 * 1.1, mid = T.riverMid(s), r = (mid - s * N) / 2, c = (mid + s * N) / 2;
    if (r < -1 || c < -1 || r > N + 1 || c > N + 1) continue;
    pts.push({ r, c, p: P(r, c, Math.max(0, alturaEn(T, r, c)) - .15) });
  }
  return pts;
}

// Geometría del río natural (fase visual, paso 3; pedido de Juan: «el río parece un canal»): por cada punto del
// cauce, el centro y las dos orillas en el mundo, con un ancho que cambia (remansos anchos y estrechos con
// raudales) y cada orilla con su propio ruido. La curva (k) dice hacia dónde dobla: la playa de arena sale por
// dentro de la curva y lo hondo queda por fuera. Se usa para pintarlo y para la corriente animada.
export function geoRio(T) {
  if (T._geo) return T._geo;
  const N = T.N, v = T.vary, L = [], base = [];
  for (let k = -360; k <= 360; k++) { const s = k / 360 * 1.1, mid = T.riverMid(s), r = (mid - s * N) / 2, c = (mid + s * N) / 2; if (r >= -1.5 && c >= -1.5 && r <= N + 1.5 && c <= N + 1.5) base.push({ r, c }); }
  const n = base.length;
  const nr = 1 / Math.SQRT2; // la orilla se aleja del cauce en la dirección (1, 1) de filas y columnas
  for (let i = 0; i < n; i++) {
    const { r, c } = base[i], s = (c - r) / T.N, h = Math.max(0, alturaEn(T, r, c)) - .15;
    const ancho = .8 + .42 * (v(s * 4 + 31, 7.3) - .5) + .2 * (v(s * 13 + 5, 1.9) - .5);
    const a = clamp(ancho + .2 * (v(s * 19 + 71, 3.1) - .5), .5, 1.15), b = clamp(ancho + .2 * (v(s * 17 + 17, 8.7) - .5), .5, 1.15);
    L.push({ r, c, h, s, a, b });
  }
  // Curvatura a partir del centro en pantalla (positiva: dobla hacia la orilla «b»).
  for (let i = 0; i < n; i++) {
    const p = L[Math.max(0, i - 12)], q = L[Math.min(n - 1, i + 12)], o = L[i];
    const mid = ((p.r + p.c) + (q.r + q.c)) / 2;
    o.k = clamp(((o.r + o.c) - mid) * 7, -1, 1);
  }
  const pt = (o, d, h = o.h) => P(o.r + d * nr, o.c + d * nr, h);
  return (T._geo = { L, pt, nr });
}

// Contorno de una franja del río entre las distancias da (lado a, negativo) y db (lado b) desde el centro.
function franja(geo, fa, fb, ha) {
  const { L, pt } = geo, ida = [], vuelta = [];
  for (const o of L) { ida.push(pt(o, -fa(o), ha ? ha(o, -fa(o)) : o.h)); vuelta.push(pt(o, fb(o), ha ? ha(o, fb(o)) : o.h)); }
  return ida.concat(vuelta.reverse());
}
const rellenar = (g, pts, col, al = 1) => { g.globalAlpha = al; g.fillStyle = col; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fill(); };

function pintarRio(g, T, zona, dry) {
  const geo = geoRio(T), { L, pt } = geo, N = T.N, sec = dry > .5, baja = sec ? .78 : 1; // en la sequía el río baja
  const tierra = (o, d) => alturaEn(T, o.r + d * geo.nr, o.c + d * geo.nr);
  g.save(); g.beginPath(); zona.forEach(z => { z.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); }); g.clip();
  const ruido = (o, k) => (T.vary(o.s * 30 + k, k * .37) - .5) * .7 + (T.vary(o.s * 110 + k, k * .21) - .5) * .5 + (T.vary(o.s * 330 + k, k * .53) - .5) * .25;
  const suaveR = (o, k) => (T.vary(o.s * 22 + k, k * .37) - .5) * .8 + (T.vary(o.s * 60 + k, k * .21) - .5) * .4;
  // 1. Orillas: tierra húmeda y arena que bajan al agua, de ancho irregular.
  rellenar(g, franja(geo, o => o.a * baja + .36 + .4 * ruido(o, 11), o => o.b * baja + .36 + .4 * ruido(o, 23), tierra), mix('#B7A47C', '#CDB98E', dry), .4);
  rellenar(g, franja(geo, o => o.a * baja + .16 + .22 * ruido(o, 37), o => o.b * baja + .16 + .22 * ruido(o, 41), tierra), mix('#8C7A58', '#B09C74', dry), .55);
  // 2. Playas de arena y cascajo por dentro de las curvas (más grandes en la sequía).
  const playa = (o, lado) => { const k = lado > 0 ? o.k : -o.k; return k > .18 ? (k - .18) * (sec ? 1.1 : .75) : 0; };
  rellenar(g, franja(geo, o => o.a * baja + .07 + .12 * ruido(o, 43) - playa(o, -1) * .3, o => o.b * baja + .07 + .12 * ruido(o, 47) - playa(o, 1) * .3), '#7A6A4C', .55); // tierra mojada
  // arena solo a ratos (y en las playas), no en una franja pareja
  const arena = (o, lado, k) => Math.max(0, .1 * (ruido(o, k) + .15) * 2.2) + playa(o, lado) * .5;
  rellenar(g, franja(geo, o => o.a * baja + arena(o, -1, 89) - playa(o, -1) * .6, o => o.b * baja + arena(o, 1, 97) - playa(o, 1) * .6), mix('#D8C79C', '#E2D2A8', dry), .85);
  // 3. El agua: la orilla baja con sedimento; el cuerpo y los pozos hondos son manchas de ancho propio que se
  // corren hacia el lado de afuera de cada curva (no franjas paralelas, que hacían ver un canal).
  const ag = sec ? ['#97B2A2', '#6A98A2', '#4A7E90'] : ['#92B8AE', '#5E98AA', '#3C7089'];
  const borde = o => [o.a * baja + .13 * ruido(o, 71) - playa(o, -1) * .6, o.b * baja + .13 * ruido(o, 73) - playa(o, 1) * .6];
  const medio = o => clamp(.62 + .5 * suaveR(o, 101), .25, .9), hondo = o => clamp(suaveR(o, 131) * 1.6 + .25, 0, .6);
  rellenar(g, franja(geo, o => borde(o)[0], o => borde(o)[1]), ag[0], .97);
  rellenar(g, franja(geo, o => borde(o)[0] * medio(o) - o.k * .15, o => borde(o)[1] * medio(o) + o.k * .15), ag[1], .9);
  rellenar(g, franja(geo, o => (o.a + o.b) * .5 * hondo(o) - o.k * .25, o => (o.a + o.b) * .5 * hondo(o) * (.7 + suaveR(o, 137)) + o.k * .25), ag[2], .8);
  // 4. La orilla de atrás (lado a, hacia la luz) proyecta su sombra sobre el agua; reflejo del cielo en el medio.
  rellenar(g, franja(geo, o => borde(o)[0], o => -borde(o)[0] + .14 + .06 * ruido(o, 53)), '#2E4C52', .22);
  g.globalAlpha = .22; g.strokeStyle = '#E4F0EE'; g.lineCap = 'round';
  for (let i = 2; i < L.length - 9; i += 9) {
    const o = L[i], f = ruido(o, 61), d = f * (o.a + o.b) * .5, A = pt(o, d), B = pt(L[i + 6], d + .05);
    g.lineWidth = .8 + (ruido(o, 67) + .5) * 1.4; g.beginPath(); g.moveTo(A[0], A[1]); g.lineTo(B[0], B[1]); g.stroke();
  }
  // 5. Piedras con espuma donde el río se estrecha (raudales), y alguna en la orilla.
  for (let i = 1; i < L.length - 1; i++) {
    const o = L[i], R = mulberry(Math.round(o.s * 9973) + T.seed * 7);
    const estrecho = (o.a + o.b) < 1.4;
    if (R() > (estrecho ? .14 : .03)) continue;
    const lado = R() < .5 ? -1 : 1, d = lado * (lado < 0 ? o.a : o.b) * baja * (.3 + R() * .65), [x, y] = pt(o, d), w = 1.6 + R() * 2.6;
    // espuma río abajo
    g.globalAlpha = .55; g.fillStyle = '#F2F6F2';
    for (let q = 0; q < 5; q++) { const fx = x + 2 + q * 1.8 + R() * 1.5, fy = y + q * .7 + (R() - .5) * 1.4; g.beginPath(); g.moveTo(fx - 1.6, fy); g.quadraticCurveTo(fx, fy - .9, fx + 1.6, fy); g.quadraticCurveTo(fx, fy + .5, fx - 1.6, fy); g.fill(); }
    const k = 6, Lp = [];
    for (let j = 0; j < k; j++) { const a = j / k * 6.283 + (R() - .5) * .5, f = .7 + R() * .4, sy = Math.sin(a); Lp.push([x + Math.cos(a) * w * f, sy > 0 ? y + sy * w * .22 : y + sy * w * .7 * f]); }
    rellenar(g, Lp, '#6E6A5E', 1);
    rellenar(g, Lp.map(([a, b]) => [x + (a - x) * .7 - w * .18, y + (b - y) * .7 - w * .18]), '#A29C8C', 1);
    g.globalAlpha = .7; g.strokeStyle = '#EEF4F0'; g.lineWidth = .7; g.beginPath(); g.ellipse(x, y + w * .12, w * 1.15, w * .3, 0, .2, 2.9); g.stroke(); // anillo de agua
  }
  // 6. Cascajo en las playas y juncos en la orilla.
  for (let i = 1; i < L.length - 1; i += 1) {
    const o = L[i], R = mulberry(Math.round(o.s * 7919) + T.seed * 13);
    for (const lado of [-1, 1]) {
      const pl = playa(o, lado), bd = (lado < 0 ? o.a : o.b) * baja;
      if (pl > .05 && R() < .35) for (let q = 0; q < 3; q++) { const [x, y] = pt(o, lado * (bd - pl * .5 * R()), o.h); g.globalAlpha = .8; g.fillStyle = R() < .5 ? '#A39886' : '#C5B79A'; g.fillRect(x + (R() - .5) * 4, y + (R() - .5) * 2, 1.1, .7); }
      if (R() < .12 && pl < .05) {
        const [x, y] = pt(o, lado * (bd + .08 + R() * .1), tierra(o, lado * bd)), m = 4 + Math.floor(R() * 4);
        g.globalAlpha = 1; g.fillStyle = R() < .5 ? '#5C7A38' : '#6E8C40'; g.beginPath();
        for (let q = 0; q < m; q++) { const bx = x + (R() - .5) * 4, h = 3 + R() * 4, ln = (R() - .5) * 1.6; g.moveTo(bx - .45, y); g.lineTo(bx + ln, y - h); g.lineTo(bx + .45, y); g.closePath(); }
        g.fill();
      }
    }
  }
  g.restore(); g.globalAlpha = 1;
}

// Caja del sector en coordenadas del mundo.
export function cajaSector(T, sr, sc) {
  const N = T.N, L = LADO_SECTOR, r0 = sr * L, c0 = sc * L, r1 = Math.min(N, r0 + L), c1 = Math.min(N, c0 + L);
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  const ver = (r, c, h) => { const p = P(r, c, h); x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); };
  for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) ver(r, c, T.hv(r, c));
  if (r1 === N) for (let c = c0; c <= c1; c++) ver(N, c, BASE);
  if (c1 === N) for (let r = r0; r <= r1; r++) ver(r, N, BASE);
  const m = 6; // margen para los bordes irregulares de la acuarela
  return { r0, c0, r1, c1, x: Math.floor(x0 - m), y: Math.floor(y0 - m), w: Math.ceil(x1 - x0 + 2 * m), h: Math.ceil(y1 - y0 + 2 * m) };
}

// Color y luz del terreno en una imagen pequeña del sector (S muestras por casilla, más una casilla de margen).
// La luz viene siempre del mismo punto, arriba a la izquierda (la misma de las sombras de árboles y animales): las
// laderas que miran hacia allá se aclaran y las otras se oscurecen, con un paso suave entre una y otra.
// Pulido visual (pedido de Juan: «el suelo no parece terreno»): además del relieve de la partida, la luz lee un
// relieve fino que solo existe en la pintura (lomitas, ondulaciones y, en la montaña, filos y cañadas). Las
// hondonadas guardan humedad (más oscuras y verdes) y los lomos se secan; en las pendientes fuertes asoma la tierra
// rojiza del Tolima. El ruido va girado en cada escala para que nada siga la cuadrícula de las casillas.
const GIROS = [[.88, .48], [.36, .93], [-.6, .8], [.97, -.24]];
function relieveFino(T, r, c, h) {
  const n = T.vary, g = (k, x, y, esc, o) => { const [co, si] = GIROS[k]; return n((x * co - y * si) / esc + o, (x * si + y * co) / esc + o * .7); };
  const d = T.riverD(r, c), cerca = clamp((d - .4) / 1.2, .55, 1); // la ribera también tiene lomitas (antes casi lisa: parecía el muro de un canal)
  const monte = smooth(clamp((h - 3.2) / 3.2, 0, 1)), amp = (.26 + .16 * smooth(clamp((h - 1.2) / 3, 0, 1))) * cerca;
  let m = (g(0, c, r, 2.2, 300) - .5) * .75 + (g(1, c, r, 1.05, 410) - .5) * .2 + (g(2, c, r, .5, 520) - .5) * .05;
  m *= amp;
  if (monte > 0) m += monte * (g(3, c, r, 1.6, 630) - .5) * .35; // la montaña, con lomas más anchas
  return m;
}
// Tipo de suelo «de pintura» en un punto: la misma regla de la partida (altura, distancia al río, pendiente y
// humedad), pero con los valores continuos del punto y un poco de ruido. Así el paso de un suelo a otro sigue las
// curvas del terreno, con borde irregular, y no la escalera de las casillas.
const ORILLA = { b: 'galeria', d: 0, slope: 0 };
function tipoEn(T, r, c) {
  const N = T.N, rr = clamp(r, 0, N), cc = clamp(c, 0, N), e = .2;
  const ruido = (T.vary(c / .9 + 211, r / .9 + 97) - .5) * .5 + (T.vary(c / .32 + 7, r / .32 + 3) - .5) * .22;
  const h = T.hf(rr, cc) + ruido, d = T.riverD(rr, cc) + ruido * 1.2;
  const slope = Math.hypot(T.hf(rr, clamp(cc + e, 0, N)) - T.hf(rr, clamp(cc - e, 0, N)), T.hf(clamp(rr + e, 0, N), cc) - T.hf(clamp(rr - e, 0, N), cc)) / (2 * e);
  const moist = T.moistAt(rr, cc) + ruido * .25;
  let b;
  if (d < 1.3 && h < 2.2) return ORILLA; // el agua se pinta encima; alrededor del cauce, orilla verde
  else if (h > 9) b = 'nieve';
  else if (h > 7.6 || slope > 2.4) b = 'roca';
  else if (h > 6.1) b = 'paramo';
  else if (h > 4.4) b = 'niebla';
  else if (h > 2) b = 'ladera';
  else if (d < 1.9) b = 'galeria';
  else if (d < 6 && moist > .45 && slope < .45) b = 'arrozal';
  else if (moist < .5) b = 'seco';
  else b = 'potrero';
  return { b, d, slope };
}
function campoDeColor(T, k, dry, sub, S = 8) {
  const N = T.N, r0 = k.r0 - 1, c0 = k.c0 - 1, filas = (k.r1 - k.r0 + 2) * S, cols = (k.c1 - k.c0 + 2) * S;
  const cv = lienzo(cols, filas), g = cv.getContext('2d'), im = g.createImageData(cols, filas), d = im.data;
  // Alturas de una sola vez (con un borde de dos muestras): la del juego para el color y la fina para la luz.
  const B = 2, W = cols + 2 * B, F = filas + 2 * B, alt = new Float32Array(W * F), base = new Float32Array(W * F);
  for (let y = -B; y < filas + B; y++) for (let x = -B; x < cols + B; x++) {
    const r = clamp(r0 + (y + .5) / S, 0, N), c = clamp(c0 + (x + .5) / S, 0, N), h = T.hf(r, c), j = (y + B) * W + x + B;
    base[j] = h; alt[j] = h + relieveFino(T, r, c, h);
  }
  const tono = (v, f) => f < 0 ? v * (1 + f) : v + (255 - v) * f; // como shade(), pero con números
  const pasto = teñir(mix('#C9B27A', '#D6BC80', dry)), lodo = mix('#8A6E4E', '#B49A72', dry), rojiza = teñir(mix('#A9774E', '#B98A5C', dry * .5));
  const verdeA = teñir(mix('#9DAE62', '#BDB676', dry * .6)), verdeB = teñir(mix('#7F9C6A', '#A9AA78', dry * .6)), hondo = teñir(mix('#6E8C4C', '#9A9A62', dry * .5));
  for (let y = 0; y < filas; y++) for (let x = 0; x < cols; x++) {
    const r = r0 + (y + .5) / S, c = c0 + (x + .5) / S, i = (y + B) * W + x + B, h = base[i];
    const hx = (alt[i + 1] - alt[i - 1]) * S / 2, hy = (alt[i + W] - alt[i - W]) * S / 2;
    const Lq = clamp(1 + .24 * hx - .13 * hy, .58, 1.32), luz = Lq >= 1 ? (Lq - 1) * .8 : (Lq - 1) * .9;
    // Curvatura (a dos muestras): positiva en hondonadas, negativa en lomos.
    const curv = (alt[i + 2] + alt[i - 2] + alt[i + 2 * W] + alt[i - 2 * W] - 4 * alt[i]) * S * S / 4;
    const slope = Math.hypot((base[i + 1] - base[i - 1]) * S / 2, (base[i + W] - base[i - W]) * S / 2), pend = Math.hypot(hx, hy);
    let cc = colorAt(T, clamp(r, 0, N), clamp(c, 0, N), h - sub, slope, dry);
    const vr = (T.vary(c / 4, r / 4) - .5) * .1, bruma = (1 - (r + c) / (2 * N)) * .1, o = (y * cols + x) * 4;
    const t = tipoEn(T, r, c); // con borde irregular entre tipos de suelo (no siguen la cuadrícula)
    let sombra = 0;
    if (t && t.b !== 'agua' && t.b !== 'nieve') {
      const verde = HIERBA.has(t.b) && t.b !== 'paramo';
      if (verde || t.b === 'seco') {
        // Luces y sombras del pasto: ondas suaves de claro y oscuro a dos escalas, sin figuras.
        const ls = (T.vary((c * .7 - r * .7) / 1.3 + 801, (c * .7 + r * .7) / 1.3 + 17) - .5) * .2 + (T.vary((c * .7 - r * .7) / .45 + 501, (c * .7 + r * .7) / .45 + 77) - .5) * .24 + (T.vary(c / .22 + 613, r / .22 + 41) - .5) * .1;
        sombra -= ls;
      }
      if (verde) {
        // Potreros de varios verdes (unos más amarillos, otros más azulados), en manchones grandes e irregulares.
        const nv = .7 * T.vary((c * .88 - r * .48) / 2.6 + 200, (c * .48 + r * .88) / 2.6 + 150) + .3 * T.vary(c / 1.1 + 71, r / 1.1 + 9);
        cc = mix(cc, nv > .5 ? verdeA : verdeB, Math.min(.38, Math.abs(nv - .5) * 1.3) * (t.b === 'niebla' ? .4 : 1));
      }
      if (HIERBA.has(t.b) && t.b !== 'niebla') {
        const n = .65 * T.vary(c / 3.1 + 40, r / 3.1 + 40) + .35 * T.vary(c / 1.05 + 13, r / 1.05 + 5);
        const f = suave(clamp((n - .5 + dry * .2) / .22, 0, 1));
        if (f > 0) cc = mix(cc, pasto, f * .36);
      }
      if (t.d < 2.6 && t.b !== 'arrozal') {
        const n = .65 * T.vary(c / 2.6 + 90, r / 2.6 + 12) + .35 * T.vary(c / .9 + 31, r / .9 + 77);
        const f = suave(clamp((n - .52) / .2, 0, 1)) * clamp((2.6 - t.d) / 1.2, 0, 1);
        if (f > 0) cc = mix(cc, lodo, f * .32);
      }
      // Hondonadas: guardan agua, más verdes y en sombra; lomos: secos y con más luz.
      if (curv > 0) { const f = clamp(curv * .06, 0, 1); if (verde || t.b === 'seco') cc = mix(cc, hondo, f * .2); sombra += f * .05; }
      else { const f = clamp(-curv * .06, 0, 1); if (verde) cc = mix(cc, pasto, f * .12); sombra -= f * .03; }
      // Pendiente fuerte: la tierra rojiza asoma en cárcavas (menos en el bosque de niebla y nada en la roca).
      if (pend > 1 && h > .8 && t.b !== 'roca' && t.b !== 'paramo') {
        const gate = T.vary((c * .36 - r * .93) / .9 + 333, (c * .93 + r * .36) / .9 + 77);
        const f = smooth(clamp((pend - 1) / 1.1, 0, 1)) * smooth(clamp((gate - .42) / .25, 0, 1)) * (t.b === 'niebla' ? .45 : 1);
        if (f > 0) cc = mix(cc, rojiza, f * .3);
      }
    }
    // Colores vivos y cálidos (referencia de Juan): potreros verde hoja, bosque de niebla verde hondo, lo seco dorado.
    if (t && (HIERBA.has(t.b) || t.b === 'arrozal') && t.b !== 'paramo') {
      const meta = t.b === 'niebla' ? '#4F7F38' : t.b === 'seco' ? mix('#C3B45C', '#D2B46A', dry) : t.b === 'galeria' ? '#78A646' : mix('#8DB24A', '#BDB462', dry * .8);
      cc = saturar(mix(cc, meta, .42), .28 - dry * .15);
    }
    const grano = (((x * 73856093) ^ (y * 19349663)) % 997 / 997 - .5) * .025; // grano fino de pincel
    for (let j = 0; j < 3; j++) { const v = tono(tono(parseInt(cc.slice(1 + j * 2, 3 + j * 2), 16), vr + grano - sombra), luz); d[o + j] = v + ([230, 226, 214][j] - v) * bruma; }
    d[o + 3] = 255;
  }
  g.putImageData(im, 0, 0);
  return { canvas: cv, r0, c0, S };
}

// Pinta un sector. opciones: { dry (0 lluvias a 1 sequía), escala (resolución) }.
export function pintarSector(T, sr, sc, opciones = {}, lienzoPrevio = null) {
  PAL = T.terr && T.terr.paleta || null;
  const dry = opciones.dry || 0, esc = opciones.escala || 1.5, N = T.N, sub = opciones.subida || 0; // fase 10: los pisos térmicos suben
  const k = cajaSector(T, sr, sc);
  const cv = lienzoPrevio && lienzoPrevio.width === Math.ceil(k.w * esc) ? lienzoPrevio : lienzo(k.w * esc, k.h * esc);
  const g = cv.getContext('2d');
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height);
  g.setTransform(esc, 0, 0, esc, -k.x * esc, -k.y * esc);
  const rngB = mulberry(T.seed * 3 + sr * 31 + sc);
  const zona = [];

  // Costados del diorama, solo en los sectores del borde delantero. Pulido visual: un solo corte de tierra por lado
  // (antes un trozo por casilla, con rayas entre trozos), con capa de suelo oscuro, estratos ondulados de arcilla y
  // piedra, piedras incrustadas, raíces y el pasto que cuelga del borde.
  if (k.r1 === N) zona.push(pintarCostado(g, T, k.c0, k.c1, c => [N, c], '#9E805C', dry));
  if (k.c1 === N) zona.push(pintarCostado(g, T, k.r0, k.r1, r => [r, N], '#7D6347', dry));

  // Casillas del sector, de atrás hacia adelante, con subdivisiones para que la luz sea continua.
  const tiles = [];
  for (let r = k.r0; r < k.r1; r++) for (let c = k.c0; c < k.c1; c++) tiles.push(T.tiles[r * N + c]);
  tiles.sort((a, b) => (a.r + a.c) - (b.r + b.c));
  const campo = campoDeColor(T, k, dry, sub), rios = [];
  for (const t of tiles) {
    const rng = mulberry(t.r * 977 + t.c * 131 + T.seed);
    const q = [P(t.r, t.c, t.h00), P(t.r, t.c + 1, t.h01), P(t.r + 1, t.c + 1, t.h11), P(t.r + 1, t.c, t.h10)];
    const qc = [(q[0][0] + q[2][0]) / 2, (q[0][1] + q[2][1]) / 2];
    const qx = q.map(p => [qc[0] + (p[0] - qc[0]) * 1.035, qc[1] + (p[1] - qc[1]) * 1.035]);
    zona.push(qx);
    let col = groundColor(t, dry, sub);
    col = shade(col, (T.vary(t.c / 4, t.r / 4) - .5) * .1);
    const L2 = light(t);
    col = L2 >= 1 ? shade(col, (L2 - 1) * .8) : shade(col, (L2 - 1) * .9);
    // Relieve suave (pedido de Juan, 6 de octubre: el suelo se veía pixelado): el color y la luz se calculan en una
    // imagen pequeña de todo el sector y cada casilla la pinta estirada y suavizada sobre su rombo, sin cuadritos.
    g.save(); poly(g, qx); g.clip(); g.fillStyle = col; g.fill(); g.restore();
    // Dos triángulos por casilla, cada uno con su propia transformación exacta en sus tres esquinas: así la
    // imagen de color y luz encaja sin rayas entre casillas vecinas (con una sola transformación por casilla la
    // cuarta esquina quedaba corrida y el relieve fino mostraba los bordes de la cuadrícula).
    const ox = (t.c - campo.c0) * campo.S, oy = (t.r - campo.r0) * campo.S, S = campo.S;
    const p00 = P(t.r, t.c, t.h00), p01 = P(t.r, t.c + 1, t.h01), p10 = P(t.r + 1, t.c, t.h10), p11 = P(t.r + 1, t.c + 1, t.h11);
    const crecer = (L, f) => { const cx = (L[0][0] + L[1][0] + L[2][0]) / 3, cy = (L[0][1] + L[1][1] + L[2][1]) / 3; return L.map(p => [cx + (p[0] - cx) * f, cy + (p[1] - cy) * f]); };
    for (const [A, Bv, Cv, u0, v0, su, sv] of [[p00, p01, p10, ox, oy, 1, 1], [p11, p10, p01, ox + S, oy + S, -1, -1]]) {
      // A es la esquina de origen; Bv avanza en columnas (u) y Cv en filas (v), con el signo de cada triángulo.
      g.save(); poly(g, crecer([A, Bv, Cv], 1.06)); g.clip();
      const ta = (Bv[0] - A[0]) / S * su, tb = (Bv[1] - A[1]) / S * su, tc = (Cv[0] - A[0]) / S * sv, td = (Cv[1] - A[1]) / S * sv;
      g.transform(ta, tb, tc, td, A[0] - ta * u0 - tc * v0, A[1] - tb * u0 - td * v0);
      g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
      g.drawImage(campo.canvas, ox - 1.5, oy - 1.5, S + 3, S + 3, ox - 1.5, oy - 1.5, S + 3, S + 3);
      g.restore();
    }
    if (t.b === 'agua') rios.push(qx); // el río se pinta al final: nada de la orilla se le monta encima
    // Suelo natural (renovación colonial): manchas agrupadas de pasto seco, lodo y piedra, y pinceladas finas de pasto.
    const cx = qc[0], cy = qc[1];
    if (t.b !== 'nieve') sueloNatural(g, T, t, col, dry, rng); // también en las casillas de río: su orilla lleva pasto
    if (t.b === 'roca' || (t.b === 'paramo' && rng() < .3)) peñas(g, cx, cy, rng, t.b === 'roca' ? 1 + Math.floor(rng() * 2) : 1); // afloramientos de roca
    g.globalAlpha = 1;
    if (t.b === 'paramo' && rng() < .08) charco(g, cx, cy + 1, 7, rng, '#7FA9B8'); // lagunas de páramo
  }

  // Pie de la vegetación (pedido de Juan: que el suelo se enlace con los árboles): pasto alto, helechos, hojarasca
  // y sombra al pie de cada árbol, palma, guadua o frailejón de las casillas libres.
  // Agua quieta y quebradas (recortadas a las casillas del sector, para que no se pinten dos veces en las uniones).
  g.save(); g.beginPath(); zona.forEach(z => { z.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); }); g.clip();
  pintarAguas(g, T, k, opciones.mapa, dry);
  g.restore();
  if (opciones.plantas && opciones.mapa) {
    const pies = [];
    for (const t of tiles) {
      const x = opciones.mapa[t.r * N + t.c];
      if (!x || x.b || x.dr > 0 || x.q > 0 || (t.b === 'niebla' && x.t !== 'bosque')) continue;
      for (const o of (opciones.plantasDe ? opciones.plantasDe(t.r * N + t.c) : opciones.plantas[t.r * N + t.c]) || []) if (PIE[o.k]) pies.push(o);
    }
    pies.sort((a, b) => (a.r + a.c) - (b.r + b.c)).forEach(o => pintarPie(g, T, o, dry));
  }
  if (rios.length || tiles.some(t => t.d < 2.6)) pintarRio(g, T, zona, dry); // el río entero de una vez: orilla curva, sin escalones de casilla

  // (Las curvas de nivel se quitaron en el pulido visual: el relieve ya se lee con la luz y se veían como rayas.)

  const recortar = () => { g.beginPath(); zona.forEach(z => { z.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); }); g.clip(); };

  // Obras en el suelo: explanadas, cultivos, cafetales, parques, minas, caminos y puentes.
  if (opciones.mapa) {
    g.save(); recortar();
    pintarSuelo(g, T, opciones.mapa, k, dry);
    pintarObras(g, T, opciones.mapa, k, dry, !!opciones.calles, opciones.anio, opciones.etapa || 0);
    if (opciones.calles) { pintarVeredas(g, T, opciones.mapa, opciones.calles, k); pintarCalles(g, T, opciones.calles, k); }
    sombrasObras(g, opciones.sombras, opciones.fuenteSombras, k, esc); // la sombra de cada edificio, con el sol de los árboles
    g.restore();
  }

  // Grano del papel, solo sobre lo pintado y alineado con el mundo para que no se noten las uniones.
  g.save();
  recortar();
  g.globalCompositeOperation = 'multiply'; g.globalAlpha = .2; // grano suave (antes .32)
  g.fillStyle = g.createPattern(yeso(), 'repeat'); // fase 8: textura de muro del fresco
  g.fillRect(k.x, k.y, k.w, k.h);
  g.restore();
  return { canvas: cv, x: k.x, y: k.y, w: k.w, h: k.h, escala: esc };
}

// Corte de tierra de un costado del diorama entre a y b (posición a lo largo del borde); rc(u) da [fila, columna].
function pintarCostado(g, T, a, b, rc, col, dry) {
  const pt = (r, c, h) => P(r, c, h), tramo = (u0, u1) => { const L = []; for (let u = u0; u < u1 - 1e-6; u += .25) L.push(u); L.push(u1); return L; };
  const en = u => { const [r, c] = rc(clamp(u, 0, T.N)); return [r, c, T.hf(r, c)]; };
  // Fondo opaco un poco más ancho (tapa la unión con el sector vecino); las capas, exactamente en el tramo.
  const ancho = tramo(a - .06, b + .06).map(en), fondo = [...ancho.map(([r, c, h]) => pt(r, c, h)), ...ancho.map(([r, c]) => pt(r, c, BASE)).reverse()];
  g.globalAlpha = 1; g.fillStyle = col; g.beginPath(); fondo.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fill();
  const us = tramo(a - .06, b + .06), arriba = us.map(en); // todo con la misma anchura: el vecino pinta encima lo mismo y no queda raya
  const sup = arriba.map(([r, c, h]) => pt(r, c, h)), inf = arriba.map(([r, c]) => pt(r, c, BASE));
  const zona = [...sup, ...inf.slice().reverse()];
  const zonaGrano = zona;
  const R = mulberry(Math.round(a * 13 + b * 7) + T.seed);
  g.save(); g.beginPath(); zona.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.clip();
  const y1 = Math.max(...inf.map(p => p[1]));
  // Franja a una profundidad (0 arriba, 1 abajo) que ondula con el ruido del mundo.
  const linea = (f, amp, o) => arriba.map(([r, c, h], j) => { const w = (T.vary(us[j] / 1.3 + o, o) - .5) * amp; return pt(r, c, h * (1 - f) + BASE * f + w - f * h * .5); });
  const banda = (f1, f2, color, al, o) => { const A = linea(f1, .35, o), Bq = linea(f2, .35, o + 9).reverse(); g.globalAlpha = al; g.fillStyle = color; g.beginPath(); [...A, ...Bq].forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fill(); };
  banda(.5, 1.05, shade(col, -.3), .35, 51);                         // más oscura abajo
  banda(.78, 1.05, shade(col, -.4), .3, 57);
  banda(.42, .62, shade(mix(col, '#B5764A', .35), .05), .55, 11);   // arcilla rojiza
  banda(.7, .86, mix(col, '#8F8A80', .45), .5, 23);                  // capa de piedra
  // Capa de suelo oscuro bajo el pasto.
  const capa = linea(.16, .18, 37);
  g.globalAlpha = .5; g.fillStyle = shade(col, -.35); g.beginPath(); [...sup, ...capa.slice().reverse()].forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fill();
  // Piedras incrustadas en las capas de abajo.
  for (let j = 0; j < arriba.length * .9; j++) {
    const k = Math.floor(R() * arriba.length), [r, c, h] = arriba[k], f = .3 + R() * .62, p = pt(r, c, h * (1 - f) + BASE * f - f * h * .5), w = 1.2 + R() * 2.6;
    g.globalAlpha = .5; g.fillStyle = shade(col, -.4); g.beginPath(); g.ellipse(p[0] + .5, p[1] + .6, w, w * .6, 0, 0, 7); g.fill();
    g.globalAlpha = .9; g.fillStyle = mix('#A69C8C', col, R() * .5); g.beginPath(); g.ellipse(p[0], p[1], w, w * .58, 0, 0, 7); g.fill();
    g.globalAlpha = .55; g.fillStyle = '#D8D0C2'; g.beginPath(); g.ellipse(p[0] - w * .3, p[1] - w * .22, w * .4, w * .18, 0, 0, 7); g.fill();
  }
  // Raíces que bajan del pasto.
  g.strokeStyle = shade(col, -.5); g.lineWidth = .6; g.globalAlpha = .45; g.beginPath();
  for (let j = 0; j < arriba.length * .6; j++) { const k = Math.floor(R() * arriba.length), [r, c, h] = arriba[k]; let [x, y] = pt(r, c, h); y += 1; g.moveTo(x, y); for (let s2 = 0; s2 < 4; s2++) { x += (R() - .5) * 2.2; y += 1.2 + R() * 1.6; g.lineTo(x, y); } }
  g.stroke();
  // Sombra suave al pie.
  const gp = g.createLinearGradient(0, y1 - 10, 0, y1); gp.addColorStop(0, 'rgba(40,28,18,0)'); gp.addColorStop(1, 'rgba(40,28,18,.25)');
  g.globalAlpha = 1; g.fillStyle = gp; g.fillRect(-1e4, y1 - 10, 2e4, 12);
  g.restore();
  // Borde de arriba: pasto que cuelga sobre el corte (fuera del recorte para que sobresalga un poco).
  g.lineCap = 'round';
  for (const [tono, al, L] of [[mix('#5E7A3E', '#9C8650', dry * .7), .7, 3.2], [mix('#93A85E', '#C9B27A', dry * .7), .6, 2.2]]) {
    g.globalAlpha = al; g.strokeStyle = tono; g.lineWidth = .7; g.beginPath();
    for (let j = 0; j < sup.length - 1; j++) for (let q = 0; q < 5; q++) { const f = R(), x = lerp(sup[j][0], sup[j + 1][0], f), y = lerp(sup[j][1], sup[j + 1][1], f); g.moveTo(x, y - .8); g.lineTo(x + (R() - .5) * 1.6, y + .5 + R() * L); }
    g.stroke();
  }
  g.globalAlpha = 1;
  return zonaGrano;
}

// Afloramiento de roca: bloques angulosos con la cara de la izquierda iluminada, la de la derecha en sombra, una
// grieta y su sombra en el suelo (antes eran rayitas en V que parecían pájaros).
function peñas(g, cx, cy, rng, n) {
  // Contorno irregular y redondeado (puntos a distinta distancia del centro, unidos con curvas).
  // Contorno facetado: cantos rectos de largo distinto, base plana y más ancha que alta (piedra partida, no bola).
  const forma = (x, y, w, h, k) => { const L = []; for (let i = 0; i < k; i++) { const a = i / k * 6.283 + (rng() - .5) * .5, f = .7 + rng() * .4, sy = Math.sin(a); L.push([x + Math.cos(a) * w * f, sy > 0 ? y + sy * h * .25 : y + sy * h * f * 1.25]); } return L; };
  const curva = L => { g.beginPath(); L.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); };
  for (let j = 0; j < n; j++) {
    const x = cx + (rng() - .5) * 26, y = cy + (rng() - .5) * 9, w = 4 + rng() * 5, h = w * (.5 + rng() * .35);
    g.globalAlpha = .3; g.fillStyle = '#2E281E'; g.beginPath(); g.ellipse(x + w * .3, y + h * .35, w * 1.15, h * .5, 0, 0, 7); g.fill();
    g.globalAlpha = 1; g.fillStyle = '#7D766A'; curva(forma(x, y, w, h, 7)); g.fill();                                     // la peña, en sombra
    g.fillStyle = '#A9A294'; curva(forma(x - w * .18, y - h * .22, w * .78, h * .72, 6)); g.fill();                     // la parte que recibe luz
    g.fillStyle = '#D3CDBF'; curva(forma(x - w * .38, y - h * .45, w * .34, h * .28, 5)); g.fill();                     // brillo arriba a la izquierda
    g.strokeStyle = '#5A5448'; g.lineWidth = .5; g.globalAlpha = .6; g.beginPath(); g.moveTo(x + w * .15, y - h * .55); g.quadraticCurveTo(x + w * .3, y - h * .1, x + w * .05, y + h * .3); g.stroke(); // grieta
    if (rng() < .55) { g.globalAlpha = .85; g.fillStyle = '#7E9A52'; g.beginPath(); g.ellipse(x - w * .6, y + h * .25, w * .35, h * .18, 0, 0, 7); g.fill(); } // musgo al pie
  }
  g.globalAlpha = 1;
}
// Charco o laguna de borde irregular (cantos cortos, más ancho que alto): orilla de lodo oscuro, agua y un reflejo
// del cielo en la parte de atrás, y unos juncos en punta.
function charco(g, x, y, w, rng, agua) {
  // Paso 3 de la fase visual: borde curvo y mordido, lodo mojado alrededor, agua más honda al centro y el reflejo
  // del cielo hacia atrás (antes era una placa plana de un solo color).
  const L = [], k = 14, f0 = rng() * 6.3;
  for (let i = 0; i < k; i++) { const a = i / k * 6.283, f = .72 + .22 * Math.sin(a * 2 + f0) + rng() * .2; L.push([Math.cos(a) * w * f, Math.sin(a) * w * .42 * f]); }
  const trazo = (esc, dx = 0, dy = 0) => { g.beginPath(); for (let i = 0; i <= k; i++) { const p = L[i % k], q = L[(i + 1) % k], m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]; const X = (u, v) => [x + dx + u * esc, y + dy + v * esc]; i ? g.quadraticCurveTo(...X(p[0], p[1]), ...X(m[0], m[1])) : g.moveTo(...X(m[0], m[1])); } g.closePath(); };
  g.globalAlpha = .45; g.fillStyle = '#6E5A3E'; trazo(1.28, .3, .3); g.fill();   // lodo mojado
  g.globalAlpha = .9; g.fillStyle = shade(agua, -.12); trazo(1, 0, 0); g.fill();  // agua
  g.globalAlpha = .7; g.fillStyle = shade(agua, -.3); trazo(.55, .5, .35); g.fill(); // lo hondo, corrido adelante
  g.save(); trazo(1); g.clip();
  g.globalAlpha = .45; g.fillStyle = '#E4EEEA'; g.beginPath(); g.ellipse(x - w * .25, y - w * .28, w * .6, w * .12, -.08, 0, 7); g.fill(); // cielo reflejado atrás
  g.restore();
  g.globalAlpha = 1; g.fillStyle = '#5C7A3A'; g.beginPath();
  for (let q = 0; q < 5; q++) { const a = rng() * 6.283, bx = x + Math.cos(a) * w * .85, by = y + Math.sin(a) * w * .36, h = 2 + rng() * 2.5; g.moveTo(bx - .4, by); g.lineTo(bx + (rng() - .5) * 1.2, by - h); g.lineTo(bx + .4, by); g.closePath(); }
  g.fill();
}
// Mancha suave de bordes difusos (sin contorno), para que el suelo no parezca un mosaico.
function mancha(g, x, y, rx, col, al) {
  g.save(); g.translate(x, y); g.scale(1, .5);
  const gr = g.createRadialGradient(0, 0, 0, 0, 0, rx);
  gr.addColorStop(0, col); gr.addColorStop(.5, col); gr.addColorStop(1, col + '00');
  g.globalAlpha = al; g.fillStyle = gr; g.beginPath(); g.arc(0, 0, rx, 0, 7); g.fill(); g.restore();
}
// Textura de cada casilla. El ruido es del mundo (no de la casilla), así las manchas se agrupan en manchones que
// cruzan varias casillas: pasto seco en los potreros, lodo junto al río y piedras sueltas en las laderas.
const HIERBA = new Set(['potrero', 'seco', 'ladera', 'galeria', 'paramo', 'niebla']);
function sueloNatural(g, T, t, col, dry, rng) {
  const pt = (u, v) => { const r = t.r + v, c = t.c + u; return P(r, c, T.hf(r, c)); };
  const en = () => pt(.12 + rng() * .76, .12 + rng() * .76);
  const nA = T.vary(t.c / 3.1 + 40, t.r / 3.1 + 40), nB = T.vary(t.c / 2.6 + 90, t.r / 2.6 + 12), nC = T.vary(t.c / 2.2 + 7, t.r / 2.2 + 70);
  // Pasto seco: más con la sequía.
  if (HIERBA.has(t.b) && t.b !== 'niebla') {
    const f = clamp((nA - .56 + dry * .2) / .22, 0, 1);
    // (las briznas secas en rayitas se quitaron: ahora el pasto se pinta a toquecitos)
  }
  // Lodo y charcos junto al río (en la sequía se agrieta y se aclara).
  if (t.d < 2.6 && t.b !== 'arrozal' && nB > .55) {
    if (nB > .72 && dry < .45) { const p = en(); charco(g, p[0], p[1], 3 + rng() * 2, rng, '#86A9AE'); }
  }
  // Piedras sueltas: en roca y páramo casi siempre; en las laderas empinadas, en manchones.
  const pedregal = t.b === 'roca' || t.b === 'paramo' ? nC > .38 : (t.slope > 1.1 && nC > .55) || nC > .78;
  if (pedregal) {
    const n = 2 + Math.floor(rng() * 5);
    for (let j = 0; j < n; j++) {
      const p = en(), w = 1 + rng() * 1.8, gris = mix('#A59B8C', '#8E8475', rng());
      g.globalAlpha = .3; g.fillStyle = '#3A2E22'; g.beginPath(); g.ellipse(p[0] + .6, p[1] + .5, w * 1.1, w * .45, 0, 0, 7); g.fill();
      g.globalAlpha = .95; g.fillStyle = gris; g.beginPath(); g.ellipse(p[0], p[1], w, w * .6, 0, 0, 7); g.fill();
      g.globalAlpha = .6; g.fillStyle = '#D6CEC0'; g.beginPath(); g.ellipse(p[0] - w * .3, p[1] - w * .25, w * .45, w * .2, 0, 0, 7); g.fill();
    }
    g.globalAlpha = 1;
  }
  // Pasto pintado a toquecitos (referencia de Juan): muchas hojitas cortas de varios verdes, primero las oscuras y
  // encima las claras, con la luz de arriba a la izquierda; se juntan en manchones y dejan ver algo del suelo.
  pintarPasto(g, T, t, dry, rng, pt, en);
  // Lodo donde el ganado baja a beber junto al río, y charcos en los potreros después de las lluvias.
  if (t.d < 2.4 && t.d > 1.2 && ['potrero', 'galeria', 'seco', 'arrozal'].includes(t.b)) lodoOrilla(g, T, t, rng, dry, pt);
  if (dry < .4 && ['potrero', 'galeria', 'arrozal', 'ladera'].includes(t.b) && t.slope < .7 && rng() < (.42 - dry) * .7) { const p = en(); charco(g, p[0], p[1], 3 + rng() * 4, rng, '#7FA2A8'); }
}
const PALETAS = {};
function tonosPasto(b, dry) {
  const clave = b + Math.round(dry * 10); if (PALETAS[clave]) return PALETAS[clave];
  return (PALETAS[clave] = b === 'paramo' ? ['#7E7A48', '#A39B5E', '#C4B97E', '#D9CF9C']
    : b === 'seco' ? [mix('#8E8A44', '#9A8648', dry), mix('#AFA555', '#BCA45E', dry), mix('#C9BC6A', '#D4BC78', dry), '#E2D394']
    : b === 'niebla' ? ['#2F5A2A', '#3F6E32', '#5A8A40', '#7AA453']
    : [mix('#4D7A2C', '#7E7C3E', dry * .8), mix('#6A9838', '#9C9446', dry * .8), mix('#8DB848', '#B5AE58', dry * .8), mix('#B5D16A', '#D2C478', dry * .8)]);
}
function pintarPasto(g, T, t, dry, rng, pt, en) {
  const hum = clamp(T.moistAt(t.r + .5, t.c + .5), 0, 1);
  // Matas bajas de hojitas en punta (pedido de Juan: nada de círculos ni óvalos). Cada mata abre 3 a 6 hojas desde
  // un mismo pie; las de atrás y abajo, oscuras; las de adelante, en tono medio; y unas pocas puntas claras del lado
  // de la luz. Cada mata toma el tipo de suelo del punto donde cae (con el mismo borde irregular del fondo).
  const capas = new Map(), pesos = [.3, .4, .22, .08], sombras = [];
  const hoja = (L, x, y, a, h, w) => { const s = Math.sin(a), c = Math.cos(a); L.push(x - w * c, y - w * s * .3, x + s * h, y - c * h, x + w * c, y + w * s * .3); };
  for (let j = 0; j < 110; j++) {
    const u = .03 + rng() * .94, v = .03 + rng() * .94, tb = tipoEn(T, t.r + v, t.c + u).b;
    if (!HIERBA.has(tb)) continue;
    const seco = tb === 'seco' || tb === 'paramo', dens = (tb === 'niebla' ? 32 : seco ? 30 + 18 * hum : 72 + 32 * hum) * (1 - dry * .3) / 110;
    if (rng() > dens) continue;
    // Manchones a dos escalas: zonas de pasto alto y tupido junto a claros de pasto corto (más irregular).
    const nm = .6 * T.vary((t.c + u) / 1.6 + 17, (t.r + v) / 1.6 + 61) + .4 * T.vary((t.c + u) / .5 + 117, (t.r + v) / .5 + 9);
    if (rng() > smooth(clamp((nm - .28) / .42, 0, 1)) * 1.15) continue;
    const alta = nm > .62 && rng() < .35, [x, y] = pt(u, v), tonos = tonosPasto(tb, dry);
    const n = alta ? 6 + Math.floor(rng() * 4) : 3 + Math.floor(rng() * 4), alto = ((seco ? 1.4 : 1.7) + rng() * 1.4) * (.6 + nm * 1.1) * (alta ? 1.5 : 1);
    if (alto > 2.6) sombras.push(x, y, alto); // la mata alta echa su sombrita hacia abajo a la derecha
    for (let q = 0; q < n; q++) {
      const f = n > 1 ? q / (n - 1) - .5 : 0, a = f * 1.3 + (rng() - .5) * .35, h = alto * (1 - Math.abs(f) * .45) * (.8 + rng() * .3);
      let k = q === 0 || q === n - 1 ? 0 : 1; if (f < 0 && rng() < .55) k = 2; if (f < -.2 && rng() < pesos[3] * 3) k = 3; // lado izquierdo, hacia la luz
      const col = tonos[k], L = capas.get(col) || capas.set(col, { k, L: [] }).get(col);
      hoja(L.L, x + f * 1.4, y + Math.abs(f) * .3, a, h, .42 + rng() * .2);
    }
  }
  g.globalAlpha = .2; g.fillStyle = '#26301A'; g.beginPath();
  for (let i = 0; i < sombras.length; i += 3) { const x = sombras[i], y = sombras[i + 1], h = sombras[i + 2]; g.moveTo(x - 1, y); g.lineTo(x + h * .42 + .4, y + h * .3 - .3); g.lineTo(x + h * .42 + .8, y + h * .3 + .5); g.lineTo(x + .6, y + .7); g.closePath(); }
  g.fill();
  [...capas.entries()].sort((a, b) => a[1].k - b[1].k).forEach(([col, { k, L }]) => {
    g.globalAlpha = k === 3 ? .9 : 1; g.fillStyle = col; g.beginPath();
    for (let i = 0; i < L.length; i += 6) { g.moveTo(L[i], L[i + 1]); g.lineTo(L[i + 2], L[i + 3]); g.lineTo(L[i + 4], L[i + 5]); g.closePath(); }
    g.fill();
  });
  if (!HIERBA.has(t.b)) { g.globalAlpha = 1; return; }
  const seco = t.b === 'seco' || t.b === 'paramo';
  // Flores silvestres: puntitos de color asomando entre una mata (pocas, en racimos).
  if (!seco && t.b !== 'niebla' && rng() < .3 + hum * .2) {
    const [x, y] = en(), col2 = ['#F4F0E2', '#F2D04A', '#E79AB4', '#E26A4A'][Math.floor(rng() * 4)], L = [];
    for (let q = 0; q < 7; q++) hoja(L, x + (rng() - .5) * 4, y + (rng() - .5) * 1.5, (rng() - .5) * 1.2, 2 + rng() * 1.5, .45);
    g.globalAlpha = 1; g.fillStyle = tonosPasto('potrero', dry)[1]; g.beginPath(); for (let i = 0; i < L.length; i += 6) { g.moveTo(L[i], L[i + 1]); g.lineTo(L[i + 2], L[i + 3]); g.lineTo(L[i + 4], L[i + 5]); g.closePath(); } g.fill();
    g.fillStyle = col2; for (let q = 0; q < 4; q++) g.fillRect(x + (rng() - .5) * 4.5, y - 2.4 - rng() * 1.6, .9, .9);
  }
  // Matorral: un montón de hojitas en punta más grande y tupido, oscuro abajo y claro arriba a la izquierda.
  if (rng() < (seco ? .16 : t.b === 'niebla' ? .45 : .26)) {
    const [x, y] = en(), w = 2.6 + rng() * 2.4, tonos = tonosPasto(seco ? 'seco' : t.b === 'niebla' ? 'niebla' : 'potrero', dry);
    const capasM = [[], [], [], []];
    for (let q = 0; q < 26; q++) {
      const px = (rng() - .5) * 2 * w, alto = (1 - Math.abs(px) / w) * w * .9, py = -rng() * alto, k = py < -alto * .55 ? (px < 0 ? 3 : 2) : py < -alto * .25 ? 1 : 0;
      hoja(capasM[k], x + px, y + py * .9, (px / w) * .9 + (rng() - .5) * .5, 1.8 + rng() * 1.8, .55);
    }
    g.globalAlpha = .22; g.fillStyle = '#2A2414'; g.beginPath(); g.moveTo(x - w, y + .4); g.lineTo(x + w * 1.6, y + .9); g.lineTo(x + w * 1.2, y + 1.8); g.lineTo(x - w * .6, y + 1.4); g.closePath(); g.fill(); // sombra a la derecha
    capasM.forEach((L, k) => { g.globalAlpha = 1; g.fillStyle = tonos[k]; g.beginPath(); for (let i = 0; i < L.length; i += 6) { g.moveTo(L[i], L[i + 1]); g.lineTo(L[i + 2], L[i + 3]); g.lineTo(L[i + 4], L[i + 5]); g.closePath(); } g.fill(); });
  }
  g.globalAlpha = 1;
}

// Qué se pinta al pie de cada planta: tamaño de la sombra, helechos, hojarasca y tipo de pasto.
const PIE = {
  ceiba: { r: 9, helecho: 3, hoja: 10, sombra: .2 }, saman: { r: 10, hoja: 12, sombra: .2 }, mango: { r: 7, helecho: 1, hoja: 8, sombra: .2 },
  arbol: { r: 6, helecho: 2, hoja: 6, sombra: .18 }, arbolNiebla: { r: 6, helecho: 3, hoja: 5, sombra: .2 }, guayacan: { r: 6, hoja: 10, sombra: .15, flor: '#F2C531' },
  cambulo: { r: 6, helecho: 1, hoja: 8, sombra: .15, flor: '#E2552E' }, ocobo: { r: 6, hoja: 8, sombra: .15, flor: '#EC9BC0' }, yarumo: { r: 5, helecho: 2, hoja: 5, sombra: .14 },
  platano: { r: 5, helecho: 1, hoja: 4, sombra: .15 }, palma: { r: 4, helecho: 1, hoja: 4, sombra: .1 }, guadua: { r: 6, helecho: 1, hoja: 12, sombra: .18, seca: true },
  arbusto: { r: 4, hoja: 3, sombra: .12 }, cardon: { r: 3, sombra: .08, piedras: 3 }, frailejon: { r: 3, sombra: .08 }
};
function pintarPie(g, T, o, dry) {
  const d = PIE[o.k], R = mulberry(Math.round(o.r * 7919 + o.c * 104729) + T.seed), s = o.s || 1, rad = d.r * s;
  const [x, y] = P(o.r, o.c, T.hf(o.r, o.c)), tb = tipoEn(T, o.r, o.c).b, tonos = tonosPasto(HIERBA.has(tb) ? tb : 'potrero', dry);
  const en = (rmin, rmax) => { const a = R() * 6.283, q = rmin + Math.sqrt(R()) * (rmax - rmin); return [x + Math.cos(a) * q, y + Math.sin(a) * q * .5]; };
  // Hojarasca: hojitas secas sueltas (y pétalos si el árbol florece).
  const hojas = d.hoja || 0;
  for (let j = 0; j < hojas; j++) { const [hx, hy] = en(1.5, rad * 1.1); g.globalAlpha = .75; g.fillStyle = d.flor && R() < .5 ? d.flor : ['#8A6A3A', '#A9813F', '#6E5530'][Math.floor(R() * 3)]; g.fillRect(hx, hy, 1.1, .6); }
  for (let j = 0; j < (d.piedras || 0); j++) { const [hx, hy] = en(2, rad * 1.4); g.globalAlpha = .8; g.fillStyle = '#9C9384'; g.fillRect(hx, hy, 1.4, .8); }
  // Pasto alto alrededor del tronco: más tupido cerca, en tonos oscuros con alguna punta clara.
  const hojasP = [[], [], []];
  const hoja = (L, bx, by, a, h, w) => { const sn = Math.sin(a), cs = Math.cos(a); L.push(bx - w * cs, by - w * sn * .3, bx + sn * h, by - cs * h, bx + w * cs, by + w * sn * .3); };
  const nM = Math.round(5 + rad * 1.2);
  for (let j = 0; j < nM; j++) {
    const [bx, by] = en(1.2, rad * 1.05), n = 3 + Math.floor(R() * 4), alto = (2.6 + R() * 2.6) * (d.seca ? .8 : 1);
    for (let q = 0; q < n; q++) { const f = q / (n - 1) - .5, k = f < -.2 && R() < .4 ? 2 : R() < .45 ? 0 : 1; hoja(hojasP[k], bx + f * 1.3, by, f * 1.4 + (R() - .5) * .3, alto * (1 - Math.abs(f) * .4), .45); }
  }
  // Helechos: hojas largas y arqueadas que se abren casi horizontales, con hojuelas.
  const verdeH = ['#2F5A2A', '#4A7A34', '#6E9C48'];
  for (let j = 0; j < (d.helecho || 0); j++) {
    const [fx, fy] = en(rad * .35, rad * .9), nf = 5 + Math.floor(R() * 3);
    for (let q = 0; q < nf; q++) {
      const a = (q / (nf - 1) - .5) * 2.6, L = 5 + R() * 3.5, ex = fx + Math.sin(a) * L, ey = fy - Math.cos(a) * L * .45 - 1.2;
      g.globalAlpha = 1; g.strokeStyle = verdeH[q % 2]; g.lineWidth = .6; g.beginPath(); g.moveTo(fx, fy); g.quadraticCurveTo(fx + Math.sin(a) * L * .5, fy - L * .55, ex, ey); g.stroke();
      g.fillStyle = verdeH[q % 3]; g.beginPath();
      for (let z = 1; z <= 4; z++) { const f = z / 5, px = fx + (ex - fx) * f, py = fy + (ey - fy) * f - Math.sin(f * 3.1) * L * .25, w = 1.6 * (1 - f * .6); g.moveTo(px, py); g.lineTo(px - w * .6, py - w); g.lineTo(px + w * .2, py - .2); g.moveTo(px, py); g.lineTo(px + w * .7, py - w * .8); g.lineTo(px + .2, py + .3); }
      g.fill();
    }
  }
  hojasP.forEach((L, k) => { g.globalAlpha = 1; g.fillStyle = tonos[k === 2 ? 3 : k]; g.beginPath(); for (let i = 0; i < L.length; i += 6) { g.moveTo(L[i], L[i + 1]); g.lineTo(L[i + 2], L[i + 3]); g.lineTo(L[i + 4], L[i + 5]); g.closePath(); } g.fill(); });
  g.globalAlpha = 1;
}

// Veredas (renovación colonial): sendas curvas de tierra gastada que van de cada finca, mina o cementerio fuera
// del damero a la esquina de calle más cercana. Curvas suaves, sin borde, como las que abre la gente al caminar.
const VEREDA = new Set(['cultivo', 'cafetal', 'mina', 'cementerio']);
function pintarVeredas(g, T, mapa, dib, k) {
  const N = T.N, M = N + 1, vert = new Set();
  for (const [a, b] of dib.tramos) { vert.add(a); vert.add(b); }
  if (!vert.size) return;
  const V = [...vert].map(e => [Math.floor(e / M), e % M]);
  for (let i = 0; i < N * N; i++) {
    if (!VEREDA.has(mapa[i].b)) continue;
    const r = Math.floor(i / N) + .5, c = i % N + .5;
    if (r < k.r0 - 4 || r > k.r1 + 4 || c < k.c0 - 4 || c > k.c1 + 4) continue;
    let mejor = null, dm = 1e9;
    for (const [vr, vc] of V) { const d = Math.hypot(vr - r, vc - c); if (d < dm) { dm = d; mejor = [vr, vc]; } }
    if (!mejor || dm < .8 || dm > 3.2) continue; // junto a la calle no hace falta; muy lejos, no se abre
    const R = mulberry(i * 53 + 7), lado = R() < .5 ? -1 : 1, mr = (r + mejor[0]) / 2, mc = (c + mejor[1]) / 2;
    const kr = mr + lado * (mejor[1] - c) * .28, kc = mc - lado * (mejor[0] - r) * .28; // punto de control: la curva
    const L = [];
    for (let s = 0; s <= 14; s++) {
      const f = s / 14, a = (1 - f) * (1 - f), b = 2 * f * (1 - f), d = f * f;
      const rr = Math.min(N, Math.max(0, a * r + b * kr + d * mejor[0])), cc = Math.min(N, Math.max(0, a * c + b * kc + d * mejor[1]));
      L.push(P(rr, cc, T.hf(rr, cc)));
    }
    const trazo = (w, col, al) => { g.globalAlpha = al; g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); L.forEach((p, j) => j ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke(); };
    trazo(3.6, '#B39A70', .16); trazo(2.2, '#C9B48A', .5); trazo(.8, '#DCCBA4', .45);
    g.globalAlpha = 1;
  }
}

// Cielo, cordillera lejana y nevado, detrás del diorama.
export function pintarFondo(T, escala = 1, glaciar = 1) {
  PAL = T.terr && T.terr.paleta || null; // fase 10: el casquete del Nevado se encoge con el glaciar
  const N = T.N, izq = P(N, 0)[0] - 300, der = P(0, N)[0] + 300, arriba = P(0, 0, 12)[1] - 260, abajo = P(0, 0)[1] + N * TH * .35;
  const W = der - izq, H = abajo - arriba;
  const cv = lienzo(W * escala, H * escala), g = cv.getContext('2d'), R = mulberry(T.seed * 3 + 1);
  g.setTransform(escala, 0, 0, escala, -izq * escala, -arriba * escala);
  const OY = P(0, 0, 0)[1] - 20;
  const far = (pts, col, al) => {
    const q = g.createLinearGradient(0, OY - 200, 0, OY + 120);
    q.addColorStop(0, col); q.addColorStop(1, 'rgba(236,234,226,0)');
    g.globalAlpha = al; g.fillStyle = q; poly(g, pts); g.fill(); g.globalAlpha = 1;
  };
  const X = f => izq + W * f;
  far([[X(0), OY + 90], [X(0), OY - 20], [X(.1), OY - 60], [X(.22), OY - 34], [X(.35), OY - 95], [X(.47), OY - 50], [X(.6), OY - 82], [X(.75), OY - 44], [X(.9), OY - 76], [X(1), OY - 46], [X(1), OY + 90]], 'rgba(150,166,152,.85)', .8);
  const nx = X(.36), nt = OY - 190;
  far([[nx - 280, OY + 60], [nx - 70, nt + 36], [nx - 22, nt + 7], [nx + 12, nt], [nx + 70, nt + 26], [nx + 300, OY + 60]], 'rgba(160,156,176,.9)', .85);
  const cap0 = [[nx - 92, nt + 50], [nx - 70, nt + 36], [nx - 22, nt + 7], [nx + 12, nt], [nx + 70, nt + 26], [nx + 98, nt + 47], [nx + 52, nt + 40], [nx + 16, nt + 54], [nx - 24, nt + 42], [nx - 54, nt + 56]];
  const kg = clamp(.25 + .75 * glaciar, .25, 1), cap = cap0.map(([x, y]) => [nx + 5 + (x - nx - 5) * kg, nt + (y - nt) * kg]); // la nieve se retira hacia la cumbre
  wash(g, cap, '#F7F1E3', R, .95, 0); g.globalAlpha = .5; g.strokeStyle = '#5B3423'; g.lineWidth = 1; poly(g, cap); g.stroke(); g.globalAlpha = 1; // nevado con contorno siena
  return { canvas: cv, x: izq, y: arriba, w: W, h: H, escala };
}

// ---------- Obras pintadas en el suelo ----------
const DE_PIE = new Set(['casa', 'mercado', 'escuela', 'hospital', 'taller', 'agora', 'banco', 'universidad', 'acueducto', 'molino', 'aserradero', 'cantera', 'estudio', 'puerto', 'parque', 'fundacion', 'cementerio', 'iglesia']);
const conCamino = b => !!b && b !== 'mina';

// Caminos entre obras vecinas y puentes cuando las separa una casilla de río (como en la versión 9).
export function caminos(T, mapa) {
  const N = T.N, segs = [], puentes = [];
  for (let i = 0; i < N * N; i++) {
    if (!conCamino(mapa[i].b)) continue;
    const r = Math.floor(i / N), c = i % N;
    for (const [dr, dc] of [[0, 1], [1, 0]]) {
      const r1 = r + dr, c1 = c + dc;
      if (r1 >= N || c1 >= N) continue;
      const j = r1 * N + c1;
      if (conCamino(mapa[j].b)) segs.push([i, j]);
      else if (mapa[j].t === 'rio') {
        const r2 = r1 + dr, c2 = c1 + dc;
        if (r2 < N && c2 < N && conCamino(mapa[r2 * N + c2].b)) { segs.push([i, r2 * N + c2]); puentes.push([i, j, r2 * N + c2, dr]); }
      }
    }
  }
  return { segs, puentes };
}

function pintarObras(g, T, mapa, k, dry, conCalles, anio, etapa = 0) {
  const N = T.N, cerca = t => t.r >= k.r0 - 2 && t.r < k.r1 + 2 && t.c >= k.c0 - 2 && t.c < k.c1 + 2;
  const lista = T.tiles.filter(t => mapa[t.r * N + t.c].b && cerca(t)).sort((a, b) => (a.r + a.c) - (b.r + b.c));
  const { segs, puentes } = conCalles ? { segs: [], puentes: [] } : caminos(T, mapa); // fase 9: con calles, el jugador traza los caminos
  const centro = i => { const t = T.tiles[i]; return { r: t.r + .5, c: t.c + .5, h: mapa[i].b && DE_PIE.has(mapa[i].b) ? t.h : T.hf(t.r + .5, t.c + .5) }; };
  // Campos y minas (siguen el terreno).
  for (const t of lista) {
    const b = mapa[t.r * N + t.c].b, rng = mulberry(t.r * 313 + t.c * 71 + T.seed);
    const q = [P(t.r, t.c, t.h00), P(t.r, t.c + 1, t.h01), P(t.r + 1, t.c + 1, t.h11), P(t.r + 1, t.c, t.h10)];
    const x = mapa[t.r * N + t.c];
    if (b === 'cultivo' && x.cv && C.CULTIVOS) {
      // Fase 10: la finca se pinta según su cultivo; mientras no da cosecha, con matas pequeñas.
      const D = C.CULTIVOS.cultivos[x.cv], joven = anio !== undefined && x.cvDesde !== undefined && D && anio < x.cvDesde + D.madura;
      if (x.cv === 'arroz') pintarArroz(g, T, t, q, rng, dry);
      else if (x.cv === 'pancoger') pintarHuerta(g, T, t, q, rng, dry);
      else if (x.cv === 'cafe') pintarCafe(g, T, t, rng, dry, joven);
      else pintarHuerto(g, T, t, q, rng, dry, x.cv, joven);
    }
    else if (b === 'cultivo') (t.h < 2.2 && t.d < 6 ? pintarArroz : pintarHuerta)(g, T, t, q, rng, dry);
    else if (b === 'cafetal') pintarCafe(g, T, t, rng, dry);
    else if (b === 'mina') { const c = P(t.r + .55, t.c + .5, t.h); blob(g, c[0] + 4, c[1] + 3, 22, 8, '#8E857A', rng, .75); blob(g, c[0] - 6, c[1] + 1, 12, 5, '#6E6358', rng, .6); }
  }
  // Caminos de tierra.
  for (const [a, b] of segs) {
    const A = centro(a), B = centro(b), rng = mulberry(a * 31 + b);
    g.lineCap = 'round';
    for (let pass = 0; pass < 2; pass++) {
      g.globalAlpha = pass ? .35 : .62; g.strokeStyle = pass ? '#9C8058' : '#CDB488'; g.lineWidth = pass ? 1.4 : 4.6; g.beginPath();
      for (let s = 0; s <= 10; s++) {
        const f = s / 10, r = lerp(A.r, B.r, f), c = lerp(A.c, B.c, f), h = s === 0 ? A.h : s === 10 ? B.h : Math.max(T.hf(r, c), lerp(A.h, B.h, f) - .3);
        const p = P(r + (s % 10 ? (rng() - .5) * .04 : 0), c, h); s ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]);
      }
      g.stroke();
    }
  }
  g.globalAlpha = 1;
  // Puentes de madera sobre el río.
  for (const [a, j, b, dr] of puentes) {
    const A = centro(a), B = centro(b), t = T.tiles[j], h = Math.max(A.h, B.h, t.h) - .1, rng = mulberry(j * 17);
    const L = dr ? [[t.r - .1, t.c + .36], [t.r - .1, t.c + .64], [t.r + 1.1, t.c + .64], [t.r + 1.1, t.c + .36]] : [[t.r + .36, t.c - .1], [t.r + .64, t.c - .1], [t.r + .64, t.c + 1.1], [t.r + .36, t.c + 1.1]];
    const pts = L.map(([r, c]) => P(r, c, h));
    wash(g, pts, '#9B7650', rng, .97, .2);
    g.strokeStyle = '#5E4330'; g.lineWidth = .7; g.globalAlpha = .7;
    for (let s = 1; s < 8; s++) { const f = s / 8, p = [lerp(pts[0][0], pts[3][0], f), lerp(pts[0][1], pts[3][1], f)], q = [lerp(pts[1][0], pts[2][0], f), lerp(pts[1][1], pts[2][1], f)]; g.beginPath(); g.moveTo(...p); g.lineTo(...q); g.stroke(); }
    g.lineWidth = 1.1; g.beginPath(); g.moveTo(pts[0][0], pts[0][1] - 4); g.lineTo(pts[3][0], pts[3][1] - 4); g.moveTo(pts[1][0], pts[1][1] - 4); g.lineTo(pts[2][0], pts[2][1] - 4); g.stroke();
    g.globalAlpha = 1;
  }
  // Asiento de las obras de pie (fase visual, paso 2): patios, atrio, plaza y terrazas con pirca (asiento.js).
  asentarObras(g, T, mapa, lista, dry, etapa, tonosPasto);
}

// ---------- Calles en damero (fase 9) ----------
// dib: { era, tramos: [[a, b, agua]], esquinas: [[e, v1, v2]] }, con esquinas e = r * (N + 1) + c.
// Pedido de Juan (5 de octubre): caminos planos, sin borde dibujado, que se funden con el suelo como tierra gastada.
export const ESTILO_CALLE = {
  herradura: { ancho: 4.5, borde: '#8C7656', color: '#B9A27C', centro: '#C9B48E' },
  empedrado: { ancho: 6.5, borde: '#8E8576', color: '#B4AA98', centro: '#C2B9A7' },
  carretera: { ancho: 8.5, borde: '#6E685F', color: '#68625B', centro: '#716B63' }
};
function pintarCalles(g, T, dib, k) {
  const N = T.N, M = N + 1, E = ESTILO_CALLE[dib.era] || ESTILO_CALLE.herradura;
  const rc = e => [Math.floor(e / M), e % M], dentro = e => { const [r, c] = rc(e); return r >= k.r0 - 1 && r <= k.r1 + 1 && c >= k.c0 - 1 && c <= k.c1 + 1; };
  const tramos = dib.tramos.filter(([a, b]) => dentro(a) || dentro(b));
  if (!tramos.length) return;
  // Puntos del tramo siguiendo el relieve (los puentes van rectos, a la altura de las orillas).
  const pts = (a, b, agua) => {
    const [r1, c1] = rc(a), [r2, c2] = rc(b), L = [];
    if (agua) return [P(r1, c1, T.hv(r1, c1)), P(r2, c2, T.hv(r2, c2))];
    // El camino va recto por el borde de las casillas, pegado al relieve, igual que las mulas y los carros que lo
    // recorren (pedido de Juan, 6 de octubre: antes se desviaba a los lados y los vehículos parecían salirse).
    // Lo imperfecto queda en las orillas: tierra gastada, huellas y piedras sueltas.
    for (let s2 = 0; s2 <= 6; s2++) { const f = s2 / 6, r = lerp(r1, r2, f), c = lerp(c1, c2, f); L.push(P(r, c, T.hf(Math.min(N, r), Math.min(N, c)))); }
    return L;
  };
  const geo = tramos.map(([a, b, agua]) => ({ a, b, agua, L: pts(a, b, agua) }));
  const linea = L => { g.beginPath(); L.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke(); };
  const capa = (ancho, col, al, dash) => { g.save(); g.globalAlpha = al; g.strokeStyle = col; g.lineWidth = ancho; g.lineCap = 'round'; g.lineJoin = 'round'; if (dash) g.setLineDash(dash); for (const t of geo) linea(t.L); g.restore(); };
  // Orilla difusa (sin línea de contorno), cuerpo semitransparente y un centro más gastado: no parece en relieve.
  capa(E.ancho + 3, E.borde, .14); capa(E.ancho + 1, E.color, .45); capa(E.ancho * .55, E.centro, .5);
  const enLinea = (L, t) => { const n = L.length - 1, x = Math.min(n - 1e-6, t * n), i = Math.floor(x), f = x - i; return [lerp(L[i][0], L[i + 1][0], f), lerp(L[i][1], L[i + 1][1], f)]; };
  // Orillas gastadas: manchas de tierra que se salen del camino, huellas de ruedas y cascos, y piedras sueltas.
  if (dib.era !== 'carretera') {
    g.save();
    for (const t of geo) {
      if (t.agua) continue;
      const R = mulberry(t.a * 17 + t.b * 3);
      for (let j = 0; j < 4; j++) { const p = enLinea(t.L, R()); mancha(g, p[0] + (R() - .5) * E.ancho * 1.6, p[1] + (R() - .5) * E.ancho * .8, E.ancho * (.7 + R() * .6), E.color, .22); }
      g.globalAlpha = .22; g.strokeStyle = shade(E.color, -.35); g.lineWidth = .45; g.setLineDash([3, 2.5]);
      for (const lado of [-1, 1]) { g.beginPath(); t.L.forEach((p, j) => { const q = t.L[Math.min(t.L.length - 1, j + 1)], o = t.L[Math.max(0, j - 1)], dx = q[0] - o[0], dy = q[1] - o[1], n = Math.hypot(dx, dy) || 1, x = p[0] - dy / n * lado * E.ancho * .22, y = p[1] + dx / n * lado * E.ancho * .22; j ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke(); }
      g.setLineDash([]);
      for (let j = 0; j < 5; j++) { const p = enLinea(t.L, R()), x = p[0] + (R() < .5 ? -1 : 1) * E.ancho * (.5 + R() * .3), y = p[1] + (R() - .5) * 2, w = .7 + R() * .8; g.globalAlpha = .7; g.fillStyle = mix('#A59B8C', '#8E8475', R()); g.beginPath(); g.ellipse(x, y, w, w * .6, 0, 0, 7); g.fill(); }
    }
    g.restore();
  }
  // Relieve del camino (pedido de Juan: «sigue así con todo lo demás»): se recorre cada tramo a pasos cortos con
  // su dirección, y a lo ancho se ponen piedras, surcos, grava o grietas según la época del camino.
  const recorrer = (L, paso, fn) => { for (let i = 0; i < L.length - 1; i++) { const [x0, y0] = L[i], [x1, y1] = L[i + 1], d = Math.hypot(x1 - x0, y1 - y0) || 1, ux = (x1 - x0) / d, uy = (y1 - y0) / d; for (let s = 0; s < d; s += paso) fn(x0 + ux * s, y0 + uy * s, ux, uy); } };
  if (dib.era === 'empedrado') { // piedra de río redonda, cada una con su luz arriba a la izquierda y su sombra
    g.save();
    for (const t of geo) {
      if (t.agua) continue;
      const R = mulberry(t.a * 31 + t.b);
      recorrer(t.L, 1.9, (x, y, ux, uy) => {
        for (let o = -E.ancho * .5; o <= E.ancho * .5; o += 1.8) {
          const px = x - uy * o * .5 + (R() - .5) * .8, py = y + ux * o * .5 + (R() - .5) * .6, rx = .75 + R() * .35, ry = rx * .62, borde = Math.abs(o) > E.ancho * .42;
          g.globalAlpha = .55; g.fillStyle = '#5E564A'; g.beginPath(); g.ellipse(px + .25, py + .3, rx, ry, 0, 0, 7); g.fill();
          g.globalAlpha = .95; g.fillStyle = borde ? mix('#9A9284', '#8A8274', R()) : mix('#B8AE9C', '#A39886', R()); g.beginPath(); g.ellipse(px, py, rx, ry, 0, 0, 7); g.fill();
          g.globalAlpha = .55; g.fillStyle = '#E4DCCB'; g.beginPath(); g.ellipse(px - rx * .3, py - ry * .35, rx * .45, ry * .35, 0, 0, 7); g.fill();
        }
        if (R() < .05) { g.globalAlpha = .5; g.fillStyle = '#7C9A4E'; g.beginPath(); g.ellipse(x + (R() - .5) * E.ancho * .6, y, 1.2, .5, 0, 0, 7); g.fill(); } // hierba entre las piedras
      });
    }
    g.restore();
  }
  if (dib.era === 'carretera') { // asfalto gastado: huellas más claras de las llantas, bermas de grava, grietas y parches
    g.save();
    for (const t of geo) {
      if (t.agua) continue;
      const R = mulberry(t.a * 13 + t.b * 7);
      g.globalAlpha = .18; g.strokeStyle = '#9A948A'; g.lineWidth = 1.3; g.lineCap = 'round';
      for (const o of [-.28, .28]) { g.beginPath(); t.L.forEach((p, j) => { const q = t.L[Math.min(t.L.length - 1, j + 1)], w = t.L[Math.max(0, j - 1)], dx = q[0] - w[0], dy = q[1] - w[1], n = Math.hypot(dx, dy) || 1, X = p[0] - dy / n * o * E.ancho * .5 * 2, Y = p[1] + dx / n * o * E.ancho * .5; j ? g.lineTo(X, Y) : g.moveTo(X, Y); }); g.stroke(); }
      recorrer(t.L, 2.2, (x, y, ux, uy) => {
        for (const lado of [-1, 1]) { const o = lado * E.ancho * (.5 + R() * .12); g.globalAlpha = .6; g.fillStyle = mix('#A89E8C', '#8A8072', R()); g.beginPath(); g.ellipse(x - uy * o * .5 + (R() - .5), y + ux * o * .5, .5 + R() * .5, .35, 0, 0, 7); g.fill(); } // grava de la berma
        if (R() < .05) { g.globalAlpha = .4; g.strokeStyle = '#3E3A34'; g.lineWidth = .35; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (R() - .5) * 3, y + (R() - .5) * 1.5); g.lineTo(x + (R() - .5) * 4, y + (R() - .5) * 2); g.stroke(); } // grieta
        if (R() < .03) { g.globalAlpha = .35; g.fillStyle = R() < .5 ? '#4E4A44' : '#7E786E'; g.beginPath(); g.ellipse(x, y, 2 + R() * 2, 1 + R(), 0, 0, 7); g.fill(); } // parche
      });
    }
    g.restore();
    capa(.7, '#D9C9A0', .6, [4, 5]);
  }
  if (dib.era === 'herradura') { // tierra pisada: dos surcos de cascos y ruedas, pasto en el lomo del medio y charcos
    g.save();
    for (const t of geo) {
      if (t.agua) continue;
      const R = mulberry(t.a * 7 + t.b * 29);
      recorrer(t.L, 1.6, (x, y, ux, uy) => {
        for (const o of [-.3, .3]) { const X = x - uy * o * E.ancho * .5, Y = y + ux * o * E.ancho * .5 * .5; g.globalAlpha = .22; g.fillStyle = '#6E583C'; g.beginPath(); g.ellipse(X, Y, .9, .5, 0, 0, 7); g.fill(); }
        if (R() < .35) { g.globalAlpha = .5; g.strokeStyle = mix('#6E8E3E', '#8AA650', R()); g.lineWidth = .4; const X = x + (R() - .5) * 1.2; g.beginPath(); g.moveTo(X, y); g.lineTo(X + (R() - .5) * 1.2, y - 1 - R()); g.stroke(); } // pasto del medio
        if (R() < .03) { g.globalAlpha = .35; g.fillStyle = '#7A5E3E'; g.beginPath(); g.ellipse(x, y + .3, 2.4, 1, 0, 0, 7); g.fill(); g.globalAlpha = .45; g.fillStyle = '#9DB4BE'; g.beginPath(); g.ellipse(x - .3, y, 1.6, .6, 0, 0, 7); g.fill(); } // charco
        if (R() < .1) { const o = (R() < .5 ? -1 : 1) * E.ancho * .55; g.globalAlpha = .55; g.strokeStyle = '#6E8E3E'; g.lineWidth = .45; const X = x - uy * o, Y = y + ux * o * .5; for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(X + k * .6, Y); g.lineTo(X + k * .6 + (R() - .5), Y - 1.5 - R()); g.stroke(); } } // mata de la orilla
      });
    }
    g.restore();
  }
  // Puentes: tramos sobre el agua y esquinas por donde pasa el río.
  // Puentes: de guadua y tablas con baranda en los caminos de herradura, de cal y canto con pretil en el empedrado,
  // de concreto con baranda metálica en la carretera. Las tablas o el pretil van de través, con su sombra en el agua.
  const puente = (p, q) => {
    const dx = q[0] - p[0], dy = q[1] - p[1], d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d, nx = -uy, ny = ux, w = (E.ancho + 4) / 2;
    const borde = (o, z = 0) => [[p[0] + nx * o, p[1] + ny * o - z], [q[0] + nx * o, q[1] + ny * o - z]];
    g.save(); g.lineCap = 'butt';
    g.globalAlpha = .3; g.fillStyle = '#1E2A2E'; g.beginPath(); g.moveTo(p[0] + nx * w + 2, p[1] + ny * w + 3); g.lineTo(q[0] + nx * w + 2, q[1] + ny * w + 3); g.lineTo(q[0] - nx * w + 2, q[1] - ny * w + 3); g.lineTo(p[0] - nx * w + 2, p[1] - ny * w + 3); g.fill(); // sombra en el agua
    g.globalAlpha = 1;
    const madera = dib.era === 'herradura', piso = madera ? '#8A6A44' : dib.era === 'empedrado' ? '#B4AA98' : '#8E8A84', canto = madera ? '#5E4428' : dib.era === 'empedrado' ? '#8A8070' : '#6E6A64';
    g.fillStyle = canto; g.beginPath(); g.moveTo(p[0] + nx * w, p[1] + ny * w); g.lineTo(q[0] + nx * w, q[1] + ny * w); g.lineTo(q[0] + nx * w, q[1] + ny * w + 2); g.lineTo(p[0] + nx * w, p[1] + ny * w + 2); g.fill(); // canto de la losa
    g.fillStyle = piso; g.beginPath(); g.moveTo(p[0] + nx * w, p[1] + ny * w); g.lineTo(q[0] + nx * w, q[1] + ny * w); g.lineTo(q[0] - nx * w, q[1] - ny * w); g.lineTo(p[0] - nx * w, p[1] - ny * w); g.fill();
    if (madera) { g.strokeStyle = '#5A4026'; g.lineWidth = .4; for (let s = 1; s < d; s += 1.6) { const x = p[0] + ux * s, y = p[1] + uy * s; g.beginPath(); g.moveTo(x + nx * w, y + ny * w); g.lineTo(x - nx * w, y - ny * w); g.stroke(); } }
    else { g.globalAlpha = .25; g.strokeStyle = '#5E564A'; g.lineWidth = .35; for (let s = 2; s < d; s += 3) { const x = p[0] + ux * s, y = p[1] + uy * s; g.beginPath(); g.moveTo(x + nx * w * .9, y + ny * w * .9); g.lineTo(x - nx * w * .9, y - ny * w * .9); g.stroke(); } g.globalAlpha = 1; }
    for (const lado of [-1, 1]) { // baranda o pretil a cada lado
      const [a, b] = borde(lado * w), alto = madera ? 2.6 : dib.era === 'empedrado' ? 1.8 : 2.2;
      if (dib.era === 'empedrado') { g.fillStyle = lado < 0 ? '#D2C8B4' : '#A89E8A'; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.lineTo(b[0], b[1] - alto); g.lineTo(a[0], a[1] - alto); g.fill(); g.strokeStyle = '#E8E0D0'; g.lineWidth = .5; g.beginPath(); g.moveTo(a[0], a[1] - alto); g.lineTo(b[0], b[1] - alto); g.stroke(); continue; }
      g.strokeStyle = madera ? '#4A3420' : '#5E646A'; g.lineWidth = madera ? .6 : .45;
      for (let s = 0; s <= d; s += madera ? 3 : 2.5) { const x = a[0] + ux * s, y = a[1] + uy * s; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - alto); g.stroke(); }
      g.lineWidth = madera ? .7 : .55; g.beginPath(); g.moveTo(a[0], a[1] - alto); g.lineTo(b[0], b[1] - alto); g.stroke();
    }
    g.restore();
  };
  const alargar = (p, q, f) => { const m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]; return [[m[0] + (p[0] - m[0]) * f, m[1] + (p[1] - m[1]) * f], [m[0] + (q[0] - m[0]) * f, m[1] + (q[1] - m[1]) * f]]; };
  for (const t of geo) if (t.agua) puente(...alargar(t.L[0], t.L[1], 1.1));
  for (const [e, v1, v2] of dib.esquinas || []) {
    if (!dentro(e)) continue;
    const [r, c] = rc(e), h = T.hv(r, c), mitad = v => { const [R, Cc] = rc(v); return P((r + R) / 2, (c + Cc) / 2, Math.max(h, T.hf(Math.min(N, (r + R) / 2), Math.min(N, (c + Cc) / 2)))); };
    puente(mitad(v1), mitad(v2));
  }
}

// Suelo vivo (fase 1): bosque que volvió, cenizas de un incendio, laderas erosionadas y derrumbes.
function pintarSuelo(g, T, mapa, k, dry) {
  const N = T.N;
  for (const t of T.tiles) {
    if (t.r < k.r0 - 1 || t.r >= k.r1 + 1 || t.c < k.c0 - 1 || t.c >= k.c1 + 1) continue;
    const x = mapa[t.r * N + t.c];
    if (!x || !(x.q > 0 || x.er > 0 || x.dr > 0 || (x.t === 'bosque' && t.b !== 'niebla'))) continue;
    const rng = mulberry(t.r * 577 + t.c * 29 + T.seed);
    const punto = (u, v) => P(t.r + v, t.c + u, T.hf(t.r + v, t.c + u));
    // Manchas suaves e irregulares (acuarela), en lugar de rellenar el rombo entero.
    const manchas = (col, n, al, tam = 1) => { for (let j = 0; j < n; j++) { const p = punto(.18 + rng() * .64, .18 + rng() * .64), rx = (8 + rng() * 7) * tam; blob(g, p[0], p[1], rx, rx * .5, col, rng, al); } };
    if (x.dr > 0) {
      // Derrumbe: lengua de tierra removida que baja por la ladera, con piedras sueltas.
      const L = Math.hypot(t.sx, t.sy) || 1, bv = t.sy / L, bu = t.sx / L; // dirección cuesta arriba
      // De arriba hacia abajo: la cicatriz oscura en lo alto y la tierra que se abre al caer.
      for (let j = 0; j <= 7; j++) {
        const f = j / 7, u = .5 + bu * (.4 - f * .75), v = .5 + bv * (.4 - f * .75), p = punto(clamp(u, .05, .95), clamp(v, .05, .95)), rx = 5 + f * 11;
        blob(g, p[0], p[1], rx, rx * .5, j < 2 ? '#7A5436' : mix('#A5774C', '#B8946A', dry * .5), rng, .55);
      }
      for (let j = 0; j < 8; j++) { const f = .5 + rng() * .5, p = punto(clamp(.5 - bu * (f * .5 - .1) + (rng() - .5) * .4, .05, .95), clamp(.5 - bv * (f * .5 - .1) + (rng() - .5) * .4, .05, .95)); blob(g, p[0], p[1], 1.4 + rng() * 1.8, .9 + rng() * .8, rng() < .5 ? '#9A938A' : '#7F776C', rng, .9); }
      continue;
    }
    if (x.t === 'bosque') { // sombra del bosque: manchas sueltas que pasan a las casillas vecinas (sin marcar el rombo)
      for (let j = 0; j < 4; j++) { const p = punto(-.15 + rng() * 1.3, -.15 + rng() * 1.3), rx = 9 + rng() * 9; mancha(g, p[0], p[1], rx, mix('#3E6A30', DRYC, dry * .3), .16); }
      continue;
    }
    if (x.q > 0) {
      // Cenizas: suelo oscuro que se aclara con los años.
      const f = Math.min(1, .35 + x.q / 5);
      manchas('#554A40', 8, .38 * f); manchas('#3E352E', 4, .3 * f, .6);
      g.globalAlpha = .4 * f; g.fillStyle = '#8C8680';
      for (let j = 0; j < 6; j++) { const p = punto(.1 + rng() * .8, .1 + rng() * .8); g.beginPath(); g.ellipse(p[0], p[1], 1.4 + rng() * 1.6, .6, 0, 0, 7); g.fill(); }
      g.globalAlpha = 1;
    }
    if (x.er > 0) {
      // Erosión: tierra desnuda y cárcavas que bajan por la pendiente.
      manchas(mix('#B88A5C', '#C9A57A', dry * .4), 3 + x.er * 2, .12 + .08 * x.er);
      const L = Math.hypot(t.sx, t.sy) || 1, du = -t.sx / L, dv = -t.sy / L;
      g.strokeStyle = '#80583A'; g.lineCap = 'round';
      for (let j = 0; j < x.er * 3; j++) {
        let u = .15 + rng() * .7, v = .15 + rng() * .7;
        g.globalAlpha = .3 + .12 * x.er; g.lineWidth = .6 + rng() * .5; g.beginPath();
        for (let s = 0; s <= 5; s++) {
          const p = punto(clamp(u, .02, .98), clamp(v, .02, .98)); s ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]);
          u += du * .07 + (rng() - .5) * .05; v += dv * .07 + (rng() - .5) * .05;
        }
        g.stroke();
      }
      g.globalAlpha = 1;
    }
  }
}

// Mata con volumen (pedido de Juan: nada de círculos planos): un cuerpo oscuro abajo a la derecha, hojas en punta
// que salen hacia afuera, más claras arriba a la izquierda donde da el sol, y unas pocas hojas de luz encima.
function mata(g, x, y, rx, ry, col, rng, al = 1) {
  g.save(); g.globalAlpha = al;
  const osc = shade(col, -.24), luz = shade(col, .24), n = Math.max(7, Math.round(rx * 3.2));
  g.fillStyle = osc; g.beginPath(); g.ellipse(x + rx * .12, y + ry * .12, rx * .78, ry * .72, 0, 0, 7); g.fill();
  for (let k = 0; k < n; k++) {
    const a = (k / n) * Math.PI * 2 + rng() * .5, d = .55 + rng() * .35, hx = x + Math.cos(a) * rx * d * .6, hy = y + Math.sin(a) * ry * d * .6;
    const arriba = Math.cos(a - 3.9) * .5 + .5; // 1 hacia arriba a la izquierda
    g.fillStyle = mix(osc, col, .4 + arriba * .6);
    g.save(); g.translate(hx, hy); g.rotate(a + Math.PI / 2); g.beginPath(); g.moveTo(0, -rx * .55); g.quadraticCurveTo(rx * .4, 0, 0, rx * .32); g.quadraticCurveTo(-rx * .4, 0, 0, -rx * .55); g.fill(); g.restore();
  }
  for (let k = 0; k < 4; k++) { const hx = x - rx * (.1 + rng() * .35), hy = y - ry * (.15 + rng() * .4), a = -2.2 + rng() * 1.4; g.fillStyle = luz; g.save(); g.translate(hx, hy); g.rotate(a); g.beginPath(); g.moveTo(0, -rx * .4); g.quadraticCurveTo(rx * .2, 0, 0, rx * .2); g.quadraticCurveTo(-rx * .2, 0, 0, -rx * .4); g.fill(); g.restore(); }
  g.restore();
}
// Surco con relieve: lomo de tierra con luz y la zanja en sombra.
function surco(g, a, b, ancho = 1) {
  g.save(); g.lineCap = 'round';
  g.globalAlpha = .4; g.strokeStyle = '#6E5434'; g.lineWidth = 1.4 * ancho; g.beginPath(); g.moveTo(a[0], a[1] + .7); g.lineTo(b[0], b[1] + .7); g.stroke();
  g.globalAlpha = .45; g.strokeStyle = '#D2B88A'; g.lineWidth = .8 * ancho; g.beginPath(); g.moveTo(a[0], a[1] - .3); g.lineTo(b[0], b[1] - .3); g.stroke();
  g.restore();
}
// Parcela con forma de verdad (pedido de Juan: «son cuadros demasiado perfectos»; quiere relieve y difuminación):
// el borde no es la casilla sino una línea irregular con las esquinas redondeadas que sigue el terreno; la tierra se
// funde con el pasto en tres capas (la de afuera casi transparente), lleva la misma luz del relieve que el resto del
// suelo (lomas claras hacia el sol de arriba a la izquierda, hondonadas en sombra) y manchas suaves de humedad.
function formaParcela(T, t, dentro, seed) {
  const N = T.N, pts = [], lados = [[0, 0, 0, 1], [0, 1, 1, 1], [1, 1, 1, 0], [1, 0, 0, 0]];
  for (const [r0, c0, r1, c1] of lados) for (let s = 0; s < 10; s++) {
    const f = s / 10, rr = r0 + (r1 - r0) * f, cc = c0 + (c1 - c0) * f;
    const esq = Math.min(f, 1 - f) < .2 ? (.2 - Math.min(f, 1 - f)) * .45 : 0; // esquina redondeada
    const n = (T.vary((t.c + cc) * 2.3 + seed, (t.r + rr) * 2.3 + seed * .7) - .5) * .09;
    const m = dentro + esq + n, r = t.r + rr + (rr < .5 ? m : -m), c = t.c + cc + (cc < .5 ? m : -m);
    pts.push(P(r, c, T.hf(clamp(r, 0, N), clamp(c, 0, N))));
  }
  return pts;
}
function parcela(g, T, t, base, rng, dry = 0) {
  const N = T.N, seed = t.r * 7.3 + t.c * 3.1;
  // Tierra difuminada hacia el pasto: tres capas, de la más ancha y transparente a la de adentro.
  for (const [dentro, al] of [[-.03, .16], [.01, .3], [.05, .72]]) { g.globalAlpha = al; g.fillStyle = base; poly(g, formaParcela(T, t, dentro, seed)); g.fill(); }
  const forma = formaParcela(T, t, .02, seed);
  g.save(); poly(g, forma); g.clip();
  // Luz del relieve, con la misma regla del suelo (campoDeColor): una rejilla fina de luces y sombras.
  const n = 12, alt = (r, c) => { const h = T.hf(clamp(r, 0, N), clamp(c, 0, N)); return h + relieveFino(T, r, c, h); };
  for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) {
    const r = t.r + (a + .5) / n, c = t.c + (b + .5) / n, e = .5 / n;
    const hx = (alt(r, c + e) - alt(r, c - e)) / (2 * e), hy = (alt(r + e, c) - alt(r - e, c)) / (2 * e);
    const L = clamp(.24 * hx - .13 * hy, -.42, .32);
    g.globalAlpha = Math.min(.5, Math.abs(L) * 1.1); g.fillStyle = L > 0 ? '#FFF2D8' : '#3A2614';
    const q = [[a, b], [a, b + 1], [a + 1, b + 1], [a + 1, b]].map(([y, x]) => { const R = t.r + y / n, C = t.c + x / n; return P(R, C, T.hf(clamp(R, 0, N), clamp(C, 0, N))); });
    g.beginPath(); q.forEach((p, k) => k ? g.lineTo(p[0], p[1] + .3) : g.moveTo(p[0], p[1] + .3)); g.closePath(); g.fill();
  }
  // Manchas suaves de humedad y de tierra más seca, grandes y difusas (sin terrones sueltos).
  const xs = forma.map(p => p[0]), ys = forma.map(p => p[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  for (let k = 0; k < 6; k++) {
    const x = x0 + rng() * (x1 - x0), y = y0 + rng() * (y1 - y0), rx = 6 + rng() * 10, gr = g.createRadialGradient(x, y, 0, x, y, rx);
    const c = rng() < .55 ? '58,38,20' : '255,240,210'; gr.addColorStop(0, `rgba(${c},.16)`); gr.addColorStop(1, `rgba(${c},0)`);
    g.globalAlpha = 1; g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, rx, rx * .5, 0, 0, 7); g.fill();
  }
  g.restore(); g.globalAlpha = 1;
  return forma;
}
// Orilla de la parcela: matas de pasto que se meten sobre el borde (así no queda una raya entre la finca y el potrero).
function bordeParcela(g, T, t, dry = 0) {
  const forma = formaParcela(T, t, .02, t.r * 7.3 + t.c * 3.1), R = mulberry(t.r * 977 + t.c * 131);
  g.save(); g.lineCap = 'round';
  for (let k = 0; k < forma.length; k++) {
    const [x0, y0] = forma[k], [x1, y1] = forma[(k + 1) % forma.length];
    for (let s = 0; s < 3; s++) {
      if (R() < .35) continue;
      const f = R(), x = x0 + (x1 - x0) * f, y = y0 + (y1 - y0) * f, col = mix(mix('#6E8E42', '#93A85A', R()), '#B8A868', dry * .7);
      g.strokeStyle = col; g.globalAlpha = .85; g.lineWidth = .5;
      for (let b = 0; b < 4; b++) { const a = -Math.PI / 2 + (b - 1.5) * .38 + (R() - .5) * .3, L = 1.6 + R() * 1.8; g.beginPath(); g.moveTo(x + (b - 1.5) * .5, y + .4); g.lineTo(x + (b - 1.5) * .5 + Math.cos(a) * L, y + .4 + Math.sin(a) * L); g.stroke(); }
    }
  }
  g.restore(); g.globalAlpha = 1;
}
function pintarCafe(g, T, t, rng, dry, joven) {
  const col = mix('#2E5E36', '#6E7A3A', dry * .4);
  parcela(g, T, t, mix('#8E7A52', '#A89A6A', dry), rng, dry);
  for (let a = 0; a < 4; a++) for (let b = 0; b < 6; b++) {
    const u = .14 + b * .145, v = .18 + a * .21 + Math.sin(b * .9 + a) * .03, r = t.r + v, c = t.c + u, p = P(r, c, T.hf(r, c));
    g.globalAlpha = .18; g.fillStyle = '#22301E'; g.beginPath(); g.ellipse(p[0] + 2, p[1] + .5, 3.2, 1.2, 0, 0, 7); g.fill(); g.globalAlpha = 1;
    if (joven) { mata(g, p[0], p[1] - 1.2, 1.5, 1.2, col, rng); continue; }
    mata(g, p[0], p[1] - 2.4, 3, 2.6, col, rng);
    if (rng() < .45 && dry < .6) { g.fillStyle = '#B8322A'; g.beginPath(); g.arc(p[0] + (rng() - .5) * 3, p[1] - 2.8, .75, 0, 7); g.fill(); }
  }
}
function pintarArroz(g, T, t, q, rng, dry) {
  const wet = dry < .5;
  parcela(g, T, t, wet ? '#A3B98A' : '#C9BC80', rng, dry); // fase 8: arrozal en tierra verde, sin el azul que hacía cuadrícula
  g.globalAlpha = .4; g.strokeStyle = wet ? '#7E9A62' : '#A89A55'; g.lineWidth = .8;
  for (let k = 1; k < 7; k++) { const f = k / 7, a = [lerp(q[0][0], q[3][0], f), lerp(q[0][1], q[3][1], f)], b = [lerp(q[1][0], q[2][0], f), lerp(q[1][1], q[2][1], f)]; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); }
  g.globalAlpha = 1;
  if (wet) { g.globalAlpha = .3; g.fillStyle = '#E9F0E6'; g.beginPath(); g.ellipse((q[0][0] + q[2][0]) / 2 - 6, (q[0][1] + q[2][1]) / 2 - 2, 6, 1.2, -.4, 0, 7); g.fill(); g.globalAlpha = 1; }
  bordeParcela(g, T, t, dry);
}
// Fase 10: fincas de plátano, cacao, aguacate, algodón y ganadería (matas pequeñas si aún no producen).
function pintarHuerto(g, T, t, q, rng, dry, cv, joven) {
  const pt = (u, v) => { const r = t.r + v, c = t.c + u; return P(r, c, T.hf(r, c)); };
  if (cv === 'ganaderia') {
    parcela(g, T, t, mix('#A9B66E', DRYC, dry * .6), rng, dry);
    g.globalAlpha = .7; g.strokeStyle = '#6B4A30'; g.lineWidth = .8;
    const borde = [pt(.06, .06), pt(.94, .06), pt(.94, .94), pt(.06, .94)];
    g.beginPath(); borde.forEach((p, k) => k ? g.lineTo(p[0], p[1] - 2) : g.moveTo(p[0], p[1] - 2)); g.closePath(); g.stroke();
    for (const p of borde) { g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(p[0], p[1] - 3); g.stroke(); }
    g.globalAlpha = 1;
    for (const [u, v] of [[.35, .4], [.65, .62], [.45, .75]]) { const p = pt(u, v); blob(g, p[0], p[1] - 2.6, 4, 2.2, '#F2EEE4', rng, .97); blob(g, p[0] - 1, p[1] - 2.9, 1.6, 1, '#2E2723', rng, .9); blob(g, p[0] + 4, p[1] - 3.4, 1.6, 1.3, '#F2EEE4', rng, .97); }
    return;
  }
  if (cv === 'cana' || cv === 'tabaco') { pintarCanaTabaco(g, q, pt, rng, dry, cv, joven, T, t); return; }
  const suelo = cv === 'algodon' ? mix('#B99A6A', '#C9B07A', dry) : mix('#8E7A52', '#A89A6A', dry);
  parcela(g, T, t, suelo, rng, dry);
  for (let a = 0; a < (cv === 'algodon' ? 5 : 3); a++) { const v = .16 + a * (.68 / ((cv === 'algodon' ? 5 : 3) - 1)); surco(g, pt(.06, v + .03), pt(.94, v + .03), cv === 'algodon' ? .8 : 1.2); }
  const filas = cv === 'algodon' ? 5 : 3, cols = cv === 'algodon' ? 6 : 4, s = joven ? .45 : 1;
  for (let a = 0; a < filas; a++) for (let b = 0; b < cols; b++) {
    const u = .14 + b * (.72 / (cols - 1)), v = .16 + a * (.68 / (filas - 1)), p = pt(u, v);
    g.globalAlpha = .18; g.fillStyle = '#22301E'; g.beginPath(); g.ellipse(p[0] + 2, p[1] + .5, 3.4 * s, 1.2 * s, 0, 0, 7); g.fill(); g.globalAlpha = 1;
    if (cv === 'algodon') { mata(g, p[0], p[1] - 1.6, 2.2 * s, 1.6 * s, mix('#5E8A46', '#B8A65A', dry * .7), rng); if (!joven) for (let k = 0; k < 3; k++) { g.fillStyle = '#F6F2EA'; g.beginPath(); g.arc(p[0] + (rng() - .5) * 3.4, p[1] - 2.2 - rng() * 1.5, .9, 0, 7); g.fill(); } continue; }
    if (cv === 'platano') { g.save(); g.translate(p[0], p[1] - 3 * s); for (let k = 0; k < 5; k++) { g.save(); g.rotate(-Math.PI / 2 + (k - 2) * .6); g.fillStyle = mix('#6FA04A', '#B3A65A', dry * .5); g.beginPath(); g.ellipse(0, -3 * s, 1.1 * s, 3.4 * s, 0, 0, 7); g.fill(); g.restore(); } g.restore(); continue; }
    const col = cv === 'cacao' ? mix('#3E6A3A', '#7A7A40', dry * .4) : mix('#2F5432', '#6E7A3A', dry * .4);
    mata(g, p[0], p[1] - 3.2 * s, (cv === 'aguacate' ? 3.6 : 3.1) * s, (cv === 'aguacate' ? 3.4 : 2.8) * s, col, rng);
    if (!joven && cv === 'cacao') for (let k = 0; k < 2; k++) { g.fillStyle = k ? '#C9822E' : '#9C2F25'; g.beginPath(); g.ellipse(p[0] + (k ? 1.6 : -1.4), p[1] - 1.4, .7, 1.1, 0, 0, 7); g.fill(); }
    if (!joven && cv === 'aguacate') { g.fillStyle = '#4E6E2A'; g.beginPath(); g.ellipse(p[0] + 1.2, p[1] - 2, .7, .9, 0, 0, 7); g.fill(); }
  }
  bordeParcela(g, T, t, dry);
}
// Paso 2 de Anno: caña panelera (macollas altas de tallos con hojas largas) y tabaco (matas de hojas anchas, algunas
// amarillas, en surcos sobre tierra clara).
function pintarCanaTabaco(g, q, pt, rng, dry, cv, joven, T, t) {
  const s = joven ? .5 : 1;
  parcela(g, T, t, cv === 'cana' ? mix('#9A8A5C', '#B4A272', dry) : mix('#B79E70', '#C9B386', dry), rng, dry);
  if (cv === 'cana') {
    for (let a = 0; a < 4; a++) for (let b = 0; b < 6; b++) {
      const p = pt(.12 + b * .152 + (a % 2) * .04, .14 + a * .23);
      g.globalAlpha = .2; g.fillStyle = '#22301E'; g.beginPath(); g.ellipse(p[0] + 2.4, p[1] + .5, 3.4 * s, 1.1 * s, 0, 0, 7); g.fill(); g.globalAlpha = 1;
      g.lineCap = 'round';
      for (let k = -2; k <= 2; k++) { // tallos con nudos
        const x = p[0] + k * .9 * s, h = (8 + rng() * 3) * s;
        g.strokeStyle = mix('#8FA24E', '#B9A75A', dry * .6); g.lineWidth = .7; g.beginPath(); g.moveTo(x, p[1]); g.lineTo(x + k * .4, p[1] - h); g.stroke();
      }
      g.strokeStyle = mix('#4E8A3E', '#9C9A4E', dry * .6); g.lineWidth = .8; // hojas largas que caen en arco
      for (let k = 0; k < 6; k++) { const a0 = -Math.PI / 2 + (k - 2.5) * .5, L = (5 + rng() * 2) * s, y0 = p[1] - (6 + rng() * 3) * s; g.beginPath(); g.moveTo(p[0], y0); g.quadraticCurveTo(p[0] + Math.cos(a0) * L, y0 + Math.sin(a0) * L, p[0] + Math.cos(a0) * L * 1.4, y0 + 2.5 * s); g.stroke(); }
    }
  } else {
    for (let a = 0; a < 4; a++) for (let b = 0; b < 5; b++) {
      const p = pt(.14 + b * .18, .16 + a * .22);
      g.globalAlpha = .2; g.fillStyle = '#22301E'; g.beginPath(); g.ellipse(p[0] + 2, p[1] + .5, 3 * s, 1 * s, 0, 0, 7); g.fill(); g.globalAlpha = 1;
      for (let k = 0; k < 5; k++) { // hojas anchas en roseta; las de abajo, amarillas
        const ang = -Math.PI / 2 + (k - 2) * .62, L = (3.6 - Math.abs(k - 2) * .3) * s, x = p[0] + Math.cos(ang) * L * .7, y = p[1] - 2.4 * s + Math.sin(ang) * L * .5;
        g.fillStyle = k === 0 || k === 4 ? mix('#C9B25A', '#D8C278', dry * .5) : mix('#6E9A48', '#A9A45A', dry * .6);
        g.save(); g.translate(x, y); g.rotate(ang + Math.PI / 2); g.beginPath(); g.moveTo(0, -2.8 * s); g.quadraticCurveTo(1.6 * s, -.4 * s, 0, 2.6 * s); g.quadraticCurveTo(-1.6 * s, -.4 * s, 0, -2.8 * s); g.fill(); g.fillStyle = 'rgba(30,40,15,.25)'; g.beginPath(); g.moveTo(0, -2.8 * s); g.quadraticCurveTo(1.6 * s, -.4 * s, 0, 2.6 * s); g.closePath(); g.fill(); g.strokeStyle = 'rgba(240,240,200,.45)'; g.lineWidth = .25; g.beginPath(); g.moveTo(0, -2.4 * s); g.lineTo(0, 2.3 * s); g.stroke(); g.restore(); // hoja en punta con su vena y la mitad en sombra
      }
      if (!joven && rng() < .4) { g.fillStyle = '#E8D7E4'; g.beginPath(); g.arc(p[0], p[1] - 6, .7, 0, 7); g.fill(); } // flor rosada
    }
  }
  bordeParcela(g, T, t, dry);
}
// Huerta de maíz, fríjol y yuca en surcos, para los cultivos lejos de la llanura.
function pintarHuerta(g, T, t, q, rng, dry) {
  parcela(g, T, t, mix('#B99A6A', '#C9B07A', dry), rng, dry);
  const col = mix('#4F8A43', '#C9A94A', dry * .8);
  for (let a = 0; a < 5; a++) {
    const v = .12 + a * .19;
    for (let b = 0; b < 6; b++) { const r = t.r + v, c0 = t.c + .06 + b * .147, c1 = c0 + .147; surco(g, P(r, c0, T.hf(r, c0)), P(r, c1, T.hf(r, c1))); }
    for (let b = 0; b < 6; b++) { const r = t.r + v, c = t.c + .12 + b * .15, p = P(r, c, T.hf(r, c)); g.globalAlpha = .18; g.fillStyle = '#22301E'; g.beginPath(); g.ellipse(p[0] + 1.8, p[1] + .3, 2.6, .9, 0, 0, 7); g.fill(); g.globalAlpha = 1; mata(g, p[0], p[1] - 2, 2.4, 2, col, rng); if (rng() < .2) { g.fillStyle = '#E0B040'; g.beginPath(); g.arc(p[0] + 1, p[1] - 3, .7, 0, 7); g.fill(); } }
  }
  bordeParcela(g, T, t, dry);
}

// Sectores que hay que repintar cuando cambia la casilla i (incluye vecinos por caminos y puentes).
export function sectoresAfectados(T, i) {
  const N = T.N, r = Math.floor(i / N), c = i % N, S = new Set();
  for (let dr = -2; dr <= 2; dr++) for (let dc = -2; dc <= 2; dc++) {
    const R = r + dr, C = c + dc;
    if (R >= 0 && C >= 0 && R < N && C < N) S.add(`${Math.floor(R / LADO_SECTOR)}-${Math.floor(C / LADO_SECTOR)}`);
  }
  return [...S].map(x => x.split('-').map(Number));
}
