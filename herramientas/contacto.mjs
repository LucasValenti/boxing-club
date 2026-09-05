/* Prueba que los datos de contacto salgan todos de NEGOCIO.
   Es la garantía de la decisión de arquitectura: el teléfono no está
   confirmado y va a cambiar; si alguien vuelve a escribirlo a mano en el
   HTML, esto lo encuentra.
   Necesita el servidor levantado:  node herramientas/servidor.mjs          */
import { chromium } from 'playwright';

const FALSO = { whatsapp: '5490000000000', telefono: '+5490000000000',
  telefonoVisible: '000 000-0000', direccion: 'Calle Falsa 123',
  email: 'prueba@ejemplo.com' };

const navegador = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
const pagina = await navegador.newPage();

/* Se reemplazan los valores en el momento en que datos.js define NEGOCIO,
   antes de que app.js (que va con defer) los lea. */
await pagina.addInitScript((falso) => {
  Object.defineProperty(window, 'NEGOCIO', {
    configurable: true,
    set(v) { this._n = Object.assign(v, falso); },
    get() { return this._n; },
  });
}, FALSO);

await pagina.goto('http://127.0.0.1:8788/', { waitUntil: 'networkidle' });

const visto = await pagina.evaluate(() => ({
  'WhatsApp del header':  document.querySelector('.nav .nav__cta').href,
  'WhatsApp del menú':    document.querySelector('.menu-panel .nav__cta').href,
  'link de teléfono':     document.querySelector('[data-negocio="telefono"]').href,
  'teléfono visible':     document.querySelector('[data-negocio="telefono"]').textContent.trim(),
  'email':                document.querySelector('[data-negocio="email"]').textContent.trim(),
  'dirección':            document.querySelector('[data-negocio="direccion"]').textContent.trim(),
}));

const esperado = {
  'WhatsApp del header':  (v) => v.includes(FALSO.whatsapp) && v.includes('text='),
  'WhatsApp del menú':    (v) => v.includes(FALSO.whatsapp) && v.includes('text='),
  'link de teléfono':     (v) => v === 'tel:' + FALSO.telefono,
  'teléfono visible':     (v) => v === FALSO.telefonoVisible,
  'email':                (v) => v === FALSO.email,
  'dirección':            (v) => v === FALSO.direccion,
};

let fallas = 0;
for (const [que, valor] of Object.entries(visto)) {
  const bien = esperado[que](valor);
  if (!bien) fallas++;
  console.log(`${bien ? '✓' : '✗'} ${que.padEnd(20)} ${valor}`);
}

await navegador.close();
console.log(fallas
  ? `\n${fallas} lugar(es) con el dato escrito a mano — tienen que salir de NEGOCIO`
  : '\nTodo el contacto sale de NEGOCIO.');
process.exit(fallas ? 1 : 0);
