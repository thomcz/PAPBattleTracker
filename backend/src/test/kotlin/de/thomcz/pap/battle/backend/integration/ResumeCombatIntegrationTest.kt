package de.thomcz.pap.battle.backend.integration

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.http.HttpStatus

/**
 * Integration test for POST /api/battles/{id}/resume (resume combat).
 *
 * Tests:
 * - Resuming paused combat changes status back to ACTIVE
 * - CombatResumed event is persisted
 * - Cannot resume non-paused combat
 * - State remains preserved from pause
 *
 * TDD: This test will FAIL initially until we implement:
 * - CombatResumed event
 * - Battle.resumeCombat() method
 * - ResumeCombatUseCase
 * - BattleController POST /api/battles/{id}/resume endpoint
 */
class ResumeCombatIntegrationTest : BaseIntegrationTest() {

    @Test
    fun `should resume paused combat and emit CombatResumed event`() {
        // Given: Battle with paused combat
        val token = createAuthenticatedUser()
        val battleId = createBattle(token, "Resume Test")
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

        // When: POST /api/battles/{id}/resume
        val response = authenticatedPost(
            "/api/battles/$battleId/resume",
            token,
            emptyMap<String, Any>(),
            Map::class.java
        )

        // Then: Combat resumed successfully
        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)

        val body = response.body as Map<*, *>
        assertThat(body["status"]).isEqualTo("ACTIVE")
        // State preserved from before pause
        assertThat(body["round"]).isEqualTo(1)
        assertThat(body["currentTurn"]).isEqualTo(0)
    }

    @Test
    fun `should reject resuming combat that is not paused`() {
        // Given: Battle with active combat (not paused)
        val token = createAuthenticatedUser()
        val battleId = createBattle(token, "Active Battle")
        addDefaultCreature(battleId, token)

        authenticatedPost(
            "/api/battles/$battleId/start",
            token,
            emptyMap<String, Any>(),
            Map::class.java
        )

        // When: Try to resume
        val response = authenticatedPost(
            "/api/battles/$battleId/resume",
            token,
            emptyMap<String, Any>(),
            Map::class.java
        )

        // Then: Conflict
        assertThat(response.statusCode).isEqualTo(HttpStatus.CONFLICT)
    }

    @Test
    fun `should reject resuming combat that has not started`() {
        // Given: Battle in NOT_STARTED status
        val token = createAuthenticatedUser()
        val battleId = createBattle(token, "Not Started")

        // When: Try to resume
        val response = authenticatedPost(
            "/api/battles/$battleId/resume",
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
