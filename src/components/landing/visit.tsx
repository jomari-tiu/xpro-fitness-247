import { MAPS_DIRECTIONS_URL, MAPS_EMBED_URL, MAPS_SEARCH_URL, contacts } from "@/content/landing";

export function Visit() {
  return (
    <section id="visit" className="mx-auto max-w-[1440px] px-[clamp(16px,3vw,40px)] pb-[clamp(72px,10vw,140px)]">
      <div
        data-reveal
        className="relative grid grid-cols-[repeat(auto-fit,minmax(min(100%,380px),1fr))] gap-[clamp(32px,5vw,64px)] overflow-hidden rounded-[32px] border border-white/8 bg-xp-coal p-[clamp(28px,5vw,64px)]"
      >
        <div className="flex flex-col gap-6">
          <span className="xp-eyebrow text-xp-amber">Visit · Always open</span>
          <h2 className="xp-display m-0 text-[clamp(36px,5vw,72px)] leading-[.92]">B29/B30 Lot 7 Brookside Lane</h2>
          <p className="m-0 text-lg leading-normal text-xp-stone">San Francisco, General Trias, Philippines, 4107</p>
          <a
            href={MAPS_SEARCH_URL}
            target="_blank"
            rel="noreferrer"
            data-magnetic
            className="xp-btn xp-btn-primary self-start px-6 py-4 text-sm"
          >
            Open in Google Maps
          </a>
        </div>
        <div className="flex flex-col">
          {contacts.map((c) => (
            <a
              key={c.label}
              href={c.href}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between gap-4 border-t border-white/10 py-5 text-xp-bone transition-colors hover:text-xp-amber"
            >
              <span className="xp-eyebrow min-w-[90px] text-xp-smoke">{c.label}</span>
              <span className="text-right text-[clamp(16px,1.6vw,20px)] leading-[1.2] font-semibold break-words">
                {c.value}
              </span>
            </a>
          ))}
        </div>
      </div>
      <div className="relative mt-4 h-[clamp(360px,50vw,560px)] overflow-hidden rounded-[32px] border border-white/8 bg-xp-coal">
        <iframe
          title="XPRO Fitness 24/7 location map"
          src={MAPS_EMBED_URL}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 size-full border-0 [filter:invert(.92)_hue-rotate(180deg)_saturate(.6)_contrast(.95)]"
        />
        <div className="absolute bottom-[clamp(12px,2vw,24px)] left-[clamp(12px,2vw,24px)] flex max-w-[calc(100%-24px)] flex-wrap items-center gap-3.5 rounded-[20px] border border-white/10 bg-[rgba(18,18,16,.82)] py-3.5 pr-4 pl-[18px] backdrop-blur-[14px]">
          <div className="flex flex-col gap-1.5">
            <span className="xp-eyebrow text-[11px] text-xp-amber">Find us</span>
            <span className="text-[15px] leading-[1.3] font-bold text-xp-bone">
              In front of SQY Shopping Center, General Trias
            </span>
          </div>
          <a
            href={MAPS_DIRECTIONS_URL}
            target="_blank"
            rel="noreferrer"
            data-magnetic
            className="xp-btn xp-btn-primary px-[18px] py-3 text-[13px] tracking-normal"
          >
            Directions
          </a>
        </div>
      </div>
    </section>
  );
}
