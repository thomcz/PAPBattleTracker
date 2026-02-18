package de.thomcz.pap.battle.backend.domain.model.events

import java.time.Instant
import java.util.UUID

/**
 * Domain event: A creature was removed from the battle.
 *
 * Emitted when a Game Master manually removes a combatant from the battle.
 * This is different from automatic monster removal on combat end.
 *
 * Emitted by: Battle.removeCreature()
 */
data class CreatureRemoved(
    override val battleId: UUID,
    override val eventId: UUID,
    override val timestamp: Instant,
    override val userId: UUID,
    val creatureId: UUID
) : BattleEvent
