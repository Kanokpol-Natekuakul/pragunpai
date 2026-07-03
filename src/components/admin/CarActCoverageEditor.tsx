"use client";

import { useState, useTransition } from "react";
import { updateSiteSettingAction } from "@/actions/settings";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export interface CoverageRow {
  item: string;
  amount: string;
}

interface CarActCoverageEditorProps {
  initialRows: CoverageRow[];
}

export function CarActCoverageEditor({ initialRows }: CarActCoverageEditorProps) {
  const [rows, setRows] = useState<CoverageRow[]>(
    initialRows.length > 0
      ? initialRows
      : [
          { item: "ค่ารักษาพยาบาล (ต่อคน)", amount: "สูงสุด 80,000 บาท" },
          { item: "ทุนประกันกรณีเสียชีวิต/สูญเสียอวัยวะ/ทุพพลภาพถาวร", amount: "สูงสุด 500,000 บาท" },
          { item: "ค่ารักษาพยาบาลในกรณีเจ็บป่วยที่ไม่ใช่อุบัติเหตุ", amount: "สูงสุด 200 บาท/วัน (จำกัด 20 วัน)" },
          { item: "ระยะเวลาคุ้มครอง", amount: "1 ปี" },
        ]
  );

  const [isPending, startTransition] = useTransition();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleFieldChange = (index: number, field: keyof CoverageRow, val: string) => {
    const updated = [...rows];
    updated[index] = { ...updated[index], [field]: val };
    setRows(updated);
  };

  const handleAddRow = () => {
    setRows([...rows, { item: "", amount: "" }]);
  };

  const handleRemoveRow = (index: number) => {
    const updated = rows.filter((_, i) => i !== index);
    setRows(updated);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...rows];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    setRows(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index === rows.length - 1) return;
    const updated = [...rows];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    setRows(updated);
  };

  const handleSave = () => {
    setSuccessMsg(null);
    startTransition(async () => {
      // Filter out empty rows
      const cleanRows = rows.filter((r) => r.item.trim() !== "" || r.amount.trim() !== "");
      
      const res = await updateSiteSettingAction("carActCoverage", cleanRows);
      if (res.success) {
        setSuccessMsg("บันทึกข้อมูลตารางความคุ้มครอง พ.ร.บ. สำเร็จแล้ว");
        setRows(cleanRows);
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        alert(res.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    });
  };

  return (
    <div className="space-y-6">
      {successMsg && (
        <div className="fixed bottom-6 right-6 z-50 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold px-4 py-3 shadow-lg">
          ✓ {successMsg}
        </div>
      )}

      <Card className="p-6 bg-white border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-4 mb-6 gap-2">
          <div>
            <h2 className="text-lg font-bold text-navy-800">📝 รายการตารางความคุ้มครอง พ.ร.บ.</h2>
            <p className="text-xs text-navy-500 font-medium mt-0.5">แก้ไขหัวข้อและจำนวนเงินคุ้มครองที่จะนำไปแสดงในหน้า /car-act</p>
          </div>
          <Button
            type="button"
            onClick={handleAddRow}
            variant="secondary"
            size="sm"
            className="self-start sm:self-auto cursor-pointer"
          >
            ➕ เพิ่มรายการใหม่
          </Button>
        </div>

        <div className="space-y-4">
          {rows.length === 0 ? (
            <div className="text-center py-8 text-navy-400 font-semibold border-2 border-dashed border-gray-200 rounded-xl">
              ไม่มีข้อมูลความคุ้มครอง กดปุ่มเพื่อเพิ่มรายการใหม่
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-sm">
                <thead>
                  <tr className="border-b border-gray-150 text-left text-navy-800 font-bold">
                    <th className="pb-3 w-12 text-center">ลำดับ</th>
                    <th className="pb-3 px-3">รายการคุ้มครอง</th>
                    <th className="pb-3 px-3">จำนวนเงิน</th>
                    <th className="pb-3 w-40 text-center">จัดการตำแหน่ง</th>
                    <th className="pb-3 w-20 text-center">ลบ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50">
                      <td className="py-3 text-center font-bold text-navy-500">{idx + 1}</td>
                      <td className="py-3 px-3">
                        <input
                          type="text"
                          value={row.item}
                          onChange={(e) => handleFieldChange(idx, "item", e.target.value)}
                          placeholder="เช่น ค่ารักษาพยาบาล (ต่อคน)"
                          className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400 font-medium text-navy-800"
                        />
                      </td>
                      <td className="py-3 px-3">
                        <input
                          type="text"
                          value={row.amount}
                          onChange={(e) => handleFieldChange(idx, "amount", e.target.value)}
                          placeholder="เช่น สูงสุด 80,000 บาท"
                          className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400 font-semibold text-navy-900"
                        />
                      </td>
                      <td className="py-3 text-center">
                        <div className="inline-flex rounded-lg border border-navy-200 bg-white">
                          <button
                            type="button"
                            onClick={() => handleMoveUp(idx)}
                            disabled={idx === 0}
                            className="px-3 py-1.5 text-xs font-bold text-navy-700 hover:bg-navy-50 disabled:opacity-30 border-r border-navy-150 transition-colors"
                            title="ย้ายขึ้น"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveDown(idx)}
                            disabled={idx === rows.length - 1}
                            className="px-3 py-1.5 text-xs font-bold text-navy-700 hover:bg-navy-50 disabled:opacity-30 transition-colors"
                            title="ย้ายลง"
                          >
                            ▼
                          </button>
                        </div>
                      </td>
                      <td className="py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(idx)}
                          className="rounded-lg p-2 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="ลบแถวนี้"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-8 pt-4 border-t border-gray-150">
          <Button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            variant="primary"
            className="px-8 cursor-pointer"
          >
            {isPending ? "กำลังบันทึก..." : "💾 บันทึกข้อมูลตาราง"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
