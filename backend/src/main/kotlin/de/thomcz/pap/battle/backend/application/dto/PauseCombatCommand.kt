package de.thomcz.pap.battle.backend.application.dto

import java.util.UUID

/**
 * Command to pause combat for a battle.
 */
data class PauseCombatCommand(
    val battleId: UUID
)
