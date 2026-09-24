export type GallerySpan = "tall" | "wide" | "normal";

export interface GalleryItem {
  readonly src: string;
  readonly alt: string;
  readonly span: GallerySpan;
}

export const galleryItems: readonly GalleryItem[] = [
  {
    src: "/gallery/gallery-01.jpg",
    alt: "Piscina terminada con deck de madera al atardecer",
    span: "wide",
  },
  {
    src: "/gallery/gallery-02.jpg",
    alt: "Cocina remodelada con isla central",
    span: "normal",
  },
  {
    src: "/gallery/gallery-03.jpg",
    alt: "Baño remodelado con ducha de vidrio",
    span: "tall",
  },
  {
    src: "/gallery/gallery-04.jpg",
    alt: "Fachada de casa renovada",
    span: "wide",
  },
  {
    src: "/gallery/gallery-05.jpg",
    alt: "Living remodelado con piso nuevo",
    span: "normal",
  },
  {
    src: "/gallery/gallery-06.jpg",
    alt: "Piscina con iluminación nocturna",
    span: "tall",
  },
] as const;
