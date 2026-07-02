import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { prisma } from "@/lib/prisma";
import { formatThaiDate, articleCategoryLabel } from "@/lib/format";

/**
 * Section 7 — Latest articles (SEO content hub).
 * Renders up to 3 most recent articles.
 */
export async function LatestArticles() {
  let articles: Awaited<ReturnType<typeof prisma.article.findMany>> = [];

  try {
    articles = await prisma.article.findMany({
      take: 3,
      orderBy: { publishedAt: "desc" },
      where: { publishedAt: { lte: new Date() } },
    });
  } catch {
    articles = [];
  }

  return (
    <section className="bg-navy-50 py-20">
      <Container size="wide">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <SectionHeading eyebrow="บทความล่าสุด" title="ความรู้ประกันภัยที่คุณควรรู้" />
          <Button href="/articles" variant="outline" size="sm">
            ดูบทความทั้งหมด
          </Button>
        </div>

        {articles.length === 0 ? (
          <Card className="mt-10 p-8 text-center">
            <p className="text-navy-500">
              บทความกำลังจะเปิดตัวเร็วๆ นี้
            </p>
            <p className="mt-1 text-sm text-navy-400">
              ติดตามความรู้และคำแนะนำเกี่ยวกับประกันภัย
            </p>
          </Card>
        ) : (
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {articles.map((article) => (
              <Card key={article.id} interactive as="article" className="overflow-hidden">
                <Link href={`/articles/${article.slug}`} className="block p-6">
                  <span className="inline-flex rounded-full bg-navy-100 px-2.5 py-0.5 text-xs font-medium text-navy-700">
                    {articleCategoryLabel[article.category] ?? article.category}
                  </span>
                  <h3 className="mt-3 text-lg font-bold text-navy-800 line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-navy-500 line-clamp-2">
                    {article.excerpt}
                  </p>
                  <p className="mt-4 text-xs text-navy-400">
                    {formatThaiDate(article.publishedAt)}
                  </p>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
