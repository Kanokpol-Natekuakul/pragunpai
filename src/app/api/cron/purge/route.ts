import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    // 1. Verify Vercel Cron authorization header
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    // 2. Fetch leads that are expired, including their attachments to delete files on disk
    const expiredLeads = await prisma.lead.findMany({
      where: {
        expiresAt: { lte: now },
      },
      include: {
        attachments: true,
      },
    });

    if (expiredLeads.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No expired leads found to purge.",
        purgedCount: 0,
      });
    }

    let deletedFilesCount = 0;
    let failedFilesCount = 0;

    // 3. Purge file attachments from local disk
    for (const lead of expiredLeads) {
      for (const att of lead.attachments) {
        // Only delete if it's a local upload
        if (att.url.startsWith("/uploads/")) {
          const filePath = path.join(process.cwd(), "public", att.url);
          try {
            await fs.unlink(filePath);
            deletedFilesCount++;
          } catch (err) {
            console.error(`[Purge Cron] Failed to delete file: ${filePath}`, err);
            failedFilesCount++;
          }
        }
      }
    }

    // 4. Delete lead records from Database (Cascade deletes LeadAttachment records in DB)
    const purgeResult = await prisma.lead.deleteMany({
      where: {
        expiresAt: { lte: now },
      },
    });

    console.info(
      `[Purge Cron] Purged ${purgeResult.count} expired leads. Deleted ${deletedFilesCount} files on disk. (Failed files: ${failedFilesCount})`
    );

    return NextResponse.json({
      success: true,
      message: "Expired leads and files successfully purged.",
      leadsPurged: purgeResult.count,
      filesDeleted: deletedFilesCount,
      filesFailed: failedFilesCount,
    });
  } catch (error) {
    console.error("[Purge Cron] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
