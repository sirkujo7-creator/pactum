// Otras formas de ganar (fase 4): desde Ciudad, además de la Polis, cuatro caminos (próspera, justa, verde, en paz).
// Cada uno se gana sosteniendo todas sus condiciones los años que pide la dificultad. Solo en el terreno en acuarela.
import { C } from './contenido.js';
import { counts, aniosPolis } from './reglas.js';
import { climaActivo } from './clima.js';
import { rating, totDebt } from './hacienda.js';
import { inseguridad } from './sucesos.js';
import { movilizados } from './movimientos.js';
import { promedioRel } from './vecinos.js';

const K = () => C.VICTORIAS;
export function victoriasActivas(S) { return climaActivo(S) && !!C.VICTORIAS && S.stage >= K().desde.etapa; }

export function cumpleCondicion(S, q) {
  switch (q.tipo) {
    case 'hapMin': return S.hap >= q.valor;
    case 'calificacion': return rating(S).l === q.valor;
    case 'deudaMax': return totDebt(S) <= q.valor;
    case 'oroMin': return S.gold >= q.valor * S.price;
    case 'eqMin': return S.eq >= q.valor;
    case 'trMin': return S.tr >= q.valor;
    case 'claseMin': return Math.min(S.sat.c, S.sat.a, S.sat.e) >= q.valor;
    case 'envMin': return S.env >= q.valor;
    case 'sinMinas': return counts(S).mina === 0;
    case 'bosqueMin': return S.map.filter(x => x.t === 'bosque').length / S.map.length >= q.valor;
    case 'sinGrupo': return !(S.conf && (S.conf.grupo || S.conf.nivel >= 15));
    case 'insegMax': return inseguridad(S) < q.valor;
    case 'sinMovilizados': return movilizados(S).length === 0;
    case 'vecinosMin': return !!S.vecinos && promedioRel(S) >= q.valor;
  }
  return false;
}
// Estado de cada camino: años seguidos cumplidos, años que se piden y qué condiciones faltan hoy.
export function caminos(S) {
  const anios = aniosPolis(S);
  return Object.entries(K().caminos).map(([id, c]) => ({ id, ...c, anios, llevados: (S.caminos && S.caminos[id]) || 0,
    estado: c.condiciones.map(q => ({ ...q, ok: cumpleCondicion(S, q) })) }));
}
// Cierre del año: cuenta los años de cada camino. Devuelve el final si se ganó por uno de ellos.
export function victoriasDelAnio(S) {
  if (!victoriasActivas(S) || S.ganado) return null;
  if (!S.caminos) S.caminos = {};
  for (const c of caminos(S)) {
    S.caminos[c.id] = c.estado.every(q => q.ok) ? (S.caminos[c.id] || 0) + 1 : 0;
    if (S.caminos[c.id] >= c.anios) return { win: true, title: c.nombre, text: `${c.texto} Lo sostuviste ${c.anios} años. ${K().leccion}`, camino: c.id };
  }
  return null;
}
