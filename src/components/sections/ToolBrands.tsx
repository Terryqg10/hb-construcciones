import Image from "next/image";
import { toolBrands } from "@/lib/tool-brands-data";
import { Reveal } from "@/components/ui/Reveal";

export function ToolBrands() {
  return (
    <section className="bg-white px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <p className="text-center text-sm font-semibold text-slate-400">
            Trabajamos con herramientas de las mejores marcas
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
            {toolBrands.map((brand) => (
              <Image
                key={brand.name}
                src={brand.src}
                alt={brand.name}
                width={brand.width}
                height={brand.height}
                className="h-7 w-auto grayscale opacity-50 transition duration-300 hover:opacity-100 hover:grayscale-0"
              />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
