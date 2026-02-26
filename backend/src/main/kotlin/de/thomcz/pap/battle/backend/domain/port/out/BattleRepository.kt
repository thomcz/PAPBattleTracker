package de.thomcz.pap.battle.backend.domain.port.out

import de.thomcz.pap.battle.backend.domain.model.Battle
import de.thomcz.pap.battle.backend.domain.model.CombatStatus
import java.util.UUID

/**
 * Port interface for battle aggregate persistence and querying.
 *
 * Note: In event sourcing, this repository manages battle *metadata* (for querying),
 * while the EventStore handles the actual state through events.
 *
 * The repository reconstructs battle aggregates by loading events from EventStore.
 */
interface BattleRepository {
    /**
     * Find a battle by ID, reconstructing state from events.
     *
     * @param battleId The battle aggregate ID
     * @return Battle aggregate or null if not found
     */
    fun findById(battleId: UUID): Battle?

    /**
     * Find all battles for a user.
     *
     * @param userId The user ID
     * @param status Optional filter by combat status
     * @return List of battle aggregates
     */
    fun findByUserId(userId: UUID, status: CombatStatus? = null): List<Battle>

    /**
     * Find all battles belonging to a session.
     */
    fun findBySessionId(sessionId: UUID): List<Battle>

    /**
     * Save battle metadata after events are persisted.
     * This updates queryable fields like name, status, lastModified.
     *
     * @param battle The battle aggregate
     */
    fun save(battle: Battle)

    /**
     * Delete a battle and all its events.
     *
     * @param battleId The battle aggregate ID
     */
    fun deleteById(battleId: UUID)
}
