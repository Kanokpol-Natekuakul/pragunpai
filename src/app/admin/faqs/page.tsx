import { redirect } from "next/navigation";
import { FaqEditor } from "@/components/admin/FaqEditor";
import { Container } from "@/components/ui/Container";
import {
  FAQ_CATEGORIES,
  DEFAULT_FAQS,
  parseFaqSectionSettings,
  type FaqCategory,
  type FaqSectionView,
} from "@/lib/faqs";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function FaqAdminPage() {
  await requireAuth().catch(() => redirect("/admin/login"));

  const [setting, items] = await Promise.all([
    prisma.siteSetting.findUnique({ where: { key: "faqSections" } }),
    prisma.faqItem.findMany({
      where: { category: { in: FAQ_CATEGORIES.map((item) => item.category) } },
      orderBy: [{ category: "asc" }, { order: "asc" }, { createdAt: "asc" }],
    }),
  ]);

  const settings = parseFaqSectionSettings(setting?.value);
  const sections: FaqSectionView[] = FAQ_CATEGORIES.map((config) => {
    const category = config.category as FaqCategory;
    const dbItems = items.filter((item) => item.category === category);
    const finalItems =
      dbItems.length > 0
        ? dbItems.map((item) => ({
            id: item.id,
            question: item.question,
            answer: item.answer,
            order: item.order,
          }))
        : DEFAULT_FAQS[category].map((item, index) => ({
            question: item.question,
            answer: item.answer,
            order: index,
          }));

    return {
      category,
      label: config.label,
      path: config.path,
      eyebrow: "คำถามที่พบบ่อย",
      title: settings[category]?.title?.trim() || config.defaultTitle,
      items: finalItems,
    };
  });

  return (
    <Container size="wide" className="py-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy-800">
          จัดการคำถามที่พบบ่อย (FAQ)
        </h1>
        <p className="mt-1 text-sm font-medium text-navy-500">
          แก้ชื่อหัวข้อ คำถาม คำตอบ ลำดับการแสดงผล และลบรายการ FAQ
          ที่แสดงบนหน้าเว็บหลัก
        </p>
      </div>

      <FaqEditor sections={sections} />
    </Container>
  );
}
