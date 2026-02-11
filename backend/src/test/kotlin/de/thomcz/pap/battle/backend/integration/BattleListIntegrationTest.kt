package de.thomcz.pap.battle.backend.integration

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.http.HttpStatus

/**
 * Integration test for GET /api/battles (list battles).
 *
 * Tests:
 * - List all battles for authenticated user
 * - Filter by status
 * - Pagination support
 * - Empty list when no battles exist
 *
 * TDD: This test will FAIL initially until we implement:
 * - ListBattlesUseCase
 * - BattleController GET /api/battles endpoint
 */
class BattleListIntegrationTest : BaseIntegrationTest() {

    @Test
    fun `should list all battles for authenticated user`() {
        // Given: User with two battles
        val token = createAuthenticatedUser()
        createBattle(token, "Battle 1")
        createBattle(token, "Battle 2")

        // When: GET /api/battles
        val response = authenticatedGet(
            "/api/battles",
            token,
            Map::class.java
        )

        // Then: Returns list with both battles
        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)

        val body = response.body as Map<*, *>
        val battles = body["battles"] as List<*>

        assertThat(battles).hasSize(2)
        assertThat(battles.map { (it as Map<*, *>)["name"] })
            .containsExactlyInAnyOrder("Battle 1", "Battle 2")
    }

    @Test
    fun `should return empty list when user has no battles`() {
        // Given: Authenticated user with no battles
        val token = createAuthenticatedUser()

        // When: GET /api/battles
        val response = authenticatedGet(
            "/api/battles",
            token,
            Map::class.java
        )

        // Then: Returns empty list
        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)

        val body = response.body as Map<*, *>
        val battles = body["battles"] as List<*>

        assertThat(battles).isEmpty()
    }

    @Test
    fun `should only return battles for current user`() {
        // Given: Two users with battles
        val token1 = createAuthenticatedUser()
        val token2 = createAuthenticatedUser()

        createBattle(token1, "User 1 Battle")
        createBattle(token2, "User 2 Battle")

        // When: User 1 lists battles
        val response = authenticatedGet(
            "/api/battles",
            token1,
            Map::class.java
        )

        // Then: Returns only User 1's battle
        val body = response.body as Map<*, *>
        val battles = body["battles"] as List<*>

        assertThat(battles).hasSize(1)
        assertThat((battles[0] as Map<*, *>)["name"]).isEqualTo("User 1 Battle")
    }

    @Test
    fun `should filter battles by status`() {
        // Given: User with battles in different states
        val token = createAuthenticatedUser()
        val battleId = createBattle(token, "Active Battle")

        // Start combat to change status to ACTIVE
        authenticatedPost(
            "/api/battles/$battleId/start",
            token,
            emptyMap<String, Any>(),
            Map::class.java
        )

        createBattle(token, "Inactive Battle") // Status: NOT_STARTED

        // When: Filter by ACTIVE status
        val response = authenticatedGet(
            "/api/battles?status=ACTIVE",
            token,
            Map::class.java
        )

        // Then: Returns only active battle
        val body = response.body as Map<*, *>
        val battles = body["battles"] as List<*>

        assertThat(battles).hasSize(1)
        assertThat((battles[0] as Map<*, *>)["status"]).isEqualTo("ACTIVE")
    }

    /**
     * Helper: Create a battle and return its ID.
     */
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
