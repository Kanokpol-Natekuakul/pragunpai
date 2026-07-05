/**
 * Custom auth system for Pragunpai admin panel.
 *
 * Why custom instead of Auth.js + adapter?
 * - Auth.js PrismaAdapter doesn't support Prisma 7 (pg adapter pattern).
 * - We only have 1 admin user — a full OAuth library is overkill.
 * - This gives us full control over the OTP flow.
 *
 * Flow:
 * 1. Admin enters email + password → server verifies credentials.
 * 2. Server generates a 6-digit OTP, hashes it, stores hash + expiry in DB.
 * 3. OTP sent via Resend email.
 * 4. Admin enters OTP → server verifies against hashed OTP.
 * 5. On success, server sets a signed session cookie (iron + jose).
 * 6. Proxy (src/proxy.ts) checks the cookie on every /admin/* request.
 * 7. Forgot password: server generates a reset token, emails a link,
 *    admin clicks link → sets new password.
 *
 * Dependencies: next-auth (only for the iron session encryption),
 *               jose (for JWT-like cookie signing), bcryptjs, resend.
 */
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  verifyPassword,
  generateOtp,
  generateToken,
  hashSecret,
  verifySecret,
} from "@/lib/crypto";
import { sendOtpEmail, sendPasswordResetEmail } from "@/lib/email";
import { absoluteUrl } from "@/lib/site";
import {
  checkRateLimit,
  recordFailedAttempt,
  resetRateLimit,
} from "@/lib/rate-limit";

// ---------------------------------------------------------------------------
// Session cookie helpers
// ---------------------------------------------------------------------------

const SESSION_KEY = "pragunpai.session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/** JWT secret — must be >=32 chars */
function jwtSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("AUTH_SECRET must be set and at least 16 characters");
  }
  return new TextEncoder().encode(secret);
}

export type SessionPayload = {
  sub: string; // admin id
  email: string;
  name: string;
  iat: number;
  exp: number;
};

/** Verify and decode the session cookie. Returns null if invalid. */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_KEY)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, jwtSecret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/** Create a session cookie for an admin. */
async function createSession(admin: {
  id: string;
  email: string;
  name: string;
}) {
  const payload: Omit<SessionPayload, "iat" | "exp"> = {
    sub: admin.id,
    email: admin.email,
    name: admin.name,
  };

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(jwtSecret());

  return token;
}

/** Set the session cookie in the response. */
export async function setSessionCookie(admin: {
  id: string;
  email: string;
  name: string;
}) {
  const token = await createSession(admin);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_KEY, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

/** Delete the session cookie (logout). */
export async function deleteSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_KEY);
}

// ---------------------------------------------------------------------------
// Login flow: Step 1 — verify credentials + send OTP
// ---------------------------------------------------------------------------

export async function loginStep1(
  email: string,
  password: string,
  ip: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  // Rate limiting lives inside the auth module so no entry point can skip it.
  const rateLimitStatus = checkRateLimit("login", ip, email);
  if (!rateLimitStatus.ok) {
    return { ok: false, error: rateLimitStatus.error };
  }

  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) {
    // Don't reveal if email exists (security).
    recordFailedAttempt("login", ip, email);
    return { ok: false, error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" };
  }

  const valid = await verifyPassword(password, admin.passwordHash);
  if (!valid) {
    recordFailedAttempt("login", ip, email);
    return { ok: false, error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" };
  }

  // Generate OTP, hash it, store in DB.
  const otp = generateOtp();
  const otpHash = await hashSecret(otp);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await prisma.admin.update({
    where: { id: admin.id },
    data: { otpCodeHash: otpHash, otpExpiresAt: expiresAt },
  });

  // Send OTP email (degrades gracefully in dev).
  await sendOtpEmail(admin.email, admin.name, otp);

  return { ok: true };
}

// ---------------------------------------------------------------------------
// Login flow: Step 2 — verify OTP + create session
// ---------------------------------------------------------------------------

export async function loginStep2(
  email: string,
  otp: string,
  ip: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  // Rate limiting lives inside the auth module so no entry point can skip it.
  const rateLimitStatus = checkRateLimit("login", ip, email);
  if (!rateLimitStatus.ok) {
    return { ok: false, error: rateLimitStatus.error };
  }

  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin || !admin.otpCodeHash || !admin.otpExpiresAt) {
    recordFailedAttempt("login", ip, email);
    return { ok: false, error: "กรุณาเริ่มการเข้าสู่ระบบใหม่" };
  }

  if (admin.otpExpiresAt < new Date()) {
    return { ok: false, error: "รหัส OTP หมดอายุแล้ว กรุณาลองใหม่" };
  }

  const valid = await verifySecret(otp, admin.otpCodeHash);
  if (!valid) {
    recordFailedAttempt("login", ip, email);
    return { ok: false, error: "รหัส OTP ไม่ถูกต้อง" };
  }

  // Auth successful — reset the failed-attempts counter.
  resetRateLimit("login", ip, email);

  // Clear OTP after successful verification.
  await prisma.admin.update({
    where: { id: admin.id },
    data: { otpCodeHash: null, otpExpiresAt: null },
  });

  // Create session.
  await setSessionCookie(admin);
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Forgot password
// ---------------------------------------------------------------------------

export async function requestPasswordReset(
  email: string,
  ip: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  // Every request counts (not just failures) — this throttles email bombing
  // and reset-token churn, and applies whether or not the email exists so it
  // leaks nothing.
  const rateLimitStatus = checkRateLimit("password-reset", ip, email);
  if (!rateLimitStatus.ok) {
    return { ok: false, error: rateLimitStatus.error };
  }
  recordFailedAttempt("password-reset", ip, email);

  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) {
    return { ok: true }; // Don't reveal if email exists.
  }

  const token = generateToken();
  const tokenHash = await hashSecret(token);
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

  await prisma.admin.update({
    where: { id: admin.id },
    data: { resetTokenHash: tokenHash, resetExpiresAt: expiresAt },
  });

  const resetUrl = absoluteUrl(`/admin/reset-password?token=${token}`);
  await sendPasswordResetEmail(admin.email, admin.name, resetUrl);

  return { ok: true };
}

export async function resetPassword(
  token: string,
  newPassword: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  // Find admin with matching (non-expired) reset token.
  const admins = await prisma.admin.findMany({
    where: {
      resetExpiresAt: { gte: new Date() },
    },
  });

  for (const admin of admins) {
    if (!admin.resetTokenHash) continue;
    const valid = await verifySecret(token, admin.resetTokenHash);
    if (valid) {
      const passwordHash = await hashPassword(newPassword);
      await prisma.admin.update({
        where: { id: admin.id },
        data: {
          passwordHash,
          resetTokenHash: null,
          resetExpiresAt: null,
        },
      });
      return { ok: true };
    }
  }

  return { ok: false, error: "ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว" };
}

// ---------------------------------------------------------------------------
// Change password (for logged-in admin)
// ---------------------------------------------------------------------------

export async function changePassword(
  adminId: string,
  currentPassword: string,
  newPassword: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = await prisma.admin.findUnique({ where: { id: adminId } });
  if (!admin) {
    return { ok: false, error: "ไม่พบผู้ใช้" };
  }

  const valid = await verifyPassword(currentPassword, admin.passwordHash);
  if (!valid) {
    return { ok: false, error: "รหัสผ่านปัจจุบันไม่ถูกต้อง" };
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.admin.update({
    where: { id: adminId },
    data: { passwordHash },
  });

  return { ok: true };
}

// ---------------------------------------------------------------------------
// Logout
// ---------------------------------------------------------------------------

export async function logout() {
  await deleteSessionCookie();
}

// ---------------------------------------------------------------------------
// Require auth helper (for Server Components / Server Actions)
// ---------------------------------------------------------------------------

export async function requireAuth(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    throw new AuthError("Unauthorized");
  }
  return session;
}

export class AuthError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "AuthError";
  }
}
