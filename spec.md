# spec.md

# Parte 1 — Extractor de fotogramas para la galería (hecho)

## Propósito
Script reutilizable que genera fotogramas candidatos a partir de vídeos de obras terminadas. La selección final para la galería se hace a mano. El script no toca `public/` ni `src/`.

## Ejecución
`npm run frames` → `node scripts/extract-frames.mts` (Node ≥ 24, type stripping nativo, sin dependencias nuevas).
Requisito externo: `ffmpeg` y `ffprobe` en el PATH.

## Entrada / Salida
| | Ruta (raíz del proyecto) | Notas |
|---|---|---|
| Entrada | `/videos/*.mp4`, `*.mov` | Extensión sin distinguir mayúsculas. No recursivo. |
| Salida | `/candidatas/<slug>-01.webp … -04.webp` | 4 por vídeo |
| Hoja de contactos | `/candidatas/index.html` | Se regenera en cada ejecución |

Las rutas se resuelven desde la ubicación del script (`scripts/..`), no desde `process.cwd()`.

## Reglas
1. **Tiempos:** `ffprobe -show_entries format=duration` → fotogramas en `duración × {0.2, 0.4, 0.6, 0.8}`. Si la duración no es un número finito > 0, el vídeo falla.
2. **Tamaño:** el lado mayor mide como máximo 1600 px, manteniendo la proporción y sin ampliar nunca: `scale='min(1600,iw)':'min(1600,ih)':force_original_aspect_ratio=decrease`.
3. **Formato:** WebP, `-quality 80`, `-map_metadata -1`, `-frames:v 1`. La rotación de los vídeos de móvil la aplica ffmpeg por defecto.
4. **Idempotencia:** si existen los 4 archivos de un vídeo, se salta. Si faltan algunos, se rehacen los 4 de ese vídeo. Cada imagen se escribe en un `.tmp.webp` y se renombra al terminar, para que una interrupción no deje archivos a medias.
5. **Tolerancia a fallos:** cada vídeo va en su propio `try/catch`. Un fallo se registra con su motivo y el proceso continúa. Si falla un fotograma, el vídeo cuenta como fallido y se borran sus `.tmp.webp`.
6. **Resumen final:** procesados / saltados / fallidos (con motivo). Código de salida 1 si hubo fallidos; 0 en caso contrario.
7. **Hoja de contactos:** HTML estático con CSS embebido, sin JS. Miniaturas agrupadas por vídeo (rejilla CSS), con el nombre del archivo debajo de cada una. Rutas relativas, textos escapados. Se genera a partir de los `.webp` presentes en `/candidatas`, no solo de los vídeos procesados en esta ejecución.
8. **.gitignore:** añadir `/videos` y `/candidatas`.

## Slug
minúsculas → NFD y quitar diacríticos → quitar extensión → todo lo que no sea `[a-z0-9]` pasa a `-` → colapsar y recortar guiones.
Ejemplo: `WhatsApp Video 2026-10-02 at 15.13.07 (3).mp4` → `whatsapp-video-2026-10-02-at-15-13-07-3`.
Si dos vídeos dan el mismo slug, el segundo (en orden alfabético) recibe el sufijo `-2`, y así sucesivamente.
Si el slug queda vacío, se usa `video`.

## Estructura del script (`scripts/extract-frames.mts`)
```ts
interface VideoJob { sourcePath: string; fileName: string; slug: string }
interface FrameOutput { fileName: string; absPath: string }
type VideoStatus = "processed" | "skipped" | "failed"
interface VideoResult { job: VideoJob; status: VideoStatus; error?: string }
```
Bloques (funciones puras separadas del I/O):
- `slugify`, `assignSlugs`: lógica pura.
- `run(cmd, args)`: envoltorio de `child_process.execFile` con promesa. Usa `execFile`, no shell, así que los nombres con espacios y paréntesis son seguros.
- `probeDuration`, `extractFrame`: llamadas a ffprobe y ffmpeg.
- `processVideo`: orquesta un vídeo (saltar, extraer, renombrar).
- `renderContactSheet`: genera el HTML.
- `main`: comprobación de requisitos, bucle secuencial, resumen y código de salida.

## Comprobación previa
Al arrancar, el script ejecuta `ffmpeg -version` y `ffprobe -version`. Si faltan, muestra el comando `winget install --id Gyan.FFmpeg -e` y sale con código 1, sin procesar nada. Si `/videos` no existe, muestra un error claro.

## Fuera de alcance
Copiar a `public/`, modificar componentes, detección automática del "mejor" fotograma, procesado en paralelo (se hace en secuencia, porque son ~45 vídeos y el rendimiento no es crítico).

## Criterios de aceptación
- Segunda ejecución sin cambios → 0 procesados, N saltados.
- Un vídeo corrupto no detiene el resto y aparece en el resumen.
- Ninguna imagen supera 1600 px de lado mayor, y ninguna se amplía.
- `tsc --noEmit` pasa sin errores y sin `any` ni `@ts-ignore`.


---

# Parte 2 — Sección "Vídeos de obras" (sustituye a "Video del proyecto")

## Propósito
Sustituir el hueco de vídeo de la galería por 3–5 clips verticales de obras, con portada ligera, reproducción bajo demanda y llamadas a la acción (TikTok y WhatsApp). La página no debe cargar ningún vídeo hasta que el usuario pulse play.

## Hallazgo sobre los vídeos de origen
Los 5 clips de `/videos-seleccionados` (`1.mp4`…`5.mp4`, ~20 s, 20–40 MB, H.264) miden **1920×1080 sin metadato de rotación**: el contenido vertical va incrustado en un lienzo apaisado con barras negras laterales. `cropdetect` da `608×1080` con desplazamiento `656:0` en todos (≈ 9:16). Si solo se escalara, las portadas y los .mp4 saldrían apaisados con barras. Por eso el script **detecta y recorta el área útil** (regla 4).

## 2.A Script `npm run videos` → `scripts/process-videos.mts`

### Entrada / salida
| | Ruta (raíz del proyecto) | Notas |
|---|---|---|
| Entrada | `/videos-seleccionados/*.mp4`, `*.mov` | Extensión sin distinguir mayúsculas. No recursivo. |
| Salida vídeo | `/public/videos/<slug>.mp4` | H.264, ≤ 720 px de ancho, CRF 28, sin audio, `+faststart` |
| Salida portada | `/public/videos/<slug>.webp` | Fotograma al 30 % de la duración, lado mayor ≤ 1600 px, calidad 80 |

Las rutas se resuelven desde `scripts/..`. Requisitos: Node ≥ 24 y `ffmpeg`/`ffprobe` en el PATH. `.gitignore`: añadir `/videos-seleccionados`. Las salidas de `/public/videos` **sí** se versionan, porque la web las sirve.

### Reglas
1. **Slugs y orden:** misma lógica que `extract-frames.mts` (`slugify` + asignación anti-colisión sobre la lista ordenada con `localeCompare`). Para no duplicar código se extrae a `scripts/lib/slug.mts` y ambos scripts lo importan (cambio mecánico, sin alterar el comportamiento de `frames`). `1.mp4` → slug `1`; si prefieres nombres descriptivos, basta renombrar el origen.
2. **Vídeo:** `ffmpeg -vf "<crop>,scale='min(720,iw)':-2,format=yuv420p" -c:v libx264 -crf 28 -preset medium -an -movflags +faststart -map_metadata -1`. Nunca se amplía. Dimensiones pares (`-2`).
3. **Rotación:** se respeta el autorrotado de ffmpeg (metadato de rotación). Las dimensiones se leen con `ffprobe` *después* de rotar, así que un vídeo vertical siempre produce portada y .mp4 verticales.
4. **Recorte de barras:** `cropdetect=limit=24:round=2` sobre 10 s a partir del 10 % del vídeo; se toma el recorte más frecuente. Solo se aplica si elimina ≥ 5 % del área; si no, no se recorta. Mismo recorte para vídeo y portada.
5. **Portada:** un fotograma en `duración × 0.3`, con el mismo recorte, `scale='min(1600,iw)':'min(1600,ih)':force_original_aspect_ratio=decrease`, WebP calidad 80, `-map_metadata -1`.
6. **Idempotencia:** si existen `<slug>.mp4` y `<slug>.webp`, se salta. Si falta alguno, se rehacen ambos. Escritura en `.tmp.mp4` / `.tmp.webp` y renombrado al final; ante fallo se borran los temporales.
7. **Tolerancia a fallos:** `try/catch` por clip; el proceso continúa.
8. **Resumen final:** procesados / saltados / fallidos (con motivo). Aviso por cada `.mp4` de salida > 4 MB (también entre los saltados). Código de salida 1 si hay fallidos.
9. **Comprobación previa:** igual que en la Parte 1 (ffmpeg/ffprobe, carpeta de entrada existente, creación de `public/videos`).

### Estructura
```ts
interface VideoJob { sourcePath: string; fileName: string; slug: string }
interface CropBox { width: number; height: number; x: number; y: number }
type VideoStatus = "processed" | "skipped" | "failed"
interface VideoResult { job: VideoJob; status: VideoStatus; error?: string; sizeBytes?: number }
```
Funciones puras: `parseCropdetect`, `pickCrop`, `buildVideoFilter`, `formatMegabytes`. Con I/O: `run`, `detectCrop`, `probeDuration`, `encodeVideo`, `extractPoster`, `processVideo`, `main`.

## 2.B Componentes y datos

### Archivos
| Archivo | Tipo | Responsabilidad |
|---|---|---|
| `src/lib/video-data.ts` | datos | `VideoItem { id, src, poster, title }` tipado y lista de clips. **Sustituye** al demo actual. |
| `src/lib/site-config.ts` | datos | Añadir `tiktokHref` (`https://www.tiktok.com/@hbreformasengeneral`). WhatsApp ya existe (`whatsappHref`). |
| `src/components/sections/VideoGallery.tsx` | **Server** | Cabecera, disposición de tarjetas, botones TikTok y WhatsApp. Sin estado. |
| `src/components/ui/VideoCard.tsx` | **Client** (único) | Portada + botón play; al pulsar monta `<video>`. |
| `src/components/sections/Gallery.tsx` | Server | Cambia `VideoDemo` por `VideoGallery`. |
| `src/components/sections/VideoDemo.tsx` | — | **Se elimina** (modal con "Video del proyecto"). |

Por qué solo `VideoCard` es Client: es lo único que necesita estado (`playing`), refs y eventos. La sección, los textos y los enlaces son estáticos y se renderizan en servidor. `Reveal` es un Client Component autónomo que acepta `children`, así que puede usarse desde el servidor sin convertir la sección en cliente.

### `VideoCard`
- Props: `video: VideoItem`.
- Estado `playing: boolean`. Antes del clic: `<button>` con `aria-label="Reproducir vídeo: {title}"`, `next/image` (`fill`, `object-cover`) e icono Play. Tras el clic: `<video controls playsInline preload="none" poster>` con `autoPlay` y `play()` en un efecto, y foco movido al `<video>` para no perderlo al desaparecer el botón.
- **Un solo vídeo a la vez:** al empezar, cada tarjeta emite un evento `hb:video-play` en `window` con su `id`; las demás, si lo reciben con otro `id`, vuelven a la portada (se desmonta su `<video>`). Sin estado global ni dependencias.
- **Se puede pausar:** controles nativos (botón de pausa, clic sobre el vídeo y barra espaciadora).
- **Foco visible:** `focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2`.
- `aria-label` en el vídeo (`Vídeo de obra: {title}`).

### Maquetación
- Tarjeta `aspect-[9/16] rounded-2xl overflow-hidden bg-slate-900`.
- **Escritorio (≥ 640 px):** `flex flex-wrap justify-center gap-4`, ancho fijo de tarjeta (`w-56` en `sm`, `w-52` en `lg`). Con 1, 3 o 5 clips quedan centrados y 5 caben en una fila (5 × 208 + 4 × 16 = 1104 ≤ 1152).
- **Móvil (375 px):** carrusel horizontal `snap-x snap-mandatory` con tarjetas `w-[68vw] max-w-64` y relleno lateral para ver el borde de la siguiente. Con 1 clip queda centrado.
- `sizes` de la portada: `(min-width: 1024px) 208px, (min-width: 640px) 224px, 68vw`.
- Debajo, `flex flex-col sm:flex-row items-center justify-center gap-3`:
  1. "Ver más en TikTok" → `siteConfig.tiktokHref`, `target="_blank" rel="noopener noreferrer"`, estilo secundario (`rounded-full`, sin borde duro).
  2. "Escríbenos por WhatsApp" → `siteConfig.whatsappHref` (mismo enlace y mensaje que el resto de la web), mismo estilo y `target`/`rel` que el botón del Hero.

### Textos (español de España, tuteo)
- Título: "Nuestras obras en vídeo"; subtítulo: "Así trabajamos, directamente desde la obra."
- Botones: "Ver más en TikTok" / "Escríbenos por WhatsApp".
- Títulos de clip: provisionales, a validar contigo al implementar `video-data.ts`.

## 2.C QA y criterios de aceptación
- `npm run videos` genera 5 `.mp4` + 5 `.webp` verticales (≈ 608×1080); segunda ejecución → 0 procesados, 5 saltados; un archivo corrupto no detiene el resto; aviso si algún `.mp4` > 4 MB.
- Ningún `.mp4` supera 720 px de ancho; ninguna portada supera 1600 px de lado mayor.
- `tsc --noEmit` y `eslint` limpios; cero `any` y cero `@ts-ignore`; sin dependencias nuevas.
- Todos los botones con `href` u `onClick` válido; sin enlaces muertos; `rel` correcto en los enlaces externos.
- Comprobado a 375 px y a escritorio con 1, 3 y 5 clips.
- **Carga diferida verificada:** en la pestaña de red, al cargar la página no aparece ninguna petición a `/videos/*.mp4` (solo las portadas `.webp`); el `.mp4` se pide solo tras pulsar play.
- Al reproducir un clip, el que estuviera sonando vuelve a su portada.

## Fuera de alcance
Audio/subtítulos, analíticas de reproducción, lightbox/modal, reproducción automática al entrar en pantalla.


---

# Parte 3 — Galería con fotos reales de obras

## Propósito
Sustituir las 6 imágenes genéricas de la galería (`gallery-01…06.jpg`) por las 27 fotos ya editadas de `/fotos-seleccionadas`, con nombres descriptivos, texto alternativo útil e imágenes optimizadas. Se hace en tres fases, cada una con aprobación previa.

## Hallazgos previos
- **Origen de las fotos:** los nombres de archivo (`Gemini_Generated_Image_*.jpg`, `a_Igual_que_antes,_con*.png`, `gpt-image-2 (medium)_b_Eres_un_retocador_fo.png`) indican que varias son **generadas o retocadas con IA**, no fotos directas de obra. Antes de publicarlas como "Nuestros Trabajos" hay que confirmar que representan trabajos reales del cliente (riesgo de publicidad engañosa y de confianza). Se decide en la validación.
- **Carpeta de entrada:** 27 archivos (16 `.jpg`, 10 `.png`, 1 `.webp`). Aún **no** está en `.gitignore`.
- **sharp:** no está en `package.json`, pero `sharp@0.35.4` está instalado como dependencia transitiva de Next 16 (es lo que usa `next/image`). Se puede importar sin añadir nada, aunque queda como dependencia implícita. Alternativa: `ffmpeg`, que ya exigen los otros scripts.
- **Galería actual:** `src/lib/gallery-data.ts` (`GalleryItem { src, alt, span }`) + `src/components/sections/Gallery.tsx` (Server, cuadrícula de 6 con `span` tall/wide, `sizes` fijo) + `VideoDemo` dentro de la misma sección.
- **`images.qualities` = `[75, 90]`** en `next.config.ts`: no hay que tocarlo.

## Referencias a imágenes antiguas (estado actual, antes de cambiar nada)
| Archivo | Referenciado desde | ¿Dejará de usarse tras la Parte 3? |
|---|---|---|
| `gallery/gallery-01.jpg` | `before-after-data.ts` (después piscina), `video-data.ts` (poster), `generate-before-images.mjs`, `generate-gallery-images.mjs` | **No** (Antes/Después). El poster desaparece si se completa la Parte 2 (V10). |
| `gallery/gallery-02.jpg`, `-03.jpg` | `before-after-data.ts`, `generate-before-images.mjs`, `generate-gallery-images.mjs` | **No** (Antes/Después) |
| `gallery/gallery-04.jpg`, `-05.jpg`, `-06.jpg` | solo `gallery-data.ts` y `generate-gallery-images.mjs` | **Sí → candidatas a borrar** (requiere tu confirmación) |
| `before-after/before-*.jpg` (3) | `before-after-data.ts`, `generate-before-images.mjs` | **No**, no se tocan |

Se volverá a listar con `grep` en la tarea G10 antes de proponer ningún borrado. **No se borra nada sin tu confirmación.**

## 3.A Fase 1 — Propuesta de nombres (sin modificar archivos)
- Se abre cada foto y se propone: `slug` (minúsculas, guiones, sin tildes ni espacios; tipo de obra + detalle distintivo, p. ej. `piscina-deck-madera-terminada`) y `alt` (español de España, descriptivo, sin relleno ni "imagen de").
- `status`: `"ok"` o `"dudosa"` (si no está claro qué muestra, no se inventa). Campo `avisos`: caras, matrículas, números de portal, datos de vivienda o texto legible. Sin nombres de personas ni direcciones.
- Salida: `scripts/nombres-propuestos.json` y tabla en el chat (original → slug → alt). **Espera tu aprobación.** Los originales no se tocan.

```ts
interface PhotoProposal {
  readonly original: string;          // nombre del archivo en /fotos-seleccionadas
  readonly slug: string;              // sin extensión
  readonly alt: string;
  readonly status: "ok" | "dudosa";
  readonly avisos: readonly string[]; // [] si no hay nada que avisar
}
```

## 3.B Fase 2 — Script `npm run galeria` → `scripts/process-gallery.mts`
Solo se escribe tras aprobar la propuesta.

### Entrada / salida
| | Ruta (raíz) | Notas |
|---|---|---|
| Entrada | `scripts/nombres-propuestos.json` + `/fotos-seleccionadas/*` (`.jpg/.jpeg/.png/.webp`) | Solo lectura. Nunca se modifica ni borra un original. |
| Salida imágenes | `/public/gallery/<slug>.webp` | Se versionan (las sirve la web). No chocan con `gallery-0X.jpg`. |
| Salida datos | `/src/lib/galeria-data.ts` | Generado, con cabecera "no editar a mano". Sigue la convención `src/lib/*-data.ts` en lugar de `src/data`. |

### Reglas
1. **Procesado:** `sharp(origen).rotate()` (aplica orientación EXIF) → `resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })` → `webp({ quality: 80 })`. No se llama a `withMetadata`, así que se eliminan EXIF/ICC/XMP.
2. **Nombres:** se usa el `slug` de la propuesta. Si dos coinciden, tras ordenar por nombre de archivo original (`localeCompare`), el primero conserva el slug y los siguientes reciben `-2`, `-3`…
3. **Validación del JSON:** slug con `^[a-z0-9]+(-[a-z0-9]+)*$`, `alt` no vacío, el original existe. Las entradas `"dudosa"` se saltan con aviso hasta que las pases a `"ok"`. Las fotos de la carpeta ausentes del JSON se avisan, no se procesan.
4. **Idempotencia:** si `<slug>.webp` existe y es más reciente que el original, se salta. Se escribe a `.tmp.webp` y se renombra; si falla, se borra el temporal. `galeria-data.ts` se regenera siempre a partir del JSON y de las dimensiones reales de cada `.webp` (`sharp().metadata()`), en el orden del JSON.
5. **Tolerancia a fallos:** `try/catch` por foto; el proceso continúa.
6. **Resumen final:** procesadas / saltadas / fallidas (con motivo), entradas dudosas, **aviso por cada salida > 300 KB** (también las saltadas). Código de salida 1 si hay fallidas.
7. **Tipos y salida generada:**
```ts
export interface GalleryPhoto {
  readonly src: string;    // "/gallery/<slug>.webp"
  readonly alt: string;
  readonly width: number;
  readonly height: number;
}
export const galleryPhotos: readonly GalleryPhoto[] = [ /* … */ ];
```
8. **.gitignore:** añadir `/fotos-seleccionadas`. Cero `any`/`@ts-ignore`; sin dependencias nuevas en `package.json`.

## 3.C Web
| Archivo | Tipo | Responsabilidad |
|---|---|---|
| `src/lib/galeria-data.ts` | generado | Lista tipada `galleryPhotos`. |
| `src/lib/gallery-data.ts` | — | Se elimina al migrar (`GalleryItem` con `span` ya no se usa). |
| `src/components/sections/Gallery.tsx` | Server | Título + `<GalleryGrid photos={…} />` + bloque de vídeo existente. |
| `src/components/ui/GalleryGrid.tsx` | **Client** (único) | Estado de "ver más" (y de lightbox si se aprueba). |

Por qué Client solo la rejilla: "ver más" y el lightbox necesitan estado y eventos; el título y los textos siguen en servidor.

### Propuesta de visualización (a aprobar)
- **Recomendada: Opción A — mosaico con "Ver más".** CSS `columns-2 sm:columns-3` con la proporción real de cada foto (`width`/`height` evitan saltos de maquetación y recortes), `rounded-xl`, `gap-3`. Se muestran **9** fotos y un botón `rounded-full` "Ver más trabajos" revela las 18 restantes (el botón desaparece al mostrar todas). Las ocultas **no se montan**, así que no se descargan.
- **Opción B — A + lightbox** con `<dialog>` nativo (sin dependencias): clic abre la foto grande, botón de cierre visible, Esc, flechas anterior/siguiente, foco devuelto a la miniatura. Más código y más superficie de QA; permite ver la obra al detalle.
- **Opción C — solo carrusel/lightbox** sin rejilla: descartada (peor en móvil y para SEO).
- `next/image`: `width`/`height` de los datos, `sizes="(min-width: 1152px) 376px, (min-width: 640px) 33vw, 50vw"` (contenedor `max-w-6xl` ÷ 3 columnas; 2 en móvil), `alt` de la propuesta.
- Si se elige B, `sizes` del lightbox: `(min-width: 1024px) 896px, 100vw`.

## Fuera de alcance
"Antes y Después" (no se toca), borrado de imágenes antiguas (solo con tu confirmación), vídeos (Parte 2), nuevas dependencias.

## Criterios de aceptación
- `npm run galeria` crea 27 `.webp` ≤ 1600 px (sin ampliar), sin metadatos y con orientación correcta; segunda ejecución: todo saltado; originales intactos (comparar hash).
- `galeria-data.ts` tipado, sin `any`; `tsc --noEmit` y `eslint` limpios.
- La web muestra la lista nueva con los `alt` correctos; sin descargar las fotos ocultas hasta pulsar "Ver más" (pestaña de red); móvil 375 px y escritorio revisados.
- "Antes y Después" idéntico al actual.


## 3.D Ampliación — Lightbox sobre el mosaico (petición posterior, opción B)

### Comportamiento
- Cada miniatura pasa a ser un `<button>` (`aria-label="Ampliar foto: {alt}"`). Al pulsarla se abre un visor a pantalla completa con fondo oscuro y la foto ampliada.
- **Animación ligera** (framer-motion, ya instalado): fondo con fundido, foto con `scale 0.94 → 1` y opacidad; al cambiar de foto, deslizamiento horizontal corto (±40 px) según la dirección. Con `prefers-reduced-motion` no hay movimiento.
- **Navegación:** flechas anterior/siguiente (botones `rounded-full`), teclas ←/→, deslizamiento táctil en móvil. Recorre las 25 fotos en bucle, incluidas las aún no desplegadas en el mosaico. Contador "n / total".
- **Cierre (siempre visible):** botón X, tecla Esc y clic en el fondo.
- **Accesibilidad:** `role="dialog"`, `aria-modal`, `aria-label`; el foco entra en el botón de cerrar, se queda atrapado (Tab/Shift+Tab) y vuelve a la miniatura al cerrar; el scroll de la página se bloquea mientras está abierto.

### Peso / formato
- Origen: los mismos WebP de `/public/gallery` (calidad 80, ≤ 1600 px). `next/image` los sirve en WebP con calidad 75, sin formatos nuevos.
- `sizes` del visor: `(min-width: 1024px) 50vw, 100vw`. Solo se descarga la foto abierta; las vecinas no se precargan, para no gastar datos.

### Archivos
| Archivo | Cambio |
|---|---|
| `src/components/ui/GalleryLightbox.tsx` | **Nuevo** (Client): visor, animación, navegación, foco y teclado. |
| `src/components/ui/GalleryGrid.tsx` | Miniaturas como botones; estado `activeIndex`; monta el visor. |

### Corrección: salto de la página al abrir el visor
Causa: `overflow: hidden` en el `body` quitaba la barra de scroll (15 px), la página se ensanchaba y todo se recolocaba. Solución: `html { scrollbar-gutter: stable }` en `globals.css` y `focus({ preventScroll: true })` en las dos llamadas a `focus()` del visor.
