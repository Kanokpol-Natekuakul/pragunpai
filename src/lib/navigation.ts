/**
 * Central navigation model — used by header, footer, sitemap, breadcrumbs,
 * and internal-link context (important for SEO topic clusters).
 */

export type NavItem = {
  label: string;
  href: string;
  /** Optional short description for footer / mobile menus. */
  description?: string;
};

export const mainMenu: NavItem[] = [
  { label: "หน้าแรก", href: "/" },
  { label: "พ.ร.บ. รถยนต์", href: "/car-act" },
  { label: "ประกันอุบัติเหตุ", href: "/accident-insurance" },
  { label: "ประกันบ้าน-คอนโด-หอพัก", href: "/property-insurance" },
  { label: "บทความ", href: "/articles" },
  { label: "เกี่ยวกับเรา", href: "/about" },
  { label: "ติดต่อเรา", href: "/contact" },
];

export const ctaMenu: NavItem[] = [{ label: "ขอใบเสนอราคา", href: "/quote" }];

/** Quote form routes keyed by form type. */
export const quoteRoutes: Record<string, string> = {
  car_act: "/quote/car-act",
  accident: "/quote/accident",
  property: "/quote/property",
  other: "/quote/other",
};

export const footerLinks: NavItem[] = [
  { label: "หน้าแรก", href: "/" },
  { label: "พ.ร.บ. รถยนต์", href: "/car-act" },
  { label: "ประกันอุบัติเหตุ", href: "/accident-insurance" },
  { label: "ประกันบ้าน-คอนโด-หอพัก", href: "/property-insurance" },
  { label: "บทความ", href: "/articles" },
  { label: "เกี่ยวกับเรา", href: "/about" },
  { label: "ติดต่อเรา", href: "/contact" },
  { label: "ขอใบเสนอราคา", href: "/quote" },
  { label: "ประกันภัยอื่นๆ / สอบถามเพิ่มเติม", href: "/quote/other" },
  { label: "นโยบายความเป็นส่วนตัว (PDPA)", href: "/privacy-policy" },
];
