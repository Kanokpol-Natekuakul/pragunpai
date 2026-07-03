"use client";

import { useState, useTransition, useRef } from "react";
import { updateAccidentPlansConfigAction, uploadAccidentPlanImageAction } from "@/actions/accident-settings";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface ComparisonPlanRow {
  id: string;
  feature: string;
  plan1: string;
  plan2: string;
  plan3: string;
}

interface AccidentPlansEditorProps {
  initialConfig: {
    viewMode: string;
    images: string[];
    planNames: string[];
    comparisonPlans: ComparisonPlanRow[];
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
  const [planNames, setPlanNames] = useState<string[]>(
    initialConfig.planNames && initialConfig.planNames.length === 3
      ? initialConfig.planNames
      : ["แผนเริ่มต้น", "แผนแนะนำ", "แผนสูงสุด"]
  );
  const [comparisonPlans, setComparisonPlans] = useState<ComparisonPlanRow[]>(
    initialConfig.comparisonPlans || []
  );

  const [isPending, startTransition] = useTransition();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const fileInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handlePlanNameChange = (index: number, val: string) => {
    const updated = [...planNames];
    updated[index] = val;
    setPlanNames(updated);
  };

  const handleSaveConfig = () => {
    setSuccessMsg(null);
    startTransition(async () => {
      const res = await updateAccidentPlansConfigAction({ viewMode, images, planNames, comparisonPlans });
      if (res.success) {
        setSuccessMsg("บันทึกการตั้งค่าแผนประกันอุบัติเหตุสำเร็จแล้ว");
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        alert(res.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    });
  };

  const handleAddRow = () => {
    const newId = `row-${Date.now()}`;
    setComparisonPlans([
      ...comparisonPlans,
      { id: newId, feature: "รายการความคุ้มครองใหม่", plan1: "", plan2: "", plan3: "" },
    ]);
  };

  const handleRemoveRow = (id: string) => {
    setComparisonPlans(comparisonPlans.filter((r) => r.id !== id));
  };

  const handleRowFieldChange = (id: string, field: "feature" | "plan1" | "plan2" | "plan3", val: string) => {
    setComparisonPlans(
      comparisonPlans.map((r) => (r.id === id ? { ...r, [field]: val } : r))
    );
  };

  const moveRowUp = (idx: number) => {
    if (idx === 0) return;
    const updated = [...comparisonPlans];
    const temp = updated[idx];
    updated[idx] = updated[idx - 1];
    updated[idx - 1] = temp;
    setComparisonPlans(updated);
  };

  const moveRowDown = (idx: number) => {
    if (idx === comparisonPlans.length - 1) return;
    const updated = [...comparisonPlans];
    const temp = updated[idx];
    updated[idx] = updated[idx + 1];
    updated[idx + 1] = temp;
    setComparisonPlans(updated);
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
                  <span>🖼️ {planNames[idx]}</span>
                  {uploadingIndex === idx && <span className="text-[10px] text-orange-500 font-bold animate-pulse">กำลังอัปโหลด...</span>}
                </h3>

                {/* Preview image */}
                <div className="aspect-[3/4] w-full overflow-hidden rounded-lg bg-gray-50 border border-gray-150 relative mb-4 flex items-center justify-center">
                  {currentUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={currentUrl}
                      alt={`พรีวิว ${planNames[idx]}`}
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
                      ชื่อแผนประกัน (แสดงบนหน้าเว็บ)
                    </label>
                    <input
                      type="text"
                      value={planNames[idx] || ""}
                      onChange={(e) => handlePlanNameChange(idx, e.target.value)}
                      placeholder="เช่น แผนเริ่มต้น, แผนแนะนำ"
                      className="w-full rounded-lg border border-navy-200 px-3 py-1.5 text-xs focus:outline-none focus:border-orange-400 font-bold text-navy-800"
                    />
                  </div>

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

      {/* Dynamic Comparison Table Editor */}
      <Card className="p-6 bg-white border border-gray-200 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end justify-between border-b border-gray-100 pb-5">
          <div>
            <h2 className="text-base font-bold text-navy-800">
              📊 จัดการตารางเปรียบเทียบข้อมูลแผนประกันอุบัติเหตุ
            </h2>
            <p className="text-xs text-navy-500 mt-1 font-medium">
              เพิ่ม ลด หรือเรียงลำดับหัวข้อความคุ้มครองและจำนวนเงินที่จะไปแสดงในตารางเปรียบเทียบหน้าเว็บจริง
            </p>
          </div>
          
          <button
            type="button"
            onClick={handleAddRow}
            className="rounded-lg bg-orange-500 hover:bg-orange-600 px-4 py-2 text-sm font-semibold text-white cursor-pointer transition-colors"
          >
            เพิ่มหัวข้อความคุ้มครอง +
          </button>
        </div>

        {comparisonPlans.length === 0 ? (
          <p className="p-8 text-center text-sm text-navy-450 font-semibold bg-gray-50 border border-dashed border-gray-200 rounded-lg">
            ยังไม่มีข้อมูลรายละเอียดตารางเปรียบเทียบแผน
          </p>
        ) : (
          <div className="space-y-3">
            {comparisonPlans.map((row, idx) => (
              <div
                key={row.id}
                className="flex flex-col md:flex-row gap-3 items-start border border-gray-250 bg-gray-50/50 p-4 rounded-xl relative hover:border-gray-300 transition-colors"
              >
                {/* Row Item Name */}
                <div className="w-full md:w-1/3">
                  <label className="block text-[10px] uppercase font-bold text-navy-500 mb-1">
                    หัวข้อความคุ้มครอง / รายการ
                  </label>
                  <input
                    type="text"
                    value={row.feature}
                    onChange={(e) => handleRowFieldChange(row.id, "feature", e.target.value)}
                    className="w-full rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm font-bold text-navy-850 focus:outline-none focus:border-orange-400"
                    placeholder="เช่น ค่ารักษาพยาบาลต่ออุบัติเหตุ"
                  />
                </div>

                {/* Plan Values inside Grid */}
                <div className="w-full md:flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-navy-450 truncate mb-1">
                      {planNames[0] || "แผนที่ 1"}
                    </label>
                    <input
                      type="text"
                      value={row.plan1}
                      onChange={(e) => handleRowFieldChange(row.id, "plan1", e.target.value)}
                      placeholder="เช่น 10,000 บาท"
                      className="w-full rounded-lg border border-navy-200 bg-white px-3 py-1.5 text-xs font-semibold text-navy-800 focus:outline-none focus:border-orange-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-navy-450 truncate mb-1">
                      {planNames[1] || "แผนที่ 2"}
                    </label>
                    <input
                      type="text"
                      value={row.plan2}
                      onChange={(e) => handleRowFieldChange(row.id, "plan2", e.target.value)}
                      placeholder="เช่น 30,000 บาท"
                      className="w-full rounded-lg border border-navy-200 bg-white px-3 py-1.5 text-xs font-semibold text-navy-800 focus:outline-none focus:border-orange-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-navy-450 truncate mb-1">
                      {planNames[2] || "แผนที่ 3"}
                    </label>
                    <input
                      type="text"
                      value={row.plan3}
                      onChange={(e) => handleRowFieldChange(row.id, "plan3", e.target.value)}
                      placeholder="เช่น 50,000 บาท"
                      className="w-full rounded-lg border border-navy-200 bg-white px-3 py-1.5 text-xs font-semibold text-navy-800 focus:outline-none focus:border-orange-400"
                    />
                  </div>
                </div>

                {/* Row Operations */}
                <div className="flex gap-1.5 self-end md:self-center mt-3 md:mt-0 pt-2 md:pt-0">
                  <button
                    type="button"
                    onClick={() => moveRowUp(idx)}
                    disabled={idx === 0}
                    className="rounded border border-gray-250 hover:bg-gray-150 h-7 w-7 inline-flex items-center justify-center disabled:opacity-30 cursor-pointer text-xs"
                    title="เลื่อนขึ้น"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => moveRowDown(idx)}
                    disabled={idx === comparisonPlans.length - 1}
                    className="rounded border border-gray-250 hover:bg-gray-150 h-7 w-7 inline-flex items-center justify-center disabled:opacity-30 cursor-pointer text-xs"
                    title="เลื่อนลง"
                  >
                    ▼
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveRow(row.id)}
                    className="rounded border border-red-200 hover:bg-red-50 text-red-500 h-7 w-7 inline-flex items-center justify-center cursor-pointer font-bold text-xs"
                    title="ลบแถว"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Global Action Footer */}
      <Card className="p-5 bg-white border border-gray-200 flex items-center justify-between text-navy-800 flex-col sm:flex-row gap-3 shadow-sm">
        <div className="text-center sm:text-left">
          <p className="text-sm font-bold text-navy-800">💾 บันทึกรูปภาพแผนและลิงก์ทั้งหมด</p>
          <p className="text-xs text-navy-500 mt-1 font-medium">
            กดปุ่มสีส้มขวามือเพื่อบันทึกการเปลี่ยนแปลงลิงก์รูปภาพแผนทั้งหมดลงฐานข้อมูล
          </p>
        </div>
        <Button
          onClick={handleSaveConfig}
          disabled={isPending}
          variant="accent"
          className="w-full sm:w-auto px-8 cursor-pointer font-bold shadow-sm"
        >
          {isPending ? "กำลังบันทึก..." : "💾 บันทึกรูปภาพและโครงสร้างทั้งหมด"}
        </Button>
      </Card>
    </div>
  );
}
