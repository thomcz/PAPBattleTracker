package de.thomcz.pap.battle.backend.domain.model

import org.assertj.core.api.Assertions.*
import org.junit.jupiter.api.Test
import org.mockito.Mockito.mock
import org.mockito.kotlin.whenever
import org.springframework.security.crypto.password.PasswordEncoder

class UserTest {

    @Test
    fun `authenticate user with correct password`() {
        val passwordEncoder = mock(PasswordEncoder::class.java)

        val rawPassword = "securePassword"
        val hashedPassword = "hashedSecurePassword"
        whenever(passwordEncoder.matches(rawPassword, hashedPassword)).thenReturn(true)

        val user = User(id = 1L, userName = "testUser", email = "email", passwordHash = hashedPassword)

        assertThatCode { user.authenticate(rawPassword, passwordEncoder) }
            .doesNotThrowAnyException()
    }

    @Test
    fun `do not authenticate user with incorrect password`() {
        val passwordEncoder = mock(PasswordEncoder::class.java)

        val rawPassword = "wrongPassword"
        val hashedPassword = "hashedSecurePassword"
        whenever(passwordEncoder.matches(rawPassword, hashedPassword)).thenReturn(false)

        val user = User(id = 1L, userName = "testUser", email = "email", passwordHash = hashedPassword)

        assertThatThrownBy { user.authenticate(rawPassword, passwordEncoder) }
            .isInstanceOf(IllegalArgumentException::class.java)
            .hasMessage("Invalid password")
    }

    @Test
    fun `register user creates user with correct details`() {
        val userName = "newUser"
        val email = "email"
        val hashedPassword = "hashedPassword"

        val user = User.register(userName, email, hashedPassword)

        assertThat(user.id).isEqualTo(0L)
        assertThat(user.userName).isEqualTo(userName)
        assertThat(user.email).isEqualTo(email)
        assertThat(user.passwordHash).isEqualTo(hashedPassword)
    }
}