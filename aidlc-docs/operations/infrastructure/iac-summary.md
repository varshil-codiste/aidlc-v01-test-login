# Stage 17 — Infrastructure-as-Code

**Generated**: 2026-05-13T12:40:00+05:30     **Status**: N/A for v1

Per BR Stage 1 (B9=A — single self-hosted VM/host), there is **no IaC primitive for v1**. Infrastructure is captured entirely by `docker-compose.yml` at the repo root.

When Codiste decides to graduate beyond a single Docker host (multi-replica BE, managed Postgres, CDN), an `infrastructure/terraform/` directory or equivalent will be added as a follow-up UoW.

For now, the "IaC" of this system is:
- `docker-compose.yml` — declares the three services (db, backend, frontend).
- `apps/backend/Dockerfile` and `apps/frontend/Dockerfile` — declare the container build.
- `apps/backend/prisma/migrations/*` — declares the DB schema.

No Stage-17 artifact is needed beyond this note.

## Modification Log
| Timestamp (ISO) | Editor | Change |
|-----------------|--------|--------|
| 2026-05-13T12:40:00+05:30 | AI-DLC | Initial — Stage 17 N/A documented. |
