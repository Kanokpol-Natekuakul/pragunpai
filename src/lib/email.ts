/**
 * Email service — wraps Resend for transactional mail.
 * - Lead-alert emails go to the service mailbox (service@pragunpai.com).
 * - OTP / reset emails go to the admin.
 *
 * Always degrades gracefully: if RESEND_API_KEY is missing (dev),
 * the function resolves with a logged-only result instead of throwing.
 */
import { Resend } from "resend";
import { siteConfig } from "./site";
import { leadFormTypeLabel } from "./format";

type LeadAlertInput = {
  formType: string;
  name: string;
  phone: string;
  lineId?: string | null;
  province?: string | null;
  details?: Record<string, unknown> | null;
  note?: string;
};

let client: Resend | null = null;
function getClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!client) client = new Resend(key);
  return client;
}

/** Build a readable HTML table for lead details. */
function detailsToHtml(details?: Record<string, unknown> | null): string {
  if (!details) return "";
  const rows = Object.entries(details)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px;border:1px solid #e5e7eb;font-weight:600;background:#f9fafb;">${escapeHtml(
          k,
        )}</td><td style="padding:6px 12px;border:1px solid #e5e7eb;">${escapeHtml(
          String(v),
        )}</td></tr>`,
    )
    .join("");
  return rows ? `<table style="border-collapse:collapse;font-size:14px;margin:8px 0;">${rows}</table>` : "";
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendLeadAlertEmail(
  lead: LeadAlertInput,
): Promise<{ ok: boolean; error?: string }> {
  const resend = getClient();
  if (!resend) {
    console.info("[email] RESEND_API_KEY not set — skipping lead alert email (dev mode).");
    return { ok: false, error: "RESEND_API_KEY missing" };
  }

  const to = process.env.LEAD_ALERT_TO ?? siteConfig.email;
  const from = process.env.EMAIL_FROM ?? `${siteConfig.name} <no-reply@${siteConfig.domain}>`;
  const subject = `[Lead ใหม่] ${leadFormTypeLabel[lead.formType] ?? lead.formType} — ${lead.name}`;

  const html = `
    <div style="font-family:system-ui,sans-serif;color:#182841;max-width:600px;">
      <h2 style="color:#283e6c;margin-bottom:4px;">มี Lead ใหม่จากเว็บไซต์ ${siteConfig.name}</h2>
      <p style="color:#6b7280;margin-top:0;">กรุณาติดต่อกลับลูกค้าโดยเร็ว</p>
      <table style="border-collapse:collapse;font-size:14px;margin:8px 0;">
        <tr><td style="padding:6px 12px;border:1px solid #e5e7eb;font-weight:600;background:#f9fafb;">ประเภท</td><td style="padding:6px 12px;border:1px solid #e5e7eb;">${leadFormTypeLabel[lead.formType] ?? lead.formType}</td></tr>
        <tr><td style="padding:6px 12px;border:1px solid #e5e7eb;font-weight:600;background:#f9fafb;">ชื่อ</td><td style="padding:6px 12px;border:1px solid #e5e7eb;">${escapeHtml(lead.name)}</td></tr>
        <tr><td style="padding:6px 12px;border:1px solid #e5e7eb;font-weight:600;background:#f9fafb;">เบอร์โทร</td><td style="padding:6px 12px;border:1px solid #e5e7eb;">${escapeHtml(lead.phone)}</td></tr>
        ${lead.lineId ? `<tr><td style="padding:6px 12px;border:1px solid #e5e7eb;font-weight:600;background:#f9fafb;">LINE ID</td><td style="padding:6px 12px;border:1px solid #e5e7eb;">${escapeHtml(lead.lineId)}</td></tr>` : ""}
        ${lead.province ? `<tr><td style="padding:6px 12px;border:1px solid #e5e7eb;font-weight:600;background:#f9fafb;">จังหวัด</td><td style="padding:6px 12px;border:1px solid #e5e7eb;">${escapeHtml(lead.province)}</td></tr>` : ""}
      </table>
      ${detailsToHtml(lead.details as Record<string, unknown>)}
      ${lead.note ? `<p><strong>หมายเหตุ:</strong> ${escapeHtml(lead.note)}</p>` : ""}
      <p style="margin-top:24px;font-size:12px;color:#9ca3af;">อีเมลนี้ส่งอัตโนมัติจาก ${siteConfig.url}</p>
    </div>
  `;

  try {
    const { error } = await resend.emails.send({ from, to, subject, html });
    if (error) {
      console.error("[email] lead alert failed:", error.message);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (e) {
    console.error("[email] lead alert threw:", e);
    return { ok: false, error: e instanceof Error ? e.message : "unknown" };
  }
}

export async function sendOtpEmail(
  to: string,
  name: string,
  code: string,
): Promise<{ ok: boolean; error?: string }> {
  const resend = getClient();
  if (!resend) {
    console.info("[email] RESEND_API_KEY not set — skipping OTP email (dev mode). OTP is:", code);
    return { ok: false, error: "RESEND_API_KEY missing" };
  }

  const from = process.env.EMAIL_FROM ?? `${siteConfig.name} <no-reply@${siteConfig.domain}>`;
  const html = `
    <div style="font-family:system-ui,sans-serif;color:#182841;max-width:500px;">
      <h2 style="color:#283e6c;">รหัสยืนยันตัวตน (OTP) — ${siteConfig.name}</h2>
      <p>สวัสดี ${escapeHtml(name)},</p>
      <p>รหัส OTP สำหรับเข้าสู่ระบบหลังบ้านของคุณคือ:</p>
      <p style="font-size:32px;font-weight:700;letter-spacing:6px;color:#fe5c16;">${escapeHtml(code)}</p>
      <p style="color:#6b7280;font-size:13px;">รหัสนี้จะหมดอายุใน 10 นาที หากคุณไม่ได้เป็นผู้ขอรหัส กรุณาเพิกเฉยต่ออีเมลนี้</p>
    </div>
  `;

  try {
    const { error } = await resend.emails.send({
      from,
      to,
      subject: `รหัส OTP สำหรับเข้าสู่ระบบ — ${siteConfig.name}`,
      html,
    });
    if (error) {
      console.error("[email] OTP failed:", error.message);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (e) {
    console.error("[email] OTP threw:", e);
    return { ok: false, error: e instanceof Error ? e.message : "unknown" };
  }
}

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  resetUrl: string,
): Promise<{ ok: boolean; error?: string }> {
  const resend = getClient();
  if (!resend) {
    console.info("[email] RESEND_API_KEY not set — skipping reset email (dev). URL:", resetUrl);
    return { ok: false, error: "RESEND_API_KEY missing" };
  }

  const from = process.env.EMAIL_FROM ?? `${siteConfig.name} <no-reply@${siteConfig.domain}>`;
  const html = `
    <div style="font-family:system-ui,sans-serif;color:#182841;max-width:500px;">
      <h2 style="color:#283e6c;">ตั้งรหัสผ่านใหม่ — ${siteConfig.name}</h2>
      <p>สวัสดี ${escapeHtml(name)},</p>
      <p>คุณได้ร้องขอการตั้งรหัสผ่านใหม่ คลิกปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่ (หมดอายุใน 30 นาที):</p>
      <p><a href="${resetUrl}" style="display:inline-block;background:#fe5c16;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">ตั้งรหัสผ่านใหม่</a></p>
      <p style="color:#6b7280;font-size:13px;">หรือคัดลอกลิงก์นี้: ${escapeHtml(resetUrl)}</p>
      <p style="color:#6b7280;font-size:13px;">หากคุณไม่ได้เป็นผู้ร้องขอ กรุณาเพิกเฉยต่ออีเมลนี้</p>
    </div>
  `;

  try {
    const { error } = await resend.emails.send({
      from,
      to,
      subject: `ตั้งรหัสผ่านใหม่ — ${siteConfig.name}`,
      html,
    });
    if (error) {
      console.error("[email] reset failed:", error.message);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (e) {
    console.error("[email] reset threw:", e);
    return { ok: false, error: e instanceof Error ? e.message : "unknown" };
  }
}
