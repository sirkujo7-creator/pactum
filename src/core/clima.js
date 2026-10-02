// Clima del territorio (fase 1): lluvias de cada año, El Niño y La Niña con pronóstico, y fondo de emergencias.
// Solo actúa en el terreno en acuarela; en el modo de comparación con la v9 queda apagado.
import { azar, clamp } from './azar.js';
import { C } from './contenido.js';
import { nearRiver } from './mundo.js';

export function climaActivo(S) { return !!(S && S.clima && S.mundo === 'acuarela'); }
export function climaInicial() { return { lluvias: 'normales', fenomeno: null, pronostico: null, ultimaCrisis: -99, fertil: 0, evento: null }; }

// Datos del tipo de lluvias de este año.
export function lluvias(S) { return climaActivo(S) ? C.CLIMA.lluvias[S.clima.lluvias] : null; }

// Multiplica la producción de alimento (lluvias del año y la fertilidad que deja La Niña).
export function factorCosecha(S) {
  const L = lluvias(S);
  if (!L) return 1;
  // Fase 4: la ceniza de una erupción reduce la cosecha del año siguiente.
  return L.cosecha * (S.clima.fertil > 0 ? C.CLIMA.fenomenos.nina.fertilidadDespues : 1) * (S.ceniza === S.year && C.DESASTRES ? C.DESASTRES.volcan.erupcion.ceniza : 1)
    * (S.conf && S.conf.grupo && C.CONF ? 1 - Math.min(.4, S.conf.nivel * C.CONF.efectos.cosecha) : 1); // fase 4: veredas abandonadas por el conflicto
}
// En El Niño el río baja y los acueductos entregan menos agua.
export function factorAgua(S) { return climaActivo(S) && S.clima.fenomeno === 'nino' ? 1 - C.CLIMA.fenomenos.nino.aguaMenos : 1; }

// ¿Ya pueden llegar El Niño y La Niña? (Pueblo con 60 habitantes, según el diseño.)
export function fenomenosAbiertos(S) { const d = C.CLIMA.fenomenos.desde; return climaActivo(S) && S.stage >= d.etapa && S.pop >= d.habitantes; }

// Marca una crisis mayor (desastre, revolución o cesación de pagos) para respetar los años de respiro.
export function marcarCrisis(S) { if (climaActivo(S)) S.clima.ultimaCrisis = S.year; }

// Aporte al fondo de emergencias (porcentaje de los ingresos).
// Intereses del fondo (una reserva invertida rinde algo cada año).
export function interesFondo(S) { return climaActivo(S) ? Math.round((S.fondo || 0) * C.CLIMA.fondo.interes) : 0; }
export function aporteFondo(S, ingresos) { return climaActivo(S) && S.stage >= 1 ? Math.round(ingresos * (S.aporteFondo || 0) / 100) : 0; }

// Emergencia del año de El Niño o La Niña: cuánto cuesta atenderla, cuánto cubre el fondo y qué pasa si falta.
// Devuelve las noticias para la crónica.
// Lo que costaría hoy atender El Niño o La Niña.
export function costoEmergencia(S, f, obrasRiberenas) {
  const F = C.CLIMA.fenomenos[f];
  if (obrasRiberenas === undefined) obrasRiberenas = S.map.filter((x, i) => x.b && nearRiver(S, i)).length;
  let costo = S.pop * F.costoPorHabitante;
  if (f === 'nina') costo += obrasRiberenas * F.danoPorObraRibereña;
  return Math.round(costo * S.price);
}
// Fondo que alcanzaría para la peor de las dos emergencias con el pueblo de hoy.
export function fondoSugerido(S) { return climaActivo(S) ? Math.max(costoEmergencia(S, 'nino'), costoEmergencia(S, 'nina')) : 0; }

export function atenderEmergencia(S, obrasRiberenas) {
  const f = S.clima.fenomeno, F = C.CLIMA.fenomenos[f], noticias = [];
  const costo = costoEmergencia(S, f, obrasRiberenas);
  const cubierto = Math.min(S.fondo || 0, costo), resto = costo - cubierto, falta = costo ? resto / costo : 0;
  S.fondo = (S.fondo || 0) - cubierto;
  S.gold -= resto;
  const FF = C.CLIMA.fenomenos;
  if (falta < .01) { S.tr = clamp(S.tr + FF.confianzaAtendida, 0, 100); noticias.push(F.atendida); }
  else {
    const a = F.animoSinAtender;
    S.sat.c = clamp(S.sat.c + a.c * falta, 0, 100); S.sat.a = clamp(S.sat.a + a.a * falta, 0, 100);
    S.tr = clamp(S.tr + FF.confianzaSinAtender * falta, 0, 100);
    noticias.push(F.noAtendida);
  }
  S.clima.evento = { tipo: f, anio: S.year, costo, cubierto, resto, obrasRiberenas };
  return noticias;
}

// Al cerrar el año: termina el fenómeno del año, sortea las lluvias del siguiente y, a veces, anuncia
// El Niño o La Niña para el año subsiguiente (un año de aviso). Devuelve las noticias para la crónica.
export function climaDelAnioSiguiente(S) {
  if (!climaActivo(S)) return [];
  const K = S.clima, noticias = [], siguiente = S.year + 1;
  if (K.fertil > 0) K.fertil--;
  if (K.fenomeno === 'nina') K.fertil = 1;
  K.fenomeno = null;
  // ¿Llega un fenómeno anunciado?
  if (K.pronostico && K.pronostico.anio === siguiente) {
    K.fenomeno = K.pronostico.tipo; K.lluvias = K.fenomeno; K.pronostico = null; K.ultimaCrisis = siguiente;
    noticias.push(`Llega ${C.CLIMA.fenomenos[K.fenomeno].nombre}.`);
  } else {
    // Lluvias normales del año.
    const tipos = Object.entries(C.CLIMA.lluvias).filter(([, t]) => t.probabilidad > 0);
    let x = azar(), elegido = tipos[tipos.length - 1][0];
    for (const [k, t] of tipos) { if (x < t.probabilidad) { elegido = k; break; } x -= t.probabilidad; }
    K.lluvias = elegido;
    noticias.push(`Pronóstico del año ${siguiente}: ${C.CLIMA.lluvias[elegido].nombre.toLowerCase()}.`);
  }
  // ¿Se anuncia un fenómeno para dentro de dos años? Solo con respiro suficiente tras la última crisis.
  const F = C.CLIMA.fenomenos, anio = siguiente + 1;
  if (!K.pronostico && !K.fenomeno && !(S.eco && (S.eco.aviso || S.eco.fase === 'recesion')) && fenomenosAbiertos(S) && anio - K.ultimaCrisis > F.respiro && azar() < F.probabilidadAnual) {
    const tipo = azar() < .5 ? 'nino' : 'nina';
    K.pronostico = { tipo, anio, nuevo: true };
    noticias.push(`Pronóstico: ${F[tipo].nombre} llegará el año ${anio}.`);
  }
  return noticias;
}

// Compatibilidad con el paso 1.
export function sortearLluvias(S) { const n = climaDelAnioSiguiente(S); return n.length ? n.join(' ') : null; }
