// Imágenes de las tarjetas: fotos del propio mapa (tomadas con `herramientas/generar-imagenes.mjs`) según el tema de la
// decisión o de la carta. Dos versiones: «a» (pueblo joven) y «b» (ciudad hecha).
const REGLAS = [
  ['iglesia', /iglesia|misa|cura\b|p[aá]rroc|catedral|procesi|sacerdote|fe\b|religi/],
  ['escuela', /escuela|maestr|educa|univers|colegio|libro|biblio|estudiant|alfabet|catecismo|conservator/],
  ['hospital', /hospital|salud|epidem|vacun|brote|fiebre|enferm|partera|m[eé]dic|cuarentena|pandemia/],
  ['cementerio', /muert|cement|luto|funeral|entier|tumba|v[ií]ctima|memoria|monumento|museo|comisi[oó]n/],
  ['cuartel', /guerra|ej[eé]rcito|cuartel|armad|polic[ií]a|soldad|violen|retén|invasi|frontera|golpe|reclut|atentado|secuestro|emboscada|paro armado|marquetalia|bogotazo|9 de abril|p[aá]jaros|chulavita/],
  ['mina', /mina|oro\b|miner|cantera|metal|petr[oó]leo|colosa|cajamarca|concesi/],
  ['rio', /r[ií]o\b|agua|avenida|inund|puerto|champ|acueduc|riego|represa|cable|vapor|barco|honda|magdalena/],
  ['bosque', /bosque|monte|ambient|tala\b|p[aá]ramo|glaciar|clima|calor|parque|frailej|nevado|incendio|ni[nñ]o|ni[nñ]a/],
  ['finca', /caf[eé]|cosecha|finca|tierra|campes|bald[ií]o|agrar|semilla|siembra|cultivo|colono|ganad|resguardo|restituci|arriero|ley 200|parcela|hambre|sequ[ií]a/],
  ['taller', /taller|f[aá]brica|obrer|sindic|huelga|trabaj|jornada|industria|trilladora|artesan|bananera|robot|energ/],
  ['mercado', /mercado|precio|comerc|tienda|fiado|plaza de mercado|vend|inflaci|importa|arancel|tratado|canal|embajada|vecin|polis/],
  ['banco', /banco|impuesto|deuda|bono|dinero|cr[eé]dit|tesoro|moneda|ahorro|pensi|corrup|elite|[eé]lite|casona|soborno|licitaci/],
  ['teatro', /teatro|fiesta|m[uú]sica|cultura|radio|tele|festival|bambuco|estreno|censura|poes[ií]a|prensa|peri[oó]dico|internet/],
  ['casas', /casa|vivienda|barrio|migra|desplaz|llegan|invasi[oó]n|asentamiento|habitantes|familia/],
];
const POR_EFECTO = { a: 'bosque', sc: 'finca', sa: 'taller', se: 'banco', t: 'mercado', d: 'banco', f: 'finca', p: 'casas', e: 'escuela', c: 'plaza', ti: 'finca' };
const POR_ESCENA = { tierras: 'finca', semillas: 'finca', cafe: 'finca', migra: 'casas', maestros: 'escuela', huelga: 'taller', protesta: 'plaza', precios: 'mercado', sal: 'mercado', elite: 'banco', festival: 'teatro', pet: 'plaza', corrup: 'banco', calle: 'plaza', salud: 'hospital', guerra: 'cuartel', radio: 'teatro', default: 'plaza' };
const buscar = t => { t = (t || '').toLowerCase(); for (const [tema, re] of REGLAS) if (re.test(t)) return tema; return null; };
// Tema por el título (y el id) primero, luego por el texto y al final por el efecto que más pesa.
export function temaDeTexto(titulo, texto, fx) {
  const a = buscar(titulo) || buscar(texto); if (a) return a;
  let mejor = null, mv = 0;
  for (const [k, v] of Object.entries(fx || {})) { const w = Math.abs(v) * (k === 't' ? 1 / 12 : k === 'f' ? 1 / 15 : 1); if (POR_EFECTO[k] && w > mv) { mv = w; mejor = POR_EFECTO[k]; } }
  return mejor || 'plaza';
}
const version = S => (S && (S.stage >= 3 || S.year >= 55) ? 'b' : 'a');
export function imagenTema(tema, S) { return `src/imagenes/${tema}-${version(S)}.jpg`; }
export function imagenDe(titulo, texto, fx, S) { return imagenTema(temaDeTexto(titulo, texto, fx), S); }
// Las cartas se ilustran por su escena (lo que cuenta la carta) y, si no, por el tema del texto.
export function imagenCarta(escena, familia, texto, S) { return imagenTema(POR_ESCENA[escena] || temaDeTexto('', texto, null), S); }
export const html = (src, alt = '') => `<img class="vig-foto" src="${src}" alt="${alt}" loading="lazy" decoding="async">`;

// Ilustraciones en acuarela de las cartas (hechas por Juan con Canva/Dream Lab): cuántas hay por escena en
// src/imagenes/cartas/<escena>-<n>.jpg. Si una escena no tiene, la carta usa una foto del mapa.
export const CARTAS_ACUARELA = { tierras: 2 };
// Una acuarela propia por carta: ids con archivo src/imagenes/cartas/<id>.jpg
export const CARTAS_UNICAS = ['tique1', 'arango1', 'quintero1', 'rojas1', 'rojas2', 'tique2', 'arango2', 'tique3', 'rojas3', 'arango3', 'quintero2', 'rojas4', 'rojas5', 'arango4', 'quintero3', 'lozano1', 'tique4', 'arango5', 'rojas6', 'lozano2', 'guerra1', 'tique5', 'lozano3', 'quintero4', 'cardenas1'];
export function imagenCartaAcuarela(escena, id) {
  if (CARTAS_UNICAS.includes(id)) return `src/imagenes/cartas/${id}.jpg`;
  const n = CARTAS_ACUARELA[escena]; if (!n) return null;
  let h = 0; for (const ch of String(id || '')) h = (h * 31 + ch.charCodeAt(0)) % 997;
  return `src/imagenes/cartas/${escena}-${h % n + 1}.jpg`;
}
