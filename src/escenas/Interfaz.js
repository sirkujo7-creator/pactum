// Interfaz en HTML sobre el mapa, adaptada de la versión 9: barra superior (régimen, recursos y medidores),
// meta y guía, barra inferior con Construir, Hacienda, Sociedad, Leyes, Crónica y Terminar el año,
// paneles que suben desde abajo (a un lado en computador), fichas, tarjetas de dilemas y avisos.
import {
  C, counts, finance, totDebt, cost, waterCap, energy, poweredT, whyNot, vistaPrevia, seatName, RG, RM, D,
  BIOMA, metros, nearRiver, pensamiento, rating, canBorrow, takeLoan, issueBond, printMoney, payDebt, loanRate,
  actaDisponible, actaActiva, firmarActa, faltasNuevas, contradiria, cumplidos, listaMovimientos, fuerzaMov, nombreEstado, dialogar, puedeDialogar, costoDialogo, fuerzaActiva, nivelLegitimidad, ejercitoActivo, ejercito, metaEjercito, partesEjercito, gruposActivos, panorama, animoGrupo, aporteObra, society, desgloseIndicador, desgloseClase, economiaActiva, precioAlimento, precioCafe, coberturaActiva, serviciosDeCasa, cobertura, evaluarProyecto, ofertas, porEtapas, etapaDe, devolucionObra, fondoSugerido, lluvias, climaActivo, estadoSuelo, nivelObra, estadoObra, costoReparar, reparar, taxLimit, satTargets, lawSlots, lawCostNow, lawBlock, hasLaw, toggleLaw, stance, topPhil, clamp, logrosNuevos, aCodigo, desdeCodigo
} from '../core/index.js';
import { guardarLuego, guardarYa, infoRanura, guardarRanura, cargarRanura, logrosGanados, guardarLogros, guardarSonido } from './memoria.js';
import { Sonido } from './sonido.js';
import { partida } from './partida.js';
import { iconoObra } from '../arte/edificios.js';
import { retrato, EMB } from '../arte/retratos.js';
import { vineta } from '../arte/vinetas.js';
import { capaUI, el, reducirMovimiento } from './pantalla.js';

export const IC = {
  gold: '<svg viewBox="0 0 20 20" class="ic" aria-hidden="true"><circle cx="10" cy="10" r="8" fill="#D9A93E"/><circle cx="10" cy="10" r="5.5" fill="none" stroke="#9C7420" stroke-width="1.2"/><path d="M8.5 7.5h3M10 7.5v5" stroke="#9C7420" stroke-width="1.3"/></svg>',
  debt: '<svg viewBox="0 0 20 20" class="ic" aria-hidden="true"><path d="M4 3h10l2 2v12H4z" fill="#F1E6C8" stroke="#8B6F4A"/><path d="M6.5 8h7M6.5 11h7M6.5 14h4" stroke="#B0402C" stroke-width="1.3"/></svg>',
  food: '<svg viewBox="0 0 20 20" class="ic" aria-hidden="true"><path d="M10 18V6" stroke="#8A7A3A" stroke-width="1.4"/><ellipse cx="10" cy="5" rx="2" ry="3" fill="#E1B84A"/><ellipse cx="7" cy="9" rx="2" ry="3" transform="rotate(-30 7 9)" fill="#E1B84A"/><ellipse cx="13" cy="9" rx="2" ry="3" transform="rotate(30 13 9)" fill="#E1B84A"/><ellipse cx="7" cy="13" rx="2" ry="3" transform="rotate(-30 7 13)" fill="#D5A93E"/><ellipse cx="13" cy="13" rx="2" ry="3" transform="rotate(30 13 13)" fill="#D5A93E"/></svg>',
  pop: '<svg viewBox="0 0 20 20" class="ic" aria-hidden="true"><circle cx="7" cy="6" r="2.6" fill="#C98E62"/><path d="M2.5 17c0-4 2-6 4.5-6s4.5 2 4.5 6z" fill="#B4553A"/><circle cx="13.5" cy="7" r="2.3" fill="#E0B08A"/><path d="M9.5 17c0-3.5 1.8-5.2 4-5.2s4 1.7 4 5.2z" fill="#2D5D72"/></svg>'
};
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
      dk('construir', '🔨', 'Construir', '1'), dk('hacienda', IC.gold, 'Hacienda', '2'), dk('sociedad', IC.pop, 'Sociedad', '3'),
      dk('leyes', '📜', 'Leyes', '4'), dk('cronica', '📰', 'Crónica', '5'), this.bFin
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
      el('header', { class: 'arriba' }, [el('div', { class: 'fila1' }, [this.bReg, this.era]), this.hud, this.medidores]),
      el('div', { class: 'controles' }, [
        b('?', 'Cómo jugar', () => this.ayuda(false)),
        b('☰', 'Partidas y logros', () => this.menu()),
        this.bSonido = b('🔇', 'Activar sonido', () => this.alternarSonido()),
        b('+', 'Acercar (+)', () => mapa.listo && mapa.zoomCentro(1.25)),
        b('−', 'Alejar (−)', () => mapa.listo && mapa.zoomCentro(1 / 1.25)),
        b('⤢', 'Ver todo el territorio (0)', () => mapa.listo && mapa.encuadrar()),
        b('⌂', 'Ir a la aldea', () => mapa.listo && mapa.enfocarAldea()),
        this.bCob = b('◎', 'Capa de cobertura (c)', () => mapa.listo && mapa.alternarCobertura())
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
  }

  destruir() { this.raiz.remove(); }
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
  nombre(k) { return k === 'agora' ? seatName(this.S) : C.B[k].n; }
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
    const faltas = faltasNuevas(S);
    if (faltas.length) setTimeout(() => this.toast(faltas.join(' ')), 50);
    guardarLuego(S);
    Sonido.mode(S.reg);
    this.bSonido.textContent = Sonido.on ? '🔊' : '🔇';
    this.bSonido.setAttribute('aria-label', Sonido.on ? 'Silenciar' : 'Activar sonido'); this.bSonido.title = this.bSonido.getAttribute('aria-label');
    this.bReg.innerHTML = `${EMB[S.reg]}<b>${rg.n.split(' ')[0]}</b>`;
    this.bReg.setAttribute('aria-label', `Régimen: ${rg.n}. Ver rumbo del gobierno`);
    const L = lluvias(S), temp = this.mapa.pob ? this.mapa.pob.temporada() : null;
    this.era.innerHTML = `${C.STAGES[S.stage].n}, año ${S.year}${S.stage === 3 ? `. Polis ${S.polisYears}/${D(S).polis}` : ''}${L ? ` · ${L.icono}<span class="lluv-nom"> ${L.nombre.toLowerCase()}</span>` : ''}${economiaActiva(S) && S.eco.fase !== 'normal' ? ` · ${C.ECO.fases[S.eco.fase].icono}<span class="lluv-nom"> ${C.ECO.fases[S.eco.fase].nombre.toLowerCase()}</span>` : ''}`;
    this.era.title = L ? `${L.texto} ${C.CLIMA.leccion}${temp ? ` Ahora es temporada ${temp === 'lluvias' ? 'de lluvias' : 'seca'}.` : ''}` : '';
    const dfood = F.fprod - F.cons, pa = precioAlimento(S);
    this.hud.innerHTML =
      `<div class="pill" title="Oro">${IC.gold}<b class="${S.gold < 0 ? 'neg' : ''}">${Math.round(S.gold)}</b></div>` +
      `<div class="pill" title="Deuda">${IC.debt}<b>${Math.round(totDebt(S))}</b></div>` +
      `<div class="pill" title="Alimento${pa !== 1 ? '. ' + C.ECO.textos.pastilla.replace('{p}', pa.toLocaleString('es-CO')) : ''}">${IC.food}<b>${Math.round(S.food)}</b><small class="${dfood < 0 ? 'neg' : ''}">${dfood >= 0 ? '+' : '−'}${Math.abs(dfood)}</small>${pa >= 1.15 ? `<small class="precio neg" aria-label="precio alto">▲${pa.toLocaleString('es-CO')}</small>` : pa <= .85 ? `<small class="precio pos" aria-label="precio bajo">▼${pa.toLocaleString('es-CO')}</small>` : ''}</div>` +
      `<div class="pill" title="Población">${IC.pop}<b>${S.pop}</b><small>/${c.casa * 10}</small></div>` +
      (S.stage >= 1 ? `<div class="pill" title="Agua">💧<b class="${S.pop > waterCap(S, c) ? 'neg' : ''}">${waterCap(S, c)}</b></div><div class="pill" title="Energía para talleres">⚡<b class="${c.taller > energy(S, c) ? 'neg' : ''}">${poweredT(S, c)}/${c.taller}</b></div>` : '');
    this.medidores.replaceChildren(
      ...[['Bienestar', '😊', S.hap, 'hap'], ['Igualdad', '⚖️', S.eq, 'eq'], ['Legitimidad', '🤝', S.tr, 'tr'], ['Ambiente', '🌿', S.env, 'env']].map(([n, ico, v, k]) =>
        el('button', { class: 'medidor', title: `${n}: ${Math.round(v)} de 100. ${C.IND[k].que} Toca para ver por qué sube o baja.`, 'aria-label': `${n}: ${Math.round(v)} de 100. Ver por qué`, on: { click: () => this.explicar(k) }, html: `<div class="lab"><span><span class="ico" aria-hidden="true">${ico}</span><span class="nom">${n}</span></span><b>${Math.round(v)}</b></div><div class="track"><div class="fill" style="width:${v}%;background:${colorDe(v)}"></div></div>` })),
      el('button', { class: 'medidor', title: `Rumbo del gobierno: de bien común (0) a interés propio (100). ${C.IND.corr.que} Toca para ver por qué cambia.`, 'aria-label': `Rumbo del gobierno: ${Math.round(S.corr)}. Ver por qué`, on: { click: () => this.explicar('corr') }, html: `<div class="lab"><span><span class="ico" aria-hidden="true">🧭</span><span class="nom">Rumbo</span></span><b>${Math.round(S.corr)}</b></div><div class="track"><div class="fill" style="width:${S.corr}%;background:${colorDe(100 - S.corr)}"></div></div>` })
    );
    // Meta, guía, promesas y exigencias (como en la v9).
    const nx = C.STAGES[S.stage + 1], g = S.guide && S.gstep < C.GUIDE.length ? C.GUIDE[S.gstep] : null;
    const meta = S.ganado ? '🏛️ Polis sostenida: ganaste. Sigues gobernando sin meta fija.' : nx ? `Meta: ${nx.n} (${nx.req}).` : `Meta: sostener la Polis ${D(S).polis} años.`;
    const pr = S.promises.map(p => `Promesa: ${C.B[p.k].a} antes del año ${p.dl}.`).join(' ');
    const pron = climaActivo(S) && S.clima.pronostico, FEN = C.CLIMA && C.CLIMA.fenomenos;
    const avisoClima = pron ? `${FEN[pron.tipo].icono} <b>${FEN[pron.tipo].nombre} llega el año ${pron.anio}.</b> Fondo de emergencias: ${Math.round(S.fondo || 0)} de oro.` : '';
    const avisoEco = economiaActiva(S) && S.eco.aviso ? `📉 <b>Recesión anunciada para el año ${S.eco.aviso.anio}.</b>` : '';
    const aviso = avisoClima || avisoEco;
    // La meta siempre queda a la vista en la primera línea; avisos y guía van en la segunda.
    const segunda = aviso || (g ? `<b>Guía ${S.gstep + 1}/${C.GUIDE.length}</b> ${g.t}` : '');
    this.meta.innerHTML = `<div class="gl1"><b>${meta}</b></div>${segunda ? `<div class="gl1 gl2">${segunda}</div>` : ''}` +
      `<div class="gmore">${aviso && g ? `<b>Guía ${S.gstep + 1}/${C.GUIDE.length}</b> ${g.t} ` : ''}${avisoClima ? FEN[pron.tipo].preparar + ' ' : avisoEco ? C.ECO.textos.preparar + ' ' : ''}${pr ? pr + ' ' : ''}${L && L.cosecha !== 1 ? `${L.icono} ${L.texto} ` : ''}${S.expc > 0 ? `<span class="neg">El pueblo exige más calidad de vida (−${S.expc} de ánimo): parques, sede de gobierno y universidad la mejoran.</span> ` : ''}${g ? '<span class="lnk" role="button" tabindex="0" data-ocultar>Ocultar guía</span>' : ''}</div>`;
    const oc = this.meta.querySelector('[data-ocultar]');
    if (oc) oc.onclick = e => { e.stopPropagation(); S.guide = false; this.render(); };
    // En computador los paneles van a un lado: la meta sigue visible. En celular la tapa el panel que sube.
    this.meta.hidden = (!!this.hojaAbierta() && !window.matchMedia('(min-width:760px)').matches) || S.over;
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
    this.tray.replaceChildren(...Object.entries(C.B).map(([k, b]) => {
      const bloqueada = b.st > S.stage;
      return el('button', {
        class: 'tool' + (this.herramienta === k ? ' on' : ''), 'aria-pressed': String(this.herramienta === k),
        ...(bloqueada ? { disabled: '' } : {}), on: { click: () => this.elegir(k) }
      }, [
        bloqueada ? el('span', { class: 'candado', text: '🔒', 'aria-hidden': 'true' }) : el('img', { src: this.icono(k), alt: '' }),
        this.nombre(k),
        el('small', { html: bloqueada ? C.STAGES[b.st].n : `${IC.gold.replace('class="ic"', 'class="ic" style="display:inline;width:13px;height:13px;vertical-align:-2px"')} ${cost(S, k)}${porEtapas(S, k) ? ` · ${anios(C.B[k].anios)}` : ''}` })
      ]);
    }));
    const k = this.herramienta;
    if (k) {
      const v = vistaPrevia(S, k);
      let prev;
      if (v.motivo) prev = `<span class="prev neg">${v.motivo}</span>`;
      else {
        const paga = v.anios > 1 ? `Cuesta ${v.costo} de oro en ${v.anios} pagos de ${v.cuota}, uno por año; presta servicio al terminar.` : v.anios === 1 ? `Cuesta ${v.costo} de oro; tarda un año y presta servicio al terminar.` : `Cuesta ${v.costo} de oro.`;
        prev = `<span class="prev">${paga} ${v.anios ? 'Cuando esté lista' : 'Si la construyes'}:</span>${this.efectos(v)}<span class="prev small">Toca una casilla marcada.</span>`;
      }
      this.hint.innerHTML = `<b>${this.nombre(k)}.</b> ${C.B[k].d} ${prev}`;
    } else this.hint.textContent = 'Elige una obra para construir, o toca una casilla para ver su ficha.';
    this.bSoltar.hidden = !k;
    this.bDeshacer.hidden = !S.undo.length || S.over;
    this.hoja.classList.toggle('mini', !!k);
  }

  renderHacienda(F, R) {
    const S = this.S, cb = canBorrow(S) && !S.over;
    const fila = (k, n) => `<div class="txrow"><span>${n}</span><input type="range" min="0" max="${k === 'e' ? 50 : 40}" value="${S.tx[k]}" data-tx="${k}" aria-label="Impuesto a ${n.toLowerCase()}"><strong>${S.tx[k]}%</strong></div>`;
    this.cuentas.innerHTML = `
      <h3>Impuestos</h3>${fila('c', 'Campesinos')}${fila('a', 'Artesanos')}${fila('e', 'Élite')}
      <div class="macro"><div><strong class="${S.infl > .06 ? 'neg' : ''}">${(S.infl * 100).toFixed(1)}%</strong><span>Inflación</span></div><div><strong>${S.price.toFixed(2)}</strong><span>Nivel de precios</span></div><div><strong class="r${R.l[0]}">${R.l}</strong><span>Calificación</span></div><div><strong>${Math.round(F.rate * 100)}%</strong><span>Tasa de interés</span></div></div>
      <div class="ledger"><table class="budget">
        <tr><td>Impuesto a campesinos</td><td>+${F.taxC}</td></tr><tr><td>Impuesto a artesanos</td><td>+${F.taxA}</td></tr><tr><td>Impuesto a la élite</td><td>+${F.taxE}</td></tr>
        <tr><td>Tasas y regalías</td><td>+${F.fee}</td></tr><tr><td>Mantenimiento de obras${S.desgaste && (S.mant ?? 100) < 100 ? ` (${S.mant}%)` : ''}</td><td>−${F.up}</td></tr><tr><td>Administración pública</td><td>−${F.admin}</td></tr>${F.obras ? `<tr><td>Obras en construcción (si alcanza el oro)</td><td>−${F.obras}</td></tr>` : ''}${F.militar ? `<tr><td>Gasto militar</td><td>−${F.militar}</td></tr>` : ''}
        ${F.lawCost ? `<tr><td>Costo de las leyes</td><td>−${F.lawCost}</td></tr>` : ''}${F.fondo ? `<tr><td>Aporte al fondo de emergencias</td><td>−${F.fondo}</td></tr>` : ''}
        ${F.pay ? `<tr><td>Cuota de préstamos (interés ${F.interest})</td><td>−${F.pay}</td></tr>` : ''}${F.cpn ? `<tr><td>Cupones de bonos</td><td>−${F.cpn}</td></tr>` : ''}${F.mat ? `<tr><td>Vencimiento de bonos</td><td>−${F.mat}</td></tr>` : ''}
        <tr class="tot"><td>Resultado del año</td><td class="${F.net < 0 ? 'neg' : ''}">${F.net >= 0 ? '+' : '−'}${Math.abs(F.net)}</td></tr></table></div>
      ${F.evadido ? `<p class="small">La evasión se llevó ${F.evadido} de oro: ${Math.round((1 - cobertura(S).recaudo) * 100)}% de las casas está lejos de una oficina de recaudo. ${C.COB.leccionRecaudo}</p>` : ''}
      <div class="cuatro"><button class="btn" data-a="prestamo" ${cb ? '' : 'disabled'}>Pedir préstamo</button><button class="btn" data-a="bono" ${cb ? '' : 'disabled'}>Emitir bono</button><button class="btn" data-a="imprimir" ${S.stage < 1 || S.over ? 'disabled' : ''}>Imprimir moneda</button><button class="btn" data-a="abonar" ${S.debt <= 0 || S.gold < 1 || S.over ? 'disabled' : ''}>Abonar 50</button></div>
      <p class="small">${S.stage < 1 ? 'El crédito y la emisión se abren al llegar a Pueblo.' : R.l === 'CCC' ? 'Calificación CCC: nadie te presta. Reduce deuda y déficit.' : 'Préstamo: 150, se paga 15% por año. Bono: 200 a 5 años, interés más bajo, pagas todo al vencer.'}</p>
      ${climaActivo(S) && S.stage >= 1 ? `<h3>${C.CLIMA.fondo.nombre}</h3>
        <div class="txrow"><span>Aporte</span><input type="range" min="0" max="${C.CLIMA.fondo.maximo}" value="${S.aporteFondo || 0}" data-fondo aria-label="Aporte al fondo de emergencias, porcentaje de los ingresos"><strong>${S.aporteFondo || 0}%</strong></div>
        <p class="small">Guardado: <b>${Math.round(S.fondo || 0)} de oro</b>. Una emergencia hoy costaría unos ${fondoSugerido(S)}. ${C.CLIMA.fondo.leccion}</p>` : ''}
      ${this.seccionEconomia()}
      ${this.seccionEjercito()}
      ${this.seccionMantenimiento()}
      ${S.bonds.length ? `<p class="small">Bonos: ${S.bonds.map(b => `${b.amt} al ${Math.round(b.cpn * 100)}%, vence año ${b.due}`).join('; ')}.</p>` : ''}`;
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
    this.sociedad.innerHTML = cls.map(([n, k, v, sub, a]) => {
      const A = C.ADV[a], md = A.mood[v < 35 ? 0 : v < 62 ? 1 : 2];
      const cl = n === 'Campesinos' ? 'c' : n === 'Artesanos' ? 'a' : 'e', peor = desgloseClase(S, cl).partes.filter(x => x[1] < 0 && !/partida/.test(x[0]))[0];
      return `<div class="cls"><img src="${retrato(a)}" alt="${A.n}"><div><div class="lab"><span>${n} <b>${k}</b></span><span>${Math.round(v)}</span></div><div class="track"><div class="fill" style="width:${v}%;background:${colorDe(v)}"></div></div><small>${sub}</small>${peor ? `<small class="neg">Lo que más le molesta: ${peor[0].toLowerCase()} (${signo(peor[1])}).</small>` : ''}<div class="quote">${A.n}: “${md}”</div><button class="btn porque" data-clase="${cl}">¿Por qué? Ver causas</button>${this.subgrupos(cl)}</div></div>`;
    }).join('') + this.subgrupos('otros') + this.seccionMovimientos() + `<p class="small ${so.un > 0 ? 'neg' : ''}">${so.un > 0 ? `${so.un} personas sin empleo. Construye cultivos, mercados o talleres.` : 'Todos tienen empleo.'}</p>`;
    this.sociedad.querySelectorAll('[data-clase]').forEach(b => b.onclick = () => this.explicarClase(b.dataset.clase));
    this.sociedad.querySelectorAll('[data-grupo]').forEach(b => b.onclick = () => this.explicarGrupo(b.dataset.grupo));
    this.sociedad.querySelectorAll('[data-mov]').forEach(b => b.onclick = () => this.explicarMovimiento(b.dataset.mov));
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

  renderLeyes() {
    const S = this.S, n = Object.keys(S.laws || {}).length;
    this.leyes.innerHTML = `<p class="small">Leyes vigentes: ${n} de ${lawSlots(S)}. Promulgar cuesta ${lawCostNow(S)} de oro${S.reg === 'monarquia' || S.reg === 'tirania' ? '' : ' y 2 de legitimidad'}. Cada etapa abre un cupo más.</p>` +
      C.LAWS.map(l => {
        const on = hasLaw(S, l.id), bl = lawBlock(S, l);
        return `<div class="law ${on ? 'on' : ''}"><b>${l.n}</b><small>${l.d}</small>${on ? `<small>Vigente desde el año ${S.laws[l.id]}.</small>` : ''}${bl && !on ? `<small class="neg">${bl}</small>` : ''}${!on && l.id === 'censura' ? this.avisoActa(['censura']) : ''}<button class="btn" data-ley="${l.id}" ${(bl && !on) || S.over ? 'disabled' : ''}>${on ? 'Derogar' : 'Promulgar'}</button></div>`;
      }).join('');
    this.leyes.querySelectorAll('[data-ley]').forEach(bt => bt.onclick = () => {
      const r = toggleLaw(S, bt.dataset.ley);
      if (r !== true) this.toast(r);
      this.mapa.cambio(); this.render();
    });
  }

  renderCronica() {
    const S = this.S, h = S.hist, G = GRAFICAS[this.grafica];
    const tabs = Object.entries(GRAFICAS).map(([k, v]) => `<button class="tab${k === this.grafica ? ' on' : ''}" data-g="${k}">${v.n}</button>`).join('');
    this.cronica.innerHTML = `<div class="tabs">${tabs}</div>${grafica(h, G.s, G.o)}<h3>Lo que ha pasado</h3><div class="log">${S.log.slice(0, 40).map(l => `<p><b>Año ${l.y}.</b> ${l.t}</p>`).join('')}</div>`;
    this.cronica.querySelectorAll('[data-g]').forEach(bt => bt.onclick = () => { this.grafica = bt.dataset.g; this.renderCronica(); });
  }

  // ---------- Fichas ----------
  abrirFicha(i) {
    const S = this.S, T = this.mapa.T, t = T.tiles[i], x = S.map[i];
    const hijos = [];
    if (x.b) {
      hijos.push(el('img', { src: this.icono(x.b), alt: '' }), el('b', { text: this.nombre(x.b) }), el('span', { text: C.B[x.b].d }),
        el('span', { text: `Mantenimiento: ${Math.round(C.B[x.b].up * S.price * (x.mt || 1))} de oro al año${x.mt ? ' (buenos materiales)' : ''}.` }));
      const ap = x.ob ? null : aporteObra(S, i);
      if (ap) hijos.push(el('span', { class: 'aporte', html: `<b>Lo que aporta hoy</b> (se perdería si la demueles):${this.efectos(ap)}` }));
      const suelo = this.textoSuelo(i);
      if (suelo) hijos.push(el('span', { class: 'suelo', text: suelo }));
      if (x.b === 'casa' && !x.ob && coberturaActiva(S)) {
        const sv = serviciosDeCasa(S, i), CS = C.COB.servicios;
        hijos.push(el('span', { text: `${C.COB.textos.fichaCasa} ${Object.keys(CS).map(s => `${sv[s] ? '✓' : '✗'} ${CS[s]}`).join(' · ')}` }));
      }
      if (S.desgaste && nivelObra(x) > 0) { const e = estadoObra(x); hijos.push(el('span', { class: 'suelo', text: `${e.nombre}: ${C.DESGASTE.textos[e.id]}` })); }
      if (x.ob) {
        const T = C.OBRAS.textos, o = x.ob;
        hijos.push(el('span', { class: 'suelo', text: o.det >= C.OBRAS.aniosElefante ? T.fichaElefante : T.enCurso.replace('{p}', Math.min(o.p, o.n)).replace('{n}', o.n).replace('{etapa}', etapaDe(x).toLowerCase()) }));
        hijos.push(el('span', { text: o.det ? T.parada.replace('{c}', o.c) : o.p >= o.n ? T.ultimoAnio : T.proximoPago.replace('{c}', o.c) }));
        hijos.push(el('span', { class: 'small', text: C.OBRAS.leccion }));
      }
      const g = x.ob ? devolucionObra(x) : Math.round(cost(S, x.b) * .3), rep = S.desgaste && !x.ob ? costoReparar(S, i) : 0;
      if (rep) hijos.push(el('button', { class: 'btn', style: 'grid-column:1/-1;margin-top:6px', ...(S.over || S.gold < rep ? { disabled: '' } : {}), on: { click: () => this.mapa.repararObra(i) } }, `Reparar (−${rep} oro)`));
      hijos.push(el('div', { class: 'dos' }, [
        el('button', { class: 'btn', ...(S.over ? { disabled: '' } : {}), on: { click: () => this.mapa.demoler(i) } }, `Demoler (+${g} oro)`),
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
      el('small', { style: 'grid-column:1/-1;color:var(--muted)', text: 'Cada figura representa a unas dos personas del pueblo.' })
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
    const e = estadoSuelo(this.S, i), K = climaActivo(this.S) && C.CLIMA.suelo;
    return !K ? '' : e === 'derrumbe' ? '⛰️ ' + K.derrumbe.aviso : e === 'quemado' ? '🔥 ' + K.quemado
      : e === 'riesgo' ? '⚠️ ' + K.erosion.riesgo : e === 'erosion' ? '🟫 ' + K.erosion.aviso : '';
  }
  cerrarFicha() { this.ficha.hidden = true; this.mapa.marcar(null); }
  motivo(k, i) { return whyNot(this.S, k, i); }

  // ---------- Tarjetas ----------
  tarjeta(html, cerrable = true) {
    this.cerrarFicha();
    this.card.innerHTML = html;
    this.velo.hidden = false;
    this.tarjetaCerrable = cerrable;
    const f = this.card.querySelector('button'); if (f) f.focus({ preventScroll: true });
    this.card.scrollTop = 0;
  }
  cerrarTarjeta() { this.velo.hidden = true; this.card.innerHTML = ''; if (this.alCerrar) { const f = this.alCerrar; this.alCerrar = null; f(); } }
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
    const r = Object.keys(C.ADV).map(a => { const st = stance(a, fx); if (!st) return ''; const L = st > 0 ? C.ADV[a].pro : C.ADV[a].con; return `<div class="say ${st > 0 ? 'pro' : 'con'}"><img src="${retrato(a)}" alt=""><div><b>${C.ADV[a].n}</b><span>“${L[S.year % L.length]}”</span></div></div>`; }).join('');
    return r ? `<div class="says">${r}</div>` : '';
  }
  // Dilema o consecuencia del año.
  suceso(alTerminar) {
    const S = this.S, ev = S.pend;
    if (!ev) { if (alTerminar) alTerminar(); return; }
    const img = `<img class="vig" src="${vineta(ev.id, S.reg, S.stage)}" alt="">`;
    this.tarjeta(`${img}<h3>${ev.title}</h3><p>${ev.text}</p>${this.lineaMovimiento(ev)}` + ev.opts.map((o, i) =>
      `<button class="opt" data-o="${i}">${ev.followUp ? '' : `<span class="stances">${Object.keys(C.ADV).map(a => { const st = stance(a, o.fx); return st ? `<span class="st ${st > 0 ? 'pro' : 'con'}"><img src="${retrato(a)}" alt="${C.ADV[a].n}">${st > 0 ? '✓' : '✗'}</span>` : ''; }).join('')}</span>`}${o.l}${ev.followUp ? `<small>${Object.keys(o.fx).length ? 'Ver efectos' : ''}</small>` : `<small>${o.fx.t ? (o.fx.t > 0 ? '+' : '−') + Math.abs(o.fx.t) + ' oro' : 'Sin costo en oro'}${o.f ? ` · ${C.PH[o.f].n}` : ''}</small>`}</button>`).join(''), false);
    this.card.querySelectorAll('[data-o]').forEach(b => b.onclick = () => {
      const o = this.mapa.elegirOpcion(+b.dataset.o), p = o.f ? C.PH[o.f] : null;
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
      this.alCerrar = alTerminar; this.boton('okB', () => this.cerrarTarjeta()); return;
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
      this.alCerrar = alTerminar; this.boton('okB', () => this.cerrarTarjeta()); return;
    }
    if (E.evento && E.evento.nuevo) {
      E.evento.nuevo = false;
      this.tarjeta(`<div class="big">📉</div><h3>Recesión</h3><p>${C.ECO.fases.recesion.texto}</p>
        <p class="small">Obras en marcha ahora: ${S.map.filter(x => x.ob && !x.ob.det).length}. Cada una emplea el doble mientras dure la recesión.</p>
        <div class="phil"><b>Lo que enseña</b><br>${C.ECO.leccionCiclo}</div><button class="main" id="okB">Continuar</button>`);
      this.alCerrar = alTerminar; this.boton('okB', () => this.cerrarTarjeta()); return;
    }
    this.avisoEjercito(alTerminar);
  }
  // Fase 3: aviso de golpe (ruido de sables), con un año para prepararse.
  avisoEjercito(alTerminar) {
    const S = this.S, E = S.ejercito, K = C.EJERCITO;
    if (!E || !E.aviso || !E.aviso.nuevo || !ejercitoActivo(S)) { alTerminar(); return; }
    E.aviso.nuevo = false;
    this.tarjeta(`<div class="big">🎖️</div><h3>Ruido de sables</h3><p>${K.textos.aviso.replace('{anio}', E.aviso.anio)}</p>
      <p><b>Tienes un año para prepararte.</b> ${K.textos.preparar}</p><div class="phil"><b>Lo que enseña</b><br>${K.leccion}</div><button class="main" id="okB">Entendido</button>`);
    this.alCerrar = alTerminar; this.boton('okB', () => this.cerrarTarjeta());
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
  final(end) {
    const nuevos = this.logros(end);
    const S = this.S, tot = Object.values(S.phil).reduce((a, b) => a + b, 0) || 1, top = topPhil(S);
    const barras = Object.keys(C.PH).map(k => `<div class="pbar"><span>${C.PH[k].a}</span><div class="track"><div class="fill" style="width:${S.phil[k] / tot * 100}%;background:var(--regc)"></div></div><span>${S.phil[k]}</span></div>`).join('');
    this.tarjeta(`<div class="big">${end.win ? '🏛️' : '🕯️'}</div><h3>${end.title}</h3><p>${end.text}</p>
      <p>Gobernaste ${S.year === 1 ? '1 año' : S.year + ' años'}. Llegaste a ${C.STAGES[S.stage].n} con ${S.pop} habitantes, ${Math.round(S.gold)} de oro, ${Math.round(totDebt(S))} de deuda y calificación ${rating(S).l}.</p>
      <h2>Tu perfil de gobierno</h2>${S.phil[top] ? `<p><b>${C.PH[top].n} (${C.PH[top].a}).</b> ${C.PROFILE[top]}</p>` : ''}${barras}
      <div class="phil" style="margin-top:12px"><b>Para reflexionar</b><br>¿Tu gobierno fue del pueblo, por el pueblo y para el pueblo, o solo en su nombre? ¿Qué decisión cambiarías y por qué?</div>
      ${nuevos.length ? `<p><b>Logros nuevos:</b> ${nuevos.map(a => a.n).join(', ')}.</p>` : ''}
      ${end.win ? '<button class="main" id="seguirB">Seguir gobernando</button>' : ''}<button class="${end.win ? 'btn' : 'main'}" id="nuevaB" ${end.win ? 'style="width:100%;margin-top:8px"' : ''}>Nueva partida</button><button class="btn" id="verB" style="width:100%;margin-top:8px">Ver el territorio</button>`, false);
    this.boton('seguirB', () => { S.over = false; S.ganado = true; this.cerrarTarjeta(); this.mapa.cambio(true); this.render(); guardarYa(S); this.toast('Sigues gobernando tu Polis. Ya no hay meta: gobierna como quieras y cuida lo logrado.'); });
    this.boton('nuevaB', () => { this.cerrarTarjeta(); this.mapa.scene.start('Arranque', { nueva: true }); });
    this.boton('verB', () => this.cerrarTarjeta());
  }
  ayuda(primera) {
    const S = this.S;
    this.tarjeta(`<div class="big">🏛️</div><h3>${primera ? 'Bienvenido, gobernante' : 'Cómo jugar'}</h3>
      <p>Gobiernas un territorio del Tolima junto al río. Llévalo de Aldea a Pueblo, Ciudad y Polis, y sostén la Polis ${D(S).polis} años.</p>
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
