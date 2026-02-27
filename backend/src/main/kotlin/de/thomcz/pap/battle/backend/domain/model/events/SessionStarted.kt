package de.thomcz.pap.battle.backend.domain.model.events

import java.time.Instant
import java.util.UUID

data class SessionStarted(
    override val sessionId: UUID,
    override val eventId: UUID,
    override val timestamp: Instant,
    override val userId: UUID
) : SessionEvent
