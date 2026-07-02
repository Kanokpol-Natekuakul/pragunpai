import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // 1. Static Pages
  const staticPages = [
    "",
    "/about",
    "/contact",
    "/privacy-policy",
    "/quote",
    "/quote/car-act",
    "/quote/accident",
    "/quote/property",
    "/quote/other",
  ].map((route) => ({
    url: absoluteUrl(route),
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  // 2. Dynamic Product Pages (e.g. /car-act)
  let productPages: MetadataRoute.Sitemap = [];
  try {
    const pages = await prisma.insurancePage.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    });
    productPages = pages.map((page) => ({
      url: absoluteUrl(`/${page.slug}`),
      lastModified: page.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));
  } catch (e) {
    console.error("[sitemap] product fetch error:", e);
  }

  // 3. Dynamic Articles (e.g. /articles/some-slug)
  let articlePages: MetadataRoute.Sitemap = [];
  try {
    const articles = await prisma.article.findMany({
      where: { publishedAt: { lte: now } },
      select: { slug: true, updatedAt: true },
    });

    articlePages = [
      {
        url: absoluteUrl("/articles"),
        lastModified: now,
        changeFrequency: "daily" as const,
        priority: 0.8,
      },
      ...articles.map((art) => ({
        url: absoluteUrl(`/articles/${art.slug}`),
        lastModified: art.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
    ];
  } catch (e) {
    console.error("[sitemap] article fetch error:", e);
  }

  return [...staticPages, ...productPages, ...articlePages];
}
