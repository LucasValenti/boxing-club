/* Levanta el servidor, corre todas las pruebas y lo baja.
   ────────────────────────────────────────────────────────────────────────
   Existe por una razón sola: hasta acá había que abrir dos terminales y
   acordarse de tres comandos, y una prueba con esa fricción se deja de
   correr. Ahora es `npm test`, y `predeploy` lo dispara solo antes de
   publicar, así que olvidarse deja de ser posible.
   Uso:  npm test                                                          */
import { spawn } from 'child_process';

const PRUEBAS = [
  ['validar.mjs',     'HTML, datos, búsqueda y peso'],
  ['contacto.mjs',    'el contacto sale todo de NEGOCIO'],
  ['interaccion.mjs', 'teclado, menú y formulario'],
  ['auditoria.mjs',   'accesibilidad en 5 variantes'],
];

const servidor = spawn('node', ['herramientas/servidor.mjs'], { stdio: 'ignore' });
const bajar = () => { try { servidor.kill(); } catch {} };
process.on('exit', bajar);
process.on('SIGINT', () => { bajar(); process.exit(130); });

/* Esperar a que escuche, sin dormir a ciegas una cantidad inventada. */
let vivo = false;
for (let i = 0; i < 60 && !vivo; i++) {
  try { await fetch('http://127.0.0.1:8788/'); vivo = true; }
  catch { await new Promise((r) => setTimeout(r, 100)); }
}
if (!vivo) {
  console.error('El servidor de pruebas no levantó en el puerto 8788.');
  bajar();
  process.exit(1);
}

const fallaron = [];
for (const [archivo, que] of PRUEBAS) {
  console.log(`\n\u2500\u2500 ${archivo}  \u00b7  ${que}`);
  const codigo = await new Promise((r) =>
    spawn('node', ['herramientas/' + archivo], { stdio: 'inherit' }).on('close', r));
  if (codigo !== 0) fallaron.push(archivo);
}

bajar();
console.log(fallaron.length
  ? `\n\u2717 Falló: ${fallaron.join(', ')}\n`
  : `\n\u2713 Las ${PRUEBAS.length} pruebas pasaron.\n`);
process.exit(fallaron.length ? 1 : 0);
