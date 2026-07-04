"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface BrochureItem {
  name: string;
  url: string;
}

interface BrochureDownloadButtonProps {
  brochures: BrochureItem[];
}

export function BrochureDownloadButton({ brochures }: BrochureDownloadButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!brochures || brochures.length === 0) return null;

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  return (
    <>
      <Button
        type="button"
        onClick={handleOpen}
        variant="secondary"
        size="lg"
        className="border border-white/20 hover:bg-white/10 hover:text-white transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
      >
        📄 ดาวน์โหลดโบรชัวร์ (PDF)
      </Button>

      {/* Modal Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-navy-950/70 backdrop-blur-md transition-opacity duration-300 animate-fadeIn"
            onClick={handleClose}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-2xl border border-navy-100 transform transition-all duration-300 animate-scaleUp">
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-navy-400 hover:text-navy-600 transition-colors h-8 w-8 rounded-full hover:bg-navy-50 flex items-center justify-center cursor-pointer font-bold"
            >
              ✕
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="mx-auto w-12 h-12 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center text-2xl mb-3 shadow-inner">
                📄
              </div>
              <h3 className="text-lg font-bold text-navy-900">ดาวน์โหลดเอกสารโบรชัวร์</h3>
              <p className="text-xs text-navy-450 mt-1.5 font-medium">
                กรุณาเลือกไฟล์โบรชัวร์ที่คุณต้องการดาวน์โหลด
              </p>
            </div>

            {/* Content List */}
            <div className="space-y-3">
              {brochures.map((brochure, idx) => (
                <a
                  key={idx}
                  href={brochure.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleClose}
                  className="flex items-center gap-4 p-4 rounded-xl border border-navy-100 bg-navy-50/30 hover:bg-orange-50/50 hover:border-orange-200 transition-all duration-200 group text-left"
                >
                  <div className="w-10 h-10 bg-white border border-navy-100 text-navy-600 rounded-lg flex items-center justify-center text-lg font-bold shadow-sm group-hover:bg-orange-50 group-hover:text-orange-500 transition-colors">
                    PDF
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-navy-800 group-hover:text-orange-600 truncate transition-colors">
                      {brochure.name || `ไฟล์โบรชัวร์ชุดที่ ${idx + 1}`}
                    </div>
                    <div className="text-[11px] font-semibold text-navy-400 mt-0.5">
                      คลิกเพื่อดาวน์โหลด/เปิดอ่านเอกสาร
                    </div>
                  </div>
                  <div className="text-navy-300 group-hover:text-orange-500 transition-colors font-bold text-lg pr-1">
                    →
                  </div>
                </a>
              ))}
            </div>

            {/* Cancel Button */}
            <div className="mt-6 border-t border-navy-50 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="w-full py-2.5 rounded-lg border border-navy-100 text-sm font-bold text-navy-600 hover:bg-navy-50 transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
