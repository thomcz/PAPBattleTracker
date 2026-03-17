package de.thomcz.pap.battle.backend.integration

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.http.HttpStatus

/**
 * Integration test for POST /api/battles/{id}/start (start combat).
 *
 * Tests:
 * - Starting combat changes status to ACTIVE
 * - CombatStarted event is persisted
 * - Round set to 1, currentTurn set to 0
 * - Cannot start combat twice
 * - Cannot start combat without creatures (future: User Story 2)
 *
 * TDD: This test will FAIL initially until we implement:
 * - CombatStarted event
 * - Battle.startCombat() method
 * - StartCombatUseCase
 * - BattleController POST /api/battles/{id}/start endpoint
 */
class StartCombatIntegrationTest : BaseIntegrationTest() {

    @Test
    fun `should start combat and emit CombatStarted event`() {
        // Given: Battle in NOT_STARTED status with at least one creature
        val token = createAuthenticatedUser()
        val battleId = createBattle(token, "Combat Test")
        addDefaultCreature(battleId, token)

        // When: POST /api/battles/{id}/start
        val response = authenticatedPost(
            "/api/battles/$battleId/start",
            token,
            emptyMap<String, Any>(),
            Map::class.java
        )

        // Then: Combat started successfully
        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)

        val body = response.body as Map<*, *>
        assertThat(body["status"]).isEqualTo("ACTIVE")
        assertThat(body["round"]).isEqualTo(1)
        assertThat(body["currentTurn"]).isEqualTo(0)
    }

    @Test
    fun `should reject starting combat when already active`() {
        // Given: Battle with active combat
        val token = createAuthenticatedUser()
        val battleId = createBattle(token, "Already Active")
        addDefaultCreature(battleId, token)

        authenticatedPost(
            "/api/battles/$battleId/start",
            token,
            emptyMap<String, Any>(),
            Map::class.java
        )

        // When: Try to start again
        val response = authenticatedPost(
            "/api/battles/$battleId/start",
            token,
            emptyMap<String, Any>(),
            Map::class.java
        )

        // Then: Conflict
        assertThat(response.statusCode).isEqualTo(HttpStatus.CONFLICT)
    }

    @Test
    fun `should reject starting combat for non-existent battle`() {
        // Given: Authenticated user
        val token = createAuthenticatedUser()
        val nonExistentId = java.util.UUID.randomUUID()

        // When: POST /api/battles/{nonExistentId}/start
        val response = authenticatedPost(
            "/api/battles/$nonExistentId/start",
            token,
            emptyMap<String, Any>(),
            Map::class.java
        )

        // Then: Not found
        assertThat(response.statusCode).isEqualTo(HttpStatus.NOT_FOUND)
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
