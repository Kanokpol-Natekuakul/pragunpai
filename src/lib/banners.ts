import { prisma } from "@/lib/prisma";
import type { HeroBannerSlide } from "@/components/home/HeroCarousel";

export interface PageBannerConfig {
  /** Auto-sliding hero banner images (shown after the page's own hero). */
  slides: HeroBannerSlide[];
  /** Static promo images displayed below the banner (max 2, left/right). */
  promos: HeroBannerSlide[];
}

export type PageBannersMap = Record<string, PageBannerConfig>;

/** Public page paths that support hero banner slides (matches main nav tabs). */
export const bannerPages = [
  { path: "/", label: "หน้าแรก", promos: false },
  { path: "/car-act", label: "พ.ร.บ. รถยนต์", promos: true },
  { path: "/accident-insurance", label: "ประกันอุบัติเหตุ", promos: true },
  {
    path: "/property-insurance",
    label: "ประกันบ้าน-คอนโด-หอพัก",
    promos: true,
  },
  { path: "/articles", label: "บทความ", promos: true },
  { path: "/about", label: "เกี่ยวกับเรา", promos: true },
  { path: "/contact", label: "ติดต่อเรา", promos: true },
] as const;

const emptyConfig = (): PageBannerConfig => ({ slides: [], promos: [] });

function sanitizeSlides(value: unknown): HeroBannerSlide[] {
  if (!Array.isArray(value)) return [];
  return (value as HeroBannerSlide[]).filter(
    (s) => typeof s?.imageUrl === "string" && s.imageUrl.trim() !== ""
  );
}

function sanitizeConfig(value: unknown): PageBannerConfig {
  // Back-compat: a plain array is the old slides-only shape
  if (Array.isArray(value)) {
    return { slides: sanitizeSlides(value), promos: [] };
  }
  if (value && typeof value === "object") {
    const v = value as { slides?: unknown; promos?: unknown };
    return {
      slides: sanitizeSlides(v.slides),
      promos: sanitizeSlides(v.promos),
    };
  }
  return emptyConfig();
}

/** Loads the banner config map for every page from the "pageBanners" site setting. */
export async function getPageBannersMap(): Promise<PageBannersMap> {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: "pageBanners" },
    });
    const raw = setting?.value;
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
    const map: PageBannersMap = {};
    for (const [path, config] of Object.entries(raw)) {
      map[path] = sanitizeConfig(config);
    }
    return map;
  } catch (error) {
    console.error("[getPageBannersMap] Failed to load page banners:", error);
    return {};
  }
}

/** Loads the banner config (slides + promos) for a single public page path. */
export async function getPageBanners(path: string): Promise<PageBannerConfig> {
  const map = await getPageBannersMap();
  return map[path] ?? emptyConfig();
}
