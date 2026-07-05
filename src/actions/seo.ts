"use server";

import { prisma } from "@/lib/prisma";
import { runAdminAction } from "@/lib/admin-action";
import { revalidatePath } from "next/cache";

interface SeoMetaInput {
  seoTitle: string;
  metaDescription: string;
  keywords: string | null;
}

export async function updateSeoMetaAction(pageKey: string, data: SeoMetaInput) {
  return runAdminAction("updateSeoMetaAction", "เกิดข้อผิดพลาดในการบันทึกข้อมูล SEO", async () => {
    await prisma.seoMeta.upsert({
      where: { pageKey },
      update: {
        seoTitle: data.seoTitle,
        metaDescription: data.metaDescription,
        keywords: data.keywords || null,
      },
      create: {
        pageKey,
        seoTitle: data.seoTitle,
        metaDescription: data.metaDescription,
        keywords: data.keywords || null,
      },
    });

    revalidatePath("/admin/seo");
    // Revalidate relevant pages
    if (pageKey === "home") revalidatePath("/");
    else if (pageKey === "about") revalidatePath("/about");
    else if (pageKey === "contact") revalidatePath("/contact");
    else if (pageKey === "privacy") revalidatePath("/privacy-policy");
    else if (pageKey === "quote") {
      revalidatePath("/quote");
      revalidatePath("/quote/car-act");
      revalidatePath("/quote/accident");
      revalidatePath("/quote/property");
      revalidatePath("/quote/other");
    }

    return { success: true };
  });
}
