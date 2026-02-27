# Implementation Plan: Game Sessions

**Branch**: `008-game-sessions` | **Date**: 2026-02-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-game-sessions/spec.md`

## Summary

Introduce a **Session** aggregate that groups battles into game sessions with lifecycle states (PLANNED → STARTED → FINISHED). Sessions follow the same event sourcing pattern as existing aggregates (Battle, Player, BeasteryCreature). The Battle aggregate gains a `sessionId` foreign key. The Angular frontend adds a session feature with dashboard integration, replacing the direct battle list with a session-first navigation flow.

## Technical Context

**Language/Version**: Kotlin 1.9.25 (JVM 21) + TypeScript (Angular 21.0.2)
**Primary Dependencies**: Spring Boot 3.5.7, Spring Data JPA, Jackson (backend); Angular 21, RxJS, Angular Signals (frontend)
**Storage**: H2 in-memory database with event sourcing (events stored as JSON)
**Testing**: JUnit 5 + Mockito-Kotlin (backend); Jasmine + Karma (frontend)
**Target Platform**: Web application (Linux server + browser)
**Project Type**: Web application (backend + frontend)
**Performance Goals**: API p95 ≤300ms, FCP ≤1.8s, session operations ≤2s perceived
**Constraints**: Stateless JWT auth, hexagonal architecture, TDD mandatory
**Scale/Scope**: Single user with 10-50 sessions, each with 1-10 battles

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Phase 0 Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Hexagonal Architecture | ✅ PASS | Session follows same domain/application/infrastructure layers as Battle |
| II. TDD | ✅ PASS | Plan includes tests-first approach for all layers |
| III. UX Consistency | ✅ PASS | Session UI follows existing patterns (list → detail, dialogs, signals) |
| IV. Performance & Scalability | ✅ PASS | Event sourcing with small event counts, standard REST endpoints |

### Post-Phase 1 Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Hexagonal Architecture | ✅ PASS | New ports: SessionRepository, SessionEventStore, SessionPort. Domain has zero framework dependencies. |
| II. TDD | ✅ PASS | Test plan covers domain (100%), application (≥90%), adapters (≥80%). |
| III. UX Consistency | ✅ PASS | API contract follows existing patterns (POST for create, action endpoints for state transitions). Frontend uses same signal/use-case patterns. |
| IV. Performance & Scalability | ✅ PASS | Session queries indexed by user_id and status. Event replay for sessions will be fast (≤5 events typical). |

## Project Structure

### Documentation (this feature)

```text
specs/008-game-sessions/
├── plan.md              # This file
├── research.md          # Phase 0 output — technology decisions
├── data-model.md        # Phase 1 output — entities, events, tables
├── quickstart.md        # Phase 1 output — implementation guide
├── contracts/           # Phase 1 output — API contracts
│   └── sessions-api.yaml
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
backend/src/main/kotlin/de/thomcz/pap/battle/backend/
├── domain/
│   ├── model/
│   │   ├── Session.kt                    # NEW — Session aggregate root
│   │   ├── SessionStatus.kt              # NEW — PLANNED/STARTED/FINISHED enum
│   │   ├── Battle.kt                     # MODIFIED — add sessionId field
│   │   └── events/
│   │       ├── SessionEvent.kt           # NEW — sealed interface
│   │       ├── SessionCreated.kt         # NEW
│   │       ├── SessionStarted.kt         # NEW
│   │       ├── SessionFinished.kt        # NEW
│   │       ├── SessionRenamed.kt         # NEW
│   │       ├── SessionDeleted.kt         # NEW
│   │       └── BattleCreated.kt          # MODIFIED — add sessionId
│   ├── port/in/
│   │   ├── CreateSessionUseCase.kt       # NEW
│   │   ├── GetSessionUseCase.kt          # NEW
│   │   ├── ListSessionsUseCase.kt        # NEW
│   │   ├── StartSessionUseCase.kt        # NEW
│   │   ├── FinishSessionUseCase.kt       # NEW
│   │   ├── RenameSessionUseCase.kt       # NEW
│   │   └── DeleteSessionUseCase.kt       # NEW
│   └── port/out/
│       ├── SessionRepository.kt          # NEW
│       └── SessionEventStore.kt          # NEW
├── application/
│   ├── service/
│   │   ├── SessionService.kt             # NEW — implements all session use cases
│   │   └── BattleService.kt              # MODIFIED — validate session on battle creation
│   └── dto/
│       ├── SessionCommands.kt            # NEW — CreateSessionCommand, RenameSessionCommand, etc.
│       └── SessionResponses.kt           # NEW — SessionResponse, SessionSummaryResponse, SessionDetailResponse
└── infrastructure/
    ├── adapter/in/rest/
    │   ├── SessionController.kt          # NEW (replaces existing stub)
    │   └── BattleController.kt           # MODIFIED — battle creation via session
    └── adapter/out/persistence/
        ├── entity/
        │   ├── SessionEntity.kt          # NEW
        │   ├── SessionEventEntity.kt     # NEW
        │   └── BattleEntity.kt           # MODIFIED — add session_id column
        ├── JpaSessionRepository.kt       # NEW
        ├── H2SessionEventStore.kt        # NEW
        ├── SessionEntityRepository.kt    # NEW — Spring Data interface
        └── mapper/
            └── SessionMapper.kt          # NEW

backend/src/test/kotlin/de/thomcz/pap/battle/backend/
├── domain/model/
│   └── SessionTest.kt                    # NEW — aggregate unit tests
├── application/service/
│   └── SessionServiceTest.kt             # NEW — use case tests
└── infrastructure/adapter/in/rest/
    └── SessionControllerTest.kt          # NEW — integration tests

frontend-angular/src/app/
├── core/
│   ├── domain/
│   │   ├── models/
│   │   │   └── session.model.ts          # NEW — Session, SessionSummary, SessionStatus
│   │   └── use-cases/
│   │       ├── session-list.use-case.ts  # NEW
│   │       └── session-detail.use-case.ts # NEW
│   ├── ports/
│   │   └── session.port.ts              # NEW
│   └── providers/
│       └── session.providers.ts         # NEW
├── adapters/api/
│   └── session-api.adapter.ts           # NEW
└── features/
    ├── session/                          # NEW feature module
    │   ├── pages/
    │   │   ├── session-list/             # Dashboard replacement
    │   │   └── session-detail/           # Session with battles
    │   └── components/
    │       ├── create-session-dialog/
    │       └── session-status-badge/
    └── battle/
        ├── pages/
        │   └── battle-list/              # MODIFIED — now scoped to session
        └── components/
            └── create-battle-dialog/     # MODIFIED — receives sessionId
```

**Structure Decision**: Web application with separate backend (Kotlin/Spring Boot) and frontend (Angular). Both follow hexagonal architecture. New Session feature extends existing project structure without changing the layering.

## Complexity Tracking

No constitution violations. All patterns align with existing architecture.
