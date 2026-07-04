import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

export type UploadResult = {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
};

/**
 * Saves a file attachment locally in the public/uploads directory.
 * Falls back to local disk storage if object storage is not configured.
 */
export async function uploadAttachment(file: File): Promise<UploadResult> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const size = file.size;
  const mimeType = file.type;
  const originalName = file.name;

  // Validate file size (max 5MB)
  const maxBytes = 5 * 1024 * 1024;
  if (size > maxBytes) {
    throw new Error(`ไฟล์ "${originalName}" มีขนาดใหญ่เกินไป (จำกัดไม่เกิน 5MB)`);
  }

  // Validate allowed extensions / mimetypes (images and documents)
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if (!allowedMimeTypes.includes(mimeType)) {
    throw new Error(`ไม่รองรับประเภทไฟล์ "${originalName}" (รองรับเฉพาะ JPG, PNG, WEBP, PDF, DOC, DOCX)`);
  }

  // Validate extension strictly
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".pdf", ".doc", ".docx"];
  const origExt = path.extname(originalName).toLowerCase();
  if (!allowedExtensions.includes(origExt)) {
    throw new Error(`ไม่รองรับนามสกุลไฟล์ของ "${originalName}" (รองรับเฉพาะ .jpg, .jpeg, .png, .webp, .pdf, .doc, .docx)`);
  }

  // Create local folder if it doesn't exist
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
  }

  // Generate safe unique name
  const randomId = crypto.randomUUID();
  const safeFilename = `${Date.now()}-${randomId}${origExt}`;
  const filePath = path.join(uploadDir, safeFilename);

  // Write file
  await fs.writeFile(filePath, buffer);

  // Return public URL path
  return {
    url: `/uploads/${safeFilename}`,
    filename: originalName,
    size,
    mimeType,
  };
}

function getExtFromMime(mime: string): string {
  switch (mime) {
    case "image/jpeg":
    case "image/jpg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "application/pdf":
      return ".pdf";
    case "application/msword":
      return ".doc";
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return ".docx";
    default:
      return ".bin";
  }
}
