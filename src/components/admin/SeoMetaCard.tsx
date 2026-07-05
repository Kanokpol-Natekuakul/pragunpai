"use client";

import { useState, useTransition } from "react";
import { updateSeoMetaAction } from "@/actions/seo";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface SeoMetaCardProps {
  pageKey: string;
  label: string;
  initialData: {
    seoTitle: string;
    metaDescription: string;
    keywords: string | null;
  } | null;
}

export function SeoMetaCard({ pageKey, label, initialData }: SeoMetaCardProps) {
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle || "");
  const [metaDescription, setMetaDescription] = useState(
    initialData?.metaDescription || ""
  );
  const [keywords, setKeywords] = useState(initialData?.keywords || "");
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSave = () => {
    setStatus(null);
    if (!seoTitle.trim()) {
      setStatus({ type: "error", text: "กรุณากรอก SEO Title" });
      return;
    }
    if (!metaDescription.trim()) {
      setStatus({ type: "error", text: "กรุณากรอก Meta Description" });
      return;
    }

    startTransition(async () => {
      const res = await updateSeoMetaAction(pageKey, {
        seoTitle: seoTitle.trim(),
        metaDescription: metaDescription.trim(),
        keywords: keywords.trim() || null,
      });

      if (res.success) {
        setStatus({ type: "success", text: "บันทึกการตั้งค่า SEO สำเร็จ" });
        setTimeout(() => setStatus(null), 3000);
      } else {
        setStatus({
          type: "error",
          text: res.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
        });
      }
    });
  };

  return (
    <Card className="p-6 bg-white border border-gray-200 space-y-4">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-2">
        <h2 className="text-base font-bold text-navy-800">
          📍 {label}{" "}
          <span className="text-xs text-navy-400 font-semibold">
            ({pageKey})
          </span>
        </h2>

        {status && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded ${
              status.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-100"
                : "bg-red-50 text-red-800 border border-red-100"
            }`}
          >
            {status.text}
          </span>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-bold text-navy-600 uppercase mb-1">
            SEO Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
            placeholder="เช่น หน้าแรก | Pragunpai ประกันภัยออนไลน์"
            className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400 font-medium text-navy-800"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-navy-600 uppercase mb-1">
            Keywords (คำค้นหา คั่นด้วยเครื่องหมายจุลภาค)
          </label>
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="เช่น ประกันภัย, พรบออนไลน์, ประกันอุบัติเหตุ"
            className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400 font-medium text-navy-800"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-navy-600 uppercase mb-1">
            Meta Description (คำอธิบายสั้นๆ สำหรับแสดงใน Google Search){" "}
            <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={2}
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            placeholder="คำบรรยายดึงดูดใจความยาวประมาณ 120-160 ตัวอักษร..."
            className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
          />
        </div>
      </div>

      <div className="flex justify-end pt-2 border-t border-gray-50">
        <Button
          onClick={handleSave}
          disabled={isPending}
          variant="secondary"
          className="text-xs py-1.5 px-6 font-semibold cursor-pointer"
        >
          {isPending ? "กำลังบันทึก..." : "บันทึกการตั้งค่า SEO"}
        </Button>
      </div>
    </Card>
  );
}
