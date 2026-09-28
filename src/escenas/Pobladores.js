// Pobladores animados y luz del día. Cada figura tiene casa y trabajo reales (src/core/pobladores.js).
// Rutina: en la mañana va al trabajo (los niños a la escuela), en la tarde pasa por la plaza,
// en la noche vuelve a casa y se encienden las ventanas. Con "reducir movimiento" todo queda quieto de día.
import { planearPobladores } from '../core/index.js';
import { hornearPersonas } from '../arte/personas.js';
import { caminos } from '../arte/terreno.js';
import { P } from '../arte/iso.js';
import { reducirMovimiento } from './pantalla.js';

const DURACION_DIA = 180; // segundos que dura un día completo
const smooth = t => t * t * (3 - 2 * t);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export class Pobladores {
  constructor(scene) {
    this.scene = scene;
    this.H = hornearPersonas();
    if (!scene.textures.exists('personas')) {
      const tx = scene.textures.addCanvas('personas', this.H.canvas);
      for (const [k, m] of Object.entries(this.H.marcos)) tx.add(k, 0, m.x, m.y, m.w, m.h);
    }
    this.figuras = [];
    this.reloj = .3; // 0 medianoche · .25 amanecer · .5 mediodía · .75 atardecer
    this.luces = [];
    const cam = scene.cameras.main;
    this.noche = scene.add.rectangle(0, 0, 1, 1, 0x101A34, 0).setOrigin(0).setDepth(40000);
    this.ocaso = scene.add.rectangle(0, 0, 1, 1, 0xF0965A, 0).setOrigin(0).setDepth(40000);
    this.cam = cam;
    this.planear();
  }

  // Vuelve a repartir casas y trabajos (tras construir, demoler o terminar el año).
  planear() {
    const { S, T } = this.scene, plan = planearPobladores(S);
    this.puentes = caminos(T, S.map).puentes.map(([, j]) => { const t = T.tiles[j]; return { r: t.r + .5, c: t.c + .5 }; });
    while (this.figuras.length > plan.length) this.figuras.pop().img.destroy();
    plan.forEach((p, k) => {
      let f = this.figuras[k];
      if (!f) {
        const casa = this.centro(p.casa, .3);
        f = { r: casa.r, c: casa.c, ruta: [], espera: Math.random() * 3, fase: Math.random() * 4, frente: 1, voltear: false, oculto: false };
        f.img = this.scene.add.image(0, 0, 'personas', `${p.tipo}_${p.vi}_1_0`);
        const m = this.H.marcos[`${p.tipo}_${p.vi}_1_0`];
        f.img.setOrigin(m.ax / m.w, m.ay / m.h).setScale(1 / this.H.escala);
        this.figuras.push(f);
      }
      f.p = p; f.vel = (p.tipo === 'nino' ? .55 : .34) * (.85 + p.semilla * .3);
      if (reducirMovimiento()) { const d = this.destinoDeDia(f); f.r = d.r; f.c = d.c; f.ruta = []; }
      this.dibujar(f);
    });
    this.ponerLuces();
  }

  // Punto de llegada en una casilla. En los campos, cualquier lugar; en los edificios, el frente
  // (junto a la puerta), para que nadie quede dibujado encima de un techo.
  centro(i, abrir = .6, R = Math.random) {
    const { S, T } = this.scene, N = T.N, r = Math.floor(i / N), c = i % N, b = S.map[i].b;
    if (b && !['cultivo', 'cafetal', 'parque', 'mina'].includes(b)) {
      const lado = R() < .5, a = .2 + R() * .6;
      return lado ? { r: r + 1.02, c: c + a } : { r: r + a, c: c + 1.02 };
    }
    return { r: r + .5 + (R() - .5) * abrir, c: c + .5 + (R() - .5) * abrir };
  }
  fase() { return this.reloj; }
  destinoDeDia(f) {
    const p = f.p;
    if (p.trabajo !== null) return this.centro(p.trabajo, .7, () => p.semilla);
    return this.centro(p.plaza >= 0 ? p.plaza : p.casa, 1.2, () => p.semilla);
  }
  // A dónde va ahora según la hora del día (como en la prueba de estilo).
  siguiente(f) {
    const d = this.reloj, p = f.p;
    if (d > .8 || d < .08) return { ...this.centro(p.casa, .2), casa: true };
    if (d > .55 && Math.random() < .6 && p.plaza >= 0) return this.centro(p.plaza, 1.3);
    if (p.trabajo !== null && Math.random() < .75) return this.centro(p.trabajo, .7);
    if (p.clase === 'n' || p.clase === 'e') return Math.random() < .6 && p.plaza >= 0 ? this.centro(p.plaza, 1.3) : this.centro(p.casa, 1.4);
    return p.plaza >= 0 ? this.centro(p.plaza, 1.3) : this.centro(p.casa, 1.2);
  }
  // ¿El tramo cruza el río? Entonces busca un puente; si no hay, no va.
  mojado(a, b) {
    const { S, T } = this.scene, N = T.N, pasos = Math.ceil(Math.hypot(b.r - a.r, b.c - a.c) * 4);
    for (let s = 1; s < pasos; s++) {
      const r = Math.floor(a.r + (b.r - a.r) * s / pasos), c = Math.floor(a.c + (b.c - a.c) * s / pasos);
      if (r >= 0 && c >= 0 && r < N && c < N && S.map[r * N + c].t === 'rio' && !this.puentes.some(q => Math.floor(q.r) === r && Math.floor(q.c) === c)) return true;
    }
    return false;
  }
  ruta(f, d) {
    if (!this.mojado(f, d)) return [d];
    for (const q of this.puentes.slice().sort((x, y) => Math.hypot(x.r - f.r, x.c - f.c) - Math.hypot(y.r - f.r, y.c - f.c))) {
      if (!this.mojado(f, q) && !this.mojado(q, d)) return [q, d];
    }
    return null;
  }

  update(dt) {
    const quieto = reducirMovimiento();
    if (!quieto) this.reloj = (this.reloj + dt / DURACION_DIA) % 1;
    for (const f of this.figuras) {
      if (quieto) { f.oculto = false; this.dibujar(f, false); continue; }
      if (f.espera > 0) { f.espera -= dt; this.dibujar(f, false); continue; }
      if (!f.ruta.length) {
        const d = this.siguiente(f), r = this.ruta(f, d);
        if (!r) { f.espera = 2 + Math.random() * 3; continue; }
        f.ruta = r; f.aCasa = !!d.casa; f.oculto = false;
      }
      const d = f.ruta[0], dr = d.r - f.r, dc = d.c - f.c, dist = Math.hypot(dr, dc);
      if (dist < .04) {
        f.ruta.shift();
        if (!f.ruta.length) { f.espera = 1.5 + Math.random() * 4; if (f.aCasa) f.oculto = true; }
        this.dibujar(f, false);
        continue;
      }
      const v = Math.min(dist, f.vel * dt);
      f.r += dr / dist * v; f.c += dc / dist * v; f.fase += dt * 6.5;
      f.frente = (dc + dr) >= 0 ? 1 : 0; f.voltear = (dc - dr) < 0;
      this.dibujar(f, true);
    }
    this.luzDelDia();
  }

  dibujar(f, andando) {
    const T = this.scene.T, p = P(f.r, f.c, T.hf(f.r, f.c)), paso = andando ? Math.floor(f.fase) % 4 : 0;
    f.img.setFrame(`${f.p.tipo}_${f.p.vi}_${f.frente}_${paso}`).setPosition(p[0], p[1]).setFlipX(f.voltear)
      .setDepth(f.r + f.c + .01).setVisible(!f.oculto);
  }

  // Figura más cercana a un punto del mundo (para la ficha).
  cercana(wx, wy) {
    let mejor = null, d0 = 12;
    for (const f of this.figuras) {
      if (f.oculto) continue;
      const d = Math.hypot(wx - f.img.x, wy - (f.img.y - 9));
      if (d < d0) { d0 = d; mejor = f; }
    }
    return mejor;
  }

  // ---------- Luz del día ----------
  ponerLuces() {
    this.luces.forEach(l => l.destroy());
    this.luces = [];
    const obras = this.scene.obras || {};
    for (const [i, figs] of Object.entries(obras)) {
      const img = figs && figs[0], b = this.scene.S.map[i].b;
      if (!img || ['cultivo', 'cafetal', 'mina', 'acueducto', 'parque'].includes(b)) continue;
      const w = img.displayWidth, h = img.displayHeight * img.originY;
      for (const [fx, fy] of [[-.2, -.2], [.08, -.17]]) {
        this.luces.push(this.scene.add.image(img.x + w * fx, img.y + h * fy, 'personas', 'luz').setScale(.28).setAlpha(0).setDepth(40001).setData('fase', Math.random() * 6));
      }
    }
  }
  luzDelDia() {
    const d = this.reloj, noche = d > .8 ? smooth(clamp((d - .8) / .06, 0, 1)) : d < .1 ? smooth(clamp((.1 - d) / .06, 0, 1)) : 0;
    // Vista actual en coordenadas del mundo (la cámara hace zoom desde su esquina superior izquierda).
    const c = this.cam, v = { x: c.scrollX, y: c.scrollY, width: c.width / c.zoom, height: c.height / c.zoom };
    const ocaso = Math.max(0, 1 - Math.abs(d - .74) / .08);
    this.noche.setPosition(v.x, v.y).setScale(v.width, v.height).setFillStyle(0x101A34, .45 * noche).setVisible(noche > 0);
    this.ocaso.setPosition(v.x, v.y).setScale(v.width, v.height).setFillStyle(0xF0965A, .16 * ocaso).setVisible(ocaso > 0);
    const t = this.scene.time.now / 1000;
    for (const l of this.luces) l.setAlpha(noche * (.75 + .25 * Math.sin(t * 2 + l.getData('fase'))));
    this.esNoche = noche > .5;
  }

  destruir() { this.figuras.forEach(f => f.img.destroy()); this.luces.forEach(l => l.destroy()); this.noche.destroy(); this.ocaso.destroy(); }
}
