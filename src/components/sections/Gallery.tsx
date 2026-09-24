import Image from "next/image";
import { galleryItems, type GallerySpan } from "@/lib/gallery-data";
import { Reveal } from "@/components/ui/Reveal";
import { VideoDemo } from "@/components/sections/VideoDemo";

const spanClasses: Record<GallerySpan, string> = {
  tall: "row-span-2",
  wide: "col-span-2",
  normal: "",
};

export function Gallery() {
  return (
    <section id="galeria" className="bg-gray-50 px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">
            Nuestros Trabajos
          </h2>
        </Reveal>

        <div className="mt-12 grid auto-rows-[160px] grid-cols-2 gap-3 sm:grid-cols-4">
          {galleryItems.map((item, index) => (
            <Reveal
              key={item.src}
              delay={index * 0.06}
              className={`relative overflow-hidden rounded-xl ${spanClasses[item.span]}`}
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(min-width: 640px) 25vw, 50vw"
                className="object-cover transition-transform duration-500 hover:scale-105"
              />
            </Reveal>
          ))}
        </div>

        <VideoDemo />
      </div>
    </section>
  );
}
