"use client";

import { siteConfig } from "@/lib/site";
import { clsx } from "@/lib/utils";
import { useEffect, useState } from "react";

/**
 * Floating contact buttons — visible site-wide on mobile + desktop.
 * Phone (call), LINE (add friend), Quote (form).
 * Per PRD §5.3.
 */
export function FloatingContactButtons() {
  const [show, setShow] = useState(false);

  // Reveal after the user scrolls a little.
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 200);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={clsx(
        "fixed bottom-4 right-4 z-50 flex flex-col gap-2 transition-all duration-300 sm:bottom-6 sm:right-6",
        show ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none",
      )}
      aria-label="ติดต่อด่วน"
    >
      {/* Call */}
      <a
        href={siteConfig.telUrl}
        className={floatingBtn("bg-green-500 hover:bg-green-600")}
        aria-label="โทรเลย"
      >
        <PhoneIcon />
        <span className="hidden text-sm font-semibold sm:inline">โทรเลย</span>
      </a>

      {/* LINE */}
      <a
        href={siteConfig.lineUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={floatingBtn("bg-[#06C755] hover:bg-[#05b14d]")}
        aria-label="แอด LINE"
      >
        <LineIcon />
        <span className="hidden text-sm font-semibold sm:inline">แอด LINE</span>
      </a>

      {/* Quote */}
      <a
        href="/quote"
        className={floatingBtn("bg-orange-500 hover:bg-orange-600")}
        aria-label="ขอใบเสนอราคา"
      >
        <QuoteIcon />
        <span className="hidden text-sm font-semibold sm:inline">ขอใบเสนอราคา</span>
      </a>
    </div>
  );
}

function floatingBtn(color: string) {
  return clsx(
    "flex items-center gap-2 rounded-full px-4 py-3 text-white shadow-lg ring-1 ring-black/5 transition-colors",
    color,
  );
}

function PhoneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6.62 10.79a15.53 15.53 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24a11.36 11.36 0 003.57.57a1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1a11.36 11.36 0 00.57 3.57a1 1 0 01-.24 1.01l-2.21 2.21z" />
    </svg>
  );
}

function LineIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 5.69 2 10.21c0 4.05 3.55 7.44 8.34 8.08c.32.07.77.22.88.5c.1.26.07.66.03.92l-.14.85c-.04.26-.2 1.02.87.56c1.07-.46 5.77-3.4 7.87-5.82C21.5 14.36 22 12.34 22 10.21C22 5.69 17.52 2 12 2z" />
    </svg>
  );
}

function QuoteIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M9 11l3 3L22 4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
