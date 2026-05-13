# NFR Design Questions — auth UoW

Four tight confirmations. Most NFR-design decisions are already implied by the NFR Requirements + Application Design. The questions below cover only what's not yet pinned.

---

## Question 1 — DB connection pool size
Default ORM pool size for Postgres at ≤ 50 users + single BE process?

A) **10** (Codiste house default; matches Prisma + node-postgres defaults; oversubscription guard) **(Recommended)**
B) 20 (more parallelism — irrelevant at ≤ 50 users)
C) 5 (tighter — fine at our scale)
X) Other

[Answer]:A

## Question 2 — Refresh-token cleanup cadence
Expired-row eviction policy for the `refresh_tokens` table?

A) **None in v1** — rows accumulate; ≤ 50 users × 7-day expiry means trivial volume; document a manual `DELETE WHERE expires_at < now()` in `runbook.md` **(Recommended — keeps v1 thin)**
B) Daily cron inside the BE process (in-app interval timer)
C) Postgres `pg_cron` extension scheduled job
X) Other

[Answer]:A

## Question 3 — JWKS public-key cache TTL
The FE (or any internal verifier) caches `/.well-known/jwks.json` for...

A) **1 hour** (Codiste house default; key doesn't rotate in v1; refresh tolerant) **(Recommended)**
B) 24 hours (longer — fine but slower key-rotation propagation if we ever rotate)
C) No cache (re-fetch on every verify — wasteful since FE rarely verifies anyway; BE has the public key in-process)
X) Other

[Answer]:b

## Question 4 — Approval to proceed to Part 2
A) **Approve; generate `auth-nfr-design-patterns.md` + `auth-logical-components.md` + checklist now** **(Recommended)**
B) Pause — I want to write something into the plan
X) Other

[Answer]:A

---

## Fast path
Reply **`approved`** to fast-path all 4. After Part 2 I'll present the Stage 10 completion message and proceed to **Stage 11 — Stack Selection** (where the actual frameworks are picked).
