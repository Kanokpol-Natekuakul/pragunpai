"use server";

import { prisma } from "@/lib/prisma";
import { runAdminAction } from "@/lib/admin-action";
import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";

export async function updateSiteSettingAction(key: string, value: unknown) {
  return runAdminAction(
    "updateSiteSettingAction",
    "เกิดข้อผิดพลาดในการอัปเดตข้อมูลการตั้งค่า",
    async () => {
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
    }
  );
}
