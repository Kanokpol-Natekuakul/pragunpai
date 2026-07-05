"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

export interface HeroBannerSlide {
  imageUrl: string;
  alt?: string;
  href?: string;
}

const AUTO_SLIDE_INTERVAL_MS = 5000;

/**
 * Wraps the static Hero (passed as children = slide 1) and appends
 * admin-uploaded banner images as extra slides with auto-advance.
 * Renders children alone when no banner images are configured.
 */
export function HeroCarousel({
  slides,
  children,
}: {
  slides: HeroBannerSlide[];
  children: React.ReactNode;
}) {
  const totalSlides = slides.length + 1; // +1 for the static Hero
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goTo = useCallback(
    (index: number) =>
      setCurrent(((index % totalSlides) + totalSlides) % totalSlides),
    [totalSlides]
  );

  useEffect(() => {
    if (totalSlides <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % totalSlides);
    }, AUTO_SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [totalSlides, isPaused]);

  if (slides.length === 0) {
    return <>{children}</>;
  }

  const slideClass = (index: number) =>
    `col-start-1 row-start-1 transition-opacity duration-700 ease-in-out ${
      index === current
        ? "opacity-100 z-10"
        : "opacity-0 z-0 pointer-events-none"
    }`;

  return (
    <section
      className="relative grid overflow-hidden"
      role="region"
      aria-roledescription="carousel"
      aria-label="แบนเนอร์หน้าแรก"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slide 1: static hero. The carousel height is the taller of the hero
          and the 16:5 image slides, so the hero stretches and centers its
          content when an image slide is taller. */}
      <div
        className={`${slideClass(0)} grid *:flex *:flex-col *:justify-center`}
        aria-hidden={current !== 0}
      >
        {children}
      </div>

      {/* Admin-uploaded image slides keep a 16:5 (1920x600) aspect ratio on
          every page; they only crop when the hero is taller than that. */}
      {slides.map((slide, i) => {
        const image = (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={slide.imageUrl}
            alt={slide.alt || `แบนเนอร์ ${i + 2}`}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
        );
        return (
          <div
            key={`${slide.imageUrl}-${i}`}
            className={slideClass(i + 1)}
            aria-hidden={current !== i + 1}
          >
            <div className="relative w-full min-h-full aspect-16/5">
              {slide.href ? (
                <Link
                  href={slide.href}
                  tabIndex={current === i + 1 ? 0 : -1}
                  className="absolute inset-0 block"
                >
                  {image}
                </Link>
              ) : (
                image
              )}
            </div>
          </div>
        );
      })}

      {/* Prev / Next arrows */}
      <button
        type="button"
        onClick={() => goTo(current - 1)}
        aria-label="สไลด์ก่อนหน้า"
        className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-navy-900/40 p-2 text-white backdrop-blur-sm transition hover:bg-navy-900/70 cursor-pointer"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => goTo(current + 1)}
        aria-label="สไลด์ถัดไป"
        className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-navy-900/40 p-2 text-white backdrop-blur-sm transition hover:bg-navy-900/70 cursor-pointer"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
        {Array.from({ length: totalSlides }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`ไปที่สไลด์ ${i + 1}`}
            aria-current={i === current}
            className={`h-2.5 rounded-full transition-all cursor-pointer ${
              i === current
                ? "w-6 bg-orange-400"
                : "w-2.5 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
