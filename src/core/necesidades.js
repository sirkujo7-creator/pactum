// Nivel de vida de cada casa (idea de la saga Anno, aprobada por Juan): cada casa tiene un nivel (0 rancho, 1 casa,
// 2 casa acomodada, 3 casa próspera) según las necesidades que se le cumplen: primero comida y agua; luego camino,
// mercado y templo; después escuela, hospital, seguridad y cultura. Cada año sube o baja un nivel hacia el que le
// corresponde, y el dibujo de la casa cambia con su nivel. El nivel medio del pueblo da un poco de ánimo y de
// ingresos (o los quita). Solo en acuarela.
import { C } from './contenido.js';
import { climaActivo } from './clima.js';
import { counts } from './reglas.js';
import { waterCap } from './sociedad.js';
import { cubre, coberturaActiva } from './cobertura.js';
import { precioAlimento } from './economia.js';
import { aislada } from './calles.js';
import { inseguridad } from './sucesos.js';
import { lado, nearRiver } from './mundo.js';

const K = () => C.NEC;
export const necesidadesActivas = S => climaActivo(S) && !!C.NEC;
const usable = x => x.b === 'casa' && !x.ob && !(x.u >= 80);
export function casasConVida(S) { return S.map.map((x, i) => usable(x) ? i : -1).filter(i => i >= 0); }

// Lo que vale para todo el pueblo se calcula una sola vez por evaluación.
function contexto(S) {
  const N = lado(S), c = counts(S), R = K().radios, cul = new Set(K().culturales);
  const donde = f => S.map.map((x, i) => x.b && !x.ob && !(x.u >= 80) && f(x.b) ? i : -1).filter(i => i >= 0);
  return {
    N, R, cob: coberturaActiva(S),
    comida: precioAlimento(S) < 1.3 && !S.hungry,
    agua: S.stage === 0 || S.pop <= waterCap(S, c),
    seguridad: inseguridad(S) < K().inseguridadMax,
    iglesias: donde(b => b === 'iglesia'), cultura: donde(b => cul.has(b)), mercados: donde(b => b === 'mercado')
  };
}
const cerca = (X, a, L, r) => L.some(b => Math.hypot(Math.floor(a / X.N) - Math.floor(b / X.N), a % X.N - b % X.N) <= r);
// ¿Se le cumple esta necesidad a la casa i?
function cumple(S, X, id, i) {
  switch (id) {
    case 'comida': return X.comida;
    case 'agua': return X.agua || nearRiver(S, i);
    case 'camino': return !aislada(S, i);
    case 'mercado': return X.cob ? cubre(S, 'mercado', i) : cerca(X, i, X.mercados, X.R.mercadoSinCobertura);
    case 'iglesia': return cerca(X, i, X.iglesias, X.R.iglesia);
    case 'escuela': return X.cob && cubre(S, 'escuela', i);
    case 'hospital': return X.cob && cubre(S, 'hospital', i);
    case 'seguridad': return X.seguridad;
    case 'cultura': return cerca(X, i, X.cultura, X.R.cultura);
  }
  return true;
}
// Nivel que le corresponde a la casa y lo que le falta para el siguiente.
export function evaluarCasa(S, i, X = contexto(S)) {
  const P = K().pide;
  let nivel = 0;
  for (let n = 1; n < P.length; n++) { if (P[n].every(id => cumple(S, X, id, i))) nivel = n; else break; }
  const falta = nivel < P.length - 1 ? P[nivel + 1].filter(id => !cumple(S, X, id, i)) : [];
  return { nivel, falta };
}
export function nivelDeVida(S, i) { const x = S.map[i]; return x && x.vida !== undefined ? x.vida : 1; }
export function datosNivelVida(n) { return K().niveles[n]; }
export function datosNecesidad(id) { return K().necesidades[id]; }

// Cierre del año: cada casa da un paso hacia su nivel. La primera vez (partida guardada antes) toma el suyo de una vez.
export function vidaDelAnio(S) {
  if (!necesidadesActivas(S)) return [];
  const T = K().textos, X = contexto(S), casas = casasConVida(S), primera = !S.vidaIni;
  let sube = 0, baja = 0; const motivo = {};
  for (const i of casas) {
    const x = S.map[i], { nivel } = evaluarCasa(S, i, X);
    if (primera) { x.vida = nivel; continue; }
    const v = x.vida === undefined ? 1 : x.vida;
    if (nivel > v) { x.vida = v + 1; sube++; }
    else if (nivel < v) { x.vida = v - 1; baja++; const P = K().pide[v]; P.filter(id => !cumple(S, X, id, i)).forEach(id => motivo[id] = (motivo[id] || 0) + 1); }
    else x.vida = v;
  }
  S.vidaIni = true;
  const news = [], pl = n => n === 1 ? '' : 's';
  if (sube) news.push(T.subieron.replace('{n}', sube).replace('{s}', pl(sube)));
  if (baja) { const m = Object.entries(motivo).sort((a, b) => b[1] - a[1])[0]; news.push(T.bajaron.replace('{n}', baja).replace('{s}', pl(baja)).replace('{falta}', m ? datosNecesidad(m[0]).nombre.toLowerCase() : '')); }
  return news;
}
// Cuántas casas hay en cada nivel y el nivel medio.
export function resumenVida(S) {
  const n = [0, 0, 0, 0], L = casasConVida(S);
  for (const i of L) n[nivelDeVida(S, i)]++;
  const media = L.length ? (n[1] + n[2] * 2 + n[3] * 3) / L.length : K().efectos.media;
  return { n, media, total: L.length };
}
// Efecto del nivel medio: 'animo' (puntos sobre el ánimo de las tres clases) o 'ingresos' (fracción).
export function efectoVida(S, que) {
  if (!necesidadesActivas(S) || !S.vidaIni) return 0;
  const E = K().efectos, d = resumenVida(S).media - E.media;
  return que === 'animo' ? d * E.animo : que === 'ingresos' ? d * E.ingresos : 0;
}
// Para Pendientes: la necesidad que más casas frena.
export function frenoPrincipal(S) {
  if (!necesidadesActivas(S) || !S.vidaIni) return null;
  const X = contexto(S), cuenta = {}, una = {};
  let casas = 0;
  for (const i of casasConVida(S)) { const { falta } = evaluarCasa(S, i, X); if (falta.length) { casas++; falta.forEach(id => { cuenta[id] = (cuenta[id] || 0) + 1; if (una[id] === undefined) una[id] = i; }); } }
  const m = Object.entries(cuenta).sort((a, b) => b[1] - a[1])[0];
  return m ? { id: m[0], n: m[1], casas, casa: una[m[0]] } : null;
}
// Clave del dibujo de la casa según la época visual y su nivel (variante v de 0 a 3).
export function estiloCasa(S, era, i, v) {
  const x = S.map[i];
  if (!necesidadesActivas(S) || !x || x.vida === undefined) return null;
  return K().estilos[Math.max(0, Math.min(3, era))][x.vida] + v;
}
