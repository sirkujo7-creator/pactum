// Fin de año: cuentas, población, inflación, ánimo, igualdad, confianza, ambiente,
// promesas, etapas, elecciones y rumbo del gobierno (corrupción, reforma y revolución).
import { azar, clamp } from './azar.js';
import { C } from './contenido.js';
import { counts, D, RG, RM, hasLaw, ETAPA_OK } from './reglas.js';
import { finance, totDebt } from './hacienda.js';
import { society, waterCap, satTargets, calcHap, envTarget } from './sociedad.js';
import { drawEvent } from './dilemas.js';
import { climaActivo, climaDelAnioSiguiente, atenderEmergencia, marcarCrisis, interesFondo } from './clima.js';
import { sueloDelAnio } from './suelo.js';
import { desgasteDelAnio } from './desgaste.js';
import { avanzarObras } from './construccion.js';
import { economiaDelAnio } from './economia.js';
import { ejercitoDelAnio } from './ejercito.js';
import { movimientosDelAnio, presionMovimientos } from './movimientos.js';
import { actaDelAnio, coherencia } from './acta.js';
import { efectoFig, figurasDelAnio } from './figuras.js';
import { sucesosDelAnio, inseguridad } from './sucesos.js';
import { nearRiver } from './mundo.js';
import { marcasDelAnio } from './marcas.js';

// Avanza un año. Devuelve {stageUp, end: {win, title, text} | null}.
export function advance(S) {
  const REG = C.REG, STAGES = C.STAGES, B = C.B;
  S.undo = [];
  const c = counts(S), F = finance(S), so = F.so, p0 = S.pop, news = [];
  S.debt = Math.max(0, S.debt + F.interest - F.pay);
  if (F.mat) news.push(`Venció un bono: pagaste ${F.mat} de capital.`);
  S.bonds = S.bonds.filter(b => b.due > S.year);
  // Fase 2: las cuotas de las obras se pagan una por una, solo si alcanza el oro.
  S.gold += F.net + F.obras; S.rev = F.rev;
  news.push(...avanzarObras(S).news);
  if (climaActivo(S)) S.fondo = (S.fondo || 0) + F.fondo + interesFondo(S);
  S.food += F.fprod - F.cons;
  let hunger = false;
  if (S.stage >= 1 && S.pop > waterCap(S, c)) news.push(`Falta agua: ${S.pop} habitantes y acueductos para ${waterCap(S, c)}.`);
  if (S.food < 0) { hunger = true; S.hungry = true; S.pop -= Math.ceil(S.pop * .12); S.food = 0; news.push('Faltó alimento: hubo hambre y se perdieron vidas.'); }
  const cp = c.casa * 10;
  const wcap = waterCap(S, c);
  if (!hunger && S.pop < cp && S.pop < wcap) S.pop = Math.min(cp, S.pop + Math.max(1, Math.round(S.pop * .18 * S.hap / 60)));
  if (S.pop > cp) S.pop = cp;
  if (S.hap < 25) { S.pop -= Math.ceil(S.pop * .06); news.push('El descontento empuja a familias a irse.'); }
  S.pop = Math.max(0, S.pop);

  // Inflación.
  const tI = .02 + RM(S, 'infl') + (hasLaw(S, 'bancoCentral') ? -.015 : 0) + (hasLaw(S, 'arancel') ? .005 : 0) + S.issue / Math.max(50, F.rev) * .25 + (S.gold < 0 ? .03 : 0) + (hunger ? .04 : 0) - c.banco * .01 + S.shock;
  S.infl = clamp(S.infl * .4 + tI * .6, -.02, .6); S.shock *= .5; S.issue = 0; S.price *= 1 + S.infl;
  if (S.infl > .08) news.push(`La inflación llegó a ${Math.round(S.infl * 100)}%.`);

  // Ánimo por clase.
  const TG = satTargets(S, c, hunger), sc = TG.sc, expc = TG.expc, ip = S.infl * 100;
  S.sat.c = clamp(S.sat.c + (TG.c - S.sat.c) * .35, 0, 100);
  S.sat.a = clamp(S.sat.a + (TG.a - S.sat.a) * .35, 0, 100);
  S.sat.e = clamp(S.sat.e + (TG.e - S.sat.e) * .35, 0, 100);
  const so2 = society(S);
  S.hap = calcHap(S, so2);
  if (S.sat.e < 25) { S.eliteMood = Math.max(.4, S.eliteMood - .3); news.push('Fuga de capitales: parte de la élite se va con su dinero.'); }
  else if (S.sat.e > 45) S.eliteMood = Math.min(1, S.eliteMood + .1);

  // Igualdad.
  const tot = (F.post.c + F.post.a + F.post.e + F.post.u) || 1, es = F.post.e / tot, ps = so.el / Math.max(1, so.P);
  const tE = 85 - (es - ps) * 120 + sc * 10 + c.universidad * 5 + RM(S, 'eq') + (hasLaw(S, 'educacion') ? 8 : 0) + (hasLaw(S, 'censura') ? -3 : 0);
  S.eq = clamp(S.eq + (tE - S.eq) * .3, 0, 100);

  // Confianza.
  const tT = 50 + RM(S, 'tr') + (hasLaw(S, 'censura') ? 6 : 0) + (hasLaw(S, 'prensa') ? -3 : 0) + (S.hap - 50) * .4 + c.agora * 10 + (S.gold < 0 ? -10 : 0) - Math.max(0, ip - 3) * .8 - presionMovimientos(S) + coherencia(S) + efectoFig(S, 'legitimidad');
  S.tr = clamp(S.tr + (tT - S.tr) * .3, 0, 100);
  if (S.sat.c < 25 || S.sat.a < 25) {
    if (RM(S, 'silence', false)) { S.corr = clamp(S.corr + 4, 0, 100); news.push('La guardia disolvió protestas. Nadie habla, pero el descontento crece.'); }
    else { S.tr = clamp(S.tr - 5, 0, 100); news.push(S.sat.c < 25 ? 'Protestas campesinas en los caminos.' : 'Protestas de artesanos en la plaza.'); }
  }

  // Ambiente.
  const tA = envTarget(S, c) + efectoFig(S, 'ambiente');
  S.env = clamp(S.env + (tA - S.env) * .3, 0, 100);

  // Fase 1: emergencia del año de El Niño o La Niña (la paga el fondo; lo que falte, el tesoro).
  if (climaActivo(S) && S.clima.fenomeno) news.push(...atenderEmergencia(S, S.map.filter((x, i) => x.b && nearRiver(S, i)).length));
  // Fase 1: el suelo vive (bosque que vuelve o se quema, erosión y derrumbes).
  news.push(...sueloDelAnio(S));
  // Fase 1: las obras se gastan según el mantenimiento que se paga.
  news.push(...desgasteDelAnio(S));

  // Déficit y cesación de pagos.
  S.deficit = F.net < 0 ? S.deficit + 1 : 0;
  if (F.net < 0) news.push(`El presupuesto cerró con déficit de ${-F.net} de oro.`);
  if (S.gold < 0 && S.deficit >= 2) { S.tr = clamp(S.tr - 8, 0, 100); news.push('Años en rojo: el pueblo duda de tu manejo.'); }
  if (S.gold < -150) {
    S.defaults++;
    if (S.defaults >= 2) { S.log.unshift({ y: S.year, t: news.join(' ') }); return { end: { win: false, title: 'Bancarrota', text: 'Segunda cesación de pagos. Nadie vuelve a prestarle al territorio.' } }; }
    S.debt = Math.round(S.debt / 2); S.bonds.forEach(b => b.amt = Math.round(b.amt / 2)); S.gold = 0; S.tr = clamp(S.tr - 20, 0, 100);
    marcarCrisis(S);
    S.sat.c -= 10; S.sat.a -= 10; S.sat.e -= 15;
    news.push('Cesación de pagos: reestructuraste la deuda a la mitad. Tu calificación se desploma.');
  }

  // Promesas.
  S.promises = S.promises.filter(pr => {
    if (counts(S)[pr.k] > pr.base) { S.kept++; S.corr = clamp(S.corr - 5, 0, 100); S.tr = clamp(S.tr + 8, 0, 100); S.sat.c += 4; S.sat.a += 4; news.push(`Cumpliste tu promesa: ${B[pr.k].a}. El pueblo lo celebra.`); return false; }
    if (S.year >= pr.dl) { S.corr = clamp(S.corr + 8, 0, 100); S.tr = clamp(S.tr - 15, 0, 100); news.push(`Promesa incumplida: no construiste ${B[pr.k].a}.`); return false; }
    return true;
  });
  const d = S.pop - p0;
  if (d > 0) news.push(`Llegaron ${d} habitantes.`); else if (d < 0) news.push(`La población bajó en ${-d}.`);

  // Etapas y elecciones.
  let stageUp = false;
  const ok = ETAPA_OK[S.stage + 1];
  if (ok && ok(S, counts(S))) { S.stage++; stageUp = true; news.push(`El territorio ahora es ${STAGES[S.stage].n}.`); }
  if (RM(S, 'elect', false) && S.stage >= 1 && S.stage < 3 && S.year % 4 === 0) {
    const th = 34;
    if (S.tr < th) { S.log.unshift({ y: S.year, t: news.join(' ') }); return { end: { win: false, title: 'Perdiste las elecciones', text: `El pueblo votó por otro proyecto: la ${climaActivo(S) ? 'legitimidad' : 'confianza'} estaba en ${Math.round(S.tr)} y necesitabas ${th}.` } }; }
    news.push('Hubo elecciones y el pueblo renovó tu mandato.'); S.tr = clamp(S.tr + 3, 0, 100);
  }
  if (S.stage === 3) {
    S.polisYears++;
    if (!stageUp && S.polisYears % 4 === 0 && !RM(S, 'elect', false) && S.tr < D(S).elec) {
      S.polisYears = 0; S.corr = clamp(S.corr + 20, 0, 100); S.tr = clamp(S.tr - 5, 0, 100);
      news.push(`El pueblo niega su apoyo al ${RG(S).t.toLowerCase()}: sin elecciones, la legitimidad se mide en la calle. La cuenta de años como Polis vuelve a cero.`);
    }
    if (!stageUp && S.polisYears % 4 === 0 && RM(S, 'elect', false)) {
      if (S.tr < D(S).elec) { S.log.unshift({ y: S.year, t: news.join(' ') }); return { end: { win: false, title: 'Perdiste las elecciones', text: climaActivo(S) ? 'El pueblo votó por otro proyecto. La legitimidad no alcanzó.' : 'El pueblo votó por otro proyecto. La confianza no alcanzó.' } }; }
      S.tr = clamp(S.tr + 5, 0, 100); news.push('Ganaste las elecciones: el pueblo renueva tu mandato.');
    }
  }

  // Rumbo del gobierno: corrupción, reforma y revolución (Aristóteles y Polibio).
  const minSat = Math.min(S.sat.c, S.sat.a, S.sat.e);
  S.corr = clamp(S.corr + RM(S, 'drift') + (hasLaw(S, 'censura') ? 1.5 : 0) - (hasLaw(S, 'prensa') ? 1.5 : 0), 0, 100);
  if (minSat < 25) S.corr = clamp(S.corr + 3, 0, 100);
  if (minSat > 50 && S.tr > 55) S.corr = clamp(S.corr - 2, 0, 100);
  S.regChange = null;
  if (RG(S).rect && S.corr >= 70) {
    const from = S.reg; S.reg = RG(S).cor; S.corr = 45; S.regChange = { type: 'cor', from, to: S.reg };
    news.push(`El gobierno se corrompió: ${REG[from].n} se volvió ${REG[S.reg].n}.`);
  } else if (!RG(S).rect) {
    const nx = RG(S).cyc;
    if (S.corr <= 20) {
      const from = S.reg; S.reg = Object.keys(REG).find(k => REG[k].cor === from && REG[k].rect) || nx; S.corr = 35; S.regChange = { type: 'ref', from, to: S.reg };
      news.push(`Reformaste el gobierno: ${REG[from].n} vuelve a ser ${REG[S.reg].n}.`);
    } else if ((S.tr < (S.reg === 'tirania' ? 40 : 30) || minSat < 22) && azar() < (S.reg === 'tirania' ? .6 : .45)) {
      const from = S.reg; S.reg = nx; S.corr = 25; S.tr = clamp(S.tr + 15, 0, 100); S.gold = Math.round(S.gold * .6); S.pop = Math.round(S.pop * .92);
      if (S.stage === 3) S.polisYears = 0;
      ['c', 'a', 'e'].forEach(k => S.sat[k] = clamp(S.sat[k] + 8, 0, 100));
      S.regChange = { type: 'rev', from, to: S.reg };
      marcarCrisis(S);
      news.push(`¡Revolución! Cae ${REG[from].n} y nace ${REG[S.reg].n}.`);
    }
  }
  // Fase 3: el Ejército (ánimo, ruido de sables y golpe de Estado).
  news.push(...ejercitoDelAnio(S));
  news.push(...movimientosDelAnio(S));
  news.push(...actaDelAnio(S));
  news.push(...sucesosDelAnio(S));
  news.push(...figurasDelAnio(S, inseguridad(S)));
  marcasDelAnio(S);
  if (S.reg === 'monarquia' && S.year % 15 === 0) {
    if (azar() < .5) { S.corr = clamp(S.corr - 10, 0, 100); S.tr = clamp(S.tr + 5, 0, 100); news.push('Sucesión en la corona: el heredero es prudente y querido.'); }
    else { S.corr = clamp(S.corr + 15, 0, 100); S.tr = clamp(S.tr - 5, 0, 100); news.push('Sucesión en la corona: el heredero es caprichoso y la corte murmura.'); }
  }
  if (RM(S, 'eliteCap', 0) && S.tx.e > RM(S, 'eliteCap', 0)) S.tx.e = RM(S, 'eliteCap', 0);
  S.tx0 = { ...S.tx };
  S.expc = Math.round(expc);
  S.hist.push({ y: S.year, pop: S.pop, gold: Math.round(S.gold), debt: Math.round(totDebt(S)), eq: Math.round(S.eq), hap: Math.round(S.hap), tr: Math.round(S.tr), env: Math.round(S.env), infl: +(S.infl * 100).toFixed(1) });
  S.log.unshift({ y: S.year, t: news.join(' ') || 'Un año tranquilo.' });
  if (S.log.length > 60) S.log.pop();

  // Fin de la partida.
  if (S.tr <= 5) return { end: { win: false, title: 'Revuelta popular', text: climaActivo(S) ? 'El gobierno perdió toda legitimidad y el pueblo tomó la plaza.' : 'El pueblo perdió toda confianza y tomó la plaza.' } };
  if (S.env <= 5) return { end: { win: false, title: 'Colapso ecológico', text: 'El río y la tierra ya no sostienen la vida.' } };
  if (S.pop <= 3) return { end: { win: false, title: 'Territorio abandonado', text: 'Las últimas familias se marcharon.' } };
  // Claridad (decisión de Juan): tras ganar se puede seguir gobernando; la victoria no se repite.
  if (S.polisYears >= D(S).polis && !S.ganado) return { end: { win: true, title: 'Tu Polis perdura', text: `Sostuviste ${D(S).polis} años un gobierno del pueblo y para el pueblo.` } };
  if (S.vis && S.vis.y <= S.year) S.vis = null;
  // Fase 1: lluvias del año que empieza, El Niño o La Niña y sus pronósticos (solo en el terreno en acuarela).
  // Fase 2: precio del alimento y del café, y ciclo de auge y recesión.
  const eco = economiaDelAnio(S, F);
  if (eco.length) S.log[0].t += ' ' + eco.join(' ');
  const pron = climaDelAnioSiguiente(S);
  if (pron.length) S.log[0].t += ' ' + pron.join(' ');
  S.year++;
  if (!stageUp) S.pend = drawEvent(S);
  return { stageUp, end: null };
}
