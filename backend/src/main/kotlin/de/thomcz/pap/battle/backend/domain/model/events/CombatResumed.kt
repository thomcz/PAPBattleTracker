package de.thomcz.pap.battle.backend.domain.model.events

import java.time.Instant
import java.util.UUID

/**
 * Domain event: Paused combat was resumed.
 *
 * Changes status from PAUSED back to ACTIVE.
 * State remains as it was when paused.
 *
 * Emitted by: Battle.resumeCombat()
 *
 * Business rules enforced before emission:
 * - Status must be PAUSED
 */
data class CombatResumed(
    override val battleId: UUID,
    override val eventId: UUID,
    override val timestamp: Instant,
    override val userId: UUID
) : BattleEvent
