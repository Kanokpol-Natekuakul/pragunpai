"use client";

import { useState, useTransition } from "react";
import { updateSiteSettingAction } from "@/actions/settings";
import { uploadImageAction } from "@/actions/uploads";
import { validateUpload, IMAGE_MIME_TYPES } from "@/lib/upload-constraints";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export interface BannerSlideVal {
  imageUrl: string;
  alt?: string;
  href?: string;
}

export interface PageBannerConfigVal {
  slides: BannerSlideVal[];
  promos: BannerSlideVal[];
}

export type BannersMapVal = Record<string, PageBannerConfigVal>;

type ImageKind = "slides" | "promos";

const MAX_SLIDES = 5;
const MAX_PROMOS = 2;

const kindMeta: Record<ImageKind, { max: number; addLabel: string; emptyLabel: string }> = {
  slides: {
    max: MAX_SLIDES,
    addLabel: "เพิ่มสไลด์",
    emptyLabel: "ยังไม่มีรูปแบนเนอร์สไลด์ — หน้านี้แสดงเฉพาะแบนเนอร์เดิม",
  },
  promos: {
    max: MAX_PROMOS,
    addLabel: "เพิ่มรูปโปรโมชั่น",
    emptyLabel: "ยังไม่มีรูปโปรโมชั่น — หน้านี้ไม่แสดงส่วนรูปใต้แบนเนอร์",
  },
};

interface PageBannersEditorProps {
  pages: ReadonlyArray<{ path: string; label: string; promos: boolean }>;
  initialBanners: BannersMapVal;
}

const emptyConfig = (): PageBannerConfigVal => ({ slides: [], promos: [] });

export function PageBannersEditor({ pages, initialBanners }: PageBannersEditorProps) {
  const [isPending, startTransition] = useTransition();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [activePath, setActivePath] = useState<string>(pages[0]?.path ?? "/");
  const [bannersMap, setBannersMap] = useState<BannersMapVal>(initialBanners);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  const activePage = pages.find((p) => p.path === activePath) ?? pages[0];
  const config = bannersMap[activePath] ?? emptyConfig();

  const setList = (kind: ImageKind, updater: (prev: BannerSlideVal[]) => BannerSlideVal[]) => {
    setBannersMap((prev) => {
      const cfg = prev[activePath] ?? emptyConfig();
      return { ...prev, [activePath]: { ...cfg, [kind]: updater(cfg[kind]) } };
    });
  };

  const handleAddSlot = (kind: ImageKind) => {
    if (config[kind].length >= kindMeta[kind].max) return;
    setList(kind, (prev) => [...prev, { imageUrl: "", alt: "", href: "" }]);
  };

  const handleRemoveSlot = (kind: ImageKind, idx: number) => {
    setList(kind, (prev) => prev.filter((_, i) => i !== idx));
  };

  const handleMoveSlot = (kind: ImageKind, idx: number, direction: -1 | 1) => {
    const target = idx + direction;
    if (target < 0 || target >= config[kind].length) return;
    setList(kind, (prev) => {
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  const handleFieldChange = (kind: ImageKind, idx: number, field: "alt" | "href", value: string) => {
    setList(kind, (prev) => prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s)));
  };

  const handleUpload = async (kind: ImageKind, idx: number, file: File) => {
    if (!file) return;
    const validation = validateUpload(file, { allowedMimeTypes: IMAGE_MIME_TYPES });
    if (!validation.ok) {
      alert(validation.error);
      return;
    }

    setUploadingKey(`${kind}-${idx}`);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await uploadImageAction(formData);
      if (res.success && res.url) {
        setList(kind, (prev) => prev.map((s, i) => (i === idx ? { ...s, imageUrl: res.url! } : s)));
        setSuccessMsg("อัปโหลดรูปสำเร็จแล้ว (อย่าลืมกดบันทึก)");
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        alert(res.error || "เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ");
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ");
    } finally {
      setUploadingKey(null);
    }
  };

  const handleSave = () => {
    // Drop empty slots on every page before persisting
    const cleaned: BannersMapVal = {};
    for (const [path, cfg] of Object.entries(bannersMap)) {
      const slides = (cfg.slides ?? []).filter((s) => s.imageUrl.trim() !== "");
      const promos = (cfg.promos ?? []).filter((s) => s.imageUrl.trim() !== "");
      if (slides.length > 0 || promos.length > 0) cleaned[path] = { slides, promos };
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

  const imageCount = (path: string) => {
    const cfg = bannersMap[path] ?? emptyConfig();
    return [...cfg.slides, ...cfg.promos].filter((s) => s.imageUrl.trim() !== "").length;
  };

  const renderSlotList = (kind: ImageKind, badgeLabel: (idx: number) => string) => {
    const items = config[kind];
    const meta = kindMeta[kind];

    return (
      <>
        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-navy-200 bg-navy-50/50 py-8 text-center text-sm text-navy-400 font-semibold">
            {meta.emptyLabel}
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((slide, idx) => (
              <div key={idx} className="rounded-lg border border-gray-200 bg-navy-50/30 p-3 flex flex-col gap-3 sm:flex-row">
                {/* Preview */}
                <div className="relative h-24 w-full sm:w-56 shrink-0 overflow-hidden rounded-md bg-navy-100 border border-gray-200 flex items-center justify-center">
                  {slide.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={slide.imageUrl} alt={slide.alt || badgeLabel(idx)} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-[10px] text-navy-400 font-semibold">ยังไม่ได้เลือกรูป</span>
                  )}
                  <span className="absolute left-1.5 top-1.5 rounded bg-navy-800/80 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {badgeLabel(idx)}
                  </span>
                </div>

                {/* Fields */}
                <div className="flex-1 space-y-2">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={uploadingKey === `${kind}-${idx}`}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(kind, idx, file);
                      e.target.value = "";
                    }}
                    className="w-full text-xs text-navy-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-navy-50 file:text-navy-700 hover:file:bg-navy-100 cursor-pointer disabled:opacity-50"
                  />
                  {uploadingKey === `${kind}-${idx}` && (
                    <span className="text-[10px] text-orange-500 font-bold animate-pulse">กำลังอัปโหลดรูป...</span>
                  )}
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input
                      type="text"
                      value={slide.alt || ""}
                      onChange={(e) => handleFieldChange(kind, idx, "alt", e.target.value)}
                      placeholder="คำอธิบายรูป (Alt text) เช่น โปรโมชั่นประกันรถ"
                      className="w-full rounded-lg border border-navy-200 px-3 py-1.5 text-xs focus:outline-none focus:border-orange-400"
                    />
                    <input
                      type="text"
                      value={slide.href || ""}
                      onChange={(e) => handleFieldChange(kind, idx, "href", e.target.value)}
                      placeholder="ลิงก์เมื่อคลิกรูป (ไม่บังคับ) เช่น /quote"
                      className="w-full rounded-lg border border-navy-200 px-3 py-1.5 text-xs focus:outline-none focus:border-orange-400 font-mono"
                    />
                  </div>
                </div>

                {/* Reorder / Remove */}
                <div className="flex sm:flex-col items-center justify-end gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMoveSlot(kind, idx, -1)}
                    disabled={idx === 0}
                    aria-label="เลื่อนลำดับขึ้น"
                    className="rounded-md border border-navy-200 bg-white px-2 py-1 text-xs text-navy-600 hover:bg-navy-50 disabled:opacity-30 cursor-pointer disabled:cursor-default"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveSlot(kind, idx, 1)}
                    disabled={idx === items.length - 1}
                    aria-label="เลื่อนลำดับลง"
                    className="rounded-md border border-navy-200 bg-white px-2 py-1 text-xs text-navy-600 hover:bg-navy-50 disabled:opacity-30 cursor-pointer disabled:cursor-default"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveSlot(kind, idx)}
                    aria-label="ลบรูปนี้"
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
            onClick={() => handleAddSlot(kind)}
            disabled={items.length >= meta.max}
            className="rounded-lg border border-dashed border-navy-300 px-4 py-1.5 text-xs font-semibold text-navy-600 hover:bg-navy-50 disabled:opacity-40 cursor-pointer disabled:cursor-default"
          >
            + {meta.addLabel} ({items.length}/{meta.max})
          </button>
          <Button
            onClick={handleSave}
            disabled={isPending || uploadingKey !== null}
            variant="secondary"
            className="text-xs py-1.5 px-6 font-semibold cursor-pointer"
          >
            บันทึกแบนเนอร์สไลด์ (ทุกหน้า)
          </Button>
        </div>
      </>
    );
  };

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
            {imageCount(p.path) > 0 && (
              <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                p.path === activePath ? "bg-orange-500 text-white" : "bg-navy-100 text-navy-600"
              }`}>
                {imageCount(p.path)}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Card 1: Hero banner slides */}
      <Card className="p-6 bg-white border border-gray-200 space-y-4">
        <h2 className="text-base font-bold text-navy-800 border-b border-gray-100 pb-3 mb-2 flex items-center justify-between">
          <span>🎠 แบนเนอร์สไลด์: {activePage?.label}</span>
          {isPending && <span className="text-xs text-orange-500 font-semibold">กำลังบันทึก...</span>}
        </h2>

        <p className="text-[11px] text-navy-400 leading-relaxed -mt-2">
          รูปที่อัปโหลดจะแสดงต่อจากแบนเนอร์เดิมของหน้านี้เป็นสไลด์เลื่อนอัตโนมัติ (สูงสุด {MAX_SLIDES} รูปต่อหน้า){" "}
          <strong className="text-orange-500">ขนาดแนะนำ: 1920px x 600px (สัดส่วน 16:5) ใช้ขนาดเดียวกันได้ทุกหน้า</strong>{" "}
          ไฟล์ JPG, PNG หรือ WEBP ไม่เกิน 5MB — บนจอกว้างรูปจะแสดงเต็มสัดส่วน ส่วนบนมือถืออาจถูกครอบตัดขอบซ้าย-ขวา
          แนะนำวางข้อความ/เนื้อหาสำคัญไว้กลางภาพ หากไม่มีรูป หน้านี้จะแสดงแบนเนอร์เดิมตามปกติ
        </p>

        {renderSlotList("slides", (idx) => `สไลด์ ${idx + 2}`)}
      </Card>

      {/* Card 2: Promo images below the banner (not on the homepage) */}
      {activePage?.promos && (
        <Card className="p-6 bg-white border border-gray-200 space-y-4">
          <h2 className="text-base font-bold text-navy-800 border-b border-gray-100 pb-3 mb-2 flex items-center justify-between">
            <span>🖼️ รูปโปรโมชั่นใต้แบนเนอร์: {activePage?.label}</span>
            {isPending && <span className="text-xs text-orange-500 font-semibold">กำลังบันทึก...</span>}
          </h2>

          <p className="text-[11px] text-navy-400 leading-relaxed -mt-2">
            รูปนิ่งแนวตั้งแสดงใต้แบนเนอร์ของหน้านี้ (สูงสุด {MAX_PROMOS} รูป) มี 1 รูปแสดงกลางหน้า มี 2 รูปแบ่งซ้าย-ขวา{" "}
            <strong className="text-orange-500">ขนาดแนะนำ: 900px x 1200px (สัดส่วน 3:4 แนวตั้ง)</strong>{" "}
            ไฟล์ JPG, PNG หรือ WEBP ไม่เกิน 5MB หากไม่มีรูป หน้านี้จะไม่แสดงส่วนนี้เลย
          </p>

          {renderSlotList("promos", (idx) => `รูปที่ ${idx + 1}`)}
        </Card>
      )}
    </div>
  );
}
