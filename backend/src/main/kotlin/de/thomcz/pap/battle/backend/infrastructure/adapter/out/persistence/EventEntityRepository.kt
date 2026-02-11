package de.thomcz.pap.battle.backend.infrastructure.adapter.out.persistence

import de.thomcz.pap.battle.backend.infrastructure.adapter.out.persistence.entity.EventEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.util.UUID

/**
 * Spring Data JPA repository for event persistence.
 *
 * Provides low-level database operations for events.
 * Used by H2EventStore adapter to implement EventStore port.
 */
@Repository
interface EventEntityRepository : JpaRepository<EventEntity, UUID> {
    /**
     * Find all events for a battle, ordered by sequence number.
     * This ensures events are replayed in the correct order.
     */
    fun findByBattleIdOrderBySequenceNumberAsc(battleId: UUID): List<EventEntity>

    /**
     * Find events after a specific sequence number (for incremental loading).
     */
    fun findByBattleIdAndSequenceNumberGreaterThanOrderBySequenceNumberAsc(
        battleId: UUID,
        sequenceNumber: Int
    ): List<EventEntity>

    /**
     * Count events for a battle (for snapshotting decisions).
     */
    fun countByBattleId(battleId: UUID): Int

    /**
     * Get the highest sequence number for a battle.
     * Used when appending new events to determine next sequence number.
     */
    @Query("SELECT COALESCE(MAX(e.sequenceNumber), 0) FROM EventEntity e WHERE e.battleId = :battleId")
    fun getMaxSequenceNumber(battleId: UUID): Int

    /**
     * Delete all events for a battle (when battle is deleted).
     */
    fun deleteByBattleId(battleId: UUID)
}
