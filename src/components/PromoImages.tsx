"use client";

import { useEffect, useState } from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import type { HeroBannerSlide } from "@/components/home/HeroCarousel";

/**
 * Static portrait promo images shown below the hero banner (max 2).
 * One image is centered; two sit side by side. Widths are capped so the
 * 3:4 portrait ratio doesn't grow taller than the viewport.
 * Clicking an image opens it fullscreen; images with a link show a CTA
 * button inside the lightbox. Renders nothing when no images are configured.
 */
export function PromoImages({ images }: { images: HeroBannerSlide[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const visible = images.slice(0, 2);
  const openImage = openIndex !== null ? visible[openIndex] : null;

  // Close on ESC and lock page scroll while the lightbox is open
  useEffect(() => {
    if (openIndex === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenIndex(null);
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [openIndex]);

  if (visible.length === 0) return null;

  return (
    <section className="bg-white py-8 sm:py-10">
      <Container size="wide">
        <div
          className={`mx-auto grid gap-4 sm:gap-6 ${visible.length > 1 ? "max-w-4xl sm:grid-cols-2" : "max-w-md"}`}
        >
          {visible.map((img, i) => (
            <button
              key={`${img.imageUrl}-${i}`}
              type="button"
              onClick={() => setOpenIndex(i)}
              aria-label={`ขยายดูรูป${img.alt ? ` ${img.alt}` : `โปรโมชั่น ${i + 1}`}`}
              className="group relative aspect-3/4 overflow-hidden rounded-xl border border-navy-100 shadow-sm cursor-zoom-in text-left"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.imageUrl}
                alt={img.alt || `โปรโมชั่น ${i + 1}`}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                loading="lazy"
              />
              {/* Expand hint */}
              <span className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-navy-900/60 text-white backdrop-blur-sm transition-colors group-hover:bg-navy-900/80">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 8V5a1 1 0 011-1h3m8 0h3a1 1 0 011 1v3m0 8v3a1 1 0 01-1 1h-3m-8 0H5a1 1 0 01-1-1v-3"
                  />
                </svg>
              </span>
            </button>
          ))}
        </div>
      </Container>

      {/* Fullscreen lightbox */}
      {openImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-navy-950/80 backdrop-blur-md transition-opacity duration-300 animate-fadeIn"
            onClick={() => setOpenIndex(null)}
          />

          {/* Content */}
          <div className="relative flex max-h-full flex-col items-center gap-4 animate-scaleUp">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setOpenIndex(null)}
              aria-label="ปิดหน้าต่างรูปภาพ"
              className="absolute -top-2 -right-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-navy-600 shadow-lg hover:bg-navy-50 transition-colors cursor-pointer font-bold sm:-top-3 sm:-right-3"
            >
              ✕
            </button>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={openImage.imageUrl}
              alt={openImage.alt || "โปรโมชั่น"}
              className="max-h-[80vh] max-w-[92vw] rounded-xl object-contain shadow-2xl"
            />

            {openImage.href && (
              <Button
                href={openImage.href}
                variant="accent"
                size="lg"
                className="shadow-lg"
              >
                ดูรายละเอียดเพิ่มเติม →
              </Button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
