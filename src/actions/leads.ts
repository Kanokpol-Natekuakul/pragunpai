"use server";

import { prisma } from "@/lib/prisma";
import { uploadAttachment } from "@/lib/upload";
import { sendLeadAlertEmail } from "@/lib/email";
import { processLead } from "@/lib/lead-intake";
import { LeadFormType, LeadStatus, Prisma } from "@/generated/prisma/client";
import { runAdminAction } from "@/lib/admin-action";

// ---------------------------------------------------------------------------
// Recaptcha Verification Helper
// ---------------------------------------------------------------------------

async function verifyRecaptcha(token?: string | null): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    console.info(
      "[recaptcha] RECAPTCHA_SECRET_KEY not set — bypassing verification (dev mode)."
    );
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
// Thin adapter: parsing, validation, and orchestration live in
// lib/lead-intake.ts; this wires in the production I/O.

export async function submitLeadAction(formData: FormData) {
  return processLead(formData, {
    verifyRecaptcha,
    uploadAttachment,
    createLead: async (input) => {
      const lead = await prisma.lead.create({
        data: {
          formType: input.formType as LeadFormType,
          name: input.name,
          phone: input.phone,
          lineId: input.lineId,
          province: input.province,
          details: input.details as Prisma.InputJsonValue,
          expiresAt: input.expiresAt,
          attachments: {
            create: input.attachments.map((att) => ({
              url: att.url,
              filename: att.filename,
              size: att.size,
              mimeType: att.mimeType,
            })),
          },
        },
      });
      return { id: lead.id };
    },
    sendLeadAlert: sendLeadAlertEmail,
    markEmailFailed: async (leadId, error) => {
      await prisma.lead.update({
        where: { id: leadId },
        data: { emailSent: false, emailError: error },
      });
    },
  });
}

export async function updateLeadAction(
  id: string,
  status: LeadStatus,
  notes: string | null
) {
  return runAdminAction(
    "updateLeadAction",
    "เกิดข้อผิดพลาดในการอัปเดตข้อมูล",
    async () => {
      const lead = await prisma.lead.update({
        where: { id },
        data: {
          status,
          notes,
        },
      });

      return { success: true, leadId: lead.id };
    }
  );
}

export async function deleteLeadAction(id: string) {
  return runAdminAction(
    "deleteLeadAction",
    "เกิดข้อผิดพลาดในการลบข้อมูล",
    async () => {
      await prisma.lead.delete({
        where: { id },
      });

      return { success: true };
    }
  );
}
