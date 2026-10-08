// PACTUM - auditoría de balance (fase 17, paso 0). No cambia el juego: solo mide.
//   Parte A: rentabilidad. Juega partidas con los robots hasta ciertos años y, en cada una, mide qué da cada edificio
//   (y cada cultivo y cada producto de fábrica) si se construye hoy: años que tarda en pagarse, empleos y comida.
//   Parte B: decisiones. Suma lo bueno y lo malo de cada opción de las decisiones (con su riesgo y su consecuencia
//   diferida) en «puntos» y marca las que se salen de rango, las que dominan a las otras y las que solo traen
//   cosas buenas o solo malas.
// Uso: node herramientas/auditoria.js            (imprime el informe)
//      NG=20 ANIOS=20,45,70 node herramientas/auditoria.js
//      ESCRIBIR=1 node herramientas/auditoria.js (además lo guarda en docs/auditoria-balance.md)
import fs from 'node:fs';
import {
  cargarContenido, freshState, C, finance, vistaPrevia, freeTiles, listaCultivos, listaProductos, datosCultivo, datosProducto,
  costoSiembra, nearRiver, climaActivo
} from '../src/core/index.js';
import { botYear } from './robots.js';

await cargarContenido();
const NG = +process.env.NG || 12, ANIOS = (process.env.ANIOS || '20,45,70').split(',').map(Number), REG = process.env.REG || 'republica';
const sal = [];
const out = (t = '') => { sal.push(t); console.log(t); };
const r1 = v => Math.round(v * 10) / 10, r0 = Math.round;
const mediana = a => { const b = a.filter(Number.isFinite).sort((x, y) => x - y); return b.length ? b[Math.floor(b.length / 2)] : NaN; };
const media = a => a.length ? a.reduce((s, v) => s + v, 0) / a.length : NaN;

// ---------- Parte A: rentabilidad ----------
// Una fila por (clave de edificio o variante): lista de mediciones { anio, costo, dn, dj, df }.
const filas = new Map();
const anota = (clave, anio, m) => { if (!filas.has(clave)) filas.set(clave, []); filas.get(clave).push({ anio, ...m }); };
const fincaDe = x => x.b === 'cultivo';

for (let g = 0; g < NG; g++) {
  const S = freshState('normal', false, 1000 + g, REG);
  if (!climaActivo(S)) continue;
  let anio = 0;
  for (const meta of ANIOS) {
    for (; S.year < meta && !S.over; ) { const r = botYear(S, 'fair', null); if (r.end) { S.over = true; break; } }
    if (S.over) break;
    anio = S.year;
    // Edificios generales con la vista previa del propio juego (la misma que ve el jugador al construir).
    for (const k of Object.keys(C.B)) {
      if (k === 'cultivo' || k === 'taller' || k === 'cafetal') continue;
      const v = vistaPrevia(S, k);
      if (v.motivo) continue;
      anota(k, anio, { costo: v.costo, dn: v.dn, dj: v.dj, df: v.df, mant: v.mant });
    }
    // Fincas por cultivo (ya maduras, para medir el rendimiento de régimen) y fábricas por producto.
    const libres = freeTiles(S, 'cultivo');
    if (libres.length) {
      const i = libres.find(j => nearRiver(S, j)) ?? libres[0], x = S.map[i], F0 = finance(S);
      for (const cv of listaCultivos()) {
        const antes = { b: x.b, cv: x.cv, cvDesde: x.cvDesde }, tt = x.t;
        x.b = 'cultivo'; x.cv = cv; x.cvDesde = S.year - 30; if (tt === 'bosque') x.t = 'llano';
        const F1 = finance(S);
        x.b = antes.b; x.cv = antes.cv; x.cvDesde = antes.cvDesde; x.t = tt;
        const D = datosCultivo(cv);
        anota('finca:' + cv, anio, { costo: C.B.cultivo.cost * S.price + costoSiembra(S, cv), dn: F1.net - F0.net, dj: (F1.so.jc + F1.so.ja) - (F0.so.jc + F0.so.ja), df: F1.fprod - F0.fprod, mant: C.B.cultivo.up * S.price });
        void D;
      }
    }
    if (S.stage >= 1) {
      const libresT = freeTiles(S, 'taller');
      if (libresT.length) {
        const x = S.map[libresT[0]], F0 = finance(S), nT = S.map.filter(y => y.b === 'taller' && !y.ob).length;
        for (const pr of listaProductos()) {
          const antes = { b: x.b, pr: x.pr }, tt = x.t;
          x.b = 'taller'; x.pr = pr; if (tt === 'bosque') x.t = 'llano';
          const F1 = finance(S);
          x.b = antes.b; x.pr = antes.pr; x.t = tt;
          anota('fábrica:' + pr, anio, { costo: C.B.taller.cost * S.price, dn: F1.net - F0.net, dj: (F1.so.jc + F1.so.ja) - (F0.so.jc + F0.so.ja), df: 0, mant: C.B.taller.up * S.price, fabricas: nT });
        }
      }
    }
  }
}

out('# Auditoría de balance');
out();
out(`Generado con \`node herramientas/auditoria.js\` (${NG} partidas de la estrategia equilibrada, República, años ${ANIOS.join(', ')}). No cambia el juego.`);
out();
out('## Parte A. Rentabilidad de cada edificio');
out();
out('Mide lo que cambia **al construir uno más hoy**: `Ganancia` = oro por año después de mantenimiento; `Retorno` = años para recuperar el costo (costo ÷ ganancia); `Empleos` = puestos que crea; `Comida` = comida por año. Valores medianos de las partidas medidas. Retorno «—» = nunca se paga solo con oro (puede dar servicio, ánimo o legitimidad).');
out();
for (const anio of ANIOS) {
  const tabla = [];
  for (const [clave, L] of filas) {
    const m = L.filter(x => x.anio === anio || (x.anio >= anio - 3 && x.anio <= anio + 8));
    if (m.length < 2) continue;
    const costo = mediana(m.map(x => x.costo)), dn = mediana(m.map(x => x.dn));
    tabla.push({ clave, n: m.length, costo, dn, ret: dn > 0 ? costo / dn : Infinity, dj: mediana(m.map(x => x.dj)), df: mediana(m.map(x => x.df)) });
  }
  if (!tabla.length) continue;
  tabla.sort((a, b) => a.ret - b.ret);
  out(`### Hacia el año ${anio}`);
  out();
  out('| Edificio | Costo | Ganancia/año | Retorno (años) | Empleos | Comida | Partidas |');
  out('| --- | ---: | ---: | ---: | ---: | ---: | ---: |');
  for (const t of tabla) out(`| ${t.clave} | ${r0(t.costo)} | ${r1(t.dn)} | ${Number.isFinite(t.ret) ? r1(t.ret) : '—'} | ${r1(t.dj)} | ${r1(t.df)} | ${t.n} |`);
  out();
}
// Fincas contra fábricas: lo que Juan sintió («las fábricas no son rentables»).
const mejorDe = pref => {
  const v = [...filas].filter(([k]) => k.startsWith(pref)).map(([k, L]) => ({ k, ret: mediana(L.map(x => x.dn > 0 ? x.costo / x.dn : Infinity)), dn: mediana(L.map(x => x.dn)) })).sort((a, b) => a.ret - b.ret);
  return v;
};
const F = mejorDe('finca:'), T = mejorDe('fábrica:');
out('### Fincas contra fábricas (todas las épocas medidas)');
out();
if (F.length && T.length) {
  out(`- Mejor finca: **${F[0].k.slice(6)}**, se paga en ${Number.isFinite(F[0].ret) ? r1(F[0].ret) : '—'} años (${r1(F[0].dn)} de oro por año).`);
  out(`- Peor finca: ${F.at(-1).k.slice(6)}, se paga en ${Number.isFinite(F.at(-1).ret) ? r1(F.at(-1).ret) : '—'} años.`);
  out(`- Mejor fábrica: **${T[0].k.slice(8)}**, se paga en ${Number.isFinite(T[0].ret) ? r1(T[0].ret) : '—'} años (${r1(T[0].dn)} de oro por año).`);
  out(`- Peor fábrica: ${T.at(-1).k.slice(8)}, se paga en ${Number.isFinite(T.at(-1).ret) ? r1(T.at(-1).ret) : '—'} años.`);
  const conGanancia = T.filter(t => t.dn > 0).length;
  out(`- Fábricas que dan ganancia: ${conGanancia} de ${T.length} productos.`);
}
out();

// ---------- Parte B: decisiones ----------
// Pesos: cuántos «puntos» vale cada efecto (1 punto = 1 de legitimidad o de ánimo). Son aproximados y se pueden
// cambiar aquí; lo que importa es comparar unas decisiones con otras con la misma vara.
const PESO = { t: 1 / 12, f: 1 / 15, p: 1, h: 1, sc: .5, sa: .5, se: .5, e: 1, c: 1, a: 1, d: -1 / 12, i: -.3, txe: 0, ti: .5 };
const NOMBRE = { t: 'oro', f: 'alimento', p: 'habitantes', h: 'ánimo', sc: 'campesinos', sa: 'artesanos', se: 'élite', e: 'igualdad', c: 'legitimidad', a: 'ambiente', d: 'deuda', i: 'inflación', ti: 'tierra' };
const valor = fx => Object.entries(fx || {}).reduce((s, [k, v]) => s + (PESO[k] ?? 0) * v, 0);
const bueno = fx => Object.entries(fx || {}).reduce((s, [k, v]) => s + Math.max(0, (PESO[k] ?? 0) * v), 0);
const malo = fx => Object.entries(fx || {}).reduce((s, [k, v]) => s + Math.min(0, (PESO[k] ?? 0) * v), 0);

const opciones = [];
for (const ev of C.EV) {
  ev.opts.forEach((o, j) => {
    let puntos = valor(o.fx), g = bueno(o.fx), m = malo(o.fx);
    if (o.riesgo) { const p = o.riesgo.p ?? 1; puntos += p * valor(o.riesgo.fx); g += p * bueno(o.riesgo.fx); m += p * malo(o.riesgo.fx); }
    if (o.later) { const [, id, p = 1] = o.later, L = C.LATER[id]; if (L) { puntos += p * valor(L.fx); g += p * bueno(L.fx); m += p * malo(L.fx); } }
    opciones.push({ id: ev.id, titulo: ev.title, etapa: ev.st, bueno: !!ev.bueno, j, texto: o.l, puntos, g, m, fx: o.fx });
  });
}
const todos = opciones.map(o => o.puntos), mu = media(todos), sd = Math.sqrt(media(todos.map(v => (v - mu) ** 2)));
out('## Parte B. Peso de las decisiones');
out();
out(`Pesos usados (puntos por unidad): ${Object.entries(PESO).filter(([, w]) => w).map(([k, w]) => `${NOMBRE[k]} ${r1(w * 100) / 100}`).join(', ')}. Cada opción suma su efecto inmediato, su riesgo (por su probabilidad) y su consecuencia diferida.`);
out();
out(`- Decisiones: ${C.EV.length}; opciones: ${opciones.length}. Promedio de una opción: ${r1(mu)} puntos (desviación ${r1(sd)}).`);
// Por etapa.
out();
out('| Etapa | Decisiones | Promedio de la opción | Mejor opción | Peor opción |');
out('| --- | ---: | ---: | ---: | ---: |');
for (const e of [0, 1, 2, 3]) {
  const L = opciones.filter(o => o.etapa === e); if (!L.length) continue;
  out(`| ${e} | ${new Set(L.map(o => o.id)).size} | ${r1(media(L.map(o => o.puntos)))} | ${r1(Math.max(...L.map(o => o.puntos)))} | ${r1(Math.min(...L.map(o => o.puntos)))} |`);
}
out();
// Marcas.
const porEv = new Map(); for (const o of opciones) { if (!porEv.has(o.id)) porEv.set(o.id, []); porEv.get(o.id).push(o); }
const marcas = [];
for (const [id, L] of porEv) {
  const t = L[0], prefijo = `**${t.titulo}** (\`${id}\`, etapa ${t.etapa})`;
  // Opción que supera a otra en todos los efectos inmediatos (dominada).
  for (const a of L) for (const b of L) {
    if (a === b) continue;
    const ks = new Set([...Object.keys(a.fx), ...Object.keys(b.fx)]);
    let mejor = false, peor = false;
    for (const k of ks) { const w = PESO[k] ?? 0, va = (a.fx[k] || 0) * w, vb = (b.fx[k] || 0) * w; if (va > vb) mejor = true; if (va < vb) peor = true; }
    if (mejor && !peor) marcas.push([2, `${prefijo}: «${a.texto}» es mejor que «${b.texto}» en todo (la segunda nunca conviene).`]);
  }
  // Solo cosas buenas o solo malas en todas las opciones (no es una decisión).
  if (!t.bueno && L.every(o => o.puntos > 2)) marcas.push([1, `${prefijo}: todas las opciones salen ganando (${L.map(o => r1(o.puntos)).join(', ')} puntos).`]);
  if (L.every(o => o.puntos < -2)) marcas.push([0, `${prefijo}: todas las opciones salen perdiendo (${L.map(o => r1(o.puntos)).join(', ')} puntos), como un golpe sin salida.`]);
  // Opción atípica por fuerza.
  for (const o of L) {
    const z = (o.puntos - mu) / (sd || 1);
    if (z > 2) marcas.push([3, `${prefijo}: «${o.texto}» da +${r1(o.puntos)} puntos (muy por encima del promedio).`]);
    if (z < -2) marcas.push([3, `${prefijo}: «${o.texto}» da ${r1(o.puntos)} puntos (muy por debajo del promedio).`]);
  }
  // Mucha distancia entre la mejor y la peor opción.
  const mx = Math.max(...L.map(o => o.puntos)), mn = Math.min(...L.map(o => o.puntos));
  if (mx - mn > 2.5 * (sd || 1)) marcas.push([4, `${prefijo}: la mejor opción (${r1(mx)}) y la peor (${r1(mn)}) están muy separadas: casi no hay dilema.`]);
}
const TITULOS = ['Todas pierden', 'Todas ganan', 'Opción dominada', 'Opción atípica', 'Opciones muy separadas'];
out(`### Marcadas para revisar (${marcas.length})`);
out();
for (let k = 0; k < TITULOS.length; k++) {
  const L = marcas.filter(m => m[0] === k).map(m => m[1]);
  if (!L.length) continue;
  out(`**${TITULOS[k]}** (${L.length})`);
  out();
  for (const t of L) out(`- ${t}`);
  out();
}
out('Límites de la medida: no incluye los efectos de las leyes, las huellas en el mapa ni las reacciones de los personajes; el oro se mide a precio base. Sirve para encontrar lo que se sale de lo normal, no para decidir por sí sola.');
if (process.env.ESCRIBIR) fs.writeFileSync(new URL('../docs/auditoria-balance.md', import.meta.url), sal.join('\n') + '\n');
