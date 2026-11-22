// La logística que se ve (ideas de Anno, paso 3; aprobado por Juan): cada fábrica que trabaja recibe su materia
// prima de una finca y manda su producto al mercado, por los caminos. Según la época de los caminos va una mula con su
// arriero (herradura), una carreta de bueyes (empedrado) o un camión (carretera): de la finca a la fábrica cargado y de
// vuelta, y de la fábrica al mercado (o a la plaza). Si la finca o la fábrica no están unidas a la red de caminos, no
// hay viaje: así se ve por qué hace falta el camino. Pocos vehículos (uno por tramo, máximo seis). Con «reducir
// movimiento» no salen.
import { P } from '../arte/iso.js';
import { hornearVehiculos } from '../arte/calles.js';
import { enPotencia } from '../arte/fresco.js';
import { listaCalles, eraCalle, plaza as plazaDe, industriaActiva, productoDe, datosProducto, produccionFabrica, cultivoDe, produce } from '../core/index.js';
import { reducirMovimiento } from './pantalla.js';

const VEHICULO = { herradura: 'herradura', empedrado: 'carreta', carretera: 'carretera' };
const MAXIMO = 6;

export class Logistica {
  constructor(scene) {
    this.scene = scene; this.H = hornearVehiculos();
    if (!scene.textures.exists('vehiculos')) {
      const tx = scene.textures.addCanvas('vehiculos', enPotencia(this.H.canvas));
      for (const [k, m] of Object.entries(this.H.marcos)) tx.add(k, 0, m.x, m.y, m.w, m.h);
    }
    this.viajes = []; this.firma = ''; this.reloj = 0; this.revision = 0;
    this.poner();
  }
  quitar() { for (const v of this.viajes) v.img.destroy(); this.viajes = []; }
  // Qué fábricas trabajan y con qué: si cambia, se rehacen las rutas.
  firmaActual() {
    const S = this.scene.S;
    if (!industriaActiva(S)) return '';
    const fab = S.map.map((x, i) => x.b === 'taller' && !x.ob ? i : -1).filter(i => i >= 0).map(i => { const P0 = produccionFabrica(S, i); return P0.encendida && P0.f > 0 ? `${i}${productoDe(S.map[i])}` : ''; }).filter(Boolean);
    if (!fab.length) return '';
    return [fab.join(','), listaCalles(S).length, eraCalle(S), S.map.filter(x => x.b === 'mercado' && !x.ob).length].join('|');
  }
  poner() {
    this.quitar();
    const firma = this.firmaActual(); this.firma = firma;
    if (!firma || reducirMovimiento()) return;
    const { S, T } = this.scene, N = T.N, M = N + 1;
    this.M = M; this.era = VEHICULO[eraCalle(S)] || 'herradura';
    const red = new Map();
    for (const k of listaCalles(S)) { const [a, b] = k.split('|').map(Number); (red.get(a) || red.set(a, []).get(a)).push(b); (red.get(b) || red.set(b, []).get(b)).push(a); }
    const esquinas = i => { const r = Math.floor(i / N), c = i % N; return [r * M + c, r * M + c + 1, (r + 1) * M + c, (r + 1) * M + c + 1].filter(e => red.has(e)); };
    // Camino más corto por la red (anchura primero) entre las esquinas de dos casillas.
    const ruta = (a, b) => {
      const O = esquinas(a), D = new Set(esquinas(b)); if (!O.length || !D.size) return null;
      const prev = new Map(O.map(o => [o, -1])), cola = [...O];
      while (cola.length) {
        const u = cola.shift();
        if (D.has(u)) { const L = [u]; while (prev.get(L[0]) !== -1) L.unshift(prev.get(L[0])); return L.length > 1 ? L : null; }
        for (const w of red.get(u) || []) if (!prev.has(w)) { prev.set(w, u); cola.push(w); }
      }
      return null;
    };
    const dist = (a, b) => Math.abs(Math.floor(a / N) - Math.floor(b / N)) + Math.abs(a % N - b % N);
    const cercana = (i, L) => L.slice().sort((a, b) => dist(i, a) - dist(i, b))[0];
    const mercados = S.map.map((x, i) => x.b === 'mercado' && !x.ob ? i : -1).filter(i => i >= 0), pz = plazaDe(S);
    const rutas = [];
    for (const parte of firma.split('|')[0].split(',')) {
      const i = parseInt(parte, 10), q = datosProducto(productoDe(S.map[i])).insumo;
      if (q && q.cultivo) { // de la finca a la fábrica
        const fincas = S.map.map((x, j) => x.b === 'cultivo' && !x.ob && cultivoDe(x) === q.cultivo && produce(S, x) ? j : -1).filter(j => j >= 0);
        const f = fincas.length ? cercana(i, fincas) : -1, L = f >= 0 ? ruta(f, i) : null; if (L) rutas.push(L);
      }
      const m = mercados.length ? cercana(i, mercados) : pz, L2 = m >= 0 ? ruta(i, m) : null; if (L2) rutas.push(L2); // de la fábrica al mercado
    }
    rutas.slice(0, MAXIMO).forEach((L, k) => {
      const img = this.scene.add.image(0, 0, 'vehiculos', `${this.era}_c_+_0_0`).setScale(1 / this.H.escala).setVisible(false);
      this.viajes.push({ L, pos: 0, vel: this.era === 'carretera' ? .55 : this.era === 'carreta' ? .24 : .3, descanso: 2 + k * 4 + Math.random() * 4, img, vi: k % 3 });
    });
  }
  update(dt) {
    this.revision += dt; if (this.revision > 3) { this.revision = 0; if (this.firmaActual() !== this.firma) this.poner(); }
    if (!this.viajes.length) return;
    this.reloj += dt;
    const paso = Math.floor(this.reloj * 6) % 4, { T } = this.scene, M = this.M, N = T.N;
    for (const v of this.viajes) {
      if (v.descanso > 0) { v.descanso -= dt; v.img.setVisible(false); continue; }
      const tramos = v.L.length - 1;
      v.pos += dt * v.vel;
      if (v.pos >= tramos) { v.pos = 0; v.L = [...v.L].reverse(); v.descanso = 4 + Math.random() * 6; v.img.setVisible(false); continue; } // descarga y vuelve
      const k = Math.floor(v.pos), u = v.pos - k, a = v.L[k], b = v.L[k + 1];
      const r1 = Math.floor(a / M), c1 = a % M, r2 = Math.floor(b / M), c2 = b % M, r = r1 + (r2 - r1) * u, c = c1 + (c2 - c1) * u;
      const p = P(r, c, T.hf(Math.min(N, r), Math.min(N, c))), eje = r1 === r2 ? 'c' : 'r', dir = (r2 - r1) + (c2 - c1) > 0 ? '+' : '-';
      const pa = this.era === 'carretera' ? 0 : paso, vi = this.era === 'herradura' ? v.vi : 0, key = `${this.era}_${eje}_${dir}_${pa}_${vi}`, m = this.H.marcos[key];
      if (!m) continue;
      v.img.setVisible(true).setFrame(key).setOrigin(m.ax / m.w, m.ay / m.h).setPosition(p[0], p[1]).setDepth(r + c + .03);
    }
  }
}
