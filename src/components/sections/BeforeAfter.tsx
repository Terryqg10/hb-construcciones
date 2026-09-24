import { beforeAfterItems } from "@/lib/before-after-data";
import { BeforeAfterSlider } from "@/components/sections/BeforeAfterSlider";
import { Reveal } from "@/components/ui/Reveal";

export function BeforeAfter() {
  return (
    <section id="antes-despues" className="bg-white px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">
            Antes y Después
          </h2>
          <p className="mt-3 text-center text-sm text-slate-500">
            Desliza para ver la transformación.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {beforeAfterItems.map((item, index) => (
            <Reveal key={item.label} delay={index * 0.1}>
              <BeforeAfterSlider item={item} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
