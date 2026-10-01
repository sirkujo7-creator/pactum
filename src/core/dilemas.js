// Dilemas, peticiones del pueblo y consecuencias diferidas.
import { azar, rnd, clamp } from './azar.js';
import { C } from './contenido.js';
import { D, counts, cap, cumple } from './reglas.js';
import { calcHap } from './sociedad.js';
import { climaActivo } from './clima.js';
import { fuerzaActiva, usarFuerza, sabotear } from './fuerza.js';
import { demandaDelAnio, responderMovimiento } from './movimientos.js';

// Aplica los efectos de una decisión, ajustados por la dificultad. Devuelve los efectos reales.
export function applyFx(S, fx0) {
  const fx = {};
  for (const [k, v] of Object.entries(fx0)) {
    const bad = (k === 'd' || k === 'i') ? v > 0 : k === 'txe' || k === 'ti' ? false : v < 0;
    // Con la regla contra rachas (terreno en acuarela) hay menos golpes seguidos, pero cada golpe pesa un tercio más.
    fx[k] = k === 'txe' || k === 'ti' ? v : Math.round(v * (bad ? (climaActivo(S) && D(S).badSR ? D(S).badSR : D(S).bad) : D(S).good));
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
  // Fase 3: parte de los campesinos con tierra propia (en puntos de porcentaje; solo en el terreno en acuarela).
  if (fx.ti && climaActivo(S) && S.tierra !== undefined) S.tierra = clamp(S.tierra + fx.ti / 100, .05, .95);
  S.hap = calcHap(S);
  return fx;
}

// Escoge el suceso del año: primero las consecuencias que vencen, luego peticiones o dilemas.
// Claridad (decisión de Juan: menos rachas, igual exigencia): en el terreno en acuarela hay sucesos buenos y,
// tras dos golpes seguidos (dilemas malos, consecuencias malas o crisis), el año siguiente trae un suceso bueno
// o un año tranquilo; las consecuencias malas que venzan esperan un año. En el modo v9 todo queda igual.
export function drawEvent(S) {
  if (!climaActivo(S)) return drawEventV9(S);
  const crisis = !!(S.clima.fenomeno || (S.eco && S.eco.fase === 'recesion')), racha = (S.racha || 0) + (crisis ? 1 : 0);
  if (racha >= 2) {
    S.later.forEach(l => { if (l.y <= S.year && !(C.LATER[l.id] && C.LATER[l.id].bueno)) l.y = S.year + 1; });
    const due = S.later.findIndex(l => l.y <= S.year);
    if (due >= 0) { S.racha = 0; return consecuencia(S, due); }
    const c = counts(S), buenos = C.EV.filter(e => e.bueno && S.stage >= e.st && cumple(S, e.cond, c) && !S.recent.includes(e.id));
    S.racha = 0;
    if (!buenos.length) return null; // sin sucesos buenos disponibles: año tranquilo
    return elegido(S, buenos[rnd(buenos.length)]);
  }
  const ev = drawEventV9(S, false); // los sucesos buenos solo llegan para cortar una racha
  if (ev && !ev.pet) S.racha = ev.bueno ? 0 : (S.racha || 0) + 1;
  else if (!ev) {
    // Fase 3: en un año sin dilema, un movimiento con demandas puede llegar a la plaza.
    const d = S.year >= 3 ? demandaDelAnio(S) : null;
    if (d) { S.racha = (S.racha || 0) + 1; return d; }
    S.racha = 0;
  }
  return ev;
}
function consecuencia(S, due) {
  const l = S.later.splice(due, 1)[0], L = C.LATER[l.id];
  return {
    id: l.id, e: L.e, title: L.title, text: `${L.text} Es consecuencia de lo que decidiste en el año ${l.from}.`, followUp: true, bueno: L.bueno,
    opts: [{ l: 'Asumir las consecuencias', fx: L.fx, f: null, why: L.why, vista: L.vista }]
  };
}
function elegido(S, e) {
  S.recent.push(e.id);
  if (S.recent.length > 7) S.recent.shift();
  return { id: e.id, e: e.e, title: e.title, text: e.text, opts: e.opts, bueno: e.bueno };
}
// Sorteo de la versión 9 (con buenos: incluye los sucesos buenos del terreno en acuarela).
function drawEventV9(S, conBuenos = false) {
  const due = S.later.findIndex(l => l.y <= S.year);
  if (due >= 0) {
    const l = S.later.splice(due, 1)[0], L = C.LATER[l.id];
    return {
      id: l.id, e: L.e, title: L.title, text: `${L.text} Es consecuencia de lo que decidiste en el año ${l.from}.`, followUp: true,
      opts: [{ l: 'Asumir las consecuencias', fx: L.fx, f: null, why: L.why, vista: L.vista }], ...(L.bueno ? { bueno: true } : {})
    };
  }
  if (S.year < 3 || azar() > D(S).evp) return null;
  if (S.stage >= 1 && S.promises.length === 0 && azar() < C.PET.prob) return petition(S);
  const c = counts(S);
  const pool = C.EV.filter(e => (conBuenos || !e.bueno) && S.stage >= e.st && cumple(S, e.cond, c) && !S.recent.includes(e.id));
  if (!pool.length) return null;
  // Fase 1: en un año de El Niño o La Niña, casi siempre sale un dilema del clima.
  const delClima = pool.filter(e => e.cond && e.cond.clima);
  const e = delClima.length && azar() < .8 ? delClima[rnd(delClima.length)] : pool[rnd(pool.length)];
  S.recent.push(e.id);
  if (S.recent.length > 7) S.recent.shift();
  return { id: e.id, e: e.e, title: e.title, text: e.text, opts: e.opts, ...(e.bueno ? { bueno: true } : {}) };
}

export function petition(S) {
  const ks = C.PET.ks.filter(k => C.B[k].st <= S.stage);
  const k = ks[rnd(ks.length)];
  return {
    id: 'pet', pet: true, e: C.PET.e, title: C.PET.title.replace('{edificio}', C.B[k].a), text: C.PET.text,
    opts: C.PET.opts.map(o => o.promesa ? Object.assign({}, o, { promise: k }) : o)
  };
}

// Elige la opción i del suceso pendiente.
export function choose(S, i) {
  const ev = S.pend, o = ev.opts[i], leg = S.tr;
  if (o.vista) S.vis = { k: o.vista, y: S.year };
  const real = applyFx(S, o.fx);
  if (o.f) { S.phil[o.f]++; S.corr = clamp(S.corr + (o.f === 'real' ? 9 : o.f === 'util' ? 1 : -4), 0, 100); }
  if (o.promise) S.promises.push({ k: o.promise, base: counts(S)[o.promise], dl: S.year + C.PET.plazo });
  if (o.later && (o.later[2] === undefined || azar() < o.later[2])) S.later.push({ y: S.year + o.later[0], id: o.later[1], from: S.year });
  S.log.unshift({ y: S.year, t: ev.followUp ? `${ev.title}.` : `${ev.title}. Decidiste: ${o.l.toLowerCase()}.` });
  S.pend = null;
  // Fase 3 (Weber): la fuerza depende de la legitimidad; el sabotaje daña una obra.
  const extra = {};
  if (fuerzaActiva(S)) {
    if (o.fuerza) extra.uso = usarFuerza(S, leg, o, real);
    if (ev.id === 'sabotaje') extra.danada = sabotear(S);
  }
  if (ev.mov && o.accion) extra.movCambio = responderMovimiento(S, ev.mov, o.accion, extra.uso);
  return Object.assign({}, o, { fx: real }, extra);
}

// Postura de un personaje (Doña Rosa, Julián, Don Aurelio) frente a unos efectos: 1 a favor, -1 en contra, 0 neutral.
export function stance(a, fx) {
  const v = (fx[C.ADV[a].k] || 0) + (fx.h || 0) + (a === 'aurelio' && fx.txe ? -fx.txe : 0);
  return v > 1 ? 1 : v < -1 ? -1 : 0;
}
