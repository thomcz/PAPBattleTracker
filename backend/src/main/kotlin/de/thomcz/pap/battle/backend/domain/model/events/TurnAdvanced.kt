package de.thomcz.pap.battle.backend.domain.model.events

import java.time.Instant
import java.util.UUID

/**
 * Domain event: Turn was advanced to the next creature in initiative order.
 *
 * Increments currentTurn. When all creatures have acted, increments round
 * and resets currentTurn to 0.
 *
 * Emitted by: Battle.advanceTurn()
 *
 * Business rules enforced before emission:
 * - Status must be ACTIVE
 */
data class TurnAdvanced(
    override val battleId: UUID,
    override val eventId: UUID,
    override val timestamp: Instant,
    override val userId: UUID,
    val newTurn: Int,
    val newRound: Int,
    val activeCreatureId: UUID
) : BattleEvent
