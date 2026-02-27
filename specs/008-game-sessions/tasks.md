# Tasks: Game Sessions

**Input**: Design documents from `/specs/008-game-sessions/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Included — TDD is mandatory per project constitution (Principle II).

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: No new project initialization needed — extending existing backend and frontend projects.

- [X] T001 Remove existing SessionController stub in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/adapter/in/rest/SessionController.kt`

---

## Phase 2: Foundational (Session Domain Infrastructure)

**Purpose**: Core Session domain model and persistence that ALL user stories depend on.

**CRITICAL**: No user story work can begin until this phase is complete.

### Domain Model

- [X] T002 [P] Create `SessionStatus` enum (PLANNED, STARTED, FINISHED) in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/model/SessionStatus.kt`
- [X] T003 [P] Create `SessionEvent` sealed interface in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/model/events/SessionEvent.kt`
- [X] T004 [P] Create `SessionCreated` event in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/model/events/SessionCreated.kt`
- [X] T005 [P] Create `SessionStarted` event in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/model/events/SessionStarted.kt`
- [X] T006 [P] Create `SessionFinished` event in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/model/events/SessionFinished.kt`
- [X] T007 [P] Create `SessionRenamed` event in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/model/events/SessionRenamed.kt`
- [X] T008 [P] Create `SessionDeleted` event in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/model/events/SessionDeleted.kt`
- [X] T009 Create `Session` aggregate root with event sourcing (create, start, finish, rename, delete, applyEvent, loadFromHistory) in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/model/Session.kt` (depends on T002-T008)

### Domain Model Tests

- [X] T010 Write unit tests for Session aggregate (create, state transitions, validation, rename, delete, event replay) in `backend/src/test/kotlin/de/thomcz/pap/battle/backend/domain/model/SessionTest.kt` (depends on T009)

### Ports

- [X] T011 [P] Create input port interfaces (`CreateSessionUseCase`, `GetSessionUseCase`, `ListSessionsUseCase`, `StartSessionUseCase`, `FinishSessionUseCase`, `RenameSessionUseCase`, `DeleteSessionUseCase`) in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/port/in/` (depends on T009)
- [X] T012 [P] Create output port interfaces (`SessionRepository`, `SessionEventStore`) in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/port/out/` (depends on T009)

### DTOs

- [X] T013 [P] Create session command DTOs (`CreateSessionCommand`, `RenameSessionCommand`, `GetSessionCommand`) in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/application/dto/SessionCommands.kt`
- [X] T014 [P] Create session response DTOs (`SessionResponse`, `SessionSummaryResponse`, `SessionDetailResponse`) in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/application/dto/SessionResponses.kt`

### Persistence Infrastructure

- [X] T015 [P] Create `SessionEntity` JPA entity in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/adapter/out/persistence/entity/SessionEntity.kt`
- [X] T016 [P] Create `SessionEventEntity` JPA entity in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/adapter/out/persistence/entity/SessionEventEntity.kt`
- [X] T017 [P] Create `SessionEntityRepository` Spring Data interface in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/adapter/out/persistence/SessionEntityRepository.kt`
- [X] T018 Create `SessionMapper` (Session ↔ SessionEntity) in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/adapter/out/persistence/mapper/SessionMapper.kt` (depends on T009, T015)
- [X] T019 Create `H2SessionEventStore` implementing `SessionEventStore` in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/adapter/out/persistence/H2SessionEventStore.kt` (depends on T012, T016)
- [X] T020 Create `JpaSessionRepository` implementing `SessionRepository` in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/adapter/out/persistence/JpaSessionRepository.kt` (depends on T012, T015, T017, T018, T019)

### Frontend Models & Ports

- [X] T021 [P] Create `Session`, `SessionSummary`, `SessionDetail`, `SessionStatus` models in `frontend-angular/src/app/core/domain/models/session.model.ts`
- [X] T022 [P] Create `SessionPort` interface in `frontend-angular/src/app/core/ports/session.port.ts`
- [X] T023 Create `SessionApiAdapter` implementing `SessionPort` in `frontend-angular/src/app/adapters/api/session-api.adapter.ts` (depends on T022)
- [X] T024 Create `sessionProviders` in `frontend-angular/src/app/core/providers/session.providers.ts` and register in `frontend-angular/src/app/app.config.ts` (depends on T023)

**Checkpoint**: Session domain infrastructure complete — all user story implementation can now begin.

---

## Phase 3: User Story 1 — Create a Game Session (Priority: P1) MVP

**Goal**: Authenticated users can create sessions with a name and see them listed on the dashboard in "planned" state.

**Independent Test**: Log in, create a session with a name, verify it appears on the dashboard with "planned" status.

### Tests for User Story 1

- [X] T025 [US1] Write `SessionService` unit tests for create and list operations in `backend/src/test/kotlin/de/thomcz/pap/battle/backend/application/service/SessionServiceTest.kt` (depends on T011, T012, T013, T014)
- [X] T026 [US1] Write `SessionController` integration tests for `POST /api/sessions` and `GET /api/sessions` in `backend/src/test/kotlin/de/thomcz/pap/battle/backend/integration/SessionIntegrationTest.kt` (depends on T025)

### Backend Implementation for User Story 1

- [X] T027 [US1] Implement `SessionService` create and list methods (implementing `CreateSessionUseCase`, `ListSessionsUseCase`) in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/application/service/SessionService.kt` (depends on T011, T012, T013, T014, T020)
- [X] T028 [US1] Implement `SessionController` with `POST /api/sessions` (201 Created) and `GET /api/sessions` (200 OK, optional status filter) in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/adapter/in/rest/SessionController.kt` (depends on T027)

### Frontend Implementation for User Story 1

- [X] T029 [US1] Create `SessionListUseCase` with signals for sessions, loading, error, and methods for loadSessions and createSession in `frontend-angular/src/app/core/domain/use-cases/session-list.use-case.ts` (depends on T022, T024)
- [X] T030 [US1] Write unit tests for `SessionListUseCase` in `frontend-angular/src/app/core/domain/use-cases/session-list.use-case.spec.ts` (depends on T029)
- [X] T031 [P] [US1] Create `CreateSessionDialogComponent` with name form field and validation in `frontend-angular/src/app/features/session/components/create-session-dialog/create-session-dialog.component.ts` (depends on T021)
- [X] T032 [US1] Create `SessionListComponent` page showing sessions with name, status, and create button in `frontend-angular/src/app/features/session/pages/session-list/session-list.component.ts` (depends on T029, T031)
- [X] T033 [US1] Write component tests for `SessionListComponent` in `frontend-angular/src/app/features/session/pages/session-list/session-list.component.spec.ts` (depends on T032)
- [X] T034 [US1] Update routing: change `/home` to load `SessionListComponent` instead of `BattleListComponent` in `frontend-angular/src/app/app.routes.ts` (depends on T032)

**Checkpoint**: Users can create sessions and see them listed. MVP is functional.

---

## Phase 4: User Story 2 — Create Battles Within a Session (Priority: P1)

**Goal**: Users can create battles inside a session. Battles belong to a session and are listed within the session detail view.

**Independent Test**: Create a session, add battles to it, verify battles appear in the session's battle list.

### Tests for User Story 2

- [X] T035 [US2] Write unit tests for Battle aggregate sessionId field and BattleCreated event modification in `backend/src/test/kotlin/de/thomcz/pap/battle/backend/domain/model/BattleTest.kt` (update existing test file)
- [X] T036 [US2] Write `SessionService` unit tests for getSession (detail with battles) in `backend/src/test/kotlin/de/thomcz/pap/battle/backend/application/service/SessionServiceTest.kt` (extend existing)
- [X] T037 [US2] Write `SessionController` integration tests for `POST /api/sessions/{id}/battles` and `GET /api/sessions/{id}` in `backend/src/test/kotlin/de/thomcz/pap/battle/backend/integration/SessionIntegrationTest.kt` (extend existing)

### Backend Implementation for User Story 2

- [X] T038 [US2] Add `sessionId: UUID` field to `Battle` aggregate and `BattleCreated` event in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/model/Battle.kt` and `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/model/events/BattleCreated.kt`
- [X] T039 [US2] Add `session_id` column to `BattleEntity` with index in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/adapter/out/persistence/entity/BattleEntity.kt`
- [X] T040 [US2] Update `BattleMapper` to map sessionId in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/adapter/out/persistence/mapper/BattleMapper.kt`
- [X] T041 [US2] Add `findBySessionId` method to `BattleRepository` port and `JpaBattleRepository` adapter in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/port/out/BattleRepository.kt` and `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/adapter/out/persistence/JpaBattleRepository.kt`
- [X] T042 [US2] Update `BattleService.createBattle()` to support sessionId. Update `CreateBattleCommand` to include sessionId in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/application/service/BattleService.kt` and `backend/src/main/kotlin/de/thomcz/pap/battle/backend/application/dto/CreateBattleCommand.kt`
- [X] T043 [US2] Implement `GetSessionUseCase` in `SessionService` returning session detail with battles in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/application/service/SessionService.kt`
- [X] T044 [US2] Add `POST /api/sessions/{sessionId}/battles` endpoint and `GET /api/sessions/{sessionId}` endpoint to `SessionController` in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/adapter/in/rest/SessionController.kt` (depends on T042, T043)
- [X] T045 [US2] Standalone battle creation preserved; session-based creation added via session endpoints

### Frontend Implementation for User Story 2

- [X] T046 [US2] Create `SessionDetailUseCase` with signals for session, battles, loading, error, and methods for loadSession and createBattle in `frontend-angular/src/app/core/domain/use-cases/session-detail.use-case.ts` (depends on T022, T024)
- [X] T047 [US2] Write unit tests for `SessionDetailUseCase` in `frontend-angular/src/app/core/domain/use-cases/session-detail.use-case.spec.ts` (depends on T046)
- [X] T048 [US2] Create `SessionDetailComponent` page showing session info and battle list with create battle button in `frontend-angular/src/app/features/session/pages/session-detail/session-detail.component.ts` (depends on T046)
- [X] T049 [US2] Write component tests for `SessionDetailComponent` in `frontend-angular/src/app/features/session/pages/session-detail/session-detail.component.spec.ts` (depends on T048)
- [X] T050 [US2] Update `CreateBattleDialogComponent` to accept sessionId and call session-based battle creation in `frontend-angular/src/app/features/battle/components/create-battle-dialog/create-battle-dialog.component.ts` (depends on T046)
- [X] T051 [US2] Add `/sessions/:id` route to `frontend-angular/src/app/app.routes.ts` (depends on T048)

**Checkpoint**: Users can create sessions, add battles to them, and navigate to session detail to see battles.

---

## Phase 5: User Story 3 — Manage Session Lifecycle (Priority: P2)

**Goal**: Users can transition sessions through planned → started → finished states.

**Independent Test**: Create a session, start it, finish it, verify state changes are reflected and invalid transitions are rejected.

### Tests for User Story 3

- [X] T052 [US3] Write `SessionService` unit tests for start and finish operations (valid and invalid transitions) in `backend/src/test/kotlin/de/thomcz/pap/battle/backend/application/service/SessionServiceTest.kt` (extend existing)
- [X] T053 [US3] Write `SessionController` integration tests for `POST /api/sessions/{id}/start` and `POST /api/sessions/{id}/finish` in `backend/src/test/kotlin/de/thomcz/pap/battle/backend/integration/SessionIntegrationTest.kt` (extend existing)

### Backend Implementation for User Story 3

- [X] T054 [US3] Implement `StartSessionUseCase` and `FinishSessionUseCase` in `SessionService` in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/application/service/SessionService.kt`
- [X] T055 [US3] Add `POST /api/sessions/{id}/start` and `POST /api/sessions/{id}/finish` endpoints to `SessionController` in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/adapter/in/rest/SessionController.kt` (depends on T054)

### Frontend Implementation for User Story 3

- [X] T056 [P] [US3] Create `SessionStatusBadgeComponent` displaying session state with visual styling in `frontend-angular/src/app/features/session/components/session-status-badge/session-status-badge.component.ts`
- [X] T057 [US3] Add startSession and finishSession methods to `SessionDetailUseCase` in `frontend-angular/src/app/core/domain/use-cases/session-detail.use-case.ts`
- [X] T058 [US3] Add lifecycle controls (start/finish buttons) to `SessionDetailComponent` in `frontend-angular/src/app/features/session/pages/session-detail/session-detail.component.ts` (depends on T056, T057)
- [X] T059 [US3] Write component tests for lifecycle controls in `frontend-angular/src/app/features/session/pages/session-detail/session-detail.component.spec.ts` (extend existing, depends on T058)
- [X] T060 [US3] Integrate `SessionStatusBadgeComponent` into `SessionListComponent` in `frontend-angular/src/app/features/session/pages/session-list/session-list.component.ts` (depends on T056)

**Checkpoint**: Sessions have full lifecycle management. State transitions are enforced.

---

## Phase 6: User Story 4 — View and Navigate Sessions (Priority: P2)

**Goal**: Dashboard shows all sessions with names and states. Users can navigate from dashboard into a session to see its battles.

**Independent Test**: Create multiple sessions with battles, verify dashboard lists all sessions, click a session to navigate to its detail view.

### Frontend Implementation for User Story 4

- [X] T061 [US4] Add empty state to `SessionListComponent` with prompt to create first session in `frontend-angular/src/app/features/session/pages/session-list/session-list.component.ts`
- [X] T062 [US4] Add session click navigation to `SessionDetailComponent` route in `SessionListComponent` in `frontend-angular/src/app/features/session/pages/session-list/session-list.component.ts`
- [X] T063 [US4] Update `BottomNav` component to include Sessions navigation item in `frontend-angular/src/app/shared/components/bottom-nav/bottom-nav.ts`
- [X] T064 [US4] Add "session not found" error handling to `SessionDetailComponent` in `frontend-angular/src/app/features/session/pages/session-detail/session-detail.component.ts`
- [X] T065 [US4] Write component tests for navigation and empty state in `frontend-angular/src/app/features/session/pages/session-list/session-list.component.spec.ts` (extend existing)

**Checkpoint**: Full navigation flow works: Dashboard → Session → Battles.

---

## Phase 7: User Story 5 — Edit and Delete Sessions (Priority: P3)

**Goal**: Users can rename or delete sessions. Deleting a session removes all its battles.

**Independent Test**: Rename a session and verify the new name. Delete a session and verify it and its battles are removed.

### Tests for User Story 5

- [X] T066 [US5] Write `SessionService` unit tests for rename and delete operations in `backend/src/test/kotlin/de/thomcz/pap/battle/backend/application/service/SessionServiceTest.kt` (extend existing)
- [X] T067 [US5] Write `SessionController` integration tests for `PUT /api/sessions/{id}` and `DELETE /api/sessions/{id}` in `backend/src/test/kotlin/de/thomcz/pap/battle/backend/integration/SessionIntegrationTest.kt` (extend existing)

### Backend Implementation for User Story 5

- [X] T068 [US5] Implement `RenameSessionUseCase` and `DeleteSessionUseCase` in `SessionService` in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/application/service/SessionService.kt`
- [X] T069 [US5] Implement cascade deletion in `JpaSessionRepository` (delete session + battles + all events) in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/adapter/out/persistence/JpaSessionRepository.kt`
- [X] T070 [US5] Add `PUT /api/sessions/{id}` and `DELETE /api/sessions/{id}` endpoints to `SessionController` in `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/adapter/in/rest/SessionController.kt` (depends on T068, T069)

### Frontend Implementation for User Story 5

- [X] T071 [US5] Add renameSession and deleteSession methods to `SessionDetailUseCase` in `frontend-angular/src/app/core/domain/use-cases/session-detail.use-case.ts`
- [X] T072 [US5] Add rename dialog and delete confirmation to `SessionDetailComponent` in `frontend-angular/src/app/features/session/pages/session-detail/session-detail.component.ts` (depends on T071)
- [X] T073 [US5] Add deleteSession method to `SessionListUseCase` and delete action to `SessionListComponent` in `frontend-angular/src/app/core/domain/use-cases/session-list.use-case.ts` and `frontend-angular/src/app/features/session/pages/session-list/session-list.component.ts`
- [X] T074 [US5] Write component tests for rename and delete in `frontend-angular/src/app/features/session/pages/session-detail/session-detail.component.spec.ts` (extend existing, depends on T072)

**Checkpoint**: Full session CRUD is complete. All user stories functional.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T075 Verify all backend tests pass with `./gradlew test` in `backend/`
- [ ] T076 Verify all frontend tests pass with `npm test` in `frontend-angular/`
- [ ] T077 Verify test coverage meets constitution thresholds (domain: 100%, application: ≥90%, adapters: ≥80%)
- [ ] T078 [P] Update existing `BattleListComponent` tests to reflect session-scoped battle creation in `frontend-angular/src/app/features/battle/pages/battle-list/battle-list.component.spec.ts`
- [ ] T079 Run quickstart.md validation — verify end-to-end flow: login → create session → add battle → start session → finish session

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 — MVP delivery target
- **US2 (Phase 4)**: Depends on Phase 2 and US1 (needs sessions to exist to add battles)
- **US3 (Phase 5)**: Depends on Phase 2 — can run in parallel with US2
- **US4 (Phase 6)**: Depends on US1 and US2 (needs sessions with battles to navigate)
- **US5 (Phase 7)**: Depends on Phase 2 — can run in parallel with US2/US3
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Depends on Foundational only — no other story dependencies
- **US2 (P1)**: Depends on US1 (need sessions to add battles to)
- **US3 (P2)**: Depends on Foundational only — can parallelize with US2
- **US4 (P2)**: Depends on US1 + US2 (needs sessions with battles for full navigation)
- **US5 (P3)**: Depends on Foundational only — can parallelize with US2/US3

### Within Each User Story

- Tests MUST be written and FAIL before implementation (TDD)
- Backend before frontend (API must exist for frontend to consume)
- Domain/service before controller
- Use cases before UI components

### Parallel Opportunities

- All foundational domain model tasks (T002-T008) can run in parallel
- All persistence entity tasks (T015-T017) can run in parallel
- Frontend model + port tasks (T021-T022) can run in parallel with backend persistence
- US3 and US5 can be developed in parallel after foundational phase
- Within each US: [P]-marked tasks can run in parallel

---

## Parallel Example: Foundational Phase

```bash
# Launch all event classes in parallel:
Task: "Create SessionStatus enum in .../SessionStatus.kt"
Task: "Create SessionEvent sealed interface in .../SessionEvent.kt"
Task: "Create SessionCreated event in .../SessionCreated.kt"
Task: "Create SessionStarted event in .../SessionStarted.kt"
Task: "Create SessionFinished event in .../SessionFinished.kt"
Task: "Create SessionRenamed event in .../SessionRenamed.kt"
Task: "Create SessionDeleted event in .../SessionDeleted.kt"

# Launch all persistence entities in parallel:
Task: "Create SessionEntity in .../SessionEntity.kt"
Task: "Create SessionEventEntity in .../SessionEventEntity.kt"
Task: "Create SessionEntityRepository in .../SessionEntityRepository.kt"

# Launch frontend models in parallel with backend persistence:
Task: "Create session models in .../session.model.ts"
Task: "Create SessionPort in .../session.port.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 — Create & List Sessions
4. **STOP and VALIDATE**: Test US1 independently (create session, see it listed)
5. Deploy/demo if ready

### Incremental Delivery

1. Phase 1 + 2 → Foundation ready
2. Add US1 → Test independently → Deploy/Demo (**MVP!**)
3. Add US2 → Test independently → Deploy/Demo (sessions with battles)
4. Add US3 + US4 → Test independently → Deploy/Demo (full lifecycle + navigation)
5. Add US5 → Test independently → Deploy/Demo (edit/delete)
6. Phase 8 → Polish and verify all tests/coverage

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- TDD is mandatory per constitution — write failing tests before implementation
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Total tasks: 79
