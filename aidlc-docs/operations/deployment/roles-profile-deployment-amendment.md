# Deployment Amendment — `roles-profile` UoW

**Tier**: Feature (light)     **Stage**: 16     **Generated**: 2026-05-13T12:25:00+05:30
**Format**: amendment — to be merged into the (forthcoming) `auth` deployment guide when auth Stage 16 runs. Until then this file IS the canonical deploy step for the `roles-profile` UoW.
**Scope**: one new DB migration; zero infra change; zero observability change.

---

## What changed in this UoW (deployment-relevant)

- New file: `apps/backend/prisma/migrations/0002_add_role/migration.sql` (creates `Role` enum + adds `users.role NOT NULL DEFAULT 'SELLER'`).
- Companion: `apps/backend/prisma/migrations/0002_add_role/migration-rollback.sql`.
- New code path: BE signup → DTO `z.enum(ROLES)` → repo `create({…, role})`; FE radio group; profile page. **None of these require a deploy-time action beyond the migration**.
- No new env var.
- No new port.
- No new infra component (no Redis, no new queue, no new bucket).
- No new metric / log field / dashboard.

## Deploy step (one paragraph — to paste into the auth deployment runbook)

> **Migration `0002_add_role` (backwards-compatible).** Before rolling out the new BE image, run `npx prisma migrate deploy` against the production Postgres. The migration adds a Postgres `Role` enum (`'MERCHANT'`, `'SELLER'`) and a NOT NULL column `users.role` with `DEFAULT 'SELLER'`; Postgres applies the default to every pre-existing row in a single `ALTER TABLE` (no separate backfill required). The change is forward-compatible with the old BE image (the column is ignored by code that doesn't read it) and backward-compatible with old data (existing users read as `SELLER` immediately). Once the new BE image is rolled out, every `POST /auth/signup` will require `role` ∈ `{MERCHANT, SELLER}`; the FE deploy must be rolled out concurrently or after.

## Rollout order

1. `npx prisma migrate deploy` against prod Postgres.
2. Deploy new BE image (requires `role` on signup; serves `role` in every user response).
3. Deploy new FE image (renders the role radio group on `/signup`; renders the badge on authenticated routes; renders `/profile`).

The old FE briefly running against the new BE during the (1)→(3) window is safe — the old FE doesn't know about `role`, so it never sends one. The new BE will REJECT signups from the old FE (because `role` would be missing) and return 400 `auth.role.invalid`. To avoid that user-facing window:
- Either deploy FE BEFORE BE (FE sends `role`, but old BE ignores it — fine; no signup failure path).
- Or deploy FE + BE in lockstep.

**Recommendation**: FE-first rollout. The old BE silently ignores extra `role` field; no signup breakage. Once FE is rolled, deploy BE — which then enforces.

## Rollback plan

If a regression is detected within the deploy window:

1. Roll BE + FE images back to the auth-UoW versions (no FE role radio, no BE role validation).
2. Leave the DB migration applied. The new `role` column will simply not be read by the old code. **Do NOT drop the column on rollback** — pre-existing users now have valid `role` values, and dropping/re-adding the column would force a full-table rewrite under load.
3. If full clean-slate rollback is required, apply `0002_add_role/migration-rollback.sql` manually. Note: this is destructive for any signups that happened after the migration but before rollback (they now have a column that is being dropped).

## Verification after deploy

- `GET /health` returns 200.
- `GET /.well-known/jwks.json` returns the public key.
- A test signup with `role:"MERCHANT"` returns 201 + user body with `role:"MERCHANT"`.
- A test signup with `role:"ADMIN"` returns 400 with `type=/errors/validation`.
- `GET /users/me` for a pre-migration user returns `role:"SELLER"`.

## Observability — N/A
No new metric, log field, alert, dashboard, or trace span introduced. Existing pino fields cover the new flow (the new endpoint is the SAME `/auth/signup` route — just with one extra field on the request body).

## Infrastructure-as-Code (Stage 17) — N/A
No new infra primitive. The DB, BE, and FE containers from the auth UoW are reused unchanged.

---

## Modification Log
| Timestamp (ISO) | Editor | Change |
|-----------------|--------|--------|
| 2026-05-13T12:25:00+05:30 | AI-DLC | Initial creation. One-paragraph deploy step + rollout order + rollback plan + verification checklist for the `0002_add_role` migration. To be merged into the auth deployment runbook when auth Stage 16 runs. |
