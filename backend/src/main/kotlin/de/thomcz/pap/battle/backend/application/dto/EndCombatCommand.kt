package de.thomcz.pap.battle.backend.application.dto

import de.thomcz.pap.battle.backend.domain.model.events.CombatOutcome
import jakarta.validation.constraints.NotNull

/**
 * Command DTO for ending combat.
 */
data class EndCombatCommand(
    @field:NotNull(message = "Combat outcome must be specified")
    val outcome: CombatOutcome
)
