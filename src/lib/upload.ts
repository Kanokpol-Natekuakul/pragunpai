import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { validateUpload } from "@/lib/upload-constraints";

export type UploadResult = {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
};

/**
 * Saves a file attachment locally in the public/uploads directory.
 * Validation (size, mimetype, extension) comes from lib/upload-constraints —
 * the single source of truth shared with client-side checks.
 * `allowedMimeTypes` narrows the allowlist (e.g. images only).
 */
export async function uploadAttachment(
  file: File,
  opts?: { allowedMimeTypes?: readonly string[] },
): Promise<UploadResult> {
  const validation = validateUpload(file, opts);
  if (!validation.ok) {
    throw new Error(validation.error);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const origExt = path.extname(file.name).toLowerCase();

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
    filename: file.name,
    size: file.size,
    mimeType: file.type,
  };
}
