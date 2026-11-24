// Infraestructura que se ve (fase 16, punto 5): el ferrocarril con sus rieles y un tren que llega a la estación, espera y
// sigue hasta salir del mapa; y el aeropuerto con un avión que aterriza, espera y despega. Los dibujos se hornean una vez.
// Con "reducir movimiento" quedan los rieles y la pista, sin tren ni avión en marcha.
import { P, alturaEn, TW, TH } from '../arte/iso.js';
import { lienzo } from '../arte/acuarela.js';
import { reducirMovimiento } from './pantalla.js';

const E = 3;
const sen = p => Math.sin(p * Math.PI / 2), cos1 = p => 1 - Math.cos(p * Math.PI / 2);

// Tren hacia abajo y a la derecha (eje de las columnas); el de las filas es su espejo. Redibujado con volumen (pedido de
// Juan: redibujar los vehículos): vagón de carga de tablas con su puerta corrediza y bultos de café, coche de
// pasajeros con ventanas y gente, locomotora con caldera de bandas, domo, chimenea de campana, cabina con techo,
// barredera adelante y ruedas de radios con su biela. Luz arriba a la izquierda, como las casas.
function hornearTren(tx) {
  if (tx.exists('tren')) return;
  const W = 150, H = 64, c = lienzo(W * E, H * E), g = c.getContext('2d'); g.scale(E, E);
  const a = [.894, .447], b = [-.894, .447], x0 = 70, y0 = 44;
  const pt = (u, v, z = 0) => [x0 + a[0] * u + b[0] * v, y0 + a[1] * u + b[1] * v - z];
  const poli = (pts, col, borde = 'rgba(40,30,20,.55)') => { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fillStyle = col; g.fill(); if (borde) { g.strokeStyle = borde; g.lineWidth = .4; g.stroke(); } };
  const mez = (h, f) => { const v = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)).map(x => Math.round(f < 0 ? x * (1 + f) : x + (255 - x) * f)); return '#' + v.map(x => Math.max(0, Math.min(255, x)).toString(16).padStart(2, '0')).join(''); };
  // Caja: cara de lado (v = +w, con luz), cara de frente (u1) en sombra y techo.
  const caja = (u0, u1, w, z0, h, col) => { const L = [pt(u0, w, z0), pt(u1, w, z0), pt(u1, w, z0 + h), pt(u0, w, z0 + h)]; poli(L, mez(col, .08)); poli([pt(u1, -w, z0), pt(u1, w, z0), pt(u1, w, z0 + h), pt(u1, -w, z0 + h)], mez(col, -.25)); poli([pt(u0, -w, z0 + h), pt(u1, -w, z0 + h), pt(u1, w, z0 + h), pt(u0, w, z0 + h)], mez(col, .22)); return L; };
  const enLado = (L, u, v) => { const Lp = (p, q, f) => [p[0] + (q[0] - p[0]) * f, p[1] + (q[1] - p[1]) * f]; return Lp(Lp(L[0], L[1], u), Lp(L[3], L[2], u), v); };
  const rect = (L, u0, u1, v0, v1, col, borde) => poli([enLado(L, u0, v0), enLado(L, u1, v0), enLado(L, u1, v1), enLado(L, u0, v1)], col, borde);
  const rueda = (u, v, r) => { const p = pt(u, v, r); g.fillStyle = '#1E1A18'; g.beginPath(); g.ellipse(p[0], p[1], r * .9, r, -.46, 0, 7); g.fill(); g.strokeStyle = '#6A6E74'; g.lineWidth = .3; for (let k = 0; k < 6; k++) { const t = k / 6 * Math.PI * 2; g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(p[0] + Math.cos(t) * r * .8, p[1] + Math.sin(t) * r * .85); g.stroke(); } g.fillStyle = '#8A8E94'; g.beginPath(); g.arc(p[0], p[1], .5, 0, 7); g.fill(); };
  g.globalAlpha = .22; g.fillStyle = '#2A2118'; g.beginPath(); g.ellipse(x0 - 8, y0 + 2, 36, 6, .45, 0, 7); g.fill(); g.globalAlpha = 1; // sombra
  // Ruedas del lado de allá (asoman bajo la caja).
  for (const u of [-35, -25, -17, -7, 3, 9, 15, 20]) rueda(u, -4.6, 2);
  // Vagón de carga: tablas, puerta corrediza, techo curvo y bultos de café asomando.
  { const L = caja(-38, -22, 5.5, 3.4, 9, '#8E3B2E'); for (let k = 1; k < 8; k++) rect(L, k / 8 - .005, k / 8 + .005, 0, 1, 'rgba(50,20,15,.5)', null); rect(L, .35, .65, .08, .9, '#7A2E24'); rect(L, .48, .52, .4, .6, '#C9A44A', null); poli([pt(-38, -5.5, 12.4), pt(-22, -5.5, 12.4), pt(-22, 0, 13.6), pt(-38, 0, 13.6)], '#5A2A22'); }
  // Coche de pasajeros: crema y verde, ventanas con gente y techo con su linterna.
  { const L = caja(-20, -4, 5.5, 3.4, 9.4, '#E8DCB8'); rect(L, 0, 1, 0, .32, '#3E6B4A', null); for (let k = 0; k < 5; k++) { const u0 = .07 + k * .18; rect(L, u0, u0 + .12, .5, .85, '#3A3A40'); const m = enLado(L, u0 + .06, .62); g.fillStyle = ['#C98E62', '#A8734C', '#E0B08A'][k % 3]; g.beginPath(); g.arc(m[0], m[1], .9, 0, 7); g.fill(); } caja(-17, -7, 2, 12.8, 1.2, '#5A4A3A'); }
  // Enganches.
  for (const u of [-21, -3]) { const p = pt(u, 0, 5); g.fillStyle = '#2A2A2E'; g.fillRect(p[0] - 1, p[1] - .6, 2, 1.2); }
  // Tender con carbón.
  { const L = caja(-1, 6, 5, 3.4, 6.5, '#2E3A28'); rect(L, 0, 1, .82, 1, '#B8A060', null); for (let k = 0; k < 7; k++) { const p = pt(-.4 + k, (k % 3 - 1) * 2.4, 10.4); g.fillStyle = '#1A1A1C'; g.beginPath(); g.ellipse(p[0], p[1], 1.4, .8, 0, 0, 7); g.fill(); } }
  // Cabina del maquinista con techo voladizo y ventana.
  { const L = caja(6, 11, 5.6, 3.4, 11.5, '#3A2A24'); rect(L, .2, .8, .55, .85, '#E8C870'); caja(5.4, 11.8, 6.2, 14.9, .7, '#22201E'); }
  // Caldera con bandas de bronce, domo y chimenea de campana.
  { const L = caja(11, 22, 4.4, 3.4, 7.8, '#26302A'); for (const u of [.2, .5, .8]) rect(L, u - .02, u + .02, 0, 1, '#B8964A', null); const d = pt(15, 0, 11.2); g.fillStyle = '#B8964A'; g.beginPath(); g.ellipse(d[0], d[1] - 1.2, 2, 1.6, 0, 0, 7); g.fill(); }
  { const ch = pt(19.5, 0, 11.2); g.fillStyle = '#1F1B18'; g.fillRect(ch[0] - 1.3, ch[1] - 6, 2.6, 6); g.beginPath(); g.moveTo(ch[0] - 1.3, ch[1] - 6); g.lineTo(ch[0] - 2.8, ch[1] - 8.6); g.lineTo(ch[0] + 2.8, ch[1] - 8.6); g.lineTo(ch[0] + 1.3, ch[1] - 6); g.closePath(); g.fill(); g.fillStyle = '#B5392B'; g.fillRect(ch[0] - 2.8, ch[1] - 9.2, 5.6, .8); }
  { const fa = pt(22.2, 0, 8.6); g.fillStyle = '#F2D98A'; g.beginPath(); g.arc(fa[0], fa[1], 1.3, 0, 7); g.fill(); g.fillStyle = 'rgba(255,240,180,.35)'; g.beginPath(); g.arc(fa[0], fa[1], 2.4, 0, 7); g.fill(); } // farol
  poli([pt(22, -4, 3), pt(22, 4, 3), pt(25, 0, .4)], '#8A2E24'); // barredera
  // Ruedas del lado de acá, con la biela de la locomotora.
  for (const u of [-35, -25, -17, -7, 3]) rueda(u, 5.6, 2);
  for (const u of [9, 15, 20]) rueda(u, 5.6, 2.6);
  { const p1 = pt(9, 5.6, 2.6), p2 = pt(20, 5.6, 2.6); g.strokeStyle = '#9A9EA4'; g.lineWidth = .7; g.beginPath(); g.moveTo(p1[0], p1[1]); g.lineTo(p2[0], p2[1]); g.stroke(); }
  tx.addCanvas('tren', c);
}
// Avión de hélice de lado, hacia la derecha: fuselaje plateado con franja, ventanillas, cabina, cola con la bandera,
// ala con su motor y la hélice como un disco borroso, y el tren de aterrizaje.
function hornearAvion(tx) {
  if (tx.exists('avion')) return;
  const W = 60, H = 30, c = lienzo(W * E, H * E), g = c.getContext('2d'); g.scale(E, E);
  g.strokeStyle = 'rgba(40,30,20,.55)'; g.lineWidth = .4;
  g.fillStyle = '#9AA2A8'; g.beginPath(); g.moveTo(27, 15.6); g.lineTo(18, 20.5); g.lineTo(21, 20.8); g.lineTo(33, 16); g.closePath(); g.fill(); g.stroke(); // ala de allá
  const gr = g.createLinearGradient(0, 10, 0, 20); gr.addColorStop(0, '#F4F4F2'); gr.addColorStop(.5, '#D8DCDE'); gr.addColorStop(1, '#A8B0B4');
  g.fillStyle = gr; g.beginPath(); g.moveTo(8, 13.6); g.quadraticCurveTo(20, 10.8, 40, 11.6); g.quadraticCurveTo(48, 12, 49.4, 15); g.quadraticCurveTo(48, 18, 40, 18.4); g.quadraticCurveTo(20, 19, 8, 15.8); g.closePath(); g.fill(); g.stroke(); // fuselaje
  g.fillStyle = '#B5392B'; g.fillRect(12, 15, 34, .9); // franja
  g.fillStyle = '#2E4A5E'; for (let k = 0; k < 7; k++) { g.beginPath(); g.ellipse(18 + k * 3.4, 13.6, .9, .7, 0, 0, 7); g.fill(); } // ventanillas
  g.fillStyle = '#3E6A86'; g.beginPath(); g.moveTo(43, 12.4); g.quadraticCurveTo(46.6, 12.2, 47.8, 14); g.lineTo(43.4, 14); g.closePath(); g.fill(); // cabina
  g.fillStyle = '#D8DCDE'; g.beginPath(); g.moveTo(9, 13.8); g.lineTo(5, 5.6); g.lineTo(9, 5.6); g.lineTo(15, 13); g.closePath(); g.fill(); g.stroke(); // cola
  [['#E8B828', 6.6], ['#2E6BA0', 7.9], ['#C8283A', 9.2]].forEach(([col, y]) => { g.fillStyle = col; g.fillRect(6.1 + (y - 5.6) * .4, y, 3.6, 1.2); }); // bandera
  g.fillStyle = '#C4CACE'; g.beginPath(); g.moveTo(5, 14.6); g.lineTo(13, 14.4); g.lineTo(12, 16.2); g.closePath(); g.fill(); g.stroke(); // estabilizador
  g.fillStyle = '#C4CACE'; g.beginPath(); g.moveTo(26, 16); g.lineTo(32, 24.6); g.lineTo(37, 24.6); g.lineTo(35, 16.2); g.closePath(); g.fill(); g.stroke(); // ala de acá
  // Motor en el borde del ala: góndola alargada en la dirección del vuelo, con su capó y la hélice girando delante.
  { const gm = g.createLinearGradient(0, 15.6, 0, 18.4); gm.addColorStop(0, '#C8CED2'); gm.addColorStop(1, '#7E868C'); g.fillStyle = gm; g.beginPath(); g.moveTo(31, 16.2); g.quadraticCurveTo(33, 15.4, 38.4, 15.8); g.lineTo(38.4, 18); g.quadraticCurveTo(33, 18.4, 31, 17.4); g.closePath(); g.fill(); g.stroke(); }
  g.fillStyle = '#3A3E42'; g.fillRect(38.2, 15.8, .7, 2.2); // capó
  g.fillStyle = 'rgba(70,70,74,.22)'; g.beginPath(); g.ellipse(39.4, 16.9, .45, 3, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(49.8, 15, .45, 3.2, 0, 0, 7); g.fill(); // hélices girando
  g.strokeStyle = '#3A3A3E'; g.lineWidth = .5; for (const x of [22, 36]) { g.beginPath(); g.moveTo(x, 18.6); g.lineTo(x, 22.4); g.stroke(); g.fillStyle = '#1E1E22'; g.beginPath(); g.arc(x, 22.8, .9, 0, 7); g.fill(); } // tren de aterrizaje
  tx.addCanvas('avion', c);
}

export class Ferrovia {
  constructor(scene) {
    this.scene = scene; this.capa = scene.add.graphics().setDepth(-680);
    hornearTren(scene.textures); hornearAvion(scene.textures);
    this.firma = ''; this.tren = null; this.avion = null; this.esperaTren = 4; this.esperaAvion = 10;
    this.actualizar();
  }
  // Busca las huellas de ferrocarril y aeropuerto y rehace rieles y vehículos solo si cambiaron.
  actualizar() {
    const { S, T } = this.scene, f = S.map.findIndex(x => !x.b && x.mk && x.mk.t === 'ferrocarril'), a = S.map.findIndex(x => !x.b && x.mk && x.mk.t === 'aeropuerto');
    const firma = f + '|' + a; if (firma === this.firma) return; this.firma = firma;
    this.capa.clear(); this.quitar();
    if (f >= 0) this.rieles(T.tiles[f]);
    this.tilePista = a >= 0 ? T.tiles[a] : null; this.pistaGrande = a >= 0 && !!S.map[a].mk.g; // en 2×2 la pista corre a lo largo de la huella this.estacion = f >= 0 ? T.tiles[f] : null;
  }
  quitar() {
    if (this.tren) { this.tren.img.destroy(); this.tren.humo.destroy(); this.tren = null; }
    if (this.avion) { this.avion.img.destroy(); this.avion.sombra.destroy(); this.avion = null; }
  }
  rieles(t) {
    const { T } = this.scene, N = T.N; this.eje = (t.r * 7 + t.c * 3) % 2 ? 'c' : 'r';
    const pto = s => { const r = this.eje === 'r' ? s : t.r + .5, c = this.eje === 'c' ? s : t.c + .5; return P(r, c, alturaEn(T, r, c)); };
    const cruz = this.eje === 'c' ? [-.894, .447] : [.894, .447], g = this.capa;
    for (const lado of [-1, 1]) { g.lineStyle(1.3, 0x4A4038, .9); g.beginPath(); for (let s = 0; s <= N; s += .5) { const p = pto(s); s ? g.lineTo(p[0] + cruz[0] * 3 * lado, p[1] + cruz[1] * 3 * lado) : g.moveTo(p[0] + cruz[0] * 3 * lado, p[1] + cruz[1] * 3 * lado); } g.strokePath(); }
    g.lineStyle(1.6, 0x7A5C3A, .85); for (let s = .1; s < N; s += .35) { const p = pto(s); g.beginPath(); g.moveTo(p[0] - cruz[0] * 4, p[1] - cruz[1] * 4); g.lineTo(p[0] + cruz[0] * 4, p[1] + cruz[1] * 4); g.strokePath(); }
    this.pto = pto; this.N = N; this.parada = (this.eje === 'r' ? t.r : t.c) + .5;
  }
  lanzarTren() {
    const sc = this.scene, img = sc.add.image(0, 0, 'tren').setScale(1 / E).setOrigin(70 / 150, 44 / 64).setVisible(false);
    if (this.eje === 'r') img.setFlipX(true);
    const humo = sc.add.particles(0, 0, 'edificios', { frame: 'humo', lifespan: 2200, speedX: { min: -4, max: 4 }, speedY: { min: -12, max: -7 }, scale: { start: .08, end: .34 }, alpha: { start: .45, end: 0 }, frequency: 220, quantity: 1, emitting: false });
    this.tren = { img, humo, fase: 0, t: 0, s: -3 };
  }
  update(dt) {
    if (reducirMovimiento()) { this.quitar(); return; }
    if (this.estacion && this.pto) this.moverTren(dt);
    if (this.tilePista) this.moverAvion(dt);
  }
  moverTren(dt) {
    if (!this.tren) { this.esperaTren -= dt; if (this.esperaTren > 0) return; this.lanzarTren(); }
    const v = this.tren, N = this.N, ini = -3, fin = N + 3;
    v.t += dt;
    if (v.fase === 0) { const d = (this.parada - ini) / 2.4 * 1.4, p = Math.min(1, v.t / d); v.s = ini + (this.parada - ini) * sen(p); if (p >= 1) { v.fase = 1; v.t = 0; } }
    else if (v.fase === 1) { v.s = this.parada; if (v.t > 5) { v.fase = 2; v.t = 0; } }
    else { const d = (fin - this.parada) / 2.4 * 1.4, p = Math.min(1, v.t / d); v.s = this.parada + (fin - this.parada) * cos1(p); if (p >= 1) { v.fase = 3; v.t = 0; } }
    if (v.fase === 3) { v.img.setVisible(false); v.humo.emitting = false; this.tren = null; v.img.destroy(); v.humo.destroy(); this.esperaTren = 40 + Math.random() * 25; return; }
    const p = this.pto(v.s), rc = this.eje === 'r' ? [v.s, this.estacion.c + .5] : [this.estacion.r + .5, v.s];
    v.img.setVisible(v.s > -.5 && v.s < N + .5).setPosition(p[0], p[1]).setDepth(rc[0] + rc[1] + .05);
    v.humo.setPosition(p[0] + (this.eje === 'r' ? -9 : 9), p[1] - 14).setDepth(rc[0] + rc[1] + .06);
    v.humo.emitting = v.img.visible && (v.fase !== 1 || v.t < 3.5);
  }
  moverAvion(dt) {
    const sc = this.scene, t = this.tilePista, c0 = P(t.r + .5, t.c + .5, t.h), G = this.pistaGrande, h0 = G ? this.scene.T.hf(t.r + .36, t.c) : 0, A = G ? P(t.r + .36, t.c - .78, h0) : [c0[0] - 23, c0[1] - 6], B = G ? P(t.r + .36, t.c + .78, h0) : [c0[0] + 26, c0[1] + 3];
    if (!this.avion) {
      this.esperaAvion -= dt; if (this.esperaAvion > 0) return;
      this.avion = { img: sc.add.image(0, 0, 'avion').setScale(1 / E).setOrigin(.5, .5), sombra: sc.add.ellipse(0, 0, 26, 6, 0x2A2118, .3), fase: 0, t: 0 };
    }
    const v = this.avion, D = [1, (B[1] - A[1]) / (B[0] - A[0])], alto = 150, L = 330;
    v.t += dt; let x, y, h;
    if (v.fase === 0) { const p = Math.min(1, v.t / 6); x = A[0] - L + L * sen(p); y = A[1] - L * D[1] + L * D[1] * sen(p); h = alto * (1 - sen(p)); if (p >= 1) { v.fase = 1; v.t = 0; } }
    else if (v.fase === 1) { const p = Math.min(1, v.t / 1.6); x = A[0] + (B[0] - A[0]) * .5 * sen(p); y = A[1] + (B[1] - A[1]) * .5 * sen(p); h = 0; if (p >= 1) { v.fase = 2; v.t = 0; } }
    else if (v.fase === 2) { x = A[0] + (B[0] - A[0]) * .5; y = A[1] + (B[1] - A[1]) * .5; h = 0; if (v.t > 4) { v.fase = 3; v.t = 0; } }
    else { const p = Math.min(1, v.t / 6), q = cos1(p); x = A[0] + (B[0] - A[0]) * .5 + (B[0] + L - (A[0] + (B[0] - A[0]) * .5)) * q; y = A[1] + (B[1] - A[1]) * .5 + (L * D[1]) * q; h = alto * q; if (p >= 1) { v.img.destroy(); v.sombra.destroy(); this.avion = null; this.esperaAvion = 50 + Math.random() * 30; return; } }
    v.img.setPosition(x, y - h - 4).setDepth(t.r + t.c + 40 + h / 10).setRotation(v.fase === 0 ? .06 : v.fase === 3 ? -.12 : 0);
    v.sombra.setPosition(x, y).setScale(1 - h / 300).setDepth(t.r + t.c + .5).setAlpha(.3 * (1 - h / 220));
  }
}
export { hornearTren, hornearAvion }; // para la página de prueba
