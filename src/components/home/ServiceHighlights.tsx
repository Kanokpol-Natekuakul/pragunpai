import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const highlights = [
  {
    icon: "🔍",
    title: "เปรียบเทียบแผนจริง",
    description: "เปรียบเทียบความคุ้มครองและเบี้ยจากหลายบริษัทประกันในที่เดียว",
  },
  {
    icon: "💬",
    title: "คำปรึกษาฟรี",
    description: "ให้คำแนะนำตรงจุด อธิบายให้เข้าใจง่าย ไม่มีค่าใช้จ่าย",
  },
  {
    icon: "⚡",
    title: "ตอบกลับเร็ว",
    description: "เจ้าหน้าที่ติดต่อกลับโดยเร็ว หลังกรอกฟอร์มขอใบเสนอราคา",
  },
  {
    icon: "🛡️",
    title: "โปร่งใส ไร้ข้อกังวล",
    description: "อธิบายความคุ้มครองชัดเจน ไม่ซ่อนเงื่อนไข",
  },
  {
    icon: "📍",
    title: "บริการทั่วประเทศ",
    description: "ให้คำปรึกษาและส่งใบเสนอราคาได้ทุกจังหวัด",
  },
  {
    icon: "🔒",
    title: "รักษาข้อมูลตาม PDPA",
    description: "เก็บข้อมูลอย่างปลอดภัย ตามกฎหมายคุ้มครองข้อมูลส่วนบุคคล",
  },
];

/**
 * Section 3 — Service highlights / differentiators.
 */
export function ServiceHighlights() {
  return (
    <section className="bg-navy-50 py-20">
      <Container size="wide">
        <SectionHeading
          align="center"
          eyebrow="จุดเด่นบริการ"
          title="ทำไมต้องเลือก Pragunpai?"
          subtitle="เราให้ความสำคัญกับความโปร่งใส ความเข้าใจง่าย และการให้ข้อมูลที่เป็นประโยชน์กับคุณ"
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {highlights.map((h) => (
            <div key={h.title} className="rounded-xl border border-navy-100 bg-white p-6 shadow-sm">
              <div className="text-3xl">{h.icon}</div>
              <h3 className="mt-4 text-lg font-bold text-navy-800">{h.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-500">{h.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
