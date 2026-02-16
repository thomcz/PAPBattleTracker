package de.thomcz.pap.battle.backend.domain.port.`in`

import de.thomcz.pap.battle.backend.application.dto.EndCombatCommand
import de.thomcz.pap.battle.backend.domain.model.Battle
import java.util.UUID

/**
 * Use case: End combat.
 *
 * Input: Battle ID, combat outcome
 * Output: Updated Battle aggregate with CombatEnded event
 */
interface EndCombatUseCase {
    fun execute(battleId: UUID, command: EndCombatCommand, userId: String): Battle
}
