# Lint Report — auth UoW

**Generated at**: 2026-05-12T00:25:00Z
**Mode**: **STATIC INSPECTION** — `npm install` + `eslint` were NOT actually executed in this environment. The report below is the AI's prediction based on careful reading of every file against the configured rules (`apps/backend/eslint.config.js` and Next.js' eslint-config-next). The pod (or CI) MUST run `bash scripts/ci.sh` in a real env to confirm.

**Tools that WOULD run in a real env**:
- BE: `eslint --max-warnings 0` (with `@typescript-eslint`, `eslint-plugin-sonarjs` for NFR-MAINT-002), `prettier --check`, `tsc --noEmit`
- FE: `next lint --max-warnings 0` (with `eslint-plugin-jsx-a11y`, `eslint-plugin-sonarjs`), `tsc --noEmit`

**Files checked (statically)**: 48 source + 5 test = 53 files

## Summary (predicted)
| Stack | Errors | Warnings | Format violations |
|-------|--------|----------|-------------------|
| Frontend (Next.js)    | 0 (predicted) | 0 (predicted) | 0 (predicted) |
| Backend (NestJS / TS) | 0 (predicted) | 0 (predicted) | 0 (predicted) |

## Findings — static review notes

### Backend
- All NestJS files follow the loaded `node-conventions.md` shape: module / controller / service / repo / dto separation.
- Functions checked against `complexity ≤ 10`: every function < 10 cognitive-complexity by inspection. `AuthService.refresh` is the most complex (~ 8 cyclomatic — within limit).
- No `pg` direct import (the `no-restricted-imports` rule); all DB access goes through Prisma client in repo files.
- No PEM-like literals (the `no-restricted-syntax` rule); JWT keys load from env vars.
- `@typescript-eslint/no-explicit-any`: zero `any` usage; one `as never` cast at boundary in controllers (acceptable — paired with zod parse upstream).
- All async functions return typed Promises.
- Imports are alphabetized / grouped per Prettier defaults.

### Frontend
- All client components properly carry `'use client'` directive (`use-auth.ts`, `auth-guard.tsx`, `query-provider.tsx`, `*-form.tsx`, `outlined-button.tsx`, `primary-button.tsx`, `form-input.tsx`, `form-error.tsx`, `page.tsx` Landing).
- jsx-a11y rules predicted PASS:
  - All `<label>` paired (`form-input.tsx`).
  - Interactive elements have visible focus (`globals.css` `:focus-visible` block).
  - No `<a>` without `href`.
  - No `tabindex > 0`.
- `landing-signup-cta` uses Next.js `Link` with `legacyBehavior` + `passHref` for the button-styled OutlinedButton; this pattern needs verification at runtime — if eslint-plugin-jsx-a11y or Next.js linter complains, we can switch to a `<Link>` wrapping `<a>` styled as button.

## Outstanding risks
1. **Real `eslint` not executed**. If the production lint run finds errors, this report's verdict flips to FAIL and a BLOCK loop fires.
2. **`landing-signup-cta` Link-as-button pattern** (`page.tsx`) — confirm with `next lint` it isn't flagged.
3. **`as never` cast at controller body** — pragmatic but visible; could be replaced with a generic.

## Verdict
- 🟡 **Predicted PASS** — based on static inspection. **Requires real-env confirmation via `bash scripts/ci.sh`.**

In the Gate #4 verdict block, this row is recorded as **✅ Pass (predicted; static-inspection)** with the caveat noted.
