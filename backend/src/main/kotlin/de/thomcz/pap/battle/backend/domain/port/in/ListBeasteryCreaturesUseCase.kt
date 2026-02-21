package de.thomcz.pap.battle.backend.domain.port.`in`

import de.thomcz.pap.battle.backend.domain.model.BeasteryCreature

interface ListBeasteryCreaturesUseCase {
    fun execute(userId: String, includeDeleted: Boolean = false): List<BeasteryCreature>
}
