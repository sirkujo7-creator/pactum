// Compara el balance del mapa de la v9 (20×20) con el terreno en acuarela.
// Uso: node herramientas/comparar-mapas.js   (opcional: NG=1000 DIF=normal REG=republica)
import { cargarContenido, freshState } from '../src/core/index.js';
import { botYear, ESTRATEGIAS } from './robots.js';

await cargarContenido();
const NG = +process.env.NG || 1000, DIF = process.env.DIF || 'normal', REG = process.env.REG || 'republica';
for (const mundo of ['v9', 'acuarela']) {
  const fila = [];
  for (const strat of ESTRATEGIAS) {
    let w = 0, anios = 0, env = 0, pop = 0;
    for (let g = 0; g < NG; g++) {
      const S = freshState(DIF, false, null, REG, { mundo });
      let r;
      for (let y = 0; y < 120; y++) { r = botYear(S, strat); if (r.end) break; }
      if (r.end && r.end.win) w++;
      anios += S.year; env += S.env; pop += S.pop;
    }
    fila.push(`${strat} ${(w / NG * 100).toFixed(1)}% (${Math.round(anios / NG)} años, ambiente ${Math.round(env / NG)}, ${Math.round(pop / NG)} hab.)`);
  }
  console.log(`${mundo.padEnd(9)} ${fila.join(' · ')}`);
}
