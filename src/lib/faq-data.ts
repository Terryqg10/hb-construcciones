export interface FaqItem {
  readonly question: string;
  readonly answer: string;
}

export const faqItems: readonly FaqItem[] = [
  {
    question: "¿Necesito licencia de obra para mi reforma?",
    answer:
      "Depende del alcance del proyecto. En reformas integrales o ampliaciones suele hacer falta, mientras que cambios puntuales (cocina, baño) muchas veces no. Lo revisamos contigo en la visita inicial y nos encargamos de la gestión si corresponde.",
  },
  {
    question: "¿Cuánto tarda una reforma integral?",
    answer:
      "Varía según el tamaño y el alcance de la obra, pero el 98% de nuestros proyectos se entregan en la fecha acordada en el presupuesto. Antes de empezar te damos un cronograma claro con las etapas y plazos estimados.",
  },
  {
    question: "¿El presupuesto puede subir durante la obra?",
    answer:
      "No sin que lo hables antes con nosotros. Trabajamos con presupuestos detallados por partidas: si surge algún imprevisto o quieres modificar algo, te lo comunicamos y acordamos el ajuste antes de ejecutarlo. Sin sorpresas en la factura final.",
  },
  {
    question: "¿Qué garantía tienen los trabajos?",
    answer:
      "Respaldamos materiales y mano de obra por escrito con 2 años de garantía real. Si aparece alguna incidencia dentro de ese período, la solucionamos sin costo adicional.",
  },
  {
    question: "¿Cómo es la forma de pago?",
    answer:
      "Se define junto con el presupuesto, habitualmente en pagos por avance de obra. Todo queda por escrito antes de empezar, para que sepas exactamente cuándo y cuánto corresponde en cada etapa.",
  },
  {
    question: "¿Hacen el diseño o necesito llevar mis propios planos?",
    answer:
      "Ambas opciones son posibles. Puedes traer tu idea o planos, o te ayudamos desde cero a definir la distribución y los materiales antes de arrancar la obra.",
  },
] as const;
