# NFR Design Patterns — `roles-profile` UoW (amendment over auth)

**Tier**: Feature     **Generated**: 2026-05-13T09:52:00+05:30
**Format**: amendment — extends `aidlc-docs/construction/auth/nfr-design/auth-nfr-design-patterns.md`

---

## Inherited (unchanged)

Every pattern from the auth UoW carries over unchanged:
- **Resilience**: P-RES-001 (idempotent logout), P-RES-002 (fail-fast bootstrap).
- **Scalability**: P-SCAL-001 (in-memory rate-limit map).
- **Security**: P-SEC-001..P-SEC-010 (Argon2id frozen params, RS256 + JWKS, cookie flags, rate-limit, RFC 7807 envelope, logger redaction, refresh-token rotation transaction, etc.).
- **Accessibility**: P-A11Y-001..P-A11Y-008 (paired labels, focus rings, contrast, keyboard order, h1 per route, hit target ≥ 44px, error-to-input link).
- **Observability**: P-OBS-001..P-OBS-004 (JSON stdout, request_id, structured fields, redaction).
- **Testability**: P-TEST-001..P-TEST-004 (unit isolation, integration on real Postgres, PBT 4 invariants, e2e Playwright).

---

## New patterns (delta)

### Pattern P-SEC-011: Server-side enum authoritativeness
**Applies to**: NFR-S11, BR-A13, BR-A14
**Implementation**:
- The FE TS union is convenience only. The BE MUST validate `role` against the same zod enum on every signup request.
- Postgres' native enum type is the storage-layer backstop — even if a zod check is somehow bypassed, the INSERT fails before commit.
- The DTO uses `z.enum(['MERCHANT', 'SELLER'])` (NOT `z.string()` with a `.refine`) so the error code is consistent with the catalog (`auth.role.invalid`).
- Test: integration spec sends `role: "ADMIN"`, `role: null`, `role: 123`, and the empty string — all 400 with `auth.role.invalid`.

### Pattern P-A11Y-009: Radio group with paired group label + native keyboard semantics
**Applies to**: NFR-A09 (radio group portion), BR-A13
**Implementation**:
- `<RoleRadioGroup/>` renders a `<fieldset>` with a `<legend>"I am a…"</legend>` (visually styled to match the rest of the form's label typography), or equivalently an outer `<div role="radiogroup" aria-labelledby="…">`.
- Each radio is a native `<input type="radio" name="role">` so the browser implements `Tab` to enter the group, `←/→/↑/↓` to move between options, and `Space` to select — per ARIA APG.
- Each `<input>` is paired with its visible `<label>` via `htmlFor`/`id` (NFR-A01 still holds).
- The submit button is disabled until `role !== null` (US-009 AC1+AC4).
- The visible focus indicator is the same focus ring used by `<FormInput/>` (≥ 3:1 contrast — NFR-A02).
- Test: keyboard-only walkthrough in Stage 14; axe-core scan on `/signup` has zero serious/critical findings.

### Pattern P-A11Y-010: Text-label badge with `aria-label` and contrast budget
**Applies to**: NFR-A09 (badge portion), BR-A15
**Implementation**:
- `<RoleBadge/>` renders the literal text label ("Merchant" / "Seller") so role is never conveyed by colour alone.
- The container carries `aria-label={`You are signed in as a ${role === 'MERCHANT' ? 'Merchant' : 'Seller'}`}` so screen readers announce the identity once.
- The badge's foreground/background tokens MUST hit ≥ 4.5:1 contrast against the header surface — verified by the axe-core scan + the design-tokens table.
- The badge MUST NOT render on Landing or `/signup` (BR-A15) — the conditional sits inside the `useAuth().user != null` gate that already wraps the header for authenticated routes.

### Pattern P-MAINT-003: Single source of truth for the `Role` union
**Applies to**: NFR-MAINT-003, BR-A14
**Implementation**:
- The union literal `'MERCHANT' | 'SELLER'` is declared exactly once, in `shared/role.ts`:
  ```ts
  export const ROLES = ['MERCHANT', 'SELLER'] as const;
  export type Role = (typeof ROLES)[number];
  ```
- The BE imports `ROLES` into its zod schema: `z.enum(ROLES)`.
- The FE imports `Role` for its TS types and `ROLES` for any radio iteration / `<option>` rendering.
- The Prisma `enum Role { MERCHANT SELLER }` is the only declaration not directly importable from `shared/role.ts` — it MUST stay in sync; either a build-time assertion (a unit test that compares the sorted set of `Object.values(Prisma.Role)` to `ROLES`) or a Stage-13 grep step enforces this.
- Test: a unit test in `apps/backend/tests/unit/role-source-of-truth.spec.ts` asserts the three sets (Prisma enum, zod enum, shared `ROLES`) are equal.

---

## Compliance matrix — delta

| Pattern | NFR | Owning BR | Stage that proves it |
|---------|-----|-----------|-----------------------|
| P-SEC-011 | NFR-S11 | BR-A13, BR-A14 | 12 (impl) + 13 (executed) |
| P-A11Y-009 | NFR-A09 (radio) | BR-A13 | 12 (impl) + 14 (keyboard + axe) |
| P-A11Y-010 | NFR-A09 (badge) | BR-A15 | 12 (impl) + 14 (axe contrast) |
| P-MAINT-003 | NFR-MAINT-003 | BR-A14 | 12 (file layout) + 13 (unit test) |

---

## Modification Log
| Timestamp (ISO) | Editor | Change |
|-----------------|--------|--------|
| 2026-05-13T09:52:00+05:30 | AI-DLC | Initial creation. Stage 10 design-patterns amendment for Feature UoW; 4 new patterns + all auth patterns inherited. |
