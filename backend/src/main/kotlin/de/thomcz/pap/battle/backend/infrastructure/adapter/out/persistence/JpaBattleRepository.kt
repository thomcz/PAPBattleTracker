package de.thomcz.pap.battle.backend.infrastructure.adapter.out.persistence

import de.thomcz.pap.battle.backend.domain.model.Battle
import de.thomcz.pap.battle.backend.domain.model.CombatStatus
import de.thomcz.pap.battle.backend.domain.port.out.BattleRepository
import de.thomcz.pap.battle.backend.domain.port.out.EventStore
import de.thomcz.pap.battle.backend.infrastructure.adapter.out.persistence.mapper.BattleMapper
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

/**
 * JPA implementation of BattleRepository port.
 *
 * Coordinates between battle metadata (BattleEntity) and event sourcing (EventStore).
 * When loading a battle, reconstructs state by replaying events from EventStore.
 * When saving, persists both events and metadata.
 */
@Component
class JpaBattleRepository(
    private val battleEntityRepository: BattleEntityRepository,
    private val eventStore: EventStore
) : BattleRepository {

    @Transactional(readOnly = true)
    override fun findById(battleId: UUID): Battle? {
        // Check if battle exists
        val entity = battleEntityRepository.findById(battleId).orElse(null) ?: return null

        // Reconstruct battle from events
        val events = eventStore.getEvents(battleId)
        return if (events.isNotEmpty()) {
            Battle.newInstance().loadFromHistory(events)
        } else {
            // No events yet - return empty battle (shouldn't happen in normal flow)
            null
        }
    }

    @Transactional(readOnly = true)
    override fun findByUserId(userId: UUID, status: CombatStatus?): List<Battle> {
        val entities = if (status != null) {
            battleEntityRepository.findByUserIdAndStatus(userId, status.name)
        } else {
            battleEntityRepository.findByUserId(userId)
        }

        // Reconstruct each battle from its events
        return entities.mapNotNull { entity ->
            entity.battleId?.let { findById(it) }
        }
    }

    @Transactional
    override fun save(battle: Battle) {
        // First, save uncommitted events
        val uncommittedEvents = battle.getUncommittedEvents()
        if (uncommittedEvents.isNotEmpty()) {
            eventStore.saveEvents(battle.battleId, uncommittedEvents)
            battle.markEventsAsCommitted()
        }

        // Then, save/update metadata
        val eventCount = eventStore.getEventCount(battle.battleId)
        val entity = BattleMapper.toEntity(battle, eventCount)
        battleEntityRepository.save(entity)
    }

    @Transactional
    override fun deleteById(battleId: UUID) {
        // Delete battle entity first
        battleEntityRepository.deleteById(battleId)
        // EventEntity has ON DELETE CASCADE, so events will be deleted automatically
    }
}
