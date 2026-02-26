package de.thomcz.pap.battle.backend.infrastructure.adapter.out.persistence.mapper

import de.thomcz.pap.battle.backend.domain.model.Session
import de.thomcz.pap.battle.backend.infrastructure.adapter.out.persistence.entity.SessionEntity

object SessionMapper {

    fun toEntity(session: Session, eventCount: Int): SessionEntity {
        return SessionEntity(
            sessionId = session.sessionId,
            userId = session.userId,
            name = session.name,
            status = session.status.name,
            createdAt = session.createdAt,
            lastModified = session.lastModified,
            eventCount = eventCount
        )
    }
}
