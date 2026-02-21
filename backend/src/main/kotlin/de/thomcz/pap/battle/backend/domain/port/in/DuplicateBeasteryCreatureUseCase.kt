package de.thomcz.pap.battle.backend.domain.port.`in`

import de.thomcz.pap.battle.backend.domain.model.BeasteryCreature
import java.util.UUID

interface DuplicateBeasteryCreatureUseCase {
    fun execute(creatureId: UUID, customName: String?, userId: String): BeasteryCreature
}
