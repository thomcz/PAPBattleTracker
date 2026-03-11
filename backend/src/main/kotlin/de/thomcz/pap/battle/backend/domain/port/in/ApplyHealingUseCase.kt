package de.thomcz.pap.battle.backend.domain.port.`in`

import de.thomcz.pap.battle.backend.application.dto.ApplyHealingCommand
import de.thomcz.pap.battle.backend.domain.model.Battle
import java.util.UUID

/**
 * Use case: Apply healing to a creature in an active battle.
 *
 * Input: Battle ID, healing command (creatureId + amount)
 * Output: Updated Battle aggregate with HealingApplied event
 */
interface ApplyHealingUseCase {
    fun execute(battleId: UUID, command: ApplyHealingCommand, userId: String): Battle
}
