# Business Rules — `roles-profile` UoW (amendment over auth)

**Tier**: Feature     **Generated**: 2026-05-13T09:35:00+05:30
**Format**: amendment — extends `aidlc-docs/construction/auth/functional-design/business-rules.md`
**Numbering**: continues from auth's `BR-A12` → `BR-A13`, `BR-A14`, `BR-A15`, `BR-A16`
**Driving artifacts**: `roles-profile-requirements.md` (FRs 023-030 + amendments to 001/006/014; NFR-S11, NFR-A09, NFR-T05, NFR-MAINT-003)

---

## BR-A13 — Role at signup (required selection)
**Statement**: Every `POST /auth/signup` request MUST include a `role` field whose value is exactly one of `MERCHANT` or `SELLER`. The FE Signup form disables the submit button until the user picks one.
**Applies to**: `POST /auth/signup`, `<SignupForm/>`.
**Enforcement**:
- **API**: zod schema extends with `role: z.enum(['MERCHANT', 'SELLER'])` → 400 RFC 7807 on missing/invalid.
- **FE**: `<RoleRadioGroup>` is `required`; same `z.enum` mirrored client-side; submit disabled until role chosen.
- **NFR-S11** (server-side authoritative enum check) + **NFR-T05** (integration test: missing-role 400, invalid-role 400, valid signup 201).
**Error code**: `auth.role.invalid`
**User-facing copy**: "Please select a role (Merchant or Seller)."

## BR-A14 — Role data model + backwards-compat default
**Statement**: The `users.role` column is a non-nullable Postgres enum `Role { MERCHANT, SELLER }` with `DEFAULT 'SELLER'`. The default exists solely to satisfy NOT NULL for the migration backfill of auth-UoW rows that existed before this UoW; the API contract still treats `role` as required input on signup (BR-A13).
**Applies to**: DB schema, Prisma schema, `User` entity invariant.
**Enforcement**:
- **DB migration `0002_add_role`**: `CREATE TYPE "Role" AS ENUM ('MERCHANT','SELLER'); ALTER TABLE "users" ADD COLUMN "role" "Role" NOT NULL DEFAULT 'SELLER';`
- **Prisma schema**: `enum Role { MERCHANT SELLER }` + `role Role @default(SELLER)` on `User`.
- **Single source of truth** (NFR-MAINT-003): the union literal lives in `shared/role.ts`; BE zod, FE TS, and Prisma enum all reference the same set.
- **Invariant**: `users.role IN ('MERCHANT','SELLER')` is enforced at the type level by Postgres; no application-level CHECK constraint needed.
**Error code**: N/A (internal invariant).
**User-facing copy**: N/A.

## BR-A15 — Role badge in the authenticated header
**Statement**: For every authenticated route (`/dashboard`, `/account-setup`, `/profile`), the global header renders a small text badge with the literal label "Merchant" or "Seller" next to the display_name. On unauthenticated routes the badge MUST NOT render.
**Applies to**: `<Header/>` (or `<RootLayout/>`); `<RoleBadge/>`.
**Enforcement**:
- **FE component**: `<RoleBadge/>` reads `user.role` from the `useAuth()` cache; conditionally mounted behind the same `useAuth().user != null` gate as the rest of the header.
- **NFR-A09** (accessibility):
  - `aria-label="You are signed in as a Merchant"` (or "Seller") on the badge container.
  - Visible label text — NOT colour-only; if a tinted background is used, the text label still conveys the role.
  - Contrast ≥ 4.5:1 against the header surface — verified at Stage 14 axe-core scan.
- **NFR-S07** (no PII leakage): the header surface limits itself to `display_name` + role; nothing else.
**Error code**: N/A (display-only).
**User-facing copy**: literal "Merchant" or "Seller".

## BR-A16 — Profile route + Dashboard navigation
**Statement**: The path `/profile` is an authenticated FE-only route that renders four read-only fields (`email`, `display_name`, `timezone`, `account_setup_completed`), a Logout button, and a "Back to Dashboard" link. The Dashboard surfaces a "View Profile" link to `/profile`. Unauthenticated access to `/profile` redirects to Landing via the same `<AuthGuard/>` used by `/dashboard`.
**Applies to**: `<ProfilePage/>`, `<DashboardPage/>` (amendment).
**Enforcement**:
- **FE route guard**: `<AuthGuard requireSetupComplete={true}>` wraps `/profile` (same pattern as `/dashboard`).
- **FE**: reads `useAuth().user` for the four fields; `account_setup_completed` is rendered as "Yes"/"No" literal.
- **BE**: NO new endpoint. `GET /users/me` already returns these fields (FR-014 amended to include `role`).
- **Logout**: clicking the in-Profile Logout button hits the existing `POST /auth/logout` (BR-A09 family revoke + cookie clear).
- Continuity of the Dashboard greeting + logout (no regression — covered at Stage 14 / E2E).
**Error code**: N/A.
**User-facing copy**:
- Dashboard link label: "View Profile"
- Profile heading: "Your Profile"
- Profile back-link label: "Back to Dashboard"
- account_setup_completed labels: "Yes" / "No"

---

## Error code catalog — delta

| Code | Source rule | Status | RFC 7807 `type` |
|------|-------------|--------|-----------------|
| `auth.role.invalid` | BR-A13 | 400 | `/errors/validation` |

The pre-existing entries from the auth UoW remain unchanged.

---

## Compliance summary — delta

| NFR | Owning rule(s) |
|-----|-----------------|
| NFR-S11 (role enum server-side check) | BR-A13, BR-A14 |
| NFR-A09 (badge accessibility) | BR-A15 |
| NFR-T05 (signup-role integration test) | BR-A13 |
| NFR-MAINT-003 (single role source of truth) | BR-A14 |

---

## Modification Log
| Timestamp (ISO) | Editor | Change |
|-----------------|--------|--------|
| 2026-05-13T09:35:00+05:30 | AI-DLC | Initial creation. Stage 8 light amendment for the Feature UoW; 4 new rules (BR-A13/14/15/16); 1 new error code (`auth.role.invalid`). |
