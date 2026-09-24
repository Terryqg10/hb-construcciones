"use client";

import { useEffect, useRef, useState } from "react";
import { processSteps } from "@/lib/process-steps-data";
import { Reveal } from "@/components/ui/Reveal";

export function ProcessSteps() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let frameId = 0;

    const update = () => {
      const rect = el.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const raw = (viewportCenter - rect.top) / rect.height;
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
    <div ref={containerRef} className="relative mt-16">
      <div
        className="absolute left-0 top-8 z-0 hidden h-[2px] w-full bg-slate-200 md:block"
        aria-hidden="true"
      />
      <div
        className="absolute left-0 top-8 z-[1] hidden h-[2px] w-full origin-left bg-brand md:block"
        style={{ transform: `scaleX(${progress})` }}
        aria-hidden="true"
      />

      <div className="hidden grid-cols-4 gap-10 md:grid">
        {processSteps.map((step, index) => (
          <Reveal key={step.number} delay={index * 0.1}>
            <div className="relative flex flex-col items-center text-center">
              <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-brand text-2xl font-extrabold text-white shadow-md">
                {step.number}
              </div>
              <h3 className="mt-6 text-lg font-bold text-slate-900">
                {step.title}
              </h3>
              <p className="mx-auto mt-2 max-w-[250px] text-sm leading-relaxed text-slate-500">
                {step.description}
              </p>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="relative mx-auto max-w-xs md:hidden">
        <div
          className="absolute left-6 top-6 bottom-6 z-0 w-[2px] bg-slate-200"
          aria-hidden="true"
        />
        <div
          className="absolute left-6 top-6 bottom-6 z-[1] w-[2px] origin-top bg-brand"
          style={{ transform: `scaleY(${progress})` }}
          aria-hidden="true"
        />

        <div className="flex flex-col gap-10">
          {processSteps.map((step, index) => (
            <Reveal key={step.number} delay={index * 0.1}>
              <div className="relative flex items-start gap-5">
                <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand text-lg font-extrabold text-white shadow-md">
                  {step.number}
                </div>
                <div className="pt-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    {step.description}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
