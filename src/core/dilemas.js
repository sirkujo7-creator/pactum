// Dilemas, peticiones del pueblo y consecuencias diferidas.
import { azar, rnd, clamp } from './azar.js';
import { C } from './contenido.js';
import { D, counts, cap, cumple } from './reglas.js';
import { calcHap } from './sociedad.js';

// Aplica los efectos de una decisión, ajustados por la dificultad. Devuelve los efectos reales.
export function applyFx(S, fx0) {
  const fx = {};
  for (const [k, v] of Object.entries(fx0)) {
    const bad = (k === 'd' || k === 'i') ? v > 0 : k === 'txe' ? false : v < 0;
    fx[k] = k === 'txe' ? v : Math.round(v * (bad ? D(S).bad : D(S).good));
  }
  if (fx.t) S.gold += fx.t;
  if (fx.f) S.food = Math.max(0, S.food + fx.f);
  if (fx.p) S.pop = clamp(S.pop + fx.p, 1, Math.max(1, cap(S)));
  if (fx.h) { S.sat.c = clamp(S.sat.c + fx.h, 0, 100); S.sat.a = clamp(S.sat.a + fx.h, 0, 100); S.sat.e = clamp(S.sat.e + fx.h, 0, 100); }
  if (fx.sc) S.sat.c = clamp(S.sat.c + fx.sc, 0, 100);
  if (fx.sa) S.sat.a = clamp(S.sat.a + fx.sa, 0, 100);
  if (fx.se) S.sat.e = clamp(S.sat.e + fx.se, 0, 100);
  if (fx.e) S.eq = clamp(S.eq + fx.e, 0, 100);
  if (fx.c) S.tr = clamp(S.tr + fx.c, 0, 100);
  if (fx.a) S.env = clamp(S.env + fx.a, 0, 100);
  if (fx.d) S.debt = Math.max(0, S.debt + fx.d);
  if (fx.i) S.shock += fx.i / 100;
  if (fx.txe) S.tx.e = clamp(S.tx.e + fx.txe, 0, 50);
  S.hap = calcHap(S);
  return fx;
}

// Escoge el suceso del año: primero las consecuencias que vencen, luego peticiones o dilemas.
export function drawEvent(S) {
  const due = S.later.findIndex(l => l.y <= S.year);
  if (due >= 0) {
    const l = S.later.splice(due, 1)[0], L = C.LATER[l.id];
    return {
      id: l.id, e: L.e, title: L.title, text: `${L.text} Es consecuencia de lo que decidiste en el año ${l.from}.`, followUp: true,
      opts: [{ l: 'Asumir las consecuencias', fx: L.fx, f: null, why: L.why, vista: L.vista }]
    };
  }
  if (S.year < 3 || azar() > D(S).evp) return null;
  if (S.stage >= 1 && S.promises.length === 0 && azar() < C.PET.prob) return petition(S);
  const c = counts(S);
  const pool = C.EV.filter(e => S.stage >= e.st && cumple(S, e.cond, c) && !S.recent.includes(e.id));
  if (!pool.length) return null;
  // Fase 1: en un año de El Niño o La Niña, casi siempre sale un dilema del clima.
  const delClima = pool.filter(e => e.cond && e.cond.clima);
  const e = delClima.length && azar() < .8 ? delClima[rnd(delClima.length)] : pool[rnd(pool.length)];
  S.recent.push(e.id);
  if (S.recent.length > 7) S.recent.shift();
  return { id: e.id, e: e.e, title: e.title, text: e.text, opts: e.opts };
}

export function petition(S) {
  const ks = C.PET.ks.filter(k => C.B[k].st <= S.stage);
  const k = ks[rnd(ks.length)];
  return {
    id: 'pet', e: C.PET.e, title: C.PET.title.replace('{edificio}', C.B[k].a), text: C.PET.text,
    opts: C.PET.opts.map(o => o.promesa ? Object.assign({}, o, { promise: k }) : o)
  };
}

// Elige la opción i del suceso pendiente.
export function choose(S, i) {
  const ev = S.pend, o = ev.opts[i];
  if (o.vista) S.vis = { k: o.vista, y: S.year };
  const real = applyFx(S, o.fx);
  if (o.f) { S.phil[o.f]++; S.corr = clamp(S.corr + (o.f === 'real' ? 9 : o.f === 'util' ? 1 : -4), 0, 100); }
  if (o.promise) S.promises.push({ k: o.promise, base: counts(S)[o.promise], dl: S.year + C.PET.plazo });
  if (o.later && (o.later[2] === undefined || azar() < o.later[2])) S.later.push({ y: S.year + o.later[0], id: o.later[1], from: S.year });
  S.log.unshift({ y: S.year, t: ev.followUp ? `${ev.title}.` : `${ev.title}. Decidiste: ${o.l.toLowerCase()}.` });
  S.pend = null;
  return Object.assign({}, o, { fx: real });
}

// Postura de un personaje (Doña Rosa, Julián, Don Aurelio) frente a unos efectos: 1 a favor, -1 en contra, 0 neutral.
export function stance(a, fx) {
  const v = (fx[C.ADV[a].k] || 0) + (fx.h || 0) + (a === 'aurelio' && fx.txe ? -fx.txe : 0);
  return v > 1 ? 1 : v < -1 ? -1 : 0;
}
