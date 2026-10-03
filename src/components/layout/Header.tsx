"use client";

import Image from "next/image";
import { useState } from "react";
import { Phone } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { NavMenu } from "@/components/layout/NavMenu";
import { HomeLink } from "@/components/layout/HomeLink";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <HomeLink
          className="flex items-center gap-2"
          onNavigate={() => setIsMenuOpen(false)}
        >
          <Image
            src="/brand/hb-logo-cliente.webp"
            alt="HB Construcciones"
            width={748}
            height={633}
            priority
            className="h-12 w-auto mix-blend-multiply"
          />
        </HomeLink>

        <div className="flex items-center gap-2">
          <a
            href={siteConfig.phoneHref}
            className="flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark active:scale-[0.97]"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Llamar ahora</span>
          </a>

          <NavMenu isOpen={isMenuOpen} onOpenChange={setIsMenuOpen} />
        </div>
      </div>
    </header>
  );
}
