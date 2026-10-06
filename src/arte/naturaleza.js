// Naturaleza: árboles, guadua, frailejones, animales. Se hornea una vez en una hoja (atlas) y el mapa solo coloca
// copias. Fase 8: las plantas son las del fresco (src/arte/flora.js): menos, más pequeñas y estilizadas.
// Fase 9: los animales, piedras y troncos también (src/arte/fauna.js).
import { mulberry, lienzo } from './acuarela.js';
import { recetasFlora } from './flora.js';
import { recetasFauna } from './fauna.js';
import { RES_HOJA } from './fresco.js';

const ESCALA = RES_HOJA; // resolución del horneado (fase 8: 3 en celulares, 4 en computador)

// Hornea todas las figuras en una sola hoja. Devuelve { canvas, marcos: {clave: {x, y, w, h, ax, ay}}, escala }.
const HOJAS = {};
export function hornearNaturaleza(dry = 0) {
  const clave = Math.round(dry * 10) / 10;
  if (HOJAS[clave]) return HOJAS[clave];
  dry = clave;
  // Fase 8: las plantas vienen del fresco; fase 9: también los animales, piedras y troncos quemados.
  const lista = [...recetasFlora(dry), ...recetasFauna()], sep = 4, anchoHoja = 2048;
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
    const add = (k, n, sc = 1) => { for (let j = 0; j < n; j++) objs.push({ k, i, r: t.r + .15 + R() * .7, c: t.c + .15 + R() * .7, s: sc * (.85 + R() * .3) }); };
    // Renovación colonial: la vegetación va en grupos. Un ruido del mundo marca manchones que cruzan varias
    // casillas: guaduales a lo largo del agua y palmas de cera en manchones de la ladera y el bosque de niebla.
    const guadual = t.d < 3.5 && T.vary(t.c / 2.4 + 300, t.r / 2.4 + 300) > .56;
    const palmar = T.vary(t.c / 2.8 + 150, t.r / 2.8 + 520) > .7;
    const grupo = (k, n, sc = 1) => { const cr = t.r + .3 + R() * .4, cc = t.c + .3 + R() * .4; for (let j = 0; j < n; j++) objs.push({ k, i, r: cr + (R() - .5) * .45, c: cc + (R() - .5) * .45, s: sc * (.8 + R() * .35) }); };
    switch (t.b) {
      case 'galeria': if (guadual) grupo('guadua', 2 + (p < .4 ? 1 : 0)); else if (p < .45) add('arbol', 1); break;
      case 'seco': if (p < .28) add('saman', 1); else if (p < .45) add(T.terr && T.terr.cardones ? 'cardon' : 'arbusto', 1); else if (T.terr && T.terr.cardones && p < .55) add('cardon', 1, .85); break; // fase 14: cardones en el sur seco
      case 'potrero': if (p < .07) add(T.terr && T.terr.palmas ? 'palma' : 'arbol', 1); else if (p < .25) add('vaca', 1); else if (guadual && p < .4) grupo('guadua', 2); break; // fase 14: palmas en el valle
      case 'arrozal': if (p < .15) add('garza', 1); break;
      case 'ladera': if (palmar) grupo('palma', p < .5 ? 2 : 1); else if (guadual) grupo('guadua', 2); else if (p < .14) add('platano', 1); else if (p < .24) add('arbol', 1, .9); break;
      case 'niebla': add('arbolNiebla', p < .5 ? 2 : 1); if (palmar) grupo('palma', 2, 1.1); break;
      case 'paramo': if (p < .6) add('frailejon', p < .3 ? 2 : 1); if (p > .9) add('piedra', 1); break;
      case 'roca': if (p < .35) add('piedra', 1); break;
    }
  }
  return objs;
}

// Bosque que vuelve a crecer (fase 1) en casillas que no eran bosque de niebla: árboles de su piso térmico.
export function arbolesDeBosque(T, i) {
  const t = T.tiles[i], R = mulberry(T.seed * 11 + i * 173 + 5), alto = t.h > 4.4, objs = [];
  const add = (k, sc = 1) => objs.push({ k, i, r: t.r + .15 + R() * .7, c: t.c + .15 + R() * .7, s: sc * (.85 + R() * .3) });
  for (let j = 0, n = R() < .5 ? 2 : 1; j < n; j++) add(alto ? 'arbolNiebla' : 'arbol', alto ? 1 : .95);
  if (!alto && R() < .3) add('guadua');
  return objs;
}
// Troncos quemados de una casilla tras un incendio.
export function toconesDe(T, i) {
  const t = T.tiles[i], R = mulberry(T.seed * 5 + i * 97 + 3), objs = [];
  for (let j = 0, n = 2 + Math.floor(R() * 3); j < n; j++) objs.push({ k: 'tocon', i, r: t.r + .15 + R() * .7, c: t.c + .15 + R() * .7, s: .8 + R() * .4 });
  return objs;
}
