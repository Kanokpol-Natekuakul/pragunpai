"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateInsurancePageAction, updateComparisonTableAction } from "@/actions/insurance-pages";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface PlanRowData {
  id: string;
  coverageItem: string;
  values: Record<string, string>;
}

interface InsurancePageEditorProps {
  page: {
    id: string;
    slug: string;
    name: string;
    summary: string;
    coverage: string;
    premium: string;
    conditions: string | null;
    pdfUrl: string | null;
    seoTitle: string | null;
    metaDescription: string | null;
    keywords: string | null;
    published: boolean;
    comparisonTable: {
      id: string;
      rows: Array<{
        id: string;
        coverageItem: string;
        planValues: Record<string, string>;
        order: number;
      }>;
    } | null;
  };
}

export function InsurancePageEditor({ page }: InsurancePageEditorProps) {
  const [activeTab, setActiveTab] = useState<"content" | "comparison">("content");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const router = useRouter();

  // ---------------------------------------------------------------------------
  // Tab 1: Page Content Form State
  // ---------------------------------------------------------------------------
  const [name, setName] = useState(page.name);
  const [summary, setSummary] = useState(page.summary);
  const [premium, setPremium] = useState(page.premium);
  const [published, setPublished] = useState(page.published);
  const [coverage, setCoverage] = useState(page.coverage);
  const [conditions, setConditions] = useState(page.conditions || "");
  const [pdfUrl, setPdfUrl] = useState(page.pdfUrl || "");
  const [seoTitle, setSeoTitle] = useState(page.seoTitle || "");
  const [metaDescription, setMetaDescription] = useState(page.metaDescription || "");
  const [keywords, setKeywords] = useState(page.keywords || "");

  const handleSaveContent = () => {
    setMessage(null);
    startTransition(async () => {
      const res = await updateInsurancePageAction(page.id, {
        name,
        summary,
        premium,
        published,
        coverage,
        conditions: conditions || null,
        pdfUrl: pdfUrl || null,
        seoTitle: seoTitle || null,
        metaDescription: metaDescription || null,
        keywords: keywords || null,
      });

      if (res.success) {
        setMessage({ text: "บันทึกข้อมูลหน้าเว็บสำเร็จแล้ว", type: "success" });
        router.refresh();
      } else {
        setMessage({ text: res.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล", type: "error" });
      }
    });
  };

  // ---------------------------------------------------------------------------
  // Tab 2: Comparison Table State Builder
  // ---------------------------------------------------------------------------
  // Recover columns from first row if exists, else default to standard columns
  const getInitialColumns = (): string[] => {
    const firstRow = page.comparisonTable?.rows[0];
    if (firstRow && firstRow.planValues) {
      return Object.keys(firstRow.planValues);
    }
    return ["แผนเริ่มต้น", "แผนแนะนำ", "แผนสูงสุด"];
  };

  const [columns, setColumns] = useState<string[]>(getInitialColumns());
  const [newColumnName, setNewColumnName] = useState("");

  const getInitialRows = (): PlanRowData[] => {
    const dbRows = page.comparisonTable?.rows || [];
    if (dbRows.length > 0) {
      return dbRows.map((r) => ({
        id: r.id,
        coverageItem: r.coverageItem,
        values: (r.planValues as Record<string, string>) || {},
      }));
    }
    // Default initial rows if table is empty
    return [
      { id: "row-1", coverageItem: "ทุนประกันภัยความคุ้มครอง", values: {} },
      { id: "row-2", coverageItem: "ค่ารักษาพยาบาลต่ออุบัติเหตุ", values: {} },
    ];
  };

  const [rows, setRows] = useState<PlanRowData[]>(getInitialRows());

  // Add column
  const handleAddColumn = () => {
    const nameTrimmed = newColumnName.trim();
    if (!nameTrimmed) return;
    if (columns.includes(nameTrimmed)) {
      alert("มีคอลัมน์ชื่อนี้อยู่แล้ว");
      return;
    }
    setColumns([...columns, nameTrimmed]);
    setNewColumnName("");
  };

  // Remove column
  const handleRemoveColumn = (colName: string) => {
    if (!confirm(`คุณแน่ใจว่าต้องการลบคอลัมน์ "${colName}"? ข้อมูลในแถวของแผนนี้จะถูกลบออกทั้งหมด`)) {
      return;
    }
    setColumns(columns.filter((c) => c !== colName));
    setRows(
      rows.map((row) => {
        const nextValues = { ...row.values };
        delete nextValues[colName];
        return { ...row, values: nextValues };
      })
    );
  };

  // Add Row
  const handleAddRow = () => {
    const newId = `row-${Date.now()}`;
    setRows([...rows, { id: newId, coverageItem: "รายการความคุ้มครองใหม่", values: {} }]);
  };

  // Remove Row
  const handleRemoveRow = (id: string) => {
    setRows(rows.filter((r) => r.id !== id));
  };

  // Update Coverage Item Name in Row
  const handleRowItemChange = (id: string, text: string) => {
    setRows(rows.map((r) => (r.id === id ? { ...r, coverageItem: text } : r)));
  };

  // Update Plan Value in Row
  const handleRowValueChange = (rowId: string, colName: string, text: string) => {
    setRows(
      rows.map((r) => {
        if (r.id === rowId) {
          return {
            ...r,
            values: { ...r.values, [colName]: text },
          };
        }
        return r;
      })
    );
  };

  // Reorder Row Up
  const moveRowUp = (idx: number) => {
    if (idx === 0) return;
    const nextRows = [...rows];
    const temp = nextRows[idx];
    nextRows[idx] = nextRows[idx - 1];
    nextRows[idx - 1] = temp;
    setRows(nextRows);
  };

  // Reorder Row Down
  const moveRowDown = (idx: number) => {
    if (idx === rows.length - 1) return;
    const nextRows = [...rows];
    const temp = nextRows[idx];
    nextRows[idx] = nextRows[idx + 1];
    nextRows[idx + 1] = temp;
    setRows(nextRows);
  };

  const handleSaveComparison = () => {
    setMessage(null);
    startTransition(async () => {
      // Structure rows for DB insertion
      const formattedRows = rows.map((row, idx) => {
        const planValues: Record<string, string> = {};
        columns.forEach((col) => {
          planValues[col] = row.values[col] || "-";
        });

        return {
          coverageItem: row.coverageItem,
          planValues,
          order: idx,
        };
      });

      const res = await updateComparisonTableAction(page.id, formattedRows);
      if (res.success) {
        setMessage({ text: "บันทึกตารางเปรียบเทียบแผนสำเร็จแล้ว", type: "success" });
        router.refresh();
      } else {
        setMessage({ text: res.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล", type: "error" });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Subheader tab control */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => {
            setActiveTab("content");
            setMessage(null);
          }}
          className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 hover:text-navy-700 cursor-pointer ${
            activeTab === "content"
              ? "border-orange-500 text-orange-600"
              : "border-transparent text-navy-500"
          }`}
        >
          📝 แก้ไขเนื้อหาหน้าเว็บ
        </button>
        <button
          onClick={() => {
            setActiveTab("comparison");
            setMessage(null);
          }}
          className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 hover:text-navy-700 cursor-pointer ${
            activeTab === "comparison"
              ? "border-orange-500 text-orange-600"
              : "border-transparent text-navy-500"
          }`}
        >
          📊 จัดการตารางเปรียบเทียบแผน
        </button>
      </div>

      {message && (
        <div
          className={`rounded-lg p-4 text-sm font-semibold border ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Tab 1: Web Page Content Form */}
      {activeTab === "content" && (
        <Card className="p-6 bg-white border border-gray-200 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-bold text-navy-800 mb-1">
                ชื่อประกันภัย <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400 font-semibold text-navy-800"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-navy-800 mb-1">
                เบี้ยประกันเริ่มต้น (แสดงหน้าบัตร) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={premium}
                onChange={(e) => setPremium(e.target.value)}
                placeholder="เช่น เริ่มต้น 645 บาท/ปี"
                className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400 font-semibold text-navy-800"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-bold text-navy-800 mb-1">
                คำโปรยสรุปย่อ (Summary) <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={2}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-bold text-navy-800 mb-1">
                รายละเอียดหลักประกัน / ความคุ้มครอง (Markdown/Text) <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={10}
                value={coverage}
                onChange={(e) => setCoverage(e.target.value)}
                placeholder="กรอกรายละเอียดความคุ้มครองหลักของประกันนี้..."
                className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm font-mono focus:outline-none focus:border-orange-400"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-navy-800 mb-1">
                เงื่อนไขการรับประกันภัย (Markdown/Text)
              </label>
              <textarea
                rows={10}
                value={conditions}
                onChange={(e) => setConditions(e.target.value)}
                placeholder="กรอกรายละเอียดเงื่อนไข เช่น อายุผู้สมัคร, อาชีพที่ไม่รับประกัน..."
                className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm font-mono focus:outline-none focus:border-orange-400"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 border-t border-gray-100 pt-6">
            <div>
              <label className="block text-sm font-bold text-navy-800 mb-1">
                ลิงก์ไฟล์โบร์ชัวร์ PDF (Brochure URL)
              </label>
              <input
                type="text"
                value={pdfUrl}
                onChange={(e) => setPdfUrl(e.target.value)}
                placeholder="เช่น /pdfs/brochure-car-act.pdf"
                className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-navy-800 mb-1">
                สถานะการเผยแพร่
              </label>
              <div className="mt-2.5">
                <label className="inline-flex items-center gap-2 cursor-pointer font-semibold text-navy-700 text-sm">
                  <input
                    type="checkbox"
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                    className="accent-orange-500 rounded focus:ring-0 focus:ring-offset-0 h-4 w-4"
                  />
                  <span>เปิดใช้งานและเผยแพร่หน้านี้ลงสู่เว็บไซต์หลัก</span>
                </label>
              </div>
            </div>
          </div>

          {/* SEO Settings */}
          <div className="border-t border-gray-100 pt-6 space-y-4">
            <h3 className="text-sm font-bold text-orange-500 uppercase tracking-wide">
              ตั้งค่า SEO ของหน้าผลิตภัณฑ์นี้
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-navy-850 mb-1">
                  SEO Title (ชื่อเรื่องแสดงใน Google Search)
                </label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="หากปล่อยว่าง ระบบจะใช้ชื่อประกันแทน"
                  className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy-850 mb-1">
                  Keywords (คีย์เวิร์ดคั่นด้วยจุลภาค)
                </label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="เช่น พรบรถยนต์, ต่อพรบ, ราคาพรบ"
                  className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-navy-850 mb-1">
                  Meta Description (คำอธิบายสั้นๆ ของหน้านี้)
                </label>
                <input
                  type="text"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="กรอกข้อความดึงดูดความสนใจยาวประมาณ 120-160 ตัวอักษร"
                  className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6 flex justify-end">
            <Button
              onClick={handleSaveContent}
              disabled={isPending}
              variant="primary"
              className="px-8 cursor-pointer"
            >
              {isPending ? "กำลังบันทึก..." : "บันทึกเนื้อหาหน้าเว็บ"}
            </Button>
          </div>
        </Card>
      )}

      {/* Tab 2: Comparison Table Builder */}
      {activeTab === "comparison" && (
        <Card className="p-6 bg-white border border-gray-200 space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end justify-between border-b border-gray-100 pb-5">
            <div>
              <h3 className="text-base font-bold text-navy-800">ตัวจัดการคอลัมน์ (แผนประกันภัย)</h3>
              <p className="text-xs text-navy-450 mt-1 font-medium">
                เพิ่มแผนประกันต่างๆ เพื่อเป็นตัวเลือกในการทำตารางเปรียบเทียบ
              </p>
            </div>
            
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                placeholder="เช่น แผน Gold, แผน Platinum"
                className="rounded-lg border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400 font-medium"
              />
              <button
                type="button"
                onClick={handleAddColumn}
                className="rounded-lg bg-orange-500 hover:bg-orange-600 px-4 py-2 text-sm font-semibold text-white cursor-pointer"
              >
                เพิ่มแผน +
              </button>
            </div>
          </div>

          {/* Column tags display */}
          <div className="flex flex-wrap gap-2">
            {columns.map((col) => (
              <span
                key={col}
                className="inline-flex items-center gap-1.5 rounded-full bg-navy-50 border border-navy-100 pl-3.5 pr-2 py-1 text-xs font-bold text-navy-800"
              >
                <span>{col}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveColumn(col)}
                  className="rounded-full bg-navy-200 text-navy-600 hover:bg-red-500 hover:text-white h-4 w-4 inline-flex items-center justify-center font-bold text-[9px] cursor-pointer"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>

          {/* Rows Builder Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h3 className="text-base font-bold text-navy-800">รายการคุ้มครองและความคุ้มค่า</h3>
              <button
                type="button"
                onClick={handleAddRow}
                className="rounded-lg border border-navy-100 hover:bg-navy-50 px-3 py-1.5 text-xs font-bold text-navy-600 cursor-pointer"
              >
                เพิ่มแถว/ความคุ้มครองใหม่ +
              </button>
            </div>

            {rows.length === 0 ? (
              <p className="p-8 text-center text-sm text-navy-450 font-semibold bg-gray-50 border border-dashed rounded-lg">
                ยังไม่มีข้อมูลรายละเอียดตารางเปรียบเทียบแผน
              </p>
            ) : (
              <div className="space-y-3">
                {rows.map((row, idx) => (
                  <div
                    key={row.id}
                    className="flex flex-col md:flex-row gap-3 items-start border border-gray-250 bg-gray-50/50 p-4 rounded-xl relative"
                  >
                    {/* Row Item Name */}
                    <div className="w-full md:w-1/3">
                      <label className="block text-[10px] uppercase font-bold text-navy-400 mb-1">
                        หัวข้อความคุ้มครอง
                      </label>
                      <input
                        type="text"
                        value={row.coverageItem}
                        onChange={(e) => handleRowItemChange(row.id, e.target.value)}
                        className="w-full rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm font-semibold text-navy-800 focus:outline-none focus:border-orange-400"
                      />
                    </div>

                    {/* Plan Values inside Grid */}
                    <div className="w-full md:flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {columns.map((col) => (
                        <div key={col}>
                          <label className="block text-[10px] uppercase font-bold text-navy-450 truncate mb-1">
                            {col}
                          </label>
                          <input
                            type="text"
                            value={row.values[col] || ""}
                            onChange={(e) => handleRowValueChange(row.id, col, e.target.value)}
                            placeholder="เช่น 100,000 หรือ คุ้มครอง"
                            className="w-full rounded-lg border border-navy-200 bg-white px-3 py-1.5 text-xs font-semibold text-navy-800 focus:outline-none focus:border-orange-400"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Row Operations */}
                    <div className="flex gap-1.5 self-end md:self-center mt-3 md:mt-0">
                      <button
                        type="button"
                        onClick={() => moveRowUp(idx)}
                        disabled={idx === 0}
                        className="rounded border border-gray-200 hover:bg-gray-150 h-7 w-7 inline-flex items-center justify-center disabled:opacity-30 cursor-pointer"
                        title="เลื่อนขึ้น"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => moveRowDown(idx)}
                        disabled={idx === rows.length - 1}
                        className="rounded border border-gray-200 hover:bg-gray-150 h-7 w-7 inline-flex items-center justify-center disabled:opacity-30 cursor-pointer"
                        title="เลื่อนลง"
                      >
                        ▼
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(row.id)}
                        className="rounded border border-red-200 hover:bg-red-50 text-red-500 h-7 w-7 inline-flex items-center justify-center cursor-pointer font-bold"
                        title="ลบแถว"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 pt-6 flex justify-end">
            <Button
              onClick={handleSaveComparison}
              disabled={isPending}
              variant="primary"
              className="px-8 cursor-pointer"
            >
              {isPending ? "กำลังบันทึก..." : "บันทึกตารางเปรียบเทียบ"}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
