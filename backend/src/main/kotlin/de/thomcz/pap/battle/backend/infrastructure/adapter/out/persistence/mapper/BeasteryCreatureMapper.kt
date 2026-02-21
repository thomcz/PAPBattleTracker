package de.thomcz.pap.battle.backend.infrastructure.adapter.out.persistence.mapper

import de.thomcz.pap.battle.backend.domain.model.BeasteryCreature
import de.thomcz.pap.battle.backend.infrastructure.adapter.out.persistence.entity.BeasteryCreatureEntity

object BeasteryCreatureMapper {

    fun toEntity(creature: BeasteryCreature, eventCount: Int): BeasteryCreatureEntity {
        return BeasteryCreatureEntity(
            creatureId = creature.creatureId,
            userId = creature.userId,
            name = creature.name,
            hitPoints = creature.hitPoints,
            armorClass = creature.armorClass,
            isDeleted = creature.isDeleted,
            createdAt = creature.createdAt,
            lastModified = creature.lastModified,
            eventCount = eventCount
        )
    }
}
