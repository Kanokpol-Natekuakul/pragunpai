import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/Container";
import { SeoMetaCard } from "@/components/admin/SeoMetaCard";

export const dynamic = "force-dynamic";

const STATIC_PAGES = [
  { key: "home", label: "หน้าแรก (Homepage)" },
  { key: "about", label: "เกี่ยวกับเรา (About Us)" },
  { key: "contact", label: "ติดต่อเรา (Contact Us)" },
  { key: "quote", label: "ขอใบเสนอราคา (Get Quote)" },
  { key: "privacy", label: "นโยบายความเป็นส่วนตัว (Privacy Policy)" },
];

export default async function SeoAdminPage() {
  await requireAuth().catch(() => redirect("/admin/login"));

  // Fetch all seo records
  const seoMetas = await prisma.seoMeta.findMany();

  // Create lookup map
  const seoMap = new Map(seoMetas.map((item) => [item.pageKey, item]));

  return (
    <Container size="wide" className="py-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy-800">จัดการ SEO หน้าเว็บหลัก (Meta Tags)</h1>
        <p className="text-sm text-navy-500 font-medium mt-1">
          ปรับแต่งชื่อหน้าเว็บ (SEO Title) คำค้นหา (Keywords) และคำโปรยหน้าเสิร์ช (Meta Description) สำหรับแต่ละหน้าหลักของเว็บไซต์
        </p>
      </div>

      <div className="space-y-6">
        {STATIC_PAGES.map((page) => {
          const seoData = seoMap.get(page.key) || null;
          return (
            <SeoMetaCard
              key={page.key}
              pageKey={page.key}
              label={page.label}
              initialData={seoData}
            />
          );
        })}
      </div>
    </Container>
  );
}
