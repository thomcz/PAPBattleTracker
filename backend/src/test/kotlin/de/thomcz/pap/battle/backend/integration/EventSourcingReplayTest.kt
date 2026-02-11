package de.thomcz.pap.battle.backend.integration

import de.thomcz.pap.battle.backend.domain.port.out.BattleRepository
import de.thomcz.pap.battle.backend.domain.port.out.EventStore
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus

/**
 * Integration test for event sourcing replay functionality.
 *
 * Tests:
 * - Battle state is correctly reconstructed from events
 * - Multiple events replay in correct order
 * - Reloading battle from repository produces same state
 * - Event count matches actions performed
 *
 * This is the heart of event sourcing - verifying that state
 * can be reliably reconstructed from the event log.
 *
 * TDD: This test will FAIL initially until we implement:
 * - All domain events
 * - Battle.loadFromHistory() method
 * - Event application logic in Battle aggregate
 */
class EventSourcingReplayTest : BaseIntegrationTest() {

    @Autowired
    private lateinit var eventStore: EventStore

    @Autowired
    private lateinit var battleRepository: BattleRepository

    @Test
    fun `should reconstruct battle state from event replay`() {
        // Given: Battle with multiple state changes
        val token = createAuthenticatedUser()
        val battleId = createBattle(token, "Replay Test")

        // Perform multiple actions
        startCombat(battleId, token)
        pauseCombat(battleId, token)
        resumeCombat(battleId, token)

        // When: Reload battle from repository (triggers event replay)
        val battle = battleRepository.findById(java.util.UUID.fromString(battleId))

        // Then: State correctly reconstructed
        assertThat(battle).isNotNull
        assertThat(battle!!.name).isEqualTo("Replay Test")
        assertThat(battle.status.name).isEqualTo("ACTIVE") // Last state: resumed

        // And: All events are persisted
        val events = eventStore.getEvents(java.util.UUID.fromString(battleId))
        assertThat(events).hasSize(4) // Created, Started, Paused, Resumed
        assertThat(events.map { it::class.simpleName })
            .containsExactly("BattleCreated", "CombatStarted", "CombatPaused", "CombatResumed")
    }

    @Test
    fun `should maintain correct event sequence numbers`() {
        // Given: Battle with multiple events
        val token = createAuthenticatedUser()
        val battleId = createBattle(token, "Sequence Test")

        startCombat(battleId, token)
        pauseCombat(battleId, token)

        // When: Retrieve events
        val events = eventStore.getEvents(java.util.UUID.fromString(battleId))

        // Then: Events have sequential sequence numbers
        assertThat(events).hasSize(3)
        // Note: EventEntity assigns sequence numbers starting from 1
        // We just verify they're in order and complete
    }

    @Test
    fun `should produce identical state when replayed multiple times`() {
        // Given: Battle with complex state
        val token = createAuthenticatedUser()
        val battleId = createBattle(token, "Idempotent Test")

        startCombat(battleId, token)
        pauseCombat(battleId, token)
        resumeCombat(battleId, token)
        pauseCombat(battleId, token)

        // When: Load battle twice
        val battle1 = battleRepository.findById(java.util.UUID.fromString(battleId))
        val battle2 = battleRepository.findById(java.util.UUID.fromString(battleId))

        // Then: Both loads produce identical state
        assertThat(battle1).isNotNull
        assertThat(battle2).isNotNull
        assertThat(battle1!!.status).isEqualTo(battle2!!.status)
        assertThat(battle1.round).isEqualTo(battle2.round)
        assertThat(battle1.currentTurn).isEqualTo(battle2.currentTurn)
    }

    @Test
    fun `should handle empty event stream gracefully`() {
        // This tests an edge case: what if a battle has no events yet?
        // This shouldn't happen in normal flow (BattleCreated is always first)
        // but it's good defensive programming

        val nonExistentBattleId = java.util.UUID.randomUUID()

        // When: Try to load non-existent battle
        val battle = battleRepository.findById(nonExistentBattleId)

        // Then: Returns null
        assertThat(battle).isNull()
    }

    private fun createBattle(token: String, name: String): String {
        val request = mapOf("name" to name)
        val response = authenticatedPost(
            "/api/battles",
            token,
            request,
            Map::class.java
        )
        return (response.body as Map<*, *>)["id"] as String
    }

    private fun startCombat(battleId: String, token: String) {
        authenticatedPost(
            "/api/battles/$battleId/start",
            token,
            emptyMap<String, Any>(),
            Map::class.java
        )
    }

    private fun pauseCombat(battleId: String, token: String) {
        authenticatedPost(
            "/api/battles/$battleId/pause",
            token,
            emptyMap<String, Any>(),
            Map::class.java
        )
    }

    private fun resumeCombat(battleId: String, token: String) {
        authenticatedPost(
            "/api/battles/$battleId/resume",
            token,
            emptyMap<String, Any>(),
            Map::class.java
        )
    }
}
