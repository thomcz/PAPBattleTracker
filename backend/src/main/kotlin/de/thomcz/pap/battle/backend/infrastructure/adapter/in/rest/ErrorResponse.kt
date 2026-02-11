package de.thomcz.pap.battle.backend.infrastructure.adapter.`in`.rest

import java.time.Instant

/**
 * Standard error response matching OpenAPI contract.
 */
data class ErrorResponse(
    val timestamp: Instant,
    val status: Int,
    val error: String,
    val message: String,
    val path: String? = null
)
