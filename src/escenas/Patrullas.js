// Policía y ejército que se ven (fase 16, punto 1): dos agentes de azul rondan cada estación de policía y tres soldados de
// verde oliva, cada cuartel. Si el ejército está en descontento (aviso de golpe), los soldados se juntan en la plaza.
// Con «reducir movimiento» quedan quietos junto a su edificio.
import { P, alturaEn } from '../arte/iso.js';
import { ejercitoActivo, ejercito, plazaFundacion } from '../core/index.js';
import { reducirMovimiento } from './pantalla.js';

const AZUL = 0x7F9FD6, OLIVA = 0x9FAE7A;

export class Patrullas {
  constructor(scene) { this.scene = scene; this.firma = ''; this.gente = []; this.actualizar(); }
  quitar() { this.gente.forEach(a => a.img.destroy()); this.gente = []; }
  actualizar() {
    const { S } = this.scene, N = this.scene.T.N, H = this.scene.pob.H, ropa = this.scene.pob.ropa || '';
    const obras = S.map.map((x, i) => (x.b === 'policia' || x.b === 'cuartel') && !x.ob ? i : -1).filter(i => i >= 0).slice(0, 4);
    const golpe = ejercitoActivo(S) && !!ejercito(S).aviso && obras.some(i => S.map[i].b === 'cuartel');
    const firma = obras.map(i => i + S.map[i].b).join(',') + '|' + golpe + '|' + ropa; if (firma === this.firma) return; this.firma = firma;
    this.quitar();
    const pla = plazaFundacion(S), base = pla >= 0 ? { r: Math.floor(pla / N) + .5, c: pla % N + .5 } : null;
    for (const i of obras) {
      const x = S.map[i], poli = x.b === 'policia', n = poli ? 2 : 3, c0 = { r: Math.floor(i / N) + .5, c: i % N + .5 };
      for (let k = 0; k < n; k++) {
        const vi = k % 3, f = `artesano${ropa}_${vi}_1_0`, m = H.marcos[f]; if (!m) continue;
        const img = this.scene.add.image(0, 0, 'personas', f).setOrigin(m.ax / m.w, m.ay / m.h).setScale(.62 / H.escala).setTint(poli ? AZUL : OLIVA);
        const rally = golpe && !poli && base;
        this.gente.push({ img, r: c0.r + (k - 1) * .3 + .8, c: c0.c + .8, centro: rally ? { r: base.r + 1.1, c: base.c + (k - 1) * .35 } : c0, radio: rally ? .5 : poli ? 3 : 2.2, vi, meta: null, espera: Math.random() * 3, fase: 0, frente: 1, voltear: false, andando: false });
      }
    }
    this.gente.forEach(a => this.dibujar(a));
  }
  dibujar(a) {
    const T = this.scene.T, ropa = this.scene.pob.ropa || '', p = P(a.r, a.c, alturaEn(T, a.r, a.c)), f = `artesano${ropa}_${a.vi}_${a.frente}_${a.andando ? Math.floor(a.fase) % 4 : 0}`;
    if (this.scene.pob.H.marcos[f]) a.img.setFrame(f);
    a.img.setPosition(p[0], p[1]).setFlipX(a.voltear).setDepth(a.r + a.c + .02);
  }
  update(dt) {
    const quieto = reducirMovimiento();
    for (const a of this.gente) {
      if (quieto) { a.andando = false; this.dibujar(a); continue; }
      if (a.espera > 0) { a.espera -= dt; a.andando = false; this.dibujar(a); continue; }
      if (!a.meta) { const ang = Math.random() * 6.28, d = (.4 + Math.random() * .6) * a.radio; a.meta = { r: a.centro.r + Math.sin(ang) * d, c: a.centro.c + Math.cos(ang) * d }; }
      const dr = a.meta.r - a.r, dc = a.meta.c - a.c, d = Math.hypot(dr, dc);
      if (d < .05) { a.meta = null; a.espera = 1.5 + Math.random() * 3; continue; }
      const paso = Math.min(d, .42 * dt); a.r += dr / d * paso; a.c += dc / d * paso; a.fase += paso * 13; a.andando = true; a.frente = (dc + dr) >= 0 ? 1 : 0; a.voltear = (dc - dr) < 0;
      this.dibujar(a);
    }
  }
}
