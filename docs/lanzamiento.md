# Lanzamiento en Cloudflare

El orden en que hay que hacer las cosas para que un club pase de «aprobado» a
«publicado». Está ordenado por dependencia, no por importancia: cada paso
necesita que el anterior esté hecho.

`docs/contenido-pendiente.md` dice **qué pedirle al cliente**. Este documento
dice **qué hacer con eso una vez que llegó**.

---

## Antes de empezar

Dos decisiones que conviene tener cerradas por escrito, porque cambiarlas
después es caro:

**¿A nombre de quién va el dominio?** Lo sano es que esté a nombre del club y
lo pague el club, aunque lo compres vos. Un dominio a tu nombre convierte
cualquier desacuerdo futuro en una discusión sobre quién se queda con la
dirección, y esa discusión no la querés tener.

**¿Con o sin `www`?** Son dos direcciones distintas para Google. Se elige una
y la otra redirige. Sin `www` es lo que la gente escribe de memoria y lo que
entra en un cartel sin verse raro.

---

## 1. La cuenta y el dominio

1. Crear la cuenta de Cloudflare, con **verificación en dos pasos activada**.
   Esa cuenta va a tener el control del sitio y del DNS: sin 2FA, una
   contraseña filtrada es el sitio del cliente apuntando a otro lado.
2. Comprar el dominio. Si es `.com`, Cloudflare Registrar lo vende a precio de
   costo y queda todo en el mismo panel. Si es `.com.ar`, se registra en
   **NIC Argentina** (pide CUIT) y después se apuntan los nameservers a
   Cloudflare.
3. Si el dominio se compró afuera: agregar el sitio en Cloudflare y cambiar los
   nameservers en el panel del registrador. Tarda de minutos a un día. No se
   puede apurar.
4. Activar la **renovación automática** y el bloqueo de transferencia. Un
   dominio que vence es un sitio que desaparece sin aviso.

## 2. El contenido del club

Todo lo de `docs/contenido-pendiente.md`. Lo que bloquea publicar:

- Los datos reales en `public/sitio/datos.js` — teléfono, WhatsApp, dirección,
  email, horarios.
- Las fotos del club en `herramientas/fotos-crudas/` y después `npm run
  imagenes`, que las procesa a WebP en tres anchos.
- Los dos videos del club reemplazando a `public/video/*.mp4`, con el póster
  regenerado.
- Los precios de los tres planes, o `mostrarPrecios: false` para publicar sin
  esa sección.

Al reemplazar las fotos de banco hay que sacar **las tres cosas juntas**: el
`<img>` de Unsplash, el `preconnect` del `<head>` y el permiso a
`images.unsplash.com` en la CSP de `_headers` y de `.htaccess`. `npm test`
avisa cuál quedó colgado.

## 3. El dominio en el código

El dominio vive en cuatro lugares y tienen que coincidir entre sí:

| Archivo | Qué cambiar |
|---|---|
| `public/index.html` | `<link rel="canonical">` y `og:url` |
| `public/robots.txt` | la línea `Sitemap:` |
| `public/sitemap.xml` | el `<loc>` y el `<lastmod>` |

```
npm test    # falla si los cuatro no coinciden
```

## 4. La ficha del negocio

Con la dirección y el teléfono ya confirmados, descomentar el bloque
`SportsActivityLocation` del `<head>` de `public/index.html` y completar los
cinco valores. Es lo que arma la ficha del local en los resultados de Google.

Va **después** de tener los datos confirmados y no antes: corregir datos
estructurados publicados tarda semanas en propagarse.

## 5. Publicar

```
npx wrangler login      # la primera vez
npm run deploy          # corre npm test solo antes de subir
```

Después, en el panel de Cloudflare → el Worker → Settings → Domains & Routes →
**Add Custom Domain**. El certificado SSL lo emite Cloudflare solo.

Para que la otra variante redirija (con o sin `www`, la que no elegiste), se
arma una **Redirect Rule** en el panel del dominio. Es gratis y son dos campos.

## 6. Verificar lo que no se ve

Una cabecera que no llega no avisa. Después del primer deploy:

```
curl -D - -o /dev/null -s https://<dominio>/
```

Tienen que estar `content-security-policy`, `x-content-type-options`,
`referrer-policy`, `permissions-policy` y `strict-transport-security`.

Y que el `.htaccess` no se esté sirviendo, que en Cloudflare no sirve para nada
y solo regala la configuración:

```
curl -D - -o /dev/null -s https://<dominio>/.htaccess    # tiene que dar 404
```

Y que la 404 sea de verdad una 404 y no un 200 con cara de error:

```
curl -D - -o /dev/null -s https://<dominio>/no-existe    # tiene que dar 404
```

## 7. Medir

```
node herramientas/rendimiento.mjs https://<dominio>/
```

Mide el LCP real con la red y la CPU estranguladas al perfil móvil. El objetivo
es **menos de 2,5 s**. Si se pasa, casi siempre es la foto del hero: se
reprocesa con `npm run imagenes` y se vuelve a medir.

Este número es lo que conviene mostrarle al cliente. Es la diferencia entre
«quedó lindo» y «carga más rápido que el de la competencia», y es verificable.

## 8. Lo que va afuera del sitio

- **Cloudflare Web Analytics**: se saca el token del panel y se pega el script.
  No usa cookies, así que no hace falta banner de consentimiento.
- **Ficha de Google Business**: es lo que más mueve la búsqueda local, más que
  cualquier cosa que se haga en la página. Abrirla o reclamarla en paralelo.
- **Google Search Console**: verificar el dominio y mandar el `sitemap.xml`.

---

## Después de publicar

Un repaso corto a la semana: que las consultas estén llegando al WhatsApp que
el club atiende de verdad, que la ficha de Google muestre los horarios bien, y
volver a correr `rendimiento.mjs` si entraron fotos nuevas.
