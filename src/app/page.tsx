import { LandingEffects } from "@/components/landing/effects";
import { Gallery } from "@/components/landing/gallery";
import { GymSection } from "@/components/landing/gym-section";
import { Hero } from "@/components/landing/hero";
import { HowToJoin } from "@/components/landing/how-to-join";
import { Marquee } from "@/components/landing/marquee";
import { Promos } from "@/components/landing/promos";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { Visit } from "@/components/landing/visit";

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-xp-ink text-xp-bone">
      <div aria-hidden className="xp-grain pointer-events-none fixed inset-0 z-50 opacity-[.07] mix-blend-overlay" />
      <LandingEffects />
      <SiteHeader />
      <main>
        <Hero />
        <Marquee />
        <GymSection />
        <Promos />
        <HowToJoin />
        <Gallery />
        <Visit />
      </main>
      <SiteFooter />
    </div>
  );
}
