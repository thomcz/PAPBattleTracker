package de.thomcz.pap.battle.backend.domain.port.`in`

import de.thomcz.pap.battle.backend.application.dto.ApplyDamageCommand
import de.thomcz.pap.battle.backend.domain.model.Battle
import java.util.UUID

/**
 * Use case: Apply damage to a creature in an active battle.
 *
 * Input: Battle ID, target creature ID, damage amount
 * Output: Updated Battle aggregate with DamageApplied (and possibly CreatureDefeated) events
 */
interface ApplyDamageUseCase {
    fun execute(battleId: UUID, command: ApplyDamageCommand, userId: String): Battle
}
