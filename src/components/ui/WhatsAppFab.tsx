import { siteConfig } from "@/lib/site-config";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

export function WhatsAppFab() {
  return (
    <a
      href={siteConfig.whatsappHref}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      className="fixed bottom-6 right-6 z-50 hidden h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition hover:bg-green-600 hover:scale-105 active:scale-95 sm:flex"
    >
      <WhatsAppIcon className="h-7 w-7" aria-hidden="true" />
    </a>
  );
}
