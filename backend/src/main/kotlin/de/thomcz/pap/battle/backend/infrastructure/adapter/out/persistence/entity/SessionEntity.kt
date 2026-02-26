package de.thomcz.pap.battle.backend.infrastructure.adapter.out.persistence.entity

import jakarta.persistence.*
import java.time.Instant
import java.util.UUID

@Entity
@Table(
    name = "sessions",
    indexes = [
        Index(name = "idx_sessions_user_id", columnList = "user_id"),
        Index(name = "idx_sessions_status", columnList = "user_id,status")
    ]
)
class SessionEntity(
    @Id
    @Column(name = "session_id", nullable = false)
    var sessionId: UUID? = null,

    @Column(name = "user_id", nullable = false)
    var userId: UUID? = null,

    @Column(name = "name", nullable = false, length = 100)
    var name: String? = null,

    @Column(name = "status", nullable = false, length = 20)
    var status: String? = null,

    @Column(name = "created_at", nullable = false)
    var createdAt: Instant? = null,

    @Column(name = "last_modified", nullable = false)
    var lastModified: Instant? = null,

    @Column(name = "event_count", nullable = false)
    var eventCount: Int = 0
) {
    constructor() : this(null, null, null, null, null, null, 0)
}
