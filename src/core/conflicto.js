// Conflicto armado y desplazamiento (fase 4): un nivel de 0 a 100 que crece donde el Estado no llega (sin policía ni
// escuelas, campesinos pobres y sin tierra, poca legitimidad, inseguridad, minas). Desde 40 aparece un grupo armado
// (ficticio): veredas abandonadas (menos cosecha), desplazados, extorsión y pérdida de legitimidad; muy alto, una
// toma armada (crisis mayor). El gobierno elige una estrategia: ofensiva, diálogo de paz o inversión social.
// Solo en el terreno en acuarela.
import { C } from './contenido.js';
import { azar, clamp } from './azar.js';
import { counts, cap } from './reglas.js';
import { climaActivo, marcarCrisis } from './clima.js';
import { cobertura } from './cobertura.js';
import { animoGrupo, tierra } from './grupos.js';
import { inseguridad } from './sucesos.js';
import { applyFx } from './dilemas.js';
import { reaccionar } from './figuras.js';
import { dejarMarca } from './marcas.js';
import { crisisLibre } from './desastres.js';
import { lado } from './mundo.js';
import { centroPueblo } from './cobertura.js';

const K = () => C.CONF;
export function conflictoActivo(S) { return climaActivo(S) && !!C.CONF && S.stage >= K().desde.etapa && S.year >= K().desde.anio; }
export function conflicto(S) { if (!S.conf) S.conf = { nivel: 0, grupo: false, estrategia: 'ninguna', camp: -1 }; return S.conf; }
export function hayGrupo(S) { return climaActivo(S) && !!S.conf && S.conf.grupo; }

// Causas del nivel al que tiende el conflicto: [texto, puntos].
export function partesConflicto(S) {
  const Q = K().causas, cob = cobertura(S), c = counts(S);
  return [['Punto de partida', Q.base], ['Casas sin policía cerca', (1 - (c.policia ? cob.policia : 0)) * Q.sinPolicia], ['Casas sin escuela cerca', (1 - (c.escuela ? cob.escuela : 0)) * Q.sinEscuela],
    ['Pobreza rural (jornaleros sin tierra)', Math.max(0, 45 - animoGrupo(S, 'jornaleros').valor) * Q.pobrezaRural], ['Pocos campesinos con tierra', Math.max(0, .4 - tierra(S)) * Q.pocaTierra],
    ['Poca legitimidad', Math.max(0, 50 - S.tr) * Q.legitimidad], ['Inseguridad', inseguridad(S) * Q.inseguridad], ['Minas (rentas ilegales)', c.mina * Q.mina]];
}
export function metaConflicto(S) { return clamp(partesConflicto(S).reduce((s, x) => s + x[1], 0), 0, 100); }
export function puedeEstrategia(S, id) { const E = K().estrategias[id]; return E.requiere && !counts(S)[E.requiere] ? `Necesitas ${C.B[E.requiere].a}.` : null; }
export function elegirEstrategia(S, id) { if (puedeEstrategia(S, id)) return false; conflicto(S).estrategia = id; return true; }
// Pérdida de cosecha por veredas abandonadas.
export function perdidaCosecha(S) { return hayGrupo(S) ? Math.min(.4, S.conf.nivel * K().efectos.cosecha) : 0; }

function campamento(S) {
  const N = lado(S), c = centroPueblo(S); if (c < 0) return -1;
  let mejor = -1, d0 = -1;
  S.map.forEach((x, i) => { if (x.b || x.mk || (x.t !== 'bosque' && x.t !== 'llano')) return; const d = Math.hypot(Math.floor(i / N) - Math.floor(c / N), i % N - c % N); if (d > d0) { d0 = d; mejor = i; } });
  return mejor;
}

// Cierre del año. Devuelve las noticias; el suceso para la tarjeta queda en S.confEv.
export function conflictoDelAnio(S) {
  if (!conflictoActivo(S)) return [];
  const F = conflicto(S), P = K(), T = P.textos, E = P.estrategias[F.estrategia] || P.estrategias.ninguna, news = [], g = P.grupo;
  if (E.requiere && !counts(S)[E.requiere]) F.estrategia = 'ninguna';
  let delta = (metaConflicto(S) - F.nivel) * P.ajuste;
  if (F.grupo && F.estrategia !== 'ninguna') {
    delta -= E.baja; S.gold -= Math.round(E.oro * S.price);
    if (E.tierra && S.tierra !== undefined) S.tierra = clamp(S.tierra + E.tierra / 100, .05, .95);
    if (E.campesinos) S.sat.c = clamp(S.sat.c + E.campesinos, 0, 100);
    if (F.estrategia === 'ofensiva') reaccionar(S, 'fuerza');
  }
  F.nivel = clamp(F.nivel + delta, 0, 100);
  if (!F.grupo && F.nivel >= P.aparece) {
    F.grupo = true; F.camp = campamento(S); F.desde = S.year;
    if (F.camp >= 0) S.map[F.camp].mk = { t: 'campamento', y: S.year, d: `Año ${S.year}: ${g} se asienta en las veredas.` };
    S.confEv = { tipo: 'aparece', nuevo: true }; news.push(T.aparece.replace('{grupo}', g));
    return news;
  }
  if (!F.grupo) return news;
  if (F.nivel < P.seVa) {
    const paz = F.estrategia === 'dialogo';
    if (F.camp >= 0 && S.map[F.camp].mk && S.map[F.camp].mk.t === 'campamento') delete S.map[F.camp].mk;
    F.grupo = false; F.camp = -1;
    if (paz) { S.tr = clamp(S.tr + 6, 0, 100); dejarMarca(S, 'placa', `Año ${S.year}: acuerdo de paz con ${g}.`); }
    S.confEv = { tipo: paz ? 'paz' : 'repliega', nuevo: true }; F.estrategia = 'ninguna';
    news.push((paz ? T.paz : T.repliega).replace('{grupo}', g));
    return news;
  }
  // Efectos del año con el grupo armado.
  const X = P.efectos, n = Math.round(F.nivel / X.desplazados * (F.estrategia === 'ofensiva' ? E.desplazados : 1));
  if (n > 0) { S.pop = Math.min(cap(S) + 6, S.pop + n); news.push(T.desplazados.replace('{n}', n)); }
  const oro = Math.round(F.nivel * X.extorsion * S.price); S.gold -= oro; news.push(T.extorsion.replace('{oro}', oro));
  S.tr = clamp(S.tr - X.legitimidad, 0, 100); S.shock += X.inflacion / 100;
  // Toma armada.
  const Tm = P.toma;
  if (F.nivel >= Tm.nivel && crisisLibre(S, S.year) && azar() < Tm.prob) {
    const cand = S.map.map((x, i) => i).filter(i => Tm.obras.includes(S.map[i].b) && !S.map[i].ob);
    if (cand.length) {
      const i = cand[Math.floor(azar() * cand.length)], x = S.map[i];
      x.u = Math.min(100, (x.u || 0) + Tm.dano); x.sin = S.year;
      applyFx(S, { p: -Tm.perdida, c: Tm.legitimidad });
      marcarCrisis(S);
      const t = T.toma.replace('{grupo}', g).replace('{obra}', C.B[x.b].a);
      S.confEv = { tipo: 'toma', nuevo: true, texto: t, obra: i }; news.push(t);
    }
  }
  return news;
}
