// Prueba de caminos (opción 3): el camino pasa por las casillas sin ocuparlas. Se toca la casilla de inicio y la de
// destino; la ruta se traza sola (esquiva la montaña, pone puente sobre el río) y se confirma viendo el costo.
// No toca el juego.
import { FR, mulberry, shade, mix, lienzo, pintar, ovalo, texturaYeso, poly } from '../src/arte/fresco.js';
import { hornearGente } from '../src/arte/gente.js';
import { hornearFlora } from '../src/arte/flora.js';
import { casa, templo } from '../src/arte/obras-fresco.js';
import { P } from '../src/arte/iso.js';

const N = 10, DPR = Math.min(2.5, window.devicePixelRatio || 1), quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
const GENTE = hornearGente(), FLORA = hornearFlora(0);
// Terreno: L llano, B bosque, M montaña, R río. Obras: c casa, a ágora.
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
const OBRAS = { '3,3': 'a', '4,2': 'c', '4,4': 'c', '2,3': 'c', '5,3': 'c', '6,6': 'c', '7,7': 'c', '2,8': 'c', '1,9': 'c', '8,5': 'c' };
const ARBOLES = [[1, 5.4, 'arbol'], [1.6, 6.3, 'arbol'], [2.4, 4.6, 'arbol'], [5.3, 8.6, 'arbol'], [6.4, 9.2, 'arbol'], [5.6, 9.5, 'guadua'], [0.4, 3.6, 'palma'], [9.2, 4.2, 'palma'], [3.4, 8.4, 'guadua']];
const ERAS = {
  herradura: { nombre: 'Camino de herradura', costo: 4, ancho: 6, borde: FR.siena, color: mix(FR.ocre, FR.ocreClaro, .45) },
  empedrado: { nombre: 'Camino empedrado', costo: 8, ancho: 8, borde: FR.siena, color: mix(FR.cal, '#B9AE9A', .55) },
  carretera: { nombre: 'Carretera', costo: 15, ancho: 10, borde: FR.carbon, color: '#5E5852' }
};
const PUENTE = 20, TALA = 2;

const est = { era: 'herradura', modo: 'poner', inicio: null, ruta: null, caminos: new Set(), quitar: false };
const clave = (a, b) => a < b ? a + '|' + b : b + '|' + a; // tramo entre dos casillas (índices)
const idx = (r, c) => r * N + c, rc = i => [Math.floor(i / N), i % N];
const tipo = i => { const [r, c] = rc(i); return MAPA[r][c]; };

// Ruta más barata entre dos casillas (4 vecinos). La montaña no se puede cruzar; el río sí, con puente.
function trazar(a, b) {
  const dist = new Array(N * N).fill(Infinity), prev = new Array(N * N).fill(-1), visto = new Set();
  dist[a] = 0;
  while (true) {
    let u = -1, m = Infinity; for (let i = 0; i < N * N; i++) if (!visto.has(i) && dist[i] < m) { m = dist[i]; u = i; }
    if (u < 0 || u === b) break;
    visto.add(u); const [r, c] = rc(u);
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const R = r + dr, Cc = c + dc; if (R < 0 || Cc < 0 || R >= N || Cc >= N) continue;
      const v = idx(R, Cc), t = tipo(v); if (t === 'M') continue;
      const ya = est.caminos.has(clave(u, v)) ? .2 : 1; // reutilizar un camino que ya existe es casi gratis
      const paso = ya * (1 + (t === 'B' ? .8 : 0) + (t === 'R' ? 3 : 0));
      if (dist[u] + paso < dist[v]) { dist[v] = dist[u] + paso; prev[v] = u; }
    }
  }
  if (!isFinite(dist[b])) return null;
  const L = [b]; while (L[0] !== a) L.unshift(prev[L[0]]);
  return L;
}
function costoRuta(L) {
  const E = ERAS[est.era]; let oro = 0, puentes = 0, tala = 0;
  for (let k = 1; k < L.length; k++) {
    if (est.caminos.has(clave(L[k - 1], L[k]))) continue;
    oro += E.costo; if (tipo(L[k]) === 'R') { oro += PUENTE; puentes++; } if (tipo(L[k]) === 'B') { oro += TALA; tala++; }
  }
  return { oro, puentes, tala };
}

// Punto por donde pasa el camino en una casilla: el centro, o el frente si hay una obra (pasa junto a la puerta).
function puntoCasilla(i) { const [r, c] = rc(i), o = OBRAS[r + ',' + c]; return o ? [r + .82, c + .82] : [r + .5, c + .5]; }
function vecinosCamino(i) { const L = []; for (const k of est.caminos) { const [a, b] = k.split('|').map(Number); if (a === i) L.push(b); else if (b === i) L.push(a); } return L; }

// ---------- Pintura ----------
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
    if (t === 'M') { const m = P(r + .5, c + .5); pintar(g, [[m[0] - 22, m[1] + 6], [m[0] - 4, m[1] - 22], [m[0] + 6, m[1] - 16], [m[0] + 22, m[1] + 6]], '#9A9086', R, { n: 2, bw: .7 }); pintar(g, [[m[0] - 4, m[1] - 22], [m[0] + 6, m[1] - 16], [m[0] + 2, m[1] - 12], [m[0] - 6, m[1] - 14]], FR.cal, R, { n: 0, bw: .5 }); }
  }
  // El río: azul egipcio por las casillas de río.
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  const rio = []; for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (MAPA[r][c] === 'R') rio.push([r + .5, c + .5]);
  rio.sort((a, b) => a[0] - b[0]);
  const trazo = (w2, col, al = 1) => { g.globalAlpha = al; g.strokeStyle = col; g.lineWidth = w2; g.beginPath(); rio.forEach((q, k) => { const s = P(...q); k ? g.lineTo(...s) : g.moveTo(s[0] + 10, s[1] - 26); }); const u = P(...rio[rio.length - 1]); g.lineTo(u[0] - 14, u[1] + 26); g.stroke(); };
  trazo(26, FR.azul); trazo(16, FR.agua, .9); g.restore(); g.globalAlpha = 1;
  // Caminos.
  pintarCaminos(g);
  texturaYeso(g, x0, y0, w, h, .4);
  SUELO = { cv, x0, y0, E };
}
function pintarCaminos(g) {
  const E = ERAS[est.era], hechos = new Set();
  const capa = (ancho, col, al, dash) => {
    g.save(); g.globalAlpha = al; g.strokeStyle = col; g.lineWidth = ancho; g.lineCap = 'round'; g.lineJoin = 'round'; if (dash) g.setLineDash(dash);
    for (const k of est.caminos) {
      const [a, b] = k.split('|').map(Number), pa = puntoCasilla(a), pb = puntoCasilla(b), m = [(pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2];
      g.beginPath(); g.moveTo(...P(...pa)); g.quadraticCurveTo(...P(...m), ...P(...pb)); g.stroke();
    }
    g.restore();
  };
  capa(E.ancho + 2, E.borde, .45); capa(E.ancho, E.color, 1);
  if (est.era === 'empedrado') { g.save(); g.fillStyle = shade(E.color, -.25); for (const k of est.caminos) { const [a, b] = k.split('|').map(Number), pa = P(...puntoCasilla(a)), pb = P(...puntoCasilla(b)), R = mulberry(a * 31 + b); for (let s = 0; s < 14; s++) { const t = R(); g.globalAlpha = .55; g.beginPath(); g.ellipse(pa[0] + (pb[0] - pa[0]) * t + (R() - .5) * 5, pa[1] + (pb[1] - pa[1]) * t + (R() - .5) * 3, 1.1, .7, 0, 0, Math.PI * 2); g.fill(); } } g.restore(); }
  if (est.era === 'carretera') capa(.9, FR.ocre, .9, [4, 4]);
  if (est.era === 'herradura') { g.save(); g.fillStyle = FR.siena; for (const k of est.caminos) { const [a, b] = k.split('|').map(Number), pa = P(...puntoCasilla(a)), pb = P(...puntoCasilla(b)); for (let s = 1; s < 6; s++) { const t = s / 6; g.globalAlpha = .3; g.beginPath(); g.arc(pa[0] + (pb[0] - pa[0]) * t, pa[1] + (pb[1] - pa[1]) * t, .7, 0, Math.PI * 2); g.fill(); } } g.restore(); }
  // Puentes sobre el río.
  for (const k of est.caminos) for (const i of k.split('|').map(Number)) {
    if (tipo(i) !== 'R' || hechos.has(i)) continue; hechos.add(i);
    const p = P(...puntoCasilla(i)), V = vecinosCamino(i).map(j => P(...puntoCasilla(j)));
    if (V.length < 2) continue;
    const a = [(p[0] + V[0][0]) / 2, (p[1] + V[0][1]) / 2], b = [(p[0] + V[1][0]) / 2, (p[1] + V[1][1]) / 2];
    g.save(); g.lineCap = 'round'; g.strokeStyle = FR.siena; g.lineWidth = E.ancho + 5; g.globalAlpha = .5; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke();
    g.globalAlpha = 1; g.strokeStyle = est.era === 'herradura' ? FR.sienaClara : FR.cal; g.lineWidth = E.ancho + 3; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke();
    g.strokeStyle = E.color; g.lineWidth = E.ancho - 1; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); g.restore();
  }
}

// Objetos: obras, árboles y caminantes.
const SPR = {};
function sprite(k) {
  if (SPR[k]) return SPR[k];
  const E = 3, c = lienzo(70 * E, 70 * E), g = c.getContext('2d'); g.translate(35 * E, 50 * E); g.scale(E, E);
  const r = mulberry(k.length * 13);
  if (k === 'a') templo(g, r, { col: FR.rojo, emblema: 'balanza', w: .8, d: .7, h: 18 }); else casa(g, r, { zocalo: [FR.azul, FR.rojo, FR.verde, FR.ocre][k.charCodeAt(1) % 4 || 0] });
  return (SPR[k] = { c, ax: 35, ay: 50, w: 70, h: 70 });
}
const caminantes = Array.from({ length: 7 }, (_, k) => ({ t: ['campesino', 'campesina', 'artesano', 'elite', 'nino'][k % 5], vi: k % 3, de: -1, a: -1, u: 0, vel: .5 + (k % 3) * .12 }));
function moverCaminantes(dt) {
  const nodos = [...new Set([...est.caminos].flatMap(k => k.split('|').map(Number)))];
  for (const w of caminantes) {
    if (!nodos.length) { w.de = -1; continue; }
    if (w.de < 0 || !nodos.includes(w.de)) { w.de = nodos[Math.floor(Math.random() * nodos.length)]; w.a = -1; w.u = 0; }
    if (w.a < 0) { const V = vecinosCamino(w.de); if (!V.length) { w.de = -1; continue; } w.a = V[Math.floor(Math.random() * V.length)]; w.u = 0; }
    if (!est.caminos.has(clave(w.de, w.a))) { w.de = -1; continue; }
    w.u += dt * w.vel; if (w.u >= 1) { w.de = w.a; w.a = -1; w.u = 0; }
  }
}

function dibujar(cv, t, dt) {
  const W = cv.clientWidth, H = cv.clientHeight; if (cv.width !== Math.round(W * DPR)) { cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); }
  const g = cv.getContext('2d'), ancho = P(0, N)[0] - P(N, 0)[0] + 40, arriba = P(0, 0)[1] - 50, abajo = P(N, N)[1] + 30;
  const esc = Math.min(W / ancho, H / (abajo - arriba)); cv.esc = esc; cv.off = [W / 2, H / 2 - (arriba + abajo) / 2 * esc];
  g.setTransform(DPR * esc, 0, 0, DPR * esc, DPR * cv.off[0], DPR * cv.off[1]);
  g.clearRect(-3000, -3000, 6000, 6000);
  g.drawImage(SUELO.cv, SUELO.x0, SUELO.y0, SUELO.cv.width / SUELO.E, SUELO.cv.height / SUELO.E);
  // Ruta en vista previa y casilla de inicio.
  if (est.inicio !== null) { const [r, c] = rc(est.inicio); g.save(); g.strokeStyle = FR.rojo; g.lineWidth = 2.2; poly(g, [P(r, c), P(r, c + 1), P(r + 1, c + 1), P(r + 1, c)]); g.stroke(); g.restore(); }
  if (est.ruta) { g.save(); g.strokeStyle = FR.rojo; g.lineWidth = 3; g.setLineDash([5, 4]); g.lineCap = 'round'; g.beginPath(); est.ruta.forEach((i, k) => { const p = P(...puntoCasilla(i)); k ? g.lineTo(...p) : g.moveTo(...p); }); g.stroke(); g.restore(); }
  const L = [];
  for (const [k, o] of Object.entries(OBRAS)) { const [r, c] = k.split(',').map(Number); L.push({ r: r + .5, c: c + .5, prof: r + c + 1, s: sprite(o === 'a' ? 'a' : 'c' + ((r + c) % 4)) }); }
  for (const [r, c, k] of ARBOLES) L.push({ r, c, prof: r + c, flora: k });
  for (const w of caminantes) {
    if (w.de < 0 || w.a < 0) continue;
    const pa = puntoCasilla(w.de), pb = puntoCasilla(w.a), r = pa[0] + (pb[0] - pa[0]) * w.u, c = pa[1] + (pb[1] - pa[1]) * w.u, dr = pb[0] - pa[0], dc = pb[1] - pa[1];
    L.push({ r, c, prof: r + c + .02, gente: `${w.t}_${w.vi}_${dr + dc > 0 ? 1 : 0}_${quieto ? 0 : Math.floor(t / 150 + w.vel * 10) % 4}`, izq: dc - dr < 0 });
  }
  L.sort((a, b) => a.prof - b.prof);
  for (const o of L) {
    const [x, y] = P(o.r, o.c);
    if (o.gente) { const m = GENTE.marcos[o.gente], E = GENTE.escala; g.save(); g.translate(x, y); if (o.izq) g.scale(-1, 1); g.drawImage(GENTE.canvas, m.x, m.y, m.w, m.h, -m.ax / E * .8, -m.ay / E * .8, m.w / E * .8, m.h / E * .8); g.restore(); }
    else if (o.flora) { const m = FLORA.marcos[o.flora], E = FLORA.escala; g.drawImage(FLORA.canvas, m.x, m.y, m.w, m.h, x - m.ax / E, y - m.ay / E, m.w / E, m.h / E); }
    else g.drawImage(o.s.c, x - o.s.ax, y - o.s.ay, o.s.w, o.s.h);
  }
}

// ---------- Interacción ----------
const cv = document.getElementById('mapa'), info = document.getElementById('info'), bOk = document.getElementById('ok'), bNo = document.getElementById('no');
function casillaEn(ev) {
  const b = cv.getBoundingClientRect(), x = (ev.clientX - b.left - cv.off[0]) / cv.esc, y = (ev.clientY - b.top - cv.off[1]) / cv.esc;
  const c = (y / 16 + x / 32) / 2, r = (y / 16 - x / 32) / 2;
  return r >= 0 && c >= 0 && r < N && c < N ? idx(Math.floor(r), Math.floor(c)) : null;
}
function mostrar() {
  const E = ERAS[est.era];
  if (est.ruta) { const k = costoRuta(est.ruta); info.innerHTML = `<b>${E.nombre}</b>: ${est.ruta.length - 1} tramos · <b>${k.oro} de oro</b>${k.puentes ? ` · ${k.puentes} puente${k.puentes > 1 ? 's' : ''}` : ''}${k.tala ? ` · tala ${k.tala} casilla${k.tala > 1 ? 's' : ''} de bosque` : ''}.`; }
  else if (est.quitar) info.textContent = 'Toca una casilla con camino para quitar los tramos que pasan por ella.';
  else if (est.inicio !== null) info.textContent = 'Ahora toca la casilla de destino.';
  else info.textContent = 'Toca la casilla donde empieza el camino.';
  bOk.hidden = bNo.hidden = !est.ruta;
}
cv.addEventListener('pointerup', ev => {
  const i = casillaEn(ev); if (i === null) return;
  if (est.quitar) { for (const k of [...est.caminos]) if (k.split('|').map(Number).includes(i)) est.caminos.delete(k); pintarSuelo(); mostrar(); return; }
  if (tipo(i) === 'M') { info.textContent = 'Por la montaña no pasa el camino: elige otra casilla.'; return; }
  if (est.inicio === null || est.ruta) { est.inicio = i; est.ruta = null; }
  else if (i !== est.inicio) { est.ruta = trazar(est.inicio, i); if (!est.ruta) info.textContent = 'No hay ruta posible.'; }
  mostrar();
});
bOk.onclick = () => { for (let k = 1; k < est.ruta.length; k++) est.caminos.add(clave(est.ruta[k - 1], est.ruta[k])); est.ruta = null; est.inicio = null; pintarSuelo(); mostrar(); };
bNo.onclick = () => { est.ruta = null; est.inicio = null; mostrar(); };
document.querySelectorAll('[data-era]').forEach(b => b.onclick = () => { est.era = b.dataset.era; document.querySelectorAll('[data-era]').forEach(x => x.classList.toggle('on', x === b)); pintarSuelo(); mostrar(); });
document.getElementById('quitar').onclick = e => { est.quitar = !est.quitar; est.inicio = null; est.ruta = null; e.target.classList.toggle('on', est.quitar); mostrar(); };

// Un camino de ejemplo para empezar: del ágora al río y a las casas del otro lado.
for (const [a, b] of [[[3, 3], [3, 4]], [[3, 4], [3, 5]], [[3, 5], [3, 6]], [[3, 6], [3, 7]], [[3, 7], [3, 8]], [[3, 8], [2, 8]], [[3, 3], [4, 3]], [[4, 3], [4, 4]], [[4, 3], [4, 2]]]) est.caminos.add(clave(idx(...a), idx(...b)));
pintarSuelo(); mostrar();
let ult = performance.now();
function bucle(t) { const dt = Math.min(.05, (t - ult) / 1000); ult = t; if (!quieto) moverCaminantes(dt); else moverCaminantes(0); dibujar(cv, t, dt); requestAnimationFrame(bucle); }
requestAnimationFrame(bucle);
