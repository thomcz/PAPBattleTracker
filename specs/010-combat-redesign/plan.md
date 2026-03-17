# Implementation Plan: Combat Screen Redesign

**Branch**: `010-combat-redesign` | **Date**: 2026-03-03 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/010-combat-redesign/spec.md`

---

## Summary

Redesign the battle detail screen by splitting the single monolithic `BattleDetailComponent` into four purpose-built screens (Prepare → Initiative → Active Combat → Result) that follow the established dark RPG visual theme (`_auth-theme.scss`). Two new backend endpoints (heal, status effects) and a `dexModifier` field on the Creature model are required to support the new screens. All new Angular components use standalone architecture with signals and the `@if`/`@for` control flow syntax.

---

## Technical Context

**Language/Version**: TypeScript ~5.9.2 + Angular 21.0.2 (frontend); Kotlin 1.9.25 JVM 21 (backend)
**Primary Dependencies**: Angular standalone components, Angular Signals, RxJS, SCSS `_auth-theme.scss`, Spring Boot 3.5.7, Spring Data JPA, JWT
**Storage**: Backend H2 event sourcing (existing); frontend `CombatContributionService` accumulates session stats locally
**Testing**: Vitest + TestBed + @testing-library/angular (frontend); JUnit 5 + MockK + Spring Test (backend)
**Target Platform**: Mobile-first web (375px–1920px viewports)
**Project Type**: Web application (Angular frontend + Kotlin backend)
**Performance Goals**: HP bar updates within one animation frame; FCP ≤ 1.8s per constitution; lazy-loaded routes ≤ 100KB gzipped
**Constraints**: `_auth-theme.scss` design system only; no new third-party UI libraries; `@angular/cdk` already installed (can use overlay if needed)
**Scale/Scope**: 4 new page components, 2 new shared components, 1 new service, 2 new backend endpoints, 1 model field addition

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Hexagonal Architecture** | ✅ PASS | New pages depend on use cases; new API methods added to `BattlePort` (interface) first, then implemented in `BattleApiAdapter`; domain events added for heal/status |
| **II. TDD** | ✅ PASS | All new components, use cases, and services require spec files; backend requires unit + integration tests |
| **III. UX Consistency** | ✅ PASS | All screens use `_auth-theme.scss`; mobile-first; touch targets ≥ 44px |
| **IV. Performance** | ✅ PASS | Four pages are lazy-loaded via child routes; `CombatantCard` uses signal inputs; no virtual scrolling needed (typical encounter: ≤15 combatants) |

**Post-design re-check**: No violations introduced. `CombatContributionService` is frontend-only (no domain leak). Child routes are standard Angular patterns.

---

## Project Structure

### Documentation (this feature)

```text
specs/010-combat-redesign/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── combat-redesign-api.yaml   # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks — NOT created here)
```

### Source Code

```text
# Backend (Kotlin)
backend/src/main/kotlin/de/thomcz/pap/battle/backend/
├── domain/
│   ├── model/
│   │   └── Creature.kt                  MODIFY — add dexModifier: Int?
│   ├── model/events/
│   │   └── BattleEvent.kt               MODIFY — add HealingApplied, StatusEffectApplied, StatusEffectRemoved
│   └── port/in/
│       ├── ApplyHealingUseCase.kt        NEW
│       └── ApplyStatusEffectUseCase.kt   NEW
├── application/
│   ├── dto/
│   │   ├── ApplyHealingCommand.kt        NEW
│   │   ├── ApplyStatusEffectCommand.kt   NEW
│   │   ├── CreateCreatureRequest.kt      MODIFY — add dexModifier
│   │   └── UpdateCreatureRequest.kt      MODIFY — add dexModifier
│   └── service/
│       └── BattleService.kt             MODIFY — add applyHealing, applyStatusEffect
└── infrastructure/adapter/in/rest/
    └── BattleController.kt              MODIFY — add /heal and /effects endpoints

backend/src/test/kotlin/.../
├── domain/
│   └── CreatureTest.kt                  MODIFY — add dexModifier tests
├── application/service/
│   └── BattleServiceTest.kt             MODIFY — add heal + status effect tests
└── infrastructure/rest/
    └── BattleControllerTest.kt          MODIFY — add endpoint tests

# Frontend (Angular)
frontend-angular/src/app/
├── core/
│   ├── domain/
│   │   ├── models/
│   │   │   ├── battle.model.ts          MODIFY — add dexModifier to Creature
│   │   │   └── combat.model.ts          NEW — StatusEffect enum, CombatContribution, CombatResult
│   │   └── use-cases/
│   │       ├── apply-healing.use-case.ts           NEW
│   │       ├── apply-healing.use-case.spec.ts      NEW
│   │       ├── apply-status-effect.use-case.ts     NEW
│   │       └── apply-status-effect.use-case.spec.ts NEW
│   └── ports/
│       └── battle.port.ts               MODIFY — add applyHealing, applyStatusEffect
├── adapters/api/
│   ├── battle-api.adapter.ts            MODIFY — implement applyHealing, applyStatusEffect
│   └── battle-api.adapter.spec.ts       MODIFY — add adapter tests
└── features/battle/
    ├── pages/
    │   ├── combat-prepare/
    │   │   ├── combat-prepare.component.ts      NEW
    │   │   ├── combat-prepare.component.html    NEW
    │   │   ├── combat-prepare.component.scss    NEW
    │   │   └── combat-prepare.component.spec.ts NEW
    │   ├── combat-initiative/
    │   │   ├── combat-initiative.component.ts      NEW
    │   │   ├── combat-initiative.component.html    NEW
    │   │   ├── combat-initiative.component.scss    NEW
    │   │   └── combat-initiative.component.spec.ts NEW
    │   ├── combat-active/
    │   │   ├── combat-active.component.ts      NEW
    │   │   ├── combat-active.component.html    NEW
    │   │   ├── combat-active.component.scss    NEW
    │   │   └── combat-active.component.spec.ts NEW
    │   ├── combat-result/
    │   │   ├── combat-result.component.ts      NEW
    │   │   ├── combat-result.component.html    NEW
    │   │   ├── combat-result.component.scss    NEW
    │   │   └── combat-result.component.spec.ts NEW
    │   └── battle-detail/                       REMOVE (replaced by combat-prepare)
    ├── components/
    │   ├── combatant-card/
    │   │   ├── combatant-card.component.ts      NEW
    │   │   ├── combatant-card.component.html    NEW
    │   │   ├── combatant-card.component.scss    NEW
    │   │   └── combatant-card.component.spec.ts NEW
    │   └── action-manager/
    │       ├── action-manager.component.ts      NEW
    │       ├── action-manager.component.html    NEW
    │       ├── action-manager.component.scss    NEW
    │       └── action-manager.component.spec.ts NEW
    └── services/
        ├── combat-contribution.service.ts       NEW
        └── combat-contribution.service.spec.ts NEW

# Routing
frontend-angular/src/app/app.routes.ts   MODIFY — replace battles/:id with child routes
```

**Structure Decision**: Web application — Angular frontend with hexagonal layers (domain → ports → adapters → features) and Kotlin backend. Feature code in `features/battle/`, domain models in `core/domain/`, port implementations in `adapters/api/`.

---

## Implementation Phases

### Phase A: Backend Extensions (foundation for all screens)

**A1 — Add `dexModifier` to Creature model**
- Modify `Creature.kt` domain model: add `val dexModifier: Int? = null`
- Modify `CreateCreatureRequest.kt` and `UpdateCreatureRequest.kt`: add `dexModifier: Int?`
- Modify `CreatureResponse.kt`: include `dexModifier` in response
- Tests: update `CreatureTest.kt` to verify dexModifier is preserved

**A2 — Add `applyHealing` endpoint**
- Create `ApplyHealingUseCase.kt` (port/in)
- Create `ApplyHealingCommand.kt` (application/dto)
- Add `applyHealing` method to `BattleService.kt` using existing `Creature.heal()` domain method
- Add `HealingApplied` event to `BattleEvent.kt`
- Add `POST /api/battles/{id}/heal` to `BattleController.kt`
- Tests: unit test service, integration test controller endpoint

**A3 — Add `applyStatusEffect` endpoint**
- Create `ApplyStatusEffectUseCase.kt` (port/in)
- Create `ApplyStatusEffectCommand.kt` with `effect: String` and `action: EffectAction`
- Add `applyStatusEffect` method to `BattleService.kt` using existing `Creature.addEffect()/removeEffect()` domain methods
- Add `StatusEffectApplied` and `StatusEffectRemoved` events
- Add `POST /api/battles/{id}/creatures/{creatureId}/effects` to `BattleController.kt`
- Tests: unit test service, integration test controller endpoint

---

### Phase B: Frontend Domain & Ports

**B1 — Domain model updates**
- Modify `battle.model.ts`: add `dexModifier?: number` to `Creature`
- Create `combat.model.ts`: `StatusEffect` enum, `CombatContribution`, `CombatResult` interfaces

**B2 — Port & adapter extensions**
- Modify `battle.port.ts`: add `applyHealing()` and `applyStatusEffect()` abstract methods
- Modify `battle-api.adapter.ts`: implement both new methods as HTTP calls
- Tests: update adapter spec for new methods

**B3 — New use cases**
- Create `apply-healing.use-case.ts`: wraps `BattlePort.applyHealing()`, updates battle signal
- Create `apply-status-effect.use-case.ts`: wraps `BattlePort.applyStatusEffect()`, updates battle signal
- Tests: unit tests for both use cases with mocked port

**B4 — Combat Contribution Service**
- Create `combat-contribution.service.ts`: tracks `CombatContribution[]` in signals, exposes `recordDamage()`, `recordHealing()`, `recordStatusApplied()`, `getContributions()`, `reset()` methods
- Service is `providedIn: 'root'` to persist across child route navigation
- Tests: unit tests for all tracking methods and reset behavior

---

### Phase C: Routing

**C1 — Update `app.routes.ts`**
- Replace flat `battles/:id → BattleDetailComponent` with child routes:
  ```typescript
  {
    path: 'battles/:id',
    children: [
      { path: '', loadComponent: () => CombatPrepareComponent },
      { path: 'initiative', loadComponent: () => CombatInitiativeComponent },
      { path: 'combat', loadComponent: () => CombatActiveComponent },
      { path: 'result', loadComponent: () => CombatResultComponent },
    ],
    canActivate: [authGuard]
  }
  ```
- Each child route is lazy-loaded
- Note: Smart redirect — if landing on `battles/:id` and battle status is `ACTIVE`, auto-redirect to `battles/:id/combat`

---

### Phase D: Shared Components

**D1 — `CombatantCard` component**
- Input: `creature: Creature`, `isActive: boolean`, `showInitiative: boolean`
- Displays: avatar icon (type-based), name, HP bar (colored: green > 50%, yellow 25-50%, red < 25%), current/max HP, AC badge, initiative badge, status effect chips, CURRENT label when active
- Emits: `(clicked)` event when tapped
- Style: `_auth-theme.scss` — dark card background, gold border for active, rounded corners
- Tests: component tests for HP bar color, active state, click emit

**D2 — `ActionManager` component**
- Inputs: `battle: Battle`, `selectedCreature: Creature | null`
- Displays: target selector (portrait row of all non-defeated creatures), amount stepper (−/+), Apply Damage button (red), Apply Healing button (green), status effect grid (8 toggleable icons), quick dice row (d6, d8, d12, d20)
- Emits: `(damageApplied)`, `(healingApplied)`, `(statusToggled)`, `(closed)` events
- Styling: fixed bottom panel, slides up from bottom with CSS transition; backdrop overlay; follows `_auth-theme.scss`
- Tests: component tests for target selection, amount adjustment, dice roll populates amount, status toggle

---

### Phase E: Four Screen Pages

**E1 — `CombatPrepareComponent`** (replaces `BattleDetailComponent`)
- Header: battle name, back button (→ session list), "▶ Start Battle" button (top right)
- Stats bar: Enemies count, Players count, Avg CR (computed from creatures)
- Creature list: uses `CombatantCard` in prepare mode (shows edit/remove actions)
- "Add Entity" button opens `CreatureDialogComponent` (existing, reused)
- "Reset List" button clears all creatures after confirmation
- Style: `_auth-theme.scss` dark theme
- Navigation: "Start Battle" → navigate to `battles/:id/initiative`
- Tests: loads creatures, shows stats, navigates on Start Battle

**E2 — `CombatInitiativeComponent`**
- Header: "Initiative Setup", back button (→ prepare), encounter name subtitle
- Toggle: "Group Minion Initiative" (groups MONSTER creatures with same name)
- Combatant rows: type badge (PC/BOSS), avatar, name, dex mod hint, dice roll button, initiative input
- "Roll all monsters" action (rolls d20 + dexModifier for all MONSTER creatures)
- "START BATTLE" button (gold, full-width) → calls `updateCreature()` for changed initiatives, then `startCombat()`
- Style: `_auth-theme.scss`
- Tests: renders all combatants, dice roll populates field, Start Battle navigates to combat

**E3 — `CombatActiveComponent`**
- Header: "Round N • Turn N" / "Combat Tracker", undo (history icon), play/pause button
- Stats bar: Enemies, Players, Avg CR
- Creature list: `CombatantCard` for each, current actor highlighted with gold border
- Tap creature → opens `ActionManager` panel for that creature as selected target
- "Next Turn" advances turn (calls `advanceTurn()`)
- "End Combat" → confirmation dialog → select Victory/Defeat → calls `endCombat()` → navigates to result
- Style: `_auth-theme.scss`
- Tests: current actor highlighted, tap opens ActionManager, damage updates HP bar, advance turn changes highlight

**E4 — `CombatResultComponent`**
- Receives `CombatResult` from `CombatContributionService` (and `CombatOutcome` from battle)
- Victory: gold trophy icon + "VICTORY" heading; Defeat: alternate heading
- Stats: Total Rounds (from battle), Time Elapsed (computed from service timestamps)
- "Combat Contribution" list: player creatures only, sorted by damage; shows name, class badge, damage bar, stat chips (crits, healed, buffs)
- "End Encounter" button → navigates to session or battle list
- Share button → placeholder (copies URL or shows "Coming soon" toast)
- Style: `_auth-theme.scss`
- Tests: shows Victory/Defeat based on outcome, contributions listed correctly

---

### Phase F: Cleanup

**F1 — Remove old components** (after all new screens are tested and green)
- Delete `battle-detail/` page directory
- Remove `CombatControlsComponent` (logic moved into new pages)
- Remove `CombatLogComponent` (not shown in new design — combat log deferred)
- Remove `CreatureListComponent` if fully superseded by `CombatantCard` + prepare screen logic
- Update any remaining imports

---

## Complexity Tracking

> No constitution violations to justify. All decisions follow established patterns.

---

## Key Implementation Notes

1. **Initiative screen is transitional** — it's not tied to a `CombatStatus` value. The route `battles/:id/initiative` is navigated to programmatically from the prepare screen, not via deep link. A guard or redirect handles direct URL access.

2. **Dex modifier display format** — show as "+2" or "−1" (formatted with explicit sign). Use a pipe or helper function.

3. **HP bar color thresholds** — green: > 50%, yellow: 25–50%, red: ≤ 25%. Already computed in existing `CreatureListComponent.getHpClass()` — reuse the logic in `CombatantCard`.

4. **Status effect icons** — use Unicode symbols or SVG icons (no external icon library required). Keep it simple: skull (Poisoned), zzz (Stunned), eye-slash (Blinded), star (Blessed), lying figure (Prone), chain (Restrained), flame (Burning), snowflake (Frozen).

5. **Auto-redirect on load** — `CombatPrepareComponent.ngOnInit()` checks `battle.status`:
   - `ACTIVE` or `PAUSED` → redirect to `battles/:id/combat`
   - `ENDED` → redirect to `battles/:id/result`

6. **Time elapsed** — `CombatContributionService.startTimer()` is called when "START BATTLE" button is tapped on initiative screen. `stopTimer()` is called when End Combat is confirmed.
