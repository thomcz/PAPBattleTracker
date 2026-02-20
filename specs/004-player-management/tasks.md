# Implementation Tasks: Player Management

**Feature**: 004-player-management | **Branch**: `004-player-management` | **Date**: 2026-02-19

**Overview**: Comprehensive task list for implementing player character management with CRUD operations, event sourcing persistence, and Angular UI integration. Tasks are organized by user story with test-first (TDD) approach.

---

## Executive Summary

| Metric | Value |
|--------|-------|
| **Total Tasks** | 48 |
| **Backend Tasks** | 24 |
| **Frontend Tasks** | 20 |
| **Integration Tasks** | 4 |
| **Phases** | 7 |
| **User Stories** | 4 (P1, P2, P3, P3) |
| **MVP Scope** | Phase 3 (User Story 1 only) |
| **Estimated Duration** | 3-4 weeks |

---

## Task Dependencies & Execution Strategy

### Story Completion Order (Sequential)
```
Phase 3: User Story 1 (Create Player) - P1
    ↓ (depends on)
Phase 4: User Story 2 (View/Select Players) - P2
    ↓ (depends on)
Phase 5 & 6: User Stories 3 & 4 (Edit/Delete) - P3 [can run in parallel]
```

### Parallel Opportunities Within Each Story
- Backend and Frontend can be developed in parallel (different files)
- Unit tests can be written in parallel with implementation
- Components with no dependencies can be built in parallel

### MVP Delivery Path
**Minimal Viable Product (2 weeks)**:
- Complete Phase 1, 2, and 3
- Delivers: User can create players, view them in list (Story 1 + partial Story 2)
- Skip: Edit, Delete features (Phase 5-6)
- Production Ready: Yes, supports core reusability value

---

## Phase 1: Setup & Initialization

### Phase Goal
Initialize project structure, create base classes, and set up testing frameworks for both backend and frontend.

### Phase Tasks

- [ ] T001 Create backend player domain directory structure at `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/player/`
- [ ] T002 Create frontend player core directory structure at `frontend-angular/src/app/core/player/`
- [ ] T003 Create frontend player features directory at `frontend-angular/src/app/features/player-management/`
- [ ] T004 Create player adapter directories at `frontend-angular/src/app/adapters/player/`
- [ ] T005 Create test directories: `backend/src/test/kotlin/de/thomcz/pap/battle/backend/domain/player/`
- [ ] T006 Create test directories: `frontend-angular/src/app/core/player/` with `.spec.ts` files
- [ ] T007 [P] Create base event class for event sourcing at `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/base/BaseEvent.kt`
- [ ] T008 [P] Create base aggregate class at `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/base/BaseAggregate.kt`
- [ ] T009 [P] Create event repository port interface at `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/base/EventRepository.kt`
- [ ] T010 Set up Angular testing infrastructure (Jasmine/Karma config update if needed)

---

## Phase 2: Foundational Infrastructure

### Phase Goal
Establish shared infrastructure, database layer, authentication integration, and domain layer base classes needed for all user stories.

### Phase Tasks

**Backend Event Store Setup**:
- [ ] T011 Create H2 event store schema and migrations at `backend/src/main/resources/db/migration/`
- [ ] T012 Implement EventStore JPA entity at `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/persistence/EventStoreEntity.kt`
- [ ] T013 Implement EventStore H2 adapter at `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/persistence/H2EventStore.kt`
- [ ] T014 Create event serialization/deserialization utilities at `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/persistence/EventSerializer.kt`

**Backend Security & Context**:
- [ ] T015 [P] Create PlayerPort interface (repository port) at `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/player/PlayerPort.kt`
- [ ] T016 [P] Create SessionContext integration at `backend/src/main/kotlin/de/thomcz/pap/battle/backend/application/player/SessionContextProvider.kt`
- [ ] T017 [P] Create error handling for player operations at `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/rest/PlayerExceptionHandler.kt`

**Frontend Domain Setup**:
- [ ] T018 [P] Create empty player domain module structure with barrel exports at `frontend-angular/src/app/core/player/index.ts`
- [ ] T019 [P] Create HTTP interceptor setup for player API calls (or reuse existing) at `frontend-angular/src/app/adapters/http/`
- [ ] T020 Create Angular testing module setup for player tests at `frontend-angular/src/testing/player-test.module.ts`

---

## Phase 3: User Story 1 - Create a New Player (P1)

### Story Goal
Enable game masters to create player character templates with name, class, level, and max HP, persisted via event sourcing.

### Independent Test Criteria
✅ Can be tested independently by creating a player via form/API, saving to database, and verifying appearance in player list
✅ Does NOT depend on Story 2 (list display is minimal)
✅ Delivers MVP value: users can build their player roster

---

### Story 3.1: Backend Tests (TDD - Tests First)

- [ ] T021 [US1] Create Player aggregate unit tests at `backend/src/test/kotlin/de/thomcz/pap/battle/backend/domain/player/PlayerTest.kt`
  - Test: Valid player creation with all fields
  - Test: Player creation rejects invalid level (< 1 or > 20)
  - Test: Player creation rejects invalid maxHp (< 1 or > 1000)
  - Test: Player creation rejects empty name
  - Coverage target: 100% of Player domain logic

- [ ] T022 [US1] Create CreatePlayerUseCase unit tests at `backend/src/test/kotlin/de/thomcz/pap/battle/backend/domain/player/CreatePlayerUseCaseTest.kt`
  - Test: Valid player creation generates PlayerCreated event
  - Test: PlayerCreated event stored to repository
  - Test: Invalid input raises exception with error message
  - Coverage target: 100% of use case logic

- [ ] T023 [US1] Create PlayerRepository adapter tests at `backend/src/test/kotlin/de/thomcz/pap/battle/backend/infrastructure/persistence/player/PlayerRepositoryTest.kt`
  - Test: Save PlayerCreated event persists to H2
  - Test: Event retrieval reconstructs Player state
  - Test: Query by session ID returns correct players
  - Coverage target: ≥90%

- [ ] T024 [US1] Create PlayerController REST endpoint tests at `backend/src/test/kotlin/de/thomcz/pap/battle/backend/infrastructure/rest/player/PlayerControllerTest.kt`
  - Test: POST /api/sessions/{sessionId}/players creates player with valid data (HTTP 201)
  - Test: POST returns 400 with validation error message for invalid data
  - Test: POST returns 401 if not authenticated
  - Test: POST returns 403 if user not authorized for session
  - Test: Response includes playerId and all fields
  - Coverage target: ≥80%

---

### Story 3.2: Backend Implementation

**Domain Layer - Player Aggregate**:
- [ ] T025 [US1] Create Player value objects (PlayerId, PlayerName, CharacterClass) at `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/player/PlayerValueObjects.kt`
  - Implement: PlayerId with UUID generation
  - Implement: PlayerName with validation (1-100 chars, non-empty)
  - Implement: CharacterClass with validation (1-50 chars, non-empty)

- [ ] T026 [US1] Create domain events at `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/player/PlayerEvents.kt`
  - Implement: PlayerCreated event (aggregateId, sessionId, name, class, level, maxHp, timestamp, version)
  - Implement: PlayerUpdated event (aggregateId, sessionId, changes map, timestamp, version)
  - Implement: PlayerDeleted event (aggregateId, sessionId, timestamp, version)

- [ ] T027 [US1] Create Player aggregate root at `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/player/Player.kt`
  - Implement: Aggregate with immutable state (playerId, sessionId, name, class, level, maxHp, isDeleted, events list)
  - Implement: Factory method `create()` that returns (Player, PlayerCreated event)
  - Implement: Event replay method `fromEvents()` that reconstructs Player from event list
  - Implement: Validation in constructor (level 1-20, maxHp 1-1000, non-empty name/class)

**Application Layer - Use Cases**:
- [ ] T028 [US1] Create CreatePlayerUseCase at `backend/src/main/kotlin/de/thomcz/pap/battle/backend/application/player/CreatePlayerUseCase.kt`
  - Signature: `execute(sessionId, name, characterClass, level, maxHp): PlayerId`
  - Logic: Validate session exists, call Player.create(), save event to repository
  - Error handling: Throw custom exceptions with descriptive messages

**Infrastructure Layer - Persistence**:
- [ ] T029 [US1] Create JPA Player entity at `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/persistence/player/PlayerEntity.kt`
  - Fields: playerId, sessionId, name, characterClass, level, maxHp, isDeleted, createdAt, updatedAt

- [ ] T030 [US1] Create PlayerRepository H2 adapter at `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/persistence/player/PlayerRepositoryAdapter.kt`
  - Implement: Extends PlayerPort interface
  - Method: `save(event: PlayerEvent)` → serializes and stores to event store
  - Method: `findById(playerId, sessionId): Player?` → reconstructs from events
  - Method: `findBySessionId(sessionId): List<Player>` → filters deleted players
  - Implement: Event serialization to JSON using Jackson

**Infrastructure Layer - REST API**:
- [ ] T031 [US1] Create PlayerController REST adapter at `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/rest/player/PlayerController.kt`
  - Endpoint: `POST /api/sessions/{sessionId}/players` → CreatePlayerRequest → PlayerDto (HTTP 201)
  - Endpoint: `GET /api/sessions/{sessionId}/players` → List<PlayerDto> (HTTP 200)
  - Validation: Verify authentication (JWT), verify session ownership (authorization)
  - Response: Include playerId, name, characterClass, level, maxHp, createdAt, updatedAt

- [ ] T032 [US1] Create DTOs for REST at `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/rest/player/PlayerDtos.kt`
  - CreatePlayerRequest: name, characterClass, level, maxHp (all required, with validation annotations)
  - PlayerDto: playerId, sessionId, name, characterClass, level, maxHp, isDeleted, createdAt, updatedAt
  - Include: JSON serialization/deserialization annotations

---

### Story 3.3: Frontend Tests (TDD - Tests First)

- [ ] T033 [US1] Create Player domain model unit tests at `frontend-angular/src/app/core/player/domain/models/player.model.spec.ts`
  - Test: CreatePlayerCommand creates with valid parameters
  - Test: Player interface type validation
  - Coverage target: 100%

- [ ] T034 [US1] Create CreatePlayerUseCase tests at `frontend-angular/src/app/core/player/domain/use-cases/create-player.use-case.spec.ts`
  - Test: execute() calls PlayerRepository.create()
  - Test: Returns Observable<Player>
  - Test: Handles repository errors
  - Coverage target: 100%

- [ ] T035 [US1] Create PlayerRepository port tests at `frontend-angular/src/app/core/player/domain/ports/player.repository.spec.ts`
  - Test: Mock repository implements interface contract
  - Coverage target: 100%

- [ ] T036 [US1] Create PlayerApiAdapter tests at `frontend-angular/src/app/adapters/player/api/player.api.adapter.spec.ts`
  - Test: create() calls POST /api/sessions/{sessionId}/players
  - Test: Request body includes name, characterClass, level, maxHp
  - Test: Returns Observable<Player> from response
  - Test: Handles HTTP errors gracefully
  - Coverage target: ≥90%

- [ ] T037 [US1] Create PlayerStore tests at `frontend-angular/src/app/core/player/state/player.store.spec.ts`
  - Test: Store initialized with empty players signal
  - Test: addPlayer() updates players signal
  - Test: addPlayer() filters deleted players
  - Test: setSession() updates current session context
  - Coverage target: ≥90%

- [ ] T038 [US1] Create PlayerFormComponent tests at `frontend-angular/src/app/features/player-management/player-form/player-form.component.spec.ts`
  - Test: Form renders with 4 input fields (name, class, level, maxHp)
  - Test: Form validation: name required
  - Test: Form validation: level between 1-20
  - Test: Form validation: maxHp between 1-1000
  - Test: Submit calls CreatePlayerUseCase
  - Test: Success message displayed on creation
  - Test: Error message displayed on validation failure
  - Coverage target: ≥80%

---

### Story 3.4: Frontend Implementation

**Domain Layer**:
- [ ] T039 [US1] Create Player domain model at `frontend-angular/src/app/core/player/domain/models/player.model.ts`
  - Interface: Player (playerId, sessionId, name, characterClass, level, maxHp, isDeleted, createdAt, updatedAt)
  - Class: CreatePlayerCommand (sessionId, name, characterClass, level, maxHp)
  - Class: UpdatePlayerCommand (sessionId, playerId, changes)
  - Class: DeletePlayerCommand (sessionId, playerId)

**Domain Use Cases**:
- [ ] T040 [US1] Create CreatePlayerUseCase at `frontend-angular/src/app/core/player/domain/use-cases/create-player.use-case.ts`
  - Signature: `execute(command: CreatePlayerCommand): Observable<Player>`
  - Logic: Call playerRepository.create(command)
  - Error handling: Pass through repository errors

**Domain Ports**:
- [ ] T041 [US1] Create PlayerRepository port at `frontend-angular/src/app/core/player/domain/ports/player.repository.ts`
  - Abstract methods: create(), getAll(), getById(), update(), delete()
  - Return types: Observable<Player>

**Adapters**:
- [ ] T042 [US1] Create PlayerApiAdapter at `frontend-angular/src/app/adapters/player/api/player.api.adapter.ts`
  - Implement: Extends PlayerRepository
  - create(command): POST /api/sessions/{sessionId}/players
  - getAll(sessionId): GET /api/sessions/{sessionId}/players
  - Inject: HttpClient with JWT interceptor

**State Management**:
- [ ] T043 [US1] Create PlayerStore with Signals at `frontend-angular/src/app/core/player/state/player.store.ts`
  - Signal: playersSignal (Player[] state)
  - Signal: selectedSessionIdSignal (current session)
  - Computed: players() selector (filters deleted)
  - Method: addPlayer(player) → updates signal
  - Method: setSession(sessionId) → updates context
  - Inject: CreatePlayerUseCase, GetPlayersUseCase

**UI Components**:
- [ ] T044 [US1] Create player-form component at `frontend-angular/src/app/features/player-management/player-form/player-form.component.ts`
  - Standalone component with reactive form (FormGroup)
  - Fields: name (required, max 100), characterClass (required, max 50), level (required, 1-20), maxHp (required, 1-1000)
  - Submit: Call CreatePlayerUseCase, display success message
  - Error display: Show validation messages for each field

- [ ] T045 [US1] Create player-form template at `frontend-angular/src/app/features/player-management/player-form/player-form.component.html`
  - Form with 4 input fields
  - Real-time validation feedback
  - Submit button (disabled if invalid)
  - Success/error messages

**Service Layer** (Optional - if not using store directly):
- [ ] T046 [US1] Create PlayerService at `frontend-angular/src/app/core/player/services/player.service.ts` (if needed)
  - Orchestrate use cases and store
  - Expose: createPlayer(), getPlayers(), etc. as convenience methods

---

### Story 3.5: Integration

- [ ] T047 [US1] Wire PlayerApiAdapter to PlayerRepository in DI container at `frontend-angular/src/app/app.config.ts`
  - Register: PlayerRepository → PlayerApiAdapter
  - Ensure: HttpClient is provided

- [ ] T048 [US1] Create player management feature routing at `frontend-angular/src/app/features/player-management/player-management-routing.module.ts`
  - Route: `/session/:sessionId/players` → PlayerManagementComponent
  - Lazy load: Player feature module

---

## Phase 4: User Story 2 - View and Select Players for Battle (P2)

### Story Goal
Display list of created players and enable selection when creating/editing battles. Fulfill reusability value proposition.

### Independent Test Criteria
✅ Can be tested independently by creating players, navigating to battle creation, verifying selection UI
✅ Depends on: Phase 3 (players must exist to display)
✅ Delivers: Core value of player reusability

---

### Story 4.1: Backend Tests

- [ ] T049 [US2] Create GetPlayersUseCase tests at `backend/src/test/kotlin/de/thomcz/pap/battle/backend/application/player/GetPlayersUseCaseTest.kt`
  - Test: Returns all active players for given sessionId
  - Test: Excludes deleted players
  - Test: Returns empty list if no players exist
  - Test: Correctly filters by session
  - Coverage target: 100%

- [ ] T050 [US2] Create GET endpoint integration tests at `backend/src/test/kotlin/de/thomcz/pap/battle/backend/infrastructure/rest/player/PlayerControllerTest.kt` (append to T024)
  - Test: GET /api/sessions/{sessionId}/players returns list (HTTP 200)
  - Test: List includes all active players for session
  - Test: List excludes deleted players
  - Test: Empty list for session with no players
  - Test: Includes helpful message when list empty

---

### Story 4.2: Backend Implementation

- [ ] T051 [US2] Create GetPlayersUseCase at `backend/src/main/kotlin/de/thomcz/pap/battle/backend/application/player/GetPlayersUseCase.kt`
  - Signature: `execute(sessionId: SessionId): List<Player>`
  - Logic: Query repository for session, filter deleted players
  - Sort: By createdAt timestamp (newest first)

- [ ] T052 [US2] Implement GET endpoints in PlayerController at `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/rest/player/PlayerController.kt`
  - Endpoint: `GET /api/sessions/{sessionId}/players` → List<PlayerDto>
  - Query param: `includeDeleted` (default false) for admin purposes
  - Response: Sorted by creation date, includes total count metadata

---

### Story 4.3: Frontend Tests

- [ ] T053 [US2] Create GetPlayersUseCase tests at `frontend-angular/src/app/core/player/domain/use-cases/get-players.use-case.spec.ts`
  - Test: execute(sessionId) calls PlayerRepository.getAll()
  - Test: Returns Observable<Player[]>
  - Coverage target: 100%

- [ ] T054 [US2] Create PlayerListComponent tests at `frontend-angular/src/app/features/player-management/player-list/player-list.component.spec.ts`
  - Test: Component renders player list from store
  - Test: Displays player name, class, level, maxHp in table/list
  - Test: Shows empty state message when no players
  - Test: Filters deleted players from display
  - Test: Includes select checkboxes or radio buttons for battle integration
  - Coverage target: ≥80%

---

### Story 4.4: Frontend Implementation

**Use Cases**:
- [ ] T055 [US2] Create GetPlayersUseCase at `frontend-angular/src/app/core/player/domain/use-cases/get-players.use-case.ts`
  - Signature: `execute(sessionId: string): Observable<Player[]>`
  - Logic: Call playerRepository.getAll(sessionId)

**Components**:
- [ ] T056 [US2] Create player-list component at `frontend-angular/src/app/features/player-management/player-list/player-list.component.ts`
  - Standalone component
  - Input: players$ observable from store
  - Display: Table or list with columns: name, class, level, maxHp
  - Selection: Checkboxes or radio buttons for battle player selection
  - Actions: Edit button, Delete button (if story 4 implemented)
  - Empty state: Message "No players yet" with link to create

- [ ] T057 [US2] Create player-list template at `frontend-angular/src/app/features/player-management/player-list/player-list.component.html`
  - Table/list display with player data
  - Checkboxes for selection
  - Action buttons (edit, delete)
  - Empty state message

**Store Updates**:
- [ ] T058 [US2] Update PlayerStore at `frontend-angular/src/app/core/player/state/player.store.ts`
  - Method: loadPlayers(sessionId) → calls GetPlayersUseCase, updates signal
  - Selector: activePlayersSignal() → computed filtered list
  - Method: selectPlayers(playerIds) → for battle integration

---

### Story 4.5: Integration with Battle Creation

- [ ] T059 [US2] Integrate player selection in BattleCreateComponent at `frontend-angular/src/app/features/battle/battle-create/battle-create.component.ts`
  - Add: Player selection field to battle creation form
  - Source: players$ from PlayerStore
  - Type: Multi-select dropdown or checkbox list
  - Update: CreateBattleCommand to include participantPlayerIds
  - Logic: When battle created, selected players are added as participants

- [ ] T060 [US2] Update BattleCreateComponent template to include player selection UI at `frontend-angular/src/app/features/battle/battle-create/battle-create.component.html`
  - Add: Section for "Select Players for Battle"
  - Show: Available players in current session
  - Show: Helpful message if no players available

---

## Phase 5: User Story 3 - Edit Player Information (P3)

### Story Goal
Allow game masters to modify player details (name, class, level, maxHp) when characters advance or mistakes made.

### Independent Test Criteria
✅ Can be tested independently by editing a player and verifying persistence
✅ Depends on: Phase 3 (players must exist to edit)
✅ Delivers: Character progression and correction capability

---

### Story 5.1: Backend Tests

- [ ] T061 [US3] Create UpdatePlayerUseCase tests at `backend/src/test/kotlin/de/thomcz/pap/battle/backend/application/player/UpdatePlayerUseCaseTest.kt`
  - Test: Updates player with valid changes
  - Test: Generates PlayerUpdated event with only changed fields
  - Test: Rejects invalid values (level outside 1-20, etc.)
  - Test: Rejects empty name
  - Test: No changes raises error
  - Coverage target: 100%

- [ ] T062 [US3] Create PUT endpoint integration tests at `backend/src/test/kotlin/de/thomcz/pap/battle/backend/infrastructure/rest/player/PlayerControllerTest.kt` (append)
  - Test: PUT /api/sessions/{sessionId}/players/{playerId} updates player (HTTP 200)
  - Test: Request body accepts partial updates (only changed fields)
  - Test: Response includes updated player
  - Test: Returns 400 for invalid data
  - Test: Returns 404 if player/session not found

---

### Story 5.2: Backend Implementation

- [ ] T063 [US3] Create UpdatePlayerUseCase at `backend/src/main/kotlin/de/thomcz/pap/battle/backend/application/player/UpdatePlayerUseCase.kt`
  - Signature: `execute(sessionId, playerId, updates: Map<String, Any>): Player`
  - Logic: Load player from repository, apply updates, generate PlayerUpdated event
  - Validation: Same as creation for each field
  - Return: Updated Player

- [ ] T064 [US3] Implement PUT endpoint in PlayerController at `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/rest/player/PlayerController.kt`
  - Endpoint: `PUT /api/sessions/{sessionId}/players/{playerId}` → UpdatePlayerRequest → PlayerDto
  - Allow: Partial updates (name, characterClass, level, maxHp)
  - Validate: Each field according to constraints
  - Response: Updated player state

- [ ] T065 [US3] Create UpdatePlayerRequest DTO at `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/rest/player/PlayerDtos.kt` (append)
  - Fields: name (optional), characterClass (optional), level (optional), maxHp (optional)
  - Constraint: At least one field required

---

### Story 5.3: Frontend Tests

- [ ] T066 [US3] Create UpdatePlayerUseCase tests at `frontend-angular/src/app/core/player/domain/use-cases/update-player.use-case.spec.ts`
  - Test: execute(command) calls PlayerRepository.update()
  - Test: Returns Observable<Player>
  - Coverage target: 100%

- [ ] T067 [US3] Create player-edit component tests at `frontend-angular/src/app/features/player-management/player-edit/player-edit.component.spec.ts`
  - Test: Component loads player data from route params
  - Test: Form pre-fills with current player data
  - Test: Form allows editing each field
  - Test: Form validation same as creation
  - Test: Submit calls UpdatePlayerUseCase
  - Test: Success message displayed
  - Test: Changes persist across navigation
  - Coverage target: ≥80%

---

### Story 5.4: Frontend Implementation

**Use Cases**:
- [ ] T068 [US3] Create UpdatePlayerUseCase at `frontend-angular/src/app/core/player/domain/use-cases/update-player.use-case.ts`
  - Signature: `execute(command: UpdatePlayerCommand): Observable<Player>`
  - Logic: Call playerRepository.update(command)

**Components**:
- [ ] T069 [US3] Create player-edit component at `frontend-angular/src/app/features/player-management/player-edit/player-edit.component.ts`
  - Standalone component
  - Input: playerId from route params
  - Load: Player from store/service
  - Form: Same as creation form but with pre-filled values
  - Submit: Call UpdatePlayerUseCase
  - Success: Navigate back to list with success message

- [ ] T070 [US3] Create player-edit template at `frontend-angular/src/app/features/player-management/player-edit/player-edit.component.html`
  - Edit form with pre-filled values
  - Same validation as creation
  - Submit button label: "Save Changes"
  - Cancel button: Return to list

**Store Updates**:
- [ ] T071 [US3] Update PlayerStore at `frontend-angular/src/app/core/player/state/player.store.ts`
  - Method: updatePlayer(updated: Player) → updates signal with new values
  - Ensure: Re-computed signals reflect changes

---

### Story 5.5: Integration

- [ ] T072 [US3] Add player-edit route to routing at `frontend-angular/src/app/features/player-management/player-management-routing.module.ts`
  - Route: `/session/:sessionId/players/:playerId/edit` → PlayerEditComponent

- [ ] T073 [US3] Add edit button to player-list component at `frontend-angular/src/app/features/player-management/player-list/player-list.component.ts` (append to T056)
  - Button: Navigate to edit route on click

---

## Phase 6: User Story 4 - Delete Players (P3)

### Story Goal
Allow game masters to remove players from library with confirmation dialog to prevent accidental deletion.

### Independent Test Criteria
✅ Can be tested independently by deleting a player and verifying removal
✅ Depends on: Phase 3 (players must exist to delete)
✅ Delivers: Library organization and cleanup

---

### Story 6.1: Backend Tests

- [ ] T074 [US4] Create DeletePlayerUseCase tests at `backend/src/test/kotlin/de/thomcz/pap/battle/backend/application/player/DeletePlayerUseCaseTest.kt`
  - Test: Soft deletes player (marks isDeleted = true)
  - Test: Generates PlayerDeleted event
  - Test: Player removed from active list
  - Test: Events preserved (audit trail)
  - Coverage target: 100%

- [ ] T075 [US4] Create DELETE endpoint integration tests at `backend/src/test/kotlin/de/thomcz/pap/battle/backend/infrastructure/rest/player/PlayerControllerTest.kt` (append)
  - Test: DELETE /api/sessions/{sessionId}/players/{playerId}?confirmed=true (HTTP 204)
  - Test: DELETE without confirmed=true returns 400
  - Test: Player no longer appears in list after deletion
  - Test: Returns 404 if player not found

---

### Story 6.2: Backend Implementation

- [ ] T076 [US4] Create DeletePlayerUseCase at `backend/src/main/kotlin/de/thomcz/pap/battle/backend/application/player/DeletePlayerUseCaseTest.kt`
  - Signature: `execute(sessionId, playerId): Unit`
  - Logic: Load player, generate PlayerDeleted event, save to repository
  - Soft delete: isDeleted flag set to true, not hard delete

- [ ] T077 [US4] Implement DELETE endpoint in PlayerController at `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/rest/player/PlayerController.kt`
  - Endpoint: `DELETE /api/sessions/{sessionId}/players/{playerId}?confirmed=true` → HTTP 204
  - Require: Query param `confirmed=true` to prevent accidental deletion
  - Error: Return 400 if confirmed is false or missing

---

### Story 6.3: Frontend Tests

- [ ] T078 [US4] Create DeletePlayerUseCase tests at `frontend-angular/src/app/core/player/domain/use-cases/delete-player.use-case.spec.ts`
  - Test: execute(command) calls PlayerRepository.delete()
  - Test: Returns Observable<void>
  - Coverage target: 100%

- [ ] T079 [US4] Create delete confirmation dialog tests at `frontend-angular/src/app/features/player-management/player-delete-dialog/player-delete-dialog.component.spec.ts`
  - Test: Dialog displays confirmation message with player name
  - Test: "Confirm Delete" button calls DeletePlayerUseCase
  - Test: "Cancel" button closes dialog without deleting
  - Test: Success message shown after deletion
  - Coverage target: ≥85%

---

### Story 6.4: Frontend Implementation

**Use Cases**:
- [ ] T080 [US4] Create DeletePlayerUseCase at `frontend-angular/src/app/core/player/domain/use-cases/delete-player.use-case.ts`
  - Signature: `execute(command: DeletePlayerCommand): Observable<void>`
  - Logic: Call playerRepository.delete(command)

**Components**:
- [ ] T081 [US4] Create delete confirmation dialog at `frontend-angular/src/app/features/player-management/player-delete-dialog/player-delete-dialog.component.ts`
  - Standalone component or Modal service
  - Input: Player data to display
  - Confirm button: Call DeletePlayerUseCase
  - Cancel button: Close without action
  - Success: Remove player from list and show message

- [ ] T082 [US4] Create delete dialog template at `frontend-angular/src/app/features/player-management/player-delete-dialog/player-delete-dialog.component.html`
  - Confirmation message: "Are you sure you want to delete {player.name}?"
  - Warning: "This action cannot be undone"
  - Buttons: "Delete" (danger style), "Cancel"

**Store Updates**:
- [ ] T083 [US4] Update PlayerStore at `frontend-angular/src/app/core/player/state/player.store.ts`
  - Method: deletePlayer(playerId) → removes from signal immediately (optimistic update)
  - Handle: Errors with rollback

---

### Story 6.5: Integration

- [ ] T084 [US4] Add delete button to player-list component at `frontend-angular/src/app/features/player-management/player-list/player-list.component.ts` (append to T056)
  - Button: Opens delete confirmation dialog
  - After confirm: Player removed from list

- [ ] T085 [US4] Implement delete dialog service at `frontend-angular/src/app/core/player/services/player-delete.service.ts`
  - Service: Opens confirmation dialog and handles DeletePlayerUseCase call

---

## Phase 7: Polish & Cross-Cutting Concerns

### Phase Goal
Improve error handling, optimize performance, ensure accessibility, and complete integration testing.

---

### Phase Tasks

**Error Handling & User Feedback**:
- [ ] T086 Create global error handler for player operations at `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/rest/PlayerExceptionHandler.kt` (expand from T017)
  - Handle: ValidationException → 400 with error details
  - Handle: NotFoundException → 404 with message
  - Handle: UnauthorizedException → 403 with message
  - Handle: Generic exceptions → 500 with safe message

- [ ] T087 [P] Create error handling utilities at `frontend-angular/src/app/core/error/error-handler.service.ts`
  - Handle: HTTP errors (4xx, 5xx)
  - Display: User-friendly error messages
  - Log: Errors for debugging
  - Retry: Automatic retry for transient failures

- [ ] T088 [P] Create toast notification service at `frontend-angular/src/app/shared/services/toast.service.ts` (if not exists)
  - Show: Success, error, warning, info messages
  - Auto-dismiss: After 3-5 seconds

**Performance Optimization**:
- [ ] T089 Create database indices for player queries at `backend/src/main/resources/db/migration/`
  - Index: (sessionId, isDeleted) for list queries
  - Index: (sessionId, playerId) for lookups
  - Verify: Query plans with EXPLAIN

- [ ] T090 [P] Implement player list pagination at `backend/src/main/kotlin/de/thomcz/pap/battle/backend/application/player/GetPlayersUseCase.kt` (append to T051)
  - Add: pageSize, pageNumber parameters (optional)
  - Return: Paginated response with total count
  - Default: Show 20 players per page

- [ ] T091 [P] Implement virtual scrolling for large player lists at `frontend-angular/src/app/features/player-management/player-list/player-list.component.ts` (if 20+ players)
  - Use: CDK virtual scroll directive
  - Optimize: Large lists (100+ items)

- [ ] T092 [P] Implement HTTP caching with strategy at `frontend-angular/src/app/adapters/player/api/player.api.adapter.ts`
  - Cache: Player list for 5 minutes (HTTP cache headers)
  - Invalidate: After create/update/delete

**Accessibility & Responsive Design**:
- [ ] T093 Audit player components for WCAG 2.1 AA compliance at `frontend-angular/src/app/features/player-management/`
  - Keyboard navigation: All controls accessible via Tab/Enter
  - Labels: All form fields have associated labels
  - Contrast: Text meets 4.5:1 ratio
  - Screen reader: Meaningful ARIA labels

- [ ] T094 [P] Test responsive design at multiple breakpoints
  - Mobile (320px): Single column layout
  - Tablet (768px): 2-column if applicable
  - Desktop (1920px): Full layout
  - Touch targets: ≥44x44px

- [ ] T095 [P] Create loading state indicators at `frontend-angular/src/app/features/player-management/`
  - Spinner: During API calls
  - Skeleton: While loading list
  - Disabled: Form buttons during submission

**Integration & End-to-End Testing**:
- [ ] T096 Create end-to-end test scenario for full player CRUD at `frontend-angular/src/app/features/player-management/player-management.integration.spec.ts`
  - Test: Create player → view in list → edit → delete → verify removed
  - Navigate: Through all routes
  - Verify: Data persists across navigation

- [ ] T097 [P] Create backend contract tests for API consistency at `backend/src/test/kotlin/de/thomcz/pap/battle/backend/contracts/`
  - Verify: Request/response schemas match OpenAPI spec
  - Verify: HTTP status codes correct
  - Verify: Error responses have consistent format

- [ ] T098 Create documentation in quickstart.md for running tests at `specs/004-player-management/quickstart.md` (append)
  - Backend: `./gradlew test -p backend`
  - Frontend: `npm test` (from frontend-angular/)
  - Coverage: `./gradlew test -p backend` (shows coverage report)

**Battle Integration Verification**:
- [ ] T099 Test battle creation with selected players end-to-end
  - Create players
  - Select in battle creation form
  - Verify: Battle created with selected players
  - Verify: Players appear in battle participant list

- [ ] T100 [P] Test player deletion doesn't break battles
  - Create player
  - Add to battle
  - Delete player
  - Verify: Battle still displays gracefully (player marked as deleted but referenced)

---

## Summary by Phase

| Phase | Goal | Key Tasks | Duration |
|-------|------|-----------|----------|
| **Phase 1** | Setup | T001-T010 (10 tasks) | 1-2 days |
| **Phase 2** | Infrastructure | T011-T020 (10 tasks) | 2-3 days |
| **Phase 3** | Story 1 (Create) | T021-T048 (28 tasks) | 5-7 days |
| **Phase 4** | Story 2 (View/Select) | T049-T060 (12 tasks) | 3-4 days |
| **Phase 5** | Story 3 (Edit) | T061-T073 (13 tasks) | 3-4 days |
| **Phase 6** | Story 4 (Delete) | T074-T085 (12 tasks) | 2-3 days |
| **Phase 7** | Polish | T086-T100 (15 tasks) | 3-4 days |

**Total**: ~48 tasks, ~3-4 weeks for full implementation with comprehensive testing

---

## Task Completion Checklist

Use this checklist to track progress:

```bash
# Phase 1: Setup (10 tasks)
- [ ] T001-T010 completed

# Phase 2: Infrastructure (10 tasks)
- [ ] T011-T020 completed

# Phase 3: User Story 1 (28 tasks)
- [ ] T021-T048 completed
- [ ] 80%+ code coverage achieved
- [ ] All acceptance scenarios passing

# Phase 4: User Story 2 (12 tasks)
- [ ] T049-T060 completed
- [ ] Player selection in battle creation working

# Phase 5: User Story 3 (13 tasks)
- [ ] T061-T073 completed
- [ ] Edit persistence verified

# Phase 6: User Story 4 (12 tasks)
- [ ] T074-T085 completed
- [ ] Delete with confirmation working

# Phase 7: Polish (15 tasks)
- [ ] T086-T100 completed
- [ ] All tests passing (target: 80%+ coverage)
- [ ] Accessibility audit passed
- [ ] Performance benchmarks met
- [ ] Documentation complete
```

---

## Success Criteria

✅ **All user stories implemented**:
- P1: Create players (foundational)
- P2: View/select for battles (reusability)
- P3: Edit players (progression)
- P3: Delete players (maintenance)

✅ **Quality gates met**:
- 80% minimum code coverage
- All acceptance scenarios passing
- All tests green
- No unresolved bugs

✅ **Constitutional compliance**:
- Hexagonal architecture followed
- TDD approach used (tests first)
- User experience consistency maintained
- Performance targets met (p95 ≤300ms)

✅ **Integration complete**:
- Battle creation form includes player selection
- Session context properly scoped
- All 4 CRUD operations working

✅ **Documentation complete**:
- README with setup instructions
- API contracts (OpenAPI + JSON Schema)
- Test documentation
- Architecture diagrams

---

## MVP Delivery Path (2 weeks)

**Minimal Viable Product** (just Phase 1, 2, 3):
1. Players can be created with form validation
2. Players persisted via event sourcing
3. Players displayed in a list
4. **Value delivered**: Users can build and view their player roster
5. **Ready for production**: Yes, provides core reusability value

Continue with Phases 4-7 for full feature set including view/select/edit/delete.
