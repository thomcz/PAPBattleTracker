package de.thomcz.pap.battle.backend.integration

import com.fasterxml.jackson.databind.ObjectMapper
import de.thomcz.pap.battle.backend.application.dto.AuthenticateUserCommand
import de.thomcz.pap.battle.backend.application.dto.RegisterUserCommand
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.web.client.TestRestTemplate
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpMethod
import org.springframework.http.ResponseEntity
import org.springframework.test.context.ActiveProfiles
import java.util.UUID

/**
 * Base class for integration tests with Spring Boot Test.
 *
 * Provides:
 * - Full Spring context with web environment
 * - H2 in-memory database (reset between tests)
 * - TestRestTemplate for HTTP requests
 * - Helper methods for authentication
 * - ObjectMapper for JSON operations
 *
 * Per research.md: Integration tests prioritized over mocks.
 * Tests use real H2 database to verify event sourcing behavior.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
@ActiveProfiles("test")
abstract class BaseIntegrationTest {

    @Autowired
    protected lateinit var restTemplate: TestRestTemplate

    @Autowired
    protected lateinit var objectMapper: ObjectMapper

    /**
     * Register a new user and return their credentials.
     * Useful for setting up test data with authenticated users.
     */
    protected fun registerUser(
        userName: String = "testuser_${UUID.randomUUID()}",
        email: String = "test_${UUID.randomUUID()}@example.com",
        password: String = "Password123!"
    ): Triple<String, String, String> {
        val command = RegisterUserCommand(
            userName = userName,
            email = email,
            password = password
        )

        val response = restTemplate.postForEntity(
            "/api/auth/register",
            command,
            String::class.java
        )

        require(response.statusCode.is2xxSuccessful) {
            "User registration failed: ${response.statusCode}"
        }

        return Triple(userName, email, password)
    }

    /**
     * Authenticate a user and return JWT token.
     * Call this after registerUser() to get an auth token for API requests.
     */
    protected fun authenticateUser(userName: String, password: String): String {
        val loginCommand = AuthenticateUserCommand(
            userName = userName,
            password = password
        )

        val response = restTemplate.postForEntity(
            "/api/auth/login",
            loginCommand,
            Map::class.java
        )

        require(response.statusCode.is2xxSuccessful) {
            "Authentication failed: ${response.statusCode}"
        }

        @Suppress("UNCHECKED_CAST")
        val body = response.body as? Map<String, Any>
        val token = body?.get("token") as? String

        requireNotNull(token) { "No token in response" }
        return token
    }

    /**
     * Register a user and immediately authenticate them.
     * Returns JWT token for use in authenticated requests.
     */
    protected fun createAuthenticatedUser(
        userName: String = "testuser_${UUID.randomUUID()}",
        email: String = "test_${UUID.randomUUID()}@example.com",
        password: String = "Password123!"
    ): String {
        val (user, _, pass) = registerUser(userName, email, password)
        return authenticateUser(user, pass)
    }

    /**
     * Create HTTP headers with Bearer authentication.
     */
    protected fun authHeaders(token: String): HttpHeaders {
        return HttpHeaders().apply {
            setBearerAuth(token)
            set("Content-Type", "application/json")
        }
    }

    /**
     * Make an authenticated GET request.
     */
    protected fun <T> authenticatedGet(
        url: String,
        token: String,
        responseType: Class<T>
    ): ResponseEntity<T> {
        return restTemplate.exchange(
            url,
            HttpMethod.GET,
            HttpEntity(null, authHeaders(token)),
            responseType
        )
    }

    /**
     * Make an authenticated POST request.
     */
    protected fun <T, R> authenticatedPost(
        url: String,
        token: String,
        request: T,
        responseType: Class<R>
    ): ResponseEntity<R> {
        return restTemplate.exchange(
            url,
            HttpMethod.POST,
            HttpEntity(request, authHeaders(token)),
            responseType
        )
    }

    /**
     * Make an authenticated PUT request.
     */
    protected fun <T, R> authenticatedPut(
        url: String,
        token: String,
        request: T,
        responseType: Class<R>
    ): ResponseEntity<R> {
        return restTemplate.exchange(
            url,
            HttpMethod.PUT,
            HttpEntity(request, authHeaders(token)),
            responseType
        )
    }

    /**
     * Make an authenticated DELETE request.
     */
    protected fun <T> authenticatedDelete(
        url: String,
        token: String,
        responseType: Class<T>
    ): ResponseEntity<T> {
        return restTemplate.exchange(
            url,
            HttpMethod.DELETE,
            HttpEntity(null, authHeaders(token)),
            responseType
        )
    }
}
