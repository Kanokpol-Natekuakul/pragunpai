"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

interface InsurancePageUpdateInput {
  name: string;
  summary: string;
  coverage: string;
  premium: string;
  conditions: string | null;
  pdfUrl: string | null;
  seoTitle: string | null;
  metaDescription: string | null;
  keywords: string | null;
  published: boolean;
}

export async function updateInsurancePageAction(id: string, data: InsurancePageUpdateInput) {
  try {
    await requireAuth();

    const page = await prisma.insurancePage.update({
      where: { id },
      data: {
        name: data.name,
        summary: data.summary,
        coverage: data.coverage,
        premium: data.premium,
        conditions: data.conditions,
        pdfUrl: data.pdfUrl,
        seoTitle: data.seoTitle,
        metaDescription: data.metaDescription,
        keywords: data.keywords,
        published: data.published,
      },
    });

    revalidatePath(`/admin/insurance-pages`);
    revalidatePath(`/admin/insurance-pages/${id}`);
    revalidatePath(`/${page.slug}`);
    revalidatePath(`/`);
    
    return { success: true };
  } catch (error: any) {
    console.error("[updateInsurancePageAction] Error:", error);
    return { success: false, error: error.message || "เกิดข้อผิดพลาดในการอัปเดตข้อมูล" };
  }
}

interface PlanRowInput {
  coverageItem: string;
  planValues: Record<string, string>;
  order: number;
}

export async function updateComparisonTableAction(pageId: string, rows: PlanRowInput[]) {
  try {
    await requireAuth();

    // Find page to check if it exists and to get slug
    const page = await prisma.insurancePage.findUnique({
      where: { id: pageId },
    });
    if (!page) {
      return { success: false, error: "ไม่พบหน้าแผนประกันดังกล่าว" };
    }

    // Find or create comparison table
    let table = await prisma.comparisonTable.findUnique({
      where: { insurancePageId: pageId },
    });

    if (!table) {
      table = await prisma.comparisonTable.create({
        data: { insurancePageId: pageId },
      });
    }

    // Replace all rows inside transaction/sequence: delete existing then insert new
    await prisma.planRow.deleteMany({
      where: { tableId: table.id },
    });

    if (rows.length > 0) {
      await prisma.planRow.createMany({
        data: rows.map((row) => ({
          tableId: table!.id,
          coverageItem: row.coverageItem,
          planValues: row.planValues as any,
          order: row.order,
        })),
      });
    }

    revalidatePath(`/admin/insurance-pages`);
    revalidatePath(`/admin/insurance-pages/${pageId}`);
    revalidatePath(`/${page.slug}`);
    revalidatePath(`/`);

    return { success: true };
  } catch (error: any) {
    console.error("[updateComparisonTableAction] Error:", error);
    return { success: false, error: error.message || "เกิดข้อผิดพลาดในการบันทึกตารางเปรียบเทียบ" };
  }
}
