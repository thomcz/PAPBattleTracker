package de.thomcz.pap.battle.backend.application.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull

enum class EffectAction { ADD, REMOVE }

/**
 * Command DTO for applying or removing a status effect on a creature.
 */
data class ApplyStatusEffectCommand(
    @field:NotBlank(message = "Effect name must not be blank")
    val effect: String,

    @field:NotNull(message = "Action must be specified")
    val action: EffectAction
)
