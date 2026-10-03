# tasks.md

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
