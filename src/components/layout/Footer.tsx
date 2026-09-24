import Image from "next/image";
import { siteConfig } from "@/lib/site-config";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-100 bg-slate-50 px-6 py-10 text-center">
      <Image
        src="/brand/hb-icon.png"
        alt={siteConfig.brandName}
        width={424}
        height={222}
        className="mx-auto h-8 w-auto"
      />
      <p className="mt-4 text-xs text-slate-400">
        © {year} {siteConfig.brandName}. Todos los derechos reservados.
      </p>
      <p className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-400">
        Desarrollado por
        <Image
          src="/brand/terry-logo.png"
          alt="Terry — Web Developer"
          width={537}
          height={319}
          className="h-9 w-auto opacity-80 transition-opacity hover:opacity-100"
        />
      </p>
    </footer>
  );
}
