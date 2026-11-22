// Efectos del mapa (de la versión 9): números que flotan al cerrar el año, huellas visibles de los
// dilemas (crecida, sequía, plaga, río envenenado, multitud, fiesta, humo) y tintes del régimen y del esmog.
import { TAM_GENTE } from '../arte/gente.js';
import { ES_CELULAR } from '../arte/fresco.js';
import { C, nearRiver, clamp, lluvias, movilizados, nivelVolcan } from '../core/index.js';
import { P } from '../arte/iso.js';
import { DPR, reducirMovimiento } from './pantalla.js';

const TINTE = { tirania: [0x464650, .12], monarquia: [0x6E4696, .05], oligarquia: [0x785A14, .06], demagogia: [0xD26E28, .06], aristocracia: [0x285A46, .04] };

// Junta varias capas de color (una encima de otra) en una sola: mismo resultado, una sola pasada por la pantalla.
export function mezclar(capas) {
  let r = 0, g = 0, b = 0, A = 0;
  for (const c of capas) {
    if (!c || c[1] <= 0) continue;
    const a = c[1], cr = (c[0] >> 16) & 255, cg = (c[0] >> 8) & 255, cb = c[0] & 255;
    r = cr * a + r * (1 - a); g = cg * a + g * (1 - a); b = cb * a + b * (1 - a); A = a + A * (1 - a);
  }
  if (A <= 0) return [0, 0];
  return [(Math.round(r / A) << 16) | (Math.round(g / A) << 8) | Math.round(b / A), A];
}

export class Efectos {
  constructor(scene) {
    this.scene = scene;
    this.capa = scene.add.graphics().setDepth(-700);      // sobre el terreno, bajo las figuras
    this.encima = scene.add.container(0, 0).setDepth(30000); // multitudes y banderines
    this.velo = scene.add.rectangle(0, 0, 1, 1, 0, 0).setOrigin(0).setDepth(39990).setVisible(false); // todos los tintes en una sola capa (rendimiento)
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
    const vk = S.lahar !== undefined && S.year - S.lahar <= 1 ? 'lahar' : fen === 'nina' ? 'flood' : fen === 'nino' ? 'drought' : (S.vis && S.vis.k) || (movilizados(S).length ? 'crowd' : null);
    if (vk === this.visto && this._reg === S.reg) return;
    this.visto = vk; this._reg = S.reg;
    g.clear(); this.encima.removeAll(true); this.lluvia = [];
    const rombo = (i, s = .9) => { const t = T.tiles[i], m = (1 - s) / 2; return [P(t.r + m, t.c + m, t.h00), P(t.r + m, t.c + 1 - m, t.h01), P(t.r + 1 - m, t.c + 1 - m, t.h11), P(t.r + 1 - m, t.c + m, t.h10)].map(p => ({ x: p[0], y: p[1] })); };
    // Fase 4: el lahar deja lodo gris a lo largo del río y sus orillas.
    if (vk === 'lahar') { g.fillStyle(0x8A7A66, .55); S.map.forEach((x, i) => { if (x.t === 'rio' || nearRiver(S, i)) g.fillPoints(rombo(i, x.t === 'rio' ? 1 : .95), true); }); }
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
        const H = this.scene.pob.H, fk = `${tipos[k % 5]}_${k % 3}_${k % 2}_0`, m = H.marcos[fk], img = this.scene.add.image(x, y, 'personas', fk).setScale(TAM_GENTE / H.escala).setOrigin(m.ax / m.w, m.ay / m.h); // fase 9: a la escala real de la hoja
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
    // Fase 4: fumarola del volcán (la cima más alta) según el nivel de alerta.
    const nv = nivelVolcan(S);
    if (nv > 0) {
      let cima = 0; T.tiles.forEach((t, i) => { if (t.h > T.tiles[cima].h) cima = i; });
      const t = T.tiles[cima], p = P(t.r + .5, t.c + .5, t.h);
      this.humos.push(this.scene.add.particles(p[0], p[1] - 6, 'edificios', {
        frame: 'humo', lifespan: 6000 + nv * 800, speedX: { min: 6, max: 16 }, speedY: { min: -9 - nv * 2, max: -5 }, scale: { start: .25 + nv * .08, end: 1.1 + nv * .3 },
        alpha: { start: .22 + nv * .06, end: 0 }, tint: nv >= 3 ? 0x8A827A : 0xB8B2AA, frequency: 900 - nv * 150, quantity: 1
      }).setDepth(t.r + t.c + 5));
    }
    const anios = C.CLIMA.suelo.incendio.anios;
    // Fase 4: humo oscuro sobre las obras golpeadas por un atentado o un incendio (ese año y el siguiente).
    S.map.forEach((x, i) => {
      if (x.sin === undefined || S.year - x.sin > 1 || !x.b || this.humos.length >= 6) return;
      const t = T.tiles[i], p = P(t.r + .5, t.c + .5, t.h);
      this.humos.push(this.scene.add.particles(p[0], p[1] - 14, 'edificios', {
        frame: 'humo', lifespan: 3800, speedX: { min: 1, max: 6 }, speedY: { min: -12, max: -7 }, scale: { start: .2, end: .7 },
        alpha: { start: .5, end: 0 }, tint: 0x3A3532, frequency: 420, quantity: 1
      }).setDepth(t.r + t.c + 3));
    });
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
      // Fase visual, animación: lluvia en dos capas (gotas lejanas cortas y tenues, cercanas largas y claras),
      // salpicaduras en el suelo y el cielo encapotado mientras llueve; con la sequía, polvo que corre con el viento.
      const n = (this.inundacion ? 1.5 : 1) * (ES_CELULAR ? 70 : 150);
      if (quiere && !this.lluvia.length) this.lluvia = Array.from({ length: Math.round(n) }, (_, k) => ({ x: Math.random(), y: Math.random(), v: .7 + Math.random() * .5, cerca: k % 3 === 0 }));
      if (!quiere && this.lluvia.length) this.lluvia = [];
      const polvo = vk === 'drought' || (L && temp === 'seca' && L.cosecha < 1);
      if (polvo && !this.polvo) this.polvo = Array.from({ length: ES_CELULAR ? 24 : 40 }, () => ({ x: Math.random(), y: Math.random(), v: .03 + Math.random() * .05, r: 3 + Math.random() * 7, f: Math.random() * 6 }));
      if (!polvo) this.polvo = null;
    }
    const esc = this.scene.escala;
    const nubl = this.lluvia.length ? Math.min(1, (this.nubl || 0) + dt * 1.2) : Math.max(0, (this.nubl || 0) - dt * .6); this.nubl = nubl;
    const activo = nubl > 0 || this.lluvia.length || this.polvo;
    // Solo se crean y se dibujan mientras llueve o hay polvo (rendimiento: una capa vacía también cuesta).
    if (activo && !this.gl) { this.gl = this.scene.add.graphics().setDepth(39995); this.salpicas = []; }
    if (this.gl) {
      this.gl.setVisible(!!activo); if (this.gl.commandBuffer.length) this.gl.clear();
    }
    const g = this.gl;
    if (this.lluvia.length) {
      for (const r of this.lluvia) {
        const antes = r.y; r.y = (r.y + dt * r.v * (r.cerca ? 1.3 : .8)) % 1;
        if (r.y < antes && r.cerca && this.salpicas.length < (ES_CELULAR ? 16 : 36)) this.salpicas.push({ x: v.x + Math.random() * v.w, y: v.y + (.2 + Math.random() * .8) * v.h, t: 0 });
        const x = v.x + r.x * v.w, y = v.y + r.y * v.h, l = (r.cerca ? 17 : 9) / esc;
        g.lineStyle((r.cerca ? 1.4 : .9) / esc, r.cerca ? 0xE8F0F4 : 0xB8C8D6, r.cerca ? .7 : .45); g.lineBetween(x, y, x - l * .28, y + l);
      }
      for (let k = this.salpicas.length - 1; k >= 0; k--) { const sp = this.salpicas[k]; sp.t += dt; if (sp.t > .35) { this.salpicas.splice(k, 1); continue; } const f = sp.t / .35; const a = (2 + f * 5) / esc; g.lineStyle(.8 / esc, 0xDCE8F0, .5 * (1 - f)); g.lineBetween(sp.x - a, sp.y - a * .4, sp.x - a * .3, sp.y); g.lineBetween(sp.x + a, sp.y - a * .4, sp.x + a * .3, sp.y); } // salpicadura: dos chispas que se abren
    }
    if (this.polvo) {
      const t = this.scene.time.now / 1000;
      for (const d of this.polvo) { d.x = (d.x + dt * d.v) % 1.1; const x = v.x + (d.x - .05) * v.w, y = v.y + d.y * v.h + Math.sin(t * .7 + d.f) * 6 / esc; g.fillStyle(0xC9A56C, .1); g.fillEllipse(x, y, d.r * 3 / esc, d.r / esc); }
    }
    const tinte = TINTE[S.reg];
    let smog = clamp((45 - S.env) / 45, 0, 1) * .28; if (vk === 'smog') smog += .2;
    const seca = L && temp === 'seca' ? (L.cosecha < 1 ? .09 : .04) : 0;
    const capas = [nubl > 0 ? [0x3E4E5E, .3 * nubl] : null, tinte ? [tinte[0], tinte[1]] : null, smog > 0 ? [0x786950, smog] : null, vk === 'drought' ? [0xE1AA3C, .16] : null, seca ? [0xE6B45A, seca] : null];
    const [col, a] = mezclar(capas);
    this.velo.setVisible(a > .003); if (a > .003) this.velo.setPosition(v.x, v.y).setScale(v.w, v.h).setFillStyle(col, a);
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
