# Logical Components — `roles-profile` UoW (amendment over auth)

**Tier**: Feature     **Generated**: 2026-05-13T09:52:00+05:30
**Format**: amendment — extends `aidlc-docs/construction/auth/nfr-design/auth-logical-components.md`
**Naming**: `LC-{NN}`. Continues from auth's `LC-013` → `LC-014`, `LC-015`, `LC-016`.

---

## Inherited (unchanged)

`LC-001` Rate-limit map, `LC-002` Request-ID middleware, `LC-003` JSON Logger with redactor, `LC-004` Cookie helper, `LC-005` PasswordHasher service, `LC-006` JWT signer + JWKS cache, `LC-007` RefreshTokenRotation transaction service, `LC-008` EmailStub, `LC-009` AuthGuard FE, `LC-010` `useAuth()` hook, `LC-011` ApiClient + silent-refresh wrapper, `LC-012` design-token store, `LC-013` axe-core scan harness — all inherited unchanged.

The `User` repo, the `AuthService.signup()` method, and the `GET /users/me` controller are extended with a single field pass-through rather than gaining new logical components — they remain part of the same LC surface.

---

## New components (delta)

### LC-014 — `<RoleBadge/>` FE component
**Purpose**: Render the literal text label "Merchant" or "Seller" in the authenticated header, with `aria-label` and adequate contrast. Conditionally mounted only when `useAuth().user != null`.
**Type**: FE presentational component.
**Tech (Stage 11)**: Next.js 14 `'use client'` component; Tailwind + design tokens; no third-party library.
**NFRs owned**: NFR-A09 (badge portion), BR-A15.
**Lifecycle**: re-renders when `useAuth()` user changes; unmounts on logout.

### LC-015 — `<RoleRadioGroup/>` FE component
**Purpose**: Two-radio control inside `<SignupForm/>`. Renders a `<fieldset>` with a paired group label "I am a…"; the two `<input type="radio" name="role">` elements rely on native keyboard semantics (Tab into group, ←/→/↑/↓ to move, Space to select). Reports `null` / `'MERCHANT'` / `'SELLER'` to the form state.
**Type**: FE controlled component.
**Tech (Stage 11)**: native `<input type="radio">` is the default; Stage 11 may upgrade to `@radix-ui/react-radio-group` if the pod wants the styled primitive — interface is `{value, onChange, error}` either way.
**NFRs owned**: NFR-A09 (radio portion), BR-A13.

### LC-016 — `<ProfilePage/>` FE route component
**Purpose**: Read-only profile page at `/profile`. Renders four `<ProfileFieldRow/>` rows (email, display_name, timezone, account_setup_completed Yes/No), a Logout button (`data-testid="profile-logout"`) that hits the existing `POST /auth/logout`, and a "Back to Dashboard" link.
**Type**: FE page (Next.js App Router `app/profile/page.tsx`), wrapped by `<AuthGuard requireSetupComplete={true}/>`.
**Tech (Stage 11)**: Next.js 14 App Router; reads `useAuth().user`; no new server-side surface needed.
**NFRs owned**: NFR-A09 (landmarks + `<dl>` semantics), BR-A16.
**Notes**: No BE LC needed for `/profile` — it reads from the existing `GET /users/me` (which is `LC-011 ApiClient` machinery + the inherited `GET /users/me` controller in the auth UoW).

---

## Component map after this UoW

```
auth LCs (1-13)        ──────────►  unchanged
                                     │
                                     ├── role field plumbed through signup→DB→/me (no new LC, just method-signature delta)
                                     │
roles-profile LCs (14-16) ─────────►  LC-014 RoleBadge
                                       LC-015 RoleRadioGroup
                                       LC-016 ProfilePage
```

---

## NFR ↔ LC matrix — delta

| NFR | Owning LC(s) |
|-----|--------------|
| NFR-S11 (role enum server-side) | (no new LC — enforced by extension of the existing zod DTO + Postgres enum) |
| NFR-A09 (radio) | LC-015 |
| NFR-A09 (badge) | LC-014 |
| NFR-A09 (profile landmarks) | LC-016 |
| NFR-T05 (signup-role integration) | (no new LC — uses the inherited Vitest harness against real Postgres in CI) |
| NFR-MAINT-003 (single source of truth) | (no LC — file-layout invariant in `shared/role.ts`) |

---

## Modification Log
| Timestamp (ISO) | Editor | Change |
|-----------------|--------|--------|
| 2026-05-13T09:52:00+05:30 | AI-DLC | Initial creation. Stage 10 LC amendment for Feature UoW; 3 new LCs (14, 15, 16); 13 auth LCs inherited unchanged. |
