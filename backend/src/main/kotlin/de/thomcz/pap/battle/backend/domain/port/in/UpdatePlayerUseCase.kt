package de.thomcz.pap.battle.backend.domain.port.`in`

import de.thomcz.pap.battle.backend.application.dto.UpdatePlayerCommand
import de.thomcz.pap.battle.backend.domain.model.Player
import java.util.UUID

interface UpdatePlayerUseCase {
    fun execute(playerId: UUID, command: UpdatePlayerCommand, userId: String): Player
}
