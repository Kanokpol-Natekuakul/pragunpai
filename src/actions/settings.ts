"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";

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

    return { success: true };
  } catch (error) {
    console.error("[updateSiteSettingAction] Error:", error);
    return { success: false, error: error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการอัปเดตข้อมูลการตั้งค่า" };
  }
}
