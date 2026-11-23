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
