// Pendientes (pedido de Juan, 6 de octubre): las «misiones del momento» en una sola lista. Junta lo que espera una
// decisión del jugador (misiones de los personajes, café sin renovar, asentamientos, muertos sin sepultura, ruinas,
// fábricas paradas, agua, comida, leyes por abrir, tratados en riesgo, volcán, guerra…) y dice adónde ir.
// Cada pendiente: { id, icono, texto, nivel (0 misión, 1 urgente, 2 importante, 3 sugerencia), ir, fija }. Las
// misiones (pedido de Juan, 6 de octubre) van primero: la meta de la etapa, la guía y los encargos de los personajes.
// La meta y la guía son fijas: siempre se ven en la lista, pero no encienden el contador. ir: { hoja } | { casilla } |
// { mundo } | { tarjeta }. Lógica pura: la interfaz decide cómo mostrarlo.
import { C } from './contenido.js';
import { counts } from './reglas.js';
import { climaActivo } from './clima.js';
import { finance } from './hacienda.js';
import { waterCap, energy, society } from './sociedad.js';
import { presentes, misionDe } from './figuras.js';
import { ciclosActivos, costoRenovar } from './ciclos.js';
import { avisoSepultura } from './huellas.js';
import { nivelObra } from './desgaste.js';
import { industriaActiva, insumo, productoDe, datosProducto, nombreInsumo } from './industria.js';
import { civismoActivo, todasLasLeyes, puedeAbrir, estadoCivismo } from './civismo.js';
import { lawSlots } from './leyes.js';
import { listaMovimientos } from './movimientos.js';
import { exteriorActivo, datosLugar } from './exterior.js';
import { nivelVolcan, volcan } from './desastres.js';
import { nombreBarrio, barrioDe } from './barrios.js';
import { reqEtapa, aniosPolis } from './reglas.js';
import { faltaFundar } from './estado.js';
import { estadoPlaza } from './plaza.js';

export function pendientes(S) {
  if (!climaActivo(S) || S.over) return [];
  const L = [], c = counts(S), add = (id, icono, texto, nivel, ir, fija = false) => L.push({ id, icono, texto, nivel, ir, fija });
  const F = finance(S);
  // Misiones: la meta de la etapa (o la fundación) y el paso de la guía.
  const ff = faltaFundar(S), nx = C.STAGES[S.stage + 1], plural = (n, a, b) => `${n} ${n === 1 ? a : b}`;
  if (ff) add('meta', '🏛️', ff.plaza ? `Funda tu aldea: primero la plaza de fundación, luego ${plural(ff.casas, 'casa', 'casas')} y ${plural(ff.fincas, 'finca', 'fincas')}.` : `Funda tu aldea: faltan ${plural(ff.casas, 'casa', 'casas')} y ${plural(ff.fincas, 'finca', 'fincas')}.`, 0, { hoja: 'construir' }, true);
  else if (!S.ganado) add('meta', '🏛️', nx ? `Meta: ${nx.n} (${reqEtapa(S, S.stage + 1)}).` : `Meta: sostener la Polis ${aniosPolis(S)} años (vas en ${S.polisYears || 0}).`, 0, { caminos: true }, true);
  if (!ff && S.guide && C.GUIDE[S.gstep]) add('guia', '🧭', `Guía ${S.gstep + 1}/${C.GUIDE.length}: ${C.GUIDE[S.gstep].t}`, 0, { hoja: 'construir' }, true);
  // Lo urgente: comida, agua, oro.
  if (F.fprod - F.cons < 0 && S.food < 40) add('comida', '🌾', `Falta comida: se producen ${F.fprod} y se comen ${F.cons}. Construye fincas.`, 1, { hoja: 'construir' });
  if (S.stage >= 1 && S.pop > waterCap(S, c) - 5) add('agua', '💧', `El agua alcanza para ${waterCap(S, c)} personas y hay ${S.pop}. Construye un acueducto junto al río.`, 1, { hoja: 'construir' });
  if (S.gold < 0 || F.net < -15) add('oro', '💰', `Las cuentas están en rojo (${Math.round(F.net)} de oro al año). Revisa impuestos y gastos.`, 1, { hoja: 'hacienda', seccion: 'h-cuentas' });
  if (S.guerra && S.guerra.activa) add('guerra', '⚔️', 'Estás en guerra: refuerza la defensa o busca la paz.', 1, { hoja: 'sociedad', seccion: 'so-vecinos' });
  const V = desastresOk(S) ? nivelVolcan(S) : 0;
  if (V >= 2 && !volcan(S).plan) add('volcan', '🌋', 'El Nevado está en alerta y no hay plan de evacuación.', 1, { hoja: 'hacienda', seccion: 'h-riesgo' });
  // Trabajadores (fase 17): sin gente que las trabaje, las obras rinden menos.
  if (C.TRABAJO) { const so = society(S), T = C.TRABAJO.textos, pct = Math.round(so.ocup * 100); if (so.ocup < .9 && so.jc + so.ja > 0) add('trabajo', '🧑‍🌾', (so.ocup < C.TRABAJO.minimo ? T.sinGente : T.faltan).replace('{puestos}', so.jc + so.ja).replace('{gente}', so.P - so.el).replace('{pct}', pct).replace('{min}', Math.round(C.TRABAJO.minimo * 100)), so.ocup < C.TRABAJO.minimo ? 1 : 2, { hoja: 'construir' }); }
  // La plaza por niveles (fase 17): lo que pide el siguiente nivel, y cuándo se puede mejorar.
  const PZ = estadoPlaza(S);
  if (PZ && PZ.proximo) {
    const T = C.PLAZA.textos, pr = PZ.proximo, etapa = C.STAGES[pr.nivel] ? C.STAGES[pr.nivel].n : '';
    if (pr.cumple) add('plaza', '⛲', T.puede.replace('{nombre}', pr.nombre).replace('{costo}', pr.costo).replace('{etapa}', etapa), 2, { plaza: true });
    else if (S.pop >= pr.habitantes * .6) add('plaza', '⛲', T.faltan.replace('{nombre}', pr.nombre).replace('{lista}', pr.filas.filter(f => !f.ok).map(f => f.texto).join(', ')), 3, { plaza: true });
  }
  // Misiones de los personajes.
  for (const id of presentes(S)) { const m = misionDe(S, id); if (m) add('mision-' + id, C.FIG.figuras[id].icono || '🎯', `${C.FIG.figuras[id].nombre}: ${(m.texto || m.titulo || 'tiene una misión').replace(/\.$/, '')}${m.limite ? ` (hasta el año ${m.limite})` : ''}.`, 0, { hoja: 'sociedad', seccion: 'so-figuras' }); }
  // Lo que se ve en el mapa.
  const sep = avisoSepultura(S); if (sep) add('sepultura', '🪦', sep, 2, { hoja: 'construir' });
  for (const a of S.asent || []) add('asent-' + a.i, '🏚️', `Asentamiento informal en ${nombreBarrio(barrioDe(S, a.i))}: legalizar, ignorar o desalojar.`, 2, { casilla: a.i });
  const ruina = S.map.findIndex(x => x.b && x.ru); if (ruina >= 0) add('ruinas', '🏚️', `${S.map.filter(x => x.b && x.ru).length} obras en ruinas: reconstrúyelas desde su ficha.`, 2, { casilla: ruina });
  if (S.desgaste) { const ag = S.map.findIndex(x => x.b && !x.ru && x.u && nivelObra(x) >= 2); if (ag >= 0) add('grietas', '🧱', `${S.map.filter(x => x.b && !x.ru && x.u && nivelObra(x) >= 2).length} obras agrietadas o abandonadas: repáralas.`, 2, { casilla: ag }); }
  // Café y roya.
  if (ciclosActivos(S) && c.cafetal && S.ciclo && !S.ciclo.resistente && S.year >= C.CICLOS.roya.desde - 5) add('cafe', '☕', `Renueva los cafetales contra la roya (${costoRenovar(S)} de oro).`, S.ciclo.roya ? 1 : 3, { hoja: 'hacienda', seccion: 'h-ciclos' });
  // Industria.
  if (industriaActiva(S)) {
    if (S.stage >= 1 && c.taller > energy(S, c)) add('energia', '⚡', `Hay ${c.taller} fábricas y energía para ${energy(S, c)}: construye molinos.`, 2, { hoja: 'construir' });
    const vistos = new Set();
    S.map.forEach((x, i) => { if (x.b !== 'taller' || x.ob) return; const pr = productoDe(x); if (vistos.has(pr) || !datosProducto(pr).insumo) return; vistos.add(pr); if (insumo(S, pr).f < 1) add('insumo-' + pr, '🏭', `${datosProducto(pr).nombre}: le falta materia prima (${nombreInsumo(pr)}).`, 2, { casilla: i }); });
  }
  // Leyes.
  if (civismoActivo(S)) { const ab = todasLasLeyes(S).filter(l => l.nueva && !puedeAbrir(S, l.id)); if (ab.length) add('civismo', '📜', `Puedes desbloquear ${ab.length === 1 ? `la ley de ${ab[0].n.toLowerCase()}` : `${ab.length} leyes`} con ${Math.floor(estadoCivismo(S).p)} puntos de civismo.`, 3, { hoja: 'leyes' }); }
  const vig = Object.keys(S.laws || {}).length; if (vig < lawSlots(S) && S.stage >= 1) add('cupo', '⚖️', `Tienes ${lawSlots(S) - vig} ${lawSlots(S) - vig === 1 ? 'cupo libre' : 'cupos libres'} para promulgar leyes.`, 3, { hoja: 'leyes' });
  // Movimientos sociales y vecinos.
  for (const m of listaMovimientos(S)) if (m.f >= 70) add('mov-' + m.id, m.icono || '✊', `${m.nombre} está movilizado (${m.f}): escúchalo o responde.`, 2, { hoja: 'sociedad', seccion: 'so-mov' });
  if (S.vecinos) for (const [id, v] of Object.entries(S.vecinos)) if (v.rel <= C.VECINOS.hostil) add('vecino-' + id, '🛡️', `${C.VECINOS.vecinos[id].nombre} está hostil (${Math.round(v.rel)}): una visita o un tratado pueden evitar la guerra.`, 2, { hoja: 'sociedad', seccion: 'so-vecinos' });
  if (exteriorActivo(S) && S.ext) for (const [id, E] of Object.entries(S.ext.p)) if (E.trato && E.rel < C.EXT.romper + 10) add('ext-' + id, '🌎', `El tratado con ${datosLugar(id).nombre} está por romperse (relación ${Math.round(E.rel)}).`, 2, { mundo: id });
  // Promesas.
  for (const p of S.promises || []) add('promesa-' + p.k + p.dl, '🤝', `Prometiste ${C.B[p.k].a} antes del año ${p.dl}.`, p.dl - S.year <= 2 ? 1 : 2, { hoja: 'construir' });
  return L.sort((a, b) => a.nivel - b.nivel);
}
const desastresOk = S => !!C.DESASTRES;
