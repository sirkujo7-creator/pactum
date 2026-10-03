// Economía viva (fase 2): precio del alimento por oferta y demanda (costo de vida), precio internacional del café
// y ciclo de auge y recesión. La recesión es una crisis mayor: se anuncia un año antes y respeta los años de respiro.
// Se abre en Pueblo con 60 habitantes, solo en el terreno en acuarela.
import { azar, clamp } from './azar.js';
import { C } from './contenido.js';
import { climaActivo } from './clima.js';
import { counts } from './reglas.js';
import { metaCafe } from './ciclos.js';

const K = () => C.ECO;
export function ecoInicial() { return { fase: 'normal', anios: 0, aviso: null, cafe: 1, pa: 1, abierta: false, evento: null }; }
export function economiaActiva(S) { return climaActivo(S) && !!S.eco && S.eco.abierta; }

// Precio del alimento (1 = normal) y del café en el mercado internacional.
export function precioAlimento(S) { return economiaActiva(S) ? S.eco.pa : 1; }
export function precioCafe(S) { return economiaActiva(S) ? S.eco.cafe : 1; }
export function fase(S) { return economiaActiva(S) ? S.eco.fase : 'normal'; }
// Multiplicador de los ingresos de la gente según el ciclo.
export function factorIngresos(S) { const f = fase(S), Q = K().ciclo; return f === 'auge' ? Q.ingresosAuge : f === 'recesion' ? Q.ingresosRecesion : 1; }
// Ingreso extra de los campesinos cuando la comida está cara (venden más caro).
export function factorCampesinos(S) { return 1 + (precioAlimento(S) - 1) * K().alimento.ingresoCampesinos; }
// Ánimo: costo de vida (alimento caro) y recesión; las obras en marcha lo sostienen en la recesión (Keynes).
export function animoEconomia(S, obrasActivas) {
  if (!economiaActiva(S)) return { c: 0, a: 0 };
  const A = K().alimento, Q = K().ciclo, d = precioAlimento(S) - 1;
  let c = d * A.animoCampesinos, a = -d * A.animoArtesanos;
  if (S.eco.fase === 'recesion') { const alivio = Math.min(Q.animoObrasMaximo, obrasActivas * Q.animoPorObra); c += alivio - Q.animoRecesion; a += alivio - Q.animoRecesion; }
  return { c, a };
}
// En la recesión, cada obra en marcha emplea más gente (gasto público contracíclico).
export function factorEmpleoObra(S) { return fase(S) === 'recesion' ? K().ciclo.empleoObraRecesion : 1; }

// Cierre del año: nuevo precio del alimento, del café y paso del ciclo. F: cuentas del año. Devuelve las noticias.
export function economiaDelAnio(S, F) {
  if (!climaActivo(S) || !S.eco) return [];
  const E = S.eco, T = K().textos, Q = K().ciclo, news = [], d = K().desde;
  if (!E.abierta) { if (S.stage >= d.etapa && S.pop >= d.habitantes) E.abierta = true; else return []; }
  // Precio del alimento: demanda frente a lo que se produce más una parte de lo guardado.
  // La reserva cuenta hasta un año de consumo; con un colchón normal de comida el precio es 1.
  const A = K().alimento, oferta = Math.max(1, F.fprod + Math.min(Math.max(0, S.food), F.cons) * A.reserva);
  const nuevo = clamp(Math.pow(F.cons * A.colchon / oferta, A.elasticidad), A.minimo, A.maximo), antes = E.pa;
  E.pa = Math.round((nuevo * (1 - A.memoria) + antes * A.memoria) * 100) / 100;
  // Fase 4: los mercados estabilizan el precio de la comida.
  E.pa = Math.round((1 + (E.pa - 1) * (1 - Math.min(.3, .06 * counts(S).mercado))) * 100) / 100;
  if (E.pa >= 1.3 && antes < 1.3) news.push(T.precioAlto); else if (E.pa <= .8 && antes > .8) news.push(T.precioBajo);
  // Café: tiende al valor de la fase, con sorpresas del mercado internacional.
  const Cf = K().cafe, meta = (Cf[E.fase] || 1) * metaCafe(S); // fase 7: bonanzas y crisis del café
  E.cafe = Math.round(clamp(E.cafe + (meta - E.cafe) * Cf.ajuste + (azar() - .5) * Cf.ruido, Cf.minimo, Cf.maximo) * 100) / 100;
  // Ciclo económico.
  const siguiente = S.year + 1, respiro = C.CLIMA.fenomenos.respiro, K2 = S.clima;
  const libre = anio => anio - K2.ultimaCrisis > respiro && !(K2.pronostico && Math.abs(K2.pronostico.anio - anio) <= 1) && !K2.fenomeno;
  if (E.fase === 'recesion' || E.fase === 'auge') {
    E.anios--;
    if (E.anios <= 0) {
      const eraAuge = E.fase === 'auge';
      E.fase = 'normal'; news.push(eraAuge ? T.finAuge : T.termina);
      if (eraAuge && !E.aviso && azar() < Q.probBurbuja && libre(siguiente + 1)) E.aviso = { anio: siguiente + 1, nuevo: true };
    }
  } else if (E.aviso && E.aviso.anio === siguiente) {
    E.fase = 'recesion'; E.anios = Q.aniosRecesion; E.aviso = null; K2.ultimaCrisis = siguiente; // crisis mayor
    E.evento = { tipo: 'recesion', anio: siguiente, nuevo: true }; news.push(T.empieza);
  } else if (!E.aviso) {
    const r = azar();
    if (r < Q.probAuge) { E.fase = 'auge'; E.anios = Q.aniosAuge[0] + Math.floor(azar() * (Q.aniosAuge[1] - Q.aniosAuge[0] + 1)); news.push(T.auge); }
    else if (r < Q.probAuge + Q.probAviso && libre(siguiente + 1)) E.aviso = { anio: siguiente + 1, nuevo: true };
  }
  return news;
}
