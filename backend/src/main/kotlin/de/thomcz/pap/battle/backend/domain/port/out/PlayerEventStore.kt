package de.thomcz.pap.battle.backend.domain.port.out

import de.thomcz.pap.battle.backend.domain.model.events.PlayerEvent
import java.util.UUID

/**
 * Port interface for persisting and retrieving player events.
 *
 * Follows the same event sourcing pattern as EventStore (for battles),
 * but operates on the Player aggregate.
 */
interface PlayerEventStore {
    fun saveEvents(playerId: UUID, events: List<PlayerEvent>)
    fun getEvents(playerId: UUID, afterSequence: Int = 0): List<PlayerEvent>
    fun getEventCount(playerId: UUID): Int
}
