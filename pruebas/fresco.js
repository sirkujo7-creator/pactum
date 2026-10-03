// Prueba de estilo del fresco pompeyano (fase 8). No toca el juego: solo muestra cómo se verían el pueblo, la gente,
// los árboles y la interfaz, con lo de antes al lado para comparar.
import { FR, mulberry, shade, mix, lienzo, pintar, ovalo, toques, texturaYeso, greca, contorno, poly } from '../src/arte/fresco.js';
import { figura, hornearGente } from '../src/arte/gente.js';
import { hornearFlora } from '../src/arte/flora.js';
import { casa, templo, fuente } from '../src/arte/obras-fresco.js';
import { hornearPersonas } from '../src/arte/personas.js';
import { hornearNaturaleza } from '../src/arte/naturaleza.js';
import { P } from '../src/arte/iso.js';
import { ICONOS } from '../src/arte/iconos.js';

const DPR = Math.min(2.5, window.devicePixelRatio || 1);
const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Sprites horneados ----------
function hornear(w, h, ax, ay, f, E = 3, semilla = 1) {
  const c = lienzo(w * E, h * E), g = c.getContext('2d');
  g.translate(ax * E, ay * E); g.scale(E, E); f(g, mulberry(semilla));
  return { c, w, h, ax, ay, E };
}
const FLORA = hornearFlora(0), GENTE = hornearGente();
function deHoja(H, k) { const m = H.marcos[k]; return { hoja: H.canvas, m, E: H.escala }; }

// ---------- Escena: un pueblo del Tolima pintado al fresco ----------
const N = 8;
function suelo() {
  const p = [P(0, 0), P(0, N), P(N, N), P(N, 0)], xs = p.map(q => q[0]), ys = p.map(q => q[1]);
  const x0 = Math.min(...xs) - 4, y0 = Math.min(...ys) - 4, w = Math.max(...xs) - x0 + 4, h = Math.max(...ys) - y0 + 40, E = 2;
  const c = lienzo(w * E, h * E), g = c.getContext('2d'), r = mulberry(5);
  g.scale(E, E); g.translate(-x0, -y0);
  // Costados del diorama: tierra con estratos.
  const lado = (a, b, col) => pintar(g, [P(...a), P(...b), [P(...b)[0], P(...b)[1] + 22], [P(...a)[0], P(...a)[1] + 22]], col, r, { n: 4 });
  lado([N, 0], [N, N], FR.ocreRojo); lado([0, N], [N, N], shade(FR.ocreRojo, -.22));
  g.save(); g.globalAlpha = .35; g.strokeStyle = FR.siena; g.lineWidth = .8; [[N, 0, N, N], [0, N, N, N]].forEach(([a, b, c2, d]) => { for (const f of [8, 15]) { const A = P(a, b), B = P(c2, d); g.beginPath(); g.moveTo(A[0], A[1] + f); g.lineTo(B[0], B[1] + f); g.stroke(); } }); g.restore();
  // Prado y campos.
  pintar(g, p, mix(FR.tierraVerde, FR.ocreClaro, .35), r, { n: 30, al: .1 });
  const parcela = (r0, c0, r1, c1, col, surcos) => {
    const q = [P(r0, c0), P(r0, c1), P(r1, c1), P(r1, c0)]; pintar(g, q, col, r, { n: 4, bal: .4, bw: .5 });
    if (surcos) { g.save(); poly(g, q); g.clip(); g.globalAlpha = .35; g.strokeStyle = shade(col, -.3); g.lineWidth = .6; for (let k = 0; k <= 8; k++) { const t = r0 + (r1 - r0) * k / 8, A = P(t, c0), B = P(t, c1); g.beginPath(); g.moveTo(...A); g.lineTo(...B); g.stroke(); } g.restore(); }
  };
  parcela(5.6, .3, 7.6, 2.2, FR.ocre, true); parcela(5.6, 2.4, 7.6, 3.6, mix(FR.verde, FR.ocre, .3), true);
  parcela(.3, 4.6, 1.8, 6.2, mix(FR.verde, FR.ocreClaro, .2), true);
  // Plaza empedrada frente al ágora.
  parcela(2.9, 1.6, 4.1, 3.6, mix(FR.cal, FR.ocreClaro, .45), false);
  // Camino de tierra.
  g.save(); g.strokeStyle = mix(FR.ocreClaro, FR.cal, .3); g.lineWidth = 9; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); [[3.5, 3.6], [3.6, 5.2], [4.8, 6.4], [6.4, 6.6], [8, 6.9]].forEach((q, i) => { const A = P(...q); i ? g.lineTo(...A) : g.moveTo(...A); }); g.stroke(); g.restore();
  // Río (azul egipcio y verde agua, con orillas de arena y ondas claras).
  const rio = [[-1, 4.8], [1.5, 5.5], [3.2, 6.5], [5, 7], [6.6, 6.6], [9, 7.6]].map(q => P(...q));
  g.save(); poly(g, p); g.clip();
  const trazo = (w, col, al = 1) => { g.save(); g.globalAlpha = al; g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); rio.forEach((q, i) => i ? g.lineTo(...q) : g.moveTo(...q)); g.stroke(); g.restore(); };
  trazo(30, mix(FR.ocreClaro, FR.cal, .4)); trazo(22, FR.azul); trazo(14, FR.agua, .9);
  g.save(); g.strokeStyle = FR.cal; g.globalAlpha = .7; g.lineWidth = .9; for (let k = 1; k < rio.length; k++) { const a = rio[k - 1], b = rio[k]; for (let t = .2; t < 1; t += .35) { const x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t; g.beginPath(); g.moveTo(x - 4, y); g.quadraticCurveTo(x, y - 2, x + 4, y); g.stroke(); } } g.restore();
  // Puente de piedra sobre el río (dentro del recorte).
  const pa = P(4.3, 6.2), pb = P(4.9, 7.3); g.save(); g.strokeStyle = FR.cal; g.lineWidth = 7; g.beginPath(); g.moveTo(...pa); g.lineTo(...pb); g.stroke(); g.strokeStyle = FR.siena; g.globalAlpha = .6; g.lineWidth = .7; g.beginPath(); g.moveTo(pa[0], pa[1] - 3.5); g.lineTo(pb[0], pb[1] - 3.5); g.moveTo(pa[0], pa[1] + 3.5); g.lineTo(pb[0], pb[1] + 3.5); g.stroke(); g.restore();
  g.restore();
  // Textura de muro solo sobre lo pintado (superficie y costados).
  g.save(); poly(g, [P(0, 0), P(0, N), [P(0, N)[0], P(0, N)[1] + 22], [P(N, N)[0], P(N, N)[1] + 22], [P(N, 0)[0], P(N, 0)[1] + 22], P(N, 0)]); g.clip(); texturaYeso(g, x0, y0, w, h, .5); g.restore();
  return { c, x0, y0, E };
}

// Objetos del pueblo: [r, c, sprite]
function objetos() {
  const L = [];
  const add = (r, c, s) => L.push({ r, c, s });
  const T = hornear(70, 70, 35, 50, (g, rng) => templo(g, rng, { col: FR.rojo }), 3, 11);
  add(2.4, 2.6, T);
  const C1 = hornear(54, 46, 27, 32, (g, rng) => casa(g, rng, { zocalo: FR.rojo, puerta: FR.verdeOsc }), 3, 21);
  const C2 = hornear(54, 46, 27, 32, (g, rng) => casa(g, rng, { zocalo: FR.azul, puerta: FR.rojo, muro: mix(FR.cal, FR.ocreClaro, .25) }), 3, 22);
  const C3 = hornear(54, 58, 27, 44, (g, rng) => casa(g, rng, { zocalo: FR.verde, puerta: FR.azul, pisos: 2 }), 3, 23);
  const C4 = hornear(54, 46, 27, 32, (g, rng) => casa(g, rng, { zocalo: FR.ocre, puerta: FR.siena }), 3, 24);
  add(4.6, 1.2, C1); add(4.7, 2.6, C2); add(4.6, 4.1, C3); add(3.3, 4.5, C4); add(1.4, 4.0, C2); add(5.9, 4.4, C1);
  const F = hornear(24, 20, 12, 14, (g, rng) => fuente(g, rng), 3, 31); add(3.5, 2.6, F);
  const fl = k => ({ flora: k });
  [[.9, .7, 'arbol'], [1.1, 1.6, 'arbusto'], [6.8, 4.9, 'saman'], [.9, 6.8, 'palma'], [7.3, 5.4, 'palma'], [5.2, 5.5, 'guadua'], [2.6, 7.3, 'guadua'],
   [3.1, .5, 'arbol'], [7.6, 3.9, 'arbusto'], [2.0, 5.3, 'arbol']].forEach(([r, c, k]) => add(r, c, fl(k)));
  for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) add(5.9 + i * .55, .5 + j * .45, fl('cafeto'));
  return L;
}

// Caminantes: van y vienen por el camino y la plaza.
const RUTAS = [[[3.4, 1.8], [3.5, 3.6], [3.6, 5.2], [4.6, 6.3]], [[2.9, 3.4], [3.9, 3.3], [4.1, 1.9]], [[4.8, 6.4], [6.4, 6.6], [7.8, 6.9]], [[3.0, 2.0], [3.0, 3.5]], [[5.4, .6], [5.4, 3.2]], [[3.8, 4.6], [3.6, 5.2], [4.4, 6.0]]];
const TIPOS = ['campesino', 'campesina', 'artesano', 'elite', 'nino', 'campesino', 'campesina', 'artesano'];
function caminantes() {
  const r = mulberry(9);
  return TIPOS.map((t, i) => ({ t, vi: i % 3, ruta: RUTAS[i % RUTAS.length], u: r(), vel: .05 + r() * .03, dir: r() < .5 ? 1 : -1 }));
}
function posEnRuta(ruta, u) {
  const seg = []; let L = 0;
  for (let k = 1; k < ruta.length; k++) { const d = Math.hypot(ruta[k][0] - ruta[k - 1][0], ruta[k][1] - ruta[k - 1][1]); seg.push(d); L += d; }
  let s = u * L;
  for (let k = 0; k < seg.length; k++) { if (s <= seg[k]) { const t = s / seg[k], a = ruta[k], b = ruta[k + 1]; return { r: a[0] + (b[0] - a[0]) * t, c: a[1] + (b[1] - a[1]) * t, dr: b[0] - a[0], dc: b[1] - a[1], L }; } s -= seg[k]; }
  const a = ruta[ruta.length - 2], b = ruta[ruta.length - 1]; return { r: b[0], c: b[1], dr: b[0] - a[0], dc: b[1] - a[1], L };
}

function escena(cv, op = {}) {
  const S = suelo(), O = objetos(), G = caminantes();
  const ctx = cv.getContext('2d');
  let ult = performance.now();
  function dibujar(t) {
    const W = cv.clientWidth, H = cv.clientHeight; if (cv.width !== W * DPR) { cv.width = W * DPR; cv.height = H * DPR; }
    const dt = Math.min(.05, (t - ult) / 1000); ult = t;
    const ancho = P(0, N)[0] - P(N, 0)[0], arriba = P(0, 0)[1] - 50, abajo = P(N, N)[1] + 24, alto = abajo - arriba;
    const esc = Math.min(W / (ancho + 30), H / (alto + 10)) * (op.zoom || 1), cx = op.centro ? P(...op.centro)[0] : 0, cy = op.centro ? P(...op.centro)[1] : (arriba + abajo) / 2;
    ctx.setTransform(DPR * esc, 0, 0, DPR * esc, DPR * (W / 2 - cx * esc), DPR * (H / 2 - cy * esc + (op.subir || 0)));
    ctx.clearRect(-2000, -2000, 4000, 4000);
    ctx.drawImage(S.c, S.x0, S.y0, S.c.width / S.E, S.c.height / S.E);
    const L = O.map(o => ({ ...o, prof: o.r + o.c }));
    for (const p of G) {
      if (!quieto) { p.u += p.dir * p.vel * dt / Math.max(.5, posEnRuta(p.ruta, 0).L) * 3; if (p.u > 1) { p.u = 1; p.dir = -1; } if (p.u < 0) { p.u = 0; p.dir = 1; } }
      const q = posEnRuta(p.ruta, p.u), frente = (q.dr + q.dc) * p.dir > 0;
      const izq = (q.dc - q.dr) * p.dir < 0, paso = quieto ? 0 : Math.floor(t / 160 + p.u * 10) % 4;
      L.push({ r: q.r, c: q.c, prof: q.r + q.c + .01, gente: `${p.t}_${p.vi}_${frente ? 1 : 0}_${paso}`, izq });
    }
    L.sort((a, b) => a.prof - b.prof);
    for (const o of L) {
      const [x, y] = P(o.r, o.c);
      if (o.gente) { const { hoja, m, E } = deHoja(GENTE, o.gente); ctx.save(); ctx.translate(x, y); if (o.izq) ctx.scale(-1, 1); ctx.drawImage(hoja, m.x, m.y, m.w, m.h, -m.ax / E, -m.ay / E, m.w / E, m.h / E); ctx.restore(); }
      else if (o.s.flora) { const { hoja, m, E } = deHoja(FLORA, o.s.flora); ctx.drawImage(hoja, m.x, m.y, m.w, m.h, x - m.ax / E, y - m.ay / E, m.w / E, m.h / E); }
      else { const s = o.s; ctx.drawImage(s.c, x - s.ax, y - s.ay, s.w, s.h); }
    }
    if (!quieto) requestAnimationFrame(dibujar);
  }
  requestAnimationFrame(dibujar);
}

// ---------- Antes y ahora ----------
function comparar(cv, viejo, nuevo, etiquetas) {
  const W = cv.clientWidth, H = cv.clientHeight; cv.width = W * DPR; cv.height = H * DPR;
  const g = cv.getContext('2d'); g.scale(DPR, DPR);
  g.fillStyle = FR.yeso; g.fillRect(0, 0, W, H);
  g.font = '600 13px "Alegreya Sans", sans-serif'; g.fillStyle = FR.siena;
  g.fillText(etiquetas[0], 10, 18); g.fillText(etiquetas[1], 10, H / 2 + 14);
  viejo(g, W, H / 2, 0); nuevo(g, W, H / 2, H / 2);
}
function filaSprites(H, claves, g, W, alto, y0, esc) {
  const paso = W / (claves.length + .5);
  claves.forEach((k, i) => { const m = H.marcos[k], E = H.escala; if (!m) return; const s = esc / E; g.drawImage(H.canvas, m.x, m.y, m.w, m.h, paso * (i + .75) - m.ax * s, y0 + alto - 12 - m.ay * s + (m.h - m.ay) * 0, m.w * s, m.h * s); });
}

function interfaz(raiz) {
  raiz.querySelectorAll('[data-ico]').forEach(el => { const i = document.createElement('img'); i.src = ICONOS[el.dataset.ico]; i.alt = ''; el.prepend(i); });
  // Greca pintada como borde de las tarjetas.
  const gc = lienzo(64, 16), g = gc.getContext('2d'); greca(g, 0, 2, 64, 12, FR.rojo);
  const gc2 = lienzo(64, 16), g2 = gc2.getContext('2d'); greca(g2, 0, 2, 64, 12, FR.ocre);
  document.documentElement.style.setProperty('--greca', `url(${gc.toDataURL()})`);
  document.documentElement.style.setProperty('--greca-ocre', `url(${gc2.toDataURL()})`);
  // Textura de yeso para los paneles.
  const y = lienzo(220, 220), gy = y.getContext('2d'); gy.fillStyle = '#fff'; gy.fillRect(0, 0, 220, 220); texturaYeso(gy, 0, 0, 220, 220, 1);
  document.documentElement.style.setProperty('--yeso-tex', `url(${y.toDataURL()})`);
  raiz.querySelectorAll('[data-variante]').forEach(b => b.onclick = () => { document.body.dataset.v = b.dataset.variante; raiz.querySelectorAll('[data-variante]').forEach(x => x.classList.toggle('on', x === b)); });
}

// ---------- Arranque ----------
await document.fonts.ready;
escena(document.getElementById('escena'));
const VIEJA = hornearPersonas(), NAT = hornearNaturaleza(0);
const tipos = ['campesino_0_1_1', 'campesina_1_1_2', 'artesano_2_1_0', 'elite_0_1_1', 'nino_1_1_2', 'campesino_1_0_3'];
comparar(document.getElementById('gente'),
  (g, W, h, y0) => filaSprites(VIEJA, tipos, g, W, h, y0, 2.2),
  (g, W, h, y0) => filaSprites(GENTE, tipos, g, W, h, y0, 2.2),
  ['Antes', 'Ahora: figuras al fresco']);
const arboles = ['arbol', 'saman', 'palma', 'guadua', 'arbusto'];
comparar(document.getElementById('arboles'),
  (g, W, h, y0) => filaSprites(NAT, arboles, g, W, h, y0, 1.25),
  (g, W, h, y0) => filaSprites(FLORA, arboles, g, W, h, y0, 1.25),
  ['Antes', 'Ahora: más pequeños y estilizados']);
interfaz(document.body);
escena(document.getElementById('escena2'), { zoom: 2.6, centro: [3.6, 3.4], subir: -110 });
// Las figuras grandes, para ver el detalle.
const det = document.getElementById('detalle'), DW = det.clientWidth, DH = det.clientHeight; det.width = DW * DPR; det.height = DH * DPR;
const gd = det.getContext('2d'); gd.scale(DPR, DPR); gd.fillStyle = FR.yeso; gd.fillRect(0, 0, DW, DH);
['campesino', 'campesina', 'artesano', 'elite', 'nino'].forEach((t, i) => { gd.save(); gd.translate(DW / 5.5 * (i + .8), DH - 14); gd.scale(4.2, 4.2); figura(gd, t, i % 3, true, 1); gd.restore(); });
texturaYeso(gd, 0, 0, DW, DH, .35);
