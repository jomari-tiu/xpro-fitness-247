import Image from "next/image";
import { MESSENGER_URL } from "@/content/landing";
import { LiveClock } from "./live-clock";

export function Hero() {
  return (
    <section id="top" className="relative mx-auto max-w-[1440px] px-[clamp(16px,3vw,40px)] pt-[clamp(24px,5vw,64px)] pb-10">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-end gap-[clamp(24px,4vw,56px)]">
        <div className="flex flex-col gap-7">
          <div className="xp-eyebrow flex items-center gap-2.5 text-xp-stone">
            <span className="size-2 animate-xp-pulse rounded-full bg-xp-go shadow-[0_0_12px_#3ddc84]" />
            <span>
              Open now · <LiveClock /> in General Trias
            </span>
          </div>
          <h1 data-hero-title className="xp-display m-0 text-[clamp(64px,11vw,176px)] leading-[.84] tracking-[-.03em]">
            <span className="block">Train</span>
            <span className="xp-gradient-text block">Any</span>
            <span className="block">Hour.</span>
          </h1>
          <p className="m-0 max-w-[30ch] text-[clamp(17px,1.4vw,20px)] leading-normal text-pretty text-xp-stone">
            XPRO Fitness 24/7 is always open. Free weights, plate-loaded machines and cable stations in Brookside Lane,
            San Francisco, General Trias.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href={MESSENGER_URL} target="_blank" rel="noreferrer" data-magnetic className="xp-btn xp-btn-primary px-7 py-[18px] text-[15px]">
              Message us to join
            </a>
            <a href="#visit" data-magnetic className="xp-btn xp-btn-outline px-7 py-[18px] text-[15px]">
              Get directions
            </a>
          </div>
        </div>
        <div data-hero-frame className="relative aspect-[4/5] max-h-[78vh] overflow-hidden rounded-[28px] border border-white/8">
          <Image
            data-hero-img
            src="/images/hero.jpg"
            alt="XPRO Fitness gym floor"
            fill
            priority
            sizes="(max-width: 900px) 100vw, 50vw"
            className="object-cover object-[0%_50%]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,9,0)_55%,rgba(10,10,9,.85))]" />
          <div className="absolute right-[18px] bottom-[18px] left-[18px] flex items-end justify-between gap-3">
            <div className="rounded-2xl border border-white/10 bg-[rgba(18,18,16,.55)] px-4 py-3 backdrop-blur-[14px]">
              <div className="xp-eyebrow text-[11px] text-xp-amber">Hours</div>
              <div className="mt-1.5 text-[22px] leading-[1.1] font-extrabold [font-stretch:120%]">Always open</div>
            </div>
            <div className="xp-stripes h-7 w-16" />
          </div>
        </div>
      </div>
    </section>
  );
}
