"use client";

import { useEffect, useRef, useState } from "react";
import { explodedLayers } from "@/lib/exploded-view-data";

// Empuje extra (%) que se suma a la capa que está bajo el cursor.
const HOVER_LIFT = 3;

export function ExplodedView() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Misma lógica manual de ProcessSteps.tsx: mide la posición del "escenario"
  // 3D respecto al centro del viewport y la convierte en un valor 0-1.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    let frameId = 0;

    const update = () => {
      const rect = el.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const scrollWindow = window.innerHeight * 0.6;
      const raw = (viewportCenter - rect.top) / scrollWindow;
      setProgress(Math.min(1, Math.max(0, raw)));
    };

    const onScroll = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section className="bg-white px-6 py-24">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.8fr_1fr_0.8fr] lg:items-center lg:gap-8">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            Anatomía de una reforma
          </span>
          <h2 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl">
            Lo que no ves,
            <br />
            importa tanto como lo que ves
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-slate-500">
            Detrás de cada acabado hay capas que nunca vas a ver terminada la
            obra, pero que definen si dura 5 años o 50. Así se arma un muro
            desde el bloque desnudo hasta el acabado final.
          </p>
        </div>

        <div
          ref={stageRef}
          className="relative h-[380px] w-full sm:h-[460px] lg:h-auto lg:self-stretch"
          style={{ perspective: "1600px" }}
        >
          {explodedLayers.map((layer, index) => {
            const isHovered = hoveredId === layer.id;

            // La fila de la lista que le corresponde a esta capa (mismo orden
            // invertido con el que se pinta la lista de la derecha).
            const rowFromTop = explodedLayers.length - 1 - index;
            const targetPercent =
              ((rowFromTop + 0.5) / explodedLayers.length) * 100;

            // progress=0 -> todas apiladas en el centro (bloque cerrado).
            // progress=1 -> cada una en la altura exacta de su fila.
            let topPercent = 50 + (targetPercent - 50) * progress;
            if (isHovered) topPercent -= HOVER_LIFT;

            const scale = isHovered ? 1.05 : 1;
            const zIndex = index;

            if (layer.transparent) {
              return (
                <div
                  key={layer.id}
                  onMouseEnter={() => setHoveredId(layer.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className="absolute left-1/2 w-full max-w-lg -translate-x-1/2 transition-[top] duration-500 ease-out"
                  style={{ top: `${topPercent}%`, zIndex }}
                >
                  <div
                    className="h-20 rounded-2xl border-2 border-dashed backdrop-blur-sm transition-[border-color,background-color,transform] duration-300 ease-out sm:h-24 lg:h-28"
                    style={{
                      transform: `translateY(-50%) rotateX(58deg) scale(${scale})`,
                      background: isHovered
                        ? "rgba(254,109,0,0.08)"
                        : "rgba(100,116,139,0.06)",
                      borderColor: isHovered
                        ? "rgba(254,109,0,0.7)"
                        : "rgba(100,116,139,0.4)",
                    }}
                  />
                </div>
              );
            }

            return (
              <div
                key={layer.id}
                onMouseEnter={() => setHoveredId(layer.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="absolute left-1/2 w-full max-w-lg -translate-x-1/2 transition-[top] duration-500 ease-out"
                style={{ top: `${topPercent}%`, zIndex }}
              >
                <div
                  className="h-20 overflow-hidden rounded-2xl ring-1 transition-[box-shadow,transform] duration-300 ease-out sm:h-24 lg:h-28"
                  style={{
                    transform: `translateY(-50%) rotateX(58deg) scale(${scale})`,
                    background: layer.visual,
                    boxShadow: isHovered
                      ? "0 25px 50px -12px rgba(254,109,0,0.35)"
                      : "0 20px 35px -15px rgba(15,23,42,0.35)",
                    ["--tw-ring-color" as string]: isHovered
                      ? "rgba(254,109,0,0.6)"
                      : "rgba(15,23,42,0.08)",
                  }}
                />
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-0.5">
          {[...explodedLayers].reverse().map((layer, index) => {
            const isHovered = hoveredId === layer.id;
            return (
              <div
                key={layer.id}
                onMouseEnter={() => setHoveredId(layer.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="flex items-start gap-3 border-t border-slate-100 py-3.5 transition-all duration-300 first:border-t-0"
                style={{
                  opacity: 0.35 + progress * 0.65,
                  transform: isHovered ? "translateX(6px)" : "translateX(0)",
                }}
              >
                <span
                  className="mt-0.5 text-xs font-semibold transition-colors duration-300"
                  style={{ color: isHovered ? "#fe6d00" : "#64748b" }}
                >
                  0{explodedLayers.length - index}
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {layer.title}
                  </p>
                  <p className="mt-0.5 text-sm text-slate-500">
                    {layer.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
