package de.thomcz.pap.battle.backend.domain.port.out

interface TokenGenerator {
    fun generateToken(username: String): String
    fun getUsernameFromToken(token: String): String?
    fun validateToken(token: String): Boolean
}