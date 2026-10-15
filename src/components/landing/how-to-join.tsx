import { MESSENGER_URL, joinSteps } from "@/content/landing";

export function HowToJoin() {
  return (
    <section id="access" className="bg-xp-bone text-xp-ink">
      <div className="mx-auto grid max-w-[1440px] grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-start gap-[clamp(32px,5vw,80px)] px-[clamp(16px,3vw,40px)] py-[clamp(72px,10vw,140px)]">
        <div className="flex flex-col gap-5 md:sticky md:top-[120px]">
          <span className="xp-eyebrow text-xp-rust">How to join</span>
          <h2 data-reveal className="xp-display m-0 text-[clamp(40px,6vw,88px)] leading-[.9]">
            Three steps to the floor.
          </h2>
          <p data-reveal className="m-0 max-w-[40ch] text-[17px] leading-[1.55] text-xp-mud">
            Send us a message for current membership rates, then drop by to sign up and start training.
          </p>
        </div>
        <div className="flex flex-col">
          {joinSteps.map((s) => (
            <div key={s.n} data-reveal className="grid grid-cols-[auto_1fr] gap-6 border-t border-xp-ink/14 py-8">
              <span className="xp-display text-[clamp(48px,5vw,72px)] leading-[.85] tracking-normal text-xp-orange">
                {s.n}
              </span>
              <div className="flex flex-col gap-2">
                <h3 className="xp-title m-0 text-[26px] leading-[1.1]">{s.title}</h3>
                <p className="m-0 text-[17px] leading-normal text-xp-mud">{s.body}</p>
              </div>
            </div>
          ))}
          <a
            href={MESSENGER_URL}
            target="_blank"
            rel="noreferrer"
            data-magnetic
            className="xp-btn mt-3 self-start bg-xp-ink px-7 py-[18px] text-[15px] text-xp-bone hover:text-xp-amber"
          >
            Message on Messenger
          </a>
        </div>
      </div>
    </section>
  );
}
