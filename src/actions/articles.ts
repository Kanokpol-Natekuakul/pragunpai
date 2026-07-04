"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { ArticleCategory } from "@/generated/prisma/client";
import { uploadAttachment } from "@/lib/upload";

interface ArticleInput {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  coverAlt: string | null;
  category: ArticleCategory;
  insurancePageId: string | null;
  seoTitle: string | null;
  metaDescription: string | null;
  keywords: string | null;
  publishedAt: Date;
}

export async function createArticleAction(data: ArticleInput) {
  try {
    await requireAuth();

    // Check slug uniqueness
    const existing = await prisma.article.findUnique({
      where: { slug: data.slug },
    });
    if (existing) {
      return { success: false, error: "มีบทความที่ใช้ Slug นี้อยู่แล้ว กรุณาเปลี่ยนชื่อสำหรับ URL" };
    }

    const article = await prisma.article.create({
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        coverImage: data.coverImage,
        coverAlt: data.coverAlt,
        category: data.category,
        insurancePageId: data.insurancePageId || null,
        seoTitle: data.seoTitle || null,
        metaDescription: data.metaDescription || null,
        keywords: data.keywords || null,
        publishedAt: data.publishedAt,
      },
    });

    revalidatePath("/admin/articles");
    revalidatePath("/articles");
    revalidatePath(`/articles/${article.slug}`);
    revalidatePath("/");
    
    return { success: true, articleId: article.id };
  } catch (error) {
    console.error("[createArticleAction] Error:", error);
    return { success: false, error: error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการบันทึกข้อมูล" };
  }
}

export async function updateArticleAction(id: string, data: ArticleInput) {
  try {
    await requireAuth();

    // Check slug uniqueness on other records
    const existing = await prisma.article.findFirst({
      where: { slug: data.slug, NOT: { id } },
    });
    if (existing) {
      return { success: false, error: "มีบทความที่ใช้ Slug นี้อยู่แล้วในระบบ" };
    }

    const article = await prisma.article.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        coverImage: data.coverImage,
        coverAlt: data.coverAlt,
        category: data.category,
        insurancePageId: data.insurancePageId || null,
        seoTitle: data.seoTitle || null,
        metaDescription: data.metaDescription || null,
        keywords: data.keywords || null,
        publishedAt: data.publishedAt,
      },
    });

    revalidatePath("/admin/articles");
    revalidatePath(`/admin/articles/${id}`);
    revalidatePath("/articles");
    revalidatePath(`/articles/${article.slug}`);
    revalidatePath("/");

    return { success: true, articleId: article.id };
  } catch (error) {
    console.error("[updateArticleAction] Error:", error);
    return { success: false, error: error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการบันทึกข้อมูล" };
  }
}

export async function deleteArticleAction(id: string) {
  try {
    await requireAuth();

    const article = await prisma.article.delete({
      where: { id },
    });

    revalidatePath("/admin/articles");
    revalidatePath("/articles");
    revalidatePath(`/articles/${article.slug}`);
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("[deleteArticleAction] Error:", error);
    return { success: false, error: error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการลบข้อมูล" };
  }
}

export async function uploadArticleImageAction(formData: FormData) {
  try {
    await requireAuth();

    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, error: "ไม่พบไฟล์อัปโหลด" };
    }

    const result = await uploadAttachment(file);
    return { success: true, url: result.url };
  } catch (error) {
    console.error("[uploadArticleImageAction] Error:", error);
    return { success: false, error: error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ" };
  }
}
