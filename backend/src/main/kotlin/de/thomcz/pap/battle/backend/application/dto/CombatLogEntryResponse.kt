package de.thomcz.pap.battle.backend.application.dto

import de.thomcz.pap.battle.backend.domain.model.events.*
import java.time.Instant

/**
 * Response DTO for a combat log entry.
 * Derived from battle events for human-readable display.
 */
data class CombatLogEntryResponse(
    val timestamp: Instant,
    val message: String,
    val type: String
) {
    companion object {
        fun fromEvent(event: BattleEvent): CombatLogEntryResponse? {
            return when (event) {
                is CombatStarted -> CombatLogEntryResponse(
                    timestamp = event.timestamp,
                    message = "Combat started!",
                    type = "ROUND_START"
                )
                is TurnAdvanced -> CombatLogEntryResponse(
                    timestamp = event.timestamp,
                    message = "Round ${event.newRound}, turn advanced.",
                    type = "CREATURE_ACTION"
                )
                is DamageApplied -> {
                    val sourceText = if (event.source != null) " (${event.source})" else ""
                    CombatLogEntryResponse(
                        timestamp = event.timestamp,
                        message = "${event.damage} damage dealt$sourceText. HP: ${event.remainingHp}",
                        type = "DAMAGE"
                    )
                }
                is CreatureDefeated -> CombatLogEntryResponse(
                    timestamp = event.timestamp,
                    message = "${event.creatureName} was defeated!",
                    type = "DEFEAT"
                )
                is CombatEnded -> CombatLogEntryResponse(
                    timestamp = event.timestamp,
                    message = "Combat ended: ${event.outcome}",
                    type = "BATTLE_END"
                )
                else -> null // Non-combat events (creature CRUD, pause/resume) not shown in combat log
            }
        }
    }
}
