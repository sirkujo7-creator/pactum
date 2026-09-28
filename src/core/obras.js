// Construir, deshacer y demoler.
import { clamp } from './azar.js';
import { C } from './contenido.js';
import { cap, cost } from './reglas.js';
import { nearRiver } from './mundo.js';

// Devuelve el motivo por el que no se puede construir k en la casilla i, o '' si se puede.
export function whyNot(S, k, i) {
  const x = S.map[i], b = C.B[k];
  if (x.t === 'rio') return 'No se puede construir sobre el río.';
  if (x.b) return 'Esa casilla ya está ocupada.';
  if (!b.ok.includes(x.t)) return `${b.n}: ese terreno no sirve.`;
  if (b.hmin && (x.h || 0) < b.hmin) return `${b.n}: necesita ladera (terreno alto).`;
  if (b.river && !nearRiver(S, i)) return `${b.n}: debe estar junto al río.`;
  if (S.gold < cost(S, k)) return `Te faltan ${cost(S, k) - Math.floor(S.gold)} de oro.`;
  return '';
}

// Devuelve true, un mensaje (si taló bosque) o el motivo por el que no se pudo.
export function build(S, k, i) {
  const r = whyNot(S, k, i);
  if (r) return r;
  const x = S.map[i];
  S.gold -= cost(S, k);
  let msg = '';
  if (x.t === 'bosque') { x.t = 'llano'; S.env = clamp(S.env - 3, 0, 100); msg = 'Talaste bosque: el ambiente baja.'; }
  S.undo.push({ i, k, paid: cost(S, k), forest: x.t === 'llano' && !!msg });
  x.b = k;
  return msg || true;
}

export function undoBuild(S) {
  const u = S.undo.pop();
  if (!u) return null;
  const x = S.map[u.i];
  x.b = null; S.gold += u.paid;
  if (u.forest) { x.t = 'bosque'; S.env = clamp(S.env + 3, 0, 100); }
  if (S.pop > cap(S)) S.pop = cap(S);
  return u;
}

// Demoler devuelve el 30% del costo actual.
export function demolish(S, i) {
  const x = S.map[i];
  if (!x.b) return 0;
  const g = Math.round(cost(S, x.b) * .3);
  S.gold += g; x.b = null;
  if (S.pop > cap(S)) S.pop = cap(S);
  return g;
}

export function freeTiles(S, k) { return S.map.map((x, i) => i).filter(i => !whyNot(S, k, i)); }

// Vista previa de una obra (como en la v9): qué cambia si se construye en el primer lugar posible.
// Devuelve { motivo } si no se puede, o { i, costo, dn, net, dj, df, cupos, de }.
import { finance } from './hacienda.js';
import { envTarget } from './sociedad.js';
import { counts } from './reglas.js';
export function vistaPrevia(S, k, iElegida) {
  let t = iElegida !== undefined ? [iElegida].filter(i => !whyNot(S, k, i)) : freeTiles(S, k);
  if (!t.length) return { motivo: S.gold < cost(S, k) ? `Te faltan ${cost(S, k) - Math.floor(S.gold)} de oro.` : 'No hay terreno disponible.' };
  if (k === 'cultivo' && iElegida === undefined) { const rv = t.filter(i => nearRiver(S, i)); if (rv.length) t = rv; }
  const i = t[0], x = S.map[i], F0 = finance(S), e0 = envTarget(S, counts(S));
  const tt = x.t; x.b = k; if (tt === 'bosque') x.t = 'llano';
  const F1 = finance(S), e1 = envTarget(S, counts(S));
  x.b = null; x.t = tt;
  return {
    i, costo: cost(S, k), dn: F1.net - F0.net, net: F1.net,
    dj: (F1.so.jc + F1.so.ja) - (F0.so.jc + F0.so.ja), df: F1.fprod - F0.fprod,
    cupos: k === 'casa' ? 10 : 0, de: e1 - e0 - (tt === 'bosque' ? 3 : 0)
  };
}
