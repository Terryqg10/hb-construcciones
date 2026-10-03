import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { WhatsAppFab } from "@/components/ui/WhatsAppFab";
import { MobileContactBar } from "@/components/ui/MobileContactBar";
import { LocalBusinessJsonLd } from "@/components/seo/LocalBusinessJsonLd";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HB Construcciones | Reformas Integrales y Piscinas",
  description:
    "Expertos en reformas integrales y construcción de piscinas. Contáctanos por WhatsApp y recibe tu presupuesto.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col pb-16 sm:pb-0">
        <LocalBusinessJsonLd />
        {children}
        <WhatsAppFab />
        <MobileContactBar />
      </body>
    </html>
  );
}
