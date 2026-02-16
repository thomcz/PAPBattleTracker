# Tasks: Battle Tracker Core Features

**Input**: Design documents from `/specs/001-battle-tracker-features/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Tests**: Integration tests are included (per research.md: integration tests prioritized over mocks)

## Format: `- [ ] [ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Exact file paths included in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure for event sourcing architecture

- [ ] T001 Create event sourcing directory structure: backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/model/events/
- [ ] T002 [P] Create Battle aggregate directory structure: backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/model/
- [ ] T003 [P] Create battle ports directory structure: backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/port/in/ and domain/port/out/
- [ ] T004 [P] Create battle application service directory: backend/src/main/kotlin/de/thomcz/pap/battle/backend/application/service/
- [ ] T005 [P] Create battle REST adapter directory: backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/adapter/in/rest/
- [ ] T006 [P] Create battle persistence adapter directory: backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/adapter/out/persistence/
- [ ] T007 [P] Create integration test directories: backend/src/test/kotlin/de/thomcz/pap/battle/backend/integration/
- [ ] T008 [P] Create Angular battle feature directory structure: frontend-angular/src/app/features/battle/
- [ ] T009 [P] Create Angular battle domain models directory: frontend-angular/src/app/core/domain/models/
- [ ] T010 [P] Create Angular battle adapters directory: frontend-angular/src/app/adapters/api/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Backend Foundation

- [ ] T011 Define base BattleEvent interface in backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/model/events/BattleEvent.kt
- [ ] T012 [P] Define CombatStatus enum in backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/model/CombatStatus.kt
- [ ] T013 [P] Define CreatureType enum in backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/model/CreatureType.kt
- [ ] T014 Create EventStore port interface in backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/port/out/EventStore.kt
- [ ] T015 Create BattleRepository port interface in backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/port/out/BattleRepository.kt
- [ ] T016 Create EventEntity JPA entity in backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/adapter/out/persistence/entity/EventEntity.kt
- [ ] T017 Create BattleEntity JPA entity in backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/adapter/out/persistence/entity/BattleEntity.kt
- [ ] T018 Create EventEntityRepository interface extending JpaRepository in backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/adapter/out/persistence/EventEntityRepository.kt
- [ ] T019 Implement H2EventStore adapter in backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/adapter/out/persistence/H2EventStore.kt
- [ ] T020 Implement JpaBattleRepository adapter in backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/adapter/out/persistence/JpaBattleRepository.kt
- [ ] T021 Create BattleMapper utility for entity/domain conversions in backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/adapter/out/persistence/mapper/BattleMapper.kt
- [ ] T022 Create integration test base class with Spring Boot Test configuration in backend/src/test/kotlin/de/thomcz/pap/battle/backend/integration/BaseIntegrationTest.kt

### Frontend Foundation

- [ ] T023 [P] Create Battle domain model in frontend-angular/src/app/core/domain/models/battle.model.ts
- [ ] T024 [P] Create Creature domain model in frontend-angular/src/app/core/domain/models/creature.model.ts
- [ ] T025 [P] Create CombatLog domain model in frontend-angular/src/app/core/domain/models/combat-log.model.ts
- [ ] T026 [P] Define BattlePort interface in frontend-angular/src/app/core/ports/battle.port.ts
- [ ] T027 [P] Create BattleApiAdapter implementing BattlePort in frontend-angular/src/app/adapters/api/battle-api.adapter.ts
- [ ] T028 Configure Angular Testing Library in frontend-angular/package.json and test setup files

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Battle Session Management (Priority: P1) 🎯 MVP

**Goal**: Enable Game Masters to create, start, pause, resume, and end battle sessions with proper state management

**Independent Test**: Can be fully tested by creating a new battle, starting combat (with at least one creature), pausing, resuming, and ending combat. Verifies basic combat lifecycle without requiring complex creature interactions or HP tracking.

### Backend Tests for User Story 1

> **NOTE: Write these tests FIRST using TDD - ensure they FAIL before implementation**

- [ ] T029 [P] [US1] Write integration test for POST /api/battles (create battle) in backend/src/test/kotlin/de/thomcz/pap/battle/backend/integration/BattleCreationIntegrationTest.kt
- [ ] T030 [P] [US1] Write integration test for GET /api/battles (list battles) in backend/src/test/kotlin/de/thomcz/pap/battle/backend/integration/BattleListIntegrationTest.kt
- [ ] T031 [P] [US1] Write integration test for GET /api/battles/{id} (get battle detail) in backend/src/test/kotlin/de/thomcz/pap/battle/backend/integration/BattleDetailIntegrationTest.kt
- [ ] T032 [P] [US1] Write integration test for POST /api/battles/{id}/start (start combat) in backend/src/test/kotlin/de/thomcz/pap/battle/backend/integration/StartCombatIntegrationTest.kt
- [ ] T033 [P] [US1] Write integration test for POST /api/battles/{id}/pause (pause combat) in backend/src/test/kotlin/de/thomcz/pap/battle/backend/integration/PauseCombatIntegrationTest.kt
- [ ] T034 [P] [US1] Write integration test for POST /api/battles/{id}/resume (resume combat) in backend/src/test/kotlin/de/thomcz/pap/battle/backend/integration/ResumeCombatIntegrationTest.kt
- [ ] T035 [P] [US1] Write integration test for POST /api/battles/{id}/end (end combat) in backend/src/test/kotlin/de/thomcz/pap/battle/backend/integration/EndCombatIntegrationTest.kt
- [ ] T036 [P] [US1] Write integration test for event sourcing replay in backend/src/test/kotlin/de/thomcz/pap/battle/backend/integration/EventSourcingReplayTest.kt

### Backend Domain Implementation for User Story 1

- [ ] T037 [P] [US1] Define BattleCreated event in backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/model/events/BattleCreated.kt
- [ ] T038 [P] [US1] Define CombatStarted event in backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/model/events/CombatStarted.kt
- [ ] T039 [P] [US1] Define CombatPaused event in backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/model/events/CombatPaused.kt
- [ ] T040 [P] [US1] Define CombatResumed event in backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/model/events/CombatResumed.kt
- [ ] T041 [P] [US1] Define CombatEnded event in backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/model/events/CombatEnded.kt
- [ ] T042 [US1] Create Battle aggregate root with event application logic in backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/model/Battle.kt
- [ ] T043 [US1] Implement Battle.create() factory method to emit BattleCreated event
- [ ] T044 [US1] Implement Battle.startCombat() method to emit CombatStarted event with validation
- [ ] T045 [US1] Implement Battle.pauseCombat() method to emit CombatPaused event with state validation
- [ ] T046 [US1] Implement Battle.resumeCombat() method to emit CombatResumed event with state validation
- [ ] T047 [US1] Implement Battle.endCombat() method to emit CombatEnded event with cleanup logic
- [ ] T048 [US1] Implement event replay logic in Battle.loadFromHistory() method

### Backend Application Layer for User Story 1

- [ ] T049 [P] [US1] Define CreateBattleUseCase port interface in backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/port/in/CreateBattleUseCase.kt
- [ ] T050 [P] [US1] Define GetBattleUseCase port interface in backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/port/in/GetBattleUseCase.kt
- [ ] T051 [P] [US1] Define ListBattlesUseCase port interface in backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/port/in/ListBattlesUseCase.kt
- [ ] T052 [P] [US1] Define StartCombatUseCase port interface in backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/port/in/StartCombatUseCase.kt
- [ ] T053 [P] [US1] Define PauseCombatUseCase port interface in backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/port/in/PauseCombatUseCase.kt
- [ ] T054 [P] [US1] Define ResumeCombatUseCase port interface in backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/port/in/ResumeCombatUseCase.kt
- [ ] T055 [P] [US1] Define EndCombatUseCase port interface in backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/port/in/EndCombatUseCase.kt
- [ ] T056 [P] [US1] Create CreateBattleCommand DTO in backend/src/main/kotlin/de/thomcz/pap/battle/backend/application/dto/CreateBattleCommand.kt
- [ ] T057 [P] [US1] Create EndCombatCommand DTO in backend/src/main/kotlin/de/thomcz/pap/battle/backend/application/dto/EndCombatCommand.kt
- [ ] T058 [P] [US1] Create BattleResponse DTO in backend/src/main/kotlin/de/thomcz/pap/battle/backend/application/dto/BattleResponse.kt
- [ ] T059 [P] [US1] Create BattleDetailResponse DTO in backend/src/main/kotlin/de/thomcz/pap/battle/backend/application/dto/BattleDetailResponse.kt
- [ ] T060 [US1] Implement BattleService with all use cases in backend/src/main/kotlin/de/thomcz/pap/battle/backend/application/service/BattleService.kt
- [ ] T061 [US1] Add transaction management and error handling to BattleService

### Backend REST API for User Story 1

- [ ] T062 [US1] Implement BattleController POST /api/battles endpoint in backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/adapter/in/rest/BattleController.kt
- [ ] T063 [US1] Implement BattleController GET /api/battles endpoint with pagination and filtering
- [ ] T064 [US1] Implement BattleController GET /api/battles/{id} endpoint
- [ ] T065 [US1] Implement BattleController POST /api/battles/{id}/start endpoint
- [ ] T066 [US1] Implement BattleController POST /api/battles/{id}/pause endpoint
- [ ] T067 [US1] Implement BattleController POST /api/battles/{id}/resume endpoint
- [ ] T068 [US1] Implement BattleController POST /api/battles/{id}/end endpoint
- [ ] T069 [US1] Add OpenAPI annotations to BattleController matching contracts/battles-api.yaml
- [ ] T070 [US1] Add authorization checks to ensure users can only access their own battles

### Frontend Tests for User Story 1

> **NOTE: Write these tests FIRST using Angular Testing Library - ensure they FAIL before implementation**

- [ ] T071 [P] [US1] Write component test for BattleListComponent in frontend-angular/src/app/features/battle/pages/battle-list/battle-list.component.spec.ts
- [ ] T072 [P] [US1] Write component test for CreateBattleDialogComponent in frontend-angular/src/app/features/battle/components/create-battle-dialog/create-battle-dialog.component.spec.ts
- [ ] T073 [P] [US1] Write component test for BattleDetailComponent in frontend-angular/src/app/features/battle/pages/battle-detail/battle-detail.component.spec.ts
- [ ] T074 [P] [US1] Write component test for CombatControlsComponent in frontend-angular/src/app/features/battle/components/combat-controls/combat-controls.component.spec.ts

### Frontend Implementation for User Story 1

- [X] T075 [P] [US1] Create BattleListComponent in frontend-angular/src/app/features/battle/pages/battle-list/battle-list.component.ts
- [X] T076 [P] [US1] Create BattleListComponent template with Angular Material table in frontend-angular/src/app/features/battle/pages/battle-list/battle-list.component.html
- [X] T077 [P] [US1] Create CreateBattleDialogComponent in frontend-angular/src/app/features/battle/components/create-battle-dialog/create-battle-dialog.component.ts
- [X] T078 [P] [US1] Create CreateBattleDialogComponent template with form in frontend-angular/src/app/features/battle/components/create-battle-dialog/create-battle-dialog.component.html
- [X] T079 [P] [US1] Create BattleDetailComponent in frontend-angular/src/app/features/battle/pages/battle-detail/battle-detail.component.ts
- [X] T080 [P] [US1] Create BattleDetailComponent template in frontend-angular/src/app/features/battle/pages/battle-detail/battle-detail.component.html
- [X] T081 [P] [US1] Create CombatControlsComponent in frontend-angular/src/app/features/battle/components/combat-controls/combat-controls.component.ts
- [X] T082 [P] [US1] Create CombatControlsComponent template with start/pause/resume/end buttons in frontend-angular/src/app/features/battle/components/combat-controls/combat-controls.component.html
- [X] T083 [US1] Implement signal-based battle state management in BattleDetailComponent
- [X] T084 [US1] Implement BattleApiAdapter methods: createBattle(), listBattles(), getBattle(), startCombat(), pauseCombat(), resumeCombat(), endCombat()
- [X] T085 [US1] Add reactive state updates using signals and toSignal() for API responses
- [X] T086 [US1] Add loading states and error handling to all battle components
- [X] T087 [US1] Create battle routing module in frontend-angular/src/app/features/battle/battle-routing.module.ts
- [X] T088 [US1] Add navigation from battle list to battle detail pages

### User Story 1 Integration & Validation

- [ ] T089 [US1] Run all integration tests to verify battle lifecycle works end-to-end
- [ ] T090 [US1] Verify event sourcing replay correctly reconstructs battle state
- [ ] T091 [US1] Manual test: Create battle → Start combat → Pause → Resume → End
- [ ] T092 [US1] Verify battle state persists correctly in H2 database across application restarts
- [ ] T093 [US1] Verify Angular components correctly display battle status changes

**Checkpoint**: User Story 1 is fully functional. Game Masters can create battles and manage combat lifecycle. Ready for independent testing and demo.

---

## Phase 4: User Story 2 - Creature Management (Priority: P1) 🎯 MVP

**Goal**: Enable Game Masters to add, edit, and remove creatures (players and monsters) in battles

**Independent Test**: Can be fully tested by adding creatures with different attributes, editing them, removing them, and verifying initiative-based sorting when combat starts.

### Backend Tests for User Story 2

- [ ] T094 [P] [US2] Write integration test for POST /api/battles/{id}/creatures (add creature) in backend/src/test/kotlin/de/thomcz/pap/battle/backend/integration/AddCreatureIntegrationTest.kt
- [ ] T095 [P] [US2] Write integration test for PUT /api/battles/{id}/creatures/{creatureId} (update creature) in backend/src/test/kotlin/de/thomcz/pap/battle/backend/integration/UpdateCreatureIntegrationTest.kt
- [ ] T096 [P] [US2] Write integration test for DELETE /api/battles/{id}/creatures/{creatureId} (remove creature) in backend/src/test/kotlin/de/thomcz/pap/battle/backend/integration/RemoveCreatureIntegrationTest.kt
- [ ] T097 [P] [US2] Write integration test for initiative sorting when combat starts in backend/src/test/kotlin/de/thomcz/pap/battle/backend/integration/InitiativeSortingTest.kt

### Backend Domain Implementation for User Story 2

- [ ] T098 [P] [US2] Define CreatureAdded event in backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/model/events/CreatureAdded.kt
- [ ] T099 [P] [US2] Define CreatureUpdated event in backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/model/events/CreatureUpdated.kt
- [ ] T100 [P] [US2] Define CreatureRemoved event in backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/model/events/CreatureRemoved.kt
- [ ] T101 [US2] Create Creature entity in backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/model/Creature.kt
- [ ] T102 [US2] Implement Battle.addCreature() method to emit CreatureAdded event with validation
- [ ] T103 [US2] Implement Battle.updateCreature() method to emit CreatureUpdated event
- [ ] T104 [US2] Implement Battle.removeCreature() method to emit CreatureRemoved event
- [ ] T105 [US2] Implement initiative sorting logic in Battle.startCombat() method
- [ ] T106 [US2] Add event application logic for creature events in Battle aggregate

### Backend Application Layer for User Story 2

- [ ] T107 [P] [US2] Define AddCreatureUseCase port in backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/port/in/AddCreatureUseCase.kt
- [ ] T108 [P] [US2] Define UpdateCreatureUseCase port in backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/port/in/UpdateCreatureUseCase.kt
- [ ] T109 [P] [US2] Define RemoveCreatureUseCase port in backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/port/in/RemoveCreatureUseCase.kt
- [ ] T110 [P] [US2] Create AddCreatureCommand DTO in backend/src/main/kotlin/de/thomcz/pap/battle/backend/application/dto/AddCreatureCommand.kt
- [ ] T111 [P] [US2] Create UpdateCreatureCommand DTO in backend/src/main/kotlin/de/thomcz/pap/battle/backend/application/dto/UpdateCreatureCommand.kt
- [ ] T112 [P] [US2] Create CreatureResponse DTO in backend/src/main/kotlin/de/thomcz/pap/battle/backend/application/dto/CreatureResponse.kt
- [ ] T113 [US2] Implement CreatureService with all use cases in backend/src/main/kotlin/de/thomcz/pap/battle/backend/application/service/CreatureService.kt

### Backend REST API for User Story 2

- [ ] T114 [US2] Create CreatureController with POST /api/battles/{id}/creatures in backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/adapter/in/rest/CreatureController.kt
- [ ] T115 [US2] Implement PUT /api/battles/{id}/creatures/{creatureId} endpoint
- [ ] T116 [US2] Implement DELETE /api/battles/{id}/creatures/{creatureId} endpoint
- [ ] T117 [US2] Add OpenAPI annotations matching contracts/creatures-api.yaml

### Frontend Tests for User Story 2

- [ ] T118 [P] [US2] Write component test for CreatureCardComponent in frontend-angular/src/app/features/battle/components/creature-card/creature-card.component.spec.ts
- [ ] T119 [P] [US2] Write component test for AddCreatureFormComponent in frontend-angular/src/app/features/battle/components/add-creature-form/add-creature-form.component.spec.ts

### Frontend Implementation for User Story 2

- [ ] T120 [P] [US2] Create CreatureCardComponent in frontend-angular/src/app/features/battle/components/creature-card/creature-card.component.ts
- [ ] T121 [P] [US2] Create CreatureCardComponent template in frontend-angular/src/app/features/battle/components/creature-card/creature-card.component.html
- [ ] T122 [P] [US2] Create AddCreatureFormComponent in frontend-angular/src/app/features/battle/components/add-creature-form/add-creature-form.component.ts
- [ ] T123 [P] [US2] Create AddCreatureFormComponent template in frontend-angular/src/app/features/battle/components/add-creature-form/add-creature-form.component.html
- [ ] T124 [US2] Implement CreatureApiAdapter methods in frontend-angular/src/app/adapters/api/creature-api.adapter.ts
- [ ] T125 [US2] Add creature list display to BattleDetailComponent showing initiative order
- [ ] T126 [US2] Implement form validation for creature attributes (HP, initiative, AC ranges)

**Checkpoint**: User Story 2 complete. Creatures can be managed independently, with proper validation and initiative sorting.

---

## Phase 5: User Story 3 - Hit Point Tracking (Priority: P2)

**Goal**: Enable HP tracking during combat with damage, healing, and defeated status management

**Independent Test**: Can be fully tested by adding creatures, starting combat, applying damage/healing, and verifying HP calculations and defeated status.

### Backend Tests for User Story 3

- [ ] T127 [P] [US3] Write integration test for POST /api/battles/{id}/creatures/{creatureId}/damage in backend/src/test/kotlin/de/thomcz/pap/battle/backend/integration/ApplyDamageIntegrationTest.kt
- [ ] T128 [P] [US3] Write integration test for POST /api/battles/{id}/creatures/{creatureId}/heal in backend/src/test/kotlin/de/thomcz/pap/battle/backend/integration/ApplyHealingIntegrationTest.kt

### Backend Domain Implementation for User Story 3

- [ ] T129 [P] [US3] Define DamageApplied event in backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/model/events/DamageApplied.kt
- [ ] T130 [P] [US3] Define HealingApplied event in backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/model/events/HealingApplied.kt
- [ ] T131 [US3] Implement Battle.applyDamage() method with validation and defeated status logic
- [ ] T132 [US3] Implement Battle.applyHealing() method with max HP cap logic

### Backend Application & REST API for User Story 3

- [ ] T133 [P] [US3] Define ApplyDamageUseCase port in backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/port/in/ApplyDamageUseCase.kt
- [ ] T134 [P] [US3] Define ApplyHealingUseCase port in backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/port/in/ApplyHealingUseCase.kt
- [ ] T135 [US3] Implement CombatService for damage/healing use cases in backend/src/main/kotlin/de/thomcz/pap/battle/backend/application/service/CombatService.kt
- [ ] T136 [US3] Add damage and healing endpoints to CreatureController

### Frontend Implementation for User Story 3

- [ ] T137 [P] [US3] Write component test for HPTrackerComponent in frontend-angular/src/app/features/battle/components/hp-tracker/hp-tracker.component.spec.ts
- [ ] T138 [US3] Create HPTrackerComponent in frontend-angular/src/app/features/battle/components/hp-tracker/hp-tracker.component.ts
- [ ] T139 [US3] Implement damage/healing form controls and API calls in CreatureCardComponent

**Checkpoint**: User Story 3 complete. HP tracking functional with proper calculation and defeated status.

---

## Phase 6: User Story 4 - Turn Order and Round Tracking (Priority: P2)

**Goal**: Automate turn order management and round counting during combat

**Independent Test**: Start combat with multiple creatures and verify turn advances sequentially, round increments after last creature.

### Implementation for User Story 4

- [ ] T140 [P] [US4] Define TurnAdvanced event in backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/model/events/TurnAdvanced.kt
- [ ] T141 [US4] Implement Battle.advanceTurn() method with round increment logic
- [ ] T142 [US4] Add POST /api/battles/{id}/next-turn endpoint to BattleController
- [ ] T143 [US4] Create turn indicator component in frontend showing current creature's turn
- [ ] T144 [US4] Add "Next Turn" button to CombatControlsComponent

**Checkpoint**: User Story 4 complete. Turn tracking automated with visual indicators.

---

## Phase 7: User Story 5 - Combat Log (Priority: P3)

**Goal**: Maintain chronological log of all combat actions

**Independent Test**: Perform combat actions and verify they appear in log with timestamps and round numbers.

### Implementation for User Story 5

- [ ] T145 [US5] Create LogEntry entity in backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/model/LogEntry.kt
- [ ] T146 [US5] Add log entry creation logic to all combat action methods in Battle aggregate
- [ ] T147 [US5] Create CombatLogComponent in frontend-angular/src/app/features/battle/components/combat-log/combat-log.component.ts
- [ ] T148 [US5] Display combat log entries in chronological order with filtering

**Checkpoint**: User Story 5 complete. Full combat history available for review.

---

## Phase 8: User Story 6 - Battle State Persistence (Priority: P3)

**Goal**: Automatic battle state saving and restore capability, plus import/export

**Independent Test**: Create battle, close browser, reopen and verify state restored. Export battle to JSON and import to verify data integrity.

### Implementation for User Story 6

- [ ] T149 [US6] Implement GET /api/battles/{id}/export endpoint in BattleController
- [ ] T150 [US6] Implement POST /api/battles/import endpoint with validation
- [ ] T151 [US6] Create LocalStorageAdapter in frontend for offline persistence
- [ ] T152 [US6] Add export/import buttons to BattleDetailComponent
- [ ] T153 [US6] Implement automatic state synchronization between localStorage and backend

**Checkpoint**: User Story 6 complete. Battle state protected against data loss.

---

## Phase 9: User Story 7 - Status Effects Tracking (Priority: P4)

**Goal**: Track status effects on creatures during combat

**Independent Test**: Add effects to creatures, verify they display and can be removed, verify they clear when combat ends.

### Implementation for User Story 7

- [ ] T154 [P] [US7] Define StatusEffectAdded event in backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/model/events/StatusEffectAdded.kt
- [ ] T155 [P] [US7] Define StatusEffectRemoved event in backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/model/events/StatusEffectRemoved.kt
- [ ] T156 [US7] Implement Battle.addStatusEffect() and Battle.removeStatusEffect() methods
- [ ] T157 [US7] Add status effect endpoints to CreatureController
- [ ] T158 [US7] Create StatusEffectsComponent in frontend-angular/src/app/features/battle/components/status-effects/status-effects.component.ts

**Checkpoint**: User Story 7 complete. Full status effect management available.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements affecting multiple user stories

- [ ] T159 [P] Add comprehensive API documentation using SpringDoc OpenAPI in backend
- [ ] T160 [P] Implement performance optimization: snapshot creation at 1000 events
- [ ] T161 [P] Add comprehensive error handling and user-friendly error messages across all endpoints
- [ ] T162 [P] Add accessibility features (WCAG 2.1 AA compliance) to all Angular components
- [ ] T163 [P] Implement responsive design for mobile devices (320px to 1920px)
- [ ] T164 [P] Add loading indicators and optimistic UI updates to all forms
- [ ] T165 [P] Create end-to-end Cypress tests for critical user journeys
- [ ] T166 [P] Performance testing: verify p95 latency ≤300ms for all endpoints
- [ ] T167 [P] Performance testing: verify event replay <5s for 10,000 events
- [ ] T168 [P] Security audit: verify JWT validation and authorization checks
- [ ] T169 [P] Code quality: run linting and fix all warnings
- [ ] T170 Run quickstart.md validation with fresh developer setup
- [ ] T171 Update CLAUDE.md files with lessons learned during implementation
- [ ] T172 Create deployment documentation and CI/CD pipeline configuration

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - **BLOCKS all user stories**
- **User Stories (Phase 3-9)**: All depend on Foundational phase completion
  - User Stories 1 & 2 (P1): Core MVP - implement first
  - User Stories 3 & 4 (P2): Essential features - implement second
  - User Stories 5-7 (P3-P4): Enhancement features - implement last
- **Polish (Phase 10)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (Battle Session Management)**: No dependencies on other stories - fully independent
- **User Story 2 (Creature Management)**: No dependencies - can be implemented in parallel with US1
- **User Story 3 (HP Tracking)**: Requires US2 (creatures must exist) but otherwise independent
- **User Story 4 (Turn Order)**: Requires US2 (creatures) but otherwise independent
- **User Story 5 (Combat Log)**: Can integrate with all other stories but functions independently
- **User Story 6 (Persistence)**: Works with any implemented stories - fully cross-cutting
- **User Story 7 (Status Effects)**: Requires US2 (creatures) but otherwise independent

### Within Each User Story

1. **Tests FIRST**: Write integration tests and ensure they FAIL
2. **Domain Events**: Define event types
3. **Domain Logic**: Implement aggregate methods that emit events
4. **Application Layer**: Define use case ports and implement services
5. **REST API**: Implement controllers and DTOs
6. **Frontend Tests**: Write Angular Testing Library tests (FAIL first)
7. **Frontend Implementation**: Build components and wire up API calls
8. **Validation**: Run all tests and verify story works independently

### Parallel Opportunities

**Phase 1 (Setup)**: All tasks T001-T010 can run in parallel (different directories)

**Phase 2 (Foundational)**:
- Backend tasks T011-T013 (enums/interfaces) can run in parallel
- Backend tasks T016-T017 (JPA entities) can run in parallel
- Frontend tasks T023-T027 (models and ports) can run in parallel
- Backend and frontend foundational work can proceed in parallel

**Within User Story 1**:
- Tests T029-T036: All integration tests can be written in parallel
- Events T037-T041: All event definitions can be created in parallel
- Use Case Ports T049-T055: All port interfaces can be defined in parallel
- DTOs T056-T059: All DTOs can be created in parallel
- Frontend tests T071-T074: All component tests can be written in parallel
- Frontend components T075-T082: Template and component files can be created in parallel (but logic depends on adapter)

**Across User Stories** (after Phase 2 complete):
- User Story 1 and User Story 2 can be implemented completely in parallel by different developers
- User Stories 3, 4, 5, 7 can start in parallel once User Story 2 completes (they need creatures)

---

## Parallel Example: User Story 1 Backend

```bash
# Phase 1: Write all integration tests in parallel
Task T029: Write POST /api/battles test
Task T030: Write GET /api/battles test
Task T031: Write GET /api/battles/{id} test
Task T032: Write POST /api/battles/{id}/start test
Task T033: Write POST /api/battles/{id}/pause test
Task T034: Write POST /api/battles/{id}/resume test
Task T035: Write POST /api/battles/{id}/end test
Task T036: Write event replay test

# Phase 2: Define all events in parallel (after tests fail)
Task T037: Define BattleCreated event
Task T038: Define CombatStarted event
Task T039: Define CombatPaused event
Task T040: Define CombatResumed event
Task T041: Define CombatEnded event

# Phase 3: Define all use case ports in parallel
Task T049: Define CreateBattleUseCase
Task T050: Define GetBattleUseCase
Task T051: Define ListBattlesUseCase
Task T052: Define StartCombatUseCase
Task T053: Define PauseCombatUseCase
Task T054: Define ResumeCombatUseCase
Task T055: Define EndCombatUseCase

# Phase 4: Create all DTOs in parallel
Task T056: Create CreateBattleCommand DTO
Task T057: Create EndCombatCommand DTO
Task T058: Create BattleResponse DTO
Task T059: Create BattleDetailResponse DTO
```

---

## Implementation Strategy

### MVP First (Recommended - User Stories 1 & 2 Only)

1. ✅ Complete **Phase 1: Setup** (T001-T010)
2. ✅ Complete **Phase 2: Foundational** (T011-T028) - **CRITICAL GATE**
3. ✅ Complete **Phase 3: User Story 1** (T029-T093)
   - **VALIDATE**: Create battle, start/pause/resume/end combat works
4. ✅ Complete **Phase 4: User Story 2** (T094-T126)
   - **VALIDATE**: Can add/edit/remove creatures, initiative sorting works
5. 🎯 **STOP and DEMO**: You now have a functional battle tracker MVP!
   - Game Masters can create battles
   - Add creatures with attributes
   - Start and manage combat lifecycle
   - View creature status and initiative order

### Full Feature Set (All User Stories)

After MVP validation, continue with:

6. Complete **Phase 5: User Story 3** (HP Tracking)
7. Complete **Phase 6: User Story 4** (Turn Order)
8. Complete **Phase 7: User Story 5** (Combat Log)
9. Complete **Phase 8: User Story 6** (Persistence)
10. Complete **Phase 9: User Story 7** (Status Effects)
11. Complete **Phase 10: Polish**

Each story adds value independently without breaking previous functionality.

### Parallel Team Strategy

With 2-3 developers (after Foundational complete):

**Developer A**: User Story 1 (Battle Management) - T029-T093
**Developer B**: User Story 2 (Creatures) - T094-T126
**Developer C**: Setup integration test infrastructure and help with both

After MVP (US1 + US2) validation:

**Developer A**: User Story 3 + 4 (HP & Turn Tracking)
**Developer B**: User Story 5 + 6 (Log & Persistence)
**Developer C**: User Story 7 + Polish (Status Effects & Cross-cutting)

---

## Notes

- **[P] tasks** = Different files, no dependencies, can run in parallel
- **[Story] label** = Maps task to specific user story (US1, US2, etc.)
- **TDD Flow**: Write test → See it FAIL → Implement → See it PASS
- **Integration Tests**: Use real H2 database, full Spring context (per research.md)
- **Event Sourcing**: All state changes must emit events, state derived from replay
- **Hexagonal Architecture**: Domain has zero framework dependencies
- **Independent Stories**: Each user story should be completable and testable on its own
- **Commit Strategy**: Commit after each task or logical group of parallel tasks
- **Validation Checkpoints**: Stop at each checkpoint to verify story works independently

---

## Task Count Summary

- **Total Tasks**: 172
- **Setup (Phase 1)**: 10 tasks
- **Foundational (Phase 2)**: 18 tasks (BLOCKS all stories)
- **User Story 1 (P1)**: 65 tasks (T029-T093) 🎯 **MVP Focus**
- **User Story 2 (P1)**: 33 tasks (T094-T126) 🎯 **MVP Focus**
- **User Story 3 (P2)**: 13 tasks (T127-T139)
- **User Story 4 (P2)**: 5 tasks (T140-T144)
- **User Story 5 (P3)**: 4 tasks (T145-T148)
- **User Story 6 (P3)**: 5 tasks (T149-T153)
- **User Story 7 (P4)**: 5 tasks (T154-T158)
- **Polish (Final)**: 14 tasks (T159-T172)

**Parallel Opportunities Identified**:
- Setup: 10 parallel tasks
- Foundational: 8 parallel groups
- User Story 1: 25+ parallel tasks across multiple phases
- Cross-story parallelism: US1 + US2 can proceed simultaneously after Foundational

**Suggested MVP Scope**:
- Phase 1 + Phase 2 + Phase 3 + Phase 4 = 126 tasks
- Delivers: Battle creation, creature management, combat lifecycle
- Estimated effort: 2-3 weeks for solo developer with TDD approach
