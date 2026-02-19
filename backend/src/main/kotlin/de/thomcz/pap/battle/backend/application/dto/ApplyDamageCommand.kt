package de.thomcz.pap.battle.backend.application.dto

import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotNull
import java.util.UUID

/**
 * Command DTO for applying damage to a creature.
 */
data class ApplyDamageCommand(
    @field:NotNull(message = "Target creature ID must be specified")
    val creatureId: UUID,

    @field:Min(value = 1, message = "Damage must be at least 1")
    val damage: Int,

    val source: String? = null
)
