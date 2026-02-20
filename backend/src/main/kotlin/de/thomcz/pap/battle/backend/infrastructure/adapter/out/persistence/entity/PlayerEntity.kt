package de.thomcz.pap.battle.backend.infrastructure.adapter.out.persistence.entity

import jakarta.persistence.*
import java.time.Instant
import java.util.UUID

/**
 * JPA entity for storing player metadata.
 *
 * This is NOT the source of truth for player state (events are).
 * This entity stores queryable metadata for efficient listing and filtering.
 */
@Entity
@Table(
    name = "players",
    indexes = [
        Index(name = "idx_players_user_id", columnList = "user_id"),
        Index(name = "idx_players_deleted", columnList = "user_id,is_deleted")
    ]
)
class PlayerEntity(
    @Id
    @Column(name = "player_id", nullable = false)
    var playerId: UUID? = null,

    @Column(name = "user_id", nullable = false)
    var userId: UUID? = null,

    @Column(name = "name", nullable = false, length = 100)
    var name: String? = null,

    @Column(name = "character_class", nullable = false, length = 50)
    var characterClass: String? = null,

    @Column(name = "level", nullable = false)
    var level: Int = 1,

    @Column(name = "max_hp", nullable = false)
    var maxHp: Int = 1,

    @Column(name = "is_deleted", nullable = false)
    var isDeleted: Boolean = false,

    @Column(name = "created_at", nullable = false)
    var createdAt: Instant? = null,

    @Column(name = "last_modified", nullable = false)
    var lastModified: Instant? = null,

    @Column(name = "event_count", nullable = false)
    var eventCount: Int = 0
) {
    constructor() : this(null, null, null, null, 1, 1, false, null, null, 0)
}
