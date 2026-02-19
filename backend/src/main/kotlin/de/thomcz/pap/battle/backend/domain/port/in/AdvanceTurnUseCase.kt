package de.thomcz.pap.battle.backend.domain.port.`in`

import de.thomcz.pap.battle.backend.domain.model.Battle
import java.util.UUID

/**
 * Use case: Advance to the next turn in initiative order.
 *
 * Input: Battle ID
 * Output: Updated Battle aggregate with TurnAdvanced event
 */
interface AdvanceTurnUseCase {
    fun execute(battleId: UUID, userId: String): Battle
}
