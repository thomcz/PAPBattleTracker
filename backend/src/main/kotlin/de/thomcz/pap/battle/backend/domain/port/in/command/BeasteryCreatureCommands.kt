package de.thomcz.pap.battle.backend.domain.port.`in`.command

import java.util.UUID

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
