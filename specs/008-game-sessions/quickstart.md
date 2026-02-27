# Quickstart: Game Sessions

**Feature**: 008-game-sessions
**Date**: 2026-02-24

## Overview

This feature introduces a **Session** aggregate that groups battles into game sessions with lifecycle states (planned → started → finished). After login, users see their sessions on the dashboard and navigate into a session to manage its battles.

## Implementation Order

### 1. Backend — Session Domain (TDD)

**Location**: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/`

1. Create `SessionStatus` enum in `domain/model/`
2. Create session events (`SessionCreated`, `SessionStarted`, `SessionFinished`, `SessionRenamed`, `SessionDeleted`) in `domain/model/events/`
3. Create `Session` aggregate root in `domain/model/` following the Battle pattern (event sourcing, `applyEvent`, `loadFromHistory`)
4. Create input ports in `domain/port/in/`: `CreateSessionUseCase`, `GetSessionUseCase`, `ListSessionsUseCase`, `StartSessionUseCase`, `FinishSessionUseCase`, `RenameSessionUseCase`, `DeleteSessionUseCase`
5. Create output ports in `domain/port/out/`: `SessionRepository`, `SessionEventStore`
6. Create `SessionService` in `application/service/` implementing all use cases
7. Create DTOs in `application/dto/`: commands and response objects
8. Create `SessionEntity`, `SessionEventEntity` in `infrastructure/adapter/out/persistence/entity/`
9. Create `JpaSessionRepository`, `H2SessionEventStore`, `SessionMapper` in `infrastructure/adapter/out/persistence/`
10. Create `SessionController` in `infrastructure/adapter/in/rest/` (replace existing stub)

### 2. Backend — Battle-Session Link

1. Add `sessionId` to `BattleCreated` event
2. Add `sessionId` field to `Battle` aggregate
3. Add `session_id` column to `BattleEntity`
4. Update `BattleService.createBattle()` to require a sessionId and validate the session exists and is not FINISHED
5. Update `CreateBattleCommand` to include sessionId
6. Move battle creation endpoint to `POST /api/sessions/{sessionId}/battles`
7. Update `BattleController` accordingly

### 3. Frontend — Session Port & Adapter

**Location**: `frontend-angular/src/app/`

1. Create `SessionSummary` and `SessionDetail` models in `core/domain/models/`
2. Create `SessionPort` in `core/ports/`
3. Create `SessionApiAdapter` in `adapters/api/`
4. Create `sessionProviders` in `core/providers/`
5. Register providers in `app.config.ts`

### 4. Frontend — Session Use Cases

1. Create `SessionListUseCase` — load, create, delete sessions
2. Create `SessionDetailUseCase` — load session with battles, state transitions, rename

### 5. Frontend — Session Feature Pages

1. Update dashboard (`/home`) to show sessions instead of battles
2. Create `SessionDetailComponent` at `/sessions/:id` showing session info + battle list
3. Move battle creation into session context
4. Update routing in `app.routes.ts`
5. Update bottom nav if needed

## Key Patterns to Follow

- **Event sourcing**: All Session state changes via events, same as Battle/Player/BeasteryCreature
- **Hexagonal architecture**: Domain → ports → adapters, no framework dependencies in domain
- **TDD**: Write failing tests first, then implement
- **Permission model**: Sessions scoped to userId, same pattern as battles
- **UUID conversion**: Use same `userNameToUUID()` pattern from BattleService
- **Error handling**: Same exceptions (EntityNotFoundException, StateConflictException, AccessDeniedException)
- **Angular signals**: Use `signal()` for mutable state, `.asReadonly()` for public exposure
