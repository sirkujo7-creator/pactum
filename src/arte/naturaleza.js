// Naturaleza: árboles, guadua, frailejones, animales. Se hornea una vez en una hoja (atlas) y el mapa solo coloca
// copias. Fase 8: las plantas son las del fresco (src/arte/flora.js): menos, más pequeñas y estilizadas.
// Fase 9: los animales, piedras y troncos también (src/arte/fauna.js).
import { mulberry, lienzo } from './acuarela.js';
import { recetasFlora } from './flora.js';
import { recetasFauna } from './fauna.js';
import { RES_HOJA } from './fresco.js';

const ESCALA = RES_HOJA; // resolución del horneado (fase 8: 3 en celulares, 4 en computador)
// Pedido de Juan (13 de octubre): que los árboles no sean una sola copia. Cada especie se hornea en tres versiones:
// la original, una más alta y angosta y otra más ancha y baja, cada una con su propio pincel (hojas y ramas en
// otro lugar). La sombra sigue cayendo a la derecha (un solo sol), por eso no se voltean en espejo.
export const VARIANTES = new Set(['arbol', 'saman', 'ceiba', 'guayacan', 'ocobo', 'cambulo', 'yarumo', 'mango', 'arbolNiebla', 'palma', 'guadua', 'platano', 'frailejon', 'cardon', 'arbusto']);
const FORMAS = { _va: [.88, 1.1, -.05], _vb: [1.12, .9, .04] }; // ancho, alto, inclinación
// Pasto y hierbas al pie del tronco, pintados encima de la base: el árbol queda enraizado en el suelo.
const SIN_PIE = new Set(['arbusto', 'frailejon', 'cardon']);
function pie(g, R, ancho, seco) {
  const cols = seco ? ['#8E8A4E', '#A89A5E', '#B8A86A'] : ['#4E7A3A', '#6E9A4A', '#5E8B42'];
  g.save(); g.lineCap = 'round';
  for (let j = 0; j < 16; j++) { const x = (R() - .5) * ancho, y = (R() - .4) * ancho * .28, L = 1.2 + R() * 2.2; g.strokeStyle = cols[j % 3]; g.lineWidth = .5; g.globalAlpha = .85; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + (R() - .5) * 1.4, y - L * .6, x + (R() - .5) * 2, y - L); g.stroke(); }
  for (let j = 0; j < 4; j++) { g.fillStyle = cols[(j + 1) % 3]; g.globalAlpha = .9; g.beginPath(); g.ellipse((R() - .5) * ancho * .8, (R() - .3) * 1.2, .9 + R() * .8, .5 + R() * .4, 0, 0, 7); g.fill(); }
  g.restore();
}
function conVariantes(lista, seco) {
  const out = [];
  for (const r of lista) {
    const [k, w, h, ax, ay, f] = r;
    if (!VARIANTES.has(k)) { out.push(r); continue; }
    const ancho = k === 'guadua' ? 10 : k === 'saman' || k === 'ceiba' ? 7 : 5, base = (g, R) => { f(g, R); if (!SIN_PIE.has(k)) pie(g, R, ancho, seco > .5); };
    out.push([k, w, h, ax, ay, base]);
    for (const [suf, [sx, sy, sk]] of Object.entries(FORMAS)) out.push([k + suf, Math.ceil(w * 1.2), Math.ceil(h * 1.15), ax * 1.15, ay * 1.12, (g, R) => { g.save(); g.transform(sx, 0, sk, sy, 0, 0); f(g, R); g.restore(); if (!SIN_PIE.has(k)) pie(g, R, ancho * sx, seco > .5); }]);
  }
  return out;
}
// Variante y tono de cada planta: el mismo árbol nunca se ve dos veces igual.
const TONOS = [0xFFFFFF, 0xF3F7EA, 0xFBF7EC, 0xEEF3E4, 0xF7F2E2];
export function variar(o, R) { if (VARIANTES.has(o.k)) { o.v = ['', '_va', '_vb'][Math.floor(R() * 3)]; o.tn = TONOS[Math.floor(R() * TONOS.length)]; } return o; }

// Hornea todas las figuras en una sola hoja. Devuelve { canvas, marcos: {clave: {x, y, w, h, ax, ay}}, escala }.
const HOJAS = {};
export function hornearNaturaleza(dry = 0) {
  const clave = Math.round(dry * 10) / 10;
  if (HOJAS[clave]) return HOJAS[clave];
  dry = clave;
  // Fase 8: las plantas vienen del fresco; fase 9: también los animales, piedras y troncos quemados.
  const lista = [...conVariantes(recetasFlora(dry), dry), ...recetasFauna()], sep = 4, anchoHoja = 2048;
  const marcos = {};
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
    const b = k.replace(/\d+$/, ''); // los cuadros de una misma animación (perro0, perro1...) con el mismo pincel: sin temblor
    pintar(g, mulberry(b.length * 97 + b.charCodeAt(0) * 13 + (b.charCodeAt(b.length - 1) || 0)));
    g.restore();
  }
  return (HOJAS[clave] = { canvas: cv, marcos, escala: ESCALA });
}

// Qué crece en cada casilla según su entorno. Solo en casillas libres; el bosque lógico
// (bosque de niebla) es denso, y si se tala queda sin árboles.
export function colocarNaturaleza(T, mapa) {
  const objs = [];
  for (const t of T.tiles) {
    const i = t.r * T.N + t.c, m = mapa[i];
    if (m.b) continue;
    if (t.b === 'niebla' && m.t !== 'bosque') continue;
    if (t.d < 1.05) continue; // pegado al río: nada de árboles encima del agua
    const R = mulberry(T.seed * 7 + i * 131 + 9), p = R();
    const add = (k, n, sc = 1) => { for (let j = 0; j < n; j++) { const o = variar({ k, i, r: t.r + .15 + R() * .7, c: t.c + .15 + R() * .7, s: sc * (.78 + R() * .44) }, R); objs.push(o); } };
    // Renovación colonial: la vegetación va en grupos. Un ruido del mundo marca manchones que cruzan varias
    // casillas: guaduales a lo largo del agua y palmas de cera en manchones de la ladera y el bosque de niebla.
    const guadual = t.d < 3.5 && T.vary(t.c / 2.4 + 300, t.r / 2.4 + 300) > .56;
    const palmar = T.vary(t.c / 2.8 + 150, t.r / 2.8 + 520) > .7;
    // Grupo natural: a lo largo de una línea torcida (como crece la guadua junto al agua), de tamaños distintos —uno
    // grande, otros medianos y algún retoño— y con matorral entre las matas.
    const grupo = (k, n, sc = 1) => {
      const cr = t.r + .3 + R() * .4, cc = t.c + .3 + R() * .4, an = R() * Math.PI, L = .5 + R() * .25;
      for (let j = 0; j < n; j++) { const u = n > 1 ? j / (n - 1) - .5 : 0, tam = j === 0 ? 1.1 : j === n - 1 && n > 2 ? .55 : .75 + R() * .3; objs.push(variar({ k, i, r: cr + Math.sin(an) * u * L + (R() - .5) * .14, c: cc + Math.cos(an) * u * L + (R() - .5) * .14, s: sc * tam * (.9 + R() * .2) }, R)); }
    };
    // Biodiversidad del Tolima por piso térmico (6 de octubre): cada entorno con sus árboles y sus animales.
    const q = R();
    switch (t.b) {
      case 'galeria': if (guadual) grupo('guadua', 3 + (p < .4 ? 1 : 0)); else if (p < .14) add('ceiba', 1, .95); else if (p < .3) add('arbol', 1); else if (p < .4) add('mango', 1); else if (p < .44) grupo('pato', 2); break;
      case 'seco': if (p < .2) add('saman', 1); else if (p < .3) add('guayacan', 1, .9); else if (p < .45) add(T.terr && T.terr.cardones ? 'cardon' : 'arbusto', 1); else if (T.terr && T.terr.cardones && p < .55) add('cardon', 1, .85); else if (p > .9) add('chivo', 1); break; // fase 14: cardones en el sur seco
      case 'potrero': if (p < .05) add(T.terr && T.terr.palmas ? 'palma' : 'saman', 1); else if (p < .08) add('guayacan', 1, .9); else if (p < .25) add(q < .45 ? 'cebu' : 'vaca', 1); else if (p < .29) add('caballo', 1); else if (guadual && p < .4) grupo('guadua', 2 + (q < .4 ? 1 : 0)); break; // fase 14: palmas en el valle
      case 'arrozal': if (p < .15) add('garza', 1); break;
      case 'ladera': if (palmar) grupo('palma', p < .5 ? 2 : 1); else if (guadual) grupo('guadua', 2 + (q < .5 ? 1 : 0)); else if (p < .12) add('platano', 1); else if (p < .17) add('cambulo', 1); else if (p < .22) add('arbol', 1, .9); else if (p < .26) add('yarumo', 1); else if (p < .29) add('ocobo', 1, .9); break;
      case 'niebla': add('arbolNiebla', p < .5 ? 2 : 1); if (palmar) grupo('palma', 2, 1.1); else if (q < .25) add('yarumo', 1, 1.05); break;
      case 'paramo': if (p < .65) grupo('frailejon', p < .35 ? 3 : 2, .95); if (p > .9) add('piedra', 1); break;
      case 'roca': if (p < .35) add('piedra', 1); break;
    }
  }
  return objs;
}

// Bosque que vuelve a crecer (fase 1) en casillas que no eran bosque de niebla: árboles de su piso térmico.
export function arbolesDeBosque(T, i) {
  const t = T.tiles[i], R = mulberry(T.seed * 11 + i * 173 + 5), alto = t.h > 4.4, objs = [];
  const add = (k, sc = 1) => objs.push(variar({ k, i, r: t.r + .15 + R() * .7, c: t.c + .15 + R() * .7, s: sc * (.8 + R() * .4) }, R));
  for (let j = 0, n = R() < .5 ? 2 : 1; j < n; j++) add(alto ? 'arbolNiebla' : ['arbol', 'mango', 'cambulo'][Math.floor(R() * 3)], alto ? 1 : .95);
  if (!alto && R() < .3) add('guadua');
  return objs;
}
// Troncos quemados de una casilla tras un incendio.
export function toconesDe(T, i) {
  const t = T.tiles[i], R = mulberry(T.seed * 5 + i * 97 + 3), objs = [];
  for (let j = 0, n = 2 + Math.floor(R() * 3); j < n; j++) objs.push({ k: 'tocon', i, r: t.r + .15 + R() * .7, c: t.c + .15 + R() * .7, s: .8 + R() * .4 });
  return objs;
}
