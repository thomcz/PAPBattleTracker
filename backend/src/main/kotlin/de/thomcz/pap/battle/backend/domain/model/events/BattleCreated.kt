package de.thomcz.pap.battle.backend.domain.model.events

import java.time.Instant
import java.util.UUID

/**
 * Domain event: Battle was created by a Game Master.
 *
 * This is always the first event in a battle's event stream.
 * Initializes the battle with NOT_STARTED status.
 *
 * Emitted by: Battle.create() factory method
 */
data class BattleCreated(
    override val battleId: UUID,
    override val eventId: UUID,
    override val timestamp: Instant,
    override val userId: UUID,
    val name: String,
    val sessionId: UUID? = null
) : BattleEvent
