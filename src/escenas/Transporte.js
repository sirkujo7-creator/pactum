// Transporte visible (fase 16, punto 5): una carretera de tierra desde la plaza hasta el borde del mapa con camiones que salen
// cargados y vuelven (desde La Violencia, y más cuanto más comercio hay), y el cable aéreo del café, con torres y cabinas, si lo
// construiste en el hito del cable. Con «reducir movimiento» solo quedan la carretera y las torres.
import { P, alturaEn } from '../arte/iso.js';
import { lienzo } from '../arte/acuarela.js';
import { epocaHistorica } from '../core/index.js';
import { reducirMovimiento } from './pantalla.js';

const E = 3;
function hornear(tx) {
  if (!tx.exists('camion')) {
    const W = 56, H = 30, c = lienzo(W * E, H * E), g = c.getContext('2d'); g.scale(E, E); g.strokeStyle = 'rgba(40,30,20,.6)'; g.lineWidth = .6;
    g.globalAlpha = .25; g.fillStyle = '#2A2118'; g.beginPath(); g.ellipse(28, 25, 24, 2.6, 0, 0, 7); g.fill(); g.globalAlpha = 1;
    g.fillStyle = '#9C6B3A'; g.fillRect(6, 10, 28, 11); g.strokeRect(6, 10, 28, 11); // carga con costales de café
    g.fillStyle = '#C9A44A'; for (let k = 0; k < 4; k++) { g.beginPath(); g.ellipse(11 + k * 6.4, 9.4, 3.4, 2.6, 0, 0, 7); g.fill(); g.stroke(); }
    g.fillStyle = '#B5392B'; g.fillRect(35, 7, 14, 14); g.strokeRect(35, 7, 14, 14); g.fillStyle = '#6E8FA6'; g.fillRect(41, 9, 6.5, 5); g.fillStyle = '#E7DFC9'; g.fillRect(48, 17, 2.4, 3);
    g.fillStyle = '#1F1B18'; for (const x of [13, 27, 42]) { g.beginPath(); g.arc(x, 22.5, 3, 0, 7); g.fill(); }
    tx.addCanvas('camion', c);
  }
  if (!tx.exists('torre')) {
    const W = 16, H = 40, c = lienzo(W * E, H * E), g = c.getContext('2d'); g.scale(E, E); g.strokeStyle = '#4A3A24'; g.lineWidth = 1.3;
    g.beginPath(); g.moveTo(2, 38); g.lineTo(7, 4); g.moveTo(14, 38); g.lineTo(9, 4); g.moveTo(4, 26); g.lineTo(12, 26); g.moveTo(5.5, 15); g.lineTo(10.5, 15); g.moveTo(3, 32); g.lineTo(11, 20); g.stroke();
    g.fillStyle = '#6B4A2B'; g.fillRect(4, 3, 8, 2.4);
    tx.addCanvas('torre', c);
  }
  if (!tx.exists('cabina')) {
    const W = 16, H = 20, c = lienzo(W * E, H * E), g = c.getContext('2d'); g.scale(E, E); g.strokeStyle = '#2A2118'; g.lineWidth = .8;
    g.beginPath(); g.moveTo(8, 0); g.lineTo(8, 6); g.stroke(); g.fillStyle = '#9C6B3A'; g.fillRect(2, 6, 12, 9); g.strokeRect(2, 6, 12, 9);
    g.fillStyle = '#C9A44A'; g.fillRect(3, 4.4, 10, 2); g.strokeStyle = '#4A3A24'; g.beginPath(); g.moveTo(5, 6); g.lineTo(5, 15); g.moveTo(11, 6); g.lineTo(11, 15); g.stroke();
    tx.addCanvas('cabina', c);
  }
}
const pos = (T, r, c) => P(r, c, alturaEn(T, r, c));

export class Transporte {
  constructor(scene) { this.scene = scene; hornear(scene.textures); this.capa = scene.add.graphics().setDepth(-685); this.firma = ''; this.objetos = []; this.camiones = []; this.cabinas = []; this.actualizar(); }
  limpiar() { this.capa.clear(); this.objetos.forEach(o => o.destroy()); this.objetos = []; this.camiones = []; this.cabinas = []; }
  actualizar() {
    const { S, T } = this.scene, N = T.N, ep = epocaHistorica(S); let pla = S.map.findIndex(x => x.b === 'fundacion'); if (pla < 0) pla = S.map.findIndex(x => x.b === 'casa' && !x.ob);
    const comercio = S.map.filter(x => (x.b === 'mercado' || x.b === 'puerto' || x.b === 'taller') && !x.ob).length;
    const camion = pla >= 0 && ['violencia', 'modernizacion', 'paz', 'digital'].includes(ep) && comercio > 0 ? Math.min(3, 1 + Math.floor(comercio / 3)) : 0;
    const cable = !!(S.decisiones && (S.decisiones.h_cable === 0 || S.decisiones.h_cable === 1));
    const firma = `${pla}|${camion}|${cable}`; if (firma === this.firma) return; this.firma = firma;
    this.limpiar();
    if (camion) this.carretera(pla, N, camion);
    if (cable) this.cable(N);
  }
  // Carretera de tierra hasta el borde más cercano, con camiones.
  carretera(pla, N, n) {
    const { T } = this.scene, r0 = Math.floor(pla / N) + .5, c0 = pla % N + .5;
    const opc = [[1, 0, N - r0], [-1, 0, r0], [0, 1, N - c0], [0, -1, c0]].sort((a, b) => a[2] - b[2])[0], [dr, dc, largo] = opc;
    const pts = []; for (let s = 0; s <= largo; s += .5) pts.push(pos(T, r0 + dr * s, c0 + dc * s));
    this.capa.lineStyle(6, 0x9A7B52, .75); this.capa.beginPath(); pts.forEach((p, i) => i ? this.capa.lineTo(p[0], p[1]) : this.capa.moveTo(p[0], p[1])); this.capa.strokePath();
    this.capa.lineStyle(1, 0x6B4A2B, .6); this.capa.beginPath(); pts.forEach((p, i) => i ? this.capa.lineTo(p[0], p[1]) : this.capa.moveTo(p[0], p[1])); this.capa.strokePath();
    this.ruta = { r0, c0, dr, dc, largo };
    for (let k = 0; k < n; k++) this.camiones.push({ img: this.scene.add.image(0, 0, 'camion').setScale(.8 / E).setOrigin(.5, .85).setVisible(false), s: largo * k / n, dir: 1, espera: 0, v: .9 + k * .25 });
    this.objetos.push(...this.camiones.map(c => c.img));
  }
  // Cable aéreo: de la cima más alta hasta el borde más cercano, con torres y dos cabinas.
  cable(N) {
    const { T } = this.scene, pla = this.scene.S.map.findIndex(x => x.b === 'fundacion');
    let mejor = null; for (const t of T.tiles) if (!mejor || t.h > mejor.h) mejor = t;
    const r0 = mejor.r + .5, c0 = mejor.c + .5, opc = [[1, 0, N - r0], [-1, 0, r0], [0, 1, N - c0], [0, -1, c0]].sort((a, b) => a[2] - b[2])[0], [dr, dc, largo] = opc;
    const pts = [], torres = []; for (let s = 0; s <= largo; s += .5) pts.push({ x: pos(T, r0 + dr * s, c0 + dc * s)[0], y: pos(T, r0 + dr * s, c0 + dc * s)[1] - 22, d: r0 + dr * s + c0 + dc * s });
    this.capa.lineStyle(1, 0x2A2118, .85); this.capa.beginPath(); pts.forEach((p, i) => i ? this.capa.lineTo(p.x, p.y) : this.capa.moveTo(p.x, p.y)); this.capa.strokePath();
    for (let s = 0; s <= largo; s += 3) { const p = pos(T, r0 + dr * s, c0 + dc * s); this.objetos.push(this.scene.add.image(p[0], p[1] + 2, 'torre').setScale(.9 / E).setOrigin(.5, 1).setDepth(r0 + dr * s + c0 + dc * s + .1)); }
    this.linea = pts; this.largoCable = largo * 2;
    for (let k = 0; k < 2; k++) { const img = this.scene.add.image(0, 0, 'cabina').setScale(.9 / E).setOrigin(.5, .1); this.cabinas.push({ img, i: k ? this.largoCable : 0, dir: k ? -1 : 1 }); this.objetos.push(img); }
  }
  update(dt) {
    if (reducirMovimiento()) { this.camiones.forEach(c => c.img.setVisible(false)); return; }
    const R = this.ruta, T = this.scene.T;
    for (const c of this.camiones) {
      if (c.espera > 0) { c.espera -= dt; c.img.setVisible(false); continue; }
      c.s += c.dir * c.v * dt;
      if (c.s >= R.largo + .5) { c.dir = -1; c.espera = 8 + Math.random() * 14; c.s = R.largo; }
      else if (c.s <= .5) { c.dir = 1; c.espera = 6 + Math.random() * 12; c.s = .5; }
      const r = R.r0 + R.dr * c.s, cc = R.c0 + R.dc * c.s, p = pos(T, r, cc), q = pos(T, r + R.dr * .3, cc + R.dc * .3), ang = Math.atan2(q[1] - p[1], q[0] - p[0]);
      const hacia = (q[0] - p[0]) * c.dir >= 0; // cara a la derecha de la pantalla si avanza hacia la derecha
      c.img.setVisible(c.s < R.largo - .3 && c.s > .6).setPosition(p[0], p[1] + 1).setDepth(r + cc + .08).setFlipX(!hacia).setRotation(Math.atan(Math.tan(ang)));
    }
    for (const b of this.cabinas) {
      b.i += b.dir * 5 * dt; if (b.i > this.largoCable) b.dir = -1; else if (b.i < 0) b.dir = 1;
      const f = Math.min(this.linea.length - 1, Math.max(0, b.i)), a = this.linea[Math.floor(f)], z = this.linea[Math.min(this.linea.length - 1, Math.floor(f) + 1)], t = f - Math.floor(f);
      b.img.setPosition(a.x + (z.x - a.x) * t, a.y + (z.y - a.y) * t).setDepth(a.d + .2);
    }
  }
}
