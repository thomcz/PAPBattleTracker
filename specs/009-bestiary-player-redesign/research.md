# Research: Bestiary & Player Creation Redesign

**Phase**: 0 — Outline & Research
**Date**: 2026-02-27
**Branch**: `009-bestiary-player-redesign`

## Summary

This is a pure visual redesign with no unknowns requiring external research. The existing codebase already contains the complete design system and reference implementations. Research was conducted by reading the existing Angular codebase directly.

---

## Decision 1: Design System Source of Truth

**Decision**: Use `_auth-theme.scss` as the single source of truth for all visual tokens.

**Rationale**: The file already defines the complete color palette, typography, and mixins used by all redesigned pages. Importing it with `@use '../../../auth/shared/auth-theme' as *;` gives access to all variables and mixins without duplication.

**Alternatives considered**:
- Creating separate SCSS variables for Bestiary/Player → rejected: duplicates the design system and risks drift
- Inline CSS variables → rejected: inconsistent with existing component pattern

**Key tokens**:
| Token | Value | Usage |
|-------|-------|-------|
| `$auth-bg` | `#1a1a2e` | Page background (dark navy) |
| `$auth-bg-secondary` | `#16213e` | Gradient start |
| `$auth-purple` | `#6b46c1` | Cards, primary buttons |
| `$auth-gold` | `#d4a843` | Active badges, gold accents |
| `$auth-text` | `#c0c0c0` | Body text |
| `$auth-text-white` | `#f0f0f0` | Headings |
| `$auth-font-title` | Georgia, serif | Page titles, card names |
| `$auth-font-body` | Roboto, sans-serif | Body, labels |

---

## Decision 2: HTML Structure Pattern

**Decision**: Follow the session-list and battle-list structural pattern exactly.

**Rationale**: These are the established, approved patterns in the codebase. Following them ensures visual and structural consistency without inventing new patterns.

**Pattern reference**: `frontend-angular/src/app/features/session/pages/session-list/`

**Structural elements to adopt**:

| Element | CSS Class Pattern | Notes |
|---------|-------------------|-------|
| Page wrapper | `.dashboard` | `max-width: 600px`, centered |
| Header bar | `.header` | flex, space-between, back button + title + action |
| Page title | `.section-title` | `$auth-font-title`, serif, bold |
| Create button | `.btn-create` | Purple bg, SVG icon + label |
| Card list | `.{feature}-list` | flex column, gap 1rem |
| Individual card | `.{feature}-card` | Translucent bg, border, rounded 14px, hover |
| Card name | `.{feature}-name` | `$auth-font-title`, 1.15rem, `$auth-text-white` |
| Card metadata | `.{feature}-meta` | Small, `$auth-text-light`, uppercase label |
| Card stats | `.stat-card` rows | flex, gap for HP/AC/Level values |
| Action button | `.btn-open` / `.btn-action` | Purple, inline-flex, SVG icon |
| Empty state | `.empty-state` | Centered, 3rem padding, dark bg |
| Loading | `.loading-state` | Spinner + text, centered |
| Dialog overlay | `.dialog-overlay` | Fixed, rgba(0,0,0,0.7) |
| Dialog box | `.confirm-dialog` | Dark card, same as other pages |

**Alternatives considered**:
- Grid layout (current beastery/player) → rejected: list layout is the established pattern on redesigned pages and works better on mobile
- Keeping the `creatures-grid` / `players-grid` card grid → rejected: inconsistent with list-based Session and Battle pages

---

## Decision 3: CSS Extension — .css → .scss

**Decision**: Rename `.css` files to `.scss` and update `styleUrls` in component TypeScript accordingly.

**Rationale**: All redesigned pages use `.scss` files with `@use` imports from `_auth-theme.scss`. Plain `.css` files cannot use `@use` SCSS syntax. The Angular build pipeline already processes SCSS.

**Impact**: Only the `styleUrls` property in `beastery-list.component.ts` and `player-list.component.ts` changes — no logic changes.

**Alternatives considered**:
- Using CSS custom properties instead of SCSS variables → rejected: inconsistent with established pattern; would require duplicating all theme values as CSS vars

---

## Decision 4: Testing Approach

**Decision**: Use Vitest + @testing-library/angular to write component tests verifying both visual structure and functional correctness.

**Rationale**: This is the project's established testing framework (`vitest` in `package.json`). CLAUDE.md requires ≥80% coverage for adapter-layer components.

**Test strategy**:
1. **Dark theme tests**: Assert that key dark-theme CSS class names are present in the rendered DOM (`.beastery-list`, `.creature-card`, etc.)
2. **Functional regression tests**: Assert all CRUD operations (create, edit, delete, duplicate for bestiary; create, edit, delete for players) trigger the correct use case methods
3. **State rendering tests**: Assert loading/error/empty states render correctly with the right structural elements
4. **No visual snapshot tests**: CSS correctness is verified structurally, not via pixel snapshots

**Alternatives considered**:
- Cypress E2E visual testing → out of scope; too heavy for a styling change
- Karma/Jasmine → not installed in this project

---

## Decision 5: Child Dialog Components (Scope)

**Decision**: Child dialog components (`CreatureFormDialogComponent`, `PlayerFormDialogComponent`) are **in scope for visual review but may not need full rewrites** if they already use a dark theme internally.

**Rationale**: The explore agent confirmed they are imported and rendered as `<app-creature-form-dialog>` and `<app-player-form-dialog>`. Their internal styling was not fully audited. They need to be checked and updated if they use light theme styles.

**Action**: During implementation, read each dialog component's HTML/CSS and update if needed to match the dark dialog pattern (`.dialog-overlay` → dark backdrop, `.confirm-dialog` → dark card). This is a conditional task.

---

## No Unknowns Remaining

All design decisions are resolved. No external research was required. The implementation can proceed directly to Phase 1 design and then task generation.
