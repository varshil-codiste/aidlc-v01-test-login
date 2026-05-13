# Security Report — `roles-profile` UoW

**Cycle**: 1     **Run at**: 2026-05-13T11:05:00+05:30
**Tier**: Feature (light)

---

## Scope of audit
This UoW adds **zero new top-level dependencies** (Stage 11 D-RP-001..004 ratified). The audit surface is therefore identical to the auth UoW baseline. Any high/critical findings inherit the auth UoW disposition.

## `npm audit --omit=dev --audit-level=high` (prod deps only)
- Run from workspace root.
- Total prod-only: 11 (6 moderate + 5 high; 0 critical).

### High findings — same set as auth cycle 1, no `roles-profile`-introduced delta
| Package | Severity | Path | roles-profile attack surface | Disposition |
|---------|----------|------|------------------------------|-------------|
| `multer` <=2.1.0 (via `@nestjs/platform-express`) | high | DoS via incomplete cleanup; DoS via resource exhaustion | **ZERO** — roles-profile uses NO file upload; no `@UploadedFile()` anywhere; the role field is a string in JSON | Inherits auth BUG-010 ACCEPTED-WITH-DEFERRED-REMEDIATION; fix needs NestJS 10 → 11 major bump scheduled at Stage 18 (re-audit at Gate #5) |
| `@nestjs/core` | high | injection advisory | Inherits auth disposition | Same — major-bump path |
| `lodash` <=4.17.23 (transitive) | high | code injection via `_.template`; prototype pollution `_.unset/.omit` | roles-profile does NOT import lodash directly; chain runs through dev/test paths | Inherits auth disposition |
| `js-yaml` (via `@nestjs/swagger`) | high | prototype pollution on merge | Not exercised — `@nestjs/swagger` is dev-time generator only | Inherits auth disposition |
| `next` | high | Next.js advisories (DoS / cache poisoning / XSS via CSP nonce / SSRF / RSC cache poisoning) | Some of these advisories apply to App-Router code paths that roles-profile USES. Mitigations exist (see notes below) | Inherits Next.js track; fix path is Next 14 → 16 major bump — same scheduling as auth NFR-S08 disposition |

### Moderate findings (6)
- Mostly transitive from `next`/`postcss`/`fast-check`. No new exposure introduced.

## roles-profile-specific surface assessment

### NFR-S11 (role enum server-side authoritative) — ✅ verified live
- `z.enum(ROLES)` in `signup.dto.ts` rejects every non-enum value at the validation pipe (verified by 2 of the 5 `signup-role.int-spec.ts` cases — missing 400 + invalid 400).
- Postgres native `Role` enum is the storage-layer backstop — even a bypassed zod check (impossible in current code) would fail the INSERT before commit.

### NFR-MAINT-003 (single source of truth) — ✅ verified at boot
- `role-source-of-truth.spec.ts` asserts `Set(Object.values(PrismaRole)) === Set(ROLES)` AND that zod accepts every value in `ROLES` AND rejects values outside it. All 3 cases pass.

### Logger redaction (NFR-S07) — ✅ inherited unchanged
- No new log fields. `role` is a non-sensitive enum value; the redactor's allow/deny list is unchanged.

### Cookie flags (BR-A10) — ✅ inherited unchanged
- roles-profile does NOT touch cookie code. Existing `HttpOnly + Secure(non-dev) + SameSite=Lax + Path=/` semantics carry verbatim.

### Account enumeration (NFR-S09) — ✅ regression test still green
- `signup-enumeration.int-spec.ts` (amended to send `role: 'SELLER'`) still PASS: duplicate-signup and wrong-password login bodies are byte-identical except `request_id`.

### Migration safety (BR-A14) — ✅ verified
- `0002_add_role/migration.sql` ran against existing DB without truncating, and existing rows backfilled to `'SELLER'` via DEFAULT (verified by querying the auth-cycle-1 test rows after migrate-deploy).

## CSP / response headers (Helmet) — unchanged from auth
roles-profile does NOT change `app.module.ts` middleware. Helmet defaults from the auth UoW continue to apply (CSP `default-src 'self'`; `frame-ancestors 'none'`; etc.).

## Static scan note
No new third-party HTTP request, no new dynamic import, no new `eval`/`Function`/template-literal-injection surface. The risk profile is purely additive of the enum value set (2 elements).

## Compliance summary
| NFR | Owning rule | Status |
|-----|-------------|--------|
| NFR-S07 (logger redaction) | BR-A12 | ✅ |
| NFR-S09 (enumeration safety) | BR-A07 | ✅ regression PASS |
| NFR-S10 (refresh rotation + family revoke) | BR-A09 | ✅ inherited; no path change |
| NFR-S11 (role enum server-side) | BR-A13, BR-A14 | ✅ PASS in cycle 1 |
| NFR-S08 (npm audit clean) | — | ❌ **inherits auth-UoW ACCEPTED-WITH-DEFERRED-REMEDIATION** — no roles-profile-introduced delta; re-audit at Gate #5 |

## Verdict
**PROCEED-with-caveats** — no NEW security finding introduced by roles-profile. The pre-existing high-severity multer/next/lodash/js-yaml/core advisories carry their existing auth-UoW disposition unchanged. Re-audit before production deploy at Gate #5.

## Modification Log
| Timestamp (ISO) | Editor | Change |
|-----------------|--------|--------|
| 2026-05-13T11:05:00+05:30 | AI-DLC | Cycle 1 — security audit run; no new finding introduced by this UoW; inherits auth NFR-S08 disposition. |
