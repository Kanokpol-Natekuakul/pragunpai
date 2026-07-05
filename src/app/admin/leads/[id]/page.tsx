import { notFound, redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { LeadDetailEditor } from "@/components/admin/LeadDetailEditor";
import { formatThaiDate, leadFormTypeLabel } from "@/lib/format";
import { LeadStatus } from "@/generated/prisma/client";
import Link from "next/link";

interface LeadDetails {
  email?: string;
  carType?: string;
  carBrand?: string;
  carModel?: string;
  carYear?: string;
  carPlate?: string;
  age?: string;
  occupation?: string;
  hasExistingIllness?: string;
  illnessDetails?: string;
  selectedPlan?: string;
  propertyType?: string;
  constructionType?: string;
  floorsCount?: string;
  propertyValue?: string;
  securitySystems?: string[];
  requestType?: string;
  description?: string;
}

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

const statusLabels: Record<LeadStatus, { label: string; color: string }> = {
  NEW: {
    label: "ใหม่ (รอดำเนินการ)",
    color: "bg-orange-100 text-orange-850 border border-orange-200",
  },
  CONTACTED: {
    label: "ติดต่อแล้ว",
    color: "bg-blue-100 text-blue-850 border border-blue-200",
  },
  AWAITING_DOCS: {
    label: "รอเอกสารเพิ่มเติม",
    color: "bg-yellow-100 text-yellow-850 border border-yellow-200",
  },
  QUOTED: {
    label: "เสนอราคาแล้ว",
    color: "bg-indigo-100 text-indigo-850 border border-indigo-200",
  },
  CLOSED: {
    label: "สำเร็จ (ปิดการขาย)",
    color: "bg-emerald-100 text-emerald-850 border border-emerald-200",
  },
  NOT_INTERESTED: {
    label: "ไม่สนใจ",
    color: "bg-gray-100 text-gray-750 border border-gray-200",
  },
  SPAM: {
    label: "สแปม/ข้อมูลเท็จ",
    color: "bg-red-100 text-red-850 border border-red-200",
  },
};

export default async function LeadDetailPage({ params }: Props) {
  // Check auth
  await requireAuth().catch(() => redirect("/admin/login"));

  const { id } = await params;

  // Retrieve lead
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: { attachments: true },
  });

  if (!lead) {
    notFound();
  }

  const details = (lead.details as unknown as LeadDetails) || {};

  return (
    <Container size="wide" className="py-4">
      {/* Breadcrumbs / Back button */}
      <div className="mb-6">
        <Link
          href="/admin/leads"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-600 hover:text-navy-800"
        >
          ← ย้อนกลับไปหน้าจัดการ Lead
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Contact details */}
          <Card className="p-6 bg-white border border-gray-200">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
              <div>
                <span className="text-xs font-bold uppercase text-orange-500 tracking-wide">
                  ประเภท: {leadFormTypeLabel[lead.formType] || lead.formType}
                </span>
                <h1 className="text-xl font-bold text-navy-800 mt-1">
                  {lead.name}
                </h1>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${statusLabels[lead.status].color}`}
              >
                {statusLabels[lead.status].label}
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <span className="block text-xs font-bold text-navy-400 uppercase">
                  เบอร์โทรศัพท์
                </span>
                <a
                  href={`tel:${lead.phone}`}
                  className="text-base font-semibold text-navy-800 hover:text-orange-500 hover:underline"
                >
                  {lead.phone}
                </a>
              </div>

              <div>
                <span className="block text-xs font-bold text-navy-400 uppercase">
                  LINE ID
                </span>
                <span className="text-base font-semibold text-navy-800">
                  {lead.lineId ? (
                    <a
                      href={`https://line.me/ti/p/~${lead.lineId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-orange-500 hover:underline"
                    >
                      {lead.lineId} 🔗
                    </a>
                  ) : (
                    "-"
                  )}
                </span>
              </div>

              <div>
                <span className="block text-xs font-bold text-navy-400 uppercase">
                  จังหวัด
                </span>
                <span className="text-base font-semibold text-navy-800">
                  {lead.province || "-"}
                </span>
              </div>

              <div>
                <span className="block text-xs font-bold text-navy-400 uppercase">
                  อีเมล
                </span>
                <span className="text-base font-semibold text-navy-800">
                  {details.email || "-"}
                </span>
              </div>

              <div>
                <span className="block text-xs font-bold text-navy-400 uppercase">
                  วันที่ส่งข้อมูล
                </span>
                <span className="text-sm font-semibold text-navy-700">
                  {formatThaiDate(lead.createdAt)}
                </span>
              </div>

              <div>
                <span className="block text-xs font-bold text-navy-400 uppercase">
                  วันล้างข้อมูลตาม PDPA
                </span>
                <span className="text-sm font-semibold text-navy-700">
                  {formatThaiDate(lead.expiresAt)}
                </span>
              </div>
            </div>
          </Card>

          {/* Card 2: Specific Insurance details */}
          <Card className="p-6 bg-white border border-gray-200">
            <h2 className="text-base font-bold text-navy-800 border-b border-gray-100 pb-3 mb-4">
              รายละเอียดความคุ้มครองที่แจ้งเรื่อง
            </h2>

            {lead.formType === "CAR_ACT" && (
              <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
                <div>
                  <span className="block text-xs text-navy-400">
                    ประเภทรถยนต์
                  </span>
                  <span className="font-semibold text-navy-800">
                    {details.carType || "-"}
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-navy-400">
                    ยี่ห้อรถยนต์
                  </span>
                  <span className="font-semibold text-navy-800">
                    {details.carBrand || "-"}
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-navy-400">
                    รุ่นรถยนต์
                  </span>
                  <span className="font-semibold text-navy-800">
                    {details.carModel || "-"}
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-navy-400">
                    ปีจดทะเบียน
                  </span>
                  <span className="font-semibold text-navy-800">
                    {details.carYear || "-"}
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <span className="block text-xs text-navy-400">
                    ป้ายทะเบียน
                  </span>
                  <span className="font-semibold text-navy-800">
                    {details.carPlate || "-"}
                  </span>
                </div>
              </div>
            )}

            {lead.formType === "ACCIDENT" && (
              <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
                <div>
                  <span className="block text-xs text-navy-400">
                    อายุผู้ประกัน
                  </span>
                  <span className="font-semibold text-navy-800">
                    {details.age || "-"} ปี
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-navy-400">อาชีพหลัก</span>
                  <span className="font-semibold text-navy-800">
                    {details.occupation || "-"}
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <span className="block text-xs text-navy-400">
                    ประวัติการเจ็บป่วย/โรคประจำตัว
                  </span>
                  <span className="font-semibold text-navy-800">
                    {details.hasExistingIllness || "-"}
                  </span>
                </div>
                {details.illnessDetails && (
                  <div className="sm:col-span-2">
                    <span className="block text-xs text-navy-400">
                      รายละเอียดโรคประจำตัว
                    </span>
                    <span className="font-semibold text-navy-850 block bg-gray-50 border rounded-lg p-2.5 mt-1">
                      {details.illnessDetails}
                    </span>
                  </div>
                )}
                <div className="sm:col-span-2">
                  <span className="block text-xs text-navy-400">
                    แผนประกันที่สนใจ
                  </span>
                  <span className="font-semibold text-navy-800">
                    {details.selectedPlan || "แนะนำแผนที่เหมาะสม"}
                  </span>
                </div>
              </div>
            )}

            {lead.formType === "PROPERTY" && (
              <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
                <div>
                  <span className="block text-xs text-navy-400">
                    ประเภทสิ่งปลูกสร้าง
                  </span>
                  <span className="font-semibold text-navy-800">
                    {details.propertyType || "-"}
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-navy-400">
                    ลักษณะโครงสร้าง
                  </span>
                  <span className="font-semibold text-navy-800">
                    {details.constructionType || "-"}
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-navy-400">จำนวนชั้น</span>
                  <span className="font-semibold text-navy-800">
                    {details.floorsCount || "-"} ชั้น
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-navy-400">
                    มูลค่าทรัพย์สิน / ทุนเอาประกัน
                  </span>
                  <span className="font-semibold text-navy-800">
                    {details.propertyValue || "-"} บาท
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <span className="block text-xs text-navy-400">
                    ระบบความปลอดภัยที่มี
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {details.securitySystems &&
                    details.securitySystems.length > 0 ? (
                      details.securitySystems.map(
                        (sys: string, idx: number) => (
                          <span
                            key={idx}
                            className="rounded bg-orange-50 px-2 py-0.5 text-xs font-semibold text-orange-600 border border-orange-100"
                          >
                            🛡️ {sys}
                          </span>
                        )
                      )
                    ) : (
                      <span className="text-sm font-semibold text-navy-500">
                        ไม่มี
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {lead.formType === "OTHER" && (
              <div className="space-y-3">
                <div>
                  <span className="block text-xs text-navy-400">
                    เรื่องที่สนใจเอาประกัน
                  </span>
                  <span className="font-semibold text-navy-800">
                    {details.requestType || "-"}
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-navy-400">
                    รายละเอียดคำถาม/ความต้องการเพิ่มเติม
                  </span>
                  <span className="font-semibold text-navy-850 block bg-gray-50 border rounded-lg p-3 mt-1.5 whitespace-pre-wrap leading-relaxed">
                    {details.description || "-"}
                  </span>
                </div>
              </div>
            )}

            {lead.notes && (
              <div className="mt-6 border-t border-gray-100 pt-4">
                <span className="block text-xs text-navy-400">
                  ข้อความช่วยจำเพิ่มเติมจากระบบฟอร์ม
                </span>
                <p className="mt-1 text-sm font-semibold text-navy-700">
                  {lead.notes}
                </p>
              </div>
            )}
          </Card>

          {/* Card 3: File attachments */}
          <Card className="p-6 bg-white border border-gray-200">
            <h2 className="text-base font-bold text-navy-800 border-b border-gray-100 pb-3 mb-4 flex items-center justify-between">
              <span>ไฟล์เอกสารแนบประกอบ</span>
              <span className="rounded bg-navy-50 px-2 py-0.5 text-xs font-semibold text-navy-600">
                {lead.attachments.length} ไฟล์
              </span>
            </h2>

            {lead.attachments.length === 0 ? (
              <p className="py-4 text-sm text-navy-400 font-medium">
                ไม่มีไฟล์เอกสารแนบประกอบสำหรับ Lead รายการนี้
              </p>
            ) : (
              <div className="divide-y divide-gray-100 border rounded-lg overflow-hidden bg-white">
                {lead.attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between p-4 hover:bg-navy-50/20 transition-colors"
                  >
                    <div className="flex items-center gap-2 overflow-hidden mr-4">
                      <span className="text-2xl">📄</span>
                      <div>
                        <span className="block font-bold text-navy-800 truncate">
                          {att.filename}
                        </span>
                        <span className="block text-[10px] text-navy-450 uppercase font-semibold">
                          {(att.size / 1024 / 1024).toFixed(2)} MB •{" "}
                          {att.mimeType.split("/")[1] || att.mimeType}
                        </span>
                      </div>
                    </div>
                    <a
                      href={att.url}
                      download={att.filename}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-navy-200 px-3.5 py-1.5 text-xs font-semibold text-navy-700 hover:bg-navy-50 hover:text-navy-900 transition-all cursor-pointer whitespace-nowrap"
                    >
                      ดาวน์โหลด 💾
                    </a>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Lead Action panel */}
        <div>
          <Card className="p-6 bg-white border border-gray-200 sticky top-4">
            <h2 className="text-base font-bold text-navy-800 border-b border-gray-100 pb-3 mb-6">
              สถานะดำเนินงานภายใน
            </h2>

            <LeadDetailEditor
              leadId={lead.id}
              currentStatus={lead.status}
              currentNotes={lead.notes}
            />

            {/* Email send report */}
            <div className="mt-6 border-t border-gray-100 pt-4 text-xs">
              <span className="block font-bold text-navy-400 uppercase mb-1">
                รายงานการส่งเมลแจ้งเตือน
              </span>
              <div className="flex items-center gap-1.5 font-semibold">
                {lead.emailSent ? (
                  <span className="text-emerald-600">
                    ✓ จัดส่งอีเมลไปยังทีมงานเรียบร้อยแล้ว
                  </span>
                ) : (
                  <span className="text-red-500">
                    ⚠️ เกิดข้อผิดพลาด:{" "}
                    {lead.emailError || "ไม่ได้จัดส่งอีเมลแจ้งเตือน"}
                  </span>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Container>
  );
}
