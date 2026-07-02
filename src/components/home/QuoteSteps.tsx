import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { JsonLd } from "@/components/seo/JsonLd";
import { howToJsonLd } from "@/lib/jsonld";

const steps = [
  "เลือกประเภทประกันที่สนใจ (พ.ร.บ., อุบัติเหตุ, บ้าน/คอนโด)",
  "กรอกฟอร์มขอใบเสนอราคา พร้อมแนบไฟล์หากต้องการ",
  "เจ้าหน้าที่ติดต่อกลับพร้อมแผนที่เหมาะสม",
  "รับใบเสนอราคาและคำปรึกษา ตัดสินใจได้อย่างมั่นใจ",
];

/**
 * Section 4 — Quote process steps.
 * HowTo schema for AEO/GEO.
 */
export function QuoteSteps() {
  return (
    <section className="bg-white py-20">
      <Container size="wide">
        <SectionHeading
          align="center"
          eyebrow="ขั้นตอนง่ายๆ"
          title="วิธีขอใบเสนอราคา"
          subtitle="เพียง 4 ขั้นตอนง่ายๆ คุณก็จะได้แผนประกันที่เหมาะสม"
        />
        <ol className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li key={i} className="relative rounded-xl border border-navy-100 bg-navy-50 p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-lg font-bold text-white">
                {i + 1}
              </span>
              <p className="mt-4 text-sm leading-relaxed text-navy-700">{step}</p>
            </li>
          ))}
        </ol>
        <div className="mt-10 text-center">
          <Button href="/quote" variant="accent" size="lg">
            เริ่มขอใบเสนอราคา
          </Button>
        </div>
        <JsonLd data={howToJsonLd({ name: "วิธีขอใบเสนอราคาประกันภัยผ่าน Pragunpai", steps })} />
      </Container>
    </section>
  );
}
