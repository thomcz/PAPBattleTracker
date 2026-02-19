# Battle Domain Data Model

**Feature**: 003-start-battle
**Date**: 2026-02-18
**Architecture**: Hexagonal (Domain-Driven Design with Event Sourcing)

## Overview

This document defines the domain entities, value objects, and event types for the battle tracking feature. All entities follow domain-driven design principles with aggregate roots and value objects. Battle state changes are recorded as immutable domain events for event sourcing.

---

## Aggregate Root: Battle

**Responsibility**: Manage complete battle lifecycle and enforce business rules

```kotlin
// Domain Entity
data class Battle(
    val id: BattleId,                          // UUID
    val createdAt: Instant,
    val createdBy: UserId,                     // FK: who started battle
    val status: BattleStatus,                  // ACTIVE | ENDED
    val round: Int,                            // Current round (1+)
    val creatures: List<BattleCreature>,       // All participants (ordered by initiative)
    val currentActorIndex: Int,                // Index into creatures[] = current turn
    val events: List<BattleEvent>,             // Event sourcing: all state changes
    val endedAt: Instant? = null
)

enum class BattleStatus {
    ACTIVE,                                    // Turn-based combat ongoing
    ENDED                                      // Manually concluded by GM
}

// Value Object: ID
value class BattleId(val value: UUID)

// Value Object: Unique constraint
// Battles uniquely identified by (createdBy, createdAt, status)
```

**Business Rules**:
1. Battle must have 2+ creatures to start (FR-001)
2. Initiative determined once at start: creature.initiativeModifier + gmEnteredD20Roll (FR-002)
3. Initiative ties broken by creature selection order (stable sort)
4. Turn order auto-rotates: after last creature, round increments and reset to first
5. Battle remains ACTIVE even when all creatures defeated (manual end required, FR-008)
6. Once ENDED, battle cannot be modified

**Validation Rules**:
- Creatures list non-empty and ≥2
- Round ≥ 1
- currentActorIndex ∈ [0, creatures.size)
- All events immutable (no edits after append)

---

## Value Object: BattleCreature

**Responsibility**: Snapshot of a creature at battle start + current HP/status

```kotlin
data class BattleCreature(
    val id: BattleCreatureId,                  // UUID (unique per battle)
    val creatureId: CreatureId,                // FK: reference to master record
    val creatureName: String,                  // Snapshot: immutable from start
    val maxHp: Int,                            // Snapshot: from creature at start
    val currentHp: Int,                        // Mutable: changes via DamageApplied event
    val status: CreatureStatus,                // ACTIVE | DEFEATED
    val ac: Int,                               // Snapshot: Armor Class (for future)
    val initiativeModifier: Int,               // Snapshot: from creature
    val initiativeRoll: Int,                   // d20 roll entered by GM
    val initiativeTotal: Int                   // Computed: modifier + roll
        get() = initiativeModifier + initiativeRoll
)

enum class CreatureStatus {
    ACTIVE,                                    // HP > 0, can take actions
    DEFEATED                                   // HP ≤ 0, eliminated from combat
}

value class BattleCreatureId(val value: UUID)

// Validation
class BattleCreature {
    init {
        require(maxHp > 0) { "maxHp must be positive" }
        require(currentHp >= 0) { "currentHp cannot be negative" }
        require(currentHp <= maxHp) { "currentHp cannot exceed maxHp" }
        require(initiativeRoll in 1..20) { "d20 roll must be 1-20" }
    }

    // Business logic: compute status based on HP
    val status: CreatureStatus
        get() = if (currentHp <= 0) CreatureStatus.DEFEATED else CreatureStatus.ACTIVE
}
```

**Relationships**:
- Belongs to Battle aggregate
- References Creature master record (immutable reference)
- Snapshot prevents master record changes from affecting ongoing battle

---

## Value Object: BattleState

**Responsibility**: Current round and turn information

```kotlin
data class BattleState(
    val round: Int,                            // Current round number (1+)
    val currentActorIndex: Int,                // Index of creature currently acting
    val initiativeOrder: List<BattleCreature>, // Sorted by initiative (static)
    val turnCount: Int                         // Total turns taken (0+)
)

// Derived properties
val currentActor: BattleCreature
    get() = initiativeOrder[currentActorIndex]

val isRoundEnd: Boolean
    get() = currentActorIndex == initiativeOrder.size - 1

fun nextTurn(): BattleState {
    val nextIndex = if (isRoundEnd) 0 else currentActorIndex + 1
    val nextRound = if (isRoundEnd) round + 1 else round
    return copy(
        round = nextRound,
        currentActorIndex = nextIndex,
        turnCount = turnCount + 1
    )
}
```

---

## Domain Events (Event Sourcing)

**Pattern**: Immutable event objects; single sealed class hierarchy

```kotlin
// Base Event
sealed class BattleEvent {
    abstract val battleId: BattleId
    abstract val timestamp: Instant
    abstract val version: Long                 // Event sequence number
}

// Event 1: Battle Created
data class BattleStarted(
    override val battleId: BattleId,
    override val timestamp: Instant = Instant.now(),
    override val version: Long,
    val createdBy: UserId,
    val creatures: List<BattleCreature>        // Initial creatures (before d20 rolls)
) : BattleEvent()

// Event 2: Initiative Roll Entered
data class InitiativeRolled(
    override val battleId: BattleId,
    override val timestamp: Instant = Instant.now(),
    override val version: Long,
    val creatureId: BattleCreatureId,
    val d20Roll: Int                           // 1-20 entered by GM
) : BattleEvent()

// Event 3: Turn Progressed
data class TurnProgressed(
    override val battleId: BattleId,
    override val timestamp: Instant = Instant.now(),
    override val version: Long,
    val newActorIndex: Int,
    val newRound: Int
) : BattleEvent()

// Event 4: Damage Applied
data class DamageApplied(
    override val battleId: BattleId,
    override val timestamp: Instant = Instant.now(),
    override val version: Long,
    val creatureId: BattleCreatureId,
    val damage: Int,                           // HP reduction (must be > 0)
    val newHp: Int,                            // HP after damage (≥ 0)
    val source: String? = null                 // Who dealt damage (future: attack ID)
) : BattleEvent()

// Event 5: Creature Defeated
data class CreatureDefeated(
    override val battleId: BattleId,
    override val timestamp: Instant = Instant.now(),
    override val version: Long,
    val creatureId: BattleCreatureId,
    val defeatedAt: Int                        // Turn number when defeated
) : BattleEvent()

// Event 6: Battle Ended
data class BattleEnded(
    override val battleId: BattleId,
    override val timestamp: Instant = Instant.now(),
    override val version: Long,
    val endedBy: UserId,
    val finalRound: Int,
    val finalTurnCount: Int
) : BattleEvent()

// Event 7: Combat Log Event (for UI log display)
data class CombatLogEntry(
    override val battleId: BattleId,
    override val timestamp: Instant = Instant.now(),
    override val version: Long,
    val message: String,                       // Formatted: "[Round X] Creature took Y damage"
    val type: LogEntryType
) : BattleEvent()

enum class LogEntryType {
    ROUND_START,
    CREATURE_ACTION,
    DAMAGE,
    DEFEAT,
    BATTLE_END
}
```

**Event Sourcing Rules**:
- Events are append-only (no edits/deletes)
- Each event has immutable timestamp and version
- Version starts at 1 and increments per event
- Events can be replayed to reconstruct battle state at any point
- Snapshots (optional) can cache reconstructed state every N events (e.g., N=100)

---

## Port Interfaces (Hexagonal)

**Responsibility**: Define contracts for external systems

```kotlin
// Port 1: Persist/Load Battle
interface BattleRepository {
    suspend fun save(battle: Battle): BattleId
    suspend fun findById(id: BattleId): Battle?
    suspend fun findAll(userId: UserId): List<Battle>
    suspend fun update(battle: Battle): Unit
}

// Port 2: Fetch Creature Master Record
interface CreaturePort {
    suspend fun getCreature(id: CreatureId): Creature?
    suspend fun getCreatures(ids: List<CreatureId>): List<Creature>
}

// Port 3: Publish Events (for UI real-time updates)
interface BattleEventBus {
    fun publish(event: BattleEvent)
    fun subscribe(battleId: BattleId, observer: (BattleEvent) -> Unit)
}

// Port 4: Fetch User Context
interface UserPort {
    suspend fun getCurrentUser(): UserId?
}
```

---

## Validation & Business Rules

### When Creating Battle

1. Must have ≥2 creatures
2. All creature IDs must be valid (exist in master record)
3. Creatures cannot be duplicated in battle
4. Current user must be authenticated

### When Rolling Initiative

1. d20 must be 1-20
2. Creature must exist in current battle
3. Roll must not be duplicated (each creature rolls once)

### When Applying Damage

1. Damage must be > 0 (no healing in this version)
2. Creature must be in ACTIVE status
3. New HP = currentHp - damage, floored at 0
4. If newHp ≤ 0, creature status changes to DEFEATED

### When Ending Battle

1. Battle must be in ACTIVE status
2. Current user must match battle.createdBy (or admin)

---

## Future Extensions

1. **Healing**: Add HealingApplied event, allow HP > maxHp (over-healing cap)
2. **Status Effects**: Add StatusEffect value object (Stunned, Poisoned, etc.)
3. **Action Economy**: Add Action value object (attack, dodge, ability)
4. **Damage Types**: Extend DamageApplied to include type (physical, magical, etc.)
5. **Spell/Ability Tracking**: Add Ability entity with cooldowns
6. **Experience/Loot**: Add RewardGranted event for post-battle
