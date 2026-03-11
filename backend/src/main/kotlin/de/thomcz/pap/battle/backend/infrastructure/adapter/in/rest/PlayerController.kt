package de.thomcz.pap.battle.backend.infrastructure.adapter.`in`.rest

import de.thomcz.pap.battle.backend.application.dto.*
import de.thomcz.pap.battle.backend.domain.port.`in`.*
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*
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
