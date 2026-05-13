# Tier — `roles-profile` UoW

**Tier**: Feature
**Severity-1 hotfix**: N/A
**Set at**: 2026-05-12T19:55:00+05:30
**Set by**: Business Requirements Intake — Step 1 (re-invocation for new Feature UoW)

## Why Feature
The project was Greenfield at the original invocation (auth UoW). The `auth` codebase now exists and runs. This new UoW adds capability **on top of** the existing product — definitionally Feature-tier per `common/tiered-mode.md`.

## Tier × Behavior implications for this UoW
| Behavior | Setting |
|----------|---------|
| BR checklist size | ~10 items (Feature) — see `roles-profile-br-checklist.md` |
| Design Intake | NOT re-run — the existing Figma tokens + screen-flow already cover the new screens (header badge + /profile is a Figma-token-only addition); will revisit if a new Figma frame is supplied |
| Reverse Engineering | N/A — we have direct codebase access; no need to reverse-engineer auth |
| User Stories | YES (standard) — 3-4 stories for role-aware signup, header badge, /profile route |
| Application Design | LIGHT — touches existing components (signup form, layout, users.repo, GET /users/me) + adds one new route |
| Units Generation | NO — single UoW (`roles-profile`) |
| NFR Requirements | STANDARD — most NFRs inherit from auth UoW (Security baseline + WCAG + PBT); only role-specific NFRs need fresh capture |
| Stack Selection | INHERIT — same stack as `auth` (Next.js + NestJS + Prisma + Postgres) |
| `/grill-me-1` | Mandatory — 7-10 questions for Feature |
| Manual QA (Stage 14) | Mandatory — affected-flow coverage |
| `/grill-me-2` | Mandatory — 7-10 questions for Feature |
| Gates | All 5 required |

## Sibling tier files (for reference)
- `tier.md` — original project tier (Greenfield) for the `auth` UoW
