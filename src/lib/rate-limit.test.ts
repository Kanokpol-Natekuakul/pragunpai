import { describe, it, expect, beforeEach, vi } from "vitest";
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from "./rate-limit";

describe("rate-limit utility", () => {
  const ip = "192.168.1.1";
  const email = "admin@example.com";

  beforeEach(() => {
    // Since cache is module-level, let's reset it by calling resetRateLimit
    resetRateLimit(ip, email);
  });

  it("should initially allow login attempts", () => {
    const status = checkRateLimit(ip, email);
    expect(status.ok).toBe(true);
  });

  it("should block attempts after 5 consecutive failures", () => {
    // Record 4 failed attempts
    for (let i = 0; i < 4; i++) {
      recordFailedAttempt(ip, email);
      expect(checkRateLimit(ip, email).ok).toBe(true);
    }

    // 5th failed attempt should trigger lockout
    recordFailedAttempt(ip, email);
    const status = checkRateLimit(ip, email);
    expect(status.ok).toBe(false);
    if (!status.ok) {
      expect(status.error).toContain("ระงับการเข้าสู่ระบบชั่วคราว");
    }
  });

  it("should reset the rate limit state when resetRateLimit is called", () => {
    // Lock it out
    for (let i = 0; i < 5; i++) {
      recordFailedAttempt(ip, email);
    }
    expect(checkRateLimit(ip, email).ok).toBe(false);

    // Reset it
    resetRateLimit(ip, email);
    expect(checkRateLimit(ip, email).ok).toBe(true);
  });
});
