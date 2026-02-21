package de.thomcz.pap.battle.backend.infrastructure.adapter.out.persistence

import de.thomcz.pap.battle.backend.infrastructure.adapter.out.persistence.entity.BeasteryCreatureEventEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import java.util.UUID

interface BeasteryCreatureEventEntityRepository : JpaRepository<BeasteryCreatureEventEntity, UUID> {
    fun findByCreatureIdOrderBySequenceNumberAsc(creatureId: UUID): List<BeasteryCreatureEventEntity>

    fun findByCreatureIdAndSequenceNumberGreaterThanOrderBySequenceNumberAsc(
        creatureId: UUID,
        sequenceNumber: Int
    ): List<BeasteryCreatureEventEntity>

    fun countByCreatureId(creatureId: UUID): Int

    @Query("SELECT COALESCE(MAX(e.sequenceNumber), 0) FROM BeasteryCreatureEventEntity e WHERE e.creatureId = :creatureId")
    fun getMaxSequenceNumber(creatureId: UUID): Int
}
