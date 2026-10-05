// Estado inicial de una partida.
import { azar, mulberry } from './azar.js';
import { C } from './contenido.js';
import { genMap, genMundo, neigh, nearRiver, LADO_V9, LADO_INICIAL } from './mundo.js';
import { genTerreno } from './terreno.js';
import { climaInicial } from './clima.js';
import { ecoInicial } from './economia.js';

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
  // Fundar a elección (pedido de Juan, 5 de octubre): el mapa empieza vacío; el jugador escoge dónde levantar las dos
  // primeras casas y fincas, con el oro que valían. La primera obra marca el centro del pueblo.
  if (opciones.fundar && mundo !== 'v9') {
    const F = C.FUNDACION || { casas: 2, fincas: 2 };
    S.gold += F.casas * C.B.casa.cost + F.fincas * C.B.cultivo.cost + (C.HUELLAS ? C.B.fundacion.cost : 0);
    S.fundando = { casas: F.casas, fincas: F.fincas, ...(C.HUELLAS ? { plaza: 1 } : {}) }; // paso 0 de las huellas: primero la plaza
    if (C.HUELLAS) S.casco = true;
    S.clima = climaInicial(); S.fondo = 0; S.aporteFondo = 0; S.mant = 100; S.desgaste = false; S.eco = ecoInicial(); S.tierra = C.GRUPOS ? C.GRUPOS.tierraInicial : .35;
    S.log.unshift({ y: 1, t: 'Quince personas buscan un lugar para fundar su aldea. Te eligen para gobernar.' });
    return S;
  }
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
  if (mundo !== 'v9') { S.clima = climaInicial(); S.fondo = 0; S.aporteFondo = 0; S.mant = 100; S.desgaste = false; S.centro = start; S.eco = ecoInicial(); S.tierra = C.GRUPOS ? C.GRUPOS.tierraInicial : .35; }
  S.log.unshift({ y: 1, t: 'Quince personas fundan una aldea junto al río. Te eligen para gobernar.' });
  return S;
}

// La misión de fundación: cuántas casas y fincas faltan (null si ya se fundó o la partida no empezó así).
export function faltaFundar(S) {
  if (!S.fundando) return null;
  const casas = S.map.filter(x => x.b === 'casa').length, fincas = S.map.filter(x => x.b === 'cultivo' || x.b === 'cafetal').length;
  const plaza = S.fundando.plaza && !S.map.some(x => x.b === 'fundacion') ? 1 : 0;
  return { plaza, casas: Math.max(0, S.fundando.casas - casas), fincas: Math.max(0, S.fundando.fincas - fincas), alguna: !plaza && casas > 0 && fincas > 0 };
}
// Tras cada obra durante la fundación: la primera marca el centro; con todas hechas, la aldea queda fundada.
export function avanzarFundacion(S, i) {
  if (!S.fundando) return null;
  if (S.centro === undefined || S.map[i].b === 'fundacion') S.centro = i; // la plaza (o la primera obra) marca el centro
  const f = faltaFundar(S);
  if (S.map[i].b === 'fundacion') { S.fundando.plaza = 0; S.log.unshift({ y: S.year, t: C.HUELLAS.fundacion.textos.fundada }); }
  if (f.plaza || f.casas || f.fincas) return null;
  delete S.fundando;
  S.log.unshift({ y: S.year, t: 'Fundaste la aldea: las primeras familias ya tienen casa y tierra.' });
  return 'Fundaste la aldea. Ahora termina el año para ver crecer a tu pueblo.';
}
