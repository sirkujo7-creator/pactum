// Robots que juegan partidas completas con distintas estrategias (los mismos de la versión 9).
// pop = impuestos casi nulos, rich = cargar a los pobres, fair = impuestos equilibrados, debt = vivir de la deuda.
import {
  sinSepultura, exteriorActivo, costoExterior, puedeExterior, accionExterior, coberturaActiva, ordenarSitios, medirDesdeCentro, cobertura, obrasEnCurso, inseguridad, fondoSugerido, costoReparar, reparar, counts, finance, taxLimit, waterCap, energy, nearRiver, freeTiles, build, canBorrow, takeLoan, advance, choose, rnd, decidirInvento, costoLegalizar, decidirAsentamiento, costoAccion, accionVecino, hayGrupo, elegirEstrategia, nivelVolcan, puedePlan, comprarPlan, presentes, misionDe, cost, C, listaMovimientos, decidirBonanza, decidirCrisis, costoSubsidio, elegirPension, puedeRenovar, costoRenovar, renovarCafetales, puedeVigilancia, costoVigilancia, comprarVigilancia, costoDialogo, dialogar, callesActivas, conectada, trazarCalle, costoCalle, construirCalle, esquina, centroPueblo, lado, guerraActiva, estadoGuerra, opcionesTratado, costoTratado, firmarTratado, puedeResponder, responder, puedeRecuperar, recuperarTierras, fincasActivas, sembrar, aptitud, listaCultivos, datosCultivo, precioCultivo, canasta, cultivoDe, puedeSembrar, costoSiembra,
  industriaActiva, productoDe, mejorProducto, producir, puedeProducir, insumoSi, datosProducto, nivelDe, puedeModernizar, modernizar, costoNivel, poweredT, fuerzaMov, elegirSalario, salarioActual, rasgoPendiente, opcionesRasgo, elegirRasgo,
  plazaActiva, estadoPlaza, motivoMejora, mejorarPlaza, civismoActivo, vecindadActiva, obrasCerca, puedeAbrir, abrirLey, lawBlock, toggleLaw, lawCostNow, datosLey, hasLaw
} from '../src/core/index.js';

export const ESTRATEGIAS = ['pop', 'rich', 'fair', 'debt'];
// Mantenimiento de las obras en % (se puede cambiar con MANT=0..100).
const MANT = typeof process !== 'undefined' && process.env.MANT !== undefined ? +process.env.MANT : 100;
// Porcentaje que la estrategia equilibrada aporta al fondo de emergencias (se puede cambiar con FONDO=0).
const FONDO = typeof process !== 'undefined' && process.env.FONDO !== undefined ? +process.env.FONDO : 5;

// op.sinPrep: la estrategia equilibrada no se prepara (sin fondo, construye en cualquier parte, no repara).
export function botYear(S, strat, eth, op = {}) {
  const prep = strat === 'fair' && !op.sinPrep;
  const want = strat === 'pop' ? { c: 5, a: 6, e: 12 } : strat === 'rich' ? { c: 18, a: 20, e: 10 } : strat === 'fair' ? { c: 8, a: 10, e: 25 } : null;
  // Fase 7: en el terreno en acuarela, la estrategia equilibrada sube los impuestos poco a poco si hay déficit y le
  // falta oro, y los baja si le sobra (como haría un jugador sensato ante los costos que suben con cada época).
  if (prep && S.clima && S.year > 0) {
    const F = finance(S), a = S.ajusteImp || 0;
    S.ajusteImp = F.net < 0 && S.gold < 200 ? Math.min(12, a + 2) : F.net > 0 && S.gold > 400 ? Math.max(0, a - 2) : a;
    if (S.ajusteImp) { want.e += S.ajusteImp; want.a += Math.round(S.ajusteImp / 3); want.c += Math.round(S.ajusteImp / 4); }
  }
  if (want) ['c', 'a', 'e'].forEach(k => S.tx[k] = taxLimit(S, k, want[k]));
  // Fase 1: la estrategia equilibrada ahorra en el fondo de emergencias desde Pueblo, hasta tener lo que costaría
  // una emergencia hoy (o mientras haya un fenómeno anunciado).
  if (plazaActiva(S) && !motivoMejora(S)) mejorarPlaza(S); // fase 17: mejoran la plaza en cuanto reúnen lo que pide
  if (S.clima) S.aporteFondo = prep && S.stage >= 1 && (S.fondo < fondoSugerido(S) * 1.2 || S.clima.pronostico) ? FONDO : 0;
  // Mantenimiento de las obras (MANT=0..100 para probar; por defecto 100%). La estrategia equilibrada repara lo agrietado.
  if (S.clima) { S.mant = MANT; if (prep) S.map.forEach((x, i) => { if (x.u >= 50) { const g = costoReparar(S, i); if (g && S.gold > g + 40) reparar(S, i); } }); }
  // Fase 4: relaciones con las polis vecinas: tratados si sobra oro, visitas si una relación se enfría.
  if (prep && S.vecinos) for (const id of Object.keys(S.vecinos)) { if (S.gold > costoAccion(S, 'tratado') + 120) accionVecino(S, id, 'tratado'); if (S.vecinos[id].rel < 42 && S.gold > costoAccion(S, 'visita') + 60) accionVecino(S, id, 'visita'); }
  // Fase 9: ante tropas en el borde, la estrategia equilibrada negocia (o pide mediación, o fortifica); firma la paz
  // justa si le alcanza y recupera las tierras ocupadas cuando puede. Nunca declara la guerra.
  if (S.vecinos && guerraActiva(S)) {
    const G = estadoGuerra(S);
    if (G.tratado) { const op = opcionesTratado(S), pref = prep ? ['justa', 'armisticio', 'rendicion'] : ['armisticio', 'rendicion', 'justa']; const o = pref.find(x => op.includes(x) && S.gold >= costoTratado(S, x)) || op.find(x => x !== 'resistir'); firmarTratado(S, o); }
    if (prep) for (const id of Object.keys(S.vecinos)) {
      const v = S.vecinos[id];
      if (v.tension >= 35) { for (const a of ['mediacion', 'negociar', 'preparar']) if (!puedeResponder(S, id, a) && S.gold > 80) { responder(S, id, a); break; } }
      if (!puedeRecuperar(S, id) && S.gold > 150) recuperarTierras(S, id);
    }
  }
  // Fase 5: asentamientos informales: legalizar si sobra oro; si no, esperar.
  if (prep && S.asent) for (const a of [...S.asent]) { if (S.gold > costoLegalizar(S, a.i) + 100) decidirAsentamiento(S, a.i, 'legalizar'); else if (a.nuevo) decidirAsentamiento(S, a.i, 'ignorar'); }
  // Fase 6: inventos: regulados si sobra oro; si no, libres.
  if (prep && S.tec && S.tec.pendiente) { const id = S.tec.pendiente; decidirInvento(S, id, S.gold > 200 ? 'regulada' : 'libre'); }
  // Fase 7: ciclos de la economía: ahorrar la bonanza, subsidiar la crisis si alcanza, pensiones mixtas y renovar los
  // cafetales cuando sobra el oro.
  if (prep && S.ciclo) {
    const Ci = S.ciclo;
    if (Ci.cafe && !Ci.cafe.decidido) Ci.cafe.tipo === 'bonanza' ? decidirBonanza(S, 'ahorrar') : decidirCrisis(S, S.gold > costoSubsidio(S) + 60 ? 'subsidiar' : 'no');
    if (Ci.pensionPend) elegirPension(S, 'mixto');
    if (S.year >= 25 && !puedeRenovar(S) && S.gold > costoRenovar(S) + 150) renovarCafetales(S);
    if (!puedeVigilancia(S) && S.gold > costoVigilancia(S) + 150) comprarVigilancia(S);
  }
  // Fase 9: la estrategia equilibrada abre calles desde el centro hasta la obra más cercana que aún no tiene una.
  if (prep && callesActivas(S) && S.year >= 4 && S.year % 3 === 0 && S.gold > 150) {
    const N = lado(S), c0 = centroPueblo(S);
    if (c0 >= 0) {
      const dc = i => Math.hypot(Math.floor(i / N) - Math.floor(c0 / N), i % N - c0 % N);
      const cand = S.map.map((x, i) => i).filter(i => i !== c0 && S.map[i].b && S.map[i].b !== 'cultivo' && !S.map[i].ob && !conectada(S, i)).sort((a, b) => dc(a) - dc(b));
      for (const i of cand.slice(0, 2)) {
        const ruta = trazarCalle(S, esquina(N, Math.floor(c0 / N), c0 % N), esquina(N, Math.floor(i / N), i % N));
        if (ruta && costoCalle(S, ruta).oro <= S.gold - 120) construirCalle(S, ruta);
      }
    }
  }
  // Fase 4: ante un grupo armado, la estrategia equilibrada invierte en las veredas si tiene oro; si no, dialoga.
  if (prep && hayGrupo(S)) elegirEstrategia(S, S.gold > 150 ? 'inversion' : 'dialogo');
  // Fase 4: la estrategia equilibrada prepara la evacuación cuando el volcán pasa a alerta naranja.
  if (prep && S.clima && nivelVolcan(S) >= 2 && !puedePlan(S)) comprarPlan(S);
  // Fase 4: la estrategia equilibrada atiende las misiones de obra de los personajes si le sobra el oro.
  if (prep && S.clima) for (const id of presentes(S)) {
    const m = misionDe(S, id);
    if (!m) continue;
    // Fase 10: el café ya no es un edificio: se construye una finca en la ladera y se siembra café.
    if (m.tipo === 'edificio' && m.edificio === 'cafetal' && fincasActivas(S)) {
      if (counts(S).cafetal < m.n && S.gold > cost(S, 'cultivo') + 150) { const t = freeTiles(S, 'cultivo').filter(i => aptitud(S, i, 'cafe') >= 1); if (t.length) { build(S, 'cultivo', t[0]); sembrar(S, t[0], 'cafe'); } }
      continue;
    }
    if (m.tipo === 'edificio' && counts(S)[m.edificio] < m.n && S.gold > cost(S, m.edificio) + 150 && C.B[m.edificio].st <= S.stage && !obrasEnCurso(S)[m.edificio]) { const t = ordenarSitios(S, m.edificio, freeTiles(S, m.edificio)); if (t.length) build(S, m.edificio, t[0]); }
  }
  // Fase 10: la estrategia equilibrada siembra cultivos de dinero cuando le sobra comida, repartiendo entre varios
  // (diversifica: castiga el cultivo que ya pesa mucho), y resiembra las fincas cuyo piso térmico cambió.
  if (prep && fincasActivas(S) && op.monocultivo !== false) robotCampo(S, op);
  // Fase 11: la estrategia equilibrada transforma lo que da el campo en sus fábricas.
  if (prep && industriaActiva(S) && op.industria !== false) robotIndustria(S);
  for (let n = 0; n < 8; n++) {
    // Fase 2: las obras en construcción cuentan como ya encargadas (no se empieza otra igual).
    const c2 = counts(S), F2 = finance(S), eo = obrasEnCurso(S);
    for (const k in eo) c2[k] += eo[k];
    let k = null;
    if (F2.fprod - F2.cons < 4 && S.food < 40) k = 'cultivo';
    // (los robots no persiguen los requisitos de la plaza: los cumplen al construir lo de siempre)
    else if (F2.so.un > 2 && F2.so.camp >= F2.so.jc && F2.fprod - F2.cons < 10) k = 'cultivo';
    else if (F2.so.un > 3) k = (S.stage >= 1 && strat !== 'fair' && c2.taller < 3) ? 'taller' : 'mercado';
    else if (S.stage >= 1 && S.pop > waterCap(S, c2) - 15) k = 'acueducto';
    else if (S.stage >= 1 && c2.taller > energy(S, c2)) k = 'molino';
    else if (S.clima && sinSepultura(S) > 0 && !eo.cementerio && S.gold > cost(S, 'cementerio') + 30) k = 'cementerio'; // huellas: los muertos piden sepultura
    else if (prep && S.clima && C.HUELLAS && C.HUELLAS.iglesia && !c2.iglesia && S.pop >= 30 && S.gold > cost(S, 'iglesia') + 40) k = 'iglesia'; // la iglesia frente a la plaza
    else if (S.pop >= c2.casa * 10 - 6) k = 'casa';
    else if (S.clima && F2.evadido >= 6 && S.gold > 60 && !eo.recaudo) k = 'recaudo'; // solo si la evasión cuesta más que la oficina
    else if (S.stage >= 2 && c2.agora < 1) k = 'agora';
    // Fase 4: policía donde la inseguridad sube y no hay cobertura.
    else if (prep && S.clima && inseguridad(S) >= 25 && !eo.policia && cobertura(S).policia < .7 && S.gold > 90) k = 'policia';
    else if (S.stage >= 1 && c2.hospital < 1) k = 'hospital';
    else if (S.stage >= 1 && c2.escuela * 50 < S.pop) k = 'escuela';
    else if (S.stage >= 1 && c2.hospital * 60 < S.pop) k = 'hospital';
    else if (S.clima && coberturaActiva(S) && !eo.escuela && cobertura(S).escuela < .75 && S.gold > 100) k = 'escuela';
    else if (S.clima && coberturaActiva(S) && !eo.hospital && cobertura(S).hospital < .75 && S.gold > 120) k = 'hospital';
    else if (S.clima && coberturaActiva(S) && cobertura(S).mercado < .6 && S.gold > 70) k = 'mercado';
    else if (F2.so.un > 2) k = (S.stage >= 1 && strat !== 'fair') ? 'taller' : 'mercado';
    else if (S.stage >= 2 && c2.agora < 1) k = 'agora';
    else if (S.env < 40 || (S.expc > 4 && c2.parque < 5)) k = 'parque';
    else if (S.stage >= 3 && S.expc > 4 && c2.universidad < 2 && S.gold > 300) k = 'universidad';
    else if (S.stage >= 3 && c2.universidad < 1) k = 'universidad';
    if (!k) break;
    // Fase 17: si ya reúnen lo que pide la plaza, ahorran para mejorarla (salvo comida y agua, que no esperan).
    if (prep && plazaActiva(S)) { const E = estadoPlaza(S); if (E && E.proximo && E.proximo.cumple && S.gold < E.proximo.costo + cost(S, k) && k !== 'cultivo' && k !== 'acueducto') break; }
    const pref = k === 'cultivo' ? (i => nearRiver(S, i)) : ['casa', 'mercado', 'escuela', 'hospital', 'policia', 'taller', 'agora', 'banco', 'universidad', 'parque'].includes(k) ? (i => !nearRiver(S, i)) : null;
    let t = freeTiles(S, k);
    if (pref) t = t.filter(pref).concat(t.filter(i => !pref(i)));
    // Fase 1: la estrategia equilibrada se prepara: no tala bosque ni construye en laderas erosionadas si hay otro sitio.
    if (prep && S.clima) { const riesgo = i => S.map[i].t === 'bosque' || S.map[i].er > 0 || S.map[i].dr > 0; t = t.filter(i => !riesgo(i)).concat(t.filter(riesgo)); }
    // Fase 2: con cobertura por distancia, todo se construye cerca del centro, y los servicios donde cubren más casas.
    if (S.clima && t.length) {
      const dc = medirDesdeCentro(S), cerca = t.filter(i => dc(i) <= 12);
      // Vecindad: los parques donde hay casas alrededor; fábricas y cuarteles lejos de las casas.
      const vec = !(prep && vecindadActiva(S)) ? () => 0 : k === 'parque' ? i => -obrasCerca(S, i, ['casa'], 1).length * 3 : k === 'taller' || k === 'cuartel' ? i => obrasCerca(S, i, ['casa'], 1).length * 6 : () => 0;
      t = ordenarSitios(S, k, cerca.length ? cerca : t, i => (pref && !pref(i) ? 3 : 0) + vec(i));
    }
    if (!t.length) break;
    build(S, k, t[0]);
  }
  if (strat === 'debt' && S.gold < 30 && canBorrow(S)) takeLoan(S);
  // Fase 3: la estrategia equilibrada abre diálogo con los movimientos movilizados si le sobra el oro.
  if (strat === 'fair' && !eth) for (const m of listaMovimientos(S)) if (m.f >= 70 && S.gold - costoDialogo(S, m.id) >= 80) dialogar(S, m.id);
  // Fase 12: la estrategia equilibrada desbloquea y promulga leyes del árbol de civismo.
  if (prep && civismoActivo(S) && op.civismo !== false) robotCivismo(S);
  if (prep && exteriorActivo(S)) robotExterior(S); // fase 15: embajadas, tratados y ligas
  // Fase 12: el rasgo de la época (al azar entre los tres).
  const ep = rasgoPendiente(S); if (ep) { const L = opcionesRasgo(ep); elegirRasgo(S, L[rnd(L.length)].id); }
  const r = advance(S);
  // Fase 3: la estrategia equilibrada escucha a los movimientos sociales si le alcanza el oro; si no, no responde.
  if (S.pend && S.pend.mov && strat === 'fair' && !eth) { const o = S.pend.opts; choose(S, S.gold + (o[0].fx.t || 0) >= 100 ? 0 : 1); }
  else if (S.pend) { const o = S.pend.opts; let k = eth ? o.findIndex(x => x.f === eth) : -1; if (k < 0) k = rnd(o.length); choose(S, k); }
  return r;
}

// Fase 10: puntaje de un cultivo de dinero en una casilla, con el peso que ya tiene en la canasta.
function puntajeRenta(S, i, cv, cuantas, total, mono) {
  const D = datosCultivo(cv);
  if (!D.renta || D.comida > 6) return 0;
  const a = aptitud(S, i, cv);
  if (a < .75) return 0;
  const peso = total ? cuantas[cv] / total : 0;
  return D.renta * a * precioCultivo(S, cv) * (mono ? 1 : 1 - Math.min(.8, peso * 1.2)) / (1 + D.madura * .08);
}
function mejorRenta(S, i, mono) {
  const c = canasta(S), dinero = listaCultivos().filter(k => datosCultivo(k).renta && datosCultivo(k).comida <= 6), total = dinero.reduce((t, k) => t + c[k], 0);
  let mejor = null, v0 = 0;
  for (const cv of dinero) { const v = puntajeRenta(S, i, cv, c, total, mono); if (v > v0) { v0 = v; mejor = cv; } }
  return mejor;
}
function robotCampo(S, op) {
  const mono = !!op.monocultivo, F = finance(S);
  // Una finca de dinero nueva si sobra comida, hay gente sin trabajo y oro.
  if (S.stage >= 1 && F.fprod - F.cons > 10 && F.so.un >= 8 && S.gold > cost(S, 'cultivo') + 110) { // sin quitarle gente a las fincas de comida
    const dc = medirDesdeCentro(S);
    let mejor = -1, cv0 = null, v0 = 0;
    for (const i of freeTiles(S, 'cultivo')) {
      if (dc(i) > 12 || S.map[i].t === 'bosque') continue;
      const cv = mono ? (aptitud(S, i, op.monocultivo) >= .75 ? op.monocultivo : null) : mejorRenta(S, i, false);
      if (!cv) continue;
      const v = datosCultivo(cv).renta * aptitud(S, i, cv) - dc(i) * .2;
      if (v > v0) { v0 = v; mejor = i; cv0 = cv; }
    }
    if (mejor >= 0) { build(S, 'cultivo', mejor); sembrar(S, mejor, cv0); }
  }
  // Cada 4 años: resembrar las fincas de dinero que perdieron su piso térmico (o cuyo cultivo se desplomó).
  if (S.year % 4 === 0) S.map.forEach((x, i) => {
    if (x.b !== 'cultivo' || x.ob) return;
    const cv = cultivoDe(x), D = datosCultivo(cv);
    if (!D.renta || D.comida > 6) return;
    const malo = aptitud(S, i, cv) < .5 || precioCultivo(S, cv) < .5;
    if (!malo) return;
    const nuevo = mono ? null : mejorRenta(S, i, false);
    if (nuevo && nuevo !== cv && !puedeSembrar(S, i, nuevo) && S.gold > costoSiembra(S, nuevo) + 120) sembrar(S, i, nuevo);
  });
}

// Fase 11: fábricas que transforman la cosecha. Una fábrica nueva cuando sobra materia prima, hay gente sin empleo y
// oro; las de artesanías pasan al producto que más deja; se modernizan con la electricidad (y se automatizan solo
// si no hay desempleo); salarios altos si el sindicato está muy fuerte y sobra el oro.
function robotIndustria(S) {
  if (S.stage < 1) return;
  const F = finance(S), c = counts(S), fab = S.map.map((x, i) => x.b === 'taller' && !x.ob ? i : -1).filter(i => i >= 0);
  // Cambiar de producto si deja más.
  for (const i of fab) {
    const pr = mejorProducto(S, i), ya = productoDe(S.map[i]);
    if (pr !== ya && insumoSi(S, i, pr) >= .66 && !puedeProducir(S, i, pr) && (ya === 'artesanias' || insumoSi(S, i, ya) < .34) && S.gold > 90) producir(S, i, pr);
  }
  // Una fábrica nueva si hay materia prima sin usar.
  if (F.so.un >= 6 && c.taller < 6 && S.gold > cost(S, 'taller') + 160 && !obrasEnCurso(S).taller) {
    const t = ordenarSitios(S, 'taller', freeTiles(S, 'taller').filter(i => !nearRiver(S, i)), i => vecindadActiva(S) ? obrasCerca(S, i, ['casa'], 1).length * 6 : 0); // lejos de las casas
    if (t.length) {
      const i = t[0], pr = mejorProducto(S, i);
      if (pr !== 'artesanias' && insumoSi(S, i, pr) >= .66) { build(S, 'taller', i); if (S.map[i].b === 'taller') S.map[i].pr = pr; } // el primer producto va incluido
    }
  }
  // Modernizar: con máquinas en cuanto se pueda; automatizar solo sin desempleo.
  for (const i of fab) {
    const n = nivelDe(S.map[i]) + 1;
    if (n === 2 && F.so.un > 2) continue;
    if (!puedeModernizar(S, i) && S.gold > costoNivel(S, n) + 180) modernizar(S, i);
  }
  // Salarios: altos si el sindicato aprieta y sobra el oro; si no, justos.
  const sind = fuerzaMov(S, 'sindicato');
  elegirSalario(S, sind >= 60 && S.gold > 250 ? 'alto' : 'justo');
}

// Fase 12: leyes del árbol de civismo en orden de preferencia (el acuerdo de paz primero si hay grupo armado).
function robotCivismo(S) {
  const orden = [...(hayGrupo(S) ? ['paz'] : []), 'sufragio', 'progresivo', 'descentralizacion', 'tutela', 'indigenas', 'laico', 'paz'];
  for (const id of orden) if (!puedeAbrir(S, id)) { abrirLey(S, id); break; }
  for (const id of orden) {
    if (hasLaw(S, id)) continue;
    if (!lawBlock(S, datosLey(id)) && S.gold > lawCostNow(S) + 150) { toggleLaw(S, id); break; }
  }
}

// Fase 15: la estrategia equilibrada cultiva relaciones con el mundo: una embajada al año al lugar más prometedor,
// tratados de comercio cuando la relación alcanza y ligas solo con gobiernos no autoritarios.
function robotExterior(S) {
  const X = S.ext && S.ext.p; if (!X) return;
  const ids = Object.keys(X).sort((a, b) => X[b].rel - X[a].rel);
  for (const id of ids) {
    if (!puedeExterior(S, id, 'comercio') && S.gold > costoExterior(S, 'comercio') + 60) { accionExterior(S, id, 'comercio'); return; }
    if (!puedeExterior(S, id, 'liga') && !C.EXT.autoritarios.includes(X[id].reg) && S.gold > costoExterior(S, 'liga') + 120) { accionExterior(S, id, 'liga'); return; }
  }
  const obj = ids.find(id => !X[id].trato && X[id].rel < 55) || ids.find(id => X[id].trato === 'comercio' && X[id].rel < 75 && !C.EXT.autoritarios.includes(X[id].reg));
  if (obj && !puedeExterior(S, obj, 'embajada') && S.gold > costoExterior(S, 'embajada') + 80) accionExterior(S, obj, 'embajada');
}
