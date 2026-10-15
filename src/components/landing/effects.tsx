"use client";

import { useEffect, useRef } from "react";

const EASE = "cubic-bezier(.2,.7,.2,1)";

/**
 * Landing page motion layer, ported from the original design:
 * scroll progress bar, cursor glow, tilt cards ([data-tilt]), magnetic CTAs ([data-magnetic]),
 * hero entrance + parallax, and scroll reveals ([data-reveal]).
 */
export function LandingEffects() {
  const barRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current!;
    const glow = glowRef.current!;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cleanups: Array<() => void> = [];
    const on = <K extends keyof WindowEventMap>(
      target: Window | Document,
      ev: K,
      fn: (e: WindowEventMap[K]) => void,
      opts?: AddEventListenerOptions
    ) => {
      target.addEventListener(ev, fn as EventListener, opts);
      cleanups.push(() => target.removeEventListener(ev, fn as EventListener, opts));
    };

    const heroImg = document.querySelector<HTMLElement>("[data-hero-img]");
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`;
      if (heroImg && !reduce) heroImg.style.translate = `0 ${Math.min(scrollY, 900) * 0.12}px`;
    };
    on(window, "scroll", onScroll, { passive: true });
    onScroll();

    let gx = 0, gy = 0, tx = 0, ty = 0, raf = 0;
    const loop = () => {
      gx += (tx - gx) * 0.12;
      gy += (ty - gy) * 0.12;
      glow.style.transform = `translate(${gx}px,${gy}px)`;
      raf = requestAnimationFrame(loop);
    };
    if (!reduce && matchMedia("(pointer:fine)").matches) loop();
    cleanups.push(() => cancelAnimationFrame(raf));

    let tiltEl: HTMLElement | null = null;
    let magEl: HTMLElement | null = null;
    const resetTilt = (el: HTMLElement) => {
      el.style.transform = "";
      const im = el.querySelector("img");
      if (im) im.style.scale = "";
    };
    on(document, "pointermove", (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      glow.style.opacity = "1";
      if (reduce) return;
      const target = e.target as Element | null;
      const t = target?.closest<HTMLElement>("[data-tilt]") ?? null;
      if (tiltEl && tiltEl !== t) resetTilt(tiltEl);
      tiltEl = t;
      if (t) {
        const r = t.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        t.style.transition = "transform .15s ease-out, border-color .2s";
        t.style.transform = `perspective(900px) rotateX(${-py * 6}deg) rotateY(${px * 8}deg) translateZ(0)`;
        const im = t.querySelector("img");
        if (im) {
          im.style.transition = `scale .6s ${EASE}`;
          im.style.scale = "1.06";
        }
      }
      const m = target?.closest<HTMLElement>("[data-magnetic]") ?? null;
      if (magEl && magEl !== m) magEl.style.transform = "";
      magEl = m;
      if (m) {
        const r = m.getBoundingClientRect();
        m.style.transition = `transform .2s ${EASE}`;
        m.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px,${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
      }
    });
    on(document, "pointerleave", () => {
      glow.style.opacity = "0";
    });

    if (!reduce) {
      document.querySelectorAll<HTMLElement>("[data-hero-title] > span").forEach((el, i) => {
        el.animate(
          [
            { opacity: 0, transform: "translateY(40px)", filter: "blur(8px)" },
            { opacity: 1, transform: "none", filter: "blur(0)" },
          ],
          { duration: 900, delay: 120 + i * 110, easing: EASE, fill: "backwards" }
        );
      });
      document.querySelector("[data-hero-frame]")?.animate(
        [
          { opacity: 0, clipPath: "inset(100% 0 0 0 round 28px)" },
          { opacity: 1, clipPath: "inset(0 0 0 0 round 28px)" },
        ],
        { duration: 1200, delay: 250, easing: EASE, fill: "backwards" }
      );

      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            if (!en.isIntersecting) return;
            const el = en.target as HTMLElement;
            io.unobserve(el);
            const sib = el.parentElement ? [...el.parentElement.children].indexOf(el) : 0;
            el.style.opacity = "";
            el.animate(
              [
                { opacity: 0, transform: "translateY(48px) scale(.98)" },
                { opacity: 1, transform: "none" },
              ],
              { duration: 900, delay: Math.min(sib, 6) * 80, easing: EASE, fill: "backwards" }
            );
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
      );
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
        if (el.getBoundingClientRect().top > innerHeight) {
          el.style.opacity = "0";
          io.observe(el);
        }
      });
      cleanups.push(() => io.disconnect());
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return (
    <>
      <div
        ref={barRef}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-[60] h-[3px] w-full origin-left scale-x-0 bg-[linear-gradient(90deg,#ff5a1f,#ffb21f)]"
      />
      <div
        ref={glowRef}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-[1] -mt-[260px] -ml-[260px] size-[520px] rounded-full bg-[radial-gradient(circle,rgba(255,106,31,.16),rgba(255,106,31,0)_65%)] opacity-0 mix-blend-screen transition-opacity duration-400"
      />
    </>
  );
}
