package de.thomcz.pap.battle.backend.application.service

import de.thomcz.pap.battle.backend.application.dto.RegisterUserCommand
import de.thomcz.pap.battle.backend.domain.model.AuthenticationResult
import de.thomcz.pap.battle.backend.domain.model.User
import de.thomcz.pap.battle.backend.domain.port.`in`.RegisterUseCase
import de.thomcz.pap.battle.backend.domain.port.out.TokenGenerator
import de.thomcz.pap.battle.backend.domain.port.out.UserRepository
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service

@Service
class RegisterUserService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val tokenGenerator: TokenGenerator
) : RegisterUseCase {
    override fun execute(command: RegisterUserCommand): AuthenticationResult {
        require(!userRepository.existsByUserName(command.userName)) { "Username taken" }

        val hashedPassword = passwordEncoder.encode(command.password)
        val user = User.register(command.userName, command.email, hashedPassword)

        val savedUser = userRepository.save(user)

        val token = tokenGenerator.generateToken(savedUser.userName)

        return AuthenticationResult(token, savedUser)
    }
}