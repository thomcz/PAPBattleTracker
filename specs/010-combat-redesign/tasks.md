# Tasks: Combat Screen Redesign

**Input**: Design documents from `/specs/010-combat-redesign/`
**Branch**: `010-combat-redesign`
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/ ✅

**Tests**: Included per project constitution (TDD — tests written before implementation).

**Organization**: Grouped by user story — each story is independently implementable and testable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no mutual dependencies)
- **[Story]**: Which user story this task belongs to (US1–US4)
- All file paths are relative to repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Shared routing structure and domain model additions that unblock all user stories.

- [x] T001 Update `frontend-angular/src/app/app.routes.ts` — replace flat `battles/:id → BattleDetailComponent` with 4 lazy-loaded child routes: default path `''` → `CombatPrepareComponent`, `initiative` → `CombatInitiativeComponent`, `combat` → `CombatActiveComponent`, `result` → `CombatResultComponent`
- [x] T002 [P] Create `frontend-angular/src/app/core/domain/models/combat.model.ts` — define `StatusEffect` enum (Poisoned, Stunned, Blinded, Blessed, Prone, Restrained, Burning, Frozen), `CombatContribution` interface, `CombatResult` interface as specified in data-model.md

**Checkpoint**: Routes compile; navigating to `battles/:id` no longer loads `BattleDetailComponent`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: `CombatantCard` shared component is required by US1, US2, and US3 — must exist before those phases begin.

**⚠️ CRITICAL**: US1, US2, and US3 cannot be fully implemented until this phase is complete.

- [x] T003 Write spec for `CombatantCardComponent` in `frontend-angular/src/app/features/battle/components/combatant-card/combatant-card.component.spec.ts` — test: HP bar renders green/yellow/red at >50%/25–50%/≤25%, `isActive` input adds gold border highlight, CURRENT label visible when active, `(clicked)` emits creature on card tap, status effect chips rendered for each effect string
- [x] T004 Implement `CombatantCardComponent` in `frontend-angular/src/app/features/battle/components/combatant-card/combatant-card.component.ts|html|scss` — standalone, inputs: `creature: Creature`, `isActive: boolean = false`, `showInitiative: boolean = true`; output: `(clicked): EventEmitter<Creature>`; HP bar with color thresholds; AC badge; initiative badge; status effect chips; dark theme via `@use '../../../auth/shared/auth-theme' as *`

**Checkpoint**: `npm test` passes for `combatant-card.component.spec.ts`

---

## Phase 3: User Story 1 — Combat Preparation Screen (Priority: P1) 🎯 MVP

**Goal**: Navigating to `battles/:id` shows a dark-themed preparation screen with creature roster, encounter stats, and a "Start Battle" action instead of the old `BattleDetailComponent`.

**Independent Test**: Navigate to an existing battle — verify dark RPG themed page loads, creature HP bars and AC values are visible, clicking "Start Battle" navigates to `battles/:id/initiative`.

- [x] T005 [US1] Write spec for `CombatPrepareComponent` in `frontend-angular/src/app/features/battle/pages/combat-prepare/combat-prepare.component.spec.ts` — test: calls `getBattle(id)` on init, renders ENEMIES / PLAYERS / AVG CR stats, renders `CombatantCard` for each creature, "Start Battle" disabled when creatures empty, "Start Battle" navigates to `../initiative`, redirects to `../combat` if status is ACTIVE, redirects to `../result` if status is ENDED, Add Entity opens `CreatureDialogComponent`, Reset List calls `removeCreature` for all creatures after confirmation
- [x] T006 [US1] Implement `CombatPrepareComponent` in `frontend-angular/src/app/features/battle/pages/combat-prepare/combat-prepare.component.ts|html|scss` — header: back button (→ `/home`), battle name, Start Battle button (top-right); stats bar: enemies count, players count, avg CR (computed signal); creature list: `CombatantCard` per creature; footer: "Add Entity" (opens existing `CreatureDialogComponent`), "Reset List"; on init check `battle().status` and redirect; style via `_auth-theme.scss` matching `battle-list.component.scss` patterns

**Checkpoint**: Navigate to `battles/:id` — preparation screen renders with dark theme; creatures load; Start Battle navigates correctly. All T005 specs pass.

---

## Phase 4: User Story 2 — Initiative Setup Screen (Priority: P2)

**Goal**: After tapping Start Battle, a screen lists all combatants with dex modifier hints, lets the DM enter or auto-roll initiative, and starts combat with creatures sorted by initiative.

**Independent Test**: From the prepare screen tap Start Battle — verify initiative screen appears, monsters have a dice icon that auto-fills initiative (1d20 + dex mod), players have an editable input; tap "START BATTLE" → combat begins with creatures in initiative order.

### Backend — Add `dexModifier` to Creature

- [x] T007 [US2] Add `val dexModifier: Int? = null` to `Creature.kt` in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/model/Creature.kt` — nullable for backward compatibility; preserve in `takeDamage()`, `heal()`, `copy()` operations
- [x] T008 [P] [US2] Update `CreateCreatureRequest.kt` in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/application/dto/` — add `val dexModifier: Int? = null` with validation `@Min(-5) @Max(10)`
- [x] T009 [P] [US2] Update `UpdateCreatureRequest.kt` in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/application/dto/` — add `val dexModifier: Int? = null` with validation `@Min(-5) @Max(10)`
- [x] T010 [US2] Update `CreatureResponse.kt` (and/or `BattleMapper.kt`) in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/application/dto/` to include `dexModifier` in response
- [x] T011 [US2] Write integration tests for `dexModifier` in `backend/src/test/kotlin/de/thomcz/pap/battle/backend/infrastructure/rest/BattleControllerTest.kt` — test: POST creature with dexModifier persists and appears in response; PUT creature updates dexModifier; omitting dexModifier results in null response field

### Frontend — Add `dexModifier` and Initiative Screen

- [x] T012 [P] [US2] Update `Creature` interface in `frontend-angular/src/app/core/domain/models/battle.model.ts` — add `dexModifier?: number` field
- [x] T013 [US2] Write spec for `CombatInitiativeComponent` in `frontend-angular/src/app/features/battle/pages/combat-initiative/combat-initiative.component.spec.ts` — test: all combatants rendered with type badge (PC/BOSS), dex modifier formatted as "+N" / "−N", dice button triggers d20+dexMod roll and populates input, "Roll all monsters" rolls for all MONSTER-type creatures, group minion toggle groups same-name monsters to one entry, "START BATTLE" disabled until all inputs have a value, START BATTLE calls `updateCreature()` for changed initiatives then `startCombat()` then navigates to `../combat`
- [x] T014 [US2] Implement `CombatInitiativeComponent` in `frontend-angular/src/app/features/battle/pages/combat-initiative/combat-initiative.component.ts|html|scss` — header: back button (→ `../`), "Initiative Setup" title, encounter name subtitle; "Group Minion Initiative" toggle; combatant rows: type badge, avatar icon, name, dex mod hint, dice roll button, initiative number input; "Roll all monsters" link; gold "START BATTLE" button; style via `_auth-theme.scss`

**Checkpoint**: Full flow Prepare → Initiative → Combat start works. All T011, T013 specs pass.

---

## Phase 5: User Story 3 — Active Combat Screen (Priority: P3)

**Goal**: Turn-based combat with a highlighted current combatant, a tappable Action Manager for applying damage/healing/status effects, and an End Combat action leading to the result screen.

**Independent Test**: From initiative screen start combat — verify creature list in initiative order, current actor has gold border + CURRENT label; tap a creature → Action Manager opens with that creature as target; apply 10 damage → HP bar shrinks immediately; tap Next Turn → highlight moves to next creature; End Combat → outcome dialog → navigates to result.

### Backend — Apply Healing Endpoint

- [x] T015 [P] [US3] Create `ApplyHealingUseCase.kt` interface in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/port/in/ApplyHealingUseCase.kt`
- [x] T016 [P] [US3] Create `ApplyHealingCommand.kt` DTO (fields: `creatureId: UUID`, `healing: Int`, `source: String?`) in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/application/dto/` and add `HealingApplied` data class to `BattleEvent.kt` in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/model/events/`
- [x] T017 [US3] Implement `applyHealing()` in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/application/service/BattleService.kt` — validate battle is ACTIVE, find creature by ID, call `Creature.heal(amount)` (clamps to maxHp), persist `HealingApplied` event, return updated `BattleDetailResponse`
- [x] T018 [US3] Add `POST /api/battles/{id}/heal` endpoint to `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/adapter/in/rest/BattleController.kt` — request body: `ApplyHealingCommand`; delegates to `ApplyHealingUseCase`; returns `200 BattleDetailResponse`; errors: 400 (healing < 1), 404 (battle/creature not found), 409 (not ACTIVE)
- [x] T019 [P] [US3] Write unit test for `BattleService.applyHealing()` in `backend/src/test/kotlin/de/thomcz/pap/battle/backend/application/service/BattleServiceTest.kt` — test: heals creature (capped at maxHp), throws if battle not ACTIVE, throws if creature not found
- [x] T020 [US3] Write integration test for `POST .../heal` in `backend/src/test/kotlin/de/thomcz/pap/battle/backend/infrastructure/rest/BattleControllerTest.kt` — test: returns 200 with updated HP, 409 when not ACTIVE, 404 when creature missing, 400 when healing < 1

### Backend — Apply Status Effect Endpoint

- [x] T021 [P] [US3] Create `ApplyStatusEffectUseCase.kt` interface + `ApplyStatusEffectCommand.kt` DTO (fields: `effect: String`, `action: EffectAction`) + `EffectAction` enum (ADD, REMOVE) in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/port/in/` and `application/dto/`; add `StatusEffectApplied` and `StatusEffectRemoved` data classes to `BattleEvent.kt`
- [x] T022 [US3] Implement `applyStatusEffect()` in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/application/service/BattleService.kt` — validate battle is ACTIVE, find creature, call `Creature.addEffect()` or `Creature.removeEffect()`, persist event, return updated `BattleDetailResponse`
- [x] T023 [US3] Add `POST /api/battles/{id}/creatures/{creatureId}/effects` endpoint to `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/adapter/in/rest/BattleController.kt` — request body: `ApplyStatusEffectCommand`; validates effect is in known list; returns `200 BattleDetailResponse`
- [x] T024 [P] [US3] Write unit test for `BattleService.applyStatusEffect()` in `backend/src/test/kotlin/de/thomcz/pap/battle/backend/application/service/BattleServiceTest.kt`
- [x] T025 [US3] Write integration test for effects endpoint in `backend/src/test/kotlin/de/thomcz/pap/battle/backend/infrastructure/rest/BattleControllerTest.kt` — test: ADD applies effect, REMOVE removes it, unknown effect name returns 400

### Frontend — Port, Adapter, Use Cases

- [x] T026 [US3] Extend `BattlePort` in `frontend-angular/src/app/core/ports/battle.port.ts` — add abstract methods `applyHealing(battleId, creatureId, healing, source?)` and `applyStatusEffect(battleId, creatureId, effect, action)` returning `Observable<Battle>`
- [x] T027 [US3] Implement `applyHealing()` and `applyStatusEffect()` in `frontend-angular/src/app/adapters/api/battle-api.adapter.ts` — POST to `/api/battles/{id}/heal` and `/api/battles/{id}/creatures/{creatureId}/effects`
- [x] T028 [US3] Write tests for new adapter methods in `frontend-angular/src/app/adapters/api/battle-api.adapter.spec.ts` — test HTTP calls for both methods with correct payloads
- [x] T029 [P] [US3] Write spec then implement `ApplyHealingUseCase` in `frontend-angular/src/app/core/domain/use-cases/apply-healing.use-case.ts|spec.ts` — calls `BattlePort.applyHealing()`, updates battle signal on success
- [x] T030 [P] [US3] Write spec then implement `ApplyStatusEffectUseCase` in `frontend-angular/src/app/core/domain/use-cases/apply-status-effect.use-case.ts|spec.ts` — calls `BattlePort.applyStatusEffect()`, updates battle signal on success

### Frontend — Combat Contribution Service

- [x] T031 [US3] Write spec then implement `CombatContributionService` in `frontend-angular/src/app/features/battle/services/combat-contribution.service.ts|spec.ts` — `providedIn: 'root'`; tracks per-creature `CombatContribution` signals; methods: `startTimer()`, `stopTimer()`, `recordDamage(creatureId, amount)`, `recordHealing(creatureId, amount)`, `recordStatusApplied(creatureId)`, `getContributions(): CombatContribution[]`, `getElapsedMs(): number`, `reset()`; test all methods and time tracking

### Frontend — Action Manager Component

- [x] T032 [US3] Write spec for `ActionManagerComponent` in `frontend-angular/src/app/features/battle/components/action-manager/action-manager.component.spec.ts` — test: selected creature shown as active target, target changes on portrait tap, amount increments/decrements correctly, Apply Damage emits damage event with amount and selected creature, Apply Healing emits healing event, status effect toggles emit toggle event, dice roll populates amount field, close button emits closed event
- [x] T033 [US3] Implement `ActionManagerComponent` in `frontend-angular/src/app/features/battle/components/action-manager/action-manager.component.ts|html|scss` — inputs: `battle: Battle`, `initialTarget: Creature | null`; outputs: `(damageApplied): {creature, amount}`, `(healingApplied): {creature, amount}`, `(statusToggled): {creature, effect, action}`, `(closed)`; layout: target portrait row (tap to switch), amount stepper (−/+), "Apply Damage" red button, "Apply Healing" green button, 8 status effect icon-buttons (toggle on/off per selected target), quick roll row (d6, d8, d12, d20 — result populates amount); slide-up panel with dark overlay backdrop; style via `_auth-theme.scss`

### Frontend — Active Combat Screen

- [x] T034 [US3] Write spec for `CombatActiveComponent` in `frontend-angular/src/app/features/battle/pages/combat-active/combat-active.component.spec.ts` — test: loads battle on init, redirects to `../` if NOT_STARTED, creatures listed in initiative order, current actor card has isActive=true, tap non-active creature opens ActionManager with that creature as target, damageApplied calls `applyDamage` and records in `CombatContributionService`, healingApplied calls `applyHealing`, statusToggled calls `applyStatusEffect`, "Next Turn" calls `advanceTurn()`, "End Combat" shows outcome dialog, selecting Victory calls `endCombat(PLAYERS_VICTORIOUS)` and navigates to `../result`
- [x] T035 [US3] Implement `CombatActiveComponent` in `frontend-angular/src/app/features/battle/pages/combat-active/combat-active.component.ts|html|scss` — header: "Round N • Turn N" subtitle, "COMBAT TRACKER" title, history icon, play/pause toggle; stats bar: enemies/players/avg CR (same as prepare); combatant list: `CombatantCard` for each, `isActive` on current actor, tap emits to open `ActionManagerComponent`; footer: "Next Turn" button, "End Combat" button; End Combat dialog: Victory / Defeat options; on outcome confirm call `endCombat()` + navigate; inject `CombatContributionService`, call `startTimer()` on init; style via `_auth-theme.scss`

**Checkpoint**: Full combat flow works end-to-end. All T019, T020, T024, T025, T028–T035 specs pass.

---

## Phase 6: User Story 4 — Combat Result Screen (Priority: P4)

**Goal**: After ending combat, a styled Victory or Defeat screen shows total rounds, time elapsed, and per-player combat contribution stats with an End Encounter action.

**Independent Test**: End combat with Victory outcome — verify "VICTORY" heading shown in gold, total rounds correct, at least one player listed with damage stat, "End Encounter" navigates to `/home`.

- [x] T036 [US4] Write spec for `CombatResultComponent` in `frontend-angular/src/app/features/battle/pages/combat-result/combat-result.component.spec.ts` — test: shows VICTORY when outcome is PLAYERS_VICTORIOUS, shows DEFEAT otherwise, total rounds matches `battle().round`, time elapsed computed from `CombatContributionService.getElapsedMs()`, contributions list shows only PLAYER-type creatures sorted by totalDamage descending, "End Encounter" navigates to `/home`, calls `CombatContributionService.reset()` on navigate
- [x] T037 [US4] Implement `CombatResultComponent` in `frontend-angular/src/app/features/battle/pages/combat-result/combat-result.component.ts|html|scss` — reads `CombatOutcome` from router state (passed during `endCombat` navigation) or falls back to `battle().status`; trophy/skull icon + VICTORY/DEFEAT heading; stats row: Total Rounds, Time Elapsed (formatted as Xm Ys); "Combat Contribution" section header with "Total Damage: N"; player contribution cards: avatar initial, name, class badge, damage bar, stat chips (crits, healed, buffs); gold "End Encounter →" button; share placeholder button (shows snackbar "Coming soon"); style via `_auth-theme.scss`

**Checkpoint**: End-to-end flow completes: Prepare → Initiative → Combat → Result → Home. All T036, T037 specs pass.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Remove deprecated components and validate full test suite.

- [x] T038 Delete deprecated `frontend-angular/src/app/features/battle/pages/battle-detail/` directory — confirm no remaining imports in `app.routes.ts` or other files before deleting
- [x] T039 [P] Delete deprecated `frontend-angular/src/app/features/battle/components/combat-controls/` directory — logic now distributed across `CombatPrepareComponent`, `CombatInitiativeComponent`, and `CombatActiveComponent`
- [x] T040 [P] Delete deprecated `frontend-angular/src/app/features/battle/components/combat-log/` directory — combat log deferred from new design; verify no remaining imports
- [x] T041 Remove any remaining Angular Material imports (MatCardModule, MatButtonModule, MatIconModule) from files that were only used by deleted components; ensure `creature-list` and `creature-dialog` components remain intact (still used by prepare screen)
- [x] T042 Run full test suite — execute `npm test` (frontend, expect all specs green) and `./gradlew test` (backend, expect all tests green); confirm ≥80% coverage on all new files; fix any failures before marking feature complete

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (needs `combat.model.ts` for `CombatantCard`)
- **US1 Prepare (Phase 3)**: Depends on Phase 2 (`CombatantCard` must exist)
- **US2 Initiative (Phase 4)**: Depends on Phase 3 (navigated from Prepare screen); backend tasks (T007–T011) can run in parallel with Phase 3
- **US3 Active Combat (Phase 5)**: Depends on Phase 4 (navigated from Initiative); backend tasks (T015–T025) can start as soon as Phase 1 is done
- **US4 Result (Phase 6)**: Depends on Phase 5 (`CombatContributionService` must exist)
- **Polish (Phase 7)**: Depends on all story phases complete and tests passing

### User Story Dependencies

- **US1 (P1)**: Depends on Foundational only — can start after Phase 2
- **US2 (P2)**: Depends on US1 (navigation flow) — start after Phase 3 checkpoint
- **US3 (P3)**: Depends on US2 (navigation flow) — start after Phase 4 checkpoint; backend work (T015–T025) can start after Phase 1
- **US4 (P4)**: Depends on US3 (`CombatContributionService`) — start after Phase 5 checkpoint

### Parallel Opportunities (within phases)

- **Phase 1**: T001 and T002 are fully parallel (different files)
- **Phase 4**: T007–T009 backend changes are parallel; T012 frontend model update is parallel to backend changes
- **Phase 5 Backend**: T015 and T016 (heal port + command) are parallel; T021 (status port/command) is parallel to T015–T020
- **Phase 5 Use Cases**: T029 and T030 (apply-healing and apply-status use cases) are fully parallel
- **Phase 7**: T039 and T040 are parallel (different directories)

---

## Parallel Execution Examples

### Phase 5 Backend (US3) — Maximum Parallelism

```
Parallel group A (can all start together after T016 deps met):
  T015: Create ApplyHealingUseCase.kt interface
  T016: Create ApplyHealingCommand.kt + HealingApplied event
  T021: Create ApplyStatusEffectUseCase.kt + command + events

Sequential after T015/T016:
  T017 → T018 → T020 (heal service → controller → integration test)

Sequential after T021:
  T022 → T023 → T025 (status service → controller → integration test)

Parallel during above:
  T019: Unit test for applyHealing (can run after T017)
  T024: Unit test for applyStatusEffect (can run after T022)
```

### Phase 5 Frontend Use Cases (US3) — Maximum Parallelism

```
Parallel after T026/T027 complete:
  T029: ApplyHealingUseCase spec + implementation
  T030: ApplyStatusEffectUseCase spec + implementation
  T031: CombatContributionService spec + implementation
```

---

## Implementation Strategy

### MVP: User Story 1 Only (Phase 1–3)

1. Complete Phase 1 (Setup — 2 tasks)
2. Complete Phase 2 (Foundational — 2 tasks)
3. Complete Phase 3 (US1 Prepare — 2 tasks)
4. **STOP AND VALIDATE**: Dark-themed prepare screen replaces old battle-detail ✅
5. Demo: Navigate to any battle → see redesigned dark screen with creature list

### Incremental Delivery

1. Phases 1–3 → **US1 done**: Preparation screen redesigned ✅
2. Phase 4 → **US2 done**: Initiative setup works ✅
3. Phase 5 → **US3 done**: Full turn-based combat with Action Manager ✅
4. Phase 6 → **US4 done**: Victory/Defeat result screen ✅
5. Phase 7 → **Cleanup**: Old components removed, all tests green ✅

### Parallel Team Strategy

After Phase 2 (Foundational) is complete:

- **Developer A**: US1 prepare screen (Phase 3) then US2 initiative (Phase 4)
- **Developer B**: US3 backend endpoints (T015–T025) — independent from frontend work
- **Developer C**: US3 frontend use cases + ActionManager (T026–T033) — after T026 ports are defined

---

## Notes

- TDD: Write spec tasks first, run `npm test` / `./gradlew test` — confirm tests FAIL, then implement to make them GREEN
- `_auth-theme.scss` is the single source of truth for all colors and typography — never hardcode colors in component SCSS files
- `CombatantCard` is shared across 3 screens — any changes to it affect US1, US2, US3
- The `battles/:id` route no longer renders `BattleDetailComponent` after T001 — ensure backend is running before testing navigation
- `CombatContributionService` is `providedIn: 'root'` and persists across child route navigation — call `reset()` in `CombatResultComponent` when "End Encounter" is tapped
- Router state (Navigation extras `state`) is the preferred mechanism to pass `CombatOutcome` from `CombatActiveComponent` to `CombatResultComponent` without query params
