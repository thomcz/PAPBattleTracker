package de.thomcz.pap.battle.backend.domain.port.out

import de.thomcz.pap.battle.backend.domain.model.Session
import de.thomcz.pap.battle.backend.domain.model.SessionStatus
import java.util.UUID

interface SessionRepository {
    fun findById(sessionId: UUID): Session?
    fun findByUserId(userId: UUID): List<Session>
    fun findByUserIdAndStatus(userId: UUID, status: SessionStatus): List<Session>
    fun save(session: Session)
    fun deleteById(sessionId: UUID)
}
