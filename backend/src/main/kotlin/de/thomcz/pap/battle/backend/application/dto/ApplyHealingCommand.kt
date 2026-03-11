package de.thomcz.pap.battle.backend.application.dto

import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotNull
import java.util.UUID

/**
 * Command DTO for applying healing to a creature.
 */
data class ApplyHealingCommand(
    @field:NotNull(message = "Target creature ID must be specified")
    val creatureId: UUID,

    @field:Min(value = 1, message = "Healing must be at least 1")
    val healing: Int,

    val source: String? = null
)
