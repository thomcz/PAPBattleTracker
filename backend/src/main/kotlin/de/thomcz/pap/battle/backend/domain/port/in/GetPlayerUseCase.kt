package de.thomcz.pap.battle.backend.domain.port.`in`

import de.thomcz.pap.battle.backend.domain.model.Player
import java.util.UUID

interface GetPlayerUseCase {
    fun execute(playerId: UUID, userId: String): Player
}
