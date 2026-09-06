/* Mide el contraste del texto que va sobre una foto.
   ────────────────────────────────────────────────────────────────────────
   axe no puede con esto: sabe leer un color contra otro color, no contra
   una imagen, así que el hero le queda como «incompleto» y nadie lo mira.
   Y es justo donde más duele: el párrafo del hero llegó a 1.06:1 en mobile
   —invisible— porque al portar el prototipo se perdieron dos z-index y el
   velo diagonal quedó debajo de la foto.

   Cómo: se esconde el texto, se fotografía lo que hay atrás y se calcula la
   luminancia píxel por píxel. Se mide contra el 2% más claro del fondo y no
   contra el promedio, porque una línea ilegible sobre una zona clara ya
   arruina el párrafo aunque el resto se lea.

   Necesita el servidor levantado:  node herramientas/servidor.mjs         */
import { chromium } from 'playwright';
import sharp from 'sharp';

const SITIO = 'http://127.0.0.1:8788/';
const MINIMO = 4.5;   // WCAG AA para texto normal

/* Luminancia relativa, tal como la define la norma. */
const lum = (r, g, b) => {
  const c = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

/* Cada caso: qué texto se mide y qué se esconde para ver el fondo. El color
   NO se escribe acá: se lee del elemento con getComputedStyle. Escribirlo a
   mano hacía que la prueba siguiera midiendo el color viejo después de
   cambiar el CSS, y una prueba que no ve los cambios miente. */
const CASOS = [
  { sel: '.hero__texto', tapar: '.hero__cuerpo', que: 'párrafo del hero' },
  { sel: '.hero__lugar', tapar: '.hero__cuerpo', que: 'rótulo del hero' },
];
const PANTALLAS = [['escritorio', 1440, 900], ['mobile', 390, 844]];

let fallas = 0;
const navegador = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });

for (const [nombre, ancho, alto] of PANTALLAS) {
  console.log('\n' + nombre + ' (' + ancho + 'x' + alto + ')');
  const ctx = await navegador.newContext({ viewport: { width: ancho, height: alto } });
  const pagina = await ctx.newPage();
  await pagina.goto(SITIO, { waitUntil: 'networkidle' });
  await pagina.waitForTimeout(900);

  for (const caso of CASOS) {
    const medida = await pagina.evaluate((s) => {
      const e = document.querySelector(s);
      if (!e) return null;
      const r = e.getBoundingClientRect();
      return {
        x: Math.round(r.x), y: Math.round(r.y),
        width: Math.round(r.width), height: Math.round(r.height),
        color: getComputedStyle(e).color,
      };
    }, caso.sel);
    if (!medida || medida.width < 2 || medida.height < 2) {
      console.log('  \u2717 ' + caso.que + ': no se encontró ' + caso.sel);
      fallas++;
      continue;
    }
    const caja = { x: medida.x, y: medida.y, width: medida.width, height: medida.height };
    const rgb = medida.color.match(/(\d+)[,\s]+(\d+)[,\s]+(\d+)/);
    const lTexto = lum(+rgb[1], +rgb[2], +rgb[3]);

    const esconder = await pagina.addStyleTag({ content: caso.tapar + '{visibility:hidden!important}' });
    await pagina.waitForTimeout(150);
    const png = await pagina.screenshot({ clip: caja });
    await esconder.evaluate((n) => n.remove());

    const { data, info } = await sharp(png).raw().toBuffer({ resolveWithObject: true });
    const ls = [];
    for (let i = 0; i < data.length; i += info.channels) ls.push(lum(data[i], data[i + 1], data[i + 2]));
    ls.sort((a, b) => a - b);

    const r = ratio(lTexto, ls[Math.floor(ls.length * 0.98)]);
    if (r >= MINIMO) {
      console.log('  \u2713 ' + caso.que + ': ' + r.toFixed(2) + ':1');
    } else {
      fallas++;
      console.log('  \u2717 ' + caso.que + ': ' + r.toFixed(2) + ':1 sobre la zona más clara de la foto' +
        ' \u2014 la norma pide ' + MINIMO);
    }
  }
  await ctx.close();
}

await navegador.close();
console.log(fallas ? '\n' + fallas + ' problema(s).\n' : '\nTodo en orden.\n');
process.exit(fallas ? 1 : 0);
