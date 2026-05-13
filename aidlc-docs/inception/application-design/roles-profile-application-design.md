# Application Design — `roles-profile` UoW

**Tier**: Feature     **Depth**: Light (touches existing layers; one new FE route; no new BE service)
**Generated**: 2026-05-12T20:05:00+05:30
**Format**: amendment over `aidlc-docs/inception/application-design/application-design.md` (auth UoW base)

---

## Decisions inherited from auth (unchanged)
- Architecture: monolith
- API style: REST
- Database: Postgres (single instance)
- Auth: RS256 JWT in HttpOnly cookies + refresh-token family rotation
- Stack: Next.js 14 (App Router) + NestJS 10 + Prisma 5 + TypeScript
- Hosting: self-hosted

**No new ADRs** — this UoW does not introduce architectural decisions; it extends the existing model.

---

## Domain model delta

### `User` entity — amendment
Existing fields: `id`, `email`, `display_name`, `password_hash`, `verified`, `account_setup_completed`, `timezone`, `created_at`

**New field**:
- `role: Role` — Postgres enum `Role { MERCHANT, SELLER }`; NOT NULL; default `SELLER` (the migration default backfills existing rows; v2 may drop the default to force explicit role on every new row)

### New types
- Postgres: `CREATE TYPE "Role" AS ENUM ('MERCHANT', 'SELLER');`
- Prisma: `enum Role { MERCHANT SELLER }`
- BE zod: `z.enum(['MERCHANT', 'SELLER'])`
- FE TS union: `type Role = 'MERCHANT' | 'SELLER'` (shared via `shared/role.ts` per NFR-MAINT-003)

---

## Component changes

### BE — minimal surface
| Component | Change |
|-----------|--------|
| `prisma/schema.prisma` | Add `enum Role` + `role` field on `User` |
| `prisma/migrations/0002_add_role/migration.sql` | New migration creating the enum + adding the NOT NULL DEFAULT 'SELLER' column |
| `src/auth/dto/signup.dto.ts` | Extend zod schema with `role: z.enum(['MERCHANT', 'SELLER'])` |
| `src/auth/auth.service.ts` (signup) | Forward `role` from DTO into `users.repo.create()` |
| `src/users/users.repo.ts` (create / findByEmail / findById) | Accept + return `role`; Prisma auto-handles |
| `src/users/users.service.ts` + `users.controller.ts` (`GET /users/me`) | Include `role` in the sanitized response |
| `src/auth/auth.service.ts` (login/refresh response shape) | Include `role` in the returned user object (Prisma already returns it; just don't strip it) |
| `tests/integration/signup-role.int-spec.ts` | New integration test (NFR-T05) covering: valid signup with role, missing role 400, invalid role 400 |

No new module needed. No new endpoint. Public API surface gains one field (`role`) on three response shapes (signup, login, /users/me) and one required input on one request shape (signup body).

### FE — surface
| Component | Change |
|-----------|--------|
| `shared/role.ts` (new) | Exports `type Role = 'MERCHANT' \| 'SELLER'`; both BE + FE import |
| `apps/frontend/src/api/client.ts` | Update `User` TS type to include `role: Role` |
| `apps/frontend/src/use-auth.tsx` | Pass role through signup() helper |
| `apps/frontend/src/components/forms/signup-form.tsx` | Add `<RoleRadioGroup>` block with paired label, two radios, FE validation |
| `apps/frontend/src/components/role-badge.tsx` (new) | Renders "Merchant" / "Seller" pill; reads user.role |
| `apps/frontend/src/app/layout.tsx` (or new `header.tsx`) | Mount `<RoleBadge>` next to display_name in the authenticated header |
| `apps/frontend/src/app/dashboard/page.tsx` | Add `<Link href="/profile">View Profile</Link>` with `data-testid="dashboard-view-profile"` |
| `apps/frontend/src/app/profile/page.tsx` (new) | Full route component — wraps in `<AuthGuard>`, shows 4 baseline fields, has Logout button + "Back to Dashboard" link |

### Sequence diagram delta — Signup (the only flow that changes)
```mermaid
sequenceDiagram
    autonumber
    participant FE as Signup form
    participant API as POST /auth/signup
    participant Svc as AuthService
    participant DB as Postgres
    FE->>FE: validate email + display_name + password ≥ 12 + role ∈ {MERCHANT, SELLER}
    FE->>API: {email, displayName, password, role}
    API->>API: zod parse → 400 if role invalid (NFR-S11)
    API->>Svc: signup(dto, requestId)
    Svc->>Svc: normalizeEmail(email); hash password (Argon2id)
    Svc->>DB: INSERT INTO users (..., role) VALUES (..., $5)
    DB-->>Svc: User row (id, ..., role)
    Svc->>Svc: mint access + refresh JWT (RS256)
    Svc-->>API: AuthOutcome with user.role
    API-->>FE: 201 + cookies + {user: {…, role}}
    FE->>FE: redirect to /account-setup; cache user (incl. role)
```

Other flows (login, refresh, logout, account-setup, dashboard view) are **unchanged** in shape — they merely propagate the additional `role` field through the existing user-object payload.

---

## Validation
- [x] Domain model delta documented (single new field; new enum types in 4 places aligned via NFR-MAINT-003)
- [x] BE + FE component-level changes enumerated
- [x] One Mermaid sequence-diagram delta (signup) — other flows unchanged
- [x] No new ADRs needed
- [x] All changes traceable to FRs in `roles-profile-requirements.md`
- [x] No cross-UoW interaction surface — `roles-profile` cleanly extends `auth`

## Modification Log
| Timestamp (ISO) | Editor | Change |
|-----------------|--------|--------|
| 2026-05-12T20:05:00+05:30 | AI-DLC | Initial creation. Light Application Design amendment for the Feature UoW. |
