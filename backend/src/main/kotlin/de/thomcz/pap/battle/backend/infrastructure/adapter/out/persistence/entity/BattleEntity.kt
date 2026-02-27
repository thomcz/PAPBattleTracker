package de.thomcz.pap.battle.backend.infrastructure.adapter.out.persistence.entity

import jakarta.persistence.*
import java.time.Instant
import java.util.UUID

/**
 * JPA entity for storing battle metadata.
 *
 * This is NOT the source of truth for battle state (events are).
 * This entity stores queryable metadata for efficient listing and filtering.
 * The actual battle state is reconstructed from events via EventStore.
 *
 * Note: Uses regular class (not data class) with var properties to satisfy
 * JPA requirements for a no-arg constructor and mutable properties.
 */
@Entity
@Table(
    name = "battles",
    indexes = [
        Index(name = "idx_battles_user_id", columnList = "user_id"),
        Index(name = "idx_battles_status", columnList = "status"),
        Index(name = "idx_battles_created_at", columnList = "created_at"),
        Index(name = "idx_battles_session_id", columnList = "session_id")
    ]
)
class BattleEntity(
    @Id
    @Column(name = "battle_id", nullable = false)
    var battleId: UUID? = null,

    @Column(name = "user_id", nullable = false)
    var userId: UUID? = null,

    @Column(name = "session_id", nullable = true)
    var sessionId: UUID? = null,

    @Column(name = "name", nullable = false, length = 255)
    var name: String? = null,

    @Column(name = "status", nullable = false, length = 50)
    var status: String? = null, // CombatStatus enum value

    @Column(name = "created_at", nullable = false)
    var createdAt: Instant? = null,

    @Column(name = "last_modified", nullable = false)
    var lastModified: Instant? = null,

    @Column(name = "event_count", nullable = false)
    var eventCount: Int = 0
) {
    // No-arg constructor for JPA
    constructor() : this(null, null, null, null, null, null, null, 0)
}
