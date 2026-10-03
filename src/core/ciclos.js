// Economía con ciclos (fase 7): costos que suben con cada época, bonanzas y crisis del café (ahorrar o gastar la
// bonanza; subsidiar o no en la crisis), la roya (se previene renovando los cafetales), las pensiones (desde el año
// 50 se elige el sistema) y los jóvenes que se van a la ciudad. Solo en el terreno en acuarela.
import { C, EFECTOS } from './contenido.js';
import { azar, clamp } from './azar.js';
import { counts, epocaHistorica } from './reglas.js';
import { applyFx } from './dilemas.js';

const K = () => C.CICLOS;
export function ciclosActivos(S) { return !!epocaHistorica(S) && !!C.CICLOS; }
function datos(S) { if (!S.ciclo) S.ciclo = { fondoCafe: 0, ultCafe: -99, ultRoya: -99 }; return S.ciclo; }

// Multiplicador de los costos del gobierno según la época.
export function factorCostos(S) { const e = epocaHistorica(S); return e && C.CICLOS ? K().costosEpoca[e] || 1 : 1; }

// Café: precio al que tiende en una bonanza o una crisis (1 si no hay).
export function metaCafe(S) { if (!ciclosActivos(S) || !S.ciclo || !S.ciclo.cafe) return 1; return K().cafe[S.ciclo.cafe.tipo].precio; }
// Roya: cuánto rinden hoy los cafetales (1 normal).
export function factorRoya(S) { return ciclosActivos(S) && S.ciclo && S.ciclo.roya && S.ciclo.roya.hasta >= S.year ? K().roya.rinde : 1; }

// Pensiones: costo anual (crece a medida que la población envejece).
export function vejez(S) { const P = K().pensiones; return clamp((S.year - P.desde) / P.vejezAnios, .25, 1); }
export function costoPensiones(S) {
  if (!ciclosActivos(S) || !S.ciclo || !S.ciclo.pension) return 0;
  return Math.round(S.pop * K().pensiones.sistemas[S.ciclo.pension].costo * vejez(S) * S.price);
}
export function elegirPension(S, k) {
  const Ci = datos(S), P = K().pensiones;
  if (!P.sistemas[k] || Ci.pension === k) return false;
  if (Ci.pension) S.tr = clamp(S.tr - 4, 0, 100); // cambiar de sistema cuesta legitimidad
  else applyFx(S, Object.fromEntries(Object.entries(P.sistemas[k].efectos).map(([a, v]) => [EFECTOS[a], v])));
  Ci.pension = k; Ci.pensionPend = false;
  return true;
}

// Bonanza: ahorrar (va al fondo de estabilización con intereses) o gastar (entra al tesoro ya).
export function bonoBonanza(S) { return Math.round(K().cafe.bonanza.bono * Math.max(1, counts(S).cafetal) * S.price); }
export function decidirBonanza(S, modo) {
  const Ci = datos(S); if (!Ci.cafe || Ci.cafe.tipo !== 'bonanza' || Ci.cafe.decidido) return false;
  const b = bonoBonanza(S);
  if (modo === 'ahorrar') Ci.fondoCafe += Math.round(b * K().cafe.bonanza.interes); else S.gold += b;
  Ci.cafe.decidido = modo; return true;
}
// Crisis: subsidiar a los caficultores (cuesta oro) o no (baja el ánimo de los campesinos y la legitimidad).
export function costoSubsidio(S) { return Math.round(K().cafe.crisis.subsidio * Math.max(1, counts(S).cafetal) * S.price); }
export function decidirCrisis(S, modo) {
  const Ci = datos(S), Q = K().cafe.crisis; if (!Ci.cafe || Ci.cafe.tipo !== 'crisis' || Ci.cafe.decidido) return false;
  if (modo === 'subsidiar') S.gold -= costoSubsidio(S);
  else { S.sat.c = clamp(S.sat.c - Q.animo, 0, 100); S.tr = clamp(S.tr - Q.legitimidad, 0, 100); }
  Ci.cafe.decidido = modo; return true;
}
// Roya: renovar los cafetales con variedad resistente.
export function costoRenovar(S) { return Math.round(K().roya.renovar * counts(S).cafetal * S.price); }
export function puedeRenovar(S) { const Ci = S.ciclo || {}; if (Ci.resistente) return 'Ya renovaste los cafetales.'; if (!counts(S).cafetal) return 'No tienes cafetales.'; if (S.gold < costoRenovar(S)) return `Necesitas ${costoRenovar(S)} de oro.`; return null; }
export function renovarCafetales(S) { if (puedeRenovar(S)) return false; S.gold -= costoRenovar(S); datos(S).resistente = true; return true; }
// Jóvenes que se van a la ciudad: fracción de la población por año.
export function tasaMigracion(S) {
  if (!ciclosActivos(S) || S.year < K().migracion.desde) return 0;
  const M = K().migracion, c = counts(S), net = S.tec && S.tec.adoptados && S.tec.adoptados.internet && S.tec.adoptados.internet !== 'rechazado';
  return Math.max(0, M.tasa - (c.universidad ? M.universidad : 0) - (c.biblioteca ? M.biblioteca : 0) - (net ? M.internet : 0));
}

// Cierre del año. Devuelve las noticias; las tarjetas quedan en S.cicloEv.
export function ciclosDelAnio(S, crisisLibre) {
  if (!ciclosActivos(S)) return [];
  const Ci = datos(S), R = K(), news = [], ev = [], caf = counts(S).cafetal;
  // Decisiones que quedaron sin tomar: la opción por defecto.
  if (Ci.cafe && !Ci.cafe.decidido) Ci.cafe.tipo === 'bonanza' ? decidirBonanza(S, 'gastar') : decidirCrisis(S, 'no');
  if (Ci.pensionPend) elegirPension(S, 'reparto');
  // Bonanza o crisis del café.
  if (Ci.cafe && S.year >= Ci.cafe.hasta) { Ci.cafe = null; news.push(R.cafe.textos.fin); }
  else if (!Ci.cafe && caf && S.year >= R.cafe.desde && S.year - Ci.ultCafe >= R.cafe.enfriar && azar() < R.cafe.prob) {
    const crisis = azar() < .5;
    if (!crisis || crisisLibre) {
      const tipo = crisis ? 'crisis' : 'bonanza';
      Ci.cafe = { tipo, hasta: S.year + R.cafe[tipo].anios }; Ci.ultCafe = S.year;
      if (crisis && Ci.fondoCafe > 0) { const pago = Math.min(Ci.fondoCafe, costoSubsidio(S)); Ci.fondoCafe -= pago; S.gold -= costoSubsidio(S) - pago; Ci.cafe.decidido = 'fondo'; }
      ev.push({ tipo }); news.push(crisis ? '📉 Crisis del café.' : '📈 Bonanza cafetera.');
      if (crisis) S.clima.ultimaCrisis = S.year;
    }
  }
  // La roya.
  if (Ci.roya && Ci.roya.hasta < S.year) { Ci.roya = null; news.push(R.roya.textos.fin); }
  else if (!Ci.roya && caf && S.year >= R.roya.desde && S.year - Ci.ultRoya >= R.roya.enfriar && azar() < R.roya.prob) {
    Ci.ultRoya = S.year;
    if (Ci.resistente) { ev.push({ tipo: 'royaResiste' }); news.push('🍂 Llegó la roya, pero los cafetales resistieron.'); }
    else { Ci.roya = { hasta: S.year + R.roya.anios - 1 }; S.sat.c = clamp(S.sat.c - R.roya.animo, 0, 100); ev.push({ tipo: 'roya' }); news.push('🍂 La roya ataca los cafetales.'); }
  }
  // Pensiones.
  if (!Ci.pension && !Ci.pensionPend && S.year >= R.pensiones.desde) { Ci.pensionPend = true; ev.push({ tipo: 'pensiones' }); news.push('👵 La población envejece: hay que decidir cómo pagar las pensiones.'); }
  // Jóvenes que se van.
  const n = Math.round(S.pop * tasaMigracion(S));
  if (n > 0) { S.pop = Math.max(1, S.pop - n); news.push(R.migracion.texto.replace('{n}', n)); }
  if (ev.length) S.cicloEv = ev;
  return news;
}
