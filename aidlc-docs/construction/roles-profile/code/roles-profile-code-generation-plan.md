# Code Generation Plan — `roles-profile` UoW

**Tier**: Feature (light)     **Stage**: 12     **Generated**: 2026-05-13T09:58:00+05:30
**Stack**: inherited from auth (Next.js 14 + NestJS 10 + Prisma 5 + Postgres 16 + zod 3 + vitest 2 + Playwright)
**Effort estimate**: ~12 files; 1-2 turns

---

## Step plan

### Step 1 — Shared boundary
| File | Action | Drives |
|------|--------|--------|
| `shared/role.ts` | **CREATE** | NFR-MAINT-003; exports `ROLES = ['MERCHANT', 'SELLER'] as const` and `type Role` |

### Step 2 — DB migration
| File | Action | Drives |
|------|--------|--------|
| `apps/backend/prisma/schema.prisma` | **EDIT** | Add `enum Role { MERCHANT SELLER }`; add `role Role @default(SELLER)` on `User` |
| `apps/backend/prisma/migrations/0002_add_role/migration.sql` | **CREATE** | BR-A14; `CREATE TYPE` + `ALTER TABLE` in one transaction; default `'SELLER'` for backfill |

### Step 3 — BE DTO + service plumb
| File | Action | Drives |
|------|--------|--------|
| `apps/backend/src/auth/dto/signup.dto.ts` | **EDIT** | BR-A13, NFR-S11; extend zod with `role: z.enum(ROLES)`; import from `shared/role` |
| `apps/backend/src/auth/auth.service.ts` | **EDIT** | Forward `role` from DTO → `usersRepo.create(...)`; ensure response includes `role` |
| `apps/backend/src/users/users.repo.ts` | **EDIT** | Accept + return `role` in `create`/`findByEmail`/`findById` |
| `apps/backend/src/users/users.service.ts` | **EDIT** | Include `role` in `/users/me` sanitized response |
| `apps/backend/src/users/users.controller.ts` | **EDIT** | Type the response shape with `Role` from `shared/role` |

### Step 4 — BE tests
| File | Action | Drives |
|------|--------|--------|
| `apps/backend/tests/integration/signup-role.int-spec.ts` | **CREATE** | NFR-T05; 4 cases (valid MERCHANT 201, valid SELLER 201, missing role 400 `auth.role.invalid`, invalid role 400) |
| `apps/backend/tests/unit/role-source-of-truth.spec.ts` | **CREATE** | NFR-MAINT-003; asserts Prisma `Role` enum set equals zod enum set equals `ROLES` |

### Step 5 — FE TS type + auth hook
| File | Action | Drives |
|------|--------|--------|
| `apps/frontend/src/api/client.ts` | **EDIT** | Import `Role` from `shared/role`; extend `User` TS shape with `role: Role`; signup helper carries `role` |
| `apps/frontend/src/auth/use-auth.tsx` (or `.ts`) | **EDIT** | `signup({email, displayName, password, role})` |

### Step 6 — FE components: radio + badge + profile-row
| File | Action | Drives |
|------|--------|--------|
| `apps/frontend/src/components/role-radio-group.tsx` | **CREATE** | LC-015; `<fieldset><legend>I am a…</legend>` + two native radios; visible focus ring; controlled `{value, onChange, error}` |
| `apps/frontend/src/components/role-badge.tsx` | **CREATE** | LC-014; reads `useAuth().user.role`; renders literal label; `aria-label="You are signed in as a {Role}"`; conditional on `user != null` |
| `apps/frontend/src/components/profile-field-row.tsx` | **CREATE** | LC-016 helper; `<dl>/<dt>/<dd>` semantics |

### Step 7 — FE pages: signup edit + dashboard edit + profile new
| File | Action | Drives |
|------|--------|--------|
| `apps/frontend/src/components/forms/signup-form.tsx` (or `apps/frontend/src/forms/signup-form.tsx`) | **EDIT** | Mount `<RoleRadioGroup/>`; submit disabled until `role !== null`; on submit pass `role` to `useAuth().signup` |
| `apps/frontend/src/app/dashboard/page.tsx` | **EDIT** | Add View-Profile `<Link/>` with `data-testid="dashboard-view-profile"` |
| `apps/frontend/src/app/layout.tsx` (or new `header.tsx`) | **EDIT** | Mount `<RoleBadge/>` next to `display_name` for authenticated routes only |
| `apps/frontend/src/app/profile/page.tsx` | **CREATE** | LC-016; wraps `<AuthGuard requireSetupComplete={true}/>`; renders 4 `<ProfileFieldRow/>` + Logout button + Back-to-Dashboard link |

### Step 8 — Playwright e2e amendment
| File | Action | Drives |
|------|--------|--------|
| `apps/frontend/e2e/signup-role.e2e.ts` (or under `tests/e2e/`) | **CREATE** | US-009 ACs 1–6 — signup with role; valid/invalid paths |
| `apps/frontend/e2e/profile.e2e.ts` (or under `tests/e2e/`) | **CREATE** | US-010 + US-011 — header badge present on authenticated routes; profile loads with 4 fields; Logout from profile clears cookies + redirects to `/`; back-to-dashboard works |

### Step 9 — Re-run lint + tests + axe scan
After each step, run the workspace `lint` + `vitest run` + `playwright test --grep "signup-role|profile"` and fix-before-mark-done per the AI-DLC plan rule. Per-step verification artifacts are logged to `roles-profile-code-summary.md`.

---

## Story traceability

| Story | ACs | Source files | Test files |
|-------|-----|--------------|------------|
| US-009 (sign up with role) | 1–6 | `shared/role.ts`, `signup.dto.ts`, `auth.service.ts`, `users.repo.ts`, `migration.sql`, `signup-form.tsx`, `role-radio-group.tsx`, `use-auth.tsx` | `signup-role.int-spec.ts`, `signup-role.e2e.ts`, `role-source-of-truth.spec.ts` |
| US-010 (header role badge) | 1–5 | `role-badge.tsx`, `layout.tsx`, `client.ts` (User type), `users.service.ts` | `profile.e2e.ts` (badge subset), axe scan at Stage 14 |
| US-011 (profile + logout) | 1–6 | `dashboard/page.tsx`, `profile/page.tsx`, `profile-field-row.tsx`, existing `POST /auth/logout` | `profile.e2e.ts`, manual QA |

---

## Codiste-house conventions enforced

1. **`data-testid` everywhere on interactive elements** — every new clickable / inputtable / role-bearing element has one.
2. **JSON stdout logs** — no new logger; reuses LC-003. No new log fields.
3. **No hardcoded secrets** — N/A; no secret material in this UoW.
4. **NestJS module structure** — no new Nest module; edits live in `auth/` + `users/` existing modules.
5. **Cyclomatic ≤ 10 (sonarjs)** — applies to every new function/file; will be enforced at Stage 13 lint.

---

## Files NOT modified (negative scope)

- `apps/backend/src/auth/auth.controller.ts` — no new endpoint; signature unchanged.
- `apps/backend/src/auth/refresh.*` — refresh + rotation unaffected by role.
- `apps/backend/src/common/rate-limit/login-rate-limit.guard.ts` — login throttle unchanged.
- `apps/frontend/src/forms/sign-in-form.tsx` (or `sign-in-form.tsx`) — login UI does not change; the response payload simply now includes `role`.
- `apps/frontend/src/app/account-setup/page.tsx` — no role mutation on Account Setup; role is set at signup only.
- `package.json` (root + workspaces) — no new top-level dependency.

---

## Acceptance gates for Step plan completion (before stage marks done)

- [ ] All 12 enumerated files created/edited.
- [ ] `npm run lint` (BE + FE) passes for the touched files.
- [ ] `npm run test` (vitest workspace) passes — including new `signup-role.int-spec.ts` and `role-source-of-truth.spec.ts`.
- [ ] `npm run e2e` (or `playwright test`) passes — including new `signup-role.e2e.ts` and `profile.e2e.ts`.
- [ ] `roles-profile-code-summary.md` written with per-step verification record.

---

## Modification Log
| Timestamp (ISO) | Editor | Change |
|-----------------|--------|--------|
| 2026-05-13T09:58:00+05:30 | AI-DLC | Initial creation. Stage 12 plan; ~12 files; Feature-tier light. |
