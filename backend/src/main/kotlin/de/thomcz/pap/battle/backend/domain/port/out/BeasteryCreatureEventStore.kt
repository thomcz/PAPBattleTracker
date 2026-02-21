package de.thomcz.pap.battle.backend.domain.port.out

import de.thomcz.pap.battle.backend.domain.model.events.BeasteryCreatureEvent
import java.util.UUID

interface BeasteryCreatureEventStore {
    fun saveEvents(creatureId: UUID, events: List<BeasteryCreatureEvent>)
    fun getEvents(creatureId: UUID, afterSequence: Int = 0): List<BeasteryCreatureEvent>
    fun getEventCount(creatureId: UUID): Int
}
