import { requireAuth } from "@/lib/auth";

export type AdminActionFailure = { success: false; error: string };

/**
 * Runs an admin server-action body behind the auth guard with the uniform
 * error envelope. Admin actions must go through this — the guard is part of
 * the envelope, not something each action body remembers to call.
 *
 * The return type mirrors what TS used to infer for the inlined try/catch
 * (every success field optional on the failure side and vice versa), so
 * callers can read `res.error` / `res.url` after a plain `res.success` check.
 */
export async function runAdminAction<T extends { success: boolean }>(
  label: string,
  fallbackError: string,
  fn: () => Promise<T>
): Promise<(T & { error?: string }) | (Partial<T> & AdminActionFailure)> {
  try {
    await requireAuth();
    return (await fn()) as T & { error?: string };
  } catch (error) {
    console.error(`[${label}] Error:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : fallbackError,
    } as Partial<T> & AdminActionFailure;
  }
}
