export interface BeforeAfterItem {
  readonly label: string;
  readonly before: string;
  readonly after: string;
}

export const beforeAfterItems: readonly BeforeAfterItem[] = [
  {
    label: "Piscina",
    before: "/before-after/before-piscina-v2.jpg",
    after: "/gallery/gallery-01.jpg",
  },
  {
    label: "Cocina",
    before: "/before-after/before-cocina.jpg",
    after: "/gallery/gallery-02.jpg",
  },
  {
    label: "Baño",
    before: "/before-after/before-bano.jpg",
    after: "/gallery/gallery-03.jpg",
  },
] as const;
