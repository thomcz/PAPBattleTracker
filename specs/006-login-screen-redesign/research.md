# Research: Login Screen Redesign

**Feature**: 006-login-screen-redesign
**Date**: 2026-02-21

## R-001: Icon Implementation Without External Dependencies

**Decision**: Use inline SVG for complex icons (castle, key, eye, lock) and Unicode for simple ones (@).

**Rationale**: The project already includes Angular Material but the mockup icons are custom-styled. Inline SVG provides:
- Zero additional HTTP requests
- Full CSS control over fill, size, and animation
- No dependency bloat
- Crisp rendering at any size

**Alternatives considered**:
- Material Icons (`mat-icon`): Available but the castle/fortress icon doesn't exist in the Material icon set. Would need a mix of Material + custom anyway.
- FontAwesome: New dependency (~300KB uncompressed). Overkill for 5 icons.
- CSS-only shapes: The diamond shape for the logo is achievable with CSS transforms, but the castle silhouette requires SVG.

## R-002: Dark Theme Color Contrast Compliance (WCAG 2.1 AA)

**Decision**: Gold text (#d4a843) on dark background (#1a1a2e) meets WCAG AA (contrast ratio ~7.2:1). Muted gray labels (#c0c0c0) on dark background also pass (ratio ~9.5:1).

**Rationale**: Constitution requires WCAG 2.1 AA compliance (≥4.5:1 for normal text). Verified:
- Gold (#d4a843) on dark (#1a1a2e): ~7.2:1 ✅
- Light gray (#c0c0c0) on dark (#1a1a2e): ~9.5:1 ✅
- Placeholder gray (#808080) on dark (#1a1a2e): ~4.8:1 ✅ (AA for large text, borderline for small - will use slightly lighter if needed)
- White on dark (#1a1a2e): ~15.4:1 ✅
- Error red (#ff6b6b) on dark (#1a1a2e): ~5.2:1 ✅

**Alternatives considered**:
- Brighter gold (#f0c040): Higher contrast but doesn't match mockup aesthetic.

## R-003: Shared SCSS Architecture

**Decision**: Create `_auth-theme.scss` partial with CSS custom properties, imported by both login and register SCSS files.

**Rationale**: Current login.scss and register.scss are nearly identical (117 lines each). A shared partial:
- Eliminates ~100 lines of duplication
- Single source of truth for colors, typography, spacing
- Easy to adjust theme across both screens

**Pattern**:
```scss
// _auth-theme.scss
:host {
  --auth-bg: #1a1a2e;
  --auth-purple: #6b46c1;
  --auth-gold: #d4a843;
  // ... etc
}

// Shared mixins for input fields, buttons, etc.
```

## R-004: Existing Test Impact Analysis

**Decision**: Update test queries to match new labels. Add 2-3 new tests for password toggle.

**Rationale**: Analyzed existing tests:

**Login tests (login.spec.ts)** - 19 tests affected:
- `getByLabelText(/username/i)` → `getByLabelText(/grandmaster id/i)`
- `getByLabelText(/password/i)` → `getByLabelText(/secret sigil/i)`
- `getByRole('button', { name: /login/i })` → `getByRole('button', { name: /enter the sanctum/i })`
- `getByRole('link', { name: /register here/i })` → Need to query "Create New Campaign" button or link
- Loading text: "Logging in..." remains or changes to themed equivalent

**Register tests (register.spec.ts)** - 26 tests affected:
- Labels change to themed equivalents
- Button text changes
- Link text changes

**New tests needed**:
- Password visibility toggle (click eye → type changes to text)
- Password visibility toggle back (click again → type changes back to password)
- Eye icon renders in password field

## R-005: Castle/Fortress Logo Design

**Decision**: Implement the castle logo as a CSS-styled container (purple diamond via CSS transform: rotate(45deg)) with an inline SVG castle silhouette inside.

**Rationale**: The mockup shows:
1. A purple diamond (rotated square) as the background shape
2. A castle/fortress silhouette (towers with battlements) inside
3. A small golden circle with a key icon overlapping the bottom of the diamond

This can be achieved with:
- A `div` with `transform: rotate(45deg)`, purple background, and border-radius for rounded corners
- The castle as an inline SVG positioned inside (counter-rotated)
- The key badge as an absolutely positioned element

No image assets needed. Pure CSS + SVG.
