package de.thomcz.pap.battle.backend.domain.model.events

import java.time.Instant
import java.util.UUID

/**
 * Domain event: Combat was started in a battle.
 *
 * Changes status from NOT_STARTED to ACTIVE.
 * Sets round to 1 and currentTurn to 0.
 * Sorts creatures by initiative (highest first).
 *
 * Emitted by: Battle.startCombat()
 *
 * Business rules enforced before emission:
 * - Status must be NOT_STARTED
 * - At least one creature must exist (User Story 2)
 */
data class CombatStarted(
    override val battleId: UUID,
    override val eventId: UUID,
    override val timestamp: Instant,
    override val userId: UUID,
    val initiativeOrder: List<UUID> // Sorted creature IDs (highest initiative first)
) : BattleEvent
