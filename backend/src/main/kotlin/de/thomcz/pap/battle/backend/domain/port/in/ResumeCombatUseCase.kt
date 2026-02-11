package de.thomcz.pap.battle.backend.domain.port.`in`

import de.thomcz.pap.battle.backend.application.dto.ResumeCombatCommand
import de.thomcz.pap.battle.backend.domain.model.Battle

/**
 * Use case: Resume paused combat.
 *
 * Input: Battle ID
 * Output: Updated Battle aggregate with CombatResumed event
 */
interface ResumeCombatUseCase {
    fun execute(command: ResumeCombatCommand, userId: String): Battle
}
