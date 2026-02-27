package de.thomcz.pap.battle.backend.domain.model.events

import java.time.Instant
import java.util.UUID

sealed interface SessionEvent {
    val sessionId: UUID
    val eventId: UUID
    val timestamp: Instant
    val userId: UUID
}
