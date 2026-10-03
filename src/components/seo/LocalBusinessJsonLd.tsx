import { siteConfig } from "@/lib/site-config";
import { location } from "@/lib/location-data";
import { services } from "@/lib/services-data";

export function LocalBusinessJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    name: siteConfig.brandName,
    image: "/brand/hb-icon.png",
    telephone: siteConfig.phoneNumber,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Calle Empedrada",
      addressLocality: "Villanueva de la Cañada",
      postalCode: "28691",
      addressRegion: "Madrid",
      addressCountry: "ES",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: location.lat,
      longitude: location.lon,
    },
    areaServed: location.label,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Servicios",
      itemListElement: services.map((service) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: service.title,
          description: service.description,
        },
      })),
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
