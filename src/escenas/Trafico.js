// Tráfico por las calles (fase 9): arrieros con mulas, chivas o camiones según la época, que recorren la red de
// calles de esquina en esquina sin devolverse. Pocos (uno por cada seis tramos, máximo seis) para no recargar.
// Con "reducir movimiento" quedan quietos.
import { P } from '../arte/iso.js';
import { hornearVehiculos } from '../arte/calles.js';
import { listaCalles, eraCalle } from '../core/index.js';
import { reducirMovimiento } from './pantalla.js';

export class Trafico {
  constructor(scene) {
    this.scene = scene;
    this.H = hornearVehiculos();
    if (!scene.textures.exists('vehiculos')) {
      const tx = scene.textures.addCanvas('vehiculos', this.H.canvas);
      for (const [k, m] of Object.entries(this.H.marcos)) tx.add(k, 0, m.x, m.y, m.w, m.h);
    }
    this.lista = []; this.reloj = 0;
    this.poner();
  }
  // Vuelve a armar la red y los vehículos (tras cambiar las calles o la época).
  poner() {
    const { S } = this.scene, M = this.scene.T.N + 1, calles = listaCalles(S);
    this.vista = calles; this.era = eraCalle(S);
    this.red = new Map();
    for (const k of calles) { const [a, b] = k.split('|').map(Number); (this.red.get(a) || this.red.set(a, []).get(a)).push(b); (this.red.get(b) || this.red.set(b, []).get(b)).push(a); }
    this.nodos = [...this.red.keys()];
    const n = calles.length ? Math.min(6, 1 + Math.floor(calles.length / 6)) : 0;
    while (this.lista.length > n) this.lista.pop().img.destroy();
    while (this.lista.length < n) {
      const k = this.lista.length, img = this.scene.add.image(0, 0, 'vehiculos', 'herradura_c_+_0').setScale(1 / this.H.escala);
      this.lista.push({ img, de: -1, a: -1, u: Math.random(), previo: -1, vel: .3 + (k % 3) * .06 });
    }
    this.M = M;
    for (const v of this.lista) { v.de = -1; this.colocar(v, 0); }
  }
  revisar() { const { S } = this.scene; if (listaCalles(S) !== this.vista || eraCalle(S) !== this.era) this.poner(); }
  elegir(v) {
    if (!this.nodos.length) return false;
    if (v.de < 0 || !this.red.has(v.de)) { v.de = this.nodos[Math.floor(Math.random() * this.nodos.length)]; v.previo = -1; }
    let V = this.red.get(v.de) || [];
    if (!V.length) return false;
    const sin = V.filter(x => x !== v.previo); if (sin.length) V = sin;
    v.a = V[Math.floor(Math.random() * V.length)];
    return true;
  }
  colocar(v, paso) {
    if ((v.de < 0 || v.a < 0) && !this.elegir(v)) { v.img.setVisible(false); return; }
    const { T } = this.scene, M = this.M, r1 = Math.floor(v.de / M), c1 = v.de % M, r2 = Math.floor(v.a / M), c2 = v.a % M;
    const r = r1 + (r2 - r1) * v.u, c = c1 + (c2 - c1) * v.u, N = T.N, p = P(r, c, T.hf(Math.min(N, r), Math.min(N, c)));
    const eje = r1 === r2 ? 'c' : 'r', dir = (r2 - r1) + (c2 - c1) > 0 ? '+' : '-', k = `${this.era}_${eje}_${dir}_${this.era === 'herradura' ? paso : 0}`, m = this.H.marcos[k];
    v.img.setVisible(true).setFrame(k).setOrigin(m.ax / m.w, m.ay / m.h).setPosition(p[0], p[1]).setDepth(r + c + .03);
  }
  update(dt) {
    if (!this.lista.length) return;
    const quieto = reducirMovimiento();
    this.reloj += dt;
    const paso = quieto ? 0 : Math.floor(this.reloj * 6) % 4;
    for (const v of this.lista) {
      if (!quieto) { v.u += dt * v.vel; if (v.u >= 1) { v.previo = v.de; v.de = v.a; v.a = -1; v.u = 0; } }
      this.colocar(v, paso);
    }
  }
}
