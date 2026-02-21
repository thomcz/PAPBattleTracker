package de.thomcz.pap.battle.backend.domain.port.out

import de.thomcz.pap.battle.backend.domain.model.BeasteryCreature
import java.util.UUID

interface BeasteryCreatureRepository {
    fun findById(creatureId: UUID): BeasteryCreature?
    fun findByUserId(userId: UUID): List<BeasteryCreature>
    fun save(creature: BeasteryCreature)
    fun deleteById(creatureId: UUID)
}
