package de.thomcz.pap.battle.backend.application.dto

import de.thomcz.pap.battle.backend.domain.model.Battle
import de.thomcz.pap.battle.backend.domain.model.CombatStatus
import java.time.Instant
import java.util.UUID

/**
 * Response DTO for detailed battle view.
 * Includes creatures, combat log, turn/round information.
 */
data class BattleDetailResponse(
    val id: UUID,
    val name: String,
    val status: CombatStatus,
    val creatures: List<Any>, // TODO: CreatureResponse from User Story 2
    val currentTurn: Int,
    val round: Int,
    val combatLog: List<Any>, // TODO: LogEntryResponse from User Story 5
    val createdAt: Instant,
    val lastModified: Instant
) {
    companion object {
        fun from(battle: Battle): BattleDetailResponse {
            return BattleDetailResponse(
                id = battle.battleId,
                name = battle.name,
                status = battle.status,
                creatures = emptyList(), // TODO: Map creatures (User Story 2)
                currentTurn = battle.currentTurn,
                round = battle.round,
                combatLog = emptyList(), // TODO: Map combat log (User Story 5)
                createdAt = battle.createdAt,
                lastModified = battle.lastModified
            )
        }
    }
}
