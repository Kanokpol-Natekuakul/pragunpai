/**
 * JSON-LD (Schema.org) builders.
 * These structured-data objects help Google rich-results (AEO),
 * Google AI Overviews / Bing Copilot (GEO), and LLMs (LLMO) parse and cite us.
 *
 * Reference: https://schema.org/
 */
import { siteConfig, absoluteUrl } from "./site";

type JsonLd = Record<string, unknown>;

export function organizationJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "InsuranceAgency",
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    alternateName: "ประกันภัยภักดีไพศาล (Pragunpai)",
    url: siteConfig.url,
    email: siteConfig.email,
    telephone: siteConfig.phone,
    image: absoluteUrl("/logo.png"),
    logo: absoluteUrl("/logo.png"),
    areaServed: {
      "@type": "Country",
      name: "ประเทศไทย",
    },
    knowsAbout: [
      "พ.ร.บ. ประกันภัยรถยนต์",
      "ประกันอุบัติเหตุ",
      "ประกันบ้านและทรัพย์สิน",
      "ประกันคอนโด",
      "การเปรียบเทียบแผนประกันภัย",
    ],
    sameAs: [siteConfig.lineUrl],
  };
}

export function websiteJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    url: siteConfig.url,
    name: siteConfig.name,
    publisher: { "@id": `${siteConfig.url}/#organization` },
    inLanguage: "th-TH",
  };
}

export function localBusinessJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "InsuranceAgency",
    "@id": `${siteConfig.url}/#localbusiness`,
    name: siteConfig.name,
    telephone: siteConfig.phone,
    email: siteConfig.email,
    url: siteConfig.url,
    image: absoluteUrl("/logo.png"),
    priceRange: "$$",
    areaServed: { "@type": "Country", name: "ประเทศไทย" },
    address: {
      "@type": "PostalAddress",
      addressCountry: "TH",
      addressRegion: "ทั่วประเทศ",
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function faqPageJsonLd(items: { question: string; answer: string }[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  };
}

export function articleJsonLd(article: {
  title: string;
  description: string;
  slug: string;
  image?: string | null;
  datePublished: string | Date;
  dateModified?: string | Date;
}): JsonLd {
  const url = absoluteUrl(`/articles/${article.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    image: article.image ? absoluteUrl(article.image) : undefined,
    datePublished: new Date(article.datePublished).toISOString(),
    dateModified: new Date(article.dateModified ?? article.datePublished).toISOString(),
    inLanguage: "th-TH",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: { "@id": `${siteConfig.url}/#organization` },
    publisher: { "@id": `${siteConfig.url}/#organization` },
  };
}

export function productJsonLd(plan: {
  name: string;
  description: string;
  slug: string;
  premium?: string;
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: plan.name,
    description: plan.description,
    url: absoluteUrl(`/${plan.slug}`),
    brand: { "@id": `${siteConfig.url}/#organization` },
    category: "ประกันภัย",
    offers: plan.premium
      ? {
          "@type": "Offer",
          priceCurrency: "THB",
          description: plan.premium,
          availability: "https://schema.org/InStock",
          seller: { "@id": `${siteConfig.url}/#organization` },
        }
      : undefined,
  };
}

export function howToJsonLd(step: {
  name: string;
  steps: string[];
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: step.name,
    step: step.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s,
      text: s,
    })),
  };
}
