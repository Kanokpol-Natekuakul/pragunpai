import { prisma } from "@/lib/prisma";
import { absoluteUrl, siteConfig } from "@/lib/site";

/**
 * Builders for /llms.txt and /llms-full.txt (https://llmstxt.org).
 * Generated from the database so AI crawlers always see the live set of
 * product pages and articles, mirroring sitemap.ts.
 */

const INTRO = `# ${siteConfig.name}

> Thailand's premium insurance comparison and digital consultation platform.
> We help consumers compare, select, and acquire optimal motor, personal accident, and property insurance plans in Thailand.`;

const STATIC_SECTIONS = `## Quote Request Workflow

Customers can submit quote requests for any product, upload supporting documentation (such as copies of vehicle registration books, existing policies, or ID cards), and receive tailored proposals within 24 hours.

### Contact Information

- **Phone**: +66 ${siteConfig.phoneDisplay.replace(/^0/, "")} (${siteConfig.phoneDisplay})
- **LINE ID**: ${siteConfig.line}
- **Email**: ${siteConfig.email}

## Policies & Compliance

- **PDPA Compliance**: We comply with Thailand's Personal Data Protection Act (PDPA). All submitted customer data and uploaded files are automatically purged from our database after 30 days.

## Main Navigation Paths

- [Homepage](${absoluteUrl("/")})
- [Quote Forms](${absoluteUrl("/quote")})
- [Knowledge Base](${absoluteUrl("/articles")})
- [About Us](${absoluteUrl("/about")})
- [Contact Us](${absoluteUrl("/contact")})
- [Privacy Policy](${absoluteUrl("/privacy-policy")})`;

type ProductRow = {
  slug: string;
  name: string;
  summary: string;
  coverage?: string;
  premium?: string;
  conditions?: string | null;
};

// The three core product pages are code routes (src/app/<slug>/page.tsx) and
// exist regardless of database content, so they are always listed. Published
// InsurancePage rows are merged on top, deduped by slug.
const BASE_PRODUCTS: ProductRow[] = [
  {
    slug: "car-act",
    name: "พ.ร.บ. รถยนต์ (Car Compulsory Motor Insurance)",
    summary:
      "Compulsory motor insurance required by Thai law. Covers medical costs up to 30,000 THB and accidental death/disability up to 500,000 THB.",
  },
  {
    slug: "accident-insurance",
    name: "ประกันอุบัติเหตุส่วนบุคคล (Personal Accident Insurance)",
    summary:
      "24/7 accidental injury coverage, optional daily income compensation, and accidental death benefits.",
  },
  {
    slug: "property-insurance",
    name: "ประกันอัคคีภัยและทรัพย์สิน (Property & Fire Insurance)",
    summary:
      "Protection for houses, condominiums, and commercial structures against fires, water damages, storms, and natural disasters.",
  },
];

type ArticleRow = {
  slug: string;
  title: string;
  excerpt: string;
  content?: string;
  publishedAt?: Date;
};

async function fetchProducts(full: boolean): Promise<ProductRow[]> {
  let dbRows: ProductRow[] = [];
  try {
    dbRows = await prisma.insurancePage.findMany({
      where: { published: true },
      select: {
        slug: true,
        name: true,
        summary: true,
        ...(full ? { coverage: true, premium: true, conditions: true } : {}),
      },
      orderBy: { createdAt: "asc" },
    });
  } catch (e) {
    console.error("[llms.txt] product fetch error:", e);
  }
  const dbSlugs = new Set(dbRows.map((p) => p.slug));
  return [...BASE_PRODUCTS.filter((p) => !dbSlugs.has(p.slug)), ...dbRows];
}

async function fetchArticles(full: boolean): Promise<ArticleRow[]> {
  try {
    return await prisma.article.findMany({
      where: { publishedAt: { lte: new Date() } },
      select: {
        slug: true,
        title: true,
        excerpt: true,
        ...(full ? { content: true, publishedAt: true } : {}),
      },
      orderBy: { publishedAt: "desc" },
    });
  } catch (e) {
    console.error("[llms.txt] article fetch error:", e);
    return [];
  }
}

function productSection(products: ProductRow[]): string {
  if (products.length === 0) return "";
  const lines = products.map(
    (p) => `- [${p.name}](${absoluteUrl(`/${p.slug}`)}): ${p.summary}`
  );
  return `## Core Offerings\n\n${lines.join("\n")}`;
}

function articleSection(articles: ArticleRow[]): string {
  if (articles.length === 0) return "";
  const lines = articles.map(
    (a) => `- [${a.title}](${absoluteUrl(`/articles/${a.slug}`)}): ${a.excerpt}`
  );
  return `## Knowledge Base Articles\n\n${lines.join("\n")}`;
}

/** Index-style llms.txt: intro + link lists for every live page. */
export async function buildLlmsTxt(): Promise<string> {
  const [products, articles] = await Promise.all([
    fetchProducts(false),
    fetchArticles(false),
  ]);

  return (
    [INTRO, productSection(products), STATIC_SECTIONS, articleSection(articles)]
      .filter(Boolean)
      .join("\n\n") + "\n"
  );
}

/** Full-content llms-full.txt: same skeleton plus complete page and article bodies. */
export async function buildLlmsFullTxt(): Promise<string> {
  const [products, articles] = await Promise.all([
    fetchProducts(true),
    fetchArticles(true),
  ]);

  const productBodies = products.map((p) => {
    const parts = [
      `### ${p.name}`,
      `URL: ${absoluteUrl(`/${p.slug}`)}`,
      p.summary,
      p.coverage && `**Coverage**\n\n${p.coverage}`,
      p.premium && `**Premium**\n\n${p.premium}`,
      p.conditions && `**Conditions**\n\n${p.conditions}`,
    ];
    return parts.filter(Boolean).join("\n\n");
  });

  const articleBodies = articles.map((a) => {
    const published = a.publishedAt
      ? `Published: ${a.publishedAt.toISOString().slice(0, 10)}`
      : "";
    return [
      `### ${a.title}`,
      `URL: ${absoluteUrl(`/articles/${a.slug}`)}`,
      published,
      a.excerpt,
      a.content,
    ]
      .filter(Boolean)
      .join("\n\n");
  });

  const sections = [
    INTRO,
    products.length > 0 &&
      `## Core Offerings\n\n${productBodies.join("\n\n---\n\n")}`,
    STATIC_SECTIONS,
    articles.length > 0 &&
      `## Knowledge Base Articles\n\n${articleBodies.join("\n\n---\n\n")}`,
  ];

  return sections.filter(Boolean).join("\n\n") + "\n";
}
