// El Ejército (fase 3): cuarta fuerza del territorio. Existe cuando hay un cuartel terminado. Su ánimo depende del
// gasto militar, del régimen y de la legitimidad del gobierno. Bien atendido da orden y seguridad; descontento,
// frente a un gobierno sin legitimidad, conspira: se anuncia un año antes y puede dar un golpe de Estado (crisis mayor).
import { C } from './contenido.js';
import { clamp } from './azar.js';
import { counts } from './reglas.js';
import { climaActivo } from './clima.js';

const K = () => C.EJERCITO;
export function ejercitoActivo(S) { return climaActivo(S) && !!C.EJERCITO && counts(S).cuartel > 0; }
export function ejercito(S) {
  if (!S.ejercito) S.ejercito = { animo: 60, gasto: K().gastoInicial, aviso: null };
  return S.ejercito;
}
// Lo que cuesta el Ejército cada año (porcentaje de los ingresos).
export function gastoMilitar(S, ingresos) { return ejercitoActivo(S) ? Math.round(ingresos * ejercito(S).gasto / 100) : 0; }

// Causas del ánimo al que tiende el Ejército.
export function partesEjercito(S) {
  const E = ejercito(S);
  return [['Punto de partida', K().base], ['Gasto militar', E.gasto * K().porPunto], ['Régimen de gobierno', K().regimen[S.reg] || 0],
    ['Legitimidad del gobierno', (S.tr - 50) * .3], ['Tesoro en rojo: soldados sin paga', S.gold < 0 ? -12 : 0]];
}
export function metaEjercito(S) { return clamp(partesEjercito(S).reduce((s, x) => s + x[1], 0), 0, 100); }
// Orden y seguridad: un Ejército contento tranquiliza a comerciantes y terratenientes.
export function seguridad(S) { return ejercitoActivo(S) && ejercito(S).animo >= K().seguridad.animo ? K().seguridad.bono : 0; }

// Cierre del año (después de corrupción y revolución): ánimo, aviso y golpe. Devuelve las noticias.
export function ejercitoDelAnio(S) {
  if (!ejercitoActivo(S)) { if (S.ejercito) S.ejercito.aviso = null; return []; }
  const E = ejercito(S), T = K().textos, G = K().golpe, news = [], siguiente = S.year + 1;
  E.animo = clamp(E.animo + (metaEjercito(S) - E.animo) * .35, 0, 100);
  const K2 = S.clima, respiro = C.CLIMA.fenomenos.respiro;
  const libre = anio => anio - K2.ultimaCrisis > respiro && !K2.fenomeno && !(K2.pronostico && Math.abs(K2.pronostico.anio - anio) <= 1) && !(S.eco && (S.eco.aviso || S.eco.fase === 'recesion'));
  if (E.aviso && E.aviso.anio === siguiente) {
    E.aviso = null;
    if (!S.regChange && E.animo < G.animoConfirma && S.tr < G.legitimidadConfirma) {
      const from = S.reg;
      S.reg = 'tirania'; S.corr = 40; S.tr = clamp(S.tr - 10, 0, 100); K2.ultimaCrisis = S.year;
      if (S.stage === 3) S.polisYears = 0;
      E.animo = 70;
      S.regChange = { type: 'golpe', from, to: 'tirania' };
      news.push(from === 'tirania' ? T.golpeInterno : T.golpe);
    } else news.push(T.calma);
  } else if (!E.aviso && E.animo < G.animo && S.tr < G.legitimidad && libre(siguiente + 1)) {
    E.aviso = { anio: siguiente + 1, nuevo: true };
    news.push(T.aviso.replace('{anio}', siguiente + 1));
  }
  return news;
}
