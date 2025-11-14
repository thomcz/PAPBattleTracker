package de.thomcz.pap.battle.backend.application.service

import de.thomcz.pap.battle.backend.application.dto.AuthenticateUserCommand
import de.thomcz.pap.battle.backend.domain.model.AuthenticationResult
import de.thomcz.pap.battle.backend.domain.port.`in`.AuthenticationUseCase
import de.thomcz.pap.battle.backend.domain.port.out.TokenGenerator
import de.thomcz.pap.battle.backend.domain.port.out.UserRepository
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service

@Service
class AuthenticationUserService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val tokenGenerator: TokenGenerator
) : AuthenticationUseCase {
    override fun execute(command: AuthenticateUserCommand): AuthenticationResult {
        val user = userRepository.findByUserName(command.userName) ?: throw IllegalArgumentException("User not found")

        user.authenticate(command.password, passwordEncoder)

        val token = tokenGenerator.generateToken(user.userName)

        return AuthenticationResult(token, user)
    }
}