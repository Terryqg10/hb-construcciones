import Image from "next/image";
import { Phone } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { NavMenu } from "@/components/layout/NavMenu";
import { HomeLink } from "@/components/layout/HomeLink";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <HomeLink className="flex items-center gap-2">
          <Image
            src="/brand/hb-icon.png"
            alt="HB Construcciones"
            width={424}
            height={222}
            priority
            className="h-8 w-auto"
          />
          <span className="hidden text-lg font-bold tracking-tight text-slate-900 sm:inline">
            Construcciones
          </span>
        </HomeLink>

        <div className="flex items-center gap-2">
          <a
            href={siteConfig.phoneHref}
            className="flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark active:scale-[0.97]"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Llamar ahora</span>
          </a>

          <NavMenu />
        </div>
      </div>
    </header>
  );
}
