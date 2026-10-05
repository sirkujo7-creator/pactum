// La industria como decisión (fase 11): el taller pasa a ser la fábrica y en su ficha se elige qué producir
// (x.pr): artesanías, trilladora de café, molino de arroz, chocolatería, textiles o fundición. Cada producto usa una
// materia prima del territorio (fincas de un cultivo o minas); sin ella la fábrica trabaja a medias y no deja
// ganancia. Las artesanías son el taller de siempre. Los productos se desbloquean con el camino de avances.
// Solo en el terreno en acuarela; en la versión 9 todo sigue igual.
import { C } from './contenido.js';
import { fincasActivas, esFinca, cultivoDe, produce, precioCultivo, datosCultivo } from './fincas.js';
import { rindeObra } from './desgaste.js';
import { counts } from './reglas.js';
import { poweredT } from './sociedad.js';
import { nearRiver } from './mundo.js';
import { fase } from './economia.js';
import { efectoLeyes } from './civismo.js';
import { bonoFabrica } from './vecindad.js';
import { datosAvance, cumpleAvance, requisitoAvance } from './avances.js';

const K = () => C.INDUSTRIA;
export function industriaActiva(S) { return fincasActivas(S) && !!C.INDUSTRIA; }
export function productoDe(x) { return x.pr || 'artesanias'; }
export function datosProducto(pr) { return K().productos[pr]; }
export function listaProductos() { return Object.keys(K().productos); }
const fabricas = S => S.map.map((x, i) => x.b === 'taller' && !x.ob ? i : -1).filter(i => i >= 0);
// Energía: con menos energía que fábricas, solo trabajan las que alcanzan; primero las que más dejan.
function encendidas(S) {
  const L = fabricas(S), n = poweredT(S, counts(S));
  if (n >= L.length) return new Set(L);
  const valor = i => { const D = datosProducto(productoDe(S.map[i])); return D.renta * insumo(S, productoDe(S.map[i])).f + D.empleo * .01; };
  return new Set(L.sort((a, b) => valor(b) - valor(a) || a - b).slice(0, n));
}
// Materia prima: cuántas fincas (o minas) la dan y cuántas piden las fábricas de ese producto.
export function insumo(S, pr) {
  const D = datosProducto(pr), q = D.insumo;
  if (!q) return { tiene: 0, necesita: 0, f: 1 };
  const n = fabricas(S).filter(i => productoDe(S.map[i]) === pr).length || 1;
  const tiene = q.cultivo ? S.map.filter(x => esFinca(x) && !x.ob && cultivoDe(x) === q.cultivo && produce(S, x) && rindeObra(S, x)).length
    : S.map.filter(x => x.b === q.obra && !x.ob && rindeObra(S, x)).length;
  const necesita = q.porFabrica * n;
  return { tiene, necesita, f: Math.min(1, tiene / necesita) };
}
// Materia prima que tendría la fábrica i si produjera pr (para comparar antes de cambiar).
export function insumoSi(S, i, pr) {
  const q = datosProducto(pr).insumo;
  if (!q) return 1;
  const n = fabricas(S).filter(j => j !== i && productoDe(S.map[j]) === pr).length + 1;
  return Math.min(1, insumo(S, pr).tiene / (q.porFabrica * n));
}
// Paso 2: el precio del metal (fundición) sigue el ciclo de la economía.
export function precioCiclo(S, pr) { const c = K().ciclo && K().ciclo[pr]; return c ? (c[fase(S)] || 1) : 1; }
// Paso 2: los salarios de las fábricas (bajo, justo o alto): más ganancia o obreros más contentos.
export function salarioActual(S) { return S.salario || 'justo'; }
export function salario(S) { return K().salarios[salarioActual(S)]; }
export function hayFabricas(S) { return fabricas(S).length > 0; }
export function elegirSalario(S, s) {
  if (!K().salarios[s] || salarioActual(S) === s) return false;
  if (s === 'justo') delete S.salario; else S.salario = s;
  S.log.unshift({ y: S.year, t: K().textos.salarioCambia.replace('{nombre}', K().salarios[s].nombre.toLowerCase()) });
  return true;
}
// Lo que hace una fábrica en la casilla i: { renta, empleo, ambiente, f (materia prima), encendida }.
export function produccionFabrica(S, i, en) {
  const x = S.map[i], pr = productoDe(x), D = datosProducto(pr), on = (en || encendidas(S)).has(i);
  if (!on) return { renta: 0, empleo: 0, ambiente: D.ambiente * K().minimo * (nearRiver(S, i) ? K().rio : 1) * datosNivel(nivelDe(x)).ambiente, f: 0, encendida: false };
  const f = insumo(S, pr).f, m = K().minimo + (1 - K().minimo) * f, r = rindeObra(S, x);
  // La ganancia sigue a medias el precio de la materia prima: la industria amortigua las crisis del campo.
  const precio = D.insumo && D.insumo.cultivo ? .5 + .5 * precioCultivo(S, D.insumo.cultivo) : precioCiclo(S, pr);
  const rio = nearRiver(S, i) ? K().rio : 1; // paso 2: junto al río, sus desechos lo ensucian más
  const N = datosNivel(nivelDe(x)); // paso 3: con máquinas o automatizada, más ganancia y menos empleo
  return { renta: D.renta * f * r * precio * salario(S).renta * N.renta * (1 + efectoLeyes(S, 'fabricas') + bonoFabrica(S, i, D.insumo)), empleo: Math.round(D.empleo * m * N.empleo * (r ? 1 : 0)), ambiente: D.ambiente * m * rio * N.ambiente, f, encendida: true };
}
// Para la hacienda: una función que da la ganancia de la fábrica en i (con las fábricas encendidas calculadas una vez).
export function rentaFabrica(S) { const en = encendidas(S); return i => produccionFabrica(S, i, en).renta; }
function suma(S, k) { const en = encendidas(S); return fabricas(S).reduce((s, i) => s + produccionFabrica(S, i, en)[k], 0); }
export function rentaIndustria(S) { return suma(S, 'renta'); }
export function empleoIndustria(S) { return suma(S, 'empleo'); }
export function ambienteIndustria(S) { return suma(S, 'ambiente'); }

// ---------- Elegir el producto ----------
export function productoDisponible(S, pr) {
  const a = K().productos[pr] && datosAvance('p_' + pr);
  return !a || cumpleAvance(S, a);
}
export function requisitoProducto(S, pr) { const a = datosAvance('p_' + pr); return a ? requisitoAvance(a, S) : ''; }
export function costoCambio(S) { return Math.round(K().cambio * S.price); }
export function puedeProducir(S, i, pr) {
  const x = S.map[i];
  if (!industriaActiva(S) || x.b !== 'taller') return 'Aquí no hay una fábrica.';
  if (!datosProducto(pr)) return 'Producto desconocido.';
  if (productoDe(x) === pr) return 'Ya produce eso.';
  if (x.ob) return 'La fábrica aún se está construyendo.';
  if (!productoDisponible(S, pr)) return K().textos.bloqueado.replace('{req}', requisitoProducto(S, pr));
  if (!x.nuevaF && S.gold < costoCambio(S)) return `Necesitas ${costoCambio(S)} de oro.`;
  return null;
}
export function producir(S, i, pr) {
  if (puedeProducir(S, i, pr)) return false;
  const x = S.map[i];
  if (!x.nuevaF) S.gold -= costoCambio(S);
  if (pr === 'artesanias') delete x.pr; else x.pr = pr;
  delete x.nuevaF;
  S.log.unshift({ y: S.year, t: K().textos.producido.replace('{producto}', datosProducto(pr).nombre.toLowerCase()) });
  return true;
}
// Nombre de la materia prima de un producto, en palabras.
export function nombreInsumo(pr) {
  const q = datosProducto(pr).insumo, T = K().textos;
  return !q ? '' : q.cultivo ? T.fincasDe.replace('{cultivo}', datosCultivo(q.cultivo).nombre.toLowerCase()) : T.minas;
}
// El producto que más deja con la materia prima que hay hoy (lo usan los robots y la sugerencia de la ficha).
export function mejorProducto(S, i) {
  let mejor = 'artesanias', v0 = 0;
  for (const pr of listaProductos()) {
    if (!productoDisponible(S, pr)) continue;
    const D = datosProducto(pr), q = D.insumo;
    if (!q) continue;
    const otras = fabricas(S).filter(j => j !== i && productoDe(S.map[j]) === pr).length, I = insumo(S, pr);
    const v = D.renta * Math.min(1, Math.max(0, I.tiene - otras * q.porFabrica) / q.porFabrica);
    if (v > v0) { v0 = v; mejor = pr; }
  }
  return mejor;
}

// ---------- Paso 3: la revolución industrial por épocas ----------
// Nivel de cada fábrica (x.nv): 0 taller artesanal, 1 con máquinas (pide la electricidad), 2 automatizada (pide la
// automatización). Cada salto deja más ganancia y da menos empleo.
export function nivelDe(x) { return x.nv || 0; }
export function datosNivel(n) { return K().niveles[n]; }
function adoptado(S, inv) { const a = S.tec && S.tec.adoptados[inv]; return !!a && a !== 'rechazado'; }
export function nivelDisponible(S, n) { const N = datosNivel(n); return !!N && (!N.invento || adoptado(S, N.invento)); }
export function costoNivel(S, n) { return Math.round((datosNivel(n).costo || 0) * S.price); }
export function puedeModernizar(S, i) {
  const x = S.map[i], n = nivelDe(x) + 1, N = datosNivel(n);
  if (!industriaActiva(S) || x.b !== 'taller' || x.ob) return 'Aquí no hay una fábrica.';
  if (!N) return 'Ya está en el nivel más alto.';
  if (!nivelDisponible(S, n)) return K().textos.nivelBloqueado.replace('{invento}', C.TEC.inventos[N.invento].nombre.toLowerCase());
  if (S.gold < costoNivel(S, n)) return `Necesitas ${costoNivel(S, n)} de oro.`;
  return null;
}
export function modernizar(S, i) {
  if (puedeModernizar(S, i)) return false;
  const x = S.map[i], n = nivelDe(x) + 1;
  S.gold -= costoNivel(S, n); x.nv = n;
  S.log.unshift({ y: S.year, t: K().textos.modernizada.replace('{nivel}', datosNivel(n).nombre.toLowerCase()) });
  return true;
}
// Para los dilemas: cuántas fábricas hay de un producto y el nivel más alto.
export function fabricasDe(S, pr) { return fabricas(S).filter(i => productoDe(S.map[i]) === pr).length; }
export function nivelMaximo(S) { return fabricas(S).reduce((m, i) => Math.max(m, nivelDe(S.map[i])), 0); }
