package de.thomcz.pap.battle.backend.domain.port.`in`

import de.thomcz.pap.battle.backend.application.dto.CombatLogEntryResponse
import java.util.UUID

/**
 * Use case: Get combat log entries for a battle.
 *
 * Input: Battle ID, pagination (limit, offset)
 * Output: Paginated list of combat log entries derived from battle events
 */
interface GetCombatLogUseCase {
    fun execute(battleId: UUID, userId: String, limit: Int = 100, offset: Int = 0): CombatLogResult
}

data class CombatLogResult(
    val entries: List<CombatLogEntryResponse>,
    val total: Int,
    val limit: Int,
    val offset: Int
)
