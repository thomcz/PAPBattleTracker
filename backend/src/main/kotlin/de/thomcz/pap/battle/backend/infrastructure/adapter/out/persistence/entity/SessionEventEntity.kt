package de.thomcz.pap.battle.backend.infrastructure.adapter.out.persistence.entity

import jakarta.persistence.*
import java.time.Instant
import java.util.UUID

@Entity
@Table(
    name = "session_events",
    indexes = [
        Index(name = "idx_session_events_session_id", columnList = "session_id"),
        Index(name = "idx_session_events_sequence", columnList = "session_id,sequence_number")
    ],
    uniqueConstraints = [
        UniqueConstraint(name = "uk_session_sequence", columnNames = ["session_id", "sequence_number"])
    ]
)
class SessionEventEntity(
    @Id
    @Column(name = "event_id", nullable = false)
    var eventId: UUID? = null,

    @Column(name = "session_id", nullable = false)
    var sessionId: UUID? = null,

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
