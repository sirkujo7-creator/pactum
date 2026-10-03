// Robots que juegan partidas completas con distintas estrategias (los mismos de la versión 9).
// pop = impuestos casi nulos, rich = cargar a los pobres, fair = impuestos equilibrados, debt = vivir de la deuda.
import {
  coberturaActiva, ordenarSitios, medirDesdeCentro, cobertura, obrasEnCurso, inseguridad, fondoSugerido, costoReparar, reparar, counts, finance, taxLimit, waterCap, energy, nearRiver, freeTiles, build, canBorrow, takeLoan, advance, choose, rnd, decidirInvento, costoLegalizar, decidirAsentamiento, costoAccion, accionVecino, hayGrupo, elegirEstrategia, nivelVolcan, puedePlan, comprarPlan, presentes, misionDe, cost, C, listaMovimientos, costoDialogo, dialogar
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
  if (want) ['c', 'a', 'e'].forEach(k => S.tx[k] = taxLimit(S, k, want[k]));
  // Fase 1: la estrategia equilibrada ahorra en el fondo de emergencias desde Pueblo, hasta tener lo que costaría
  // una emergencia hoy (o mientras haya un fenómeno anunciado).
  if (S.clima) S.aporteFondo = prep && S.stage >= 1 && (S.fondo < fondoSugerido(S) * 1.2 || S.clima.pronostico) ? FONDO : 0;
  // Mantenimiento de las obras (MANT=0..100 para probar; por defecto 100%). La estrategia equilibrada repara lo agrietado.
  if (S.clima) { S.mant = MANT; if (prep) S.map.forEach((x, i) => { if (x.u >= 50) { const g = costoReparar(S, i); if (g && S.gold > g + 40) reparar(S, i); } }); }
  // Fase 4: relaciones con las polis vecinas: tratados si sobra oro, visitas si una relación se enfría.
  if (prep && S.vecinos) for (const id of Object.keys(S.vecinos)) { if (S.gold > costoAccion(S, 'tratado') + 120) accionVecino(S, id, 'tratado'); if (S.vecinos[id].rel < 42 && S.gold > costoAccion(S, 'visita') + 60) accionVecino(S, id, 'visita'); }
  // Fase 5: asentamientos informales: legalizar si sobra oro; si no, esperar.
  if (prep && S.asent) for (const a of [...S.asent]) { if (S.gold > costoLegalizar(S) + 100) decidirAsentamiento(S, a.i, 'legalizar'); else if (a.nuevo) decidirAsentamiento(S, a.i, 'ignorar'); }
  // Fase 6: inventos: regulados si sobra oro; si no, libres.
  if (prep && S.tec && S.tec.pendiente) { const id = S.tec.pendiente; decidirInvento(S, id, S.gold > 200 ? 'regulada' : 'libre'); }
  // Fase 4: ante un grupo armado, la estrategia equilibrada invierte en las veredas si tiene oro; si no, dialoga.
  if (prep && hayGrupo(S)) elegirEstrategia(S, S.gold > 150 ? 'inversion' : 'dialogo');
  // Fase 4: la estrategia equilibrada prepara la evacuación cuando el volcán pasa a alerta naranja.
  if (prep && S.clima && nivelVolcan(S) >= 2 && !puedePlan(S)) comprarPlan(S);
  // Fase 4: la estrategia equilibrada atiende las misiones de obra de los personajes si le sobra el oro.
  if (prep && S.clima) for (const id of presentes(S)) {
    const m = misionDe(S, id);
    if (!m) continue;
    if (m.tipo === 'edificio' && counts(S)[m.edificio] < m.n && S.gold > cost(S, m.edificio) + 150 && C.B[m.edificio].st <= S.stage && !obrasEnCurso(S)[m.edificio]) { const t = ordenarSitios(S, m.edificio, freeTiles(S, m.edificio)); if (t.length) build(S, m.edificio, t[0]); }
  }
  for (let n = 0; n < 8; n++) {
    // Fase 2: las obras en construcción cuentan como ya encargadas (no se empieza otra igual).
    const c2 = counts(S), F2 = finance(S), eo = obrasEnCurso(S);
    for (const k in eo) c2[k] += eo[k];
    let k = null;
    if (F2.fprod - F2.cons < 4 && S.food < 40) k = 'cultivo';
    else if (F2.so.un > 2 && F2.so.camp >= F2.so.jc && F2.fprod - F2.cons < 10) k = 'cultivo';
    else if (F2.so.un > 3) k = (S.stage >= 1 && strat !== 'fair' && c2.taller < 3) ? 'taller' : 'mercado';
    else if (S.stage >= 1 && S.pop > waterCap(S, c2) - 15) k = 'acueducto';
    else if (S.stage >= 1 && c2.taller > energy(S, c2)) k = 'molino';
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
    const pref = k === 'cultivo' ? (i => nearRiver(S, i)) : ['casa', 'mercado', 'escuela', 'hospital', 'policia', 'taller', 'agora', 'banco', 'universidad', 'parque'].includes(k) ? (i => !nearRiver(S, i)) : null;
    let t = freeTiles(S, k);
    if (pref) t = t.filter(pref).concat(t.filter(i => !pref(i)));
    // Fase 1: la estrategia equilibrada se prepara: no tala bosque ni construye en laderas erosionadas si hay otro sitio.
    if (prep && S.clima) { const riesgo = i => S.map[i].t === 'bosque' || S.map[i].er > 0 || S.map[i].dr > 0; t = t.filter(i => !riesgo(i)).concat(t.filter(riesgo)); }
    // Fase 2: con cobertura por distancia, todo se construye cerca del centro, y los servicios donde cubren más casas.
    if (S.clima && t.length) {
      const dc = medirDesdeCentro(S), cerca = t.filter(i => dc(i) <= 12);
      t = ordenarSitios(S, k, cerca.length ? cerca : t, i => (pref && !pref(i) ? 3 : 0));
    }
    if (!t.length) break;
    build(S, k, t[0]);
  }
  if (strat === 'debt' && S.gold < 30 && canBorrow(S)) takeLoan(S);
  // Fase 3: la estrategia equilibrada abre diálogo con los movimientos movilizados si le sobra el oro.
  if (strat === 'fair' && !eth) for (const m of listaMovimientos(S)) if (m.f >= 70 && S.gold - costoDialogo(S, m.id) >= 80) dialogar(S, m.id);
  const r = advance(S);
  // Fase 3: la estrategia equilibrada escucha a los movimientos sociales si le alcanza el oro; si no, no responde.
  if (S.pend && S.pend.mov && strat === 'fair' && !eth) { const o = S.pend.opts; choose(S, S.gold + (o[0].fx.t || 0) >= 100 ? 0 : 1); }
  else if (S.pend) { const o = S.pend.opts; let k = eth ? o.findIndex(x => x.f === eth) : -1; if (k < 0) k = rnd(o.length); choose(S, k); }
  return r;
}
