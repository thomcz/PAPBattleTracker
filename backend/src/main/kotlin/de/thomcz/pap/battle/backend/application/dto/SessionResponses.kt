package de.thomcz.pap.battle.backend.application.dto

import de.thomcz.pap.battle.backend.domain.model.Session
import de.thomcz.pap.battle.backend.domain.model.SessionStatus
import java.time.Instant

data class SessionResponse(
    val sessionId: String,
    val name: String,
    val status: SessionStatus,
    val createdAt: Instant,
    val lastModified: Instant
) {
    companion object {
        fun fromSession(session: Session): SessionResponse {
            return SessionResponse(
                sessionId = session.sessionId.toString(),
                name = session.name,
                status = session.status,
                createdAt = session.createdAt,
                lastModified = session.lastModified
            )
        }
    }
}

data class SessionSummaryResponse(
    val sessionId: String,
    val name: String,
    val status: SessionStatus,
    val battleCount: Int,
    val createdAt: Instant,
    val lastModified: Instant
) {
    companion object {
        fun fromSession(session: Session, battleCount: Int): SessionSummaryResponse {
            return SessionSummaryResponse(
                sessionId = session.sessionId.toString(),
                name = session.name,
                status = session.status,
                battleCount = battleCount,
                createdAt = session.createdAt,
                lastModified = session.lastModified
            )
        }
    }
}

data class SessionDetailResponse(
    val sessionId: String,
    val name: String,
    val status: SessionStatus,
    val battles: List<BattleResponse>,
    val createdAt: Instant,
    val lastModified: Instant
)
