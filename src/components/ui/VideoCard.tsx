"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import { posterSrc, videoSrc, type VideoClip } from "@/lib/video-clips";

// Evento que emite una tarjeta al empezar a reproducir, para que las demás vuelvan a su portada.
const VIDEO_PLAY_EVENT = "hb:video-play";

declare global {
  interface WindowEventMap {
    "hb:video-play": CustomEvent<{ id: string }>;
  }
}

interface VideoCardProps {
  clip: VideoClip;
}

// Debe coincidir con el ancho real de la tarjeta que fija VideoGallery.
const POSTER_SIZES = "(min-width: 1024px) 208px, (min-width: 640px) 224px, 68vw";

// Muestra solo la portada; el <video> no existe en el DOM hasta que el usuario pulsa play,
// así que la página no descarga ningún .mp4 antes de eso.
export function VideoCard({ clip }: VideoCardProps) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!playing) return;

    window.dispatchEvent(new CustomEvent(VIDEO_PLAY_EVENT, { detail: { id: clip.id } }));
    const video = videoRef.current;
    // Sin el botón, el foco del teclado se perdería: pasa al reproductor.
    video?.focus();
    // Si el navegador bloquea el inicio automático, el usuario sigue pudiendo usar los controles.
    video?.play().catch(() => undefined);

    const onOtherPlay = (event: CustomEvent<{ id: string }>) => {
      if (event.detail.id !== clip.id) setPlaying(false);
    };
    window.addEventListener(VIDEO_PLAY_EVENT, onOtherPlay);
    return () => window.removeEventListener(VIDEO_PLAY_EVENT, onOtherPlay);
  }, [playing, clip.id]);

  return (
    <div className="relative aspect-[9/16] w-full">
      {playing ? (
        <div className="absolute inset-0 overflow-hidden rounded-2xl bg-black shadow-md">
          <video
            ref={videoRef}
            src={videoSrc(clip)}
            poster={posterSrc(clip)}
            aria-label={`Vídeo de obra: ${clip.title}`}
            controls
            autoPlay
            playsInline
            preload="none"
            className="h-full w-full object-contain"
          >
            Tu navegador no admite la reproducción de vídeo.
          </video>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Reproducir vídeo: ${clip.title}`}
          className="group absolute inset-0 overflow-hidden rounded-2xl bg-slate-900 shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          <Image
            src={posterSrc(clip)}
            alt=""
            fill
            sizes={POSTER_SIZES}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span className="absolute inset-0 bg-slate-900/20 transition-colors duration-300 group-hover:bg-slate-900/30" />

          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 shadow-lg transition-transform duration-300 group-hover:scale-110">
              <Play className="h-6 w-6 translate-x-0.5 text-brand" fill="currentColor" aria-hidden="true" />
            </span>
          </span>

          <span className="absolute inset-x-3 bottom-3 truncate rounded-full bg-black/50 px-3 py-1 text-center text-xs font-medium text-white backdrop-blur-sm">
            {clip.title}
          </span>
        </button>
      )}
    </div>
  );
}
