# Auth entry goes through the API routes; rate limiting lives inside the auth module

The admin login flow (login step 1/2, forgot/reset password) has exactly one entry surface: the API routes under `src/app/api/auth/*`, called via `fetch` from the login pages. The server-action twins that used to mirror these routes were deleted after we found the brute-force rate limiter was wired only into those actions — which nothing called — leaving the real login path unprotected.

To make that class of bug impossible, `checkRateLimit`/`recordFailedAttempt`/`resetRateLimit` are called inside `loginStep1`/`loginStep2` in `src/lib/auth.ts`, not in the route handlers. Callers pass the client IP in; no entry point can reach credential or OTP verification without passing the limiter.

The limiter tracks two dimensions per scope: `ip:email` and `email` alone (higher threshold). The IP comes from `x-forwarded-for`, which a client can spoof when the app is not behind a trusted proxy — the email-only counter is what actually holds against header rotation. The accepted trade-off is that an attacker can lock the admin's email for 15 minutes. `requestPasswordReset` is limited the same way under its own scope, counting every request (not just failures) to throttle email bombing.

## Consequences

- Do not reintroduce server actions for login/reset — one entry surface, or the guard drifts again.
- Any new caller of `loginStep1`/`loginStep2`/`requestPasswordReset` must supply an IP; the signature forces it.
