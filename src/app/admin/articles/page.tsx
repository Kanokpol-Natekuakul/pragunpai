import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { formatThaiDate, articleCategoryLabel } from "@/lib/format";
import { DeleteArticleButton } from "@/components/admin/DeleteArticleButton";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ArticlesAdminPage() {
  await requireAuth().catch(() => redirect("/admin/login"));

  const articles = await prisma.article.findMany({
    orderBy: { publishedAt: "desc" },
    include: { insurancePage: true },
  });

  return (
    <Container size="wide" className="py-4">
      {/* Header section */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-navy-800">จัดการบทความ (SEO Articles)</h1>
          <p className="text-sm text-navy-500 font-medium">
            เขียนและแก้ไขบทความเพื่อเสริมสร้างคะแนน SEO และให้คำแนะนำความรู้แก่ผู้เอาประกันภัย
          </p>
        </div>
        <div>
          <Link
            href="/admin/articles/new"
            className="inline-flex rounded-lg bg-orange-500 hover:bg-orange-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors cursor-pointer"
          >
            ✍️ เขียนบทความใหม่
          </Link>
        </div>
      </div>

      {/* Articles table list */}
      <Card className="overflow-hidden bg-white border border-gray-200">
        {articles.length === 0 ? (
          <div className="p-12 text-center text-sm text-navy-400 font-medium">
            ยังไม่มีบทความในระบบ คลิก &ldquo;เขียนบทความใหม่&rdquo; เพื่อเริ่มต้นเขียน
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-navy-900 text-white uppercase text-[11px] tracking-wider font-semibold border-b border-navy-950">
                <tr>
                  <th className="px-6 py-4">หัวข้อบทความ</th>
                  <th className="px-6 py-4">หมวดหมู่</th>
                  <th className="px-6 py-4">กลุ่มเป้าหมาย (Insurance)</th>
                  <th className="px-6 py-4">วันที่เผยแพร่</th>
                  <th className="px-6 py-4">สถานะ</th>
                  <th className="px-6 py-4 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {articles.map((article) => {
                  const isPublished = new Date(article.publishedAt) <= new Date();
                  return (
                    <tr key={article.id} className="hover:bg-navy-50/20 transition-colors">
                      <td className="px-6 py-4 font-bold text-navy-800 max-w-xs sm:max-w-md truncate">
                        <Link href={`/admin/articles/${article.id}`} className="hover:underline hover:text-orange-500">
                          {article.title}
                        </Link>
                        <div className="text-[11px] text-navy-450 font-semibold mt-1">Slug: /{article.slug}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-navy-700">
                        {articleCategoryLabel[article.category] || article.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-navy-600 font-medium">
                        {article.insurancePage?.name || "ความรู้ทั่วไป"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-navy-600 font-medium">
                        {formatThaiDate(article.publishedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            isPublished
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-100"
                              : "bg-yellow-50 text-yellow-800 border border-yellow-100"
                          }`}
                        >
                          {isPublished ? "เผยแพร่แล้ว" : "ตั้งเวลาเผยแพร่"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center gap-2">
                          <Link
                            href={`/admin/articles/${article.id}`}
                            className="rounded border border-navy-150 px-3 py-1.5 text-xs font-semibold text-navy-700 hover:bg-navy-50"
                          >
                            แก้ไข 📝
                          </Link>
                          <DeleteArticleButton articleId={article.id} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </Container>
  );
}
