"use server";

import { redirect } from "next/navigation";
import {
  changePassword,
  logout,
  requireAuth,
  setSessionCookie,
} from "@/lib/auth";
import { AuthError } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ---------------------------------------------------------------------------
// NOTE: Login / forgot-password / reset-password go through the API routes
// under src/app/api/auth/* (called via fetch from the login pages).
// Rate limiting lives inside lib/auth.ts loginStep1/loginStep2.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Change password (logged-in admin)
// ---------------------------------------------------------------------------
export async function actionChangePassword(
  _prevState: unknown,
  formData: FormData
) {
  try {
    const session = await requireAuth();
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return { error: "กรุณากรอกข้อมูลให้ครบ" };
    }
    if (newPassword.length < 8) {
      return { error: "รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร" };
    }
    if (newPassword !== confirmPassword) {
      return { error: "รหัสผ่านใหม่ไม่ตรงกัน" };
    }

    const result = await changePassword(
      session.sub,
      currentPassword,
      newPassword
    );
    if (!result.ok) return { error: result.error };
    return { success: true };
  } catch (e) {
    if (e instanceof AuthError) redirect("/admin/login");
    return { error: "เกิดข้อผิดพลาด กรุณาลองอีกครั้ง" };
  }
}

// ---------------------------------------------------------------------------
// Update Profile (name + email)
// ---------------------------------------------------------------------------
export async function actionUpdateProfile(
  _prevState: unknown,
  formData: FormData
) {
  try {
    const session = await requireAuth();
    const name = (formData.get("name") as string)?.trim();
    const email = (formData.get("email") as string)?.trim();

    if (!name || !email) {
      return { error: "กรุณากรอกข้อมูลให้ครบ" };
    }

    // Check if email already exists (for other admin, if any)
    const existing = await prisma.admin.findUnique({ where: { email } });
    if (existing && existing.id !== session.sub) {
      return { error: "อีเมลนี้ถูกใช้งานโดยบัญชีอื่นแล้ว" };
    }

    // Update in database
    const updatedAdmin = await prisma.admin.update({
      where: { id: session.sub },
      data: { name, email },
    });

    // Update the session cookie with new email/name
    await setSessionCookie(updatedAdmin);

    return { success: true };
  } catch (e) {
    if (e instanceof AuthError) redirect("/admin/login");
    return { error: "เกิดข้อผิดพลาด กรุณาลองอีกครั้ง" };
  }
}

// ---------------------------------------------------------------------------
// Logout
// ---------------------------------------------------------------------------
export async function actionLogout() {
  await logout();
  redirect("/admin/login");
}
