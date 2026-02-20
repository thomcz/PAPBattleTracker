package de.thomcz.pap.battle.backend.infrastructure.adapter.out.persistence

import de.thomcz.pap.battle.backend.infrastructure.adapter.out.persistence.entity.PlayerEntity
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface PlayerEntityRepository : JpaRepository<PlayerEntity, UUID> {
    fun findByUserId(userId: UUID): List<PlayerEntity>
}
