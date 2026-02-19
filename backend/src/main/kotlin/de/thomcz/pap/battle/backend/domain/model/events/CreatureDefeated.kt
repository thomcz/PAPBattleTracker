package de.thomcz.pap.battle.backend.domain.model.events

import java.time.Instant
import java.util.UUID

/**
 * Domain event: A creature was defeated (HP reached 0).
 *
 * Emitted immediately after a DamageApplied event when the target's
 * remaining HP reaches 0.
 *
 * Emitted by: Battle.applyDamage()
 */
data class CreatureDefeated(
    override val battleId: UUID,
    override val eventId: UUID,
    override val timestamp: Instant,
    override val userId: UUID,
    val creatureId: UUID,
    val creatureName: String
) : BattleEvent
