interface RateLimitState {
  attempts: number;
  lockoutUntil: number | null;
}

const cache = new Map<string, RateLimitState>();

// Helper to clean up expired entries from the cache periodically
const globalObj = globalThis as typeof globalThis & {
  __rateLimitCleanupInterval?: ReturnType<typeof setInterval>;
};
if (!globalObj.__rateLimitCleanupInterval) {
  globalObj.__rateLimitCleanupInterval = setInterval(
    () => {
      const now = Date.now();
      for (const [key, state] of cache.entries()) {
        if (state.lockoutUntil && state.lockoutUntil < now) {
          cache.delete(key);
        }
      }
    },
    60 * 1000 * 15
  ); // Clean up every 15 minutes
}

/** Separate counters per flow so login failures never lock out password resets. */
export type RateLimitScope = "login" | "password-reset";

// The IP comes from x-forwarded-for, which a client can spoof when the app is
// not behind a trusted proxy. The email-only dimension is what actually holds:
// rotating the IP header gets a fresh ip key but never a fresh email key.
// Email threshold is higher so a spoofing attacker can't trivially lock the
// admin out (15-minute lockout is the accepted trade-off for that protection).
const IP_MAX_ATTEMPTS = 5;
const EMAIL_MAX_ATTEMPTS = 10;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

const LOCKOUT_MESSAGES: Record<
  RateLimitScope,
  (minutesLeft: number) => string
> = {
  login: (m) =>
    `ระงับการเข้าสู่ระบบชั่วคราวเนื่องจากพยายามเข้าสู่ระบบผิดพลาดเกินกำหนด กรุณาลองใหม่ในอีก ${m} นาที`,
  "password-reset": (m) =>
    `มีการขอรีเซ็ตรหัสผ่านบ่อยเกินไป กรุณาลองใหม่ในอีก ${m} นาที`,
};

function trackedKeys(scope: RateLimitScope, ip: string, email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  return [
    { key: `${scope}:ip:${ip}:${normalizedEmail}`, max: IP_MAX_ATTEMPTS },
    { key: `${scope}:email:${normalizedEmail}`, max: EMAIL_MAX_ATTEMPTS },
  ];
}

/**
 * Validates the rate limit state for a given client IP and email.
 * Returns { ok: true } or an error message.
 */
export function checkRateLimit(
  scope: RateLimitScope,
  ip: string,
  email: string
): { ok: true } | { ok: false; error: string } {
  const now = Date.now();
  for (const { key } of trackedKeys(scope, ip, email)) {
    const state = cache.get(key);
    if (state?.lockoutUntil && state.lockoutUntil > now) {
      const minutesLeft = Math.ceil((state.lockoutUntil - now) / 60000);
      return { ok: false, error: LOCKOUT_MESSAGES[scope](minutesLeft) };
    }
  }
  return { ok: true };
}

/**
 * Records a failed attempt for a given client IP and email.
 */
export function recordFailedAttempt(
  scope: RateLimitScope,
  ip: string,
  email: string
): void {
  for (const { key, max } of trackedKeys(scope, ip, email)) {
    const state = cache.get(key) || { attempts: 0, lockoutUntil: null };

    state.attempts += 1;
    if (state.attempts >= max) {
      state.lockoutUntil = Date.now() + LOCKOUT_DURATION;
    }

    cache.set(key, state);
  }
}

/**
 * Resets the rate limit state for a given client IP and email upon successful authentication.
 */
export function resetRateLimit(
  scope: RateLimitScope,
  ip: string,
  email: string
): void {
  for (const { key } of trackedKeys(scope, ip, email)) {
    cache.delete(key);
  }
}
