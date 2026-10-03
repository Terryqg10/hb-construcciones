"use client";

import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface VideoCarouselProps {
  /** Un <li> por tarjeta. */
  children: ReactNode;
}

// Fracción mínima de una tarjeta visible para considerarla la "activa".
const ACTIVE_THRESHOLD = 0.6;

const ARROW_CLASSES =
  "absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-slate-900 shadow-lg transition hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 sm:hidden";

// Móvil: carrusel con scroll-snap que deja ver un trozo de la siguiente tarjeta.
// Desde sm: fila centrada que salta de línea (el carrusel deja de ser necesario).
export function VideoCarousel({ children }: VideoCarouselProps) {
  const count = Children.count(children);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  // El texto guía sobra en cuanto el usuario ya ha usado el carrusel (deslizando o con los botones).
  const [used, setUsed] = useState(false);

  // Tarjeta activa = la más visible dentro del contenedor. Sin listener de scroll.
  useEffect(() => {
    const scroller = scrollerRef.current;
    const list = listRef.current;
    if (scroller === null || list === null) return;

    const items = Array.from(list.children);
    const ratios = new Map<Element, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) ratios.set(entry.target, entry.intersectionRatio);
        let best = 0;
        let bestRatio = -1;
        items.forEach((item, index) => {
          const ratio = ratios.get(item) ?? 0;
          if (ratio > bestRatio) {
            best = index;
            bestRatio = ratio;
          }
        });
        if (bestRatio >= ACTIVE_THRESHOLD) {
          setActiveIndex(best);
          if (best > 0) setUsed(true);
        }
      },
      { root: scroller, threshold: [0.25, ACTIVE_THRESHOLD, 0.9, 1] },
    );
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [count]);

  // Lleva la tarjeta indicada al inicio del carrusel, respetando el relleno de snap.
  const scrollToIndex = useCallback((index: number) => {
    const scroller = scrollerRef.current;
    const target = listRef.current?.children[index];
    if (scroller === null || target === undefined) return;

    setUsed(true);
    const snapPadding = Number.parseFloat(getComputedStyle(scroller).scrollPaddingLeft) || 0;
    const offset = target.getBoundingClientRect().left - scroller.getBoundingClientRect().left;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    scroller.scrollTo({
      left: scroller.scrollLeft + offset - snapPadding,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, []);

  return (
    <div className="mt-8">
      {/* Las flechas se centran respecto a las tarjetas, no a puntos ni texto de debajo. */}
      <div className="relative">
        <div
          ref={scrollerRef}
          role="region"
          aria-label="Vídeos de obras, desplázate para ver más"
          tabIndex={0}
          className="-mx-6 snap-x snap-mandatory overflow-x-auto scroll-px-6 rounded-2xl [scrollbar-width:none] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand sm:mx-0 sm:overflow-visible [&::-webkit-scrollbar]:hidden"
        >
          <ul
            ref={listRef}
            className="flex w-max min-w-full gap-4 px-6 py-1 max-sm:justify-center sm:w-full sm:flex-wrap sm:justify-center sm:px-0"
          >
            {children}
          </ul>
        </div>

        {activeIndex > 0 ? (
          <button
            type="button"
            onClick={() => scrollToIndex(activeIndex - 1)}
            aria-label="Ver el vídeo anterior"
            className={`left-2 ${ARROW_CLASSES}`}
          >
            <ChevronLeft className="h-6 w-6" aria-hidden="true" />
          </button>
        ) : null}
        {activeIndex < count - 1 ? (
          <button
            type="button"
            onClick={() => scrollToIndex(activeIndex + 1)}
            aria-label="Ver el vídeo siguiente"
            className={`right-2 ${ARROW_CLASSES}`}
          >
            <ChevronRight className="h-6 w-6" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      {count > 1 ? (
        <div role="group" aria-label="Elegir vídeo" className="mt-3 flex justify-center sm:hidden">
          {Array.from({ length: count }, (_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => scrollToIndex(index)}
              aria-label={`Ir al vídeo ${index + 1} de ${count}`}
              aria-current={index === activeIndex ? "true" : undefined}
              className="group flex h-8 w-6 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <span
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === activeIndex ? "w-5 bg-brand" : "w-2 bg-slate-300 group-hover:bg-slate-400"
                }`}
              />
            </button>
          ))}
        </div>
      ) : null}

      {count > 1 && !used ? (
        <p className="mt-1 text-center text-sm text-slate-500 sm:hidden">
          Desliza o pulsa las flechas para ver más vídeos.
        </p>
      ) : null}

      {count > 1 ? (
        <p className="sr-only" aria-live="polite">
          Vídeo {activeIndex + 1} de {count}
        </p>
      ) : null}
    </div>
  );
}
