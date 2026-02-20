package de.thomcz.pap.battle.backend.integration

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.http.HttpStatus

class PlayerIntegrationTest : BaseIntegrationTest() {

    // === Create Player ===

    @Test
    fun `should create player with valid attributes`() {
        val token = createAuthenticatedUser()

        val request = mapOf(
            "name" to "Thorin",
            "characterClass" to "Fighter",
            "level" to 5,
            "maxHp" to 45
        )

        val response = authenticatedPost("/api/players", token, request, Map::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.CREATED)
        val body = response.body as Map<*, *>
        assertThat(body["playerId"]).isNotNull()
        assertThat(body["name"]).isEqualTo("Thorin")
        assertThat(body["characterClass"]).isEqualTo("Fighter")
        assertThat(body["level"]).isEqualTo(5)
        assertThat(body["maxHp"]).isEqualTo(45)
        assertThat(body["isDeleted"]).isEqualTo(false)
    }

    @Test
    fun `should reject player creation without authentication`() {
        val request = mapOf(
            "name" to "Thorin",
            "characterClass" to "Fighter",
            "level" to 5,
            "maxHp" to 45
        )

        val response = restTemplate.postForEntity("/api/players", request, Map::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.UNAUTHORIZED)
    }

    @Test
    fun `should reject player creation with invalid data`() {
        val token = createAuthenticatedUser()

        val request = mapOf(
            "name" to "",
            "characterClass" to "Fighter",
            "level" to 5,
            "maxHp" to 45
        )

        val response = authenticatedPost("/api/players", token, request, Map::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.BAD_REQUEST)
    }

    // === List Players ===

    @Test
    fun `should list players for authenticated user`() {
        val token = createAuthenticatedUser()

        // Create two players
        authenticatedPost("/api/players", token, mapOf(
            "name" to "Thorin", "characterClass" to "Fighter", "level" to 5, "maxHp" to 45
        ), Map::class.java)
        authenticatedPost("/api/players", token, mapOf(
            "name" to "Gandalf", "characterClass" to "Wizard", "level" to 10, "maxHp" to 30
        ), Map::class.java)

        val response = authenticatedGet("/api/players", token, Map::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
        val body = response.body as Map<*, *>
        val players = body["players"] as List<*>
        assertThat(players).hasSize(2)
        assertThat(body["total"]).isEqualTo(2)
    }

    @Test
    fun `should not list other users players`() {
        val token1 = createAuthenticatedUser()
        val token2 = createAuthenticatedUser()

        authenticatedPost("/api/players", token1, mapOf(
            "name" to "Thorin", "characterClass" to "Fighter", "level" to 5, "maxHp" to 45
        ), Map::class.java)

        val response = authenticatedGet("/api/players", token2, Map::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
        val body = response.body as Map<*, *>
        val players = body["players"] as List<*>
        assertThat(players).hasSize(0)
    }

    @Test
    fun `should exclude deleted players by default`() {
        val token = createAuthenticatedUser()

        // Create and delete a player
        val createResponse = authenticatedPost("/api/players", token, mapOf(
            "name" to "Deleted", "characterClass" to "Rogue", "level" to 1, "maxHp" to 10
        ), Map::class.java)
        val playerId = (createResponse.body as Map<*, *>)["playerId"]

        authenticatedDelete("/api/players/$playerId", token, Void::class.java)

        // Create a non-deleted player
        authenticatedPost("/api/players", token, mapOf(
            "name" to "Active", "characterClass" to "Fighter", "level" to 5, "maxHp" to 45
        ), Map::class.java)

        val response = authenticatedGet("/api/players", token, Map::class.java)

        val body = response.body as Map<*, *>
        val players = body["players"] as List<*>
        assertThat(players).hasSize(1)
    }

    @Test
    fun `should include deleted players when requested`() {
        val token = createAuthenticatedUser()

        val createResponse = authenticatedPost("/api/players", token, mapOf(
            "name" to "Deleted", "characterClass" to "Rogue", "level" to 1, "maxHp" to 10
        ), Map::class.java)
        val playerId = (createResponse.body as Map<*, *>)["playerId"]

        authenticatedDelete("/api/players/$playerId", token, Void::class.java)

        authenticatedPost("/api/players", token, mapOf(
            "name" to "Active", "characterClass" to "Fighter", "level" to 5, "maxHp" to 45
        ), Map::class.java)

        val response = authenticatedGet("/api/players?includeDeleted=true", token, Map::class.java)

        val body = response.body as Map<*, *>
        val players = body["players"] as List<*>
        assertThat(players).hasSize(2)
    }

    // === Get Player ===

    @Test
    fun `should get player by id`() {
        val token = createAuthenticatedUser()

        val createResponse = authenticatedPost("/api/players", token, mapOf(
            "name" to "Thorin", "characterClass" to "Fighter", "level" to 5, "maxHp" to 45
        ), Map::class.java)
        val playerId = (createResponse.body as Map<*, *>)["playerId"]

        val response = authenticatedGet("/api/players/$playerId", token, Map::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
        val body = response.body as Map<*, *>
        assertThat(body["name"]).isEqualTo("Thorin")
    }

    @Test
    fun `should return 403 when getting another users player`() {
        val token1 = createAuthenticatedUser()
        val token2 = createAuthenticatedUser()

        val createResponse = authenticatedPost("/api/players", token1, mapOf(
            "name" to "Thorin", "characterClass" to "Fighter", "level" to 5, "maxHp" to 45
        ), Map::class.java)
        val playerId = (createResponse.body as Map<*, *>)["playerId"]

        val response = authenticatedGet("/api/players/$playerId", token2, Map::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.FORBIDDEN)
    }

    // === Update Player ===

    @Test
    fun `should update player attributes`() {
        val token = createAuthenticatedUser()

        val createResponse = authenticatedPost("/api/players", token, mapOf(
            "name" to "Thorin", "characterClass" to "Fighter", "level" to 5, "maxHp" to 45
        ), Map::class.java)
        val playerId = (createResponse.body as Map<*, *>)["playerId"]

        val updateRequest = mapOf(
            "name" to "Thorin II",
            "characterClass" to "Paladin",
            "level" to 6,
            "maxHp" to 50
        )

        val response = authenticatedPut("/api/players/$playerId", token, updateRequest, Map::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
        val body = response.body as Map<*, *>
        assertThat(body["name"]).isEqualTo("Thorin II")
        assertThat(body["characterClass"]).isEqualTo("Paladin")
        assertThat(body["level"]).isEqualTo(6)
        assertThat(body["maxHp"]).isEqualTo(50)
    }

    // === Delete Player ===

    @Test
    fun `should soft-delete player`() {
        val token = createAuthenticatedUser()

        val createResponse = authenticatedPost("/api/players", token, mapOf(
            "name" to "Thorin", "characterClass" to "Fighter", "level" to 5, "maxHp" to 45
        ), Map::class.java)
        val playerId = (createResponse.body as Map<*, *>)["playerId"]

        val response = authenticatedDelete("/api/players/$playerId", token, Void::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.NO_CONTENT)

        // Verify player is deleted
        val getResponse = authenticatedGet("/api/players?includeDeleted=true", token, Map::class.java)
        val body = getResponse.body as Map<*, *>
        val players = body["players"] as List<*>
        assertThat(players).hasSize(1)
        val player = players[0] as Map<*, *>
        assertThat(player["isDeleted"]).isEqualTo(true)
    }

    @Test
    fun `should return 404 when deleting non-existent player`() {
        val token = createAuthenticatedUser()
        val fakeId = java.util.UUID.randomUUID()

        val response = authenticatedDelete("/api/players/$fakeId", token, Map::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.NOT_FOUND)
    }
}
