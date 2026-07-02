"use server";

import { prisma } from "@/lib/prisma";
import { uploadAttachment, UploadResult } from "@/lib/upload";
import { sendLeadAlertEmail } from "@/lib/email";
import { LeadFormType, LeadStatus } from "@/generated/prisma/client";
import { requireAuth } from "@/lib/auth";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Zod schemas for validation
// ---------------------------------------------------------------------------

const baseLeadSchema = z.object({
  name: z.string().min(2, "กรุณากรอกชื่อ-นามสกุล ของท่าน"),
  phone: z.string().regex(/^[0-9\-+\s]{9,15}$/, "กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง (9-15 หลัก)"),
  lineId: z.string().optional().nullable(),
  province: z.string().optional().nullable(),
  email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง").or(z.literal("")).optional().nullable(),
  note: z.string().optional().nullable(),
  gRecaptchaToken: z.string().optional().nullable(),
});

const carActSchema = baseLeadSchema.extend({
  carType: z.string().min(1, "กรุณาเลือกประเภทรถยนต์"),
  carBrand: z.string().min(1, "กรุณากรอกยี่ห้อรถยนต์"),
  carModel: z.string().min(1, "กรุณากรอกรุ่นรถยนต์"),
  carYear: z.string().min(1, "กรุณาเลือกปีจดทะเบียน"),
  carPlate: z.string().min(1, "กรุณากรอกเลขทะเบียนรถยนต์"),
});

const accidentSchema = baseLeadSchema.extend({
  age: z.string().min(1, "กรุณากรอกอายุ"),
  occupation: z.string().min(1, "กรุณากรอกอาชีพ"),
  hasExistingIllness: z.string().min(1, "กรุณาระบุประวัติสุขภาพ"),
  illnessDetails: z.string().optional().nullable(),
  selectedPlan: z.string().optional().nullable(),
});

const propertySchema = baseLeadSchema.extend({
  propertyType: z.string().min(1, "กรุณาเลือกประเภทสิ่งปลูกสร้าง"),
  constructionType: z.string().min(1, "กรุณาเลือกประเภทโครงสร้าง"),
  floorsCount: z.string().min(1, "กรุณากรอกจำนวนชั้น"),
  propertyValue: z.string().min(1, "กรุณากรอกมูลค่าทรัพย์สิน"),
  securitySystems: z.array(z.string()).optional(),
});

const otherSchema = baseLeadSchema.extend({
  requestType: z.string().min(1, "กรุณาเลือกหรือระบุประเภทประกัน"),
  description: z.string().min(1, "กรุณากรอกรายละเอียดความต้องการ"),
});

// ---------------------------------------------------------------------------
// Recaptcha Verification Helper
// ---------------------------------------------------------------------------

async function verifyRecaptcha(token?: string | null): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    console.info("[recaptcha] RECAPTCHA_SECRET_KEY not set — bypassing verification (dev mode).");
    return true;
  }

  if (!token) {
    return false;
  }

  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`,
    });
    const data = await res.json();
    // Google reCAPTCHA v3 returns a score. We accept >= 0.5.
    return !!data.success && (data.score === undefined || data.score >= 0.5);
  } catch (error) {
    console.error("[recaptcha] Verification error:", error);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Server Action: Submit Lead
// ---------------------------------------------------------------------------

export async function submitLeadAction(formData: FormData) {
  try {
    const formTypeStr = formData.get("formType") as string;
    if (!formTypeStr) {
      return { success: false, error: "ไม่พบประเภทฟอร์ม" };
    }

    // Parse base fields
    const rawData: Record<string, any> = {
      name: formData.get("name"),
      phone: formData.get("phone"),
      lineId: formData.get("lineId"),
      province: formData.get("province"),
      email: formData.get("email"),
      note: formData.get("note"),
      gRecaptchaToken: formData.get("gRecaptchaToken"),
    };

    // Verify reCAPTCHA
    const isCaptchaValid = await verifyRecaptcha(rawData.gRecaptchaToken);
    if (!isCaptchaValid) {
      return { success: false, error: "การตรวจสอบความปลอดภัย reCAPTCHA ล้มเหลว กรุณาลองใหม่อีกครั้ง" };
    }

    let formType: LeadFormType;
    let details: Record<string, any> = {};

    // Validate type-specific fields
    if (formTypeStr === "CAR_ACT") {
      formType = LeadFormType.CAR_ACT;
      rawData.carType = formData.get("carType");
      rawData.carBrand = formData.get("carBrand");
      rawData.carModel = formData.get("carModel");
      rawData.carYear = formData.get("carYear");
      rawData.carPlate = formData.get("carPlate");

      const validated = carActSchema.parse(rawData);
      details = {
        carType: validated.carType,
        carBrand: validated.carBrand,
        carModel: validated.carModel,
        carYear: validated.carYear,
        carPlate: validated.carPlate,
      };
    } else if (formTypeStr === "ACCIDENT") {
      formType = LeadFormType.ACCIDENT;
      rawData.age = formData.get("age");
      rawData.occupation = formData.get("occupation");
      rawData.hasExistingIllness = formData.get("hasExistingIllness");
      rawData.illnessDetails = formData.get("illnessDetails");
      rawData.selectedPlan = formData.get("selectedPlan");

      const validated = accidentSchema.parse(rawData);
      details = {
        age: validated.age,
        occupation: validated.occupation,
        hasExistingIllness: validated.hasExistingIllness,
        illnessDetails: validated.illnessDetails,
        selectedPlan: validated.selectedPlan,
      };
    } else if (formTypeStr === "PROPERTY") {
      formType = LeadFormType.PROPERTY;
      rawData.propertyType = formData.get("propertyType");
      rawData.constructionType = formData.get("constructionType");
      rawData.floorsCount = formData.get("floorsCount");
      rawData.propertyValue = formData.get("propertyValue");
      rawData.securitySystems = formData.getAll("securitySystems");

      const validated = propertySchema.parse(rawData);
      details = {
        propertyType: validated.propertyType,
        constructionType: validated.constructionType,
        floorsCount: validated.floorsCount,
        propertyValue: validated.propertyValue,
        securitySystems: validated.securitySystems,
      };
    } else {
      formType = LeadFormType.OTHER;
      rawData.requestType = formData.get("requestType");
      rawData.description = formData.get("description");

      const validated = otherSchema.parse(rawData);
      details = {
        requestType: validated.requestType,
        description: validated.description,
      };
    }

    // Process file attachments if any
    const files = formData.getAll("attachments") as File[];
    const uploadedAttachments: UploadResult[] = [];

    for (const file of files) {
      if (file && file.size > 0 && file.name) {
        try {
          const uploadResult = await uploadAttachment(file);
          uploadedAttachments.push(uploadResult);
        } catch (uploadErr: any) {
          return { success: false, error: uploadErr.message || "เกิดข้อผิดพลาดในการอัปโหลดไฟล์" };
        }
      }
    }

    // Set expiry to 30 days (PDPA Requirement)
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Create lead in Database
    const lead = await prisma.lead.create({
      data: {
        formType,
        name: rawData.name,
        phone: rawData.phone,
        lineId: rawData.lineId || null,
        province: rawData.province || null,
        details: details as any,
        expiresAt,
        attachments: {
          create: uploadedAttachments.map((att) => ({
            url: att.url,
            filename: att.filename,
            size: att.size,
            mimeType: att.mimeType,
          })),
        },
      },
    });

    // Send lead-alert email via Resend
    const emailResult = await sendLeadAlertEmail({
      formType,
      name: rawData.name,
      phone: rawData.phone,
      lineId: rawData.lineId,
      province: rawData.province,
      details,
      note: rawData.note || undefined,
    });

    // Update lead with email status
    if (!emailResult.ok) {
      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          emailSent: false,
          emailError: emailResult.error || "Failed to send email alert",
        },
      });
    }

    return { success: true, leadId: lead.id };
  } catch (error: any) {
    console.error("[submitLeadAction] Error:", error);
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0]?.message || "ข้อมูลไม่ถูกต้อง";
      return { success: false, error: firstError };
    }
    return { success: false, error: error.message || "เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้ง" };
  }
}

export async function updateLeadAction(id: string, status: LeadStatus, notes: string | null) {
  try {
    await requireAuth();

    const lead = await prisma.lead.update({
      where: { id },
      data: {
        status,
        notes,
      },
    });

    return { success: true, leadId: lead.id };
  } catch (error: any) {
    console.error("[updateLeadAction] Error:", error);
    return { success: false, error: error.message || "เกิดข้อผิดพลาดในการอัปเดตข้อมูล" };
  }
}

export async function deleteLeadAction(id: string) {
  try {
    await requireAuth();

    await prisma.lead.delete({
      where: { id },
    });

    return { success: true };
  } catch (error: any) {
    console.error("[deleteLeadAction] Error:", error);
    return { success: false, error: error.message || "เกิดข้อผิดพลาดในการลบข้อมูล" };
  }
}
