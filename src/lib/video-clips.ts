// Clips de la sección "Vídeos de obras". El `id` coincide con el slug que genera
// `npm run videos` a partir del nombre del archivo en /videos-seleccionados.
// Orden = orden alfabético de los archivos = orden de las tarjetas.

export interface VideoClip {
  /** Slug del archivo: /public/videos/<id>.mp4 y /public/videos/<id>.webp */
  readonly id: string;
  /** Título corto de la tarjeta; base del aria-label. */
  readonly title: string;
  /** Segundo del vídeo usado como portada. Por defecto, el 30 % de la duración. */
  readonly posterAt?: number;
}

export const videoClips: readonly VideoClip[] = [
  { id: "acabados-habitacion-ventana-nueva", title: "Acabados y ventana nueva" },
  { id: "bano-mueble-madera-pintura", title: "Baño en acabados" },
  { id: "obra-en-bruto-pasillo-instalaciones", title: "Reforma desde cero" },
  { id: "tarima-colocacion-vivienda", title: "Colocación de tarima" },
  { id: "vivienda-solado-gris-terminada", title: "Terminando la obra" },
];

export function videoSrc(clip: VideoClip): string {
  return `/videos/${clip.id}.mp4`;
}

export function posterSrc(clip: VideoClip): string {
  return `/videos/${clip.id}.webp`;
}
