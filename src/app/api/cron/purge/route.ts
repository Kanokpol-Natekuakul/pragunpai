import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { purgeExpiredLeads } from "@/lib/purge";
import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const uploadDir = path.join(process.cwd(), "public", "uploads");

export async function GET(request: Request) {
  try {
    // 1. Verify cron authorization. Fail closed in production: an unset
    // CRON_SECRET must not leave the endpoint open.
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      if (process.env.NODE_ENV === "production") {
        console.error(
          "[Purge Cron] CRON_SECRET is not configured — refusing to run."
        );
        return NextResponse.json(
          { error: "CRON_SECRET is not configured" },
          { status: 500 }
        );
      }
    } else if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2-4. Purge core lives in lib/purge.ts; production adapters below.
    const result = await purgeExpiredLeads(new Date(), {
      findExpiredLeads: (now) =>
        prisma.lead.findMany({
          where: { expiresAt: { lte: now } },
          select: { id: true, attachments: { select: { url: true } } },
        }),
      deleteLeads: async (ids) => {
        const res = await prisma.lead.deleteMany({
          where: { id: { in: ids } },
        });
        return res.count;
      },
      deleteFile: async (url) => {
        const filePath = path.resolve(path.join(process.cwd(), "public", url));
        // Attachment URLs are server-generated, but never follow one outside
        // the uploads directory.
        if (!filePath.startsWith(uploadDir + path.sep)) {
          throw new Error(`Refusing to delete outside uploads dir: ${url}`);
        }
        try {
          await fs.unlink(filePath);
        } catch (err) {
          // Already gone = purged. Anything else is a real failure.
          if ((err as NodeJS.ErrnoException).code === "ENOENT") return;
          throw err;
        }
      },
    });

    console.info(
      `[Purge Cron] Purged ${result.leadsPurged} expired leads. Deleted ${result.filesDeleted} files on disk. (Failed files: ${result.filesFailed}, leads kept for retry: ${result.leadsSkipped})`
    );

    return NextResponse.json({
      success: true,
      message:
        result.leadsPurged === 0 && result.leadsSkipped === 0
          ? "No expired leads found to purge."
          : "Expired leads and files purged.",
      leadsPurged: result.leadsPurged,
      filesDeleted: result.filesDeleted,
      filesFailed: result.filesFailed,
      leadsSkipped: result.leadsSkipped,
    });
  } catch (error) {
    console.error("[Purge Cron] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
