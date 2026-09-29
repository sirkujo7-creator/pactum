// Vida de los edificios (fase 1): cada obra se gasta con los años según el mantenimiento que se pague
// (control de 0% a 100% en Hacienda). Estados: en buen estado, gastada, agrietada y abandonada.
// La marca x.u (0 a 100) es el desgaste de la obra. Solo actúa en el terreno en acuarela, desde 25 habitantes.
import { azar, clamp } from './azar.js';
import { C } from './contenido.js';
import { cost, cap } from './reglas.js';
import { climaActivo } from './clima.js';

const K = () => C.DESGASTE;

// ¿Ya se gastan las obras? Se abre una vez al llegar a 25 habitantes y queda abierto.
export function desgasteAbierto(S) { return climaActivo(S) && !!S.desgaste; }
export function mantenimiento(S) { return desgasteAbierto(S) ? (S.mant ?? 100) : 100; }

// Índice del estado (0 buen estado, 1 gastada, 2 agrietada, 3 abandonada) y sus datos.
export function nivelObra(x) {
  const E = K().estados, u = x.u || 0;
  let n = 0;
  E.forEach((e, k) => { if (u >= e.desde) n = k; });
  return n;
}
export function estadoObra(x) { return K().estados[nivelObra(x)]; }

// Lo que rinde una obra (tasas, cosecha): 1, o menos si está agrietada; 0 si está abandonada.
export function rindeObra(S, x) {
  if (!climaActivo(S) || !x.u) return 1;
  const n = nivelObra(x);
  return n >= 3 ? 0 : n === 2 ? K().rindeAgrietada : 1;
}

// Ánimo que se pierde por vivir entre obras agrietadas o abandonadas.
export function animoPorDesgaste(S) {
  if (!desgasteAbierto(S)) return 0;
  let p = 0;
  for (const x of S.map) { if (!x.b || !x.u) continue; const n = nivelObra(x); if (n === 2) p += K().animoPorAgrietada; else if (n === 3) p += K().animoPorAbandonada; }
  return Math.min(K().animoMaximo, p);
}

// Reparar: devuelve la obra a buen estado. Cuesta según lo gastada que esté.
export function costoReparar(S, i) {
  const x = S.map[i];
  if (!x.b || !x.u || nivelObra(x) < 1) return 0;
  return Math.max(1, Math.round(cost(S, x.b) * x.u / 100 * K().costoReparar));
}
export function reparar(S, i) {
  const g = costoReparar(S, i);
  if (!g) return 'No necesita reparación.';
  if (S.gold < g) return `Te faltan ${g - Math.floor(S.gold)} de oro.`;
  S.gold -= g; S.map[i].u = 0;
  return true;
}

// Desgaste del año. Devuelve las noticias.
export function desgasteDelAnio(S) {
  if (!climaActivo(S)) return [];
  const T = K().textos, news = [];
  if (!S.desgaste) {
    if (S.pop < K().desde.habitantes) return [];
    S.desgaste = true; if (S.mant === undefined) S.mant = 100;
    news.push(T.abre);
    return news;
  }
  const m = clamp((S.mant ?? 100) / 100, 0, 1);
  const paso = K().desgasteBase + K().desgasteSinMantenimiento * (1 - m) - K().reparaConMantenimiento * m;
  let agr = 0, aba = 0;
  for (const x of S.map) {
    if (!x.b || x.ob) continue;
    const antes = nivelObra(x);
    // Un contratista de buena reputación deja la obra con reserva de vida (desgaste negativo).
    x.u = clamp(Math.round(((x.u || 0) + paso * (.7 + azar() * .6)) * 10) / 10, Math.min(0, x.u || 0), 100);
    if (!x.u) delete x.u;
    const ahora = nivelObra(x);
    if (ahora > antes) { if (ahora === 2) agr++; if (ahora === 3) aba++; }
  }
  if (agr) news.push(T.agrietadas.replace('{n}', agr));
  if (aba) { news.push(T.abandonadas.replace('{n}', aba)); if (S.pop > cap(S)) S.pop = cap(S); }
  return news;
}
