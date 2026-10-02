// Personajes con papel propio (fase 4): comandante, periodista, párroco, líder pijao y empresaria. Cada uno aparece
// cuando hay condiciones, tiene una relación con el gobierno (0 a 100) que sube o baja según lo que se hace, encarga
// misiones con plazo y, con relación alta o baja, cambia algo del territorio. Solo en el terreno en acuarela.
import { C } from './contenido.js';
import { clamp } from './azar.js';
import { counts, hasLaw } from './reglas.js';
import { climaActivo } from './clima.js';
import { applyFx } from './dilemas.js';
import { cobertura } from './cobertura.js';
import { tierra } from './grupos.js';

const K = () => C.FIG;
export function figurasActivas(S) { return climaActivo(S) && !!C.FIG; }
function datos(S) { if (!S.fig) S.fig = {}; return S.fig; }
export function estadoFig(S, id) { const D = datos(S); if (!D[id]) D[id] = { rel: K().relacionInicial, idx: 0, mision: null, visto: false }; return D[id]; }

export function presente(S, id) {
  if (!figurasActivas(S)) return false;
  const A = K().figuras[id].aparece;
  return S.stage >= (A.etapa || 0) && S.year >= (A.anio || 0) && (!A.edificio || counts(S)[A.edificio] > 0 || (S.fig && S.fig[id] && S.fig[id].visto));
}
export function presentes(S) { return figurasActivas(S) ? Object.keys(K().figuras).filter(id => presente(S, id)) : []; }
export function nivelRel(rel) { return rel >= K().alta ? 'alta' : rel <= K().baja ? 'baja' : 'media'; }

// Lo que se hace mueve la relación: devuelve los avisos.
export function reaccionar(S, motivo) {
  const out = [];
  for (const id of presentes(S)) {
    const F = K().figuras[id], d = F.reacciones[motivo];
    if (!d) continue;
    const e = estadoFig(S, id); e.rel = clamp(e.rel + d, 0, 100);
    out.push(`${F.icono} ${F.nombre}: ${d > 0 ? 'le agrada' : 'le molesta'} ${K().motivos[motivo]} (relación ${d > 0 ? '+' : '−'}${Math.abs(d)}).`);
  }
  if (out.length) (S.figNuevas = S.figNuevas || []).push(...out);
  return out;
}
export function avisosFiguras(S) { const n = S.figNuevas || []; S.figNuevas = []; return n; }

// Efecto de las relaciones altas o bajas sobre una medida (suma; 'movimientos' multiplica).
export function efectoFig(S, clave) {
  let v = clave === 'movimientos' ? 1 : 0;
  for (const id of presentes(S)) {
    const n = nivelRel(estadoFig(S, id).rel);
    if (n === 'media') continue;
    const x = K().figuras[id][n][clave];
    if (x === undefined) continue;
    v = clave === 'movimientos' ? v * x : v + x;
  }
  return v;
}

// ¿Se cumple la misión?
export function cumpleMision(S, m) {
  const c = counts(S);
  switch (m.tipo) {
    case 'inseguridadMax': return (S.insegura ?? 100) < m.valor;
    case 'cobertura': return cobertura(S)[m.servicio] >= m.valor && c[m.servicio] > 0;
    case 'ley': return hasLaw(S, m.ley);
    case 'corrMax': return S.corr < m.valor;
    case 'edificio': return c[m.edificio] >= m.n;
    case 'movMax': return !S.mov || Object.values(S.mov).every(x => x.f < m.valor);
    case 'ambienteMin': return S.env >= m.valor;
    case 'tierraMin': return tierra(S) >= m.valor;
    case 'impEliteMax': return S.tx.e <= m.valor;
  }
  return false;
}
// Asigna la siguiente misión que todavía no esté cumplida (una misión ya lograda no es un reto).
function nuevaMision(S, id) {
  const e = estadoFig(S, id), L = K().figuras[id].misiones;
  while (e.idx < L.length && cumpleMision(S, L[e.idx])) e.idx++;
  e.mision = e.idx < L.length ? { i: e.idx, limite: S.year + L[e.idx].plazo } : null;
  e.idx++;
}
export function misionDe(S, id) { const e = estadoFig(S, id); return e.mision ? { ...K().figuras[id].misiones[e.mision.i], limite: e.mision.limite } : null; }

// Cierre del año: llegadas, misiones cumplidas o vencidas, y efectos de relaciones malas. Devuelve las noticias.
// Los sucesos para las tarjetas quedan en S.figEv.
export function figurasDelAnio(S, inseguridadActual) {
  if (!figurasActivas(S)) return [];
  S.insegura = inseguridadActual;
  const news = [], ev = [], P = K();
  for (const id of presentes(S)) {
    const F = P.figuras[id], e = estadoFig(S, id);
    if (!e.visto) { e.visto = true; nuevaMision(S, id); ev.push({ tipo: 'llega', id }); news.push(`${F.icono} Llega ${F.nombre}, ${F.rol.toLowerCase()}.`); continue; }
    if (e.mision) {
      const m = F.misiones[e.mision.i];
      if (cumpleMision(S, m)) {
        e.rel = clamp(e.rel + P.premioMision, 0, 100); const fx = applyFx(S, (C.FIG_FX[id] || [])[e.mision.i] || {});
        ev.push({ tipo: 'cumple', id, texto: m.texto, fx }); news.push(`${F.icono} Cumpliste la misión de ${F.nombre}.`); nuevaMision(S, id);
      } else if (S.year >= e.mision.limite) {
        e.rel = clamp(e.rel - P.castigoMision, 0, 100);
        ev.push({ tipo: 'falla', id, texto: m.texto }); news.push(`${F.icono} No cumpliste la misión de ${F.nombre}.`); nuevaMision(S, id);
      }
    }
    const n = nivelRel(e.rel);
    if (n === 'baja' && F.baja.escandalo && S.corr > 50) { S.tr = clamp(S.tr - F.baja.escandalo, 0, 100); news.push(`${F.icono} ${F.nombre} publica un escándalo de corrupción: −${F.baja.escandalo} de legitimidad.`); }
    if (n === 'baja' && F.baja.bloqueo && counts(S).mina > 0) { const o = F.baja.bloqueo * counts(S).mina; S.gold -= o; news.push(`${F.icono} El cabildo bloquea las minas: se pierden ${o} de oro.`); }
  }
  if (ev.length) S.figEv = ev;
  return news;
}
// Respuestas a un movimiento social: qué motivos tocan.
export function reaccionarMovimiento(S, mov, accion) {
  if (accion === 'escuchar') { reaccionar(S, 'escuchar'); if (mov === 'ambientalistas') reaccionar(S, 'escucharAmbiente'); if (mov === 'campesinos') reaccionar(S, 'escucharCampesinos'); return; }
  if (accion === 'ignorar') reaccionar(S, 'ignorar');
  if (mov === 'ambientalistas' || mov === 'campesinos') reaccionar(S, mov);
}
// Para deshacer una obra: copia y restauración de las relaciones.
export function copiaRelaciones(S) { return S.fig ? Object.fromEntries(Object.entries(S.fig).map(([k, e]) => [k, e.rel])) : null; }
export function restaurarRelaciones(S, copia) { if (copia && S.fig) for (const [k, r] of Object.entries(copia)) if (S.fig[k]) S.fig[k].rel = r; S.figNuevas = []; }
