// Construir, deshacer y demoler.
import { clamp } from './azar.js';
import { C } from './contenido.js';
import { contradecir, deshacerFaltas } from './acta.js';
import { climaActivo } from './clima.js';
import { cap, cost } from './reglas.js';
import { nearRiver } from './mundo.js';
import { marcarTala } from './suelo.js';
import { cuotaInicial, empezarObra, devolucionObra, porEtapas, oferta, aplicarOferta } from './construccion.js';

// Devuelve el motivo por el que no se puede construir k en la casilla i, o '' si se puede.
export function whyNot(S, k, i) {
  const x = S.map[i], b = C.B[k];
  if (x.t === 'rio') return 'No se puede construir sobre el río.';
  if (x.b) return 'Esa casilla ya está ocupada.';
  if (!b.ok.includes(x.t)) return `${b.n}: ese terreno no sirve.`;
  if (b.hmin && (x.h || 0) < b.hmin) return `${b.n}: necesita ladera (terreno alto).`;
  if (b.river && !nearRiver(S, i)) return `${b.n}: debe estar junto al río.`;
  const pago = cuotaInicial(S, k, cost(S, k));
  if (S.gold < pago) return `Te faltan ${pago - Math.floor(S.gold)} de oro.`;
  return '';
}

// Devuelve true, un mensaje (si taló bosque) o el motivo por el que no se pudo.
// ofertaElegida (fase 2): contratista de la licitación; sin ella, la oferta de buena reputación.
export function build(S, k, i, ofertaElegida) {
  const r = whyNot(S, k, i);
  if (r) return r;
  const x = S.map[i], o = porEtapas(S, k) ? oferta(S, k, ofertaElegida, i) : null, total = o ? o.total : cost(S, k), pago = o ? o.cuota : cuotaInicial(S, k, total);
  if (S.gold < pago) return `Te faltan ${pago - Math.floor(S.gold)} de oro.`;
  S.gold -= pago; // fase 2: las obras grandes pagan solo su primera etapa
  let msg = '';
  const tl = x.tl;
  if (x.t === 'bosque') { x.t = 'llano'; S.env = clamp(S.env - 3, 0, 100); msg = 'Talaste bosque: el ambiente baja.'; marcarTala(S, i); }
  S.undo.push({ i, k, paid: pago, forest: x.t === 'llano' && !!msg, ...(msg && x.tl && !tl ? { tl: 1 } : {}) });
  x.b = k;
  empezarObra(S, i, k, total, o ? o.anios : undefined);
  const nLater = S.later.length, aviso = aplicarOferta(S, i, k, o);
  // Deshacer también devuelve el soborno (y borra el escándalo pendiente).
  if (o && o.sob) Object.assign(S.undo[S.undo.length - 1], { sob: o.sob, rumbo: o.rumbo || 0, escandalo: S.later.length > nLater });
  if (aviso.length) msg = [msg, ...aviso].filter(Boolean).join(' ');
  // Fase 3: abrir una mina o aceptar un soborno puede contradecir el acta fundacional.
  const faltas = [...(k === 'mina' ? contradecir(S, 'mina') : []), ...(o && o.sob ? contradecir(S, 'soborno') : [])];
  if (faltas.length) S.undo[S.undo.length - 1].acta = faltas.length;
  return msg || true;
}

export function undoBuild(S) {
  const u = S.undo.pop();
  if (!u) return null;
  const x = S.map[u.i];
  x.b = null; delete x.ob; delete x.mt; delete x.u; S.gold += u.paid;
  if (u.sob) { S.gold -= u.sob; S.corr = Math.max(0, S.corr - u.rumbo); if (u.escandalo) S.later.pop(); }
  if (u.acta) deshacerFaltas(S, u.acta);
  if (u.forest) { x.t = 'bosque'; S.env = clamp(S.env + 3, 0, 100); if (u.tl) delete x.tl; }
  if (S.pop > cap(S)) S.pop = cap(S);
  return u;
}

// Demoler devuelve el 30% del costo actual.
export function demolish(S, i) {
  const x = S.map[i];
  if (!x.b) return 0;
  const g = x.ob ? devolucionObra(x) : Math.round(cost(S, x.b) * .3);
  S.gold += g; x.b = null; delete x.ob; delete x.mt; delete x.u;
  if (S.pop > cap(S)) S.pop = cap(S);
  return g;
}

export function freeTiles(S, k) { return S.map.map((x, i) => i).filter(i => !whyNot(S, k, i)); }

// Vista previa de una obra (como en la v9): qué cambia si se construye en el primer lugar posible.
// Devuelve { motivo } si no se puede, o { i, costo, dn, net, dj, df, cupos, de }.
import { finance } from './hacienda.js';
import { envTarget, satTargets } from './sociedad.js';
import { counts } from './reglas.js';
export function vistaPrevia(S, k, iElegida) {
  let t = iElegida !== undefined ? [iElegida].filter(i => !whyNot(S, k, i)) : freeTiles(S, k);
  if (!t.length) return { motivo: S.gold < cuotaInicial(S, k, cost(S, k)) ? `Te faltan ${cuotaInicial(S, k, cost(S, k)) - Math.floor(S.gold)} de oro.` : 'No hay terreno disponible.' };
  if (k === 'cultivo' && iElegida === undefined) { const rv = t.filter(i => nearRiver(S, i)); if (rv.length) t = rv; }
  const i = t[0], x = S.map[i], F0 = finance(S), e0 = envTarget(S, counts(S)), a0 = satTargets(S, counts(S), false);
  const tt = x.t; x.b = k; if (tt === 'bosque') x.t = 'llano';
  const F1 = finance(S), e1 = envTarget(S, counts(S)), a1 = satTargets(S, counts(S), false);
  x.b = null; x.t = tt;
  return {
    i, costo: cost(S, k), cuota: cuotaInicial(S, k, cost(S, k)), anios: porEtapas(S, k) ? C.B[k].anios : 0, dn: F1.net - F0.net, net: F1.net,
    dj: (F1.so.jc + F1.so.ja) - (F0.so.jc + F0.so.ja), df: F1.fprod - F0.fprod,
    cupos: k === 'casa' ? 10 : 0, de: e1 - e0 - (tt === 'bosque' ? 3 : 0), ...detalle(S, k, F0, F1, a0, a1)
  };
}
// Claridad: detalle de lo que cambia (empleos por clase, ánimo de cada clase, agua, energía, alcance, mantenimiento).
function detalle(S, k, F0, F1, a0, a1) {
  const B = C.B[k];
  return {
    djc: F1.so.jc - F0.so.jc, dja: F1.so.ja - F0.so.ja,
    dsat: { c: a1.c - a0.c, a: a1.a - a0.a, e: a1.e - a0.e },
    agua: B.water || 0, energia: B.energy || 0, mant: Math.round(B.up * S.price),
    radio: C.COB && climaActivo(S) && S.stage >= 1 ? (C.COB.radios[k] || 0) : 0
  };
}
// Lo que aporta hoy una obra ya construida: lo que se perdería si no estuviera.
export function aporteObra(S, i) {
  const x = S.map[i], k = x.b;
  if (!k) return null;
  const F1 = finance(S), e1 = envTarget(S, counts(S)), a1 = satTargets(S, counts(S), false), ob = x.ob, u = x.u;
  x.b = null; delete x.ob; delete x.u;
  const F0 = finance(S), e0 = envTarget(S, counts(S)), a0 = satTargets(S, counts(S), false);
  x.b = k; if (ob) x.ob = ob; if (u !== undefined) x.u = u;
  return { dn: F1.net - F0.net, df: F1.fprod - F0.fprod, de: e1 - e0, cupos: k === 'casa' ? 10 : 0, ...detalle(S, k, F0, F1, a0, a1) };
}
