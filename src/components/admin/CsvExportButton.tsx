"use client";

import { Button } from "@/components/ui/Button";

interface CsvExportButtonProps {
  data: Array<{
    id: string;
    formType: string;
    status: string;
    name: string;
    phone: string;
    lineId: string | null;
    province: string | null;
    createdAt: Date | string;
    notes: string | null;
    emailSent: boolean;
    details: import("@/generated/prisma/client").Prisma.JsonValue;
  }>;
}

export function CsvExportButton({ data }: CsvExportButtonProps) {
  const exportToCsv = () => {
    if (data.length === 0) {
      alert("ไม่มีข้อมูลที่จะส่งออก");
      return;
    }

    // CSV Headers
    const headers = [
      "ID",
      "ประเภทฟอร์ม",
      "สถานะ",
      "ชื่อลูกค้า",
      "เบอร์โทรศัพท์",
      "LINE ID",
      "จังหวัด",
      "วันที่ส่งเรื่อง",
      "หมายเหตุ",
      "ส่งอีเมลแจ้งแล้ว",
      "รายละเอียดเพิ่มเติม",
    ];

    // Map rows
    const rows = data.map((lead) => {
      // Clean details JSON for readable single column text or key-value list
      let detailsStr = "";
      if (
        lead.details &&
        typeof lead.details === "object" &&
        !Array.isArray(lead.details)
      ) {
        detailsStr = Object.entries(lead.details as Record<string, unknown>)
          .map(([k, v]) => `${k}: ${v}`)
          .join(" | ");
      }

      return [
        lead.id,
        lead.formType,
        lead.status,
        lead.name,
        lead.phone,
        lead.lineId || "",
        lead.province || "",
        new Date(lead.createdAt).toLocaleString("th-TH"),
        lead.notes || "",
        lead.emailSent ? "ใช่" : "ไม่ใช่",
        detailsStr,
      ];
    });

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((value) => {
            // Escape double quotes and wrap in quotes if contains commas or newlines
            const valStr = String(value).replace(/"/g, '""');
            return valStr.includes(",") ||
              valStr.includes("\n") ||
              valStr.includes('"')
              ? `"${valStr}"`
              : valStr;
          })
          .join(",")
      ),
    ].join("\n");

    // Add UTF-8 BOM so Excel displays Thai characters correctly
    const blob = new Blob(["\ufeff" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);

    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute("download", `pragunpai_leads_${dateStr}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button
      onClick={exportToCsv}
      variant="secondary"
      type="button"
      className="inline-flex items-center gap-1.5 cursor-pointer"
    >
      <span>📥</span> ส่งออกข้อมูล (CSV)
    </Button>
  );
}
