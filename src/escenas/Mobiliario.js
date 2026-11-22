// Cosas del pueblo con las que la gente hace algo (pedido de Juan: «añadir cosas con las cuales interactúen… en los
// parques»): bancas, carrito de mazorca o de raspado, tienda de la esquina con su mesa de dominó o de parqués, cancha
// de tejo, pozo, alberca, huertas con cerca, columpio y balancín, mulas amarradas frente al mercado y palomas en la
// plaza. Se ponen en las casillas libres junto al pueblo (nunca encima de una obra) y se rehacen al cambiar el mapa.
// Cada cosa deja «puestos» que los pobladores toman (Pobladores pide uno con tomar() y lo suelta al irse).
import { epocaHistorica, plaza as plazaDe } from '../core/index.js';
import { hornearMobiliario, ALTO_COLUMPIO } from '../arte/mobiliario.js';
import { P, EL } from '../arte/iso.js';
import { TAM_GENTE } from '../arte/gente.js';
import { reducirMovimiento } from './pantalla.js';

const EPOCAS = ['fundacion', 'cafe', 'violencia', 'modernizacion', 'paz', 'digital'];
const azar = (a, b) => a + Math.random() * (b - a);
const ARBOL_SOMBRA = new Set(['saman', 'ceiba', 'mango', 'arbol', 'guayacan', 'cambulo', 'ocobo']);
const DIR_R = [-.894, .447]; // hacia dónde queda +r en la pantalla

export class Mobiliario {
  constructor(scene) {
    this.scene = scene; this.cosas = []; this.puntos = []; this.palomas = []; this.columpios = []; this.balancines = []; this.tejos = []; this.firma = '';
    this.H = hornearMobiliario();
    if (!scene.textures.exists('mobiliario')) { const t = scene.textures.addCanvas('mobiliario', this.H.canvas); for (const [k, m] of Object.entries(this.H.marcos)) t.add(k, 0, m.x, m.y, m.w, m.h); }
    this.cadenas = scene.add.graphics();
    this.t = 0;
    this.actualizar();
  }
  hist() { const k = EPOCAS.indexOf(epocaHistorica(this.scene.S)); return k < 0 ? 0 : k; }
  // Una cosa dibujada en (r, c) del mundo, con su profundidad por la posición.
  poner(k, r, c, dz = 0) {
    const T = this.scene.T, m = this.H.marcos[k], p = P(r, c, T.hf(r, c));
    const img = this.scene.add.image(p[0], p[1], 'mobiliario', k).setOrigin(m.ax / m.w, m.ay / m.h).setScale(1 / this.H.escala).setDepth(r + c + dz);
    this.cosas.push(img); return img;
  }
  // Un puesto para un poblador: tipo, lugar, hacia dónde mira y qué hace allí.
  puesto(tipo, r, c, op = {}) { const q = { tipo, r, c, quien: null, ...op }; this.puntos.push(q); return q; }
  // Un vecino fijo que atiende (el vendedor del carrito, el tendero): figura de la hoja de acciones.
  atiende(tipo, vi, r, c, voltear) {
    const pob = this.scene.pob, A = pob.A, k = `${tipo}_${vi}_vender_0`;
    if (!A || !A.marcos[k]) return null;
    const m = A.marcos[k], T = this.scene.T, p = P(r, c, T.hf(r, c));
    const img = this.scene.add.image(p[0], p[1], 'acciones', k).setOrigin(m.ax / m.w, m.ay / m.h).setScale(TAM_GENTE / A.escala).setFlipX(voltear).setDepth(r + c + .005);
    this.cosas.push(img); this.vendedores.push({ img, tipo, vi, fase: Math.random() * 6 }); return img;
  }

  quitar() {
    (this.ocultas || []).forEach(im => { if (im.scene) im.setVisible(true); }); this.ocultas = [];
    this.cosas.forEach(o => o.destroy()); this.cosas = []; this.puntos = []; this.vendedores = [];
    this.palomas.forEach(a => a.img.destroy()); this.palomas = [];
    for (const s of this.columpios) s.ninos.forEach(n => n && n.img.destroy()); this.columpios = [];
    for (const b of this.balancines) { b.tabla.destroy(); b.ninos.forEach(n => n && n.img.destroy()); } this.balancines = [];
    for (const t of this.tejos) t.disco.destroy(); this.tejos = [];
  }
  actualizar() {
    const { S, T } = this.scene, N = T.N, pz = plazaDe(S), hist = this.hist();
    const firma = S.map.map(x => (x.b || '') + (x.ob ? 'o' : '')).join(',') + '|' + S.stage + '|' + hist;
    if (firma === this.firma) return; this.firma = firma;
    this.quitar();
    if (pz < 0) return;
    const rc = i => [Math.floor(i / N), i % N], r0 = Math.floor(pz / N), c0 = pz % N;
    const usadas = new Set();
    const libre = i => { if (i < 0 || i >= N * N || usadas.has(i)) return false; const x = S.map[i]; return !x.b && x.t !== 'rio' && x.t !== 'bosque' && !(x.q > 0); };
    const vecinos = i => { const [r, c] = rc(i), L = []; for (const [dr, dc] of [[1, 0], [0, 1], [-1, 0], [0, -1]]) { const r2 = r + dr, c2 = c + dc; if (r2 >= 0 && c2 >= 0 && r2 < N && c2 < N) L.push(r2 * N + c2); } return L; };
    const cerca = (i, rad) => { const [r, c] = rc(i), L = []; for (let r2 = r - rad; r2 <= r + rad; r2++) for (let c2 = c - rad; c2 <= c + rad; c2++) if (r2 >= 0 && c2 >= 0 && r2 < N && c2 < N) L.push(r2 * N + c2); return L.sort((a, b) => { const [ra, ca] = rc(a), [rb, cb] = rc(b); return Math.hypot(ra - r, ca - c) - Math.hypot(rb - r, cb - c); }); };
    const libreCerca = (i, rad) => cerca(i, rad).find(libre);
    const casas = S.map.map((x, i) => x.b === 'casa' && !x.ob ? i : -1).filter(i => i >= 0).sort((a, b) => { const [ra, ca] = rc(a), [rb, cb] = rc(b); return Math.hypot(ra - r0, ca - c0) - Math.hypot(rb - r0, cb - c0); });
    const hay = k => S.map.some(x => x.b === k && !x.ob);
    usadas.add(pz);
    const ocultarPlantas = () => { for (const i of usadas) for (const im of (this.scene.plantas || {})[i] || []) if (im.visible) { im.setVisible(false); this.ocultas.push(im); } };

    // Bancas de la plaza (las que ya trae su dibujo) y de los parques.
    const nivel = Math.max(0, Math.min(3, S.stage | 0));
    if (nivel >= 1) {
      const s = [.56, .6, .62, .64][nivel];
      this.puesto('banca', r0 + .5 + s - .12, c0 + .5 - .2, { frente: 1, voltear: true, palomas: true });
      if (nivel >= 2) this.puesto('banca', r0 + .3, c0 + .5 + s - .12, { frente: 1, voltear: true, palomas: true });
    }
    S.map.forEach((x, i) => {
      if (x.b !== 'parque' || x.ob) return; const [r, c] = rc(i);
      for (const [dr, dc] of [[.42, 0], [0, .42]]) { this.poner(hist >= 3 ? 'bancaNueva' : 'bancaVieja', r + .5 + dr, c + .5 + dc, -.01); this.puesto('banca', r + .5 + dr, c + .5 + dc, { frente: 1, voltear: true }); }
    });
    // Palomas en la plaza (desde la plaza mayor).
    if (nivel >= 1) for (let k = 0; k < 8; k++) {
      const an = k / 8 * Math.PI * 2 + .3, rad = .3 + (k % 3) * .06, r = r0 + .5 + Math.cos(an) * rad, c = c0 + .5 + Math.sin(an) * rad;
      const a = { r, c, casa: { r, c }, img: this.poner('paloma0', r, c, .01), espera: azar(0, 3), vuela: null, ruta: null, f: 0 };
      a.img.setScale(.9 / this.H.escala); this.palomas.push(a);
    }
    if (casas.length < 3) return ocultarPlantas();

    // Carrito de mazorca (épocas antiguas) o de raspado, junto a la plaza, con su vendedor.
    const iCar = libreCerca(pz, 1);
    if (iCar !== undefined) {
      usadas.add(iCar); const [r, c] = rc(iCar), cr = r + .45, cc = c + .5;
      this.poner(hist <= 1 ? 'carritoMazorca' : 'carritoRaspado', cr, cc);
      this.atiende(hist <= 1 ? 'campesino' : 'artesano', iCar % 3, cr - .2, cc + .02, true);
      for (let k = 0; k < 3; k++) this.puesto('comprar', cr + .24 + k * .1, cc - .08 + k * .1, { frente: 0, voltear: false, luego: hist <= 1 ? 'mazorca' : 'raspado' });
    }
    // Tienda de la esquina: pegada a una casa cercana a la plaza, con su tendero; al lado, la mesa de dominó (o de
    // parqués) y, en las épocas antiguas, la cancha de tejo.
    if (casas.length >= 5) {
      const casa = casas.find(i => vecinos(i).some(j => j === i + N && libre(j)));
      if (casa !== undefined) {
        const iT = casa + N; usadas.add(iT); const [r, c] = rc(iT), tr = r + .3, tc = c + .5, mod = hist >= 3;
        this.poner(mod ? 'tienda1A' : 'tienda0A', tr, tc, -.2); this.poner(mod ? 'tienda1' : 'tienda0', tr, tc);
        this.atiende(mod ? 'artesano' : 'campesino', (iT + 1) % 3, tr - .07, tc - .1, true);
        for (let k = 0; k < 2; k++) this.puesto('cliente', tr + .26, tc - .12 + k * .2, { frente: 0, voltear: k === 1, luego: 'bolsa' });
        for (let k = 0; k < 4; k++) { const an = k / 4 * Math.PI * 2; this.puesto('tienda', tr + .5 + Math.cos(an) * .18, tc + Math.sin(an) * .18, { mira: { r: tr + .5, c: tc } }); }
        const iM = [iT + 1, iT - 1, iT + N].find(libre);
        if (iM !== undefined) {
          usadas.add(iM); const [mr, mc] = rc(iM), r2 = mr + .4, c2 = mc + .45;
          this.poner(mod ? 'mesaParques' : 'mesaDomino', r2, c2);
          for (const [dr, dc, v] of [[-.17, 0, true], [0, -.17, false]]) { this.poner('taburete', r2 + dr, c2 + dc, -.01); this.puesto('domino', r2 + dr, c2 + dc, { frente: 1, voltear: v }); }
          this.puesto('mirarJuego', r2 + .1, c2 - .26, { mira: { r: r2, c: c2 } });
        }
        if (hist <= 2) {
          const iJ = [iT - 1, iT + 1, iT + N, iT + 2].find(libre);
          if (iJ !== undefined) {
            usadas.add(iJ); const [jr, jc] = rc(iJ), r2 = jr + .5, c2 = jc + .5;
            this.poner('canchaTejo', r2, c2);
            const tiro = { r: r2, c: c2 - .52 }, disco = this.scene.add.image(0, 0, 'mobiliario', 'tejoDisco').setOrigin(.5).setScale(1 / this.H.escala).setVisible(false);
            this.tejos.push({ tiro, bocin: { r: r2, c: c2 + .36 }, disco, vuelo: null });
            this.puesto('tejo', tiro.r, tiro.c, { frente: 1, voltear: false });
            this.puesto('mirarJuego', r2 + .14, c2 - .44, { mira: { r: r2, c: c2 + .36 } });
          }
        }
      }
    }
    // Columpio y balancín (desde La Violencia), en casillas libres junto a la plaza.
    if (hist >= 2) {
      const iC = libreCerca(pz, 2);
      if (iC !== undefined) {
        usadas.add(iC); const [r, c] = rc(iC), cr = r + .45, cc = c + .5;
        this.poner('columpio', cr, cc);
        for (const dc of [-.12, .12]) { const q = this.puesto('columpio', cr + .16, cc + dc, { frente: 1, voltear: true }); this.columpios.push({ r: cr, c: cc + dc, punto: q, ninos: [], fase: Math.random() * 6 }); }
      }
      const iB = libreCerca(pz, 2);
      if (iB !== undefined) {
        usadas.add(iB); const [r, c] = rc(iB), br = r + .5, bc = c + .5;
        this.poner('balancin', br, bc);
        const tabla = this.scene.add.image(0, 0, 'mobiliario', 'balancinTabla').setScale(1 / this.H.escala);
        const m = this.H.marcos.balancinTabla; tabla.setOrigin(m.ax / m.w, m.ay / m.h);
        const pa = this.puesto('balancin', br, bc - .3, { frente: 1, voltear: false }), pb = this.puesto('balancin', br, bc + .3, { frente: 1, voltear: true });
        this.balancines.push({ r: br, c: bc, tabla, puntos: [pa, pb], ninos: [], fase: 0 });
      }
    }
    // Pozos (si no hay acueducto o en las épocas antiguas) y albercas (desde La Violencia), junto a las casas.
    const sinAgua = !hay('acueducto') || hist <= 1;
    let pozos = 0, albercas = 0, huertas = 0;
    for (const casa of casas) {
      const j = vecinos(casa).find(libre); if (j === undefined) continue;
      const [r, c] = rc(j);
      if (sinAgua && pozos < 2 && (casa % 4 === 0 || pozos === 0)) { usadas.add(j); pozos++; this.poner('pozo', r + .5, c + .5); this.puesto('pozo', r + .5, c + .28, { frente: 1, voltear: false, luego: 'cantaro' }); continue; }
      if (hist >= 2 && albercas < 2 && casa % 3 === 1) { usadas.add(j); albercas++; this.poner('alberca', r + .45, c + .5); this.puesto('alberca', r + .48, c + .22, { frente: 1, voltear: false }); continue; }
      if (huertas < 5 && casa % 2 === 0) { usadas.add(j); huertas++; this.poner('huerta' + (huertas % 2), r + .5, c + .5); for (const dc of [-.12, .12]) this.puesto('huerta', r + .5, c + .5 + dc, { frente: 1, voltear: dc > 0, casa }); }
    }
    // Mulas amarradas frente al mercado, mientras sus dueños compran.
    S.map.forEach((x, i) => {
      if (x.b !== 'mercado' || x.ob) return;
      const j = vecinos(i).find(libre); if (j === undefined) return;
      usadas.add(j); const [r, c] = rc(j); this.poner('mula', r + .4, c + .45); if (S.stage >= 2) this.poner('mula', r + .62, c + .3).setFlipX(true);
    });
    // La silla recostada contra la pared de las casas cercanas a la plaza (en la tarde).
    casas.slice(0, 6).forEach(i => { const [r, c] = rc(i); this.puesto('recostado', r + .5 + .45, c + .5 + .18, { frente: 1, voltear: true }); });
    ocultarPlantas(); // nada de matas encima de la huerta, el pozo o la tienda
    // A la sombra de los árboles grandes al mediodía.
    for (const o of this.scene.plantasMundo || []) {
      if (!ARBOL_SOMBRA.has(o.k) || S.map[o.i].b || Math.hypot(o.r - r0, o.c - c0) > 4) continue;
      for (let k = 0; k < 3; k++) { const an = k / 3 * Math.PI * 2; this.puesto('sombra', o.r + .12 + Math.cos(an) * .16, o.c + .08 + Math.sin(an) * .16, { mira: { r: o.r + .12, c: o.c + .08 } }); }
      if (this.puntos.filter(q => q.tipo === 'sombra').length >= 9) break;
    }
  }

  // ---------- Puestos ----------
  hayPuesto(tipo) { return this.puntos.some(q => q.tipo === tipo && !q.quien); }
  // Toma un puesto libre de ese tipo (el más cercano a f, o uno que cumpla el filtro); devuelve el puesto o null.
  tomar(tipo, f, filtro) {
    let mejor = null, dm = 1e9;
    for (const q of this.puntos) { if (q.tipo !== tipo || q.quien || (filtro && !filtro(q))) continue; const d = Math.hypot(q.r - f.r, q.c - f.c) + Math.random() * 1.5; if (d < dm) { dm = d; mejor = q; } }
    if (mejor) mejor.quien = f;
    return mejor;
  }
  soltar(f) { for (const q of this.puntos) if (q.quien === f) q.quien = null; }
  // ¿Este poblador está en el columpio o en el balancín (llegó y espera)? Entonces lo dibuja Mobiliario.
  enJuego(f) { return f.espera > 0 && !f.ruta.length && (f.destino === 'columpio' || f.destino === 'balancin') && this.puntos.some(q => q.quien === f && q.tipo === f.destino); }

  // ---------- Cada cuadro ----------
  update(dt) {
    if (!this.cosas.length && !this.palomas.length) return;
    const quieto = reducirMovimiento(); this.t += dt;
    const T = this.scene.T, pob = this.scene.pob, A = pob && pob.A;
    // Vendedores: atienden con calma (ofrecen y vuelven a esperar).
    for (const v of this.vendedores) { if (!A || quieto) continue; const ph = ((this.t * .25 + v.fase) % 1), n = ph < .2 ? Math.min(5, Math.floor(ph / .2 * 6)) : 0, k = `${v.tipo}_${v.vi}_vender_${n}`; if (A.marcos[k]) v.img.setFrame(k); }
    // Columpios: el niño sentado va y viene; las cadenas se dibujan cada cuadro.
    this.cadenas.clear();
    for (const s of this.columpios) {
      const f = s.punto.quien, ocupado = f && this.enJuego(f);
      s.fase += dt * 2.3; const th = ocupado && !quieto ? Math.sin(s.fase) * .55 : 0, L = ALTO_COLUMPIO - 3.2;
      const piv = P(s.r, s.c, T.hf(s.r, s.c) + ALTO_COLUMPIO / EL), seat = [piv[0] + DIR_R[0] * Math.sin(th) * L, piv[1] + DIR_R[1] * Math.sin(th) * L + Math.cos(th) * L];
      this.cadenas.lineStyle(.35, 0x6A6E74, 1); for (const d of [-1.1, 1.1]) { this.cadenas.lineBetween(piv[0] + d * .9, piv[1] - d * .45, seat[0] + d, seat[1] - d * .5); }
      this.cadenas.fillStyle(0x8A5A36, 1); this.cadenas.fillRect(seat[0] - 1.6, seat[1] - .4, 3.2, .9);
      this.cadenas.setDepth(s.r + s.c + .01);
      this.ninoEn(s, 0, ocupado ? f : null, seat[0], seat[1] + 2.4, s.r + s.c + .02, true);
    }
    // Balancín: la tabla sube y baja; cada niño en su punta.
    for (const b of this.balancines) {
      const fa = b.puntos[0].quien, fb = b.puntos[1].quien, oa = fa && this.enJuego(fa), ob = fb && this.enJuego(fb);
      if (oa && ob && !quieto) b.fase += dt * 1.6;
      const th = oa && ob ? Math.sin(b.fase) * .2 : oa ? .2 : ob ? -.2 : 0, cen = P(b.r, b.c, T.hf(b.r, b.c) + 2.6 / EL);
      b.tabla.setPosition(cen[0], cen[1]).setRotation(th).setDepth(b.r + b.c + .01);
      const fin = (s) => { const v = P(0, s * .3), x = v[0] * Math.cos(th) - v[1] * Math.sin(th), y = v[0] * Math.sin(th) + v[1] * Math.cos(th); return [cen[0] + x, cen[1] + y]; };
      const pA = fin(-1), pB = fin(1);
      this.ninoEn(b, 0, oa ? fa : null, pA[0], pA[1] + 2.2, b.r + b.c + .015, false);
      this.ninoEn(b, 1, ob ? fb : null, pB[0], pB[1] + 2.2, b.r + b.c + .015, true);
    }
    // Tejo: cuando el jugador suelta (cuadro 2 de su lanzamiento), el tejo vuela en arco hasta el bocín.
    for (const tj of this.tejos) {
      const q = this.puntos.find(p => p.tipo === 'tejo'), f = q && q.quien;
      if (!tj.vuelo && f && !f.ruta.length && f.espera > 0 && f.img.frame && /_tejo_2$/.test(f.img.frame.name) && !quieto) tj.vuelo = { t: 0, dur: 1.1 };
      if (tj.vuelo) {
        tj.vuelo.t += dt; const u = Math.min(1, tj.vuelo.t / tj.vuelo.dur), r = tj.tiro.r + (tj.bocin.r - tj.tiro.r) * u, c = tj.tiro.c + .05 + (tj.bocin.c - tj.tiro.c - .05) * u;
        const p = P(r, c, T.hf(r, c) + (6 + Math.sin(u * Math.PI) * 9 - u * 4.4) / EL);
        tj.disco.setVisible(u < 1).setPosition(p[0], p[1]).setDepth(r + c + .05);
        if (u >= 1) { tj.vuelo = null; tj.disco.setVisible(false); }
      }
    }
    // Palomas: picotean, caminan unos pasos y vuelan cuando alguien pasa cerca; vuelven a los pies de quien les echa
    // migas desde una banca.
    const fig = pob ? pob.figuras : [];
    for (const a of this.palomas) {
      if (quieto) { a.img.setFrame('paloma0'); continue; }
      if (a.vuela) {
        const v = a.vuela; v.t += dt / v.dur; const u = Math.min(1, v.t);
        a.r = v.r0 + (v.r1 - v.r0) * u; a.c = v.c0 + (v.c1 - v.c0) * u; a.f += dt * 14;
        const p = P(a.r, a.c, T.hf(a.r, a.c) + Math.sin(u * Math.PI) * 14 / EL);
        a.img.setFrame('paloma' + (2 + Math.floor(a.f) % 2)).setPosition(p[0], p[1]).setDepth(a.r + a.c + 30).setFlipX(v.c1 - v.r1 < v.c0 - v.r0);
        if (u >= 1) { a.vuela = null; a.espera = azar(1, 3); a.img.setFrame('paloma0'); }
        continue;
      }
      // ¿Alguien camina muy cerca? Sale volando a otro punto de la plaza.
      if ((a.revisa = (a.revisa || 0) - dt) <= 0) {
        a.revisa = .3;
        if (fig.some(f => !f.oculto && f.ruta.length && Math.abs(f.r - a.r) < .22 && Math.abs(f.c - a.c) < .22)) { const an = Math.random() * 6.28, rad = .2 + Math.random() * .28; a.vuela = { r0: a.r, c0: a.c, r1: a.casa.r + Math.cos(an) * rad, c1: a.casa.c + Math.sin(an) * rad, t: 0, dur: azar(1.2, 2) }; continue; }
      }
      if (a.ruta) {
        const dr = a.ruta.r - a.r, dc = a.ruta.c - a.c, d = Math.hypot(dr, dc);
        if (d < .01) a.ruta = null; else { const v = Math.min(d, .09 * dt); a.r += dr / d * v; a.c += dc / d * v; a.img.setFlipX(dc - dr < 0); a.paso = (a.paso || 0) + dt * 8; }
        a.img.setFrame(Math.floor(a.paso || 0) % 2 ? 'paloma0' : 'paloma1');
      } else {
        a.pica = (a.pica || 0) + dt; a.img.setFrame(Math.sin(a.pica * 5 + a.casa.c * 9) > .2 ? 'paloma1' : 'paloma0');
        a.espera -= dt;
        if (a.espera <= 0) {
          const mig = this.puntos.find(q => q.tipo === 'banca' && q.palomas && q.quien && q.quien.accionMigas && !q.quien.ruta.length);
          a.ruta = mig ? { r: mig.r + .16 + azar(-.08, .08), c: mig.c + azar(-.12, .12) } : { r: a.casa.r + azar(-.12, .12), c: a.casa.c + azar(-.12, .12) };
          a.espera = mig ? azar(.6, 1.4) : azar(1.5, 4);
        }
      }
      const p = P(a.r, a.c, T.hf(a.r, a.c)); a.img.setPosition(p[0], p[1]).setDepth(a.r + a.c + .01);
    }
  }
  // Dibuja al niño del columpio o del balancín con su propio cuadro (sentado), y lo quita al irse.
  ninoEn(obj, k, f, x, y, prof, voltear) {
    const pob = this.scene.pob, A = pob && pob.A; let n = obj.ninos[k];
    if (!f || !A) { if (n) n.img.setVisible(false); return; }
    const clave = `nino_${f.p.vi}_sentarse_0`; if (!A.marcos[clave]) return;
    if (!n) { const m = A.marcos[clave]; n = obj.ninos[k] = { img: this.scene.add.image(0, 0, 'acciones', clave).setOrigin(m.ax / m.w, m.ay / m.h).setScale(TAM_GENTE / A.escala) }; }
    n.img.setFrame(clave).setVisible(true).setPosition(x, y).setDepth(prof).setFlipX(voltear);
  }
  destruir() { this.quitar(); this.cadenas.destroy(); }
}
