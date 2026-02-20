package de.thomcz.pap.battle.backend.domain.port.`in`

import de.thomcz.pap.battle.backend.domain.model.Player

interface ListPlayersUseCase {
    fun execute(userId: String, includeDeleted: Boolean = false): List<Player>
}
