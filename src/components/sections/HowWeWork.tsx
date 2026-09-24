import { Reveal } from "@/components/ui/Reveal";
import { ProcessSteps } from "@/components/sections/ProcessSteps";

export function HowWeWork() {
  return (
    <section id="como-trabajamos" className="bg-gray-50 px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">
            Cómo Trabajamos
          </h2>
        </Reveal>

        <ProcessSteps />
      </div>
    </section>
  );
}
