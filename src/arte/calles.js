// Calles y vehículos al fresco (fase 9): arrieros con mulas (herradura), chivas (empedrado) y camiones (carretera),
// horneados una vez en una hoja con cada eje y sentido. También el icono de la herramienta "Calle".
import { FR, mulberry, shade, mix, lienzo, pintar, cajaIso, urlDe, RES_HOJA } from './fresco.js';
import { hornearGente } from './gente.js';
import { P } from './iso.js';
import { ESTILO_CALLE } from './terreno.js';
import { cajaPx, ruedaIso, rellena, mezcla, sombraPie, cilindro } from './casas.js';

// Caja de un vehículo orientada por su eje ('c' o 'r'), en el punto (r, c) del mundo.
function caja(g, r, c, eje, largo, ancho, alto, z0, cols, rng) {
  const B = eje === 'c' ? cajaIso(largo, ancho, alto) : cajaIso(ancho, largo, alto), o = P(r, c), up = p => [p[0] + o[0], p[1] + o[1] - z0];
  pintar(g, B.izq.map(up), cols[0], rng, { n: 1, bw: .4 }); pintar(g, B.der.map(up), cols[1], rng, { n: 1, bw: .4 }); pintar(g, B.techo.map(up), cols[2], rng, { n: 1, bw: .4 });
  return { B, up };
}
function rueda(g, p) { g.fillStyle = FR.carbon; g.beginPath(); g.ellipse(p[0], p[1] - 1, 1.6, 1.3, 0, 0, Math.PI * 2); g.fill(); }
const L = (p, s, f) => [p[0] + (s[0] - p[0]) * f, p[1] + (s[1] - p[1]) * f];
function ruedas(g, B, up, fs) { for (const f of fs) { rueda(g, up(L(B.izq[0], B.izq[1], f))); rueda(g, up(L(B.der[0], B.der[1], f))); } }

// Mula con enjalma y dos bultos de café (de la prueba colonial). paso 0..3: patas en diagonal al andar.
export function mula(g, paso) {
  const grad = (y0, y1, c, s) => { const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, mix(c, '#FFFFFF', .2)); gr.addColorStop(.6, c); gr.addColorStop(1, s); return gr; };
  const cuerpo = (pts, c, s) => { g.beginPath(); g.moveTo(...pts[0]); for (let k = 1; k < pts.length; k += 2) { if (pts[k + 1]) g.quadraticCurveTo(...pts[k], ...pts[k + 1]); else g.lineTo(...pts[k]); } g.closePath(); const ys = pts.map(p => p[1]); g.fillStyle = grad(Math.min(...ys), Math.max(...ys), c, s); g.fill(); g.strokeStyle = 'rgba(70,45,30,.55)'; g.lineWidth = .5; g.stroke(); };
  const pata = (x, w, col, dx) => { g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, -8); g.quadraticCurveTo(x + dx * .3, -4, x + dx, -1); g.stroke(); g.strokeStyle = '#1E1A18'; g.beginPath(); g.moveTo(x + dx, -.8); g.lineTo(x + dx, 0); g.stroke(); };
  const s = Math.sin(paso / 4 * Math.PI * 2) * 2;
  g.save(); g.globalAlpha = .25; g.fillStyle = '#2A2A1E'; g.beginPath(); g.ellipse(1, 0, 12, 3.4, 0, 0, 7); g.fill(); g.restore();
  pata(-6, 1.8, '#5A3A26', -s); pata(6, 1.8, '#5A3A26', s);
  cuerpo([[-9, -14], [-1, -16], [6, -14.5], [9, -13], [9, -9.5], [8.5, -7], [2, -7], [-4, -7], [-9, -8], [-10.5, -11], [-9, -14]], '#7A5236', '#4E3322');
  pata(-4, 1.8, '#6A452E', s); pata(8, 1.8, '#6A452E', -s);
  cuerpo([[8, -13], [10, -18], [12.5, -21], [15, -20], [16.2, -17.5], [15.5, -16], [13, -16.5], [11, -13], [8, -13]], '#7A5236', '#4E3322');
  g.fillStyle = '#4E3322'; g.beginPath(); g.ellipse(12.2, -22.6, .9, 2.6, -.3, 0, 7); g.fill(); g.beginPath(); g.ellipse(13.6, -22.4, .9, 2.4, .2, 0, 7); g.fill();
  g.fillStyle = '#1E1A18'; g.beginPath(); g.arc(13.6, -19, .5, 0, 7); g.fill();
  for (const [x, col] of [[-4, '#C9B48A'], [3, '#BFA87C']]) { cuerpo([[x - 4, -19], [x, -21], [x + 4, -19], [x + 4.5, -15], [x + 4, -11], [x, -10], [x - 4, -11], [x - 4.5, -15], [x - 4, -19]], col, mix(col, '#000000', .3)); g.strokeStyle = '#8A6A40'; g.lineWidth = .5; g.beginPath(); g.moveTo(x - 4, -15); g.lineTo(x + 4, -15); g.stroke(); }
  g.strokeStyle = '#3A2A1E'; g.lineWidth = .8; g.beginPath(); g.moveTo(-9.5, -12); g.quadraticCurveTo(-12, -9 + s * .3, -11, -5); g.stroke();
}

// Buey de la yunta (paso 4 de Anno): cuerpo pesado, giba de cebú, cuernos cortos y el yugo sobre la nuca.
function buey(g, paso, col, sombra) {
  const s = Math.sin(paso / 4 * Math.PI * 2) * 1.6, osc = mix(col, '#000000', .32);
  const pata = (x, dx, c) => { g.strokeStyle = c; g.lineWidth = 2.2; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, -8); g.lineTo(x + dx, -1); g.stroke(); g.strokeStyle = '#1E1A18'; g.lineWidth = 2; g.beginPath(); g.moveTo(x + dx, -1.4); g.lineTo(x + dx, -.2); g.stroke(); };
  if (sombra) { g.save(); g.globalAlpha = .25; g.fillStyle = '#2A2A1E'; g.beginPath(); g.ellipse(1, 0, 13, 3.4, 0, 0, 7); g.fill(); g.restore(); }
  pata(-6, -s, osc); pata(6, s, osc);
  const gr = g.createLinearGradient(0, -17, 0, -7); gr.addColorStop(0, mix(col, '#FFFFFF', .25)); gr.addColorStop(.6, col); gr.addColorStop(1, osc);
  g.fillStyle = gr; g.strokeStyle = 'rgba(40,28,18,.6)'; g.lineWidth = .5;
  g.beginPath(); g.moveTo(-10, -13); g.quadraticCurveTo(-9, -16.5, -3, -16); g.quadraticCurveTo(1, -19.5, 4, -16.5); g.quadraticCurveTo(9, -16, 10, -13); g.lineTo(10, -9); g.quadraticCurveTo(4, -6.5, -3, -7); g.quadraticCurveTo(-10, -7, -10.5, -10); g.closePath(); g.fill(); g.stroke(); // cuerpo con giba
  pata(-4, s, col); pata(8, -s, col);
  g.fillStyle = col; g.beginPath(); g.moveTo(9, -15); g.quadraticCurveTo(12, -16, 14.5, -14); g.lineTo(15.2, -11); g.quadraticCurveTo(13, -10, 11, -11); g.closePath(); g.fill(); g.stroke(); // cabeza
  g.strokeStyle = '#E8E0CC'; g.lineWidth = .9; g.beginPath(); g.moveTo(12, -15.4); g.quadraticCurveTo(12.6, -18, 14, -18.4); g.stroke(); // cuerno
  g.fillStyle = '#1E1A18'; g.beginPath(); g.arc(13.6, -13.6, .45, 0, 7); g.fill();
  g.strokeStyle = '#5A3A22'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(8, -17.2); g.lineTo(11, -16.6); g.stroke(); // yugo
  g.strokeStyle = '#3A2A1E'; g.lineWidth = .7; g.beginPath(); g.moveTo(-10.2, -12); g.quadraticCurveTo(-12, -9, -11.2, -6); g.stroke(); // cola
}
// Carreta de bueyes: la yunta adelante y la carreta de dos ruedas con su carga (bultos y atados de caña).
function carretaBueyes(g, paso) {
  g.save(); g.translate(12, -1.5); g.scale(.62, .62); buey(g, (paso + 2) % 4, '#8A6040', false); g.restore(); // el de atrás
  g.save(); g.translate(13, 0); g.scale(.62, .62); buey(g, paso, '#E6DCC8', true); g.restore();
  g.strokeStyle = '#5A3A22'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(-2, -7); g.lineTo(17, -10.6); g.stroke(); // vara hasta el yugo
  g.save(); g.globalAlpha = .25; g.fillStyle = '#2A2A1E'; g.beginPath(); g.ellipse(-7, 0, 9, 2.6, 0, 0, 7); g.fill(); g.restore();
  const tabla = (pts, c) => { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fillStyle = c; g.fill(); g.strokeStyle = 'rgba(40,28,18,.7)'; g.lineWidth = .5; g.stroke(); };
  tabla([[-15, -11], [-1, -11], [-1, -6.5], [-15, -6.5]], '#8A6A44'); // costado de la carreta
  g.strokeStyle = '#6A4C30'; g.lineWidth = .4; for (const y of [-9.5, -8]) { g.beginPath(); g.moveTo(-15, y); g.lineTo(-1, y); g.stroke(); }
  for (const [x, c] of [[-12, '#C9B48A'], [-8, '#BFA87C'], [-4.5, '#C9B48A']]) { g.fillStyle = c; g.beginPath(); g.ellipse(x, -12.6, 2.4, 2, 0, 0, 7); g.fill(); g.strokeStyle = mix(c, '#000000', .3); g.lineWidth = .4; g.stroke(); } // bultos
  g.strokeStyle = '#8FA24E'; g.lineWidth = .8; for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(-14 + k * .6, -14.5 - k * .3); g.lineTo(-2 + k * .4, -15.5 - k * .3); g.stroke(); } // atado de caña encima
  const rr = 4.6, cx = -8, cy = -5; // rueda grande de madera con radios
  g.fillStyle = '#5A3A22'; g.beginPath(); g.arc(cx, cy, rr, 0, 7); g.fill(); g.fillStyle = '#8A6A44'; g.beginPath(); g.arc(cx, cy, rr - 1, 0, 7); g.fill();
  g.strokeStyle = '#5A3A22'; g.lineWidth = .7; const a0 = paso * Math.PI / 8;
  for (let k = 0; k < 6; k++) { const a = a0 + k * Math.PI / 3; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * (rr - 1), cy + Math.sin(a) * (rr - 1)); g.stroke(); }
  g.fillStyle = '#3A2A1E'; g.beginPath(); g.arc(cx, cy, .9, 0, 7); g.fill();
}

// ---------- Camión y chiva con volumen, en 8 direcciones (pedido de Juan: «la vista isométrica asegura mínimo 8
// direcciones») ----------
// Cada uno se arma con cajas orientadas a lo largo de su dirección (dr, dc) en el mundo: s a lo largo (+ adelante) y t
// al través, en casillas. Las caras que miran al jugador se pintan con la misma luz de las casas (la que mira a +r con
// luz, la que mira a +c en sombra); las ruedas del lado de allá van primero y las de acá al final.
const PPx = (r, c, z = 0) => [(c - r) * 32, (c + r) * 16 - z];
function armar(g, dr, dc, paso = 0) {
  const L0 = Math.hypot(dr, dc), ar = dr / L0, ac = dc / L0, br = -ac, bc = ar;
  const W = (s, t) => [s * ar + t * br, s * ac + t * bc], at = (s, t, z = 0) => { const [r, c] = W(s, t); return PPx(r, c, z); };
  const prof = (s, t) => { const [r, c] = W(s, t); return r + c; };
  const tono = (col, nr, nc) => { const w = Math.max(0, Math.min(1, nc / ((Math.abs(nr) + Math.abs(nc)) || 1))); return mezcla(col, '#000000', .25 * w); };
  // Caja orientada: devuelve sus caras visibles { frente, atras, lado, top } (cada una de 4 puntos: abajo atrás/izq,
  // abajo adelante/der, arriba adelante/der, arriba atrás/izq) para ponerles detalles.
  const caja = (s, t, ls, lt, h, z0, col, op = {}) => {
    const s0 = s - ls / 2, s1 = s + ls / 2, t0 = t - lt / 2, t1 = t + lt / 2, Q = (ss, tt, z) => at(ss, tt, z0 + z), out = {};
    const caras = [
      ['frente', [ar, ac], [Q(s1, t0, 0), Q(s1, t1, 0), Q(s1, t1, h), Q(s1, t0, h)]],
      ['atras', [-ar, -ac], [Q(s0, t1, 0), Q(s0, t0, 0), Q(s0, t0, h), Q(s0, t1, h)]],
      ['ladoM', [br, bc], [Q(s0, t1, 0), Q(s1, t1, 0), Q(s1, t1, h), Q(s0, t1, h)]],
      ['ladoN', [-br, -bc], [Q(s0, t0, 0), Q(s1, t0, 0), Q(s1, t0, h), Q(s0, t0, h)]]
    ];
    for (const [k, [nr, nc], pts] of caras) if (nr + nc > 1e-6) { rellena(g, pts, op[k] || tono(op.lado || col, nr, nc), op.borde === undefined ? 'rgba(50,32,20,.5)' : op.borde, .3); out[k] = pts; }
    const top = [Q(s0, t0, h), Q(s1, t0, h), Q(s1, t1, h), Q(s0, t1, h)]; rellena(g, top, op.top || mezcla(col, '#FFFFFF', .18), op.borde === undefined ? 'rgba(50,32,20,.5)' : op.borde, .3); out.top = top;
    out.lado = out.ladoM || out.ladoN; return out;
  };
  const sub = (F, u0, u1, v0, v1) => { const Lp = (a, b, f) => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f], q = (u, v) => Lp(Lp(F[0], F[1], u), Lp(F[3], F[2], u), v); return [q(u0, v0), q(u1, v0), q(u1, v1), q(u0, v1)]; };
  // Rueda de pie en el plano de la dirección; dos cuadros de giro (los pernos del rin rotan).
  const rueda = (s, t, r, op = {}) => {
    const p = at(s, t, 0), va = PPx(ar, ac), ux0 = va[0] / 35.78, uy = va[1] / 35.78, ux = Math.abs(ux0) < .3 ? .3 * (ux0 < 0 ? -1 : 1) : ux0, cy = p[1] - r * .95;
    const elipse = rr => { g.beginPath(); for (let k = 0; k <= 20; k++) { const th = k / 20 * Math.PI * 2, x = p[0] + rr * Math.cos(th) * ux, y = cy + rr * Math.cos(th) * uy - rr * Math.sin(th); k ? g.lineTo(x, y) : g.moveTo(x, y); } g.closePath(); };
    elipse(r); g.fillStyle = '#232326'; g.fill(); elipse(r * .58); g.fillStyle = op.rin || '#9A9EA2'; g.fill();
    g.fillStyle = '#4A4E52'; for (let k = 0; k < 2; k++) { const th = paso * Math.PI / 4 + k * Math.PI; g.beginPath(); g.arc(p[0] + r * .32 * Math.cos(th) * ux, cy + r * .32 * Math.cos(th) * uy - r * .32 * Math.sin(th), r * .1, 0, 7); g.fill(); }
  };
  const cerca = (br + bc) >= 0 ? 1 : -1; // el lado (t) que mira al jugador
  const ordenar = partes => partes.sort((a, b) => prof(a[0], 0) - prof(b[0], 0)).forEach(p => p[1]());
  return { at, caja, sub, rueda, cerca, ordenar };
}
function camionIso(g, dr, dc, paso) {
  const A = armar(g, dr, dc, paso), cab = '#2F6BA0', ruedas = t => { for (const s of [-.15, .14]) A.rueda(s, t * .085, 2); };
  sombraPie(g, 0, 0, 13, 4.6, .22);
  ruedas(-A.cerca);
  A.ordenar([
    [-.06, () => { // platón de estacas con la carga de café
      const B = A.caja(-.06, 0, .32, .17, 4.6, 2.6, '#B0824E', { top: '#5E4228' });
      for (const F of [B.lado, B.atras]) if (F) { for (let k = 1; k < 6; k++) rellena(g, A.sub(F, k / 6 - .01, k / 6 + .01, 0, 1), 'rgba(60,40,22,.55)', null); rellena(g, A.sub(F, 0, 1, .46, .52), 'rgba(60,40,22,.45)', null); }
      for (let k = 0; k < 6; k++) { const s = -.18 + (k % 3) * .08, t = (Math.floor(k / 3) - .5) * .07, p = A.at(s, t, 7.6); g.fillStyle = k % 2 ? '#C9B48A' : '#BFA87C'; g.beginPath(); g.ellipse(p[0], p[1], 3, 1.8, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(110,80,40,.6)'; g.lineWidth = .3; g.stroke(); g.beginPath(); g.moveTo(p[0] - 2.4, p[1] + .1); g.lineTo(p[0] + 2.4, p[1] - .1); g.stroke(); } // bultos de café
    }],
    [.17, () => { // cabina con vidrio, puerta y techo
      const B = A.caja(.17, 0, .11, .16, 7, 2.6, '#4A86BA', { top: '#6A9CC8' });
      if (B.lado) { rellena(g, A.sub(B.lado, .12, .88, .55, .9), '#BFD8E4', 'rgba(30,40,50,.6)'); rellena(g, A.sub(B.lado, .2, .26, .1, .5), 'rgba(20,30,40,.45)', null); }
      if (B.frente) { rellena(g, A.sub(B.frente, .08, .92, .55, .92), '#CFE4EE', 'rgba(30,40,50,.6)'); rellena(g, A.sub(B.frente, .1, .5, .62, .88), 'rgba(255,255,255,.35)', null); }
      if (B.atras) rellena(g, A.sub(B.atras, .2, .8, .55, .85), '#3A4A56', null);
    }],
    [.255, () => { // trompa con persiana, farolas y bómper
      const B = A.caja(.255, 0, .06, .15, 3.8, 2.4, '#4A86BA', { top: '#5A8EBC' });
      if (B.frente) { rellena(g, A.sub(B.frente, .25, .75, .25, .85), '#2A3036', null); for (let k = 0; k < 4; k++) rellena(g, A.sub(B.frente, .27, .73, .32 + k * .14, .37 + k * .14), '#8A9298', null); for (const u of [.12, .88]) rellena(g, A.sub(B.frente, u - .07, u + .07, .5, .75), '#F4E8B8', 'rgba(60,50,30,.6)'); }
      A.caja(.29, 0, .012, .16, .9, 1.6, '#B8BCC0', { borde: null });
    }]
  ]);
  void cab; ruedas(A.cerca);
}
function chivaIso(g, dr, dc, paso) {
  const A = armar(g, dr, dc, paso), colores = ['#C8283A', '#E8B828', '#2E6BA0', '#2E9A4A'], ruedas = t => { for (const s of [-.17, .15]) A.rueda(s, t * .09, 2.1, { rin: '#C8283A' }); };
  sombraPie(g, 0, 0, 14, 4.8, .22);
  ruedas(-A.cerca);
  A.ordenar([
    [-.03, () => {
      const B = A.caja(-.03, 0, .38, .18, 8.4, 2.4, '#FAF0D8', { top: '#E8DCC0' });
      for (const F of [B.lado, B.atras]) if (F) colores.forEach((col, k) => rellena(g, A.sub(F, 0, 1, .06 + k * .06, .12 + k * .06), col, null));
      if (B.lado) {
        for (let k = 0; k < 5; k++) { const u0 = .06 + k * .18; rellena(g, A.sub(B.lado, u0, u0 + .13, .5, .86), '#3A3028', 'rgba(30,20,10,.6)'); const m = A.sub(B.lado, u0 + .03, u0 + .1, .55, .72), c = [(m[0][0] + m[2][0]) / 2, (m[0][1] + m[2][1]) / 2]; g.fillStyle = ['#C98E62', '#A8734C', '#E0B08A'][k % 3]; g.beginPath(); g.arc(c[0], c[1], 1, 0, 7); g.fill(); if (k % 2) { g.fillStyle = '#F4EFE2'; g.beginPath(); g.ellipse(c[0], c[1] - 1, 1.5, .5, 0, 0, 7); g.fill(); } } // ventanas con pasajeros
        rellena(g, A.sub(B.lado, 0, 1, .92, 1), '#C8283A', null);
      }
      if (B.atras) for (let k = 0; k < 5; k++) rellena(g, A.sub(B.atras, .44, .56, .2 + k * .16, .24 + k * .16), '#5A3A22', null); // escalera
      A.caja(-.03, 0, .34, .16, .4, 10.8, '#6E4529', { top: '#8A5A36', borde: null }); // parrilla
      for (let k = 0; k < 5; k++) { const p = A.at(-.17 + k * .07, (k % 2 - .5) * .06, 12.2); g.fillStyle = k === 2 ? '#8FAE4A' : k % 2 ? '#C9B48A' : '#BFA87C'; g.beginPath(); g.ellipse(p[0], p[1], 2.6, 1.8, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(90,60,30,.5)'; g.lineWidth = .3; g.stroke(); } // bultos y un racimo
    }],
    [.21, () => {
      const B = A.caja(.215, 0, .07, .16, 4.2, 2.2, '#D84050', { top: '#E8B828' });
      if (B.frente) { rellena(g, A.sub(B.frente, .25, .75, .25, .85), '#2A3036', null); for (const u of [.12, .88]) rellena(g, A.sub(B.frente, u - .07, u + .07, .5, .75), '#F4E8B8', 'rgba(60,50,30,.6)'); }
    }]
  ]);
  ruedas(A.cerca);
}
// Las 8 direcciones: c y r son los ejes de las casillas; d (r y c a la vez: hacia abajo en la pantalla) y x (c sube y r
// baja: hacia la derecha) son las diagonales que se usan al doblar las esquinas.
const DIR8 = { c: [0, 1], r: [1, 0], d: [1, 1], x: [-1, 1] };

// Dibuja un vehículo en el origen. eje 'c' o 'r'; dir +1 o −1; paso 0..3 (patas de la mula y del arriero).
function vehiculo(g, era, eje, dir, paso, vi) {
  const rng = mulberry(7), adelante = (eje === 'c' ? [0, .14] : [.14, 0]).map(x => x * dir);
  if (era === 'herradura') {
    // Renovación colonial: mula de arriero dibujada (con sus patas al paso) y el arriero detrás, arreándola.
    const derecha = (eje === 'c') === (dir > 0), atras = P(eje === 'r' ? -.14 * dir : 0, eje === 'c' ? -.14 * dir : 0);
    const G = hornearGente(), m = G.marcos[`campesino_${vi}_${(eje === 'c' ? dir > 0 : dir > 0) ? 1 : 0}_${paso}`], E2 = G.escala;
    const arriero = () => { if (m) { g.save(); g.translate(atras[0], atras[1]); if (!derecha) g.scale(-1, 1); g.drawImage(G.canvas, m.x, m.y, m.w, m.h, -m.ax / E2 * .7, -m.ay / E2 * .7, m.w / E2 * .7, m.h / E2 * .7); g.restore(); } };
    const delante = dir > 0; // de frente al jugador: el arriero queda detrás de la mula
    if (delante) arriero();
    g.save(); if (!derecha) g.scale(-1, 1); g.scale(.6, .6); mula(g, paso); g.restore();
    if (!delante) arriero();
  } else if (era === 'carreta') {
    const derecha = (eje === 'c') === (dir > 0);
    g.save(); if (!derecha) g.scale(-1, 1); g.scale(.95, .95); g.translate(-2, 0); carretaBueyes(g, paso); g.restore();
  } else { const [r, c] = DIR8[eje]; (era === 'empedrado' ? chivaIso : camionIso)(g, r * dir, c * dir, paso); } // chiva de colores o camión de estacas
}

// Hoja de vehículos: claves `${era}_${eje}_${+|-}_${paso}` (los carros tienen solo el paso 0).
let HOJA = null;
export function hornearVehiculos() {
  if (HOJA) return HOJA;
  const E = RES_HOJA, w = 52, h = 40, ax = 26, ay = 28, claves = [];
  // Cada arriero conserva su ropa (vi) en los cuatro pasos; antes cambiaba de color en cada paso.
  const motor = e => e === 'empedrado' || e === 'carretera';
  for (const era of ['herradura', 'carreta', 'empedrado', 'carretera']) for (const eje of motor(era) ? ['c', 'r', 'd', 'x'] : ['c', 'r']) for (const dir of [1, -1]) for (let p = 0; p < (motor(era) ? 2 : 4); p++) for (let vi = 0; vi < (era === 'herradura' ? 3 : 1); vi++) claves.push([era, eje, dir, p, vi]);
  const cols = 8, cv = lienzo(cols * w * E, Math.ceil(claves.length / cols) * h * E), g = cv.getContext('2d'), marcos = {};
  claves.forEach(([era, eje, dir, p, vi], n) => {
    const x = (n % cols) * w * E, y = Math.floor(n / cols) * h * E;
    marcos[`${era}_${eje}_${dir > 0 ? '+' : '-'}_${p}_${vi}`] = { x, y, w: w * E, h: h * E, ax: ax * E, ay: ay * E };
    g.save(); g.translate(x + ax * E, y + ay * E); g.scale(E, E); vehiculo(g, era, eje, dir, p, vi); g.restore();
  });
  // Mula y carreta se ven de lado: en las diagonales usan el dibujo del eje más parecido (x de lado como c, d como r).
  for (const k of Object.keys(marcos)) { const [era, eje, d, p, vi] = k.split('_'); if (eje === 'c' && !motor(era)) marcos[`${era}_x_${d}_${p}_${vi}`] = marcos[k]; if (eje === 'r' && !motor(era)) marcos[`${era}_d_${d}_${p}_${vi}`] = marcos[k]; }
  // Los motores tienen dos cuadros de giro de las ruedas: los pasos 2 y 3 repiten 0 y 1.
  for (const k of Object.keys(marcos)) { const [era, eje, d, p, vi] = k.split('_'); if (motor(era)) marcos[`${era}_${eje}_${d}_${+p + 2}_${vi}`] = marcos[k]; }
  return (HOJA = { canvas: cv, marcos, escala: E });
}

// Icono de la herramienta: un rombo de tierra con un cruce de calles del estilo de la época (y una X para quitar).
const ICONOS = {};
export function iconoCalle(era, quitar) {
  const k = era + (quitar ? '-x' : '');
  if (ICONOS[k]) return ICONOS[k];
  const c = lienzo(96, 80), g = c.getContext('2d'), R = mulberry(5), E = ESTILO_CALLE[era] || ESTILO_CALLE.herradura;
  pintar(g, [[48, 22], [86, 41], [48, 60], [10, 41]], mix(FR.tierraVerde, FR.ocreClaro, .35), R, { n: 2, bw: .6 });
  g.lineCap = 'round';
  for (const [w, col, al] of [[E.ancho * 1.3 + 3, E.borde, .5], [E.ancho * 1.3, E.color, 1]]) { g.globalAlpha = al; g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(29, 31.5); g.lineTo(67, 50.5); g.moveTo(67, 31.5); g.lineTo(29, 50.5); g.stroke(); }
  g.globalAlpha = 1;
  if (era === 'carretera') { g.strokeStyle = FR.ocre; g.lineWidth = 1; g.setLineDash([4, 4]); g.beginPath(); g.moveTo(29, 31.5); g.lineTo(67, 50.5); g.stroke(); g.setLineDash([]); }
  if (quitar) { g.strokeStyle = FR.rojo; g.lineWidth = 6; g.beginPath(); g.moveTo(34, 26); g.lineTo(62, 56); g.moveTo(62, 26); g.lineTo(34, 56); g.stroke(); }
  return (ICONOS[k] = urlDe(c));
}
