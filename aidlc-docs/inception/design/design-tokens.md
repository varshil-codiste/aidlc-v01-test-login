# Design Tokens

**Source**: Figma file `He1Wne35awqY445vBFXIhI` — frames `1:5`, `1:23`, `1:36`. Variables/styles endpoint returned empty (`get_variable_defs = {}`); the file uses no Figma variables. Tokens below are extracted from inline Tailwind / RGB values in `get_design_context` output and supplemented with Codiste-house defaults where source is silent.
**Captured at**: 2026-05-12T00:05:00Z
**Format**: W3C Design Tokens Format Module convention. Exportable to Tailwind / Style Dictionary / shadcn-ui theme.

---

## Color Palette

```json
{
  "color": {
    "brand": {
      "primary":   { "value": "#016097", "source": "figma:1:7", "role": "left signup panel bg; primary brand surface" },
      "accent":    { "value": "#ef8022", "source": "figma:1:34", "role": "primary CTA fill ('Sign In' button)" }
    },
    "neutral": {
      "0":   { "value": "#ffffff", "source": "figma:on-primary-text", "role": "white text on brand bg + page surface" },
      "50":  { "value": "#f9f9f9", "source": "figma:1:28", "role": "input field background" },
      "300": { "value": "#d1d0d0", "source": "interpolated",       "role": "borders, dividers — TODO confirm with designer" },
      "500": { "value": "#908d8d", "source": "figma:1:26",         "role": "placeholder text, subtitle copy" },
      "700": { "value": "#5a5959", "source": "interpolated",       "role": "body text — TODO confirm" },
      "900": { "value": "#2c2b2b", "source": "figma:1:25",         "role": "heading text" }
    },
    "semantic": {
      "success": { "value": null, "provisional": "#16a34a", "note": "NOT in source — placeholder; flag to designer" },
      "warning": { "value": null, "provisional": "#f59e0b", "note": "NOT in source — placeholder" },
      "danger":  { "value": null, "provisional": "#dc2626", "note": "NOT in source — needed for form-validation error states; flag to designer for Stage 8" }
    }
  }
}
```

---

## Typography

```json
{
  "font": {
    "family": {
      "sans": "'Avenir', 'Avenir Next', 'Inter', system-ui, -apple-system, sans-serif",
      "mono": "'JetBrains Mono', 'Fira Code', ui-monospace, monospace"
    },
    "weight": {
      "medium":   { "value": 500, "source": "figma:Avenir Medium" },
      "heavy":    { "value": 800, "source": "figma:Avenir Heavy" }
    },
    "size": {
      "xs":  { "value": 12,   "source": "figma:1:29 placeholder",   "lineHeight": "normal" },
      "sm":  { "value": 14.4, "source": "figma:1:19 button label",  "lineHeight": "19.8px" },
      "base":{ "value": 16,   "source": "figma:1:26 body",          "lineHeight": "22px" },
      "lg":  { "value": 16.2, "source": "figma:1:13 left panel body","lineHeight": "25.2px" },
      "4xl": { "value": 37.8, "source": "figma:1:12 left panel hero","lineHeight": "46.8px" },
      "5xl": { "value": 42,   "source": "figma:1:25 main heading",  "lineHeight": "52px" }
    },
    "lineHeight": {
      "tight":  1.1,
      "normal": 1.375,
      "relaxed": 1.55
    }
  }
}
```

**Notes**:
- `Avenir` is a commercial font. **Confirm licensing with team lead** before pinning. Fallback `Inter` (open) and `system-ui` are wired.
- Two distinct weights only: Medium (500) and Heavy (800). No Regular / Bold / Light requested in Figma — confirm with designer if more are needed.
- Font sizes include odd values (`14.4`, `16.2`, `37.8`) — these are the Figma-exported values; we will round to 14 / 16 / 38 / 42 in implementation to align with a sensible scale.

---

## Spacing

```json
{
  "space": {
    "0":  { "value": 0 },
    "1":  { "value": 4 },
    "2":  { "value": 8 },
    "3":  { "value": 12 },
    "4":  { "value": 16, "source": "figma:1:29 left-padding 25/486 ≈ 5%" },
    "6":  { "value": 24, "source": "figma:1:27 height 62 / 2.6" },
    "8":  { "value": 32 },
    "12": { "value": 48 },
    "16": { "value": 64, "source": "figma:1:23 gap-to-logo 334-249" },
    "24": { "value": 96 }
  }
}
```

Spacing in this Figma file is loosely structured (absolute positions, no auto-layout). The values above are Codiste-house defaults; the implementation will use these and the visual output will be validated against the screenshot during Manual QA (Stage 14).

---

## Radii

```json
{
  "radius": {
    "none": { "value": 0 },
    "sm":   { "value": 4 },
    "md":   { "value": 6,  "source": "figma:1:28 input rounded-[6px]" },
    "lg":   { "value": 12 },
    "xl":   { "value": 16 },
    "pill": { "value": 31, "source": "figma:1:34 Sign In btn rounded-[31px]" },
    "pill-sm": { "value": 27.9, "source": "figma:1:18 outlined btn rounded-[27.9px]" }
  }
}
```

The Sign In button uses a true pill (`31px` on a `62px` tall button = full-radius). The outlined "Merchant Registration" / "Create Merchant Profile" buttons use `27.9px` on `56px` tall — also pill. We'll consolidate to `radius.pill = 9999` in implementation (CSS convention) since both intend "fully rounded".

---

## Shadows

```json
{
  "shadow": {
    "none": { "value": "none" },
    "sm":   { "value": null, "provisional": "0 1px 2px 0 rgb(0 0 0 / 0.05)", "note": "NOT in source" },
    "md":   { "value": null, "provisional": "0 4px 6px -1px rgb(0 0 0 / 0.1)", "note": "NOT in source" },
    "lg":   { "value": null, "provisional": "0 10px 15px -3px rgb(0 0 0 / 0.1)", "note": "NOT in source" }
  }
}
```

No shadows present in the supplied design (it is a flat layout). Provisional values are Codiste-house defaults; flag for designer review at Stage 8.

---

## Layout primitives

```json
{
  "layout": {
    "canvas":         { "width": 1440, "height": 1080, "source": "figma:1:2" },
    "split":          { "leftPanelWidth": 708,  "rightPanelWidth": 732, "source": "figma:1:5 width=708" },
    "logo":           { "width": 313,  "height": 85,  "position": [921, 164], "source": "figma:1:36" },
    "form":           { "width": 486,  "height": 412, "position": [834, 334], "source": "figma:1:23" },
    "input":          { "width": 486,  "height": 62,  "padding": "24 25", "source": "figma:1:27,1:30" },
    "buttonPrimary":  { "width": 352,  "height": 62,  "radius": 31,   "source": "figma:1:33" },
    "buttonOutlined": { "width": 317,  "height": 56,  "radius": 27.9, "borderWidth": 1.8, "source": "figma:1:17" }
  }
}
```

---

## Responsive notes (NOT in source; Codiste-house defaults applied)

Per BR § 2.1 (web only, responsive — desktop + mobile browser) the design MUST be responsive but the Figma supplies only the 1440 desktop layout. Codiste-house defaults:

| Breakpoint | Behavior |
|------------|----------|
| `≥ 1024px` | Side-by-side 50/50 split as in Figma |
| `≥ 768px`  | Side-by-side 60/40 with reduced left-panel padding |
| `< 768px`  | Single-column stack: brand panel collapses to a slim header strip (color `#016097`), then sign-in form, then signup CTAs stacked vertically |
| `< 480px`  | Hide brand-panel decorative content; show logo only |

Designer should confirm at Stage 6 (Application Design).

---

## Export hints

| Target | How to consume |
|--------|----------------|
| **Tailwind CSS** | Map `color.brand.primary` → `colors.brand.DEFAULT`, `color.brand.accent` → `colors.accent.DEFAULT`, `radius.pill` → `borderRadius.pill` |
| **shadcn/ui** | Use `:root` CSS variables: `--background: 0 0% 100%; --primary: 204 99% 30%; --primary-foreground: 0 0% 100%; --accent: 25 87% 54%;` (HSL of Figma values) |
| **Style Dictionary** | This JSON is already DTCG-shaped; export with `transform: name/cti/constant` |
| **NestJS / FastAPI / Go** | N/A — backend has no design tokens. The frontend stack chosen at Stage 11 will consume this file. |
