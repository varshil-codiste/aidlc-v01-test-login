# Business Requirements

**Project**: login-account-setup
**Tier**: Greenfield
**Created**: 2026-05-12T00:03:00Z
**Sources**: see `sources/manifest.md`
**Preset applied**: codiste (see `aidlc-docs/aidlc-profile.md`)

---

## 1. Problem & Outcome

### 1.1 Problem statement
The Codiste team needs a worked, end-to-end example of AI-DLC v0.1 running cleanly from Workspace Detection (Stage 0) through Production Readiness (Gate #5). To exercise the framework on a realistic-but-small surface area, we'll build a **small login + account-setup feature** as the vehicle. This serves two ends simultaneously: (a) team enablement / training on AI-DLC, and (b) a reference implementation that can be reused on real client engagements.

### 1.2 Target users / personas
**Internal Codiste teammates only.** The flow is a sandbox; it will not be exposed to external customers. No production traffic, no marketing site, no public sign-ups.

### 1.3 Success metrics
**Process is the metric, not product KPI.** Success = the AI-DLC v0.1 workflow completes end-to-end:

- All 5 Gates signed (Gates #1, #2, #3, #4, #5)
- Manual QA (Stage 14) all-PASS on the unit(s) produced
- `/grill-me-1` PASS (≥ 0.85) post-Stage 9
- `/grill-me-2` PASS (≥ 0.85) post-Stage 14
- Code Review (Stage 13) verdict = PROCEED with no blocker findings

### 1.4 Out-of-scope items (v1)

The following are explicitly **out of scope** for v1 to keep the experiment tight:

| # | Item | Rationale |
|---|------|-----------|
| 1 | Password reset / "forgot password" flow | Adds email-sending dependency; defer to v2 |
| 2 | Social / OAuth login (Google, GitHub, etc.) | Adds OAuth integration; defer |
| 3 | Multi-factor authentication (MFA / TOTP / SMS) | Adds external SMS / authenticator dependency; defer |
| 4 | Real email verification (sending actual emails) | Stub: log "verification email" to console only |
| 5 | Profile / avatar upload | Adds object storage; defer |
| 6 | Admin / user-management dashboard | Adds an additional UoW; defer |
| 7 | Account deletion (GDPR-style erasure) | No compliance regime applies in v1; defer |

### 1.5 Business goals
- **Primary**: Team enablement / training. Codiste devs need a worked AI-DLC v0.1 example to teach the org how the workflow runs in practice (5 Gates, /grill-me-{1,2}, Manual QA, Code Review verdict, etc.).
- **Secondary**: Reference implementation that we will reuse on real client engagements (lift-and-shift starting point for any client product that needs login + signup).

---

## 2. Constraints & Context

### 2.1 Target platforms
**Web only**, responsive (desktop + mobile browser). The Figma design from the team lead is a web layout. No native mobile (Flutter) in v1; architecture should be platform-neutral enough that mobile can be added later, but no Flutter implementation work is scheduled.

### 2.2 Expected scale
- ≤ 50 internal users total
- Sporadic usage (a handful of test sessions per day at most)
- Effectively zero QPS (no load-testing burden)
- Single VM / single Postgres instance is more than enough

### 2.3 Budget
**N/A** — internal learning experiment, no third-party paid services beyond what Codiste already has access to (GitHub, internal infra). No new SaaS contracts.

### 2.4 Timeline
**No hard deadline.** Finish when AI-DLC walks the pod cleanly to Gate #5. Soft cadence: each Gate should take days, not weeks; if a Gate stalls, escalate to the pod.

### 2.5 Stakeholders

| Role | Name | Email | Notes |
|------|------|-------|-------|
| Tech Lead | Chintan | chintanp@codiste.com | Pod signer for all gates |
| Dev | Varshil | varshil.g@codiste.in | Pod signer for all gates |
| Workflow invoker | Harsh Nebhvani | harsh.nebhvani@codiste.com | Initiated AI-DLC; not a pod signer for this experiment |

No external stakeholders. Stakeholder-out-of-band (`pod-ritual.md`) section in `pod.md` is empty.

### 2.6 Regulatory / compliance
**None.** Internal experiment, no real PII collection beyond email + Argon2id-hashed password. No GDPR / HIPAA / SOC 2 / PCI scope. Architecture should avoid actions that would *foreclose* future GDPR compliance (e.g., no permanent retention of deleted users), but no compliance work is in v1 scope.

### 2.7 External integrations
**None in v1.** Email "verification" stubs log to console; everything else is in-process. No third-party email provider, no OAuth provider, no SMS, no AI provider.

### 2.8 Data classification
**PII Level Low** — only the following user data flows through the system:

- `email` (string, unique, used as login identifier)
- `display_name` (string, user-provided)
- `password_hash` (string, Argon2id hash — plaintext password NEVER stored or logged)
- Auth-session artefacts (JWT tokens, refresh tokens)

No card data, no health data, no government IDs, no addresses, no phone numbers, no date-of-birth.

> **Note from BR follow-up**: Q10 in the follow-up file was left blank by the user. The AI inferred answer A (PII Level Low) from logical consistency with Q3 (excludes account deletion + email verification), Q8 (no regulatory regime), Q9 (no external integrations), and Q14 (Argon2id + RS256 JWT). The pod may override this at Gate #1 by writing an `## Objection` block in the signoff file.

### 2.9 Launch markets / locales
**English only** (en-US copy). No i18n framework wired in v1. Architecture must NOT preclude adding i18n later (i.e., copy should be referenced via constants, not hardcoded JSX strings, so an i18n layer can be inserted without refactoring components).

### 2.10 Monetization
**N/A** — internal learning experiment.

---

## 3. AI-product specifics (Codiste preset)

### 3.1 AI/ML usage scope
**None.** Login + account-setup is a deterministic non-AI flow. No LLM, no RAG, no classifier, no embeddings, no vector DB in v1. The `ai-ml-lifecycle` extension will be **opted OUT** at Stage 4.

### 3.2 Data retention policy
- **Account records**: retained while account is active
- **Auth logs** (login attempts, password-change events): 90 days (Codiste preset default)
- **No training on user data** — ever
- **Deletion**: out-of-scope for v1 (no account-deletion endpoint); future work

### 3.3 Brand assets availability
**Figma design supplied** by team lead at: https://www.figma.com/design/He1Wne35awqY445vBFXIhI/AI-DLC

Stage 2 — Design Intake will extract via Figma MCP:
- Brand colors → `aidlc-docs/inception/design/design-tokens.md`
- Typography → `design-tokens.md`
- Logo references → `branding.md`
- Screen flow (login → signup → account-setup) → `screen-flow-map.md`

### 3.4 Existing IP / OSS dependencies
**Use battle-tested OSS**, not custom crypto:

| Concern | Library | Notes |
|---------|---------|-------|
| Password hashing | Argon2id (via `argon2` npm or `argon2-cffi` Python) | Codiste preset default |
| JWT signing | `jose` or `jsonwebtoken` (Node), `pyjwt` (Python) | RS256 (Codiste preset) |
| Input validation | zod (Node), pydantic (Python) | Per stack chosen at Stage 11 |
| ORM | Prisma (Node) or SQLAlchemy 2.x (Python) | Per stack chosen at Stage 11 |

Avoid: any custom crypto, MD5 / SHA1 / bcrypt-with-low-cost, RS256 with leaked private keys.

### 3.5 Accessibility commitment
**WCAG 2.2 AA** target. The `accessibility` extension will be **opted IN** at Stage 4 (Requirements Analysis). All form fields, error states, focus states, and keyboard navigation must meet WCAG 2.2 AA. Color contrast pulled from Figma tokens must be validated against AA contrast ratios at design-intake time.

### 3.6 Legal review status
**Deferred.** Internal experiment; no public Privacy Policy / ToS needed in v1. Placeholder copy ("Privacy policy — TODO") is acceptable. If/when the reference implementation is reused for a client product, legal review will be required at that point.

---

## 4. Cross-Reference Matrix

| Requirement / item | Source citation |
|--------------------|-----------------|
| Problem statement | sources/source-001-text.md ¶1; followup Q4=C |
| Target users | followup Q1=A |
| Success metrics | followup Q2=A |
| Out-of-scope items | followup Q3=A,B,C,D,E,F,G |
| Business goals | followup Q4=C |
| Target platforms | followup Q5=A; sources/source-001-text.md (Figma URL) |
| Expected scale | followup Q6=A |
| Budget | checklist B.3 [~] N/A |
| Timeline | followup Q7=A |
| Stakeholders | pod.md |
| Regulatory / compliance | followup Q8=A |
| External integrations | followup Q9=A |
| Data classification | followup Q10 (blank — AI-inferred A; flagged) |
| Locales | followup Q11=A |
| Monetization | checklist B.10 [~] N/A |
| AI/ML usage scope | followup Q12=A |
| Data retention | followup Q13=A; aidlc-profile.md |
| Brand assets | sources/source-001-text.md |
| OSS dependencies | followup Q14=A; aidlc-profile.md conventions |
| Accessibility | followup Q15=A |
| Legal review | followup Q16=A |

---

## 5. Open Questions Carried Forward

| # | Item | Deferred to stage | Why |
|---|------|-------------------|-----|
| 1 | Specific Web framework (Next.js? Plain React?) and Backend stack (NestJS? FastAPI? Go?) | Stage 11 — Stack Selection (per UoW) | Codiste preset suggests Next.js + NestJS, but the pod chooses at Stage 11. |
| 2 | Email-verification stub design (just log? Or actually fire a webhook to a queue worker?) | Stage 8 — Functional Design | Within v1 "stub" scope, but the shape of the stub matters for Stage 9 NFR. |
| 3 | JWT token lifetime + refresh-token rotation policy | Stage 10 — NFR Design | Codiste preset says "refresh-token rotation, RS256" but lifetime values are NFR-level. |
| 4 | Postgres / SQLite for v1 dev | Stage 11 — Stack Selection | Trivial for ≤ 50 users; choose at Stack Selection. |
| 5 | Deployment target (single VM? Docker Compose? K8s?) | Stage 17 — IaC (conditional) | Aligns with Codiste preset cloud target = AWS; depth depends on whether IaC is enabled. |
| 6 | Pod override on Q10 (data classification) | Gate #1 signoff | Flagged because Q10 was blank in follow-up; AI inferred PII Level Low. |

---

## 6. Compliance pre-summary (extensions to be confirmed at Stage 4)

These are the user's *stated intent* on extension opt-in. Stage 4 (Requirements Analysis) will finalize them in `aidlc-state.md` under `## Extension Configuration`.

| Extension | Stated intent | Driving BR item |
|-----------|---------------|------------------|
| `accessibility` (WCAG 2.2 AA) | **Opt IN** | § 3.5 |
| `security` (baseline) | **Likely opt IN** (auth flow + PII even at Level Low — recommended) | § 2.8, § 3.4 |
| `testing` (property-based) | **Likely opt OUT for v1** (deterministic flow; standard unit + integration sufficient) | § 1.4 (thin v1 scope) |
| `ai-ml-lifecycle` | **Opt OUT** | § 3.1 (no AI in v1) |
