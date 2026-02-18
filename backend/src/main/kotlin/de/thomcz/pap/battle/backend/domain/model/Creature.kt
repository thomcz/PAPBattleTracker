package de.thomcz.pap.battle.backend.domain.model

import java.util.UUID

/**
 * Represents a combatant (player character or monster) in a battle.
 *
 * This is a value object within the Battle aggregate - creatures don't have
 * independent lifecycle and only exist within a battle context.
 *
 * @property id Unique identifier for this creature within the battle
 * @property name Display name of the creature
 * @property type Whether this is a PLAYER (persistent) or MONSTER (removed on combat end)
 * @property currentHp Current hit points (can be 0 for defeated creatures)
 * @property maxHp Maximum hit points (must be positive)
 * @property initiative Initiative score for turn order (higher goes first)
 * @property armorClass Armor class for defense calculations
 * @property statusEffects List of active status effects (e.g., "poisoned", "blessed")
 */
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
        require(maxHp > 0) { "Max HP must be positive, was: $maxHp" }
        require(currentHp >= 0) { "Current HP cannot be negative, was: $currentHp" }
        require(currentHp <= maxHp) { "Current HP ($currentHp) cannot exceed max HP ($maxHp)" }
        require(armorClass >= 0) { "Armor class cannot be negative, was: $armorClass" }
    }

    /**
     * Returns true if the creature is defeated (current HP is zero).
     */
    fun isDefeated(): Boolean = currentHp == 0

    /**
     * Creates a new creature with updated current HP.
     * HP is capped at maxHp and cannot go below 0.
     */
    fun withHp(newHp: Int): Creature {
        val cappedHp = newHp.coerceIn(0, maxHp)
        return copy(currentHp = cappedHp)
    }

    /**
     * Applies damage to this creature.
     * @param amount Damage amount (must be non-negative)
     * @return New creature with reduced HP
     */
    fun takeDamage(amount: Int): Creature {
        require(amount >= 0) { "Damage amount cannot be negative, was: $amount" }
        return withHp(currentHp - amount)
    }

    /**
     * Applies healing to this creature.
     * @param amount Healing amount (must be non-negative)
     * @return New creature with increased HP (capped at maxHp)
     */
    fun heal(amount: Int): Creature {
        require(amount >= 0) { "Healing amount cannot be negative, was: $amount" }
        return withHp(currentHp + amount)
    }

    /**
     * Adds a status effect to this creature.
     */
    fun addEffect(effect: String): Creature {
        require(effect.isNotBlank()) { "Status effect cannot be blank" }
        return copy(statusEffects = statusEffects + effect)
    }

    /**
     * Removes a status effect from this creature.
     */
    fun removeEffect(effect: String): Creature {
        return copy(statusEffects = statusEffects.filter { it != effect })
    }

    /**
     * Removes all status effects from this creature.
     */
    fun clearEffects(): Creature {
        return copy(statusEffects = emptyList())
    }
}
