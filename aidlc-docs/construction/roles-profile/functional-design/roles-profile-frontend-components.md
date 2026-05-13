# Frontend Components — `roles-profile` UoW (amendment over auth)

**Tier**: Feature     **Generated**: 2026-05-13T09:35:00+05:30
**Format**: amendment — extends `aidlc-docs/construction/auth/functional-design/frontend-components.md`
**Stack**: confirmed at Stage 11 = Next.js 14 (App Router) + Tailwind/shadcn (inherited from auth)

---

## Component tree — delta

```
<App>
├── <ThemeProvider/>             // unchanged
├── <ToastHost/>                 // unchanged
├── <QueryClientProvider/>       // unchanged
└── <Router>
    ├── route "/" → <LandingPage/>                // unchanged
    ├── route "/signup" → <SignupPage>
    │   └── <SignupForm/>
    │       ├── <FormInput name="email"/>          // unchanged
    │       ├── <FormInput name="display_name"/>   // unchanged
    │       ├── <FormInput name="password"/>       // unchanged
    │       ├── <RoleRadioGroup/> ◄ NEW            // BR-A13
    │       │   ├── <RoleRadio value="MERCHANT" data-testid="signup-role-merchant"/>
    │       │   └── <RoleRadio value="SELLER"   data-testid="signup-role-seller"/>
    │       ├── <FormError/>                       // unchanged
    │       └── <PrimaryButton label="Create account" disabled={!isValid}/>
    ├── route "/account-setup" → <AuthGuard><AccountSetupPage/></AuthGuard>     // unchanged shape; header now shows badge
    ├── route "/dashboard" → <AuthGuard><DashboardPage>
    │   ├── <Heading data-testid="dashboard-greeting">                          // unchanged
    │   ├── <Link href="/profile" data-testid="dashboard-view-profile"/> ◄ NEW  // BR-A16
    │   └── <PrimaryButton label="Logout" data-testid="dashboard-logout"/>      // unchanged
    │   </DashboardPage></AuthGuard>
    ├── route "/profile" → <AuthGuard><ProfilePage/></AuthGuard> ◄ NEW           // BR-A16
    │   ├── <Heading text="Your Profile"/>
    │   ├── <ProfileFieldRow label="Email" value={user.email} data-testid="profile-email"/>
    │   ├── <ProfileFieldRow label="Display name" value={user.display_name} data-testid="profile-display-name"/>
    │   ├── <ProfileFieldRow label="Timezone" value={user.timezone} data-testid="profile-timezone"/>
    │   ├── <ProfileFieldRow label="Account setup complete" value={user.account_setup_completed ? "Yes" : "No"} data-testid="profile-setup-complete"/>
    │   ├── <PrimaryButton label="Logout" data-testid="profile-logout"/>
    │   └── <Link href="/dashboard" data-testid="profile-back-dashboard">Back to Dashboard</Link>
    └── (authenticated header — visible across /dashboard, /account-setup, /profile)
        ├── <BrandLogo/>
        ├── <span>{user.display_name}</span>
        └── <RoleBadge data-testid="header-role-badge"/> ◄ NEW                   // BR-A15
```

---

## Component table — delta

| Component | New / Changed | Props | State | Notes |
|-----------|---------------|-------|-------|-------|
| `SignupForm` | **Changed** | unchanged signature | adds `role` field | `useState`-managed `role: Role \| null`; FE-side zod mirrors `z.enum(['MERCHANT','SELLER'])`; submit disabled when `role == null` (US-009 AC1+AC4) |
| `RoleRadioGroup` | **New** | `{value: Role \| null, onChange: (Role)=>void, error?: string}` | — | Two radios with a paired group label "I am a…"; the label is wired via `aria-labelledby`; each radio has `aria-checked`; keyboard nav: ←/→ moves between radios per ARIA APG (NFR-A09) |
| `RoleRadio` | **New** | `{value: Role, label: string, checked: boolean, onChange, data-testid}` | — | Wraps `<input type="radio" name="role">` + `<label>` paired via `htmlFor`; visible focus ring shared with `FormInput` |
| `RoleBadge` | **New** | `{role: Role}` | — | Renders the literal label "Merchant" or "Seller"; `aria-label="You are signed in as a Merchant"` (or Seller); contrast ≥ 4.5:1; NOT colour-only (NFR-A09) |
| `Header` (or `<RootLayout/>` slot) | **Changed** | — | — | Mounts `<RoleBadge role={user.role}/>` next to `display_name` only when `useAuth().user != null` (BR-A15); on Landing / Signup, the badge does not render |
| `DashboardPage` | **Changed** | — | — | Adds the "View Profile" `<Link/>` (data-testid `dashboard-view-profile`); existing greeting + logout button unchanged (no regression — US-005 still passes) |
| `ProfilePage` | **New** | — | reads `user` from `useAuth()` | Read-only; four field rows (email, display_name, timezone, account_setup_completed); Logout button + Back-to-Dashboard link; wrapped by `<AuthGuard requireSetupComplete={true}/>` |
| `ProfileFieldRow` | **New** | `{label: string, value: string, data-testid}` | — | Simple presentational row: `<dt>{label}</dt><dd data-testid={data-testid}>{value}</dd>` |

Unchanged components: `LandingPage`, `SignInForm`, `AccountSetupForm`, `AccountSetupPage`, `ThemeProvider`, `ToastHost`, `QueryClientProvider`, `Router`, `AuthGuard`, `BrandPanel`, `Card`, `FormInput`, `Select`, `FormError`, `PrimaryButton`, `OutlinedButton`, `BrandLogo`, `Heading`, `Paragraph`, `LogoutAction`.

---

## State management — delta

| Concern | Pattern |
|---------|---------|
| `role` field state on signup | local `useState<Role \| null>(null)` inside `SignupForm`; lifted to `useAuth().signup({…, role})` on submit |
| `user.role` server-state | hydrated as part of the existing `useQuery(['me'])` payload (FR-014 amended; `GET /users/me` already returns the field) |
| Header rendering of `<RoleBadge/>` | conditional on `useAuth().user != null`; rerenders automatically on cache invalidate after signup/login/logout |

---

## Test IDs — delta (added)

```
signup-role-merchant
signup-role-seller
signup-role-error          // used by FormError when role is missing
header-role-badge
dashboard-view-profile
profile-email
profile-display-name
profile-timezone
profile-setup-complete
profile-logout
profile-back-dashboard
```

Pre-existing IDs from auth (e.g. `signup-email`, `dashboard-greeting`, `dashboard-logout`) are unchanged.

---

## Accessibility specifics — delta (NFR-A09 ↔ component)

| NFR | Implementation |
|-----|----------------|
| **A09a** (radio group labelled) | `<RoleRadioGroup/>` renders a `<fieldset><legend>I am a…</legend>` (or `role="radiogroup"` with `aria-labelledby`); each radio uses a paired `<label>` (NFR-A01 still holds) |
| **A09b** (radio keyboard) | Per ARIA APG: Tab focuses the group, ←/→/↑/↓ moves between radios, Space toggles; `<RoleRadio/>` relies on the native `<input type="radio">` which already implements this |
| **A09c** (badge a11y) | `<RoleBadge/>` has `aria-label="You are signed in as a {Role}"`; text label is independent of color (BR-A15) |
| **A09d** (badge contrast) | Token used must hit ≥ 4.5:1 — verified by axe-core at Stage 14; default uses the existing `neutral.900` on header surface, which is already proven 15:1 |
| **A09e** (profile read-only landmarks) | `<ProfilePage/>` uses `<main>` with a single `<h1>`; the field rows use `<dl>` / `<dt>` / `<dd>` semantics |

The pre-existing A01..A08 entries from auth carry over unchanged.

---

## Responsive behavior — delta

| Breakpoint | Behavior |
|-----------|----------|
| `≥ 1024px` | Header shows display_name + `<RoleBadge/>` inline. Profile page uses a 2-column field-row layout (label \| value). |
| `768–1023px` | Same as ≥1024 with reduced padding. |
| `480–767px` | Badge wraps below the display_name in the header. Profile page collapses field rows to single-column stacked. |
| `< 480px` | Same as 480–767 with 16px gutters; badge font-size shrinks one step. |

Signup form responsive behavior is unchanged — the radio group fits inline at all breakpoints because its two-option width is small.

---

## Code organization — delta

```
apps/frontend/
  src/
    app/
      profile/
        page.tsx                          # NEW — ProfilePage
      dashboard/
        page.tsx                          # CHANGED — adds View-Profile link
      layout.tsx                          # CHANGED — header mounts <RoleBadge/>
    components/
      role-badge.tsx                      # NEW
      role-radio-group.tsx                # NEW (exports RoleRadioGroup + RoleRadio)
      profile-field-row.tsx               # NEW
    forms/
      signup-form.tsx                     # CHANGED — adds <RoleRadioGroup/>
    api/
      client.ts                           # CHANGED — User TS type gains role
    auth/
      use-auth.ts                         # CHANGED — signup() helper carries role

shared/
  role.ts                                 # NEW — single source of truth for the Role union
```

---

## Validation
- [x] One new form control (`<RoleRadioGroup/>`), one new badge (`<RoleBadge/>`), one new page (`<ProfilePage/>`), one new field row (`<ProfileFieldRow/>`), one Dashboard amendment (View-Profile link).
- [x] Every new interactive element has a `data-testid`.
- [x] All four new ACs that touch the FE (US-009 AC1/AC4, US-010 AC1..AC4, US-011 AC1..AC6) trace to at least one component above.
- [x] No new auth pattern, no new state library, no new dependency at the component layer.

## Modification Log
| Timestamp (ISO) | Editor | Change |
|-----------------|--------|--------|
| 2026-05-13T09:35:00+05:30 | AI-DLC | Initial creation. Stage 8 component-tree amendment for Feature UoW; 4 new components + 3 changed components + 11 new test IDs. |
