package de.thomcz.pap.battle.backend.domain.model

import org.springframework.security.crypto.password.PasswordEncoder

data class User(
    val id: Long,
    val userName: String,
    val email: String,
    val passwordHash: String
) {
    fun authenticate(rawPassword: String, passwordEncoder: PasswordEncoder): Boolean =
        passwordEncoder.matches(rawPassword, passwordHash)
}