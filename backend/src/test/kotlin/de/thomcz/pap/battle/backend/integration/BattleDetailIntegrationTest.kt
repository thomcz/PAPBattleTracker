package de.thomcz.pap.battle.backend.integration

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.http.HttpStatus

/**
 * Integration test for GET /api/battles/{id} (get battle detail).
 *
 * Tests:
 * - Retrieve detailed battle information
 * - Include creatures, combat log, turn/round data
 * - 404 for non-existent battle
 * - 403 when accessing another user's battle
 *
 * TDD: This test will FAIL initially until we implement:
 * - GetBattleUseCase
 * - BattleController GET /api/battles/{id} endpoint
 */
class BattleDetailIntegrationTest : BaseIntegrationTest() {

    @Test
    fun `should retrieve battle detail by ID`() {
        // Given: User creates a battle
        val token = createAuthenticatedUser()
        val battleId = createBattle(token, "Detailed Battle")

        // When: GET /api/battles/{id}
        val response = authenticatedGet(
            "/api/battles/$battleId",
            token,
            Map::class.java
        )

        // Then: Returns detailed battle data
        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)

        val body = response.body as Map<*, *>
        assertThat(body["id"]).isEqualTo(battleId)
        assertThat(body["name"]).isEqualTo("Detailed Battle")
        assertThat(body["status"]).isEqualTo("NOT_STARTED")
        assertThat(body["creatures"]).isNotNull()
        assertThat(body["currentTurn"]).isNotNull()
        assertThat(body["round"]).isNotNull()
    }

    @Test
    fun `should return 404 for non-existent battle`() {
        // Given: Authenticated user
        val token = createAuthenticatedUser()
        val nonExistentId = java.util.UUID.randomUUID()

        // When: GET /api/battles/{nonExistentId}
        val response = authenticatedGet(
            "/api/battles/$nonExistentId",
            token,
            Map::class.java
        )

        // Then: Not found
        assertThat(response.statusCode).isEqualTo(HttpStatus.NOT_FOUND)
    }

    @Test
    fun `should return 403 when accessing another user's battle`() {
        // Given: Two users, one creates a battle
        val token1 = createAuthenticatedUser()
        val token2 = createAuthenticatedUser()

        val battleId = createBattle(token1, "User 1 Battle")

        // When: User 2 tries to access User 1's battle
        val response = authenticatedGet(
            "/api/battles/$battleId",
            token2,
            Map::class.java
        )

        // Then: Forbidden
        assertThat(response.statusCode).isEqualTo(HttpStatus.FORBIDDEN)
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
