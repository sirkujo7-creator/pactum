// PACTUM - herramienta de balance. Usa la lógica real del juego (src/core).
// Uso: node herramientas/balance.js   (opcional: DIF=facil|normal|dificil  REG=republica|monarquia|...  NG=300  ETH=util|deon|contr|real|virt
//   ACTA=dialogo,igualdad para que los robots firmen el acta fundacional con esos principios)
// Estrategias: pop = impuestos casi nulos, rich = cargar a los pobres, fair = impuestos equilibrados, debt = vivir de la deuda.
import { cargarContenido, freshState, firmarActa } from '../src/core/index.js';
import { botYear, ESTRATEGIAS } from './robots.js';

await cargarContenido();
const DIF = process.env.DIF || 'normal', ETH = process.env.ETH || null, NG = +process.env.NG || 300, REG = process.env.REG || 'republica';
const res = {};
for (const strat of ESTRATEGIAS) {
  const out = { win: 0, end: {}, stage: [0, 0, 0, 0], years: [] };
  for (let g = 0; g < NG; g++) {
    const S = freshState(DIF, false, null, REG);
    if (process.env.ACTA) firmarActa(S, process.env.ACTA.split(','));
    let r;
    for (let y = 0; y < 200; y++) { r = botYear(S, strat, ETH); if (r.end) break; }
    if (!r.end) out.end['sin fin'] = (out.end['sin fin'] || 0) + 1;
    else { out.end[r.end.title] = (out.end[r.end.title] || 0) + 1; if (r.end.win) out.win++; }
    out.stage[S.stage]++; out.years.push(S.year);
    for (const v of [S.gold, S.pop, S.eq, S.tr, S.price]) if (!isFinite(v)) throw new Error('NaN ' + strat);
  }
  out.avgYears = Math.round(out.years.reduce((a, b) => a + b) / out.years.length); delete out.years;
  res[strat] = out;
}
console.log(JSON.stringify(res, null, 1));
console.log(`\nResumen (${DIF}, ${REG}${ETH ? ', ética ' + ETH : ''}, ${NG} partidas): ` +
  ESTRATEGIAS.map(s => `${s} ${Math.round(res[s].win / NG * 100)}%`).join(' · '));
