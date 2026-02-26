package de.thomcz.pap.battle.backend.domain.model

import de.thomcz.pap.battle.backend.domain.model.events.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import java.util.UUID
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

class SessionTest {

    private val userId = UUID.randomUUID()

    // === Creation Tests ===

    @Test
    fun `should create session with valid name`() {
        val session = Session.create(userId, "Friday Night Campaign")

        assertEquals("Friday Night Campaign", session.name)
        assertEquals(SessionStatus.PLANNED, session.status)
        assertEquals(userId, session.userId)
        assertFalse(session.isDeleted)
        assertNotNull(session.sessionId)
        assertNotNull(session.createdAt)
    }

    @Test
    fun `should emit SessionCreated event on creation`() {
        val session = Session.create(userId, "Test Session")

        val events = session.getUncommittedEvents()
        assertEquals(1, events.size)
        assertTrue(events[0] is SessionCreated)

        val event = events[0] as SessionCreated
        assertEquals("Test Session", event.name)
        assertEquals(userId, event.userId)
    }

    @Test
    fun `should trim whitespace from session name`() {
        val session = Session.create(userId, "  Trimmed Name  ")
        assertEquals("Trimmed Name", session.name)
    }

    @Test
    fun `should reject blank session name`() {
        assertThrows<IllegalArgumentException> {
            Session.create(userId, "")
        }
        assertThrows<IllegalArgumentException> {
            Session.create(userId, "   ")
        }
    }

    @Test
    fun `should reject session name exceeding 100 characters`() {
        val longName = "a".repeat(101)
        assertThrows<IllegalArgumentException> {
            Session.create(userId, longName)
        }
    }

    @Test
    fun `should accept session name of exactly 100 characters`() {
        val name = "a".repeat(100)
        val session = Session.create(userId, name)
        assertEquals(name, session.name)
    }

    // === State Transition Tests ===

    @Test
    fun `should start session from PLANNED state`() {
        val session = Session.create(userId, "Test")
        session.start(userId)

        assertEquals(SessionStatus.STARTED, session.status)
    }

    @Test
    fun `should emit SessionStarted event`() {
        val session = Session.create(userId, "Test")
        session.start(userId)

        val events = session.getUncommittedEvents()
        assertEquals(2, events.size)
        assertTrue(events[1] is SessionStarted)
    }

    @Test
    fun `should finish session from STARTED state`() {
        val session = Session.create(userId, "Test")
        session.start(userId)
        session.finish(userId)

        assertEquals(SessionStatus.FINISHED, session.status)
    }

    @Test
    fun `should emit SessionFinished event`() {
        val session = Session.create(userId, "Test")
        session.start(userId)
        session.finish(userId)

        val events = session.getUncommittedEvents()
        assertEquals(3, events.size)
        assertTrue(events[2] is SessionFinished)
    }

    @Test
    fun `should reject starting a STARTED session`() {
        val session = Session.create(userId, "Test")
        session.start(userId)

        assertThrows<IllegalStateException> {
            session.start(userId)
        }
    }

    @Test
    fun `should reject starting a FINISHED session`() {
        val session = Session.create(userId, "Test")
        session.start(userId)
        session.finish(userId)

        assertThrows<IllegalStateException> {
            session.start(userId)
        }
    }

    @Test
    fun `should reject finishing a PLANNED session`() {
        val session = Session.create(userId, "Test")

        assertThrows<IllegalStateException> {
            session.finish(userId)
        }
    }

    @Test
    fun `should reject finishing an already FINISHED session`() {
        val session = Session.create(userId, "Test")
        session.start(userId)
        session.finish(userId)

        assertThrows<IllegalStateException> {
            session.finish(userId)
        }
    }

    // === Rename Tests ===

    @Test
    fun `should rename session`() {
        val session = Session.create(userId, "Old Name")
        session.rename(userId, "New Name")

        assertEquals("New Name", session.name)
    }

    @Test
    fun `should emit SessionRenamed event`() {
        val session = Session.create(userId, "Old Name")
        session.rename(userId, "New Name")

        val events = session.getUncommittedEvents()
        assertEquals(2, events.size)
        assertTrue(events[1] is SessionRenamed)
        assertEquals("New Name", (events[1] as SessionRenamed).name)
    }

    @Test
    fun `should reject renaming with blank name`() {
        val session = Session.create(userId, "Test")

        assertThrows<IllegalArgumentException> {
            session.rename(userId, "")
        }
    }

    @Test
    fun `should reject renaming deleted session`() {
        val session = Session.create(userId, "Test")
        session.delete(userId)

        assertThrows<IllegalStateException> {
            session.rename(userId, "New Name")
        }
    }

    // === Delete Tests ===

    @Test
    fun `should delete session`() {
        val session = Session.create(userId, "Test")
        session.delete(userId)

        assertTrue(session.isDeleted)
    }

    @Test
    fun `should emit SessionDeleted event`() {
        val session = Session.create(userId, "Test")
        session.delete(userId)

        val events = session.getUncommittedEvents()
        assertEquals(2, events.size)
        assertTrue(events[1] is SessionDeleted)
    }

    @Test
    fun `should reject deleting already deleted session`() {
        val session = Session.create(userId, "Test")
        session.delete(userId)

        assertThrows<IllegalStateException> {
            session.delete(userId)
        }
    }

    // === canAddBattle Tests ===

    @Test
    fun `should allow adding battle to PLANNED session`() {
        val session = Session.create(userId, "Test")
        assertTrue(session.canAddBattle())
    }

    @Test
    fun `should allow adding battle to STARTED session`() {
        val session = Session.create(userId, "Test")
        session.start(userId)
        assertTrue(session.canAddBattle())
    }

    @Test
    fun `should not allow adding battle to FINISHED session`() {
        val session = Session.create(userId, "Test")
        session.start(userId)
        session.finish(userId)
        assertFalse(session.canAddBattle())
    }

    @Test
    fun `should not allow adding battle to deleted session`() {
        val session = Session.create(userId, "Test")
        session.delete(userId)
        assertFalse(session.canAddBattle())
    }

    // === Event Sourcing Tests ===

    @Test
    fun `should rebuild state from event history`() {
        val session = Session.create(userId, "Original")
        session.start(userId)
        session.rename(userId, "Renamed")

        val events = session.getUncommittedEvents()

        val rebuilt = Session.newInstance().loadFromHistory(events)

        assertEquals(session.sessionId, rebuilt.sessionId)
        assertEquals("Renamed", rebuilt.name)
        assertEquals(SessionStatus.STARTED, rebuilt.status)
        assertEquals(userId, rebuilt.userId)
        assertFalse(rebuilt.isDeleted)
    }

    @Test
    fun `should rebuild deleted state from history`() {
        val session = Session.create(userId, "Test")
        session.delete(userId)

        val events = session.getUncommittedEvents()
        val rebuilt = Session.newInstance().loadFromHistory(events)

        assertTrue(rebuilt.isDeleted)
    }

    @Test
    fun `should have no uncommitted events after loadFromHistory`() {
        val session = Session.create(userId, "Test")
        val events = session.getUncommittedEvents()

        val rebuilt = Session.newInstance().loadFromHistory(events)
        assertTrue(rebuilt.getUncommittedEvents().isEmpty())
    }

    @Test
    fun `should clear uncommitted events after markEventsAsCommitted`() {
        val session = Session.create(userId, "Test")
        assertEquals(1, session.getUncommittedEvents().size)

        session.markEventsAsCommitted()
        assertTrue(session.getUncommittedEvents().isEmpty())
    }
}
