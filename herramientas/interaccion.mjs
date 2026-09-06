/* Lo que axe no puede ver: el recorrido con teclado y el formulario.
   axe inspecciona el documento parado; esto lo recorre.
   Necesita el servidor levantado:  node herramientas/servidor.mjs         */
import { chromium } from 'playwright';

/* Ojo: no llamarla URL — pisaría el constructor global que se usa abajo. */
const SITIO = 'http://127.0.0.1:8788/';
let fallas = 0;
const ok  = (m) => console.log('  \u2713 ' + m);
const mal = (m) => { fallas++; console.log('  \u2717 ' + m); };

const navegador = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });

/* Un contexto por prueba: el formulario deja estado (el aviso, el foco) y
   arrastrarlo entre pruebas es la forma más común de que una pase por lo
   que hizo la anterior. */
async function pagina(ancho = 1440, alto = 900, init) {
  const ctx = await navegador.newContext({ viewport: { width: ancho, height: alto } });
  const p = await ctx.newPage();
  if (init) await p.addInitScript(init);
  await p.goto(SITIO, { waitUntil: 'load' });
  return { p, cerrar: () => ctx.close() };
}

console.log('\nTeclado');
{
  const { p, cerrar } = await pagina();

  await p.keyboard.press('Tab');
  const primero = await p.evaluate(() => document.activeElement.className);
  primero.includes('saltar')
    ? ok('el primer Tab da el salto al contenido')
    : mal(`el primer Tab cae en "${primero}", no en el salto al contenido`);

  /* El foco tiene que avanzar en el orden del documento. Si retrocede, es
     que algo tiene tabindex positivo o el layout reordenó lo tabulable. */
  const orden = [];
  for (let i = 0; i < 14; i++) {
    orden.push(await p.evaluate(() => {
      const foco = document.activeElement;
      const todos = [...document.querySelectorAll(
        'a[href],button,input,select,textarea,[tabindex]:not([tabindex="-1"])')];
      return todos.indexOf(foco);
    }));
    await p.keyboard.press('Tab');
  }
  const retrocesos = orden.filter((v, i) => i && v !== -1 && orden[i - 1] !== -1 && v < orden[i - 1]);
  retrocesos.length ? mal(`el foco retrocede ${retrocesos.length} vez/veces en los primeros 14 Tab`)
                    : ok('el foco avanza en el orden del documento');

  await cerrar();
}

console.log('\nMenú en mobile');
{
  const { p, cerrar } = await pagina(390, 844);
  const boton = p.locator('[data-menu-boton]');
  const panel = p.locator('[data-menu-panel]');

  await boton.click();
  await panel.isVisible() && await boton.getAttribute('aria-expanded') === 'true'
    ? ok('abre y anuncia aria-expanded="true"')
    : mal('no abre o no actualiza aria-expanded');

  await p.keyboard.press('Escape');
  const cerrado = await boton.getAttribute('aria-expanded') === 'false';
  const focoVuelve = await p.evaluate(() =>
    document.activeElement.hasAttribute('data-menu-boton'));
  cerrado ? ok('Escape lo cierra') : mal('Escape no lo cierra');
  focoVuelve ? ok('y el foco vuelve al botón')
             : mal('el foco no vuelve al botón: queda perdido en el documento');

  await cerrar();
}

console.log('\nFormulario');
{
  /* Se simula que WhatsApp abrió, para leer con qué URL lo llamaron. */
  const { p, cerrar } = await pagina(1440, 900, () => {
    window.__abierto = null;
    window.open = (u) => { window.__abierto = u; return {}; };
  });

  await p.locator('[data-reserva] button[type="submit"]').click();
  const aviso = (await p.locator('[data-reserva-aviso]').textContent()).trim();
  const focoEnNombre = await p.evaluate(() => document.activeElement.id === 'r-nombre');
  const invalido = await p.locator('#r-nombre').getAttribute('aria-invalid');

  aviso ? ok(`vacío: avisa «${aviso}»`) : mal('vacío: no dice nada');
  focoEnNombre ? ok('y manda el foco al primer campo que falta')
               : mal('el foco no va al campo que falta');
  invalido === 'true' ? ok('y lo marca con aria-invalid') : mal('no marca aria-invalid');

  await p.fill('#r-nombre', 'Ana Pérez');
  await p.fill('#r-tel', '341 555-1234');
  await p.selectOption('#r-clase', { label: 'Box fitness' });
  await p.locator('[data-reserva] button[type="submit"]').click();

  const abierto = await p.evaluate(() => window.__abierto);
  if (!abierto) {
    mal('completo: no llamó a window.open');
  } else {
    const texto = decodeURIComponent(new URL(abierto).searchParams.get('text') || '');
    /^https:\/\/wa\.me\/\d+/.test(abierto) ? ok('completo: abre wa.me')
                                           : mal(`abre una URL rara: ${abierto}`);
    texto.includes('Ana Pérez') && texto.includes('341 555-1234') && texto.includes('Box fitness')
      ? ok('con el nombre, el teléfono y la clase en el mensaje')
      : mal(`el mensaje no lleva los datos: ${JSON.stringify(texto)}`);
  }
  await cerrar();
}

console.log('\nFormulario con las ventanas bloqueadas');
{
  /* Un navegador embebido —el de Instagram, por ejemplo— devuelve null. */
  const { p, cerrar } = await pagina(1440, 900, () => { window.open = () => null; });

  await p.fill('#r-nombre', 'Ana Pérez');
  await p.fill('#r-tel', '341 555-1234');
  await p.locator('[data-reserva] button[type="submit"]').click();

  const link = p.locator('[data-reserva-aviso] a');
  if (await link.count()) {
    const href = await link.getAttribute('href');
    ok('deja un link a WhatsApp en vez de mentir');
    /^https:\/\/wa\.me\//.test(href) ? ok('apuntando a wa.me con el mensaje')
                                     : mal(`el link apunta a ${href}`);
    await p.evaluate(() => document.activeElement.tagName === 'A')
      ? ok('y el foco queda en el link') : mal('el foco no va al link');
  } else {
    mal('no deja nada: la consulta escrita se pierde');
  }
  await cerrar();
}

await navegador.close();
console.log(fallas ? `\n${fallas} problema(s).\n` : '\nTodo en orden.\n');
process.exit(fallas ? 1 : 0);
