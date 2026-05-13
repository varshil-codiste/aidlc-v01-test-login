# Application Design Checklist

**Tier**: Greenfield
**Generated**: 2026-05-12T00:11:00Z

## Items

### Section 1 — Plan-item resolution
- [x] Architectural style chosen (Monolith — Q1=A)
- [x] Deployment topology chosen (docker-compose 3-service — Q2=A)
- [x] API surface chosen (REST + OpenAPI 3.1 — Q3=A)
- [x] Auth strategy chosen (JWT cookies + refresh rotation + RS256 — Q4=A)
- [x] Data store chosen (Postgres 16 single instance — Q5=A)
- [x] Cross-stack contract format chosen (OpenAPI 3.1 — Q6=A)
- [x] Error envelope chosen (RFC 7807 — Q7=A)
- [x] Stack Selection deferment confirmed (per UoW at Stage 11 — Q8=A)
- [x] Real-time / i18n / pagination cross-stack concerns documented (all N/A v1)

### Section 2 — Generated artifacts
- [x] `application-design.md` produced — top-level synthesis + Mermaid architecture diagram + ASCII alternative + 6 ADRs (ADR-001..006) + cross-stack edge catalog + explicit out-of-scope list
- [x] `components.md` produced — FE (16 components) + BE (20 components) + Shared (4 components) + Out-of-scope catalog
- [x] `component-methods.md` produced — non-trivial signatures for ApiClient, useAuth, AuthGuard, AuthController, UserController, AuthService, PasswordHasher, JwtSigner, EmailStub, RefreshTokenRepo, middleware order
- [x] `services.md` produced — AuthService 4-flow walkthrough (signup, login, refresh, logout) + UserService + FE AuthClient + cross-cutting concerns (request-id, time, config env vars)
- [x] `component-dependency.md` produced — BE graph + FE graph + cross-stack edges + dependency matrix + forbidden-dependency list

### Section 3 — Quality
- [x] Every component in `components.md` has a one-line responsibility
- [x] Every cross-stack edge in § 7 of application-design.md names a contract (OpenAPI path)
- [x] Every ADR is dated and slated for Tech-Lead signature at Gate #2
- [x] Mermaid diagrams have text alternatives (architecture diagram includes ASCII fallback)
- [x] Forbidden-dependency list explicit (`component-dependency.md` § Forbidden)

### Section 4 — Extension touch-points (consistency with Stage 4 opt-ins)
- [x] **Security**: every NFR-S0x rule has at least one component responsible — PasswordHasher (S01), JwtSigner (S02), AuthMiddleware/cookie flags (S03), RateLimitMiddleware (S04), ErrorEnvelopeMiddleware + headers (S05), ValidationMiddleware (S06), Logger sanitization (S07), CI deps-scan (S08), AuthService.invalidCredentialsError (S09), RefreshTokenRepo.revokeFamily (S10)
- [x] **Accessibility**: FE components named (FormInput with `<label>`; FormError with `aria-live`; PrimaryButton/OutlinedButton with focus states; BrandPanel collapses at mobile)
- [x] **Property-Based Testing**: the 4 invariants from NFR-T02 map to PasswordHasher, JwtSigner, AuthService email-normalize, RefreshTokenRepo rotation — design provides clear seams for property-based tests

### Section 5 — Open carry-forward (3 items routed)
- [x] **`#908d8d` contrast fix** — `theme.ts` / `design-tokens.json` will materialize the darkened value (`#737272`) at Stage 12 per FE component build
- [x] **PBT framework name** — depends on Stage 11 (`fast-check` / `hypothesis` / `gopter`); design references are framework-neutral
- [x] **Stack-specific file paths** — every component is framework-neutral; Stage 11 chooses paths per UoW

### Section 6 — Routing
- [x] aidlc-state.md updated to STAGE 6: COMPLETE
- [x] audit.md updated with Part 1 + Part 2 entries

## Findings worth surfacing before Stage 7 (Workflow Planning / Gate #2)

| # | Finding | Severity | Carry to |
|---|---------|----------|----------|
| 1 | Strong candidate for **two UoWs**: `backend-auth` and `frontend-auth`. They share the OpenAPI contract; backend can be built and tested independently first. | INFO — Stage 7 will decide | Stage 7 Units Generation |
| 2 | `failed_login_attempts` table is **optional** (in-memory map sufficient). Decision deferred to Stage 11. | INFO | Stage 11 |
| 3 | JWKS endpoint introduces a key-rotation concern out-of-scope for v1 (single static keypair). Single keypair documented in `services.md` env vars. | INFO | Stage 10 NFR Design |
| 4 | `EmailStub` is the only "stub-shaped" component. We must explicitly verify in Stage 13 Code Review that no real SMTP library is pulled in by accident. | INFO | Stage 13 Code Review |

## Modification Log
| Timestamp (ISO) | Editor | Change |
|-----------------|--------|--------|
| 2026-05-12T00:11:00Z | AI-DLC | Initial generation. All Section 1-6 items resolved. 4 findings flagged. 6 ADRs prepared for Gate #2 signing. |
