// Navegación por el río (fase 16, punto 5): champanes de palanca en los primeros años y vapores con rueda después, que
// recorren el río de borde a borde. Hay más barcos cuanto más puertos hayas construido. Con «reducir movimiento» no navegan.
import { P, alturaEn } from '../arte/iso.js';
import { geoRio } from '../arte/terreno.js';
import { lienzo } from '../arte/acuarela.js';
import { epocaHistorica } from '../core/index.js';
import { reducirMovimiento } from './pantalla.js';

const E = 4;
// Paso 3 de la fase visual: barcos redibujados con el pincel nuevo (volumen, luz arriba a la izquierda, sombra y
// reflejo en el agua), de tamaño acorde a las casas y sin inclinarse con la curva del río (el río va casi
// horizontal en la pantalla; el barco solo se voltea según hacia dónde navega).
const sh = (h, f) => { const v = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)).map(x => Math.round(f < 0 ? x * (1 + f) : x + (255 - x) * f)); return '#' + v.map(x => Math.max(0, Math.min(255, x)).toString(16).padStart(2, '0')).join(''); };
const pol = (g, pts, col) => { g.fillStyle = col; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fill(); };
function persona(g, x, y, ropa, sombrero = '#D9C48E') {
  pol(g, [[x - 1.1, y], [x - .9, y - 4.2], [x + .9, y - 4.2], [x + 1.1, y]], ropa); pol(g, [[x + .2, y], [x + .3, y - 4.2], [x + .9, y - 4.2], [x + 1.1, y]], sh(ropa, -.25));
  g.fillStyle = '#B07A52'; g.beginPath(); g.arc(x, y - 5.1, .95, 0, 7); g.fill();
  g.fillStyle = sombrero; g.beginPath(); g.ellipse(x, y - 5.8, 1.8, .55, 0, 0, 7); g.fill(); g.fillRect(x - .8, y - 6.8, 1.6, 1);
}
function hornear(tx) {
  if (!tx.exists('champan2')) { // champán del Magdalena: canoa larga, toldo de palma en arco y dos bogas con palanca
    const W = 50, H = 26, c = lienzo(W * E, H * E), g = c.getContext('2d'); g.scale(E, E);
    g.globalAlpha = .3; g.fillStyle = '#16303A'; g.beginPath(); g.ellipse(27, 21.5, 22, 2.6, 0, 0, 7); g.fill(); g.globalAlpha = 1; // sombra en el agua
    pol(g, [[3, 17], [8, 21], [42, 21], [47, 16.5], [42, 18.6], [8, 18.8]], '#5A3C24');          // casco, costado en sombra
    pol(g, [[3, 17], [8, 18.8], [42, 18.6], [47, 16.5], [41, 16.2], [9, 16.4]], '#8A6440');      // borda iluminada
    g.strokeStyle = '#3E2A18'; g.lineWidth = .4; g.beginPath(); g.moveTo(8, 20); g.lineTo(42, 19.8); g.stroke();
    // toldo de palma: arco con su lado de luz y de sombra y hojas secas
    pol(g, [[13, 16.6], [13, 11], [17, 7.4], [31, 7.2], [35, 10.6], [35, 16.4]], '#B48E48');
    pol(g, [[13, 16.6], [13, 11], [17, 7.4], [24, 7.3], [22, 11], [22, 16.5]], '#D7B566');
    g.strokeStyle = '#8C6A34'; g.lineWidth = .35; for (let k = 0; k < 9; k++) { g.beginPath(); g.moveTo(14 + k * 2.4, 8 + Math.abs(k - 4) * .2); g.lineTo(14 + k * 2.4, 16.2); g.stroke(); }
    g.fillStyle = '#3A2A1A'; g.fillRect(13, 13, 22, 3.4); // la sombra bajo el toldo, con carga
    g.fillStyle = '#C9B07A'; g.fillRect(15, 14, 4, 2.2); g.fillRect(27, 14, 5, 2.2);
    persona(g, 40, 17.3, '#E8E0CC'); persona(g, 7.5, 17.6, '#8E3B2E');
    g.strokeStyle = '#5E4528'; g.lineWidth = .7; g.beginPath(); g.moveTo(43.5, 6); g.lineTo(46.5, 22.5); g.moveTo(4.5, 7); g.lineTo(2, 22.5); g.stroke(); // palancas
    tx.addCanvas('champan2', c);
  }
  if (!tx.exists('vapor2')) { // vapor de rueda del Magdalena: casco blanco, dos cubiertas, chimenea y rueda en la popa
    const W = 62, H = 38, c = lienzo(W * E, H * E), g = c.getContext('2d'); g.scale(E, E);
    g.globalAlpha = .3; g.fillStyle = '#16303A'; g.beginPath(); g.ellipse(32, 33, 28, 3, 0, 0, 7); g.fill(); g.globalAlpha = 1;
    pol(g, [[6, 27], [10, 32], [54, 32], [59, 26], [54, 29], [10, 29.5]], '#6E6A62');   // casco en sombra
    pol(g, [[6, 27], [10, 29.5], [54, 29], [59, 26], [10, 26.2]], '#E6E0D0');           // cubierta baja
    g.fillStyle = '#A8342A'; g.fillRect(10, 29.3, 44, .9);                               // franja roja
    pol(g, [[14, 26.3], [14, 20], [50, 20], [50, 26]], '#F2EEE2'); pol(g, [[38, 26.1], [38, 20], [50, 20], [50, 26]], '#D9D2C0'); // primer piso, con su lado en sombra
    g.fillStyle = '#5E7C8E'; for (let k = 0; k < 6; k++) g.fillRect(16.5 + k * 5.3, 21.6, 2.6, 2.6);
    pol(g, [[12, 20.2], [16, 18.4], [52, 18.4], [52, 20.2]], '#B9A57A');                 // techo del primer piso
    pol(g, [[20, 18.5], [20, 14], [42, 14], [42, 18.5]], '#F4F0E6'); pol(g, [[34, 18.5], [34, 14], [42, 14], [42, 18.5]], '#DCD4C2');
    g.fillStyle = '#5E7C8E'; for (let k = 0; k < 3; k++) g.fillRect(22.5 + k * 4.4, 15.2, 2.2, 2);
    pol(g, [[18.5, 14.2], [21, 12.8], [44, 12.8], [44, 14.2]], '#A89268');
    pol(g, [[36, 13], [36, 3], [39.5, 3], [39.5, 13]], '#2E2620'); pol(g, [[38, 13], [38, 3], [39.5, 3], [39.5, 13]], '#1C1612'); // chimenea
    g.fillStyle = '#A8342A'; g.fillRect(35.6, 2.2, 4.3, 1.6);
    // rueda de paletas en la popa (a la izquierda), media hundida
    g.fillStyle = '#7A2C22'; g.beginPath(); g.arc(8, 27, 6.5, Math.PI, 0); g.closePath(); g.fill();
    g.strokeStyle = '#4A1E18'; g.lineWidth = .55; for (let k = 0; k <= 6; k++) { const a = Math.PI + k / 6 * Math.PI; g.beginPath(); g.moveTo(8, 27); g.lineTo(8 + Math.cos(a) * 6.5, 27 + Math.sin(a) * 6.5); g.stroke(); }
    g.fillStyle = '#C24A3A'; g.beginPath(); g.arc(8, 27, 6.5, Math.PI, Math.PI * 1.5); g.lineTo(8, 27); g.closePath(); g.globalAlpha = .4; g.fill(); g.globalAlpha = 1;
    persona(g, 47, 19.4, '#2E3440', '#2E3440');
    tx.addCanvas('vapor2', c);
  }
}

export class Navegacion {
  constructor(scene) { this.scene = scene; hornear(scene.textures); this.barcos = []; this.firma = ''; this.linea = []; this.estela = scene.add.graphics(); this.actualizar(); }
  // Línea del río (paso 3 de la fase visual): el mismo cauce natural que se pinta, un poco corrido hacia el lado
  // hondo de cada curva (por donde navegan los barcos), y solo dentro del mapa.
  trazar() {
    const { T } = this.scene, N = T.N, geo = geoRio(T);
    this.linea = geo.L.filter((o, i) => i % 3 === 0 && o.r > .3 && o.c > .3 && o.r < N - .3 && o.c < N - .3).map(o => { const d = o.k * .2, p = geo.pt(o, d); return { x: p[0], y: p[1] + 1, d: o.r + o.c }; });
    let s = 0; this.linea.forEach((q, i) => { if (i) s += Math.hypot(q.x - this.linea[i - 1].x, q.y - this.linea[i - 1].y); q.s = s; }); this.largo = s;
  }
  punto(s) {
    const L = this.linea; let i = 1; while (i < L.length - 1 && L[i].s < s) i++;
    const a = L[i - 1], b = L[i], t = b.s > a.s ? Math.min(1, Math.max(0, (s - a.s) / (b.s - a.s))) : 0;
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, ang: Math.atan2(b.y - a.y, b.x - a.x), d: a.d + (b.d - a.d) * t };
  }
  actualizar() {
    const { S } = this.scene, N = this.scene.T.N, rios = S.map.reduce((s, x, i) => s + (x.t === 'rio' ? i + 1 : 0), 0), puertos = S.map.filter(x => x.b === 'puerto' && !x.ob).length;
    const ep = epocaHistorica(S), tipo = !ep || ep === 'fundacion' ? 'champan2' : 'vapor2', n = Math.min(3, 1 + puertos);
    const firma = `${rios}|${tipo}|${n}`; if (firma === this.firma) return; this.firma = firma;
    this.barcos.forEach(b => b.img.destroy()); this.barcos = [];
    this.trazar(); if (this.linea.length < 4) return;
    for (let k = 0; k < n; k++) this.barcos.push({ img: this.scene.add.image(0, 0, tipo).setScale(1 / E).setOrigin(.5, .8).setVisible(false), s: this.largo * (k / n), dir: k % 2 ? -1 : 1, v: (tipo === 'vapor2' ? 26 : 16) + k * 3, tipo });
  }
  // Estela: dos ondas en V que se abren detrás del barco y se desvanecen, espuma en la proa y, en el vapor, la rueda
  // que bate el agua. Se dibuja bajo el barco (paso 3 de la fase visual).
  dibujarEstela(b, p) {
    const g = this.estela, ca = Math.cos(p.ang) * b.dir, sa = Math.sin(p.ang) * b.dir, nx = -sa * .5, ny = ca * .45; // atrás = -(ca, sa)
    const largo = b.tipo === 'vapor2' ? 30 : 20, popa = b.tipo === 'vapor2' ? 24 : 18;
    g.setDepth(p.d + .01);
    for (let k = 0; k < 6; k++) {
      const f = ((this.t * .6 + k / 6) % 1), d = popa + f * largo, ab = 1.5 + f * 7, al = .45 * (1 - f);
      const cx = p.x - ca * d, cy = p.y - sa * d * .5;
      g.lineStyle(.8, 0xF2F7F4, al);
      for (const lado of [-1, 1]) { const x = cx + nx * ab * lado, y = cy + ny * ab * lado; g.lineBetween(x - ca * 2, y - sa, x + ca * 1.5, y + sa * .75); }
    }
    g.fillStyle(0xF4F8F4, .5); g.fillEllipse(p.x + ca * (popa - 2), p.y + sa * (popa - 2) * .5, 4, 1.4); // espuma de proa
    if (b.tipo === 'vapor2') { g.fillStyle(0xF4F8F4, .35 + .2 * Math.sin(this.t * 9)); g.fillEllipse(p.x - ca * (popa - 1), p.y - sa * (popa - 1) * .5, 6, 2); }
  }
  update(dt) {
    this.estela.clear();
    if (!this.barcos.length || reducirMovimiento()) { this.barcos.forEach(b => b.img.setVisible(false)); return; }
    this.t = (this.t || 0) + dt;
    for (const b of this.barcos) {
      b.s += b.dir * b.v * dt;
      if (b.s > this.largo + 20) { b.dir = -1; } else if (b.s < -20) { b.dir = 1; }
      const s = Math.min(this.largo, Math.max(0, b.s)), p = this.punto(s), dentro = b.s > 4 && b.s < this.largo - 4;
      b.img.setVisible(dentro).setPosition(p.x, p.y).setDepth(p.d + .02).setFlipX(b.dir < 0);
      if (dentro) this.dibujarEstela(b, p);
    }
  }
}
