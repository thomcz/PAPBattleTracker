package de.thomcz.pap.battle.backend.domain.port.`in`

import de.thomcz.pap.battle.backend.application.dto.GetBattleCommand
import de.thomcz.pap.battle.backend.domain.model.Battle

/**
 * Use case: Get detailed battle information by ID.
 *
 * Input: Battle ID
 * Output: Battle aggregate reconstructed from events
 */
interface GetBattleUseCase {
    fun execute(command: GetBattleCommand, userId: String): Battle
}
