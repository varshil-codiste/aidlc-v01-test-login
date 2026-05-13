# Stack Selection — `roles-profile` UoW (amendment over auth)

**Tier**: Feature     **Generated**: 2026-05-13T09:55:00+05:30
**Format**: amendment — extends `aidlc-docs/construction/auth/nfr-requirements/auth-tech-stack-decisions.md`
**Open decision resolved at Stage 11**: radio primitive = **native `<input type="radio">`** (pod chose A on 2026-05-13).

---

## Inherited verbatim (no change)

| Concern | Choice |
|---------|--------|
| Frontend framework | Next.js 14 (App Router) + React 18 |
| Backend framework | NestJS 10 (Node 20 LTS) |
| ORM | Prisma 5 |
| Database | Postgres 16 |
| Language | TypeScript 5.x |
| Hashing | argon2 (node-argon2 native) — frozen params memoryCost=19_456, timeCost=2, parallelism=1 |
| JWT | `jose` (RS256 + JWKS) |
| Schema validation (BE) | zod 3.x |
| Schema validation (FE) | zod 3.x (mirrors BE schemas) |
| Test runner | vitest 2.x with `defineWorkspace` + unplugin-swc for decorator metadata |
| Property-based tests | fast-check 3.x |
| E2E | Playwright (Chromium 148) |
| Styling | Tailwind CSS + shadcn/ui primitives |
| Cookies | NestJS `@nestjs/passport` + `set-cookie` semantics |
| Container runtime | Docker Compose (host port `5433` → DB `5432`) |
| API contract | OpenAPI 3.1 |
| Deployment | self-hosted |

No version bumps. No new top-level dependency.

---

## New decisions (delta)

### D-RP-001 — Radio primitive = native HTML
**Choice**: Use the platform's native `<input type="radio" name="role">` inside `<RoleRadioGroup/>`. No third-party library.
**Why**:
- The browser already implements the ARIA APG keyboard semantics (Tab into the group, ←/→/↑/↓ moves between options, Space selects). Adding `@radix-ui/react-radio-group` would not improve the a11y baseline — it would mostly add styling sugar.
- Honours the auth-UoW design stance ("no library unless necessary").
- Zero SBOM impact. No new transitive dependency.
- Styling matches the existing `<FormInput/>` focus ring via shared Tailwind utilities.
**Trade-off accepted**: The styling for the radio's "selected" disc is browser-default-ish (or hand-styled in Tailwind). If a future UoW requires a richer radio (e.g. with icons, animations, controlled focus traps), we can upgrade to Radix without breaking the component contract — `<RoleRadioGroup/>` already exposes `{value, onChange, error}`.

### D-RP-002 — Shared workspace boundary file
**Choice**: `shared/role.ts` is a new TypeScript file at the workspace root (sibling of `apps/`), exported by:
```ts
export const ROLES = ['MERCHANT', 'SELLER'] as const;
export type Role = (typeof ROLES)[number];
```
**Why**: Required by NFR-MAINT-003 + BR-A14. The npm workspace setup (already in `package.json` from auth UoW) means both `apps/frontend` and `apps/backend` can `import { ROLES, Role } from '../../shared/role'` (or via a path alias resolved at Stage 12).
**Trade-off accepted**: One more file at the repo root. Adds a single sentence to the Stage 16 deployment-amendment ("ship the shared/ directory in the build context for both images" — already true today because both Dockerfiles use the repo root as the build context).

### D-RP-003 — Postgres enum vs CHECK constraint
**Choice**: Postgres native enum type `Role { MERCHANT, SELLER }` rather than a `TEXT NOT NULL CHECK (role IN (...))` column.
**Why**:
- Type safety at the DB layer; Prisma generates a matching `enum Role` automatically.
- Trade-off accepted: enum value evolution (renames, removals) requires a migration. For this UoW with two stable values, that's acceptable. If product later asks for arbitrary role expansion, the migration step is one ALTER TYPE.

### D-RP-004 — Migration file naming + safety
**Choice**: `apps/backend/prisma/migrations/0002_add_role/migration.sql`. The file does `CREATE TYPE` + `ALTER TABLE ... ADD COLUMN ... NOT NULL DEFAULT 'SELLER'` in a single transaction. Rollback is manual via the SQL in `migration-rollback.sql` (drop column then drop type).
**Why**: Inherits the `0001_init` precedent set by auth. Backwards-compatible by construction (BR-A14).

---

## Dependency manifest — delta

| Package | Where | Version | Reason |
|---------|-------|---------|--------|
| (none added) | — | — | Native radio + native Postgres enum + reuse of existing zod/prisma — no new top-level dep. |

(Optional future bump: `@radix-ui/react-radio-group` deferred indefinitely; revisit only if a second radio surface arrives.)

---

## File layout — delta

```
roles-profile UoW touches:

apps/backend/
  prisma/
    schema.prisma                            # +enum Role; +User.role
    migrations/0002_add_role/
      migration.sql                           # NEW
  src/
    auth/dto/signup.dto.ts                   # +role: z.enum(ROLES)
    auth/auth.service.ts                     # forward role to repo
    users/users.repo.ts                      # accept + return role
    users/users.service.ts                   # include role in /users/me
    users/users.controller.ts                # serialize role
  tests/
    integration/signup-role.int-spec.ts      # NEW (NFR-T05)
    unit/role-source-of-truth.spec.ts        # NEW (NFR-MAINT-003)

apps/frontend/
  src/
    app/profile/page.tsx                     # NEW
    app/dashboard/page.tsx                   # +View-Profile link
    app/layout.tsx                           # mount <RoleBadge/>
    components/role-badge.tsx                # NEW
    components/role-radio-group.tsx          # NEW
    components/profile-field-row.tsx         # NEW
    forms/signup-form.tsx                    # +<RoleRadioGroup/>
    api/client.ts                            # User TS gains role
    auth/use-auth.ts                         # signup carries role

shared/
  role.ts                                    # NEW (single source of truth)

tests/e2e/                                   # Playwright amendment
  signup-role.e2e.ts                         # NEW
  profile.e2e.ts                             # NEW
```

---

## Validation
- [x] Stack inherited verbatim except for explicitly listed deltas.
- [x] Decision file references the pod choice timestamp (2026-05-13).
- [x] No new top-level dependency added.
- [x] Every decision references its driving BR or NFR.
- [x] File layout aligns with `apps/` + `shared/` already in place.

## Modification Log
| Timestamp (ISO) | Editor | Change |
|-----------------|--------|--------|
| 2026-05-13T09:55:00+05:30 | AI-DLC | Initial creation. Stage 11 stack amendment for Feature UoW; D-RP-001..004 captured; no new dep; pod picked native radio. |
