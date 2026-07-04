import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { localBusinessJsonLd } from "@/lib/jsonld";
import { siteConfig } from "@/lib/site";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { getPageBannerSlides } from "@/lib/banners";

export const metadata: Metadata = {
  title: "ติดต่อเรา — Pragunpai ประกันภัย โทร LINE Email",
  description:
    "ติดต่อ Pragunpai เพื่อขอคำปรึกษาและใบเสนอราคาประกันภัย โทร 081 941 6620 แอด LINE หรืออีเมล service@pragunpai.com บริการทั่วประเทศ",
  alternates: { canonical: "/contact" },
};

const contactMethods = [
  {
    icon: "📞",
    label: "โทรศัพท์",
    value: siteConfig.phoneDisplay,
    href: siteConfig.telUrl,
    note: "ทุกวัน เวลาทำการ",
  },
  {
    icon: "💬",
    label: "LINE",
    value: siteConfig.line,
    href: siteConfig.lineUrl,
    note: "แอดเพื่อสอบถามและขอใบเสนอราคา",
  },
  {
    icon: "📧",
    label: "อีเมล",
    value: siteConfig.email,
    href: siteConfig.mailUrl,
    note: "ส่งคำถามหรือเอกสารเพิ่มเติม",
  },
];

export default async function ContactPage() {
  const bannerSlides = await getPageBannerSlides("/contact");

  return (
    <>
      <Container size="wide" className="pt-6">
        <Breadcrumbs items={[{ name: "ติดต่อเรา", href: "/contact" }]} />
      </Container>

      <HeroCarousel slides={bannerSlides}>
        <section className="bg-gradient-to-br from-navy-700 to-navy-900 py-16 text-white">
          <Container size="wide" className="text-center">
            <h1 className="text-3xl font-bold sm:text-4xl">ติดต่อเรา</h1>
            <p className="mx-auto mt-4 max-w-2xl text-navy-100">
              เลือกช่องทางที่สะดวก เราพร้อมให้คำปรึกษาและส่งใบเสนอราคาประกันภัยให้คุณ
            </p>
          </Container>
        </section>
      </HeroCarousel>

      <section className="bg-white py-16">
        <Container size="wide">
          <div className="grid gap-6 md:grid-cols-3">
            {contactMethods.map((m) => (
              <Card key={m.label} className="p-8 text-center">
                <div className="text-5xl">{m.icon}</div>
                <h2 className="mt-4 text-lg font-bold text-navy-800">{m.label}</h2>
                <a
                  href={m.href}
                  className="mt-2 block text-lg font-semibold text-orange-500 hover:text-orange-600"
                  {...(m.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  {m.value}
                </a>
                <p className="mt-2 text-sm text-navy-500">{m.note}</p>
              </Card>
            ))}
          </div>

          {/* Service area */}
          <div className="mt-12 rounded-xl border border-navy-100 bg-navy-50 p-8 text-center">
            <h2 className="text-lg font-bold text-navy-800">พื้นที่ให้บริการ</h2>
            <p className="mt-2 text-navy-600">
              Pragunpai ให้บริการทั่วประเทศไทย ไม่ว่าคุณจะอยู่จังหวัดใด
              ก็สามารถขอคำปรึกษาและใบเสนอราคาได้
            </p>
          </div>

          {/* Quick CTA */}
          <div className="mt-8 text-center">
            <Link
              href="/quote"
              className="inline-block rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600"
            >
              หรือกรอกฟอร์มขอใบเสนอราคา →
            </Link>
          </div>
        </Container>
      </section>

      <JsonLd data={localBusinessJsonLd()} />
    </>
  );
}
