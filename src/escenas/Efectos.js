// Efectos del mapa (de la versión 9): números que flotan al cerrar el año, huellas visibles de los
// dilemas (crecida, sequía, plaga, río envenenado, multitud, fiesta, humo) y tintes del régimen y del esmog.
import { C, nearRiver, clamp, lluvias, movilizados } from '../core/index.js';
import { P } from '../arte/iso.js';
import { DPR, reducirMovimiento } from './pantalla.js';

const TINTE = { tirania: [0x464650, .12], monarquia: [0x6E4696, .05], oligarquia: [0x785A14, .06], demagogia: [0xD26E28, .06], aristocracia: [0x285A46, .04] };

export class Efectos {
  constructor(scene) {
    this.scene = scene;
    this.capa = scene.add.graphics().setDepth(-700);      // sobre el terreno, bajo las figuras
    this.encima = scene.add.container(0, 0).setDepth(30000); // multitudes y banderines
    this.velos = [0, 0, 0, 0].map(() => scene.add.rectangle(0, 0, 1, 1, 0, 0).setOrigin(0).setDepth(39990).setVisible(false));
    this.textos = [];
    this.lluvia = [];
    this.visto = null;
  }

  // Vista actual en el mundo (la cámara hace zoom desde la esquina).
  vista() { const c = this.scene.cameras.main; return { x: c.scrollX, y: c.scrollY, w: c.width / c.zoom, h: c.height / c.zoom }; }
  centroCasilla(i) { const T = this.scene.T, t = T.tiles[i]; return P(t.r + .5, t.c + .5, t.h); }
  // Casilla donde se reúne la gente: sede, mercado o una casa.
  centroDelPueblo() {
    const S = this.scene.S;
    for (const k of ['agora', 'mercado', 'casa']) { const i = S.map.findIndex(x => x.b === k); if (i >= 0) return i; }
    return -1;
  }

  // Redibuja las huellas del dilema vigente (S.vis) y los tintes.
  actualizar() {
    const { S, T } = this.scene, g = this.capa, fen = S.clima && S.clima.fenomeno;
    // Fase 1: La Niña inunda las orillas; El Niño deja la luz de sequía.
    // Fase 3: si un movimiento social está movilizado, hay una multitud con pancartas en la plaza.
    const vk = fen === 'nina' ? 'flood' : fen === 'nino' ? 'drought' : (S.vis && S.vis.k) || (movilizados(S).length ? 'crowd' : null);
    if (vk === this.visto && this._reg === S.reg) return;
    this.visto = vk; this._reg = S.reg;
    g.clear(); this.encima.removeAll(true); this.lluvia = [];
    const rombo = (i, s = .9) => { const t = T.tiles[i], m = (1 - s) / 2; return [P(t.r + m, t.c + m, t.h00), P(t.r + m, t.c + 1 - m, t.h01), P(t.r + 1 - m, t.c + 1 - m, t.h11), P(t.r + 1 - m, t.c + m, t.h10)].map(p => ({ x: p[0], y: p[1] })); };
    if (vk === 'flood') { g.fillStyle(0x5FA0C8, .38); S.map.forEach((x, i) => { if (x.t !== 'rio' && nearRiver(S, i)) g.fillPoints(rombo(i), true); }); }
    if (vk === 'poison') { g.fillStyle(0x78823C, .5); S.map.forEach((x, i) => { if (x.t === 'rio') g.fillPoints(rombo(i, .98), true); }); }
    if (vk === 'pests') {
      g.fillStyle(0x3A2A1A, .9);
      S.map.forEach((x, i) => { if (x.b === 'cultivo' || x.b === 'cafetal') { const [cx, cy] = this.centroCasilla(i); for (let k = 0; k < 16; k++) g.fillEllipse(cx + ((k * 37) % 40) - 20, cy + ((k * 13) % 16) - 8, 2.6, 1.6); } });
    }
    const hub = this.centroDelPueblo();
    if (hub >= 0 && (vk === 'crowd' || vk === 'festival')) {
      const [hx, hy] = this.centroCasilla(hub), tipos = ['campesino', 'campesina', 'artesano', 'elite', 'nino'];
      for (let k = 0; k < 16; k++) {
        const x = hx + ((k * 29) % 46) - 23, y = hy + 22 + ((k * 7) % 12);
        const img = this.scene.add.image(x, y, 'personas', `${tipos[k % 5]}_${k % 3}_${k % 2}_0`).setScale(.62 / 4).setOrigin(.5, 29 / 32);
        if (!reducirMovimiento() && vk === 'crowd') this.scene.tweens.add({ targets: img, y: y - 1.6, duration: 260 + k * 17, yoyo: true, repeat: -1 });
        this.encima.add(img);
      }
      const b = this.scene.add.graphics();
      if (vk === 'festival') {
        const cols = [0xC0602A, 0xE7C76B, 0x2D6E5E, 0xC4513B, 0xF4ECDB];
        for (const [a, c] of [[[hx - 42, hy - 16], [hx + 42, hy - 10]], [[hx - 30, hy + 4], [hx + 46, hy + 8]]]) {
          b.lineStyle(.7, 0x6B4F3A, 1).beginPath().moveTo(a[0], a[1]);
          for (let k = 1; k <= 12; k++) { const t = k / 12; b.lineTo(a[0] + (c[0] - a[0]) * t, a[1] + (c[1] - a[1]) * t + Math.sin(t * Math.PI) * 6); }
          b.strokePath();
          for (let k = 1; k < 12; k++) { const t = k / 12, x = a[0] + (c[0] - a[0]) * t, y = a[1] + (c[1] - a[1]) * t + Math.sin(t * Math.PI) * 6; b.fillStyle(cols[k % 5], 1).fillTriangle(x - 2, y, x + 2, y, x, y + 4); }
        }
      } else for (let k = 0; k < 3; k++) { const x = hx - 18 + k * 16, y = hy + 2; b.fillStyle(0xEFE3C2, 1).fillRect(x, y - 12, 10, 6); b.fillStyle(0x6B4F3A, 1).fillRect(x + 4.5, y - 6, 1, 7); }
      this.encima.add(b);
    }
    this.inundacion = vk === 'flood';
  }

  // Fase 1: humo sobre el bosque recién quemado (el primer año de cenizas).
  humoIncendio() {
    const { S, T } = this.scene;
    (this.humos || []).forEach(h => h.destroy()); this.humos = [];
    if (!S.clima || reducirMovimiento()) return;
    const anios = C.CLIMA.suelo.incendio.anios;
    S.map.forEach((x, i) => {
      if (!(x.q >= anios) || this.humos.length >= 6 || i % 2) return;
      const t = T.tiles[i], p = P(t.r + .5, t.c + .5, t.h);
      this.humos.push(this.scene.add.particles(p[0], p[1] - 4, 'edificios', {
        frame: 'humo', lifespan: 4200, speedX: { min: 2, max: 7 }, speedY: { min: -10, max: -6 }, scale: { start: .15, end: .6 },
        alpha: { start: .35, end: 0 }, tint: 0x6A625A, frequency: 650, quantity: 1
      }).setDepth(t.r + t.c + 2));
    });
  }

  // Cada cuadro: lluvia, tintes del régimen, esmog y sequía.
  update(dt) {
    const S = this.scene.S, v = this.vista(), vk = this.visto;
    // Aguaceros: siempre durante una crecida; en la temporada de lluvias, a ratos (más si el año es lluvioso).
    const L = lluvias(S), pob = this.scene.pob, temp = pob ? pob.temporada() : 'lluvias';
    if (!reducirMovimiento()) {
      this.cambioChubasco = (this.cambioChubasco || 0) - dt;
      if (this.cambioChubasco <= 0) {
        const p = !L ? 0 : temp === 'lluvias' ? (L.cosecha > 1 ? .7 : L.cosecha < 1 ? .2 : .45) : 0;
        this.chubasco = Math.random() < p; this.cambioChubasco = 25 + Math.random() * 30;
      }
      const quiere = this.inundacion || this.chubasco;
      if (quiere && !this.lluvia.length) this.lluvia = Array.from({ length: this.inundacion ? 70 : 45 }, () => ({ x: Math.random(), y: Math.random(), v: .6 + Math.random() * .4 }));
      if (!quiere && this.lluvia.length) this.lluvia = [];
    }
    if (this.lluvia.length) {
      if (!this.gl) this.gl = this.scene.add.graphics().setDepth(39980);
      const g = this.gl; g.clear().lineStyle(1 / this.scene.escala, 0x466E8C, .45);
      for (const r of this.lluvia) { r.y = (r.y + dt * r.v * .9) % 1; const x = v.x + r.x * v.w, y = v.y + r.y * v.h; g.lineBetween(x, y, x - 2 / this.scene.escala, y + 7 / this.scene.escala); }
    } else if (this.gl) this.gl.clear();
    const tinte = TINTE[S.reg];
    let smog = clamp((45 - S.env) / 45, 0, 1) * .28; if (vk === 'smog') smog += .2;
    const seca = L && temp === 'seca' ? (L.cosecha < 1 ? .09 : .04) : 0;
    const capas = [tinte ? [tinte[0], tinte[1]] : null, smog > 0 ? [0x786950, smog] : null, vk === 'drought' ? [0xE1AA3C, .16] : null, seca ? [0xE6B45A, seca] : null];
    capas.forEach((c, k) => {
      const r = this.velos[k];
      if (!c) { r.setVisible(false); return; }
      r.setVisible(true).setPosition(v.x, v.y).setScale(v.w, v.h).setFillStyle(c[0], c[1]);
    });
  }

  // Números que flotan al cerrar el año sobre las obras, las casas y el centro del pueblo.
  cierre(d) {
    const { S } = this.scene, sc = this.scene, t0 = 900;
    let n = 0;
    const flota = (x, y, txt, col, grande, retraso) => {
      const t = sc.add.text(x, y, txt, { fontFamily: 'Alegreya, Georgia, serif', fontStyle: '700', fontSize: grande ? '15px' : '11px', color: col, stroke: '#FFFAEB', strokeThickness: 3, resolution: Math.min(4, DPR * Math.max(1, sc.escala)) })
        .setOrigin(.5, 1).setDepth(45000).setAlpha(0);
      sc.tweens.add({ targets: t, alpha: 1, duration: 220, delay: retraso });
      sc.tweens.add({ targets: t, y: y - 26, duration: 1500, delay: retraso, ease: 'Sine.out' });
      sc.tweens.add({ targets: t, alpha: 0, duration: 700, delay: retraso + 1100, onComplete: () => t.destroy() });
    };
    const casas = [];
    S.map.forEach((x, i) => {
      if (!x.b) return;
      const [cx, cy] = this.centroCasilla(i), fee = C.B[x.b].fee;
      if (fee) flota(cx, cy - 22, '+' + Math.round(fee * S.price), '#9C7420', false, t0 + (n++ % 12) * 70);
      else if (x.b === 'cultivo' && d.df !== 0) flota(cx, cy - 12, d.hunger ? '−hambre' : '+cosecha', d.hunger ? '#B0402C' : '#3F7A3A', false, t0 + (n++ % 12) * 70);
      if (x.b === 'casa') casas.push([cx, cy]);
    });
    if (d.dp) casas.slice(0, Math.min(casas.length, Math.abs(d.dp))).forEach(([x, y]) => flota(x + 6, y - 30, (d.dp > 0 ? '+' : '−') + '1', '#2D5D72', false, t0 + (n++ % 12) * 70));
    const hub = this.centroDelPueblo();
    if (hub >= 0) { const [x, y] = this.centroCasilla(hub); flota(x, y - 48, `${d.dg >= 0 ? '+' : '−'}${Math.abs(Math.round(d.dg))} oro`, d.dg >= 0 ? '#8C6A1E' : '#B0402C', true, t0 + 300); }
    if (d.bad && !reducirMovimiento()) sc.time.delayedCall(t0, () => sc.cameras.main.shake(380, .004));
  }
}
