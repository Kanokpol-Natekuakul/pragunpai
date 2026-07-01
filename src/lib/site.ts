/**
 * Centralised site / brand constants.
 * Pulled from env so deployment can override without code changes.
 * Used by metadata, JSON-LD (LocalBusiness / NAP), floating buttons, footer.
 */

function required(name: string, fallback = ""): string {
  const v = process.env[name];
  return v && v.length > 0 ? v : fallback;
}

export const siteConfig = {
  name: required("NEXT_PUBLIC_SITE_NAME", "Pragunpai"),
  domain: "pragunpai.com",
  url: required("NEXT_PUBLIC_SITE_URL", "http://localhost:3000").replace(/\/$/, ""),
  // NAP — name, address, phone (Local SEO consistency)
  phone: required("NEXT_PUBLIC_PHONE", "0819416620"),
  phoneDisplay: required("NEXT_PUBLIC_PHONE", "081 941 6620"),
  line: required("NEXT_PUBLIC_LINE", "0819416620"),
  email: required("NEXT_PUBLIC_EMAIL", "service@pragunpai.com"),
  serviceArea: "ทั่วประเทศ",
  country: "TH",
  // LINE official link (line://) plus a fallback to LINE.me add-friend URL
  lineUrl: `https://line.me/R/ti/p/~${required("NEXT_PUBLIC_LINE", "0819416620")}`,
  telUrl: `tel:${required("NEXT_PUBLIC_PHONE", "0819416620").replace(/\s/g, "")}`,
  mailUrl: `mailto:${required("NEXT_PUBLIC_EMAIL", "service@pragunpai.com")}`,
  tracking: {
    gaId: required("NEXT_PUBLIC_GA_ID"),
    gscVerification: required("NEXT_PUBLIC_GSC_VERIFICATION"),
  },
} as const;

/** Build an absolute URL from a path. */
export function absoluteUrl(path = "/"): string {
  const base = siteConfig.url.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
