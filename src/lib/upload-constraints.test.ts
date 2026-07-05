import { describe, it, expect } from "vitest";
import {
  validateUpload,
  MAX_UPLOAD_BYTES,
  IMAGE_MIME_TYPES,
  PDF_MIME_TYPES,
} from "./upload-constraints";

describe("validateUpload", () => {
  it("accepts a valid pdf", () => {
    const result = validateUpload({ name: "brochure.pdf", type: "application/pdf", size: 1024 });
    expect(result.ok).toBe(true);
  });

  it("rejects files over the size limit", () => {
    const result = validateUpload({
      name: "big.pdf",
      type: "application/pdf",
      size: MAX_UPLOAD_BYTES + 1,
    });
    expect(result).toMatchObject({ ok: false });
    if (!result.ok) expect(result.error).toContain("5MB");
  });

  it("rejects disallowed mimetypes", () => {
    const result = validateUpload({
      name: "exploit.pdf",
      type: "application/octet-stream",
      size: 10,
    });
    expect(result).toMatchObject({ ok: false });
    if (!result.ok) expect(result.error).toContain("ไม่รองรับประเภทไฟล์");
  });

  it("rejects extensions that do not match the declared mimetype", () => {
    const result = validateUpload({ name: "exploit.php", type: "application/pdf", size: 10 });
    expect(result).toMatchObject({ ok: false });
    if (!result.ok) expect(result.error).toContain("ไม่รองรับนามสกุลไฟล์");
  });

  it("rejects mismatched but individually-allowed pairs (png named .pdf)", () => {
    const result = validateUpload({ name: "image.pdf", type: "image/png", size: 10 });
    expect(result).toMatchObject({ ok: false });
  });

  it("narrows the allowlist via allowedMimeTypes", () => {
    const pdfAsImage = validateUpload(
      { name: "brochure.pdf", type: "application/pdf", size: 10 },
      { allowedMimeTypes: IMAGE_MIME_TYPES },
    );
    expect(pdfAsImage.ok).toBe(false);

    const pdfAsPdf = validateUpload(
      { name: "brochure.pdf", type: "application/pdf", size: 10 },
      { allowedMimeTypes: PDF_MIME_TYPES },
    );
    expect(pdfAsPdf.ok).toBe(true);
  });
});
