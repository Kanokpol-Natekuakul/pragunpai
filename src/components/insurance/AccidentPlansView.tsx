"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface PlanRow {
  feature: string;
  plan1: string;
  plan2: string;
  plan3: string;
}

interface AccidentPlansViewProps {
  viewMode: string; // "table" | "images" | "both"
  images: string[];
  planNames?: string[];
  comparisonPlans: PlanRow[];
}

export function AccidentPlansView({
  viewMode,
  images,
  planNames: customPlanNames,
  comparisonPlans,
}: AccidentPlansViewProps) {
  const [activeTab, setActiveTab] = useState<"images" | "table">(
    viewMode === "table" ? "table" : "images"
  );
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // If viewMode is "table" only or "images" only, we don't show tabs. We just show the content directly.
  const showTabs = viewMode === "both";

  const planNames =
    customPlanNames && customPlanNames.length === 3
      ? customPlanNames
      : ["แผนเริ่มต้น", "แผนแนะนำ", "แผนสูงสุด"];
  const planColors = [
    "border-navy-200",
    "border-orange-400 ring-2 ring-orange-400/20",
    "border-navy-800",
  ];
  const planBadges = [
    { label: "ประหยัด", style: "bg-navy-50 text-navy-700 border-navy-100" },
    {
      label: "คุ้มค่าที่สุด",
      style: "bg-orange-50 text-orange-700 border-orange-200",
    },
    {
      label: "คุ้มครองสูงสุด",
      style: "bg-navy-900 text-white border-navy-950",
    },
  ];

  // Map and filter active plans that have non-empty image URLs
  const activePlans = images
    .map((img, i) => {
      return {
        imgUrl: img || "",
        idx: i,
        name: planNames[i],
        color: planColors[i],
        badge: planBadges[i],
        quoteParam: i === 0 ? "basic" : i === 1 ? "standard" : "premium",
      };
    })
    .filter((p) => p.imgUrl && p.imgUrl.trim() !== "");

  // Determine dynamic grid columns based on number of active plans
  const gridCols =
    activePlans.length === 1
      ? "grid-cols-1 max-w-sm mx-auto"
      : activePlans.length === 2
        ? "grid-cols-1 md:grid-cols-2 max-w-2xl mx-auto"
        : "grid-cols-1 md:grid-cols-3";

  return (
    <div className="space-y-8">
      {/* Tab Selector */}
      {showTabs && (
        <div className="flex justify-center">
          <div className="inline-flex rounded-xl bg-navy-50 p-1 border border-navy-100/50">
            <button
              onClick={() => setActiveTab("images")}
              className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-bold transition-all cursor-pointer ${
                activeTab === "images"
                  ? "bg-white text-navy-800 shadow-sm"
                  : "text-navy-500 hover:text-navy-800"
              }`}
            >
              🖼️ ภาพโบรชัวร์แผนความคุ้มครอง
            </button>
            <button
              onClick={() => setActiveTab("table")}
              className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-bold transition-all cursor-pointer ${
                activeTab === "table"
                  ? "bg-white text-navy-800 shadow-sm"
                  : "text-navy-500 hover:text-navy-800"
              }`}
            >
              📊 ตารางเปรียบเทียบข้อมูล
            </button>
          </div>
        </div>
      )}

      {/* Image Grid View */}
      {activeTab === "images" && (
        <div className="space-y-6">
          {activePlans.length === 0 ? (
            <div className="text-center py-12 px-6 bg-white border border-gray-150 rounded-xl space-y-4 shadow-sm">
              <span className="text-4xl">📋</span>
              <h3 className="text-base font-bold text-navy-800">
                ขณะนี้อยู่ระหว่างปรับปรุงรูปภาพแผนความคุ้มครอง
              </h3>
              <p className="text-sm text-navy-500 max-w-md mx-auto leading-relaxed">
                ท่านสามารถกดดูรายละเอียดตารางความคุ้มครองได้ที่แท็บ{" "}
                <strong>&ldquo;ตารางเปรียบเทียบข้อมูล&rdquo;</strong> ด้านบน
                หรือขอใบเสนอราคาโดยตรงเพื่อรับคำแนะนำการเลือกแผนที่เหมาะกับท่าน
              </p>
              <div className="pt-2">
                <Button
                  href="/quote/accident"
                  variant="accent"
                  size="sm"
                  className="shadow-sm"
                >
                  ขอใบเสนอราคาด่วน
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-center text-xs text-navy-500 font-medium">
                💡
                คลิกที่รูปภาพโบรชัวร์ด้านล่างเพื่อขยายดูรายละเอียดความคุ้มครองแบบเต็มจอ
              </p>

              <div className={`grid gap-8 ${gridCols}`}>
                {activePlans.map((plan) => (
                  <Card
                    key={plan.idx}
                    interactive
                    className={`relative flex flex-col justify-between overflow-hidden bg-white border p-4 transition-all duration-300 hover:scale-[1.02] ${plan.color}`}
                  >
                    {/* Plan Badge */}
                    <div className="absolute top-4 left-4 z-10">
                      <span
                        className={`rounded-full border px-3 py-1 text-[11px] font-bold shadow-sm ${plan.badge.style}`}
                      >
                        {plan.badge.label}
                      </span>
                    </div>

                    {/* Plan Image Container */}
                    <div
                      onClick={() => setLightboxImage(plan.imgUrl)}
                      className="group relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-gray-100 cursor-zoom-in border border-gray-100"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={plan.imgUrl}
                        alt={`โบรชัวร์ ${plan.name}`}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-navy-950/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center">
                        <span className="rounded-full bg-white/95 p-3 text-lg shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
                          🔍
                        </span>
                      </div>
                    </div>

                    {/* Card CTA */}
                    <div className="mt-5 pt-3 border-t border-gray-100 flex flex-col items-center">
                      <h3 className="text-base font-bold text-navy-800">
                        {plan.name}
                      </h3>
                      <Button
                        href={`/quote/accident?plan=${plan.quoteParam}`}
                        variant={plan.idx === 1 ? "accent" : "primary"}
                        size="sm"
                        className="w-full mt-3 font-bold py-2 shadow-sm"
                      >
                        สนใจสมัครแผนนี้ →
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Table Comparison View */}
      {activeTab === "table" && (
        <Card className="overflow-hidden border border-navy-100 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-navy-600 text-white">
                <tr>
                  <th className="px-6 py-4 font-bold text-sm">
                    รายการคุ้มครอง
                  </th>
                  <th className="px-6 py-4 font-bold text-sm">
                    {planNames[0]}
                  </th>
                  <th className="px-6 py-4 font-bold text-sm">
                    {planNames[1]}
                  </th>
                  <th className="px-6 py-4 font-bold text-sm">
                    {planNames[2]}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-50">
                {comparisonPlans.map((row) => (
                  <tr
                    key={row.feature}
                    className="hover:bg-navy-50/20 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-navy-800">
                      {row.feature}
                    </td>
                    <td className="px-6 py-4 text-navy-600">{row.plan1}</td>
                    <td className="px-6 py-4 font-semibold text-navy-900 bg-orange-50/10">
                      {row.plan2}
                    </td>
                    <td className="px-6 py-4 font-semibold text-orange-600">
                      {row.plan3}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/90 p-4 transition-all duration-300 animate-fadeIn"
          onClick={() => setLightboxImage(null)}
        >
          {/* Close button */}
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white text-xl hover:bg-white/20 transition-colors cursor-pointer"
            title="ปิด"
          >
            ✕
          </button>

          {/* Expanded Image */}
          <div
            className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-xl animate-scaleUp"
            onClick={(e) => e.stopPropagation()} // Prevent close on image click
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightboxImage}
              alt="โบรชัวร์แผนประกันขยายใหญ่"
              className="max-h-[85vh] max-w-full w-auto h-auto object-contain rounded-xl shadow-2xl border-4 border-white"
            />
          </div>
        </div>
      )}
    </div>
  );
}
