package de.thomcz.pap.battle.backend.infrastructure.adapter.out.persistence

import com.fasterxml.jackson.databind.ObjectMapper
import de.thomcz.pap.battle.backend.domain.model.events.SessionEvent
import de.thomcz.pap.battle.backend.domain.port.out.SessionEventStore
import de.thomcz.pap.battle.backend.infrastructure.adapter.out.persistence.entity.SessionEventEntity
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Component
class H2SessionEventStore(
    private val sessionEventEntityRepository: SessionEventEntityRepository,
    private val objectMapper: ObjectMapper
) : SessionEventStore {

    @Transactional
    override fun saveEvents(sessionId: UUID, events: List<SessionEvent>) {
        if (events.isEmpty()) return

        val currentMaxSequence = sessionEventEntityRepository.getMaxSequenceNumber(sessionId)
        var nextSequence = currentMaxSequence + 1

        val eventEntities = events.map { event ->
            SessionEventEntity(
                eventId = event.eventId,
                sessionId = sessionId,
                eventType = event::class.simpleName
                    ?: throw IllegalStateException("Event class must have a name"),
                eventData = objectMapper.writeValueAsString(event),
                sequenceNumber = nextSequence++,
                timestamp = event.timestamp,
                userId = event.userId
            )
        }

        sessionEventEntityRepository.saveAll(eventEntities)
    }

    @Transactional(readOnly = true)
    override fun getEvents(sessionId: UUID, afterSequence: Int): List<SessionEvent> {
        val entities = if (afterSequence > 0) {
            sessionEventEntityRepository
                .findBySessionIdAndSequenceNumberGreaterThanOrderBySequenceNumberAsc(sessionId, afterSequence)
        } else {
            sessionEventEntityRepository.findBySessionIdOrderBySequenceNumberAsc(sessionId)
        }

        return entities.map { entity ->
            deserializeEvent(
                entity.eventType ?: throw IllegalStateException("Event type cannot be null"),
                entity.eventData ?: throw IllegalStateException("Event data cannot be null")
            )
        }
    }

    @Transactional(readOnly = true)
    override fun getEventCount(sessionId: UUID): Int {
        return sessionEventEntityRepository.countBySessionId(sessionId)
    }

    @Transactional
    override fun deleteEvents(sessionId: UUID) {
        sessionEventEntityRepository.deleteBySessionId(sessionId)
    }

    private fun deserializeEvent(eventType: String, eventData: String): SessionEvent {
        val packageName = SessionEvent::class.java.packageName
        val className = "$packageName.$eventType"

        val eventClass = try {
            Class.forName(className)
        } catch (e: ClassNotFoundException) {
            throw IllegalStateException("Unknown session event type: $eventType", e)
        }

        return objectMapper.readValue(eventData, eventClass) as SessionEvent
    }
}
