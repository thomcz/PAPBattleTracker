# Implementation Plan: Dashboard Redesign

**Branch**: `007-dashboard-redesign` | **Date**: 2026-02-21 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/007-dashboard-redesign/spec.md`

## Summary

Redesign the dashboard (HomeComponent) from a light-themed card-grid layout to a dark RPG-themed dashboard matching the login/register screens. Replace the card-based navigation with a persistent bottom navigation bar (shared app shell) and display battle data as rich cards with stats overview. Reuses the existing `_auth-theme.scss` color palette and the existing `BattlePort` for data.

## Technical Context

**Language/Version**: TypeScript (Angular 21.0.2, standalone components)
**Primary Dependencies**: Angular Router, RxJS, Angular Signals, existing BattlePort/BattleApiAdapter
**Storage**: N/A (reads from existing battle API)
**Testing**: Vitest + @testing-library/angular (`npx ng test`)
**Target Platform**: Web (mobile-first, responsive)
**Project Type**: Web application (frontend-only changes)
**Performance Goals**: FCP ≤1.8s, LCP ≤2.5s, 60 FPS interactions
**Constraints**: Reuse existing `_auth-theme.scss` color palette, no new backend API, WCAG 2.1 AA compliance
**Scale/Scope**: 4 new/modified components, 1 shared layout, ~8 files changed

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Hexagonal Architecture | PASS | No new domain logic. Dashboard reads from existing BattlePort. Bottom nav is a pure UI component. |
| II. TDD (Non-Negotiable) | PASS | Tests written before implementation per task ordering. Existing tests updated for new labels. |
| III. UX Consistency | PASS | Reuses established dark RPG theme from `_auth-theme.scss`. Same color palette, typography, spacing. WCAG 2.1 AA compliance maintained. |
| IV. Performance & Scalability | PASS | Lazy-loaded routes preserved. Bottom nav is lightweight. Battle list already paginated via API. |

No violations. All gates pass.

## Project Structure

### Documentation (this feature)

```text
specs/007-dashboard-redesign/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (files to create/modify)

```text
frontend-angular/src/app/
├── app.html                              # MODIFY: Add bottom nav to app shell
├── app.ts                                # MODIFY: Add Router imports for bottom nav
├── app.scss                              # MODIFY: Add bottom nav styles
├── shared/
│   └── components/
│       └── bottom-nav/
│           ├── bottom-nav.component.ts   # CREATE: Bottom navigation bar component
│           ├── bottom-nav.component.html # CREATE: Bottom nav template
│           ├── bottom-nav.component.scss # CREATE: Bottom nav styles
│           └── bottom-nav.component.spec.ts # CREATE: Bottom nav tests
├── home/
│   ├── home.ts                           # MODIFY: Redesign dashboard with dark theme
│   ├── home.html                         # CREATE: External template (extract from inline)
│   ├── home.scss                         # CREATE: External styles (extract from inline)
│   └── home.spec.ts                      # MODIFY: Update tests for new dashboard
└── features/auth/shared/
    └── _auth-theme.scss                  # READ-ONLY: Reuse existing theme variables
```

**Structure Decision**: Frontend-only changes. The home component moves from inline template/styles to external files for maintainability. A new shared `BottomNavComponent` is created as the app shell navigation. The existing `_auth-theme.scss` is imported by the new components to maintain visual consistency.

## Key Design Decisions

### DD-001: Shared App Shell with Bottom Navigation

The bottom nav is placed in `app.html` alongside `<router-outlet>`, wrapped in a conditional that hides it on guest pages (login/register). This avoids modifying every authenticated component individually.

**Pattern**: `app.html` contains:
```html
<router-outlet />
@if (isAuthenticated()) {
  <app-bottom-nav />
}
```

The `isAuthenticated()` check uses the existing `LoginUseCase.isAuthenticated` signal.

### DD-002: Theme Reuse via SCSS Import

All new components import `_auth-theme.scss` using `@use` to access the established color variables and mixins. No CSS custom properties migration needed — the SCSS variables are sufficient.

### DD-003: Home Component Externalization

Move the inline template (~60 lines) and styles (~100 lines) to external `home.html` and `home.scss` files. This is necessary given the significant template redesign and makes the component maintainable.

### DD-004: Battle Data for Dashboard

The dashboard uses `BattlePort.listBattles()` to fetch battles. Stats (game count, total players) are computed as `computed()` signals derived from the battle list signal. No new API endpoint needed.

### DD-005: Bottom Nav Active Tab Detection

Use Angular Router's `RouterLinkActive` directive to automatically highlight the active tab based on the current route. This is the standard Angular pattern and avoids manual route tracking.

### DD-006: Inline SVG Icons for Bottom Nav

Following the established pattern from the login redesign (research R-001), use inline SVG for the 4 bottom nav tab icons. No external icon library.

## Complexity Tracking

No constitution violations to justify. All design decisions align with existing patterns.
