export interface NavLink {
  readonly label: string;
  readonly href: string;
}

export const navLinks: readonly NavLink[] = [
  { label: "Servicios", href: "#servicios" },
  { label: "Por Qué Elegirnos", href: "#por-que-elegirnos" },
  { label: "Cómo Trabajamos", href: "#como-trabajamos" },
  { label: "Galería", href: "#galeria" },
  { label: "Antes y Después", href: "#antes-despues" },
  { label: "Valoraciones", href: "#valoraciones" },
  { label: "Preguntas Frecuentes", href: "#preguntas-frecuentes" },
  { label: "Contacto", href: "#contacto" },
  { label: "Ubicación", href: "#ubicacion" },
] as const;
