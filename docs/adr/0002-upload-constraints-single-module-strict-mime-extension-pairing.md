# Upload constraints live in one pure module; extension must match declared mimetype

`src/lib/upload-constraints.ts` is the single source of truth for what may be uploaded (5MB cap, mime→extension map, `validateUpload`). It is deliberately free of Node imports so client components and server code import the same validator — previously the limits were hardcoded in five places and drifted.

Validation is strict-pairing: the file extension must match the declared mimetype (`.pdf` + `image/png` is rejected), which is stricter than the earlier independent checks (SEC-01). Per-purpose narrowing (images only, PDF only) is enforced server-side in `src/actions/uploads.ts` via fixed named actions — the allowlist is never accepted from the client.

## Consequences

- Changing what may be uploaded means editing `upload-constraints.ts` only; both sides of the seam follow.
- Site logo uploads are now image-only (previously any allowed type, including PDF/DOC). Intentional tightening.
