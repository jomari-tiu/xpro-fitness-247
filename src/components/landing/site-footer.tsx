import Link from "next/link";
import { FACEBOOK_URL, INSTAGRAM_URL, TIKTOK_URL } from "@/content/landing";

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-white/8">
      <div className="mx-auto flex max-w-[1440px] flex-wrap justify-between gap-4 px-[clamp(16px,3vw,40px)] pt-10 font-mono text-[13px] leading-[1.4] text-xp-smoke">
        <span>© 2026 XPRO Fitness 24/7 · General Trias</span>
        <div className="flex gap-5">
          <a href={FACEBOOK_URL} target="_blank" rel="noreferrer" className="text-xp-amber hover:text-xp-flame">
            Facebook
          </a>
          <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="text-xp-amber hover:text-xp-flame">
            Instagram
          </a>
          <a href={TIKTOK_URL} target="_blank" rel="noreferrer" className="text-xp-amber hover:text-xp-flame">
            TikTok
          </a>
          <Link href="/login" className="text-xp-amber hover:text-xp-flame">
            Portal login
          </Link>
        </div>
      </div>
      <div
        aria-hidden
        className="mt-6 -mb-[.12em] bg-[linear-gradient(180deg,#ff5a1f,#ffb21f_40%,rgba(255,178,31,0))] bg-clip-text text-center text-[clamp(80px,22vw,360px)] leading-[.8] font-black tracking-[-.04em] text-transparent select-none [font-stretch:125%]"
      >
        XPRO
      </div>
    </footer>
  );
}
