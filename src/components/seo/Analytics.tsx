import Script from "next/script";
import { siteConfig } from "@/lib/site";

/**
 * Google Analytics 4 — only rendered when GA id is configured.
 * (Phase G / SEO tracking.)
 */
export function GoogleAnalytics() {
  const id = siteConfig.tracking.gaId;
  if (!id) return null;
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${id}');
        `}
      </Script>
    </>
  );
}

/**
 * Google Search Console verification — injected as a meta tag in <head>.
 * The verification token is stored in NEXT_PUBLIC_GSC_VERIFICATION.
 */
export function SearchConsoleVerification() {
  const token = siteConfig.tracking.gscVerification;
  if (!token) return null;
  // Returned as a <meta> via Next metadata elsewhere; here it's a fallback.
  return null;
}
