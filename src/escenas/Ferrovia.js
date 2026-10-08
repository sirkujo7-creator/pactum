// Infraestructura que se ve (fase 16, punto 5): el ferrocarril con sus rieles y un tren que llega a la estación, espera y
// sigue hasta salir del mapa; y el aeropuerto con un avión que aterriza, espera y despega. Los dibujos se hornean una vez.
// Con "reducir movimiento" quedan los rieles y la pista, sin tren ni avión en marcha.
import { P, alturaEn, TW, TH } from '../arte/iso.js';
import { lienzo } from '../arte/acuarela.js';
import { reducirMovimiento } from './pantalla.js';

const E = 3;
const sen = p => Math.sin(p * Math.PI / 2), cos1 = p => 1 - Math.cos(p * Math.PI / 2);

// Tren hacia abajo y a la derecha (eje de las columnas); el de las filas es su espejo.
function hornearTren(tx) {
  if (tx.exists('tren')) return;
  const W = 150, H = 64, c = lienzo(W * E, H * E), g = c.getContext('2d'); g.scale(E, E);
  const a = [.894, .447], b = [-.894, .447], x0 = 70, y0 = 44;
  const pt = (u, v, z = 0) => [x0 + a[0] * u + b[0] * v, y0 + a[1] * u + b[1] * v - z];
  const poli = (pts, col) => { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fillStyle = col; g.fill(); g.strokeStyle = 'rgba(40,30,20,.55)'; g.lineWidth = .5; g.stroke(); };
  g.globalAlpha = .22; g.fillStyle = '#2A2118'; g.beginPath(); g.ellipse(x0 - 8, y0 + 2, 34, 5.5, .45, 0, 7); g.fill(); g.globalAlpha = 1; // sombra
  const caja = (u0, u1, w, z0, h, cl, cr, ct, cf) => { // cara de frente-izquierda (v+), cara de frente (u+), techo
    poli([pt(u0, w, z0), pt(u1, w, z0), pt(u1, w, z0 + h), pt(u0, w, z0 + h)], cl);
    poli([pt(u1, -w, z0), pt(u1, w, z0), pt(u1, w, z0 + h), pt(u1, -w, z0 + h)], cr);
    poli([pt(u0, -w, z0 + h), pt(u1, -w, z0 + h), pt(u1, w, z0 + h), pt(u0, w, z0 + h)], ct);
  };
  // vagones (de atrás hacia el frente): carga de café, pasajeros, locomotora
  caja(-38, -22, 5.5, 3, 9, '#8E3B2E', '#6F2C22', '#A5503F');
  caja(-20, -4, 5.5, 3, 9, '#C9A44A', '#A58733', '#DDBB62');
  const u = (u0, u1, v, z) => [pt(u0, v, z), pt(u1, v, z)];
  g.strokeStyle = '#4A3A24'; g.lineWidth = .8; for (const [p, q] of [u(-36, -24, 5.5, 8), u(-18, -6, 5.5, 8)]) { g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); g.stroke(); }
  caja(-1, 22, 5, 3, 7, '#2E3A28', '#202A1C', '#3E4D36'); // caldera
  caja(-1, 8, 5.6, 3, 12, '#3A2A24', '#2A1D18', '#4C3B33'); // cabina
  const ch = pt(17, 0, 10); g.fillStyle = '#1F1B18'; g.fillRect(ch[0] - 1.6, ch[1] - 8, 3.2, 8); g.fillStyle = '#C0392B'; g.fillRect(ch[0] - 2.4, ch[1] - 9, 4.8, 1.6); // chimenea
  const fa = pt(22.4, 0, 6); g.fillStyle = '#F2D98A'; g.beginPath(); g.arc(fa[0], fa[1], 1.4, 0, 7); g.fill(); // farol
  g.fillStyle = '#1F1B18'; for (const uu of [-30, -12, 4, 14]) { const w = pt(uu, 5.6, 2); g.beginPath(); g.arc(w[0], w[1], 2.2, 0, 7); g.fill(); }
  tx.addCanvas('tren', c);
}
// Avión de hélice visto de lado, hacia la derecha.
function hornearAvion(tx) {
  if (tx.exists('avion')) return;
  const W = 60, H = 30, c = lienzo(W * E, H * E), g = c.getContext('2d'); g.scale(E, E);
  g.strokeStyle = 'rgba(40,30,20,.6)'; g.lineWidth = .6;
  g.fillStyle = '#E7DFC9'; g.beginPath(); g.ellipse(30, 15, 17, 4.2, 0, 0, 7); g.fill(); g.stroke();
  g.fillStyle = '#B5392B'; g.beginPath(); g.moveTo(13, 14); g.lineTo(7, 7); g.lineTo(11, 7); g.lineTo(19, 13); g.closePath(); g.fill(); g.stroke(); // cola
  g.fillStyle = '#C9B98E'; g.beginPath(); g.moveTo(26, 15); g.lineTo(34, 24); g.lineTo(40, 24); g.lineTo(37, 14); g.closePath(); g.fill(); g.stroke(); // ala
  g.fillStyle = '#6E8FA6'; g.beginPath(); g.ellipse(35, 12.6, 4, 2, 0, 0, 7); g.fill();
  g.strokeStyle = '#3A2A1C'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(47.5, 11); g.lineTo(47.5, 19); g.stroke(); // hélice
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
    this.tilePista = a >= 0 ? T.tiles[a] : null; this.estacion = f >= 0 ? T.tiles[f] : null;
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
    const sc = this.scene, t = this.tilePista, c0 = P(t.r + .5, t.c + .5, t.h), A = [c0[0] - 23, c0[1] - 6], B = [c0[0] + 26, c0[1] + 3];
    if (!this.avion) {
      this.esperaAvion -= dt; if (this.esperaAvion > 0) return;
      this.avion = { img: sc.add.image(0, 0, 'avion').setScale(1 / E).setOrigin(.5, .5), sombra: sc.add.ellipse(0, 0, 26, 6, 0x2A2118, .3), fase: 0, t: 0 };
    }
    const v = this.avion, D = [1, .18], alto = 150, L = 330;
    v.t += dt; let x, y, h;
    if (v.fase === 0) { const p = Math.min(1, v.t / 6); x = A[0] - L + L * sen(p); y = A[1] - L * D[1] + L * D[1] * sen(p); h = alto * (1 - sen(p)); if (p >= 1) { v.fase = 1; v.t = 0; } }
    else if (v.fase === 1) { const p = Math.min(1, v.t / 1.6); x = A[0] + (B[0] - A[0]) * .5 * sen(p); y = A[1] + (B[1] - A[1]) * .5 * sen(p); h = 0; if (p >= 1) { v.fase = 2; v.t = 0; } }
    else if (v.fase === 2) { x = A[0] + (B[0] - A[0]) * .5; y = A[1] + (B[1] - A[1]) * .5; h = 0; if (v.t > 4) { v.fase = 3; v.t = 0; } }
    else { const p = Math.min(1, v.t / 6), q = cos1(p); x = A[0] + (B[0] - A[0]) * .5 + (B[0] + L - (A[0] + (B[0] - A[0]) * .5)) * q; y = A[1] + (B[1] - A[1]) * .5 + (L * D[1]) * q; h = alto * q; if (p >= 1) { v.img.destroy(); v.sombra.destroy(); this.avion = null; this.esperaAvion = 50 + Math.random() * 30; return; } }
    v.img.setPosition(x, y - h - 4).setDepth(t.r + t.c + 40 + h / 10).setRotation(v.fase === 0 ? .06 : v.fase === 3 ? -.12 : 0);
    v.sombra.setPosition(x, y).setScale(1 - h / 300).setDepth(t.r + t.c + .5).setAlpha(.3 * (1 - h / 220));
  }
}
