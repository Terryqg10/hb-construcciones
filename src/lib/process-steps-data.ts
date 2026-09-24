export interface ProcessStep {
  readonly number: number;
  readonly title: string;
  readonly description: string;
}

export const processSteps: readonly ProcessStep[] = [
  {
    number: 1,
    title: "Contacto",
    description: "Nos escribes por WhatsApp o completas el formulario con tu proyecto.",
  },
  {
    number: 2,
    title: "Presupuesto",
    description: "Visitamos la obra y te enviamos un presupuesto sin compromiso.",
  },
  {
    number: 3,
    title: "Ejecución",
    description: "Realizamos el trabajo cumpliendo los plazos y materiales acordados.",
  },
  {
    number: 4,
    title: "Entrega",
    description: "Entregamos la obra terminada, con garantía sobre lo realizado.",
  },
] as const;
