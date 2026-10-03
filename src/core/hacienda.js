// Hacienda: presupuesto, deuda, bonos, emisión, calificación de riesgo e impuestos.
import { clamp } from './azar.js';
import { C } from './contenido.js';
import { counts, RM, hasLaw } from './reglas.js';
import { nearRiver } from './mundo.js';
import { society } from './sociedad.js';
import { factorCosecha, climaActivo, aporteFondo } from './clima.js';
import { rindeObra, mantenimiento } from './desgaste.js';
import { cuotasPendientes } from './construccion.js';
import { evasion } from './cobertura.js';
import { gastoMilitar } from './ejercito.js';
import { efectoFig } from './figuras.js';
import { factorIngresos, factorCampesinos, precioCafe } from './economia.js';
import { factorVecinos } from './vecinos.js';
import { efectoTec } from './tecnologia.js';
import { efectoMega } from './megaproyectos.js';

export const RAT = [[85, 'AAA', 0], [75, 'AA', .01], [65, 'A', .02], [55, 'BBB', .04], [45, 'BB', .07], [35, 'B', .11], [-999, 'CCC', .16]];

export function totDebt(S) { return S.debt + S.bonds.reduce((a, b) => a + b.amt, 0); }
export function rating(S) {
  const score = clamp(100 - totDebt(S) / Math.max(20, S.rev) * 8 - S.deficit * 12 - Math.max(0, S.infl - .03) * 300 + (S.tr - 50) * .4 - S.defaults * 25, 0, 100);
  const r = RAT.find(x => score >= x[0]);
  return { score, l: r[1], sp: r[2] };
}
export function loanRate(S) { return clamp(.05 + rating(S).sp - counts(S).banco * .02 - RM(S, 'tasaMenos'), .03 - RM(S, 'tasaMenos'), .3); }
export function canBorrow(S) { return S.stage >= 1 && rating(S).l !== 'CCC'; }

// Cuentas del año: ingresos por clase, tasas, mantenimiento, administración, deuda y alimento.
import { factorCostos, factorRoya, costoPensiones } from './ciclos.js';
import { factorCalle, mantenimientoCalles } from './calles.js';
export function finance(S) {
  const c = counts(S), so = society(S), w = S.price * (1 + .1 * c.universidad) * (hasLaw(S, 'jornada') ? .95 : 1);
  // Fase 2: el ciclo económico mueve los ingresos, y los campesinos ganan más cuando la comida está cara.
  const fi = factorIngresos(S), fv = factorVecinos(S), inc = { c: so.camp * 4 * w * fi * factorCampesinos(S), a: so.art * 7 * w * fi * (1 + fv + efectoTec(S, 'ing') + efectoMega(S, 'ingresos')), e: so.el * 25 * w * fi * (1 + efectoFig(S, 'ingresos') + fv + efectoTec(S, 'ing') + efectoMega(S, 'ingresos')), u: so.un * w }; // fase 4: comercio con los vecinos // fase 4: la empresaria invierte o saca su capital
  // Fase 2: lejos de una oficina de recaudo parte de la gente evade (ev = fracción que se pierde).
  const ev = evasion(S), taxC = Math.round(inc.c * S.tx.c / 100 * (1 - ev)), taxA = Math.round(inc.a * S.tx.a / 100 * (1 - ev)), taxE = Math.round(inc.e * S.tx.e / 100 * (1 - ev));
  const evadido = ev ? Math.round((inc.c * S.tx.c + inc.a * S.tx.a + inc.e * S.tx.e) / 100 * ev) : 0;
  let fee = 0, up = 0;
  // Fase 1: las obras agrietadas rinden menos y las abandonadas ni rinden ni se mantienen.
  S.map.forEach((x, i) => { if (x.b && !x.ob) { const r = rindeObra(S, x); fee += (C.B[x.b].fee || 0) * r * (x.b === 'cafetal' ? precioCafe(S) * factorRoya(S) : 1) * factorCalle(S, i); // fase 9: junto a una calle se vende más
 if (r) up += C.B[x.b].up * (x.mt || 1); } });
  fee = Math.round(fee * S.price * (hasLaw(S, 'ambiente') ? .75 : 1) * (hasLaw(S, 'arancel') ? 1.2 : 1));
  up = Math.round(up * S.price * mantenimiento(S) / 100 * factorCostos(S)); // fase 7: los costos suben con cada época
  const lawCost = Math.round(((hasLaw(S, 'educacion') ? S.pop * .15 : 0) + (hasLaw(S, 'subsidio') ? so.camp * .8 : 0)) * S.price);
  const admin = Math.round(S.pop * (.1 + .12 * S.stage) * (1 + S.year * .01) * S.price * RM(S, 'admin', 1) * factorCostos(S));
  const pensiones = costoPensiones(S); // fase 7
  const calles = mantenimientoCalles(S); // fase 9
  const rate = loanRate(S), interest = Math.round(S.debt * rate);
  const pay = Math.min(S.debt + interest, Math.ceil((S.debt + interest) * .15));
  let cpn = 0, mat = 0;
  S.bonds.forEach(b => { cpn += Math.round(b.amt * b.cpn); if (b.due <= S.year) mat += b.amt; });
  const rev = taxC + taxA + taxE + fee, fondo = aporteFondo(S, rev), obras = cuotasPendientes(S), militar = gastoMilitar(S, rev), net = rev - up - admin - lawCost - pay - cpn - mat - fondo - obras - militar - pensiones - calles;
  let fcap = 0;
  S.map.forEach((x, i) => { if (x.b === 'cultivo') fcap += (nearRiver(S, i) ? 16 : 12) * rindeObra(S, x); });
  if (climaActivo(S)) fcap *= factorCosecha(S); // fase 1: las lluvias del año
  const fprod = so.jc ? Math.round(fcap * so.camp / so.jc) : 0, cons = Math.ceil(S.pop * .5);
  const post = { c: inc.c * (1 - S.tx.c / 100), a: inc.a * (1 - S.tx.a / 100), e: inc.e * (1 - S.tx.e / 100), u: inc.u };
  return { so, taxC, taxA, taxE, fee, up, admin, pensiones, lawCost, interest, pay, cpn, mat, rev, net, fprod, cons, post, rate, fondo, obras, evadido, militar, calles };
}

// Acciones financieras.
export function takeLoan(S) { if (!canBorrow(S)) return false; S.gold += 150; S.debt += 150; return true; }
export function payDebt(S) { const p = Math.min(50, S.debt, Math.floor(S.gold)); S.gold -= p; S.debt -= p; return p; }
export function issueBond(S) {
  if (!canBorrow(S)) return false;
  const cpn = Math.max(.02, loanRate(S) - .015);
  S.bonds.push({ amt: 200, cpn, due: S.year + 5 }); S.gold += 200;
  return cpn;
}
export function printMoney(S) { if (S.stage < 1 || hasLaw(S, 'bancoCentral')) return false; S.gold += 50; S.issue += 50; return true; }

// Límites del impuesto de una clase según el régimen (el Senado solo deja moverlo 5 puntos al año, etc.).
export function taxLimit(S, k, v) {
  let lo = 0, hi = k === 'e' ? 50 : 40;
  const st = RM(S, 'taxStep', 99);
  if (S.tx0) { lo = Math.max(lo, S.tx0[k] - st); hi = Math.min(hi, S.tx0[k] + st); }
  if (k === 'e' && RM(S, 'eliteCap', 0)) hi = Math.min(hi, RM(S, 'eliteCap', 0));
  return clamp(v, lo, hi);
}
export function setTax(S, k, v) { S.tx[k] = taxLimit(S, k, v); return S.tx[k]; }
