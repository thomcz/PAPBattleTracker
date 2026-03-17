package de.thomcz.pap.battle.backend.application.dto

import de.thomcz.pap.battle.backend.domain.model.CreatureType
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.PositiveOrZero

/**
 * DTO for creating a new creature in a battle.
 * Maps to POST /api/battles/{id}/creatures request body.
 */
data class CreateCreatureRequest(
    @field:NotBlank(message = "Name is required")
    val name: String,

    @field:NotNull(message = "Type is required")
    val type: CreatureType,

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
    val armorClass: Int,

    @field:Min(value = -5, message = "Dex modifier must be at least -5")
    @field:Max(value = 10, message = "Dex modifier must be at most 10")
    val dexModifier: Int? = null
)
