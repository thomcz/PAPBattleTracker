package de.thomcz.pap.battle.backend.domain.model

import de.thomcz.pap.battle.backend.domain.model.events.*
import java.time.Instant
import java.util.UUID

/**
 * Battle aggregate root - represents a complete combat encounter.
 *
 * Event-sourced aggregate:
 * - State derived from replaying events (not stored directly)
 * - All state changes emit events
 * - Events are immutable once created
 * - Business rules enforced before emitting events
 *
 * The aggregate maintains:
 * - Current state (derived from applying events)
 * - Uncommitted events (to be persisted)
 * - Business invariants (validation rules)
 */
class Battle private constructor() {
    // === Aggregate Identity ===
    var battleId: UUID = UUID.randomUUID()
        private set
    var userId: UUID = UUID.randomUUID()
        private set

    // === Derived State ===
    var name: String = ""
        private set
    var status: CombatStatus = CombatStatus.NOT_STARTED
        private set
    var createdAt: Instant = Instant.now()
        private set
    var lastModified: Instant = Instant.now()
        private set

    // Combat state (relevant when status = ACTIVE)
    var currentTurn: Int = 0
        private set
    var round: Int = 0
        private set

    // Creature state
    private val creatures: MutableList<Creature> = mutableListOf()

    // === Event Sourcing Infrastructure ===
    private val uncommittedEvents: MutableList<BattleEvent> = mutableListOf()

    /**
     * Get events that have been generated but not yet persisted.
     */
    fun getUncommittedEvents(): List<BattleEvent> = uncommittedEvents.toList()

    /**
     * Mark events as persisted (called by repository after saving).
     */
    fun markEventsAsCommitted() {
        uncommittedEvents.clear()
    }

    /**
     * Load battle state from historical events (event replay).
     * Reconstructs current state by applying each event in sequence.
     */
    fun loadFromHistory(events: List<BattleEvent>): Battle {
        events.forEach { event ->
            applyEvent(event, isReplay = true)
        }
        return this
    }

    // === Factory Methods ===

    companion object {
        /**
         * Create a new Battle instance for event replay.
         */
        fun newInstance(): Battle = Battle()

        /**
         * Create a new battle (factory method that emits BattleCreated event).
         *
         * @param userId The Game Master creating the battle
         * @param name Battle name
         * @return Battle aggregate with BattleCreated event
         */
        fun create(userId: UUID, name: String): Battle {
            require(name.isNotBlank()) { "Battle name cannot be blank" }
            require(name.length <= 255) { "Battle name cannot exceed 255 characters" }

            val battle = Battle()
            val event = BattleCreated(
                battleId = UUID.randomUUID(),
                eventId = UUID.randomUUID(),
                timestamp = Instant.now(),
                userId = userId,
                name = name
            )

            battle.applyEvent(event)
            return battle
        }
    }

    // === Business Logic Methods ===

    /**
     * Start combat.
     *
     * Business rules:
     * - Status must be NOT_STARTED
     * - TODO: At least one creature must exist (User Story 2)
     *
     * @throws IllegalStateException if preconditions not met
     */
    fun startCombat(userId: UUID): Battle {
        require(status == CombatStatus.NOT_STARTED) {
            "Cannot start combat: battle is in $status status"
        }

        // Sort creatures by initiative (descending - highest first)
        // Use sortedByDescending which provides a stable sort (preserves original order for ties)
        val sortedCreatures = creatures.sortedByDescending { it.initiative }
        val initiativeOrder = sortedCreatures.map { it.id }

        val event = CombatStarted(
            battleId = battleId,
            eventId = UUID.randomUUID(),
            timestamp = Instant.now(),
            userId = userId,
            initiativeOrder = initiativeOrder
        )

        applyEvent(event)
        return this
    }

    /**
     * Pause active combat.
     *
     * Business rules:
     * - Status must be ACTIVE
     *
     * @throws IllegalStateException if preconditions not met
     */
    fun pauseCombat(userId: UUID): Battle {
        require(status == CombatStatus.ACTIVE) {
            "Cannot pause combat: battle is in $status status"
        }

        val event = CombatPaused(
            battleId = battleId,
            eventId = UUID.randomUUID(),
            timestamp = Instant.now(),
            userId = userId
        )

        applyEvent(event)
        return this
    }

    /**
     * Resume paused combat.
     *
     * Business rules:
     * - Status must be PAUSED
     *
     * @throws IllegalStateException if preconditions not met
     */
    fun resumeCombat(userId: UUID): Battle {
        require(status == CombatStatus.PAUSED) {
            "Cannot resume combat: battle is in $status status"
        }

        val event = CombatResumed(
            battleId = battleId,
            eventId = UUID.randomUUID(),
            timestamp = Instant.now(),
            userId = userId
        )

        applyEvent(event)
        return this
    }

    /**
     * End combat.
     *
     * Business rules:
     * - Status must be ACTIVE or PAUSED
     *
     * Effects:
     * - Removes MONSTER creatures (User Story 2)
     * - Clears status effects (User Story 7)
     * - Clears combat log (User Story 5)
     *
     * @throws IllegalStateException if preconditions not met
     */
    fun endCombat(userId: UUID, outcome: CombatOutcome): Battle {
        require(status == CombatStatus.ACTIVE || status == CombatStatus.PAUSED) {
            "Cannot end combat: battle is in $status status"
        }

        // Collect IDs of all MONSTER creatures for auto-removal (User Story 5)
        val monsterIds = creatures
            .filter { it.type == CreatureType.MONSTER }
            .map { it.id }

        val event = CombatEnded(
            battleId = battleId,
            eventId = UUID.randomUUID(),
            timestamp = Instant.now(),
            userId = userId,
            outcome = outcome,
            removedMonsterIds = monsterIds
        )

        applyEvent(event)
        return this
    }

    // === Combat Mechanics Methods ===

    /**
     * Advance to the next turn in initiative order.
     *
     * Business rules:
     * - Status must be ACTIVE
     * - Skips defeated creatures
     * - When all creatures have acted, increments round and resets to first creature
     *
     * @throws IllegalStateException if battle is not ACTIVE
     */
    fun advanceTurn(userId: UUID): Battle {
        require(status == CombatStatus.ACTIVE) {
            "Cannot advance turn: battle is in $status status"
        }

        val activeCreatures = creatures.filter { !it.isDefeated() }
        require(activeCreatures.isNotEmpty()) {
            "Cannot advance turn: no active creatures"
        }

        var nextTurn = currentTurn + 1
        var nextRound = round

        // Skip defeated creatures and wrap around
        while (true) {
            if (nextTurn >= creatures.size) {
                nextTurn = 0
                nextRound++
            }
            if (!creatures[nextTurn].isDefeated()) {
                break
            }
            nextTurn++
        }

        val event = TurnAdvanced(
            battleId = battleId,
            eventId = UUID.randomUUID(),
            timestamp = Instant.now(),
            userId = userId,
            newTurn = nextTurn,
            newRound = nextRound,
            activeCreatureId = creatures[nextTurn].id
        )

        applyEvent(event)
        return this
    }

    /**
     * Apply damage to a creature.
     *
     * Business rules:
     * - Status must be ACTIVE
     * - Target creature must exist and not already be defeated
     * - Damage must be positive (at least 1)
     * - If HP reaches 0, a CreatureDefeated event is also emitted
     *
     * @throws IllegalStateException if battle is not ACTIVE
     * @throws IllegalArgumentException if creature not found, already defeated, or damage invalid
     */
    fun applyDamage(userId: UUID, targetCreatureId: UUID, damage: Int, source: String? = null): Battle {
        require(status == CombatStatus.ACTIVE) {
            "Cannot apply damage: battle is in $status status"
        }
        require(damage > 0) {
            "Damage must be positive, was: $damage"
        }

        val target = creatures.find { it.id == targetCreatureId }
            ?: throw IllegalArgumentException("Creature not found: $targetCreatureId")

        require(!target.isDefeated()) {
            "Cannot damage defeated creature: ${target.name}"
        }

        val remainingHp = (target.currentHp - damage).coerceAtLeast(0)

        val damageEvent = DamageApplied(
            battleId = battleId,
            eventId = UUID.randomUUID(),
            timestamp = Instant.now(),
            userId = userId,
            targetCreatureId = targetCreatureId,
            damage = damage,
            remainingHp = remainingHp,
            source = source
        )

        applyEvent(damageEvent)

        // If creature is now defeated, emit CreatureDefeated event
        if (remainingHp == 0) {
            val defeatedEvent = CreatureDefeated(
                battleId = battleId,
                eventId = UUID.randomUUID(),
                timestamp = Instant.now(),
                userId = userId,
                creatureId = targetCreatureId,
                creatureName = target.name
            )
            applyEvent(defeatedEvent)
        }

        return this
    }

    // === Creature Management Methods ===

    /**
     * Add a creature to the battle.
     *
     * Business rules:
     * - Cannot add creatures to ended battles
     * - Creature attributes must be valid (validated by Creature value object)
     *
     * @throws IllegalStateException if battle has ended
     * @throws IllegalArgumentException if creature attributes invalid
     */
    fun addCreature(
        userId: UUID,
        name: String,
        type: CreatureType,
        currentHp: Int,
        maxHp: Int,
        initiative: Int,
        armorClass: Int
    ): Battle {
        check(status != CombatStatus.ENDED) {
            "Cannot add creatures to ended battle"
        }

        // Validate creature by attempting to create it (will throw if invalid)
        val creature = Creature(
            id = UUID.randomUUID(),
            name = name,
            type = type,
            currentHp = currentHp,
            maxHp = maxHp,
            initiative = initiative,
            armorClass = armorClass
        )

        val event = CreatureAdded(
            battleId = battleId,
            eventId = UUID.randomUUID(),
            timestamp = Instant.now(),
            userId = userId,
            creatureId = creature.id,
            name = creature.name,
            type = creature.type,
            currentHp = creature.currentHp,
            maxHp = creature.maxHp,
            initiative = creature.initiative,
            armorClass = creature.armorClass
        )

        applyEvent(event)
        return this
    }

    /**
     * Get all creatures in this battle.
     */
    fun getCreatures(): List<Creature> = creatures.toList()

    /**
     * Find a creature by ID.
     * @return Creature if found, null otherwise
     */
    fun getCreature(creatureId: UUID): Creature? {
        return creatures.find { it.id == creatureId }
    }

    /**
     * Update a creature's attributes.
     *
     * Business rules:
     * - Creature must exist in this battle
     * - New attributes must be valid (validated by Creature value object)
     * - Can be called before or during combat
     *
     * @throws IllegalArgumentException if creature not found or attributes invalid
     */
    fun updateCreature(
        userId: UUID,
        creatureId: UUID,
        name: String,
        currentHp: Int,
        maxHp: Int,
        initiative: Int,
        armorClass: Int
    ): Battle {
        // Find existing creature
        val existingCreature = creatures.find { it.id == creatureId }
            ?: throw IllegalArgumentException("Creature not found: $creatureId")

        // Validate new attributes by creating a new Creature (will throw if invalid)
        val updatedCreature = Creature(
            id = creatureId,
            name = name,
            type = existingCreature.type, // Type cannot be changed
            currentHp = currentHp,
            maxHp = maxHp,
            initiative = initiative,
            armorClass = armorClass
        )

        // Emit event
        val event = CreatureUpdated(
            battleId = battleId,
            eventId = UUID.randomUUID(),
            timestamp = Instant.now(),
            userId = userId,
            creatureId = creatureId,
            name = name,
            type = existingCreature.type,
            currentHp = currentHp,
            maxHp = maxHp,
            initiative = initiative,
            armorClass = armorClass
        )

        applyEvent(event)
        return this
    }

    /**
     * Remove a creature from the battle.
     *
     * Business rules:
     * - Creature must exist in this battle
     * - Can be called before or during combat
     *
     * @throws IllegalArgumentException if creature not found
     */
    fun removeCreature(userId: UUID, creatureId: UUID): Battle {
        // Find existing creature
        val existingCreature = creatures.find { it.id == creatureId }
            ?: throw IllegalArgumentException("Creature not found: $creatureId")

        // Emit event
        val event = CreatureRemoved(
            battleId = battleId,
            eventId = UUID.randomUUID(),
            timestamp = Instant.now(),
            userId = userId,
            creatureId = creatureId
        )

        applyEvent(event)
        return this
    }

    // === Event Application Logic ===

    /**
     * Apply an event to update aggregate state.
     * Called both during event generation (new events) and replay (historical events).
     *
     * This is where the aggregate's state machine lives.
     * Each event type has specific state transitions.
     *
     * @param event The event to apply
     * @param isReplay True if replaying historical events, false if generating new event
     */
    private fun applyEvent(event: BattleEvent, isReplay: Boolean = false) {
        when (event) {
            is BattleCreated -> {
                battleId = event.battleId
                userId = event.userId
                name = event.name
                status = CombatStatus.NOT_STARTED
                createdAt = event.timestamp
                currentTurn = 0
                round = 0
            }

            is CombatStarted -> {
                status = CombatStatus.ACTIVE
                round = 1
                currentTurn = 0

                // Reorder creatures by initiative order from event
                if (event.initiativeOrder.isNotEmpty()) {
                    val orderedCreatures = event.initiativeOrder.mapNotNull { id ->
                        creatures.find { it.id == id }
                    }
                    creatures.clear()
                    creatures.addAll(orderedCreatures)
                }
            }

            is CombatPaused -> {
                status = CombatStatus.PAUSED
                // All other state preserved
            }

            is CombatResumed -> {
                status = CombatStatus.ACTIVE
                // All other state preserved
            }

            is CombatEnded -> {
                status = CombatStatus.ENDED
                // Remove monsters specified in event
                if (event.removedMonsterIds.isNotEmpty()) {
                    creatures.removeIf { it.id in event.removedMonsterIds }
                }
                // TODO: Clear status effects (User Story 7)
                // TODO: Clear combat log (User Story 5)
            }

            is CreatureAdded -> {
                val creature = Creature(
                    id = event.creatureId,
                    name = event.name,
                    type = event.type,
                    currentHp = event.currentHp,
                    maxHp = event.maxHp,
                    initiative = event.initiative,
                    armorClass = event.armorClass
                )
                creatures.add(creature)
            }

            is CreatureUpdated -> {
                // Find the index of the creature to update
                val index = creatures.indexOfFirst { it.id == event.creatureId }
                if (index != -1) {
                    // Create updated creature and replace in list
                    val updatedCreature = Creature(
                        id = event.creatureId,
                        name = event.name,
                        type = event.type,
                        currentHp = event.currentHp,
                        maxHp = event.maxHp,
                        initiative = event.initiative,
                        armorClass = event.armorClass
                    )
                    creatures[index] = updatedCreature
                }
            }

            is CreatureRemoved -> {
                creatures.removeIf { it.id == event.creatureId }
            }

            is TurnAdvanced -> {
                currentTurn = event.newTurn
                round = event.newRound
            }

            is DamageApplied -> {
                val index = creatures.indexOfFirst { it.id == event.targetCreatureId }
                if (index != -1) {
                    creatures[index] = creatures[index].withHp(event.remainingHp)
                }
            }

            is CreatureDefeated -> {
                // State already updated by DamageApplied (HP = 0).
                // This event exists for audit trail / combat log purposes.
            }
        }

        // Update lastModified timestamp
        lastModified = event.timestamp

        // If generating new event (not replay), add to uncommitted events
        if (!isReplay) {
            uncommittedEvents.add(event)
        }
    }
}
