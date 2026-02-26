package de.thomcz.pap.battle.backend.application.service

import de.thomcz.pap.battle.backend.application.dto.CreateSessionCommand
import de.thomcz.pap.battle.backend.application.dto.RenameSessionCommand
import de.thomcz.pap.battle.backend.domain.model.Session
import de.thomcz.pap.battle.backend.domain.model.SessionStatus
import de.thomcz.pap.battle.backend.domain.port.out.BattleRepository
import de.thomcz.pap.battle.backend.domain.port.out.SessionRepository
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import java.util.UUID
import kotlin.test.assertEquals
import kotlin.test.assertNotNull

@ExtendWith(MockitoExtension::class)
class SessionServiceTest {

    @Mock
    private lateinit var sessionRepository: SessionRepository

    @Mock
    private lateinit var battleRepository: BattleRepository

    @InjectMocks
    private lateinit var sessionService: SessionService

    private val userName = "testuser"
    private val userUUID = UUID.nameUUIDFromBytes("pap-battle-tracker:$userName".toByteArray())

    // === Create Session ===

    @Test
    fun `should create session and save to repository`() {
        val command = CreateSessionCommand(name = "Friday Night Game")

        val result = sessionService.execute(command, userName)

        assertNotNull(result)
        assertEquals("Friday Night Game", result.name)
        assertEquals(SessionStatus.PLANNED, result.status)
        assertEquals(userUUID, result.userId)
        verify(sessionRepository).save(any())
    }

    // === List Sessions ===

    @Test
    fun `should list all non-deleted sessions for user`() {
        val session1 = Session.create(userId = userUUID, name = "Session 1")
        val session2 = Session.create(userId = userUUID, name = "Session 2")
        val deletedSession = Session.create(userId = userUUID, name = "Deleted")
        deletedSession.delete(userUUID)

        whenever(sessionRepository.findByUserId(userUUID))
            .thenReturn(listOf(session1, session2, deletedSession))

        val result = sessionService.execute(userName, status = null)

        assertEquals(2, result.size)
    }

    @Test
    fun `should list sessions filtered by status`() {
        val plannedSession = Session.create(userId = userUUID, name = "Planned")
        val startedSession = Session.create(userId = userUUID, name = "Started")
        startedSession.start(userUUID)

        whenever(sessionRepository.findByUserIdAndStatus(userUUID, SessionStatus.PLANNED))
            .thenReturn(listOf(plannedSession))

        val result = sessionService.execute(userName, status = SessionStatus.PLANNED)

        assertEquals(1, result.size)
        assertEquals("Planned", result[0].name)
    }

    @Test
    fun `should return empty list when user has no sessions`() {
        whenever(sessionRepository.findByUserId(userUUID)).thenReturn(emptyList())

        val result = sessionService.execute(userName, status = null)

        assertEquals(0, result.size)
    }

    // === Start Session ===

    @Test
    fun `should start session from planned state`() {
        val session = Session.create(userId = userUUID, name = "My Session")
        whenever(sessionRepository.findById(session.sessionId)).thenReturn(session)

        val result = sessionService.start(session.sessionId, userName)

        assertEquals(SessionStatus.STARTED, result.status)
        verify(sessionRepository).save(any())
    }

    @Test
    fun `should throw when starting session not owned by user`() {
        val otherUserUUID = UUID.randomUUID()
        val session = Session.create(userId = otherUserUUID, name = "Other Session")
        whenever(sessionRepository.findById(session.sessionId)).thenReturn(session)

        org.junit.jupiter.api.assertThrows<AccessDeniedException> {
            sessionService.start(session.sessionId, userName)
        }
    }

    @Test
    fun `should throw when starting non-existent session`() {
        val sessionId = UUID.randomUUID()
        whenever(sessionRepository.findById(sessionId)).thenReturn(null)

        org.junit.jupiter.api.assertThrows<EntityNotFoundException> {
            sessionService.start(sessionId, userName)
        }
    }

    @Test
    fun `should throw when starting already started session`() {
        val session = Session.create(userId = userUUID, name = "My Session")
        session.start(userUUID)
        whenever(sessionRepository.findById(session.sessionId)).thenReturn(session)

        org.junit.jupiter.api.assertThrows<IllegalStateException> {
            sessionService.start(session.sessionId, userName)
        }
    }

    // === Finish Session ===

    @Test
    fun `should finish session from started state`() {
        val session = Session.create(userId = userUUID, name = "My Session")
        session.start(userUUID)
        whenever(sessionRepository.findById(session.sessionId)).thenReturn(session)

        val result = sessionService.finish(session.sessionId, userName)

        assertEquals(SessionStatus.FINISHED, result.status)
        verify(sessionRepository).save(any())
    }

    @Test
    fun `should throw when finishing session not in started state`() {
        val session = Session.create(userId = userUUID, name = "My Session")
        whenever(sessionRepository.findById(session.sessionId)).thenReturn(session)

        org.junit.jupiter.api.assertThrows<IllegalStateException> {
            sessionService.finish(session.sessionId, userName)
        }
    }

    @Test
    fun `should throw when finishing session not owned by user`() {
        val otherUserUUID = UUID.randomUUID()
        val session = Session.create(userId = otherUserUUID, name = "Other Session")
        session.start(otherUserUUID)
        whenever(sessionRepository.findById(session.sessionId)).thenReturn(session)

        org.junit.jupiter.api.assertThrows<AccessDeniedException> {
            sessionService.finish(session.sessionId, userName)
        }
    }

    // === Rename Session ===

    @Test
    fun `should rename session successfully`() {
        val session = Session.create(userId = userUUID, name = "Old Name")
        val command = RenameSessionCommand(name = "New Name")
        whenever(sessionRepository.findById(session.sessionId)).thenReturn(session)

        val result = sessionService.execute(session.sessionId, command, userName)

        assertEquals("New Name", result.name)
        verify(sessionRepository).save(any())
    }

    @Test
    fun `should throw when renaming session not owned by user`() {
        val otherUserUUID = UUID.randomUUID()
        val session = Session.create(userId = otherUserUUID, name = "Other Session")
        val command = RenameSessionCommand(name = "New Name")
        whenever(sessionRepository.findById(session.sessionId)).thenReturn(session)

        org.junit.jupiter.api.assertThrows<AccessDeniedException> {
            sessionService.execute(session.sessionId, command, userName)
        }
    }

    @Test
    fun `should throw when renaming non-existent session`() {
        val sessionId = UUID.randomUUID()
        val command = RenameSessionCommand(name = "New Name")
        whenever(sessionRepository.findById(sessionId)).thenReturn(null)

        org.junit.jupiter.api.assertThrows<EntityNotFoundException> {
            sessionService.execute(sessionId, command, userName)
        }
    }

    // === Delete Session ===

    @Test
    fun `should delete session and associated battles`() {
        val session = Session.create(userId = userUUID, name = "My Session")
        whenever(sessionRepository.findById(session.sessionId)).thenReturn(session)
        whenever(battleRepository.findBySessionId(session.sessionId)).thenReturn(emptyList())

        sessionService.delete(session.sessionId, userName)

        verify(sessionRepository).deleteById(session.sessionId)
    }

    @Test
    fun `should throw when deleting session not owned by user`() {
        val otherUserUUID = UUID.randomUUID()
        val session = Session.create(userId = otherUserUUID, name = "Other Session")
        whenever(sessionRepository.findById(session.sessionId)).thenReturn(session)

        org.junit.jupiter.api.assertThrows<AccessDeniedException> {
            sessionService.delete(session.sessionId, userName)
        }
    }

    @Test
    fun `should throw when deleting non-existent session`() {
        val sessionId = UUID.randomUUID()
        whenever(sessionRepository.findById(sessionId)).thenReturn(null)

        org.junit.jupiter.api.assertThrows<EntityNotFoundException> {
            sessionService.delete(sessionId, userName)
        }
    }
}
