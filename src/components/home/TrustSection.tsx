import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { siteConfig } from "@/lib/site";

const stats = [
  { value: "3+", label: "ประเภทประกันที่ให้คำปรึกษา" },
  { value: "ทั่วประเทศ", label: "พื้นที่ให้บริการ" },
  { value: "ฟรี", label: "คำปรึกษาและใบเสนอราคา" },
  { value: "PDPA", label: "คุ้มครองข้อมูลส่วนบุคคล" },
];

/**
 * Section 5 — Trust / credibility signals (E-E-A-T for GEO).
 */
export function TrustSection() {
  return (
    <section className="bg-navy-800 py-20 text-white">
      <Container size="wide">
        <SectionHeading
          align="center"
          eyebrow="ความน่าเชื่อถือ"
          title={
            <span className="text-white">
              โปร่งใส และให้ข้อมูลที่เป็นประโยชน์
            </span>
          }
          subtitle={
            <span className="text-navy-200">
              เราให้ความสำคัญกับความโปร่งใสและความเข้าใจง่าย
              เพื่อให้คุณตัดสินใจได้อย่างมั่นใจ
            </span>
          }
        />
        <div className="mt-12 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-navy-700 bg-navy-700/50 p-6 text-center"
            >
              <p className="text-2xl font-bold text-orange-400 sm:text-3xl">
                {s.value}
              </p>
              <p className="mt-2 text-sm text-navy-200">{s.label}</p>
            </div>
          ))}
        </div>
        <p className="mt-10 text-center text-sm text-navy-300">
          📞 โทร: {siteConfig.phoneDisplay} · 📧 {siteConfig.email} · 💬 LINE:{" "}
          {siteConfig.line}
        </p>
      </Container>
    </section>
  );
}
