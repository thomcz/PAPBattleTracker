package de.thomcz.pap.battle.backend.integration

import de.thomcz.pap.battle.backend.domain.port.out.EventStore
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus

/**
 * Integration test for POST /api/battles (create battle).
 *
 * Tests:
 * - Battle creation with authenticated user
 * - BattleCreated event is persisted
 * - Battle metadata is stored
 * - Response contains correct battle data
 *
 * TDD: This test will FAIL initially until we implement:
 * - BattleCreated event
 * - Battle.create() factory method
 * - CreateBattleUseCase
 * - BattleController POST endpoint
 */
class BattleCreationIntegrationTest : BaseIntegrationTest() {

    @Autowired
    private lateinit var eventStore: EventStore

    @Test
    fun `should create battle and persist BattleCreated event`() {
        // Given: Authenticated user
        val token = createAuthenticatedUser()

        // When: POST /api/battles
        val request = mapOf("name" to "Dragon's Lair Encounter")
        val response = authenticatedPost(
            "/api/battles",
            token,
            request,
            Map::class.java
        )

        // Then: Battle created successfully
        assertThat(response.statusCode).isEqualTo(HttpStatus.CREATED)

        val body = response.body as Map<*, *>
        assertThat(body["id"]).isNotNull()
        assertThat(body["name"]).isEqualTo("Dragon's Lair Encounter")
        assertThat(body["status"]).isEqualTo("NOT_STARTED")
        assertThat(body["createdAt"]).isNotNull()
        assertThat(body["lastModified"]).isNotNull()

        // And: BattleCreated event is persisted
        val battleId = java.util.UUID.fromString(body["id"] as String)
        val events = eventStore.getEvents(battleId)

        assertThat(events).hasSize(1)
        assertThat(events[0]::class.simpleName).isEqualTo("BattleCreated")
        assertThat(events[0].battleId).isEqualTo(battleId)
    }

    @Test
    fun `should reject battle creation without authentication`() {
        // When: POST /api/battles without token
        val request = mapOf("name" to "Test Battle")
        val response = restTemplate.postForEntity(
            "/api/battles",
            request,
            Map::class.java
        )

        // Then: Unauthorized
        assertThat(response.statusCode).isEqualTo(HttpStatus.UNAUTHORIZED)
    }

    @Test
    fun `should reject battle creation with empty name`() {
        // Given: Authenticated user
        val token = createAuthenticatedUser()

        // When: POST /api/battles with empty name
        val request = mapOf("name" to "")
        val response = authenticatedPost(
            "/api/battles",
            token,
            request,
            Map::class.java
        )

        // Then: Bad request
        assertThat(response.statusCode).isEqualTo(HttpStatus.BAD_REQUEST)
    }

    @Test
    fun `should create multiple battles for same user`() {
        // Given: Authenticated user
        val token = createAuthenticatedUser()

        // When: Create two battles
        val request1 = mapOf("name" to "Battle 1")
        val request2 = mapOf("name" to "Battle 2")

        val response1 = authenticatedPost("/api/battles", token, request1, Map::class.java)
        val response2 = authenticatedPost("/api/battles", token, request2, Map::class.java)

        // Then: Both created successfully
        assertThat(response1.statusCode).isEqualTo(HttpStatus.CREATED)
        assertThat(response2.statusCode).isEqualTo(HttpStatus.CREATED)

        val battleId1 = (response1.body as Map<*, *>)["id"]
        val battleId2 = (response2.body as Map<*, *>)["id"]

        assertThat(battleId1).isNotEqualTo(battleId2)
    }
}
