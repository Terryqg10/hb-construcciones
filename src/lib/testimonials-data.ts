export interface Testimonial {
  readonly name: string;
  readonly role: string;
  readonly rating: number;
  readonly quote: string;
}

export const testimonials: readonly Testimonial[] = [
  {
    name: "Marta Sánchez",
    role: "Reforma integral de vivienda",
    rating: 5,
    quote:
      "El equipo cumplió los plazos y la calidad del acabado superó lo esperado. Muy recomendable.",
  },
  {
    name: "Javier Torres",
    role: "Construcción de piscina",
    rating: 5,
    quote:
      "Desde el diseño hasta la entrega, todo fue transparente. La piscina quedó exactamente como la imaginamos.",
  },
  {
    name: "Laura Gómez",
    role: "Remodelación de cocina y baño",
    rating: 4,
    quote:
      "Buena comunicación durante toda la obra y respeto por los tiempos acordados.",
  },
] as const;
