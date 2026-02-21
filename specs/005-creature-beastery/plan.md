# Implementation Plan: Creature Beastery

**Branch**: `005-creature-beastery` | **Date**: 2026-02-20 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/005-creature-beastery/spec.md`

## Summary

Implement a creature library (beastery) feature enabling users to create and manage reusable creature templates that can be selected and used in battles. The feature provides CRUD operations for creatures with ability management, persistent storage, and integration with the existing battle system. P1 priority features include create/read creatures and select from beastery in battles; P2 includes edit/delete; P3 includes duplication.

## Technical Context

**Language/Version**:
- Backend: Kotlin 1.9.25 (JVM 21)
- Frontend: Angular 18 + TypeScript 5.x

**Primary Dependencies**:
- Backend: Spring Boot 3.5.7, Spring Data JPA, Spring Security, Jackson
- Frontend: Angular 18, RxJS 7.x, Angular Signals

**Storage**:
- Backend: H2 in-memory database with event sourcing (JSON events)
- Frontend: Angular Signals for state, browser localStorage for persistence

**Testing**:
- Backend: JUnit 5 + Mockito-Kotlin (unit/integration), 80%+ coverage
- Frontend: Jasmine + Karma (@testing-library/angular), 80%+ coverage

**Target Platform**: Web (multi-tier application)

**Project Type**: Web application (Spring Boot backend + Angular 18 frontend)

**Performance Goals**:
- Backend: API response p50 ≤100ms, p95 ≤300ms
- Frontend: FCP ≤1.8s, TTI ≤3.8s, search 50+ creatures in <5s
- Create creature flow: <2 minutes, Select from beastery: <20 seconds

**Constraints**:
- Hexagonal (ports & adapters) architecture mandatory
- TDD with tests before implementation
- 80%+ test coverage minimum
- Hard delete creatures (no recovery)
- Battle creature copies are independent (one-way copy)

**Scale/Scope**:
- Single-user application (personal battle tracker)
- MVP: CRUD creatures + beastery selection in battles
- ~50-100 creatures per user estimated
- Creatures reusable across unlimited battles

## Constitution Check

*GATE: Must pass before Phase 1 design. Re-check after design.*

✅ **Hexagonal Architecture Discipline**:
- Requirement: Domain layer (entities, use cases) has zero framework dependencies
- Plan: Creature entity and use cases in domain; Adapters for REST, database, security in infrastructure
- Status: PASS - Hexagonal structure already established in project

✅ **Test-Driven Development (TDD)**:
- Requirement: Tests before implementation, 80%+ coverage (domain 100%), integration tests required
- Plan: Write domain tests first, then REST endpoint tests; establish coverage baselines
- Status: PASS - Project has TDD discipline established

✅ **User Experience Consistency**:
- Requirement: Consistent UI patterns, error handling, loading states
- Plan: Use existing Angular components, follow project design patterns, use signals for state
- Status: PASS - Angular frontend follows established patterns

✅ **Performance & Scalability**:
- Requirement: API response <300ms p95, search/filtering performant
- Plan: Index by name/user in H2, implement search query optimization, pagination for large lists
- Status: PASS - Scale is single-user, no special optimization needed

## Project Structure

### Documentation (this feature)

```text
specs/005-creature-beastery/
├── plan.md              # This file
├── research.md          # Phase 0: Research & unknowns
├── data-model.md        # Phase 1: Domain entities & persistence
├── quickstart.md        # Phase 1: Developer quick reference
├── contracts/           # Phase 1: API contracts
│   ├── create-creature.yaml
│   ├── list-creatures.yaml
│   ├── get-creature.yaml
│   ├── update-creature.yaml
│   ├── delete-creature.yaml
│   └── duplicate-creature.yaml
└── tasks.md             # Phase 2: Implementation tasks (from /speckit.tasks)
```

### Source Code (Web Application)

#### Backend (Kotlin)

```text
backend/src/main/kotlin/de/thomcz/pap/battle/backend/
├── domain/
│   ├── creature/                    # Creature aggregate root
│   │   ├── Creature.kt              # Entity (name, HP, AC, abilities)
│   │   ├── CreatureId.kt            # Value object
│   │   ├── Ability.kt               # Value object
│   │   └── ports/
│   │       ├── CreatureRepository.kt # Port (interface)
│   │       └── CreatureEvents.kt     # Event sourcing events
│   ├── beastery/                    # Beastery aggregate
│   │   └── BeasteryService.kt        # Domain service (not event sourcing yet)
│   └── usecase/
│       ├── CreateCreatureUseCase.kt
│       ├── ListCreaturesUseCase.kt
│       ├── GetCreatureUseCase.kt
│       ├── UpdateCreatureUseCase.kt
│       ├── DeleteCreatureUseCase.kt
│       └── DuplicateCreatureUseCase.kt
├── application/
│   └── creature/
│       ├── CreatureApplicationService.kt
│       └── CreatureDTO.kt
└── infrastructure/
    ├── persistence/
    │   ├── jpa/
    │   │   ├── CreatureJpaRepository.kt
    │   │   ├── CreatureJpaEntity.kt
    │   │   └── AbilityJpaEntity.kt
    │   └── event/
    │       └── EventStore.kt
    └── rest/
        ├── CreatureController.kt
        ├── CreatureResponse.kt
        └── CreateCreatureRequest.kt

backend/src/test/kotlin/de/thomcz/pap/battle/backend/creature/
├── domain/
│   ├── CreatureTest.kt
│   ├── AbilityTest.kt
│   └── CreatureRepositoryTest.kt
├── application/
│   ├── CreatureApplicationServiceTest.kt
│   └── *UseCaseTest.kt
└── infrastructure/
    ├── CreatureControllerTest.kt
    ├── CreatureJpaRepositoryTest.kt
    └── EventStoreTest.kt
```

#### Frontend (Angular)

```text
frontend-angular/src/app/
├── core/
│   ├── creature/                    # Domain ports
│   │   ├── creature.ts              # Entity interface
│   │   └── creature.repository.ts   # Repository port
│   └── beastery/
│       └── beastery.repository.ts   # Port
├── adapters/
│   ├── creature/
│   │   ├── creature.api.ts          # HTTP adapter
│   │   └── creature.local.ts        # localStorage adapter
│   └── shared/
│       └── token.service.ts
├── features/
│   └── beastery/                    # Feature module
│       ├── components/
│       │   ├── creature-list/
│       │   ├── creature-form/
│       │   ├── creature-detail/
│       │   └── creature-duplicate/
│       ├── services/
│       │   └── beastery.service.ts  # Use case service
│       ├── state/
│       │   └── beastery.signal.ts   # Signal-based state
│       ├── beastery.routes.ts
│       └── beastery.page.ts
└── shared/
    ├── components/
    └── directives/

frontend-angular/src/app/features/beastery/
├── **/*.spec.ts                     # Component & service tests
└── e2e/
    └── beastery.e2e.ts
```

**Structure Decision**: Web application (backend + frontend) - Kotlin/Spring backend with H2, Angular 18 frontend. Both follow hexagonal architecture with clear ports/adapters separation.

## Complexity Tracking

✅ **No Constitution violations** - All gates passed.

---

## Phase 0: Research (COMPLETE ✅)

**Output**: [research.md](research.md)

**Findings**:
- Event sourcing approach finalized (H2 events + snapshots)
- Creature copying strategy defined (deep copy at battle creation)
- Database schema designed (event_events, creature_snapshots)
- Angular signals pattern selected for state management
- API contract patterns established (RESTful JSON)
- Creature-battle integration clarified (one-way copy, no back-reference)

**All NEEDS CLARIFICATION items resolved. Ready for Phase 1.**

---

## Phase 1: Design & Contracts (COMPLETE ✅)

**Output Artifacts**:
- [data-model.md](data-model.md) - Entity definitions, validation rules, events, schema
- [contracts/creature-api.yaml](contracts/creature-api.yaml) - OpenAPI specification
- [quickstart.md](quickstart.md) - Developer quick reference
- [plan.md](plan.md) - This file (implementation plan)

### Data Model Deliverables

**Entities Defined**:
- Creature aggregate root (name, HP, AC, abilities, timestamps)
- Ability value object (name, description, damage, range, type)
- CreatureSnapshot for event sourcing materialization
- Event types: CreatedEvent, UpdatedEvent, DeletedEvent, AbilityAdded/Removed

**Database Schema**:
- creature_events (immutable event log with JSON payload)
- creature_snapshots (materialized view for queries)
- Indexes for user_id, deleted, search by name

**Validation Rules**:
- Name: 1-100 chars, not empty
- hitPoints: > 0, ≤ 1000
- armorClass: 0-20
- abilities: optional (can be empty initially)

### API Contracts Delivered

**6 Endpoints Specified**:
- POST /api/creatures (create)
- GET /api/creatures (list + search)
- GET /api/creatures/{id} (get detail)
- PUT /api/creatures/{id} (update)
- DELETE /api/creatures/{id} (hard delete)
- POST /api/creatures/{id}/duplicate (duplicate)

**Full OpenAPI 3.0 Specification**:
- Request/response schemas
- Validation constraints
- HTTP status codes
- JWT bearer token authentication
- Error response format

### Architecture Finalized

**Backend Structure**:
```
domain/creature/
├── Creature.kt (aggregate)
├── Ability.kt (value object)
└── ports/ (interfaces)

application/creature/
├── CreateCreatureUseCase.kt
└── ... other use cases

infrastructure/
├── persistence/jpa/ (adapters)
└── rest/ (REST controller)
```

**Frontend Structure**:
```
core/creature/ (domain ports)
adapters/creature/ (API client)
features/beastery/ (feature module)
├── components/
├── services/
└── state/ (signals)
```

### Readiness for Implementation

✅ **Requirements**: All FR-001 through FR-012 mapped to implementation
✅ **Tests**: Test structure defined (unit, integration, component)
✅ **Architecture**: Hexagonal pattern with clear ports
✅ **Performance**: Targets set (2 min create, 5 sec search, <300ms API)
✅ **TDD**: Test-first approach documented in quickstart
✅ **Coverage**: 80%+ requirement specified with test locations

---

## Recommended Implementation Order

### Phase 2 (from /speckit.tasks):

1. **Domain Tests** (Red phase):
   - CreatureTest.kt (creation, validation, deletion)
   - AbilityTest.kt (add/remove abilities)

2. **Domain Implementation**:
   - Creature.kt aggregate
   - Ability.kt value object
   - CreatureId.kt
   - Event types

3. **Port Definition**:
   - CreatureRepository interface
   - CreatureEventStore interface

4. **Use Cases**:
   - CreateCreatureUseCase (+ test)
   - ListCreaturesUseCase (+ test)
   - GetCreatureUseCase (+ test)
   - UpdateCreatureUseCase (+ test)
   - DeleteCreatureUseCase (+ test)
   - DuplicateCreatureUseCase (+ test)

5. **Infrastructure** (adapters):
   - H2 schema creation
   - CreatureJpaRepository (+ test)
   - EventStoreRepository (+ test)
   - CreatureController (+ integration test)

6. **Frontend** (parallel to backend):
   - BeasteryService (+ test)
   - Beastery signals (+ test)
   - CreatureListComponent (+ test)
   - CreatureFormComponent (+ test)
   - CreatureDetailComponent (+ test)

7. **Integration**:
   - Battle system integration (select from beastery)
   - End-to-end testing

---

## Constitution Compliance Checklist

✅ **Hexagonal Architecture**: Domain layer has zero framework dependencies
✅ **TDD**: Tests before implementation, 80%+ coverage required
✅ **UX Consistency**: Angular components follow project patterns
✅ **Performance**: Targets set and measurable (2 min create, 5 sec search)
✅ **Code Quality**: Complexity limits, naming conventions, static analysis
✅ **Documentation**: JSDoc for public APIs, architecture decisions, quick start

---

**Next Command**: Run `/speckit.tasks` to generate actionable implementation tasks with dependencies

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
