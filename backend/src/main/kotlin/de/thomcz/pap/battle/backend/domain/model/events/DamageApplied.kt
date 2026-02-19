package de.thomcz.pap.battle.backend.domain.model.events

import java.time.Instant
import java.util.UUID

/**
 * Domain event: Damage was applied to a creature.
 *
 * Reduces the target creature's HP by the specified amount.
 * HP is capped at 0 (cannot go negative).
 *
 * Emitted by: Battle.applyDamage()
 *
 * Business rules enforced before emission:
 * - Status must be ACTIVE
 * - Target creature must exist and not be defeated
 * - Damage must be positive
 */
data class DamageApplied(
    override val battleId: UUID,
    override val eventId: UUID,
    override val timestamp: Instant,
    override val userId: UUID,
    val targetCreatureId: UUID,
    val damage: Int,
    val remainingHp: Int,
    val source: String?
) : BattleEvent
