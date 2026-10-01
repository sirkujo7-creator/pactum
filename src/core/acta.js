// Acta fundacional (fase 3, contrato social): al empezar, el jugador elige dos principios. Firmar da legitimidad
// de origen (y, si se configura, cumplirlos suma cada año); contradecirlos la resta de golpe. Las faltas se anotan para explicarlas.
// Solo en el terreno en acuarela y en partidas nuevas (las guardadas antes no tienen acta).
import { C } from './contenido.js';
import { clamp } from './azar.js';
import { climaActivo } from './clima.js';

const K = () => C.ACTA;
export function actaDisponible(S) { return climaActivo(S) && !!C.ACTA; }
export function actaActiva(S) { return actaDisponible(S) && !!S.acta && S.acta.p.length > 0; }
export function firmarActa(S, ids) {
  S.acta = { p: ids.filter(id => K().principios[id]).slice(0, K().cuantos), anio: S.year, faltas: [], nuevas: [] };
  S.tr = clamp(S.tr + (K().alFirmar || 0), 0, 100); // legitimidad de origen: el pacto funda el poder
  S.log.unshift({ y: S.year, t: `Firmaste el acta fundacional: ${S.acta.p.map(id => K().principios[id].nombre.toLowerCase()).join(' y ')}.` });
}

// Un acto del gobierno: si contradice algún principio firmado, cuesta legitimidad. Devuelve los textos de las faltas.
export function contradecir(S, motivo) {
  if (!actaActiva(S)) return [];
  const out = [];
  for (const id of S.acta.p) {
    const P = K().principios[id], razon = P.contradice[motivo];
    if (!razon) continue;
    S.tr = clamp(S.tr - K().costo, 0, 100);
    const t = `${P.icono} Contradijiste el acta («${P.nombre}»): ${razon}. −${K().costo} de legitimidad.`;
    S.acta.faltas.unshift({ anio: S.year, p: id, razon });
    if (S.acta.faltas.length > 20) S.acta.faltas.pop();
    S.acta.nuevas.push(t); out.push(t);
  }
  return out;
}
// Respuestas a los movimientos sociales: qué motivos tocan.
export function contradecirMovimiento(S, mov, accion) {
  const out = [];
  if (accion === 'ignorar') out.push(...contradecir(S, 'ignorar'));
  if (accion !== 'escuchar' && mov === 'ambientalistas') out.push(...contradecir(S, 'ambientalistas'));
  if (accion !== 'escuchar' && mov === 'campesinos') out.push(...contradecir(S, 'campesinos'));
  return out;
}

// Principios cumplidos: sin faltas en los últimos años (cuentan desde la firma).
export function cumplidos(S) {
  if (!actaActiva(S)) return [];
  const N = K().aniosCoherencia;
  return S.acta.p.filter(id => !S.acta.faltas.some(f => f.p === id && S.year - f.anio < N));
}
// Bono a la meta de legitimidad por coherencia.
export function coherencia(S) { return actaActiva(S) ? cumplidos(S).length * K().bono : 0; }

// Cierre del año: los impuestos regresivos contradicen la igualdad (como mucho una vez cada pocos años).
export function actaDelAnio(S) {
  if (!actaActiva(S) || !S.acta.p.includes('igualdad')) return [];
  const ult = S.acta.faltas.find(f => f.p === 'igualdad');
  if (ult && S.year - ult.anio < K().aniosEntreImpuestos) return [];
  return S.tx.c > S.tx.e || S.tx.a > S.tx.e ? contradecir(S, 'regresivo') : [];
}
// La interfaz muestra las faltas nuevas una vez.
export function faltasNuevas(S) { if (!actaActiva(S) || !S.acta.nuevas.length) return []; const n = S.acta.nuevas; S.acta.nuevas = []; return n; }
// Deshacer una obra deshace también sus faltas al acta (las n más recientes).
export function deshacerFaltas(S, n) {
  if (!actaActiva(S) || !n) return;
  S.acta.faltas.splice(0, n); S.acta.nuevas.splice(-n, n);
  S.tr = clamp(S.tr + n * K().costo, 0, 100);
}
// Para avisar antes de decidir: qué principios firmados contradiría un acto.
export function contradiria(S, motivos) {
  if (!actaActiva(S)) return [];
  return S.acta.p.filter(id => motivos.some(m => K().principios[id].contradice[m])).map(id => K().principios[id]);
}
export function motivosDeOpcion(ev, o) {
  const m = [];
  if (o.fuerza) m.push('fuerza');
  if (o.fx && o.fx.ti < 0) m.push('quitarTierra');
  if (ev.mov && o.accion === 'ignorar') m.push('ignorar');
  if (ev.mov && o.accion !== 'escuchar' && (ev.mov === 'ambientalistas' || ev.mov === 'campesinos')) m.push(ev.mov);
  return m;
}
