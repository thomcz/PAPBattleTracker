package de.thomcz.pap.battle.backend.domain.port.`in`

import de.thomcz.pap.battle.backend.application.dto.ApplyStatusEffectCommand
import de.thomcz.pap.battle.backend.domain.model.Battle
import java.util.UUID

/**
 * Use case: Add or remove a status effect on a creature in an active battle.
 *
 * Input: Battle ID, creature ID, effect name, action (ADD/REMOVE)
 * Output: Updated Battle aggregate with StatusEffectApplied or StatusEffectRemoved event
 */
interface ApplyStatusEffectUseCase {
    fun execute(battleId: UUID, creatureId: UUID, command: ApplyStatusEffectCommand, userId: String): Battle
}
