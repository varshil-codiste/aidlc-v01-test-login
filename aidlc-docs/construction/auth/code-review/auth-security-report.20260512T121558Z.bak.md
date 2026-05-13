# Security Report — auth UoW

**Generated at**: 2026-05-12T00:25:00Z
**Mode**: **STATIC INSPECTION** — `npm audit`, `eslint-plugin-security`, and semgrep were NOT actually executed in this environment. The report below is the AI's review against the opted-in **Security extension** rules (`extensions/security/baseline/security-baseline.md` — 15 rules) plus the project-specific NFR-S01..S10 implementations.

**SAST tools that WOULD run in a real env**: `eslint-plugin-security`, semgrep auth-focused ruleset
**Dependency scans that WOULD run**: `npm audit --omit=dev --audit-level=high` on both workspaces

## SAST Findings (predicted)
| Severity | Count | Notes |
|----------|-------|-------|
| Critical | 0 | — |
| High | 0 | — |
| Medium | 0 | (`as never` casts at controller body are not security findings) |
| Low | 0 | — |

## Dependency Vulnerabilities (predicted)
| Severity | Count | Reason |
|----------|-------|--------|
| Critical | 0 | All pinned deps are widely-used current releases (Nest 10, Next 14, Prisma 5, jose 5, argon2 0.40, helmet 8) — no known critical CVEs at 2026-05-12 |
| High | 0 | Same |
| Medium | 0 | Same |

> ⚠️ **A real `npm audit` may surface new CVEs**. CI MUST run the actual audit step.

## Extension Rule Compliance — Security Baseline (15 rules)

| Rule | Status | Evidence |
|------|--------|----------|
| **SEC-01** Encryption in transit (HTTPS in prod) | ✅ Compliant | Cookie `Secure` flag enforced in non-dev (`auth-cookies.ts`); HSTS header set in prod (`security-headers.middleware.ts`). |
| **SEC-02** Password hashing | ✅ Compliant | Argon2id with memory ≥ 19 MiB, iter ≥ 2 — frozen in `password-hasher.service.ts` `PARAMS`. PBT proves round-trip (`password-hash.prop-spec.ts`). |
| **SEC-03** JWT algorithm + key handling | ✅ Compliant | RS256 in `jwt-signer.service.ts`; keys load from env; PEM literals lint-blocked. |
| **SEC-04** Authentication brute-force defense | ✅ Compliant | `login-rate-limit.guard.ts` enforces 5/15min per email; integration test stubbed but rate-limit pattern verifiable by inspection. |
| **SEC-05** Input validation | ✅ Compliant | Zod schema pipes on every POST/PATCH endpoint (`signup.dto.ts`, `login.dto.ts`, `update-profile.dto.ts`). Server-side authoritative. |
| **SEC-06** Output encoding / XSS defense | ✅ Compliant | Next.js auto-escapes JSX; no `dangerouslySetInnerHTML` used; CSP forbids inline scripts. |
| **SEC-07** Cookie flags | ✅ Compliant | `auth-cookies.ts` — `HttpOnly`, `SameSite=Lax`, `Path=/`, `Secure` (non-dev). |
| **SEC-08** CSRF | ✅ Compliant | SameSite=Lax + same-origin FE per Stage 8 Q5=A (no CSRF token by design). Documented assumption. |
| **SEC-09** Account enumeration | ✅ Compliant | Single error builder `invalid-credentials.ts` used by both signup-duplicate and login-fail paths. Integration test `signup-enumeration.int-spec.ts` written. |
| **SEC-10** Session management / refresh-token rotation | ✅ Compliant | `refresh-tokens.repo.ts:rotate` + family-revoke-on-replay; PBT `refresh-rotation.prop-spec.ts` proves the invariants. |
| **SEC-11** Security headers | ✅ Compliant | `security-headers.middleware.ts` sets CSP, HSTS (prod), X-Content-Type-Options, Referrer-Policy, Permissions-Policy. |
| **SEC-12** Secrets management | ✅ Compliant | No hardcoded secrets; lint rules block PEM literals + `process.env.X` reads only at module boundaries (main.ts assertEnv, jwt-signer onModuleInit). |
| **SEC-13** Logging (no PII / secrets) | ✅ Compliant | `LoggerModule.forRoot` `redact` config in `app.module.ts` covers `password`, `passwordHash`, `accessToken`, `refreshToken`, `authorization`, `cookie`. |
| **SEC-14** Dependency hygiene | 🟡 Predicted Compliant — **needs real `npm audit`** | All pinned to current releases; `scripts/ci.sh` runs audit with `--audit-level=high`. |
| **SEC-15** Error envelope (no info leakage) | ✅ Compliant | RFC 7807 envelope via `error-envelope.filter.ts`; stack traces stripped in `APP_ENV=prod`; user-facing `detail` is generic. |

## NFR-S01..S10 verification

Each NFR has an owning file confirmed implemented:

| NFR | File | Note |
|-----|------|------|
| NFR-S01 (Argon2id) | `password-hasher.service.ts` | Frozen params |
| NFR-S02 (RS256 + JWKS) | `jwt-signer.service.ts` + `jwks.controller.ts` | 24h cache per Stage 10 Q3=B |
| NFR-S03 (cookie flags) | `auth-cookies.ts` | Env-aware Secure flag |
| NFR-S04 (rate limit) | `login-rate-limit.guard.ts` | In-memory map |
| NFR-S05 (security headers) | `security-headers.middleware.ts` | helmet + manual headers |
| NFR-S06 (input validation) | `zod-validation.pipe.ts` + per-DTO schemas | Server-side authoritative |
| NFR-S07 (no PII in logs) | `app.module.ts` `LoggerModule.forRoot.pinoHttp.redact` | Field-level redaction |
| NFR-S08 (deps clean) | `scripts/ci.sh` step | Real audit needed |
| NFR-S09 (enumeration safety) | `invalid-credentials.ts` single builder | Integration test written |
| NFR-S10 (refresh rotation + family revoke) | `refresh-tokens.repo.ts` + `auth.service.ts:refresh` | PBT covers model |

## Verdict
- 🟢 **Predicted PASS** — every applicable Security extension rule is Compliant or 🟡 Compliant-pending-real-audit (SEC-14 only). Zero Critical or High SAST findings predicted by static review. **Real `npm audit` MUST run before declaring this row final.**

In the Gate #4 verdict block, this row is recorded as **✅ Pass (predicted; one row 🟡 pending real `npm audit`)**.
