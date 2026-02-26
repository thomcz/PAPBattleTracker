package de.thomcz.pap.battle.backend.infrastructure.adapter.out.persistence

import de.thomcz.pap.battle.backend.domain.model.Session
import de.thomcz.pap.battle.backend.domain.model.SessionStatus
import de.thomcz.pap.battle.backend.domain.port.out.SessionEventStore
import de.thomcz.pap.battle.backend.domain.port.out.SessionRepository
import de.thomcz.pap.battle.backend.infrastructure.adapter.out.persistence.mapper.SessionMapper
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Component
class JpaSessionRepository(
    private val sessionEntityRepository: SessionEntityRepository,
    private val sessionEventStore: SessionEventStore
) : SessionRepository {

    @Transactional(readOnly = true)
    override fun findById(sessionId: UUID): Session? {
        val entity = sessionEntityRepository.findById(sessionId).orElse(null) ?: return null

        val events = sessionEventStore.getEvents(sessionId)
        return if (events.isNotEmpty()) {
            Session.newInstance().loadFromHistory(events)
        } else {
            null
        }
    }

    @Transactional(readOnly = true)
    override fun findByUserId(userId: UUID): List<Session> {
        val entities = sessionEntityRepository.findByUserId(userId)

        return entities.mapNotNull { entity ->
            entity.sessionId?.let { findById(it) }
        }
    }

    @Transactional(readOnly = true)
    override fun findByUserIdAndStatus(userId: UUID, status: SessionStatus): List<Session> {
        val entities = sessionEntityRepository.findByUserIdAndStatus(userId, status.name)

        return entities.mapNotNull { entity ->
            entity.sessionId?.let { findById(it) }
        }
    }

    @Transactional
    override fun save(session: Session) {
        val uncommittedEvents = session.getUncommittedEvents()
        if (uncommittedEvents.isNotEmpty()) {
            sessionEventStore.saveEvents(session.sessionId, uncommittedEvents)
            session.markEventsAsCommitted()
        }

        val eventCount = sessionEventStore.getEventCount(session.sessionId)
        val entity = SessionMapper.toEntity(session, eventCount)
        sessionEntityRepository.save(entity)
    }

    @Transactional
    override fun deleteById(sessionId: UUID) {
        sessionEventStore.deleteEvents(sessionId)
        sessionEntityRepository.deleteById(sessionId)
    }
}
