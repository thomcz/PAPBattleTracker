# Tasks: Creature Management

**Input**: Design documents from `/specs/002-creature-management/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/, research.md, quickstart.md

**Tests**: ✅ **REQUIRED** - Project follows TDD (Test-Driven Development) per constitution. All tests MUST be written FIRST and FAIL before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/`
- **Backend Tests**: `backend/src/test/kotlin/de/thomcz/pap/battle/backend/`
- **Frontend**: `frontend-angular/src/app/`
- **Frontend Tests**: Co-located with source files (`.spec.ts`)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Ensure development environment is ready for creature management feature

- [X] T001 Verify backend runs successfully with `./gradlew bootRun`
- [X] T002 Verify frontend runs successfully with `npm start`
- [X] T003 Verify existing Battle aggregate and event sourcing infrastructure is working
- [X] T004 Review existing Battle domain model in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/model/Battle.kt`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core domain entities and events that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Domain Layer (Backend) - TDD Required

- [X] T005 [P] **RED**: Write failing tests for Creature value object in `backend/src/test/kotlin/de/thomcz/pap/battle/backend/domain/model/CreatureTest.kt`
- [X] T006 **GREEN**: Implement Creature value object with validation in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/model/Creature.kt`
- [X] T007 **REFACTOR**: Clean up Creature code while keeping tests green
- [X] T008 [P] Create CreatureType enum in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/model/CreatureType.kt`

### Event Definitions (Backend)

- [X] T009 [P] Create CreatureAdded event in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/model/events/CreatureAdded.kt`
- [X] T010 [P] Create CreatureUpdated event in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/model/events/CreatureUpdated.kt`
- [X] T011 [P] Create CreatureRemoved event in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/model/events/CreatureRemoved.kt`
- [X] T012 Modify CombatEnded event to include removedMonsterIds field in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/model/events/CombatEnded.kt`

### Frontend Domain Models

- [X] T013 [P] Add Creature interface and CreatureType enum to `frontend-angular/src/app/core/domain/models/battle.model.ts`
- [X] T014 Extend Battle interface to include creatures array in `frontend-angular/src/app/core/domain/models/battle.model.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Add Creatures to Battle (Priority: P1) 🎯 MVP

**Goal**: Game Masters can add creatures (players and monsters) to battles with their combat statistics

**Independent Test**: Open a battle and add creatures with different attributes (name, type, HP, initiative, AC). Creatures should appear in roster with all attributes displayed correctly.

### Backend Tests for US1 - TDD ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T015 [P] [US1] **RED**: Write failing unit tests for Battle.addCreature() in `backend/src/test/kotlin/de/thomcz/pap/battle/backend/domain/model/BattleCreatureTest.kt`
- [ ] T016 [P] [US1] **RED**: Write failing service tests for BattleService.addCreature() in `backend/src/test/kotlin/de/thomcz/pap/battle/backend/application/service/BattleServiceCreatureTest.kt`
- [ ] T017 [P] [US1] **RED**: Write failing integration tests for POST /api/battles/{id}/creatures in `backend/src/test/kotlin/de/thomcz/pap/battle/backend/infrastructure/adapter/in/rest/BattleControllerCreatureTest.kt`

### Backend Implementation for US1

- [ ] T018 [US1] **GREEN**: Implement Battle.addCreature() method in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/model/Battle.kt`
- [ ] T019 [US1] **GREEN**: Implement Battle.applyEvent() for CreatureAdded event in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/model/Battle.kt`
- [ ] T020 [P] [US1] Create CreateCreatureRequest DTO in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/application/dto/CreateCreatureRequest.kt`
- [ ] T021 [P] [US1] Create CreatureResponse DTO in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/application/dto/CreatureResponse.kt`
- [ ] T022 [US1] **GREEN**: Implement BattleService.addCreature() method in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/application/service/BattleService.kt`
- [ ] T023 [US1] **GREEN**: Add POST /api/battles/{id}/creatures endpoint to BattleController in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/adapter/in/rest/BattleController.kt`
- [ ] T024 [US1] **REFACTOR**: Clean up code while keeping all US1 tests green

### Frontend Tests for US1 - TDD ⚠️

- [ ] T025 [P] [US1] **RED**: Write failing tests for AddCreatureUseCase in `frontend-angular/src/app/core/domain/use-cases/add-creature.use-case.spec.ts`
- [ ] T026 [P] [US1] **RED**: Write failing tests for creature-dialog component in `frontend-angular/src/app/features/battle/creature-dialog/creature-dialog.component.spec.ts`
- [ ] T027 [P] [US1] **RED**: Write failing tests for creature-list component in `frontend-angular/src/app/features/battle/creature-list/creature-list.component.spec.ts`

### Frontend Implementation for US1

- [ ] T028 [US1] Extend BattlePort interface with addCreature method in `frontend-angular/src/app/core/ports/battle.port.ts`
- [ ] T029 [US1] **GREEN**: Implement AddCreatureUseCase with signal-based state in `frontend-angular/src/app/core/domain/use-cases/add-creature.use-case.ts`
- [ ] T030 [US1] **GREEN**: Implement addCreature in BattleApiAdapter in `frontend-angular/src/app/adapters/api/battle-api.adapter.ts`
- [ ] T031 [P] [US1] **GREEN**: Create creature-dialog component (add form) in `frontend-angular/src/app/features/battle/creature-dialog/creature-dialog.component.ts`
- [ ] T032 [P] [US1] **GREEN**: Create creature-dialog template in `frontend-angular/src/app/features/battle/creature-dialog/creature-dialog.component.html`
- [ ] T033 [P] [US1] **GREEN**: Create creature-list component (roster display) in `frontend-angular/src/app/features/battle/creature-list/creature-list.component.ts`
- [ ] T034 [P] [US1] **GREEN**: Create creature-list template in `frontend-angular/src/app/features/battle/creature-list/creature-list.component.html`
- [ ] T035 [P] [US1] **GREEN**: Create creature-card component (individual creature) in `frontend-angular/src/app/features/battle/creature-card/creature-card.component.ts`
- [ ] T036 [P] [US1] **GREEN**: Create creature-card template in `frontend-angular/src/app/features/battle/creature-card/creature-card.component.html`
- [ ] T037 [US1] Integrate creature-list into battle-detail component in `frontend-angular/src/app/features/battle/battle-detail/battle-detail.component.ts`
- [ ] T038 [US1] **REFACTOR**: Clean up frontend code while keeping all US1 tests green

**Checkpoint**: At this point, users can add creatures to battles. Test independently before proceeding.

---

## Phase 4: User Story 2 - Edit Creature Attributes (Priority: P1)

**Goal**: Game Masters can edit creature attributes (name, HP, initiative, AC, type) during battle setup or mid-combat

**Independent Test**: Add creatures and then edit their various attributes. Changes should be immediately reflected in the roster.

### Backend Tests for US2 - TDD ⚠️

- [ ] T039 [P] [US2] **RED**: Write failing unit tests for Battle.updateCreature() in `backend/src/test/kotlin/de/thomcz/pap/battle/backend/domain/model/BattleCreatureTest.kt`
- [ ] T040 [P] [US2] **RED**: Write failing service tests for BattleService.updateCreature() in `backend/src/test/kotlin/de/thomcz/pap/battle/backend/application/service/BattleServiceCreatureTest.kt`
- [ ] T041 [P] [US2] **RED**: Write failing integration tests for PUT /api/battles/{id}/creatures/{creatureId} in `backend/src/test/kotlin/de/thomcz/pap/battle/backend/infrastructure/adapter/in/rest/BattleControllerCreatureTest.kt`

### Backend Implementation for US2

- [ ] T042 [US2] **GREEN**: Implement Battle.updateCreature() method in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/model/Battle.kt`
- [ ] T043 [US2] **GREEN**: Implement Battle.applyEvent() for CreatureUpdated event in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/model/Battle.kt`
- [ ] T044 [P] [US2] Create UpdateCreatureRequest DTO in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/application/dto/UpdateCreatureRequest.kt`
- [ ] T045 [US2] **GREEN**: Implement BattleService.updateCreature() method in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/application/service/BattleService.kt`
- [ ] T046 [US2] **GREEN**: Add PUT /api/battles/{id}/creatures/{creatureId} endpoint to BattleController in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/adapter/in/rest/BattleController.kt`
- [ ] T047 [US2] **REFACTOR**: Clean up code while keeping all US2 tests green

### Frontend Tests for US2 - TDD ⚠️

- [ ] T048 [P] [US2] **RED**: Write failing tests for UpdateCreatureUseCase in `frontend-angular/src/app/core/domain/use-cases/update-creature.use-case.spec.ts`
- [ ] T049 [P] [US2] **RED**: Write failing tests for edit mode in creature-dialog in `frontend-angular/src/app/features/battle/creature-dialog/creature-dialog.component.spec.ts`

### Frontend Implementation for US2

- [ ] T050 [US2] Extend BattlePort interface with updateCreature method in `frontend-angular/src/app/core/ports/battle.port.ts`
- [ ] T051 [US2] **GREEN**: Implement UpdateCreatureUseCase in `frontend-angular/src/app/core/domain/use-cases/update-creature.use-case.ts`
- [ ] T052 [US2] **GREEN**: Implement updateCreature in BattleApiAdapter in `frontend-angular/src/app/adapters/api/battle-api.adapter.ts`
- [ ] T053 [US2] **GREEN**: Add edit mode to creature-dialog component in `frontend-angular/src/app/features/battle/creature-dialog/creature-dialog.component.ts`
- [ ] T054 [US2] Add edit button to creature-card component in `frontend-angular/src/app/features/battle/creature-card/creature-card.component.html`
- [ ] T055 [US2] **REFACTOR**: Clean up frontend code while keeping all US2 tests green

**Checkpoint**: At this point, users can add AND edit creatures. Test both US1 and US2 independently.

---

## Phase 5: User Story 3 - Remove Creatures from Battle (Priority: P1)

**Goal**: Game Masters can remove creatures from the battle roster to correct mistakes or remove defeated/fled combatants

**Independent Test**: Add creatures and then remove them, verifying the roster updates correctly including turn order adjustments.

### Backend Tests for US3 - TDD ⚠️

- [ ] T056 [P] [US3] **RED**: Write failing unit tests for Battle.removeCreature() in `backend/src/test/kotlin/de/thomcz/pap/battle/backend/domain/model/BattleCreatureTest.kt`
- [ ] T057 [P] [US3] **RED**: Write failing service tests for BattleService.removeCreature() in `backend/src/test/kotlin/de/thomcz/pap/battle/backend/application/service/BattleServiceCreatureTest.kt`
- [ ] T058 [P] [US3] **RED**: Write failing integration tests for DELETE /api/battles/{id}/creatures/{creatureId} in `backend/src/test/kotlin/de/thomcz/pap/battle/backend/infrastructure/adapter/in/rest/BattleControllerCreatureTest.kt`

### Backend Implementation for US3

- [ ] T059 [US3] **GREEN**: Implement Battle.removeCreature() method in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/model/Battle.kt`
- [ ] T060 [US3] **GREEN**: Implement Battle.applyEvent() for CreatureRemoved event in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/model/Battle.kt`
- [ ] T061 [US3] **GREEN**: Implement BattleService.removeCreature() method in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/application/service/BattleService.kt`
- [ ] T062 [US3] **GREEN**: Add DELETE /api/battles/{id}/creatures/{creatureId} endpoint to BattleController in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/adapter/in/rest/BattleController.kt`
- [ ] T063 [US3] **REFACTOR**: Clean up code while keeping all US3 tests green

### Frontend Tests for US3 - TDD ⚠️

- [ ] T064 [P] [US3] **RED**: Write failing tests for RemoveCreatureUseCase in `frontend-angular/src/app/core/domain/use-cases/remove-creature.use-case.spec.ts`
- [ ] T065 [P] [US3] **RED**: Write failing tests for delete functionality in creature-card in `frontend-angular/src/app/features/battle/creature-card/creature-card.component.spec.ts`

### Frontend Implementation for US3

- [ ] T066 [US3] Extend BattlePort interface with removeCreature method in `frontend-angular/src/app/core/ports/battle.port.ts`
- [ ] T067 [US3] **GREEN**: Implement RemoveCreatureUseCase in `frontend-angular/src/app/core/domain/use-cases/remove-creature.use-case.ts`
- [ ] T068 [US3] **GREEN**: Implement removeCreature in BattleApiAdapter in `frontend-angular/src/app/adapters/api/battle-api.adapter.ts`
- [ ] T069 [US3] **GREEN**: Add delete button to creature-card component in `frontend-angular/src/app/features/battle/creature-card/creature-card.component.ts`
- [ ] T070 [US3] **REFACTOR**: Clean up frontend code while keeping all US3 tests green

**Checkpoint**: At this point, full CRUD operations for creatures are working. Test all three stories independently.

---

## Phase 6: User Story 4 - Initiative-Based Sorting (Priority: P2)

**Goal**: When combat starts, creatures are automatically sorted by initiative (highest first) to determine turn order

**Independent Test**: Add creatures with different initiative values, start combat, and verify they're displayed in descending initiative order.

### Backend Tests for US4 - TDD ⚠️

- [ ] T071 [P] [US4] **RED**: Write failing unit tests for Battle.sortCreaturesByInitiative() in `backend/src/test/kotlin/de/thomcz/pap/battle/backend/domain/model/BattleCreatureTest.kt`
- [ ] T072 [P] [US4] **RED**: Write failing tests for initiative sorting in CombatStarted event application in `backend/src/test/kotlin/de/thomcz/pap/battle/backend/domain/model/BattleCreatureTest.kt`
- [ ] T073 [P] [US4] **RED**: Write failing tests for re-sorting when initiative changes mid-combat in `backend/src/test/kotlin/de/thomcz/pap/battle/backend/domain/model/BattleCreatureTest.kt`

### Backend Implementation for US4

- [ ] T074 [US4] **GREEN**: Implement Battle.sortCreaturesByInitiative() with stable sort in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/model/Battle.kt`
- [ ] T075 [US4] **GREEN**: Modify Battle.startCombat() to sort creatures by initiative in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/model/Battle.kt`
- [ ] T076 [US4] **GREEN**: Add initiative re-sort logic to Battle.updateCreature() when initiative changes during combat in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/model/Battle.kt`
- [ ] T077 [US4] **REFACTOR**: Clean up code while keeping all US4 tests green

### Frontend Tests for US4 - TDD ⚠️

- [ ] T078 [P] [US4] **RED**: Write failing tests for initiative sorting in creature-list component in `frontend-angular/src/app/features/battle/creature-list/creature-list.component.spec.ts`

### Frontend Implementation for US4

- [ ] T079 [US4] **GREEN**: Add computed signal for initiative-sorted creatures in AddCreatureUseCase in `frontend-angular/src/app/core/domain/use-cases/add-creature.use-case.ts`
- [ ] T080 [US4] **GREEN**: Update creature-list component to display sorted order when combat is active in `frontend-angular/src/app/features/battle/creature-list/creature-list.component.ts`
- [ ] T081 [US4] **REFACTOR**: Clean up frontend code while keeping all US4 tests green

**Checkpoint**: At this point, initiative-based sorting works. Test all four stories independently.

---

## Phase 7: User Story 5 - Monster Auto-Removal on Combat End (Priority: P2)

**Goal**: When combat ends, monster creatures are automatically removed while player creatures remain

**Independent Test**: Create battle with players and monsters, end combat, verify only players remain in roster.

### Backend Tests for US5 - TDD ⚠️

- [ ] T082 [P] [US5] **RED**: Write failing unit tests for Battle.endCombat() monster removal in `backend/src/test/kotlin/de/thomcz/pap/battle/backend/domain/model/BattleCreatureTest.kt`
- [ ] T083 [P] [US5] **RED**: Write failing tests for CombatEnded event with removedMonsterIds in `backend/src/test/kotlin/de/thomcz/pap/battle/backend/domain/model/BattleCreatureTest.kt`
- [ ] T084 [P] [US5] **RED**: Write failing integration tests for monster removal after combat end in `backend/src/test/kotlin/de/thomcz/pap/battle/backend/infrastructure/adapter/in/rest/BattleControllerCreatureTest.kt`

### Backend Implementation for US5

- [ ] T085 [US5] **GREEN**: Modify Battle.endCombat() to identify and record monster IDs in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/model/Battle.kt`
- [ ] T086 [US5] **GREEN**: Modify Battle.applyEvent() for CombatEnded to remove creatures by ID in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/model/Battle.kt`
- [ ] T087 [US5] **REFACTOR**: Clean up code while keeping all US5 tests green

### Frontend Tests for US5 - TDD ⚠️

- [ ] T088 [P] [US5] **RED**: Write failing tests for monster removal on combat end in creature-list component in `frontend-angular/src/app/features/battle/creature-list/creature-list.component.spec.ts`

### Frontend Implementation for US5

- [ ] T089 [US5] **GREEN**: Update creature list signal when combat ends (reactive removal) in AddCreatureUseCase in `frontend-angular/src/app/core/domain/use-cases/add-creature.use-case.ts`
- [ ] T090 [US5] **REFACTOR**: Clean up frontend code while keeping all US5 tests green

**Checkpoint**: All user stories complete! Test each story independently to verify no regressions.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T091 [P] Add JSDoc/KDoc documentation to all public APIs
- [ ] T092 [P] Add validation error messages to all DTOs and domain objects
- [ ] T093 [P] Add logging for all creature operations (add/update/remove)
- [ ] T094 Run full test suite and verify all tests pass: `./gradlew test` and `npm test`
- [ ] T095 Verify code formatting: `./gradlew ktlintCheck` and `npm run lint`
- [ ] T096 Test all user stories end-to-end following quickstart.md manual testing flow
- [ ] T097 [P] Performance testing: Verify initiative sorting <10ms for 20 creatures
- [ ] T098 [P] Performance testing: Verify event replay <1s for 100 events
- [ ] T099 Review constitution compliance checklist (hexagonal architecture, TDD coverage, performance targets)
- [ ] T100 Update CLAUDE.md files with new creature management patterns if needed

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-7)**: All depend on Foundational phase completion
  - US1 (Add Creatures): Can start after Foundational - No dependencies on other stories
  - US2 (Edit Creatures): Can start after Foundational - Reuses US1 components (dialog) but independently testable
  - US3 (Remove Creatures): Can start after Foundational - Independent from US1/US2
  - US4 (Initiative Sorting): Can start after Foundational - Works with creatures from any story
  - US5 (Monster Removal): Can start after Foundational - Works with creatures from any story
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1) - Add Creatures**: Can start after Foundational (Phase 2) - **No dependencies on other stories**
- **User Story 2 (P1) - Edit Creatures**: Can start after Foundational (Phase 2) - Reuses creature-dialog from US1 but testable without US1
- **User Story 3 (P1) - Remove Creatures**: Can start after Foundational (Phase 2) - **No dependencies on other stories**
- **User Story 4 (P2) - Initiative Sorting**: Can start after Foundational (Phase 2) - Works with any creature source
- **User Story 5 (P2) - Monster Removal**: Can start after Foundational (Phase 2) - Works with any creature source

### Within Each User Story (TDD Workflow)

1. **RED**: Write failing tests FIRST
2. **GREEN**: Implement minimum code to pass tests
3. **REFACTOR**: Clean up while keeping tests green
4. Tests MUST fail before implementation (constitution requirement)
5. Domain tests before service tests before integration tests
6. Backend implementation before frontend (API contract must exist)
7. Frontend tests before frontend implementation
8. Story complete and all tests green before moving to next priority

### Parallel Opportunities

**Within Foundational Phase**:
- T005 (Creature tests), T009-T011 (Event classes), T013 (Frontend models) can all run in parallel

**Within Each User Story**:
- All **RED** test tasks marked [P] can run in parallel
- All model creation tasks marked [P] can run in parallel
- All DTO creation tasks marked [P] can run in parallel
- All frontend component creation tasks marked [P] can run in parallel

**Across User Stories** (if team capacity allows):
- After Foundational complete, US1, US2, US3 can start in parallel (P1 priority)
- US4 and US5 can start in parallel after Foundational (P2 priority)
- Different developers can work on different stories simultaneously

---

## Parallel Example: User Story 1

```bash
# Phase 1: Launch all RED tests for User Story 1 together (TDD):
Task T015: "Write failing unit tests for Battle.addCreature()"
Task T016: "Write failing service tests for BattleService.addCreature()"
Task T017: "Write failing integration tests for POST /api/battles/{id}/creatures"

# Phase 2: After tests fail, launch all DTO creation tasks together:
Task T020: "Create CreateCreatureRequest DTO"
Task T021: "Create CreatureResponse DTO"

# Phase 3: After backend GREEN, launch all frontend RED tests together:
Task T025: "Write failing tests for AddCreatureUseCase"
Task T026: "Write failing tests for creature-dialog component"
Task T027: "Write failing tests for creature-list component"

# Phase 4: After frontend tests fail, launch all component creation together:
Task T031: "Create creature-dialog component"
Task T033: "Create creature-list component"
Task T035: "Create creature-card component"
```

---

## Implementation Strategy

### MVP First (User Stories 1-3 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Add Creatures)
4. **STOP and VALIDATE**: Test US1 independently - can add creatures to battles
5. Complete Phase 4: User Story 2 (Edit Creatures)
6. **STOP and VALIDATE**: Test US1+US2 independently - can add AND edit
7. Complete Phase 5: User Story 3 (Remove Creatures)
8. **STOP and VALIDATE**: Test US1+US2+US3 independently - **FULL CRUD WORKS!**
9. Deploy/demo MVP (creature management CRUD complete)

**Why Stop Here**: Stories 1-3 (all P1) provide complete creature management CRUD. Stories 4-5 are enhancements (P2).

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → ✅ Can add creatures
3. Add User Story 2 → Test independently → ✅ Can add + edit creatures
4. Add User Story 3 → Test independently → ✅ Full CRUD (MVP!)
5. Add User Story 4 → Test independently → ✅ Auto-sorting on combat start
6. Add User Story 5 → Test independently → ✅ Auto-cleanup on combat end
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers after Foundational phase completes:

**Option 1: Parallel by Story (Recommended)**:
- Developer A: User Story 1 (Add)
- Developer B: User Story 2 (Edit)
- Developer C: User Story 3 (Remove)
- Stories integrate via shared Creature entity and Battle aggregate

**Option 2: Parallel by Layer**:
- Backend Dev: US1 backend → US2 backend → US3 backend
- Frontend Dev: US1 frontend → US2 frontend → US3 frontend
- Stories complete incrementally as frontend catches up

**Option 3: Full Stack Pairing**:
- Pair 1: US1 (backend + frontend)
- Pair 2: US2 (backend + frontend)
- Each pair delivers complete vertical slice

---

## Test Coverage Targets (Constitution Requirements)

Per constitution, TDD is MANDATORY with these coverage targets:

- **Domain Logic (Battle.kt, Creature.kt)**: 100% coverage required
- **Application Services (BattleService.kt)**: ≥90% coverage required
- **Infrastructure (BattleController.kt, adapters)**: ≥80% coverage required
- **Frontend Use Cases**: ≥90% coverage required

**Verification**:
- Backend: Run `./gradlew test jacocoTestReport` and check `build/reports/jacoco/test/html/index.html`
- Frontend: Run `npm test -- --coverage` and check coverage report

---

## Notes

- **[P] tasks**: Different files, no dependencies - can run in parallel
- **[Story] label**: Maps task to specific user story for traceability
- **TDD Required**: All tests marked **RED** must be written first and FAIL before **GREEN** implementation
- **Each user story**: Should be independently completable and testable
- **RED-GREEN-REFACTOR**: Follow TDD cycle strictly (constitution requirement)
- **Commit strategy**: Commit after each task or logical TDD cycle (RED → GREEN → REFACTOR)
- **Stop at checkpoints**: Validate each story independently before proceeding
- **Coverage validation**: Run coverage reports after each story to ensure constitution targets met
- **Avoid**: Vague tasks, same file conflicts, cross-story dependencies that break independence, skipping tests

---

## Task Summary

**Total Tasks**: 100

**By Phase**:
- Phase 1 (Setup): 4 tasks
- Phase 2 (Foundational): 10 tasks
- Phase 3 (US1 - Add): 24 tasks
- Phase 4 (US2 - Edit): 17 tasks
- Phase 5 (US3 - Remove): 15 tasks
- Phase 6 (US4 - Sorting): 11 tasks
- Phase 7 (US5 - Auto-Removal): 9 tasks
- Phase 8 (Polish): 10 tasks

**By User Story**:
- US1 (Add Creatures): 24 tasks (12 backend, 12 frontend)
- US2 (Edit Creatures): 17 tasks (8 backend, 9 frontend)
- US3 (Remove Creatures): 15 tasks (8 backend, 7 frontend)
- US4 (Initiative Sorting): 11 tasks (7 backend, 4 frontend)
- US5 (Monster Removal): 9 tasks (6 backend, 3 frontend)

**Parallel Opportunities**:
- 27 tasks marked [P] can run in parallel within their phase
- 5 user stories can run in parallel after Foundational phase (if team capacity)
- Estimated sequential time: ~80-100 hours
- Estimated parallel time (3 devs): ~30-40 hours

**MVP Scope (Recommended)**: Phases 1-5 (Setup + Foundational + US1-3) = 70 tasks for full CRUD
**Full Feature**: All 100 tasks including initiative sorting and auto-removal
