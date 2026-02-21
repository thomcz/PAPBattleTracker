# Research: Creature Beastery Implementation

**Phase**: 0 (Research & Unknown Resolution)
**Date**: 2026-02-20

## Research Findings

### 1. Event Sourcing for Creature Entities

**Decision**: Creatures stored as events in H2, replaying to reconstruct current state

**Rationale**:
- Project already uses event sourcing pattern (mentioned in CLAUDE.md)
- Events provide audit trail (who created/modified creatures)
- Enables future undo/redo capabilities
- Snapshots handle creature state at specific point in time

**Alternatives Considered**:
- Traditional CRUD with JPA entity: Simpler initially but loses audit trail and violates event sourcing pattern already established
- Event store in separate service: Adds complexity; H2 is sufficient for single-user app

**Implementation Details**:
- **Event Types**:
  - `CreatureCreatedEvent`: name, HP, AC, userId, timestamp
  - `AbilityAddedEvent`: creatureId, ability details, timestamp
  - `CreatureUpdatedEvent`: creatureId, updated fields, timestamp
  - `CreatureDeletedEvent`: creatureId, timestamp
- **Snapshot Creation**:
  - Store creature state after each modification
  - Replay only when loading a creature
- **Hard Delete**:
  - `CreatureDeletedEvent` marks end of creature lifecycle
  - Queries filter out deleted creatures
  - Database record remains (for audit trail)

**References**: CLAUDE.md architecture section, IMPLEMENTATION_PLAN.md (event sourcing pattern)

---

### 2. Creature Copying for Battle Snapshots

**Decision**: When adding creature to battle, create deep copy of creature data at snapshot moment

**Rationale**:
- Spec requirement FR-009: "create an independent copy"
- Acceptance scenario: battle modifications don't affect beastery original
- Spec edge case: "creature stats edited after use in ongoing battle don't affect that battle"
- Solution: Each battle instance gets immutable copy of creature state

**Alternatives Considered**:
- Reference-based: Store creature ID in battle, fetch live data - Violates FR-009 and edge case requirement
- Lazy copy: Only copy when creature modified in battle - Adds complexity and potential bugs
- Full snapshot: Copy entire creature at battle creation - Best matches requirements

**Implementation Details**:
- Deep copy creature object when adding to battle
- Battle stores copy, not reference
- Creature ID in copy allows tracing origin (optional enhancement)
- No bidirectional updates needed

**Technical Consideration**:
- Jackson `@JsonDeserialize` for deep object copying
- Use copy constructor pattern or `copy()` method on Creature

---

### 3. H2 Schema Design for Creatures

**Decision**: Event-based storage with snapshots table for query optimization

**Rationale**:
- Pure event table: All state changes immutable
- Snapshots table: Quick creature retrieval without replaying events
- Creature_events: Complete audit trail
- Creatures (materialized view): Current state, optimized for queries

**Schema**:
```sql
CREATE TABLE creature_events (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    aggregate_id UUID NOT NULL,          -- CreatureId
    event_type VARCHAR(50) NOT NULL,     -- CreatureCreated, AbilityAdded, etc.
    payload JSON NOT NULL,               -- Event data (Jackson serialized)
    user_id UUID NOT NULL,               -- Who created/modified
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_aggregate (aggregate_id),
    INDEX idx_user (user_id),
    INDEX idx_created (created_at)
);

CREATE TABLE creature_snapshots (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    aggregate_id UUID NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    hit_points INT NOT NULL,
    armor_class INT NOT NULL,
    abilities JSON NOT NULL,             -- Array of abilities
    user_id UUID NOT NULL,
    deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    version INT DEFAULT 0,               -- For optimistic locking
    INDEX idx_user_name (user_id, name),
    INDEX idx_user_deleted (user_id, deleted)
);

CREATE TABLE abilities (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    creature_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    damage_type VARCHAR(50),
    damage_value VARCHAR(20),            -- e.g., "2d6+3" or "1d8"
    range VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Rationale for JSON payload**:
- Jackson handles serialization/deserialization
- Flexible for different event types
- Single table for all event types
- Queryable with H2's JSON functions if needed

---

### 4. Angular Signals for Beastery State Management

**Decision**: Signal-based reactive state with derived signals for UI

**Rationale**:
- Angular 18+ signals are first-class feature
- No external state management library needed
- Automatic change detection optimization
- Composable computed signals for filtering/searching

**Alternatives Considered**:
- RxJS Observables only: Works but signals are more efficient
- NgRx store: Overkill for single-feature state
- Context + change detection: Less flexible for computed values

**Implementation Pattern**:
```typescript
// State signals
creatureListSignal = signal<Creature[]>([]);
searchQuerySignal = signal<string>('');
selectedCreatureSignal = signal<Creature | null>(null);

// Computed signals
filteredCreaturesSignal = computed(() => {
  const creatures = creatureListSignal();
  const query = searchQuerySignal().toLowerCase();
  return query
    ? creatures.filter(c => c.name.toLowerCase().includes(query))
    : creatures;
});

creatureCountSignal = computed(() => creatureListSignal().length);

// Effects for side effects
constructor() {
  effect(() => {
    const creatures = creatureListSignal();
    this.persistToLocalStorage(creatures);
  });
}
```

**Advantages**:
- Signals trigger only affected components
- Computed signals update automatically
- Simpler than observable subscriptions
- Better performance for form interactions

**References**: Angular 18 documentation on Signals

---

### 5. API Contract Patterns

**Decision**: RESTful endpoints with JSON request/response bodies

**Rationale**:
- Project uses Spring REST pattern
- Consistency with existing creature endpoints (from 002-creature-management)
- Standard HTTP methods and status codes
- Easy to test and document

**Endpoints** (detailed in contracts/):
```
POST   /api/creatures                    # Create
GET    /api/creatures                    # List (with search param)
GET    /api/creatures/{id}               # Get detail
PUT    /api/creatures/{id}               # Update
DELETE /api/creatures/{id}               # Delete
POST   /api/creatures/{id}/duplicate     # Duplicate
GET    /api/battles/{battleId}/creatures/{id}  # Get creature in battle context
```

**Error Handling**:
- 400 Bad Request: Validation failures (non-empty name, HP > 0, etc.)
- 404 Not Found: Creature not found
- 409 Conflict: Creature already deleted
- 500 Internal Server Error: Database/server issues

**Response Format**:
```json
{
  "id": "uuid",
  "name": "Orc",
  "hitPoints": 45,
  "armorClass": 15,
  "abilities": [
    {
      "id": "uuid",
      "name": "Attack",
      "damage": "2d6+2"
    }
  ],
  "createdAt": "2026-02-20T10:00:00Z",
  "updatedAt": "2026-02-20T10:00:00Z"
}
```

---

### 6. Creature-Battle Integration Points

**Decision**: Battle receives copy of creature, no back-reference to beastery

**Rationale**:
- Creatures in battles are immutable snapshots
- Editing beastery creature doesn't affect active battles
- Cleaner data model with fewer circular dependencies
- Easier to test and reason about

**Integration Points**:
1. **Battle Creation**: Select creature from beastery list, create copy
2. **Battle Execution**: Use copied creature for all combat actions
3. **Battle End**: Stored creature copy becomes part of battle history
4. **Creature Deletion**: Only affects future battles, not historical data

**No Changes to Existing Code**:
- Battle system already supports creature snapshots (from 003-start-battle)
- Just need to add "select from beastery" UI option
- Battle domain doesn't change

---

## Research Summary

| Topic | Status | Decision |
|-------|--------|----------|
| Event sourcing approach | ✅ Resolved | Use H2 event table + snapshots |
| Creature copying | ✅ Resolved | Deep copy at battle creation |
| Database schema | ✅ Resolved | Event store + snapshot materialization |
| Angular state management | ✅ Resolved | Signals with computed derived signals |
| API contracts | ✅ Resolved | RESTful with JSON bodies |
| Battle integration | ✅ Resolved | One-way copy, no back-reference |

**All NEEDS CLARIFICATION items resolved. Ready for Phase 1 design.**

---

**Next Step**: Generate data-model.md and API contracts in Phase 1
