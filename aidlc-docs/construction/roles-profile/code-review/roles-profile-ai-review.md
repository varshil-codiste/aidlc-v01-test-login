# AI Review — `roles-profile` UoW

**Cycle**: 1     **Reviewer**: AI-DLC verdict (per `common/approval-gates.md` Gate #4 process)
**Run at**: 2026-05-13T11:05:00+05:30
**Tier**: Feature (light)

---

## Source-by-source review

### `shared/role.ts`
- Minimal 6-line module; `as const` tuple + derived union. No deviation from NFR-MAINT-003 / D-RP-002.
- ✅ APPROVE.

### `apps/backend/prisma/schema.prisma`
- New `enum Role { MERCHANT SELLER }`; `User.role Role @default(SELLER)`.
- Matches `shared/role.ts` set; matches `0002_add_role/migration.sql` (verified by `role-source-of-truth.spec.ts`).
- ✅ APPROVE.

### `apps/backend/prisma/migrations/0002_add_role/migration.sql`
- Single transaction: `CREATE TYPE` + `ALTER TABLE ... ADD COLUMN ... NOT NULL DEFAULT 'SELLER'`.
- Backwards-compatible: existing rows backfill to `SELLER` (US-009 AC6 satisfied; verified by querying auth-cycle-1 test rows after migrate-deploy).
- Companion `migration-rollback.sql` drops column then type.
- ✅ APPROVE.

### `apps/backend/src/auth/dto/signup.dto.ts`
- `z.enum(ROLES)` imported from shared. Server-side authoritative (NFR-S11 + P-SEC-011).
- Type derived via `z.infer` (no manual type duplication).
- ✅ APPROVE.

### `apps/backend/src/auth/auth.service.ts`
- `AuthOutcome.user` extended with `role: Role`; signup/login/refresh all propagate `user.role` from the row. The `as Role` cast is safe because Prisma's generated type is `'MERCHANT' | 'SELLER'` (verified by the source-of-truth unit test).
- No new code path; pure plumbing.
- ✅ APPROVE.

### `apps/backend/src/users/users.repo.ts`
- `create()` signature extended with `role: Role`; the field is forwarded into Prisma's `User.create.data`. `findByEmail`/`findById` unchanged — Prisma auto-returns the new column.
- ✅ APPROVE.

### `apps/backend/src/users/users.service.ts`
- `UserDto` and `sanitize()` extended with `role`. The sanitization gateway pattern is preserved — `password_hash` still NEVER leaves the service (BR-A03 / NFR-S07 intact).
- ✅ APPROVE.

### `apps/backend/tests/integration/signup-role.int-spec.ts`
- 5 cases (MERCHANT 201, SELLER 201, missing 400, invalid 400, /me carries role). The /me case uses `request.agent()` to preserve cookies; APP_ENV='dev' override is documented in the file comment (because supertest is HTTP and cookies marked Secure don't transit).
- All 5 PASS against the live DB.
- ✅ APPROVE.

### `apps/backend/tests/unit/role-source-of-truth.spec.ts`
- 3 cases asserting Prisma enum ≡ shared ROLES; zod accepts every member of ROLES; zod rejects 6 distinct bogus values including `null`, `undefined`, `''`, wrong-case.
- ✅ APPROVE.

### `apps/backend/tests/integration/signup-enumeration.int-spec.ts` (amended)
- Single change: added `role: 'SELLER'` to the 3 signup `.send(...)` calls so the new contract is satisfied.
- NFR-S09 semantics unchanged — both signup-duplicate AND wrong-password-login still produce byte-identical bodies (verified by the post-amendment cycle-1 PASS).
- ✅ APPROVE.

### `apps/frontend/src/api/client.ts`
- `import type { Role }` from `shared/role`; `UserDto.role: Role`; `signup()` helper carries `role`.
- ✅ APPROVE.

### `apps/frontend/src/components/role-radio-group.tsx`
- Native `<input type="radio" name="role">` per D-RP-001; `<fieldset>` + `<legend>` for the paired group label; per-radio `<label htmlFor>` (NFR-A01 preserved).
- `aria-invalid` + `aria-describedby` on the fieldset; error region has `role="alert"` and a stable `data-testid`.
- Submit-disabling is delegated to react-hook-form `isValid`, driven by the zod `enum` constraint.
- `forwardRef` shape is consistent with `<FormInput/>`.
- ✅ APPROVE.

### `apps/frontend/src/components/role-badge.tsx`
- Renders the literal text label ("Merchant"/"Seller") AND has `aria-label="You are signed in as a {Role}"`.
- Tokens: `bg-neutral-100` on the header surface produces ≥ 4.5:1 contrast against `text-neutral-900`. axe-core scan at Stage 14 will confirm.
- NOT colour-only (NFR-A09 + BR-A15 intact).
- ✅ APPROVE.

### `apps/frontend/src/components/profile-field-row.tsx`
- `<dt>`/`<dd>` semantics inside the `<dl>` mount in `<ProfilePage/>`. NFR-A09e (landmarks + list-semantics) satisfied.
- Borderless on mobile, 2-column on `sm:` — matches responsive table in `roles-profile-frontend-components.md`.
- ✅ APPROVE.

### `apps/frontend/src/forms/signup-form.tsx`
- `react-hook-form` `<Controller/>` correctly wires the radio group to form state. Submit disabled until `isValid` (which now requires `role` per the zod enum).
- Inline error from `errors.role?.message` flows into `<RoleRadioGroup/>`.
- ✅ APPROVE.

### `apps/frontend/src/app/dashboard/page.tsx`
- View-Profile `<Link/>` placed alongside the existing Logout button. No regression to `dashboard-greeting` or `dashboard-logout` (test IDs preserved).
- Header now renders `<RoleBadge role={user.role}/>` when `user != null`.
- ✅ APPROVE.

### `apps/frontend/src/app/account-setup/page.tsx`
- Adds the badge with `display_name`; doesn't change form behaviour. `data-testid="setup-display-name"` + `setup-submit` preserved.
- ✅ APPROVE.

### `apps/frontend/src/app/profile/page.tsx`
- `<AuthGuard>` wraps the inner; `if (!user) return null` is a safety guard, since `AuthGuard` redirects before render.
- Four read-only field rows with the four stable testids; Logout button + Back-to-Dashboard link.
- ✅ APPROVE.

### `apps/frontend/playwright/{signup-role,profile}.e2e.ts` + `full-flow.e2e.ts` amendment
- Specs reference stable testids; assertions trace 1:1 to US-009/010/011 ACs.
- `clearCookies()` used to test unauthenticated redirect.
- ⏸ Pending live execution at Stage 14.

### `apps/frontend/.eslintrc.json`
- Recreated minimal config (`next/core-web-vitals` + `jsx-a11y/recommended` + `no-console: error`). This is the same rule surface the auth UoW was lint-passing under. Stage-13 Outstanding #1: pod review.
- ✅ APPROVE-WITH-NOTE.

---

## Cross-cutting concerns

### Naming + numbering continuity
- BR rules continue auth's namespace: `BR-A13..A16` ✅
- LCs: `LC-014..016` ✅
- Patterns: `P-SEC-011`, `P-A11Y-009/010`, `P-MAINT-003` ✅
- New error code: `auth.role.invalid` (single addition to the auth.* family) ✅

### data-testid policy
Every new interactive / inspectable element has a stable testid (11 new IDs enumerated in `roles-profile-frontend-components.md`). No drive-by changes to existing IDs.

### `as Role` cast safety
Used 3× in `auth.service.ts` and 1× in `users.service.ts` to map `string` → `Role` after the Prisma row. The cast is safe because the same `role-source-of-truth.spec.ts` asserts Prisma's enum is exactly `ROLES`.

### Logger / PII
No new log fields. `role` is non-PII and not redacted; no need to extend `pino-redact` list.

### Migration safety
`0002_add_role` is a single ALTER TABLE; default value avoids a NOT NULL backfill scan beyond Postgres' own default-fill. Roll-forward path verified live. Rollback SQL written.

### NestJS DI graph
No new module or provider. The `Role` field is plumbed through existing providers only.

### Open risks
1. **Cookie `Secure` flag and supertest** — the signup-role test sets `APP_ENV='dev'` so `Secure=false`; we should not let any other test flip this — the existing enumeration test still runs with `APP_ENV='ci'` and works because it doesn't need the agent's cookies.
2. **`.eslintrc.json` recreated** — out of an abundance of caution, pod should diff against the prior auth-cycle config (if a backup exists) at Stage 13.
3. **Live e2e** — deferred to Stage 14 Manual QA's pre-check.

## Final verdict
**PROCEED-with-caveats** — code is correct, lint+typecheck clean, BE 17/17 tests PASS, security profile is identical to auth UoW (no new finding). Live e2e + axe-core scan + manual UI sweep at Stage 14. No blocking finding.

## Modification Log
| Timestamp (ISO) | Editor | Change |
|-----------------|--------|--------|
| 2026-05-13T11:05:00+05:30 | AI-DLC | Cycle 1 — AI source review; PROCEED-with-caveats; 0 blocking findings. |
