package de.thomcz.pap.battle.backend.infrastructure.adapter.`in`.rest

import de.thomcz.pap.battle.backend.application.dto.*
import de.thomcz.pap.battle.backend.application.service.AccessDeniedException
import de.thomcz.pap.battle.backend.application.service.EntityNotFoundException
import de.thomcz.pap.battle.backend.domain.port.`in`.*
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*
import java.time.Instant
import java.util.UUID

/**
 * REST controller for player management endpoints.
 *
 * All endpoints require JWT authentication.
 * Players are scoped to the authenticated user.
 */
@RestController
@RequestMapping("/api/players")
class PlayerController(
    private val createPlayerUseCase: CreatePlayerUseCase,
    private val getPlayerUseCase: GetPlayerUseCase,
    private val listPlayersUseCase: ListPlayersUseCase,
    private val updatePlayerUseCase: UpdatePlayerUseCase,
    private val deletePlayerUseCase: DeletePlayerUseCase
) {

    @PostMapping
    fun createPlayer(
        @RequestBody request: CreatePlayerRequest,
        authentication: Authentication
    ): ResponseEntity<PlayerResponse> {
        val command = CreatePlayerCommand(
            name = request.name,
            characterClass = request.characterClass,
            level = request.level,
            maxHp = request.maxHp
        )

        val player = createPlayerUseCase.execute(command, authentication.name)
        return ResponseEntity.status(HttpStatus.CREATED).body(PlayerResponse.fromPlayer(player))
    }

    @GetMapping
    fun listPlayers(
        @RequestParam(defaultValue = "false") includeDeleted: Boolean,
        authentication: Authentication
    ): ResponseEntity<PlayerListResponse> {
        val players = listPlayersUseCase.execute(authentication.name, includeDeleted)
        val response = PlayerListResponse(
            players = players.map { PlayerResponse.fromPlayer(it) },
            total = players.size
        )
        return ResponseEntity.ok(response)
    }

    @GetMapping("/{playerId}")
    fun getPlayer(
        @PathVariable playerId: UUID,
        authentication: Authentication
    ): ResponseEntity<PlayerResponse> {
        val player = getPlayerUseCase.execute(playerId, authentication.name)
        return ResponseEntity.ok(PlayerResponse.fromPlayer(player))
    }

    @PutMapping("/{playerId}")
    fun updatePlayer(
        @PathVariable playerId: UUID,
        @RequestBody request: UpdatePlayerRequest,
        authentication: Authentication
    ): ResponseEntity<PlayerResponse> {
        val command = UpdatePlayerCommand(
            name = request.name,
            characterClass = request.characterClass,
            level = request.level,
            maxHp = request.maxHp
        )

        val player = updatePlayerUseCase.execute(playerId, command, authentication.name)
        return ResponseEntity.ok(PlayerResponse.fromPlayer(player))
    }

    @DeleteMapping("/{playerId}")
    fun deletePlayer(
        @PathVariable playerId: UUID,
        authentication: Authentication
    ): ResponseEntity<Void> {
        deletePlayerUseCase.execute(DeletePlayerCommand(playerId), authentication.name)
        return ResponseEntity.noContent().build()
    }

    // === Exception Handlers ===

    @ExceptionHandler(EntityNotFoundException::class)
    fun handleNotFound(e: EntityNotFoundException): ResponseEntity<ErrorResponse> {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(ErrorResponse(timestamp = Instant.now(), status = 404, error = "Not Found", message = e.message ?: "Resource not found"))
    }

    @ExceptionHandler(AccessDeniedException::class)
    fun handleForbidden(e: AccessDeniedException): ResponseEntity<ErrorResponse> {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body(ErrorResponse(timestamp = Instant.now(), status = 403, error = "Forbidden", message = e.message ?: "Access denied"))
    }

    @ExceptionHandler(IllegalArgumentException::class)
    fun handleBadRequest(e: IllegalArgumentException): ResponseEntity<ErrorResponse> {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(ErrorResponse(timestamp = Instant.now(), status = 400, error = "Bad Request", message = e.message ?: "Invalid request"))
    }

    @ExceptionHandler(IllegalStateException::class)
    fun handleConflict(e: IllegalStateException): ResponseEntity<ErrorResponse> {
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(ErrorResponse(timestamp = Instant.now(), status = 409, error = "Conflict", message = e.message ?: "State conflict"))
    }
}

data class CreatePlayerRequest(
    val name: String,
    val characterClass: String,
    val level: Int,
    val maxHp: Int
)

data class UpdatePlayerRequest(
    val name: String,
    val characterClass: String,
    val level: Int,
    val maxHp: Int
)
