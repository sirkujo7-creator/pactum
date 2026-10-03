// Decisiones que se ven (fase 4): cada decisión deja una huella en una casilla libre cerca del centro del pueblo
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
  const libres = S.map.map((x, i) => i).filter(i => { const x = S.map[i]; return !x.b && !x.mk && x.t === 'llano'; })
    .map(i => { const dr = Math.floor(i / N) - cr, dc = i % N - cc, dist = Math.hypot(dr, dc); return [i, dist + ((i * 7 + S.year * 13) % 5) * .15]; })
    .filter(([, dd]) => dd >= 1.4).sort((a, b) => a[1] - b[1]);
  if (!libres.length) return -1;
  const con = S.map.map((x, i) => x.mk ? i : -1).filter(i => i >= 0);
  if (con.length >= K().maximo) { const viejo = con.filter(i => S.map[i].mk.t !== 'acta' && S.map[i].mk.t !== 'campamento' && S.map[i].mk.t !== 'asentamiento').sort((a, b) => S.map[a].mk.y - S.map[b].mk.y)[0]; if (viejo !== undefined) delete S.map[viejo].mk; }
  const i = libres[0][0];
  S.map[i].mk = { t: tipo, y: S.year, d };
  recordar(S, tipo); // fase 5: la huella queda en la memoria del pueblo
  return i;
}

// Cierre del año: las huellas viejas se borran.
export function marcasDelAnio(S) {
  if (!marcasActivas(S)) return;
  for (const x of S.map) if (x.mk && S.year - x.mk.y > (K().tipos[x.mk.t] || { anios: 0 }).anios) delete x.mk;
}
export function marcasEnMapa(S) { return S.map.filter(x => x.mk).length; }
