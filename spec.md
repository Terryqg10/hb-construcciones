# spec.md — Extractor de fotogramas para la galería

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
