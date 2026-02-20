package de.thomcz.pap.battle.backend.application.service

import de.thomcz.pap.battle.backend.application.dto.CreatePlayerCommand
import de.thomcz.pap.battle.backend.application.dto.DeletePlayerCommand
import de.thomcz.pap.battle.backend.application.dto.UpdatePlayerCommand
import de.thomcz.pap.battle.backend.domain.model.Player
import de.thomcz.pap.battle.backend.domain.port.`in`.*
import de.thomcz.pap.battle.backend.domain.port.out.PlayerRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.nio.charset.StandardCharsets
import java.util.UUID

/**
 * Application service implementing all player-related use cases.
 *
 * Coordinates between domain layer (Player aggregate) and infrastructure (repositories).
 */
@Service
@Transactional
class PlayerService(
    private val playerRepository: PlayerRepository
) : CreatePlayerUseCase,
    GetPlayerUseCase,
    ListPlayersUseCase,
    UpdatePlayerUseCase,
    DeletePlayerUseCase {

    override fun execute(command: CreatePlayerCommand, userId: String): Player {
        val player = Player.create(
            userId = userNameToUUID(userId),
            name = command.name,
            characterClass = command.characterClass,
            level = command.level,
            maxHp = command.maxHp
        )

        playerRepository.save(player)
        return player
    }

    @Transactional(readOnly = true)
    override fun execute(playerId: UUID, userId: String): Player {
        val player = playerRepository.findById(playerId)
            ?: throw EntityNotFoundException("Player not found: $playerId")

        if (player.userId != userNameToUUID(userId)) {
            throw AccessDeniedException("User $userId does not own player $playerId")
        }

        return player
    }

    @Transactional(readOnly = true)
    override fun execute(userId: String, includeDeleted: Boolean): List<Player> {
        val players = playerRepository.findByUserId(userNameToUUID(userId))
        return if (includeDeleted) players else players.filter { !it.isDeleted }
    }

    override fun execute(playerId: UUID, command: UpdatePlayerCommand, userId: String): Player {
        val player = playerRepository.findById(playerId)
            ?: throw EntityNotFoundException("Player not found: $playerId")

        val userUUID = userNameToUUID(userId)
        if (player.userId != userUUID) {
            throw AccessDeniedException("User $userId does not own player $playerId")
        }

        player.update(
            userId = userUUID,
            name = command.name,
            characterClass = command.characterClass,
            level = command.level,
            maxHp = command.maxHp
        )

        playerRepository.save(player)
        return player
    }

    override fun execute(command: DeletePlayerCommand, userId: String) {
        val player = playerRepository.findById(command.playerId)
            ?: throw EntityNotFoundException("Player not found: ${command.playerId}")

        val userUUID = userNameToUUID(userId)
        if (player.userId != userUUID) {
            throw AccessDeniedException("User $userId does not own player ${command.playerId}")
        }

        player.delete(userUUID)
        playerRepository.save(player)
    }

    private fun userNameToUUID(userName: String): UUID {
        val namespacePrefix = "pap-battle-tracker"
        val combined = "$namespacePrefix:$userName"
        return UUID.nameUUIDFromBytes(combined.toByteArray(StandardCharsets.UTF_8))
    }
}
