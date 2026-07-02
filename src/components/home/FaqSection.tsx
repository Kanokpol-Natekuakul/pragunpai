import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqPageJsonLd } from "@/lib/jsonld";
import { prisma } from "@/lib/prisma";

/**
 * Section 6 — FAQ from DB.
 * Renders FAQPage JSON-LD for AEO (rich results) + GEO (AI citations).
 * Falls back to hardcoded questions if DB is unreachable.
 */
export async function FaqSection() {
  let faqs: { question: string; answer: string }[] = [];

  try {
    const items = await prisma.faqItem.findMany({
      where: { category: "general" },
      orderBy: { order: "asc" },
    });
    faqs = items.map((f) => ({ question: f.question, answer: f.answer }));
  } catch {
    // Fallback when DB is not yet set up.
    faqs = [
      {
        question: "Pragunpai เป็นบริษัทประกันภัยหรือไม่?",
        answer:
          "Pragunpai เป็นที่ปรึกษาและผู้เปรียบเทียบแผนประกันภัย ไม่ใช่บริษัทประกันโดยตรง เราเปรียบเทียบแผนจากบริษัทประกันชั้นนำ เพื่อช่วยให้คุณเลือกความคุ้มครองที่เหมาะสมก่อนตัดสินใจ",
      },
      {
        question: "การขอใบเสนอราคาผ่านเว็บไซต์มีค่าใช้จ่ายหรือไม่?",
        answer:
          "การขอใบเสนอราคาผ่านเว็บไซต์ Pragunpai ไม่มีค่าใช้จ่าย เพียงกรอกฟอร์มและเจ้าหน้าที่จะติดต่อกลับเพื่อเสนอแผนที่เหมาะสม",
      },
    ];
  }

  return (
    <section className="bg-white py-20">
      <Container size="prose">
        <SectionHeading
          align="center"
          eyebrow="คำถามที่พบบ่อย"
          title="คำถามที่ลูกค้าสอบถามบ่อย"
        />
        <div className="mt-10 divide-y divide-navy-100">
          {faqs.map((faq) => (
            <details key={faq.question} className="group py-5">
              <summary className="flex cursor-pointer items-center justify-between gap-4 text-base font-semibold text-navy-800 marker:hidden">
                {faq.question}
                <span className="text-orange-500 transition-transform group-open:rotate-45" aria-hidden="true">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-navy-600">{faq.answer}</p>
            </details>
          ))}
        </div>
        <JsonLd data={faqPageJsonLd(faqs)} />
      </Container>
    </section>
  );
}
