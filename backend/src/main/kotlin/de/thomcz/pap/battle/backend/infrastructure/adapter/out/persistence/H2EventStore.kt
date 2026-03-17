package de.thomcz.pap.battle.backend.infrastructure.adapter.out.persistence

import com.fasterxml.jackson.databind.ObjectMapper
import de.thomcz.pap.battle.backend.domain.model.events.*
import de.thomcz.pap.battle.backend.domain.port.out.EventStore
import de.thomcz.pap.battle.backend.infrastructure.adapter.out.persistence.entity.EventEntity
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

/**
 * H2 database implementation of EventStore port.
 *
 * Serializes domain events to JSON and stores them in the events table.
 * Deserializes events when reconstructing aggregate state.
 *
 * Key responsibilities:
 * - JSON serialization/deserialization of events
 * - Sequence number assignment
 * - Event ordering guarantees
 */
@Component
class H2EventStore(
    private val eventEntityRepository: EventEntityRepository,
    private val objectMapper: ObjectMapper
) : EventStore {

    @Transactional
    override fun saveEvents(battleId: UUID, events: List<BattleEvent>) {
        if (events.isEmpty()) return

        // Acquire pessimistic write lock to serialize concurrent sequence number assignment
        val latestEvent = eventEntityRepository.findTopByBattleIdOrderBySequenceNumberDesc(battleId)
        val currentMaxSequence = latestEvent?.sequenceNumber ?: 0
        var nextSequence = currentMaxSequence + 1

        // Convert domain events to JPA entities with sequence numbers
        val eventEntities = events.map { event ->
            EventEntity(
                eventId = event.eventId,
                battleId = battleId,
                eventType = event::class.simpleName ?: throw IllegalStateException("Event class must have a name"),
                eventData = objectMapper.writeValueAsString(event),
                sequenceNumber = nextSequence++,
                timestamp = event.timestamp,
                userId = event.userId
            )
        }

        eventEntityRepository.saveAll(eventEntities)
    }

    @Transactional(readOnly = true)
    override fun getEvents(battleId: UUID, afterSequence: Int): List<BattleEvent> {
        val entities = if (afterSequence > 0) {
            eventEntityRepository.findByBattleIdAndSequenceNumberGreaterThanOrderBySequenceNumberAsc(
                battleId,
                afterSequence
            )
        } else {
            eventEntityRepository.findByBattleIdOrderBySequenceNumberAsc(battleId)
        }

        return entities.map { entity ->
            deserializeEvent(
                entity.eventType ?: throw IllegalStateException("Event type cannot be null"),
                entity.eventData ?: throw IllegalStateException("Event data cannot be null")
            )
        }
    }

    @Transactional(readOnly = true)
    override fun getEventCount(battleId: UUID): Int {
        return eventEntityRepository.countByBattleId(battleId)
    }

    /**
     * Deserialize JSON event data back to domain event object.
     *
     * Uses an explicit class map for compile-time safety. If an event class is renamed
     * or moved, this map will fail to compile rather than silently breaking stored events.
     */
    private fun deserializeEvent(eventType: String, eventData: String): BattleEvent {
        val eventClass = EVENT_TYPE_MAP[eventType]
            ?: throw IllegalStateException("Unknown event type: $eventType")
        return objectMapper.readValue(eventData, eventClass)
    }

    companion object {
        private val EVENT_TYPE_MAP: Map<String, Class<out BattleEvent>> = mapOf(
            "BattleCreated" to BattleCreated::class.java,
            "CombatStarted" to CombatStarted::class.java,
            "CombatPaused" to CombatPaused::class.java,
            "CombatResumed" to CombatResumed::class.java,
            "CombatEnded" to CombatEnded::class.java,
            "CreatureAdded" to CreatureAdded::class.java,
            "CreatureUpdated" to CreatureUpdated::class.java,
            "CreatureRemoved" to CreatureRemoved::class.java,
            "TurnAdvanced" to TurnAdvanced::class.java,
            "DamageApplied" to DamageApplied::class.java,
            "CreatureDefeated" to CreatureDefeated::class.java,
            "HealingApplied" to HealingApplied::class.java,
            "StatusEffectApplied" to StatusEffectApplied::class.java,
            "StatusEffectRemoved" to StatusEffectRemoved::class.java,
        )
    }
}
