// La guerra en el mapa (fase 9): campamentos del vecino en el borde (carpas, bandera, fogata y soldados) cuando
// hay tropas o guerra, casillas ocupadas con su color y su bandera, y humo en el borde durante la guerra.
// Se rehace solo cuando cambia el estado de la frontera.
import { C, guerraActiva, casillasBorde, ocupadasPor } from '../core/index.js';
import { P } from '../arte/iso.js';
import { lienzo } from '../arte/acuarela.js';
import { FR, mulberry, pintar, shade } from '../arte/fresco.js';
import { reducirMovimiento } from './pantalla.js';

const COLOR = { lagunilla: FR.azul, sanlorenzo: FR.ocre, altamira: FR.verdeOsc };
const hex = c => parseInt(c.slice(1), 16);

export class Frontera {
  constructor(scene) {
    this.scene = scene;
    this.objetos = [];
    this.capa = scene.add.graphics().setDepth(-690);
    this.firma = '';
    this.texturas();
    this.actualizar();
  }
  // Carpa y bandera de cada vecino, pintadas al fresco una vez.
  texturas() {
    const tx = this.scene.textures;
    for (const [id, col] of Object.entries(COLOR)) {
      if (!tx.exists('carpa-' + id)) {
        const E = 3, c = lienzo(30 * E, 24 * E), g = c.getContext('2d'), R = mulberry(id.length * 7); g.scale(E, E); g.translate(15, 20);
        g.globalAlpha = .25; g.fillStyle = '#3A2A1C'; g.beginPath(); g.ellipse(2, 1, 13, 3, 0, 0, 7); g.fill(); g.globalAlpha = 1;
        pintar(g, [[-12, 0], [0, -14], [2, 3]], shade(col, -.15), R, { n: 1, bw: .5 });
        pintar(g, [[0, -14], [12, -2], [2, 3]], col, R, { n: 1, bw: .5 });
        pintar(g, [[-2, 1], [0, -6], [2, 2]], FR.carbon, R, { n: 0, bw: .3 });
        tx.addCanvas('carpa-' + id, c);
      }
      if (!tx.exists('bandera-' + id)) {
        const E = 3, c = lienzo(16 * E, 30 * E), g = c.getContext('2d'); g.scale(E, E);
        g.strokeStyle = FR.siena; g.lineWidth = 1.2; g.beginPath(); g.moveTo(3, 2); g.lineTo(3, 29); g.stroke();
        g.fillStyle = col; g.beginPath(); g.moveTo(3.5, 3); g.quadraticCurveTo(9, 1, 15, 4); g.lineTo(15, 12); g.quadraticCurveTo(9, 9, 3.5, 12); g.fill();
        g.fillStyle = FR.cal; g.fillRect(6, 6, 6, 2);
        tx.addCanvas('bandera-' + id, c);
      }
    }
  }
  punto(r, c) { const T = this.scene.T, N = T.N; return P(r, c, T.hf(Math.max(0, Math.min(N - .01, r)), Math.max(0, Math.min(N - .01, c)))); }
  actualizar() {
    const { S } = this.scene;
    if (!guerraActiva(S) || !S.vecinos) { if (this.firma) this.limpiar(); this.firma = ''; return; }
    const W = S.guerra && S.guerra.activa;
    const estado = Object.entries(S.vecinos).map(([id, v]) => `${id}:${v.tropas ? 1 : 0}:${W && W.id === id ? 1 : 0}:${ocupadasPor(S, id).join('.')}`).join('|');
    if (estado === this.firma) return;
    this.firma = estado;
    this.limpiar();
    const sc = this.scene, N = sc.T.N, quieto = reducirMovimiento();
    for (const [id, v] of Object.entries(S.vecinos)) {
      const guerra = W && W.id === id, oc = ocupadasPor(S, id);
      // Casillas ocupadas: velo con el color del vecino y su bandera.
      for (const i of oc) {
        const t = sc.T.tiles[i], q = [P(t.r, t.c, t.h00), P(t.r, t.c + 1, t.h01), P(t.r + 1, t.c + 1, t.h11), P(t.r + 1, t.c, t.h10)].map(p => ({ x: p[0], y: p[1] }));
        this.capa.fillStyle(hex(COLOR[id]), .28).fillPoints(q, true).lineStyle(1.5, hex(COLOR[id]), .8).strokePoints(q, true);
        const b = this.punto(t.r + .5, t.c + .5);
        this.objetos.push(sc.add.image(b[0], b[1], 'bandera-' + id).setOrigin(.2, 1).setScale(.34).setDepth(t.r + t.c + 1.2));
      }
      if (!v.tropas && !guerra) continue;
      // Campamento en el borde: dos carpas, bandera, fogata y tres soldados de verde oliva.
      const libres = casillasBorde(S, id).filter(i => !S.map[i].b && !S.map[i].oc && S.map[i].t !== 'montana').slice(0, 2);
      libres.forEach((i, k) => {
        const r = Math.floor(i / N) + .5, c = i % N + .5;
        for (const [dr, dc] of [[-.2, -.15], [.18, .2]]) { const q = this.punto(r + dr, c + dc); this.objetos.push(sc.add.image(q[0], q[1], 'carpa-' + id).setOrigin(.5, 20 / 24).setScale(.36).setDepth(r + dr + c + dc + .5)); }
        if (k === 0) {
          const q = this.punto(r + .3, c - .3);
          this.objetos.push(sc.add.image(q[0], q[1], 'bandera-' + id).setOrigin(.2, 1).setScale(.38).setDepth(r + c + .9));
          const f = this.punto(r, c + .05);
          const luz = sc.add.circle(f[0], f[1] - 1.5, 2.6, 0xF2A04A, .9).setDepth(r + c + .6).setBlendMode('ADD');
          if (!quieto) sc.tweens.add({ targets: luz, alpha: .45, scale: 1.3, duration: 260, yoyo: true, repeat: -1 });
          this.objetos.push(luz);
          if (!quieto) this.objetos.push(sc.add.particles(f[0], f[1] - 3, 'edificios', { frame: 'humo', lifespan: 1800, speedY: { min: -10, max: -5 }, scale: { start: .08, end: .3 }, alpha: { start: .4, end: 0 }, frequency: 420 }).setDepth(r + c + .7));
          const H = sc.pob.H;
          for (let s = 0; s < 3; s++) {
            const g = this.punto(r + .3 - s * .14, c + .35 + s * .08), key = `artesano_${s % 3}_${s % 2}_0`, m = H.marcos[key];
            this.objetos.push(sc.add.image(g[0], g[1], 'personas', key).setOrigin(m.ax / m.w, m.ay / m.h).setScale(.62 / H.escala).setTint(0x8C8F6A).setDepth(r + c + .8 + s * .01));
          }
        }
      });
      // Humo de la guerra cerca del borde.
      if (guerra && !quieto) {
        const L = casillasBorde(S, id);
        for (const i of [L[2], L[5]].filter(x => x !== undefined)) { const q = this.punto(Math.floor(i / N) + .5, i % N + .5); this.objetos.push(sc.add.particles(q[0], q[1], 'edificios', { frame: 'humo', lifespan: 3200, speedY: { min: -22, max: -10 }, speedX: { min: 2, max: 6 }, scale: { start: .25, end: 1.1 }, alpha: { start: .5, end: 0 }, tint: 0x3A322C, frequency: 260 }).setDepth(40000 - 3)); }
      }
    }
  }
  limpiar() { this.capa.clear(); this.objetos.forEach(o => o.destroy()); this.objetos = []; }
}
