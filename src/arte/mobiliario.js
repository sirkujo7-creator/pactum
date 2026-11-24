// Cosas del pueblo con las que la gente hace algo (pedido de Juan: «añadir cosas con las cuales interactúen… en los
// parques»; «dedícale a los detalles gráficos lo que más puedas»). Mismo pincel que las casas (cajas isométricas con
// luz arriba a la izquierda, cilindros, hojas en punta) y el ancla en el suelo, en el centro de la cosa: bancas, carrito
// de mazorca y de raspado, tienda de la esquina, mesa de dominó y de parqués, cancha de tejo, pozo, alberca, huerta con
// cerca, columpio y balancín, mula amarrada y palomas. Lo que se mueve aparte (la silla del columpio, la tabla del
// balancín, el tejo que vuela, las palomas) se hornea en su propio cuadro.
import { P, K, mezcla, rellena, cajaPx, cilindro, hojaP, sombraPie, ruedaIso, bancoMadera } from './casas.js';
import { mula } from './calles.js';
import { mulberry, lienzo, ES_CELULAR } from './fresco.js';

const Q = (r, c, z = 0) => P(r, c, z);
const linea = (g, a, b, w, col) => { g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); };
const punto = (g, x, y, r, col) => { g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); };
const elip = (g, x, y, rx, ry, col, rot = 0) => { g.fillStyle = col; g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, 7); g.fill(); };
// Poste o pata vertical con luz a la izquierda.
const palo = (g, x, y, h, w, col) => cajaPx(g, x, y, w, w, h, col, { izq: mezcla(col, '#FFFFFF', .15), borde: null });

// ---------- Bancas ----------
// Banca nueva (desde la modernización): patas de concreto, tablas de madera y brazos de hierro.
function bancaNueva(g) {
  sombraPie(g, 0, 0, 5.6, 1.8, .2);
  const en = (sc, sr) => [sc * 16 * .15 - sr * 16 * .05, sc * 8 * .15 + sr * 8 * .05];
  for (const sc of [-.85, .85]) { const p = en(sc, -.1); cajaPx(g, p[0], p[1], .018, .1, 2.5, '#A9A59C', { izq: '#C2BEB4', top: '#B8B4AA' }); }
  for (let k = 0; k < 3; k++) { const p = en(0, .55 - k * .55); cajaPx(g, p[0], p[1], .31, .024, .5, '#8A5A36', { z0: 2.5, top: '#A8744A', izq: '#9A6640' }); }
  for (const sc of [-.92, .92]) { const p = en(sc, -.95); cajaPx(g, p[0], p[1], .012, .012, 3.4, '#34363A', { z0: 2.5, borde: null }); }
  for (let k = 0; k < 2; k++) { const p = en(0, -.98); cajaPx(g, p[0], p[1], .31, .01, .55, '#8A5A36', { z0: 3.9 + k * 1.2, izq: '#A8744A' }); }
}

// ---------- Carritos ----------
// Carrito de mazorca asada (épocas antiguas): cajón de tablas sobre dos ruedas, brasero de lata con carbón encendido,
// mazorcas doradas con la tusa abierta, varas para empujarlo y humito.
function carritoMazorca(g) {
  sombraPie(g, 0, 0, 7.5, 2.4, .22);
  const R = mulberry(11);
  for (const s of [-1, 1]) { const w = Q(.13, s * .16); ruedaIso(g, w[0], w[1] - 2, 2, { col: K.maderaOsc, rayos: 6 }); }
  cajaPx(g, 0, 0, .44, .24, 3.2, K.madera, { z0: 2, izq: K.maderaLuz, top: '#5A3A22' });
  g.strokeStyle = 'rgba(40,25,15,.4)'; g.lineWidth = .25; for (const z of [3.1, 4.2]) { const a = Q(.13, -.24), b = Q(.13, .24); g.beginPath(); g.moveTo(a[0], a[1] - z); g.lineTo(b[0], b[1] - z); g.stroke(); } // tablas
  for (const s of [-.07, .07]) { const a = Q(s, -.24, 4), b = Q(s - .06, -.46, 2.6); linea(g, a, b, .6, K.maderaOsc); } // varas
  const T = cajaPx(g, 0, 0, .32, .17, 1.2, '#4A4A4E', { z0: 5.2, izq: '#626268', top: '#2A2422' }); // brasero de lata
  for (let k = 0; k < 14; k++) { const u = R() - .5, v = R() - .5, p = Q(v * .16, u * .3, 6.4); punto(g, p[0], p[1], .45, R() < .5 ? '#E8762E' : '#FFB040'); } // brasas
  for (let k = 0; k < 4; k++) {
    const p = Q(-.02 + (k % 2) * .03, -.12 + k * .08, 6.9);
    g.save(); g.translate(p[0], p[1]); g.rotate(.46);
    elip(g, 0, 0, 2.1, .85, '#E2B23C'); g.fillStyle = 'rgba(120,70,20,.55)'; for (let q = 0; q < 5; q++) g.fillRect(-1.6 + q * .7, -.5 + (q % 2) * .3, .35, .35); // granos tostados
    hojaP(g, 1.8, 0, .2, 2, .6, '#C9B074', false); hojaP(g, 1.8, .1, -.3, 1.8, .5, '#B49A5E', false); // la tusa abierta
    g.restore();
  }
  g.strokeStyle = 'rgba(230,225,215,.45)'; g.lineWidth = .7; g.lineCap = 'round'; { const p = Q(0, 0, 8); g.beginPath(); g.moveTo(p[0], p[1]); g.bezierCurveTo(p[0] - 1.6, p[1] - 3, p[0] + 1.6, p[1] - 5, p[0] - .4, p[1] - 8.5); g.stroke(); }
  void T;
}
// Carrito de raspado (desde La Violencia): carro blanco con franja azul, bloque de hielo, cepillo de raspar, botellas
// de sirope de colores, vasos y una sombrilla de rayas.
function carritoRaspado(g) {
  sombraPie(g, 0, 0, 7.5, 2.4, .22);
  for (const s of [-1, 1]) { const w = Q(.13, s * .16); ruedaIso(g, w[0], w[1] - 2, 1.8, { llanta: '#2A2A2E', rin: '#B8BCC0' }); }
  const C = cajaPx(g, 0, 0, .44, .24, 4.2, '#F1EEE6', { z0: 1.8, izq: '#FBF8F2', top: '#E2DED4' });
  { const a = C.pt(-1, 1, 1.2), b = C.pt(1, 1, 1.2), c2 = C.pt(1, 1, 2.2), d = C.pt(-1, 1, 2.2); rellena(g, [a, b, c2, d], '#2F6BA0', null); } // franja azul
  for (const s of [-.07, .07]) linea(g, Q(s, -.24, 5), Q(s - .05, -.44, 3.6), .55, '#9AA0A6');
  cajaPx(g, 0, 0, .06, .06, 2.4, '#DDEEF4', { z0: 6, izq: '#F2FAFC', top: '#FFFFFF' }); // bloque de hielo
  { const p = Q(.05, .03, 8.6); g.fillStyle = 'rgba(255,255,255,.8)'; g.fillRect(p[0] - 1.2, p[1], .8, .5); }
  ['#C8283A', '#2E9A4A', '#E8B828', '#E87A2A'].forEach((col, k) => { const p = Q(.07, .11 + k * .028, 6); cilindro(g, p[0], p[1], .55, 2.6, col, { tapa: '#F4F1E8' }); }); // siropes
  for (let k = 0; k < 4; k++) { const p = Q(.06, -.2, 6 + k * .7); elip(g, p[0], p[1], .9, .3, 'rgba(250,250,250,.9)'); } // vasos
  const pie = Q(-.05, -.05); linea(g, [pie[0], pie[1] - 6], [pie[0], pie[1] - 17], .45, '#7A7E84');
  const cx = pie[0], cy = pie[1] - 17;
  for (let k = 0; k < 8; k++) { const a0 = k / 8 * Math.PI * 2, a1 = (k + 1) / 8 * Math.PI * 2; g.fillStyle = k % 2 ? '#F4F1E8' : '#C8283A'; g.beginPath(); g.moveTo(cx, cy - 1.6); g.lineTo(cx + Math.cos(a0) * 7, cy + Math.sin(a0) * 2.6 + 1); g.lineTo(cx + Math.cos(a1) * 7, cy + Math.sin(a1) * 2.6 + 1); g.closePath(); g.fill(); }
  g.fillStyle = 'rgba(0,0,0,.12)'; g.beginPath(); g.ellipse(cx + 1.4, cy + 1.2, 5.6, 1.8, 0, 0, Math.PI); g.fill(); // sombra del ala de la sombrilla
}

// ---------- Tienda de la esquina ----------
// Antigua: mostrador de tablas bajo un alero de teja, estante con frascos y botellas, racimo de plátano colgado,
// bultos de maíz y el letrero pintado a mano. Moderna: mostrador con vidrio, nevera, guacales rojos de gaseosa,
// letrero de lata y dos sillas plásticas.
function tienda(g, moderna, parte) { // parte: 'atras' (pared, estante y letrero) o 'frente' (alero, mostrador y lo demás); el tendero va en medio
  const R = mulberry(moderna ? 33 : 32);
  if (parte === 'atras') {
  sombraPie(g, 2, 1, 12, 4, .2);
  // Pared de atrás (el costado de la casa) con su estante.
  const Mu = cajaPx(g, ...Q(-.18, 0), .62, .04, 15, moderna ? '#E9D8B8' : K.cal, { izq: moderna ? '#F2E4C8' : '#F7F1E6', top: '#CFC4B0' });
  for (let k = 0; k < 3; k++) {
    const z = 4.5 + k * 3.2, a = Q(-.15, -.26, z), b = Q(-.15, .26, z); linea(g, a, b, .7, K.maderaOsc);
    for (let q = 0; q < 7; q++) { const p = Q(-.15, -.23 + q * .075, z + .2); const col = moderna ? ['#C8283A', '#2E6BA0', '#E8B828', '#F4F1E8'][(q + k) % 4] : ['#B07A3A', '#E8E0C8', '#7A9A4A', '#C8A040'][(q + k) % 4]; if (R() < .85) cilindro(g, p[0], p[1], .55, 1.6 + R() * .8, col, { tapa: mezcla(col, '#FFFFFF', .3) }); }
  }
  void Mu;
  }
  // Letrero.
  if (parte === 'atras') return letrero(g, moderna);
  // Alero o toldo.
  if (moderna) { const T = cajaPx(g, ...Q(0, 0), .66, .42, .5, '#C8283A', { z0: 15.5, top: '#E04050', izq: '#D83A48' }); for (let k = 0; k < 6; k++) { const a = T.pt(-1 + k * .4, 1, 0), b = T.pt(-1 + k * .4 + .2, 1, 0); g.fillStyle = '#F4F1E8'; g.fillRect(a[0], a[1] - .5, b[0] - a[0], .5); } }
  else { const T = cajaPx(g, ...Q(0, 0), .66, .42, .7, K.tejaSombra, { z0: 15.4, top: K.teja, izq: K.tejaLuz }); for (let k = 0; k < 9; k++) { const a = T.pt(-1 + k * .25, 1, .7), b = T.pt(-1 + k * .25, -1, .7); g.strokeStyle = K.tejaLinea; g.lineWidth = .3; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); } }
  for (const s of [-1, 1]) { const p = Q(.17, s * .28); palo(g, p[0], p[1], 15.4, .02, K.madera); }
  // Mostrador.
  if (moderna) {
    const M = cajaPx(g, ...Q(.08, 0), .48, .1, 4.6, '#D8D2C4', { izq: '#E6E0D2', top: '#B9C6CC' });
    { const a = M.pt(-.9, 1, 1.4), b = M.pt(.9, 1, 1.4), c2 = M.pt(.9, 1, 4.2), d = M.pt(-.9, 1, 4.2); rellena(g, [a, b, c2, d], 'rgba(190,220,230,.55)', 'rgba(80,90,100,.6)', .3); for (let q = 0; q < 6; q++) { const p = M.pt(-.75 + q * .3, 1, 2.4); punto(g, p[0], p[1], .5, ['#E8B828', '#C8283A', '#7A4A2A'][q % 3]); } } // vitrina con dulces
    const N = Q(-.08, .24); cajaPx(g, N[0], N[1], .1, .1, 9, '#F4F4F2', { izq: '#FFFFFF', top: '#E4E4E2' }); { const p = Q(-.03, .24, 6); g.fillStyle = '#C8283A'; g.fillRect(p[0] - 1.4, p[1] - 1.2, 2.8, 1.4); } // nevera
    for (let k = 0; k < 2; k++) { const p = Q(.22, .14 + k * .02, 0); cajaPx(g, p[0], p[1], .05, .04, 1.6, '#C8283A', { z0: k * 1.6, izq: '#D83A48', top: '#A8202E' }); for (let q = 0; q < 4; q++) { const b = Q(.21 + (q % 2) * .02, .125 + Math.floor(q / 2) * .025, (k + 1) * 1.6); punto(g, b[0], b[1], .32, '#3A2418'); } } // guacales
    for (const [r, c] of [[.3, -.3], [.36, -.18]]) { const p = Q(r, c); for (const [dr, dc] of [[-.02, -.02], [.02, -.02], [-.02, .02], [.02, .02]]) { const q = Q(r + dr, c + dc); linea(g, q, [q[0], q[1] - 2.6], .3, '#F2F2F0'); } cajaPx(g, p[0], p[1], .03, .03, .35, '#F2F2F0', { z0: 2.6, borde: null }); const e = Q(r - .03, c); cajaPx(g, e[0], e[1], .03, .005, 2.6, '#EAEAE8', { z0: 2.9, borde: null }); } // sillas plásticas
  } else {
    const M = cajaPx(g, ...Q(.08, 0), .48, .1, 4.6, K.madera, { izq: K.maderaLuz, top: '#9A6A42' });
    for (let q = 0; q < 4; q++) { const a = M.pt(-1 + q * .5, 1, 0), b = M.pt(-1 + q * .5, 1, 4.6); g.strokeStyle = 'rgba(40,25,15,.4)'; g.lineWidth = .25; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); }
    { const p = Q(.08, -.12, 4.6); cilindro(g, p[0], p[1], .9, 1.4, '#C9B48A', { tapa: '#B8A070' }); const v = Q(.08, .1, 4.6); cajaPx(g, v[0], v[1], .025, .02, .8, '#A8A49C', { z0: 4.6 }); } // frasco de dulces y la pesa
    { const p = Q(.16, -.32, 13.5); linea(g, [p[0], p[1]], [p[0], p[1] + 2], .3, '#6A5A3A'); g.save(); g.translate(p[0], p[1] + 4.4); for (let k = 0; k < 9; k++) { const a = -1.2 + (k % 3) * .5; g.fillStyle = k % 2 ? '#C9B83A' : '#B6A82E'; g.beginPath(); g.ellipse(-1.2 + (k % 3) * 1.2, -1.6 + Math.floor(k / 3) * 1.3, .45, 1.2, a, 0, 7); g.fill(); } g.restore(); } // racimo colgado
    for (const [r, c] of [[.24, .18], [.28, .26]]) { const p = Q(r, c); cilindro(g, p[0], p[1], 1.7, 3.2, '#C9B48A', { arriba: 1.3, tapa: '#BFA87C' }); g.strokeStyle = '#8A6A3A'; g.lineWidth = .3; g.beginPath(); g.moveTo(p[0] - 1.4, p[1] - 2.8); g.lineTo(p[0] + 1.4, p[1] - 2.9); g.stroke(); } // bultos
  }
}

function letrero(g, moderna) {
  const a = Q(-.16, -.22, 13.5), b = Q(-.16, .22, 13.5); const pts = [[a[0], a[1] - 2.4], [b[0], b[1] - 2.4], [b[0], b[1]], [a[0], a[1]]]; rellena(g, pts, moderna ? '#2E6BA0' : '#E7D9A8', 'rgba(60,40,20,.6)', .3);
  g.save(); const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - 1.1]; g.translate(m[0], m[1]); g.transform(1, (b[1] - a[1]) / (b[0] - a[0]), 0, 1, 0, 0); g.fillStyle = moderna ? '#FFFFFF' : '#7A2A1E'; g.font = 'bold 1.6px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(moderna ? 'MISCELÁNEA' : 'LA ESPERANZA', 0, 0); g.restore();
}
// ---------- Mesa de dominó o de parqués, con sus taburetes ----------
function taburete(g, x, y, cuero) {
  sombraPie(g, x, y, 1.8, .6, .2);
  for (const [dx, dy] of [[-1, .2], [1, .2], [0, -.4]]) linea(g, [x + dx * .9, y + dy * .8], [x + dx * .4, y - 2.9], .45, K.maderaOsc);
  cilindro(g, x, y - 2.8, 1.5, .5, cuero ? '#8A5A36' : '#6E4529', { tapa: cuero ? '#A8744A' : K.maderaLuz });
}
function mesaJuego(g, parques) {
  const R = mulberry(parques ? 7 : 6);
  sombraPie(g, 0, 0, 5, 2, .2);
  for (const [r, c] of [[-.06, -.06], [.06, -.06], [-.06, .06], [.06, .06]]) { const p = Q(r, c); palo(g, p[0], p[1], 3.6, .008, K.maderaOsc); }
  const T = cajaPx(g, 0, 0, .15, .15, .5, K.madera, { z0: 3.6, izq: K.maderaLuz, top: parques ? '#EDE6D4' : '#9A6A42' });
  if (parques) { // tablero de parqués: cuatro casas de colores y la cruz de casillas
    const cols = ['#C8283A', '#2E9A4A', '#2E6BA0', '#E8B828'];
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([a, b], k) => { const c0 = T.pt(a * .9, b * .9, .5), c1 = T.pt(a * .35, b * .9, .5), c2 = T.pt(a * .35, b * .35, .5), c3 = T.pt(a * .9, b * .35, .5); rellena(g, [c0, c1, c2, c3], cols[k], null); });
    const m = T.pt(0, 0, .5); punto(g, m[0], m[1], .5, '#3A2418');
    const v = Q(.03, .07, 4.1); cilindro(g, v[0], v[1], .55, 1.1, '#3A2418', { tapa: '#5A3A22' }); // cubilete
    for (const [dx, k] of [[-1.6, 0], [1, 1]]) { const p = Q(-.03 + k * .03, -.05 + k * .02, 4.1); cajaPx(g, p[0] + dx * .3, p[1], .012, .012, .55, '#F4F1E8', { borde: 'rgba(0,0,0,.3)' }); } // dados
  } else { // fichas de dominó: una fila jugada y unas boca abajo
    for (let k = 0; k < 6; k++) { const p = Q(-.02 + (k % 2) * .004, -.06 + k * .022, 4.1); g.save(); g.translate(p[0], p[1]); g.transform(1, .5, -1, .5, 0, 0); g.fillStyle = '#F4F1E8'; g.fillRect(-.35, -.7, .7, 1.4); g.fillStyle = '#2A2420'; g.fillRect(-.35, -.03, .7, .06); for (let q = 0; q < 3; q++) punto(g, (R() - .5) * .4, -.4 + q * .4 + (q > 0 ? .1 : 0), .07, '#2A2420'); g.restore(); }
    for (let k = 0; k < 5; k++) { const p = Q(.05, -.05 + k * .022, 4.1); g.save(); g.translate(p[0], p[1]); g.transform(1, .5, -1, .5, 0, 0); g.fillStyle = '#2A2420'; g.fillRect(-.35, -.7, .7, 1.4); g.restore(); }
  }
}

// ---------- Cancha de tejo (épocas antiguas): dos bocines de greda con su aro de hierro y las mechas de pólvora ----------
function bocin(g, x, y, k) {
  const B = cajaPx(g, x, y, .2, .18, 1.6, '#6E5A3E', { izq: '#7E6A48', top: '#5A4A3A' }); // el cajón de madera
  const m = B.pt(0, 0, 1.6); elip(g, m[0], m[1], 4.4, 2.1, '#7A6A5A'); elip(g, m[0] - .5, m[1] - .3, 3, 1.3, '#8C7C6A'); // greda mojada
  g.strokeStyle = '#3A3A3E'; g.lineWidth = .45; g.beginPath(); g.ellipse(m[0], m[1], 1.5, .7, 0, 0, 7); g.stroke(); // el bocín
  for (const [dx, dy] of [[0, -.75], [1.5, 0], [0, .75], [-1.5, 0]]) { g.fillStyle = '#F4F1E8'; g.beginPath(); g.moveTo(m[0] + dx, m[1] + dy - .9); g.lineTo(m[0] + dx + .6, m[1] + dy); g.lineTo(m[0] + dx - .6, m[1] + dy); g.closePath(); g.fill(); g.strokeStyle = 'rgba(160,40,30,.7)'; g.lineWidth = .15; g.stroke(); } // mechas
  if (k) for (const [dx, dy] of [[-2.2, .3], [2.4, -.2]]) elip(g, m[0] + dx, m[1] + dy, .7, .32, '#5A5A60'); // tejos que ya cayeron
}
function canchaTejo(g) {
  const a = Q(0, -.36), b = Q(0, .36);
  g.save(); g.globalAlpha = .35; g.fillStyle = '#9A7A52'; g.beginPath(); g.moveTo(...Q(-.07, -.45)); g.lineTo(...Q(-.07, .45)); g.lineTo(...Q(.07, .45)); g.lineTo(...Q(.07, -.45)); g.closePath(); g.fill(); g.restore(); // la pista de tierra
  bocin(g, a[0], a[1], 0); bocin(g, b[0], b[1], 1);
  for (const s of [-1, 1]) { const p = Q(.1, s * .44); palo(g, p[0], p[1], 6, .012, K.madera); } // estacas con el tablero
  { const p = Q(.1, -.44, 6); rellena(g, [[p[0] - 2.4, p[1] - 3], [p[0] + 2.4, p[1] - 1.8], [p[0] + 2.4, p[1] + .6], [p[0] - 2.4, p[1] - .6]], '#2A3A2E', 'rgba(0,0,0,.4)', .2); g.strokeStyle = '#F4F1E8'; g.lineWidth = .2; for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(p[0] - 1.8, p[1] - 2 + k * .9); g.lineTo(p[0] - .2, p[1] - 1.6 + k * .9); g.stroke(); } } // tablero con las rayas del puntaje
}
// El tejo que vuela (un disco de hierro).
function tejoDisco(g) { elip(g, 0, 0, 1, .55, '#5A5A60'); elip(g, -.25, -.15, .55, .25, '#8A8A90'); }

// ---------- Pozo y alberca ----------
// Pozo de piedra con su brocal, dos horcones, el rodillo con manivela y el balde colgado de la soga.
function pozo(g) {
  const R = mulberry(21);
  sombraPie(g, 0, 0, 6.4, 2.2, .24);
  cilindro(g, 0, 0, 4.4, 4.6, '#9A9284', { tapa: '#3A4A52' });
  for (let k = 0; k < 16; k++) { const a = Math.PI * (k % 8) / 8 + (k > 7 ? .2 : 0), y = -1.2 - (k > 7 ? 2.2 : 0); const x = -Math.cos(a) * 4.2; if (Math.abs(x) < 4.2) { g.strokeStyle = 'rgba(60,55,45,.35)'; g.lineWidth = .3; g.beginPath(); g.ellipse(x, y + Math.sin(a) * 1.6, 1.1, .55, 0, 0, 7); g.stroke(); } }
  g.fillStyle = '#2A3A42'; g.beginPath(); g.ellipse(0, -4.6, 3.6, 1.55, 0, 0, 7); g.fill(); g.fillStyle = 'rgba(160,200,220,.35)'; g.beginPath(); g.ellipse(-.8, -4.9, 1.4, .4, 0, 0, 7); g.fill(); // el agua al fondo
  g.strokeStyle = '#B4AC9C'; g.lineWidth = .9; g.beginPath(); g.ellipse(0, -4.6, 4.2, 1.85, 0, 0, 7); g.stroke(); // brocal
  for (const s of [-1, 1]) { const p = Q(0, s * .14); palo(g, p[0], p[1] - 3.6, 9, .018, K.maderaOsc); }
  const a = Q(0, -.14, 11.4), b = Q(0, .14, 11.4); linea(g, a, b, 1.3, K.madera); linea(g, a, b, .5, K.maderaLuz); // rodillo
  linea(g, [b[0], b[1]], [b[0] + 1.6, b[1] + 1], .45, '#5A5A60'); linea(g, [b[0] + 1.6, b[1] + 1], [b[0] + 1.6, b[1] + 2.4], .45, '#5A5A60'); // manivela
  const m = Q(0, .02, 11.4); linea(g, m, [m[0], m[1] + 5.6], .25, '#C9B48A'); // soga
  cilindro(g, m[0], m[1] + 8.4, 1, 1.9, '#8A6A48', { arriba: 1.2, aros: 1, tapa: '#6E9FB4' }); // balde
  void R;
}
// Alberca de concreto con su lavadero de surcos, agua, una barra de jabón y una ponchera.
function alberca(g) {
  sombraPie(g, 0, 0, 8, 2.8, .22);
  const A = cajaPx(g, ...Q(-.02, -.09), .24, .2, 4.6, '#C9C4B8', { izq: '#D8D3C8', top: '#B9B4A8' });
  { const c = [A.pt(-.8, -.8, 4.6), A.pt(.8, -.8, 4.6), A.pt(.8, .8, 4.6), A.pt(-.8, .8, 4.6)]; rellena(g, c, '#6E9FB4', null); g.fillStyle = 'rgba(255,255,255,.35)'; const m = A.pt(-.2, 0, 4.6); g.fillRect(m[0] - 1.6, m[1] - .2, 2.4, .35); }
  const L = cajaPx(g, ...Q(-.02, .13), .18, .2, 4, '#BDB8AC', { izq: '#CCC7BC', top: '#C6C1B6' });
  for (let k = 0; k < 6; k++) { const a = L.pt(-.85 + k * .32, -.9, 4), b = L.pt(-.85 + k * .32, .9, 4); g.strokeStyle = 'rgba(90,85,75,.5)'; g.lineWidth = .3; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); } // surcos del lavadero
  { const p = L.pt(.5, .4, 4); cajaPx(g, p[0], p[1], .02, .012, .5, '#7AA6C8', { borde: null, top: '#9AC0DC' }); } // jabón azul
  { const p = Q(.2, -.06); cilindro(g, p[0], p[1], 2, 1.4, '#3E7AB0', { arriba: 2.6, tapa: '#C8E0EC' }); } // ponchera de plástico
}

// ---------- Huerta con cerca ----------
// Eras de tierra con cebolla larga, cilantro, tomate en tutores, lechugas y maíz; cerca de estacas con varas.
function huerta(g, k) {
  const R = mulberry(41 + k), W = .3, H = .2;
  const cs = [Q(-H, -W), Q(-H, W), Q(H, W), Q(H, -W)];
  rellena(g, cs, '#6E5236', null);
  for (let q = 0; q < 40; q++) { const p = Q((R() - .5) * 2 * H, (R() - .5) * 2 * W); elip(g, p[0], p[1], .5 + R() * .5, .25, R() < .5 ? 'rgba(140,110,70,.5)' : 'rgba(60,40,25,.4)'); } // terrones
  const eras = 4;
  for (let e = 0; e < eras; e++) {
    const r = -H + (e + .5) * 2 * H / eras, tipo = (e + k) % 4;
    { const a = Q(r - .02, -W + .03), b = Q(r - .02, W - .03); linea(g, a, b, 1.1, 'rgba(90,64,40,.9)'); linea(g, [a[0], a[1] - .3], [b[0], b[1] - .3], .4, 'rgba(160,125,85,.6)'); } // lomo de la era
    for (let q = 0; q < 6; q++) {
      const p = Q(r, -W + .06 + q * (2 * W - .12) / 5);
      if (tipo === 0) for (let h = 0; h < 4; h++) hojaP(g, p[0] + (h - 1.5) * .3, p[1], -Math.PI / 2 + (h - 1.5) * .12, 3.2 + R(), .35, h % 2 ? '#5E9A3E' : '#7AB04E', false); // cebolla larga
      else if (tipo === 1) for (let h = 0; h < 7; h++) { const a = -Math.PI / 2 + (h - 3) * .35; hojaP(g, p[0], p[1], a, 1.5 + R() * .5, .4, h % 2 ? '#4E8A36' : '#6EA448', false); } // cilantro
      else if (tipo === 2) { linea(g, p, [p[0], p[1] - 5], .3, '#9A8A5E'); for (let h = 0; h < 5; h++) hojaP(g, p[0], p[1] - 1 - h * .8, h % 2 ? -.6 : -2.5, 1.6, .5, '#4E7A36'); punto(g, p[0] + .6, p[1] - 2.6, .5, '#D8402A'); if (q % 2) punto(g, p[0] - .5, p[1] - 3.6, .45, '#E8A03A'); } // tomate en su tutor
      else { for (let h = 0; h < 8; h++) { const a = h / 8 * Math.PI * 2; elip(g, p[0] + Math.cos(a) * .7, p[1] - .8 + Math.sin(a) * .35, .7, .45, h % 2 ? '#8CC05A' : '#A8D070', a); } elip(g, p[0], p[1] - 1, .6, .4, '#C8E08A'); } // lechuga
    }
  }
  // Cerca: estacas de guadua y dos varas, sin la orilla de adelante (para ver la huerta).
  const est = [];
  for (let q = 0; q <= 6; q++) est.push(Q(-H, -W + q * W / 3)); for (let q = 1; q <= 4; q++) est.push(Q(-H + q * H / 2, -W)); for (let q = 1; q <= 4; q++) est.push(Q(-H + q * H / 2, W));
  for (const p of est) { linea(g, p, [p[0], p[1] - 4.2], .55, '#9A8A4E'); punto(g, p[0], p[1] - 4.2, .3, '#B8A86A'); }
  for (const z of [1.6, 3.4]) { linea(g, [cs[3][0], cs[3][1] - z], [cs[0][0], cs[0][1] - z], .35, '#8A7A48'); linea(g, [cs[0][0], cs[0][1] - z], [cs[1][0], cs[1][1] - z], .35, '#8A7A48'); linea(g, [cs[1][0], cs[1][1] - z], [cs[2][0], cs[2][1] - z], .35, '#8A7A48'); }
}

// ---------- Columpio y balancín (desde La Violencia) ----------
// Marco de tubo pintado: dos patas en A a cada lado y el travesaño; las sillas van aparte (se mecen).
const ALTO_COLUMPIO = 12.5;
function columpio(g) {
  sombraPie(g, 0, 0, 8, 2.4, .2);
  for (const s of [-1, 1]) { const top = Q(0, s * .26, ALTO_COLUMPIO); for (const d of [-1, 1]) { const pie = Q(d * .17, s * .3); linea(g, pie, top, .8, '#B83A2E'); linea(g, [pie[0] - .2, pie[1]], [top[0] - .2, top[1]], .25, 'rgba(255,200,190,.5)'); } }
  const a = Q(0, -.28, ALTO_COLUMPIO), b = Q(0, .28, ALTO_COLUMPIO); linea(g, a, b, .9, '#2F6BA0'); linea(g, [a[0], a[1] - .3], [b[0], b[1] - .3], .3, 'rgba(200,225,250,.6)');
}
// Silla del columpio: el ancla es el punto de donde cuelga (arriba); cadenas y tabla.
function columpioSilla(g) {
  const L = ALTO_COLUMPIO - 3.2;
  for (const d of [-1.1, 1.1]) { g.strokeStyle = '#6A6E74'; g.lineWidth = .3; g.setLineDash([.35, .25]); g.beginPath(); g.moveTo(d * .9, 0); g.lineTo(d, L); g.stroke(); g.setLineDash([]); }
  cajaPx(g, 0, L + .4, .05, .03, .4, '#8A5A36', { top: '#A8744A', izq: '#9A6640', borde: null });
}
function balancin(g) {
  sombraPie(g, 0, 0, 6, 1.8, .2);
  cajaPx(g, 0, 0, .06, .14, 2.6, '#2F6BA0', { izq: '#3E7EB8', top: '#5A90C4' });
  const p = Q(0, 0, 2.6); punto(g, p[0], p[1], .6, '#3A3A3E');
}
// Tabla del balancín: el ancla es el eje (centro), a lo largo de c, con agarraderas en las puntas.
function balancinTabla(g) {
  const a = Q(0, -.34), b = Q(0, .34);
  g.strokeStyle = '#C8A040'; g.lineWidth = 1.4; g.lineCap = 'round'; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke();
  g.strokeStyle = 'rgba(255,240,200,.6)'; g.lineWidth = .4; g.beginPath(); g.moveTo(a[0], a[1] - .5); g.lineTo(b[0], b[1] - .5); g.stroke();
  for (const f of [.18, .82]) { const p = [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]; g.strokeStyle = '#B83A2E'; g.lineWidth = .4; g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(p[0], p[1] - 2.4); g.lineTo(p[0] + .9, p[1] - 2); g.stroke(); }
}

// ---------- Mula amarrada a su poste, con la enjalma y los bultos ----------
function mulaAmarrada(g) {
  g.save(); g.scale(.62, .62); mula(g, 0); g.restore();
  const p = [12, -1]; palo(g, p[0], p[1], 6, .02, K.maderaOsc);
  g.strokeStyle = '#8A6A3A'; g.lineWidth = .3; g.beginPath(); g.moveTo(9.4, -11.6); g.quadraticCurveTo(11, -6, p[0], p[1] - 4.6); g.stroke(); // el cabestro
}

// ---------- Paloma ----------
// pose: 0 de pie, 1 picoteando, 2 y 3 volando (alas arriba y abajo). Gris con el cuello tornasolado.
function paloma(g, pose) {
  if (pose < 2) {
    elip(g, .3, 0, 1.4, .4, 'rgba(40,40,30,.22)');
    linea(g, [-.2, -.9], [-.3, 0], .25, '#C85A5A'); linea(g, [.4, -.9], [.4, 0], .25, '#C85A5A');
    g.save(); if (pose === 1) { g.translate(1.2, -1.4); g.rotate(.55); g.translate(-1.2, 1.4); }
    elip(g, -.2, -1.7, 1.9, 1.1, '#8E929C'); elip(g, -.6, -1.5, 1.2, .7, '#7A7E88'); // cuerpo y ala
    g.fillStyle = '#5E626C'; g.beginPath(); g.moveTo(-1.8, -1.6); g.lineTo(-3.2, -1.2); g.lineTo(-2.9, -2); g.closePath(); g.fill(); // cola
    elip(g, 1.2, -2.6, .8, .9, '#7E8A8E'); g.fillStyle = 'rgba(120,180,140,.6)'; g.beginPath(); g.ellipse(1, -2.2, .55, .5, 0, 0, 7); g.fill(); // cuello tornasolado
    elip(g, 1.5, -3.3, .6, .55, '#9A9EA8'); punto(g, 1.7, -3.4, .14, '#2A1E18'); linea(g, [2, -3.2], [2.5, -3.05], .2, '#E8C8B8');
    g.restore(); return;
  }
  const a = pose === 2 ? -1 : 1;
  elip(g, 0, 0, 1.8, .7, '#8E929C');
  for (const s of [-1, 1]) { g.fillStyle = s < 0 ? '#7A7E88' : '#9A9EA8'; g.beginPath(); g.moveTo(-.4, 0); g.quadraticCurveTo(-.2 + s * .2, a * 2.2, -1.6 + s * .4, a * 3.4); g.lineTo(.6, -.2); g.closePath(); g.fill(); }
  elip(g, 1.6, -.4, .55, .5, '#9A9EA8');
}

// ---------- Hoja ----------
// [clave, ancho, alto, anclaX, anclaY, pintura] en píxeles del mundo.
function recetas() {
  return [
    ['bancaNueva', 16, 10, 8, 6, bancaNueva], ['bancaVieja', 16, 10, 8, 6, g => bancoMadera(g, 0, 0)],
    ['carritoMazorca', 22, 20, 11, 14, carritoMazorca], ['carritoRaspado', 22, 26, 11, 20, carritoRaspado],
    ['tienda0', 30, 30, 14, 21, g => tienda(g, false, 'frente')], ['tienda1', 30, 30, 14, 21, g => tienda(g, true, 'frente')], ['tienda0A', 30, 30, 14, 21, g => tienda(g, false, 'atras')], ['tienda1A', 30, 30, 14, 21, g => tienda(g, true, 'atras')], ['taburete', 6, 6, 3, 4, g => taburete(g, 0, 0, true)],
    ['mesaDomino', 14, 12, 7, 7, g => mesaJuego(g, false)], ['mesaParques', 14, 12, 7, 7, g => mesaJuego(g, true)],
    ['canchaTejo', 44, 24, 22, 14, canchaTejo], ['tejoDisco', 4, 3, 2, 1.5, tejoDisco],
    ['pozo', 18, 24, 9, 17, pozo], ['alberca', 22, 16, 11, 10, alberca],
    ['huerta0', 34, 24, 17, 13, g => huerta(g, 0)], ['huerta1', 34, 24, 17, 13, g => huerta(g, 1)],
    ['columpio', 30, 22, 15, 15, columpio], ['columpioSilla', 6, 12, 3, 1, columpioSilla],
    ['balancin', 16, 8, 8, 5, balancin], ['balancinTabla', 26, 12, 13, 7, balancinTabla],
    ['mula', 26, 20, 11, 16, mulaAmarrada],
    ['paloma0', 8, 6, 4, 4.6, g => paloma(g, 0)], ['paloma1', 8, 6, 4, 4.6, g => paloma(g, 1)], ['paloma2', 8, 8, 4, 4, g => paloma(g, 2)], ['paloma3', 8, 8, 4, 4, g => paloma(g, 3)]
  ];
}
let HOJA = null;
export function hornearMobiliario() {
  if (HOJA) return HOJA;
  const E = ES_CELULAR ? 3 : 4, sep = 2, ancho = 1024, marcos = {}, L = recetas();
  let x = sep, y = sep, fila = 0;
  for (const [k, w, h, ax, ay] of L) { const W = Math.ceil(w * E), H = Math.ceil(h * E); if (x + W > ancho) { x = sep; y += fila + sep; fila = 0; } marcos[k] = { x, y, w: W, h: H, ax: ax * E, ay: ay * E }; x += W + sep; fila = Math.max(fila, H); }
  const alto = y + fila + sep, cv = lienzo(ancho, ES_CELULAR ? alto : 2 ** Math.ceil(Math.log2(alto))), g = cv.getContext('2d'); // en computador, lados potencia de dos (nítido al verse pequeño)
  for (const [k, , , , , f] of L) { const m = marcos[k]; g.save(); g.beginPath(); g.rect(m.x, m.y, m.w, m.h); g.clip(); g.translate(m.x + m.ax, m.y + m.ay); g.scale(E, E); f(g); g.restore(); }
  HOJA = { canvas: cv, marcos, escala: E }; return HOJA;
}
export const PINCELES_MOBILIARIO = Object.fromEntries(recetas().map(r => [r[0], r]));
export { ALTO_COLUMPIO };
