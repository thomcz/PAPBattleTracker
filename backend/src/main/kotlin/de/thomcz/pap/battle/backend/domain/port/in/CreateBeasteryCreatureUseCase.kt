package de.thomcz.pap.battle.backend.domain.port.`in`

import de.thomcz.pap.battle.backend.domain.port.`in`.command.CreateBeasteryCreatureCommand
import de.thomcz.pap.battle.backend.domain.model.BeasteryCreature

interface CreateBeasteryCreatureUseCase {
    fun execute(command: CreateBeasteryCreatureCommand, userId: String): BeasteryCreature
}
