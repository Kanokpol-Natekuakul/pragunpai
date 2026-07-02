import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { leadFormTypeLabel } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function InsurancePagesAdminPage() {
  await requireAuth().catch(() => redirect("/admin/login"));

  const pages = await prisma.insurancePage.findMany({
    orderBy: { type: "asc" },
  });

  return (
    <Container size="wide" className="py-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy-800">จัดการหน้าแผนประกันภัย (Products)</h1>
        <p className="text-sm text-navy-500 font-medium mt-1">
          แก้ไขรายละเอียดความคุ้มครอง เบี้ยประกัน เงื่อนไข และตารางเปรียบเทียบสำหรับแต่ละประเภทประกัน
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {pages.map((page) => (
          <Card key={page.id} className="bg-white border border-gray-200 overflow-hidden flex flex-col justify-between">
            <div className="p-6">
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="rounded bg-navy-50 px-2 py-0.5 text-xs font-bold text-navy-600 border border-navy-100">
                  {leadFormTypeLabel[page.type] || page.type}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    page.published
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-100"
                      : "bg-gray-100 text-gray-700 border border-gray-200"
                  }`}
                >
                  {page.published ? "เผยแพร่แล้ว" : "ฉบับร่าง"}
                </span>
              </div>

              <h2 className="text-lg font-bold text-navy-800">{page.name}</h2>
              <p className="text-xs text-navy-450 mt-1 font-medium">Slug: /{page.slug}</p>
              <p className="mt-3 text-sm text-navy-600 line-clamp-3 leading-relaxed">
                {page.summary}
              </p>

              <div className="mt-4 border-t border-gray-100 pt-3">
                <span className="block text-xs font-bold text-navy-400">ค่าเบี้ยเริ่มต้น</span>
                <span className="text-base font-bold text-orange-500">{page.premium}</span>
              </div>
            </div>

            <div className="bg-gray-50 border-t border-gray-150 px-6 py-4 flex gap-2">
              <a
                href={`/admin/insurance-pages/${page.id}`}
                className="flex-1 text-center rounded-lg bg-navy-600 hover:bg-navy-700 text-white font-semibold py-2 text-xs transition-colors"
              >
                จัดการข้อมูล & แผน →
              </a>
              <a
                href={`/${page.slug}`}
                target="_blank"
                className="rounded-lg border border-navy-100 hover:bg-navy-100 bg-white text-navy-700 px-3 py-2 text-xs font-semibold transition-colors"
                title="เปิดดูหน้าเว็บจริง"
              >
                👁️
              </a>
            </div>
          </Card>
        ))}
      </div>
    </Container>
  );
}
