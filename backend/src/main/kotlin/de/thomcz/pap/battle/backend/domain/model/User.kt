package de.thomcz.pap.battle.backend.domain.model

import org.springframework.security.crypto.password.PasswordEncoder

data class User(
    val id: Long,
    val userName: String,
    val email: String,
    val passwordHash: String
) {
    fun authenticate(rawPassword: String, passwordEncoder: PasswordEncoder) =
        require(passwordEncoder.matches(rawPassword, passwordHash)) { "Invalid password" }

    companion object {
        fun register(userName: String, email: String, hashedPassword: String): User {
            return User(
                id = 0L,
                userName = userName,
                email = email,
                passwordHash = hashedPassword
            )
        }
    }
}