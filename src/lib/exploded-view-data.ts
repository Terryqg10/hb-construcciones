export interface ExplodedLayer {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  /**
   * Placeholder visual de la capa: por ahora un color/gradiente CSS.
   * Cuando tengas la textura real, este mismo campo pasa a guardar
   * la ruta de la imagen (ej. "/textures/base.webp") sin cambiar el tipo.
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
    visual: "linear-gradient(135deg, #7c4a32 0%, #4a2c1f 100%)",
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
    visual: "linear-gradient(135deg, #52525b 0%, #27272a 100%)",
  },
  {
    id: "preparacion",
    title: "Pasta niveladora",
    description:
      "Capa de preparación que nivela la superficie antes de recibir el acabado final.",
    visual: "linear-gradient(135deg, #a8a29e 0%, #78716c 100%)",
  },
  {
    id: "acabado",
    title: "Acabado premium",
    description:
      "La terminación visible: madera en espiga o azulejo, según el proyecto.",
    visual: "linear-gradient(135deg, #a16207 0%, #713f12 100%)",
  },
] as const;
