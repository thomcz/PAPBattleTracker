package de.thomcz.pap.battle.backend.domain.model.events

import java.time.Instant
import java.util.UUID

/**
 * Domain event: A player character was soft-deleted.
 *
 * The player is marked as deleted and excluded from active queries,
 * but events are preserved for audit trail.
 *
 * Emitted by: Player.delete()
 */
data class PlayerDeleted(
    override val playerId: UUID,
    override val eventId: UUID,
    override val timestamp: Instant,
    override val userId: UUID
) : PlayerEvent
