import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { ArticleContent } from "@/components/articles/ArticleContent";
import { articleJsonLd } from "@/lib/jsonld";
import { prisma } from "@/lib/prisma";
import { formatThaiDate, articleCategoryLabel } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

/** Internal links per category — topic-cluster SEO + quote conversion. */
const categoryLinks: Record<string, { infoHref: string; quoteHref: string; label: string }> = {
  CAR_ACT: { infoHref: "/car-act", quoteHref: "/quote/car-act", label: "พ.ร.บ. รถยนต์" },
  ACCIDENT: {
    infoHref: "/accident-insurance",
    quoteHref: "/quote/accident",
    label: "ประกันอุบัติเหตุ",
  },
  PROPERTY: {
    infoHref: "/property-insurance",
    quoteHref: "/quote/property",
    label: "ประกันบ้าน-คอนโด-หอพัก",
  },
};

async function getArticle(slug: string) {
  try {
    return await prisma.article.findFirst({
      where: { slug, publishedAt: { lte: new Date() } },
    });
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: "ไม่พบบทความ" };

  const title = article.seoTitle ?? article.title;
  const description = article.metaDescription ?? article.excerpt;
  return {
    title,
    description,
    keywords: article.keywords ?? undefined,
    alternates: { canonical: `/articles/${article.slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: article.publishedAt.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      ...(article.coverImage ? { images: [{ url: article.coverImage }] } : {}),
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  let related: Awaited<ReturnType<typeof prisma.article.findMany>> = [];
  try {
    related = await prisma.article.findMany({
      where: {
        id: { not: article.id },
        category: article.category,
        publishedAt: { lte: new Date() },
      },
      orderBy: { publishedAt: "desc" },
      take: 3,
    });
  } catch {
    related = [];
  }

  const links = categoryLinks[article.category];

  return (
    <>
      <Container size="wide" className="pt-6">
        <Breadcrumbs
          items={[
            { name: "บทความ", href: "/articles" },
            { name: article.title, href: `/articles/${article.slug}` },
          ]}
        />
      </Container>

      <article className="bg-white py-12">
        <Container size="prose">
          {/* Header */}
          <header>
            <span className="inline-flex rounded-full bg-navy-100 px-2.5 py-0.5 text-xs font-medium text-navy-700">
              {articleCategoryLabel[article.category] ?? article.category}
            </span>
            <h1 className="mt-4 text-3xl font-bold leading-snug text-navy-900 sm:text-4xl">
              {article.title}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-navy-500">{article.excerpt}</p>
            <p className="mt-4 text-sm text-navy-400">
              เผยแพร่เมื่อ{" "}
              <time dateTime={article.publishedAt.toISOString()}>
                {formatThaiDate(article.publishedAt)}
              </time>
            </p>
          </header>

          {article.coverImage && (
            <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl bg-navy-50">
              <Image
                src={article.coverImage}
                alt={article.coverAlt ?? article.title}
                fill
                className="object-cover"
                sizes="(min-width: 768px) 720px, 100vw"
                priority
                unoptimized={article.coverImage.startsWith("http")}
              />
            </div>
          )}

          {/* Body */}
          <div className="mt-10">
            <ArticleContent content={article.content} />
          </div>

          {/* Category CTA */}
          {links && (
            <Card className="mt-12 bg-navy-50 p-6 sm:p-8">
              <p className="font-semibold text-navy-800">
                สนใจ{links.label}? ขอใบเสนอราคาฟรี ไม่มีข้อผูกมัด
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Button href={links.quoteHref} variant="accent">
                  ขอใบเสนอราคา
                </Button>
                <Button href={links.infoHref} variant="outline">
                  ดูข้อมูล{links.label}
                </Button>
              </div>
            </Card>
          )}
        </Container>
      </article>

      {/* Related articles */}
      {related.length > 0 && (
        <section className="bg-navy-50 py-16">
          <Container size="wide">
            <h2 className="text-2xl font-bold text-navy-800">บทความที่เกี่ยวข้อง</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {related.map((item) => (
                <Card key={item.id} interactive as="article" className="overflow-hidden">
                  <Link href={`/articles/${item.slug}`} className="block p-6">
                    <span className="inline-flex rounded-full bg-navy-100 px-2.5 py-0.5 text-xs font-medium text-navy-700">
                      {articleCategoryLabel[item.category] ?? item.category}
                    </span>
                    <h3 className="mt-3 text-lg font-bold text-navy-800 line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-navy-500 line-clamp-2">
                      {item.excerpt}
                    </p>
                    <p className="mt-4 text-xs text-navy-400">
                      {formatThaiDate(item.publishedAt)}
                    </p>
                  </Link>
                </Card>
              ))}
            </div>
          </Container>
        </section>
      )}

      <JsonLd
        data={articleJsonLd({
          title: article.title,
          description: article.metaDescription ?? article.excerpt,
          slug: article.slug,
          image: article.coverImage,
          datePublished: article.publishedAt,
          dateModified: article.updatedAt,
        })}
      />
    </>
  );
}
