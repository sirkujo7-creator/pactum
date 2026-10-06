// Retratos (renovación colonial, 6 de octubre; antes al fresco): busto en tres cuartos pintado como los pobladores
// nuevos, con luz de arriba (degradados suaves), contorno fino, ojos discretos y ropa del Tolima, dentro de un
// medallón con aro verde cafetero y filo ocre. Sirven para las voces del pueblo (Doña Rosa, Julián, Don Aurelio) y
// para los personajes con papel propio.
import { mulberry, lienzo } from './acuarela.js';
import { FR, shade, mix, urlDe } from './fresco.js';

const CACHE = {}, CONT = 'rgba(60,38,26,.55)';
function forma(g, pts, col, luz = .18, osc = -.24) {
  const ys = pts.map(p => p[1]), gr = g.createLinearGradient(0, Math.min(...ys), 0, Math.max(...ys));
  gr.addColorStop(0, shade(col, luz)); gr.addColorStop(.5, col); gr.addColorStop(1, shade(col, osc));
  g.beginPath(); g.moveTo(...pts[0]); for (let k = 1; k < pts.length; k++) { const p = pts[k], q = pts[(k + 1) % pts.length]; g.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2); }
  g.closePath(); g.fillStyle = gr; g.fill(); g.strokeStyle = CONT; g.lineWidth = .7; g.stroke();
}
const elipse = (g, x, y, rx, ry, col) => { g.fillStyle = col; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 7); g.fill(); };
// spec: { fondo, piel, ropa, pelo, detalle, mujer, manto, delantal, panoleta }
function pintarRetrato(g, R) {
  g.save(); g.beginPath(); g.arc(32, 32, 30, 0, Math.PI * 2); g.clip();
  const fondo = g.createRadialGradient(26, 20, 4, 32, 32, 34); fondo.addColorStop(0, mix(R.fondo || FR.ocreClaro, '#FFFFFF', .45)); fondo.addColorStop(1, mix(R.fondo || FR.ocreClaro, '#8A7A5A', .15));
  g.fillStyle = fondo; g.fillRect(0, 0, 64, 64);
  // Hombros con la ropa; encima la ruana, el pañolón, la levita o el delantal.
  const ropa = R.ropa, camisa = R.detalle === 'ruana' || R.detalle === 'aguadeno' ? '#F4EFE4' : ropa;
  forma(g, [[8, 68], [11, 52], [20, 45.5], [32, 47], [44, 45.5], [53, 52], [56, 68]], camisa);
  if (R.detalle === 'ruana' || R.detalle === 'aguadeno') { forma(g, [[7, 68], [12, 53], [24, 46], [32, 50], [40, 46], [52, 53], [57, 68]], ropa); g.save(); g.strokeStyle = FR.ocre; g.lineWidth = 1.3; for (const y of [60, 63.5]) { g.beginPath(); g.moveTo(10, y); g.quadraticCurveTo(32, y + 3, 54, y); g.stroke(); } g.restore(); }
  if (R.manto) { forma(g, [[8, 68], [11, 52], [20, 45.5], [27, 48], [26, 68]], R.manto); forma(g, [[56, 68], [53, 52], [44, 45.5], [37, 48], [38, 68]], R.manto); elipse(g, 32, 49, 3.2, 2.4, '#F4F1E8'); g.fillStyle = '#7A1E1E'; g.fillRect(29.8, 47.6, 4.4, 1.6); } // levita con camisa y corbatín
  if (R.mujer && R.detalle === 'panoleta') forma(g, [[12, 56], [20, 46], [32, 49], [44, 46], [52, 56], [32, 60]], R.panoleta || FR.ocre); // pañolón
  if (R.delantal) forma(g, [[25, 50], [39, 50], [40, 68], [24, 68]], '#8A6A48', .1, -.2);
  if (R.detalle === 'cuello') { forma(g, [[22, 47], [42, 47], [44, 68], [20, 68]], '#22222A', .12, -.2); elipse(g, 32, 47.6, 3.4, 1.6, '#F4F1E8'); } // sotana con alzacuello
  if (R.detalle === 'collar') { g.save(); g.strokeStyle = FR.ocre; g.lineWidth = 1.6; g.beginPath(); g.arc(32, 46, 6.5, .35, Math.PI - .35); g.stroke(); g.restore(); }
  if (R.detalle === 'gorra') { g.fillStyle = '#C9A24A'; g.beginPath(); g.arc(41, 55, 1.6, 0, 7); g.fill(); } // placa en el pecho
  // Cuello y cabeza en tres cuartos (mira un poco a la derecha), con luz de arriba a la izquierda.
  const piel = R.piel;
  forma(g, [[28, 47], [36, 47], [36, 38], [28, 38]], shade(piel, -.08), .05, -.15);
  const cab = g.createRadialGradient(28.5, 24.5, 2, 32, 29, 12); cab.addColorStop(0, shade(piel, .16)); cab.addColorStop(.6, piel); cab.addColorStop(1, shade(piel, -.2));
  g.fillStyle = cab; g.beginPath(); g.ellipse(32, 29, 8.4, 10, 0, 0, 7); g.fill(); g.strokeStyle = CONT; g.lineWidth = .6; g.stroke();
  elipse(g, 24.4, 30, 1.4, 2.2, shade(piel, -.12)); // oreja
  g.fillStyle = 'rgba(40,25,18,.8)'; g.beginPath(); g.ellipse(31, 28.6, .9, 1.05, 0, 0, 7); g.ellipse(36.4, 28.6, .85, 1, 0, 0, 7); g.fill(); // ojos
  g.strokeStyle = 'rgba(40,25,18,.55)'; g.lineWidth = .7; g.beginPath(); g.moveTo(29.4, 26.4); g.quadraticCurveTo(31, 25.6, 32.6, 26.2); g.moveTo(35.2, 26.2); g.quadraticCurveTo(36.6, 25.6, 38, 26.4); g.stroke(); // cejas
  g.fillStyle = shade(piel, -.22); g.beginPath(); g.moveTo(34.4, 29.4); g.lineTo(36.4, 33.2); g.lineTo(34.2, 33.6); g.closePath(); g.fill(); // nariz
  g.strokeStyle = shade(piel, -.35); g.lineWidth = .7; g.beginPath(); g.moveTo(32, 35.8); g.quadraticCurveTo(34, 36.6, 35.8, 35.6); g.stroke(); // boca
  g.fillStyle = 'rgba(200,90,70,.18)'; g.beginPath(); g.ellipse(29.4, 32.6, 2, 1.3, 0, 0, 7); g.ellipse(37.6, 32.4, 1.6, 1.1, 0, 0, 7); g.fill(); // mejillas
  if (R.detalle === 'gafas') { g.save(); g.strokeStyle = FR.carbon; g.lineWidth = .8; g.beginPath(); g.arc(31, 28.8, 2.6, 0, Math.PI * 2); g.moveTo(39, 28.8); g.arc(36.4, 28.8, 2.4, 0, Math.PI * 2); g.moveTo(33.6, 28.6); g.lineTo(34, 28.6); g.stroke(); g.restore(); }
  if (!R.mujer && (R.detalle === 'aguadeno' || R.detalle === 'ruana')) { g.fillStyle = 'rgba(35,28,23,.75)'; g.beginPath(); g.ellipse(34, 34.4, 3, .9, 0, 0, 7); g.fill(); } // bigote campesino
  // Pelo.
  const pelo = R.pelo || FR.carbon;
  if (R.mujer) { forma(g, [[23, 33], [23.2, 23], [27, 19], [32, 18.2], [37.5, 19.2], [40.8, 24], [39.6, 24.6], [33, 21.4], [27, 23], [25.6, 30], [26, 40], [23.4, 38]], pelo, .12, -.2); }
  else forma(g, [[23.6, 28], [24, 22.4], [28, 19], [32.4, 18.4], [37, 19.4], [40.6, 23], [40.4, 25.4], [36, 22.6], [29, 22.8], [25.4, 26]], pelo, .12, -.2);
  // Sombreros y tocados del Tolima.
  const d = R.detalle;
  if (d === 'panoleta') forma(g, [[22.4, 27], [23.4, 20], [32, 16.4], [40.6, 20], [41.6, 26], [38.6, 23.4], [32, 20.6], [25.6, 23.4]], R.panoleta || FR.ocre);
  if (d === 'aguadeno') { forma(g, [[14, 21.4], [32, 17.6], [50, 21.4], [32, 25]], '#F4EFE4'); forma(g, [[24.6, 21], [25, 12.6], [32, 11], [39, 12.6], [39.4, 21]], '#F4EFE4'); g.fillStyle = '#231F1C'; g.fillRect(24.8, 17.2, 14.6, 2.2); }
  if (d === 'pilos') { forma(g, [[23, 23.4], [23.6, 17], [32, 14.6], [40.4, 17], [41, 23.4]], '#3F4A55'); forma(g, [[30, 23], [46, 23], [44, 25], [30, 25]], '#2E363E'); } // gorra de paño del artesano
  if (d === 'laurel') { forma(g, [[19, 21.4], [32, 19.4], [45, 21.4], [32, 23.4]], '#1F2226', .1, -.1); forma(g, [[24.6, 21], [24.4, 6], [39.6, 6], [39.4, 21]], '#1F2226', .1, -.15); g.fillStyle = '#6E2A2A'; g.fillRect(24.6, 16.6, 14.8, 2); } // sombrero de copa de la élite
  if (d === 'gorra') { forma(g, [[22.6, 24], [23.4, 16.6], [32, 14.4], [40.6, 16.6], [41.4, 24]], shade(ropa, -.1)); forma(g, [[28, 23.4], [44, 23.4], [42.6, 26], [28, 26]], shade(ropa, -.3)); elipse(g, 32, 19.4, 1.6, 1.6, FR.ocre); }
  if (d === 'corona') { const cols = [FR.verde, FR.ocre, FR.bermellon, FR.ocre, FR.verde, FR.azul, FR.ocre]; for (let k = 0; k < 7; k++) forma(g, [[23 + k * 3, 22], [26 + k * 3, 22], [24.5 + k * 3 + (k - 3) * .5, 8 + Math.abs(k - 3) * 1.6]], cols[k], .15, -.15); forma(g, [[22.4, 24.4], [41.6, 24.4], [41.6, 20.6], [22.4, 20.6]], FR.bermellon); } // corona de plumas de la líder pijao
  g.restore();
  g.save(); g.lineWidth = 3.4; g.strokeStyle = '#41603D'; g.beginPath(); g.arc(32, 32, 29.6, 0, Math.PI * 2); g.stroke();
  g.lineWidth = 1; g.strokeStyle = FR.ocre; g.beginPath(); g.arc(32, 32, 31.2, 0, Math.PI * 2); g.stroke(); g.restore();
}
function hacer(clave, spec, semilla) {
  if (CACHE[clave]) return CACHE[clave];
  const c = lienzo(128, 128), g = c.getContext('2d'); g.scale(2, 2);
  pintarRetrato(g, spec); void semilla;
  return (CACHE[clave] = urlDe(c));
}
// Las voces del pueblo: Doña Rosa (campesina), Julián (artesano) y Don Aurelio (élite).
const VOCES = {
  rosa: { fondo: '#C9D6A8', piel: '#C08458', ropa: '#F6F1E6', pelo: '#2A2018', detalle: 'panoleta', panoleta: '#B23A2E', mujer: true },
  julian: { fondo: '#E6C27A', piel: '#D9A27A', ropa: '#5C7C9A', pelo: '#4A3A2C', detalle: 'pilos', delantal: true },
  aurelio: { fondo: '#D8CFDF', piel: '#E3B894', ropa: '#F4F1E8', manto: '#2E3440', pelo: '#9C958A', detalle: 'laurel' }
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
