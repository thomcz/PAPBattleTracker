package de.thomcz.pap.battle.backend.domain.port.`in`

import de.thomcz.pap.battle.backend.application.dto.CreateBattleCommand
import de.thomcz.pap.battle.backend.domain.model.Battle

/**
 * Use case: Create a new battle session.
 *
 * Input: CreateBattleCommand with battle name
 * Output: Battle aggregate with BattleCreated event
 */
interface CreateBattleUseCase {
    fun execute(command: CreateBattleCommand, userId: String): Battle
}
