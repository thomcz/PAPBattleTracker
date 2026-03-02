# Implementation Plan: Bestiary & Player Creation Redesign

**Branch**: `009-bestiary-player-redesign` | **Date**: 2026-02-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-bestiary-player-redesign/spec.md`

## Summary

Apply the existing dark RPG visual theme to the Bestiary and Player pages to achieve full application-wide visual consistency. Both pages currently use a light Bootstrap-like CSS inconsistent with the already-redesigned Session, Battle, and Authentication pages. The redesign replaces HTML templates and CSS files with SCSS using the shared `_auth-theme.scss` design system, following the exact structural and visual patterns established by the redesigned pages. No backend changes, no new functionality, no data model changes.

## Technical Context

**Language/Version**: TypeScript ~5.9.2
**Primary Dependencies**: Angular 21.0.2 (standalone components, signals, `@if`/`@for` control flow), SCSS (`_auth-theme.scss` shared design system)
**Storage**: N/A — pure presentation-layer change; existing use cases and adapters unchanged
**Testing**: Vitest ^4.0.15 + @testing-library/angular ^19.0.0 (`npm test` in `frontend-angular/`)
**Target Platform**: Web SPA (responsive: 375px mobile → 1440px desktop)
**Project Type**: Web application (Angular frontend only — no backend changes)
**Performance Goals**: No regression vs. constitution targets: FCP ≤1.8s, LCP ≤2.5s, lazy-loaded routes ≤100KB gzipped
**Constraints**: TypeScript component logic is untouched; only HTML templates and CSS→SCSS files change; all existing signals/use cases/ports remain in place
**Scale/Scope**: 2 Angular standalone components (BeasteryListComponent, PlayerListComponent) + their child dialog components (CreatureFormDialogComponent, PlayerFormDialogComponent)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Hexagonal Architecture** | ✅ PASS | Only the infrastructure/presentation layer (HTML + SCSS) changes. Domain entities, application use cases, and port interfaces are untouched. |
| **II. TDD** | ✅ PASS (obligation) | Component tests must be written or updated for each changed component. Adapter-layer coverage ≥80%. Tests verify: dark theme CSS classes present, all CRUD actions still work, empty/loading/error states render. |
| **III. UX Consistency** | ✅ PASS — this IS the fix | The entire purpose of this feature is to eliminate visual inconsistency by implementing the shared project design system. |
| **IV. Performance** | ✅ PASS | No new modules, no new dependencies. Replacing plain CSS with SCSS (already compiled for other components) has no measurable bundle impact. |

**Post-design re-check**: ✅ All gates still pass. Phase 1 design confirms frontend-only scope.

## Project Structure

### Documentation (this feature)

```text
specs/009-bestiary-player-redesign/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks — NOT created here)
```

### Source Code (affected files)

```text
frontend-angular/src/app/features/

  beastery/pages/beastery-list/
  ├── beastery-list.component.html        ← REPLACE (dark theme HTML structure)
  ├── beastery-list.component.css         ← DELETE and replace with:
  ├── beastery-list.component.scss        ← CREATE (dark RPG SCSS)
  └── beastery-list.component.ts          ← UPDATE styleUrls: .css → .scss

  player/pages/player-list/
  ├── player-list.component.html          ← REPLACE (dark theme HTML structure)
  ├── player-list.component.css           ← DELETE and replace with:
  ├── player-list.component.scss          ← CREATE (dark RPG SCSS)
  └── player-list.component.ts            ← UPDATE styleUrls: .css → .scss

  auth/shared/
  └── _auth-theme.scss                    ← READ-ONLY reference (no changes)

  (Tests)
  beastery/pages/beastery-list/
  └── beastery-list.component.spec.ts     ← CREATE or UPDATE

  player/pages/player-list/
  └── player-list.component.spec.ts       ← CREATE or UPDATE
```

**Structure Decision**: Frontend-only web application change. No new directories needed. The existing feature module structure is preserved; only the presentation files for 2 components are replaced.

## Complexity Tracking

No constitution violations to justify.
