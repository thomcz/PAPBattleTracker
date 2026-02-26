package de.thomcz.pap.battle.backend.infrastructure.adapter.out.persistence

import de.thomcz.pap.battle.backend.infrastructure.adapter.out.persistence.entity.SessionEntity
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface SessionEntityRepository : JpaRepository<SessionEntity, UUID> {
    fun findByUserId(userId: UUID): List<SessionEntity>
    fun findByUserIdAndStatus(userId: UUID, status: String): List<SessionEntity>
}
