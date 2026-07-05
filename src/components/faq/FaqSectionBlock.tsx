import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { faqPageJsonLd } from "@/lib/jsonld";
import type { FaqSectionView } from "@/lib/faqs";

export function FaqSectionBlock({
  section,
  className = "bg-white py-16",
}: {
  section: FaqSectionView;
  className?: string;
}) {
  if (section.items.length === 0) {
    return null;
  }

  const jsonLdItems = section.items.map((faq) => ({
    question: faq.question,
    answer: faq.answer,
  }));

  return (
    <section className={className}>
      <Container size="prose">
        <SectionHeading eyebrow={section.eyebrow} title={section.title} />
        <div className="mt-8 divide-y divide-navy-100">
          {section.items.map((faq) => (
            <details key={faq.id ?? faq.question} className="group py-5">
              <summary className="flex cursor-pointer items-center justify-between gap-4 font-semibold text-navy-800">
                {faq.question}
                <span
                  className="text-orange-500 transition-transform group-open:rotate-45"
                  aria-hidden="true"
                >
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
      <JsonLd data={faqPageJsonLd(jsonLdItems)} />
    </section>
  );
}
