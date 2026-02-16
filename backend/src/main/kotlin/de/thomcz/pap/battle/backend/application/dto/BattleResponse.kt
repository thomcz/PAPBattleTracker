package de.thomcz.pap.battle.backend.application.dto

import de.thomcz.pap.battle.backend.domain.model.Battle
import de.thomcz.pap.battle.backend.domain.model.CombatStatus
import java.time.Instant
import java.util.UUID

/**
 * Response DTO for battle summary (list views).
 */
data class BattleResponse(
    val id: UUID,
    val name: String,
    val status: CombatStatus,
    val createdAt: Instant,
    val lastModified: Instant
) {
    companion object {
        fun from(battle: Battle): BattleResponse {
            return BattleResponse(
                id = battle.battleId,
                name = battle.name,
                status = battle.status,
                createdAt = battle.createdAt,
                lastModified = battle.lastModified
            )
        }
    }
}
