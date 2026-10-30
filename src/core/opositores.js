// Opositores por época (pedido de Juan): cada época tiene un opositor con nombre que critica en El Pregonero lo que
// sale mal. Su fuerza (0 a 100) sube con los errores del gobierno y baja con los aciertos; con fuerza alta resta
// legitimidad y, muy alta, pide una moción de censura en el cabildo. Al cambiar de época llega uno nuevo, que hereda
// parte de la fuerza del anterior. Solo en acuarela; no usa el azar.
import { C } from './contenido.js';
import { clamp } from './azar.js';
import { epocaHistorica } from './reglas.js';
import { climaActivo } from './clima.js';
import { inseguridad } from './sucesos.js';

const K = () => C.OPO;
export const oposicionActiva = S => climaActivo(S) && !!C.OPO && !!epocaHistorica(S);
export function datosOpositor(id) { return K().opositores[id]; }
export function nivelOposicion(f) { return f >= K().efectos.alta ? 'alta' : f >= K().efectos.media ? 'media' : 'debil'; }
// Lo que salió mal este año, con su peso (de mayor a menor).
export function erroresDelAnio(S) {
  const E = K().errores, U = K().umbrales, o = S.opo || {}, tx = S.tx ? (S.tx.c + S.tx.a + S.tx.e) / 3 : 0, out = [];
  if (S.deficit > 0) out.push(['deficit', E.deficit]);
  if (S.corr >= U.corrupcionAlta) out.push(['corrupcion', E.corrupcionAlta]); else if (S.corr >= U.corrupcion) out.push(['corrupcion', E.corrupcion]);
  if (S.tr < U.legitimidad) out.push(['legitimidad', E.legitimidad]);
  if (S.hap < U.animo) out.push(['animo', E.animo]);
  if ((S.muertos || 0) - (o.m0 ?? (S.muertos || 0)) >= U.muertes) out.push(['muertes', E.muertes]);
  if (inseguridad(S) >= U.inseguridad) out.push(['inseguridad', E.inseguridad]);
  if (S.env < U.ambiente) out.push(['ambiente', E.ambiente]);
  if (S.eq < U.igualdad) out.push(['igualdad', E.igualdad]);
  if (tx > U.impuestos) out.push(['impuestos', E.impuestos]);
  if (S.food < U.hambre) out.push(['hambre', E.hambre]);
  // Sin errores graves, critica lo más flojo de los medidores (si está por debajo de lo aceptable).
  if (!out.length) { const L = [['legitimidad', S.tr], ['animo', S.hap], ['igualdad', S.eq], ['ambiente', S.env]].filter(x => x[1] < U.leve).sort((a, b) => a[1] - b[1]); if (L.length) out.push([L[0][0], U.levePeso]); }
  return out.sort((a, b) => b[1] - a[1]);
}
export function opositorDelAnio(S) {
  if (!oposicionActiva(S)) return [];
  const P = K(), T = P.textos, ep = epocaHistorica(S), news = [];
  if (!S.opo) S.opo = { id: ep, f: P.inicial, m0: S.muertos || 0, hist: [], mocion: -99, desde: S.year };
  const O = S.opo;
  if (O.id !== ep && P.opositores[ep]) { // llega el opositor de la nueva época
    O.id = ep; O.f = Math.round(O.f * P.herencia + P.inicial * (1 - P.herencia)); O.desde = S.year;
    const D = P.opositores[ep]; news.push(T.nuevo.replace('{nombre}', D.nombre).replace('{rol}', D.rol));
  }
  const D = P.opositores[O.id];
  if (!D || S.year < P.desde) { O.m0 = S.muertos || 0; return news; }
  const err = erroresDelAnio(S), A = P.aciertos, antes = O.f;
  let d = err.reduce((s, x) => s + x[1], 0);
  if (S.tr >= A.legitimidad) d -= A.legitimidadPeso;
  if (S.hap >= A.animo) d -= A.animoPeso;
  if (!err.length || err[0][1] <= P.umbrales.levePeso) d -= A.sinErrores;
  O.f = clamp(Math.round(O.f + d + (P.reposo - O.f) * P.regreso), 0, 100);
  O.m0 = S.muertos || 0;
  // La crítica del año: el error que más pesa (o, sin errores, un reconocimiento a regañadientes).
  const tema = err.length ? err[0][0] : 'bien';
  const F = [].concat(D.frases[tema]), usos = (O.usos ||= {}); usos[tema] = (usos[tema] || 0) + 1;
  O.col = { anio: S.year, tema, texto: F[(usos[tema] - 1) % F.length] };
  O.hist = [O.col, ...(O.hist || [])].slice(0, 12);
  // Con fuerza, su crítica pesa en la legitimidad.
  const E = P.efectos, resta = O.f >= E.alta ? E.altaLegitimidad : O.f >= E.media ? E.mediaLegitimidad : 0;
  if (resta) S.tr = clamp(S.tr - resta, 0, 100);
  if (antes < P.mitin && O.f >= P.mitin) news.push(T.crece.replace('{nombre}', D.nombre));
  // Moción de censura en el cabildo.
  const M = P.mocion;
  if (O.f >= M.desde && S.year - O.mocion >= M.cadaAnios) {
    O.mocion = S.year;
    const r = S.tr < M.legitimidadMin ? M.aprobada : M.fracasa;
    const oro = Math.round((r.oro || 0) * S.price);
    S.tr = clamp(S.tr + r.legitimidad, 0, 100); O.f = clamp(O.f + r.fuerza, 0, 100); S.gold -= oro; // rendir cuentas cuesta
    if (r.rumbo) S.corr = clamp(S.corr + r.rumbo, 0, 100); // y el poder vigilado se corrompe menos
    O.mocionRes = { anio: S.year, aprobada: r === M.aprobada };
    news.push((r === M.aprobada ? T.mocionAprobada : T.mocionFracasa).replace('{nombre}', D.nombre).replace('{oro}', oro));
  }
  S.log.unshift({ y: S.year, t: `${D.icono} ${D.nombre}: «${O.col.texto}»` });
  return news;
}
// ¿Hace mitin en la plaza?
export function mitinVisible(S) { return oposicionActiva(S) && !!S.opo && S.opo.f >= K().mitin && S.year >= K().desde; }
