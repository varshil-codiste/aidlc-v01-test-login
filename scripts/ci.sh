#!/usr/bin/env bash
# Single CI entry-point. Invoked by .github/workflows/ci.yml.
# Runs lint + tests + security audit across BE and FE.

set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT}"

echo "── Install ──────────────────────────────"
npm ci

echo "── Backend lint ─────────────────────────"
npm --workspace=apps/backend run lint

echo "── Backend audit (high/critical only) ──"
npm --workspace=apps/backend audit --omit=dev --audit-level=high

echo "── Backend unit + PBT tests ────────────"
npm --workspace=apps/backend run test:unit
npm --workspace=apps/backend run test:properties

echo "── Backend integration tests ───────────"
npm --workspace=apps/backend run test:integration

echo "── Frontend lint ───────────────────────"
npm --workspace=apps/frontend run lint

echo "── Frontend audit (high/critical only) ─"
npm --workspace=apps/frontend audit --omit=dev --audit-level=high

echo "── Frontend unit tests ─────────────────"
npm --workspace=apps/frontend run test

echo "── Frontend E2E (Playwright) ───────────"
npm --workspace=apps/frontend run test:e2e

echo "✓ All CI gates green"
