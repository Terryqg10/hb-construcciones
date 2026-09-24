"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, Menu, MessageCircle, Phone, X } from "lucide-react";
import { navLinks } from "@/lib/nav-links";
import { siteConfig } from "@/lib/site-config";

export function NavMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const isMobileViewport = window.matchMedia("(max-width: 639px)").matches;
    document.body.style.overflow = isOpen && isMobileViewport ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const close = () => setIsOpen(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={isOpen}
        className="relative z-50 flex h-10 w-10 items-center justify-center rounded-full text-slate-900 transition hover:bg-slate-100 active:scale-95"
      >
        {isOpen ? (
          <X className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Menu className="h-5 w-5" aria-hidden="true" />
        )}
      </button>

      {isOpen ? (
        <div className="hidden sm:block">
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={close}
            className="fixed inset-0 z-40 cursor-default"
          />
          <nav className="animate-menu-in absolute right-0 top-14 z-50 grid w-[26rem] grid-cols-2 gap-1 rounded-2xl border border-slate-100 bg-white p-3 shadow-xl">
            {navLinks.map((link, index) => (
              <a
                key={link.href}
                href={link.href}
                onClick={close}
                style={{ animationDelay: `${index * 30}ms` }}
                className="animate-fade-up group flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-slate-700 opacity-0 transition-colors duration-200 hover:bg-slate-50 hover:text-brand"
              >
                {link.label}
                <ArrowRight
                  className="h-4 w-4 -translate-x-1 text-brand opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
                  aria-hidden="true"
                />
              </a>
            ))}
          </nav>
        </div>
      ) : null}

      {isOpen && mounted
        ? createPortal(
            <div className="sm:hidden">
              <button
                type="button"
                aria-label="Cerrar menú"
                onClick={close}
                className="fixed inset-0 z-40 cursor-default"
              />
              <nav className="animate-mobile-menu-in fixed inset-x-0 top-16 bottom-0 z-50 flex flex-col overflow-y-auto bg-white/95 px-6 backdrop-blur-sm">
                <div className="flex flex-1 flex-col justify-center gap-1">
                  {navLinks.map((link, index) => (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={close}
                      style={{ animationDelay: `${index * 45}ms` }}
                      className="animate-fade-up group relative py-3.5 text-2xl font-light tracking-tight text-slate-400 opacity-0 transition-colors duration-300 active:text-slate-900"
                    >
                      {link.label}
                      <span className="absolute inset-x-0 bottom-2 h-px origin-left scale-x-0 bg-slate-900 transition-transform duration-300 ease-out group-active:scale-x-100" />
                    </a>
                  ))}
                </div>

                <div
                  className="animate-fade-up mt-2 mb-8 flex flex-col gap-3 opacity-0"
                  style={{ animationDelay: `${navLinks.length * 45 + 60}ms` }}
                >
                  <a
                    href={siteConfig.whatsappHref}
                    className="flex items-center justify-center gap-2 rounded-full bg-brand px-5 py-3.5 text-sm font-semibold text-white transition active:scale-[0.97]"
                  >
                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                    Escríbenos por WhatsApp
                  </a>
                  <a
                    href={siteConfig.phoneHref}
                    className="flex items-center justify-center gap-2 rounded-full border border-slate-200 px-5 py-3.5 text-sm font-semibold text-slate-900 transition active:scale-[0.97]"
                  >
                    <Phone className="h-4 w-4" aria-hidden="true" />
                    {siteConfig.phoneNumber}
                  </a>
                </div>
              </nav>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
