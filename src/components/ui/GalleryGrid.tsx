"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence } from "framer-motion";
import type { GalleryPhoto } from "@/lib/galeria-data";
import { Reveal } from "@/components/ui/Reveal";
import { GalleryLightbox } from "@/components/ui/GalleryLightbox";

const INITIAL_VISIBLE = 9;

interface GalleryGridProps {
  photos: readonly GalleryPhoto[];
}

export function GalleryGrid({ photos }: GalleryGridProps) {
  const [showAll, setShowAll] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const returnFocusIndex = useRef<number | null>(null);

  const visiblePhotos = showAll ? photos : photos.slice(0, INITIAL_VISIBLE);
  const hiddenCount = photos.length - visiblePhotos.length;

  // Al cerrar el visor, el foco vuelve a la miniatura de la última foto vista.
  useEffect(() => {
    if (activeIndex !== null || returnFocusIndex.current === null) return;
    thumbRefs.current[returnFocusIndex.current]?.focus({ preventScroll: true });
    returnFocusIndex.current = null;
  }, [activeIndex, showAll]);

  const closeLightbox = () => {
    if (activeIndex === null) return;
    returnFocusIndex.current = activeIndex;
    // Si se navegó hasta una foto aún oculta, se despliega el mosaico para poder devolverle el foco.
    if (activeIndex >= visiblePhotos.length) setShowAll(true);
    setActiveIndex(null);
  };

  return (
    <>
      <div className="mt-12 grid grid-cols-2 items-start gap-3 sm:grid-cols-3">
        {visiblePhotos.map((photo, index) => (
          <Reveal key={photo.src} delay={(index % 3) * 0.06} className="overflow-hidden rounded-xl">
            <button
              ref={(node) => {
                thumbRefs.current[index] = node;
              }}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Ampliar foto: ${photo.alt}`}
              className="block w-full cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                sizes="(min-width: 1152px) 376px, (min-width: 640px) 33vw, 50vw"
                className="h-auto w-full transition-transform duration-500 hover:scale-105"
              />
            </button>
          </Reveal>
        ))}
      </div>

      <p className="sr-only" aria-live="polite">
        {showAll ? `Mostrando los ${photos.length} trabajos.` : ""}
      </p>

      {hiddenCount > 0 && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="rounded-full bg-slate-900 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            Ver más trabajos
          </button>
        </div>
      )}

      <AnimatePresence>
        {activeIndex !== null && (
          <GalleryLightbox
            photos={photos}
            index={activeIndex}
            onIndexChange={setActiveIndex}
            onClose={closeLightbox}
          />
        )}
      </AnimatePresence>
    </>
  );
}
