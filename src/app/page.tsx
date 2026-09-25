import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { WhyChooseUs } from "@/components/sections/WhyChooseUs";
import { HowWeWork } from "@/components/sections/HowWeWork";
import { Gallery } from "@/components/sections/Gallery";
import { Services } from "@/components/sections/Services";
import { ExplodedView } from "@/components/sections/ExplodedView";
import { BeforeAfter } from "@/components/sections/BeforeAfter";
import { Testimonials } from "@/components/sections/Testimonials";
import { FAQ } from "@/components/sections/FAQ";
import { ContactForm } from "@/components/sections/ContactForm";
import { LocationMap } from "@/components/sections/LocationMap";
import { ToolBrands } from "@/components/sections/ToolBrands";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <WhyChooseUs />
        <HowWeWork />
        <Gallery />
        <Services />
        <ExplodedView />
        <BeforeAfter />
        <Testimonials />
        <FAQ />
        <ContactForm />
        <LocationMap />
        <ToolBrands />
      </main>
      <Footer />
    </>
  );
}
