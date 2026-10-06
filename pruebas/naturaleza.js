// Prueba de animales y vegetación del Tolima (pedido de Juan, 6 de octubre; aprobada). Ahora usa los mismos
// pinceles que el juego (src/arte/fauna.js y src/arte/flora.js): lo que se ve aquí es lo que se ve en el mapa.
// Luz siempre desde arriba a la izquierda; la sombra suave cae abajo a la derecha. Los animales andan en 12 cuadros.
import { mulberry } from '../src/arte/fresco.js';
import { PINCELES_FAUNA as A } from '../src/arte/fauna.js';
import { pincelesFlora } from '../src/arte/flora.js';

const DPR = Math.min(2.5, window.devicePixelRatio || 1);
const F = pincelesFlora(0);
const { vaca, cebu, caballo, perro, gato, cerdo, chivo, gallina, pato, garza, garzaVuela, gallinazo, gallinazoVuela, loro } = A;
const { palma: palmaCera, guadua, saman, ceiba, florido, cambulo, yarumo, mango, frailejon, cafeto, platano, cardon, arbolNiebla, arbol } = F;
const cuadro = f => Math.floor(f * 12) / 12; // los 12 cuadros del juego

const tri = f => 1 - Math.abs(1 - 2 * f); // sube y baja
const ANIMALES = [
  ['Vaca orejinegra', 'la criolla del Tolima', (g, f) => vaca(g, cuadro(f)), 2.6, true],
  ['Vaca pastando', 'baja la cabeza a comer', g => vaca(g, null, true), 2.6, false],
  ['Cebú', 'potreros del valle', (g, f) => cebu(g, cuadro(f)), 2.6, true],
  ['Caballo criollo', 'castaño, crin negra', (g, f) => caballo(g, cuadro(f)), 2.4, true],
  ['Perro criollo', 'trota por el pueblo', (g, f) => perro(g, cuadro(f)), 4, true],
  ['Perro sentado', 'descansa', g => perro(g, null, true), 4, false],
  ['Gato', 'en las casas', g => gato(g), 5, false],
  ['Cerdo', 'en los solares, barrigón', (g, f) => cerdo(g, cuadro(f)), 4, true],
  ['Chivo', 'en el sur seco', (g, f) => chivo(g, cuadro(f)), 4, true],
  ['Gallina', 'picotea', (g, f) => gallina(g, false, Math.round(tri(f) * 3) / 3), 6, true],
  ['Gallo', 'cola de plumas', (g, f) => gallina(g, true, Math.round(tri(f) * 3) / 3), 6, true],
  ['Pato criollo', 'junto al agua', (g, f) => pato(g, Math.round(tri(f) * 2) / 2), 6, true],
  ['Garza blanca', 'arrozales y potreros', (g, f) => garza(g, Math.floor(f * 8) / 8), 4.4, true],
  ['Garza en vuelo', 'aletea despacio', (g, f) => { g.translate(0, -14); garzaVuela(g, Math.floor(f * 8) / 8); }, 3.4, true],
  ['Gallinazo', 'posado', g => gallinazo(g), 5, false],
  ['Gallinazo', 'planeando en el cielo', (g, f) => { g.translate(0, -10); gallinazoVuela(g, Math.floor(f * 8) / 8); }, 4, true],
  ['Perico', 'entre las palmas', (g, f) => { g.translate(0, -8); loro(g, Math.floor(f * 6) / 6); }, 7, true]
];
const PLANTAS = [
  ['Palma de cera', 'árbol nacional, en la montaña', palmaCera, 1.6],
  ['Guadua', 'en las quebradas', guadua, 1.9],
  ['Samán', 'el valle cálido', saman, 1.8],
  ['Ceiba', 'en las plazas y el valle', ceiba, 1.7],
  ['Guayacán amarillo', 'florece en el verano', (g, R) => florido(g, R, ['#C9A02A', '#E8C23A', '#F6DE7A']), 2.4],
  ['Ocobo', 'el guayacán rosado', (g, R) => florido(g, R, ['#B8678A', '#E092B4', '#F4C2D6']), 2.4],
  ['Cámbulo', 'sombra del cafetal', cambulo, 2.3],
  ['Yarumo', 'hojas plateadas', yarumo, 2.2],
  ['Palo de mango', 'en los solares', mango, 2.4],
  ['Árbol de sombra', 'parques y plazas', arbol, 2.4],
  ['Árbol de niebla', 'con musgo y bromelias', arbolNiebla, 2],
  ['Cardón', 'el sur seco', cardon, 2.6],
  ['Frailejón', 'el páramo', frailejon, 4],
  ['Cafeto', 'con sus cerezas', cafeto, 5],
  ['Plátano', 'en las fincas', platano, 3]
];

// ---------- Tarjetas ----------
function tarjeta(cont, [nombre, nota, pintar, esc, anda], animal) {
  const fig = document.createElement('figure'), cv = document.createElement('canvas');
  fig.append(cv); fig.insertAdjacentHTML('beforeend', `<figcaption>${nombre}<small>${nota}</small></figcaption>`); cont.append(fig);
  const w = 160, h = animal ? 120 : 170; cv.width = w * DPR; cv.height = h * DPR; cv.style.aspectRatio = `${w}/${h}`;
  const g = cv.getContext('2d');
  const dibujar = f => {
    g.setTransform(DPR, 0, 0, DPR, 0, 0); g.fillStyle = '#B9C688'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#A9B97E'; g.beginPath(); g.moveTo(0, h * .62); g.lineTo(w, h * .5); g.lineTo(w, h); g.lineTo(0, h); g.fill(); // un plano de luz, como en los retratos
    g.save(); g.translate(w / 2 - (animal ? 6 : 0), h - (animal ? 22 : 16)); g.scale(esc, esc); pintar(g, animal ? f : mulberry(nombre.length * 31 + 7)); g.restore();
  };
  dibujar(0);
  if (animal && anda && !matchMedia('(prefers-reduced-motion: reduce)').matches) { let f = 0, t0 = 0; const bucle = t => { if (t - t0 > 45) { t0 = t; f = (f + 1 / 24) % 1; dibujar(f); } requestAnimationFrame(bucle); }; requestAnimationFrame(bucle); }
}

// ---------- Escena de conjunto ----------
function escena(cv) {
  const w = cv.clientWidth, h = Math.round(w * .5); cv.style.height = h + 'px'; cv.width = w * DPR; cv.height = h * DPR;
  const g = cv.getContext('2d'), R = mulberry(9);
  const fondo = () => {
    g.setTransform(DPR, 0, 0, DPR, 0, 0);
    g.fillStyle = '#C9D6DA'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#B9C4A8'; g.beginPath(); g.moveTo(0, h * .42); for (let x = 0; x <= w; x += w / 8) g.lineTo(x, h * (.36 + .05 * Math.sin(x / w * 7))); g.lineTo(w, h); g.lineTo(0, h); g.fill();
    g.fillStyle = '#A9B97E'; g.beginPath(); g.moveTo(0, h * .55); g.lineTo(w, h * .48); g.lineTo(w, h); g.lineTo(0, h); g.fill();
    g.fillStyle = '#9DAF72'; g.beginPath(); g.moveTo(0, h * .78); g.lineTo(w, h * .66); g.lineTo(w, h); g.lineTo(0, h); g.fill();
    g.fillStyle = '#7FB0C2'; g.beginPath(); g.moveTo(0, h * .92); g.quadraticCurveTo(w * .5, h * .82, w, h * .9); g.lineTo(w, h); g.lineTo(0, h); g.fill();
  };
  const s = Math.min(1.6, w / 600), plantas = [[palmaCera, .08, .58, 1.2], [ceiba, .2, .6, 1.1], [florido, .36, .62, 1.3, ['#C9A02A', '#E8C23A', '#F6DE7A']], [saman, .58, .6, 1.2], [yarumo, .76, .6, 1.2], [guadua, .9, .64, 1.2], [mango, .48, .76, 1.4], [platano, .68, .8, 1.5], [florido, .84, .8, 1.3, ['#B8678A', '#E092B4', '#F4C2D6']], [palmaCera, .3, .8, 1.3], [cafeto, .15, .86, 2.2], [cafeto, .2, .87, 2.2]];
  const bichos = [[vaca, .24, .74, 1.6, .02], [cebu, .62, .72, 1.6, -.015], [caballo, .42, .68, 1.5, .018], [perro, .55, .86, 2, .03], [cerdo, .72, .9, 2, -.02], [chivo, .1, .74, 2, .015], [(g, f) => gallina(g, false, Math.round(tri(f) * 3) / 3), .32, .9, 2.6, 0], [(g, f) => garza(g, f), .86, .9, 2.2, .01]];
  const pos = bichos.map(b => b[1]);
  let f = 0;
  const pintar = () => {
    fondo();
    const objs = [...plantas.map(p => ({ y: p[2], d: () => { g.save(); g.translate(p[1] * w, p[2] * h); g.scale(p[3] * s, p[3] * s); p[0](g, mulberry(Math.round(p[1] * 99)), p[4]); g.restore(); } })),
      ...bichos.map((b, k) => ({ y: b[2], d: () => { g.save(); g.translate(pos[k] * w, b[2] * h); g.scale((b[4] < 0 ? -1 : 1) * b[3] * s, b[3] * s); b[0](g, cuadro((f + k * .13) % 1)); g.restore(); } }))];
    objs.sort((a, b) => a.y - b.y).forEach(o => o.d());
    g.save(); g.translate(w * .55, h * .16); g.scale(1.6 * s, 1.6 * s); gallinazoVuela(g, f); g.restore();
  };
  pintar();
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let t0 = 0; const bucle = t => { if (t - t0 > 45) { t0 = t; f = (f + 1 / 24) % 1; bichos.forEach((b, k) => { pos[k] += b[4] * .03; if (pos[k] > .95 || pos[k] < .05) b[4] = -b[4]; }); pintar(); } requestAnimationFrame(bucle); };
    requestAnimationFrame(bucle);
  }
  void R;
}

function iniciar() {
  escena(document.getElementById('escena'));
  const A = document.getElementById('animales'), P = document.getElementById('plantas');
  ANIMALES.forEach(x => tarjeta(A, x, true));
  PLANTAS.forEach(([n, d, p, e]) => tarjeta(P, [n, d, p, e, false], false));
}
if (document.fonts && document.fonts.ready) document.fonts.ready.then(iniciar); else iniciar();
