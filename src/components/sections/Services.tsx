import { services } from "@/lib/services-data";
import { Reveal } from "@/components/ui/Reveal";

export function Services() {
  return (
    <section id="servicios" className="bg-gray-50 px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">
            Nuestros Servicios
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Reveal key={service.title} delay={index * 0.08}>
                <div className="group relative flex h-full flex-col items-center overflow-hidden rounded-2xl bg-white p-8 text-center transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-lg">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 transition-colors duration-300 group-hover:bg-brand">
                    <Icon
                      className="h-7 w-7 text-brand transition-colors duration-300 group-hover:text-white"
                      aria-hidden="true"
                    />
                  </div>

                  <h3 className="mt-4 text-lg font-semibold text-slate-900">
                    {service.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    {service.description}
                  </p>

                  <span
                    className="absolute bottom-0 left-1/2 h-0.5 w-0 -translate-x-1/2 rounded-full bg-brand transition-all duration-300 group-hover:w-12"
                    aria-hidden="true"
                  />
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
