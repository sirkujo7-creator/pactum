// Eventos de cine (fase 9): antes de la tarjeta de un suceso grande, una escena corta. La cámara viaja al lugar,
// bajan franjas de cine con un texto y se ve lo que pasa: marchas, procesiones, escándalos, desplazados, tomas
// armadas, terremotos, lahares y avenidas. Solo muestra lo que ya ocurrió en la lógica (no cambia el balance).
// Dura unos diez segundos y se queda en pantalla hasta tocar «Continuar» (o Esc, Enter, barra espaciadora). Con "reducir movimiento" no hay escena.
import { C, plaza, clamp, casillasBorde, bordes } from '../core/index.js';
import { P } from '../arte/iso.js';
import { lienzo } from '../arte/acuarela.js';
import { FR } from '../arte/fresco.js';
import { capaUI, el, tam, reducirMovimiento } from './pantalla.js';

const TIPOS = ['campesino', 'campesina', 'artesano', 'elite', 'nino'];
const suave = t => t * t * (3 - 2 * t);

export class Cine {
  constructor(scene) {
    this.scene = scene;
    this.activo = false;
    this.actores = []; this.objetos = []; this.caminantes = [];
    this.texturas();
  }
  // Pancarta, papel y vela, pintadas una vez.
  texturas() {
    const tx = this.scene.textures;
    if (!tx.exists('cinePancarta')) {
      const c = lienzo(48, 64), g = c.getContext('2d');
      g.strokeStyle = FR.siena; g.lineWidth = 3; g.beginPath(); g.moveTo(8, 6); g.lineTo(8, 62); g.moveTo(40, 6); g.lineTo(40, 62); g.stroke();
      g.fillStyle = FR.cal; g.fillRect(4, 6, 40, 24); g.fillStyle = FR.rojo; g.fillRect(4, 6, 40, 7); g.fillRect(4, 24, 40, 6);
      g.fillStyle = FR.siena; for (let k = 0; k < 4; k++) g.fillRect(9 + k * 8, 16, 5, 3);
      tx.addCanvas('cinePancarta', c);
    }
    if (!tx.exists('cinePapel')) { const c = lienzo(10, 12), g = c.getContext('2d'); g.fillStyle = FR.cal; g.fillRect(0, 0, 10, 12); g.fillStyle = '#9A8E7E'; for (let k = 0; k < 4; k++) g.fillRect(2, 2 + k * 2.5, 6, 1); tx.addCanvas('cinePapel', c); }
    if (!tx.exists('cineBandera')) { const c = lienzo(40, 64), g = c.getContext('2d'); g.strokeStyle = FR.siena; g.lineWidth = 3; g.beginPath(); g.moveTo(6, 4); g.lineTo(6, 62); g.stroke(); g.fillStyle = FR.cal; g.beginPath(); g.moveTo(7, 6); g.quadraticCurveTo(22, 2, 36, 8); g.lineTo(36, 26); g.quadraticCurveTo(22, 20, 7, 26); g.fill(); tx.addCanvas('cineBandera', c); }
    if (!tx.exists('cineFusil')) { const c = lienzo(8, 44), g = c.getContext('2d'); g.strokeStyle = '#3A2E26'; g.lineWidth = 3; g.beginPath(); g.moveTo(4, 2); g.lineTo(4, 42); g.stroke(); g.fillStyle = '#C9C2B4'; g.fillRect(2.5, 0, 3, 6); tx.addCanvas('cineFusil', c); }
    if (!tx.exists('cineVela')) { const c = lienzo(16, 16), g = c.getContext('2d'), gr = g.createRadialGradient(8, 8, 0, 8, 8, 8); gr.addColorStop(0, 'rgba(255,226,140,1)'); gr.addColorStop(1, 'rgba(255,190,90,0)'); g.fillStyle = gr; g.fillRect(0, 0, 16, 16); tx.addCanvas('cineVela', c); }
  }

  // ---------- Lugares ----------
  T() { return this.scene.T; }
  punto(r, c) { const T = this.T(), N = T.N; return P(r, c, T.hf(clamp(r, 0, N - .01), clamp(c, 0, N - .01))); }
  plazaRC() { const S = this.scene.S, N = this.T().N, g = this.scene.pob && this.scene.pob.grupos[0]; if (g) return { r: g.r, c: g.c }; const i = plaza(S); return i >= 0 ? { r: Math.floor(i / N) + .5, c: i % N + .5 } : { r: N / 2, c: N / 2 }; }
  // Casilla caminable a cierta distancia de la plaza (de donde llega la marcha).
  origen(dist, R = Math.random) {
    const pob = this.scene.pob, N = this.T().N, G = pob.G, p = this.plazaRC(), L = [];
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
      const d = Math.max(Math.abs(r + .5 - p.r), Math.abs(c + .5 - p.c));
      if (d >= dist - .5 && d <= dist + .5 && isFinite(pob.costo[(2 * r + 1) * G + 2 * c + 1])) L.push({ r: r + .5, c: c + .5 });
    }
    return L.length ? L[Math.floor(R() * L.length)] : { r: clamp(p.r + dist, .5, N - .5), c: p.c };
  }

  // ---------- La escena ----------
  // tipo: clave de cine.json; datos: lo que necesita la escena; luego: qué hacer al terminar (la tarjeta).
  jugar(tipo, datos, luego) {
    const K = C.CINE;
    if (!K || !K.escenas[tipo] || reducirMovimiento() || this.activo || !this.scene.listo) { luego(); return; }
    this.activo = true; this.luego = luego; this.t = 0; this.tipo = tipo; this.datos = datos || {};
    this.dur = K.duracion; this.inicio = performance.now();
    const texto = (this.datos.texto || K.escenas[tipo].texto).replace('{movimiento}', this.datos.movimiento || 'El movimiento').replace('{lider}', this.datos.lider || 'El líder').replace('{vecino}', this.datos.vecino || 'el vecino');
    // Franjas de cine con el texto; un toque las salta.
    const capa = capaUI();
    // La escena no se va sola: al acabar se queda quieta en pantalla hasta que se toca «Continuar».
    this.fin = false;
    this.boton = el('button', { class: 'cine-boton', type: 'button', text: K.saltar, on: { click: e => { e.stopPropagation(); this.terminar(); } } });
    this.velo = el('div', { class: 'cine vivo', role: 'dialog', 'aria-label': texto }, [
      el('div', { class: 'cine-franja arriba' }, [el('h2', { text: this.datos.titulo || K.escenas[tipo].titulo || '' })]),
      el('div', { class: 'cine-franja abajo' }, [el('p', { text: texto }), this.boton])
    ]);
    capa.append(this.velo); capa.classList.add('en-cine'); // la interfaz se esconde durante la escena
    requestAnimationFrame(() => this.velo && this.velo.classList.add('on'));
    // Cámara: viaja al lugar en un segundo y se acerca.
    const sc = this.scene, { w } = tam(sc), [x0, y0] = sc.centro(), s0 = sc.escala;
    const gente = !['terremoto', 'lahar', 'avenida'].includes(tipo), destino = this.montar(tipo), s1 = gente ? 2.5 : Math.min(2.6, Math.max(s0, w < 600 ? 1.9 : 1.6));
    this.camara = { x0, y0, s0, x1: destino[0], y1: destino[1], s1 };
  }
  // Prepara los actores de cada escena y devuelve el punto del mundo que mira la cámara.
  montar(tipo) {
    const sc = this.scene, S = sc.S, p = this.plazaRC(), pz = this.punto(p.r, p.c);
    if (tipo === 'marcha' || tipo === 'marchaLider' || tipo === 'procesion' || tipo === 'desplazados') {
      const o = this.origen(tipo === 'desplazados' ? 4 : 3), n = tipo === 'desplazados' ? 9 : 14, vel = tipo === 'procesion' ? .38 : tipo === 'desplazados' ? .34 : .55;
      const ruta = sc.pob.ruta({ r: o.r, c: o.c, carril: 0 }, p) || [p];
      for (let k = 0; k < n; k++) {
        const tipoP = tipo === 'procesion' && k === 0 ? 'elite' : tipo === 'desplazados' && k % 4 === 3 ? 'nino' : TIPOS[(k * 3 + 1) % 4];
        const a = this.caminante(tipoP, k % 3, o, ruta, vel, k * (tipo === 'procesion' ? .55 : .4));
        if ((tipo === 'marcha' || tipo === 'marchaLider') && k % 3 === 1) a.extra = sc.add.image(0, 0, 'cinePancarta').setScale(.3).setOrigin(.5, 1);
        if (tipo === 'procesion' && k > 0) a.extra = sc.add.image(0, 0, 'cineVela').setScale(.55).setBlendMode('ADD');
      }
      const q = this.punto((o.r + p.r) / 2, (o.c + p.c) / 2);
      return [q[0], q[1] - 10];
    }
    if (tipo === 'asedio') {
      // La invasión: una columna del vecino (de verde oliva, con su estandarte) cruza el borde y marcha hacia las casas
      // más cercanas; allí empiezan los fogonazos y el humo. La cámara sigue a la tropa.
      const N = this.T().N, L = casillasBorde(S, this.datos.id || 'altamira'), b = L.length ? L[0] : plaza(S), o0 = { r: Math.floor(b / N) + .5, c: b % N + .5 };
      const casas = S.map.map((x, i) => x.b && !x.ob ? i : -1).filter(i => i >= 0).sort((a, z) => Math.hypot(Math.floor(a / N) + .5 - o0.r, a % N + .5 - o0.c) - Math.hypot(Math.floor(z / N) + .5 - o0.r, z % N + .5 - o0.c));
      const blanco = casas.length ? { r: Math.floor(casas[0] / N) + .5, c: casas[0] % N + .5 } : p;
      // Dirección de la marcha: hacia las casas; si están pegadas al borde, hacia adentro del territorio.
      const lado = bordes(S)[this.datos.id || 'altamira'], n = { r0: [1, 0], rN: [-1, 0], c0: [0, 1], cN: [0, -1] }[lado] || [1, 0];
      let D = Math.hypot(blanco.r - o0.r, blanco.c - o0.c), ur = D > 2 ? (blanco.r - o0.r) / D : n[0], uc = D > 2 ? (blanco.c - o0.c) / D : n[1];
      if (D <= 2) D = 2;
      // Si el borde queda lejos, la columna ya viene a cinco casillas y media del pueblo.
      const dentro = q => ({ r: clamp(q.r, .6, N - .6), c: clamp(q.c, .6, N - .6) }), ini = dentro(D > 5.5 ? { r: blanco.r - ur * 5.5, c: blanco.c - uc * 5.5 } : o0), hacia = dentro(D > 2.5 ? { r: blanco.r - ur * .9, c: blanco.c - uc * .9 } : { r: ini.r + ur * 2.2, c: ini.c + uc * 2.2 });
      const pr = -uc, pc = ur; // perpendicular: el ancho de la columna
      for (let k = 0; k < 18; k++) {
        const fila = Math.floor(k / 3), col = k % 3 - 1, at = -fila * .32, lat = col * .3;
        const de = dentro({ r: ini.r + ur * at + pr * lat, c: ini.c + uc * at + pc * lat }), w = lat * 2.2 + (fila % 2 ? .18 : 0), a = { r: hacia.r + ur * at * .35 + pr * w, c: hacia.c + uc * at * .35 + pc * w };
        const s0 = this.caminante('artesano', k % 3, de, [a], .62, .1 + fila * .05);
        s0.img.setTint(0x6E7550);
        s0.extra = k === 1 ? sc.add.image(0, 0, 'cineBandera').setScale(.42).setOrigin(.15, 1).setTint(0xB03A2E) : sc.add.image(0, 0, 'cineFusil').setScale(.32).setOrigin(.5, .9).setAngle(-14);
      }
      this.seguirTropa = true;
      this.objetos.push(...[0, 1, 2].map(k => {
        const q = this.punto(blanco.r + [-.4, .5, .2][k], blanco.c + [.5, -.3, .9][k]);
        return sc.add.particles(q[0], q[1], 'edificios', { frame: 'humo', lifespan: 3000, speedY: { min: -26, max: -12 }, scale: { start: .3, end: 1.15 }, alpha: { start: .65, end: 0 }, tint: 0x3A322C, frequency: 140, emitting: false }).setDepth(40000 - 2);
      }));
      this.humoTarde = { desde: 5.5, hecho: false };
      this.fogonazos = { cada: .28, prox: 4.5, centro: { r: (hacia.r + blanco.r) / 2, c: (hacia.c + blanco.c) / 2 }, radio: 1.6 };
      const q = this.punto(ini.r, ini.c);
      return [q[0], q[1] - 10];
    }
    if (tipo === 'llegadaTren' || tipo === 'llegadaAvion') {
      // La primera llegada: el vecindario sale de la plaza a recibir el tren (o el avión); el vehículo entra por el borde del mapa.
      const f = sc.ferrovia; f.actualizar();
      const T = this.T(), est = tipo === 'llegadaTren' ? f.estacion : f.tilePista, d = est ? { r: est.r + .5, c: est.c + .5 } : p, qs = this.punto(d.r, d.c);
      if (tipo === 'llegadaTren') f.esperaTren = 0; else f.esperaAvion = 0;
      for (let k = 0; k < 12; k++) {
        const j = k % 6, a = { r: d.r + (j - 2.5) * .25 + (k > 5 ? .5 : -.5), c: d.c + (j - 2.5) * .22 + (k > 5 ? -.3 : .4) };
        const x = this.caminante(k % 5 === 4 ? 'nino' : TIPOS[(k + 1) % 4], k % 3, p, [a], .5 + (k % 3) * .06, k * .12);
        x.mira = d;
        if (k % 4 === 0) x.extra = sc.add.image(0, 0, 'cineBandera').setScale(.3).setOrigin(.15, 1);
      }
      return [qs[0], qs[1] - 10];
    }
    if (tipo === 'paz') {
      // Dos delegaciones llegan a la plaza desde lados opuestos, con banderas blancas, y se encuentran.
      for (let k = 0; k < 10; k++) {
        const lado = k < 5 ? -1 : 1, j = k % 5, de = { r: p.r + lado * 1.8 + (j - 2) * .12, c: p.c - lado * .4 + (j - 2) * .25 }, a = { r: p.r + lado * .35 + (j - 2) * .06, c: p.c + (j - 2) * .22 };
        const x = this.caminante(j === 2 ? 'elite' : TIPOS[(k + 1) % 4], k % 3, de, [a], .5, j * .15);
        x.mira = p;
        if (j === 0) x.extra = sc.add.image(0, 0, 'cineBandera').setScale(.3).setOrigin(.15, 1);
      }
      return [pz[0], pz[1] - 10];
    }
    if (tipo === 'escandalo') {
      for (let k = 0; k < 12; k++) {
        const an = k / 12 * Math.PI * 2, de = { r: p.r + Math.cos(an) * 1.6, c: p.c + Math.sin(an) * 1.6 }, a = { r: p.r + Math.cos(an) * .32, c: p.c + Math.sin(an) * .32 };
        this.caminante(TIPOS[k % 5], k % 3, de, [a], .6, k * .12).mira = p;
      }
      this.caminante('artesano', 1, p, [], 0, 0);
      this.papeles = sc.add.particles(pz[0], pz[1] - 14, 'cinePapel', { lifespan: 1600, speedY: { min: -40, max: -18 }, speedX: { min: -22, max: 22 }, gravityY: 30, rotate: { min: 0, max: 360 }, scale: { start: .5, end: .3 }, alpha: { start: 1, end: 0 }, frequency: 140 }).setDepth(p.r + p.c + 2);
      this.objetos.push(this.papeles);
      return [pz[0], pz[1] - 10];
    }
    if (tipo === 'toma') {
      for (let k = 0; k < 10; k++) {
        const an = k / 10 * Math.PI * 2 + .3, de = { r: p.r + Math.cos(an) * .4, c: p.c + Math.sin(an) * .4 }, a = { r: p.r + Math.cos(an) * 3.2, c: p.c + Math.sin(an) * 3.2 };
        this.caminante(TIPOS[k % 5], k % 3, de, [a], 1.05, .3 + (k % 4) * .15);
      }
      for (let k = 0; k < 3; k++) {
        const q = this.punto(p.r + [-.8, .6, .9][k], p.c + [.7, -.9, .8][k]);
        this.objetos.push(sc.add.particles(q[0], q[1], 'edificios', { frame: 'humo', lifespan: 2600, speedY: { min: -26, max: -14 }, speedX: { min: -4, max: 6 }, scale: { start: .3, end: 1.1 }, alpha: { start: .7, end: 0 }, tint: 0x3A322C, frequency: 120 }).setDepth(40000 - 2));
      }
      this.fogonazos = { cada: .22, prox: .4, centro: p };
      return [pz[0], pz[1] - 10];
    }
    if (tipo === 'incendio') {
      // Una obra arde: llamas y humo negro sobre ella; los vecinos llegan corriendo y se quedan mirando (o con baldes).
      const N = this.T().N, i = this.datos.obra, d = i !== undefined ? { r: Math.floor(i / N) + .5, c: i % N + .5 } : p, q = this.punto(d.r, d.c);
      this.objetos.push(sc.add.particles(q[0], q[1] - 6, 'edificios', { frame: 'humo', x: { min: -12, max: 12 }, lifespan: 900, speedY: { min: -46, max: -22 }, speedX: { min: -8, max: 8 }, scale: { start: .3, end: .05 }, alpha: { start: .75, end: 0 }, tint: [0xE8742A, 0xF0A040, 0xC8401E], blendMode: 'ADD', frequency: 55 }).setDepth(d.r + d.c + 2));
      this.objetos.push(sc.add.particles(q[0], q[1] - 22, 'edificios', { frame: 'humo', x: { min: -10, max: 10 }, lifespan: 3400, speedY: { min: -32, max: -16 }, speedX: { min: -3, max: 9 }, scale: { start: .45, end: 1.7 }, alpha: { start: .75, end: 0 }, tint: 0x3A322C, frequency: 100 }).setDepth(40000 - 2));
      for (let k = 0; k < 9; k++) {
        const an = k / 9 * Math.PI * 2, de = this.origen(3), a = { r: d.r + Math.cos(an) * 1.3, c: d.c + Math.sin(an) * 1.3 };
        const x = this.caminante(TIPOS[k % 5], k % 3, de, [a], .95, .2 + (k % 4) * .25); x.mira = d;
      }
      return [q[0], q[1] - 14];
    }
    if (tipo === 'terremoto') {
      sc.cameras.main.shake(5200, .007);
      const obras = S.map.map((x, i) => x.b && x.b !== 'cultivo' && x.b !== 'cafetal' ? i : -1).filter(i => i >= 0), N = this.T().N;
      obras.sort((a, b) => Math.hypot(Math.floor(a / N) + .5 - p.r, a % N + .5 - p.c) - Math.hypot(Math.floor(b / N) + .5 - p.r, b % N + .5 - p.c));
      for (const i of obras.slice(0, 7)) {
        const q = this.punto(Math.floor(i / N) + .5, i % N + .5);
        this.objetos.push(sc.add.particles(q[0], q[1] + 4, 'edificios', { frame: 'humo', lifespan: 1800, speed: { min: 6, max: 22 }, angle: { min: 190, max: 350 }, scale: { start: .35, end: 1 }, alpha: { start: .55, end: 0 }, tint: 0xB9A27E, frequency: 160 }).setDepth(Math.floor(i / N) + i % N + 2));
      }
      return [pz[0], pz[1] - 10];
    }
    if (tipo === 'lahar' || tipo === 'avenida') {
      // El lodo crece a lo largo del río (lahar) o baja por la ladera más cercana al pueblo (avenida).
      let pts;
      if (tipo === 'lahar' && sc.rio && sc.rio.length > 2) {
        let m = 0, dm = 1e9; sc.rio.forEach((q, k) => { const d = Math.hypot(q[0] - pz[0], q[1] - pz[1]); if (d < dm) { dm = d; m = k; } });
        pts = sc.rio.slice(Math.max(0, m - 16), m + 16);
      } else {
        const T = this.T(), N = T.N, cands = S.map.map((x, i) => i).filter(i => S.map[i].t !== 'rio' && T.tiles[i].h >= 1.2).sort((a, b) => Math.hypot(Math.floor(a / N) - p.r, a % N - p.c) - Math.hypot(Math.floor(b / N) - p.r, b % N - p.c));
        const i = cands[0] !== undefined ? cands[0] : plaza(S), t = T.tiles[Math.max(0, i)], L = Math.hypot(t.sx || 0, t.sy || 0) || 1, du = -(t.sx || 1) / L, dv = -(t.sy || 0) / L;
        pts = []; for (let k = 0; k <= 10; k++) { const f = k / 10, r = t.r + .5 + dv * (f - .35) * 3.4, c = t.c + .5 + du * (f - .35) * 3.4; pts.push(this.punto(r + Math.sin(k) * .08, c)); }
      }
      this.lodo = { pts, g: sc.add.graphics().setDepth(-650), col: tipo === 'lahar' ? 0x7E7466 : 0x8A6A44 };
      this.objetos.push(this.lodo.g);
      if (tipo === 'lahar') this.objetos.push(sc.add.particles(0, 0, 'edificios', { frame: 'humo', x: { min: pts[0][0] - 260, max: pts[0][0] + 260 }, y: pts[0][1] - 200, lifespan: 3600, speedY: { min: 18, max: 34 }, speedX: { min: -6, max: 6 }, scale: { start: .12, end: .2 }, alpha: { start: .7, end: .2 }, tint: 0x8A8680, frequency: 40 }).setDepth(40000 - 2));
      const q = pts[Math.floor(pts.length * .6)] || pz;
      return [q[0], q[1]];
    }
    return [pz[0], pz[1]];
  }
  // Un caminante: aparece a su hora en el origen y sigue la ruta (o se queda quieto si no tiene).
  caminante(tipo, vi, de, ruta, vel, demora) {
    const sc = this.scene, H = sc.pob.H, ropa = sc.pob.ropa || '';
    const a = { tipo: tipo + ropa, vi, r: de.r + (Math.random() - .5) * .1, c: de.c + (Math.random() - .5) * .1, ruta: ruta.map(q => ({ ...q })), vel, demora, fase: Math.random() * 4, frente: 1, voltear: false };
    const k = `${a.tipo}_${vi}_1_0`, m = H.marcos[k];
    a.img = sc.add.image(0, 0, 'personas', k).setOrigin(m.ax / m.w, m.ay / m.h).setScale(.62 / H.escala).setVisible(false);
    this.caminantes.push(a);
    return a;
  }
  update(dt) {
    if (!this.activo) return;
    this.t += dt;
    const sc = this.scene, K = this.camara;
    // Cámara: un segundo de viaje.
    if (K && this.t < 1.8) { const f = suave(Math.min(1, this.t / 1.8)); sc.fijarCamara(K.s0 + (K.s1 - K.s0) * f, K.x0 + (K.x1 - K.x0) * f, K.y0 + (K.y1 - K.y0) * f); }
    const tt = this.t - 1; // los actores empiezan cuando la cámara va llegando
    // La invasión: la cámara sigue a la columna, y el humo sale cuando llega a las casas.
    if (this.seguirTropa && tt > .5) {
      const V = this.caminantes.filter(a => a.img.visible);
      if (V.length) {
        const r = V.reduce((x, a) => x + a.r, 0) / V.length, c = V.reduce((x, a) => x + a.c, 0) / V.length, q = this.punto(r, c), [x0, y0] = sc.centro();
        sc.fijarCamara(sc.escala, x0 + (q[0] - x0) * Math.min(1, dt * 1.5), y0 + (q[1] - 10 - y0) * Math.min(1, dt * 1.5));
        if (K) { K.x1 = x0; K.y1 = y0; }
      }
    }
    if (this.humoTarde && !this.humoTarde.hecho && tt > this.humoTarde.desde) { this.humoTarde.hecho = true; for (const o of this.objetos) if (o.emitting === false) o.start(); }
    for (const a of this.caminantes) {
      if (tt < a.demora) continue;
      a.img.setVisible(true);
      let andando = false;
      if (a.ruta.length) {
        const d = a.ruta[0], dr = d.r - a.r, dc = d.c - a.c, dist = Math.hypot(dr, dc);
        if (dist < .03) a.ruta.shift();
        else { const v = Math.min(dist, a.vel * dt); a.r += dr / dist * v; a.c += dc / dist * v; a.fase += v * 13; a.frente = (dc + dr) >= 0 ? 1 : 0; a.voltear = (dc - dr) < 0; andando = true; }
      } else if (a.mira) { const dr = a.mira.r - a.r, dc = a.mira.c - a.c; a.frente = (dc + dr) >= 0 ? 1 : 0; a.voltear = (dc - dr) < 0; }
      const q = this.punto(a.r, a.c), paso = andando ? Math.floor(a.fase) % 4 : (a.mira && Math.floor(this.t * 3 + a.vi) % 4 === 0 ? 1 : 0);
      a.img.setFrame(`${a.tipo}_${a.vi}_${a.frente}_${paso}`).setPosition(q[0], q[1]).setFlipX(a.voltear).setDepth(a.r + a.c + .02);
      if (a.extra) { const fx = this.tipo === 'procesion' ? 3 : this.tipo === 'asedio' ? 4 : 0, fy = this.tipo === 'procesion' ? 10 : this.tipo === 'asedio' ? 7 : 12; a.extra.setPosition(q[0] + (a.voltear ? -fx : fx), q[1] - fy).setDepth(a.r + a.c + .03); }
    }
    // Fogonazos de la toma armada.
    const F = this.fogonazos;
    if (F && tt > F.prox) {
      F.prox = tt + F.cada * (.5 + Math.random());
      const R = F.radio || 2.4, q = this.punto(F.centro.r + (Math.random() - .5) * R, F.centro.c + (Math.random() - .5) * R);
      const b = sc.add.circle(q[0], q[1] - 6, 5, 0xFFD27A, .95).setDepth(40000 - 1).setBlendMode('ADD');
      sc.tweens.add({ targets: b, alpha: 0, scale: 2.2, duration: 220, onComplete: () => b.destroy() });
    }
    // Lodo que avanza.
    if (this.lodo && tt > 0) {
      const { pts, g, col } = this.lodo, f = Math.min(1, .15 + tt / (this.dur - 1.4)), n = Math.max(2, Math.ceil(pts.length * f));
      g.clear();
      for (const [w, al] of [[40, .35], [26, .6], [10, .5]]) {
        g.lineStyle(w, w === 10 ? 0x5E5448 : col, al); g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
        for (let k = 1; k < n; k++) g.lineTo(pts[k][0], pts[k][1]);
        g.strokePath();
      }
    }
    if (!this.fin && Math.max(this.t, (performance.now() - this.inicio) / 1000) >= this.dur + 1) { this.fin = true; this.boton.textContent = C.CINE.seguir; this.boton.classList.add('seguir'); this.boton.focus({ preventScroll: true }); }
  }
  terminar() {
    if (!this.activo) return;
    this.activo = false;
    if (this.camara) { const K = this.camara; this.scene.fijarCamara(K.s1, K.x1, K.y1); }
    this.scene.cameras.main.resetFX && this.scene.cameras.main.resetFX();
    for (const a of this.caminantes) { a.img.destroy(); if (a.extra) a.extra.destroy(); }
    for (const o of this.objetos) o.destroy();
    this.caminantes = []; this.objetos = []; this.boton = null; this.fogonazos = null; this.lodo = null; this.seguirTropa = false; this.humoTarde = null; this.camara = null;
    const v = this.velo; this.velo = null;
    if (v) { v.classList.remove('on'); setTimeout(() => v.remove(), 350); }
    capaUI().classList.remove('en-cine');
    const f = this.luego; this.luego = null;
    if (f) f();
  }
}
