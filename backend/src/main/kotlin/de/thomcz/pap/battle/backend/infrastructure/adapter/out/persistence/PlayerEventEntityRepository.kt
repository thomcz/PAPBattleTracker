package de.thomcz.pap.battle.backend.infrastructure.adapter.out.persistence

import de.thomcz.pap.battle.backend.infrastructure.adapter.out.persistence.entity.PlayerEventEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import java.util.UUID

interface PlayerEventEntityRepository : JpaRepository<PlayerEventEntity, UUID> {
    fun findByPlayerIdOrderBySequenceNumberAsc(playerId: UUID): List<PlayerEventEntity>

    fun findByPlayerIdAndSequenceNumberGreaterThanOrderBySequenceNumberAsc(
        playerId: UUID,
        sequenceNumber: Int
    ): List<PlayerEventEntity>

    fun countByPlayerId(playerId: UUID): Int

    @Query("SELECT COALESCE(MAX(e.sequenceNumber), 0) FROM PlayerEventEntity e WHERE e.playerId = :playerId")
    fun getMaxSequenceNumber(playerId: UUID): Int
}
