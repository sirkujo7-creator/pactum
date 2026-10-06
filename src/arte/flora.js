// Árboles y plantas del Tolima (6 de octubre; prueba aprobada por Juan en pruebas/naturaleza.html). Estilo plano,
// con hojas pequeñas en tres pasadas (sombra, color y luz arriba a la izquierda) y una sombra suave en el suelo que
// cae abajo a la derecha, más larga cuanto más alto es el árbol: un solo sol para todo el mapa.
// Biodiversidad: palma de cera, guadua, samán, ceiba, guayacán amarillo, ocobo, cámbulo, yarumo, mango, cafeto,
// plátano, cardón, árbol del bosque de niebla y frailejón (redibujado a pedido de Juan).
import { mulberry, lienzo, RES_HOJA } from './fresco.js';
import { sh, mezcla, pol, elip, follaje, tronco, sombraSuave } from './plano.js';

const VERDES = { claro: ['#3F6631', '#5E8B42', '#8DB35C'], oscuro: ['#2A4A2C', '#3E6B3A', '#5E8A4A'], niebla: ['#24402A', '#34583A', '#557A4E'], cafe: ['#1E3E22', '#2F5A32', '#4E7A3A'] };
const SECO = '#B39B57';

// seco: 0 lluvias a 1 sequía (las hojas se doran; las flores no).
function pinceles(seco = 0) {
  const v = cols => cols.map(c => mezcla(c, SECO, seco * .45));
  const palma = g => { // palma de cera del Quindío: el árbol nacional
    sombraSuave(g, 1.6, 54, 9, .26);
    tronco(g, 0, 0, .6, -54, 1.5, 1.1, '#DCD6CA');
    g.fillStyle = 'rgba(120,110,95,.45)'; for (let y = -4; y > -52; y -= 3.2) g.fillRect(-1.3, y, 2.6, .5);
    const fronda = (a, L, c) => {
      const x1 = Math.cos(a) * L, y1 = -54 + Math.sin(a) * L * .55 + L * .32;
      g.strokeStyle = c; g.lineWidth = .9; g.lineCap = 'round'; g.beginPath(); g.moveTo(.6, -54); g.quadraticCurveTo(x1 * .5, -54 + Math.sin(a) * L * .4 - 3, x1, y1); g.stroke();
      for (let k = 1; k < 9; k++) { const t = k / 9, x = .6 + (x1 - .6) * t, y = -54 + (y1 + 54) * t - Math.sin(t * Math.PI) * 3; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 1.2 * Math.sign(x1 || 1) * .3, y + 3.2); g.moveTo(x, y); g.lineTo(x - .8, y + 2.8); g.stroke(); }
    };
    const [o, m, l] = v(['#2E5A30', '#4E7A3A', '#6E9A4A']);
    for (let k = 0; k < 6; k++) fronda(-Math.PI + k * Math.PI / 5 + .05, 13, o);
    for (let k = 0; k < 7; k++) fronda(-Math.PI * .95 + k * Math.PI / 6.4, 12, k < 3 ? l : m);
    elip(g, .6, -54, 1.6, 1.2, '#6E6A5E');
  };
  const guadua = (g, R) => {
    sombraSuave(g, 6, 30, 7, .24);
    const tallos = []; for (let k = 0; k < 8; k++) tallos.push([(k - 3.5) * 1.1 + (R() - .5) * .6, (k - 3.5) * 3.2 + (R() - .5) * 2, 34 + R() * 12]);
    const en = ([x0, ab, h], t) => [x0 + ab * t * t, -h * t + (t > .75 ? (t - .75) * h * .4 : 0)];
    const [c1, c2] = v(['#9DB35A', '#86A24A']), hojas = v(['#3F6631', '#5E8B42', '#4E7A3A']);
    tallos.forEach((T, k) => {
      g.strokeStyle = k % 2 ? c1 : c2; g.lineWidth = 1.2; g.lineCap = 'round'; g.beginPath(); for (let j = 0; j <= 14; j++) { const q = en(T, j / 14); j ? g.lineTo(...q) : g.moveTo(...q); } g.stroke();
      g.fillStyle = '#5E7A2E'; for (let j = 1; j < 8; j++) { const q = en(T, j / 9); g.fillRect(q[0] - .8, q[1], 1.6, .5); }
    });
    tallos.forEach((T, k) => { for (let j = 0; j < 12; j++) { const t = .42 + j * .048, q = en(T, t), s = j % 2 ? 1 : -1; g.save(); g.translate(...q); g.rotate(s * (.9 + R() * .4)); g.fillStyle = hojas[(k + j) % 3]; g.beginPath(); g.ellipse(0, 2.6, .55, 2.8, 0, 0, 7); g.fill(); g.restore(); } });
  };
  const saman = (g, R) => { // samán del valle: copa ancha y plana como un paraguas
    sombraSuave(g, 2.6, 18, 24, .26);
    tronco(g, 0, 0, -.6, -9, 2.6, 2, '#6B4A33'); tronco(g, -.6, -8, -8, -13, 1.2, .8, '#6B4A33'); tronco(g, -.6, -8, 8, -14, 1.2, .8, '#6B4A33'); tronco(g, -.4, -8, 1, -15, 1, .7, '#6B4A33');
    follaje(g, R, 0, -18, 25, 6.6, v(VERDES.claro), 260, 1.7);
  };
  const ceiba = (g, R) => { // ceiba: tronco gris y recto con bambas, ramas en pisos
    sombraSuave(g, 3.2, 30, 16, .26);
    for (const s of [-1, 1]) pol(g, [[s * 9, 0], [s * 2.4, -2], [s * 1.6, -12], [s * .6, 0]], s < 0 ? '#A8A296' : '#8E887C');
    tronco(g, 0, 0, 0, -34, 3.2, 2, '#A8A296');
    for (const [y, L] of [[-20, 12], [-27, 15], [-33, 11]]) { tronco(g, 0, y, -L, y - 3, .9, .5, '#9A9488'); tronco(g, 0, y, L, y - 4, .9, .5, '#9A9488'); }
    const cl = v(VERDES.claro);
    follaje(g, R, -11, -24, 8, 2.8, cl, 60, 1.5); follaje(g, R, 12, -26, 8, 2.8, cl, 60, 1.5);
    follaje(g, R, 0, -36, 16, 4.6, cl, 140, 1.6);
  };
  const florido = (g, R, flores) => { // guayacán y ocobo: copa redonda cubierta de flores
    sombraSuave(g, 1.6, 20, 12, .26);
    g.save(); g.fillStyle = flores[1]; g.globalAlpha = .7; for (let k = 0; k < 18; k++) { g.beginPath(); g.arc(4 + (R() - .3) * 20, 2 + (R() - .5) * 3, .6, 0, 7); g.fill(); } g.restore(); // flores caídas
    tronco(g, 0, 0, .4, -12, 1.6, 1.1, '#6E5440'); tronco(g, .2, -9, -6, -16, .8, .5, '#6E5440'); tronco(g, .2, -9, 6, -17, .8, .5, '#6E5440');
    follaje(g, R, 0, -20, 12, 8, v(VERDES.claro), 50, 1.4);
    follaje(g, R, 0, -21, 12.6, 8.4, flores, 200, 1.2, 'flor');
  };
  const cambulo = (g, R) => { // cámbulo: ramas casi sin hojas y flores rojo naranja; da sombra al café
    sombraSuave(g, 1.7, 20, 11, .22);
    tronco(g, 0, 0, 0, -14, 1.7, 1.2, '#7A6A58');
    for (const [x, y] of [[-10, -22], [-4, -27], [5, -26], [11, -20], [0, -20]]) tronco(g, 0, -12, x, y, .8, .4, '#7A6A58');
    for (const [x, y] of [[-10, -22], [-4, -27], [5, -26], [11, -20], [0, -20], [-6, -18], [7, -18]]) follaje(g, R, x, y, 3.4, 2.4, ['#B23A22', '#D9562E', '#F08A44'], 22, 1.1, 'flor');
  };
  const yarumo = g => { // yarumo: tronco blanco y hojas grandes como manos, plateadas por debajo
    sombraSuave(g, 1.2, 26, 8, .22);
    tronco(g, 0, 0, .4, -26, 1.2, .8, '#E2DED4'); g.fillStyle = 'rgba(120,110,95,.4)'; for (let y = -3; y > -24; y -= 3.4) g.fillRect(-1, y, 2, .4);
    tronco(g, .4, -20, -7, -28, .6, .4, '#E2DED4'); tronco(g, .4, -22, 7, -31, .6, .4, '#E2DED4');
    const [verde] = v(['#7E9A6A']);
    const mano = (x, y, s) => { for (let k = 0; k < 7; k++) { const a = -Math.PI / 2 + (k - 3) * .52; g.save(); g.translate(x, y); g.rotate(a + Math.PI / 2); g.fillStyle = k % 2 ? '#C9CFC0' : verde; g.beginPath(); g.ellipse(0, -3.4 * s, .9 * s, 3.2 * s, 0, 0, 7); g.fill(); g.restore(); } };
    mano(-7, -28, 1); mano(7, -31, 1.1); mano(.4, -27, .9);
  };
  const mango = (g, R) => { // palo de mango: copa redonda, densa y oscura, con mangos
    sombraSuave(g, 2, 17, 12, .28);
    tronco(g, 0, 0, 0, -9, 2, 1.4, '#5E4636');
    follaje(g, R, 0, -18, 12.6, 9.4, v(VERDES.oscuro), 240, 1.7);
    for (let k = 0; k < 7; k++) { const x = (R() - .5) * 18, y = -15 + (R() - .3) * 9; elip(g, x, y, .9, 1.2, k % 2 ? '#E8A23A' : '#D9822E'); }
  };
  const arbol = (g, R) => { // árbol de sombra de parques y plazas (guácimo): copa redonda y clara
    sombraSuave(g, 1.6, 15, 10, .26);
    tronco(g, 0, 0, 0, -9, 1.6, 1.1, '#6B4A33'); tronco(g, 0, -7, -4, -12, .7, .4, '#6B4A33'); tronco(g, 0, -7, 4, -13, .7, .4, '#6B4A33');
    follaje(g, R, 0, -16, 10.4, 7.6, v(VERDES.claro), 170, 1.6);
  };
  const arbusto = (g, R) => {
    sombraSuave(g, 5, 3, 5, .24);
    follaje(g, R, 0, -3.6, 6, 3.6, v(['#4E6A36', '#6F8A48', '#93A862']), 60, 1.3);
  };
  const arbolNiebla = (g, R) => { // bosque de niebla: tronco alto con musgo, copa en pisos y bromelias rojas
    sombraSuave(g, 1.4, 24, 8, .26);
    tronco(g, 0, 0, 0, -18, 1.5, 1, '#5A4A3A'); g.fillStyle = '#6E8A4A'; g.fillRect(-1.4, -9, 1.1, 5); g.fillRect(-1.2, -15, .9, 3); // musgo
    const N = v(VERDES.niebla);
    follaje(g, R, 0, -17, 8.4, 4.4, N, 80, 1.5); follaje(g, R, .4, -24, 7, 4, N, 70, 1.5); follaje(g, R, 0, -30.4, 4.8, 3.4, N, 44, 1.4);
    for (const [x, y] of [[-5.4, -16.4], [4.6, -22], [-2.6, -27]]) { elip(g, x, y, .9, .6, '#C8352A'); elip(g, x + .7, y - .3, .5, .4, '#E25A3A'); }
  };
  const cardon = g => { // cardón: cactus de columnas con costillas, del sur seco
    sombraSuave(g, 2.6, 16, 5, .26);
    const V = mezcla('#7E9A5A', SECO, seco * .2), O = sh(V, -.24), Lz = sh(V, .2);
    // Tronco y brazos en candelabro: cada brazo sale de lado y sube, con el codo redondo.
    const ramas = [[[0, -5.4], [-4.6, -5.4], [-4.6, -15]], [[0, -8], [4.4, -8], [4.4, -17]], [[0, -2.4], [0, -22]]];
    const trazo = (pts, w, col, dx = 0) => { g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x + dx, y) : g.moveTo(x + dx, y)); g.stroke(); };
    for (const [i, r] of ramas.entries()) { const w = i < 2 ? 3.4 : 4.8; trazo(r, w, O); trazo(r, w * .62, V, -w * .18); trazo(r.slice(-2), w * .16, Lz, -w * .3); }
    g.strokeStyle = sh(V, -.4); g.lineWidth = .25; for (const x of [-.9, .9]) { g.beginPath(); g.moveTo(x, -.5); g.lineTo(x, -21.6); g.stroke(); }
    elip(g, 0, -22.6, 1, .6, '#E8C23A'); elip(g, 4.4, -17.5, .7, .45, '#E8C23A');
  };
  const cafeto = (g, R) => { // mata de café con sus cerezas
    sombraSuave(g, 3, 6, 4.4, .26);
    tronco(g, 0, 0, 0, -3, .5, .4, '#5E4636');
    follaje(g, R, 0, -7, 5, 5, v(VERDES.cafe), 70, 1.2);
    for (let k = 0; k < 8; k++) elip(g, (R() - .5) * 7, -7 + (R() - .5) * 7, .6, .6, k % 3 ? '#B8322A' : '#E04A2E');
  };
  const platano = (g, R) => { // mata de plátano
    sombraSuave(g, 1.6, 12, 8, .24);
    tronco(g, 0, 0, 0, -12, 1.6, 1.3, '#8A9A5A');
    const [l, o, n] = v(['#6E9A4A', '#4E7A3A', '#B6CC80']);
    for (let k = 0; k < 6; k++) {
      const a = -Math.PI / 2 + (k - 2.5) * .62, L = 11 + R() * 3, x = Math.cos(a) * L, y = -12 + Math.sin(a) * L * .7 + 4;
      g.fillStyle = k < 3 ? l : o; g.beginPath(); g.moveTo(0, -12); g.quadraticCurveTo(x * .5 - 2.6, y - 5, x, y); g.quadraticCurveTo(x * .5 + 2.6, y - .6, 0, -11.2); g.fill();
      g.strokeStyle = n; g.lineWidth = .35; g.beginPath(); g.moveTo(0, -12); g.quadraticCurveTo(x * .5, y - 3, x, y); g.stroke();
    }
    elip(g, 1.8, -8, 1.3, 2.4, '#6E4A6A', .3);
  };
  // Frailejón del páramo (redibujado a pedido de Juan): tallo cubierto por una falda espesa de hojas secas que
  // cuelgan, roseta apretada de hojas largas y peludas, verde plata, y varas con flores amarillas como margaritas.
  const frailejon = (g, R) => {
    sombraSuave(g, 2.8, 16, 6.4, .26);
    const H = 11, cy = -H - 2.6;
    // Falda: tiras de hoja seca que cuelgan, más ancha arriba (bajo la roseta); la derecha en sombra.
    pol(g, [[-2.3, 0], [2.3, 0], [2.6, -H], [-2.6, -H]], '#54483A');
    for (let fila = 0; fila < 7; fila++) {
      const y0 = -H - .6 + fila * 1.55, ancho = 3.3 - fila * .14, n = 7;
      for (let k = 0; k < n; k++) {
        const x = -ancho + (k + .5 + (fila % 2) * .3) * ancho * 2 / n, d = x > ancho * .3;
        const col = d ? ['#625444', '#56483A', '#5C4E40'][(k + fila) % 3] : ['#8E7E66', '#7E6E58', '#9A8A70', '#867660'][(k + fila) % 4];
        const L = Math.min(2.8 + R() * 1, -y0 - .1), ab = x / ancho * .5;
        if (L > .4) pol(g, [[x - .62, y0], [x + .62, y0], [x + .25 + ab, y0 + L], [x - .15 + ab, y0 + L + .25]], col);
      }
    }
    // Roseta como una bola de hojas largas y peludas: atrás las oscuras hacia arriba, adelante las claras que se
    // abren a los lados y caen un poco sobre la falda.
    const hoja = (a, L, w, c, luz) => {
      g.save(); g.translate(0, cy); g.rotate(a);
      g.fillStyle = c; g.beginPath(); g.moveTo(-w * .4, 0); g.quadraticCurveTo(w * 1.3, -L * .45, 0, -L); g.quadraticCurveTo(-w * 1.3, -L * .45, w * .4, 0); g.fill();
      if (luz) { g.strokeStyle = luz; g.lineWidth = .28; g.beginPath(); g.moveTo(0, -.8); g.lineTo(0, -L * .82); g.stroke(); }
      g.restore();
    };
    const capas = [[16, 2.1, 7.2, '#6A765C', null], [15, 2.25, 6.8, '#8E9A78', '#B4BE9C'], [13, 2.35, 6, '#A8B48E', '#CCD4B6'], [10, 2.25, 5, '#BEC8A6', '#DEE4CC'], [7, 1.5, 3.6, '#D2DABE', '#ECF0DE']];
    for (const [n, abre, L, col, luz] of capas) for (let k = 0; k < n; k++) {
      const t = k / (n - 1), a = -abre + t * abre * 2 + (R() - .5) * .1;
      hoja(a, L * (.88 + R() * .2) * (1 - Math.abs(a) * .06), 1.05, t > .62 ? sh(col, -.12) : col, luz);
    }
    // Varas con flores: salen del centro y se curvan; cada flor con pétalos amarillos y botón ocre.
    for (const [dx, alto] of [[-3.6, 8.6], [.8, 10.4], [3.8, 7.6]]) {
      const x1 = dx, y1 = cy - alto;
      g.strokeStyle = '#8E9A6E'; g.lineWidth = .45; g.lineCap = 'round'; g.beginPath(); g.moveTo(dx * .15, cy - 2); g.quadraticCurveTo(dx * .3, y1 + 3, x1, y1); g.stroke();
      for (let p = 0; p < 9; p++) { const a = p / 9 * Math.PI * 2; elip(g, x1 + Math.cos(a) * .95, y1 + Math.sin(a) * .7, .6, .32, Math.cos(a - 2.4) > 0 ? '#F2D45A' : '#E0B832', a); }
      elip(g, x1, y1, .6, .48, '#B8862A');
    }
  };
  return { palma, guadua, saman, ceiba, florido, cambulo, yarumo, mango, arbol, arbusto, arbolNiebla, cardon, cafeto, platano, frailejon };
}

// [clave, ancho, alto, anclaX, anclaY, pintura]. Los marcos dejan lugar a la sombra, que cae a la derecha.
const escala = (k, f) => (g, r) => { g.save(); g.scale(k, k); f(g, r); g.restore(); };
export function recetasFlora(seco = 0) {
  const P = pinceles(seco);
  return [
    ['arbol', 36, 36, 14, 32, escala(1, P.arbol)],
    ['saman', 50, 28, 22, 22, escala(.72, P.saman)],
    ['ceiba', 46, 43, 20, 39, escala(.82, P.ceiba)],
    ['guayacan', 34, 32, 14, 28, escala(.86, (g, r) => P.florido(g, r, ['#C9A02A', '#E8C23A', '#F6DE7A']))],
    ['ocobo', 34, 32, 14, 28, escala(.86, (g, r) => P.florido(g, r, ['#B8678A', '#E092B4', '#F4C2D6']))],
    ['cambulo', 32, 32, 14, 28, escala(.86, P.cambulo)],
    ['yarumo', 28, 41, 12, 37, escala(.9, P.yarumo)],
    ['mango', 34, 34, 14, 30, escala(.86, P.mango)],
    ['cardon', 22, 28, 9, 25, escala(.95, P.cardon)],
    ['arbusto', 20, 14, 9, 10, escala(1, P.arbusto)],
    ['arbolNiebla', 30, 44, 12, 40, escala(1.05, P.arbolNiebla)],
    ['palma', 36, 64, 14, 60, escala(.85, P.palma)],
    ['guadua', 40, 50, 18, 46, escala(.9, P.guadua)],
    ['cafeto', 16, 16, 7, 13, escala(1, P.cafeto)],
    ['platano', 30, 26, 14, 22, escala(.8, P.platano)],
    ['frailejon', 22, 32, 10, 28, escala(.95, P.frailejon)]
  ];
}
// Para la página de prueba: los mismos pinceles que usa el juego.
export const pincelesFlora = pinceles;

// Hornea las plantas en una hoja (atlas), con las mismas claves de la naturaleza anterior donde existen.
const HOJAS = {};
export function hornearFlora(seco = 0) {
  const clave = Math.round(seco * 10) / 10;
  if (HOJAS[clave]) return HOJAS[clave];
  seco = clave;
  const E = RES_HOJA, L = recetasFlora(seco), pad = 2;
  let x = 0, y = 0, fila = 0; const W = 1024 * 2, marcos = {};
  const pos = L.map(([k, w, h]) => { if (x + w * E > W) { x = 0; y += fila + pad; fila = 0; } const p = { x, y }; x += w * E + pad; fila = Math.max(fila, h * E); return p; });
  const cv = lienzo(W, y + fila + pad), g = cv.getContext('2d');
  L.forEach(([k, w, h, ax, ay, f], i) => {
    const p = pos[i], rng = mulberry(i * 97 + 13);
    marcos[k] = { x: p.x, y: p.y, w: w * E, h: h * E, ax: ax * E, ay: ay * E };
    g.save(); g.translate(p.x + ax * E, p.y + ay * E); g.scale(E, E); f(g, rng); g.restore();
  });
  return (HOJAS[clave] = { canvas: cv, marcos, escala: E });
}
