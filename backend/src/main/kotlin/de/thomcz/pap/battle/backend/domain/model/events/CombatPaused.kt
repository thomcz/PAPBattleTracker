package de.thomcz.pap.battle.backend.domain.model.events

import java.time.Instant
import java.util.UUID

/**
 * Domain event: Active combat was paused.
 *
 * Changes status from ACTIVE to PAUSED.
 * All state (creatures, turn, round) is preserved.
 *
 * Emitted by: Battle.pauseCombat()
 *
 * Business rules enforced before emission:
 * - Status must be ACTIVE
 */
data class CombatPaused(
    override val battleId: UUID,
    override val eventId: UUID,
    override val timestamp: Instant,
    override val userId: UUID
) : BattleEvent
