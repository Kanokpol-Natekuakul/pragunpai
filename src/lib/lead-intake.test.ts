import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  processLead,
  parseLeadForm,
  buildLeadDetails,
  LeadIntakeDeps,
} from "./lead-intake";
import type { UploadResult } from "./upload";

function makeFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    fd.append(key, value);
  }
  return fd;
}

const validCarAct = {
  formType: "CAR_ACT",
  name: "สมชาย ใจดี",
  phone: "0812345678",
  carType: "เก๋ง",
  carBrand: "Toyota",
  carModel: "Vios",
  carYear: "2020",
  carPlate: "กข 1234",
};

function makeDeps(overrides?: Partial<LeadIntakeDeps>): LeadIntakeDeps {
  return {
    verifyRecaptcha: vi.fn().mockResolvedValue(true),
    uploadAttachment: vi.fn().mockResolvedValue({
      url: "/uploads/x.pdf",
      filename: "x.pdf",
      size: 10,
      mimeType: "application/pdf",
    } satisfies UploadResult),
    createLead: vi.fn().mockResolvedValue({ id: "lead-1" }),
    sendLeadAlert: vi.fn().mockResolvedValue({ ok: true }),
    markEmailFailed: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe("parseLeadForm", () => {
  it("extracts formType, fields, and skips empty attachments", () => {
    const fd = makeFormData(validCarAct);
    const { formTypeStr, rawData, files } = parseLeadForm(fd);
    expect(formTypeStr).toBe("CAR_ACT");
    expect(rawData.name).toBe("สมชาย ใจดี");
    expect(rawData.carPlate).toBe("กข 1234");
    expect(files).toEqual([]);
  });
});

describe("buildLeadDetails", () => {
  it("maps CAR_ACT fields into details", () => {
    const { rawData } = parseLeadForm(makeFormData(validCarAct));
    const { formType, details } = buildLeadDetails("CAR_ACT", rawData);
    expect(formType).toBe("CAR_ACT");
    expect(details).toEqual({
      carType: "เก๋ง",
      carBrand: "Toyota",
      carModel: "Vios",
      carYear: "2020",
      carPlate: "กข 1234",
    });
  });

  it("throws ZodError with Thai message for invalid phone", () => {
    const { rawData } = parseLeadForm(
      makeFormData({ ...validCarAct, phone: "abc" })
    );
    expect(() => buildLeadDetails("CAR_ACT", rawData)).toThrowError(
      /เบอร์โทรศัพท์/
    );
  });

  it("falls back to OTHER schema for unknown form types", () => {
    const { rawData } = parseLeadForm(
      makeFormData({
        name: "สมหญิง",
        phone: "0812345678",
        requestType: "ประกันเดินทาง",
        description: "อยากได้ใบเสนอราคา",
      })
    );
    const { formType, details } = buildLeadDetails("UNKNOWN", rawData);
    expect(formType).toBe("OTHER");
    expect(details.requestType).toBe("ประกันเดินทาง");
  });
});

describe("processLead", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a lead and sends the alert email on the happy path", async () => {
    const deps = makeDeps();
    const result = await processLead(makeFormData(validCarAct), deps);

    expect(result).toEqual({ success: true, leadId: "lead-1" });
    expect(deps.createLead).toHaveBeenCalledOnce();
    const input = vi.mocked(deps.createLead).mock.calls[0][0];
    expect(input.formType).toBe("CAR_ACT");
    expect(input.name).toBe("สมชาย ใจดี");
    expect(input.expiresAt.getTime()).toBeGreaterThan(Date.now());
    expect(deps.sendLeadAlert).toHaveBeenCalledOnce();
    expect(deps.markEmailFailed).not.toHaveBeenCalled();
  });

  it("rejects when formType is missing", async () => {
    const deps = makeDeps();
    const result = await processLead(makeFormData({ name: "x" }), deps);
    expect(result).toEqual({ success: false, error: "ไม่พบประเภทฟอร์ม" });
    expect(deps.createLead).not.toHaveBeenCalled();
  });

  it("rejects when recaptcha fails, before any I/O", async () => {
    const deps = makeDeps({
      verifyRecaptcha: vi.fn().mockResolvedValue(false),
    });
    const result = await processLead(makeFormData(validCarAct), deps);
    expect(result.success).toBe(false);
    expect(deps.createLead).not.toHaveBeenCalled();
    expect(deps.sendLeadAlert).not.toHaveBeenCalled();
  });

  it("returns the first Thai validation message for invalid input", async () => {
    const deps = makeDeps();
    const result = await processLead(
      makeFormData({ ...validCarAct, carBrand: "" }),
      deps
    );
    expect(result).toEqual({ success: false, error: "กรุณากรอกยี่ห้อรถยนต์" });
    expect(deps.createLead).not.toHaveBeenCalled();
  });

  it("uploads attachments and passes them to createLead", async () => {
    const deps = makeDeps();
    const fd = makeFormData(validCarAct);
    fd.append(
      "attachments",
      new File(["data"], "doc.pdf", { type: "application/pdf" })
    );

    const result = await processLead(fd, deps);
    expect(result.success).toBe(true);
    expect(deps.uploadAttachment).toHaveBeenCalledOnce();
    const input = vi.mocked(deps.createLead).mock.calls[0][0];
    expect(input.attachments).toHaveLength(1);
    expect(input.attachments[0].url).toBe("/uploads/x.pdf");
  });

  it("surfaces upload errors and does not create the lead", async () => {
    const deps = makeDeps({
      uploadAttachment: vi.fn().mockRejectedValue(new Error("ไฟล์ใหญ่เกินไป")),
    });
    const fd = makeFormData(validCarAct);
    fd.append(
      "attachments",
      new File(["data"], "doc.pdf", { type: "application/pdf" })
    );

    const result = await processLead(fd, deps);
    expect(result).toEqual({ success: false, error: "ไฟล์ใหญ่เกินไป" });
    expect(deps.createLead).not.toHaveBeenCalled();
  });

  it("marks email failure on the lead but still succeeds", async () => {
    const deps = makeDeps({
      sendLeadAlert: vi
        .fn()
        .mockResolvedValue({ ok: false, error: "smtp down" }),
    });
    const result = await processLead(makeFormData(validCarAct), deps);
    expect(result).toEqual({ success: true, leadId: "lead-1" });
    expect(deps.markEmailFailed).toHaveBeenCalledWith("lead-1", "smtp down");
  });
});
