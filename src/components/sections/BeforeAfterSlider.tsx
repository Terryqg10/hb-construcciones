"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronsLeftRight } from "lucide-react";
import type { BeforeAfterItem } from "@/lib/before-after-data";

export function BeforeAfterSlider({ item }: { item: BeforeAfterItem }) {
  const [position, setPosition] = useState(50);
  const [hasInteracted, setHasInteracted] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-semibold text-slate-900">{item.label}</p>

      <div className="group relative aspect-4/3 select-none overflow-hidden rounded-2xl">
        <Image src={item.after} alt={`${item.label} después`} fill className="object-cover" />

        <div
          className="absolute inset-y-0 left-0 overflow-hidden"
          style={{ width: `${position}%` }}
        >
          <Image
            src={item.before}
            alt={`${item.label} antes`}
            fill
            className="object-cover"
          />
        </div>

        <div
          className="pointer-events-none absolute inset-y-0 w-0.5 bg-white"
          style={{ left: `${position}%` }}
        />

        <div
          className="pointer-events-none absolute top-1/2 z-10 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-black/5 transition-transform duration-200 group-hover:scale-110"
          style={{ left: `${position}%` }}
        >
          <ChevronsLeftRight
            className={`h-5 w-5 text-slate-700 ${hasInteracted ? "" : "animate-drag-hint"}`}
            aria-hidden="true"
          />
        </div>

        <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
          Antes
        </span>
        <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
          Después
        </span>

        <input
          type="range"
          min={0}
          max={100}
          value={position}
          onChange={(event) => {
            setPosition(Number(event.target.value));
            setHasInteracted(true);
          }}
          aria-label={`Comparar antes y después: ${item.label}`}
          className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
        />
      </div>
    </div>
  );
}
