# Tasks — Eliminar sección "Antes y Después"

Ver `spec.md` para el detalle de cada punto. Ninguna de estas tareas está ejecutada todavía — quedan pendientes de tu validación.

- [x] **T1.** Quitar `import { BeforeAfter } from "@/components/sections/BeforeAfter"` y `<BeforeAfter />` de `src/app/page.tsx`.
- [x] **T2.** Quitar la entrada `{ label: "Antes y Después", href: "#antes-despues" }` de `src/lib/nav-links.ts` (el único enlace del menú hacia la sección).
- [x] **T3.** Cambiar el fondo de `Testimonials.tsx` de `bg-gray-50` a `bg-white` para restaurar la alternancia de secciones (evita 3 fondos grises seguidos).
- [x] **T4.** `git rm` de:
  - `src/components/sections/BeforeAfter.tsx`
  - `src/components/sections/BeforeAfterSlider.tsx`
  - `src/lib/before-after-data.ts`

  (quedan en el historial de git, no como código comentado)
- [x] **T5.** Grep de confirmación: `BeforeAfter`, `antes-despues`, `before-after` ya no aparecen en ningún archivo de `src/`.
- [x] **T6.** `npx tsc --noEmit`, `npx eslint .` y `npm run build` sin errores (los 2 errores de eslint restantes son preexistentes, en `NavMenu.tsx`/`VideoDemo.tsx`, sin relación con esta tarea).
- [x] **T7.** Verificación visual con el sitio corriendo: 8 enlaces de menú probados con clic real en desktop y mobile, todos apuntan a una sección existente, sin errores de consola. Ritmo de fondos confirmado: Servicios(gris) → Valoraciones(blanco) → FAQ(gris).
- [x] **T8.** Commit (branch `claude/inspiring-newton-3626es`, merge a `master`).

## G14 — Confirmada y ejecutada

- [x] **G14.** Borrar las 3 imágenes que quedan sin ningún uso tras T1-T8:
  - `public/before-after/before-piscina-v2.jpg`
  - `public/before-after/before-cocina.jpg`
  - `public/before-after/before-bano.jpg`

  **Corrección:** `gallery-01.jpg`, `gallery-02.jpg` y `gallery-03.jpg` NO entran acá — siguen en uso activo en `Gallery.tsx` ("Nuestros Trabajos"), por eso no están en esta lista aunque también aparecían como imagen "after" en el slider que se elimina.
