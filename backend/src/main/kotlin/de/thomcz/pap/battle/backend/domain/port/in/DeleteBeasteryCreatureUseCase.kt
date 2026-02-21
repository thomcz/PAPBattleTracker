package de.thomcz.pap.battle.backend.domain.port.`in`

import de.thomcz.pap.battle.backend.application.dto.DeleteBeasteryCreatureCommand

interface DeleteBeasteryCreatureUseCase {
    fun execute(command: DeleteBeasteryCreatureCommand, userId: String)
}
