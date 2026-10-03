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
- [ ] V14. Integrar en `Gallery.tsx` y eliminar `VideoDemo.tsx`. **BLOQUEADA:** no se inicia (ni se toca `Gallery.tsx`) hasta que la Parte 3 esté cerrada y commiteada, o tú indiques lo contrario.
- [ ] V14b. Unificar a "vídeo" (con tilde, forma RAE) toda la web. Hoy solo aparece "video" en `VideoDemo.tsx` (se elimina en V14), así que no queda nada más por cambiar; se comprobará con grep.

### QA
- [ ] V15. `tsc --noEmit`, `eslint`, búsqueda de `any`/`@ts-ignore`, auditoría de `href`/`onClick`.
- [ ] V16. Navegador a 375 px y escritorio con 1, 3 y 5 clips (capturas).
- [ ] V17. Pestaña de red: cero peticiones a `.mp4` hasta pulsar play; un solo vídeo a la vez; teclado (Tab/Enter/Espacio) y foco visible.
- [ ] V18. Revisión final y limpieza (referencias a `demo.mp4`, `public/videos` completo).
