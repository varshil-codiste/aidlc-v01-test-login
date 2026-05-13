# login-account-setup

Small login + account-setup feature with merchant/seller roles. Built end-to-end through the AI-DLC v0.1 workflow.

**Stack**: Next.js 14 + NestJS 10 + Prisma 5 + PostgreSQL 16

---

## Run it (3 commands)

You need: **Node 20**, **npm 10+**, **Docker**, **OpenSSL**.

```bash
git clone <repo> && cd login-account-setup
npm install
npm run setup        # one-time: generates keys, starts Postgres, runs migrations
npm run dev          # starts backend + frontend; Ctrl+C to stop both
```

Open **http://localhost:3000**.

That's it.

---

## What `npm run setup` does

1. Generates an RS256 JWT keypair (written to `.env.local`)
2. Writes the dev env defaults to `.env.local` (DB URL, ports, etc.)
3. Writes `apps/frontend/.env.local` (Next.js auto-loads it)
4. Starts Postgres in Docker on host port **5433**
5. Applies Prisma migrations

You only need to run it **once** per checkout. Safe to re-run any time.

## What `npm run dev` does

- Backend (NestJS) on **http://localhost:4000** with hot reload
- Frontend (Next.js) on **http://localhost:3000** with hot reload
- Both run in one terminal, logs prefixed `[BE]` / `[FE]`
- Postgres stays up (Docker); you don't need to think about it

Ctrl+C stops both apps. Postgres keeps running. Reset everything with `npm run dev:reset`.

---

## URLs

| URL | What |
|-----|------|
| http://localhost:3000 | App (Landing → Signup → Account Setup → Dashboard → Profile) |
| http://localhost:4000 | Backend API root |
| http://localhost:4000/api/docs | Swagger UI |
| http://localhost:4000/.well-known/jwks.json | JWKS (public key) |
| http://localhost:4000/health | Health probe |

---

## Everything-in-Docker alternative

If you don't want to run BE / FE on your host at all:

```bash
npm run gen:keys     # one-time
cp .env.example .env # one-time
npm run dev:docker   # runs db + backend + frontend all in containers
```

Slower iteration than `npm run dev` (no hot reload, image rebuilds on code change) but zero host requirements beyond Docker.

---

## Common commands

```bash
npm run dev          # native BE + FE with hot reload (preferred)
npm run dev:docker   # all-in-containers
npm run dev:down     # stop the Docker stack
npm run dev:reset    # wipe DB volume + redo setup
npm run gen:keys     # regenerate JWT keys (edit .env.local to rotate)
npm run ci           # full CI suite (lint + tests + e2e)
```

### Running tests

```bash
# Backend (DB must be up — `npm run setup` handles that)
npm --workspace=apps/backend run test:unit
npm --workspace=apps/backend run test:integration
npm --workspace=apps/backend run test:properties

# Frontend E2E (Playwright; BE + FE must be running)
npm --workspace=apps/frontend run test:e2e
```

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `npm run dev` says `.env.local missing` | Run `npm run setup` first. |
| Port `5433` already in use | Edit `docker-compose.yml` to map a different host port. |
| `Cannot find module dist/...main.js` | Run `npm run setup` again — it re-runs `prisma generate` and rebuilds the dist folder on next start. |
| Cookies don't stick when testing | `APP_ENV=dev` must be set; cookies are otherwise `Secure` and won't travel on `http://`. `npm run setup` sets this automatically. |
| Want a clean slate | `npm run dev:reset` — drops DB volume + reruns setup. |

---

## Project layout

```
.
├── apps/
│   ├── backend/         NestJS app (auth, users, common middleware)
│   │   ├── prisma/      schema + migrations
│   │   └── tests/       unit + integration + property-based
│   └── frontend/        Next.js 14 App Router
│       └── playwright/  e2e specs
├── shared/
│   ├── role.ts          Single source of truth for the Role union
│   └── design-tokens.json
├── scripts/
│   ├── setup.sh         one-time setup
│   ├── dev.sh           BE + FE concurrent runner
│   ├── gen-keys.sh      RS256 keypair + env defaults → .env.local
│   └── ci.sh            full CI pipeline
├── docker-compose.yml   db, backend, frontend
└── aidlc-docs/          full AI-DLC artifact trail (BR → design → code review)
```

---

## Pod

| Role | Name | Email |
|------|------|-------|
| Tech Lead | Chintan | chintanp@codiste.com |
| Dev | Varshil | varshil.g@codiste.in |

See `aidlc-docs/pod.md`.
