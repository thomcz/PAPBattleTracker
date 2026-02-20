package de.thomcz.pap.battle.backend.infrastructure.adapter.out.persistence

import de.thomcz.pap.battle.backend.domain.model.Player
import de.thomcz.pap.battle.backend.domain.port.out.PlayerEventStore
import de.thomcz.pap.battle.backend.domain.port.out.PlayerRepository
import de.thomcz.pap.battle.backend.infrastructure.adapter.out.persistence.mapper.PlayerMapper
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

/**
 * JPA implementation of PlayerRepository port.
 *
 * Coordinates between player metadata (PlayerEntity) and event sourcing (PlayerEventStore).
 */
@Component
class JpaPlayerRepository(
    private val playerEntityRepository: PlayerEntityRepository,
    private val playerEventStore: PlayerEventStore
) : PlayerRepository {

    @Transactional(readOnly = true)
    override fun findById(playerId: UUID): Player? {
        val entity = playerEntityRepository.findById(playerId).orElse(null) ?: return null

        val events = playerEventStore.getEvents(playerId)
        return if (events.isNotEmpty()) {
            Player.newInstance().loadFromHistory(events)
        } else {
            null
        }
    }

    @Transactional(readOnly = true)
    override fun findByUserId(userId: UUID): List<Player> {
        val entities = playerEntityRepository.findByUserId(userId)

        return entities.mapNotNull { entity ->
            entity.playerId?.let { findById(it) }
        }
    }

    @Transactional
    override fun save(player: Player) {
        val uncommittedEvents = player.getUncommittedEvents()
        if (uncommittedEvents.isNotEmpty()) {
            playerEventStore.saveEvents(player.playerId, uncommittedEvents)
            player.markEventsAsCommitted()
        }

        val eventCount = playerEventStore.getEventCount(player.playerId)
        val entity = PlayerMapper.toEntity(player, eventCount)
        playerEntityRepository.save(entity)
    }

    @Transactional
    override fun deleteById(playerId: UUID) {
        playerEntityRepository.deleteById(playerId)
    }
}
