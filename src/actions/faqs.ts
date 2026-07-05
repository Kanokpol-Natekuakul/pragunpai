"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { FAQ_CATEGORIES, type FaqCategory, parseFaqSectionSettings } from "@/lib/faqs";
import { runAdminAction } from "@/lib/admin-action";
import { prisma } from "@/lib/prisma";

export type FaqEditorItemInput = {
  id?: string;
  question: string;
  answer: string;
};

const validCategories = new Set<FaqCategory>(FAQ_CATEGORIES.map((item) => item.category));

export async function updateFaqSectionAction(
  category: FaqCategory,
  payload: {
    title: string;
    items: FaqEditorItemInput[];
  },
) {
  return runAdminAction("updateFaqSectionAction", "เกิดข้อผิดพลาดในการบันทึก FAQ", async () => {
    if (!validCategories.has(category)) {
      return { success: false, error: "หมวด FAQ ไม่ถูกต้อง" };
    }

    const title = payload.title.trim();
    const items = payload.items
      .map((item) => ({
        id: item.id,
        question: item.question.trim(),
        answer: item.answer.trim(),
      }))
      .filter((item) => item.question.length > 0 || item.answer.length > 0);

    const incompleteItem = items.find((item) => !item.question || !item.answer);
    if (incompleteItem) {
      return { success: false, error: "กรุณากรอกคำถามและคำตอบให้ครบทุกข้อ" };
    }

    const existingSetting = await prisma.siteSetting.findUnique({
      where: { key: "faqSections" },
    });
    const settings = parseFaqSectionSettings(existingSetting?.value);
    const nextSettings = {
      ...settings,
      [category]: { title },
    };

    await prisma.$transaction(async (tx) => {
      await tx.siteSetting.upsert({
        where: { key: "faqSections" },
        update: { value: nextSettings as Prisma.InputJsonValue },
        create: { key: "faqSections", value: nextSettings as Prisma.InputJsonValue },
      });

      const existingItems = await tx.faqItem.findMany({
        where: { category },
        select: { id: true },
      });
      const existingIds = new Set(existingItems.map((item) => item.id));
      const submittedIds = new Set(items.map((item) => item.id).filter(Boolean) as string[]);
      const idsToDelete = [...existingIds].filter((id) => !submittedIds.has(id));

      if (idsToDelete.length > 0) {
        await tx.faqItem.deleteMany({
          where: { id: { in: idsToDelete }, category },
        });
      }

      for (const [index, item] of items.entries()) {
        if (item.id && existingIds.has(item.id)) {
          await tx.faqItem.update({
            where: { id: item.id },
            data: {
              question: item.question,
              answer: item.answer,
              category,
              order: index,
            },
          });
        } else {
          await tx.faqItem.create({
            data: {
              question: item.question,
              answer: item.answer,
              category,
              order: index,
            },
          });
        }
      }
    });

    revalidatePath("/admin/faqs");
    for (const item of FAQ_CATEGORIES) {
      revalidatePath(item.path);
    }

    return { success: true };
  });
}
