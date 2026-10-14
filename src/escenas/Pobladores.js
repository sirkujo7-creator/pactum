// Pobladores animados y luz del día. Cada figura tiene casa y trabajo reales (src/core/pobladores.js).
// Rutina: en la mañana va al trabajo (los niños a la escuela), en la tarde pasa por la plaza,
// en la noche vuelve a casa y se encienden las ventanas. Con "reducir movimiento" todo queda quieto de día.
// Fase 9: caminan por una rejilla de medias casillas (centros, bordes y esquinas) y prefieren las calles; doblan
// las esquinas en curva; se quedan más tiempo quietos y con sentido: corrillos en la plaza, vendedores en el
// mercado y niños jugando en ronda.
import { planearPobladores, ropaModerna, plaza as plazaDe, listaCalles, callesActivas, claveBorde, esquina, esquinaAgua, lutoVisible, busquedaVisible, epidemiaVisible, movilizados, problemaActivo, vocesActivas, inseguridad, epocaHistorica } from '../core/index.js';
import { hornearGente, PASOS12, hornearAcciones, ACCIONES, GESTOS, ritmo } from '../arte/gente.js';
import { enPotencia } from '../arte/fresco.js';
import { caminos } from '../arte/terreno.js';
import { P } from '../arte/iso.js';
import { reducirMovimiento } from './pantalla.js';

// Oficios que se hacen a golpes (con pausa entre uno y otro) y velocidad de los que van seguidos (ciclos por segundo).
const TRABAJO = new Set(['sembrar', 'cosechar', 'picar', 'martillar', 'aserrar', 'barrer', 'vender', 'cargar']);
const LENTO = { rezar: .35, leer: .25, tocar: .9, lustrar: 1, saltar: 1.4 };
const DURACION_DIA = 180; // segundos que dura un día completo
const TAMANO = .62;       // tamaño de las figuras frente a las casas
const smooth = t => t * t * (3 - 2 * t);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export class Pobladores {
  constructor(scene) {
    this.scene = scene;
    this.H = hornearGente(ropaModerna(scene.S)); // fase 8: pobladores al fresco (solo la ropa de la época)
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
    try { // si algo falla (poca memoria), el juego sigue sin las acciones de oficio
      const A = hornearAcciones(!!this.ropa), tx = this.scene.textures;
      if (!tx.exists('acciones')) { const t = tx.addCanvas('acciones', A.canvas); for (const [k, m] of Object.entries(A.marcos)) t.add(k, 0, m.x, m.y, m.w, m.h); }
      else if (this.accModa !== !!this.ropa) tx.get('acciones').refresh();
      this.accModa = !!this.ropa; this.A = A;
    } catch (e) { this.A = null; console.warn('Acciones de oficio desactivadas:', e); }
  }
  // Qué hace quien espera en su lugar, según el edificio (o el corrillo, o el juego). Devuelve el nombre de la acción.
  accionDe(f) {
    if (!this.A) return null;
    const p = f.p, tipo = p.tipo, tiene = k => ACCIONES[tipo] && ACCIONES[tipo][k];
    const b = f.destino === 'trabajo' && p.trabajo !== null ? this.scene.S.map[p.trabajo].b : null;
    if (f.destino === 'luto' && tiene('rezar')) return 'rezar'; // velorio: cabeza baja y manos juntas
    if (f.destino === 'enfermo' && tiene('rezar')) return 'rezar';
    if (f.destino === 'protesta' && tiene('saludo')) return 'protesta'; // brazo en alto, despacio
    // Voces del pueblo: los problemas se ven en la gente.
    const PROB = { busqueda: 'foto', desempleo: 'sentado', fila: 'esperar', lustrar: 'lustrar', agua: 'balde', misa: 'rezar', serenata: 'tocar' }[f.destino];
    if (PROB && tiene(PROB)) return PROB;
    // Conversar (pedido de Juan): de pie y tranquilos, con un gesto breve cada tantos segundos, y solo si hay alguien al lado.
    if ((f.destino === 'plaza' || f.destino === 'contento' || f.mira) && GESTOS[tipo] && this.vecino(f)) return 'social';
    const u = Math.floor((this.t * .13 + p.semilla * 9)) % 3; // cambia de tarea cada rato
    const por = { cultivo: ['sembrar', 'cosechar', 'cosechar'], cafetal: ['cosechar', 'cosechar', 'cargar'], mina: ['picar'], cantera: ['picar'], taller: ['martillar', 'martillar', 'cargar'], molino: ['martillar', 'cargar'], aserradero: ['aserrar', 'cargar'], mercado: ['vender'], puerto: ['cargar'], escuela: ['leer'], biblioteca: ['leer'], iglesia: ['rezar'], universidad: ['leer'], banco: ['leer'] }[b];
    if (por) { const k = por[u % por.length]; if (tiene(k)) return k; }
    if (tipo === 'campesina' && b === null && f.destino === 'trabajo') return 'barrer';
    return null;
  }
  // Cuadro del gesto de quien conversa: casi siempre en reposo; cada 5 a 11 segundos un gesto breve (asentir, la mano
  // a la barbilla, señalar, abrir las manos) que va y vuelve. Quien da la espalda escucha (cuadro de espaldas, quieto).
  gestoDe(f) {
    if (f.frente === 0) return null;
    if (f.gesto && this.t > f.gesto.t0 + f.gesto.dur) f.gesto = null;
    if (!f.gesto) {
      if (f.proxGesto === undefined) f.proxGesto = this.t + 1.5 + f.p.semilla * 6;
      if (this.t < f.proxGesto) return null;
      f.proxGesto = this.t + 5 + Math.random() * 6;
      const L = GESTOS[f.p.tipo].filter(k => k !== 'saludo' && k !== 'sombrero');
      f.gesto = { k: L[Math.floor(Math.random() * L.length)], t0: this.t, dur: 1.4 + Math.random() * .9 };
    }
    return this.claveGesto(f);
  }
  claveGesto(f) {
    const g = f.gesto, u = (this.t - g.t0) / g.dur, sec = [0, 1, 2, 2, 2, 2, 1, 0], n = sec[Math.max(0, Math.min(sec.length - 1, Math.floor(u * sec.length)))];
    return `${f.p.tipo}_${f.p.vi}_${g.k}_${n}`;
  }
  // La persona más cercana a menos de media casilla (se revisa cada segundo); quien conversa la mira.
  vecino(f) {
    if (f._vecT === undefined || this.t - f._vecT >= 1) {
      f._vecT = this.t; f._vec = null; let d0 = .55;
      for (const o of this.figuras) { if (o === f || o.oculto) continue; const d = Math.hypot(o.r - f.r, o.c - f.c); if (d < d0) { d0 = d; f._vec = o; } }
    }
    if (f._vec && !f.mira) this.mirar(f, f._vec); // en el corrillo se sigue mirando al centro del grupo
    return f._vec;
  }

  // Vuelve a repartir casas y trabajos (tras construir, demoler o terminar el año).
  planear() {
    const { S, T } = this.scene, plan = planearPobladores(S);
    this.ropa = ropaModerna(S) ? 'M' : ''; // fase 5: desde la época del ladrillo, ropa moderna
    if (this.H.mod !== !!this.ropa) { hornearGente(!!this.ropa); if (this.scene.textures.exists('personas')) this.scene.textures.get('personas').refresh(); } // cambió la época: se repinta la ropa
    this.ponerAcciones();
    this.puentes = new Set(caminos(T, S.map).puentes.map(([, j]) => j));
    this.rejilla();
    while (this.figuras.length > plan.length) { const f = this.figuras.pop(); f.img.destroy(); if (f.marca) f.marca.destroy(); if (f.pancarta) f.pancarta.destroy(); }
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
    const S0 = this.scene.S, miedo = vocesActivas(S0) && inseguridad(S0) >= 50; // con inseguridad alta la gente se encierra temprano
    if (d > .82 && this.serenata(f)) return this.serenata(f);
    if (d > (miedo ? .68 : .8) || d < .08) return { ...this.centro(p.casa, .2), casa: true };
    const rut = this.rutina(f, d); if (rut) return rut;
    // Reacciones a lo que pasa (animación, tanda 2): luto en la plaza y gente que acude al hospital en una epidemia.
    const S = this.scene.S;
    // Tanda 3: con el aguacero de La Niña o el año de un terremoto o una erupción, muchos corren a refugiarse en casa.
    if (this.peligro() && p.semilla < .7 && Math.random() < .8) return { ...this.centro(p.casa, .2), casa: true, prisa: true };
    // Voces del pueblo: desempleados sentados al borde de la plaza, fila en el mercado si la comida está cara,
    // niños sin escuela lustrando botas y, sin acueducto, mujeres y niños por agua al río en la mañana.
    const pr = this.problemaVisible(f, d); if (pr) return pr;
    // Tanda 3: si un movimiento social está movilizado, parte de los adultos protesta en la plaza con pancartas.
    if (p.tipo !== 'nino' && p.plaza >= 0 && p.semilla > .25 && p.semilla < .6 && this.protesta() && Math.random() < .8) return { ...this.alCorrillo(f), lugar: 'protesta' };
    // Conflicto: madres con la foto de su desaparecido, de pie en fila junto a la plaza, en silencio.
    if (p.tipo === 'campesina' && p.plaza >= 0 && p.semilla < .32 && d > .3 && d < .7 && busquedaVisible(S) && Math.random() < .85) { const N = this.scene.T.N, an = p.semilla * 19; return { r: Math.floor(p.plaza / N) + .5 + Math.cos(an) * .42, c: p.plaza % N + .5 + Math.sin(an) * .42, lugar: 'busqueda', mira: { r: Math.floor(p.plaza / N) + 1.6, c: p.plaza % N + 1.6 } }; }
    if (p.tipo !== 'nino' && lutoVisible(S) && p.plaza >= 0 && p.semilla < .55 && Math.random() < .75) return { ...this.alCorrillo(f), lugar: 'luto' };
    if (epidemiaVisible(S) && p.semilla > .6 && Math.random() < .6) { const h = S.map.findIndex(x => x.b === 'hospital' && !x.ob); if (h >= 0) return { ...this.centro(h, .5), lugar: 'enfermo' }; }
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
    // Cada quien con su puesto fijo en el corrillo (pedido de Juan: nadie encima de nadie): ocho puestos en un anillo
    // alrededor del centro y, si son más, un segundo anillo; todos miran al centro del grupo.
    const n = Math.max(1, Math.min(G.length, Math.floor(this.figuras.length / 12))), gi = f.p.id % n, g = G[gi]; // pueblo pequeño: un solo corrillo
    const miembros = this.figuras.filter(o => o.p.id % n === gi).map(o => o.p.id).sort((x, y) => x - y), k = miembros.indexOf(f.p.id);
    const anillo = Math.floor(k / 8), an = (k % 8) / 8 * Math.PI * 2 + gi * .7 + anillo * .39, rad = (g.rad || .3) + anillo * .18;
    return { r: g.r + Math.cos(an) * rad, c: g.c + Math.sin(an) * rad, lugar: 'plaza', mira: g };
  }
  // ¿Hay que correr a refugiarse? Aguacero de La Niña (cuando llueve en el mapa) o terremoto o erupción este año.
  peligro() {
    const S = this.scene.S, D = S.desastre, ef = this.scene.efectos;
    if (D && D.anio === S.year && (D.tipo === 'terremoto' || D.tipo === 'erupcion')) return true;
    return !!(S.clima && S.clima.fenomeno === 'nina' && ef && ef.lluvia && ef.lluvia.length);
  }
  // Rutina del pueblo: misa (cada tres días, en la mañana), día de mercado (el día siguiente) y, si la gente está
  // contenta, más saludos y juegos en la plaza.
  rutina(f, d) {
    const S = this.scene.S, p = f.p, dia = (this.dias || 0) % 3;
    if (!vocesActivas(S) || p.plaza < 0) return null;
    const N = this.scene.T.N;
    if (dia === 0 && d > .26 && d < .42 && Math.random() < .6) { const ig = S.map.findIndex(x => x.b === 'iglesia' && !x.ob); if (ig >= 0) return { ...this.centro(ig, .8), lugar: 'misa' }; }
    if (dia === 1 && d > .3 && d < .6 && p.tipo !== 'nino' && Math.random() < .45) { const m = S.map.findIndex(x => x.b === 'mercado' && !x.ob); if (m >= 0) return { ...this.centro(m, .9), lugar: 'mercadeo', mira: { r: Math.floor(m / N) + .5, c: m % N + .5 } }; }
    if (S.hap >= 65 && Math.random() < .15) return { ...this.alCorrillo(f), lugar: 'contento' };
    return null;
  }
  // Serenata: en las épocas antiguas, de noche, tres músicos con tiple frente a una casa (los mismos cada noche).
  serenata(f) {
    const S = this.scene.S, ep = epocaHistorica(S), p = f.p;
    if (!vocesActivas(S) || !['fundacion', 'cafe', 'violencia', 'modernizacion'].includes(ep) || (this.dias || 0) % 2) return null;
    if (!this._musicos || this._musicos.dia !== this.dias) { const L = this.figuras.filter(x => x.p.tipo === 'artesano' || x.p.tipo === 'campesino').slice(0, 3).map(x => x.p.id); this._musicos = { dia: this.dias, ids: L, casa: (this.figuras.find(x => x.p.tipo === 'campesina') || this.figuras[0]).p.casa }; }
    const k = this._musicos.ids.indexOf(p.id); if (k < 0) return null;
    const N = this.scene.T.N, r = Math.floor(this._musicos.casa / N), c = this._musicos.casa % N;
    return { r: r + 1.25 + k * .05, c: c + .3 + k * .22, lugar: 'serenata', mira: { r: r + .5, c: c + .5 } };
  }
  problemaVisible(f, d) {
    const S = this.scene.S, p = f.p; if (!vocesActivas(S) || p.plaza < 0) return null;
    const N = this.scene.T.N, rc = i => ({ r: Math.floor(i / N), c: i % N });
    if (p.clase === 'u' && p.tipo !== 'nino' && Math.random() < .7) { const g = rc(p.plaza), an = p.semilla * Math.PI * 2; return { r: g.r + .5 + Math.cos(an) * .46, c: g.c + .5 + Math.sin(an) * .46, lugar: 'desempleo', mira: { r: g.r + .5, c: g.c + .5 } }; }
    if (p.tipo !== 'nino' && p.tipo !== 'elite' && p.semilla < .5 && d < .7 && problemaActivo(S, 'comida', p.casa, p.clase) && Math.random() < .6) {
      const m = S.map.findIndex(x => x.b === 'mercado' && !x.ob);
      if (m >= 0) { const g = rc(m), k = p.id % 6; return { r: g.r + 1.12 + k * .15, c: g.c + .45 + (k % 2) * .06, lugar: 'fila', mira: { r: g.r + .5, c: g.c + .5 } }; }
    }
    if (p.tipo === 'nino' && p.trabajo === null && S.stage >= 1 && p.semilla < .6 && Math.random() < .6) { const g = rc(p.plaza), an = p.semilla * 9; return { r: g.r + .5 + Math.cos(an) * .4, c: g.c + .5 + Math.sin(an) * .4, lugar: 'lustrar' }; }
    if ((p.tipo === 'campesina' || p.tipo === 'nino') && d < .45 && p.semilla < .55 && this.scene.vida && (problemaActivo(S, 'agua', p.casa, p.clase) || S.map.every(x => x.b !== 'acueducto')) && Math.random() < .7) {
      const g = rc(p.casa), o = this.scene.vida.orilla({ casa: { r: g.r + .5, c: g.c + .5 } }); if (o) return { r: o.r, c: o.c, lugar: 'agua' };
    }
    return null;
  }
  protesta() { const S = this.scene.S; return movilizados(S).length > 0; }
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
      if (!this.grupos.length) this.grupos = [{ r: r0 + .5, c: c0 + .5, rad: .4 }]; // sin casillas libres: el corrillo rodea la cruz de la plaza
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
    // Tanda 3: cuando empieza el peligro (aguacero, temblor), quien está afuera deja lo que hace y corre a su casa.
    const peligro = !quieto && this.peligro();
    if (peligro && !this._peligro) for (const f of this.figuras) if (!f.oculto && f.p.semilla < .7) { f.espera = 0; f.ruta = []; }
    this._peligro = peligro;
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
        f.ruta = r; f.aCasa = !!d.casa; f.prisa = !!d.prisa; f.destino = d.lugar; f.mira = null; f.miraLuego = d.mira || null; f.oculto = false; f.andado = 0;
      }
      const d = f.ruta[0], dr = d.r - f.r, dc = d.c - f.c, dist = Math.hypot(dr, dc);
      if (dist < .02) {
        f.ruta.shift();
        // Al llegar se queda un buen rato: así hay menos gente andando a la vez y más quieta con sentido.
        if (!f.ruta.length) {
          const b = f.destino === 'trabajo' && f.p.trabajo !== null ? this.scene.S.map[f.p.trabajo].b : null;
          f.espera = b === 'mercado' ? 25 + Math.random() * 20 : f.destino === 'trabajo' ? 16 + Math.random() * 16 : f.destino === 'plaza' ? 12 + Math.random() * 14 : f.destino === 'juego' ? 9 + Math.random() * 7 : f.destino === 'luto' || f.destino === 'busqueda' || f.destino === 'enfermo' || f.destino === 'protesta' || f.destino === 'desempleo' || f.destino === 'fila' || f.destino === 'lustrar' || f.destino === 'serenata' ? 30 + Math.random() * 25 : f.destino === 'misa' || f.destino === 'mercadeo' ? 18 + Math.random() * 10 : f.destino === 'agua' ? 10 + Math.random() * 8 : 3 + Math.random() * 5;
          f.mira = f.miraLuego;
          if (b === 'mercado') { f.frente = 1; f.voltear = f.p.semilla < .5; } // el vendedor mira a la calle
          if (f.aCasa) f.oculto = true;
        }
        this.dibujar(f, false);
        continue;
      }
      // Saludo al cruzarse: si alguien que también camina pasa muy cerca, los dos se detienen un instante y se saludan
      // (se tocan el sombrero o alzan la mano), una sola vez cada tanto.
      if (this.saludoCruce(f)) { this.dibujar(f, false); continue; }
      // Arranca suave y anda a paso parejo; el paso va con la distancia recorrida (los pies no resbalan).
      f.andado += dt;
      const v = Math.min(dist, f.vel * (f.prisa ? 2.3 : 1) * dt * Math.min(1, .45 + f.andado * 1.4));
      f.r += dr / dist * v; f.c += dc / dist * v; f.fase += v * 13;
      // Solo gira si la dirección cambia de verdad (en las esquinas suavizadas no se voltea de un lado al otro).
      if (Math.abs(dc + dr) > dist * .3) f.frente = (dc + dr) >= 0 ? 1 : 0;
      if (Math.abs(dc - dr) > dist * .3) f.voltear = (dc - dr) < 0;
      this.dibujar(f, true);
    }
    this.luzDelDia();
  }
  saludoCruce(f) {
    if (f.gesto && f.gesto.saludo) { if (this.t < f.gesto.t0 + f.gesto.dur) return true; f.gesto = null; }
    if ((f._cruceT || 0) > this.t || f.oculto || f.prisa || !GESTOS[f.p.tipo] || !this.A) return false;
    f._cruceT = this.t + .5;
    for (const o of this.figuras) {
      if (o === f || o.oculto || o.prisa || !o.ruta.length || (o._saludoT || -99) > this.t - 25 || (f._saludoT || -99) > this.t - 25 || !GESTOS[o.p.tipo]) continue;
      if (Math.hypot(o.r - f.r, o.c - f.c) > .3) continue;
      for (const [a, b] of [[f, o], [o, f]]) { a._saludoT = this.t; this.mirar(a, b); const L = GESTOS[a.p.tipo], k = L.includes('sombrero') ? 'sombrero' : 'saludo'; a.gesto = { k, t0: this.t, dur: 1.1, saludo: true }; }
      return true;
    }
    return false;
  }
  mirar(f, q) { const dr = q.r - f.r, dc = q.c - f.c; if (Math.abs(dr) + Math.abs(dc) < .01) return; f.frente = (dc + dr) >= 0 ? 1 : 0; f.voltear = (dc - dr) < 0; }

  dibujar(f, andando, postura, accion) {
    const T = this.scene.T, p = P(f.r, f.c, T.hf(f.r, f.c)), paso = andando ? PASOS12[Math.floor(f.fase * 3) % 12] : (postura || 0); // doce cuadros: andar suave
    let clave = null;
    if (f.gesto && f.gesto.saludo && this.t < f.gesto.t0 + f.gesto.dur) clave = this.claveGesto(f); // saludo al cruzarse
    else if (accion === 'social') clave = this.gestoDe(f);
    else if (accion === 'protesta') clave = f.frente ? `${f.p.tipo}_${f.p.vi}_saludo_${1 + Math.floor(this.t * .7 + f.p.semilla * 5) % 2}` : null; // brazo en alto, sin agitarlo
    else if (accion && this.A && ACCIONES[f.p.tipo][accion]) {
      // Oficios con su ritmo: el ciclo se juega y luego hay una pausa; cada quien a destiempo de los demás.
      const N = ACCIONES[f.p.tipo][accion], t = this.t + f.p.semilla * 7;
      const ph = TRABAJO.has(accion) ? ritmo(t, 1.7 + f.p.semilla * .9) : (t * (LENTO[accion] || .8)) % 1;
      clave = `${f.p.tipo}_${f.p.vi}_${accion}_${Math.min(N - 1, Math.floor(ph * N))}`;
    }
    if (clave && this.A.marcos[clave]) { if (f.tex !== 'acciones') { f.img.setTexture('acciones'); f.tex = 'acciones'; } f.img.setFrame(clave); }
    else { if (f.tex === 'acciones') { f.img.setTexture('personas'); f.tex = 'personas'; } f.img.setFrame(`${f.p.tipo}${this.ropa || ''}_${f.p.vi}_${f.frente}_${paso}`); }
    f.img.setPosition(p[0], p[1]).setFlipX(f.voltear).setDepth(f.r + f.c + .01).setVisible(!f.oculto);
    // Tanda 3: quien protesta lleva una pancarta (también mientras camina a la plaza).
    const conPancarta = f.destino === 'protesta' && !f.oculto && f.p.semilla < .45 && this.scene.textures.exists('cinePancarta');
    if (conPancarta && !f.pancarta) f.pancarta = this.scene.add.image(0, 0, 'cinePancarta').setScale(.3 / 4).setOrigin(.5, 1);
    if (f.pancarta) { f.pancarta.setVisible(conPancarta); if (conPancarta) f.pancarta.setPosition(p[0] + (f.voltear ? -3 : 3), p[1] - 12).setDepth(f.r + f.c + .015); }
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
    // Faroles de la plaza (desde la plaza mayor): cuatro luces cálidas en las esquinas que se encienden de noche.
    const { S, T } = this.scene, pz = plazaDe(S);
    if (pz >= 0 && S.stage >= 1) {
      const N = T.N, r = Math.floor(pz / N), c = pz % N;
      for (const [dr, dc] of [[.08, .08], [.08, .92], [.92, .08], [.92, .92]]) {
        const q = P(r + dr, c + dc, T.hf(r + dr, c + dc));
        this.luces.push(this.scene.add.image(q[0], q[1] - 13, 'personas', 'luz').setScale(.42).setAlpha(0).setDepth(40001).setData('fase', Math.random() * 6));
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

  destruir() { this.figuras.forEach(f => { f.img.destroy(); if (f.pancarta) f.pancarta.destroy(); }); this.luces.forEach(l => l.destroy()); this.noche.destroy(); this.ocaso.destroy(); }
}
