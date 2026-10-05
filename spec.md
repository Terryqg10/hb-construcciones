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
| `src/lib/video-clips.ts` | datos | `VideoClip { id, title, posterAt? }` y lista de clips; `videoSrc`/`posterSrc` derivan las rutas del `id`. **Sustituye** a `video-data.ts` (eliminado). |
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
- Títulos de clip: definidos en `video-clips.ts`, derivados de los nombres descriptivos aprobados.

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


---

# Parte 4 — Eliminar sección "Antes y Después" (ejecutada en otra sesión; G14 pendiente)

## Motivo
El contenido de la sección (las 3 fotos "antes" y las 3 "después") está generado con IA y no corresponde a obras reales de HB Construcciones. Se retira del sitio por honestidad con el visitante, no por un problema técnico.

## Inventario (localización completa)

| Archivo | Rol | Qué contiene |
|---|---|---|
| `src/components/sections/BeforeAfter.tsx` | Sección wrapper | `<section id="antes-despues">`, título "Antes y Después", mapea `beforeAfterItems` |
| `src/components/sections/BeforeAfterSlider.tsx` | Componente de UI | El slider de arrastre (input range) para una comparativa individual |
| `src/lib/before-after-data.ts` | Datos | 3 items (Piscina, Cocina, Baño) con rutas `before`/`after` |
| `src/app/page.tsx` | Composición de la home | `import { BeforeAfter }` + `<BeforeAfter />` entre `<Services />` y `<Testimonials />` |
| `src/lib/nav-links.ts` | Menú de navegación | `{ label: "Antes y Después", href: "#antes-despues" }` — el único enlace de nav hacia esta sección |

**Nadie más la usa.** Revisé todo `src/` buscando `BeforeAfter`, `antes-despues`, "Antes y Después" y `before-after`: no hay menciones en el Hero, FAQ, testimonios, ni en los datos estructurados (`LocalBusinessJsonLd.tsx`). Las coincidencias de la palabra "antes" en `faq-data.ts` son frases normales ("antes de empezar"), no referencias a la sección.

No hay `sitemap.ts` ni `robots.ts` en el proyecto, así que no hay nada que actualizar ahí.

## Corrección importante sobre las imágenes

Pediste listar qué imágenes quedan sin uso, incluyendo `gallery-01` a `03`. Verifiqué cada una y **esa parte no es así**:

- `public/gallery/gallery-01.jpg`, `gallery-02.jpg`, `gallery-03.jpg` se usan como campo `after` en `before-after-data.ts`, **pero también están activas por separado** en `src/lib/gallery-data.ts`, consumidas por `Gallery.tsx` (la sección "Nuestros Trabajos"). Eliminar "Antes y Después" no las deja huérfanas.
- Solo quedan sin ningún uso las 3 imágenes "antes" en `public/before-after/`:
  - `before-piscina-v2.jpg`
  - `before-cocina.jpg`
  - `before-bano.jpg`

Esas 3 son las que quedan listadas para **G14** (no se borran en esta tarea).

## Impacto en el diseño: ritmo de fondos

Las secciones alternan `bg-white` / `bg-gray-50` (o `bg-slate-50`) para dar jerarquía visual. Orden actual:

```
WhyChooseUs(slate-50) → HowWeWork(gray-50) → Gallery(white) → Services(gray-50)
→ BeforeAfter(white) → Testimonials(gray-50) → FAQ(gray-50) → ContactForm(white) → ...
```

Si se quita `BeforeAfter` sin más, queda:

```
... → Services(gray-50) → Testimonials(gray-50) → FAQ(gray-50) → ...
```

Tres secciones grises seguidas — un hueco visual real. Propuesta: cambiar `Testimonials.tsx` de `bg-gray-50` a `bg-white` (un solo cambio de clase), con lo que el orden vuelve a alternar limpio:

```
... → Services(gray-50) → Testimonials(white) → FAQ(gray-50) → ContactForm(white) → ...
```

## Qué NO se toca en esta tarea
- `gallery-01.jpg`, `gallery-02.jpg`, `gallery-03.jpg` (siguen en uso).
- Las 3 imágenes de `public/before-after/` (se listan para G14, no se borran aquí).
- `src/lib/video-data.ts` / `VideoDemo.tsx` (ya están fuera de la página, sin relación con esta tarea).

## Cómo se preserva el componente
`git rm` de los 3 archivos (componente, slider, datos) dentro del mismo commit que quita las referencias. El contenido queda recuperable en el historial de git (`git log --follow` / `git show <commit>^:ruta`); no se deja como código comentado.

## Criterios de aceptación
- `npx tsc --noEmit` sin errores (cero `any` nuevo, no aplica ninguno aquí).
- `npx eslint` sin errores nuevos.
- `npm run build` genera la home sin la sección.
- Ningún enlace del menú (incluido mobile) apunta a un ancla inexistente — se verifica haciendo clic en cada uno.
- Sin dependencias nuevas en `package.json`.


---

# Parte 5 — Carrusel de vídeos más guiado en móvil

## Problema
En móvil (< 640 px) los vídeos van en un carrusel horizontal que enseña una tarjeta y un trozo de la siguiente. Una persona poco familiarizada con las webs puede no darse cuenta de que se desliza: no hay ninguna pista visible, y la sección se ve vacía y pasiva.

## Objetivo
Que cualquier visitante entienda sin ayuda que hay más vídeos y sepa cómo verlos, tocando o deslizando, sin quitar nada de lo que ya funciona.

## Cambios (solo < 640 px; en escritorio no se muestra nada nuevo)
1. **Flechas anterior / siguiente:** dos botones circulares (`rounded-full`, blancos con sombra suave) sobre los bordes laterales del carrusel, centrados en vertical. Tamaño táctil mínimo 44 × 44 px. Cada flecha avanza o retrocede **una tarjeta**. La del extremo no aplicable se oculta (no se deja un botón muerto).
2. **Indicador de posición:** puntos bajo el carrusel (uno por clip, el activo en `brand`), con un texto "Vídeo 2 de 5" para lectores de pantalla (`aria-live="polite"`). Los puntos son botones que llevan a ese clip.
3. **Texto guía:** una línea bajo los puntos (así, al desaparecer, no mueve el carrusel bajo el dedo), solo móvil: "Desliza o pulsa las flechas para ver más vídeos." Desaparece tras la primera interacción (flecha, punto o deslizar). Español de España, tuteo.
4. **Foco y teclado:** las flechas son `<button type="button">` con `aria-label` ("Ver el vídeo anterior" / "Ver el vídeo siguiente") y foco visible; el contenedor sigue siendo navegable con flechas del teclado (`tabindex="0"`).
5. **Sin interferir con el play:** las flechas se colocan fuera del área central de la tarjeta (el botón de play queda libre) y no usan `preventDefault` sobre el gesto de scroll.
6. **`prefers-reduced-motion`:** el desplazamiento de las flechas es instantáneo (sin animación suave) para quien lo tenga activado.

## Decisión de arquitectura
- `VideoGallery` sigue siendo **Server Component** (cabecera, texto, botones TikTok/WhatsApp).
- Nuevo Client Component pequeño `VideoCarousel` (`src/components/ui/VideoCarousel.tsx`): recibe las tarjetas como `children` y envuelve la lista actual. Solo contiene el estado de posición, las flechas y los puntos.
- `VideoCard` no cambia.
- Posición activa: `IntersectionObserver` sobre cada `li` (sin listener de `scroll` ni dependencias). Desplazar: `scrollTo({ left, behavior })` calculado a partir de los `li`.
- Sin dependencias nuevas, sin `any` ni `@ts-ignore`.
- Iconos: `ChevronLeft` y `ChevronRight` de `lucide-react` (ya instalada).

## Criterios de aceptación
- A 375 px se ven las flechas, los puntos y el texto guía; en ≥ 640 px no aparece ninguno.
- Con 1 clip no se muestran flechas ni puntos; con 3 y 5 funcionan.
- Pulsar la flecha avanza exactamente una tarjeta; el punto activo cambia también al deslizar con el dedo.
- La flecha izquierda no existe en el primer clip y la derecha no existe en el último.
- El botón de play de cada tarjeta sigue funcionando con las flechas visibles.
- Todos los botones tienen `onClick` válido, `aria-label` y foco visible; sin scroll horizontal de la página.
- `tsc`, `eslint` (sin errores nuevos) y `next build` limpios.

## Fuera de alcance
Autoplay del carrusel, bucle infinito, gestos personalizados, cambios en escritorio.


---

# Parte 6 — Skill personal `media-pipeline` (flujo de medios reutilizable)

## Propósito
Convertir el flujo de las Partes 1–3 (fotogramas → selección → WebP/vídeos → galería) en una skill personal que se cargue sola en cualquier proyecto con galería de fotos y vídeos, sin rutas ni textos de HB. Al activarse en un proyecto nuevo, **primero inspecciona su estructura y propone dónde irán scripts y datos**; no asume la de HB.

## Hallazgos sobre el estado actual
- **Ya existen en HB:** `extract-frames.mts` (`npm run frames`), `process-videos.mts` (`npm run videos`), `process-gallery.mts` (`npm run galeria`) y `scripts/lib/slug.mts`.
- **`check:images` no existe** en el proyecto (ni en `package.json` ni en ningún archivo). Hay que **diseñarlo desde cero**; no es una generalización.
- **Acoplamientos a HB que hay que quitar:** rutas fijas (`fotos-seleccionadas`, `videos-seleccionados`, `public/gallery`, `public/videos`, `candidatas`), el import de `src/lib/video-clips.ts` en `process-videos.mts` (portada configurable), la generación de `src/lib/galeria-data.ts` con nombre y tipo fijos, y el mensaje de instalación de ffmpeg solo para Windows (`winget`).
- **`sharp` y la resolución de módulos:** un script ESM resuelve `import "sharp"` desde **su propia ubicación**. Un script que viviera en `~/.claude/skills/...` no encontraría el `sharp` del proyecto. Por eso los scripts **se copian al proyecto** al activar la skill (y quedan versionados con él).
- **`sharp` es hoy una dependencia transitiva de Next** (`package.json` ya lo lista como devDependency en este momento, pero otro proyecto puede no tenerlo). La skill lo comprueba y, si falta, **pide permiso** antes de ejecutar `npm i -D sharp`.
- **No se incluyen** `generate-before-images.mjs` ni `generate-hero-image.mjs` (generan imágenes con IA): contradicen la regla "fotos reales sin imágenes generadas".
- **`~/.claude/skills/` ya existe** y contiene `synced`. No se toca.
- **Node:** el entorno tiene v24 (type stripping nativo de `.mts`). La skill comprueba `node -v` (≥ 22.18) antes de copiar nada.

## Estructura de archivos propuesta
Destino final (solo tras tu aprobación en S10):
```
~/.claude/skills/media-pipeline/
├── SKILL.md                         # < 500 líneas: cuándo, flujo, reglas, adaptación
├── checklist.md                     # revisión previa a commit (calidad, legal, QA)
├── scripts/
│   ├── extract-frames.mts           # fotogramas → candidatas + hoja de contactos
│   ├── process-gallery.mts          # fotos aprobadas → WebP (sharp) + módulo de datos opcional
│   ├── process-videos.mts           # clips → mp4 ligero + portada, recorte de barras negras
│   ├── check-images.mts             # NUEVO: auditoría de imágenes publicadas
│   └── lib/
│       ├── config.mts               # carga y valida media-pipeline.config.json (tipado, sin any)
│       ├── slug.mts                 # slugify + asignación anti-colisión (de HB, sin cambios)
│       └── run.mts                  # execFile + comprobación de ffmpeg/ffprobe por sistema operativo
└── templates/
    ├── media-pipeline.config.json   # configuración de rutas y límites, con valores por defecto
    ├── nombres-propuestos.example.json
    ├── spec-galeria-videos.md       # plantilla "Parte de galería y vídeos" para spec.md
    └── tasks-galeria-videos.md      # plantilla equivalente para tasks.md
```
Mientras se construye, todo vive en `skill-draft/media-pipeline/` (raíz de HB, **en `.gitignore`**). No se escribe nada en `~/.claude` hasta S10.

En el proyecto destino la skill dejará (tras aprobación): `scripts/media/*.mts`, `media-pipeline.config.json` en la raíz, y scripts de `package.json` (`frames`, `galeria`, `videos`, `check:images`).

## Decisiones a validar
| # | Decisión | Propuesta | Por qué |
|---|---|---|---|
| D1 | Dónde corren los scripts | **Copiados al proyecto**, no ejecutados desde `~/.claude` | Resolución de `sharp`; versionados con el proyecto |
| D2 | Cómo se adaptan las rutas | `media-pipeline.config.json` en la raíz del proyecto, propuesto tras inspeccionar | Cero rutas fijas en los scripts |
| D3 | Datos de la galería | `gallery.dataFile` configurable (`null` = no generar); nombre del export configurable | HB usa `src/lib/galeria-data.ts`; otro proyecto puede usar JSON o nada |
| D4 | Portada configurable | Mapa `videos.posters` (`slug → segundos`) en la config + `posterDefaultAt` (0.3) | Sustituye el import TS de HB |
| D5 | `sharp` | Dependencia explícita; la skill pide permiso para instalarla si falta | No depender de un transitivo |
| D6 | `check:images` | Auditoría de las carpetas de salida (reglas abajo) | No existe; se define aquí |
| D7 | Idioma | `SKILL.md`, mensajes de consola y plantillas en **español de España** | Regla del proyecto |
| D8 | Instalación de ffmpeg | Aviso según sistema (`winget` / `brew` / `apt`) | HB solo lo daba para Windows |

## Contrato de configuración (`media-pipeline.config.json`)
```ts
interface MediaConfig {
  readonly paths: {
    readonly videosIn: string;        // vídeos brutos (para frames)
    readonly candidates: string;      // salida de frames + index.html (fuera de public)
    readonly photosIn: string;        // fotos aprobadas (solo lectura)
    readonly videosSelected: string;  // clips elegidos
    readonly galleryOut: string;      // WebP finales de la galería
    readonly videosOut: string;       // mp4 + portadas
    readonly proposal: string;        // JSON de nombres propuestos
    readonly publicDir?: string;      // raíz pública que sirve el sitio ("public", "static"...); por defecto "public"
  };
  readonly gallery: {
    readonly dataFile: string | null; // módulo de datos generado, o null
    readonly exportName: string;      // p. ej. "galleryPhotos"
    readonly publicPrefix: string;    // p. ej. "/gallery"
  };
  readonly limits: {
    readonly maxSidePx: number;       // 1600
    readonly webpQuality: number;     // 80
    readonly warnPhotoBytes: number;  // 300 KB
    readonly maxVideoWidthPx: number; // 720
    readonly videoCrf: number;        // 28
    readonly warnVideoBytes: number;  // 4 MB
  };
  readonly frames: { readonly positions: readonly number[] }; // [0.2, 0.4, 0.6, 0.8]
  readonly videos: {
    readonly posterDefaultAt: number;                  // 0.3
    readonly posters: Readonly<Record<string, number>>; // slug → segundo
  };
}
```
Validación al cargar: rutas dentro de la raíz del proyecto, las carpetas de entrada y `candidates` **fuera** de `paths.publicDir` (y sin solaparse con `galleryOut`/`videosOut`), números finitos > 0, posiciones en (0, 1). Un error de configuración detiene el script con un mensaje claro antes de tocar nada.

## Cambios por script respecto a HB
| Script | Entrada → salida | Cambios |
|---|---|---|
| `extract-frames` | `paths.videosIn` → `paths.candidates` | Rutas, posiciones, tamaño y calidad desde la config; ayuda de instalación por sistema |
| `process-gallery` | `paths.photosIn` + `paths.proposal` → `paths.galleryOut` (+ `gallery.dataFile`) | Rutas y límites desde la config; el módulo de datos es opcional y con nombre configurable; sin referencias a HB |
| `process-videos` | `paths.videosSelected` → `paths.videosOut` | Portada al segundo de `videos.posters[slug]` o al `posterDefaultAt`; ya no importa código del proyecto; admite `--only=<slug>` |
| `check-images` | `paths.galleryOut`, `paths.videosOut` (solo lectura) | **Nuevo** |

Se conserva el comportamiento ya verificado: idempotencia, escritura `.tmp` + renombrado, `try/catch` por elemento, resumen final y código de salida 1 si hay fallos. Se conserva la regla de **nunca modificar ni borrar un original**.

## `check-images` (diseño nuevo)
Recorre `paths.galleryOut` y las portadas de `paths.videosOut` y avisa o falla según la regla:
1. **Error:** formato distinto de WebP en `galleryOut` (jpg, png, gif…).
2. **Error:** lado mayor > `maxSidePx`.
3. **Aviso:** peso > `warnPhotoBytes`.
4. **Aviso:** presencia de EXIF/ICC/XMP (se esperan eliminados).
5. **Error:** una entrada de `gallery.dataFile` (si existe) apunta a un archivo que no existe, o hay un WebP sin entrada en los datos.
6. **Error:** `candidates`, `photosIn`, `videosIn` o `videosSelected` dentro (o alrededor) de `paths.publicDir` (se publicarían por accidente).
7. **Aviso:** nombres de archivo que sugieran imagen generada (`generated`, `gemini`, `dall-e`, `midjourney`, `gpt-image`, `stable-diffusion`).
Salida: tabla resumen; código de salida 1 si hay algún error. **Solo lectura.**

## `SKILL.md`
- **Frontmatter:** `name: media-pipeline`; `description` clara y con palabras clave (galería de fotos, fotogramas de vídeo, WebP, optimizar imágenes, recorte de barras negras, portada de vídeo, `check:images`) para que se cargue sola.
- **Secciones:** cuándo usarla · primer paso en un proyecto nuevo (inspección y propuesta, con aprobación) · flujo paso a paso (**copia de seguridad → propuesta de nombres con aprobación → proceso → revisión → commit**) · reglas · cómo adaptar rutas · comandos · qué hacer si algo falla.
- **Reglas:** WebP obligatorio · nunca borrar originales · fotos reales, sin imágenes generadas (si los nombres sugieren IA, parar y preguntar) · español de España · nada se copia a `public/` sin aprobación · sin `any` ni `@ts-ignore`.
- **Límite:** < 500 líneas; el detalle largo va a `checklist.md` y `templates/`.

## Plantillas (`templates/spec-galeria-videos.md` y `tasks-galeria-videos.md`)
"Parte de galería y vídeos" con huecos `{{...}}` para ruta, nombre del proyecto y decisiones, y las fases: inspección → propuesta de nombres → scripts → integración web → QA. Las tareas son atómicas y esperan visto bueno entre ellas.

## Proceso de construcción
Tareas S0–S11 de `tasks.md`, **una a una, con tu visto bueno entre ellas**. El código se escribe primero en `skill-draft/media-pipeline/` y se prueba allí; la copia a `~/.claude/skills/media-pipeline/` es la tarea S10 y solo se hace con tu aprobación explícita.

## Criterios de aceptación
- `grep` de `hb`, `HB`, `galeria-data`, `video-clips`, `public/gallery` y `public/videos` en `scripts/` y `templates/` de la skill: **0 coincidencias** (salvo ejemplos marcados como tales).
- `tsc --noEmit` en modo estricto sobre los scripts de la skill: sin errores; **cero `any` y cero `@ts-ignore`**.
- Prueba en un proyecto temporal (fuera del repo): los cuatro scripts funcionan solo con la config; segunda ejecución → todo saltado; un archivo corrupto no detiene el resto; los originales no cambian (hash).
- `check-images` detecta a propósito un `.jpg` en la salida, una imagen > 1600 px y una entrada de datos huérfana.
- `SKILL.md` < 500 líneas, frontmatter válido; la skill aparece listada en una sesión nueva.
- HB no cambia: `npm run frames`, `videos` y `galeria` siguen funcionando igual (no se modifican sus scripts).

## Fuera de alcance
Modificar los scripts de HB para usar la versión genérica, cambiar componentes de la web, procesado de audio, generación de imágenes con IA, publicar la skill fuera de `~/.claude`.
