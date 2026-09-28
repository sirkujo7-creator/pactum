// Interfaz en HTML sobre el mapa, adaptada de la versión 9: barra superior (régimen, recursos y medidores),
// meta y guía, barra inferior con Construir, Hacienda, Sociedad, Leyes, Crónica y Terminar el año,
// paneles que suben desde abajo (a un lado en computador), fichas, tarjetas de dilemas y avisos.
import {
  C, counts, finance, totDebt, cost, waterCap, energy, poweredT, whyNot, vistaPrevia, seatName, RG, RM, D,
  BIOMA, metros, nearRiver, pensamiento, rating, canBorrow, takeLoan, issueBond, printMoney, payDebt, loanRate,
  lluvias, climaActivo, estadoSuelo, nivelObra, estadoObra, costoReparar, reparar, taxLimit, satTargets, lawSlots, lawCostNow, lawBlock, hasLaw, toggleLaw, stance, topPhil, clamp, logrosNuevos, aCodigo, desdeCodigo
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
  soc: { n: 'Sociedad', s: [{ k: 'hap', n: 'Bienestar', c: '#2F7542' }, { k: 'eq', n: 'Igualdad', c: '#7B4F8A' }, { k: 'tr', n: 'Confianza', c: '#2D5D72' }, { k: 'env', n: 'Ambiente', c: '#8A9A3A' }], o: { fijo: [0, 100] } },
  inf: { n: 'Inflación', s: [{ k: 'infl', n: 'Inflación', c: '#B0402C', u: '%' }] }
};

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
        b('⌂', 'Ir a la aldea', () => mapa.listo && mapa.enfocarAldea())
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
    clearTimeout(this._t); this._t = setTimeout(() => this.brindis.classList.remove('show'), 2600);
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
    const S = this.S;
    if (!S) return;
    const c = counts(S), F = finance(S), so = F.so, R = rating(S), rg = RG(S);
    document.documentElement.style.setProperty('--regc', rg.col);
    guardarLuego(S);
    Sonido.mode(S.reg);
    this.bSonido.textContent = Sonido.on ? '🔊' : '🔇';
    this.bSonido.setAttribute('aria-label', Sonido.on ? 'Silenciar' : 'Activar sonido'); this.bSonido.title = this.bSonido.getAttribute('aria-label');
    this.bReg.innerHTML = `${EMB[S.reg]}<b>${rg.n.split(' ')[0]}</b>`;
    this.bReg.setAttribute('aria-label', `Régimen: ${rg.n}. Ver rumbo del gobierno`);
    const L = lluvias(S), temp = this.mapa.pob ? this.mapa.pob.temporada() : null;
    this.era.innerHTML = `${C.STAGES[S.stage].n}, año ${S.year}${S.stage === 3 ? `. Polis ${S.polisYears}/${D(S).polis}` : ''}${L ? ` · ${L.icono}<span class="lluv-nom"> ${L.nombre.toLowerCase()}</span>` : ''}`;
    this.era.title = L ? `${L.texto} ${C.CLIMA.leccion}${temp ? ` Ahora es temporada ${temp === 'lluvias' ? 'de lluvias' : 'seca'}.` : ''}` : '';
    const dfood = F.fprod - F.cons;
    this.hud.innerHTML =
      `<div class="pill" title="Oro">${IC.gold}<b class="${S.gold < 0 ? 'neg' : ''}">${Math.round(S.gold)}</b></div>` +
      `<div class="pill" title="Deuda">${IC.debt}<b>${Math.round(totDebt(S))}</b></div>` +
      `<div class="pill" title="Alimento">${IC.food}<b>${Math.round(S.food)}</b><small class="${dfood < 0 ? 'neg' : ''}">${dfood >= 0 ? '+' : '−'}${Math.abs(dfood)}</small></div>` +
      `<div class="pill" title="Población">${IC.pop}<b>${S.pop}</b><small>/${c.casa * 10}</small></div>` +
      (S.stage >= 1 ? `<div class="pill" title="Agua">💧<b class="${S.pop > waterCap(S, c) ? 'neg' : ''}">${waterCap(S, c)}</b></div><div class="pill" title="Energía para talleres">⚡<b class="${c.taller > energy(S, c) ? 'neg' : ''}">${poweredT(S, c)}/${c.taller}</b></div>` : '');
    this.medidores.replaceChildren(
      ...[['Bienestar', '😊', S.hap], ['Igualdad', '⚖️', S.eq], ['Confianza', '🤝', S.tr], ['Ambiente', '🌿', S.env]].map(([n, ico, v]) =>
        el('button', { class: 'medidor', title: `${n}: ${Math.round(v)} de 100`, 'aria-label': `${n}: ${Math.round(v)} de 100`, on: { click: () => this.abrirHoja('sociedad') }, html: `<div class="lab"><span><span class="ico" aria-hidden="true">${ico}</span><span class="nom">${n}</span></span><b>${Math.round(v)}</b></div><div class="track"><div class="fill" style="width:${v}%;background:${colorDe(v)}"></div></div>` })),
      el('button', { class: 'medidor', title: 'Rumbo del gobierno: de bien común (0) a interés propio (100)', 'aria-label': `Rumbo del gobierno: ${Math.round(S.corr)}`, on: { click: () => this.infoRegimen() }, html: `<div class="lab"><span><span class="ico" aria-hidden="true">🧭</span><span class="nom">Rumbo</span></span><b>${Math.round(S.corr)}</b></div><div class="track"><div class="fill" style="width:${S.corr}%;background:${colorDe(100 - S.corr)}"></div></div>` })
    );
    // Meta, guía, promesas y exigencias (como en la v9).
    const nx = C.STAGES[S.stage + 1], g = S.guide && S.gstep < C.GUIDE.length ? C.GUIDE[S.gstep] : null;
    const meta = nx ? `Meta: ${nx.n} (${nx.req}).` : `Meta: sostener la Polis ${D(S).polis} años.`;
    const pr = S.promises.map(p => `Promesa: ${C.B[p.k].a} antes del año ${p.dl}.`).join(' ');
    const pron = climaActivo(S) && S.clima.pronostico, FEN = C.CLIMA && C.CLIMA.fenomenos;
    const avisoClima = pron ? `${FEN[pron.tipo].icono} <b>${FEN[pron.tipo].nombre} llega el año ${pron.anio}.</b> Fondo de emergencias: ${Math.round(S.fondo || 0)} de oro.` : '';
    this.meta.innerHTML = `<div class="gl1">${avisoClima || (g ? `<b>Guía ${S.gstep + 1}/${C.GUIDE.length}</b> ${g.t}` : meta)}</div>` +
      `<div class="gmore">${avisoClima && g ? `<b>Guía ${S.gstep + 1}/${C.GUIDE.length}</b> ${g.t} ` : ''}${avisoClima ? FEN[pron.tipo].preparar + ' ' : ''}${g || avisoClima ? meta + ' ' : ''}${pr ? pr + ' ' : ''}${L && L.cosecha !== 1 ? `${L.icono} ${L.texto} ` : ''}${S.expc > 0 ? `<span class="neg">El pueblo exige más calidad de vida (−${S.expc} de ánimo): parques, sede de gobierno y universidad la mejoran.</span> ` : ''}${g ? '<span class="lnk" role="button" tabindex="0" data-ocultar>Ocultar guía</span>' : ''}</div>`;
    const oc = this.meta.querySelector('[data-ocultar]');
    if (oc) oc.onclick = e => { e.stopPropagation(); S.guide = false; this.render(); };
    this.meta.hidden = !!this.hojaAbierta() || S.over;
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
        el('small', { html: bloqueada ? C.STAGES[b.st].n : `${IC.gold.replace('class="ic"', 'class="ic" style="display:inline;width:13px;height:13px;vertical-align:-2px"')} ${cost(S, k)}` })
      ]);
    }));
    const k = this.herramienta;
    if (k) {
      const v = vistaPrevia(S, k);
      let prev;
      if (v.motivo) prev = `<span class="prev neg">${v.motivo}</span>`;
      else {
        const out = [`resultado anual ${signo(v.dn)} (queda en ${signo(v.net)})`];
        if (v.dj) out.push(`${v.dj} empleos`);
        if (v.df) out.push(`alimento ${signo(v.df)} al año`);
        if (v.cupos) out.push(`${v.cupos} cupos más`);
        if (Math.abs(v.de) >= 1) out.push(`ambiente ${signo(v.de)}`);
        prev = `<span class="prev">Si lo construyes: ${out.join(', ')}. Cuesta ${v.costo} de oro. Toca una casilla marcada.</span>`;
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
        <tr><td>Tasas y regalías</td><td>+${F.fee}</td></tr><tr><td>Mantenimiento de obras${S.desgaste && (S.mant ?? 100) < 100 ? ` (${S.mant}%)` : ''}</td><td>−${F.up}</td></tr><tr><td>Administración pública</td><td>−${F.admin}</td></tr>
        ${F.lawCost ? `<tr><td>Costo de las leyes</td><td>−${F.lawCost}</td></tr>` : ''}${F.fondo ? `<tr><td>Aporte al fondo de emergencias</td><td>−${F.fondo}</td></tr>` : ''}
        ${F.pay ? `<tr><td>Cuota de préstamos (interés ${F.interest})</td><td>−${F.pay}</td></tr>` : ''}${F.cpn ? `<tr><td>Cupones de bonos</td><td>−${F.cpn}</td></tr>` : ''}${F.mat ? `<tr><td>Vencimiento de bonos</td><td>−${F.mat}</td></tr>` : ''}
        <tr class="tot"><td>Resultado del año</td><td class="${F.net < 0 ? 'neg' : ''}">${F.net >= 0 ? '+' : '−'}${Math.abs(F.net)}</td></tr></table></div>
      <div class="cuatro"><button class="btn" data-a="prestamo" ${cb ? '' : 'disabled'}>Pedir préstamo</button><button class="btn" data-a="bono" ${cb ? '' : 'disabled'}>Emitir bono</button><button class="btn" data-a="imprimir" ${S.stage < 1 || S.over ? 'disabled' : ''}>Imprimir moneda</button><button class="btn" data-a="abonar" ${S.debt <= 0 || S.gold < 1 || S.over ? 'disabled' : ''}>Abonar 50</button></div>
      <p class="small">${S.stage < 1 ? 'El crédito y la emisión se abren al llegar a Pueblo.' : R.l === 'CCC' ? 'Calificación CCC: nadie te presta. Reduce deuda y déficit.' : 'Préstamo: 150, se paga 15% por año. Bono: 200 a 5 años, interés más bajo, pagas todo al vencer.'}</p>
      ${climaActivo(S) && S.stage >= 1 ? `<h3>${C.CLIMA.fondo.nombre}</h3>
        <div class="txrow"><span>Aporte</span><input type="range" min="0" max="${C.CLIMA.fondo.maximo}" value="${S.aporteFondo || 0}" data-fondo aria-label="Aporte al fondo de emergencias, porcentaje de los ingresos"><strong>${S.aporteFondo || 0}%</strong></div>
        <p class="small">Guardado: <b>${Math.round(S.fondo || 0)} de oro</b>. ${C.CLIMA.fondo.leccion}</p>` : ''}
      ${this.seccionMantenimiento()}
      ${S.bonds.length ? `<p class="small">Bonos: ${S.bonds.map(b => `${b.amt} al ${Math.round(b.cpn * 100)}%, vence año ${b.due}`).join('; ')}.</p>` : ''}`;
    this.cuentas.querySelectorAll('[data-tx]').forEach(inp => {
      inp.oninput = () => {
        const k = inp.dataset.tx, want = +inp.value, v = taxLimit(S, k, want);
        S.tx[k] = v;
        if (v !== want) { inp.value = v; this.toast(RM(S, 'eliteCap', 0) && k === 'e' && want > RM(S, 'eliteCap', 0) ? 'La plutocracia no permite cobrar más de 10% a la élite.' : 'El Senado solo permite mover cada impuesto 5 puntos por año.'); }
        inp.nextElementSibling.textContent = v + '%';
        clearTimeout(this._tx); this._tx = setTimeout(() => this.render(), 120);
        this.mapa.cambio();
      };
    });
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
      return `<div class="cls"><img src="${retrato(a)}" alt="${A.n}"><div><div class="lab"><span>${n} <b>${k}</b></span><span>${Math.round(v)}</span></div><div class="track"><div class="fill" style="width:${v}%;background:${colorDe(v)}"></div></div><small>${sub}</small><div class="quote">${A.n}: “${md}”</div></div></div>`;
    }).join('') + `<p class="small ${so.un > 0 ? 'neg' : ''}">${so.un > 0 ? `${so.un} personas sin empleo. Construye cultivos, mercados o talleres.` : 'Todos tienen empleo.'}</p>`;
  }

  renderLeyes() {
    const S = this.S, n = Object.keys(S.laws || {}).length;
    this.leyes.innerHTML = `<p class="small">Leyes vigentes: ${n} de ${lawSlots(S)}. Promulgar cuesta ${lawCostNow(S)} de oro${S.reg === 'monarquia' || S.reg === 'tirania' ? '' : ' y 2 de confianza'}. Cada etapa abre un cupo más.</p>` +
      C.LAWS.map(l => {
        const on = hasLaw(S, l.id), bl = lawBlock(S, l);
        return `<div class="law ${on ? 'on' : ''}"><b>${l.n}</b><small>${l.d}</small>${on ? `<small>Vigente desde el año ${S.laws[l.id]}.</small>` : ''}${bl && !on ? `<small class="neg">${bl}</small>` : ''}<button class="btn" data-ley="${l.id}" ${(bl && !on) || S.over ? 'disabled' : ''}>${on ? 'Derogar' : 'Promulgar'}</button></div>`;
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
        el('span', { text: `Mantenimiento: ${Math.round(C.B[x.b].up * S.price)} de oro al año.` }));
      const suelo = this.textoSuelo(i);
      if (suelo) hijos.push(el('span', { class: 'suelo', text: suelo }));
      if (S.desgaste && nivelObra(x) > 0) { const e = estadoObra(x); hijos.push(el('span', { class: 'suelo', text: `${e.nombre}: ${C.DESGASTE.textos[e.id]}` })); }
      const g = Math.round(cost(S, x.b) * .3), rep = S.desgaste ? costoReparar(S, i) : 0;
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
    this.tarjeta(`${img}<h3>${ev.title}</h3><p>${ev.text}</p>` + ev.opts.map((o, i) =>
      `<button class="opt" data-o="${i}">${ev.followUp ? '' : `<span class="stances">${Object.keys(C.ADV).map(a => { const st = stance(a, o.fx); return st ? `<span class="st ${st > 0 ? 'pro' : 'con'}"><img src="${retrato(a)}" alt="${C.ADV[a].n}">${st > 0 ? '✓' : '✗'}</span>` : ''; }).join('')}</span>`}${o.l}${ev.followUp ? `<small>${Object.keys(o.fx).length ? 'Ver efectos' : ''}</small>` : `<small>${o.fx.t ? (o.fx.t > 0 ? '+' : '−') + Math.abs(o.fx.t) + ' oro' : 'Sin costo en oro'}. Las demás consecuencias se verán después.</small>`}</button>`).join(''), false);
    this.card.querySelectorAll('[data-o]').forEach(b => b.onclick = () => {
      const o = this.mapa.elegirOpcion(+b.dataset.o), p = o.f ? C.PH[o.f] : null;
      this.tarjeta(`${img}<h3>${ev.followUp ? ev.title : o.l}</h3><div class="chips">${this.chips(o.fx)}</div>
        <div class="phil"><b>${p ? `${p.n} (${p.a})` : 'Lección'}</b><br>${o.why}</div>${this.reacciones(o.fx)}${o.later ? '<p class="small">Esta decisión puede tener consecuencias en los próximos años.</p>' : ''}
        <button class="main" id="okB">Continuar</button>`);
      this.alCerrar = alTerminar;
      this.boton('okB', () => this.cerrarTarjeta());
    });
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
    alTerminar();
  }
  etapa(alTerminar) {
    const S = this.S, st = C.STAGES[S.stage];
    const nuevas = Object.entries(C.B).filter(([, b]) => b.st === S.stage).map(([k, b]) => `${b.e} ${k === 'agora' ? seatName(S) : b.n}`).join(', ');
    this.tarjeta(`<div class="big">🎉</div><h3>Tu territorio es ahora ${st.n}</h3><p>${st.lesson}</p>${nuevas ? `<p><b>Nuevas construcciones:</b> ${nuevas}.</p>` : ''}<button class="main" id="okB">Seguir gobernando</button>`);
    this.alCerrar = alTerminar; this.boton('okB', () => this.cerrarTarjeta());
  }
  cambioRegimen(ch, alTerminar) {
    const REG = C.REG;
    const T = { cor: `${REG[ch.from].n} se corrompió en ${REG[ch.to].n}`, rev: `Revolución: cae ${REG[ch.from].n}`, ref: `Reforma: vuelve ${REG[ch.to].n}` }[ch.type];
    const L = {
      cor: 'Aristóteles distinguía las formas rectas, que gobiernan para el bien común, de sus desviaciones, que gobiernan para el interés propio. Tus decisiones inclinaron el poder hacia una facción.',
      rev: 'Polibio describió un ciclo: cada forma corrupta provoca la reacción que la derriba y da paso a la siguiente forma recta. La revolución costó oro y vidas.',
      ref: 'Un gobierno desviado puede enderezarse cuando vuelve a servir al bien común. Lo lograste sin revolución.'
    }[ch.type];
    this.tarjeta(`<div class="regh" style="--rc:${REG[ch.to].col}">${EMB[ch.to]}</div><h3>${T}</h3><div class="phil"><b>${ch.type === 'rev' ? 'Polibio' : 'Aristóteles'}</b><br>${L}</div>
      <p><b>Ahora gobierna: ${REG[ch.to].n}.</b> ${REG[ch.to].d}</p><button class="main" id="okB">Continuar</button>`);
    this.alCerrar = alTerminar; this.boton('okB', () => this.cerrarTarjeta());
  }
  infoRegimen() {
    const S = this.S, R0 = RG(S), c = Math.round(S.corr), REG = C.REG;
    this.tarjeta(`<div class="regh" style="--rc:${R0.col}">${EMB[S.reg]}</div><h3>${R0.n}</h3><p>${R0.d}</p>
      <p class="small">Tu cargo: ${R0.t}. Sede: ${seatName(S)}.</p>
      <h2>Rumbo del gobierno</h2><div class="rumbo"><div style="width:${c}%"></div></div><div class="rlab"><span>Bien común</span><span>Interés propio</span></div>
      <p class="small">${R0.rect ? `Si llega a 70, ${R0.n.toLowerCase()} se corrompe en ${REG[R0.cor].n.toLowerCase()}.` : `Si baja a 20, puedes reformarlo. Si la confianza se hunde, estalla una revolución y llega ${REG[R0.cyc].n.toLowerCase()}.`}
      Sube al elegir por conveniencia o represión, al incumplir promesas y al abandonar a una clase. Baja al actuar por deber, justicia o prudencia y al cumplirle al pueblo.</p>
      <p class="small">Ciclo de Polibio: ${C.CYCLE.map(k => k === S.reg ? `<b>${REG[k].n}</b>` : REG[k].n).join(', ')}.</p>
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
      <p>Gobernaste ${S.year} años. Llegaste a ${C.STAGES[S.stage].n} con ${S.pop} habitantes, ${Math.round(S.gold)} de oro, ${Math.round(totDebt(S))} de deuda y calificación ${rating(S).l}.</p>
      <h2>Tu perfil de gobierno</h2>${S.phil[top] ? `<p><b>${C.PH[top].n} (${C.PH[top].a}).</b> ${C.PROFILE[top]}</p>` : ''}${barras}
      <div class="phil" style="margin-top:12px"><b>Para reflexionar</b><br>¿Tu gobierno fue del pueblo, por el pueblo y para el pueblo, o solo en su nombre? ¿Qué decisión cambiarías y por qué?</div>
      ${nuevos.length ? `<p><b>Logros nuevos:</b> ${nuevos.map(a => a.n).join(', ')}.</p>` : ''}
      <button class="main" id="nuevaB">Nueva partida</button><button class="btn" id="verB" style="width:100%;margin-top:8px">Ver el territorio</button>`, false);
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
      <p><b>Régimen.</b> Cada régimen cambia la sede, los colores y las reglas. Si gobiernas para ti o para una facción, el régimen se corrompe; si el pueblo pierde la confianza, estalla una revolución. Toca el emblema para ver tu rumbo.</p>
      <p><b>Agua, energía y ladera.</b> Desde Pueblo necesitas acueductos para crecer y molinos para que los talleres funcionen. El café solo crece en ladera y el puerto va junto al río.</p>
      <p><b>Leyes.</b> Cada etapa te da un cupo más, y cada ley tiene ganadores y perdedores.</p>
      <p><b>Exigencia creciente.</b> Con los años el pueblo espera más calidad de vida. Lo que bastaba al principio no basta al final.</p>
      <p><b>Controles.</b> En el celular: arrastra, pellizca para acercar y toca casillas o personas. En el computador: arrastra, usa la rueda para acercar, flechas para moverte, 1 a 5 para los paneles y la barra espaciadora para terminar el año.</p>
      <p>Pierdes si la confianza o el ambiente llegan a cero, si caes dos veces en cesación de pagos o si pierdes unas elecciones.</p>
      <button class="main" id="okB">${primera ? 'Empezar a gobernar' : 'Entendido'}</button>`);
    this.boton('okB', () => this.cerrarTarjeta());
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
