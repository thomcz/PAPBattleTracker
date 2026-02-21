package de.thomcz.pap.battle.backend.domain.model

import de.thomcz.pap.battle.backend.domain.model.events.*
import java.time.Instant
import java.util.UUID

/**
 * BeasteryCreature aggregate root - represents a reusable creature template in the beastery.
 *
 * Event-sourced aggregate following the same pattern as Player:
 * - State derived from replaying events
 * - All state changes emit events
 * - Events are immutable once created
 * - Business rules enforced before emitting events
 *
 * Creatures are scoped to a user and can be added to any of that user's battles.
 * Abilities are optional at creation time.
 */
class BeasteryCreature private constructor() {
    // === Aggregate Identity ===
    var creatureId: UUID = UUID.randomUUID()
        private set
    var userId: UUID = UUID.randomUUID()
        private set

    // === Derived State ===
    var name: String = ""
        private set
    var hitPoints: Int = 1
        private set
    var armorClass: Int = 0
        private set
    var isDeleted: Boolean = false
        private set
    var createdAt: Instant = Instant.now()
        private set
    var lastModified: Instant = Instant.now()
        private set

    // === Event Sourcing Infrastructure ===
    private val uncommittedEvents: MutableList<BeasteryCreatureEvent> = mutableListOf()

    fun getUncommittedEvents(): List<BeasteryCreatureEvent> = uncommittedEvents.toList()

    fun markEventsAsCommitted() {
        uncommittedEvents.clear()
    }

    fun loadFromHistory(events: List<BeasteryCreatureEvent>): BeasteryCreature {
        events.forEach { event ->
            applyEvent(event, isReplay = true)
        }
        return this
    }

    // === Factory Methods ===

    companion object {
        fun newInstance(): BeasteryCreature = BeasteryCreature()

        /**
         * Create a new beastery creature.
         *
         * @param userId The user creating the creature
         * @param name Creature name (1-100 chars)
         * @param hitPoints Maximum hit points (1-999)
         * @param armorClass Armor class (0-30)
         */
        fun create(
            userId: UUID,
            name: String,
            hitPoints: Int,
            armorClass: Int
        ): BeasteryCreature {
            require(name.isNotBlank()) { "Creature name cannot be blank" }
            require(name.length <= 100) { "Creature name cannot exceed 100 characters" }
            require(hitPoints in 1..999) { "Hit points must be between 1 and 999" }
            require(armorClass in 0..30) { "Armor class must be between 0 and 30" }

            val creature = BeasteryCreature()
            val event = BeasteryCreatureCreated(
                creatureId = UUID.randomUUID(),
                eventId = UUID.randomUUID(),
                timestamp = Instant.now(),
                userId = userId,
                name = name.trim(),
                hitPoints = hitPoints,
                armorClass = armorClass
            )

            creature.applyEvent(event)
            return creature
        }
    }

    // === Business Logic Methods ===

    /**
     * Update creature attributes.
     *
     * Business rules:
     * - Creature must not be deleted
     * - All validation rules apply to new values
     */
    fun update(
        userId: UUID,
        name: String,
        hitPoints: Int,
        armorClass: Int
    ): BeasteryCreature {
        check(!isDeleted) { "Cannot update a deleted creature" }
        require(name.isNotBlank()) { "Creature name cannot be blank" }
        require(name.length <= 100) { "Creature name cannot exceed 100 characters" }
        require(hitPoints in 1..999) { "Hit points must be between 1 and 999" }
        require(armorClass in 0..30) { "Armor class must be between 0 and 30" }

        val event = BeasteryCreatureUpdated(
            creatureId = creatureId,
            eventId = UUID.randomUUID(),
            timestamp = Instant.now(),
            userId = userId,
            name = name.trim(),
            hitPoints = hitPoints,
            armorClass = armorClass
        )

        applyEvent(event)
        return this
    }

    /**
     * Delete the creature from the beastery (hard delete semantics).
     *
     * Business rules:
     * - Creature must not already be deleted
     */
    fun delete(userId: UUID): BeasteryCreature {
        check(!isDeleted) { "Creature is already deleted" }

        val event = BeasteryCreatureDeleted(
            creatureId = creatureId,
            eventId = UUID.randomUUID(),
            timestamp = Instant.now(),
            userId = userId
        )

        applyEvent(event)
        return this
    }

    /**
     * Create a duplicate of this creature with a new ID.
     *
     * @param userId The user creating the duplicate
     * @param customName Optional custom name; defaults to "[name] Copy"
     */
    fun duplicate(userId: UUID, customName: String? = null): BeasteryCreature {
        check(!isDeleted) { "Cannot duplicate a deleted creature" }

        val newName = customName?.trim() ?: "$name Copy"
        return create(
            userId = userId,
            name = newName,
            hitPoints = hitPoints,
            armorClass = armorClass
        )
    }

    // === Event Application Logic ===

    private fun applyEvent(event: BeasteryCreatureEvent, isReplay: Boolean = false) {
        when (event) {
            is BeasteryCreatureCreated -> {
                creatureId = event.creatureId
                userId = event.userId
                name = event.name
                hitPoints = event.hitPoints
                armorClass = event.armorClass
                isDeleted = false
                createdAt = event.timestamp
            }

            is BeasteryCreatureUpdated -> {
                name = event.name
                hitPoints = event.hitPoints
                armorClass = event.armorClass
            }

            is BeasteryCreatureDeleted -> {
                isDeleted = true
            }
        }

        lastModified = event.timestamp

        if (!isReplay) {
            uncommittedEvents.add(event)
        }
    }
}
