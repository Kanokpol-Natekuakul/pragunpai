"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateLeadAction, deleteLeadAction } from "@/actions/leads";
import { LeadStatus } from "@/generated/prisma/client";
import { Button } from "@/components/ui/Button";

interface LeadDetailEditorProps {
  leadId: string;
  currentStatus: LeadStatus;
  currentNotes: string | null;
}

const statusMap: Record<LeadStatus, string> = {
  NEW: "ใหม่ (รอดำเนินการ)",
  CONTACTED: "ติดต่อลูกค้าแล้ว",
  AWAITING_DOCS: "รอเอกสารเพิ่มเติม",
  QUOTED: "เสนอราคาแล้ว",
  CLOSED: "สำเร็จ (ปิดการขาย)",
  NOT_INTERESTED: "ไม่สนใจ / ปฏิเสธ",
  SPAM: "สแปม / ข้อมูลเท็จ",
};

export function LeadDetailEditor({
  leadId,
  currentStatus,
  currentNotes,
}: LeadDetailEditorProps) {
  const [status, setStatus] = useState<LeadStatus>(currentStatus);
  const [notes, setNotes] = useState<string>(currentNotes || "");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const router = useRouter();

  const handleSave = () => {
    setMessage(null);
    startTransition(async () => {
      const res = await updateLeadAction(leadId, status, notes || null);
      if (res.success) {
        setMessage({ text: "บันทึกการเปลี่ยนแปลงสำเร็จแล้ว", type: "success" });
        router.refresh();
      } else {
        setMessage({
          text: res.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
          type: "error",
        });
      }
    });
  };

  const handleDelete = () => {
    if (
      !confirm(
        "คุณแน่ใจหรือไม่ว่าต้องการลบ Lead รายการนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้"
      )
    ) {
      return;
    }

    startTransition(async () => {
      const res = await deleteLeadAction(leadId);
      if (res.success) {
        alert("ลบ Lead สำเร็จแล้ว");
        router.push("/admin/leads");
      } else {
        setMessage({
          text: res.error || "เกิดข้อผิดพลาดในการลบข้อมูล",
          type: "error",
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`rounded-lg p-3 text-sm font-semibold border ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Update Status */}
      <div>
        <label className="block text-sm font-bold text-navy-800 mb-2">
          อัปเดตสถานะการดำเนินงาน
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as LeadStatus)}
          className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400 bg-white font-medium text-navy-700"
        >
          {Object.entries(statusMap).map(([key, value]) => (
            <option key={key} value={key}>
              {value}
            </option>
          ))}
        </select>
      </div>

      {/* Admin Notes */}
      <div>
        <label className="block text-sm font-bold text-navy-800 mb-2">
          บันทึกช่วยจำสำหรับแอดมิน (Notes)
        </label>
        <textarea
          rows={5}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="กรอกบันทึกข้อความภายในที่นี่ เช่น 'โทรคุยแล้ว ลูกค้าสะดวกคุยอีกทีวันศุกร์นี้เพื่อรับใบเสนอราคา' หรือบันทึกความคืบหน้า..."
          className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
        />
      </div>

      {/* Control Buttons */}
      <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
        <Button
          onClick={handleSave}
          disabled={isPending}
          variant="primary"
          className="w-full flex justify-center items-center gap-2 cursor-pointer"
        >
          {isPending ? "กำลังดำเนินการ..." : "บันทึกการเปลี่ยนแปลง"}
        </Button>

        <button
          onClick={handleDelete}
          disabled={isPending}
          type="button"
          className="w-full rounded-lg border border-red-200 text-red-600 px-4 py-2.5 text-sm font-semibold hover:bg-red-50 hover:text-red-700 transition-colors disabled:opacity-50 cursor-pointer"
        >
          ลบข้อมูลผู้ติดต่อนะรายการนี้
        </button>
      </div>
    </div>
  );
}
