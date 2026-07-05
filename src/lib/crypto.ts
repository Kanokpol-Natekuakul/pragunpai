import bcrypt from "bcryptjs";
import { randomBytes, randomInt } from "crypto";

/** Hash a password using bcrypt. */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/** Verify a password against a bcrypt hash. */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/** Generate a 6-digit numeric OTP code. */
export function generateOtp(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

/** Generate a URL-safe random token (for password reset). */
export function generateToken(): string {
  return randomBytes(32).toString("hex");
}

/** Hash a short secret (OTP / token) before storing in DB. */
export async function hashSecret(secret: string): Promise<string> {
  return bcrypt.hash(secret, 10);
}

/** Verify a short secret against its hash. */
export async function verifySecret(
  secret: string,
  hash: string | null | undefined
): Promise<boolean> {
  if (!hash) return false;
  return bcrypt.compare(secret, hash);
}
