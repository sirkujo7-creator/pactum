// Vecindad (pedido de Juan, 5 de octubre): lo que se construye junto a las casas importa. Los parques alegran solo a las
// casas cercanas; las fábricas, las minas y los cuarteles pegados a las casas molestan a sus vecinos; una fábrica con su
// materia prima cerca y un mercado junto a las fincas rinden más. Datos en src/data/vecindad.json. Solo en el terreno
// en acuarela; en la versión 9 todo sigue igual.
import { C } from './contenido.js';
import { climaActivo } from './clima.js';
import { lado } from './mundo.js';

const K = () => C.VECINDAD;
export function vecindadActiva(S) { return climaActivo(S) && !!C.VECINDAD; }
const sirve = x => x.b && !x.ob && !(x.u >= 80);
function cerca(S, a, b, r) { const N = lado(S), dr = Math.floor(a / N) - Math.floor(b / N), dc = a % N - b % N; return Math.max(Math.abs(dr), Math.abs(dc)) <= r; }
// Obras de cierto tipo a cierta distancia de la casilla i.
export function obrasCerca(S, i, tipos, r) { const out = []; S.map.forEach((x, j) => { if (j !== i && sirve(x) && tipos.includes(x.b) && cerca(S, i, j, r)) out.push(j); }); return out; }
// Lo que tiene alrededor una casa: parque (sí o no) y la peor molestia (o null).
export function vecindarioDe(S, i) {
  const V = K(), parque = obrasCerca(S, i, ['parque'], V.parque.radio).length > 0;
  let peor = null;
  for (const [k, M] of Object.entries(V.molestias)) if (obrasCerca(S, i, [k], M.radio).length && (!peor || M.animo < peor.animo)) peor = { k, ...M };
  return { parque, molestia: peor };
}
// Para el ánimo de las clases: fracción de casas con parque cerca y molestia promedio por casa.
export function vecindad(S) {
  if (!vecindadActiva(S)) return null;
  const V = K(), casas = [], parques = [], mol = Object.fromEntries(Object.keys(V.molestias).map(k => [k, []]));
  S.map.forEach((x, i) => { if (!sirve(x)) return; if (x.b === 'casa') casas.push(i); else if (x.b === 'parque') parques.push(i); else if (mol[x.b]) mol[x.b].push(i); });
  if (!casas.length) return { parque: 0, molestia: 0, casas: 0 };
  let conParque = 0, molestia = 0;
  for (const i of casas) {
    if (parques.some(j => cerca(S, i, j, V.parque.radio))) conParque++;
    let peor = 0;
    for (const [k, L] of Object.entries(mol)) if (L.some(j => cerca(S, i, j, V.molestias[k].radio))) peor = Math.min(peor, V.molestias[k].animo);
    molestia += peor;
  }
  return { parque: conParque / casas.length, molestia: molestia / casas.length, casas: casas.length };
}
// Bono por cercanía: fábrica con su materia prima cerca; mercado junto a fincas.
export function bonoFabrica(S, i, insumo) {
  if (!vecindadActiva(S) || !insumo) return 0;
  const F = K().cercania.fabrica, L = obrasCerca(S, i, insumo.cultivo ? ['cultivo', 'cafetal'] : [insumo.obra], F.radio);
  const ok = insumo.cultivo ? L.some(j => (S.map[j].cv || (S.map[j].b === 'cafetal' ? 'cafe' : 'pancoger')) === insumo.cultivo) : L.length > 0;
  return ok ? F.bono : 0;
}
export function bonoMercado(S, i) {
  if (!vecindadActiva(S)) return 0;
  const F = K().cercania.mercado;
  return obrasCerca(S, i, ['cultivo', 'cafetal'], F.radio).length ? F.bono : 0;
}
// Aviso al construir: cuántas casas quedan junto a una molestia nueva o a un parque nuevo.
export function avisoVecindad(S, i, k) {
  if (!vecindadActiva(S)) return '';
  const V = K(), T = V.textos, plural = n => n === 1 ? 'casa' : 'casas', art = k === 'taller' && C.INDUSTRIA ? 'una fábrica' : C.B[k].a;
  if (k === 'parque') { const n = obrasCerca(S, i, ['casa'], V.parque.radio).length; return n ? T.avisoParque.replace('{n}', n).replace('{casas}', n === 1 ? 'casa cercana' : 'casas cercanas') : ''; }
  const M = V.molestias[k];
  if (!M) return '';
  const n = obrasCerca(S, i, ['casa'], M.radio).length;
  return n ? T.avisoMolestia.replace('{obra}', art.charAt(0).toUpperCase() + art.slice(1)).replace('{n}', n).replace('{casas}', plural(n)).replace('{texto}', M.texto) : '';
}
