"use client";

import { useState, useTransition } from "react";
import { updateSiteSettingAction, uploadHeroBannerAction } from "@/actions/settings";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export interface BannerSlideVal {
  imageUrl: string;
  alt?: string;
  href?: string;
}

export type BannersMapVal = Record<string, BannerSlideVal[]>;

const MAX_BANNER_SLIDES = 5;

interface PageBannersEditorProps {
  pages: ReadonlyArray<{ path: string; label: string }>;
  initialBanners: BannersMapVal;
}

export function PageBannersEditor({ pages, initialBanners }: PageBannersEditorProps) {
  const [isPending, startTransition] = useTransition();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [activePath, setActivePath] = useState<string>(pages[0]?.path ?? "/");
  const [bannersMap, setBannersMap] = useState<BannersMapVal>(initialBanners);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const activePage = pages.find((p) => p.path === activePath) ?? pages[0];
  const slides = bannersMap[activePath] ?? [];

  const setSlides = (updater: (prev: BannerSlideVal[]) => BannerSlideVal[]) => {
    setBannersMap((prev) => ({ ...prev, [activePath]: updater(prev[activePath] ?? []) }));
  };

  const handleAddSlot = () => {
    if (slides.length >= MAX_BANNER_SLIDES) return;
    setSlides((prev) => [...prev, { imageUrl: "", alt: "", href: "" }]);
  };

  const handleRemoveSlot = (idx: number) => {
    setSlides((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleMoveSlot = (idx: number, direction: -1 | 1) => {
    const target = idx + direction;
    if (target < 0 || target >= slides.length) return;
    setSlides((prev) => {
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  const handleFieldChange = (idx: number, field: "alt" | "href", value: string) => {
    setSlides((prev) => prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s)));
  };

  const handleUpload = async (idx: number, file: File) => {
    if (!file) return;
    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      alert("ขนาดไฟล์ใหญ่เกินไป (จำกัดไม่เกิน 5MB)");
      return;
    }

    setUploadingIndex(idx);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await uploadHeroBannerAction(formData);
      if (res.success && res.url) {
        setSlides((prev) => prev.map((s, i) => (i === idx ? { ...s, imageUrl: res.url! } : s)));
        setSuccessMsg("อัปโหลดรูปแบนเนอร์สำเร็จแล้ว (อย่าลืมกดบันทึก)");
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        alert(res.error || "เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ");
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ");
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleSave = () => {
    // Drop empty slots on every page before persisting
    const cleaned: BannersMapVal = {};
    for (const [path, pageSlides] of Object.entries(bannersMap)) {
      const active = pageSlides.filter((s) => s.imageUrl.trim() !== "");
      if (active.length > 0) cleaned[path] = active;
    }

    setSuccessMsg(null);
    startTransition(async () => {
      const res = await updateSiteSettingAction("pageBanners", cleaned);
      if (res.success) {
        setSuccessMsg("บันทึกแบนเนอร์สไลด์สำเร็จแล้ว");
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        alert(res.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    });
  };

  const slideCount = (path: string) =>
    (bannersMap[path] ?? []).filter((s) => s.imageUrl.trim() !== "").length;

  return (
    <div className="space-y-6">
      {successMsg && (
        <div className="fixed bottom-6 right-6 z-50 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold px-4 py-3 shadow-lg">
          ✓ {successMsg}
        </div>
      )}

      {/* Page selector */}
      <div className="flex flex-wrap gap-2">
        {pages.map((p) => (
          <button
            key={p.path}
            type="button"
            onClick={() => setActivePath(p.path)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              p.path === activePath
                ? "bg-navy-800 text-white"
                : "bg-white text-navy-600 border border-navy-200 hover:bg-navy-50"
            }`}
          >
            {p.label}
            {slideCount(p.path) > 0 && (
              <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                p.path === activePath ? "bg-orange-500 text-white" : "bg-navy-100 text-navy-600"
              }`}>
                {slideCount(p.path)}
              </span>
            )}
          </button>
        ))}
      </div>

      <Card className="p-6 bg-white border border-gray-200 space-y-4">
        <h2 className="text-base font-bold text-navy-800 border-b border-gray-100 pb-3 mb-2 flex items-center justify-between">
          <span>🎠 แบนเนอร์สไลด์: {activePage?.label}</span>
          {isPending && <span className="text-xs text-orange-500 font-semibold">กำลังบันทึก...</span>}
        </h2>

        <p className="text-[11px] text-navy-400 leading-relaxed -mt-2">
          รูปที่อัปโหลดจะแสดงต่อจากแบนเนอร์เดิมของหน้านี้เป็นสไลด์เลื่อนอัตโนมัติ (สูงสุด {MAX_BANNER_SLIDES} รูปต่อหน้า){" "}
          <strong className="text-orange-500">ขนาดแนะนำ: 1920px x 600px (สัดส่วน 16:5) ใช้ขนาดเดียวกันได้ทุกหน้า</strong>{" "}
          ไฟล์ JPG, PNG หรือ WEBP ไม่เกิน 5MB — บนจอกว้างรูปจะแสดงเต็มสัดส่วน ส่วนบนมือถืออาจถูกครอบตัดขอบซ้าย-ขวา
          แนะนำวางข้อความ/เนื้อหาสำคัญไว้กลางภาพ หากไม่มีรูป หน้านี้จะแสดงแบนเนอร์เดิมตามปกติ
        </p>

        {slides.length === 0 ? (
          <div className="rounded-lg border border-dashed border-navy-200 bg-navy-50/50 py-8 text-center text-sm text-navy-400 font-semibold">
            ยังไม่มีรูปแบนเนอร์สไลด์ — หน้า &quot;{activePage?.label}&quot; แสดงเฉพาะแบนเนอร์เดิม
          </div>
        ) : (
          <div className="space-y-3">
            {slides.map((slide, idx) => (
              <div key={idx} className="rounded-lg border border-gray-200 bg-navy-50/30 p-3 flex flex-col gap-3 sm:flex-row">
                {/* Preview */}
                <div className="relative h-24 w-full sm:w-56 shrink-0 overflow-hidden rounded-md bg-navy-100 border border-gray-200 flex items-center justify-center">
                  {slide.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={slide.imageUrl} alt={slide.alt || `สไลด์ ${idx + 1}`} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-[10px] text-navy-400 font-semibold">ยังไม่ได้เลือกรูป</span>
                  )}
                  <span className="absolute left-1.5 top-1.5 rounded bg-navy-800/80 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    สไลด์ {idx + 2}
                  </span>
                </div>

                {/* Fields */}
                <div className="flex-1 space-y-2">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={uploadingIndex === idx}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(idx, file);
                      e.target.value = "";
                    }}
                    className="w-full text-xs text-navy-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-navy-50 file:text-navy-700 hover:file:bg-navy-100 cursor-pointer disabled:opacity-50"
                  />
                  {uploadingIndex === idx && (
                    <span className="text-[10px] text-orange-500 font-bold animate-pulse">กำลังอัปโหลดรูป...</span>
                  )}
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input
                      type="text"
                      value={slide.alt || ""}
                      onChange={(e) => handleFieldChange(idx, "alt", e.target.value)}
                      placeholder="คำอธิบายรูป (Alt text) เช่น โปรโมชั่นประกันรถ"
                      className="w-full rounded-lg border border-navy-200 px-3 py-1.5 text-xs focus:outline-none focus:border-orange-400"
                    />
                    <input
                      type="text"
                      value={slide.href || ""}
                      onChange={(e) => handleFieldChange(idx, "href", e.target.value)}
                      placeholder="ลิงก์เมื่อคลิกรูป (ไม่บังคับ) เช่น /quote"
                      className="w-full rounded-lg border border-navy-200 px-3 py-1.5 text-xs focus:outline-none focus:border-orange-400 font-mono"
                    />
                  </div>
                </div>

                {/* Reorder / Remove */}
                <div className="flex sm:flex-col items-center justify-end gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMoveSlot(idx, -1)}
                    disabled={idx === 0}
                    aria-label="เลื่อนสไลด์ขึ้น"
                    className="rounded-md border border-navy-200 bg-white px-2 py-1 text-xs text-navy-600 hover:bg-navy-50 disabled:opacity-30 cursor-pointer disabled:cursor-default"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveSlot(idx, 1)}
                    disabled={idx === slides.length - 1}
                    aria-label="เลื่อนสไลด์ลง"
                    className="rounded-md border border-navy-200 bg-white px-2 py-1 text-xs text-navy-600 hover:bg-navy-50 disabled:opacity-30 cursor-pointer disabled:cursor-default"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveSlot(idx)}
                    aria-label="ลบสไลด์นี้"
                    className="rounded-md border border-red-200 bg-white px-2 py-1 text-xs text-red-500 hover:bg-red-50 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
          <button
            type="button"
            onClick={handleAddSlot}
            disabled={slides.length >= MAX_BANNER_SLIDES}
            className="rounded-lg border border-dashed border-navy-300 px-4 py-1.5 text-xs font-semibold text-navy-600 hover:bg-navy-50 disabled:opacity-40 cursor-pointer disabled:cursor-default"
          >
            + เพิ่มสไลด์ ({slides.length}/{MAX_BANNER_SLIDES})
          </button>
          <Button
            onClick={handleSave}
            disabled={isPending || uploadingIndex !== null}
            variant="secondary"
            className="text-xs py-1.5 px-6 font-semibold cursor-pointer"
          >
            บันทึกแบนเนอร์สไลด์ (ทุกหน้า)
          </Button>
        </div>
      </Card>
    </div>
  );
}
