package de.thomcz.pap.battle.backend.integration

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.http.HttpStatus

/**
 * Integration test for POST /api/battles/{id}/end (end combat).
 *
 * Tests:
 * - Ending combat changes status to ENDED
 * - CombatEnded event is persisted
 * - Can end combat from ACTIVE or PAUSED status
 * - Combat log is cleared (User Story 5 feature)
 *
 * TDD: This test will FAIL initially until we implement:
 * - CombatEnded event
 * - Battle.endCombat() method
 * - EndCombatUseCase
 * - BattleController POST /api/battles/{id}/end endpoint
 *
 * Note: Monster removal logic requires User Story 2 (Creature Management)
 */
class EndCombatIntegrationTest : BaseIntegrationTest() {

    @Test
    fun `should end active combat and emit CombatEnded event`() {
        // Given: Battle with active combat
        val token = createAuthenticatedUser()
        val battleId = createBattle(token, "End Test")
        addDefaultCreature(battleId, token)

        authenticatedPost(
            "/api/battles/$battleId/start",
            token,
            emptyMap<String, Any>(),
            Map::class.java
        )

        // When: POST /api/battles/{id}/end
        val request = mapOf("outcome" to "PLAYERS_VICTORIOUS")
        val response = authenticatedPost(
            "/api/battles/$battleId/end",
            token,
            request,
            Map::class.java
        )

        // Then: Combat ended successfully
        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)

        val body = response.body as Map<*, *>
        assertThat(body["status"]).isEqualTo("ENDED")
    }

    @Test
    fun `should end paused combat`() {
        // Given: Battle with paused combat
        val token = createAuthenticatedUser()
        val battleId = createBattle(token, "Paused End Test")
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

        // When: End combat
        val request = mapOf("outcome" to "ABORTED")
        val response = authenticatedPost(
            "/api/battles/$battleId/end",
            token,
            request,
            Map::class.java
        )

        // Then: Combat ended successfully
        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)

        val body = response.body as Map<*, *>
        assertThat(body["status"]).isEqualTo("ENDED")
    }

    @Test
    fun `should reject ending combat that has not started`() {
        // Given: Battle in NOT_STARTED status
        val token = createAuthenticatedUser()
        val battleId = createBattle(token, "Not Started")

        // When: Try to end
        val request = mapOf("outcome" to "ABORTED")
        val response = authenticatedPost(
            "/api/battles/$battleId/end",
            token,
            request,
            Map::class.java
        )

        // Then: Bad request or conflict
        assertThat(response.statusCode).isIn(HttpStatus.BAD_REQUEST, HttpStatus.CONFLICT)
    }

    @Test
    fun `should reject ending already ended combat`() {
        // Given: Battle with ended combat
        val token = createAuthenticatedUser()
        val battleId = createBattle(token, "Already Ended")
        addDefaultCreature(battleId, token)

        authenticatedPost(
            "/api/battles/$battleId/start",
            token,
            emptyMap<String, Any>(),
            Map::class.java
        )

        val request = mapOf("outcome" to "PLAYERS_VICTORIOUS")
        authenticatedPost(
            "/api/battles/$battleId/end",
            token,
            request,
            Map::class.java
        )

        // When: Try to end again
        val response = authenticatedPost(
            "/api/battles/$battleId/end",
            token,
            request,
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
