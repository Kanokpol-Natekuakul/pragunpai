import { notFound, redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/Container";
import { ArticleEditor } from "@/components/admin/ArticleEditor";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditArticleAdminPage({ params }: Props) {
  await requireAuth().catch(() => redirect("/admin/login"));

  const { id } = await params;

  // Fetch list of insurance pages to link to (for SEO topic clusters)
  const insurancePages = await prisma.insurancePage.findMany({
    select: { id: true, name: true },
    orderBy: { type: "asc" },
  });

  let article = null;

  if (id !== "new") {
    article = await prisma.article.findUnique({
      where: { id },
    });

    if (!article) {
      notFound();
    }
  }

  return (
    <Container size="wide" className="py-4">
      {/* Breadcrumbs */}
      <div className="mb-6">
        <a
          href="/admin/articles"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-600 hover:text-navy-800"
        >
          ← ย้อนกลับไปหน้าจัดการบทความ
        </a>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-800">
          {id === "new" ? "เขียนบทความใหม่" : `แก้ไขบทความ: ${article?.title}`}
        </h1>
        <p className="text-sm text-navy-500 font-medium">เขียน ปรับเปลี่ยนโครงสร้างเนื้อหา SEO สำหรับระบบบล็อกความรู้</p>
      </div>

      <ArticleEditor article={article as any} insurancePages={insurancePages} />
    </Container>
  );
}
