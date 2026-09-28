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
