// Clases ampliadas (fase 3): cada clase se ve con sus subgrupos, cada uno con su número de personas,
// su ánimo y sus causas. El ánimo de un subgrupo es el de su clase más lo que lo distingue (tener tierra,
// trabajar para el Estado, vivir del comercio...). Solo en el terreno en acuarela.
import { C } from './contenido.js';
import { clamp } from './azar.js';
import { counts, hasLaw } from './reglas.js';
import { society, poweredT } from './sociedad.js';
import { climaActivo } from './clima.js';
import { precioAlimento, fase } from './economia.js';
import { cobertura } from './cobertura.js';
import { empleosDeObra, obrasActivas } from './construccion.js';
import { ejercitoActivo, ejercito, seguridad, partesEjercito } from './ejercito.js';

const K = () => C.GRUPOS;
export function gruposActivos(S) { return climaActivo(S) && !!C.GRUPOS; }
export function tierra(S) { return S.tierra ?? K().tierraInicial; }

// Qué subgrupo de trabajadores ocupa los empleos de cada obra.
const DE_TRABAJO = { mercado: 'comerciantes', banco: 'comerciantes', escuela: 'funcionarios', hospital: 'funcionarios', agora: 'funcionarios',
  recaudo: 'funcionarios', acueducto: 'funcionarios', universidad: 'funcionarios' };

// Cuántas personas hay en cada subgrupo.
export function tamanos(S) {
  const so = society(S), c = counts(S), t = tierra(S);
  const prop = Math.round(so.camp * t);
  // Los artesanos con empleo se reparten según los puestos de cada tipo de obra.
  const pu = { obreros: poweredT(S, c) * 9 + empleosDeObra(S), comerciantes: 0, funcionarios: 0 };
  for (const k of Object.keys(C.B)) if (k !== 'taller' && k !== 'cuartel' && C.B[k].ja) pu[DE_TRABAJO[k] || 'obreros'] += C.B[k].ja * c[k];
  const tot = pu.obreros + pu.comerciantes + pu.funcionarios || 1;
  const com = Math.round(so.art * pu.comerciantes / tot), fun = Math.round(so.art * pu.funcionarios / tot);
  const terr = 1 + c.cultivo * .3 + c.cafetal * .6, fin = 1 + c.banco * 3 + c.mercado * .5 + c.taller * 1.5 + c.mina * 2 + c.puerto * 1.5;
  const te = Math.round(so.el * terr / (terr + fin));
  const E = K().estudiantes, est = S.stage >= 1 ? Math.min(Math.round(S.pop * E.fraccionMaxima), c.escuela * E.porEscuela + c.universidad * E.porUniversidad) : 0;
  return { propietarios: prop, jornaleros: so.camp - prop, obreros: so.art - com - fun, comerciantes: com, funcionarios: fun,
    terratenientes: te, financistas: so.el - te, estudiantes: est, informales: so.un, soldados: c.cuartel * 4 };
}

// Lo que distingue a cada subgrupo de su clase: [causa, puntos].
function propias(S, g) {
  const pa = precioAlimento(S) - 1, f = fase(S), L = k => hasLaw(S, k), c = counts(S), ip = S.infl * 100, t = tierra(S);
  switch (g) {
    case 'propietarios': return [['Tienen su propia tierra', 4], ['Precio de la comida (la venden)', pa * 10]];
    case 'jornaleros': return [['Trabajan tierra ajena', -4], ['Precio de la comida (compran parte)', -pa * 6], ['Subsidio al campo', L('subsidio') ? 3 : 0]];
    case 'obreros': return [['Jornada de 8 horas', L('jornada') ? 5 : 0], ['Ambiente sucio en el trabajo', S.env < 50 ? -3 : 0], ['Recesión: despidos', f === 'recesion' ? -4 : 0], ['Obras públicas en marcha', Math.min(4, obrasActivas(S))]];
    case 'comerciantes': return [['Orden y seguridad (Ejército)', seguridad(S)], ['Ciclo económico', f === 'auge' ? 5 : f === 'recesion' ? -5 : 0], ['Aranceles que protegen', L('arancel') ? 3 : 0], ['Casas con mercado cerca', (cobertura(S).mercado - .5) * 6]];
    case 'funcionarios': return [['Empleo estable del Estado', 3], ['Tesoro en rojo: sueldos atrasados', S.gold < 0 ? -8 : 0], ['Corrupción en el gobierno', S.corr > 50 ? -4 : 0]];
    case 'terratenientes': return [['Orden y seguridad (Ejército)', seguridad(S)], ['Tierra repartida a campesinos', -(t - K().tierraInicial) * 20], ['Precio de la comida (la venden)', pa * 8], ['Protección ambiental', L('ambiente') ? -3 : 0]];
    case 'financistas': return [['Inflación', -ip * .5], ['Banco central independiente', L('bancoCentral') ? 4 : 0], ['Ciclo económico', f === 'auge' ? 5 : f === 'recesion' ? -6 : 0], ['Bancos', c.banco * 2]];
    case 'estudiantes': return [['Educación pública gratuita', L('educacion') ? 8 : 0], ['Universidad', c.universidad ? 5 : S.stage >= 2 ? -5 : 0], ['Libertad de prensa', L('prensa') ? 3 : 0], ['Censura', L('censura') ? -6 : 0]];
    case 'informales': return [['Sin empleo formal', -10], ['Costo de vida', -pa * 8]];
  }
  return [];
}
const claseDe = g => g === 'propietarios' || g === 'jornaleros' ? 'c' : g === 'terratenientes' || g === 'financistas' ? 'e' : 'a';

// Ánimo de un subgrupo: el de su clase más sus causas propias.
export function animoGrupo(S, g) {
  if (g === 'soldados') { const a = ejercito(S).animo; return { clase: 'x', base: a, propias: [], valor: a, ejercito: true }; }
  const k = claseDe(g), P = propias(S, g).filter(x => Math.abs(x[1]) >= .5).map(([t, v]) => [t, Math.round(v * 10) / 10]);
  return { clase: k, base: S.sat[k], propias: P, valor: clamp(S.sat[k] + P.reduce((s, x) => s + x[1], 0), 0, 100) };
}

// Todos los subgrupos, agrupados como se muestran en Sociedad.
export function panorama(S) {
  const T = tamanos(S), G = K().grupos;
  return Object.entries(K().clases).map(([k, cl]) => ({
    clase: k, nombre: cl.nombre,
    grupos: cl.grupos.filter(g => g !== 'soldados' || ejercitoActivo(S)).map(g => ({ id: g, ...G[g], n: T[g], ...animoGrupo(S, g) }))
  }));
}
