// Prueba de caminos en damero (fase 9): las calles van por los bordes de las casillas, rectas, con cruces en las
// esquinas, como el trazado colonial. Se toca una esquina de inicio y otra de destino; la ruta se traza sola por los
// bordes (esquiva la montaña, pone puente donde cruza el río) y se confirma viendo el costo. Por las calles andan
// arrieros con mulas, chivas o camiones, según la época. No toca el juego.
import { FR, mulberry, shade, mix, lienzo, pintar, ovalo, texturaYeso, poly, cajaIso } from '../src/arte/fresco.js';
import { hornearGente } from '../src/arte/gente.js';
import { hornearFlora } from '../src/arte/flora.js';
import { casa, templo } from '../src/arte/obras-fresco.js';
import { P } from '../src/arte/iso.js';

const N = 10, M1 = N + 1, DPR = Math.min(2.5, window.devicePixelRatio || 1), quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
const GENTE = hornearGente(), FLORA = hornearFlora(0);
const MAPA = [
  'MMMLLLLRLL',
  'MMLLLBBRLL',
  'MLLLBBLRLL',
  'LLLLLLLRLL',
  'LLLLLLRLLL',
  'LLLLLRLLBB',
  'LLLLRLLLBB',
  'LLLRLLLLLM',
  'LLRLLLLLMM',
  'LRLLLLLLMM'
].map(f => f.split(''));
const OBRAS = { '3,3': 'a', '4,2': 'c', '4,4': 'c', '2,3': 'c', '5,3': 'c', '6,6': 'c', '7,7': 'c', '2,8': 'c', '1,9': 'c', '8,5': 'c', '3,2': 'c', '5,2': 'c' };
const ARBOLES = [[1, 5.4, 'arbol'], [1.6, 6.3, 'arbol'], [2.4, 4.6, 'arbol'], [5.3, 8.6, 'arbol'], [6.4, 9.2, 'arbol'], [5.6, 9.5, 'guadua'], [0.4, 3.6, 'palma'], [9.2, 4.2, 'palma'], [3.6, 8.5, 'guadua']];
const ERAS = {
  herradura: { nombre: 'Camino de herradura', costo: 4, ancho: 5, borde: FR.siena, color: mix(FR.ocre, FR.ocreClaro, .45) },
  empedrado: { nombre: 'Calle empedrada', costo: 8, ancho: 7, borde: FR.siena, color: mix(FR.cal, '#B9AE9A', .55) },
  carretera: { nombre: 'Carretera', costo: 15, ancho: 9, borde: FR.carbon, color: '#5E5852' }
};
const PUENTE = 20;
const est = { era: 'herradura', inicio: null, ruta: null, calles: new Set(), quitar: false };
const tile = (r, c) => r >= 0 && c >= 0 && r < N && c < N ? MAPA[r][c] : null;
const esq = (r, c) => r * M1 + c, rcE = i => [Math.floor(i / M1), i % M1];
const clave = (a, b) => a < b ? a + '|' + b : b + '|' + a;
// Casillas a los lados de un borde (entre dos esquinas vecinas).
function lados(a, b) {
  const [r1, c1] = rcE(a), [r2, c2] = rcE(b);
  if (r1 === r2) { const c = Math.min(c1, c2); return [tile(r1 - 1, c), tile(r1, c)]; }
  const r = Math.min(r1, r2); return [tile(r, c1 - 1), tile(r, c1)];
}
// El río pasa por una esquina cuando dos casillas de río se tocan en diagonal allí.
function esquinaAgua(i) { const [r, c] = rcE(i); return (tile(r - 1, c - 1) === 'R' && tile(r, c) === 'R') || (tile(r - 1, c) === 'R' && tile(r, c - 1) === 'R'); }
function bordeAgua(a, b) { const L = lados(a, b).filter(x => x !== null); return L.length && L.every(x => x === 'R'); }
function bordeBloqueado(a, b) { const L = lados(a, b).filter(x => x !== null); return L.every(x => x === 'M'); }
function vecinasEsq(i) { const [r, c] = rcE(i), L = []; for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const R = r + dr, C = c + dc; if (R >= 0 && C >= 0 && R <= N && C <= N) L.push(esq(R, C)); } return L; }

// Ruta más barata por los bordes. Cruzar agua cuesta (puente); reutilizar una calle existente es casi gratis.
function trazar(a, b) {
  const T = M1 * M1, dist = new Array(T).fill(Infinity), prev = new Array(T).fill(-1), visto = new Set();
  dist[a] = 0;
  while (true) {
    let u = -1, m = Infinity; for (let i = 0; i < T; i++) if (!visto.has(i) && dist[i] < m) { m = dist[i]; u = i; }
    if (u < 0 || u === b) break;
    visto.add(u);
    for (const v of vecinasEsq(u)) {
      if (bordeBloqueado(u, v)) continue;
      const ya = est.calles.has(clave(u, v)) ? .2 : 1, agua = bordeAgua(u, v) || esquinaAgua(v) ? 3 : 0;
      const paso = ya * (1 + agua);
      if (dist[u] + paso < dist[v]) { dist[v] = dist[u] + paso; prev[v] = u; }
    }
  }
  if (!isFinite(dist[b])) return null;
  const L = [b]; while (L[0] !== a) L.unshift(prev[L[0]]);
  return L;
}
function puentesDe(L) { let n = 0; for (let k = 1; k < L.length; k++) { if (bordeAgua(L[k - 1], L[k])) n++; else if (k < L.length - 1 && esquinaAgua(L[k])) n++; } return n; }
function costoRuta(L) {
  const E = ERAS[est.era]; let oro = 0, nuevos = 0;
  for (let k = 1; k < L.length; k++) if (!est.calles.has(clave(L[k - 1], L[k]))) { oro += E.costo; nuevos++; }
  const p = puentesDe(L); oro += p * PUENTE;
  return { oro, puentes: p, tramos: nuevos };
}

// ---------- Pintura del suelo y las calles ----------
let SUELO = null;
function pintarSuelo() {
  const p = [P(0, 0), P(0, N), P(N, N), P(N, 0)], xs = p.map(q => q[0]), ys = p.map(q => q[1]);
  const x0 = Math.min(...xs) - 6, y0 = Math.min(...ys) - 40, w = Math.max(...xs) - x0 + 6, h = Math.max(...ys) - y0 + 30, E = 2;
  const cv = lienzo(w * E, h * E), g = cv.getContext('2d'), R = mulberry(3);
  g.scale(E, E); g.translate(-x0, -y0);
  const lado = (a, b, col) => pintar(g, [P(...a), P(...b), [P(...b)[0], P(...b)[1] + 18], [P(...a)[0], P(...a)[1] + 18]], col, R, { n: 4 });
  lado([N, 0], [N, N], FR.ocreRojo); lado([0, N], [N, N], shade(FR.ocreRojo, -.22));
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    const t = MAPA[r][c], q = [P(r, c), P(r, c + 1), P(r + 1, c + 1), P(r + 1, c)];
    const col = t === 'M' ? '#A69C8E' : t === 'B' ? mix(FR.verde, FR.tierraVerde, .3) : t === 'R' ? mix(FR.ocreClaro, FR.cal, .4) : mix(FR.tierraVerde, FR.ocreClaro, .3 + ((r * 7 + c * 3) % 5) * .03);
    pintar(g, q, col, R, { n: 2, bal: .12, bw: .4 });
  }
  // Río por las casillas de río.
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  const rio = []; for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (MAPA[r][c] === 'R') rio.push([r + .5, c + .5]);
  rio.sort((a, b) => a[0] - b[0]);
  const trazo = (w2, col, al = 1) => { g.globalAlpha = al; g.strokeStyle = col; g.lineWidth = w2; g.beginPath(); const s0 = P(rio[0][0] - .6, rio[0][1]); g.moveTo(...s0); rio.forEach(q => g.lineTo(...P(...q))); const u = rio[rio.length - 1]; g.lineTo(...P(u[0] + .6, u[1])); g.stroke(); };
  trazo(26, FR.azul); trazo(16, FR.agua, .9); g.restore(); g.globalAlpha = 1;
  pintarCalles(g);
  // Montañas encima de las calles.
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (MAPA[r][c] === 'M') { const m = P(r + .5, c + .5); pintar(g, [[m[0] - 22, m[1] + 6], [m[0] - 4, m[1] - 22], [m[0] + 6, m[1] - 16], [m[0] + 22, m[1] + 6]], '#9A9086', R, { n: 2, bw: .7 }); pintar(g, [[m[0] - 4, m[1] - 22], [m[0] + 6, m[1] - 16], [m[0] + 2, m[1] - 12], [m[0] - 6, m[1] - 14]], FR.cal, R, { n: 0, bw: .5 }); }
  texturaYeso(g, x0, y0, w, h, .4);
  SUELO = { cv, x0, y0, E };
}
function pintarCalles(g) {
  const E = ERAS[est.era], tramos = [...est.calles].map(k => k.split('|').map(Number));
  const linea = (a, b) => { g.beginPath(); g.moveTo(...P(...rcE(a))); g.lineTo(...P(...rcE(b))); g.stroke(); };
  const capa = (ancho, col, al, dash) => { g.save(); g.globalAlpha = al; g.strokeStyle = col; g.lineWidth = ancho; g.lineCap = 'round'; g.lineJoin = 'round'; if (dash) g.setLineDash(dash); for (const [a, b] of tramos) linea(a, b); g.restore(); };
  capa(E.ancho + 2.2, E.borde, .5); capa(E.ancho, E.color, 1);
  if (est.era === 'empedrado') { g.save(); g.fillStyle = shade(E.color, -.25); for (const [a, b] of tramos) { const pa = P(...rcE(a)), pb = P(...rcE(b)), R = mulberry(a * 31 + b); for (let s = 0; s < 16; s++) { const t = R(); g.globalAlpha = .55; g.beginPath(); g.ellipse(pa[0] + (pb[0] - pa[0]) * t + (R() - .5) * 4, pa[1] + (pb[1] - pa[1]) * t + (R() - .5) * 2.4, 1, .65, 0, 0, Math.PI * 2); g.fill(); } } g.restore(); }
  if (est.era === 'carretera') capa(.8, FR.ocre, .9, [4, 4]);
  if (est.era === 'herradura') { g.save(); g.fillStyle = FR.siena; for (const [a, b] of tramos) { const pa = P(...rcE(a)), pb = P(...rcE(b)); for (let s = 1; s < 6; s++) { const t = s / 6; g.globalAlpha = .3; g.beginPath(); g.arc(pa[0] + (pb[0] - pa[0]) * t, pa[1] + (pb[1] - pa[1]) * t, .6, 0, Math.PI * 2); g.fill(); } } g.restore(); }
  // Puentes: bordes sobre el agua y esquinas por donde pasa el río.
  const puente = (a, b) => { g.save(); g.lineCap = 'butt'; g.strokeStyle = FR.siena; g.globalAlpha = .55; g.lineWidth = E.ancho + 6; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); g.globalAlpha = 1; g.strokeStyle = est.era === 'herradura' ? FR.sienaClara : FR.cal; g.lineWidth = E.ancho + 4; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); g.strokeStyle = E.color; g.lineWidth = E.ancho - .5; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); g.restore(); };
  const mitad = (a, b) => { const p = P(...rcE(a)), q = P(...rcE(b)); return [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]; };
  for (const [a, b] of tramos) if (bordeAgua(a, b)) puente(mitad(a, b).map((v, k) => v + (P(...rcE(a))[k] - v) * 1.1), mitad(a, b).map((v, k) => v + (P(...rcE(b))[k] - v) * 1.1));
  const enEsq = {}; for (const [a, b] of tramos) { (enEsq[a] = enEsq[a] || []).push(b); (enEsq[b] = enEsq[b] || []).push(a); }
  for (const [i, V] of Object.entries(enEsq)) if (esquinaAgua(+i) && V.length >= 2) puente(mitad(+i, V[0]), mitad(+i, V[1]));
}

// ---------- Obras, árboles y vehículos ----------
const SPR = {};
function sprite(k) {
  if (SPR[k]) return SPR[k];
  const E = 3, c = lienzo(70 * E, 70 * E), g = c.getContext('2d'); g.translate(35 * E, 50 * E); g.scale(E, E);
  const r = mulberry(k.length * 13 + k.charCodeAt(1 % k.length));
  if (k === 'a') templo(g, r, { col: FR.rojo, emblema: 'balanza', w: .8, d: .7, h: 18 }); else casa(g, r, { zocalo: [FR.azul, FR.rojo, FR.verde, FR.ocre][+k.slice(1) % 4], w: .56, d: .46 });
  return (SPR[k] = { c, ax: 35, ay: 50, w: 70, h: 70 });
}
// Caja de un vehículo orientada por su eje ('c' o 'r'), en el punto (r, c) del mundo.
function caja(g, r, c, eje, largo, ancho, alto, z0, cols, rng) {
  const B = eje === 'c' ? cajaIso(largo, ancho, alto) : cajaIso(ancho, largo, alto), o = P(r, c), up = p => [p[0] + o[0], p[1] + o[1] - z0];
  pintar(g, B.izq.map(up), cols[0], rng, { n: 1, bw: .4 }); pintar(g, B.der.map(up), cols[1], rng, { n: 1, bw: .4 }); pintar(g, B.techo.map(up), cols[2], rng, { n: 1, bw: .4 });
  return { B, up };
}
function rueda(g, p) { g.fillStyle = FR.carbon; g.beginPath(); g.ellipse(p[0], p[1] - 1, 1.6, 1.3, 0, 0, Math.PI * 2); g.fill(); }
function vehiculo(g, v, t) {
  const rng = mulberry(7), { r, c, eje, dir } = v, era = est.era, adelante = (eje === 'c' ? [0, .14] : [.14, 0]).map(x => x * dir);
  if (era === 'herradura') {
    // Mula con su carga y el arriero al lado.
    caja(g, r, c, eje, .2, .07, 5, 2.5, ['#7A5536', '#5E4129', '#8A6544'], rng);
    caja(g, r + adelante[0], c + adelante[1], eje, .06, .05, 3, 6, ['#7A5536', '#5E4129', '#8A6544'], rng);
    for (const s of [-1, 1]) caja(g, r + (eje === 'c' ? s * .055 : 0), c + (eje === 'r' ? s * .055 : 0), eje, .1, .04, 4, 4, [FR.cal, shade(FR.cal, -.15), FR.ocreClaro], rng);
    const pa = P(r, c); g.save(); g.strokeStyle = '#4A3424'; g.lineWidth = .8; const paso = Math.sin(t / 120) * 1.2; for (const dx of [-3, 3]) { g.beginPath(); g.moveTo(pa[0] + dx, pa[1] - 2.5); g.lineTo(pa[0] + dx + paso, pa[1]); g.stroke(); } g.restore();
    const m = GENTE.marcos[`campesino_${v.vi}_1_${quieto ? 0 : Math.floor(t / 160) % 4}`], E2 = GENTE.escala, q = P(r + (eje === 'c' ? .12 : 0), c + (eje === 'r' ? .12 : 0));
    g.drawImage(GENTE.canvas, m.x, m.y, m.w, m.h, q[0] - m.ax / E2 * .7, q[1] - m.ay / E2 * .7, m.w / E2 * .7, m.h / E2 * .7);
  } else if (era === 'empedrado') {
    // Chiva: bus de madera pintado de colores, con carga en el techo.
    const { B, up } = caja(g, r, c, eje, .36, .16, 9, 2, [FR.ocre, shade(FR.ocre, -.15), FR.rojo], rng);
    for (const [cara, sh] of [[B.izq, 0], [B.der, -.15]]) {
      for (const [v0, v1, col] of [[.15, .32, FR.rojo], [.32, .48, FR.azul], [.48, .6, FR.verde]]) { const q = [cara[0], cara[1], cara[2], cara[3]].map(p => p), L = (p, s, f) => [p[0] + (s[0] - p[0]) * f, p[1] + (s[1] - p[1]) * f]; pintar(g, [L(q[0], q[3], v0), L(q[1], q[2], v0), L(q[1], q[2], v1), L(q[0], q[3], v1)].map(up), shade(col, sh), rng, { n: 0, borde: false }); }
      const L = (p, s, f) => [p[0] + (s[0] - p[0]) * f, p[1] + (s[1] - p[1]) * f];
      for (let k = 0; k < 4; k++) { const u0 = .1 + k * .21; pintar(g, [L(L(cara[0], cara[1], u0), L(cara[3], cara[2], u0), .66), L(L(cara[0], cara[1], u0 + .14), L(cara[3], cara[2], u0 + .14), .66), L(L(cara[0], cara[1], u0 + .14), L(cara[3], cara[2], u0 + .14), .92), L(L(cara[0], cara[1], u0), L(cara[3], cara[2], u0), .92)].map(up), '#3A3532', rng, { n: 0, bw: .3 }); }
    }
    caja(g, r, c, eje, .22, .1, 2.5, 11, [FR.cal, shade(FR.cal, -.15), FR.ocreClaro], rng);
    for (const f of [.15, .85]) { rueda(g, up([B.izq[0][0] + (B.izq[1][0] - B.izq[0][0]) * f, B.izq[0][1] + (B.izq[1][1] - B.izq[0][1]) * f])); rueda(g, up([B.der[0][0] + (B.der[1][0] - B.der[0][0]) * f, B.der[0][1] + (B.der[1][1] - B.der[0][1]) * f])); }
  } else {
    // Camión: cabina y platón con carga.
    const { B, up } = caja(g, r - adelante[0] * .5, c - adelante[1] * .5, eje, .26, .15, 6, 2, ['#8A7A5A', '#6E6048', '#9C8C6A'], rng);
    caja(g, r - adelante[0] * .5, c - adelante[1] * .5, eje, .22, .12, 4, 8, [FR.ocreClaro, shade(FR.ocreClaro, -.15), FR.ocre], rng);
    caja(g, r + adelante[0] * .9, c + adelante[1] * .9, eje, .1, .15, 8, 2, [FR.azul, shade(FR.azul, -.2), shade(FR.azul, .2)], rng);
    for (const f of [.2, .8]) { rueda(g, up([B.izq[0][0] + (B.izq[1][0] - B.izq[0][0]) * f, B.izq[0][1] + (B.izq[1][1] - B.izq[0][1]) * f])); rueda(g, up([B.der[0][0] + (B.der[1][0] - B.der[0][0]) * f, B.der[0][1] + (B.der[1][1] - B.der[0][1]) * f])); }
  }
}
const vehiculos = Array.from({ length: 3 }, (_, k) => ({ de: -1, a: -1, u: 0, vel: .35 + k * .06, vi: k % 3, previo: -1 }));
function vecinosCalle(i) { const L = []; for (const k of est.calles) { const [a, b] = k.split('|').map(Number); if (a === i) L.push(b); else if (b === i) L.push(a); } return L; }
function moverVehiculos(dt) {
  const nodos = [...new Set([...est.calles].flatMap(k => k.split('|').map(Number)))];
  for (const v of vehiculos) {
    if (!nodos.length) { v.de = -1; continue; }
    if (v.de < 0 || !nodos.includes(v.de)) { v.de = nodos[Math.floor(Math.random() * nodos.length)]; v.a = -1; v.u = 0; }
    if (v.a < 0) { let V = vecinosCalle(v.de); if (!V.length) { v.de = -1; continue; } const sin = V.filter(x => x !== v.previo); if (sin.length) V = sin; v.a = V[Math.floor(Math.random() * V.length)]; v.u = 0; }
    if (!est.calles.has(clave(v.de, v.a))) { v.de = -1; continue; }
    v.u += dt * v.vel; if (v.u >= 1) { v.previo = v.de; v.de = v.a; v.a = -1; v.u = 0; }
  }
}

function dibujar(cv, t) {
  const W = cv.clientWidth, H = cv.clientHeight; if (cv.width !== Math.round(W * DPR)) { cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); }
  const g = cv.getContext('2d'), ancho = P(0, N)[0] - P(N, 0)[0] + 40, arriba = P(0, 0)[1] - 50, abajo = P(N, N)[1] + 30;
  const esc = Math.min(W / ancho, H / (abajo - arriba)); cv.esc = esc; cv.off = [W / 2, H / 2 - (arriba + abajo) / 2 * esc];
  g.setTransform(DPR * esc, 0, 0, DPR * esc, DPR * cv.off[0], DPR * cv.off[1]);
  g.clearRect(-3000, -3000, 6000, 6000);
  g.drawImage(SUELO.cv, SUELO.x0, SUELO.y0, SUELO.cv.width / SUELO.E, SUELO.cv.height / SUELO.E);
  // Esquinas que se pueden tocar (puntos suaves) y la ruta en vista previa.
  g.save(); g.fillStyle = FR.siena; g.globalAlpha = .18; for (let r = 0; r <= N; r++) for (let c = 0; c <= N; c++) { const p = P(r, c); g.beginPath(); g.arc(p[0], p[1], 1.6, 0, Math.PI * 2); g.fill(); } g.restore();
  if (est.inicio !== null) { const p = P(...rcE(est.inicio)); g.save(); g.strokeStyle = FR.rojo; g.lineWidth = 2.4; g.beginPath(); g.arc(p[0], p[1], 6, 0, Math.PI * 2); g.stroke(); g.restore(); }
  if (est.ruta) { g.save(); g.strokeStyle = FR.rojo; g.lineWidth = 3; g.setLineDash([5, 4]); g.lineCap = 'round'; g.beginPath(); est.ruta.forEach((i, k) => { const p = P(...rcE(i)); k ? g.lineTo(...p) : g.moveTo(...p); }); g.stroke(); g.restore(); }
  const L = [];
  for (const [k, o] of Object.entries(OBRAS)) { const [r, c] = k.split(',').map(Number); L.push({ r: r + .5, c: c + .5, prof: r + c + 1, s: sprite(o === 'a' ? 'a' : 'c' + ((r * 3 + c) % 4)) }); }
  for (const [r, c, k] of ARBOLES) L.push({ r, c, prof: r + c, flora: k });
  for (const v of vehiculos) {
    if (v.de < 0 || v.a < 0) continue;
    const [r1, c1] = rcE(v.de), [r2, c2] = rcE(v.a), r = r1 + (r2 - r1) * v.u, c = c1 + (c2 - c1) * v.u;
    L.push({ r, c, prof: r + c + .03, veh: { r, c, eje: r1 === r2 ? 'c' : 'r', dir: (r2 - r1) + (c2 - c1), vi: v.vi } });
  }
  L.sort((a, b) => a.prof - b.prof);
  for (const o of L) {
    const [x, y] = P(o.r, o.c);
    if (o.veh) vehiculo(g, o.veh, t);
    else if (o.flora) { const m = FLORA.marcos[o.flora], E = FLORA.escala; g.drawImage(FLORA.canvas, m.x, m.y, m.w, m.h, x - m.ax / E, y - m.ay / E, m.w / E, m.h / E); }
    else g.drawImage(o.s.c, x - o.s.ax, y - o.s.ay, o.s.w, o.s.h);
  }
}

// ---------- Interacción: se toca la esquina más cercana ----------
const cv = document.getElementById('mapa'), info = document.getElementById('info'), bOk = document.getElementById('ok'), bNo = document.getElementById('no');
function esquinaEn(ev) {
  const b = cv.getBoundingClientRect(), x = (ev.clientX - b.left - cv.off[0]) / cv.esc, y = (ev.clientY - b.top - cv.off[1]) / cv.esc;
  const c = Math.round((y / 16 + x / 32) / 2), r = Math.round((y / 16 - x / 32) / 2);
  return r >= 0 && c >= 0 && r <= N && c <= N ? esq(r, c) : null;
}
function mostrar() {
  const E = ERAS[est.era];
  if (est.ruta) { const k = costoRuta(est.ruta); info.innerHTML = `<b>${E.nombre}</b>: ${k.tramos} tramo${k.tramos === 1 ? '' : 's'} nuevo${k.tramos === 1 ? '' : 's'} · <b>${k.oro} de oro</b>${k.puentes ? ` · ${k.puentes} puente${k.puentes > 1 ? 's' : ''}` : ''}.`; }
  else if (est.quitar) info.textContent = 'Toca una esquina para quitar las calles que llegan a ella.';
  else if (est.inicio !== null) info.textContent = 'Ahora toca la esquina de destino.';
  else info.textContent = 'Toca la esquina donde empieza la calle (los puntos del mapa).';
  bOk.hidden = bNo.hidden = !est.ruta;
}
cv.addEventListener('pointerup', ev => {
  const i = esquinaEn(ev); if (i === null) return;
  if (est.quitar) { for (const k of [...est.calles]) if (k.split('|').map(Number).includes(i)) est.calles.delete(k); pintarSuelo(); mostrar(); return; }
  if (est.inicio === null || est.ruta) { est.inicio = i; est.ruta = null; }
  else if (i !== est.inicio) { est.ruta = trazar(est.inicio, i); if (!est.ruta) { info.textContent = 'No hay ruta posible.'; return; } }
  mostrar();
});
bOk.onclick = () => { for (let k = 1; k < est.ruta.length; k++) est.calles.add(clave(est.ruta[k - 1], est.ruta[k])); est.ruta = null; est.inicio = null; pintarSuelo(); mostrar(); };
bNo.onclick = () => { est.ruta = null; est.inicio = null; mostrar(); };
document.querySelectorAll('[data-era]').forEach(b => b.onclick = () => { est.era = b.dataset.era; document.querySelectorAll('[data-era]').forEach(x => x.classList.toggle('on', x === b)); pintarSuelo(); mostrar(); });
document.getElementById('quitar').onclick = e => { est.quitar = !est.quitar; est.inicio = null; est.ruta = null; e.target.classList.toggle('on', est.quitar); mostrar(); };

// Un damero de ejemplo alrededor del ágora y una calle hasta el río con su puente.
const ej = [[[2, 2], [2, 5]], [[2, 5], [5, 5]], [[5, 5], [5, 2]], [[5, 2], [2, 2]], [[3, 2], [3, 5]], [[4, 2], [4, 5]], [[2, 3], [5, 3]], [[2, 4], [5, 4]], [[3, 5], [3, 9]], [[3, 9], [1, 9]]];
for (const [a, b] of ej) { const L = trazar(esq(...a), esq(...b)); if (L) for (let k = 1; k < L.length; k++) est.calles.add(clave(L[k - 1], L[k])); }
pintarSuelo(); mostrar();
let ult = performance.now();
function bucle(t) { const dt = Math.min(.05, (t - ult) / 1000); ult = t; moverVehiculos(quieto ? 0 : dt); dibujar(cv, t); requestAnimationFrame(bucle); }
requestAnimationFrame(bucle);
