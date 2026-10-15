import Image from "next/image";

export function GymSection() {
  return (
    <section id="gym" className="mx-auto max-w-[1440px] px-[clamp(16px,3vw,40px)] py-[clamp(72px,10vw,140px)]">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <h2 data-reveal className="xp-display m-0 max-w-[12ch] text-[clamp(40px,6vw,88px)] leading-[.9]">
          Built for <span className="text-xp-flame">heavy</span> days.
        </h2>
        <p data-reveal className="m-0 max-w-[38ch] text-[17px] leading-[1.55] text-pretty text-xp-ash">
          One floor, set up for serious lifting. Racks, benches, dumbbells and machines, under warm light, with mirrors
          on every wall.
        </p>
      </div>
      <div className="grid auto-rows-[minmax(240px,auto)] grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-4">
        <div data-reveal className="relative min-h-[420px] overflow-hidden rounded-[28px] border border-white/8 sm:col-span-2 sm:row-span-2">
          <Image
            src="/images/gallery-plates.jpg"
            alt="Hammer Strength plates on weight racks"
            fill
            sizes="(max-width: 640px) 100vw, 60vw"
            className="object-cover object-[50%_45%]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(10,10,9,.92),transparent_60%)]" />
          <div className="absolute right-7 bottom-7 left-7 flex flex-col gap-2.5">
            <span className="xp-eyebrow text-xp-amber">01 / Strength floor</span>
            <h3 className="xp-title m-0 text-[clamp(26px,3vw,40px)] leading-none">Plate-loaded &amp; free weights</h3>
            <p className="m-0 max-w-[44ch] text-base leading-normal text-xp-stone">
              Bench stations, squat racks, a full dumbbell run and bumper plates.
            </p>
          </div>
        </div>
        <div data-reveal className="flex flex-col justify-between gap-6 rounded-[28px] bg-[linear-gradient(135deg,#ff5a1f,#ffb21f)] p-7 text-xp-ink">
          <span className="xp-eyebrow">02 / Hours</span>
          <div>
            <div className="text-[clamp(64px,7vw,104px)] leading-[.85] font-black tracking-[-.03em] [font-stretch:125%]">24/7</div>
            <p className="mt-2.5 text-base leading-[1.4] font-semibold">
              No closing time. Early shift, late shift, weekends, holidays.
            </p>
          </div>
        </div>
        <div data-reveal className="flex flex-col justify-between gap-6 rounded-[28px] border border-white/8 bg-xp-coal p-7">
          <span className="xp-eyebrow text-xp-amber">03 / Machines</span>
          <div>
            <h3 className="xp-title m-0 text-[28px] leading-[1.05]">Cables &amp; functional rigs</h3>
            <p className="mt-2.5 text-base leading-normal text-xp-ash">
              Multi-station cable towers for pulls, presses and accessory work.
            </p>
          </div>
        </div>
        <div data-reveal className="relative flex flex-wrap items-center justify-between gap-6 overflow-hidden rounded-[28px] border border-white/8 bg-xp-coal p-7 sm:col-span-2">
          <div className="absolute -right-5 -bottom-2.5 h-[70px] w-[260px] bg-[repeating-linear-gradient(-60deg,rgba(255,106,31,.9)_0_14px,transparent_14px_30px)]" />
          <div className="relative flex max-w-[46ch] flex-col gap-2.5">
            <span className="xp-eyebrow text-xp-amber">04 / Location</span>
            <h3 className="xp-title m-0 text-[28px] leading-[1.05]">Brookside Lane, San Francisco, General Trias</h3>
          </div>
          <a href="#visit" data-magnetic className="xp-btn xp-btn-outline relative px-[22px] py-3.5 text-sm">
            See map
          </a>
        </div>
      </div>
    </section>
  );
}
