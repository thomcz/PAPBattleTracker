package de.thomcz.pap.battle.backend.domain.model

import de.thomcz.pap.battle.backend.domain.model.events.*
import java.time.Instant
import java.util.UUID

/**
 * Player aggregate root - represents a reusable player character template.
 *
 * Event-sourced aggregate:
 * - State derived from replaying events (not stored directly)
 * - All state changes emit events
 * - Events are immutable once created
 * - Business rules enforced before emitting events
 *
 * Players are scoped to a user and can be added to any of that user's battles.
 */
class Player private constructor() {
    // === Aggregate Identity ===
    var playerId: UUID = UUID.randomUUID()
        private set
    var userId: UUID = UUID.randomUUID()
        private set

    // === Derived State ===
    var name: String = ""
        private set
    var characterClass: String = ""
        private set
    var level: Int = 1
        private set
    var maxHp: Int = 1
        private set
    var isDeleted: Boolean = false
        private set
    var createdAt: Instant = Instant.now()
        private set
    var lastModified: Instant = Instant.now()
        private set

    // === Event Sourcing Infrastructure ===
    private val uncommittedEvents: MutableList<PlayerEvent> = mutableListOf()

    fun getUncommittedEvents(): List<PlayerEvent> = uncommittedEvents.toList()

    fun markEventsAsCommitted() {
        uncommittedEvents.clear()
    }

    fun loadFromHistory(events: List<PlayerEvent>): Player {
        events.forEach { event ->
            applyEvent(event, isReplay = true)
        }
        return this
    }

    // === Factory Methods ===

    companion object {
        fun newInstance(): Player = Player()

        /**
         * Create a new player (factory method that emits PlayerCreated event).
         *
         * @param userId The Game Master creating the player
         * @param name Character name (1-100 chars)
         * @param characterClass Character class (1-50 chars, e.g. "Fighter", "Wizard")
         * @param level Character level (1-20)
         * @param maxHp Maximum hit points (1-999)
         */
        fun create(
            userId: UUID,
            name: String,
            characterClass: String,
            level: Int,
            maxHp: Int
        ): Player {
            require(name.isNotBlank()) { "Player name cannot be blank" }
            require(name.length <= 100) { "Player name cannot exceed 100 characters" }
            require(characterClass.isNotBlank()) { "Character class cannot be blank" }
            require(characterClass.length <= 50) { "Character class cannot exceed 50 characters" }
            require(level in 1..20) { "Level must be between 1 and 20" }
            require(maxHp in 1..999) { "Max HP must be between 1 and 999" }

            val player = Player()
            val event = PlayerCreated(
                playerId = UUID.randomUUID(),
                eventId = UUID.randomUUID(),
                timestamp = Instant.now(),
                userId = userId,
                name = name.trim(),
                characterClass = characterClass.trim(),
                level = level,
                maxHp = maxHp
            )

            player.applyEvent(event)
            return player
        }
    }

    // === Business Logic Methods ===

    /**
     * Update player attributes.
     *
     * Business rules:
     * - Player must not be deleted
     * - All validation rules apply to new values
     */
    fun update(
        userId: UUID,
        name: String,
        characterClass: String,
        level: Int,
        maxHp: Int
    ): Player {
        check(!isDeleted) { "Cannot update a deleted player" }
        require(name.isNotBlank()) { "Player name cannot be blank" }
        require(name.length <= 100) { "Player name cannot exceed 100 characters" }
        require(characterClass.isNotBlank()) { "Character class cannot be blank" }
        require(characterClass.length <= 50) { "Character class cannot exceed 50 characters" }
        require(level in 1..20) { "Level must be between 1 and 20" }
        require(maxHp in 1..999) { "Max HP must be between 1 and 999" }

        val event = PlayerUpdated(
            playerId = playerId,
            eventId = UUID.randomUUID(),
            timestamp = Instant.now(),
            userId = userId,
            name = name.trim(),
            characterClass = characterClass.trim(),
            level = level,
            maxHp = maxHp
        )

        applyEvent(event)
        return this
    }

    /**
     * Soft-delete the player.
     *
     * Business rules:
     * - Player must not already be deleted
     */
    fun delete(userId: UUID): Player {
        check(!isDeleted) { "Player is already deleted" }

        val event = PlayerDeleted(
            playerId = playerId,
            eventId = UUID.randomUUID(),
            timestamp = Instant.now(),
            userId = userId
        )

        applyEvent(event)
        return this
    }

    // === Event Application Logic ===

    private fun applyEvent(event: PlayerEvent, isReplay: Boolean = false) {
        when (event) {
            is PlayerCreated -> {
                playerId = event.playerId
                userId = event.userId
                name = event.name
                characterClass = event.characterClass
                level = event.level
                maxHp = event.maxHp
                isDeleted = false
                createdAt = event.timestamp
            }

            is PlayerUpdated -> {
                name = event.name
                characterClass = event.characterClass
                level = event.level
                maxHp = event.maxHp
            }

            is PlayerDeleted -> {
                isDeleted = true
            }
        }

        lastModified = event.timestamp

        if (!isReplay) {
            uncommittedEvents.add(event)
        }
    }
}
