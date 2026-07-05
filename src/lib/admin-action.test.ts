import { describe, it, expect, vi, beforeEach } from "vitest";
import { runAdminAction } from "./admin-action";
import { requireAuth, AuthError } from "@/lib/auth";

vi.mock("@/lib/auth", () => {
  class AuthError extends Error {
    constructor(message = "Unauthorized") {
      super(message);
      this.name = "AuthError";
    }
  }
  return {
    requireAuth: vi.fn(),
    AuthError,
  };
});

const mockRequireAuth = vi.mocked(requireAuth);

const session = {
  sub: "admin-1",
  email: "admin@pragunpai.com",
  name: "Admin",
  iat: 0,
  exp: 0,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("runAdminAction", () => {
  it("runs the body and returns its result when authenticated", async () => {
    mockRequireAuth.mockResolvedValue(session);
    const fn = vi.fn().mockResolvedValue({ success: true, leadId: "lead-1" });

    const res = await runAdminAction("testAction", "fallback", fn);

    expect(fn).toHaveBeenCalledOnce();
    expect(res).toEqual({ success: true, leadId: "lead-1" });
  });

  it("does NOT run the body when unauthenticated", async () => {
    mockRequireAuth.mockRejectedValue(new AuthError());
    const fn = vi.fn();

    const res = await runAdminAction("testAction", "fallback", fn);

    expect(fn).not.toHaveBeenCalled();
    expect(res.success).toBe(false);
    expect(res.error).toBe("Unauthorized");
  });

  it("returns the error envelope when the body throws an Error", async () => {
    mockRequireAuth.mockResolvedValue(session);
    const fn = vi.fn().mockRejectedValue(new Error("db exploded"));

    const res = await runAdminAction("testAction", "fallback", fn);

    expect(res).toEqual({ success: false, error: "db exploded" });
  });

  it("falls back to fallbackError when the body throws a non-Error", async () => {
    mockRequireAuth.mockResolvedValue(session);
    const fn = vi.fn().mockRejectedValue("string failure");

    const res = await runAdminAction("testAction", "เกิดข้อผิดพลาด", fn);

    expect(res).toEqual({ success: false, error: "เกิดข้อผิดพลาด" });
  });

  it("logs the action label on failure", async () => {
    mockRequireAuth.mockResolvedValue(session);
    const fn = vi.fn().mockRejectedValue(new Error("boom"));

    await runAdminAction("deleteLeadAction", "fallback", fn);

    expect(console.error).toHaveBeenCalledWith(
      "[deleteLeadAction] Error:",
      expect.any(Error),
    );
  });
});
