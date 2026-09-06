/* Pasa axe-core sobre la página en varios anchos, con y sin movimiento
   reducido, y deja una captura de cada variante.
   Necesita el servidor levantado en otra terminal:
       node herramientas/servidor.mjs                                      */
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import os from 'os';
import path from 'path';
import fs from 'fs/promises';

const URL = 'http://127.0.0.1:8788/';
const VARIANTES = [
  { nombre: 'movil-320',      ancho: 320,  alto: 720,  movimiento: 'no-preference' },
  { nombre: 'movil-390',      ancho: 390,  alto: 844,  movimiento: 'no-preference' },
  { nombre: 'tablet-768',     ancho: 768,  alto: 1024, movimiento: 'no-preference' },
  { nombre: 'escritorio-1440',ancho: 1440, alto: 900,  movimiento: 'no-preference' },
  { nombre: 'sin-movimiento', ancho: 1440, alto: 900,  movimiento: 'reduce' },
];

/* Por defecto van a una carpeta temporal. CAPTURAS fija la ruta, que es lo
   que necesita el CI para poder subirlas como artefacto cuando algo falla:
   una violación de axe sin la captura obliga a reproducirla a mano. */
const salida = process.env.CAPTURAS
  ? (await fs.mkdir(process.env.CAPTURAS, { recursive: true }), process.env.CAPTURAS)
  : await fs.mkdtemp(path.join(os.tmpdir(), 'capturas-'));
/* CHROMIUM apunta a un Chromium ya instalado, para no bajar el que trae
   Playwright. Sin la variable usa el suyo, que es lo normal. */
const navegador = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
let fallas = 0;

for (const v of VARIANTES) {
  const ctx = await navegador.newContext({
    viewport: { width: v.ancho, height: v.alto },
    reducedMotion: v.movimiento,
  });
  const pagina = await ctx.newPage();
  await pagina.goto(URL, { waitUntil: 'networkidle' });

  const { violations } = await new AxeBuilder({ page: pagina })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  await pagina.screenshot({ path: path.join(salida, v.nombre + '.png'), fullPage: true });

  if (violations.length === 0) {
    console.log(`✓ ${v.nombre}`);
  } else {
    fallas += violations.length;
    console.log(`✗ ${v.nombre} — ${violations.length} problema(s)`);
    for (const p of violations) {
      console.log(`    [${p.impact}] ${p.id}: ${p.help}`);
      for (const n of p.nodes.slice(0, 3)) console.log(`      ${n.target.join(' ')}`);
    }
  }
  await ctx.close();
}

await navegador.close();
console.log(`\ncapturas en ${salida}`);
process.exit(fallas ? 1 : 0);
