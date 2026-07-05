import { describe, it, expect, vi, beforeEach } from "vitest";
import { submitLeadAction, updateLeadAction, deleteLeadAction } from "./leads";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthError } from "@/lib/auth";
import { sendLeadAlertEmail } from "@/lib/email";
import type { LeadStatus } from "@/generated/prisma/client";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    lead: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

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

vi.mock("@/lib/email", () => ({
  sendLeadAlertEmail: vi.fn(),
}));

vi.mock("@/lib/upload", () => ({
  uploadAttachment: vi.fn(),
}));

const mockPrisma = vi.mocked(prisma, true);
const mockRequireAuth = vi.mocked(requireAuth);
const mockSendLeadAlert = vi.mocked(sendLeadAlertEmail);

const session = {
  sub: "admin-1",
  email: "admin@pragunpai.com",
  name: "Admin",
  iat: 0,
  exp: 0,
};

function makeCarActForm(): FormData {
  const fd = new FormData();
  fd.append("formType", "CAR_ACT");
  fd.append("name", "สมชาย ใจดี");
  fd.append("phone", "0812345678");
  fd.append("carType", "เก๋ง");
  fd.append("carBrand", "Toyota");
  fd.append("carModel", "Vios");
  fd.append("carYear", "2020");
  fd.append("carPlate", "กข 1234");
  return fd;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "info").mockImplementation(() => {});
});

describe("submitLeadAction", () => {
  it("creates the lead with mapped fields and a PDPA expiry", async () => {
    vi.stubEnv("RECAPTCHA_SECRET_KEY", "");
    mockPrisma.lead.create.mockResolvedValue({ id: "lead-1" } as never);
    mockSendLeadAlert.mockResolvedValue({ ok: true });

    const res = await submitLeadAction(makeCarActForm());

    expect(res).toEqual({ success: true, leadId: "lead-1" });
    expect(mockPrisma.lead.create).toHaveBeenCalledOnce();
    const { data } = mockPrisma.lead.create.mock.calls[0][0];
    expect(data.formType).toBe("CAR_ACT");
    expect(data.name).toBe("สมชาย ใจดี");
    expect(data.phone).toBe("0812345678");
    expect(data.details).toMatchObject({ carBrand: "Toyota", carPlate: "กข 1234" });
    expect(data.expiresAt).toBeInstanceOf(Date);
    expect(mockSendLeadAlert).toHaveBeenCalledOnce();
  });

  it("marks the lead email-failed when the alert email does not send", async () => {
    vi.stubEnv("RECAPTCHA_SECRET_KEY", "");
    mockPrisma.lead.create.mockResolvedValue({ id: "lead-1" } as never);
    mockPrisma.lead.update.mockResolvedValue({ id: "lead-1" } as never);
    mockSendLeadAlert.mockResolvedValue({ ok: false, error: "smtp down" });

    const res = await submitLeadAction(makeCarActForm());

    expect(res).toEqual({ success: true, leadId: "lead-1" });
    expect(mockPrisma.lead.update).toHaveBeenCalledWith({
      where: { id: "lead-1" },
      data: { emailSent: false, emailError: "smtp down" },
    });
  });

  it("rejects the submission when recaptcha verification fails", async () => {
    vi.stubEnv("RECAPTCHA_SECRET_KEY", "prod-secret");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ success: false }),
      }),
    );

    const fd = makeCarActForm();
    fd.append("gRecaptchaToken", "bad-token");
    const res = await submitLeadAction(fd);

    expect(res.success).toBe(false);
    expect(mockPrisma.lead.create).not.toHaveBeenCalled();
  });
});

describe("updateLeadAction", () => {
  it("refuses and touches nothing when unauthenticated", async () => {
    mockRequireAuth.mockRejectedValue(new AuthError());

    const res = await updateLeadAction("lead-1", "CONTACTED" as LeadStatus, null);

    expect(res.success).toBe(false);
    expect(mockPrisma.lead.update).not.toHaveBeenCalled();
  });

  it("updates status and notes when authenticated", async () => {
    mockRequireAuth.mockResolvedValue(session);
    mockPrisma.lead.update.mockResolvedValue({ id: "lead-1" } as never);

    const res = await updateLeadAction("lead-1", "CONTACTED" as LeadStatus, "โทรแล้ว");

    expect(res).toEqual({ success: true, leadId: "lead-1" });
    expect(mockPrisma.lead.update).toHaveBeenCalledWith({
      where: { id: "lead-1" },
      data: { status: "CONTACTED", notes: "โทรแล้ว" },
    });
  });
});

describe("deleteLeadAction", () => {
  it("refuses and touches nothing when unauthenticated", async () => {
    mockRequireAuth.mockRejectedValue(new AuthError());

    const res = await deleteLeadAction("lead-1");

    expect(res.success).toBe(false);
    expect(mockPrisma.lead.delete).not.toHaveBeenCalled();
  });

  it("deletes the lead when authenticated", async () => {
    mockRequireAuth.mockResolvedValue(session);
    mockPrisma.lead.delete.mockResolvedValue({ id: "lead-1" } as never);

    const res = await deleteLeadAction("lead-1");

    expect(res).toEqual({ success: true });
    expect(mockPrisma.lead.delete).toHaveBeenCalledWith({ where: { id: "lead-1" } });
  });
});
