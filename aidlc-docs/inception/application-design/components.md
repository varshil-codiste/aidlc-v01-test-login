# Components

**Generated**: 2026-05-12T00:11:00Z
**Naming**: framework-neutral (per ADR-006); Stage 11 will resolve to concrete file paths.

---

## Frontend (Web)

| Component | Responsibility | Type |
|-----------|---------------|------|
| `App` | Root component; mounts router + global providers (theme, toast, query client) | layout |
| `Router` | Declares routes: `/`, `/signup`, `/account-setup`, `/dashboard`, plus 404 | wrapper |
| `AuthGuard` | Wrapper around protected routes; redirects to `/` if no auth cookie; redirects to `/account-setup` if setup incomplete | wrapper |
| `LandingPage` | Renders the Figma split-screen: left brand panel + Sign Up CTA; right logo + Sign In form | page |
| `SignupPage` | Form: email, display_name, password; submits → `POST /auth/signup`; redirects to `/account-setup` | page |
| `AccountSetupPage` | Form: display_name (pre-filled), timezone dropdown; submits → `PATCH /users/me/profile`; redirects to `/dashboard` | page |
| `DashboardPage` | Shows "Hello, {display_name}" + Logout button | page |
| `LogoutAction` | Calls `POST /auth/logout`; clears local state; redirects to `/` with "Signed out" toast | action |
| `BrandPanel` | Reusable `#016097` left panel with heading + subtitle + CTA slot (used on Landing) | component |
| `FormInput` | Labeled input (`<label>` paired); supports error state via `aria-describedby`; matches Figma `#f9f9f9` + 6px radius | component |
| `PrimaryButton` | Orange (`#ef8022`) pill button — used for Sign In / Submit | component |
| `OutlinedButton` | White-outline pill button — used for left-panel CTA | component |
| `FormError` | Inline error message; uses `danger` color + leading icon (NFR-A03); announced via `aria-live="polite"` | component |
| `Toast` | Transient status pill — used for "Signed out" | component |
| `ApiClient` | Typed HTTP client generated from OpenAPI; handles cookies (browser native); includes silent-refresh interceptor | service |
| `useAuth` | Hook exposing `{user, isLoading, login, signup, logout}` reading from `GET /users/me` | hook |

---

## Backend (framework chosen at Stage 11)

| Component | Responsibility | Layer |
|-----------|---------------|-------|
| `bootstrap` | Boot the HTTP server, load env, register middleware + routes, fail-fast on missing env vars | bootstrap |
| `RequestIdMiddleware` | Generate or pass-through W3C `traceparent` / UUIDv4 `request_id`; attach to context + response header | middleware |
| `LoggerMiddleware` | Emit structured JSON log per request (NFR-O01) | middleware |
| `CorsMiddleware` | Allow only configured FE origin | middleware |
| `AuthMiddleware` | Read access-token cookie, verify RS256 JWT, attach `user_id` to context | middleware |
| `RateLimitMiddleware` | Enforce 5-per-15min on `/auth/login`; in-memory keyed by email | middleware |
| `ValidationMiddleware` | Schema-validate request body / query / params per OpenAPI; reject on first violation with RFC 7807 | middleware |
| `ErrorEnvelopeMiddleware` | Catch unhandled errors; emit RFC 7807 `application/problem+json` with `request_id` | middleware |
| `AuthController` | Endpoints: signup, login, refresh, logout | controller |
| `UserController` | Endpoints: `GET /users/me`, `PATCH /users/me/profile` | controller |
| `HealthController` | `GET /health` (no auth) | controller |
| `JwksController` | `GET /.well-known/jwks.json` (no auth; serves the JWT public key) | controller |
| `AuthService` | Orchestrates signup + login + refresh + logout; uses UserRepo, RefreshTokenRepo, PasswordHasher, JwtSigner | service |
| `UserService` | Profile updates; user fetch | service |
| `PasswordHasher` | Wraps Argon2id; provides `hash()` + `verify()` | service |
| `JwtSigner` | RS256 sign + verify; loads keys at bootstrap; exposes JWKS payload | service |
| `EmailStub` | Emits a single JSON line to stdout (no real SMTP) | service |
| `UserRepo` | CRUD on `users` table | repository |
| `RefreshTokenRepo` | CRUD on `refresh_tokens` table; rotation semantics + family revocation | repository |
| `Logger` | Wraps the chosen JSON logger (pino / structlog / slog) with the required-field schema | utility |

---

## Shared (cross-stack contracts + assets)

| Component | Responsibility | Stack |
|-----------|---------------|-------|
| `openapi.yaml` | Source-of-truth API spec; defines paths, schemas, security schemes | shared (BE-authored, FE-consumed) |
| `design-tokens.json` | Exportable token file derived from `design/design-tokens.md` (DTCG format) | FE (consumed via build-time codegen or Tailwind theme) |
| `theme.css` / `theme.ts` | Maps tokens to Tailwind / shadcn / CSS variables — implementation at Stage 11 | FE |
| `.env.example` | Document required env vars (`JWT_PRIVATE_KEY`, `DATABASE_URL`, `FE_ORIGIN`, `NODE_ENV` / `APP_ENV`) | shared |

---

## Out-of-scope components (v1)

These components are **NOT** built in v1 but the architecture leaves room for them:

| Component | Why deferred |
|-----------|--------------|
| `MailerService` (real SMTP) | BR § 1.4 — email-verification stub only |
| `PasswordResetController` | BR § 1.4 — no password reset |
| `OauthController` (Google/GitHub) | BR § 1.4 — no social login |
| `MfaService` (TOTP) | BR § 1.4 — no MFA |
| `AdminController` | BR § 1.4 — no admin UI |
| `AvatarUploadController` | BR § 1.4 — no profile picture |
| `I18nProvider` (FE) | Q11=A — English only; copy externalized to constants for later swap |
| `WebSocketGateway` / SSE | requirements § 5 — no real-time |
