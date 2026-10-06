// Retratos al fresco (fase 8): busto al estilo de los pobladores (cabeza pequeña, sin rasgos de caricatura, ropa en
// dos tonos con pliegues y contorno siena) dentro de un tondo con aro verde cafetero y filo ocre. Sirven para las voces
// del pueblo (Doña Rosa, Julián, Don Aurelio) y para los personajes con papel propio.
import { mulberry, lienzo } from './acuarela.js';
import { FR, shade, mix, pintar, ovalo, texturaYeso, urlDe } from './fresco.js';

const CACHE = {};
// spec: { fondo, piel, ropa, pelo, detalle, mujer, manto, delantal }
function pintarRetrato(g, R, rng) {
  g.save(); g.beginPath(); g.arc(32, 32, 30, 0, Math.PI * 2); g.clip();
  g.fillStyle = mix(R.fondo || FR.ocreClaro, FR.yeso, .35); g.fillRect(0, 0, 64, 64);
  // Hombros y túnica (como la ropa de los pobladores: dos tonos y pliegues).
  const ropa = R.ropa;
  pintar(g, [[10, 66], [13, 50], [22, 44], [32, 46], [42, 44], [51, 50], [54, 66]], ropa, rng, { n: 3, bw: .9 });
  g.save(); g.globalAlpha = .45; g.strokeStyle = shade(ropa, -.35); g.lineWidth = .9;
  [[24, 50, 22, 64], [32, 49, 32, 64], [40, 50, 42, 64]].forEach(([a1, b1, c1, d1]) => { g.beginPath(); g.moveTo(a1, b1); g.quadraticCurveTo(a1 + 1, (b1 + d1) / 2, c1, d1); g.stroke(); });
  g.globalAlpha = .5; g.strokeStyle = shade(ropa, .35); g.beginPath(); g.moveTo(18, 52); g.lineTo(16, 64); g.stroke(); g.restore();
  if (R.manto) { pintar(g, [[12, 66], [14, 50], [24, 44], [36, 66]], R.manto, rng, { n: 2, bw: .9 }); g.save(); g.globalAlpha = .45; g.strokeStyle = shade(R.manto, -.35); g.lineWidth = .9; g.beginPath(); g.moveTo(20, 50); g.lineTo(26, 64); g.moveTo(16, 54); g.lineTo(20, 64); g.stroke(); g.restore(); }
  if (R.delantal) pintar(g, [[26, 48], [38, 48], [39, 66], [25, 66]], FR.ocreClaro, rng, { n: 1, bw: .7 });
  if (R.detalle === 'cuello') pintar(g, [[29, 45], [35, 45], [34, 49], [30, 49]], FR.cal, rng, { n: 0, bw: .6 });
  if (R.detalle === 'collar') { g.save(); g.strokeStyle = FR.ocre; g.lineWidth = 1.6; g.beginPath(); g.arc(32, 45, 6, .35, Math.PI - .35); g.stroke(); g.restore(); }
  if (R.detalle === 'ruana') { pintar(g, [[11, 66], [15, 51], [32, 47], [49, 51], [53, 66]], ropa, rng, { n: 2, bw: .9 }); g.save(); g.strokeStyle = FR.ocre; g.lineWidth = 1.4; g.beginPath(); g.moveTo(14, 57); g.lineTo(50, 57); g.stroke(); g.restore(); }
  if (R.detalle === 'gorra') { g.fillStyle = FR.ocre; g.fillRect(38, 52, 3, 3); }
  // Cuello y cabeza: óvalo liso, sin ojos ni boca, con la sombra del lado derecho (como los pobladores).
  const piel = R.piel;
  pintar(g, [[29, 46], [35, 46], [35, 38], [29, 38]], shade(piel, -.06), rng, { n: 0, bw: .7 });
  ovalo(g, 32, 29, 8.6, 10, piel, rng, { n: 2, al: .1, bw: .8, j: .02 });
  g.save(); g.globalAlpha = .24; g.fillStyle = FR.siena; g.beginPath(); g.ellipse(36.5, 30, 4, 8.6, 0, 0, Math.PI * 2); g.fill(); g.restore();
  if (R.detalle === 'gafas') { g.save(); g.strokeStyle = FR.carbon; g.lineWidth = .9; g.beginPath(); g.arc(28.5, 29, 2.8, 0, Math.PI * 2); g.moveTo(38.3, 29); g.arc(35.5, 29, 2.8, 0, Math.PI * 2); g.moveTo(31.3, 28.6); g.lineTo(32.7, 28.6); g.stroke(); g.restore(); }
  // Pelo.
  const pelo = R.pelo || FR.carbon;
  pintar(g, R.mujer ? [[23, 31], [23.4, 23], [27, 19], [32, 18.4], [37, 19], [40.6, 23], [41, 33], [39, 37], [39.4, 26], [36, 22.4], [28, 22.4], [24.6, 26], [25, 35]]
    : [[23.4, 27], [24, 22], [28, 19], [32, 18.6], [36, 19], [40, 22], [40.6, 27], [38.6, 23.4], [32, 21.6], [25.4, 23.4]], pelo, rng, { n: 1, bw: .6 });
  // Tocados (los mismos de los pobladores).
  if (R.detalle === 'panoleta') pintar(g, [[22.4, 28], [23.6, 20], [32, 16.6], [40.4, 20], [41.6, 28], [39, 24.6], [32, 21], [25, 24.6]], R.panoleta || FR.ocre, rng, { n: 1, bw: .7 });
  if (R.detalle === 'pilos') pintar(g, [[23, 23], [41, 23], [33, 8], [31, 8]], shade(FR.siena, .15), rng, { n: 1, bw: .7 });
  if (R.detalle === 'aguadeno') { ovalo(g, 32, 20.5, 15, 3.4, FR.cal, rng, { n: 1, bw: .7, j: .02 }); pintar(g, [[25, 20.6], [39, 20.6], [38, 12.6], [26, 12.6]], FR.cal, rng, { n: 1, bw: .7 }); pintar(g, [[25, 18.6], [39, 18.6], [39, 16.2], [25, 16.2]], FR.carbon, rng, { n: 0, bw: .3 }); }
  if (R.detalle === 'laurel') { g.save(); g.strokeStyle = FR.verde; g.lineWidth = 1.4; g.beginPath(); g.arc(32, 25, 9, Math.PI * 1.05, Math.PI * 1.95); g.stroke(); for (let k = 0; k < 7; k++) { const a = Math.PI * (1.1 + k * .13); ovalo(g, 32 + Math.cos(a) * 9, 25 + Math.sin(a) * 9, .9, 2, FR.verde, rng, { n: 0, bw: .3, j: .02 }); } g.restore(); }
  if (R.detalle === 'gorra') { pintar(g, [[22.5, 24], [41.5, 24], [40, 16.5], [24, 16.5]], shade(ropa, -.15), rng, { n: 1, bw: .6 }); pintar(g, [[20, 26], [34, 26], [32, 23.4], [22, 23.4]], shade(ropa, -.32), rng, { n: 0, bw: .5 }); g.fillStyle = FR.ocre; g.beginPath(); g.arc(32, 20.4, 1.5, 0, Math.PI * 2); g.fill(); }
  if (R.detalle === 'corona') { for (let k = 0; k < 5; k++) pintar(g, [[23.5 + k * 3.9, 21], [26.5 + k * 3.9, 21], [25 + k * 3.9 + (k % 2 ? 1 : -1), 10 + (k % 2) * 3]], [FR.verde, FR.ocre, FR.cal, FR.ocre, FR.verde][k], rng, { n: 0, bw: .45 }); pintar(g, [[22.5, 23.4], [41.5, 23.4], [41.5, 20.2], [22.5, 20.2]], FR.rojo, rng, { n: 0, bw: .5 }); }
  texturaYeso(g, 0, 0, 64, 64, .35);
  g.restore();
  g.save(); g.lineWidth = 3.4; g.strokeStyle = '#41603D'; g.beginPath(); g.arc(32, 32, 29.6, 0, Math.PI * 2); g.stroke();
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
  rosa: { fondo: '#C9D6A8', piel: '#C08458', ropa: FR.rojo, pelo: '#2A2018', detalle: 'panoleta', panoleta: FR.ocre, mujer: true },
  julian: { fondo: '#E6C27A', piel: '#D9A27A', ropa: FR.ocreRojo, pelo: '#4A3A2C', detalle: 'pilos', delantal: true },
  aurelio: { fondo: '#D8CFDF', piel: '#E3B894', ropa: FR.cal, manto: FR.violeta, pelo: '#9C958A', detalle: 'laurel' }
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
