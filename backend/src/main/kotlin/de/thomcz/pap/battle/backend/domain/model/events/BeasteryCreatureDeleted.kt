package de.thomcz.pap.battle.backend.domain.model.events

import java.time.Instant
import java.util.UUID

/**
 * Domain event: A creature was deleted from the beastery (hard delete).
 *
 * Emitted by: BeasteryCreature.delete()
 */
data class BeasteryCreatureDeleted(
    override val creatureId: UUID,
    override val eventId: UUID,
    override val timestamp: Instant,
    override val userId: UUID
) : BeasteryCreatureEvent
