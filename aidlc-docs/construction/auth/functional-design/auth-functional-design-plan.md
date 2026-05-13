# Functional Design Plan — auth UoW

**UoW**: `auth`
**Tier**: Greenfield
**Generated**: 2026-05-12T00:14:00Z
**Driving artifacts**: requirements.md (22 FR + 31 NFR), application-design/* (schema, components, services), stories.md (8 stories, 36 ACs), design/screen-flow-map.md (5 screens), design/design-tokens.md

## Plan
- [ ] Domain entities — `User`, `RefreshToken`, (optional) `FailedLoginAttempt`
- [ ] Business rules — derived from NFR-S0x, FR-0xx
- [ ] State transitions — User lifecycle, RefreshToken lifecycle (active → rotated / revoked)
- [ ] Data flow / workflows — 5 sequence diagrams (signup, login, refresh, logout, account setup)
- [ ] Integration points — Email stub (stdout-only)
- [ ] Error handling — RFC 7807 envelope; error-code catalog (≈ 10 codes)
- [ ] FE component tree — already drafted at Stage 6; refined here with `data-testid` per element
- [ ] Mobile screens — **N/A** (web-only v1)
- [ ] Accessibility — every interactive element has visible label + focus state; addressed inline in component tree
- [ ] PBT properties — list the 4 invariants per NFR-T02 with their target modules
- [ ] AI/ML — **N/A** (opted out)

## Carry-forward items to resolve in Part 1 questions

| # | Item | Source |
|---|------|--------|
| 1 | **`#908d8d` subtitle contrast fix** — should we darken to `#737272` (≈4.6:1 AA) or change usage rule? | NFR-A04 carry-forward; Stage 6 Finding |
| 2 | **Email-stub JSON schema** — exact field names for the stdout log line | US-001 AC#4 carry-forward |
| 3 | **`failed_login_attempts` DB table** — include it for audit, or stick with in-memory map? | App-Design Finding #2 |
| 4 | **Case-insensitive email storage** — Postgres `CITEXT` extension, or `lower(email)` index, or normalize in app code? | NFR-S06 / FR-001 — open |
| 5 | **Email-verification stub: `verificationToken` field** — even though B4=A says auto-verify, do we still GENERATE a token (for log shape realism) or omit? | US-001 AC#4 |
| 6 | **Anti-CSRF strategy** — SameSite=Lax cookies cover top-frame nav; do we also need a CSRF token for state-changing POSTs from same-origin FE? | NFR-S03 / NFR-S05; not previously decided |
| 7 | **Password policy beyond length** — block top-N common passwords (HIBP-style), or just ≥ 12 chars? | NFR-S01 / NFR-S04 / FR-001 |

## Anticipated outputs (Part 2)

- `domain-entities.md` — 2-3 entities with ER diagram (Mermaid)
- `business-rules.md` — ≈ 10 numbered rules (BR-A01 … BR-A10) each with enforcement points + error code + user-facing copy
- `business-logic-model.md` — 5 Mermaid sequence diagrams + text alternatives
- `frontend-components.md` — concrete FE component table with `data-testid` per element
- `auth-functional-design-checklist.md`
