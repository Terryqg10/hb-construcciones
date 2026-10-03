# Spec — Eliminar sección "Antes y Después"

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
