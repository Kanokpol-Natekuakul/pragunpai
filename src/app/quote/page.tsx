import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import QuoteForm from "@/components/insurance/QuoteForm";
import { RecaptchaProvider } from "@/components/ui/RecaptchaProvider";

export const metadata: Metadata = {
  title: "ขอใบเสนอราคาประกันภัย — พ.ร.บ. อุบัติเหตุ บ้านคอนโด",
  description:
    "กรอกฟอร์มเพื่อขอใบเสนอราคาประกันภัย พ.ร.บ. รถยนต์ ประกันอุบัติเหตุส่วนบุคคล และประกันอัคคีภัยบ้าน/คอนโด ฟรี บริการรวดเร็วภายใน 24 ชม.",
  alternates: { canonical: "/quote" },
};

export default function QuotePage() {
  return (
    <RecaptchaProvider>
      <Container size="wide" className="pt-6">
        <Breadcrumbs items={[{ name: "ขอใบเสนอราคา", href: "/quote" }]} />
      </Container>

      <section className="bg-gradient-to-br from-navy-700 to-navy-900 py-12 text-white">
        <Container size="wide" className="text-center">
          <h1 className="text-3xl font-bold sm:text-4xl">
            ขอใบเสนอราคาประกันภัย
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-navy-100">
            บริการเปรียบเทียบและขอใบเสนอราคาฟรี รวดเร็ว สะดวกสบาย ปลอดภัยตามหลัก
            PDPA
          </p>
        </Container>
      </section>

      <QuoteForm initialType="CAR_ACT" />
    </RecaptchaProvider>
  );
}
