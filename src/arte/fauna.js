// Animales del Tolima (6 de octubre; prueba aprobada por Juan en pruebas/naturaleza.html). Estilo plano, como los
// retratos y los pobladores: facetas de color liso con la luz desde arriba a la izquierda y una sombra suave en el
// suelo que cae abajo a la derecha. Miran a la derecha con los pies en (0, 0).
// Pedido de Juan: movimiento fluido, nunca extraño. Por eso los cuadrúpedos andan en 12 cuadros (el ciclo completo
// del paso, con rodillas que se doblan), las aves aletean en 8 y la gallina baja la cabeza en 4 pasos. Entre un
// cuadro y otro solo cambia la postura, nunca el color ni el tamaño.
import { sh, pol, elip, ojoF, camino, sombraSuave } from './plano.js';

// Pata de cuadrúpedo con muslo, rodilla y casco; ang es el balanceo desde la cadera y doblez el de la rodilla.
function pataF(g, x, y, largo, ancho, col, casco, ang, doblez) {
  g.save(); g.translate(x, y); g.rotate(ang);
  const r = largo * .52;
  pol(g, [[-ancho * .5, -1], [ancho * .55, -1], [ancho * .28, r], [-ancho * .26, r]], col);
  g.translate(0, r); g.rotate(doblez);
  const l = largo - r;
  pol(g, [[-ancho * .27, -.3], [ancho * .28, -.3], [ancho * .2, l - 1.1], [-ancho * .2, l - 1.1]], col);
  pol(g, [[-ancho * .24, l - 1.2], [ancho * .26, l - 1.2], [ancho * .32, l], [-ancho * .3, l]], casco);
  g.restore();
}
// Cuadrúpedo genérico. f: momento del paso (0 a 1) o null quieto. P.pasta baja la cabeza a comer.
// Lomo, panza y anca como facetas de tres tonos; P.torso reemplaza el cuerpo de barril (el perro tiene el suyo).
let EXTRA = {}; // poses de reposo que se hornean aparte (cola que espanta moscas, echado)
function cuadrupedo(g, f, P0) {
  const P = { ...P0, ...EXTRA };
  if (P.echado) return echado(g, P);
  const { L, H, D, w, c } = P, h = L / 2, k = L / 24, anda = f !== null, ph = anda ? f * Math.PI * 2 : 0, amp = anda ? P.amp : 0;
  const piso = -H + D + .8 * k; // las patas salen bajo la panza
  // El cuerpo sube y baja un poco con cada pisada (dos veces por ciclo), sin saltar.
  const alza = anda ? (1 - Math.cos(ph * 2)) * .18 * k : 0;
  sombraSuave(g, h + 1.5 * k, 0, h, .3);
  const leg = (x, fase, col) => { const s = Math.sin(ph + fase); pataF(g, x, piso - 1.2 * k - alza, -piso + 1.2 * k + alza, w, col, c.casco, s * amp, Math.max(0, Math.cos(ph + fase)) * amp * 1.4); };
  leg(-h + 3.6 * k, Math.PI, c.lejos); leg(h - 3.4 * k, 0, c.lejos); // patas del lado de allá, en sombra
  g.save(); g.translate(0, -alza);
  if (P.cola) { const gx = -h, gy = -H + 1.4 * k; g.save(); if (P.colaGiro) { g.translate(gx, gy); g.rotate(P.colaGiro); g.translate(-gx, -gy); } P.cola(g, gx, gy, ph); g.restore(); } // la cola espanta las moscas
  if (P.torso) P.torso(g, h, H, D, k);
  else {
    // Cuerpo como un barril: lomo con luz y panza en sombra que baja en el medio (P.barriga la hace más honda).
    const b = P.barriga || 0;
    pol(g, [[-h + .4 * k, -H + 1.4 * k], [-h + 3.6 * k, -H], [0, -H + .6 * k], [h - 3.2 * k, -H - .6 * k], [h, -H + 1.2 * k], [h - .2 * k, -H + D * .5], [-h, -H + D * .5]], c.lomo);
    if (P.giba) pol(g, [[h - 7 * k, -H - .2], [h - 5 * k, -H - P.giba], [h - 2.6 * k, -H - P.giba * .6], [h - k, -H + .8 * k]], c.lomo);
    pol(g, [[-h, -H + D * .5], [h - .2 * k, -H + D * .5], [h - .8 * k, -H + D * .78], [h - 3 * k, -H + D + b * .6], [0, -H + D + .9 * k + b], [-h + 4 * k, -H + D * .92 + b * .6], [-h + .8 * k, -H + D * .72]], c.panza);
    if (P.manchas) P.manchas(g, h, H, D);
    // Anca y paleta del lado de acá, que unen las patas al cuerpo.
    pol(g, [[-h + .4 * k, -H + 1.4 * k], [-h + 3.6 * k, -H], [-h + 6.6 * k, -H + 1.6 * k], [-h + 6 * k, -H + D * .8], [-h + 4.6 * k, piso], [-h + 2.2 * k, piso], [-h - .4 * k, -H + D * .6]], c.anca);
    pol(g, [[h - 5.4 * k, -H + .2 * k], [h - 2.2 * k, -H - .2 * k], [h - .6 * k, -H + 2 * k], [h - 1.4 * k, -H + D * .78], [h - 2.6 * k, piso], [h - 4.8 * k, piso], [h - 6 * k, -H + D * .6]], c.paleta || c.anca);
  }
  g.restore();
  leg(-h + 3.4 * k, 0, c.cerca); leg(h - 3.6 * k, Math.PI, c.cerca);
  g.save(); g.translate(0, -alza);
  // La cabeza cabecea apenas al andar; al pastar baja girando desde la cruz.
  const cab = anda ? Math.sin(ph * 2) * .03 : 0;
  const giro = (P.pasta ? (P.bajaCabeza || 1) : 0) + cab, gx = h - 1 * k, gy = -H + 2.4 * k;
  if (giro) { g.translate(gx, gy); g.rotate(giro); g.translate(-gx, -gy); }
  P.cabeza(g, h, -H, ph);
  g.restore();
}

// Echado (rumiando): el cuerpo en el suelo, las patas recogidas bajo el pecho y la cabeza alta.
function echado(g, P) {
  const { L, D, c } = P, h = L / 2 * .84, k = L / 24, Y = -D * 1.22;
  sombraSuave(g, h + 1.5 * k, 0, h, .3);
  if (P.cola) P.cola(g, -h, Y + 1.6 * k, 0);
  pol(g, [[h - 3 * k, -.4], [h + 1.4 * k, -.6], [h + 2 * k, 0], [h - 3 * k, .2]], c.cerca); // mano recogida que asoma
  camino(g, [[-h, -.2], [-h - .4 * k, Y + 3 * k], [-h + 2.6 * k, Y], [0, Y + .8 * k], [h - 3 * k, Y - .2 * k], [h, Y + 2 * k], [h - .4 * k, -.4], [0, .2]], true); g.fillStyle = c.lomo; g.fill();
  pol(g, [[-h + 1 * k, Y + D * .55], [h - 1 * k, Y + D * .5], [h - 1.4 * k, -.3], [-h + 1.4 * k, -.2]], c.panza);
  if (P.giba) pol(g, [[h - 7 * k, Y + .2], [h - 5 * k, Y - P.giba], [h - 2.6 * k, Y - P.giba * .6], [h - k, Y + .8 * k]], c.lomo);
  camino(g, [[-h + .2 * k, -.2], [-h - .2 * k, Y + 2.6 * k], [-h + 3.4 * k, Y + 1.2 * k], [-h + 6.4 * k, Y + 3.6 * k], [-h + 5.6 * k, -.2]], true); g.fillStyle = c.anca; g.fill(); // anca
  pol(g, [[-h + 5 * k, -.6], [-h + 9.6 * k, -.8], [-h + 10 * k, .2], [-h + 5 * k, .3]], c.cerca); // pata de atrás doblada
  P.cabeza(g, h - .6 * k, Y - .8 * k, 0);
}
function vaca(g, f, pasta = false) { // vaca blanca orejinegra, la criolla del Tolima
  cuadrupedo(g, f, { L: 24, H: 17, D: 10, w: 3.4, amp: .28, pasta, bajaCabeza: 1.3,
    c: { lomo: '#F4F0E8', panza: '#DCD5C7', anca: '#E6E0D4', paleta: '#ECE6DA', cerca: '#E2DCCF', lejos: '#C4BCAD', casco: '#3A3330' },
    manchas: g2 => { pol(g2, [[-6, -17.6], [-1.6, -18], [-.4, -15.4], [-4, -14.2], [-6.4, -15.4]], '#E2DBCD'); pol(g2, [[-4.4, -8.6], [-.6, -8.6], [-1, -6.8], [-2.6, -6.2], [-4, -6.8]], '#E8B8AA'); pol(g2, [[-4.4, -8.6], [-2.6, -8.6], [-3, -6.4], [-4, -6.8]], '#F2CABE'); for (const x2 of [-3.8, -2.8, -1.8, -1.1]) pol(g2, [[x2 - .25, -6.6], [x2 + .25, -6.6], [x2 + .15, -5.6], [x2 - .15, -5.6]], '#D89A8C'); }, // la ubre con sus pezones
    cola: (g2, x, y, ph) => { g2.strokeStyle = '#CFC6B6'; g2.lineWidth = .9; g2.lineCap = 'round'; g2.beginPath(); g2.moveTo(x, y); g2.quadraticCurveTo(x - 2 + Math.sin(ph) * .5, y + 4, x - 1 + Math.sin(ph) * .4, y + 9); g2.stroke(); pol(g2, [[x - 1.6 + Math.sin(ph) * .4, y + 8.4], [x - .4 + Math.sin(ph) * .4, y + 8.4], [x - .6 + Math.sin(ph) * .4, y + 11], [x - 1.4 + Math.sin(ph) * .4, y + 11.2]], '#2A2420'); g2.stroke(); elip(g2, x - 1 + Math.sin(ph) * .4, y + 9.6, .9, 1.5, '#2A2420'); },
    cabeza: (g2, x, y) => {
      pol(g2, [[x - 2, y - .2], [x + 1.6, y - .4], [x + 3.4, y + 3.8], [x + 1, y + 7], [x - 1.6, y + 6]], '#E8E2D6'); // cuello
      pol(g2, [[x + 1, y - 1.6], [x + 4.8, y - 1.4], [x + 6.2, y + 2.2], [x + 3, y + 3.4]], '#F4F0E8');
      pol(g2, [[x + 3, y + 3.4], [x + 6.2, y + 2.2], [x + 7.6, y + 5.8], [x + 5.6, y + 7.2], [x + 3.4, y + 5.8]], '#DCD5C7');
      pol(g2, [[x + 5.6, y + 7.2], [x + 7.6, y + 5.8], [x + 8.2, y + 7], [x + 6.8, y + 8.2]], '#2E2724');
      pol(g2, [[x + 1, y - 1], [x - 1.8, y - 2.6], [x - 1.2, y - .6]], '#2A2420'); pol(g2, [[x + 2.6, y - 1.4], [x + 2.8, y - 4], [x + 3.6, y - 3.6], [x + 3.4, y - 1.4]], '#E6DCC0');
      pol(g2, [[x + .6, y - 1], [x - 1, y - 2], [x - .6, y - .9]], '#C88A80'); // dentro de la oreja
      elip(g2, x + 4.4, y + 1.7, .75, .55, '#8A7E74'); ojoF(g2, x + 4.4, y + 1.6); elip(g2, x + 7, y + 6.6, .35, .25, '#0E0C0A'); } });
}
function cebu(g, f, pasta = false) { // cebú de los potreros del valle: giba, papada y orejas caídas
  cuadrupedo(g, f, { L: 24, H: 17.6, D: 10, w: 3.2, amp: .26, giba: 4, pasta, bajaCabeza: 1.3,
    c: { lomo: '#DEDAD3', panza: '#C2BDB4', anca: '#D0CBC2', cerca: '#D6D1C8', lejos: '#AFA9A0', casco: '#3A3330' },
    cola: (g2, x, y, ph) => { g2.strokeStyle = '#B8B2A8'; g2.lineWidth = .8; g2.lineCap = 'round'; g2.beginPath(); g2.moveTo(x, y); g2.quadraticCurveTo(x - 2 + Math.sin(ph) * .5, y + 4, x - 1 + Math.sin(ph) * .4, y + 9.4); g2.stroke(); pol(g2, [[x - 1.6 + Math.sin(ph) * .4, y + 8.8], [x - .4 + Math.sin(ph) * .4, y + 8.8], [x - .6 + Math.sin(ph) * .4, y + 11.4], [x - 1.4 + Math.sin(ph) * .4, y + 11.6]], '#3A3430'); g2.stroke(); elip(g2, x - 1 + Math.sin(ph) * .4, y + 10, .8, 1.4, '#3A3330'); },
    cabeza: (g2, x, y) => {
      pol(g2, [[x - 2, y - .2], [x + 1.6, y - .4], [x + 3.4, y + 3.8], [x + 2, y + 9], [x - 1, y + 9.4], [x - 1.6, y + 6]], '#CFCAC1'); // cuello y papada
      pol(g2, [[x + 1, y - 1.4], [x + 4.6, y - 1.2], [x + 6, y + 2.4], [x + 3, y + 3.6]], '#DEDAD3');
      pol(g2, [[x + 3, y + 3.6], [x + 6, y + 2.4], [x + 7.4, y + 6.2], [x + 5.4, y + 7.6], [x + 3.4, y + 6]], '#C2BDB4');
      pol(g2, [[x + 5.4, y + 7.6], [x + 7.4, y + 6.2], [x + 7.8, y + 7.2], [x + 6.6, y + 8.2]], '#5E5852');
      pol(g2, [[x + 1.4, y], [x - .4, y + 4.6], [x - 1.4, y + 4], [x + .4, y - .2]], '#A8A298'); // oreja caída
      pol(g2, [[x + 2.4, y - 1.2], [x + 2.6, y - 3.4], [x + 3.4, y - 3], [x + 3.2, y - 1.2]], '#BDB4A0');
      g2.strokeStyle = 'rgba(90,85,78,.45)'; g2.lineWidth = .3; for (let k = 0; k < 3; k++) { g2.beginPath(); g2.moveTo(x - .6 + k * .5, y + 5 + k * 1.2); g2.quadraticCurveTo(x + .8 + k * .4, y + 6 + k * 1.2, x + 1.6 + k * .2, y + 4.6 + k * 1.4); g2.stroke(); } // pliegues de la papada
      ojoF(g2, x + 4.2, y + 1.8); elip(g2, x + 7.1, y + 7.1, .32, .22, '#1E1A18'); } });
}
function caballo(g, f, pasta = false) { // caballo criollo castaño, crin y cola negras
  const N = '#2A1E18';
  cuadrupedo(g, f, { L: 22, H: 20, D: 8.4, w: 2.9, amp: .34, pasta, bajaCabeza: 1.25,
    c: { lomo: '#9A6440', panza: '#7A4A2C', anca: '#8A5636', cerca: '#8E5A38', lejos: '#6A4026', casco: N },
    cola: (g2, x, y, ph) => { pol(g2, [[x + .6, y - .6], [x - 1.6, y + 1], [x - 3 + Math.sin(ph) * .6, y + 8], [x - 1.4 + Math.sin(ph) * .6, y + 12], [x - .2, y + 5]], N); g2.strokeStyle = '#4A3428'; g2.lineWidth = .25; for (let k = 0; k < 3; k++) { g2.beginPath(); g2.moveTo(x - .6 - k * .3, y + 1); g2.lineTo(x - 2.2 - k * .2 + Math.sin(ph) * .6, y + 10 - k); g2.stroke(); } },
    cabeza: (g2, x, y) => {
      pol(g2, [[x - 3, y + 1.6], [x - .4, y - .6], [x + 2.6, y - 5.6], [x + 5, y - 7.2], [x + 4.6, y - 3], [x + 2.4, y + 3], [x - .6, y + 5]], '#9A6440'); // cuello largo
      pol(g2, [[x - 1.4, y - .6], [x + 2.2, y - 5.8], [x + 4.6, y - 8], [x + 3.6, y - 6.6], [x + .6, y - 1.6], [x - .6, y + 1]], N); // crin
      pol(g2, [[x + 3.4, y - 7.4], [x + 6, y - 7.6], [x + 9.4, y - 3.6], [x + 8.4, y - 2], [x + 5.6, y - 3.6]], '#8A5636');
      pol(g2, [[x + 8.4, y - 2], [x + 9.4, y - 3.6], [x + 10, y - 2.6], [x + 9.2, y - 1.4]], '#4A2E1E');
      pol(g2, [[x + 4.4, y - 7.6], [x + 4.8, y - 10], [x + 5.6, y - 7.6]], '#7A4A2C');
      pol(g2, [[x + 5.6, y - 7.2], [x + 6.4, y - 7], [x + 8.6, y - 3.4], [x + 8, y - 3]], '#F2ECE0'); // el lucero en la cara
      g2.strokeStyle = '#4A3428'; g2.lineWidth = .3; for (let k = 0; k < 5; k++) { g2.beginPath(); g2.moveTo(x - .6 + k * .9, y + .4 - k * 1.6); g2.lineTo(x - 1.4 + k * .8, y + 1.6 - k * 1.4); g2.stroke(); } // mechones de la crin
      elip(g2, x + 9.2, y - 2.4, .32, .22, '#1E1410'); ojoF(g2, x + 6, y - 5.8, .45); } });
}
// Perro criollo de finca (pedido de Juan: cambiarlo): flaco y patilargo, negro con fuego (manchas canela en el
// hocico, las cejas, el pecho y las patas), orejas caídas y la cola en hoz sobre el lomo.
const PERRO = { C: '#3A322E', S: '#272120', O: '#1E1A18', L: '#544A44', F: '#B47A44', B: '#E8DCC8' };
function torsoPerro(g, h, H, D, k) {
  const { C, S, L, F } = PERRO, y = -H;
  const cuerpo = [[-h - .2 * k, y + 1.2 * k], [-h + 2 * k, y + .2 * k], [-1 * k, y + .6 * k], [h - 3.6 * k, y - .2 * k], [h - 1 * k, y + .8 * k], [h - .2 * k, y + 3.2 * k],
    [h - 1.2 * k, y + D + .4 * k], [h - 4 * k, y + D + 1 * k], [-.4 * k, y + D - .2 * k], [-h + 4 * k, y + D * .58], [-h + 1.4 * k, y + D * .66], [-h - .6 * k, y + D * .36]];
  camino(g, cuerpo, true); g.fillStyle = C; g.fill();
  g.save(); camino(g, cuerpo, true); g.clip();
  pol(g, [[-h - 2, y + D * .6], [h + 2, y + D * .5], [h + 2, y + D + 3], [-h - 2, y + D + 3]], S); // vientre recogido en sombra
  pol(g, [[-h + 2.2 * k, y + .1 * k], [h - 4 * k, y - .4 * k], [h - 4.4 * k, y + 1.2 * k], [-h + 2.4 * k, y + 1.4 * k]], L); // brillo del lomo
  g.restore();
  // Muslo de atrás (anguloso, se le notan las ancas) y paleta.
  pol(g, [[-h - .2 * k, y + 1 * k], [-h + 2.6 * k, y + .6 * k], [-h + 4.4 * k, y + 3 * k], [-h + 3.4 * k, y + D + .8 * k], [-h + 1.8 * k, y + D + .8 * k], [-h - .6 * k, y + D * .4]], S);
  pol(g, [[h - 4.4 * k, y + .8 * k], [h - 2.6 * k, y + .6 * k], [h - 1.8 * k, y + 3.4 * k], [h - 2.6 * k, y + D + 1 * k], [h - 4.2 * k, y + D + 1 * k], [h - 4.8 * k, y + 3 * k]], C);
  pol(g, [[h - 1.4 * k, y + 2.4 * k], [h - .3 * k, y + 2.8 * k], [h - .9 * k, y + D * .95], [h - 2.2 * k, y + D * .86]], F); // el pecho de fuego
  pol(g, [[h - 1.1 * k, y + 3.2 * k], [h - .5 * k, y + 3.4 * k], [h - .8 * k, y + D * .7], [h - 1.5 * k, y + D * .66]], PERRO.B); // la mancha blanca
}
// Cabeza del perro, mirando a la derecha desde la nuca (x, y): cráneo, stop, hocico largo con fuego, oreja caída.
function cabezaPerro(g2, x, y, alza = 0) {
  const { C, S, O, F } = PERRO;
  pol(g2, [[x - 2.4, y + 1], [x - .6, y - 1.2], [x + 1.6, y - 3.2], [x + 2.8, y + .4], [x + .4, y + 3.2]], C); // cuello
  camino(g2, [[x + .6, y - 3.4], [x + 2.2, y - 4.6], [x + 3.8, y - 4.4], [x + 4.6, y - 3.4], [x + 4.4, y - 1.2], [x + 2, y - .4], [x + .8, y - 1.6]], true); g2.fillStyle = C; g2.fill(); // cráneo
  pol(g2, [[x + 4, y - 3.6], [x + 6.6, y - 2.6 - alza], [x + 7.6, y - 2 - alza], [x + 7.4, y - 1.2 - alza], [x + 6.4, y - .6 - alza], [x + 4.4, y - .6], [x + 3.4, y - 1.4]], F); // hocico de fuego
  pol(g2, [[x + 4.4, y - .6], [x + 6.4, y - .6 - alza], [x + 5.6, y + .2 - alza], [x + 4.2, y + .2]], sh(F, -.25)); // quijada en sombra
  pol(g2, [[x + 4, y - 3.6], [x + 6.6, y - 2.6 - alza], [x + 6.4, y - 3.2 - alza], [x + 4.2, y - 4.2]], C); // caña de la nariz oscura
  elip(g2, x + 7.5, y - 1.9 - alza, .62, .5, '#141010'); // trufa
  elip(g2, x + 3.6, y - 3.5, .55, .32, F, -.3); // ceja de fuego
  ojoF(g2, x + 3.8, y - 2.8, .42); elip(g2, x + 3.65, y - 2.95, .14, .14, '#F4EEE0');
  pol(g2, [[x + 1.2, y - 4.2], [x + 2.6, y - 4.8], [x + 2.4, y - 3.4], [x + 1.8, y - .8], [x + .8, y - 1.2], [x + .6, y - 3]], O); // oreja caída
  pol(g2, [[x + 2, y - 4.4], [x + 2.5, y - 4.6], [x + 2.2, y - 3], [x + 1.7, y - 1.4], [x + 1.3, y - 1.6]], S);
}
function perro(g, f, pose = false) {
  const { C, S, O, F, B } = PERRO;
  if (pose === true || pose === 'sentado') {
    sombraSuave(g, 6, 0, 6, .3);
    camino(g, [[-6, -.2], [-6.4, -3], [-4.6, -6.6], [-1.6, -8.4], [1.6, -10.6], [3.6, -10.2], [4.2, -6.6], [3.2, -2.6], [.4, -.2]], true); g.fillStyle = C; g.fill(); // anca y lomo inclinado
    camino(g, [[-6, -.2], [-6.2, -3.2], [-3.6, -4.6], [-1.6, -2.4], [-1.4, -.2]], true); g.fillStyle = S; g.fill(); // muslo recogido
    pol(g, [[-2.8, -.6], [.2, -.6], [.4, .1], [-2.8, .1]], F); // pata de atrás apoyada
    pol(g, [[1.6, -7], [2.8, -7], [2.7, -.4], [1.7, -.4]], S); pol(g, [[2.8, -7.4], [4, -7.4], [3.9, -.4], [2.9, -.4]], C); // patas de adelante rectas
    pol(g, [[1.6, -1.6], [2.8, -1.6], [2.8, 0], [1.6, 0]], F); pol(g, [[2.9, -1.8], [4.1, -1.8], [4.2, .1], [2.8, .1]], F); // medias de fuego
    pol(g, [[3, -9.6], [4.4, -9], [4.4, -6], [3.4, -5.6]], F); pol(g, [[3.4, -8.6], [4.2, -8.2], [4.1, -6.4], [3.5, -6.2]], B); // pecho
    g.strokeStyle = C; g.lineWidth = 1.1; g.lineCap = 'round'; g.beginPath(); g.moveTo(-5.8, -.6); g.quadraticCurveTo(-8.6, -.8, -8.4, -3.4); g.quadraticCurveTo(-8.2, -4.6, -7, -4.2); g.stroke(); // cola en hoz, en el suelo
    cabezaPerro(g, 1.6, -10.4);
    return;
  }
  if (pose === 'echado') {
    sombraSuave(g, 7.4, 0, 7.4, .28);
    camino(g, [[-7, -.2], [-7.2, -2.6], [-4.8, -4.6], [0, -4.8], [3.4, -4.4], [4.6, -2.6], [4, -.2]], true); g.fillStyle = C; g.fill();
    camino(g, [[-7, -.2], [-7, -2.6], [-4.4, -3.4], [-3, -1.4], [-3.4, -.2]], true); g.fillStyle = S; g.fill(); // muslo
    pol(g, [[-4.8, -4.4], [0, -4.6], [0, -3.8], [-4.8, -3.6]], PERRO.L);
    pol(g, [[2.6, -1.2], [7.6, -1], [7.8, 0], [2.6, 0]], C); pol(g, [[5.6, -1.1], [7.8, -1], [7.9, .1], [5.6, .1]], F); // patas de adelante estiradas
    pol(g, [[2.6, -4], [4.6, -3.4], [4.4, -1.4], [3, -1.6]], F); // pecho
    g.strokeStyle = C; g.lineWidth = 1.1; g.lineCap = 'round'; g.beginPath(); g.moveTo(-6.6, -1.2); g.quadraticCurveTo(-9.4, -1.2, -9.6, .2); g.stroke();
    cabezaPerro(g, 2.4, -4.2, .3);
    return;
  }
  cuadrupedo(g, f, { L: 14, H: 10.2, D: 5.4, w: 1.9, amp: .5, torso: torsoPerro,
    c: { cerca: C, lejos: O, casco: F },
    cola: (g2, x, y, ph) => { const m = Math.sin(ph * 2) * .6; g2.strokeStyle = C; g2.lineWidth = 1.1; g2.lineCap = 'round'; g2.beginPath(); g2.moveTo(x + .4, y + .2); g2.quadraticCurveTo(x - 2.4, y - 1.4 + m, x - 1.4 + m * .6, y - 4.4); g2.quadraticCurveTo(x - .6 + m * .4, y - 5.6, x + .8, y - 4.6); g2.stroke(); }, // la hoz sobre el lomo
    cabeza: (g2, x, y) => cabezaPerro(g2, x, y) });
}

function gato(g, cola = 0) { // gato atigrado sentado; cola mece la punta de la cola
  const C = '#8E8A84', S = '#6E6A64';
  sombraSuave(g, 4.4, 0, 4.4, .28);
  g.strokeStyle = C; g.lineWidth = 1.3; g.lineCap = 'round'; g.beginPath(); g.moveTo(-3, -1); g.quadraticCurveTo(-6.4, -1, -5.4 - cola, -5); g.stroke();
  pol(g, [[-3.4, 0], [-3.6, -5], [-2, -9], [1.6, -9.2], [3, -5], [3, 0]], C); pol(g, [[1.6, -9.2], [3, -5], [3, 0], [.6, 0], [1, -6]], S);
  g.fillStyle = S; for (const y of [-7, -5, -3]) g.fillRect(-2.8, y, 2.4, .6);
  pol(g, [[-2.6, -9.6], [-2.8, -12.6], [-1.4, -11.6], [1.4, -11.6], [2.8, -12.6], [2.6, -9.6], [0, -8.4]], C); pol(g, [[.6, -11.6], [1.4, -11.6], [2.8, -12.6], [2.6, -9.6], [0, -8.4]], S);
  ojoF(g, -1, -10.6, .4); ojoF(g, 1.2, -10.6, .4);
}
function cerdo(g, f) { // cerdo criollo de los solares: barrigón, de patas cortas (pedido de Juan)
  cuadrupedo(g, f, { L: 15, H: 10, D: 7.2, w: 2.3, amp: .3, barriga: 1.4,
    c: { lomo: '#E8B2A8', panza: '#C98E84', anca: '#D9A096', cerca: '#E0A69C', lejos: '#B8807A', casco: '#6A4640' },
    manchas: g2 => { pol(g2, [[-4, -9.6], [-.6, -9.8], [-.2, -6.6], [-3.6, -6.2]], '#4A3A36'); pol(g2, [[2.4, -9.4], [4.2, -9.6], [4, -8], [2.6, -7.8]], '#5A4440'); },
    cola: (g2, x, y) => { g2.strokeStyle = '#E0A69C'; g2.lineWidth = .7; g2.beginPath(); g2.arc(x - .8, y + .8, 1, 0, 5); g2.stroke(); },
    cabeza: (g2, x, y) => {
      pol(g2, [[x - 1, y - .2], [x + 2.6, y - .6], [x + 4.6, y + 1.6], [x + 4.8, y + 3.6], [x + 2, y + 4.8], [x - .6, y + 4.2]], '#E8B2A8');
      pol(g2, [[x + 2, y + 4.8], [x + 4.8, y + 3.6], [x + 4.6, y + 1.6], [x + 3, y + 3]], '#C98E84');
      pol(g2, [[x + 4.4, y + 1.4], [x + 5.6, y + 1.6], [x + 5.6, y + 3.6], [x + 4.6, y + 3.6]], '#D49A90'); elip(g2, x + 5.2, y + 2.2, .22, .3, '#8A5A52'); elip(g2, x + 5.2, y + 3, .22, .3, '#8A5A52'); // la ñata
      pol(g2, [[x + .6, y - .4], [x + 1.6, y - 2.6], [x + 2.4, y - .4]], '#C98E84'); ojoF(g2, x + 2.6, y + 1.2, .38); } });
}
function chivo(g, f, pasta = false) { // chivo blanco de barba y cuernos
  cuadrupedo(g, f, { L: 13, H: 11.6, D: 5.4, w: 1.9, amp: .38, pasta,
    c: { lomo: '#F0ECE2', panza: '#D2CBBE', anca: '#E0DACE', cerca: '#E6E0D4', lejos: '#BDB6AA', casco: '#4A3E36' },
    cola: (g2, x, y) => pol(g2, [[x + .4, y], [x - 1.6, y - 2.6], [x - .4, y + .8]], '#F0ECE2'),
    cabeza: (g2, x, y) => {
      pol(g2, [[x - 1.6, y + .4], [x + .6, y - 1.4], [x + 2.6, y - 4], [x + 3.4, y + .4], [x + .6, y + 3]], '#E6E0D4');
      pol(g2, [[x + 2, y - 4.4], [x + 4.4, y - 5], [x + 6.4, y - 2.4], [x + 5.4, y - .6], [x + 3.4, y - .8]], '#F0ECE2');
      pol(g2, [[x + 4.6, y - .8], [x + 5.4, y - .6], [x + 5, y + 2.4], [x + 4.2, y + 1.4]], '#C9C0B0'); // barba
      g2.strokeStyle = '#8A7A62'; g2.lineWidth = 1; g2.lineCap = 'round'; g2.beginPath(); g2.moveTo(x + 3, y - 4.8); g2.quadraticCurveTo(x + 1.6, y - 7.4, x - .2, y - 6.6); g2.stroke();
      g2.strokeStyle = '#6E6050'; g2.beginPath(); g2.moveTo(x + 3.6, y - 4.8); g2.quadraticCurveTo(x + 2.4, y - 7.8, x + .6, y - 7.4); g2.stroke(); // el otro cuerno, detrás
      g2.strokeStyle = '#B8AE9C'; g2.lineWidth = .3; for (let k = 0; k < 3; k++) { g2.beginPath(); g2.moveTo(x + 4.6 + k * .3, y - .4); g2.lineTo(x + 4.4 + k * .3, y + 2.2); g2.stroke(); }
      pol(g2, [[x + 2.4, y - 4], [x + .2, y - 3.6], [x + 1.6, y - 2.8]], '#D2CBBE'); ojoF(g2, x + 4.2, y - 3, .38); } });
}
// Gallina criolla y gallo de cola tornasolada. pico: 0 cabeza arriba a 1 picando el suelo (en pasos suaves).
function gallina(g, gallo = false, pico = 0) {
  const C = gallo ? '#A8502E' : '#C2683A', O = sh(C, -.22), Lz = sh(C, .14);
  sombraSuave(g, 4.2, 0, 4.2, .28);
  g.strokeStyle = '#D9A93A'; g.lineWidth = .7; g.beginPath(); g.moveTo(-.6, -3.2); g.lineTo(-.8, 0); g.moveTo(.8, -3.2); g.lineTo(1, 0); g.stroke();
  g.save(); g.translate(0, pico * .6); g.translate(-2, -5); g.rotate(pico * .18); g.translate(2, 5); // el cuerpo se inclina un poco al picar
  if (gallo) { pol(g, [[-3.6, -7.6], [-7.6, -13.6], [-6, -9.4], [-8.4, -11.4], [-6.4, -7], [-3.4, -5.6]], '#1E3A2E'); pol(g, [[-3.6, -7.6], [-6, -12], [-4.4, -8.6]], '#3E6A4A'); }
  else pol(g, [[-3.8, -8], [-6.4, -11.4], [-4.6, -11.6], [-2.6, -7.8]], O);
  pol(g, [[-4.6, -8.4], [-1, -9.6], [2.6, -9], [4.2, -7], [-1, -6.6], [-5, -6.4]], Lz);
  pol(g, [[-5, -6.4], [-1, -6.6], [4.2, -7], [3.6, -4], [0, -3], [-3.6, -3.6]], C);
  pol(g, [[-3, -7.2], [1.4, -7.6], [.4, -5], [-2.6, -5]], O); // ala
  pol(g, [[-1.4, -4.2], [2.6, -4.6], [2, -3.4], [-.6, -3.2]], sh(C, .24)); // pechuga clara
  g.translate(3.4, -8.4); g.rotate(pico * 1.15); g.translate(-3.4, 8.4);
  pol(g, [[2.6, -8.4], [3.4, -11.6], [5.6, -12], [6.6, -9.8], [5, -7.6]], Lz); pol(g, [[5, -7.6], [6.6, -9.8], [6.2, -8]], C);
  pol(g, [[3.4, -11.8], [3.8, -13.6], [4.6, -12.4], [5.2, -13.8], [5.8, -12.4], [6.4, -12.8], [6.2, -11.4]], '#C8352A'); pol(g, [[5.6, -8.8], [6.4, -8.6], [6, -7.2]], '#C8352A');
  pol(g, [[6.4, -10.4], [8, -10], [6.4, -9.4]], '#D9A93A'); ojoF(g, 5.2, -10.4, .32);
  g.restore();
}
// Pato criollo blanco y negro, de cara roja. pico: 0 erguido a 1 hurgando el suelo.
function pato(g, pico = 0) {
  sombraSuave(g, 5, 0, 5, .28);
  g.strokeStyle = '#D98A3A'; g.lineWidth = .8; g.beginPath(); g.moveTo(-.4, -2.4); g.lineTo(-.6, 0); g.moveTo(1, -2.4); g.lineTo(1.2, 0); g.stroke();
  pol(g, [[-6.4, -4.6], [-5.6, -6.8], [-1, -7.8], [3, -7.2], [4.6, -5], [-1, -4.6]], '#F4F0E8');
  pol(g, [[-6.4, -4.6], [-1, -4.6], [4.6, -5], [3.4, -2.6], [-1, -2], [-4.6, -2.8]], '#D6D0C4');
  pol(g, [[-5, -6.4], [1, -7.4], [2.2, -5.6], [-3.2, -4.8]], '#2A2A30'); pol(g, [[-5, -6.4], [-1, -6.9], [-2.8, -5.6]], '#4A4A54');
  g.save(); g.translate(3.4, -6.6); g.rotate(pico * 1.2); g.translate(-3.4, 6.6);
  pol(g, [[2.6, -6.6], [3, -10.4], [5, -11.6], [6.6, -10], [5.6, -7.8], [4.2, -6.4]], '#F4F0E8'); pol(g, [[4.2, -6.4], [5.6, -7.8], [6.6, -10], [5.4, -6.8]], '#D6D0C4');
  pol(g, [[4.4, -10.6], [6.2, -10.8], [6.2, -8.6], [4.8, -8.8]], '#C8352A'); pol(g, [[6.2, -10.2], [8.4, -9.6], [6.2, -9]], '#D9A93A'); ojoF(g, 5.2, -10, .3);
  g.restore();
}
// Garza blanca de los arrozales. f: paso (0 a 1) o null quieta.
function garza(g, f) {
  const s = f === null ? 0 : Math.sin(f * Math.PI * 2), p = s * 1.3, alza = f === null ? 0 : Math.abs(s) * .25;
  sombraSuave(g, 3.6, 0, 3.6, .26);
  g.strokeStyle = '#2A2420'; g.lineWidth = .6; g.lineCap = 'round'; g.beginPath(); g.moveTo(-.6, -8 - alza); g.lineTo(-1 + p, 0); g.moveTo(.8, -8 - alza); g.lineTo(1.4 - p, 0); g.stroke();
  g.save(); g.translate(0, -alza);
  pol(g, [[-6.6, -10], [-5.6, -13], [-1, -14.6], [3, -12.6], [3.6, -10], [-1, -10.6]], '#FBF8F2');
  pol(g, [[-6.6, -10], [-1, -10.6], [3.6, -10], [1, -8], [-3, -8.4]], '#DDD8CC');
  pol(g, [[-6.6, -10], [-8.6, -9], [-5, -9.6]], '#DDD8CC');
  const cab = f === null ? 0 : Math.sin(f * Math.PI * 2 + .6) * .5; // el cuello avanza y vuelve con el paso
  g.translate(cab, 0);
  pol(g, [[2.2, -12.8], [4.2, -14.2], [3.4, -16.8], [4.4, -20.4], [5.4, -20.2], [4.6, -17], [5.4, -14.6], [3.4, -11.8]], '#FBF8F2'); pol(g, [[4.6, -17], [5.4, -14.6], [3.4, -11.8], [4.4, -14]], '#DDD8CC');
  pol(g, [[3.8, -20.6], [5, -22.2], [6.6, -21.4], [6, -19.8], [4.6, -19.6]], '#FBF8F2'); pol(g, [[6.4, -21.4], [10, -20.8], [6.2, -20.2]], '#E3B23C'); ojoF(g, 5.2, -21.2, .28);
  g.restore();
}
// Ala vista de lado: a de -1 (abajo) a 1 (arriba); se dobla en la muñeca para que el aleteo se vea suave.
function ala(g, x0, y0, largo, a, col, colPunta) {
  const y1 = y0 - a * largo * .55, y2 = y1 - a * largo * .25 + Math.abs(a) * 1;
  pol(g, [[x0 - largo * .2, y0], [x0 - largo * .05, y1], [x0 - largo * .45, y2], [x0 - largo * .6, y1 + .6], [x0 - largo * .45, y0 + .6]], col);
  if (colPunta) pol(g, [[x0 - largo * .05, y1], [x0 - largo * .45, y2], [x0 - largo * .3, y1 + .4]], colPunta);
}
function garzaVuela(g, f) { // en vuelo: cuello recogido, patas atrás y alas que suben y bajan (8 cuadros)
  const a = Math.cos(f * Math.PI * 2), y = Math.sin(f * Math.PI * 2) * .4;
  g.save(); g.translate(0, y);
  ala(g, 3, -1, 16, a * .9, '#E6E1D6');
  pol(g, [[-6, 0], [-1, -2.4], [4, -2], [5.4, 0], [1, 1.8], [-5, 1.2]], '#FBF8F2'); pol(g, [[-5, 1.2], [1, 1.8], [5.4, 0], [0, .6]], '#DDD8CC');
  pol(g, [[4, -2], [6.4, -3.2], [7.6, -2.2], [6.2, -.4], [5.2, 0]], '#FBF8F2'); pol(g, [[7.4, -2.8], [11, -2.2], [7.4, -1.6]], '#E3B23C'); ojoF(g, 6.8, -2.6, .26);
  g.strokeStyle = '#2A2420'; g.lineWidth = .5; g.beginPath(); g.moveTo(-5.6, .6); g.lineTo(-10.6, 1.4); g.stroke();
  ala(g, 2, -.6, 16, a, '#FBF8F2');
  g.restore();
}
function gallinazo(g) { // gallinazo (chulo) posado
  sombraSuave(g, 3.8, 0, 3.8, .28);
  g.strokeStyle = '#8A8478'; g.lineWidth = .6; g.beginPath(); g.moveTo(-.6, -2.4); g.lineTo(-.6, 0); g.moveTo(.8, -2.4); g.lineTo(.8, 0); g.stroke();
  pol(g, [[-4.6, -6.4], [-3.4, -11], [0, -12.4], [3, -10.6], [3.8, -6.2], [1.4, -2.4], [-2.4, -2.4]], '#2E2C32');
  pol(g, [[0, -12.4], [3, -10.6], [3.8, -6.2], [1.4, -2.4], [.6, -7]], '#1E1C22');
  pol(g, [[-3.6, -4], [-6, -.6], [-2.6, -2.4]], '#1A181E');
  pol(g, [[.4, -12.4], [1.2, -14.6], [3, -14.6], [3.4, -12.8], [2, -11.8]], '#6E6A72'); pol(g, [[3, -14.4], [4.8, -13.4], [3.2, -12.8]], '#D9D2C4'); ojoF(g, 2.2, -13.8, .28);
}
// Gallinazo planeando, visto desde abajo: las alas largas se flexionan despacio (planea, casi no aletea).
function gallinazoVuela(g, f) {
  const a = Math.sin(f * Math.PI * 2) * 1.4, b = a * .5;
  pol(g, [[-14, -1 - a], [-7, -4.6 - b], [0, -2], [7, -4.6 - b], [14, -1 - a], [10, 0 - b * .4], [6, -1.6 - b * .3], [2, .8], [-2, .8], [-6, -1.6 - b * .3], [-10, 0 - b * .4]], '#26242A');
  pol(g, [[-14, -1 - a], [-10, -b * .4], [-11, -1.6 - a * .8]], '#5E5A62'); pol(g, [[14, -1 - a], [10, -b * .4], [11, -1.6 - a * .8]], '#5E5A62');
  pol(g, [[-1.2, -2.4], [1.2, -2.4], [1, -.6], [-1, -.6]], '#5E5A62');
}
function loro(g, f) { // perico verde de las palmas, aleteando rápido
  const a = Math.cos(f * Math.PI * 2);
  ala(g, 2.2, -.6, 8, a * .9, '#3E7A34');
  pol(g, [[-6, .4], [-2, -1.8], [2.4, -2], [3.8, -.2], [1, 1.6], [-4, 1.4]], '#5DAE4C'); pol(g, [[-6, .4], [-4, 1.4], [1, 1.6], [-1, .4]], '#3E8A34');
  pol(g, [[2, -2], [3.6, -2.8], [5, -1.6], [4.6, .2], [3, .4]], '#7AC25E'); pol(g, [[4.8, -1.4], [6, -.6], [4.8, .2]], '#E3B23C'); ojoF(g, 3.8, -1.4, .26);
  pol(g, [[-6, .2], [-8.4, .8], [-6, 1]], '#C8352A');
  ala(g, 1.6, -.2, 8, a, '#4E9A42');
}
function pajaro(g, f) { // pájaro lejano de la bandada: una silueta que aletea
  const a = Math.cos(f * Math.PI * 2) * 2.4;
  pol(g, [[-5, -a], [-2.4, -a * .4 - .4], [0, -.6], [2.4, -a * .4 - .4], [5, -a], [2.4, -a * .3 + .5], [0, .7], [-2.4, -a * .3 + .5]], '#4A3424');
}
// Piedra con su cara de luz y musgo; tocón quemado tras un incendio.
function piedra(g) {
  sombraSuave(g, 8, 0, 8, .3);
  pol(g, [[-9, 0], [-8, -5], [-5, -7], [0, -9.5], [4, -8], [8, -4.5], [9, 0], [0, .8]], '#A69C8C');
  pol(g, [[-8, -5], [-5, -7], [0, -9.5], [4, -8], [1, -5.6], [-4, -4.4]], '#C2B8A8');
  pol(g, [[4, -8], [8, -4.5], [9, 0], [3, .4], [1, -5.6]], '#8A8070');
  pol(g, [[2, -1.6], [6, -2.4], [7.6, -.4], [3, .2]], '#7E9A5A');
}
function tocon(g) {
  sombraSuave(g, 2.6, 13, 1.6, .26);
  pol(g, [[-2.4, 0], [-2.2, -6], [-1.8, -11], [-1.2, -12.5], [-.6, -13], [0, -11], [.4, -10.5], [1, -11.5], [1.6, -12], [2, -6], [2.4, 0], [0, .6]], '#4A3E36');
  pol(g, [[.4, -10.5], [1, -11.5], [1.6, -12], [2, -6], [2.4, 0], [.6, .4], [.8, -6]], '#2E2620');
  g.strokeStyle = '#3A302A'; g.lineWidth = 1; g.lineCap = 'round'; g.beginPath(); g.moveTo(1, -7); g.lineTo(4.5, -10); g.stroke();
}

// Pinta escalado y con los pies en (0, 0).
const a_escala = (k, fn) => (g, ...x) => { g.save(); g.scale(k, k); fn(g, ...x); g.restore(); };
const doce = k => k / 12, ocho = k => k / 8;
// Una especie que anda: quieta, pastando (si come pasto) y 12 cuadros del paso.
const andador = (nombre, pinta, caja, esc, pasta = true) => [
  [nombre, ...caja, a_escala(esc, g => pinta(g, null, false))],
  ...(pasta ? [[nombre + 'Pasta', ...caja, a_escala(esc, g => pinta(g, null, true))]] : []),
  ...Array.from({ length: 12 }, (_, k) => [nombre + 'A' + k, ...caja, a_escala(esc, g => pinta(g, doce(k), false))]),
  // Reposo: la cola se mece en 6 cuadros (de pie y pastando) y, en el ganado vacuno, echado rumiando.
  ...(pasta ? Array.from({ length: 6 }, (_, k) => [[nombre + 'Q' + k, false], [nombre + 'PQ' + k, true]]).flat().map(([cl, pa], j) => [cl, ...caja, a_escala(esc, g => { EXTRA = { colaGiro: Math.sin(Math.floor(j / 2) / 6 * Math.PI * 2) * .34 }; pinta(g, null, pa); EXTRA = {}; })]) : []),
  ...(nombre === 'vaca' || nombre === 'cebu' ? [[nombre + 'E', ...caja, a_escala(esc, g => { EXTRA = { echado: true }; pinta(g, null, false); EXTRA = {}; })]] : [])
];

// [clave, ancho, alto, anclaX, anclaY, pintura]. Los marcos dejan lugar a la sombra, que cae a la derecha.
export function recetasFauna() {
  const V = .6, PE = .72, GA = .5, GZ = .68;
  return [
    ['piedra', 30, 18, 14, 14, a_escala(.85, piedra)],
    ['tocon', 18, 22, 8, 18, tocon],
    ...andador('vaca', vaca, [28, 22, 12, 17], V),
    ...andador('cebu', cebu, [28, 24, 12, 18], V),
    ...andador('caballo', caballo, [26, 26, 11, 20], V),
    ...andador('chivo', chivo, [20, 18, 9, 14], .74),
    ...andador('cerdo', cerdo, [20, 16, 9, 12], .74, false),
    ...Array.from({ length: 12 }, (_, k) => ['perro' + k, 20, 16, 9, 12, a_escala(PE, g => perro(g, doce(k)))]),
    ['perroS', 20, 16, 9, 12, a_escala(PE, g => perro(g, null, true))], ['perroE', 22, 14, 10, 11, a_escala(PE, g => perro(g, null, 'echado'))],
    ['gato', 10, 10, 4, 8, a_escala(.62, g => gato(g, 0))], ['gato1', 10, 10, 4, 8, a_escala(.62, g => gato(g, 1.4))],
    // Gallina (0) y gallo (1): cabeza arriba y 3 pasos hasta el suelo; gallina0p y gallina1p son el último.
    ...[0, 1].flatMap(v => [['gallina' + v, 11, 10, 5, 8, a_escala(GA, g => gallina(g, v === 1, 0))],
      ...[1, 2].map(p => ['gallina' + v + 'p' + p, 11, 10, 5, 8, a_escala(GA, g => gallina(g, v === 1, p / 3))]),
      ['gallina' + v + 'p', 11, 10, 5, 8, a_escala(GA, g => gallina(g, v === 1, 1))]]),
    ['pato', 12, 10, 5, 8, a_escala(GA, g => pato(g, 0))], ['patoP1', 12, 10, 5, 8, a_escala(GA, g => pato(g, .5))], ['patoP', 12, 10, 5, 8, a_escala(GA, g => pato(g, 1))],
    ['garza', 16, 20, 7, 17, a_escala(GZ, g => garza(g, null))],
    ...Array.from({ length: 8 }, (_, k) => ['garzaA' + k, 16, 20, 7, 17, a_escala(GZ, g => garza(g, ocho(k)))]),
    ...Array.from({ length: 8 }, (_, k) => ['garzaVuela' + k, 24, 26, 12, 13, a_escala(.85, g => garzaVuela(g, ocho(k)))]),
    ['chulo', 10, 12, 4, 10, a_escala(.6, gallinazo)],
    ...Array.from({ length: 8 }, (_, k) => ['chuloV' + k, 26, 10, 13, 5, a_escala(.85, g => gallinazoVuela(g, ocho(k)))]),
    ...Array.from({ length: 6 }, (_, k) => ['loro' + k, 16, 14, 8, 7, a_escala(.9, g => loro(g, k / 6))]),
    ...Array.from({ length: 4 }, (_, k) => ['pajaro' + k, 12, 8, 6, 4, g => pajaro(g, k / 4)])
  ];
}
// Para la página de prueba: los mismos pinceles que usa el juego.
export const PINCELES_FAUNA = { vaca, cebu, caballo, perro, gato, cerdo, chivo, gallina, pato, garza, garzaVuela, gallinazo, gallinazoVuela, loro, pajaro, piedra, tocon };
