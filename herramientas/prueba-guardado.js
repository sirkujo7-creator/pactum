// Prueba del guardado: una partida de Pactum va y vuelve igual, y una partida de la v9 se abre,
// conserva sus obras y se puede seguir jugando. Uso: node herramientas/prueba-guardado.js
import fs from 'node:fs';
import vm from 'node:vm';
import { cargarContenido, freshState, empaquetar, desempaquetar, aCodigo, desdeCodigo, counts, advance, choose } from '../src/core/index.js';
import { botYear } from './robots.js';

await cargarContenido();
let fallas = 0;
const ok = (cond, texto) => { console.log((cond ? '✓ ' : '✗ ') + texto); if (!cond) fallas++; };

// 1) Ida y vuelta de una partida actual.
const S = freshState('normal', true, 4242, 'republica');
for (let y = 0; y < 15; y++) { botYear(S, 'fair'); }
const T = desempaquetar(empaquetar(S));
ok(JSON.stringify(T) === JSON.stringify(S), 'una partida guardada vuelve exactamente igual');
ok(JSON.stringify(desdeCodigo(aCodigo(S))) === JSON.stringify(S), 'el código de partida funciona');

// 2) Partida de la versión 9: se juega en la v9 original y se abre aquí.
const fuente = fs.readFileSync(new URL('../referencia/balance-v9.js', import.meta.url), 'utf8').split('\nconst res={}')[0];
const v9 = vm.createContext({});
vm.runInContext(fuente + '\n;this.freshState=freshState;this.botYear=botYear;this.getS=()=>S;', v9);
v9.freshState('normal', false, 777777, 'monarquia');
for (let y = 0; y < 20; y++) { const r = v9.botYear('fair'); if (r.end) break; }
const viejo = JSON.parse(JSON.stringify(v9.getS()));
const cuenta = m => Object.fromEntries(Object.entries(m.reduce((o, x) => { if (x.b) o[x.b] = (o[x.b] || 0) + 1; return o; }, {})).sort());
const codigoV9 = Buffer.from(JSON.stringify(viejo), 'utf8').toString('base64');
const N = desdeCodigo(codigoV9);
ok(N.mundo === 'acuarela' && N.n === 32 && N.map.length === 1024, 'la partida de la v9 pasa al terreno en acuarela de 32×32');
ok(JSON.stringify(cuenta(N.map)) === JSON.stringify(cuenta(viejo.map)), 'conserva todas sus obras: ' + JSON.stringify(cuenta(viejo.map)));
ok(N.year === viejo.year && N.gold === viejo.gold && N.reg === viejo.reg && N.stage === viejo.stage, `conserva año ${N.year}, oro ${Math.round(N.gold)}, régimen y etapa`);
let r;
for (let y = 0; y < 10; y++) { r = advance(N); if (r.end) break; if (N.pend) choose(N, 0); }
ok(isFinite(N.gold) && N.year > viejo.year, `se puede seguir jugando (año ${N.year})`);
process.exit(fallas ? 1 : 0);
