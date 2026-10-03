# Tasks — Eliminar sección "Antes y Después"

Ver `spec.md` para el detalle de cada punto. Ninguna de estas tareas está ejecutada todavía — quedan pendientes de tu validación.

- [ ] **T1.** Quitar `import { BeforeAfter } from "@/components/sections/BeforeAfter"` y `<BeforeAfter />` de `src/app/page.tsx`.
- [ ] **T2.** Quitar la entrada `{ label: "Antes y Después", href: "#antes-despues" }` de `src/lib/nav-links.ts` (el único enlace del menú hacia la sección).
- [ ] **T3.** Cambiar el fondo de `Testimonials.tsx` de `bg-gray-50` a `bg-white` para restaurar la alternancia de secciones (evita 3 fondos grises seguidos).
- [ ] **T4.** `git rm` de:
  - `src/components/sections/BeforeAfter.tsx`
  - `src/components/sections/BeforeAfterSlider.tsx`
  - `src/lib/before-after-data.ts`

  (quedan en el historial de git, no como código comentado)
- [ ] **T5.** Grep de confirmación: `BeforeAfter`, `antes-despues`, `before-after` ya no aparecen en ningún archivo de `src/`.
- [ ] **T6.** `npx tsc --noEmit`, `npx eslint .` y `npm run build` sin errores.
- [ ] **T7.** Verificación visual con el sitio corriendo: desktop y mobile, clic en cada enlace del menú (incluido el mobile) para confirmar que ninguno queda roto, y que el salto Services → Testimonials → FAQ se ve con ritmo de fondos correcto.
- [ ] **T8.** Commit (branch `claude/inspiring-newton-3626es`, luego merge a `master` como venimos haciendo).

## G14 — Diferida, requiere tu confirmación aparte

- [ ] **G14.** Borrar las 3 imágenes que quedan sin ningún uso tras T1-T8:
  - `public/before-after/before-piscina-v2.jpg`
  - `public/before-after/before-cocina.jpg`
  - `public/before-after/before-bano.jpg`

  **Corrección:** `gallery-01.jpg`, `gallery-02.jpg` y `gallery-03.jpg` NO entran acá — siguen en uso activo en `Gallery.tsx` ("Nuestros Trabajos"), por eso no están en esta lista aunque también aparecían como imagen "after" en el slider que se elimina.
