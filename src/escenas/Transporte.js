// Transporte visible (fase 16, punto 5): una carretera de tierra desde la plaza hasta el borde del mapa con camiones que salen
// cargados y vuelven (desde La Violencia, y más cuanto más comercio hay), y el cable aéreo del café, con torres y cabinas, si lo
// construiste en el hito del cable. Con «reducir movimiento» solo quedan la carretera y las torres.
import { P, alturaEn } from '../arte/iso.js';
import { lienzo } from '../arte/acuarela.js';
import { epocaHistorica } from '../core/index.js';
import { reducirMovimiento } from './pantalla.js';

const E = 3;
function hornear(tx) {
  // Torre del cable aéreo: castillete de madera con sus patas abiertas, travesaños en cruz y la polea arriba.
  if (!tx.exists('torre')) {
    const W = 16, H = 40, c = lienzo(W * E, H * E), g = c.getContext('2d'); g.scale(E, E); g.lineCap = 'round';
    g.globalAlpha = .22; g.fillStyle = '#2A2118'; g.beginPath(); g.ellipse(10, 38.6, 6, 1.4, 0, 0, 7); g.fill(); g.globalAlpha = 1;
    g.strokeStyle = '#5A3E24'; g.lineWidth = 1.3; g.beginPath(); g.moveTo(2.4, 38); g.lineTo(7, 5); g.moveTo(13.6, 38); g.lineTo(9, 5); g.stroke(); // patas
    g.strokeStyle = '#7A5634'; g.lineWidth = .5; g.beginPath(); g.moveTo(3, 37) ; g.lineTo(7.4, 5.6); g.stroke(); // luz en la pata de la izquierda
    g.strokeStyle = '#4A3420'; g.lineWidth = .8; for (const [y0, y1] of [[34, 24], [24, 15], [15, 8]]) { const x = t => 2.4 + (7 - 2.4) * (38 - t) / 33, xr = t => 13.6 - (13.6 - 9) * (38 - t) / 33; g.beginPath(); g.moveTo(x(y0), y0); g.lineTo(xr(y1), y1); g.moveTo(xr(y0), y0); g.lineTo(x(y1), y1); g.moveTo(x(y1), y1); g.lineTo(xr(y1), y1); g.stroke(); } // travesaños en cruz
    g.fillStyle = '#6B4A2B'; g.fillRect(3.4, 3.4, 9.2, 2); g.fillStyle = '#3A3A3E'; for (const x of [4.6, 11.4]) { g.beginPath(); g.arc(x, 3.6, 1, 0, 7); g.fill(); } // cruceta con poleas
    tx.addCanvas('torre', c);
  }
  // Cabina del cable: vagoneta de tablas colgada de su gancho, con bultos de café.
  if (!tx.exists('cabina')) {
    const W = 16, H = 20, c = lienzo(W * E, H * E), g = c.getContext('2d'); g.scale(E, E); g.lineCap = 'round';
    g.strokeStyle = '#3A3A3E'; g.lineWidth = .7; g.beginPath(); g.moveTo(8, .5); g.lineTo(8, 5.6); g.stroke(); g.fillStyle = '#3A3A3E'; g.beginPath(); g.arc(8, 1.2, 1, 0, 7); g.fill(); // gancho y rueda
    g.fillStyle = '#9C6B3A'; g.beginPath(); g.moveTo(2.4, 6.4); g.lineTo(11.6, 6.4); g.lineTo(13.6, 8.4); g.lineTo(13.6, 15.4); g.lineTo(4.4, 15.4); g.lineTo(2.4, 13.4); g.closePath(); g.fill(); // caja
    g.fillStyle = '#7A5230'; g.beginPath(); g.moveTo(11.6, 6.4); g.lineTo(13.6, 8.4); g.lineTo(13.6, 15.4); g.lineTo(11.6, 13.4); g.closePath(); g.fill(); // costado en sombra
    g.strokeStyle = 'rgba(50,30,15,.6)'; g.lineWidth = .3; for (const y of [8.6, 10.8, 13]) { g.beginPath(); g.moveTo(2.4, y); g.lineTo(11.6, y); g.stroke(); }
    for (const [x, col] of [[5, '#C9B48A'], [8, '#BFA87C'], [10.6, '#C9B48A']]) { g.fillStyle = col; g.beginPath(); g.ellipse(x, 6.2, 1.6, 1.1, 0, 0, 7); g.fill(); } // bultos de café
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
    // (La carretera que se pintaba sola hasta el borde se quitó, pedido de Juan: lo que se ve informa. Los camiones y las
    // chivas ahora van por los caminos que construye el jugador: Trafico.js.)
    const camion = 0; void comercio; void ep;
    const cable = !!(S.decisiones && (S.decisiones.h_cable === 0 || S.decisiones.h_cable === 1));
    const cafe = S.map.map((x, i) => (x.b === 'cafetal' || (x.b === 'cultivo' && x.cv === 'cafe')) && !x.ob ? i : '').join('');
    const firma = `${pla}|${camion}|${cable}|${cafe}`; if (firma === this.firma) return; this.firma = firma;
    this.limpiar();
    if (cable) this.cable(N);
  }
  // Cable aéreo: saca el café de los cafetales (el más alto) hasta el borde más cercano, con torres y dos cabinas.
  cable(N) {
    const { T } = this.scene, S = this.scene.S, pla = S.map.findIndex(x => x.b === 'fundacion');
    let mejor = null; S.map.forEach((x, i) => { if ((x.b === 'cafetal' || (x.b === 'cultivo' && x.cv === 'cafe')) && !x.ob && (!mejor || T.tiles[i].h > mejor.h)) mejor = T.tiles[i]; });
    if (!mejor) return; // sin cafetales no hay café que sacar
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
export { hornear as hornearTransporte }; // para la página de prueba
