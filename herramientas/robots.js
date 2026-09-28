// Robots que juegan partidas completas con distintas estrategias (los mismos de la versión 9).
// pop = impuestos casi nulos, rich = cargar a los pobres, fair = impuestos equilibrados, debt = vivir de la deuda.
import {
  fondoSugerido, costoReparar, reparar, counts, finance, taxLimit, waterCap, energy, nearRiver, freeTiles, build, canBorrow, takeLoan, advance, choose, rnd
} from '../src/core/index.js';

export const ESTRATEGIAS = ['pop', 'rich', 'fair', 'debt'];
// Mantenimiento de las obras en % (se puede cambiar con MANT=0..100).
const MANT = typeof process !== 'undefined' && process.env.MANT !== undefined ? +process.env.MANT : 100;
// Porcentaje que la estrategia equilibrada aporta al fondo de emergencias (se puede cambiar con FONDO=0).
const FONDO = typeof process !== 'undefined' && process.env.FONDO !== undefined ? +process.env.FONDO : 5;

// op.sinPrep: la estrategia equilibrada no se prepara (sin fondo, construye en cualquier parte, no repara).
export function botYear(S, strat, eth, op = {}) {
  const prep = strat === 'fair' && !op.sinPrep;
  const want = strat === 'pop' ? { c: 5, a: 6, e: 12 } : strat === 'rich' ? { c: 18, a: 20, e: 10 } : strat === 'fair' ? { c: 8, a: 10, e: 25 } : null;
  if (want) ['c', 'a', 'e'].forEach(k => S.tx[k] = taxLimit(S, k, want[k]));
  // Fase 1: la estrategia equilibrada ahorra en el fondo de emergencias desde Pueblo, hasta tener lo que costaría
  // una emergencia hoy (o mientras haya un fenómeno anunciado).
  if (S.clima) S.aporteFondo = prep && S.stage >= 1 && (S.fondo < fondoSugerido(S) * 1.2 || S.clima.pronostico) ? FONDO : 0;
  // Mantenimiento de las obras (MANT=0..100 para probar; por defecto 100%). La estrategia equilibrada repara lo agrietado.
  if (S.clima) { S.mant = MANT; if (prep) S.map.forEach((x, i) => { if (x.u >= 50) { const g = costoReparar(S, i); if (g && S.gold > g + 40) reparar(S, i); } }); }
  for (let n = 0; n < 8; n++) {
    const c2 = counts(S), F2 = finance(S);
    let k = null;
    if (F2.fprod - F2.cons < 4 && S.food < 40) k = 'cultivo';
    else if (F2.so.un > 2 && F2.so.camp >= F2.so.jc && F2.fprod - F2.cons < 10) k = 'cultivo';
    else if (F2.so.un > 3) k = (S.stage >= 1 && strat !== 'fair' && c2.taller < 3) ? 'taller' : 'mercado';
    else if (S.stage >= 1 && S.pop > waterCap(S, c2) - 15) k = 'acueducto';
    else if (S.stage >= 1 && c2.taller > energy(S, c2)) k = 'molino';
    else if (S.pop >= c2.casa * 10 - 6) k = 'casa';
    else if (S.stage >= 2 && c2.agora < 1) k = 'agora';
    else if (S.stage >= 1 && c2.hospital < 1) k = 'hospital';
    else if (S.stage >= 1 && c2.escuela * 50 < S.pop) k = 'escuela';
    else if (S.stage >= 1 && c2.hospital * 60 < S.pop) k = 'hospital';
    else if (F2.so.un > 2) k = (S.stage >= 1 && strat !== 'fair') ? 'taller' : 'mercado';
    else if (S.stage >= 2 && c2.agora < 1) k = 'agora';
    else if (S.env < 40 || (S.expc > 4 && c2.parque < 5)) k = 'parque';
    else if (S.stage >= 3 && S.expc > 4 && c2.universidad < 2 && S.gold > 300) k = 'universidad';
    else if (S.stage >= 3 && c2.universidad < 1) k = 'universidad';
    if (!k) break;
    const pref = k === 'cultivo' ? (i => nearRiver(S, i)) : ['casa', 'mercado', 'escuela', 'hospital', 'taller', 'agora', 'banco', 'universidad', 'parque'].includes(k) ? (i => !nearRiver(S, i)) : null;
    let t = freeTiles(S, k);
    if (pref) t = t.filter(pref).concat(t.filter(i => !pref(i)));
    // Fase 1: la estrategia equilibrada se prepara: no tala bosque ni construye en laderas erosionadas si hay otro sitio.
    if (prep && S.clima) { const riesgo = i => S.map[i].t === 'bosque' || S.map[i].er > 0 || S.map[i].dr > 0; t = t.filter(i => !riesgo(i)).concat(t.filter(riesgo)); }
    if (!t.length) break;
    build(S, k, t[0]);
  }
  if (strat === 'debt' && S.gold < 30 && canBorrow(S)) takeLoan(S);
  const r = advance(S);
  if (S.pend) { const o = S.pend.opts; let k = eth ? o.findIndex(x => x.f === eth) : -1; if (k < 0) k = rnd(o.length); choose(S, k); }
  return r;
}
