package de.thomcz.pap.battle.backend.domain.port.out

import de.thomcz.pap.battle.backend.domain.model.events.BattleEvent
import java.util.UUID

/**
 * Port interface for persisting and retrieving battle events.
 *
 * This is the core of event sourcing - all state changes are stored as
 * immutable events. Battle state is reconstructed by replaying events in order.
 *
 * Implementation note: Events must be stored in sequence order and returned
 * in the same order for correct state reconstruction.
 */
interface EventStore {
    /**
     * Persist a list of events for a battle.
     * Events are appended to the event log and assigned sequence numbers.
     *
     * @param battleId The battle aggregate ID
     * @param events List of events to persist (in order)
     */
    fun saveEvents(battleId: UUID, events: List<BattleEvent>)

    /**
     * Retrieve all events for a battle in sequence order.
     * Used to reconstruct battle state from scratch.
     *
     * @param battleId The battle aggregate ID
     * @param afterSequence Optional: only return events after this sequence number (for incremental loading)
     * @return List of events in chronological order
     */
    fun getEvents(battleId: UUID, afterSequence: Int = 0): List<BattleEvent>

    /**
     * Get the count of events for a battle.
     * Useful for determining if snapshotting is needed.
     *
     * @param battleId The battle aggregate ID
     * @return Total number of events
     */
    fun getEventCount(battleId: UUID): Int
}
