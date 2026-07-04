import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { prisma } from "@/lib/prisma";
import { formatThaiDate, articleCategoryLabel } from "@/lib/format";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { getPageBannerSlides } from "@/lib/banners";

export const metadata: Metadata = {
  title: "บทความความรู้ประกันภัย — พ.ร.บ. ประกันอุบัติเหตุ ประกันบ้าน",
  description:
    "รวมบทความความรู้เรื่องประกันภัย พ.ร.บ. รถยนต์ ประกันอุบัติเหตุ ประกันบ้าน-คอนโด-หอพัก คำแนะนำการเลือกแผนประกัน และคำถามที่พบบ่อย โดยทีมงาน Pragunpai",
  alternates: { canonical: "/articles" },
  openGraph: {
    title: "บทความความรู้ประกันภัย | Pragunpai",
    description:
      "รวมบทความความรู้เรื่องประกันภัย คำแนะนำการเลือกแผนประกัน และคำถามที่พบบ่อย",
    type: "website",
  },
};

export default async function ArticlesPage() {
  let articles: Awaited<ReturnType<typeof prisma.article.findMany>> = [];

  try {
    articles = await prisma.article.findMany({
      where: { publishedAt: { lte: new Date() } },
      orderBy: { publishedAt: "desc" },
    });
  } catch {
    articles = [];
  }

  const bannerSlides = await getPageBannerSlides("/articles");

  return (
    <>
      <Container size="wide" className="pt-6">
        <Breadcrumbs items={[{ name: "บทความ", href: "/articles" }]} />
      </Container>

      {/* Hero */}
      <HeroCarousel slides={bannerSlides}>
        <section className="bg-gradient-to-br from-navy-700 to-navy-900 py-16 text-white">
          <Container size="wide" className="text-center">
            <span className="text-5xl">📚</span>
            <h1 className="mt-4 text-3xl font-bold sm:text-4xl">บทความความรู้ประกันภัย</h1>
            <p className="mx-auto mt-4 max-w-2xl text-navy-100">
              ความรู้เรื่อง พ.ร.บ. รถยนต์ ประกันอุบัติเหตุ ประกันบ้าน-คอนโด-หอพัก
              และคำแนะนำการเลือกแผนประกันที่เหมาะกับคุณ
            </p>
          </Container>
        </section>
      </HeroCarousel>

      {/* Article grid */}
      <section className="bg-navy-50 py-16">
        <Container size="wide">
          {articles.length === 0 ? (
            <Card className="p-10 text-center">
              <p className="text-lg font-semibold text-navy-700">
                บทความกำลังจะเปิดตัวเร็วๆ นี้
              </p>
              <p className="mt-2 text-sm text-navy-500">
                ระหว่างนี้ ดูข้อมูลประกันภัยแต่ละประเภท หรือขอใบเสนอราคาได้เลย
              </p>
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button href="/quote" variant="accent">
                  ขอใบเสนอราคา
                </Button>
                <Button href="/car-act" variant="outline">
                  ดูข้อมูล พ.ร.บ. รถยนต์
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <Card key={article.id} interactive as="article" className="overflow-hidden">
                  <Link href={`/articles/${article.slug}`} className="block p-6">
                    <span className="inline-flex rounded-full bg-navy-100 px-2.5 py-0.5 text-xs font-medium text-navy-700">
                      {articleCategoryLabel[article.category] ?? article.category}
                    </span>
                    <h2 className="mt-3 text-lg font-bold text-navy-800 line-clamp-2">
                      {article.title}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-navy-500 line-clamp-3">
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

      {/* CTA */}
      <section className="bg-orange-500 py-12">
        <Container size="wide" className="text-center">
          <h2 className="text-2xl font-bold text-white">
            มีคำถามเรื่องประกันภัย? ปรึกษาเราได้ฟรี
          </h2>
          <div className="mt-6">
            <Button href="/quote" variant="primary" size="lg">
              ขอใบเสนอราคา
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
