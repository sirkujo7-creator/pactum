// Navegación por el río (fase 16, punto 5): champanes de palanca en los primeros años y vapores con rueda después, que
// recorren el río de borde a borde. Hay más barcos cuanto más puertos hayas construido. Con «reducir movimiento» no navegan.
import { P, alturaEn } from '../arte/iso.js';
import { lienzo } from '../arte/acuarela.js';
import { epocaHistorica } from '../core/index.js';
import { reducirMovimiento } from './pantalla.js';

const E = 3;
function hornear(tx) {
  if (!tx.exists('champan')) { // canoa larga con techo de palma y un palanquero
    const W = 64, H = 30, c = lienzo(W * E, H * E), g = c.getContext('2d'); g.scale(E, E); g.strokeStyle = 'rgba(40,30,20,.6)'; g.lineWidth = .6;
    g.globalAlpha = .25; g.fillStyle = '#1F3A44'; g.beginPath(); g.ellipse(32, 24, 28, 3, 0, 0, 7); g.fill(); g.globalAlpha = 1;
    g.fillStyle = '#6B4A2B'; g.beginPath(); g.moveTo(4, 17); g.quadraticCurveTo(32, 25, 60, 15); g.lineTo(56, 21); g.quadraticCurveTo(32, 26, 8, 22); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = '#C9A44A'; g.beginPath(); g.moveTo(16, 17); g.quadraticCurveTo(30, 4, 46, 16); g.lineTo(16, 17); g.fill(); g.stroke();
    g.strokeStyle = '#4A3A24'; g.lineWidth = 1.1; g.beginPath(); g.moveTo(52, 6); g.lineTo(58, 22); g.stroke();
    g.fillStyle = '#3A2A24'; g.fillRect(50.5, 8, 2.6, 7); g.fillStyle = '#C98E62'; g.beginPath(); g.arc(51.8, 6.6, 1.6, 0, 7); g.fill();
    tx.addCanvas('champan', c);
  }
  if (!tx.exists('vapor')) { // vapor de rueda en la popa y chimenea
    const W = 72, H = 38, c = lienzo(W * E, H * E), g = c.getContext('2d'); g.scale(E, E); g.strokeStyle = 'rgba(40,30,20,.6)'; g.lineWidth = .6;
    g.globalAlpha = .25; g.fillStyle = '#1F3A44'; g.beginPath(); g.ellipse(36, 31, 32, 3, 0, 0, 7); g.fill(); g.globalAlpha = 1;
    g.fillStyle = '#E7DFC9'; g.beginPath(); g.moveTo(6, 22); g.lineTo(64, 22); g.lineTo(58, 30); g.lineTo(12, 30); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = '#B5392B'; g.fillRect(9, 26, 52, 1.8);
    g.fillStyle = '#F4F1E6'; g.fillRect(22, 13, 28, 9); g.strokeRect(22, 13, 28, 9);
    g.fillStyle = '#C9B98E'; g.fillRect(20, 11, 32, 2.4);
    g.fillStyle = '#6E8FA6'; for (let k = 0; k < 4; k++) g.fillRect(25 + k * 6, 16, 3.6, 3.6);
    g.fillStyle = '#2A2118'; g.fillRect(44, 3, 4, 9); g.fillStyle = '#B5392B'; g.fillRect(43.4, 2, 5.2, 2);
    g.fillStyle = '#8E3B2E'; g.beginPath(); g.arc(10, 24, 7, Math.PI, 0); g.lineTo(3, 24); g.fill(); g.stroke(); g.strokeStyle = '#4A3A24'; g.beginPath(); g.moveTo(5, 24); g.lineTo(15, 24); g.moveTo(10, 18); g.lineTo(10, 28); g.stroke();
    tx.addCanvas('vapor', c);
  }
}

export class Navegacion {
  constructor(scene) { this.scene = scene; hornear(scene.textures); this.barcos = []; this.firma = ''; this.linea = []; this.actualizar(); }
  // Línea del río: promedio de las casillas de agua por su posición horizontal en pantalla.
  trazar() {
    const { S, T } = this.scene, N = T.N, grupos = new Map();
    S.map.forEach((x, i) => { if (x.t !== 'rio') return; const r = Math.floor(i / N) + .5, c = i % N + .5, k = Math.round((c - r) * 1); const g = grupos.get(k) || grupos.set(k, []).get(k); g.push([r, c]); });
    this.linea = [...grupos.entries()].sort((a, b) => a[0] - b[0]).map(([, g]) => { const r = g.reduce((s, q) => s + q[0], 0) / g.length, c = g.reduce((s, q) => s + q[1], 0) / g.length; const p = P(r, c, alturaEn(T, r, c)); return { x: p[0], y: p[1] + 2, d: r + c }; });
    // tramos acumulados para avanzar a velocidad pareja
    let s = 0; this.linea.forEach((q, i) => { if (i) s += Math.hypot(q.x - this.linea[i - 1].x, q.y - this.linea[i - 1].y); q.s = s; }); this.largo = s;
  }
  punto(s) {
    const L = this.linea; let i = 1; while (i < L.length - 1 && L[i].s < s) i++;
    const a = L[i - 1], b = L[i], t = b.s > a.s ? Math.min(1, Math.max(0, (s - a.s) / (b.s - a.s))) : 0;
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, ang: Math.atan2(b.y - a.y, b.x - a.x), d: a.d + (b.d - a.d) * t };
  }
  actualizar() {
    const { S } = this.scene, N = this.scene.T.N, rios = S.map.reduce((s, x, i) => s + (x.t === 'rio' ? i + 1 : 0), 0), puertos = S.map.filter(x => x.b === 'puerto' && !x.ob).length;
    const ep = epocaHistorica(S), tipo = !ep || ep === 'fundacion' ? 'champan' : 'vapor', n = Math.min(3, 1 + puertos);
    const firma = `${rios}|${tipo}|${n}`; if (firma === this.firma) return; this.firma = firma;
    this.barcos.forEach(b => b.img.destroy()); this.barcos = [];
    this.trazar(); if (this.linea.length < 4) return;
    for (let k = 0; k < n; k++) this.barcos.push({ img: this.scene.add.image(0, 0, tipo).setScale(1 / E).setOrigin(.5, .8).setVisible(false), s: this.largo * (k / n), dir: k % 2 ? -1 : 1, v: (tipo === 'vapor' ? 30 : 20) + k * 3, tipo });
  }
  update(dt) {
    if (!this.barcos.length || reducirMovimiento()) { this.barcos.forEach(b => b.img.setVisible(false)); return; }
    for (const b of this.barcos) {
      b.s += b.dir * b.v * dt;
      if (b.s > this.largo + 20) { b.dir = -1; } else if (b.s < -20) { b.dir = 1; }
      const s = Math.min(this.largo, Math.max(0, b.s)), p = this.punto(s), dentro = b.s > 4 && b.s < this.largo - 4;
      b.img.setVisible(dentro).setPosition(p.x, p.y).setDepth(p.d + .02).setFlipX(b.dir < 0).setRotation(p.ang);
    }
  }
}
