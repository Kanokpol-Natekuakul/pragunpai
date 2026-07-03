"use client";

import { useState, useTransition, useRef } from "react";
import { updateAccidentPlansConfigAction, uploadAccidentPlanImageAction } from "@/actions/accident-settings";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface AccidentPlansEditorProps {
  initialConfig: {
    viewMode: string;
    images: string[];
  };
}

export function AccidentPlansEditor({ initialConfig }: AccidentPlansEditorProps) {
  const [viewMode, setViewMode] = useState(initialConfig.viewMode || "both");
  const [images, setImages] = useState<string[]>(
    initialConfig.images && initialConfig.images.length === 3
      ? initialConfig.images
      : [
          "/images/mockups/accident_plan_basic.jpg",
          "/images/mockups/accident_plan_standard.jpg",
          "/images/mockups/accident_plan_premium.jpg",
        ]
  );

  const [isPending, startTransition] = useTransition();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const fileInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleSaveConfig = () => {
    setSuccessMsg(null);
    startTransition(async () => {
      const res = await updateAccidentPlansConfigAction({ viewMode, images });
      if (res.success) {
        setSuccessMsg("บันทึกการตั้งค่าแผนประกันอุบัติเหตุสำเร็จแล้ว");
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        alert(res.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    });
  };

  const handleImageUrlChange = (index: number, val: string) => {
    const updated = [...images];
    updated[index] = val;
    setImages(updated);
  };

  const handleFileChange = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingIndex(index);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("planIndex", index.toString());

    try {
      const res = await uploadAccidentPlanImageAction(formData);
      if (res.success && res.url) {
        const updated = [...images];
        updated[index] = res.url;
        setImages(updated);
        setSuccessMsg(`อัปโหลดรูปภาพแผนที่ ${index + 1} สำเร็จแล้ว`);
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        alert(res.error || "เกิดข้อผิดพลาดในการอัปโหลด");
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ");
    } finally {
      setUploadingIndex(null);
      // Clear file input
      if (fileInputRefs[index].current) {
        fileInputRefs[index].current!.value = "";
      }
    }
  };

  const handleClearImage = (index: number) => {
    const updated = [...images];
    updated[index] = "";
    setImages(updated);
  };

  const planLabels = [
    { name: "แผนพื้นฐาน (Basic Plan)", defaultUrl: "/images/mockups/accident_plan_basic.jpg" },
    { name: "แผนมาตรฐาน (Standard Plan)", defaultUrl: "/images/mockups/accident_plan_standard.jpg" },
    { name: "แผนพรีเมียม (Premium Plan)", defaultUrl: "/images/mockups/accident_plan_premium.jpg" },
  ];

  return (
    <div className="space-y-6">
      {successMsg && (
        <div className="fixed bottom-6 right-6 z-50 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold px-4 py-3 shadow-lg animate-fadeIn">
          ✓ {successMsg}
        </div>
      )}

      {/* View Mode Config */}
      <Card className="p-6 bg-white border border-gray-200 space-y-4">
        <h2 className="text-base font-bold text-navy-800 border-b border-gray-100 pb-3">
          📊 เลือกรูปแบบการแสดงผลเปรียบเทียบแผนประกันอุบัติเหตุ (Public View Mode)
        </h2>

        <div className="grid gap-4 sm:grid-cols-3 pt-2">
          <label
            className={`flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${
              viewMode === "table"
                ? "border-orange-500 bg-orange-50/20"
                : "border-gray-200 hover:border-navy-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="viewMode"
                value="table"
                checked={viewMode === "table"}
                onChange={(e) => setViewMode(e.target.value)}
                className="accent-orange-500 h-4 w-4"
              />
              <span className="font-bold text-navy-800">📊 ตารางเปรียบเทียบอย่างเดียว</span>
            </div>
            <p className="text-xs text-navy-500 mt-2 ml-7 leading-relaxed font-medium">
              แสดงเฉพาะตาราง HTML แบบเดิม เหมาะกับการเปรียบเทียบข้อมูลรายละเอียดความคุ้มครอง
            </p>
          </label>

          <label
            className={`flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${
              viewMode === "images"
                ? "border-orange-500 bg-orange-50/20"
                : "border-gray-200 hover:border-navy-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="viewMode"
                value="images"
                checked={viewMode === "images"}
                onChange={(e) => setViewMode(e.target.value)}
                className="accent-orange-500 h-4 w-4"
              />
              <span className="font-bold text-navy-800">🖼️ รูปภาพโบรชัวร์อย่างเดียว</span>
            </div>
            <p className="text-xs text-navy-500 mt-2 ml-7 leading-relaxed font-medium">
              แสดงเฉพาะการ์ด 3 รูปภาพเรียงกันใน 1 แถว สามารถคลิกขยายใหญ่และเลือกสมัครได้
            </p>
          </label>

          <label
            className={`flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${
              viewMode === "both"
                ? "border-orange-500 bg-orange-50/20"
                : "border-gray-200 hover:border-navy-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="viewMode"
                value="both"
                checked={viewMode === "both"}
                onChange={(e) => setViewMode(e.target.value)}
                className="accent-orange-500 h-4 w-4"
              />
              <span className="font-bold text-navy-800">🔄 แสดงทั้งสองแบบพร้อมกัน (สลับแท็บ)</span>
            </div>
            <p className="text-xs text-navy-500 mt-2 ml-7 leading-relaxed font-medium">
              แสดงผลแบบเป็นแท็บสลับให้ลูกค้าเลือกดูได้ทั้งโบรชัวร์รูปภาพ หรือตารางข้อมูล (แนะนำสำหรับ UX ที่ดีที่สุด)
            </p>
          </label>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-50">
          <Button
            onClick={handleSaveConfig}
            disabled={isPending}
            variant="primary"
            className="text-xs py-2 px-6 font-bold cursor-pointer"
          >
            {isPending ? "กำลังบันทึก..." : "💾 บันทึกโหมดแสดงผล"}
          </Button>
        </div>
      </Card>

      {/* Plan Images Configuration */}
      <div className="grid gap-6 md:grid-cols-3">
        {planLabels.map((plan, idx) => {
          const currentUrl = images[idx] || plan.defaultUrl;
          return (
            <Card key={idx} className="p-5 bg-white border border-gray-200 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-sm font-bold text-navy-800 border-b border-gray-100 pb-2.5 mb-3 flex items-center justify-between">
                  <span>🖼️ {plan.name}</span>
                  {uploadingIndex === idx && <span className="text-[10px] text-orange-500 font-bold animate-pulse">กำลังอัปโหลด...</span>}
                </h3>

                {/* Preview image */}
                <div className="aspect-[3/4] w-full overflow-hidden rounded-lg bg-gray-50 border border-gray-150 relative mb-4 flex items-center justify-center">
                  {currentUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={currentUrl}
                      alt={`พรีวิว ${plan.name}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-4 text-xs text-navy-400 font-semibold">
                      ไม่มีรูปภาพโบรชัวร์แผนนี้
                    </div>
                  )}
                </div>

                {/* Upload Section */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-navy-600 uppercase mb-1">
                      อัปโหลดรูปภาพใหม่ (จำกัดเฉพาะ JPG, PNG, WEBP ไม่เกิน 5MB)
                    </label>
                    <input
                      type="file"
                      ref={fileInputRefs[idx]}
                      onChange={(e) => handleFileChange(idx, e)}
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="w-full text-xs text-navy-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-navy-50 file:text-navy-700 hover:file:bg-navy-100 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-navy-600 uppercase mb-1">
                      หรือป้อนลิงก์รูปภาพโดยตรง (Image URL)
                    </label>
                    <input
                      type="text"
                      value={images[idx] || ""}
                      onChange={(e) => handleImageUrlChange(idx, e.target.value)}
                      placeholder="เช่น /images/mockups/plan.jpg หรือ https://..."
                      className="w-full rounded-lg border border-navy-200 px-3 py-1.5 text-xs focus:outline-none focus:border-orange-400 font-mono text-navy-700"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleImageUrlChange(idx, plan.defaultUrl)}
                  className="flex-1 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-navy-600 py-1.5 text-xs font-bold transition-colors cursor-pointer"
                >
                  ใช้รูปดีฟอลต์
                </button>
                <button
                  type="button"
                  onClick={() => handleClearImage(idx)}
                  className="rounded-lg border border-red-100 hover:bg-red-50 text-red-500 px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer"
                  title="ลบรูปภาพออก"
                >
                  🗑️ ล้างรูป
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Global Action Footer */}
      <Card className="p-4 bg-navy-900 border border-navy-950 flex items-center justify-between text-white flex-col sm:flex-row gap-3">
        <div className="text-center sm:text-left">
          <p className="text-sm font-bold">บันทึกรูปภาพแผนและลิงก์ทั้งหมด</p>
          <p className="text-[11px] text-navy-200 mt-0.5 font-medium">กดปุ่มขวาเพื่อบันทึกการเปลี่ยนแปลงลิงก์รูปภาพแผนทั้งหมดลงฐานข้อมูล</p>
        </div>
        <Button
          onClick={handleSaveConfig}
          disabled={isPending}
          variant="accent"
          className="w-full sm:w-auto px-8 cursor-pointer"
        >
          {isPending ? "กำลังบันทึก..." : "💾 บันทึกรูปภาพและโครงสร้างทั้งหมด"}
        </Button>
      </Card>
    </div>
  );
}
