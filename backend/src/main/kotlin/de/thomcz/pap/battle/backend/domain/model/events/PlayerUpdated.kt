package de.thomcz.pap.battle.backend.domain.model.events

import java.time.Instant
import java.util.UUID

/**
 * Domain event: A player character's attributes were updated.
 *
 * Emitted when a Game Master modifies an existing player's details.
 * All fields carry the full new state (not deltas).
 *
 * Emitted by: Player.update()
 */
data class PlayerUpdated(
    override val playerId: UUID,
    override val eventId: UUID,
    override val timestamp: Instant,
    override val userId: UUID,
    val name: String,
    val characterClass: String,
    val level: Int,
    val maxHp: Int
) : PlayerEvent
