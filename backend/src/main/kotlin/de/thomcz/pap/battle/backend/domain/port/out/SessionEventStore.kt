package de.thomcz.pap.battle.backend.domain.port.out

import de.thomcz.pap.battle.backend.domain.model.events.SessionEvent
import java.util.UUID

interface SessionEventStore {
    fun saveEvents(sessionId: UUID, events: List<SessionEvent>)
    fun getEvents(sessionId: UUID, afterSequence: Int = 0): List<SessionEvent>
    fun getEventCount(sessionId: UUID): Int
    fun deleteEvents(sessionId: UUID)
}
