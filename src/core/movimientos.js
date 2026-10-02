// Movimientos sociales (fase 3): sindicato, estudiantes, campesinos y ambientalistas. Cada uno nace de un subgrupo
// (o del ambiente) y tiene una fuerza de 0 a 100: crece si su gente está descontenta o si se le ignora, y se modera
// si se le escucha. Con fuerza suficiente presenta demandas (un dilema del año); movilizado, ignorarlo cuesta y
// presiona la legitimidad. Ninguno termina la partida por sí solo. La élite no tiene movimiento: responde con presión
// política o amenaza de fuga de capitales, nunca financiando huelgas. Solo en el terreno en acuarela.
import { C } from './contenido.js';
import { azar, clamp } from './azar.js';
import { counts, D, RM } from './reglas.js';
import { climaActivo } from './clima.js';
import { animoGrupo } from './grupos.js';
import { efectoFig, reaccionarMovimiento } from './figuras.js';
import { applyFx } from './dilemas.js';
import { dejarMarca } from './marcas.js';

const K = () => C.MOV;
export function movimientosActivos(S) { return climaActivo(S) && !!C.MOV && !!C.GRUPOS; }
function datos(S) { if (!S.mov) S.mov = {}; return S.mov; }
function estado(S, id) { const M = datos(S); if (!M[id]) M[id] = { f: 0, ult: -99 }; return M[id]; }

export function abierto(S, id) {
  const A = K().movimientos[id].abre, c = counts(S);
  return S.stage >= A.etapa && (!A.edificios || A.edificios.some(k => c[k] > 0));
}
// Ánimo de la gente del movimiento (para los ambientalistas, el estado del ambiente).
export function animoBase(S, id) { const b = K().movimientos[id].base; return b === 'ambiente' ? S.env : animoGrupo(S, b).valor; }
// Cuánto crece (o baja) la fuerza este año por el ánimo de su gente.
export function cambioAnual(S, id) {
  const G = K().crecimiento;
  const d = clamp((G.animoTranquilo - animoBase(S, id)) * G.factor, -G.maxBaja, G.maxSube);
  return d > 0 ? d * RM(S, 'movCrece', 1) * efectoFig(S, 'movimientos') : d; // fase 4: en República hay canales y crecen más lento
}
export function nombreEstado(f) { let n = ''; for (const e of K().estados) if (f >= e.desde) n = e.nombre; return n; }
export function fuerzaMov(S, id) { return movimientosActivos(S) && S.mov && S.mov[id] ? S.mov[id].f : 0; }

// Para la interfaz: cada movimiento abierto con su fuerza, estado, tendencia y última respuesta.
export function listaMovimientos(S) {
  if (!movimientosActivos(S)) return [];
  return Object.entries(K().movimientos).filter(([id]) => abierto(S, id)).map(([id, m]) => {
    const e = estado(S, id);
    return { id, ...m, f: Math.round(e.f), estado: nombreEstado(e.f), animo: Math.round(animoBase(S, id)), cambio: Math.round(cambioAnual(S, id) * 10) / 10, resp: e.resp };
  });
}
export function movilizados(S) { return listaMovimientos(S).filter(m => m.f >= K().umbralMovilizado); }
// Presión sobre la legitimidad: cada movimiento movilizado la empuja hacia abajo.
export function presionMovimientos(S) { return movimientosActivos(S) ? movilizados(S).length * K().presionLegitimidad : 0; }

// Cierre del año: la fuerza de cada movimiento sigue el ánimo de su gente. Devuelve las noticias.
export function movimientosDelAnio(S) {
  if (!movimientosActivos(S)) return [];
  const news = [], U = K().umbralDemanda, M = K().umbralMovilizado;
  for (const [id, m] of Object.entries(K().movimientos)) {
    if (!abierto(S, id)) continue;
    const e = estado(S, id), antes = e.f;
    e.f = clamp(e.f + cambioAnual(S, id), 0, 100);
    if (antes < M && e.f >= M) news.push(`${m.icono} ${m.nombre}: se moviliza.`);
    else if (antes < U && e.f >= U) news.push(`${m.icono} ${m.nombre}: presenta demandas.`);
  }
  return news;
}

// Dilema del año de un movimiento con demandas (el más fuerte), si toca. Devuelve el suceso o null.
export function demandaDelAnio(S) {
  if (!movimientosActivos(S)) return null;
  const listos = listaMovimientos(S).filter(m => m.f >= K().umbralDemanda && S.year - estado(S, m.id).ult >= K().aniosEntreDemandas).sort((a, b) => b.f - a.f);
  if (!listos.length || azar() >= K().probDemanda) return null;
  const m = listos[0], mov = m.f >= K().umbralMovilizado, T = mov ? m.movilizado : m.demanda;
  estado(S, m.id).ult = S.year;
  const opts = ['escuchar', 'ignorar', 'reprimir'].map(a => {
    const o = { ...m.ops[a], accion: a };
    if (a === 'reprimir') o.fuerza = true;
    if (a === 'ignorar' && mov) { o.fx = { ...o.fx }; for (const [k, v] of Object.entries(m.costo)) o.fx[k] = (o.fx[k] || 0) + v; }
    return o;
  });
  return { id: 'mov_' + m.id, mov: m.id, movilizado: mov, e: m.icono, title: T.titulo, text: T.texto, opts };
}

// Respuesta del gobierno: escuchar modera, ignorar hace crecer, reprimir dispersa (o radicaliza sin legitimidad).
export function responderMovimiento(S, id, accion, uso) {
  const e = estado(S, id), G = K().crecimiento;
  const d = accion === 'escuchar' ? G.escuchado * RM(S, 'movEscucha', 1) : accion === 'ignorar' ? G.ignorado : uso && uso.nivel === 'baja' ? G.radicaliza : G.reprimido;
  e.f = clamp(e.f + d, 0, 100);
  e.resp = { anio: S.year, accion };
  return d;
}

// Mesa de diálogo (desde Sociedad): escuchar sin esperar la demanda. Cuesta lo mismo que escuchar; una vez por año.
// Oro que cuesta escuchar (con el ajuste de la dificultad, como en los dilemas).
export function costoDialogo(S, id) { return -Math.round((K().movimientos[id].ops.escuchar.fx.t || 0) * (D(S).badSR || D(S).bad)); }
export function puedeDialogar(S, id) {
  if (!movimientosActivos(S) || !abierto(S, id)) return 'Este movimiento aún no existe.';
  const e = estado(S, id), costo = costoDialogo(S, id);
  if (e.f < K().estados[1].desde) return 'El movimiento está tranquilo: no hay nada que negociar.';
  if (e.resp && e.resp.anio === S.year) return 'Ya respondiste a este movimiento este año.';
  if (S.gold < costo) return `Necesitas ${costo} de oro.`;
  return null;
}
export function dialogar(S, id) {
  if (puedeDialogar(S, id)) return null;
  const fx = applyFx(S, K().movimientos[id].ops.escuchar.fx);
  responderMovimiento(S, id, 'escuchar'); reaccionarMovimiento(S, id, 'escuchar');
  dejarMarca(S, 'mural', `Año ${S.year}: mesa de diálogo con ${K().movimientos[id].nombre.toLowerCase()}.`);
  S.log.unshift({ y: S.year, t: `Abriste una mesa de diálogo con ${K().movimientos[id].nombre.toLowerCase()}.` });
  return fx;
}
