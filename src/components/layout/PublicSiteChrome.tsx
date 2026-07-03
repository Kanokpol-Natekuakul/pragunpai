"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { FloatingContactButtons } from "@/components/layout/FloatingContactButtons";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

export function PublicSiteChrome({
  children,
  logoUrl,
}: {
  children: ReactNode;
  logoUrl?: string;
}) {
  const pathname = usePathname();

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <>
      <Header logoUrl={logoUrl} />
      <main className="flex-1">{children}</main>
      <Footer logoUrl={logoUrl} />
      <FloatingContactButtons />
    </>
  );
}
