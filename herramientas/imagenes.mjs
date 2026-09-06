/* Las fotos del club → WebP, en los tres anchos que pide el sitio.
   ────────────────────────────────────────────────────────────────────────
   Entra:  herramientas/fotos-crudas/*.jpg   (los originales, no se versionan)
   Sale:   public/img/<nombre>-<ancho>.webp  (lo que se publica)
   Uso:    npm run imagenes

   Existe para que el día que lleguen las fotos —que es el día de más
   apuro— no haya que inventar el pipeline.                                */
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const ENTRADA = 'herramientas/fotos-crudas';
const SALIDA  = 'public/img';
/* 400 para la tira en el celular, 800 para tablet, 1600 para el hero en
   escritorio. Más anchos no se notan y pesan. */
const ANCHOS = [400, 800, 1600];

await fs.mkdir(SALIDA, { recursive: true });
await fs.mkdir(ENTRADA, { recursive: true });

const fotos = (await fs.readdir(ENTRADA)).filter((f) => /\.(jpe?g|png|tiff?)$/i.test(f));
if (!fotos.length) {
  console.log(`\nNo hay fotos en ${ENTRADA}/ — poné ahí los originales del club,`);
  console.log('lo más grandes que los tenga, y volvé a correr esto.\n');
  process.exit(0);
}

let total = 0;
for (const foto of fotos) {
  const nombre = path.basename(foto, path.extname(foto))
    .toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  console.log(`\n${foto}`);

  for (const ancho of ANCHOS) {
    const destino = path.join(SALIDA, `${nombre}-${ancho}.webp`);
    /* withoutEnlargement: si el original es más chico que el ancho pedido
       no lo estira — saldría borroso y encima pesando más. */
    const { size, width } = await sharp(path.join(ENTRADA, foto))
      .resize({ width: ancho, withoutEnlargement: true })
      .webp({ quality: 72 })
      .toFile(destino);
    total += size;
    console.log(`  ${path.basename(destino).padEnd(36)} ${width}px  ${(size / 1024).toFixed(0)} KB`);
  }
}

console.log(`\n${fotos.length} foto(s) → ${SALIDA}/ · ${(total / 1024).toFixed(0)} KB en total`);
console.log('Acordate del srcset y del sizes en index.html — ver docs/auditoria-tecnica.md §5.9\n');
