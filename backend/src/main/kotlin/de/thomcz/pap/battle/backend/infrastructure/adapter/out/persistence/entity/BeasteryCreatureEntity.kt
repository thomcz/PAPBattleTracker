package de.thomcz.pap.battle.backend.infrastructure.adapter.out.persistence.entity

import jakarta.persistence.*
import java.time.Instant
import java.util.UUID

@Entity
@Table(
    name = "beastery_creatures",
    indexes = [
        Index(name = "idx_beastery_creatures_user_id", columnList = "user_id"),
        Index(name = "idx_beastery_creatures_deleted", columnList = "user_id,is_deleted")
    ]
)
class BeasteryCreatureEntity(
    @Id
    @Column(name = "creature_id", nullable = false)
    var creatureId: UUID? = null,

    @Column(name = "user_id", nullable = false)
    var userId: UUID? = null,

    @Column(name = "name", nullable = false, length = 100)
    var name: String? = null,

    @Column(name = "hit_points", nullable = false)
    var hitPoints: Int = 1,

    @Column(name = "armor_class", nullable = false)
    var armorClass: Int = 0,

    @Column(name = "is_deleted", nullable = false)
    var isDeleted: Boolean = false,

    @Column(name = "created_at", nullable = false)
    var createdAt: Instant? = null,

    @Column(name = "last_modified", nullable = false)
    var lastModified: Instant? = null,

    @Column(name = "event_count", nullable = false)
    var eventCount: Int = 0
) {
    constructor() : this(null, null, null, 1, 0, false, null, null, 0)
}
