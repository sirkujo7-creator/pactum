// Prueba de animales y vegetación del Tolima (pedido de Juan, 6 de octubre). No toca el juego: muestra los dibujos
// propuestos para aprobarlos antes de instalarlos. Estilo plano, como los retratos y los pobladores: color liso, una
// sola sombra de borde nítido y la luz siempre desde arriba a la izquierda (la sombra en el suelo cae abajo a la
// derecha). Los animales miran a la derecha con los pies en (0, 0); f es el momento del paso (0 a 1).

const DPR = Math.min(2.5, window.devicePixelRatio || 1);
const sh = (h, f) => { const v = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)).map(x => Math.round(f < 0 ? x * (1 + f) : x + (255 - x) * f)); return '#' + v.map(x => Math.max(0, Math.min(255, x)).toString(16).padStart(2, '0')).join(''); };
function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// ---------- Pinceles planos ----------
function camino(g, pts, suave = true) {
  g.beginPath(); g.moveTo(...pts[0]);
  if (suave) for (let k = 1; k <= pts.length; k++) { const p = pts[k % pts.length], q = pts[(k + 1) % pts.length]; g.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2); }
  else pts.slice(1).forEach(p => g.lineTo(...p));
  g.closePath();
}
// Forma con su sombra: la parte de abajo (desde corte) y un poco la derecha quedan en sombra, con borde nítido.
function forma(g, pts, col, corte, suave = true) {
  camino(g, pts, suave); g.fillStyle = col; g.fill();
  if (corte === undefined) return;
  g.save(); camino(g, pts, suave); g.clip();
  const xs = pts.map(p => p[0]), x0 = Math.min(...xs) - 2, x1 = Math.max(...xs) + 2;
  g.fillStyle = sh(col, -.17); g.beginPath(); g.moveTo(x0, corte + 1.4); g.lineTo(x1, corte - .6); g.lineTo(x1, 40); g.lineTo(x0, 40); g.closePath(); g.fill();
  g.restore();
}
const pol = (g, pts, col) => { camino(g, pts, false); g.fillStyle = col; g.fill(); };
const elip = (g, x, y, rx, ry, col, rot = 0) => { g.fillStyle = col; g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, 7); g.fill(); };
const sombra = (g, rx, ry, dx = rx * .3) => { g.save(); g.fillStyle = 'rgba(40,46,24,.17)'; g.beginPath(); g.ellipse(dx, ry * .25, rx, ry, 0, 0, 7); g.fill(); g.restore(); };
// Pata de cuadrúpedo: muslo ancho, caña delgada y casco; ang es el balanceo (radianes) desde la cadera.
function pata(g, x, y0, largo, ancho, col, casco, ang) {
  g.save(); g.translate(x, y0); g.rotate(ang);
  const r = largo * .48;
  pol(g, [[-ancho * .55, 0], [ancho * .55, 0], [ancho * .32, r], [ancho * .26, largo - 1.2], [-ancho * .26, largo - 1.2], [-ancho * .34, r]], col);
  pol(g, [[-ancho * .3, largo - 1.3], [ancho * .3, largo - 1.3], [ancho * .36, largo], [-ancho * .36, largo]], casco);
  g.restore();
}
// Balanceo del paso: las patas en diagonal van juntas.
const paso = (f, amp) => { const s = Math.sin(f * Math.PI * 2) * amp; return [s, -s]; };
const ojo = (g, x, y, r = .55) => elip(g, x, y, r, r * 1.1, '#1E1A18');

// ---------- Animales (facetas planas, como un low poly pintado) ----------
// Cuadrúpedo genérico: lomo, panza y anca como facetas de tres tonos (luz arriba a la izquierda), patas con muslo,
// rodilla y casco que se doblan al dar el paso, y una cabeza propia de cada especie.
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
function cuadrupedo(g, f, P) {
  const { L, H, D, w, c } = P, h = L / 2, k = L / 24, ph = f * Math.PI * 2, piso = -H + D + .8 * k; // las patas salen bajo la panza
  sombra(g, h + 2 * k, 2.4 * k, 2 * k);
  const leg = (x, fase, col) => { const s = Math.sin(ph + fase); pataF(g, x, piso - 1.2 * k, -piso + 1.2 * k, w, col, c.casco, s * P.amp, Math.max(0, Math.cos(ph + fase)) * P.amp * 1.4); };
  leg(-h + 3.6 * k, Math.PI, c.lejos); leg(h - 3.4 * k, 0, c.lejos); // patas del lado de allá, en sombra
  if (P.cola) P.cola(g, -h, -H + 1.4 * k, ph);
  // Cuerpo como un barril: lomo con luz, panza en sombra que baja en el medio.
  pol(g, [[-h + .4 * k, -H + 1.4 * k], [-h + 3.6 * k, -H], [0, -H + .6 * k], [h - 3.2 * k, -H - .6 * k], [h, -H + 1.2 * k], [h - .2 * k, -H + D * .5], [-h, -H + D * .5]], c.lomo);
  if (P.giba) pol(g, [[h - 7 * k, -H - .2], [h - 5 * k, -H - P.giba], [h - 2.6 * k, -H - P.giba * .6], [h - k, -H + .8 * k]], c.lomo);
  pol(g, [[-h, -H + D * .5], [h - .2 * k, -H + D * .5], [h - .8 * k, -H + D * .78], [h - 3 * k, -H + D], [0, -H + D + .9 * k], [-h + 4 * k, -H + D * .92], [-h + .8 * k, -H + D * .72]], c.panza);
  if (P.manchas) P.manchas(g, h, H, D);
  // Anca y paleta del lado de acá, que unen las patas al cuerpo.
  pol(g, [[-h + .4 * k, -H + 1.4 * k], [-h + 3.6 * k, -H], [-h + 6.6 * k, -H + 1.6 * k], [-h + 6 * k, -H + D * .8], [-h + 4.6 * k, piso], [-h + 2.2 * k, piso], [-h - .4 * k, -H + D * .6]], c.anca);
  pol(g, [[h - 5.4 * k, -H + .2 * k], [h - 2.2 * k, -H - .2 * k], [h - .6 * k, -H + 2 * k], [h - 1.4 * k, -H + D * .78], [h - 2.6 * k, piso], [h - 4.8 * k, piso], [h - 6 * k, -H + D * .6]], c.paleta || c.anca);
  leg(-h + 3.4 * k, 0, c.cerca); leg(h - 3.6 * k, Math.PI, c.cerca);
  P.cabeza(g, h, -H, ph);
}
const ojoF = (g, x, y, r = .5) => elip(g, x, y, r, r * 1.1, '#1E1A18');
function vaca(g, f, pasta = false) { // vaca blanca orejinegra, la criolla del Tolima
  cuadrupedo(g, f, { L: 24, H: 17, D: 10, w: 3.4, amp: .28,
    c: { lomo: '#F4F0E8', panza: '#DCD5C7', anca: '#E6E0D4', paleta: '#ECE6DA', cerca: '#E2DCCF', lejos: '#C4BCAD', casco: '#3A3330' },
    manchas: g2 => { pol(g2, [[-6, -17.6], [-1.6, -18], [-.4, -15.4], [-4, -14.2], [-6.4, -15.4]], '#E2DBCD'); pol(g2, [[-3.6, -9], [-1, -9], [-1.6, -7.6], [-3.2, -7.6]], '#E6B4A6'); },
    cola: (g2, x, y, ph) => { g2.strokeStyle = '#CFC6B6'; g2.lineWidth = .9; g2.lineCap = 'round'; g2.beginPath(); g2.moveTo(x, y); g2.quadraticCurveTo(x - 2 + Math.sin(ph) * .5, y + 4, x - 1, y + 9); g2.stroke(); elip(g2, x - 1, y + 9.6, .9, 1.5, '#2A2420'); },
    cabeza: (g2, x, y) => { g2.save(); if (pasta) { g2.translate(x - 1, y + 3); g2.rotate(1); g2.translate(-(x - 1), -(y + 3)); }
      pol(g2, [[x - 2, y - .2], [x + 1.6, y - .4], [x + 3.4, y + 3.8], [x + 1, y + 7], [x - 1.6, y + 6]], '#E8E2D6'); // cuello
      pol(g2, [[x + 1, y - 1.6], [x + 4.8, y - 1.4], [x + 6.2, y + 2.2], [x + 3, y + 3.4]], '#F4F0E8');
      pol(g2, [[x + 3, y + 3.4], [x + 6.2, y + 2.2], [x + 7.6, y + 5.8], [x + 5.6, y + 7.2], [x + 3.4, y + 5.8]], '#DCD5C7');
      pol(g2, [[x + 5.6, y + 7.2], [x + 7.6, y + 5.8], [x + 8.2, y + 7], [x + 6.8, y + 8.2]], '#2E2724');
      pol(g2, [[x + 1, y - 1], [x - 1.8, y - 2.6], [x - 1.2, y - .6]], '#2A2420'); pol(g2, [[x + 2.6, y - 1.4], [x + 2.8, y - 4], [x + 3.6, y - 3.6], [x + 3.4, y - 1.4]], '#E6DCC0');
      ojoF(g2, x + 4.4, y + 1.6); g2.restore(); } });
}
function cebu(g, f) { // cebú de los potreros del valle: giba, papada y orejas caídas
  cuadrupedo(g, f, { L: 24, H: 17.6, D: 10, w: 3.2, amp: .26, giba: 4,
    c: { lomo: '#DEDAD3', panza: '#C2BDB4', anca: '#D0CBC2', cerca: '#D6D1C8', lejos: '#AFA9A0', casco: '#3A3330' },
    cola: (g2, x, y, ph) => { g2.strokeStyle = '#B8B2A8'; g2.lineWidth = .8; g2.beginPath(); g2.moveTo(x, y); g2.quadraticCurveTo(x - 2 + Math.sin(ph) * .5, y + 4, x - 1, y + 9.4); g2.stroke(); elip(g2, x - 1, y + 10, .8, 1.4, '#3A3330'); },
    cabeza: (g2, x, y) => {
      pol(g2, [[x - 2, y - .2], [x + 1.6, y - .4], [x + 3.4, y + 3.8], [x + 2, y + 9], [x - 1, y + 9.4], [x - 1.6, y + 6]], '#CFCAC1'); // cuello y papada
      pol(g2, [[x + 1, y - 1.4], [x + 4.6, y - 1.2], [x + 6, y + 2.4], [x + 3, y + 3.6]], '#DEDAD3');
      pol(g2, [[x + 3, y + 3.6], [x + 6, y + 2.4], [x + 7.4, y + 6.2], [x + 5.4, y + 7.6], [x + 3.4, y + 6]], '#C2BDB4');
      pol(g2, [[x + 5.4, y + 7.6], [x + 7.4, y + 6.2], [x + 7.8, y + 7.2], [x + 6.6, y + 8.2]], '#5E5852');
      pol(g2, [[x + 1.4, y], [x - .4, y + 4.6], [x - 1.4, y + 4], [x + .4, y - .2]], '#A8A298'); // oreja caída
      pol(g2, [[x + 2.4, y - 1.2], [x + 2.6, y - 3.4], [x + 3.4, y - 3], [x + 3.2, y - 1.2]], '#BDB4A0');
      ojoF(g2, x + 4.2, y + 1.8); } });
}
function caballo(g, f) { // caballo criollo castaño, crin y cola negras
  const N = '#2A1E18';
  cuadrupedo(g, f, { L: 22, H: 20, D: 8.4, w: 2.9, amp: .34,
    c: { lomo: '#9A6440', panza: '#7A4A2C', anca: '#8A5636', cerca: '#8E5A38', lejos: '#6A4026', casco: N },
    cola: (g2, x, y, ph) => pol(g2, [[x + .6, y - .6], [x - 1.6, y + 1], [x - 3 + Math.sin(ph) * .6, y + 8], [x - 1.4 + Math.sin(ph) * .6, y + 12], [x - .2, y + 5]], N),
    cabeza: (g2, x, y) => {
      pol(g2, [[x - 3, y + 1.6], [x - .4, y - .6], [x + 2.6, y - 5.6], [x + 5, y - 7.2], [x + 4.6, y - 3], [x + 2.4, y + 3], [x - .6, y + 5]], '#9A6440'); // cuello largo
      pol(g2, [[x - 1.4, y - .6], [x + 2.2, y - 5.8], [x + 4.6, y - 8], [x + 3.6, y - 6.6], [x + .6, y - 1.6], [x - .6, y + 1]], N); // crin
      pol(g2, [[x + 3.4, y - 7.4], [x + 6, y - 7.6], [x + 9.4, y - 3.6], [x + 8.4, y - 2], [x + 5.6, y - 3.6]], '#8A5636');
      pol(g2, [[x + 8.4, y - 2], [x + 9.4, y - 3.6], [x + 10, y - 2.6], [x + 9.2, y - 1.4]], '#4A2E1E');
      pol(g2, [[x + 4.4, y - 7.6], [x + 4.8, y - 10], [x + 5.6, y - 7.6]], '#7A4A2C');
      ojoF(g2, x + 6, y - 5.8, .45); } });
}
function perro(g, f, sentado = false) { // perro criollo canela
  const C = '#BC8C58', S = '#9A6E40', O = '#7A5430';
  if (sentado) {
    sombra(g, 8, 1.8);
    pol(g, [[-6.6, -.4], [-4, -7], [.6, -11.4], [3.6, -11], [4.6, -7], [3, -3], [-1, -.6]], C);
    pol(g, [[-6.6, -.4], [-1, -.6], [3, -3], [1.4, 0], [-6, 0]], S);
    pol(g, [[2.2, -8], [3.6, -8], [3.6, 0], [2.4, 0]], C); pol(g, [[3.6, -7.6], [4.8, -7.6], [4.8, 0], [3.6, 0]], S);
    pol(g, [[1.4, -11], [3, -14.4], [6.2, -15], [8.4, -13], [9.6, -12.4], [8.8, -10.8], [5.6, -10.4], [3.4, -9]], C);
    pol(g, [[5.6, -10.4], [8.8, -10.8], [9.6, -12.4], [8, -9.6]], S); pol(g, [[3, -14.4], [3.4, -17.6], [5, -15]], O); ojoF(g, 6.2, -13, .42); elip(g, 9.5, -12.3, .55, .45, '#1E1A18');
    g.strokeStyle = C; g.lineWidth = 1.2; g.lineCap = 'round'; g.beginPath(); g.moveTo(-6, -1); g.quadraticCurveTo(-9, -.6, -9.6, -2.6); g.stroke();
    return;
  }
  cuadrupedo(g, f, { L: 13, H: 9.4, D: 5, w: 2, amp: .48,
    c: { lomo: C, panza: S, anca: S, cerca: C, lejos: O, casco: '#3A2A1E' },
    cola: (g2, x, y, ph) => { g2.strokeStyle = C; g2.lineWidth = 1.3; g2.lineCap = 'round'; g2.beginPath(); g2.moveTo(x, y); g2.quadraticCurveTo(x - 3, y - 2 + Math.sin(ph), x - 1.6, y - 4.6); g2.stroke(); },
    cabeza: (g2, x, y) => {
      pol(g2, [[x - 2, y + .4], [x, y - 1.6], [x + 2.4, y - 3], [x + 2.6, y + 1], [x + .4, y + 3]], C);
      pol(g2, [[x + .6, y - 3.2], [x + 3.4, y - 3.8], [x + 5.8, y - 2], [x + 6.8, y - 1.2], [x + 6, y + .4], [x + 3, y + .8], [x + 1.4, y]], C);
      pol(g2, [[x + 3, y + .8], [x + 6, y + .4], [x + 6.8, y - 1.2], [x + 5, y + 1.2]], S);
      pol(g2, [[x + 1.4, y - 3.2], [x + 1.6, y - 5.4], [x + 2.8, y - 3.4]], O); ojoF(g2, x + 3.6, y - 2, .4); elip(g2, x + 6.7, y - 1.1, .55, .45, '#1E1A18'); } });
}
function gato(g) { // gato atigrado sentado
  const C = '#8E8A84', S = '#6E6A64';
  sombra(g, 5, 1.4);
  g.strokeStyle = C; g.lineWidth = 1.3; g.lineCap = 'round'; g.beginPath(); g.moveTo(-3, -1); g.quadraticCurveTo(-6.4, -1, -5.4, -5); g.stroke();
  pol(g, [[-3.4, 0], [-3.6, -5], [-2, -9], [1.6, -9.2], [3, -5], [3, 0]], C); pol(g, [[1.6, -9.2], [3, -5], [3, 0], [.6, 0], [1, -6]], S);
  g.fillStyle = S; for (const y of [-7, -5, -3]) g.fillRect(-2.8, y, 2.4, .6);
  pol(g, [[-2.6, -9.6], [-2.8, -12.6], [-1.4, -11.6], [1.4, -11.6], [2.8, -12.6], [2.6, -9.6], [0, -8.4]], C); pol(g, [[.6, -11.6], [1.4, -11.6], [2.8, -12.6], [2.6, -9.6], [0, -8.4]], S);
  ojoF(g, -1, -10.6, .4); ojoF(g, 1.2, -10.6, .4);
}
function cerdo(g, f) { // cerdo criollo de los solares
  cuadrupedo(g, f, { L: 15, H: 8.6, D: 6, w: 2.2, amp: .3,
    c: { lomo: '#E8B2A8', panza: '#C98E84', anca: '#D9A096', cerca: '#E0A69C', lejos: '#B8807A', casco: '#6A4640' },
    manchas: g2 => pol(g2, [[-4, -8.2], [-.6, -8.4], [-.2, -5.6], [-3.6, -5.2]], '#4A3A36'),
    cola: (g2, x, y) => { g2.strokeStyle = '#E0A69C'; g2.lineWidth = .7; g2.beginPath(); g2.arc(x - .8, y + .8, 1, 0, 5); g2.stroke(); },
    cabeza: (g2, x, y) => {
      pol(g2, [[x - 1, y - .2], [x + 2.6, y - .6], [x + 4.6, y + 1.6], [x + 4.8, y + 3.6], [x + 2, y + 4.4], [x - .6, y + 3.6]], '#E8B2A8');
      pol(g2, [[x + 2, y + 4.4], [x + 4.8, y + 3.6], [x + 4.6, y + 1.6], [x + 3, y + 3]], '#C98E84');
      pol(g2, [[x + 4.4, y + 1.4], [x + 5.6, y + 1.6], [x + 5.6, y + 3.6], [x + 4.6, y + 3.6]], '#D49A90');
      pol(g2, [[x + .6, y - .4], [x + 1.6, y - 2.6], [x + 2.4, y - .4]], '#C98E84'); ojoF(g2, x + 2.6, y + 1.2, .38); } });
}
function chivo(g, f) { // chivo blanco de barba y cuernos
  cuadrupedo(g, f, { L: 13, H: 11.6, D: 5.4, w: 1.9, amp: .38,
    c: { lomo: '#F0ECE2', panza: '#D2CBBE', anca: '#E0DACE', cerca: '#E6E0D4', lejos: '#BDB6AA', casco: '#4A3E36' },
    cola: (g2, x, y) => pol(g2, [[x + .4, y], [x - 1.6, y - 2.6], [x - .4, y + .8]], '#F0ECE2'),
    cabeza: (g2, x, y) => {
      pol(g2, [[x - 1.6, y + .4], [x + .6, y - 1.4], [x + 2.6, y - 4], [x + 3.4, y + .4], [x + .6, y + 3]], '#E6E0D4');
      pol(g2, [[x + 2, y - 4.4], [x + 4.4, y - 5], [x + 6.4, y - 2.4], [x + 5.4, y - .6], [x + 3.4, y - .8]], '#F0ECE2');
      pol(g2, [[x + 4.6, y - .8], [x + 5.4, y - .6], [x + 5, y + 2.4], [x + 4.2, y + 1.4]], '#C9C0B0'); // barba
      g2.strokeStyle = '#8A7A62'; g2.lineWidth = 1; g2.lineCap = 'round'; g2.beginPath(); g2.moveTo(x + 3, y - 4.8); g2.quadraticCurveTo(x + 1.6, y - 7.4, x - .2, y - 6.6); g2.stroke();
      pol(g2, [[x + 2.4, y - 4], [x + .2, y - 3.6], [x + 1.6, y - 2.8]], '#D2CBBE'); ojoF(g2, x + 4.2, y - 3, .38); } });
}
function gallina(g, f, gallo = false) { // gallina criolla y gallo de cola tornasolada (picotean)
  const C = gallo ? '#A8502E' : '#C2683A', O = sh(C, -.22), Lz = sh(C, .14), pi = Math.sin(f * 6.28) > .6;
  sombra(g, 4.6, 1.2);
  g.strokeStyle = '#D9A93A'; g.lineWidth = .7; g.beginPath(); g.moveTo(-.6, -3.2); g.lineTo(-.8, 0); g.moveTo(.8, -3.2); g.lineTo(1, 0); g.stroke();
  if (gallo) { pol(g, [[-3.6, -7.6], [-7.6, -13.6], [-6, -9.4], [-8.4, -11.4], [-6.4, -7], [-3.4, -5.6]], '#1E3A2E'); pol(g, [[-3.6, -7.6], [-6, -12], [-4.4, -8.6]], '#3E6A4A'); }
  else pol(g, [[-3.8, -8], [-6.4, -11.4], [-4.6, -11.6], [-2.6, -7.8]], O);
  pol(g, [[-4.6, -8.4], [-1, -9.6], [2.6, -9], [4.2, -7], [-1, -6.6], [-5, -6.4]], Lz);
  pol(g, [[-5, -6.4], [-1, -6.6], [4.2, -7], [3.6, -4], [0, -3], [-3.6, -3.6]], C);
  pol(g, [[-3, -7.2], [1.4, -7.6], [.4, -5], [-2.6, -5]], O); // ala
  g.save(); if (pi) { g.translate(3.4, -8.4); g.rotate(1.1); g.translate(-3.4, 8.4); }
  pol(g, [[2.6, -8.4], [3.4, -11.6], [5.6, -12], [6.6, -9.8], [5, -7.6]], Lz); pol(g, [[5, -7.6], [6.6, -9.8], [6.2, -8]], C);
  pol(g, [[3.4, -11.8], [3.8, -13.6], [4.6, -12.4], [5.2, -13.8], [5.8, -12.4], [6.4, -12.8], [6.2, -11.4]], '#C8352A'); pol(g, [[5.6, -8.8], [6.4, -8.6], [6, -7.2]], '#C8352A');
  pol(g, [[6.4, -10.4], [8, -10], [6.4, -9.4]], '#D9A93A'); ojoF(g, 5.2, -10.4, .32);
  g.restore();
}
function pato(g, f) { // pato criollo blanco y negro, de cara roja
  sombra(g, 5.4, 1.3);
  g.strokeStyle = '#D98A3A'; g.lineWidth = .8; g.beginPath(); g.moveTo(-.4, -2.4); g.lineTo(-.6, 0); g.moveTo(1, -2.4); g.lineTo(1.2, 0); g.stroke();
  pol(g, [[-6.4, -4.6], [-5.6, -6.8], [-1, -7.8], [3, -7.2], [4.6, -5], [-1, -4.6]], '#F4F0E8');
  pol(g, [[-6.4, -4.6], [-1, -4.6], [4.6, -5], [3.4, -2.6], [-1, -2], [-4.6, -2.8]], '#D6D0C4');
  pol(g, [[-5, -6.4], [1, -7.4], [2.2, -5.6], [-3.2, -4.8]], '#2A2A30'); pol(g, [[-5, -6.4], [-1, -6.9], [-2.8, -5.6]], '#4A4A54');
  pol(g, [[2.6, -6.6], [3, -10.4], [5, -11.6], [6.6, -10], [5.6, -7.8], [4.2, -6.4]], '#F4F0E8'); pol(g, [[4.2, -6.4], [5.6, -7.8], [6.6, -10], [5.4, -6.8]], '#D6D0C4');
  pol(g, [[4.4, -10.6], [6.2, -10.8], [6.2, -8.6], [4.8, -8.8]], '#C8352A'); pol(g, [[6.2, -10.2], [8.4, -9.6], [6.2, -9]], '#D9A93A'); ojoF(g, 5.2, -10, .3);
  void f;
}
function garza(g, f) { // garza blanca de los arrozales
  const p = Math.sin(f * 6.28) * 1.2;
  sombra(g, 4.2, 1.1);
  g.strokeStyle = '#2A2420'; g.lineWidth = .6; g.beginPath(); g.moveTo(-.6, -8); g.lineTo(-1 + p, 0); g.moveTo(.8, -8); g.lineTo(1.4 - p, 0); g.stroke();
  pol(g, [[-6.6, -10], [-5.6, -13], [-1, -14.6], [3, -12.6], [3.6, -10], [-1, -10.6]], '#FBF8F2');
  pol(g, [[-6.6, -10], [-1, -10.6], [3.6, -10], [1, -8], [-3, -8.4]], '#DDD8CC');
  pol(g, [[-6.6, -10], [-8.6, -9], [-5, -9.6]], '#DDD8CC');
  pol(g, [[2.2, -12.8], [4.2, -14.2], [3.4, -16.8], [4.4, -20.4], [5.4, -20.2], [4.6, -17], [5.4, -14.6], [3.4, -11.8]], '#FBF8F2'); pol(g, [[4.6, -17], [5.4, -14.6], [3.4, -11.8], [4.4, -14]], '#DDD8CC');
  pol(g, [[3.8, -20.6], [5, -22.2], [6.6, -21.4], [6, -19.8], [4.6, -19.6]], '#FBF8F2'); pol(g, [[6.4, -21.4], [10, -20.8], [6.2, -20.2]], '#E3B23C'); ojoF(g, 5.2, -21.2, .28);
}
function gallinazo(g, vuela) { // gallinazo (chulo): posado o planeando
  if (vuela) { pol(g, [[-14, -1], [-7, -4.6], [0, -2], [7, -4.6], [14, -1], [10, 0], [6, -1.6], [2, .8], [-2, .8], [-6, -1.6], [-10, 0]], '#26242A'); pol(g, [[-14, -1], [-10, 0], [-11, -1.6]], '#5E5A62'); pol(g, [[14, -1], [10, 0], [11, -1.6]], '#5E5A62'); pol(g, [[-1.2, -2.4], [1.2, -2.4], [1, -.6], [-1, -.6]], '#5E5A62'); return; }
  sombra(g, 4.4, 1.2);
  g.strokeStyle = '#8A8478'; g.lineWidth = .6; g.beginPath(); g.moveTo(-.6, -2.4); g.lineTo(-.6, 0); g.moveTo(.8, -2.4); g.lineTo(.8, 0); g.stroke();
  pol(g, [[-4.6, -6.4], [-3.4, -11], [0, -12.4], [3, -10.6], [3.8, -6.2], [1.4, -2.4], [-2.4, -2.4]], '#2E2C32');
  pol(g, [[0, -12.4], [3, -10.6], [3.8, -6.2], [1.4, -2.4], [.6, -7]], '#1E1C22');
  pol(g, [[-3.6, -4], [-6, -.6], [-2.6, -2.4]], '#1A181E');
  pol(g, [[.4, -12.4], [1.2, -14.6], [3, -14.6], [3.4, -12.8], [2, -11.8]], '#6E6A72'); pol(g, [[3, -14.4], [4.8, -13.4], [3.2, -12.8]], '#D9D2C4'); ojoF(g, 2.2, -13.8, .28);
}
function loro(g, f) { // perico verde de las palmas, aleteando
  const ar = Math.sin(f * 6.28) > 0;
  pol(g, ar ? [[-1.6, -.8], [1.4, -6.4], [3.6, -5.4], [1.8, -.6]] : [[-1.6, -.4], [1.4, 3.4], [3.6, 2.6], [1.8, -.2]], '#3E7A34');
  pol(g, [[-6, .4], [-2, -1.8], [2.4, -2], [3.8, -.2], [1, 1.6], [-4, 1.4]], '#5DAE4C'); pol(g, [[-6, .4], [-4, 1.4], [1, 1.6], [-1, .4]], '#3E8A34');
  pol(g, [[2, -2], [3.6, -2.8], [5, -1.6], [4.6, .2], [3, .4]], '#7AC25E'); pol(g, [[4.8, -1.4], [6, -.6], [4.8, .2]], '#E3B23C'); ojoF(g, 3.8, -1.4, .26);
  pol(g, [[-6, .2], [-8.4, .8], [-6, 1]], '#C8352A');
}

// ---------- Árboles y plantas del Tolima ----------
// Follaje con detalle: muchas hojas pequeñas en tres pasadas (sombra, color, luz) que se concentran arriba a la izquierda.
function follaje(g, R, cx, cy, rx, ry, cols, n, tam = 1.6, forma = 'hoja') {
  const [osc, med, luz] = cols;
  const hoja = (x, y, c, s) => { g.fillStyle = c; g.beginPath(); if (forma === 'flor') g.arc(x, y, s * .7, 0, 7); else g.ellipse(x, y, s, s * .55, R() * Math.PI, 0, 7); g.fill(); };
  for (let k = 0; k < n; k++) { const a = R() * 6.28, d = Math.sqrt(R()); hoja(cx + Math.cos(a) * rx * d, cy + Math.sin(a) * ry * d, osc, tam * (.8 + R() * .5)); }
  for (let k = 0; k < n * .8; k++) { const a = R() * 6.28, d = Math.sqrt(R()) * .86; hoja(cx - rx * .12 + Math.cos(a) * rx * d, cy - ry * .14 + Math.sin(a) * ry * d, med, tam * (.8 + R() * .5)); }
  for (let k = 0; k < n * .35; k++) { const a = R() * 6.28, d = Math.sqrt(R()) * .55; hoja(cx - rx * .34 + Math.cos(a) * rx * d, cy - ry * .36 + Math.sin(a) * ry * d, luz, tam * (.7 + R() * .4)); }
}
// Tronco plano que se adelgaza, con su lado derecho en sombra.
function tronco(g, x0, y0, x1, y1, w0, w1, col) {
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  pol(g, [[x0 + nx * w0, y0 + ny * w0], [x1 + nx * w1, y1 + ny * w1], [x1 - nx * w1, y1 - ny * w1], [x0 - nx * w0, y0 - ny * w0]], col);
  pol(g, [[x0 - nx * w0 * .1, y0 - ny * w0 * .1], [x1 - nx * w1 * .1, y1 - ny * w1 * .1], [x1 - nx * w1, y1 - ny * w1], [x0 - nx * w0, y0 - ny * w0]], sh(col, -.2));
}
const VERDES = { claro: ['#3F6631', '#5E8B42', '#8DB35C'], oscuro: ['#2A4A2C', '#3E6B3A', '#5E8A4A'], seco: ['#5E6A3A', '#7E8A4A', '#A8B06A'] };

function palmaCera(g, R) { // palma de cera del Quindío: el árbol nacional
  sombra(g, 9, 2.2, 8);
  tronco(g, 0, 0, .6, -54, 1.5, 1.1, '#DCD6CA');
  g.fillStyle = 'rgba(120,110,95,.45)'; for (let y = -4; y > -52; y -= 3.2) g.fillRect(-1.3, y, 2.6, .5);
  const fronda = (a, L, c) => {
    const x1 = Math.cos(a) * L, y1 = -54 + Math.sin(a) * L * .55 + L * .32;
    g.strokeStyle = c; g.lineWidth = .9; g.lineCap = 'round'; g.beginPath(); g.moveTo(.6, -54); g.quadraticCurveTo(x1 * .5, -54 + Math.sin(a) * L * .4 - 3, x1, y1); g.stroke();
    for (let k = 1; k < 9; k++) { const t = k / 9, x = .6 + (x1 - .6) * t, y = -54 + (y1 + 54) * t - Math.sin(t * Math.PI) * 3; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 1.2 * Math.sign(x1 || 1) * .3, y + 3.2); g.moveTo(x, y); g.lineTo(x - .8, y + 2.8); g.stroke(); }
  };
  for (let k = 0; k < 6; k++) fronda(-Math.PI + k * Math.PI / 5 + .05, 13, '#2E5A30');
  for (let k = 0; k < 7; k++) fronda(-Math.PI * .95 + k * Math.PI / 6.4, 12, k < 3 ? '#6E9A4A' : '#4E7A3A');
  elip(g, .6, -54, 1.6, 1.2, '#6E6A5E');
  void R;
}
function guadua(g, R) {
  sombra(g, 10, 2.4, 6);
  const tallos = []; for (let k = 0; k < 8; k++) tallos.push([(k - 3.5) * 1.1 + (R() - .5) * .6, (k - 3.5) * 3.2 + (R() - .5) * 2, 34 + R() * 12]);
  const en = ([x0, ab, h], t) => [x0 + ab * t * t, -h * t + (t > .75 ? (t - .75) * h * .4 : 0)];
  tallos.forEach((T, k) => {
    g.strokeStyle = k % 2 ? '#9DB35A' : '#86A24A'; g.lineWidth = 1.2; g.lineCap = 'round'; g.beginPath(); for (let j = 0; j <= 14; j++) { const q = en(T, j / 14); j ? g.lineTo(...q) : g.moveTo(...q); } g.stroke();
    g.fillStyle = '#5E7A2E'; for (let j = 1; j < 8; j++) { const q = en(T, j / 9); g.fillRect(q[0] - .8, q[1], 1.6, .5); }
  });
  tallos.forEach((T, k) => { for (let j = 0; j < 12; j++) { const t = .42 + j * .048, q = en(T, t), s = j % 2 ? 1 : -1; g.save(); g.translate(...q); g.rotate(s * (.9 + R() * .4)); g.fillStyle = ['#3F6631', '#5E8B42', '#4E7A3A'][(k + j) % 3]; g.beginPath(); g.ellipse(0, 2.6, .55, 2.8, 0, 0, 7); g.fill(); g.restore(); } });
}
function saman(g, R) { // samán del valle: copa ancha y plana como un paraguas
  sombra(g, 26, 5, 6);
  tronco(g, 0, 0, -.6, -9, 2.6, 2, '#6B4A33'); tronco(g, -.6, -8, -8, -13, 1.2, .8, '#6B4A33'); tronco(g, -.6, -8, 8, -14, 1.2, .8, '#6B4A33'); tronco(g, -.4, -8, 1, -15, 1, .7, '#6B4A33');
  follaje(g, R, 0, -18, 25, 6.6, VERDES.claro, 260, 1.7);
}
function ceiba(g, R) { // ceiba: tronco gris y recto con bambas, ramas en pisos
  sombra(g, 22, 4.6, 7);
  for (const s of [-1, 1]) pol(g, [[s * 9, 0], [s * 2.4, -2], [s * 1.6, -12], [s * .6, 0]], s < 0 ? '#A8A296' : '#8E887C');
  tronco(g, 0, 0, 0, -34, 3.2, 2, '#A8A296');
  for (const [y, L] of [[-20, 12], [-27, 15], [-33, 11]]) { tronco(g, 0, y, -L, y - 3, .9, .5, '#9A9488'); tronco(g, 0, y, L, y - 4, .9, .5, '#9A9488'); }
  follaje(g, R, -11, -24, 8, 2.8, VERDES.claro, 60, 1.5); follaje(g, R, 12, -26, 8, 2.8, VERDES.claro, 60, 1.5);
  follaje(g, R, 0, -36, 16, 4.6, VERDES.claro, 140, 1.6);
}
function florido(g, R, flores) { // guayacán y ocobo: copa redonda cubierta de flores
  sombra(g, 14, 3.4, 6);
  g.save(); g.fillStyle = flores[1]; for (let k = 0; k < 18; k++) { g.globalAlpha = .7; g.beginPath(); g.arc(4 + (R() - .3) * 20, 2 + (R() - .5) * 3, .6, 0, 7); g.fill(); } g.restore(); // flores caídas
  tronco(g, 0, 0, .4, -12, 1.6, 1.1, '#6E5440'); tronco(g, .2, -9, -6, -16, .8, .5, '#6E5440'); tronco(g, .2, -9, 6, -17, .8, .5, '#6E5440');
  follaje(g, R, 0, -20, 12, 8, VERDES.claro, 50, 1.4);
  follaje(g, R, 0, -21, 12.6, 8.4, flores, 200, 1.2, 'flor');
}
function cambulo(g, R) { // cámbulo: ramas casi sin hojas y flores rojo naranja; da sombra al café
  sombra(g, 13, 3, 6);
  tronco(g, 0, 0, 0, -14, 1.7, 1.2, '#7A6A58');
  for (const [x, y] of [[-10, -22], [-4, -27], [5, -26], [11, -20], [0, -20]]) tronco(g, 0, -12, x, y, .8, .4, '#7A6A58');
  for (const [x, y] of [[-10, -22], [-4, -27], [5, -26], [11, -20], [0, -20], [-6, -18], [7, -18]]) follaje(g, R, x, y, 3.4, 2.4, ['#B23A22', '#D9562E', '#F08A44'], 22, 1.1, 'flor');
}
function yarumo(g, R) { // yarumo: tronco blanco y hojas grandes como manos, plateadas por debajo
  sombra(g, 9, 2.4, 6);
  tronco(g, 0, 0, .4, -26, 1.2, .8, '#E2DED4'); g.fillStyle = 'rgba(120,110,95,.4)'; for (let y = -3; y > -24; y -= 3.4) g.fillRect(-1, y, 2, .4);
  tronco(g, .4, -20, -7, -28, .6, .4, '#E2DED4'); tronco(g, .4, -22, 7, -31, .6, .4, '#E2DED4');
  const mano = (x, y, s) => { for (let k = 0; k < 7; k++) { const a = -Math.PI / 2 + (k - 3) * .52; g.save(); g.translate(x, y); g.rotate(a + Math.PI / 2); g.fillStyle = k % 2 ? '#C9CFC0' : '#7E9A6A'; g.beginPath(); g.ellipse(0, -3.4 * s, .9 * s, 3.2 * s, 0, 0, 7); g.fill(); g.restore(); } };
  mano(-7, -28, 1); mano(7, -31, 1.1); mano(.4, -27, .9);
  void R;
}
function mango(g, R) { // palo de mango: copa redonda, densa y oscura, con mangos
  sombra(g, 13, 3.2, 6);
  tronco(g, 0, 0, 0, -9, 2, 1.4, '#5E4636');
  follaje(g, R, 0, -18, 12.6, 9.4, VERDES.oscuro, 240, 1.7);
  for (let k = 0; k < 7; k++) { const x = (R() - .5) * 18, y = -15 + (R() - .3) * 9; elip(g, x, y, .9, 1.2, k % 2 ? '#E8A23A' : '#D9822E'); }
}
function frailejon(g, R) { // frailejón del páramo: falda de hojas secas y roseta plateada
  sombra(g, 5, 1.6, 3);
  pol(g, [[-2.2, 0], [2.2, 0], [1.9, -10], [-1.9, -10]], '#8A7458'); g.fillStyle = '#6E5A42'; for (let y = -1.5; y > -10; y -= 1.6) g.fillRect(-2.1, y, 4.2, .5);
  for (let k = 0; k < 14; k++) { const a = -Math.PI / 2 + (k - 6.5) * .24; g.save(); g.translate(0, -10.6); g.rotate(a + Math.PI / 2); g.fillStyle = k < 7 ? '#D3D8BE' : '#B3BC98'; g.beginPath(); g.ellipse(0, -3.4, 1, 3.6, 0, 0, 7); g.fill(); g.restore(); }
  elip(g, 0, -11, 1.6, 1.1, '#E6E8D4');
  void R;
}
function cafeto(g, R) { // mata de café con sus cerezas
  sombra(g, 5, 1.4, 2);
  tronco(g, 0, 0, 0, -3, .5, .4, '#5E4636');
  follaje(g, R, 0, -7, 5, 5, ['#1E3E22', '#2F5A32', '#4E7A3A'], 70, 1.2);
  for (let k = 0; k < 8; k++) elip(g, (R() - .5) * 7, -7 + (R() - .5) * 7, .6, .6, k % 3 ? '#B8322A' : '#E04A2E');
}
function platano(g, R) { // mata de plátano
  sombra(g, 8, 2, 4);
  tronco(g, 0, 0, 0, -12, 1.6, 1.3, '#8A9A5A');
  for (let k = 0; k < 6; k++) {
    const a = -Math.PI / 2 + (k - 2.5) * .62, L = 11 + R() * 3, x = Math.cos(a) * L, y = -12 + Math.sin(a) * L * .7 + 4;
    g.fillStyle = k < 3 ? '#6E9A4A' : '#4E7A3A'; g.beginPath(); g.moveTo(0, -12); g.quadraticCurveTo(x * .5 - 2.6, y - 5, x, y); g.quadraticCurveTo(x * .5 + 2.6, y - .6, 0, -11.2); g.fill();
    g.strokeStyle = '#B6CC80'; g.lineWidth = .35; g.beginPath(); g.moveTo(0, -12); g.quadraticCurveTo(x * .5, y - 3, x, y); g.stroke();
  }
  elip(g, 1.8, -8, 1.3, 2.4, '#6E4A6A', .3);
}

const ANIMALES = [
  ['Vaca orejinegra', 'la criolla del Tolima', (g, f) => vaca(g, f), 2.6, true],
  ['Vaca pastando', 'baja la cabeza a comer', (g, f) => vaca(g, f, true), 2.6, false],
  ['Cebú', 'potreros del valle', (g, f) => cebu(g, f), 2.6, true],
  ['Caballo criollo', 'castaño, crin negra', (g, f) => caballo(g, f), 2.4, true],
  ['Perro criollo', 'trota por el pueblo', (g, f) => perro(g, f), 4, true],
  ['Perro sentado', 'descansa', (g, f) => perro(g, f, true), 4, false],
  ['Gato', 'en las casas', g => gato(g), 5, false],
  ['Cerdo', 'en los solares', (g, f) => cerdo(g, f), 4, true],
  ['Chivo', 'en el sur seco', (g, f) => chivo(g, f), 4, true],
  ['Gallina', 'picotea', (g, f) => gallina(g, f), 6, false],
  ['Gallo', 'cola de plumas', (g, f) => gallina(g, f, true), 6, false],
  ['Pato criollo', 'junto al agua', (g, f) => pato(g, f), 6, false],
  ['Garza blanca', 'arrozales y potreros', (g, f) => garza(g, f), 4.4, true],
  ['Gallinazo', 'posado', g => gallinazo(g, false), 5, false],
  ['Gallinazo', 'planeando en el cielo', g => gallinazo(g, true), 4, false],
  ['Perico', 'entre las palmas', (g, f) => loro(g, f), 9, true]
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
  if (animal && anda && !matchMedia('(prefers-reduced-motion: reduce)').matches) { let f = 0, t0 = 0; const bucle = t => { if (t - t0 > 70) { t0 = t; f = (f + 1 / 16) % 1; dibujar(f); } requestAnimationFrame(bucle); }; requestAnimationFrame(bucle); }
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
  const bichos = [[vaca, .24, .74, 1.6, .02], [cebu, .62, .72, 1.6, -.015], [caballo, .42, .68, 1.5, .018], [perro, .55, .86, 2, .03], [cerdo, .72, .9, 2, -.02], [chivo, .1, .74, 2, .015], [gallina, .32, .9, 2.6, 0], [garza, .86, .9, 2.2, .01]];
  const pos = bichos.map(b => b[1]);
  let f = 0;
  const pintar = () => {
    fondo();
    const objs = [...plantas.map(p => ({ y: p[2], d: () => { g.save(); g.translate(p[1] * w, p[2] * h); g.scale(p[3] * s, p[3] * s); p[0](g, mulberry(Math.round(p[1] * 99)), p[4]); g.restore(); } })),
      ...bichos.map((b, k) => ({ y: b[2], d: () => { g.save(); g.translate(pos[k] * w, b[2] * h); g.scale((b[4] < 0 ? -1 : 1) * b[3] * s, b[3] * s); b[0](g, (f + k * .13) % 1); g.restore(); } }))];
    objs.sort((a, b) => a.y - b.y).forEach(o => o.d());
    g.save(); g.translate(w * .55, h * .16); g.scale(1.6 * s, 1.6 * s); gallinazo(g, true); g.restore();
  };
  pintar();
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let t0 = 0; const bucle = t => { if (t - t0 > 70) { t0 = t; f = (f + 1 / 16) % 1; bichos.forEach((b, k) => { pos[k] += b[4] * .03; if (pos[k] > .95 || pos[k] < .05) b[4] = -b[4]; }); pintar(); } requestAnimationFrame(bucle); };
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
