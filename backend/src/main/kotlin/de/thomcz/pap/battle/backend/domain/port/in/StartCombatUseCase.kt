package de.thomcz.pap.battle.backend.domain.port.`in`

import de.thomcz.pap.battle.backend.application.dto.StartCombatCommand
import de.thomcz.pap.battle.backend.domain.model.Battle

/**
 * Use case: Start combat in a battle.
 *
 * Input: Battle ID
 * Output: Updated Battle aggregate with CombatStarted event
 */
interface StartCombatUseCase {
    fun execute(command: StartCombatCommand, userId: String): Battle
}
