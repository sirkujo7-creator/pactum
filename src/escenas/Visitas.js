// El visitante extranjero caminando por el pueblo (fase 16, punto 5): el año que llega y el siguiente recorre la plaza y las
// casas con una banderita del color de su tierra. Con «reducir movimiento» se queda quieto en la plaza.
import { P, alturaEn } from '../arte/iso.js';
import { datosVisitante, plazaFundacion } from '../core/index.js';
import { reducirMovimiento } from './pantalla.js';

export class Visitas {
  constructor(scene) { this.scene = scene; this.v = null; this.id = null; this.actualizar(); }
  quitar() { if (this.v) { this.v.img.destroy(); this.v.bandera.destroy(); this.v.asta.destroy(); this.v = null; } this.id = null; }
  actualizar() {
    const { S, pob } = this.scene, e = S.visitante, vive = !!e && e.anio >= S.year - 1 && !!datosVisitante(e.id);
    if (!vive) { this.quitar(); return; }
    if (this.id === e.id) return;
    this.quitar(); this.id = e.id;
    const D = datosVisitante(e.id), H = pob.H, ropa = pob.ropa || '', k = `elite${ropa}_1_1_0`, m = H.marcos[k]; if (!m) return;
    const i = plazaFundacion(S), N = this.scene.T.N, base = i >= 0 ? { r: Math.floor(i / N) + .5, c: i % N + .5 } : { r: N / 2, c: N / 2 };
    const img = this.scene.add.image(0, 0, 'personas', k).setOrigin(m.ax / m.w, m.ay / m.h).setScale(.62 / H.escala);
    const col = parseInt(D.color.slice(1), 16), asta = this.scene.add.rectangle(0, 0, 1, 14, 0x3A2A1C), bandera = this.scene.add.rectangle(0, 0, 8, 5, col).setStrokeStyle(.6, 0x2A2118);
    this.v = { img, asta, bandera, r: base.r + .6, c: base.c + .6, meta: null, espera: 0, fase: 0, frente: 1, voltear: false, vi: 1, base };
    this.dibujar();
  }
  meta() {
    const { S } = this.scene, N = this.scene.T.N, casas = S.map.map((x, i) => x.b && !x.ob ? i : -1).filter(i => i >= 0);
    if (!casas.length) return this.v.base;
    const i = casas[Math.floor(Math.random() * casas.length)]; return { r: Math.floor(i / N) + .5 + (Math.random() - .5) * .8, c: i % N + .5 + .9 };
  }
  dibujar() {
    const v = this.v, T = this.scene.T, ropa = this.scene.pob.ropa || '', p = P(v.r, v.c, alturaEn(T, v.r, v.c)), paso = v.andando ? Math.floor(v.fase) % 4 : 0;
    const f = `elite${ropa}_${v.vi}_${v.frente}_${paso}`; if (this.scene.pob.H.marcos[f]) v.img.setFrame(f);
    v.img.setPosition(p[0], p[1]).setFlipX(v.voltear).setDepth(v.r + v.c + .02);
    const dx = v.voltear ? -6 : 6; v.asta.setPosition(p[0] + dx, p[1] - 12).setDepth(v.r + v.c + .03); v.bandera.setPosition(p[0] + dx + (v.voltear ? -4 : 4), p[1] - 17).setDepth(v.r + v.c + .031);
  }
  update(dt) {
    const v = this.v; if (!v) return;
    if (reducirMovimiento()) { v.andando = false; this.dibujar(); return; }
    if (v.espera > 0) { v.espera -= dt; v.andando = false; this.dibujar(); return; }
    if (!v.meta) v.meta = this.meta();
    const dr = v.meta.r - v.r, dc = v.meta.c - v.c, d = Math.hypot(dr, dc);
    if (d < .05) { v.meta = null; v.espera = 2 + Math.random() * 4; return; }
    const paso = Math.min(d, .5 * dt); v.r += dr / d * paso; v.c += dc / d * paso; v.fase += paso * 13; v.andando = true; v.frente = (dc + dr) >= 0 ? 1 : 0; v.voltear = (dc - dr) < 0;
    this.dibujar();
  }
}
