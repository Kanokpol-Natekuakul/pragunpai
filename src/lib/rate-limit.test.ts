import { describe, it, expect } from "vitest";
import {
  checkRateLimit,
  recordFailedAttempt,
  resetRateLimit,
} from "./rate-limit";

// Module-level cache persists across tests — each test uses a unique email
// so state never leaks between cases.
describe("rate-limit utility", () => {
  const ip = "192.168.1.1";

  it("should initially allow login attempts", () => {
    const status = checkRateLimit("login", ip, "fresh@example.com");
    expect(status.ok).toBe(true);
  });

  it("should block attempts after 5 consecutive failures from one IP", () => {
    const email = "five-fails@example.com";
    for (let i = 0; i < 4; i++) {
      recordFailedAttempt("login", ip, email);
      expect(checkRateLimit("login", ip, email).ok).toBe(true);
    }

    recordFailedAttempt("login", ip, email);
    const status = checkRateLimit("login", ip, email);
    expect(status.ok).toBe(false);
    if (!status.ok) {
      expect(status.error).toContain("ระงับการเข้าสู่ระบบชั่วคราว");
    }
  });

  it("should lock the email even when the attacker rotates IPs (spoofed x-forwarded-for)", () => {
    const email = "rotating-ips@example.com";
    // 10 failures, each from a "different" IP — the ip:email key is always
    // fresh, but the email-only counter still accumulates.
    for (let i = 0; i < 10; i++) {
      recordFailedAttempt("login", `10.0.0.${i}`, email);
    }

    // A brand-new IP must still be blocked.
    const status = checkRateLimit("login", "203.0.113.99", email);
    expect(status.ok).toBe(false);
  });

  it("should normalize email case so casing variants share one counter", () => {
    const email = "case-test@example.com";
    for (let i = 0; i < 10; i++) {
      recordFailedAttempt(
        "login",
        `10.1.0.${i}`,
        i % 2 === 0 ? email : email.toUpperCase()
      );
    }
    expect(checkRateLimit("login", "203.0.113.1", email).ok).toBe(false);
  });

  it("should keep scopes independent", () => {
    const email = "scoped@example.com";
    for (let i = 0; i < 10; i++) {
      recordFailedAttempt("login", ip, email);
    }
    expect(checkRateLimit("login", ip, email).ok).toBe(false);
    // Login lockout must not block password-reset requests for the same email.
    expect(checkRateLimit("password-reset", ip, email).ok).toBe(true);
  });

  it("should use the password-reset message for that scope", () => {
    const email = "reset-msg@example.com";
    for (let i = 0; i < 10; i++) {
      recordFailedAttempt("password-reset", ip, email);
    }
    const status = checkRateLimit("password-reset", ip, email);
    expect(status.ok).toBe(false);
    if (!status.ok) {
      expect(status.error).toContain("ขอรีเซ็ตรหัสผ่านบ่อยเกินไป");
    }
  });

  it("should reset both dimensions when resetRateLimit is called", () => {
    const email = "reset-me@example.com";
    for (let i = 0; i < 10; i++) {
      recordFailedAttempt("login", ip, email);
    }
    expect(checkRateLimit("login", ip, email).ok).toBe(false);

    resetRateLimit("login", ip, email);
    expect(checkRateLimit("login", ip, email).ok).toBe(true);
  });
});
