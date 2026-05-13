# Application Design Questions

Eight architectural decisions. Most are already implied by earlier stages — each carries a Recommended answer pre-marked from the BR / Requirements / Codiste preset. **Stage 11 makes the actual framework choice per UoW** — these questions only fix architecture-shape, not framework names.

---

## Question 1 — Architectural style
A) **Monolith** — single BE process + single FE app + single Postgres. **(Recommended — ≤ 50 users, thin v1 slice)**
B) Microservices — split auth and account-setup into separate services
C) Hybrid (BFF + microservices)
X) Other (describe after [Answer]:)

[Answer]:A

## Question 2 — Deployment topology
A) **`docker-compose`** with 3 services (db / backend / frontend) on one host **(Recommended — FR-021 / B10=A already decided this)**
B) Serverless (Lambda + RDS + S3-hosted FE)
C) Single binary (FE built into BE static-serve)
X) Other

[Answer]:A

## Question 3 — API surface
A) **REST + JSON** (OpenAPI 3.1 source-of-truth; typed FE client generated from spec) **(Recommended — Codiste preset)**
B) GraphQL (single endpoint, typed schema)
C) gRPC
X) Other

[Answer]:A

## Question 4 — Auth & identity (the choice already made at Stage 4 — confirming for the design doc)
A) **JWT access (15m) + refresh (7d) in HttpOnly Secure cookies; refresh-token rotation; RS256** **(Recommended — FR-007 / FR-008 / NFR-S02/S03/S10)**
B) Server-side sessions stored in DB / Redis, session cookie
C) Passwordless (magic link) — out of scope for v1
X) Other

[Answer]:A

## Question 5 — Data store
A) **PostgreSQL 16** single instance (no replicas; v1 has zero-QPS) **(Recommended — B9=A; matches Codiste production stack)**
B) PostgreSQL + Redis (for refresh-token store and rate-limit counter)
C) SQLite (file-based; trivial dev)
X) Other

[Answer]:A

## Question 6 — Cross-stack contract format
A) **OpenAPI 3.1** in `apps/backend/openapi.yaml` (FE codegen via `openapi-typescript`-style tool, chosen at Stage 11) **(Recommended — aidlc-profile)**
B) Shared TypeScript types in a `packages/contracts` workspace (requires monorepo)
C) Protobuf
X) Other

[Answer]:A

## Question 7 — Error envelope
A) **RFC 7807 `application/problem+json`** — all error responses use this shape **(Recommended — REST best practice; security extension expects consistent envelope)**
B) Custom `{error: {code, message, details}}` envelope
C) Bare HTTP status + plain text
X) Other

[Answer]:A

## Question 8 — Stack Selection deferment (formal confirmation)
A) **Confirm** that specific framework choices (Next.js vs plain React; NestJS vs Express vs FastAPI vs Go) are deferred to Stage 11 — Stack Selection, run **per UoW** **(Recommended — per the rule)**
B) Decide framework names now (will pre-empt Stage 11)
X) Other

[Answer]:A

---

## Fast path
If all 8 Recommended answers fit (this is the routine architecture for the chosen scope), reply **`approved`** (or **`done — accept all recommendations`**) and I'll generate the design artifacts:

1. `application-design.md` — top-level synthesis + Mermaid architecture diagram + 6 ADRs
2. `components.md` — FE / BE / Shared component catalog with one-line responsibilities
3. `component-methods.md` — method signatures for non-trivial components
4. `services.md` — orchestration / domain services
5. `component-dependency.md` — dependency matrix + Mermaid graph
6. `application-design-checklist.md`

Then the Stage 6 completion message → Continue → Stage 7 Workflow Planning (Gate #2).

Or fill `[Answer]:` individually and reply **approved**.
