#!/usr/bin/env bash
# One-time setup for native (npm run dev) development.
# Idempotent — safe to re-run.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT}"

echo "[1/4] Generating JWT keypair + env defaults…"
bash scripts/gen-keys.sh

echo ""
echo "[2/4] Starting Postgres in Docker (host port 5433)…"
docker compose up -d db

echo ""
echo "[3/4] Waiting for Postgres to be healthy…"
until docker compose exec -T db pg_isready -U app -d auth >/dev/null 2>&1; do
  sleep 1
done
echo "OK  Postgres ready."

echo ""
echo "[4/4] Applying Prisma migrations…"
# Pull DATABASE_URL from .env.local
set -a; source .env.local; set +a
(cd apps/backend && npx prisma migrate deploy)
(cd apps/backend && npx prisma generate >/dev/null)

echo ""
echo "================================================================"
echo "Setup complete. Run \`npm run dev\` to start the BE + FE."
echo "================================================================"
