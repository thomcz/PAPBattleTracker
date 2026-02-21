package de.thomcz.pap.battle.backend.domain.model.events

import java.time.Instant
import java.util.UUID

/**
 * Base interface for all beastery creature domain events.
 * Events are immutable records of state changes in the beastery creature aggregate.
 */
sealed interface BeasteryCreatureEvent {
    val creatureId: UUID
    val eventId: UUID
    val timestamp: Instant
    val userId: UUID
}
