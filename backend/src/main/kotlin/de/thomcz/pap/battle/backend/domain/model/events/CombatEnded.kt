package de.thomcz.pap.battle.backend.domain.model.events

import java.time.Instant
import java.util.UUID

/**
 * Domain event: Combat was ended.
 *
 * Changes status to ENDED.
 * Removes all MONSTER type creatures (User Story 2).
 * Clears status effects from remaining creatures.
 * Clears combat log (User Story 5).
 *
 * Emitted by: Battle.endCombat()
 *
 * Business rules enforced before emission:
 * - Status must be ACTIVE or PAUSED
 */
data class CombatEnded(
    override val battleId: UUID,
    override val eventId: UUID,
    override val timestamp: Instant,
    override val userId: UUID,
    val outcome: CombatOutcome,
    val removedMonsterIds: List<UUID> = emptyList()
) : BattleEvent

/**
 * Outcome of a completed combat.
 */
enum class CombatOutcome {
    PLAYERS_VICTORIOUS,
    PLAYERS_DEFEATED,
    DRAW,
    ABORTED
}
