package de.thomcz.pap.battle.backend.infrastructure.adapter.out.persistence

import de.thomcz.pap.battle.backend.infrastructure.adapter.out.persistence.entity.SessionEventEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import java.util.UUID

interface SessionEventEntityRepository : JpaRepository<SessionEventEntity, UUID> {
    fun findBySessionIdOrderBySequenceNumberAsc(sessionId: UUID): List<SessionEventEntity>

    fun findBySessionIdAndSequenceNumberGreaterThanOrderBySequenceNumberAsc(
        sessionId: UUID,
        sequenceNumber: Int
    ): List<SessionEventEntity>

    fun countBySessionId(sessionId: UUID): Int

    @Query("SELECT COALESCE(MAX(e.sequenceNumber), 0) FROM SessionEventEntity e WHERE e.sessionId = :sessionId")
    fun getMaxSequenceNumber(sessionId: UUID): Int

    fun deleteBySessionId(sessionId: UUID)
}
