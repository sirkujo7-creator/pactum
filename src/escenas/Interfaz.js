// Interfaz en HTML sobre el mapa, adaptada de la versión 9: barra superior (régimen, recursos y medidores),
// meta y guía, barra inferior con Construir, Hacienda, Sociedad, Leyes, Crónica y Terminar el año,
// paneles que suben desde abajo (a un lado en computador), fichas, tarjetas de dilemas y avisos.
import {
  C, topeDe, estadoPlaza, motivoMejora, mejorarPlaza, counts, finance, totDebt, cost, waterCap, energy, poweredT, whyNot, vistaPrevia, seatName, RG, RM, D,
  BIOMA, metros, nearRiver, pensamiento, rating, canBorrow, takeLoan, issueBond, printMoney, payDebt, loanRate,
  amenazasActivas, factorClimatico, tipoEpidemia, perdidaEpidemia, costoVigilancia, puedeVigilancia, comprarVigilancia, probAvenida, riesgoLaderas, ciclosActivos, factorCostos, factorRoya, costoPensiones, vejez, elegirPension, bonoBonanza, decidirBonanza, costoSubsidio, decidirCrisis, costoRenovar, puedeRenovar, renovarCafetales, tasaMigracion, historiaActiva, datosEpoca, proximaEpoca, epocaHistorica, rioActivo, probCambio, estadoOrillas, listaPerdidas, megaActivos, estadoMega, evaluarMega, probConsulta, costoConsulta, puedeConsultar, consultar, puedeIniciar, iniciarMega, cancelarMega, tecActiva, estadoTec, saberAnual, proximoInvento, anioInvento, aniosPolis, reqEtapa, decidirInvento, costoTecAnual, epocaVisual, memoriaActiva, recuerdos, balanceMemoria, generacion, proximaGeneracion, esPatrimonio, juicioHistoria, culturaActiva, culturaTotal, costoFiesta, puedeFiesta, organizarFiesta, barriosActivos, barrios, barrioDe, nombreBarrio, costoPrograma, puedePrograma, iniciarPrograma, costoLegalizar, decidirAsentamiento, victoriasActivas, caminos, vecinosActivos, promedioRel, aislado, nivelVecino, factorVecinos, costoAccion, puedeAccion, accionVecino, tensiones, conflictoActivo, conflicto, hayGrupo, partesConflicto, metaConflicto, puedeEstrategia, elegirEstrategia, desastresActivos, volcan, nivelVolcan, costoPlan, puedePlan, comprarPlan, presentes, estadoFig, nivelRel, misionDe, avisosFiguras, sucesosActivos, inseguridad, partesInseguridad, riesgos, actaDisponible, actaActiva, firmarActa, faltasNuevas, contradiria, cumplidos, listaMovimientos, fuerzaMov, nombreEstado, dialogar, puedeDialogar, costoDialogo, fuerzaActiva, nivelLegitimidad, ejercitoActivo, ejercito, metaEjercito, partesEjercito, gruposActivos, panorama, animoGrupo, aporteObra, society, desgloseIndicador, desgloseClase, economiaActiva, precioAlimento, precioCafe, coberturaActiva, serviciosDeCasa, cobertura, evaluarProyecto, ofertas, porEtapas, etapaDe, devolucionObra, fondoSugerido, lluvias, climaActivo, estadoSuelo, nivelObra, estadoObra, costoReparar, reparar, taxLimit, satTargets, lawSlots, lawCostNow, lawBlock, hasLaw, toggleLaw, stance, topPhil, clamp, logrosNuevos, aCodigo, desdeCodigo, callesActivas, eraCalle, conectada, factorCalle, radioCalle,
  guerraActiva, estadoGuerra, enGuerra, partesFuerza, fuerzaPropia, fuerzaVecino, costoRespuesta, puedeResponder, responder, costoDeclarar, puedeDeclarar, declararGuerra, opcionesTratado, costoTratado, firmarTratado, costoRecuperar, puedeRecuperar, recuperarTierras, ocupadasPor,
  fincasActivas, cultivoDe, datosCultivo, listaCultivos, pisoTermico, nombrePiso, aptitud, tieneRiego, produccionFinca, anioCosecha, produce, costoSiembra, puedeSembrar, sembrar, mejorCultivo, canastaOro, pendientes, exteriorActivo, lugares, relacionExterior, accionExterior, nombreRegimen, faltaFundar, ofrecerPlaza, radioCasco, datosLey, quemadaVisible, huellasActivas, tumbasDe, avisoSepultura, esColono, asentamientoDe, ranchos, biomasActivos, glaciar, paramoQueda, factorAguaClima, subidaPisos, suelosActivos, claseSuelo, datosSuelo, suelaEquivocada,
  avancesActivos, datosAvance, obrasDeEtapa, caminoAvances, requisitoAvance, estadoAvances, cabecera,
  industriaActiva, productoDe, datosProducto, listaProductos, insumo, produccionFabrica, insumoSi, productoDisponible, requisitoProducto, costoCambio, puedeProducir, producir, nombreInsumo, mejorProducto, salarioActual, elegirSalario, precioCiclo, hayFabricas, nivelDe, datosNivel, nivelDisponible, costoNivel, puedeModernizar, modernizar,
  civismoActivo, todasLasLeyes, ramaDe, prosContras, estadoCivismo, civismoAnual, abierta, puedeAbrir, abrirLey, faltaRequisito, opuestaDe,
  vecindadActiva, vecindarioDe, bonoFabrica, bonoMercado, rasgosActivos, rasgoPendiente, opcionesRasgo, elegirRasgo, rasgosElegidos, fiestaDelPueblo, todasLasLeyes as leyesTodas,
  familiasActivas, estadoFamilias, cartaRecibida, cartasRecibidas, datosFamilia, datosObjeto, miembrosFamilia, listaFamilias, listaObjetos, epilogo, representantes
} from '../core/index.js';
import { pintarMundo, fichaLugar, lugarEn } from './mundo.js';
import { pintarPlano, casillaPlano, USOS, usoDe, capasPlano, leyendaPlano } from './plano.js';
import { guardarLuego, guardarYa, infoRanura, guardarRanura, cargarRanura, logrosGanados, guardarLogros, guardarSonido } from './memoria.js';
import { Sonido } from './sonido.js';
import { partida } from './partida.js';
import { iconoObra } from '../arte/edificios.js';
import { iconoCalle } from '../arte/calles.js';
import { retrato, retratoFig, gestoDe, EMB } from '../arte/retratos.js';
import { vineta } from '../arte/vinetas.js';
import { capaUI, el, reducirMovimiento } from './pantalla.js';
import { ico as pintado } from '../arte/iconos.js';
import { FR, lienzo, texturaYeso, guarda, urlDe } from '../arte/fresco.js';

// Fase 8: íconos pintados al fresco.
export const IC = { gold: pintado('oro'), debt: pintado('deuda'), food: pintado('alimento'), pop: pintado('poblacion'), agua: pintado('agua'), energia: pintado('energia') };
// Texturas de la interfaz (muro de cal, muro de yeso y greca), una sola vez, como enlaces cortos y ya pintadas sobre su
// color (sin modos de mezcla, que Safari en iPhone recalcula en toda la pantalla).
(() => {
  const r = document.documentElement.style, muro = col => { const y = lienzo(220, 220), gy = y.getContext('2d'); gy.fillStyle = col; gy.fillRect(0, 0, 220, 220); texturaYeso(gy, 0, 0, 220, 220, .7); return urlDe(y); };
  // Guarda de rombos escalonados (cerámica pijao) en terracota con punto ocre, en vez de la greca griega.
  const gc = lienzo(72, 16), g = gc.getContext('2d'); guarda(g, 0, 2, 72, 12, '#A8573A', '#C9973A');
  // Papel viejo para El Pregonero: fondo de pergamino con manchas y fibras suaves.
  const papel = () => { const c = lienzo(260, 260), gp = c.getContext('2d'); gp.fillStyle = '#F1E4C4'; gp.fillRect(0, 0, 260, 260); texturaYeso(gp, 0, 0, 260, 260, .45);
    for (let k = 0; k < 26; k++) { const x = (k * 97) % 260, y = (k * 53) % 260, rr = 10 + (k * 37) % 30, gr = gp.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, 'rgba(160,120,60,.09)'); gr.addColorStop(1, 'rgba(160,120,60,0)'); gp.fillStyle = gr; gp.fillRect(x - rr, y - rr, rr * 2, rr * 2); }
    gp.strokeStyle = 'rgba(120,90,50,.08)'; gp.lineWidth = .6; for (let k = 0; k < 90; k++) { const x = (k * 71) % 260, y = (k * 29) % 260; gp.beginPath(); gp.moveTo(x, y); gp.lineTo(x + 6 + k % 9, y + (k % 3) - 1); gp.stroke(); }
    return urlDe(c); };
  r.setProperty('--muro-cal', `url(${muro('#F7F1E3')})`); r.setProperty('--greca', `url(${urlDe(gc)})`); r.setProperty('--papel-viejo', `url(${papel()})`);
})();
const BADUP = { d: 1, i: 1 };
const signo = v => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(Math.round(v));
const colorDe = v => v >= 60 ? 'var(--good)' : v >= 35 ? 'var(--gold)' : 'var(--bad)';
const GRAFICAS = {
  pop: { n: 'Población', s: [{ k: 'pop', n: 'Habitantes', c: '#2D5D72' }] },
  fin: { n: 'Finanzas', s: [{ k: 'gold', n: 'Oro', c: '#B8871F' }, { k: 'debt', n: 'Deuda', c: '#B0402C' }] },
  soc: { n: 'Sociedad', s: [{ k: 'hap', n: 'Bienestar', c: '#2F7542' }, { k: 'eq', n: 'Igualdad', c: '#7B4F8A' }, { k: 'tr', n: 'Legitimidad', c: '#2D5D72' }, { k: 'env', n: 'Ambiente', c: '#8A9A3A' }], o: { fijo: [0, 100] } },
  inf: { n: 'Inflación', s: [{ k: 'infl', n: 'Inflación', c: '#B0402C', u: '%' }] }
};

const anios = n => n === 1 ? '1 año' : `${n} años`;
const mayus = t => t.charAt(0).toUpperCase() + t.slice(1);
// Emojis: se envuelven para teñirlos con CSS (sepia y pigmento) y que combinen con el fresco.
const EMOJI = /(?:\p{Extended_Pictographic}|[☀-➿])️?(?:‍\p{Extended_Pictographic}️?)*/gu;
function teñirEmojis(nodo) {
  if (!nodo) return;
  if (nodo.nodeType === 3) {
    const t = nodo.nodeValue; EMOJI.lastIndex = 0;
    if (!EMOJI.test(t) || (nodo.parentNode && nodo.parentNode.classList && nodo.parentNode.classList.contains('emo'))) return;
    const f = document.createDocumentFragment(); let i = 0; EMOJI.lastIndex = 0;
    for (const m of t.matchAll(EMOJI)) { if (m.index > i) f.append(t.slice(i, m.index)); const s = document.createElement('span'); s.className = 'emo'; s.textContent = m[0]; f.append(s); i = m.index + m[0].length; }
    if (i < t.length) f.append(t.slice(i));
    nodo.parentNode && nodo.parentNode.replaceChild(f, nodo);
    return;
  }
  if (nodo.nodeType !== 1 || nodo.classList.contains('emo') || /^(SCRIPT|STYLE|TEXTAREA|INPUT)$/.test(nodo.tagName)) return;
  for (const h of [...nodo.childNodes]) teñirEmojis(h);
}
export class Interfaz {
  constructor(mapa) {
    this.mapa = mapa;
    this.herramienta = null;
    this.iconos = {};
    this.grafica = 'pop';
    const b = (texto, titulo, fn, clase = 'redondo') => el('button', { class: clase, 'aria-label': titulo, title: titulo, on: { click: fn } }, texto);
    // Barra superior.
    this.bReg = el('button', { class: 'regb', on: { click: () => this.infoRegimen() } });
    this.era = el('span', { class: 'era' });
    this.hud = el('div', { class: 'hud', 'aria-live': 'polite' });
    this.medidores = el('div', { class: 'medidores' });
    // Paneles.
    this.hojas = {};
    const hoja = (id, titulo, hijos) => {
      const h = el('section', { class: 'hoja', 'aria-label': titulo }, [
        el('div', { class: 'sh-head' }, [el('h2', { text: titulo }), el('button', { class: 'x', 'aria-label': 'Cerrar', on: { click: () => this.cerrarHojas() } }, '✕')]),
        ...hijos]);
      h.hidden = true; this.hojas[id] = h; return h;
    };
    this.tray = el('div', { class: 'tray', role: 'toolbar', 'aria-label': 'Obras' });
    this.hint = el('div', { class: 'hint' });
    this.bSoltar = el('button', { class: 'btn', on: { click: () => this.elegir(null) } }, 'Soltar la obra');
    this.bDeshacer = el('button', { class: 'btn', on: { click: () => this.mapa.deshacer() } }, 'Deshacer última obra');
    this.cuentas = el('div'); this.sociedad = el('div'); this.leyes = el('div'); this.cronica = el('div');
    // Botones de la barra inferior.
    const dk = (id, icono, texto, atajo) => {
      const d = el('button', { class: 'dk', 'aria-expanded': 'false', title: `${texto} (${atajo})`, on: { click: () => this.alternarHoja(id) } }, [el('span', { class: 'di', html: icono }), texto]);
      d.dataset.hoja = id; return d;
    };
    this.bFin = el('button', { class: 'fin', on: { click: () => this.mapa.terminarAnio() } });
    this.dock = el('nav', { class: 'dock', 'aria-label': 'Acciones' }, [
      dk('construir', pintado('construir'), 'Construir', '1'), dk('hacienda', pintado('hacienda'), 'Hacienda', '2'), dk('sociedad', pintado('sociedad'), 'Sociedad', '3'),
      dk('leyes', pintado('leyes'), 'Leyes', '4'), dk('cronica', pintado('cronica'), 'Crónica', '5'), this.bFin
    ]);
    this.meta = el('button', { class: 'meta', on: { click: () => this.meta.classList.toggle('abierta') } });
    this.ficha = el('div', { class: 'ficha', role: 'dialog', 'aria-label': 'Ficha' }); this.ficha.hidden = true;
    this.velo = el('div', { class: 'velo', on: { click: e => { if (e.target === this.velo && this.tarjetaCerrable) this.cerrarTarjeta(); } } });
    this.card = el('div', { class: 'card', role: 'dialog', 'aria-modal': 'true' });
    this.velo.append(this.card); this.velo.hidden = true;
    this.aviso = el('div', { class: 'aviso', role: 'status' });
    this.brindis = el('div', { class: 'toast', role: 'status', 'aria-live': 'polite' });
    this.pasa = el('div', { class: 'anio-pasa', 'aria-hidden': 'true' });
    this.raiz = el('div', { class: 'mapa-ui' }, [
      el('header', { class: 'arriba' }, [el('div', { class: 'fila1' }, [this.bReg, this.era]), this.hud, this.medidores,
        el('div', { class: 'fila-pend' }, [this.bPend = b('📋', 'Pendientes (p)', () => this.tarjetaPendientes(), 'redondo pendb')])]),
      el('div', { class: 'controles' }, [
        this.bGrupo = b('☰', 'Menú', () => this.alternarGrupo()),
        this.grupo = el('div', { class: 'grupo' }, [
        b('?', 'Cómo jugar', () => this.ayuda(false)),
        b('▤', 'Partidas y logros', () => this.menu()),
        b('🌎', 'El mundo (m)', () => this.tarjetaMundo()),
        b('🗺️', 'Vista de plano (v)', () => this.tarjetaPlano()),
        this.bSonido = b('🔇', 'Activar sonido', () => this.alternarSonido()),
        b('+', 'Acercar (+)', () => mapa.listo && mapa.zoomCentro(1.25)),
        b('−', 'Alejar (−)', () => mapa.listo && mapa.zoomCentro(1 / 1.25)),
        b('⤢', 'Ver todo el territorio (0)', () => mapa.listo && mapa.encuadrar()),
        b('⌂', 'Ir a la aldea', () => mapa.listo && mapa.enfocarAldea()),
        this.bCob = b('◎', 'Capa de cobertura (c)', () => mapa.listo && mapa.alternarCobertura())
        ])
      ]),
      this.meta,
      hoja('construir', 'Construir', [this.tray, this.hint, el('div', { class: 'dos' }, [this.bSoltar, this.bDeshacer])]),
      hoja('hacienda', 'Libro de cuentas', [this.cuentas]),
      hoja('sociedad', 'Sociedad', [this.sociedad]),
      hoja('leyes', 'Leyes', [this.leyes]),
      hoja('cronica', 'Crónica del territorio', [this.cronica]),
      this.ficha, this.dock, this.pasa, this.aviso, this.brindis, this.velo
    ]);
    capaUI().append(this.raiz);
    // Fase 9: los emojis de los textos se tiñen con los pigmentos del fresco (envueltos en <span class="emo">).
    this.tinte = new MutationObserver(L => { for (const m of L) for (const n of m.addedNodes) teñirEmojis(n); });
    this.tinte.observe(this.raiz, { childList: true, subtree: true });
    teñirEmojis(this.raiz);
  }

  destruir() { this.tinte.disconnect(); this.raiz.remove(); }
  // Fase 8: los botones de la derecha se agrupan en un solo menú (en computador quedan abiertos).
  alternarGrupo(abrir) { const on = abrir ?? !this.grupo.classList.contains('abierto'); this.grupo.classList.toggle('abierto', on); this.bGrupo.setAttribute('aria-expanded', String(on)); this.bGrupo.classList.toggle('on', on); }
  avisar(t) { this.aviso.textContent = t; this.aviso.hidden = !t; }
  toast(t) {
    this.brindis.textContent = t; this.brindis.classList.add('show');
    clearTimeout(this._t); this._t = setTimeout(() => this.brindis.classList.remove('show'), Math.min(8000, 2600 + t.length * 25));
  }
  get S() { return this.mapa.S; }
  icono(k) {
    const S = this.S, clave = `${k}-${S.stage >= 2 ? 2 : 0}-${k === 'agora' ? S.reg : ''}`;
    return this.iconos[clave] || (this.iconos[clave] = iconoObra(k, S.stage, S.reg));
  }
  // Fase 10: la finca (el antiguo cultivo) tiene su propio nombre y descripción.
  descripcion(k) { return k === 'cultivo' && fincasActivas(this.S) ? C.CULTIVOS.textos.finca : k === 'taller' && industriaActiva(this.S) ? C.INDUSTRIA.textos.fabrica : C.B[k].d; }
  nombre(k) { return k === 'cultivo' && fincasActivas(this.S) ? C.CULTIVOS.nombreFinca : k === 'taller' && industriaActiva(this.S) ? C.INDUSTRIA.nombreFabrica : k === 'agora' ? seatName(this.S) : k === 'calle' ? C.CALLES.textos.herramienta : k === 'quitarCalle' ? C.CALLES.textos.quitar : C.B[k].n; }
  hayTarjeta() { return !this.velo.hidden; }

  // ---------- Paneles ----------
  hojaAbierta() { return Object.keys(this.hojas).find(k => !this.hojas[k].hidden) || null; }
  alternarHoja(id) { this.hojaAbierta() === id ? this.cerrarHojas() : this.abrirHoja(id); }
  abrirHoja(id) {
    if (this.S.over && id === 'construir') return;
    this.cerrarFicha();
    for (const [k, h] of Object.entries(this.hojas)) h.hidden = k !== id;
    this.dock.querySelectorAll('.dk').forEach(d => { const on = d.dataset.hoja === id; d.classList.toggle('on', on); d.setAttribute('aria-expanded', String(on)); });
    if (id !== 'construir') this.elegir(null, true);
    this.render();
  }
  cerrarHojas() {
    for (const h of Object.values(this.hojas)) h.hidden = true;
    this.dock.querySelectorAll('.dk').forEach(d => { d.classList.remove('on'); d.setAttribute('aria-expanded', 'false'); });
    this.elegir(null, true);
  }
  // Mantiene el nombre anterior para el atajo B.
  alternarHojaConstruir() { this.alternarHoja('construir'); }
  get hoja() { return this.hojas.construir; }
  elegir(k, silencioso) {
    this.herramienta = k === null ? null : (this.herramienta === k ? null : k);
    this.mapa.marcarPosibles(this.herramienta);
    if (!silencioso) this.render();
  }

  // ---------- Dibujo de todo ----------
  render() {
    if (this.bCob) { const on = !!this.mapa.verCobertura; this.bCob.setAttribute('aria-pressed', String(on)); this.bCob.classList.toggle('on', on); }
    const S = this.S;
    if (!S) return;
    const c = counts(S), F = finance(S), so = F.so, R = rating(S), rg = RG(S);
    document.documentElement.style.setProperty('--regc', rg.col);
    const faltas = [...faltasNuevas(S), ...avisosFiguras(S)];
    // Fase 7: como mucho tres avisos a la vez (sin repetidos); el resto queda en la crónica.
    const unicos = [...new Set(faltas)], txt = unicos.slice(0, 3).join(' ') + (unicos.length > 3 ? ` (y ${unicos.length - 3} más)` : '');
    if (unicos.length) setTimeout(() => this.toast(txt), 50);
    guardarLuego(S);
    Sonido.mode(S.reg);
    this.bSonido.textContent = Sonido.on ? '🔊' : '🔇';
    this.bSonido.setAttribute('aria-label', Sonido.on ? 'Silenciar' : 'Activar sonido'); this.bSonido.title = this.bSonido.getAttribute('aria-label');
    this.bReg.innerHTML = `${EMB[S.reg]}<b>${rg.n.split(' ')[0]}</b>`;
    this.bReg.setAttribute('aria-label', `Régimen: ${rg.n}. Ver rumbo del gobierno`);
    const L = lluvias(S), temp = this.mapa.pob ? this.mapa.pob.temporada() : null;
    this.era.innerHTML = `${C.STAGES[S.stage].n}, año ${S.year}${S.stage === 3 ? `. Polis ${S.polisYears}/${aniosPolis(S)}` : ''}${L ? ` · ${L.icono}<span class="lluv-nom"> ${L.nombre.toLowerCase()}</span>` : ''}${economiaActiva(S) && S.eco.fase !== 'normal' ? ` · ${C.ECO.fases[S.eco.fase].icono}<span class="lluv-nom"> ${C.ECO.fases[S.eco.fase].nombre.toLowerCase()}</span>` : ''}`;
    this.era.title = L ? `${L.texto} ${C.CLIMA.leccion}${temp ? ` Ahora es temporada ${temp === 'lluvias' ? 'de lluvias' : 'seca'}.` : ''}` : '';
    const dfood = F.fprod - F.cons, pa = precioAlimento(S);
    this.hud.innerHTML =
      `<div class="pill" title="Oro">${IC.gold}<b class="${S.gold < 0 ? 'neg' : ''}">${Math.round(S.gold)}</b></div>` +
      `<div class="pill" title="Deuda">${IC.debt}<b>${Math.round(totDebt(S))}</b></div>` +
      `<div class="pill" title="Alimento${pa !== 1 ? '. ' + C.ECO.textos.pastilla.replace('{p}', pa.toLocaleString('es-CO')) : ''}">${IC.food}<b>${Math.round(S.food)}</b><small class="${dfood < 0 ? 'neg' : ''}">${dfood >= 0 ? '+' : '−'}${Math.abs(dfood)}</small>${pa >= 1.15 ? `<small class="precio neg" aria-label="precio alto">▲${pa.toLocaleString('es-CO')}</small>` : pa <= .85 ? `<small class="precio pos" aria-label="precio bajo">▼${pa.toLocaleString('es-CO')}</small>` : ''}</div>` +
      `<div class="pill" title="Población">${IC.pop}<b>${S.pop}</b><small>/${c.casa * 10}</small></div>` +
      (S.stage >= 1 ? `<div class="pill" title="Agua">${IC.agua}<b class="${S.pop > waterCap(S, c) ? 'neg' : ''}">${waterCap(S, c)}</b></div><div class="pill" title="Energía para talleres">${IC.energia}<b class="${c.taller > energy(S, c) ? 'neg' : ''}">${poweredT(S, c)}/${c.taller}</b></div>` : '');
    this.medidores.replaceChildren(
      ...[['Bienestar', pintado('bienestar', 'mi'), S.hap, 'hap'], ['Igualdad', pintado('igualdad', 'mi'), S.eq, 'eq'], ['Legitimidad', pintado('legitimidad', 'mi'), S.tr, 'tr'], ['Ambiente', pintado('ambiente', 'mi'), S.env, 'env']].map(([n, ico, v, k]) =>
        el('button', { class: 'medidor', title: `${n}: ${Math.round(v)} de 100. ${C.IND[k].que} Toca para ver por qué sube o baja.`, 'aria-label': `${n}: ${Math.round(v)} de 100. Ver por qué`, on: { click: () => this.explicar(k) }, html: `<div class="lab"><span><span class="ico" aria-hidden="true">${ico}</span><span class="nom">${n}</span></span><b>${Math.round(v)}</b></div><div class="track"><div class="fill" style="width:${v}%;background:${colorDe(v)}"></div></div>` })),
      el('button', { class: 'medidor', title: `Rumbo del gobierno: de bien común (0) a interés propio (100). ${C.IND.corr.que} Toca para ver por qué cambia.`, 'aria-label': `Rumbo del gobierno: ${Math.round(S.corr)}. Ver por qué`, on: { click: () => this.explicar('corr') }, html: `<div class="lab"><span><span class="ico" aria-hidden="true">${pintado('rumbo', 'mi')}</span><span class="nom">Rumbo</span></span><b>${Math.round(S.corr)}</b></div><div class="track"><div class="fill" style="width:${S.corr}%;background:${colorDe(100 - S.corr)}"></div></div>` })
    );
    // Meta, guía, promesas y exigencias (como en la v9).
    const nx = C.STAGES[S.stage + 1], g = S.guide && S.gstep < C.GUIDE.length ? C.GUIDE[S.gstep] : null;
    const ff = faltaFundar(S);
    const meta = ff && ff.plaza ? C.HUELLAS.fundacion.textos.meta.replace('{casas}', `${ff.casas} ${ff.casas === 1 ? 'casa' : 'casas'}`).replace('{fincas}', `${ff.fincas} ${ff.fincas === 1 ? 'finca' : 'fincas'}`) : ff ? `Funda tu aldea: elige dónde construir ${ff.casas} ${ff.casas === 1 ? 'casa' : 'casas'} y ${ff.fincas} ${ff.fincas === 1 ? 'finca' : 'fincas'} (el oro ya lo tienes). Junto al río la comida rinde más.` : S.ganado ? '🏛️ Polis sostenida: ganaste. Sigues gobernando sin meta fija.' : nx ? `Meta: ${nx.n} (${reqEtapa(S, S.stage + 1)}${S.stage === 2 && vecinosActivos(S) ? `; relaciones de ${C.VECINOS.minimo} con los vecinos` : ''}).` : `Meta: sostener la Polis ${aniosPolis(S)} años.`;
    const pr = S.promises.map(p => `Promesa: ${C.B[p.k].a} antes del año ${p.dl}.`).join(' ');
    const pron = climaActivo(S) && S.clima.pronostico, FEN = C.CLIMA && C.CLIMA.fenomenos;
    const avisoClima = pron ? `${FEN[pron.tipo].icono} <b>${FEN[pron.tipo].nombre} llega el año ${pron.anio}.</b> Fondo de emergencias: ${Math.round(S.fondo || 0)} de oro.` : '';
    const avisoEco = economiaActiva(S) && S.eco.aviso ? `📉 <b>Recesión anunciada para el año ${S.eco.aviso.anio}.</b>` : '';
    const sep = avisoSepultura(S), avisoSep = sep ? `🪦 <b>${sep}</b>` : ''; // huellas: muertos sin sepultura
    const aviso = avisoClima || avisoEco || avisoSep;
    // La meta siempre queda a la vista en la primera línea; avisos y guía van en la segunda.
    const segunda = ff && ff.plaza ? C.HUELLAS.fundacion.textos.metaGuia : ff ? 'Toca <b>Construir</b>, elige <b>Casas</b> o <b>Finca</b> y luego el lugar en el mapa. La primera obra marca el centro de tu pueblo.' : aviso || (g ? `<b>Guía ${S.gstep + 1}/${C.GUIDE.length}</b> ${g.t}` : '');
    this.meta.innerHTML = `<div class="gl1"><b>${meta}</b></div>${segunda ? `<div class="gl1 gl2">${segunda}</div>` : ''}` +
      `<div class="gmore">${aviso && g ? `<b>Guía ${S.gstep + 1}/${C.GUIDE.length}</b> ${g.t} ` : ''}${avisoClima ? FEN[pron.tipo].preparar + ' ' : avisoEco ? C.ECO.textos.preparar + ' ' : ''}${pr ? pr + ' ' : ''}${L && L.cosecha !== 1 ? `${L.icono} ${L.texto} ` : ''}${S.expc > 0 ? `<span class="neg">${culturaActiva(S) ? `El pueblo pide cultura y sentido (−${S.expc} de ánimo): canchas, biblioteca, teatro, estadio, fiestas, parques, sede y universidad lo calman.` : `El pueblo exige más calidad de vida (−${S.expc} de ánimo): parques, sede de gobierno y universidad la mejoran.`}</span> ` : ''}${climaActivo(S) && C.VICTORIAS ? '<span class="lnk" role="button" tabindex="0" data-caminos>Caminos a la victoria</span> ' : ''}${g ? '<span class="lnk" role="button" tabindex="0" data-ocultar>Ocultar guía</span>' : ''}</div>`;
    const cv = this.meta.querySelector('[data-caminos]');
    if (cv) cv.onclick = e => { e.stopPropagation(); this.caminosVictoria(); };
    const oc = this.meta.querySelector('[data-ocultar]');
    if (oc) oc.onclick = e => { e.stopPropagation(); S.guide = false; this.render(); };
    // En computador los paneles van a un lado: la meta sigue visible. En celular la tapa el panel que sube.
    this.meta.hidden = (!!this.hojaAbierta() && !window.matchMedia('(min-width:760px)').matches) || S.over;
    this.marcarPendientes(); // el contador de pendientes
    this.bFin.disabled = !!S.pend || S.over;
    this.bFin.innerHTML = S.over ? 'Fin' : `Año ${S.year}<br><small>terminar ▸</small>`;
    this.bFin.title = 'Terminar el año (barra espaciadora)';
    const abierta = this.hojaAbierta();
    if (abierta === 'construir') this.renderConstruir();
    if (abierta === 'hacienda') this.renderHacienda(F, R);
    if (abierta === 'sociedad') this.renderSociedad(so, c);
    if (abierta === 'leyes') this.renderLeyes();
    if (abierta === 'cronica') this.renderCronica();
  }

  renderConstruir() {
    const S = this.S;
    this.tray.replaceChildren(...Object.entries(C.B).filter(([k]) => !(k === 'cafetal' && fincasActivas(S)) && (k !== 'fundacion' || ofrecerPlaza(S)) && (k !== 'cementerio' || huellasActivas(S))).map(([k, b]) => { // fase 10: el café se siembra en la finca
      const tope = topeDe(S, k), cuantos = S.map.reduce((n, x) => n + (x.b === k ? 1 : 0), 0), alTope = tope !== Infinity && cuantos >= tope && b.st <= S.stage;
      const bloqueada = b.st > S.stage || alTope;
      return el('button', {
        class: 'tool' + (this.herramienta === k ? ' on' : ''), 'aria-pressed': String(this.herramienta === k),
        ...(bloqueada ? { disabled: '' } : {}), on: { click: () => this.elegir(k) }
      }, [
        bloqueada ? el('span', { class: 'candado', text: alTope ? '⛲' : '🔒', 'aria-hidden': 'true' }) : el('img', { src: this.icono(k), alt: '' }),
        this.nombre(k),
        el('small', { html: alTope ? `Tope ${tope}` : bloqueada ? C.STAGES[b.st].n : `${IC.gold.replace('class="ic"', 'class="ic" style="display:inline;width:13px;height:13px;vertical-align:-2px"')} ${cost(S, k)}${porEtapas(S, k) ? ` · ${anios(C.B[k].anios)}` : ''}` })
      ]);
    }));
    // Fase 9: calles en damero (van por los bordes de las casillas); van primero para que se vean en el celular.
    if (callesActivas(S)) {
      const era = eraCalle(S), E = C.CALLES.eras[era], oro = IC.gold.replace('class="ic"', 'class="ic" style="display:inline;width:13px;height:13px;vertical-align:-2px"');
      this.tray.prepend(...[['calle', false], ['quitarCalle', true]].map(([k, quitar]) => el('button', {
        class: 'tool' + (this.herramienta === k ? ' on' : ''), 'aria-pressed': String(this.herramienta === k), on: { click: () => this.elegir(k) }
      }, [el('img', { src: iconoCalle(era, quitar), alt: '' }), this.nombre(k), el('small', { html: quitar ? 'sin devolución' : `${oro} ${Math.round(E.costo * S.price)} por tramo` })])));
    }
    const k = this.herramienta;
    if (k === 'calle' || k === 'quitarCalle') {
      const T = C.CALLES.textos, E = C.CALLES.eras[eraCalle(S)], tr = this.mapa.trazoCalle, pre = this.mapa.presupuestoCalle();
      const paso = k === 'quitarCalle' ? T.quitarAyuda : pre ? '' : tr ? T.destino : T.inicio;
      const partes = [el('div', { html: `<b>${k === 'calle' ? E.nombre : T.quitar}.</b> ${k === 'calle' && !tr ? `${T.ayuda} <span class="prev small">${T.efectos} Mantenimiento: ${C.CALLES.eras[eraCalle(S)].mantenimiento.toLocaleString('es-CO')} de oro por tramo al año.</span>` : ''}` })];
      if (paso) partes.push(el('div', { class: 'prev', text: paso }));
      if (pre) {
        partes.push(el('div', { class: 'prev', html: `${pre.tramos} tramo${pre.tramos === 1 ? '' : 's'} nuevo${pre.tramos === 1 ? '' : 's'}${pre.puentes ? ` y ${pre.puentes} puente${pre.puentes > 1 ? 's' : ''}` : ''}: <b>${pre.oro} de oro</b>.${pre.ambiente ? ` Cruza el bosque: −${pre.ambiente.toLocaleString('es-CO')} de ambiente.` : ''}${pre.oro > S.gold ? ` <span class="neg">${T.sinOro}</span>` : ''}` }));
        partes.push(el('div', { class: 'dos' }, [
          el('button', { class: 'btn', ...(pre.oro > S.gold || !pre.tramos ? { disabled: '' } : {}), on: { click: () => this.mapa.confirmarCalle() } }, 'Construir la calle'),
          el('button', { class: 'btn', on: { click: () => this.mapa.cancelarCalle() } }, 'Cancelar')
        ]));
      }
      this.hint.replaceChildren(...partes);
    } else if (k) {
      const v = vistaPrevia(S, k);
      let prev;
      if (v.motivo) prev = `<span class="prev neg">${v.motivo}</span>`;
      else {
        const paga = v.anios > 1 ? `Cuesta ${v.costo} de oro en ${v.anios} pagos de ${v.cuota}, uno por año; presta servicio al terminar.` : v.anios === 1 ? `Cuesta ${v.costo} de oro; tarda un año y presta servicio al terminar.` : `Cuesta ${v.costo} de oro.`;
        prev = `<span class="prev">${paga} ${v.anios ? 'Cuando esté lista' : 'Si la construyes'}:</span>${this.efectos(v)}<span class="prev small">Toca una casilla marcada.</span>`;
      }
      this.hint.innerHTML = `<b>${this.nombre(k)}.</b> ${this.descripcion(k)} ${prev}`;
    } else this.hint.textContent = 'Elige una obra para construir, o toca una casilla para ver su ficha.';
    this.bSoltar.hidden = !k;
    this.bDeshacer.hidden = !S.undo.length || S.over;
    this.hoja.classList.toggle('mini', !!k);
  }

  renderHacienda(F, R) {
    const S = this.S, cb = canBorrow(S) && !S.over;
    const fila = (k, n) => `<div class="txrow"><span>${n}</span><input type="range" min="0" max="${k === 'e' ? 50 : 40}" value="${S.tx[k]}" data-tx="${k}" aria-label="Impuesto a ${n.toLowerCase()}"><strong>${S.tx[k]}%</strong></div>`;
    const sec = (id, html, t, r) => this.pleg(id, html, t, r);
    this.cuentas.innerHTML = this.pleg('h-cuentas', `
      ${fila('c', 'Campesinos')}${fila('a', 'Artesanos')}${fila('e', 'Élite')}
      <div class="macro"><div><strong class="${S.infl > .06 ? 'neg' : ''}">${(S.infl * 100).toFixed(1)}%</strong><span>Inflación</span></div><div><strong>${S.price.toFixed(2)}</strong><span>Nivel de precios</span></div><div><strong class="r${R.l[0]}">${R.l}</strong><span>Calificación</span></div><div><strong>${Math.round(F.rate * 100)}%</strong><span>Tasa de interés</span></div></div>
      <div class="ledger"><table class="budget">
        <tr><td>Impuesto a campesinos</td><td>+${F.taxC}</td></tr><tr><td>Impuesto a artesanos</td><td>+${F.taxA}</td></tr><tr><td>Impuesto a la élite</td><td>+${F.taxE}</td></tr>
        <tr><td>Tasas y regalías</td><td>+${F.fee}</td></tr><tr><td>Mantenimiento de obras${S.desgaste && (S.mant ?? 100) < 100 ? ` (${S.mant}%)` : ''}</td><td>−${F.up}</td></tr><tr><td>Administración pública</td><td>−${F.admin}</td></tr>${F.pensiones ? `<tr><td>Pensiones</td><td>−${F.pensiones}</td></tr>` : ''}${F.calles ? `<tr><td>Mantenimiento de calles</td><td>−${F.calles}</td></tr>` : ''}${F.obras ? `<tr><td>Obras en construcción (si alcanza el oro)</td><td>−${F.obras}</td></tr>` : ''}${F.militar ? `<tr><td>Gasto militar</td><td>−${F.militar}</td></tr>` : ''}
        ${F.lawCost ? `<tr><td>Costo de las leyes</td><td>−${F.lawCost}</td></tr>` : ''}${F.fondo ? `<tr><td>Aporte al fondo de emergencias</td><td>−${F.fondo}</td></tr>` : ''}
        ${F.pay ? `<tr><td>Cuota de préstamos (interés ${F.interest})</td><td>−${F.pay}</td></tr>` : ''}${F.cpn ? `<tr><td>Cupones de bonos</td><td>−${F.cpn}</td></tr>` : ''}${F.mat ? `<tr><td>Vencimiento de bonos</td><td>−${F.mat}</td></tr>` : ''}
        <tr class="tot"><td>Resultado del año</td><td class="${F.net < 0 ? 'neg' : ''}">${F.net >= 0 ? '+' : '−'}${Math.abs(F.net)}</td></tr></table></div>
      ${C.TRABAJO && climaActivo(S) && F.so.jc + F.so.ja > 0 ? (() => { const T = C.TRABAJO.textos, o = F.so.ocup, pct = Math.round(o * 100), ef = o >= .99 ? T.efectoPleno : o < C.TRABAJO.minimo ? T.efectoNulo : T.efectoParcial.replace('{pct}', pct); return `<p class="small${o < .95 ? ' neg' : ''}">${T.hacienda.replace('{gente}', F.so.P - F.so.el).replace('{puestos}', F.so.jc + F.so.ja).replace('{pct}', Math.min(100, pct)).replace('{efecto}', ef)} <i>${C.TRABAJO.leccion}</i></p>`; })() : ''}
      ${F.evadido ? `<p class="small">La evasión se llevó ${F.evadido} de oro: ${Math.round((1 - cobertura(S).recaudo) * 100)}% de las casas está lejos de una oficina de recaudo. ${C.COB.leccionRecaudo}</p>` : ''}
      <div class="cuatro"><button class="btn" data-a="prestamo" ${cb ? '' : 'disabled'}>Pedir préstamo</button><button class="btn" data-a="bono" ${cb ? '' : 'disabled'}>Emitir bono</button><button class="btn" data-a="imprimir" ${S.stage < 1 || S.over ? 'disabled' : ''}>Imprimir moneda</button><button class="btn" data-a="abonar" ${S.debt <= 0 || S.gold < 1 || S.over ? 'disabled' : ''}>Abonar 50</button></div>
      <p class="small">${S.stage < 1 ? 'El crédito y la emisión se abren al llegar a Pueblo.' : R.l === 'CCC' ? 'Calificación CCC: nadie te presta. Reduce deuda y déficit.' : 'Préstamo: 150, se paga 15% por año. Bono: 200 a 5 años, interés más bajo, pagas todo al vencer.'}</p>`, 'Impuestos y cuentas', `Resultado del año: ${F.net >= 0 ? '+' : '−'}${Math.abs(F.net)}`, true) + `
      ${climaActivo(S) && S.stage >= 1 ? sec('h-fondo', `<h3>${C.CLIMA.fondo.nombre}</h3>
        <div class="txrow"><span>Aporte</span><input type="range" min="0" max="${C.CLIMA.fondo.maximo}" value="${S.aporteFondo || 0}" data-fondo aria-label="Aporte al fondo de emergencias, porcentaje de los ingresos"><strong>${S.aporteFondo || 0}%</strong></div>
        <p class="small">Guardado: <b>${Math.round(S.fondo || 0)} de oro</b>. Una emergencia hoy costaría unos ${fondoSugerido(S)}. ${C.CLIMA.fondo.leccion}</p>`, null, `${Math.round(S.fondo || 0)} de oro`) : ''}
      ${sec('h-riesgo', this.seccionRiesgo())}${sec('h-mega', this.seccionMega())}
      ${sec('h-economia', this.seccionEconomia())}${sec('h-canasta', this.seccionCanasta(), 'Canasta del campo y la industria')}${sec('h-industria', this.seccionIndustria())}${sec('h-clima', this.seccionClimaTerritorio())}${sec('h-ciclos', this.seccionCiclos(), 'Ciclos: café, roya y pensiones')}
      ${sec('h-ejercito', this.seccionEjercito())}
      ${sec('h-mant', this.seccionMantenimiento())}
      ${S.bonds.length ? sec('h-bonos', `<p class="small">Bonos: ${S.bonds.map(b => `${b.amt} al ${Math.round(b.cpn * 100)}%, vence año ${b.due}`).join('; ')}.</p>`, 'Bonos', `${S.bonds.length}`) : ''}`;
    this.activarPlegables(this.cuentas);
    this.cuentas.querySelectorAll('[data-tx]').forEach(inp => {
      inp.oninput = () => {
        const k = inp.dataset.tx, want = +inp.value, v = taxLimit(S, k, want);
        S.tx[k] = v;
        if (v !== want) { inp.value = v; this.toast(RM(S, 'eliteCap', 0) && k === 'e' && want > RM(S, 'eliteCap', 0) ? `La plutocracia no permite cobrar más de ${RM(S, 'eliteCap', 0)}% a la élite.` : 'El Senado solo permite mover cada impuesto 5 puntos por año.'); }
        inp.nextElementSibling.textContent = v + '%';
        clearTimeout(this._tx); this._tx = setTimeout(() => this.render(), 120);
        this.mapa.cambio();
      };
    });
    this.cuentas.querySelectorAll('[data-sal]').forEach(b => b.onclick = () => { if (elegirSalario(S, b.dataset.sal)) { this.toast(C.INDUSTRIA.textos.salarioCambia.replace('{nombre}', C.INDUSTRIA.salarios[b.dataset.sal].nombre.toLowerCase())); this.mapa.cambio(); this.render(); } });
    this.cuentas.querySelectorAll('[data-mega]').forEach(b => b.onclick = () => this.explicarMega(b.dataset.mega));
    this.cuentas.querySelectorAll('[data-pension]').forEach(b => b.onclick = () => { if (elegirPension(S, b.dataset.pension)) { this.toast(`Pensiones: ${C.CICLOS.pensiones.sistemas[b.dataset.pension].nombre.toLowerCase()}.`); this.mapa.cambio(); this.render(); } });
    const ren = this.cuentas.querySelector('[data-renovar]');
    if (ren) ren.onclick = () => { if (renovarCafetales(S)) { this.toast('Cafetales renovados con variedad resistente a la roya.'); this.mapa.cambio(); this.render(); } };
    const vig = this.cuentas.querySelector('[data-vigilancia]');
    if (vig) vig.onclick = () => { if (comprarVigilancia(S)) { this.toast('Vigilancia epidemiológica lista.'); this.mapa.cambio(); this.render(); } };
    const pl = this.cuentas.querySelector('[data-plan]');
    if (pl) pl.onclick = () => { if (comprarPlan(S)) { this.toast('Plan de evacuación listo: sirenas, rutas y simulacros.'); this.mapa.cambio(true); this.render(); } };
    const mil = this.cuentas.querySelector('[data-militar]');
    if (mil) mil.oninput = () => { ejercito(S).gasto = +mil.value; mil.nextElementSibling.textContent = mil.value + '%'; clearTimeout(this._tx); this._tx = setTimeout(() => this.render(), 150); this.mapa.cambio(); };
    const ej = this.cuentas.querySelector('[data-ejercito]');
    if (ej) ej.onclick = () => this.explicarEjercito();
    const mant = this.cuentas.querySelector('[data-mant]');
    if (mant) mant.oninput = () => { S.mant = +mant.value; mant.nextElementSibling.textContent = mant.value + '%'; clearTimeout(this._tx); this._tx = setTimeout(() => this.render(), 150); this.mapa.cambio(); };
    const todo = this.cuentas.querySelector('[data-reparar]');
    if (todo) todo.onclick = () => this.mapa.repararTodo();
    const fondo = this.cuentas.querySelector('[data-fondo]');
    if (fondo) fondo.oninput = () => { S.aporteFondo = +fondo.value; fondo.nextElementSibling.textContent = fondo.value + '%'; clearTimeout(this._tx); this._tx = setTimeout(() => this.render(), 150); this.mapa.cambio(); };
    this.cuentas.querySelectorAll('[data-a]').forEach(bt => bt.onclick = () => {
      const a = bt.dataset.a;
      if (a === 'prestamo' && takeLoan(S)) { S.log.unshift({ y: S.year, t: `Préstamo de 150 al ${Math.round(loanRate(S) * 100)}%.` }); this.toast('Recibiste 150 de oro.'); }
      if (a === 'bono') { const cp = issueBond(S); if (cp) { S.log.unshift({ y: S.year, t: `Emitiste un bono de 200 al ${Math.round(cp * 100)}% a 5 años.` }); this.toast('Recibiste 200. Pagarás cupones y el capital al vencer.'); } }
      if (a === 'imprimir' && printMoney(S)) this.toast('Imprimiste 50 de oro. Los precios subirán el próximo año.');
      if (a === 'abonar') this.toast(`Abonaste ${payDebt(S)} a los préstamos.`);
      this.mapa.cambio(); this.render();
    });
  }

  renderSociedad(so, c) {
    const S = this.S, TG = satTargets(S, c, false);
    const tr = (v, t) => { const d = Math.round(t - v); return Math.abs(d) < 2 ? 'estable' : d > 0 ? `sube hacia ${Math.round(clamp(t, 0, 100))}` : `baja hacia ${Math.round(clamp(t, 0, 100))}`; };
    const cls = [['Campesinos', so.camp, S.sat.c, `${so.camp} de ${so.jc} puestos. Ánimo ${tr(S.sat.c, TG.c)}`, 'rosa'], ['Artesanos', so.art, S.sat.a, `${so.art} de ${so.ja} puestos. Ánimo ${tr(S.sat.a, TG.a)}`, 'julian'], ['Élite', so.el, S.sat.e, `Dueños de comercio e industria. Ánimo ${tr(S.sat.e, TG.e)}`, 'aurelio']];
    this.sociedad.innerHTML = this.pleg('so-clases', cls.map(([n, k, v, sub, a]) => {
      const A = C.ADV[a], md = A.mood[v < 35 ? 0 : v < 62 ? 1 : 2];
      const cl = n === 'Campesinos' ? 'c' : n === 'Artesanos' ? 'a' : 'e', peor = desgloseClase(S, cl).partes.filter(x => x[1] < 0 && !/partida/.test(x[0]))[0];
      return `<div class="cls"><img src="${retrato(a, gestoDe(v))}" alt="${A.n}"><div><div class="lab"><span>${n} <b>${k}</b></span><span>${Math.round(v)}</span></div><div class="track"><div class="fill" style="width:${v}%;background:${colorDe(v)}"></div></div><small>${sub}</small>${peor ? `<small class="neg">Lo que más le molesta: ${peor[0].toLowerCase()} (${signo(peor[1])}).</small>` : ''}<div class="quote">${A.n}: “${md}”</div><button class="btn porque" data-clase="${cl}">¿Por qué? Ver causas</button>${this.subgrupos(cl)}</div></div>`;
    }).join(''), 'Clases sociales', `${so.camp + so.art + so.el} personas`, true) + this.pleg('so-figuras', this.seccionFiguras(), 'Personajes') + this.pleg('so-grupos', this.subgrupos('otros'), 'Otros grupos') + this.pleg('so-cultura', this.seccionCultura(), 'Cultura y fiestas') + this.pleg('so-barrios', this.seccionBarrios(), 'Barrios') + this.pleg('so-seguridad', this.seccionSeguridad(), 'Seguridad') + this.pleg('so-conflicto', this.seccionConflicto(), 'Conflicto armado') + this.pleg('so-vecinos', this.seccionVecinos() + (exteriorActivo(this.S) ? `<button class="btn" data-mundo style="width:100%;margin:6px 0">🌎 ${C.EXT.textos.boton}</button>` : ''), 'Otras polis y el mundo') + this.pleg('so-mov', this.seccionMovimientos(), 'Movimientos sociales') + `<p class="small ${so.un > 0 ? 'neg' : ''}">${so.un > 0 ? `${so.un} personas sin empleo. Construye cultivos, mercados o talleres.` : 'Todos tienen empleo.'}</p>`;
    this.sociedad.querySelectorAll('[data-clase]').forEach(b => b.onclick = () => this.explicarClase(b.dataset.clase));
    this.sociedad.querySelectorAll('[data-grupo]').forEach(b => b.onclick = () => this.explicarGrupo(b.dataset.grupo));
    this.sociedad.querySelectorAll('[data-mov]').forEach(b => b.onclick = () => this.explicarMovimiento(b.dataset.mov));
    const seg = this.sociedad.querySelector('[data-seguridad]'); if (seg) seg.onclick = () => this.explicarSeguridad();
    const cf = this.sociedad.querySelector('[data-conflicto]'); if (cf) cf.onclick = () => this.explicarConflicto();
    this.sociedad.querySelectorAll('[data-vecino]').forEach(b => b.onclick = () => this.explicarVecino(b.dataset.vecino));
    this.sociedad.querySelectorAll('[data-barrio]').forEach(b => b.onclick = () => this.explicarBarrio(b.dataset.barrio));
    this.sociedad.querySelectorAll('[data-mundo]').forEach(b => b.onclick = () => this.tarjetaMundo());
    this.activarPlegables(this.sociedad);
    const fi = this.sociedad.querySelector('[data-fiesta]'); if (fi) fi.onclick = () => { if (organizarFiesta(this.S)) { this.toast(`🎉 ¡${fiestaDelPueblo(this.S).nombre}! La exigencia de sentido baja por dos años.`); this.mapa.cambio(true); this.render(); } };
    this.sociedad.querySelectorAll('[data-fig]').forEach(b => b.onclick = () => this.explicarFigura(b.dataset.fig));
  }
  // Fase 3: movimientos sociales con su fuerza (más fuerza = más presión); tocar uno explica por qué crece.
  seccionMovimientos() {
    const L = listaMovimientos(this.S);
    if (!L.length) return '';
    const filas = L.map(m => `<button class="sub" data-mov="${m.id}" aria-label="${m.nombre}: fuerza ${m.f}, ${m.estado}. Ver por qué">
      <span class="sn">${m.icono} ${m.corto} <small>${m.estado.toLowerCase()}</small></span><span class="track"><span class="fill" style="width:${m.f}%;background:${colorDe(100 - m.f)}"></span></span><b>${m.f}</b></button>`).join('');
    return `<div class="cls otros"><div><div class="lab"><span>Movimientos sociales</span></div><p class="small">Su fuerza crece si su gente está descontenta o si los ignoras; con 40 presentan demandas y con 70 se movilizan.</p><div class="subs">${filas}</div></div></div>`;
  }
  explicarMovimiento(id) {
    const S = this.S, m = listaMovimientos(S).find(x => x.id === id), K = C.MOV;
    if (!m) return;
    const base = m.base === 'ambiente' ? `el ambiente está en <b>${m.animo}</b>` : `el ánimo de ${C.GRUPOS.grupos[m.base].nombre.toLowerCase()} es <b>${m.animo}</b>`;
    const tend = m.cambio > 0 ? `<b class="neg">Crece ${signo(m.cambio)} por año</b>` : m.cambio < 0 ? `<b class="pos">Se calma ${signo(m.cambio)} por año</b>` : 'Se mantiene';
    const R = { escuchar: 'lo escuchaste', ignorar: 'lo ignoraste', reprimir: 'lo reprimiste' }, no = puedeDialogar(S, id);
    this.tarjeta(`<h3>${m.icono} ${m.nombre}: fuerza ${m.f}</h3><p class="small">Líder: ${m.lider}. Estado: ${m.estado}.</p><p>${m.causa}</p>
      <p>${tend}: ${base} (se calma por encima de ${K.crecimiento.animoTranquilo}).</p>
      ${m.resp ? `<p class="small">La última vez (año ${m.resp.anio}) ${R[m.resp.accion]}.</p>` : ''}
      <p class="small">Escucharlo baja su fuerza ${Math.round(Math.abs(K.crecimiento.escuchado * RM(S, 'movEscucha', 1)))}; ignorarlo la sube ${K.crecimiento.ignorado}; reprimirlo la baja ${Math.abs(K.crecimiento.reprimido)}, pero con legitimidad baja la sube ${K.crecimiento.radicaliza}. Movilizado, resta ${K.presionLegitimidad} de legitimidad cada año.</p>
      ${m.base !== 'ambiente' ? `<button class="btn" id="grupoB">Ver causas de su ánimo</button>` : ''}
      <div class="phil"><b>Lo que enseña</b><br>${K.leccion}</div>
      <p class="small">${no ? no : `Mesa de diálogo: cuesta ${costoDialogo(S, id)} de oro y calma al movimiento (−${Math.round(Math.abs(K.crecimiento.escuchado * RM(S, 'movEscucha', 1)))}). ${m.ops.escuchar.l}.`}</p>
      <div class="dos"><button class="btn" id="dialogoB" ${no ? 'disabled' : ''}>🤝 Abrir una mesa de diálogo</button><button class="main" id="okB">Cerrar</button></div>`);
    this.boton('okB', () => this.cerrarTarjeta());
    this.boton('dialogoB', () => {
      const fx = dialogar(S, id);
      if (!fx) return;
      this.cerrarTarjeta(); this.mapa.cambio(true);
      this.toast(`${m.icono} Diálogo abierto: ${m.ops.escuchar.l.toLowerCase()}. ${m.corto}: fuerza ${Math.round(fuerzaMov(S, id))}.`);
    });
    if (m.base !== 'ambiente') this.boton('grupoB', () => { this.cerrarTarjeta(); this.explicarGrupo(m.base); });
  }
  // Fase 3: subgrupos de una clase (o estudiantes e informales), con su ánimo; tocar uno explica sus causas.
  subgrupos(k) {
    const S = this.S;
    if (!gruposActivos(S)) return '';
    const P = panorama(S).find(c => c.clase === k);
    if (!P) return '';
    const filas = P.grupos.map(g => `<button class="sub" data-grupo="${g.id}" aria-label="${g.nombre}: ${g.n} personas, ánimo ${Math.round(g.valor)}. Ver por qué">
      <span class="sn">${g.icono} ${g.corto} <small>${g.n}</small></span><span class="track"><span class="fill" style="width:${g.valor}%;background:${colorDe(g.valor)}"></span></span><b>${Math.round(g.valor)}</b></button>`).join('');
    return k === 'otros' ? `<div class="cls otros"><div><div class="lab"><span>${P.nombre}</span></div><div class="subs">${filas}</div></div></div>` : `<div class="subs">${filas}</div>`;
  }
  explicarGrupo(g) {
    if (g === 'soldados') { this.explicarEjercito(); return; }
    const S = this.S, G = C.GRUPOS.grupos[g], A = animoGrupo(S, g), nombre = { c: 'los campesinos', a: 'los artesanos', e: 'la élite' }[A.clase];
    this.tarjeta(`<h3>${G.icono} ${G.nombre}: ánimo ${Math.round(A.valor)}</h3><p>${G.que}</p>
      <p>Parten del ánimo de ${nombre} (<b>${Math.round(A.base)}</b>) y le suman lo que los distingue:</p>
      ${A.propias.length ? this.filasCausas(A.propias) : '<p class="small">Este año nada los distingue de su clase.</p>'}
      <div class="phil"><b>Lo que enseña</b><br>${C.GRUPOS.leccion}</div>
      <div class="dos"><button class="btn" id="claseB">Ver causas de ${nombre}</button><button class="main" id="okB">Cerrar</button></div>`);
    this.boton('okB', () => this.cerrarTarjeta());
    this.boton('claseB', () => { this.cerrarTarjeta(); this.explicarClase(A.clase); });
  }
  // Claridad: recuadro de un indicador con lo que mide, hacia dónde va y cada causa con su número.
  filasCausas(partes) {
    const max = Math.max(1, ...partes.map(x => Math.abs(x[1])));
    return `<div class="causas">${partes.map(([t, v]) => `<div class="causa"><span>${t}</span><span class="barra"><i class="${v < 0 ? 'neg' : 'pos'}" style="width:${Math.round(Math.abs(v) / max * 100)}%"></i></span><b class="${v < 0 ? 'neg' : 'pos'}">${signo(v)}</b></div>`).join('')}</div>`;
  }
  tendencia(actual, meta) {
    const d = Math.round(meta - actual);
    return Math.abs(d) < 2 ? `Está estable cerca de su meta (${Math.round(meta)}).` : d > 0 ? `<b class="pos">Tiende a subir</b> hacia ${Math.round(meta)}.` : `<b class="neg">Tiende a bajar</b> hacia ${Math.round(meta)}.`;
  }
  explicar(k) {
    const S = this.S, I = C.IND[k], D = desgloseIndicador(S, k);
    let cuerpo;
    if (k === 'hap') {
      const so = society(S), n = [['c', 'Campesinos', so.camp, S.sat.c], ['a', 'Artesanos y desempleados', so.art + so.un, S.sat.a], ['e', 'Élite', so.el, S.sat.e]];
      cuerpo = `<p>Es el promedio del ánimo de cada clase según cuántas personas tiene. Toca una clase para ver sus causas:</p>
        ${n.map(([c, t, p, v]) => `<button class="opt" data-clase="${c}"><b>${t}</b> (${p} personas): ánimo ${Math.round(v)} <small>${this.tendencia(v, desgloseClase(S, c).meta).replace(/<[^>]+>/g, '')}</small></button>`).join('')}
        ${society(S).un ? `<p class="small neg">Hay ${society(S).un} personas sin empleo: restan ${Math.round(society(S).un / Math.max(1, S.pop) * 15)} puntos.</p>` : ''}`;
    } else if (k === 'corr') {
      cuerpo = D.partes.length ? `<p>${D.cambio > 0 ? `<b class="neg">Sube ${signo(D.cambio)} por año</b>` : D.cambio < 0 ? `<b class="pos">Baja ${signo(D.cambio)} por año</b>` : 'Este año sus causas se compensan'} por estas causas:</p>${this.filasCausas(D.partes)}<p class="small">${D.extra}</p>` : `<p>Este año no cambia por sí solo. ${D.extra}</p>`;
    } else {
      cuerpo = `<p>${this.tendencia(D.actual, D.meta)} ${C.IND.tendencia.replace('{meta}', Math.round(D.meta))} Así se calcula la meta:</p>${this.filasCausas(D.partes)}${D.extra ? `<p class="small">${D.extra}</p>` : ''}`;
    }
    this.tarjeta(`<h3>${I.icono} ${I.nombre}: ${Math.round(D.actual)}</h3><p>${I.que}</p>${cuerpo}
      <p class="small"><b>Lo sube:</b> ${I.sube}<br><b>Lo baja:</b> ${I.baja}<br><b>Por qué importa:</b> ${I.importa}</p>
      <div class="dos">${k === 'corr' ? '<button class="btn" id="regB">Ver el régimen</button>' : ''}<button class="main" id="okB">Cerrar</button></div>`);
    this.card.querySelectorAll('[data-clase]').forEach(b => b.onclick = () => { this.cerrarTarjeta(); this.explicarClase(b.dataset.clase); });
    this.boton('okB', () => this.cerrarTarjeta());
    this.boton('regB', () => { this.cerrarTarjeta(); this.infoRegimen(); });
  }
  explicarClase(k) {
    const S = this.S, D = desgloseClase(S, k), nombre = { c: 'Campesinos', a: 'Artesanos', e: 'Élite' }[k];
    this.tarjeta(`<h3>${nombre}: ánimo ${Math.round(D.actual)}</h3><p>${C.IND.clases[k]}</p>
      <p>${this.tendencia(D.actual, D.meta)} ${C.IND.tendencia.replace('{meta}', Math.round(D.meta))} Así se calcula:</p>${this.filasCausas(D.partes)}
      <p class="small">Los números en rojo son lo que más le molesta a esta clase: ahí está lo que puedes mejorar.</p>
      <button class="main" id="okB">Cerrar</button>`);
    this.boton('okB', () => this.cerrarTarjeta());
  }

  // Fase 12: una ley en el árbol de civismo: pros y contras, estado, y desbloquear o promulgar.
  tarjetaLey(l) {
    const S = this.S, on = hasLaw(S, l.id), T = C.CIV.textos, pc = prosContras(l.id), ab = abierta(S, l.id);
    const falta = l.nueva && !ab ? faltaRequisito(S, l) : '', puede = l.nueva && !ab ? puedeAbrir(S, l.id) : null, bl = ab ? lawBlock(S, l) : '';
    const boton = l.nueva && !ab
      ? `<button class="btn" data-abrir="${l.id}" ${puede || S.over ? 'disabled' : ''}>🔓 ${T.desbloquear.replace('{costo}', l.civismo)}</button>`
      : `<button class="btn" data-ley="${l.id}" ${(bl && !on) || S.over ? 'disabled' : ''}>${on ? 'Derogar' : 'Promulgar'}</button>`;
    return `<div class="law ${on ? 'on' : ''}${l.nueva && !ab ? ' cerrada' : ''}"><b>${l.nueva ? (ab ? l.icono : '🔒') + ' ' : ''}${l.n}</b>
      <small class="pos">✓ ${pc.pro || l.d}</small>${pc.contra ? `<small class="neg">✗ ${pc.contra}</small>` : ''}
      ${on ? `<small>Vigente desde el año ${S.laws[l.id]}.</small>` : ''}${falta ? `<small class="neg">${falta}</small>` : puede && !falta ? `<small class="neg">${puede}</small>` : ''}${bl && !on ? `<small class="neg">${bl}</small>` : ''}
      ${!on && l.id === 'censura' ? this.avisoActa(['censura']) : ''}${l.leccion && ab ? `<small><i>${l.leccion}</i></small>` : ''}${boton}</div>`;
  }
  renderLeyes() {
    const S = this.S, n = Object.keys(S.laws || {}).length;
    if (civismoActivo(S)) return this.renderArbol(n);
    this.leyes.innerHTML = `<p class="small">Leyes vigentes: ${n} de ${lawSlots(S)}. Promulgar cuesta ${lawCostNow(S)} de oro${S.reg === 'monarquia' || S.reg === 'tirania' ? '' : ' y 2 de legitimidad'}. Cada etapa abre un cupo más.</p>` +
      C.LAWS.map(l => {
        const on = hasLaw(S, l.id), bl = lawBlock(S, l);
        return `<div class="law ${on ? 'on' : ''}"><b>${l.n}</b><small>${l.d}</small>${on ? `<small>Vigente desde el año ${S.laws[l.id]}.</small>` : ''}${bl && !on ? `<small class="neg">${bl}</small>` : ''}${!on && l.id === 'censura' ? this.avisoActa(['censura']) : ''}<button class="btn" data-ley="${l.id}" ${(bl && !on) || S.over ? 'disabled' : ''}>${on ? 'Derogar' : 'Promulgar'}</button></div>`;
      }).join('') + this.seccionTecnologia();
    this.botonesLeyes();
  }
  renderArbol(n) {
    const S = this.S, T = C.CIV.textos, E = estadoCivismo(S), L = todasLasLeyes(S);
    const ramas = Object.entries(C.CIV.ramas).map(([k, R]) => { const LR = L.filter(l => ramaDe(l.id) === k), vig = LR.filter(l => hasLaw(S, l.id)).length; return this.fija('ley-' + k, `${LR.map(l => this.tarjetaLey(l)).join('')}${k === 'economia' ? `<p class="small"><i>${T.libreComercio}</i></p>` : ''}`, `${R.icono} ${R.nombre}`, `${vig} vigente${vig === 1 ? '' : 's'} de ${LR.length}`); }).join('');
    // El árbol de civismo queda siempre abierto (pedido de Juan, 6 de octubre).
    this.leyes.innerHTML = this.fija('ley-ayuda', `<p class="small">${T.ayuda}</p><p class="small"><i>${C.CIV.leccion}</i></p>`, `🌳 ${T.titulo}`) + `<p class="civ-puntos"><b>${T.puntos.replace('{p}', Math.floor(E.p)).replace('{anual}', civismoAnual(S).toLocaleString('es-CO'))}</b><br><small>Leyes vigentes: ${n} de ${lawSlots(S)}. Promulgar cuesta ${lawCostNow(S)} de oro${S.reg === 'monarquia' || S.reg === 'tirania' ? '' : ' y 2 de legitimidad'}. Cada etapa abre un cupo más.</small></p>${ramas}` + this.pleg('ley-tec', this.seccionTecnologia());
    this.activarPlegables(this.leyes);
    this.leyes.querySelectorAll('[data-abrir]').forEach(bt => bt.onclick = () => {
      const id = bt.dataset.abrir, r = puedeAbrir(S, id);
      if (r) { this.toast(r); return; }
      abrirLey(S, id); this.toast(T.abierta.replace('{ley}', todasLasLeyes(S).find(l => l.id === id).n)); this.render();
    });
    this.botonesLeyes();
  }
  botonesLeyes() {
    const S = this.S;
    this.leyes.querySelectorAll('[data-ley]').forEach(bt => bt.onclick = () => {
      const r = toggleLaw(S, bt.dataset.ley);
      if (r !== true) this.toast(r);
      this.mapa.cambio(); this.render();
    });
    const tp = this.leyes.querySelector('[data-tec-pend]'); if (tp) tp.onclick = () => this.tarjetaInvento(S.tec.pendiente);
    this.leyes.querySelectorAll('[data-tec]').forEach(bt => bt.onclick = () => {
      const [id, modo] = bt.dataset.tec.split(':');
      if (decidirInvento(S, id, modo)) { this.toast(`${C.TEC.inventos[id].nombre}: ${modo === 'rechazado' ? 'rechazada' : C.TEC.inventos[id][modo].texto.toLowerCase()}.`); this.mapa.cambio(true); this.render(); }
    });
  }
  // Fase 6: tecnología por épocas (saber, próximo invento e inventos adoptados).
  seccionTecnologia() {
    const S = this.S;
    if (!tecActiva(S) || S.stage < 1) return '';
    const T = estadoTec(S), K = C.TEC, p = proximoInvento(S), anual = saberAnual(S);
    const prox = p ? `<p class="small">Próximo invento: <b>${p[1].icono} ${p[1].nombre}</b> con ${p[1].saber} de saber${p[1].etapa > S.stage ? ` (desde ${C.STAGES[p[1].etapa].n})` : ''}${anioInvento(S, p[0]) > S.year ? `, no antes del año ${anioInvento(S, p[0])}` : ''}. Tienes ${Math.round(T.saber)} y sumas ${anual} por año (escuelas, bibliotecas y universidades).</p><div class="track"><div class="fill" style="width:${Math.min(100, T.saber / p[1].saber * 100)}%;background:var(--accent)"></div></div>` : '<p class="small">Ya llegaron todos los inventos.</p>';
    const lista = Object.entries(T.adoptados).map(([id, modo]) => { const I = K.inventos[id], otro = modo === 'libre' ? 'regulada' : modo === 'regulada' ? 'libre' : 'libre';
      return `<div class="law ${modo !== 'rechazado' ? 'on' : ''}"><b>${I.icono} ${I.nombre}</b><small>${modo === 'rechazado' ? 'No la adoptaste.' : `${I[modo].texto}. ${I[modo].explica}`}</small>
        <button class="btn" data-tec="${id}:${otro}">${modo === 'rechazado' ? 'Adoptarla libre' : modo === 'libre' ? `Regularla (${Math.round(I.regulada.costo * S.price)} de oro por año)` : 'Quitar la regulación'}</button></div>`; }).join('');
    return `<h3>Tecnología</h3>${prox}${T.pendiente ? `<p class="small neg">Hay un invento esperando tu decisión: ${K.inventos[T.pendiente].nombre}.</p><button class="btn" data-tec-pend>Decidir ahora</button>` : ''}${lista}
      ${costoTecAnual(S) ? `<p class="small">La regulación cuesta ${costoTecAnual(S)} de oro por año.</p>` : ''}<p class="small">${K.leccion}</p>`;
  }
  // Fase 6: llega un invento: adoptarlo libre, regulado o rechazarlo.
  inventoAnio(alTerminar0) {
    const S = this.S, e = S.tecEv, alTerminar = () => this.megaAnio(alTerminar0);
    if (!e || !e.nuevo || !tecActiva(S)) { alTerminar(); return; }
    e.nuevo = false;
    this.tarjetaInvento(e.id, alTerminar);
  }
  // Fase 6: megaproyectos.
  seccionMega() {
    const S = this.S;
    if (!megaActivos(S)) return '';
    const M = C.MEGA, E = { consulta: 'consulta en curso', aprobado: 'aprobado en consulta', rechazado: 'rechazado en consulta', obra: 'en obra', listo: 'terminado', cancelado: 'cancelado' };
    return `<h3>Megaproyectos</h3><p class="small">Obras enormes de varios años. Antes de empezar, la consulta previa con las comunidades.</p>
      ${Object.entries(M.proyectos).map(([id, P]) => { const e = estadoMega(S, id), ev = evaluarMega(S, id);
        return `<button class="opt" data-mega="${id}"><b>${P.icono} ${P.nombre}</b><small>${e ? E[e.estado] + (e.estado === 'obra' ? ` (${e.pagado} de ${P.anios} años${e.det ? ', detenida' : ''})` : '') : `VPN ${ev.vpn} · TIR ${(ev.tir * 100).toFixed(1)}%`}</small></button>`; }).join('')}`;
  }
  explicarMega(id) {
    const S = this.S, M = C.MEGA, P = M.proyectos[id], e = estadoMega(S, id), ev = evaluarMega(S, id), pct = v => (v * 100).toFixed(1) + '%';
    const noC = puedeConsultar(S, id), noI = puedeIniciar(S, id), est = e ? e.estado : null;
    const botones = !est ? `<button class="opt" data-mg="consultar" ${noC ? 'disabled' : ''}><b>Hacer la consulta previa</b><small>Cuesta ${costoConsulta(S)} de oro y dura un año. Probabilidad de que la aprueben hoy: ${Math.round(probConsulta(S, id) * 100)}% (depende del cabildo pijao, del ambiente y del ánimo de los campesinos).${noC ? ' ' + noC : ''}</small></button>
        <button class="opt" data-mg="iniciar" ${noI ? 'disabled' : ''}><b>Empezar sin consulta</b><small>Más rápido, pero viola el derecho de las comunidades: conflicto +${M.sinConsulta.conflicto}, legitimidad −${Math.abs(M.sinConsulta.legitimidad)}, el cabildo y los movimientos se levantan.${noI ? ' ' + noI : ''}</small></button>`
      : est === 'aprobado' ? `<button class="opt" data-mg="iniciar" ${noI ? 'disabled' : ''}><b>Empezar la obra</b><small>Con el respaldo de las comunidades. Primera cuota: ${ev.cuota} de oro.${noI ? ' ' + noI : ''}</small></button>`
      : est === 'rechazado' ? `<button class="opt" data-mg="cancelar"><b>Respetar la decisión y cancelar</b><small>Legitimidad +2; el pueblo lo recordará.</small></button><button class="opt" data-mg="iniciar" ${noI ? 'disabled' : ''}><b>Hacerlo contra su voluntad</b><small>Igual que empezar sin consulta, y peor recordado.${noI ? ' ' + noI : ''}</small></button>`
      : `<p class="small">Estado: ${{ consulta: 'la consulta está en curso; el resultado llega al cerrar el año', obra: `en obra, ${e.pagado} de ${P.anios} años pagados${e.det ? ' (detenida por falta de oro)' : ''}`, listo: `terminado en el año ${e.listo}: deja ${ev.beneficio} de oro por año`, cancelado: 'cancelado por respeto a la consulta' }[est]}.</p>`;
    this.tarjeta(`<div class="big">${P.icono}</div><h3>${P.nombre}</h3><p>${P.texto}</p><p class="small"><b>Impactos:</b> ${P.impactos}</p>
      <div class="ledger"><table class="budget">
        <tr><td>Inversión</td><td>${ev.inversion}</td></tr><tr><td>Años de obra (cuota por año)</td><td>${ev.anios} (${ev.cuota})</td></tr>
        <tr><td>Beneficio por año, ya terminado</td><td>+${ev.beneficio}</td></tr><tr><td>Tasa de interés de hoy</td><td>${pct(ev.tasa)}</td></tr>
        <tr class="tot"><td>VPN a ${ev.horizonte} años</td><td class="${ev.vpn < 0 ? 'neg' : ''}">${ev.vpn}</td></tr><tr><td>TIR</td><td class="${ev.tir < ev.tasa ? 'neg' : ''}">${pct(ev.tir)}</td></tr><tr><td>Se recupera en</td><td>${ev.recupera} años</td></tr>
      </table></div>
      <p class="small">${ev.vpn >= 0 ? `Con la tasa de hoy el proyecto crea valor: la TIR (${pct(ev.tir)}) supera el interés (${pct(ev.tasa)}).` : `Con la tasa de hoy el proyecto destruye valor: el interés (${pct(ev.tasa)}) supera la TIR (${pct(ev.tir)}).`}</p>
      ${botones}
      <div class="phil"><b>Lo que enseña</b><br>${M.leccionFinanzas}</div><div class="phil"><b>Consulta previa</b><br>${M.leccionConsulta}</div><button class="main" id="okB">Cerrar</button>`);
    this.boton('okB', () => this.cerrarTarjeta());
    this.card.querySelectorAll('[data-mg]').forEach(b => b.onclick = () => {
      const a = b.dataset.mg, ok = a === 'consultar' ? consultar(S, id) : a === 'cancelar' ? cancelarMega(S, id) : iniciarMega(S, id);
      if (!ok) { this.toast('No se pudo: revisa el oro o el estado del proyecto.'); return; }
      this.toast({ consultar: 'Consulta previa abierta: el resultado llega al cerrar el año.', cancelar: 'Proyecto cancelado: respetaste la consulta.', iniciar: `Empieza la obra de ${P.nombre.toLowerCase()}.` }[a]);
      this.mapa.cambio(true); this.render(); this.explicarMega(id);
    });
  }
  megaAnio(alTerminar0) {
    const S = this.S, L = S.megaEv, alTerminar = () => this.rioAnio(alTerminar0);
    if (!L || !L.length || !megaActivos(S)) { alTerminar(); return; }
    S.megaEv = null;
    const M = C.MEGA, txt = { consultaSi: M.textos.consultaSi, consultaNo: M.textos.consultaNo, termina: '' };
    this.tarjeta(`<div class="big">🏗️</div><h3>Megaproyectos</h3>${L.map(e => { const P = M.proyectos[e.id]; return `<p><b>${P.icono} ${P.nombre}:</b> ${e.tipo === 'termina' ? `¡terminado! Desde ahora deja ${evaluarMega(S, e.id).beneficio} de oro por año. ${P.impactos}` : txt[e.tipo]}</p>`; }).join('')}
      <p class="small">Revisa los proyectos en Hacienda → Megaproyectos.</p><div class="phil"><b>Consulta previa</b><br>${M.leccionConsulta}</div><button class="main" id="okB">Continuar</button>`);
    this.alCerrar = alTerminar; this.boton('okB', () => this.cerrarTarjeta());
  }
  // Fase 6: el río cambió de curso.
  rioAnio(alTerminar0) {
    const S = this.S, e = S.rioEv, alTerminar = () => this.eraAnio(alTerminar0);
    if (!e || !e.nuevo || !rioActivo(S)) { alTerminar(); return; }
    e.nuevo = false;
    const R = C.RIO, T = R.textos;
    if (e.foco !== undefined) this.mapa.enfocarCasilla(e.foco);
    this.tarjeta(`<div class="big">🌊</div><h3>${T.titulo}</h3><p>${e.causa === 'lahar' ? T.lahar : T.nina}</p>
      <p>${e.perdidas.length ? `${T.conPerdidas} <b>${listaPerdidas(e.perdidas)}</b>.` : T.sinPerdidas} ${T.humedal}</p>
      <p class="small">${T.prevenir}</p><div class="phil"><b>Lo que enseña</b><br>${R.leccion}</div><button class="main" id="okB">Continuar</button>`);
    this.alCerrar = alTerminar; this.boton('okB', () => this.cerrarTarjeta());
  }
  // Fase 7: empieza una época de la historia.
  eraAnio(alTerminar0) {
    const S = this.S, e = S.eraEv, alTerminar = () => this.rasgoAnio(() => this.cicloAnio(alTerminar0)); // fase 12: el rasgo de la época
    if (!e || !e.nuevo || !historiaActiva(S)) { alTerminar(); return; }
    e.nuevo = false;
    const E = datosEpoca(e.id), sig = proximaEpoca(S);
    this.tarjeta(`<div class="big">${E.icono}</div><h3>Nueva época: ${E.nombre}</h3><p>${E.texto}</p>
      <p class="small">Esta época trae sus propios dilemas${sig ? ` hasta el año ${sig.desde}` : ''}.</p>
      <div class="phil"><b>Lo que enseña</b><br>${E.leccion}</div><button class="main" id="okB">Continuar</button>`);
    this.alCerrar = alTerminar; this.boton('okB', () => this.cerrarTarjeta());
  }
  // Fase 12: al empezar cada época se elige el rasgo cultural del pueblo (no se puede saltar).
  rasgoAnio(alTerminar) {
    const S = this.S, ep = rasgoPendiente(S);
    if (!ep || !S.rasgoEv || !S.rasgoEv.nuevo) { alTerminar(); return; }
    S.rasgoEv.nuevo = false;
    this.tarjetaRasgo(ep, alTerminar);
  }
  tarjetaRasgo(ep, alTerminar) {
    const S = this.S, T = C.RASGOS.textos, E = datosEpoca(ep);
    this.tarjeta(`<div class="big">${E.icono}</div><h3>${T.pregunta.replace('{epoca}', E.nombre.toLowerCase())}</h3><p class="small">${T.ayuda}</p>
      ${opcionesRasgo(ep).map(r => `<button class="opt" data-rasgo="${r.id}"><b>${r.icono} ${r.nombre}</b><small class="pos">✓ ${r.pro}</small><small class="neg">✗ ${r.contra}</small><small><i>${r.leccion}</i></small></button>`).join('')}
      ${this.estandarte()}<div class="phil"><b>Lo que enseña</b><br>${C.RASGOS.leccion}</div>`, false);
    this.card.querySelectorAll('[data-rasgo]').forEach(b => b.onclick = () => {
      if (!elegirRasgo(S, b.dataset.rasgo)) return;
      this.toast(T.elegido.replace('{rasgo}', rasgosElegidos(S).slice(-1)[0].nombre.toLowerCase()));
      this.mapa.cambio(); this.render();
      this.alCerrar = alTerminar || null; this.cerrarTarjeta();
    });
  }
  // El estandarte: los rasgos elegidos, uno por época.
  estandarte() {
    const S = this.S, L = rasgosElegidos(S), T = C.RASGOS.textos;
    if (!L.length) return '';
    return `<div class="estandarte" aria-label="${T.estandarte}">${L.map(r => `<span title="${r.nombre}"><i>${r.icono}</i><small>${r.nombre}</small></span>`).join('')}</div>`;
  }
  seccionIdentidad() {
    const S = this.S;
    if (!rasgosActivos(S)) return '';
    const T = C.RASGOS.textos, L = rasgosElegidos(S);
    return `<h3>🚩 ${T.titulo}</h3>${L.length ? this.estandarte() + `<ul class="conds">${L.map(r => `<li><b>${r.icono} ${r.nombre}</b> (${datosEpoca(r.epoca).nombre}): ${r.pro} ${r.contra}</li>`).join('')}</ul>` : `<p class="small">${T.vacio}</p>`}`;
  }
  // Fase 7: ciclos de la economía (bonanza, crisis del café, roya, pensiones). Las decisiones no se pueden saltar.
  cicloAnio(alTerminar) {
    const S = this.S, L = S.cicloEv;
    if (!L || !L.length || !ciclosActivos(S)) { S.cicloEv = null; this.preciosAnio(() => this.biomasAnio(() => this.amenazaAnio(alTerminar))); return; } // fase 10: precios de los cultivos y el clima
    const e = L.shift(), K = C.CICLOS, sigue = () => this.cicloAnio(alTerminar);
    const fin = (msg) => { if (msg) this.toast(msg); this.mapa.cambio(); this.render(); this.alCerrar = sigue; this.cerrarTarjeta(); };
    if (e.tipo === 'bonanza') {
      const b = bonoBonanza(S);
      this.tarjeta(`<div class="big">📈</div><h3>Bonanza cafetera</h3><p>${K.cafe.textos.bonanza}</p>
        <button class="opt" data-c="ahorrar"><b>Ahorrar en un fondo de estabilización</b><small>Guardas ${Math.round(b * K.cafe.bonanza.interes)} de oro (con intereses) para sostener a los caficultores en la próxima crisis.</small></button>
        <button class="opt" data-c="gastar"><b>Gastar la bonanza ya</b><small>Entran ${b} de oro al tesoro hoy.</small></button>
        <div class="phil"><b>Lo que enseña</b><br>${K.cafe.leccion}</div>`, false);
      this.card.querySelectorAll('[data-c]').forEach(x => x.onclick = () => { decidirBonanza(S, x.dataset.c); fin(x.dataset.c === 'ahorrar' ? 'Bonanza ahorrada en el fondo del café.' : 'La bonanza entra al tesoro.'); });
    } else if (e.tipo === 'crisis') {
      const d = S.ciclo.cafe && S.ciclo.cafe.decidido === 'fondo';
      this.tarjeta(`<div class="big">📉</div><h3>Crisis del café</h3><p>${K.cafe.textos.crisis}</p>${d ? `<p><b>${K.cafe.textos.conFondo}</b></p><button class="main" id="okB">Continuar</button>` : `
        <button class="opt" data-c="subsidiar"><b>Subsidiar a los caficultores</b><small>Cuesta ${costoSubsidio(S)} de oro.</small></button>
        <button class="opt" data-c="no"><b>No subsidiar</b><small>Los campesinos lo sentirán y la legitimidad baja.</small></button>`}
        <div class="phil"><b>Lo que enseña</b><br>${K.cafe.leccion}</div>`, d);
      if (d) this.boton('okB', () => fin()); else this.card.querySelectorAll('[data-c]').forEach(x => x.onclick = () => { decidirCrisis(S, x.dataset.c); fin(x.dataset.c === 'subsidiar' ? 'Subsidio a los caficultores.' : 'Sin subsidio: el campo lo resiente.'); });
    } else if (e.tipo === 'roya' || e.tipo === 'royaResiste') {
      this.tarjeta(`<div class="big">🍂</div><h3>La roya del café</h3><p>${e.tipo === 'roya' ? K.roya.textos.llega : K.roya.textos.resiste}</p>${e.tipo === 'roya' ? '<p class="small">Para la próxima: renueva los cafetales en Hacienda → Ciclos de la economía.</p>' : ''}
        <div class="phil"><b>Lo que enseña</b><br>${K.roya.leccion}</div><button class="main" id="okB">Continuar</button>`);
      this.boton('okB', () => fin());
    } else if (e.tipo === 'pensiones') {
      const P = K.pensiones;
      this.tarjeta(`<div class="big">👵</div><h3>Las pensiones</h3><p>${P.textos.llega}</p>
        ${Object.entries(P.sistemas).map(([k, x]) => `<button class="opt" data-c="${k}"><b>${x.icono} ${x.nombre}</b><small>${x.texto}</small></button>`).join('')}
        <div class="phil"><b>Lo que enseña</b><br>${P.leccion}</div>`, false);
      this.card.querySelectorAll('[data-c]').forEach(x => x.onclick = () => { elegirPension(S, x.dataset.c); fin(`Pensiones: ${P.sistemas[x.dataset.c].nombre.toLowerCase()}.`); });
    } else sigue();
  }
  // Fase 7: epidemias, avenidas torrenciales y sequías largas.
  // Fase 10: el clima del territorio (pisos que suben, glaciar, páramo y agua).
  seccionClimaTerritorio() {
    const S = this.S;
    if (!biomasActivos(S) || !(S.pisos && S.pisos.empezo)) return '';
    const B = C.BIOMAS, g = glaciar(S), p = paramoQueda(S), a = factorAguaClima(S), metros = Math.round(subidaPisos(S) * 450 / 10) * 10;
    return `<h3>Clima del territorio</h3><p class="small">Los pisos térmicos han subido unos <b>${metros} metros</b> desde el año ${S.pisos.empezo}. Queda el <b>${Math.round(g * 100)}%</b> del glaciar y el <b>${Math.round(p * 100)}%</b> del páramo. ${B.textos.agua}: <b class="${a < 1 ? 'neg' : 'pos'}">${a >= 1 ? '+' : '−'}${Math.round(Math.abs(a - 1) * 100)}%</b>. Sube más rápido si el ambiente está mal (más emisiones).</p><p class="small"><i>${B.leccion}</i></p>`;
  }
  biomasAnio(alTerminar) {
    const S = this.S, L = S.biomasEv;
    S.biomasEv = null;
    if (!L || !L.length || !biomasActivos(S)) { alTerminar(); return; }
    const T = C.BIOMAS.textos, ico = { empieza: '🌡️', glaciarMitad: '🏔️', glaciarSeVa: '🏔️', paramo: '🌿' };
    this.tarjeta(`<div class="big">${ico[L[0]]}</div><h3>${L[0] === 'empieza' ? 'El clima cambia' : L[0] === 'paramo' ? 'El páramo se encoge' : 'El glaciar del Nevado'}</h3>${L.map(k => `<p>${T[k]}</p>`).join('')}<p class="small">Míralo en <b>Hacienda → Clima del territorio</b>. Revisa tus fincas: el piso térmico de algunas casillas ya cambió.</p><div class="phil"><b>Lo que enseña</b><br>${C.BIOMAS.leccion}</div><button class="main" id="okB">Continuar</button>`);
    this.alCerrar = alTerminar; this.boton('okB', () => this.cerrarTarjeta());
  }
  // Fase 10: bonanzas y crisis de los cultivos que siembra el jugador, y el auge y desplome del algodón.
  preciosAnio(alTerminar) {
    const S = this.S, L = S.preciosEv;
    S.preciosEv = null;
    if (!L || !L.length || !fincasActivas(S)) { alTerminar(); return; }
    const T = C.CULTIVOS.textos, K = C.CULTIVOS.canasta.textos;
    const lineas = L.map(e => { const D = datosCultivo(e.cv), p = S.precios[e.cv].p.toLocaleString('es-CO', { maximumFractionDigits: 2 }); return `<p>${D.icono} ${(T[e.tipo] || '').replace('{cultivo}', D.nombre.toLowerCase()).replace('{precio}', p)}</p>`; }).join('');
    const sube = L.some(e => e.tipo === 'bonanza' || e.tipo === 'auge');
    this.tarjeta(`<div class="big">${sube ? '📈' : '📉'}</div><h3>El mercado del campo</h3>${lineas}<p class="small">Mira tu canasta en <b>Hacienda → ${K.titulo}</b>. En cada finca puedes cambiar de cultivo, pero la siembra cuesta y algunos tardan años en producir.</p><div class="phil"><b>Lo que enseña</b><br>${K.leccion}</div><button class="main" id="okB">Continuar</button>`);
    this.alCerrar = alTerminar; this.boton('okB', () => this.cerrarTarjeta());
  }
  amenazaAnio(alTerminar) {
    const S = this.S, e = S.amenEv, K = C.AMENAZAS;
    if (e && e.tipo === 'avenida' && amenazasActivas(S) && this.escena('avenida', e, () => this.amenazaAnio(alTerminar))) return;
    S.amenEv = null;
    if (!e || !amenazasActivas(S)) { alTerminar(); return; }
    let html;
    if (e.tipo === 'epidemia') {
      const t = K.epidemia.tipos.find(x => x.id === e.id);
      html = `<div class="big">${t.icono}</div><h3>${t.nombre}</h3><p>${t.texto}</p>
        <div class="ledger"><table class="budget"><tr><td>Vidas perdidas</td><td class="neg">${e.perdidos}</td></tr><tr><td>Costo de la emergencia</td><td>${e.costo}</td></tr><tr><td>Pagado con el fondo</td><td>${e.fondo}</td></tr></table></div>
        <p class="small">${e.vigilancia ? 'La vigilancia epidemiológica detectó el brote a tiempo y salvó vidas.' : `${K.epidemia.vigilancia.nombre} (Hacienda → Riesgo de desastres), más hospitales y acueductos reducen las pérdidas.`}</p>
        <div class="phil"><b>Lo que enseña</b><br>${t.leccion}</div>`;
    } else if (e.tipo === 'avenida') {
      this.mapa.temblor && this.mapa.temblor();
      html = `<div class="big">${K.avenida.icono}</div><h3>${K.avenida.nombre}</h3><p>${K.avenida.texto}</p>
        <div class="ledger"><table class="budget"><tr><td>Obras dañadas</td><td>${e.danadas}</td></tr><tr><td>Vidas perdidas</td><td class="neg">${e.perdidos}</td></tr><tr><td>Laderas taladas o erosionadas</td><td>${e.peladas}%</td></tr></table></div>
        <p class="small">Repara las obras dañadas tocándolas. Deja que el bosque vuelva a las laderas.</p><div class="phil"><b>Lo que enseña</b><br>${K.avenida.leccion}</div>`;
    } else html = `<div class="big">☀️</div><h3>La sequía se alarga</h3><p>${K.sequiaLarga.texto} Habrá otro año de El Niño.</p><p class="small">Llena el fondo de emergencias y revisa el agua de los acueductos.</p><div class="phil"><b>Lo que enseña</b><br>${K.sequiaLarga.leccion}</div>`;
    this.tarjeta(html + '<button class="main" id="okB">Continuar</button>');
    this.alCerrar = alTerminar; this.boton('okB', () => this.cerrarTarjeta());
  }
  tarjetaInvento(id, alTerminar) {
    const S = this.S, I = C.TEC.inventos[id];
    this.tarjeta(`<div class="big">${I.icono}</div><h3>${I.nombre}</h3><p>${I.texto}</p>
      <button class="opt" data-inv="libre"><b>${I.libre.texto}</b><small>${I.libre.explica}</small></button>
      <button class="opt" data-inv="regulada"><b>${I.regulada.texto}</b><small>${I.regulada.explica} Cuesta ${Math.round(I.regulada.costo * S.price)} de oro por año.</small></button>
      <button class="opt" data-inv="rechazado"><b>No adoptarla por ahora</b><small>Nada cambia. Puedes adoptarla después desde Leyes.</small></button>
      <div class="phil"><b>Lo que enseña</b><br>${C.TEC.leccion}</div>`, false);
    this.card.querySelectorAll('[data-inv]').forEach(bt => bt.onclick = () => {
      decidirInvento(S, id, bt.dataset.inv);
      this.toast(`${I.nombre}: ${bt.dataset.inv === 'rechazado' ? 'por ahora no' : I[bt.dataset.inv].texto.toLowerCase()}.`);
      this.mapa.cambio(true); this.render();
      this.alCerrar = alTerminar || null; this.cerrarTarjeta();
    });
  }

  renderCronica() {
    const S = this.S, h = S.hist, G = GRAFICAS[this.grafica];
    const tabs = Object.entries(GRAFICAS).map(([k, v]) => `<button class="tab${k === this.grafica ? ' on' : ''}" data-g="${k}">${v.n}</button>`).join('');
    const ep = historiaActiva(S) ? datosEpoca(epocaHistorica(S)) : null, sig = ep && proximaEpoca(S);
    const epoca = ep ? `<h3>${ep.icono} Época: ${ep.nombre}</h3><p class="small">${ep.texto}${sig ? ` Hasta el año ${sig.desde}; luego, ${sig.nombre.toLowerCase()}.` : ''}</p>` : '';
    const T = S.terr && C.TERR && C.TERR.territorios[S.terr], terr = T ? `<h3>${T.icono} ${T.nombre}</h3><p class="small">${T.texto} ${C.TERR.leccion}</p>` : ''; // fase 14
    // Orden pedido por Juan (6 de octubre): identidad, gráficas, álbum y legado siempre abiertos; territorio, época
    // y camino de avances juntos en un solo desplegable; lo que ha pasado, al final y desplegable.
    const contexto = terr + epoca + this.seccionAvances();
    this.cronica.innerHTML = this.fija('c-identidad', this.seccionIdentidad()) + this.fija('c-graficas', `<div class="tabs">${tabs}</div>${grafica(h, G.s, G.o)}`, '📈 Gráficas', G.n) + this.fija('c-album', this.seccionAlbum()) + this.fija('c-legado', this.seccionLegado()) +
      this.pleg('c-contexto', contexto, `🗺️ ${T ? 'Territorio, época' : 'Época'} y avances`, ep ? `${ep.icono} ${ep.nombre}${sig ? `, hasta el año ${sig.desde}` : ''}` : '') + this.pleg('c-log', `<div class="log">${S.log.slice(0, 40).map(l => `<p><b>Año ${l.y}.</b> ${l.t}</p>`).join('')}</div>`, '📜 Lo que ha pasado', S.log[0] ? `año ${S.log[0].y}` : '');
    this.activarPlegables(this.cronica);
    this.cronica.querySelectorAll('[data-carta]').forEach(bt => bt.onclick = () => { const r = estadoFamilias(this.S).cartas.find(x => x.n === +bt.dataset.carta); if (r) this.tarjetaCarta(r, null, true); });
    this.cronica.querySelectorAll('[data-objeto]').forEach(bt => bt.onclick = () => { const O = datosObjeto(bt.dataset.objeto); this.tarjeta(`<div class="big">${O.icono}</div><h3>${O.nombre}</h3><p>${O.texto}</p><button class="main" id="okB">Cerrar</button>`); this.boton('okB', () => this.cerrarTarjeta()); });
    this.cronica.querySelectorAll('[data-ed]').forEach(bt => bt.onclick = () => { const e = estadoAvances(this.S).ediciones.find(x => x.n === +bt.dataset.ed); if (e) this.periodico(e, null, true); });
    this.cronica.querySelectorAll('[data-g]').forEach(bt => bt.onclick = () => { this.grafica = bt.dataset.g; this.renderCronica(); });
  }

  // ---------- Fichas ----------
  abrirFicha(i) {
    const S = this.S, T = this.mapa.T, t = T.tiles[i], x = S.map[i];
    const hijos = [];
    // Fase 4: huella de una decisión.
    if (!x.b && x.mk && x.mk.t === 'asentamiento' && barriosActivos(S)) { this.cerrarFicha(); this.tarjetaAsentamiento(i); return; }
    if (!x.b && x.mk && C.MARCAS) {
      const M = C.MARCAS.tipos[x.mk.t];
      const G = 'grid-column:1/-1';
      hijos.push(el('b', { style: G, text: `${M.icono} ${M.nombre}` }), el('span', { style: G, text: M.texto }), el('span', { class: 'aporte', style: G, text: x.mk.d }),
        el('span', { class: 'small', style: G, text: esColono(x) ? C.HUELLAS.colonos.textos.bloquea + ' ' + C.HUELLAS.colonos.textos.leccion : `${x.mk.t === 'acta' ? 'Permanece mientras gobiernes.' : `Se borrará hacia el año ${x.mk.y + M.anios}.`} Si construyes aquí, la huella desaparece. ${C.MARCAS.leccion}` }));
    }
    if (x.oc && C.GUERRA) hijos.push(el('span', { class: 'neg', style: 'grid-column:1/-1', text: C.GUERRA.textos.ocupada.replace('{vecino}', C.VECINOS.vecinos[x.oc].nombre) })); // fase 9
    if (!x.b && x.t === 'llano' && suelosActivos(S)) hijos.push(el('span', { class: 'especial', style: 'grid-column:1/-1', html: this.notaSuelo(i).replace(/^<br>/, '') }));
    if (x.b) {
      hijos.push(el('img', { src: this.icono(x.b), alt: '' }), el('b', { text: this.nombre(x.b) }), el('span', { text: this.descripcion(x.b) }),
        ...(C.B[x.b].es && climaActivo(S) && !(x.b === 'cultivo' && fincasActivas(S)) ? [el('span', { class: 'especial', text: `✦ ${C.B[x.b].es}` })] : []),
        ...(esPatrimonio(S, x) ? [el('span', { class: 'especial', text: `🏛️ Patrimonio: construida ${x.ya ? `en el año ${x.ya}` : 'con la aldea fundadora'}. Demolerla cuesta ${C.MEMORIA.demolerPatrimonio} de legitimidad y queda en la memoria.` })] : []),
        el('span', { text: `Mantenimiento: ${Math.round(C.B[x.b].up * S.price * (x.mt || 1))} de oro al año${x.mt ? ' (buenos materiales)' : ''}.` }));
      const ap = x.ob ? null : aporteObra(S, i);
      if (ap) hijos.push(el('span', { class: 'aporte', html: `<b>Lo que aporta hoy</b> (se perdería si la demueles):${this.efectos(ap)}` }));
      if (x.b === 'cultivo' && fincasActivas(S) && !x.ob) hijos.push(this.fichaFinca(i)); // fase 10
      if (x.b === 'taller' && industriaActiva(S) && !x.ob) hijos.push(this.fichaFabrica(i)); // fase 11
      const suelo = this.textoSuelo(i);
      if (suelo) hijos.push(el('span', { class: 'suelo', text: suelo }));
      if (conectada(S, i)) hijos.push(el('span', { class: 'especial', text: `${C.CALLES.textos.ficha}${factorCalle(S, i) > 1 ? `: vende ${Math.round(C.CALLES.comercio * 100)}% más` : radioCalle(S, i) && C.COB.radios[x.b] ? ': su servicio llega una casilla más lejos' : x.b === 'casa' ? ': evade menos impuestos' : ''}.` }));
      if (x.b === 'casa' && barriosActivos(S)) hijos.push(el('span', { text: `Barrio: ${nombreBarrio(barrioDe(S, i))}.` }));
      if (x.b === 'casa' && !x.ob && coberturaActiva(S)) {
        const sv = serviciosDeCasa(S, i), CS = C.COB.servicios;
        hijos.push(el('span', { text: `${C.COB.textos.fichaCasa} ${Object.keys(CS).map(s => `${sv[s] ? '✓' : '✗'} ${CS[s]}`).join(' · ')}` }));
      }
      // Vecindad: parque cerca y molestias (casas); materia prima cerca (fábricas) y fincas cerca (mercado).
      if (x.b === 'casa' && !x.ob && vecindadActiva(S)) {
        const V = vecindarioDe(S, i), T = C.VECINDAD.textos, MI = { taller: '🏭', mina: '⛏️', cuartel: '🎖️' };
        hijos.push(el('span', { style: 'grid-column:1/-1', html: `${T.ficha} ${V.parque ? `<span class="pos">${T.parque}</span>` : T.sinParque}${V.molestia ? ` · <span class="neg">${T.molestia.replace('{icono}', MI[V.molestia.k]).replace('{texto}', V.molestia.texto)} (${V.molestia.animo} de ánimo)</span>` : ''}.` }));
      }
      if (x.b === 'taller' && !x.ob && vecindadActiva(S) && industriaActiva(S)) { const b = bonoFabrica(S, i, datosProducto(productoDe(x)).insumo); if (b) hijos.push(el('span', { class: 'pos', style: 'grid-column:1/-1', text: C.VECINDAD.textos.fabricaCerca.replace('{pct}', Math.round(b * 100)) })); }
      if (x.b === 'mercado' && !x.ob && bonoMercado(S, i)) hijos.push(el('span', { class: 'pos', style: 'grid-column:1/-1', text: C.VECINDAD.textos.mercadoCerca.replace('{pct}', Math.round(bonoMercado(S, i) * 100)) }));
      if (S.desgaste && nivelObra(x) > 0) { const e = estadoObra(x); hijos.push(el('span', { class: 'suelo', text: `${e.nombre}: ${C.DESGASTE.textos[e.id]}` })); }
      if (x.ob) {
        const T = C.OBRAS.textos, o = x.ob;
        hijos.push(el('span', { class: 'suelo', text: o.det >= C.OBRAS.aniosElefante ? T.fichaElefante : T.enCurso.replace('{p}', Math.min(o.p, o.n)).replace('{n}', o.n).replace('{etapa}', etapaDe(x).toLowerCase()) }));
        hijos.push(el('span', { text: o.det ? T.parada.replace('{c}', o.c) : o.p >= o.n ? T.ultimoAnio : T.proximoPago.replace('{c}', o.c) }));
        hijos.push(el('span', { class: 'small', text: C.OBRAS.leccion }));
      }
      if (x.b === 'cementerio' && huellasActivas(S)) { const M = C.HUELLAS.cementerio; hijos.push(el('span', { class: 'especial', text: M.textos.ficha.replace('{n}', tumbasDe(S, i)).replace('{c}', M.capacidad) }), el('span', { class: 'small', text: M.textos.leccion })); }
      if (x.ru) hijos.push(el('span', { class: 'especial', text: C.HUELLAS.ruinas.textos.ficha.replace('{anio}', x.ru) }));
      if (x.qm !== undefined && quemadaVisible(S, x)) hijos.push(el('span', { class: 'especial', text: C.HUELLAS.guerra.textos.quemada.replace('{anio}', x.qm) }));
      for (const id of this.mapa.leyesAqui ? this.mapa.leyesAqui(i, x) : []) hijos.push(el('span', { class: 'small', style: 'grid-column:1/-1', text: `⚖️ ${datosLey(id).n}: ${C.HUELLAS.leyes[id].texto}` })); // huellas: las leyes que se ven aquí
      if (x.b === 'fundacion') { const r = radioCasco(S); hijos.push(el('span', { class: 'small', text: (r ? C.HUELLAS.fundacion.textos.casco.replace('{r}', r) + ' ' : '') + C.HUELLAS.leccion })); }
      if (x.b === 'fundacion' && estadoPlaza(S)) hijos.push(el('button', { class: 'btn', style: 'grid-column:1/-1;margin-top:6px', on: { click: () => { this.cerrarFicha(); this.tarjetaPlaza(); } } }, C.PLAZA.textos.mejorar + ` (${estadoPlaza(S).nombre})`));
      const g = x.ob ? devolucionObra(x) : Math.round(cost(S, x.b) * .3), rep = S.desgaste && !x.ob ? costoReparar(S, i) : 0;
      if (rep) hijos.push(el('button', { class: 'btn', style: 'grid-column:1/-1;margin-top:6px', ...(S.over || S.gold < rep ? { disabled: '' } : {}), on: { click: () => this.mapa.repararObra(i) } }, x.ru ? C.HUELLAS.ruinas.textos.boton.replace('{c}', rep) : `Reparar (−${rep} oro)`));
      hijos.push(el('div', { class: 'dos' }, [
        x.b === 'fundacion' ? el('span', { class: 'small', text: C.HUELLAS.fundacion.textos.noDemoler }) : el('button', { class: 'btn', ...(S.over ? { disabled: '' } : {}), on: { click: () => this.mapa.demoler(i) } }, `Demoler (+${g} oro)`),
        el('button', { class: 'btn', on: { click: () => this.cerrarFicha() } }, 'Cerrar')
      ]));
    } else {
      const B = BIOMA[t.b];
      const uso = x.t === 'rio' ? 'No se puede construir sobre el río. En sus orillas van acueductos, molinos y puertos.'
        : x.t === 'montana' ? 'Montaña: solo admite minas (desde Ciudad).'
        : x.t === 'bosque' && estadoSuelo(S, i) === 'joven' ? `${C.CLIMA.suelo.joven} Construir aquí lo talaría y bajaría el ambiente.`
        : x.t === 'bosque' ? 'Bosque: construir aquí tala el bosque y baja el ambiente.'
        : nearRiver(S, i) ? 'Tierra fértil junto al río: un cultivo aquí rinde más.'
        : x.h >= 1 ? 'Ladera: aquí crece el café.' : 'Terreno libre para construir.';
      hijos.push(el('b', { text: B.n, style: 'grid-column:1/-1' }), el('span', { style: 'grid-column:1/-1', text: `Piso térmico: ${B.p}. Unos ${metros(t.h).toLocaleString('es-CO')} m de altura.` }), el('span', { style: 'grid-column:1/-1', text: uso }));
      const suelo = this.textoSuelo(i);
      if (suelo) hijos.push(el('span', { class: 'suelo', style: 'grid-column:1/-1', text: suelo }));
    }
    this.ficha.replaceChildren(...hijos);
    this.ficha.hidden = false;
  }
  abrirPersona(p) {
    const S = this.S, cl = { c: 'Campesinos', a: 'Artesanos', e: 'Élite', u: 'Sin empleo', n: 'Niños' }[p.clase];
    const trabajo = p.trabajo !== null && p.trabajo !== undefined && S.map[p.trabajo].b ? ` en ${C.B[S.map[p.trabajo].b].a}` : '';
    this.ficha.replaceChildren(
      el('b', { style: 'grid-column:1/-1', text: `${p.nombre}, ${p.edad} años` }),
      el('span', { style: 'grid-column:1/-1', text: `${p.oficio}${p.clase === 'u' || p.clase === 'n' ? '' : trabajo}. Clase: ${cl.toLowerCase()}.` }),
      el('em', { style: 'grid-column:1/-1', text: `“${pensamiento(S, p)}”` }),
      ...(p.familia ? [el('span', { style: 'grid-column:1/-1', html: `<b>${datosFamilia(p.familia).icono} ${datosFamilia(p.familia).nombre}.</b> ${datosFamilia(p.familia).origen}` }),
        el('button', { class: 'btn', style: 'grid-column:1/-1', on: { click: () => { const r = representantes(S).find(x => x.familia === p.familia); if (r) this.tarjetaCarta(estadoFamilias(S).cartas.find(c => c.n === r.ultima.n), null, true); } } }, '✉️ Leer su última carta')] : []),
      el('small', { style: 'grid-column:1/-1;color:var(--muted)', text: p.familia ? 'Una de las familias que te escriben.' : 'Cada figura representa a unas dos personas del pueblo.' })
    );
    this.ficha.hidden = false;
  }
  // Fase 3: el Ejército en Hacienda: gasto militar, ánimo de los soldados, voz del general y aviso de golpe.
  seccionEjercito() {
    const S = this.S, K = C.EJERCITO;
    if (!ejercitoActivo(S)) return '';
    const E = ejercito(S), meta = metaEjercito(S), voz = K.general.animo[E.animo < 35 ? 0 : E.animo < 62 ? 1 : 2];
    return `<h3>${K.textos.titulo}</h3>
      <div class="txrow"><span>${K.textos.gasto}</span><input type="range" min="0" max="${K.gastoMaximo}" value="${E.gasto}" data-militar aria-label="Gasto militar, porcentaje de los ingresos"><strong>${E.gasto}%</strong></div>
      <p class="small">Ánimo del Ejército: <b class="${E.animo < 35 ? 'neg' : ''}">${Math.round(E.animo)}</b>. ${this.tendencia(E.animo, meta)} ${K.general.nombre}: “${voz}”</p>
      ${E.aviso ? `<p class="small neg"><b>${K.textos.aviso.replace('{anio}', E.aviso.anio)}</b> ${K.textos.preparar}</p>` : ''}
      <button class="btn" data-ejercito>¿Por qué? Ver causas</button>`;
  }
  explicarEjercito() {
    const S = this.S, K = C.EJERCITO, E = ejercito(S);
    this.tarjeta(`<h3>🎖️ Ejército: ánimo ${Math.round(E.animo)}</h3><p>${C.GRUPOS.grupos.soldados.que}</p>
      <p>${this.tendencia(E.animo, metaEjercito(S))} Así se calcula su meta:</p>${this.filasCausas(partesEjercito(S).filter(x => Math.abs(x[1]) >= .5))}
      <p class="small">Si su ánimo baja de ${K.golpe.animo} y la legitimidad de ${K.golpe.legitimidad}, los oficiales conspiran: hay un año de aviso antes del golpe.</p>
      <div class="phil"><b>Lo que enseña</b><br>${K.leccion}</div><button class="main" id="okB">Cerrar</button>`);
    this.boton('okB', () => this.cerrarTarjeta());
  }
  // Fase 2: economía viva: fase del ciclo, precio del alimento y del café, aviso de recesión.
  seccionEconomia() {
    const S = this.S, E = C.ECO;
    if (!economiaActiva(S)) return '';
    const f = E.fases[S.eco.fase], x = v => '×' + v.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `<h3>Economía</h3>
      <div class="macro"><div><strong>${f.icono}</strong><span>${f.nombre}</span></div><div><strong class="${precioAlimento(S) >= 1.15 ? 'neg' : ''}">${x(precioAlimento(S))}</strong><span>Precio del alimento</span></div><div><strong>${x(precioCafe(S))}</strong><span>Precio del café</span></div></div>
      <p class="small">${f.texto ? f.texto + ' ' : ''}${S.eco.aviso ? `<b>${E.textos.aviso.replace('{anio}', S.eco.aviso.anio)}</b> ` : ''}${E.leccion}</p>`;
  }
  // Fase 7: economía con ciclos (costos por época, café, roya, pensiones y migración).
  seccionCiclos() {
    const S = this.S;
    if (!ciclosActivos(S) || S.stage < 1) return '';
    const K = C.CICLOS, Ci = S.ciclo || {}, caf = counts(S).cafetal, f = factorCostos(S), filas = [];
    if (f > 1) filas.push(`<p class="small">💸 ${K.textoCostos} Hoy los costos del gobierno están en <b>×${f.toLocaleString('es-CO')}</b>.</p>`);
    if (Ci.cafe) filas.push(`<p class="small">${Ci.cafe.tipo === 'bonanza' ? '📈 <b>Bonanza cafetera</b>' : '📉 <b>Crisis del café</b>'} hasta el año ${Ci.cafe.hasta}.</p>`);
    if (Ci.fondoCafe) filas.push(`<p class="small">☕ Fondo de estabilización del café: <b>${Math.round(Ci.fondoCafe)} de oro</b> guardados para la próxima crisis.</p>`);
    if (caf && S.year >= K.roya.desde - 5) filas.push(`<p class="small">🍂 ${Ci.roya ? `<b>La roya ataca los cafetales</b> hasta el año ${Ci.roya.hasta + 1}: rinden ${Math.round(factorRoya(S) * 100)}%.` : Ci.resistente ? 'Tus cafetales son resistentes a la roya.' : `${K.roya.textos.riesgo}. Renovarlos con variedad resistente cuesta ${costoRenovar(S)} de oro.`}</p>
      ${!Ci.resistente ? `<button class="btn" data-renovar ${puedeRenovar(S) ? 'disabled' : ''}>Renovar los cafetales</button>` : ''}`);
    if (Ci.pension) { const P = K.pensiones; filas.push(`<p class="small">👵 Pensiones: <b>${P.sistemas[Ci.pension].nombre}</b>, ${costoPensiones(S)} de oro por año (crece con el envejecimiento: ${Math.round(vejez(S) * 100)}%). ${P.textos.cambiar}</p>
      <div class="dos">${Object.entries(P.sistemas).filter(([k]) => k !== Ci.pension).map(([k, x]) => `<button class="btn" data-pension="${k}">${x.icono} ${x.nombre}</button>`).join('')}</div>`); }
    const m = tasaMigracion(S);
    if (S.year >= K.migracion.desde) filas.push(`<p class="small">🧳 Cada año se va a la ciudad el <b>${(m * 100).toLocaleString('es-CO', { maximumFractionDigits: 1 })}%</b> de la población. ${K.migracion.leccion}</p>`);
    return filas.length ? `<h3>Ciclos de la economía</h3>${filas.join('')}` : '';
  }
  // Fase 10: canasta agrícola: cuánto oro da cada cultivo, su precio y qué tan concentrada está la economía del campo.
  seccionCanasta() {
    const S = this.S;
    if (!fincasActivas(S)) return '';
    const K = C.CULTIVOS.canasta, T = K.textos, c = canastaOro(S);
    if (!c.filas.length) return '';
    const fase = f => ({ bonanza: ' <small class="pos">bonanza</small>', auge: ' <small class="pos">auge</small>', crisis: ' <small class="neg">crisis</small>' }[f] || '');
    const filas = c.filas.map(f => { const D = datosCultivo(f.cv); return `<tr><td>${D.icono} ${D.nombre} <small>(${f.fincas})</small>${fase(f.fase)}</td><td><small class="${f.precio > 1.05 ? 'pos' : f.precio < .95 ? 'neg' : ''}">precio ×${f.precio.toLocaleString('es-CO', { maximumFractionDigits: 2 })}</small></td><td>${f.oro}${c.total ? ` <small>(${Math.round(f.parte * 100)}%)</small>` : ''}</td></tr>`; }).join('');
    const M = c.mayor, concentrada = M && M.parte >= K.concentrado;
    const juicio = !c.total ? '' : concentrada ? `<p class="small neg">${T.concentrada.replace('{pct}', Math.round(M.parte * 100)).replace('{cultivo}', datosCultivo(M.cv).nombre.toLowerCase())}</p>` : `<p class="small pos">${T.diversa}</p>`;
    return `<h3>${T.titulo}</h3><p class="small">${T.ayuda}</p><div class="ledger"><table class="budget"><tr><th style="text-align:left">Cultivo (fincas)</th><th></th><th>Oro al año</th></tr>${filas}<tr class="tot"><td>Total del campo</td><td></td><td>${c.total}</td></tr></table></div>${juicio}<p class="small"><i>${T.leccion}</i></p>`;
  }
  // Fase 1: control de mantenimiento (desde 25 habitantes), estado de las obras y reparación.
  seccionMantenimiento() {
    const S = this.S, D = C.DESGASTE, T = D.textos;
    if (!climaActivo(S)) return '';
    if (!S.desgaste) return `<h3>${T.titulo}</h3><p class="small">${T.cerrado}</p>`;
    const m = S.mant ?? 100, n = [0, 0, 0, 0];
    let g = 0;
    S.map.forEach((x, i) => { if (!x.b) return; const k = nivelObra(x); n[k]++; if (k >= 2) g += costoReparar(S, i); });
    const partes = D.estados.map((e, k) => n[k] ? `${n[k]} ${n[k] === 1 ? e.nombre.toLowerCase() : e.plural}` : '').filter(Boolean).join(' · ');
    const ritmo = T.ritmo.find(r => m >= r.desde).texto;
    return `<h3>${T.titulo}</h3>
      <div class="txrow"><span>Se paga</span><input type="range" min="0" max="100" step="10" value="${m}" data-mant aria-label="Mantenimiento de las obras, porcentaje"><strong>${m}%</strong></div>
      <p class="small">${ritmo} Obras: ${partes || 'ninguna'}.</p>
      ${g ? `<button class="btn" data-reparar ${S.gold < g || S.over ? 'disabled' : ''}>${T.repararTodo.replace('{g}', g)}</button>` : ''}
      <p class="small">${D.leccion}</p>`;
  }
  // Fase 1: estado del suelo de la casilla (cenizas, erosión, derrumbe).
  textoSuelo(i) {
    const e = estadoSuelo(this.S, i), K = climaActivo(this.S) && C.CLIMA.suelo, x = this.S.map[i];
    // Fase 6: la ronda del río.
    const ronda = rioActivo(this.S) && this.S.stage >= 1 && x.t !== 'rio' && nearRiver(this.S, i) ? ' 🌊 Ronda del río: ' + (x.b ? 'con las crecidas, el río puede llevarse esta obra.' : x.t === 'bosque' || !(x.tl || x.er > 0) ? 'la vegetación de galería sostiene esta orilla; construir o talar aquí la debilita.' : 'orilla pelada: con las crecidas, el río puede comérsela.') : '';
    return (!K ? '' : e === 'derrumbe' ? '⛰️ ' + K.derrumbe.aviso : e === 'quemado' ? '🔥 ' + K.quemado
      : e === 'riesgo' ? '⚠️ ' + K.erosion.riesgo : e === 'erosion' ? '🟫 ' + K.erosion.aviso : '') + ronda;
  }
  cerrarFicha() { this.ficha.hidden = true; this.mapa.marcar(null); }
  motivo(k, i) { return whyNot(this.S, k, i); }

  // ---------- Tarjetas ----------
  tarjeta(html, cerrable = true) {
    this.cerrarFicha();
    this.card.classList.remove('periodico', 'carta'); this.velo.classList.remove('con-periodico');
    this.card.innerHTML = html;
    this.velo.hidden = false;
    this.tarjetaCerrable = cerrable;
    const f = this.card.querySelector('button'); if (f) f.focus({ preventScroll: true });
    this.card.scrollTop = 0;
  }
  cerrarTarjeta() { this.velo.hidden = true; this.card.innerHTML = ''; this.card.classList.remove('periodico', 'carta'); this.velo.classList.remove('con-periodico'); if (this.alCerrar) { const f = this.alCerrar; this.alCerrar = null; f(); } }
  boton(id, fn) { const b = this.card.querySelector('#' + id); if (b) b.onclick = fn; }

  // Claridad: todos los efectos de una obra en fichas pequeñas (verde ayuda, rojo cuesta).
  efectos(v) {
    const L = [], ch = (ico, txt, bueno) => L.push(`<span class="efe ${bueno === undefined ? '' : bueno ? 'pos' : 'neg'}">${ico} ${txt}</span>`);
    ch('💰', `oro al año ${signo(v.dn)}`, v.dn >= 0);
    if (v.djc) ch('🧑‍🌾', `${signo(v.djc)} empleos campesinos`, v.djc > 0);
    if (v.dja) ch('🔨', `${signo(v.dja)} empleos artesanos`, v.dja > 0);
    if (v.cupos) ch('🏠', `${signo(v.cupos)} cupos de vivienda`, v.cupos > 0);
    if (v.df) ch('🌽', `alimento ${signo(v.df)} al año`, v.df > 0);
    if (v.agua) ch('💧', `${signo(v.agua)} agua`, v.agua > 0);
    if (v.energia) ch('⚡', `energía para ${v.energia} talleres`, true);
    if (Math.abs(v.de) >= 1) ch('🌿', `ambiente ${signo(v.de)}`, v.de > 0);
    const n = { c: 'campesinos', a: 'artesanos', e: 'élite' };
    for (const k of ['c', 'a', 'e']) if (v.dsat && Math.abs(v.dsat[k]) >= .5) ch('😊', `ánimo ${n[k]} ${signo(v.dsat[k])}`, v.dsat[k] > 0);
    if (v.radio) ch('📏', `atiende ${v.radio} casillas a la redonda`);
    if (v.mant) ch('🔧', `mantenimiento ${v.mant} al año`);
    return `<div class="efes">${L.join('')}</div>`;
  }
  // Fase 2: ficha del proyecto (inversión, VPN, recuperación, beneficio social) y licitación con tres ofertas.
  licitacion(k, i, alElegir) {
    const S = this.S, e = evaluarProyecto(S, k, i), O = C.OBRAS;
    if (e.motivo) { this.toast(e.motivo); return; }
    const estrellas = n => '★'.repeat(n) + '☆'.repeat(3 - n);
    const ofs = ofertas(S, k, i).map(o => `<button class="opt" data-of="${o.id}" ${S.gold < o.cuota ? 'disabled' : ''}>
        <b>${o.nombre}</b> <span class="small" aria-label="Reputación ${o.reputacion} de 3">${estrellas(o.reputacion)}</span><br>
        ${o.total} de oro · ${o.anios === 0 ? 'lista al instante' : o.anios === 1 ? '1 año, un pago' : `${o.anios} años, pagos de ${o.cuota}`}${S.gold < o.cuota ? ' · no alcanza el oro' : ''}
        <small>${o.texto.replace('{s}', o.sob)}</small>${o.sob ? this.avisoActa(['soborno']) : ''}</button>`).join('');
    this.tarjeta(`<div class="big">${C.B[k].e}</div><h3>Proyecto: ${this.nombre(k)}</h3>
      <div class="ledger"><table class="budget">
        <tr><td>Inversión</td><td>${e.inversion}</td></tr>
        <tr><td>Tiempo de obra</td><td>${e.anios === 1 ? '1 año' : e.anios + ' años'}</td></tr>
        <tr><td>Resultado anual cuando funcione</td><td class="${e.dn < 0 ? 'neg' : ''}">${signo(e.dn)}</td></tr>
        <tr><td>VPN a ${e.horizonte} años (tasa ${Math.round(e.tasa * 100)}%)</td><td class="${e.vpn < 0 ? 'neg' : ''}">${signo(e.vpn)}</td></tr>
        <tr class="tot"><td>Se recupera</td><td>${e.recupera ? `en ${e.recupera} años` : 'no, en dinero'}</td></tr></table></div>
      <p class="small"><b>Cuando esté lista:</b> ${C.B[k].d}</p>${this.efectos(e)}
      <div class="phil"><b>Lo que enseña</b><br>${O.leccionProyecto}</div>
      <h3>Licitación: elige contratista</h3>${ofs}
      <p class="small">${O.leccionLicitacion}</p>
      <button class="btn" id="noB">Cancelar</button>`);
    this.alCerrar = () => this.mapa.marcar(null);
    this.card.querySelectorAll('[data-of]').forEach(b => b.onclick = () => { const id = b.dataset.of; this.alCerrar = null; this.cerrarTarjeta(); alElegir(id); });
    this.boton('noB', () => this.cerrarTarjeta());
  }
  chips(fx) {
    const ks = Object.keys(fx);
    if (!ks.length) return '<span class="chip">Sin efectos inmediatos</span>';
    return ks.map(k => { const v = fx[k], bueno = BADUP[k] ? v < 0 : k === 'txe' ? v < 0 : v > 0; return `<span class="chip ${bueno ? 'g' : 'b'}">${v > 0 ? '+' : '−'}${Math.abs(v)} ${C.FXL[k]}</span>`; }).join('');
  }

  reacciones(fx) {
    const S = this.S;
    const r = Object.keys(C.ADV).map(a => { const st = stance(a, fx); if (!st) return ''; const L = st > 0 ? C.ADV[a].pro : C.ADV[a].con; return `<div class="say ${st > 0 ? 'pro' : 'con'}"><img src="${retrato(a, st > 0 ? 'feliz' : 'enojado')}" alt=""><div><b>${C.ADV[a].n}</b><span>“${L[S.year % L.length]}”</span></div></div>`; }).join('');
    return r ? `<div class="says">${r}</div>` : '';
  }
  // Dilema o consecuencia del año.
  // Fase 9: antes de la tarjeta, una escena de cine (una vez por suceso); al terminar se vuelve a llamar.
  escena(tipo, clave, seguir, datos = {}) {
    if (!tipo || !this.mapa.cine || this._escenaVista === clave) return false;
    this._escenaVista = clave;
    this.mapa.cine.jugar(tipo, datos, seguir);
    return true;
  }
  suceso(alTerminar) {
    const S = this.S, ev = S.pend;
    if (!ev) { if (alTerminar) alTerminar(); return; }
    if (ev.mov && ev.movilizado) {
      const lid = ev.mov === 'campesinos' && S.fig && S.fig.lider && S.fig.lider.visto, M = C.MOV.movimientos[ev.mov];
      if (this.escena(lid ? 'marchaLider' : 'marcha', ev, () => this.suceso(alTerminar), { movimiento: M.nombre, lider: C.FIG.figuras.lider.nombre })) return;
    }
    if (/escandalo/.test(ev.id || '') && this.escena('escandalo', ev, () => this.suceso(alTerminar))) return;
    const img = `<img class="vig" src="${vineta(ev.id, S.reg, S.stage)}" alt="">`;
    this.tarjeta(`${img}<h3>${ev.title}</h3><p>${ev.text}</p>${this.lineaMovimiento(ev)}` + ev.opts.map((o, i) =>
      `<button class="opt" data-o="${i}">${ev.followUp ? '' : `<span class="stances">${Object.keys(C.ADV).map(a => { const st = stance(a, o.fx); return st ? `<span class="st ${st > 0 ? 'pro' : 'con'}"><img src="${retrato(a, st > 0 ? 'feliz' : 'enojado')}" alt="${C.ADV[a].n}">${st > 0 ? '✓' : '✗'}</span>` : ''; }).join('')}</span>`}${o.l}${ev.followUp ? `<small>${Object.keys(o.fx).length ? 'Ver efectos' : ''}</small>` : `<small>${o.fx.t ? (o.fx.t > 0 ? '+' : '−') + Math.abs(o.fx.t) + ' oro' : 'Sin costo en oro'}${o.f ? ` · ${C.PH[o.f].n}` : ''}</small>`}</button>`).join(''), false);
    this.card.querySelectorAll('[data-o]').forEach(b => b.onclick = () => {
      const o = this.mapa.elegirOpcion(+b.dataset.o);
      if (!o) { this.cerrarTarjeta(); return; } // el dilema ya se resolvió
      const p = o.f ? C.PH[o.f] : null;
      this.tarjeta(`${img}<h3>${ev.followUp ? ev.title : o.l}</h3><div class="chips">${this.chips(o.fx)}</div>
        ${o.salioMal ? `<div class="salio-mal"><b>⚠️ Salió mal</b><br>${o.salioMal}</div>` : ''}
        ${o.ex ? `<div class="porque-afecta"><b>¿Por qué afecta así?</b><br>${o.ex}</div>` : ''}
        <div class="phil"><b>${p ? `${p.n} (${p.a})` : 'Lección'}</b><br>${o.why}</div>${this.resultadoFuerza(o)}${this.reacciones(o.fx)}${o.later && !(o.uso && o.uso.cancelada) ? '<p class="small">Esta decisión puede tener consecuencias en los próximos años.</p>' : ''}
        ${o.acta ? o.acta.map(t => `<p class="small neg">${t}</p>`).join('') : ''}
        ${ev.mov ? `<p class="small">${C.MOV.movimientos[ev.mov].icono} ${C.MOV.movimientos[ev.mov].nombre}: fuerza ${Math.round(fuerzaMov(S, ev.mov))} (${nombreEstado(fuerzaMov(S, ev.mov)).toLowerCase()}).</p>` : ''}
        ${o.danada ? `<p class="small">🔥 Dañaron ${o.danada}: se ve desgastada en el mapa. Puedes repararla tocándola.</p>` : ''}
        <button class="main" id="okB">Continuar</button>`);
      this.alCerrar = alTerminar;
      this.boton('okB', () => this.cerrarTarjeta());
    });
  }
  // Fase 3: acta fundacional. Aviso antes de un acto que contradice un principio firmado.
  avisoActa(motivos) {
    const P = contradiria(this.S, motivos);
    return P.length ? `<small class="acta-aviso">📜 Contradice tu acta: ${P.map(x => `«${x.nombre}»`).join(' y ')} (−${C.ACTA.costo} de legitimidad${P.length > 1 ? ' cada uno' : ''})</small>` : '';
  }
  // Al empezar una partida nueva: elegir dos principios y firmar.
  acta(alTerminar) {
    const S = this.S, A = C.ACTA, elegidos = new Set();
    this.tarjeta(`<div class="big">📜</div><h3>${A.titulo}</h3><p>${A.texto}</p>
      <div class="principios">${Object.entries(A.principios).map(([id, p]) => `<button class="opt principio" data-pr="${id}" aria-pressed="false"><b>${p.icono} ${p.nombre}</b><small>${p.texto}</small><small class="contra">Lo contradice: ${Object.values(p.contradice).join('; ')}.</small></button>`).join('')}</div>
      <div class="phil"><b>Lo que enseña</b><br>${A.leccion}</div>
      <button class="main" id="firmarB" disabled>Elige ${A.cuantos} principios</button>`, false);
    const boton = this.card.querySelector('#firmarB');
    this.card.querySelectorAll('[data-pr]').forEach(b => b.onclick = () => {
      const id = b.dataset.pr;
      if (elegidos.has(id)) elegidos.delete(id); else if (elegidos.size < A.cuantos) elegidos.add(id);
      this.card.querySelectorAll('[data-pr]').forEach(x => { const on = elegidos.has(x.dataset.pr); x.classList.toggle('on', on); x.setAttribute('aria-pressed', String(on)); });
      const faltan = A.cuantos - elegidos.size;
      boton.disabled = faltan > 0; boton.textContent = faltan > 0 ? `Elige ${faltan} ${faltan === 1 ? 'principio más' : 'principios'}` : 'Firmar el acta';
    });
    boton.onclick = () => {
      if (elegidos.size !== A.cuantos) return;
      firmarActa(S, [...elegidos]); guardarYa(S);
      this.cerrarTarjeta(); this.render();
      this.toast(`📜 Acta firmada. Legitimidad de origen: +${A.alFirmar}.`);
      if (alTerminar) alTerminar();
    };
  }
  seccionActa() {
    const S = this.S;
    if (!actaActiva(S)) return '';
    const A = C.ACTA, ok = cumplidos(S);
    return `<h2>📜 Acta fundacional (año ${S.acta.anio})</h2>${S.acta.p.map(id => { const p = A.principios[id], f = S.acta.faltas.find(x => x.p === id);
      return `<p class="small"><b>${p.icono} ${p.nombre}</b> (${p.autor}): ${ok.includes(id) ? '<span class="pos">cumplido</span>' : `<span class="neg">contradicho en el año ${f.anio}: ${f.razon}</span>`}.</p>`; }).join('')}
      <p class="small">Contradecir un principio cuesta ${A.costo} de legitimidad. ${A.leccion}</p>`;
  }
  // Fase 3: demanda de un movimiento social: su fuerza y qué le hace cada respuesta.
  lineaMovimiento(ev) {
    if (!ev.mov) return '';
    const m = C.MOV.movimientos[ev.mov], f = Math.round(fuerzaMov(this.S, ev.mov));
    return `<p class="small">${m.icono} ${m.nombre} · líder: ${m.lider} · fuerza ${f} (${nombreEstado(f).toLowerCase()})${ev.movilizado ? '. Movilizado: ignorarlo tiene un costo inmediato.' : '.'}</p>`;
  }


  resultadoFuerza(o) {
    if (!o.uso) return '';
    const u = o.uso;
    return `<div class="porque-afecta"><b>⚔️ Uso de la fuerza con legitimidad ${u.nivel} (${u.leg})</b><br>${u.textos.join(' ')}</div>
      <div class="phil"><b>Legitimidad y fuerza</b><br>${C.FUERZA.leccion}</div>`;
  }
  // Fase 1: tarjeta del pronóstico (enseña el fenómeno y cómo prepararse) o balance de la emergencia.
  clima(alTerminar) {
    const S = this.S;
    if (!climaActivo(S)) { alTerminar(); return; }
    const K = S.clima, FEN = C.CLIMA.fenomenos, e = K.evento;
    if (e && e.anio === S.year - 1 && !e.mostrado) {
      e.mostrado = true;
      const F = FEN[e.tipo];
      this.tarjeta(`<div class="big">${F.icono}</div><h3>${F.nombre}: balance de la emergencia</h3>
        <p>${e.resto ? F.noAtendida : F.atendida}</p>
        <div class="ledger"><table class="budget"><tr><td>Costo de atender la emergencia</td><td>${e.costo}</td></tr><tr><td>Pagado con el fondo</td><td>${e.cubierto}</td></tr><tr class="tot"><td>Pagado por el tesoro a última hora</td><td class="${e.resto ? 'neg' : ''}">${e.resto}</td></tr></table></div>
        ${e.quemadas ? `<p class="small">🔥 La sequía quemó ${e.quemadas === 1 ? 'una casilla' : e.quemadas + ' casillas'} de bosque. El suelo desnudo se erosionará hasta que el bosque vuelva.</p>` : ''}
        ${e.derrumbes ? `<p class="small">⛰️ ${e.derrumbes === 1 ? 'Hubo un derrumbe' : `Hubo ${e.derrumbes} derrumbes`} en laderas taladas${e.perdidas && e.perdidas.length ? `. Se perdió: ${e.perdidas.join(', ')}` : ''}.</p>` : ''}
        ${e.tipo === 'nina' ? `<p class="small">Obras dañadas junto al río: ${e.obrasRiberenas}. Después de La Niña, las llanuras quedan más fértiles: el próximo año la cosecha rinde 15% más.</p>` : '<p class="small">Durante El Niño el río bajó y los acueductos entregaron menos agua.</p>'}
        <div class="phil"><b>Lo que enseña</b><br>${F.concepto}</div><button class="main" id="okB">Continuar</button>`);
      this.alCerrar = () => this.clima(alTerminar); this.boton('okB', () => this.cerrarTarjeta()); return;
    }
    if (K.pronostico && K.pronostico.nuevo) {
      K.pronostico.nuevo = false;
      const F = FEN[K.pronostico.tipo];
      this.tarjeta(`<div class="big">${F.icono}</div><h3>Pronóstico: ${F.nombre}</h3><p>${F.pronostico.replace('{anio}', K.pronostico.anio)}</p>
        <p><b>Tienes un año para prepararte.</b> ${F.preparar}</p><p class="small">Fondo de emergencias hoy: ${Math.round(S.fondo || 0)} de oro, con un aporte de ${S.aporteFondo || 0}% de los ingresos.</p>
        <div class="phil"><b>Lo que enseña</b><br>${F.concepto}</div><button class="main" id="okB">Entendido</button>`);
      this.alCerrar = () => this.economia(alTerminar); this.boton('okB', () => this.cerrarTarjeta()); return;
    }
    this.economia(alTerminar);
  }
  // Fase 2: tarjetas del aviso de recesión y del comienzo de la recesión (enseñan el ciclo y cómo prepararse).
  economia(alTerminar) {
    const S = this.S, E = S.eco, T = C.ECO.textos;
    if (!economiaActiva(S)) { this.avisoEjercito(alTerminar); return; }
    if (E.aviso && E.aviso.nuevo) {
      E.aviso.nuevo = false;
      this.tarjeta(`<div class="big">📉</div><h3>Pronóstico económico</h3><p>${T.aviso.replace('{anio}', E.aviso.anio)}</p>
        <p><b>Tienes un año para prepararte.</b> ${T.preparar}</p><div class="phil"><b>Lo que enseña</b><br>${C.ECO.leccionCiclo}</div><button class="main" id="okB">Entendido</button>`);
      this.alCerrar = () => this.economia(alTerminar); this.boton('okB', () => this.cerrarTarjeta()); return; // sigue con el resto de tarjetas del año
    }
    if (E.evento && E.evento.nuevo) {
      E.evento.nuevo = false;
      this.tarjeta(`<div class="big">📉</div><h3>Recesión</h3><p>${C.ECO.fases.recesion.texto}</p>
        <p class="small">Obras en marcha ahora: ${S.map.filter(x => x.ob && !x.ob.det).length}. Cada una emplea el doble mientras dure la recesión.</p>
        <div class="phil"><b>Lo que enseña</b><br>${C.ECO.leccionCiclo}</div><button class="main" id="okB">Continuar</button>`);
      this.alCerrar = () => this.economia(alTerminar); this.boton('okB', () => this.cerrarTarjeta()); return;
    }
    this.avisoEjercito(alTerminar);
  }
  // Fase 3: aviso de golpe (ruido de sables), con un año para prepararse.
  avisoEjercito(alTerminar0) {
    const S = this.S, E = S.ejercito, K = C.EJERCITO, alTerminar = () => this.sucesoAnio(alTerminar0);
    if (!E || !E.aviso || !E.aviso.nuevo || !ejercitoActivo(S)) { alTerminar(); return; }
    E.aviso.nuevo = false;
    this.tarjeta(`<div class="big">🎖️</div><h3>Ruido de sables</h3><p>${K.textos.aviso.replace('{anio}', E.aviso.anio)}</p>
      <p><b>Tienes un año para prepararte.</b> ${K.textos.preparar}</p><div class="phil"><b>Lo que enseña</b><br>${K.leccion}</div><button class="main" id="okB">Entendido</button>`);
    this.alCerrar = alTerminar; this.boton('okB', () => this.cerrarTarjeta());
  }
  // Fase 4: suceso que llegó sin decisión (robo, atentado, incendio, brote, abuso): qué pasó, por qué y cómo prevenirlo.
  sucesoAnio(alTerminar) {
    const S = this.S, ev = S.suceso, alTerminar0 = alTerminar;
    alTerminar = () => this.figurasAnio(alTerminar0);
    if (!ev || !ev.nuevo || !sucesosActivos(S)) { alTerminar(); return; }
    ev.nuevo = false;
    const q = C.SUCESOS.sucesos[ev.id];
    this.tarjeta(`<div class="big">${q.icono}</div><h3>${q.titulo}</h3><p>${ev.texto}</p><div class="chips">${this.chips(ev.fx)}</div>
      <div class="porque-afecta"><b>¿Por qué pasó?</b><br>${q.causa} Inseguridad de este año: <b>${ev.ins}</b>.</div>
      <p class="small"><b>Cómo prevenirlo:</b> ${q.prevenir}</p>
      <div class="phil"><b>Lo que enseña</b><br>${C.SUCESOS.leccion}</div>
      <div class="dos">${ev.obra !== undefined ? '<button class="btn" id="verObraB">Ver dónde fue</button>' : ''}<button class="main" id="okB">Entendido</button></div>`);
    this.alCerrar = alTerminar; this.boton('okB', () => this.cerrarTarjeta());
    this.boton('verObraB', () => { this.cerrarTarjeta(); this.mapa.enfocarCasilla && this.mapa.enfocarCasilla(ev.obra); });
  }
  // Fase 4: personajes con papel propio. Llegadas y misiones del año, en una sola tarjeta.
  figurasAnio(alTerminar0) {
    const S = this.S, L = S.figEv, alTerminar = () => this.desastreAnio(alTerminar0);
    if (S.escandaloEv && S.escandaloEv.nuevo) { const e = S.escandaloEv; e.nuevo = false; if (this.escena('escandalo', e, () => this.figurasAnio(alTerminar0))) return; }
    if (L && L.some(e => e.tipo === 'llega' && e.id === 'padre') && this.escena('procesion', L, () => this.figurasAnio(alTerminar0))) return;
    if (!L || !L.length) { alTerminar(); return; }
    S.figEv = null;
    const F = C.FIG.figuras, filas = L.map(e => {
      const f = F[e.id], img = `<img src="${retratoFig(e.id, f.retrato, gestoDe(estadoFig(S, e.id).rel))}" alt="">`;
      if (e.tipo === 'llega') { const m = misionDe(S, e.id); return `<div class="say pro"><div class="fig-r">${img}</div><div><b>${f.icono} Llega ${f.nombre}</b> <small>(${f.rol})</small><span>“${f.presentacion}”</span>${m ? `<small><b>Su misión:</b> ${m.texto} Plazo: año ${m.limite}.</small>` : ''}</div></div>`; }
      if (e.tipo === 'mision') { const m = misionDe(S, e.id); return `<div class="say pro"><div class="fig-r">${img}</div><div><b>${f.icono} ${f.nombre} te encarga una misión</b>${m ? `<span>${m.texto}</span><small>Plazo: año ${m.limite}.</small>` : ''}</div></div>`; }
      if (e.tipo === 'cumple') return `<div class="say pro"><div class="fig-r">${img}</div><div><b>✅ Cumpliste la misión de ${f.nombre}</b><span>${e.texto}</span><div class="chips">${this.chips(e.fx)}</div><small>Relación +${C.FIG.premioMision}.</small></div></div>`;
      return `<div class="say con"><div class="fig-r">${img}</div><div><b>❌ No cumpliste la misión de ${f.nombre}</b><span>${e.texto}</span><small>Relación −${C.FIG.castigoMision}.</small></div></div>`;
    }).join('');
    this.tarjeta(`<div class="big">🤝</div><h3>Personajes del territorio</h3><div class="says">${filas}</div>
      <div class="phil"><b>Lo que enseña</b><br>${C.FIG.leccion}</div><button class="main" id="okB">Continuar</button>`);
    this.alCerrar = alTerminar; this.boton('okB', () => this.cerrarTarjeta());
  }
  // Fase 4: desastres reales (alerta del volcán, erupción, terremoto).
  desastreAnio(alTerminar0) {
    const S = this.S, d = S.desastre, alTerminar = () => this.conflictoAnio(alTerminar0);
    if (!d || !d.nuevo || !desastresActivos(S)) { alTerminar(); return; }
    if (d.tipo !== 'alerta' && this.escena(d.tipo === 'erupcion' ? 'lahar' : 'terremoto', d, () => this.desastreAnio(alTerminar0))) return;
    d.nuevo = false;
    const VD = C.DESASTRES.volcan, Q = C.DESASTRES.terremoto;
    const voz = () => { const f = C.FIG.figuras.vulcanologa; return S.fig && S.fig.vulcanologa && S.fig.vulcanologa.visto ? `<div class="say pro"><div class="fig-r"><img src="${retratoFig('vulcanologa', f.retrato, gestoDe(S.fig.vulcanologa.rel))}" alt=""></div><div><b>${f.nombre}</b><span>“Alerta ${VD.niveles[d.nivel].nombre.toLowerCase()}. ${VD.niveles[d.nivel].texto}”</span></div></div>` : ''; };
    if (d.tipo === 'alerta') {
      const no = puedePlan(S), N = VD.niveles[d.nivel];
      this.tarjeta(`<div class="big">🌋</div><h3>${VD.nombre}: alerta ${N.nombre.toLowerCase()} ${N.icono}</h3><p>${N.texto}</p>${voz()}
        <p class="small"><b>${VD.plan.nombre}:</b> ${VD.plan.texto} ${volcan(S).plan ? '<b>Ya lo tienes.</b>' : `Cuesta ${costoPlan(S)} de oro.`} Si hay erupción, salva las vidas de la ribera; las obras junto al río se pierden igual.</p>
        <div class="phil"><b>Lo que enseña</b><br>${VD.leccion}</div>
        <div class="dos"><button class="btn" id="planB" ${no ? 'disabled' : ''}>${volcan(S).plan ? 'Plan listo' : `Preparar el plan (${costoPlan(S)} de oro)`}</button><button class="main" id="okB">Entendido</button></div>`);
      this.boton('planB', () => { if (comprarPlan(S)) { this.toast('Plan de evacuación listo: sirenas, rutas y simulacros.'); this.mapa.cambio(true); this.render(); const b = this.card.querySelector('#planB'); if (b) { b.disabled = true; b.textContent = 'Plan listo'; } } });
    } else if (d.tipo === 'erupcion') {
      this.mapa.temblor && this.mapa.temblor();
      this.tarjeta(`<div class="big">🌋</div><h3>Erupción del ${VD.nombre}</h3><p>${d.plan ? VD.textos.conPlan : VD.textos.sinPlan}</p>
        <div class="ledger"><table class="budget"><tr><td>Personas perdidas</td><td class="${d.plan ? '' : 'neg'}">${d.perdidos}</td></tr><tr><td>Obras dañadas por el lahar y la ceniza</td><td>${d.danadas}</td></tr></table></div>
        <p class="small">${VD.textos.ceniza}</p><div class="phil"><b>Lo que enseña</b><br>${VD.leccion}</div><button class="main" id="okB">Continuar</button>`);
    } else {
      this.mapa.temblor && this.mapa.temblor();
      this.tarjeta(`<div class="big">🏚️</div><h3>${Q.nombre}</h3><p>${d.ley ? Q.textos.conLey : Q.textos.sinLey}</p>
        <div class="ledger"><table class="budget"><tr><td>Personas perdidas</td><td class="${d.ley ? '' : 'neg'}">${d.perdidos}</td></tr><tr><td>Obras dañadas</td><td>${d.danadas}</td></tr><tr><td>Costo de la emergencia</td><td>${d.costo}</td></tr><tr><td>Pagado con el fondo</td><td>${d.cubierto}</td></tr></table></div>
        <p class="small">Repara las obras agrietadas tocándolas. ${d.ley ? '' : 'El código sismorresistente (Leyes) reduce el daño del próximo terremoto.'}</p>
        <div class="phil"><b>Lo que enseña</b><br>${Q.leccion}</div><button class="main" id="okB">Continuar</button>`);
    }
    this.alCerrar = alTerminar; this.boton('okB', () => this.cerrarTarjeta());
  }
  // Fase 4: conflicto armado (aparece el grupo, toma armada, acuerdo de paz o repliegue).
  conflictoAnio(alTerminar0) {
    const S = this.S, e = S.confEv, alTerminar = () => this.vecinosAnio(alTerminar0);
    if (S.desplEv && S.desplEv.nuevo) { const x = S.desplEv; x.nuevo = false; if (this.escena('desplazados', x, () => this.conflictoAnio(alTerminar0))) return; }
    if (!e || !e.nuevo || !conflictoActivo(S)) { alTerminar(); return; }
    if (e.tipo === 'toma' && this.escena('toma', e, () => this.conflictoAnio(alTerminar0))) return;
    e.nuevo = false;
    const K = C.CONF, g = K.grupo, T = K.textos;
    const titulo = { aparece: 'Conflicto armado en las veredas', toma: 'Toma armada', paz: 'Acuerdo de paz', repliega: 'El grupo armado se repliega' }[e.tipo];
    const texto = mayus(e.tipo === 'toma' ? e.texto : T[e.tipo].replace('{grupo}', g));
    this.tarjeta(`<div class="big">${{ aparece: '⛺', toma: '💥', paz: '🕊️', repliega: '🏞️' }[e.tipo]}</div><h3>${titulo}</h3><p>${texto}</p>
      ${e.tipo === 'aparece' ? `<p class="small">Mientras siga: veredas abandonadas (menos cosecha), desplazados que llegan al pueblo, extorsión y pérdida de legitimidad. Elige una estrategia en <b>Sociedad → Conflicto armado</b>.</p>` : ''}
      <div class="phil"><b>Lo que enseña</b><br>${K.leccion}</div>
      <div class="dos">${e.tipo === 'aparece' ? '<button class="btn" id="estrB">Elegir estrategia</button>' : ''}<button class="main" id="okB">Entendido</button></div>`);
    this.alCerrar = alTerminar; this.boton('okB', () => this.cerrarTarjeta());
    this.boton('estrB', () => { this.cerrarTarjeta(); this.explicarConflicto(); });
  }
  // Fase 4: caminos a la victoria (la Polis y cuatro caminos más; fase 7: desde Polis).
  caminosVictoria() {
    const S = this.S, V = C.VICTORIAS, abiertas = victoriasActivas(S);
    const polis = `<div class="camino"><b>🏛️ Polis</b> <small>${S.stage >= 3 ? `${S.polisYears} de ${aniosPolis(S)} años` : `llega a Polis: ${reqEtapa(S, 3)}`}</small><p class="small">Sostener la Polis ${aniosPolis(S)} años: un pueblo grande, con ágora y legítimo.</p></div>`;
    const otros = caminos(S).map(c => `<div class="camino"><b>${c.icono} ${c.nombre}</b> <small>${abiertas ? `${c.llevados} de ${c.anios} años seguidos` : `desde ${C.STAGES[C.VICTORIAS.desde.etapa].n}`}</small><p class="small">${c.texto}</p>
      <ul class="conds">${c.estado.map(q => `<li class="${q.ok ? 'pos' : 'neg'}">${q.ok ? '✓' : '✗'} ${q.texto}</li>`).join('')}</ul></div>`).join('');
    this.tarjeta(`<div class="big">🏆</div><h3>Caminos a la victoria</h3><p class="small">${abiertas ? `Gana el primero que sostengas ${aniosPolis(S)} años seguidos, cumpliendo todas sus condiciones a la vez.` : `Los cuatro caminos nuevos se abren cuando tu territorio sea ${C.STAGES[C.VICTORIAS.desde.etapa].n}.`}</p>
      ${polis}${otros}<div class="phil"><b>Lo que enseña</b><br>${V.leccion}</div><button class="main" id="okB">Cerrar</button>`);
    this.boton('okB', () => this.cerrarTarjeta());
  }
  // Fase 4: relaciones con las polis vecinas.
  vecinosAnio(alTerminar0) {
    const S = this.S, e = S.vecEv, alTerminar = () => this.guerraAnio(() => this.asentamientoAnio(alTerminar0));
    if (!e || !e.nuevo || !vecinosActivos(S)) { alTerminar(); return; }
    e.nuevo = false;
    const V = C.VECINOS;
    this.tarjeta(`<div class="big">🤝</div><h3>Las polis vecinas</h3><p>${V.textos.abre}</p>
      ${Object.entries(V.vecinos).map(([id, n]) => `<p class="small"><b>${n.icono} ${n.nombre}</b> (${n.alcalde}): ${n.rasgo}</p>`).join('')}
      <p class="small">Cuida las relaciones en <b>Sociedad → Otras polis</b>. Con un promedio menor que ${V.minimo} hay aislamiento y no llegarás a Polis.</p>
      <div class="phil"><b>Lo que enseña</b><br>${V.leccion}</div><button class="main" id="okB">Entendido</button>`);
    this.alCerrar = alTerminar; this.boton('okB', () => this.cerrarTarjeta());
  }
  // Fase 5: asentamiento informal nuevo: decidir qué hacer.
  asentamientoAnio(alTerminar0) {
    const S = this.S, a = (S.asent || []).find(x => x.nuevo), alTerminar = () => this.generacionAnio(alTerminar0);
    if (!a || !barriosActivos(S)) { alTerminar(); return; }
    this.tarjetaAsentamiento(a.i, alTerminar);
  }
  // Fase 5: nueva generación que juzga lo que recuerda.
  generacionAnio(alTerminar0) {
    const S = this.S, e = S.genEv, alTerminar = () => this.epocaAnio(alTerminar0);
    if (!e || !e.nuevo || !memoriaActiva(S)) { alTerminar(); return; }
    e.nuevo = false;
    const M = C.MEMORIA, T = M.textos, CAT = M.categorias;
    const lista = e.recuerdos.length ? e.recuerdos.map(r => `<li>${CAT[r.id].icono} ${CAT[r.id].nombre}: ${CAT[r.id].recuerdo}.</li>`).join('') : '<li>Casi nada: tu gobierno no dejó huellas.</li>';
    this.tarjeta(`<div class="big">👶</div><h3>Una nueva generación</h3><p>${T.generacion}</p><p><b>Lo que más recuerdan:</b></p><ul class="conds">${lista}</ul>
      <p class="${e.n > 0 ? 'pos' : e.n < 0 ? 'neg' : ''}">${e.n > 0 ? T.juicioBueno.replace('{n}', e.n) : e.n < 0 ? T.juicioMalo.replace('{n}', -e.n) : T.juicioNeutro}</p><p class="small">${T.olvida}</p>
      <div class="phil"><b>Lo que enseña</b><br>${M.leccion}</div><button class="main" id="okB">Continuar</button>`);
    this.alCerrar = alTerminar; this.boton('okB', () => this.cerrarTarjeta());
  }
  // Fase 5: comienza una nueva época visual.
  epocaAnio(alTerminar0) {
    const S = this.S, e = S.epocaEv, alTerminar = () => this.inventoAnio(alTerminar0);
    if (!e || !e.nuevo || !C.EPOCAS || !climaActivo(S)) { alTerminar(); return; }
    e.nuevo = false;
    const E = C.EPOCAS.eras[e.era];
    this.tarjeta(`<div class="big">${E.icono}</div><h3>Comienza la época del ${E.nombre.toLowerCase()}</h3><p>${E.texto}</p>
      <div class="phil"><b>Lo que enseña</b><br>${C.EPOCAS.leccion}</div><button class="main" id="okB">Continuar</button>`);
    this.alCerrar = alTerminar; this.boton('okB', () => this.cerrarTarjeta());
  }
  seccionLegado() {
    const S = this.S;
    if (!memoriaActiva(S)) return '';
    const R = recuerdos(S), tot = R.reduce((s, x) => s + x.n, 0) || 1, J = juicioHistoria(S), b = balanceMemoria(S);
    const filas = R.slice(0, 5).map(x => `<div class="causa"><span>${x.icono} ${x.nombre}</span><span class="barra"><i class="${x.peso >= 0 ? 'pos' : 'neg'}" style="width:${Math.round(x.n / tot * 100)}%"></i></span><b>${Math.round(x.n)}</b></div>`).join('');
    const E = C.EPOCAS ? C.EPOCAS.eras[epocaVisual(S)] : null;
    return `<h3>Legado</h3><p class="small">${E ? `${E.icono} Época del ${E.nombre.toLowerCase()}. ` : ''}Generación ${generacion(S) + 1}. La próxima llega en el año ${proximaGeneracion(S)} y juzgará lo que recuerde: hoy el juicio sería <b class="${b > .1 ? 'pos' : b < -.1 ? 'neg' : ''}">${b > .1 ? 'favorable' : b < -.1 ? 'desfavorable' : 'neutro'}</b>. Hoy te recordarían como <b>${J.titulo}</b>.</p>
      ${filas ? `<div class="causas">${filas}</div>` : '<p class="small">Todavía no hay recuerdos: cada decisión deja una huella.</p>'}
      <p class="small">Patrimonio (obras de más de ${C.MEMORIA.patrimonio} años): ${J.patrimonio}. Deuda que heredaría tu sucesor: ${J.deuda} de oro.</p>`;
  }
  tarjetaAsentamiento(i, alTerminar) {
    const S = this.S, A = C.BARRIOS.asentamiento, b = nombreBarrio(barrioDe(S, i)), g = costoLegalizar(S, i), caro = S.gold < g, a = asentamientoDe(S, i), n = a ? ranchos(a).length : 1;
    this.tarjeta(`<div class="big">🏚️</div><h3>Asentamiento informal en ${b}</h3><p>${A.texto}</p>${A.efectos ? `<p class="small neg">${n} ${n === 1 ? 'rancho' : 'ranchos'}. ${A.efectos} Si nadie lo resuelve, crece.</p>` : ''}
      <button class="opt" data-as="legalizar" ${caro ? 'disabled' : ''}><b>${A.legalizarTexto}</b><small>Cuesta ${g} de oro: las familias reciben títulos, agua y luz; ${n > 1 ? `los ${n} ranchos se vuelven casas del barrio` : 'el asentamiento se vuelve barrio'}.${caro ? ' No alcanza el oro.' : ''}</small></button>
      <button class="opt" data-as="desalojar"><b>${A.desalojar}</b><small>Recuperas el terreno, pero las familias quedan en la calle.</small></button>
      <button class="opt" data-as="ignorar"><b>${A.ignorar}</b><small>El asentamiento sigue y puede crecer: más evasión, deserción, violencia y brecha de género en el barrio. Puedes decidir después tocándolo en el mapa.</small></button>
      <div class="phil"><b>Lo que enseña</b><br>${A.leccion}</div>`, false);
    this.card.querySelectorAll('[data-as]').forEach(bt => bt.onclick = () => {
      const r = decidirAsentamiento(S, i, bt.dataset.as);
      if (r !== true) { if (r) this.toast(r); return; }
      this.toast({ legalizar: 'El asentamiento ahora es parte del barrio.', desalojar: 'Desalojo: las familias quedaron en la calle.', ignorar: 'El asentamiento sigue ahí.' }[bt.dataset.as]);
      this.mapa.refrescarCasilla(i); this.mapa.cambio(true); this.render();
      this.alCerrar = alTerminar || null; this.cerrarTarjeta();
    });
  }
  // Fase 5: cultura y deporte.
  seccionCultura() {
    const S = this.S;
    if (!culturaActiva(S) || S.stage < 1) return '';
    const K = C.CULTURA, c = counts(S), no = puedeFiesta(S);
    const lista = Object.entries(C.B).filter(([, b]) => b.cul).map(([k, b]) => `${b.e} ${c[k] || 0}`).join(' · ');
    return `<div class="cls otros"><div><div class="lab"><span>🎭 Cultura y deporte</span><span class="${S.expc > 0 ? 'neg' : ''}">${S.expc > 0 ? `−${S.expc} de ánimo` : 'sin exigencia'}</span></div>
      <p class="small">Con los años el pueblo pide sentido e identidad, no solo bienestar. La cultura calma ${Math.round(culturaTotal(S))} puntos de esa exigencia. ${lista}.</p>
      <button class="btn" data-fiesta ${no ? 'disabled' : ''}>🎉 ${fiestaDelPueblo(S).nombre} (${costoFiesta(S)} de oro)</button>
      <p class="small">${no || fiestaDelPueblo(S).texto} ${K.leccion}</p></div></div>`;
  }
  seccionBarrios() {
    const S = this.S, L = barrios(S);
    if (!L.length) return '';
    const P = C.BARRIOS.problemas;
    const filas = L.map(b => { const [k, v] = b.peor;
      return `<button class="sub" data-barrio="${b.id}" aria-label="${b.nombre}: ${b.casas} casas; problema mayor ${P[k].nombre} ${v}. Ver más"><span class="sn">🏘️ ${b.nombre} <small>${b.casas} casas${b.asent ? ' · 🏚️' : ''} · ${P[k].icono} ${P[k].nombre.toLowerCase()}</small></span><span class="track"><span class="fill" style="width:${v}%;background:${colorDe(100 - v)}"></span></span><b>${v}</b></button>`; }).join('');
    return `<div class="cls otros"><div><div class="lab"><span>Barrios</span></div><p class="small">Cada barrio con su problema más grave. Toca uno para ver todo y lanzar programas sociales. En el mapa, el botón ◎ muestra sus nombres.</p><div class="subs">${filas}</div></div></div>`;
  }
  explicarBarrio(id) {
    const S = this.S, b = barrios(S).find(x => x.id === id), K = C.BARRIOS;
    if (!b) return;
    const sv = b.servicios, pct = v => Math.round(v * 100) + '%';
    const progs = Object.entries(K.programas).map(([t, p]) => { const no = puedePrograma(S, id, t);
      return `<button class="opt" data-prog="${t}" ${no ? 'disabled' : ''}><b>${p.icono} ${p.nombre}</b><small>${p.texto} Cuesta ${costoPrograma(S, t)} de oro; dura ${p.anios} años.${no ? ` ${no}` : ''}</small></button>`; }).join('');
    this.tarjeta(`<h3>🏘️ ${b.nombre}</h3><p class="small">${b.casas} casas, unas ${b.gente} personas.${b.asent ? ` Hay ${b.asent} asentamiento${b.asent > 1 ? 's' : ''} informal${b.asent > 1 ? 'es' : ''}.` : ''}</p>
      <p class="small">Casas con servicio cerca: escuela ${pct(sv.escuela)}, hospital ${pct(sv.hospital)}, policía ${pct(sv.policia)}, mercado ${pct(sv.mercado)}.</p>
      <div class="causas">${Object.entries(b.problemas).map(([k, v]) => `<div class="causa"><span>${K.problemas[k].icono} ${K.problemas[k].nombre}</span><span class="barra"><i class="${v > K.efectos.umbral ? 'neg' : 'pos'}" style="width:${v}%"></i></span><b class="${v > K.efectos.umbral ? 'neg' : 'pos'}">${v}</b></div>`).join('')}</div>
      <p class="small">Suben con pocos servicios cerca, pobreza, inseguridad y asentamientos; bajan con escuelas, hospitales, policía, la ley de educación y los programas sociales. Por encima de ${K.efectos.umbral} pesan en la igualdad y la inseguridad del territorio.</p>
      <h2>Programas sociales</h2>${progs}
      <div class="phil"><b>Lo que enseña</b><br>${K.leccion}</div><button class="main" id="okB">Cerrar</button>`);
    this.boton('okB', () => this.cerrarTarjeta());
    this.card.querySelectorAll('[data-prog]').forEach(bt => bt.onclick = () => { if (iniciarPrograma(S, id, bt.dataset.prog)) { this.toast(`${K.programas[bt.dataset.prog].nombre} en ${b.nombre}.`); this.render(); this.explicarBarrio(id); } });
  }
  seccionVecinos() {
    const S = this.S;
    if (!vecinosActivos(S)) return '';
    const V = C.VECINOS, prom = Math.round(promedioRel(S));
    const filas = Object.entries(S.vecinos).map(([id, v]) => { const n = V.vecinos[id];
      return `<button class="sub" data-vecino="${id}" aria-label="${n.nombre}: relación ${Math.round(v.rel)}. Ver más"><span class="sn">${n.icono} ${n.nombre} <small>${this.estadoFrontera(id) || { aliado: 'aliado', hostil: 'hostil', neutral: v.tratado ? 'con tratado' : '' }[nivelVecino(v.rel)]}</small></span><span class="track"><span class="fill" style="width:${v.rel}%;background:${colorDe(v.rel)}"></span></span><b>${Math.round(v.rel)}</b></button>`; }).join('');
    return `<div class="cls otros"><div><div class="lab"><span>Otras polis</span><span class="${aislado(S) ? 'neg' : ''}">promedio ${prom}</span></div><p class="small">${aislado(S) ? `<b class="neg">${V.textos.aislamiento}</b>` : `Mínimo para llegar a Polis: ${V.minimo}.`} Comercio con los vecinos: ${Math.round(factorVecinos(S) * 100)}% en los ingresos de artesanos y élite.</p><div class="subs">${filas}</div></div></div>`;
  }
  explicarVecino(id) {
    const S = this.S, V = C.VECINOS, n = V.vecinos[id], v = S.vecinos[id], ten = tensiones(S, id);
    const boton = a => { const no = puedeAccion(S, id, a); return `<button class="opt" data-acc="${a}" ${no ? 'disabled' : ''}><b>${V.acciones[a].nombre}</b><small>${V.acciones[a].texto} Cuesta ${costoAccion(S, a)} de oro; relación +${V.acciones[a].relacion}.${no ? ` ${no}` : ''}</small></button>`; };
    this.tarjeta(`<h3>${n.icono} ${n.nombre}: relación ${Math.round(v.rel)}</h3><p class="small">${n.alcalde}. ${n.rasgo}</p>
      <p class="small"><b>Le agrada:</b> ${n.gusta}.</p>
      ${ten.length ? `<p>Este año la relación se mueve por:</p>${this.filasCausas(ten)}` : '<p class="small">Este año no hay tensiones: la relación vuelve poco a poco a lo normal.</p>'}
      <p class="small">Aliados (${V.aliado} o más) envían ayuda en las emergencias; hostiles (${V.hostil} o menos) bloquean el comercio.</p>
      ${boton('tratado')}${boton('visita')}${guerraActiva(S) ? `<button class="opt" id="fronB"><b>Frontera y guerra</b><small>${this.estadoFrontera(id) || 'Sin tensión'}. Tensión ${Math.round(v.tension || 0)} de ${C.GUERRA.tension.guerra}.</small></button>` : ''}
      <div class="phil"><b>Lo que enseña</b><br>${V.leccion}</div><button class="main" id="okB">Cerrar</button>`);
    this.boton('okB', () => this.cerrarTarjeta());
    this.boton('fronB', () => this.tarjetaFrontera(id));
    this.card.querySelectorAll('[data-acc]').forEach(b => b.onclick = () => { if (accionVecino(S, id, b.dataset.acc)) { this.toast(`${V.acciones[b.dataset.acc].nombre} con ${n.nombre}.`); this.render(); this.explicarVecino(id); } });
  }
  // ---------- Fase 10: la finca y sus cultivos ----------
  fichaFinca(i) {
    const S = this.S, x = S.map[i], cv = cultivoDe(x), D = datosCultivo(cv), p = produccionFinca(S, i), piso = nombrePiso(pisoTermico(S, i));
    const estado = produce(S, x) ? `Da ${Math.round(p.comida)} de alimento y ${Math.round(p.renta * S.price)} de oro al año.` : C.CULTIVOS.textos.madurando.replace('{anio}', anioCosecha(S, x));
    return el('div', { class: 'aporte', style: 'grid-column:1/-1' }, [
      el('span', { html: `<b>${D.icono} ${D.nombre}</b> en tierra ${piso}${tieneRiego(S, i) ? ', con riego' : ''}. ${estado} ${this.notaSuelo(i, cv)}` }),
      el('button', { class: 'btn', style: 'margin-top:6px', ...(S.over ? { disabled: '' } : {}), on: { click: () => this.tarjetaCultivo(i) } }, 'Cambiar de cultivo')
    ]);
  }
  // El suelo de una casilla, en una frase (y el aviso si la finca está en suelo equivocado).
  notaSuelo(i, cv) {
    const S = this.S; if (!suelosActivos(S)) return '';
    const c = claseSuelo(S, i), Q = datosSuelo(c), T = C.SUELOS.textos;
    return `<br>${Q.icono} <b>${mayus(Q.nombre)}.</b> ${Q.texto}${cv && suelaEquivocada(S, i, cv) ? ` <span class="neg">${T.equivocada.replace('{suelo}', Q.nombre)}</span>` : ''}`;
  }
  // Elegir qué sembrar: cada cultivo con su aptitud aquí, lo que da y lo que cuesta.
  tarjetaCultivo(i, alTerminar) {
    const S = this.S, x = S.map[i], K = C.CULTIVOS, piso = pisoTermico(S, i), sug = mejorCultivo(S, i, 'renta'), bonoRio = nearRiver(S, i) ? K.riego : 0;
    const fila = cv => {
      const D = datosCultivo(cv), a = aptitud(S, i, cv), no = puedeSembrar(S, i, cv), actual = x.cv === cv;
      const nivel = a >= 1 ? 'excelente aquí' : a >= .75 ? 'buena aquí' : a >= .4 ? 'regular aquí' : a > 0 ? 'mala aquí' : 'no se da aquí';
      const comida = D.comida ? Math.round((D.comida + bonoRio) * a) : 0; // junto al río, la comida rinde más
      return `<button class="opt${actual ? ' on' : ''}" data-cv="${cv}" ${no && !actual ? 'disabled' : ''}><b>${D.icono} ${D.nombre}</b> <small class="${a >= .75 ? 'pos' : a < .4 ? 'neg' : ''}">${mayus(nivel)}${actual ? ' · lo que siembra hoy' : ''}</small>
        <small>${D.texto}</small><small>Al año: ${D.comida ? `${comida} de alimento` : 'sin alimento'} · ${D.renta ? `unos ${Math.round(D.renta * a * S.price)} de oro` : 'sin oro'} · ${D.empleo} empleos · ambiente ${D.ambiente > 0 ? '+' : '−'}${Math.abs(D.ambiente).toLocaleString('es-CO')}${D.madura ? ` · primera cosecha en ${D.madura === 1 ? 'un año' : D.madura + ' años'}` : ''}${D.sequia ? ' · sufre con la sequía' : ''}${D.riego ? ' · pide riego' : ''}.</small>
        <small>${x.nueva ? 'La siembra va incluida en la finca nueva.' : `Sembrar cuesta ${costoSiembra(S, cv)} de oro.`}${no && !actual ? ` <span class="neg">${no}</span>` : ''}</small></button>`;
    };
    const orden = listaCultivos().sort((a, b) => aptitud(S, i, b) - aptitud(S, i, a));
    this.tarjeta(`<div class="big">🌱</div><h3>${K.textos.elegir}</h3><p class="small">Tierra ${nombrePiso(piso)}${tieneRiego(S, i) ? ', con riego' : ''}. ${K.textos.ayuda} Para ganar dinero, aquí rinde más: <b>${datosCultivo(sug).nombre.toLowerCase()}</b>.${this.notaSuelo(i, x.cv)}</p>
      ${orden.map(fila).join('')}<div class="phil"><b>Lo que enseña</b><br>${K.leccion}</div><button class="main" id="okB">${x.nueva ? `Dejar ${datosCultivo(cultivoDe(x)).nombre.toLowerCase()}` : 'Cerrar'}</button>`);
    this.alCerrar = alTerminar || null; this.boton('okB', () => this.cerrarTarjeta());
    this.card.querySelectorAll('[data-cv]').forEach(b => b.onclick = () => {
      const cv = b.dataset.cv;
      if (x.cv === cv) { this.cerrarTarjeta(); return; }
      if (!sembrar(S, i, cv)) return;
      const D = datosCultivo(cv);
      this.toast(K.textos.sembrado.replace('{cultivo}', D.nombre.toLowerCase()) + (D.madura ? ` ${K.textos.madurando.replace('{anio}', S.year + D.madura)}` : ''));
      this.mapa.refrescarCasilla(i); this.render();
      this.cerrarTarjeta();
    });
  }
  // ---------- Fase 11: la fábrica y sus productos ----------
  lineaInsumo(pr) {
    const T = C.INDUSTRIA.textos, D = datosProducto(pr);
    if (!D.insumo) return '';
    const I = insumo(this.S, pr);
    return T.insumo.replace('{insumo}', nombreInsumo(pr)).replace('{tiene}', I.tiene).replace('{necesita}', I.necesita);
  }
  fichaFabrica(i) {
    const S = this.S, x = S.map[i], pr = productoDe(x), D = datosProducto(pr), p = produccionFabrica(S, i), T = C.INDUSTRIA.textos;
    const estado = !p.encendida ? `<span class="neg">${T.energia}</span>` : `${T.ganancia.replace('{oro}', Math.round(p.renta * S.price))} y emplea ${p.empleo}. ${D.insumo ? (p.f < 1 ? `<span class="neg">${this.lineaInsumo(pr)}</span>` : this.lineaInsumo(pr)) : ''}${nearRiver(S, i) ? ` <span class="neg">${T.rio}</span>` : ''}`;
    const nv = nivelDe(x), N = datosNivel(nv), sig = datosNivel(nv + 1), no = puedeModernizar(S, i);
    const nivel = `${N.icono} ${T.nivel.replace('{nivel}', N.nombre.toLowerCase())}${sig ? ` <small>Siguiente: ${sig.nombre.toLowerCase()} — ${sig.texto}${no ? ` <span class="neg">${no}</span>` : ''}</small>` : ''}`;
    return el('div', { class: 'aporte', style: 'grid-column:1/-1' }, [
      el('span', { html: `<b>${D.icono} ${D.nombre}.</b> ${estado}<br>${nivel} ` }),
      el('button', { class: 'btn', style: 'margin-top:6px', ...(S.over ? { disabled: '' } : {}), on: { click: () => this.tarjetaProducto(i) } }, 'Cambiar de producto'),
      ...(sig && nivelDisponible(S, nv + 1) ? [el('button', { class: 'btn', style: 'margin:6px 0 0 6px', ...(S.over || no ? { disabled: '' } : {}), on: { click: () => {
        if (!modernizar(S, i)) return;
        this.toast(`${T.modernizada.replace('{nivel}', sig.nombre.toLowerCase())} ${T.nivelLeccion}`);
        this.mapa.refrescarCasilla(i); this.mapa.cambio(); this.render(); this.abrirFicha(i);
      } } }, T.modernizar.replace('{nivel}', sig.nombre.toLowerCase()).replace('{costo}', costoNivel(S, nv + 1)))] : [])
    ]);
  }
  // Elegir qué producir: cada producto con su materia prima, lo que deja y si ya está desbloqueado.
  tarjetaProducto(i, alTerminar) {
    const S = this.S, x = S.map[i], K = C.INDUSTRIA, T = K.textos, sug = mejorProducto(S, i);
    const fila = pr => {
      const D = datosProducto(pr), no = puedeProducir(S, i, pr), actual = productoDe(x) === pr, abierto = productoDisponible(S, pr);
      const I = insumo(S, pr), f = insumoSi(S, i, pr);
      return `<button class="opt${actual ? ' on' : ''}" data-pr="${pr}" ${no && !actual ? 'disabled' : ''}><b>${abierto ? D.icono : '🔒'} ${D.nombre}</b>${actual ? ' <small>· lo que produce hoy</small>' : ''}
        <small>${D.texto}</small>
        ${abierto ? `<small>${D.insumo ? `Necesita ${D.insumo.porFabrica} ${nombreInsumo(pr)} por fábrica; tienes ${I.tiene}. ` : ''}Al año: ${D.renta ? `hasta ${Math.round(D.renta * S.price)} de oro (hoy unos ${Math.round(D.renta * f * S.price)})` : 'casi sin ganancia'} · ${D.empleo} empleos · ambiente −${Math.abs(D.ambiente)}.</small>
        <small>${x.nuevaF ? 'El primer producto va incluido en la fábrica nueva.' : `Cambiar cuesta ${costoCambio(S)} de oro.`}${no && !actual && abierto ? ` <span class="neg">${no}</span>` : ''}</small>` : `<small class="neg">${T.bloqueado.replace('{req}', requisitoProducto(S, pr))}</small>`}</button>`;
    };
    this.tarjeta(`<div class="big">🏭</div><h3>${T.elegir}</h3><p class="small">${T.ayuda.replace('{costo}', costoCambio(S))}${sug !== 'artesanias' ? ` Con lo que tienes hoy, deja más: <b>${datosProducto(sug).nombre.toLowerCase()}</b>.` : ''}</p>
      ${listaProductos().map(fila).join('')}<div class="phil"><b>Lo que enseña</b><br>${K.leccion}</div><button class="main" id="okB">${x.nuevaF ? `Dejar ${datosProducto(productoDe(x)).nombre.toLowerCase()}` : 'Cerrar'}</button>`);
    this.alCerrar = alTerminar || null; this.boton('okB', () => { delete x.nuevaF; this.cerrarTarjeta(); });
    this.card.querySelectorAll('[data-pr]').forEach(b => b.onclick = () => {
      const pr = b.dataset.pr;
      if (productoDe(x) === pr) { delete x.nuevaF; this.cerrarTarjeta(); return; }
      if (!producir(S, i, pr)) return;
      this.toast(T.producido.replace('{producto}', datosProducto(pr).nombre.toLowerCase()));
      this.mapa.refrescarCasilla(i); this.render();
      this.cerrarTarjeta();
    });
  }
  seccionIndustria() {
    const S = this.S;
    if (!industriaActiva(S) || S.stage < 1) return '';
    const T = C.INDUSTRIA.textos, L = S.map.map((x, i) => x.b === 'taller' && !x.ob ? i : -1).filter(i => i >= 0);
    if (!L.length) return `<h3>${T.seccion}</h3><p class="small">${T.sinFabricas}</p>`;
    let total = 0;
    const filas = L.map(i => { const pr = productoDe(S.map[i]), D = datosProducto(pr), p = produccionFabrica(S, i), oro = Math.round(p.renta * S.price); total += oro;
      return `<tr><td>${D.icono} ${D.nombre}</td><td><small class="${!p.encendida || p.f < 1 ? 'neg' : ''}">${!p.encendida ? 'sin energía' : D.insumo ? `materia prima ${Math.round(p.f * 100)}%` : ''}</small></td><td>${oro}</td></tr>`; }).join('');
    const campo = fincasActivas(S) ? canastaOro(S).total : 0, pct = total + campo ? Math.round(total / (total + campo) * 100) : 0;
    const metal = L.some(i => productoDe(S.map[i]) === 'fundicion') ? `<p class="small">${T.metal} Hoy: ×${precioCiclo(S, 'fundicion').toLocaleString('es-CO')}.</p>` : '';
    const sal = Object.entries(C.INDUSTRIA.salarios).map(([k, v]) => `<button class="opt${salarioActual(S) === k ? ' on' : ''}" data-sal="${k}"><b>${v.nombre}</b><small>${v.texto} Ganancia ×${v.renta.toLocaleString('es-CO')}; ánimo de los obreros ${v.animo > 0 ? '+' : v.animo < 0 ? '−' : ''}${Math.abs(v.animo)}.</small></button>`).join('');
    return `<h3>${T.seccion}</h3><p class="small">${T.seccionAyuda}</p><div class="ledger"><table class="budget"><tr><th style="text-align:left">Fábrica</th><th></th><th>Oro al año</th></tr>${filas}<tr class="tot"><td>Total de la industria</td><td></td><td>${total}</td></tr></table></div>
      ${total + campo ? `<p class="small">${T.parte.replace('{pct}', pct)}</p>` : ''}${metal}<p class="small"><i>${C.INDUSTRIA.leccion}</i></p>
      <h3>${T.salarioTitulo}</h3><p class="small">${T.salarioAyuda}</p>${sal}<p class="small"><i>${T.salarioLeccion}</i></p>`;
  }
  // ---------- Fase 9: guerra con otra polis ----------
  estadoFrontera(id) {
    const S = this.S, v = S.vecinos[id], G = S.guerra, oc = ocupadasPor(S, id).length;
    if (!guerraActiva(S)) return '';
    if (G && G.activa && G.activa.id === id) return 'en guerra';
    if (G && G.tratado && G.tratado.id === id) return 'firmando la paz';
    if (oc) return `ocupa ${oc} casillas tuyas`;
    if (v.tropas) return 'tropas en el borde';
    if ((v.tension || 0) >= C.GUERRA.tension.incidente) return 'tensión en la frontera';
    return '';
  }
  // Ficha de la frontera: tensión, fuerzas, respuestas, declarar la guerra y recuperar tierras.
  tarjetaFrontera(id, alTerminar) {
    const S = this.S, Gk = C.GUERRA, n = C.VECINOS.vecinos[id], v = S.vecinos[id], ten = Math.round(v.tension || 0), W = S.guerra && S.guerra.activa;
    const resp = a => { const R = Gk.respuestas[a], no = puedeResponder(S, id, a); return `<button class="opt" data-resp="${a}" ${no ? 'disabled' : ''}><b>${R.nombre}</b><small>${R.texto} ${costoRespuesta(S, a) ? `Cuesta ${costoRespuesta(S, a)} de oro.` : ''} <i>${R.filosofia}</i>${no ? ` <span class="neg">${no}</span>` : ''}</small></button>`; };
    const noDec = puedeDeclarar(S, id), noRec = puedeRecuperar(S, id), oc = ocupadasPor(S, id).length;
    this.tarjeta(`<div class="big">⚔️</div><h3>Frontera con ${n.nombre}</h3>
      <p class="small">${this.estadoFrontera(id) ? `<b>${mayus(this.estadoFrontera(id))}.</b> ` : ''}Relación ${Math.round(v.rel)}. Tensión ${ten} de ${Gk.tension.guerra}: sube cada año mientras la relación sea hostil (${C.VECINOS.hostil} o menos). En ${Gk.tension.tropas} acampan tropas en el borde; en ${Gk.tension.guerra} hay guerra.</p>
      <div class="track"><div class="fill" style="width:${Math.min(100, ten / Gk.tension.guerra * 100)}%;background:${colorDe(100 - ten)}"></div></div>
      <p><b>Tu fuerza: ${fuerzaPropia(S)}</b> · Fuerza de ${n.nombre}: ${fuerzaVecino(S, id)}</p>${this.filasCausas(partesFuerza(S))}
      ${W ? `<p class="small">Guerra en curso con ${C.VECINOS.vecinos[W.id].nombre}: año ${W.anios + 1}, frente ${W.frente > 0 ? 'a tu favor' : W.frente < 0 ? 'en contra' : 'parejo'}.</p>` : `${resp('negociar')}${resp('mediacion')}${resp('preparar')}${resp('ultimatum')}`}
      ${oc ? `<button class="opt" id="recB" ${noRec ? 'disabled' : ''}><b>${Gk.recuperar.nombre}</b><small>${Gk.recuperar.texto} Cuesta ${costoRecuperar(S)} de oro.${noRec ? ` <span class="neg">${noRec}</span>` : ''}</small></button>` : ''}
      <button class="opt" id="decB" ${noDec ? 'disabled' : ''}><b>Declarar la guerra</b><small>${Gk.declarar.texto} ${noDec ? `<span class="neg">${noDec}</span>` : `Costo: −${costoDeclarar(S, id)} de legitimidad${costoDeclarar(S, id) ? '' : ' (causa justa: recuperar lo tuyo)'}.`}</small></button>
      <div class="phil"><b>Lo que enseña</b><br>${Gk.leccion}</div><button class="main" id="okB">${alTerminar ? 'Decidir después' : 'Cerrar'}</button>`);
    this.alCerrar = alTerminar || null; this.boton('okB', () => this.cerrarTarjeta());
    this.card.querySelectorAll('[data-resp]').forEach(b => b.onclick = () => { const t = responder(S, id, b.dataset.resp); if (t) { this.toast(t); this.mapa.cambio(true); this.tarjetaFrontera(id, alTerminar); } });
    this.boton('recB', () => { if (recuperarTierras(S, id)) { this.toast(C.GUERRA.textos.recuperas.replace('{vecino}', n.nombre)); this.mapa.cambio(true); this.tarjetaFrontera(id, alTerminar); } });
    this.boton('decB', () => {
      if (!declararGuerra(S, id)) return;
      this.alCerrar = null; this.cerrarTarjeta(); this.mapa.cambio(true);
      this.guerraAnio(alTerminar || (() => this.render())); // escena del asedio y la carta de la guerra
    });
  }
  // Cartas de la guerra al cerrar el año (y al declararla): incidente, tropas, inicio, años de guerra y la paz.
  guerraAnio(alTerminar) {
    const S = this.S, Gk = C.GUERRA, L = S.guerraEv || [], e = L.find(x => x.nuevo), sigue = () => this.guerraAnio(alTerminar);
    if (!guerraActiva(S)) { S.guerraEv = []; alTerminar(); return; }
    if (!e) {
      S.guerraEv = [];
      const T = estadoGuerra(S).tratado;
      if (T) { if (this.escena('paz', T, sigue, { vecino: C.VECINOS.vecinos[T.id].nombre, id: T.id })) return; this.tarjetaTratado(alTerminar); return; }
      alTerminar(); return;
    }
    const n = C.VECINOS.vecinos[e.id], T = Gk.textos, nom = n.nombre;
    if ((e.tipo === 'guerra' || e.tipo === 'declaras') && this.escena('asedio', e, sigue, { vecino: nom, id: e.id })) return;
    e.nuevo = false;
    if (e.tipo === 'tropas') { this.tarjetaFrontera(e.id, sigue); return; }
    if (e.tipo === 'fin') { sigue(); return; }
    let html;
    if (e.tipo === 'incidente') html = `<div class="big">🚩</div><h3>Incidente en la frontera</h3><p>${T.incidente.replace('{vecino}', nom)}</p><p class="small">Mejora la relación con ${nom} (tratado, visita) o responde a la tensión en <b>Sociedad → Otras polis → ${nom} → Frontera y guerra</b>.</p>`;
    else if (e.tipo === 'guerra' || e.tipo === 'declaras') html = `<div class="big">⚔️</div><h3>${e.tipo === 'guerra' ? `${nom} te declara la guerra` : `Guerra contra ${nom}`}</h3><p>${e.tipo === 'guerra' ? 'La tensión se desbordó: sus tropas cruzan el borde.' : T.declaras.replace('{vecino}', nom)}</p>
      <p class="small">Cada año de guerra: −${Math.round(Gk.costos.oro * S.price)} de oro, −${Math.round(Gk.costos.poblacion * 100)}% de habitantes, menos comida y ánimo, comercio cortado con ${nom} y obras dañadas cerca de su borde. Quien pierde el frente pierde casillas del borde. Dura hasta ${Gk.aniosMax} años.</p>
      <p><b>Tu fuerza: ${fuerzaPropia(S)}</b> · ${nom}: ${fuerzaVecino(S, e.id)}</p>${this.filasCausas(partesFuerza(S))}<p class="small">Sube tu fuerza con el Ejército (cuartel y gasto militar), la legitimidad, los aliados y fortificando la frontera.</p>`;
    else if (e.tipo === 'anio') html = `<div class="big">${e.avanza ? '🛡️' : '🔥'}</div><h3>Un año de guerra con ${nom}</h3><p>${e.avanza ? 'Tus tropas ganan terreno.' : 'El enemigo avanza.'} Frente: ${['muy en contra', 'en contra', 'parejo', 'a tu favor', 'muy a tu favor'][e.frente + 2]}.</p>
      ${e.ocupa ? `<p class="neg"><b>${T.ocupa.replace('{vecino}', nom).replace('{n}', e.ocupa)}</b> No rinden ni se puede construir en ellas hasta recuperarlas.</p>` : ''}${e.recupera ? `<p class="pos"><b>${T.recuperas.replace('{vecino}', nom)}</b></p>` : ''}
      <p class="small">El asedio costó oro, habitantes, comida y ánimo, y dañó obras cerca del borde (repáralas tocándolas).</p>`;
    this.tarjeta(`${html}<div class="phil"><b>Lo que enseña</b><br>${Gk.leccion}</div><button class="main" id="okB">Continuar</button>`);
    this.alCerrar = sigue; this.boton('okB', () => this.cerrarTarjeta());
  }
  tarjetaTratado(alTerminar) {
    const S = this.S, Gk = C.GUERRA, T = estadoGuerra(S).tratado, nom = C.VECINOS.vecinos[T.id].nombre;
    const tit = { ganas: `Ganaste la guerra contra ${nom}`, pierdes: `Perdiste la guerra contra ${nom}`, empate: `La guerra con ${nom} queda en tablas` }[T.resultado];
    const ops = opcionesTratado(S).map(o => { const X = Gk.tratados[o], c = costoTratado(S, o); return `<button class="opt" data-tr="${o}" ${c > S.gold && o !== 'rendicion' ? 'disabled' : ''}><b>${X.nombre}</b><small>${X.texto}${c ? ` Cuesta ${c} de oro.` : ''}${X.tributo && o === 'impuesta' ? ` Recibes ${Math.round(X.tributo * S.price)} de oro.` : ''} <i>${X.filosofia}</i></small></button>`; }).join('');
    this.tarjeta(`<div class="big">🕊️</div><h3>${tit}</h3><p>Hay que firmar la paz. Lo que acuerdes marcará la relación con ${nom} por muchos años.</p>${ops}<div class="phil"><b>Lo que enseña</b><br>${Gk.tratados.justa.filosofia}</div>`, false);
    this.card.querySelectorAll('[data-tr]').forEach(b => b.onclick = () => {
      if (!firmarTratado(S, b.dataset.tr)) return;
      this.toast(`${Gk.tratados[b.dataset.tr].nombre} con ${nom}.`);
      this.mapa.cambio(true); this.render();
      this.alCerrar = alTerminar; this.cerrarTarjeta();
    });
  }
  seccionConflicto() {
    const S = this.S;
    if (!conflictoActivo(S)) return '';
    const F = conflicto(S), v = Math.round(F.nivel), E = C.CONF.estrategias[F.estrategia];
    return `<div class="cls otros"><div><div class="lab"><span>⛺ Conflicto armado</span><span>${v}</span></div><div class="track"><div class="fill" style="width:${v}%;background:${colorDe(100 - v)}"></div></div>
      <p class="small">${F.grupo ? `<b class="neg">${mayus(C.CONF.grupo)} está en las veredas.</b> Estrategia: ${E.icono} ${E.nombre}.` : `Con ${C.CONF.aparece} aparece un grupo armado. Crece donde el Estado no llega.`}</p><button class="btn porque" data-conflicto>${F.grupo ? 'Estrategia y causas' : '¿Por qué? Ver causas'}</button></div></div>`;
  }
  explicarConflicto() {
    const S = this.S, F = conflicto(S), K = C.CONF;
    const estr = F.grupo ? `<h2>Estrategia</h2>${Object.entries(K.estrategias).map(([id, E]) => { const no = puedeEstrategia(S, id);
      return `<button class="opt ${F.estrategia === id ? 'on' : ''}" data-estr="${id}" ${no ? 'disabled' : ''}><b>${E.icono} ${E.nombre}</b><small>${E.texto}${E.oro ? ` Cuesta unos ${Math.round(E.oro * S.price)} de oro al año.` : ''}${no ? ` ${no}` : ''}</small></button>`; }).join('')}` : '';
    this.tarjeta(`<h3>⛺ Conflicto armado: ${Math.round(F.nivel)}</h3><p>${F.grupo ? `${mayus(K.grupo)} está en las veredas.` : 'Todavía no hay un grupo armado.'} El conflicto tiende a <b>${Math.round(metaConflicto(S))}</b>. Así se calcula:</p>
      ${this.filasCausas(partesConflicto(S).filter(x => Math.abs(x[1]) >= .5).map(([t, v]) => [t, Math.round(v * 10) / 10]))}${estr}
      <div class="phil"><b>Lo que enseña</b><br>${K.leccion}</div><button class="main" id="okB">Cerrar</button>`);
    this.boton('okB', () => this.cerrarTarjeta());
    this.card.querySelectorAll('[data-estr]').forEach(b => b.onclick = () => { if (elegirEstrategia(S, b.dataset.estr)) { this.toast(`Estrategia: ${K.estrategias[b.dataset.estr].nombre}.`); this.render(); this.explicarConflicto(); } });
  }
  // Fase 6: riesgo de que el río cambie de curso (depende del bosque y la erosión de las orillas).
  lineaRio() {
    const S = this.S;
    if (!rioActivo(S)) return '';
    const R = C.RIO, E = estadoOrillas(S), p = probCambio(S, false), nivel = p >= .35 ? 'alto' : p >= .15 ? 'medio' : p > 0 ? 'bajo' : 'ninguno por ahora';
    return `<p class="small">🌊 ${R.textos.riesgoNina}: riesgo <b>${nivel}</b>. Orillas con su vegetación: ${Math.round(E.protegida * 100)}%; obras en la ronda del río: ${E.obras}. ${R.textos.prevenir}</p>`;
  }
  // Fase 7: epidemias, avenidas y cambio climático en el riesgo de desastres.
  lineasAmenazas() {
    const S = this.S;
    if (!amenazasActivas(S)) return '';
    const K = C.AMENAZAS, E = K.epidemia, v = S.amen && S.amen.vigilancia, t = tipoEpidemia(S), p = probAvenida(S), f = factorClimatico(S);
    return `<p class="small">${t.icono} ${E.riesgo} Si hoy llegara (${t.nombre.toLowerCase()}), se perdería cerca del <b>${Math.round(perdidaEpidemia(S) * 100)}%</b> de la población. ${v ? `${E.vigilancia.nombre}: <b>lista</b>.` : `${E.vigilancia.nombre}: ${E.vigilancia.texto}`}</p>
      ${v ? '' : `<button class="btn" data-vigilancia ${puedeVigilancia(S) ? 'disabled' : ''}>Crear la vigilancia (${costoVigilancia(S)} de oro)</button>`}
      ${p ? `<p class="small">${K.avenida.icono} ${K.avenida.riesgo}: hoy <b>${Math.round(riesgoLaderas(S) * 100)}%</b> de las laderas; riesgo ${p >= .07 ? 'alto' : p >= .045 ? 'medio' : 'bajo'}.</p>` : ''}
      ${f > 1 ? `<p class="small">🌡️ ${K.clima.texto} Hoy son <b>${Math.round((f - 1) * 100)}%</b> más probables que al comienzo.</p>` : ''}`;
  }
  seccionRiesgo() {
    const S = this.S;
    if (!desastresActivos(S) || S.stage < 1) return '';
    const VD = C.DESASTRES.volcan, n = nivelVolcan(S), N = VD.niveles[n], no = puedePlan(S);
    return `<h3>Riesgo de desastres</h3><p class="small">🌋 ${VD.nombre}: alerta <b>${N.nombre.toLowerCase()}</b> ${N.icono}. ${N.texto} ${volcan(S).plan ? 'Plan de evacuación: <b>listo</b>.' : n ? `Plan de evacuación: <b>sin preparar</b> (${costoPlan(S)} de oro).` : ''}</p>
      ${n && !volcan(S).plan ? `<button class="btn" data-plan ${no ? 'disabled' : ''}>Preparar el plan de evacuación</button>` : ''}
      ${this.lineaRio()}${this.lineasAmenazas()}<p class="small">🏚️ Terremotos: no se pueden predecir. ${hasLaw(S, 'sismo') ? 'El código sismorresistente está vigente.' : 'Prepárate con el código sismorresistente (Leyes), el mantenimiento de las obras y el fondo de emergencias.'}</p>`;
  }
  seccionFiguras() {
    const S = this.S, P = presentes(S).filter(id => estadoFig(S, id).visto);
    if (!P.length) return '';
    const filas = P.map(id => { const f = C.FIG.figuras[id], e = estadoFig(S, id), m = misionDe(S, id);
      return `<button class="sub fig" data-fig="${id}" aria-label="${f.nombre}: relación ${Math.round(e.rel)}. Ver más">
        <span class="sn"><img src="${retratoFig(id, f.retrato, gestoDe(e.rel))}" alt=""> ${f.nombre} <small>${m ? `misión hasta el año ${m.limite}` : f.rol}</small></span><span class="track"><span class="fill" style="width:${e.rel}%;background:${colorDe(e.rel)}"></span></span><b>${Math.round(e.rel)}</b></button>`; }).join('');
    return `<div class="cls otros"><div><div class="lab"><span>Personajes</span></div><p class="small">Su relación contigo sube o baja según lo que haces. Con relación alta te ayudan; con relación baja, te complican.</p><div class="subs">${filas}</div></div></div>`;
  }
  explicarFigura(id) {
    const S = this.S, f = C.FIG.figuras[id], e = estadoFig(S, id), n = nivelRel(e.rel), m = misionDe(S, id), M = C.FIG.motivos;
    const gusta = Object.entries(f.reacciones).filter(([, v]) => v > 0).map(([k]) => M[k]), molesta = Object.entries(f.reacciones).filter(([, v]) => v < 0).map(([k]) => M[k]);
    this.tarjeta(`<div class="fig-cab"><img src="${retratoFig(id, f.retrato, gestoDe(e.rel))}" alt=""><div><h3>${f.nombre}</h3><p class="small">${f.rol} · relación ${Math.round(e.rel)} (${n})</p></div></div>
      <p>“${f.presentacion}”</p>
      ${m ? `<div class="porque-afecta"><b>Misión:</b> ${m.texto} Plazo: año ${m.limite}. Cumplirla sube la relación ${C.FIG.premioMision}; fallarla la baja ${C.FIG.castigoMision}.</div>` : '<p class="small">Por ahora no tiene encargos para ti.</p>'}
      ${gusta.length ? `<p class="small"><b>Le agrada:</b> ${gusta.join('; ')}.</p>` : ''}${molesta.length ? `<p class="small"><b>Le molesta:</b> ${molesta.join('; ')}.</p>` : ''}
      <p class="small"><b>Con relación alta (${C.FIG.alta} o más):</b> ${f.alta.texto}<br><b>Con relación baja (${C.FIG.baja} o menos):</b> ${f.baja.texto}</p>
      <div class="phil"><b>Lo que enseña</b><br>${C.FIG.leccion}</div><button class="main" id="okB">Cerrar</button>`);
    this.boton('okB', () => this.cerrarTarjeta());
  }
  // Fase 4: seguridad en Sociedad: inseguridad, sus causas y los riesgos de sucesos de este año.
  seccionSeguridad() {
    const S = this.S;
    if (!sucesosActivos(S)) return '';
    const v = Math.round(inseguridad(S));
    return `<div class="cls otros"><div><div class="lab"><span>🚓 Inseguridad</span><span>${v}</span></div><div class="track"><div class="fill" style="width:${v}%;background:${colorDe(100 - v)}"></div></div>
      <p class="small">Sube con desempleo, desigualdad, pobreza y poca legitimidad; baja con policía, escuelas y parques.</p><button class="btn porque" data-seguridad>¿Por qué? Ver causas</button></div></div>`;
  }
  explicarSeguridad() {
    const S = this.S, R = riesgos(S), Q = C.SUCESOS.sucesos, nivel = p => p >= .2 ? 'alto' : p >= .08 ? 'medio' : p > 0 ? 'bajo' : 'ninguno';
    this.tarjeta(`<h3>🚓 Inseguridad: ${Math.round(inseguridad(S))}</h3><p>Mide qué tan expuesto está el territorio a robos y atentados. Así se calcula:</p>
      ${this.filasCausas(partesInseguridad(S).filter(x => Math.abs(x[1]) >= .5).map(([t, v]) => [t, Math.round(v * 10) / 10]))}
      <h2>Riesgo de sucesos este año</h2>${Object.entries(R).map(([k, p]) => `<p class="small">${Q[k].icono} <b>${Q[k].titulo}</b>: riesgo ${nivel(p)}. ${Q[k].prevenir}</p>`).join('')}
      <div class="phil"><b>Lo que enseña</b><br>${C.SUCESOS.leccion}</div><button class="main" id="okB">Cerrar</button>`);
    this.boton('okB', () => this.cerrarTarjeta());
  }
  // Fase 13: una carta de una familia del pueblo (papel, viñeta, firma, frase para pensar y recuerdo).
  carta(alTerminar) {
    const S = this.S, e = S.cartaEv;
    if (!e || !e.nuevo || !familiasActivas(S) || e.anio !== S.year - 1) { if (alTerminar) alTerminar(); return; }
    e.nuevo = false;
    this.tarjetaCarta(e, alTerminar);
  }
  tarjetaCarta(r, alTerminar, reabrir) {
    const S = this.S, T = C.FAMILIAS.textos, c = cartaRecibida(r), F = datosFamilia(c.familia), O = c.objeto ? datosObjeto(c.objeto) : null;
    this.tarjeta(`<img class="vig" src="${vineta(c.escena || 'default', S.reg, S.stage)}" alt="">
      <div class="carta-cab"><span>${F.icono} ${F.nombre}</span><span>${T.anio.replace('{anio}', c.anio)}</span></div>
      <h3>${T.de.replace('{quien}', c.de)}</h3><div class="carta-texto"><p>${c.texto}</p><p class="firma">— ${c.de}</p></div>
      <div class="phil"><b>${T.pensar}</b><br>${c.frase}</div>
      ${O ? `<div class="carta-objeto"><span class="big-emo">${O.icono}</span><div><b>${T.recuerdo}: ${O.nombre}</b><small>${O.texto}</small></div></div>` : ''}
      <button class="main" id="okB">${reabrir ? 'Cerrar' : O ? T.guardar : 'Continuar'}</button>`, !!reabrir);
    this.card.classList.add('carta');
    if (!reabrir) Sonido.carta();
    this.alCerrar = alTerminar || null; this.boton('okB', () => this.cerrarTarjeta());
  }
  // Fase 13: el álbum de las familias (Crónica): cada familia con su gente y sus cartas, y los recuerdos.
  seccionAlbum() {
    const S = this.S;
    if (!familiasActivas(S)) return '';
    const T = C.FAMILIAS.textos, E = estadoFamilias(S), R = cartasRecibidas(S);
    if (!R.length) return `<h3>📬 ${T.album}</h3><p class="small">${T.sinCartas}</p>`;
    const marca = { vive: '', murio: ' <span class="neg">† (año {a})</span>', sefue: ' <span class="small">(se fue, año {a})</span>' };
    const fams = listaFamilias().map(f => {
      const F = datosFamilia(f), mias = R.filter(c => c.familia === f);
      if (!mias.length) return '';
      const gente = miembrosFamilia(S, f).map(m => `<li>${m.nombre}${(marca[m.estado] || '').replace('{a}', m.anio)}</li>`).join('');
      const cartas = mias.map(c => `<button class="btn" data-carta="${c.n}">✉️ Año ${c.anio} · ${c.de}</button>`).join('');
      return `<details class="familia"><summary><b>${F.icono} ${F.nombre}</b> <small>(${mias.length} ${mias.length === 1 ? 'carta' : 'cartas'})</small></summary><p class="small">${F.origen}</p><ul class="conds">${gente}</ul><div class="av-hem">${cartas}</div></details>`;
    }).join('');
    const objs = listaObjetos().map(o => { const O = datosObjeto(o), tiene = E.objetos[o] !== undefined;
      return `<button class="objeto${tiene ? '' : ' falta'}" ${tiene ? `data-objeto="${o}"` : 'disabled'} title="${tiene ? O.nombre : '?'}"><span>${tiene ? O.icono : '?'}</span><small>${tiene ? O.nombre : 'Por descubrir'}</small></button>`; }).join('');
    return `<h3>📬 ${T.album}</h3><p class="small">${T.albumAyuda}</p>${fams}<h3>🗝️ ${T.objetos} (${Object.keys(E.objetos).length} de ${listaObjetos().length})</h3><div class="objetos">${objs}</div>`;
  }
  // Fase 11: El Pregonero. Los avances del año salen en un periódico que se despliega desde arriba, con su sonido.
  periodico(ed, alTerminar, reabrir) {
    const S = this.S, P = C.AVANCES.periodico, cab = cabecera(S), L = ed.ids.map(datosAvance).filter(Boolean);
    if (!L.length) { if (alTerminar) alTerminar(); return; }
    const [a, ...otros] = L, q = a.cuando || {};
    const obras = q.etapa ? obrasDeEtapa(q.etapa) : [];
    const ep = !reabrir && historiaActiva(S) ? datosEpoca(epocaHistorica(S)) : null;
    const leccion = q.etapa ? C.STAGES[q.etapa].lesson : q.invento ? C.TEC.leccion : a.leccion || C.AVANCES.leccion;
    const nota = x => `<article><h4>${x.icono} ${x.titular}</h4><p>${x.texto}</p></article>`;
    const breves = ed.breves && ed.breves.length ? `<article class="pe-breves"><h4>${P.breves}</h4><ul>${ed.breves.map(t => `<li>${t}</li>`).join('')}</ul></article>` : '';
    this.tarjeta(`<header class="pe-cab"><div class="pe-linea"><span>Año ${ed.anio}${ep ? ` · ${ep.nombre}` : ''}</span><span>${P.edicion.replace('{n}', ed.n)}</span><span>${cab.precio}</span></div>
      <h2 class="pe-nombre">${cab.nombre}</h2><div class="pe-sub">${cab.sub} — <i>${P.lema}</i></div></header>
      <div class="pe-extra">${P.extra}</div>
      <article class="pe-princ"><div class="pe-grabado" aria-hidden="true">${a.icono}</div><h3 class="pe-titular">${a.titular}</h3><p class="pe-bajada">${a.texto}</p>
        ${obras.length ? `<div class="pe-obras"><b>${P.nuevasObras}:</b>${obras.map(k => `<span><img src="${this.icono(k)}" alt="">${this.nombre(k)}</span>`).join('')}</div>` : ''}
        ${a.tambien ? `<p class="pe-tambien"><b>${P.tambien}:</b> ${a.tambien.join('; ')}.</p>` : ''}</article>
      ${otros.length || breves ? `<div class="pe-cols">${otros.map(nota).join('')}${breves}</div>` : ''}
      <div class="pe-edit"><b>${P.editorial}</b><p>${leccion}</p></div>
      <button class="main" id="okB">${reabrir ? P.cerrar : P.seguir}</button>`, !!reabrir);
    this.card.classList.add('periodico'); this.velo.classList.add('con-periodico');
    if (!reabrir) Sonido.prensa();
    this.alCerrar = alTerminar || null; this.boton('okB', () => this.cerrarTarjeta());
  }
  // Fase 11: el camino de avances y la hemeroteca (en la Crónica).
  seccionAvances() {
    const S = this.S;
    if (!avancesActivos(S) || !S.avances) return '';
    const T = C.AVANCES.textos, K = caminoAvances(S), eds = estadoAvances(S).ediciones;
    const hecho = a => `<li class="av-ok"><span class="av-ico">${a.icono}</span><b>${a.nombre}</b><small>${a.anio > 0 ? T.logrado.replace('{anio}', a.anio) : T.desdeInicio}</small></li>`;
    const viene = a => `<li class="av-prox"><span class="av-ico">${a.icono}</span><b>${a.nombre}</b><small>${T.pide.replace('{req}', requisitoAvance(a, S))}</small></li>`;
    const hem = eds.length ? `<div class="av-hem">${eds.slice().reverse().map(e => `<button class="btn" data-ed="${e.n}">Año ${e.anio} · ${datosAvance(e.ids[0]).titular}</button>`).join('')}</div>` : `<p class="small">${T.sinEdiciones}</p>`;
    return `<h3>${T.titulo}</h3><p class="small">${T.ayuda}</p><ol class="avances">${K.logrados.map(hecho).join('')}${K.proximos.map(viene).join('')}${K.ocultos ? `<li class="av-oculto"><span class="av-ico">❔</span><small>${T.porDescubrir.replace('{n}', K.ocultos)}</small></li>` : ''}</ol>
      <h3>📰 ${T.hemeroteca}</h3><p class="small">${T.hemerotecaAyuda}</p>${hem}`;
  }
  etapa(alTerminar) {
    const S = this.S, st = C.STAGES[S.stage];
    const nuevas = Object.entries(C.B).filter(([, b]) => b.st === S.stage).map(([k, b]) => `${b.e} ${k === 'agora' ? seatName(S) : b.n}`).join(', ');
    this.tarjeta(`<div class="big">🎉</div><h3>Tu territorio es ahora ${st.n}</h3><p>${st.lesson}</p>${nuevas ? `<p><b>Nuevas construcciones:</b> ${nuevas}.</p>` : ''}<button class="main" id="okB">Seguir gobernando</button>`);
    this.alCerrar = alTerminar; this.boton('okB', () => this.cerrarTarjeta());
  }
  cambioRegimen(ch, alTerminar) {
    const REG = C.REG;
    const T = { cor: `${REG[ch.from].n} se corrompió en ${REG[ch.to].n}`, rev: `Revolución: cae ${REG[ch.from].n}`, ref: `Reforma: vuelve ${REG[ch.to].n}`, golpe: `Golpe de Estado: el Ejército derroca a ${REG[ch.from].n}` }[ch.type];
    const L = {
      cor: 'Aristóteles distinguía las formas rectas, que gobiernan para el bien común, de sus desviaciones, que gobiernan para el interés propio. Tus decisiones inclinaron el poder hacia una facción.',
      rev: 'Polibio describió un ciclo: cada forma corrupta provoca la reacción que la derriba y da paso a la siguiente forma recta. La revolución costó oro y vidas.',
      ref: 'Un gobierno desviado puede enderezarse cuando vuelve a servir al bien común. Lo lograste sin revolución.',
      golpe: C.EJERCITO.leccion + ' Un Ejército descontento frente a un gobierno sin legitimidad tomó el poder por la fuerza.'
    }[ch.type];
    this.tarjeta(`<div class="regh" style="--rc:${REG[ch.to].col}">${EMB[ch.to]}</div><h3>${T}</h3><div class="phil"><b>${ch.type === 'rev' ? 'Polibio' : ch.type === 'golpe' ? 'Relaciones cívico-militares' : 'Aristóteles'}</b><br>${L}</div>
      <p><b>Ahora gobierna: ${REG[ch.to].n}.</b> ${REG[ch.to].d}</p><button class="main" id="okB">Continuar</button>`);
    this.alCerrar = alTerminar; this.boton('okB', () => this.cerrarTarjeta());
  }
  infoRegimen() {
    const S = this.S, R0 = RG(S), c = Math.round(S.corr), REG = C.REG;
    this.tarjeta(`<div class="regh" style="--rc:${R0.col}">${EMB[S.reg]}</div><h3>${R0.n}</h3><p>${R0.d}</p>
      <p class="small">Tu cargo: ${R0.t}. Sede: ${seatName(S)}.</p>
      ${R0.v && climaActivo(S) ? `<p><b>Ventaja:</b> ${R0.v}</p>` : ''}
      <h2>Rumbo del gobierno</h2><div class="rumbo"><div style="width:${c}%"></div></div><div class="rlab"><span>Bien común</span><span>Interés propio</span></div>
      <p class="small">${R0.rect ? `Si llega a 70, ${R0.n.toLowerCase()} se corrompe en ${REG[R0.cor].n.toLowerCase()}.` : `Si baja a 20, puedes reformarlo. Si la legitimidad se hunde, estalla una revolución y llega ${REG[R0.cyc].n.toLowerCase()}.`}
      Sube al elegir por conveniencia o represión, al incumplir promesas y al abandonar a una clase. Baja al actuar por deber, justicia o prudencia y al cumplirle al pueblo.</p>
      <p class="small">Ciclo de Polibio: ${C.CYCLE.map(k => k === S.reg ? `<b>${REG[k].n}</b>` : REG[k].n).join(', ')}.</p>
      ${this.seccionActa()}
      <button class="main" id="okB">Cerrar</button>`);
    this.boton('okB', () => this.cerrarTarjeta());
  }
  // Revisa logros nuevos; devuelve la lista (y avisa si no es el final de la partida).
  logros(end) {
    const g = logrosGanados(), nu = logrosNuevos(this.S, g, end);
    if (nu.length) { guardarLogros(g); if (!end) this.toast('Logro: ' + nu.map(a => a.n).join(', ')); }
    return nu;
  }
  alternarSonido() {
    if (Sonido.on) Sonido.stop(); else Sonido.start();
    guardarSonido(Sonido.on); this.render();
  }
  // Fase 5: juicio de la historia y herencia al sucesor (Hans Jonas).
  juicioFinal() {
    const S = this.S;
    if (!memoriaActiva(S)) return '';
    const J = juicioHistoria(S), M = C.MEMORIA;
    return `<h2>El juicio de la historia</h2><p>Te recordarán como <b>${J.titulo}</b>.</p>
      ${J.recuerdos.length ? `<ul class="conds">${J.recuerdos.map(r => `<li class="${r.peso >= 0 ? 'pos' : 'neg'}">${r.icono} ${r.nombre}: ${r.recuerdo}.</li>`).join('')}</ul>` : ''}
      <p class="small">Atravesaste ${J.crisis === 1 ? 'una crisis mayor' : `${J.crisis} crisis mayores`} y ${J.generaciones === 1 ? 'un relevo' : `${J.generaciones} relevos`} de generación. ${J.patrimonio === 1 ? 'Dejas una obra patrimonial.' : `Dejas ${J.patrimonio} obras patrimoniales.`}</p>
      <p class="small"><b>Lo que hereda tu sucesor:</b> ${J.deuda} de oro de deuda${J.erosion ? ` y ${J.erosion} casillas de suelo erosionado` : ''}. ${M.jonas}</p>${this.legadoCivico()}${this.epilogoFamilias()}`;
  }
  // Fase 12: el juicio de la historia también recuerda la identidad del pueblo y sus leyes.
  // Fase 13: qué fue de las familias.
  epilogoFamilias() {
    const S = this.S, L = epilogo(S), T = C.FAMILIAS && C.FAMILIAS.textos;
    if (!L.length) return '';
    return `<h2>${T.epilogo}</h2><p class="small">${T.epilogoAyuda}</p>${L.map(f => `<p><b>${f.icono} ${f.nombre}:</b> ${f.hechos.join(' ')}</p>`).join('')}`;
  }
  legadoCivico() {
    const S = this.S, R = rasgosElegidos(S), L = civismoActivo(S) ? leyesTodas(S).filter(l => hasLaw(S, l.id)) : [];
    if (!R.length && !L.length) return '';
    return `${R.length ? `<p>Tu pueblo fue <b>${R.map(r => r.nombre.toLowerCase()).join(', ')}</b>.</p>${this.estandarte()}` : ''}${L.length ? `<p class="small"><b>Leyes que dejaste:</b> ${L.map(l => l.n.toLowerCase()).join(', ')}.</p>` : ''}`;
  }
  final(end) {
    const nuevos = this.logros(end);
    const S = this.S, tot = Object.values(S.phil).reduce((a, b) => a + b, 0) || 1, top = topPhil(S);
    const barras = Object.keys(C.PH).map(k => `<div class="pbar"><span>${C.PH[k].a}</span><div class="track"><div class="fill" style="width:${S.phil[k] / tot * 100}%;background:var(--regc)"></div></div><span>${S.phil[k]}</span></div>`).join('');
    this.tarjeta(`<div class="big">${end.win ? '🏛️' : '🕯️'}</div><h3>${end.title}</h3><p>${end.text}</p>
      <p>Gobernaste ${S.year === 1 ? '1 año' : S.year + ' años'}. Llegaste a ${C.STAGES[S.stage].n} con ${S.pop} habitantes, ${Math.round(S.gold)} de oro, ${Math.round(totDebt(S))} de deuda y calificación ${rating(S).l}.</p>
      ${this.juicioFinal()}<h2>Tu perfil de gobierno</h2>${S.phil[top] ? `<p><b>${C.PH[top].n} (${C.PH[top].a}).</b> ${C.PROFILE[top]}</p>` : ''}${barras}
      <div class="phil" style="margin-top:12px"><b>Para reflexionar</b><br>¿Tu gobierno fue del pueblo, por el pueblo y para el pueblo, o solo en su nombre? ¿Qué decisión cambiarías y por qué?</div>
      ${nuevos.length ? `<p><b>Logros nuevos:</b> ${nuevos.map(a => a.n).join(', ')}.</p>` : ''}
      ${end.win ? '<button class="main" id="seguirB">Seguir gobernando</button>' : ''}<button class="${end.win ? 'btn' : 'main'}" id="nuevaB" ${end.win ? 'style="width:100%;margin-top:8px"' : ''}>Nueva partida</button><button class="btn" id="verB" style="width:100%;margin-top:8px">Ver el territorio</button>`, false);
    this.boton('seguirB', () => { S.over = false; S.ganado = true; this.cerrarTarjeta(); this.mapa.cambio(true); this.render(); guardarYa(S); this.toast('Sigues gobernando tu Polis. Ya no hay meta: gobierna como quieras y cuida lo logrado.'); });
    this.boton('nuevaB', () => { this.cerrarTarjeta(); this.mapa.scene.start('Arranque', { nueva: true }); });
    this.boton('verB', () => this.cerrarTarjeta());
  }
  // Fase 14: el territorio que tocó en esta partida (al azar).
  parrafoTerritorio() {
    const S = this.S, T = S.terr && C.TERR && C.TERR.territorios[S.terr];
    return T ? `<div class="phil"><b>${C.TERR.titulo}: ${T.icono} ${T.nombre}</b><br>${T.texto} <i>${T.pista}</i></div>` : '';
  }
  ayuda(primera) {
    const S = this.S;
    this.tarjeta(`<div class="big">🏛️</div><h3>${primera ? 'Bienvenido, gobernante' : 'Cómo jugar'}</h3>
      <p>Gobiernas un territorio del Tolima junto al río. Llévalo de Aldea a Pueblo, Ciudad y Polis, y sostén la Polis ${aniosPolis(S)} años.</p>${this.parrafoTerritorio()}
      <p><b>Tres clases sociales.</b> Campesinos, artesanos y élite tienen ingresos y ánimo propios. Las casas traen gente, pero cada persona necesita un empleo: cultivos, mercados, talleres. Sin empleo crece el descontento.</p>
      <p><b>Hacienda.</b> Fija un impuesto para cada clase. Desde Pueblo puedes pedir préstamos, emitir bonos o imprimir moneda. Imprimir genera inflación; endeudarte baja tu calificación y encarece el crédito.</p>
      <p><b>Dilemas.</b> Cada respuesta refleja una corriente filosófica, y algunas regresan años después como consecuencia.</p>
      <p><b>Régimen.</b> Cada régimen cambia la sede, los colores y las reglas. Si gobiernas para ti o para una facción, el régimen se corrompe; si el gobierno pierde la legitimidad, estalla una revolución. Toca el emblema para ver tu rumbo.</p>
      <p><b>Agua, energía y ladera.</b> Desde Pueblo necesitas acueductos para crecer y molinos para que los talleres funcionen. El café solo crece en ladera y el puerto va junto al río.</p>
      <p><b>Leyes.</b> Cada etapa te da un cupo más, y cada ley tiene ganadores y perdedores.</p>
      <p><b>Exigencia creciente.</b> Con los años el pueblo espera más calidad de vida. Lo que bastaba al principio no basta al final.</p>
      <p><b>Controles.</b> En el celular: arrastra, pellizca para acercar y toca casillas o personas. En el computador: arrastra, usa la rueda para acercar, flechas para moverte, 1 a 5 para los paneles, C para la capa de cobertura y la barra espaciadora para terminar el año. El botón ◎ muestra qué casas tienen escuela, hospital, mercado y recaudo cerca.</p>
      <p>Pierdes si la legitimidad o el ambiente llegan a cero, si caes dos veces en cesación de pagos o si pierdes unas elecciones.</p>
      <button class="main" id="okB">${primera ? 'Empezar a gobernar' : 'Entendido'}</button>`);
    this.boton('okB', () => { this.cerrarTarjeta(); if (primera && actaDisponible(S) && !S.acta) this.acta(); });
  }
  // Partidas (ranuras y código, como en la v9) y logros.
  // Pantallas desplegables (pedido de Juan): cada sección es un desplegable con su título y un dato clave.
  // Recuerda en este aparato cuáles dejaste abiertas. El título sale del primer <h3> de la sección si no se da.
  pleg(id, html, titulo, resumen = '', abierto = false) {
    if (!html || !html.trim()) return '';
    let cuerpo = html;
    if (!titulo) { const m = html.match(/<h3[^>]*>([\s\S]*?)<\/h3>/); if (m) { titulo = m[1].replace(/<[^>]+>/g, '').trim(); cuerpo = html.replace(m[0], ''); } }
    if (!this._pleg) { try { this._pleg = JSON.parse(localStorage.getItem('pactum-plegables') || '{}'); } catch (e) { this._pleg = {}; } }
    const on = this._pleg[id] ?? abierto;
    return `<details class="pleg" data-pl="${id}"${on ? ' open' : ''}><summary><span class="pl-t">${titulo || ''}</span>${resumen ? `<span class="pl-r">${resumen}</span>` : ''}</summary><div class="pl-c">${cuerpo}</div></details>`;
  }
  // Secciones fijas (pedido de Juan, 6 de octubre): siempre abiertas, con el mismo marco que las desplegables.
  fija(id, html, titulo, resumen = '') {
    if (!html || !html.trim()) return '';
    let cuerpo = html;
    if (!titulo) { const m = html.match(/<h3[^>]*>([\s\S]*?)<\/h3>/); if (m) { titulo = m[1].replace(/<[^>]+>/g, '').trim(); cuerpo = html.replace(m[0], ''); } }
    return `<section class="pleg fija" data-pl="${id}"><div class="fj-h"><span class="pl-t">${titulo || ''}</span>${resumen ? `<span class="pl-r">${resumen}</span>` : ''}</div><div class="pl-c">${cuerpo}</div></section>`;
  }
  activarPlegables(raiz) {
    raiz.querySelectorAll('details.pleg').forEach(d => d.addEventListener('toggle', () => {
      this._pleg = this._pleg || {}; this._pleg[d.dataset.pl] = d.open;
      try { localStorage.setItem('pactum-plegables', JSON.stringify(this._pleg)); } catch (e) { /* sin almacenamiento: se olvida al recargar */ }
    }));
  }
  // Pendientes: las misiones del momento, con un botón para ir adonde hay que hacer algo.
  marcarPendientes() {
    if (!this.bPend) return;
    const L = pendientes(this.S).filter(p => !p.fija), urg = L.some(p => p.nivel === 1); // la meta y la guía no encienden el contador
    // Siempre a la vista: gris si no hay nada; con alerta roja y el número si algo espera una decisión.
    this.bPend.dataset.n = L.length || ''; this.bPend.classList.toggle('urgente', urg); this.bPend.classList.toggle('vacio', !L.length);
    this.bPend.setAttribute('aria-label', `Pendientes: ${L.length}${urg ? ', hay algo urgente' : ''}`);
  }
  tarjetaPendientes() {
    const S = this.S, L = pendientes(S), T = { 0: '🎯 Misiones', 1: '🔴 Urgente', 2: '🟡 Importante', 3: '🟢 Sugerencias' };
    if (!L.length) { this.toast('No hay pendientes: todo en orden.'); return; }
    const grupos = [0, 1, 2, 3].map(n => { const g = L.filter(p => p.nivel === n); return g.length ? `<h3>${T[n]}</h3>${g.map(p => `<div class="pend"><span class="pi">${p.icono}</span><span class="pt">${p.texto}</span>${p.ir ? `<button class="btn" data-pend="${p.id}">Ir</button>` : ''}</div>`).join('')}` : ''; }).join('');
    this.tarjeta(`<div class="big">📋</div><h3>Pendientes</h3><p class="small">Lo que espera una decisión tuya este año. «Ir» te lleva al lugar.</p>${grupos}<button class="main" id="okB">Seguir gobernando</button>`);
    this.card.querySelectorAll('[data-pend]').forEach(b => b.onclick = () => {
      const p = L.find(x => x.id === b.dataset.pend); if (!p) return;
      this.cerrarTarjeta();
      if (p.ir.hoja) { this.abrirHoja(p.ir.hoja); if (p.ir.seccion) requestAnimationFrame(() => { const d = document.querySelector(`.pleg[data-pl="${p.ir.seccion}"]`); if (d) { if (d.tagName === 'DETAILS') d.open = true; d.scrollIntoView({ block: 'start', behavior: 'smooth' }); } }); }
      else if (p.ir.mundo) this.tarjetaMundo(p.ir.mundo);
      else if (p.ir.caminos) this.caminosVictoria();
      else if (p.ir.plaza) this.tarjetaPlaza();
      else if (p.ir.casilla !== undefined) { this.mapa.enfocarCasilla(p.ir.casilla); this.abrirFicha(p.ir.casilla); }
    });
    this.boton('okB', () => this.cerrarTarjeta());
  }
  // Fase 17: la plaza por niveles (nivel, topes de obras y lo que pide el siguiente nivel).
  tarjetaPlaza() {
    const S = this.S, E = estadoPlaza(S), T = C.PLAZA.textos;
    if (!E) { this.toast('La plaza por niveles se abre en las partidas en acuarela.'); return; }
    const pr = E.proximo, mot = motivoMejora(S);
    const topes = E.topes.map(t => `<tr><td>${C.B[t.k].e} ${C.B[t.k].n}</td><td class="${t.tienes >= t.tope ? 'neg' : ''}">${t.tienes} de ${t.tope}</td></tr>`).join('');
    this.tarjeta(`<div class="big">⛲</div><h3>${E.nombre}</h3><p>${E.texto}</p>
      <div class="ledger"><table class="budget">${topes}</table></div>
      <p class="small">Las casas, escuelas, hospitales y demás servicios no tienen tope.</p>
      ${pr ? `<h3>Siguiente: ${pr.nombre}</h3><p class="small">${pr.texto}</p>
        <div class="ledger"><table class="budget">${pr.filas.map(f => `<tr><td>${f.ok ? '✅' : '⬜'} ${f.texto}</td><td></td></tr>`).join('')}<tr><td>Costo</td><td class="${S.gold < pr.costo ? 'neg' : ''}">${pr.costo} de oro</td></tr></table></div>
        <p class="small">Abre topes más altos: ${pr.topes.map(t => `${C.B[t.k].n.toLowerCase()} hasta ${t.tope}`).join(', ')}. ${pr.nivel <= 3 ? `Para subir a ${C.STAGES[pr.nivel] ? C.STAGES[pr.nivel].n : ''} hace falta tener esta plaza.` : ''}</p>
        <button class="main" id="mejorarB" ${mot || S.over ? 'disabled' : ''}>${T.mejorar}</button>${mot ? `<p class="small neg">${mot}</p>` : ''}` : `<p class="small">${T.maximo}</p>`}
      <div class="phil"><b>Lo que enseña</b><br>${C.PLAZA.leccion}</div><button class="main" id="okB">Cerrar</button>`);
    this.boton('mejorarB', () => { const r = mejorarPlaza(S); if (r === true) { this.cerrarTarjeta(); this.toast(T.mejorada.replace('{nombre}', estadoPlaza(S).nombre)); this.mapa.cambio && this.mapa.cambio(true); this.render(); } else this.toast(r); });
    this.boton('okB', () => this.cerrarTarjeta());
  }
  // Vista de plano: el territorio visto desde arriba, un color por uso. Tocar una casilla muestra qué hay.
  tarjetaPlano(sel, capa) {
    const S = this.S, k = this.herramienta;
    if (capa) this.capaPlano = capa; else if (!this.capaPlano || (this.capaPlano === 'uso' && k === 'cultivo' && suelosActivos(S))) this.capaPlano = k === 'cultivo' && suelosActivos(S) ? 'suelo' : (this.capaPlano || 'uso');
    capa = this.capaPlano;
    const x = sel !== undefined && sel !== null ? S.map[sel] : null;
    const suelo = x && x.t === 'llano' && suelosActivos(S) ? ` ${datosSuelo(claseSuelo(S, sel)).icono} Suelo: ${datosSuelo(claseSuelo(S, sel)).nombre}.` : '';
    const que = (!x ? 'Toca una casilla para ver qué hay.' : x.b ? `<b>${usoDe(x.b).nombre}:</b> ${this.nombre(x.b)}${x.ob ? ' (en obra)' : ''}.` : `<b>${{ llano: 'Llano', bosque: 'Bosque', montana: 'Montaña', rio: 'Río' }[x.t] || 'Terreno'}</b>, sin obra.`) + suelo;
    const construir = x && k && k !== 'calle' && k !== 'quitarCalle' && !x.b ? `<button class="opt" id="planoC"><b>Construir aquí: ${this.nombre(k)}</b></button>` : '';
    this.tarjeta(`<div class="big">🗺️</div><h3>Vista de plano</h3><p class="small">El territorio visto desde arriba: sin relieve, un color por uso. La línea punteada es el casco urbano; la estrella, la plaza.</p>
      <canvas class="plano" aria-label="Plano del territorio"></canvas>
      <div class="subs capas">${capasPlano(S).map(c => `<button class="sub${c.id === capa ? ' on' : ''}" data-capa="${c.id}"><span class="sn">${c.nombre}</span></button>`).join('')}</div>
      <div class="leyenda-plano">${leyendaPlano(S, capa).map(u => `<span><i style="background:${u.col}"></i>${u.nombre}</span>`).join('')}</div>
      <p class="small" id="planoQue">${que}</p>${construir}
      ${x && x.b ? '<button class="opt" id="planoF"><b>Abrir la ficha de esta obra</b></button>' : ''}
      <button class="main" id="okB">Volver al mapa</button>`);
    const cv = this.card.querySelector('canvas.plano');
    requestAnimationFrame(() => { pintarPlano(cv, S, sel, capa); cv.onclick = ev => { const i = casillaPlano(cv, S, ev); if (i !== null) this.tarjetaPlano(i); }; });
    this.card.querySelectorAll('[data-capa]').forEach(b => b.onclick = () => this.tarjetaPlano(sel, b.dataset.capa));
    this.boton('planoC', () => { this.cerrarTarjeta(); this.mapa.construir(k, sel); });
    this.boton('planoF', () => { this.cerrarTarjeta(); this.abrirFicha(sel); });
    this.boton('okB', () => this.cerrarTarjeta());
  }
  // Fase 15: la pantalla «El mundo».
  tarjetaMundo(sel) {
    const S = this.S, X = C.EXT;
    if (!exteriorActivo(S)) { this.toast('El mundo se abre en las partidas en acuarela.'); return; }
    const L = lugares(), visto = L.filter(l => relacionExterior(S, l.id));
    sel = sel || (visto[0] || L[0]).id;
    const fila = l => { const E = relacionExterior(S, l.id); return `<button class="sub${l.id === sel ? ' on' : ''}" data-lugar="${l.id}"><span class="sn">${l.icono} ${l.nombre} <small>${E ? `${nombreRegimen(E.reg)} · ${E.trato ? X.textos.trato[E.trato].toLowerCase() : 'relación ' + Math.round(E.rel)}` : X.textos.desconocida.toLowerCase()}</small></span></button>`; };
    this.tarjeta(`<div class="big">🌎</div><h3>${X.titulo}</h3><p class="small">${X.textos.ayuda}</p>
      <canvas class="mundo" aria-label="Mapa de tu polis y sus vecinos"></canvas>
      <div class="ficha-lugar">${fichaLugar(S, sel)}</div>
      <h3>${X.textos.hermanas}</h3><div class="subs">${L.filter(l => l.circulo === 'hermanas').map(fila).join('')}</div>
      <h3>${X.textos.paises}</h3><div class="subs">${L.filter(l => l.circulo === 'paises').map(fila).join('')}</div>
      <div class="phil"><b>Lo que enseña</b><br>${X.leccion}</div><button class="main" id="okB">Volver</button>`);
    const cv = this.card.querySelector('canvas.mundo');
    requestAnimationFrame(() => { const pos = pintarMundo(cv, S, sel); cv.onclick = ev => { const id = lugarEn(pos, cv, ev); if (id) this.tarjetaMundo(id); }; });
    this.card.querySelectorAll('[data-lugar]').forEach(b => b.onclick = () => this.tarjetaMundo(b.dataset.lugar));
    this.card.querySelectorAll('[data-ext]').forEach(b => b.onclick = () => { if (accionExterior(S, sel, b.dataset.ext)) { Sonido.tap && Sonido.tap(); this.render(); this.mapa.cambio(true); } this.tarjetaMundo(sel); });
    this.boton('okB', () => this.cerrarTarjeta());
  }
  menu() {
    const S = this.S, g = logrosGanados();
    this.tarjeta(`<h3>Partidas</h3><p class="small">La partida se guarda sola en este aparato. Código de este territorio: <b>${S.seed}</b>; úsalo al iniciar para repetir el mismo mapa.</p>
      ${[1, 2, 3].map(n => { const si = infoRanura(n); return `<div class="slot"><span>Ranura ${n}: ${si || 'vacía'}</span><button class="btn" data-sv="${n}">Guardar</button><button class="btn" data-ld="${n}" ${si ? '' : 'disabled'}>Cargar</button></div>`; }).join('')}
      <div class="dos"><button class="btn" id="expB">Copiar código de partida</button><button class="btn" id="impB">Pegar código</button></div>
      <textarea id="impT" class="inp" rows="3" placeholder="Pega aquí un código de partida (también sirven los de la versión 9)" hidden style="width:100%;margin-top:6px"></textarea>
      <h2>Logros (${C.ACH.filter(a => g[a.id]).length} de ${C.ACH.length})</h2>
      <div class="achs">${C.ACH.map(a => `<div class="ach ${g[a.id] ? 'on' : ''}"><b>${g[a.id] ? '🏅' : '○'} ${a.n}</b><small>${a.d}</small></div>`).join('')}</div>
      <div class="dos" style="margin-top:12px"><button class="btn" id="nuevaB">Nueva partida</button><button class="btn" id="portadaB">Portada</button></div>
      <button class="main" id="okB">Seguir gobernando</button>`);
    const cargar = nuevo => { partida.S = nuevo; guardarYa(nuevo); this.cerrarTarjeta(); this.mapa.scene.restart({}); };
    this.card.querySelectorAll('[data-sv]').forEach(b => b.onclick = () => { this.toast(guardarRanura(+b.dataset.sv, S) ? `Partida guardada en la ranura ${b.dataset.sv}.` : 'No se pudo guardar en este aparato.'); this.menu(); });
    this.card.querySelectorAll('[data-ld]').forEach(b => b.onclick = () => { try { cargar(cargarRanura(+b.dataset.ld)); } catch (e) { this.toast('No se pudo cargar esa ranura.'); } });
    const area = this.card.querySelector('#impT');
    this.boton('expB', () => {
      const codigo = aCodigo(S), mostrar = () => { area.hidden = false; area.value = codigo; area.select(); this.toast('Copia el código del recuadro.'); };
      if (navigator.clipboard) navigator.clipboard.writeText(codigo).then(() => this.toast('Código copiado. Guárdalo donde quieras.'), mostrar); else mostrar();
    });
    this.boton('impB', () => {
      if (area.hidden || !area.value.trim()) { area.hidden = false; area.value = ''; area.focus(); return; }
      try { cargar(desdeCodigo(area.value)); this.toast('Partida cargada desde el código.'); } catch (e) { this.toast('Ese código no es válido.'); }
    });
    this.boton('nuevaB', () => {
      this.tarjeta(`<h3>¿Empezar de nuevo?</h3><p>La partida actual se reemplaza. Si quieres conservarla, guárdala antes en una ranura.</p><div class="dos"><button class="btn" id="noB">Seguir aquí</button><button class="btn" id="siB">Nueva partida</button></div>`);
      this.boton('noB', () => this.cerrarTarjeta());
      this.boton('siB', () => { this.cerrarTarjeta(); this.mapa.scene.start('Arranque', { nueva: true }); });
    });
    this.boton('portadaB', () => { guardarYa(S); this.cerrarTarjeta(); this.mapa.scene.start('Arranque'); });
    this.boton('okB', () => this.cerrarTarjeta());
  }

  // Pantalla de fin de año: "Año N" con el balance, como en la v9.
  pasoDelAnio(titulo, sub) {
    this.pasa.innerHTML = `<div><b>${titulo}</b><span>${sub}</span></div>`;
    this.pasa.classList.add('ver');
    clearTimeout(this._p); this._p = setTimeout(() => this.pasa.classList.remove('ver'), reducirMovimiento() ? 900 : 1400);
  }
}

// Gráfica de líneas en SVG (de la v9).
function grafica(h, series, opts) {
  if (h.length < 2) return '<p class="small">La historia se dibuja cuando pasen al menos dos años.</p>';
  const W = 320, H = 150, L = 34, R = 8, T = 10, Bm = 22;
  let lo = Infinity, hi = -Infinity;
  series.forEach(s => h.forEach(p => { lo = Math.min(lo, p[s.k]); hi = Math.max(hi, p[s.k]); }));
  if (opts && opts.fijo) [lo, hi] = opts.fijo; else { lo = Math.min(0, lo); hi = hi === lo ? lo + 1 : hi * 1.08; }
  const X = i => L + (W - L - R) * i / (h.length - 1), Y = v => T + (H - T - Bm) * (1 - (v - lo) / (hi - lo));
  const fmt = v => Math.abs(v) >= 1000 ? (v / 1000).toFixed(1) + 'k' : Math.round(v);
  let g = `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="${series.map(s => s.n).join(', ')}">`;
  [0, .5, 1].forEach(f => { const v = lo + (hi - lo) * f, y = Y(v); g += `<line x1="${L}" x2="${W - R}" y1="${y}" y2="${y}" class="gl"/><text x="${L - 4}" y="${y + 3}" text-anchor="end" class="ax">${fmt(v)}</text>`; });
  if (lo < 0 && hi > 0) g += `<line x1="${L}" x2="${W - R}" y1="${Y(0)}" y2="${Y(0)}" class="zero"/>`;
  g += `<text x="${L}" y="${H - 5}" class="ax">Año ${h[0].y}</text><text x="${W - R}" y="${H - 5}" text-anchor="end" class="ax">Año ${h[h.length - 1].y}</text>`;
  series.forEach(s => { g += `<polyline fill="none" stroke="${s.c}" stroke-width="2" stroke-linejoin="round" points="${h.map((p, i) => X(i).toFixed(1) + ',' + Y(p[s.k]).toFixed(1)).join(' ')}"/>`; });
  return g + '</svg><div class="legend">' + series.map(s => `<span><i style="background:${s.c}"></i>${s.n}: ${fmt(h[h.length - 1][s.k])}${s.u || ''}</span>`).join('') + '</div>';
}
