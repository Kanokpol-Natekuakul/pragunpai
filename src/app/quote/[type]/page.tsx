import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import QuoteForm from "@/components/insurance/QuoteForm";
import { RecaptchaProvider } from "@/components/ui/RecaptchaProvider";

type Props = {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ plan?: string }>;
};

const metadataMap: Record<string, { title: string; description: string }> = {
  "car-act": {
    title: "ขอใบเสนอราคา พ.ร.บ. และประกันรถยนต์",
    description:
      "ขอใบเสนอราคา พ.ร.บ. และประกันภัยรถยนต์ออนไลน์ ต่อ พ.ร.บ. ง่าย สะดวก รวดเร็ว พร้อมเปรียบเทียบเบี้ยประกันภัยที่ดีที่สุดสำหรับคุณ",
  },
  accident: {
    title: "ขอใบเสนอราคา ประกันอุบัติเหตุส่วนบุคคล",
    description:
      "ขอใบเสนอราคาประกันอุบัติเหตุส่วนบุคคล เปรียบเทียบแผนความคุ้มครอง คุ้มครองอุบัติเหตุ 24 ชั่วโมง และค่ารักษาพยาบาลราคาพิเศษ",
  },
  property: {
    title: "ขอใบเสนอราคา ประกันบ้านและคอนโด",
    description:
      "ขอใบเสนอราคาประกันภัยบ้าน คอนโดมิเนียม และประกันอัคคีภัย คุ้มครองทรัพย์สิน โครงสร้างอาคาร ภัยจากน้ำ และภัยธรรมชาติจากบริษัทประกันชั้นนำ",
  },
  other: {
    title: "ขอใบเสนอราคา ประกันภัยอื่นๆ / สอบถามเพิ่มเติม",
    description:
      "ขอใบเสนอราคาประกันภัยสุขภาพ ประกันการเดินทาง ประกันโรคร้ายแรง หรือติดต่อสอบถามคำแนะนำเรื่องประกันภัยจากผู้เชี่ยวชาญฟรี",
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type } = await params;
  const meta = metadataMap[type];
  if (!meta) return { title: "ไม่พบหน้าขอใบเสนอราคา" };

  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: `/quote/${type}` },
  };
}

export default async function QuoteTypePage({ params, searchParams }: Props) {
  const { type } = await params;
  const { plan } = await searchParams;

  const validTypes = ["car-act", "accident", "property", "other"];
  if (!validTypes.includes(type)) {
    notFound();
  }

  const activeType =
    type === "car-act"
      ? "CAR_ACT"
      : type === "accident"
        ? "ACCIDENT"
        : type === "property"
          ? "PROPERTY"
          : "OTHER";

  const label =
    type === "car-act"
      ? "พ.ร.บ. & ประกันรถยนต์"
      : type === "accident"
        ? "ประกันอุบัติเหตุ"
        : type === "property"
          ? "ประกันบ้าน & คอนโด"
          : "ประกันอื่นๆ / สอบถาม";

  return (
    <RecaptchaProvider>
      <Container size="wide" className="pt-6">
        <Breadcrumbs
          items={[
            { name: "ขอใบเสนอราคา", href: "/quote" },
            { name: label, href: `/quote/${type}` },
          ]}
        />
      </Container>

      <section className="bg-linear-to-br from-navy-700 to-navy-900 py-12 text-white">
        <Container size="wide" className="text-center">
          <h1 className="text-3xl font-bold sm:text-4xl">
            ขอใบเสนอราคา{label}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-navy-100">
            บริการเปรียบเทียบและขอใบเสนอราคาฟรี รวดเร็ว สะดวกสบาย ปลอดภัยตามหลัก
            PDPA
          </p>
        </Container>
      </section>

      <QuoteForm initialType={activeType} selectedPlan={plan} />
    </RecaptchaProvider>
  );
}
