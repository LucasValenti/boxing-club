/* Mide el LCP real contra el sitio publicado, con la red y la CPU
   estranguladas para simular un celular de gama media en un 4G cargado.
   ────────────────────────────────────────────────────────────────────────
   El presupuesto de la auditoría (<2,5s) nunca se había medido en
   condiciones reales — «falta medirlo en red real» quedó anotado en
   docs/auditoria-tecnica.md §1. Ahora que el sitio está desplegado, esto lo
   hace posible.

   Los valores de red y CPU son el perfil móvil por defecto de Lighthouse:
   150ms de latencia, 1.6 Mbps de bajada, CPU 4x más lenta que la de esta
   máquina. No son un invento: son los que usa la herramienta que Google
   toma como referencia para Core Web Vitals.

   El LCP se lee con el mismo PerformanceObserver que usa el navegador para
   reportarlo a los propios Core Web Vitals, no con un cronómetro externo.

   Uso:  node herramientas/rendimiento.mjs <URL>                           */
import { chromium } from 'playwright';

const URL = process.argv[2];
if (!URL) {
  console.error('uso: node herramientas/rendimiento.mjs <URL>');
  console.error('ejemplo: node herramientas/rendimiento.mjs https://tu-worker.workers.dev/');
  process.exit(1);
}

const PRESUPUESTO_MS = 2500;
const RED = {
  offline: false,
  latency: 150,                          // ida y vuelta, en ms
  downloadThroughput: 1.6 * 1024 * 1024 / 8,  // 1.6 Mbps, en bytes/s
  uploadThroughput: 750 * 1024 / 8,           // 750 Kbps, en bytes/s
};
const CPU_LENTITUD = 4;   // 4x más lenta, el default móvil de Lighthouse

const navegador = await chromium.launch();
const ctx = await navegador.newContext({
  viewport: { width: 390, height: 844 },
  userAgent: 'Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
});
const pagina = await ctx.newPage();

/* El LCP puede seguir actualizándose hasta la primera interacción del
   usuario; se instala el observer ANTES de navegar para no perderse el
   primer candidato. */
await pagina.addInitScript(() => {
  window.__lcp = 0;
  try {
    new PerformanceObserver((lista) => {
      const entradas = lista.getEntries();
      const ultima = entradas[entradas.length - 1];
      if (ultima) window.__lcp = ultima.startTime;
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  } catch { /* el navegador no soporta LCP: queda en 0 y se avisa abajo */ }
});

const cdp = await ctx.newCDPSession(pagina);
await cdp.send('Network.enable');
await cdp.send('Network.emulateNetworkConditions', RED);
await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU_LENTITUD });

console.log(`Simulando 4G (${RED.latency}ms, ${(RED.downloadThroughput * 8 / 1024 / 1024).toFixed(1)} Mbps) `
  + `+ CPU ${CPU_LENTITUD}x más lenta, sobre ${URL}\n`);

const inicio = Date.now();
await pagina.goto(URL, { waitUntil: 'load', timeout: 60000 });
const cargaTotal = Date.now() - inicio;
/* Un respiro después del load para que el LCP se asiente antes de leerlo. */
await pagina.waitForTimeout(1000);
const lcp = await pagina.evaluate(() => window.__lcp);

console.log('carga completa (evento load): ' + cargaTotal + ' ms');
if (lcp > 0) {
  console.log('LCP: ' + lcp.toFixed(0) + ' ms');
  console.log(lcp <= PRESUPUESTO_MS
    ? '\u2713 dentro del presupuesto de ' + PRESUPUESTO_MS + 'ms'
    : '\u2717 por encima del presupuesto de ' + PRESUPUESTO_MS + 'ms');
} else {
  console.log('\u2717 no se pudo leer el LCP (el navegador no reportó ninguna entrada)');
}

await navegador.close();
process.exit(lcp > 0 && lcp <= PRESUPUESTO_MS ? 0 : 1);
