package de.thomcz.pap.battle.backend.application.dto

import java.util.UUID

/**
 * Command to resume combat for a battle.
 */
data class ResumeCombatCommand(
    val battleId: UUID
)
