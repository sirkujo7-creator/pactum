// Vida del paisaje: vacas que pastan, garzas que caminan y vuelan, gallinas que picotean junto a las casas,
// perros por el pueblo, bandadas de pájaros, loros entre las palmas y árboles que se mecen con el viento.
// Con "reducir movimiento" los animales quedan quietos y no pasan pájaros.
import { P } from '../arte/iso.js';
import { reducirMovimiento } from './pantalla.js';

const ARBOLES = new Set(['arbol', 'saman', 'arbolNiebla', 'palma', 'guadua', 'platano', 'arbusto', 'frailejon']);
const ANIMALES = new Set(['vaca', 'garza']);
const azar = (a, b) => a + Math.random() * (b - a);

export class Vida {
  // Cuánto se mece cada tipo de planta (en grados).
  static vaiven(k) { return { arbol: 1.6, saman: 1, arbolNiebla: 1.2, palma: 2.2, guadua: 3, platano: 2.4, arbusto: 1.4, frailejon: .6 }[k] || 0; }
  constructor(scene) {
    this.scene = scene;
    this.animales = [];
    this.bandadas = [];
    this.proximaBandada = azar(4, 10);
    this.poner();
  }
  static esAnimal(k) { return ANIMALES.has(k); }
  static esArbol(k) { return ARBOLES.has(k); }

  figura(k, r, c, s = 1) {
    const { T } = this.scene, H = this.scene.hojas.naturaleza, m = H.marcos[k], p = P(r, c, T.hf(r, c));
    return this.scene.add.image(p[0], p[1], 'naturaleza', k).setOrigin(m.ax / m.w, m.ay / m.h).setScale(s / H.escala).setDepth(r + c);
  }
  // Pone los animales según el territorio y el pueblo actual (se llama de nuevo tras construir).
  poner() {
    this.animales.forEach(a => a.img.destroy());
    this.animales = [];
    const { S, T } = this.scene, N = T.N;
    // Vacas y garzas donde las puso la naturaleza, si la casilla sigue libre.
    for (const o of this.scene.plantasMundo) {
      if (!ANIMALES.has(o.k) || S.map[o.i].b) continue;
      const a = { k: o.k, casa: { r: o.r, c: o.c }, r: o.r, c: o.c, s: o.s, espera: azar(0, 6), ruta: null };
      a.img = this.figura(o.k, o.r, o.c, o.s);
      this.animales.push(a);
    }
    // Gallinas junto a algunas casas y perros por el pueblo.
    const casas = S.map.map((x, i) => x.b === 'casa' ? i : -1).filter(i => i >= 0);
    casas.forEach((i, k) => {
      const r = Math.floor(i / N) + 1.1, c = i % N + .4;
      if (k % 2 === 0) for (let j = 0; j < 2; j++) {
        const a = { k: 'gallina', casa: { r, c: c + j * .3 }, r, c: c + j * .3, s: 1, espera: azar(0, 2), var: (k + j) % 2 };
        a.img = this.figura('gallina' + a.var, a.r, a.c); this.animales.push(a);
      }
      if (k % 4 === 1 && this.animales.filter(x => x.k === 'perro').length < 6) {
        const a = { k: 'perro', casa: { r, c }, r, c, s: 1, espera: azar(1, 4), fase: 0 };
        a.img = this.figura('perro0', r, c); this.animales.push(a);
      }
    });
    // Loros: parejas entre las palmas de cera.
    this.palmas = this.scene.plantasMundo.filter(o => o.k === 'palma' && !S.map[o.i].b);
    for (let k = 0; k < Math.min(3, Math.floor(this.palmas.length / 4)); k++) {
      const pa = this.palmas[(k * 7) % this.palmas.length];
      for (let j = 0; j < 2; j++) {
        const a = { k: 'loro', r: pa.r, c: pa.c + j * .12, alto: 70 + j * 4, espera: azar(3, 12), fase: 0, vuela: null };
        a.img = this.figura('loro0', a.r, a.c).setVisible(false); this.animales.push(a);
      }
    }
  }

  update(dt, t) {
    if (reducirMovimiento()) return;
    const { T, S } = this.scene, N = T.N;
    for (const a of this.animales) {
      if (a.k === 'vaca') this.vaca(a, dt);
      else if (a.k === 'garza') this.garza(a, dt, N, S);
      else if (a.k === 'gallina') this.gallina(a, dt);
      else if (a.k === 'perro') this.perro(a, dt, N, S);
      else if (a.k === 'loro') this.loro(a, dt);
    }
    this.aves(dt);
    this.viento(t);
  }

  mover(a, dt, vel) {
    const d = a.ruta, dr = d.r - a.r, dc = d.c - a.c, dist = Math.hypot(dr, dc);
    if (dist < .02) { a.ruta = null; return 0; }
    const v = Math.min(dist, vel * dt);
    a.r += dr / dist * v; a.c += dc / dist * v;
    a.img.setFlipX((dc - dr) < 0);
    return v;
  }
  dibujar(a, alto = 0) {
    const p = P(a.r, a.c, this.scene.T.hf(a.r, a.c));
    a.img.setPosition(p[0], p[1] - alto).setDepth(a.r + a.c + (alto ? 50 : 0));
  }
  // Vaca: pasta con la cabeza abajo y de vez en cuando da unos pasos.
  vaca(a, dt) {
    if (a.ruta) { this.mover(a, dt, .1); a.img.setFrame('vaca'); this.dibujar(a); return; }
    a.espera -= dt;
    if (a.espera <= 0) { a.ruta = { r: a.casa.r + azar(-.35, .35), c: a.casa.c + azar(-.35, .35) }; a.espera = azar(5, 14); }
    else a.img.setFrame('vacaPasta');
  }
  // Garza: camina despacio y a veces vuela a otra orilla.
  garza(a, dt, N, S) {
    if (a.vuela) {
      const v = a.vuela; v.t += dt / v.dur;
      const f = Math.min(1, v.t);
      a.r = v.r0 + (v.r1 - v.r0) * f; a.c = v.c0 + (v.c1 - v.c0) * f;
      a.img.setFrame(f < 1 ? 'garzaVuela' : 'garza').setFlipX(v.c1 - v.r1 < v.c0 - v.r0);
      this.dibujar(a, Math.sin(f * Math.PI) * 40);
      if (f >= 1) { a.vuela = null; a.casa = { r: a.r, c: a.c }; a.espera = azar(8, 20); }
      return;
    }
    if (a.ruta) { this.mover(a, dt, .08); this.dibujar(a); return; }
    a.espera -= dt;
    if (a.espera > 0) return;
    if (Math.random() < .35) {
      // Vuela a otra casilla junto al agua, a pocas casillas.
      for (let k = 0; k < 12; k++) {
        const r = Math.floor(a.r + azar(-5, 5)), c = Math.floor(a.c + azar(-5, 5));
        if (r < 1 || c < 1 || r >= N - 1 || c >= N - 1 || S.map[r * N + c].t === 'rio' || S.map[r * N + c].b) continue;
        a.vuela = { r0: a.r, c0: a.c, r1: r + .5, c1: c + .5, t: 0, dur: azar(2.5, 4) };
        return;
      }
    }
    a.ruta = { r: a.casa.r + azar(-.3, .3), c: a.casa.c + azar(-.3, .3) }; a.espera = azar(4, 10);
  }
  // Gallina: picotea (cabeza arriba y abajo) y da saltitos cerca de la casa.
  gallina(a, dt) {
    if (a.ruta) { this.mover(a, dt, .15); this.dibujar(a); return; }
    a.espera -= dt;
    a.pico = (a.pico || 0) + dt;
    if (a.pico > azar(.3, .9)) { a.pico = 0; a.baja = !a.baja; a.img.setAngle(a.baja ? (a.img.flipX ? -18 : 18) : 0); }
    if (a.espera <= 0) { a.ruta = { r: a.casa.r + azar(-.25, .25), c: a.casa.c + azar(-.3, .3) }; a.espera = azar(1.5, 4); }
  }
  // Perro: recorre el pueblo por casillas libres y se sienta a ratos.
  perro(a, dt, N, S) {
    if (a.ruta) { const v = this.mover(a, dt, .5); a.fase += v * 18; a.img.setFrame('perro' + (Math.floor(a.fase) % 2)); this.dibujar(a); return; }
    a.img.setFrame('perro0');
    a.espera -= dt;
    if (a.espera > 0) return;
    for (let k = 0; k < 10; k++) {
      const r = Math.floor(a.casa.r + azar(-3, 3)), c = Math.floor(a.casa.c + azar(-3, 3));
      if (r < 0 || c < 0 || r >= N || c >= N || S.map[r * N + c].t === 'rio') continue;
      a.ruta = { r: r + azar(.2, .8), c: c + azar(.2, .8) }; break;
    }
    a.espera = azar(2, 7);
  }
  // Loros: vuelan en pareja de una palma a otra, aleteando.
  loro(a, dt) {
    if (a.vuela) {
      const v = a.vuela; v.t += dt / v.dur;
      const f = Math.min(1, v.t);
      a.r = v.r0 + (v.r1 - v.r0) * f; a.c = v.c0 + (v.c1 - v.c0) * f;
      a.fase += dt * 9; a.img.setFrame('loro' + (Math.floor(a.fase) % 2)).setFlipX(v.c1 - v.r1 < v.c0 - v.r0).setVisible(true);
      this.dibujar(a, a.alto + Math.sin(f * Math.PI) * 30);
      if (f >= 1) { a.vuela = null; a.img.setVisible(false); a.espera = azar(8, 25); }
      return;
    }
    a.espera -= dt;
    if (a.espera <= 0 && this.palmas.length > 1) {
      const d = this.palmas[Math.floor(Math.random() * this.palmas.length)];
      if (Math.hypot(d.r - a.r, d.c - a.c) < 10) a.vuela = { r0: a.r, c0: a.c, r1: d.r, c1: d.c + (a.c % 1 > .5 ? .12 : 0), t: 0, dur: azar(3, 6) };
      else a.espera = 2;
    }
  }
  // Bandadas de pájaros que cruzan el cielo.
  aves(dt) {
    this.proximaBandada -= dt;
    if (this.proximaBandada <= 0) {
      this.proximaBandada = azar(14, 30);
      const cam = this.scene.cameras.main, w = cam.width / cam.zoom, h = cam.height / cam.zoom;
      const x0 = cam.scrollX - 40, y0 = cam.scrollY + azar(.15, .6) * h, n = Math.floor(azar(4, 8)), vx = azar(35, 55), vy = azar(-8, 8);
      const aves = [];
      for (let k = 0; k < n; k++) aves.push({ img: this.figura('pajaro0', 0, 0).setDepth(46000), dx: -k * azar(8, 12), dy: (k % 2 ? 1 : -1) * k * 3.5, fase: Math.random() * 2 });
      this.bandadas.push({ x: x0, y: y0, vx, vy, aves, fin: cam.scrollX + w + 80 });
    }
    for (const b of this.bandadas) {
      b.x += b.vx * dt; b.y += b.vy * dt;
      for (const a of b.aves) { a.fase += dt * 7; a.img.setFrame('pajaro' + (Math.floor(a.fase) % 2)).setPosition(b.x + a.dx, b.y + a.dy); }
    }
    this.bandadas = this.bandadas.filter(b => { if (b.x - 100 > b.fin) { b.aves.forEach(a => a.img.destroy()); return false; } return true; });
  }
  // Viento: los árboles se mecen, con ráfagas que recorren el territorio.
  viento(t) {
    const plantas = this.scene.plantas;
    for (const k in plantas) for (const img of plantas[k]) {
      if (!img.getData('arbol')) continue;
      const x = img.x, rafaga = .55 + .45 * Math.sin(t * .35 - x * .004);
      img.setAngle(Math.sin(t * 1.6 + x * .05 + img.y * .03) * img.getData('arbol') * rafaga);
    }
  }
  destruir() { this.animales.forEach(a => a.img.destroy()); this.bandadas.forEach(b => b.aves.forEach(a => a.img.destroy())); }
}
