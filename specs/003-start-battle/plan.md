# Implementation Plan: Start and Track Battle

**Branch**: `003-start-battle` | **Date**: 2026-02-18 | **Spec**: [003-start-battle/spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-start-battle/spec.md`

## Summary

Implement core battle management system with turn-based combat tracking using event sourcing. System captures battle creation with initiative calculation (modifier + d20 roll), turn progression across rounds, damage application with HP tracking, defeated creature identification, and manual battle conclusion. All battle state changes recorded as immutable events to support audit trail and battle replay. Backend implements hexagonal architecture with REST API; Angular frontend consumes API with real-time UI updates.

## Technical Context

**Language/Version**:
- Backend (primary): Kotlin 1.9.25 (JVM 21), Spring Boot 3.5.7
- Frontend: Angular 18 with TypeScript, RxJS, Signals

**Primary Dependencies**:
- Backend: Spring Data JPA, Jackson, Spring Security (JWT)
- Frontend: Angular, RxJS, @angular/common, @testing-library/angular

**Storage**: H2 in-memory database (development); events stored as JSON documents in database
**Testing**: JUnit 5 + Mockito-Kotlin (backend), Jasmine + Karma (frontend)
**Target Platform**: Web (backend: Linux/cloud-ready; frontend: modern browsers)
**Project Type**: Web (frontend + backend)
**Performance Goals**:
- Turn advancement UI update: <500ms
- Battle creation: <30 seconds user-perceived
- Combat log retrieval: <2 seconds
- Event sourcing replay: <5 seconds for 10,000 events
**Constraints**:
- Backend p95 API response: ≤300ms
- Angular TTI: ≤3.8 seconds
- Memory usage <512MB under 1000 concurrent users
**Scale/Scope**:
- 5 user stories (3 P1, 2 P2)
- ~12 functional requirements
- Estimated 15-20 backend entities/value objects
- 4-6 major frontend components

## Constitution Check

*GATE: Must pass before proceeding. Re-check after Phase 1 design.*

✅ **Hexagonal Architecture Discipline**
- Backend domain layer will be framework-agnostic (business logic in use cases, entities, ports)
- Frontend follows ports-and-adapters with service layer separation
- All dependencies flow inward: Infrastructure → Application → Domain

✅ **Test-Driven Development (TDD)**
- Backend: 100% domain coverage, ≥90% application, ≥80% infrastructure
- Frontend: 100% use case/service logic, ≥90% component integration, ≥80% UI
- Tests written before implementation (Red-Green-Refactor)

✅ **User Experience Consistency**
- Angular uses project design system and components
- Defeated creatures styled consistently (50% opacity + badge)
- Error messages follow project standard format
- Responsive design targeting 320px-1920px viewports

✅ **Performance & Scalability Standards**
- Battle API endpoints target p95 ≤300ms
- Frontend interactive response <100ms
- Combat log pagination for lists >50 items
- Event sourcing events indexed for fast replay

⚠️ **Backend Complexity**: Single backend (Kotlin only, no Go variant) justified for this feature - Go implementation deferred to later phase after core patterns established.

## Project Structure

### Documentation (this feature)

```text
specs/003-start-battle/
├── plan.md                    # This file
├── research.md                # Phase 0: Technical research (if needed)
├── data-model.md              # Phase 1: Domain entities & data structures
├── quickstart.md              # Phase 1: Implementation guide
├── contracts/
│   ├── battle-api.yaml        # OpenAPI spec for battle endpoints
│   └── types.yaml             # Shared type definitions
├── checklists/
│   └── requirements.md        # Specification quality checklist
└── tasks.md                   # Phase 2 output (not created by /speckit.plan)
```

### Hexagonal Architecture (Backend - Kotlin)

```text
backend/src/main/kotlin/de/thomcz/pap/battle/backend/

# Domain Layer (Framework-independent business logic)
domain/
├── battle/
│   ├── entities/
│   │   ├── Battle.kt                    # Aggregate root
│   │   ├── BattleCreature.kt            # Value object (creature snapshot)
│   │   └── BattleState.kt               # Value object (round, turn info)
│   ├── events/
│   │   ├── BattleEvent.kt               # Sealed class for all events
│   │   ├── BattleStarted.kt             # Event: battle created
│   │   ├── CreatureAdded.kt             # Event: creature joined
│   │   ├── InitiativeRolled.kt          # Event: initiative d20 entered
│   │   ├── TurnProgressed.kt            # Event: next turn
│   │   ├── RoundAdvanced.kt             # Event: new round
│   │   ├── DamageApplied.kt             # Event: damage dealt
│   │   ├── CreatureDefeated.kt          # Event: creature HP ≤ 0
│   │   └── BattleEnded.kt               # Event: battle concluded
│   ├── ports/                           # Interfaces (adapters implement these)
│   │   ├── BattleRepository.kt          # Port: persist battle
│   │   ├── CreaturePort.kt              # Port: fetch creature data
│   │   └── BattleEventBus.kt            # Port: publish events
│   ├── usecases/
│   │   ├── CreateBattle.kt              # Use case: create + init
│   │   ├── RollInitiative.kt            # Use case: d20 roll entry
│   │   ├── ProgressTurn.kt              # Use case: next turn
│   │   ├── ApplyDamage.kt               # Use case: damage logic
│   │   └── EndBattle.kt                 # Use case: conclude
│   └── exceptions/
│       ├── BattleException.kt           # Domain exception
│       ├── InvalidInitiativeException.kt
│       └── CreatureAlreadyDefeated.kt

# Application Layer (Use case orchestration)
application/
└── services/
    ├── BattleService.kt                 # Orchestrates use cases
    └── BattleEventStore.kt              # Event sourcing manager

# Infrastructure Layer (Adapters & external interfaces)
infrastructure/
├── persistence/
│   ├── jpa/
│   │   ├── BattleJpaRepository.kt       # JPA adapter for BattleRepository port
│   │   ├── BattleEntity.kt              # JPA entity (DB schema)
│   │   └── BattleEventEntity.kt         # Event store entity
│   └── mappers/
│       └── BattleMapper.kt              # Map domain ↔ JPA entities
├── external/
│   └── CreatureServiceAdapter.kt        # Adapter calls creature-mgmt service
├── events/
│   └── LocalBattleEventBus.kt           # In-memory event bus
└── rest/
    ├── BattleController.kt              # REST endpoints
    └── dtos/
        ├── CreateBattleRequest.kt
        ├── BattleResponse.kt
        └── DamageRequest.kt

# Test Layer
test/kotlin/de/thomcz/pap/battle/backend/
├── domain/
│   ├── entities/BattleTest.kt           # Entity domain tests
│   ├── usecases/
│   │   ├── CreateBattleTest.kt
│   │   ├── ApplyDamageTest.kt
│   │   └── ...
│   └── values/BattleStateTest.kt
├── application/
│   └── services/BattleServiceTest.kt    # Service orchestration tests
└── integration/
    ├── BattleControllerTest.kt          # REST endpoint tests
    └── BattleRepositoryTest.kt          # DB interaction tests
```

### Frontend (Angular)

```text
frontend-angular/src/app/

# Core Layer (Domain logic, ports)
core/
├── battle/
│   ├── domain/
│   │   ├── battle.model.ts              # Domain models
│   │   ├── battle.repository.ts         # Port (interface)
│   │   ├── battle-state.service.ts      # Orchestration
│   │   └── battle.events.ts             # Event definitions
│   └── use-cases/
│       ├── create-battle.usecase.ts
│       ├── progress-turn.usecase.ts
│       └── apply-damage.usecase.ts

# Adapters Layer
adapters/
├── battle/
│   ├── battle-api.adapter.ts            # Implements BattleRepository
│   ├── http/
│   │   └── battle.http.ts               # HTTP calls
│   └── storage/
│       └── battle-local.storage.ts      # LocalStorage fallback

# Features Layer (UI Components)
features/
├── battle/
│   ├── battle-container.component.ts    # Smart component
│   ├── pages/
│   │   ├── battle-list.component.ts
│   │   └── battle-arena.component.ts    # Main battle UI
│   ├── components/
│   │   ├── turn-order.component.ts      # Creature turn display
│   │   ├── creature-card.component.ts   # Creature stats/actions
│   │   ├── damage-dialog.component.ts   # Damage input dialog
│   │   └── combat-log.component.ts      # Event log display
│   └── battle.routes.ts

# Test Layer
specs/
├── battle/
│   ├── domain/
│   │   └── battle.model.spec.ts         # Domain logic tests
│   ├── use-cases/
│   │   └── apply-damage.usecase.spec.ts
│   ├── adapters/
│   │   └── battle-api.adapter.spec.ts   # Adapter tests
│   └── components/
│       ├── battle-arena.component.spec.ts
│       └── damage-dialog.component.spec.ts
```

**Structure Decision**: Web application with separate backend (Kotlin/Spring Boot) and frontend (Angular). Backend follows strict hexagonal architecture with domain/application/infrastructure layers. Event sourcing used for battle state persistence. Frontend mirrors port-adapter pattern with core (domain) + adapters + features layers.

## Complexity Tracking

| Aspect | Justification | Note |
|--------|--------------|------|
| Event Sourcing | Core feature requirement (FR-009): "persist all battle data using event sourcing" | Enables battle replay, audit trail, and undo/redo for future features |
| Manual Battle End | Clarification decision: prevents accidental battle termination | Extra step in UX justified by data safety; can be optimized later with undo |
| Initiative Ties | Creature selection order (deterministic) vs random | Deterministic preferred for reproducibility; aligns with D&D conventions |
| D20 Roll Input | User experience choice: explicit input vs automatic | GM control desired; reflects tabletop pattern where rolls are deliberate |
| Separate Kotlin Backend | Deferred Go variant to later phase | Kotlin establishes patterns; Go can follow same architecture after proof |

---

## Phase 0: Research (if needed)

All technical decisions are clear from project context (CLAUDE.md, Constitution, and existing patterns 001 & 002). No critical clarifications required.

**Confirmed Decisions**:
- ✅ Kotlin/Spring Boot backend (established in 001-battle-tracker-features)
- ✅ Angular frontend (hexagonal pattern from 001, user management in 002)
- ✅ H2 in-memory database (same as 001 & 002)
- ✅ Event sourcing pattern (specified in IMPLEMENTATION_PLAN.md)
- ✅ JWT authentication (already implemented in 001)
- ✅ Hexagonal architecture (constitution requirement, proven in 001 & 002)
- ✅ TDD approach with ≥80% test coverage (constitution requirement)

**No research.md needed** - proceed to Phase 1 Design.

---

## Phase 1: Design & Contracts

### Data Model

See `data-model.md` (to be generated).

**Key Entity Relationships**:
```
Battle (aggregate root)
├── BattleCreature[*] (each creature snapshot)
│   ├── hp: Int
│   ├── status: CreatureStatus (ACTIVE | DEFEATED)
│   ├── initiativeRoll: Int
│   └── creature: Creature (reference to master record)
├── BattleState (current round/turn info)
│   ├── round: Int
│   ├── currentActorIndex: Int
│   └── initiativeOrder: BattleCreature[]
└── BattleEvent[*] (event sourcing)
    ├── type: String (DamageApplied, RoundAdvanced, etc.)
    ├── timestamp: Instant
    └── payload: Map (event-specific data)
```

### API Contracts

See `contracts/battle-api.yaml` (to be generated).

**Key Endpoints**:
- `POST /battles` - Create battle (accepts creature IDs + initiative rolls)
- `GET /battles/{battleId}` - Fetch battle state
- `POST /battles/{battleId}/turn` - Advance turn
- `POST /battles/{battleId}/damage` - Apply damage
- `POST /battles/{battleId}/end` - Conclude battle
- `GET /battles/{battleId}/log` - Fetch combat log (paginated)

### Agent Context

Angular-specific context to be updated in `.specify/memory/` to reflect battle-specific patterns.

---

## Next Steps

Phase 1 design artifacts (data-model.md, contracts/battle-api.yaml, quickstart.md) will be generated during implementation planning.

Run `/speckit.tasks` to generate actionable, dependency-ordered tasks for implementation.
