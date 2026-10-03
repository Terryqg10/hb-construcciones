import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

interface LegalLayoutProps {
  title: string;
  updated: string;
  children: ReactNode;
}

export function LegalLayout({ title, updated, children }: LegalLayoutProps) {
  return (
    <>
      <Header />
      <main className="bg-white px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Última actualización: {updated}
          </p>

          <div className="mt-10 flex flex-col gap-8 text-sm leading-relaxed text-slate-600 sm:text-base [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:sm:text-xl [&_strong]:font-semibold [&_strong]:text-slate-900 [&_a]:text-brand [&_a]:underline [&_a]:decoration-brand/30 [&_a]:underline-offset-2 [&_a]:hover:decoration-brand [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1.5">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
