/**
 * Expired-lead purge core (PDPA 30-day retention). Pure of I/O — the DB and
 * filesystem reach it only through PurgeDeps, so the retention rules are
 * testable with fakes (see purge.test.ts).
 *
 * Retention rule: a lead's DB row is deleted only after every local
 * attachment file is gone. If a file deletion fails, the lead is kept so the
 * next run retries — otherwise the file (personal data) would be orphaned on
 * disk with no record pointing at it.
 */

export type ExpiredLead = {
  id: string;
  attachments: Array<{ url: string }>;
};

export type PurgeDeps = {
  findExpiredLeads(now: Date): Promise<ExpiredLead[]>;
  /** Deletes lead rows (attachments cascade in DB). Returns count deleted. */
  deleteLeads(ids: string[]): Promise<number>;
  /** Deletes one local upload. Must treat already-missing files as success. */
  deleteFile(url: string): Promise<void>;
};

export type PurgeResult = {
  leadsPurged: number;
  filesDeleted: number;
  filesFailed: number;
  /** Leads kept because a file deletion failed — retried next run. */
  leadsSkipped: number;
};

export async function purgeExpiredLeads(
  now: Date,
  deps: PurgeDeps
): Promise<PurgeResult> {
  const expiredLeads = await deps.findExpiredLeads(now);

  let filesDeleted = 0;
  let filesFailed = 0;
  const deletableIds: string[] = [];

  for (const lead of expiredLeads) {
    let allFilesGone = true;
    for (const att of lead.attachments) {
      // Only local uploads have files on disk.
      if (!att.url.startsWith("/uploads/")) continue;
      try {
        await deps.deleteFile(att.url);
        filesDeleted++;
      } catch (err) {
        console.error(
          `[Purge] Failed to delete file for lead ${lead.id}: ${att.url}`,
          err
        );
        filesFailed++;
        allFilesGone = false;
      }
    }
    if (allFilesGone) {
      deletableIds.push(lead.id);
    }
  }

  const leadsPurged =
    deletableIds.length > 0 ? await deps.deleteLeads(deletableIds) : 0;

  return {
    leadsPurged,
    filesDeleted,
    filesFailed,
    leadsSkipped: expiredLeads.length - deletableIds.length,
  };
}
