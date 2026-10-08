// Escena del mapa: el territorio en acuarela, sus obras y la cámara.
// Celular: arrastrar con un dedo, pellizcar con dos, tocar una casilla para ver su ficha o construir.
// Computador: arrastrar con el ratón, rueda para acercar, flechas para mover, + y − para el zoom, 0 para ver todo, B para construir, Esc para soltar.
import { epocaVisual, barriosActivos, barrios, precioAlimento, coberturaActiva, puntosDe, serviciosDeCasa, SERVICIOS, porEtapas, reparar, nivelObra, lluvias, terrenoDe, desvios, build, undoBuild, demolish, whyNot, freeTiles, advance, choose, checkGuide, clamp, C, iniciarCalles, dibujoCalles, trazarCalle, costoCalle, construirCalle, quitarCalles, callesActivas, esquina, bordeBloqueado, fincasActivas, migrarFincas, subidaPisos, glaciar, industriaActiva, produccionFabrica, faltaFundar, avisoVecindad, tumbasDe, lutoVisible, epidemiaVisible, plazaFundacion, centroPueblo, leyesVisibles, quemadaVisible } from '../core/index.js';
import { pintarSector, pintarFondo, caminoRio, sectoresAfectados, LADO_SECTOR } from '../arte/terreno.js';
import { hornearNaturaleza, colocarNaturaleza, arbolesDeBosque, toconesDe } from '../arte/naturaleza.js';
import { hornearEdificios, figurasDeObra } from '../arte/edificios.js';
import { pintarNiebla, lienzo } from '../arte/acuarela.js';
import { ES_CELULAR } from '../arte/fresco.js';
import { P, TW, casillaEn } from '../arte/iso.js';
import { DPR, tam, reducirMovimiento } from './pantalla.js';
import { partida, nuevaPartida } from './partida.js';
import { Interfaz } from './Interfaz.js';
import { Pobladores } from './Pobladores.js';
import { Efectos } from './Efectos.js';
import { Vida } from './Vida.js';
import { Trafico } from './Trafico.js';
import { Cine } from './Cine.js';
import { Frontera } from './Frontera.js';
import { Ferrovia } from './Ferrovia.js';
import { Navegacion } from './Navegacion.js';
import { Transporte } from './Transporte.js';
import { Sonido } from './sonido.js';
import { guardarYa, quiereSonido } from './memoria.js';

// Huellas grandes que despejan la vegetación de su casilla (fase 6: megaproyectos e inventos).
const GRANDES = new Set(['megaobra', 'represa', 'ferrocarril', 'aeropuerto', 'electricidad', 'automatizacion', 'imprenta', 'asentamiento', 'colono', 'arriendo', 'sorteo', 'resguardo', 'trinchera']);
const ZOOM_MAX = 2.6; // más cerca, el terreno pintado se vería pixelado
const PROF_FONDO = -3000, PROF_TERRENO = -2000, PROF_BRILLO = -900, PROF_POSIBLES = -850, PROF_MARCA = -800, PROF_NIEBLA = 50000;

export class Mapa extends Phaser.Scene {
  constructor() { super('Mapa'); }

  init(datos) { this.semilla = datos && datos.semilla; this.nueva = !!(datos && datos.nueva); this.opciones = (datos && datos.opciones) || {}; }

  async create() {
    const cam = this.cameras.main;
    cam.setOrigin(0, 0).setBackgroundColor('#E6DABF');
    this.listo = false;
    this.ui = new Interfaz(this);
    this.events.once('shutdown', () => {
      this.ui.destruir();
      if (this._toque) for (const ev of ['touchend', 'click', 'keydown']) document.removeEventListener(ev, this._toque);
      for (const k of ['fondo', ...Object.keys(this.sectores || {})]) if (this.textures.exists(k)) this.textures.remove(k);
    });
    this.ui.avisar('Pintando el territorio…');

    if (!partida.S || this.nueva) await nuevaPartida(this.semilla, this.opciones);
    this.S = partida.S;
    migrarFincas(this.S); // fase 10: cafetales y cultivos viejos pasan a ser fincas
    iniciarCalles(this.S); // fase 9: las partidas sin calles reciben una plaza alrededor del centro
    this.dibCalles = dibujoCalles(this.S);
    this.T = terrenoDe(this.S, desvios(this.S)); // fase 6: con los cambios de curso del río
    this.desviosVistos = desvios(this.S).length;
    // Resolución del terreno: alta en pantallas nítidas; en mapas grandes se baja para no llenar la memoria.
    this.escalaSector = (DPR > 2.5 ? 1.6 : DPR > 1.5 ? 1.8 : 1.5) * Math.min(1, 32 / this.S.n); // fase 8: algo menos en pantallas muy nítidas (iPhone), para dar margen de memoria
    this.dry = sequedad(this.S);
    this.vistaInicial();

    // Fondo lejano y sombra del diorama.
    this.subidaVista = subidaPisos(this.S); this.glaciarVisto = glaciar(this.S); // fase 10: el clima del territorio
    const f = pintarFondo(this.T, Math.min(1.1, 3600 / (this.T.N * 64 + 600)), this.glaciarVisto); // fase 8: más resolución, sin pasar de 3600 px de ancho (límite seguro en celulares)
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
    this.huellasVistas = this.S.map.map((x, i) => this.huella(x, i));
    this.ponerVida();
    this.pob = new Pobladores(this);
    this.vida = new Vida(this);
    this.efectos = new Efectos(this);
    this.trafico = new Trafico(this);
    this.cine = new Cine(this);
    this.frontera = new Frontera(this);
    this.ferrovia = new Ferrovia(this); // rieles, tren y avión
    this.navegacion = new Navegacion(this); // champanes y vapores
    this.transporte = new Transporte(this); // camiones y cable aéreo
    this.efectos.actualizar(); this.efectos.humoIncendio();
    this.posibles = this.add.graphics().setDepth(PROF_POSIBLES);
    this.capaCob = this.add.graphics().setDepth(PROF_POSIBLES - .5); // fase 2: capa de cobertura
    this.verCobertura = false;
    this.marcaG = this.add.graphics().setDepth(PROF_MARCA);
    this.rutaG = this.add.graphics().setDepth(PROF_MARCA + 1); // fase 9: la calle que se está trazando
    this.activarControles();
    this.ui.avisar('');
    this.ui.render();
    this.listo = true;
    guardarYa(this.S);
    // Si el jugador dejó el sonido encendido, vuelve con el primer toque (los navegadores lo exigen así).
    // El sonido arranca con el primer toque (en iPhone debe ser un toque completo: touchend o click) y se reactiva si el
    // aparato lo suspende (por ejemplo, al volver a la app).
    if (!this._toque) {
      this._toque = () => { if (quiereSonido() && !Sonido.on) { Sonido.start(); this.ui.render(); } else Sonido.despertar(); };
      for (const ev of ['touchend', 'click', 'keydown']) document.addEventListener(ev, this._toque);
    }
    // Al empezar: la bienvenida en una partida nueva, o el dilema pendiente si lo hay.
    if (this.nueva && this.opciones.bienvenida) this.ui.ayuda(true);
    else if (this.S.pend) this.ui.suceso(() => this.ui.render());
    this.etapaVista = this.S.stage; this.regVisto = this.S.reg;
    console.info(`Territorio ${N}×${N} pintado en ${this.tiempoPintura} ms`);
  }

  // ---------- Terreno ----------
  pintarSector(sr, sc) {
    const clave = `sector-${sr}-${sc}`, previo = this.sectores[clave];
    const s = pintarSector(this.T, sr, sc, { escala: this.escalaSector, mapa: this.S.map, dry: this.dry, calles: this.dibCalles, anio: this.S.year, subida: this.subidaVista || 0 });
    if (previo) { previo.destroy(); this.textures.remove(clave); }
    this.textures.addCanvas(clave, s.canvas);
    this.sectores[clave] = this.add.image(s.x, s.y, clave).setOrigin(0).setScale(1 / s.escala).setDepth(PROF_TERRENO + (sr + sc) * .01);
  }

  // ---------- Figuras: naturaleza y edificios ----------
  prepararHojas() {
    const nat = hornearNaturaleza(this.dry), edi = hornearEdificios(epocaVisual(this.S)); // las obras públicas de la época
    for (const [clave, h] of [['naturaleza', nat], ['edificios', edi]]) {
      // La textura usa su propio lienzo (una copia): así, al repintar la naturaleza por la sequía,
      // nunca se borra el lienzo guardado en la memoria de horneados (antes los árboles podían desaparecer).
      if (!this.textures.exists(clave)) {
        // La naturaleza (con los animales que andan) va en un lienzo de lados potencia de dos: así tiene versiones
        // reducidas suaves y no tiembla al moverse. Los edificios, quietos y en una hoja muy alta, quedan igual.
        const pot = n => 2 ** Math.ceil(Math.log2(n)), copia = clave === 'naturaleza' && !ES_CELULAR && pot(h.canvas.height) <= 4096 ? lienzo(pot(h.canvas.width), pot(h.canvas.height)) : lienzo(h.canvas.width, h.canvas.height);
        copia.getContext('2d').drawImage(h.canvas, 0, 0);
        const tx = this.textures.addCanvas(clave, copia);
        for (const [k, m] of Object.entries(h.marcos)) tx.add(k, 0, m.x, m.y, m.w, m.h);
      } else {
        const tx = this.textures.get(clave), cv = tx.getSourceImage(), g = cv.getContext('2d');
        if (cv !== h.canvas) { g.clearRect(0, 0, cv.width, cv.height); g.drawImage(h.canvas, 0, 0); tx.refresh(); }
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
    let lista = [];
    if (x.b || x.t === 'rio' || x.dr > 0 || x.er >= 2 || (x.mk && GRANDES.has(x.mk.t))) lista = []; // obra, derrumbe, ladera muy erosionada o huella grande
    else if (x.q > 0) lista = toconesDe(this.T, i);                       // cenizas de un incendio
    else if (x.t === 'bosque' && t.b !== 'niebla') lista = arbolesDeBosque(this.T, i); // bosque que volvió
    else if (!(t.b === 'niebla' && x.t !== 'bosque')) lista = (this.plantasPorCasilla[i] || []).filter(o => !Vida.esAnimal(o.k));
    // El bosque joven crece poco a poco durante sus primeros años.
    const edad = x.t === 'bosque' && x.nb ? this.S.year - x.nb : 9, crece = edad <= 1 ? .55 : edad === 2 ? .8 : 1;
    // Las vacas y garzas las mueve Vida.js; los árboles guardan cuánto se mecen.
    this.plantas[i] = lista.map(o => this.figura('naturaleza', o.k, o.r, o.c, this.T.hf(o.r, o.c), o.s * crece).setData('arbol', Vida.vaiven(o.k)));
  }
  ponerObra(i) {
    (this.obras[i] || []).forEach(p => p.destroy());
    if (this.humos[i]) { this.humos[i].destroy(); delete this.humos[i]; }
    const x = this.S.map[i];
    this.obras[i] = [];
    // Fase 4: huella de una decisión en una casilla libre.
    if (!x.b && x.mk) { const t = this.T.tiles[i]; this.obras[i].push(this.figura('edificios', 'm_' + x.mk.t, t.r + .5, t.c + .5, t.h, .9).setDepth(t.r + t.c + 1)); return; }
    if (!x.b) return;
    const t = this.T.tiles[i], deSuelo = x.b === 'cultivo' || x.b === 'cafetal';
    // Fase 1: desgaste visible (0 buen estado, 1 gastada, 2 agrietada, 3 abandonada).
    const nivel = this.S.desgaste && x.u ? nivelObra(x) : 0;
    // Fase 2: obra en construcción: cimientos, muros que suben con andamio y material; gris si está detenida.
    const ob = x.ob, sube = ob ? (ob.n === 3 ? [0, .55, 1][ob.p - 1] : ob.n === 2 ? [.5, 1][ob.p - 1] : .6) : 1;
    if (ob) {
      const H = this.hojas.edificios, c0 = P(t.r + .5, t.c + .5, t.h), gris = ob.det >= C.OBRAS.aniosElefante ? 0x9A9288 : ob.det ? 0xC4BDB2 : 0;
      const pone = (k, dx, dy, dz = 0) => { const img = this.add.image(c0[0] + dx, c0[1] + dy, 'edificios', k).setOrigin(H.marcos[k].ax / H.marcos[k].w, H.marcos[k].ay / H.marcos[k].h).setScale(1 / H.escala).setDepth(t.r + t.c + 1 + dz); if (gris) img.setTint(gris); this.obras[i].push(img); return img; };
      pone('cimientos', 0, 0, -.2);
      pone('material', 20, 8, .4);
      if (sube > 0) {
        for (const f of figurasDeObra(x.b, i, this.S.stage, this.S.reg, epocaVisual(this.S))) {
          if (f.n || f.k.startsWith('bandera')) continue;
          const img = this.figura('edificios', f.k, t.r + .5 + (f.dv || 0), t.c + .5 + (f.du || 0), t.h, f.s || 1).setDepth(t.r + t.c + 1);
          const m = H.marcos[f.k], y0 = Math.round(m.ay * (1 - sube));
          if (sube < 1) img.setCrop(0, y0, m.w, m.h - y0);
          img.setTint(gris || 0xF4EEE2);
          this.obras[i].push(img);
          // El andamio cubre el ancho del edificio y la altura que ya tienen los muros.
          const a = pone('andamio', 0, 2, .05), alto = Math.max(14, (m.ay / H.escala) * sube + 6);
          a.setScale(Math.min(1.2, img.displayWidth * .8 / 52) / H.escala, Math.min(1.3, alto / 50) / H.escala).setAlpha(.9);
        }
      }
      if (gris && ob.det >= C.OBRAS.aniosElefante) this.desgasteVisible(i, 3);
      return;
    }
    // Huellas, paso 1: una obra derrumbada por un desastre se ve en ruinas hasta reconstruirla.
    if (x.ru && nivel === 3) {
      this.obras[i].push(this.figura('edificios', 'ruina', t.r + .5, t.c + .5, t.h, x.b === 'casa' ? .9 : 1.1).setDepth(t.r + t.c + 1));
      this.desgasteVisible(i, 3);
      return;
    }
    const vacio = x.b === 'mercado' && precioAlimento(this.S) >= 1.3; // fase 2: comida cara, puestos vacíos
    const kObra = x.b === 'cultivo' && x.cv ? ({ cafe: 'cafetal', cacao: 'cafetal', pancoger: 'cultivo', platano: 'cultivo' }[x.cv] || 'finca') : x.b === 'taller' && (x.pr || x.nv) ? `taller-${x.pr || 'artesanias'}-${x.nv || 0}` : x.b; // fase 10: sombrío según el cultivo; fase 11: la carga de la fábrica
    for (const f of figurasDeObra(kObra, i, this.S.stage, this.S.reg, epocaVisual(this.S))) {
      if (nivel === 3 && f.k.startsWith('bandera')) continue;
      if (vacio && f.k.startsWith('mercado')) f.k += 'v';
      if (nivel >= 1 && x.b === 'casa' && /^casa\d-\d$/.test(f.k)) f.k += 'h'; // renovación colonial: casa gastada con humedad y cal caída
      const r = t.r + .5 + (f.dv || 0), c = t.c + .5 + (f.du || 0), h = f.n || deSuelo ? this.T.hf(r, c) : t.h;
      const img = this.figura(f.n ? 'naturaleza' : 'edificios', f.k, r, c, h, f.s || 1);
      if (f.z) img.y -= f.z;
      img.setDepth(t.r + t.c + 1 + (f.dv || 0) + (f.du || 0));
      // El puerto y el molino miran hacia el río: si el agua está al lado derecho, se voltea el dibujo.
      if ((x.b === 'puerto' || x.b === 'molino') && this.rioADerecha(i)) img.setFlipX(true).setOrigin(1 - img.originX, img.originY);
      if (x.b === 'iglesia' && this.plazaADerecha(i)) img.setFlipX(true).setOrigin(1 - img.originX, img.originY); // la fachada mira a la plaza
      if (nivel) img.setTint(f.n ? [0, 0xF2EEDC, 0xE0D6B4, 0xC8B98A][nivel] : [0, 0xE6DCCB, 0xD2C6B2, 0xA0978B][nivel]);
      this.obras[i].push(img);
      if (nivel === 3) continue; // sin humo: nadie cocina en una obra abandonada
      if (x.b === 'casa' && i % 3 === 0 && !f.k.startsWith('bandera') && !reducirMovimiento()) {
        // Humo del fogón en algunas casas.
        const alto = this.S.stage >= 2 ? 30 : 22;
        this.humos[i] = this.add.particles(img.x + 7, img.y - alto, 'edificios', { frame: 'humo', lifespan: 2600, speedX: { min: 1, max: 4 }, speedY: { min: -7, max: -4 }, scale: { start: .06, end: .28 }, alpha: { start: .35, end: 0 }, frequency: 900, quantity: 1 }).setDepth(t.r + t.c + 1.5);
      }
      if (f.humo && !reducirMovimiento() && this.fabricaViva(i, x)) {
        this.humos[i] = this.add.particles(img.x + f.humo[0], img.y + f.humo[1], 'edificios', {
          frame: 'humo', lifespan: 3400, speedX: { min: 2, max: 6 }, speedY: { min: -9, max: -6 }, scale: { start: .12, end: .45 },
          alpha: { start: .45, end: 0 }, frequency: 420, quantity: 1
        }).setDepth(t.r + t.c + 1.5);
      }
    }
    if (nivel >= 2) this.desgasteVisible(i, nivel);
    this.huellasDeObra(i, x, t);
  }
  // Fase 17: una fábrica sin energía o sin materia prima no echa humo.
  fabricaViva(i, x) { const S = this.S; if (x.b !== 'taller' || !industriaActiva(S)) return true; const P = produccionFabrica(S, i); return P.encendida && P.f > 0; }
  huellaExtra(x, i) {
    const S = this.S;
    if (x.b === 'taller' && industriaActiva(S) && !this.fabricaViva(i, x)) return 'ap';
    if (!C.HUELLAS) return '';
    const ly = (x.b ? this.leyesAqui(i, x).join(',') : '') + (x.b && quemadaVisible(S, x) ? 'q' : '');
    if (x.b === 'cementerio') return 't' + Math.ceil(tumbasDe(S, i) * 12 / C.HUELLAS.cementerio.capacidad);
    if (x.b === 'casa' && i % 3 === 1) return (epidemiaVisible(S) ? 'e' : '') + ly;
    return (i === this.plazaLuto() && lutoVisible(S) ? 'l' : '') + ly;
  }
  // Huellas, paso 1: tumbas en el cementerio, velas de luto en la plaza y banderas amarillas en una epidemia.
  huellasDeObra(i, x, t) {
    const S = this.S, pon = (k, dv, du, s = 1) => { const r = t.r + .5 + dv, c = t.c + .5 + du; this.obras[i].push(this.figura('edificios', k, r, c, t.h, s).setDepth(t.r + t.c + 1 + dv + du + .02)); };
    if (x.b === 'cementerio') {
      const n = Math.min(12, Math.ceil(tumbasDe(S, i) * 12 / C.HUELLAS.cementerio.capacidad));
      for (let k = 0; k < n; k++) pon('tumba', -.18 + Math.floor(k / 4) * .2, -.2 + (k % 4) * .16, .95);
    }
    if (lutoVisible(S) && i === this.plazaLuto()) pon('velas', .28, -.05, .9);
    if (x.b === 'casa' && i % 3 === 1 && epidemiaVisible(S)) pon('bandera-amarilla', .22, -.22, .9);
    // Paso 4: una obra quemada en la guerra o en una toma: muros ahumados y hollín.
    if (quemadaVisible(S, x)) { for (const im of this.obras[i]) if (im.texture.key === 'edificios') im.setTint(0x8C8076); pon('hollin', -.05, -.05, 1); }
    // Paso 3: la señal de cada ley vigente que toca esta obra (en la plaza, alrededor de la cruz).
    const L = this.leyesAqui(i, x), plaza = i === this.plazaLuto();
    const sitios = plaza ? [[.38, .2], [.2, .38], [.38, -.3], [-.3, .38], [.05, .42], [.42, .05], [-.38, -.1], [-.1, -.38]] : [[.34, .3], [.3, -.3], [-.3, .34]];
    L.forEach((id, k) => { const [dv, du] = sitios[k % sitios.length]; pon('ley_' + id, dv, du, .85); });
  }
  // Leyes vigentes que se ven en la casilla i: en su obra (las primeras, repartidas) o en la plaza.
  leyesAqui(i, x) {
    const S = this.S, H = C.HUELLAS && C.HUELLAS.leyes;
    if (!H || !x.b) return [];
    // Dónde va cada ley se calcula una vez por momento (muchas casillas preguntan seguido).
    const ahora = Math.floor(performance.now() / 40);
    if (!this._leyes || this._leyes.t !== ahora) {
      const plaza = this.plazaLuto(), donde = {};
      for (const [id, v] of Object.entries(H)) {
        if (!S.laws || S.laws[id] === undefined) continue;
        const tipo = v.en.find(t => t === 'plaza' ? plaza >= 0 : S.map.some(y => y.b === t && !y.ob));
        if (!tipo || tipo === 'resguardo') continue;
        const L = tipo === 'plaza' ? [plaza] : S.map.map((y, j) => v.en.includes(y.b) && !y.ob && !y.ru ? j : -1).filter(j => j >= 0).sort((a, b) => (a * 7919) % 1009 - (b * 7919) % 1009).slice(0, v.max);
        for (const j of L) (donde[j] = donde[j] || []).push(id);
      }
      this._leyes = { t: ahora, donde };
    }
    return this._leyes.donde[i] || [];
  }
  plazaLuto() { const p = plazaFundacion(this.S); return p >= 0 ? p : centroPueblo(this.S); }
  // Grietas en el muro y maleza al pie de una obra descuidada.
  desgasteVisible(i, nivel) {
    const t = this.T.tiles[i], H = this.hojas.edificios, base = this.obras[i].find(im => im.texture.key === 'edificios');
    if (base) for (let k = 0; k < nivel - 1 + (i % 2); k++) {
      const w = base.displayWidth, h = base.displayHeight, lado = (k % 2 ? 1 : -1) * (.1 + (i * 13 + k * 7) % 10 / 100);
      // En los muros (la parte baja del dibujo), no en el techo.
      const img = this.add.image(base.x + (base.flipX ? -lado : lado) * w, base.y - h * (.13 + (k % 2) * .05), 'edificios', 'grieta')
        .setScale(.5 / H.escala).setDepth(base.depth + .01).setAlpha(nivel === 3 ? .95 : .75);
      this.obras[i].push(img);
    }
    // Maleza en los bordes de la casilla (sin tapar la fachada).
    const sitios = [[.9, .12], [.12, .9], [.55, .92], [.92, .55], [.1, .3], [.3, .1]];
    for (let k = 0; k < (nivel === 3 ? 5 : 2); k++) {
      const [dv, du] = sitios[(k + i) % sitios.length], r = t.r + dv, c = t.c + du, p = P(r, c, this.T.hf(r, c));
      this.obras[i].push(this.add.image(p[0], p[1], 'edificios', 'maleza').setOrigin(.5, 11 / 14).setScale((.5 + (k * 17 % 5) / 20) / H.escala).setDepth(r + c));
    }
  }
  // La plaza de fundación queda en la casilla de la columna siguiente: la fachada de la iglesia se voltea hacia ella.
  plazaADerecha(i) { const N = this.T.N, p = this.S.map.findIndex(x => x.b === 'fundacion'); return p >= 0 && Math.floor(p / N) === Math.floor(i / N) && p % N === i % N + 1; }
  rioADerecha(i) {
    const N = this.T.N, r = Math.floor(i / N), c = i % N, rio = (R, C) => R >= 0 && C >= 0 && R < N && C < N && this.S.map[R * N + C].t === 'rio';
    return !rio(r + 1, c) && (rio(r, c + 1) || rio(r - 1, c));
  }
  // Tras un cambio en la casilla i: plantas, figuras y solo los sectores del terreno afectados.
  refrescarCasilla(i) {
    this.ponerPlantas(i); this.ponerObra(i);
    for (const [sr, sc] of sectoresAfectados(this.T, i)) this.pintarSector(sr, sc);
    this.revisarCambiosGenerales();
    this.dibujarCobertura();
    if (this.pob) this.pob.planear();
    if (this.vida) this.vida.poner();
  }
  // Huella de una casilla: si cambia al cerrar el año (bosque, cenizas, erosión, derrumbe, obra), se redibuja.
  huella(x, i) { return `${this.huellaExtra(x, i)}|${x.ru ? 'r' : ''}|${x.mk ? x.mk.t + x.mk.y : ''}|${x.t}|${x.b}|${x.q || 0}|${x.er || 0}|${x.dr || 0}|${x.nb ? Math.min(3, this.S.year - x.nb) : ''}|${x.b && x.u ? nivelObra(x) : 0}|${x.ob ? x.ob.p + '-' + Math.min(2, x.ob.det) : ''}|${x.cv ? x.cv + (C.CULTIVOS && x.cvDesde !== undefined && this.S.year < x.cvDesde + C.CULTIVOS.cultivos[x.cv].madura ? 'j' : '') : ''}|${x.pr || ''}${x.nv || ''}`; } // fase 10: el cultivo y si ya produce
  // Fase 6: si el río cambió de curso, el terreno se vuelve a generar con el desvío y se repinta todo.
  revisarRio() {
    const n = desvios(this.S).length;
    if (n === this.desviosVistos) return false;
    this.desviosVistos = n;
    this.T = terrenoDe(this.S, desvios(this.S));
    this.rio = caminoRio(this.T).filter(x => x.r >= 0 && x.c >= 0 && x.r <= this.T.N && x.c <= this.T.N).map(x => x.p);
    this.largoRio = [0];
    for (let i = 1; i < this.rio.length; i++) this.largoRio.push(this.largoRio[i - 1] + Math.hypot(this.rio[i][0] - this.rio[i - 1][0], this.rio[i][1] - this.rio[i - 1][1]));
    return true;
  }
  refrescarCambios(antes) {
    const S = this.S, sectores = new Set(), cambiadas = [], rio = this.revisarRio();
    if (rio) this.dibCalles = dibujoCalles(S); // los puentes dependen del cauce
    S.map.forEach((x, i) => { if (rio || this.huella(x, i) !== antes[i]) cambiadas.push(i); });
    this.huellasVistas = S.map.map((x, i) => this.huella(x, i));
    if (!cambiadas.length) return;
    for (const i of cambiadas) {
      this.ponerPlantas(i); this.ponerObra(i);
      for (const [sr, sc] of sectoresAfectados(this.T, i)) sectores.add(sr + '-' + sc);
    }
    // Un sector por cuadro, para no congelar la pantalla.
    const cola = [...sectores].map(k => k.split('-').map(Number));
    const paso = () => { if (!this.sys.isActive()) return; const x = cola.shift(); if (x) { this.pintarSector(...x); requestAnimationFrame(paso); } };
    paso();
    if (this.pob) this.pob.planear();
    if (this.vida) this.vida.poner();
  }
  // Si cambian la etapa o el régimen, cambian las casas, los mercados y la sede.
  revisarCambiosGenerales() {
    const vacio = precioAlimento(this.S) >= 1.3;
    if (vacio !== this.mercadoVacio) { this.mercadoVacio = vacio; this.S.map.forEach((x, i) => { if (x.b === 'mercado') this.ponerObra(i); }); }
    const era = epocaVisual(this.S);
    if (this.S.stage === this.etapaVista && this.S.reg === this.regVisto && era === this.eraVista) return;
    if (this.eraVista !== undefined && era !== this.eraVista) { // otra época: las obras públicas cambian de dibujo
      const edi = hornearEdificios(era), tx = this.textures.get('edificios'), cv = tx.getSourceImage(), g = cv.getContext('2d');
      g.clearRect(0, 0, cv.width, cv.height); g.drawImage(edi.canvas, 0, 0); tx.refresh(); this.hojas.edificios = edi;
    }
    this.etapaVista = this.S.stage; this.regVisto = this.S.reg; this.eraVista = era;
    this.S.map.forEach((x, i) => { if (x.b) this.ponerObra(i); });
  }

  // ---------- Construir ----------
  // Fase 2: capa de cobertura. Colorea las casas según los servicios que tienen cerca y dibuja el alcance de cada
  // servicio. Con una obra de servicio elegida en Construir, muestra solo ese servicio.
  alternarCobertura() {
    this.verCobertura = !this.verCobertura;
    this.dibujarCobertura();
    if (this.verCobertura) this.ui.toast(coberturaActiva(this.S) ? C.COB.textos.capaAyuda : C.STAGES[1].n + ': la cobertura se abre al llegar a Pueblo.');
    this.ui.render();
  }
  dibujarCobertura() {
    const g = this.capaCob, S = this.S, T = this.T;
    g.clear();
    (this.etiquetas || []).forEach(t => t.destroy()); this.etiquetas = [];
    // Quita el color de las casas pintadas antes (vuelven a su tono normal o de desgaste).
    for (const i of this.casasTenidas || []) this.ponerObra(i);
    this.casasTenidas = [];
    const k = this.ui.herramienta, solo = SERVICIOS.includes(k) ? k : null;
    if (!coberturaActiva(S) || (!this.verCobertura && !solo)) return;
    const lista = solo ? [solo] : SERVICIOS, COL = { escuela: 0xD9A628, hospital: 0xC0392B, mercado: 0xD2691E, recaudo: 0x6E4B9E, policia: 0x2D5D72 };
    const N = T.N, en = (r, c) => P(Math.max(0, Math.min(N, r)), Math.max(0, Math.min(N, c)), T.hf(Math.max(0, Math.min(N - .01, r)), Math.max(0, Math.min(N - .01, c))));
    // Fase 5: nombres de los barrios sobre el mapa.
    if (this.verCobertura && barriosActivos(S)) for (const b of barrios(S)) {
      let r = 0, c = 0; for (const i of b.centro) { r += T.tiles[i].r; c += T.tiles[i].c; }
      r = r / b.centro.length + .5; c = c / b.centro.length + .5;
      const q = P(r, c, T.hf(Math.min(T.N - .01, r), Math.min(T.N - .01, c)));
      this.etiquetas.push(this.add.text(q[0], q[1] - 26, `${b.nombre}`, { fontFamily: 'Alegreya Sans, sans-serif', fontSize: '22px', color: '#22291F', stroke: '#F6F8F4', strokeThickness: 5 }).setOrigin(.5).setScale(.5).setDepth(40000));
    }
    for (const s of lista) for (const p of puntosDe(S, s)) {
      const t = T.tiles[p.i], pts = [];
      for (let a = 0; a <= 48; a++) { const q = en(t.r + .5 + Math.cos(a / 48 * Math.PI * 2) * p.r, t.c + .5 + Math.sin(a / 48 * Math.PI * 2) * p.r); pts.push({ x: q[0], y: q[1] }); }
      g.fillStyle(COL[s], .04).fillPoints(pts, true).lineStyle(1.4, COL[s], .8).strokePoints(pts, true);
    }
    S.map.forEach((x, i) => {
      if (x.b !== 'casa' || x.ob || x.u >= 80) return;
      const sv = serviciosDeCasa(S, i), n = lista.filter(s => sv[s]).length, t = T.tiles[i];
      const col = n === lista.length ? 0x3F9A4A : n >= lista.length / 2 ? 0xE0B040 : 0xC0392B;
      const q = [P(t.r - .05, t.c - .05, t.h00), P(t.r - .05, t.c + 1.05, t.h01), P(t.r + 1.05, t.c + 1.05, t.h11), P(t.r + 1.05, t.c - .05, t.h10)].map(p => ({ x: p[0], y: p[1] }));
      g.fillStyle(col, .5).fillPoints(q, true);
      // La casa misma toma el color: verde, amarillo o rojo.
      for (const img of this.obras[i] || []) if (img.texture.key === 'edificios') img.setTint(col === 0x3F9A4A ? 0xB6E3A8 : col === 0xE0B040 ? 0xF6DE8A : 0xF4A08E);
      this.casasTenidas.push(i);
    });
  }
  marcarPosibles(k) {
    this.posibles.clear();
    this.dibujarCobertura();
    if (k !== 'calle' && this.trazoCalle) { this.trazoCalle = null; this.dibujarTrazo(); }
    if (!k) return;
    if (k === 'calle' || k === 'quitarCalle') return this.marcarEsquinas();
    this.posibles.fillStyle(0xF2C94C, .16).lineStyle(1, 0xF2C94C, .55);
    for (const i of freeTiles(this.S, k)) {
      const t = this.T.tiles[i], q = [P(t.r + .08, t.c + .08, t.h00), P(t.r + .08, t.c + .92, t.h01), P(t.r + .92, t.c + .92, t.h11), P(t.r + .92, t.c + .08, t.h10)].map(p => ({ x: p[0], y: p[1] }));
      this.posibles.fillPoints(q, true).strokePoints(q, true);
    }
  }
  construir(k, i, ofertaElegida) {
    const antes = this.S.map[i].b, r = build(this.S, k, i, ofertaElegida);
    if (this.S.map[i].b !== k || antes === k) { this.ui.toast(typeof r === 'string' ? r : 'No se puede construir ahí.'); return; }
    this.refrescarCasilla(i);
    this.animarObra(i);
    Sonido.tap();
    if (k === 'iglesia') setTimeout(() => Sonido.campanas(), 500); // las campanas de la iglesia nueva
    if (k === 'cultivo' && fincasActivas(this.S)) setTimeout(() => this.ui.tarjetaCultivo(i), 350); // fase 10: elegir qué sembrar
    if (k === 'taller' && industriaActiva(this.S)) setTimeout(() => this.ui.tarjetaProducto(i), 350); // fase 11: elegir qué producir
    this.ui.logros();
    const guia = checkGuide(this.S);
    const ob = this.S.map[i].ob, empieza = ob ? C.OBRAS.textos.empieza.replace('{obra}', k === 'taller' && industriaActiva(this.S) ? 'una fábrica' : C.B[k].a).replace('{n}', ob.n === 1 ? 'un año' : ob.n + ' años') : '';
    const vec = avisoVecindad(this.S, i, k); // vecindad: molestias o parque junto a las casas
    if (typeof r === 'string' || guia || empieza || vec) this.ui.toast([empieza, typeof r === 'string' ? r : '', vec, guia || ''].join(' ').trim());
    this.marcarPosibles(this.ui.herramienta);
    this.ui.render();
  }
  // Una obra nueva aparece creciendo desde el suelo, con una nube de polvo.
  animarObra(i) {
    this.polvo(i);
    if (reducirMovimiento()) return;
    for (const img of this.obras[i] || []) {
      const sy = img.scaleY, a = img.alpha;
      img.setScale(img.scaleX, sy * .25).setAlpha(.3);
      this.tweens.add({ targets: img, scaleY: sy, alpha: a, duration: 480, ease: 'Back.out' });
    }
  }
  polvo(i) {
    if (reducirMovimiento()) return;
    const t = this.T.tiles[i], p = P(t.r + .5, t.c + .5, t.h);
    const e = this.add.particles(p[0], p[1], 'edificios', { frame: 'humo', lifespan: 900, speed: { min: 8, max: 26 }, angle: { min: 180, max: 360 }, scale: { start: .25, end: .6 }, alpha: { start: .5, end: 0 }, tint: 0xB9A27E, emitting: false }).setDepth(t.r + t.c + 2);
    e.explode(14);
    this.time.delayedCall(1200, () => e.destroy());
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
    this.polvo(i);
    this.refrescarCasilla(i);
    this.ui.cerrarFicha(); this.ui.render();
    this.ui.toast(`Demoliste ${C.B[k].a}: recuperaste ${g} de oro.`);
  }
  // Fase 1: reparar una obra gastada (o todas las agrietadas y abandonadas).
  repararObra(i) {
    const r = reparar(this.S, i);
    if (r !== true) { this.ui.toast(r); return; }
    Sonido.chime(); this.polvo(i); this.ponerObra(i); this.cambio(true);
    this.ui.cerrarFicha(); this.ui.render(); this.ui.toast('Obra reparada: vuelve a estar en buen estado.');
    guardarYa(this.S);
  }
  repararTodo() {
    const S = this.S, lista = S.map.map((x, i) => i).filter(i => S.map[i].b && nivelObra(S.map[i]) >= 2);
    let n = 0;
    for (const i of lista) if (reparar(S, i) === true) { n++; this.ponerObra(i); }
    if (n) { Sonido.chime(); this.cambio(true); guardarYa(S); }
    this.ui.toast(n ? `Reparaste ${n} obras.` : 'No alcanza el oro para reparar.');
  }
  otroTerritorio() { this.scene.restart({ nueva: true, semilla: Math.floor(Math.random() * 899999) + 100000 }); }

  // ---------- Fin de año (como en la v9) ----------
  terminarAnio() {
    const S = this.S;
    if (!this.listo || S.pend || S.over || this.ui.hayTarjeta() || this.cerrandoAnio || (this.cine && this.cine.activo)) return;
    const ff = faltaFundar(S); if (ff && !ff.alguna) { this.ui.toast(ff.plaza ? C.HUELLAS.fundacion.textos.primero : 'Primero funda la aldea: construye al menos una casa y una finca (Construir).'); return; } // pedido de Juan: fundar a elección
    this.ui.cerrarHojas(); this.ui.cerrarFicha();
    const g0 = S.gold, p0 = S.pop, f0 = S.food, t0 = S.tr, antes = S.map.map((x, i) => this.huella(x, i)), desgaste0 = S.desgaste;
    const r = advance(S);
    this.refrescarCambios(antes);
    const dg = Math.round(S.gold - g0), dp = S.pop - p0, hunger = !!(S.log[0] && S.log[0].t.includes('hambre'));
    const sg = v => (v >= 0 ? '+' : '−') + Math.abs(v);
    this.ui.pasoDelAnio('Año ' + S.year, `Oro ${sg(dg)}   ·   Habitantes ${sg(dp)}`);
    Sonido.chime();
    if (S.map.some(x => x.b === 'iglesia' && !x.ob)) setTimeout(() => Sonido.campanas(), 900); // las campanas marcan el año nuevo
    guardarYa(S);
    this.efectos.cierre({ dg, dp, df: S.food - f0, hunger, bad: dg < 0 || hunger || S.tr < t0 - 5 || !!S.regChange });
    this.cerrandoAnio = true;
    this.ui.bFin.disabled = true;
    const guia = r.end ? null : checkGuide(S);
    if (guia) this.ui.toast(guia);
    // Fase 7: en un año tranquilo (sin dilema, sin cambio de etapa ni de régimen) la pausa es más corta.
    const tranquilo = !r.end && !r.stageUp && !S.regChange && !S.pend;
    // Reloj del navegador (no el de Phaser, que se atrasa si el aparato va lento).
    setTimeout(() => {
      if (!this.sys.isActive()) return;
      this.cerrandoAnio = false;
      this.cambio(true);
      if (r.end) { S.over = true; guardarYa(S); this.ui.render(); this.ui.final(r.end); return; }
      this.ui.logros();
      const L = lluvias(S);
      if (L && L.cosecha !== 1) this.ui.toast(`${L.icono} ${L.texto}`);
      if (S.desgaste && !desgaste0) this.ui.toast(C.DESGASTE.textos.abre);
      const fin = () => this.ui.render();
      const sigue = () => {
        const dilema = () => this.ui.clima(() => this.ui.carta(() => this.ui.suceso(fin))), ed = S.avancesEv; // fase 13: la carta antes del dilema
        // Fase 11: los avances del año salen en El Pregonero (incluye el cambio de etapa).
        if (ed && ed.nuevo && ed.anio === S.year - 1) { ed.nuevo = false; this.ui.periodico(ed, dilema); } else if (r.stageUp) this.ui.etapa(dilema); else dilema();
      };
      if (S.regChange) this.ui.cambioRegimen(S.regChange, sigue); else sigue();
    }, reducirMovimiento() || tranquilo ? 800 : 1900);
  }
  elegirOpcion(i) { if (!this.S.pend) return null; const o = choose(this.S, i); this.cambio(true); return o; } // sin dilema pendiente, nada que elegir
  // Tras cualquier cambio: interfaz, figuras que dependen de etapa y régimen, pobladores, huellas y sequía.
  cambio(completo) {
    this._leyes = null; // huellas: las leyes pudieron cambiar
    this.ui.render();
    if (!completo) return;
    // Fase 6: lo que cambió por una decisión (huellas, megaproyectos, asentamientos) se ve al instante.
    if (this.huellasVistas) this.refrescarCambios(this.huellasVistas);
    this.revisarCambiosGenerales();
    this.refrescarCalles();
    this.pob.planear();
    this.efectos.actualizar(); this.efectos.humoIncendio();
    if (this.frontera) this.frontera.actualizar();
    if (this.ferrovia) this.ferrovia.actualizar();
    if (this.navegacion) this.navegacion.actualizar();
    if (this.transporte) this.transporte.actualizar();
    this.dibujarCobertura();
    const d = sequedad(this.S);
    // Fase 10: si los pisos térmicos subieron lo suficiente, se repinta el terreno (y el Nevado si perdió hielo).
    const sub = subidaPisos(this.S);
    if (Math.abs(d - this.dry) >= .15 || Math.abs(sub - (this.subidaVista || 0)) >= C.BIOMAS.repintar) { this.subidaVista = sub; this.repintarTodo(d); }
    const g = glaciar(this.S);
    if (Math.abs(g - this.glaciarVisto) >= .12) { this.glaciarVisto = g; this.repintarFondo(); }
  }
  repintarFondo() {
    const f = pintarFondo(this.T, Math.min(1.1, 3600 / (this.T.N * 64 + 600)), this.glaciarVisto), tx = this.textures.get('fondo'), cv = tx.getSourceImage();
    if (cv.width === f.canvas.width && cv.height === f.canvas.height) { const g = cv.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height); g.drawImage(f.canvas, 0, 0); tx.refresh(); } // sin la transformación de la primera pintura
  }
  // El paisaje se seca o reverdece según el ambiente: se repinta poco a poco, un sector por cuadro.
  repintarTodo(d) {
    this.dry = d;
    const nat = hornearNaturaleza(d), tx = this.textures.get('naturaleza'), cv = tx.getSourceImage(), g = cv.getContext('2d');
    if (cv !== nat.canvas) { g.clearRect(0, 0, cv.width, cv.height); g.drawImage(nat.canvas, 0, 0); tx.refresh(); }
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
      const img = this.add.image(p[0], p[1], 'bancoNiebla').setDisplaySize(150, 34).setAlpha(.3).setDepth(PROF_NIEBLA);
      if (!quieto) this.tweens.add({ targets: img, x: p[0] + 16, duration: 7000 + (i % 5) * 1300, yoyo: true, repeat: -1, ease: 'Sine.inOut', delay: i * 170 });
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
    this.vida.update(Math.min(.05, delta / 1000), tiempo / 1000);
    this.efectos.update(Math.min(.05, delta / 1000));
    this.trafico.update(Math.min(.05, delta / 1000));
    this.ferrovia.update(Math.min(.05, delta / 1000));
    this.navegacion.update(Math.min(.05, delta / 1000));
    this.transporte.update(Math.min(.05, delta / 1000));
    this.cine.update(Math.min(.05, delta / 1000));
    // Niebla más espesa en las mañanas (fase 1).
    const m = this.pob.manana(), a = .2 + .3 * m;
    if (Math.abs(a - (this._nieblaA || 0)) > .01) { this._nieblaA = a; for (const n of this.nieblas) n.setAlpha(a); }
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
  // Fase 4: la tierra tiembla (terremoto o erupción), salvo con «reducir movimiento».
  temblor() { if (!reducirMovimiento()) this.cameras.main.shake(700, .006); }
  // Lleva la cámara a una casilla (por ejemplo, la obra de un suceso).
  enfocarCasilla(i) { const t = this.T.tiles[i]; if (!t) return; const p = P(t.r + .5, t.c + .5, t.h); this.fijarCamara(Math.min(ZOOM_MAX, Math.max(this.cameras.main.zoom, 1.8)), p[0], p[1]); }
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
        '0': () => this.encuadrar(), c: () => this.alternarCobertura(), m: () => this.ui.tarjetaMundo(), v: () => this.ui.tarjetaPlano(), p: () => this.ui.tarjetaPendientes(), b: () => this.ui.alternarHoja('construir'),
        '1': () => this.ui.alternarHoja('construir'), '2': () => this.ui.alternarHoja('hacienda'), '3': () => this.ui.alternarHoja('sociedad'),
        '4': () => this.ui.alternarHoja('leyes'), '5': () => this.ui.alternarHoja('cronica'), ' ': () => this.terminarAnio(),
        Escape: () => { if (this.ui.herramienta) this.ui.elegir(null); else if (this.ui.hojaAbierta()) this.ui.cerrarHojas(); else this.ui.cerrarFicha(); }
      };
      if (this.cine && this.cine.activo) { if ([' ', 'Escape', 'Enter'].includes(e.key)) { this.cine.terminar(); e.preventDefault(); } return; } // fase 9: saltar la escena
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
    if ((k === 'calle' || k === 'quitarCalle') && !this.S.over) { this.tocarEsquina(cam.scrollX + px / this.escala, cam.scrollY + py / this.escala, k); return; }
    if (k && !this.S.over) {
      // Fase 2: las obras grandes pasan primero por la ficha del proyecto y la licitación.
      if (porEtapas(this.S, k) && !whyNot(this.S, k, i)) { this.marcar(i); this.ui.licitacion(k, i, id => this.construir(k, i, id)); return; }
      this.construir(k, i); return;
    }
    if (this.ui.hojaAbierta()) { this.ui.cerrarHojas(); return; }
    const f = this.pob.cercana(cam.scrollX + px / this.escala, cam.scrollY + py / this.escala);
    if (f) { this.marcar(null); this.ui.abrirPersona(f.p); return; }
    this.marcar(i);
    this.ui.abrirFicha(i);
  }
  // ---------- Calles (fase 9) ----------
  // Puntos en las esquinas donde se puede empezar o terminar una calle.
  marcarEsquinas() {
    const T = this.T, N = T.N, g = this.posibles;
    g.fillStyle(0x5B3423, .35);
    for (let r = 0; r <= N; r++) for (let c = 0; c <= N; c++) {
      const e = esquina(N, r, c), libre = [[r, c + 1], [r + 1, c], [r, c - 1], [r - 1, c]].some(([R, Cc]) => R >= 0 && Cc >= 0 && R <= N && Cc <= N && !bordeBloqueado(this.S, e, esquina(N, R, Cc)));
      if (!libre) continue;
      const p = P(r, c, T.hv(r, c)); g.fillCircle(p[0], p[1], 1.8);
    }
  }
  // Esquina más cercana a un punto del mundo (busca alrededor de la casilla tocada).
  esquinaEn(wx, wy) {
    const T = this.T, N = T.N, t = casillaEn(T, wx, wy);
    if (!t) return null;
    let mejor = null, d0 = 1e9;
    for (let r = t.r - 1; r <= t.r + 2; r++) for (let c = t.c - 1; c <= t.c + 2; c++) {
      if (r < 0 || c < 0 || r > N || c > N) continue;
      const p = P(r, c, T.hv(r, c)), d = Math.hypot(wx - p[0], (wy - p[1]) * 1.6);
      if (d < d0) { d0 = d; mejor = esquina(N, r, c); }
    }
    return mejor;
  }
  tocarEsquina(wx, wy, k) {
    const e = this.esquinaEn(wx, wy), T = C.CALLES.textos;
    if (e === null) return;
    if (k === 'quitarCalle') {
      const fuera = quitarCalles(this.S, e);
      if (fuera.length) { this.refrescarCalles(); Sonido.tap(); this.ui.render(); } else this.ui.toast('No hay calles en esa esquina.');
      return;
    }
    if (!this.trazoCalle || this.trazoCalle.ruta) this.trazoCalle = { inicio: e, ruta: null };
    else if (e !== this.trazoCalle.inicio) {
      const ruta = trazarCalle(this.S, this.trazoCalle.inicio, e);
      if (!ruta) { this.ui.toast(T.sinRuta); return; }
      this.trazoCalle.ruta = ruta;
    }
    this.dibujarTrazo();
    this.ui.render();
  }
  presupuestoCalle() { return this.trazoCalle && this.trazoCalle.ruta ? costoCalle(this.S, this.trazoCalle.ruta) : null; }
  confirmarCalle() {
    if (!this.trazoCalle || !this.trazoCalle.ruta) return;
    const r = construirCalle(this.S, this.trazoCalle.ruta);
    if (!r.ok) { this.ui.toast(r.motivo === 'ya' ? 'Esa calle ya existe.' : r.motivo); return; }
    this.trazoCalle = null; this.dibujarTrazo();
    this.refrescarCalles();
    Sonido.tap();
    this.ui.toast(C.CALLES.textos.nueva.replace('{n}', `${r.tramos} tramo${r.tramos === 1 ? '' : 's'}`) + (r.puentes ? ` Con ${r.puentes} puente${r.puentes > 1 ? 's' : ''}.` : ''));
    this.ui.render();
  }
  cancelarCalle() { this.trazoCalle = null; this.dibujarTrazo(); this.ui.render(); }
  dibujarTrazo() {
    const g = this.rutaG, T = this.T, N = T.N, M = N + 1;
    if (!g) return;
    g.clear();
    if (!this.trazoCalle) return;
    const pt = e => { const r = Math.floor(e / M), c = e % M; return P(r, c, T.hv(r, c)); };
    const p0 = pt(this.trazoCalle.inicio);
    g.lineStyle(2.4, 0x9C2F25, 1).strokeCircle(p0[0], p0[1], 6);
    const R = this.trazoCalle.ruta;
    if (!R) return;
    g.lineStyle(3, 0x9C2F25, .95);
    for (let k = 1; k < R.length; k++) {
      const a = pt(R[k - 1]), b = pt(R[k]), L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(L / 9));
      for (let j = 0; j < n; j++) { const f0 = j / n, f1 = (j + .55) / n; g.lineBetween(a[0] + (b[0] - a[0]) * f0, a[1] + (b[1] - a[1]) * f0, a[0] + (b[0] - a[0]) * f1, a[1] + (b[1] - a[1]) * f1); }
    }
    const pf = pt(R[R.length - 1]); g.fillStyle(0x9C2F25, 1).fillCircle(pf[0], pf[1], 4);
  }
  // Repinta solo los sectores con tramos nuevos o quitados (todo, si cambió la época de las calles).
  refrescarCalles() {
    const antes = this.dibCalles, ahora = dibujoCalles(this.S);
    if (!ahora) return;
    this.dibCalles = ahora;
    const N = this.T.N, M = N + 1, L = Math.ceil(N / LADO_SECTOR), sectores = new Set();
    if (!antes || antes.era !== ahora.era) { for (let a = 0; a < L; a++) for (let b = 0; b < L; b++) sectores.add(a + '-' + b); }
    else {
      const clave = t => t[0] + '|' + t[1], A = new Set(antes.tramos.map(clave)), B = new Set(ahora.tramos.map(clave));
      const cambiados = [...antes.tramos.filter(t => !B.has(clave(t))), ...ahora.tramos.filter(t => !A.has(clave(t)))];
      for (const t of cambiados) for (const e of [t[0], t[1]]) {
        const r = Math.floor(e / M), c = e % M;
        for (let R = r - 2; R <= r + 1; R++) for (let Cc = c - 2; Cc <= c + 1; Cc++) if (R >= 0 && Cc >= 0 && R < N && Cc < N) sectores.add(Math.floor(R / LADO_SECTOR) + '-' + Math.floor(Cc / LADO_SECTOR));
      }
    }
    if (sectores.size) {
      const cola = [...sectores].map(k => k.split('-').map(Number));
      const paso = () => { if (!this.sys.isActive()) return; const x = cola.shift(); if (x) { this.pintarSector(...x); requestAnimationFrame(paso); } };
      paso();
    }
    if (this.trafico) this.trafico.revisar();
    if (this.pob) this.pob.rejilla(); // la gente camina por las calles nuevas
    this.dibujarCobertura();
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
// Fase 1: también se seca en los años de lluvias escasas.
function sequedad(S) { const L = lluvias(S); return Math.round(Math.max(clamp((58 - S.env) / 48, 0, 1), L ? L.seco : 0) * 10) / 10; }
