package de.thomcz.pap.battle.backend.application.dto

import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.PositiveOrZero

/**
 * DTO for updating an existing creature in a battle.
 * Maps to PUT /api/battles/{id}/creatures/{creatureId} request body.
 */
data class UpdateCreatureRequest(
    @field:NotBlank(message = "Name is required")
    val name: String,

    @field:NotNull(message = "Current HP is required")
    @field:PositiveOrZero(message = "Current HP must be non-negative")
    val currentHp: Int,

    @field:NotNull(message = "Max HP is required")
    @field:Min(value = 1, message = "Max HP must be at least 1")
    val maxHp: Int,

    @field:NotNull(message = "Initiative is required")
    val initiative: Int,

    @field:NotNull(message = "Armor class is required")
    @field:PositiveOrZero(message = "Armor class must be non-negative")
    val armorClass: Int
)
