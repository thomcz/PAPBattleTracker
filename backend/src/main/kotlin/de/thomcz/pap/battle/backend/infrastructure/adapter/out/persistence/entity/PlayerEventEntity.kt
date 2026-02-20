package de.thomcz.pap.battle.backend.infrastructure.adapter.out.persistence.entity

import jakarta.persistence.*
import java.time.Instant
import java.util.UUID

/**
 * JPA entity for storing player events in H2 database.
 *
 * Follows the same pattern as EventEntity (for battles) but
 * stores player aggregate events in a separate table.
 */
@Entity
@Table(
    name = "player_events",
    indexes = [
        Index(name = "idx_player_events_player_id", columnList = "player_id"),
        Index(name = "idx_player_events_sequence", columnList = "player_id,sequence_number")
    ],
    uniqueConstraints = [
        UniqueConstraint(name = "uk_player_sequence", columnNames = ["player_id", "sequence_number"])
    ]
)
class PlayerEventEntity(
    @Id
    @Column(name = "event_id", nullable = false)
    var eventId: UUID? = null,

    @Column(name = "player_id", nullable = false)
    var playerId: UUID? = null,

    @Column(name = "event_type", nullable = false, length = 100)
    var eventType: String? = null,

    @Column(name = "event_data", nullable = false, columnDefinition = "TEXT")
    var eventData: String? = null,

    @Column(name = "sequence_number", nullable = false)
    var sequenceNumber: Int? = null,

    @Column(name = "timestamp", nullable = false)
    var timestamp: Instant? = null,

    @Column(name = "user_id", nullable = false)
    var userId: UUID? = null
) {
    constructor() : this(null, null, null, null, null, null, null)
}
