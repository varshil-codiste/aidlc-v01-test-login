# Branding

**Source**: Figma file `He1Wne35awqY445vBFXIhI` ("AI-DLC"); page `0:1`; primary frames `1:2` (background), `1:5` (SignUp Left panel), `1:23` (Sign In form group), `1:36` (zone logo).
**Captured at**: 2026-05-12T00:05:00Z
**Captured by**: Figma MCP via `get_metadata` + `get_design_context` (frames `1:5` and `1:23`).
**Note**: This Figma file does **NOT** use Figma Variables (`get_variable_defs` returned `{}`). All colors and typography are hardcoded; tokens below are reverse-engineered from the design context output.

---

## Product context (inferred from design)

The design is branded as **"Zone POS"** — a merchant-facing Point of Sale platform. The single canvas pulled is the **login + merchant-signup landing screen** (1440 × 1080, web, desktop-first).

The team has scoped this AI-DLC experiment as "small login + account setup feature" (see `business-requirements.md` § 1.1). We will **adopt the Zone POS visual identity from the Figma** for this experiment — it is the design our team lead supplied. Treat "Zone POS" branding as a placeholder skin; the functional implementation is generic email + password auth + account profile setup.

---

## Logo

| Asset | Path / source | Format | Notes |
|-------|---------------|--------|-------|
| Primary logo "zone" | Figma node `1:36` ("zone logo"); raster bitmap embedded at `1:38` (391×157 source); displayed at 313×85 at position (921, 164) on the canvas | PNG (Figma raster) | Single asset; **no SVG variant supplied**; **no inverted (dark-bg) variant supplied** |
| Inverted logo | — | — | **Missing** — flagged for design follow-up. The current single asset uses dark text on light background; the left signup panel is `#016097` blue and currently shows no logo on that side. If the logo needs to appear over the blue, a white/inverted variant is required. |
| Icon / favicon | — | — | **Missing** — flagged. Convention: derive from the "zone" wordmark or request a square icon from the designer. |

> **Open question** (carried to Application Design / Functional Design): is the dark-text "zone" logo the only mark, or should we request the inverted + favicon variants from the team lead before Code Generation?

---

## Brand Colors

| Role | Hex | Source | Usage notes |
|------|-----|--------|-------------|
| **Primary brand (Marine Blue)** | `#016097` | Frame `1:5` / shape `1:7` (`bg-[#016097]`) — full-height signup panel | Hero / brand panel background; trust + financial-product association |
| **Accent / CTA (Orange)** | `#ef8022` | Frame `1:33` / rect `1:34` (`bg-[#ef8022]`) — primary "Sign In" button fill | Primary action color; high-contrast call-to-action |
| **Text — Heading** | `#2c2b2b` | Text `1:25` ("Sign In to Zone POS") — `text-[#2c2b2b]` | Dark gray (not pure black) for headings on light bg |
| **Text — Secondary / Placeholder** | `#908d8d` | Text `1:26`, `1:29`, `1:32` — `text-[#908d8d]` | Subtitle copy + form-field placeholder text |
| **Surface — Input** | `#f9f9f9` | Rect `1:28`, `1:31` (`bg-[#f9f9f9]`) — input field background | Off-white form-input surface; subtle separation from page background |
| **Surface — Page (right)** | (transparent / shape-bg `1:3`/`1:4`) — assumed `#ffffff` | Frame `1:2` background | Page / card background on the right side |
| **Text — On primary (white)** | `#ffffff` | Text `1:12`, `1:15`, `1:19`, `1:22`, `1:35` | All left-panel text + the "Sign In" button label |

### Derived neutrals (interpolated for token scale)

Designer did not supply a full neutral ramp. Below is a Codiste-house interpolation suitable for v1; flag to designer at first review.

| Token | Hex | Rationale |
|-------|-----|-----------|
| `neutral.0` | `#ffffff` | Pure white surface |
| `neutral.50` | `#f9f9f9` | Matches input bg from Figma |
| `neutral.300` | `#d1d0d0` | Border / divider — interpolated |
| `neutral.500` | `#908d8d` | Matches placeholder / subtitle from Figma |
| `neutral.700` | `#5a5959` | Body text — interpolated |
| `neutral.900` | `#2c2b2b` | Matches heading from Figma |

### Semantic colors (NOT in source; placeholders pending designer input)

| Token | Provisional hex | Note |
|-------|-----------------|------|
| `success` | `null` | Designer did not specify a success color. Provisional `#16a34a` may be used in code with a TODO. |
| `warning` | `null` | Same — provisional `#f59e0b`. |
| `danger`  | `null` | Same — provisional `#dc2626`. Required for form-validation errors at Stage 8. |

---

## Voice & Tone

Not provided in the Figma file. Visible copy gives hints only:

| Surface | Sample copy from Figma | Tone inferred |
|---------|------------------------|----------------|
| Login title | "Sign In to Zone POS" | Direct, transactional |
| Login subtitle | "You need to have registered and verified as merchant, before you can proceed." | Instructional, gated-access |
| Signup section A | "Become A Merchant" + "Register to become a Merchant on the Zone POS platform. Register and Upload all necessary requirements without leaving your comfort zone." | Inviting, customer-friendly |
| Signup section B | "Create your Merchant Profile" + "Recieved your Merchant Id? Create your merchant profile and start customizing your Admin..." | Onboarding, post-issuance |

**Copy quality flags** (for designer/copywriter review during Application Design):

- Typo: `Recieved` → `Received` (text node `1:13`)
- Typo: `expeirence` → `experience` (text node `1:13`)
- Apostrophe consistency: `your`/`Your` casing inconsistent in placeholder labels

> Tone target: **Direct, transactional, lightly instructional.** Avoid marketing speak. Avoid emoji. Reading level ~ 8th grade. Use sentence case for buttons (`Sign In`, not `SIGN IN`).

---

## Source asset references

| Description | Asset URL (Figma-hosted, 7-day expiry) |
|-------------|------------------------------------------|
| Full canvas (1440×1080 PNG, captured 2026-05-12) | https://www.figma.com/api/mcp/asset/a7c29e36-142f-4e39-aa85-b4e21afc684b |
| Decorative line (`1:10`) on left signup panel | https://www.figma.com/api/mcp/asset/4a1cd92b-0120-4645-ac85-8e455cc7dee3 |

Both URLs expire ~2026-05-19. If we need the assets after that, re-fetch via Figma MCP.

---

## Outstanding design questions (carry to Stage 6 — Application Design)

1. **Logo variants** — is the single dark "zone" wordmark sufficient, or do we need inverted + favicon?
2. **Account-setup / profile-completion screen** — Figma supplies only the login + signup-CTA landing; the actual signup form, the "create merchant profile" form, and the post-login dashboard are **not in this file**. Options: (a) request additional frames from team lead; (b) generate placeholder forms in code that use the same tokens.
3. **Mobile responsive breakpoint** — design is 1440 desktop only. v1 must be responsive (BR § 2.1). Reflow rules need designer guidance OR we follow Codiste house defaults (single-column on `< 768px`, full-width buttons, stacked sections).
4. **Error states / loading states / disabled states** — none present in design. Codiste house defaults apply unless specified.
5. **Typo fixes** — confirm with team lead whether to fix `Recieved`/`expeirence` in implementation or preserve as-is to match Figma.
