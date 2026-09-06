/* Revisa el HTML sin abrir un navegador y sin dependencias: corre con node
   pelado, en un clon recién bajado, antes de instalar nada.
   ────────────────────────────────────────────────────────────────────────
   No pretende validar HTML como el W3C. Chequea lo que se rompe en ESTE
   sitio y que ninguna otra herramienta mira: que las anclas del nav tengan
   destino, que los data-negocio existan en NEGOCIO, que el JSON-LD parsee y
   que el peso propio siga dentro del presupuesto.
   Uso:  node herramientas/validar.mjs                                     */
import fs from 'fs';
import path from 'path';

const RAIZ = 'public';
const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
/* Casi todo se mira sobre el HTML sin comentarios: lo comentado no existe
   para el navegador, y confundirlos fue justo el error del data-flag. */
const vivo = html.replace(/<!--[\s\S]*?-->/g, '');

let fallas = 0;
const ok  = (m) => console.log('  \u2713 ' + m);
const mal = (m) => { fallas++; console.log('  \u2717 ' + m); };

console.log('\nEstructura');

/* Un comentario sin cerrar se traga el resto del head sin avisar. Ya pasó. */
const abre = (html.match(/<!--/g) || []).length;
const cierra = (html.match(/-->/g) || []).length;
abre === cierra ? ok(`comentarios balanceados (${abre})`)
                : mal(`comentarios sin balancear: ${abre} <!-- y ${cierra} -->`);

const h1 = (vivo.match(/<h1[\s>]/g) || []).length;
h1 === 1 ? ok('un solo <h1>') : mal(`hay ${h1} <h1>, tiene que haber uno`);

/* El nav es todo anclas: un id mal escrito es un botón que no hace nada. */
const anclas = [...new Set([...vivo.matchAll(/href="#([^"]+)"/g)].map(m => m[1]))];
const rotas = anclas.filter(a => !new RegExp(`id="${a}"`).test(vivo));
rotas.length ? mal(`anclas sin destino: ${rotas.map(a => '#' + a).join(', ')}`)
             : ok(`${anclas.length} anclas internas, todas con destino`);

console.log('\nImágenes');

/* width y height explícitos son lo que evita el salto de layout sin JS. */
const imgs = [...vivo.matchAll(/<img\b[^>]*>/g)].map(m => m[0]);
const sinMedidas = imgs.filter(i => !/width="\d+"/.test(i) || !/height="\d+"/.test(i));
const sinAlt = imgs.filter(i => !/\balt="/.test(i));
sinMedidas.length ? mal(`${sinMedidas.length} <img> sin width/height`)
                  : ok(`${imgs.length} imágenes, todas con medidas`);
sinAlt.length ? mal(`${sinAlt.length} <img> sin atributo alt`)
              : ok('todas con alt (vacío en las decorativas)');

console.log('\nFormulario');

/* Un label cuyo for no apunta a nada deja el campo sin nombre accesible. */
const labels = [...vivo.matchAll(/<label for="([^"]+)"/g)].map(m => m[1]);
const huerfanos = labels.filter(f => !new RegExp(`id="${f}"`).test(vivo));
huerfanos.length ? mal(`label for sin campo: ${huerfanos.join(', ')}`)
                 : ok(`${labels.length} labels, todos apuntando a un campo`);

console.log('\nDatos de contacto');

/* Los data-negocio que app.js no sabe resolver quedan con el valor escrito
   a mano en el markup, que es exactamente lo que NEGOCIO vino a evitar. */
const datos = fs.readFileSync(path.join(RAIZ, 'sitio', 'datos.js'), 'utf8');
const bloque = datos.slice(datos.indexOf('window.NEGOCIO'), datos.indexOf('window.MOSTRAR'));
const campos = [...bloque.matchAll(/^\s{2}(\w+):/gm)].map(m => m[1]);
const especiales = ['whatsapp', 'telefono', 'email', 'mapa'];
const usados = [...new Set([...vivo.matchAll(/data-negocio="([^"]+)"/g)].map(m => m[1]))];
const desconocidos = usados.filter(u => !campos.includes(u) && !especiales.includes(u));
desconocidos.length ? mal(`data-negocio que NEGOCIO no define: ${desconocidos.join(', ')}`)
                    : ok(`${usados.length} campos usados, todos definidos en NEGOCIO`);

console.log('\nBúsqueda');

const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
ld.forEach((m, i) => {
  try { ok(`JSON-LD ${i + 1}: ${JSON.parse(m[1])['@type']}`); }
  catch (e) { mal(`JSON-LD ${i + 1} no parsea: ${e.message}`); }
});
if (!ld.length) mal('no hay bloques JSON-LD');

const titulo = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
titulo.length && titulo.length <= 65
  ? ok(`<title> de ${titulo.length} caracteres`)
  : mal(`<title> de ${titulo.length} caracteres — conviene entre 1 y 65`);

const desc = (html.match(/name="description" content="([^"]*)"/) || [])[1] || '';
desc.length >= 70 && desc.length <= 165
  ? ok(`description de ${desc.length} caracteres`)
  : mal(`description de ${desc.length} caracteres — conviene entre 70 y 165`);

/rel="canonical"/.test(vivo) ? ok('canonical presente')
                             : mal('falta <link rel="canonical">');
/<html lang="/.test(html) ? ok('lang declarado') : mal('falta lang en <html>');

console.log('\nPeso propio');

/* El presupuesto es lo que se sirve desde este dominio. Las fotos externas
   no se cuentan acá — se van cuando entren las del club. */
const PRESUPUESTO = 500 * 1024;
const pesar = (p) => fs.readdirSync(p, { withFileTypes: true }).reduce((t, e) => {
  const f = path.join(p, e.name);
  return t + (e.isDirectory() ? pesar(f) : fs.statSync(f).size);
}, 0);

const partes = {
  'index.html': fs.statSync(path.join(RAIZ, 'index.html')).size,
  'tokens/': pesar(path.join(RAIZ, 'tokens')),
  'base/': pesar(path.join(RAIZ, 'base')),
  'sitio/': pesar(path.join(RAIZ, 'sitio')),
  'fonts/': pesar(path.join(RAIZ, 'fonts')),
};
let total = 0;
for (const [n, b] of Object.entries(partes)) {
  total += b;
  console.log(`    ${n.padEnd(14)} ${(b / 1024).toFixed(1).padStart(7)} KB`);
}
console.log(`    ${'total'.padEnd(14)} ${(total / 1024).toFixed(1).padStart(7)} KB`);
total <= PRESUPUESTO
  ? ok(`dentro del presupuesto de ${PRESUPUESTO / 1024} KB`)
  : mal(`se pasó del presupuesto de ${PRESUPUESTO / 1024} KB`);

console.log(fallas ? `\n${fallas} problema(s).\n` : '\nTodo en orden.\n');
process.exit(fallas ? 1 : 0);
