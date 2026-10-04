// Sociedad: clases, empleo, agua, energía, ánimo y ambiente.
import { C } from './contenido.js';
import { clamp } from './azar.js';
import { counts, D, RM, hasLaw } from './reglas.js';
import { countT } from './mundo.js';
import { factorAgua, climaActivo } from './clima.js';
import { animoPorDesgaste } from './desgaste.js';
import { empleosDeObra } from './construccion.js';
import { cobertura, coberturaActiva } from './cobertura.js';
import { animoEconomia } from './economia.js';
import { obrasActivas } from './construccion.js';
import { culturaTotal, culturaActiva } from './cultura.js';
import { efectoMega } from './megaproyectos.js';
import { fincasActivas, empleoCampo, ambienteCampo } from './fincas.js';
import { factorAguaClima } from './biomas.js';
import { industriaActiva, empleoIndustria, ambienteIndustria } from './industria.js';
import { efectoLeyes } from './civismo.js';

export function energy(S, c) { return (S.stage >= 1 ? 1 : 0) + c.molino * 3 + efectoMega(S, 'energia'); } // fase 6: la represa
export function poweredT(S, c) { return S.stage >= 1 ? Math.min(c.taller, energy(S, c)) : c.taller; }
// En El Niño (fase 1) el río baja y los acueductos entregan menos.
export function waterCap(S, c) { if (S.stage < 1) return 9999; const w = 40 + c.acueducto * 70; return climaActivo(S) ? Math.round(w * factorAgua(S) * factorAguaClima(S)) : w; } // fase 10: deshielo y páramo

// Reparte la población en élite, campesinos, artesanos y desempleados.
export function society(S) {
  const c = counts(S), P = S.pop;
  let el = Math.round((2 + c.mercado * .5 + poweredT(S, c) * 1.5 + c.mina * 2 + c.banco * 3 + c.puerto * 1.5 + c.cafetal * .3) * S.eliteMood);
  el = clamp(el, P >= 5 ? 1 : 0, Math.floor(P * .2));
  const W = P - el, jc = fincasActivas(S) ? empleoCampo(S) : c.cultivo * 7 + c.cafetal * 6; // fase 10: el empleo depende del cultivo
  let ja = 0;
  Object.keys(C.B).forEach(k => { if (k !== 'taller') ja += (C.B[k].ja || 0) * c[k]; });
  ja += industriaActiva(S) ? empleoIndustria(S) : poweredT(S, c) * 9; // fase 11: el empleo depende del producto
  ja += empleosDeObra(S); // fase 2: las obras en construcción emplean gente (Keynes)
  let camp, art, un;
  if (W >= jc + ja) { camp = jc; art = ja; un = W - jc - ja; }
  else { const t = jc + ja; camp = t ? Math.round(W * jc / t) : 0; art = W - camp; un = 0; }
  return { el, camp, art, un, jc, ja, P };
}

// Aporte del bosque al ambiente. En la v9 (20×20) cada casilla de bosque daba 0,6: 2,4 por cada 1% del territorio.
// En el terreno en acuarela el bosque cubre algo menos (12% frente a 15%), así que cada 1% vale 2,9.
export const AMBIENTE_POR_BOSQUE = 2.9;
function aporteBosque(S) {
  if (S.mundo !== 'acuarela') return countT(S, 'bosque') * .6;
  return countT(S, 'bosque') / S.map.length * 100 * AMBIENTE_POR_BOSQUE;
}
export { aporteBosque };
// Partes de la meta del ambiente (las mismas cuentas de envTarget), para explicarla.
export function partesAmbiente(S, c) {
  return [['Punto de partida', 62], ['Ley de protección ambiental', hasLaw(S, 'ambiente') ? 12 : 0], ['Parques', Math.min(20, c.parque * 4)], ['Bosques', aporteBosque(S)],
    industriaActiva(S) ? ['Fábricas (según su producto)', ambienteIndustria(S)] : ['Talleres', -c.taller * 7], ['Minas', -c.mina * 12], fincasActivas(S) ? ['Fincas (según su cultivo)', ambienteCampo(S)] : ['Cultivos', -c.cultivo * 1.5], ['Casas', -c.casa * .4], ['Leyes del árbol de civismo', efectoLeyes(S, 'ambiente')]];
}
export function envTarget(S, c) {
  return (hasLaw(S, 'ambiente') ? 12 : 0) + 62 + Math.min(20, c.parque * 4) + aporteBosque(S) + (industriaActiva(S) ? ambienteIndustria(S) : -c.taller * 7) - c.mina * 12 + (fincasActivas(S) ? ambienteCampo(S) : -c.cultivo * 1.5) - c.casa * .4 + efectoLeyes(S, 'ambiente');
}

// Ánimo al que tiende cada clase este año.
export function satTargets(S, c, hunger) {
  const P = Math.max(1, S.pop), so = society(S), ur = so.un / Math.max(1, so.P), ip = S.infl * 100;
  // Fase 2: además de los cupos, cuenta la distancia: solo se atiende a las casas dentro del radio.
  const cob = cobertura(S), sinMercado = coberturaActiva(S) ? C.COB.animoSinMercado * (1 - cob.mercado) : 0;
  const sc = S.stage >= 1 ? Math.min(1, c.escuela * 50 / P, cob.escuela) : .8, hc = S.stage >= 1 ? Math.min(1, c.hospital * 60 / P, cob.hospital) : .8;
  const cov = (sc + hc) * 8;
  // Fase 5: en el terreno en acuarela, la cultura, el deporte y las fiestas también calman la exigencia.
  const expc = S.stage >= 1 ? Math.max(0, Math.min(20, S.year * D(S).exp) - (c.universidad * 5 + c.agora * 3 + Math.min(6, c.parque * 1.5)) - culturaTotal(S)) + efectoLeyes(S, 'exigencia') : 0; // fase 12: el sufragio exige más
  const ds = D(S).sat;
  const wc = waterCap(S, c), thirst = S.pop > wc ? Math.min(25, (S.pop - wc) / Math.max(1, wc) * 60) : 0;
  const L = k => hasLaw(S, k) ? 1 : 0, nl = { c: efectoLeyes(S, 'animo.c'), a: efectoLeyes(S, 'animo.a'), e: efectoLeyes(S, 'animo.e') }, obras = animoPorDesgaste(S), eco = animoEconomia(S, obrasActivas(S));
  // partes(): las mismas cuentas separadas por causa, para explicarle al jugador por qué sube o baja cada clase.
  const partes = () => ({
    c: [['Régimen de gobierno', RM(S, 'sc')], ['Punto de partida', 48], ['Impuesto a campesinos', -(S.tx.c - 10) * 2], [hunger ? 'Hambre' : 'Comida suficiente', hunger ? -20 : 5],
      ['Escuelas y hospitales', cov], ['Desempleo', -ur * 30], ['Inflación', -ip * 1.5], ['Igualdad', (S.eq - 50) * .2], ['Ambiente dañado', S.env < 35 ? -8 : 0],
      [culturaActiva(S) ? C.CULTURA.etiqueta : 'Exigencia de calidad de vida', -expc], ['Dificultad', ds], ['Leyes', L('educacion') * 3 + L('subsidio') * 10], ['Falta de agua', -thirst],
      ['Obras deterioradas', -obras], ['Mercado lejos', -sinMercado], ['Precios y ciclo económico', eco.c], ['Leyes del árbol de civismo', nl.c]],
    a: [['Régimen de gobierno', RM(S, 'sa')], ['Punto de partida', 48], ['Impuesto a artesanos', -(S.tx.a - 12) * 1.8], ['Escuelas y hospitales', cov], ['Parques', Math.min(8, c.parque * 2)],
      ['Desempleo', -ur * 30], ['Inflación', -ip * 1.5], ['Igualdad', (S.eq - 50) * .1], ['Ambiente dañado', S.env < 35 ? -8 : 0], [culturaActiva(S) ? C.CULTURA.etiqueta : 'Exigencia de calidad de vida', -expc],
      ['Dificultad', ds], ['Leyes', L('educacion') * 3 + L('jornada') * 8 + L('arancel') * 3], ['Falta de agua', -thirst], ['Obras deterioradas', -obras],
      ['Mercado lejos', -sinMercado], ['Precios y ciclo económico', eco.a], ['Leyes del árbol de civismo', nl.a]],
    e: [['Punto de partida', 58], ['Impuesto a la élite', -(S.tx.e - 15) * 1.4], ['Bancos', c.banco * 4], ['Igualdad (a la élite le molesta)', -(S.eq - 50) * .1], ['Inflación', -ip],
      ['Dificultad', ds], ['Régimen de gobierno', RM(S, 'se')], ['Leyes que la afectan', -(L('jornada') * 6 + L('ambiente') * 4 + L('arancel') * 3)], ['Leyes del árbol de civismo', nl.e]]
  });
  return {
    sc, expc, thirst, partes,
    c: RM(S, 'sc') + 48 + 0 - (S.tx.c - 10) * 2 + (hunger ? -20 : 5) + cov - ur * 30 - ip * 1.5 + (S.eq - 50) * .2 + (S.env < 35 ? -8 : 0) - expc + ds + (L('educacion') * 3 + L('subsidio') * 10 - thirst) - obras - sinMercado + eco.c + nl.c,
    a: RM(S, 'sa') + 48 - (S.tx.a - 12) * 1.8 + cov + Math.min(8, c.parque * 2) - ur * 30 - ip * 1.5 + (S.eq - 50) * .1 + (S.env < 35 ? -8 : 0) - expc + ds + (L('educacion') * 3 + L('jornada') * 8 + L('arancel') * 3 - thirst) - obras - sinMercado + eco.a + nl.a,
    e: 58 - (S.tx.e - 15) * 1.4 + c.banco * 4 - (S.eq - 50) * .1 - ip + ds + RM(S, 'se') - (L('jornada') * 6 + L('ambiente') * 4 + L('arancel') * 3) + nl.e
  };
}

export function calcHap(S, so) {
  so = so || society(S);
  const P = Math.max(1, S.pop);
  return clamp((so.camp * S.sat.c + (so.art + so.un) * S.sat.a + so.el * S.sat.e) / P - so.un / P * 15, 0, 100);
}
