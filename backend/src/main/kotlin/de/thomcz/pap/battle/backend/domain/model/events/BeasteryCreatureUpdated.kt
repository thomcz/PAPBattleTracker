package de.thomcz.pap.battle.backend.domain.model.events

import java.time.Instant
import java.util.UUID

/**
 * Domain event: A beastery creature's attributes were updated.
 * All fields carry the full new state (not deltas).
 *
 * Emitted by: BeasteryCreature.update()
 */
data class BeasteryCreatureUpdated(
    override val creatureId: UUID,
    override val eventId: UUID,
    override val timestamp: Instant,
    override val userId: UUID,
    val name: String,
    val hitPoints: Int,
    val armorClass: Int
) : BeasteryCreatureEvent
