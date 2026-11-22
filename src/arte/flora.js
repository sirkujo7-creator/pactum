// Árboles y plantas del Tolima (6 de octubre; prueba aprobada por Juan en pruebas/naturaleza.html). Estilo plano,
// con hojas pequeñas en tres pasadas (sombra, color y luz arriba a la izquierda) y una sombra suave en el suelo que
// cae abajo a la derecha, más larga cuanto más alto es el árbol: un solo sol para todo el mapa.
// Biodiversidad: palma de cera, guadua, samán, ceiba, guayacán amarillo, ocobo, cámbulo, yarumo, mango, cafeto,
// plátano, cardón, árbol del bosque de niebla y frailejón (redibujado a pedido de Juan).
import { mulberry, lienzo, RES_HOJA } from './fresco.js';
import { sh, mezcla, pol, elip, follaje, tronco, lanza } from './plano.js';
// Las plantas ya no pintan su sombra en óvalos: al hornear, su propia silueta se proyecta en el suelo (naturaleza.js).
const sombraSuave = () => {};

const VERDES = { claro: ['#3F6631', '#5E8B42', '#8DB35C'], oscuro: ['#2A4A2C', '#3E6B3A', '#5E8A4A'], niebla: ['#24402A', '#34583A', '#557A4E'], cafe: ['#1E3E22', '#2F5A32', '#4E7A3A'] };
const SECO = '#B39B57';

// seco: 0 lluvias a 1 sequía (las hojas se doran; las flores no).
function pinceles(seco = 0) {
  const v = cols => cols.map(c => mezcla(c, SECO, seco * .45));
  const palma = (g, R) => { // palma de cera del Quindío, el árbol nacional (pulida a pedido de Juan: con volumen)
    const H = 54, top = [.6, -H];
    // Tronco cilíndrico, liso y blanquecino por la cera, un poco más grueso abajo, con anillos y raíces.
    const cuerpo = '#DAD4C6';
    for (const [dx, w] of [[-1.9, .9], [1.9, .9]]) pol(g, [[dx * 1.2, .4], [dx * .5, -.2], [0, -3], [dx * .2, .3]], sh(cuerpo, dx > 0 ? -.25 : -.05));
    const bord = (f0, f1, c) => { g.fillStyle = c; g.beginPath(); for (let k = 0; k <= 20; k++) { const t = k / 20, y = -H * t, x = top[0] * t, w = 1.55 - .45 * t + Math.sin(t * 3.1) * .12; k ? g.lineTo(x + w * f0, y) : g.moveTo(x + w * f0, y); } for (let k = 20; k >= 0; k--) { const t = k / 20, y = -H * t, x = top[0] * t, w = 1.55 - .45 * t + Math.sin(t * 3.1) * .12; g.lineTo(x + w * f1, y); } g.fill(); };
    bord(-1, 1, cuerpo); bord(.2, 1, sh(cuerpo, -.16)); bord(.62, 1, sh(cuerpo, -.3)); bord(-.85, -.4, sh(cuerpo, .3));
    for (let y = -2.5; y > -H + 3; y -= 1.6 + R() * 1.6) { const t = -y / H, x = top[0] * t, w = 1.55 - .45 * t; g.strokeStyle = `rgba(110,100,86,${.18 + R() * .2})`; g.lineWidth = .22 + R() * .15; g.beginPath(); g.moveTo(x - w, y); g.quadraticCurveTo(x, y + .45, x + w, y); g.stroke(); g.strokeStyle = 'rgba(255,255,250,.35)'; g.beginPath(); g.moveTo(x - w * .9, y - .3); g.quadraticCurveTo(x - w * .2, y + .1, x + w * .1, y - .25); g.stroke(); }
    // Vaina verde del penacho y hojas secas que cuelgan.
    pol(g, [[top[0] - 1.3, top[1] + 1], [top[0] + 1.3, top[1] + 1], [top[0] + 1.1, top[1] - 2.6], [top[0] - 1.1, top[1] - 2.6]], '#7E9466');
    pol(g, [[top[0] + .3, top[1] + 1], [top[0] + 1.3, top[1] + 1], [top[0] + 1.1, top[1] - 2.6], [top[0] + .4, top[1] - 2.6]], '#5E7450');
    for (const s of [-1, 1]) { g.strokeStyle = '#8A6A44'; g.lineWidth = .55; g.beginPath(); g.moveTo(top[0] + s * .6, top[1] - 1); g.quadraticCurveTo(top[0] + s * 3, top[1] + 1, top[0] + s * 3.2, top[1] + 8); g.stroke(); for (let k = 1; k < 7; k++) lanza(g, top[0] + s * (1 + k * .33), top[1] + k * 1.1, top[0] + s * (1.6 + k * .33), top[1] + k * 1.1 + 2.6, .28, k % 2 ? '#9C7A4E' : '#7E6040'); }
    // Frondas en 3D: azimut alrededor del penacho; las de atrás se pintan primero y más oscuras; cada una se arquea
    // y deja colgar sus hojuelas, verdes arriba y plateadas por debajo (así es la palma de cera).
    const frondas = []; for (let k = 0; k < 18; k++) { const az = k / 18 * 6.283 + (R() - .5) * .3, joven = k % 4 === 0; frondas.push({ az, L: (joven ? 9 : 11.5) + R() * 3, sube: joven ? 7 + R() * 2 : 3 + R() * 2.4 }); }
    frondas.sort((p, q) => Math.sin(p.az) - Math.sin(q.az));
    const cy0 = top[1] - 2.4;
    for (const f of frondas) {
      const cx = Math.cos(f.az), cz = Math.sin(f.az), delante = (cz + 1) / 2, luzF = (1 - cx) / 2;
      const verde = mezcla(mezcla('#284E2C', '#4E8038', delante * .7), '#7CA650', luzF * .45), plata = mezcla(verde, '#B6C4A8', .45), raquis = mezcla(verde, '#C8C6A0', .4);
      const punto = t => [top[0] + cx * f.L * t * (1 - .25 * Math.abs(cz)), cy0 - f.sube * Math.sin(Math.PI * Math.min(1, t * 1.25)) + 3.6 * t * t + cz * f.L * t * .3];
      const pts = []; for (let k = 0; k <= 12; k++) pts.push(punto(k / 12));
      for (let k = 1; k < 12; k++) {
        const [x, y] = pts[k], [x2, y2] = pts[k + 1], t = k / 12, largo = (1 - Math.abs(t - .45) * 1.1) * 3.8, ang = Math.atan2(y2 - y, x2 - x);
        for (const lado of [-1, 1]) {
          const a = ang + lado * (1.15 - t * .3) + (Math.PI / 2 - ang) * .45, ex = x + Math.cos(a) * largo, ey = y + Math.abs(Math.sin(a)) * largo * .9 + largo * .35;
          lanza(g, x, y, ex, ey, .3, lado * cx < 0 || cz > .3 ? verde : plata, lado * .3);
        }
      }
      g.strokeStyle = raquis; g.lineWidth = .45; g.lineCap = 'round'; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke();
    }
    // Racimos de frutos anaranjados bajo el penacho.
    for (const s of [-1, 1]) for (let k = 0; k < 5; k++) elip(g, top[0] + s * (1.2 + R() * 1.4), top[1] + 1.5 + R() * 2.2, .45, .45, k % 2 ? '#D9822E' : '#E8A23A');
  };
  const guadua = (g, R) => { // guadual: cañas cilíndricas con nudos que se arquean, y hojas en punta (pulida con volumen)
    const tallos = []; for (let k = 0; k < 9; k++) tallos.push([(k - 4) * 1.05 + (R() - .5) * .6, (k - 4) * 3.4 + (R() - .5) * 2, 34 + R() * 12, (R() - .5) * 2]);
    tallos.sort((a, b) => a[3] - b[3]); // las de atrás primero
    const en = ([x0, ab, h], t) => [x0 + ab * t * t, -h * t + (t > .75 ? (t - .75) * h * .4 : 0)];
    const hojas = v(['#2E5A2C', '#4E7A38', '#6E9A48', '#93B862']);
    tallos.forEach((T, k) => {
      const atras = T[3] < 0, verde = atras ? '#7E9A44' : '#9DB35A', w = 1.05;
      // Caña: color, sombra a la derecha y luz a la izquierda, en tramos entre nudos.
      for (let j = 0; j < 14; j++) {
        const [x1, y1] = en(T, j / 14), [x2, y2] = en(T, (j + 1) / 14), ww = w * (1 - j / 22);
        pol(g, [[x1 - ww, y1], [x2 - ww, y2], [x2 + ww, y2], [x1 + ww, y1]], verde);
        pol(g, [[x1 + ww * .2, y1], [x2 + ww * .2, y2], [x2 + ww, y2], [x1 + ww, y1]], sh(verde, -.25));
        pol(g, [[x1 - ww * .8, y1], [x2 - ww * .8, y2], [x2 - ww * .35, y2], [x1 - ww * .35, y1]], sh(verde, .25));
        if (j % 2 === 1) { g.fillStyle = '#5E7A2E'; g.fillRect(x2 - ww, y2 - .15, ww * 2, .35); g.fillStyle = 'rgba(240,240,210,.5)'; g.fillRect(x2 - ww, y2 - .45, ww * 1.2, .2); } // nudo
      }
    });
    // Hojas en punta que cuelgan de las ramitas de arriba, en cuatro tonos (las de abajo a la derecha más oscuras).
    tallos.forEach((T, k) => { for (let j = 0; j < 34; j++) { const t = .3 + j * .02, [x, y] = en(T, t), s = j % 2 ? 1 : -1, L = 2.8 + R() * 2, a = s * (.7 + R() * .6) + Math.PI / 2, ex = x + Math.cos(a) * L * s * -1 + s * L * .7, ey = y + Math.sin(a) * L * .6 + .6; lanza(g, x, y, ex, ey, .42, hojas[Math.min(3, Math.max(0, (s < 0 ? 2 : 0) + (T[3] > 0 ? 1 : 0) + (R() < .2 ? 1 : 0)))], s * .3); } });
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
  const yarumo = (g, R) => { // yarumo: tronco blanco y hojas grandes como manos, plateadas por debajo
    sombraSuave(g, 1.2, 26, 8, .22);
    tronco(g, 0, 0, .4, -26, 1.2, .8, '#E2DED4'); g.fillStyle = 'rgba(120,110,95,.4)'; for (let y = -3; y > -24; y -= 3.4) g.fillRect(-1, y, 2, .4);
    tronco(g, .4, -20, -7, -28, .6, .4, '#E2DED4'); tronco(g, .4, -22, 7, -31, .6, .4, '#E2DED4');
    const [verde] = v(['#7E9A6A']);
    // Hoja de yarumo como una mano abierta: lóbulos largos en punta que salen de un centro, verdes encima y
    // plateados por debajo (se ven los dos lados), con su nervio claro.
    const mano = (x, y, s) => { for (let k = 0; k < 9; k++) { const a = -Math.PI / 2 + (k - 4) * .4 + (R() - .5) * .1, L = (3.6 - Math.abs(k - 4) * .25) * s, ex = x + Math.cos(a) * L, ey = y + Math.sin(a) * L * .8 + Math.abs(k - 4) * .35 * s, plata = k % 3 === 1 || Math.cos(a) > .5; lanza(g, x, y, ex, ey, .55 * s, plata ? '#C9CFC0' : (Math.cos(a) < -.3 ? sh(verde, .15) : verde), .2); g.strokeStyle = plata ? '#9AA290' : '#B8C4A4'; g.lineWidth = .15; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (ex - x) * .85, y + (ey - y) * .85); g.stroke(); } };
    mano(-7, -28, 1.7); mano(7, -31, 1.8); mano(.4, -27, 1.5);
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
    // Costillas de los brazos y espinas: puntitos claros a lo largo de cada costilla.
    for (const [bx, y0, y1] of [[-4.6, -6, -14.6], [4.4, -8.6, -16.6]]) { g.beginPath(); g.moveTo(bx + .5, y0); g.lineTo(bx + .5, y1); g.stroke(); }
    g.fillStyle = '#F0E8C8'; for (const [bx, y0, y1] of [[-1.7, -1, -21], [0, -1, -21.6], [1.7, -1, -21], [-4.6, -6, -14.4], [4.4, -8.6, -16.4]]) for (let y = y0; y > y1; y -= 1.3) g.fillRect(bx - .1, y, .2, .2);
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
    // Hojas grandes ordenadas de atrás hacia adelante: cada una con su mitad en luz y su mitad en sombra, el nervio
    // claro y algún rasgado del viento (así son las hojas del plátano).
    const hojasP = []; for (let k = 0; k < 7; k++) hojasP.push({ a: -Math.PI / 2 + (k - 3) * .55 + (R() - .5) * .15, L: 11 + R() * 3.5, z: R() - .5 });
    hojasP.sort((p, q) => p.z - q.z);
    for (const h of hojasP) {
      const x = Math.cos(h.a) * h.L, y = -12 + Math.sin(h.a) * h.L * .7 + 4 + h.z * 2, mx = x * .5, my = (y - 12) * .5 - 3, osc = h.z < 0;
      const c1 = osc ? sh(o, -.15) : l, c2 = osc ? sh(o, -.3) : o;
      g.fillStyle = c1; g.beginPath(); g.moveTo(0, -12); g.quadraticCurveTo(mx - 3, my - 3, x, y); g.quadraticCurveTo(mx, my, 0, -11.4); g.fill();
      g.fillStyle = c2; g.beginPath(); g.moveTo(0, -12); g.quadraticCurveTo(mx + 3, my + 1.5, x, y); g.quadraticCurveTo(mx, my, 0, -11.4); g.fill();
      g.strokeStyle = n; g.lineWidth = .35; g.beginPath(); g.moveTo(0, -12); g.quadraticCurveTo(mx, my, x, y); g.stroke();
      g.strokeStyle = sh(c2, -.2); g.lineWidth = .18; for (let q = 1; q < 6; q++) { const t = q / 6, px = x * t, py = -12 + (y + 12) * t - Math.sin(t * 3.1) * 3; if (R() < .4) { g.beginPath(); g.moveTo(px, py); g.lineTo(px + 1.4, py + 1.6); g.stroke(); } } // rasgados
    }
    elip(g, 1.8, -8, 1.3, 2.4, '#6E4A6A', .3);
  };
  // Frailejón del páramo (redibujado a pedido de Juan): tallo cubierto por una falda espesa de hojas secas que
  // cuelgan, roseta apretada de hojas largas y peludas, verde plata, y varas con flores amarillas como margaritas.
  const frailejon = (g, R) => { // frailejón del páramo (pulido con volumen a pedido de Juan)
    const H = 11, cy = -H - 2.2, rad = 2.2;
    // Falda de hojas secas que cuelgan, desgreñada: más ancha arriba, bajo la roseta, y angosta abajo; las tiras
    // son de largo y ancho distintos y se montan unas sobre otras. Clara del lado de la luz, oscura del otro.
    const anchoEn = y => rad * (.82 + .3 * Math.min(1, -y / H));
    pol(g, [[-anchoEn(0), 0], [anchoEn(0), 0], [anchoEn(-H), -H], [-anchoEn(-H), -H]], '#43382C');
    const tiras = [];
    for (let k = 0; k < 130; k++) { const y0 = -H - .6 + R() * (H - 1.2), az = R() * Math.PI; tiras.push({ y0, az, L: 2.2 + R() * 2.6, w: .3 + R() * .35 }); }
    tiras.sort((p, q) => p.y0 - q.y0 || Math.sin(p.az) - Math.sin(q.az));
    for (const t of tiras) {
      const x = -Math.cos(t.az) * anchoEn(t.y0), luz = (1 + Math.cos(t.az)) / 2, L = Math.min(t.L, -t.y0 - .05);
      if (L < .3) continue;
      const col = mezcla(mezcla('#3E342A', '#A89272', luz * .95), ['#7A6A52', '#8E7A5A', '#5E5242'][Math.floor(R() * 3)], .3);
      const borde = Math.abs(Math.cos(t.az)) > .8 ? Math.sign(x) * R() * .7 : 0; // en los bordes las tiras se salen: silueta desgreñada
      lanza(g, x + borde * .4 + (R() - .5) * .3, t.y0, x + borde + (x > 0 ? .25 : -.25) + (R() - .5) * .4, t.y0 + L, t.w, col, (R() - .5) * .4);
    }
    for (let k = 0; k < 14; k++) { const y0 = -H + R() * (H - 2), x = -anchoEn(y0) * (.4 + R() * .5); lanza(g, x, y0, x - .2, y0 + 1.6 + R(), .1, 'rgba(225,210,180,.7)'); } // brillos del lado de la luz
    // Roseta: muchas hojas anchas y lanudas que salen del centro en todas direcciones (azimut y altura), ordenadas
    // de atrás hacia adelante; las bajas se doblan hacia afuera. Verde gris en la sombra y plateadas en la luz.
    const hojas = [];
    for (let k = 0; k < 70; k++) { const az = R() * 6.283, el = .02 + R() * 1.05; hojas.push({ az, el, L: 6.8 + R() * 2.6 }); }
    hojas.sort((p, q) => Math.sin(p.az) * Math.cos(p.el) - Math.sin(q.az) * Math.cos(q.el));
    for (const h of hojas) {
      const ce = Math.cos(h.el), dx = Math.cos(h.az) * ce, dz = Math.sin(h.az) * ce, dy = Math.sin(h.el);
      const brillo = Math.max(0, Math.min(1, .4 - dx * .32 + dy * .28 + dz * .18 + (R() - .5) * .15));
      const base = mezcla('#4E5C42', '#8A9872', brillo), punta = mezcla('#7E8E68', '#C9D2B2', brillo * brillo);
      const x1 = dx * h.L, y1 = cy - dy * h.L + dz * h.L * .35 + (1 - dy) * 1.6;
      lanza(g, 0, cy, x1, y1, 1.15, base, dx * .5 + (dy < .4 ? 1 : 0));
      lanza(g, x1 * .4, cy + (y1 - cy) * .4, x1, y1, .7, punta, dx * .25);
      if (brillo > .5) { g.strokeStyle = 'rgba(250,252,240,.45)'; g.lineWidth = .2; g.beginPath(); g.moveTo(x1 * .25, cy + (y1 - cy) * .25); g.lineTo(x1 * .92, cy + (y1 - cy) * .92); g.stroke(); } // nervio y pelusa
    }
    // Centro de la roseta: hojas nuevas apretadas, muy claras.
    for (let k = 0; k < 9; k++) { const a = -Math.PI / 2 + (k - 4) * .28; lanza(g, 0, cy, Math.cos(a) * 2.6, cy + Math.sin(a) * 2.6, .45, k < 5 ? '#D2DAC0' : '#A9B492'); }
    // Varas con flores amarillas: capítulos con pétalos en punta y botón ocre, sombreados.
    for (const [dx, alto, dz] of [[-3.8, 8.4, -1], [.9, 10.6, 0], [4, 7.4, 1]]) {
      const x1 = dx, y1 = cy - alto;
      g.strokeStyle = '#7E8A5E'; g.lineWidth = .4; g.lineCap = 'round'; g.beginPath(); g.moveTo(dx * .12, cy - 1.5); g.quadraticCurveTo(dx * .3, y1 + 3, x1, y1); g.stroke();
      for (let p = 0; p < 12; p++) { const a = p / 12 * Math.PI * 2, c = Math.cos(a - 2.4) > 0 ? '#F6DC5E' : '#D9AE2E'; lanza(g, x1, y1, x1 + Math.cos(a) * 1.3, y1 + Math.sin(a) * .85, .26, c); }
      elip(g, x1, y1, .55, .42, '#9A6A22'); elip(g, x1 - .18, y1 - .15, .25, .18, '#C8963A');
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
    ['palma', 58, 70, 18, 64, escala(.85, P.palma)], // ancho de sobra: la sombra larga de la palma no se corta
    ['guadua', 46, 54, 22, 50, escala(.9, P.guadua)],
    ['cafeto', 16, 16, 7, 13, escala(1, P.cafeto)],
    ['platano', 30, 26, 14, 22, escala(.8, P.platano)],
    ['frailejon', 28, 36, 14, 32, escala(.95, P.frailejon)]
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
