// PACTUM - informe de balance de la fase 1 (territorio vivo). Usa la lógica real de src/core y los robots.
// Uso: node herramientas/balance-fase1.js   (opcional: NG=400  DIF=normal  REG=republica)
// Mide: victorias de la estrategia equilibrada, año en que se gana, derrotas justo después de un desastre
// (con y sin preparación) y el efecto de cada sistema nuevo.
import { cargarContenido, freshState, fijarAzar, mulberry } from '../src/core/index.js';
import { botYear } from './robots.js';

await cargarContenido();
const NG = +process.env.NG || 400, DIF = process.env.DIF || 'normal', REG = process.env.REG || 'republica';

// Juega NG partidas con las mismas semillas. prep: false = sin fondo, construye en cualquier parte y no repara.
function jugar(opciones = {}) {
  const r = { win: 0, anioVictoria: [], anioTotal: [], fin: {}, crisis: 0, trasDesastre: 0, perdidas: 0 };
  for (let g = 0; g < NG; g++) {
    fijarAzar(mulberry(7000 + g));
    const S = freshState(DIF, false, 500000 + g, REG, opciones.v9 ? { mundo: 'v9' } : {});
    let fin, ultimoDesastre = -99;
    for (let y = 0; y < 120; y++) {
      fin = botYear(S, 'fair', null, opciones.sinPrep ? { sinPrep: true } : undefined).end;
      if (S.clima && S.clima.evento && S.clima.evento.anio === S.year - 1 && ultimoDesastre !== S.year - 1) { ultimoDesastre = S.year - 1; r.crisis++; }
      if (fin) break;
    }
    r.anioTotal.push(S.year);
    const t = fin ? fin.title : 'sin fin';
    r.fin[t] = (r.fin[t] || 0) + 1;
    if (fin && fin.win) { r.win++; r.anioVictoria.push(S.year); }
    else { r.perdidas++; if (S.year - ultimoDesastre <= 3) r.trasDesastre++; }
  }
  const prom = a => a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length) : 0;
  return {
    victorias: Math.round(r.win / NG * 100) + '%',
    anioVictoria: prom(r.anioVictoria),
    anioPromedio: prom(r.anioTotal),
    desastresPorPartida: +(r.crisis / NG).toFixed(1),
    derrotasTrasDesastre: r.perdidas ? Math.round(r.trasDesastre / r.perdidas * 100) + '% de las derrotas' : '—',
    finales: r.fin
  };
}

console.log(`Balance de la fase 1 (${DIF}, ${REG}, ${NG} partidas por fila, mismas semillas)\n`);
const filas = { 'Mapa de la v9 (sin fase 1)': jugar({ v9: true }), 'Fase 1, jugador preparado': jugar(), 'Fase 1, sin prepararse': jugar({ sinPrep: true }) };
for (const [k, v] of Object.entries(filas)) console.log(k.padEnd(28), JSON.stringify(v));
