// Pobladores animados y luz del día. Cada figura tiene casa y trabajo reales (src/core/pobladores.js).
// Rutina: en la mañana va al trabajo (los niños a la escuela), en la tarde pasa por la plaza,
// en la noche vuelve a casa y se encienden las ventanas. Con "reducir movimiento" todo queda quieto de día.
// Fase 9: caminan por una rejilla de medias casillas (centros, bordes y esquinas) y prefieren las calles; doblan
// las esquinas en curva; se quedan más tiempo quietos y con sentido: corrillos en la plaza, vendedores en el
// mercado y niños jugando en ronda.
import { planearPobladores, ropaModerna, plaza as plazaDe, listaCalles, callesActivas, claveBorde, esquina, esquinaAgua } from '../core/index.js';
import { hornearGente, PASOS12, hornearAcciones, ACCIONES } from '../arte/gente.js';
import { enPotencia } from '../arte/fresco.js';
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
    this.H = hornearGente(); // fase 8: pobladores al fresco
    if (!scene.textures.exists('personas')) {
      const tx = scene.textures.addCanvas('personas', enPotencia(this.H.canvas)); // lados potencia de dos: sin temblor al moverse
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

  // Hoja de acciones de oficio (sembrar, picar, vender…): se hornea con la ropa de la época y se refresca si cambia.
  ponerAcciones() {
    const A = hornearAcciones(!!this.ropa), tx = this.scene.textures;
    if (!tx.exists('acciones')) { const t = tx.addCanvas('acciones', A.canvas); for (const [k, m] of Object.entries(A.marcos)) t.add(k, 0, m.x, m.y, m.w, m.h); }
    else if (this.accModa !== !!this.ropa) tx.get('acciones').refresh();
    this.accModa = !!this.ropa; this.A = A;
  }
  // Qué hace quien espera en su lugar, según el edificio (o el corrillo, o el juego). Devuelve el nombre de la acción.
  accionDe(f) {
    const p = f.p, tipo = p.tipo, tiene = k => ACCIONES[tipo] && ACCIONES[tipo][k];
    const b = f.destino === 'trabajo' && p.trabajo !== null ? this.scene.S.map[p.trabajo].b : null;
    if (f.mira && tiene('conversar')) return 'conversar';
    const u = Math.floor((this.t * .13 + p.semilla * 9)) % 3; // cambia de tarea cada rato
    const por = { cultivo: ['sembrar', 'cosechar', 'cosechar'], cafetal: ['cosechar', 'cosechar', 'cargar'], mina: ['picar'], cantera: ['picar'], taller: ['martillar', 'martillar', 'cargar'], molino: ['martillar', 'cargar'], aserradero: ['aserrar', 'cargar'], mercado: ['vender'], puerto: ['cargar'], escuela: ['leer'], biblioteca: ['leer'], iglesia: ['rezar'], universidad: ['leer'], banco: ['leer'], hospital: ['saludar'], teatro: ['saludar'] }[b];
    if (por) { const k = por[u % por.length]; if (tiene(k)) return k; }
    if (tipo === 'campesina' && b === null && f.destino === 'trabajo') return 'barrer';
    if (f.destino === 'plaza' && tiene('saludar')) return u === 0 ? 'saludar' : 'conversar';
    return null;
  }

  // Vuelve a repartir casas y trabajos (tras construir, demoler o terminar el año).
  planear() {
    const { S, T } = this.scene, plan = planearPobladores(S);
    this.ropa = ropaModerna(S) ? 'M' : ''; // fase 5: desde la época del ladrillo, ropa moderna
    this.ponerAcciones();
    this.puentes = new Set(caminos(T, S.map).puentes.map(([, j]) => j));
    this.rejilla();
    while (this.figuras.length > plan.length) { const f = this.figuras.pop(); f.img.destroy(); if (f.marca) f.marca.destroy(); }
    plan.forEach((p, k) => {
      let f = this.figuras[k];
      if (!f) {
        const casa = this.centro(p.casa, .3);
        f = { r: casa.r, c: casa.c, ruta: [], espera: Math.random() * 3, fase: Math.random() * 4, frente: 1, voltear: false, oculto: false };
        f.img = this.scene.add.image(0, 0, 'personas', `${p.tipo}${this.ropa || ''}_${p.vi}_1_0`);
        const m = this.H.marcos[`${p.tipo}${this.ropa || ''}_${p.vi}_1_0`];
        f.img.setOrigin(m.ax / m.w, m.ay / m.h).setScale(TAMANO / this.H.escala);
        this.figuras.push(f);
      }
      const nueva = !f.p;
      f.p = p; f.vel = (p.tipo === 'nino' ? .5 : .42) * (.85 + p.semilla * .3); f.carril = (p.semilla - .5) * .3;
      // Fase 9: quien aparece ya está en algún lugar haciendo lo suyo (no sale todo el pueblo a caminar a la vez).
      if (nueva && this.G) { const d = this.siguiente(f); f.r = d.r; f.c = d.c; f.destino = d.lugar; f.mira = d.mira || null; f.oculto = !!d.casa; f.espera = Math.random() * 14; }
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
    // Los niños sin escuela (o de tarde) juegan en ronda cerca de la plaza.
    if (p.tipo === 'nino' && this.ronda && (p.trabajo === null || d > .55) && Math.random() < .7) return a(this.puntoRonda(f), 'juego');
    if (d > .55 && Math.random() < .6 && p.plaza >= 0) return this.alCorrillo(f);
    if (p.trabajo !== null && Math.random() < .8) return a(this.puestoDe(f), 'trabajo');
    if (p.clase === 'n' || p.clase === 'e') return Math.random() < .6 && p.plaza >= 0 ? this.alCorrillo(f) : this.centro(p.casa, 1.4);
    return p.plaza >= 0 ? this.alCorrillo(f) : this.centro(p.casa, 1.2);
  }
  // Puesto de trabajo: en el mercado cada vendedor tiene su lugar fijo frente a la obra.
  puestoDe(f) { const p = f.p; return this.centro(p.trabajo, .7, this.scene.S.map[p.trabajo].b === 'mercado' ? () => p.semilla : Math.random); }
  // Un corrillo de la plaza: cada uno en su lugar alrededor del centro del grupo, mirándolo.
  alCorrillo(f) {
    const G = this.grupos;
    if (!G.length) return { ...this.centro(f.p.plaza, 1.3), lugar: 'plaza' };
    const g = G[f.p.id % G.length], an = f.p.semilla * Math.PI * 2 + Math.random() * .6, rad = .17 + Math.random() * .08;
    return { r: g.r + Math.cos(an) * rad, c: g.c + Math.sin(an) * rad, lugar: 'plaza', mira: g };
  }
  puntoRonda(f) { const R = this.ronda, an = f.p.semilla * Math.PI * 2; return { r: R.r + Math.cos(an) * .25, c: R.c + Math.sin(an) * .25 }; }

  // ---------- Rejilla para caminar (fase 9) ----------
  // Nodos cada media casilla: (2r, 2c). Impar-impar es el centro de una casilla, par-par una esquina y los mixtos
  // el medio de un borde. Las calles cuestan menos (la gente las prefiere); el río solo se cruza por un puente.
  rejilla() {
    const { S, T } = this.scene, N = T.N, G = 2 * N + 1, costo = new Float32Array(G * G).fill(Infinity);
    const conCalles = callesActivas(S), bordes = new Set(conCalles ? listaCalles(S) : []), esqCalle = new Set();
    for (const k of bordes) for (const e of k.split('|')) esqCalle.add(+e);
    // Cada casilla: 0 se pasa, 1 se pasa apretado (junto a edificios), 2 no se pasa (río).
    const clase = (r, c) => {
      if (r < 0 || c < 0 || r >= N || c >= N) return -1;
      const i = r * N + c, x = S.map[i];
      if (x.t === 'rio') return !conCalles && this.puentes.has(i) ? 0 : 2;
      return !x.b || ['cultivo', 'cafetal', 'parque'].includes(x.b) ? 0 : 1;
    };
    const juntar = L => { const v = L.filter(x => x >= 0); return v.some(x => x === 0) ? 1 : v.some(x => x === 1) ? 1.5 : Infinity; };
    for (let R = 0; R < G; R++) for (let C = 0; C < G; C++) {
      let k;
      if (R % 2 && C % 2) { const r = (R - 1) / 2, c = (C - 1) / 2, q = clase(r, c); k = q === 0 ? (S.map[r * N + c].b ? 1.3 : 1) : Infinity; }
      else if (R % 2 === 0 && C % 2 === 0) {
        const r = R / 2, c = C / 2, e = esquina(N, r, c);
        k = esqCalle.has(e) ? .55 : conCalles && esquinaAgua(S, e) ? Infinity : juntar([clase(r - 1, c - 1), clase(r - 1, c), clase(r, c - 1), clase(r, c)]);
      } else if (R % 2 === 0) {
        const r = R / 2, c = (C - 1) / 2;
        k = bordes.has(claveBorde(esquina(N, r, c), esquina(N, r, c + 1))) ? .55 : juntar([clase(r - 1, c), clase(r, c)]);
      } else {
        const r = (R - 1) / 2, c = C / 2;
        k = bordes.has(claveBorde(esquina(N, r, c), esquina(N, r + 1, c))) ? .55 : juntar([clase(r, c - 1), clase(r, c)]);
      }
      costo[R * G + C] = k;
    }
    this.G = G; this.costo = costo;
    // Corrillos: casillas libres junto a la plaza (hasta tres); la ronda de los niños, en otra.
    this.grupos = []; this.ronda = null;
    const plaza = plazaDe(S);
    if (plaza >= 0) {
      const r0 = Math.floor(plaza / N), c0 = plaza % N, libres = [];
      if (clase(r0, c0) === 0) libres.push([r0, c0]);
      for (const [dr, dc] of [[1, 0], [0, 1], [1, 1], [-1, 0], [0, -1], [1, -1], [-1, 1], [-1, -1], [2, 0], [0, 2]]) if (clase(r0 + dr, c0 + dc) === 0) libres.push([r0 + dr, c0 + dc]);
      this.grupos = libres.slice(0, 3).map(([r, c]) => ({ r: r + .5, c: c + .5 }));
      const L = libres[3] || libres[0];
      if (L) this.ronda = { r: L[0] + .5 + (libres[3] ? 0 : .3), c: L[1] + .5 - (libres[3] ? 0 : .3) };
    }
  }
  // Camino por la rejilla (A* con montículo). Devuelve una lista de puntos, o null si no hay manera de llegar.
  ruta(f, d) {
    const G = this.G, costo = this.costo, M = G - 1;
    const nodo = q => Math.max(0, Math.min(M, Math.round(q.r * 2))) * G + Math.max(0, Math.min(M, Math.round(q.c * 2)));
    const ini = nodo(f), fin = nodo(d);
    if (ini === fin) return [d];
    const fr = Math.floor(fin / G), fc = fin % G, h = i => (Math.abs(Math.floor(i / G) - fr) + Math.abs(i % G - fc)) * .275;
    const g = new Map([[ini, 0]]), de = new Map(), heap = [[h(ini), ini]];
    const push = x => { heap.push(x); let i = heap.length - 1; while (i) { const q = (i - 1) >> 1; if (heap[q][0] <= heap[i][0]) break; [heap[q], heap[i]] = [heap[i], heap[q]]; i = q; } };
    const pop = () => { const top = heap[0], u = heap.pop(); if (heap.length) { heap[0] = u; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === i) break; [heap[m], heap[i]] = [heap[i], heap[m]]; i = m; } } return top; };
    let pasos = 0, llego = false;
    while (heap.length && pasos++ < 6000) {
      const [, i] = pop();
      if (i === fin) { llego = true; break; }
      const R = Math.floor(i / G), C = i % G, gi = g.get(i), ci = i === ini ? 1 : costo[i];
      for (const [dR, dC] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const R2 = R + dR, C2 = C + dC;
        if (R2 < 0 || C2 < 0 || R2 > M || C2 > M) continue;
        const j = R2 * G + C2, cj = j === fin ? 1 : costo[j];
        if (!isFinite(cj)) continue;
        const n = gi + (ci + cj) * .25;
        if (n < (g.has(j) ? g.get(j) : Infinity)) { g.set(j, n); de.set(j, i); push([n + h(j), j]); }
      }
    }
    if (!llego) return null;
    const nodos = [];
    for (let i = de.get(fin); i !== ini && i !== undefined; i = de.get(i)) nodos.unshift(i);
    // Solo los quiebres (los tramos rectos se recorren de un tirón), con el carril de cada quien.
    const o = f.carril * .5, pts = [];
    nodos.forEach((i, k) => {
      const a = k ? nodos[k - 1] : ini, b = k < nodos.length - 1 ? nodos[k + 1] : fin;
      if (b - i === i - a) return;
      pts.push({ r: Math.floor(i / G) / 2 + o, c: i % G / 2 - o });
    });
    pts.push(d);
    // Esquinas en curva: cada quiebre se cambia por dos puntos un poco antes y un poco después.
    const suave = [];
    let prev = { r: f.r, c: f.c };
    pts.forEach((q, k) => {
      const sig = pts[k + 1];
      if (!sig) { suave.push(q); return; }
      const l1 = Math.hypot(q.r - prev.r, q.c - prev.c), l2 = Math.hypot(sig.r - q.r, sig.c - q.c), s = Math.min(.18, l1 / 2, l2 / 2);
      if (s < .02) { suave.push(q); prev = q; return; }
      suave.push({ r: q.r - (q.r - prev.r) / l1 * s, c: q.c - (q.c - prev.c) / l1 * s }, { r: q.r + (sig.r - q.r) / l2 * s, c: q.c + (sig.c - q.c) / l2 * s });
      prev = q;
    });
    return suave;
  }

  update(dt) {
    const quieto = reducirMovimiento();
    if (!quieto) { const r = this.reloj + dt / DURACION_DIA; if (r >= 1) this.dias = (this.dias || 0) + 1; this.reloj = r % 1; }
    this.t = (this.t || 0) + dt;
    for (const f of this.figuras) {
      if (quieto) { f.oculto = false; this.dibujar(f, false); continue; }
      if (f.espera > 0) {
        f.espera -= dt;
        // Niños en ronda: corren en círculo alrededor del centro del juego.
        if (f.destino === 'juego' && this.ronda) {
          const R = this.ronda, an0 = Math.atan2(f.c - R.c, f.r - R.r), an = an0 + dt * 1.9, rad = .25;
          const r = R.r + Math.cos(an) * rad, c = R.c + Math.sin(an) * rad, dr = r - f.r, dc = c - f.c;
          f.r = r; f.c = c; f.fase += dt * 9;
          f.frente = (dc + dr) >= 0 ? 1 : 0; f.voltear = (dc - dr) < 0;
          this.dibujar(f, true);
          continue;
        }
        // Cada quien hace lo suyo mientras espera: siembra, pica, vende, conversa… (acciones de oficio).
        if (f.mira) this.mirar(f, f.mira);
        else if (f.destino === 'trabajo') f.voltear = f.p.semilla < .5;
        this.dibujar(f, false, 0, this.accionDe(f));
        continue;
      }
      if (!f.ruta.length) {
        const d = this.siguiente(f), r = this.ruta(f, d);
        if (!r) { f.espera = 3 + Math.random() * 4; continue; }
        f.ruta = r; f.aCasa = !!d.casa; f.destino = d.lugar; f.mira = null; f.miraLuego = d.mira || null; f.oculto = false; f.andado = 0;
      }
      const d = f.ruta[0], dr = d.r - f.r, dc = d.c - f.c, dist = Math.hypot(dr, dc);
      if (dist < .02) {
        f.ruta.shift();
        // Al llegar se queda un buen rato: así hay menos gente andando a la vez y más quieta con sentido.
        if (!f.ruta.length) {
          const b = f.destino === 'trabajo' && f.p.trabajo !== null ? this.scene.S.map[f.p.trabajo].b : null;
          f.espera = b === 'mercado' ? 25 + Math.random() * 20 : f.destino === 'trabajo' ? 16 + Math.random() * 16 : f.destino === 'plaza' ? 12 + Math.random() * 14 : f.destino === 'juego' ? 9 + Math.random() * 7 : 3 + Math.random() * 5;
          f.mira = f.miraLuego;
          if (b === 'mercado') { f.frente = 1; f.voltear = f.p.semilla < .5; } // el vendedor mira a la calle
          if (f.aCasa) f.oculto = true;
        }
        this.dibujar(f, false);
        continue;
      }
      // Arranca suave y anda a paso parejo; el paso va con la distancia recorrida (los pies no resbalan).
      f.andado += dt;
      const v = Math.min(dist, f.vel * dt * Math.min(1, .45 + f.andado * 1.4));
      f.r += dr / dist * v; f.c += dc / dist * v; f.fase += v * 13;
      // Solo gira si la dirección cambia de verdad (en las esquinas suavizadas no se voltea de un lado al otro).
      if (Math.abs(dc + dr) > dist * .3) f.frente = (dc + dr) >= 0 ? 1 : 0;
      if (Math.abs(dc - dr) > dist * .3) f.voltear = (dc - dr) < 0;
      this.dibujar(f, true);
    }
    this.luzDelDia();
  }
  mirar(f, q) { const dr = q.r - f.r, dc = q.c - f.c; if (Math.abs(dr) + Math.abs(dc) < .01) return; f.frente = (dc + dr) >= 0 ? 1 : 0; f.voltear = (dc - dr) < 0; }

  dibujar(f, andando, postura, accion) {
    const T = this.scene.T, p = P(f.r, f.c, T.hf(f.r, f.c)), paso = andando ? PASOS12[Math.floor(f.fase * 3) % 12] : (postura || 0); // doce cuadros: andar suave
    const N = accion && ACCIONES[f.p.tipo][accion], clave = N ? `${f.p.tipo}_${f.p.vi}_${accion}_${Math.floor(((this.t * (accion === 'rezar' ? .6 : 1.5) + f.p.semilla * 7) % 1) * N)}` : null;
    if (clave && this.A.marcos[clave]) { if (f.tex !== 'acciones') { f.img.setTexture('acciones'); f.tex = 'acciones'; } f.img.setFrame(clave); }
    else { if (f.tex === 'acciones') { f.img.setTexture('personas'); f.tex = 'personas'; } f.img.setFrame(`${f.p.tipo}${this.ropa || ''}_${f.p.vi}_${f.frente}_${paso}`); }
    f.img.setPosition(p[0], p[1]).setFlipX(f.voltear).setDepth(f.r + f.c + .01).setVisible(!f.oculto);
    // Fase 13: los miembros de las familias que escriben cartas llevan una marca roja sobre la cabeza.
    if (f.p.familia && !f.marca) f.marca = this.scene.add.circle(0, 0, 1.7, 0x9C2F25).setStrokeStyle(.6, 0xD4A24C);
    if (f.marca) f.marca.setPosition(p[0], p[1] - f.img.displayHeight - 2.5).setDepth(f.r + f.c + .02).setVisible(!!f.p.familia && !f.oculto);
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
