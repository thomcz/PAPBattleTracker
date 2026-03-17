package de.thomcz.pap.battle.backend.domain.model.events

import java.time.Instant
import java.util.UUID

/**
 * Domain event: Healing was applied to a creature.
 *
 * Emitted when a Game Master applies healing to a creature during active combat.
 *
 * Emitted by: Battle.applyHealing()
 */
data class HealingApplied(
    override val battleId: UUID,
    override val eventId: UUID,
    override val timestamp: Instant,
    override val userId: UUID,
    val creatureId: UUID,
    val healing: Int,
    val newHp: Int,
    val source: String? = null
) : BattleEvent
