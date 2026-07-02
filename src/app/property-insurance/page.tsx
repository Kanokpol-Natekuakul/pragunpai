import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqPageJsonLd } from "@/lib/jsonld";

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
    description: "คุ้มครองบ้านและสิ่งของในบ้านจากอัคคีภัย ภัยน้ำท่วม วายุ และการสูญหาย",
    items: ["ตัวบ้านและส่วนต่อเติม", "สิ่งของในบ้าน", "ความรับผิดต่อบุคคลที่ 3"],
  },
  {
    icon: "🏢",
    title: "ประกันคอนโด",
    description: "คุ้มครองห้องชุดและทรัพย์สินในคอนโดจากอัคคีภัย น้ำท่วม และความเสียหาย",
    items: ["การตกแต่งห้อง", "ทรัพย์สินในห้อง", "ความรับผิดต่อบุคคลที่ 3"],
  },
  {
    icon: "🏘️",
    title: "ประกันหอพัก",
    description: "คุ้มครองหอพักและทรัพย์สินสำหรับผู้ปล่อยเช่าและผู้เช่า",
    items: ["ตัวอาคาร", "ทรัพย์สินของผู้เช่า", "ความรับผิดต่อผู้เช่าและบุคคลที่ 3"],
  },
];

const faqs = [
  {
    question: "ประกันบ้านคุ้มครองอะไรบ้าง?",
    answer:
      "ประกันบ้านคุ้มครองตัวบ้าน สิ่งของในบ้าน และความรับผิดต่อบุคคลที่ 3 จากอัคคีภัย ฟ้าผ่า วายุ พายุ น้ำท่วม และการสูญหาย ขึ้นอยู่กับขอบเขตของแต่ละแผน",
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

export default function PropertyInsurancePage() {
  return (
    <>
      <Container size="wide" className="pt-6">
        <Breadcrumbs items={[{ name: "ประกันบ้าน-คอนโด-หอพัก", href: "/property-insurance" }]} />
      </Container>

      <section className="bg-gradient-to-br from-navy-700 to-navy-900 py-16 text-white">
        <Container size="wide" className="text-center">
          <span className="text-5xl">🏠</span>
          <h1 className="mt-4 text-3xl font-bold sm:text-4xl">ประกันบ้าน คอนโด หอพัก</h1>
          <p className="mx-auto mt-4 max-w-2xl text-navy-100">
            คุ้มครองทรัพย์สินจากอัคคีภัย ภัยน้ำท่วม วายุ และการสูญหาย เลือกแผนที่เหมาะสม
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href="/quote/property" variant="accent" size="lg">
              ขอใบเสนอราคา
            </Button>
            <Button href="/tel:0819416620" variant="secondary" size="lg">
              📞 โทรสอบถาม
            </Button>
          </div>
        </Container>
      </section>

      <section className="bg-white py-16">
        <Container size="prose">
          <div className="prose-thai">
            <h2>ประกันทรัพย์สิน คืออะไร?</h2>
            <p>
              <strong>ประกันทรัพย์สิน</strong> คุ้มครองบ้าน คอนโด หอพัก และทรัพย์สินภายใน
              จากความเสียหายที่เกิดจาก<strong>อัคคีภัย ฟ้าผ่า วายุ พายุ น้ำท่วม</strong>
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
          <SectionHeading eyebrow="คำถามที่พบบ่อย" title="คำถามเกี่ยวกับประกันทรัพย์สิน" />
          <div className="mt-8 divide-y divide-navy-100">
            {faqs.map((faq) => (
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

      <JsonLd data={faqPageJsonLd(faqs)} />
    </>
  );
}
