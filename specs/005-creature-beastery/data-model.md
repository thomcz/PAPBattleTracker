# Data Model: Creature Beastery

**Phase**: 1 (Design & Contracts)
**Date**: 2026-02-20

## Entity Definitions

### 1. Creature Aggregate Root

**Purpose**: Represents a reusable creature template in the beastery

**Identity**: `CreatureId` (UUID)

**Attributes**:

| Attribute | Type | Constraints | Notes |
|-----------|------|-------------|-------|
| `id` | UUID | Required, unique per user | Immutable |
| `userId` | UUID | Required | User who owns creature |
| `name` | String | Required, 1-100 chars | Duplicates allowed |
| `hitPoints` | Int | Required, > 0, ≤ 1000 | Max health value |
| `armorClass` | Int | Required, 0-20 | Defense value (0-20 standard) |
| `abilities` | List[Ability] | Optional, 0+ items | Empty allowed initially |
| `createdAt` | Timestamp | Required, immutable | When creature was created |
| `updatedAt` | Timestamp | Required, mutable | Last modification time |
| `deleted` | Boolean | Default false | Soft delete marker (for event sourcing) |

**Validation Rules**:

```kotlin
// Domain validation (enforced in entity)
- name: notBlank() && length(1..100)
- hitPoints: > 0 && <= 1000
- armorClass: >= 0 && <= 20
- abilities: notNull() // can be empty list
- userId: notNull()

// These are tested in CreatureTest.kt
```

**State Transitions**:

```
CREATED → ACTIVE → (MODIFIED)* → DELETED
  ↓          ↓                      ↓
created()  added to       deleted()
           battles
```

**Lifecycle**:
1. **Created**: New creature added to beastery
2. **Active**: Available for selection in battles, can be edited
3. **Modified**: Edited name, stats, or abilities
4. **Deleted**: Marked as deleted, hidden from UI, cannot be selected for new battles

**Relationships**:
- Has many `Ability` (composition)
- Owned by one user (userId reference)
- No reference to battles (one-way relationship)

---

### 2. Ability Value Object

**Purpose**: Represents an action/ability a creature can perform

**Attributes**:

| Attribute | Type | Constraints | Notes |
|-----------|------|-------------|-------|
| `id` | UUID | Required, unique per creature | Immutable |
| `name` | String | Required, 1-100 chars | e.g., "Attack", "Fireball" |
| `description` | String | Optional, ≤500 chars | What the ability does |
| `damageType` | Enum? | Optional | Fire, Ice, Physical, etc. |
| `damage` | String | Optional, ≤50 chars | e.g., "2d6+3", "1d8" |
| `range` | String | Optional, ≤50 chars | e.g., "5 ft", "60 ft range" |

**Validation Rules**:

```kotlin
- name: notBlank() && length(1..100)
- description: length(0..500)
- damage: length(0..50) && validDiceFormat() // optional check
- range: length(0..50)
```

**Notes**:
- Value object (identity defined by content + parent)
- Immutable after creation
- Can be copied with creature
- No direct persistence (nested in Creature)

---

### 3. CreatureSnapshot (Event Sourcing)

**Purpose**: Materialized view of creature state for efficient querying

**Event-Sourced From**: CreatureEvents table

**Fields**:
- Same as Creature (id, userId, name, hitPoints, armorClass, abilities, createdAt, updatedAt, deleted)
- Additional: `version` (for optimistic locking)

**When Updated**:
- After each event is processed
- Replayed on server startup

**Query Optimization**:
- Index on (userId, deleted) for listing
- Index on (userId, name) for search
- Index on created_at for ordering

---

## Event Types (Event Sourcing)

### CreatureCreatedEvent

```json
{
  "aggregateId": "uuid",
  "eventType": "CREATURE_CREATED",
  "payload": {
    "name": "Orc",
    "hitPoints": 45,
    "armorClass": 15,
    "abilities": []
  },
  "userId": "uuid",
  "timestamp": "2026-02-20T10:00:00Z"
}
```

### AbilityAddedEvent

```json
{
  "aggregateId": "uuid",
  "eventType": "ABILITY_ADDED",
  "payload": {
    "abilityId": "uuid",
    "name": "Attack",
    "damage": "2d6+2"
  },
  "userId": "uuid",
  "timestamp": "2026-02-20T10:05:00Z"
}
```

### CreatureUpdatedEvent

```json
{
  "aggregateId": "uuid",
  "eventType": "CREATURE_UPDATED",
  "payload": {
    "name": "Orcish Warrior",
    "hitPoints": 50,
    "armorClass": 16
  },
  "userId": "uuid",
  "timestamp": "2026-02-20T10:10:00Z"
}
```

### CreatureDeletedEvent

```json
{
  "aggregateId": "uuid",
  "eventType": "CREATURE_DELETED",
  "payload": {},
  "userId": "uuid",
  "timestamp": "2026-02-20T10:15:00Z"
}
```

### AbilityRemovedEvent

```json
{
  "aggregateId": "uuid",
  "eventType": "ABILITY_REMOVED",
  "payload": {
    "abilityId": "uuid"
  },
  "userId": "uuid",
  "timestamp": "2026-02-20T10:20:00Z"
}
```

---

## Database Schema

### creature_events (Event Store)

```sql
CREATE TABLE creature_events (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    aggregate_id VARCHAR(36) NOT NULL,          -- UUID of creature
    event_type VARCHAR(50) NOT NULL,
    payload JSON NOT NULL,                      -- Jackson serialized event data
    user_id VARCHAR(36) NOT NULL,               -- User who triggered event
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_aggregate (aggregate_id),
    INDEX idx_user (user_id),
    INDEX idx_type (event_type),
    INDEX idx_created (created_at)
);
```

### creature_snapshots (Materialized View)

```sql
CREATE TABLE creature_snapshots (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    aggregate_id VARCHAR(36) NOT NULL UNIQUE,   -- UUID of creature
    user_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    hit_points INT NOT NULL,
    armor_class INT NOT NULL,
    abilities JSON NOT NULL,                    -- JSON array of abilities
    deleted BOOLEAN DEFAULT FALSE,
    version INT DEFAULT 0,                      -- For optimistic locking
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_user_deleted (user_id, deleted),
    INDEX idx_user_name (user_id, name),
    INDEX idx_updated (updated_at)
);
```

### abilities (Denormalized in JSON)

Note: Abilities stored as JSON within creatures, not separate table (to match event sourcing model and reduce complexity).

If querying abilities independently becomes needed:
```sql
CREATE TABLE creature_abilities (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    creature_id VARCHAR(36) NOT NULL,
    ability_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    damage_type VARCHAR(50),
    damage_value VARCHAR(20),
    range_distance VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uk_ability_id (ability_id),
    INDEX idx_creature (creature_id),
    FOREIGN KEY (creature_id) REFERENCES creature_snapshots(aggregate_id)
);
```

---

## Data Constraints

### Domain Rules (Enforced in Aggregate)

1. **Creature Immutability After Deletion**:
   - Once deleted, creature cannot be modified
   - `deleted = true` → no updates allowed
   - Test: `CreatureTest.deletePreventsFurtherModifications()`

2. **Ability Independence**:
   - Removing an ability from creature doesn't cascade
   - Ability ID must be unique within creature scope
   - Test: `CreatureTest.removedAbilitiesDoNotAffectOthers()`

3. **User Ownership**:
   - Creature always belongs to creating user
   - Other users cannot view, edit, or delete
   - Test: `CreatureControllerTest.forbidsAccessToOtherUsersCreatures()`

4. **Duplicate Naming**:
   - Names can be duplicated (explicitly allowed)
   - "Orc" and "Orc" both valid
   - Duplicate should auto-name as "[Name] Copy"
   - Test: `DuplicateCreatureUseCaseTest.createsNamedCopy()`

### Database Constraints (Enforced at SQL Level)

1. **NOT NULL**: userId, name, hitPoints, armorClass, createdAt
2. **UNIQUE**: aggregate_id (per user implicitly through queries)
3. **CHECK**: hitPoints > 0, armorClass >= 0, name length > 0
4. **INDEX**: For performance on search, filtering by user

---

## Searching & Filtering

### Full-Text Search

**Requirement FR-011**: Search creatures by name

**Implementation**:
```sql
SELECT * FROM creature_snapshots
WHERE user_id = ?
  AND deleted = FALSE
  AND LOWER(name) LIKE LOWER(CONCAT('%', ?, '%'))
ORDER BY updated_at DESC
LIMIT 50;
```

**Performance**:
- Index on (user_id, deleted, name) enables fast filtering
- LIKE query acceptable for 100-1000 creatures
- If exceeds 10k creatures, add full-text search index

**Test**: `CreatureControllerTest.searchFiltersCreaturesCorrectly()`

---

## Aggregate Ports (Domain Layer)

```kotlin
// Port interface (defined in domain, implemented in infrastructure)
interface CreatureRepository {
    fun save(creature: Creature): Creature
    fun findById(id: CreatureId): Creature?
    fun findByUserId(userId: UserId): List<Creature>
    fun delete(id: CreatureId): Boolean
    fun exists(id: CreatureId): Boolean
}

// Event sourcing port
interface CreatureEventStore {
    fun append(event: CreatureEvent): CreatureEvent
    fun getEvents(aggregateId: CreatureId): List<CreatureEvent>
}
```

---

## Migration Notes

### From Previous Creature Version

This feature introduces the Beastery as a separate aggregate. Previous creatures (from 002-creature-management) are battle-specific creatures, not reusable templates.

**No Migration Needed**: Beastery is additive feature. Battle creatures remain as-is.

---

**Next Step**: Generate API contracts in Phase 1 design completion
