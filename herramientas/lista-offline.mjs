// Actualiza en sw.js la lista de archivos que se guardan para jugar sin internet.
// Uso: node herramientas/lista-offline.mjs   (correr antes de publicar si se agregan archivos)
import fs from 'node:fs';
import path from 'node:path';

const raiz = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const lista = ['./', 'index.html', 'manifest.webmanifest'];
const recorrer = (dir, filtro) => fs.readdirSync(path.join(raiz, dir), { withFileTypes: true }).flatMap(e =>
  e.isDirectory() ? recorrer(path.join(dir, e.name), filtro) : filtro.test(e.name) ? [path.join(dir, e.name).split(path.sep).join('/')] : []);
lista.push(...recorrer('src', /\.(js|css|json)$/).sort());
lista.push(...recorrer('vendor', /\.(js|woff2)$/).sort());
lista.push(...recorrer('iconos', /\.png$/).sort());
const sw = path.join(raiz, 'sw.js');
const texto = fs.readFileSync(sw, 'utf8').replace(/const ARCHIVOS = \[[\s\S]*?\];/, `const ARCHIVOS = [\n${lista.map(f => `  '${f}'`).join(',\n')}\n];`);
fs.writeFileSync(sw, texto);
console.log(`sw.js: ${lista.length} archivos.`);
