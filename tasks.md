# tasks.md

## Parte 1 — Extractor de fotogramas (hecho)

- [x] T0. Instalar ffmpeg (`winget install --id Gyan.FFmpeg -e`) y verificar `ffmpeg -version` y `ffprobe -version` (lo hace el usuario).
- [x] T1. Añadir `/videos` y `/candidatas` a `.gitignore`.
- [x] T2. Añadir `"frames": "node scripts/extract-frames.mts"` a `package.json`.
- [x] T3. Crear `scripts/extract-frames.mts` con los tipos y las constantes (rutas, porcentajes, 1600, calidad 80).
- [x] T4. `slugify` + `assignSlugs` (anti-colisión).
- [x] T5. `run` (execFile promisificado) + comprobación de ffmpeg/ffprobe con mensaje de instalación.
- [x] T6. `probeDuration` y `extractFrame` (escritura en `.tmp.webp` y renombrado).
- [x] T7. `processVideo`: idempotencia, extracción de 4 fotogramas, limpieza de `.tmp.webp` si falla.
- [x] T8. `renderContactSheet`: HTML estático agrupado por vídeo, con escape de HTML.
- [x] T9. `main`: escaneo de `/videos`, bucle secuencial con try/catch, resumen y código de salida.
- [x] T10. Verificación: `tsc --noEmit`, y búsqueda de `any` y `@ts-ignore` en el script.
- [x] T11. Prueba real con 2–3 vídeos, y después con todos. Confirmar la segunda ejecución (todo saltado).
- [x] T12. Prueba de fallo: un archivo `.mp4` corrupto no debe detener el proceso.
- [x] T13. Revisión del `index.html` en el navegador (rejilla, nombres, rutas relativas).

## Parte 2 — Sección "Vídeos de obras" (cada tarea espera tu visto bueno antes de pasar a la siguiente)

### Script
- [x] V1. Añadir `/videos-seleccionados` a `.gitignore` y `"videos": "node scripts/process-videos.mts"` a `package.json`.
- [x] V2. Extraer `slugify` + `buildJobs` a `scripts/lib/slug.mts` (parametrizado por carpeta) y adaptar `extract-frames.mts`; comprobar que `npm run frames` sigue saltando todo.
- [x] V3. Crear `process-videos.mts` con tipos, constantes y comprobación previa de ffmpeg/ffprobe/carpetas.
- [x] V4. Lógica pura: `parseCropdetect`, `pickCrop` (umbral 5 %), `buildVideoFilter`, `formatMegabytes`.
- [x] V5. `detectCrop` y `probeDuration` (dimensiones tras rotación).
- [x] V6. `encodeVideo` (H.264, 720 px, CRF 28, sin audio, faststart) y `extractPoster` (30 %, 1600 px, WebP 80), ambos vía `.tmp`.
- [x] V7. `processVideo`: idempotencia, renombrado, limpieza de temporales si falla.
- [x] V8. `main`: bucle secuencial, resumen, aviso > 4 MB, código de salida.
- [x] V8b. **Clip de prueba:** tras el recorte de barras, generar UN clip de prueba y reportar el resultado (dimensiones, peso, aspecto de la portada) antes de procesar los 5. No ejecutar `npm run videos` completo sin confirmación (los clips se renombran antes de V9).
- [x] V9. Verificación del script (solo cuando confirmes el renombrado): `tsc --noEmit`, búsqueda de `any`/`@ts-ignore`, ejecución con los 5 clips, segunda ejecución (todo saltado), prueba con un `.mp4` corrupto, `ffprobe` de las salidas (verticales).

### Web
- [x] V10. `site-config.ts`: `tiktokHref` añadido. Datos de los clips en `src/lib/video-clips.ts` (`id`, `title`, `posterAt?`) en lugar de `video-data.ts`, que se elimina en V14 junto con `VideoDemo.tsx`.
- [x] V11. `VideoCard.tsx` (Client): portada con `next/image`, botón play accesible, montaje del `<video>` bajo demanda.
- [x] V12. `VideoCard`: un solo vídeo a la vez (evento `hb:video-play`), foco al vídeo, `play()` con gestión de rechazo. El listener se registra en un efecto y se **elimina al desmontar** (cleanup con `removeEventListener`).
- [x] V13. `VideoGallery.tsx` (Server): cabecera, disposición responsive y botones TikTok + WhatsApp. Móvil: carrusel con scroll-snap y un trozo visible de la siguiente tarjeta; el contenedor es navegable por teclado (`tabindex="0"`, `role="region"`, `aria-label`) y el scroll no interfiere con el play (sin `preventDefault`, `touch-action: pan-x`). Escritorio: fila centrada.
- [x] V14. Integrar en `Gallery.tsx` y eliminar `VideoDemo.tsx`. **BLOQUEADA:** no se inicia (ni se toca `Gallery.tsx`) hasta que la Parte 3 esté cerrada y commiteada, o tú indiques lo contrario.
- [x] V14b. Unificar a "vídeo" (con tilde, forma RAE) toda la web. Hoy solo aparece "video" en `VideoDemo.tsx` (se elimina en V14), así que no queda nada más por cambiar; se comprobará con grep.

### QA
- [x] V15. `tsc --noEmit`, `eslint`, búsqueda de `any`/`@ts-ignore`, auditoría de `href`/`onClick`.
- [x] V16. Navegador a 375 px y escritorio con 1, 3 y 5 clips (capturas).
- [x] V17. Pestaña de red: cero peticiones a `.mp4` hasta pulsar play; un solo vídeo a la vez; teclado (Tab/Enter/Espacio) y foco visible.
- [x] V18. Revisión final y limpieza (referencias a `demo.mp4`, `public/videos` completo).


## Parte 3 — Galería con fotos reales (cada tarea espera tu visto bueno antes de pasar a la siguiente)

### Decisiones previas
- [x] G0. Validar `spec.md` Parte 3: origen de las fotos (¿IA o reales?), `sharp` transitivo vs `ffmpeg`, opción de visualización (A/B), ubicación `src/lib/galeria-data.ts`.

### Fase 1 — Propuesta de nombres (solo lectura)
- [x] G1. Añadir `/fotos-seleccionadas` a `.gitignore`.
- [x] G2. Revisar las 27 fotos y generar `scripts/nombres-propuestos.json` (slug, alt, status, avisos) y la tabla original → nombre → alt. Señalar caras, matrículas o datos de vivienda.
- [x] G3. Tu aprobación (o correcciones) de la propuesta; las `dudosa` se resuelven o se descartan.

### Fase 2 — Script `npm run galeria`
- [x] G4. Añadir `"galeria": "node scripts/process-gallery.mts"` a `package.json`.
- [x] G5. Crear `process-gallery.mts` con tipos, constantes (rutas, 1600, calidad 80, 300 KB) y lectura/validación del JSON.
- [x] G6. Lógica pura: asignación de slugs con sufijos `-2`, `-3` y `renderGalleryModule` (genera el `.ts`).
- [x] G7. `processPhoto` con sharp (rotate, resize sin ampliar, WebP 80, sin metadatos), `.tmp.webp` + renombrado, idempotencia.
- [x] G8. `main`: bucle secuencial, regeneración de `src/lib/galeria-data.ts`, resumen, avisos > 300 KB, código de salida.
- [x] G9. Verificación: `tsc --noEmit`, búsqueda de `any`/`@ts-ignore`, ejecución real, segunda ejecución (todo saltado), originales intactos (hash), prueba con un original corrupto.

### Web
- [x] G10. Listar referencias a `gallery-0X.jpg` y `before-after/*` y confirmar contigo qué dejaría de usarse (sin borrar).
- [x] G11. `GalleryGrid.tsx` (Client): mosaico, `next/image` con `width/height` y `sizes`, "Ver más" (y lightbox si eliges B).
- [x] G12. Integrar en `Gallery.tsx` y retirar `gallery-data.ts` (sin tocar "Antes y Después" ni `VideoDemo`).
- [x] G13. QA: `tsc`, `eslint`, `any`/`@ts-ignore`, auditoría de `href`/`onClick` y botón de cierre si hay lightbox, navegador 375 px y escritorio, pestaña de red (solo se piden las fotos visibles).
- [x] G14. Con tu confirmación explícita, borrado de las imágenes antiguas que queden sin uso y limpieza de los `generate-*.mjs` obsoletos.

### Ampliación — Lightbox
- [x] L1. `GalleryLightbox.tsx`: visor con animación, flechas, contador, cierre (X/Esc/fondo), teclado y táctil.
- [x] L2. Foco atrapado, retorno del foco a la miniatura, bloqueo de scroll, `prefers-reduced-motion`.
- [x] L3. `GalleryGrid.tsx`: miniaturas como botones y `activeIndex`.
- [x] L4. QA: `tsc`/`eslint`, sin `any`, navegador 375 px y escritorio, pestaña de red (solo se pide la foto abierta, en WebP).
- [x] L5. Corregir el salto de la landing al abrir/cerrar el visor (`scrollbar-gutter: stable` + `preventScroll`).


## Parte 4 — Eliminar sección "Antes y Después" (plan pendiente, de otra sesión)

Ver `spec.md` para el detalle de cada punto. Ninguna de estas tareas está ejecutada todavía — quedan pendientes de tu validación.

- [ ] **A1.** Quitar `import { BeforeAfter } from "@/components/sections/BeforeAfter"` y `<BeforeAfter />` de `src/app/page.tsx`.
- [ ] **A2.** Quitar la entrada `{ label: "Antes y Después", href: "#antes-despues" }` de `src/lib/nav-links.ts` (el único enlace del menú hacia la sección).
- [ ] **A3.** Cambiar el fondo de `Testimonials.tsx` de `bg-gray-50` a `bg-white` para restaurar la alternancia de secciones (evita 3 fondos grises seguidos).
- [ ] **A4.** `git rm` de:
  - `src/components/sections/BeforeAfter.tsx`
  - `src/components/sections/BeforeAfterSlider.tsx`
  - `src/lib/before-after-data.ts`

  (quedan en el historial de git, no como código comentado)
- [ ] **A5.** Grep de confirmación: `BeforeAfter`, `antes-despues`, `before-after` ya no aparecen en ningún archivo de `src/`.
- [ ] **A6.** `npx tsc --noEmit`, `npx eslint .` y `npm run build` sin errores.
- [ ] **A7.** Verificación visual con el sitio corriendo: desktop y mobile, clic en cada enlace del menú (incluido el mobile) para confirmar que ninguno queda roto, y que el salto Services → Testimonials → FAQ se ve con ritmo de fondos correcto.
- [ ] **A8.** Commit (branch `claude/inspiring-newton-3626es`, luego merge a `master` como venimos haciendo).

### G14 — Diferida, requiere tu confirmación aparte

- [ ] **G14.** Borrar las 3 imágenes que quedan sin ningún uso tras T1-T8:
  - `public/before-after/before-piscina-v2.jpg`
  - `public/before-after/before-cocina.jpg`
  - `public/before-after/before-bano.jpg`

  **Corrección:** `gallery-01.jpg`, `gallery-02.jpg` y `gallery-03.jpg` NO entran acá — siguen en uso activo en `Gallery.tsx` ("Nuestros Trabajos"), por eso no están en esta lista aunque también aparecían como imagen "after" en el slider que se elimina.
