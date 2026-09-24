export interface Advantage {
  readonly stat: string;
  readonly title: string;
  readonly description: string;
}

export const advantages: readonly Advantage[] = [
  {
    stat: "+10",
    title: "Años de Experiencia",
    description: "Más de una década construyendo y renovando en la zona.",
  },
  {
    stat: "+150",
    title: "Obras Entregadas",
    description: "Reformas y piscinas finalizadas con clientes satisfechos.",
  },
  {
    stat: "2 años",
    title: "Garantía Real",
    description: "Respaldamos materiales y mano de obra por escrito.",
  },
  {
    stat: "98%",
    title: "Cumplimiento de Plazos",
    description: "De nuestras obras se entregan en la fecha acordada.",
  },
] as const;
