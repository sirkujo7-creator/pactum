// Voces del pueblo (pedido de Juan, 13 de octubre): cada poblador dice lo que le preocupa según los problemas reales
// de su casa y de su clase (empleo, comida, escuela, hospital, agua, camino, inseguridad, violencia, impuestos), lo que
// agradece y de qué se acuerda. Una vez al año se puede «tomar nota» de su queja: queda como promesa en Pendientes y,
// si se resuelve antes del plazo, su clase lo agradece; si no, la legitimidad baja un poco. Solo en acuarela.
import { C } from './contenido.js';
import { climaActivo } from './clima.js';
import { counts } from './reglas.js';
import { society, waterCap } from './sociedad.js';
import { serviciosDeCasa, coberturaActiva } from './cobertura.js';
import { precioAlimento } from './economia.js';
import { aislada } from './calles.js';
import { inseguridad } from './sucesos.js';
import { recuerdos } from './memoria.js';
import { clamp } from './azar.js';

const K = () => C.VOCES;
export const vocesActivas = S => climaActivo(S) && !!C.VOCES;
const CLASE = { c: 'campesinos', a: 'artesanos', e: 'élite', u: 'artesanos', n: 'artesanos' };

// ¿Tiene esta persona (por su casa y su clase) este problema hoy?
export function problemaActivo(S, id, casa, clase) {
  const serv = () => coberturaActiva(S) && casa >= 0 && S.map[casa] && S.map[casa].b === 'casa' ? serviciosDeCasa(S, casa) : null;
  switch (id) {
    case 'empleo': { const so = society(S); return clase === 'u' && so.un / Math.max(1, so.P) > .04; }
    case 'comida': return precioAlimento(S) >= 1.3 || !!S.hungry;
    case 'escuela': { const s = serv(); return S.stage >= 1 && !!s && !s.escuela; }
    case 'hospital': { const s = serv(); return S.stage >= 1 && !!s && !s.hospital; }
    case 'agua': return S.stage >= 1 ? S.pop > waterCap(S, counts(S)) - 3 : counts(S).acueducto === 0 && S.year >= 6;
    case 'camino': return casa >= 0 && aislada(S, casa);
    case 'inseguridad': return inseguridad(S) >= 50;
    case 'violencia': return S.violenciaUlt !== undefined && S.year - S.violenciaUlt <= 1;
    case 'impuestos': { const k = clase === 'c' ? 'c' : clase === 'e' ? 'e' : 'a'; return (S.tx[k] || 0) >= 25; }
  }
  return false;
}
const ORDEN = ['violencia', 'comida', 'empleo', 'agua', 'hospital', 'escuela', 'camino', 'inseguridad', 'impuestos'];
export function problemasDe(S, p) { return vocesActivas(S) ? ORDEN.filter(id => problemaActivo(S, id, p.casa, p.clase)) : []; }
// Lo que dice: su preocupación principal (con una de sus frases), lo que agradece y de qué se acuerda.
export function vozDe(S, p) {
  if (!vocesActivas(S)) return null;
  const V = K(), L = problemasDe(S, p), k = Math.floor((p.semilla * 7 + S.year * .31) * 3) % 3;
  const preocupa = L.length ? { id: L[0], frase: V.problemas[L[0]].frases[k % V.problemas[L[0]].frases.length], tarea: V.problemas[L[0]].tarea } : null;
  const buenos = Object.keys(V.agradece).filter(id => !problemaActivo(S, id, p.casa, p.clase) && (id !== 'empleo' || p.trabajo !== null) && (id !== 'agua' || counts(S).acueducto > 0) && (id !== 'escuela' && id !== 'hospital' ? true : S.stage >= 1 && coberturaActiva(S)));
  const agradece = buenos.length ? V.agradece[buenos[Math.floor(p.semilla * buenos.length) % buenos.length]] : null;
  const R = recuerdos(S), recuerdo = R.length ? V.recuerdo.replace('{recuerdo}', R[Math.floor(p.semilla * Math.min(3, R.length))].recuerdo) : null;
  return { preocupa, agradece, recuerdo };
}

// ---------- Tomar nota: una promesa por año ----------
export function puedeTomarNota(S) { return vocesActivas(S) && (S.notaAnio ?? -1) !== S.year; }
export function tomarNota(S, p) {
  const v = vozDe(S, p); if (!v || !v.preocupa || !puedeTomarNota(S)) return null;
  S.notas = [...(S.notas || []), { nombre: p.nombre, oficio: p.oficio, casa: p.casa, clase: p.clase, id: v.preocupa.id, tarea: v.preocupa.tarea, anio: S.year }];
  S.notaAnio = S.year;
  return K().nota.hecha.replace('{nombre}', p.nombre);
}
export function notasPendientes(S) {
  const N = K() && K().nota; if (!N) return [];
  return (S.notas || []).map(n => ({ ...n, texto: N.pendiente.replace('{nombre}', n.nombre).replace('{oficio}', n.oficio).replace('{tarea}', n.tarea).replace('{anios}', Math.max(0, n.anio + N.plazo - S.year)) }));
}
// Cierre del año: las promesas cumplidas se agradecen y las vencidas se notan. Devuelve las noticias.
export function notasDelAnio(S) {
  if (!vocesActivas(S) || !(S.notas || []).length) return [];
  const N = K().nota, news = [], quedan = [];
  for (const n of S.notas) {
    const k = n.clase === 'c' ? 'c' : n.clase === 'e' ? 'e' : 'a';
    if (!problemaActivo(S, n.id, n.casa, n.clase)) { S.sat[k] = clamp(S.sat[k] + N.premio, 0, 100); news.push('📝 ' + N.cumplida.replace('{nombre}', n.nombre).replace('{clase}', CLASE[n.clase])); }
    else if (S.year - n.anio >= N.plazo) { S.tr = clamp(S.tr - N.castigo, 0, 100); news.push('📝 ' + N.vencida.replace('{plazo}', N.plazo).replace('{nombre}', n.nombre)); }
    else quedan.push(n);
  }
  S.notas = quedan;
  for (const t of news) S.log.unshift({ y: S.year, t });
  return news;
}
