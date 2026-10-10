// Decisiones que se ven (fase 4): cada decisión deja una huella en una casilla libre alrededor del pueblo (a dos casillas de las obras)
// (mural, retén, valla, placa, olla comunitaria, pancartas, vivero). Duran unos años; si se construye encima,
// desaparecen. Se guardan en la casilla (x.mk). Solo en el terreno en acuarela.
import { C } from './contenido.js';
import { climaActivo } from './clima.js';
import { lado } from './mundo.js';
import { centroPueblo } from './cobertura.js';
import { recordar } from './memoria.js';

const K = () => C.MARCAS;
export function marcasActivas(S) { return climaActivo(S) && !!C.MARCAS; }

// Tipo de huella de una opción de dilema (la de los datos, o según la corriente filosófica).
export function marcaDeOpcion(ev, o) {
  if (o.huella) return o.huella;
  if (ev.mov && o.accion) return K().movimientos[o.accion];
  return o.f ? K().porFilosofia[o.f] : null;
}

export function dejarMarca(S, tipo, d) {
  if (!marcasActivas(S) || !tipo || !K().tipos[tipo]) return -1;
  const N = lado(S), c = centroPueblo(S);
  if (c < 0) return -1;
  const cr = Math.floor(c / N), cc = c % N;
  // Las huellas van alrededor del pueblo, no pegadas a las obras: así no estorban al construir (pedido de Juan).
  const obras = S.map.map((x, i) => x.b ? i : -1).filter(i => i >= 0);
  const lejos = (i, d) => obras.every(j => Math.max(Math.abs(Math.floor(i / N) - Math.floor(j / N)), Math.abs(i % N - j % N)) > d);
  const T = K().tipos[tipo];
  if (T.reforesta) return reforestar(S, T.reforesta, tipo, d, cr, cc); // la minga siembra bosque de verdad en la ladera
  // Obras de las decisiones (diques, reservorios, escuelas rurales…): cada una va en su lugar lógico.
  const rio = i => { const r = Math.floor(i / N), c = i % N; return [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => r + a >= 0 && c + b >= 0 && r + a < N && c + b < N && S.map[(r + a) * N + c + b].t === 'rio'); };
  const sitio = i => T.lugar === 'rio' ? rio(i) : T.lugar === 'ladera' ? (S.map[i].h || 0) >= 1 : T.lugar === 'vereda' ? Math.hypot(Math.floor(i / N) - cr, i % N - cc) >= 4 : true;
  const libre = i => { const x = S.map[i]; return !x.b && !x.mk && x.t === 'llano'; };
  let cand = S.map.map((x, i) => i).filter(i => libre(i) && sitio(i));
  if (!cand.length) cand = S.map.map((x, i) => i).filter(libre); // sin orilla, ladera o vereda libre: cerca del pueblo
  const base = cand
    .map(i => { const dr = Math.floor(i / N) - cr, dc = i % N - cc, dist = Math.hypot(dr, dc); return [i, dist + ((i * 7 + S.year * 13) % 5) * .15]; });
  let libres = [];
  for (const d of [2, 1]) { libres = base.filter(([i, dd]) => dd >= 1.4 && lejos(i, d)); if (libres.length) break; }
  if (!libres.length) libres = base.filter(([, dd]) => dd >= 1.4);
  libres.sort((a, b) => a[1] - b[1]);
  if (!libres.length) return -1;
  const con = S.map.map((x, i) => x.mk ? i : -1).filter(i => i >= 0);
  if (con.length >= K().maximo) { const viejo = con.filter(i => (K().tipos[S.map[i].mk.t] || { anios: 0 }).anios < 999).sort((a, b) => S.map[a].mk.y - S.map[b].mk.y)[0]; if (viejo !== undefined) delete S.map[viejo].mk; }
  const i = libres[0][0];
  S.map[i].mk = { t: tipo, y: S.year, d };
  recordar(S, tipo); // fase 5: la huella queda en la memoria del pueblo
  return i;
}

// Árboles sembrados: las casillas libres de ladera más cercanas al pueblo vuelven a ser bosque (si no hay ladera, llano).
function reforestar(S, n, tipo, d, cr, cc) {
  const N = lado(S), dist = i => Math.hypot(Math.floor(i / N) - cr, i % N - cc);
  const libres = S.map.map((x, i) => i).filter(i => { const x = S.map[i]; return !x.b && !x.mk && x.t === 'llano' && dist(i) >= 2; });
  const L = libres.filter(i => (S.map[i].h || 0) >= 1).sort((a, b) => dist(a) - dist(b)), elegidas = (L.length ? L : libres.sort((a, b) => dist(a) - dist(b))).slice(0, n);
  for (const i of elegidas) { const x = S.map[i]; x.t = 'bosque'; x.nb = S.year; x.er = 0; delete x.tl; }
  if (!elegidas.length) return -1;
  recordar(S, tipo);
  return elegidas[0];
}

// Cierre del año: las huellas viejas se borran.
export function marcasDelAnio(S) {
  if (!marcasActivas(S)) return;
  for (const x of S.map) if (x.mk && S.year - x.mk.y > (K().tipos[x.mk.t] || { anios: 0 }).anios) delete x.mk;
}
export function marcasEnMapa(S) { return S.map.filter(x => x.mk).length; }
