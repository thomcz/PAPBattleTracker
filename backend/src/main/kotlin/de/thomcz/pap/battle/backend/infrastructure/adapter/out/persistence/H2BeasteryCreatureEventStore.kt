package de.thomcz.pap.battle.backend.infrastructure.adapter.out.persistence

import com.fasterxml.jackson.databind.ObjectMapper
import de.thomcz.pap.battle.backend.domain.model.events.BeasteryCreatureEvent
import de.thomcz.pap.battle.backend.domain.port.out.BeasteryCreatureEventStore
import de.thomcz.pap.battle.backend.infrastructure.adapter.out.persistence.entity.BeasteryCreatureEventEntity
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Component
class H2BeasteryCreatureEventStore(
    private val beasteryCreatureEventEntityRepository: BeasteryCreatureEventEntityRepository,
    private val objectMapper: ObjectMapper
) : BeasteryCreatureEventStore {

    @Transactional
    override fun saveEvents(creatureId: UUID, events: List<BeasteryCreatureEvent>) {
        if (events.isEmpty()) return

        val currentMaxSequence = beasteryCreatureEventEntityRepository.getMaxSequenceNumber(creatureId)
        var nextSequence = currentMaxSequence + 1

        val eventEntities = events.map { event ->
            BeasteryCreatureEventEntity(
                eventId = event.eventId,
                creatureId = creatureId,
                eventType = event::class.simpleName
                    ?: throw IllegalStateException("Event class must have a name"),
                eventData = objectMapper.writeValueAsString(event),
                sequenceNumber = nextSequence++,
                timestamp = event.timestamp,
                userId = event.userId
            )
        }

        beasteryCreatureEventEntityRepository.saveAll(eventEntities)
    }

    @Transactional(readOnly = true)
    override fun getEvents(creatureId: UUID, afterSequence: Int): List<BeasteryCreatureEvent> {
        val entities = if (afterSequence > 0) {
            beasteryCreatureEventEntityRepository
                .findByCreatureIdAndSequenceNumberGreaterThanOrderBySequenceNumberAsc(creatureId, afterSequence)
        } else {
            beasteryCreatureEventEntityRepository.findByCreatureIdOrderBySequenceNumberAsc(creatureId)
        }

        return entities.map { entity ->
            deserializeEvent(
                entity.eventType ?: throw IllegalStateException("Event type cannot be null"),
                entity.eventData ?: throw IllegalStateException("Event data cannot be null")
            )
        }
    }

    @Transactional(readOnly = true)
    override fun getEventCount(creatureId: UUID): Int {
        return beasteryCreatureEventEntityRepository.countByCreatureId(creatureId)
    }

    private fun deserializeEvent(eventType: String, eventData: String): BeasteryCreatureEvent {
        val packageName = BeasteryCreatureEvent::class.java.packageName
        val className = "$packageName.$eventType"

        val eventClass = try {
            Class.forName(className)
        } catch (e: ClassNotFoundException) {
            throw IllegalStateException("Unknown beastery creature event type: $eventType", e)
        }

        return objectMapper.readValue(eventData, eventClass) as BeasteryCreatureEvent
    }
}
