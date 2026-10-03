import { Phone } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

export function MobileContactBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(15,23,42,0.08)] sm:hidden">
      <a
        href={siteConfig.phoneHref}
        className="flex flex-1 items-center justify-center gap-2 py-3.5 text-sm font-semibold text-slate-900 transition active:bg-slate-50"
      >
        <Phone className="h-4 w-4" aria-hidden="true" />
        Llamar
      </a>
      <a
        href={siteConfig.whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-1 items-center justify-center gap-2 bg-green-500 py-3.5 text-sm font-semibold text-white transition active:bg-green-600"
      >
        <WhatsAppIcon className="h-4 w-4" aria-hidden="true" />
        WhatsApp
      </a>
    </div>
  );
}
