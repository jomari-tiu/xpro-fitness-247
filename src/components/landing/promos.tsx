import Image from "next/image";
import { MESSENGER_URL, promos } from "@/content/landing";

export function Promos() {
  return (
    <section id="promos" className="mx-auto max-w-[1440px] px-[clamp(16px,3vw,40px)] pb-[clamp(72px,10vw,140px)]">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div className="flex flex-col gap-4">
          <span className="xp-eyebrow text-xp-amber">Limited time</span>
          <h2 data-reveal className="xp-display m-0 text-[clamp(40px,6vw,88px)] leading-[.9]">
            Current <span className="xp-gradient-text">promos</span>
          </h2>
        </div>
        <p data-reveal className="m-0 max-w-[36ch] text-[17px] leading-[1.55] text-pretty text-xp-ash">
          Message us on Messenger to claim any offer, or ask at the front desk.
        </p>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] gap-4">
        {promos.map((p) => (
          <div key={p.title} data-tilt data-reveal className="flex flex-col overflow-hidden rounded-[28px] border border-white/8 bg-xp-coal">
            <div className="relative aspect-square overflow-hidden">
              <Image src={p.src} alt={p.title} fill sizes="(max-width: 760px) 100vw, 33vw" className="object-cover" />
              <span className="xp-eyebrow absolute top-4 left-4 rounded-full border border-white/12 bg-[rgba(10,10,9,.7)] px-3 py-2 text-[11px] tracking-[.06em] text-xp-amber backdrop-blur-[10px]">
                {p.tag}
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-3 px-6 pt-6 pb-7">
              <h3 className="xp-title m-0 text-[clamp(22px,2vw,28px)] leading-[1.05]">{p.title}</h3>
              <p className="m-0 flex-1 text-base leading-normal text-xp-ash">{p.body}</p>
              <a
                href={MESSENGER_URL}
                target="_blank"
                rel="noreferrer"
                data-magnetic
                className="xp-btn xp-btn-primary mt-2 self-start px-[22px] py-3.5 text-[13px] tracking-normal"
              >
                Claim this promo
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
