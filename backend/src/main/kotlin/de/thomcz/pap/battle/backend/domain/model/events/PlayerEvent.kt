package de.thomcz.pap.battle.backend.domain.model.events

import java.time.Instant
import java.util.UUID

/**
 * Base interface for all player domain events.
 * Events are immutable records of state changes in the player aggregate.
 *
 * Players are user-scoped reusable character templates that can be
 * added to battles. Event sourcing provides audit trail and replay.
 */
sealed interface PlayerEvent {
    val playerId: UUID
    val eventId: UUID
    val timestamp: Instant
    val userId: UUID
}
