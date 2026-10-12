// Tráfico por las calles (fase 9): arrieros con mulas, chivas o camiones según la época, que recorren la red de
// calles de esquina en esquina sin devolverse. Pocos (uno por cada seis tramos, máximo seis) para no recargar.
// Pedido de Juan (12 de octubre): en la época de los caminos de herradura los arrieros tienen oficio: recuas de dos
// mulas cargadas salen de las fincas unidas a la plaza y llevan la cosecha hasta el borde del mapa (o al pueblo si aún
// no hay salida), y vuelven. Una recua por cada tres fincas con camino (máximo cuatro).
// Con "reducir movimiento" quedan quietos.
import { P } from '../arte/iso.js';
import { hornearVehiculos } from '../arte/calles.js';
import { enPotencia } from '../arte/fresco.js';
import { listaCalles, eraCalle, aislada, plaza as plazaDe } from '../core/index.js';
import { reducirMovimiento } from './pantalla.js';

export class Trafico {
  constructor(scene) {
    this.scene = scene;
    this.H = hornearVehiculos();
    if (!scene.textures.exists('vehiculos')) {
      const tx = scene.textures.addCanvas('vehiculos', enPotencia(this.H.canvas)); // lados potencia de dos: sin temblor al moverse
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
    this.nFincas = this.contarFincas();
    if (this.era === 'herradura' && this.ponerRecuas()) return;
    if (this.recuas) { this.lista.forEach(v => v.img.destroy()); this.lista = []; }
    this.recuas = null;
    const n = calles.length >= 4 ? Math.min(4, 1 + Math.floor(calles.length / 10)) : 0; // pocos: el camino no tiene que estar siempre ocupado
    while (this.lista.length > n) this.lista.pop().img.destroy();
    while (this.lista.length < n) {
      const k = this.lista.length, img = this.scene.add.image(0, 0, 'vehiculos', 'herradura_c_+_0_0').setScale(1 / this.H.escala);
      this.lista.push({ img, de: -1, a: -1, u: Math.random(), previo: -1, vel: .3 + (k % 3) * .06, vi: k % 3, descanso: 2 + Math.random() * 10 });
    }
    this.M = M;
    for (const v of this.lista) { v.de = -1; this.colocar(v, 0); }
  }
  // Recuas de arrieros: rutas reales por la red de calles desde una finca hasta la salida (o la plaza).
  ponerRecuas() {
    const { S, T } = this.scene, N = T.N, M = N + 1, finca = x => x.b === 'cultivo' || x.b === 'cafetal';
    const esquinasDe = i => { const r = Math.floor(i / N), c = i % N; return [r * M + c, r * M + c + 1, (r + 1) * M + c, (r + 1) * M + c + 1]; };
    const fincas = S.map.map((x, i) => finca(x) && !x.ob && !aislada(S, i) ? i : -1).filter(i => i >= 0);
    const origenes = [...new Set(fincas.flatMap(i => esquinasDe(i).filter(e => this.red.has(e))))];
    if (!origenes.length) return false;
    const borde = this.nodos.filter(e => { const r = Math.floor(e / M), c = e % M; return r === 0 || c === 0 || r === N || c === N; });
    const pz = plazaDe(S), destinos = borde.length ? borde : pz >= 0 ? esquinasDe(pz).filter(e => this.red.has(e)) : [];
    if (!destinos.length) return false;
    // Camino más corto por la red (anchura primero) desde un origen hasta el destino más cercano.
    const ruta = o => { const prev = new Map([[o, -1]]), cola = [o], meta = new Set(destinos); while (cola.length) { const u = cola.shift(); if (meta.has(u) && u !== o) { const L = [u]; while (prev.get(L[0]) !== -1) L.unshift(prev.get(L[0])); return L; } for (const v of this.red.get(u) || []) if (!prev.has(v)) { prev.set(v, u); cola.push(v); } } return null; };
    const rutas = origenes.map(ruta).filter(L => L && L.length > 1);
    if (!rutas.length) return false;
    const n = Math.min(4, 1 + Math.floor(fincas.length / 3));
    for (const v of this.lista) v.img.destroy();
    this.lista = [];
    this.recuas = [];
    for (let k = 0; k < n; k++) {
      const L = rutas[k % rutas.length], recua = { L, pos: 0, ida: true, vel: .32 + (k % 3) * .05, descanso: 1 + k * 6 + Math.random() * 4, mulas: [] };
      for (let j = 0; j < 2; j++) { const img = this.scene.add.image(0, 0, 'vehiculos', 'herradura_c_+_0_0').setScale(1 / this.H.escala).setVisible(false); recua.mulas.push({ img, atras: j * .45, vi: (k + j) % 3 }); this.lista.push({ img }); }
      this.recuas.push(recua);
    }
    return true;
  }
  // Mueve una recua por su ruta: va cargada a la salida, descansa y vuelve.
  moverRecua(R, dt, paso, quieto) {
    if (R.descanso > 0) { R.descanso -= dt; for (const m of R.mulas) m.img.setVisible(false); return; }
    const tramos = R.L.length - 1;
    if (!quieto) R.pos += dt * R.vel;
    if (R.pos - .45 >= tramos) { R.pos = 0; R.ida = !R.ida; R.L = [...R.L].reverse(); R.descanso = 6 + Math.random() * 10; return; }
    const { T } = this.scene, M = this.M, N = T.N;
    for (const m of R.mulas) {
      const q = Math.max(0, Math.min(tramos - 1e-6, R.pos - m.atras)), k = Math.floor(q), u = q - k, a = R.L[k], b = R.L[k + 1];
      if (R.pos - m.atras < 0) { m.img.setVisible(false); continue; }
      const r1 = Math.floor(a / M), c1 = a % M, r2 = Math.floor(b / M), c2 = b % M, r = r1 + (r2 - r1) * u, c = c1 + (c2 - c1) * u, p = P(r, c, T.hf(Math.min(N, r), Math.min(N, c)));
      const eje = r1 === r2 ? 'c' : 'r', dir = (r2 - r1) + (c2 - c1) > 0 ? '+' : '-', key = `herradura_${eje}_${dir}_${paso}_${m.vi}`, mm = this.H.marcos[key];
      m.img.setVisible(true).setFrame(key).setOrigin(mm.ax / mm.w, mm.ay / mm.h).setPosition(p[0], p[1]).setDepth(r + c + .03);
    }
  }
  contarFincas() { return this.scene.S.map.filter(x => (x.b === 'cultivo' || x.b === 'cafetal') && !x.ob).length; }
  revisar() { const { S } = this.scene; if (listaCalles(S) !== this.vista || eraCalle(S) !== this.era || (this.era === 'herradura' && this.contarFincas() !== this.nFincas)) this.poner(); }
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
    const eje = r1 === r2 ? 'c' : 'r', dir = (r2 - r1) + (c2 - c1) > 0 ? '+' : '-', k = `${this.era}_${eje}_${dir}_${this.era === 'herradura' ? paso : 0}_${this.era === 'herradura' ? v.vi : 0}`, m = this.H.marcos[k];
    v.img.setVisible(true).setFrame(k).setOrigin(m.ax / m.w, m.ay / m.h).setPosition(p[0], p[1]).setDepth(r + c + .03);
  }
  update(dt) {
    this.revision = (this.revision || 0) + dt; if (this.revision > 3) { this.revision = 0; this.revisar(); } // fincas nuevas: recuas nuevas
    if (!this.lista.length) return;
    const quieto = reducirMovimiento();
    this.reloj += dt;
    const paso = quieto ? 0 : Math.floor(this.reloj * 6) % 4;
    if (this.recuas) { for (const R of this.recuas) this.moverRecua(R, dt, paso, quieto); return; }
    for (const v of this.lista) {
      // Entre viaje y viaje descansa un rato fuera de la vista (en el pueblo o en la finca).
      if (v.descanso > 0) { v.descanso -= dt; v.img.setVisible(false); continue; }
      if (!quieto) { v.u += dt * v.vel; if (v.u >= 1) { v.previo = v.de; v.de = v.a; v.a = -1; v.u = 0; if (Math.random() < .35) { v.descanso = 8 + Math.random() * 20; v.de = -1; } } }
      this.colocar(v, paso);
    }
  }
}
