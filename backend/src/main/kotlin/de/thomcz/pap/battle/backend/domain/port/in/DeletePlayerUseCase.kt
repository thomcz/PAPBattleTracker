package de.thomcz.pap.battle.backend.domain.port.`in`

import de.thomcz.pap.battle.backend.application.dto.DeletePlayerCommand

interface DeletePlayerUseCase {
    fun execute(command: DeletePlayerCommand, userId: String)
}
