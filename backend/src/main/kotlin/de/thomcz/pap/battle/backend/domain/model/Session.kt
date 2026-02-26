package de.thomcz.pap.battle.backend.domain.model

import de.thomcz.pap.battle.backend.domain.model.events.*
import java.time.Instant
import java.util.UUID

class Session private constructor() {
    // === Aggregate Identity ===
    var sessionId: UUID = UUID.randomUUID()
        private set
    var userId: UUID = UUID.randomUUID()
        private set

    // === Derived State ===
    var name: String = ""
        private set
    var status: SessionStatus = SessionStatus.PLANNED
        private set
    var isDeleted: Boolean = false
        private set
    var createdAt: Instant = Instant.now()
        private set
    var lastModified: Instant = Instant.now()
        private set

    // === Event Sourcing Infrastructure ===
    private val uncommittedEvents: MutableList<SessionEvent> = mutableListOf()

    fun getUncommittedEvents(): List<SessionEvent> = uncommittedEvents.toList()

    fun markEventsAsCommitted() {
        uncommittedEvents.clear()
    }

    fun loadFromHistory(events: List<SessionEvent>): Session {
        events.forEach { event ->
            applyEvent(event, isReplay = true)
        }
        return this
    }

    // === Factory Methods ===

    companion object {
        fun newInstance(): Session = Session()

        fun create(userId: UUID, name: String): Session {
            require(name.isNotBlank()) { "Session name cannot be blank" }
            require(name.length <= 100) { "Session name cannot exceed 100 characters" }

            val session = Session()
            val event = SessionCreated(
                sessionId = UUID.randomUUID(),
                eventId = UUID.randomUUID(),
                timestamp = Instant.now(),
                userId = userId,
                name = name.trim()
            )

            session.applyEvent(event)
            return session
        }
    }

    // === Business Logic Methods ===

    fun start(userId: UUID): Session {
        check(!isDeleted) { "Cannot start a deleted session" }
        check(status == SessionStatus.PLANNED) { "Session can only be started from PLANNED state, current state: $status" }

        val event = SessionStarted(
            sessionId = sessionId,
            eventId = UUID.randomUUID(),
            timestamp = Instant.now(),
            userId = userId
        )

        applyEvent(event)
        return this
    }

    fun finish(userId: UUID): Session {
        check(!isDeleted) { "Cannot finish a deleted session" }
        check(status == SessionStatus.STARTED) { "Session can only be finished from STARTED state, current state: $status" }

        val event = SessionFinished(
            sessionId = sessionId,
            eventId = UUID.randomUUID(),
            timestamp = Instant.now(),
            userId = userId
        )

        applyEvent(event)
        return this
    }

    fun rename(userId: UUID, name: String): Session {
        check(!isDeleted) { "Cannot rename a deleted session" }
        require(name.isNotBlank()) { "Session name cannot be blank" }
        require(name.length <= 100) { "Session name cannot exceed 100 characters" }

        val event = SessionRenamed(
            sessionId = sessionId,
            eventId = UUID.randomUUID(),
            timestamp = Instant.now(),
            userId = userId,
            name = name.trim()
        )

        applyEvent(event)
        return this
    }

    fun delete(userId: UUID): Session {
        check(!isDeleted) { "Session is already deleted" }

        val event = SessionDeleted(
            sessionId = sessionId,
            eventId = UUID.randomUUID(),
            timestamp = Instant.now(),
            userId = userId
        )

        applyEvent(event)
        return this
    }

    fun canAddBattle(): Boolean = !isDeleted && status != SessionStatus.FINISHED

    // === Event Application Logic ===

    private fun applyEvent(event: SessionEvent, isReplay: Boolean = false) {
        when (event) {
            is SessionCreated -> {
                sessionId = event.sessionId
                userId = event.userId
                name = event.name
                status = SessionStatus.PLANNED
                isDeleted = false
                createdAt = event.timestamp
            }

            is SessionStarted -> {
                status = SessionStatus.STARTED
            }

            is SessionFinished -> {
                status = SessionStatus.FINISHED
            }

            is SessionRenamed -> {
                name = event.name
            }

            is SessionDeleted -> {
                isDeleted = true
            }
        }

        lastModified = event.timestamp

        if (!isReplay) {
            uncommittedEvents.add(event)
        }
    }
}
