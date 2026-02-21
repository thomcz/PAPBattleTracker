package de.thomcz.pap.battle.backend.integration

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.http.HttpStatus

class BeasteryCreatureIntegrationTest : BaseIntegrationTest() {

    private val baseUrl = "/api/beastery/creatures"

    // === Create Creature ===

    @Test
    fun `should create creature with valid attributes`() {
        val token = createAuthenticatedUser()

        val request = mapOf(
            "name" to "Goblin",
            "hitPoints" to 7,
            "armorClass" to 15
        )

        val response = authenticatedPost(baseUrl, token, request, Map::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.CREATED)
        val body = response.body as Map<*, *>
        assertThat(body["creatureId"]).isNotNull()
        assertThat(body["name"]).isEqualTo("Goblin")
        assertThat(body["hitPoints"]).isEqualTo(7)
        assertThat(body["armorClass"]).isEqualTo(15)
        assertThat(body["isDeleted"]).isEqualTo(false)
    }

    @Test
    fun `should reject creature creation without authentication`() {
        val request = mapOf(
            "name" to "Goblin",
            "hitPoints" to 7,
            "armorClass" to 15
        )

        val response = restTemplate.postForEntity(baseUrl, request, Map::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.UNAUTHORIZED)
    }

    @Test
    fun `should reject creature creation with invalid data`() {
        val token = createAuthenticatedUser()

        val request = mapOf(
            "name" to "",
            "hitPoints" to 7,
            "armorClass" to 15
        )

        val response = authenticatedPost(baseUrl, token, request, Map::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.BAD_REQUEST)
    }

    // === List Creatures ===

    @Test
    fun `should list creatures for authenticated user`() {
        val token = createAuthenticatedUser()

        authenticatedPost(baseUrl, token, mapOf(
            "name" to "Goblin", "hitPoints" to 7, "armorClass" to 15
        ), Map::class.java)
        authenticatedPost(baseUrl, token, mapOf(
            "name" to "Orc", "hitPoints" to 15, "armorClass" to 13
        ), Map::class.java)

        val response = authenticatedGet(baseUrl, token, Map::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
        val body = response.body as Map<*, *>
        val creatures = body["creatures"] as List<*>
        assertThat(creatures).hasSize(2)
        assertThat(body["total"]).isEqualTo(2)
    }

    @Test
    fun `should not list other users creatures`() {
        val token1 = createAuthenticatedUser()
        val token2 = createAuthenticatedUser()

        authenticatedPost(baseUrl, token1, mapOf(
            "name" to "Goblin", "hitPoints" to 7, "armorClass" to 15
        ), Map::class.java)

        val response = authenticatedGet(baseUrl, token2, Map::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
        val body = response.body as Map<*, *>
        val creatures = body["creatures"] as List<*>
        assertThat(creatures).hasSize(0)
    }

    @Test
    fun `should exclude deleted creatures by default`() {
        val token = createAuthenticatedUser()

        val createResponse = authenticatedPost(baseUrl, token, mapOf(
            "name" to "Deleted", "hitPoints" to 1, "armorClass" to 10
        ), Map::class.java)
        val creatureId = (createResponse.body as Map<*, *>)["creatureId"]

        authenticatedDelete("$baseUrl/$creatureId", token, Void::class.java)

        authenticatedPost(baseUrl, token, mapOf(
            "name" to "Active", "hitPoints" to 7, "armorClass" to 15
        ), Map::class.java)

        val response = authenticatedGet(baseUrl, token, Map::class.java)

        val body = response.body as Map<*, *>
        val creatures = body["creatures"] as List<*>
        assertThat(creatures).hasSize(1)
    }

    @Test
    fun `should include deleted creatures when requested`() {
        val token = createAuthenticatedUser()

        val createResponse = authenticatedPost(baseUrl, token, mapOf(
            "name" to "Deleted", "hitPoints" to 1, "armorClass" to 10
        ), Map::class.java)
        val creatureId = (createResponse.body as Map<*, *>)["creatureId"]

        authenticatedDelete("$baseUrl/$creatureId", token, Void::class.java)

        authenticatedPost(baseUrl, token, mapOf(
            "name" to "Active", "hitPoints" to 7, "armorClass" to 15
        ), Map::class.java)

        val response = authenticatedGet("$baseUrl?includeDeleted=true", token, Map::class.java)

        val body = response.body as Map<*, *>
        val creatures = body["creatures"] as List<*>
        assertThat(creatures).hasSize(2)
    }

    // === Get Creature ===

    @Test
    fun `should get creature by id`() {
        val token = createAuthenticatedUser()

        val createResponse = authenticatedPost(baseUrl, token, mapOf(
            "name" to "Goblin", "hitPoints" to 7, "armorClass" to 15
        ), Map::class.java)
        val creatureId = (createResponse.body as Map<*, *>)["creatureId"]

        val response = authenticatedGet("$baseUrl/$creatureId", token, Map::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
        val body = response.body as Map<*, *>
        assertThat(body["name"]).isEqualTo("Goblin")
    }

    @Test
    fun `should return 403 when getting another users creature`() {
        val token1 = createAuthenticatedUser()
        val token2 = createAuthenticatedUser()

        val createResponse = authenticatedPost(baseUrl, token1, mapOf(
            "name" to "Goblin", "hitPoints" to 7, "armorClass" to 15
        ), Map::class.java)
        val creatureId = (createResponse.body as Map<*, *>)["creatureId"]

        val response = authenticatedGet("$baseUrl/$creatureId", token2, Map::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.FORBIDDEN)
    }

    // === Update Creature ===

    @Test
    fun `should update creature attributes`() {
        val token = createAuthenticatedUser()

        val createResponse = authenticatedPost(baseUrl, token, mapOf(
            "name" to "Goblin", "hitPoints" to 7, "armorClass" to 15
        ), Map::class.java)
        val creatureId = (createResponse.body as Map<*, *>)["creatureId"]

        val updateRequest = mapOf(
            "name" to "Hobgoblin",
            "hitPoints" to 11,
            "armorClass" to 18
        )

        val response = authenticatedPut("$baseUrl/$creatureId", token, updateRequest, Map::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
        val body = response.body as Map<*, *>
        assertThat(body["name"]).isEqualTo("Hobgoblin")
        assertThat(body["hitPoints"]).isEqualTo(11)
        assertThat(body["armorClass"]).isEqualTo(18)
    }

    // === Delete Creature ===

    @Test
    fun `should delete creature`() {
        val token = createAuthenticatedUser()

        val createResponse = authenticatedPost(baseUrl, token, mapOf(
            "name" to "Goblin", "hitPoints" to 7, "armorClass" to 15
        ), Map::class.java)
        val creatureId = (createResponse.body as Map<*, *>)["creatureId"]

        val response = authenticatedDelete("$baseUrl/$creatureId", token, Void::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.NO_CONTENT)

        val getResponse = authenticatedGet("$baseUrl?includeDeleted=true", token, Map::class.java)
        val body = getResponse.body as Map<*, *>
        val creatures = body["creatures"] as List<*>
        assertThat(creatures).hasSize(1)
        val creature = creatures[0] as Map<*, *>
        assertThat(creature["isDeleted"]).isEqualTo(true)
    }

    @Test
    fun `should return 404 when deleting non-existent creature`() {
        val token = createAuthenticatedUser()
        val fakeId = java.util.UUID.randomUUID()

        val response = authenticatedDelete("$baseUrl/$fakeId", token, Map::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.NOT_FOUND)
    }

    // === Duplicate Creature ===

    @Test
    fun `should duplicate creature with default name`() {
        val token = createAuthenticatedUser()

        val createResponse = authenticatedPost(baseUrl, token, mapOf(
            "name" to "Goblin", "hitPoints" to 7, "armorClass" to 15
        ), Map::class.java)
        val creatureId = (createResponse.body as Map<*, *>)["creatureId"]

        val response = authenticatedPost("$baseUrl/$creatureId/duplicate", token, emptyMap<String, Any>(), Map::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.CREATED)
        val body = response.body as Map<*, *>
        assertThat(body["name"]).isEqualTo("Goblin Copy")
        assertThat(body["hitPoints"]).isEqualTo(7)
        assertThat(body["armorClass"]).isEqualTo(15)
        assertThat(body["creatureId"]).isNotEqualTo(creatureId)
    }

    @Test
    fun `should duplicate creature with custom name`() {
        val token = createAuthenticatedUser()

        val createResponse = authenticatedPost(baseUrl, token, mapOf(
            "name" to "Goblin", "hitPoints" to 7, "armorClass" to 15
        ), Map::class.java)
        val creatureId = (createResponse.body as Map<*, *>)["creatureId"]

        val response = authenticatedPost(
            "$baseUrl/$creatureId/duplicate", token,
            mapOf("name" to "Elite Goblin"), Map::class.java
        )

        assertThat(response.statusCode).isEqualTo(HttpStatus.CREATED)
        val body = response.body as Map<*, *>
        assertThat(body["name"]).isEqualTo("Elite Goblin")
    }

    // === Event Sourcing Verification ===

    @Test
    fun `should persist and retrieve creature state through event sourcing`() {
        val token = createAuthenticatedUser()

        // Create
        val createResponse = authenticatedPost(baseUrl, token, mapOf(
            "name" to "Goblin", "hitPoints" to 7, "armorClass" to 15
        ), Map::class.java)
        val creatureId = (createResponse.body as Map<*, *>)["creatureId"]

        // Update
        authenticatedPut("$baseUrl/$creatureId", token, mapOf(
            "name" to "Hobgoblin", "hitPoints" to 11, "armorClass" to 18
        ), Map::class.java)

        // Retrieve and verify final state
        val getResponse = authenticatedGet("$baseUrl/$creatureId", token, Map::class.java)

        assertThat(getResponse.statusCode).isEqualTo(HttpStatus.OK)
        val body = getResponse.body as Map<*, *>
        assertThat(body["name"]).isEqualTo("Hobgoblin")
        assertThat(body["hitPoints"]).isEqualTo(11)
        assertThat(body["armorClass"]).isEqualTo(18)
    }
}
