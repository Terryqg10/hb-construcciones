export interface VideoItem {
  readonly src: string;
  readonly poster: string;
  readonly title: string;
}

export const videoItems: readonly VideoItem[] = [
  {
    src: "/videos/demo.mp4",
    poster: "/gallery/gallery-01.jpg",
    title: "Video del proyecto",
  },
] as const;
