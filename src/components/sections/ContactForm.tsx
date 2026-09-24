"use client";

import { useState, type FormEvent } from "react";
import { services } from "@/lib/services-data";
import { buildWhatsAppHref } from "@/lib/site-config";
import { Reveal } from "@/components/ui/Reveal";

interface FormValues {
  name: string;
  phone: string;
  service: string;
  message: string;
}

type FormErrors = Partial<Record<keyof FormValues, string>>;

const initialValues: FormValues = {
  name: "",
  phone: "",
  service: services[0].title,
  message: "",
};

const phonePattern = /^[+\d][\d\s]{7,}$/;

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.name.trim()) {
    errors.name = "Ingresa tu nombre.";
  }

  if (!phonePattern.test(values.phone.trim())) {
    errors.phone = "Ingresa un teléfono válido.";
  }

  if (!values.message.trim()) {
    errors.message = "Cuéntanos brevemente qué necesitas.";
  }

  return errors;
}

function buildMessage(values: FormValues): string {
  return [
    `Hola, soy ${values.name}.`,
    `Teléfono: ${values.phone}`,
    `Servicio de interés: ${values.service}`,
    `Mensaje: ${values.message}`,
  ].join("\n");
}

export function ContactForm() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});

  function handleChange<K extends keyof FormValues>(field: K, value: FormValues[K]) {
    setValues((previous) => ({ ...previous, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validate(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    window.open(buildWhatsAppHref(buildMessage(values)), "_blank", "noopener,noreferrer");
  }

  return (
    <section id="contacto" className="bg-white px-6 py-20">
      <div className="mx-auto max-w-xl">
        <Reveal>
          <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">
            Solicita tu Presupuesto
          </h2>
          <p className="mt-3 text-center text-sm text-slate-500">
            Completa el formulario y te contactamos por WhatsApp.
          </p>
        </Reveal>

        <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-sm font-medium text-slate-700">
              Nombre
            </label>
            <input
              id="name"
              type="text"
              value={values.name}
              onChange={(event) => handleChange("name", event.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-brand"
            />
            {errors.name ? (
              <p className="text-xs text-red-500">{errors.name}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="phone" className="text-sm font-medium text-slate-700">
              Teléfono
            </label>
            <input
              id="phone"
              type="tel"
              value={values.phone}
              onChange={(event) => handleChange("phone", event.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-brand"
            />
            {errors.phone ? (
              <p className="text-xs text-red-500">{errors.phone}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="service" className="text-sm font-medium text-slate-700">
              Servicio de interés
            </label>
            <select
              id="service"
              value={values.service}
              onChange={(event) => handleChange("service", event.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-brand"
            >
              {services.map((service) => (
                <option key={service.title} value={service.title}>
                  {service.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="message" className="text-sm font-medium text-slate-700">
              Mensaje
            </label>
            <textarea
              id="message"
              rows={4}
              value={values.message}
              onChange={(event) => handleChange("message", event.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-brand"
            />
            {errors.message ? (
              <p className="text-xs text-red-500">{errors.message}</p>
            ) : null}
          </div>

          <button
            type="submit"
            className="mt-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark active:scale-[0.97]"
          >
            Enviar por WhatsApp
          </button>
        </form>
      </div>
    </section>
  );
}
