"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

export type Slide = { src: string; alt: string; caption: string };

const INTERVAL_MS = 5000;

/** Swipeable, auto-advancing photo carousel. Pauses on hover/focus and for reduced-motion users. */
export default function CardCarousel({ slides }: { slides: Slide[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback(
    (i: number) => {
      const track = trackRef.current;
      if (!track) return;
      const next = (i + slides.length) % slides.length;
      track.scrollTo({ left: next * track.clientWidth, behavior: "smooth" });
    },
    [slides.length]
  );

  // Keep the active dot in sync with swipes and button scrolls.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => setIndex(Math.round(track.scrollLeft / track.clientWidth));
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => goTo(index + 1), INTERVAL_MS);
    return () => clearTimeout(t);
  }, [index, paused, goTo]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Cards from the Cardboard Mania collection"
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
    >
      <div className="overflow-hidden rounded-2xl border-2 border-gold/70 bg-ink-2 shadow-[8px_8px_0_0_var(--color-red)]">
        <div
          ref={trackRef}
          className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {slides.map((slide, i) => (
            <figure
              key={slide.src}
              className="relative w-full shrink-0 snap-center"
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${slides.length}`}
              aria-hidden={i !== index}
            >
              <div className="relative aspect-square w-full">
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  sizes="(min-width: 1024px) 480px, 100vw"
                  priority={i === 0}
                  className="object-contain"
                />
              </div>
              <figcaption className="border-t border-line bg-ink/90 px-4 py-3 text-center text-sm font-semibold">
                {slide.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => goTo(index - 1)}
          aria-label="Previous card"
          className="grid h-11 w-11 place-items-center rounded-full border-2 border-line hover:border-gold hover:text-gold"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden>
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div className="flex gap-2">
          {slides.map((slide, i) => (
            <button
              key={slide.src}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Show card ${i + 1}`}
              aria-current={i === index}
              className={`h-2.5 rounded-full transition-all ${i === index ? "w-7 bg-gold" : "w-2.5 bg-paper/30 hover:bg-paper/60"}`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => goTo(index + 1)}
          aria-label="Next card"
          className="grid h-11 w-11 place-items-center rounded-full border-2 border-line hover:border-gold hover:text-gold"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden>
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </section>
  );
}
