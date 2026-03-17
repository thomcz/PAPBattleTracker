package de.thomcz.pap.battle.backend.infrastructure.adapter.`in`.rest

import de.thomcz.pap.battle.backend.application.dto.*
import de.thomcz.pap.battle.backend.application.service.SessionService
import de.thomcz.pap.battle.backend.domain.model.SessionStatus
import de.thomcz.pap.battle.backend.application.dto.RenameSessionCommand
import de.thomcz.pap.battle.backend.domain.port.`in`.CreateSessionUseCase
import de.thomcz.pap.battle.backend.domain.port.`in`.DeleteSessionUseCase
import de.thomcz.pap.battle.backend.domain.port.`in`.FinishSessionUseCase
import de.thomcz.pap.battle.backend.domain.port.`in`.GetSessionUseCase
import de.thomcz.pap.battle.backend.domain.port.`in`.ListSessionsUseCase
import de.thomcz.pap.battle.backend.domain.port.`in`.RenameSessionUseCase
import de.thomcz.pap.battle.backend.domain.port.`in`.StartSessionUseCase
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/sessions")
class SessionController(
    private val createSessionUseCase: CreateSessionUseCase,
    private val getSessionUseCase: GetSessionUseCase,
    private val listSessionsUseCase: ListSessionsUseCase,
    private val startSessionUseCase: StartSessionUseCase,
    private val finishSessionUseCase: FinishSessionUseCase,
    private val renameSessionUseCase: RenameSessionUseCase,
    private val deleteSessionUseCase: DeleteSessionUseCase,
    private val sessionService: SessionService
) {

    @PostMapping
    fun createSession(
        @RequestBody request: CreateSessionRequest,
        authentication: Authentication
    ): ResponseEntity<SessionResponse> {
        val command = CreateSessionCommand(name = request.name)
        val session = createSessionUseCase.execute(command, authentication.name)
        return ResponseEntity.status(HttpStatus.CREATED).body(SessionResponse.fromSession(session))
    }

    @GetMapping
    fun listSessions(
        @RequestParam(required = false) status: SessionStatus?,
        authentication: Authentication
    ): ResponseEntity<List<SessionSummaryResponse>> {
        val sessions = listSessionsUseCase.execute(authentication.name, status)
        val response = sessions.map { session ->
            val battleCount = sessionService.getBattlesForSession(session.sessionId).size
            SessionSummaryResponse.fromSession(session, battleCount)
        }
        return ResponseEntity.ok(response)
    }

    @GetMapping("/{sessionId}")
    fun getSession(
        @PathVariable sessionId: UUID,
        authentication: Authentication
    ): ResponseEntity<SessionDetailResponse> {
        val session = getSessionUseCase.execute(sessionId, authentication.name)
        val battles = sessionService.getBattlesForSession(sessionId)
        val battleResponses = battles.map { BattleResponse.from(it) }
        return ResponseEntity.ok(
            SessionDetailResponse(
                sessionId = session.sessionId.toString(),
                name = session.name,
                status = session.status,
                battles = battleResponses,
                createdAt = session.createdAt,
                lastModified = session.lastModified
            )
        )
    }

    @PostMapping("/{sessionId}/start")
    fun startSession(
        @PathVariable sessionId: UUID,
        authentication: Authentication
    ): ResponseEntity<SessionResponse> {
        val session = startSessionUseCase.start(sessionId, authentication.name)
        return ResponseEntity.ok(SessionResponse.fromSession(session))
    }

    @PostMapping("/{sessionId}/finish")
    fun finishSession(
        @PathVariable sessionId: UUID,
        authentication: Authentication
    ): ResponseEntity<SessionResponse> {
        val session = finishSessionUseCase.finish(sessionId, authentication.name)
        return ResponseEntity.ok(SessionResponse.fromSession(session))
    }

    @PutMapping("/{sessionId}")
    fun renameSession(
        @PathVariable sessionId: UUID,
        @RequestBody request: RenameSessionRequest,
        authentication: Authentication
    ): ResponseEntity<SessionResponse> {
        val command = RenameSessionCommand(name = request.name)
        val session = renameSessionUseCase.execute(sessionId, command, authentication.name)
        return ResponseEntity.ok(SessionResponse.fromSession(session))
    }

    @DeleteMapping("/{sessionId}")
    fun deleteSession(
        @PathVariable sessionId: UUID,
        authentication: Authentication
    ): ResponseEntity<Void> {
        deleteSessionUseCase.delete(sessionId, authentication.name)
        return ResponseEntity.noContent().build()
    }

    @PostMapping("/{sessionId}/battles")
    fun createBattleInSession(
        @PathVariable sessionId: UUID,
        @RequestBody request: CreateBattleInSessionRequest,
        authentication: Authentication
    ): ResponseEntity<BattleResponse> {
        val battle = sessionService.createBattleInSession(sessionId, request.name, authentication.name)
        return ResponseEntity.status(HttpStatus.CREATED).body(BattleResponse.from(battle))
    }

}

data class CreateSessionRequest(
    val name: String
)

data class CreateBattleInSessionRequest(
    val name: String
)

data class RenameSessionRequest(
    val name: String
)
