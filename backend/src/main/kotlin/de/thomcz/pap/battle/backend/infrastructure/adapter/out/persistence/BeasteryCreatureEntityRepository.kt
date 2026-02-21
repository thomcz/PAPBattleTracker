package de.thomcz.pap.battle.backend.infrastructure.adapter.out.persistence

import de.thomcz.pap.battle.backend.infrastructure.adapter.out.persistence.entity.BeasteryCreatureEntity
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface BeasteryCreatureEntityRepository : JpaRepository<BeasteryCreatureEntity, UUID> {
    fun findByUserId(userId: UUID): List<BeasteryCreatureEntity>
}
