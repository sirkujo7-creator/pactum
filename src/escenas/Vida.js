// Vida del paisaje: vacas, cebúes, caballos y chivos que pastan, garzas que caminan y vuelan, gallinas, patos y
// cerdos junto a las casas, gatos que descansan, perros por el pueblo, gallinazos que planean, bandadas de pájaros,
// loros entre las palmas y árboles que se mecen con el viento. Pedido de Juan (6 de octubre): movimiento fluido;
// los cuadrúpedos andan en 12 cuadros, las aves aletean en 8 y los árboles apenas se mecen (su sombra no baila).
// Con "reducir movimiento" los animales quedan quietos y no pasan pájaros.
import { P } from '../arte/iso.js';
import { reducirMovimiento } from './pantalla.js';

// Cuánto se mece cada planta (en grados): poco, para que se vea viva sin que la sombra se mueva.
const VAIVEN = { arbol: .5, saman: .3, ceiba: .3, guayacan: .5, ocobo: .5, cambulo: .5, yarumo: .6, mango: .4, arbolNiebla: .4, palma: .8, guadua: 1.1, platano: .9, arbusto: .4 };
const ARBOLES = new Set(Object.keys(VAIVEN));
const ANIMALES = new Set(['vaca', 'cebu', 'caballo', 'chivo', 'garza', 'pato']);
const PASTAN = new Set(['vaca', 'cebu', 'caballo', 'chivo']);
const azar = (a, b) => a + Math.random() * (b - a);
// Cuadros por casilla recorrida: la zancada de cada animal según su tamaño.
const VEL_CUADROS = { vaca: 78, cebu: 78, caballo: 70, chivo: 110, cerdo: 120, perro: 66, garza: 120 };

// Tamaño de cada animal frente a las personas (pedido de Juan: tamaños en proporción con la naturaleza y la
// infraestructura). Un poco más grandes que en la realidad para que se vean en el celular: un perro llega a la cintura
// de una persona, una vaca o un caballo a sus hombros.
const ESC_ANIMAL = { perro: .66, gato: .66, gallina: .72, cerdo: .74, vaca: .86, cebu: .86, caballo: .86, garza: .78, pato: .78, chulo: .9, loro: .85, pajaro: .9 };
// Sombra larga de cada animal (como la de las personas: siempre hacia abajo a la derecha, aunque el animal se voltee):
// largo y grueso frente a la de una persona.
const SOMBRA_ANIMAL = { vaca: [.95, 2], cebu: [1, 2], caballo: [1.1, 1.8], chivo: [.7, 1.3], cerdo: [.55, 1.4], perro: [.55, 1.2], gato: [.4, .8], gallina: [.4, .7], pato: [.4, .75], garza: [.75, .8] };
export class Vida {
  // Cuánto se mece cada tipo de planta (en grados).
  static vaiven(k) { return VAIVEN[k] || 0; }
  constructor(scene) {
    this.scene = scene;
    this.animales = [];
    this.bandadas = [];
    this.proximaBandada = azar(4, 10);
    this.poner();
  }
  static esAnimal(k) { return ANIMALES.has(k); }
  static esArbol(k) { return ARBOLES.has(k); }

  figura(k, r, c, s = 1) {
    s *= ESC_ANIMAL[k.replace(/V?\d+$/, '')] ?? 1; // en proporción con las personas (más chicas desde 0.170.0) y las casas
    const { T } = this.scene, H = this.scene.hojas.naturaleza, m = H.marcos[k], p = P(r, c, T.hf(r, c));
    return this.scene.add.image(p[0], p[1], 'naturaleza', k).setOrigin(m.ax / m.w, m.ay / m.h).setScale(s / H.escala).setDepth(r + c);
  }
  // Sombra larga de un animal que anda por el suelo.
  sombra(a, k, s = 1) {
    const S2 = SOMBRA_ANIMAL[k], pob = this.scene.pob; if (!S2 || !pob || !pob.texSombra) return;
    const b = .5 * 1.1 / 4 * s; // la escala de la sombra de una persona
    a.som = this.scene.add.image(0, 0, pob.texSombra()).setOrigin(.16, .5).setRotation(.32).setScale(b * S2[0], b * S2[1]);
  }
  // Juega una secuencia de cuadros (un gesto) y devuelve true mientras dura.
  animar(a, dt) {
    const A = a.anim; A.t += dt; const n = Math.floor(A.t / A.d);
    if (n >= A.fr.length) { a.anim = null; return false; }
    a.img.setFrame(A.fr[n]); this.dibujar(a); return true;
  }
  gesto(a, fr, d = .16) { a.anim = { fr, d, t: 0 }; }
  // Pone los animales según el territorio y el pueblo actual (se llama de nuevo tras construir).
  poner() {
    this.animales.forEach(a => { a.img.destroy(); if (a.som) a.som.destroy(); });
    this.animales = [];
    const { S, T } = this.scene, N = T.N;
    // Ganado, garzas y patos donde los puso la naturaleza, si la casilla sigue libre.
    for (const o of this.scene.plantasMundo) {
      const x = S.map[o.i];
      if (!ANIMALES.has(o.k) || x.b || x.t === 'bosque' || x.q > 0 || x.dr > 0) continue;
      const a = { k: o.k, casa: { r: o.r, c: o.c }, r: o.r, c: o.c, s: o.s, espera: azar(0, 6), ruta: null, var: '' };
      a.img = this.figura(o.k, o.r, o.c, o.s); this.sombra(a, o.k, o.s);
      this.animales.push(a);
    }
    // Tanda 3: algunas vacas, cebúes y caballos tienen su cría, que las sigue de cerca.
    this.animales.filter(a => a.k === 'vaca' || a.k === 'cebu' || a.k === 'caballo').forEach((m, k) => {
      if (k % 3) return;
      const a = { k: 'cria', madre: m, r: m.r + .18, c: m.c + .12, s: m.s * .58, espera: azar(0, 2), ruta: null, lado: azar(-.2, .2) };
      a.img = this.figura(m.k, a.r, a.c, a.s); this.sombra(a, m.k, m.s * .58); this.animales.push(a);
    });
    // Gallinas junto a algunas casas y perros por el pueblo.
    const casas = S.map.map((x, i) => x.b === 'casa' && !(x.u >= 80) ? i : -1).filter(i => i >= 0);
    casas.forEach((i, k) => {
      const r = Math.floor(i / N) + 1.1, c = i % N + .4;
      if (k % 2 === 0) for (let j = 0; j < 2; j++) {
        const a = { k: 'gallina', casa: { r, c: c + j * .3 }, r, c: c + j * .3, s: 1, espera: azar(0, 2), var: (k + j) % 2 };
        a.img = this.figura('gallina' + a.var, a.r, a.c); this.sombra(a, 'gallina'); this.animales.push(a);
        // Tanda 3: pollitos amarillos detrás de la primera gallina.
        if (j === 0 && k % 4 === 0) for (let q = 0; q < 3; q++) {
          const b = { k: 'pollito', madre: a, r, c: c + .1 * q, s: .42, espera: azar(0, 1), ruta: null, lado: (q - 1) * .09 };
          b.img = this.figura('gallina0', b.r, b.c, b.s).setTint(0xF2D27A); this.animales.push(b);
        }
      }
      if (k % 4 === 1 && this.animales.filter(x => x.k === 'perro').length < 6) {
        const a = { k: 'perro', casa: { r, c }, casaI: i, r, c, s: 1, espera: azar(1, 4), fase: 0, pose: 'perroS' };
        a.img = this.figura('perro0', r, c); this.sombra(a, 'perro'); this.animales.push(a);
      }
      // Un cerdo en el solar de algunas casas y un gato que descansa en otras.
      if (k % 5 === 3 && this.animales.filter(x => x.k === 'cerdo').length < 4) {
        const a = { k: 'cerdo', casa: { r: r + .1, c: c + .35 }, r: r + .1, c: c + .35, s: 1, espera: azar(2, 8), fase: 0 };
        a.img = this.figura('cerdo', a.r, a.c); this.sombra(a, 'cerdo'); this.animales.push(a);
      }
      if (k % 6 === 4 && this.animales.filter(x => x.k === 'gato').length < 4) {
        const a = { k: 'gato', r: r - .05, c: c + .55, s: 1, espera: azar(3, 9) };
        a.img = this.figura('gato', a.r, a.c); this.sombra(a, 'gato'); this.animales.push(a);
      }
    });
    // Gallinazos: planean en círculos altos sobre el pueblo cuando ya hay unas cuantas casas.
    if (casas.length >= 4) for (let j = 0; j < 2; j++) {
      const i = casas[(j * 5) % casas.length], a = { k: 'chulo', cr: Math.floor(i / N) + .5, cc: i % N + .5, ang: j * 3, radio: 1.6 + j * .7, fase: j * 3, r: 0, c: 0 };
      a.img = this.figura('chuloV0', a.cr, a.cc, .9); this.animales.push(a);
    }
    // Loros: parejas entre las palmas de cera.
    this.palmas = this.scene.plantasMundo.filter(o => o.k === 'palma' && !S.map[o.i].b && !S.map[o.i].q && !S.map[o.i].dr && !(T.tiles[o.i].b === 'niebla' && S.map[o.i].t !== 'bosque'));
    for (let k = 0; k < Math.min(3, Math.floor(this.palmas.length / 4)); k++) {
      const pa = this.palmas[(k * 7) % this.palmas.length];
      for (let j = 0; j < 2; j++) {
        const a = { k: 'loro', r: pa.r, c: pa.c + j * .12, alto: 70 + j * 4, espera: azar(3, 12), fase: 0, vuela: null };
        a.img = this.figura('loro0', a.r, a.c).setVisible(false); this.animales.push(a);
      }
    }
  }

  update(dt, t) {
    if (reducirMovimiento()) return;
    this.t = t;
    const { T, S } = this.scene, N = T.N;
    for (const a of this.animales) {
      if (PASTAN.has(a.k)) this.vaca(a, dt);
      else if (a.k === 'garza') this.garza(a, dt, N, S);
      else if (a.k === 'gallina') this.gallina(a, dt);
      else if (a.k === 'perro') this.perro(a, dt, N, S);
      else if (a.k === 'loro') this.loro(a, dt);
      else if (a.k === 'pato') this.gallina(a, dt);
      else if (a.k === 'cerdo') this.cerdo(a, dt);
      else if (a.k === 'gato') this.gato(a, dt);
      else if (a.k === 'chulo') this.chulo(a, dt);
      else if (a.k === 'cria' || a.k === 'pollito') this.cria(a, dt);
    }
    this.aves(dt);
    this.viento(t);
  }

  mover(a, dt, vel) {
    const d = a.ruta, dr = d.r - a.r, dc = d.c - a.c, dist = Math.hypot(dr, dc);
    if (dist < .02) { a.ruta = null; a.bob = 0; return 0; }
    const v = Math.min(dist, vel * dt);
    a.r += dr / dist * v; a.c += dc / dist * v;
    if (Math.abs(dc - dr) > dist * .3) a.img.setFlipX((dc - dr) < 0); // sin voltearse de un lado al otro
    // Las patas y el cuerpo se mueven en los 12 cuadros del dibujo; solo las aves de corral dan saltitos.
    a.paso = (a.paso || 0) + v * 34; a.bob = 0; // las patas y el cuerpo se mueven en los cuadros del dibujo
    a.fase = (a.fase || 0) + v * (VEL_CUADROS[a.k] || 80); // avance de los cuadros según lo recorrido: sin patinar
    return v;
  }
  dibujar(a, alto = 0) {
    const p = P(a.r, a.c, this.scene.T.hf(a.r, a.c));
    a.img.setPosition(p[0], p[1] - alto - (a.ruta && !reducirMovimiento() ? a.bob || 0 : 0)).setDepth(a.r + a.c + (alto ? 50 : 0));
    if (a.som) a.som.setPosition(p[0], p[1]).setDepth(a.r + a.c - .002).setVisible(!alto && a.img.visible && !a.nada);
  }
  // Ganado (vaca, cebú, caballo, chivo): pasta con la cabeza abajo y de vez en cuando da unos pasos.
  vaca(a, dt) {
    if (a.ruta) { this.mover(a, dt, a.k === 'chivo' ? .13 : .1); a.img.setFrame(a.ruta ? a.k + 'A' + (Math.floor(a.fase) % 12) : a.k); this.dibujar(a); return; }
    if (a.anim && this.animar(a, dt)) return;
    // Echada rumiando (vaca, cebú, chivo): mastica despacio y al rato se levanta.
    if (a.echada > 0) { a.echada -= dt; a.img.setFrame(a.k + 'Echada' + (Math.floor((this.t || 0) * 1.6 + a.c * 5) % 2)); if (a.echada <= 0) { a.alta = true; a.cabeza = azar(1, 2); } return; }
    // Gestos de quien está con la cabeza en alto: espanta las moscas con la cola, sacude la cabeza; el caballo pisa.
    if (a.alta && !a.bebiendo) {
      const R = Math.random(), k = a.k;
      if (R < dt / 5) { this.gesto(a, [k + 'Cola1', k + 'Cola2', k + 'Cola3', k + 'Cola2', k + 'Cola1', k], .13); return; }
      if (R < dt / 5 + dt / 12) { this.gesto(a, [k + 'Cab1', k + 'Cab2', k + 'Cab1', k], .2); return; }
      if (k === 'caballo' && R < dt / 5 + dt / 12 + dt / 14) { this.gesto(a, ['caballoPisa1', 'caballoPisa2', 'caballoPisa3', 'caballoPisa2', 'caballoPisa3', 'caballoPisa1', 'caballo'], .14); return; }
      if (k !== 'caballo' && R > 1 - dt / 45) { a.echada = azar(18, 40); return; }
    }
    a.espera -= dt;
    // Quieta: casi siempre pastando; a ratos levanta la cabeza (cambio de postura pausado, no un parpadeo).
    a.cabeza = (a.cabeza ?? azar(2, 6)) - dt;
    if (a.cabeza <= 0) { a.alta = !a.alta; a.cabeza = a.alta ? azar(1.5, 3) : azar(4, 9); }
    if (a.espera <= 0) {
      // Tanda 3: a ratos baja a beber al río (si queda cerca) y luego vuelve a su potrero.
      const agua = !a.bebiendo && Math.random() < .3 ? this.orilla(a) : null;
      if (agua) { a.ruta = agua; a.bebiendo = true; a.alta = false; a.espera = azar(8, 14); }
      else {
        a.bebiendo = false;
        // Si el pastor anda cerca, el ganado va tras él; si no, unos pasos por su potrero.
        const pa = (this.scene.oficios ? this.scene.oficios.gente : []).find(w => w.o === 'pastor' && Math.hypot(w.r - a.casa.r, w.c - a.casa.c) < 2.5);
        a.ruta = pa && Math.random() < .55 ? { r: pa.r + azar(-.5, .5), c: pa.c + azar(-.5, .5) } : { r: a.casa.r + azar(-.35, .35), c: a.casa.c + azar(-.35, .35) }; a.espera = azar(5, 14);
      }
    }
    else a.img.setFrame(a.alta && !a.bebiendo ? a.k : a.k + 'Pasta');
  }
  // Punto en la orilla del río más cercana al potrero (a tres casillas como máximo), o null.
  orilla(a) {
    const { S, T } = this.scene, N = T.N, r0 = Math.floor(a.casa.r), c0 = Math.floor(a.casa.c);
    let mejor = null, dm = 9;
    for (let r = Math.max(0, r0 - 3); r <= Math.min(N - 1, r0 + 3); r++) for (let c = Math.max(0, c0 - 3); c <= Math.min(N - 1, c0 + 3); c++) {
      const x = S.map[r * N + c]; if (x.t === 'rio' || x.b) continue;
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const r2 = r + dr, c2 = c + dc; if (r2 < 0 || c2 < 0 || r2 >= N || c2 >= N || S.map[r2 * N + c2].t !== 'rio') continue;
        const d = Math.hypot(r - r0, c - c0); if (d < dm) { dm = d; mejor = { r: r + .5 + dr * .38, c: c + .5 + dc * .38 }; }
      }
    }
    return mejor;
  }
  // Cría (ternero, potro) o pollito: sigue a su madre a unos pasos y se detiene cuando ella se detiene.
  cria(a, dt) {
    const m = a.madre, o = { r: m.r + .16 + a.lado * .5, c: m.c + .1 + a.lado }, lejos = Math.hypot(o.r - a.r, o.c - a.c);
    if (!a.ruta && lejos > .12) a.ruta = o;
    if (a.ruta) { a.ruta = o; this.mover(a, dt, a.k === 'pollito' ? .2 : .14); }
    if (a.k === 'pollito') a.img.setFrame(a.ruta ? 'gallina0A' + (Math.floor((a.paso || 0) / (Math.PI / 2)) % 4) : Math.sin(this.scene.time.now / 300 + a.lado * 9) > .3 ? 'gallina0' : 'gallina0p');
    else a.img.setFrame(a.ruta ? m.k + 'A' + (Math.floor(a.fase) % 12) : (m.bebiendo || !m.alta ? m.k + 'Pasta' : m.k));
    if (!a.ruta && m.img.flipX !== a.img.flipX) a.img.setFlipX(m.img.flipX);
    this.dibujar(a);
  }
  // Garza: camina despacio y a veces vuela a otra orilla.
  garza(a, dt, N, S) {
    if (a.vuela) {
      const v = a.vuela; v.t += dt / v.dur;
      const f = Math.min(1, v.t);
      a.r = v.r0 + (v.r1 - v.r0) * f; a.c = v.c0 + (v.c1 - v.c0) * f;
      v.ala = (v.ala || 0) + dt * 12; // aleteo lento de garza: 1,5 aletazos por segundo en 8 cuadros
      a.img.setFrame(f < 1 ? 'garzaVuela' + (Math.floor(v.ala) % 8) : 'garza').setFlipX(v.c1 - v.r1 < v.c0 - v.r0);
      this.dibujar(a, Math.sin(f * Math.PI) * 40);
      if (f >= 1) { a.vuela = null; a.casa = { r: a.r, c: a.c }; a.espera = azar(8, 20); }
      return;
    }
    if (a.ruta) { this.mover(a, dt, .08); a.img.setFrame(a.ruta ? 'garzaA' + (Math.floor(a.fase) % 8) : 'garza'); this.dibujar(a); return; }
    a.img.setFrame('garza');
    a.espera -= dt;
    if (a.espera > 0) return;
    if (Math.random() < .35) {
      // Vuela a otra casilla junto al agua, a pocas casillas.
      for (let k = 0; k < 12; k++) {
        const r = Math.floor(a.r + azar(-5, 5)), c = Math.floor(a.c + azar(-5, 5));
        if (r < 1 || c < 1 || r >= N - 1 || c >= N - 1 || S.map[r * N + c].t === 'rio' || S.map[r * N + c].b) continue;
        a.vuela = { r0: a.r, c0: a.c, r1: r + .5, c1: c + .5, t: 0, dur: azar(2.5, 4) };
        return;
      }
    }
    a.ruta = { r: a.casa.r + azar(-.3, .3), c: a.casa.c + azar(-.3, .3) }; a.espera = azar(4, 10);
  }
  // Gallina y pato: picotean (la cabeza baja y sube en 4 pasos suaves) y dan saltitos cerca de la casa o del agua.
  gallina(a, dt) {
    const base = a.k === 'pato' ? 'pato' : 'gallina' + a.var, pasos = a.k === 'pato' ? ['', 'P1', 'P', 'P'] : ['', 'p1', 'p2', 'p'];
    const S = this.scene.S, N = this.scene.T.N, x = S.map[Math.floor(a.r) * N + Math.floor(a.c)]; a.nada = a.k === 'pato' && !!x && x.t === 'rio';
    if (a.ruta) { this.mover(a, dt, a.k === 'pato' ? (a.nada ? .07 : .1) : .15); a.img.setFrame(a.nada ? 'patoNada' : base + 'A' + (Math.floor(a.paso / (Math.PI / 2)) % 4)); this.dibujar(a); return; }
    if (a.anim && this.animar(a, dt)) return;
    if (a.nada) { a.img.setFrame('patoNada'); this.dibujar(a); a.espera -= dt; if (a.espera <= 0) { a.ruta = this.aguaCerca(a) || a.casa; a.espera = azar(3, 8); } return; }
    // El gallo canta al amanecer, una vez cada mañana.
    const pob = this.scene.pob;
    if (a.k === 'gallina' && a.var === 1 && pob && pob.reloj > .23 && pob.reloj < .32 && a.canto !== pob.dias && Math.random() < dt / 3) { a.canto = pob.dias; this.gesto(a, ['gallina1Canta', 'gallina1Canta', 'gallina1Canta', 'gallina1Canta', 'gallina1'], .3); return; }
    a.espera -= dt;
    if (a.pica !== undefined) { // bajando y subiendo: 0 a 1 y de vuelta, sin saltos
      a.pica += dt / .5; const t = a.pica < 1 ? a.pica : 2 - a.pica;
      a.img.setFrame(base + pasos[Math.min(3, Math.round(Math.max(0, t) * 3))]);
      if (a.pica >= 2) { a.pica = undefined; a.img.setFrame(base); }
      return;
    }
    a.pico = (a.pico ?? azar(.3, 1)) - dt;
    if (a.pico <= 0) { a.pica = 0; a.pico = azar(.5, 2); }
    if (a.espera <= 0) {
      // Si la dueña les echa maíz, las gallinas van a sus pies.
      const q = a.k === 'gallina' && this.scene.pob && this.scene.pob.comedero ? this.scene.pob.comedero(a.casa) : null;
      const w = a.k === 'pato' && Math.random() < .4 ? this.aguaCerca(a) : null; // los patos se van a nadar al río
      a.ruta = q ? { r: q.r + azar(-.15, .15), c: q.c + azar(-.15, .15) } : w || { r: a.casa.r + azar(-.25, .25), c: a.casa.c + azar(-.3, .3) }; a.espera = q ? azar(.6, 1.6) : w ? azar(8, 16) : azar(1.5, 4);
    }
  }
  // Un punto en el agua del río a dos casillas como máximo (para que naden los patos), o null.
  aguaCerca(a) {
    const { S, T } = this.scene, N = T.N, r0 = Math.floor(a.casa.r), c0 = Math.floor(a.casa.c), L = [];
    for (let r = r0 - 2; r <= r0 + 2; r++) for (let c = c0 - 2; c <= c0 + 2; c++) if (r >= 0 && c >= 0 && r < N && c < N && S.map[r * N + c].t === 'rio') L.push({ r: r + azar(.3, .7), c: c + azar(.3, .7) });
    return L.length ? L[Math.floor(Math.random() * L.length)] : null;
  }
  // Cerdo: hoza en el solar y da unos pasos de vez en cuando.
  cerdo(a, dt) {
    if (a.ruta) { this.mover(a, dt, .07); a.img.setFrame(a.ruta ? 'cerdoA' + (Math.floor(a.fase) % 12) : 'cerdo'); this.dibujar(a); return; }
    a.espera -= dt;
    if (a.espera <= 0) { a.ruta = { r: a.casa.r + azar(-.25, .25), c: a.casa.c + azar(-.25, .25) }; a.espera = azar(4, 10); }
  }
  // Gato: descansa sentado y a ratos mueve la cola.
  gato(a, dt) {
    if (a.anim && this.animar(a, dt)) return;
    a.espera -= dt;
    if (a.duerme > 0) { a.duerme -= dt; if (a.duerme <= 0) this.gesto(a, ['gatoEstira', 'gatoEstira', 'gatoEstira', 'gato'], .5); return; } // al despertar se estira
    if (a.espera <= 0) {
      const R = Math.random(), mediodia = this.scene.pob && Math.abs(this.scene.pob.reloj - .5) < .12;
      if (!a.cola && R < (mediodia ? .35 : .12)) { a.duerme = azar(15, 40); a.img.setFrame('gatoDuerme'); a.espera = 0; return; } // duerme al sol
      if (!a.cola && R < .4) { this.gesto(a, ['gatoLame0', 'gatoLame1', 'gatoLame0', 'gatoLame1', 'gatoLame0', 'gatoLame1', 'gato'], .25); a.espera = azar(3, 8); return; }
      a.cola = !a.cola; a.img.setFrame(a.cola ? 'gato1' : 'gato'); a.espera = a.cola ? azar(.6, 1.2) : azar(3, 9);
    }
  }
  // Gallinazo: planea en círculos lentos, alto sobre el pueblo, casi sin aletear.
  chulo(a, dt) {
    a.ang += dt * .22; a.fase += dt * 2.4;
    a.r = a.cr + Math.sin(a.ang) * a.radio; a.c = a.cc + Math.cos(a.ang) * a.radio;
    a.img.setFrame('chuloV' + (Math.floor(a.fase) % 8));
    this.dibujar(a, 120 + Math.sin(a.ang * .7) * 10);
  }
  // Perro: recorre el pueblo por casillas libres y se sienta a ratos.
  perro(a, dt, N, S) {
    const pob = this.scene.pob, duenio = pob ? (a.duenio && pob.figuras.includes(a.duenio) ? a.duenio : (a.duenio = pob.figuras.find(f => f.p.casa === a.casaI && f.p.tipo !== 'nino'))) : null;
    if (a.ruta) {
      if (a.sigue && duenio && !duenio.oculto) a.ruta = { r: duenio.r - .22, c: duenio.c - .18 }; // va detrás de su dueño
      this.mover(a, dt, a.sigue ? .6 : .5); a.img.setFrame(a.ruta ? 'perro' + (Math.floor(a.fase) % 12) : a.pose); this.dibujar(a); return;
    }
    if (a.anim && this.animar(a, dt)) return;
    // Les ladra a los que pasan cerca de su casa (no a su dueño), y no a cada rato.
    if ((a.ladro || 0) < (this.t || 0) && pob) for (const f of pob.figuras) {
      if (f === duenio || f.oculto || !f.ruta.length || Math.hypot(f.r - a.r, f.c - a.c) > .7) continue;
      a.ladro = (this.t || 0) + azar(15, 30); a.img.setFlipX(f.c - f.r < a.c - a.r);
      this.gesto(a, ['perroLadra0', 'perroLadra1', 'perroLadra0', 'perroLadra1', 'perroLadra0', 'perroLadra1', 'perroS'], .16); a.pose = 'perroS'; return;
    }
    a.img.setFrame(a.pose); this.dibujar(a);
    a.espera -= dt;
    if (a.espera > 0) return;
    // Si su dueño camina, lo acompaña (al trabajo, a la plaza); si no, recorre el pueblo.
    a.sigue = false;
    if (duenio && !duenio.oculto && duenio.ruta.length && Math.random() < .6 && Math.hypot(duenio.r - a.r, duenio.c - a.c) < 6) { a.sigue = true; a.ruta = { r: duenio.r - .22, c: duenio.c - .18 }; a.espera = azar(1, 2); return; }
    // Al detenerse: se sienta, se echa, olfatea o se rasca.
    const R = Math.random();
    if (R < .2) { a.pose = 'perroHuele'; a.espera = azar(1.5, 3); return; }
    if (R < .35) { this.gesto(a, ['perroRasca0', 'perroRasca1', 'perroRasca0', 'perroRasca1', 'perroRasca0', 'perroRasca1', 'perroRasca0', 'perroS'], .12); a.pose = 'perroS'; a.espera = azar(1, 3); return; }
    if (R < .55) { a.pose = a.pose === 'perroEchado' ? 'perroS' : 'perroEchado'; a.espera = azar(6, 16); return; }
    a.pose = 'perroS';
    for (let k = 0; k < 10; k++) {
      const r = Math.floor(a.casa.r + azar(-3, 3)), c = Math.floor(a.casa.c + azar(-3, 3));
      if (r < 0 || c < 0 || r >= N || c >= N || S.map[r * N + c].t === 'rio') continue;
      a.ruta = { r: r + azar(.2, .8), c: c + azar(.2, .8) }; break;
    }
    a.espera = azar(2, 7);
  }
  // Loros: vuelan en pareja de una palma a otra, aleteando.
  loro(a, dt) {
    if (a.vuela) {
      const v = a.vuela; v.t += dt / v.dur;
      const f = Math.min(1, v.t);
      a.r = v.r0 + (v.r1 - v.r0) * f; a.c = v.c0 + (v.c1 - v.c0) * f;
      a.fase += dt * 24; a.img.setFrame('loro' + (Math.floor(a.fase) % 6)).setFlipX(v.c1 - v.r1 < v.c0 - v.r0).setVisible(true);
      this.dibujar(a, a.alto + Math.sin(f * Math.PI) * 30);
      if (f >= 1) { a.vuela = null; a.img.setVisible(false); a.espera = azar(8, 25); }
      return;
    }
    a.espera -= dt;
    if (a.espera <= 0 && this.palmas.length > 1) {
      const d = this.palmas[Math.floor(Math.random() * this.palmas.length)];
      if (Math.hypot(d.r - a.r, d.c - a.c) < 10) a.vuela = { r0: a.r, c0: a.c, r1: d.r, c1: d.c + (a.c % 1 > .5 ? .12 : 0), t: 0, dur: azar(3, 6) };
      else a.espera = 2;
    }
  }
  // Bandadas de pájaros que cruzan el cielo.
  aves(dt) {
    this.proximaBandada -= dt;
    if (this.proximaBandada <= 0) {
      this.proximaBandada = azar(14, 30);
      const cam = this.scene.cameras.main, w = cam.width / cam.zoom, h = cam.height / cam.zoom;
      const x0 = cam.scrollX - 40, y0 = cam.scrollY + azar(.15, .6) * h, n = Math.floor(azar(4, 8)), vx = azar(35, 55), vy = azar(-8, 8);
      const aves = [];
      for (let k = 0; k < n; k++) aves.push({ img: this.figura('pajaro0', 0, 0).setDepth(46000), dx: -k * azar(8, 12), dy: (k % 2 ? 1 : -1) * k * 3.5, fase: Math.random() * 2 });
      this.bandadas.push({ x: x0, y: y0, vx, vy, aves, fin: cam.scrollX + w + 80 });
    }
    for (const b of this.bandadas) {
      b.x += b.vx * dt; b.y += b.vy * dt;
      for (const a of b.aves) { a.fase += dt * 14; a.img.setFrame('pajaro' + (Math.floor(a.fase) % 4)).setPosition(b.x + a.dx, b.y + a.dy); }
    }
    this.bandadas = this.bandadas.filter(b => { if (b.x - 100 > b.fin) { b.aves.forEach(a => a.img.destroy()); return false; } return true; });
  }
  // Viento: los árboles se mecen apenas y despacio, con ráfagas que recorren el territorio.
  viento(t) {
    const plantas = this.scene.plantas, ef = this.scene.efectos;
    // Tanda 3: con aguacero los árboles se mecen más (el doble), y vuelven poco a poco a la calma.
    const meta = ef && ef.lluvia && ef.lluvia.length ? 2.1 : 1;
    this.fuerza = (this.fuerza || 1) + (meta - (this.fuerza || 1)) * .02; const fuerza = this.fuerza;
    for (const k in plantas) for (const img of plantas[k]) {
      if (!img.getData('arbol')) continue;
      const x = img.x, rafaga = (.55 + .45 * Math.sin(t * .35 - x * .004)) * fuerza;
      img.setAngle(Math.sin(t * 1.1 + x * .05 + img.y * .03) * img.getData('arbol') * rafaga);
    }
  }
  destruir() { this.animales.forEach(a => { a.img.destroy(); if (a.som) a.som.destroy(); }); this.bandadas.forEach(b => b.aves.forEach(a => a.img.destroy())); }
}
