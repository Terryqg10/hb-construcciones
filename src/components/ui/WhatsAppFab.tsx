import type { SVGProps } from "react";
import { siteConfig } from "@/lib/site-config";

function WhatsAppIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" {...props}>
      <path d="M16.004 2.667c-7.364 0-13.333 5.969-13.333 13.333 0 2.51.7 4.855 1.913 6.86L2.667 29.333l6.633-1.874a13.26 13.26 0 0 0 6.704 1.821c7.364 0 13.333-5.969 13.333-13.333S23.368 2.667 16.004 2.667Zm0 24.242a11.36 11.36 0 0 1-5.87-1.626l-.42-.25-3.936 1.112 1.08-3.878-.274-.398a10.9 10.9 0 0 1-1.746-5.87c0-6.04 4.912-10.951 10.951-10.951s10.951 4.911 10.951 10.951c0 6.039-4.912 10.91-10.951 10.91Zm5.986-8.17c-.328-.164-1.94-.958-2.24-1.067-.3-.11-.518-.164-.737.164-.219.327-.847 1.067-1.038 1.286-.191.219-.383.246-.71.082-1.922-.96-3.184-1.716-4.452-3.892-.336-.578.336-.537.96-1.787.106-.219.053-.41-.055-.573-.11-.164-.737-1.777-1.01-2.433-.267-.64-.539-.554-.737-.564-.191-.008-.41-.01-.628-.01-.219 0-.573.082-.874.41-.3.328-1.147 1.122-1.147 2.736 0 1.613 1.174 3.171 1.338 3.39.164.219 2.252 3.44 5.462 4.687 2.72 1.06 3.276.85 3.867.796.592-.055 1.94-.792 2.213-1.558.273-.765.273-1.421.191-1.558-.082-.137-.3-.219-.628-.383Z" />
    </svg>
  );
}

export function WhatsAppFab() {
  return (
    <a
      href={siteConfig.whatsappHref}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition hover:bg-green-600 hover:scale-105 active:scale-95"
    >
      <WhatsAppIcon className="h-7 w-7" aria-hidden="true" />
    </a>
  );
}
