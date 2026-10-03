// Retratos al fresco (fase 8), a la manera de los retratos grecorromanos de El Fayum: busto de tres cuartos dentro de
// un tondo con aro rojo pompeyano y ocre, rostro con luz desde la izquierda, ojos almendrados y contorno siena.
// Sirven para las voces del pueblo (Doña Rosa, Julián, Don Aurelio) y para los personajes con papel propio.
import { mulberry, lienzo } from './acuarela.js';
import { FR, shade, mix, pintar, ovalo, contorno, texturaYeso, urlDe } from './fresco.js';

const CACHE = {};
// spec: { fondo, piel, ropa, pelo, detalle, mujer, canas }
function pintarRetrato(g, R, rng) {
  // Tondo: fondo de muro, aro rojo y filo ocre.
  g.save(); g.beginPath(); g.arc(32, 32, 30, 0, Math.PI * 2); g.clip();
  g.fillStyle = mix(R.fondo || FR.ocreClaro, FR.yeso, .35); g.fillRect(0, 0, 64, 64);
  g.globalAlpha = .25; g.fillStyle = shade(R.fondo || FR.ocreClaro, -.25); g.beginPath(); g.ellipse(20, 18, 22, 16, .4, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1;
  // Hombros y ropa con pliegues.
  const ropa = R.ropa;
  pintar(g, [[6, 66], [9, 50], [20, 43], [32, 45], [44, 43], [55, 50], [58, 66]], ropa, rng, { n: 4, bw: .8 });
  g.save(); g.globalAlpha = .4; g.strokeStyle = shade(ropa, -.35); g.lineWidth = .8;
  [[18, 50, 16, 64], [25, 48, 24, 64], [41, 48, 43, 64]].forEach(([a, b2, c, d]) => { g.beginPath(); g.moveTo(a, b2); g.quadraticCurveTo(a - 1, (b2 + d) / 2, c, d); g.stroke(); });
  g.strokeStyle = shade(ropa, .35); g.globalAlpha = .5; g.beginPath(); g.moveTo(14, 52); g.lineTo(12, 64); g.stroke(); g.restore();
  if (R.detalle === 'cuello') pintar(g, [[28, 43], [36, 43], [35, 48], [29, 48]], FR.cal, rng, { n: 0, bw: .6 });
  if (R.detalle === 'collar') { g.save(); g.strokeStyle = FR.ocre; g.lineWidth = 1.5; g.beginPath(); g.arc(32, 43, 7, .35, Math.PI - .35); g.stroke(); g.restore(); }
  if (R.detalle === 'ruana') { pintar(g, [[8, 66], [12, 50], [32, 47], [52, 50], [56, 66]], ropa, rng, { n: 3, bw: .8 }); g.save(); g.strokeStyle = FR.ocre; g.lineWidth = 1.2; g.beginPath(); g.moveTo(12, 55); g.lineTo(52, 55); g.stroke(); g.restore(); }
  if (R.detalle === 'gorra') { pintar(g, [[22, 46], [42, 46], [42, 49], [22, 49]], shade(ropa, -.2), rng, { n: 0, bw: .5 }); g.fillStyle = FR.ocre; g.fillRect(37, 51, 3, 3); }
  // Cuello y cabeza (tres cuartos: el rostro mira un poco a la izquierda).
  const piel = R.piel;
  pintar(g, [[28, 44], [36, 44], [36, 36], [28, 36]], shade(piel, -.08), rng, { n: 0, bw: .6 });
  ovalo(g, 31.5, 29, 9.3, 11.4, piel, rng, { n: 3, al: .1, bw: .75, j: .02 });
  // Sombra del lado derecho y del cuello (la luz viene de la izquierda).
  g.save(); g.globalAlpha = .26; g.fillStyle = FR.siena; g.beginPath(); g.ellipse(37, 30, 4.2, 9.5, -.1, 0, Math.PI * 2); g.fill(); g.restore();
  // Oreja.
  ovalo(g, 40, 30, 1.6, 2.6, shade(piel, -.08), rng, { n: 0, bw: .5 });
  // Rasgos: cejas, ojos almendrados grandes (como en El Fayum), nariz, boca.
  g.save(); g.lineCap = 'round';
  g.strokeStyle = shade(R.pelo || FR.carbon, .05); g.lineWidth = 1.1;
  g.beginPath(); g.moveTo(24.6, 24.6); g.quadraticCurveTo(27.2, 23.2, 29.8, 24.4); g.moveTo(32.6, 24.4); g.quadraticCurveTo(35, 23.4, 37.2, 24.8); g.stroke();
  for (const [x, w] of [[27.2, 2.6], [34.8, 2.3]]) {
    g.fillStyle = '#F4EEE0'; g.beginPath(); g.ellipse(x, 27.4, w, 1.25, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#3A2618'; g.beginPath(); g.arc(x - .3, 27.4, 1.15, 0, Math.PI * 2); g.fill();
    g.strokeStyle = FR.siena; g.lineWidth = .55; g.beginPath(); g.ellipse(x, 27.3, w, 1.3, 0, Math.PI * 1.05, Math.PI * 1.95); g.stroke();
  }
  g.strokeStyle = shade(piel, -.4); g.lineWidth = .8; g.beginPath(); g.moveTo(31, 27.5); g.quadraticCurveTo(29.6, 31.8, 31, 32.6); g.lineTo(32.8, 32.4); g.stroke();
  g.strokeStyle = '#8A3A2A'; g.lineWidth = 1.1; g.beginPath(); g.moveTo(28.6, 35.6); g.quadraticCurveTo(31, 36.4, 33.6, 35.5); g.stroke();
  g.globalAlpha = .22; g.fillStyle = FR.bermellon; g.beginPath(); g.ellipse(26, 31.5, 2.2, 1.4, 0, 0, Math.PI * 2); g.fill();
  g.restore();
  if (R.detalle === 'gafas') { g.save(); g.strokeStyle = FR.carbon; g.lineWidth = .8; g.beginPath(); g.arc(27.2, 27.4, 3.2, 0, Math.PI * 2); g.moveTo(38, 27.4); g.arc(34.8, 27.4, 3.1, 0, Math.PI * 2); g.moveTo(30.4, 27); g.lineTo(31.7, 27); g.stroke(); g.restore(); }
  // Pelo (masa con mechones).
  const pelo = R.pelo || FR.carbon;
  pintar(g, R.mujer ? [[21, 32], [21.5, 22], [26, 16.4], [33, 15.6], [40, 18], [42.6, 25], [42.4, 36], [40, 40], [40.5, 28], [37, 21.2], [30, 20.4], [24.5, 23.4], [23, 33]]
    : [[22, 27], [22.6, 21], [27, 16.8], [34, 16.2], [40, 18.4], [41.8, 24], [41, 29], [39.5, 23.4], [34, 20.4], [27, 21], [24, 24]], pelo, rng, { n: 2, bw: .6 });
  g.save(); g.globalAlpha = .35; g.strokeStyle = shade(pelo, .35); g.lineWidth = .6; for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(26 + k * 3.5, 18.5); g.quadraticCurveTo(27 + k * 3.5, 20, 25.5 + k * 3.8, 22); g.stroke(); } g.restore();
  if (R.detalle === 'gorra') { pintar(g, [[20.5, 22.5], [43.5, 22.5], [42, 14.5], [22, 14.5]], shade(ropa, -.15), rng, { n: 1, bw: .6 }); pintar(g, [[18, 24.6], [33, 24.6], [31, 21.8], [20, 21.8]], shade(ropa, -.32), rng, { n: 0, bw: .5 }); g.fillStyle = FR.ocre; g.beginPath(); g.arc(32, 18.4, 1.6, 0, Math.PI * 2); g.fill(); }
  if (R.detalle === 'corona') { for (let k = 0; k < 5; k++) pintar(g, [[22.5 + k * 4.4, 19.5], [25.5 + k * 4.4, 19.5], [24 + k * 4.4 + (k % 2 ? 1 : -1), 7.5 + (k % 2) * 3]], [FR.verde, FR.ocre, FR.cal, FR.ocre, FR.verde][k], rng, { n: 0, bw: .45 }); pintar(g, [[21, 22], [43, 22], [43, 18.6], [21, 18.6]], FR.rojo, rng, { n: 0, bw: .5 }); }
  if (R.detalle === 'sombrero') { ovalo(g, 31, 17.6, 15, 3.4, FR.cal, rng, { n: 1, bw: .6, j: .02 }); pintar(g, [[24, 17.8], [38, 17.8], [37, 9.5], [25, 9.5]], FR.cal, rng, { n: 1, bw: .6 }); pintar(g, [[24, 15.8], [38, 15.8], [38, 13.4], [24, 13.4]], FR.carbon, rng, { n: 0, bw: .3 }); }
  if (R.detalle === 'panoleta') pintar(g, [[20.5, 26], [22, 15.5], [32, 12.6], [42, 15.6], [43.5, 26], [41, 23], [32, 19], [23, 23]], FR.rojo, rng, { n: 1, bw: .6 });
  if (R.detalle === 'laurel') { g.save(); g.strokeStyle = FR.verde; g.lineWidth = 1.4; g.beginPath(); g.arc(31.5, 22, 10, Math.PI * 1.05, Math.PI * 1.95); g.stroke(); for (let k = 0; k < 7; k++) { const a = Math.PI * (1.1 + k * .13); ovalo(g, 31.5 + Math.cos(a) * 10, 22 + Math.sin(a) * 10, .9, 2, FR.verde, rng, { n: 0, bw: .3, j: .02 }); } g.restore(); }
  texturaYeso(g, 0, 0, 64, 64, .35);
  g.restore();
  // Aro rojo pompeyano con filo ocre.
  g.save(); g.lineWidth = 3.4; g.strokeStyle = FR.rojo; g.beginPath(); g.arc(32, 32, 29.6, 0, Math.PI * 2); g.stroke();
  g.lineWidth = 1; g.strokeStyle = FR.ocre; g.beginPath(); g.arc(32, 32, 31.2, 0, Math.PI * 2); g.stroke(); g.restore();
}
function hacer(clave, spec, semilla) {
  if (CACHE[clave]) return CACHE[clave];
  const c = lienzo(128, 128), g = c.getContext('2d'); g.scale(2, 2);
  pintarRetrato(g, spec, mulberry(semilla));
  return (CACHE[clave] = urlDe(c));
}
// Las voces del pueblo: Doña Rosa (campesina), Julián (artesano) y Don Aurelio (élite).
const VOCES = {
  rosa: { fondo: '#C9D6A8', piel: '#C08458', ropa: FR.rojo, pelo: '#2A2018', detalle: 'panoleta', mujer: true },
  julian: { fondo: '#E6C27A', piel: '#D9A27A', ropa: FR.azul, pelo: '#4A3A2C', detalle: 'ruana' },
  aurelio: { fondo: '#D8CFDF', piel: '#E3B894', ropa: FR.violeta, pelo: '#9C958A', detalle: 'laurel' }
};
export function retrato(kind) { return hacer(kind, VOCES[kind] || VOCES.julian, kind.length * 31 + 7); }

// Emblemas de los regímenes (de la versión 9).
export const EMB = {
  monarquia: '<svg viewBox="0 0 24 24" class="emb" aria-hidden="true"><path d="M3 17l2-9 4 4 3-7 3 7 4-4 2 9z" fill="#D9A93E" stroke="#8C6A1E"/><rect x="3" y="17" width="18" height="3" fill="#5B3A7A"/></svg>',
  aristocracia: '<svg viewBox="0 0 24 24" class="emb" aria-hidden="true"><path d="M12 21c-6-3-8-8-7-14M12 21c6-3 8-8 7-14" fill="none" stroke="#2F5B45" stroke-width="2"/><g fill="#5E8A4D"><ellipse cx="6" cy="10" rx="1.6" ry="3" transform="rotate(-25 6 10)"/><ellipse cx="7.5" cy="15" rx="1.6" ry="3" transform="rotate(-45 7.5 15)"/><ellipse cx="18" cy="10" rx="1.6" ry="3" transform="rotate(25 18 10)"/><ellipse cx="16.5" cy="15" rx="1.6" ry="3" transform="rotate(45 16.5 15)"/></g></svg>',
  republica: '<svg viewBox="0 0 24 24" class="emb" aria-hidden="true"><rect x="4" y="10" width="16" height="10" rx="1" fill="#E9E3D6" stroke="#2D5D72"/><rect x="9" y="4" width="6" height="8" fill="#F4EFE2" stroke="#2D5D72" transform="rotate(-8 12 8)"/><rect x="8" y="10" width="8" height="1.6" fill="#2D5D72"/></svg>',
  tirania: '<svg viewBox="0 0 24 24" class="emb" aria-hidden="true"><path d="M12 3l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6L3.3 9.2l6.1-.6z" fill="#9E2B25"/></svg>',
  oligarquia: '<svg viewBox="0 0 24 24" class="emb" aria-hidden="true"><ellipse cx="12" cy="17" rx="8" ry="3" fill="#C9962E"/><ellipse cx="12" cy="13" rx="8" ry="3" fill="#D9A93E"/><ellipse cx="12" cy="9" rx="8" ry="3" fill="#E6BC55" stroke="#8C6A1E"/></svg>',
  demagogia: '<svg viewBox="0 0 24 24" class="emb" aria-hidden="true"><path d="M4 10h4l9-5v14l-9-5H4z" fill="#C0602A"/><path d="M8 14l1.5 5h2.5l-1.5-5" fill="#8A4420"/></svg>'
};

// Fase 4: retratos de los personajes con papel propio, a partir de sus datos (fondo, piel, ropa, pelo y un detalle).
const MUJERES = new Set(['empresaria', 'vulcanologa']);
export function retratoFig(id, R) { return hacer('fig-' + id, { ...R, mujer: MUJERES.has(id) || R.mujer }, id.length * 47 + 11); }
