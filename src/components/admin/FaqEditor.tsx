"use client";

import { useMemo, useState, useTransition } from "react";
import { updateFaqSectionAction } from "@/actions/faqs";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { FaqCategory, FaqSectionView } from "@/lib/faqs";

type EditorItem = {
  id?: string;
  clientId: string;
  question: string;
  answer: string;
};

type EditorSection = Omit<FaqSectionView, "items"> & {
  items: EditorItem[];
};

export function FaqEditor({ sections }: { sections: FaqSectionView[] }) {
  const initialSections = useMemo(
    () =>
      sections.map((section) => ({
        ...section,
        items: section.items.map((item, index) => ({
          id: item.id,
          clientId: item.id ?? `${section.category}-${index}`,
          question: item.question,
          answer: item.answer,
        })),
      })),
    [sections]
  );

  const [editorSections, setEditorSections] =
    useState<EditorSection[]>(initialSections);
  const [activeCategory, setActiveCategory] = useState<FaqCategory>(
    sections[0]?.category ?? "general"
  );
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const activeSection = editorSections.find(
    (section) => section.category === activeCategory
  );

  const updateSection = (
    category: FaqCategory,
    updater: (section: EditorSection) => EditorSection
  ) => {
    setEditorSections((current) =>
      current.map((section) =>
        section.category === category ? updater(section) : section
      )
    );
  };

  const addItem = () => {
    updateSection(activeCategory, (section) => ({
      ...section,
      items: [
        ...section.items,
        { clientId: `new-${Date.now()}`, question: "", answer: "" },
      ],
    }));
  };

  const updateItem = (
    clientId: string,
    field: "question" | "answer",
    value: string
  ) => {
    updateSection(activeCategory, (section) => ({
      ...section,
      items: section.items.map((item) =>
        item.clientId === clientId ? { ...item, [field]: value } : item
      ),
    }));
  };

  const deleteItem = (clientId: string) => {
    updateSection(activeCategory, (section) => ({
      ...section,
      items: section.items.filter((item) => item.clientId !== clientId),
    }));
  };

  const moveItem = (clientId: string, direction: -1 | 1) => {
    updateSection(activeCategory, (section) => {
      const index = section.items.findIndex(
        (item) => item.clientId === clientId
      );
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= section.items.length)
        return section;

      const items = [...section.items];
      const [item] = items.splice(index, 1);
      items.splice(nextIndex, 0, item);
      return { ...section, items };
    });
  };

  const saveActiveSection = () => {
    if (!activeSection) return;

    setStatus(null);
    startTransition(async () => {
      const response = await updateFaqSectionAction(activeSection.category, {
        title: activeSection.title,
        items: activeSection.items.map((item) => ({
          id: item.id,
          question: item.question,
          answer: item.answer,
        })),
      });

      if (response.success) {
        setStatus({ type: "success", text: "บันทึก FAQ สำเร็จ" });
        setTimeout(() => setStatus(null), 3000);
      } else {
        setStatus({
          type: "error",
          text: response.error || "บันทึก FAQ ไม่สำเร็จ",
        });
      }
    });
  };

  if (!activeSection) return null;

  return (
    <div className="space-y-6">
      <Card className="bg-white p-4">
        <div className="flex flex-wrap gap-2">
          {editorSections.map((section) => (
            <button
              key={section.category}
              type="button"
              onClick={() => {
                setActiveCategory(section.category);
                setStatus(null);
              }}
              className={`rounded-md border px-4 py-2 text-sm font-semibold transition-colors ${
                activeCategory === section.category
                  ? "border-navy-700 bg-navy-700 text-white"
                  : "border-navy-200 bg-white text-navy-700 hover:border-navy-400"
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>
      </Card>

      <Card className="bg-white p-6">
        <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-lg font-bold text-navy-800">
              {activeSection.label}
            </h2>
            <p className="mt-1 text-sm text-navy-500">
              แสดงบนหน้า {activeSection.path}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {status && (
              <span
                className={`rounded border px-3 py-1 text-xs font-semibold ${
                  status.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-red-200 bg-red-50 text-red-800"
                }`}
              >
                {status.text}
              </span>
            )}
            <Button
              onClick={saveActiveSection}
              disabled={isPending}
              variant="secondary"
              className="cursor-pointer"
            >
              {isPending ? "กำลังบันทึก..." : "บันทึก FAQ"}
            </Button>
          </div>
        </div>

        <div className="mt-5">
          <label className="mb-1 block text-xs font-bold uppercase text-navy-600">
            ชื่อหัวข้อ FAQ
          </label>
          <input
            type="text"
            value={activeSection.title}
            onChange={(event) =>
              updateSection(activeCategory, (section) => ({
                ...section,
                title: event.target.value,
              }))
            }
            className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm font-semibold text-navy-800 focus:border-orange-400 focus:outline-none"
          />
        </div>

        <div className="mt-6 space-y-4">
          {activeSection.items.map((item, index) => (
            <div
              key={item.clientId}
              className="rounded-lg border border-navy-100 bg-navy-50/40 p-4"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm font-bold text-navy-700">
                  ข้อที่ {index + 1}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => moveItem(item.clientId, -1)}
                    disabled={index === 0}
                    className="rounded-md border border-navy-200 bg-white px-3 py-1 text-xs font-semibold text-navy-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ขึ้น
                  </button>
                  <button
                    type="button"
                    onClick={() => moveItem(item.clientId, 1)}
                    disabled={index === activeSection.items.length - 1}
                    className="rounded-md border border-navy-200 bg-white px-3 py-1 text-xs font-semibold text-navy-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ลง
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteItem(item.clientId)}
                    className="rounded-md border border-red-200 bg-white px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
                  >
                    ลบ
                  </button>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-navy-600">
                    คำถาม
                  </label>
                  <input
                    type="text"
                    value={item.question}
                    onChange={(event) =>
                      updateItem(item.clientId, "question", event.target.value)
                    }
                    className="w-full rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm text-navy-800 focus:border-orange-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-navy-600">
                    คำตอบ
                  </label>
                  <textarea
                    rows={3}
                    value={item.answer}
                    onChange={(event) =>
                      updateItem(item.clientId, "answer", event.target.value)
                    }
                    className="w-full rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm text-navy-800 focus:border-orange-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex justify-between border-t border-gray-100 pt-5">
          <Button
            onClick={addItem}
            variant="secondary"
            className="cursor-pointer"
          >
            เพิ่มคำถาม
          </Button>
          <Button
            onClick={saveActiveSection}
            disabled={isPending}
            variant="accent"
            className="cursor-pointer"
          >
            {isPending ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
