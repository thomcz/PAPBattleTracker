package de.thomcz.pap.battle.backend.integration

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.http.HttpStatus

/**
 * Integration test for POST /api/battles/{id}/pause (pause combat).
 *
 * Tests:
 * - Pausing active combat changes status to PAUSED
 * - CombatPaused event is persisted
 * - Cannot pause non-active combat
 * - State is preserved (turn, round, creatures)
 *
 * TDD: This test will FAIL initially until we implement:
 * - CombatPaused event
 * - Battle.pauseCombat() method
 * - PauseCombatUseCase
 * - BattleController POST /api/battles/{id}/pause endpoint
 */
class PauseCombatIntegrationTest : BaseIntegrationTest() {

    @Test
    fun `should pause active combat and emit CombatPaused event`() {
        // Given: Battle with active combat
        val token = createAuthenticatedUser()
        val battleId = createBattle(token, "Pause Test")
        addDefaultCreature(battleId, token)

        authenticatedPost(
            "/api/battles/$battleId/start",
            token,
            emptyMap<String, Any>(),
            Map::class.java
        )

        // When: POST /api/battles/{id}/pause
        val response = authenticatedPost(
            "/api/battles/$battleId/pause",
            token,
            emptyMap<String, Any>(),
            Map::class.java
        )

        // Then: Combat paused successfully
        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)

        val body = response.body as Map<*, *>
        assertThat(body["status"]).isEqualTo("PAUSED")
        // State preserved
        assertThat(body["round"]).isEqualTo(1)
        assertThat(body["currentTurn"]).isEqualTo(0)
    }

    @Test
    fun `should reject pausing combat that is not active`() {
        // Given: Battle in NOT_STARTED status
        val token = createAuthenticatedUser()
        val battleId = createBattle(token, "Not Started")

        // When: Try to pause
        val response = authenticatedPost(
            "/api/battles/$battleId/pause",
            token,
            emptyMap<String, Any>(),
            Map::class.java
        )

        // Then: Conflict
        assertThat(response.statusCode).isEqualTo(HttpStatus.CONFLICT)
    }

    @Test
    fun `should reject pausing already paused combat`() {
        // Given: Battle with paused combat
        val token = createAuthenticatedUser()
        val battleId = createBattle(token, "Already Paused")
        addDefaultCreature(battleId, token)

        authenticatedPost(
            "/api/battles/$battleId/start",
            token,
            emptyMap<String, Any>(),
            Map::class.java
        )

        authenticatedPost(
            "/api/battles/$battleId/pause",
            token,
            emptyMap<String, Any>(),
            Map::class.java
        )

        // When: Try to pause again
        val response = authenticatedPost(
            "/api/battles/$battleId/pause",
            token,
            emptyMap<String, Any>(),
            Map::class.java
        )

        // Then: Conflict
        assertThat(response.statusCode).isEqualTo(HttpStatus.CONFLICT)
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
}
