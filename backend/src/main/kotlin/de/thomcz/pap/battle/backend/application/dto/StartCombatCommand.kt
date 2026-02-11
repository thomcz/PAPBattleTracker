package de.thomcz.pap.battle.backend.application.dto

import java.util.UUID

/**
 * Command to start combat for a battle.
 */
data class StartCombatCommand(
    val battleId: UUID
)
