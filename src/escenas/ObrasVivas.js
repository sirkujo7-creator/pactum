// Obras vivas (fase visual, animación, paso 1; pedido de Juan: «edificios vivos»): las banderas de los edificios
// ondean con el viento y, de noche, las ventanas se encienden (unas sí y otras no, distintas en cada casa).
// Al hornear los edificios se anotan sus ventanas y sus banderas (edificios.js, CAPTURA en casas.js); aquí se
// pinta una hoja pequeña de luces con la misma forma de cada dibujo (1,5 píxeles por unidad: poca memoria) y se
// ponen las telas de las banderas como figuras aparte, con cuatro cuadros de ondeo.
import { lienzo, mulberry } from '../arte/acuarela.js';
import { reducirMovimiento } from './pantalla.js';

const Q = 1.5, CUADROS = 6;

export class ObrasVivas {
  constructor(scene) { this.scene = scene; this.porCasilla = {}; this.telas = new Set(); this.t = 0; this.nocheVista = -1; }

  // Hoja de luces de la noche con el mismo orden de figuras que la hoja de edificios.
  rehacer(H) {
    this.H = H; const tx = this.scene.textures;
    const claves = Object.keys(H.marcos).filter(k => H.marcos[k].ventanas), marcos = {};
    let x = 4, y = 4, fila = 0; const ancho = 2048;
    for (const k of claves) {
      const m = H.marcos[k], w = Math.ceil(m.w / H.escala * Q), h = Math.ceil(m.h / H.escala * Q);
      if (x + w > ancho) { x = 2; y += fila + 2; fila = 0; }
      marcos[k] = { x, y, w, h }; x += w + 4; fila = Math.max(fila, h);
    }
    const cv = lienzo(ancho, Math.max(4, y + fila + 2)), g = cv.getContext('2d');
    for (const k of claves) {
      const m = H.marcos[k], o = marcos[k], ax = o.x + m.ax / H.escala * Q, ay = o.y + m.ay / H.escala * Q, R = mulberry(k.length * 131 + k.charCodeAt(0));
      for (const quad of m.ventanas) {
        if (R() > .62) continue; // esta ventana está apagada
        const tono = R() < .25 ? '#FFE9B0' : '#FFC86A';
        const camino = () => { g.beginPath(); quad.forEach(([qx, qy], j) => { const X = ax + qx * Q, Y = ay + qy * Q; j ? g.lineTo(X, Y) : g.moveTo(X, Y); }); g.closePath(); };
        g.save(); g.shadowColor = 'rgba(255,190,90,.9)'; g.shadowBlur = 5; g.fillStyle = tono; g.globalAlpha = .95; camino(); g.fill(); g.restore(); // el vidrio encendido con su resplandor
        g.globalAlpha = .3; g.fillStyle = '#FFF6DC'; camino(); g.fill();
      }
    }
    g.globalAlpha = 1;
    if (tx.exists('lucesNoche')) tx.remove('lucesNoche');
    const t = tx.addCanvas('lucesNoche', cv);
    for (const [k, o] of Object.entries(marcos)) t.add(k, 0, o.x, o.y, o.w, o.h);
    this.marcosLuz = marcos;
  }

  // Tela de bandera con sus colores, en CUADROS cuadros de ondeo (se hornea una vez por combinación de colores).
  tela(cols) {
    const clave = 'tela-' + cols.join('').replace(/#/g, ''), tx = this.scene.textures;
    if (tx.exists(clave)) return clave;
    const W = 12, Hh = 8, E = 4, cv = lienzo(W * E * CUADROS, Hh * E), g = cv.getContext('2d');
    const fr = cols.length === 3 && cols[0] === '#E8C23A' ? [.5, .25, .25] : cols.map(() => 1 / cols.length);
    for (let f = 0; f < CUADROS; f++) {
      g.save(); g.translate(f * W * E, 0); g.scale(E, E);
      const ola = u => Math.sin(u * Math.PI * 1.7 - f / CUADROS * Math.PI * 2) * 1.1 * u, alto = 6;
      // Cada franja como tiras verticales, con luz y sombra según la pendiente de la ola.
      for (let s = 0; s < 18; s++) {
        const u0 = s / 18, u1 = (s + 1) / 18, d = ola(u1) - ola(u0), luz = -d * 3;
        let y0 = 1;
        cols.forEach((c, k) => { const hh = alto * fr[k]; g.fillStyle = c; g.globalAlpha = 1; g.beginPath(); g.moveTo(u0 * 10, y0 + ola(u0)); g.lineTo(u1 * 10 + .05, y0 + ola(u1)); g.lineTo(u1 * 10 + .05, y0 + hh + ola(u1)); g.lineTo(u0 * 10, y0 + hh + ola(u0)); g.closePath(); g.fill(); y0 += hh; });
        g.globalAlpha = Math.min(.35, Math.abs(luz)); g.fillStyle = luz > 0 ? '#FFFFFF' : '#000000'; g.beginPath(); g.moveTo(u0 * 10, 1 + ola(u0)); g.lineTo(u1 * 10 + .05, 1 + ola(u1)); g.lineTo(u1 * 10 + .05, 1 + alto + ola(u1)); g.lineTo(u0 * 10, 1 + alto + ola(u0)); g.closePath(); g.fill();
      }
      g.restore();
    }
    const t = tx.addCanvas(clave, cv);
    for (let f = 0; f < CUADROS; f++) t.add(f, 0, f * W * E, 0, W * E, Hh * E);
    return clave;
  }

  quitar(i) { for (const o of this.porCasilla[i] || []) { this.telas.delete(o); o.destroy(); } delete this.porCasilla[i]; }

  // Luces y banderas de una figura de edificio ya puesta en el mapa.
  agregar(img, k, i) {
    const H = this.H; if (!H) return;
    const m = H.marcos[k]; if (!m) return;
    const L = this.porCasilla[i] || (this.porCasilla[i] = []), sx = img.scaleX * H.escala, flip = img.flipX ? -1 : 1;
    if (this.marcosLuz && this.marcosLuz[k]) {
      const luz = this.scene.add.image(img.x, img.y, 'lucesNoche', k).setOrigin(img.originX, img.originY).setFlipX(img.flipX).setDepth(40000.5 + img.depth * 1e-4).setBlendMode('ADD').setAlpha(this.alpha || 0).setVisible((this.alpha || 0) > 0);
      luz.setDisplaySize(img.displayWidth, img.displayHeight); luz.setData('luz', 1); L.push(luz);
    }
    if (m.banderas && H.vivas) for (const b of m.banderas) {
      const clave = this.tela(b.cols), ancho = b.ancho * b.s * sx;
      const tela = this.scene.add.image(img.x + flip * b.x * sx, img.y + b.y * sx, clave, 0).setOrigin(flip > 0 ? 0 : 1, .125).setFlipX(flip < 0).setDepth(img.depth + .003);
      tela.setDisplaySize(ancho * 1.2, ancho * .8); tela.setData('fase', Math.random() * CUADROS); tela.setData('vel', 5 + Math.random() * 3);
      L.push(tela); this.telas.add(tela);
    }
  }

  update(dt, noche) {
    this.t += dt;
    if (!reducirMovimiento()) for (const t of this.telas) { const f = Math.floor(this.t * t.getData('vel') + t.getData('fase')) % CUADROS; if (f !== t.getData('f')) { t.setData('f', f); t.setFrame(f); } }
    const a = Math.round(noche * 20) / 20 * .85;
    if (a !== this.alpha) { this.alpha = a; for (const L of Object.values(this.porCasilla)) for (const o of L) if (o.getData('luz')) o.setAlpha(a).setVisible(a > 0); } // de día las luces no se dibujan
  }
}
