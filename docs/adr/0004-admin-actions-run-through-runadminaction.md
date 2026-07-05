# Admin server actions run through runAdminAction

Every admin CRUD/upload server action delegates its body to `runAdminAction` (`src/lib/admin-action.ts`), which performs `requireAuth()` and applies the uniform `{ success: false, error }` envelope. The guard is part of the envelope rather than a per-action convention, so a new action cannot silently omit auth — previously `requireAuth()` was copy-pasted into 15+ bodies.

Deliberate exceptions and quirks:

- `src/actions/auth.ts` is not wrapped — its actions redirect on `AuthError` instead of returning an envelope.
- Admin **pages** (`src/app/admin/*/page.tsx`) still call `requireAuth().catch(redirect)` themselves; that is a page-level guard, a different layer.
- `revalidatePath` lists stay inline in each action on purpose — they are genuinely per-resource; centralising them would move complexity, not concentrate it.
- The wrapper's return type is `(T & { error?: string }) | (Partial<T> & AdminActionFailure)`. This mirrors what TypeScript used to infer for the inlined try/catch, so client editors reading `res.error`/`res.url` after a bare `res.success` check compile unchanged. Do not "simplify" it to a plain discriminated union — action bodies return widened `success: boolean`, and the narrowing breaks across ~10 editor components.
