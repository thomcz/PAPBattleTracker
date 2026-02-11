package de.thomcz.pap.battle.backend.application.dto

/**
 * Response DTO for battle list endpoint.
 * Wraps list of battles with pagination metadata.
 */
data class BattleListResponse(
    val battles: List<BattleResponse>,
    val totalElements: Int,
    val totalPages: Int,
    val currentPage: Int,
    val pageSize: Int
) {
    companion object {
        fun from(battles: List<BattleResponse>, page: Int = 0, size: Int = 20): BattleListResponse {
            return BattleListResponse(
                battles = battles,
                totalElements = battles.size,
                totalPages = if (battles.isEmpty()) 0 else (battles.size + size - 1) / size,
                currentPage = page,
                pageSize = size
            )
        }
    }
}
