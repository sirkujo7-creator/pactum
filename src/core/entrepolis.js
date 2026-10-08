// Relaciones entre las polis (fase 16, punto 5): las vecinas tienen sus propios pleitos y alianzas, con hechos reales de cada
// época. De vez en cuando te piden que medies o que tomes partido; lo que decides cambia tu relación con las dos y queda
// anotado en «Entre las polis». Solo en acuarela.
import { C } from './contenido.js';
import { azar, clamp } from './azar.js';
import { epocaHistorica } from './reglas.js';
import { exteriorActivo, relacionExterior, estadoExterior } from './exterior.js';
import { applyFx } from './dilemas.js';

const K = () => C.ENTRE;
export const entrePolisActivo = S => exteriorActivo(S) && !!C.ENTRE;
export function datosEntre(id) { return K().eventos.find(e => e.id === id); }
export function estadoEntre(S) { const X = estadoExterior(S); return X.entre || (X.entre = {}); }
// Opciones del evento: mediar, apoyar a una, apoyar a la otra, o callar.
export function opcionesEntre(e) {
  const T = K().textos, L = C.EXT.lugares;
  return [
    { k: 'mediar', texto: T.mediar, efectos: e.mediar.efectos },
    { k: 'a', texto: T.apoyar.replace('{lugar}', L[e.a].nombre), efectos: e.ventajaA },
    { k: 'b', texto: T.apoyar.replace('{lugar}', L[e.b].nombre), efectos: e.ventajaB },
    { k: 'nada', texto: T.neutral, efectos: { animo: -1 } }
  ];
}
export function polisDelAnio(S) {
  if (!entrePolisActivo(S) || S.year < K().desde || S.year - (S.entreUlt ?? -99) < K().aniosEntre || S.polisEv || !(azar() < K().prob)) return [];
  const ep = epocaHistorica(S), vistas = S.entreVistas || [];
  const L = K().eventos.filter(e => e.epoca === ep && !vistas.includes(e.id) && (relacionExterior(S, e.a) || relacionExterior(S, e.b)));
  if (!L.length) return [];
  const e = L[Math.floor(azar() * L.length)], N = C.EXT.lugares;
  S.polisEv = { id: e.id, anio: S.year, nuevo: true }; S.entreVistas = [...vistas, e.id]; S.entreUlt = S.year;
  return [`${e.icono} ${N[e.a].nombre} y ${N[e.b].nombre}: ${e.titulo}. Piden tu palabra.`];
}
// Responde al pleito pendiente con la opción k; devuelve lo que pasó.
export function elegirEntre(S, k) {
  const ev = S.polisEv, e = ev && datosEntre(ev.id); if (!e) return null;
  const op = opcionesEntre(e).find(o => o.k === k); if (!op) return null;
  const fx = applyFx(S, op.efectos), ra = relacionExterior(S, e.a), rb = relacionExterior(S, e.b), cambia = (r, v) => { if (r) r.rel = clamp(r.rel + v, 0, 100); };
  const par = [e.a, e.b].sort().join('|'), est = estadoEntre(S);
  if (k === 'mediar') { cambia(ra, 3); cambia(rb, 3); est[par] = 'amigas'; }
  else if (k === 'a') { cambia(ra, 7); cambia(rb, -7); est[par] = 'rivales'; }
  else if (k === 'b') { cambia(rb, 7); cambia(ra, -7); est[par] = 'rivales'; }
  else { cambia(ra, -1); cambia(rb, -1); }
  const N = C.EXT.lugares;
  S.log.unshift({ y: S.year, t: `${N[e.a].nombre} y ${N[e.b].nombre}: ${e.titulo}. Tu respuesta: ${op.texto.toLowerCase()}.` });
  S.polisEv = null;
  return { ...op, fx };
}
