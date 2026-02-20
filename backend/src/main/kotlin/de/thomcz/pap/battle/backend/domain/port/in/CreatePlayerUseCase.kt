package de.thomcz.pap.battle.backend.domain.port.`in`

import de.thomcz.pap.battle.backend.application.dto.CreatePlayerCommand
import de.thomcz.pap.battle.backend.domain.model.Player

interface CreatePlayerUseCase {
    fun execute(command: CreatePlayerCommand, userId: String): Player
}
