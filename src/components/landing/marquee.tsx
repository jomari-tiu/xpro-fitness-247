import { Fragment } from "react";
import { marqueeWords } from "@/content/landing";

function MarqueeRow({ hidden }: { hidden?: boolean }) {
  return (
    <div className="flex" aria-hidden={hidden}>
      {marqueeWords.map((word, i) => (
        <Fragment key={word}>
          <span className="inline-flex items-center gap-10 pr-10">
            <span
              className={
                "xp-display text-[clamp(28px,3.4vw,48px)] leading-none tracking-normal " +
                (i % 2 ? "text-xp-bone" : "text-transparent [-webkit-text-stroke:1.5px_#ff6a1f]")
              }
            >
              {word}
            </span>
            <span className="size-3.5 rotate-45 bg-xp-amber" />
          </span>
        </Fragment>
      ))}
    </div>
  );
}

export function Marquee({ speed = 40 }: { speed?: number }) {
  return (
    <div className="overflow-hidden border-y border-white/8 bg-xp-night py-[22px]">
      <div
        className="flex w-max animate-xp-marquee whitespace-nowrap motion-reduce:animate-none"
        style={{ "--xp-marquee-speed": `${speed}s` } as React.CSSProperties}
      >
        <MarqueeRow />
        <MarqueeRow hidden />
      </div>
    </div>
  );
}
