import { galleryPhotos } from "@/lib/galeria-data";
import { Reveal } from "@/components/ui/Reveal";
import { GalleryGrid } from "@/components/ui/GalleryGrid";
import { VideoDemo } from "@/components/sections/VideoDemo";

export function Gallery() {
  return (
    <section id="galeria" className="bg-white px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">
            Nuestros Trabajos
          </h2>
        </Reveal>

        <GalleryGrid photos={galleryPhotos} />

        <VideoDemo />
      </div>
    </section>
  );
}
