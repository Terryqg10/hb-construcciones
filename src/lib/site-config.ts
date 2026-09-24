interface SiteConfig {
  readonly brandName: string;
  readonly phoneNumber: string;
  readonly phoneHref: string;
  readonly whatsappNumber: string;
  readonly whatsappMessage: string;
  readonly whatsappHref: string;
}

const whatsappNumber = "34641087374";
const whatsappMessage = "Hola, quiero consultar por una reforma / construcción de piscina.";

export const siteConfig: SiteConfig = {
  brandName: "HB CONSTRUCCIONES",
  phoneNumber: "+34 641 08 73 74",
  phoneHref: "tel:+34641087374",
  whatsappNumber,
  whatsappMessage,
  whatsappHref: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`,
};

export function buildWhatsAppHref(message: string): string {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}
