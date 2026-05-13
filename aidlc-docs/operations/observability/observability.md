# Stage 18 — Observability (light)

**Generated**: 2026-05-13T12:40:00+05:30     **Tier**: light (B8=A per BR Stage 1)

## Logs

Backend emits **structured JSON logs to stdout** via `pino` + `nestjs-pino`. Every request gets a per-request `request_id` propagated to the response header `X-Request-Id` and to every log line for that request (NFR-OBS-002, NFR-OBS-004).

Each log line includes (where relevant):
- `level`, `timestamp`, `service`, `version`, `environment`
- `req` (method, url, request_id, headers minus cookie/authorization)
- `res` (statusCode, headers minus Set-Cookie value, responseTime)
- `err` (message, stack, name) — only on 5xx
- `msg`

### Redacted fields (NFR-S07, BR-A12)
The pino redactor never emits:
- `password`, `passwordHash`, `password_hash`
- `accessToken`, `refreshToken`, `*token*`, `authorization`, `cookie`
- Any value matching `$argon2id$…` (hash prefix)
- Any value matching `eyJ…` (JWT prefix)

Log scrape verification: `grep -E '\$argon2id\$|eyJ[A-Za-z0-9_-]{10,}' <log-stream>` MUST return zero matches in normal operation.

## Metrics + tracing — N/A for v1

Per BR Stage 1 (B8=A — "light" observability), v1 does not ship:
- A Prometheus / metrics scrape endpoint
- OpenTelemetry tracing
- A dashboard (Grafana / DataDog / etc.)
- Alerting rules

If Codiste graduates beyond a single host or onboards ≥ 200 users, follow-up UoWs will add:
- `/metrics` endpoint (prom-client) for HTTP histogram + rate-limit counter
- OTel-instrumented HTTP + DB spans
- Grafana board with: signup-success-rate, login-success-rate, login-rate-limit-fire-rate, refresh-replay-fire-rate, p95 latency per endpoint

## Roles-profile delta (this UoW): none

The `roles-profile` UoW introduces **zero new log fields, zero new metrics, zero new alerts**. The role enum is non-PII and travels as a regular response-body field — no special redaction or instrumentation needed.

## On-call quick reference

| Symptom | First check |
|---------|-------------|
| BE process exits with code 1 on boot | Missing env var — check stderr first log line, fix env, re-deploy |
| Signups failing with 400 `role: Required` | FE was deployed before BE was updated (or FE rollback). Verify the FE image carries the `<RoleRadioGroup/>`. |
| Refresh rate-limit firing constantly | Multiple concurrent BE replicas behind a load balancer + in-memory rate map — known limitation; switch to Redis path (Stage-18 follow-up). |
| User cookie not sticking | `APP_ENV` is `prod` / `ci` so cookies are `Secure`. The site must be served over HTTPS. |
| `auth.session.invalid` (refresh replay) | Either a real replay (legitimate revocation per BR-A09) OR the FE has multiple tabs racing each other for refresh. Cycle-2 observation: this is by design under contention. |

## Modification Log
| Timestamp (ISO) | Editor | Change |
|-----------------|--------|--------|
| 2026-05-13T12:40:00+05:30 | AI-DLC | Initial — Stage 18 light observability documented; roles-profile delta = none. |
