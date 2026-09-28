// Estado inicial de una partida.
import { azar, mulberry } from './azar.js';
import { C } from './contenido.js';
import { genMap, genMundo, neigh, nearRiver, LADO_V9, LADO_INICIAL } from './mundo.js';
import { genTerreno } from './terreno.js';
import { climaInicial } from './clima.js';

// opciones.mundo: 'acuarela' (terreno continuo, por defecto) o 'v9' (mapa de la versión 9, para comparar).
export function freshState(diff, guide, seed, reg, opciones = {}) {
  const mundo = opciones.mundo || 'acuarela', n = opciones.n || (mundo === 'v9' ? LADO_V9 : LADO_INICIAL);
  seed = (seed === undefined || seed === null || seed === '') ? Math.floor(azar() * 899999) + 100000 : +seed;
  const R0g = reg || 'republica';
  const S = {
    reg: R0g, corr: C.REG[R0g].rect ? 20 : 60, tx0: null, regLog: [], diff: diff || 'normal', guide: guide !== false, gstep: 0,
    year: 1, stage: 0, gold: C.DIFFS[diff || 'normal'].gold, debt: 0, bonds: [], food: 40, pop: 15, tx: { c: 10, a: 12, e: 15 },
    sat: { c: 62, a: 62, e: 62 }, hap: 62, eq: 50, tr: 55, env: 70, price: 1, infl: .02, issue: 0, shock: 0, rev: 13,
    laws: {}, seed, undo: [], kept: 0, hungry: false, vis: null, deficit: 0, defaults: 0, eliteMood: 1, mundo, n, map: mundo === 'v9' ? genMap(seed, n) : genMundo(seed, n), log: [], hist: [],
    phil: { util: 0, deon: 0, contr: 0, real: 0, virt: 0 }, promises: [], later: [], polisYears: 0, recent: [], pend: null, over: false
  };
  // La aldea inicial: un cultivo junto al río, otro cultivo y dos casas cerca.
  let riv = S.map.map((x, i) => i).filter(i => S.map[i].t === 'llano' && nearRiver(S, i));
  const R0 = mulberry(seed + 1);
  if (mundo !== 'v9') {
    // En el terreno en acuarela la aldea nace en una orilla suave y cerca del centro, para que se vea bien.
    const T = genTerreno(seed, n), mid = n / 2;
    const nota = i => { const t = T.tiles[i]; return Math.abs(t.r - mid) + Math.abs(t.c - mid) + t.slope * 6 + (t.h > 3 ? 6 : 0); };
    riv = riv.sort((a, b) => nota(a) - nota(b)).slice(0, 6);
  }
  const start = riv[Math.floor(R0() * riv.length)];
  S.map[start].b = 'cultivo';
  const want = ['cultivo', 'casa', 'casa'];
  const q = [start], seen = new Set([start]);
  while (q.length && want.length) {
    const i = q.shift();
    for (const j of neigh(S, i)) {
      if (seen.has(j)) continue;
      seen.add(j);
      if (want.length && S.map[j].t === 'llano' && !S.map[j].b) S.map[j].b = want.shift();
      q.push(j);
    }
  }
  if (mundo !== 'v9') { S.clima = climaInicial(); S.fondo = 0; S.aporteFondo = 0; }
  S.log.unshift({ y: 1, t: 'Quince personas fundan una aldea junto al río. Te eligen para gobernar.' });
  return S;
}
