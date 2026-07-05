import { describe, it, expect, vi, beforeEach } from "vitest";
import { uploadAttachment } from "./upload";

vi.mock("fs", () => ({
  promises: {
    access: vi.fn().mockResolvedValue(undefined),
    mkdir: vi.fn().mockResolvedValue(undefined),
    writeFile: vi.fn().mockResolvedValue(undefined),
  },
}));

describe("uploadAttachment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should throw an error for unsupported mime-types", async () => {
    const file = new File(["test content"], "exploit.pdf", {
      type: "application/octet-stream",
    });
    await expect(uploadAttachment(file)).rejects.toThrow("ไม่รองรับประเภทไฟล์");
  });

  it("should throw an error for unsupported extensions even if mime-type is spoofed", async () => {
    const file = new File(["test content"], "exploit.php", {
      type: "application/pdf",
    });
    await expect(uploadAttachment(file)).rejects.toThrow(
      "ไม่รองรับนามสกุลไฟล์"
    );
  });

  it("should succeed and return safe unique name for valid mime-types and matching extensions", async () => {
    const file = new File(["test content"], "brochure.pdf", {
      type: "application/pdf",
    });
    const result = await uploadAttachment(file);

    expect(result.filename).toBe("brochure.pdf");
    expect(result.mimeType).toBe("application/pdf");
    expect(result.url).toMatch(/^\/uploads\/\d+-[0-9a-f-]+\.pdf$/);
  });
});
