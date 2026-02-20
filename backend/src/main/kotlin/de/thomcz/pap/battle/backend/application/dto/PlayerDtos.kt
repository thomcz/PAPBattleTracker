package de.thomcz.pap.battle.backend.application.dto

import de.thomcz.pap.battle.backend.domain.model.Player
import java.time.Instant
import java.util.UUID

// === Commands ===

data class CreatePlayerCommand(
    val name: String,
    val characterClass: String,
    val level: Int,
    val maxHp: Int
)

data class UpdatePlayerCommand(
    val name: String,
    val characterClass: String,
    val level: Int,
    val maxHp: Int
)

data class DeletePlayerCommand(
    val playerId: UUID
)

// === Responses ===

data class PlayerResponse(
    val playerId: String,
    val name: String,
    val characterClass: String,
    val level: Int,
    val maxHp: Int,
    val isDeleted: Boolean,
    val createdAt: Instant,
    val lastModified: Instant
) {
    companion object {
        fun fromPlayer(player: Player): PlayerResponse {
            return PlayerResponse(
                playerId = player.playerId.toString(),
                name = player.name,
                characterClass = player.characterClass,
                level = player.level,
                maxHp = player.maxHp,
                isDeleted = player.isDeleted,
                createdAt = player.createdAt,
                lastModified = player.lastModified
            )
        }
    }
}

data class PlayerListResponse(
    val players: List<PlayerResponse>,
    val total: Int
)
