---
nombre: Plantilla landing gimnasio de boxeo
tipo: plantilla
stack: estatico
---
# Plantilla de landing para gimnasio de boxeo

Landing de una página en HTML, CSS y JS sin build, con todo el contenido de ejemplo para adaptar a cualquier club. Se publica en Cloudflare o en Apache.

## Construcción · 50 %
- [x] Wireframes, arquitectura y esqueleto andando (063400d, docs/arquitectura.md, docs/wireframes/)
- [x] Las trece secciones, con tipografías propias sin Google (adb8cb2)
- [x] Plantilla genérica sin datos de ningún club, en el repo y en la página (b403177, e832247)
- [x] Secciones a pantalla completa, hero animado y videos en la tira (ddfbb4a, b815d8e)

## Calidad · 30 %
- [x] Auditoría técnica: once de doce hallazgos cerrados (docs/auditoria-tecnica.md)
- [x] `npm test` con validación, contacto, interacción y axe, y CI en cada push (.github/workflows/pruebas.yml, 9a273c6)
- [x] LCP medido contra el sitio publicado (2b05190, docs/auditoria-tecnica.md §6)

## Lista para usar · 20 %
- [x] Guía de adaptación por archivo (README.md)
- [x] Checklist de contenido para pedirle al club y orden de lanzamiento (docs/contenido-pendiente.md, docs/lanzamiento.md, e9da16f)
- [x] Dos destinos de publicación: Cloudflare y Apache (8bb658b)

## Continuo · 0 %
- [ ] og:image por club: es el único hallazgo abierto y necesita una foto del club (docs/auditoria-tecnica.md)
- [ ] Analítica de Cloudflare, que necesita un token del panel (docs/auditoria-tecnica.md)
- [ ] Mantener las dependencias al día con Dependabot (6a2a2ee)
