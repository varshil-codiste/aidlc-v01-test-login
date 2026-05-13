# Stage 15 — Build & Test Report (combined: auth + roles-profile)

**Generated**: 2026-05-13T12:35:00+05:30     **Tier**: combined (Greenfield + Feature)
**Scope**: full production build of BE + FE; full BE test workspace re-run; lint + audit.

---

## Backend production build
- Command: `npm --workspace=apps/backend run build` → `nest build`
- Result: **OK** (exit 0)
- Output: `apps/backend/dist/apps/backend/src/main.js` (entry per `nest-cli.json`)

## Frontend production build
- Command: `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000 npm --workspace=apps/frontend run build`
- Result: **OK** (exit 0)
- 6 routes statically prerendered:

| Route | Size | First-Load JS |
|-------|------|---------------|
| `/` (Landing) | 2.9 kB | 142 kB |
| `/signup` | 2.75 kB | 133 kB |
| `/account-setup` | 2.94 kB | 133 kB |
| `/dashboard` | 2.13 kB | 117 kB |
| `/profile` | 2.32 kB | 117 kB |
| `/_not-found` | 873 B | 88.1 kB |

Shared chunks: 87.2 kB.

## Lint
- BE: `eslint --max-warnings 0` → 0/0 ✅
- FE: `next lint --max-warnings 0` → 0/0 ✅

## Backend test workspace (vitest 2.x)
| Project | Files | Cases | Result |
|---------|-------|-------|--------|
| unit | 1 (`role-source-of-truth.spec.ts`) | 3 | ✅ PASS |
| integration | 2 (`signup-enumeration.int-spec.ts`, `signup-role.int-spec.ts`) | 6 | ✅ PASS |
| properties | 4 (PBT — email-normalize, password-hash, jwt-roundtrip, refresh-rotation) | 8 | ✅ PASS |
| **Total** | **7 files** | **17 cases** | ✅ **17/17 PASS** |

## Security audit (prod-deps, high+critical)
- Root: 11 prod-only vulns (6 moderate + 5 high; 0 critical)
- Findings inherit the auth-UoW NFR-S08 **ACCEPTED-WITH-DEFERRED-REMEDIATION** disposition (multer / lodash / js-yaml / @nestjs/core / next). Re-audit at Gate #5.

## Frontend Playwright e2e
- Specs exist: `playwright/full-flow.e2e.ts`, `playwright/signup-role.e2e.ts`, `playwright/profile.e2e.ts`
- Live execution in CI deferred — `@axe-core/playwright` declared but not installed; Playwright binaries not present in the current node_modules. Documented as Stage-15 backlog item ("install Playwright browsers in CI image").

## CI script status
- `scripts/ci.sh` exists and chains: install → BE lint → BE audit → BE unit + PBT → BE integration → FE lint → FE audit → FE unit → FE e2e.
- Re-run path for local verification: `npm run ci` from repo root (requires `docker compose up -d db` first).

---

## Overall Stage-15 verdict

**✅ PASS-with-deferred-items**
- Build: BE + FE both green.
- Lint: clean both apps.
- BE tests: 17/17 PASS.
- Audit: no new finding; inherits NFR-S08 deferred-remediation disposition.
- E2E: specs written, live CI run pending Playwright browser install in the CI image.

Ready for Stage 16 — Deployment guide consolidation.

---

## Modification Log
| Timestamp (ISO) | Editor | Change |
|-----------------|--------|--------|
| 2026-05-13T12:35:00+05:30 | AI-DLC | Stage 15 combined build & test for auth + roles-profile. BE+FE production builds green; 17/17 BE tests PASS; lint clean; audit no-new-finding. Live e2e CI run deferred. |
