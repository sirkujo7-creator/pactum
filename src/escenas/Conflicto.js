// El conflicto armado se ve en el mapa (animación de conflictos, tanda 2; tono intermedio y por inferencia, pedido de
// Juan). Mientras hay grupo armado: hombres armados rondan el campamento, un retén ilegal en el camino a la plaza
// (desde nivel 50), familias desplazadas que bajan con sus bultos (desde 45) y, muy alto, un muchacho que se llevan al
// monte (desde 60). La estrategia del gobierno también se ve: tropa y fogonazos (ofensiva), la mesa del diálogo con
// banderas blancas junto a la plaza (diálogo) o maestros que suben a las veredas (inversión social).
// Con «reducir movimiento» quedan solo las figuras quietas, el retén y la mesa.
import { P, alturaEn } from '../arte/iso.js';
import { hayGrupo, plazaFundacion } from '../core/index.js';
import { reducirMovimiento } from './pantalla.js';
import { ACCIONES } from '../arte/gente.js';

const ARMADO = 0x6B6A4E, OLIVA = 0x9FAE7A;

export class Conflicto {
  constructor(scene) { this.scene = scene; this.firma = ''; this.fijos = []; this.gente = []; this.t = 0; this.prox = { despl: 8, recluta: 25, fogon: 3 }; this.actualizar(); }
  quitarFijos() { for (const o of this.fijos) { o.img && o.img.destroy(); o.extra && o.extra.destroy(); } this.fijos = []; }
  quitarGente() { for (const a of this.gente) { a.img.destroy(); a.extra && a.extra.destroy(); } this.gente = []; }
  rc(i) { const N = this.scene.T.N; return { r: Math.floor(i / N) + .5, c: i % N + .5 }; }
  actualizar() {
    const S = this.scene.S, F = S.conf, activo = hayGrupo(S) && F.camp >= 0, ropa = this.scene.pob.ropa || '';
    const firma = activo ? [F.camp, Math.floor(F.nivel / 5), F.estrategia, ropa, plazaFundacion(S)].join('|') : '';
    if (firma === this.firma) return; this.firma = firma;
    this.quitarFijos(); if (!activo) { this.quitarGente(); return; }
    this.nivel = F.nivel; this.estrategia = F.estrategia;
    const camp = this.rc(F.camp), pz = plazaFundacion(S), plaza = pz >= 0 ? this.rc(pz) : camp;
    this.camp = camp; this.plaza = plaza;
    // Camino del monte a la plaza: el retén queda a un tercio y los desplazados lo recorren.
    const ruta = this.scene.pob.ruta({ ...camp, carril: 0 }, plaza) || [plaza];
    this.camino = ruta; const medio = ruta[Math.floor(ruta.length * .35)] || camp;
    // Los hombres armados rondan el campamento.
    for (let k = 0; k < 3; k++) this.fijos.push(this.figura('artesano', k, ARMADO, true, { r: camp.r + (k - 1) * .3 + .5, c: camp.c + .4, centro: camp, radio: 1.5 }));
    if (F.nivel >= 50) {
      const im = this.imagen('m_reten', medio.r, medio.c, .8); if (im) this.fijos.push({ img: im, fijo: true });
      for (let k = 0; k < 2; k++) this.fijos.push(this.figura('artesano', k + 1, ARMADO, true, { r: medio.r + .25 + k * .2, c: medio.c - .2 + k * .35, quieto: true, mira: plaza }));
    }
    if (F.estrategia === 'ofensiva') {
      const c0 = { r: camp.r + (plaza.r - camp.r) * .25, c: camp.c + (plaza.c - camp.c) * .25 };
      for (let k = 0; k < 4; k++) this.fijos.push(this.figura('artesano', k % 3, OLIVA, true, { r: c0.r + k * .2, c: c0.c - k * .15, centro: c0, radio: 1.3 }));
    }
    if (F.estrategia === 'dialogo') { const im = this.imagen('mesaPaz', plaza.r + 1.05, plaza.c - .55, .85); if (im) this.fijos.push({ img: im, fijo: true }); }
    if (F.estrategia === 'inversion') for (let k = 0; k < 2; k++) this.fijos.push(this.figura('elite', k, 0, false, { r: plaza.r + .6, c: plaza.c + .6 * k, va: [plaza, medio], tramo: k }));
    this.fijos.forEach(a => a.r !== undefined && this.dibujar(a));
  }
  imagen(k, r, c, s) {
    const H = this.scene.hojas.edificios, m = H.marcos[k]; if (!m) return null;
    const p = P(r, c, alturaEn(this.scene.T, r, c));
    return this.scene.add.image(p[0], p[1], 'edificios', k).setOrigin(m.ax / m.w, m.ay / m.h).setScale(s / H.escala).setDepth(r + c + .5);
  }
  figura(tipo, vi, tinte, fusil, o) {
    const H = this.scene.pob.H, ropa = this.scene.pob.ropa || '', f = `${tipo}${ropa}_${vi}_1_0`, m = H.marcos[f]; if (!m) return { r: o.r, c: o.c, img: null };
    const img = this.scene.add.image(0, 0, 'personas', f).setOrigin(m.ax / m.w, m.ay / m.h).setScale(.62 / H.escala);
    if (tinte) img.setTint(tinte);
    const extra = fusil && this.scene.textures.exists('cineFusil') ? this.scene.add.image(0, 0, 'cineFusil').setScale(.26).setOrigin(.5, .9).setAngle(-14) : null;
    return { tipo, vi, img, extra, ruta: [], vel: .4, fase: 0, frente: 1, voltear: false, espera: Math.random() * 3, meta: null, ...o };
  }
  dibujar(a, andando = false) {
    if (!a.img || a.fijo) return;
    const T = this.scene.T, ropa = this.scene.pob.ropa || '', p = P(a.r, a.c, alturaEn(T, a.r, a.c)), A = this.scene.pob.A;
    const N = a.acc && A && ACCIONES[a.tipo] && ACCIONES[a.tipo][a.acc], kA = N ? `${a.tipo}_${a.vi}_${a.acc}_${Math.floor(a.fase) % N}` : null;
    if (kA && A.marcos[kA] && this.scene.textures.exists('acciones')) { if (a.img.texture.key !== 'acciones') a.img.setTexture('acciones'); a.img.setFrame(kA); }
    else { const f = `${a.tipo}${ropa}_${a.vi}_${a.frente}_${andando ? Math.floor(a.fase) % 4 : 0}`; if (this.scene.pob.H.marcos[f]) a.img.setFrame(f); }
    a.img.setPosition(p[0], p[1]).setFlipX(a.voltear).setDepth(a.r + a.c + .02);
    if (a.extra) a.extra.setPosition(p[0] + (a.voltear ? -3 : 3), p[1] - 7).setFlipX(a.voltear).setDepth(a.r + a.c + .03);
  }
  // Mueve hacia el siguiente punto de la ruta; devuelve true si sigue andando.
  andar(a, dt) {
    const d0 = a.ruta[0]; if (!d0) return false;
    const dr = d0.r - a.r, dc = d0.c - a.c, d = Math.hypot(dr, dc);
    if (d < .04) { a.ruta.shift(); return a.ruta.length > 0; }
    const paso = Math.min(d, a.vel * dt); a.r += dr / d * paso; a.c += dc / d * paso; a.fase += paso * 13; a.frente = (dc + dr) >= 0 ? 1 : 0; a.voltear = (dc - dr) < 0;
    return true;
  }
  // Familias desplazadas y el muchacho que se llevan: caminan una vez y se van.
  caminantes(lista, desde, hasta) {
    const ruta = this.scene.pob.ruta({ ...desde, carril: 0 }, hasta) || [hasta];
    lista.forEach(([tipo, vi, tinte, fusil, acc], k) => {
      const a = this.figura(tipo, vi, tinte, fusil, { r: desde.r - k * .12, c: desde.c + k * .1, ruta: ruta.map(q => ({ r: q.r + k * .06, c: q.c - k * .05 })), vel: .3, acc, unaVez: true, espera: 0 });
      if (a.img) this.gente.push(a);
    });
  }
  update(dt) {
    if (!this.firma) return;
    this.t += dt;
    const quieto = reducirMovimiento();
    for (const a of this.fijos) {
      if (!a.img || a.fijo) continue;
      if (quieto || a.quieto) { if (a.mira) { a.frente = (a.mira.c - a.c + a.mira.r - a.r) >= 0 ? 1 : 0; a.voltear = (a.mira.c - a.c - (a.mira.r - a.r)) < 0; } this.dibujar(a); continue; }
      if (a.espera > 0) { a.espera -= dt; this.dibujar(a); continue; }
      if (a.va) { if (!a.ruta.length) { a.tramo = 1 - a.tramo; const d = a.va[a.tramo]; a.ruta = this.scene.pob.ruta({ r: a.r, c: a.c, carril: 0 }, d) || [d]; a.espera = 4 + Math.random() * 4; } this.dibujar(a, this.andar(a, dt)); continue; }
      if (!a.meta) { const an = Math.random() * 6.28, d = (.3 + Math.random() * .7) * a.radio; a.meta = { r: a.centro.r + Math.sin(an) * d, c: a.centro.c + Math.cos(an) * d }; a.ruta = [a.meta]; }
      if (!this.andar(a, dt)) { a.meta = null; a.espera = 2 + Math.random() * 3; }
      this.dibujar(a, !!a.meta);
    }
    if (quieto) { this.quitarGente(); return; }
    // Los que bajan y los que suben.
    this.gente = this.gente.filter(a => {
      if (this.andar(a, dt)) { this.dibujar(a, true); return true; }
      a.img.destroy(); a.extra && a.extra.destroy(); return false;
    });
    const P0 = this.prox;
    if (this.nivel >= 45 && this.t > P0.despl && this.gente.length < 10) {
      P0.despl = this.t + 22 + Math.random() * 16;
      this.caminantes([['campesino', Math.floor(this.t) % 3, 0, false, 'cargar'], ['campesina', 1, 0, false, 'cargar'], ['nino', 2, 0, false, null]], this.camp, this.plaza);
    }
    if (this.nivel >= 60 && this.t > P0.recluta && this.gente.length < 10) {
      P0.recluta = this.t + 45 + Math.random() * 20;
      const desde = { r: this.plaza.r + 1.2, c: this.plaza.c + 1.2 };
      this.caminantes([['artesano', 0, ARMADO, true, null], ['artesano', 2, 0, false, null]], desde, this.camp);
    }
    // Fogonazos lejanos de la ofensiva.
    if (this.estrategia === 'ofensiva' && this.t > P0.fogon) {
      P0.fogon = this.t + 3 + Math.random() * 5;
      const r = this.camp.r + (Math.random() - .5) * 1.6, c = this.camp.c + (Math.random() - .5) * 1.6, p = P(r, c, alturaEn(this.scene.T, r, c));
      const b = this.scene.add.circle(p[0], p[1] - 6, 3.2, 0xFFD27A, .95).setDepth(r + c + .5).setBlendMode('ADD');
      this.scene.tweens.add({ targets: b, alpha: 0, scale: 2, duration: 240, onComplete: () => b.destroy() });
    }
  }
}
