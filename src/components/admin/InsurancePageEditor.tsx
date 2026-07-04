"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateInsurancePageAction } from "@/actions/insurance-pages";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

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
        planValues: import("@/generated/prisma/client").Prisma.JsonValue;
        order: number;
      }>;
    } | null;
  };
}

export function InsurancePageEditor({ page }: InsurancePageEditorProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const router = useRouter();

  // ---------------------------------------------------------------------------
  // Page Content Form State
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

  return (
    <div className="space-y-6">

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

      {/* Web Page Content Form */}
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
    </div>
  );
}
