package de.thomcz.pap.battle.backend.application.service

import de.thomcz.pap.battle.backend.application.dto.RegisterUserCommand
import de.thomcz.pap.battle.backend.domain.model.AuthenticationResult
import de.thomcz.pap.battle.backend.domain.port.`in`.RegisterUseCase
import de.thomcz.pap.battle.backend.infrastructure.adapter.out.security.JwtTokenProvider
import jakarta.transaction.Transactional
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.Test
import org.mockito.ArgumentMatchers.anyString
import org.mockito.kotlin.whenever
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.test.context.bean.override.mockito.MockitoBean

@SpringBootTest
@Transactional
class RegisterUserUseCaseTest {
    @Autowired
    lateinit var registerUseCase: RegisterUseCase

    @MockitoBean
    lateinit var jwtTokenProvider: JwtTokenProvider

    @MockitoBean
    lateinit var passwordEncoder: PasswordEncoder

    @Test
    fun `register user successfully`() {
        whenever(jwtTokenProvider.generateToken(anyString())).thenReturn("test")
        whenever(passwordEncoder.encode(anyString())).thenReturn("hashedPassword")
        val command = RegisterUserCommand(userName = "userName", email = "email", password = "password")

        val actual = registerUseCase.execute(command)

        assertThat(actual).isEqualTo(
            AuthenticationResult(
                token = "test",
                user = actual.user
            )
        )

    }

    @Test
    fun `register user twice`() {
        whenever(jwtTokenProvider.generateToken(anyString())).thenReturn("test")
        whenever(passwordEncoder.encode(anyString())).thenReturn("hashedPassword")
        val command = RegisterUserCommand(userName = "userName", email = "email", password = "password")

        registerUseCase.execute(command)
        assertThatThrownBy { registerUseCase.execute(command) }.isInstanceOf(IllegalArgumentException::class.java)
            .hasMessage("Username taken")

    }
}