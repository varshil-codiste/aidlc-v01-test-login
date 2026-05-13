# Frontend Components — auth UoW

**Generated**: 2026-05-12T00:15:00Z
**Note**: framework names (React vs Next.js vs Vue) are deferred to Stage 11 per ADR-006. The shape, props, and `data-testid` set below are framework-neutral.

---

## Component Tree

```
<App>
├── <ThemeProvider>           // sources tokens from design-tokens.json
├── <ToastHost>               // global toast outlet
├── <QueryClientProvider>     // server-state library (TanStack Query etc.)
└── <Router>
    ├── route "/" → <LandingPage>
    │   ├── <BrandPanel side="left">
    │   │   ├── <Heading text="Become A Merchant"/>
    │   │   ├── <Paragraph text="Register to become a Merchant ..."/>
    │   │   └── <OutlinedButton label="Sign Up" data-testid="landing-signup-cta" onClick={→ /signup}>
    │   └── <Card side="right">
    │       ├── <BrandLogo data-testid="landing-logo"/>
    │       ├── <Heading text="Sign In to Zone POS"/>
    │       ├── <Paragraph text="You need to have registered ..."/>
    │       └── <SignInForm/>
    │           ├── <FormInput name="email" type="email" label="Email" data-testid="signin-email"/>
    │           ├── <FormInput name="password" type="password" label="Password" data-testid="signin-password"/>
    │           ├── <FormError data-testid="signin-error" aria-live="polite"/>
    │           └── <PrimaryButton label="Sign In" data-testid="signin-submit" disabled={!isValid || isSubmitting}/>
    ├── route "/signup" → <SignupPage>
    │   ├── <BrandPanel side="left" copy="Become A Merchant"/>
    │   └── <Card side="right">
    │       └── <SignupForm/>
    │           ├── <FormInput name="email" type="email" label="Email" data-testid="signup-email"/>
    │           ├── <FormInput name="display_name" label="Display name" data-testid="signup-display-name"/>
    │           ├── <FormInput name="password" type="password" label="Password (≥ 12 chars)" data-testid="signup-password"/>
    │           ├── <FormError data-testid="signup-error" aria-live="polite"/>
    │           └── <PrimaryButton label="Create account" data-testid="signup-submit" disabled={!isValid || isSubmitting}/>
    ├── route "/account-setup" → <AuthGuard requireSetupComplete={false}><AccountSetupPage/></AuthGuard>
    │   └── <AccountSetupForm/>
    │       ├── <FormInput name="display_name" label="Display name" data-testid="setup-display-name"/>  // pre-filled
    │       ├── <Select name="timezone" label="Timezone" options={IANA_TIMEZONES} default="Asia/Kolkata" data-testid="setup-timezone"/>
    │       ├── <FormError data-testid="setup-error" aria-live="polite"/>
    │       └── <PrimaryButton label="Finish setup" data-testid="setup-submit" disabled={!isValid || isSubmitting}/>
    ├── route "/dashboard" → <AuthGuard><DashboardPage/></AuthGuard>
    │   ├── <Heading data-testid="dashboard-greeting">{`Hello, ${user.display_name}`}</Heading>
    │   └── <PrimaryButton label="Logout" data-testid="dashboard-logout" onClick={LogoutAction}/>
    └── route "*" → <NotFoundPage/>
```

---

## Component table

| Component | Type | Props | State | Notes |
|-----------|------|-------|-------|-------|
| `App` | layout | — | — | mounts providers + router |
| `ThemeProvider` | provider | `{tokens: DesignTokens}` | — | feeds `design-tokens.json` to Tailwind / shadcn / CSS vars |
| `ToastHost` | host | — | toast queue | global pop-up host |
| `QueryClientProvider` | provider | — | — | server-state cache |
| `Router` | wrapper | route table | — | router-library specific |
| `AuthGuard` | wrapper | `{children, requireSetupComplete?: boolean = true}` | — | reads `useAuth()`; redirects per BR-A11 |
| `LandingPage` | page | — | form state for sign-in | renders both panels |
| `SignupPage` | page | — | form state for signup | |
| `AccountSetupPage` | page | — | form state for setup | pre-fills display_name from `useAuth().user` |
| `DashboardPage` | page | — | — | reads `useAuth().user` |
| `NotFoundPage` | page | — | — | 404 |
| `BrandPanel` | component | `{side: 'left'|'right', children}` | — | `#016097` bg when side=left |
| `Card` | component | `{children}` | — | white surface for right side |
| `SignInForm` | form | `{onSubmit}` | `{email, password, submitting, error}` | calls `useAuth().login` |
| `SignupForm` | form | `{onSubmit}` | `{email, display_name, password, submitting, error}` | calls `useAuth().signup` |
| `AccountSetupForm` | form | `{onSubmit, initialDisplayName}` | `{display_name, timezone, submitting, error}` | calls `useAuth().updateProfile` |
| `FormInput` | component | `{name, type='text', label, value, onChange, error?, data-testid}` | — | paired `<label>` (NFR-A01); `aria-describedby` linked to FormError |
| `Select` | component | `{name, label, options, value, onChange, error?, data-testid}` | — | accessible native `<select>` |
| `FormError` | component | `{children, data-testid}` | — | `aria-live="polite"`; uses `danger` token color + leading icon (NFR-A03) |
| `PrimaryButton` | component | `{label, onClick, disabled, type='button', data-testid}` | — | orange (`#ef8022`) pill, 62 tall; visible focus state |
| `OutlinedButton` | component | `{label, onClick, disabled, data-testid}` | — | white-bordered pill on `#016097` bg |
| `BrandLogo` | component | `{data-testid}` | — | renders `zone` PNG from `branding.md` § Source asset |
| `Heading` | component | `{level=1|2|3, text, data-testid?}` | — | renders `<h1>`/`<h2>` semantically |
| `Paragraph` | component | `{text}` | — | uses `neutral.500` (`#737272` after Q1 fix) for subtitle role |
| `LogoutAction` | action | — | — | not a component; an event handler that calls `useAuth().logout` |

---

## State Management

| Concern | Pattern |
|---------|---------|
| Form local state | `useState` per field; managed by form component |
| Server state (`/users/me`) | TanStack Query (or framework-equivalent, Stage 11) — `useQuery(['me'])` |
| Auth side-effects | `useAuth()` hook; wraps `ApiClient` calls; on `signup` / `login` / `updateProfile` it `cache.invalidate(['me'])` |
| Routing | Framework router (App Router / React Router — Stage 11) |
| Toast | Imperative API: `toast.show('Signed out')` |

---

## Test IDs (team convention `data-testid="<surface>-<role>"`)

All interactive elements above include a `data-testid`. The Stage-13 Code Review + Stage-14 Manual QA + Stage-15 E2E will reference these IDs:

```
landing-signup-cta
landing-logo
signin-email
signin-password
signin-submit
signin-error
signup-email
signup-display-name
signup-password
signup-submit
signup-error
setup-display-name
setup-timezone
setup-submit
setup-error
dashboard-greeting
dashboard-logout
```

---

## Accessibility specifics (NFR-A01..A08 ↔ component)

| NFR | Implementation |
|-----|----------------|
| **A01** (label paired) | `FormInput` and `Select` both render an explicit `<label htmlFor={name}>`; placeholder text is supplementary, not the label |
| **A02** (visible focus) | `PrimaryButton`, `OutlinedButton`, `FormInput`, `Select` define a global focus-visible ring with ≥ 3:1 contrast against surroundings |
| **A03** (color not sole indicator) | `FormError` includes a leading `<svg>` error icon plus the `danger` color; success states (if any) similarly use icon + color |
| **A04** (contrast ≥ 4.5:1) | tokens after Q1 fix: heading `#2c2b2b` on white (15:1 ✓), subtitle `#737272` on white (≈4.6:1 ✓), placeholder `#737272` on `#f9f9f9` (≈4.4:1 — borderline; supplementary only — labels carry meaning) |
| **A05** (keyboard nav order) | Tab order matches visual: Landing(signup-cta → signin-email → signin-password → signin-submit); Signup(email → display_name → password → submit); Setup(display_name → timezone → submit); Dashboard(logout) |
| **A06** (unique `<h1>` per route) | Landing: "Sign In to Zone POS"; Signup: "Create your account"; Setup: "Complete your account setup"; Dashboard: `Hello, {display_name}` |
| **A07** (touch target ≥ 44px) | All buttons are 56–62px tall (Figma); inputs are 62px tall — passes |
| **A08** (errors linked) | `FormError` is bound to its input via `aria-describedby={`${inputId}-error`}`; FormInput accepts `aria-invalid={!!error}` |

---

## Responsive behavior (FR-020 / NFR-A07)

| Breakpoint | Behavior |
|-----------|----------|
| `≥ 1024px` | 50/50 split per Figma |
| `768–1023px` | 60/40 split; left panel padding reduced |
| `480–767px` | Single column; brand panel collapses to a slim header strip with logo + tag line; CTAs and form stack vertically; full-width buttons |
| `< 480px` | Slim header (no decorative text); form takes full viewport width with 16px gutters |

---

## Code organization (framework-neutral)

```
apps/frontend/                          # final path confirmed at Stage 11
  src/
    app/                                # or pages/ (React Router) or app/ (Next App Router) — Stage 11
      _layout.tsx                       # mounts providers + router
      page.tsx                          # LandingPage
      signup/page.tsx                   # SignupPage
      account-setup/page.tsx            # AccountSetupPage (AuthGuard wrapped)
      dashboard/page.tsx                # DashboardPage (AuthGuard wrapped)
    components/
      brand-panel.tsx
      card.tsx
      form-input.tsx
      form-error.tsx
      primary-button.tsx
      outlined-button.tsx
      brand-logo.tsx
      heading.tsx
      paragraph.tsx
      select.tsx
      toast-host.tsx
    forms/
      sign-in-form.tsx
      signup-form.tsx
      account-setup-form.tsx
    auth/
      auth-guard.tsx
      use-auth.ts
      logout-action.ts
    api/
      client.ts                         # ApiClient (generated + silent-refresh wrapper)
    theme/
      tokens.ts                         # imported from shared/design-tokens.json
```

(Exact filenames / extensions / framework-specific suffixes resolved at Stage 11.)
