package de.thomcz.pap.battle.backend.domain.port.`in`

import de.thomcz.pap.battle.backend.domain.model.BeasteryCreature
import java.util.UUID

interface GetBeasteryCreatureUseCase {
    fun execute(creatureId: UUID, userId: String): BeasteryCreature
}
