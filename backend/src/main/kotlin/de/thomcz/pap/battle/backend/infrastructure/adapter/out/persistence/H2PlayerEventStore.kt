package de.thomcz.pap.battle.backend.infrastructure.adapter.out.persistence

import com.fasterxml.jackson.databind.ObjectMapper
import de.thomcz.pap.battle.backend.domain.model.events.PlayerEvent
import de.thomcz.pap.battle.backend.domain.port.out.PlayerEventStore
import de.thomcz.pap.battle.backend.infrastructure.adapter.out.persistence.entity.PlayerEventEntity
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

/**
 * H2 database implementation of PlayerEventStore port.
 *
 * Follows the same pattern as H2EventStore (for battles).
 */
@Component
class H2PlayerEventStore(
    private val playerEventEntityRepository: PlayerEventEntityRepository,
    private val objectMapper: ObjectMapper
) : PlayerEventStore {

    @Transactional
    override fun saveEvents(playerId: UUID, events: List<PlayerEvent>) {
        if (events.isEmpty()) return

        val currentMaxSequence = playerEventEntityRepository.getMaxSequenceNumber(playerId)
        var nextSequence = currentMaxSequence + 1

        val eventEntities = events.map { event ->
            PlayerEventEntity(
                eventId = event.eventId,
                playerId = playerId,
                eventType = event::class.simpleName
                    ?: throw IllegalStateException("Event class must have a name"),
                eventData = objectMapper.writeValueAsString(event),
                sequenceNumber = nextSequence++,
                timestamp = event.timestamp,
                userId = event.userId
            )
        }

        playerEventEntityRepository.saveAll(eventEntities)
    }

    @Transactional(readOnly = true)
    override fun getEvents(playerId: UUID, afterSequence: Int): List<PlayerEvent> {
        val entities = if (afterSequence > 0) {
            playerEventEntityRepository
                .findByPlayerIdAndSequenceNumberGreaterThanOrderBySequenceNumberAsc(playerId, afterSequence)
        } else {
            playerEventEntityRepository.findByPlayerIdOrderBySequenceNumberAsc(playerId)
        }

        return entities.map { entity ->
            deserializeEvent(
                entity.eventType ?: throw IllegalStateException("Event type cannot be null"),
                entity.eventData ?: throw IllegalStateException("Event data cannot be null")
            )
        }
    }

    @Transactional(readOnly = true)
    override fun getEventCount(playerId: UUID): Int {
        return playerEventEntityRepository.countByPlayerId(playerId)
    }

    private fun deserializeEvent(eventType: String, eventData: String): PlayerEvent {
        val packageName = PlayerEvent::class.java.packageName
        val className = "$packageName.$eventType"

        val eventClass = try {
            Class.forName(className)
        } catch (e: ClassNotFoundException) {
            throw IllegalStateException("Unknown player event type: $eventType", e)
        }

        return objectMapper.readValue(eventData, eventClass) as PlayerEvent
    }
}
