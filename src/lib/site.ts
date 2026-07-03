/**
 * Centralised site / brand constants.
 * Pulled from env so deployment can override without code changes.
 * Used by metadata, JSON-LD (LocalBusiness / NAP), floating buttons, footer.
 */

function formatPhone(phone: string): string {
  if (phone.length === 10) {
    return `${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6)}`;
  }
  return phone;
}

export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "Pragunpai",
  domain: "pragunpai.com",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
  // NAP — name, address, phone (Local SEO consistency)
  phone: process.env.NEXT_PUBLIC_PHONE || "0819416620",
  phoneDisplay: process.env.NEXT_PUBLIC_PHONE ? formatPhone(process.env.NEXT_PUBLIC_PHONE) : "081 941 6620",
  line: process.env.NEXT_PUBLIC_LINE || "0819416620",
  email: process.env.NEXT_PUBLIC_EMAIL || "service@pragunpai.com",
  serviceArea: "ทั่วประเทศ",
  country: "TH",
  // LINE official link (line://) plus a fallback to LINE.me add-friend URL
  lineUrl: `https://line.me/R/ti/p/~${process.env.NEXT_PUBLIC_LINE || "0819416620"}`,
  telUrl: `tel:${(process.env.NEXT_PUBLIC_PHONE || "0819416620").replace(/\s/g, "")}`,
  mailUrl: `mailto:${process.env.NEXT_PUBLIC_EMAIL || "service@pragunpai.com"}`,
  tracking: {
    gaId: process.env.NEXT_PUBLIC_GA_ID || "",
    gscVerification: process.env.NEXT_PUBLIC_GSC_VERIFICATION || "",
  },
} as const;

/** Build an absolute URL from a path. */
export function absoluteUrl(path = "/"): string {
  const base = siteConfig.url.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
