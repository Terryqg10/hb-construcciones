import Image from "next/image";
import { MessageCircle, Clock, FileCheck, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

interface TrustBadge {
  readonly icon: LucideIcon;
  readonly label: string;
}

const trustBadges: readonly TrustBadge[] = [
  { icon: Clock, label: "Respuesta en 24h" },
  { icon: FileCheck, label: "Presupuesto Gratis" },
  { icon: ShieldCheck, label: "Garantía de Obra" },
] as const;

export function Hero() {
  return (
    <section className="relative flex min-h-[85vh] w-full items-center justify-center overflow-hidden">
      <Image
        src="/hero-bg.webp"
        alt="Profesional de HB Construcciones pintando una pared en una obra en curso"
        fill
        priority
        quality={90}
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-slate-900/60" />

      <div className="relative z-10 flex max-w-3xl flex-col items-center gap-6 px-6 text-center">
        <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
          Expertos en Reformas Integrales y Construcción de Piscinas
        </h1>

        <div className="flex flex-col gap-4 sm:flex-row">
          <a
            href={siteConfig.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark active:scale-[0.97]"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Escríbenos por WhatsApp
          </a>

          <a
            href="#galeria"
            className="flex items-center justify-center rounded-full border border-white px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 active:scale-[0.97]"
          >
            Ver nuestros trabajos
          </a>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-medium text-white/90 sm:text-sm">
          {trustBadges.map((badge) => {
            const Icon = badge.icon;
            return (
              <span
                key={badge.label}
                className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-sm"
              >
                <Icon className="h-4 w-4 text-brand" aria-hidden="true" />
                {badge.label}
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
