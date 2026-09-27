// Crea los iconos PNG de la app con el navegador Chromium. Uso: node herramientas/crear-iconos.mjs
// Necesita Playwright instalado (npm i -g playwright) y Python para el servidor local.
import { createRequire } from 'node:module';
import { spawn, execSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
const raizGlobal = execSync('npm root -g').toString().trim();
const { chromium } = require(path.join(raizGlobal, 'playwright'));

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const servidor = spawn('python3', ['-m', 'http.server', '8765', '--bind', '127.0.0.1'], { cwd: raiz, stdio: 'ignore' });
await new Promise(r => setTimeout(r, 800));
try {
  const nav = await chromium.launch();
  const pag = await nav.newPage();
  await pag.goto('http://127.0.0.1:8765/herramientas/iconos.html');
  await pag.waitForFunction(() => window.ICONOS);
  const iconos = await pag.evaluate(() => window.ICONOS);
  mkdirSync(path.join(raiz, 'iconos'), { recursive: true });
  for (const [nombre, url] of Object.entries(iconos)) {
    writeFileSync(path.join(raiz, 'iconos', nombre), Buffer.from(url.split(',')[1], 'base64'));
    console.log('Creado iconos/' + nombre);
  }
  await nav.close();
} finally {
  servidor.kill();
}
