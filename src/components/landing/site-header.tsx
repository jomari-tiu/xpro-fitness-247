import Image from "next/image";
import Link from "next/link";
import { MESSENGER_URL, navLinks } from "@/content/landing";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 px-[clamp(16px,3vw,40px)] py-3.5">
      <nav className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 rounded-full border border-white/8 bg-[rgba(18,18,16,.62)] py-2 pr-2 pl-4 backdrop-blur-[18px] backdrop-saturate-[1.4]">
        <a href="#top" className="flex items-center gap-2.5 text-xp-bone" aria-label="XPRO Fitness 24/7 home">
          <span className="block size-11 overflow-hidden">
            <Image
              src="/images/logo.jpg"
              alt="XPRO Fitness 24/7"
              width={88}
              height={88}
              priority
              className="size-11 scale-[1.9] object-cover object-[46%_50%] mix-blend-lighten"
            />
          </span>
        </a>
        <div className="hidden flex-wrap justify-center gap-[clamp(12px,2.4vw,32px)] text-sm leading-none font-medium md:flex">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className="text-xp-stone transition-colors hover:text-white">
              {l.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-full px-4 py-3 text-sm leading-none font-semibold text-xp-stone transition-colors hover:text-white sm:inline-flex"
          >
            Member login
          </Link>
          <a
            href={MESSENGER_URL}
            target="_blank"
            rel="noreferrer"
            className="xp-btn xp-btn-primary px-5 py-3 text-sm font-bold normal-case tracking-normal"
          >
            Join now
          </a>
        </div>
      </nav>
    </header>
  );
}
