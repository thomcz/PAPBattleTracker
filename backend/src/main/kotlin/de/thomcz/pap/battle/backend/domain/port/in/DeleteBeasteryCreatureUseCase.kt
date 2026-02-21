package de.thomcz.pap.battle.backend.domain.port.`in`

import de.thomcz.pap.battle.backend.domain.port.`in`.command.DeleteBeasteryCreatureCommand

interface DeleteBeasteryCreatureUseCase {
    fun execute(command: DeleteBeasteryCreatureCommand, userId: String)
}
