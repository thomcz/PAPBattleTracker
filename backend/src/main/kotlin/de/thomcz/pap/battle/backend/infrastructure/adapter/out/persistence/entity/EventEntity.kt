package de.thomcz.pap.battle.backend.infrastructure.adapter.out.persistence.entity

import jakarta.persistence.*
import java.time.Instant
import java.util.UUID

/**
 * JPA entity for storing battle events in H2 database.
 *
 * Events are stored as JSON in the eventData column, with metadata fields
 * for efficient querying and ordering. The sequence_number ensures events
 * can be replayed in the correct order.
 *
 * Note: Uses regular class (not data class) with var properties to satisfy
 * JPA requirements for a no-arg constructor and mutable properties.
 */
@Entity
@Table(
    name = "events",
    indexes = [
        Index(name = "idx_events_battle_id", columnList = "battle_id"),
        Index(name = "idx_events_sequence", columnList = "battle_id,sequence_number")
    ],
    uniqueConstraints = [
        UniqueConstraint(name = "uk_battle_sequence", columnNames = ["battle_id", "sequence_number"])
    ]
)
class EventEntity(
    @Id
    @Column(name = "event_id", nullable = false)
    var eventId: UUID? = null,

    @Column(name = "battle_id", nullable = false)
    var battleId: UUID? = null,

    @Column(name = "event_type", nullable = false, length = 100)
    var eventType: String? = null,

    @Column(name = "event_data", nullable = false, columnDefinition = "TEXT")
    var eventData: String? = null, // JSON serialized event

    @Column(name = "sequence_number", nullable = false)
    var sequenceNumber: Int? = null,

    @Column(name = "timestamp", nullable = false)
    var timestamp: Instant? = null,

    @Column(name = "user_id", nullable = false)
    var userId: UUID? = null
) {
    // No-arg constructor for JPA
    constructor() : this(null, null, null, null, null, null, null)
}
