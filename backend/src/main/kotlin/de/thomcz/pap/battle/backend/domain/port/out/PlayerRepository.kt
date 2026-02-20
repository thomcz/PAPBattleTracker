package de.thomcz.pap.battle.backend.domain.port.out

import de.thomcz.pap.battle.backend.domain.model.Player
import java.util.UUID

/**
 * Port interface for player aggregate persistence and querying.
 *
 * In event sourcing, this repository manages player *metadata* (for querying),
 * while the PlayerEventStore handles the actual state through events.
 */
interface PlayerRepository {
    fun findById(playerId: UUID): Player?
    fun findByUserId(userId: UUID): List<Player>
    fun save(player: Player)
    fun deleteById(playerId: UUID)
}
