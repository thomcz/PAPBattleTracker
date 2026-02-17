# Data Model: Creature Management

**Feature**: 002-creature-management
**Date**: 2026-02-16
**Status**: Complete

## Overview

This document defines the data model for creature management within the Battle aggregate. Creatures are value objects that exist only within a battle context, with all state changes tracked through event sourcing.

## Entity Definitions

### Creature (Value Object)

**Description**: Represents a combatant (player character or monster) in a battle.

**Attributes**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | Required, unique within battle | Unique identifier for this creature |
| name | String | Required, non-blank, max 100 chars | Display name (e.g., "Goblin Chief") |
| type | CreatureType | Required | PLAYER or MONSTER |
| currentHp | Int | Required, ≥ 0, ≤ maxHp | Current hit points |
| maxHp | Int | Required, > 0 | Maximum hit points |
| initiative | Int | Required | Initiative score for turn order (can be negative) |
| armorClass | Int | Required, ≥ 0 | Armor class for defense |
| statusEffects | List<String> | Optional, default empty | Active status effects (e.g., "poisoned") |

**Validation Rules**:
- Name cannot be blank
- Max HP must be positive (> 0)
- Current HP must be non-negative (≥ 0)
- Current HP cannot exceed max HP
- Armor class must be non-negative (≥ 0)
- Initiative can be any integer (including negative values)

**Derived Properties**:
- `isDefeated: Boolean` - true if currentHp === 0

**Behavior Methods**:
- `takeDamage(amount: Int): Creature` - Returns new creature with reduced HP
- `heal(amount: Int): Creature` - Returns new creature with increased HP (capped at maxHp)
- `addEffect(effect: String): Creature` - Returns new creature with added status effect
- `removeEffect(effect: String): Creature` - Returns new creature with removed status effect
- `clearEffects(): Creature` - Returns new creature with all effects removed

**Relationships**:
- Belongs to exactly one Battle (aggregate root)
- No references to other entities

---

### CreatureType (Enum)

**Description**: Distinguishes between persistent and temporary creatures.

**Values**:
| Value | Description |
|-------|-------------|
| PLAYER | Player character - persists through combat end |
| MONSTER | Monster/enemy - removed automatically when combat ends |

---

### Battle (Aggregate Root) - Modifications

**Description**: Existing Battle aggregate extended with creature management capabilities.

**New Attributes**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| creatures | List<Creature> | Optional, default empty | Combatants in this battle |

**New Methods**:
| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| addCreature | name, type, currentHp, maxHp, initiative, armorClass | Battle | Adds new creature, emits CreatureAdded event |
| updateCreature | creatureId, updates | Battle | Updates creature attributes, emits CreatureUpdated event |
| removeCreature | creatureId | Battle | Removes creature, emits CreatureRemoved event |
| sortCreaturesByInitiative | - | Battle | Sorts creatures descending by initiative (stable sort) |
| getCreature | creatureId | Creature? | Finds creature by ID, returns null if not found |

**Modified Methods**:
| Method | Change | Description |
|--------|--------|-------------|
| endCombat | Adds removedMonsterIds | CombatEnded event now includes IDs of removed monsters |

---

## Event Schemas

### CreatureAdded

**Description**: Emitted when a creature is added to the battle.

**Event Fields**:
| Field | Type | Description |
|-------|------|-------------|
| battleId | UUID | ID of the battle |
| eventId | UUID | Unique event identifier |
| timestamp | Instant | When event occurred |
| userId | UUID | User who performed action |
| creatureId | UUID | ID of newly created creature |
| name | String | Creature name |
| type | CreatureType | PLAYER or MONSTER |
| currentHp | Int | Initial current HP |
| maxHp | Int | Maximum HP |
| initiative | Int | Initiative score |
| armorClass | Int | Armor class |

**When Emitted**: User calls `POST /api/battles/{id}/creatures`

**State Changes**:
- Creature added to battle's creatures list
- If combat is active, creature inserted in initiative-sorted position

---

### CreatureUpdated

**Description**: Emitted when a creature's attributes are modified.

**Event Fields**:
| Field | Type | Description |
|-------|------|-------------|
| battleId | UUID | ID of the battle |
| eventId | UUID | Unique event identifier |
| timestamp | Instant | When event occurred |
| userId | UUID | User who performed action |
| creatureId | UUID | ID of creature being updated |
| name | String | Updated name |
| type | CreatureType | Updated type |
| currentHp | Int | Updated current HP |
| maxHp | Int | Updated max HP |
| initiative | Int | Updated initiative |
| armorClass | Int | Updated armor class |

**When Emitted**: User calls `PUT /api/battles/{id}/creatures/{creatureId}`

**State Changes**:
- Creature attributes replaced with new values
- If initiative changed during active combat, creatures re-sorted
- Current turn index adjusted if needed

---

### CreatureRemoved

**Description**: Emitted when a creature is manually removed from battle.

**Event Fields**:
| Field | Type | Description |
|-------|------|-------------|
| battleId | UUID | ID of the battle |
| eventId | UUID | Unique event identifier |
| timestamp | Instant | When event occurred |
| userId | UUID | User who performed action |
| creatureId | UUID | ID of creature being removed |

**When Emitted**: User calls `DELETE /api/battles/{id}/creatures/{creatureId}`

**State Changes**:
- Creature removed from battle's creatures list
- If combat is active and removed creature was current turn, advance to next creature
- Turn index adjusted if needed

---

### CombatEnded - Modified

**Description**: Existing event modified to include monster removal information.

**New Event Fields**:
| Field | Type | Description |
|-------|------|-------------|
| removedMonsterIds | List<UUID> | IDs of monster creatures removed when combat ended |

**State Changes**:
- Combat status set to ENDED
- All creatures with IDs in removedMonsterIds removed from battle
- Player creatures remain in battle

---

## State Transitions

### Creature Lifecycle

```
[None]
  ↓ CreatureAdded
[Present in Battle]
  ↓ CreatureUpdated (0+ times)
[Present in Battle (modified)]
  ↓ CreatureRemoved OR (CombatEnded AND type=MONSTER)
[Removed from Battle]
```

### Combat State Impact on Creatures

| Combat Status | Creature Operations | Initiative Sorting |
|---------------|--------------------|--------------------|
| NOT_STARTED | Add, Update, Remove allowed | Not sorted (creation order) |
| ACTIVE | Add, Update, Remove allowed | Sorted by initiative (descending) |
| PAUSED | Add, Update, Remove allowed | Maintains sorted order |
| ENDED | Cannot add/update/remove | N/A (combat over) |

---

## Data Relationships

```
Battle (1) ←→ (0..*) Creature
  - Battle is aggregate root
  - Creatures are value objects within Battle
  - Creatures have no independent identity outside Battle

Battle (1) ←→ (0..*) BattleEvent
  - Events stored in chronological order
  - CreatureAdded, CreatureUpdated, CreatureRemoved events belong to Battle
  - State reconstructed by replaying events
```

---

## Indexes and Performance

### Backend (H2 Event Store)

**Existing Indexes** (no changes needed):
- Primary key on `battle_events.event_id`
- Index on `battle_events.battle_id` (for event replay queries)
- Index on `battle_events.timestamp` (for chronological ordering)

**Query Patterns**:
1. Get all events for battle: `SELECT * FROM battle_events WHERE battle_id = ? ORDER BY timestamp`
   - Uses battle_id index
   - Performance: O(log n) seek + O(m) scan where m = events for this battle

2. Replay events to reconstruct state:
   - Fetch all events (query above)
   - Apply events in order to Battle aggregate
   - Performance: O(m) where m = total events for battle
   - Typical: 1 BattleCreated + 10 creature operations + 5 combat operations = ~16 events
   - With 20 creatures: ~50-100 events total = <100ms replay time

### Frontend (Angular Signals)

**State Storage**:
- Creatures stored in WritableSignal<Creature[]>
- O(1) read access via signal()
- O(n) updates (creates new array on each mutation for immutability)

**Derived State** (Computed Signals):
- Defeated creatures: `computed(() => creatures().filter(c => c.currentHp === 0))` - O(n)
- Initiative sorted: `computed(() => [...creatures()].sort(...))` - O(n log n)
- Performance: Negligible for n ≤ 20

---

## Storage Estimates

### Backend Event Storage

**Per Creature Event Size**:
- CreatureAdded: ~300 bytes JSON (all attributes)
- CreatureUpdated: ~300 bytes JSON (all attributes)
- CreatureRemoved: ~150 bytes JSON (just ID)

**Typical Battle with 6 Creatures**:
- 6 CreatureAdded = 1.8 KB
- 12 updates (2 per creature) = 3.6 KB
- 2 removals = 0.3 KB
- Total: ~5.7 KB creature events

**Maximum Battle with 20 Creatures**:
- 20 CreatureAdded = 6 KB
- 40 updates (2 per creature) = 12 KB
- 10 removals = 1.5 KB
- Total: ~19.5 KB creature events

### Frontend Memory

**Per Creature Object** (TypeScript):
- Object overhead: ~100 bytes
- String fields (name, effects): ~50 bytes
- Primitive fields: ~40 bytes
- Total: ~190 bytes per creature

**20 Creatures**: ~3.8 KB in memory (negligible)

---

## Validation Matrix

| Field | Frontend Validation | DTO Validation | Domain Validation |
|-------|--------------------|--------------------|-------------------|
| name | required, minLength(1) | @NotBlank | require(name.isNotBlank()) |
| type | required | @NotNull | Enum (enforced by type system) |
| currentHp | required, min(0), custom (≤maxHp) | @PositiveOrZero | require(currentHp >= 0) |
| maxHp | required, min(1) | @Positive | require(maxHp > 0) |
| initiative | required | (none) | (none - any int valid) |
| armorClass | required, min(0) | @PositiveOrZero | require(armorClass >= 0) |

---

## Example State Flow

**Scenario**: Add two creatures, start combat, remove one, end combat

```
Initial State:
  Battle { creatures: [] }

Event 1: CreatureAdded (Goblin, MONSTER, HP 7/7, init 14, AC 15)
  Battle { creatures: [Goblin] }

Event 2: CreatureAdded (Fighter, PLAYER, HP 30/30, init 18, AC 18)
  Battle { creatures: [Goblin, Fighter] }  # Creation order

Event 3: CombatStarted
  Battle {
    creatures: [Fighter, Goblin],  # Sorted by initiative (18, 14)
    status: ACTIVE,
    currentTurnIndex: 0
  }

Event 4: CreatureRemoved (Goblin)
  Battle {
    creatures: [Fighter],
    currentTurnIndex: 0  # Still points to Fighter (index adjusted)
  }

Event 5: CombatEnded (removedMonsterIds: [])
  Battle {
    creatures: [Fighter],  # Player persists, no monsters to remove
    status: ENDED
  }
```

---

## TypeScript Interfaces (Frontend)

```typescript
export interface Creature {
  id: string;
  name: string;
  type: CreatureType;
  currentHp: number;
  maxHp: number;
  initiative: number;
  armorClass: number;
  statusEffects: string[];
}

export enum CreatureType {
  PLAYER = 'PLAYER',
  MONSTER = 'MONSTER'
}

export interface CreateCreatureRequest {
  name: string;
  type: CreatureType;
  currentHp: number;
  maxHp: number;
  initiative: number;
  armorClass: number;
}

export interface UpdateCreatureRequest {
  name?: string;
  type?: CreatureType;
  currentHp?: number;
  maxHp?: number;
  initiative?: number;
  armorClass?: number;
}

export interface Battle {
  id: string;
  userId: string;
  name: string;
  status: CombatStatus;
  creatures: Creature[];  // NEW
  currentRound: number;
  currentTurnIndex: number;
  createdAt: string;
  updatedAt: string;
}
```

---

## Kotlin Data Classes (Backend)

```kotlin
data class Creature(
    val id: UUID,
    val name: String,
    val type: CreatureType,
    val currentHp: Int,
    val maxHp: Int,
    val initiative: Int,
    val armorClass: Int,
    val statusEffects: List<String> = emptyList()
) {
    init {
        require(name.isNotBlank()) { "Creature name cannot be blank" }
        require(maxHp > 0) { "Max HP must be positive" }
        require(currentHp >= 0) { "Current HP cannot be negative" }
        require(currentHp <= maxHp) { "Current HP cannot exceed max HP" }
        require(armorClass >= 0) { "Armor class cannot be negative" }
    }

    fun isDefeated(): Boolean = currentHp == 0
}

enum class CreatureType {
    PLAYER,
    MONSTER
}
```

---

## Summary

- **Creature**: Value object within Battle aggregate (no independent lifecycle)
- **Events**: CreatureAdded, CreatureUpdated, CreatureRemoved, CombatEnded (modified)
- **Storage**: ~300 bytes per creature event, ~190 bytes per creature in memory
- **Performance**: Event replay <100ms for 20 creatures, sorting <10ms
- **Validation**: Three-layer (frontend, DTO, domain) for defense in depth
