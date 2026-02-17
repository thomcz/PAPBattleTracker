# Implementation Plan: Creature Management

**Branch**: `002-creature-management` | **Date**: 2026-02-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-creature-management/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Game Masters need to add, edit, and remove creatures (players and monsters) in battles with their combat statistics (name, type, HP, initiative, armor class). This feature implements full CRUD operations for creatures within the Battle aggregate using event sourcing, automatic initiative-based sorting when combat starts, and auto-removal of monsters when combat ends while retaining player creatures.

## Technical Context

**Language/Version**: Kotlin 1.9.25 (JVM 25), TypeScript (Angular 21.0.2)
**Primary Dependencies**: Spring Boot 3.5.7, Spring Data JPA, Jackson (Kotlin backend); Angular 21, RxJS, Angular Signals (frontend)
**Storage**: H2 in-memory database with event sourcing (events stored as JSON)
**Testing**: JUnit 5 + Mockito-Kotlin (backend); Vitest + jsdom (frontend)
**Target Platform**: JVM backend server, modern web browsers (frontend)
**Project Type**: Web application (backend + frontend)
**Performance Goals**:
- Backend: API response time p95 ≤300ms, support 1000 concurrent users
- Frontend: Creature add/edit operations <1s, support up to 20 creatures without UI degradation
**Constraints**:
- Event sourcing: All creature operations must emit events for audit trail
- Hexagonal architecture: Domain logic has zero framework dependencies
- 100% domain logic test coverage required (TDD)
**Scale/Scope**: Up to 20 creatures per battle, typical encounters 4-6 creatures

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Hexagonal Architecture Discipline ✅ PASS

- **Domain Layer**: Creature value object, Battle aggregate, event types (CreatureAdded, CreatureUpdated, CreatureRemoved) have NO dependencies on Spring Boot or Angular
- **Dependencies Flow Inward**: Infrastructure (REST controllers, JPA repositories) → Application (BattleService use cases) → Domain (Battle, Creature, events)
- **Ports Pattern**: Backend uses repository ports; Frontend uses BattlePort interface
- **Business Logic Location**: Creature validation, initiative sorting, monster auto-removal logic resides in Battle aggregate domain methods

**Justification**: Fully compliant. Creature management fits naturally into existing hexagonal architecture.

### Test-Driven Development (TDD) ✅ PASS (with plan)

- **Red-Green-Refactor**: Tests will be written first for all creature operations
- **Coverage Targets**:
  - Domain logic (Battle.addCreature(), Battle.updateCreature(), Creature validation): 100%
  - Application services (BattleService creature methods): ≥90%
  - REST endpoints (BattleController creature operations): ≥80%
  - Frontend use cases (creature management): ≥90%
- **Integration Tests**: Required for all new REST endpoints (`POST /api/battles/{id}/creatures`, `PUT /api/battles/{id}/creatures/{creatureId}`, `DELETE /api/battles/{id}/creatures/{creatureId}`)

**Justification**: TDD workflow will be strictly followed. Tests written before implementation in each task.

### User Experience Consistency ✅ PASS

- **Visual Consistency**: Will use existing Angular component library patterns from auth features
- **Behavioral Consistency**: Error messages follow established format (already used in battle creation)
- **Cross-Backend Consistency**: Kotlin backend only (Go backend out of scope for this feature)
- **Accessibility**: Keyboard navigation for creature list, WCAG 2.1 AA compliance (focus indicators, color contrast)
- **Responsive Design**: Mobile-first approach, test on 320px (mobile), 768px (tablet), 1920px (desktop)

**Justification**: Feature extends existing battle management UI with consistent patterns.

### Performance & Scalability Standards ✅ PASS

**Backend Performance Targets**:
- Creature CRUD operations: p95 ≤200ms (simpler than battle creation)
- Event replay with 20 creatures: <1s
- Initiative sorting: O(n log n) with stable sort, <10ms for 20 creatures
- Concurrent battles: Support 1000 users with creatures without degradation

**Frontend Performance Targets**:
- Creature add form: <500ms to open and render
- Initiative re-sort on combat start: <100ms for 20 creatures
- Creature roster rendering: Virtual scrolling NOT needed (max 20 creatures)
- Optimistic UI updates: Show creature immediately, rollback on server error

**Optimization Requirements**:
- Backend: Event sourcing already efficient (append-only writes)
- Frontend: Signals for reactive updates (already in use), debounce form inputs 300ms
- Database: Index on battle_id for creature queries (likely already exists from battle events)

**Justification**: Performance requirements well within constitution targets for this feature scope.

## Project Structure

### Documentation (this feature)

```text
specs/002-creature-management/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── creature-api.yaml
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── src/main/kotlin/de/thomcz/pap/battle/backend/
│   ├── domain/
│   │   ├── model/
│   │   │   ├── Creature.kt                    # NEW: Value object with validation
│   │   │   ├── CreatureType.kt                # NEW: Enum (PLAYER, MONSTER)
│   │   │   ├── Battle.kt                      # MODIFIED: Add creature management methods
│   │   │   └── events/
│   │   │       ├── CreatureAdded.kt           # NEW: Event
│   │   │       ├── CreatureUpdated.kt         # NEW: Event
│   │   │       ├── CreatureRemoved.kt         # NEW: Event
│   │   │       └── CombatEnded.kt             # MODIFIED: Include monsters removed
│   │   └── port/
│   │       └── (existing BattleRepository)     # NO CHANGES: Reuse existing event store port
│   ├── application/
│   │   ├── service/
│   │   │   └── BattleService.kt               # MODIFIED: Add creature CRUD methods
│   │   └── dto/
│   │       ├── CreateCreatureRequest.kt       # NEW: DTO
│   │       ├── UpdateCreatureRequest.kt       # NEW: DTO
│   │       └── CreatureResponse.kt            # NEW: DTO
│   └── infrastructure/
│       └── adapter/in/rest/
│           └── BattleController.kt            # MODIFIED: Add creature endpoints
└── src/test/kotlin/
    ├── domain/model/
    │   ├── CreatureTest.kt                    # NEW: Unit tests for Creature value object
    │   └── BattleCreatureTest.kt              # NEW: Unit tests for Battle creature methods
    ├── application/service/
    │   └── BattleServiceCreatureTest.kt       # NEW: Service tests for creature operations
    └── infrastructure/adapter/in/rest/
        └── BattleControllerCreatureTest.kt    # NEW: Integration tests for creature endpoints

frontend-angular/
├── src/app/
│   ├── core/
│   │   ├── domain/
│   │   │   ├── models/
│   │   │   │   └── battle.model.ts            # MODIFIED: Add Creature interface
│   │   │   └── use-cases/
│   │   │       ├── add-creature.use-case.ts   # NEW: Use case for adding creatures
│   │   │       ├── update-creature.use-case.ts # NEW: Use case for editing creatures
│   │   │       └── remove-creature.use-case.ts # NEW: Use case for removing creatures
│   │   └── ports/
│   │       └── battle.port.ts                 # MODIFIED: Add creature methods to port
│   ├── adapters/
│   │   └── api/
│   │       └── battle-api.adapter.ts          # MODIFIED: Implement creature API calls
│   └── features/
│       └── battle/
│           ├── creature-list/
│           │   ├── creature-list.component.ts # NEW: Display creatures in roster
│           │   ├── creature-list.component.html
│           │   └── creature-list.component.spec.ts
│           ├── creature-card/
│           │   ├── creature-card.component.ts # NEW: Individual creature display
│           │   ├── creature-card.component.html
│           │   └── creature-card.component.spec.ts
│           ├── creature-dialog/
│           │   ├── creature-dialog.component.ts # NEW: Add/edit creature form
│           │   ├── creature-dialog.component.html
│           │   └── creature-dialog.component.spec.ts
│           └── battle-detail/
│               └── battle-detail.component.ts # MODIFIED: Integrate creature list
└── src/app/features/battle/
    └── (test files co-located with components)
```

**Structure Decision**: Web application structure with separate backend and frontend. Backend follows existing Spring Boot hexagonal architecture with domain/application/infrastructure layers. Frontend follows existing Angular hexagonal architecture with core/adapters/features layers. All new files integrate into existing structure without architectural changes.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

*No violations - all constitution principles satisfied.*

## Phase 0: Research & Technology Decisions

### Event Sourcing Patterns for Creature Management

**Decision**: Store creature state as events within Battle aggregate's event stream (not as separate Creature aggregate).

**Rationale**:
- Creatures have no independent lifecycle (only exist within battle context)
- Simplifies event ordering and consistency (single event stream per battle)
- Aligns with DDD aggregate pattern (Battle is aggregate root, Creature is value object)
- Reduces complexity (no need for distributed transactions across aggregates)

**Alternatives considered**:
- **Separate Creature Aggregate**: Rejected because creatures don't have independent identity outside battles. This would require complex saga patterns for consistency.
- **Snapshot-based storage**: Rejected because event sourcing provides full audit trail and time-travel capabilities that are valuable for game session review.

**Implementation approach**:
- Creature operations (add/update/remove) emit events: `CreatureAdded`, `CreatureUpdated`, `CreatureRemoved`
- Battle aggregate applies events to internal creature collection (List<Creature>)
- Event replay reconstructs creature list from event history
- Initiative sorting happens during combat start, stored in `CombatStarted` event as sorted creature IDs

### Initiative Sorting Algorithm

**Decision**: Use stable sort (preserves original order for tied initiatives) with O(n log n) complexity.

**Rationale**:
- Stable sort provides predictable behavior when creatures tie on initiative
- Kotlin's `sortedByDescending` is stable by default
- Performance acceptable for typical scale (4-6 creatures, max 20)
- Matches tabletop RPG conventions (DM resolves ties by choosing order)

**Alternatives considered**:
- **Dexterity tiebreaker**: Rejected because Creature model doesn't include dexterity attribute (out of scope for MVP)
- **Random tiebreaker**: Rejected because non-deterministic sorting causes confusion in event replay
- **Manual ordering UI**: Deferred to future enhancement (P3 priority)

**Implementation approach**:
- When `CombatStarted` event is applied, sort creatures by initiative descending
- Store sorted order in Battle state (no event needed, derived from creature list + initiative values)
- If creature initiative changes mid-combat, re-sort and update current turn index

### Monster Auto-Removal Strategy

**Decision**: Emit `CombatEnded` event that includes list of removed monster IDs. Domain logic filters monsters during event application.

**Rationale**:
- Explicit event captures intent (combat ended → monsters removed)
- Event replay correctly reconstructs state (monsters disappear on combat end)
- Audit trail shows when/why creatures were removed
- Aligns with event sourcing principle (state changes through events only)

**Alternatives considered**:
- **Soft delete flag**: Rejected because creatures should actually be removed from battle, not just hidden
- **Separate `MonstersRemoved` event**: Rejected because monster removal is inherent to combat end, not a separate action
- **Client-side filtering**: Rejected because state must be authoritative on backend

**Implementation approach**:
- `CombatEnded` event includes `removedMonsterIds: List<UUID>`
- When applying `CombatEnded`, Battle.applyEvent() removes creatures matching those IDs
- Frontend receives updated creature list after combat end API call

### Frontend State Management for Creatures

**Decision**: Use Angular signals in use cases to manage creature list reactively.

**Rationale**:
- Signals provide fine-grained reactivity (only update affected UI components)
- Already used successfully for auth state and battle list
- Computed signals for derived state (e.g., defeated creatures, initiative order)
- TypeScript type safety for creature interfaces

**Alternatives considered**:
- **NgRx/Redux**: Rejected as overkill for feature scope, adds complexity without benefit
- **RxJS BehaviorSubject**: Rejected in favor of newer Signals API (better performance, simpler API)
- **Component-local state**: Rejected because creature list needs to be shared across components (list, card, dialog)

**Implementation approach**:
- `AddCreatureUseCase` exposes `creatures: Signal<Creature[]>` from internal `WritableSignal`
- Components inject use case and read signal: `creatures = useCase.creatures()`
- Computed signals for derived state: `defeatedCreatures = computed(() => creatures().filter(c => c.currentHp === 0))`
- Template uses `@for` to render creature list: `@for (creature of creatures(); track creature.id) { ... }`

### Validation Strategy

**Decision**: Multi-layer validation with domain-level validation in Creature value object, application-level validation in DTOs (Spring Validation annotations), and frontend validation in reactive forms.

**Rationale**:
- Domain validation enforces business rules (cannot be bypassed)
- DTO validation provides early failure with clear HTTP 400 errors
- Frontend validation provides immediate user feedback (better UX)
- Defense in depth (validation at each layer catches different error classes)

**Alternatives considered**:
- **Backend-only validation**: Rejected because poor UX (roundtrip required to show errors)
- **Frontend-only validation**: Rejected because insecure (can be bypassed)
- **Single validation layer**: Rejected because mixes concerns (domain rules vs. transport layer validation)

**Implementation approach**:
- Domain: Creature data class with `init {}` block throwing IllegalArgumentException for invalid data
- Application: CreateCreatureRequest DTO with `@field:NotBlank`, `@field:Positive`, `@field:Min(0)` annotations
- Frontend: FormGroup with Validators.required, Validators.min(0), custom validators for HP constraints

## Phase 1: Design Artifacts

### Data Model

See [data-model.md](./data-model.md) for complete entity definitions, relationships, and event schemas.

### API Contracts

See [contracts/creature-api.yaml](./contracts/creature-api.yaml) for OpenAPI specification of creature management endpoints.

### Quickstart Guide

See [quickstart.md](./quickstart.md) for developer setup and testing instructions for creature management feature.
