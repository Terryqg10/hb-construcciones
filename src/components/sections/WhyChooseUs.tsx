import { advantages } from "@/lib/advantages-data";
import { Reveal } from "@/components/ui/Reveal";

export function WhyChooseUs() {
  return (
    <section id="por-que-elegirnos" className="bg-slate-50 px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">
            Por Qué Elegirnos
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {advantages.map((advantage, index) => (
            <Reveal
              key={advantage.title}
              delay={index * 0.08}
              className={index % 2 === 1 ? "lg:mt-6" : ""}
            >
              <div className="flex h-full flex-col items-center gap-2 rounded-2xl bg-white p-8 text-center transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-lg">
                <p className="text-5xl font-extrabold tracking-tight text-brand">
                  {advantage.stat}
                </p>
                <h3 className="mt-2 text-lg font-bold text-slate-900">
                  {advantage.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-500">
                  {advantage.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
