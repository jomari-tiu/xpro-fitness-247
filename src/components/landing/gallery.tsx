"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { INSTAGRAM_URL, galleryPhotos } from "@/content/landing";
import { cn } from "@/lib/utils";

const total = galleryPhotos.length;
const pad = (n: number) => String(n).padStart(2, "0");

export function Gallery() {
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    if (active == null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
      if (e.key === "ArrowRight") setActive((i) => (i == null ? i : (i + 1) % total));
      if (e.key === "ArrowLeft") setActive((i) => (i == null ? i : (i + total - 1) % total));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  const go = (d: number) => (e: React.MouseEvent) => {
    e.stopPropagation();
    setActive((i) => (i == null ? i : (i + d + total) % total));
  };
  const photo = active != null ? galleryPhotos[active] : null;

  return (
    <section id="gallery" className="mx-auto max-w-[1440px] px-[clamp(16px,3vw,40px)] py-[clamp(72px,10vw,140px)]">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <h2 data-reveal className="xp-display m-0 text-[clamp(40px,6vw,88px)] leading-[.9]">
          Inside XPRO
        </h2>
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-sm leading-none font-semibold tracking-[.04em] text-xp-amber hover:text-xp-flame"
        >
          @xprofitnessgym ↗
        </a>
      </div>
      <div className="grid auto-rows-[clamp(160px,18vw,240px)] grid-flow-dense grid-cols-[repeat(auto-fill,minmax(min(100%,260px),1fr))] gap-4">
        {galleryPhotos.map((g, i) => (
          <button
            key={g.src}
            type="button"
            data-tilt
            data-reveal
            onClick={() => setActive(i)}
            className={cn(
              "relative row-span-2 cursor-zoom-in overflow-hidden rounded-3xl border border-white/8 bg-xp-coal p-0 text-left transition-colors hover:border-xp-flame",
              g.wide && "sm:col-span-2"
            )}
          >
            <Image
              src={g.src}
              alt={g.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw"
              className="object-cover"
              style={{ objectPosition: g.pos }}
            />
            <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(10,10,9,.85),transparent_45%)]" />
            <div className="absolute right-[18px] bottom-4 left-[18px] flex flex-col gap-1.5">
              <span className="xp-eyebrow text-[11px] text-xp-amber">
                {pad(i + 1)} / {pad(total)}
              </span>
              <span className="xp-title text-[clamp(18px,1.6vw,22px)] leading-[1.1] text-xp-bone">{g.title}</span>
            </div>
          </button>
        ))}
      </div>

      {photo && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={photo.title}
          onClick={() => setActive(null)}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-[rgba(6,6,5,.94)] p-6 backdrop-blur-[10px]"
        >
          <div className="relative h-[calc(100vh-140px)] w-full max-w-5xl">
            <Image src={photo.src} alt={photo.title} fill sizes="100vw" className="rounded-[20px] object-contain" />
          </div>
          <div onClick={(e) => e.stopPropagation()} className="flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={go(-1)}
              aria-label="Previous photo"
              className="size-12 rounded-full border border-white/20 text-lg font-bold text-xp-bone transition-colors hover:border-xp-amber hover:text-xp-amber"
            >
              ←
            </button>
            <span className="xp-title min-w-[220px] text-center text-lg leading-none text-xp-bone">{photo.title}</span>
            <button
              type="button"
              onClick={go(1)}
              aria-label="Next photo"
              className="size-12 rounded-full border border-white/20 text-lg font-bold text-xp-bone transition-colors hover:border-xp-amber hover:text-xp-amber"
            >
              →
            </button>
            <button
              type="button"
              onClick={() => setActive(null)}
              className="xp-btn xp-btn-primary px-5 py-3.5 text-[13px] tracking-normal"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
