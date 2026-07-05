# Lead intake core is prisma-free with injected I/O

`src/lib/lead-intake.ts` holds the lead schemas, `parseLeadForm`, `buildLeadDetails`, and the `processLead` orchestration. All I/O (prisma, Resend, file upload, reCAPTCHA) reaches it only through the injected `LeadIntakeDeps`; `src/actions/leads.ts` is a thin adapter wiring in production dependencies.

Two deliberate choices a reader might otherwise "fix":

- `formType` is a string union (`LeadFormTypeValue`), not the Prisma `LeadFormType` enum. Importing the generated Prisma client would drag it into the client bundle — the module must stay client-safe because `QuoteForm.tsx` imports the same schemas (single definition for client and server validation; the form's stricter required-`province` rule is applied as an `.extend()` override in QuoteForm, not by forking the schema).
- The deps object is not over-abstracted into interfaces-per-dependency; it exists so the whole flow is testable with in-memory fakes (`lead-intake.test.ts`), which is the only reason the seam is there.

## Consequences

- Keep `lead-intake.ts` free of prisma/Node-only imports (type-only imports are fine — they erase at compile time).
- Validation or Thai error-message changes happen once, in the shared schemas, and apply to both client and server.
