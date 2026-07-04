import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { FaqSectionBlock } from "@/components/faq/FaqSectionBlock";
import { getFaqSection } from "@/lib/faqs";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { siteConfig } from "@/lib/site";
import { BrochureDownloadButton } from "@/components/BrochureDownloadButton";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { PromoImages } from "@/components/PromoImages";
import { getPageBanners } from "@/lib/banners";

export const metadata: Metadata = {
  title: "พ.ร.บ. ประกันภัยรถยนต์ — ขอใบเสนอราคา ต่อ พ.ร.บ. ง่าย",
  description:
    "พ.ร.บ. ประกันภัยรถยนต์ เป็นประกันภัยภาคบังคับตามกฎหมาย ครอบคลุมค่ารักษาพยาบาลและทุนประกันในกรณีเสียชีวิต สูญเสียอวัยวะ หรือทุพพลภาพถาวร ขอใบเสนอราคาและต่อ พ.ร.บ. ได้ที่ Pragunpai",
  alternates: { canonical: "/car-act" },
  openGraph: {
    title: "พ.ร.บ. ประกันภัยรถยนต์ — ขอใบเสนอราคา ต่อ พ.ร.บ. ง่าย",
    description:
      "ประกันภัยภาคบังคับตามกฎหมาย ครอบคลุมค่ารักษาพยาบาลและทุนประกัน ขอใบเสนอราคาได้ที่ Pragunpai",
    type: "article",
  },
};

const faqs = [
  {
    question: "พ.ร.บ. ประกันภัยรถยนต์ คืออะไร?",
    answer:
      "พ.ร.บ. ประกันภัยรถยนต์ คือ ประกันภัยภาคบังคับตามพระราชบัญญัติคุ้มครองผู้ประสบภัยจากรถ พ.ศ. 2535 ทุกคนที่มีรถยนต์ต้องซื้อตามกฎหมาย คุ้มครองผู้ประสบภัยจากรถยนต์ โดยครอบคลุมค่ารักษาพยาบาลและทุนประกันในกรณีเสียชีวิต สูญเสียอวัยวะ หรือทุพพลภาพถาวร",
  },
  {
    question: "ไม่ต่อ พ.ร.บ. มีความผิดหรือไม่?",
    answer:
      "ใช่ การขับรถที่ไม่มี พ.ร.บ. มีความผิดตามกฎหมาย มีโทษปรับไม่เกิน 10,000 บาท และหากเกิดอุบัติเหตุจะต้องรับผิดชอบค่าเสียหายด้วยตนเอง",
  },
  {
    question: "สามารถต่อ พ.ร.บ. ล่วงหน้ากี่วัน?",
    answer:
      "สามารถต่อ พ.ร.บ. ล่วงหน้าได้สูงสุด 60 วัน ก่อนวันหมดอายุ แนะนำให้ต่อก่อนหมดอายุเพื่อความต่อเนื่องของความคุ้มครอง",
  },
];

export default async function CarActPage() {
  const [page, setting, banners] = await Promise.all([
    prisma.insurancePage.findUnique({
      where: { slug: "car-act" },
    }),
    prisma.siteSetting.findUnique({
      where: { key: "carActCoverage" },
    }),
    getPageBanners("/car-act"),
  ]);

  if (!page || !page.published) {
    redirect("/");
  }

  interface BrochureItem {
    name: string;
    url: string;
  }

  const parseBrochures = (urlStr: string | null): BrochureItem[] => {
    if (!urlStr) return [];
    try {
      if (urlStr.trim().startsWith("[")) {
        const parsed = JSON.parse(urlStr);
        if (Array.isArray(parsed)) {
          return parsed.filter(item => item.url && item.url.trim() !== "");
        }
      }
    } catch (e) {
      console.warn("Failed to parse pdfUrl JSON:", e);
    }
    return [{ name: "ดาวน์โหลดโบรชัวร์", url: urlStr }];
  };

  const brochures = parseBrochures(page.pdfUrl);

  const coverageTable = Array.isArray(setting?.value)
    ? (setting.value as Array<{ item: string; amount: string }>)
    : [
        { item: "ค่ารักษาพยาบาล (ต่อคน)", amount: "สูงสุด 80,000 บาท" },
        { item: "ทุนประกันกรณีเสียชีวิต/สูญเสียอวัยวะ/ทุพพลภาพถาวร", amount: "สูงสุด 500,000 บาท" },
        { item: "ค่ารักษาพยาบาลในกรณีเจ็บป่วยที่ไม่ใช่อุบัติเหตุ", amount: "สูงสุด 200 บาท/วัน (จำกัด 20 วัน)" },
        { item: "ระยะเวลาคุ้มครอง", amount: "1 ปี" },
      ];
  const faqSection = await getFaqSection("car-act", faqs);

  return (
    <>
      <Container size="wide" className="pt-6">
        <Breadcrumbs items={[{ name: "พ.ร.บ. รถยนต์", href: "/car-act" }]} />
      </Container>

      {/* Hero */}
      <HeroCarousel slides={banners.slides}>
        <section className="bg-gradient-to-br from-navy-700 to-navy-900 py-16 text-white">
          <Container size="wide" className="text-center">
            <span className="text-5xl">🚗</span>
            <h1 className="mt-4 text-3xl font-bold sm:text-4xl">พ.ร.บ. ประกันภัยรถยนต์</h1>
            <p className="mx-auto mt-4 max-w-2xl text-navy-100">
              ประกันภัยภาคบังคับตามกฎหมาย คุ้มครองผู้ประสบภัยจากรถยนต์ ขอใบเสนอราคาและต่อ พ.ร.บ. ได้ง่าย
            </p>
            {page.premium && (
              <p className="mt-3 text-sm text-orange-200 font-bold bg-navy-800/40 inline-block px-3 py-1 rounded-full border border-navy-600/50">
                🏷️ {page.premium}
              </p>
            )}
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button href="/quote/car-act" variant="accent" size="lg">
                ขอใบเสนอราคา พ.ร.บ.
              </Button>
              {brochures.length > 0 && (
                <BrochureDownloadButton brochures={brochures} />
              )}
              <Button href={siteConfig.telUrl} variant="secondary" size="lg">
                📞 โทรปรึกษา {siteConfig.phoneDisplay}
              </Button>
            </div>
          </Container>
        </section>
      </HeroCarousel>

      <PromoImages images={banners.promos} />

      {/* Answer-first intro */}
      <section className="bg-white py-16">
        <Container size="prose">
          <div className="prose-thai">
            <h2>พ.ร.บ. รถยนต์ คืออะไร?</h2>
            <p>
              <strong>พ.ร.บ. ประกันภัยรถยนต์</strong> หรือ ประกันภัยภาคบังคับ
              เป็นประกันภัยที่กฎหมายกำหนดให้รถทุกคันต้องมี ตาม
              พระราชบัญญัติคุ้มครองผู้ประสบภัยจากรถ พ.ศ. 2535
              โดยคุ้มครอง<strong>ค่ารักษาพยาบาล</strong>และ<strong>ทุนประกัน</strong>ให้แก่ผู้ประสบภัย
              ไม่ว่าจะเป็นความผิดของใคร รวมถึงคุ้มครองผู้ขับขี่และผู้โดยสาร
            </p>
            <p>
              การมี พ.ร.บ. จึงเป็นสิ่งจำเป็นและเป็นวิธีที่ถูกต้องตามกฎหมาย
              เพื่อให้ความคุ้มครองพื้นฐานแก่ทุกคนที่ประสบภัยจากรถยนต์
            </p>
          </div>
        </Container>
      </section>

      {/* Coverage table */}
      <section className="bg-navy-50 py-16">
        <Container size="prose">
          <SectionHeading eyebrow="ความคุ้มครอง" title="ตารางความคุ้มครอง พ.ร.บ." />
          <Card className="mt-8 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-navy-600 text-left text-white">
                  <tr>
                    <th className="px-4 py-3 font-medium">รายการคุ้มครอง</th>
                    <th className="px-4 py-3 font-medium">จำนวนเงิน</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-100">
                  {coverageTable.map((row) => (
                    <tr key={row.item}>
                      <td className="px-4 py-3 text-navy-700">{row.item}</td>
                      <td className="px-4 py-3 font-semibold text-navy-900">{row.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <p className="mt-4 text-xs text-navy-500">
            * จำนวนเงินคุ้มครองเป็นไปตามเกณฑ์ของ พ.ร.บ. อาจมีการปรับปรุงตามประกาศทางการ
          </p>
        </Container>
      </section>

      <FaqSectionBlock section={faqSection} />

      {/* CTA */}
      <section className="bg-orange-500 py-12">
        <Container size="wide" className="text-center">
          <h2 className="text-2xl font-bold text-white">พร้อมต่อ พ.ร.บ. แล้วหรือยัง?</h2>
          <div className="mt-6">
            <Button href="/quote/car-act" variant="primary" size="lg">
              ขอใบเสนอราคา พ.ร.บ.
            </Button>
          </div>
        </Container>
      </section>

    </>
  );
}
