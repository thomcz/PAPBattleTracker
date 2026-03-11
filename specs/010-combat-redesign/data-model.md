# Data Model: Combat Screen Redesign

**Feature**: 010-combat-redesign
**Date**: 2026-03-03

---

## Existing Models (modified)

### Creature (Backend + Frontend)

**Current state**: `{ id, name, type, currentHp, maxHp, initiative, armorClass, isDefeated, effects/statusEffects }`

**Changes**: Add `dexModifier` field (optional).

```typescript
// Frontend: core/domain/models/battle.model.ts
export interface Creature {
  id: string;
  name: string;
  type: CreatureType;           // PLAYER | MONSTER
  currentHp: number;
  maxHp: number;
  initiative: number;
  armorClass: number;
  isDefeated: boolean;
  effects: string[];            // Status effect names
  dexModifier?: number;         // NEW: for initiative roll hint (optional)
}
```

```kotlin
// Backend: domain/model/Creature.kt (additions only)
data class Creature(
    // ... existing fields ...
    val dexModifier: Int? = null   // NEW: nullable for backward compatibility
)
```

**Validation**:
- `dexModifier` range: -5 to +10 (standard D&D range); nullable/optional
- `effects` values: constrained to known status effect names (see StatusEffect enum)
- `currentHp` clamped to `[0, maxHp]` — never negative, never exceeds max

---

### Battle (Backend + Frontend)

**No structural changes.** The existing `Battle` model supports all four screens:
- `status: CombatStatus` — drives which screen is shown
- `currentTurn: number` — tracks active combatant index
- `round: number` — tracks current round
- `creatures: Creature[]` — ordered by initiative when ACTIVE

---

## New Frontend-Only Models

### StatusEffect (enum)

```typescript
// Frontend: core/domain/models/combat.model.ts (new file)
export enum StatusEffect {
  POISONED   = 'Poisoned',
  STUNNED    = 'Stunned',
  BLINDED    = 'Blinded',
  BLESSED    = 'Blessed',
  PRONE      = 'Prone',
  RESTRAINED = 'Restrained',
  BURNING    = 'Burning',
  FROZEN     = 'Frozen'
}
```

### InitiativeEntry (local, initiative setup screen)

```typescript
export interface InitiativeEntry {
  creature: Creature;
  initiative: number;    // working value before confirming
}
```

### CombatContribution (local, result screen)

```typescript
// Accumulated in CombatContributionService during active combat
export interface CombatContribution {
  creatureId: string;
  creatureName: string;
  creatureType: CreatureType;   // Only PLAYER contributions shown on result
  totalDamage: number;
  totalHealing: number;
  criticalHits: number;         // Tracked when damage >= threshold or flagged by DM
  buffsApplied: number;         // Count of beneficial status effects applied
}
```

### CombatResult (local, result screen)

```typescript
export interface CombatResult {
  outcome: CombatOutcome;              // PLAYERS_VICTORIOUS | PLAYERS_DEFEATED | DRAW | ABORTED
  totalRounds: number;
  startedAt: Date;                     // Captured when START BATTLE is tapped
  endedAt: Date;                       // Captured when End Combat is tapped
  contributions: CombatContribution[];
}
```

---

## New Backend DTOs

### ApplyHealingCommand

```kotlin
data class ApplyHealingCommand(
    val creatureId: UUID,
    val healing: Int,
    val source: String? = null
)
```

### ApplyStatusEffectCommand

```kotlin
data class ApplyStatusEffectCommand(
    val effect: String,
    val action: EffectAction   // ADD | REMOVE
)

enum class EffectAction { ADD, REMOVE }
```

### CreateCreatureRequest (extended)

```kotlin
data class CreateCreatureRequest(
    val name: String,
    val type: CreatureType,
    val currentHp: Int,
    val maxHp: Int,
    val initiative: Int,
    val armorClass: Int,
    val dexModifier: Int? = null   // NEW
)
```

### UpdateCreatureRequest (extended)

```kotlin
data class UpdateCreatureRequest(
    val name: String,
    val currentHp: Int,
    val maxHp: Int,
    val initiative: Int,
    val armorClass: Int,
    val dexModifier: Int? = null   // NEW
)
```

---

## New Backend Domain Events

```kotlin
// Backend: domain/model/events/BattleEvent.kt (additions)
data class HealingApplied(
    val battleId: UUID,
    val creatureId: UUID,
    val amount: Int,
    val source: String?
) : BattleEvent()

data class StatusEffectApplied(
    val battleId: UUID,
    val creatureId: UUID,
    val effect: String
) : BattleEvent()

data class StatusEffectRemoved(
    val battleId: UUID,
    val creatureId: UUID,
    val effect: String
) : BattleEvent()
```

---

## State Transitions

### Battle Status → Screen Mapping

| CombatStatus    | Screen shown          | Navigation trigger               |
|-----------------|-----------------------|----------------------------------|
| `NOT_STARTED`   | CombatPrepare         | Default on `battles/:id` load    |
| `NOT_STARTED`   | CombatInitiative      | "Start Battle" tapped            |
| `ACTIVE`        | CombatActive          | "Start Battle" on initiative     |
| `PAUSED`        | CombatActive          | Same screen (status badge shows) |
| `ENDED`         | CombatResult          | "End Combat" + outcome selected  |

### HP State Machine (Creature)

```
[any HP > 0] --applyDamage--> [HP clamped to 0] --> isDefeated = true
[any HP] --applyHealing--> [HP clamped to maxHp]
```

---

## Port Interface Extensions (Frontend)

```typescript
// core/ports/battle.port.ts — new abstract methods to add:
abstract applyHealing(
  battleId: string,
  creatureId: string,
  healing: number,
  source?: string
): Observable<Battle>;

abstract applyStatusEffect(
  battleId: string,
  creatureId: string,
  effect: string,
  action: 'ADD' | 'REMOVE'
): Observable<Battle>;
```
