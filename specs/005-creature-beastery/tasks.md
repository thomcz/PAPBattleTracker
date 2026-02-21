---
description: "Implementation tasks for Creature Beastery feature"
---

# Tasks: Creature Beastery

**Input**: Design documents from `/specs/005-creature-beastery/`
**Prerequisites**: plan.md (tech stack), spec.md (user stories), data-model.md (entities), contracts/ (API), research.md (decisions)

**Organization**: Tasks grouped by user story (US1-US4) in priority order. Each story is independently implementable and testable.

**Architecture**: Hexagonal (ports & adapters). Domain layer has zero framework dependencies. TDD required: 80%+ coverage (100% domain, 90% application, 80% adapters).

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, shared infrastructure, and foundation

- [ ] T001 Create Kotlin domain package structure: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/creature/`
- [ ] T002 Create Kotlin application package: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/application/creature/`
- [ ] T003 Create Kotlin infrastructure packages: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/persistence/` and `infrastructure/rest/`
- [ ] T004 [P] Create Angular feature package: `frontend-angular/src/app/features/beastery/`
- [ ] T005 [P] Create Angular core domain package: `frontend-angular/src/app/core/creature/`
- [ ] T006 [P] Create Angular adapters package: `frontend-angular/src/app/adapters/creature/`
- [ ] T007 Update `backend/build.gradle.kts` with required Spring, Jackson, and testing dependencies
- [ ] T008 [P] Update `frontend-angular/package.json` with testing libraries if needed
- [ ] T009 Configure backend test framework: JUnit 5, Mockito-Kotlin in test classpath
- [ ] T010 [P] Configure frontend test framework: Jasmine, Karma, @testing-library/angular

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure and database setup that must complete before user story implementation

**⚠️ CRITICAL**: No user story work begins until this phase is complete

### Database & Event Sourcing Setup

- [ ] T011 Create H2 database schema migration: `backend/src/main/resources/schema.sql`
  - Create `creature_events` table (id, aggregate_id, event_type, payload JSON, user_id, created_at, indexes)
  - Create `creature_snapshots` table (id, aggregate_id, user_id, name, hit_points, armor_class, abilities JSON, deleted, version, created_at, updated_at, indexes)
  - Reference: data-model.md database schema section
- [ ] T012 Implement event sourcing base classes: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/event/`
  - EventStore.kt (interface for appending and retrieving events)
  - AbstractAggregate.kt (base class for event-sourced aggregates)
  - Event.kt (base event class with Jackson serialization)

### Domain Layer Foundation (Zero Framework Dependencies)

- [ ] T013 Create CreatureId value object: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/creature/CreatureId.kt`
  - UUID-based identifier, immutable, hashable for collections
- [ ] T014 Create Ability value object: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/creature/Ability.kt`
  - Properties: id, name, description, damageType, damage, range (all optional except name per FR-002)
  - Validation: name not blank, max lengths
  - No framework dependencies

### Port Definitions (Domain Layer)

- [ ] T015 Define CreatureRepository port: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/creature/ports/CreatureRepository.kt`
  - Methods: save(), findById(), findByUserId(), delete(), exists()
  - Returns Creature or Optional<Creature>
- [ ] T016 Define CreatureEventStore port: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/creature/ports/CreatureEventStore.kt`
  - Methods: append(event), getEvents(aggregateId)
  - JSON serialization handled by adapter

### Authentication & User Context

- [ ] T017 Verify existing UserContext/JWT token extraction in request context
  - Ensure userId available via SecurityContext.getAuthentication().getPrincipal()
  - No new code needed if already implemented (from 001-battle-tracker-features)
  - Reference existing JWT provider in infrastructure

**Checkpoint**: Foundation complete. Database schema migrated, event sourcing infrastructure ready, ports defined. Ready for user story implementation.

---

## Phase 3: User Story 1 - Create and Manage Creatures in Beastery (Priority: P1) 🎯 MVP

**Goal**: Users can create creatures with basic stats (name, HP, AC), store them persistently, list them, view details, and verify persistence across sessions.

**Acceptance**: Users can create a creature, refresh the page, and the creature still exists with all data intact.

**Independent Test**: Create creature with createCreature() endpoint, GET /api/creatures/{id}, refresh browser, verify creature persists.

### Domain Model Tests (RED phase - write before implementation)

- [ ] T018 [P] [US1] Write test for Creature creation: `backend/src/test/kotlin/de/thomcz/pap/battle/backend/domain/creature/CreatureTest.kt`
  - Test: creating creature with valid name/HP/AC succeeds
  - Test: creating creature with empty name fails
  - Test: creating creature with HP ≤ 0 fails
  - Test: creating creature with AC < 0 fails
  - Test: abilities are optional at creation (empty list allowed)
- [ ] T019 [P] [US1] Write test for Ability value object: `backend/src/test/kotlin/de/thomcz/pap/battle/backend/domain/creature/AbilityTest.kt`
  - Test: creating ability with name succeeds
  - Test: all other fields optional
  - Test: ability names with max length 100
- [ ] T020 [P] [US1] Write repository contract test: `backend/src/test/kotlin/de/thomcz/pap/battle/backend/domain/creature/CreatureRepositoryTest.kt`
  - Test: save and retrieve creature
  - Test: findByUserId returns creatures for specific user only
  - Test: deleted creatures excluded from queries (soft delete flag)

### Domain Model Implementation (GREEN phase)

- [ ] T021 [P] [US1] Implement Creature aggregate root: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/creature/Creature.kt`
  - Aggregate root with: id (CreatureId), userId, name, hitPoints, armorClass, abilities (List<Ability>), createdAt, updatedAt, deleted (Boolean)
  - Static factory: `create(name, hitPoints, armorClass, userId)` returns Creature
  - Methods: addAbility(ability), removeAbility(abilityId), updateStats(name, hp, ac), markDeleted()
  - Validation: enforce constraints from FR-001, FR-012
  - All public methods validated (no mutations with deleted=true)
  - Tests should pass (from T018)

### Application Service & Use Cases

- [ ] T022 [US1] Implement CreateCreatureUseCase: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/creature/usecase/CreateCreatureUseCase.kt`
  - Input: CreateCreatureRequest (name, hitPoints, armorClass, abilities?)
  - Output: CreatureId (UUID)
  - Logic: Validate input, create Creature, save via repository, return ID
  - Throws: ValidationException if invalid data
  - Uses: CreatureRepository port
- [ ] T023 [US1] Implement ListCreaturesUseCase: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/creature/usecase/ListCreaturesUseCase.kt`
  - Input: userId, search (optional), limit (default 50), offset (default 0)
  - Output: List<Creature>
  - Logic: Query by userId (excludes deleted), filter by name if search provided, apply pagination
  - Uses: CreatureRepository port
- [ ] T024 [US1] Implement GetCreatureUseCase: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/creature/usecase/GetCreatureUseCase.kt`
  - Input: CreatureId, userId (for authorization)
  - Output: Creature or null
  - Logic: Load creature, verify belongs to user, verify not deleted
  - Throws: EntityNotFoundException if not found or doesn't belong to user
- [ ] T025 [US1] Implement CreatureApplicationService: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/application/creature/CreatureApplicationService.kt`
  - Orchestrates use cases (CreateCreatureUseCase, ListCreaturesUseCase, GetCreatureUseCase, etc.)
  - Receives DTOs, calls use cases, returns DTOs
  - Handles transactions via Spring @Transactional
- [ ] T026 [P] [US1] Define DTOs: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/application/creature/CreatureDTO.kt`
  - CreateCreatureRequest (name, hitPoints, armorClass, abilities?)
  - UpdateCreatureRequest (all optional)
  - CreatureResponse (id, name, hitPoints, armorClass, abilities, createdAt, updatedAt)
  - AbilityInput/AbilityResponse

### Infrastructure Adapters

- [ ] T027 [P] [US1] Implement JPA entities: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/persistence/jpa/`
  - CreatureJpaEntity.kt (maps to creature_snapshots table)
  - AbilityJpaEntity.kt (embedded in creature_snapshots.abilities JSON)
  - Mapping to/from domain Creature
- [ ] T028 [US1] Implement CreatureJpaRepository: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/persistence/jpa/CreatureJpaRepository.kt`
  - Extends Spring Data JpaRepository<CreatureJpaEntity, Long>
  - Custom methods: findByUserIdAndDeleted(), findByUserIdAndNameContaining()
  - Adapter for CreatureRepository port
  - Handles event store append on save (publish CreatedEvent or UpdatedEvent)

### REST Endpoint Tests (TDD)

- [ ] T029 [P] [US1] Write REST contract test for POST /api/creatures: `backend/src/test/kotlin/de/thomcz/pap/battle/backend/infrastructure/rest/CreatureControllerTest.kt`
  - Test: POST /api/creatures with valid data → 201 with CreatureResponse
  - Test: POST /api/creatures with invalid name → 400 with error message
  - Test: POST /api/creatures without auth → 401
  - Test: POST /api/creatures with HP ≤ 0 → 400
- [ ] T030 [P] [US1] Write REST contract test for GET /api/creatures: `backend/src/test/kotlin/de/thomcz/pap/battle/backend/infrastructure/rest/CreatureControllerTest.kt`
  - Test: GET /api/creatures → 200 with creature list
  - Test: GET /api/creatures?search=orc → filtered results
  - Test: GET /api/creatures without auth → 401
  - Test: only returns creatures for authenticated user
- [ ] T031 [P] [US1] Write REST contract test for GET /api/creatures/{id}: `backend/src/test/kotlin/de/thomcz/pap/battle/backend/infrastructure/rest/CreatureControllerTest.kt`
  - Test: GET /api/creatures/{validId} → 200 with creature details
  - Test: GET /api/creatures/{invalidId} → 404
  - Test: forbids access to other user's creature → 403 or 404

### REST Controller Implementation

- [ ] T032 [US1] Implement CreatureController: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/rest/CreatureController.kt`
  - POST /api/creatures → createCreature (calls CreateCreatureUseCase)
  - GET /api/creatures → listCreatures (calls ListCreaturesUseCase, supports search/limit/offset)
  - GET /api/creatures/{id} → getCreature (calls GetCreatureUseCase)
  - Extract userId from JWT token/SecurityContext for all requests
  - Return CreatureResponse DTOs with Jackson serialization
  - Handle exceptions: ValidationException → 400, EntityNotFoundException → 404, unauthorized → 401

### Persistence & Event Sourcing

- [ ] T033 [US1] Implement event store adapter: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/event/H2EventStore.kt`
  - Implements CreatureEventStore port
  - append(event): Serialize event to JSON, insert into creature_events table
  - getEvents(aggregateId): Query creature_events by aggregate_id, deserialize JSON events
  - Subscribe to repository save: Emit CreatureCreatedEvent, AbilityAddedEvent, etc.
- [ ] T034 [US1] Implement creature snapshot update logic: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/event/SnapshotBuilder.kt`
  - Replay events from creature_events into creature_snapshots
  - Called after each event append
  - Updates creature_snapshots record with current state
  - Handles soft delete flag

### Integration & Verification

- [ ] T035 [P] [US1] Create integration test for full user story 1 flow: `backend/src/test/kotlin/de/thomcz/pap/battle/backend/CreatureUserStory1IntegrationTest.kt`
  - Test complete flow: create creature → list creatures → get creature detail → verify persistence
  - Use @SpringBootTest with embedded H2 database
  - Verify events in creature_events table
  - Verify snapshot in creature_snapshots table
  - Test search filtering
  - Test user isolation (user A cannot see user B's creatures)

### Frontend - Angular Components for US1

- [ ] T036 [P] [US1] Create creature domain interface: `frontend-angular/src/app/core/creature/creature.ts`
  - Creature interface: id, name, hitPoints, armorClass, abilities, createdAt, updatedAt
  - Ability interface: id, name, description, damageType, damage, range
- [ ] T037 [P] [US1] Define creature repository port: `frontend-angular/src/app/core/creature/creature.repository.ts`
  - Abstract methods: create(creature), list(search?), get(id), update(id, creature), delete(id), duplicate(id)
  - Return types: Observable<Creature>, Observable<Creature[]>
- [ ] T038 [P] [US1] Implement HTTP API adapter: `frontend-angular/src/app/adapters/creature/creature.api.ts`
  - CreatureApiService implements CreatureRepository
  - POST /api/creatures, GET /api/creatures, GET /api/creatures/{id}
  - Uses HttpClient with JWT token from auth service
  - Error handling: map HTTP errors to user-friendly messages
- [ ] T039 [US1] Create BeasteryService with use cases: `frontend-angular/src/app/features/beastery/services/beastery.service.ts`
  - Dependency inject CreatureRepository (port, resolved via Angular DI)
  - Methods: createCreature(), listCreatures(search?), getCreature(id)
  - Calls repository adapter
- [ ] T040 [US1] Create beastery signals for state management: `frontend-angular/src/app/features/beastery/state/beastery.signal.ts`
  - creaturesSignal = signal<Creature[]>([])
  - searchQuerySignal = signal<string>('')
  - selectedCreatureSignal = signal<Creature | null>(null)
  - filteredCreaturesSignal = computed(() => filter by search)
  - loadingSignal = signal(false)
  - errorSignal = signal<string | null>(null)
  - Methods: loadCreatures(), selectCreature(id), searchCreatures(query), clearError()
- [ ] T041 [US1] Create creature list component: `frontend-angular/src/app/features/beastery/components/creature-list/creature-list.component.ts`
  - Displays list of creatures from creaturesSignal
  - Search input bound to searchQuerySignal
  - Click creature → select and show details
  - Loading spinner from loadingSignal
  - Error message from errorSignal
  - Tests: component-list.spec.ts
- [ ] T042 [US1] Create creature form component: `frontend-angular/src/app/features/beastery/components/creature-form/creature-form.component.ts`
  - Form fields: name (required, max 100), hitPoints (required, > 0), armorClass (0-20)
  - Abilities optional: add/remove ability rows
  - Submit → createCreature() service call
  - Validation display (inline errors)
  - Tests: creature-form.spec.ts
- [ ] T043 [US1] Create creature detail component: `frontend-angular/src/app/features/beastery/components/creature-detail/creature-detail.component.ts`
  - Display selectedCreatureSignal details
  - Show all abilities
  - Edit button (routes to edit or opens form)
  - Tests: creature-detail.spec.ts
- [ ] T044 [P] [US1] Create localStorage adapter (fallback): `frontend-angular/src/app/adapters/creature/creature.storage.ts`
  - CreatureStorageService implements CreatureRepository
  - Fallback when API unavailable
  - localStorage key: 'beastery_creatures'
  - JSON serialization/deserialization

### Frontend Tests for US1

- [ ] T045 [P] [US1] Write BeasteryService tests: `frontend-angular/src/app/features/beastery/services/beastery.service.spec.ts`
  - Test: createCreature() calls repository adapter
  - Test: listCreatures() returns list and updates signal
  - Test: error handling on API failure
- [ ] T046 [P] [US1] Write beastery signal tests: `frontend-angular/src/app/features/beastery/state/beastery.signal.spec.ts`
  - Test: creaturesSignal updates on loadCreatures()
  - Test: filteredCreaturesSignal computes correctly with search
  - Test: selectCreature() updates selectedCreatureSignal
- [ ] T047 [P] [US1] Write creature-list component tests: `frontend-angular/src/app/features/beastery/components/creature-list/creature-list.component.spec.ts`
  - Test: renders creatures from signal
  - Test: search filters creatures
  - Test: click creature selects it
  - Test: loading spinner shown during load
- [ ] T048 [P] [US1] Write creature-form component tests: `frontend-angular/src/app/features/beastery/components/creature-form/creature-form.component.spec.ts`
  - Test: form submission calls service
  - Test: validation errors display
  - Test: required fields enforced
  - Test: ability add/remove rows work
- [ ] T049 [P] [US1] Write creature detail component tests: `frontend-angular/src/app/features/beastery/components/creature-detail/creature-detail.component.spec.ts`
  - Test: displays creature from signal
  - Test: all abilities shown

**Checkpoint US1**: Create, read, and persist creatures working end-to-end. Backend events stored in H2, snapshots updated, API responding, Angular UI showing creature list, form, and details. Users can refresh page and creatures persist.

---

## Phase 4: User Story 2 - Select Creatures from Beastery When Creating a Battle (Priority: P1)

**Goal**: When starting a battle, users can select creatures from the beastery instead of manually creating them. Selected creatures are added as independent copies, with battle modifications not affecting the beastery.

**Acceptance**: User starts battle, selects "Use from Beastery", picks a creature, creature added to battle with all stats intact, modifying battle creature doesn't affect beastery original.

**Independent Test**: Create creature in beastery, start battle, select creature, damage it in combat, verify beastery creature unchanged.

### Backend - Creature Copy & Battle Integration

- [ ] T050 [US2] Implement creature snapshot/copy logic: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/creature/CreatureCopy.kt`
  - Static method: deepCopy(creature: Creature): Creature
  - Creates independent copy with new ID but same stats/abilities
  - Preserves original creature data at snapshot moment
- [ ] T051 [US2] Create battle integration use case: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/creature/usecase/SelectCreatureForBattleUseCase.kt`
  - Input: creatureId (from beastery), battleId, userId
  - Output: copied creature for battle
  - Logic: Get creature from beastery, create deep copy, return copy with new ID for battle
  - Uses: CreatureRepository port
- [ ] T052 [US2] Implement GET /api/creatures/{id}/for-battle endpoint: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/rest/CreatureController.kt`
  - Returns deep copy of creature (new ID) instead of original
  - Used by battle system when user selects from beastery
  - Response: CreatureResponse with copied creature data

### Frontend - Battle Creature Selection UI

- [ ] T053 [P] [US2] Create battle creature selector component: `frontend-angular/src/app/features/battle/components/creature-selector/creature-selector.component.ts`
  - Modal/dialog to select creature from beastery
  - Displays creature list with search
  - User selects one → emits selected creature
  - Also allows manual creature creation (existing flow)
  - Tests: creature-selector.spec.ts
- [ ] T054 [US2] Integrate creature selector into battle creation: `frontend-angular/src/app/features/battle/pages/battle-create.page.ts`
  - Add button: "Add creature" with options: "Create new" or "From beastery"
  - If "From beastery" → show selector (component from T053)
  - Selected creature added to battle via existing battle service
  - Verify selected creature has new ID (copy, not reference)

### Integration Tests

- [ ] T055 [P] [US2] Write integration test for creature selection in battle: `backend/src/test/kotlin/de/thomcz/pap/battle/backend/CreatureUserStory2IntegrationTest.kt`
  - Create creature in beastery
  - Create battle
  - Call /api/creatures/{id}/for-battle → get copied creature
  - Verify copy has different ID but same stats
  - Modify copy (damage it)
  - Verify beastery original unchanged
- [ ] T056 [P] [US2] Write end-to-end test for creature selection UI: `frontend-angular/src/app/features/battle/e2e/creature-selection.e2e.ts`
  - Create creature via beastery form
  - Start new battle
  - Click "Add creature" → "From beastery"
  - Select creature from list
  - Verify creature added to battle
  - Verify creature in battle has independent copy (modifications don't affect beastery)

**Checkpoint US2**: Users can select creatures from beastery when creating battles. Creatures are copied (independent instances), and battle modifications don't affect the beastery original. US1 and US2 both work independently.

---

## Phase 5: User Story 3 - Manage Creature Library (Priority: P2)

**Goal**: Users can edit and delete creatures in the beastery. Changes to creatures affect future battle selections but not past battles (which have snapshots).

**Acceptance**: User edits creature (name, stats, abilities), changes persist and reflect in list. User deletes creature, it's removed from beastery and cannot be selected for new battles, but past battles unaffected.

**Independent Test**: Create creature, edit name/HP, verify changes in list, delete creature, verify removed, verify past battle unaffected.

### Domain Model - Update & Delete

- [ ] T057 [P] [US3] Write update/delete tests: `backend/src/test/kotlin/de/thomcz/pap/battle/backend/domain/creature/CreatureTest.kt`
  - Test: updating creature stats succeeds
  - Test: updating deleted creature fails
  - Test: deleting creature succeeds
  - Test: querying returns non-deleted creatures only
- [ ] T058 [P] [US3] Implement update methods in Creature aggregate: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/creature/Creature.kt`
  - Method: update(name, hitPoints, armorClass, abilities) → emits UpdatedEvent
  - Validates all fields (same as create)
  - Throws exception if deleted=true

### Use Cases - Update & Delete

- [ ] T059 [US3] Implement UpdateCreatureUseCase: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/creature/usecase/UpdateCreatureUseCase.kt`
  - Input: CreatureId, userId, UpdateCreatureRequest (all fields optional)
  - Output: updated Creature
  - Logic: Load creature, verify ownership, call update() method, save, return updated
  - Throws: EntityNotFoundException, ValidationException, UnauthorizedException
- [ ] T060 [US3] Implement DeleteCreatureUseCase: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/creature/usecase/DeleteCreatureUseCase.kt`
  - Input: CreatureId, userId
  - Output: void (204 No Content on success)
  - Logic: Load creature, verify ownership, call markDeleted() method, save
  - Event: CreatureDeletedEvent emitted
  - Note: Hard delete per clarification (creature ID reusable, but history in events)

### REST Endpoints

- [ ] T061 [P] [US3] Write REST tests for PUT /api/creatures/{id}: `backend/src/test/kotlin/de/thomcz/pap/battle/backend/infrastructure/rest/CreatureControllerTest.kt`
  - Test: PUT with valid data → 200 with updated creature
  - Test: PUT with invalid HP → 400
  - Test: PUT non-existent → 404
  - Test: PUT other user's creature → 403/404
  - Test: partial updates (only name) allowed
- [ ] T062 [P] [US3] Write REST tests for DELETE /api/creatures/{id}: `backend/src/test/kotlin/de/thomcz/pap/battle/backend/infrastructure/rest/CreatureControllerTest.kt`
  - Test: DELETE existing → 204
  - Test: DELETE non-existent → 404
  - Test: DELETE other user's creature → 403/404
  - Test: subsequent GET returns 404 (hard deleted)

### Controller Implementation

- [ ] T063 [US3] Add PUT /api/creatures/{id} endpoint to CreatureController: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/rest/CreatureController.kt`
  - Calls UpdateCreatureUseCase
  - Accepts UpdateCreatureRequest (all optional fields)
  - Returns CreatureResponse
  - Extract userId from JWT
- [ ] T064 [US3] Add DELETE /api/creatures/{id} endpoint to CreatureController: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/rest/CreatureController.kt`
  - Calls DeleteCreatureUseCase
  - Returns 204 No Content on success
  - Extract userId from JWT

### Frontend - Edit & Delete

- [ ] T065 [P] [US3] Create creature edit component: `frontend-angular/src/app/features/beastery/components/creature-edit/creature-edit.component.ts`
  - Similar to create form but pre-populated with existing creature data
  - Form fields: name, hitPoints, armorClass, abilities (with add/remove)
  - Submit → updateCreature() service call
  - Cancel → back to detail or list
  - Tests: creature-edit.spec.ts
- [ ] T066 [US3] Implement updateCreature() in BeasteryService: `frontend-angular/src/app/features/beastery/services/beastery.service.ts`
  - Call PUT /api/creatures/{id} via repository adapter
  - Update creaturesSignal with updated creature
- [ ] T067 [US3] Implement deleteCreature() in BeasteryService: `frontend-angular/src/app/features/beastery/services/beastery.service.ts`
  - Call DELETE /api/creatures/{id} via repository adapter
  - Remove from creaturesSignal
  - Show confirmation dialog before deletion
- [ ] T068 [US3] Add edit/delete buttons to creature detail component: `frontend-angular/src/app/features/beastery/components/creature-detail/creature-detail.component.ts`
  - Edit button → navigate to creature-edit or open form modal
  - Delete button → show confirmation, call deleteCreature()
  - Update detail when creature updated (reload from signal)
- [ ] T069 [P] [US3] Write service tests for update/delete: `frontend-angular/src/app/features/beastery/services/beastery.service.spec.ts`
  - Test: updateCreature() calls adapter and updates signal
  - Test: deleteCreature() calls adapter and removes from signal
  - Test: error handling on update/delete
- [ ] T070 [P] [US3] Write component tests for edit/delete: `frontend-angular/src/app/features/beastery/components/creature-edit/creature-edit.component.spec.ts`
  - Test: form pre-populated with existing creature data
  - Test: submit calls service
  - Test: validation errors display
  - Test: delete confirmation shown

**Checkpoint US3**: Edit and delete creatures working. Updates to creatures reflect in beastery list and future battle selections. Deletions remove from beastery but don't affect past battles (with snapshots). All three stories (US1, US2, US3) functional and independent.

---

## Phase 6: User Story 4 - Copy/Duplicate Creatures (Priority: P3)

**Goal**: Users can quickly create variations of existing creatures by duplicating them. Duplicated creatures have auto-generated names and are fully independent.

**Acceptance**: User selects creature, clicks duplicate, new creature created with "[Original] Copy" name, can be edited independently.

**Independent Test**: Create creature "Orc", duplicate it, verify "Orc Copy" created, edit duplicate, verify original unchanged.

### Domain Model - Duplication

- [ ] T071 [P] [US4] Write duplication test: `backend/src/test/kotlin/de/thomcz/pap/battle/backend/domain/creature/CreatureTest.kt`
  - Test: duplicating creature succeeds
  - Test: duplicate has different ID
  - Test: duplicate has same stats/abilities as original
  - Test: duplicate has "[Original] Copy" name (or custom name if provided)
- [ ] T072 [P] [US4] Implement duplicate method in Creature: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/creature/Creature.kt`
  - Method: duplicate(customName: String? = null): Creature
  - Returns new Creature with new ID, copied stats/abilities
  - If customName provided, use it; else "[name] Copy"

### Use Case

- [ ] T073 [US4] Implement DuplicateCreatureUseCase: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/creature/usecase/DuplicateCreatureUseCase.kt`
  - Input: CreatureId (source), userId, customName (optional)
  - Output: CreatureId (new creature)
  - Logic: Load creature, verify ownership, call duplicate() method, save, return new ID
  - Event: CreatureCreatedEvent emitted for duplicate

### REST Endpoint

- [ ] T074 [P] [US4] Write REST test for POST /api/creatures/{id}/duplicate: `backend/src/test/kotlin/de/thomcz/pap/battle/backend/infrastructure/rest/CreatureControllerTest.kt`
  - Test: POST /api/creatures/{id}/duplicate → 201 with duplicated creature
  - Test: POST with custom name → 201 with custom name
  - Test: POST non-existent → 404
  - Test: POST other user's creature → 403/404

### Controller Implementation

- [ ] T075 [US4] Add POST /api/creatures/{id}/duplicate endpoint: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/rest/CreatureController.kt`
  - Calls DuplicateCreatureUseCase
  - Accepts request body with optional name
  - Returns CreatureResponse of new duplicate creature
  - Extract userId from JWT

### Frontend - Duplication

- [ ] T076 [P] [US4] Create creature duplicate dialog: `frontend-angular/src/app/features/beastery/components/creature-duplicate/creature-duplicate.component.ts`
  - Modal showing creature to duplicate
  - Text field for custom name (pre-filled with "[name] Copy")
  - Submit button → calls duplicateCreature() service
  - Tests: creature-duplicate.spec.ts
- [ ] T077 [US4] Implement duplicateCreature() in BeasteryService: `frontend-angular/src/app/features/beastery/services/beastery.service.ts`
  - Call POST /api/creatures/{id}/duplicate via repository adapter
  - Reload creatures list (or add new creature to signal)
  - Show success message
- [ ] T078 [US4] Add duplicate button to creature detail component: `frontend-angular/src/app/features/beastery/components/creature-detail/creature-detail.component.ts`
  - Duplicate button → open creature-duplicate dialog
  - On success → navigate to new creature detail or reload list
- [ ] T079 [P] [US4] Write service test for duplication: `frontend-angular/src/app/features/beastery/services/beastery.service.spec.ts`
  - Test: duplicateCreature() calls adapter and adds to signal
  - Test: error handling on duplicate
- [ ] T080 [P] [US4] Write component tests for duplicate dialog: `frontend-angular/src/app/features/beastery/components/creature-duplicate/creature-duplicate.component.spec.ts`
  - Test: dialog shows creature name
  - Test: name field pre-filled with "[name] Copy"
  - Test: submit calls service
  - Test: allows custom name entry

**Checkpoint US4**: Duplication working. Users can create variants of creatures with custom names. All four user stories (US1-US4) complete and independent.

---

## Phase 7: Integration & Cross-Cutting Concerns

**Purpose**: E2E testing, performance validation, error handling, logging, and production readiness

### Error Handling & Validation

- [ ] T081 [P] Create comprehensive validation test suite: `backend/src/test/kotlin/de/thomcz/pap/battle/backend/CreatureValidationTest.kt`
  - Test all validation constraints from FR-001 through FR-012
  - Test error responses (400, 401, 403, 404, 409, 500)
  - Test field-level validation errors
  - Test user authorization failures

### Logging & Observability

- [ ] T082 [P] Add logging to CreatureController: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/rest/CreatureController.kt`
  - Log all endpoints: INFO on success, WARN on validation errors, ERROR on exceptions
  - Include user ID, creature ID, operation in logs
  - Use SLF4J with Logback
- [ ] T083 [P] Add logging to application service: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/application/creature/CreatureApplicationService.kt`
  - Log use case execution, results, exceptions
  - Include timing information for performance monitoring

### Performance Testing

- [ ] T084 Create load test for creature operations: `backend/src/test/kotlin/de/thomcz/pap/battle/backend/CreaturePerformanceTest.kt`
  - Test create 100 creatures: should complete < 2 minutes
  - Test list 50 creatures: should complete < 5 seconds
  - Test search in 50 creatures: should complete < 5 seconds
  - Verify API p95 response time < 300ms
  - Check H2 indexes are being used

### End-to-End Testing

- [ ] T085 [P] Create full E2E test scenario: `frontend-angular/src/app/features/beastery/e2e/beastery-full-flow.e2e.ts`
  - User signs in
  - Creates creature "Goblin"
  - Lists creatures (search test)
  - Views creature details
  - Edits creature (change HP)
  - Creates duplicate "Goblin Copy"
  - Starts battle
  - Selects creature from beastery
  - Verifies creature added to battle with copy
  - Modifies creature in battle (damage)
  - Verifies beastery original unchanged
  - Deletes creature from beastery
  - Verifies new battles cannot use deleted creature
  - Verifies old battle still has copy

### Accessibility & UX Polish

- [ ] T086 [P] Verify accessibility compliance: `frontend-angular/src/app/features/beastery/`
  - All form inputs have labels
  - Buttons have aria-labels
  - Error messages announced to screen readers
  - Keyboard navigation works (Tab, Enter, Escape)
  - Focus indicators visible
  - Color contrast >= 4.5:1

### Documentation

- [ ] T087 Update creature beastery documentation: `docs/CREATURE_BEASTERY.md`
  - API documentation (endpoints, request/response formats)
  - UI screenshots and workflows
  - Database schema diagram
  - Event sourcing explanation
  - Developer guide (extending feature)

### Final Verification

- [ ] T088 Run full test suite and generate coverage report: `backend/`
  - Execute: `./gradlew test --coverage`
  - Verify 80%+ coverage overall
  - Domain: 100%, Application: 90%+, Adapter: 80%+
  - Generate HTML report: `build/reports/jacoco/`
- [ ] T089 Run frontend test suite: `frontend-angular/`
  - Execute: `npm test -- --code-coverage`
  - Verify 80%+ coverage overall
  - Component tests all pass
- [ ] T090 [P] Lint and format validation: `backend/` and `frontend-angular/`
  - Backend: `./gradlew ktlint`, `./gradlew detekt`
  - Frontend: `npm run lint`, `npm run format`
  - Fix all violations

**Checkpoint Final**: All code linted and formatted, tests passing with 80%+ coverage, E2E flows verified, documentation complete, performance targets met, accessibility verified, production-ready.

---

## Task Dependencies & Parallel Opportunities

### Critical Path (Sequential)

1. **Phase 1**: Setup (T001-T010) → All others depend
2. **Phase 2**: Foundation (T011-T017) → Required before any story
3. **Phase 3 (US1)**: Core CRUD (T018-T049) → Foundation for US2-US4
4. **Phase 4 (US2)**: Battle integration (T050-T056) → Depends on US1
5. **Phase 5 (US3)**: Edit/Delete (T057-T070) → Can start after US1
6. **Phase 6 (US4)**: Duplicate (T071-T080) → Can start after US1
7. **Phase 7**: Polish & E2E (T081-T090) → All stories must complete first

### Parallel Opportunities (Same Phase)

**Phase 1**: All setup tasks can run in parallel (T001-T010)

**Phase 2**:
- T011 (database) || T013-T014 (domain objects) || T015-T016 (ports)
- T017 (auth) can run in parallel

**Phase 3 (US1)**:
- Backend tests (T018-T020) || Frontend setup (T036-T038)
- Domain implementation (T021) || Backend integration (T027-T028)
- REST tests (T029-T031) || Frontend components (T036-T044)
- Frontend tests (T045-T049) can run in parallel

**Phase 5 (US3)**:
- Backend update/delete (T057-T064) || Frontend edit/delete (T065-T070)

**Phase 6 (US4)**: All tasks can run in parallel with US3 work

**Phase 7**:
- Tests (T081, T085) || Logging (T082-T083) || Docs (T087)

### MVP Scope

**Minimum Viable Product = Phase 3 (US1 only)**:
- Create creatures with name/HP/AC (required)
- Store persistently (H2 + event sourcing)
- List creatures (with search)
- View creature details
- All with 80%+ test coverage

Estimated: 20-30 days (backend 10-15 days, frontend 10-15 days, parallel)

**Phase 1 MVP**: Phase 3 + Phase 4 (select from beastery in battles) = Feature complete for battle integration. Estimated additional: 5-10 days.

**Full Feature**: All phases (Phase 1-7) with US1-US4 and polish. Estimated additional: 10-15 days.

---

## Summary

- **Total Tasks**: 90
- **Backend Tasks**: ~45
- **Frontend Tasks**: ~35
- **Shared/Docs**: ~10

### Tasks per User Story

- **US1 (P1)**: T018-T049 (32 tasks) - Create & manage creatures, core CRUD
- **US2 (P1)**: T050-T056 (7 tasks) - Select from beastery in battles
- **US3 (P2)**: T057-T070 (14 tasks) - Edit & delete creatures
- **US4 (P3)**: T071-T080 (10 tasks) - Duplicate creatures
- **Setup & Foundation**: T001-T017 (17 tasks)
- **Polish & E2E**: T081-T090 (10 tasks)

### Architecture Validation

✅ All tasks maintain hexagonal architecture (domain/application/infrastructure separation)
✅ TDD enforced (tests before implementation in each phase)
✅ 80%+ coverage targets set per layer
✅ No framework dependencies in domain layer
✅ Event sourcing integrated (H2 event store + snapshots)
✅ User isolation enforced (userId in all queries)

---

**Next Step**: Begin Phase 1 setup tasks. Phase 2 foundation must complete before starting any user story implementation.
