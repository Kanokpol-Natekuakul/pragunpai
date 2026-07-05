"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateInsurancePageAction } from "@/actions/insurance-pages";
import { uploadPdfAction } from "@/actions/uploads";
import { validateUpload, PDF_MIME_TYPES } from "@/lib/upload-constraints";
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
  const [seoTitle, setSeoTitle] = useState(page.seoTitle || "");
  const [metaDescription, setMetaDescription] = useState(page.metaDescription || "");
  const [keywords, setKeywords] = useState(page.keywords || "");

  interface BrochureItem {
    name: string;
    url: string;
  }

  // Parse existing pdfUrl (could be JSON array or a plain URL string)
  const parseInitialPdfUrl = (urlStr: string | null): BrochureItem[] => {
    if (!urlStr) return [];
    try {
      if (urlStr.trim().startsWith("[")) {
        const parsed = JSON.parse(urlStr);
        if (Array.isArray(parsed)) {
          return parsed.map(item => ({
            name: item.name || "ดาวน์โหลดโบรชัวร์",
            url: item.url || ""
          }));
        }
      }
    } catch (e) {
      console.warn("Failed to parse pdfUrl JSON:", e);
    }
    return [{ name: "ดาวน์โหลดโบรชัวร์", url: urlStr }];
  };

  const [brochures, setBrochures] = useState<BrochureItem[]>(parseInitialPdfUrl(page.pdfUrl));
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const handleUploadFile = async (idx: number, file: File) => {
    if (!file) return;
    const validation = validateUpload(file, { allowedMimeTypes: PDF_MIME_TYPES });
    if (!validation.ok) {
      alert(validation.error);
      return;
    }

    setUploadingIndex(idx);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await uploadPdfAction(formData);
      if (res.success && res.url) {
        setBrochures(prev =>
          prev.map((b, i) => (i === idx ? { ...b, url: res.url! } : b))
        );
      } else {
        alert(res.error || "เกิดข้อผิดพลาดในการอัปโหลดไฟล์");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("เกิดข้อผิดพลาดในการอัปโหลด");
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleAddBrochureSlot = () => {
    if (brochures.length >= 3) return;
    setBrochures([...brochures, { name: "", url: "" }]);
  };

  const handleRemoveBrochureSlot = (idx: number) => {
    setBrochures(brochures.filter((_, i) => i !== idx));
  };

  const handleBrochureNameChange = (idx: number, newName: string) => {
    setBrochures(prev =>
      prev.map((b, i) => (i === idx ? { ...b, name: newName } : b))
    );
  };

  const handleSaveContent = () => {
    setMessage(null);
    startTransition(async () => {
      // Filter out empty ones and stringify
      const activeBrochures = brochures.filter(b => b.url.trim() !== "");
      const pdfUrlValue = activeBrochures.length > 0 ? JSON.stringify(activeBrochures) : null;

      const res = await updateInsurancePageAction(page.id, {
        name,
        summary,
        premium,
        published,
        coverage,
        conditions: conditions || null,
        pdfUrl: pdfUrlValue,
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

          <div className="border-t border-gray-100 pt-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <label className="block text-sm font-bold text-navy-800">
                  ไฟล์โบรชัวร์ PDF ประกันภัย (อัปโหลดได้สูงสุด 3 ไฟล์)
                </label>
                <p className="text-xs text-navy-450 mt-1">
                  กรอกชื่อป้ายกำกับของแต่ละไฟล์ เช่น &quot;โบรชัวร์รวม&quot;, &quot;แผนประกันสำหรับเด็ก&quot; และอัปโหลดไฟล์ PDF (ขนาดไม่เกิน 5MB ต่อไฟล์)
                </p>
              </div>
              {brochures.length < 3 && (
                <button
                  type="button"
                  onClick={handleAddBrochureSlot}
                  className="rounded-lg border border-navy-100 bg-white hover:bg-navy-50 px-3 py-1.5 text-xs font-bold text-navy-600 cursor-pointer transition-colors"
                >
                  + เพิ่มโบรชัวร์
                </button>
              )}
            </div>

            {brochures.length === 0 ? (
              <div className="text-center p-6 bg-gray-50 border border-dashed rounded-xl text-sm font-semibold text-navy-450">
                ยังไม่มีไฟล์โบรชัวร์ถูกอัปโหลด (สามารถเพิ่มได้สูงสุด 3 ไฟล์)
              </div>
            ) : (
              <div className="space-y-4">
                {brochures.map((brochure, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-gray-50/50 p-4 border border-navy-100/50 rounded-xl relative"
                  >
                    <div className="flex-1 w-full space-y-1.5">
                      <label className="block text-xs font-bold text-navy-500 uppercase">
                        โบรชัวร์ที่ {idx + 1}: ชื่อป้ายกำกับไฟล์
                      </label>
                      <input
                        type="text"
                        value={brochure.name}
                        onChange={(e) => handleBrochureNameChange(idx, e.target.value)}
                        placeholder="เช่น โบรชัวร์รวม หรือ โบรชัวร์ พ.ร.บ. รถยนต์"
                        className="w-full rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm font-semibold text-navy-800 focus:outline-none focus:border-orange-400"
                      />
                    </div>

                    <div className="w-full sm:w-auto sm:min-w-75 space-y-1.5">
                      <label className="block text-xs font-bold text-navy-500 uppercase">
                        ไฟล์โบรชัวร์ (PDF เท่านั้น)
                      </label>
                      {brochure.url ? (
                        <div className="flex items-center gap-2 bg-white px-3 py-1.8 border border-navy-100 rounded-lg h-9">
                          <span className="text-xs font-semibold text-emerald-600 truncate flex-1">
                            ✓ อัปโหลดสำเร็จ
                          </span>
                          <a
                            href={brochure.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-navy-600 hover:text-orange-500 underline"
                          >
                            ดูไฟล์
                          </a>
                          <button
                            type="button"
                            onClick={() =>
                              setBrochures(prev =>
                                prev.map((b, i) => (i === idx ? { ...b, url: "" } : b))
                              )
                            }
                            className="text-xs font-bold text-red-500 hover:text-red-700 cursor-pointer"
                          >
                            ลบ
                          </button>
                        </div>
                      ) : (
                        <div className="relative h-9">
                          <input
                            type="file"
                            accept="application/pdf"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleUploadFile(idx, file);
                            }}
                            disabled={uploadingIndex !== null}
                            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10 disabled:cursor-not-allowed"
                          />
                          <div className="absolute inset-0 flex items-center justify-center border border-navy-200 border-dashed rounded-lg bg-white text-xs font-semibold text-navy-600 hover:bg-gray-50 transition-colors">
                            {uploadingIndex === idx ? (
                              <span className="text-orange-500 animate-pulse">กำลังอัปโหลด...</span>
                            ) : (
                              <span>📁 คลิกเลือกไฟล์ PDF (ไม่เกิน 5MB)</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveBrochureSlot(idx)}
                      className="absolute top-2 right-2 sm:static sm:mt-6 rounded border border-red-200 hover:bg-red-50 text-red-500 hover:text-red-700 h-7 w-7 inline-flex items-center justify-center cursor-pointer font-bold transition-colors"
                      title="ลบช่องอัปโหลดนี้"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-gray-100 pt-4">
              <label className="block text-sm font-bold text-navy-800 mb-1">
                สถานะการเผยแพร่
              </label>
              <div className="mt-2">
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
