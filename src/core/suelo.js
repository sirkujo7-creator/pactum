// Suelo vivo (fase 1): el bosque vuelve a las laderas, se quema con El Niño, las laderas taladas
// se erosionan y, con La Niña, pueden derrumbarse. Solo actúa en el terreno en acuarela.
// Marcas por casilla: tl (se taló alguna vez), er (erosión 0 a 3), q (años de ceniza),
// dr (años de la huella de un derrumbe), nb (año en que nació el bosque).
import { azar, clamp } from './azar.js';
import { C } from './contenido.js';
import { lado } from './mundo.js';
import { hasLaw, cap } from './reglas.js';
import { climaActivo } from './clima.js';
import { protegeSuelo } from './fincas.js';

const P = () => C.CLIMA.suelo;

// Vecinos en las 8 direcciones.
function vecinos8(S, i) {
  const N = lado(S), r = Math.floor(i / N), c = i % N, o = [];
  for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
    if (!dr && !dc) continue;
    const R = r + dr, K = c + dc;
    if (R >= 0 && K >= 0 && R < N && K < N) o.push(R * N + K);
  }
  return o;
}
const casillas = n => n === 1 ? '1 casilla' : `${n} casillas`;
function barajar(a) { for (let k = a.length - 1; k > 0; k--) { const j = Math.floor(azar() * (k + 1)); [a[k], a[j]] = [a[j], a[k]]; } return a; }

// Al talar un bosque (construir encima) la casilla queda marcada: si es ladera, empezará a erosionarse.
export function marcarTala(S, i) { if (climaActivo(S)) S.map[i].tl = 1; }

// Estado del suelo de una casilla, para la ficha: 'derrumbe', 'quemado', 'riesgo', 'erosion', 'joven' o ''.
export function estadoSuelo(S, i) {
  const x = S.map[i];
  if (!climaActivo(S)) return '';
  if (x.dr > 0) return 'derrumbe';
  if (x.q > 0) return 'quemado';
  if (x.t !== 'bosque' && x.er >= P().erosion.maximo) return 'riesgo';
  if (x.t !== 'bosque' && x.er > 0) return 'erosion';
  if (x.t === 'bosque' && x.nb && S.year - x.nb < 3) return 'joven';
  return '';
}

// Cambios del suelo al cerrar el año. Devuelve las noticias.
export function sueloDelAnio(S) {
  if (!climaActivo(S)) return [];
  const K = P(), news = [], fen = S.clima.fenomeno, ley = hasLaw(S, 'ambiente');
  for (const x of S.map) { if (x.q > 0) x.q--; if (x.dr > 0) x.dr--; }

  // Incendios forestales con la sequía de El Niño (la protección ambiental los previene).
  if (fen === 'nino' && azar() < (ley ? K.incendio.conLey : K.incendio.probabilidad)) {
    const bosques = S.map.map((x, i) => i).filter(i => S.map[i].t === 'bosque');
    if (bosques.length) {
      const [a, b] = K.incendio.casillas, n = a + Math.floor(azar() * (b - a + 1));
      const cola = [bosques[Math.floor(azar() * bosques.length)]], vistos = new Set(cola), quemadas = [];
      while (cola.length && quemadas.length < n) {
        const i = cola.shift(); quemadas.push(i);
        for (const j of barajar(vecinos8(S, i))) if (!vistos.has(j) && S.map[j].t === 'bosque') { vistos.add(j); cola.push(j); }
      }
      for (const i of quemadas) { const x = S.map[i]; x.t = 'llano'; x.q = K.incendio.anios; x.tl = 1; delete x.nb; }
      news.push(K.incendio.texto.replace('{n}', casillas(quemadas.length)));
      if (S.clima.evento && S.clima.evento.anio === S.year) S.clima.evento.quemadas = quemadas.length;
    }
  }

  // Derrumbes con las lluvias de La Niña, solo en laderas con erosión grave.
  if (fen === 'nina') {
    const D = K.derrumbe, riesgo = barajar(S.map.map((x, i) => i).filter(i => S.map[i].t !== 'bosque' && S.map[i].er >= K.erosion.maximo));
    const caidas = [], perdidas = [];
    for (const i of riesgo) {
      if (caidas.length >= D.maximo) break;
      if (azar() >= D.probabilidad) continue;
      const x = S.map[i];
      caidas.push(i);
      if (x.b && x.b !== 'agora') {
        perdidas.push(x.b === 'casa' ? 'una casa' : C.B[x.b].a);
        if (x.b === 'casa') S.pop = Math.max(1, S.pop - D.habitantesPorCasa);
        S.tr = clamp(S.tr - D.confianzaPorObra, 0, 100);
        x.b = null; delete x.ob; delete x.mt; delete x.u;
      }
      x.er = 0; x.dr = D.anios;
    }
    if (caidas.length) {
      news.push(D.texto.replace('{n}', caidas.length) + (perdidas.length ? D.textoObras.replace('{o}', perdidas.join(', ')) : ''));
      if (S.pop > cap(S)) S.pop = cap(S);
      if (S.clima.evento && S.clima.evento.anio === S.year) { S.clima.evento.derrumbes = caidas.length; S.clima.evento.perdidas = perdidas; }
    }
  }

  // Erosión: las laderas taladas y sin cubierta se lavan; el café de sombra y los parques las protegen.
  const E = K.erosion, lluvioso = fen === 'nina' || (S.clima.lluvias === 'abundantes');
  S.map.forEach(x => {
    if (!x.tl || x.t === 'bosque') return;
    if ((x.h || 0) < 1 || x.b === 'cafetal' || x.b === 'parque' || protegeSuelo(x)) { if (x.er > 0) x.er--; return; } // fase 10: café, plátano y cacao protegen la ladera
    if (x.dr > 0) return;
    if (lluvioso || azar() < E.probabilidad) x.er = Math.min(E.maximo, (x.er || 0) + 1);
  });

  // El bosque vuelve: en laderas libres junto a otros bosques (más rápido con la ley ambiental).
  const G = K.crece, prob = ley ? G.conLey : G.probabilidad, maximo = ley ? G.maximoConLey : G.maximo;
  const candidatas = barajar(S.map.map((x, i) => i).filter(i => {
    const x = S.map[i];
    if (x.t !== 'llano' || x.b || x.q > 0 || x.dr > 0 || ((x.h || 0) < 1 && !x.tl)) return false;
    return vecinos8(S, i).filter(j => S.map[j].t === 'bosque').length >= G.vecinos;
  }));
  let crecio = 0;
  for (const i of candidatas) {
    if (crecio >= maximo) break;
    const x = S.map[i];
    if (azar() < prob * (x.tl ? G.quemadoPor : 1)) { x.t = 'bosque'; x.er = 0; x.nb = S.year; crecio++; }
  }
  if (crecio) news.push((ley ? G.textoLey : G.texto).replace('{n}', casillas(crecio)));
  return news;
}
