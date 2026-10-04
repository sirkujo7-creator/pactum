// Contenido del juego (edificios, dilemas, leyes...). Se lee de src/data en español
// y se traduce a la forma interna compacta que usa la lógica (la misma de la versión 9).

export const C = {
  B: {}, STAGES: [], EV: [], LATER: {}, DIFFS: {}, GUIDE: [], REG: {}, CYCLE: [],
  LAWS: [], ACH: [], ADV: {}, PH: {}, PROFILE: {}, FXL: {}, PET: null, cargado: false
};

// Nombres de los efectos en los archivos de datos → claves internas.
export const EFECTOS = {
  oro: 't', alimento: 'f', habitantes: 'p', animo: 'h', igualdad: 'e', confianza: 'c', ambiente: 'a',
  deuda: 'd', campesinos: 'sc', artesanos: 'sa', elite: 'se', inflacion: 'i', impuestoElite: 'txe', tierra: 'ti'
};
export const ARCHIVOS = ['edificios', 'etapas', 'dilemas', 'consecuencias', 'dificultades', 'guia',
  'regimenes', 'leyes', 'logros', 'personajes', 'filosofias', 'textos', 'pobladores', 'clima', 'desgaste', 'obras', 'cobertura', 'economia', 'indicadores', 'grupos', 'ejercito', 'fuerza', 'movimientos', 'acta', 'sucesos', 'figuras', 'marcas', 'desastres', 'conflicto', 'vecinos', 'victorias', 'barrios', 'cultura', 'memoria', 'epocas', 'tecnologia', 'megaproyectos', 'rio', 'ritmo', 'historia', 'ciclos', 'amenazas', 'calles', 'cine', 'guerra', 'cultivos', 'biomas', 'avances', 'industria', 'civismo', 'rasgos', 'familias'];

function efectos(obj, donde) {
  const fx = {};
  for (const [k, v] of Object.entries(obj || {})) {
    if (!EFECTOS[k]) throw new Error(`Efecto desconocido "${k}" en ${donde}`);
    fx[EFECTOS[k]] = v;
  }
  return fx;
}
const sinVacios = o => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined));

function opcion(o, donde) {
  return sinVacios({
    l: o.texto, fx: efectos(o.efectos, donde), f: o.filosofia || null, why: o.porque,
    later: o.despues ? (o.despues.probabilidad === undefined ? [o.despues.anios, o.despues.id] : [o.despues.anios, o.despues.id, o.despues.probabilidad]) : undefined,
    vista: o.vista, promesa: o.promesa, ex: o.aQuien, fuerza: o.fuerza, huella: o.huella,
    riesgo: o.riesgo ? { p: o.riesgo.probabilidad, t: o.riesgo.texto, fx: efectos(o.riesgo.efectos, `${donde} (riesgo)`) } : undefined
  });
}

// Recibe un objeto { edificios, etapas, dilemas, ... } con el contenido de cada archivo JSON.
export function usarContenido(d) {
  C.B = Object.fromEntries(Object.entries(d.edificios).map(([k, b]) => [k, sinVacios({
    e: b.icono, n: b.nombre, a: b.articulo, cost: b.costo, up: b.mantenimiento, st: b.etapa, ok: b.terrenos,
    hmin: b.alturaMinima, river: b.juntoAlRio, jc: b.empleosCampesinos, ja: b.empleosArtesanos, fee: b.tasas,
    water: b.agua, energy: b.energia, d: b.descripcion, anios: b.aniosDeObra, es: b.especial, cul: b.cultura
  })]));
  C.STAGES = d.etapas.map(s => sinVacios({ n: s.nombre, req: s.requisito, lesson: s.leccion }));
  C.EV = d.dilemas.map(e => sinVacios({
    id: e.id, st: e.etapa, e: e.icono, title: e.titulo, text: e.texto, cond: e.condicion, bueno: e.tipo === 'bueno' || undefined,
    opts: e.opciones.map((o, i) => opcion(o, `dilema ${e.id}, opción ${i + 1}`))
  }));
  C.LATER = Object.fromEntries(Object.entries(d.consecuencias).map(([k, l]) => [k, sinVacios({
    e: l.icono, title: l.titulo, text: l.texto, fx: efectos(l.efectos, `consecuencia ${k}`), why: l.porque, vista: l.vista, bueno: l.tipo === 'bueno' || undefined
  })]));
  C.DIFFS = Object.fromEntries(Object.entries(d.dificultades).map(([k, x]) => [k, {
    n: x.nombre, d: x.descripcion, gold: x.oroInicial, good: x.multiplicadorBueno, bad: x.multiplicadorMalo, badSR: x.multiplicadorMaloSinRachas, rachaB: x.rachaParaBueno, probB: x.probBueno, sat: x.animoBase,
    polis: x.aniosPolis, elec: x.confianzaElecciones, evp: x.probabilidadDilema, exp: x.exigenciaAnual, reward: x.recompensaGuia
  }]));
  C.GUIDE = d.guia.map(g => ({ t: g.texto, cond: g.condicion }));
  C.CYCLE = d.regimenes.ciclo;
  C.REG = Object.fromEntries(Object.entries(d.regimenes.formas).map(([k, r]) => [k, {
    n: r.nombre, t: r.cargo, sede: r.sede, rect: r.recta, cor: r.seCorrompeEn, cyc: r.revolucionHacia, col: r.color, d: r.descripcion, m: r.modificadores, m3: r.ajustesFase3, v: r.ventaja
  }]));
  C.LAWS = d.leyes.map(l => sinVacios({ id: l.id, n: l.nombre, d: l.descripcion, st: l.etapa, no: l.prohibidaEn }));
  C.ACH = d.logros.map(a => ({ id: a.id, n: a.nombre, d: a.descripcion }));
  C.ADV = Object.fromEntries(Object.entries(d.personajes).map(([k, a]) => [k, {
    n: a.nombre, r: a.rol, k: EFECTOS[a.efecto], sat: a.clase, pro: a.aFavor, con: a.enContra, mood: a.animo
  }]));
  C.PH = Object.fromEntries(Object.entries(d.filosofias).map(([k, p]) => [k, { n: p.nombre, a: p.autor }]));
  C.PROFILE = Object.fromEntries(Object.entries(d.filosofias).map(([k, p]) => [k, p.perfil]));
  C.FXL = Object.fromEntries(Object.entries(d.textos.efectos).map(([k, v]) => [EFECTOS[k], v]));
  const p = d.textos.peticion;
  C.PET = { e: p.icono, title: p.titulo, text: p.texto, ks: p.edificios, plazo: p.plazo, prob: p.probabilidad,
    opts: p.opciones.map((o, i) => opcion(o, `petición, opción ${i + 1}`)) };
  // Revisión: toda consecuencia anunciada debe existir y toda filosofía debe ser conocida.
  for (const e of [...C.EV, C.PET]) for (const o of e.opts) {
    if (o.later && !C.LATER[o.later[1]]) throw new Error(`La consecuencia "${o.later[1]}" no existe en consecuencias.json`);
    if (o.f && !C.PH[o.f]) throw new Error(`Filosofía desconocida "${o.f}" en "${e.title}"`);
  }
  C.POB = d.pobladores;
  C.CLIMA = d.clima;
  C.DESGASTE = d.desgaste;
  C.OBRAS = d.obras;
  C.COB = d.cobertura;
  C.ECO = d.economia;
  C.IND = d.indicadores;
  C.GRUPOS = d.grupos;
  C.EJERCITO = d.ejercito;
  C.FUERZA = d.fuerza;
  C.ACTA = d.acta;
  C.MARCAS = d.marcas;
  C.DESASTRES = d.desastres;
  C.CONF = d.conflicto;
  C.VECINOS = d.vecinos;
  C.VICTORIAS = d.victorias;
  C.BARRIOS = d.barrios;
  C.CULTURA = d.cultura;
  C.MEMORIA = d.memoria;
  C.EPOCAS = d.epocas;
  C.TEC = d.tecnologia;
  C.MEGA = d.megaproyectos;
  C.RIO = d.rio;
  C.RITMO = d.ritmo;
  C.HIST = d.historia;
  C.CICLOS = d.ciclos;
  C.AMENAZAS = d.amenazas;
  C.CALLES = d.calles;
  C.CINE = d.cine;
  C.GUERRA = d.guerra;
  C.CULTIVOS = d.cultivos;
  C.BIOMAS = d.biomas;
  C.AVANCES = d.avances;
  C.INDUSTRIA = d.industria;
  C.CIV = d.civismo;
  C.RASGOS = d.rasgos;
  C.FAMILIAS = d.familias;
  C.LEYES_NUEVAS = d.civismo ? d.civismo.leyes.map(l => ({ ...l, n: l.nombre, d: l.pro, st: l.etapa, nueva: true })) : [];
  C.FIG = d.figuras;
  C.FIG_FX = d.figuras ? Object.fromEntries(Object.entries(d.figuras.figuras).map(([k, f]) => [k, f.misiones.map((m, i) => efectos(m.premio, `misión ${i + 1} de ${k}`))])) : {};
  C.SUCESOS = d.sucesos && { ...d.sucesos, sucesos: Object.fromEntries(Object.entries(d.sucesos.sucesos).map(([k, q]) => [k, { ...q, fx: efectos(q.efectos, `suceso ${k}`) }])) };
  C.MOV = d.movimientos && { ...d.movimientos, movimientos: Object.fromEntries(Object.entries(d.movimientos.movimientos).map(([k, m]) => [k, {
    ...m, ops: Object.fromEntries(Object.entries(m.opciones).map(([a, o]) => [a, opcion(o, `movimiento ${k}, ${a}`)])), costo: efectos(m.movilizado.costoIgnorar, `movimiento ${k}`)
  }])) };
  C.cargado = true;
  return C;
}
