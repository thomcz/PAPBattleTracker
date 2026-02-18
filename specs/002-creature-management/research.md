# Research: Creature Management

**Feature**: 002-creature-management
**Date**: 2026-02-16
**Status**: Complete

## Overview

This document contains research findings and technology decisions for implementing creature management in the PAPBattleTracker battle system.

## Research Topics

### 1. Event Sourcing Patterns for Creature Management

**Question**: Should creatures be stored as separate aggregates or as part of the Battle aggregate?

**Research Findings**:

Domain-Driven Design (DDD) aggregate patterns:
- **Aggregate Root**: Entity that controls access to its internal parts
- **Aggregate Boundary**: Defines transactional consistency boundary
- **Value Objects**: Objects without identity, defined by their attributes

Creature lifecycle analysis:
- Creatures only exist within battle context
- No meaningful operations on creatures outside a battle
- Creature state changes always in context of battle (combat, HP damage, etc.)
- No need for global creature identity (two battles can have "Goblin #1")

**Decision**: Store creature state as events within Battle aggregate's event stream (not as separate Creature aggregate).

**Rationale**:
- Creatures have no independent lifecycle (only exist within battle context)
- Simplifies event ordering and consistency (single event stream per battle)
- Aligns with DDD aggregate pattern (Battle is aggregate root, Creature is value object)
- Reduces complexity (no need for distributed transactions across aggregates)
- Natural transactional boundary (all creature operations within battle transaction)

**Alternatives Considered**:
1. **Separate Creature Aggregate**
   - Pros: Could support creature sharing across battles, independent creature history
   - Cons: Requires distributed transactions, saga patterns for consistency, over-engineered for use case
   - Rejection reason: Creatures don't have independent identity outside battles. This would require complex saga patterns for consistency.

2. **Snapshot-based storage (current state only)**
   - Pros: Simpler queries, better read performance
   - Cons: Loses audit trail, no time-travel capabilities, harder to debug
   - Rejection reason: Event sourcing provides full audit trail and time-travel capabilities that are valuable for game session review.

**Implementation Approach**:
```kotlin
// Creature operations emit events within Battle's event stream:
sealed class BattleEvent {
    data class CreatureAdded(
        val creatureId: UUID,
        val name: String,
        val type: CreatureType,
        // ... other attributes
    ) : BattleEvent

    data class CreatureUpdated(
        val creatureId: UUID,
        val name: String,
        // ... updated attributes
    ) : BattleEvent

    data class CreatureRemoved(
        val creatureId: UUID
    ) : BattleEvent
}

// Battle aggregate applies events to internal creature collection:
class Battle {
    private val creatures = mutableListOf<Creature>()

    fun applyEvent(event: BattleEvent): Battle {
        return when(event) {
            is CreatureAdded -> this.copy(
                creatures = creatures + Creature(...)
            )
            is CreatureUpdated -> this.copy(
                creatures = creatures.map {
                    if (it.id == event.creatureId) updateCreature(it, event)
                    else it
                }
            )
            // ...
        }
    }
}
```

---

### 2. Initiative Sorting Algorithm

**Question**: How should initiative sorting handle ties? What's the performance characteristic?

**Research Findings**:

Sorting algorithms comparison:
- **Stable sort**: Preserves original order for equal elements - O(n log n)
- **Unstable sort**: May change relative order of equal elements - O(n log n)
- **Manual ordering**: User drag-and-drop - O(1) sort, O(n) user time

Tabletop RPG conventions:
- D&D 5e: Ties broken by DM discretion or dexterity score
- Pathfinder: Dexterity modifier tiebreaker
- Most systems: Some deterministic or semi-deterministic tiebreaker

**Decision**: Use stable sort (preserves original order for tied initiatives) with O(n log n) complexity.

**Rationale**:
- Stable sort provides predictable behavior when creatures tie on initiative
- Kotlin's `sortedByDescending` is stable by default (uses TimSort)
- Performance acceptable for typical scale (4-6 creatures typical, 20 max)
- O(n log n) = ~86 comparisons for 20 creatures = negligible (<1ms)
- Matches tabletop RPG conventions (DM resolves ties by choosing order)
- Deterministic: event replay produces same order

**Alternatives Considered**:
1. **Dexterity tiebreaker**
   - Pros: Matches D&D 5e rules exactly
   - Cons: Requires adding dexterity attribute to Creature (scope creep)
   - Rejection reason: Creature model doesn't include dexterity attribute (out of scope for MVP)

2. **Random tiebreaker**
   - Pros: Simulates dice roll, feels "natural"
   - Cons: Non-deterministic, event replay produces different results
   - Rejection reason: Non-deterministic sorting causes confusion in event replay and debugging

3. **Manual ordering UI**
   - Pros: Maximum flexibility, user control
   - Cons: Adds UI complexity, slower workflow, requires storing order separately
   - Rejection reason: Deferred to future enhancement (P3 priority)

**Implementation Approach**:
```kotlin
// When CombatStarted event is applied:
fun sortCreaturesByInitiative(): List<Creature> {
    // Kotlin's sortedByDescending is stable
    return creatures.sortedByDescending { it.initiative }
}

// If creature initiative changes mid-combat:
fun updateCreatureInitiative(creatureId: UUID, newInitiative: Int) {
    // Emit CreatureUpdated event
    // Re-sort creatures
    // Adjust currentTurnIndex if needed
}
```

Performance validation:
- 20 creatures, O(n log n) ≈ 86 operations
- Modern CPU: ~10ns per comparison
- Total: <1μs (well under 10ms target)

---

### 3. Monster Auto-Removal Strategy

**Question**: How should monster removal on combat end be modeled in event sourcing?

**Research Findings**:

Event sourcing patterns for deletion:
- **Hard delete**: Remove from event stream (anti-pattern, breaks immutability)
- **Soft delete**: Add flag, filter in queries (works but adds complexity)
- **Explicit removal event**: Event represents deletion intent (recommended)
- **Implicit removal**: Derived from other events (e.g., combat end implies monster removal)

Requirements analysis:
- User Story 5: "When I end combat, monster creatures are automatically removed"
- Combat end already emits `CombatEnded` event
- Monster removal is consequence of combat end, not independent action
- Need audit trail showing when/why creatures disappeared

**Decision**: Emit `CombatEnded` event that includes list of removed monster IDs. Domain logic filters monsters during event application.

**Rationale**:
- Explicit event captures intent (combat ended → monsters removed)
- Event replay correctly reconstructs state (monsters disappear on combat end)
- Audit trail shows when/why creatures were removed
- Aligns with event sourcing principle (state changes through events only)
- No separate user action needed (automatic on combat end)

**Alternatives Considered**:
1. **Soft delete flag on Creature**
   - Pros: Preserves creature data, can "undelete"
   - Cons: Creatures still in list, need filtering everywhere
   - Rejection reason: Creatures should actually be removed from battle, not just hidden

2. **Separate `MonstersRemoved` event**
   - Pros: Explicit removal event, clear audit trail
   - Cons: Two events for single user action, more complex event ordering
   - Rejection reason: Monster removal is inherent to combat end, not a separate action

3. **Client-side filtering (don't remove from backend)**
   - Pros: Simpler backend, flexible frontend
   - Cons: State divergence, backend has stale data
   - Rejection reason: State must be authoritative on backend for multi-client consistency

**Implementation Approach**:
```kotlin
data class CombatEnded(
    override val battleId: UUID,
    override val eventId: UUID,
    override val timestamp: Instant,
    override val userId: UUID,
    val outcome: CombatOutcome,
    val removedMonsterIds: List<UUID>  // NEW: Track removed monsters
) : BattleEvent

fun Battle.applyEvent(event: CombatEnded): Battle {
    return this.copy(
        status = CombatStatus.ENDED,
        creatures = creatures.filter { it.id !in event.removedMonsterIds }
    )
}

// When ending combat:
fun endCombat(outcome: CombatOutcome): List<BattleEvent> {
    val monstersToRemove = creatures.filter { it.type == CreatureType.MONSTER }
    return listOf(
        CombatEnded(
            // ...
            removedMonsterIds = monstersToRemove.map { it.id }
        )
    )
}
```

---

### 4. Frontend State Management for Creatures

**Question**: How should creature list state be managed in Angular to ensure reactivity and type safety?

**Research Findings**:

Angular state management options:
- **Signals** (Angular 16+): Fine-grained reactivity, built-in, simple API
- **RxJS BehaviorSubject**: Observable-based, older pattern, more boilerplate
- **NgRx/Redux**: Global store, complex, overkill for small features
- **Component-local state**: Simple, but hard to share across components

Angular Signals API:
- `signal<T>()`: Create writable signal
- `computed<T>()`: Derived state from other signals
- `.asReadonly()`: Expose signal without write access
- Template integration: `{{ mySignal() }}` automatically subscribes

Project context:
- Auth feature already uses Signals successfully
- Battle list uses Signals for reactive updates
- TypeScript types defined for Creature interface
- Need to share creature list across multiple components (list, card, dialog)

**Decision**: Use Angular signals in use cases to manage creature list reactively.

**Rationale**:
- Signals provide fine-grained reactivity (only update affected UI components)
- Already used successfully for auth state and battle list (consistency)
- Computed signals for derived state (e.g., defeated creatures, initiative order)
- TypeScript type safety for creature interfaces
- No additional dependencies (built into Angular 16+)
- Simpler API than RxJS for synchronous state

**Alternatives Considered**:
1. **NgRx/Redux**
   - Pros: Standardized patterns, dev tools, time-travel debugging
   - Cons: Massive boilerplate, overkill for feature scope, learning curve
   - Rejection reason: Overkill for feature scope, adds complexity without benefit

2. **RxJS BehaviorSubject**
   - Pros: Familiar pattern, existing team knowledge
   - Cons: More boilerplate, older approach, signals are newer best practice
   - Rejection reason: Signals are newer Angular best practice with better performance and simpler API

3. **Component-local state**
   - Pros: Simplest possible implementation, no service needed
   - Cons: Can't share state, duplication across components, prop drilling
   - Rejection reason: Creature list needs to be shared across components (list, card, dialog)

**Implementation Approach**:
```typescript
@Injectable({ providedIn: 'root' })
export class CreatureManagementUseCase {
  // Private writable signal
  private readonly creaturesSignal = signal<Creature[]>([]);

  // Public readonly signal
  public readonly creatures = this.creaturesSignal.asReadonly();

  // Computed derived state
  public readonly defeatedCreatures = computed(() =>
    this.creatures().filter(c => c.currentHp === 0)
  );

  public readonly sortedByInitiative = computed(() =>
    [...this.creatures()].sort((a, b) => b.initiative - a.initiative)
  );

  constructor(private battlePort: BattlePort) {}

  addCreature(battleId: string, creature: CreateCreatureRequest): Observable<Creature> {
    return this.battlePort.addCreature(battleId, creature).pipe(
      tap(newCreature => {
        this.creaturesSignal.update(creatures => [...creatures, newCreature]);
      })
    );
  }
}

// Component usage:
@Component({
  template: `
    @for (creature of creatureUseCase.creatures(); track creature.id) {
      <app-creature-card [creature]="creature" />
    }

    <p>Defeated: {{ creatureUseCase.defeatedCreatures().length }}</p>
  `
})
export class CreatureListComponent {
  constructor(public creatureUseCase: CreatureManagementUseCase) {}
}
```

---

### 5. Validation Strategy

**Question**: Where should validation occur: frontend, backend, or both? What validation rules apply?

**Research Findings**:

Validation layers:
- **Frontend validation**: Immediate feedback, better UX, can be bypassed
- **Backend validation**: Security boundary, cannot bypass, slower feedback
- **Domain validation**: Business rules, cannot bypass, framework-independent

Project requirements (from spec):
- Name: non-blank text
- Type: PLAYER or MONSTER (enum)
- Current HP: non-negative integer, ≤ max HP
- Max HP: positive integer
- Initiative: any integer (can be negative in some RPG systems)
- Armor class: non-negative integer

Spring Validation annotations:
- `@field:NotBlank`: Ensures non-empty string
- `@field:Positive`: > 0
- `@field:PositiveOrZero`: ≥ 0
- `@field:Min(value)`: ≥ value
- `@field:Max(value)`: ≤ value

Angular Validators:
- `Validators.required`: Non-null value
- `Validators.min(n)`: ≥ n
- `Validators.max(n)`: ≤ n
- `Validators.pattern(regex)`: Matches pattern
- Custom validators: Complex business rules

**Decision**: Multi-layer validation with domain-level validation in Creature value object, application-level validation in DTOs (Spring Validation annotations), and frontend validation in reactive forms.

**Rationale**:
- Domain validation enforces business rules (cannot be bypassed, framework-independent)
- DTO validation provides early failure with clear HTTP 400 errors
- Frontend validation provides immediate user feedback (better UX)
- Defense in depth (validation at each layer catches different error classes)
- Aligns with hexagonal architecture (domain rules in domain layer)

**Alternatives Considered**:
1. **Backend-only validation**
   - Pros: Single source of truth, simpler maintenance
   - Cons: Poor UX (network roundtrip required to show errors)
   - Rejection reason: Poor UX - user waits for server response to see validation errors

2. **Frontend-only validation**
   - Pros: Immediate feedback, no backend changes
   - Cons: Security hole (can be bypassed with API calls), business rules duplicated
   - Rejection reason: Insecure - malicious users can bypass validation with direct API calls

3. **Single validation layer (application layer only)**
   - Pros: Less code duplication, single validation location
   - Cons: Mixes framework concerns with business rules, not framework-independent
   - Rejection reason: Violates hexagonal architecture - domain rules must be in domain layer

**Implementation Approach**:

**Domain Layer (Kotlin)**:
```kotlin
data class Creature(
    val id: UUID,
    val name: String,
    val type: CreatureType,
    val currentHp: Int,
    val maxHp: Int,
    val initiative: Int,
    val armorClass: Int
) {
    init {
        require(name.isNotBlank()) { "Creature name cannot be blank" }
        require(maxHp > 0) { "Max HP must be positive, was: $maxHp" }
        require(currentHp >= 0) { "Current HP cannot be negative, was: $currentHp" }
        require(currentHp <= maxHp) { "Current HP ($currentHp) cannot exceed max HP ($maxHp)" }
        require(armorClass >= 0) { "Armor class cannot be negative, was: $armorClass" }
    }
}
```

**Application Layer (Kotlin)**:
```kotlin
data class CreateCreatureRequest(
    @field:NotBlank(message = "Name is required")
    val name: String,

    @field:NotNull(message = "Type is required")
    val type: CreatureType,

    @field:PositiveOrZero(message = "Current HP must be non-negative")
    val currentHp: Int,

    @field:Positive(message = "Max HP must be positive")
    val maxHp: Int,

    val initiative: Int,  // No validation: can be negative

    @field:PositiveOrZero(message = "Armor class must be non-negative")
    val armorClass: Int
)
```

**Frontend Layer (Angular)**:
```typescript
this.creatureForm = new FormGroup({
  name: new FormControl('', [Validators.required, Validators.minLength(1)]),
  type: new FormControl('', [Validators.required]),
  currentHp: new FormControl(0, [Validators.required, Validators.min(0)]),
  maxHp: new FormControl(1, [Validators.required, Validators.min(1)]),
  initiative: new FormControl(0, [Validators.required]),
  armorClass: new FormControl(10, [Validators.required, Validators.min(0)])
}, {
  validators: [this.currentHpLessThanMaxHp()]  // Custom cross-field validator
});

private currentHpLessThanMaxHp(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const current = group.get('currentHp')?.value;
    const max = group.get('maxHp')?.value;
    return current > max ? { currentHpExceedsMax: true } : null;
  };
}
```

---

## Summary

All research complete. No NEEDS CLARIFICATION items remaining. Key decisions:

1. ✅ Creatures as value objects within Battle aggregate (not separate aggregates)
2. ✅ Stable sort for initiative ordering (Kotlin's sortedByDescending)
3. ✅ Monster removal modeled in CombatEnded event with removedMonsterIds field
4. ✅ Angular Signals for frontend state management (consistency with existing features)
5. ✅ Multi-layer validation (domain + application + frontend)

Ready to proceed to Phase 1: Data Model and API Contracts.
