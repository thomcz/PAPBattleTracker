package de.thomcz.pap.battle.backend.domain.model.events

import de.thomcz.pap.battle.backend.domain.model.CreatureType
import java.time.Instant
import java.util.UUID

/**
 * Domain event: A creature's attributes were updated.
 *
 * Emitted when a Game Master modifies a creature's stats (name, HP, initiative, AC, type).
 * Can occur before or during combat.
 *
 * Emitted by: Battle.updateCreature()
 */
data class CreatureUpdated(
    override val battleId: UUID,
    override val eventId: UUID,
    override val timestamp: Instant,
    override val userId: UUID,
    val creatureId: UUID,
    val name: String,
    val type: CreatureType,
    val currentHp: Int,
    val maxHp: Int,
    val initiative: Int,
    val armorClass: Int,
    val dexModifier: Int? = null
) : BattleEvent
