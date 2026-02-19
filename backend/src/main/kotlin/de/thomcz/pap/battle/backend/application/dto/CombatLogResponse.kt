package de.thomcz.pap.battle.backend.application.dto

/**
 * Response DTO for paginated combat log.
 */
data class CombatLogResponse(
    val entries: List<CombatLogEntryResponse>,
    val total: Int,
    val limit: Int,
    val offset: Int
)
