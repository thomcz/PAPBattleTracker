package de.thomcz.pap.battle.backend.infrastructure.adapter.out.persistence.entity

import jakarta.persistence.*
import java.time.Instant
import java.util.UUID

@Entity
@Table(
    name = "beastery_creature_events",
    indexes = [
        Index(name = "idx_beastery_creature_events_creature_id", columnList = "creature_id"),
        Index(name = "idx_beastery_creature_events_sequence", columnList = "creature_id,sequence_number")
    ],
    uniqueConstraints = [
        UniqueConstraint(name = "uk_beastery_creature_sequence", columnNames = ["creature_id", "sequence_number"])
    ]
)
class BeasteryCreatureEventEntity(
    @Id
    @Column(name = "event_id", nullable = false)
    var eventId: UUID? = null,

    @Column(name = "creature_id", nullable = false)
    var creatureId: UUID? = null,

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
