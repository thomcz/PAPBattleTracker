package de.thomcz.pap.battle.backend.infrastructure.adapter.`in`.security

import de.thomcz.pap.battle.backend.domain.port.out.LoadUser
import de.thomcz.pap.battle.backend.infrastructure.adapter.out.security.JwtTokenProvider
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

@Component
class JwtAuthenticationFilter(
    private val jwtTokenProvider: JwtTokenProvider,
    private val loadUser: LoadUser
) : OncePerRequestFilter() {
    private fun extractJwtFromRequest(request: HttpServletRequest): String? {
        val bearerToken = request.getHeader("Authorization")
        return if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            bearerToken.substring(7)
        } else null
    }

    override fun shouldNotFilter(request: HttpServletRequest): Boolean {
        val path = request.requestURI
        return path.startsWith("/api/auth/")
    }


    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        try {
            val jwt = extractJwtFromRequest(request)
            if (jwt != null && jwtTokenProvider.validateToken(jwt)) {
                val userName = jwtTokenProvider.getUsernameFromToken(jwt)
                val user = loadUser.loadUserByUserName(userName)

                val authentication = UsernamePasswordAuthenticationToken(user, null, emptyList())
                authentication.details = WebAuthenticationDetailsSource().buildDetails(request)

                SecurityContextHolder.getContext().authentication = authentication
            }
        } catch (e: Exception) {
            logger.error("Could not set user authentication in security context", e)
        }
        filterChain.doFilter(request, response)
    }
}