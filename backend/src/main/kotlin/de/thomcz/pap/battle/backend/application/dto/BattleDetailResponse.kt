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
    val creatures: List<CreatureResponse>,
    val currentTurn: Int,
    val round: Int,
    val currentActor: CreatureResponse?,
    val createdAt: Instant,
    val lastModified: Instant
) {
    companion object {
        fun from(battle: Battle): BattleDetailResponse {
            val creatureResponses = battle.getCreatures().map { CreatureResponse.fromCreature(it) }
            val currentActor = if (battle.status == CombatStatus.ACTIVE && battle.getCreatures().isNotEmpty()) {
                val creatures = battle.getCreatures()
                if (battle.currentTurn < creatures.size) {
                    CreatureResponse.fromCreature(creatures[battle.currentTurn])
                } else null
            } else null

            return BattleDetailResponse(
                id = battle.battleId,
                name = battle.name,
                status = battle.status,
                creatures = creatureResponses,
                currentTurn = battle.currentTurn,
                round = battle.round,
                currentActor = currentActor,
                createdAt = battle.createdAt,
                lastModified = battle.lastModified
            )
        }
    }
}
