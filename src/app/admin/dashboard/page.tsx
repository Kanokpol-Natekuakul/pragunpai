import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { prisma } from "@/lib/prisma";
import { formatThaiDate } from "@/lib/format";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await requireAuth().catch(() => redirect("/admin/login"));

  // Fetch summary stats for the dashboard.
  const [newLeads, totalLeads, articles, insurancePages, recentLeads] =
    await Promise.all([
      prisma.lead.count({ where: { status: "NEW" } }),
      prisma.lead.count(),
      prisma.article.count(),
      prisma.insurancePage.count(),
      prisma.lead.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { attachments: true },
      }),
    ]);

  const stats = [
    { label: "Lead ใหม่", value: newLeads, tone: "text-orange-500" },
    { label: "Lead ทั้งหมด", value: totalLeads, tone: "text-navy-600" },
    { label: "บทความ", value: articles, tone: "text-navy-600" },
    { label: "หน้าแผนประกัน", value: insurancePages, tone: "text-navy-600" },
  ];

  return (
    <Container size="wide" className="py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-800">แดชบอร์ด</h1>
        <p className="text-sm text-navy-500">สวัสดี, {session.name}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-5">
            <p className="text-sm text-navy-500">{s.label}</p>
            <p className={`mt-1 text-3xl font-bold ${s.tone}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Recent leads */}
      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-navy-800">Lead ล่าสุด</h2>
          <Link
            href="/admin/leads"
            className="text-sm text-navy-600 hover:text-navy-800"
          >
            ดูทั้งหมด →
          </Link>
        </div>
        <Card className="overflow-hidden">
          {recentLeads.length === 0 ? (
            <p className="p-6 text-center text-sm text-navy-400">
              ยังไม่มี Lead ในระบบ
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-navy-600">
                <tr>
                  <th className="px-4 py-3 font-medium">วันที่</th>
                  <th className="px-4 py-3 font-medium">ชื่อ</th>
                  <th className="px-4 py-3 font-medium">ประเภท</th>
                  <th className="px-4 py-3 font-medium">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-navy-600">
                      {formatThaiDate(lead.createdAt)}
                    </td>
                    <td className="px-4 py-3 font-medium text-navy-800">
                      <Link
                        href={`/admin/leads/${lead.id}`}
                        className="hover:underline"
                      >
                        {lead.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-navy-600">{lead.formType}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                        {lead.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </Container>
  );
}
