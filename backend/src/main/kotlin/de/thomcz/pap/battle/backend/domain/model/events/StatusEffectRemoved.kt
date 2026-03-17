package de.thomcz.pap.battle.backend.domain.model.events

import java.time.Instant
import java.util.UUID

/**
 * Domain event: A status effect was removed from a creature.
 *
 * Emitted by: Battle.applyStatusEffect() with action REMOVE
 */
data class StatusEffectRemoved(
    override val battleId: UUID,
    override val eventId: UUID,
    override val timestamp: Instant,
    override val userId: UUID,
    val creatureId: UUID,
    val effect: String
) : BattleEvent
