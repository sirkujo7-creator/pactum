// Vida del paisaje: vacas, cebúes, caballos y chivos que pastan, garzas que caminan y vuelan, gallinas, patos y
// cerdos junto a las casas, gatos que descansan, perros por el pueblo, gallinazos que planean, bandadas de pájaros,
// loros entre las palmas y árboles que se mecen con el viento. Pedido de Juan (6 de octubre): movimiento fluido;
// los cuadrúpedos andan en 12 cuadros, las aves aletean en 8 y los árboles apenas se mecen (su sombra no baila).
// Con "reducir movimiento" los animales quedan quietos y no pasan pájaros.
import { P } from '../arte/iso.js';
import { reducirMovimiento } from './pantalla.js';

// Cuánto se mece cada planta (en grados): poco, para que se vea viva sin que la sombra se mueva.
const VAIVEN = { arbol: .5, saman: .3, ceiba: .3, guayacan: .5, ocobo: .5, cambulo: .5, yarumo: .6, mango: .4, arbolNiebla: .4, palma: .8, guadua: 1.1, platano: .9, arbusto: .4 };
const ARBOLES = new Set(Object.keys(VAIVEN));
const ANIMALES = new Set(['vaca', 'cebu', 'caballo', 'chivo', 'garza', 'pato']);
const PASTAN = new Set(['vaca', 'cebu', 'caballo', 'chivo']);
const azar = (a, b) => a + Math.random() * (b - a);
// Cuadros por casilla recorrida: la zancada de cada animal según su tamaño.
const VEL_CUADROS = { vaca: 78, cebu: 78, caballo: 70, chivo: 110, cerdo: 120, perro: 66, garza: 120 };

export class Vida {
  // Cuánto se mece cada tipo de planta (en grados).
  static vaiven(k) { return VAIVEN[k] || 0; }
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
    // Ganado, garzas y patos donde los puso la naturaleza, si la casilla sigue libre.
    for (const o of this.scene.plantasMundo) {
      const x = S.map[o.i];
      if (!ANIMALES.has(o.k) || x.b || x.t === 'bosque' || x.q > 0 || x.dr > 0) continue;
      const a = { k: o.k, casa: { r: o.r, c: o.c }, r: o.r, c: o.c, s: o.s, espera: azar(0, 6), ruta: null, var: '' };
      a.img = this.figura(o.k, o.r, o.c, o.s);
      this.animales.push(a);
    }
    // Gallinas junto a algunas casas y perros por el pueblo.
    const casas = S.map.map((x, i) => x.b === 'casa' && !(x.u >= 80) ? i : -1).filter(i => i >= 0);
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
      // Un cerdo en el solar de algunas casas y un gato que descansa en otras.
      if (k % 5 === 3 && this.animales.filter(x => x.k === 'cerdo').length < 4) {
        const a = { k: 'cerdo', casa: { r: r + .1, c: c + .35 }, r: r + .1, c: c + .35, s: 1, espera: azar(2, 8), fase: 0 };
        a.img = this.figura('cerdo', a.r, a.c); this.animales.push(a);
      }
      if (k % 6 === 4 && this.animales.filter(x => x.k === 'gato').length < 4) {
        const a = { k: 'gato', r: r - .05, c: c + .55, s: 1, espera: azar(3, 9) };
        a.img = this.figura('gato', a.r, a.c); this.animales.push(a);
      }
    });
    // Gallinazos: planean en círculos altos sobre el pueblo cuando ya hay unas cuantas casas.
    if (casas.length >= 4) for (let j = 0; j < 2; j++) {
      const i = casas[(j * 5) % casas.length], a = { k: 'chulo', cr: Math.floor(i / N) + .5, cc: i % N + .5, ang: j * 3, radio: 1.6 + j * .7, fase: j * 3, r: 0, c: 0 };
      a.img = this.figura('chuloV0', a.cr, a.cc, .9); this.animales.push(a);
    }
    // Loros: parejas entre las palmas de cera.
    this.palmas = this.scene.plantasMundo.filter(o => o.k === 'palma' && !S.map[o.i].b && !S.map[o.i].q && !S.map[o.i].dr && !(T.tiles[o.i].b === 'niebla' && S.map[o.i].t !== 'bosque'));
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
      if (PASTAN.has(a.k)) this.vaca(a, dt);
      else if (a.k === 'garza') this.garza(a, dt, N, S);
      else if (a.k === 'gallina') this.gallina(a, dt);
      else if (a.k === 'perro') this.perro(a, dt, N, S);
      else if (a.k === 'loro') this.loro(a, dt);
      else if (a.k === 'pato') this.gallina(a, dt);
      else if (a.k === 'cerdo') this.cerdo(a, dt);
      else if (a.k === 'gato') this.gato(a, dt);
      else if (a.k === 'chulo') this.chulo(a, dt);
    }
    this.aves(dt);
    this.viento(t);
  }

  mover(a, dt, vel) {
    const d = a.ruta, dr = d.r - a.r, dc = d.c - a.c, dist = Math.hypot(dr, dc);
    if (dist < .02) { a.ruta = null; a.bob = 0; return 0; }
    const v = Math.min(dist, vel * dt);
    a.r += dr / dist * v; a.c += dc / dist * v;
    if (Math.abs(dc - dr) > dist * .3) a.img.setFlipX((dc - dr) < 0); // sin voltearse de un lado al otro
    // Las patas y el cuerpo se mueven en los 12 cuadros del dibujo; solo las aves de corral dan saltitos.
    a.paso = (a.paso || 0) + v * 34; a.bob = a.k === 'gallina' || a.k === 'pato' ? Math.abs(Math.sin(a.paso)) * .5 : 0;
    a.fase = (a.fase || 0) + v * (VEL_CUADROS[a.k] || 80); // avance de los cuadros según lo recorrido: sin patinar
    return v;
  }
  dibujar(a, alto = 0) {
    const p = P(a.r, a.c, this.scene.T.hf(a.r, a.c));
    a.img.setPosition(p[0], p[1] - alto - (a.ruta && !reducirMovimiento() ? a.bob || 0 : 0)).setDepth(a.r + a.c + (alto ? 50 : 0));
  }
  // Ganado (vaca, cebú, caballo, chivo): pasta con la cabeza abajo y de vez en cuando da unos pasos.
  vaca(a, dt) {
    if (a.ruta) { this.mover(a, dt, a.k === 'chivo' ? .13 : .1); a.img.setFrame(a.ruta ? a.k + 'A' + (Math.floor(a.fase) % 12) : a.k); this.dibujar(a); return; }
    a.espera -= dt;
    // Quieta: casi siempre pastando; a ratos levanta la cabeza (cambio de postura pausado, no un parpadeo).
    a.cabeza = (a.cabeza ?? azar(2, 6)) - dt;
    if (a.cabeza <= 0) { a.alta = !a.alta; a.cabeza = a.alta ? azar(1.5, 3) : azar(4, 9); }
    if (a.espera <= 0) { a.ruta = { r: a.casa.r + azar(-.35, .35), c: a.casa.c + azar(-.35, .35) }; a.espera = azar(5, 14); }
    else a.img.setFrame(a.alta ? a.k : a.k + 'Pasta');
  }
  // Garza: camina despacio y a veces vuela a otra orilla.
  garza(a, dt, N, S) {
    if (a.vuela) {
      const v = a.vuela; v.t += dt / v.dur;
      const f = Math.min(1, v.t);
      a.r = v.r0 + (v.r1 - v.r0) * f; a.c = v.c0 + (v.c1 - v.c0) * f;
      v.ala = (v.ala || 0) + dt * 12; // aleteo lento de garza: 1,5 aletazos por segundo en 8 cuadros
      a.img.setFrame(f < 1 ? 'garzaVuela' + (Math.floor(v.ala) % 8) : 'garza').setFlipX(v.c1 - v.r1 < v.c0 - v.r0);
      this.dibujar(a, Math.sin(f * Math.PI) * 40);
      if (f >= 1) { a.vuela = null; a.casa = { r: a.r, c: a.c }; a.espera = azar(8, 20); }
      return;
    }
    if (a.ruta) { this.mover(a, dt, .08); a.img.setFrame(a.ruta ? 'garzaA' + (Math.floor(a.fase) % 8) : 'garza'); this.dibujar(a); return; }
    a.img.setFrame('garza');
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
  // Gallina y pato: picotean (la cabeza baja y sube en 4 pasos suaves) y dan saltitos cerca de la casa o del agua.
  gallina(a, dt) {
    const base = a.k === 'pato' ? 'pato' : 'gallina' + a.var, pasos = a.k === 'pato' ? ['', 'P1', 'P', 'P'] : ['', 'p1', 'p2', 'p'];
    if (a.ruta) { this.mover(a, dt, a.k === 'pato' ? .1 : .15); a.img.setFrame(base); this.dibujar(a); return; }
    a.espera -= dt;
    if (a.pica !== undefined) { // bajando y subiendo: 0 a 1 y de vuelta, sin saltos
      a.pica += dt / .5; const t = a.pica < 1 ? a.pica : 2 - a.pica;
      a.img.setFrame(base + pasos[Math.min(3, Math.round(Math.max(0, t) * 3))]);
      if (a.pica >= 2) { a.pica = undefined; a.img.setFrame(base); }
      return;
    }
    a.pico = (a.pico ?? azar(.3, 1)) - dt;
    if (a.pico <= 0) { a.pica = 0; a.pico = azar(.5, 2); }
    if (a.espera <= 0) { a.ruta = { r: a.casa.r + azar(-.25, .25), c: a.casa.c + azar(-.3, .3) }; a.espera = azar(1.5, 4); }
  }
  // Cerdo: hoza en el solar y da unos pasos de vez en cuando.
  cerdo(a, dt) {
    if (a.ruta) { this.mover(a, dt, .07); a.img.setFrame(a.ruta ? 'cerdoA' + (Math.floor(a.fase) % 12) : 'cerdo'); this.dibujar(a); return; }
    a.espera -= dt;
    if (a.espera <= 0) { a.ruta = { r: a.casa.r + azar(-.25, .25), c: a.casa.c + azar(-.25, .25) }; a.espera = azar(4, 10); }
  }
  // Gato: descansa sentado y a ratos mueve la cola.
  gato(a, dt) {
    a.espera -= dt;
    if (a.espera <= 0) { a.cola = !a.cola; a.img.setFrame(a.cola ? 'gato1' : 'gato'); a.espera = a.cola ? azar(.6, 1.2) : azar(3, 9); }
  }
  // Gallinazo: planea en círculos lentos, alto sobre el pueblo, casi sin aletear.
  chulo(a, dt) {
    a.ang += dt * .22; a.fase += dt * 2.4;
    a.r = a.cr + Math.sin(a.ang) * a.radio; a.c = a.cc + Math.cos(a.ang) * a.radio;
    a.img.setFrame('chuloV' + (Math.floor(a.fase) % 8));
    this.dibujar(a, 120 + Math.sin(a.ang * .7) * 10);
  }
  // Perro: recorre el pueblo por casillas libres y se sienta a ratos.
  perro(a, dt, N, S) {
    if (a.ruta) { this.mover(a, dt, .5); a.img.setFrame(a.ruta ? 'perro' + (Math.floor(a.fase) % 12) : 'perroS'); this.dibujar(a); return; }
    a.img.setFrame('perroS'); // descansa sentado
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
      a.fase += dt * 24; a.img.setFrame('loro' + (Math.floor(a.fase) % 6)).setFlipX(v.c1 - v.r1 < v.c0 - v.r0).setVisible(true);
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
      for (const a of b.aves) { a.fase += dt * 14; a.img.setFrame('pajaro' + (Math.floor(a.fase) % 4)).setPosition(b.x + a.dx, b.y + a.dy); }
    }
    this.bandadas = this.bandadas.filter(b => { if (b.x - 100 > b.fin) { b.aves.forEach(a => a.img.destroy()); return false; } return true; });
  }
  // Viento: los árboles se mecen apenas y despacio, con ráfagas que recorren el territorio.
  viento(t) {
    const plantas = this.scene.plantas;
    for (const k in plantas) for (const img of plantas[k]) {
      if (!img.getData('arbol')) continue;
      const x = img.x, rafaga = .55 + .45 * Math.sin(t * .35 - x * .004);
      img.setAngle(Math.sin(t * 1.1 + x * .05 + img.y * .03) * img.getData('arbol') * rafaga);
    }
  }
  destruir() { this.animales.forEach(a => a.img.destroy()); this.bandadas.forEach(b => b.aves.forEach(a => a.img.destroy())); }
}
