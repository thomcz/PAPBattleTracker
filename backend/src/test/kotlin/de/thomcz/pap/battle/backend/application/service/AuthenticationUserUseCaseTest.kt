package de.thomcz.pap.battle.backend.application.service

import de.thomcz.pap.battle.backend.application.dto.AuthenticateUserCommand
import de.thomcz.pap.battle.backend.application.dto.RegisterUserCommand
import de.thomcz.pap.battle.backend.domain.port.`in`.AuthenticationUseCase
import de.thomcz.pap.battle.backend.domain.port.`in`.RegisterUseCase
import jakarta.transaction.Transactional
import org.assertj.core.api.Assertions
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest

@SpringBootTest
@Transactional
class AuthenticationUserUseCaseTest {
    @Autowired
    lateinit var authenticationUserService: AuthenticationUseCase

    @Autowired
    lateinit var registerUseCase: RegisterUseCase

    @Test
    fun `cannot find user`() {
        val command = AuthenticateUserCommand(userName = "nonExistingUser", password = "password")
        Assertions.assertThatThrownBy { authenticationUserService.execute(command) }
            .isInstanceOf(IllegalArgumentException::class.java)
            .hasMessage("User not found")
    }

    @Test
    fun `authenticate user successfully`() {
        val registerCommand = RegisterUserCommand(
            userName = "userName",
            email = "email",
            password = "password"
        )

        registerUseCase.execute(registerCommand)

        val authenticateCommand = AuthenticateUserCommand(userName = "userName", password = "password")
        val actual = authenticationUserService.execute(authenticateCommand)

        assertThat(actual.user.userName).isEqualTo("userName")
    }
}