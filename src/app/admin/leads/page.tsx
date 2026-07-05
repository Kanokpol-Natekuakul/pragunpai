import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { CsvExportButton } from "@/components/admin/CsvExportButton";
import { formatThaiDate, leadFormTypeLabel } from "@/lib/format";
import Link from "next/link";
import { LeadStatus, LeadFormType } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{
    search?: string;
    status?: string;
    formType?: string;
  }>;
};

const statusMap: Record<LeadStatus, { label: string; color: string }> = {
  NEW: {
    label: "ใหม่",
    color: "bg-orange-100 text-orange-800 border border-orange-200",
  },
  CONTACTED: {
    label: "ติดต่อแล้ว",
    color: "bg-blue-100 text-blue-800 border border-blue-200",
  },
  AWAITING_DOCS: {
    label: "รอเอกสารเพิ่มเติม",
    color: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  },
  QUOTED: {
    label: "เสนอราคาแล้ว",
    color: "bg-indigo-100 text-indigo-800 border border-indigo-200",
  },
  CLOSED: {
    label: "สำเร็จ (ปิดการขาย)",
    color: "bg-emerald-100 text-emerald-800 border border-emerald-200",
  },
  NOT_INTERESTED: {
    label: "ไม่สนใจ",
    color: "bg-gray-100 text-gray-700 border border-gray-200",
  },
  SPAM: {
    label: "สแปม/ข้อมูลเท็จ",
    color: "bg-red-100 text-red-800 border border-red-200",
  },
};

export default async function LeadsAdminPage({ searchParams }: PageProps) {
  // Check auth
  await requireAuth().catch(() => redirect("/admin/login"));

  const resolvedParams = await searchParams;
  const search = resolvedParams.search || "";
  const status = resolvedParams.status || "";
  const formType = resolvedParams.formType || "";

  // Build Prisma filter query
  const whereClause: import("@/generated/prisma/client").Prisma.LeadWhereInput =
    {};

  if (search) {
    whereClause.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { phone: { contains: search } },
      { lineId: { contains: search, mode: "insensitive" } },
      { province: { contains: search, mode: "insensitive" } },
    ];
  }

  if (status) {
    whereClause.status = status as LeadStatus;
  }

  if (formType) {
    whereClause.formType = formType as LeadFormType;
  }

  // Fetch leads
  const leads = await prisma.lead.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
  });

  return (
    <Container size="wide" className="py-4">
      {/* Header section */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-navy-800">
            จัดการข้อมูลลูกค้า (Leads)
          </h1>
          <p className="text-sm text-navy-500">
            ดูและอัปเดตสถานะผู้ติดต่อขอรับใบเสนอราคาประกันภัย
          </p>
        </div>
        <div>
          <CsvExportButton data={leads} />
        </div>
      </div>

      {/* Filters form */}
      <Card className="mb-6 p-4 bg-white border border-gray-200">
        <form method="GET" className="grid gap-4 sm:grid-cols-4 items-end">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-navy-600 uppercase mb-1">
              ค้นหาลูกค้า
            </label>
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="ค้นหาชื่อ, เบอร์โทร, LINE ID หรือจังหวัด..."
              className="w-full rounded-lg border border-navy-100 px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy-600 uppercase mb-1">
              ประเภทประกัน
            </label>
            <select
              name="formType"
              defaultValue={formType}
              className="w-full rounded-lg border border-navy-100 px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
            >
              <option value="">ทั้งหมด</option>
              <option value="CAR_ACT">พ.ร.บ. / ประกันรถ</option>
              <option value="ACCIDENT">ประกันอุบัติเหตุ</option>
              <option value="PROPERTY">ประกันบ้าน / คอนโด</option>
              <option value="OTHER">อื่นๆ / สอบถาม</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy-600 uppercase mb-1">
              สถานะดำเนินงาน
            </label>
            <select
              name="status"
              defaultValue={status}
              className="w-full rounded-lg border border-navy-100 px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
            >
              <option value="">ทั้งหมด</option>
              {Object.entries(statusMap).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-4 flex justify-end gap-2 mt-2">
            {(search || status || formType) && (
              <Link
                href="/admin/leads"
                className="rounded-lg border border-navy-100 px-4 py-2 text-sm text-navy-600 hover:bg-navy-50 font-medium"
              >
                ล้างตัวกรอง
              </Link>
            )}
            <button
              type="submit"
              className="rounded-lg bg-navy-600 px-6 py-2 text-sm text-white hover:bg-navy-700 font-semibold cursor-pointer"
            >
              ค้นหาข้อมูล
            </button>
          </div>
        </form>
      </Card>

      {/* Leads list table */}
      <Card className="overflow-hidden bg-white border border-gray-200">
        {leads.length === 0 ? (
          <p className="p-12 text-center text-sm text-navy-400 font-medium">
            ไม่พบข้อมูลลูกค้าที่ตรงตามเงื่อนไขการค้นหา
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-navy-900 text-white uppercase text-[11px] tracking-wider font-semibold border-b border-navy-950">
                <tr>
                  <th className="px-6 py-4">วันที่ส่งเรื่อง</th>
                  <th className="px-6 py-4">ชื่อผู้ติดต่อ</th>
                  <th className="px-6 py-4">เบอร์โทรศัพท์ / LINE</th>
                  <th className="px-6 py-4">ประเภทขอประกัน</th>
                  <th className="px-6 py-4">สถานะ</th>
                  <th className="px-6 py-4 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leads.map((lead) => {
                  const statusInfo = statusMap[lead.status] || {
                    label: lead.status,
                    color: "bg-gray-100 text-gray-800",
                  };
                  return (
                    <tr
                      key={lead.id}
                      className="hover:bg-navy-50/20 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-navy-600 font-medium">
                        {formatThaiDate(lead.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-navy-800">
                        {lead.name}
                        {lead.province && (
                          <span className="ml-2 rounded bg-navy-50 px-1.5 py-0.5 text-[10px] font-medium text-navy-600 border border-navy-100">
                            {lead.province}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-navy-800">
                          {lead.phone}
                        </div>
                        {lead.lineId && (
                          <div className="text-xs text-navy-500 flex items-center gap-1 mt-0.5">
                            <span className="text-[10px]">💬</span> LINE:{" "}
                            {lead.lineId}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-navy-700">
                        {leadFormTypeLabel[lead.formType] || lead.formType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusInfo.color}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <Link
                          href={`/admin/leads/${lead.id}`}
                          className="rounded-lg bg-orange-50 border border-orange-200 px-3 py-1.5 text-xs font-semibold text-orange-600 hover:bg-orange-100 hover:text-orange-700 transition-colors"
                        >
                          เปิดดูรายละเอียด →
                        </Link>
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
