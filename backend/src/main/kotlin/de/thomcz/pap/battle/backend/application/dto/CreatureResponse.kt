package de.thomcz.pap.battle.backend.application.dto

import de.thomcz.pap.battle.backend.domain.model.Creature
import de.thomcz.pap.battle.backend.domain.model.CreatureType
import java.util.UUID

/**
 * DTO for creature responses.
 * Maps Creature domain objects to API responses.
 */
data class CreatureResponse(
    val id: UUID,
    val name: String,
    val type: CreatureType,
    val currentHp: Int,
    val maxHp: Int,
    val initiative: Int,
    val armorClass: Int,
    val statusEffects: List<String> = emptyList() // User Story 7 - not yet implemented
) {
    companion object {
        /**
         * Factory method to create CreatureResponse from Creature domain object.
         */
        fun fromCreature(creature: Creature): CreatureResponse {
            return CreatureResponse(
                id = creature.id,
                name = creature.name,
                type = creature.type,
                currentHp = creature.currentHp,
                maxHp = creature.maxHp,
                initiative = creature.initiative,
                armorClass = creature.armorClass,
                statusEffects = emptyList() // TODO: User Story 7 - status effects
            )
        }
    }
}
