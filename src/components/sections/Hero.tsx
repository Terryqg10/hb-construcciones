import Image from "next/image";
import {
  MessageCircle,
  Clock,
  FileCheck,
  ShieldCheck,
  Star,
  ArrowRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { testimonials } from "@/lib/testimonials-data";

interface TrustBadge {
  readonly icon: LucideIcon;
  readonly label: string;
}

const trustBadges: readonly TrustBadge[] = [
  { icon: Clock, label: "Respuesta en 24h" },
  { icon: FileCheck, label: "Presupuesto Gratis" },
  { icon: ShieldCheck, label: "Garantía de Obra" },
] as const;

const avatarStyles = [
  "bg-brand",
  "bg-slate-900",
  "bg-slate-400",
] as const;

const featuredReview = testimonials[0];
const averageRating = (
  testimonials.reduce((sum, item) => sum + item.rating, 0) / testimonials.length
).toFixed(1);

function initials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export function Hero() {
  return (
    <section className="bg-slate-50 px-3 py-4 sm:px-5 sm:py-6 lg:px-6 lg:py-7">
      <div className="mx-auto max-w-[1400px] overflow-hidden rounded-[28px] lg:rounded-[32px]">
        {/* Foto + overlays: a sangre en mobile, panel con esquinas redondeadas en desktop */}
        <div className="relative h-[320px] sm:h-[420px] lg:h-[720px]">
          <Image
            src="/hero-bg.webp"
            alt="Profesional de HB Construcciones pintando una pared en una obra en curso"
            fill
            priority
            quality={90}
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition: "62% 30%" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/15 to-transparent lg:bg-gradient-to-r lg:from-slate-950/90 lg:via-slate-950/55 lg:to-transparent" />

          {/* Rating: chip compacto en mobile, tarjeta completa en desktop */}
          <div className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 shadow-lg lg:hidden">
            <span className="text-sm font-extrabold text-slate-900">{averageRating}</span>
            <Star className="h-3.5 w-3.5 fill-brand text-brand" aria-hidden="true" />
            <span className="text-xs text-slate-500">Valorado por clientes</span>
          </div>

          <div className="absolute right-8 top-8 hidden w-[280px] rounded-2xl bg-white p-5 shadow-2xl lg:block">
            <div className="flex items-center justify-between">
              <div className="flex">
                {testimonials.map((item, index) => (
                  <div
                    key={item.name}
                    style={index > 0 ? { marginLeft: -7 } : undefined}
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white ${avatarStyles[index % avatarStyles.length]}`}
                  >
                    {initials(item.name)}
                  </div>
                ))}
              </div>
              <a
                href="#valoraciones"
                className="flex items-center gap-1 text-xs font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 transition hover:decoration-slate-900"
              >
                Ver valoraciones
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </a>
            </div>
            <p className="mt-3.5 text-[13px] leading-relaxed text-slate-600">
              &ldquo;{featuredReview.quote}&rdquo;
            </p>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-slate-900">{averageRating}</span>
              <Star className="h-3.5 w-3.5 fill-brand text-brand" aria-hidden="true" />
              <span className="text-xs text-slate-400">· {testimonials.length} valoraciones</span>
            </div>
          </div>

          {/* Texto principal: bloque normal debajo de la foto en mobile, overlay a la izquierda en desktop */}
          <div className="hidden lg:pointer-events-none lg:absolute lg:inset-0 lg:flex lg:flex-col lg:justify-start lg:px-14 lg:pt-16 xl:px-16">
            <div className="pointer-events-auto max-w-[560px]">
              <span className="inline-flex w-fit items-center rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
                Reformas · Piscinas · Obra Nueva
              </span>

              <h1 className="mt-5 text-[44px] font-extrabold leading-[1.08] tracking-tight text-white xl:text-5xl">
                Expertos en Reformas Integrales y Construcción de Piscinas
              </h1>

              <p className="mt-5 max-w-[440px] text-base leading-relaxed text-white/85">
                Expertos en reformas integrales y construcción de piscinas.
                Contactanos por WhatsApp y recibí tu presupuesto.
              </p>

              <div className="mt-8 flex gap-3.5">
                <a
                  href={siteConfig.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-dark active:scale-[0.97]"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  Escríbenos por WhatsApp
                </a>

                <a
                  href="#galeria"
                  className="flex items-center justify-center rounded-full border border-white/60 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10 active:scale-[0.97]"
                >
                  Ver nuestros trabajos
                </a>
              </div>

              <div className="mt-7 flex flex-wrap gap-2.5">
                {trustBadges.map((badge) => {
                  const Icon = badge.icon;
                  return (
                    <span
                      key={badge.label}
                      className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-medium text-white/90"
                    >
                      <Icon className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
                      {badge.label}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Presupuesto gratis: tarjeta flotante en desktop, con espacio propio respecto al resto */}
          <a
            href={siteConfig.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-10 left-14 hidden w-[210px] rounded-2xl border border-white/20 bg-slate-950/60 p-4 backdrop-blur-md transition hover:bg-slate-950/75 lg:block"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-orange-300">
              Presupuesto Gratis
            </p>
            <p className="mt-1.5 text-[15px] font-semibold leading-snug text-white">
              Contanos tu proyecto hoy
            </p>
            <span className="mt-2.5 flex items-center gap-1.5 text-[13px] font-semibold text-white">
              Escribinos
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
          </a>
        </div>

        {/* Texto principal en mobile/tablet: bloque normal debajo de la foto */}
        <div className="bg-white px-5 py-6 sm:px-8 sm:py-8 lg:hidden">
          <span className="inline-flex w-fit items-center rounded-full border border-orange-200 bg-orange-50 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-brand-dark">
            Reformas · Piscinas · Obra Nueva
          </span>

          <h1 className="mt-4 text-[28px] font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
            Expertos en Reformas Integrales y Construcción de Piscinas
          </h1>

          <p className="mt-3.5 text-sm leading-relaxed text-slate-500 sm:text-base">
            Expertos en reformas integrales y construcción de piscinas.
            Contactanos por WhatsApp y recibí tu presupuesto.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a
              href={siteConfig.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-dark active:scale-[0.97]"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Escríbenos por WhatsApp
            </a>

            <a
              href="#galeria"
              className="flex items-center justify-center rounded-full border border-slate-300 px-6 py-3.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 active:scale-[0.97]"
            >
              Ver nuestros trabajos
            </a>
          </div>

          <a
            href={siteConfig.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-slate-950 px-4 py-3.5 transition active:scale-[0.98]"
          >
            <span>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-orange-300">
                Presupuesto Gratis
              </span>
              <span className="mt-0.5 block text-sm font-semibold text-white">
                Contanos tu proyecto hoy
              </span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-white" aria-hidden="true" />
          </a>

          <div className="mt-5 flex flex-wrap gap-2">
            {trustBadges.map((badge) => {
              const Icon = badge.icon;
              return (
                <span
                  key={badge.label}
                  className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600"
                >
                  <Icon className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
                  {badge.label}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
