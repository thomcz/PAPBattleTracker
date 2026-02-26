package de.thomcz.pap.battle.backend.application.service

import de.thomcz.pap.battle.backend.application.dto.CreateBattleCommand
import de.thomcz.pap.battle.backend.application.dto.CreateSessionCommand
import de.thomcz.pap.battle.backend.application.dto.RenameSessionCommand
import de.thomcz.pap.battle.backend.domain.model.Battle
import de.thomcz.pap.battle.backend.domain.model.Session
import de.thomcz.pap.battle.backend.domain.model.SessionStatus
import de.thomcz.pap.battle.backend.domain.port.`in`.CreateSessionUseCase
import de.thomcz.pap.battle.backend.domain.port.`in`.DeleteSessionUseCase
import de.thomcz.pap.battle.backend.domain.port.`in`.FinishSessionUseCase
import de.thomcz.pap.battle.backend.domain.port.`in`.GetSessionUseCase
import de.thomcz.pap.battle.backend.domain.port.`in`.ListSessionsUseCase
import de.thomcz.pap.battle.backend.domain.port.`in`.RenameSessionUseCase
import de.thomcz.pap.battle.backend.domain.port.`in`.StartSessionUseCase
import de.thomcz.pap.battle.backend.domain.port.out.BattleRepository
import de.thomcz.pap.battle.backend.domain.port.out.SessionRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.nio.charset.StandardCharsets
import java.util.UUID

@Service
@Transactional
class SessionService(
    private val sessionRepository: SessionRepository,
    private val battleRepository: BattleRepository
) : CreateSessionUseCase,
    GetSessionUseCase,
    ListSessionsUseCase,
    StartSessionUseCase,
    FinishSessionUseCase,
    RenameSessionUseCase,
    DeleteSessionUseCase {

    override fun execute(command: CreateSessionCommand, userId: String): Session {
        val session = Session.create(
            userId = userNameToUUID(userId),
            name = command.name
        )

        sessionRepository.save(session)
        return session
    }

    @Transactional(readOnly = true)
    override fun execute(sessionId: UUID, userId: String): Session {
        val session = sessionRepository.findById(sessionId)
            ?: throw EntityNotFoundException("Session not found: $sessionId")

        if (session.userId != userNameToUUID(userId)) {
            throw AccessDeniedException("User $userId does not own session $sessionId")
        }

        return session
    }

    @Transactional(readOnly = true)
    override fun execute(userId: String, status: SessionStatus?): List<Session> {
        val userUUID = userNameToUUID(userId)
        val sessions = if (status != null) {
            sessionRepository.findByUserIdAndStatus(userUUID, status)
        } else {
            sessionRepository.findByUserId(userUUID)
        }
        return sessions.filter { !it.isDeleted }
    }

    override fun start(sessionId: UUID, userId: String): Session {
        val session = sessionRepository.findById(sessionId)
            ?: throw EntityNotFoundException("Session not found: $sessionId")

        if (session.userId != userNameToUUID(userId)) {
            throw AccessDeniedException("User $userId does not own session $sessionId")
        }

        session.start(userNameToUUID(userId))
        sessionRepository.save(session)
        return session
    }

    override fun execute(sessionId: UUID, command: RenameSessionCommand, userId: String): Session {
        val session = sessionRepository.findById(sessionId)
            ?: throw EntityNotFoundException("Session not found: $sessionId")

        if (session.userId != userNameToUUID(userId)) {
            throw AccessDeniedException("User $userId does not own session $sessionId")
        }

        session.rename(userNameToUUID(userId), command.name)
        sessionRepository.save(session)
        return session
    }

    override fun delete(sessionId: UUID, userId: String) {
        val session = sessionRepository.findById(sessionId)
            ?: throw EntityNotFoundException("Session not found: $sessionId")

        if (session.userId != userNameToUUID(userId)) {
            throw AccessDeniedException("User $userId does not own session $sessionId")
        }

        val battles = battleRepository.findBySessionId(sessionId)
        battles.forEach { battle -> battleRepository.deleteById(battle.battleId) }

        sessionRepository.deleteById(sessionId)
    }

    override fun finish(sessionId: UUID, userId: String): Session {
        val session = sessionRepository.findById(sessionId)
            ?: throw EntityNotFoundException("Session not found: $sessionId")

        if (session.userId != userNameToUUID(userId)) {
            throw AccessDeniedException("User $userId does not own session $sessionId")
        }

        session.finish(userNameToUUID(userId))
        sessionRepository.save(session)
        return session
    }

    fun createBattleInSession(sessionId: UUID, name: String, userId: String): Battle {
        val session = sessionRepository.findById(sessionId)
            ?: throw EntityNotFoundException("Session not found: $sessionId")

        val userUUID = userNameToUUID(userId)
        if (session.userId != userUUID) {
            throw AccessDeniedException("User $userId does not own session $sessionId")
        }

        check(session.canAddBattle()) { "Cannot add battles to a finished session" }

        val battle = Battle.create(
            userId = userUUID,
            name = name,
            sessionId = sessionId
        )

        battleRepository.save(battle)
        return battle
    }

    fun getBattlesForSession(sessionId: UUID): List<Battle> {
        return battleRepository.findBySessionId(sessionId)
    }

    private fun userNameToUUID(userName: String): UUID {
        val namespacePrefix = "pap-battle-tracker"
        val combined = "$namespacePrefix:$userName"
        return UUID.nameUUIDFromBytes(combined.toByteArray(StandardCharsets.UTF_8))
    }
}
