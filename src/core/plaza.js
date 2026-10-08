// La plaza por niveles (fase 17, paso 2; idea de Juan, al estilo Age of Empires). La plaza central crece en cuatro
// niveles (fundación, mayor, cívica y de la polis). Cada nivel pide ciertos edificios y habitantes, cuesta oro y fija
// un tope de las obras que más pesan (fincas, mercados, fábricas, minas, puertos, banco, cuartel, universidad,
// estadio). Pasar de etapa exige tener la plaza en el nivel de la etapa. Las casas, escuelas, hospitales y demás
// servicios no tienen tope. Solo en el terreno en acuarela; las partidas guardadas empiezan con el nivel de su etapa.
import { C } from './contenido.js';
import { climaActivo } from './clima.js';

export const plazaActiva = S => !!S && climaActivo(S) && !!C.PLAZA && !!S.plaza;
export const nivelPlaza = S => (plazaActiva(S) ? S.plaza.n : 99);
export const datosNivelPlaza = n => C.PLAZA.niveles[Math.max(0, Math.min(C.PLAZA.niveles.length - 1, n))];
const cuantos = (S, k) => S.map.reduce((n, x) => n + (x.b === k ? 1 : 0), 0);

// Tope de una clase de obra con la plaza actual (Infinity si no tiene).
export function topeDe(S, k) {
  if (!plazaActiva(S)) return Infinity;
  const t = datosNivelPlaza(S.plaza.n).topes[k];
  return t === undefined ? Infinity : t;
}
// Motivo por el que ya no se puede construir más de esta clase ('' si se puede).
export function motivoTope(S, k) {
  const t = topeDe(S, k);
  if (t === Infinity) return '';
  const m = cuantos(S, k), T = C.PLAZA.textos;
  if (m < t) return '';
  const nombre = datosNivelPlaza(S.plaza.n).nombre.toLowerCase();
  return t === 0 ? T.sinPermiso.replace('{plaza}', nombre) : T.tope.replace('{plaza}', nombre).replace('{n}', t).replace('{m}', m);
}
// Estado de la plaza para la pantalla: nivel, topes con lo que ya hay, y lo que pide el siguiente nivel.
export function estadoPlaza(S) {
  if (!plazaActiva(S)) return null;
  const n = S.plaza.n, N = datosNivelPlaza(n), sig = n + 1 < C.PLAZA.niveles.length ? C.PLAZA.niveles[n + 1] : null;
  const topes = Object.entries(N.topes).filter(([, t]) => t > 0).map(([k, t]) => ({ k, tope: t, tienes: cuantos(S, k) }));
  let proximo = null;
  if (sig) {
    const filas = [{ texto: `${sig.requisitos.habitantes} habitantes`, ok: S.pop >= sig.requisitos.habitantes }];
    for (const [k, c] of Object.entries(sig.requisitos.edificios)) filas.push({ texto: c > 1 ? `${c} × ${C.B[k].n.toLowerCase()}` : `1 ${C.B[k].n.toLowerCase()}`, ok: cuantos(S, k) >= c });
    const costo = Math.round(sig.costo * S.price);
    proximo = { nivel: n + 1, habitantes: sig.requisitos.habitantes, nombre: sig.nombre, texto: sig.texto, costo, filas, cumple: filas.every(f => f.ok), topes: Object.entries(sig.topes).filter(([, t]) => t > 0).map(([k, t]) => ({ k, tope: t })) };
  }
  return { nivel: n, nombre: N.nombre, texto: N.texto, topes, proximo };
}
// '' si se puede mejorar la plaza ahora; si no, el motivo.
export function motivoMejora(S) {
  const E = estadoPlaza(S);
  if (!E) return 'No disponible.';
  if (!E.proximo) return C.PLAZA.textos.maximo;
  if (!E.proximo.cumple) return C.PLAZA.textos.faltan.replace('{nombre}', E.proximo.nombre).replace('{lista}', E.proximo.filas.filter(f => !f.ok).map(f => f.texto).join(', '));
  if (S.gold < E.proximo.costo) return C.PLAZA.textos.noOro.replace('{n}', E.proximo.costo - Math.floor(S.gold));
  return '';
}
export function mejorarPlaza(S) {
  const r = motivoMejora(S);
  if (r) return r;
  const E = estadoPlaza(S);
  S.gold -= E.proximo.costo; S.plaza.n++;
  S.log.unshift({ y: S.year, t: C.PLAZA.textos.mejorada.replace('{nombre}', E.proximo.nombre) });
  return true;
}
// Para subir de etapa hace falta la plaza en el nivel de esa etapa.
export function plazaOk(S, etapa) { return !plazaActiva(S) || S.plaza.n >= etapa; }
