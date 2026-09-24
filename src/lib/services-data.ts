import type { LucideIcon } from "lucide-react";
import { Hammer, Waves, ChefHat, Building2, Trees } from "lucide-react";

export interface Service {
  readonly icon: LucideIcon;
  readonly title: string;
  readonly description: string;
}

export const services: readonly Service[] = [
  {
    icon: Hammer,
    title: "Reformas Integrales",
    description: "Renovación completa de viviendas, de la demolición al acabado final.",
  },
  {
    icon: Waves,
    title: "Construcción de Piscinas",
    description: "Diseño y construcción de piscinas a medida, con deck y sistema de filtrado.",
  },
  {
    icon: ChefHat,
    title: "Cocinas y Baños",
    description: "Remodelación funcional y estética de cocinas y baños.",
  },
  {
    icon: Building2,
    title: "Ampliaciones",
    description: "Ampliaciones y obra nueva, desde el plano hasta la entrega de llaves.",
  },
  {
    icon: Trees,
    title: "Remodelación de Jardines",
    description: "Diseño y renovación de espacios exteriores, parquización y riego.",
  },
] as const;
