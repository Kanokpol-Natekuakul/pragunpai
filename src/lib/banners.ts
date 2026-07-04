import { prisma } from "@/lib/prisma";
import type { HeroBannerSlide } from "@/components/home/HeroCarousel";

export type PageBannersMap = Record<string, HeroBannerSlide[]>;

/** Public page paths that support hero banner slides (matches main nav tabs). */
export const bannerPages = [
  { path: "/", label: "หน้าแรก" },
  { path: "/car-act", label: "พ.ร.บ. รถยนต์" },
  { path: "/accident-insurance", label: "ประกันอุบัติเหตุ" },
  { path: "/property-insurance", label: "ประกันบ้าน-คอนโด-หอพัก" },
  { path: "/articles", label: "บทความ" },
  { path: "/about", label: "เกี่ยวกับเรา" },
  { path: "/contact", label: "ติดต่อเรา" },
] as const;

function sanitizeSlides(value: unknown): HeroBannerSlide[] {
  if (!Array.isArray(value)) return [];
  return (value as HeroBannerSlide[]).filter(
    (s) => typeof s?.imageUrl === "string" && s.imageUrl.trim() !== ""
  );
}

/** Loads the banner slide map for every page from the "pageBanners" site setting. */
export async function getPageBannersMap(): Promise<PageBannersMap> {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: "pageBanners" },
    });
    const raw = setting?.value;
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
    const map: PageBannersMap = {};
    for (const [path, slides] of Object.entries(raw)) {
      map[path] = sanitizeSlides(slides);
    }
    return map;
  } catch (error) {
    console.error("[getPageBannersMap] Failed to load page banners:", error);
    return {};
  }
}

/** Loads banner slides for a single public page path. */
export async function getPageBannerSlides(path: string): Promise<HeroBannerSlide[]> {
  const map = await getPageBannersMap();
  return map[path] ?? [];
}
