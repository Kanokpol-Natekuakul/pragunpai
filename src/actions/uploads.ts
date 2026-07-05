"use server";

import { runAdminAction } from "@/lib/admin-action";
import { uploadAttachment } from "@/lib/upload";
import { IMAGE_MIME_TYPES, PDF_MIME_TYPES } from "@/lib/upload-constraints";

type UploadActionResult = { success: boolean; url?: string; error?: string };

async function handleUpload(
  formData: FormData,
  allowedMimeTypes: readonly string[]
): Promise<UploadActionResult> {
  return runAdminAction(
    "uploadAction",
    "เกิดข้อผิดพลาดในการอัปโหลดไฟล์",
    async () => {
      const file = formData.get("file");
      if (!(file instanceof File) || file.size === 0) {
        return { success: false, error: "ไม่พบไฟล์อัปโหลด" };
      }

      const result = await uploadAttachment(file, { allowedMimeTypes });
      return { success: true, url: result.url };
    }
  );
}

/** Admin upload for images (article covers, banners, logos, plan images). */
export async function uploadImageAction(
  formData: FormData
): Promise<UploadActionResult> {
  return handleUpload(formData, IMAGE_MIME_TYPES);
}

/** Admin upload for PDF brochures. */
export async function uploadPdfAction(
  formData: FormData
): Promise<UploadActionResult> {
  return handleUpload(formData, PDF_MIME_TYPES);
}
