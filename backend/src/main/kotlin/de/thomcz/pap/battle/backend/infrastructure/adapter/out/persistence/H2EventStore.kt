package de.thomcz.pap.battle.backend.infrastructure.adapter.out.persistence

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import de.thomcz.pap.battle.backend.domain.model.events.BattleEvent
import de.thomcz.pap.battle.backend.domain.port.out.EventStore
import de.thomcz.pap.battle.backend.infrastructure.adapter.out.persistence.entity.EventEntity
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

/**
 * H2 database implementation of EventStore port.
 *
 * Serializes domain events to JSON and stores them in the events table.
 * Deserializes events when reconstructing aggregate state.
 *
 * Key responsibilities:
 * - JSON serialization/deserialization of events
 * - Sequence number assignment
 * - Event ordering guarantees
 */
@Component
class H2EventStore(
    private val eventEntityRepository: EventEntityRepository,
    private val objectMapper: ObjectMapper
) : EventStore {

    @Transactional
    override fun saveEvents(battleId: UUID, events: List<BattleEvent>) {
        if (events.isEmpty()) return

        // Acquire pessimistic write lock to serialize concurrent sequence number assignment
        val latestEvent = eventEntityRepository.findTopByBattleIdOrderBySequenceNumberDesc(battleId)
        val currentMaxSequence = latestEvent?.sequenceNumber ?: 0
        var nextSequence = currentMaxSequence + 1

        // Convert domain events to JPA entities with sequence numbers
        val eventEntities = events.map { event ->
            EventEntity(
                eventId = event.eventId,
                battleId = battleId,
                eventType = event::class.simpleName ?: throw IllegalStateException("Event class must have a name"),
                eventData = objectMapper.writeValueAsString(event),
                sequenceNumber = nextSequence++,
                timestamp = event.timestamp,
                userId = event.userId
            )
        }

        eventEntityRepository.saveAll(eventEntities)
    }

    @Transactional(readOnly = true)
    override fun getEvents(battleId: UUID, afterSequence: Int): List<BattleEvent> {
        val entities = if (afterSequence > 0) {
            eventEntityRepository.findByBattleIdAndSequenceNumberGreaterThanOrderBySequenceNumberAsc(
                battleId,
                afterSequence
            )
        } else {
            eventEntityRepository.findByBattleIdOrderBySequenceNumberAsc(battleId)
        }

        return entities.map { entity ->
            deserializeEvent(
                entity.eventType ?: throw IllegalStateException("Event type cannot be null"),
                entity.eventData ?: throw IllegalStateException("Event data cannot be null")
            )
        }
    }

    @Transactional(readOnly = true)
    override fun getEventCount(battleId: UUID): Int {
        return eventEntityRepository.countByBattleId(battleId)
    }

    /**
     * Deserialize JSON event data back to domain event object.
     *
     * Uses reflection to find the event class by name and Jackson to deserialize.
     * This assumes all event types are in the same package as BattleEvent.
     */
    private fun deserializeEvent(eventType: String, eventData: String): BattleEvent {
        val packageName = BattleEvent::class.java.packageName
        val className = "$packageName.$eventType"

        val eventClass = try {
            Class.forName(className)
        } catch (e: ClassNotFoundException) {
            throw IllegalStateException("Unknown event type: $eventType", e)
        }

        return objectMapper.readValue(eventData, eventClass) as BattleEvent
    }
}
