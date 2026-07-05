import { describe, it, expect, vi } from "vitest";
import { purgeExpiredLeads, PurgeDeps, ExpiredLead } from "./purge";

function makeDeps(
  leads: ExpiredLead[],
  overrides?: Partial<PurgeDeps>
): PurgeDeps {
  return {
    findExpiredLeads: vi.fn().mockResolvedValue(leads),
    deleteLeads: vi.fn(async (ids: string[]) => ids.length),
    deleteFile: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

const now = new Date("2026-07-05T00:00:00Z");

describe("purgeExpiredLeads", () => {
  it("returns zeros when nothing is expired", async () => {
    const deps = makeDeps([]);
    const result = await purgeExpiredLeads(now, deps);
    expect(result).toEqual({
      leadsPurged: 0,
      filesDeleted: 0,
      filesFailed: 0,
      leadsSkipped: 0,
    });
    expect(deps.deleteLeads).not.toHaveBeenCalled();
  });

  it("deletes files then lead rows", async () => {
    const deps = makeDeps([
      {
        id: "a",
        attachments: [{ url: "/uploads/1.pdf" }, { url: "/uploads/2.jpg" }],
      },
      { id: "b", attachments: [] },
    ]);
    const result = await purgeExpiredLeads(now, deps);
    expect(result).toEqual({
      leadsPurged: 2,
      filesDeleted: 2,
      filesFailed: 0,
      leadsSkipped: 0,
    });
    expect(deps.deleteLeads).toHaveBeenCalledWith(["a", "b"]);
  });

  it("keeps a lead for retry when one of its files fails to delete", async () => {
    const deps = makeDeps(
      [
        { id: "a", attachments: [{ url: "/uploads/ok.pdf" }] },
        { id: "b", attachments: [{ url: "/uploads/stuck.pdf" }] },
      ],
      {
        deleteFile: vi.fn(async (url: string) => {
          if (url.includes("stuck")) throw new Error("EBUSY");
        }),
      }
    );
    const result = await purgeExpiredLeads(now, deps);
    expect(result).toEqual({
      leadsPurged: 1,
      filesDeleted: 1,
      filesFailed: 1,
      leadsSkipped: 1,
    });
    // Only the lead whose files are all gone is deleted; "b" retries next run.
    expect(deps.deleteLeads).toHaveBeenCalledWith(["a"]);
  });

  it("ignores non-local attachment urls", async () => {
    const deps = makeDeps([
      { id: "a", attachments: [{ url: "https://cdn.example.com/x.pdf" }] },
    ]);
    const result = await purgeExpiredLeads(now, deps);
    expect(result.leadsPurged).toBe(1);
    expect(deps.deleteFile).not.toHaveBeenCalled();
  });
});
