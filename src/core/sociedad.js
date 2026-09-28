// Sociedad: clases, empleo, agua, energía, ánimo y ambiente.
import { C } from './contenido.js';
import { clamp } from './azar.js';
import { counts, D, RM, hasLaw } from './reglas.js';
import { countT } from './mundo.js';
import { factorAgua, climaActivo } from './clima.js';

export function energy(S, c) { return (S.stage >= 1 ? 1 : 0) + c.molino * 3; }
export function poweredT(S, c) { return S.stage >= 1 ? Math.min(c.taller, energy(S, c)) : c.taller; }
// En El Niño (fase 1) el río baja y los acueductos entregan menos.
export function waterCap(S, c) { if (S.stage < 1) return 9999; const w = 40 + c.acueducto * 70; return climaActivo(S) ? Math.round(w * factorAgua(S)) : w; }

// Reparte la población en élite, campesinos, artesanos y desempleados.
export function society(S) {
  const c = counts(S), P = S.pop;
  let el = Math.round((2 + c.mercado * .5 + poweredT(S, c) * 1.5 + c.mina * 2 + c.banco * 3 + c.puerto * 1.5 + c.cafetal * .3) * S.eliteMood);
  el = clamp(el, P >= 5 ? 1 : 0, Math.floor(P * .2));
  const W = P - el, jc = c.cultivo * 7 + c.cafetal * 6;
  let ja = 0;
  Object.keys(C.B).forEach(k => { if (k !== 'taller') ja += (C.B[k].ja || 0) * c[k]; });
  ja += poweredT(S, c) * 9;
  let camp, art, un;
  if (W >= jc + ja) { camp = jc; art = ja; un = W - jc - ja; }
  else { const t = jc + ja; camp = t ? Math.round(W * jc / t) : 0; art = W - camp; un = 0; }
  return { el, camp, art, un, jc, ja, P };
}

// Aporte del bosque al ambiente. En la v9 (20×20) cada casilla de bosque daba 0,6: 2,4 por cada 1% del territorio.
// En el terreno en acuarela el bosque cubre algo menos (12% frente a 15%), así que cada 1% vale 2,9.
export const AMBIENTE_POR_BOSQUE = 2.9;
function aporteBosque(S) {
  if (S.mundo !== 'acuarela') return countT(S, 'bosque') * .6;
  return countT(S, 'bosque') / S.map.length * 100 * AMBIENTE_POR_BOSQUE;
}
export function envTarget(S, c) {
  return (hasLaw(S, 'ambiente') ? 12 : 0) + 62 + Math.min(20, c.parque * 4) + aporteBosque(S) - c.taller * 7 - c.mina * 12 - c.cultivo * 1.5 - c.casa * .4;
}

// Ánimo al que tiende cada clase este año.
export function satTargets(S, c, hunger) {
  const P = Math.max(1, S.pop), so = society(S), ur = so.un / Math.max(1, so.P), ip = S.infl * 100;
  const sc = S.stage >= 1 ? Math.min(1, c.escuela * 50 / P) : .8, hc = S.stage >= 1 ? Math.min(1, c.hospital * 60 / P) : .8;
  const cov = (sc + hc) * 8;
  const expc = S.stage >= 1 ? Math.max(0, Math.min(20, S.year * D(S).exp) - (c.universidad * 5 + c.agora * 3 + Math.min(6, c.parque * 1.5))) : 0;
  const ds = D(S).sat;
  const wc = waterCap(S, c), thirst = S.pop > wc ? Math.min(25, (S.pop - wc) / Math.max(1, wc) * 60) : 0;
  const L = k => hasLaw(S, k) ? 1 : 0;
  return {
    sc, expc, thirst,
    c: RM(S, 'sc') + 48 + 0 - (S.tx.c - 10) * 2 + (hunger ? -20 : 5) + cov - ur * 30 - ip * 1.5 + (S.eq - 50) * .2 + (S.env < 35 ? -8 : 0) - expc + ds + (L('educacion') * 3 + L('subsidio') * 10 - thirst),
    a: RM(S, 'sa') + 48 - (S.tx.a - 12) * 1.8 + cov + Math.min(8, c.parque * 2) - ur * 30 - ip * 1.5 + (S.eq - 50) * .1 + (S.env < 35 ? -8 : 0) - expc + ds + (L('educacion') * 3 + L('jornada') * 8 + L('arancel') * 3 - thirst),
    e: 58 - (S.tx.e - 15) * 1.4 + c.banco * 4 - (S.eq - 50) * .1 - ip + ds + RM(S, 'se') - (L('jornada') * 6 + L('ambiente') * 4 + L('arancel') * 3)
  };
}

export function calcHap(S, so) {
  so = so || society(S);
  const P = Math.max(1, S.pop);
  return clamp((so.camp * S.sat.c + (so.art + so.un) * S.sat.a + so.el * S.sat.e) / P - so.un / P * 15, 0, 100);
}
