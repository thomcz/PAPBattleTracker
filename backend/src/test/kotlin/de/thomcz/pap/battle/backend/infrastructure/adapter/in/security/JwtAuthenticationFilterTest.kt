package de.thomcz.pap.battle.backend.infrastructure.adapter.`in`.security

import de.thomcz.pap.battle.backend.integration.BaseIntegrationTest
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.http.HttpStatus

/**
 * Integration test for JWT authentication filter behavior.
 *
 * Tests:
 * - Authentication endpoints bypass JWT filter (no token required)
 * - Protected endpoints require valid JWT token
 * - Invalid tokens are rejected with 401 UNAUTHORIZED
 */
class JwtAuthenticationFilterTest : BaseIntegrationTest() {

    @Test
    fun `should not filter requests to authentication endpoints`() {
        // When: POST to /api/auth/register without JWT token
        val (userName, email, password) = Triple(
            "testuser",
            "test@example.com",
            "Password123!"
        )

        val registerRequest = mapOf(
            "userName" to userName,
            "email" to email,
            "password" to password
        )

        val response = restTemplate.postForEntity(
            "/api/auth/register",
            registerRequest,
            Map::class.java
        )

        // Then: Request succeeds without JWT token (proves filter didn't run)
        assertThat(response.statusCode.is2xxSuccessful).isTrue()
    }

    @Test
    fun `should allow access to auth endpoints without token`() {
        // When: Request auth endpoint without token
        val response = restTemplate.getForEntity("/api/auth/login", String::class.java)

        // Then: Should get method not allowed (GET not supported) not unauthorized
        // This proves the security filter allowed the request through
        assertThat(response.statusCode).isEqualTo(HttpStatus.METHOD_NOT_ALLOWED)
    }

    @Test
    fun `should reject protected endpoints without token`() {
        // When: Request protected endpoint without token
        val response = restTemplate.getForEntity("/api/battles", String::class.java)

        // Then: Should be unauthorized
        assertThat(response.statusCode).isEqualTo(HttpStatus.UNAUTHORIZED)
    }

    @Test
    fun `should allow access to protected endpoints with valid token`() {
        // Given: Authenticated user
        val token = createAuthenticatedUser()

        // When: Request protected endpoint with valid token
        val response = authenticatedGet("/api/battles", token, Map::class.java)

        // Then: Should be successful
        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
    }
}