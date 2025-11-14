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
        // 1. Validate uniqueness
        if (userRepository.existsByUserName(command.userName)) {
            throw IllegalArgumentException("Username taken")
        }

        // 2. Create domain entity
        val hashedPassword = passwordEncoder.encode(command.password)
        val user = User.register(command.userName, command.email, hashedPassword)

        // 3. Save via port
        val savedUser = userRepository.save(user)

        // 4. Generate token
        val token = tokenGenerator.generateToken(savedUser.userName)

        return AuthenticationResult(token, savedUser)
    }
}