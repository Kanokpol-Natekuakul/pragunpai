import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqPageJsonLd } from "@/lib/jsonld";

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
const comparisonPlans = [
  { feature: "ค่ารักษาพยาบาลจากอุบัติเหตุ (ต่อปี)", plan1: "10,000 บาท", plan2: "30,000 บาท", plan3: "50,000 บาท" },
  { feature: "ทุนประกันอุบัติเหตุ", plan1: "50,000 บาท", plan2: "100,000 บาท", plan3: "200,000 บาท" },
  { feature: "เงินชดเชยรายได้ (ต่อวัน)", plan1: "200 บาท", plan2: "500 บาท", plan3: "1,000 บาท" },
  { feature: "ค่ารักษาพยาบาลโรคประจำตัว", plan1: "—", plan2: "5,000 บาท", plan3: "10,000 บาท" },
  { feature: "กลุ่มอายุที่เอาประกัน", plan1: "1-70 ปี", plan2: "1-75 ปี", plan3: "1-80 ปี" },
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

export default function AccidentInsurancePage() {
  return (
    <>
      <Container size="wide" className="pt-6">
        <Breadcrumbs items={[{ name: "ประกันอุบัติเหตุ", href: "/accident-insurance" }]} />
      </Container>

      <section className="bg-gradient-to-br from-navy-700 to-navy-900 py-16 text-white">
        <Container size="wide" className="text-center">
          <span className="text-5xl">🩹</span>
          <h1 className="mt-4 text-3xl font-bold sm:text-4xl">ประกันอุบัติเหตุ</h1>
          <p className="mx-auto mt-4 max-w-2xl text-navy-100">
            ความคุ้มครองสำหรับเด็กแรกเกิดถึงผู้สูงอายุ เปรียบเทียบแผนและเลือกความคุ้มครองที่เหมาะสม
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href="/quote/accident" variant="accent" size="lg">
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
            <h2>ประกันอุบัติเหตุ คืออะไร?</h2>
            <p>
              <strong>ประกันอุบัติเหตุ</strong> เป็นประกันที่คุ้มครองความสูญเสียที่เกิดจาก
              <strong>อุบัติเหตุ</strong> ครอบคลุม<strong>ค่ารักษาพยาบาล</strong>ที่เกิดจากอุบัติเหตุ
              <strong>ทุนประกัน</strong>ในกรณีเสียชีวิต สูญเสียอวัยวะ หรือทุพพลภาพถาวร
              และบางแผนยังมี<strong>เงินชดเชยรายได้</strong>ในขณะพักรักษาตัวในโรงพยาบาล
            </p>
            <p>
              ประกันอุบัติเหตุเหมาะสำหรับทุกคนในครอบครัว ตั้งแต่เด็กแรกเกิดจนถึงผู้สูงอายุ
              เป็นการเสริมความคุ้มครองที่มีเบี้ยประกันไม่สูงแต่คุ้มค่า
            </p>
          </div>
        </Container>
      </section>

      {/* Comparison table (GEO-friendly) */}
      <section className="bg-navy-50 py-16">
        <Container size="prose">
          <SectionHeading eyebrow="เปรียบเทียบแผน" title="ตารางเปรียบเทียบแผนประกันอุบัติเหตุ" />
          <p className="mt-3 text-sm text-navy-500">
            * ตัวอย่างแผนเพื่อการเปรียบเทียบเบื้องต้น รายละเอียดแผนจริงอาจแตกต่างกันไปตามบริษัทประกันและเงื่อนไข
          </p>
          <Card className="mt-6 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-navy-600 text-left text-white">
                  <tr>
                    <th className="px-4 py-3 font-medium">รายการคุ้มครอง</th>
                    <th className="px-4 py-3 font-medium">แผนพื้นฐาน</th>
                    <th className="px-4 py-3 font-medium">แผนมาตรฐาน</th>
                    <th className="px-4 py-3 font-medium">แผนพรีเมียม</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-100">
                  {comparisonPlans.map((row) => (
                    <tr key={row.feature}>
                      <td className="px-4 py-3 text-navy-700">{row.feature}</td>
                      <td className="px-4 py-3 text-navy-600">{row.plan1}</td>
                      <td className="px-4 py-3 font-semibold text-navy-900">{row.plan2}</td>
                      <td className="px-4 py-3 font-semibold text-orange-600">{row.plan3}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </Container>
      </section>

      <section className="bg-white py-16">
        <Container size="prose">
          <SectionHeading eyebrow="คำถามที่พบบ่อย" title="คำถามเกี่ยวกับประกันอุบัติเหตุ" />
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
          <h2 className="text-2xl font-bold text-white">เลือกแผนประกันอุบัติเหตุที่เหมาะกับคุณ</h2>
          <div className="mt-6">
            <Button href="/quote/accident" variant="primary" size="lg">
              ขอใบเสนอราคา
            </Button>
          </div>
        </Container>
      </section>

      <JsonLd data={faqPageJsonLd(faqs)} />
    </>
  );
}
