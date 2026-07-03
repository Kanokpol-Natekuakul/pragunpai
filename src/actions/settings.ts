"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { uploadAttachment } from "@/lib/upload";

export async function updateSiteSettingAction(key: string, value: unknown) {
  try {
    await requireAuth();

    const jsonValue = value as Prisma.InputJsonValue;

    await prisma.siteSetting.upsert({
      where: { key },
      update: { value: jsonValue },
      create: { key, value: jsonValue },
    });

    revalidatePath("/admin/settings");
    revalidatePath("/admin/car-act-coverage");
    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/contact");
    revalidatePath("/car-act");
    revalidatePath("/accident-insurance");
    revalidatePath("/property-insurance");
    revalidatePath("/", "layout");

    return { success: true };
  } catch (error) {
    console.error("[updateSiteSettingAction] Error:", error);
    return { success: false, error: error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการอัปเดตข้อมูลการตั้งค่า" };
  }
}

export async function uploadSiteLogoAction(formData: FormData) {
  try {
    await requireAuth();

    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, error: "ไม่พบไฟล์อัปโหลด" };
    }

    const result = await uploadAttachment(file);
    return { success: true, url: result.url };
  } catch (error) {
    console.error("[uploadSiteLogoAction] Error:", error);
    return { success: false, error: error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ" };
  }
}
