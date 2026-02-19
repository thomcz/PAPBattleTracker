---
description: "Task list for Start and Track Battle feature implementation"
---

# Tasks: Start and Track Battle (003-start-battle)

**Input**: Design documents from `/specs/003-start-battle/`
**Prerequisites**: plan.md (structure, tech stack), spec.md (user stories P1-P2), data-model.md (entities), contracts/battle-api.yaml (endpoints), quickstart.md (testing strategy)

**Tests**: TDD approach enabled - tests written and verified to FAIL before implementation (per Constitution requirement)

**Organization**: Tasks organized by user story to enable independent implementation and testing of each story. Backend (Kotlin) and frontend (Angular) tasks run in parallel phases.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/` (Kotlin, Spring Boot)
- **Backend Tests**: `backend/src/test/kotlin/de/thomcz/pap/battle/backend/`
- **Frontend**: `frontend-angular/src/app/`
- **Frontend Tests**: `frontend-angular/src/app/**/*.spec.ts`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish project structure, dependencies, and development environment

- [ ] T001 Create backend battle domain package structure: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/battle/`
- [ ] T002 Create backend application package: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/application/services/`
- [ ] T003 Create backend infrastructure packages: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/{persistence,rest,events}/`
- [ ] T004 [P] Create Angular battle feature module structure: `frontend-angular/src/app/features/battle/` with pages, components, routing
- [ ] T005 [P] Create Angular core/battle domain package: `frontend-angular/src/app/core/battle/` with domain models, ports, use-cases
- [ ] T006 [P] Create Angular adapters package: `frontend-angular/src/app/adapters/battle/` with HTTP adapter
- [ ] T007 Create backend test directory structure: `backend/src/test/kotlin/de/thomcz/pap/battle/backend/{domain,application,integration}/`
- [ ] T008 [P] Create frontend test directory structure: `frontend-angular/src/app/features/battle/` with *.spec.ts files
- [ ] T009 Configure Spring Boot application.properties for battle module (if separate config needed)
- [ ] T010 [P] Update backend build.gradle.kts with battle-specific dependencies (if any new ones)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Backend Foundational

- [ ] T011 Create Battle aggregate root entity: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/battle/entities/Battle.kt` with ID, status, creatures list, events list
- [ ] T012 [P] Create BattleCreature value object: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/battle/entities/BattleCreature.kt` with HP, status, initiative, creature reference
- [ ] T013 [P] Create BattleState value object: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/battle/entities/BattleState.kt` with round, currentActorIndex, turn tracking
- [ ] T014 [P] Create sealed class for BattleEvent: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/battle/events/BattleEvent.kt` (base class for all 6 events)
- [ ] T015 [P] Create event types: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/battle/events/{BattleStarted,InitiativeRolled,TurnProgressed,DamageApplied,CreatureDefeated,BattleEnded}.kt`
- [ ] T016 [P] Create domain port interfaces: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/battle/ports/{BattleRepository,CreaturePort,BattleEventBus}.kt`
- [ ] T017 [P] Create domain exceptions: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/battle/exceptions/{BattleException,InvalidInitiativeException,CreatureAlreadyDefeated}.kt`
- [ ] T018 Create BattleJpaEntity (infrastructure): `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/persistence/jpa/BattleEntity.kt` with JPA annotations
- [ ] T019 [P] Create BattleCreatureJpaEntity: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/persistence/jpa/BattleCreatureEntity.kt`
- [ ] T020 [P] Create BattleEventEntity: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/persistence/jpa/BattleEventEntity.kt` (event sourcing store)
- [ ] T021 Create BattleMapper: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/persistence/mappers/BattleMapper.kt` (domain ↔ JPA conversion)
- [ ] T022 Create Spring Data JPA repositories: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/persistence/jpa/BattleJpaRepository.kt` and `BattleEventJpaRepository.kt`
- [ ] T023 Create BattleRepository adapter (implements port): `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/persistence/BattleRepositoryImpl.kt`
- [ ] T024 Create BattleEventStore: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/application/services/BattleEventStore.kt` (append, replay, reconstruct state)
- [ ] T025 Create CreatureServiceAdapter: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/external/CreatureServiceAdapter.kt` (calls creature-mgmt service)
- [ ] T026 Create LocalBattleEventBus: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/events/LocalBattleEventBus.kt` (in-memory pub/sub)
- [ ] T027 Create H2 database schema migration (Flyway or manual): `resources/db/migration/V001__battle_tables.sql` with Battle, BattleCreature, BattleEvent tables

### Frontend Foundational

- [ ] T028 Create Angular Battle domain model: `frontend-angular/src/app/core/battle/domain/battle.model.ts` (TypeScript interfaces for Battle, BattleCreature, BattleEvent)
- [ ] T029 [P] Create BattleRepository port (interface): `frontend-angular/src/app/core/battle/domain/battle.repository.ts`
- [ ] T030 [P] Create Angular event types: `frontend-angular/src/app/core/battle/domain/battle.events.ts` (mirrors backend events)
- [ ] T031 Create BattleStateService: `frontend-angular/src/app/core/battle/domain/battle-state.service.ts` (RxJS signals, state management)
- [ ] T032 Create BattleHttpAdapter: `frontend-angular/src/app/adapters/battle/battle-api.adapter.ts` (implements BattleRepository, calls backend REST API)
- [ ] T033 Create HTTP client service: `frontend-angular/src/app/adapters/battle/http/battle.http.ts` (Angular HttpClient wrapper)
- [ ] T034 Create Angular routing: `frontend-angular/src/app/features/battle/battle.routes.ts` with battle-list and battle-arena routes
- [ ] T035 Create battle feature module: `frontend-angular/src/app/features/battle/battle.module.ts` or standalone components export

**Checkpoint**: Foundation ready - all user stories can now proceed in parallel

---

## Phase 3: User Story 1 - Create a New Battle (Priority: P1) 🎯 MVP

**Goal**: Enable Game Master to initiate a new battle with selected creatures, enter initiative rolls (d20), and establish turn order

**Independent Test**: User can create battle with 2+ creatures, all creatures visible in turn order initialized, first creature's turn active

### Backend Tests for User Story 1 ⚠️ TDD

- [ ] T036 [P] [US1] Backend unit test for Battle.create(): `backend/src/test/kotlin/de/thomcz/pap/battle/backend/domain/entities/BattleTest.kt` - verify creature list non-empty, initiative calculated
- [ ] T037 [P] [US1] Backend unit test for initiative calculation: `backend/src/test/kotlin/de/thomcz/pap/battle/backend/domain/entities/BattleInitiativeTest.kt` - verify ties broken by selection order
- [ ] T038 [P] [US1] Contract test for POST /battles endpoint: `backend/src/test/kotlin/de/thomcz/pap/battle/backend/infrastructure/rest/BattleControllerCreateTest.kt` - verify response schema
- [ ] T039 [US1] Integration test for create battle flow: `backend/src/test/kotlin/de/thomcz/pap/battle/backend/integration/CreateBattleIntegrationTest.kt` - create battle, verify DB state, event stream

### Frontend Tests for User Story 1 ⚠️ TDD

- [ ] T040 [P] [US1] Frontend unit test for battle creation: `frontend-angular/src/app/core/battle/use-cases/create-battle.usecase.spec.ts` - verify request structure
- [ ] T041 [P] [US1] Frontend component test for battle creation form: `frontend-angular/src/app/features/battle/components/battle-create.component.spec.ts` - verify form submission
- [ ] T042 [US1] Frontend integration test for battle flow: `frontend-angular/src/app/features/battle/pages/battle-arena.component.spec.ts` - create battle, verify UI state

### Backend Implementation for User Story 1

- [ ] T043 [P] [US1] Create CreateBattle use case: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/battle/usecases/CreateBattle.kt` - fetch creatures, validate, initialize battle
- [ ] T044 [P] [US1] Create RollInitiative use case: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/battle/usecases/RollInitiative.kt` - accept d20 roll, calculate initiative, sort creatures
- [ ] T045 [US1] Create BattleService orchestration: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/application/services/BattleService.kt` - calls CreateBattle, RollInitiative, persists events
- [ ] T046 [US1] Implement POST /battles endpoint: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/rest/BattleController.kt` - route handler, validation, error handling
- [ ] T047 [US1] Create request DTO: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/rest/dtos/CreateBattleRequest.kt` (creatureIds, initiativeRolls)
- [ ] T048 [US1] Create response DTO: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/rest/dtos/BattleResponse.kt` (battle state, creatures, turn info)
- [ ] T049 [US1] Implement BattleRepositoryImpl.save(): `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/persistence/BattleRepositoryImpl.kt` - persist Battle + events to database

### Frontend Implementation for User Story 1

- [ ] T050 [P] [US1] Create CreateBattle use case: `frontend-angular/src/app/core/battle/use-cases/create-battle.usecase.ts` - calls adapter, returns battle
- [ ] T051 [P] [US1] Create BattleArenaComponent: `frontend-angular/src/app/features/battle/pages/battle-arena.component.ts` - main battle UI container
- [ ] T052 [P] [US1] Create BattleCreateComponent: `frontend-angular/src/app/features/battle/components/battle-create.component.ts` - form for selecting creatures, entering d20 rolls
- [ ] T053 [P] [US1] Create TurnOrderComponent: `frontend-angular/src/app/features/battle/components/turn-order.component.ts` - display round, current actor, initiative order
- [ ] T054 [US1] Implement BattleStateService.createBattle(): `frontend-angular/src/app/core/battle/domain/battle-state.service.ts` - signal update with new battle state
- [ ] T055 [US1] Implement BattleHttpAdapter.createBattle(): `frontend-angular/src/app/adapters/battle/battle-api.adapter.ts` - HTTP POST to backend
- [ ] T056 [US1] Add form validation: `frontend-angular/src/app/features/battle/components/battle-create.component.ts` - minimum 2 creatures, d20 rolls 1-20
- [ ] T057 [US1] Add error handling: `frontend-angular/src/app/features/battle/pages/battle-arena.component.ts` - display error toast on creation failure

**Checkpoint**: User Story 1 complete and independently testable - MVP ready to demo/deploy

---

## Phase 4: User Story 2 - Track Combat Rounds and Turns (Priority: P1)

**Goal**: Manage turn progression through rounds, update turn order systematically, display current actor and remaining creatures

**Independent Test**: User can advance turns, round auto-increments after last creature, turn order resets, all creatures visible with current actor highlighted

### Backend Tests for User Story 2 ⚠️ TDD

- [ ] T058 [P] [US2] Unit test for ProgressTurn use case: `backend/src/test/kotlin/de/thomcz/pap/battle/backend/domain/usecases/ProgressTurnTest.kt` - verify round/turn increment, order rotation
- [ ] T059 [P] [US2] Contract test for POST /battles/{id}/turn: `backend/src/test/kotlin/de/thomcz/pap/battle/backend/infrastructure/rest/BattleControllerProgressTurnTest.kt`
- [ ] T060 [US2] Integration test for turn progression: `backend/src/test/kotlin/de/thomcz/pap/battle/backend/integration/ProgressTurnIntegrationTest.kt` - create battle, advance 3 turns, verify state

### Frontend Tests for User Story 2 ⚠️ TDD

- [ ] T061 [P] [US2] Unit test for ProgressTurn use case: `frontend-angular/src/app/core/battle/use-cases/progress-turn.usecase.spec.ts`
- [ ] T062 [US2] Component test for turn advancement: `frontend-angular/src/app/features/battle/components/turn-order.component.spec.ts` - verify UI updates on advance

### Backend Implementation for User Story 2

- [ ] T063 [US2] Create ProgressTurn use case: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/battle/usecases/ProgressTurn.kt` - increment turn, wrap to next round, emit TurnProgressed event
- [ ] T064 [US2] Implement POST /battles/{id}/turn endpoint: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/rest/BattleController.kt` - call ProgressTurn, persist event
- [ ] T065 [US2] Implement GET /battles/{id} endpoint: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/rest/BattleController.kt` - return current battle state (round, turn, creatures, turn order)
- [ ] T066 [US2] Update BattleStateService to handle turn progression: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/application/services/BattleService.kt` - orchestrate ProgressTurn, update state from events

### Frontend Implementation for User Story 2

- [ ] T067 [US2] Create ProgressTurn use case: `frontend-angular/src/app/core/battle/use-cases/progress-turn.usecase.ts` - calls adapter endpoint
- [ ] T068 [US2] Implement BattleStateService.progressTurn(): `frontend-angular/src/app/core/battle/domain/battle-state.service.ts` - signal update on success
- [ ] T069 [US2] Implement BattleHttpAdapter.progressTurn(): `frontend-angular/src/app/adapters/battle/battle-api.adapter.ts` - HTTP POST /battles/{id}/turn
- [ ] T070 [US2] Create BattleControlsComponent: `frontend-angular/src/app/features/battle/components/battle-controls.component.ts` - "Next Turn" button, disabled when battle ended
- [ ] T071 [US2] Update TurnOrderComponent: `frontend-angular/src/app/features/battle/components/turn-order.component.ts` - add computed currentActor display, highlight active creature
- [ ] T072 [US2] Add keyboard shortcut for next turn: `frontend-angular/src/app/features/battle/pages/battle-arena.component.ts` - Space key advances turn
- [ ] T073 [US2] Add optimistic UI update: `frontend-angular/src/app/core/battle/domain/battle-state.service.ts` - update local state immediately, rollback on error

**Checkpoint**: User Stories 1 & 2 complete - core battle loop functional

---

## Phase 5: User Story 3 - Apply Damage and Track Creature State (Priority: P1)

**Goal**: Enable damage application, track HP changes, mark creatures as defeated when HP ≤ 0, visually distinguish defeated creatures

**Independent Test**: User can apply damage, HP updates correctly, creature marked defeated at 0 HP, defeated creature shown grayed out with badge

### Backend Tests for User Story 3 ⚠️ TDD

- [ ] T074 [P] [US3] Unit test for ApplyDamage use case: `backend/src/test/kotlin/de/thomcz/pap/battle/backend/domain/usecases/ApplyDamageTest.kt` - HP reduction, defeated marking, negative damage rejection
- [ ] T075 [P] [US3] Contract test for POST /battles/{id}/damage: `backend/src/test/kotlin/de/thomcz/pap/battle/backend/infrastructure/rest/BattleControllerDamageTest.kt`
- [ ] T076 [US3] Integration test for damage flow: `backend/src/test/kotlin/de/thomcz/pap/battle/backend/integration/ApplyDamageIntegrationTest.kt` - apply damage, verify HP, verify defeated event

### Frontend Tests for User Story 3 ⚠️ TDD

- [ ] T077 [P] [US3] Unit test for ApplyDamage use case: `frontend-angular/src/app/core/battle/use-cases/apply-damage.usecase.spec.ts`
- [ ] T078 [P] [US3] Component test for damage dialog: `frontend-angular/src/app/features/battle/components/damage-dialog.component.spec.ts` - form validation, submission
- [ ] T079 [US3] Component test for creature card defeated styling: `frontend-angular/src/app/features/battle/components/creature-card.component.spec.ts` - verify CSS classes when defeated

### Backend Implementation for User Story 3

- [ ] T080 [US3] Create ApplyDamage use case: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/battle/usecases/ApplyDamage.kt` - validate damage > 0, reduce HP, mark defeated, emit events
- [ ] T081 [US3] Implement POST /battles/{id}/damage endpoint: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/rest/BattleController.kt` - call ApplyDamage
- [ ] T082 [US3] Create DamageRequest DTO: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/rest/dtos/DamageRequest.kt` (creatureId, damage, source)
- [ ] T083 [US3] Add DamageApplied event handler: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/application/services/BattleEventStore.kt` - update creature HP from event
- [ ] T084 [US3] Add CreatureDefeated event handler: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/application/services/BattleEventStore.kt` - mark defeated, log entry

### Frontend Implementation for User Story 3

- [ ] T085 [US3] Create ApplyDamage use case: `frontend-angular/src/app/core/battle/use-cases/apply-damage.usecase.ts` - calls adapter
- [ ] T086 [US3] Create DamageDialogComponent: `frontend-angular/src/app/features/battle/components/damage-dialog.component.ts` - modal with damage input (1-99 range), target selector
- [ ] T087 [US3] Implement BattleStateService.applyDamage(): `frontend-angular/src/app/core/battle/domain/battle-state.service.ts` - signal update
- [ ] T088 [US3] Implement BattleHttpAdapter.applyDamage(): `frontend-angular/src/app/adapters/battle/battle-api.adapter.ts` - HTTP POST /battles/{id}/damage
- [ ] T089 [US3] Update CreatureCardComponent: `frontend-angular/src/app/features/battle/components/creature-card.component.ts` - display HP bar, add "Apply Damage" button
- [ ] T090 [US3] Add defeated creature styling: `frontend-angular/src/app/features/battle/components/creature-card.component.ts` - gray background (50% opacity), "Defeated" badge when status = DEFEATED
- [ ] T091 [US3] Add damage dialog to BattleArenaComponent: `frontend-angular/src/app/features/battle/pages/battle-arena.component.ts` - open dialog on "Apply Damage" click
- [ ] T092 [US3] Add HP update animation: `frontend-angular/src/app/features/battle/components/creature-card.component.ts` - flash on HP change (optional visual feedback)

**Checkpoint**: All P1 user stories complete - full combat loop ready

---

## Phase 6: User Story 4 - View Battle History and Combat Log (Priority: P2)

**Goal**: Display chronological event log, show damage dealt, defeats, round changes; support pagination for large logs

**Independent Test**: User can view combat log with all events in order, paginate through 100+ entry log, see event details (damage amount, defeated status)

### Backend Tests for User Story 4 ⚠️ TDD

- [ ] T093 [P] [US4] Unit test for combat log generation: `backend/src/test/kotlin/de/thomcz/pap/battle/backend/domain/usecases/GenerateCombatLogTest.kt` - verify event→log entry mapping
- [ ] T094 [P] [US4] Contract test for GET /battles/{id}/log: `backend/src/test/kotlin/de/thomcz/pap/battle/backend/infrastructure/rest/BattleControllerLogTest.kt`
- [ ] T095 [US4] Integration test for combat log retrieval: `backend/src/test/kotlin/de/thomcz/pap/battle/backend/integration/CombatLogIntegrationTest.kt` - 10+ events, verify pagination

### Frontend Tests for User Story 4 ⚠️ TDD

- [ ] T096 [P] [US4] Unit test for log formatting: `frontend-angular/src/app/core/battle/use-cases/get-combat-log.usecase.spec.ts`
- [ ] T097 [US4] Component test for combat log: `frontend-angular/src/app/features/battle/components/combat-log.component.spec.ts` - verify pagination, scroll performance

### Backend Implementation for User Story 4

- [ ] T098 [US4] Create CombatLogEntry value object: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/battle/values/CombatLogEntry.kt` - message, type, timestamp, event data
- [ ] T099 [US4] Implement log generation from events: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/application/services/BattleService.kt` - format each event as readable log entry
- [ ] T100 [US4] Implement GET /battles/{id}/log endpoint: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/rest/BattleController.kt` - paginated endpoint (limit, offset)
- [ ] T101 [US4] Create LogResponse DTO: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/rest/dtos/CombatLogResponse.kt` (entries, total, limit, offset)
- [ ] T102 [US4] Add database index on battle_event: `resources/db/migration/V002__add_indexes.sql` - index on (battle_id, version) for fast log retrieval

### Frontend Implementation for User Story 4

- [ ] T103 [US4] Create CombatLogComponent: `frontend-angular/src/app/features/battle/components/combat-log.component.ts` - displays event list with pagination
- [ ] T104 [US4] Create GetCombatLog use case: `frontend-angular/src/app/core/battle/use-cases/get-combat-log.usecase.ts` - calls adapter
- [ ] T105 [US4] Implement BattleHttpAdapter.getCombatLog(): `frontend-angular/src/app/adapters/battle/battle-api.adapter.ts` - HTTP GET /battles/{id}/log
- [ ] T106 [US4] Add virtual scrolling for performance: `frontend-angular/src/app/features/battle/components/combat-log.component.ts` - use @angular/cdk virtual scroll for 100+ entries
- [ ] T107 [US4] Add log entry type icons: `frontend-angular/src/app/features/battle/components/combat-log.component.ts` - visual indicators (damage = ⚔, defeat = ☠, round = 🔄)
- [ ] T108 [US4] Integrate combat log into BattleArenaComponent: `frontend-angular/src/app/features/battle/pages/battle-arena.component.ts` - sidebar or collapsible panel

---

## Phase 7: User Story 5 - End Battle and View Final Results (Priority: P2)

**Goal**: Allow manual battle conclusion, display summary with round count, creature final states, timestamps

**Independent Test**: User can end active battle, sees results page with round count and creature final HP, battle marked as completed in history

### Backend Tests for User Story 5 ⚠️ TDD

- [ ] T109 [P] [US5] Unit test for EndBattle use case: `backend/src/test/kotlin/de/thomcz/pap/battle/backend/domain/usecases/EndBattleTest.kt` - verify status change, event emission
- [ ] T110 [P] [US5] Contract test for POST /battles/{id}/end: `backend/src/test/kotlin/de/thomcz/pap/battle/backend/infrastructure/rest/BattleControllerEndTest.kt`
- [ ] T111 [US5] Integration test for battle conclusion: `backend/src/test/kotlin/de/thomcz/pap/battle/backend/integration/EndBattleIntegrationTest.kt` - end battle, verify completed state

### Frontend Tests for User Story 5 ⚠️ TDD

- [ ] T112 [P] [US5] Unit test for EndBattle use case: `frontend-angular/src/app/core/battle/use-cases/end-battle.usecase.spec.ts`
- [ ] T113 [US5] Component test for results display: `frontend-angular/src/app/features/battle/components/battle-results.component.spec.ts` - verify round/creature summary

### Backend Implementation for User Story 5

- [ ] T114 [US5] Create EndBattle use case: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/battle/usecases/EndBattle.kt` - verify active state, emit BattleEnded event, mark as completed
- [ ] T115 [US5] Implement POST /battles/{id}/end endpoint: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/rest/BattleController.kt` - call EndBattle
- [ ] T116 [US5] Create BattleResults DTO: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/rest/dtos/BattleResultsResponse.kt` (rounds, duration, creatures with final HP, timestamp)
- [ ] T117 [US5] Implement GET /battles (list endpoint): `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/rest/BattleController.kt` - filter by status (ACTIVE/ENDED), pagination
- [ ] T118 [US5] Add filter support to BattleRepositoryImpl: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/persistence/BattleRepositoryImpl.kt` - query by status and user

### Frontend Implementation for User Story 5

- [ ] T119 [US5] Create EndBattle use case: `frontend-angular/src/app/core/battle/use-cases/end-battle.usecase.ts` - calls adapter
- [ ] T120 [US5] Create BattleResultsComponent: `frontend-angular/src/app/features/battle/components/battle-results.component.ts` - display round count, creature summary, duration
- [ ] T121 [US5] Implement BattleStateService.endBattle(): `frontend-angular/src/app/core/battle/domain/battle-state.service.ts` - signal update
- [ ] T122 [US5] Implement BattleHttpAdapter.endBattle(): `frontend-angular/src/app/adapters/battle/battle-api.adapter.ts` - HTTP POST /battles/{id}/end
- [ ] T123 [US5] Create BattleListComponent: `frontend-angular/src/app/features/battle/pages/battle-list.component.ts` - display all user's battles with status filter
- [ ] T124 [US5] Add results modal/page routing: `frontend-angular/src/app/features/battle/pages/battle-arena.component.ts` - navigate to results on battle end
- [ ] T125 [US5] Add "Return to Battle List" button: `frontend-angular/src/app/features/battle/components/battle-results.component.ts` - navigate back to list

**Checkpoint**: All user stories complete - feature ready for release

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements affecting multiple user stories, accessibility, performance, documentation

### Backend Polish

- [ ] T126 [P] Add comprehensive error handling: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/rest/GlobalExceptionHandler.kt` - standardized error responses
- [ ] T127 [P] Add logging across domain/app/infra layers: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/**/*` - use SLF4J
- [ ] T128 [P] Run backend test suite: `./gradlew backend:test` - verify ≥80% coverage, all tests pass
- [ ] T129 Add battle event sourcing documentation: `backend/BATTLE_EVENT_SOURCING.md` - explain replay logic, snapshots
- [ ] T130 Performance optimize event replay: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/application/services/BattleEventStore.kt` - implement snapshots for events >100
- [ ] T131 Add database indexes for common queries: `resources/db/migration/V003__query_optimization.sql` - index on battle.created_by, battle.created_at

### Frontend Polish

- [ ] T132 [P] Add accessibility audit: `frontend-angular/src/app/features/battle/` - verify WCAG 2.1 AA compliance (keyboard nav, screen reader, color contrast)
- [ ] T133 [P] Add unit tests for all services: `frontend-angular/src/app/core/battle/domain/battle-state.service.spec.ts` - coverage ≥80%
- [ ] T134 [P] Add component tests for all UI: `frontend-angular/src/app/features/battle/components/*.spec.ts` - coverage ≥80%
- [ ] T135 [P] Run frontend test suite: `cd frontend-angular && npm test` - verify ≥80% coverage
- [ ] T136 Add responsive design testing: `frontend-angular/src/app/features/battle/` - test viewports 320px, 768px, 1920px
- [ ] T137 Add loading states: `frontend-angular/src/app/features/battle/components/*.component.ts` - spinners during API calls
- [ ] T138 Add confirmation dialog for dangerous actions: `frontend-angular/src/app/features/battle/components/battle-controls.component.ts` - confirm battle end

### Integration & Cross-Cutting

- [ ] T139 [P] End-to-end test: Create battle → Apply damage → Defeat creature → View log → End battle
- [ ] T140 [P] Performance benchmark: Turn advancement <500ms, combat log <2s, event replay <5s
- [ ] T141 Contract test: Backend REST spec vs Frontend HTTP adapter match
- [ ] T142 Documentation updates: Update main README with battle feature overview
- [ ] T143 Update IMPLEMENTATION_PLAN.md: Mark 003-start-battle complete
- [ ] T144 Run quickstart.md validation: Verify all quickstart examples execute successfully
- [ ] T145 Final code review checklist: Constitution compliance, test coverage, code quality

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately (0 days)
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories (3-4 days after Setup)
- **User Stories (Phase 3-7)**: All depend on Foundational completion
  - P1 stories (US1-US3): Sequential recommended (fastest path) OR parallel (if team capacity)
  - P2 stories (US4-US5): Can start after Foundational, best after P1 complete
- **Polish (Phase 8)**: Depends on all desired user stories - final optimization (2-3 days)

### User Story Dependencies

```
Setup (T001-T010)
    ↓
Foundational (T011-T035) ← CRITICAL GATE
    ├── US1 (T036-T057) ← MVP
    │   ├── US2 (T058-T073)
    │   ├── US3 (T074-T092)
    │   └─→ US4 (T093-T108)
    │       └─→ US5 (T109-T125)
    │
    └── Polish (T126-T145)
```

### Within Each User Story (Sequential)

1. Tests first (RED - verify fail)
2. Backend implementation
3. Frontend implementation
4. Integration test

### Parallel Opportunities Within Stories

**Phase 1 Setup**:
```
T001, T002, T003 (sequential - folder creation)
T004, T005, T006, T007, T008 [P] (parallel - Angular packages)
T009, T010 [P] (parallel - backend config)
```

**Phase 2 Foundational**:
```
Backend entities: T012, T013, T014, T015, T016, T017 [P] (parallel - different files)
Backend infrastructure: T018, T019, T020 [P] (parallel - JPA entities)
Frontend domain: T029, T030 [P] (parallel - model and events)
Frontend adapters: T032, T033 [P] (parallel - HTTP setup)
```

**Phase 3 US1**:
```
Backend tests: T036, T037, T038 [P] (parallel - different test files)
Frontend tests: T040, T041 [P] (parallel - different test files)
Backend impl: T043, T044 [P] (parallel - use cases)
Frontend impl: T050, T051, T052 [P] (parallel - components)
```

---

## Parallel Example: Complete User Story 1 with Team of 3

```
Day 1: Setup + Foundational (entire team)
  - T001-T010: Project structure
  - T011-T035: Core domain, entities, adapters
  → Foundation ready

Day 2: User Story 1 (parallel assignment)
  Developer A: Backend tests (T036-T039) → Implementation (T043-T049)
  Developer B: Frontend tests (T040-T042) → Components (T050-T057)
  Developer C: Integration testing while A & B work

Day 3: User Story 1 Integration + Validation
  - Verify HTTP contract matches
  - Run E2E flow: create battle → see turn order
  - All tests pass, coverage ≥80%
  → MVP ready to demo

Days 4-5: User Stories 2-3 (P1, parallel)
  - Follow same pattern for US2 and US3
  - Core combat loop complete

Days 6-7: User Stories 4-5 (P2, sequential)
  - Combat log and battle conclusion
  → Feature complete
```

---

## Implementation Strategy

### MVP First (User Story 1 Only) - RECOMMENDED START

**Minimal Viable Product scope** (2-3 weeks):
1. ✅ Phase 1: Setup
2. ✅ Phase 2: Foundational
3. ✅ Phase 3: User Story 1 (Create Battle)
4. 🛑 **STOP and VALIDATE** - test independently
5. Deploy/demo to stakeholders
6. Gather feedback before continuing to US2

**Time**: 2-3 weeks for MVP. Risk is minimal - single use case proves patterns before scaling.

### Incremental Delivery (Add Stories Weekly)

1. Week 1: Setup + Foundational
2. Week 2: User Story 1 (Create Battle) → Demo MVP
3. Week 3: User Story 2 (Track Turns) → Demo US1+US2
4. Week 4: User Story 3 (Apply Damage) → Demo P1 complete
5. Week 5: User Stories 4-5 (Log + Results) → Demo full feature

### Parallel Team Strategy (Full Feature in 4 Weeks)

With 3 developers:
1. Week 1: All three complete Setup + Foundational together
2. Week 2: Dev A on US1, Dev B on US2, Dev C on US3 (parallel)
3. Week 3: Merge US1-US3, fix integration issues, demo P1
4. Week 4: Dev A on US4, Dev B on US5, Dev C on Polish
5. Deploy complete feature

---

## Format Validation Checklist

Every task in this file MUST follow strict format. Verify:

✅ **Task Format Examples** (all correct):
- `- [ ] T001 Create project structure per implementation plan`
- `- [ ] T011 [US1] Create BattleRepository port in backend/src/...`
- `- [ ] T050 [P] [US1] Create BattleArenaComponent in frontend-angular/src/...`

✅ **All checklist items start with `- [ ]`** (markdown checkbox)
✅ **All tasks have sequential ID** (T001, T002, T003... T145)
✅ **All user story tasks labeled `[USN]`** (US1, US2, US3, US4, US5)
✅ **Parallelizable tasks marked `[P]`** (different files, no inter-dependencies)
✅ **All paths are absolute or relative from repo root** (backend/src/..., frontend-angular/src/...)
✅ **No vague descriptions** - each task is specific and actionable

---

## Notes

- **[P] Parallelizable tasks** = different files with no blocking dependencies. Can assign to different team members.
- **[Story] labels** = US1, US2, US3, US4, US5 map to user stories from spec.md. Traceability for tracking.
- **TDD Approach** = Tests listed BEFORE implementation. Run tests, verify FAIL, then implement until PASS.
- **Each user story independently testable** = Can demo US1 alone before adding US2.
- **MVP = User Story 1** = Minimum viable product is just battle creation + turn order. Proves patterns.
- **Stop at checkpoints** = After each user story, validate independently before continuing.
- **Commit frequently** = After each task or logical group (atomic commits).
- **80% test coverage minimum** = Per constitution requirement for backend (100% domain, ≥90% app, ≥80% infra) and frontend (≥80%).

---

## Next Steps

1. ✅ Specification complete (spec.md)
2. ✅ Implementation plan complete (plan.md)
3. ✅ Data model defined (data-model.md)
4. ✅ API contracts defined (contracts/battle-api.yaml)
5. ✅ Tasks generated (this file: tasks.md) ← YOU ARE HERE
6. → Start Phase 1: Setup (T001-T010)
7. → Complete Phase 2: Foundational (T011-T035) - CRITICAL GATE
8. → Execute user stories in priority order (Phase 3-7)

**To begin implementation**:
```bash
# Ensure you're on feature branch
git checkout 003-start-battle

# Start with Phase 1 Setup task T001
# Create backend battle domain package structure
mkdir -p backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/battle/{entities,events,ports,usecases,exceptions}

# Continue with remaining Phase 1 tasks...
```

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| **Total Tasks** | 145 |
| **Phase 1 Setup** | 10 tasks (1 day) |
| **Phase 2 Foundational** | 25 tasks (3-4 days, CRITICAL) |
| **Phase 3 US1** | 22 tasks (4-5 days) |
| **Phase 4 US2** | 16 tasks (3-4 days) |
| **Phase 5 US3** | 19 tasks (3-4 days) |
| **Phase 6 US4** | 15 tasks (2-3 days) |
| **Phase 7 US5** | 17 tasks (2-3 days) |
| **Phase 8 Polish** | 20 tasks (2-3 days) |
| **Parallel Tasks** | 52 [P] total |
| **Backend Tasks** | 62 (domain, app, infra) |
| **Frontend Tasks** | 61 (domain, adapters, components) |
| **Integration Tasks** | 22 (tests + cross-cutting) |
| **Estimated Duration** | 3-4 weeks (sequential) or 2-3 weeks (parallel team of 3) |
| **Test Coverage Target** | ≥80% (backend ≥90% app layer, frontend ≥80% components) |
