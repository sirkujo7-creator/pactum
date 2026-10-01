// Leyes: cupos por etapa, costo y restricciones según el régimen.
import { clamp } from './azar.js';
import { C } from './contenido.js';
import { RG, RM, hasLaw } from './reglas.js';
import { climaActivo } from './clima.js';
import { contradecir } from './acta.js';

export function lawSlots(S) { return 1 + S.stage; }
export function lawCostNow(S) { return Math.round(40 * S.price); }

// Devuelve el motivo por el que no se puede promulgar o derogar, o '' si se puede.
export function lawBlock(S, l) {
  if (l.st > S.stage) return `Se abre en ${C.STAGES[l.st].n}.`;
  if (l.no && l.no.includes(S.reg)) return `No es posible en ${RG(S).n}.`;
  if (!hasLaw(S, l.id)) {
    if (Object.keys(S.laws).length >= lawSlots(S)) return `Solo caben ${lawSlots(S)} leyes en esta etapa. Deroga una primero.`;
    if (S.gold < lawCostNow(S)) return `Te faltan ${lawCostNow(S) - Math.floor(S.gold)} de oro.`;
    if (S.reg === 'aristocracia' && ['jornada', 'ambiente', 'arancel'].includes(l.id) && S.sat.e < 45) return 'El Senado la rechaza: la élite está descontenta.';
    if (RM(S, 'elect', false) && S.tr < 40) return `El Congreso no la aprueba: necesitas ${climaActivo(S) ? 'legitimidad' : 'confianza'} de 40.`;
  }
  return '';
}

export function toggleLaw(S, id) {
  const l = C.LAWS.find(x => x.id === id), bl = lawBlock(S, l);
  if (bl) return bl;
  if (hasLaw(S, id)) {
    delete S.laws[id]; S.tr = clamp(S.tr - 2, 0, 100);
    S.log.unshift({ y: S.year, t: `Derogaste la ley: ${l.n}.` });
    return true;
  }
  S.gold -= lawCostNow(S);
  if (S.reg !== 'monarquia' && S.reg !== 'tirania') S.tr = clamp(S.tr - 2, 0, 100);
  S.laws[id] = S.year;
  S.log.unshift({ y: S.year, t: `Promulgaste la ley: ${l.n}.` });
  if (id === 'censura') contradecir(S, 'censura');
  return true;
}
