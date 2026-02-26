package de.thomcz.pap.battle.backend.integration

import de.thomcz.pap.battle.backend.domain.port.out.SessionEventStore
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus

class SessionIntegrationTest : BaseIntegrationTest() {

    @Autowired
    private lateinit var sessionEventStore: SessionEventStore

    // === POST /api/sessions ===

    @Test
    fun `should create session and persist SessionCreated event`() {
        val token = createAuthenticatedUser()

        val request = mapOf("name" to "Friday Night Game")
        val response = authenticatedPost("/api/sessions", token, request, Map::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.CREATED)

        val body = response.body as Map<*, *>
        assertThat(body["sessionId"]).isNotNull()
        assertThat(body["name"]).isEqualTo("Friday Night Game")
        assertThat(body["status"]).isEqualTo("PLANNED")
        assertThat(body["createdAt"]).isNotNull()
        assertThat(body["lastModified"]).isNotNull()

        val sessionId = java.util.UUID.fromString(body["sessionId"] as String)
        val events = sessionEventStore.getEvents(sessionId)
        assertThat(events).hasSize(1)
        assertThat(events[0]::class.simpleName).isEqualTo("SessionCreated")
    }

    @Test
    fun `should reject session creation without authentication`() {
        val request = mapOf("name" to "Test Session")
        val response = restTemplate.postForEntity("/api/sessions", request, Map::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.UNAUTHORIZED)
    }

    @Test
    fun `should reject session creation with empty name`() {
        val token = createAuthenticatedUser()

        val request = mapOf("name" to "")
        val response = authenticatedPost("/api/sessions", token, request, Map::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.BAD_REQUEST)
    }

    // === GET /api/sessions ===

    @Test
    fun `should list sessions for authenticated user`() {
        val token = createAuthenticatedUser()

        authenticatedPost("/api/sessions", token, mapOf("name" to "Session 1"), Map::class.java)
        authenticatedPost("/api/sessions", token, mapOf("name" to "Session 2"), Map::class.java)

        val response = authenticatedGet("/api/sessions", token, List::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
        assertThat(response.body).hasSize(2)
    }

    @Test
    fun `should return empty list when user has no sessions`() {
        val token = createAuthenticatedUser()

        val response = authenticatedGet("/api/sessions", token, List::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
        assertThat(response.body).isEmpty()
    }

    @Test
    fun `should filter sessions by status`() {
        val token = createAuthenticatedUser()

        authenticatedPost("/api/sessions", token, mapOf("name" to "Planned Session"), Map::class.java)
        authenticatedPost("/api/sessions", token, mapOf("name" to "Another Planned"), Map::class.java)

        val response = authenticatedGet("/api/sessions?status=PLANNED", token, List::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
        assertThat(response.body).hasSize(2)
    }

    @Test
    fun `should not return sessions from other users`() {
        val token1 = createAuthenticatedUser()
        val token2 = createAuthenticatedUser()

        authenticatedPost("/api/sessions", token1, mapOf("name" to "User1 Session"), Map::class.java)

        val response = authenticatedGet("/api/sessions", token2, List::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
        assertThat(response.body).isEmpty()
    }

    // === GET /api/sessions/{id} ===

    @Test
    fun `should get session detail with battles`() {
        val token = createAuthenticatedUser()

        val sessionResponse = authenticatedPost("/api/sessions", token, mapOf("name" to "My Session"), Map::class.java)
        val sessionId = (sessionResponse.body as Map<*, *>)["sessionId"] as String

        authenticatedPost("/api/sessions/$sessionId/battles", token, mapOf("name" to "Battle 1"), Map::class.java)
        authenticatedPost("/api/sessions/$sessionId/battles", token, mapOf("name" to "Battle 2"), Map::class.java)

        val response = authenticatedGet("/api/sessions/$sessionId", token, Map::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
        val body = response.body as Map<*, *>
        assertThat(body["sessionId"]).isEqualTo(sessionId)
        assertThat(body["name"]).isEqualTo("My Session")
        assertThat(body["status"]).isEqualTo("PLANNED")
        assertThat(body["battles"] as List<*>).hasSize(2)
    }

    @Test
    fun `should return 404 for non-existent session`() {
        val token = createAuthenticatedUser()

        val response = authenticatedGet("/api/sessions/${java.util.UUID.randomUUID()}", token, Map::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.NOT_FOUND)
    }

    // === POST /api/sessions/{id}/battles ===

    @Test
    fun `should create battle in session`() {
        val token = createAuthenticatedUser()

        val sessionResponse = authenticatedPost("/api/sessions", token, mapOf("name" to "Game Session"), Map::class.java)
        val sessionId = (sessionResponse.body as Map<*, *>)["sessionId"] as String

        val response = authenticatedPost("/api/sessions/$sessionId/battles", token, mapOf("name" to "Dragon Fight"), Map::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.CREATED)
        val body = response.body as Map<*, *>
        assertThat(body["id"]).isNotNull()
        assertThat(body["name"]).isEqualTo("Dragon Fight")
        assertThat(body["status"]).isEqualTo("NOT_STARTED")
    }

    @Test
    fun `should reject battle creation with empty name`() {
        val token = createAuthenticatedUser()

        val sessionResponse = authenticatedPost("/api/sessions", token, mapOf("name" to "Game Session"), Map::class.java)
        val sessionId = (sessionResponse.body as Map<*, *>)["sessionId"] as String

        val response = authenticatedPost("/api/sessions/$sessionId/battles", token, mapOf("name" to ""), Map::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.BAD_REQUEST)
    }

    @Test
    fun `should include battle count in session list`() {
        val token = createAuthenticatedUser()

        val sessionResponse = authenticatedPost("/api/sessions", token, mapOf("name" to "Session With Battles"), Map::class.java)
        val sessionId = (sessionResponse.body as Map<*, *>)["sessionId"] as String

        authenticatedPost("/api/sessions/$sessionId/battles", token, mapOf("name" to "Battle 1"), Map::class.java)
        authenticatedPost("/api/sessions/$sessionId/battles", token, mapOf("name" to "Battle 2"), Map::class.java)

        val listResponse = authenticatedGet("/api/sessions", token, List::class.java)

        assertThat(listResponse.statusCode).isEqualTo(HttpStatus.OK)
        val sessions = listResponse.body as List<*>
        assertThat(sessions).hasSize(1)
        val session = sessions[0] as Map<*, *>
        assertThat(session["battleCount"]).isEqualTo(2)
    }

    // === POST /api/sessions/{id}/start ===

    @Test
    fun `should start planned session`() {
        val token = createAuthenticatedUser()

        val sessionResponse = authenticatedPost("/api/sessions", token, mapOf("name" to "My Session"), Map::class.java)
        val sessionId = (sessionResponse.body as Map<*, *>)["sessionId"] as String

        val response = authenticatedPost("/api/sessions/$sessionId/start", token, emptyMap<String, Any>(), Map::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
        val body = response.body as Map<*, *>
        assertThat(body["status"]).isEqualTo("STARTED")
    }

    @Test
    fun `should return 409 when starting already started session`() {
        val token = createAuthenticatedUser()

        val sessionResponse = authenticatedPost("/api/sessions", token, mapOf("name" to "My Session"), Map::class.java)
        val sessionId = (sessionResponse.body as Map<*, *>)["sessionId"] as String

        authenticatedPost("/api/sessions/$sessionId/start", token, emptyMap<String, Any>(), Map::class.java)
        val response = authenticatedPost("/api/sessions/$sessionId/start", token, emptyMap<String, Any>(), Map::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.CONFLICT)
    }

    @Test
    fun `should return 404 when starting non-existent session`() {
        val token = createAuthenticatedUser()

        val response = authenticatedPost("/api/sessions/${java.util.UUID.randomUUID()}/start", token, emptyMap<String, Any>(), Map::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.NOT_FOUND)
    }

    // === POST /api/sessions/{id}/finish ===

    @Test
    fun `should finish started session`() {
        val token = createAuthenticatedUser()

        val sessionResponse = authenticatedPost("/api/sessions", token, mapOf("name" to "My Session"), Map::class.java)
        val sessionId = (sessionResponse.body as Map<*, *>)["sessionId"] as String

        authenticatedPost("/api/sessions/$sessionId/start", token, emptyMap<String, Any>(), Map::class.java)
        val response = authenticatedPost("/api/sessions/$sessionId/finish", token, emptyMap<String, Any>(), Map::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
        val body = response.body as Map<*, *>
        assertThat(body["status"]).isEqualTo("FINISHED")
    }

    @Test
    fun `should return 409 when finishing planned session`() {
        val token = createAuthenticatedUser()

        val sessionResponse = authenticatedPost("/api/sessions", token, mapOf("name" to "My Session"), Map::class.java)
        val sessionId = (sessionResponse.body as Map<*, *>)["sessionId"] as String

        val response = authenticatedPost("/api/sessions/$sessionId/finish", token, emptyMap<String, Any>(), Map::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.CONFLICT)
    }

    @Test
    fun `should return 404 when finishing non-existent session`() {
        val token = createAuthenticatedUser()

        val response = authenticatedPost("/api/sessions/${java.util.UUID.randomUUID()}/finish", token, emptyMap<String, Any>(), Map::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.NOT_FOUND)
    }

    // === PUT /api/sessions/{id} ===

    @Test
    fun `should rename session`() {
        val token = createAuthenticatedUser()

        val sessionResponse = authenticatedPost("/api/sessions", token, mapOf("name" to "Old Name"), Map::class.java)
        val sessionId = (sessionResponse.body as Map<*, *>)["sessionId"] as String

        val response = authenticatedPut("/api/sessions/$sessionId", token, mapOf("name" to "New Name"), Map::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
        val body = response.body as Map<*, *>
        assertThat(body["name"]).isEqualTo("New Name")
    }

    @Test
    fun `should return 404 when renaming non-existent session`() {
        val token = createAuthenticatedUser()

        val response = authenticatedPut("/api/sessions/${java.util.UUID.randomUUID()}", token, mapOf("name" to "New Name"), Map::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.NOT_FOUND)
    }

    // === DELETE /api/sessions/{id} ===

    @Test
    fun `should delete session and its battles`() {
        val token = createAuthenticatedUser()

        val sessionResponse = authenticatedPost("/api/sessions", token, mapOf("name" to "My Session"), Map::class.java)
        val sessionId = (sessionResponse.body as Map<*, *>)["sessionId"] as String

        authenticatedPost("/api/sessions/$sessionId/battles", token, mapOf("name" to "Battle 1"), Map::class.java)

        val deleteResponse = authenticatedDelete("/api/sessions/$sessionId", token, Void::class.java)
        assertThat(deleteResponse.statusCode).isEqualTo(HttpStatus.NO_CONTENT)

        val listResponse = authenticatedGet("/api/sessions", token, List::class.java)
        assertThat(listResponse.body).isEmpty()
    }

    @Test
    fun `should return 404 when deleting non-existent session`() {
        val token = createAuthenticatedUser()

        val response = authenticatedDelete("/api/sessions/${java.util.UUID.randomUUID()}", token, Map::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.NOT_FOUND)
    }
}
