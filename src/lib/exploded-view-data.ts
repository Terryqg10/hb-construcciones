export interface ExplodedLayer {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  /**
   * Fondo CSS de la placa: degradado de sombreado (luz arriba-izquierda)
   * apilado sobre la textura real en /public/textures, vía "background"
   * shorthand. Se aplica tal cual en el estilo del componente.
   */
  readonly visual: string;
  /**
   * true solo para capas que deben renderizarse como una imagen con
   * transparencia superpuesta (ej. instalaciones) en vez de una placa
   * sólida que cubre todo el ancho. Si falta, se asume false.
   */
  readonly transparent?: boolean;
}

// Orden: de abajo hacia arriba, tal como se arma la reforma en la obra real.
export const explodedLayers: readonly ExplodedLayer[] = [
  {
    id: "base",
    title: "Bloque cerámico desnudo",
    description:
      "La base estructural del muro: ladrillo o bloque sin revestir, tal como queda después del picado.",
    visual:
      "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(15,23,42,0.30) 100%), url('/textures/cimientos.webp') center/cover no-repeat",
  },
  {
    id: "instalaciones",
    title: "Instalaciones ocultas",
    description:
      "Fontanería y corrugados eléctricos que quedan empotrados en el muro antes de cerrarlo.",
    visual: "linear-gradient(135deg, #3f3f46 0%, #27272a 100%)",
    transparent: true,
  },
  {
    id: "estructura",
    title: "Perfilería metálica y aislamiento",
    description:
      "Perfiles de acero que sostienen el aislamiento térmico y acústico del muro.",
    visual:
      "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(15,23,42,0.30) 100%), url('/textures/malla-acero.webp') left/58% 100% no-repeat, url('/textures/aislamiento.webp') right/42% 100% no-repeat",
  },
  {
    id: "preparacion",
    title: "Pasta niveladora",
    description:
      "Capa de preparación que nivela la superficie antes de recibir el acabado final.",
    visual:
      "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(15,23,42,0.45) 100%), url('/textures/contrapiso.webp') center/cover no-repeat",
  },
  {
    id: "acabado",
    title: "Acabado premium",
    description:
      "La terminación visible: madera en espiga o azulejo, según el proyecto.",
    visual:
      "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(15,23,42,0.40) 100%), url('/textures/acabado.webp') center/cover no-repeat",
  },
] as const;
