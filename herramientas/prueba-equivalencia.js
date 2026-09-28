// Prueba que la lógica de src/core da EXACTAMENTE los mismos resultados que la versión 9.
// Juega las mismas partidas, con el mismo azar, en las dos versiones y compara el estado cada año.
// Uso: node herramientas/prueba-equivalencia.js   (opcional: NG=40 partidas por combinación)
import fs from 'node:fs';
import vm from 'node:vm';
import { cargarContenido, freshState, fijarAzar, mulberry } from '../src/core/index.js';
import { botYear, ESTRATEGIAS } from './robots.js';

await cargarContenido();
const fuente = fs.readFileSync(new URL('../referencia/balance-v9.js', import.meta.url), 'utf8').split('\nconst res={}')[0];
const v9 = vm.createContext({});
vm.runInContext(fuente + '\n;this.freshState=freshState;this.botYear=botYear;this.getS=()=>S;this.setEth=e=>{ETH=e};', v9);

// Estado comparable: sin el lado del mapa (nuevo) y con el suceso pendiente resumido.
function comparable(S) {
  const x = JSON.parse(JSON.stringify(S));
  delete x.n;
  if (x.pend) x.pend = { id: x.pend.id, title: x.pend.title, text: x.pend.text, n: x.pend.opts.length, opts: x.pend.opts.map(o => [o.l, o.fx, o.f, o.later, o.promise]) };
  return JSON.stringify(x);
}

const NG = +process.env.NG || 40;
let partidas = 0, anios = 0, fallas = 0;
for (const dif of ['facil', 'normal', 'dificil'])
  for (const reg of ['republica', 'monarquia', 'aristocracia', 'tirania', 'oligarquia', 'demagogia'])
    for (const eth of [null, 'contr', 'real'])
      for (const strat of ESTRATEGIAS)
        for (let g = 0; g < NG; g++) {
          const semilla = 1000 + g * 7919 + strat.length * 31 + reg.length * 131;
          const a = mulberry(semilla), b = mulberry(semilla);
          vm.runInContext('Math.random=' + '(' + (f => () => f()).toString() + ')(this.__r)', Object.assign(v9, { __r: a }));
          fijarAzar(b);
          v9.setEth(eth);
          v9.freshState(dif, false, null, reg);
          const S = freshState(dif, false, null, reg);
          partidas++;
          for (let y = 0; y < 120; y++) {
            const r1 = v9.botYear(strat), r2 = botYear(S, strat, eth);
            anios++;
            if (comparable(v9.getS()) !== comparable(S) || JSON.stringify(r1) !== JSON.stringify(r2)) {
              fallas++;
              if (fallas <= 3) console.log(`DIFERENCIA: ${dif} ${reg} ${eth} ${strat} partida ${g} año ${y + 1}`);
              break;
            }
            if (r1.end) break;
          }
        }
fijarAzar(null);
console.log(`${partidas} partidas, ${anios} años comparados, ${fallas} diferencias.`);
process.exit(fallas ? 1 : 0);
