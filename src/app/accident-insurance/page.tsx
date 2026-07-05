import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqPageJsonLd } from "@/lib/jsonld";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/site";
import { AccidentPlansView } from "@/components/insurance/AccidentPlansView";
import { getFaqSection } from "@/lib/faqs";
import { redirect } from "next/navigation";
import { BrochureDownloadButton } from "@/components/BrochureDownloadButton";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { PromoImages } from "@/components/PromoImages";
import { getPageBanners } from "@/lib/banners";

export const metadata: Metadata = {
  title: "ประกันอุบัติเหตุ — เปรียบเทียบแผน ครอบคลุมเด็กถึงผู้สูงอายุ",
  description:
    "ประกันอุบัติเหตุครอบคลุมเด็กแรกเกิดถึงผู้สูงอายุ คุ้มครองค่ารักษาพยาบาล ทุนประกัน และค่ารักษาพยาบาลจากอุบัติเหตุ เปรียบเทียบแผนและขอใบเสนอราคาได้ที่ Pragunpai",
  alternates: { canonical: "/accident-insurance" },
  openGraph: {
    title: "ประกันอุบัติเหตุ — เปรียบเทียบแผน ครอบคลุมเด็กถึงผู้สูงอายุ",
    description:
      "ครอบคลุมเด็กแรกเกิดถึงผู้สูงอายุ เปรียบเทียบแผนและขอใบเสนอราคาได้ที่ Pragunpai",
    type: "article",
  },
};

// Comparison table — GEO-friendly (AI loves structured comparison data)
const defaultComparisonPlans = [
  {
    feature: "ค่ารักษาพยาบาลจากอุบัติเหตุ (ต่อปี)",
    plan1: "10,000 บาท",
    plan2: "30,000 บาท",
    plan3: "50,000 บาท",
  },
  {
    feature: "ทุนประกันอุบัติเหตุ",
    plan1: "50,000 บาท",
    plan2: "100,000 บาท",
    plan3: "200,000 บาท",
  },
  {
    feature: "เงินชดเชยรายได้ (ต่อวัน)",
    plan1: "200 บาท",
    plan2: "500 บาท",
    plan3: "1,000 บาท",
  },
  {
    feature: "ค่ารักษาพยาบาลโรคประจำตัว",
    plan1: "—",
    plan2: "5,000 บาท",
    plan3: "10,000 บาท",
  },
  {
    feature: "กลุ่มอายุที่เอาประกัน",
    plan1: "1-70 ปี",
    plan2: "1-75 ปี",
    plan3: "1-80 ปี",
  },
];

const faqs = [
  {
    question: "ประกันอุบัติเหตุครอบคลุมผู้สูงอายุหรือไม่?",
    answer:
      "ได้ ประกันอุบัติเหตุหลายแผนรองรับผู้สูงอายุจนถึง 75 หรือ 80 ปี ขึ้นอยู่กับแผน โดยครอบคลุมค่ารักษาพยาบาลจากอุบัติเหตุและทุนประกัน ซึ่งเหมาะสำหรับผู้สูงอายุที่ต้องการความคุ้มครองเพิ่มเติม",
  },
  {
    question: "ประกันอุบัติเหตุกับประกันสุขภาพต่างกันอย่างไร?",
    answer:
      "ประกันอุบัติเหตุคุ้มครองค่ารักษาพยาบาลและทุนประกันที่เกิดจากอุบัติเหตุเท่านั้น ในขณะที่ประกันสุขภาพคุ้มครองทั้งจากอุบัติเหตุและการเจ็บป่วย ประกันอุบัติเหตุจึงเหมาะเป็นสิ่งเสริมและมีเบี้ยประกันที่ถูกกว่า",
  },
  {
    question: "ซื้อประกันอุบัติเหตุให้ลูกได้ตั้งแต่อายุเท่าไหร่?",
    answer:
      "สามารถซื้อประกันอุบัติเหตุให้เด็กได้ตั้งแต่แรกเกิดหรืออายุ 15 วันขึ้นไป ขึ้นอยู่กับเงื่อนไขของแต่ละแผน ซึ่งจะคุ้มครองค่ารักษาพยาบาลและทุนประกันในกรณีเกิดอุบัติเหตุกับเด็ก",
  },
];

export default async function AccidentInsurancePage() {
  const [page, setting, faqSection, banners] = await Promise.all([
    prisma.insurancePage.findUnique({
      where: { slug: "accident-insurance" },
    }),
    prisma.siteSetting.findUnique({
      where: { key: "accidentPlansConfig" },
    }),
    getFaqSection("accident", faqs),
    getPageBanners("/accident-insurance"),
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
          return parsed.filter((item) => item.url && item.url.trim() !== "");
        }
      }
    } catch (e) {
      console.warn("Failed to parse pdfUrl JSON:", e);
    }
    return [{ name: "ดาวน์โหลดโบรชัวร์", url: urlStr }];
  };

  const brochures = parseBrochures(page.pdfUrl);

  const defaultImages = [
    "/images/mockups/accident_plan_basic.jpg",
    "/images/mockups/accident_plan_standard.jpg",
    "/images/mockups/accident_plan_premium.jpg",
  ];

  let viewMode = "both";
  let images = defaultImages;
  let planNames = ["แผนเริ่มต้น", "แผนแนะนำ", "แผนสูงสุด"];
  let comparisonPlans = defaultComparisonPlans;

  if (setting && typeof setting.value === "object" && setting.value !== null) {
    const val = setting.value as {
      viewMode?: string;
      images?: string[];
      planNames?: string[];
      comparisonPlans?: Array<{
        feature: string;
        plan1: string;
        plan2: string;
        plan3: string;
      }>;
    };
    viewMode = val.viewMode || "both";
    images =
      Array.isArray(val.images) && val.images.length === 3
        ? val.images
        : defaultImages;
    planNames =
      Array.isArray(val.planNames) && val.planNames.length === 3
        ? val.planNames
        : ["แผนเริ่มต้น", "แผนแนะนำ", "แผนสูงสุด"];
    comparisonPlans = Array.isArray(val.comparisonPlans)
      ? val.comparisonPlans
      : defaultComparisonPlans;
  }
  return (
    <>
      <Container size="wide" className="pt-6">
        <Breadcrumbs
          items={[{ name: "ประกันอุบัติเหตุ", href: "/accident-insurance" }]}
        />
      </Container>

      <HeroCarousel slides={banners.slides}>
        <section className="bg-linear-to-br from-navy-700 to-navy-900 py-16 text-white">
          <Container size="wide" className="text-center">
            <span className="text-5xl">🩹</span>
            <h1 className="mt-4 text-3xl font-bold sm:text-4xl">
              ประกันอุบัติเหตุ
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-navy-100">
              ความคุ้มครองสำหรับเด็กแรกเกิดถึงผู้สูงอายุ
              เปรียบเทียบแผนและเลือกความคุ้มครองที่เหมาะสม
            </p>
            {page.premium && (
              <p className="mt-3 text-sm text-orange-200 font-bold bg-navy-800/40 inline-block px-3 py-1 rounded-full border border-navy-600/50">
                🏷️ {page.premium}
              </p>
            )}
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button href="/quote/accident" variant="accent" size="lg">
                ขอใบเสนอราคา
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

      <section className="bg-white py-16">
        <Container size="prose">
          <div className="prose-thai">
            <h2>ประกันอุบัติเหตุ คืออะไร?</h2>
            <p>
              <strong>ประกันอุบัติเหตุ</strong>{" "}
              เป็นประกันที่คุ้มครองความสูญเสียที่เกิดจาก
              <strong>อุบัติเหตุ</strong> ครอบคลุม
              <strong>ค่ารักษาพยาบาล</strong>ที่เกิดจากอุบัติเหตุ
              <strong>ทุนประกัน</strong>ในกรณีเสียชีวิต สูญเสียอวัยวะ
              หรือทุพพลภาพถาวร และบางแผนยังมี<strong>เงินชดเชยรายได้</strong>
              ในขณะพักรักษาตัวในโรงพยาบาล
            </p>
            <p>
              ประกันอุบัติเหตุเหมาะสำหรับทุกคนในครอบครัว
              ตั้งแต่เด็กแรกเกิดจนถึงผู้สูงอายุ
              เป็นการเสริมความคุ้มครองที่มีเบี้ยประกันไม่สูงแต่คุ้มค่า
            </p>
          </div>
        </Container>
      </section>

      {/* Comparison section */}
      <section className="bg-navy-50 py-16">
        <Container size="prose">
          <SectionHeading
            eyebrow="เปรียบเทียบแผน"
            title="แผนประกันอุบัติเหตุ"
          />
          <p className="mt-3 text-sm text-navy-500 mb-6">
            * ตัวอย่างแผนเพื่อการเปรียบเทียบเบื้องต้น
            รายละเอียดแผนจริงอาจแตกต่างกันไปตามบริษัทประกันและเงื่อนไข
          </p>
          <AccidentPlansView
            viewMode={viewMode}
            images={images}
            planNames={planNames}
            comparisonPlans={comparisonPlans}
          />
        </Container>
      </section>

      <section className="bg-white py-16">
        <Container size="prose">
          <SectionHeading
            eyebrow={faqSection.eyebrow}
            title={faqSection.title}
          />
          <div className="mt-8 divide-y divide-navy-100">
            {faqSection.items.map((faq) => (
              <details key={faq.question} className="group py-5">
                <summary className="flex cursor-pointer items-center justify-between gap-4 font-semibold text-navy-800">
                  {faq.question}
                  <span className="text-orange-500 transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-navy-600">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-orange-500 py-12">
        <Container size="wide" className="text-center">
          <h2 className="text-2xl font-bold text-white">
            เลือกแผนประกันอุบัติเหตุที่เหมาะกับคุณ
          </h2>
          <div className="mt-6">
            <Button href="/quote/accident" variant="primary" size="lg">
              ขอใบเสนอราคา
            </Button>
          </div>
        </Container>
      </section>

      <JsonLd data={faqPageJsonLd(faqSection.items)} />
    </>
  );
}
