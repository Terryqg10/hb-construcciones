import { Star } from "lucide-react";
import { testimonials } from "@/lib/testimonials-data";
import { Reveal } from "@/components/ui/Reveal";

export function Testimonials() {
  return (
    <section id="valoraciones" className="bg-gray-50 px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">
            Lo Que Dicen Nuestros Clientes
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Reveal key={testimonial.name} delay={index * 0.08}>
              <div className="flex h-full flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }, (_, starIndex) => (
                    <Star
                      key={starIndex}
                      className={
                        starIndex < testimonial.rating
                          ? "h-4 w-4 fill-brand text-brand"
                          : "h-4 w-4 text-slate-200"
                      }
                      aria-hidden="true"
                    />
                  ))}
                </div>

                <p className="text-sm leading-relaxed text-slate-600">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>

                <div className="mt-auto">
                  <p className="text-sm font-semibold text-slate-900">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-slate-400">{testimonial.role}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
