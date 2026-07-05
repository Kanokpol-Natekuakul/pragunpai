import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { siteConfig } from "@/lib/site";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { PromoImages } from "@/components/PromoImages";
import { getPageBanners } from "@/lib/banners";

export const metadata: Metadata = {
  title: "เกี่ยวกับเรา — Pragunpai ที่ปรึกษาประกันภัยที่โปร่งใส",
  description:
    "Pragunpai ให้คำปรึกษาและเปรียบเทียบแผนประกัน เพื่อช่วยให้คุณเลือกความคุ้มครองที่เหมาะสมก่อนตัดสินใจ โดยเน้นความเข้าใจง่าย ความโปร่งใส และการให้ข้อมูลที่เป็นประโยชน์",
  alternates: { canonical: "/about" },
};

const values = [
  {
    icon: "🔍",
    title: "โปร่งใส",
    description:
      "อธิบายความคุ้มครองชัดเจน ไม่ซ่อนเงื่อนไข ให้ข้อมูลที่เป็นประโยชน์จริง",
  },
  {
    icon: "💡",
    title: "เข้าใจง่าย",
    description:
      "แปลงเรื่องซับซ้อนเกี่ยวกับประกันให้เข้าใจได้โดยไม่ต้องมีความรู้เฉพาะทาง",
  },
  {
    icon: "🤝",
    title: "ตั้งใจดูแล",
    description: "ให้คำแนะนำที่เหมาะสมกับสถานการณ์ของแต่ละคน ไม่ใช่แค่ขายแผน",
  },
  {
    icon: "🛡️",
    title: "คำปรึกษาที่ไว้ใจได้",
    description:
      "ช่วยเปรียบเทียบแผนจากหลายบริษัทประกัน เพื่อให้คุณเลือกได้อย่างมั่นใจ",
  },
];

export default async function AboutPage() {
  const banners = await getPageBanners("/about");

  return (
    <>
      <Container size="wide" className="pt-6">
        <Breadcrumbs items={[{ name: "เกี่ยวกับเรา", href: "/about" }]} />
      </Container>

      <HeroCarousel slides={banners.slides}>
        <section className="bg-linear-to-br from-navy-700 to-navy-900 py-16 text-white">
          <Container size="prose" className="text-center">
            <h1 className="text-3xl font-bold sm:text-4xl">
              เกี่ยวกับ Pragunpai
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-navy-100">
              Pragunpai ให้คำปรึกษาและเปรียบเทียบแผนประกันภัย
              เพื่อช่วยให้ลูกค้าเลือกความคุ้มครองที่เหมาะสมก่อนตัดสินใจ
              โดยเน้นความเข้าใจง่าย ความโปร่งใส
              และการให้ข้อมูลที่เป็นประโยชน์กับลูกค้า
            </p>
          </Container>
        </section>
      </HeroCarousel>

      <PromoImages images={banners.promos} />

      {/* Story / positioning */}
      <section className="bg-white py-16">
        <Container size="prose">
          <div className="prose-thai">
            <h2>จุดยืนของเรา</h2>
            <p>
              <strong>
                Pragunpai เป็นที่ปรึกษาและผู้เปรียบเทียบแผนประกันภัย
              </strong>
              ไม่ใช่บริษัทประกันโดยตรง เราเปรียบเทียบแผนจากบริษัทประกันชั้นนำ
              เพื่อช่วยให้คุณเลือกความคุ้มครองที่เหมาะสมกับไลฟ์สไตล์และงบประมาณ
              ก่อนตัดสินใจซื้อประกัน
            </p>
            <p>
              เราเชื่อว่าการทำประกันภัยไม่ควรเป็นเรื่องยาก เราจึงมุ่งมั่นที่จะ
              <strong>ทำให้เรื่องประกันเข้าใจง่าย</strong> และ
              <strong>ให้ข้อมูลที่เป็นประโยชน์</strong>แก่ลูกค้าอย่างตรงไปตรงมา
              เพื่อให้คุณตัดสินใจได้อย่างมั่นใจ
            </p>
          </div>
        </Container>
      </section>

      {/* Values */}
      <section className="bg-navy-50 py-16">
        <Container size="wide">
          <SectionHeading
            align="center"
            eyebrow="ค่านิยม"
            title="สิ่งที่เราให้ความสำคัญ"
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <Card key={v.title} className="p-6 text-center">
                <div className="text-4xl">{v.icon}</div>
                <h3 className="mt-4 text-lg font-bold text-navy-800">
                  {v.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-500">
                  {v.description}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Contact CTA */}
      <section className="bg-orange-500 py-12">
        <Container size="wide" className="text-center">
          <h2 className="text-2xl font-bold text-white">
            มีคำถามเกี่ยวกับประกันภัย?
          </h2>
          <p className="mt-3 text-orange-50">
            เราพร้อมให้คำปรึกษาฟรี ไม่มีข้อผูกมัด
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href="/quote" variant="primary" size="lg">
              ขอใบเสนอราคา
            </Button>
            <Button href={siteConfig.telUrl} variant="secondary" size="lg">
              📞 {siteConfig.phoneDisplay}
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
