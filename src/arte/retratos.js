// Retratos (pedido de Juan, 6 de octubre: minimalistas y pulidos, al estilo de Reigns): figuras planas y geométricas,
// color liso con una sola sombra de borde nítido (la luz viene de la izquierda), sin contornos ni degradados, cara
// mínima (cejas, ojos pequeños y la sombra de la nariz) y un sombrero o tocado que dice quién es cada uno. Van dentro
// del medallón con aro verde cafetero y filo ocre. Sirven para las voces del pueblo y los personajes con papel propio.
import { lienzo } from './acuarela.js';
import { FR, shade, mix, urlDe } from './fresco.js';

const CACHE = {};
const pol = (g, pts, col) => { g.fillStyle = col; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fill(); };
const elip = (g, x, y, rx, ry, col, rot = 0) => { g.fillStyle = col; g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, 7); g.fill(); };
const sombra = c => shade(c, -.2);
// Colores un poco apagados, para que todo el retrato quede en la misma familia.
const tono = c => mix(c, '#8C8478', .08);
// spec: { fondo, piel, ropa, pelo, detalle, mujer, manto, delantal, panoleta }
function pintarRetrato(g, R) {
  g.save(); g.beginPath(); g.arc(32, 32, 30, 0, Math.PI * 2); g.clip();
  const fondo = tono(R.fondo || FR.ocreClaro), piel = R.piel, ropa = tono(R.ropa), pelo = R.pelo || '#2A2018', d = R.detalle;
  g.fillStyle = fondo; g.fillRect(0, 0, 64, 64);
  pol(g, [[0, 64], [0, 44], [64, 30], [64, 64]], shade(fondo, -.05)); // un plano de luz en diagonal
  // Pelo largo (detrás de la cabeza y los hombros).
  if (R.mujer) pol(g, [[20.5, 24], [22, 14], [32, 9.5], [42, 14], [43.5, 24], [44, 42], [40, 47], [24, 47], [20, 42]], pelo);
  // Cuerpo: hombros anchos, con la sombra de la derecha (subidos para que el cuello quede corto).
  g.save(); g.translate(0, -4);
  const cuerpo = d === 'cuello' ? '#26262E' : ropa;
  pol(g, [[5, 64], [8, 53], [16, 47.5], [32, 46], [48, 47.5], [56, 53], [59, 64]], cuerpo);
  pol(g, [[34, 46.2], [48, 47.5], [56, 53], [59, 64], [40, 64]], sombra(cuerpo));
  if (d === 'aguadeno' || d === 'ruana') { pol(g, [[5, 64], [9, 52], [20, 46.6], [32, 52], [44, 46.6], [55, 52], [59, 64]], ropa); pol(g, [[32, 52], [44, 46.6], [55, 52], [59, 64], [40, 64]], sombra(ropa)); pol(g, [[8, 59], [32, 61.5], [56, 59], [56.6, 61.2], [32, 63.6], [7.4, 61.2]], FR.ocre); }
  if (R.manto) { pol(g, [[5, 64], [8, 53], [16, 47.5], [26, 46.6], [29, 64]], R.manto); pol(g, [[59, 64], [56, 53], [48, 47.5], [38, 46.6], [35, 64]], sombra(R.manto)); pol(g, [[28, 46.6], [36, 46.6], [32, 56]], '#F4F1E8'); pol(g, [[30, 47.6], [34, 47.6], [32, 50.4]], '#8E2F22'); }
  if (R.mujer && d === 'panoleta') { const c = tono(R.panoleta || FR.ocre); pol(g, [[11, 55], [17, 47.8], [32, 50.5], [47, 47.8], [53, 55], [32, 61]], c); pol(g, [[32, 50.5], [47, 47.8], [53, 55], [32, 61]], sombra(c)); }
  if (R.delantal) { pol(g, [[24.5, 51], [39.5, 51], [41, 64], [23, 64]], '#8A6A48'); pol(g, [[32, 51], [39.5, 51], [41, 64], [32, 64]], sombra('#8A6A48')); }
  if (d === 'cuello') pol(g, [[29, 46.4], [35, 46.4], [34.4, 48.6], [29.6, 48.6]], '#F4F1E8'); // alzacuello del párroco
  if (d === 'collar') { g.strokeStyle = '#C9A24A'; g.lineWidth = 1.5; g.beginPath(); g.arc(32, 46.5, 7, .45, Math.PI - .45); g.stroke(); elip(g, 32, 53.4, 1.4, 1.6, '#C9A24A'); }
  if (d === 'gorra') { pol(g, [[40, 52], [44, 52], [44, 55.5], [42, 56.6], [40, 55.5]], '#C9A24A'); pol(g, [[16, 49.5], [26, 47], [26.6, 48.6], [17, 51]], '#C9A24A'); } // placa y charretera
  pol(g, [[5, 64], [59, 64], [59, 70], [5, 70]], d === 'cuello' ? '#26262E' : R.manto || ropa); g.restore();
  // Cuello y cabeza (anguloso, sin contorno), con la sombra de la derecha.
  pol(g, [[28.4, 44], [35.6, 44], [35.6, 37], [28.4, 37]], shade(piel, -.16));
  const cara = [[23.2, 22], [25, 14.6], [32, 12], [39, 14.6], [40.8, 22], [40.4, 30.5], [37.2, 37], [32, 39.6], [26.8, 37], [23.6, 30.5]];
  pol(g, cara, piel);
  pol(g, [[35.5, 12.8], [39, 14.6], [40.8, 22], [40.4, 30.5], [37.2, 37], [32.6, 39.5], [35.4, 33], [36.6, 24]], shade(piel, -.13));
  elip(g, 23.4, 27, 1.6, 2.4, shade(piel, -.08)); // oreja
  // Cara mínima y sin boca (más misteriosa): el gesto está en las cejas y los ojos. feliz (relación alta): cejas altas
  // y ojos cerrados en arco; preocupado (media): cejas que suben hacia el centro; enojado (baja): cejas que bajan hacia
  // el centro y ojos entrecerrados. Sin gesto: cejas rectas.
  const G = R.gesto, ceja = shade(pelo, .1), giro = { feliz: 0, preocupado: .32, enojado: -.36 }[G] || 0, yc = G === 'feliz' ? 22.8 : G === 'enojado' ? 24.4 : 23.6;
  g.fillStyle = ceja;
  g.save(); g.translate(28.4, yc); g.rotate(-.08 + giro); g.fillRect(-2.4, -.6, 4.8, 1.3); g.restore();
  g.save(); g.translate(35.6, yc); g.rotate(.08 - giro); g.fillRect(-2.4, -.6, 4.8, 1.3); g.restore();
  if (G === 'feliz') { g.strokeStyle = '#2A1E18'; g.lineWidth = 1.1; g.lineCap = 'round'; for (const x of [28.4, 35.6]) { g.beginPath(); g.arc(x, 27.6, 1.5, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); } }
  else { const ry = G === 'enojado' ? .75 : 1.25; elip(g, 28.4, 26.8, 1.05, ry, '#2A1E18'); elip(g, 35.6, 26.8, 1.05, ry, '#2A1E18'); }
  pol(g, [[32.2, 26.8], [34.2, 32.2], [31.2, 32.6]], shade(piel, -.22));
  if (d === 'gafas') { g.strokeStyle = '#2A1E18'; g.lineWidth = .9; g.beginPath(); g.arc(28.4, 26.8, 3, 0, 7); g.moveTo(38.6, 26.8); g.arc(35.6, 26.8, 3, 0, 7); g.moveTo(31.4, 26.6); g.lineTo(32.6, 26.6); g.stroke(); }
  if (!R.mujer && (d === 'aguadeno' || d === 'ruana')) pol(g, [[28.4, 33.4], [35.6, 33.4], [36.4, 35], [32, 34.2], [27.6, 35]], shade(pelo, .05)); // bigote
  // Pelo corto o el frente del pelo largo.
  if (R.mujer) pol(g, [[22.8, 23], [24, 15.5], [32, 11.6], [40, 15.5], [41.4, 21.6], [36, 17.6], [28.8, 17], [25.2, 20.6]], pelo);
  else pol(g, [[23, 23], [23.6, 16], [28, 12.4], [33, 11.4], [38, 12.8], [41, 17], [41, 23], [39.4, 18.6], [34, 16.6], [27.4, 17.6], [24.6, 21.6]], pelo);
  // Sombreros y tocados.
  if (d === 'panoleta') { const c = tono(R.panoleta || FR.ocre); pol(g, [[21.6, 25], [22.6, 15.6], [32, 10.4], [41.4, 15.6], [42.4, 25], [39.6, 19.8], [32, 16.2], [24.4, 19.8]], c); pol(g, [[32, 10.4], [41.4, 15.6], [42.4, 25], [39.6, 19.8], [32, 16.2]], sombra(c)); }
  if (d === 'aguadeno') { pol(g, [[12, 20.6], [32, 16.6], [52, 20.6], [32, 24]], '#F4EFE4'); pol(g, [[32, 16.6], [52, 20.6], [32, 24]], shade('#F4EFE4', -.1)); pol(g, [[24.2, 18.6], [25.4, 9.4], [32, 7.6], [38.6, 9.4], [39.8, 18.6]], '#F4EFE4'); pol(g, [[33, 7.8], [38.6, 9.4], [39.8, 18.6], [33.6, 19.4]], shade('#F4EFE4', -.1)); pol(g, [[24.4, 15.8], [39.6, 15.8], [39.8, 18.6], [24.2, 18.6]], '#231F1C'); }
  if (d === 'pilos') { pol(g, [[22.4, 21.4], [23.4, 13.6], [32, 10.6], [40.6, 13.6], [41.6, 21.4]], '#3F4A55'); pol(g, [[33, 10.8], [40.6, 13.6], [41.6, 21.4], [34, 21.4]], shade('#3F4A55', -.2)); pol(g, [[30, 20.4], [47, 20.6], [45.4, 23.2], [30, 23]], '#2E363E'); } // gorra de paño
  if (d === 'laurel') { pol(g, [[17, 19.6], [32, 17.6], [47, 19.6], [32, 22]], '#1F2226'); pol(g, [[24.4, 19.4], [24.8, 3], [39.2, 3], [39.6, 19.4]], '#24272C'); pol(g, [[33.6, 3], [39.2, 3], [39.6, 19.4], [34, 19.6]], '#16181B'); pol(g, [[24.6, 14.6], [39.4, 14.6], [39.5, 17], [24.5, 17]], '#6E2A2A'); } // sombrero de copa
  if (d === 'gorra') { const c = shade(ropa, -.08); pol(g, [[22.4, 21], [23.4, 13], [32, 10.2], [40.6, 13], [41.6, 21]], c); pol(g, [[33, 10.4], [40.6, 13], [41.6, 21], [34, 21]], sombra(c)); pol(g, [[26, 20.2], [45, 20.2], [43, 23.6], [27, 23.6]], '#1E1E1E'); elip(g, 32, 16, 1.8, 1.8, '#C9A24A'); }
  if (d === 'corona') { const cols = ['#4E7A3A', '#D4A24C', '#B9442F', '#2F5D8A', '#B9442F', '#D4A24C', '#4E7A3A']; cols.forEach((c, k) => { const x = 23.6 + k * 2.8, t = 6 + Math.abs(k - 3) * 2; pol(g, [[x - 1.8, 19.4], [x + 1.8, 19.4], [x + (k - 3) * .5, t]], c); }); pol(g, [[22.4, 22.4], [41.6, 22.4], [41.6, 18.8], [22.4, 18.8]], '#B9442F'); for (let k = 0; k < 4; k++) pol(g, [[24 + k * 5, 19.6], [26 + k * 5, 19.6], [25 + k * 5, 21.8]], '#F4EFE4'); } // corona de plumas
  g.restore();
  g.lineWidth = 3; g.strokeStyle = '#41603D'; g.beginPath(); g.arc(32, 32, 29.7, 0, Math.PI * 2); g.stroke();
  g.lineWidth = 1; g.strokeStyle = FR.ocre; g.beginPath(); g.arc(32, 32, 31.2, 0, Math.PI * 2); g.stroke();
}
function hacer(clave, spec, semilla) {
  if (spec.gesto) clave += '-' + spec.gesto;
  if (CACHE[clave]) return CACHE[clave];
  const c = lienzo(128, 128), g = c.getContext('2d'); g.scale(2, 2);
  pintarRetrato(g, spec); void semilla;
  return (CACHE[clave] = urlDe(c));
}
// Las voces del pueblo: Doña Rosa (campesina), Julián (artesano) y Don Aurelio (élite).
const VOCES = {
  rosa: { fondo: '#C9D6A8', piel: '#C08458', ropa: '#EDE6D6', pelo: '#2A2018', detalle: 'panoleta', panoleta: '#B23A2E', mujer: true },
  julian: { fondo: '#E6C27A', piel: '#D9A27A', ropa: '#5C7C9A', pelo: '#4A3A2C', detalle: 'pilos', delantal: true },
  campesino: { fondo: '#CFD9B4', piel: '#B9845A', ropa: '#8E3B2A', pelo: '#2A2018', detalle: 'aguadeno' },
  aurelio: { fondo: '#D8CFDF', piel: '#E3B894', ropa: '#F4F1E8', manto: '#2E3440', pelo: '#9C958A', detalle: 'laurel' }
};
// gesto: 'feliz', 'preocupado' o 'enojado' (según la relación o el ánimo: verde, amarillo o rojo).
export function retrato(kind, gesto) { return hacer(kind, { ...(VOCES[kind] || VOCES.julian), gesto }, kind.length * 31 + 7); }
export const gestoDe = v => v >= 60 ? 'feliz' : v >= 35 ? 'preocupado' : 'enojado'; // los mismos cortes que los colores de las barras

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
export function retratoFig(id, R, gesto) { return hacer('fig-' + id, { ...R, gesto, mujer: MUJERES.has(id) || R.mujer }, id.length * 47 + 11); }
