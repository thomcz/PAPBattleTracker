package de.thomcz.pap.battle.backend.domain.model.events

import java.time.Instant
import java.util.UUID

/**
 * Domain event: A status effect was added to a creature.
 *
 * Emitted by: Battle.applyStatusEffect() with action ADD
 */
data class StatusEffectApplied(
    override val battleId: UUID,
    override val eventId: UUID,
    override val timestamp: Instant,
    override val userId: UUID,
    val creatureId: UUID,
    val effect: String
) : BattleEvent
