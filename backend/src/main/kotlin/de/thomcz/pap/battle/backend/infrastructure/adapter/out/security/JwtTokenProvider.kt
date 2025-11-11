package de.thomcz.pap.battle.backend.infrastructure.adapter.out.security

import de.thomcz.pap.battle.backend.domain.port.out.TokenGenerator
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.util.*
import javax.crypto.SecretKey

@Component
class JwtTokenProvider : TokenGenerator {
    @Value("\${jwt.secret:mySecretKeyThatShouldBeAtLeast256BitsLongForHS256Algorithm}")
    private lateinit var jwtSecret: String

    @Value("\${jwt.expiration:86400000}") // 24 hours in milliseconds
    private var jwtExpirationMs: Long = 86400000

    private fun getSigningKey(): SecretKey {
        return Keys.hmacShaKeyFor(jwtSecret.toByteArray())
    }

    override fun generateToken(username: String): String {
        val now = Date()
        val expiryDate = Date(now.time + jwtExpirationMs)
        return Jwts.builder()
            .subject(username)
            .issuedAt(now)
            .expiration(expiryDate)
            .signWith(getSigningKey())
            .compact()
    }

    override fun getUsernameFromToken(token: String): String {
        return Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token).payload.subject
    }

    override fun validateToken(token: String): Boolean {
        return try {
            Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token)
            true
        } catch (ex: Exception) {
            false
        }
    }

}