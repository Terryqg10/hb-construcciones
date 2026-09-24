"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Play, X } from "lucide-react";
import { videoItems } from "@/lib/video-data";
import { Reveal } from "@/components/ui/Reveal";

export function VideoDemo() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (activeIndex === null) return;

    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveIndex(null);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeIndex]);

  const activeVideo = activeIndex !== null ? videoItems[activeIndex] : null;

  return (
    <div className="mt-6">
      {videoItems.map((video, index) => (
        <Reveal key={video.src} delay={0.1}>
          <button
            type="button"
            onClick={() => setActiveIndex(index)}
            className="group relative block aspect-video w-full overflow-hidden rounded-2xl"
          >
            <Image
              src={video.poster}
              alt={video.title}
              fill
              sizes="(min-width: 1024px) 1152px, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-slate-900/30 transition-colors duration-300 group-hover:bg-slate-900/40" />

            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 shadow-lg transition-transform duration-300 group-hover:scale-110">
                <Play
                  className="h-6 w-6 translate-x-0.5 text-brand"
                  fill="currentColor"
                  aria-hidden="true"
                />
              </span>
            </span>

            <span className="absolute bottom-4 left-4 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
              {video.title}
            </span>
          </button>
        </Reveal>
      ))}

      {activeVideo && mounted
        ? createPortal(
            <div
              className="animate-menu-in fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 p-6 backdrop-blur-sm"
              onClick={() => setActiveIndex(null)}
            >
              <button
                type="button"
                aria-label="Cerrar video"
                onClick={() => setActiveIndex(null)}
                className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>

              <div
                className="w-full max-w-4xl overflow-hidden rounded-2xl bg-black shadow-2xl"
                onClick={(event) => event.stopPropagation()}
              >
                <video
                  key={activeVideo.src}
                  src={activeVideo.src}
                  poster={activeVideo.poster}
                  controls
                  autoPlay
                  playsInline
                  className="aspect-video w-full"
                >
                  Tu navegador no soporta la reproducción de video.
                </video>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
