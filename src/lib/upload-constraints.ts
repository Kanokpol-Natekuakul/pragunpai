/**
 * Single source of truth for "what may be uploaded".
 * Pure module — no Node imports — so both client components and
 * server code import the same constraints and validator.
 */

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB

/** Allowed mimetype → allowed extensions for that mimetype. */
export const UPLOAD_MIME_EXTENSIONS: Record<string, readonly string[]> = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/jpg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
};

export const ALLOWED_MIME_TYPES = Object.keys(UPLOAD_MIME_EXTENSIONS);

export const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const PDF_MIME_TYPES = ["application/pdf"];

export type UploadValidation = { ok: true } | { ok: false; error: string };

/**
 * Validates name/type/size against the upload constraints.
 * `allowedMimeTypes` narrows the default allowlist (e.g. images only).
 */
export function validateUpload(
  file: { name: string; type: string; size: number },
  opts?: { allowedMimeTypes?: readonly string[] },
): UploadValidation {
  if (file.size > MAX_UPLOAD_BYTES) {
    return {
      ok: false,
      error: `ไฟล์ "${file.name}" มีขนาดใหญ่เกินไป (จำกัดไม่เกิน 5MB)`,
    };
  }

  const allowedMimeTypes = opts?.allowedMimeTypes ?? ALLOWED_MIME_TYPES;
  const extensions = UPLOAD_MIME_EXTENSIONS[file.type];
  if (!extensions || !allowedMimeTypes.includes(file.type)) {
    return {
      ok: false,
      error: `ไม่รองรับประเภทไฟล์ "${file.name}" (รองรับเฉพาะ JPG, PNG, WEBP, PDF, DOC, DOCX)`,
    };
  }

  // Extension must match the declared mimetype (strict double-validation).
  const dotIndex = file.name.lastIndexOf(".");
  const ext = dotIndex >= 0 ? file.name.slice(dotIndex).toLowerCase() : "";
  if (!extensions.includes(ext)) {
    return {
      ok: false,
      error: `ไม่รองรับนามสกุลไฟล์ของ "${file.name}" (รองรับเฉพาะ .jpg, .jpeg, .png, .webp, .pdf, .doc, .docx)`,
    };
  }

  return { ok: true };
}
