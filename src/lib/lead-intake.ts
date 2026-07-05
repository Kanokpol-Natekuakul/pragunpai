/**
 * Lead intake core — parsing, validation, and orchestration for the public
 * quote form. Pure of I/O: prisma, email, upload, and recaptcha reach this
 * module only through the injected LeadIntakeDeps, so the whole flow is
 * testable with in-memory fakes (see lead-intake.test.ts).
 */
import { z } from "zod";
import type { UploadResult } from "@/lib/upload";

// ---------------------------------------------------------------------------
// Zod schemas for validation
// ---------------------------------------------------------------------------

export const baseLeadSchema = z.object({
  name: z.string().min(2, "กรุณากรอกชื่อ-นามสกุล ของท่าน"),
  phone: z
    .string()
    .regex(
      /^[0-9\-+\s]{9,15}$/,
      "กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง (9-15 หลัก)"
    ),
  lineId: z.string().optional().nullable(),
  province: z.string().optional().nullable(),
  email: z
    .string()
    .email("รูปแบบอีเมลไม่ถูกต้อง")
    .or(z.literal(""))
    .optional()
    .nullable(),
  note: z.string().optional().nullable(),
  gRecaptchaToken: z.string().optional().nullable(),
});

export const carActSchema = baseLeadSchema.extend({
  carType: z.string().min(1, "กรุณาเลือกประเภทรถยนต์"),
  carBrand: z.string().min(1, "กรุณากรอกยี่ห้อรถยนต์"),
  carModel: z.string().min(1, "กรุณากรอกรุ่นรถยนต์"),
  carYear: z.string().min(1, "กรุณาเลือกปีจดทะเบียน"),
  carPlate: z.string().min(1, "กรุณากรอกเลขทะเบียนรถยนต์"),
});

export const accidentSchema = baseLeadSchema.extend({
  age: z.string().min(1, "กรุณากรอกอายุ"),
  occupation: z.string().min(1, "กรุณากรอกอาชีพ"),
  hasExistingIllness: z.string().min(1, "กรุณาระบุประวัติสุขภาพ"),
  illnessDetails: z.string().optional().nullable(),
  selectedPlan: z.string().optional().nullable(),
});

export const propertySchema = baseLeadSchema.extend({
  propertyType: z.string().min(1, "กรุณาเลือกประเภทสิ่งปลูกสร้าง"),
  constructionType: z.string().min(1, "กรุณาเลือกประเภทโครงสร้าง"),
  floorsCount: z.string().min(1, "กรุณากรอกจำนวนชั้น"),
  propertyValue: z.string().min(1, "กรุณากรอกมูลค่าทรัพย์สิน"),
  securitySystems: z.array(z.string()).optional(),
});

export const otherSchema = baseLeadSchema.extend({
  requestType: z.string().min(1, "กรุณาเลือกหรือระบุประเภทประกัน"),
  description: z.string().min(1, "กรุณากรอกรายละเอียดความต้องการ"),
});

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

/** String union mirroring the Prisma LeadFormType enum (kept prisma-free
 *  so this module can also be imported from client code). */
export type LeadFormTypeValue = "CAR_ACT" | "ACCIDENT" | "PROPERTY" | "OTHER";

export type LeadDetails = Record<string, unknown>;

export type RawLeadData = ReturnType<typeof parseLeadForm>["rawData"];

/** Pure FormData → plain object extraction. No validation, no I/O. */
export function parseLeadForm(formData: FormData) {
  const formTypeStr = (formData.get("formType") as string | null) || null;

  const rawData = {
    name: formData.get("name") as string,
    phone: formData.get("phone") as string,
    lineId: formData.get("lineId") as string | null,
    province: formData.get("province") as string | null,
    email: formData.get("email") as string | null,
    note: formData.get("note") as string | null,
    gRecaptchaToken: formData.get("gRecaptchaToken") as string | null,
    carType: formData.get("carType") as string | null,
    carBrand: formData.get("carBrand") as string | null,
    carModel: formData.get("carModel") as string | null,
    carYear: formData.get("carYear") as string | null,
    carPlate: formData.get("carPlate") as string | null,
    age: formData.get("age") as string | null,
    occupation: formData.get("occupation") as string | null,
    hasExistingIllness: formData.get("hasExistingIllness") as string | null,
    illnessDetails: formData.get("illnessDetails") as string | null,
    selectedPlan: formData.get("selectedPlan") as string | null,
    propertyType: formData.get("propertyType") as string | null,
    constructionType: formData.get("constructionType") as string | null,
    floorsCount: formData.get("floorsCount") as string | null,
    propertyValue: formData.get("propertyValue") as string | null,
    securitySystems: formData.getAll("securitySystems") as string[],
    requestType: formData.get("requestType") as string | null,
    description: formData.get("description") as string | null,
  };

  const files = (formData.getAll("attachments") as File[]).filter(
    (file) => file && file.size > 0 && file.name
  );

  return { formTypeStr, rawData, files };
}

/**
 * Pure validation + details mapping per form type.
 * Throws ZodError on invalid input.
 */
export function buildLeadDetails(
  formTypeStr: string,
  rawData: RawLeadData
): { formType: LeadFormTypeValue; details: LeadDetails } {
  if (formTypeStr === "CAR_ACT") {
    const validated = carActSchema.parse(rawData);
    return {
      formType: "CAR_ACT",
      details: {
        carType: validated.carType,
        carBrand: validated.carBrand,
        carModel: validated.carModel,
        carYear: validated.carYear,
        carPlate: validated.carPlate,
      },
    };
  }
  if (formTypeStr === "ACCIDENT") {
    const validated = accidentSchema.parse(rawData);
    return {
      formType: "ACCIDENT",
      details: {
        age: validated.age,
        occupation: validated.occupation,
        hasExistingIllness: validated.hasExistingIllness,
        illnessDetails: validated.illnessDetails,
        selectedPlan: validated.selectedPlan,
      },
    };
  }
  if (formTypeStr === "PROPERTY") {
    const validated = propertySchema.parse(rawData);
    return {
      formType: "PROPERTY",
      details: {
        propertyType: validated.propertyType,
        constructionType: validated.constructionType,
        floorsCount: validated.floorsCount,
        propertyValue: validated.propertyValue,
        securitySystems: validated.securitySystems,
      },
    };
  }
  const validated = otherSchema.parse(rawData);
  return {
    formType: "OTHER",
    details: {
      requestType: validated.requestType,
      description: validated.description,
    },
  };
}

// ---------------------------------------------------------------------------
// Orchestration over injected I/O
// ---------------------------------------------------------------------------

export type NewLeadInput = {
  formType: LeadFormTypeValue;
  name: string;
  phone: string;
  lineId: string | null;
  province: string | null;
  details: LeadDetails;
  expiresAt: Date;
  attachments: UploadResult[];
};

export type LeadIntakeDeps = {
  verifyRecaptcha(token?: string | null): Promise<boolean>;
  uploadAttachment(file: File): Promise<UploadResult>;
  createLead(input: NewLeadInput): Promise<{ id: string }>;
  sendLeadAlert(payload: {
    formType: LeadFormTypeValue;
    name: string;
    phone: string;
    lineId?: string | null;
    province?: string | null;
    details: LeadDetails;
    note?: string;
  }): Promise<{ ok: boolean; error?: string }>;
  markEmailFailed(leadId: string, error: string): Promise<void>;
};

export type LeadIntakeResult =
  { success: true; leadId: string } | { success: false; error: string };

const LEAD_RETENTION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days (PDPA requirement)

export async function processLead(
  formData: FormData,
  deps: LeadIntakeDeps
): Promise<LeadIntakeResult> {
  try {
    const { formTypeStr, rawData, files } = parseLeadForm(formData);
    if (!formTypeStr) {
      return { success: false, error: "ไม่พบประเภทฟอร์ม" };
    }

    const isCaptchaValid = await deps.verifyRecaptcha(rawData.gRecaptchaToken);
    if (!isCaptchaValid) {
      return {
        success: false,
        error: "การตรวจสอบความปลอดภัย reCAPTCHA ล้มเหลว กรุณาลองใหม่อีกครั้ง",
      };
    }

    const { formType, details } = buildLeadDetails(formTypeStr, rawData);

    const uploadedAttachments: UploadResult[] = [];
    for (const file of files) {
      try {
        uploadedAttachments.push(await deps.uploadAttachment(file));
      } catch (uploadErr) {
        const err = uploadErr as Error;
        return {
          success: false,
          error: err.message || "เกิดข้อผิดพลาดในการอัปเดตไฟล์",
        };
      }
    }

    const lead = await deps.createLead({
      formType,
      name: rawData.name,
      phone: rawData.phone,
      lineId: rawData.lineId || null,
      province: rawData.province || null,
      details,
      expiresAt: new Date(Date.now() + LEAD_RETENTION_MS),
      attachments: uploadedAttachments,
    });

    const emailResult = await deps.sendLeadAlert({
      formType,
      name: rawData.name,
      phone: rawData.phone,
      lineId: rawData.lineId,
      province: rawData.province,
      details,
      note: rawData.note || undefined,
    });

    if (!emailResult.ok) {
      await deps.markEmailFailed(
        lead.id,
        emailResult.error || "Failed to send email alert"
      );
    }

    return { success: true, leadId: lead.id };
  } catch (error) {
    console.error("[processLead] Error:", error);
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0]?.message || "ข้อมูลไม่ถูกต้อง";
      return { success: false, error: firstError };
    }
    const err = error as Error;
    return {
      success: false,
      error: err.message || "เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้ง",
    };
  }
}
