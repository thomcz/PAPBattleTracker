package de.thomcz.pap.battle.backend.domain.port.`in`

import de.thomcz.pap.battle.backend.application.dto.PauseCombatCommand
import de.thomcz.pap.battle.backend.domain.model.Battle

/**
 * Use case: Pause active combat.
 *
 * Input: Battle ID
 * Output: Updated Battle aggregate with CombatPaused event
 */
interface PauseCombatUseCase {
    fun execute(command: PauseCombatCommand, userId: String): Battle
}
