import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqPageJsonLd } from "@/lib/jsonld";
import { getFaqSection } from "@/lib/faqs";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { siteConfig } from "@/lib/site";
import { BrochureDownloadButton } from "@/components/BrochureDownloadButton";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { PromoImages } from "@/components/PromoImages";
import { getPageBanners } from "@/lib/banners";

export const metadata: Metadata = {
  title: "ประกันบ้าน คอนโด หอพัก — คุ้มครองทรัพย์สิน ขอใบเสนอราคา",
  description:
    "ประกันบ้าน ประกันคอนโด และประกันหอพัก คุ้มครองทรัพย์สินจากอัคคีภัย ภัยน้ำท่วม และการสูญหาย เปรียบเทียบแผนและขอใบเสนอราคาได้ที่ Pragunpai",
  alternates: { canonical: "/property-insurance" },
  openGraph: {
    title: "ประกันบ้าน คอนโด หอพัก — คุ้มครองทรัพย์สิน",
    description: "คุ้มครองทรัพย์สินจากอัคคีภัย ภัยน้ำท่วม ขอใบเสนอราคาที่ Pragunpai",
    type: "article",
  },
};

const propertyTypes = [
  {
    icon: "🏡",
    title: "ประกันบ้าน",
    description: "คุ้มครองบ้านและสิ่งของในบ้านจากอัคคีภัย ภัยน้ำท่วม พายุ และการสูญหาย",
    items: ["ตัวบ้านและส่วนต่อเติม", "สิ่งของในบ้าน", "ความรับผิดต่อบุคคลที่ 3"],
  },
  {
    icon: "🏢",
    title: "ประกันคอนโด",
    description: "คุ้มครองห้องชุดและทรัพย์สินในคอนโดจากอัคคีภัย น้ำท่วม และความเสียหาย",
    items: ["การตกแต่งห้อง", "ทรัพย์สินในห้อง"],
  },
  {
    icon: "🏘️",
    title: "ประกันหอพัก",
    description: "คุ้มครองหอพักและทรัพย์สินสำหรับผู้ปล่อยเช่าและผู้เช่า",
    items: ["ตัวอาคาร", "ทรัพย์สินของผู้เช่า (กรณีขอเพิ่มเติม)"],
  },
];

const faqs = [
  {
    question: "ประกันบ้านคุ้มครองอะไรบ้าง?",
    answer:
      "ประกันบ้านคุ้มครองตัวบ้าน สิ่งของในบ้าน และความรับผิดต่อบุคคลที่ 3 จากอัคคีภัย ฟ้าผ่า พายุ น้ำท่วม และการสูญหาย ขึ้นอยู่กับขอบเขตของแต่ละแผน",
  },
  {
    question: "ประกันคอนโดกับประกันบ้านต่างกันอย่างไร?",
    answer:
      "ประกันคอนโดมักคุ้มครองเฉพาะส่วนที่เป็นการตกแต่งภายในห้องและทรัพย์สินส่วนบุคคล เนื่องจากตัวอาคารมักได้รับการคุ้มครองจากนิติบุคคล ในขณะที่ประกันบ้านคุ้มครองทั้งตัวบ้านและที่ดิน",
  },
  {
    question: "มีผู้เช่าต้องทำประกันบ้านหรือไม่?",
    answer:
      "หากคุณเป็นเจ้าของบ้านและมีผู้เช่า ขอแนะนำให้ทำประกันบ้านเพื่อคุ้มครองตัวอาคารและความรับผิดต่อผู้เช่าและบุคคลที่ 3 ผู้เช่าก็สามารถทำประกันทรัพย์สินเพื่อคุ้มครองของส่วนตัวได้",
  },
];

export default async function PropertyInsurancePage() {
  const [page, faqSection, banners] = await Promise.all([
    prisma.insurancePage.findUnique({
      where: { slug: "property-insurance" },
    }),
    getFaqSection("property", faqs),
    getPageBanners("/property-insurance"),
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
  return (
    <>
      <Container size="wide" className="pt-6">
        <Breadcrumbs items={[{ name: "ประกันบ้าน-คอนโด-หอพัก", href: "/property-insurance" }]} />
      </Container>

      <HeroCarousel slides={banners.slides}>
        <section className="bg-linear-to-br from-navy-700 to-navy-900 py-16 text-white">
          <Container size="wide" className="text-center">
            <span className="text-5xl">🏠</span>
            <h1 className="mt-4 text-3xl font-bold sm:text-4xl">ประกันบ้าน คอนโด หอพัก</h1>
            <p className="mx-auto mt-4 max-w-2xl text-navy-100">
              คุ้มครองทรัพย์สินจากอัคคีภัย ภัยน้ำท่วม พายุ และการสูญหาย เลือกแผนที่เหมาะสม
            </p>
            {page.premium && (
              <p className="mt-3 text-sm text-orange-200 font-bold bg-navy-800/40 inline-block px-3 py-1 rounded-full border border-navy-600/50">
                🏷️ {page.premium}
              </p>
            )}
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button href="/quote/property" variant="accent" size="lg">
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
            <h2>ประกันทรัพย์สิน คืออะไร?</h2>
            <p>
              <strong>ประกันทรัพย์สิน</strong> คุ้มครองบ้าน คอนโด หอพัก และทรัพย์สินภายใน
              จากความเสียหายที่เกิดจาก<strong> อัคคีภัย ฟ้าผ่า พายุ น้ำท่วม </strong>
              รวมถึงการสูญหายและความรับผิดต่อบุคคลที่สาม
            </p>
            <p>
              ไม่ว่าคุณจะเป็นเจ้าของบ้าน คอนโด หอพัก หรือผู้เช่า
              การมีประกันทรัพย์สินจะช่วยให้คุณมั่นใจว่าทรัพย์สินของคุณได้รับการคุ้มครอง
            </p>
          </div>
        </Container>
      </section>

      {/* Property types */}
      <section className="bg-navy-50 py-16">
        <Container size="wide">
          <SectionHeading eyebrow="ประเภทประกัน" title="เลือกประเภทที่เหมาะกับคุณ" />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {propertyTypes.map((pt) => (
              <Card key={pt.title} className="p-6">
                <div className="text-4xl">{pt.icon}</div>
                <h3 className="mt-4 text-xl font-bold text-navy-800">{pt.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-500">{pt.description}</p>
                <ul className="mt-4 space-y-1.5 text-sm text-navy-600">
                  {pt.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-orange-500">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-white py-16">
        <Container size="prose">
          <SectionHeading eyebrow={faqSection.eyebrow} title={faqSection.title} />
          <div className="mt-8 divide-y divide-navy-100">
            {faqSection.items.map((faq) => (
              <details key={faq.question} className="group py-5">
                <summary className="flex cursor-pointer items-center justify-between gap-4 font-semibold text-navy-800">
                  {faq.question}
                  <span className="text-orange-500 transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-navy-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-orange-500 py-12">
        <Container size="wide" className="text-center">
          <h2 className="text-2xl font-bold text-white">ปกป้องทรัพย์สินของคุณวันนี้</h2>
          <div className="mt-6">
            <Button href="/quote/property" variant="primary" size="lg">
              ขอใบเสนอราคา
            </Button>
          </div>
        </Container>
      </section>

      <JsonLd data={faqPageJsonLd(faqSection.items)} />
    </>
  );
}
