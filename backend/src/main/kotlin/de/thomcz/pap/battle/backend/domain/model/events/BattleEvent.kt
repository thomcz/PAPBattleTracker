package de.thomcz.pap.battle.backend.domain.model.events

import java.time.Instant
import java.util.UUID

/**
 * Base interface for all battle domain events.
 * Events are immutable records of state changes in the battle aggregate.
 * All events must include battleId, eventId, timestamp, and userId for traceability.
 *
 * This is the foundation of event sourcing - every state change emits an event,
 * and aggregate state is reconstructed by replaying events in sequence.
 */
sealed interface BattleEvent {
    val battleId: UUID
    val eventId: UUID
    val timestamp: Instant
    val userId: UUID
}
