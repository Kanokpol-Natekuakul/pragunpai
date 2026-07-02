"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteArticleAction } from "@/actions/articles";

interface DeleteArticleButtonProps {
  articleId: string;
}

export function DeleteArticleButton({ articleId }: DeleteArticleButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบบทความนี้อย่างถาวร?")) {
      return;
    }

    startTransition(async () => {
      const res = await deleteArticleAction(articleId);
      if (res.success) {
        router.refresh();
      } else {
        alert(res.error || "เกิดข้อผิดพลาดในการลบข้อมูล");
      }
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="rounded border border-red-200 hover:bg-red-50 text-red-600 px-3 py-1.5 text-xs font-semibold disabled:opacity-50 cursor-pointer"
    >
      {isPending ? "ลบ..." : "ลบ ✕"}
    </button>
  );
}
