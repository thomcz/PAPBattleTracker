# Implementation Plan: Battle Tracker Core Features

**Branch**: `001-battle-tracker-features` | **Date**: 2026-02-11 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-battle-tracker-features/spec.md`

## Summary

Implement complete battle tracking functionality for tabletop RPG sessions using hexagonal architecture with event sourcing in the backend and reactive state management in Angular frontend. The system enables Game Masters to create battles, manage creatures, track HP/turn order, maintain combat logs, and persist battle state. Implementation uses integration tests over mocks to ensure real system behavior and Angular Testing Library for user-centric frontend tests.

**Technical Approach**: Event sourcing for battle domain provides complete audit trail and replay capability. Backend uses Kotlin + Spring Boot with H2 database storing events as JSON. Frontend uses Angular 18 with signals and observables for reactive state management. Testing strategy emphasizes integration tests with real database interactions and user-simulation tests over heavy mocking.

## Technical Context

**Language/Version**:
- Backend: Kotlin 1.9.25, Java 21, Spring Boot 3.5.7
- Frontend: Angular 18, TypeScript 5.3+

**Primary Dependencies**:
- Backend: Spring Boot (Web, Data JPA, Security), H2 Database, Jackson (JSON), Mockito-Kotlin (minimal mocking)
- Frontend: RxJS 7.8+, Angular CDK, Angular Testing Library (user-centric tests)

**Storage**: H2 in-memory database (development), event sourcing with JSON event store

**Testing**:
- Backend: JUnit 5, Spring Boot Test (integration tests), Mockito-Kotlin (minimal, only for external services)
- Frontend: Jasmine/Karma → migrating to Vitest, Angular Testing Library for component tests

**Target Platform**: Web application (Chrome, Firefox, Safari, Edge)

**Project Type**: Web application with separate backend and frontend

**Performance Goals**:
- API p95: ≤300ms (per constitution)
- Frontend FCP: ≤1.8s, LCP: ≤2.5s, TTI: ≤3.8s
- Event sourcing replay: <5s for 10,000 events
- Support 1,000 concurrent users

**Constraints**:
- Event sourcing immutability: events never modified after creation
- Battle state derived from event replay, not stored directly
- Frontend must work with either Kotlin or Go backend (API compatibility)
- Offline-capable after initial authentication

**Scale/Scope**:
- Users: 100-1,000 concurrent Game Masters
- Battles per user: 1-5 concurrent, 50-100 historical
- Creatures per battle: typically 2-10, max 20
- Combat logs: 50-500 entries per battle
- Events per battle: 100-1,000 typical, 10,000 max

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Hexagonal Architecture Discipline

**Status**: ✅ COMPLIANT

**Verification**:
- Domain layer: Battle aggregate, Creature entity, event types (BattleCreated, CreatureAdded, etc.)
- Application layer: Use cases (CreateBattle, AddCreature, ApplyDamage, etc.)
- Infrastructure layer: REST controllers, JPA repositories, JWT security
- Ports defined in domain: BattleRepository, EventStore interfaces
- Adapters implement ports: JpaBattleRepository, H2EventStore
- No framework dependencies in domain/application layers

### II. Test-Driven Development (TDD)

**Status**: ✅ COMPLIANT (with strategy adjustment)

**Verification**:
- Tests written before implementation (TDD cycle enforced)
- Integration test focus: Real H2 database, full Spring context, actual HTTP requests
- Minimal mocking: Only external services (email, payment APIs) - NOT database or repositories
- Coverage targets:
  - Domain logic: 100% (event sourcing logic, aggregates, business rules)
  - Application services: ≥90% (use cases with integration tests)
  - Adapters: ≥80% (REST endpoints, repositories with real DB)
  - Infrastructure: ≥60% (configuration, security filters)
- Frontend: Angular Testing Library for user-simulation tests (user.click, user.type)

**Rationale for Integration Tests**:
Event sourcing requires testing actual event persistence and replay. Mocking the event store defeats the purpose of testing the most critical part of the architecture. Integration tests with H2 provide fast, reliable tests while verifying real behavior.

### III. User Experience Consistency

**Status**: ✅ COMPLIANT

**Verification**:
- Angular Material components for consistent UI
- Responsive design: mobile-first, tested at 320px, 768px, 1920px
- WCAG 2.1 AA: aria-labels, keyboard navigation, color contrast ≥4.5:1
- Loading states: signals for reactive UI updates
- Error messages: standardized format via Angular interceptor
- Cross-backend compatibility: REST API contract tests ensure Kotlin/Go backends interchangeable

### IV. Performance & Scalability Standards

**Status**: ✅ COMPLIANT

**Verification**:
- Backend targets: p95 ≤300ms (enforced via performance tests)
- Frontend targets: FCP ≤1.8s, LCP ≤2.5s (measured in CI)
- Event sourcing optimization: Snapshotting for battles >1000 events
- Database indexing: battle_id, user_id, created_at
- Lazy loading: Angular routes, feature modules
- Pagination: API responses for battles and creatures
- Bundle size: Initial ≤200KB, lazy routes ≤100KB (gzipped)

**Constraints**:
- Event replay <5s for 10,000 events (requires snapshot optimization at 1000 events)

### Constitution Compliance Summary

| Principle | Status | Notes |
|-----------|--------|-------|
| Hexagonal Architecture | ✅ Pass | Domain isolated, ports/adapters pattern |
| TDD | ✅ Pass | Integration tests prioritized, minimal mocks |
| UX Consistency | ✅ Pass | Angular Material, WCAG 2.1 AA |
| Performance | ✅ Pass | Meets all targets, snapshotting for scaling |

## Project Structure

### Documentation (this feature)

```text
specs/001-battle-tracker-features/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output: Event sourcing patterns, testing strategies
├── data-model.md        # Phase 1 output: Entities, events, aggregates
├── quickstart.md        # Phase 1 output: Developer onboarding guide
├── contracts/           # Phase 1 output: REST API OpenAPI specifications
│   ├── battles-api.yaml
│   ├── creatures-api.yaml
│   └── events-api.yaml
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
backend/
├── src/main/kotlin/de/thomcz/pap/battle/backend/
│   ├── domain/
│   │   ├── model/
│   │   │   ├── Battle.kt               # Aggregate root with event sourcing
│   │   │   ├── Creature.kt             # Entity within aggregate
│   │   │   ├── CombatStatus.kt         # Value object
│   │   │   └── events/
│   │   │       ├── BattleEvent.kt      # Base event interface
│   │   │       ├── BattleCreated.kt
│   │   │       ├── CreatureAdded.kt
│   │   │       ├── DamageApplied.kt
│   │   │       └── ...                  # Additional event types
│   │   └── port/
│   │       ├── in/
│   │       │   ├── CreateBattleUseCase.kt
│   │       │   ├── AddCreatureUseCase.kt
│   │       │   ├── ApplyDamageUseCase.kt
│   │       │   └── ...
│   │       └── out/
│   │           ├── BattleRepository.kt
│   │           └── EventStore.kt
│   │
│   ├── application/
│   │   ├── service/
│   │   │   ├── BattleService.kt        # Implements use case ports
│   │   │   ├── CreatureService.kt
│   │   │   └── CombatService.kt
│   │   └── dto/
│   │       ├── CreateBattleCommand.kt
│   │       ├── AddCreatureCommand.kt
│   │       └── BattleResponse.kt
│   │
│   └── infrastructure/
│       ├── adapter/in/rest/
│       │   ├── BattleController.kt
│       │   ├── CreatureController.kt
│       │   └── CombatController.kt
│       ├── adapter/out/persistence/
│       │   ├── JpaBattleRepository.kt
│       │   ├── H2EventStore.kt
│       │   ├── entity/
│       │   │   ├── BattleEntity.kt     # JPA entity for metadata
│       │   │   └── EventEntity.kt      # JPA entity for event storage
│       │   └── mapper/
│       │       └── BattleMapper.kt
│       └── config/
│           ├── SecurityConfig.kt
│           └── EventSourcingConfig.kt
│
└── src/test/kotlin/de/thomcz/pap/battle/backend/
    ├── integration/                     # Integration tests (primary focus)
    │   ├── BattleIntegrationTest.kt    # Full Spring Boot, real H2 DB
    │   ├── CreatureIntegrationTest.kt
    │   └── EventSourcingTest.kt
    ├── domain/
    │   ├── BattleTest.kt               # Pure domain logic tests
    │   └── events/
    │       └── EventApplicationTest.kt
    └── application/
        └── service/
            └── BattleServiceTest.kt    # Unit tests for business logic

frontend-angular/
├── src/app/
│   ├── core/
│   │   ├── domain/
│   │   │   ├── models/
│   │   │   │   ├── battle.model.ts
│   │   │   │   ├── creature.model.ts
│   │   │   │   └── combat-log.model.ts
│   │   │   └── use-cases/
│   │   │       ├── create-battle.use-case.ts
│   │   │       ├── add-creature.use-case.ts
│   │   │       └── apply-damage.use-case.ts
│   │   ├── ports/
│   │   │   ├── battle.port.ts
│   │   │   ├── creature.port.ts
│   │   │   └── combat.port.ts
│   │   ├── state/
│   │   │   ├── battle.state.ts         # Signal-based state
│   │   │   └── combat.state.ts
│   │   └── guards/
│   │       └── battle-guard.ts
│   │
│   ├── adapters/
│   │   ├── api/
│   │   │   ├── battle-api.adapter.ts   # Implements BattlePort
│   │   │   ├── creature-api.adapter.ts
│   │   │   └── combat-api.adapter.ts
│   │   ├── state/
│   │   │   └── battle-state.adapter.ts # LocalStorage persistence
│   │   └── interceptors/
│   │       ├── auth.interceptor.ts
│   │       └── error.interceptor.ts
│   │
│   └── features/
│       └── battle/
│           ├── pages/
│           │   ├── battle-list/
│           │   │   ├── battle-list.component.ts
│           │   │   ├── battle-list.component.html
│           │   │   └── battle-list.component.spec.ts  # Angular Testing Library
│           │   └── battle-detail/
│           │       ├── battle-detail.component.ts
│           │       └── battle-detail.component.spec.ts
│           └── components/
│               ├── creature-card/
│               ├── combat-controls/
│               ├── combat-log/
│               └── status-effects/
│
└── src/app/features/battle/**/*.spec.ts  # All use Angular Testing Library
    # Example test structure:
    # it('should add creature when form submitted', async () => {
    #   const { user, screen } = await render(CreatureComponent);
    #   await user.type(screen.getByLabelText('Name'), 'Goblin');
    #   await user.type(screen.getByLabelText('HP'), '10');
    #   await user.click(screen.getByRole('button', { name: /add/i }));
    #   expect(screen.getByText('Goblin')).toBeInTheDocument();
    # });
```

**Structure Decision**:

Web application structure with hexagonal architecture in both backend and frontend:

- **Backend**: Existing Kotlin backend extended with battle domain using event sourcing. Domain layer (Battle aggregate, events) has zero framework dependencies. Application layer implements use cases. Infrastructure layer handles REST, JPA, and security.

- **Frontend**: Existing Angular app extended with battle feature module. Core contains domain models, use cases, and ports. Adapters implement API communication and state persistence. Features contain UI components using signals and observables.

- **Testing**: Integration tests in backend use real H2 database and full Spring context. Frontend tests use Angular Testing Library to simulate user interactions (typing, clicking) rather than testing implementation details.

## Complexity Tracking

> **No violations** - Architecture fully complies with constitution requirements.

**Justifications for Design Choices**:

1. **Event Sourcing Complexity**: While event sourcing adds architectural complexity, it's essential for:
   - Complete audit trail of all combat actions (FR-027 to FR-031)
   - Battle state replay capability for debugging and analytics
   - Undo/redo potential in future iterations
   - Immutable event history prevents data corruption

2. **Integration Test Focus**: Constitution requires ≥80% adapter coverage. Using integration tests instead of mocks:
   - Validates actual database behavior (event persistence and replay)
   - Catches serialization issues (JSON event storage)
   - Faster to write (no complex mock setup)
   - More maintainable (real behavior, not mock assumptions)
   - H2 in-memory database provides fast test execution

3. **Signals and Observables**: Using both patterns in Angular:
   - Signals: Component-local state (creature HP, current turn) - simpler, better performance
   - Observables: API communication, cross-component events - established pattern with RxJS
   - Angular 18 supports both, allows gradual migration to signal-based reactivity

**No Alternatives Rejected**: All choices align with constitution and project requirements.
