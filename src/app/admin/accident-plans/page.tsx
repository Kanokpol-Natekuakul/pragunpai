import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/Container";
import { AccidentPlansEditor } from "@/components/admin/AccidentPlansEditor";

export const dynamic = "force-dynamic";

export default async function AccidentPlansAdminPage() {
  await requireAuth().catch(() => redirect("/admin/login"));

  // Fetch settings from DB
  const setting = await prisma.siteSetting.findUnique({
    where: { key: "accidentPlansConfig" },
  });

  const defaultImages = [
    "/images/mockups/accident_plan_basic.jpg",
    "/images/mockups/accident_plan_standard.jpg",
    "/images/mockups/accident_plan_premium.jpg",
  ];

  let initialConfig = {
    viewMode: "both",
    images: defaultImages,
  };

  if (setting && typeof setting.value === "object" && setting.value !== null) {
    const val = setting.value as { viewMode?: string; images?: string[] };
    initialConfig = {
      viewMode: val.viewMode || "both",
      images: Array.isArray(val.images) && val.images.length === 3 ? val.images : defaultImages,
    };
  }

  return (
    <Container size="wide" className="py-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy-800">จัดการแผนโบรชัวร์ประกันอุบัติเหตุ</h1>
        <p className="text-sm text-navy-500 font-medium mt-1">
          ปรับแต่งโหมดการแสดงแผนเปรียบเทียบในหน้า /accident-insurance และอัปโหลดโบรชัวร์รูปภาพ 1 แถว 3 รูป พร้อมฟังก์ชันคลิกขยายใหญ่
        </p>
      </div>

      <AccidentPlansEditor initialConfig={initialConfig} />
    </Container>
  );
}
