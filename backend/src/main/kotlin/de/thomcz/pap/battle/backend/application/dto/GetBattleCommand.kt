package de.thomcz.pap.battle.backend.application.dto

import java.util.UUID

/**
 * Command to get battle details.
 */
data class GetBattleCommand(
    val battleId: UUID
)
