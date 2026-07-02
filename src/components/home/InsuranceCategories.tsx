import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";

type Category = {
  title: string;
  description: string;
  href: string;
  icon: string;
};

const categories: Category[] = [
  {
    title: "พ.ร.บ. รถยนต์",
    description: "ประกันภัยภาคบังคับตามกฎหมาย ทุกคนที่มีรถต้องมี",
    href: "/car-act",
    icon: "🚗",
  },
  {
    title: "ประกันอุบัติเหตุ",
    description: "ความคุ้มครองสำหรับเด็กแรกเกิดถึงผู้สูงอายุ ครอบคลุมทุกช่วงวัย",
    href: "/accident-insurance",
    icon: "🩹",
  },
  {
    title: "ประกันบ้าน-คอนโด-หอพัก",
    description: "ประกันภัยทรัพย์สิน คุ้มครองบ้าน คอนโด และทรัพย์สิน",
    href: "/property-insurance",
    icon: "🏠",
  },
];

/**
 * Section 2 — Main insurance categories.
 */
export function InsuranceCategories() {
  return (
    <section className="bg-white py-20">
      <Container size="wide">
        <SectionHeading
          align="center"
          eyebrow="หมวดประกันหลัก"
          title="เลือกประเภทประกันที่คุณสนใจ"
          subtitle="เราให้คำปรึกษาและเปรียบเทียบแผนประกันภัยหลากหลายประเภท เพื่อช่วยให้คุณเลือกความคุ้มครองที่เหมาะสม"
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {categories.map((cat) => (
            <Card key={cat.href} interactive as="article" className="flex flex-col p-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-navy-50 text-3xl">
                {cat.icon}
              </div>
              <h3 className="mt-5 text-xl font-bold text-navy-800">{cat.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-navy-500">
                {cat.description}
              </p>
              <Link
                href={cat.href}
                className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-orange-500 hover:text-orange-600"
              >
                ดูรายละเอียด
                <span aria-hidden="true">→</span>
              </Link>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
