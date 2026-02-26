package de.thomcz.pap.battle.backend.infrastructure.adapter.out.persistence

import de.thomcz.pap.battle.backend.infrastructure.adapter.out.persistence.entity.BattleEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

/**
 * Spring Data JPA repository for battle metadata persistence.
 *
 * This stores queryable metadata only - the actual battle state
 * is reconstructed from events via EventStore.
 */
@Repository
interface BattleEntityRepository : JpaRepository<BattleEntity, UUID> {
    /**
     * Find all battles for a user.
     */
    fun findByUserId(userId: UUID): List<BattleEntity>

    /**
     * Find battles for a user filtered by status.
     */
    fun findByUserIdAndStatus(userId: UUID, status: String): List<BattleEntity>

    fun findBySessionId(sessionId: UUID): List<BattleEntity>
}
