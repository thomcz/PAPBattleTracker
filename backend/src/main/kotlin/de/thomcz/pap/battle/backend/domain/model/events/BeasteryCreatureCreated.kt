package de.thomcz.pap.battle.backend.domain.model.events

import java.time.Instant
import java.util.UUID

/**
 * Domain event: A new creature was added to the beastery.
 *
 * Emitted by: BeasteryCreature.create()
 */
data class BeasteryCreatureCreated(
    override val creatureId: UUID,
    override val eventId: UUID,
    override val timestamp: Instant,
    override val userId: UUID,
    val name: String,
    val hitPoints: Int,
    val armorClass: Int
) : BeasteryCreatureEvent
