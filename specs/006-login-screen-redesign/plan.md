# Implementation Plan: Login Screen Redesign

**Branch**: `006-login-screen-redesign` | **Date**: 2026-02-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-login-screen-redesign/spec.md`

## Summary

Refactor the Angular frontend login and registration screens from a light-themed card layout to a dark RPG-themed design matching the provided mockup. This is a frontend-only change affecting templates (HTML), styles (SCSS), and component logic (password visibility toggle). No backend changes required. All existing authentication functionality and form validation must be preserved.

## Technical Context

**Language/Version**: TypeScript (Angular 21.0.2)
**Primary Dependencies**: Angular 18 (standalone components), ReactiveFormsModule, Angular Router, RxJS, Angular Signals
**Storage**: N/A (no storage changes - existing JWT/localStorage unchanged)
**Testing**: Vitest + @testing-library/angular + jsdom
**Target Platform**: Web (responsive: mobile 320px, tablet 768px, desktop 1920px)
**Project Type**: Web application (frontend-only change)
**Performance Goals**: FCP ≤1.8s, LCP ≤2.5s (no regression from current)
**Constraints**: Must preserve all existing test assertions. No new npm dependencies for icons (use Unicode/CSS/SVG).
**Scale/Scope**: 2 components (login, register), ~8 files modified

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Hexagonal Architecture | ✅ PASS | No architecture changes. Components remain in features layer, use cases untouched. |
| II. TDD | ✅ PASS | Existing tests will be updated to match new UI labels/structure. New tests for password toggle. |
| III. UX Consistency | ✅ PASS | Both auth screens will share the same dark RPG theme. Consistent styling enforced via shared SCSS variables. |
| IV. Performance | ✅ PASS | CSS-only visual changes. No new JS bundles or heavy assets. SVG/CSS icons keep bundle size minimal. |

**Gate Result**: PASS - No violations. Proceeding to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/006-login-screen-redesign/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (minimal - UI-only feature)
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
frontend-angular/src/app/
├── features/auth/
│   ├── login/
│   │   ├── login.ts              # Add passwordVisible signal
│   │   ├── login.html            # Redesigned template
│   │   ├── login.scss            # Dark RPG theme styles
│   │   └── login.spec.ts         # Updated tests
│   └── register/
│       ├── register.ts           # Minor updates (if needed)
│       ├── register.html         # Redesigned template
│       ├── register.scss         # Dark RPG theme styles
│       └── register.spec.ts      # Updated tests
└── features/auth/shared/
    └── _auth-theme.scss          # Shared SCSS variables/mixins for dark RPG theme
```

**Structure Decision**: Existing feature structure preserved. A shared SCSS partial (`_auth-theme.scss`) will be added to avoid duplicating color/typography variables between login and register styles.

## Design Decisions

### DD-001: Icon Strategy

**Decision**: Use Unicode characters and inline SVG for all icons (castle logo, @, key, eye, lock, fingerprint).

**Rationale**: The design requires decorative icons (castle/fortress in diamond, @, key, eye toggle, lock). Rather than adding an icon library dependency (Material Icons, FontAwesome), use:
- CSS shapes + Unicode/SVG for the castle logo in purple diamond
- Unicode `@` for the Grandmaster ID prefix
- SVG inline for key icon, eye icon, lock icon

**Alternatives rejected**:
- Material Icons: Already available via Angular Material but would add to bundle for just a few icons
- FontAwesome: New dependency, unnecessary weight
- Icon font: Custom icon fonts are maintenance overhead

### DD-002: Shared Theme Approach

**Decision**: Create a shared SCSS partial `_auth-theme.scss` with CSS custom properties (variables) for the dark RPG color palette.

**Rationale**: Both login and register screens share identical colors, typography, and input styling. A shared SCSS file with variables prevents duplication and ensures consistency.

**Color palette** (extracted from mockup):
- `--auth-bg`: #1a1a2e (deep navy background)
- `--auth-bg-gradient`: linear-gradient(180deg, #16213e 0%, #1a1a2e 100%)
- `--auth-card-bg`: transparent (no card - form floats on background)
- `--auth-purple`: #6b46c1 (purple accents, diamond shape)
- `--auth-purple-light`: #9b7dd4 (lighter purple for hover states)
- `--auth-gold`: #d4a843 (golden button)
- `--auth-gold-hover`: #e0b84d (golden button hover)
- `--auth-text`: #c0c0c0 (muted gray text for labels)
- `--auth-text-light`: #808080 (placeholder text)
- `--auth-input-bg`: rgba(255, 255, 255, 0.08) (dark translucent input backgrounds)
- `--auth-input-border`: rgba(255, 255, 255, 0.15) (subtle borders)
- `--auth-error`: #ff6b6b (error text for dark backgrounds)

### DD-003: Password Visibility Toggle

**Decision**: Add a `passwordVisible` signal to the Login component and toggle input type between `password` and `text`.

**Rationale**: The design mockup shows an eye icon on the right side of the password field. This requires:
- A `passwordVisible = signal(false)` in the component
- A `togglePasswordVisibility()` method
- Template binding: `[type]="passwordVisible() ? 'text' : 'password'"`
- Eye icon that changes based on visibility state (eye-open vs eye-closed)

### DD-004: Test Strategy

**Decision**: Update existing tests to match new label text and add new tests for password toggle.

**Rationale**: Current tests reference labels like "Username", "Password", "Login". After redesign:
- Login labels change to "GRANDMASTER ID" and "SECRET SIGIL"
- Button text changes to "Enter the Sanctum"
- Footer text changes from "Don't have an account? Register here" to "Create New Campaign" button
- New tests needed: password visibility toggle, eye icon interaction

Existing test assertions for form validation, error handling, loading states, and authentication flow remain valid — only label/selector queries need updating.

### DD-005: FORGOTTEN? Link Behavior

**Decision**: The "FORGOTTEN?" link will be a non-functional anchor (`href="#"` or `javascript:void(0)`) with no route.

**Rationale**: No password reset feature exists. The link is included for visual fidelity with the mockup. It will be wired up when password reset is implemented.

### DD-006: Touch ID Section Excluded

**Decision**: The Touch ID / fingerprint section from the mockup will not be implemented.

**Rationale**: Biometric authentication is out of scope for the current application. This section is purely decorative in the mockup.

## Constitution Re-Check (Post Phase 1)

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Hexagonal Architecture | ✅ PASS | No architecture changes. |
| II. TDD | ✅ PASS | Tests updated for new labels. New tests for password toggle. Coverage maintained. |
| III. UX Consistency | ✅ PASS | Shared `_auth-theme.scss` ensures both screens are consistent. Color contrast ratios checked (gold on dark ≥4.5:1). |
| IV. Performance | ✅ PASS | No new dependencies. CSS/SVG only. No performance regression expected. |

**Gate Result**: PASS - Design is constitution-compliant.
