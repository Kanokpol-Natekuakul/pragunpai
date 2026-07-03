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

  const defaultComparisonPlans = [
    { id: "row-1", feature: "ค่ารักษาพยาบาลจากอุบัติเหตุ (ต่อปี)", plan1: "10,000 บาท", plan2: "30,000 บาท", plan3: "50,000 บาท" },
    { id: "row-2", feature: "ทุนประกันอุบัติเหตุ", plan1: "50,000 บาท", plan2: "100,000 บาท", plan3: "200,000 บาท" },
    { id: "row-3", feature: "เงินชดเชยรายได้ (ต่อวัน)", plan1: "200 บาท", plan2: "500 บาท", plan3: "1,000 บาท" },
    { id: "row-4", feature: "ค่ารักษาพยาบาลโรคประจำตัว", plan1: "—", plan2: "5,000 บาท", plan3: "10,000 บาท" },
    { id: "row-5", feature: "กลุ่มอายุที่เอาประกัน", plan1: "1-70 ปี", plan2: "1-75 ปี", plan3: "1-80 ปี" },
  ];

  let initialConfig = {
    viewMode: "both",
    images: defaultImages,
    planNames: ["แผนเริ่มต้น", "แผนแนะนำ", "แผนสูงสุด"],
    comparisonPlans: defaultComparisonPlans,
  };

  if (setting && typeof setting.value === "object" && setting.value !== null) {
    const val = setting.value as {
      viewMode?: string;
      images?: string[];
      planNames?: string[];
      comparisonPlans?: Array<{ id?: string; feature: string; plan1: string; plan2: string; plan3: string }>;
    };
    initialConfig = {
      viewMode: val.viewMode || "both",
      images: Array.isArray(val.images) && val.images.length === 3 ? val.images : defaultImages,
      planNames: Array.isArray(val.planNames) && val.planNames.length === 3 ? val.planNames : ["แผนเริ่มต้น", "แผนแนะนำ", "แผนสูงสุด"],
      comparisonPlans: Array.isArray(val.comparisonPlans)
        ? val.comparisonPlans.map((r, idx) => ({
            id: r.id || `row-${idx}-${Date.now()}`,
            feature: r.feature,
            plan1: r.plan1,
            plan2: r.plan2,
            plan3: r.plan3,
          }))
        : defaultComparisonPlans,
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
