// El proceso de construir (pedido de Juan: «que cada infraestructura requiera de un proceso»). Solo en acuarela.
//  · Requisitos encadenados: algunas obras necesitan otras terminadas antes (hospital ← acueducto, universidad ←
//    escuelas y biblioteca…), con su porqué (proceso.json).
//  · Consulta a la comunidad en las obras que cambian la vida del pueblo (mina, cuartel, puerto, molino, fábrica,
//    estadio, universidad): el apoyo sale del ánimo, la legitimidad y el ambiente; si está en contra, se compensa a
//    los vecinos (más oro) o se construye igual (cuesta legitimidad y hay protesta).
//  · Las fases se ven: estacas y topógrafo el primer año de la obra (ob.y) e inauguración al terminarla (x.inaug).
import { C } from './contenido.js';
import { climaActivo } from './clima.js';
import { clamp } from './azar.js';
import { cost } from './reglas.js';

const K = () => C.PROCESO;
export const procesoActivo = S => climaActivo(S) && !!K();
const terminadas = (S, k) => S.map.filter(x => x.b === k && !x.ob).length;

export function faltanRequisitos(S, k) {
  if (!procesoActivo(S)) return [];
  const R = K().requisitos[k]; if (!R) return [];
  return Object.entries(R).filter(([o, n]) => terminadas(S, o) < n).map(([o, n]) => ({ obra: o, n, hay: terminadas(S, o) }));
}
export function motivoRequisito(S, k) {
  const F = faltanRequisitos(S, k); if (!F.length) return '';
  const lista = F.map(f => (f.n > 1 ? `${f.n} ` : '') + (f.n > 1 ? C.B[f.obra].n.toLowerCase() : C.B[f.obra].a)).join(' y ');
  return K().textos.falta.replace('{obra}', C.B[k].n).replace('{lista}', lista).replace('{porque}', K().porque[k] || '');
}

// Consulta: apoyo de 0 a 100. null si la obra no se consulta.
export function consultaDe(S, k) {
  if (!procesoActivo(S)) return null;
  const Q = K().consulta[k]; if (!Q) return null;
  const sat = S.sat ? (S.sat.c * 2 + S.sat.a + S.sat.e) / 4 : 50;
  let p = 50 + (sat - 50) * .6 + ((S.tr ?? 50) - 50) * .5 + Q.ajuste;
  if (k === 'mina') p += ((S.env ?? 60) - 60) * -.3; // con el ambiente sano, la gente lo defiende más
  p = Math.round(clamp(p, 5, 95));
  return { apoyo: p, aprueba: p >= 50, compensar: Math.round(cost(S, k) * K().compensacion), porque: Q.porque };
}
// Aplica el resultado al empezar la obra. modo: 'compensar' o 'igual' (si la consulta está en contra).
// Devuelve { msg, deshacer } para el registro de deshacer.
export function aplicarConsulta(S, i, k, modo) {
  const c = consultaDe(S, k), T = K().textos; if (!c) return null;
  if (c.aprueba) { S.tr = clamp(S.tr + K().aprueba.legitimidad, 0, 100); return { msg: T.aprobada, deshacer: { tr: K().aprueba.legitimidad } }; }
  if (modo !== 'igual' && S.gold >= c.compensar) { S.gold -= c.compensar; return { msg: T.compensada.replace('{c}', c.compensar), deshacer: { oro: c.compensar } }; }
  S.tr = clamp(S.tr + K().contra.legitimidad, 0, 100); S.vis = { k: 'crowd', y: S.year };
  return { msg: T.impuesta.replace('{obra}', C.B[k].a), deshacer: { tr: K().contra.legitimidad } };
}
export function deshacerConsulta(S, d) { if (!d) return; if (d.tr) S.tr = clamp(S.tr - d.tr, 0, 100); if (d.oro) S.gold += d.oro; }

// ---------- Personal (tanda 2): médicos y maestros ----------
// Cada hospital necesita médicos y enfermeras, y cada escuela, universidad o biblioteca, maestros. Se forman solos
// (la escuela normal y la universidad) y llegan algunos de otros pueblos cuando faltan; también se pueden traer de
// afuera pagando. Sin el personal completo la obra rinde menos (nunca menos del piso): cobertura de escuela y salud.
const KP = () => K() && K().personal;
export const personalActivo = S => procesoActivo(S) && !!KP();
export function necesidadPersonal(S, t) {
  const T = KP().tipos[t]; let n = 0;
  for (const x of S.map) if (x.b && !x.ob && T.por[x.b]) n += T.por[x.b];
  return n;
}
function iniciarPersonal(S) {
  if (S.personal) return S.personal;
  S.personal = {}; for (const t of Object.keys(KP().tipos)) S.personal[t] = necesidadPersonal(S, t); // las partidas guardadas empiezan con su personal completo
  return S.personal;
}
export function personal(S, t) { return personalActivo(S) ? Math.floor(iniciarPersonal(S)[t] || 0) : 0; }
export function factorPersonal(S, t) {
  if (!personalActivo(S)) return 1;
  const n = necesidadPersonal(S, t); if (!n) return 1;
  return KP().piso + (1 - KP().piso) * Math.min(1, personal(S, t) / n);
}
export function costoContratar(S, t) { return Math.round(KP().tipos[t].precio * (S.price || 1)); }
export function contratar(S, t, n = 1) {
  if (!personalActivo(S)) return '';
  const c = costoContratar(S, t) * n; if (S.gold < c) return '';
  S.gold -= c; iniciarPersonal(S)[t] += n;
  return KP().textos.contratados.replace('{n}', n).replace('{nombre}', KP().tipos[t].nombre);
}
// Cierre del año: se forman, llegan y se retiran.
export function personalDelAnio(S) {
  if (!personalActivo(S)) return [];
  const P0 = iniciarPersonal(S), news = [];
  for (const [t, T] of Object.entries(KP().tipos)) {
    const antes = Math.floor(P0[t]), n = necesidadPersonal(S, t);
    let v = P0[t] * (1 - KP().retiro);
    for (const [o, f] of Object.entries(T.forma)) v += S.map.filter(x => x.b === o && !x.ob).length * f;
    if (v < n) v += T.llegan; // cuando faltan, llegan algunos de otros pueblos
    P0[t] = Math.min(v, n * 1.5 + 2); // no sobran más de la cuenta: los que sobran se van a otra parte
    const ahora = Math.floor(P0[t]);
    if (ahora > antes && n) news.push(KP().textos.llegan.replace('{icono}', T.icono).replace('{n}', ahora - antes).replace('{nombre}', T.nombre).replace('{total}', ahora));
  }
  return news;
}

// ---------- Imprevistos de obra (tanda 3) ----------
// Cada año, una obra en curso puede tener un imprevisto (una sola vez por obra): lluvias que la atrasan (solo
// noticia), sobrecosto, accidente o hallazgo pijao (decisiones, que llegan como suceso del año). Algunas decisiones
// vuelven años después (S.procLater): la demanda de la familia, el museo con lo rescatado o el escándalo de lo tapado.
import { EFECTOS } from './contenido.js';
import { azar } from './azar.js';
import { registrarMuertes, cicatriz } from './huellas.js';
import { dejarMarca } from './marcas.js';
const KI = () => K() && K().imprevistos;
const fxDe = (ef, c) => { const fx = {}; for (const [k, v] of Object.entries(ef || {})) fx[EFECTOS[k]] = k === 'oro' ? v * c : v; return fx; };
export function imprevistosDelAnio(S) {
  if (!procesoActivo(S) || !KI()) return [];
  const I = KI(), news = [];
  // Lo que vuelve.
  S.procLater = (S.procLater || []).filter(l => {
    if (l.y > S.year) return true;
    const V = I.vuelven[l.t], c = Math.round(l.c || 0), nombre = C.B[l.k] ? C.B[l.k].a : 'la obra';
    if (l.t === 'accidente') S.gold -= c; if (l.t === 'rescate') S.gold += c;
    for (const [k, v] of Object.entries(V.efectos || {})) if (k === 'confianza') S.tr = clamp(S.tr + v, 0, 100);
    news.push(V.texto.replace('{obra}', nombre).replace('{c}', c));
    if (l.t === 'rescate') dejarMarca(S, 'museo', `Año ${S.year}: museo con lo rescatado en ${nombre}.`);
    return false;
  });
  // Lo nuevo: una obra al año como máximo.
  if (S.procImp) return news;
  const obras = S.map.map((x, i) => x.b && x.ob && !x.ob.det && !x.ob.imp ? i : -1).filter(i => i >= 0);
  for (const i of obras) {
    if (azar() >= I.prob) continue;
    const x = S.map[i], tipos = ['lluvias', 'sobrecosto', 'accidente', ...(['llano', 'bosque'].includes(x.t) ? ['hallazgo'] : [])], t = tipos[Math.floor(azar() * tipos.length)];
    x.ob.imp = t;
    if (t === 'lluvias') { x.ob.esp = 1; cicatriz(S, 'lodo', [i]); news.push(I.lluvias.texto.replace('{obra}', C.B[x.b].a)); }
    else { S.procImp = { t, i, k: x.b, c: x.ob.c, y: S.year }; if (t === 'accidente') registrarMuertes(S, 1, 'obra'); }
    break;
  }
  return news;
}
// Suceso del año con el imprevisto pendiente (para drawEvent).
export function sucesoImprevisto(S) {
  const P0 = S.procImp; if (!P0 || !procesoActivo(S)) return null;
  const I = KI()[P0.t], nombre = C.B[P0.k] ? C.B[P0.k].a : 'la obra', c = Math.max(5, Math.round(P0.c * (P0.t === 'sobrecosto' ? .6 : .35)));
  return { id: 'obra_' + P0.t, e: I.e, title: I.titulo, text: I.texto.replace('{obra}', nombre).replace('{c}', c), opts: I.opciones.map((o, j) => ({ l: o.l, fx: fxDe(o.efectos, c), f: null, why: o.porque, imp: { ...P0, j, cc: c } })) };
}
// Lo que pasa después de decidir.
export function resolverImprevisto(S, imp) {
  delete S.procImp; const x = S.map[imp.i]; if (!x || !x.ob) return;
  const vuelve = (t, c) => { const A = KI().vuelven[t].anios; S.procLater = [...(S.procLater || []), { t, y: S.year + A[0] + Math.floor(azar() * (A[1] - A[0] + 1)), k: imp.k, c }]; };
  if (imp.t === 'sobrecosto' && imp.j === 1) x.ob.esp = 1;
  if (imp.t === 'accidente' && imp.j === 1) vuelve('accidente', imp.cc * 2);
  if (imp.t === 'hallazgo') { if (imp.j === 0) { x.ob.esp = 1; vuelve('rescate', imp.cc); } else vuelve('tapado', 0); }
}
