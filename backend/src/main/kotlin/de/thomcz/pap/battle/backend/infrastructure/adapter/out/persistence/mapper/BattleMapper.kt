package de.thomcz.pap.battle.backend.infrastructure.adapter.out.persistence.mapper

import de.thomcz.pap.battle.backend.domain.model.Battle
import de.thomcz.pap.battle.backend.domain.model.CombatStatus
import de.thomcz.pap.battle.backend.infrastructure.adapter.out.persistence.entity.BattleEntity

/**
 * Maps between Battle domain aggregate and BattleEntity JPA entity.
 *
 * Important: This maps METADATA only, not full state.
 * Full battle state is reconstructed from events via EventStore.
 */
object BattleMapper {
    /**
     * Convert Battle aggregate to BattleEntity for metadata persistence.
     */
    fun toEntity(battle: Battle, eventCount: Int): BattleEntity {
        return BattleEntity(
            battleId = battle.battleId,
            userId = battle.userId,
            sessionId = battle.sessionId,
            name = battle.name,
            status = battle.status.name,
            createdAt = battle.createdAt,
            lastModified = battle.lastModified,
            eventCount = eventCount
        )
    }

    /**
     * Extract basic metadata from BattleEntity.
     * Note: This does NOT reconstruct full battle state - use BattleRepository.findById() for that.
     */
    fun toDomainMetadata(entity: BattleEntity): Triple<String, CombatStatus, Int> {
        return Triple(
            entity.name ?: throw IllegalStateException("Battle name cannot be null"),
            CombatStatus.valueOf(entity.status ?: throw IllegalStateException("Battle status cannot be null")),
            entity.eventCount
        )
    }
}
