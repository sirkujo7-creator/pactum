// Megaproyectos (fase 6): desde Polis, represa, ferrocarril y aeropuerto. Ficha financiera (inversión, cuota, beneficio,
// VPN, TIR, recuperación), consulta previa con las comunidades (un año; puede aprobar o rechazar) y obra de varios años
// que se paga por cuotas. Saltarse la consulta dispara el conflicto. Solo en el terreno en acuarela.
import { C } from './contenido.js';
import { azar, clamp } from './azar.js';
import { climaActivo } from './clima.js';
import { loanRate } from './hacienda.js';
import { lado, nearRiver } from './mundo.js';
import { centroPueblo } from './cobertura.js';
import { animoGrupo } from './grupos.js';
import { reaccionar } from './figuras.js';
import { recordar } from './memoria.js';
import { efectoLeyes } from './civismo.js';

const K = () => C.MEGA;
export function megaActivos(S) { return climaActivo(S) && !!C.MEGA && S.stage >= K().desde.etapa; }
export function estadoMega(S, id) { return (S.mega && S.mega[id]) || null; }

// Ficha financiera con la tasa de interés de hoy.
export function evaluarMega(S, id) {
  const P = K().proyectos[id], r = loanRate(S), n = P.anios, H = K().horizonte;
  const inversion = Math.round(P.costo * S.price), cuota = Math.round(inversion / n), beneficio = Math.round(P.beneficio * S.price);
  const vpnA = tasa => { let v = 0; for (let t = 0; t < n; t++) v -= cuota / (1 + tasa) ** t; for (let t = n; t < n + H; t++) v += beneficio / (1 + tasa) ** t; return v; };
  let lo = -.5, hi = 1;
  for (let k = 0; k < 60; k++) { const m = (lo + hi) / 2; if (vpnA(m) > 0) lo = m; else hi = m; }
  return { inversion, cuota, anios: n, beneficio, tasa: r, vpn: Math.round(vpnA(r)), tir: (lo + hi) / 2, recupera: n + Math.ceil(inversion / beneficio), horizonte: H };
}
// Probabilidad de que la consulta apruebe.
export function probConsulta(S, id) {
  const Q = K().consulta, lider = S.fig && S.fig.lider ? S.fig.lider.rel : 50;
  return clamp(Q.probBase + (lider - 50) * Q.porRelacion + (S.env - 50) * Q.porAmbiente + (animoGrupo(S, 'jornaleros').valor - 50) * Q.porAnimoCampesino + (K().proyectos[id].consultaMas || 0) + efectoLeyes(S, 'consulta.prob'), .05, .95);
}
export function costoConsulta(S) { return Math.round(K().consulta.costo * S.price * Math.max(0, 1 + efectoLeyes(S, 'consulta.costo'))); } // fase 12: con la ley de consulta popular es gratis
export function puedeConsultar(S, id) {
  const e = estadoMega(S, id);
  if (e) return 'Ya empezó el proceso de este proyecto.';
  if (S.gold < costoConsulta(S)) return `Necesitas ${costoConsulta(S)} de oro.`;
  return null;
}
export function consultar(S, id) {
  if (puedeConsultar(S, id)) return false;
  S.gold -= costoConsulta(S); (S.mega = S.mega || {})[id] = { estado: 'consulta', desde: S.year };
  S.log.unshift({ y: S.year, t: `Abriste la consulta previa sobre ${K().proyectos[id].nombre.toLowerCase()}.` });
  return true;
}
export function puedeIniciar(S, id) {
  const e = estadoMega(S, id), ev = evaluarMega(S, id);
  if (e && !['aprobado', 'rechazado'].includes(e.estado)) return e.estado === 'consulta' ? 'La consulta está en curso.' : 'El proyecto ya está en marcha o terminado.';
  if (S.gold < ev.cuota) return `Necesitas ${ev.cuota} de oro para la primera cuota.`;
  return null;
}
function sitio(S, id) {
  const N = lado(S), c = centroPueblo(S), cr = Math.floor(c / N), cc = c % N;
  const cand = S.map.map((x, i) => i).filter(i => { const x = S.map[i]; if (x.b || x.mk || x.t !== 'llano') return false; const d = Math.hypot(Math.floor(i / N) - cr, i % N - cc); return d >= 4 && d <= 10 && (id !== 'represa' || nearRiver(S, i)); });
  return cand.length ? cand[(S.year * 13 + id.length) % cand.length] : -1;
}
// Empezar la obra. Sin consulta aprobada: conflicto, legitimidad, cabildo y movimientos.
export function iniciarMega(S, id) {
  if (puedeIniciar(S, id)) return false;
  const P = K().proyectos[id], ev = evaluarMega(S, id), e = estadoMega(S, id), sinConsulta = !e || e.estado !== 'aprobado';
  const i = sitio(S, id); if (i < 0) return false;
  S.gold -= ev.cuota;
  (S.mega = S.mega || {})[id] = { estado: 'obra', desde: S.year, pagado: 1, cuota: ev.cuota, i, sinConsulta };
  S.map[i].mk = { t: 'megaobra', y: S.year, d: `Año ${S.year}: empieza la obra de ${P.nombre.toLowerCase()}.` };
  if (sinConsulta) {
    const Q = K().sinConsulta;
    if (S.conf) S.conf.nivel = clamp(S.conf.nivel + Q.conflicto, 0, 100); else S.conf = { nivel: Q.conflicto, grupo: false, estrategia: 'ninguna', camp: -1 };
    S.tr = clamp(S.tr + Q.legitimidad, 0, 100);
    if (S.fig && S.fig.lider) S.fig.lider.rel = clamp(S.fig.lider.rel + Q.relacionLider, 0, 100);
    for (const m of ['campesinos', 'ambientalistas']) if (S.mov && S.mov[m]) S.mov[m].f = clamp(S.mov[m].f + Q.movimientos, 0, 100);
    reaccionar(S, 'fuerza'); recordar(S, 'abandono', 2);
  }
  S.log.unshift({ y: S.year, t: `Empezó la obra de ${P.nombre.toLowerCase()}${sinConsulta ? ' sin consulta previa' : ''}.` });
  return true;
}
export function cancelarMega(S, id) { const e = estadoMega(S, id); if (e && e.estado === 'rechazado') { e.estado = 'cancelado'; S.tr = clamp(S.tr + 2, 0, 100); recordar(S, 'justicia'); return true; } return false; }

// Efectos de los megaproyectos terminados.
export function efectoMega(S, k) {
  if (!climaActivo(S) || !S.mega || !C.MEGA) return 0;
  let v = 0;
  for (const [id, e] of Object.entries(S.mega)) if (e.estado === 'listo') v += K().proyectos[id].efectos[k] || 0;
  return v;
}
// Cierre del año: consultas, cuotas, obras que terminan y beneficio de las terminadas. Devuelve las noticias.
export function megaDelAnio(S) {
  if (!megaActivos(S) || !S.mega) return [];
  const T = K().textos, news = [], ev = [];
  for (const [id, e] of Object.entries(S.mega)) {
    const P = K().proyectos[id];
    if (e.estado === 'consulta' && S.year > e.desde) {
      const si = azar() < probConsulta(S, id); e.estado = si ? 'aprobado' : 'rechazado';
      if (si) S.tr = clamp(S.tr + 2, 0, 100);
      ev.push({ id, tipo: si ? 'consultaSi' : 'consultaNo' }); news.push(`${P.icono} ${si ? T.consultaSi : T.consultaNo}`);
    } else if (e.estado === 'obra') {
      if (e.pagado >= P.anios) {
        e.estado = 'listo'; e.listo = S.year;
        if (e.i >= 0) S.map[e.i].mk = { t: P.marca, y: S.year, d: `Año ${S.year}: se inaugura ${P.nombre.toLowerCase()}.` };
        if (P.efectos.vecinos && S.vecinos) for (const v of Object.values(S.vecinos)) v.rel = clamp(v.rel + P.efectos.vecinos, 0, 100);
        ev.push({ id, tipo: 'termina' }); news.push(`${P.icono} ${T.termina.replace('{p}', P.nombre)}`);
      } else if (S.gold >= e.cuota) { S.gold -= e.cuota; e.pagado++; e.det = 0; }
      else { e.det = (e.det || 0) + 1; if (e.det === 1) news.push(`${P.icono} ${T.detenido.replace('{p}', P.nombre)}`); }
    } else if (e.estado === 'listo') S.gold += Math.round(P.beneficio * S.price);
  }
  if (ev.length) S.megaEv = ev;
  return news;
}
