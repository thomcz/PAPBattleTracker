package de.thomcz.pap.battle.backend.application.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

/**
 * Command DTO for creating a new battle.
 */
data class CreateBattleCommand(
    @field:NotBlank(message = "Battle name cannot be blank")
    @field:Size(max = 255, message = "Battle name cannot exceed 255 characters")
    val name: String,
    val sessionId: java.util.UUID? = null
)
