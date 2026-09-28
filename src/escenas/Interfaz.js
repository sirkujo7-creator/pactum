// Interfaz en HTML sobre el mapa (adaptada de la versión 9): barra superior con recursos,
// barra inferior, panel de construir, ficha de cada casilla y avisos cortos.
import { C, counts, finance, totDebt, cost, waterCap, energy, poweredT, whyNot, vistaPrevia, seatName, RG, BIOMA, metros, nearRiver } from '../core/index.js';
import { iconoObra } from '../arte/edificios.js';
import { capaUI, el } from './pantalla.js';

const IC = {
  gold: '<svg viewBox="0 0 20 20" class="ic" aria-hidden="true"><circle cx="10" cy="10" r="8" fill="#D9A93E"/><circle cx="10" cy="10" r="5.5" fill="none" stroke="#9C7420" stroke-width="1.2"/><path d="M8.5 7.5h3M10 7.5v5" stroke="#9C7420" stroke-width="1.3"/></svg>',
  debt: '<svg viewBox="0 0 20 20" class="ic" aria-hidden="true"><path d="M4 3h10l2 2v12H4z" fill="#F1E6C8" stroke="#8B6F4A"/><path d="M6.5 8h7M6.5 11h7M6.5 14h4" stroke="#B0402C" stroke-width="1.3"/></svg>',
  food: '<svg viewBox="0 0 20 20" class="ic" aria-hidden="true"><path d="M10 18V6" stroke="#8A7A3A" stroke-width="1.4"/><ellipse cx="10" cy="5" rx="2" ry="3" fill="#E1B84A"/><ellipse cx="7" cy="9" rx="2" ry="3" transform="rotate(-30 7 9)" fill="#E1B84A"/><ellipse cx="13" cy="9" rx="2" ry="3" transform="rotate(30 13 9)" fill="#E1B84A"/><ellipse cx="7" cy="13" rx="2" ry="3" transform="rotate(-30 7 13)" fill="#D5A93E"/><ellipse cx="13" cy="13" rx="2" ry="3" transform="rotate(30 13 13)" fill="#D5A93E"/></svg>',
  pop: '<svg viewBox="0 0 20 20" class="ic" aria-hidden="true"><circle cx="7" cy="6" r="2.6" fill="#C98E62"/><path d="M2.5 17c0-4 2-6 4.5-6s4.5 2 4.5 6z" fill="#B4553A"/><circle cx="13.5" cy="7" r="2.3" fill="#E0B08A"/><path d="M9.5 17c0-3.5 1.8-5.2 4-5.2s4 1.7 4 5.2z" fill="#2D5D72"/></svg>'
};
const signo = v => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(Math.round(v));

export class Interfaz {
  constructor(mapa) {
    this.mapa = mapa;
    this.herramienta = null;
    this.iconos = {};
    const b = (texto, titulo, fn) => el('button', { class: 'redondo', 'aria-label': titulo, title: titulo, on: { click: fn } }, texto);
    this.era = el('div', { class: 'era' });
    this.hud = el('div', { class: 'hud', 'aria-live': 'polite' });
    this.tray = el('div', { class: 'tray', role: 'toolbar', 'aria-label': 'Obras' });
    this.hint = el('div', { class: 'hint' });
    this.bSoltar = el('button', { class: 'btn', on: { click: () => this.elegir(null) } }, 'Soltar la obra');
    this.bDeshacer = el('button', { class: 'btn', on: { click: () => this.mapa.deshacer() } }, 'Deshacer última obra');
    this.hoja = el('section', { class: 'hoja', 'aria-label': 'Construir' }, [
      el('div', { class: 'sh-head' }, [el('h2', { text: 'Construir' }), el('button', { class: 'x', 'aria-label': 'Cerrar', on: { click: () => this.cerrarHoja() } }, '✕')]),
      this.tray, this.hint, el('div', { class: 'dos' }, [this.bSoltar, this.bDeshacer])
    ]);
    this.hoja.hidden = true;
    this.bConstruir = el('button', { class: 'dk', 'aria-expanded': 'false', on: { click: () => this.alternarHoja() } }, [el('span', { class: 'di', text: '🔨' }), 'Construir']);
    this.ficha = el('div', { class: 'ficha', role: 'dialog', 'aria-label': 'Ficha de la casilla' });
    this.ficha.hidden = true;
    this.aviso = el('div', { class: 'aviso', role: 'status' });
    this.brindis = el('div', { class: 'toast', role: 'status', 'aria-live': 'polite' });
    this.raiz = el('div', { class: 'mapa-ui' }, [
      el('header', { class: 'arriba' }, [this.era, this.hud]),
      el('div', { class: 'controles' }, [
        b('+', 'Acercar (+)', () => mapa.listo && mapa.zoomCentro(1.25)),
        b('−', 'Alejar (−)', () => mapa.listo && mapa.zoomCentro(1 / 1.25)),
        b('⤢', 'Ver todo el territorio (0)', () => mapa.listo && mapa.encuadrar()),
        b('⌂', 'Ir a la aldea', () => mapa.listo && mapa.enfocarAldea())
      ]),
      this.hoja, this.ficha,
      el('nav', { class: 'dock', 'aria-label': 'Acciones' }, [
        this.bConstruir,
        el('button', { class: 'dk', on: { click: () => mapa.listo && mapa.otroTerritorio() } }, [el('span', { class: 'di', text: '🗺️' }), 'Otro territorio']),
        el('button', { class: 'dk', on: { click: () => mapa.scene.start('Arranque') } }, [el('span', { class: 'di', text: '🏛️' }), 'Portada'])
      ]),
      this.aviso, this.brindis
    ]);
    capaUI().append(this.raiz);
  }

  destruir() { this.raiz.remove(); }
  avisar(t) { this.aviso.textContent = t; this.aviso.hidden = !t; }
  toast(t) {
    this.brindis.textContent = t; this.brindis.classList.add('show');
    clearTimeout(this._t); this._t = setTimeout(() => this.brindis.classList.remove('show'), 2600);
  }
  icono(k) {
    const S = this.mapa.S, clave = `${k}-${S.stage >= 2 ? 2 : 0}-${k === 'agora' ? S.reg : ''}`;
    return this.iconos[clave] || (this.iconos[clave] = iconoObra(k, S.stage, S.reg));
  }
  nombre(k) { return k === 'agora' ? seatName(this.mapa.S) : C.B[k].n; }

  // ---------- Panel de construir ----------
  alternarHoja() { this.hoja.hidden ? this.abrirHoja() : this.cerrarHoja(); }
  abrirHoja() { this.cerrarFicha(); this.hoja.hidden = false; this.bConstruir.classList.add('on'); this.bConstruir.setAttribute('aria-expanded', 'true'); this.render(); }
  cerrarHoja() { this.hoja.hidden = true; this.bConstruir.classList.remove('on'); this.bConstruir.setAttribute('aria-expanded', 'false'); this.elegir(null); }
  elegir(k) {
    this.herramienta = this.herramienta === k ? null : k;
    this.mapa.marcarPosibles(this.herramienta);
    this.render();
  }

  render() {
    const S = this.mapa.S;
    if (!S) return;
    const c = counts(S), F = finance(S), etapa = C.STAGES[S.stage].n;
    this.era.innerHTML = `<b>${RG(S).n.split(' ')[0]}</b><span>· ${etapa}, año ${S.year}</span>`;
    const dfood = F.fprod - F.cons;
    this.hud.innerHTML =
      `<div class="pill" title="Oro">${IC.gold}<b class="${S.gold < 0 ? 'neg' : ''}">${Math.round(S.gold)}</b></div>` +
      `<div class="pill" title="Deuda">${IC.debt}<b>${Math.round(totDebt(S))}</b></div>` +
      `<div class="pill" title="Alimento">${IC.food}<b>${Math.round(S.food)}</b><small class="${dfood < 0 ? 'neg' : ''}">${dfood >= 0 ? '+' : '−'}${Math.abs(dfood)}</small></div>` +
      `<div class="pill" title="Población">${IC.pop}<b>${S.pop}</b><small>/${c.casa * 10}</small></div>` +
      (S.stage >= 1 ? `<div class="pill" title="Agua">💧<b class="${S.pop > waterCap(S, c) ? 'neg' : ''}">${waterCap(S, c)}</b></div><div class="pill" title="Energía para talleres">⚡<b class="${c.taller > energy(S, c) ? 'neg' : ''}">${poweredT(S, c)}/${c.taller}</b></div>` : '');
    if (this.hoja.hidden) return;
    // Bandeja de obras.
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
    this.bDeshacer.hidden = !S.undo.length;
    // Con una obra elegida, el panel se encoge para dejar ver el mapa (como en la v9).
    this.hoja.classList.toggle('mini', !!k);
  }

  // ---------- Ficha de una casilla ----------
  abrirFicha(i) {
    const S = this.mapa.S, T = this.mapa.T, t = T.tiles[i], x = S.map[i];
    const hijos = [];
    if (x.b) {
      hijos.push(el('img', { src: this.icono(x.b), alt: '' }), el('b', { text: this.nombre(x.b) }), el('span', { text: C.B[x.b].d }),
        el('span', { text: `Mantenimiento: ${Math.round(C.B[x.b].up * S.price)} de oro al año.` }));
      const g = Math.round(cost(S, x.b) * .3);
      hijos.push(el('div', { class: 'dos' }, [
        el('button', { class: 'btn', on: { click: () => this.mapa.demoler(i) } }, `Demoler (+${g} oro)`),
        el('button', { class: 'btn', on: { click: () => this.cerrarFicha() } }, 'Cerrar')
      ]));
    } else {
      const B = BIOMA[t.b];
      const uso = x.t === 'rio' ? 'No se puede construir sobre el río. En sus orillas van acueductos, molinos y puertos.'
        : x.t === 'montana' ? 'Montaña: solo admite minas (desde Ciudad).'
        : x.t === 'bosque' ? 'Bosque: construir aquí tala el bosque y baja el ambiente.'
        : nearRiver(S, i) ? 'Tierra fértil junto al río: un cultivo aquí rinde más.'
        : x.h >= 1 ? 'Ladera: aquí crece el café.' : 'Terreno libre para construir.';
      hijos.push(el('b', { text: B.n, style: 'grid-column:1/-1' }), el('span', { style: 'grid-column:1/-1', text: `Piso térmico: ${B.p}. Unos ${metros(t.h).toLocaleString('es-CO')} m de altura.` }), el('span', { style: 'grid-column:1/-1', text: uso }));
    }
    this.ficha.replaceChildren(...hijos);
    this.ficha.hidden = false;
  }
  cerrarFicha() { this.ficha.hidden = true; this.mapa.marcar(null); }

  // Mensaje cuando no se puede construir en la casilla tocada.
  motivo(k, i) { return whyNot(this.mapa.S, k, i); }
}
