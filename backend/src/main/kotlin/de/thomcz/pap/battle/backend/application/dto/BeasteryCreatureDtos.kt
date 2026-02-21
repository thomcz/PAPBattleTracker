package de.thomcz.pap.battle.backend.application.dto

import de.thomcz.pap.battle.backend.domain.model.BeasteryCreature
import java.time.Instant
import java.util.UUID

// === Commands ===

data class CreateBeasteryCreatureCommand(
    val name: String,
    val hitPoints: Int,
    val armorClass: Int
)

data class UpdateBeasteryCreatureCommand(
    val name: String,
    val hitPoints: Int,
    val armorClass: Int
)

data class DeleteBeasteryCreatureCommand(
    val creatureId: UUID
)

// === Responses ===

data class BeasteryCreatureResponse(
    val creatureId: String,
    val name: String,
    val hitPoints: Int,
    val armorClass: Int,
    val isDeleted: Boolean,
    val createdAt: Instant,
    val lastModified: Instant
) {
    companion object {
        fun fromCreature(creature: BeasteryCreature): BeasteryCreatureResponse {
            return BeasteryCreatureResponse(
                creatureId = creature.creatureId.toString(),
                name = creature.name,
                hitPoints = creature.hitPoints,
                armorClass = creature.armorClass,
                isDeleted = creature.isDeleted,
                createdAt = creature.createdAt,
                lastModified = creature.lastModified
            )
        }
    }
}

data class BeasteryCreatureListResponse(
    val creatures: List<BeasteryCreatureResponse>,
    val total: Int
)
