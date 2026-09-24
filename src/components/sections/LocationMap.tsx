import { HardHat } from "lucide-react";
import { location, buildGoogleMapsHref, buildOsmEmbedSrc } from "@/lib/location-data";
import { Reveal } from "@/components/ui/Reveal";

export function LocationMap() {
  const googleMapsHref = buildGoogleMapsHref(location.lat, location.lon);
  const osmEmbedSrc = buildOsmEmbedSrc(location.lat, location.lon);

  return (
    <section id="ubicacion" className="bg-gray-50 px-6 py-20">
      <div className="mx-auto max-w-4xl">
        <Reveal>
          <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">
            Dónde Estamos
          </h2>
          <p className="mt-3 text-center text-sm text-slate-500">
            {location.label}
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-10">
          <a
            href={googleMapsHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Abrir ${location.label} en Google Maps`}
            className="group relative block aspect-video overflow-hidden rounded-2xl shadow-md"
          >
            <iframe
              src={osmEmbedSrc}
              title={`Mapa de ubicación: ${location.label}`}
              loading="lazy"
              tabIndex={-1}
              aria-hidden="true"
              className="pointer-events-none h-full w-full"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/0 transition-colors duration-300 group-hover:bg-slate-900/10">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-lg ring-4 ring-white transition-transform duration-300 group-hover:scale-110">
                <HardHat className="h-7 w-7" aria-hidden="true" />
              </span>
            </div>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
