"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, TouchEvent as ReactTouchEvent } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { GalleryPhoto } from "@/lib/galeria-data";

const SWIPE_THRESHOLD_PX = 50;
const SLIDE_OFFSET_PX = 40;

interface GalleryLightboxProps {
  photos: readonly GalleryPhoto[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

const controlClass =
  "flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white";

export function GalleryLightbox({ photos, index, onIndexChange, onClose }: GalleryLightboxProps) {
  const reduceMotion = useReducedMotion();
  const [direction, setDirection] = useState<1 | -1>(1);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchStartX = useRef<number | null>(null);

  const photo = photos[index];
  const total = photos.length;

  const goTo = (step: 1 | -1) => {
    setDirection(step);
    onIndexChange((index + step + total) % total);
  };

  // Bloquea el scroll de la página y lleva el foco al botón de cerrar.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      onClose();
    } else if (event.key === "ArrowRight") {
      goTo(1);
    } else if (event.key === "ArrowLeft") {
      goTo(-1);
    } else if (event.key === "Tab") {
      // Foco atrapado dentro del visor.
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>("button");
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  };

  const handleTouchStart = (event: ReactTouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const handleTouchEnd = (event: ReactTouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;
    const deltaX = event.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX) return;
    goTo(deltaX < 0 ? 1 : -1);
  };

  const slide = reduceMotion ? 0 : SLIDE_OFFSET_PX;

  return (
    <motion.div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Galería de trabajos ampliada"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.2 }}
      onClick={onClose}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label="Cerrar galería"
        className={`absolute right-4 top-4 ${controlClass}`}
      >
        <X className="h-6 w-6" aria-hidden="true" />
      </button>

      <p className="absolute left-1/2 top-6 -translate-x-1/2 text-sm font-medium text-white/80" aria-live="polite">
        {index + 1} / {total}
      </p>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          goTo(-1);
        }}
        aria-label="Foto anterior"
        className={`absolute left-3 top-1/2 -translate-y-1/2 sm:left-6 ${controlClass}`}
      >
        <ChevronLeft className="h-6 w-6" aria-hidden="true" />
      </button>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          goTo(1);
        }}
        aria-label="Foto siguiente"
        className={`absolute right-3 top-1/2 -translate-y-1/2 sm:right-6 ${controlClass}`}
      >
        <ChevronRight className="h-6 w-6" aria-hidden="true" />
      </button>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={photo.src}
          className="flex max-h-[82vh] max-w-full items-center justify-center overflow-hidden rounded-2xl"
          initial={{ opacity: 0, x: direction * slide, scale: reduceMotion ? 1 : 0.94 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -direction * slide, scale: 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.22, ease: "easeOut" }}
          onClick={(event) => event.stopPropagation()}
        >
          <Image
            src={photo.src}
            alt={photo.alt}
            width={photo.width}
            height={photo.height}
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="h-auto max-h-[82vh] w-auto max-w-full object-contain"
          />
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
