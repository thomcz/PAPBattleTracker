package de.thomcz.pap.battle.backend.domain.port.`in`

import de.thomcz.pap.battle.backend.domain.port.`in`.command.UpdateBeasteryCreatureCommand
import de.thomcz.pap.battle.backend.domain.model.BeasteryCreature
import java.util.UUID

interface UpdateBeasteryCreatureUseCase {
    fun execute(creatureId: UUID, command: UpdateBeasteryCreatureCommand, userId: String): BeasteryCreature
}
