package de.thomcz.pap.battle.backend.infrastructure.adapter.out.persistence.mapper

import de.thomcz.pap.battle.backend.domain.model.Player
import de.thomcz.pap.battle.backend.infrastructure.adapter.out.persistence.entity.PlayerEntity

/**
 * Maps between Player domain aggregate and PlayerEntity JPA entity.
 */
object PlayerMapper {

    fun toEntity(player: Player, eventCount: Int): PlayerEntity {
        return PlayerEntity(
            playerId = player.playerId,
            userId = player.userId,
            name = player.name,
            characterClass = player.characterClass,
            level = player.level,
            maxHp = player.maxHp,
            isDeleted = player.isDeleted,
            createdAt = player.createdAt,
            lastModified = player.lastModified,
            eventCount = eventCount
        )
    }
}
