// Guía de los primeros años, logros y perfil ético.
import { C } from './contenido.js';
import { D, counts, cumple } from './reglas.js';
import { totDebt, rating } from './hacienda.js';

export function checkGuide(S) {
  if (!S.guide || S.gstep >= C.GUIDE.length) return null;
  if (cumple(S, C.GUIDE[S.gstep].cond, counts(S))) {
    const r = D(S).reward;
    S.gold += r; S.gstep++;
    return r ? `Meta cumplida: +${r} de oro.` : 'Meta cumplida.';
  }
  return null;
}

export function topPhil(S) { return Object.keys(S.phil).sort((a, b) => S.phil[b] - S.phil[a])[0]; }

// Condición de cada logro (los textos están en src/data/logros.json).
export const LOGRO_OK = {
  pueblo: S => S.stage >= 1,
  ciudad: S => S.stage >= 2,
  polis: S => S.stage >= 3,
  sindeuda: S => S.stage >= 3 && totDebt(S) === 0,
  igualdad: S => S.stage >= 2 && S.eq >= 80,
  verde: S => S.stage >= 2 && S.env >= 80,
  aaa: S => S.stage >= 2 && rating(S).l === 'AAA',
  palabra: S => S.kept >= 3,
  sinhambre: S => S.year >= 30 && !S.hungry,
  kant: (S, e) => e && e.win && topPhil(S) === 'deon',
  rawls: (S, e) => e && e.win && topPhil(S) === 'contr',
  maquiavelo: (S, e) => e && e.win && topPhil(S) === 'real',
  fenix: (S, e) => e && e.win && S.defaults > 0,
  dificil: (S, e) => e && e.win && S.diff === 'dificil'
};

// obtenidos: {id: año} de logros ya ganados. Marca los nuevos y los devuelve.
export function logrosNuevos(S, obtenidos, end) {
  const nu = C.ACH.filter(a => !obtenidos[a.id] && LOGRO_OK[a.id] && LOGRO_OK[a.id](S, end));
  nu.forEach(a => obtenidos[a.id] = S.year);
  return nu;
}
