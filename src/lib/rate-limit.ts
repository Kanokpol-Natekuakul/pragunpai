interface RateLimitState {
  attempts: number;
  lockoutUntil: number | null;
}

const cache = new Map<string, RateLimitState>();

// Helper to clean up expired entries from the cache periodically
if (typeof globalThis !== "undefined") {
  const globalObj = globalThis as any;
  if (!globalObj.__rateLimitCleanupInterval) {
    globalObj.__rateLimitCleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, state] of cache.entries()) {
        if (state.lockoutUntil && state.lockoutUntil < now) {
          cache.delete(key);
        }
      }
    }, 60 * 1000 * 15); // Clean up every 15 minutes
  }
}

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

/**
 * Validates the rate limit state for a given client IP and email.
 * Returns { ok: true } or an error message.
 */
export function checkRateLimit(ip: string, email: string): { ok: true } | { ok: false; error: string } {
  const key = `${ip}:${email}`;
  const state = cache.get(key);

  if (state) {
    const now = Date.now();
    if (state.lockoutUntil && state.lockoutUntil > now) {
      const minutesLeft = Math.ceil((state.lockoutUntil - now) / 60000);
      return {
        ok: false,
        error: `ระงับการเข้าสู่ระบบชั่วคราวเนื่องจากพยายามเข้าสู่ระบบผิดพลาดเกินกำหนด กรุณาลองใหม่ในอีก ${minutesLeft} นาที`,
      };
    }
  }

  return { ok: true };
}

/**
 * Records a failed attempt for a given client IP and email.
 */
export function recordFailedAttempt(ip: string, email: string): number {
  const key = `${ip}:${email}`;
  const state = cache.get(key) || { attempts: 0, lockoutUntil: null };

  state.attempts += 1;
  if (state.attempts >= MAX_ATTEMPTS) {
    state.lockoutUntil = Date.now() + LOCKOUT_DURATION;
  }

  cache.set(key, state);
  return state.attempts;
}

/**
 * Resets the rate limit state for a given client IP and email upon successful authentication.
 */
export function resetRateLimit(ip: string, email: string): void {
  const key = `${ip}:${email}`;
  cache.delete(key);
}
