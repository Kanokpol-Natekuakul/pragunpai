"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { uploadAttachment } from "@/lib/upload";

export async function updateAccidentPlansConfigAction(config: {
  viewMode: string;
  images: string[];
  planNames: string[];
  comparisonPlans: Array<{ id: string; feature: string; plan1: string; plan2: string; plan3: string }>;
}) {
  try {
    await requireAuth();

    await prisma.siteSetting.upsert({
      where: { key: "accidentPlansConfig" },
      update: { value: config },
      create: { key: "accidentPlansConfig", value: config },
    });

    revalidatePath("/admin/accident-plans");
    revalidatePath("/accident-insurance");

    return { success: true };
  } catch (error) {
    console.error("[updateAccidentPlansConfigAction] Error:", error);
    return { success: false, error: error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการบันทึกข้อมูล" };
  }
}

export async function uploadAccidentPlanImageAction(formData: FormData) {
  try {
    await requireAuth();

    const file = formData.get("file") as File;
    const planIndexStr = formData.get("planIndex") as string;
    
    if (!file) {
      return { success: false, error: "ไม่พบไฟล์อัปโหลด" };
    }

    const result = await uploadAttachment(file);
    const planIndex = parseInt(planIndexStr, 10);

    // Get current config
    const setting = await prisma.siteSetting.findUnique({
      where: { key: "accidentPlansConfig" },
    });

    let currentConfig = {
      viewMode: "both",
      images: [
        "/images/mockups/accident_plan_basic.jpg",
        "/images/mockups/accident_plan_standard.jpg",
        "/images/mockups/accident_plan_premium.jpg",
      ],
      planNames: ["แผนเริ่มต้น", "แผนแนะนำ", "แผนสูงสุด"],
      comparisonPlans: [] as Array<{ id: string; feature: string; plan1: string; plan2: string; plan3: string }>,
    };

    if (setting && typeof setting.value === "object" && setting.value !== null) {
      const val = setting.value as {
        viewMode?: string;
        images?: string[];
        planNames?: string[];
        comparisonPlans?: Array<{ id: string; feature: string; plan1: string; plan2: string; plan3: string }>;
      };
      currentConfig = {
        viewMode: val.viewMode || "both",
        images: Array.isArray(val.images) ? [...val.images] : [...currentConfig.images],
        planNames: Array.isArray(val.planNames) && val.planNames.length === 3 ? [...val.planNames] : [...currentConfig.planNames],
        comparisonPlans: Array.isArray(val.comparisonPlans) ? [...val.comparisonPlans] : [...currentConfig.comparisonPlans],
      };
    }

    if (planIndex >= 0 && planIndex <= 2) {
      currentConfig.images[planIndex] = result.url;
    }

    await prisma.siteSetting.upsert({
      where: { key: "accidentPlansConfig" },
      update: { value: currentConfig },
      create: { key: "accidentPlansConfig", value: currentConfig },
    });

    revalidatePath("/admin/accident-plans");
    revalidatePath("/accident-insurance");

    return { success: true, url: result.url };
  } catch (error) {
    console.error("[uploadAccidentPlanImageAction] Error:", error);
    return { success: false, error: error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ" };
  }
}
