package de.thomcz.pap.battle.backend.infrastructure.adapter.out.persistence

import de.thomcz.pap.battle.backend.domain.model.BeasteryCreature
import de.thomcz.pap.battle.backend.domain.port.out.BeasteryCreatureEventStore
import de.thomcz.pap.battle.backend.domain.port.out.BeasteryCreatureRepository
import de.thomcz.pap.battle.backend.infrastructure.adapter.out.persistence.mapper.BeasteryCreatureMapper
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Component
class JpaBeasteryCreatureRepository(
    private val beasteryCreatureEntityRepository: BeasteryCreatureEntityRepository,
    private val beasteryCreatureEventStore: BeasteryCreatureEventStore
) : BeasteryCreatureRepository {

    @Transactional(readOnly = true)
    override fun findById(creatureId: UUID): BeasteryCreature? {
        val entity = beasteryCreatureEntityRepository.findById(creatureId).orElse(null) ?: return null

        val events = beasteryCreatureEventStore.getEvents(creatureId)
        return if (events.isNotEmpty()) {
            BeasteryCreature.newInstance().loadFromHistory(events)
        } else {
            null
        }
    }

    @Transactional(readOnly = true)
    override fun findByUserId(userId: UUID): List<BeasteryCreature> {
        val entities = beasteryCreatureEntityRepository.findByUserId(userId)

        return entities.mapNotNull { entity ->
            entity.creatureId?.let { findById(it) }
        }
    }

    @Transactional
    override fun save(creature: BeasteryCreature) {
        val uncommittedEvents = creature.getUncommittedEvents()
        if (uncommittedEvents.isNotEmpty()) {
            beasteryCreatureEventStore.saveEvents(creature.creatureId, uncommittedEvents)
            creature.markEventsAsCommitted()
        }

        val eventCount = beasteryCreatureEventStore.getEventCount(creature.creatureId)
        val entity = BeasteryCreatureMapper.toEntity(creature, eventCount)
        beasteryCreatureEntityRepository.save(entity)
    }

    @Transactional
    override fun deleteById(creatureId: UUID) {
        beasteryCreatureEntityRepository.deleteById(creatureId)
    }
}
