package de.thomcz.pap.battle.backend.domain.port.`in`

import de.thomcz.pap.battle.backend.domain.model.Battle
import de.thomcz.pap.battle.backend.domain.model.CombatStatus

/**
 * Use case: List all battles for a user.
 *
 * Input: User ID, optional status filter
 * Output: List of Battle aggregates
 */
interface ListBattlesUseCase {
    fun execute(userId: String, status: CombatStatus? = null): List<Battle>
}
