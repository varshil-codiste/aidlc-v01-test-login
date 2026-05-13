# Code Summary — `roles-profile` UoW

**Tier**: Feature     **Stage**: 12     **Completed**: 2026-05-13T11:00:00+05:30

---

## Step results

| Step | Files | Status |
|------|-------|--------|
| 1 — Shared boundary | `shared/role.ts` | ✅ CREATE |
| 2 — DB migration | `apps/backend/prisma/schema.prisma` (EDIT) · `prisma/migrations/0002_add_role/migration.sql` (CREATE) · `migration-rollback.sql` (CREATE) · `npx prisma generate` ran | ✅ |
| 3 — BE DTO + service plumb | `auth/dto/signup.dto.ts` · `auth/auth.service.ts` · `users/users.repo.ts` · `users/users.service.ts` | ✅ |
| 4 — BE tests | `tests/integration/signup-role.int-spec.ts` (CREATE) · `tests/unit/role-source-of-truth.spec.ts` (CREATE) · also amended `signup-enumeration.int-spec.ts` to send `role` | ✅ |
| 5 — FE TS type + auth | `apps/frontend/src/api/client.ts` (User TS + signup helper now carry `role`) | ✅ |
| 6 — FE components | `components/role-radio-group.tsx` (CREATE) · `components/role-badge.tsx` (CREATE) · `components/profile-field-row.tsx` (CREATE) | ✅ |
| 7 — FE pages | `forms/signup-form.tsx` (mount `<RoleRadioGroup/>`) · `app/dashboard/page.tsx` (View-Profile link + RoleBadge) · `app/account-setup/page.tsx` (header badge) · `app/profile/page.tsx` (CREATE) | ✅ |
| 8 — Playwright e2e | `playwright/signup-role.e2e.ts` (CREATE) · `playwright/profile.e2e.ts` (CREATE) · `playwright/full-flow.e2e.ts` (amended to include role check) | ✅ (specs written; live e2e run deferred to Stage 13/14 — requires running BE + FE) |
| 9 — Lint + tests | BE+FE typecheck PASS · BE lint PASS · FE lint PASS · BE 17/17 tests PASS (3 unit + 6 integration + 8 properties) | ✅ |

---

## Files touched

### New
- `shared/role.ts`
- `apps/backend/prisma/migrations/0002_add_role/migration.sql`
- `apps/backend/prisma/migrations/0002_add_role/migration-rollback.sql`
- `apps/backend/tests/integration/signup-role.int-spec.ts`
- `apps/backend/tests/unit/role-source-of-truth.spec.ts`
- `apps/frontend/src/components/role-radio-group.tsx`
- `apps/frontend/src/components/role-badge.tsx`
- `apps/frontend/src/components/profile-field-row.tsx`
- `apps/frontend/src/app/profile/page.tsx`
- `apps/frontend/playwright/signup-role.e2e.ts`
- `apps/frontend/playwright/profile.e2e.ts`
- `apps/frontend/.eslintrc.json` (recreated — Next.js wanted to scaffold one; see Outstanding #1)

### Edited
- `apps/backend/prisma/schema.prisma`
- `apps/backend/src/auth/dto/signup.dto.ts`
- `apps/backend/src/auth/auth.service.ts`
- `apps/backend/src/users/users.repo.ts`
- `apps/backend/src/users/users.service.ts`
- `apps/backend/tests/integration/signup-enumeration.int-spec.ts`
- `apps/frontend/src/api/client.ts`
- `apps/frontend/src/forms/signup-form.tsx`
- `apps/frontend/src/app/dashboard/page.tsx`
- `apps/frontend/src/app/account-setup/page.tsx`
- `apps/frontend/playwright/full-flow.e2e.ts`

Total: **12 new + 11 edited = 23 file changes** (plan estimated ~12; the extra count comes from {migration-rollback, .eslintrc.json, account-setup edit, full-flow amendment, enumeration test amendment} which were necessary for completeness or to keep existing tests green; none added new functionality beyond the plan).

---

## Verification artifacts

### Typecheck
- `apps/backend`: `npx tsc --noEmit -p tsconfig.json` → exit 0
- `apps/frontend`: `npx tsc --noEmit` → exit 0

### Lint
- `apps/backend`: `eslint src/**/*.ts tests/**/*.ts --max-warnings 0` → 0 errors / 0 warnings
- `apps/frontend`: `next lint --max-warnings 0` → 0 errors / 0 warnings

### Unit tests
```
✓ tests/unit/role-source-of-truth.spec.ts (3 tests)
  - Prisma Role enum matches shared ROLES
  - zod signup schema accepts every value in ROLES
  - zod signup schema rejects values outside ROLES
```

### Integration tests (real Postgres on host port 5433 via docker compose)
```
✓ tests/integration/signup-role.int-spec.ts (5 tests, NFR-T05)
  - valid MERCHANT signup returns 201 with user.role === "MERCHANT"
  - valid SELLER signup returns 201 with user.role === "SELLER"
  - missing role returns 400 (validation envelope)
  - invalid role string returns 400
  - role is also returned on /users/me after signup

✓ tests/integration/signup-enumeration.int-spec.ts (1 test, NFR-S09 — regression)
  - duplicate-email signup and wrong-password login return identical bodies
```

### Property tests (already in place from auth UoW; re-run as regression)
```
✓ tests/properties/refresh-rotation.prop-spec.ts (2 tests)
✓ tests/properties/email-normalize.prop-spec.ts (2 tests)
✓ tests/properties/jwt-roundtrip.prop-spec.ts (2 tests)
✓ tests/properties/password-hash.prop-spec.ts (2 tests)
```

### Migration
- `0002_add_role` applied via `npx prisma migrate deploy` against the running Postgres 16 container; status reported as APPLIED. Existing rows from auth-UoW Manual QA backfilled to `role='SELLER'`.

### Total BE test count
**17 / 17 PASS** (3 unit + 6 integration + 8 PBT) — zero regressions.

### Playwright e2e (deferred)
Three e2e specs written (`signup-role.e2e.ts`, `profile.e2e.ts`, amended `full-flow.e2e.ts`). Live execution requires BE + FE running. Will be executed at Stage 13 (Code Review) once cycle-1 BE+FE are restarted.

---

## Compliance summary

| Extension | Status | Evidence |
|-----------|--------|----------|
| **Security baseline** (NFR-S11) | ✅ Compliant | P-SEC-011 enforced via zod `z.enum(ROLES)` + Postgres native enum; 5 integration cases prove it |
| **Property-Based Testing** | ✅ N/A — no new invariant | Existing 4 PBT files still PASS as regression |
| **Accessibility (WCAG 2.2 AA)** (NFR-A09) | ✅ Compliant — planned | Native `<input type="radio">` keyboard semantics; paired `<label>`; `<RoleBadge/>` `aria-label`; `<dl>/<dt>/<dd>` semantics on `<ProfilePage/>`. Live axe-core scan at Stage 14. |
| **AI/ML lifecycle** | ✅ N/A | Opted out at Stage 4 |

---

## Outstanding

1. **`.eslintrc.json` recreated** — `next lint` complained that no ESLint config existed (the auth UoW cycle-1 had a working one; possibly removed during a `next` upgrade or session-boundary cleanup). I added a minimal one with `next/core-web-vitals` + `jsx-a11y/recommended` + `no-console: error` to keep the lint surface identical to the auth UoW. **Action**: pod can review at Stage 13 to confirm it matches the original.
2. **Live e2e** — three specs are written but not yet executed against running BE + FE. Stage 13 will run them as part of the cycle-1 Code-Review pipeline. If the pod wants me to bring up the full stack right now and run them, ask.
3. **`signup-enumeration` test amended** — pre-existing test now sends `role: 'SELLER'` because the new contract requires it. The semantics of NFR-S09 (byte-identical bodies for duplicate-signup-vs-wrong-password) are unchanged — both paths still go through `invalidCredentialsError()`. Test re-run green.

---

## Modification Log
| Timestamp (ISO) | Editor | Change |
|-----------------|--------|--------|
| 2026-05-13T11:00:00+05:30 | AI-DLC | Stage 12 code emission complete; 23 file changes; 17/17 BE tests PASS; lint+typecheck clean for BE+FE. Outstanding: live e2e + Outstanding #1 confirmation. |
