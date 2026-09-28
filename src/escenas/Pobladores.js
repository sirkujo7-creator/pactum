// Pobladores animados y luz del día. Cada figura tiene casa y trabajo reales (src/core/pobladores.js).
// Rutina: en la mañana va al trabajo (los niños a la escuela), en la tarde pasa por la plaza,
// en la noche vuelve a casa y se encienden las ventanas. Con "reducir movimiento" todo queda quieto de día.
import { planearPobladores } from '../core/index.js';
import { hornearPersonas } from '../arte/personas.js';
import { caminos } from '../arte/terreno.js';
import { P } from '../arte/iso.js';
import { reducirMovimiento } from './pantalla.js';

const DURACION_DIA = 180; // segundos que dura un día completo
const TAMANO = .62;       // tamaño de las figuras frente a las casas
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
    this.puentes = new Set(caminos(T, S.map).puentes.map(([, j]) => j));
    while (this.figuras.length > plan.length) this.figuras.pop().img.destroy();
    plan.forEach((p, k) => {
      let f = this.figuras[k];
      if (!f) {
        const casa = this.centro(p.casa, .3);
        f = { r: casa.r, c: casa.c, ruta: [], espera: Math.random() * 3, fase: Math.random() * 4, frente: 1, voltear: false, oculto: false };
        f.img = this.scene.add.image(0, 0, 'personas', `${p.tipo}_${p.vi}_1_0`);
        const m = this.H.marcos[`${p.tipo}_${p.vi}_1_0`];
        f.img.setOrigin(m.ax / m.w, m.ay / m.h).setScale(TAMANO / this.H.escala);
        this.figuras.push(f);
      }
      f.p = p; f.vel = (p.tipo === 'nino' ? .5 : .42) * (.85 + p.semilla * .3); f.carril = (p.semilla - .5) * .3;
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
  // Temporada dentro del año (fase 1): dos días de lluvias y dos de seca, alternados.
  temporada() { return Math.floor((this.dias || 0) / 2) % 2 === 0 ? 'lluvias' : 'seca'; }
  // Qué tanto es de mañana (0 a 1), para la niebla.
  manana() { const d = this.reloj; return d > .18 && d < .42 ? Math.sin((d - .18) / .24 * Math.PI) : 0; }
  destinoDeDia(f) {
    const p = f.p;
    if (p.trabajo !== null) return this.centro(p.trabajo, .7, () => p.semilla);
    return this.centro(p.plaza >= 0 ? p.plaza : p.casa, 1.2, () => p.semilla);
  }
  // A dónde va ahora según la hora del día (como en la prueba de estilo).
  siguiente(f) {
    const d = this.reloj, p = f.p;
    const a = (q, lugar) => ({ ...q, lugar });
    if (d > .8 || d < .08) return { ...this.centro(p.casa, .2), casa: true };
    if (d > .55 && Math.random() < .6 && p.plaza >= 0) return a(this.centro(p.plaza, 1.3), 'plaza');
    if (p.trabajo !== null && Math.random() < .8) return a(this.centro(p.trabajo, .7), 'trabajo');
    if (p.clase === 'n' || p.clase === 'e') return Math.random() < .6 && p.plaza >= 0 ? a(this.centro(p.plaza, 1.3), 'plaza') : this.centro(p.casa, 1.4);
    return p.plaza >= 0 ? a(this.centro(p.plaza, 1.3), 'plaza') : this.centro(p.casa, 1.2);
  }
  // Camino por las casillas: rodea los edificios y el río (que solo se cruza por un puente).
  // Devuelve una lista de puntos, o null si no hay manera de llegar.
  ruta(f, d) {
    const { S, T } = this.scene, N = T.N;
    const casilla = q => Math.max(0, Math.min(N - 1, Math.floor(q.r))) * N + Math.max(0, Math.min(N - 1, Math.floor(q.c)));
    const ini = casilla(f), fin = casilla(d);
    if (ini === fin) return [d];
    const libre = i => {
      if (i === fin || i === ini) return true;
      const x = S.map[i];
      if (x.t === 'rio') return this.puentes.has(i);
      return !x.b || ['cultivo', 'cafetal', 'parque'].includes(x.b);
    };
    // A* sobre la cuadrícula (4 vecinos). Los campos cuestan un poco más que el camino libre.
    const g = new Map([[ini, 0]]), de = new Map(), abiertos = [[0, ini]];
    const h = i => Math.abs(Math.floor(i / N) - Math.floor(fin / N)) + Math.abs(i % N - fin % N);
    let pasos = 0;
    while (abiertos.length && pasos++ < 2500) {
      let m = 0; for (let k = 1; k < abiertos.length; k++) if (abiertos[k][0] < abiertos[m][0]) m = k;
      const [, i] = abiertos.splice(m, 1)[0];
      if (i === fin) break;
      const r = Math.floor(i / N), c = i % N;
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const R = r + dr, C2 = c + dc;
        if (R < 0 || C2 < 0 || R >= N || C2 >= N) continue;
        const j = R * N + C2;
        if (!libre(j)) continue;
        const costo = g.get(i) + (S.map[j].b ? 1.6 : 1);
        if (costo < (g.has(j) ? g.get(j) : 1e9)) { g.set(j, costo); de.set(j, i); abiertos.push([costo + h(j), j]); }
      }
    }
    if (!de.has(fin)) return null;
    const puntos = [];
    for (let i = de.get(fin); i !== ini && i !== undefined; i = de.get(i)) puntos.unshift({ r: Math.floor(i / N) + .5 + f.carril, c: i % N + .5 - f.carril });
    puntos.push(d);
    return puntos;
  }

  update(dt) {
    const quieto = reducirMovimiento();
    if (!quieto) { const r = this.reloj + dt / DURACION_DIA; if (r >= 1) this.dias = (this.dias || 0) + 1; this.reloj = r % 1; }
    for (const f of this.figuras) {
      if (quieto) { f.oculto = false; this.dibujar(f, false); continue; }
      if (f.espera > 0) {
        f.espera -= dt;
        // En el campo, los campesinos trabajan la tierra mientras esperan (se agachan y se levantan).
        const b = f.destino === 'trabajo' && f.p.trabajo !== null ? this.scene.S.map[f.p.trabajo].b : null;
        if (b === 'cultivo' || b === 'cafetal') { f.fase += dt * 2.4; this.dibujar(f, false, (Math.floor(f.fase) % 2) * 2); }
        else this.dibujar(f, false);
        continue;
      }
      if (!f.ruta.length) {
        const d = this.siguiente(f), r = this.ruta(f, d);
        if (!r) { f.espera = 3 + Math.random() * 4; continue; }
        f.ruta = r; f.aCasa = !!d.casa; f.destino = d.lugar; f.oculto = false;
      }
      const d = f.ruta[0], dr = d.r - f.r, dc = d.c - f.c, dist = Math.hypot(dr, dc);
      if (dist < .04) {
        f.ruta.shift();
        // Al llegar se queda un rato: más en el trabajo, menos de paso.
        if (!f.ruta.length) { f.espera = f.destino === 'trabajo' ? 9 + Math.random() * 12 : f.destino === 'plaza' ? 5 + Math.random() * 8 : 2 + Math.random() * 4; if (f.aCasa) f.oculto = true; }
        this.dibujar(f, false);
        continue;
      }
      const v = Math.min(dist, f.vel * dt);
      // El paso va con la distancia recorrida: un ciclo de 4 posturas cada 0,3 casillas (así los pies no resbalan).
      f.r += dr / dist * v; f.c += dc / dist * v; f.fase += v * 13;
      f.frente = (dc + dr) >= 0 ? 1 : 0; f.voltear = (dc - dr) < 0;
      this.dibujar(f, true);
    }
    this.luzDelDia();
  }

  dibujar(f, andando, postura) {
    const T = this.scene.T, p = P(f.r, f.c, T.hf(f.r, f.c)), paso = andando ? Math.floor(f.fase) % 4 : (postura || 0);
    f.img.setFrame(`${f.p.tipo}_${f.p.vi}_${f.frente}_${paso}`).setPosition(p[0], p[1]).setFlipX(f.voltear)
      .setDepth(f.r + f.c + .01).setVisible(!f.oculto);
  }

  // Figura más cercana a un punto del mundo (para la ficha).
  cercana(wx, wy) {
    // Solo cuenta si el toque cae sobre la silueta (unos 12 × 26 del mundo); gana la figura de más adelante.
    let mejor = null;
    for (const f of this.figuras) {
      if (f.oculto) continue;
      const dx = Math.abs(wx - f.img.x), dy = wy - f.img.y, alto = (f.p.tipo === 'nino' ? 20 : 27) * TAMANO;
      if (dx < 5 && dy > -alto && dy < 3 && (!mejor || f.img.depth > mejor.img.depth)) mejor = f;
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
