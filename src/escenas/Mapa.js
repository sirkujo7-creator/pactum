// Escena del mapa: el territorio en acuarela, sus obras y la cámara.
// Celular: arrastrar con un dedo, pellizcar con dos, tocar una casilla para ver su ficha o construir.
// Computador: arrastrar con el ratón, rueda para acercar, flechas para mover, + y − para el zoom, 0 para ver todo, B para construir, Esc para soltar.
import { genTerreno, build, undoBuild, demolish, whyNot, freeTiles, advance, choose, checkGuide, clamp, C } from '../core/index.js';
import { pintarSector, pintarFondo, caminoRio, sectoresAfectados, LADO_SECTOR } from '../arte/terreno.js';
import { hornearNaturaleza, colocarNaturaleza } from '../arte/naturaleza.js';
import { hornearEdificios, figurasDeObra } from '../arte/edificios.js';
import { pintarNiebla, lienzo } from '../arte/acuarela.js';
import { P, TW, casillaEn } from '../arte/iso.js';
import { DPR, tam, reducirMovimiento } from './pantalla.js';
import { partida, nuevaPartida } from './partida.js';
import { Interfaz } from './Interfaz.js';
import { Pobladores } from './Pobladores.js';
import { Efectos } from './Efectos.js';

const ZOOM_MAX = 3.6;
const PROF_FONDO = -3000, PROF_TERRENO = -2000, PROF_BRILLO = -900, PROF_POSIBLES = -850, PROF_MARCA = -800, PROF_NIEBLA = 50000;

export class Mapa extends Phaser.Scene {
  constructor() { super('Mapa'); }

  init(datos) { this.semilla = datos && datos.semilla; this.nueva = !!(datos && datos.nueva); this.opciones = (datos && datos.opciones) || {}; }

  async create() {
    const cam = this.cameras.main;
    cam.setOrigin(0, 0).setBackgroundColor('#ECEAE2');
    this.listo = false;
    this.ui = new Interfaz(this);
    this.events.once('shutdown', () => {
      this.ui.destruir();
      for (const k of ['fondo', ...Object.keys(this.sectores || {})]) if (this.textures.exists(k)) this.textures.remove(k);
    });
    this.ui.avisar('Pintando el territorio…');

    if (!partida.S || this.nueva) await nuevaPartida(this.semilla, this.opciones);
    this.S = partida.S;
    this.T = genTerreno(this.S.seed, this.S.n);
    this.escalaSector = DPR > 1.5 ? 1.6 : 1.4;
    this.dry = sequedad(this.S);
    this.vistaInicial();

    // Fondo lejano y sombra del diorama.
    const f = pintarFondo(this.T, .8);
    this.textures.addCanvas('fondo', f.canvas);
    this.add.image(f.x, f.y, 'fondo').setOrigin(0).setScale(1 / f.escala).setDepth(PROF_FONDO);
    const N = this.T.N, pie = P(N, N, -2.2);
    this.add.ellipse(pie[0], pie[1] + 16, N * TW * .9, 56, 0x3A3020, .12).setDepth(PROF_FONDO + 1);

    // Terreno por sectores, de atrás hacia adelante, repartido en varios cuadros para no congelar la pantalla.
    const n = Math.ceil(N / LADO_SECTOR), cola = [];
    for (let sr = 0; sr < n; sr++) for (let sc = 0; sc < n; sc++) cola.push([sr, sc]);
    cola.sort((a, b) => (a[0] + a[1]) - (b[0] + b[1]));
    this.sectores = {};
    const total = cola.length, t0 = performance.now();
    await new Promise(fin => {
      const paso = () => {
        const limite = performance.now() + 14;
        while (cola.length && performance.now() < limite) this.pintarSector(...cola.shift());
        this.ui.avisar(`Pintando el territorio… ${Math.round((1 - cola.length / total) * 100)}%`);
        if (cola.length) requestAnimationFrame(paso); else fin();
      };
      paso();
    });
    this.tiempoPintura = Math.round(performance.now() - t0);

    this.prepararHojas();
    this.plantas = {}; this.obras = {}; this.humos = {};
    for (let i = 0; i < N * N; i++) { this.ponerPlantas(i); this.ponerObra(i); }
    this.ponerVida();
    this.pob = new Pobladores(this);
    this.efectos = new Efectos(this);
    this.efectos.actualizar();
    this.posibles = this.add.graphics().setDepth(PROF_POSIBLES);
    this.marcaG = this.add.graphics().setDepth(PROF_MARCA);
    this.activarControles();
    this.ui.avisar('');
    this.ui.render();
    this.listo = true;
    // Al empezar: la bienvenida en una partida nueva, o el dilema pendiente si lo hay.
    if (this.nueva && this.opciones.bienvenida) this.ui.ayuda(true);
    else if (this.S.pend) this.ui.suceso(() => this.ui.render());
    this.etapaVista = this.S.stage; this.regVisto = this.S.reg;
    console.info(`Territorio ${N}×${N} pintado en ${this.tiempoPintura} ms`);
  }

  // ---------- Terreno ----------
  pintarSector(sr, sc) {
    const clave = `sector-${sr}-${sc}`, previo = this.sectores[clave];
    const s = pintarSector(this.T, sr, sc, { escala: this.escalaSector, mapa: this.S.map, dry: this.dry });
    if (previo) { previo.destroy(); this.textures.remove(clave); }
    this.textures.addCanvas(clave, s.canvas);
    this.sectores[clave] = this.add.image(s.x, s.y, clave).setOrigin(0).setScale(1 / s.escala).setDepth(PROF_TERRENO + (sr + sc) * .01);
  }

  // ---------- Figuras: naturaleza y edificios ----------
  prepararHojas() {
    const nat = hornearNaturaleza(this.dry), edi = hornearEdificios();
    for (const [clave, h] of [['naturaleza', nat], ['edificios', edi]]) {
      if (!this.textures.exists(clave)) {
        const tx = this.textures.addCanvas(clave, h.canvas);
        for (const [k, m] of Object.entries(h.marcos)) tx.add(k, 0, m.x, m.y, m.w, m.h);
      }
    }
    this.hojas = { naturaleza: nat, edificios: edi };
    this.plantasMundo = colocarNaturaleza(this.T, this.S.map.map(() => ({ t: 'bosque', b: null })));
    this.plantasPorCasilla = {};
    for (const o of this.plantasMundo) (this.plantasPorCasilla[o.i] = this.plantasPorCasilla[o.i] || []).push(o);
  }
  figura(hoja, k, r, c, h, s = 1) {
    const H = this.hojas[hoja], m = H.marcos[k], p = P(r, c, h);
    return this.add.image(p[0], p[1], hoja, k).setOrigin(m.ax / m.w, m.ay / m.h).setScale(s / H.escala).setDepth(r + c);
  }
  // Plantas de la casilla i: solo si está libre, y el bosque de niebla solo si no se ha talado.
  ponerPlantas(i) {
    (this.plantas[i] || []).forEach(p => p.destroy());
    const x = this.S.map[i], t = this.T.tiles[i];
    const libre = !x.b && !(t.b === 'niebla' && x.t !== 'bosque');
    this.plantas[i] = libre ? (this.plantasPorCasilla[i] || []).map(o => this.figura('naturaleza', o.k, o.r, o.c, this.T.hf(o.r, o.c), o.s)) : [];
  }
  ponerObra(i) {
    (this.obras[i] || []).forEach(p => p.destroy());
    if (this.humos[i]) { this.humos[i].destroy(); delete this.humos[i]; }
    const x = this.S.map[i];
    this.obras[i] = [];
    if (!x.b) return;
    const t = this.T.tiles[i], deSuelo = x.b === 'cultivo' || x.b === 'cafetal';
    for (const f of figurasDeObra(x.b, i, this.S.stage, this.S.reg)) {
      const r = t.r + .5 + (f.dv || 0), c = t.c + .5 + (f.du || 0), h = f.n || deSuelo ? this.T.hf(r, c) : t.h;
      const img = this.figura(f.n ? 'naturaleza' : 'edificios', f.k, r, c, h, f.s || 1);
      if (f.z) img.y -= f.z;
      img.setDepth(t.r + t.c + 1 + (f.dv || 0) + (f.du || 0));
      // El puerto y el molino miran hacia el río: si el agua está al lado derecho, se voltea el dibujo.
      if ((x.b === 'puerto' || x.b === 'molino') && this.rioADerecha(i)) img.setFlipX(true).setOrigin(1 - img.originX, img.originY);
      this.obras[i].push(img);
      if (f.humo && !reducirMovimiento()) {
        this.humos[i] = this.add.particles(img.x + f.humo[0], img.y + f.humo[1], 'edificios', {
          frame: 'humo', lifespan: 3400, speedX: { min: 2, max: 6 }, speedY: { min: -9, max: -6 }, scale: { start: .12, end: .45 },
          alpha: { start: .45, end: 0 }, frequency: 420, quantity: 1
        }).setDepth(t.r + t.c + 1.5);
      }
    }
  }
  rioADerecha(i) {
    const N = this.T.N, r = Math.floor(i / N), c = i % N, rio = (R, C) => R >= 0 && C >= 0 && R < N && C < N && this.S.map[R * N + C].t === 'rio';
    return !rio(r + 1, c) && (rio(r, c + 1) || rio(r - 1, c));
  }
  // Tras un cambio en la casilla i: plantas, figuras y solo los sectores del terreno afectados.
  refrescarCasilla(i) {
    this.ponerPlantas(i); this.ponerObra(i);
    for (const [sr, sc] of sectoresAfectados(this.T, i)) this.pintarSector(sr, sc);
    this.revisarCambiosGenerales();
    if (this.pob) this.pob.planear();
  }
  // Si cambian la etapa o el régimen, cambian las casas, los mercados y la sede.
  revisarCambiosGenerales() {
    if (this.S.stage === this.etapaVista && this.S.reg === this.regVisto) return;
    this.etapaVista = this.S.stage; this.regVisto = this.S.reg;
    this.S.map.forEach((x, i) => { if (['casa', 'mercado', 'agora'].includes(x.b)) this.ponerObra(i); });
  }

  // ---------- Construir ----------
  marcarPosibles(k) {
    this.posibles.clear();
    if (!k) return;
    this.posibles.fillStyle(0xF2C94C, .16).lineStyle(1, 0xF2C94C, .55);
    for (const i of freeTiles(this.S, k)) {
      const t = this.T.tiles[i], q = [P(t.r + .08, t.c + .08, t.h00), P(t.r + .08, t.c + .92, t.h01), P(t.r + .92, t.c + .92, t.h11), P(t.r + .92, t.c + .08, t.h10)].map(p => ({ x: p[0], y: p[1] }));
      this.posibles.fillPoints(q, true).strokePoints(q, true);
    }
  }
  construir(k, i) {
    const antes = this.S.map[i].b, r = build(this.S, k, i);
    if (this.S.map[i].b !== k || antes === k) { this.ui.toast(typeof r === 'string' ? r : 'No se puede construir ahí.'); return; }
    this.refrescarCasilla(i);
    const guia = checkGuide(this.S);
    if (typeof r === 'string' || guia) this.ui.toast([typeof r === 'string' ? r : '', guia || ''].join(' ').trim());
    this.marcarPosibles(this.ui.herramienta);
    this.ui.render();
  }
  deshacer() {
    const u = undoBuild(this.S);
    if (!u) return;
    this.refrescarCasilla(u.i);
    this.marcarPosibles(this.ui.herramienta);
    this.ui.render();
    this.ui.toast(`Deshiciste: ${C.B[u.k].n.toLowerCase()} (+${u.paid} oro).`);
  }
  demoler(i) {
    const k = this.S.map[i].b, g = demolish(this.S, i);
    this.refrescarCasilla(i);
    this.ui.cerrarFicha(); this.ui.render();
    this.ui.toast(`Demoliste ${C.B[k].a}: recuperaste ${g} de oro.`);
  }
  otroTerritorio() { this.scene.restart({ nueva: true, semilla: Math.floor(Math.random() * 899999) + 100000 }); }

  // ---------- Fin de año (como en la v9) ----------
  terminarAnio() {
    const S = this.S;
    if (!this.listo || S.pend || S.over || this.ui.hayTarjeta() || this.cerrandoAnio) return;
    this.ui.cerrarHojas(); this.ui.cerrarFicha();
    const g0 = S.gold, p0 = S.pop, f0 = S.food, t0 = S.tr;
    const r = advance(S);
    const dg = Math.round(S.gold - g0), dp = S.pop - p0, hunger = !!(S.log[0] && S.log[0].t.includes('hambre'));
    const sg = v => (v >= 0 ? '+' : '−') + Math.abs(v);
    this.ui.pasoDelAnio('Año ' + S.year, `Oro ${sg(dg)}   ·   Habitantes ${sg(dp)}`);
    this.efectos.cierre({ dg, dp, df: S.food - f0, hunger, bad: dg < 0 || hunger || S.tr < t0 - 5 || !!S.regChange });
    this.cerrandoAnio = true;
    this.ui.bFin.disabled = true;
    const guia = r.end ? null : checkGuide(S);
    if (guia) this.ui.toast(guia);
    // Reloj del navegador (no el de Phaser, que se atrasa si el aparato va lento).
    setTimeout(() => {
      if (!this.sys.isActive()) return;
      this.cerrandoAnio = false;
      this.cambio(true);
      if (r.end) { S.over = true; this.ui.render(); this.ui.final(r.end); return; }
      const fin = () => this.ui.render();
      const sigue = () => { if (r.stageUp) this.ui.etapa(() => this.ui.suceso(fin)); else this.ui.suceso(fin); };
      if (S.regChange) this.ui.cambioRegimen(S.regChange, sigue); else sigue();
    }, reducirMovimiento() ? 900 : 1900);
  }
  elegirOpcion(i) { const o = choose(this.S, i); this.cambio(true); return o; }
  // Tras cualquier cambio: interfaz, figuras que dependen de etapa y régimen, pobladores, huellas y sequía.
  cambio(completo) {
    this.ui.render();
    if (!completo) return;
    this.revisarCambiosGenerales();
    this.pob.planear();
    this.efectos.actualizar();
    const d = sequedad(this.S);
    if (Math.abs(d - this.dry) >= .15) this.repintarTodo(d);
  }
  // El paisaje se seca o reverdece según el ambiente: se repinta poco a poco, un sector por cuadro.
  repintarTodo(d) {
    this.dry = d;
    const nat = hornearNaturaleza(d), tx = this.textures.get('naturaleza'), cv = tx.getSourceImage(), g = cv.getContext('2d');
    g.clearRect(0, 0, cv.width, cv.height); g.drawImage(nat.canvas, 0, 0); tx.refresh();
    const cola = Object.keys(this.sectores).map(k => k.split('-').slice(1).map(Number));
    const paso = () => { if (!this.sys.isActive()) return; const x = cola.shift(); if (x) { this.pintarSector(...x); requestAnimationFrame(paso); } };
    paso();
  }

  // ---------- Vida: brillo del río, niebla y sombras de nubes ----------
  ponerVida() {
    const quieto = reducirMovimiento();
    this.rio = caminoRio(this.T).filter(x => x.r >= 0 && x.c >= 0 && x.r <= this.T.N && x.c <= this.T.N).map(x => x.p);
    this.largoRio = [0];
    for (let i = 1; i < this.rio.length; i++) this.largoRio.push(this.largoRio[i - 1] + Math.hypot(this.rio[i][0] - this.rio[i - 1][0], this.rio[i][1] - this.rio[i - 1][1]));
    this.brillo = this.add.graphics().setDepth(PROF_BRILLO);

    if (!this.textures.exists('bancoNiebla')) this.textures.addCanvas('bancoNiebla', pintarNiebla());
    const altos = this.T.tiles.filter(t => t.b === 'niebla').filter((t, i) => i % 5 === 0);
    this.nieblas = altos.map((t, i) => {
      const p = P(t.r + .5, t.c + .5, t.h + 1.6);
      const img = this.add.image(p[0], p[1], 'bancoNiebla').setDisplaySize(150, 34).setAlpha(.32).setDepth(PROF_NIEBLA);
      if (!quieto) this.tweens.add({ targets: img, x: p[0] + 16, alpha: .2, duration: 7000 + (i % 5) * 1300, yoyo: true, repeat: -1, ease: 'Sine.inOut', delay: i * 170 });
      return img;
    });

    if (!this.textures.exists('sombraNube')) {
      const c = lienzo(256, 96), g = c.getContext('2d'), gr = g.createRadialGradient(128, 48, 0, 128, 48, 48);
      gr.addColorStop(0, 'rgba(29,42,48,1)'); gr.addColorStop(1, 'rgba(29,42,48,0)');
      g.setTransform(2.6, 0, 0, 1, -128 * 1.6, 0); g.fillStyle = gr; g.fillRect(0, 0, 256, 96);
      this.textures.addCanvas('sombraNube', c);
    }
    const izq = P(this.T.N, 0)[0] - 300, ancho = P(0, this.T.N)[0] - izq + 600;
    this.nubes = quieto ? [] : [0, 1, 2].map(k => this.add.image(0, P(0, 0)[1] + 200 + k * this.T.N * 6, 'sombraNube')
      .setDisplaySize(360, 100).setAlpha(.07).setDepth(PROF_NIEBLA + 1).setData({ izq, ancho, fase: k * 560 }));
  }

  update(tiempo, delta) {
    if (!this.listo) return;
    this.pob.update(Math.min(.05, delta / 1000));
    this.efectos.update(Math.min(.05, delta / 1000));
    const s = tiempo / 1000, quieto = reducirMovimiento();
    const g = this.brillo; g.clear();
    const total = this.largoRio[this.largoRio.length - 1];
    if (total > 0) {
      for (const [des, dy, dx, al] of [[quieto ? 0 : s * 14, -1, 0, .55], [quieto ? 13 : s * 10 + 13, 3, -5, .3]]) {
        g.lineStyle(1.3, 0xF2FAFC, al);
        for (let d = des % 32; d < total; d += 32) this.trazo(g, d, d + 6, dx, dy);
      }
    }
    for (const n of this.nubes) { const { izq, ancho, fase } = n.data.values; n.x = izq + ((s * 7 + fase) % ancho); }
  }
  trazo(g, a, b, dx, dy) {
    const L = this.largoRio, R = this.rio, pos = d => {
      let i = 1; while (i < L.length - 1 && L[i] < d) i++;
      const f = (d - L[i - 1]) / Math.max(1e-6, L[i] - L[i - 1]);
      return [R[i - 1][0] + (R[i][0] - R[i - 1][0]) * f + dx, R[i - 1][1] + (R[i][1] - R[i - 1][1]) * f + dy];
    };
    const p = pos(a), q = pos(Math.min(b, L[L.length - 1]));
    g.lineBetween(p[0], p[1], q[0], q[1]);
  }

  // ---------- Cámara ----------
  limitesMundo() {
    const N = this.T.N, iz = P(N, 0)[0], de = P(0, N)[0], ar = P(0, 0, 12)[1] - 120, ab = P(N, N, -2.2)[1] + 40;
    return { iz, de, ar, ab, w: de - iz, h: ab - ar };
  }
  zoomMin() { const { w, h } = tam(this), L = this.limitesMundo(); return Math.min(w / L.w, h / L.h) * .8; }
  encuadrar() {
    const { w, h } = tam(this), L = this.limitesMundo(), s = Math.min(w / L.w, h / L.h) * .96;
    this.fijarCamara(s, (L.iz + L.de) / 2, (L.ar + L.ab) / 2);
  }
  // Centro del poblado: promedio de las obras (sin contar minas), o el centro del mapa si no hay ninguna.
  aldea() {
    let r = 0, c = 0, n = 0;
    this.S.map.forEach((x, i) => { if (x.b && x.b !== 'mina') { r += this.T.tiles[i].r; c += this.T.tiles[i].c; n++; } });
    if (!n) { r = c = this.T.N / 2 - .5; n = 1; }
    r = r / n + .5; c = c / n + .5;
    return P(r, c, this.T.hf(r, c));
  }
  // En computador se ve todo el diorama; en celular vertical, más cerca y centrado en la aldea.
  vistaInicial() {
    const { w, h } = tam(this);
    if (w >= 700 || w > h) return this.encuadrar();
    const L = this.limitesMundo(), p = this.aldea();
    this.fijarCamara(Math.min(ZOOM_MAX, w / L.w * 1.8), p[0], p[1] - 40);
  }
  enfocarAldea() { const p = this.aldea(), { w } = tam(this); this.fijarCamara(Math.min(ZOOM_MAX, Math.max(w / 520, 1.4)), p[0], p[1]); }
  fijarCamara(s, x, y) {
    const cam = this.cameras.main, { w, h } = tam(this);
    this.escala = s; cam.setZoom(s * DPR);
    cam.scrollX = x - w / 2 / s; cam.scrollY = y - h / 2 / s;
    this.limitarCamara();
  }
  centro() { const cam = this.cameras.main, { w, h } = tam(this); return [cam.scrollX + w / 2 / this.escala, cam.scrollY + h / 2 / this.escala]; }
  limitarCamara() {
    const cam = this.cameras.main, L = this.limitesMundo(), { w, h } = tam(this), vw = w / this.escala, vh = h / this.escala;
    cam.scrollX = Phaser.Math.Clamp(cam.scrollX, L.iz - vw * .6, L.de - vw * .4);
    cam.scrollY = Phaser.Math.Clamp(cam.scrollY, L.ar - vh * .6, L.ab - vh * .4);
  }
  zoomEn(f, px, py) {
    const cam = this.cameras.main, s0 = this.escala, s1 = Phaser.Math.Clamp(s0 * f, this.zoomMin(), ZOOM_MAX);
    const wx = cam.scrollX + px / s0, wy = cam.scrollY + py / s0;
    this.escala = s1; cam.setZoom(s1 * DPR);
    cam.scrollX = wx - px / s1; cam.scrollY = wy - py / s1;
    this.limitarCamara();
  }
  zoomCentro(f) { const { w, h } = tam(this); this.zoomEn(f, w / 2, h / 2); }
  mover(dx, dy) { const cam = this.cameras.main; cam.scrollX -= dx / this.escala; cam.scrollY -= dy / this.escala; this.limitarCamara(); }

  activarControles() {
    const dedos = new Map();
    let arrastre = null, pellizco = null;
    const pos = p => [p.x / DPR, p.y / DPR];
    this.input.on('pointerdown', p => {
      dedos.set(p.id, pos(p));
      if (dedos.size === 1) arrastre = { ultimo: pos(p), inicio: pos(p), t: p.downTime, lejos: 0 };
      if (dedos.size === 2) { const [a, b] = [...dedos.values()]; pellizco = { d: Math.hypot(a[0] - b[0], a[1] - b[1]) }; arrastre = null; }
    });
    this.input.on('pointermove', p => {
      if (!dedos.has(p.id) || !p.isDown) return;
      dedos.set(p.id, pos(p));
      if (dedos.size === 2 && pellizco) {
        const [a, b] = [...dedos.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]);
        this.zoomEn(d / pellizco.d, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2); pellizco.d = d;
        return;
      }
      if (arrastre) {
        const q = pos(p);
        arrastre.lejos = Math.max(arrastre.lejos, Math.hypot(q[0] - arrastre.inicio[0], q[1] - arrastre.inicio[1]));
        if (arrastre.lejos > 6) this.mover(q[0] - arrastre.ultimo[0], q[1] - arrastre.ultimo[1]);
        arrastre.ultimo = q;
      }
    });
    const soltar = p => {
      if (arrastre && dedos.size === 1 && arrastre.lejos <= 6 && p.upTime - arrastre.t < 600) this.tocar(...pos(p));
      dedos.delete(p.id);
      if (dedos.size < 2) pellizco = null;
      if (!dedos.size) arrastre = null;
    };
    this.input.on('pointerup', soltar);
    this.input.on('pointerupoutside', soltar);
    this.input.on('wheel', (p, objs, dx, dy) => this.zoomEn(dy < 0 ? 1.12 : 1 / 1.12, ...pos(p)));

    const teclas = e => {
      // En campos de texto no hay atajos. En botones, la barra espaciadora solo termina el año si el
      // botón es de la barra inferior (así no se roba la tecla a quien navega con el teclado por las tarjetas).
      if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName) && e.key !== 'Escape') return;
      if (e.target && e.target.tagName === 'BUTTON' && e.key !== 'Escape' && !(e.key === ' ' && e.target.closest('.dock'))) return;
      const paso = 60;
      const acciones = {
        ArrowLeft: () => this.mover(paso, 0), ArrowRight: () => this.mover(-paso, 0), ArrowUp: () => this.mover(0, paso), ArrowDown: () => this.mover(0, -paso),
        a: () => this.mover(paso, 0), d: () => this.mover(-paso, 0), w: () => this.mover(0, paso), s: () => this.mover(0, -paso),
        '+': () => this.zoomCentro(1.25), '=': () => this.zoomCentro(1.25), '-': () => this.zoomCentro(1 / 1.25),
        '0': () => this.encuadrar(), b: () => this.ui.alternarHoja('construir'),
        '1': () => this.ui.alternarHoja('construir'), '2': () => this.ui.alternarHoja('hacienda'), '3': () => this.ui.alternarHoja('sociedad'),
        '4': () => this.ui.alternarHoja('leyes'), '5': () => this.ui.alternarHoja('cronica'), ' ': () => this.terminarAnio(),
        Escape: () => { if (this.ui.herramienta) this.ui.elegir(null); else if (this.ui.hojaAbierta()) this.ui.cerrarHojas(); else this.ui.cerrarFicha(); }
      };
      if (this.ui.hayTarjeta()) { if (e.key === 'Escape' && this.ui.tarjetaCerrable) this.ui.cerrarTarjeta(); return; }
      const f = acciones[e.key];
      if (f) { f(); e.preventDefault(); }
    };
    window.addEventListener('keydown', teclas);
    this.scale.on('resize', this.alRedimensionar, this);
    this.events.once('shutdown', () => { window.removeEventListener('keydown', teclas); this.scale.off('resize', this.alRedimensionar, this); });
  }
  alRedimensionar() { const [x, y] = this.centro(); this.fijarCamara(Phaser.Math.Clamp(this.escala, this.zoomMin(), ZOOM_MAX), x, y); }

  // Un toque: con una obra elegida, construye; si no, abre la ficha de la casilla.
  tocar(px, py) {
    const cam = this.cameras.main, t = casillaEn(this.T, cam.scrollX + px / this.escala, cam.scrollY + py / this.escala);
    if (!t) { this.ui.cerrarFicha(); return; }
    const i = t.r * this.T.N + t.c, k = this.ui.herramienta;
    if (k && !this.S.over) { this.construir(k, i); return; }
    if (this.ui.hojaAbierta()) { this.ui.cerrarHojas(); return; }
    const f = this.pob.cercana(cam.scrollX + px / this.escala, cam.scrollY + py / this.escala);
    if (f) { this.marcar(null); this.ui.abrirPersona(f.p); return; }
    this.marcar(i);
    this.ui.abrirFicha(i);
  }
  marcar(i) {
    if (!this.marcaG) return;
    this.marcaG.clear();
    if (i === null || i === undefined) return;
    const t = this.T.tiles[i], q = [P(t.r, t.c, t.h00), P(t.r, t.c + 1, t.h01), P(t.r + 1, t.c + 1, t.h11), P(t.r + 1, t.c, t.h10)].map(p => ({ x: p[0], y: p[1] }));
    this.marcaG.lineStyle(2, 0xF2C94C, .95).fillStyle(0xF2C94C, .18).fillPoints(q, true).strokePoints(q, true);
  }
}

// Sequedad del paisaje según el ambiente (como en la v9): 0 verde, 1 seco.
function sequedad(S) { return Math.round(clamp((58 - S.env) / 48, 0, 1) * 10) / 10; }
