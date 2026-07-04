"use client";

import Link from "next/link";
import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { mainMenu } from "@/lib/navigation";
import { siteConfig } from "@/lib/site";

export function Header({ logoUrl }: { logoUrl?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-navy-100 bg-white/95 backdrop-blur">
      <Container size="wide">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2" aria-label={`${siteConfig.name} หน้าแรก`}>
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={siteConfig.name} className="h-9 w-auto max-w-45 object-contain" />
            ) : (
              <>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-600 text-white font-bold">
                  P
                </span>
                <span className="text-lg font-bold text-navy-800">{siteConfig.name}</span>
              </>
            )}
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex" aria-label="เมนูหลัก">
            {mainMenu.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-navy-700 transition-colors hover:bg-navy-50 hover:text-navy-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:block">
            <Button href="/quote" variant="accent" size="sm">
              ขอใบเสนอราคา
            </Button>
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-navy-700 lg:hidden"
            aria-label="เปิดเมนู"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? (
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              ) : (
                <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" strokeLinejoin="round" />
              )}
            </svg>
          </button>
        </div>
      </Container>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden">
          <Container size="wide" className="pb-4">
            <nav className="flex flex-col gap-1" aria-label="เมนูมือถือ">
              {mainMenu.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-3 py-2.5 text-base font-medium text-navy-700 hover:bg-navy-50"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Button
                href="/quote"
                variant="accent"
                className="mt-2"
                onClick={() => setOpen(false)}
              >
                ขอใบเสนอราคา
              </Button>
            </nav>
          </Container>
        </div>
      )}
    </header>
  );
}
