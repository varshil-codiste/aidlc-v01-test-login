#!/usr/bin/env bash
# Start BE + FE concurrently for native development.
# - Auto-loads `.env.local` (envs read by BE)
# - DB must already be running (run `npm run setup` once, or `docker compose up -d db`)
# - Ctrl+C stops both processes cleanly.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT}"

if [ ! -f .env.local ]; then
  echo "✗ .env.local missing. Run \`npm run setup\` first." >&2
  exit 1
fi

# Load envs so BE inherits them.
set -a
# shellcheck disable=SC1091
source .env.local
set +a

# Ensure DB is up (idempotent).
docker compose up -d db >/dev/null 2>&1 || true

# Run both in parallel, tagged output.
prefix() {
  local tag="$1"
  sed -u "s/^/[${tag}] /"
}

echo "Starting backend (http://localhost:${PORT:-4000}) and frontend (http://localhost:3000)…"
echo "Press Ctrl+C to stop."
echo ""

# Trap Ctrl+C — kill all children.
trap 'kill 0' INT TERM EXIT

( cd apps/backend  && npm run start:dev 2>&1 | prefix BE ) &
( cd apps/frontend && npm run dev       2>&1 | prefix FE ) &

wait
