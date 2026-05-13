# Functional Design Checklist — auth UoW

**Generated**: 2026-05-12T00:15:00Z

## Items

### Section 1 — Domain entities
- [x] `User` entity — 9 fields with types + constraints + notes
- [x] `RefreshToken` entity — 9 fields with types + constraints + notes
- [x] Out-of-scope entities listed (FailedLoginAttempt → in-memory map, PasswordResetToken, OauthIdentity, MfaSecret, AuditLog — all deferred)
- [x] ER diagram (Mermaid) + text alternative

### Section 2 — Business rules
- [x] 12 rules BR-A01 … BR-A12, each with: statement, applies-to, enforcement points, error code (where applicable), user-facing copy
- [x] Error code catalog consolidated (8 codes mapped to RFC 7807 `type` and HTTP status)
- [x] Compliance summary: every NFR-S0x / NFR-T02x / FR-related rule has an owning BR-A0x

### Section 3 — Workflows
- [x] Signup workflow (sequence diagram + text alternative + 14 steps)
- [x] Login workflow (with rate-limit branch + enumeration-safe branches)
- [x] Refresh workflow (with replay-detection branch)
- [x] Logout workflow (idempotent path included)
- [x] Account-setup workflow

### Section 4 — Frontend components
- [x] Component tree (5 routes, 22 components)
- [x] Component table (24 rows with props + state + notes)
- [x] State management approach defined per concern
- [x] `data-testid` per interactive element (16 IDs catalogued)
- [x] Accessibility specifics (NFR-A01..A08 each tied to a component)
- [x] Responsive behavior table for 4 breakpoints
- [x] Code organization sketched (framework-neutral)

### Section 5 — Mobile screens
- [~] N/A: Mobile is out of scope for v1 (web-only per BR § 2.1).

### Section 6 — Extension touch-points
- [x] **Security**: every NFR-S0x has an owning BR-A0x or `frontend-components.md` row
- [x] **Accessibility**: every NFR-A0x is implemented inline in `frontend-components.md` § Accessibility specifics
- [x] **Property-Based Testing**: 4 invariants (NFR-T02 a-d) each mapped to a target module:
  - T02a hash round-trip → PasswordHasher (BR-A03)
  - T02b JWT round-trip → JwtSigner (BR-A08)
  - T02c email normalize idempotence → AuthService.normalize (BR-A02)
  - T02d refresh rotation → RefreshTokenRepo + AuthService.refresh (BR-A09)
- [~] **AI/ML**: N/A — opted out at Stage 4

### Section 7 — Stage-8 question answers (all 7)
- [x] Q1 contrast fix → A (token darken to `#737272`)
- [x] Q2 email-stub schema → A (full 7-field shape)
- [x] Q3 failed-login storage → A (in-memory map only)
- [x] Q4 case-insensitive email → A (normalize-in-app + unique index)
- [x] Q5 CSRF strategy → A (no token; SameSite=Lax suffices for v1)
- [x] Q6 password policy depth → A (length only)
- [x] Q7 proceed to Part 2 → A (approved)

### Section 8 — Routing
- [x] `aidlc-state.md` updated to STAGE 8: COMPLETE for `auth` UoW
- [x] `audit.md` updated

## Findings to carry to Stage 9 (NFR Requirements)

| # | Finding | Severity | Stage 9 disposition |
|---|---------|----------|---------------------|
| 1 | All 12 BR-A rules have direct NFR-S / NFR-T / NFR-A coverage; Stage 9 will primarily restate per-UoW + add per-UoW acceptance tests | INFO — clean handoff | Stage 9 |
| 2 | The "subtitle on input bg" combination (`#737272` on `#f9f9f9`) is ≈ 4.4:1 — **borderline** for the AA 4.5 floor; design-tokens.md notes "supplementary only — labels carry meaning". Stage 14 Manual QA must verify no body-text role uses this combination. | LOW | Stage 14 |
| 3 | `account_setup_completed` cannot be set false again in v1 (no edit-profile flow). If a future UoW adds profile editing, BR-A11 needs revisiting. | INFO — future UoW | post-v1 |
| 4 | `RefreshToken` cleanup task is deferred (rows accumulate at ≤ 50 users). Document in `runbook.md` at Stage 16. | INFO | Stage 16 |

## Modification Log
| Timestamp (ISO) | Editor | Change |
|-----------------|--------|--------|
| 2026-05-12T00:15:00Z | AI-DLC | Initial creation. All sections [x] (Section 5 N/A — mobile). 4 findings flagged for downstream stages. |
