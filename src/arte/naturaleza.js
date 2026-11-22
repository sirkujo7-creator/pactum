// Naturaleza: árboles, guadua, frailejones, animales. Se hornea una vez en una hoja (atlas) y el mapa solo coloca
// copias. Fase 8: las plantas son las del fresco (src/arte/flora.js): menos, más pequeñas y estilizadas.
// Fase 9: los animales, piedras y troncos también (src/arte/fauna.js).
import { mulberry, lienzo } from './acuarela.js';
import { recetasFlora } from './flora.js';
import { recetasFauna } from './fauna.js';
import { RES_HOJA, ES_CELULAR } from './fresco.js';
import { enAgua } from './aguas.js';

const ESCALA = RES_HOJA;
// Un solo sol, arriba a la izquierda: la sombra de algo de alto h cae h·x a la derecha y h·y hacia abajo.
export const SOMBRA = { x: .42, y: .3, a: .72, color: 'rgb(30,38,20)' }; // resolución del horneado (fase 8: 3 en celulares, 4 en computador)
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
  // Sombra proyectada (pedido de Juan: sombras coherentes): cada planta proyecta su propia silueta en el suelo,
  // hacia abajo a la derecha (el sol está arriba a la izquierda), pegada a su base. El marco se ensancha para que
  // la sombra larga no se corte.
  const plantas = conVariantes(recetasFlora(dry), dry).map(([k, w, h, ax, ay, f]) => [k, Math.ceil(w + ay * SOMBRA.x + 3), Math.ceil(h + ay * SOMBRA.y + 3), ax, ay, f, true]);
  const lista = [...plantas, ...recetasFauna()], sep = 4, anchoHoja = 2048;
  const marcos = {};
  let x = sep, y = sep, fila = 0;
  for (const [k, w, h, ax, ay] of lista) {
    const W = Math.ceil(w * ESCALA), H = Math.ceil(h * ESCALA);
    if (x + W > anchoHoja) { x = sep; y += fila + sep; fila = 0; }
    marcos[k] = { x, y, w: W, h: H, ax: ax * ESCALA, ay: ay * ESCALA };
    x += W + sep; fila = Math.max(fila, H);
  }
  const cv = lienzo(anchoHoja, y + fila + sep), g = cv.getContext('2d');
  const tmp = lienzo(8, 8), tg = tmp.getContext('2d');
  for (const [k, , , , , pintar, planta] of lista) {
    const m = marcos[k];
    const b = k.replace(/\d+$/, ''), semilla = b.length * 97 + b.charCodeAt(0) * 13 + (b.charCodeAt(b.length - 1) || 0); // los cuadros de una misma animación (perro0, perro1...) con el mismo pincel: sin temblor
    if (planta) {
      // Silueta de la planta (mismo pincel, misma semilla) y luego su proyección inclinada y aplastada.
      tmp.width = m.w; tmp.height = m.h; tg.setTransform(1, 0, 0, 1, 0, 0); tg.clearRect(0, 0, m.w, m.h);
      tg.save(); tg.translate(m.ax, m.ay); tg.scale(ESCALA, ESCALA); pintar(tg, mulberry(semilla)); tg.restore();
      tg.globalCompositeOperation = 'source-in'; tg.fillStyle = SOMBRA.color; tg.fillRect(0, 0, m.w, m.h); tg.globalCompositeOperation = 'source-over';
      g.save(); g.beginPath(); g.rect(m.x, m.y, m.w, m.h); g.clip();
      g.translate(m.x + m.ax, m.y + m.ay); g.transform(1, 0, -SOMBRA.x, -SOMBRA.y, 0, 0);
      // Borde suave: varias copias apenas corridas (sin filtros, que no todos los celulares tienen).
      for (const [dx, dy, al] of [[0, 0, SOMBRA.a * .55], [-.8, 0, SOMBRA.a * .2], [.8, 0, SOMBRA.a * .2], [0, -1.2, SOMBRA.a * .2]]) { g.globalAlpha = al; g.drawImage(tmp, -m.ax + dx * ESCALA, -m.ay + dy * ESCALA); }
      g.restore();
    }
    g.save(); g.translate(m.x + m.ax, m.y + m.ay); g.scale(ESCALA, ESCALA);
    pintar(g, mulberry(semilla));
    g.restore();
  }
  return (HOJAS[clave] = { canvas: cv, marcos, escala: ESCALA });
}

// Qué crece en cada casilla según su entorno. Solo en casillas libres; el bosque lógico
// (bosque de niebla) es denso, y si se tala queda sin árboles.
// Pulido visual (pedido de Juan): árboles del tamaño que corresponde junto a las casas (un árbol común algo más alto
// que una casa, la ceiba y el samán grandes, la palma de cera la más alta) y vegetación agrupada según la geografía.
export const TAM = { arbol: 1.35, mango: 1.4, saman: 1.6, ceiba: 1.75, guayacan: 1.45, ocobo: 1.45, cambulo: 1.45, yarumo: 1.35, arbolNiebla: 1.4, palma: 1.55, guadua: 1.0, platano: 1.25, cardon: 1.15, arbusto: 1.1, frailejon: 1 };
const RADIO = { ceiba: .34, saman: .36, mango: .27, arbol: .25, guayacan: .24, ocobo: .24, cambulo: .24, yarumo: .2, arbolNiebla: .22, palma: .18, platano: .2, cardon: .16, arbusto: .16, frailejon: .15, guadua: .3 };
const elegir = (R, tabla) => { let q = R(); for (const [k, w] of tabla) { if ((q -= w) <= 0) return k; } return tabla[tabla.length - 1][0]; };
export function colocarNaturaleza(T, mapa) {
  const objs = [], suave = x => x * x * (3 - 2 * x), cl = x => Math.max(0, Math.min(1, x));
  for (const t of T.tiles) {
    const i = t.r * T.N + t.c, m = mapa[i];
    if (m.b) continue;
    if (t.b === 'niebla' && m.t !== 'bosque') continue;
    if (t.d < 1.05) continue; // pegado al río: nada de árboles encima del agua
    const R = mulberry(T.seed * 7 + i * 131 + 9), p = R(), q = R();
    const add = (k, n, sc = 1) => { for (let j = 0; j < n; j++) objs.push(variar({ k, i, r: t.r + .15 + R() * .7, c: t.c + .15 + R() * .7, s: sc * (.78 + R() * .44) }, R)); };
    // Manchas de vegetación del mundo (a dos escalas): bosques que cruzan varias casillas y claros abiertos.
    const nG = T.vary(t.c / 3.2 + 40, t.r / 3.2 + 910), nM = T.vary(t.c / 1.3 + 77, t.r / 1.3 + 5), mancha = .7 * nG + .3 * nM;
    const nS = T.vary(t.c / 2.4 + 300, t.r / 2.4 + 300), palmar = T.vary(t.c / 2.8 + 150, t.r / 2.8 + 520) > .66;
    // Densidad (0 a 1) y máximo de árboles por casilla según el entorno: galería pegada al río, laderas con bosques
    // en manchas (más en lo empinado), niebla tupida, bosque seco en rodales, potreros abiertos con bosquecitos.
    let D = 0, max = 0, especie = null;
    switch (t.b) {
      case 'galeria': D = cl(1.3 - t.d / 2.6) * (.7 + .3 * nM); max = 5; especie = nS > .52 ? 'guadua' : () => elegir(R, [['arbol', .4], ['mango', .26], ['ceiba', .14], ['yarumo', .1], ['cambulo', .05], ['platano', .05]]); break;
      case 'ladera': D = suave(cl((mancha - .4) / .26)) * (.65 + .35 * cl(t.slope / 1.2)); max = 5; especie = palmar ? 'palma' : t.d < 3.5 && nS > .56 ? 'guadua' : () => elegir(R, [['arbol', .5], ['mango', .16], ['yarumo', .1], ['platano', .1], ['cambulo', .06], ['ocobo', .05], ['guayacan', .03]]); break;
      case 'niebla': D = .6 + .4 * nM; max = 4; especie = palmar ? () => (R() < .45 ? 'palma' : 'arbolNiebla') : () => (R() < .9 ? 'arbolNiebla' : 'yarumo'); break;
      case 'seco': D = suave(cl((mancha - .48) / .24)) * .85; max = 4; especie = () => elegir(R, [['saman', .36], ['guayacan', .12], ['arbol', .12], [T.terr && T.terr.cardones ? 'cardon' : 'arbusto', .4]]); break;
      case 'potrero': D = suave(cl((mancha - .66) / .16)) * .8; max = 4; especie = () => elegir(R, [[T.terr && T.terr.palmas ? 'palma' : 'saman', .4], ['guayacan', .1], ['arbol', .5]]); break;
      case 'paramo': D = suave(cl((mancha - .3) / .3)); max = 4; especie = 'frailejon'; break;
    }
    let n = Math.floor(D * max * (ES_CELULAR ? .75 : 1) + R() * .8); // en celular, un cuarto menos de árboles (rendimiento)
    if (t.b === 'potrero' && !n && p < .07) n = 1; // árbol suelto en el potrero, para la sombra del ganado
    if (n > 0 && especie === 'guadua') { // guadual: matas en grupo a lo largo de una línea torcida
      const grupos = Math.max(1, Math.round(n / 2.5));
      for (let gq = 0; gq < grupos; gq++) {
        const cr = t.r + .25 + R() * .5, cc = t.c + .25 + R() * .5, an = R() * Math.PI, L = .5 + R() * .25, k = 3 + (R() < .4 ? 1 : 0);
        for (let j = 0; j < k; j++) { const u = j / (k - 1) - .5, tam = j === 0 ? 1.1 : j === k - 1 && k > 2 ? .55 : .75 + R() * .3, r = cr + Math.sin(an) * u * L + (R() - .5) * .14, c = cc + Math.cos(an) * u * L + (R() - .5) * .14; if (!enAgua(T, r, c, .12)) objs.push(variar({ k: 'guadua', i, r, c, s: TAM.guadua * tam * (.9 + R() * .2) }, R)); }
      }
    } else if (n > 0) {
      // Árboles repartidos sin encimarse (cada especie con su espacio), de tamaños distintos.
      const puestos = [];
      for (let j = 0, intentos = 0; j < n && intentos < n * 10; intentos++) {
        const k = typeof especie === 'function' ? especie() : especie, r = t.r + .1 + R() * .8, c = t.c + .1 + R() * .8, rad = RADIO[k] || .2;
        if (puestos.some(o => Math.hypot(o.r - r, o.c - c) < (rad + o.rad) * .8) || enAgua(T, r, c, .15)) continue; // ni encimados ni en el agua
        puestos.push({ r, c, rad }); j++;
        const joven = R() < .22;
        objs.push(variar({ k, i, r, c, s: TAM[k] * (joven ? .6 + R() * .2 : .85 + R() * .3) }, R));
      }
    }
    // Animales y piedras, como antes.
    switch (t.b) {
      case 'galeria': if (q < .06) add('pato', 2); break;
      case 'seco': if (q > .9) add('chivo', 1); break;
      case 'potrero': if (q < .17) add(R() < .45 ? 'cebu' : 'vaca', 1); else if (q < .21) add('caballo', 1); break;
      case 'arrozal': if (q < .15) add('garza', 1); break;
      case 'paramo': if (q > .9) add('piedra', 1); break;
      case 'roca': if (q < .35) add('piedra', 1); break;
    }
  }
  return objs;
}
export function arbolesDeBosque(T, i) {
  const t = T.tiles[i], R = mulberry(T.seed * 11 + i * 173 + 5), alto = t.h > 4.4, objs = [];
  const add = (k, sc = 1) => objs.push(variar({ k, i, r: t.r + .15 + R() * .7, c: t.c + .15 + R() * .7, s: sc * (TAM[k] || 1) * (.8 + R() * .4) }, R));
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
