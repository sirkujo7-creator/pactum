// Hacienda: presupuesto, deuda, bonos, emisión, calificación de riesgo e impuestos.
import { clamp } from './azar.js';
import { C } from './contenido.js';
import { counts, RM, hasLaw } from './reglas.js';
import { nearRiver } from './mundo.js';
import { society } from './sociedad.js';
import { factorCosecha, climaActivo } from './clima.js';

export const RAT = [[85, 'AAA', 0], [75, 'AA', .01], [65, 'A', .02], [55, 'BBB', .04], [45, 'BB', .07], [35, 'B', .11], [-999, 'CCC', .16]];

export function totDebt(S) { return S.debt + S.bonds.reduce((a, b) => a + b.amt, 0); }
export function rating(S) {
  const score = clamp(100 - totDebt(S) / Math.max(20, S.rev) * 8 - S.deficit * 12 - Math.max(0, S.infl - .03) * 300 + (S.tr - 50) * .4 - S.defaults * 25, 0, 100);
  const r = RAT.find(x => score >= x[0]);
  return { score, l: r[1], sp: r[2] };
}
export function loanRate(S) { return clamp(.05 + rating(S).sp - counts(S).banco * .02, .03, .3); }
export function canBorrow(S) { return S.stage >= 1 && rating(S).l !== 'CCC'; }

// Cuentas del año: ingresos por clase, tasas, mantenimiento, administración, deuda y alimento.
export function finance(S) {
  const c = counts(S), so = society(S), w = S.price * (1 + .1 * c.universidad) * (hasLaw(S, 'jornada') ? .95 : 1);
  const inc = { c: so.camp * 4 * w, a: so.art * 7 * w, e: so.el * 25 * w, u: so.un * w };
  const taxC = Math.round(inc.c * S.tx.c / 100), taxA = Math.round(inc.a * S.tx.a / 100), taxE = Math.round(inc.e * S.tx.e / 100);
  let fee = 0, up = 0;
  S.map.forEach(x => { if (x.b) { fee += C.B[x.b].fee || 0; up += C.B[x.b].up; } });
  fee = Math.round(fee * S.price * (hasLaw(S, 'ambiente') ? .75 : 1) * (hasLaw(S, 'arancel') ? 1.2 : 1));
  up = Math.round(up * S.price);
  const lawCost = Math.round(((hasLaw(S, 'educacion') ? S.pop * .15 : 0) + (hasLaw(S, 'subsidio') ? so.camp * .8 : 0)) * S.price);
  const admin = Math.round(S.pop * (.1 + .12 * S.stage) * (1 + S.year * .01) * S.price * RM(S, 'admin', 1));
  const rate = loanRate(S), interest = Math.round(S.debt * rate);
  const pay = Math.min(S.debt + interest, Math.ceil((S.debt + interest) * .15));
  let cpn = 0, mat = 0;
  S.bonds.forEach(b => { cpn += Math.round(b.amt * b.cpn); if (b.due <= S.year) mat += b.amt; });
  const rev = taxC + taxA + taxE + fee, net = rev - up - admin - lawCost - pay - cpn - mat;
  let fcap = 0;
  S.map.forEach((x, i) => { if (x.b === 'cultivo') fcap += nearRiver(S, i) ? 16 : 12; });
  if (climaActivo(S)) fcap *= factorCosecha(S); // fase 1: las lluvias del año
  const fprod = so.jc ? Math.round(fcap * so.camp / so.jc) : 0, cons = Math.ceil(S.pop * .5);
  const post = { c: inc.c * (1 - S.tx.c / 100), a: inc.a * (1 - S.tx.a / 100), e: inc.e * (1 - S.tx.e / 100), u: inc.u };
  return { so, taxC, taxA, taxE, fee, up, admin, lawCost, interest, pay, cpn, mat, rev, net, fprod, cons, post, rate };
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
