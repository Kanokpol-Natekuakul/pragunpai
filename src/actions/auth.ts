"use server";

import { redirect } from "next/navigation";
import {
  loginStep1,
  loginStep2,
  requestPasswordReset,
  resetPassword,
  changePassword,
  logout,
  requireAuth,
} from "@/lib/auth";
import { AuthError } from "@/lib/auth";

// ---------------------------------------------------------------------------
// Login Step 1: email + password → send OTP
// ---------------------------------------------------------------------------
export async function actionLoginStep1(
  _prevState: unknown,
  formData: FormData,
) {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "กรุณากรอกอีเมลและรหัสผ่าน" };
  }

  const result = await loginStep1(email, password);
  if (!result.ok) return { error: result.error };
  return { success: true, email };
}

// ---------------------------------------------------------------------------
// Login Step 2: OTP verification
// ---------------------------------------------------------------------------
export async function actionLoginStep2(
  _prevState: unknown,
  formData: FormData,
) {
  const email = (formData.get("email") as string)?.trim();
  const otp = (formData.get("otp") as string)?.trim();

  if (!email || !otp) {
    return { error: "กรุณากรอกรหัส OTP" };
  }

  const result = await loginStep2(email, otp);
  if (!result.ok) return { error: result.error };

  const callbackUrl = "/admin/dashboard";
  redirect(callbackUrl);
}

// ---------------------------------------------------------------------------
// Forgot password
// ---------------------------------------------------------------------------
export async function actionForgotPassword(
  _prevState: unknown,
  formData: FormData,
) {
  const email = (formData.get("email") as string)?.trim();
  if (!email) {
    return { error: "กรุณากรอกอีเมล" };
  }

  const result = await requestPasswordReset(email);
  if (!result.ok) return { error: result.error };
  return { success: true };
}

// ---------------------------------------------------------------------------
// Reset password (from email link)
// ---------------------------------------------------------------------------
export async function actionResetPassword(
  _prevState: unknown,
  formData: FormData,
) {
  const token = (formData.get("token") as string)?.trim();
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!token || !password || !confirmPassword) {
    return { error: "กรุณากรอกข้อมูลให้ครบ" };
  }
  if (password.length < 8) {
    return { error: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" };
  }
  if (password !== confirmPassword) {
    return { error: "รหัสผ่านไม่ตรงกัน" };
  }

  const result = await resetPassword(token, password);
  if (!result.ok) return { error: result.error };

  redirect("/admin/login?reset=success");
}

// ---------------------------------------------------------------------------
// Change password (logged-in admin)
// ---------------------------------------------------------------------------
export async function actionChangePassword(
  _prevState: unknown,
  formData: FormData,
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

    const result = await changePassword(session.sub, currentPassword, newPassword);
    if (!result.ok) return { error: result.error };
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
