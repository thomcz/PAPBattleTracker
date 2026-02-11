# Data Model: Battle Tracker Core Features

**Created**: 2026-02-11
**Purpose**: Define entities, events, aggregates, and domain logic for battle tracking with event sourcing

## Overview

This data model uses Domain-Driven Design (DDD) and event sourcing patterns. The Battle aggregate is the consistency boundary, with Creature as an entity within the aggregate. All state changes generate immutable events.

## Domain Entities

### 1. Battle (Aggregate Root)

The Battle aggregate represents a complete combat encounter. State is derived from event replay.

**Aggregate ID**: `battleId: UUID`

**Derived State** (reconstructed from events):
- `battleId: UUID` - Unique identifier
- `userId: UUID` - Owner of the battle (Game Master)
- `name: String` - Battle name (e.g., "Dragon's Lair Encounter")
- `status: CombatStatus` - NOT_STARTED | ACTIVE | PAUSED | ENDED
- `creatures: Map<UUID, Creature>` - All creatures in battle
- `currentTurn: Int` - Index in initiative order (0-based)
- `round: Int` - Current combat round (starts at 1)
- `combatLog: List<LogEntry>` - Chronological action log
- `createdAt: Instant` - Battle creation timestamp
- `lastModified: Instant` - Last event timestamp

**Business Rules**:
1. Cannot start combat with zero creatures
2. Creatures sorted by initiative (highest first) when combat starts
3. Turn advances sequentially through initiative order
4. Round increments when last creature finishes turn
5. Monster creatures removed when combat ends, players retained
6. All state changes must generate events

**Invariants** (always true):
- `currentTurn` < creatures.size()
- `round` ≥ 1 when status = ACTIVE
- `creatures` never empty when status = ACTIVE
- Events immutable after creation

---

### 2. Creature (Entity within Battle Aggregate)

Represents a combatant (player character or monster).

**Entity ID**: `creatureId: UUID`

**Attributes**:
- `creatureId: UUID` - Unique identifier
- `name: String` - Creature name (e.g., "Goblin", "Aragorn")
- `type: CreatureType` - PLAYER | MONSTER
- `currentHP: Int` - Current hit points (≥0)
- `maxHP: Int` - Maximum hit points (>0)
- `initiative: Int` - Initiative roll value (used for turn order)
- `armorClass: Int` - Armor class (≥0)
- `effects: List<String>` - Active status effects (e.g., "Poisoned", "Blessed")
- `isDefeated: Boolean` - Computed: currentHP == 0

**Business Rules**:
1. `currentHP` cannot exceed `maxHP`
2. `currentHP` cannot be negative (minimum 0)
3. `maxHP` must be positive
4. Creature marked defeated when `currentHP` reaches 0
5. Effects cleared when combat ends

**Validation Rules**:
- Name: non-blank, max 100 characters
- MaxHP: 1 to 9999
- CurrentHP: 0 to maxHP
- Initiative: -20 to 100 (standard D&D range)
- ArmorClass: 0 to 50

---

### 3. Combat Log Entry (Entity within Battle Aggregate)

Records a combat action for battle history.

**Entity ID**: `logEntryId: UUID`

**Attributes**:
- `logEntryId: UUID` - Unique identifier
- `round: Int` - Round when action occurred
- `timestamp: Instant` - When action occurred
- `text: String` - Human-readable action description
- `eventType: String` - Event type that generated this log entry

**Example Log Entries**:
```
"Round 1: Goblin takes 5 damage from Aragorn (5 HP remaining)"
"Round 1: Turn advanced to Legolas"
"Round 2: Goblin defeated"
"Round 2: Combat ended - players victorious"
```

---

## Value Objects

### CombatStatus (Enum)

```kotlin
enum class CombatStatus {
    NOT_STARTED,  // Battle created, creatures can be added/edited
    ACTIVE,       // Combat in progress, turn/round tracking active
    PAUSED,       // Combat paused, state preserved
    ENDED         // Combat finished, monsters removed
}
```

**State Transitions**:
- NOT_STARTED → ACTIVE (start combat command)
- ACTIVE → PAUSED (pause combat command)
- ACTIVE → ENDED (end combat command)
- PAUSED → ACTIVE (resume combat command)
- PAUSED → ENDED (end combat command)

### CreatureType (Enum)

```kotlin
enum class CreatureType {
    PLAYER,   // Persists through combat end
    MONSTER   // Removed when combat ends
}
```

---

## Domain Events

All events are immutable value objects with common fields:

**Base Event Interface**:
```kotlin
sealed interface BattleEvent {
    val battleId: UUID
    val eventId: UUID
    val timestamp: Instant
    val userId: UUID  // Who triggered the event
}
```

### Event Catalog

#### 1. BattleCreated

Emitted when Game Master creates a new battle.

```kotlin
data class BattleCreated(
    override val battleId: UUID,
    override val eventId: UUID,
    override val timestamp: Instant,
    override val userId: UUID,
    val name: String
) : BattleEvent
```

**State Changes**:
- Initialize battle with NOT_STARTED status
- Set battle name and owner

---

#### 2. CreatureAdded

Emitted when creature is added to battle.

```kotlin
data class CreatureAdded(
    override val battleId: UUID,
    override val eventId: UUID,
    override val timestamp: Instant,
    override val userId: UUID,
    val creatureId: UUID,
    val name: String,
    val type: CreatureType,
    val maxHP: Int,
    val currentHP: Int,
    val initiative: Int,
    val armorClass: Int
) : BattleEvent
```

**State Changes**:
- Add creature to battle.creatures map
- If combat active, resort initiative order

---

#### 3. CreatureUpdated

Emitted when creature attributes are modified.

```kotlin
data class CreatureUpdated(
    override val battleId: UUID,
    override val eventId: UUID,
    override val timestamp: Instant,
    override val userId: UUID,
    val creatureId: UUID,
    val updates: CreatureUpdates
) : BattleEvent

data class CreatureUpdates(
    val name: String? = null,
    val maxHP: Int? = null,
    val currentHP: Int? = null,
    val initiative: Int? = null,
    val armorClass: Int? = null
)
```

**State Changes**:
- Update specified creature attributes
- If initiative changed during combat, resort initiative order

---

#### 4. CreatureRemoved

Emitted when creature is removed from battle.

```kotlin
data class CreatureRemoved(
    override val battleId: UUID,
    override val eventId: UUID,
    override val timestamp: Instant,
    override val userId: UUID,
    val creatureId: UUID,
    val reason: RemovalReason
) : BattleEvent

enum class RemovalReason {
    MANUAL_REMOVAL,
    COMBAT_ENDED_MONSTER,
    COMBAT_ENDED_ALL
}
```

**State Changes**:
- Remove creature from battle.creatures map
- Adjust currentTurn if creature was before or at current turn

---

#### 5. DamageApplied

Emitted when damage is dealt to a creature.

```kotlin
data class DamageApplied(
    override val battleId: UUID,
    override val eventId: UUID,
    override val timestamp: Instant,
    override val userId: UUID,
    val targetCreatureId: UUID,
    val amount: Int,
    val sourceCreatureId: UUID? = null,  // null if environmental damage
    val damageType: String? = null       // e.g., "fire", "piercing" (optional)
) : BattleEvent
```

**State Changes**:
- Decrease creature.currentHP by amount (minimum 0)
- Mark creature as defeated if currentHP reaches 0
- Add entry to combat log

---

#### 6. HealingApplied

Emitted when healing is applied to a creature.

```kotlin
data class HealingApplied(
    override val battleId: UUID,
    override val eventId: UUID,
    override val timestamp: Instant,
    override val userId: UUID,
    val targetCreatureId: UUID,
    val amount: Int,
    val sourceCreatureId: UUID? = null  // null if potion/self-heal
) : BattleEvent
```

**State Changes**:
- Increase creature.currentHP by amount (maximum maxHP)
- Clear defeated status if currentHP > 0
- Add entry to combat log

---

#### 7. StatusEffectAdded

Emitted when status effect is applied to creature.

```kotlin
data class StatusEffectAdded(
    override val battleId: UUID,
    override val eventId: UUID,
    override val timestamp: Instant,
    override val userId: UUID,
    val creatureId: UUID,
    val effect: String  // e.g., "Poisoned", "Stunned", "Blessed"
) : BattleEvent
```

**State Changes**:
- Add effect to creature.effects list
- Add entry to combat log

---

#### 8. StatusEffectRemoved

Emitted when status effect is removed from creature.

```kotlin
data class StatusEffectRemoved(
    override val battleId: UUID,
    override val eventId: UUID,
    override val timestamp: Instant,
    override val userId: UUID,
    val creatureId: UUID,
    val effect: String
) : BattleEvent
```

**State Changes**:
- Remove effect from creature.effects list
- Add entry to combat log

---

#### 9. CombatStarted

Emitted when combat begins.

```kotlin
data class CombatStarted(
    override val battleId: UUID,
    override val eventId: UUID,
    override val timestamp: Instant,
    override val userId: UUID,
    val initiativeOrder: List<UUID>  // Sorted creature IDs
) : BattleEvent
```

**State Changes**:
- Set status to ACTIVE
- Sort creatures by initiative (highest first)
- Set currentTurn to 0
- Set round to 1
- Add entry to combat log

**Business Rule Validation**:
- Must have at least one creature

---

#### 10. TurnAdvanced

Emitted when Game Master advances to next turn.

```kotlin
data class TurnAdvanced(
    override val battleId: UUID,
    override val eventId: UUID,
    override val timestamp: Instant,
    override val userId: UUID,
    val previousCreatureId: UUID,
    val nextCreatureId: UUID,
    val newRound: Int?  // Set if round incremented
) : BattleEvent
```

**State Changes**:
- Increment currentTurn
- If last creature, set currentTurn to 0 and increment round
- Add entry to combat log

---

#### 11. CombatPaused

Emitted when combat is paused.

```kotlin
data class CombatPaused(
    override val battleId: UUID,
    override val eventId: UUID,
    override val timestamp: Instant,
    override val userId: UUID
) : BattleEvent
```

**State Changes**:
- Set status to PAUSED
- Add entry to combat log

---

#### 12. CombatResumed

Emitted when combat is resumed.

```kotlin
data class CombatResumed(
    override val battleId: UUID,
    override val eventId: UUID,
    override val timestamp: Instant,
    override val userId: UUID
) : BattleEvent
```

**State Changes**:
- Set status to ACTIVE
- Add entry to combat log

---

#### 13. CombatEnded

Emitted when combat is finished.

```kotlin
data class CombatEnded(
    override val battleId: UUID,
    override val eventId: UUID,
    override val timestamp: Instant,
    override val userId: UUID,
    val outcome: CombatOutcome
) : BattleEvent

enum class CombatOutcome {
    PLAYERS_VICTORIOUS,
    PLAYERS_DEFEATED,
    DRAW,
    ABORTED
}
```

**State Changes**:
- Set status to ENDED
- Remove all MONSTER type creatures
- Clear effects from remaining creatures
- Clear combat log
- Add entry to combat log

---

## Event Application Logic

**Event Replay Algorithm**:

```kotlin
fun Battle.applyEvent(event: BattleEvent) {
    when (event) {
        is BattleCreated -> {
            this.battleId = event.battleId
            this.userId = event.userId
            this.name = event.name
            this.status = CombatStatus.NOT_STARTED
            this.createdAt = event.timestamp
        }

        is CreatureAdded -> {
            val creature = Creature(
                creatureId = event.creatureId,
                name = event.name,
                type = event.type,
                maxHP = event.maxHP,
                currentHP = event.currentHP,
                initiative = event.initiative,
                armorClass = event.armorClass,
                effects = emptyList()
            )
            creatures[event.creatureId] = creature

            if (status == CombatStatus.ACTIVE) {
                resortInitiativeOrder()
            }
        }

        is DamageApplied -> {
            val creature = creatures[event.targetCreatureId]!!
            creature.currentHP = max(0, creature.currentHP - event.amount)
            creature.isDefeated = creature.currentHP == 0

            val logEntry = createLogEntry(
                round = round,
                timestamp = event.timestamp,
                text = "${creature.name} takes ${event.amount} damage " +
                       "(${creature.currentHP} HP remaining)"
            )
            combatLog.add(logEntry)
        }

        is TurnAdvanced -> {
            currentTurn = (currentTurn + 1) % creatures.size

            if (event.newRound != null) {
                round = event.newRound
            }

            val nextCreature = creatures.values.sortedBy { it.initiative }[currentTurn]
            val logEntry = createLogEntry(
                round = round,
                timestamp = event.timestamp,
                text = "Turn advanced to ${nextCreature.name}"
            )
            combatLog.add(logEntry)
        }

        // ... handle other events
    }

    this.lastModified = event.timestamp
}
```

---

## Aggregate Lifecycle

**Creation**:
```
1. User invokes CreateBattleUseCase
2. Application generates BattleCreated event
3. Event persisted to event store
4. Battle metadata record created
5. Return battle ID to user
```

**State Reconstruction**:
```
1. Load events from event store (battle_id, ordered by sequence_number)
2. Create empty Battle aggregate
3. Apply each event sequentially to build state
4. Return reconstructed Battle
```

**State Modification**:
```
1. Load Battle from events
2. Execute business logic (e.g., battle.applyDamage(...))
3. Business logic generates new event
4. Append event to uncommitted events list
5. Persist uncommitted events to store
6. Mark events as committed
7. Return success
```

---

## Database Persistence

### Events Table

Stores immutable event log.

```sql
CREATE TABLE events (
    event_id UUID PRIMARY KEY,
    battle_id UUID NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_data TEXT NOT NULL,  -- JSON serialized event
    sequence_number INT NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    user_id UUID NOT NULL,
    FOREIGN KEY (battle_id) REFERENCES battles(battle_id),
    UNIQUE (battle_id, sequence_number)
);

CREATE INDEX idx_events_battle_id_sequence
    ON events(battle_id, sequence_number);
```

**Example Row**:
```
event_id: 660e8400-e29b-41d4-a716-446655440001
battle_id: 550e8400-e29b-41d4-a716-446655440000
event_type: DamageApplied
event_data: {"targetCreatureId": "770e...", "amount": 5, ...}
sequence_number: 42
timestamp: 2026-02-11T10:30:00Z
user_id: 440e8400-e29b-41d4-a716-446655440099
```

### Battles Table

Stores battle metadata for efficient querying.

```sql
CREATE TABLE battles (
    battle_id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    last_modified TIMESTAMP NOT NULL,
    event_count INT NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_battles_user_id ON battles(user_id);
CREATE INDEX idx_battles_status ON battles(status);
```

**Note**: Battle state NOT stored directly. Metadata only for querying.

---

## Summary

| Component | Count | Purpose |
|-----------|-------|---------|
| Aggregates | 1 | Battle (consistency boundary) |
| Entities | 2 | Creature, LogEntry (within Battle) |
| Value Objects | 2 | CombatStatus, CreatureType |
| Domain Events | 13 | All state changes |
| Business Rules | 15+ | Invariants and validations |

**Key Patterns**:
- Event Sourcing: All state derived from events
- DDD: Battle is aggregate root, creatures are entities
- Immutability: Events never modified after creation
- Consistency: Single aggregate transaction boundary
