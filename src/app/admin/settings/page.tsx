import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/Container";
import {
  SiteSettingsEditor,
  ContactVal,
  NapVal,
  HeroVal,
  FloatingButtonsVal,
} from "@/components/admin/SiteSettingsEditor";

export const dynamic = "force-dynamic";

export default async function SettingsAdminPage() {
  await requireAuth().catch(() => redirect("/admin/login"));

  // Fetch settings from DB
  const settings = await prisma.siteSetting.findMany();
  const settingsMap = new Map(settings.map((s) => [s.key, s.value]));

  // Default values matching seed.ts
  const defaultContact = {
    phone: "0819416620",
    phoneDisplay: "081 941 6620",
    line: "0819416620",
    email: "service@pragunpai.com",
    lineUrl: "https://line.me/R/ti/p/~0819416620",
  };

  const defaultNap = {
    name: "Pragunpai",
    phone: "0819416620",
    email: "service@pragunpai.com",
    addressRegion: "ทั่วประเทศ",
    addressCountry: "TH",
  };

  const defaultHero = {
    headline: "เปรียบเทียบแผนประกันภัย เลือกความคุ้มครองที่เหมาะกับคุณ",
    subheadline: "ให้คำปรึกษาและเปรียบเทียบแผนประกัน พ.ร.บ. รถยนต์ ประกันอุบัติเหตุ และประกันบ้าน/คอนโด ก่อนตัดสินใจ",
    ctaPrimary: { label: "ขอใบเสนอราคาฟรี", href: "/quote" },
    ctaSecondary: { label: "โทรปรึกษา", href: "tel:0819416620" },
  };

  const defaultFloatingButtons = {
    phone: true,
    line: true,
    quote: true,
  };

  const contactVal = (settingsMap.get("contact") ?? defaultContact) as ContactVal;
  const napVal = (settingsMap.get("nap") ?? defaultNap) as NapVal;
  const heroVal = (settingsMap.get("hero") ?? defaultHero) as HeroVal;
  const floatingButtonsVal = (settingsMap.get("floatingButtons") ?? defaultFloatingButtons) as FloatingButtonsVal;

  return (
    <Container size="wide" className="py-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy-800">ตั้งค่าระบบเว็บไซต์หลัก (Site Settings)</h1>
        <p className="text-sm text-navy-500 font-medium mt-1">
          ปรับแต่งข้อมูลการติดต่อเบอร์โทร/LINE ปุ่มลอยบนมือถือ คำแบนเนอร์หน้าแรก และรายละเอียดที่ตั้งร้านค้าตามหลัก Local SEO (NAP)
        </p>
      </div>

      <SiteSettingsEditor
        contactVal={contactVal}
        napVal={napVal}
        heroVal={heroVal}
        floatingButtonsVal={floatingButtonsVal}
      />
    </Container>
  );
}
