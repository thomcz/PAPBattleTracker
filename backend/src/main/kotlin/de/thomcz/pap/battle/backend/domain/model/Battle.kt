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
    fun startCombat(userId: UUID) {
        require(status == CombatStatus.NOT_STARTED) {
            "Cannot start combat: battle is in $status status"
        }

        // TODO: Validate at least one creature exists (User Story 2)
        // For now, allow starting without creatures for testing

        val event = CombatStarted(
            battleId = battleId,
            eventId = UUID.randomUUID(),
            timestamp = Instant.now(),
            userId = userId,
            initiativeOrder = emptyList() // TODO: Sort creatures by initiative (User Story 2)
        )

        applyEvent(event)
    }

    /**
     * Pause active combat.
     *
     * Business rules:
     * - Status must be ACTIVE
     *
     * @throws IllegalStateException if preconditions not met
     */
    fun pauseCombat(userId: UUID) {
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
    }

    /**
     * Resume paused combat.
     *
     * Business rules:
     * - Status must be PAUSED
     *
     * @throws IllegalStateException if preconditions not met
     */
    fun resumeCombat(userId: UUID) {
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
    fun endCombat(userId: UUID, outcome: CombatOutcome) {
        require(status == CombatStatus.ACTIVE || status == CombatStatus.PAUSED) {
            "Cannot end combat: battle is in $status status"
        }

        val event = CombatEnded(
            battleId = battleId,
            eventId = UUID.randomUUID(),
            timestamp = Instant.now(),
            userId = userId,
            outcome = outcome
        )

        applyEvent(event)
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
                // TODO: Sort creatures by initiative (User Story 2)
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
                // TODO: Remove MONSTER creatures (User Story 2)
                // TODO: Clear status effects (User Story 7)
                // TODO: Clear combat log (User Story 5)
            }

            else -> {
                // Future events from User Story 2+ will be handled here
                // For now, ignore unknown events gracefully
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
