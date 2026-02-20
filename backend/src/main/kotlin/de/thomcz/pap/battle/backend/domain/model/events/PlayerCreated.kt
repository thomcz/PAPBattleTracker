package de.thomcz.pap.battle.backend.domain.model.events

import java.time.Instant
import java.util.UUID

/**
 * Domain event: A new player character was created.
 *
 * Emitted when a Game Master creates a reusable player template.
 *
 * Emitted by: Player.create()
 */
data class PlayerCreated(
    override val playerId: UUID,
    override val eventId: UUID,
    override val timestamp: Instant,
    override val userId: UUID,
    val name: String,
    val characterClass: String,
    val level: Int,
    val maxHp: Int
) : PlayerEvent
