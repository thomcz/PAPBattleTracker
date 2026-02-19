# Implementation Quickstart: Start and Track Battle

**Feature**: 003-start-battle
**Estimated Effort**: 3-4 weeks (backend + frontend + integration)
**Dependencies**: 001-battle-tracker-features (auth), 002-creature-management (creatures)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│ Frontend (Angular)                                          │
│  ├─ Battle Arena Component (turn display, damage dialog)   │
│  ├─ Combat Log Component (paginated event log)             │
│  ├─ Creature Cards (HP, status, defeated styling)          │
│  └─ Ports & Adapters (BattleRepository port + HTTP impl)  │
└─────────────────────────────────────────────────────────────┘
                            ↓ REST API
┌─────────────────────────────────────────────────────────────┐
│ Backend (Kotlin/Spring Boot)                               │
│  ├─ Domain Layer (Battle aggregate, events, use cases)     │
│  ├─ Application Layer (BattleService orchestrates)         │
│  ├─ Infrastructure (JPA persistence, HTTP adapters)        │
│  └─ Events (Immutable event stream with event sourcing)    │
└─────────────────────────────────────────────────────────────┘
                            ↓ Database
┌─────────────────────────────────────────────────────────────┐
│ H2 In-Memory Database (development)                        │
│  ├─ Battle table (aggregate roots)                         │
│  ├─ BattleEvent table (event sourcing)                     │
│  └─ BattleCreature table (creature snapshots)              │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 1: Backend Domain Layer (1 week)

**Goal**: Establish domain logic with 100% test coverage

**Files to Create**:
- `domain/battle/entities/Battle.kt` - Aggregate root
- `domain/battle/entities/BattleCreature.kt` - Value object
- `domain/battle/events/*.kt` - All 6 event types
- `domain/battle/exceptions/*.kt` - Custom exceptions
- `domain/battle/ports/*.kt` - Port interfaces (3 interfaces)
- `domain/battle/usecases/*.kt` - 5 use cases (Create, RollInitiative, ProgressTurn, ApplyDamage, EndBattle)

**Testing Strategy**:
1. Write failing unit tests for each entity/value object
2. Implement validation logic (RED → GREEN → REFACTOR)
3. Test use cases with mocked ports (100% coverage target)
4. Example test structure:
   ```kotlin
   @Test
   fun `applyDamage reduces HP and marks as defeated when HP <= 0`() {
       // Arrange: creature with 5 HP
       // Act: apply 10 damage
       // Assert: HP = 0, status = DEFEATED
   }
   ```

**Key Rules**:
- Domain layer has NO Spring annotations
- Use sealed classes for events
- Immutable entities (data classes with copy())
- Validation in constructors

---

### Phase 2: Backend Application & Infrastructure (1 week)

**Goal**: Wire domain logic into Spring Boot, implement persistence, expose REST API

**Files to Create**:
- `application/services/BattleService.kt` - Orchestrates use cases, manages transaction
- `application/services/BattleEventStore.kt` - Event sourcing manager (append, replay)
- `infrastructure/persistence/jpa/BattleEntity.kt` - JPA entity
- `infrastructure/persistence/jpa/BattleEventEntity.kt` - Event store entity
- `infrastructure/persistence/jpa/BattleJpaRepository.kt` - Spring Data JPA
- `infrastructure/persistence/mappers/BattleMapper.kt` - Domain ↔ JPA mapping
- `infrastructure/rest/BattleController.kt` - 6 REST endpoints (POST /battles, GET, POST turn, etc.)
- `infrastructure/rest/dtos/*.kt` - Request/response DTOs

**Database Schema** (H2):
```sql
CREATE TABLE battle (
    id UUID PRIMARY KEY,
    created_by UUID NOT NULL,
    created_at TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL,
    round INT NOT NULL,
    current_actor_index INT NOT NULL,
    ended_at TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES app_user(id)
);

CREATE TABLE battle_creature (
    id UUID PRIMARY KEY,
    battle_id UUID NOT NULL,
    creature_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    max_hp INT NOT NULL,
    current_hp INT NOT NULL,
    status VARCHAR(20) NOT NULL,
    initiative_modifier INT NOT NULL,
    initiative_roll INT NOT NULL,
    FOREIGN KEY (battle_id) REFERENCES battle(id)
);

CREATE TABLE battle_event (
    id UUID PRIMARY KEY,
    battle_id UUID NOT NULL,
    version BIGINT NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    event_data JSON NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    UNIQUE (battle_id, version),
    FOREIGN KEY (battle_id) REFERENCES battle(id)
);
```

**Testing Strategy**:
1. Integration tests for BattleController (use @WebMvcTest)
2. Repository tests with H2 test database
3. Test event sourcing replay (append N events, verify reconstructed state)
4. Example:
   ```kotlin
   @Test
   fun `progressTurn increments round after last creature`() {
       // Create battle with 2 creatures
       // Progress turn twice
       // Verify round is 2 on second progress
   }
   ```

**REST Endpoint Summary**:
| Method | Path | Purpose |
|--------|------|---------|
| POST | /api/v1/battles | Create battle (accepts creatureIds + d20 rolls) |
| GET | /api/v1/battles | List battles (filtered by status) |
| GET | /api/v1/battles/{id} | Fetch battle state |
| POST | /api/v1/battles/{id}/turn | Advance turn |
| POST | /api/v1/battles/{id}/damage | Apply damage |
| POST | /api/v1/battles/{id}/end | End battle |
| GET | /api/v1/battles/{id}/log | Combat log (paginated) |

---

### Phase 3: Frontend Angular Components (1 week)

**Goal**: Implement UI with reactive data binding and RxJS signals

**Files to Create**:
- `core/battle/domain/battle.model.ts` - TypeScript domain types
- `core/battle/domain/battle.repository.ts` - Port interface
- `core/battle/use-cases/*.usecase.ts` - 5 use cases (same as backend)
- `core/battle/domain/battle-state.service.ts` - Orchestration with RxJS
- `adapters/battle/battle-api.adapter.ts` - HTTP adapter (implements port)
- `features/battle/pages/battle-arena.component.ts` - Main battle UI
- `features/battle/components/turn-order.component.ts` - Turn display
- `features/battle/components/creature-card.component.ts` - Creature stats
- `features/battle/components/damage-dialog.component.ts` - Damage input
- `features/battle/components/combat-log.component.ts` - Event log

**Component Hierarchy**:
```
BattleContainerComponent (route guard, effects)
├─ BattleArenaComponent (main battle UI)
│  ├─ TurnOrderComponent (round/turn display)
│  ├─ CreatureCardComponent (for each creature)
│  │  └─ CreatureStatusIndicator (HP bar, defeated styling)
│  └─ BattleControlsComponent (buttons: next turn, damage)
└─ CombatLogComponent (paginated event log)
```

**Key Features**:
1. **Real-time Updates**: Use Angular Signals for reactive state
   ```typescript
   battleState = signal<Battle | null>(null);
   currentActor = computed(() => {
       const state = battleState();
       return state?.creatures[state.currentActorIndex] ?? null;
   });
   ```

2. **Damage Dialog**: Modal with input validation (1-99 damage)
3. **Defeated Creature Styling**: Grayed out + "Defeated" badge
4. **Combat Log**: Virtual scroll for 100+ entries, pagination

**Testing Strategy**:
1. Component tests with testing-library/angular
2. Mock BattleRepository port
3. Verify UI updates on state changes
4. Test accessibility (WCAG 2.1 AA):
   - Keyboard navigation
   - Focus indicators
   - Color contrast (4.5:1 minimum)

**Performance Targets**:
- BattleArenaComponent: ≤2s TTI
- Combat log scroll: smooth 60 FPS
- API calls debounced: ≥300ms

---

### Phase 4: Integration & Testing (3-5 days)

**E2E Testing** (full battle flow):
1. Create battle → verify turn order initialized
2. Apply damage → verify HP updated
3. Defeat creature → verify styling
4. End battle → verify history

**Performance Benchmarks**:
- Turn advancement: <500ms (p95)
- Combat log pagination: <2s
- Event replay (10k events): <5s

**Contract Testing** (Kotlin + Angular):
- Backend OpenAPI spec ↔ Frontend HTTP adapter
- Response DTOs match exactly
- Error responses follow standard format

---

## Key Implementation Patterns

### Backend: Domain-Driven Design

**Aggregate Root Pattern**:
```kotlin
class Battle private constructor(
    val id: BattleId,
    val creatures: List<BattleCreature>,
    // ...
) {
    companion object {
        fun create(
            creatureIds: List<CreatureId>,
            initiativeRolls: Map<CreatureId, Int>,
            userId: UserId
        ): Battle {
            // Validation + event sourcing initialization
        }
    }

    fun applyDamage(creatureId: BattleCreatureId, damage: Int): List<BattleEvent> {
        // Returns events (not direct state mutation)
    }
}
```

**Event Sourcing Pattern**:
```kotlin
sealed class BattleEvent {
    abstract fun apply(battle: Battle): Battle
}

data class DamageApplied(...) : BattleEvent() {
    override fun apply(battle: Battle): Battle {
        // Return new Battle with damage applied
    }
}

// Replay: startingBattle.events.fold(startingBattle) { b, e -> e.apply(b) }
```

### Frontend: Signals for State Management

```typescript
export class BattleService {
    private battleState = signal<Battle | null>(null);
    readonly battle = battleState.asReadonly();

    readonly currentActor = computed(() => {
        const state = this.battle();
        return state?.creatures[state.currentActorIndex] ?? null;
    });

    async progressTurn() {
        const updated = await this.api.progressTurn();
        this.battleState.set(updated);
    }
}
```

---

## Testing Checklist

### Backend (Kotlin)
- [ ] All domain entities tested (100% coverage)
- [ ] Use cases tested with mocked ports (≥90%)
- [ ] Integration tests for controller endpoints
- [ ] Event sourcing replay tested (append, reconstruct)
- [ ] JPA repository tests with H2
- [ ] Error handling (invalid damage, duplicate roll, etc.)

### Frontend (Angular)
- [ ] BattleArenaComponent renders state correctly
- [ ] Damage dialog validates input
- [ ] Defeated creatures styled consistently
- [ ] Combat log paginates correctly
- [ ] HTTP adapter implements port interface
- [ ] Accessibility tests (keyboard nav, screen reader)

### E2E
- [ ] Create battle flow (select creatures, enter rolls)
- [ ] Combat flow (damage → defeat → end)
- [ ] Combat log displays all events
- [ ] Authentication enforced (401 on missing token)

---

## Metrics & Monitoring

**Success Criteria** (from spec):
- ✅ Battle creation: <30 seconds
- ✅ Turn advancement: <500ms UI update
- ✅ Damage application: 2 clicks
- ✅ Combat log retrieval: <2 seconds
- ✅ Event logging: 100% (all significant events)
- ✅ User success rate: 70% first-time (no docs)

**Monitoring** (production):
- API response time p95 ≤300ms
- Error rate <1%
- Battle creation success rate >95%
- Combat log query latency <2s (p95)

---

## Troubleshooting

**Issue**: Event replay slower than expected
- **Solution**: Implement event snapshots (cache state every 100 events)

**Issue**: Combat log pagination slow with 1000+ entries
- **Solution**: Lazy-load entries, use database index on (battle_id, timestamp)

**Issue**: Frontend sees stale battle state
- **Solution**: Ensure API calls debounced (≥300ms), invalidate cache after mutations

---

## References

- **Spec**: [003-start-battle/spec.md](./spec.md)
- **Data Model**: [003-start-battle/data-model.md](./data-model.md)
- **API Contracts**: [003-start-battle/contracts/battle-api.yaml](./contracts/battle-api.yaml)
- **Project Constitution**: Root `.specify/memory/constitution.md`
- **Backend CLAUDE.md**: `backend/CLAUDE.md`
- **Frontend CLAUDE.md**: `frontend-angular/CLAUDE.md`

---

## Next Steps

1. Generate task list: `/speckit.tasks`
2. Begin Phase 1 (backend domain) in order of dependency
3. Use TDD: write failing test first, then implement
4. Commit frequently (atomic commits following Conventional Commits)
5. Aim for ≥80% test coverage before PR submission
